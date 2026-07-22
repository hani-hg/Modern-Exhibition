// js/admin.js

async function showAdmin() {
    const content = document.getElementById('mainContent');
    const products = await getDocs(collection(db, 'products'));
    const list = products.docs.map(d => ({ id: d.id, ...d.data() }));

    content.innerHTML = `
        <h2 style="color:var(--brown);margin:20px 0;">📊 لوحة التحكم</h2>
        <div class="stats-section" style="margin-bottom:30px;">
            <div class="stat-box"><h3>${list.length}</h3><p>📦 منتجات</p></div>
            <div class="stat-box"><h3>${list.filter(p=>p.featured).length}</h3><p>⭐ مميزة</p></div>
            <div class="stat-box"><h3>${list.reduce((s,p)=>s+(p.views||0),0)}</h3><p>👁️ مشاهدات</p></div>
        </div>
        <h3 style="color:var(--brown);margin-bottom:16px;">📦 إدارة المنتجات</h3>
        <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;background:var(--cream);border-radius:16px;overflow:hidden;box-shadow:var(--shadow);">
                <thead style="background:var(--brown);color:#fff;">
                    <tr><th style="padding:12px;">المنتج</th><th>السعر</th><th>الفئة</th><th>مميز</th><th>إجراء</th></tr>
                </thead>
                <tbody>
                    ${list.map(p => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${p.title}</td>
                            <td>$${p.price}</td>
                            <td>${p.category}</td>
                            <td>${p.featured ? '⭐' : '—'}</td>
                            <td style="display:flex;gap:8px;flex-wrap:wrap;">
                                <button class="btn btn-brown" onclick="editProduct('${p.id}')">✏️</button>
                                <button class="btn btn-gold" onclick="toggleFeatured('${p.id}')">⭐</button>
                                <button class="btn btn-danger" onclick="deleteProduct('${p.id}')">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function toggleFeatured(id) {
    const ref = doc(db, 'products', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const current = snap.data().featured || false;
    await updateDoc(ref, { featured: !current });
    showToast(`✅ ${!current ? 'تم التميز' : 'تم إلغاء التميز'}`, 'success');
    showAdmin();
}

// expose
window.showAdmin = showAdmin;
window.toggleFeatured = toggleFeatured;