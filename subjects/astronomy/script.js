// 天文学页面交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面功能
    initializeAstronomyPage();
    
    // 添加交互效果
    addInteractiveEffects();
    
    // 添加星空动画
    createStarField();
});

function initializeAstronomyPage() {
    // 添加页面加载动画
    const cards = document.querySelectorAll('.topic-card, .tool-card');
    
    // 使用 Intersection Observer 实现滚动动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

function addInteractiveEffects() {
    // 主题卡片悬停效果
    const topicCards = document.querySelectorAll('.topic-card');
    
    topicCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // 添加悬停时的粒子效果
            createParticleEffect(this);
        });
        
        card.addEventListener('mouseleave', function() {
            // 清除粒子效果
            removeParticleEffect(this);
        });
        
        // 移动端触摸效果
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // 工具卡片点击效果
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 创建点击波纹效果
            createRippleEffect(e, this);
        });
    });
    
    // 特性标签动画
    const featureTags = document.querySelectorAll('.feature-tag');
    
    featureTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 0.1}s`;
        tag.classList.add('fade-in-tag');
    });
}

function createStarField() {
    // 创建动态星空背景
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    // 创建星星容器
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    starsContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
    `;
    
    heroSection.style.position = 'relative';
    heroSection.appendChild(starsContainer);
    
    // 创建星星
    for (let i = 0; i < 50; i++) {
        createStar(starsContainer);
    }
    
    // 创建流星
    setInterval(() => {
        if (Math.random() < 0.3) {
            createShootingStar(starsContainer);
        }
    }, 3000);
}

function createStar(container) {
    const star = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const opacity = Math.random() * 0.8 + 0.2;
    const duration = Math.random() * 3 + 2;
    
    star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: white;
        border-radius: 50%;
        opacity: ${opacity};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: twinkle ${duration}s infinite alternate;
        box-shadow: 0 0 ${size * 2}px rgba(255, 255, 255, 0.5);
    `;
    
    container.appendChild(star);
    
    // 添加闪烁动画
    if (!document.querySelector('#twinkle-keyframes')) {
        const style = document.createElement('style');
        style.id = 'twinkle-keyframes';
        style.textContent = `
            @keyframes twinkle {
                0% { opacity: 0.2; transform: scale(1); }
                100% { opacity: 1; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }
}

function createShootingStar(container) {
    const shootingStar = document.createElement('div');
    const startX = Math.random() * 100;
    const startY = Math.random() * 50;
    
    shootingStar.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: linear-gradient(45deg, white, transparent);
        left: ${startX}%;
        top: ${startY}%;
        opacity: 0;
        animation: shooting 2s linear forwards;
        box-shadow: 0 0 10px white, 0 0 20px white, 0 0 30px white;
    `;
    
    container.appendChild(shootingStar);
    
    // 添加流星动画
    if (!document.querySelector('#shooting-keyframes')) {
        const style = document.createElement('style');
        style.id = 'shooting-keyframes';
        style.textContent = `
            @keyframes shooting {
                0% {
                    opacity: 1;
                    transform: translateX(0) translateY(0) scale(1);
                }
                70% {
                    opacity: 1;
                    transform: translateX(300px) translateY(150px) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateX(400px) translateY(200px) scale(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 2秒后移除流星
    setTimeout(() => {
        if (shootingStar.parentNode) {
            shootingStar.parentNode.removeChild(shootingStar);
        }
    }, 2000);
}

function createParticleEffect(element) {
    const particles = document.createElement('div');
    particles.className = 'particle-effect';
    particles.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        border-radius: 15px;
    `;
    
    element.style.position = 'relative';
    element.appendChild(particles);
    
    // 创建粒子
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(67, 97, 238, 0.6);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float 2s ease-out forwards;
                pointer-events: none;
            `;
            
            particles.appendChild(particle);
            
            // 添加浮动动画
            if (!document.querySelector('#float-keyframes')) {
                const style = document.createElement('style');
                style.id = 'float-keyframes';
                style.textContent = `
                    @keyframes float {
                        0% {
                            opacity: 0;
                            transform: translateY(20px) scale(0);
                        }
                        50% {
                            opacity: 1;
                            transform: translateY(-10px) scale(1);
                        }
                        100% {
                            opacity: 0;
                            transform: translateY(-30px) scale(0);
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // 2秒后移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }, i * 100);
    }
}

function removeParticleEffect(element) {
    const particleEffect = element.querySelector('.particle-effect');
    if (particleEffect) {
        setTimeout(() => {
            if (particleEffect.parentNode) {
                particleEffect.parentNode.removeChild(particleEffect);
            }
        }, 500);
    }
}

function createRippleEffect(event, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(114, 9, 183, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // 添加波纹动画
    if (!document.querySelector('#ripple-keyframes')) {
        const style = document.createElement('style');
        style.id = 'ripple-keyframes';
        style.textContent = `
            @keyframes ripple {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 600ms后移除波纹
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// 响应式处理
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const cards = document.querySelectorAll('.topic-card, .tool-card');
    
    cards.forEach(card => {
        if (isMobile) {
            // 移动端优化
            card.style.transform = 'none';
            card.addEventListener('touchstart', handleTouchStart);
            card.addEventListener('touchend', handleTouchEnd);
        } else {
            // 桌面端恢复悬停效果
            card.removeEventListener('touchstart', handleTouchStart);
            card.removeEventListener('touchend', handleTouchEnd);
        }
    });
}

function handleTouchStart(e) {
    this.style.transform = 'scale(0.95)';
    this.style.transition = 'transform 0.1s ease';
}

function handleTouchEnd(e) {
    this.style.transform = 'scale(1)';
}

// 监听窗口大小变化
window.addEventListener('resize', handleResize);

// 页面可见性变化时的处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时暂停动画
        document.querySelectorAll('.stars-container').forEach(container => {
            container.style.animationPlayState = 'paused';
        });
    } else {
        // 页面显示时恢复动画
        document.querySelectorAll('.stars-container').forEach(container => {
            container.style.animationPlayState = 'running';
        });
    }
});

// 平滑滚动到锚点
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 导出函数供其他脚本使用
window.astronomyUtils = {
    createStarField,
    createParticleEffect,
    smoothScrollTo
}; 