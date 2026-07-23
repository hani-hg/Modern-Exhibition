function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        info: '#3b82f6'
    };

    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 28px;
        border-radius: 14px;
        color: #fff;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.5s ease;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        max-width: 420px;
        direction: rtl;
        background: ${colors[type] || '#3b82f6'};
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

window.showToast = showToast;