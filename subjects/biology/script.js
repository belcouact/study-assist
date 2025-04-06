document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const questionInput = document.getElementById('biology-question-input');
    const sendQuestionBtn = document.getElementById('send-biology-question');
    const chatMessages = document.getElementById('biology-chat-messages');
    const generateQuizBtn = document.getElementById('generate-quiz');
    const quizContainer = document.getElementById('quiz-container');
    
    // 存储聊天历史
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的生物学教学助手，能够解答关于细胞生物学、遗传学、生态学、人体系统、进化论和微生物学的问题。你将根据用户的教育水平提供适当复杂度的回答。"
        },
        {
            "role": "assistant",
            "content": "你好！我是你的生物学学习助手。有什么关于生物学的问题我可以帮助你解答吗？"
        }
    ];
    
    // 教育水平相关
    let educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
    
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
    
    // 更新系统提示
    function updateSystemPrompt() {
        let levelSpecificPrompt = '';
        
        switch(educationLevel) {
            case 'elementary-school':
                levelSpecificPrompt = '用户是小学生，请使用简单、基础的生物学概念进行解释，多用比喻和直观例子，避免复杂术语。';
                break;
            case 'middle-school':
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的生物学概念，平衡简洁性和教育性。';
                break;
            case 'high-school':
                levelSpecificPrompt = '用户是高中生，可以讨论更复杂的生物学概念，包括分子生物学、遗传学和进化论等高级内容。';
                break;
            default:
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的生物学概念，平衡简洁性和教育性。';
        }
        
        // 更新系统消息
        chatHistory[0].content = "你是一个专业的生物学教学助手，能够解答关于细胞生物学、遗传学、生态学、人体系统、进化论和微生物学的问题。提供清晰、准确且有教育意义的回答。" + levelSpecificPrompt + " 鼓励学习者思考并提供有用的例子。";
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
    
    // Chat functionality
    if (sendQuestionBtn && questionInput && chatMessages) {
        sendQuestionBtn.addEventListener('click', sendMessage);
        
        // Allow Enter key to send message
        questionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
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
    
    // Quiz generation
    if (generateQuizBtn && quizContainer) {
        generateQuizBtn.addEventListener('click', function() {
            const topic = document.getElementById('quiz-topic').value;
            const difficulty = document.getElementById('quiz-difficulty').value;
            const questionCount = document.getElementById('quiz-questions').value;
            
            // Show loading state
            quizContainer.innerHTML = '<p class="text-center">正在生成测验...</p>';
            
            // Simulate loading time
            setTimeout(() => {
                generateQuiz(topic, difficulty, questionCount);
            }, 1500);
        });
    }
    
    // Topic cards click handler
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
        card.addEventListener('click', function() {
            const topic = card.getAttribute('data-topic');
            console.log(`Selected topic: ${topic}`);
            // Here you could implement navigation to topic-specific content or set prompt
            if (questionInput) {
                // 根据不同主题设置提示问题
                switch(topic) {
                    case 'cells':
                        questionInput.value = "请解释细胞的基本结构和功能是什么？";
                        break;
                    case 'genetics':
                        questionInput.value = "DNA和基因是什么关系？它们如何决定生物特征？";
                        break;
                    case 'ecology':
                        questionInput.value = "什么是生态系统？生物和环境如何相互作用？";
                        break;
                    case 'human-body':
                        questionInput.value = "人体的主要器官系统有哪些？它们如何协同工作？";
                        break;
                    case 'evolution':
                        questionInput.value = "达尔文的进化理论是什么？自然选择如何发生？";
                        break;
                    case 'microbiology':
                        questionInput.value = "什么是微生物？它们在生态系统中扮演什么角色？";
                        break;
                }
            }
        });
    });

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
    `;
    document.head.appendChild(style);
    
    // Function to generate a quiz
    function generateQuiz(topic, difficulty, questionCount) {
        let quizHTML = `
            <div class="quiz-header">
                <h3>${getTopicName(topic)}测验</h3>
                <p>难度: ${getDifficultyName(difficulty)} | 问题数量: ${questionCount}</p>
            </div>
            <div class="quiz-questions">
        `;
        
        // Generate sample questions based on topic
        for (let i = 1; i <= questionCount; i++) {
            quizHTML += generateQuizQuestion(i, topic, difficulty);
        }
        
        quizHTML += `
            </div>
            <div class="quiz-controls">
                <button class="btn btn-primary" id="submit-quiz">提交答案</button>
            </div>
        `;
        
        quizContainer.innerHTML = quizHTML;
        
        // Add event listener to submit button
        const submitBtn = document.getElementById('submit-quiz');
        if (submitBtn) {
            submitBtn.addEventListener('click', function() {
                alert('测验已提交！这只是一个演示。在实际应用中，这将评估您的答案并提供结果。');
            });
        }
    }
    
    // Helper function to get topic name
    function getTopicName(topic) {
        const topicNames = {
            'cells': '细胞生物学',
            'genetics': '遗传学',
            'ecology': '生态学',
            'human-body': '人体系统',
            'evolution': '进化论',
            'microbiology': '微生物学'
        };
        return topicNames[topic] || topic;
    }
    
    // Helper function to get difficulty name
    function getDifficultyName(difficulty) {
        const difficultyNames = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        return difficultyNames[difficulty] || difficulty;
    }
    
    // Function to generate a sample quiz question based on educational level
    function generateQuizQuestion(index, topic, difficulty) {
        // Get the user's educational level
        const educationLevel = getCurrentDifficultyLevel ? getCurrentDifficultyLevel() : 'junior';
        
        // Adjust question complexity based on educational level
        let questions;
        
        if (educationLevel === 'elementary') {
            // Simplified questions for elementary school
            questions = {
                'cells': [
                    {
                        question: '植物细胞和动物细胞都有的结构是什么？',
                        options: ['细胞核', '细胞壁', '叶绿体', '液泡'],
                        correct: 0
                    },
                    {
                        question: '细胞的基本功能是什么？',
                        options: ['呼吸', '生长', '思考', '行走'],
                        correct: 1
                    }
                ],
                'ecology': [
                    {
                        question: '食物链中，植物通常处于什么位置？',
                        options: ['开始', '中间', '末端', '不在食物链中'],
                        correct: 0
                    }
                ],
                'human-body': [
                    {
                        question: '人体最大的器官是什么？',
                        options: ['心脏', '大脑', '肺', '皮肤'],
                        correct: 3
                    }
                ]
            };
        } else if (educationLevel === 'junior') {
            // Standard questions for junior high
            questions = {
                'cells': [
                    {
                        question: '细胞中进行能量转换的细胞器是什么？',
                        options: ['线粒体', '高尔基体', '内质网', '核糖体'],
                        correct: 0
                    },
                    {
                        question: '植物细胞与动物细胞的主要区别是什么？',
                        options: ['植物细胞有细胞壁', '动物细胞有细胞核', '植物细胞没有细胞膜', '动物细胞含有DNA'],
                        correct: 0
                    }
                ],
                'genetics': [
                    {
                        question: 'DNA的主要功能是什么？',
                        options: ['储存遗传信息', '合成蛋白质', '产生能量', '调节细胞分裂'],
                        correct: 0
                    }
                ],
                'ecology': [
                    {
                        question: '在食物链中，生产者通常是指什么？',
                        options: ['草食动物', '肉食动物', '绿色植物', '分解者'],
                        correct: 2
                    }
                ],
                'human-body': [
                    {
                        question: '人体最大的器官是什么？',
                        options: ['心脏', '大脑', '肝脏', '皮肤'],
                        correct: 3
                    }
                ],
                'evolution': [
                    {
                        question: '谁提出了进化论？',
                        options: ['门德尔', '达尔文', '牛顿', '爱因斯坦'],
                        correct: 1
                    }
                ]
            };
        } else {
            // Advanced questions for senior high
            questions = {
                'cells': [
                    {
                        question: '细胞中的能量"发电站"是哪个细胞器？',
                        options: ['线粒体', '高尔基体', '内质网', '核糖体'],
                        correct: 0
                    },
                    {
                        question: '植物细胞与动物细胞的主要区别是什么？',
                        options: ['植物细胞有细胞壁', '动物细胞有细胞核', '植物细胞没有细胞膜', '动物细胞含有DNA'],
                        correct: 0
                    }
                ],
                'genetics': [
                    {
                        question: 'DNA分子的基本结构是什么？',
                        options: ['单链', '三股螺旋', '双螺旋', '四面体'],
                        correct: 2
                    },
                    {
                        question: '孟德尔的遗传实验使用了什么植物？',
                        options: ['豌豆', '玉米', '水稻', '小麦'],
                        correct: 0
                    }
                ],
                'ecology': [
                    {
                        question: '在食物链中，生产者通常是指什么？',
                        options: ['草食动物', '肉食动物', '绿色植物', '分解者'],
                        correct: 2
                    }
                ],
                'human-body': [
                    {
                        question: '人体最大的器官是什么？',
                        options: ['心脏', '大脑', '肝脏', '皮肤'],
                        correct: 3
                    }
                ],
                'evolution': [
                    {
                        question: '谁提出了"自然选择"理论？',
                        options: ['拉马克', '门德尔', '达尔文', '华莱士'],
                        correct: 2
                    }
                ],
                'microbiology': [
                    {
                        question: '细菌与病毒的主要区别是什么？',
                        options: ['病毒没有细胞结构', '细菌不能致病', '病毒比细菌大', '细菌不需要宿主'],
                        correct: 0
                    }
                ]
            };
        }
        
        // Get questions for the selected topic
        const topicQuestions = questions[topic] || [];
        if (topicQuestions.length === 0) {
            return `
                <div class="quiz-question">
                    <p>问题 ${index}: 没有可用的${getTopicName(topic)}问题。</p>
                </div>
            `;
        }
        
        // Pick a random question from the topic
        const questionObj = topicQuestions[Math.floor(Math.random() * topicQuestions.length)];
        
        // Generate HTML for the question
        let questionHTML = `
            <div class="quiz-question">
                <p><strong>问题 ${index}:</strong> ${questionObj.question}</p>
                <div class="question-options">
        `;
        
        // Add options
        questionObj.options.forEach((option, i) => {
            questionHTML += `
                <div class="option">
                    <input type="radio" id="q${index}_o${i}" name="q${index}" value="${i}">
                    <label for="q${index}_o${i}">${option}</label>
                </div>
            `;
        });
        
        questionHTML += '</div></div>';
        return questionHTML;
    }
}); 