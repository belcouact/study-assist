// Chat modal functionality for Study Assistant
document.addEventListener('DOMContentLoaded', function() {
    // Create the modal elements if they don't exist
    if (!document.getElementById('aiChatModal')) {
        createChatModal();
    }

    // Add event listener to toggle button if it exists
    const chatButtons = document.querySelectorAll('.chat-ai-btn');
    chatButtons.forEach(button => {
        button.addEventListener('click', openChatModal);
    });
});

// Create and insert the chat modal into the document
function createChatModal() {
    const modalHTML = `
    <div id="aiChatModal" class="ai-chat-modal">
        <div class="ai-chat-modal-content">
            <div class="ai-chat-modal-header">
                <h2><i class="fas fa-robot"></i> AI 学习助手</h2>
                <span class="ai-chat-close-button">&times;</span>
            </div>
            <div class="ai-chat-modal-body">
                <div id="aiChatMessages" class="ai-chat-messages">
                    <div class="ai-chat-message ai-message">
                        <div class="ai-chat-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="ai-chat-bubble">
                            您好！我是您的AI学习助手。请问有什么我可以帮您的吗？
                        </div>
                    </div>
                </div>
                <div id="aiChatLoading" class="ai-chat-loading" style="display: none;">
                    <div class="ai-chat-spinner"></div>
                    <p>正在思考...</p>
                </div>
                <div id="aiChatError" class="ai-chat-error" style="display: none;"></div>
                <div class="ai-chat-input-container">
                    <textarea id="aiChatInput" class="ai-chat-input" placeholder="输入您的问题..." rows="2"></textarea>
                    <button id="aiChatSend" class="ai-chat-send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Insert the modal HTML
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Add styles if not already included
    if (!document.getElementById('aiChatStyles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'aiChatStyles';
        styleElement.textContent = `
            .ai-chat-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.4);
                animation: fadeIn 0.3s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .ai-chat-modal-content {
                background-color: #fff;
                margin: 5% auto;
                border-radius: 15px;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2);
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.4s;
            }
            
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .ai-chat-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: linear-gradient(90deg, #4361ee, #7209b7);
                color: white;
                border-top-left-radius: 15px;
                border-top-right-radius: 15px;
            }
            
            .ai-chat-modal-header h2 {
                margin: 0;
                font-size: 1.25rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .ai-chat-close-button {
                color: white;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                transition: 0.2s;
            }
            
            .ai-chat-close-button:hover {
                transform: scale(1.1);
            }
            
            .ai-chat-modal-body {
                padding: 0;
                display: flex;
                flex-direction: column;
                height: 100%;
                max-height: calc(80vh - 60px);
                overflow: hidden;
            }
            
            .ai-chat-messages {
                padding: 20px;
                overflow-y: auto;
                flex-grow: 1;
                max-height: calc(80vh - 160px);
            }
            
            .ai-chat-message {
                display: flex;
                margin-bottom: 15px;
                align-items: flex-start;
            }
            
            .ai-chat-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4361ee, #7209b7);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 10px;
                flex-shrink: 0;
            }
            
            .user-message .ai-chat-avatar {
                background: linear-gradient(135deg, #3a86ff, #4361ee);
            }
            
            .ai-chat-bubble {
                background-color: #f0f2f5;
                padding: 12px 16px;
                border-radius: 18px;
                max-width: 80%;
                line-height: 1.5;
                color: #333;
                border-top-left-radius: 4px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            
            .user-message {
                flex-direction: row-reverse;
            }
            
            .user-message .ai-chat-avatar {
                margin-right: 0;
                margin-left: 10px;
            }
            
            .user-message .ai-chat-bubble {
                background: linear-gradient(90deg, #4361ee, #667eea);
                color: white;
                border-top-right-radius: 4px;
                border-top-left-radius: 18px;
            }
            
            .ai-chat-input-container {
                display: flex;
                padding: 15px;
                background-color: #f5f7fb;
                border-top: 1px solid #e0e0e0;
            }
            
            .ai-chat-input {
                flex-grow: 1;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 24px;
                resize: none;
                font-family: inherit;
                font-size: 14px;
                outline: none;
                transition: border 0.3s;
            }
            
            .ai-chat-input:focus {
                border-color: #4361ee;
            }
            
            .ai-chat-send-btn {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: linear-gradient(90deg, #4361ee, #7209b7);
                color: white;
                border: none;
                margin-left: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }
            
            .ai-chat-send-btn:hover {
                transform: scale(1.05);
            }
            
            .ai-chat-send-btn:disabled {
                background: #cccccc;
                cursor: not-allowed;
            }
            
            .ai-chat-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .ai-chat-spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #4361ee;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .ai-chat-error {
                color: #e74c3c;
                background-color: #ffebee;
                padding: 12px;
                margin: 10px 15px;
                border-radius: 8px;
                font-size: 14px;
            }
            
            /* Mobile Responsive Styles */
            @media (max-width: 768px) {
                .ai-chat-modal-content {
                    margin: 0;
                    width: 100%;
                    height: 100%;
                    max-height: 100vh;
                    border-radius: 0;
                    max-width: none;
                }
                
                .ai-chat-modal-header {
                    border-radius: 0;
                }
                
                .ai-chat-messages {
                    max-height: calc(100vh - 160px);
                }
                
                .ai-chat-bubble {
                    max-width: 85%;
                }
            }
            
            /* Floating button styles */
            .ai-chat-float-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #4361ee, #7209b7);
                border-radius: 50%;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                cursor: pointer;
                z-index: 99;
                transition: transform 0.3s, box-shadow 0.3s;
            }
            
            .ai-chat-float-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 15px rgba(0,0,0,0.25);
            }
            
            .ai-chat-float-btn i {
                font-size: 24px;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Add event listeners
    const modal = document.getElementById('aiChatModal');
    const closeButton = modal.querySelector('.ai-chat-close-button');
    const sendButton = document.getElementById('aiChatSend');
    const chatInput = document.getElementById('aiChatInput');
    
    closeButton.addEventListener('click', closeChatModal);
    sendButton.addEventListener('click', sendChatMessage);
    
    // Allow pressing Enter to send message (Shift+Enter for new line)
    chatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendChatMessage();
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeChatModal();
        }
    });
}

