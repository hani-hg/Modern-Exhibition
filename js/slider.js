// js/slider.js

let sliderInterval = null;
let currentSlide = 0;

// ===== إنشاء سلايدر =====
function createSlider(images, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // بناء السلايدر
    container.innerHTML = `
        <div class="slider-container" style="position:relative;overflow:hidden;border-radius:16px;">
            <div class="slider-track" style="display:flex;transition:transform 0.5s ease;">
                ${images.map(img => `
                    <div class="slider-slide" style="min-width:100%;height:400px;">
                        <img src="${img}" style="width:100%;height:100%;object-fit:cover;">
                    </div>
                `).join('')}
            </div>
            
            ${images.length > 1 ? `
                <button class="slider-btn prev" onclick="slidePrev('${containerId}')" style="position:absolute;left:20px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;width:50px;height:50px;font-size:24px;cursor:pointer;z-index:10;transition:0.3s;">
                    ❮
                </button>
                <button class="slider-btn next" onclick="slideNext('${containerId}')" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;width:50px;height:50px;font-size:24px;cursor:pointer;z-index:10;transition:0.3s;">
                    ❯
                </button>
                
                <div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:10;">
                    ${images.map((_, i) => `
                        <div class="slider-dot" onclick="goToSlide(${i}, '${containerId}')" 
                             style="width:12px;height:12px;border-radius:50%;background:${i === 0 ? 'white' : 'rgba(255,255,255,0.5)'};cursor:pointer;transition:0.3s;">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    // إضافة تأثيرات hover للأزرار
    document.querySelectorAll('.slider-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(0,0,0,0.8)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(0,0,0,0.5)';
        });
    });
    
    // بدء التشغيل التلقائي
    if (images.length > 1) {
        startAutoSlide(containerId);
    }
}

// ===== السلايدر التالي =====
function slideNext(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const track = container.querySelector('.slider-track');
    const slides = track.querySelectorAll('.slider-slide');
    const total = slides.length;
    
    currentSlide = (currentSlide + 1) % total;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // تحديث النقاط
    updateDots(containerId);
}

// ===== السلايدر السابق =====
function slidePrev(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const track = container.querySelector('.slider-track');
    const slides = track.querySelectorAll('.slider-slide');
    const total = slides.length;
    
    currentSlide = (currentSlide - 1 + total) % total;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    updateDots(containerId);
}

// ===== الانتقال إلى شريحة معينة =====
function goToSlide(index, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const track = container.querySelector('.slider-track');
    const slides = track.querySelectorAll('.slider-slide');
    const total = slides.length;
    
    if (index < 0 || index >= total) return;
    
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    updateDots(containerId);
}

// ===== تحديث النقاط =====
function updateDots(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const dots = container.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
        dot.style.background = i === currentSlide ? 'white' : 'rgba(255,255,255,0.5)';
    });
}

// ===== التشغيل التلقائي =====
function startAutoSlide(containerId) {
    if (sliderInterval) clearInterval(sliderInterval);
    
    sliderInterval = setInterval(() => {
        slideNext(containerId);
    }, 4000);
}

// ===== إيقاف التشغيل التلقائي =====
function stopAutoSlide() {
    if (sliderInterval) {
        clearInterval(sliderInterval);
        sliderInterval = null;
    }
}

// ===== إعادة تعيين السلايدر =====
function resetSlider(containerId) {
    stopAutoSlide();
    currentSlide = 0;
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const track = container.querySelector('.slider-track');
    if (track) {
        track.style.transform = 'translateX(0)';
    }
    
    updateDots(containerId);
    startAutoSlide(containerId);
}

// ===== تصدير للاستخدام العالمي =====
window.createSlider = createSlider;
window.slideNext = slideNext;
window.slidePrev = slidePrev;
window.goToSlide = goToSlide;
window.startAutoSlide = startAutoSlide;
window.stopAutoSlide = stopAutoSlide;
window.resetSlider = resetSlider;