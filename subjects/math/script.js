/**
 * 数学学科特定脚本
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initMathPage();
    
    // 初始化聊天功能
    initChatFeature();
    
    // 初始化选项卡切换
    initTabs();
});

/**
 * 初始化数学页面
 */
function initMathPage() {
    console.log('数学页面已初始化');
    
    // 初始化MathJax（如果尚未初始化）
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().catch(function(err) {
            console.error('MathJax渲染错误:', err);
        });
    }
    
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
 * 初始化选项卡功能
 */
function initTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标选项卡ID
            const targetId = this.getAttribute('data-tab');
            
            // 移除所有活跃状态
            tabLinks.forEach(link => link.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 添加活跃状态到当前选项卡
            this.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });
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
        const aiResponse = getMathResponse(message);
        
        // 添加AI回复
        addMessage('system', aiResponse);
        
        // 渲染数学公式
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise().catch(function(err) {
                console.error('MathJax渲染错误:', err);
            });
        }
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
    // 使用textContent以防注入，对于数学公式我们后面会处理
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
 * 获取数学相关的AI响应（模拟）
 * @param {string} userMessage - 用户消息
 * @returns {string} AI响应
 */
function getMathResponse(userMessage) {
    // 在实际应用中，这里应该调用API获取响应
    // 这里仅用简单的条件判断来模拟AI响应
    
    const lowerMsg = userMessage.toLowerCase();
    
    // 检测是否是数学问题
    if (lowerMsg.includes('解方程') || lowerMsg.includes('方程') || lowerMsg.includes('=')) {
        if (lowerMsg.includes('x^2') || lowerMsg.includes('x²')) {
            return '这是一个二次方程。一般形式为 $ax^2 + bx + c = 0$，其解为 $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$。如果你提供具体的方程，我可以帮你解答。';
        } else if (lowerMsg.includes('x') && lowerMsg.includes('=')) {
            return '这是一个线性方程。一般形式为 $ax + b = c$，其解为 $x = \\frac{c-b}{a}$。如果你提供具体的方程，我可以帮你解答。';
        }
    } else if (lowerMsg.includes('三角函数') || lowerMsg.includes('sin') || lowerMsg.includes('cos') || lowerMsg.includes('tan')) {
        return '三角函数是描述直角三角形的角度和边长比例关系的函数。基本三角函数有：$\\sin(θ)$、$\\cos(θ)$ 和 $\\tan(θ)$。例如，$\\sin(θ) = \\frac{对边}{斜边}$。';
    } else if (lowerMsg.includes('微分') || lowerMsg.includes('导数')) {
        return '导数表示函数在某一点的瞬时变化率。对于函数 $f(x)$，其导数 $f\'(x)$ 的定义为：$f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$。';
    } else if (lowerMsg.includes('积分')) {
        return '积分是微积分中的基本运算，分为定积分和不定积分。定积分 $\\int_a^b f(x) dx$ 表示函数 $f(x)$ 在区间 $[a,b]$ 上与x轴围成的面积。';
    } else if (lowerMsg.includes('圆') || lowerMsg.includes('面积')) {
        return '圆的面积公式是 $A = \\pi r^2$，其中 $r$ 是圆的半径。圆的周长公式是 $C = 2\\pi r$。';
    } else if (lowerMsg.includes('矩阵')) {
        return '矩阵是一个按照长方阵列排列的复数或实数集合。例如，$A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$ 是一个2×2矩阵。矩阵的行列式为 $|A| = ad - bc$。';
    } else if (lowerMsg.includes('概率') || lowerMsg.includes('统计')) {
        return '概率论是研究随机现象数量规律的数学分支。例如，抛一枚公平硬币，正面朝上的概率是 $P(H) = \\frac{1}{2}$。';
    } else if (lowerMsg.includes('你好') || lowerMsg.includes('嗨') || lowerMsg.includes('您好')) {
        return '你好！我是你的数学学习助手，很高兴为你服务。你可以问我任何数学问题，比如代数、几何、微积分等。';
    } else if (lowerMsg.includes('谢谢') || lowerMsg.includes('感谢')) {
        return '不用谢！如果你有其他数学问题，随时可以问我。';
    } else if (lowerMsg.length < 10) {
        return '请提供更详细的数学问题，这样我才能给你准确的回答。';
    } else {
        return '这是一个有趣的问题。在实际应用中，我会通过专业的数学引擎为你提供解答。现在是演示阶段，我的回答功能有限。如果是数学公式相关的问题，我可以使用LaTeX格式为你展示，例如：$E = mc^2$。';
    }
} 