// Open the chat modal
function openChatModal() {
    const modal = document.getElementById('aiChatModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('aiChatInput').focus();
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    }
}

// Close the chat modal
function closeChatModal() {
    const modal = document.getElementById('aiChatModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Add a message to the chat
function addChatMessage(message, isUser = false) {
    const messagesContainer = document.getElementById('aiChatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `ai-chat-message ${isUser ? 'user-message' : 'ai-message'}`;
    
    messageElement.innerHTML = `
        <div class="ai-chat-avatar">
            <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
        </div>
        <div class="ai-chat-bubble">${message}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
}

// Send a message to the API
async function sendChatMessage() {
    const inputElement = document.getElementById('aiChatInput');
    const loadingElement = document.getElementById('aiChatLoading');
    const errorElement = document.getElementById('aiChatError');
    const sendButton = document.getElementById('aiChatSend');
    
    const message = inputElement.value.trim();
    
    if (!message) {
        return;
    }
    
    // Add user message to chat
    addChatMessage(message, true);
    
    // Clear input and show loading
    inputElement.value = '';
    errorElement.style.display = 'none';
    loadingElement.style.display = 'flex';
    sendButton.disabled = true;
    
    try {
        // Make API request
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: message })
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Add AI response to chat
        addChatMessage(result.output || '抱歉，我没有得到有效的回复。');
        
    } catch (error) {
        console.error('Error during API call:', error);
        errorElement.textContent = error.message || '发生错误，请稍后重试。';
        errorElement.style.display = 'block';
    } finally {
        // Hide loading and re-enable button
        loadingElement.style.display = 'none';
        sendButton.disabled = false;
        document.getElementById('aiChatInput').focus();
    }
}

// Add floating chat button to the page
function addFloatingChatButton() {
    if (!document.querySelector('.ai-chat-float-btn')) {
        const button = document.createElement('div');
        button.className = 'ai-chat-float-btn';
        button.innerHTML = '<i class="fas fa-comment-dots"></i>';
        button.setAttribute('title', 'AI 学习助手');
        button.addEventListener('click', openChatModal);
        document.body.appendChild(button);
    }
}

// Initialize chat functionality with floating button
function initializeChatWithFloatingButton() {
    // Create the chat modal if it doesn't exist
    if (!document.getElementById('aiChatModal')) {
        createChatModal();
    }
    
    // Add floating button
    addFloatingChatButton();
}

// Expose functions to global scope
window.openChatModal = openChatModal;
window.closeChatModal = closeChatModal;
window.initializeChatWithFloatingButton = initializeChatWithFloatingButton; 