/**
 * Study Assist - Common JavaScript
 * Global utilities and initializations
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initMobileMenu();
    initSmoothScroll();
    initSliders();
    initAnimations();
    initFirstVisitPrompt();
    initChat();
});

/**
 * Initialize Mobile Menu Toggle
 */
function initMobileMenu() {
    console.log('Initializing mobile menu from common.js');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (menuToggle) {
        console.log('Mobile menu toggle found');
        // Remove any existing event listeners by cloning the element
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
        
        newMenuToggle.addEventListener('click', (e) => {
            console.log('Mobile menu toggle clicked');
            e.preventDefault();
            e.stopPropagation();
            document.body.classList.toggle('mobile-menu-open');
            console.log('Mobile menu state:', document.body.classList.contains('mobile-menu-open'));
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = event.target.closest('.main-nav') || 
                                    event.target.closest('.mobile-menu-toggle');
            
            if (!isClickInsideMenu && document.body.classList.contains('mobile-menu-open')) {
                console.log('Closing mobile menu - clicked outside');
                document.body.classList.remove('mobile-menu-open');
            }
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                console.log('Closing mobile menu - link clicked');
                document.body.classList.remove('mobile-menu-open');
            });
        });
    } else {
        console.error('Mobile menu toggle not found!');
    }
}

/**
 * Initialize Smooth Scrolling for Anchor Links
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                document.body.classList.remove('mobile-menu-open');
                
                // Scroll to element
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL hash without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
}

/**
 * Initialize Sliders
 */
function initSliders() {
    // Testimonials Slider
    initTestimonialsSlider();
}

/**
 * Initialize Testimonials Slider
 */
function initTestimonialsSlider() {
    const slider = document.querySelector('.testimonials-slider');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slider && dots.length && prevBtn && nextBtn) {
        let currentSlide = 0;
        const slides = slider.querySelectorAll('.testimonial-card');
        const maxSlide = slides.length - 1;
        
        // Function to go to a specific slide
        const goToSlide = (slideIndex) => {
            // Ensure slide index is within bounds
            if (slideIndex < 0) slideIndex = maxSlide;
            if (slideIndex > maxSlide) slideIndex = 0;
            
            currentSlide = slideIndex;
            
            // Update slider position
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update active dot
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        };
        
        // Set up click handlers for prev/next buttons
        prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
        
        // Set up click handlers for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
        
        // Initialize first slide
        goToSlide(0);
        
        // Auto-play functionality
        let slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
        
        // Pause auto-play on hover
        slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slider.addEventListener('mouseleave', () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
        });
    }
}

/**
 * Initialize On-Scroll Animations
 */
function initAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
    if (animatedElements.length) {
        const checkVisibility = function() {
            animatedElements.forEach(element => {
                const position = element.getBoundingClientRect();
                
                // If element is in viewport
                if (position.top < window.innerHeight && position.bottom >= 0) {
                    element.classList.add('visible');
                }
            });
        };
        
        // Initial check
        checkVisibility();
        
        // Check on scroll
        window.addEventListener('scroll', checkVisibility);
    }
}

/**
 * Utility Functions
 */

/**
 * Throttle function to limit how often a function can be called
 * @param {Function} func - The function to throttle
 * @param {Number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
function throttle(func, limit) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

/**
 * Debounce function to delay function execution until after a wait period
 * @param {Function} func - The function to debounce
 * @param {Number} wait - The wait time in milliseconds
 * @param {Boolean} immediate - Whether to call immediately
 * @returns {Function} - The debounced function
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Format date to a readable string
 * @param {Date|String} date - The date to format
 * @returns {String} - The formatted date string
 */
function formatDate(date) {
    date = new Date(date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

/**
 * Validate email format
 * @param {String} email - The email to validate
 * @returns {Boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Generate a random ID
 * @returns {String} - A random ID
 */
function generateId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get cookie value by name
 * @param {String} name - The cookie name
 * @returns {String|null} - The cookie value or null
 */
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

/**
 * Set cookie
 * @param {String} name - The cookie name
 * @param {String} value - The cookie value
 * @param {Number} days - Number of days until expiration
 */
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict`;
}

/**
 * Delete cookie
 * @param {String} name - The cookie name
 */
function deleteCookie(name) {
    setCookie(name, '', -1);
}

// Initialize first-time visit profile prompt
function initFirstVisitPrompt() {
    if (!localStorage.getItem('visited')) {
        const promptElement = document.querySelector('.first-visit-prompt');
        
        if (promptElement) {
            promptElement.classList.add('show');
            
            const closeButton = promptElement.querySelector('.close-prompt');
    
            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    promptElement.classList.remove('show');
                    localStorage.setItem('visited', 'true');
                });
            }
        }
        
        localStorage.setItem('visited', 'true');
    }
}

// Common script for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if the chat modal script is already loaded
    if (typeof initializeChatWithFloatingButton === 'undefined') {
        // Load the chat-modal.js script dynamically
        const script = document.createElement('script');
        script.src = '/js/chat-modal.js';
        script.onload = function() {
            // Initialize chat once the script is loaded
            if (typeof initializeChatWithFloatingButton === 'function') {
                initializeChatWithFloatingButton();
            }
        };
        document.head.appendChild(script);
    } else {
        // If already loaded, just initialize the chat
        initializeChatWithFloatingButton();
    }
    
    // Add event listeners to all chat buttons
    document.querySelectorAll('.chat-ai-btn').forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof openChatModal === 'function') {
                openChatModal();
                }
        });
    });
});

// Function to get the base URL for relative paths
function getBaseUrl() {
    // Get the base URL from the current path
    const pathSegments = window.location.pathname.split('/');
    const depth = pathSegments.length - 1;
    
    // If we're at root, return empty string, otherwise build relative path to root
    if (depth <= 1) {
        return '';
    } else {
        return Array(depth).join('../');
    }
}

/**
 * Initialize Chat Functionality
 * This function is needed for the chat feature to work properly
 */
function initChat() {
    // This is a placeholder that will be replaced by the functionality in chat-init.js
    // We define it here to prevent the ReferenceError
    console.log('Chat initialization placeholder from common.js');
    
    // Check if we have the actual implementation available
    if (typeof initializeChatWithFloatingButton === 'function') {
        initializeChatWithFloatingButton();
    }
} 