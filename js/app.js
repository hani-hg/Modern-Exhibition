// ===== GLOBALS =====
let allProducts = [];
let editingProductId = null;
let currentFilter = 'all';
let isAdmin = false;
let uploadedUrls = [];

// ===== AUTH =====
function checkAdmin() {
    if (!isAdmin) {
        const pass = prompt('🔐 أدخل كلمة المرور للمالك:');
        if (pass === 'admin123') {
            isAdmin = true;
            document.getElementById('addProductNav').style.display = 'inline-block';
            showToast('✅ مرحباً أيها المالك', 'success');
            showHome();
        } else {
            showToast('❌ كلمة مرور خاطئة', 'error');
        }
    }
}

// ===== SHOW HOME =====
async function showHome() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `<div style="text-align:center;padding:40px;"><div class="loading-spinner"></div><p>⏳ جاري التحميل...</p></div>`;
    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const total = allProducts.length;
        const featuredCount = allProducts.filter(p => p.featured).length;
        const views = allProducts.reduce((s, p) => s + (p.views || 0), 0);
        const newCount = allProducts.filter(p => p.condition === 'جديد').length;
        const latest = allProducts.slice(0, 6);
        const featuredItems = allProducts.filter(p => p.featured).slice(0, 4);

        let html = `
            <div class="stats-grid">
                <div class="stat-box"><h3>${total}</h3><p>📦 منتجات</p></div>
                <div class="stat-box"><h3>${featuredCount}</h3><p>⭐ مميزة</p></div>
                <div class="stat-box"><h3>${views}</h3><p>👁️ مشاهدات</p></div>
                <div class="stat-box"><h3>${newCount}</h3><p>🆕 جديدة</p></div>
            </div>
            ${featuredItems.length ? `<h2 style="color:var(--primary);margin:20px 0 10px;">⭐ مميزات</h2><div class="products-grid">${renderCards(featuredItems)}</div>` : ''}
            <h2 style="color:var(--primary);margin:30px 0 10px;">📦 آخر المنتجات</h2>
            <div class="products-grid">${renderCards(latest)}</div>
            <h2 style="color:var(--primary);margin:30px 0 10px;">🏷️ التصنيفات</h2>
            <div class="categories-grid">${renderCategories()}</div>
        `;
        content.innerHTML = html;
        animateCards();
    } catch (e) { content.innerHTML = `<div class="empty-state"><h2>❌ خطأ</h2><p>حدث خطأ في التحميل</p></div>`; }
}

