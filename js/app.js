// js/app.js - النسخة الكاملة مع Cloudinary Widget

// ===== GLOBALS =====
let allProducts = [];
let editingProductId = null;
let currentFilter = 'all';

// ===== تحميل Cloudinary Widget =====
function loadCloudinaryScript(callback) {
    if (document.getElementById('cloudinary-script')) {
        if (callback) callback();
        return;
    }
    const script = document.createElement('script');
    script.id = 'cloudinary-script';
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.onload = callback;
    document.head.appendChild(script);
}

// ===== SHOW HOME =====
async function showHome() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `<div style="text-align:center;padding:40px 0;"><div class="loading-spinner"></div><p style="margin-top:16px;color:#888;">⏳ جاري التحميل...</p></div>`;

    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const total = allProducts.length;
        const featured = allProducts.filter(p => p.featured).length;
        const totalViews = allProducts.reduce((sum, p) => sum + (p.views || 0), 0);
        const latest = allProducts.slice(0, 6);
        const featuredProducts = allProducts.filter(p => p.featured).slice(0, 4);

        let html = `
            <section class="stats-section">
                <div class="stat-box"><h3>${total}</h3><p>📦 منتجات</p></div>
                <div class="stat-box"><h3>${featured}</h3><p>⭐ مميزة</p></div>
                <div class="stat-box"><h3>${totalViews}</h3><p>👁️ مشاهدات</p></div>
                <div class="stat-box"><h3>${allProducts.filter(p => p.condition === 'جديد').length}</h3><p>🆕 جديدة</p></div>
            </section>
            ${featuredProducts.length ? `<section class="featured-section"><div class="section-title"><span></span> ⭐ إعلانات مميزة</div><div class="products-grid">${renderProductCards(featuredProducts)}</div></section>` : ''}
            <section class="latest-section"><div class="section-title"><span></span> 📦 آخر المنتجات</div><div class="products-grid">${renderProductCards(latest)}</div></section>
            <section class="categories-section"><div class="section-title"><span></span> 🏷️ التصنيفات</div><div class="categories-grid">${renderCategories()}</div></section>
        `;
        content.innerHTML = html;
        setTimeout(() => document.querySelectorAll('.product-card').forEach(el => el.classList.add('visible')), 80);
    } catch (e) {
        console.error(e);
        content.innerHTML = `<div class="empty-state"><h2>❌ خطأ</h2><p>حدث خطأ في التحميل</p><button class="btn btn-gold" onclick="showHome()">🔄 إعادة المحاولة</button></div>`;
    }
}

// ===== RENDER PRODUCT CARDS =====
function renderProductCards(products) {
    if (!products || !products.length) return `<p style="color:#999;">لا توجد منتجات</p>`;
    return products.map(p => `
        <div class="product-card" onclick="showProductDetail('${p.id}')">
            ${p.isNew ? `<span class="product-badge new">جديد</span>` : ''}
            ${p.featured ? `<span class="product-badge featured">⭐ مميز</span>` : ''}
            <div class="product-image-wrapper">
                ${p.images && p.images[0] ? 
                    `<img src="${p.images[0]}" alt="${p.title}" class="product-image">` :
                    `<div class="product-image" style="display:flex;align-items:center;justify-content:center;background:#e5e7eb;color:#999;font-size:48px;">🖼️</div>`
                }
                <div class="product-image-overlay"></div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.title}</h3>
                ${p.brand ? `<p class="product-brand">🏷️ ${p.brand}</p>` : ''}
                <p class="product-price">$${p.price} <small>${p.currency || 'USD'}</small></p>
                <div class="product-tags">
                    ${p.category ? `<span class="tag">📂 ${p.category}</span>` : ''}
                    ${p.room ? `<span class="tag">🏠 ${p.room}</span>` : ''}
                    ${p.color ? `<span class="tag">🎨 ${p.color}</span>` : ''}
                </div>
                <button class="btn-quote" onclick="event.stopPropagation();requestQuote('${p.id}')">📞 طلب عرض سعر</button>
            </div>
        </div>
    `).join('');
}

// ===== RENDER CATEGORIES =====
function renderCategories() {
    const cats = ['أبواب', 'شبابيك', 'مطابخ', 'غرف نوم', 'ألمنيوم', 'ديكورات'];
    const icons = ['🚪', '🪟', '🍳', '🛏️', '🔩', '🎨'];
    return cats.map((cat, i) => {
        const count = allProducts.filter(p => p.category === cat).length;
        return `<div class="category-card" onclick="filterByCategory('${cat}')"><div class="category-icon">${icons[i]}</div><h4>${cat}</h4><p>${count} منتج</p></div>`;
    }).join('');
}

