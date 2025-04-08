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
            // Show loading state
            quizContainer.innerHTML = '<div class="text-center"><p>正在生成测验中...</p></div>';
            
            try {
                // Get quiz options
                const topic = topicSelect ? topicSelect.value : 'algebra';
                const difficulty = difficultySelect ? difficultySelect.value : 'medium';
                const count = questionsSelect ? parseInt(questionsSelect.value) : 5;
                
                // Get education level from header profile display
                const profileDisplay = document.querySelector('.profile-display');
                let educationLevel = 'middle-school'; // Default value
                let grade = '';
                let semester = '';

                if (profileDisplay) {
                    const levelText = profileDisplay.textContent.toLowerCase();
                const profile = levelText.split(" | "); // Split by " | "

                if (levelText.includes('小学')) {
                    educationLevel = 'elementary-school';
                    // Extract grade from the text, e.g., "小学 | 三年级"
                    // const gradeMatch = levelText.match(/小学(\d+)年级/);
                    grade = profile[1]; // Get the second part

                } else if (levelText.includes('初中')) {
                    educationLevel = 'middle-school';
                    // Extract grade from the text, e.g., "初中 | 二年级"
                    // const gradeMatch = levelText.match(/初中(\d+)年级/);
                    grade = profile[1]; // Get the second part

                } else if (levelText.includes('高中')) {
                    educationLevel = 'high-school';
                    // Extract grade from the text, e.g., "高中 | 一年级"
                    // const gradeMatch = levelText.match(/高中(\d+)年级/);
                    grade = profile[1]; // Get the second part
                }
                
                console.log(grade);

                // Extract semester from the text, e.g., "上学期" or "下学期"
                if (levelText.includes('上学期')) {
                    semester = '上学期';
                } else if (levelText.includes('下学期')) {
                    semester = '下学期';
                }
                }
                
                const levelName = getEducationLevelName(educationLevel);
                const topicName = getTopicName(topic);
                const difficultyName = getDifficultyName(difficulty);
                
                // Adjust difficulty and content based on education level
                let levelSpecificPrompt = '';
                
                switch(educationLevel) {
                    case 'elementary-school':
                        levelSpecificPrompt = '题目应该使用基础数学概念和计算。每个问题都应该有明确的答案，避免复杂的推理。解释应该使用简单的语言，并包含具体的例子。';
                        break;

                    case 'middle-school':
                        levelSpecificPrompt = '题目应该使用适当的数学术语。可以包含一些需要推理的问题，但答案应该相对明确。解释应该详细但不过于复杂。';

                        break;
                    case 'high-school':
                        levelSpecificPrompt = '题目可以包含更复杂的内容，使用高级数学概念和复杂推理。可以包含需要批判性思维的问题，以及一些需要深入理解的概念。解释应该全面且专业。';

                        break;
                    default:
                        levelSpecificPrompt = '题目应该适合初中生水平，使用适当的数学术语和概念。';
                }
                
                // Build system message
                const systemMessage = `你是一个专业的数学教育助手，现在需要为${levelName}${grade}${semester}学生生成一个关于${topicName}的${difficultyName}难度测验，包含${count}道选择题。
                
                ${levelSpecificPrompt}
                
                每个问题应包含问题描述、4个选项（A、B、C、D）、正确答案和详细的解释说明。
                解释说明应该包含：
                1. 为什么这个选项是正确的
                2. 其他选项为什么是错误的
                3. 相关的数学概念和公式
                4. 适合${levelName}${grade}学生理解的具体例子
                
                请确保题目范围适合${levelName}${grade}学生的水平，题目难度为${difficultyName}。
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
                      "explanation": "详细的解释说明，包括正确答案的原因、错误选项的分析和相关数学知识"
                    }
                  ]
                }`;
                
                console.log(systemMessage);

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
                
                const assessmentPrompt = `你是一个专业的数学教育专家。请根据以下测验结果，为${levelName}学生提供关于${topicName}主题的学习评估和改进建议：
                
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
                                "content": "你是一个专业的数学教育专家，擅长分析学生的学习情况并提供针对性的学习建议。"
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
        case 'algebra': return '代数';
        case 'geometry': return '几何';
        case 'calculus': return '微积分';
        case 'statistics': return '统计学';
        case 'arithmetic': return '算术';
        case 'trigonometry': return '三角学';
        default: return '数学';
    }
}

function getDifficultyName(difficulty) {
    switch(difficulty) {
        case 'easy': return '简单';
        case 'medium': return '中等';
        case 'hard': return '困难';
        case 'complex': return '复杂';
        default: return '中等';
    }
}

/**
 * Initialize formula reference section
 */
function initFormulaSelector() {
    const formulaContainer = document.querySelector('.formula-container');
    if (!formulaContainer) return;

    let currentIndex = 0;
    let formulaImages = [];
    
    // Get education level and corresponding image path
    function getFormulaPath() {
        const profileText = document.getElementById('profile-display').textContent;
        
        if (profileText.includes('小学')) {
            return 'math/resource/小学数学公式定理/';
        } else if (profileText.includes('初中')) {
            return 'math/resource/初中数学公式定理/';
        } else if (profileText.includes('高中')) {
            return 'math/resource/高中数学公式定理/';
        }
        
        return 'math/resource/初中数学公式定理/'; // Default path
    }

    // Create gallery HTML structure
    function createGalleryStructure() {
        formulaContainer.innerHTML = `
            <div class="formula-gallery">
                <button class="nav-button prev-button" disabled>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="image-container">
                    <div class="image-slider">
                        <!-- Images will be loaded here -->
                    </div>
                </div>
                <button class="nav-button next-button">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

        // Add CSS for the gallery
        const style = document.createElement('style');
        style.textContent = `
            .formula-gallery {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                padding: 20px;
                position: relative;
            }

            .image-container {
                width: calc(100% - 100px);
                overflow: hidden;
                position: relative;
            }

            .image-slider {
                display: flex;
                transition: transform 0.5s ease;
                gap: 20px;
            }

            .formula-image-wrapper {
                flex: 0 0 calc(33.333% - 14px);
                aspect-ratio: 16/9;
                position: relative;
            }

            .formula-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
            }

            .formula-image:hover {
                transform: scale(1.05);
            }

            .nav-button {
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                z-index: 2;
            }

            .nav-button:hover:not(:disabled) {
                background: var(--primary-color-dark);
                transform: scale(1.1);
            }

            .nav-button:disabled {
                background: #ccc;
                cursor: not-allowed;
                opacity: 0.5;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            .formula-image-wrapper {
                animation: slideIn 0.5s ease forwards;
            }
        `;
        document.head.appendChild(style);
    }

    // Load formula images
    async function loadFormulaImages() {
        try {
            const path = getFormulaPath();
            console.log('Loading formula images from:', path);

            const response = await fetch('/api/list-files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path })
            });

            if (!response.ok) {
                throw new Error(`Failed to load formula images: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Received files:', data);

            formulaImages = data.files.filter(file => 
                file.toLowerCase().endsWith('.jpg') || 
                file.toLowerCase().endsWith('.png') ||
                file.toLowerCase().endsWith('.jpeg')
            );

            console.log('Filtered image files:', formulaImages);
            updateGallery();

        } catch (error) {
            console.error('Error loading formula images:', error);
            formulaContainer.innerHTML = `
                <div class="error-message">
                    <p>加载公式图片时出错，请稍后再试。</p>
                    <p class="error-details">错误信息: ${error.message}</p>
                </div>
            `;
        }
    }

    // Update gallery display
    function updateGallery() {
        const slider = formulaContainer.querySelector('.image-slider');
        const prevButton = formulaContainer.querySelector('.prev-button');
        const nextButton = formulaContainer.querySelector('.next-button');

        if (!slider) return;

        console.log('Updating gallery with images:', formulaImages);

        // Calculate total pages
        const totalPages = Math.ceil(formulaImages.length / 3);
        const currentPage = Math.floor(currentIndex / 3);

        // Update navigation buttons
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= formulaImages.length - 3;

        // Update slider transform
        slider.style.transform = `translateX(-${currentIndex * (100 / 3)}%)`;

        // Load visible images
        const visibleImages = formulaImages.slice(currentIndex, currentIndex + 3);
        
        console.log('Displaying images:', visibleImages);

        // Create image elements
        slider.innerHTML = visibleImages.map((image, index) => `
            <div class="formula-image-wrapper" style="animation-delay: ${index * 0.1}s">
                <img src="${getFormulaPath()}${image}" 
                     alt="数学公式 ${currentIndex + index + 1}" 
                     class="formula-image"
                     loading="lazy"
                     onerror="console.error('Failed to load image:', this.src)">
            </div>
        `).join('');
    }

    // Initialize gallery
    createGalleryStructure();
    loadFormulaImages();

    // Add navigation event listeners
    const prevButton = formulaContainer.querySelector('.prev-button');
    const nextButton = formulaContainer.querySelector('.next-button');

    prevButton?.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex = Math.max(0, currentIndex - 3);
            updateGallery();
        }
    });

    nextButton?.addEventListener('click', () => {
        if (currentIndex < formulaImages.length - 3) {
            currentIndex = Math.min(formulaImages.length - 3, currentIndex + 3);
            updateGallery();
        }
    });

    // Listen for profile changes
    const observer = new MutationObserver(() => {
        console.log('Profile changed, reloading formula images');
        currentIndex = 0;
        loadFormulaImages();
    });

    const profileDisplay = document.getElementById('profile-display');
    if (profileDisplay) {
        observer.observe(profileDisplay, { childList: true, characterData: true, subtree: true });
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