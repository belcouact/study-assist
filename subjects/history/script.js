document.addEventListener('DOMContentLoaded', function() {
    // Initialize API
    initAPI();
    
    // History chat functionality
    const chatInput = document.getElementById('history-question-input');
    const sendButton = document.getElementById('send-history-question');
    const chatMessages = document.getElementById('history-chat-messages');
    
    // 存储聊天历史
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的历史教学助手，擅长解答关于世界历史、中国历史、重大历史事件、历史人物和历史遗迹等问题。你会提供清晰的解释、历史背景和适合用户教育水平的答案。"
        },
        {
            "role": "assistant",
            "content": "你好！我是你的历史学习助手。有什么历史问题我可以帮你解答吗？"
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
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // 为主题卡片添加点击事件
    const topicCards = document.querySelectorAll('.topic-card');
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
            if (chatInput) {
                chatInput.focus();
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
            case 'ancient':
                topicPrompt = "古代文明如何影响了现代社会？请介绍几个主要的古代文明。";
                break;
            case 'china':
                topicPrompt = "中国历史上最重要的朝代有哪些？它们各有什么特点？";
                break;
            case 'world':
                topicPrompt = "第一次世界大战和第二次世界大战的主要原因是什么？";
                break;
            case 'modern':
                topicPrompt = "冷战时期的主要事件有哪些？它对现代世界格局有什么影响？";
                break;
            case 'figures':
                topicPrompt = "请介绍几位对世界历史产生深远影响的历史人物及其贡献。";
                break;
            case 'culture':
                topicPrompt = "历史上的文化交流如何促进了人类文明的发展？";
                break;
            default:
                return;
        }
        
        // 自动在输入框中填入主题相关问题
        if (chatInput) {
            chatInput.value = topicPrompt;
        }
    }
    
    // 更新系统提示
    function updateSystemPrompt() {
        let levelSpecificPrompt = '';
        
        switch(educationLevel) {
            case 'elementary-school':
                levelSpecificPrompt = '用户是小学生，请使用简单、基础的历史概念进行解释，多用故事和趣味性例子，避免复杂事件和术语。重点讲解历史人物、基本历史事件和有趣的历史故事。';
                break;
            case 'middle-school':
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的历史概念，包括重要历史事件的起因和影响，不同文明的特点等，平衡简洁性和教育性。';
                break;
            case 'high-school':
                levelSpecificPrompt = '用户是高中生，可以讨论更复杂的历史概念，包括历史事件的深层原因分析、不同历史观点的比较和全球历史发展的宏观分析等高级内容。';
                break;
            default:
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的历史概念，包括重要历史事件的起因和影响，不同文明的特点等，平衡简洁性和教育性。';
        }
        
        // 添加主题特定提示
        let topicSpecificPrompt = '';
        
        if (currentTopic) {
            switch(currentTopic) {
                case 'ancient':
                    topicSpecificPrompt = '用户正在学习古代历史。请专注于古代文明的起源、发展、主要成就和对现代社会的影响等内容，提供生动的历史细节和文明特征。';
                    break;
                case 'china':
                    topicSpecificPrompt = '用户正在学习中国历史。请专注于中国不同朝代的特点、重大历史事件、历史人物和文化发展等内容，注重中国历史的连续性和独特性。';
                    break;
                case 'world':
                    topicSpecificPrompt = '用户正在学习世界历史。请专注于世界各地区的历史发展、重大国际事件、国际关系和全球化进程等内容，注重不同地区历史的联系和比较。';
                    break;
                case 'modern':
                    topicSpecificPrompt = '用户正在学习现代历史。请专注于近现代重大事件、社会变革、科技发展和国际关系等内容，注重分析这些事件对当今世界的影响。';
                    break;
                case 'figures':
                    topicSpecificPrompt = '用户正在学习历史人物。请专注于重要历史人物的生平、贡献、历史背景和影响等内容，通过人物故事展现历史发展。';
                    break;
                case 'culture':
                    topicSpecificPrompt = '用户正在学习历史文化。请专注于不同时期和地区的文化特点、艺术成就、思想发展和文化交流等内容，展示文化在历史中的重要作用。';
                    break;
                default:
                    topicSpecificPrompt = '';
            }
        }
        
        // 更新系统消息
        chatHistory[0].content = "你是一个专业的历史教学助手，擅长解答关于世界历史、中国历史、重大历史事件、历史人物和历史遗迹等问题。提供清晰的解释和适当深度的回答。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 当回答历史问题时，请尽量提供准确的时间、地点和人物信息，可以引用历史事实和重要的历史文献。";
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
        if (!chatInput || !chatMessages) return;
        
        const userMessage = chatInput.value.trim();
        
        // 检查是否为空消息
        if (userMessage === '') return;
        
        // 清空输入框
        chatInput.value = '';
        
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
    
    // 处理历史时间线
    const timelineSections = document.querySelectorAll('.timeline-section');
    const timelineNav = document.querySelector('.timeline-navigation');
    
    if (timelineSections.length > 0 && timelineNav) {
        // 创建时间线导航项
        timelineSections.forEach((section, index) => {
            const period = section.getAttribute('data-period');
            const navItem = document.createElement('div');
            navItem.className = 'timeline-nav-item';
            navItem.setAttribute('data-target', period);
            navItem.textContent = period;
            
            // 第一个导航项默认激活
            if (index === 0) {
                navItem.classList.add('active');
            }
            
            // 添加点击事件
            navItem.addEventListener('click', function() {
                // 更新导航项状态
                document.querySelectorAll('.timeline-nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                this.classList.add('active');
                
                // 显示对应时期
                const targetPeriod = this.getAttribute('data-target');
                timelineSections.forEach(s => {
                    if (s.getAttribute('data-period') === targetPeriod) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
            
            timelineNav.appendChild(navItem);
        });
        
        // 默认显示第一个时期
        timelineSections[0].classList.add('active');
    }
    
    // 处理历史测验生成
    const generateQuizBtn = document.getElementById('generate-quiz');
    const quizContainer = document.getElementById('quiz-container');
    
    if (generateQuizBtn && quizContainer) {
        generateQuizBtn.addEventListener('click', function() {
            const topic = document.getElementById('quiz-topic').value;
            const difficulty = document.getElementById('quiz-difficulty').value;
            const questions = document.getElementById('quiz-questions').value;
            
            // 显示加载状态
            quizContainer.innerHTML = '<p class="loading">正在生成历史测验...</p>';
            
            // 模拟API调用生成测验
            setTimeout(() => {
                // 示例问题库 - 实际应用中会从API获取
                const quizQuestions = [
                    {
                        question: "谁是古代中国第一个统一的王朝建立者？",
                        options: ["汉武帝", "秦始皇", "唐太宗", "成吉思汗"],
                        correctAnswer: 1
                    },
                    {
                        question: "第二次世界大战正式结束于哪一年？",
                        options: ["1943年", "1944年", "1945年", "1946年"],
                        correctAnswer: 2
                    },
                    {
                        question: "文艺复兴最早始于欧洲哪个国家？",
                        options: ["法国", "德国", "英国", "意大利"],
                        correctAnswer: 3
                    },
                    {
                        question: "以下哪位是古代埃及最有名的法老之一？",
                        options: ["图坦卡蒙", "汉谟拉比", "亚历山大", "康斯坦丁"],
                        correctAnswer: 0
                    },
                    {
                        question: "中国古代四大发明不包括以下哪项？",
                        options: ["指南针", "火药", "印刷术", "望远镜"],
                        correctAnswer: 3
                    }
                ];
                
                let html = '<div class="quiz">';
                html += `<h3>${getTopicName(topic)}历史测验 (${getDifficultyName(difficulty)}难度)</h3>`;
                
                quizQuestions.forEach((q, i) => {
                    html += `
                        <div class="quiz-question">
                            <h4>${i + 1}. ${q.question}</h4>
                            <div class="quiz-options">
                    `;
                    
                    q.options.forEach((option, j) => {
                        html += `
                            <div class="quiz-option" data-question="${i}" data-option="${j}">
                                <input type="radio" id="q${i}o${j}" name="question${i}" value="${j}">
                                <label for="q${i}o${j}">${option}</label>
                            </div>
                        `;
                    });
                    
                    html += `
                            </div>
                        </div>
                    `;
                });
                
                html += `
                    <div class="quiz-actions">
                        <button id="submit-quiz" class="btn btn-primary">提交答案</button>
                    </div>
                </div>`;
                
                quizContainer.innerHTML = html;
                
                // 添加选项点击事件
                document.querySelectorAll('.quiz-option').forEach(option => {
                    option.addEventListener('click', function() {
                        const questionIndex = this.getAttribute('data-question');
                        const optionIndex = this.getAttribute('data-option');
                        
                        // 选择单选按钮
                        document.getElementById(`q${questionIndex}o${optionIndex}`).checked = true;
                        
                        // 移除同组其他选项的选中状态
                        document.querySelectorAll(`.quiz-option[data-question="${questionIndex}"]`).forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        
                        // 添加选中状态
                        this.classList.add('selected');
                    });
                });
                
                // 添加提交按钮事件
                document.getElementById('submit-quiz').addEventListener('click', function() {
                    // 计算分数
                    let score = 0;
                    let total = quizQuestions.length;
                    
                    quizQuestions.forEach((q, i) => {
                        const selectedOption = document.querySelector(`input[name="question${i}"]:checked`);
                        if (selectedOption) {
                            const selected = parseInt(selectedOption.value);
                            if (selected === q.correctAnswer) {
                                score++;
                                selectedOption.closest('.quiz-option').classList.add('correct');
                            } else {
                                selectedOption.closest('.quiz-option').classList.add('incorrect');
                                document.getElementById(`q${i}o${q.correctAnswer}`).closest('.quiz-option').classList.add('correct');
                            }
                        } else {
                            document.getElementById(`q${i}o${q.correctAnswer}`).closest('.quiz-option').classList.add('correct');
                        }
                    });
                    
                    // 禁用所有输入
                    document.querySelectorAll('.quiz-option input').forEach(input => {
                        input.disabled = true;
                    });
                    
                    // 显示结果
                    const resultsHtml = `
                        <div class="quiz-results">
                            <h3>你的得分: ${score}/${total}</h3>
                            <p>${score === total ? '完美！你对这段历史有很好的掌握。' : 
                               score >= total * 0.7 ? '很好！你对这段历史有很好的理解。' :
                               score >= total * 0.5 ? '不错的尝试！你可能需要复习一下这段历史的某些方面。' :
                               '你可能需要多学习这段历史知识。继续加油！'}</p>
                            <button id="new-quiz" class="btn btn-primary">生成新测验</button>
                        </div>
                    `;
                    
                    // 添加结果到页面
                    const resultsElement = document.createElement('div');
                    resultsElement.className = 'quiz-result-container';
                    resultsElement.innerHTML = resultsHtml;
                    quizContainer.appendChild(resultsElement);
                    
                    // 添加新测验按钮事件
                    document.getElementById('new-quiz').addEventListener('click', function() {
                        quizContainer.innerHTML = '<p class="text-center">配置测验选项并点击"生成测验"开始。</p>';
                    });
                });
                
            }, 1500);
        });
    }
    
    // 辅助函数 - 获取主题名称
    function getTopicName(topicId) {
        const topics = {
            'ancient': '古代',
            'china': '中国',
            'world': '世界',
            'modern': '现代',
            'figures': '历史人物',
            'culture': '文化历史'
        };
        return topics[topicId] || topicId;
    }
    
    // 辅助函数 - 获取难度名称
    function getDifficultyName(difficultyId) {
        const difficulties = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        return difficulties[difficultyId] || difficultyId;
    }
}); 