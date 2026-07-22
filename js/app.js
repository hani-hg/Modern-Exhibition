// js/app.js

// ===== المتغيرات العالمية =====
let currentProducts = [];
let editingProductId = null;

// ===== عرض المنتجات =====
async function showProducts() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="container"><h2>⏳ جاري التحميل...</h2></div>';
    
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
                    <p>أضف منتجك الأول الآن</p>
                    <button class="btn btn-gold" onclick="showAddProduct()">➕ إضافة منتج</button>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="container">
            <h2 style="margin: 20px 0;">📦 المنتجات</h2>
            <div class="products-grid">
    `;
    
    products.forEach(product => {
        html += `
            <div class="product-card" onclick="showProductDetail('${product.id}')">
                ${product.images && product.images[0] ? 
                    `<img src="${product.images[0]}" alt="${product.title}" class="product-image">` :
                    `<div class="product-image" style="display:flex;align-items:center;justify-content:center;background:#ddd;color:#999;">🖼️ لا توجد صورة</div>`
                }
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    ${product.brand ? `<p class="product-brand">🏷️ ${product.brand}</p>` : ''}
                    <p class="product-price">$${product.price}</p>
                    <div class="product-tags">
                        ${product.category ? `<span class="tag">📂 ${product.category}</span>` : ''}
                        ${product.room ? `<span class="tag">🏠 ${product.room}</span>` : ''}
                        ${product.color ? `<span class="tag">🎨 ${product.color}</span>` : ''}
                    </div>
                    <button class="btn btn-green" style="width:100%;margin-top:10px;" 
                            onclick="event.stopPropagation();requestQuote('${product.id}')">
                        📞 طلب عرض سعر
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `</div></div>`;
    content.innerHTML = html;
}

