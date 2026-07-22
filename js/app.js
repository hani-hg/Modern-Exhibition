// ===== GLOBALS =====
let allProducts = [];
let editingProductId = null;
let currentFilter = 'all';
let isAdmin = false;

// ===== SIMPLE AUTH =====
function checkAdmin() {
    if (!isAdmin) {
        const pass = prompt('🔐 أدخل كلمة المرور للمالك:');
        if (pass === 'admin123') {  // يمكن تغييرها
            isAdmin = true;
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
        const featured = allProducts.filter(p => p.featured).length;
        const views = allProducts.reduce((s, p) => s + (p.views || 0), 0);
        const latest = allProducts.slice(0, 6);

        let html = `
            <div class="stats">
                <div class="stat-box"><h3>${total}</h3><p>📦 منتجات</p></div>
                <div class="stat-box"><h3>${featured}</h3><p>⭐ مميزة</p></div>
                <div class="stat-box"><h3>${views}</h3><p>👁️ مشاهدات</p></div>
                <div class="stat-box"><h3>${allProducts.filter(p => p.condition === 'جديد').length}</h3><p>🆕 جديدة</p></div>
            </div>
            <section>
                <h2 style="color:var(--primary);margin-bottom:16px;">⭐ مميزات</h2>
                <div class="products-grid">${renderProductCards(allProducts.filter(p => p.featured).slice(0,4))}</div>
            </section>
            <section>
                <h2 style="color:var(--primary);margin:32px 0 16px;">📦 آخر المنتجات</h2>
                <div class="products-grid">${renderProductCards(latest)}</div>
            </section>
            <section>
                <h2 style="color:var(--primary);margin:32px 0 16px;">🏷️ التصنيفات</h2>
                <div class="categories">${renderCategories()}</div>
            </section>
        `;
        content.innerHTML = html;
        document.querySelectorAll('.product-card').forEach((el, i) => {
            setTimeout(() => el.style.opacity = '1', i * 100);
        });
    } catch (e) {
        content.innerHTML = `<div class="empty-state"><h2>❌ خطأ</h2><p>حدث خطأ في التحميل</p></div>`;
    }
}

// ===== RENDER CARDS =====
function renderProductCards(products) {
    if (!products || !products.length) return `<p style="color:#999;">لا توجد منتجات</p>`;
    return products.map(p => `
        <div class="product-card" onclick="showDetail('${p.id}')" style="opacity:0;transition:0.4s;">
            <div class="image">
                ${p.images && p.images[0] ? `<img src="${p.images[0]}" alt="${p.title}">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">🖼️</div>'}
                ${p.isNew ? '<span class="badge">جديد</span>' : ''}
                ${p.featured ? '<span class="badge" style="background:#ef4444;">مميز</span>' : ''}
            </div>
            <div class="info">
                <h3>${p.title}</h3>
                ${p.brand ? `<div class="brand">🏷️ ${p.brand}</div>` : ''}
                <div class="price">$${p.price} <small style="font-weight:400;font-size:14px;">${p.currency || 'USD'}</small></div>
                <div class="tags">
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
            <div class="icon">${icons[i]}</div>
            <h4>${cat}</h4>
            <p>${count} منتج</p>
        </div>`;
    }).join('');
}

// ===== FILTER =====
function filterByCategory(cat) {
    currentFilter = cat;
    showProducts();
}

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
            <div class="products-grid">${renderProductCards(allProducts)}</div>
        `;
        content.innerHTML = html;
        document.querySelectorAll('.product-card').forEach((el, i) => setTimeout(() => el.style.opacity = '1', i * 100));
    } catch (e) {
        content.innerHTML = `<div class="empty-state"><h2>❌ خطأ</h2><p>حدث خطأ</p></div>`;
    }
}

// ===== SHOW ADD PRODUCT (مع Cloudinary و Auth) =====
function showAddProduct() {
    if (!isAdmin) {
        checkAdmin();
        return;
    }
    // باقي الكود كما هو (نفس الكود السابق مع Cloudinary)
    // ... (سيتم وضعه كاملاً في الرد النهائي)
}