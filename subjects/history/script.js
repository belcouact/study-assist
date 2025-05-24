document.addEventListener('DOMContentLoaded', function() {
    // Initialize quiz generator
    initQuizGenerator();
    
    // Initialize chat functionality
    initHistoryChat();
    
    // Initialize timeline functionality
    initTimeline();
});

/**
 * Initialize the quiz generator
 */
function initQuizGenerator() {
    const generateBtn = document.getElementById('generate-quiz');
    const quizContainer = document.getElementById('quiz-container');
    const topicSelect = document.getElementById('quiz-topic');
    const difficultySelect = document.getElementById('quiz-difficulty');
    const questionsSelect = document.getElementById('quiz-questions');
    
    if (!generateBtn || !quizContainer) return;
    
    generateBtn.addEventListener('click', async () => {
        // Show loading state
        quizContainer.innerHTML = '<div class="text-center"><p>正在生成测验中...</p></div>';
        
        try {
            // Get quiz options
            const topic = topicSelect.value;
            const difficulty = difficultySelect.value;
            const count = parseInt(questionsSelect.value);
            
            // Get education level from header profile display
            const profileDisplay = document.querySelector('.profile-display');
            let educationLevel = 'middle-school'; // Default value
            if (profileDisplay) {
                const levelText = profileDisplay.textContent.trim();
                if (levelText.includes('小学')) {
                    educationLevel = 'elementary-school';
                } else if (levelText.includes('初中')) {
                    educationLevel = 'middle-school';
                } else if (levelText.includes('高中')) {
                    educationLevel = 'high-school';
                }
            }
            
            const levelName = getEducationLevelName(educationLevel);
            const topicName = getTopicName(topic);
            const difficultyName = getDifficultyName(difficulty);
            
            // Adjust difficulty and content based on education level
            let levelSpecificPrompt = '';
            let difficultyAdjustment = '';
            
            switch(educationLevel) {
                case 'elementary-school':
                    levelSpecificPrompt = '题目应该简单易懂，使用基础词汇和简单句子结构。每个问题都应该有明确的答案，避免模棱两可的情况。解释应该使用简单的语言，并包含具体的例子。';
                    difficultyAdjustment = 'easy';
                    break;
                case 'middle-school':
                    levelSpecificPrompt = '题目应该包含基础到中等难度的内容，使用适当的学术词汇。可以包含一些需要推理的问题，但答案应该相对明确。解释应该详细但不过于复杂。';
                    difficultyAdjustment = difficulty === 'hard' ? 'medium' : difficulty;
                    break;
                case 'high-school':
                    levelSpecificPrompt = '题目可以包含更复杂的内容，使用高级词汇和复杂句子结构。可以包含需要批判性思维的问题，以及一些需要深入理解的概念。解释应该全面且专业。';
                    difficultyAdjustment = difficulty;
                    break;
                default:
                    levelSpecificPrompt = '题目应该适合初中生水平，使用适当的词汇和句子结构。';
                    difficultyAdjustment = difficulty === 'hard' ? 'medium' : difficulty;
            }
            
            // Build system message
            const systemMessage = `你是一个专业的历史教育助手，现在需要为${levelName}学生生成一个关于${topicName}的${difficultyName}难度测验，包含${count}道选择题。
            
            ${levelSpecificPrompt}
            
            请特别注意这些历史时期的具体内容范围：
            - 古代文明（前3500–500年）：农业、文字、帝国的兴起与发展，包括美索不达米亚、埃及、印度河流域、黄河流域等古代文明。
            - 后古典时代（500–1450年）：宗教传播、跨洲贸易与文化交流，包括封建制度、伊斯兰扩张、宋朝繁荣、蒙古帝国等。
            - 近代早期（1450–1750年）：全球化萌芽、殖民主义与贸易扩张，包括航海大发现、文艺复兴、宗教改革等。
            - 革命与工业化（1750–1914年）：工业资本兴起、民族国家形成，包括美国独立、法国大革命、工业革命等。
            - 世界大战与冷战（1914–1991年）：意识形态对抗、科技战争发展，包括两次世界大战、冷战、非殖民化运动等。
            - 当代全球化（1991年–至今）：数字时代变革、世界多极化，包括互联网崛起、恐怖主义、气候变化等全球性问题。
            
            请确保生成的问题严格针对所选择的【${topicName}】时期，不要包含其他时期的内容。
            
            每个问题应包含问题描述、4个选项（A、B、C、D）、正确答案和详细的解释说明。
            解释说明应该包含：
            1. 为什么这个选项是正确的
            2. 其他选项为什么是错误的
            3. 相关的历史背景知识
            4. 适合${levelName}学生理解的具体例子
            
            请确保题目难度适合${levelName}学生的水平，避免过于简单或过于困难。
            请以JSON格式回复，格式如下:
            {
              "title": "测验标题",
              "questions": [
                {
                  "id": "1",
                  "question": "问题描述",
                  "options": [
                    { "id": "A", "text": "选项A内容" },
                    { "id": "B", "text": "选项B内容" },
                    { "id": "C", "text": "选项C内容" },
                    { "id": "D", "text": "选项D内容" }
                  ],
                  "correctAnswer": "正确选项的ID（A/B/C/D）",
                  "explanation": "详细的解释说明，包括正确答案的原因、错误选项的分析和相关历史知识"
                }
              ]
            }`;
            
            // Call DeepSeek API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            "role": "system",
                            "content": systemMessage
                        },
                        {
                            "role": "user",
                            "content": `请生成一个关于${topicName}的${difficultyName}难度测验，包含${count}道选择题，适合${levelName}学生的水平。`
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                throw new Error(`网络响应不正常: ${response.status}`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // Parse JSON response
            let quiz;
            try {
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    quiz = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('无法从响应中提取JSON');
                }
                
                if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
                    throw new Error('解析的JSON格式不正确');
                }
                
                renderQuiz(quiz);
            } catch (jsonError) {
                console.error('解析AI响应时出错:', jsonError);
                quizContainer.innerHTML = `
                    <div class="text-center text-error">
                        <p>抱歉，生成测验时出现错误。请再试一次。</p>
                        <p class="small">${jsonError.message}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('生成测验时出错:', error);
            quizContainer.innerHTML = `
                <div class="text-center text-error">
                    <p>抱歉，生成测验时出现错误。请再试一次。</p>
                    <p class="small">${error.message}</p>
                </div>
            `;
        }
    });
}

/**
 * Render the quiz with navigation
 */
function renderQuiz(quiz) {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;
    
    let currentQuestionIndex = 0;
    const userAnswers = new Array(quiz.questions.length).fill(null);
    
    function renderCurrentQuestion() {
        const question = quiz.questions[currentQuestionIndex];
        
        let html = `
            <div class="quiz-header">
                <h3>${quiz.title}</h3>
                <p class="quiz-progress">第 ${currentQuestionIndex + 1} 题，共 ${quiz.questions.length} 题</p>
            </div>
            <div class="quiz-question">
                <p>${question.question}</p>
                <div class="quiz-options">
        `;
        
        question.options.forEach(option => {
            const isSelected = userAnswers[currentQuestionIndex] === option.id;
            html += `
                <div class="quiz-option ${isSelected ? 'selected' : ''}" data-option="${option.id}">
                    <label>
                        <input type="radio" name="q${currentQuestionIndex}" value="${option.id}" ${isSelected ? 'checked' : ''}>
                        <span>${option.text}</span>
                    </label>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="quiz-actions">
                    <button class="btn btn-primary" id="confirm-answer" ${!userAnswers[currentQuestionIndex] ? 'disabled' : ''}>
                        确认答案
                    </button>
                </div>
                <div class="quiz-feedback" style="display: none;">
                    <div class="answer-feedback">
                        <h4>正确答案：${question.options.find(o => o.id === question.correctAnswer).text}</h4>
                        <p class="explanation">${question.explanation || '暂无详细解释'}</p>
                    </div>
                </div>
            </div>
            <div class="quiz-navigation">
                <button class="btn btn-outline" id="prev-question" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
                    上一题
                </button>
                <button class="btn btn-primary" id="next-question">
                    ${currentQuestionIndex === quiz.questions.length - 1 ? '完成测验' : '下一题'}
                </button>
            </div>
        `;
        
        quizContainer.innerHTML = html;
        
        // Add event listeners
        const options = quizContainer.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const optionId = option.dataset.option;
                userAnswers[currentQuestionIndex] = optionId;
                options.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                document.getElementById('confirm-answer').disabled = false;
            });
        });
        
        const confirmBtn = document.getElementById('confirm-answer');
        confirmBtn.addEventListener('click', () => {
            const feedback = quizContainer.querySelector('.quiz-feedback');
            feedback.style.display = 'block';
            confirmBtn.disabled = true;
            
            // Disable all options
            options.forEach(option => {
                option.style.pointerEvents = 'none';
                if (option.dataset.option === question.correctAnswer) {
                    option.classList.add('correct');
                } else if (option.dataset.option === userAnswers[currentQuestionIndex]) {
                    option.classList.add('incorrect');
                }
            });
        });
        
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        
        prevBtn.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderCurrentQuestion();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentQuestionIndex === quiz.questions.length - 1) {
                showResults();
            } else {
                currentQuestionIndex++;
                renderCurrentQuestion();
            }
        });
    }
    
    function showResults() {
        let correctCount = 0;
        const results = quiz.questions.map((question, index) => {
            const isCorrect = userAnswers[index] === question.correctAnswer;
            if (isCorrect) correctCount++;
            return {
                question: question.question,
                userAnswer: userAnswers[index],
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            };
        });
        
        const percentage = Math.round((correctCount / quiz.questions.length) * 100);
        const grade = getGrade(percentage);
        
        let html = `
            <div class="quiz-results">
                <h3>测验结果</h3>
                <div class="result-summary">
                    <p>得分：${correctCount} / ${quiz.questions.length} (${percentage}%)</p>
                    <p class="grade">等级：${grade}</p>
                    <p class="result-message">
                        ${percentage >= 80 ? '太棒了！你对这个主题掌握得很好！' :
                          percentage >= 60 ? '不错！继续努力，你可以做得更好！' :
                          '继续学习，相信你下次一定能取得更好的成绩！'}
                    </p>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" id="retry-quiz">重新测验</button>
                    <button class="btn btn-outline" id="learning-assessment">学习评估</button>
                </div>
            </div>
        `;
        
        quizContainer.innerHTML = html;
        
        const retryBtn = document.getElementById('retry-quiz');
        retryBtn.addEventListener('click', () => {
            currentQuestionIndex = 0;
            userAnswers.fill(null);
            renderCurrentQuestion();
        });
        
        const assessmentBtn = document.getElementById('learning-assessment');
        assessmentBtn.addEventListener('click', async () => {
            assessmentBtn.disabled = true;
            assessmentBtn.textContent = '评估中...';
            
            try {
                const topic = document.getElementById('quiz-topic').value;
                const topicName = getTopicName(topic);
                const educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
                const levelName = getEducationLevelName(educationLevel);
                
                const assessmentPrompt = `你是一个专业的历史教育专家。请根据以下测验结果，为${levelName}学生提供关于${topicName}主题的学习评估和改进建议：
                
                测验结果：
                - 总分：${correctCount}/${quiz.questions.length} (${percentage}%)
                - 等级：${grade}
                
                详细答题情况：
                ${results.map((result, index) => `
                ${index + 1}. 问题：${result.question}
                   学生答案：${result.userAnswer ? quiz.questions[index].options.find(o => o.id === result.userAnswer).text : '未作答'}
                   正确答案：${quiz.questions[index].options.find(o => o.id === result.correctAnswer).text}
                   是否正确：${result.isCorrect ? '是' : '否'}
                `).join('\n')}
                
                请提供：
                1. 知识掌握情况分析
                2. 具体薄弱环节
                3. 针对性的学习建议
                4. 推荐的学习资源和方法
                
                请用中文回答，语言要适合${levelName}学生的理解水平。`;
                
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                "role": "system",
                                "content": "你是一个专业的历史教育专家，擅长分析学生的学习情况并提供针对性的学习建议。"
                            },
                            {
                                "role": "user",
                                "content": assessmentPrompt
                            }
                        ]
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`网络响应不正常: ${response.status}`);
                }
                
                const data = await response.json();
                const assessment = data.choices[0].message.content;
                
                const assessmentContainer = document.createElement('div');
                assessmentContainer.className = 'learning-assessment';
                assessmentContainer.innerHTML = `
                    <h4>学习评估报告</h4>
                    <div class="assessment-content">
                        ${assessment.replace(/\n/g, '<br>')}
                    </div>
                    <button class="btn btn-outline" id="close-assessment">关闭评估</button>
                `;
                
                quizContainer.appendChild(assessmentContainer);
                
                document.getElementById('close-assessment').addEventListener('click', () => {
                    assessmentContainer.remove();
                    assessmentBtn.disabled = false;
                    assessmentBtn.textContent = '学习评估';
                });
                
            } catch (error) {
                console.error('获取学习评估时出错:', error);
                alert('获取学习评估时出错，请稍后再试。');
                assessmentBtn.disabled = false;
                assessmentBtn.textContent = '学习评估';
            }
        });
    }
    
    function getGrade(percentage) {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }
    
    // Start with the first question
    renderCurrentQuestion();
}

// Helper functions for name conversions
function getEducationLevelName(level) {
    switch(level) {
        case 'elementary-school': return '小学';
        case 'middle-school': return '初中';
        case 'high-school': return '高中';
        default: return '初中';
    }
}

function getTopicName(topic) {
    switch(topic) {
        case 'ancient': return '古代文明';
        case 'postclassical': return '后古典时代';
        case 'earlymodern': return '近代早期';
        case 'revolutionary': return '革命与工业化';
        case 'worldwars': return '世界大战与冷战';
        case 'contemporary': return '当代全球化';
        default: return '历史';
    }
}

function getDifficultyName(difficulty) {
    switch(difficulty) {
        case 'easy': return '简单';
        case 'medium': return '中等';
        case 'hard': return '困难';
        default: return '中等';
    }
}

/**
 * Initialize the history chat functionality
 */
function initHistoryChat() {
    const sendButton = document.getElementById('send-history-question');
    const questionInput = document.getElementById('history-question-input');
    const chatMessages = document.getElementById('history-chat-messages');
    
    if (!chatMessages || !sendButton || !questionInput) {
        console.error('History chat initialization failed: Missing required elements');
        return;
    }
    
    // Global assistant state
    const assistant = {
        // Chat history for the API
        chatHistory: [
            {
                "role": "system",
                "content": "你是一个专业的历史教学助手，擅长解答关于历史事件、人物、时期和文明的问题。你会提供清晰的历史背景、因果关系分析和适合用户教育水平的答案。"
            },
            {
                "role": "assistant",
                "content": "你好！我是你的历史学习助手。有什么历史问题我可以帮你解答吗？"
            }
        ],
        
        // Current settings
        currentTopic: null,
        educationLevel: localStorage.getItem('educationLevel') || 'middle-school',
        
        // Method to set the current topic
        setTopic: function(topic) {
            this.currentTopic = topic;
            this.updateSystemPrompt();
        },
        
        // Method to update the system prompt based on education level and topic
        updateSystemPrompt: function() {
            let levelSpecificPrompt = '';
            
            switch(this.educationLevel) {
                case 'elementary-school':
                    levelSpecificPrompt = '用户是小学生，请使用简单、基础的历史概念进行解释，避免复杂术语。使用直观例子和故事性叙述，重点讲解基本的历史事件和人物。';
                    break;
                case 'middle-school':
                    levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的历史概念，包括主要历史事件、人物和文明发展，可以使用基本的历史术语，平衡简洁性和教育性。';
                    break;
                case 'high-school':
                    levelSpecificPrompt = '用户是高中生，可以讨论更复杂的历史概念，包括历史分析、因果关系、历史解释和批判性思考，可以使用更深入的历史术语和概念。';
                    break;
                default:
                    levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的历史概念，包括主要历史事件、人物和文明发展，可以使用基本的历史术语，平衡简洁性和教育性。';
            }
            
            // Add topic-specific prompt
            let topicSpecificPrompt = '';
            
            if (this.currentTopic) {
                switch(this.currentTopic) {
                    case 'ancient':
                        topicSpecificPrompt = '用户正在学习古代文明（前3500–500年）。请专注于农业、文字、帝国的兴起与发展，包括美索不达米亚、埃及、印度河流域、黄河流域等古代文明。';
                        break;
                    case 'postclassical':
                        topicSpecificPrompt = '用户正在学习后古典时代（500–1450年）。请专注于宗教传播、跨洲贸易与文化交流，包括封建制度、伊斯兰扩张、宋朝繁荣、蒙古帝国等内容。';
                        break;
                    case 'earlymodern':
                        topicSpecificPrompt = '用户正在学习近代早期（1450–1750年）。请专注于全球化萌芽、殖民主义与贸易扩张，包括航海大发现、文艺复兴、宗教改革等内容。';
                        break;
                    case 'revolutionary':
                        topicSpecificPrompt = '用户正在学习革命与工业化时期（1750–1914年）。请专注于工业资本兴起、民族国家形成，包括美国独立、法国大革命、工业革命等内容。';
                        break;
                    case 'worldwars':
                        topicSpecificPrompt = '用户正在学习世界大战与冷战时期（1914–1991年）。请专注于意识形态对抗、科技战争发展，包括两次世界大战、冷战、非殖民化运动等内容。';
                        break;
                    case 'contemporary':
                        topicSpecificPrompt = '用户正在学习当代全球化（1991年–至今）。请专注于数字时代变革、世界多极化，包括互联网崛起、恐怖主义、气候变化等全球性问题。';
                        break;
                    default:
                        topicSpecificPrompt = '';
                }
            }
            
            // Update system message
            this.chatHistory[0].content = "你是一个专业的历史教学助手，擅长解答关于历史事件、人物、时期和文明的问题。提供清晰的历史背景和因果关系分析。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 鼓励学习者思考历史事件之间的联系和影响。";
        },
        
        // Method to send a question to the AI
        sendQuestion: async function(question) {
            if (!question.trim()) return;
            
            // Display user message
            displayMessage('user', question, chatMessages);
            
            // Add to chat history
            this.chatHistory.push({
                "role": "user",
                "content": question
            });
            
            // Show loading indicator
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'message message-ai loading';
            loadingMessage.innerHTML = '<p>思考中...</p>';
            chatMessages.appendChild(loadingMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            try {
                // Call the API
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: this.chatHistory
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                const aiResponse = data.choices[0].message.content;
                
                // Remove loading indicator
                chatMessages.removeChild(loadingMessage);
                
                // Display AI response
                displayMessage('assistant', aiResponse, chatMessages);
                
                // Add to chat history
                this.chatHistory.push({
                    "role": "assistant",
                    "content": aiResponse
                });
                
            } catch (error) {
                console.error('Error getting AI response:', error);
                
                // Remove loading indicator
                chatMessages.removeChild(loadingMessage);
                
                // Show error message
                displayMessage('assistant', '抱歉，我遇到了问题。请稍后再试。' + error.message, chatMessages);
            }
        },
        
        // Method to initialize the chat interface
        initChat: function() {
            // Clear chat area
            chatMessages.innerHTML = '';
            
            // Display welcome message
            displayMessage('assistant', this.chatHistory[1].content, chatMessages);
            
            // Update system prompt based on current settings
            this.updateSystemPrompt();
        }
    };
    
    // Initialize the chat interface
    assistant.initChat();
    
    // Set up event listeners
    sendButton.addEventListener('click', () => {
        const question = questionInput.value.trim();
        if (question) {
            assistant.sendQuestion(question);
            questionInput.value = '';
        }
    });
    
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const question = questionInput.value.trim();
            if (question) {
                assistant.sendQuestion(question);
                questionInput.value = '';
            }
        }
    });
    
    // Listen for education level changes
    window.addEventListener('education-level-change', function(event) {
        assistant.educationLevel = event.detail.level;
        assistant.updateSystemPrompt();
    });
    
    // Add loading animation CSS
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
    
    // Make assistant available globally
    window.historyAssistant = assistant;
}

/**
 * Display a message in the chat
 */
function displayMessage(role, content, container) {
    const messageElement = document.createElement('div');
    messageElement.className = role === 'user' ? 'message message-user' : 'message message-ai';
    
    // Convert newlines to <br> tags
    content = content.replace(/\n/g, '<br>');
    
    messageElement.innerHTML = `<p>${content}</p>`;
    container.appendChild(messageElement);
    
    // Scroll to bottom of chat
    container.scrollTop = container.scrollHeight;
}

/**
 * Initialize the timeline functionality
 */
function initTimeline() {
    const loadButton = document.getElementById('load-timeline');
    const periodSelect = document.getElementById('timeline-period');
    const countrySelect = document.getElementById('timeline-country');
    const detailLevelSelect = document.getElementById('timeline-detail');
    const timelineContainer = document.getElementById('timeline-container');
    
    if (!loadButton || !periodSelect || !countrySelect || !timelineContainer) {
        console.error('Timeline initialization failed: Missing required elements');
        return;
    }
    
    loadButton.addEventListener('click', async () => {
        // Show loading state with skeleton UI
        timelineContainer.innerHTML = `
            <div class="timeline-skeleton">
                <div class="skeleton-header"></div>
                <div class="skeleton-subheader"></div>
                <div class="skeleton-subheader" style="width: 30%"></div>
                
                <div class="timeline-content timeline-clearfix" style="margin-top: 40px;">
                    <div class="skeleton-event left"></div>
                    <div class="skeleton-event right"></div>
                    <div class="skeleton-event left"></div>
                    <div class="skeleton-event right"></div>
                </div>
            </div>
        `;
        
        try {
            const period = periodSelect.value;
            const country = countrySelect.value;
            const detailLevel = detailLevelSelect ? detailLevelSelect.value : 'medium';
            const periodName = getTopicName(period);
            const countryName = getCountryName(country);
            
            // Get event count based on detail level
            const eventCounts = getEventCountsByDetailLevel(detailLevel);

            // Define the mapping between periods and research purposes
            const periodToResearch = {
                ancient: "研究古代文明的兴起、发展与互动",
                postclassical: "研究中世纪、封建制度和早期现代社会的发展",
                earlymodern: "发现连接大陆的航海旅程和随后的全球交流",
            revolutionary: "分析塑造现代世界的政治、工业和社会革命",
            worldwars: "了解20世纪主要全球冲突的原因、事件和影响",
                contemporary: "研究战后发展、冷战、非殖民化和当代全球问题",
            "pre-qin": "从夏商周到春秋战国，中华文明的起源与早期发展",
            imperial: "从秦朝到清朝，中国封建社会的兴衰与演变",
            "modern-early": "鸦片战争到五四运动前，中国近代化的艰难历程",
            modern: "从五四运动到新中国成立，中国现代史的重要转折",
            contemporary: "新中国成立后的社会主义建设与改革开放",
            };
    
            // Directly link 'research_purpose' to 'period'
            const research_purpose = periodToResearch[period] || "研究该时期的重要历史事件";
            
            // Get education level from header profile display
            const profileDisplay = document.querySelector('.profile-display');
            let educationLevel = 'middle-school'; // Default value
            if (profileDisplay) {
                const levelText = profileDisplay.textContent.trim();
                if (levelText.includes('小学')) {
                    educationLevel = 'elementary-school';
                } else if (levelText.includes('初中')) {
                    educationLevel = 'middle-school';
                } else if (levelText.includes('高中')) {
                    educationLevel = 'high-school';
                }
            }
            
            const levelName = getEducationLevelName(educationLevel);
            
            let systemMessage;
            
            if (country === 'none') {
                // If no country is selected, show a message asking to select a country
                timelineContainer.innerHTML = `
                    <div class="text-center">
                        <p><i class="fas fa-info-circle"></i> 请选择一个国家以生成对比时间线</p>
                    </div>
                `;
                return;
            }
            
            // Build enhanced system message that explicitly requests time periods 
            systemMessage = '你是一个专业的历史教育助手，现在需要为' + levelName + '学生生成一个关于' + periodName + '时期的世界历史事件与' + countryName + '相关历史事件的对比时间线，研究目的：' + research_purpose + '。\n\n' +
            '请提供以下内容：\n' +
            '1. 时间段划分：必须将' + periodName + '划分为3-5个明确的关键时间段，每个时间段包含明确的起止年份，并以简短的名称概括该时间段的特点\n' +
            '2. 全球部分：在每个时间段内，展示该时段内全球范围内最重要的历史事件（不包括' + countryName + '国内事件）\n' +
            '3. ' + countryName + '部分：在每个时间段内，展示该时段内与' + countryName + '相关的重要历史事件，以便对比该国与全球历史的联系\n' +
            '4. 所有事件应包括：\n' +
            '   - 具体年份或时间段\n' +
            '   - 事件名称\n' +
            '   - 简要描述（适合' + levelName + '学生理解）\n' +
            '   - 历史意义和影响\n\n' +
            '请以JSON格式回复，必须按照以下精确格式提供数据:\n' +
            '{\n' +
            '  "title": "时间线标题",\n' +
            '  "period": "历史时期",\n' +
            '  "country": "' + countryName + '",\n' +
            '  "detailLevel": "' + detailLevel + '",\n' +
            '  "timePeriods": [\n' +
            '    {\n' +
            '      "name": "时间段名称",\n' +
            '      "startYear": "开始年份",\n' +
            '      "endYear": "结束年份",\n' +
            '      "worldEvents": [\n' +
            '        {\n' +
            '          "year": "年份",\n' +
            '          "title": "事件名称",\n' +
            '          "description": "事件描述",\n' +
            '          "significance": "历史意义"\n' +
            '        }\n' +
            '      ],\n' +
            '      "countryEvents": [\n' +
            '        {\n' +
            '          "year": "年份",\n' +
            '          "title": "事件名称",\n' +
            '          "description": "事件描述",\n' +
            '          "significance": "历史意义"\n' +
            '        }\n' +
            '      ]\n' +
            '    }\n' +
            '  ]\n' +
            '}' + 
            '\n\n请确保JSON格式正确，不要有控制字符、换行符或其他可能导致解析错误的特殊字符。确保timePeriods数组存在并包含3-5个时间段，每个时间段至少应包含2-3个全球事件和2-3个' + countryName + '事件。';
            
            // Call DeepSeek API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            "role": "system",
                            "content": systemMessage
                        },
                        {
                            "role": "user",
                            "content": `请为${levelName}学生生成一个关于${periodName}时期的世界历史事件与${countryName}相关历史事件的对比时间线。请将${periodName}明确划分为3-5个关键时间段，并在每个时间段内展示该时段的全球事件和${countryName}事件。请确保返回的JSON格式正确无误，包含timePeriods数组，每个时间段都有明确的名称、起止年份、世界事件和国家事件。`
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                throw new Error(`网络响应不正常: ${response.status}`);
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // Parse JSON response with improved error handling
            let timeline;
            try {
                // First try to extract JSON using regex
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                let jsonText = '';
                
                if (jsonMatch) {
                    jsonText = jsonMatch[0];
                } else {
                    throw new Error('无法从响应中提取JSON');
                }
                
                // Clean the JSON string to remove potential control characters
                jsonText = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
                
                // Enhanced JSON parsing with multiple fallback strategies
                try {
                    // First attempt: direct parsing
                    timeline = JSON.parse(jsonText);
                } catch (parseError) {
                    console.error('第一次解析JSON失败，尝试修复格式...', parseError);
                    console.log('原始JSON:', jsonText);
                    
                    // Second attempt: fix common JSON issues
                    try {
                        const fixedJson = jsonText
                            .replace(/,\s*}/g, '}')  // Remove trailing commas
                            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
                            .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')  // Escape backslashes
                            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')  // Quote unquoted keys
                            .replace(/:\s*'([^']*?)'/g, ':"$1"')  // Replace single quotes with double quotes
                            .replace(/:\s*`([^`]*?)`/g, ':"$1"');  // Replace backticks with double quotes
                            
                        timeline = JSON.parse(fixedJson);
                    } catch (fixError) {
                        console.error('修复JSON后仍然无法解析:', fixError);
                        
                        // Third attempt: Try a more aggressive approach with a JSON5 like parser
                        try {
                            // Simple approach to handle more JSON issues
                            const sanitized = jsonText
                                .replace(/[\n\r\t]/g, ' ')
                                .replace(/\s+/g, ' ')
                                .replace(/'/g, '"')
                                .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
                                .replace(/:\s*([-+]?\d+\.?\d*)\s*(,|}|])/g, ':"$1"$2');
                                
                            timeline = JSON.parse(sanitized);
                        } catch (sanitizeError) {
                            console.error('进一步修复JSON后仍然无法解析:', sanitizeError);
                            throw new Error('无法解析JSON数据，将尝试手动提取信息');
                        }
                    }
                }
                
                if (!timeline.title || !timeline.timePeriods || !Array.isArray(timeline.timePeriods) || timeline.timePeriods.length === 0) {
                    // If the API returned the old format, convert it to the new format
                    if (timeline.worldEvents && timeline.countryEvents) {
                        console.log('API返回的是旧格式，转换为新格式');
                        timeline = convertToTimePeriodFormat(timeline, periodName);
                    } else {
                        throw new Error('解析的JSON格式不正确或缺少必要字段');
                    }
                }
                
                renderComparisonTimeline(timeline);
            } catch (jsonError) {
                console.error('解析AI响应时出错:', jsonError);
                console.log('原始响应:', aiResponse);
                
                // Fallback: try to create a manual timeline from the response text
                const fallbackTimeline = createFallbackTimeline(aiResponse, periodName, countryName, detailLevel);
                
                if (fallbackTimeline) {
                    console.log('成功创建备用时间线');
                    renderComparisonTimeline(fallbackTimeline);
                } else {
                timelineContainer.innerHTML = `
                    <div class="text-center text-error">
                        <p>抱歉，生成时间线时出现错误。请再试一次。</p>
                        <p class="small">${jsonError.message}</p>
                            <button id="retry-timeline" class="btn btn-outline btn-sm mt-3">
                                <i class="fas fa-sync-alt"></i> 重试
                            </button>
                    </div>
                `;
                    
                    // Add retry button functionality
                    const retryButton = document.getElementById('retry-timeline');
                    if (retryButton) {
                        retryButton.addEventListener('click', () => {
                            loadButton.click();
                        });
                    }
                }
            }
        } catch (error) {
            console.error('生成时间线时出错:', error);
            timelineContainer.innerHTML = `
                <div class="text-center text-error">
                    <p>抱歉，生成时间线时出现错误。请再试一次。</p>
                    <p class="small">${error.message}</p>
                    <button id="retry-timeline" class="btn btn-outline btn-sm mt-3">
                        <i class="fas fa-sync-alt"></i> 重试
                    </button>
                </div>
            `;
            
            // Add retry button functionality
            const retryButton = document.getElementById('retry-timeline');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    loadButton.click();
                });
            }
        }
    });
    
    // Add functionality to the retry button in the offline indicator
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            if (navigator.onLine) {
                loadButton.click();
                document.getElementById('offline-indicator').style.display = 'none';
            }
        });
    }
}

