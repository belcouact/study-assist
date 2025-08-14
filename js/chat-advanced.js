// Advanced Chat Functionality for Study Assistant
// Modern, responsive chat with AI integration, file uploads, and real-time features

class AdvancedChat {
    constructor() {
        this.currentModel = 'glm';
        this.isTyping = false;
        this.messageHistory = [];
        this.chatSessions = new Map();
        this.currentSessionId = 'default';
        this.voiceRecognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.settings = {
            autoSave: true,
            voiceEnabled: false,
            darkMode: false,
            fontSize: 'medium',
            language: 'zh-CN'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.loadChatHistory();
        this.initializeVoiceFeatures();
        this.setupKeyboardShortcuts();
        this.checkMobileDevice();
        this.startAutoSave();
    }
    
    setupEventListeners() {
        // Message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', (e) => this.autoResize(e.target));
            messageInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
            messageInput.addEventListener('paste', (e) => this.handlePaste(e));
        }
        
        // Send button
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // File upload
        const fileUpload = document.getElementById('fileUpload');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        
        // Window events
        window.addEventListener('beforeunload', () => this.saveChatHistory());
        window.addEventListener('resize', () => this.handleResize());
        
        // Visibility change for pause/resume
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseActivity();
            } else {
                this.resumeActivity();
            }
        });
    }
    
    // Message handling
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        input.value = '';
        this.autoResize(input);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response.content, 'ai', response.metadata);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('抱歉，我遇到了一些问题。请稍后再试。', 'ai', { error: true });
            console.error('AI Response Error:', error);
        }
    }
    
    async getAIResponse(message) {
        try {
            // GLM Worker API endpoint
            const GLM_WORKER_URL = 'https://glm.study-llm.me/chat';
            
            // Prepare request payload
            const payload = {
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            };
            
            // Make API call to GLM worker
            const response = await fetch(GLM_WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Extract the actual message content from GLM API response
            const content = result.choices?.[0]?.message?.content || '抱歉，我无法生成回复。';
            
            // Check for quota limitations or API errors
            if (result.error || result.message?.includes('quota') || result.message?.includes('limit')) {
                throw new Error(`API限制: ${result.error?.message || result.message || '配额已用完'}`);
            }
            
            // Format the response for better readability
            const formattedContent = this.formatAIResponse(content);
            
            return {
                content: formattedContent,
                metadata: {
                    model: this.currentModel,
                    timestamp: new Date().toISOString(),
                    confidence: result.usage ? Math.min(result.usage.total_tokens / 1000, 1) : 0.8,
                    usage: result.usage || null,
                    quotaRemaining: result.quota_remaining || null,
                    quotaLimit: result.quota_limit || null
                }
            };
        } catch (error) {
            console.error('GLM Worker API Error:', error);
            
            // Check if it's a quota error
            const isQuotaError = error.message.includes('quota') || error.message.includes('limit') || error.message.includes('配额');
            
            if (isQuotaError) {
                // Show quota warning to user
                this.showQuotaWarning();
                
                return {
                    content: this.generateQuotaErrorResponse(),
                    metadata: {
                        model: this.currentModel,
                        timestamp: new Date().toISOString(),
                        confidence: 0.3,
                        error: true,
                        quotaError: true
                    }
                };
            }
            
            // Fallback to mock responses for other errors
            console.log('Falling back to mock responses...');
            const responses = {
                'glm': this.generateGLMResponse(message),
                'deepseek': this.generateDeepSeekResponse(message),
                'claude': this.generateClaudeResponse(message)
            };
            
            return {
                content: responses[this.currentModel] || responses.glm,
                metadata: {
                    model: this.currentModel,
                    timestamp: new Date().toISOString(),
                    confidence: 0.5,
                    error: true,
                    fallback: true
                }
            };
        }
    }
    
    generateGLMResponse(message) {
        const responses = {
            '数学': '数学是一门研究数量、结构、变化以及空间等概念的学科。让我为你详细解释一下相关的概念：\n\n**基本概念：**\n• 数与运算：整数、分数、小数及其运算规则\n• 代数：方程、函数、不等式\n• 几何：点、线、面、体的性质和关系\n• 统计：数据收集、分析和解释\n\n你想深入了解哪个方面呢？我可以提供更具体的解释和例子。',
            '物理': '物理学是研究物质、能量以及它们之间相互作用的自然科学。主要分支包括：\n\n**力学：** 研究物体运动和力的关系\n**热学：** 研究温度、热量和能量转换\n**电磁学：** 研究电、磁和电磁现象\n**光学：** 研究光的性质和行为\n**现代物理：** 相对论、量子力学等\n\n你对哪个物理概念最感兴趣？',
            '化学': '化学是研究物质的组成、结构、性质以及变化规律的科学。让我为你介绍化学的主要分支：\n\n**有机化学：** 研究含碳化合物\n**无机化学：** 研究无机物质\n**分析化学：** 确定物质组成和含量\n**物理化学：** 用物理方法研究化学现象\n**生物化学：** 研究生物体内的化学过程\n\n有什么具体的化学问题想了解吗？',
            '英语': '英语学习是一个系统的过程，我建议从以下几个方面入手：\n\n**听力：** 多听英语音频、视频，培养语感\n**口语：** 大胆开口练习，不要怕犯错\n**阅读：** 从简单的材料开始，逐步提高\n**写作：** 从简单的句子开始，练习表达\n**词汇：** 每天学习新单词，复习旧单词\n\n你想重点提升哪个方面的能力呢？',
            '历史': '历史学帮助我们理解人类文明的发展轨迹。学习历史的方法包括：\n\n**时间线法：** 建立历史事件的时间框架\n**比较法：** 对比不同时期或地区的历史\n**因果分析：** 理解历史事件的原因和结果\n**史料分析：** 学会辨别和解读历史资料\n\n你对哪个历史时期或事件感兴趣？我可以为你详细介绍。',
            'default': '这是一个很好的问题！让我为你详细分析一下。\n\n首先，我们需要理解这个问题的核心概念。然后，我们可以从不同的角度来探讨：\n\n1. **基本定义：** 明确相关术语的含义\n2. **关键原理：** 解释背后的基本规律\n3. **实际应用：** 举例说明在现实中的运用\n4. **深入理解：** 探讨更高级的概念和联系\n\n你希望我从哪个方面开始详细解释呢？'
        };
        
        for (let key in responses) {
            if (message.includes(key)) {
                return responses[key];
            }
        }
        
        return responses.default;
    }
    
    generateDeepSeekResponse(message) {
        return `作为DeepSeek模型，我将为你提供深度学习的分析：\n\n**问题分析：**\n你的问题涉及多个层面的思考。让我从基础概念开始，逐步深入分析。\n\n**核心要点：**\n• 概念定义和基本特征\n• 相关理论框架\n• 实际应用场景\n• 常见问题和解决方案\n\n**建议学习路径：**\n1. 先掌握基础知识\n2. 通过练习加深理解\n3. 结合实际案例学习\n4. 逐步提升到高级概念\n\n需要我详细解释哪个部分？`;
    }
    
    generateClaudeResponse(message) {
        return `我很乐意帮助你理解这个问题！让我用清晰的方式来解释：\n\n**简单来说：**\n[用简单的语言解释核心概念]\n\n**详细解释：**\n这个概念可以从以下几个角度来理解：\n\n📚 **理论基础：** 相关的背景知识和原理\n🔍 **深入分析：** 更详细的解释和机制\n💡 **实际应用：** 在现实中的例子和用途\n🎯 **学习建议：** 如何更好地掌握这个概念\n\n有什么特别想了解的方面吗？我可以为你提供更有针对性的解释。`;
    }
    
    addMessage(content, sender, metadata = {}) {
        const container = document.getElementById('messagesContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const time = new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Format content with markdown-like syntax
        const formattedContent = this.formatMessage(content);
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${formattedContent}</div>
                ${sender === 'ai' ? this.createReactionButtons() : ''}
                ${metadata.error ? '<div class="message-error"><i class="fas fa-exclamation-triangle"></i> 消息发送失败</div>' : ''}
                <div class="message-time">${time}</div>
            </div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        
        // Save to history
        this.messageHistory.push({ 
            content, 
            sender, 
            time, 
            metadata,
            sessionId: this.currentSessionId 
        });
        
        // Auto-speak if voice enabled
        if (sender === 'ai' && this.settings.voiceEnabled) {
            this.speakMessage(content);
        }
    }
    
    formatMessage(content) {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            .replace(/• (.*?)/g, '<li>$1</li>')
            .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>')
            .replace(/([📚🔍💡🎯])/g, '<span style="font-size: 1.2em;">$1</span>');
    }
    
    formatAIResponse(content) {
        // Enhanced formatting for better readability
        return content
            // Split into paragraphs and format
            .split('\n\n')
            .map(paragraph => {
                // Format headers and important points
                if (paragraph.includes('**') && paragraph.includes('：')) {
                    return `<div class="ai-section-header">${paragraph}</div>`;
                }
                
                // Format bullet points
                if (paragraph.includes('•') || paragraph.includes('-')) {
                    return `<div class="ai-bullet-points">${paragraph}</div>`;
                }
                
                // Format numbered lists
                if (paragraph.match(/^\d+\./)) {
                    return `<div class="ai-numbered-list">${paragraph}</div>`;
                }
                
                // Regular paragraph
                return `<div class="ai-paragraph">${paragraph}</div>`;
            })
            .join('')
            // Apply markdown formatting
            .replace(/\*\*(.*?)\*\*/g, '<strong class="ai-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="ai-italic">$1</em>')
            .replace(/`(.*?)`/g, '<code class="ai-code">$1</code>')
            .replace(/• (.*?)/g, '<span class="ai-bullet">•</span> <span class="ai-bullet-text">$1</span>')
            .replace(/([📚🔍💡🎯✨📝🔧])/g, '<span class="ai-emoji">$1</span>')
            .replace(/(\d+\.\s)/g, '<span class="ai-number">$1</span>');
    }
    
    generateQuotaErrorResponse() {
        return `⚠️ **API配额已用完**

很抱歉，当前GLM API的调用配额已经达到限制。这可能是由于以下原因：

• 今日API调用次数已达上限
• 服务器负载过高，暂时限制访问
• 账户配额需要重置或升级

**建议解决方案：**
1. 稍后再试（配额通常会在一定时间后重置）
2. 尝试使用其他AI模型（如DeepSeek或Claude）
3. 联系管理员了解配额状态

目前我将使用本地模拟回复来继续为您提供帮助。`;
    }
    
    showQuotaWarning() {
        // Show a persistent warning banner
        const warningDiv = document.createElement('div');
        warningDiv.className = 'quota-warning';
        warningDiv.innerHTML = `
            <div class="quota-warning-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>API配额已用完，正在使用备用回复模式</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Insert at the top of the chat container
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.insertBefore(warningDiv, chatContainer.firstChild);
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warningDiv.parentElement) {
                warningDiv.remove();
            }
        }, 10000);
    }
    
    createReactionButtons() {
        return `
            <div class="message-reactions">
                <button class="reaction-btn" onclick="chat.toggleReaction(this, 'helpful')">
                    <i class="fas fa-thumbs-up"></i> 有帮助
                </button>
                <button class="reaction-btn" onclick="chat.toggleReaction(this, 'great')">
                    <i class="fas fa-heart"></i> 很棒
                </button>
                <button class="reaction-btn" onclick="chat.toggleReaction(this, 'confusing')">
                    <i class="fas fa-question"></i> 有疑问
                </button>
            </div>
        `;
    }
    
    toggleReaction(button, type) {
        button.classList.toggle('active');
        
        // Send reaction to analytics or backend
        this.trackReaction(type);
        
        // Show feedback
        const isActive = button.classList.contains('active');
        this.showNotification(isActive ? '感谢你的反馈！' : '已取消反馈');
    }
    
    trackReaction(type) {
        // Send reaction data to analytics
        console.log('Reaction tracked:', {
            type,
            model: this.currentModel,
            timestamp: new Date().toISOString()
        });
    }
    
    // Typing indicator
    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const container = document.getElementById('messagesContainer');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble" style="background: var(--light-bg);">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
    }
    
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
        this.isTyping = false;
    }
    
    // Voice features
    initializeVoiceFeatures() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = true;
            this.voiceRecognition.lang = this.settings.language;
            
            this.voiceRecognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButton(true);
            };
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const input = document.getElementById('messageInput');
                input.value = transcript;
                this.autoResize(input);
            };
            
            this.voiceRecognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton(false);
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceButton(false);
                this.showNotification('语音识别出错，请重试');
            };
        }
    }
    
    toggleVoiceChat() {
        if (!this.voiceRecognition) {
            this.showNotification('您的浏览器不支持语音识别');
            return;
        }
        
        if (this.isListening) {
            this.voiceRecognition.stop();
        } else {
            this.voiceRecognition.start();
        }
    }
    
    updateVoiceButton(isListening) {
        const voiceBtn = document.querySelector('[onclick="toggleVoiceChat()"]');
        if (voiceBtn) {
            const icon = voiceBtn.querySelector('i');
            if (isListening) {
                icon.className = 'fas fa-stop';
                voiceBtn.style.color = '#f72585';
            } else {
                icon.className = 'fas fa-microphone';
                voiceBtn.style.color = '';
            }
        }
    }
    
    speakMessage(text) {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.settings.language;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        this.synthesis.speak(utterance);
    }
    
    // File handling
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type and size
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['text/plain', 'application/pdf', 'image/jpeg', 'image/png'];
        
        if (file.size > maxSize) {
            this.showNotification('文件大小不能超过10MB');
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('不支持的文件类型');
            return;
        }
        
        // Show file preview
        this.showFilePreview(file);
        
        // Process file
        this.processFile(file);
    }
    
    showFilePreview(file) {
        const fileDiv = document.getElementById('uploadedFile');
        const fileSize = this.formatFileSize(file.size);
        
        fileDiv.innerHTML = `
            <i class="fas fa-file"></i>
            <div>
                <div style="font-weight: 500;">${file.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${fileSize}</div>
            </div>
            <button class="file-remove" onclick="chat.removeFile()">
                <i class="fas fa-times"></i>
            </button>
        `;
        fileDiv.style.display = 'flex';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async processFile(file) {
        try {
            let content = '';
            
            if (file.type.startsWith('text/')) {
                content = await this.readTextFile(file);
            } else if (file.type.startsWith('image/')) {
                content = await this.readImageFile(file);
            } else {
                content = `文件: ${file.name}\n类型: ${file.type}\n大小: ${this.formatFileSize(file.size)}`;
            }
            
            // Add file info to message
            const fileInfo = `📎 **文件上传**\n**文件名:** ${file.name}\n**类型:** ${file.type}\n**大小:** ${this.formatFileSize(file.size)}\n\n${content}`;
            
            this.addMessage(fileInfo, 'user');
            
            // Get AI response about the file
            this.showTypingIndicator();
            const response = await this.getAIResponse(`请分析这个文件: ${file.name}\n${content}`);
            this.hideTypingIndicator();
            this.addMessage(response.content, 'ai', response.metadata);
            
        } catch (error) {
            console.error('File processing error:', error);
            this.showNotification('文件处理失败');
        }
    }
    
    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    readImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve(`图片尺寸: ${img.width}x${img.height}px\n图片已上传，我可以帮你分析图片内容。`);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    removeFile() {
        document.getElementById('uploadedFile').style.display = 'none';
        document.getElementById('fileUpload').value = '';
    }
    
    // Settings and preferences
    loadSettings() {
        const saved = localStorage.getItem('chatSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.applySettings();
        }
    }
    
    saveSettings() {
        localStorage.setItem('chatSettings', JSON.stringify(this.settings));
    }
    
    applySettings() {
        // Apply dark mode
        if (this.settings.darkMode) {
            document.body.classList.add('dark-theme');
        }
        
        // Apply font size
        document.body.style.fontSize = {
            'small': '14px',
            'medium': '16px',
            'large': '18px'
        }[this.settings.fontSize];
        
        // Update voice recognition language
        if (this.voiceRecognition) {
            this.voiceRecognition.lang = this.settings.language;
        }
    }
    
    // Chat history management
    loadChatHistory() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.messageHistory = data.messages || [];
                this.chatSessions = new Map(data.sessions || []);
                this.currentSessionId = data.currentSession || 'default';
            } catch (error) {
                console.error('Error loading chat history:', error);
            }
        }
    }
    
    saveChatHistory() {
        if (!this.settings.autoSave) return;
        
        const data = {
            messages: this.messageHistory,
            sessions: Array.from(this.chatSessions.entries()),
            currentSession: this.currentSessionId,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('chatHistory', JSON.stringify(data));
    }
    
    startAutoSave() {
        if (this.settings.autoSave) {
            setInterval(() => {
                this.saveChatHistory();
            }, 30000); // Auto-save every 30 seconds
        }
    }
    
    // Session management
    createNewSession() {
        const sessionId = 'session_' + Date.now();
        this.chatSessions.set(sessionId, {
            id: sessionId,
            title: '新对话',
            createdAt: new Date().toISOString(),
            messages: []
        });
        
        this.currentSessionId = sessionId;
        this.clearChat();
        this.updateSessionList();
        
        return sessionId;
    }
    
    switchSession(sessionId) {
        if (this.chatSessions.has(sessionId)) {
            this.currentSessionId = sessionId;
            const session = this.chatSessions.get(sessionId);
            
            // Load session messages
            this.clearChat();
            session.messages.forEach(msg => {
                this.addMessage(msg.content, msg.sender, msg.metadata);
            });
            
            this.updateSessionList();
        }
    }
    
    updateSessionList() {
        const historyContainer = document.getElementById('chatHistory');
        if (!historyContainer) return;
        
        historyContainer.innerHTML = '';
        
        this.chatSessions.forEach((session, id) => {
            const item = document.createElement('div');
            item.className = `history-item ${id === this.currentSessionId ? 'active' : ''}`;
            item.onclick = () => this.switchSession(id);
            
            const time = new Date(session.createdAt).toLocaleDateString('zh-CN');
            item.innerHTML = `
                <div class="history-title">${session.title}</div>
                <div class="history-time">${time}</div>
            `;
            
            historyContainer.appendChild(item);
        });
    }
    
    // Utility functions
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
    }
    
    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }
    
    handlePaste(event) {
        const items = event.clipboardData.items;
        
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault();
                const file = item.getAsFile();
                this.handleImagePaste(file);
            }
        }
    }
    
    handleImagePaste(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const message = `📷 **图片粘贴**\n图片已粘贴，我可以帮你分析图片内容。`;
            this.addMessage(message, 'user');
        };
        reader.readAsDataURL(file);
    }
    
    handleResize() {
        // Handle responsive layout changes
        const isMobile = window.innerWidth <= 768;
        const sidebar = document.getElementById('chatSidebar');
        
        if (isMobile && sidebar) {
            sidebar.style.display = 'none';
        }
    }
    
    checkMobileDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile-device');
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('messageInput').focus();
            }
            
            // Ctrl/Cmd + /: Show shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showShortcuts();
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }
    
    showShortcuts() {
        const shortcuts = [
            { key: 'Ctrl/Cmd + K', action: '聚焦输入框' },
            { key: 'Ctrl/Cmd + /', action: '显示快捷键' },
            { key: 'Enter', action: '发送消息' },
            { key: 'Shift + Enter', action: '换行' },
            { key: 'Escape', action: '关闭弹窗' }
        ];
        
        let content = '⌨️ **键盘快捷键**\n\n';
        shortcuts.forEach(shortcut => {
            content += `**${shortcut.key}** - ${shortcut.action}\n`;
        });
        
        this.addMessage(content, 'ai');
    }
    
    pauseActivity() {
        // Pause animations, timers, etc.
        if (this.synthesis.speaking) {
            this.synthesis.pause();
        }
    }
    
    resumeActivity() {
        // Resume paused activities
        if (this.synthesis.paused) {
            this.synthesis.resume();
        }
    }
    
    closeModals() {
        // Close any open modals or dropdowns
        // Implementation depends on your modal system
    }
    
    // UI feedback
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            'info': 'rgba(67, 97, 238, 0.9)',
            'success': 'rgba(76, 201, 240, 0.9)',
            'warning': 'rgba(247, 127, 0, 0.9)',
            'error': 'rgba(214, 40, 40, 0.9)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Public methods for global access
    clearChat() {
        if (confirm('确定要清空当前对话吗？')) {
            const container = document.getElementById('messagesContainer');
            container.innerHTML = `
                <div class="message ai">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            对话已清空，有什么新的问题想问我吗？
                        </div>
                        <div class="message-time">刚刚</div>
                    </div>
                </div>
            `;
            this.messageHistory = [];
            this.saveChatHistory();
            this.showNotification('对话已清空');
        }
    }
    
    exportChat() {
        const chatData = {
            model: this.currentModel,
            messages: this.messageHistory,
            settings: this.settings,
            exportTime: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(chatData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('对话已导出');
    }
    
    shareChat() {
        if (navigator.share) {
            navigator.share({
                title: 'AI 学习助手对话',
                text: '查看我与AI学习助手的对话记录',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.showNotification('链接已复制到剪贴板');
        }
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('chatSidebar');
        if (sidebar) {
            sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
        }
    }
    
    toggleTheme() {
        this.settings.darkMode = !this.settings.darkMode;
        this.applySettings();
        this.saveSettings();
        this.showNotification(`已切换到${this.settings.darkMode ? '深色' : '浅色'}主题`);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    showSettings() {
        this.showNotification('设置功能开发中');
    }
    
    goHome() {
        window.location.href = 'index.html';
    }
    
    insertEmoji() {
        this.showNotification('表情功能开发中');
    }
    
    selectModel(model) {
        this.currentModel = model;
        
        // Update UI
        document.querySelectorAll('.model-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[onclick="chat.selectModel('${model}')"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // Update header
        const modelNames = {
            'glm': 'GLM-4.5 助手',
            'deepseek': 'DeepSeek 助手',
            'claude': 'Claude 助手'
        };
        
        const modelHeader = document.getElementById('currentModel');
        if (modelHeader) {
            modelHeader.textContent = modelNames[model];
        }
        
        this.showNotification(`已切换到 ${modelNames[model]}`);
    }
    
    loadChat(chatId) {
        this.showNotification(`正在加载聊天记录 ${chatId}...`);
        // Implementation for loading specific chat history
    }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.chat = new AdvancedChat();
    
    // Focus on input
    const input = document.getElementById('messageInput');
    if (input) {
        input.focus();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification {
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .message-error {
        color: var(--danger-color);
        font-size: 0.8rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .dark-theme {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: #e4e4e7;
    }
    
    .dark-theme .chat-header,
    .dark-theme .chat-sidebar,
    .dark-theme .chat-main {
        background: rgba(30, 30, 46, 0.95);
        color: #e4e4e7;
    }
    
    .dark-theme .message-bubble {
        background: rgba(60, 60, 80, 0.8);
        color: #e4e4e7;
    }
    
    .dark-theme .message.user .message-bubble {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    }
    
    .mobile-device .input-container {
        padding-bottom: env(safe-area-inset-bottom, 1rem);
    }
`;
document.head.appendChild(style);