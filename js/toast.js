// js/toast.js

function showToast(message, type = 'info') {
    // إزالة أي إشعار سابق
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    // إنشاء الإشعار
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // تنسيقات إضافية
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 9999;
        animation: slideIn 0.5s ease;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 400px;
        direction: rtl;
    `;
    
    document.body.appendChild(toast);
    
    // اختفاء تلقائي
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// دالة للاختبار
function testToast() {
    showToast('✅ هذا إشعار تجريبي!', 'success');
}

// تصدير للاستخدام العالمي
window.showToast = showToast;
window.testToast = testToast;
