// js/toast.js

function showToast(message, type = 'info') {
    // إزالة أي إشعار سابق
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    // إنشاء الإشعار
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
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