// ===== FILTER BY CATEGORY =====
function filterByCategory(category) {
    currentFilter = category;
    showProducts();
}

// ===== SHOW PRODUCTS =====
async function showProducts() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `<div style="text-align:center;padding:40px;"><div class="loading-spinner"></div></div>`;
    try {
        let q = collection(db, 'products');
        if (currentFilter !== 'all') q = query(q, where('category', '==', currentFilter));
        const snapshot = await getDocs(q);
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let html = `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;margin:20px 0 10px;">
                <h2 style="color:var(--brown);">📦 المنتجات (${allProducts.length})</h2>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <button class="btn btn-brown" onclick="currentFilter='all';showProducts();">الكل</button>
                    ${['أبواب','شبابيك','مطابخ','غرف نوم','ألمنيوم'].map(c => `<button class="btn ${currentFilter===c?'btn-gold':'btn-brown'}" onclick="currentFilter='${c}';showProducts();">${c}</button>`).join('')}
                    <button class="btn btn-gold" onclick="showAddProduct()">➕ إضافة</button>
                </div>
            </div>
            <div class="products-grid">${renderProductCards(allProducts)}</div>
        `;
        content.innerHTML = html;
        setTimeout(() => document.querySelectorAll('.product-card').forEach(el => el.classList.add('visible')), 80);
    } catch (e) {
        content.innerHTML = `<div class="empty-state"><h2>❌ خطأ</h2><p>حدث خطأ في التحميل</p></div>`;
    }
}

// ===== SHOW FEATURED =====
function showFeatured() {
    const featured = allProducts.filter(p => p.featured);
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="section-title" style="margin-top:20px;"><span></span> ⭐ المنتجات المميزة</div>
        ${featured.length ? `<div class="products-grid">${renderProductCards(featured)}</div>` : `<div class="empty-state"><h2>⭐ لا توجد منتجات مميزة</h2></div>`}
    `;
    setTimeout(() => document.querySelectorAll('.product-card').forEach(el => el.classList.add('visible')), 80);
}

// ===== SHOW ADD PRODUCT (مع Cloudinary) =====
function showAddProduct() {
    loadCloudinaryScript(() => {
        // تأكد من تحميل الـ widget
        console.log('✅ Cloudinary script loaded');
    });

    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="form-container" id="formContainer">
            <h2>${editingProductId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h2>
            <form id="productForm">
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
                    <div class="form-group"><label>الطول (سم)</label><input type="number" id="length" placeholder="210"></div>
                    <div class="form-group"><label>العرض (سم)</label><input type="number" id="width" placeholder="90"></div>
                    <div class="form-group"><label>الارتفاع (سم)</label><input type="number" id="height" placeholder="4"></div>
                </div>
                <div class="form-group">
                    <label>الوصف</label>
                    <textarea id="description" rows="4" placeholder="وصف المنتج..."></textarea>
                </div>

                <!-- ===== قسم رفع الصور عبر Cloudinary ===== -->
                <div class="form-group">
                    <label>صور المنتج <span class="required">*</span></label>
                    <button type="button" id="uploadBtn" class="btn btn-gold" style="width:100%;">📤 رفع صور من جهازك</button>
                    <small style="color:#888;">اختر عدة صور دفعة واحدة</small>
                    <div id="imagePreview" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;"></div>
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
                    <button type="submit" class="btn btn-submit">${editingProductId ? '💾 تحديث' : '📤 نشر'}</button>
                    <button type="button" class="btn btn-cancel" onclick="editingProductId=null;showHome();">إلغاء</button>
                </div>
            </form>
        </div>
    `;

    // ===== متغير لتخزين روابط الصور =====
    let uploadedUrls = [];

    // ===== ربط زر الرفع بـ Cloudinary =====
    document.getElementById('uploadBtn').addEventListener('click', function() {
        if (!window.cloudinary) {
            showToast('⏳ جاري تحميل الأداة، حاول مرة أخرى', 'info');
            return;
        }

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: 'YOUR_CLOUD_NAME', // ⚠️ استبدل باسم السحابة الخاص بك
                uploadPreset: 'products',     // اسم الـ Preset الذي أنشأته
                multiple: true,
                maxFiles: 5,
                folder: 'products',
                sources: ['local', 'camera', 'google_drive']
            },
            (error, result) => {
                if (error) {
                    showToast('❌ حدث خطأ في الرفع', 'error');
                    return;
                }
                if (result.event === 'success') {
                    const url = result.info.secure_url;
                    uploadedUrls.push(url);
                    // إضافة الصورة للمعاينة
                    const preview = document.getElementById('imagePreview');
                    const img = document.createElement('img');
                    img.src = url;
                    img.style.width = '80px';
                    img.style.height = '80px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '10px';
                    img.style.border = '2px solid var(--gold)';
                    preview.appendChild(img);
                    showToast('✅ تم رفع الصورة بنجاح!', 'success');
                }
            }
        );
        widget.open();
    });

    // ===== معالجة الإرسال =====
    document.getElementById('productForm').addEventListener('submit', async function(e) {
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
            condition: document.getElementById('condition').value,
            currency: 'USD',
            updatedAt: new Date()
        };

        if (!productData.title) return showToast('❌ أدخل اسم المنتج', 'error');
        if (!productData.price || productData.price <= 0) return showToast('❌ أدخل سعراً صحيحاً', 'error');

        // التحقق من الصور
        if (uploadedUrls.length === 0 && !editingProductId) {
            return showToast('❌ ارفع صورة واحدة على الأقل', 'error');
        }
        // إذا كان تعديل ولم يرفع صور جديدة، نجيب القديمة
        if (editingProductId && uploadedUrls.length === 0) {
            const oldSnap = await getDoc(doc(db, 'products', editingProductId));
            if (oldSnap.exists()) {
                uploadedUrls = oldSnap.data().images || [];
            }
        }

        productData.images = uploadedUrls;

        try {
            const btn = document.querySelector('.btn-submit');
            btn.textContent = '⏳ جاري النشر...';
            btn.disabled = true;

            if (editingProductId) {
                await updateDoc(doc(db, 'products', editingProductId), productData);
                showToast('✅ تم التحديث بنجاح!', 'success');
                editingProductId = null;
            } else {
                productData.createdAt = new Date();
                productData.isNew = true;
                productData.featured = false;
                productData.views = 0;
                await addDoc(collection(db, 'products'), productData);
                showToast('✅ تم النشر بنجاح!', 'success');
            }
            uploadedUrls = [];
            showHome();
        } catch (err) {
            console.error(err);
            showToast('❌ حدث خطأ: ' + err.message, 'error');
            const btn = document.querySelector('.btn-submit');
            btn.textContent = editingProductId ? '💾 تحديث' : '📤 نشر';
            btn.disabled = false;
        }
    });

    // إذا كان تعديل، حمّل البيانات القديمة
    if (editingProductId) {
        loadProductData(editingProductId, (oldImages) => {
            uploadedUrls = oldImages || [];
        });
    }

    setTimeout(() => document.getElementById('formContainer')?.classList.add('fade-in'), 50);
}

