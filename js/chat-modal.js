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
    // Load Prism.js for syntax highlighting if not already loaded
    if (!document.getElementById('prism-css') && !document.getElementById('prism-js')) {
        // Add Prism CSS
        const prismCSS = document.createElement('link');
        prismCSS.id = 'prism-css';
        prismCSS.rel = 'stylesheet';
        prismCSS.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.24.1/themes/prism.min.css';
        document.head.appendChild(prismCSS);
        
        // Add Prism JS with proper loading order
        const prismJS = document.createElement('script');
        prismJS.id = 'prism-js';
        prismJS.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.24.1/prism.min.js';
        
        // Load components only after main Prism.js loads
        prismJS.onload = function() {
            // Add common language components
            const prismJavaScript = document.createElement('script');
            prismJavaScript.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.24.1/components/prism-javascript.min.js';
            document.head.appendChild(prismJavaScript);
            
            const prismHTML = document.createElement('script');
            prismHTML.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.24.1/components/prism-markup.min.js';
            document.head.appendChild(prismHTML);
            
            const prismCSS2 = document.createElement('script');
            prismCSS2.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.24.1/components/prism-css.min.js';
            document.head.appendChild(prismCSS2);
            
            const prismPython = document.createElement('script');
            prismPython.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.24.1/components/prism-python.min.js';
            document.head.appendChild(prismPython);
        };
        
        document.head.appendChild(prismJS);
    }

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
                max-height: 85vh;
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
                z-index: 2;
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
                max-height: calc(85vh - 60px);
                overflow: hidden;
            }
            
            .ai-chat-messages {
                padding: 20px;
                overflow-y: auto;
                flex-grow: 1;
                max-height: calc(85vh - 160px);
                scroll-behavior: smooth;
                scrollbar-width: thin;
                scrollbar-color: rgba(67, 97, 238, 0.3) transparent;
            }
            
            /* Custom scrollbar for Webkit browsers */
            .ai-chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .ai-chat-messages::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .ai-chat-messages::-webkit-scrollbar-thumb {
                background-color: rgba(67, 97, 238, 0.3);
                border-radius: 3px;
            }
            
            .ai-chat-messages::-webkit-scrollbar-thumb:hover {
                background-color: rgba(67, 97, 238, 0.5);
            }
            
            .ai-chat-message {
                display: flex;
                margin-bottom: 20px;
                align-items: flex-start;
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
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
                line-height: 1.6;
                color: #333;
                border-top-left-radius: 4px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                font-size: 15px;
                white-space: pre-wrap;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            
            /* Style for code blocks in chat */
            .ai-chat-bubble pre {
                background-color: #f5f7fa;
                border-radius: 4px;
                font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
                padding: 12px;
                margin: 10px 0;
                overflow-x: auto;
                border-left: 3px solid #4361ee;
                font-size: 14px;
                line-height: 1.5;
                max-height: 300px;
                position: relative;
            }
            
            .ai-chat-bubble pre code {
                background-color: transparent;
                padding: 0;
                margin: 0;
                border: none;
                display: block;
                color: #333;
                font-size: 14px;
                tab-size: 2;
            }
            
            /* Add language indicator */
            .ai-chat-bubble pre:before {
                content: attr(class);
                position: absolute;
                top: 0;
                right: 0;
                color: #888;
                font-size: 12px;
                font-weight: 500;
                padding: 4px 8px;
                background: #f0f0f0;
                border-bottom-left-radius: 4px;
                border-top-right-radius: 4px;
                text-transform: uppercase;
            }
            
            .ai-chat-bubble pre:before {
                content: '';
            }
            
            .ai-chat-bubble pre[class*="language-"]:before {
                content: attr(class);
                content: attr(class);
                content: attr(class);
                text-transform: uppercase;
                display: block;
                text-align: right;
                font-size: 10px;
                background: rgba(0, 0, 0, 0.1);
                padding: 2px 8px;
                border-radius: 0 4px 0 4px;
                position: absolute;
                top: 0;
                right: 0;
                color: #666;
            }
            
            .ai-chat-bubble pre.language-javascript:before {
                content: 'JavaScript';
            }
            
            .ai-chat-bubble pre.language-js:before {
                content: 'JS';
            }
            
            .ai-chat-bubble pre.language-html:before {
                content: 'HTML';
            }
            
            .ai-chat-bubble pre.language-css:before {
                content: 'CSS';
            }
            
            .ai-chat-bubble pre.language-python:before {
                content: 'Python';
            }
            
            .ai-chat-bubble pre.language-json:before {
                content: 'JSON';
            }
            
            /* Style for inline code in chat */
            .ai-chat-bubble code {
                display: inline;
                padding: 2px 5px;
                margin: 0 2px;
                border-left: none;
                background-color: rgba(0, 0, 0, 0.05);
                border-radius: 3px;
                font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
                font-size: 0.9em;
                color: #c92c2c;
                word-break: break-word;
            }
            
            /* Style for lists in chat */
            .ai-chat-bubble ul, .ai-chat-bubble ol {
                padding-left: 20px;
                margin: 8px 0;
            }
            
            .ai-chat-bubble li {
                margin-bottom: 4px;
            }
            
            /* Style for headings in chat */
            .ai-chat-bubble h1, .ai-chat-bubble h2, .ai-chat-bubble h3, 
            .ai-chat-bubble h4, .ai-chat-bubble h5, .ai-chat-bubble h6 {
                margin-top: 16px;
                margin-bottom: 8px;
                font-weight: 600;
                line-height: 1.3;
            }
            
            .ai-chat-bubble h1 { font-size: 1.5em; }
            .ai-chat-bubble h2 { font-size: 1.3em; }
            .ai-chat-bubble h3 { font-size: 1.15em; }
            
            /* Style for links in chat */
            .ai-chat-bubble a {
                color: #4361ee;
                text-decoration: none;
                border-bottom: 1px dotted #4361ee;
                transition: border-bottom 0.2s;
            }
            
            .ai-chat-bubble a:hover {
                border-bottom: 1px solid #4361ee;
            }
            
            /* Style for blockquotes in chat */
            .ai-chat-bubble blockquote {
                border-left: 4px solid #ccc;
                margin-left: 0;
                margin-right: 0;
                padding-left: 16px;
                color: #666;
                font-style: italic;
            }
            
            /* Style for horizontal rule in chat */
            .ai-chat-bubble hr {
                border: 0;
                height: 1px;
                background: #eee;
                margin: 16px 0;
            }
            
            /* Style for tables in chat */
            .ai-chat-bubble table {
                border-collapse: collapse;
                width: 100%;
                margin: 12px 0;
                font-size: 14px;
            }
            
            .ai-chat-bubble th, .ai-chat-bubble td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            
            .ai-chat-bubble th {
                background-color: rgba(67, 97, 238, 0.1);
                font-weight: 600;
            }
            
            /* Highlighting of important points */
            .ai-chat-bubble strong, .ai-chat-bubble b {
                font-weight: 600;
                color: #111;
            }
            
            .ai-chat-bubble em, .ai-chat-bubble i {
                color: #555;
            }
            
            /* Paragraphs spacing in chat */
            .ai-chat-bubble p {
                margin: 0 0 12px 0;
            }
            
            .ai-chat-bubble p:last-child {
                margin-bottom: 0;
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
            
            /* Adjust styles for dark background in user messages */
            .user-message .ai-chat-bubble code, 
            .user-message .ai-chat-bubble pre {
                background-color: rgba(255, 255, 255, 0.2);
                border-left-color: rgba(255, 255, 255, 0.5);
            }
            
            .user-message .ai-chat-bubble a {
                color: #fff;
                border-bottom: 1px dotted rgba(255, 255, 255, 0.7);
            }
            
            .user-message .ai-chat-bubble blockquote {
                border-left-color: rgba(255, 255, 255, 0.5);
                color: rgba(255, 255, 255, 0.8);
            }
            
            .user-message .ai-chat-bubble strong, 
            .user-message .ai-chat-bubble b {
                color: #fff;
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
    
    // Format message content for better readability
    let formattedMessage = message;
    
    // Only format AI messages (not user messages)
    if (!isUser) {
        // Process code blocks first to avoid conflicts with other formatting
        const codeBlocks = [];
        formattedMessage = formattedMessage.replace(/```([\s\S]*?)```/g, function(match, code) {
            const id = `code-${codeBlocks.length}`;
            codeBlocks.push({ id, code: code.trim() });
            return `<code-block id="${id}"></code-block>`;
        });
        
        // Process inline code
        const inlineCodes = [];
        formattedMessage = formattedMessage.replace(/`([^`]+)`/g, function(match, code) {
            const id = `inline-${inlineCodes.length}`;
            inlineCodes.push({ id, code });
            return `<inline-code id="${id}"></inline-code>`;
        });

        // Convert markdown-style links [text](url) to HTML links
        formattedMessage = formattedMessage.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Convert asterisks to bold and italic
        formattedMessage = formattedMessage.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');  // Bold + italic
        formattedMessage = formattedMessage.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');  // Bold
        formattedMessage = formattedMessage.replace(/\*([^*]+)\*/g, '<em>$1</em>');  // Italic
        
        // Handle tables
        if (formattedMessage.includes('|')) {
            const lines = formattedMessage.split('\n');
            let inTable = false;
            let tableHTML = '<table>';
            let processedLines = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.startsWith('|') && line.endsWith('|')) {
                    if (!inTable) {
                        inTable = true;
                        tableHTML = '<table>';
                    }
                    
                    const cells = line.split('|').filter(cell => cell !== '');
                    
                    // Check if this is a header separator line (e.g., |---|---|)
                    const isSeparator = cells.every(cell => /^[-:\s]+$/.test(cell.trim()));
                    
                    if (!isSeparator) {
                        const isHeader = i > 0 && i < lines.length - 1 && 
                                        lines[i+1].trim().startsWith('|') && 
                                        lines[i+1].trim().endsWith('|') &&
                                        /^\|[\s\-:]+\|/.test(lines[i+1].trim());
                        
                        tableHTML += '<tr>';
                        cells.forEach(cell => {
                            if (isHeader) {
                                tableHTML += `<th>${cell.trim()}</th>`;
                            } else {
                                tableHTML += `<td>${cell.trim()}</td>`;
                            }
                        });
                        tableHTML += '</tr>';
                    }
                } else if (inTable) {
                    inTable = false;
                    tableHTML += '</table>';
                    processedLines.push(tableHTML);
                } else {
                    processedLines.push(line);
                }
            }
            
            if (inTable) {
                tableHTML += '</table>';
                processedLines.push(tableHTML);
            }
            
            formattedMessage = processedLines.join('\n');
        }
        
        // Process blockquotes
        formattedMessage = formattedMessage.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
        formattedMessage = formattedMessage.replace(/<\/blockquote>\n<blockquote>/g, '<br>');
        
        // Convert headers - must be at start of line
        formattedMessage = formattedMessage.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        formattedMessage = formattedMessage.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        formattedMessage = formattedMessage.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        
        // Handle unordered lists
        let listMatch;
        const listRegex = /^[\s-]*[-*•] (.+)$/gm;
        const listItems = [];
        
        while ((listMatch = listRegex.exec(formattedMessage)) !== null) {
            listItems.push(listMatch[0]);
        }
        
        if (listItems.length > 0) {
            let listHTML = '<ul>';
            listItems.forEach(item => {
                const content = item.replace(/^[\s-]*[-*•] (.+)$/, '$1');
                listHTML += `<li>${content}</li>`;
            });
            listHTML += '</ul>';
            
            listItems.forEach(item => {
                formattedMessage = formattedMessage.replace(item, '');
            });
            
            formattedMessage += listHTML;
        }
        
        // Handle ordered lists
        const orderedListRegex = /^[\s-]*(\d+)\. (.+)$/gm;
        const orderedListItems = [];
        
        while ((listMatch = orderedListRegex.exec(formattedMessage)) !== null) {
            orderedListItems.push({
                number: parseInt(listMatch[1]),
                content: listMatch[2],
                fullMatch: listMatch[0]
            });
        }
        
        if (orderedListItems.length > 0) {
            orderedListItems.sort((a, b) => a.number - b.number);
            
            let listHTML = '<ol>';
            orderedListItems.forEach(item => {
                listHTML += `<li>${item.content}</li>`;
            });
            listHTML += '</ol>';
            
            orderedListItems.forEach(item => {
                formattedMessage = formattedMessage.replace(item.fullMatch, '');
            });
            
            formattedMessage += listHTML;
        }
        
        // Convert horizontal rules
        formattedMessage = formattedMessage.replace(/^\s*---+\s*$/gm, '<hr>');
        
        // Convert newlines to breaks but preserve paragraphs
        formattedMessage = formattedMessage.replace(/\n\n+/g, '</p><p>');
        formattedMessage = formattedMessage.replace(/\n/g, '<br>');
        
        // Wrap in paragraph if not already done
        if (!formattedMessage.startsWith('<p>')) {
            formattedMessage = `<p>${formattedMessage}</p>`;
        }
        
        // Fix any incorrect nesting due to our replacements
        formattedMessage = formattedMessage.replace(/<p><(h[1-6]|ul|ol|blockquote|hr|table)>/g, '<$1>');
        formattedMessage = formattedMessage.replace(/<\/(h[1-6]|ul|ol|blockquote|hr|table)><\/p>/g, '</$1>');
        formattedMessage = formattedMessage.replace(/<p><\/p>/g, '');
        
        // Restore code blocks and inline code
        codeBlocks.forEach(({ id, code }) => {
            let language = '';
            // Try to detect language from first line
            const firstLine = code.split('\n')[0].trim();
            if (firstLine && !firstLine.includes(' ')) {
                language = firstLine;
                code = code.substring(firstLine.length).trim();
            }
            
            const highlightClass = language ? ` class="language-${language}"` : '';
            formattedMessage = formattedMessage.replace(
                `<code-block id="${id}"></code-block>`,
                `<pre${highlightClass}><code${highlightClass}>${escapeHTML(code)}</code></pre>`
            );
        });
        
        inlineCodes.forEach(({ id, code }) => {
            formattedMessage = formattedMessage.replace(
                `<inline-code id="${id}"></inline-code>`,
                `<code>${escapeHTML(code)}</code>`
            );
        });
    }
    
    messageElement.innerHTML = `
        <div class="ai-chat-avatar">
            <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
        </div>
        <div class="ai-chat-bubble">${formattedMessage}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
    
    // Apply syntax highlighting
    if (typeof Prism !== 'undefined') {
        setTimeout(() => {
            Prism.highlightAllUnder(messageElement);
        }, 100);
    }
}

// Helper function to escape HTML in code blocks
function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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