// ===== RENDER CARDS =====
function renderCards(products) {
    if (!products || !products.length) return `<p style="color:#999;">لا توجد منتجات</p>`;
    return products.map(p => `
        <div class="product-card" onclick="showDetail('${p.id}')">
            <div class="product-image">
                ${p.images && p.images[0] ? `<img src="${p.images[0]}" alt="${p.title}">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:32px;">🖼️</div>'}
                ${p.isNew ? '<span class="product-badge badge-new">جديد</span>' : ''}
                ${p.featured ? '<span class="product-badge badge-featured">⭐ مميز</span>' : ''}
            </div>
            <div class="product-info">
                <h3>${p.title}</h3>
                ${p.brand ? `<div class="product-brand">🏷️ ${p.brand}</div>` : ''}
                <div class="product-price">$${p.price} <small>${p.currency || 'USD'}</small></div>
                <div class="product-tags">
                    ${p.category ? `<span>📂 ${p.category}</span>` : ''}
                    ${p.room ? `<span>🏠 ${p.room}</span>` : ''}
                    ${p.color ? `<span>🎨 ${p.color}</span>` : ''}
                </div>
                <button class="btn-quote" onclick="event.stopPropagation();requestQuote('${p.id}')">📞 طلب عرض سعر</button>
            </div>
        </div>
    `).join('');
}

// ===== RENDER CATEGORIES (الترتيب المطلوب) =====
function renderCategories() {
    const cats = ['أبواب', 'شبابيك', 'غرف نوم', 'مطابخ', 'ألمنيوم', 'ديكورات'];
    const icons = ['🚪', '🪟', '🛏️', '🍳', '🔩', '🎨'];
    return cats.map((cat, i) => {
        const count = allProducts.filter(p => p.category === cat).length;
        return `<div class="cat-card" onclick="filterByCategory('${cat}')">
            <div class="cat-icon">${icons[i]}</div>
            <h4>${cat}</h4>
            <p>${count} منتج</p>
        </div>`;
    }).join('');
}

// ===== FILTER =====
function filterByCategory(cat) { currentFilter = cat; showProducts(); }

// ===== SHOW PRODUCTS =====
async function showProducts() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `<div style="text-align:center;padding:40px;"><div class="loading-spinner"></div></div>`;
    try {
        let q = collection(db, 'products');
        if (currentFilter !== 'all') q = query(q, where('category', '==', currentFilter));
        const snap = await getDocs(q);
        allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let html = `
            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin:20px 0;">
                <h2 style="color:var(--primary);">📦 المنتجات (${allProducts.length})</h2>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn btn-brown" onclick="currentFilter='all';showProducts();">الكل</button>
                    ${['أبواب','شبابيك','غرف نوم','مطابخ','ألمنيوم','ديكورات'].map(c => `
                        <button class="btn ${currentFilter===c?'btn-gold':'btn-brown'}" onclick="currentFilter='${c}';showProducts();">${c}</button>
                    `).join('')}
                    ${isAdmin ? `<button class="btn btn-gold" onclick="showAddProduct()">➕ إضافة</button>` : ''}
                </div>
            </div>
            <div class="products-grid">${renderCards(allProducts)}</div>
        `;
        content.innerHTML = html;
        animateCards();
    } catch (e) { content.innerHTML = `<div class="empty-state"><h2>❌ خطأ</h2></div>`; }
}

function animateCards() {
    document.querySelectorAll('.product-card').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => { el.style.transition = '0.5s ease'; el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 100 + i * 80);
    });
}

// ===== SHOW FEATURED =====
function showFeatured() {
    const featured = allProducts.filter(p => p.featured);
    const content = document.getElementById('mainContent');
    content.innerHTML = `<h2 style="color:var(--primary);margin:20px 0;">⭐ المنتجات المميزة</h2><div class="products-grid">${renderCards(featured)}</div>`;
    animateCards();
}

// ===== SHOW ADD PRODUCT (مع Cloudinary) =====
function showAddProduct() {
    if (!isAdmin) { checkAdmin(); return; }
    const content = document.getElementById('mainContent');
    uploadedUrls = [];
    content.innerHTML = `
        <div class="form-container">
            <h2>${editingProductId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h2>
            <form id="productForm">
                <div class="form-group">
                    <label>اسم المنتج <span style="color:red;">*</span></label>
                    <input type="text" id="title" required placeholder="مثال: باب خشبي فاخر">
                </div>
                <div class="form-group">
                    <label>السعر ($) <span style="color:red;">*</span></label>
                    <input type="number" id="price" required placeholder="500">
                </div>
                <div class="form-row">
                    <div class="form-group"><label>الفئة</label><select id="category"><option value="أبواب">أبواب</option><option value="شبابيك">شبابيك</option><option value="غرف نوم">غرف نوم</option><option value="مطابخ">مطابخ</option><option value="ألمنيوم">ألمنيوم</option><option value="ديكورات">ديكورات</option></select></div>
                    <div class="form-group"><label>الغرفة</label><select id="room"><option value="صالة">صالة</option><option value="غرفة نوم">غرفة نوم</option><option value="مطبخ">مطبخ</option><option value="حمام">حمام</option><option value="حديقة">حديقة</option></select></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>اللون</label><input type="text" id="color" placeholder="بني ذهبي"></div>
                    <div class="form-group"><label>الخامة</label><input type="text" id="material" placeholder="خشب"></div>
                </div>
                <div class="form-group"><label>العلامة التجارية</label><input type="text" id="brand" placeholder="اسم المصنع"></div>
                <div class="form-row">
                    <div class="form-group"><label>الطول (سم)</label><input type="number" id="length" placeholder="210"></div>
                    <div class="form-group"><label>العرض (سم)</label><input type="number" id="width" placeholder="90"></div>
                    <div class="form-group"><label>الارتفاع (سم)</label><input type="number" id="height" placeholder="4"></div>
                </div>
                <div class="form-group"><label>الوصف</label><textarea id="description" rows="3" placeholder="وصف المنتج..."></textarea></div>
                <div class="form-group">
                    <label>صور المنتج</label>
                    <button type="button" id="uploadBtn" class="btn btn-gold" style="width:100%;padding:12px;">📤 رفع صور من جهازك</button>
                    <div id="imagePreview" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;"></div>
                </div>
                <div class="form-group"><label>الحالة</label><select id="condition"><option value="جديد">جديد</option><option value="مستعمل">مستعمل</option><option value="للطلب">للطلب</option></select></div>
                <div class="form-actions">
                    <button type="submit" class="btn-submit">${editingProductId ? '💾 تحديث' : '📤 نشر'}</button>
                    <button type="button" class="btn-cancel" onclick="editingProductId=null;showHome();">إلغاء</button>
                </div>
            </form>
        </div>
    `;

    // Cloudinary Widget (بسيط ومباشر)
    document.getElementById('uploadBtn').addEventListener('click', function() {
        const script = document.createElement('script');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.onload = () => {
            const widget = window.cloudinary.createUploadWidget(
                {
                    cloudName: 'dzjy5tubx',
                    uploadPreset: 'product',
                    multiple: true,
                    maxFiles: 5,
                    folder: 'products'
                },
                (error, result) => {
                    if (result.event === 'success') {
                        const url = result.info.secure_url;
                        uploadedUrls.push(url);
                        const preview = document.getElementById('imagePreview');
                        const img = document.createElement('img');
                        img.src = url;
                        img.style.width = '80px'; img.style.height = '80px'; img.style.objectFit = 'cover';
                        img.style.borderRadius = '10px'; img.style.border = '2px solid #D4A85C';
                        preview.appendChild(img);
                        showToast('✅ تم رفع الصورة', 'success');
                    }
                }
            );
            widget.open();
        };
        document.head.appendChild(script);
    });

    // Submit
    document.getElementById('productForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = {
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
        if (!data.title) return showToast('❌ أدخل اسم المنتج', 'error');
        if (!data.price || data.price <= 0) return showToast('❌ أدخل سعراً صحيحاً', 'error');
        if (uploadedUrls.length === 0 && !editingProductId) return showToast('❌ ارفع صورة واحدة على الأقل', 'error');

        if (editingProductId && uploadedUrls.length === 0) {
            const old = await getDoc(doc(db, 'products', editingProductId));
            if (old.exists()) uploadedUrls = old.data().images || [];
        }
        data.images = uploadedUrls;

        try {
            const btn = document.querySelector('.btn-submit');
            btn.textContent = '⏳ جاري النشر...'; btn.disabled = true;
            if (editingProductId) {
                await updateDoc(doc(db, 'products', editingProductId), data);
                showToast('✅ تم التحديث', 'success');
                editingProductId = null;
            } else {
                data.createdAt = new Date(); data.isNew = true; data.featured = false; data.views = 0;
                await addDoc(collection(db, 'products'), data);
                showToast('✅ تم النشر', 'success');
            }
            uploadedUrls = [];
            showHome();
        } catch (err) { showToast('❌ خطأ: ' + err.message, 'error'); }
    });

    if (editingProductId) loadProductData(editingProductId);
}

// ===== SHOW DETAIL =====
async function showDetail(id) {
    const p = allProducts.find(p => p.id === id);
    if (!p) return;
    const content = document.getElementById('mainContent');
    const imgs = p.images || [];
    const hasDim = p.dimensions && (p.dimensions.length || p.dimensions.width || p.dimensions.height);
    content.innerHTML = `
        <button class="btn btn-brown" onclick="showHome()" style="margin:16px 0;">⬅️ العودة</button>
        <div class="product-detail">
            <div>
                <img src="${imgs[0] || ''}" class="detail-image" id="detailMainImg" onerror="this.src=''">
                ${imgs.length > 1 ? `<div class="detail-thumbs">${imgs.map((img, i) => `<img src="${img}" onclick="document.getElementById('detailMainImg').src='${img}';document.querySelectorAll('.detail-thumbs img').forEach(el=>el.classList.remove('active'));this.classList.add('active');" class="${i===0?'active':''}">`).join('')}</div>` : ''}
            </div>
            <div class="detail-info">
                <h1>${p.title}</h1>
                ${p.brand ? `<p style="color:var(--secondary);font-size:18px;">🏷️ ${p.brand}</p>` : ''}
                <p class="detail-price">$${p.price} <small style="font-size:16px;color:#888;">${p.currency || 'USD'}</small></p>
                <div class="detail-meta">
                    ${p.category ? `<span>📂 ${p.category}</span>` : ''}
                    ${p.room ? `<span>🏠 ${p.room}</span>` : ''}
                    ${p.color ? `<span>🎨 ${p.color}</span>` : ''}
                    ${p.material ? `<span>🔧 ${p.material}</span>` : ''}
                    ${p.condition ? `<span>📌 ${p.condition}</span>` : ''}
                </div>
                ${hasDim ? `<div class="dimensions-box"><h3>📏 المقاسات</h3><div class="dimensions-grid"><div><p class="label">الطول</p><p class="value">${p.dimensions.length || 0} سم</p></div><div><p class="label">العرض</p><p class="value">${p.dimensions.width || 0} سم</p></div><div><p class="label">الارتفاع</p><p class="value">${p.dimensions.height || 0} سم</p></div></div></div>` : ''}
                ${p.description ? `<p style="margin:16px 0;color:#555;">${p.description}</p>` : ''}
                <div class="detail-actions">
                    <button class="btn-green" onclick="requestQuote('${p.id}')">📞 طلب عرض سعر</button>
                    ${isAdmin ? `<button class="btn-brown" onclick="editProduct('${p.id}')">✏️ تعديل</button>` : ''}
                    ${isAdmin ? `<button class="btn-danger" onclick="deleteProduct('${p.id}')">🗑️ حذف</button>` : ''}
                </div>
            </div>
        </div>
    `;
}

// ===== REQUEST QUOTE (تم تحديث الرقم) =====
function requestQuote(id) {
    const p = allProducts.find(p => p.id === id);
    if (!p) return;
    showQuoteModal(p, (data) => {
        const msg = `📋 طلب عرض سعر\nالمنتج: ${p.title}\nالسعر: $${p.price}\nالاسم: ${data.name}\nالهاتف: ${data.phone}\nالرسالة: ${data.message}`;
        window.open(`https://wa.me/963996190945?text=${encodeURIComponent(msg)}`, '_blank');
        closeModal();
        showToast('✅ تم إرسال الطلب', 'success');
    });
}

