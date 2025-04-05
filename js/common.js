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
});

/**
 * Initialize Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('mobile-menu-open');
            
            // Accessibility
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = event.target.closest('.main-nav') || 
                                     event.target.closest('.mobile-menu-toggle');
            
            if (!isClickInsideMenu && document.body.classList.contains('mobile-menu-open')) {
                document.body.classList.remove('mobile-menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
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
    // Only initialize if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Optionally stop observing after animation is triggered
                    // animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Trigger when at least 10% of the element is visible
        });
        
        animatedElements.forEach(element => {
            animationObserver.observe(element);
        });
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