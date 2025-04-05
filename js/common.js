/**
 * 学习助手 - 通用JavaScript功能
 * 包含工具函数和初始化逻辑
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
    handleScrollEffects();
    setupThemeToggle();
});

/**
 * 初始化提示工具
 */
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', (e) => {
            const tooltipText = e.target.getAttribute('data-tooltip');
            
            const tooltipElement = document.createElement('div');
            tooltipElement.classList.add('tooltip');
            tooltipElement.textContent = tooltipText;
            
            document.body.appendChild(tooltipElement);
            
            const rect = e.target.getBoundingClientRect();
            tooltipElement.style.left = rect.left + (rect.width / 2) - (tooltipElement.offsetWidth / 2) + 'px';
            tooltipElement.style.top = rect.bottom + 10 + 'px';
            
            setTimeout(() => {
                tooltipElement.classList.add('visible');
            }, 10);
        });
        
        tooltip.addEventListener('mouseleave', () => {
            const tooltipElement = document.querySelector('.tooltip');
            if (tooltipElement) {
                tooltipElement.classList.remove('visible');
                
                tooltipElement.addEventListener('transitionend', () => {
                    if (tooltipElement.parentNode) {
                        tooltipElement.parentNode.removeChild(tooltipElement);
                    }
                });
            }
        });
    });
}

/**
 * 处理滚动效果
 */
function handleScrollEffects() {
    // 滚动时导航栏阴影效果
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // 滚动显示元素动画
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
        checkVisibility();
        
        window.addEventListener('scroll', checkVisibility);
        
        function checkVisibility() {
            animatedElements.forEach(element => {
                if (isElementInViewport(element)) {
                    element.classList.add('visible');
                }
            });
        }
    }
}

/**
 * 检查元素是否在视口内
 * @param {Element} element - 要检查的DOM元素
 * @returns {boolean} - 元素是否在视口内
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0 &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.right >= 0
    );
}

/**
 * 设置主题切换功能
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        // 检查用户之前的主题选择
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeToggle.checked = savedTheme === 'dark';
        }
        
        themeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

/**
 * 显示消息通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 (success, error, info, warning)
 * @param {number} duration - 显示时长(毫秒)
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.textContent = message;
    
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    container.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    // 自动消失
    setTimeout(() => {
        notification.classList.remove('visible');
        notification.addEventListener('transitionend', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // 如果容器为空，也移除容器
            if (container.children.length === 0) {
                container.parentNode.removeChild(container);
            }
        });
    }, duration);
}

/**
 * 创建通知容器
 * @returns {Element} - 通知容器元素
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.classList.add('notification-container');
    document.body.appendChild(container);
    return container;
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间(毫秒)
 * @returns {Function} - 防抖后的函数
 */
function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制(毫秒)
 * @returns {Function} - 节流后的函数
 */
function throttle(func, limit = 300) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * 格式化日期
 * @param {Date|string} date - 日期对象或日期字符串
 * @param {string} format - 格式化模式
 * @returns {string} - 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
} 