// ===== EDIT & DELETE =====
function editProduct(id) { editingProductId = id; showAddProduct(); }
async function deleteProduct(id) {
    if (!confirm('هل أنت متأكد؟')) return;
    await deleteDoc(doc(db, 'products', id));
    showToast('✅ تم الحذف', 'success');
    showHome();
}
async function loadProductData(id) {
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
    if (d.images) {
        uploadedUrls = d.images;
        const preview = document.getElementById('imagePreview');
        d.images.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '80px'; img.style.height = '80px'; img.style.objectFit = 'cover';
            img.style.borderRadius = '10px'; img.style.border = '2px solid #D4A85C';
            preview.appendChild(img);
        });
    }
}

// ===== GLOBAL SEARCH =====
function globalSearch() {
    const q = document.getElementById('globalSearch').value.trim().toLowerCase();
    if (!q) return showHome();
    const filtered = allProducts.filter(p => p.title.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    const content = document.getElementById('mainContent');
    content.innerHTML = `<h2 style="color:var(--primary);margin:20px 0;">🔍 نتائج البحث (${filtered.length})</h2><div class="products-grid">${renderCards(filtered)}</div>`;
    animateCards();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', showHome);
window.showHome = showHome;
window.showProducts = showProducts;
window.showFeatured = showFeatured;
window.showAddProduct = showAddProduct;
window.showDetail = showDetail;
window.requestQuote = requestQuote;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.filterByCategory = filterByCategory;
window.globalSearch = globalSearch;