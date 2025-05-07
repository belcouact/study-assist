// Chat functionality initialization for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if the chat modal script is already loaded
    if (typeof initializeChatWithFloatingButton === 'undefined') {
        // Load the chat-modal.js script dynamically
        const script = document.createElement('script');
        
        // Get the correct path to the script based on the page depth
        const baseUrl = getBaseUrl();
        script.src = baseUrl + 'js/chat-modal.js';
        
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
        let path = '';
        for (let i = 1; i < depth; i++) {
            path += '../';
        }
        return path;
    }
} 