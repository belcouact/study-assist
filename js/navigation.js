/**
 * Navigation functionality for Study Assistant
 */

// Initialize navigation features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
    setupSubjectNavigation();
    trackUserPath();
    setupScrollAnimation();
});

/**
 * Mobile menu toggle functionality
 */
function setupMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Toggle menu button appearance
            const bars = menuToggle.querySelectorAll('.bar');
            bars.forEach(bar => bar.classList.toggle('active'));
            
            // Toggle body scroll when menu is open
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = navLinks.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnToggle && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                // Reset menu button appearance
                const bars = menuToggle.querySelectorAll('.bar');
                bars.forEach(bar => bar.classList.remove('active'));
                
                // Re-enable body scroll
                document.body.classList.remove('menu-open');
            }
        });
    }
}

/**
 * Setup subject navigation highlighting
 */
function setupSubjectNavigation() {
    // Get current page path
    const currentPath = window.location.pathname;
    
    // Highlight active navigation link
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath || 
            currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
    
    // Subject tabs if present (in subject pages)
    const subjectTabs = document.querySelectorAll('.subject-tabs .tab');
    if (subjectTabs.length > 0) {
        // Set default active tab
        let activeTabFound = false;
        
        // Check URL hash for tab
        const hash = window.location.hash.substring(1);
        if (hash) {
            subjectTabs.forEach(tab => {
                if (tab.dataset.tab === hash) {
                    activateTab(tab);
                    activeTabFound = true;
                }
            });
        }
        
        // If no hash or matching tab found, activate first tab
        if (!activeTabFound) {
            activateTab(subjectTabs[0]);
        }
        
        // Add click handlers to tabs
        subjectTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                activateTab(this);
                
                // Update URL hash without scrolling
                const scrollPosition = window.scrollY;
                window.location.hash = this.dataset.tab;
                window.scrollTo(0, scrollPosition);
            });
        });
    }
    
    // Function to activate a tab
    function activateTab(tabElement) {
        // Deactivate all tabs
        subjectTabs.forEach(tab => {
            tab.classList.remove('active');
            document.getElementById(tab.dataset.tab).classList.remove('active');
        });
        
        // Activate selected tab
        tabElement.classList.add('active');
        document.getElementById(tabElement.dataset.tab).classList.add('active');
    }
}

/**
 * Track user navigation path in session storage
 */
function trackUserPath() {
    // Get current page
    const currentPage = {
        url: window.location.href,
        title: document.title,
        time: new Date().toISOString()
    };
    
    // Get existing path or initialize new array
    let navPath = JSON.parse(sessionStorage.getItem('navigationPath') || '[]');
    
    // Add current page to path if it's different from the last one
    if (navPath.length === 0 || navPath[navPath.length - 1].url !== currentPage.url) {
        navPath.push(currentPage);
        
        // Limit stored path to last 10 pages
        if (navPath.length > 10) {
            navPath = navPath.slice(navPath.length - 10);
        }
        
        // Save back to session storage
        sessionStorage.setItem('navigationPath', JSON.stringify(navPath));
    }
    
    // Update last activity timestamp
    sessionStorage.setItem('lastActivity', new Date().toISOString());
}

/**
 * Setup smooth scroll for anchor links
 */
function setupScrollAnimation() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Calculate header height for offset
                const headerHeight = document.querySelector('header').offsetHeight;
                
                // Smooth scroll to element with header offset
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight - 20,
                    behavior: 'smooth'
                });
                
                // Update URL hash without scrolling
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
}

/**
 * Handle back/forward navigation
 */
window.addEventListener('popstate', function() {
    // Check if there's a hash in the URL for tab navigation
    const hash = window.location.hash.substring(1);
    if (hash) {
        const tab = document.querySelector(`.subject-tabs .tab[data-tab="${hash}"]`);
        if (tab) {
            tab.click();
        }
    }
});

/**
 * Track session time and show inactivity warning
 */
let inactivityTimer;
const inactivityTimeout = 15 * 60 * 1000; // 15 minutes

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showInactivityWarning, inactivityTimeout);
}

function showInactivityWarning() {
    // Create or show inactivity warning modal
    let warningModal = document.getElementById('inactivity-warning');
    
    if (!warningModal) {
        warningModal = document.createElement('div');
        warningModal.id = 'inactivity-warning';
        warningModal.className = 'modal';
        warningModal.innerHTML = `
            <div class="modal-content">
                <h3>您还在吗？</h3>
                <p>我们注意到您已经有一段时间没有活动了。</p>
                <div class="modal-actions">
                    <button id="continue-session">继续学习</button>
                </div>
            </div>
        `;
        document.body.appendChild(warningModal);
        
        // Add continue button handler
        document.getElementById('continue-session').addEventListener('click', function() {
            warningModal.style.display = 'none';
            resetInactivityTimer();
        });
    } else {
        warningModal.style.display = 'block';
    }
}

// Reset inactivity timer on user activity
['click', 'touchstart', 'mousemove', 'keydown', 'scroll'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Initial timer start
resetInactivityTimer(); 