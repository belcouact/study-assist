document.addEventListener('DOMContentLoaded', function() {
    // Initialize quiz generator
    initQuizGenerator();
    
    // Initialize chat functionality
    initHistoryChat();
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
            
            // Get education level
            const educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
            const levelName = getEducationLevelName(educationLevel);
            const topicName = getTopicName(topic);
            const difficultyName = getDifficultyName(difficulty);
            
            // Build system message
            const systemMessage = `你是一个专业的历史教育助手，现在需要为${levelName}学生生成一个关于${topicName}的${difficultyName}难度测验，包含${count}道选择题。
            每个问题应包含问题描述和4个选项（A、B、C、D），并标明正确答案。
            考虑学生的教育水平，确保题目难度适中且符合教学大纲。
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
                  "correctAnswer": "正确选项的ID（A/B/C/D）"
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
                isCorrect
            };
        });
        
        const percentage = Math.round((correctCount / quiz.questions.length) * 100);
        
        let html = `
            <div class="quiz-results">
                <h3>测验结果</h3>
                <div class="result-summary">
                    <p>得分：${correctCount} / ${quiz.questions.length} (${percentage}%)</p>
                    <p class="result-message">
                        ${percentage >= 80 ? '太棒了！你对这个主题掌握得很好！' :
                          percentage >= 60 ? '不错！继续努力，你可以做得更好！' :
                          '继续学习，相信你下次一定能取得更好的成绩！'}
                    </p>
                </div>
                <div class="result-details">
                    <h4>详细答题情况：</h4>
        `;
        
        results.forEach((result, index) => {
            const question = quiz.questions[index];
            html += `
                <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                    <p class="question">${index + 1}. ${result.question}</p>
                    <p class="answer">你的答案：${result.userAnswer ? question.options.find(o => o.id === result.userAnswer).text : '未作答'}</p>
                    <p class="correct-answer">正确答案：${question.options.find(o => o.id === result.correctAnswer).text}</p>
                </div>
            `;
        });
        
        html += `
                </div>
                <button class="btn btn-primary" id="retry-quiz">重新测验</button>
            </div>
        `;
        
        quizContainer.innerHTML = html;
        
        const retryBtn = document.getElementById('retry-quiz');
        retryBtn.addEventListener('click', () => {
            currentQuestionIndex = 0;
            userAnswers.fill(null);
            renderCurrentQuestion();
        });
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
        case 'medieval': return '中世纪';
        case 'exploration': return '探索时代';
        case 'revolutionary': return '革命时代';
        case 'worldwars': return '世界大战';
        case 'modern': return '现代历史';
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
                        topicSpecificPrompt = '用户正在学习古代文明。请专注于早期人类社会、古代文明的发展和特点，以及它们对后世的影响。';
                        break;
                    case 'medieval':
                        topicSpecificPrompt = '用户正在学习中世纪。请专注于封建制度、宗教影响、社会结构和中世纪欧洲的发展。';
                        break;
                    case 'exploration':
                        topicSpecificPrompt = '用户正在学习探索时代。请专注于航海发现、全球贸易和文化交流，以及这些事件对世界历史的影响。';
                        break;
                    case 'revolutionary':
                        topicSpecificPrompt = '用户正在学习革命时代。请专注于政治革命、工业革命和社会变革，以及这些事件如何塑造现代世界。';
                        break;
                    case 'worldwars':
                        topicSpecificPrompt = '用户正在学习世界大战。请专注于战争的原因、主要事件、影响和战后世界秩序的重建。';
                        break;
                    case 'modern':
                        topicSpecificPrompt = '用户正在学习现代历史。请专注于当代全球问题、国际关系、科技发展和社会变革。';
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