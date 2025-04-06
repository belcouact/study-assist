/**
 * Study Assist - Mathematics Subject JavaScript
 * Handles math-specific functionality and DeepSeek AI interactions
 */

// Define a global helper for displaying messages in the math chat
function displayMathMessage(role, content, container) {
    const messageElement = document.createElement('div');
    messageElement.className = role === 'user' ? 'message message-user' : 'message message-ai';
    
    // Process text for MathJax if it contains LaTeX
    let processedText = content;
    
    // Look for math expressions in the text (delimited by $ or $$)
    // and ensure they are properly formatted for MathJax
    if (role === 'assistant' && (content.includes('$') || content.includes('\\('))) {
        // Replace \( \) syntax with $ $ for inline math
        processedText = processedText.replace(/\\\((.*?)\\\)/g, '$$$1$$');
        
        // Replace \[ \] syntax with $$ $$ for block math
        processedText = processedText.replace(/\\\[(.*?)\\\]/g, '$$$$1$$$$');
    }
    
    // Convert newlines to <br> tags
    processedText = processedText.replace(/\n/g, '<br>');
    
    messageElement.innerHTML = `<p>${processedText}</p>`;
    container.appendChild(messageElement);
    
    // Scroll to bottom of chat
    container.scrollTop = container.scrollHeight;
    
    // Render math expressions with MathJax if available
    if (window.MathJax && role === 'assistant') {
        window.MathJax.typeset([messageElement]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize math subject functionality
    initTopicCards();
    initMathAssistant();
    initQuizGenerator();
    initFormulaSelector();
    initMathVisualizer();
});

/**
 * Initialize topic cards
 */
function initTopicCards() {
    const topicCards = document.querySelectorAll('.topic-card');
    
    topicCards.forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.getAttribute('data-topic');
            
            // Scroll to AI assistant and set topic in input
            const aiSection = document.querySelector('.ai-assistant-section');
            const questionInput = document.getElementById('math-question-input');
            
            if (aiSection && questionInput) {
                aiSection.scrollIntoView({ behavior: 'smooth' });
                
                // Set appropriate topic prompts in Chinese
                let topicPrompt = "";
                switch(topic) {
                    case 'algebra':
                        topicPrompt = "代数方程如何求解？请解释代数的基本概念。";
                        break;
                    case 'geometry':
                        topicPrompt = "几何中的三角形性质有哪些？如何计算面积和体积？";
                        break;
                    case 'calculus':
                        topicPrompt = "微积分的基本概念是什么？导数和积分有什么关系？";
                        break;
                    case 'statistics':
                        topicPrompt = "统计学中的平均值、中位数和众数有什么区别？如何解释方差？";
                        break;
                    case 'probability':
                        topicPrompt = "概率论的基本原理是什么？如何计算复杂事件的概率？";
                        break;
                    case 'trigonometry':
                        topicPrompt = "三角函数的基本性质是什么？正弦和余弦函数如何应用？";
                        break;
                    default:
                        topicPrompt = `请帮我理解${topic}的基本概念`;
                }
                
                questionInput.value = topicPrompt;
                questionInput.focus();
                
                // Pre-populate quiz generator with the topic
                const quizTopicSelect = document.getElementById('quiz-topic');
                if (quizTopicSelect) {
                    // Set the value if the option exists
                    const option = Array.from(quizTopicSelect.options).find(
                        option => option.value === topic
                    );
                    
                    if (option) {
                        quizTopicSelect.value = topic;
                    }
                }
                
                // Update the current topic in math assistant if it exists
                if (window.mathAssistant && typeof window.mathAssistant.setTopic === 'function') {
                    window.mathAssistant.setTopic(topic);
                }
            }
        });
    });
}

/**
 * Initialize the AI math assistant
 */