// ===== باقي الدوال المساعدة =====

// ===== SHOW PRODUCT DETAIL =====
async function showProductDetail(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return showToast('❌ المنتج غير موجود', 'error');
    const content = document.getElementById('mainContent');
    const images = product.images || [];
    const hasDim = product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height);
    content.innerHTML = `
        <button class="btn btn-brown" onclick="showHome()" style="margin:16px 0;">⬅️ العودة</button>
        <div class="product-detail">
            <div class="product-detail-gallery">
                ${images[0] ? `<img src="${images[0]}" id="mainDetailImage" class="product-detail-image">` :
                    `<div class="product-detail-image" style="display:flex;align-items:center;justify-content:center;background:#e5e7eb;color:#999;font-size:64px;">🖼️</div>`}
                ${images.length > 1 ? `
                    <div class="product-detail-thumbs">
                        ${images.map((img, i) => `
                            <img src="${img}" onclick="document.getElementById('mainDetailImage').src='${img}';document.querySelectorAll('.product-detail-thumbs img').forEach(el=>el.classList.remove('active'));this.classList.add('active');" 
                                 class="${i===0?'active':''}">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="product-detail-info">
                <h1>${product.title}</h1>
                ${product.brand ? `<p style="color:var(--gold);font-size:18px;">🏷️ ${product.brand}</p>` : ''}
                <p class="product-detail-price">$${product.price} <small style="font-size:16px;color:#888;">${product.currency || 'USD'}</small></p>
                <div class="product-detail-meta">
                    ${product.category ? `<span class="tag">📂 ${product.category}</span>` : ''}
                    ${product.room ? `<span class="tag">🏠 ${product.room}</span>` : ''}
                    ${product.color ? `<span class="tag">🎨 ${product.color}</span>` : ''}
                    ${product.material ? `<span class="tag">🔧 ${product.material}</span>` : ''}
                    ${product.condition ? `<span class="tag">📌 ${product.condition}</span>` : ''}
                </div>
                ${hasDim ? `
                    <div class="product-detail-dimensions">
                        <h3>📏 المقاسات</h3>
                        <div class="product-detail-dimensions-grid">
                            <div><p class="label">الطول</p><p class="value">${product.dimensions.length || 0} سم</p></div>
                            <div><p class="label">العرض</p><p class="value">${product.dimensions.width || 0} سم</p></div>
                            <div><p class="label">الارتفاع</p><p class="value">${product.dimensions.height || 0} سم</p></div>
                        </div>
                    </div>
                ` : ''}
                ${product.description ? `<p style="color:#555;margin:16px 0;">${product.description}</p>` : ''}
                <div class="product-detail-actions">
                    <button class="btn btn-green" onclick="requestQuote('${product.id}')">📞 طلب عرض سعر</button>
                    <button class="btn btn-brown" onclick="editProduct('${product.id}')">✏️ تعديل</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">🗑️ حذف</button>
                </div>
            </div>
        </div>
    `;
}

// ===== REQUEST QUOTE =====
function requestQuote(id) {
    const p = allProducts.find(p => p.id === id);
    if (!p) return;
    showQuoteModal(p, (data) => {
        const msg = `📋 طلب عرض سعر\nالمنتج: ${p.title}\nالسعر: $${p.price}\nالاسم: ${data.name}\nالهاتف: ${data.phone}\nالرسالة: ${data.message}`;
        window.open(`https://wa.me/966500000000?text=${encodeURIComponent(msg)}`, '_blank');
        closeModal();
        showToast('✅ تم إرسال الطلب', 'success');
    });
}

// ===== EDIT PRODUCT =====
function editProduct(id) {
    editingProductId = id;
    showAddProduct();
}

// ===== DELETE PRODUCT =====
function deleteProduct(id) {
    const p = allProducts.find(p => p.id === id);
    if (!p) return;
    confirmDelete(`هل أنت متأكد من حذف "${p.title}"؟`, async () => {
        await deleteDoc(doc(db, 'products', id));
        showToast('✅ تم الحذف', 'success');
        showHome();
    });
}

// ===== LOAD PRODUCT DATA =====
async function loadProductData(id, callback) {
    const snap = await getDoc(doc(db, 'products', id));
    if (!snap.exists()) return;
    const d = snap.data();
    document.getElementById('title').value = d.title || '';
    document.getElementById('price').value = d.price || '';
    document.getElementById('category').value = d.category || 'أبواب';
    document.getElementById('room').value = d.room || 'صالة';
    document.getElementById('color').value = d.color || '';
    document.getElementById('material').value = d.material || '';
    document.getElementById('brand').value = d.brand || '';
    document.getElementById('description').value = d.description || '';
    document.getElementById('length').value = d.dimensions?.length || '';
    document.getElementById('width').value = d.dimensions?.width || '';
    document.getElementById('height').value = d.dimensions?.height || '';
    document.getElementById('condition').value = d.condition || 'جديد';
    
    // عرض الصور القديمة
    if (d.images && d.images.length) {
        const preview = document.getElementById('imagePreview');
        d.images.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '10px';
            img.style.border = '2px solid var(--gold)';
            preview.appendChild(img);
        });
        if (callback) callback(d.images);
    }
}

// ===== GLOBAL SEARCH =====
function globalSearch() {
    const query = document.getElementById('globalSearch').value.trim().toLowerCase();
    if (!query) return showHome();
    const filtered = allProducts.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
    );
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <h2 style="color:var(--brown);margin:20px 0;">🔍 نتائج البحث عن "${query}" (${filtered.length})</h2>
        <div class="products-grid">${renderProductCards(filtered)}</div>
    `;
    setTimeout(() => document.querySelectorAll('.product-card').forEach(el => el.classList.add('visible')), 80);
}

// ===== TOGGLE MOBILE MENU =====
function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('open');
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top';
    btn.innerHTML = '⬆';
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 300));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    showHome();
    initScrollTop();
});

// ===== EXPOSE GLOBALLY =====
window.showHome = showHome;
window.showProducts = showProducts;
window.showFeatured = showFeatured;
window.showAddProduct = showAddProduct;
window.showProductDetail = showProductDetail;
window.requestQuote = requestQuote;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.filterByCategory = filterByCategory;
window.globalSearch = globalSearch;
window.toggleMobileMenu = toggleMobileMenu;