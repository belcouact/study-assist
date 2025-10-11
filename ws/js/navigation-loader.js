/**
 * Navigation Component Loader
 * This script provides functions to easily include the navigation component in any page
 */

// Function to load the navigation component
function loadNavigation() {
    // Create a container for the navigation
    const navContainer = document.createElement('div');
    navContainer.id = 'navigation-container';
    
    // Insert the navigation at the beginning of the body
    document.body.insertBefore(navContainer, document.body.firstChild);
    
    // Load the navigation HTML
    fetch('navigation.html')
        .then(response => response.text())
        .then(html => {
            // Extract only the navigation part from the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const navigationElement = doc.querySelector('.ws-navigation');
            
            if (navigationElement) {
                navContainer.innerHTML = '';
                navContainer.appendChild(navigationElement.cloneNode(true));
                
                // Also add the info modal
                const infoModal = doc.querySelector('.info-modal');
                if (infoModal) {
                    document.body.appendChild(infoModal.cloneNode(true));
                }
                
                // Re-initialize navigation event listeners
                initializeNavigationEvents();
                
                // Adjust body padding to account for fixed header
                document.body.style.paddingTop = '80px';
            }
        })
        .catch(error => {
            console.error('Error loading navigation:', error);
        });
}

// Function to initialize navigation event listeners
function initializeNavigationEvents() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                navMenu.classList.toggle('active');
            }
        });
    }
    
    // Click outside to close menu
    document.addEventListener('click', function(event) {
        const navMenu = document.getElementById('navMenu');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        if (mobileMenuToggle && navMenu && 
            !mobileMenuToggle.contains(event.target) && 
            navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });
    
    // Logout functionality
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Save current language setting
            const currentLang = localStorage.getItem('language') || 'zh';
            // Clear all session storage
            sessionStorage.clear();
            // Restore language setting
            localStorage.setItem('language', currentLang);
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
    
    // Info icon click
    const infoIcon = document.getElementById('infoIcon');
    if (infoIcon) {
        infoIcon.addEventListener('click', function() {
            const infoModal = document.getElementById('infoModal');
            if (infoModal) {
                infoModal.style.display = 'flex';
            }
        });
    }
    
    // Info modal close
    const infoModalClose = document.getElementById('infoModalClose');
    if (infoModalClose) {
        infoModalClose.addEventListener('click', function() {
            const infoModal = document.getElementById('infoModal');
            if (infoModal) {
                infoModal.style.display = 'none';
            }
        });
    }
    
    // Click outside modal to close
    window.addEventListener('click', function(event) {
        const infoModal = document.getElementById('infoModal');
        if (infoModal && event.target === infoModal) {
            infoModal.style.display = 'none';
        }
    });
    
    // Set active navigation
    setActiveNavigation();
    
    // Check login status
    checkLoginStatus();
}

// Function to set the active navigation link
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath) && linkPath !== '#') {
            link.classList.add('active');
        }
    });
}

// Function to check login status
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const logoutLink = document.getElementById('logoutLink');
    
    if (logoutLink) {
        if (isLoggedIn === 'true') {
            logoutLink.style.display = 'block';
        } else {
            logoutLink.style.display = 'none';
        }
    }
}

// Auto-load navigation when DOM is ready
document.addEventListener('DOMContentLoaded', loadNavigation);