/**
 * Create a fallback timeline when JSON parsing fails
 */
function createFallbackTimeline(responseText, periodName, countryName, detailLevel) {
    try {
        // Try to identify time periods in the text
        const periodMatches = responseText.match(/时间段|时期|阶段[\s\S]*?([\d年\-—～]+)/g) || [];
        const periods = [];
        
        if (periodMatches.length > 0) {
            // Extract time periods
            periodMatches.forEach(match => {
                const nameMatch = match.match(/(\d+[\.\)、]|\*|\-)\s*(.+?)[:：]/);
                const name = nameMatch ? nameMatch[2].trim() : "未知时期";
                
                const yearMatch = match.match(/([\d前公元]+年)\s*[-—～]\s*([\d前公元]+年)/);
                const startYear = yearMatch ? yearMatch[1] : "未知开始年份";
                const endYear = yearMatch ? yearMatch[2] : "未知结束年份";
                
                periods.push({
                    name: name,
                    startYear: startYear,
                    endYear: endYear,
                    worldEvents: [],
                    countryEvents: []
                });
            });
        }
        
        // If no periods found, create a default one
        if (periods.length === 0) {
            periods.push({
                name: periodName,
                startYear: "未知开始年份",
                endYear: "未知结束年份",
                worldEvents: [],
                countryEvents: []
            });
        }
        
        // Extract events
        const worldEventsMatch = responseText.match(/全球历史事件|世界历史事件|全球事件[\s\S]*?(?=国家历史事件|国家事件|相关历史事件|结束)/i);
        const countryEventsMatch = responseText.match(/国家历史事件|国家事件|相关历史事件[\s\S]*$/i);
        
        // Process world events
        if (worldEventsMatch) {
            const worldEventsText = worldEventsMatch[0];
            const eventMatches = worldEventsText.match(/(\d+[\.\)、]|\*|\-)\s*(.+?)[:：](.+?)(?=\d+[\.\)、]|\*|\-|$)/g) || [];
            
            eventMatches.forEach(match => {
                const yearMatch = match.match(/(\d+年|\d+\s*[-—]\s*\d+年|公元前\d+年|前\d+年)/);
                const year = yearMatch ? yearMatch[0] : "未知年份";
                
                const titleMatch = match.match(/(\d+[\.\)、]|\*|\-)\s*(.+?)[:：]/);
                const title = titleMatch ? titleMatch[2].trim() : "未知事件";
                
                const descriptionMatch = match.match(/[:：](.+)/);
                const description = descriptionMatch ? descriptionMatch[1].trim() : "";
                
                const event = {
                    year: year,
                    title: title,
                    description: description,
                    significance: "重要历史事件"
                };
                
                // Assign to appropriate period
                const yearValue = extractYearValue(year);
                let assigned = false;
                
                if (yearValue) {
                    for (const period of periods) {
                        const startYearValue = extractYearValue(period.startYear);
                        const endYearValue = extractYearValue(period.endYear);
                        
                        if (startYearValue && endYearValue && 
                            yearValue >= startYearValue && 
                            yearValue <= endYearValue) {
                            period.worldEvents.push(event);
                            assigned = true;
                            break;
                        }
                    }
                }
                
                // If not assigned to any period, put in the first one
                if (!assigned && periods.length > 0) {
                    periods[0].worldEvents.push(event);
                }
            });
        }
        
        // Process country events
        if (countryEventsMatch) {
            const countryEventsText = countryEventsMatch[0];
            const eventMatches = countryEventsText.match(/(\d+[\.\)、]|\*|\-)\s*(.+?)[:：](.+?)(?=\d+[\.\)、]|\*|\-|$)/g) || [];
            
            eventMatches.forEach(match => {
                const yearMatch = match.match(/(\d+年|\d+\s*[-—]\s*\d+年|公元前\d+年|前\d+年)/);
                const year = yearMatch ? yearMatch[0] : "未知年份";
                
                const titleMatch = match.match(/(\d+[\.\)、]|\*|\-)\s*(.+?)[:：]/);
                const title = titleMatch ? titleMatch[2].trim() : "未知事件";
                
                const descriptionMatch = match.match(/[:：](.+)/);
                const description = descriptionMatch ? descriptionMatch[1].trim() : "";
                
                const event = {
                    year: year,
                    title: title,
                    description: description,
                    significance: "重要历史事件"
                };
                
                // Assign to appropriate period
                const yearValue = extractYearValue(year);
                let assigned = false;
                
                if (yearValue) {
                    for (const period of periods) {
                        const startYearValue = extractYearValue(period.startYear);
                        const endYearValue = extractYearValue(period.endYear);
                        
                        if (startYearValue && endYearValue && 
                            yearValue >= startYearValue && 
                            yearValue <= endYearValue) {
                            period.countryEvents.push(event);
                            assigned = true;
                            break;
                        }
                    }
                }
                
                // If not assigned to any period, put in the first one
                if (!assigned && periods.length > 0) {
                    periods[0].countryEvents.push(event);
                }
            });
        }
        
        // Create a fallback timeline object
        return {
            title: `${periodName}时期全球与${countryName}历史事件对比时间线`,
            period: periodName,
            country: countryName,
            detailLevel: detailLevel,
            timePeriods: periods.length > 0 ? periods : [{
                name: periodName,
                startYear: "未知开始年份",
                endYear: "未知结束年份",
                worldEvents: [{ year: "未知", title: "无法解析事件", description: "数据解析出错", significance: "请重试" }],
                countryEvents: [{ year: "未知", title: "无法解析事件", description: "数据解析出错", significance: "请重试" }]
            }]
        };
    } catch (e) {
        console.error('创建备用时间线时出错:', e);
        return null;
    }
}

