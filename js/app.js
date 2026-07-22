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
                    
                    <div class="form-group">
                        <label>حالة المنتج</label>
                        <select id="condition">
                            <option value="جديد">جديد</option>
                            <option value="مستعمل">مستعمل</option>
                            <option value="للطلب">للطلب</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-submit">
                            ${editingProductId ? '💾 تحديث المنتج' : '📤 نشر المنتج'}
                        </button>
                        ${editingProductId ? 
                            `<button type="button" class="btn btn-cancel" onclick="cancelEdit()">إلغاء التعديل</button>` : 
                            `<button type="button" class="btn btn-cancel" onclick="showProducts()">إلغاء</button>`
                        }
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // تفعيل تأثير الدخول
    setTimeout(() => {
        document.getElementById('formContainer').classList.add('visible');
    }, 50);
    
    // معالجة إرسال النموذج
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // إذا كان في وضع التعديل، املأ البيانات
    if (editingProductId) {
        loadProductData(editingProductId);
    }
}

// ===== معالجة إرسال المنتج =====
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productData = {
        title: document.getElementById('title').value.trim(),
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        room: document.getElementById('room').value,
        color: document.getElementById('color').value.trim(),
        material: document.getElementById('material').value.trim(),
        brand: document.getElementById('brand').value.trim(),
        description: document.getElementById('description').value.trim(),
        dimensions: {
            length: parseFloat(document.getElementById('length').value) || 0,
            width: parseFloat(document.getElementById('width').value) || 0,
            height: parseFloat(document.getElementById('height').value) || 0
        },
        images: document.getElementById('images').value.split(',').map(s => s.trim()).filter(s => s),
        condition: document.getElementById('condition').value,
        currency: 'USD',
        updatedAt: new Date()
    };
    
    // تحقق من البيانات
    if (!productData.title) {
        showToast('❌ يرجى إدخال اسم المنتج', 'error');
        return;
    }
    
    if (!productData.price || productData.price <= 0) {
        showToast('❌ يرجى إدخال سعر صحيح', 'error');
        return;
    }
    
    try {
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.textContent = '⏳ جاري الحفظ...';
        submitBtn.disabled = true;
        
        if (editingProductId) {
            // تحديث المنتج
            await updateDoc(doc(db, 'products', editingProductId), productData);
            showToast('✅ تم تحديث المنتج بنجاح!', 'success');
            editingProductId = null;
        } else {
            // إضافة منتج جديد
            productData.createdAt = new Date();
            productData.isNew = true;
            productData.featured = false;
            productData.views = 0;
            await addDoc(collection(db, 'products'), productData);
            showToast('✅ تم إضافة المنتج بنجاح!', 'success');
        }
        
        showProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('❌ حدث خطأ: ' + error.message, 'error');
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.textContent = editingProductId ? '💾 تحديث المنتج' : '📤 نشر المنتج';
        submitBtn.disabled = false;
    }
}

// ===== عرض تفاصيل المنتج =====
function showProductDetail(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) {
        showToast('❌ المنتج غير موجود', 'error');
        return;
    }
    
    const content = document.getElementById('content');
    const images = product.images || [];
    const hasDimensions = product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height);
    
    content.innerHTML = `
        <div class="container">
            <button class="btn btn-brown" onclick="showProducts()" style="margin:20px 0;">⬅️ العودة إلى المنتجات</button>
            
            <div class="product-detail">
                <div class="product-detail-gallery">
                    ${images.length > 0 ? 
                        `<img src="${images[0]}" alt="${product.title}" class="product-detail-image" id="mainImage">` :
                        `<div class="product-detail-image" style="display:flex;align-items:center;justify-content:center;background:#e5e7eb;color:#999;font-size:64px;">🖼️</div>`
                    }
                    ${images.length > 1 ? `
                        <div class="product-detail-thumbs">
                            ${images.map((img, i) => `
                                <img src="${img}" alt="صورة ${i+1}" 
                                     onclick="document.getElementById('mainImage').src='${img}';document.querySelectorAll('.product-detail-thumbs img').forEach(el=>el.classList.remove('active'));this.classList.add('active');"
                                     class="${i === 0 ? 'active' : ''}">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-detail-info">
                    <h1>${product.title}</h1>
                    ${product.brand ? `<p style="color:var(--gold);font-size:18px;">🏷️ ${product.brand}</p>` : ''}
                    <p class="product-detail-price">$${product.price} <span style="font-size:16px;color:#888;">${product.currency || 'USD'}</span></p>
                    
                    <div class="product-detail-meta">
                        ${product.category ? `<span class="tag">📂 ${product.category}</span>` : ''}
                        ${product.room ? `<span class="tag">🏠 ${product.room}</span>` : ''}
                        ${product.color ? `<span class="tag">🎨 ${product.color}</span>` : ''}
                        ${product.material ? `<span class="tag">🔧 ${product.material}</span>` : ''}
                        ${product.condition ? `<span class="tag">📌 ${product.condition}</span>` : ''}
                    </div>
                    
                    ${hasDimensions ? `
                        <div class="product-detail-dimensions">
                            <h3>📏 المقاسات</h3>
                            <div class="product-detail-dimensions-grid">
                                <div>
                                    <p class="label">الطول</p>
                                    <p class="value">${product.dimensions.length || 0} سم</p>
                                </div>
                                <div>
                                    <p class="label">العرض</p>
                                    <p class="value">${product.dimensions.width || 0} سم</p>
                                </div>
                                <div>
                                    <p class="label">الارتفاع</p>
                                    <p class="value">${product.dimensions.height || 0} سم</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${product.description ? `<p style="color:#555;margin:20px 0;">${product.description}</p>` : ''}
                    
                    <div class="product-detail-actions">
                        <button class="btn btn-green" onclick="requestQuote('${product.id}')">
                            📞 طلب عرض سعر
                        </button>
                        <button class="btn btn-brown" onclick="editProduct('${product.id}')">
                            ✏️ تعديل المنتج
                        </button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                            🗑️ حذف المنتج
                        </button>
                        <button class="btn btn-gold" onclick="window.open('${images[0] || ''}', '_blank')">
                            🔍 عرض الصورة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== طلب عرض سعر =====
function requestQuote(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) {
        showToast('❌ المنتج غير موجود', 'error');
        return;
    }
    
    showQuoteModal(product, (data) => {
        const message = `
            📋 طلب عرض سعر
            المنتج: ${product.title}
            السعر: $${product.price}
            الاسم: ${data.name}
            الهاتف: ${data.phone}
            الرسالة: ${data.message}
        `;
        const url = `https://wa.me/966500000000?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        closeModal();
        showToast('✅ تم إرسال الطلب بنجاح!', 'success');
    });
}

// ===== تعديل المنتج =====
function editProduct(productId) {
    editingProductId = productId;
    showAddProduct();
}

// ===== حذف المنتج =====
async function deleteProduct(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    confirmDelete(`هل أنت متأكد من حذف المنتج "${product.title}"؟`, async () => {
        try {
            await deleteDoc(doc(db, 'products', productId));
            showToast('✅ تم حذف المنتج بنجاح', 'success');
            showProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('❌ حدث خطأ في الحذف', 'error');
        }
    });
}

// ===== إلغاء التعديل =====
function cancelEdit() {
    editingProductId = null;
    showAddProduct();
}

// ===== تحميل البيانات للتعديل =====
async function loadProductData(productId) {
    try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('title').value = data.title || '';
            document.getElementById('price').value = data.price || '';
            document.getElementById('category').value = data.category || 'أبواب';
            document.getElementById('room').value = data.room || 'صالة';
            document.getElementById('color').value = data.color || '';
            document.getElementById('material').value = data.material || '';
            document.getElementById('brand').value = data.brand || '';
            document.getElementById('description').value = data.description || '';
            document.getElementById('length').value = data.dimensions?.length || '';
            document.getElementById('width').value = data.dimensions?.width || '';
            document.getElementById('height').value = data.dimensions?.height || '';
            document.getElementById('images').value = (data.images || []).join(', ');
            document.getElementById('condition').value = data.condition || 'جديد';
        }
    } catch (error) {
        console.error('Error loading product data:', error);
        showToast('❌ خطأ في تحميل بيانات المنتج', 'error');
    }
}

// ===== زر العودة للأعلى =====
function initScrollTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top';
    btn.innerHTML = '⬆';
    btn.setAttribute('aria-label', 'العودة للأعلى');
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
}

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', () => {
    showProducts();
    initScrollTop();
});

// ===== تصدير الدوال للاستخدام العالمي =====
window.showProducts = showProducts;
window.showAddProduct = showAddProduct;
window.showProductDetail = showProductDetail;
window.requestQuote = requestQuote;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.cancelEdit = cancelEdit;