document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const chatMessages = document.getElementById('physics-chat-messages');
    const questionInput = document.getElementById('physics-question-input');
    const sendButton = document.getElementById('send-physics-question');
    const topicCards = document.querySelectorAll('.topic-card');
    
    // 存储聊天历史
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的物理学教学助手，擅长解答关于力学、热学、光学、电磁学、现代物理等物理学分支的问题。你会提供清晰的解释、公式推导和实例，适合用户的教育水平。"
        },
        {
            "role": "assistant",
            "content": "你好！我是你的物理学习助手。有什么物理问题我可以帮你解答吗？"
        }
    ];
    
    // 教育水平相关
    let educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
    
    // 当前选择的主题
    let currentTopic = null;
    
    // 监听发送按钮点击
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // 监听输入框回车事件
    if (questionInput) {
        questionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
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
            if (questionInput) {
                questionInput.focus();
            }
        });
    });
    
    // 从页面加载时初始化聊天界面
    initializeChat();
    
    // 初始化聊天界面
    function initializeChat() {
        // 清空聊天区域
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
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
            case 'mechanics':
                topicPrompt = "牛顿运动定律是什么？它们如何描述物体的运动？";
                break;
            case 'thermodynamics':
                topicPrompt = "热力学第一定律和第二定律分别是什么？它们有什么重要意义？";
                break;
            case 'waves':
                topicPrompt = "什么是波？波的基本特性有哪些？";
                break;
            case 'optics':
                topicPrompt = "光的折射现象是什么？斯涅尔定律如何描述折射？";
                break;
            case 'electromagnetism':
                topicPrompt = "电场和磁场有什么关系？麦克斯韦方程组的物理意义是什么？";
                break;
            case 'quantum':
                topicPrompt = "量子力学的基本原理是什么？它与经典物理学有哪些本质区别？";
                break;
            default:
                return;
        }
        
        // 自动在输入框中填入主题相关问题
        if (questionInput) {
            questionInput.value = topicPrompt;
        }
    }
    
    // 更新系统提示
    function updateSystemPrompt() {
        let levelSpecificPrompt = '';
        
        switch(educationLevel) {
            case 'elementary-school':
                levelSpecificPrompt = '用户是小学生，请使用简单、基础的物理概念进行解释，多用日常生活例子，避免复杂公式和术语。重点讲解基础的力、运动、能量概念。';
                break;
            case 'middle-school':
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的物理概念，包括牛顿定律、能量、简单电路等，可以使用基础数学公式，平衡简洁性和教育性。';
                break;
            case 'high-school':
                levelSpecificPrompt = '用户是高中生，可以讨论更复杂的物理概念，包括动量、电磁学、波动光学、热力学和现代物理入门等内容，可以使用更深入的数学描述。';
                break;
            default:
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的物理概念，包括牛顿定律、能量、简单电路等，可以使用基础数学公式，平衡简洁性和教育性。';
        }
        
        // 添加主题特定提示
        let topicSpecificPrompt = '';
        
        if (currentTopic) {
            switch(currentTopic) {
                case 'mechanics':
                    topicSpecificPrompt = '用户正在学习力学。请专注于牛顿运动定律、力、运动、功和能等概念，并提供清晰的例子和适当的公式。';
                    break;
                case 'thermodynamics':
                    topicSpecificPrompt = '用户正在学习热力学。请专注于温度、热、内能、热力学定律等概念，并结合日常现象进行解释。';
                    break;
                case 'waves':
                    topicSpecificPrompt = '用户正在学习波动学。请专注于波的特性、干涉、衍射、多普勒效应等概念，并提供适当的实例。';
                    break;
                case 'optics':
                    topicSpecificPrompt = '用户正在学习光学。请专注于反射、折射、色散、干涉、衍射等光学现象，尽可能使用图形辅助解释。';
                    break;
                case 'electromagnetism':
                    topicSpecificPrompt = '用户正在学习电磁学。请专注于电场、磁场、电磁感应、电路等概念，根据用户的学习阶段提供适当的解释。';
                    break;
                case 'quantum':
                    topicSpecificPrompt = '用户正在学习现代物理。请专注于量子理论、相对论等现代物理概念，注意根据用户的学习阶段调整解释的深度。';
                    break;
                default:
                    topicSpecificPrompt = '';
            }
        }
        
        // 更新系统消息
        chatHistory[0].content = "你是一个专业的物理学教学助手，擅长解答关于力学、热学、光学、电磁学、现代物理等物理学分支的问题。提供清晰的解释和适当深度的回答。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 当回答物理问题时，请在必要时使用公式，可使用Markdown或LaTeX格式展示。";
    }
    
    // 显示聊天历史
    function displayChatHistory() {
        if (!chatMessages) return;
        
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
        if (!questionInput || !chatMessages) return;
        
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
            // 调用API - 使用正确的API端点
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
        if (!chatMessages) return;
        
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
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
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
    
    // 处理实验模拟
    const simulationForm = document.getElementById('simulation-form');
    const simulationResult = document.getElementById('simulation-results');
    
    if (simulationForm && simulationResult) {
        simulationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const simulationType = document.getElementById('simulation-type').value;
            const initialVelocity = parseFloat(document.getElementById('initial-velocity').value) || 0;
            const angle = parseFloat(document.getElementById('angle').value) || 0;
            const gravity = parseFloat(document.getElementById('gravity').value) || 9.8;
            
            // 显示加载
            simulationResult.innerHTML = '<p class="loading">正在计算...</p>';
            
            // 模拟计算延迟
            setTimeout(() => {
                // 根据选择的模拟类型执行不同的计算
                if (simulationType === 'projectile') {
                    // 抛体运动模拟
                    const angleRad = angle * Math.PI / 180; // 角度转弧度
                    const v0x = initialVelocity * Math.cos(angleRad);
                    const v0y = initialVelocity * Math.sin(angleRad);
                    
                    const timeOfFlight = (2 * v0y) / gravity;
                    const maxHeight = (v0y * v0y) / (2 * gravity);
                    const range = (initialVelocity * initialVelocity * Math.sin(2 * angleRad)) / gravity;
                    
                    simulationResult.innerHTML = `
                        <div class="simulation-results">
                            <h3>抛体运动模拟结果</h3>
                            <div class="result-data">
                                <div class="result-item">
                                    <h4>飞行时间</h4>
                                    <p>${timeOfFlight.toFixed(2)} 秒</p>
                                </div>
                                <div class="result-item">
                                    <h4>最大高度</h4>
                                    <p>${maxHeight.toFixed(2)} 米</p>
                                </div>
                                <div class="result-item">
                                    <h4>水平距离</h4>
                                    <p>${range.toFixed(2)} 米</p>
                                </div>
                            </div>
                            <div class="simulation-visual">
                                <img src="../../assets/images/projectile.svg" alt="抛体运动轨迹">
                                <p>抛体运动轨迹示意图</p>
                            </div>
                        </div>
                    `;
                } else if (simulationType === 'pendulum') {
                    // 单摆模拟
                    const length = parseFloat(document.getElementById('pendulum-length').value) || 1;
                    const amplitude = parseFloat(document.getElementById('pendulum-amplitude').value) || 10;
                    
                    const period = 2 * Math.PI * Math.sqrt(length / gravity);
                    
                    simulationResult.innerHTML = `
                        <div class="simulation-results">
                            <h3>单摆模拟结果</h3>
                            <div class="result-data">
                                <div class="result-item">
                                    <h4>摆的周期</h4>
                                    <p>${period.toFixed(2)} 秒</p>
                                </div>
                                <div class="result-item">
                                    <h4>摆长</h4>
                                    <p>${length.toFixed(2)} 米</p>
                                </div>
                                <div class="result-item">
                                    <h4>振幅</h4>
                                    <p>${amplitude.toFixed(2)} 度</p>
                                </div>
                            </div>
                            <div class="simulation-visual">
                                <img src="../../assets/images/pendulum.svg" alt="单摆运动示意图">
                                <p>单摆运动示意图</p>
                            </div>
                        </div>
                    `;
                } else {
                    // 其他模拟
                    simulationResult.innerHTML = `
                        <div class="simulation-results">
                            <h3>${simulationType}模拟</h3>
                            <p>此模拟类型正在开发中，敬请期待！</p>
                        </div>
                    `;
                }
            }, 1000);
        });
        
        // 根据模拟类型动态显示不同的参数输入
        const simulationType = document.getElementById('simulation-type');
        if (simulationType) {
            simulationType.addEventListener('change', function() {
                const pendulumParams = document.getElementById('pendulum-params');
                const projectileParams = document.getElementById('projectile-params');
                
                if (this.value === 'pendulum') {
                    if (pendulumParams) pendulumParams.style.display = 'block';
                    if (projectileParams) projectileParams.style.display = 'none';
                } else if (this.value === 'projectile') {
                    if (pendulumParams) pendulumParams.style.display = 'none';
                    if (projectileParams) projectileParams.style.display = 'block';
                } else {
                    if (pendulumParams) pendulumParams.style.display = 'none';
                    if (projectileParams) projectileParams.style.display = 'none';
                }
            });
        }
    }
}); 