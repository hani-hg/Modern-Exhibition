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
            <button onclick="closeModal()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;transition:0.3s;" 
                    onmouseover="this.style.color='#333'" onmouseout="this.style.color='#999'">✕</button>
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
        `<p style="color:#555;font-size:16px;">${message}</p>`,
        onConfirm
    );
}

// ===== نافذة عرض السعر =====
function showQuoteModal(product, onSend) {
    const content = `
        <form id="quoteForm" style="direction:rtl;">
            <div style="margin-bottom:15px;">
                <label style="display:block;font-weight:600;margin-bottom:5px;color:var(--brown);">اسمك *</label>
                <input type="text" id="quoteName" required 
                       style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:10px;font-size:16px;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block;font-weight:600;margin-bottom:5px;color:var(--brown);">رقم الهاتف *</label>
                <input type="tel" id="quotePhone" required 
                       style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:10px;font-size:16px;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block;font-weight:600;margin-bottom:5px;color:var(--brown);">رسالة</label>
                <textarea id="quoteMessage" rows="3" 
                          style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:10px;font-size:16px;resize:vertical;font-family:inherit;">
أريد عرض سعر لمنتج: ${product.title} ($${product.price})
                </textarea>
            </div>
        </form>
    `;
    
    showModal('📞 طلب عرض سعر', content, () => {
        const name = document.getElementById('quoteName').value.trim();
        const phone = document.getElementById('quotePhone').value.trim();
        const message = document.getElementById('quoteMessage').value.trim();
        
        if (!name) {
            showToast('❌ يرجى إدخال اسمك', 'error');
            return;
        }
        if (!phone) {
            showToast('❌ يرجى إدخال رقم الهاتف', 'error');
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
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// تصدير للاستخدام العالمي
window.showModal = showModal;
window.closeModal = closeModal;
window.confirmDelete = confirmDelete;
window.showQuoteModal = showQuoteModal;