// ===== عرض نموذج الإضافة =====
function showAddProduct() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="container">
            <div class="form-container">
                <h2>${editingProductId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h2>
                <form id="productForm">
                    <div class="form-group">
                        <label>اسم المنتج *</label>
                        <input type="text" id="title" required placeholder="مثال: باب خشبي فاخر">
                    </div>
                    
                    <div class="form-group">
                        <label>السعر ($) *</label>
                        <input type="number" id="price" required placeholder="500">
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
                            </select>
                        </div>
                        <div class="form-group">
                            <label>الغرفة</label>
                            <select id="room">
                                <option value="صالة">صالة</option>
                                <option value="غرفة نوم">غرفة نوم</option>
                                <option value="مطبخ">مطبخ</option>
                                <option value="حمام">حمام</option>
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
                        <textarea id="description" rows="3" placeholder="وصف المنتج..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>صور المنتج (روابط)</label>
                        <input type="text" id="images" placeholder="رابط الصورة 1, رابط الصورة 2, ...">
                    </div>
                    
                    <button type="submit" class="btn btn-gold" style="width:100%;">
                        ${editingProductId ? '💾 تحديث المنتج' : '📤 نشر المنتج'}
                    </button>
                    ${editingProductId ? `<button type="button" class="btn btn-brown" style="width:100%;margin-top:10px;" onclick="cancelEdit()">إلغاء التعديل</button>` : ''}
                </form>
            </div>
        </div>
    `;
    
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
        title: document.getElementById('title').value,
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        room: document.getElementById('room').value,
        color: document.getElementById('color').value,
        material: document.getElementById('material').value,
        brand: document.getElementById('brand').value,
        description: document.getElementById('description').value,
        dimensions: {
            length: parseFloat(document.getElementById('length').value) || 0,
            width: parseFloat(document.getElementById('width').value) || 0,
            height: parseFloat(document.getElementById('height').value) || 0
        },
        images: document.getElementById('images').value.split(',').map(s => s.trim()).filter(s => s),
        createdAt: new Date()
    };
    
    try {
        if (editingProductId) {
            // تحديث المنتج
            await updateDoc(doc(db, 'products', editingProductId), productData);
            showToast('✅ تم تحديث المنتج بنجاح!', 'success');
            editingProductId = null;
        } else {
            // إضافة منتج جديد
            await addDoc(collection(db, 'products'), productData);
            showToast('✅ تم إضافة المنتج بنجاح!', 'success');
        }
        
        showProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('❌ حدث خطأ، حاول مرة أخرى', 'error');
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
    
    content.innerHTML = `
        <div class="container">
            <button class="btn btn-brown" onclick="showProducts()" style="margin:20px 0;">⬅️ العودة</button>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;background:var(--cream);padding:30px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                <div>
                    ${images.length > 0 ? 
                        `<img src="${images[0]}" alt="${product.title}" style="width:100%;height:400px;object-fit:cover;border-radius:12px;">` :
                        `<div style="height:400px;background:#ddd;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#999;">🖼️ لا توجد صور</div>`
                    }
                    ${images.length > 1 ? `
                        <div style="display:flex;gap:10px;margin-top:10px;overflow-x:auto;">
                            ${images.map(img => `<img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;cursor:pointer;" onclick="this.parentElement.parentElement.previousElementSibling.src=this.src">`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div>
                    <h1 style="color:var(--brown);">${product.title}</h1>
                    ${product.brand ? `<p style="color:var(--gold);font-size:18px;">🏷️ ${product.brand}</p>` : ''}
                    <p style="font-size:28px;font-weight:bold;color:var(--brown);">$${product.price}</p>
                    
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin:15px 0;">
                        <span class="tag">📂 ${product.category}</span>
                        <span class="tag">🏠 ${product.room}</span>
                        ${product.color ? `<span class="tag">🎨 ${product.color}</span>` : ''}
                        ${product.material ? `<span class="tag">🔧 ${product.material}</span>` : ''}
                    </div>
                    
                    ${product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) ? `
                        <div style="background:var(--beige);padding:15px;border-radius:12px;margin:15px 0;">
                            <h3>📏 المقاسات</h3>
                            <div style="display:grid;grid-template-columns:repeat(3,1fr);text-align:center;">
                                <div><p style="color:#888;">الطول</p><p style="font-weight:bold;">${product.dimensions.length} سم</p></div>
                                <div><p style="color:#888;">العرض</p><p style="font-weight:bold;">${product.dimensions.width} سم</p></div>
                                <div><p style="color:#888;">الارتفاع</p><p style="font-weight:bold;">${product.dimensions.height} سم</p></div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${product.description ? `<p style="color:#555;">${product.description}</p>` : ''}
                    
                    <button class="btn btn-green" style="width:100%;margin-top:20px;padding:15px;" onclick="requestQuote('${product.id}')">
                        📞 طلب عرض سعر
                    </button>
                    
                    <div style="display:flex;gap:10px;margin-top:10px;">
                        <button class="btn btn-brown" onclick="editProduct('${product.id}')">✏️ تعديل</button>
                        <button class="btn" style="background:#ef4444;color:white;" onclick="deleteProduct('${product.id}')">🗑️ حذف</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== طلب عرض سعر =====
function requestQuote(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;
    
    const message = `السلام عليكم، أريد عرض سعر لمنتج: ${product.title}`;
    const url = `https://wa.me/966500000000?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ===== تعديل المنتج =====
function editProduct(productId) {
    editingProductId = productId;
    showAddProduct();
}

// ===== حذف المنتج =====
async function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
        await deleteDoc(doc(db, 'products', productId));
        showToast('✅ تم حذف المنتج بنجاح', 'success');
        showProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('❌ حدث خطأ في الحذف', 'error');
    }
}

// ===== إلغاء التعديل =====
function cancelEdit() {
    editingProductId = null;
    showAddProduct();
}

// ===== عرض الإشعارات =====
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ===== البحث والفلتر =====
function filterProducts() {
    const search = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const room = document.getElementById('roomFilter')?.value || '';
    
    const filtered = currentProducts.filter(p => {
        const matchSearch = !search || p.title.toLowerCase().includes(search) || p.brand?.toLowerCase().includes(search);
        const matchCategory = !category || p.category === category;
        const matchRoom = !room || p.room === room;
        return matchSearch && matchCategory && matchRoom;
    });
    
    renderProducts(filtered);
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
        }
    } catch (error) {
        console.error('Error loading product data:', error);
        showToast('❌ خطأ في تحميل بيانات المنتج', 'error');
    }
}

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', () => {
    showProducts();
});

// ===== تصدير الدوال للاستخدام العالمي =====
window.showProducts = showProducts;
window.showAddProduct = showAddProduct;
window.showProductDetail = showProductDetail;
window.requestQuote = requestQuote;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.cancelEdit = cancelEdit;
window.showToast = showToast;
window.filterProducts = filterProducts;