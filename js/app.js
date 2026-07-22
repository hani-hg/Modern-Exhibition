// js/app.js

// ===== المتغيرات العالمية =====
let currentProducts = [];
let editingProductId = null;

// ===== عرض المنتجات =====
async function showProducts() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="container" style="text-align:center;padding:40px 0;">
            <div class="loading-spinner"></div>
            <p style="margin-top:20px;color:#888;">⏳ جاري تحميل المنتجات...</p>
        </div>
    `;
    
    try {
        const snapshot = await getDocs(collection(db, 'products'));
        currentProducts = [];
        snapshot.forEach(doc => {
            currentProducts.push({ id: doc.id, ...doc.data() });
        });
        
        renderProducts(currentProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('❌ خطأ في تحميل المنتجات', 'error');
        content.innerHTML = `
            <div class="container">
                <div class="empty-state">
                    <h2>❌ خطأ في التحميل</h2>
                    <p>حدث خطأ أثناء تحميل المنتجات. حاول مرة أخرى.</p>
                    <button class="btn btn-gold" onclick="showProducts()">🔄 إعادة المحاولة</button>
                </div>
            </div>
        `;
    }
}

// ===== عرض المنتجات =====
function renderProducts(products) {
    const content = document.getElementById('content');
    
    if (products.length === 0) {
        content.innerHTML = `
            <div class="container">
                <div class="empty-state">
                    <h2>📦 لا توجد منتجات</h2>
                    <p>أضف منتجك الأول الآن!</p>
                    <button class="btn btn-gold" onclick="showAddProduct()">➕ إضافة منتج</button>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="container">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;margin:20px 0;">
                <h2 style="color:var(--brown);">📦 المنتجات (${products.length})</h2>
                <button class="btn btn-gold" onclick="showAddProduct()">➕ إضافة منتج</button>
            </div>
            <div class="products-grid">
    `;
    
    products.forEach((product, index) => {
        const delay = index * 100;
        html += `
            <div class="product-card" onclick="showProductDetail('${product.id}')" style="animation-delay:${delay}ms;">
                ${product.isNew ? `<span class="product-badge new">جديد</span>` : ''}
                ${product.featured ? `<span class="product-badge featured">مميز</span>` : ''}
                <div class="product-image-wrapper">
                    ${product.images && product.images[0] ? 
                        `<img src="${product.images[0]}" alt="${product.title}" class="product-image">` :
                        `<div class="product-image" style="display:flex;align-items:center;justify-content:center;background:#e5e7eb;color:#999;font-size:48px;">🖼️</div>`
                    }
                    <div class="product-image-overlay"></div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    ${product.brand ? `<p class="product-brand">🏷️ ${product.brand}</p>` : ''}
                    <p class="product-price">$${product.price} <span>${product.currency || 'USD'}</span></p>
                    <div class="product-tags">
                        ${product.category ? `<span class="tag">📂 ${product.category}</span>` : ''}
                        ${product.room ? `<span class="tag">🏠 ${product.room}</span>` : ''}
                        ${product.color ? `<span class="tag">🎨 ${product.color}</span>` : ''}
                        ${product.material ? `<span class="tag">🔧 ${product.material}</span>` : ''}
                    </div>
                    <button class="btn-quote" onclick="event.stopPropagation();requestQuote('${product.id}')">
                        📞 طلب عرض سعر
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `</div></div>`;
    content.innerHTML = html;
    
    // تفعيل تأثير الدخول
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.add('visible');
        });
    }, 100);
}

// ===== عرض نموذج الإضافة =====
function showAddProduct() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="container">
            <div class="form-container" id="formContainer">
                <h2>${editingProductId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h2>
                <form id="productForm" enctype="multipart/form-data">
                    <div class="form-group">
                        <label>اسم المنتج <span class="required">*</span></label>
                        <input type="text" id="title" required placeholder="مثال: باب خشبي فاخر">
                    </div>
                    
                    <div class="form-group">
                        <label>السعر ($) <span class="required">*</span></label>
                        <input type="number" id="price" required placeholder="500" step="0.01">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>الفئة</label>
                            <select id="category">
                                <option value="أبواب">أبواب</option>
                                <option value="شبابيك">شبابيك</option>
                                <option value="مطابخ">مطابخ</option>
                                <option value="غرف نوم">غرف نوم</option>
                                <option value="ألمنيوم">ألمنيوم</option>
                                <option value="ديكورات">ديكورات</option>
                                <option value="أثاث مكتبي">أثاث مكتبي</option>
                                <option value="إكسسوارات">إكسسوارات</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>الغرفة</label>
                            <select id="room">
                                <option value="صالة">صالة</option>
                                <option value="غرفة نوم">غرفة نوم</option>
                                <option value="مطبخ">مطبخ</option>
                                <option value="حمام">حمام</option>
                                <option value="حديقة">حديقة</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>اللون</label>
                            <input type="text" id="color" placeholder="بني ذهبي">
                        </div>
                        <div class="form-group">
                            <label>الخامة</label>
                            <input type="text" id="material" placeholder="خشب">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>العلامة التجارية</label>
                        <input type="text" id="brand" placeholder="اسم المصنع">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>الطول (سم)</label>
                            <input type="number" id="length" placeholder="210">
                        </div>
                        <div class="form-group">
                            <label>العرض (سم)</label>
                            <input type="number" id="width" placeholder="90">
                        </div>
                        <div class="form-group">
                            <label>الارتفاع (سم)</label>
                            <input type="number" id="height" placeholder="4">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>الوصف</label>
                        <textarea id="description" rows="4" placeholder="وصف المنتج بالتفصيل..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>صور المنتج (روابط)</label>
                        <input type="text" id="images" placeholder="رابط الصورة 1, رابط الصورة 2, ...">
                        <small style="color:#888;">افصل بين الروابط بفاصلة</small>
                    </div>
                    
                    <div class="form