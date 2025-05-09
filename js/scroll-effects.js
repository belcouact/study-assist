// Scroll animation effects for index.html

document.addEventListener('DOMContentLoaded', function() {
    // Add scroll-animation class to elements we want to animate
    const elementsToAnimate = [
        '.section-header',
        '.subjects-grid',
        '.features-grid',
        '.about-cards',
        '.about-card',
        '.feature-card',
        '.subject-card'
    ];
    
    elementsToAnimate.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.classList.add('scroll-animation');
        });
    });
    
    // Apply animation delay to grid items
    const grids = {
        '.subjects-grid': '.subject-card',
        '.features-grid': '.feature-card',
        '.about-cards': '.about-card'
    };
    
    Object.entries(grids).forEach(([gridSelector, itemSelector]) => {
        const grid = document.querySelector(gridSelector);
        if (grid) {
            const items = grid.querySelectorAll(itemSelector);
            items.forEach((item, index) => {
                item.style.setProperty('--item-index', index);
            });
        }
    });
    
    // Function to check if element is in viewport
    function isInViewport(element, offset = 100) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight - offset) &&
            rect.bottom >= offset
        );
    }
    
    // Handle scrolling effects
    function handleScrollAnimations() {
        // Animate elements when they enter viewport
        document.querySelectorAll('.scroll-animation').forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('animated');
            }
        });
        
        // Parallax effect for hero shapes
        const shapes = document.querySelectorAll('.hero-shape');
        const scrollPosition = window.pageYOffset;
        
        shapes.forEach((shape, index) => {
            // Different speeds for different shapes
            const speed = 0.1 + (index * 0.05);
            const yPos = -scrollPosition * speed;
            shape.style.transform = `translateY(${yPos}px)`;
        });
        
        // Parallax effect for section backgrounds
        const sections = document.querySelectorAll('.subjects-section, .features-section, .about-section');
        sections.forEach((section) => {
            if (isInViewport(section, -100)) {
                const rect = section.getBoundingClientRect();
                const scrollPercent = (rect.top / window.innerHeight);
                section.style.backgroundPosition = `center ${50 + (scrollPercent * 20)}%`;
            }
        });
    }
    
    // Interactive 3D tilt effect for cards
    document.querySelectorAll('.subject-card, .feature-card, .about-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top; // y position within the element
            
            // Calculate rotation based on mouse position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Initialize animations on load
    handleScrollAnimations();
    
    // Update animations on scroll
    window.addEventListener('scroll', handleScrollAnimations);
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                document.body.classList.remove('mobile-menu-open');
            }
        });
    });
}); 