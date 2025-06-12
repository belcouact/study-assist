/**
 * Study Assist - Navigation JavaScript
 * Navigation functionality and scroll behavior
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation functionality
    initActiveNavLinks();
    initScrollBehavior();
    initFirstVisitPrompt();
});

/**
 * Initialize active state for navigation links based on current page or scroll position
 */
function initActiveNavLinks() {
    const navLinks = document.querySelectorAll('.main-nav a');
    
    // Get current page path
    const currentPath = window.location.pathname;
    
    // Check if we're on the homepage
    const isHomePage = currentPath === '/' || currentPath.endsWith('index.html');
    
    if (isHomePage) {
        // On homepage, highlight nav items based on scroll position
        updateActiveNavOnScroll(navLinks);
        
        // Update active link on scroll
        window.addEventListener('scroll', throttle(() => {
            updateActiveNavOnScroll(navLinks);
        }, 100));
    } else {
        // On other pages, highlight based on current URL
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            
            if (currentPath.includes(linkPath) && linkPath !== 'index.html' && linkPath !== '/') {
                setActiveNavLink(navLinks, link);
            }
        });
    }
}

/**
 * Update active navigation link based on scroll position
 * @param {NodeList} navLinks - The navigation links
 */
function updateActiveNavOnScroll(navLinks) {
    // Get all sections that have an ID defined
    const sections = document.querySelectorAll('section[id]');
    
    // Get current scroll position
    const scrollY = window.pageYOffset;
    
    // Find the current section
    let currentSection = null;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100; // Offset for header height
        const sectionHeight = section.offsetHeight;
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            currentSection = section;
        }
    });
    
    // If a current section is found, update the active link
    if (currentSection) {
        const sectionId = currentSection.getAttribute('id');
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            
            if (linkHref === `#${sectionId}`) {
                setActiveNavLink(navLinks, link);
            }
        });
    } else if (scrollY < 200) {
        // Near the top, set Home as active
        const homeLink = document.querySelector('.main-nav a[href="#"]') || 
                          document.querySelector('.main-nav a[href="index.html"]') ||
                          document.querySelector('.main-nav a[href="/"]');
                          
        if (homeLink) {
            setActiveNavLink(navLinks, homeLink);
        }
    }
}

/**
 * Set the active state for a navigation link
 * @param {NodeList} navLinks - All navigation links
 * @param {Element} activeLink - The link to set as active
 */
function setActiveNavLink(navLinks, activeLink) {
    // Remove active class from all links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to the current link
    activeLink.classList.add('active');
}

/**
 * Initialize scroll behavior for navigation
 */
function initScrollBehavior() {
    // Add sticky header behavior
    initStickyHeader();
}

/**
 * Initialize sticky header behavior
 */
function initStickyHeader() {
    const header = document.querySelector('.main-header');
    const headerHeight = header ? header.offsetHeight : 0;
    
    // Add scroll event listener
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > headerHeight) {
            header.classList.add('sticky-header');
        } else {
            header.classList.remove('sticky-header');
        }
    }, 100));
}

/**
 * Highlight the current navigation item if its page is active
 * @param {String} page - The page identifier
 */
function highlightNavItem(page) {
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const linkHref = link.getAttribute('href');
        if (linkHref.includes(page)) {
            link.classList.add('active');
        }
    });
}

/**
 * Navigate to a specific page
 * @param {String} page - The page URL
 * @param {Boolean} newTab - Whether to open in a new tab
 */
function navigateTo(page, newTab = false) {
    if (newTab) {
        window.open(page, '_blank');
    } else {
        window.location.href = page;
    }
}

/**
 * Navigate to a specific section on the current page
 * @param {String} sectionId - The section ID to navigate to
 */
function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    
    if (section) {
        // Close mobile menu if open
        document.body.classList.remove('mobile-menu-open');
        
        // Scroll to the section
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Update URL hash without jumping
        history.pushState(null, null, `#${sectionId}`);
    }
}

// Throttle function to limit execution frequency
function throttle(func, delay) {
    let lastCall = 0;
    
    return function(...args) {
        const now = new Date().getTime();
        
        if (now - lastCall < delay) {
            return;
        }
        
        lastCall = now;
        return func(...args);
    };
}

/**
 * Initialize the first visit prompt
 */
function initFirstVisitPrompt() {
    // Check if it's the first visit
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisited && window.location.pathname.endsWith('index.html')) {
        // Set the flag in localStorage
        localStorage.setItem('hasVisitedBefore', 'true');
        
        // Show profile selector if not set
        const selectedProfile = localStorage.getItem('selectedProfile');
        
        if (!selectedProfile) {
            setTimeout(() => {
                const profileBtn = document.getElementById('profile-button');
                if (profileBtn) {
                    profileBtn.click();
                }
            }, 1000);
        }
    }
}

/**
 * 导航菜单管理
 * 根据当前页面URL自动设置对应的菜单项为激活状态
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取当前页面的URL
    const currentUrl = window.location.pathname;
    const pageName = currentUrl.split('/').pop();
    
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('.main-nav a');
    
    // 移除所有现有的active类
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 根据当前页面设置对应的菜单项为active
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // 特殊处理首页
        if (pageName === '' || pageName === 'index.html') {
            if (linkHref === '#' || linkHref === 'index.html' || linkHref === './index.html') {
                link.classList.add('active');
            }
        } 
        // 处理其他页面
        else if (linkHref && linkHref.includes(pageName)) {
            link.classList.add('active');
        }
        // 处理科目页面
        else if (currentUrl.includes('subjects/') && linkHref === '#subjects') {
            link.classList.add('active');
        }
    });
    
    // 处理移动菜单
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const body = document.body;
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            body.classList.toggle('mobile-menu-open');
        });
    }
    
    // 处理下拉菜单在移动设备上的点击
    const dropdownLinks = document.querySelectorAll('.has-dropdown > a');
    
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 仅在移动视图下处理
            if (window.innerWidth <= 768) {
                e.preventDefault();
                this.parentNode.classList.toggle('open');
            }
        });
    });
}); 