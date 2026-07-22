// js/modal.js

// ===== إنشاء نافذة منبثقة =====
function showModal(title, content, onConfirm = null) {
    // إزالة أي مودال سابق
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();
    
    // إنشاء خلفية المودال
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;
    
    // إنشاء محتوى المودال
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
        direction: rtl;
    `;
    
    modal.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h2 style="color:var(--brown);margin:0;">${title}</h2>
            <button onclick="closeModal()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;">✕</button>
        </div>
        <div>${content}</div>
        <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
            <button onclick="closeModal()" class="btn btn-brown">إلغاء</button>
            ${onConfirm ? `<button onclick="closeModal();${onConfirm}()" class="btn btn-gold">تأكيد</button>` : ''}
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// ===== إغلاق المودال =====
function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
}

// ===== نافذة تأكيد الحذف =====
function confirmDelete(message, onConfirm) {
    showModal(
        '🗑️ تأكيد الحذف',
        `<p style="color:#555;">${message}</p>`,
        onConfirm
    );
}

// ===== نافذة عرض السعر =====
function showQuoteModal(product, onSend) {
    const content = `
        <form id="quoteForm">
            <div style="margin-bottom:15px;">
                <label style="display:block;font-weight:bold;margin-bottom:5px;">اسمك *</label>
                <input type="text" id="quoteName" required style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block;font-weight:bold;margin-bottom:5px;">رقم الهاتف *</label>
                <input type="tel" id="quotePhone" required style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block;font-weight:bold;margin-bottom:5px;">رسالة</label>
                <textarea id="quoteMessage" rows="3" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;resize:vertical;">أريد عرض سعر لمنتج: ${product.title}</textarea>
            </div>
        </form>
    `;
    
    showModal('📞 طلب عرض سعر', content, () => {
        const name = document.getElementById('quoteName').value;
        const phone = document.getElementById('quotePhone').value;
        const message = document.getElementById('quoteMessage').value;
        
        if (!name || !phone) {
            showToast('❌ يرجى تعبئة جميع الحقول المطلوبة', 'error');
            return;
        }
        
        onSend({ name, phone, message });
    });
}

// ===== إضافة الأنماط =====
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: