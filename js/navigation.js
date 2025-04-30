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
    
    // Add scroll to top button
    initScrollToTopButton();
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
 * Initialize scroll to top button
 */
function initScrollToTopButton() {
    // Create the scroll to top button if it doesn't exist
    let scrollTopBtn = document.querySelector('.scroll-top-btn');
    
    if (!scrollTopBtn) {
        scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-top-btn';
        scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
        scrollTopBtn.innerHTML = '<i class="arrow-up"></i>';
        document.body.appendChild(scrollTopBtn);
        
        // Style the button with CSS
        scrollTopBtn.style.position = 'fixed';
        scrollTopBtn.style.bottom = '20px';
        scrollTopBtn.style.right = '20px';
        scrollTopBtn.style.width = '40px';
        scrollTopBtn.style.height = '40px';
        scrollTopBtn.style.borderRadius = '50%';
        scrollTopBtn.style.backgroundColor = 'var(--primary-color)';
        scrollTopBtn.style.color = 'white';
        scrollTopBtn.style.border = 'none';
        scrollTopBtn.style.boxShadow = 'var(--shadow-md)';
        scrollTopBtn.style.cursor = 'pointer';
        scrollTopBtn.style.opacity = '0';
        scrollTopBtn.style.visibility = 'hidden';
        scrollTopBtn.style.transition = 'opacity 0.3s, visibility 0.3s';
        scrollTopBtn.style.zIndex = '999';
        scrollTopBtn.style.display = 'flex';
        scrollTopBtn.style.alignItems = 'center';
        scrollTopBtn.style.justifyContent = 'center';
        
        // Create arrow icon
        const arrowStyle = document.createElement('style');
        arrowStyle.textContent = `
            .arrow-up {
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-bottom: 12px solid white;
                display: block;
            }
        `;
        document.head.appendChild(arrowStyle);
    }
    
    // Show/hide the button based on scroll position
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    }, 100));
    
    // Scroll to top when clicked
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
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
        
        // Update active nav link
        const navLinks = document.querySelectorAll('.main-nav a');
        const targetLink = document.querySelector(`.main-nav a[href="#${sectionId}"]`);
        
        if (targetLink) {
            setActiveNavLink(navLinks, targetLink);
        }
    }
}

// Initialize first-time visit profile prompt
function initFirstVisitPrompt() {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisited) {
        // Set the flag for future visits
        localStorage.setItem('hasVisitedBefore', 'true');
        
        // Check if profile is already set
        const profile = localStorage.getItem('educationalProfile');
        
        // If profile is not set, show the modal after a short delay
        if (!profile) {
            setTimeout(() => {
                // Check if the profile modal function exists and call it
                if (typeof showProfileModal === 'function') {
                    showProfileModal();
                }
            }, 1500); // Short delay to allow page to load completely
        }
    }
} 