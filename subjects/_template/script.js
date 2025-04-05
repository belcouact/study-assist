/**
 * 学科页面特定脚本
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initSubjectPage();
    
    // 初始化聊天功能
    initChatFeature();
});

/**
 * 初始化学科页面
 */
function initSubjectPage() {
    console.log('学科页面已初始化');
    
    // 可以在这里添加学科特定的初始化代码
    
    // 添加主题卡片悬停效果
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // 悬停效果可以在CSS中处理
        });
    });
    
    // 检查用户登录状态，并相应地更新UI
    updateUIBasedOnAuth();
}

/**
 * 根据认证状态更新UI
 */
function updateUIBasedOnAuth() {
    // 检查是否存在Auth模块
    if (typeof auth !== 'undefined' && auth.isLoggedIn()) {
        // 用户已登录，可以显示个性化内容
        const user = auth.getUser();
        console.log('当前用户:', user);
        
        // 这里可以基于用户信息更新页面
    } else {
        // 用户未登录，可以显示登录提示
        console.log('用户未登录');
    }
}

/**
 * 初始化聊天功能
 */
function initChatFeature() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (!chatMessages || !userInput || !sendBtn) return;
    
    // 添加发送按钮点击事件
    sendBtn.addEventListener('click', sendMessage);
    
    // 添加输入框回车键事件
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 自动滚动到底部
    scrollToBottom();
}

/**
 * 发送消息
 */
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    
    // 获取用户输入的消息
    const message = userInput.value.trim();
    
    // 如果消息为空，不处理
    if (!message) return;
    
    // 添加用户消息到聊天区域
    addMessage('user', message);
    
    // 清空输入框
    userInput.value = '';
    
    // 模拟处理中状态
    const loadingId = addMessage('system', '正在思考...');
    
    // 调用API获取回复（这里使用模拟数据）
    setTimeout(() => {
        // 移除加载消息
        removeMessage(loadingId);
        
        // 模拟AI响应
        const aiResponse = getAIResponse(message);
        
        // 添加AI回复
        addMessage('system', aiResponse);
    }, 1000);
}

/**
 * 添加消息到聊天区域
 * @param {string} type - 消息类型：'user' 或 'system'
 * @param {string} content - 消息内容
 * @returns {string} 消息ID
 */
function addMessage(type, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageId = 'msg-' + Date.now();
    
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = `message ${type}-message`;
    
    // 创建消息内容
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // 添加消息文本
    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    messageContent.appendChild(paragraph);
    
    // 将内容添加到消息元素
    messageDiv.appendChild(messageContent);
    
    // 将消息添加到聊天区域
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    scrollToBottom();
    
    return messageId;
}

/**
 * 移除指定ID的消息
 * @param {string} messageId - 消息ID
 */
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

/**
 * 将聊天区域滚动到底部
 */
function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * 获取AI响应（模拟）
 * @param {string} userMessage - 用户消息
 * @returns {string} AI响应
 */
function getAIResponse(userMessage) {
    // 在实际应用中，这里应该调用API获取响应
    // 这里仅用简单的条件判断来模拟AI响应
    
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('你好') || lowerMsg.includes('嗨') || lowerMsg.includes('您好')) {
        return '你好！我是你的学科学习助手，很高兴为你服务。';
    } else if (lowerMsg.includes('谢谢') || lowerMsg.includes('感谢')) {
        return '不用谢！有任何问题都可以随时问我。';
    } else if (lowerMsg.includes('再见') || lowerMsg.includes('拜拜')) {
        return '再见！祝你学习顺利！';
    } else if (lowerMsg.includes('帮助') || lowerMsg.includes('怎么用')) {
        return '我可以回答你关于这个学科的问题，帮助你理解知识点，或者为你提供学习资源。请直接告诉我你想了解什么。';
    } else if (lowerMsg.length < 10) {
        return '请告诉我更多信息，这样我才能更好地帮助你。';
    } else {
        return '这是一个很好的问题。在实际应用中，我会通过AI服务提供专业的解答。现在是演示阶段，请理解功能有限。';
    }
} 