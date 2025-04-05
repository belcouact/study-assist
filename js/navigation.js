/**
 * 学习助手 - 导航控制
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航
    initNavigation();

    // 初始化滚动效果
    initScrollEffects();

    // 初始化移动端菜单
    initMobileMenu();
});

/**
 * 初始化导航
 */
function initNavigation() {
    // 获取当前页面URL路径
    const currentPath = window.location.pathname;
    
    // 设置当前活跃导航项
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // 检查当前URL是否包含导航链接的路径
        if (currentPath.includes(linkPath) && linkPath !== '/') {
            link.classList.add('active');
        } else if (currentPath === '/' && linkPath === '/') {
            link.classList.add('active');
        }
        
        // 添加点击动画效果
        link.addEventListener('click', function(e) {
            // 如果是同一页面内的锚点链接，添加平滑滚动
            if (linkPath.startsWith('#') && document.querySelector(linkPath)) {
                e.preventDefault();
                document.querySelector(linkPath).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 处理返回顶部按钮
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * 初始化滚动效果
 */
function initScrollEffects() {
    // 处理滚动时的导航栏变化
    let lastScrollTop = 0;
    const header = document.querySelector('.main-header');
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (!header) return;
    
    window.addEventListener('scroll', throttle(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 导航栏缩小效果
        if (scrollTop > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
        
        // 向下滚动时隐藏导航栏，向上滚动时显示
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        
        // 显示/隐藏返回顶部按钮
        if (backToTopBtn) {
            if (scrollTop > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
        
        lastScrollTop = scrollTop;
    }, 100));

    // 添加滚动位置指示器
    const progressIndicator = document.querySelector('.scroll-progress');
    if (progressIndicator) {
        window.addEventListener('scroll', throttle(function() {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            progressIndicator.style.width = scrolled + '%';
        }, 10));
    }
}

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!menuToggle || !mobileMenu) return;
    
    // 切换菜单显示/隐藏
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // 点击移动端菜单中的链接时关闭菜单
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // 点击页面其他地方关闭菜单
    document.addEventListener('click', function(event) {
        if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target) && mobileMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

/**
 * 创建面包屑导航
 * @param {Array} pathSegments - 路径段数组，每个元素包含 {name, url}
 * @param {HTMLElement} container - 放置面包屑的容器元素
 */
function createBreadcrumbs(pathSegments, container) {
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建首页链接
    const homeItem = document.createElement('li');
    homeItem.className = 'breadcrumb-item';
    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.textContent = '首页';
    homeItem.appendChild(homeLink);
    container.appendChild(homeItem);
    
    // 添加其他路径段
    pathSegments.forEach((segment, index) => {
        const item = document.createElement('li');
        item.className = 'breadcrumb-item';
        
        // 最后一个项目不需要链接
        if (index === pathSegments.length - 1) {
            item.classList.add('active');
            item.textContent = segment.name;
        } else {
            const link = document.createElement('a');
            link.href = segment.url;
            link.textContent = segment.name;
            item.appendChild(link);
        }
        
        container.appendChild(item);
    });
}

/**
 * 根据当前URL生成并显示面包屑导航
 * @param {HTMLElement} container - 放置面包屑的容器元素
 */
function showBreadcrumbsFromUrl(container) {
    if (!container) return;
    
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment !== '');
    
    const breadcrumbSegments = [];
    let currentPath = '';
    
    segments.forEach(segment => {
        currentPath += '/' + segment;
        
        // 格式化显示名称（将短横线转换为空格，首字母大写）
        let displayName = segment.replace(/-/g, ' ');
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        
        breadcrumbSegments.push({
            name: displayName,
            url: currentPath
        });
    });
    
    createBreadcrumbs(breadcrumbSegments, container);
} 