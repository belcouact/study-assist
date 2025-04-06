document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const chatMessages = document.getElementById('chemistry-chat-messages');
    const questionInput = document.getElementById('chemistry-question-input');
    const sendButton = document.getElementById('send-chemistry-question');
    const topicCards = document.querySelectorAll('.topic-card');
    
    // 存储聊天历史
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的化学教学助手，擅长解答关于元素周期表、化学反应、有机化学、物质结构等问题。你会提供清晰的解释、化学方程式和适合用户教育水平的答案。"
        },
        {
            "role": "assistant",
            "content": "你好！我是你的化学学习助手。有什么关于化学的问题我可以帮你解答吗？"
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
            case 'periodic':
                topicPrompt = "元素周期表是如何组织的？元素的周期性质是什么？";
                break;
            case 'reactions':
                topicPrompt = "化学反应的基本类型有哪些？如何书写和平衡化学方程式？";
                break;
            case 'organic':
                topicPrompt = "有机化学的基本概念是什么？常见的有机化合物有哪些？";
                break;
            case 'structure':
                topicPrompt = "原子的结构是什么？电子轨道和化学键如何形成？";
                break;
            case 'solutions':
                topicPrompt = "溶液的性质有哪些？浓度的不同表示方法是什么？";
                break;
            case 'acids':
                topicPrompt = "酸碱理论是什么？pH值如何计算和测量？";
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
                levelSpecificPrompt = '用户是小学生，请使用简单、基础的化学概念进行解释，多用直观例子和类比，避免复杂公式和术语。重点讲解物质的基本性质和简单变化。';
                break;
            case 'middle-school':
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的化学概念，包括元素周期表、基本反应类型和简单的分子结构等，可以使用基础化学方程式，平衡简洁性和教育性。';
                break;
            case 'high-school':
                levelSpecificPrompt = '用户是高中生，可以讨论更复杂的化学概念，包括化学平衡、热力学、电化学、有机化学和反应机理等高级内容，可以使用更深入的化学公式和方程式。';
                break;
            default:
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的化学概念，包括元素周期表、基本反应类型和简单的分子结构等，可以使用基础化学方程式，平衡简洁性和教育性。';
        }
        
        // 添加主题特定提示
        let topicSpecificPrompt = '';
        
        if (currentTopic) {
            switch(currentTopic) {
                case 'periodic':
                    topicSpecificPrompt = '用户正在学习元素周期表。请专注于元素的分类、周期性质、族特性等概念，并提供清晰的例子。';
                    break;
                case 'reactions':
                    topicSpecificPrompt = '用户正在学习化学反应。请专注于反应类型、化学计量学、反应速率等概念，并提供平衡的化学方程式。';
                    break;
                case 'organic':
                    topicSpecificPrompt = '用户正在学习有机化学。请专注于碳的化合物、官能团、命名规则等概念，并提供适当的分子结构。';
                    break;
                case 'structure':
                    topicSpecificPrompt = '用户正在学习物质结构。请专注于原子结构、分子结构、化学键类型等概念，并使用图形辅助解释。';
                    break;
                case 'solutions':
                    topicSpecificPrompt = '用户正在学习溶液化学。请专注于溶解过程、浓度计算、胶体性质等概念，并提供日常生活中的例子。';
                    break;
                case 'acids':
                    topicSpecificPrompt = '用户正在学习酸碱理论。请专注于酸碱定义、pH值、中和反应等概念，并结合常见物质进行解释。';
                    break;
                default:
                    topicSpecificPrompt = '';
            }
        }
        
        // 更新系统消息
        chatHistory[0].content = "你是一个专业的化学教学助手，擅长解答关于元素周期表、化学反应、有机化学、物质结构等问题。提供清晰的解释和适当深度的回答。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 当回答化学问题时，请在必要时使用化学方程式和分子结构图，可使用Markdown或类似格式展示。";
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
    
    // 处理分子可视化
    const moleculeForm = document.getElementById('molecule-form');
    const moleculeDisplay = document.getElementById('molecule-display');
    
    if (moleculeForm && moleculeDisplay) {
        moleculeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const moleculeName = document.getElementById('molecule-name').value.trim();
            if (!moleculeName) return;
            
            // 显示加载
            moleculeDisplay.innerHTML = '<p class="loading">正在生成分子模型...</p>';
            
            // 模拟加载延迟
            setTimeout(() => {
                // 简单的分子信息库
                const molecules = {
                    'h2o': {
                        name: '水',
                        formula: 'H₂O',
                        structure: '../../assets/images/molecules/water.svg',
                        description: '水是一种由氢和氧组成的简单极性分子，分子式为H₂O。它是地球上最常见的物质之一，也是所有已知生命形式的基础。在室温下，水是无色、无味、无臭的液体。水分子呈现弯曲的几何形状，氧原子带部分负电荷，氢原子带部分正电荷，形成了极性分子。'
                    },
                    'co2': {
                        name: '二氧化碳',
                        formula: 'CO₂',
                        structure: '../../assets/images/molecules/co2.svg',
                        description: '二氧化碳是一种由碳和氧组成的化合物，分子式为CO₂。在标准条件下，它是一种无色无味的气体。二氧化碳分子是线性的，具有O=C=O结构，其中碳原子与两个氧原子形成双键。它是植物光合作用的原料，也是温室气体之一。'
                    },
                    'ch4': {
                        name: '甲烷',
                        formula: 'CH₄',
                        structure: '../../assets/images/molecules/methane.svg',
                        description: '甲烷是最简单的有机化合物，分子式为CH₄。它是一种无色、无味的气体，是天然气的主要成分。甲烷分子呈四面体结构，碳原子位于中心，四个氢原子均匀分布在周围，与碳形成单键。甲烷是重要的能源和化工原料，同时也是强效的温室气体。'
                    },
                    'nacl': {
                        name: '氯化钠',
                        formula: 'NaCl',
                        structure: '../../assets/images/molecules/nacl.svg',
                        description: '氯化钠，通常被称为食盐，是由钠离子(Na⁺)和氯离子(Cl⁻)组成的离子化合物。它不形成分子，而是在晶体中形成离子晶格，每个钠离子被六个氯离子包围，反之亦然。氯化钠在水中可完全溶解，分离成Na⁺和Cl⁻离子。它是人体所需的重要电解质，也广泛用于食品保存和工业生产。'
                    },
                    'c6h12o6': {
                        name: '葡萄糖',
                        formula: 'C₆H₁₂O₆',
                        structure: '../../assets/images/molecules/glucose.svg',
                        description: '葡萄糖是一种单糖，分子式为C₆H₁₂O₆。它是生物体内最重要的能量来源之一，通过光合作用在植物中形成，在动物体内通过糖酵解和三羧酸循环分解产生能量。葡萄糖分子含有一个醛基和五个羟基，在水溶液中主要以环状结构存在。'
                    }
                };
                
                // 转换输入为小写并移除空格
                const moleculeKey = moleculeName.toLowerCase().replace(/\s+/g, '');
                
                // 查找匹配的分子
                const molecule = molecules[moleculeKey] || null;
                
                if (molecule) {
                    moleculeDisplay.innerHTML = `
                        <div class="molecule-card">
                            <div class="molecule-header">
                                <h3>${molecule.name}</h3>
                                <p class="formula">${molecule.formula}</p>
                            </div>
                            <div class="molecule-content">
                                <div class="molecule-image">
                                    <img src="${molecule.structure}" alt="${molecule.name}分子结构">
                                </div>
                                <div class="molecule-info">
                                    <h4>结构信息</h4>
                                    <p>${molecule.description}</p>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    moleculeDisplay.innerHTML = `
                        <div class="molecule-error">
                            <h3>未找到分子</h3>
                            <p>抱歉，我们的数据库中没有"${moleculeName}"的信息。请尝试其他分子名称或化学式，例如：</p>
                            <ul>
                                <li>H2O (水)</li>
                                <li>CO2 (二氧化碳)</li>
                                <li>CH4 (甲烷)</li>
                                <li>NaCl (氯化钠)</li>
                                <li>C6H12O6 (葡萄糖)</li>
                            </ul>
                        </div>
                    `;
                }
            }, 1500);
        });
    }
    
    // 处理元素周期表交互
    const periodicElements = document.querySelectorAll('.element');
    const elementInfoDisplay = document.getElementById('element-info');
    
    if (periodicElements.length > 0 && elementInfoDisplay) {
        periodicElements.forEach(element => {
            element.addEventListener('click', function() {
                const elementSymbol = this.getAttribute('data-symbol');
                showElementInfo(elementSymbol);
            });
        });
        
        function showElementInfo(symbol) {
            // 简单的元素信息库
            const elements = {
                'H': {
                    name: '氢',
                    atomicNumber: 1,
                    atomicWeight: 1.008,
                    category: '非金属',
                    description: '氢是最轻的元素，原子序数为1，在宇宙中含量最丰富。在标准条件下，它是一种无色、无味、无臭、非金属、高度易燃的双原子气体。它与氧反应形成水。'
                },
                'O': {
                    name: '氧',
                    atomicNumber: 8,
                    atomicWeight: 16.00,
                    category: '非金属',
                    description: '氧是一种高活性非金属，原子序数为8，在地球表面最丰富的元素之一。它是呼吸和燃烧必需的气体，构成了水和大多数有机化合物。'
                },
                'C': {
                    name: '碳',
                    atomicNumber: 6,
                    atomicWeight: 12.01,
                    category: '非金属',
                    description: '碳是原子序数为6的非金属元素，是所有已知生命形式的基础。它有多种同素异形体，如石墨和钻石。碳能够形成数百万种不同的化合物，因此有机化学实质上是碳化合物的研究。'
                },
                'Fe': {
                    name: '铁',
                    atomicNumber: 26,
                    atomicWeight: 55.85,
                    category: '过渡金属',
                    description: '铁是一种金属元素，原子序数为26，在地球上分布广泛。它是最常用的金属之一，特别是在形成各种钢合金时。铁在生物体内也很重要，是血红蛋白的组成部分，负责运输氧气。'
                },
                'Na': {
                    name: '钠',
                    atomicNumber: 11,
                    atomicWeight: 22.99,
                    category: '碱金属',
                    description: '钠是一种高度活泼的碱金属，原子序数为11。它是银白色、质软的金属，在自然界中以化合物形式存在，如氯化钠（食盐）。钠在体液平衡和神经传导中起着重要作用。'
                }
            };
            
            // 查找匹配的元素
            const element = elements[symbol] || null;
            
            if (element) {
                elementInfoDisplay.innerHTML = `
                    <div class="element-card">
                        <div class="element-header">
                            <div class="element-symbol">${symbol}</div>
                            <div class="element-basics">
                                <h3>${element.name}</h3>
                                <p>原子序数：${element.atomicNumber}</p>
                                <p>原子量：${element.atomicWeight}</p>
                                <p>分类：${element.category}</p>
                            </div>
                        </div>
                        <div class="element-description">
                            <p>${element.description}</p>
                        </div>
                    </div>
                `;
            } else {
                elementInfoDisplay.innerHTML = `
                    <div class="element-card">
                        <div class="element-header">
                            <div class="element-symbol">${symbol}</div>
                            <div class="element-basics">
                                <h3>未找到元素信息</h3>
                            </div>
                        </div>
                        <div class="element-description">
                            <p>抱歉，我们的数据库中没有关于"${symbol}"的详细信息。请尝试点击其他元素。</p>
                        </div>
                    </div>
                `;
            }
        }
    }
}); 