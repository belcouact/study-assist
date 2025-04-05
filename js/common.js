/**
 * Common JavaScript functions for Study Assistant
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    setupAccessibility();
    initializeAIChat();
});

/**
 * Initialize theme settings (light/dark mode)
 */
function initializeTheme() {
    // Check for user preference in local storage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply theme based on saved preference or system setting
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
    }
    
    // Add theme toggle if it exists
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            // Save preference to local storage
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
}

/**
 * Setup accessibility features
 */
function setupAccessibility() {
    // Font size controls
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');
    const resetFontBtn = document.getElementById('reset-font');
    
    // Track font size changes
    let fontSizeLevel = parseInt(localStorage.getItem('fontSizeLevel') || '0');
    
    // Apply stored font size
    if (fontSizeLevel !== 0) {
        document.body.style.fontSize = `${100 + fontSizeLevel * 10}%`;
    }
    
    // Setup font size buttons if they exist
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', function() {
            if (fontSizeLevel < 5) {
                fontSizeLevel++;
                updateFontSize();
            }
        });
    }
    
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', function() {
            if (fontSizeLevel > -2) {
                fontSizeLevel--;
                updateFontSize();
            }
        });
    }
    
    if (resetFontBtn) {
        resetFontBtn.addEventListener('click', function() {
            fontSizeLevel = 0;
            updateFontSize();
        });
    }
    
    // Helper to update font size
    function updateFontSize() {
        document.body.style.fontSize = `${100 + fontSizeLevel * 10}%`;
        localStorage.setItem('fontSizeLevel', fontSizeLevel.toString());
    }
}

/**
 * Initialize AI chat assistant
 */
function initializeAIChat() {
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatMessages = document.getElementById('ai-chat-messages');
    
    if (chatForm && chatInput && chatMessages) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                // Add user message to chat
                addMessageToChat('user', userMessage);
                
                // Clear input
                chatInput.value = '';
                
                // Process with AI and get response
                processUserMessage(userMessage);
            }
        });
    }
    
    // Add message to chat window
    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        
        // Format message - simple markdown-like processing
        let formattedMessage = message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic text
            .replace(/\n/g, '<br>');                           // Line breaks
        
        messageElement.innerHTML = `
            <div class="message-sender">${sender === 'user' ? '你：' : 'AI助手：'}</div>
            <div class="message-content">${formattedMessage}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Process user message and get AI response
    function processUserMessage(message) {
        // Show loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('chat-message', 'ai-message', 'loading-message');
        loadingElement.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(loadingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // In a real implementation, you would call an AI API here
        // For this demo, we'll use a timeout to simulate API call
        setTimeout(() => {
            // Remove loading indicator
            chatMessages.removeChild(loadingElement);
            
            // Add AI response
            const aiResponse = generateDummyResponse(message);
            addMessageToChat('ai', aiResponse);
        }, 1000);
    }
    
    // Generate a dummy response for demo purposes
    function generateDummyResponse(message) {
        // This would be replaced with actual AI API call
        if (message.includes('你好') || message.includes('hello') || message.includes('嗨')) {
            return '你好！我是你的AI学习助手。我可以帮助你解答问题、进行测验或提供学习建议。请告诉我你需要什么帮助？';
        } else if (message.includes('数学') || message.includes('计算') || message.includes('公式')) {
            return '数学是我的强项！我可以帮你解答数学问题，解释概念，或者帮你进行计算。需要我演示一下吗？';
        } else if (message.includes('英语') || message.includes('单词') || message.includes('语法')) {
            return '英语学习需要练习和耐心。我可以帮你解释语法规则、单词含义，或者进行简单的对话练习。你想从哪方面开始？';
        } else if (message.includes('历史') || message.includes('事件')) {
            return '了解历史可以帮助我们理解现在。请告诉我你对哪个历史时期或事件感兴趣，我会尽我所能提供信息。';
        } else if (message.includes('测验') || message.includes('测试') || message.includes('练习')) {
            return '练习是提高学习效果的好方法！我可以根据你学习的内容创建一个小测验。你想测试哪个学科的知识？';
        } else {
            return '谢谢你的提问！我是一个学习助手，可以帮助你解答学科问题、提供学习建议或进行测验。请告诉我更多关于你需要帮助的内容。';
        }
    }
}

/**
 * Utility functions
 */

// Debounce function to limit how often a function can run
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Save user progress to local storage
function saveUserProgress(subject, topic, progress) {
    // Get existing progress or initialize new object
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    
    // Initialize subject if it doesn't exist
    if (!userProgress[subject]) {
        userProgress[subject] = {};
    }
    
    // Save progress for topic
    userProgress[subject][topic] = progress;
    
    // Store back in local storage
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
}

// Get user progress from local storage
function getUserProgress(subject, topic) {
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    
    if (subject && topic) {
        return userProgress[subject]?.[topic] || 0;
    } else if (subject) {
        return userProgress[subject] || {};
    } else {
        return userProgress;
    }
}

// Format date for display
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('zh-CN', options);
} 