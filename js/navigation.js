/**
 * 学习助手 - 导航功能
 * 处理导航菜单和页面跳转相关功能
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileNavigation();
    highlightCurrentPage();
    setupSmoothScrolling();
});

/**
 * 初始化移动端导航
 */
function initMobileNavigation() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuButton && mainNav) {
        mobileMenuButton.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-open');
            mobileMenuButton.setAttribute(
                'aria-expanded',
                mobileMenuButton.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });
        
        // 点击导航链接后关闭菜单
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('mobile-open');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            });
        });
        
        // 点击外部区域关闭菜单
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mainNav.classList.remove('mobile-open');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/**
 * 高亮显示当前页面对应的导航项
 */
function highlightCurrentPage() {
    const navLinks = document.querySelectorAll('.main-nav a');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        // 移除所有active类
        link.classList.remove('active');
        
        // 获取链接路径
        const linkPath = new URL(link.href, window.location.origin).pathname;
        
        // 首页特殊处理
        if (currentPath === '/' || currentPath === '/index.html') {
            if (linkPath === '/' || linkPath === '/index.html') {
                link.classList.add('active');
            }
        } 
        // 子页面处理
        else if (currentPath.includes(linkPath) && linkPath !== '/' && linkPath !== '/index.html') {
            link.classList.add('active');
        }
    });
}

/**
 * 设置平滑滚动
 */
function setupSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // 获取目标元素
            const targetId = link.getAttribute('href').substring(1);
            if (!targetId) return; // 空锚点，不处理
            
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // 计算滚动位置，考虑固定导航栏的高度
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                // 平滑滚动
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 更新URL
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
}

/**
 * 打开子菜单
 */
function setupSubmenus() {
    const submenuTriggers = document.querySelectorAll('.has-submenu');
    
    submenuTriggers.forEach(trigger => {
        const submenu = trigger.querySelector('.submenu');
        
        if (submenu) {
            // 鼠标悬停打开子菜单
            trigger.addEventListener('mouseenter', () => {
                closeAllSubmenus();
                submenu.classList.add('submenu-open');
            });
            
            // 鼠标离开关闭子菜单
            trigger.addEventListener('mouseleave', () => {
                submenu.classList.remove('submenu-open');
            });
            
            // 点击切换子菜单（移动端）
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth < 768) {
                    if (!submenu.contains(e.target) && e.target !== submenu) {
                        e.preventDefault();
                        const isOpen = submenu.classList.contains('submenu-open');
                        
                        closeAllSubmenus();
                        
                        if (!isOpen) {
                            submenu.classList.add('submenu-open');
                        }
                    }
                }
            });
        }
    });
    
    // 关闭所有子菜单
    function closeAllSubmenus() {
        const openSubmenus = document.querySelectorAll('.submenu.submenu-open');
        openSubmenus.forEach(menu => {
            menu.classList.remove('submenu-open');
        });
    }
}

/**
 * 返回顶部按钮
 */
function setupBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        // 滚动时显示/隐藏按钮
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // 点击返回顶部
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * 页面切换动画
 */
function setupPageTransitions() {
    document.addEventListener('click', (e) => {
        // 检查是否点击了导航链接（排除锚点链接和外部链接）
        const link = e.target.closest('a');
        
        if (link && 
            !link.getAttribute('href').startsWith('#') && 
            link.hostname === window.location.hostname) {
            
            e.preventDefault();
            
            // 添加离开动画
            document.body.classList.add('page-transition-out');
            
            // 等待动画完成后跳转
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        }
    });
    
    // 页面加载时的进入动画
    window.addEventListener('pageshow', () => {
        document.body.classList.add('page-transition-in');
        
        setTimeout(() => {
            document.body.classList.remove('page-transition-in');
        }, 500);
    });
} 