/**
 * Study Assist - Mathematics Subject JavaScript
 * Handles math-specific functionality and DeepSeek AI interactions
 */

console.log("Loading math script.js...");

// Check if we already have the displayMessage function globally
if (typeof window.displayMessage !== 'function') {
    // 全局函数 - 显示消息
    window.displayMessage = function(role, content, container) {
        console.log("displayMessage called:", role, container?.id || "no container");
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
    };
} else {
    console.log("displayMessage function already exists.");
}

// Keep the original function for backward compatibility
function displayMessage(role, content, container) {
    return window.displayMessage(role, content, container);
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
    
    // 存储聊天历史
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的数学教学助手，擅长解答关于代数、几何、微积分、统计、概率等数学分支的问题。你会提供清晰的解释、公式推导和适合用户教育水平的答案。"
        },
        {
            "role": "assistant",
            "content": "你好！我是你的数学学习助手。有什么数学问题我可以帮你解答吗？"
        }
    ];
    
    // 教育水平相关
    let educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
    
    // 当前选择的主题
    let currentTopic = null;
    
    // 初始化聊天界面
    if (chatMessages) {
        // 清空聊天区域
        chatMessages.innerHTML = '';
        
        // 显示初始消息
        displayMessage('assistant', chatHistory[1].content, chatMessages);
        
        // 更新系统提示
        updateSystemPrompt();
        
        // 检测教育水平变化
        window.addEventListener('education-level-change', function(event) {
            educationLevel = event.detail.level;
            updateSystemPrompt();
        });
    }
    
    if (sendButton && questionInput && chatMessages) {
        // Listen for send button click
        sendButton.addEventListener('click', () => sendMathQuestion());
        
        // Listen for Enter key press
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMathQuestion();
            }
        });
        
        // Function to send math question
        async function sendMathQuestion() {
            const question = questionInput.value.trim();
            
            if (question) {
                // Add user message to chat
                displayMessage('user', question, chatMessages);
                
                // Add to chat history
                chatHistory.push({
                    "role": "user",
                    "content": question
                });
                
                // Clear input
                questionInput.value = '';
                
                // Show loading indicator
                const loadingMessage = document.createElement('div');
                loadingMessage.className = 'message message-ai loading';
                loadingMessage.innerHTML = '<p>思考中...</p>';
                chatMessages.appendChild(loadingMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
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
                    displayMessage('assistant', aiResponse, chatMessages);
                    
                    // 添加到聊天历史
                    chatHistory.push({
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
            }
        }
    }
    
    // 更新系统提示
    function updateSystemPrompt() {
        let levelSpecificPrompt = '';
        
        switch(educationLevel) {
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
        
        // 添加主题特定提示
        let topicSpecificPrompt = '';
        
        if (currentTopic) {
            switch(currentTopic) {
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
        
        // 更新系统消息
        chatHistory[0].content = "你是一个专业的数学教学助手，擅长解答关于代数、几何、微积分、统计、概率等数学分支的问题。提供清晰的解释和适当深度的回答。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 当回答数学问题时，请使用适当的数学公式和符号，可使用LaTeX格式（用$或$$包围）来展示数学表达式。提供清晰的解题步骤和思路解释。";
    }
    
    // Set current topic from card clicks
    topicCards.forEach(card => {
        card.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            if (topic) {
                currentTopic = topic;
                updateSystemPrompt();
            }
        });
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
}

/**
 * Initialize the quiz generator
 */
function initQuizGenerator() {
    console.log("初始化测验生成器");
    const generateBtn = document.getElementById('generate-quiz');
    const quizContainer = document.getElementById('quiz-container');
    const topicSelect = document.getElementById('quiz-topic');
    const difficultySelect = document.getElementById('quiz-difficulty');
    const questionsSelect = document.getElementById('quiz-questions');
    
    if (!generateBtn) {
        console.error("无法找到生成测验按钮 (generate-quiz)");
        return;
    }
    
    if (!quizContainer) {
        console.error("无法找到测验容器 (quiz-container)");
        return;
    }
    
    if (!topicSelect || !difficultySelect || !questionsSelect) {
        console.warn("无法找到一个或多个选择器: topic-select, difficulty-select, questions-select");
    }
    
    console.log("添加生成测验按钮点击事件监听器");
    
    // 首先移除所有现有的事件监听器，避免重复绑定
    const newGenerateBtn = generateBtn.cloneNode(true);
    generateBtn.parentNode.replaceChild(newGenerateBtn, generateBtn);
    
    // 添加新的事件监听器
    newGenerateBtn.onclick = async function() {
        console.log("点击了生成测验按钮");
        generateQuiz();
    }
    
    // 生成测验的函数
    async function generateQuiz() {
        // Get quiz options
        const topic = topicSelect ? topicSelect.value : 'algebra';
        const difficulty = difficultySelect ? difficultySelect.value : 'medium';
        const count = questionsSelect ? parseInt(questionsSelect.value) : 5;
        
        console.log(`生成测验: 主题=${topic}, 难度=${difficulty}, 问题数=${count}`);
        
        // Show loading state
        quizContainer.innerHTML = '<div class="text-center"><p>生成测验中...</p><div class="loading-spinner"></div></div>';
        
        try {
            // 获取教育水平
            const educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
            
            // 构建系统消息
            const systemMessage = `你是一个专业的数学教育助手，现在需要生成一个关于${getTopicName(topic)}的${getDifficultyName(difficulty)}难度测验，包含${count}个选择题。请确保每个问题都符合${getEducationLevelName(educationLevel)}水平的学生理解能力。每个问题必须有4个选项(A、B、C、D)，并标明正确答案。对于每个问题还应提供简短的解释。`;
            
            // 构建用户消息
            const userPrompt = `请生成一个包含${count}道${getDifficultyName(difficulty)}难度的${getTopicName(topic)}选择题测验。每个问题都应包含4个选项(A, B, C, D)，并指明正确答案和解释。请按照以下JSON格式返回：
            {
              "title": "测验标题",
              "questions": [
                {
                  "id": "q1",
                  "question": "问题1的内容",
                  "options": [
                    {"id": "a", "text": "选项A的内容"},
                    {"id": "b", "text": "选项B的内容"},
                    {"id": "c", "text": "选项C的内容"},
                    {"id": "d", "text": "选项D的内容"}
                  ],
                  "correctAnswer": "正确选项的id",
                  "explanation": "问题解释"
                }
                // 更多问题...
              ]
            }`;
            
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
            
            // 准备请求数据
            const requestData = {
                messages: messages
            };
            
            // 创建API URL
            const apiUrl = '/api/chat';
            
            console.log(`调用 DeepSeek API，使用URL: ${apiUrl}`);
            console.log("请求数据:", JSON.stringify(requestData).substring(0, 200) + "...");
            
            try {
                // 调用DeepSeek API
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
                
                console.log("API响应状态:", response.status, response.statusText);
                console.log("响应头:", [...response.headers.entries()]);
                
                if (!response.ok) {
                    const responseText = await response.text();
                    console.error("API错误响应体:", responseText);
                    throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
                }
                
                console.log("获取到API响应");
                const data = await response.json();
                console.log("解析API响应为JSON:", Object.keys(data));
                
                if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
                    console.error("API响应缺少必要字段:", data);
                    throw new Error('API响应格式不正确');
                }
                
                const aiResponse = data.choices[0].message.content;
                console.log("AI响应长度:", aiResponse.length);
                console.log("AI响应预览:", aiResponse.substring(0, 200) + "...");
                
                // 尝试从AI响应中提取JSON
                try {
                    console.log("正在解析 AI 响应中的 JSON");
                    // 提取JSON部分
                    const jsonMatch = aiResponse.match(/```json\s*({[\s\S]*?})\s*```/) || 
                                    aiResponse.match(/({[\s\S]*"questions"[\s\S]*})/);
                    
                    let quizData;
                    if (jsonMatch && jsonMatch[1]) {
                        // 清理JSON字符串并解析
                        const cleanJson = jsonMatch[1].replace(/\\n/g, '\n').trim();
                        console.log("提取的 JSON:", cleanJson.substring(0, 100) + "...");
                        quizData = JSON.parse(cleanJson);
                    } else {
                        // 如果没有找到JSON格式，尝试直接解析整个响应
                        console.log("未找到JSON格式，尝试直接解析整个响应");
                        quizData = JSON.parse(aiResponse);
                    }
                    
                    if (quizData && quizData.questions && quizData.questions.length > 0) {
                        console.log("成功解析测验数据，题目数量:", quizData.questions.length);
                        renderQuiz({
                            title: quizData.title || `${getTopicName(topic)}测验 (${getDifficultyName(difficulty)})`,
                            questions: quizData.questions
                        });
                    } else {
                        console.error("解析的 JSON 数据不包含有效题目:", quizData);
                        throw new Error('无效的测验数据格式');
                    }
                } catch (jsonError) {
                    console.error('解析测验JSON数据失败:', jsonError);
                    console.log("原始 AI 响应预览:", aiResponse.substring(0, 200));
                    throw new Error('解析测验数据时出错，请重试');
                }
            } catch (fetchError) {
                console.error('API调用失败:', fetchError);
                throw new Error(`无法与API服务器通信: ${fetchError.message}`);
            }
        } catch (error) {
            console.error('生成测验时出错:', error);
            quizContainer.innerHTML = `
                <div class="text-center text-error">
                    <p>抱歉，生成测验时出现错误。请重试。</p>
                    <p class="error-details">${error.message}</p>
                    <button class="btn btn-outline mt-md" id="retry-quiz-btn">重试</button>
                </div>
            `;
            
            // 添加重试按钮事件监听器
            const retryBtn = document.getElementById('retry-quiz-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => generateQuiz());
            }
        }
    }
    
    // Function to render quiz
    function renderQuiz(quiz) {
        // Create quiz HTML
        let quizHTML = `
            <div class="quiz-header">
                <h3>${quiz.title}</h3>
                <p>回答以下 ${quiz.questions.length} 个问题。</p>
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
            let optionsHTML = '';
            
            question.options.forEach(option => {
                optionsHTML += `
                    <div class="quiz-option" data-option="${option.id}">
                        <label>
                            <input type="radio" name="q-${question.id}" value="${option.id}">
                            <span>${option.text}</span>
                        </label>
                    </div>
                `;
            });
            
            optionsContainer.innerHTML = optionsHTML;
            
            // Clear selection
            const options = questionWrapper.querySelectorAll('.quiz-option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    const radio = option.querySelector('input[type="radio"]');
                    radio.checked = true;
                    
                    options.forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                    
                    nextBtn.disabled = false;
                });
            });
            
            // Check if the question was already answered
            if (userAnswers[currentQuestion]) {
                const selectedOption = questionWrapper.querySelector(`.quiz-option[data-option="${userAnswers[currentQuestion].selectedOption}"]`);
                if (selectedOption) {
                    selectedOption.classList.add('selected');
                    selectedOption.querySelector('input[type="radio"]').checked = true;
                    nextBtn.disabled = false;
                }
            } else {
                nextBtn.disabled = true;
            }
            
            // Update navigation
            prevBtn.disabled = currentQuestion === 0;
            nextBtn.textContent = currentQuestion === questions.length - 1 ? '完成' : '下一题';
            quizProgress.textContent = `第 ${currentQuestion + 1} 题，共 ${questions.length} 题`;
            
            // Reset feedback
            const feedback = questionWrapper.querySelector('.quiz-feedback');
            feedback.style.display = 'none';
            feedback.innerHTML = '';
            
            // Update current question in data attribute
            quizContainer.setAttribute('data-current-question', currentQuestion);
        }
        
        // Function to show results
        function showResults() {
            // Calculate score
            const totalQuestions = questions.length;
            const correctAnswers = userAnswers.filter(a => a && a.isCorrect).length;
            const score = Math.round((correctAnswers / totalQuestions) * 100);
            
            // Hide questions
            quizContainer.querySelector('.quiz-questions').style.display = 'none';
            
            // Show results
            const resultsDiv = quizContainer.querySelector('.quiz-results');
            resultsDiv.style.display = 'block';
            
            // Update result summary
            const resultSummary = resultsDiv.querySelector('.result-summary');
            resultSummary.innerHTML = `
                <div class="score-display">
                    <div class="score-circle ${score >= 70 ? 'score-passing' : 'score-failing'}">
                        <span class="score-number">${score}%</span>
                    </div>
                    <p>你答对了 ${correctAnswers} 题，共 ${totalQuestions} 题</p>
                </div>
                <div class="results-breakdown">
                    <h4>答题详情</h4>
                    <div class="results-questions">
            `;
            
            // Add question breakdown
            questions.forEach((question, index) => {
                const userAnswer = userAnswers[index] || { selectedOption: '未作答', isCorrect: false };
                
                resultSummary.querySelector('.results-questions').innerHTML += `
                    <div class="result-question ${userAnswer.isCorrect ? 'correct' : 'incorrect'}">
                        <div class="result-question-header">
                            <span class="result-question-number">问题 ${index + 1}</span>
                            <span class="result-status">${userAnswer.isCorrect ? '正确 ✓' : '错误 ✗'}</span>
                        </div>
                        <div class="result-question-content">
                            <p>${question.question}</p>
                            <p class="result-answer"><strong>你的答案:</strong> ${userAnswer.selectedOption === '未作答' ? '未作答' : question.options.find(o => o.id === userAnswer.selectedOption)?.text || '未知选项'}</p>
                            <p class="result-correct-answer ${userAnswer.isCorrect ? 'hidden' : ''}"><strong>正确答案:</strong> ${question.options.find(o => o.id === question.correctAnswer)?.text || '未知选项'}</p>
                            <p class="result-explanation"><strong>解释:</strong> ${question.explanation || '暂无解释'}</p>
                        </div>
                    </div>
                `;
            });
            
            // Add restart button listener
            const restartBtn = resultsDiv.querySelector('.quiz-restart');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    initQuizGenerator();
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

// 辅助函数 - 获取主题名称（中文）
function getTopicName(topic) {
    switch(topic) {
        case 'algebra': return '代数';
        case 'geometry': return '几何';
        case 'calculus': return '微积分';
        case 'statistics': return '统计学';
        case 'arithmetic': return '算术';
        case 'trigonometry': return '三角学';
        default: return topic;
    }
}

// 辅助函数 - 获取难度名称（中文）
function getDifficultyName(difficulty) {
    switch(difficulty) {
        case 'easy': return '简单';
        case 'medium': return '中等';
        case 'hard': return '困难';
        default: return difficulty;
    }
}

// 辅助函数 - 获取教育水平名称（中文）
function getEducationLevelName(level) {
    switch(level) {
        case 'elementary-school': return '小学';
        case 'middle-school': return '初中';
        case 'high-school': return '高中';
        default: return '初中';
    }
} 