/**
 * Get event counts based on detail level
 */
function getEventCountsByDetailLevel(detailLevel) {
    switch(detailLevel) {
        case 'brief':
            return {
                regularEvents: 10,
                worldEvents: 10,
                countryEvents: 10
            };
        case 'detailed':
            return {
                regularEvents: 30,
                worldEvents: 30,
                countryEvents: 30
            };
        case 'medium':
        default:
            return {
                regularEvents: 20,
                worldEvents: 20,
                countryEvents: 20
            };
    }
}

/**
 * Render the comparison timeline with world events and country events
 */
function renderComparisonTimeline(timeline) {
    const timelineContainer = document.getElementById('timeline-container');
    if (!timelineContainer) return;
    
    const detailLevelText = getDetailLevelText(timeline.detailLevel || 'medium');
    
    // Extract and merge all events from all time periods
    let allEvents = [];
    
    timeline.timePeriods.forEach(period => {
        // Add world events
        if (period.worldEvents && period.worldEvents.length > 0) {
            period.worldEvents.forEach(event => {
                allEvents.push({
                    ...event,
                    type: 'world',
                    periodName: period.name
                });
            });
        }
        
        // Add country events
        if (period.countryEvents && period.countryEvents.length > 0) {
            period.countryEvents.forEach(event => {
                allEvents.push({
                    ...event,
                    type: 'country',
                    periodName: period.name
                });
            });
        }
    });
    
    // Sort events by date
    allEvents.sort((a, b) => {
        const yearA = extractYearValue(a.year);
        const yearB = extractYearValue(b.year);
        
        // Handle cases where year extraction fails
        if (!yearA && !yearB) return 0;
        if (!yearA) return 1;
        if (!yearB) return -1;
        
        return yearA - yearB;
    });
    
    let html = `
        <div class="timeline-header">
            <h3>${timeline.title}</h3>
            <p class="timeline-period">${timeline.period} - ${timeline.country}</p>
            <p class="timeline-detail-level">详细程度：${detailLevelText}</p>
        </div>
        <div class="country-info">
            <h3><i class="fas fa-info-circle"></i> 时间线说明</h3>
            <p>下方时间线按历史事件发生时间的先后顺序排列，世界事件显示在左侧，${timeline.country}事件显示在右侧，帮助理解全球历史与${timeline.country}历史的时间联系。</p>
            <p class="mobile-note"><i class="fas fa-mobile-alt"></i> 在手机上查看时，事件将垂直排列。点击事件可以高亮相同年份的事件。</p>
        </div>
        
        <!-- Column Headers -->
        <div class="timeline-clearfix">
            <div class="timeline-column-header world-header">
                <i class="fas fa-globe"></i> 世界事件
            </div>
            <div class="timeline-column-header country-header">
                <i class="fas fa-flag"></i> ${timeline.country}事件
            </div>
        </div>
        
        <div class="timeline-content">
    `;
    
    // Render events chronologically
    allEvents.forEach((event, index) => {
        const eventClass = event.type === 'world' ? 'world-event' : 'country-event';
        const eventTypeLabel = event.type === 'world' ? '世界事件' : `${timeline.country}事件`;
        
        html += `
            <div class="timeline-event ${eventClass}" data-year="${event.year}">
                <div class="event-year">${event.year}</div>
                <div class="event-content">
                    <div class="event-type-badge">${eventTypeLabel}</div>
                    <h4>${event.title}</h4>
                    <p class="event-description">${event.description}</p>
                    <div class="event-significance">
                        <strong>历史意义：</strong>
                        <p>${event.significance}</p>
                    </div>
                    ${event.periodName ? `<div class="event-period-tag">时期：${event.periodName}</div>` : ''}
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="timeline-actions">
            <button class="btn btn-outline" id="print-timeline">打印时间线</button>
            <button class="btn btn-outline" id="download-timeline">下载PDF</button>
        </div>
    `;
    
    timelineContainer.innerHTML = html;
    
    // Add event listeners for print and download
    const printButton = document.getElementById('print-timeline');
    if (printButton) {
        printButton.addEventListener('click', () => {
            window.print();
        });
    }
    
    const downloadButton = document.getElementById('download-timeline');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            alert('PDF下载功能即将推出');
        });
    }
    
    // Add highlight functionality for events with the same year
    const eventItems = document.querySelectorAll('.timeline-event');
    eventItems.forEach(item => {
        item.addEventListener('click', () => {
            const year = item.getAttribute('data-year');
            const sameYearEvents = document.querySelectorAll(`.timeline-event[data-year="${year}"]`);
            
            // If we already highlighted this event, unhighlight it
            if (item.classList.contains('highlighted')) {
                sameYearEvents.forEach(event => {
                    event.classList.remove('highlighted');
                });
                return;
            }
            
            // First, remove highlight from any previously highlighted events
            document.querySelectorAll('.timeline-event.highlighted').forEach(el => {
                el.classList.remove('highlighted');
            });
            
            // Then highlight the current set of events
            sameYearEvents.forEach(event => {
                event.classList.add('highlighted');
            });
            
            // On mobile, scroll the first highlighted event into view
            if (window.innerWidth <= 768 && sameYearEvents.length > 0) {
                setTimeout(() => {
                    sameYearEvents[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
            
            // Auto remove highlight after some time, but only on desktop
            if (window.innerWidth > 768) {
                setTimeout(() => {
                    sameYearEvents.forEach(event => {
                        event.classList.remove('highlighted');
                    });
                }, 3000);
            }
        });
    });
}

/**
 * Get descriptive text for detail level
 */
function getDetailLevelText(detailLevel) {
    switch(detailLevel) {
        case 'brief':
            return '简略 (各10个事件)';
        case 'detailed':
            return '详尽 (各30个事件)';
        case 'medium':
        default:
            return '中等 (各20个事件)';
    }
}

/**
 * Get country name from country code
 */
function getCountryName(country) {
    const countryNames = {
        'none': '',
        'china': '中国',
        'usa': '美国',
        'uk': '英国',
        'france': '法国',
        'germany': '德国',
        'russia': '俄罗斯/苏联',
        'japan': '日本',
        'india': '印度',
        'brazil': '巴西',
        'egypt': '埃及',
        'korea': '韩国',
        'vietnam': '越南',
        'thailand': '泰国',
        'mongolia': '蒙古',
        'indonesia': '印度尼西亚',
        'italy': '意大利',
        'spain': '西班牙',
        'greece': '希腊',
        'poland': '波兰',
        'ethiopia': '埃塞俄比亚',
        'south-africa': '南非',
        'morocco': '摩洛哥',
        'kenya': '肯尼亚',
        'ghana': '加纳',
        'canada': '加拿大',
        'mexico': '墨西哥',
        'cuba': '古巴',
        'argentina': '阿根廷',
        'peru': '秘鲁',
        'colombia': '哥伦比亚',
        'chile': '智利',
        'australia': '澳大利亚',
        'new-zealand': '新西兰',
        'fiji': '斐济',
        'papua-new-guinea': '巴布亚新几内亚'
    };
    
    return countryNames[country] || country;
}

function getContinentName(continent) {
    const continentNames = {
        'global': '全球',
        'asia': '亚洲',
        'europe': '欧洲',
        'africa': '非洲',
        'north-america': '北美洲',
        'south-america': '南美洲',
        'oceania': '大洋洲',
        'middle-east': '中东'
    };
    return continentNames[continent] || '全球';
}

// Add this function to convert old format to new timePeriods format if needed
function convertToTimePeriodFormat(oldTimeline, periodName) {
    // Create a default time period based on the period name
    const periodRanges = {
        'ancient': { start: '-3500', end: '-500' },
        'postclassical': { start: '500', end: '1450' },
        'earlymodern': { start: '1450', end: '1750' },
        'revolutionary': { start: '1750', end: '1914' },
        'worldwars': { start: '1914', end: '1991' },
        'contemporary': { start: '1991', end: '2023' }
    };
    
    const defaultRange = periodRanges[periodName] || { start: '1000', end: '2000' };
    
    // Group events by year to attempt to create meaningful time periods
    const allYears = [];
    oldTimeline.worldEvents.forEach(event => {
        const year = extractYearValue(event.year);
        if (year && !allYears.includes(year)) {
            allYears.push(year);
        }
    });
    
    oldTimeline.countryEvents.forEach(event => {
        const year = extractYearValue(event.year);
        if (year && !allYears.includes(year)) {
            allYears.push(year);
        }
    });
    
    // Sort years
    allYears.sort((a, b) => a - b);
    
    // If we have less than 2 years, just create one time period
    if (allYears.length < 2) {
        return {
            title: oldTimeline.title,
            period: oldTimeline.period,
            country: oldTimeline.country,
            detailLevel: oldTimeline.detailLevel,
            timePeriods: [
                {
                    name: oldTimeline.period,
                    startYear: defaultRange.start,
                    endYear: defaultRange.end,
                    worldEvents: oldTimeline.worldEvents,
                    countryEvents: oldTimeline.countryEvents
                }
            ]
        };
    }
    
    // Create 3-5 time periods based on the range of years
    const numberOfPeriods = Math.min(Math.max(3, Math.ceil(allYears.length / 4)), 5);
    const minYear = allYears[0];
    const maxYear = allYears[allYears.length - 1];
    const yearRange = maxYear - minYear;
    const periodLength = Math.ceil(yearRange / numberOfPeriods);
    
    const timePeriods = [];
    
    for (let i = 0; i < numberOfPeriods; i++) {
        const startYear = minYear + (i * periodLength);
        const endYear = i === numberOfPeriods - 1 ? maxYear : minYear + ((i + 1) * periodLength - 1);
        
        // Filter events that belong to this time period
        const worldEvents = oldTimeline.worldEvents.filter(event => {
            const year = extractYearValue(event.year);
            return year >= startYear && year <= endYear;
        });
        
        const countryEvents = oldTimeline.countryEvents.filter(event => {
            const year = extractYearValue(event.year);
            return year >= startYear && year <= endYear;
        });
        
        // Only add period if it has events
        if (worldEvents.length > 0 || countryEvents.length > 0) {
            timePeriods.push({
                name: `${startYear}年 - ${endYear}年`,
                startYear: startYear.toString(),
                endYear: endYear.toString(),
                worldEvents: worldEvents,
                countryEvents: countryEvents
            });
        }
    }
    
    // If we couldn't create any valid time periods, just use one period
    if (timePeriods.length === 0) {
        timePeriods.push({
            name: oldTimeline.period,
            startYear: defaultRange.start,
            endYear: defaultRange.end,
            worldEvents: oldTimeline.worldEvents,
            countryEvents: oldTimeline.countryEvents
        });
    }
    
    return {
        title: oldTimeline.title,
        period: oldTimeline.period,
        country: oldTimeline.country,
        detailLevel: oldTimeline.detailLevel,
        timePeriods: timePeriods
    };
}

// Helper function to extract a numeric year from strings like "1500年", "公元前500年", "前500年", etc.
function extractYearValue(yearStr) {
    if (!yearStr) return null;
    
    const bcMatch = yearStr.match(/(?:公元前|前)(\d+)年?/);
    if (bcMatch) {
        return -parseInt(bcMatch[1]);
    }
    
    const adMatch = yearStr.match(/(\d+)年?/);
    if (adMatch) {
        return parseInt(adMatch[1]);
    }
    
    return null;
} 