/**
 * Study Assist - Navigation JavaScript
 * Navigation functionality and scroll behavior
 */

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check if we're on a page with navigation
        const hasNavigation = document.querySelector('.main-nav');
        
        if (hasNavigation) {
            // Initialize navigation functionality
            initActiveNavLinks();
            initScrollBehavior();
            initFirstVisitPrompt();
        } else {
            console.log('Navigation not found. Skipping navigation initialization.');
        }
    } catch (error) {
        console.error('Error initializing navigation:', error);
    }
});

/**
 * Initialize active state for navigation links based on current page or scroll position
 */
function initActiveNavLinks() {
    const navLinks = document.querySelectorAll('.main-nav a');
    
    if (navLinks.length === 0) {
        return; // No navigation links found
    }
    
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
            
            if (linkPath && currentPath.includes(linkPath) && linkPath !== 'index.html' && linkPath !== '/') {
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
    // Check if both parameters exist
    if (!navLinks || !activeLink) return;
    
    // Remove active class from all links
    navLinks.forEach(link => {
        if (link && link.classList) {
            link.classList.remove('active');
        }
    });
    
    // Add active class to the current link
    if (activeLink && activeLink.classList) {
        activeLink.classList.add('active');
    }
}

/**
 * Initialize scroll behavior for navigation
 */
function initScrollBehavior() {
    try {
        // Check if we're on a page where scroll behavior should be applied
        // Skip on utility pages 
        const currentPath = window.location.pathname;
        const isUtilityPage = currentPath.includes('tts_dialog') || 
                             currentPath.includes('draw') || 
                             currentPath.includes('admin');
        
        // Only add sticky header if relevant
        if (!isUtilityPage && document.querySelector('.main-header')) {
            initStickyHeader();
        }
        
        // Add scroll to top button on all pages
        initScrollToTopButton();
    } catch (error) {
        console.error('Error initializing scroll behavior:', error);
    }
}

/**
 * Initialize sticky header behavior
 */
function initStickyHeader() {
    const header = document.querySelector('.main-header');
    
    if (!header) {
        return; // No header found
    }
    
    const headerHeight = header.offsetHeight;
    
    // Add scroll event listener with additional null check for header
    window.addEventListener('scroll', throttle(() => {
        // Additional check to ensure header still exists when scroll event fires
        if (!document.querySelector('.main-header')) return;
        
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
    try {
        // Create the scroll to top button if it doesn't exist
        let scrollTopBtn = document.querySelector('.scroll-top-btn');
        
        if (!scrollTopBtn) {
            scrollTopBtn = document.createElement('button');
            scrollTopBtn.className = 'scroll-top-btn';
            scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
            scrollTopBtn.innerHTML = '<i class="arrow-up"></i>';
            
            // Make sure document.body exists before appending
            if (document.body) {
                document.body.appendChild(scrollTopBtn);
            } else {
                console.warn('Document body not found, cannot append scroll-to-top button');
                return;
            }
            
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
            try {
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
                if (document.head) {
                    document.head.appendChild(arrowStyle);
                }
            } catch (e) {
                console.error('Could not create arrow style:', e);
            }
        }
        
        // Show/hide the button based on scroll position - ensure button still exists
        const scrollHandler = throttle(() => {
            // Verify the button still exists in the DOM
            const btn = document.querySelector('.scroll-top-btn');
            if (!btn) return;
            
            if (window.scrollY > 300) {
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
            } else {
                btn.style.opacity = '0';
                btn.style.visibility = 'hidden';
            }
        }, 100);
        
        window.addEventListener('scroll', scrollHandler);
        
        // Scroll to top when clicked
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } catch (error) {
        console.error('Error initializing scroll-to-top button:', error);
    }
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
    try {
        // Check if we're on a page where this is relevant
        // Skip this on utility pages like tts_dialog, draw, etc.
        const currentPath = window.location.pathname;
        if (currentPath.includes('tts_dialog') || 
            currentPath.includes('draw') || 
            currentPath.includes('admin')) {
            return;
        }
        
        // Check if this is the first visit
        const hasVisited = localStorage.getItem('hasVisitedBefore');
        
        if (!hasVisited) {
            // Set the flag for future visits
            localStorage.setItem('hasVisitedBefore', 'true');
            
            // Check if profile is already set
            const profile = localStorage.getItem('educationalProfile');
            
            // If profile is not set, show the modal after a short delay
            if (!profile && typeof showProfileModal === 'function') {
                setTimeout(() => {
                    showProfileModal();
                }, 1500); // Short delay to allow page to load completely
            }
        }
    } catch (error) {
        console.error('Error in initFirstVisitPrompt:', error);
    }
} 