function initMathAssistant() {
    const sendButton = document.getElementById('send-math-question');
    const questionInput = document.getElementById('math-question-input');
    const chatMessages = document.getElementById('math-chat-messages');
    
    // If any elements are missing, don't initialize
    if (!chatMessages || !sendButton || !questionInput) {
        console.error('Math assistant initialization failed: Missing required elements');
        return;
    }
    
    // Global assistant state
    const assistant = {
        // Chat history for the API
        chatHistory: [
            {
                "role": "system",
                "content": "你是一个专业的数学教学助手，擅长解答关于代数、几何、微积分、统计、概率等数学分支的问题。你会提供清晰的解释、公式推导和适合用户教育水平的答案。"
            },
            {
                "role": "assistant",
                "content": "你好！我是你的数学学习助手。有什么数学问题我可以帮你解答吗？"
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
                    levelSpecificPrompt = '用户是小学生，请使用简单、基础的数学概念进行解释，避免复杂公式和术语。使用直观例子和可视化方法解释，重点讲解基础的数字运算、几何概念和简单的问题解决策略。';
                    break;
                case 'middle-school':
                    levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的数学概念，包括代数入门、平面几何、比例关系等，可以使用基础数学符号和简单方程，平衡简洁性和教育性。';
                    break;
                case 'high-school':
                    levelSpecificPrompt = '用户是高中生，可以讨论更复杂的数学概念，包括函数、三角学、概率统计和微积分入门等高级内容，可以使用更深入的数学公式和证明方法。';
                    break;
                default:
                    levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的数学概念，包括代数入门、平面几何、比例关系等，可以使用基础数学符号和简单方程，平衡简洁性和教育性。';
            }
            
            // Add topic-specific prompt
            let topicSpecificPrompt = '';
            
            if (this.currentTopic) {
                switch(this.currentTopic) {
                    case 'algebra':
                        topicSpecificPrompt = '用户正在学习代数。请专注于方程、函数、多项式等代数概念，并提供清晰的解题步骤和例题。';
                        break;
                    case 'geometry':
                        topicSpecificPrompt = '用户正在学习几何。请专注于平面图形、空间图形、坐标几何等概念，并提供图形推理和证明方法。';
                        break;
                    case 'calculus':
                        topicSpecificPrompt = '用户正在学习微积分。请专注于极限、导数、积分等概念，并解释其实际应用和图形意义。';
                        break;
                    case 'statistics':
                        topicSpecificPrompt = '用户正在学习统计学。请专注于数据分析、概率分布、统计推断等概念，并提供数据解释方法。';
                        break;
                    case 'probability':
                        topicSpecificPrompt = '用户正在学习概率论。请专注于概率计算、随机变量、概率分布等概念，并提供实际应用例子。';
                        break;
                    case 'trigonometry':
                        topicSpecificPrompt = '用户正在学习三角学。请专注于三角函数、三角恒等式、三角方程等概念，并解释其在现实世界中的应用。';
                        break;
                    default:
                        topicSpecificPrompt = '';
                }
            }
            
            // Update system message
            this.chatHistory[0].content = "你是一个专业的数学教学助手，擅长解答关于代数、几何、微积分、统计、概率等数学分支的问题。提供清晰的解释和适当深度的回答。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 当回答数学问题时，请使用适当的数学公式和符号，可使用LaTeX格式（用$或$$包围）来展示数学表达式。提供清晰的解题步骤和思路解释。";
        },
        
        // Method to send a question to the AI
        sendQuestion: async function(question) {
            if (!question.trim()) return;
            
            // Display user message
            displayMathMessage('user', question, chatMessages);
            
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
                displayMathMessage('assistant', aiResponse, chatMessages);
                
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
                displayMathMessage('assistant', '抱歉，我遇到了问题。请稍后再试。' + error.message, chatMessages);
            }
        },
        
        // Method to initialize the chat interface
        initChat: function() {
            // Clear chat area
            chatMessages.innerHTML = '';
            
            // Display welcome message
            displayMathMessage('assistant', this.chatHistory[1].content, chatMessages);
            
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
        
        .topic-card.active {
            border-color: var(--primary-color);
            box-shadow: 0 0 10px rgba(67, 97, 238, 0.3);
            transform: translateY(-5px);
        }
    `;
    document.head.appendChild(style);
    
    // Make assistant available globally
    window.mathAssistant = assistant;
}

/**
 * Initialize quiz generator
 */
function initQuizGenerator() {
    const generateBtn = document.getElementById('generate-quiz');
    const quizContainer = document.getElementById('quiz-container');
    const topicSelect = document.getElementById('quiz-topic');
    const difficultySelect = document.getElementById('quiz-difficulty');
    const questionsSelect = document.getElementById('quiz-questions');
    
    if (generateBtn && quizContainer) {
        generateBtn.addEventListener('click', async () => {
            // Get quiz options
            const topic = topicSelect ? topicSelect.value : 'algebra';
            const difficulty = difficultySelect ? difficultySelect.value : 'medium';
            const count = questionsSelect ? parseInt(questionsSelect.value) : 5;
            
            // Show loading state
            quizContainer.innerHTML = '<div class="text-center"><p>正在生成测验中...</p></div>';
            
            try {
                // 教育水平相关
                let educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
                let levelName = '';
                
                switch(educationLevel) {
                    case 'elementary-school':
                        levelName = '小学';
                        break;
                    case 'middle-school':
                        levelName = '初中';
                        break;
                    case 'high-school':
                        levelName = '高中';
                        break;
                    default:
                        levelName = '初中';
                }
                
                // 转换题目难度为中文
                let difficultyName = '';
                switch(difficulty) {
                    case 'easy':
                        difficultyName = '简单';
                        break;
                    case 'medium':
                        difficultyName = '中等';
                        break;
                    case 'hard':
                        difficultyName = '困难';
                        break;
                    default:
                        difficultyName = '中等';
                }
                
                // 转换主题为中文
                let topicName = '';
                switch(topic) {
                    case 'algebra':
                        topicName = '代数';
                        break;
                    case 'geometry':
                        topicName = '几何';
                        break;
                    case 'calculus':
                        topicName = '微积分';
                        break;
                    case 'statistics':
                        topicName = '统计学';
                        break;
                    case 'arithmetic':
                        topicName = '算术';
                        break;
                    case 'trigonometry':
                        topicName = '三角学';
                        break;
                    default:
                        topicName = '代数';
                }
                
                // 构建系统消息
                const systemMessage = `你是一个专业的数学教育助手，现在需要为${levelName}学生生成一个关于${topicName}的${difficultyName}难度测验，包含${count}道选择题。
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
                
                // 构建用户消息
                const userPrompt = `请生成一个关于${topicName}的${difficultyName}难度测验，包含${count}道选择题，适合${levelName}学生的水平。每个问题需要4个选项，并标明正确答案。`;
                
                // 构建消息数组
                const messages = [
                    {
                        "role": "system",
                        "content": systemMessage
                    },
                    {
                        "role": "user",
                        "content": userPrompt
                    }
                ];
                
                // 调用DeepSeek API
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: messages
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                const aiResponse = data.choices[0].message.content;
                
                console.log("Quiz AI response:", aiResponse);
                
                // 尝试解析JSON响应
                let quiz;
                try {
                    // 提取JSON部分 - AI可能会在JSON前后添加文本
                    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        quiz = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('无法从响应中提取JSON');
                    }
                    
                    // 验证是否有必要的字段
                    if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
                        throw new Error('解析的JSON格式不正确');
                    }
                    
                    // 渲染测验
                    renderQuiz(quiz);
                } catch (jsonError) {
                    console.error('解析AI响应时出错:', jsonError);
                    
                    // 如果JSON解析失败，尝试自己构建测验结构
                    try {
                        quiz = parseQuizFromText(aiResponse, topicName);
                        renderQuiz(quiz);
                    } catch (parseError) {
                        console.error('解析测验文本失败:', parseError);
                        quizContainer.innerHTML = `
                            <div class="text-center text-error">
                                <p>抱歉，生成测验时出现错误。请再试一次。</p>
                                <p class="small">${jsonError.message}</p>
                                <button class="btn btn-outline mt-md" onclick="initQuizGenerator()">重试</button>
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error('Error generating quiz:', error);
                quizContainer.innerHTML = `
                    <div class="text-center text-error">
                        <p>抱歉，生成测验时出现错误。请再试一次。</p>
                        <p class="small">${error.message}</p>
                        <button class="btn btn-outline mt-md" onclick="initQuizGenerator()">重试</button>
                    </div>
                `;
            }
        });
        
        // 辅助函数 - 从文本中解析测验
        function parseQuizFromText(text, topic) {
            const lines = text.split('\n');
            const quiz = {
                title: `${topic}测验`,
                questions: []
            };
            
            let currentQuestion = null;
            let questionCounter = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // 跳过空行
                if (!line) continue;
                
                // 如果找到标题，使用它
                if (i < 5 && (line.includes('测验') || line.includes('测试') || line.includes('Quiz'))) {
                    quiz.title = line;
                    continue;
                }
                
                // 检查是否是新问题的开始 (数字+问题或问题序号)
                const questionStartMatch = line.match(/^(\d+)[\.、\)](.+)/) || line.match(/^问题\s*(\d+)[\.、\):](.+)/);
                if (questionStartMatch) {
                    // 保存前一个问题
                    if (currentQuestion && currentQuestion.options.length > 0) {
                        quiz.questions.push(currentQuestion);
                    }
                    
                    // 创建新问题
                    questionCounter++;
                    currentQuestion = {
                        id: questionCounter.toString(),
                        question: questionStartMatch[2].trim(),
                        options: [],
                        correctAnswer: ''
                    };
                    continue;
                }
                
                // 如果当前处理问题，检查是否是选项
                if (currentQuestion) {
                    const optionMatch = line.match(/^([A-D])[\.、\):](.+)/);
                    if (optionMatch) {
                        const optionId = optionMatch[1];
                        const optionText = optionMatch[2].trim();
                        
                        currentQuestion.options.push({
                            id: optionId,
                            text: optionText
                        });
                        
                        // 检查选项是否标记为正确答案
                        if (optionText.includes('(正确)') || optionText.includes('（正确）')) {
                            currentQuestion.correctAnswer = optionId;
                            // 移除选项文本中的正确标记
                            currentQuestion.options[currentQuestion.options.length - 1].text = 
                                optionText.replace(/\s*[\(（]正确[\)）]\s*/, '');
                        }
                        
                        continue;
                    }
                    
                    // 检查是否是答案标记
                    const answerMatch = line.match(/正确答案[是为:：]\s*([A-D])/i) || 
                                       line.match(/答案[是为:：]\s*([A-D])/i) ||
                                       line.match(/^\s*答案\s*[是为:：]?\s*([A-D])/i);
                    if (answerMatch && !currentQuestion.correctAnswer) {
                        currentQuestion.correctAnswer = answerMatch[1];
                    }
                }
            }
            
            // 添加最后一个问题
            if (currentQuestion && currentQuestion.options.length > 0) {
                quiz.questions.push(currentQuestion);
            }
            
            // 如果没有找到答案的问题，默认设置为A
            quiz.questions.forEach(q => {
                if (!q.correctAnswer && q.options.length > 0) {
                    q.correctAnswer = 'A';
                }
            });
            
            // 验证测验
            if (quiz.questions.length === 0) {
                throw new Error('无法从文本中提取问题');
            }
            
            return quiz;
        }
        
        // Function to render quiz
        function renderQuiz(quiz) {
            // Create quiz HTML
            let quizHTML = `
                <div class="quiz-header">
                    <h3>${quiz.title}</h3>
                    <p>请回答以下 ${quiz.questions.length} 个问题。</p>
                </div>
                <div class="quiz-questions">
            `;
            
            // Only show first question initially
            const firstQuestion = quiz.questions[0];
            
            quizHTML += `
                <div class="quiz-question-wrapper" data-question="${firstQuestion.id}" data-correct="${firstQuestion.correctAnswer}">
                    <div class="quiz-question">${firstQuestion.question}</div>
                    <div class="quiz-options">
            `;
            
            // Add options
            firstQuestion.options.forEach(option => {
                quizHTML += `
                    <div class="quiz-option" data-option="${option.id}">
                        <label>
                            <input type="radio" name="q-${firstQuestion.id}" value="${option.id}">
                            <span>${option.text}</span>
                        </label>
                    </div>
                `;
            });
            
            quizHTML += `
                    </div>
                    <div class="quiz-feedback" style="display: none;"></div>
                </div>
            `;
            
            // Add navigation buttons
            quizHTML += `
                <div class="quiz-navigation">
                    <button class="btn btn-outline quiz-prev" disabled>上一题</button>
                    <div class="quiz-progress">第 1 题，共 ${quiz.questions.length} 题</div>
                    <button class="btn btn-primary quiz-next">下一题</button>
                </div>
            `;
            
            quizHTML += `
                </div>
                <div class="quiz-results" style="display: none;">
                    <h3>测验结果</h3>
                    <p class="result-summary"></p>
                    <button class="btn btn-primary quiz-restart">再试一次</button>
                </div>
            `;
            
            // Set quiz HTML
            quizContainer.innerHTML = quizHTML;
            
            // Store all questions in a data attribute for later use
            quizContainer.setAttribute('data-questions', JSON.stringify(quiz.questions));
            quizContainer.setAttribute('data-current-question', 0);
            
            // Add event listeners
            setupQuizEvents();
            
            // 渲染数学公式
            if (window.MathJax) {
                window.MathJax.typeset();
            }
        }
        
        // Function to set up quiz event listeners
        function setupQuizEvents() {
            // Store quiz state
            const questions = JSON.parse(quizContainer.getAttribute('data-questions'));
            let currentQuestion = parseInt(quizContainer.getAttribute('data-current-question'));
            const userAnswers = [];
            
            // Get elements
            const prevBtn = quizContainer.querySelector('.quiz-prev');
            const nextBtn = quizContainer.querySelector('.quiz-next');
            const quizProgress = quizContainer.querySelector('.quiz-progress');
            
            // Option selection
            const options = quizContainer.querySelectorAll('.quiz-option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    // Select radio button
                    const radio = option.querySelector('input[type="radio"]');
                    radio.checked = true;
                    
                    // Add selected class
                    options.forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    
                    // Enable next button
                    nextBtn.disabled = false;
                });
            });
            
            // Previous button
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentQuestion > 0) {
                        currentQuestion--;
                        updateQuestion();
                    }
                });
            }
            
            // Next button
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    // Get selected option
                    const selected = quizContainer.querySelector('.quiz-option.selected');
                    if (!selected) return;
                    
                    const questionWrapper = quizContainer.querySelector('.quiz-question-wrapper');
                    const questionId = questionWrapper.getAttribute('data-question');
                    const correctAnswer = questionWrapper.getAttribute('data-correct');
                    const selectedOption = selected.getAttribute('data-option');
                    
                    // Record answer
                    userAnswers[currentQuestion] = {
                        questionId,
                        selectedOption,
                        isCorrect: selectedOption === correctAnswer
                    };
                    
                    // Check if this is the last question
                    if (currentQuestion < questions.length - 1) {
                        // Move to next question
                        currentQuestion++;
                        updateQuestion();
                    } else {
                        // Show results
                        showResults();
                    }
                });
            }
            
            // Function to update question display
            function updateQuestion() {
                const question = questions[currentQuestion];
                const questionWrapper = quizContainer.querySelector('.quiz-question-wrapper');
                
                // Update question
                questionWrapper.setAttribute('data-question', question.id);
                questionWrapper.setAttribute('data-correct', question.correctAnswer);
                questionWrapper.querySelector('.quiz-question').textContent = question.question;
                
                // Update options
                const optionsContainer = questionWrapper.querySelector('.quiz-options');
                optionsContainer.innerHTML = '';
                
                question.options.forEach(option => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'quiz-option';
                    optionElement.setAttribute('data-option', option.id);
                    
                    // Check if user already answered this question
                    if (userAnswers[currentQuestion] && userAnswers[currentQuestion].selectedOption === option.id) {
                        optionElement.classList.add('selected');
                    }
                    
                    optionElement.innerHTML = `
                        <label>
                            <input type="radio" name="q-${question.id}" value="${option.id}" ${userAnswers[currentQuestion] && userAnswers[currentQuestion].selectedOption === option.id ? 'checked' : ''}>
                            <span>${option.text}</span>
                        </label>
                    `;
                    optionsContainer.appendChild(optionElement);
                    
                    // Add event listener
                    optionElement.addEventListener('click', () => {
                        // Select radio button
                        const radio = optionElement.querySelector('input[type="radio"]');
                        radio.checked = true;
                        
                        // Add selected class
                        optionsContainer.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
                        optionElement.classList.add('selected');
                        
                        // Enable next button
                        nextBtn.disabled = false;
                    });
                });
                
                // Update feedback display
                const feedbackEl = questionWrapper.querySelector('.quiz-feedback');
                feedbackEl.style.display = 'none';
                
                // Update navigation
                prevBtn.disabled = currentQuestion === 0;
                nextBtn.disabled = !userAnswers[currentQuestion];
                quizProgress.textContent = `第 ${currentQuestion + 1} 题，共 ${questions.length} 题`;
                
                // Update quiz container data attribute
                quizContainer.setAttribute('data-current-question', currentQuestion);
                
                // If last question, change next button text
                if (currentQuestion === questions.length - 1) {
                    nextBtn.textContent = '完成测验';
                } else {
                    nextBtn.textContent = '下一题';
                }
                
                // 渲染数学公式
                if (window.MathJax) {
                    window.MathJax.typeset();
                }
            }
            
            // Function to show results
            function showResults() {
                // Calculate score
                const correct = userAnswers.filter(a => a.isCorrect).length;
                const total = questions.length;
                const percentage = Math.round((correct / total) * 100);
                
                // Update results
                const resultsDiv = quizContainer.querySelector('.quiz-results');
                const resultSummary = resultsDiv.querySelector('.result-summary');
                
                resultSummary.innerHTML = `
                    <div class="result-score">${correct} 题正确，共 ${total} 题 (${percentage}%)</div>
                    <div class="result-message">
                        ${percentage >= 80 ? '非常好！' : percentage >= 60 ? '做得好！' : '继续努力！'}
                    </div>
                `;
                
                // Hide questions, show results
                quizContainer.querySelector('.quiz-questions').style.display = 'none';
                resultsDiv.style.display = 'block';
                
                // Add restart button listener
                const restartBtn = resultsDiv.querySelector('.quiz-restart');
                restartBtn.addEventListener('click', () => {
                    // Reset quiz state
                    quizContainer.querySelector('.quiz-questions').style.display = 'block';
                    resultsDiv.style.display = 'none';
                    
                    // Clear user answers
                    for (let i = 0; i < userAnswers.length; i++) {
                        userAnswers[i] = undefined;
                    }
                    
                    // Reset to first question
                    currentQuestion = 0;
                    updateQuestion();
                });
            }
        }
    }
}

/**
 * Initialize formula category selector
 */
function initFormulaSelector() {
    const categoryButtons = document.querySelectorAll('.formula-category-btn');
    const categories = document.querySelectorAll('.formula-category');
    
    if (categoryButtons.length) {
        // Set first category as active by default
        categories[0].classList.add('active');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const target = button.getAttribute('data-target');
                
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active category
                categories.forEach(category => {
                    if (category.getAttribute('data-category') === target) {
                        category.classList.add('active');
                    } else {
                        category.classList.remove('active');
                    }
                });
                
                // Render math formulas if MathJax is available
                if (window.MathJax) {
                    window.MathJax.typeset();
                }
            });
        });
    }
}

/**
 * Initialize math concept visualizer
 */
function initMathVisualizer() {
    const loadButton = document.getElementById('load-visualization');
    const visualizationContainer = document.getElementById('visualization-container');
    const topicSelect = document.getElementById('visualizer-topic');
    
    if (loadButton && visualizationContainer && topicSelect) {
        loadButton.addEventListener('click', () => {
            const topic = topicSelect.value;
            
            // Show loading state
            visualizationContainer.innerHTML = '<div class="text-center"><p>Loading visualization...</p></div>';
            
            // Simulate loading delay
            setTimeout(() => {
                // For this demo, we'll just render some placeholder visualizations
                renderVisualization(topic);
            }, 1000);
        });
        
        // Function to render visualization
        function renderVisualization(topic) {
            let visualization = '';
            
            switch (topic) {
                case 'function-graphs':
                    visualization = renderFunctionGraphs();
                    break;
                case 'geometric-shapes':
                    visualization = renderGeometricShapes();
                    break;
                case 'trigonometric-functions':
                    visualization = renderTrigonometricFunctions();
                    break;
                case 'statistical-distributions':
                    visualization = renderStatisticalDistributions();
                    break;
                default:
                    visualization = '<p>Visualization not available.</p>';
            }
            
            visualizationContainer.innerHTML = visualization;
            
            // Initialize any interactive elements
            initInteractiveVisualizations();
        }
        
        // Function to render function graphs
        function renderFunctionGraphs() {
            return `
                <div class="visualization-content">
                    <h3>Function Graphs</h3>
                    <div class="graph-container">
                        <img src="../../assets/images/function-graph-placeholder.svg" alt="Function Graph" class="graph-image">
                        <div class="graph-controls">
                            <div class="form-group">
                                <label for="function-select">Select Function</label>
                                <select id="function-select" class="form-control">
                                    <option value="linear">Linear: f(x) = mx + b</option>
                                    <option value="quadratic">Quadratic: f(x) = ax² + bx + c</option>
                                    <option value="cubic">Cubic: f(x) = ax³ + bx² + cx + d</option>
                                    <option value="exponential">Exponential: f(x) = aˣ</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Function Parameters</label>
                                <div class="parameter-sliders">
                                    <div class="parameter-slider">
                                        <label for="param-a">a: <span id="param-a-value">1</span></label>
                                        <input type="range" id="param-a" min="-5" max="5" step="0.1" value="1">
                                    </div>
                                    <div class="parameter-slider">
                                        <label for="param-b">b: <span id="param-b-value">0</span></label>
                                        <input type="range" id="param-b" min="-5" max="5" step="0.1" value="0">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="visualization-info">
                        <p>Explore how changing parameters affects the graph of different functions.</p>
                    </div>
                </div>
            `;
        }
        
        // Function to render geometric shapes
        function renderGeometricShapes() {
            return `
                <div class="visualization-content">
                    <h3>Geometric Shapes</h3>
                    <div class="shapes-container">
                        <img src="../../assets/images/geometric-shapes-placeholder.svg" alt="Geometric Shapes" class="shapes-image">
                        <div class="shapes-controls">
                            <div class="form-group">
                                <label for="shape-select">Select Shape</label>
                                <select id="shape-select" class="form-control">
                                    <option value="triangle">Triangle</option>
                                    <option value="square">Square</option>
                                    <option value="circle">Circle</option>
                                    <option value="polygon">Regular Polygon</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Shape Properties</label>
                                <div class="shape-properties">
                                    <div class="property-input">
                                        <label for="shape-size">Size:</label>
                                        <input type="range" id="shape-size" min="50" max="200" value="100">
                                    </div>
                                    <div class="property-input">
                                        <label for="shape-sides">Sides (for polygon):</label>
                                        <input type="number" id="shape-sides" min="3" max="12" value="5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="visualization-info">
                        <p>Explore properties of different geometric shapes including area, perimeter, and angles.</p>
                    </div>
                </div>
            `;
        }
        
        // Function to render trigonometric functions
        function renderTrigonometricFunctions() {
            return `
                <div class="visualization-content">
                    <h3>Trigonometric Functions</h3>
                    <div class="trig-container">
                        <img src="../../assets/images/trigonometric-functions-placeholder.svg" alt="Trigonometric Functions" class="trig-image">
                        <div class="trig-controls">
                            <div class="form-group">
                                <label for="trig-function">Select Function</label>
                                <select id="trig-function" class="form-control">
                                    <option value="sin">Sine: sin(x)</option>
                                    <option value="cos">Cosine: cos(x)</option>
                                    <option value="tan">Tangent: tan(x)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Function Parameters</label>
                                <div class="parameter-sliders">
                                    <div class="parameter-slider">
                                        <label for="amplitude">Amplitude (A): <span id="amplitude-value">1</span></label>
                                        <input type="range" id="amplitude" min="0.1" max="3" step="0.1" value="1">
                                    </div>
                                    <div class="parameter-slider">
                                        <label for="frequency">Frequency (B): <span id="frequency-value">1</span></label>
                                        <input type="range" id="frequency" min="0.1" max="3" step="0.1" value="1">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="visualization-info">
                        <p>Explore how trigonometric functions behave and their relationships to the unit circle.</p>
                    </div>
                </div>
            `;
        }
        
        // Function to render statistical distributions
        function renderStatisticalDistributions() {
            return `
                <div class="visualization-content">
                    <h3>Statistical Distributions</h3>
                    <div class="stats-container">
                        <img src="../../assets/images/statistical-distribution-placeholder.svg" alt="Statistical Distribution" class="stats-image">
                        <div class="stats-controls">
                            <div class="form-group">
                                <label for="distribution-type">Distribution Type</label>
                                <select id="distribution-type" class="form-control">
                                    <option value="normal">Normal Distribution</option>
                                    <option value="uniform">Uniform Distribution</option>
                                    <option value="binomial">Binomial Distribution</option>
                                    <option value="poisson">Poisson Distribution</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Distribution Parameters</label>
                                <div class="parameter-inputs">
                                    <div class="parameter-input">
                                        <label for="mean">Mean (μ):</label>
                                        <input type="number" id="mean" min="0" max="100" value="50">
                                    </div>
                                    <div class="parameter-input">
                                        <label for="std-dev">Standard Deviation (σ):</label>
                                        <input type="number" id="std-dev" min="1" max="30" value="10">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="visualization-info">
                        <p>Explore different statistical distributions and how their parameters affect their shape.</p>
                    </div>
                </div>
            `;
        }
        
        // Function to initialize interactive elements
        function initInteractiveVisualizations() {
            // For a real implementation, this would include code to make
            // the visualizations interactive, potentially using libraries
            // like D3.js, Chart.js, or GeoGebra
            
            // For this demo, we'll just add some basic slider interactions
            const sliders = visualizationContainer.querySelectorAll('input[type="range"]');
            
            sliders.forEach(slider => {
                const valueDisplay = document.getElementById(`${slider.id}-value`);
                
                if (valueDisplay) {
                    slider.addEventListener('input', () => {
                        valueDisplay.textContent = slider.value;
                    });
                }
            });
        }
    }
} 