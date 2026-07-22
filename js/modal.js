// js/modal.js

// ===== عرض نافذة طلب عرض السعر =====
function showQuoteModal(product, onSend) {
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal-box">
            <h2>📞 طلب عرض سعر</h2>
            <form id="quoteForm">
                <div class="form-group">
                    <label>اسمك *</label>
                    <input type="text" id="quoteName" required placeholder="أدخل اسمك">
                </div>
                <div class="form-group">
                    <label>رقم الهاتف *</label>
                    <input type="tel" id="quotePhone" required placeholder="أدخل رقم هاتفك">
                </div>
                <div class="form-group">
                    <label>رسالة</label>
                    <textarea id="quoteMessage" rows="3" placeholder="أي تفاصيل إضافية...">أريد عرض سعر لمنتج: ${product.title} ($${product.price})</textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel-modal" onclick="closeModal()">إلغاء</button>
                    <button type="submit" class="btn-confirm">تأكيد الطلب</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('quoteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('quoteName').value.trim();
        const phone = document.getElementById('quotePhone').value.trim();
        const message = document.getElementById('quoteMessage').value.trim();

        if (!name) { showToast('❌ يرجى إدخال اسمك', 'error'); return; }
        if (!phone) { showToast('❌ يرجى إدخال رقم الهاتف', 'error'); return; }

        onSend({ name, phone, message });
        closeModal();
    });
}

// ===== إغلاق النافذة =====
function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.remove();
}

// تصدير للاستخدام العالمي
window.showQuoteModal = showQuoteModal;
window.closeModal = closeModal;