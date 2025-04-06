document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const chatMessages = document.getElementById('english-chat-messages');
    const questionInput = document.getElementById('english-question-input');
    const sendButton = document.getElementById('send-english-question');
    const topicCards = document.querySelectorAll('.topic-card');
    
    // 存储聊天历史
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的英语教学助手，擅长回答关于英语语法、词汇、文学和写作的问题。提供清晰、准确且有教育意义的回答。根据用户的英语水平调整回答的复杂度。鼓励学习者思考并提供有用的例子。对于语法问题，解释规则并给出示例；对于词汇问题，提供定义、用法和例句；对于文学分析，讨论主题、风格和解释；对于写作建议，提供结构和技巧指导。"
        },
        {
            "role": "assistant",
            "content": "你好！我是你的DeepSeek英语助手。今天我能如何帮助你提高英语技能？"
        }
    ];
    
    // 教育水平相关
    let educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
    
    // 当前选择的主题
    let currentTopic = null;
    
    // 监听发送按钮点击
    sendButton.addEventListener('click', sendMessage);
    
    // 监听输入框回车事件
    questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 为主题卡片添加点击事件
    topicCards.forEach(card => {
        card.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            setTopic(topic);
            
            // 高亮选中的主题卡片
            topicCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // 滚动到聊天部分
            document.querySelector('.ai-assistant-section').scrollIntoView({ behavior: 'smooth' });
            
            // 聚焦到输入框
            questionInput.focus();
        });
    });
    
    // 从页面加载时初始化聊天界面
    initializeChat();
    
    // 初始化聊天界面
    function initializeChat() {
        // 清空聊天区域
        chatMessages.innerHTML = '';
        
        // 显示聊天历史
        displayChatHistory();
        
        // 更新系统提示
        updateSystemPrompt();
        
        // 检测教育水平变化
        window.addEventListener('education-level-change', function(event) {
            educationLevel = event.detail.level;
            updateSystemPrompt();
        });
    }
    
    // 设置当前主题
    function setTopic(topic) {
        currentTopic = topic;
        updateSystemPrompt();
        
        // 添加话题引导消息
        let topicPrompt = "";
        
        switch(topic) {
            case 'grammar':
                topicPrompt = "我想学习英语语法。你能帮我解释一下基本的语法规则吗？";
                break;
            case 'vocabulary':
                topicPrompt = "我想扩展我的词汇量。请问你能给我推荐一些学习词汇的方法吗？";
                break;
            case 'literature':
                topicPrompt = "我对英语文学感兴趣。你能向我介绍一些经典作品和作者吗？";
                break;
            case 'writing':
                topicPrompt = "我想提高我的英语写作能力。有哪些写作技巧可以分享？";
                break;
            case 'comprehension':
                topicPrompt = "请问提高英语阅读理解能力有什么好方法？";
                break;
            case 'poetry':
                topicPrompt = "我对英语诗歌很感兴趣。能介绍一些常见的诗歌形式和结构吗？";
                break;
            default:
                return;
        }
        
        // 自动在输入框中填入主题相关问题
        questionInput.value = topicPrompt;
    }
    
    // 更新系统提示
    function updateSystemPrompt() {
        let levelSpecificPrompt = '';
        
        switch(educationLevel) {
            case 'elementary-school':
                levelSpecificPrompt = '用户是小学生，请使用简单、基础的英语概念进行解释，多用直观例子，避免复杂术语。';
                break;
            case 'middle-school':
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的英语概念，平衡简洁性和教育性。';
                break;
            case 'high-school':
                levelSpecificPrompt = '用户是高中生，可以讨论更复杂的英语概念，包括高级语法、修辞手法和文学分析。';
                break;
            default:
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的英语概念，平衡简洁性和教育性。';
        }
        
        // 添加主题特定提示
        let topicSpecificPrompt = '';
        
        if (currentTopic) {
            switch(currentTopic) {
                case 'grammar':
                    topicSpecificPrompt = '用户正在学习英语语法。请专注于解释语法规则、句子结构、动词时态、语态等概念，并提供清晰的例子。';
                    break;
                case 'vocabulary':
                    topicSpecificPrompt = '用户正在学习英语词汇。请专注于单词含义、同义词、反义词、词根词缀、词汇记忆方法等，并提供示例句子。';
                    break;
                case 'literature':
                    topicSpecificPrompt = '用户正在学习英语文学。请专注于文学作品、作者、文学流派、分析技巧、主题和风格等概念。';
                    break;
                case 'writing':
                    topicSpecificPrompt = '用户正在学习英语写作。请专注于写作技巧、文章结构、段落组织、修辞手法和写作类型等概念。';
                    break;
                case 'comprehension':
                    topicSpecificPrompt = '用户正在学习英语阅读理解。请专注于阅读策略、推断、理解主旨、找出细节和批判性思考等概念。';
                    break;
                case 'poetry':
                    topicSpecificPrompt = '用户正在学习英语诗歌。请专注于诗歌形式、韵律、韵脚、诗歌术语和解读技巧等概念。';
                    break;
                default:
                    topicSpecificPrompt = '';
            }
        }
        
        // 更新系统消息
        chatHistory[0].content = "你是一个专业的英语教学助手，擅长回答关于英语语法、词汇、文学和写作的问题。提供清晰、准确且有教育意义的回答。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 鼓励学习者思考并提供有用的例子。对于语法问题，解释规则并给出示例；对于词汇问题，提供定义、用法和例句；对于文学分析，讨论主题、风格和解释；对于写作建议，提供结构和技巧指导。";
    }
    
    // 显示聊天历史
    function displayChatHistory() {
        chatHistory.forEach(message => {
            if (message.role === 'assistant' || message.role === 'user') {
                displayMessage(message.role, message.content);
            }
        });
        
        // 滚动到底部
        scrollToBottom();
    }
    
    // 发送消息到API
    async function sendMessage() {
        const userMessage = questionInput.value.trim();
        
        // 检查是否为空消息
        if (userMessage === '') return;
        
        // 清空输入框
        questionInput.value = '';
        
        // 显示用户消息
        displayMessage('user', userMessage);
        
        // 添加到聊天历史
        chatHistory.push({
            "role": "user",
            "content": userMessage
        });
        
        // 显示加载状态
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message message-ai loading';
        loadingMessage.innerHTML = '<p>思考中...</p>';
        chatMessages.appendChild(loadingMessage);
        scrollToBottom();
        
        try {
            // 调用API - 确保使用正确的HTTP方法和完整URL
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: chatHistory
                })
            });
            
            if (!response.ok) {
                throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // 移除加载消息
            chatMessages.removeChild(loadingMessage);
            
            // 显示AI回复
            displayMessage('assistant', aiResponse);
            
            // 添加到聊天历史
            chatHistory.push({
                "role": "assistant",
                "content": aiResponse
            });
            
        } catch (error) {
            console.error("Error getting AI response:", error);
            
            // 移除加载消息
            chatMessages.removeChild(loadingMessage);
            
            // 显示错误消息
            displayMessage('assistant', '抱歉，我遇到了问题。请稍后再试。' + error.message);
        }
    }
    
    // 显示消息在聊天界面
    function displayMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = role === 'user' ? 'message message-user' : 'message message-ai';
        
        // 处理内容中可能的换行
        const formattedContent = content.replace(/\n/g, '<br>');
        messageDiv.innerHTML = `<p>${formattedContent}</p>`;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 添加加载动画CSS
    const style = document.createElement('style');
    style.textContent = `
        .loading p::after {
            content: '';
            animation: dots 1.5s infinite;
        }
        
        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }
        
        .topic-card.active {
            border-color: var(--primary-color);
            box-shadow: 0 0 10px rgba(67, 97, 238, 0.3);
            transform: translateY(-5px);
        }
    `;
    document.head.appendChild(style);
}); 