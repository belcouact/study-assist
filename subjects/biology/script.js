document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const questionInput = document.getElementById('biology-question-input');
    const sendQuestionBtn = document.getElementById('send-biology-question');
    const chatMessages = document.getElementById('biology-chat-messages');
    const generateQuizBtn = document.getElementById('generate-quiz');
    const quizContainer = document.getElementById('quiz-container');
    
    // Chat functionality
    if (sendQuestionBtn && questionInput && chatMessages) {
        sendQuestionBtn.addEventListener('click', function() {
            const question = questionInput.value.trim();
            if (question !== '') {
                // Add user message
                addMessage(question, 'user');
                
                // Simulate AI response based on educational level
                setTimeout(() => {
                    const difficulty = getCurrentDifficultyLevel ? getCurrentDifficultyLevel() : 'junior';
                    
                    // Different responses based on difficulty
                    let responses;
                    if (difficulty === 'elementary') {
                        responses = [
                            "这是个很好的问题！细胞是生命的基本单位，就像一个小房子，里面有不同的部分各司其职。",
                            "植物能通过光合作用制造食物，利用阳光、水和空气中的二氧化碳。",
                            "我们的身体有很多系统一起工作，比如心脏负责输送血液，肺负责呼吸。",
                            "动物和植物生活在不同的环境中，它们彼此依赖，共同组成生态系统。"
                        ];
                    } else if (difficulty === 'junior') {
                        responses = [
                            "这是个很好的生物学问题！细胞是生命的基本单位，它包含了细胞核、细胞质和细胞膜等结构。",
                            "DNA是遗传信息的载体，位于细胞核内，决定了生物的特征。",
                            "生态系统由生物群落和环境组成，包括食物链和能量流动。",
                            "人体由多个系统组成，包括循环系统、消化系统和神经系统等，它们协同工作。"
                        ];
                    } else {
                        responses = [
                            "这是个很好的生物学问题！细胞是生命的基本单位，它包含了各种重要的细胞器，如线粒体、叶绿体和细胞核等。",
                            "DNA（脱氧核糖核酸）是遗传信息的载体，它由两条互补的核苷酸链组成，呈双螺旋结构。",
                            "生态系统是生物群落与其物理环境相互作用形成的功能单位，其中包括生产者、消费者和分解者。",
                            "人体有多个系统协同工作，包括循环系统、消化系统、呼吸系统、神经系统等，它们共同维持着人体的正常运作。"
                        ];
                    }
                    
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    addMessage(randomResponse, 'ai');
                }, 1000);
                
                // Clear input
                questionInput.value = '';
            }
        });
        
        // Allow Enter key to send message
        questionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendQuestionBtn.click();
            }
        });
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
            // Here you could implement navigation to topic-specific content
        });
    });
    
    // Function to add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(`message-${sender}`);
        
        const messagePara = document.createElement('p');
        messagePara.textContent = text;
        
        messageDiv.appendChild(messagePara);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
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
        
        // Get questions for the selected topic or use default
        const topicQuestions = questions[topic] || questions['cells'];
        
        // If no questions available for the topic, return a message
        if (!topicQuestions || topicQuestions.length === 0) {
            return `
                <div class="quiz-question">
                    <h4>该主题暂无适合您学习阶段的问题</h4>
                </div>
            `;
        }
        
        // Select a random question from the topic
        const randomIndex = Math.floor(Math.random() * topicQuestions.length);
        const selectedQuestion = topicQuestions[randomIndex];
        
        return `
            <div class="quiz-question">
                <h4>问题 ${index}：${selectedQuestion.question}</h4>
                <div class="quiz-options">
                    ${selectedQuestion.options.map((option, i) => `
                        <div class="quiz-option">
                            <input type="radio" id="q${index}o${i}" name="q${index}" value="${i}">
                            <label for="q${index}o${i}">${option}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Initialize taxonomy display buttons
    const taxonomyButtons = document.querySelectorAll('.property-btn');
    if (taxonomyButtons.length > 0) {
        taxonomyButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                taxonomyButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get selected property
                const property = this.getAttribute('data-property');
                console.log(`Selected taxonomy level: ${property}`);
                
                // Here you would implement the logic to update the taxonomy display
                // based on the selected classification level
            });
        });
    }
}); 