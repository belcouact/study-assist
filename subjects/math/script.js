/**
 * Study Assist - Mathematics Subject JavaScript
 * Handles math-specific functionality and DeepSeek AI interactions
 */

// Define a global helper for displaying messages in the math chat
function displayMathMessage(message) {
    const chatMessages = document.getElementById('math-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-ai';
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageDiv);
    
    // Use the new helper function for typesetting
    typesetMath(messageDiv).catch(error => {
        console.error('Error typesetting math:', error);
    });
    
    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize math subject functionality
    initMathPage();
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
async function initMathAssistant() {
    try {
        await initChat();
        // Wait for MathJax to be ready
        if (window.MathJax && !window.MathJax.typeset) {
            await new Promise(resolve => {
                const checkMathJax = setInterval(() => {
                    if (window.MathJax.typeset) {
                        clearInterval(checkMathJax);
                        resolve();
                    }
                }, 100);
                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkMathJax);
                    resolve();
                }, 5000);
            });
        }
    } catch (error) {
        console.error('Error initializing math assistant:', error);
    }
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
            return '/subjects/math/resource/小学数学公式定理/';
        } else if (profileText.includes('初中')) {
            return '/subjects/math/resource/初中数学公式定理/';
        } else if (profileText.includes('高中')) {
            return '/subjects/math/resource/高中数学公式定理/';
        }
        
        return '/subjects/math/resource/初中数学公式定理/'; // Default path
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

            // For demonstration, let's use a predefined set of images
            // In a real application, you would fetch this from your server
            const demoImages = {
                '/subjects/math/resource/小学数学公式定理/': [
                    'basic_arithmetic.png',
                    'fractions.png',
                    'basic_geometry.png',
                    'multiplication_tables.png',
                    'basic_measurement.png',
                    'simple_equations.png'
                ],
                '/subjects/math/resource/初中数学公式定理/': [
                    'algebra_formulas.png',
                    'geometry_formulas.png',
                    'trigonometry_basics.png',
                    'linear_equations.png',
                    'quadratic_equations.png',
                    'statistics_basics.png'
                ],
                '/subjects/math/resource/高中数学公式定理/': [
                    'advanced_algebra.png',
                    'calculus_basics.png',
                    'advanced_trigonometry.png',
                    'complex_numbers.png',
                    'probability_theory.png',
                    'analytical_geometry.png'
                ]
            };

            formulaImages = demoImages[path] || demoImages['/subjects/math/resource/初中数学公式定理/'];
            console.log('Loaded images:', formulaImages);
            
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
                     onerror="this.src='../../assets/images/formula-placeholder.png'">
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

// Math concepts by education level
const mathConcepts = {
    elementary: {
        'basic-numbers': '数的认识与运算',
        'fractions': '分数与小数',
        'basic-geometry': '基本几何图形',
        'measurement': '测量与单位',
        'basic-statistics': '简单统计图表'
    },
    middle: {
        'linear-functions': '一次函数',
        'quadratic-functions': '二次函数',
        'geometry-2d': '平面几何',
        'algebra-basics': '代数基础',
        'probability': '概率统计',
        'triangles': '三角形性质'
    },
    high: {
        'advanced-functions': '高等函数',
        'trigonometry': '三角函数',
        'calculus-basics': '微积分基础',
        'vectors': '向量与空间',
        'complex-numbers': '复数',
        'probability-advanced': '概率与统计进阶'
    }
};

// Visualization functions for each concept
const visualizations = {
    // Helper function to ensure container is ready
    ensureContainer: function(container, title) {
        if (!container || !document.body.contains(container)) {
            console.error('Container is not ready:', container);
            return false;
        }
        return true;
    },

    // Elementary School Visualizations
    'basic-numbers': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const x = Array.from({length: 20}, (_, i) => i + 1);
            const data = [
                {
                    type: 'scatter',
                    mode: 'markers+lines+text',
                    x: x,
                    y: x,
                    text: x.map(n => n.toString()),
                    textposition: 'top',
                    marker: {size: 12, color: 'rgb(67, 97, 238)'},
                    name: '数列'
                },
                {
                    type: 'scatter',
                    mode: 'markers+lines+text',
                    x: x,
                    y: x.map(n => n * 2),
                    text: x.map(n => (n * 2).toString()),
                    textposition: 'top',
                    marker: {size: 12, color: 'rgb(114, 9, 183)'},
                    name: '2倍数列'
                }
            ];
            
            const layout = {
                title: '数的认识与序列关系',
                xaxis: {
                    title: '序号',
                    range: [0, 20],
                    zeroline: true
                },
                yaxis: {
                    title: '数值',
                    range: [0, 40],
                    zeroline: true
                },
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>数的认识解析</h4>
                <p><strong>基本概念：</strong></p>
                <ul>
                    <li><strong>自然数：</strong>
                        <ul>
                            <li>从1开始的正整数序列</li>
                            <li>可以用来计数和排序</li>
                            <li>具有加法和乘法性质</li>
                        </ul>
                    </li>
                    <li><strong>数的规律：</strong>
                        <ul>
                            <li>递增：每个数比前一个数大</li>
                            <li>倍数关系：2倍、3倍等</li>
                            <li>奇偶数：奇数和偶数的特点</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li>数数和计数：课堂人数统计</li>
                    <li>排序：比赛名次排列</li>
                    <li>购物计算：物品数量和价格</li>
                    <li>时间计算：日期和时间的表示</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating basic-numbers visualization:', error);
            throw error;
        }
    },

    'fractions': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const data = [
                {
                    values: [1, 1, 1, 1],
                    labels: ['1/4', '1/4', '1/4', '1/4'],
                    type: 'pie',
                    name: '四等分',
                    domain: {row: 0, column: 0},
                    marker: {
                        colors: ['rgb(67, 97, 238)', 'rgb(114, 9, 183)', 'rgb(86, 11, 173)', 'rgb(72, 12, 168)']
                    }
                },
                {
                    values: [2, 1],
                    labels: ['2/3', '1/3'],
                    type: 'pie',
                    name: '三等分',
                    domain: {row: 0, column: 1},
                    marker: {
                        colors: ['rgb(67, 97, 238)', 'rgb(114, 9, 183)']
                    }
                }
            ];
            
            const layout = {
                title: '分数的可视化表示',
                grid: {rows: 1, columns: 2},
                height: 400,
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>分数与小数解析</h4>
                <p><strong>基本概念：</strong></p>
                <ul>
                    <li><strong>分数的组成：</strong>
                        <ul>
                            <li>分子：表示部分的数量</li>
                            <li>分母：表示平均分成的份数</li>
                            <li>分数线：表示除法关系</li>
                        </ul>
                    </li>
                    <li><strong>分数的类型：</strong>
                        <ul>
                            <li>真分数：分子小于分母</li>
                            <li>假分数：分子大于分母</li>
                            <li>带分数：整数和真分数的组合</li>
                        </ul>
                    </li>
                    <li><strong>小数：</strong>
                        <ul>
                            <li>小数点的意义</li>
                            <li>小数和分数的转换</li>
                            <li>十进制计数法</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li>分配食物：将披萨分成等份</li>
                    <li>测量长度：使用尺子测量</li>
                    <li>配制饮料：调配不同配比</li>
                    <li>购物计算：价格和重量</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating fractions visualization:', error);
            throw error;
        }
    },

    'basic-geometry': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const shapes = [
                {
                    type: 'rect',
                    x0: 1, y0: 1,
                    x1: 3, y1: 3,
                    line: {color: 'rgb(67, 97, 238)'},
                    fillcolor: 'rgba(67, 97, 238, 0.2)'
                },
                {
                    type: 'circle',
                    x0: 4, y0: 1,
                    x1: 6, y1: 3,
                    line: {color: 'rgb(114, 9, 183)'},
                    fillcolor: 'rgba(114, 9, 183, 0.2)'
                },
                {
                    type: 'path',
                    path: 'M 7 1 L 9 3 L 7 3 Z',
                    line: {color: 'rgb(86, 11, 173)'},
                    fillcolor: 'rgba(86, 11, 173, 0.2)'
                }
            ];

            const data = [];
            const annotations = [
                {
                    x: 2, y: 0.5,
                    text: '正方形',
                    showarrow: false
                },
                {
                    x: 5, y: 0.5,
                    text: '圆形',
                    showarrow: false
                },
                {
                    x: 8, y: 0.5,
                    text: '三角形',
                    showarrow: false
                }
            ];
            
            const layout = {
                title: '基本几何图形',
                xaxis: {range: [0, 10], zeroline: true},
                yaxis: {range: [0, 4], zeroline: true},
                shapes: shapes,
                annotations: annotations,
                showlegend: false,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>基本几何图形解析</h4>
                <p><strong>基本图形：</strong></p>
                <ul>
                    <li><strong>正方形：</strong>
                        <ul>
                            <li>四条边相等</li>
                            <li>四个角都是90度</li>
                            <li>周长 = 4×边长</li>
                            <li>面积 = 边长×边长</li>
                        </ul>
                    </li>
                    <li><strong>圆形：</strong>
                        <ul>
                            <li>圆心到圆上任意点距离相等</li>
                            <li>周长 = 2×π×半径</li>
                            <li>面积 = π×半径×半径</li>
                        </ul>
                    </li>
                    <li><strong>三角形：</strong>
                        <ul>
                            <li>三个角的和是180度</li>
                            <li>面积 = 底×高÷2</li>
                            <li>三条边组成封闭图形</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li>生活中的形状识别</li>
                    <li>物品包装设计</li>
                    <li>房间面积计算</li>
                    <li>操场跑道设计</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating basic-geometry visualization:', error);
            throw error;
        }
    },

    'measurement': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            // Create container for the visualization
            const visualContainer = document.createElement('div');
            visualContainer.className = 'visualization-container active';
            container.appendChild(visualContainer);

            // Create interactive unit conversion calculator
            const calculatorDiv = document.createElement('div');
            calculatorDiv.className = 'unit-calculator';
            calculatorDiv.innerHTML = `
                <div class="calculator-input" style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                    <input type="number" id="unitValue" value="1" min="0" step="0.1" style="width: 100px; padding: 5px;">
                    <select id="fromUnit" style="padding: 5px; margin: 0 10px;">
                        <option value="mm">毫米 (mm)</option>
                        <option value="cm">厘米 (cm)</option>
                        <option value="dm">分米 (dm)</option>
                        <option value="m">米 (m)</option>
                    </select>
                    <span>转换为</span>
                    <select id="toUnit" style="padding: 5px; margin: 0 10px;">
                        <option value="mm">毫米 (mm)</option>
                        <option value="cm" selected>厘米 (cm)</option>
                        <option value="dm">分米 (dm)</option>
                        <option value="m">米 (m)</option>
                    </select>
                    <div id="conversionResult" class="result" style="margin-top: 10px; font-size: 1.2em; color: #2196F3;">= 10 厘米</div>
                </div>
            `;
            visualContainer.appendChild(calculatorDiv);

            // Rest of the measurement function code remains the same
            const unitValue = calculatorDiv.querySelector('#unitValue');
            const fromUnit = calculatorDiv.querySelector('#fromUnit');
            const toUnit = calculatorDiv.querySelector('#toUnit');
            const result = calculatorDiv.querySelector('#conversionResult');

            function updateConversion() {
                const value = parseFloat(unitValue.value);
                const from = fromUnit.value;
                const to = toUnit.value;
                
                const conversions = {
                    mm: 1,
                    cm: 10,
                    dm: 100,
                    m: 1000
                };
                
                const inMM = value * conversions[from];
                const converted = inMM / conversions[to];
                
                const unitNames = {
                    mm: '毫米',
                    cm: '厘米',
                    dm: '分米',
                    m: '米'
                };
                
                result.textContent = `= ${converted.toFixed(2)} ${unitNames[to]}`;
            }

            unitValue.addEventListener('input', updateConversion);
            fromUnit.addEventListener('change', updateConversion);
            toUnit.addEventListener('change', updateConversion);

            // Create chart container
            const chartContainer = document.createElement('div');
            chartContainer.id = 'measurementChart';
            chartContainer.style.height = '400px';
            visualContainer.appendChild(chartContainer);

            const data = [
                {
                    type: 'bar',
                    x: ['1毫米', '1厘米', '1分米', '1米'],
                    y: [1, 10, 100, 1000],
                    text: ['1mm', '10mm', '100mm', '1000mm'],
                    textposition: 'auto',
                    marker: {
                        color: ['rgb(67, 97, 238)', 'rgb(114, 9, 183)', 
                               'rgb(86, 11, 173)', 'rgb(72, 12, 168)']
                    },
                    hovertemplate: '%{x}: %{y}毫米<extra></extra>'
                }
            ];
            
            const layout = {
                title: '长度单位换算关系',
                xaxis: {
                    title: '单位',
                    showgrid: true
                },
                yaxis: {
                    title: '毫米数值',
                    showgrid: true,
                    type: 'log'
                },
                showlegend: false,
                autosize: true,
                hovermode: 'closest'
            };

            const config = {
                responsive: true,
                displayModeBar: true,
                modeBarButtonsToRemove: ['lasso2d', 'select2d']
            };

            Plotly.newPlot(chartContainer, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.style.marginTop = '20px';
            explanationDiv.innerHTML = `
                <h4>测量与单位解析</h4>
                <p><strong>长度单位：</strong></p>
                <ul>
                    <li><strong>基本单位换算：</strong>
                        <ul>
                            <li>1米 = 10分米</li>
                            <li>1分米 = 10厘米</li>
                            <li>1厘米 = 10毫米</li>
                        </ul>
                    </li>
                    <li><strong>常用单位：</strong>
                        <ul>
                            <li>毫米：最小的日常长度单位</li>
                            <li>厘米：适合测量小物品</li>
                            <li>分米：适合测量中等物品</li>
                            <li>米：基本长度单位</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li>使用尺子测量物品长度</li>
                    <li>估算距离和长度</li>
                    <li>选择合适的测量单位</li>
                    <li>日常物品尺寸描述</li>
                </ul>
            `;
            visualContainer.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating measurement visualization:', error);
            throw error;
        }
    },

    'basic-statistics': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            // Create container for the visualization
            const visualContainer = document.createElement('div');
            visualContainer.className = 'visualization-container active';
            container.appendChild(visualContainer);

            // Create data input interface
            const inputDiv = document.createElement('div');
            inputDiv.className = 'stats-input';
            inputDiv.style.margin = '20px 0';
            inputDiv.style.padding = '15px';
            inputDiv.style.border = '1px solid #ddd';
            inputDiv.style.borderRadius = '8px';
            inputDiv.innerHTML = `
                <div class="data-input">
                    <h4 style="margin-top: 0;">输入数据</h4>
                    <input type="number" id="dataInput" placeholder="输入数值" min="0" max="100" style="width: 100px; padding: 5px;">
                    <button id="addData" style="margin: 0 10px; padding: 5px 15px; background-color: #2196F3; color: white; border: none; border-radius: 4px;">添加</button>
                    <button id="clearData" style="padding: 5px 15px; background-color: #f44336; color: white; border: none; border-radius: 4px;">清除</button>
                    <div id="currentData" class="data-display" style="margin-top: 10px; font-style: italic;"></div>
                </div>
                <div class="stats-display" style="margin-top: 15px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <div style="padding: 10px; background: #f5f5f5; border-radius: 4px;">平均值: <span id="mean" style="font-weight: bold;">-</span></div>
                    <div style="padding: 10px; background: #f5f5f5; border-radius: 4px;">最大值: <span id="max" style="font-weight: bold;">-</span></div>
                    <div style="padding: 10px; background: #f5f5f5; border-radius: 4px;">最小值: <span id="min" style="font-weight: bold;">-</span></div>
                </div>
            `;
            visualContainer.appendChild(inputDiv);

            // Create chart container
            const chartContainer = document.createElement('div');
            chartContainer.id = 'statsChart';
            chartContainer.style.height = '400px';
            visualContainer.appendChild(chartContainer);

            let data = [];
            const dataInput = inputDiv.querySelector('#dataInput');
            const addButton = inputDiv.querySelector('#addData');
            const clearButton = inputDiv.querySelector('#clearData');
            const currentData = inputDiv.querySelector('#currentData');
            const meanDisplay = inputDiv.querySelector('#mean');
            const maxDisplay = inputDiv.querySelector('#max');
            const minDisplay = inputDiv.querySelector('#min');

            function updateStats() {
                if (data.length === 0) {
                    meanDisplay.textContent = '-';
                    maxDisplay.textContent = '-';
                    minDisplay.textContent = '-';
                    currentData.textContent = '暂无数据';
                    
                    // Show empty state in chart
                    const emptyTrace = {
                        type: 'scatter',
                        x: [],
                        y: [],
                        mode: 'markers',
                        name: '暂无数据'
                    };
                    
                    Plotly.newPlot(chartContainer, [emptyTrace], {
                        title: '数据统计分析',
                        showlegend: false,
                        xaxis: {
                            title: '数据点',
                            zeroline: true
                        },
                        yaxis: {
                            title: '数值',
                            zeroline: true
                        }
                    });
                    return;
                }

                const mean = data.reduce((a, b) => a + b, 0) / data.length;
                const max = Math.max(...data);
                const min = Math.min(...data);

                meanDisplay.textContent = mean.toFixed(2);
                maxDisplay.textContent = max;
                minDisplay.textContent = min;
                currentData.textContent = data.join(', ');

                // Update chart
                const trace1 = {
                    y: data,
                    type: 'box',
                    name: '数据分布',
                    marker: {color: 'rgb(67, 97, 238)'},
                    boxpoints: 'all',
                    jitter: 0.3,
                    pointpos: -1.8
                };

                const trace2 = {
                    x: Array.from({length: data.length}, (_, i) => i + 1),
                    y: data,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: '数据趋势',
                    line: {color: 'rgb(114, 9, 183)'}
                };

                const layout = {
                    title: '数据统计分析',
                    showlegend: true,
                    autosize: true,
                    yaxis: {
                        title: '数值',
                        zeroline: true
                    },
                    xaxis: {
                        title: '数据点',
                        zeroline: true
                    }
                };

                Plotly.newPlot(chartContainer, [trace1, trace2], layout, {
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d']
                });
            }

            addButton.addEventListener('click', () => {
                const value = parseFloat(dataInput.value);
                if (!isNaN(value)) {
                    data.push(value);
                    dataInput.value = '';
                    updateStats();
                }
            });

            clearButton.addEventListener('click', () => {
                data = [];
                updateStats();
            });

            dataInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addButton.click();
                }
            });

            // Initialize empty chart
            updateStats();

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.style.marginTop = '20px';
            explanationDiv.innerHTML = `
                <h4>简单统计图表解析</h4>
                <p><strong>基本统计概念：</strong></p>
                <ul>
                    <li><strong>数据收集与分析：</strong>
                        <ul>
                            <li>输入数据：添加您要分析的数值</li>
                            <li>平均值：所有数据的算术平均</li>
                            <li>最大值和最小值：数据范围</li>
                            <li>数据分布：箱线图显示</li>
                            <li>趋势线：数据变化趋势</li>
                        </ul>
                    </li>
                    <li><strong>图表类型：</strong>
                        <ul>
                            <li>箱线图：显示数据分布</li>
                            <li>折线图：显示数据趋势</li>
                            <li>实时更新：数据变化即时反映</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li>记录并分析每日温度变化</li>
                    <li>统计班级考试成绩</li>
                    <li>跟踪个人运动记录</li>
                    <li>分析消费支出模式</li>
                </ul>
            `;
            visualContainer.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating basic-statistics visualization:', error);
            throw error;
        }
    },

    // Middle School Visualizations
    'linear-functions': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const x = Array.from({length: 100}, (_, i) => (i * 10 / 99) - 5);
            const data = [
                {
                    x: x,
                    y: x.map(x => 2 * x + 1),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = 2x + 1 (k>0)',
                    line: { color: 'rgb(67, 97, 238)' }
                },
                {
                    x: x,
                    y: x.map(x => -1.5 * x + 2),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = -1.5x + 2 (k<0)',
                    line: { color: 'rgb(114, 9, 183)' }
                },
                {
                    x: x,
                    y: x.map(x => x),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = x (k=1, b=0)',
                    line: { color: 'rgb(86, 11, 173)' }
                }
            ];
            
            const layout = {
                title: '一次函数图像比较',
                xaxis: {
                    title: 'x',
                    range: [-5, 5],
                    zeroline: true
                },
                yaxis: {
                    title: 'y',
                    range: [-5, 5],
                    zeroline: true
                },
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>一次函数解析</h4>
                <p><strong>函数形式：</strong> y = kx + b</p>
                <ul>
                    <li><strong>斜率 k 的影响：</strong>
                        <ul>
                            <li>k > 0：函数图像向右上方倾斜，k 越大，倾斜程度越大</li>
                            <li>k < 0：函数图像向右下方倾斜，|k| 越大，倾斜程度越大</li>
                            <li>k = 0：函数图像是水平直线</li>
                        </ul>
                    </li>
                    <li><strong>截距 b 的影响：</strong>
                        <ul>
                            <li>b 决定函数图像与 y 轴的交点坐标 (0, b)</li>
                            <li>b > 0：图像向上平移 b 个单位</li>
                            <li>b < 0：图像向下平移 |b| 个单位</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li><strong>距离-时间关系：</strong> 匀速运动中，距离(s) = 速度(v) × 时间(t) + 初始位置(s₀)</li>
                    <li><strong>温度转换：</strong> 摄氏度(C) = 5/9 × (华氏度(F) - 32)</li>
                    <li><strong>商品定价：</strong> 总价 = 单价 × 数量 + 固定成本</li>
                    <li><strong>手机资费：</strong> 月费 = 通话时长 × 费率 + 月租费</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating linear-functions visualization:', error);
            throw error;
        }
    },

    'quadratic-functions': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const x = Array.from({length: 100}, (_, i) => (i * 10 / 99) - 5);
            const data = [
                {
                    x: x,
                    y: x.map(x => x * x),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = x² (a=1)',
                    line: { color: 'rgb(67, 97, 238)' }
                },
                {
                    x: x,
                    y: x.map(x => -0.5 * x * x + 2),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = -0.5x² + 2 (a<0)',
                    line: { color: 'rgb(114, 9, 183)' }
                },
                {
                    x: x,
                    y: x.map(x => 2 * x * x - 1),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = 2x² - 1 (a>1)',
                    line: { color: 'rgb(86, 11, 173)' }
                }
            ];
            
            const layout = {
                title: '二次函数图像比较',
                xaxis: {
                    title: 'x',
                    range: [-5, 5],
                    zeroline: true
                },
                yaxis: {
                    title: 'y',
                    range: [-5, 10],
                    zeroline: true
                },
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>二次函数解析</h4>
                <p><strong>标准形式：</strong> y = ax² + bx + c</p>
                <ul>
                    <li><strong>系数 a 的影响：</strong>
                        <ul>
                            <li>a > 0：开口向上的抛物线，a 越大，抛物线越窄</li>
                            <li>a < 0：开口向下的抛物线，|a| 越大，抛物线越窄</li>
                            <li>|a| < 1：抛物线变宽</li>
                            <li>|a| > 1：抛物线变窄</li>
                        </ul>
                    </li>
                    <li><strong>系数 b 的影响：</strong>
                        <ul>
                            <li>影响对称轴的位置：x = -b/(2a)</li>
                            <li>影响顶点的横坐标</li>
                        </ul>
                    </li>
                    <li><strong>常数项 c 的影响：</strong>
                        <ul>
                            <li>决定抛物线与y轴的交点(0,c)</li>
                            <li>影响顶点的纵坐标</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li><strong>物体抛射：</strong> 高度 = -4.9t² + v₀t + h₀（重力作用下的运动）</li>
                    <li><strong>聚光灯光束：</strong> 横截面形成的抛物线</li>
                    <li><strong>桥梁设计：</strong> 悬索桥的钢缆形状</li>
                    <li><strong>经济学：</strong> 边际收益或成本函数</li>
                    <li><strong>信号处理：</strong> 声波或电磁波的调制</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating quadratic-functions visualization:', error);
            throw error;
        }
    },

    'geometry-2d': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            // Create multiple geometric shapes
            const shapes = [
                // Rectangle
                {type: 'rect', x0: -2, y0: -2, x1: 0, y1: 0, 
                 line: {color: 'blue'}, fillcolor: 'rgba(67, 97, 238, 0.2)'},
                
                // Circle
                {type: 'circle', x0: 1, y0: -2, x1: 3, y1: 0,
                 line: {color: 'purple'}, fillcolor: 'rgba(114, 9, 183, 0.2)'},
                
                // Triangle
                {type: 'path', path: 'M -1 1 L 1 1 L 0 3 Z',
                 line: {color: 'green'}, fillcolor: 'rgba(86, 11, 173, 0.2)'}
            ];

            const data = [];
            const annotations = [
                {
                    x: -1,
                    y: -2.5,
                    text: '正方形<br>边长=2',
                    showarrow: false,
                    font: { size: 12 }
                },
                {
                    x: 2,
                    y: -2.5,
                    text: '圆<br>半径=1',
                    showarrow: false,
                    font: { size: 12 }
                },
                {
                    x: 0,
                    y: 0.5,
                    text: '三角形<br>底=2, 高=2',
                    showarrow: false,
                    font: { size: 12 }
                }
            ];

            const layout = {
                title: '平面几何图形及其性质',
                xaxis: {
                    title: 'x',
                    range: [-5, 5],
                    zeroline: true
                },
                yaxis: {
                    title: 'y',
                    range: [-5, 5],
                    zeroline: true
                },
                shapes: shapes,
                annotations: annotations,
                showlegend: false,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>平面几何解析</h4>
                <p><strong>基本图形及其性质：</strong></p>
                <ul>
                    <li><strong>正方形：</strong>
                        <ul>
                            <li>四条边相等，四个角都是90°</li>
                            <li>周长 = 4a（a为边长）</li>
                            <li>面积 = a²</li>
                            <li>对角线长 = a√2</li>
                        </ul>
                    </li>
                    <li><strong>圆：</strong>
                        <ul>
                            <li>圆周上的点到圆心距离相等</li>
                            <li>周长 = 2πr（r为半径）</li>
                            <li>面积 = πr²</li>
                            <li>圆周角 = 对应圆心角的一半</li>
                        </ul>
                    </li>
                    <li><strong>三角形：</strong>
                        <ul>
                            <li>内角和 = 180°</li>
                            <li>面积 = (底×高)/2</li>
                            <li>外角 = 其他两个内角之和</li>
                            <li>三边关系：任意两边之和大于第三边</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li><strong>建筑设计：</strong> 房屋布局、结构设计</li>
                    <li><strong>园林规划：</strong> 绿地面积计算</li>
                    <li><strong>工程制图：</strong> 机械零件设计</li>
                    <li><strong>艺术创作：</strong> 图案设计、构图</li>
                    <li><strong>地图测绘：</strong> 土地面积计算</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating geometry visualization:', error);
            throw error;
        }
    },

    'measurement': function(container) {
        const data = [{
            type: 'bar',
            x: ['1厘米', '1分米', '1米'],
            y: [1, 10, 100],
            text: ['1cm', '10cm', '100cm'],
            textposition: 'auto',
            marker: {
                color: ['rgb(67, 97, 238)', 'rgb(114, 9, 183)', 'rgb(86, 11, 173)']
            }
        }];
        const layout = {
            title: '长度单位换算',
            yaxis: {title: '厘米'},
            showlegend: false
        };
        Plotly.newPlot(container, data, layout);
    },

    'basic-statistics': function(container) {
        const data = [{
            type: 'bar',
            x: ['一月', '二月', '三月', '四月', '五月'],
            y: [12, 15, 18, 22, 25],
            marker: {
                color: 'rgb(67, 97, 238)'
            }
        }];
        const layout = {
            title: '简单统计图表',
            xaxis: {title: '月份'},
            yaxis: {title: '温度 (°C)'},
            showlegend: false
        };
        Plotly.newPlot(container, data, layout);
    },

    'algebra-basics': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const x = Array.from({length: 100}, (_, i) => (i * 10 / 99) - 5);
            const data = [
                {
                    x: x,
                    y: x.map(x => x),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = x',
                    line: { color: 'rgb(67, 97, 238)' }
                },
                {
                    x: x,
                    y: x.map(x => x * x),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = x²',
                    line: { color: 'rgb(114, 9, 183)' }
                },
                {
                    x: x,
                    y: x.map(x => Math.abs(x)),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = |x|',
                    line: { color: 'rgb(86, 11, 173)' }
                }
            ];
            
            const layout = {
                title: '基础代数函数',
                xaxis: {
                    title: 'x',
                    range: [-5, 5],
                    zeroline: true
                },
                yaxis: {
                    title: 'y',
                    range: [-5, 5],
                    zeroline: true
                },
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>基础代数函数解析</h4>
                <p><strong>基本函数及其性质：</strong></p>
                <ul>
                    <li><strong>一次函数 (y = x)：</strong>
                        <ul>
                            <li>斜率为1的直线</li>
                            <li>经过原点(0,0)</li>
                            <li>每增加1个单位，y值增加1</li>
                        </ul>
                    </li>
                    <li><strong>二次函数 (y = x²)：</strong>
                        <ul>
                            <li>抛物线形状</li>
                            <li>对称轴是y轴</li>
                            <li>顶点在原点(0,0)</li>
                            <li>随x增大，增长速度加快</li>
                        </ul>
                    </li>
                    <li><strong>绝对值函数 (y = |x|)：</strong>
                        <ul>
                            <li>V形图像</li>
                            <li>对称轴是y轴</li>
                            <li>顶点在原点(0,0)</li>
                            <li>所有y值都非负</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li><strong>一次函数：</strong> 距离-时间关系、商品定价</li>
                    <li><strong>二次函数：</strong> 物体抛射、面积计算</li>
                    <li><strong>绝对值：</strong> 误差分析、距离计算</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating algebra-basics visualization:', error);
            throw error;
        }
    },

    'probability': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            // 创建二项分布数据
            function binomialProbability(n, p, k) {
                let coef = 1;
                for(let i = 0; i < k; i++) coef *= (n-i)/(i+1);
                return coef * Math.pow(p, k) * Math.pow(1-p, n-k);
            }

            const n = 10; // 试验次数
            const probabilities = [0.3, 0.5, 0.7]; // 不同成功概率
            const k = Array.from({length: n+1}, (_, i) => i);

            const data = probabilities.map(p => ({
                x: k,
                y: k.map(k => binomialProbability(n, p, k)),
                type: 'scatter',
                mode: 'lines+markers',
                name: `p = ${p}`,
                line: { shape: 'spline' }
            }));

            const layout = {
                title: '二项分布概率质量函数',
                xaxis: {
                    title: '成功次数 k',
                    tickmode: 'linear',
                    tick0: 0,
                    dtick: 1
                },
                yaxis: {
                    title: '概率 P(X = k)',
                    range: [0, 0.4]
                },
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>概率与统计解析</h4>
                <p><strong>二项分布 B(n,p)：</strong></p>
                <ul>
                    <li><strong>参数说明：</strong>
                        <ul>
                            <li>n：试验次数</li>
                            <li>p：单次试验成功概率</li>
                            <li>k：成功次数</li>
                        </ul>
                    </li>
                    <li><strong>概率质量函数：</strong>
                        <ul>
                            <li>P(X = k) = C(n,k) * p^k * (1-p)^(n-k)</li>
                            <li>期望值：E(X) = np</li>
                            <li>方差：Var(X) = np(1-p)</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li><strong>质量控制：</strong> 产品合格率检测</li>
                    <li><strong>医学研究：</strong> 药物治愈率分析</li>
                    <li><strong>市场调研：</strong> 消费者行为预测</li>
                    <li><strong>教育评估：</strong> 考试及格率分析</li>
                    <li><strong>保险精算：</strong> 风险事件发生概率</li>
                </ul>
                <h4>概率分布特征</h4>
                <ul>
                    <li><strong>对称性：</strong> 当p=0.5时，分布关于np对称</li>
                    <li><strong>偏斜性：</strong> p≠0.5时，分布呈现偏斜</li>
                    <li><strong>峰度：</strong> n越大，曲线越平滑</li>
                    <li><strong>极限性质：</strong> n很大时趋近于正态分布</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating probability visualization:', error);
            throw error;
        }
    },

    'triangles': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const data = [{
                type: 'scatter',
                x: [0, 4, 2, 0],
                y: [0, 0, 3, 0],
                mode: 'lines+markers',
                marker: {size: 10},
                line: {color: 'rgb(67, 97, 238)'},
                name: '三角形',
                fill: 'toself'
            }];
            
            const layout = {
                title: '三角形的性质',
                xaxis: {
                    range: [0, 5],
                    zeroline: true,
                    title: 'x'
                },
                yaxis: {
                    range: [0, 5],
                    zeroline: true,
                    title: 'y'
                },
                showlegend: false,
                annotations: [
                    {x: 2, y: -0.3, text: '底边: 4', showarrow: false},
                    {x: -0.3, y: 1.5, text: '高: 3', textangle: -90, showarrow: false}
                ]
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>三角形性质解析</h4>
                <p><strong>基本性质：</strong></p>
                <ul>
                    <li><strong>角的性质：</strong>
                        <ul>
                            <li>内角和为180°</li>
                            <li>外角等于其他两个内角的和</li>
                            <li>等腰三角形的底角相等</li>
                        </ul>
                    </li>
                    <li><strong>边的性质：</strong>
                        <ul>
                            <li>任意两边之和大于第三边</li>
                            <li>任意两边之差小于第三边</li>
                            <li>等腰三角形两边相等</li>
                        </ul>
                    </li>
                    <li><strong>重要定理：</strong>
                        <ul>
                            <li>勾股定理：a² + b² = c²</li>
                            <li>正弦定理：a/sinA = b/sinB = c/sinC = 2R</li>
                            <li>余弦定理：c² = a² + b² - 2ab·cosC</li>
                        </ul>
                    </li>
                </ul>
                <h4>面积计算公式</h4>
                <ul>
                    <li>S = ah/2（底×高÷2）</li>
                    <li>S = ab·sinC/2（两边×夹角正弦÷2）</li>
                    <li>S = √[p(p-a)(p-b)(p-c)]（海伦公式，p为半周长）</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating triangles visualization:', error);
            throw error;
        }
    },

    // High School Visualizations
    'advanced-functions': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const x = Array.from({length: 100}, (_, i) => (i * 10 / 99) - 5);
            const data = [
                {
                    x: x,
                    y: x.map(x => Math.exp(x)),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = eˣ',
                    line: { color: 'rgb(67, 97, 238)' }
                },
                {
                    x: x,
                    y: x.map(x => Math.log(Math.abs(x) + 0.1)),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'y = ln(x)',
                    line: { color: 'rgb(114, 9, 183)' }
                }
            ];
            
            const layout = {
                title: '高等函数',
                xaxis: {
                    title: 'x',
                    range: [-5, 5],
                    zeroline: true
                },
                yaxis: {
                    title: 'y',
                    range: [-5, 5],
                    zeroline: true
                },
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>高等函数解析</h4>
                <p><strong>指数函数与对数函数：</strong></p>
                <ul>
                    <li><strong>指数函数 (y = eˣ)：</strong>
                        <ul>
                            <li>e ≈ 2.71828...（自然常数）</li>
                            <li>恒正值，单调递增</li>
                            <li>增长速度随x增大而加快</li>
                            <li>在x = 0处，y = 1</li>
                        </ul>
                    </li>
                    <li><strong>对数函数 (y = ln x)：</strong>
                        <ul>
                            <li>是y = eˣ的反函数</li>
                            <li>定义域为x > 0</li>
                            <li>在x = 1处，y = 0</li>
                            <li>增长速度随x增大而减慢</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li><strong>指数函数应用：</strong>
                        <ul>
                            <li>人口增长模型</li>
                            <li>复利计算</li>
                            <li>放射性衰变</li>
                        </ul>
                    </li>
                    <li><strong>对数函数应用：</strong>
                        <ul>
                            <li>地震强度计算</li>
                            <li>声音分贝计算</li>
                            <li>pH值测定</li>
                        </ul>
                    </li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating advanced-functions visualization:', error);
            throw error;
        }
    },

    'trigonometry': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const x = Array.from({length: 100}, (_, i) => i * (2 * Math.PI / 99));
            const data = [
                {
                    x: x,
                    y: x.map(x => Math.sin(x)),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'sin(x)',
                    line: { color: 'rgb(67, 97, 238)' }
                },
                {
                    x: x,
                    y: x.map(x => Math.cos(x)),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'cos(x)',
                    line: { color: 'rgb(114, 9, 183)' }
                },
                {
                    x: x,
                    y: x.map(x => Math.tan(x)),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'tan(x)',
                    line: { color: 'rgb(86, 11, 173)' },
                    visible: 'legendonly'  // Hidden by default
                }
            ];
            
            const layout = {
                title: '三角函数图像比较',
                xaxis: {
                    title: 'x',
                    zeroline: true,
                    ticktext: ['0', 'π/2', 'π', '3π/2', '2π'],
                    tickvals: [0, Math.PI/2, Math.PI, 3*Math.PI/2, 2*Math.PI]
                },
                yaxis: {
                    title: 'y',
                    zeroline: true,
                    range: [-2, 2]
                },
                showlegend: true,
                autosize: true,
                annotations: [
                    {
                        x: Math.PI/2,
                        y: 1,
                        text: 'sin(π/2) = 1',
                        showarrow: true,
                        arrowhead: 2
                    },
                    {
                        x: Math.PI,
                        y: -1,
                        text: 'sin(π) = 0',
                        showarrow: true,
                        arrowhead: 2
                    }
                ]
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>三角函数解析</h4>
                <p><strong>基本三角函数：</strong></p>
                <ul>
                    <li><strong>正弦函数 sin(x)：</strong>
                        <ul>
                            <li>周期：2π</li>
                            <li>值域：[-1, 1]</li>
                            <li>特殊点：sin(0) = 0, sin(π/2) = 1, sin(π) = 0, sin(3π/2) = -1</li>
                        </ul>
                    </li>
                    <li><strong>余弦函数 cos(x)：</strong>
                        <ul>
                            <li>周期：2π</li>
                            <li>值域：[-1, 1]</li>
                            <li>特殊点：cos(0) = 1, cos(π/2) = 0, cos(π) = -1, cos(3π/2) = 0</li>
                        </ul>
                    </li>
                    <li><strong>正切函数 tan(x)：</strong>
                        <ul>
                            <li>周期：π</li>
                            <li>值域：(-∞, +∞)</li>
                            <li>无定义点：x = π/2 + nπ（n为整数）</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li><strong>建筑设计：</strong> 计算斜坡角度、屋顶倾斜度</li>
                    <li><strong>导航系统：</strong> GPS定位、航海导航</li>
                    <li><strong>声波分析：</strong> 音乐合成、声音处理</li>
                    <li><strong>电子工程：</strong> 交流电信号分析</li>
                    <li><strong>天文计算：</strong> 行星运动轨道、日出日落时间</li>
                </ul>
                <h4>重要公式</h4>
                <ul>
                    <li>sin²x + cos²x = 1</li>
                    <li>tan(x) = sin(x)/cos(x)</li>
                    <li>sin(A+B) = sin(A)cos(B) + cos(A)sin(B)</li>
                    <li>cos(A+B) = cos(A)cos(B) - sin(A)sin(B)</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating trigonometry visualization:', error);
            throw error;
        }
    },

    'calculus-basics': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const x = Array.from({length: 100}, (_, i) => i * (4 / 99) - 2);
            const data = [
                {
                    x: x,
                    y: x.map(x => x * x),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'f(x) = x²',
                    line: { color: 'rgb(67, 97, 238)' }
                },
                {
                    x: x,
                    y: x.map(x => 2 * x),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'f\'(x) = 2x',
                    line: { color: 'rgb(114, 9, 183)' }
                },
                {
                    x: x,
                    y: x.map(x => (1/3) * x * x * x),
                    type: 'scatter',
                    mode: 'lines',
                    name: '原函数 F(x) = x³/3',
                    line: { color: 'rgb(86, 11, 173)' }
                }
            ];
            
            const layout = {
                title: '函数、导数与原函数关系',
                xaxis: {
                    title: 'x',
                    zeroline: true
                },
                yaxis: {
                    title: 'y',
                    zeroline: true
                },
                showlegend: true,
                autosize: true,
                annotations: [
                    {
                        x: 1,
                        y: 1,
                        text: 'f(1) = 1',
                        showarrow: true,
                        arrowhead: 2
                    },
                    {
                        x: 1,
                        y: 2,
                        text: 'f\'(1) = 2',
                        showarrow: true,
                        arrowhead: 2
                    }
                ]
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>微积分基础解析</h4>
                <p><strong>核心概念：</strong></p>
                <ul>
                    <li><strong>导数：</strong>
                        <ul>
                            <li>定义：f'(x) = lim[h→0] (f(x+h) - f(x))/h</li>
                            <li>几何意义：函数在某点的切线斜率</li>
                            <li>物理意义：瞬时变化率</li>
                        </ul>
                    </li>
                    <li><strong>积分：</strong>
                        <ul>
                            <li>定积分：∫[a,b] f(x)dx = F(b) - F(a)</li>
                            <li>几何意义：曲线下的面积</li>
                            <li>物理意义：累积量</li>
                        </ul>
                    </li>
                    <li><strong>微积分基本定理：</strong>
                        <ul>
                            <li>导数和积分是互逆运算</li>
                            <li>如果F'(x) = f(x)，则∫f(x)dx = F(x) + C</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li><strong>物理学：</strong>
                        <ul>
                            <li>速度是位移对时间的导数</li>
                            <li>加速度是速度对时间的导数</li>
                            <li>位移是速度对时间的积分</li>
                        </ul>
                    </li>
                    <li><strong>经济学：</strong>
                        <ul>
                            <li>边际成本是总成本的导数</li>
                            <li>总收益是边际收益的积分</li>
                        </ul>
                    </li>
                    <li><strong>工程应用：</strong>
                        <ul>
                            <li>热传导分析</li>
                            <li>流体力学计算</li>
                            <li>电磁场强度分析</li>
                        </ul>
                    </li>
                </ul>
                <h4>常见导数公式</h4>
                <ul>
                    <li>(x^n)' = nx^(n-1)</li>
                    <li>(sin x)' = cos x</li>
                    <li>(e^x)' = e^x</li>
                    <li>(ln x)' = 1/x</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating calculus visualization:', error);
            throw error;
        }
    },

    'vectors': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const data = [
                {
                    type: 'scatter3d',
                    mode: 'lines',
                    x: [0, 2],
                    y: [0, 2],
                    z: [0, 2],
                    line: {color: 'rgb(67, 97, 238)', width: 4},
                    name: '向量 a'
                },
                {
                    type: 'scatter3d',
                    mode: 'lines',
                    x: [0, -1],
                    y: [0, 2],
                    z: [0, 1],
                    line: {color: 'rgb(114, 9, 183)', width: 4},
                    name: '向量 b'
                }
            ];
            
            const layout = {
                title: '三维向量',
                scene: {
                    xaxis: {range: [-2, 5]},
                    yaxis: {range: [-2, 5]},
                    zaxis: {range: [-2, 5]}
                },
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>向量与空间解析</h4>
                <p><strong>基本概念：</strong></p>
                <ul>
                    <li><strong>向量的表示：</strong>
                        <ul>
                            <li>方向：指向某一点的箭头</li>
                            <li>大小：向量的长度</li>
                            <li>坐标表示：(x, y, z)</li>
                        </ul>
                    </li>
                    <li><strong>向量运算：</strong>
                        <ul>
                            <li>加法：平行四边形法则</li>
                            <li>减法：反向相加</li>
                            <li>数乘：改变大小和方向</li>
                            <li>点积：a·b = |a||b|cosθ</li>
                            <li>叉积：|a×b| = |a||b|sinθ</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用例子</h4>
                <ul>
                    <li><strong>物理学：</strong>
                        <ul>
                            <li>力的分解与合成</li>
                            <li>速度和加速度分析</li>
                            <li>电磁场计算</li>
                        </ul>
                    </li>
                    <li><strong>计算机图形学：</strong>
                        <ul>
                            <li>3D建模</li>
                            <li>动画制作</li>
                            <li>游戏物理引擎</li>
                        </ul>
                    </li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating vectors visualization:', error);
            throw error;
        }
    },

    'complex-numbers': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const t = Array.from({length: 100}, (_, i) => i * (2 * Math.PI / 99));
            const data = [
                {
                    type: 'scatter',
                    mode: 'lines',
                    x: t.map(t => Math.cos(t)),
                    y: t.map(t => Math.sin(t)),
                    name: '单位圆',
                    line: { color: 'rgb(67, 97, 238)' }
                },
                {
                    type: 'scatter',
                    mode: 'markers+text',
                    x: [1, -1, 0, 0],
                    y: [0, 0, 1, -1],
                    text: ['1', '-1', 'i', '-i'],
                    textposition: 'top right',
                    marker: {
                        size: 10,
                        color: 'rgb(114, 9, 183)'
                    },
                    name: '特殊点'
                }
            ];
            
            const layout = {
                title: '复平面上的单位圆',
                xaxis: {
                    title: '实部',
                    range: [-2, 2],
                    zeroline: true
                },
                yaxis: {
                    title: '虚部',
                    range: [-2, 2],
                    zeroline: true
                },
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>复数解析</h4>
                <p><strong>基本概念：</strong></p>
                <ul>
                    <li><strong>复数的表示：</strong>
                        <ul>
                            <li>代数形式：z = a + bi</li>
                            <li>三角形式：z = r(cosθ + i·sinθ)</li>
                            <li>指数形式：z = re^(iθ)</li>
                        </ul>
                    </li>
                    <li><strong>重要性质：</strong>
                        <ul>
                            <li>i² = -1</li>
                            <li>模长：|z| = √(a² + b²)</li>
                            <li>辐角：θ = arctan(b/a)</li>
                            <li>共轭复数：z̄ = a - bi</li>
                        </ul>
                    </li>
                </ul>
                <h4>运算规则</h4>
                <ul>
                    <li><strong>加减法：</strong> 实部虚部分别运算</li>
                    <li><strong>乘法：</strong> (a+bi)(c+di) = (ac-bd) + (ad+bc)i</li>
                    <li><strong>除法：</strong> 分子分母同乘共轭复数</li>
                    <li><strong>欧拉公式：</strong> e^(iθ) = cosθ + i·sinθ</li>
                </ul>
                <h4>实际应用</h4>
                <ul>
                    <li>电气工程中的交流电分析</li>
                    <li>量子力学中的波函数</li>
                    <li>信号处理与控制理论</li>
                    <li>分形几何学</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating complex-numbers visualization:', error);
            throw error;
        }
    },

    'probability-advanced': function(container) {
        if (!this.ensureContainer(container)) return;
        try {
            const x = Array.from({length: 100}, (_, i) => (i * 5 / 99));
            const normalDist = x.map(x => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-((x-2.5)*(x-2.5)) / 2));
            const data = [
                {
                    x: x,
                    y: normalDist,
                    type: 'scatter',
                    mode: 'lines',
                    name: '标准正态分布',
                    line: { color: 'rgb(67, 97, 238)' }
                }
            ];
            
            const layout = {
                title: '概率分布',
                xaxis: {
                    title: 'x',
                    range: [0, 5],
                    zeroline: true
                },
                yaxis: {
                    title: '概率密度',
                    range: [0, 0.5],
                    zeroline: true
                },
                showlegend: true,
                autosize: true
            };

            const config = {
                responsive: true,
                displayModeBar: true
            };

            Plotly.newPlot(container, data, layout, config);

            // Add explanation text
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'concept-explanation';
            explanationDiv.innerHTML = `
                <h4>高等概率与统计解析</h4>
                <p><strong>正态分布特征：</strong></p>
                <ul>
                    <li><strong>基本性质：</strong>
                        <ul>
                            <li>钟形曲线，关于均值对称</li>
                            <li>均值、中位数、众数相等</li>
                            <li>68-95-99.7法则</li>
                            <li>标准正态分布：μ=0，σ=1</li>
                        </ul>
                    </li>
                    <li><strong>概率密度函数：</strong>
                        <ul>
                            <li>f(x) = (1/√(2πσ²))e^(-(x-μ)²/2σ²)</li>
                            <li>μ：均值，决定中心位置</li>
                            <li>σ：标准差，决定分布宽度</li>
                        </ul>
                    </li>
                </ul>
                <h4>统计推断</h4>
                <ul>
                    <li><strong>参数估计：</strong>
                        <ul>
                            <li>点估计：样本均值、方差</li>
                            <li>区间估计：置信区间</li>
                        </ul>
                    </li>
                    <li><strong>假设检验：</strong>
                        <ul>
                            <li>显著性水平α</li>
                            <li>p值判断</li>
                            <li>第一类错误与第二类错误</li>
                        </ul>
                    </li>
                </ul>
                <h4>实际应用</h4>
                <ul>
                    <li>质量控制</li>
                    <li>医学研究</li>
                    <li>金融分析</li>
                    <li>社会调查</li>
                    <li>自然科学研究</li>
                </ul>
            `;
            container.parentNode.appendChild(explanationDiv);
        } catch (error) {
            console.error('Error creating probability-advanced visualization:', error);
            throw error;
        }
    }
};

// Initialize visualization section
function initVisualization() {
    const visualizerTopic = document.getElementById('visualizer-topic');
    const loadVisualizationBtn = document.getElementById('load-visualization');
    const visualizationContainer = document.getElementById('visualization-container');

    if (!visualizerTopic || !loadVisualizationBtn || !visualizationContainer) {
        console.error('Visualization elements not found');
        return;
    }

    // Get education level from profile
    function getEducationLevel() {
        const profileDisplay = document.getElementById('profile-display');
        if (!profileDisplay) return 'middle';

        const profileText = profileDisplay.textContent;
        if (profileText.includes('小学')) return 'elementary';
        if (profileText.includes('初中')) return 'middle';
        if (profileText.includes('高中')) return 'high';
        return 'middle'; // Default to middle school
    }

    // Populate concepts based on education level
    function populateConcepts() {
        const level = getEducationLevel();
        const concepts = mathConcepts[level];
        
        if (!concepts) {
            console.error('No concepts found for level:', level);
            return;
        }

        visualizerTopic.innerHTML = Object.entries(concepts)
            .map(([value, label]) => `<option value="${value}">${label}</option>`)
            .join('');
    }

    // Load visualization
    function loadVisualization() {
        const selectedConcept = visualizerTopic.value;
        
        // Show loading state
        visualizationContainer.innerHTML = '<div class="loading-indicator">正在加载可视化...</div>';

        // Create a new container for Plotly with a unique ID
        const plotContainerId = 'plot-container-' + Date.now();
        const plotContainer = document.createElement('div');
        plotContainer.id = plotContainerId;
        plotContainer.style.width = '100%';
        plotContainer.style.height = '400px';

        // Clear previous content and add the new container
        visualizationContainer.innerHTML = '';
        visualizationContainer.appendChild(plotContainer);

        // Ensure Plotly is loaded
        if (typeof Plotly === 'undefined') {
            visualizationContainer.innerHTML = `
                <div class="error-message">
                    <p>Plotly库未加载，请刷新页面后重试。</p>
                </div>
            `;
            return;
        }

        // Wait for the container to be properly added to the DOM
        requestAnimationFrame(() => {
            try {
                const container = document.getElementById(plotContainerId);
                if (!container) {
                    throw new Error('Visualization container not found');
                }

                if (visualizations[selectedConcept]) {
                    visualizations[selectedConcept](container);
                    container.classList.add('visualization-active');
                } else {
                    throw new Error(`没有找到 ${selectedConcept} 的可视化内容`);
                }
            } catch (error) {
                console.error('Visualization error:', error);
                visualizationContainer.innerHTML = `
                    <div class="error-message">
                        <p>加载可视化时出现错误：${error.message}</p>
                        <p>请刷新页面后重试</p>
                    </div>
                `;
            }
        });
    }

    // Event listeners
    loadVisualizationBtn.addEventListener('click', loadVisualization);
    
    // Initialize
    populateConcepts();
    
    // Load first visualization
    if (visualizerTopic.options.length > 0) {
        loadVisualization();
    }

    // Update concepts when profile changes
    const profileDisplay = document.getElementById('profile-display');
    if (profileDisplay) {
        const observer = new MutationObserver(() => {
            populateConcepts();
            if (visualizerTopic.options.length > 0) {
                loadVisualization();
            }
        });
        observer.observe(profileDisplay, { childList: true, characterData: true, subtree: true });
    }

    // Add styles for visualization container
    const style = document.createElement('style');
    style.textContent = `
        .loading-indicator {
            text-align: center;
            padding: 20px;
            color: var(--text-color);
        }
        .error-message {
            text-align: center;
            padding: 20px;
            color: #ff4444;
            background: rgba(255, 68, 68, 0.1);
            border-radius: 8px;
            margin: 10px 0;
        }
        #visualization-content {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin: 10px 0;
            padding: 10px;
        }
    `;
    document.head.appendChild(style);
}

// Add styles for the concept explanations
const style = document.createElement('style');
style.textContent = `
    .concept-explanation {
        margin-top: 20px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .concept-explanation h4 {
        color: var(--primary-color);
        margin-bottom: 15px;
    }
    .concept-explanation ul {
        padding-left: 20px;
    }
    .concept-explanation li {
        margin-bottom: 8px;
    }
    .concept-explanation strong {
        color: var(--primary-color-dark);
    }
`;
document.head.appendChild(style);

function initCommonFormulas() {
    const formulaSection = document.querySelector('.formula-content');
    if (!formulaSection) {
        console.error('Formula content container not found');
        return;
    }

    // Add MathJax configuration if not already present
    if (!window.MathJax) {
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']]
            },
            svg: {
                fontCache: 'global'
            }
        };
    }

    // Formula categories
    const categories = {
        '代数': {
            elementary: [
                { name: '加法交换律', formula: 'a + b = b + a', explanation: '数的加法与顺序无关，例如：3 + 4 = 4 + 3 = 7' },
                { name: '乘法交换律', formula: 'a × b = b × a', explanation: '数的乘法与顺序无关，例如：2 × 3 = 3 × 2 = 6' },
                { name: '乘法分配律', formula: 'a × (b + c) = a × b + a × c', explanation: '数的乘法对加法有分配性质，例如：2 × (3 + 4) = 2 × 3 + 2 × 4 = 14' }
            ],
            middle: [
                { name: '因式分解', formula: 'ax + bx = x(a + b)', explanation: '提取公因式，将代数式化为因式的乘积，例如：2x + 3x = 5x' },
                { name: '十字相乘法', formula: '(ax + b)(cx + d) = acx² + (ad + bc)x + bd', explanation: '用于展开两个一次式的乘积，例如：(2x + 3)(x + 1) = 2x² + 5x + 3' },
                { name: '一元二次方程求根公式', formula: 'x = \\frac{-b \\pm \\sqrt{b² - 4ac}}{2a}', explanation: '用于解二次方程ax² + bx + c = 0，例如：x² + 2x + 1 = 0 的解为 x = -1' },
                { name: '判别式', formula: '\\Delta = b² - 4ac', explanation: '用于判断二次方程的解的情况：Δ>0有两个不同实根，Δ=0有两个相同实根，Δ<0无实根' },
                { name: '韦达定理', formula: 'x₁ + x₂ = -\\frac{b}{a}, x₁x₂ = \\frac{c}{a}', explanation: '二次方程的根与系数的关系，例如：x² + 2x + 1 = 0中，x₁ + x₂ = -2, x₁x₂ = 1' },
                { name: '绝对值不等式', formula: '|x| < a \\Leftrightarrow -a < x < a', explanation: '绝对值小于a等价于x在(-a,a)区间内，例如：|x| < 2表示-2 < x < 2' }
            ],
            high: [
                { name: '向量模长', formula: '|\\vec{a}| = \\sqrt{x² + y² + z²}', explanation: '三维向量的长度。例如：向量(3,4,0)的模长为5' },
                { name: '向量点积', formula: '\\vec{a}·\\vec{b} = |\\vec{a}||\\vec{b}|\\cos θ', explanation: '两向量夹角的余弦与模长的乘积。例如：(1,0)·(0,1) = 0表示垂直' },
                { name: '向量叉积', formula: '\\vec{a}×\\vec{b} = (y₁z₂-z₁y₂, z₁x₂-x₁z₂, x₁y₂-y₁x₂)', explanation: '得到垂直于两向量的新向量。例如：(1,0,0)×(0,1,0)=(0,0,1)' },
                { name: '复数的模', formula: '|a + bi| = \\sqrt{a² + b²}', explanation: '复数在复平面上的距离。例如：|3 + 4i| = 5' },
                { name: '复数共轭', formula: 'z = a + bi, \\bar{z} = a - bi', explanation: '将虚部变号。例如：2+3i的共轭为2-3i' },
                { name: '欧拉公式', formula: 'e^{iθ} = \\cos θ + i\\sin θ', explanation: '连接复数与三角函数。例如：e^{iπ} = -1' }
            ]
        },
        '函数': {
            elementary: [
                { name: '一次函数', formula: 'y = kx + b', explanation: 'k为斜率，表示函数图像的倾斜程度；b为截距，表示函数图像与y轴的交点。例如：y = 2x + 1表示斜率为2，y轴截距为1的直线' }
            ],
            middle: [
                { name: '一次函数', formula: 'y = kx + b', explanation: 'k为斜率，b为y轴截距。当k>0时，函数单调递增；当k<0时，函数单调递减。例如：y = 2x + 1' },
                { name: '二次函数', formula: 'y = ax² + bx + c', explanation: '开口方向由a决定：a>0向上，a<0向下。顶点坐标(-b/2a, -Δ/4a)，对称轴x=-b/2a。例如：y = x² + 2x + 1' },
                { name: '反比例函数', formula: 'y = \\frac{k}{x}', explanation: 'k为比例系数，k>0时在第一、三象限，k<0时在第二、四象限。例如：y = 1/x' }
            ],
            high: [
                { name: '奇函数', formula: 'f(-x) = -f(x)', explanation: '关于原点对称。例如：f(x)=x³是奇函数' },
                { name: '偶函数', formula: 'f(-x) = f(x)', explanation: '关于y轴对称。例如：f(x)=x²是偶函数' },
                { name: '周期函数', formula: 'f(x + T) = f(x)', explanation: 'T为最小正周期。例如：sin(x)的周期为2π' },
                { name: '复合函数', formula: '(f∘g)(x) = f(g(x))', explanation: '函数复合。例如：f(x)=x², g(x)=x+1，则f(g(x))=(x+1)²' }
            ]
        },
        '三角函数': {
            middle: [
                { name: '正弦', formula: 'sin A = \\frac{对边}{斜边}', explanation: '直角三角形中，某一锐角的对边与斜边的比值。例如：30°角的正弦值为0.5，表示对边是斜边的一半' },
                { name: '余弦', formula: 'cos A = \\frac{邻边}{斜边}', explanation: '直角三角形中，某一锐角的邻边与斜边的比值。例如：60°角的余弦值为0.5，表示邻边是斜边的一半' },
                { name: '正切', formula: 'tan A = \\frac{对边}{邻边} = \\frac{sin A}{cos A}', explanation: '直角三角形中，某一锐角的对边与邻边的比值。例如：45°角的正切值为1，表示对边等于邻边' },
                { name: '特殊角值', formula: '\\begin{array}{l} sin30° = \\frac{1}{2}, sin45° = \\frac{\\sqrt{2}}{2}, sin60° = \\frac{\\sqrt{3}}{2} \\\\ cos30° = \\frac{\\sqrt{3}}{2}, cos45° = \\frac{\\sqrt{2}}{2}, cos60° = \\frac{1}{2} \\\\ tan30° = \\frac{1}{\\sqrt{3}}, tan45° = 1, tan60° = \\sqrt{3} \\end{array}', explanation: '常用角度的三角函数值，这些值在解题时经常使用' },
                { name: '解直角三角形步骤', formula: '\\begin{array}{l} 1. \\ 确定已知边角 \\\\ 2. \\ 选择合适的函数关系 \\\\ 3. \\ 列式计算未知量 \\end{array}', explanation: '例如：已知直角三角形斜边c=5，一个锐角A=30°，求对边a。解：a = c × sinA = 5 × 0.5 = 2.5' }
            ],
            high: [
                { name: '同角三角函数关系', formula: '\\sin²θ + \\cos²θ = 1, \\tan θ = \\frac{\\sin θ}{\\cos θ}', explanation: '基本三角恒等式。例如：sin²30° + cos²30° = 1' },
                { name: '和角公式(正弦)', formula: '\\sin(A+B) = \\sin A\\cos B + \\cos A\\sin B', explanation: '两角和的正弦。例如：sin(90°+30°) = sin90°cos30° + cos90°sin30°' },
                { name: '和角公式(余弦)', formula: '\\cos(A+B) = \\cos A\\cos B - \\sin A\\sin B', explanation: '两角和的余弦。例如：cos(60°+30°) = cos60°cos30° - sin60°sin30°' },
                { name: '正弦定理', formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R', explanation: '三角形中，边与对应角正弦的比值相等。例如：在三角形中，若a=3,sinA=0.5,则b=4时sinB=0.667' },
                { name: '余弦定理', formula: 'c² = a² + b² - 2ab\\cos C', explanation: '三角形中，一边平方等于其他两边平方和减去它们与夹角余弦的积的两倍。例如：若a=3,b=4,C=60°，则c=5' }
            ]
        },
        '数列': {
            middle: [
                { name: '等差数列', formula: '\\begin{array}{l} a_n = a_1 + (n-1)d \\\\ d = a_2 - a_1 = a_3 - a_2 = ... \\end{array}', explanation: '相邻两项的差相等的数列。例如：2,5,8,11,...中，首项a₁=2，公差d=3' },
                { name: '等差数列求和', formula: 'S_n = \\frac{n(a_1 + a_n)}{2} = \\frac{n(2a_1 + (n-1)d)}{2}', explanation: '前n项和公式。例如：1,3,5,7,9的和为25' },
                { name: '等比数列', formula: '\\begin{array}{l} a_n = a_1q^{n-1} \\\\ q = \\frac{a_2}{a_1} = \\frac{a_3}{a_2} = ... \\end{array}', explanation: '相邻两项的比值相等的数列。例如：2,6,18,54,...中，首项a₁=2，公比q=3' },
                { name: '等比数列求和', formula: 'S_n = \\frac{a_1(1-q^n)}{1-q} = a_1\\frac{q^n-1}{q-1}', explanation: '前n项和公式。例如：2,6,18,54的和为80' }
            ],
            high: [
                { name: '等差数列求和', formula: 'S_n = \\frac{n(a_1 + a_n)}{2} = \\frac{n(2a_1 + (n-1)d)}{2}', explanation: '首项a₁，公差d，项数n。例如：1,3,5,7,9的和为25' },
                { name: '等比数列求和', formula: 'S_n = \\frac{a_1(1-q^n)}{1-q} = \\frac{a_1(q^n-1)}{q-1}', explanation: '首项a₁，公比q，项数n。例如：2,6,18,54的和为80' },
                { name: '数学归纳法步骤', formula: '1) P(1)成立\\\\2) P(k)→P(k+1)成立', explanation: '证明步骤：1.验证n=1时成立；2.假设n=k时成立，证明n=k+1时也成立。例如：证明1+2+...+n=n(n+1)/2' }
            ]
        },
        '解析几何': {
            middle: [
                { name: '直线的点斜式方程', formula: 'y - y_1 = k(x - x_1)', explanation: '已知直线过点(x₁,y₁)且斜率为k。例如：过点(2,3)且斜率为2的直线方程为y - 3 = 2(x - 2)' },
                { name: '直线的斜截式方程', formula: 'y = kx + b', explanation: 'k为斜率，b为y轴截距。例如：y = 2x + 1表示斜率为2，y轴截距为1的直线' },
                { name: '两点式方程', formula: '\\frac{y - y_1}{y_2 - y_1} = \\frac{x - x_1}{x_2 - x_1}', explanation: '已知直线过两点(x₁,y₁)和(x₂,y₂)。例如：过点(1,2)和(3,6)的直线方程' },
                { name: '两点间距离', formula: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}', explanation: '计算平面上两点之间的距离。例如：(0,0)到(3,4)的距离为5' }
            ],
            high: [
                { name: '两点距离公式', formula: 'd = \\sqrt{(x_2-x_1)² + (y_2-y_1)²}', explanation: '平面上两点间的距离。例如：(0,0)到(3,4)的距离为5' },
                { name: '直线一般式方程', formula: 'Ax + By + C = 0', explanation: '直线的一般形式。例如：2x + 3y + 6 = 0' },
                { name: '直线点斜式方程', formula: 'y - y_1 = k(x - x_1)', explanation: '过点(x₁,y₁)，斜率为k的直线。例如：过(1,2)斜率为3的直线：y-2=3(x-1)' },
                { name: '圆的标准方程', formula: '(x - a)² + (y - b)² = r²', explanation: '圆心(a,b)，半径r的圆。例如：(x-1)²+(y-2)²=4表示圆心(1,2)半径2' },
                { name: '椭圆标准方程', formula: '\\frac{x²}{a²} + \\frac{y²}{b²} = 1', explanation: '长轴2a，短轴2b，焦距2c=2√(a²-b²)。例如：x²/9+y²/4=1' },
                { name: '双曲线标准方程', formula: '\\frac{x²}{a²} - \\frac{y²}{b²} = 1', explanation: '实轴2a，虚轴2b，渐近线y=±(b/a)x。例如：x²/4-y²/9=1' },
                { name: '抛物线标准方程', formula: 'y² = 2px', explanation: '焦点到准线的距离为p/2。例如：y²=4x表示焦点(1,0)' }
            ]
        },
        '微积分': {
            high: [
                { name: '导数定义', formula: 'f\'(x) = \\lim_{h→0}\\frac{f(x+h)-f(x)}{h}', explanation: '函数在某点的瞬时变化率。例如：y=x²在x=2处的导数为4' },
                { name: '乘法求导法则', formula: '(uv)\' = u\'v + uv\'', explanation: '两函数乘积的导数。例如：(x²sinx)\'=2xsinx+x²cosx' },
                { name: '除法求导法则', formula: '(\\frac{u}{v})\' = \\frac{u\'v - uv\'}{v²}', explanation: '两函数商的导数。例如：(x/sinx)\'=(sinx-xcosx)/sin²x' },
                { name: '不定积分', formula: '\\int f(x)dx = F(x) + C', explanation: '原函数。例如：∫xdx=x²/2+C' },
                { name: '定积分', formula: '\\int_a^b f(x)dx = F(b) - F(a)', explanation: '函数在区间上的和的极限。例如：∫₀¹x²dx=1/3' }
            ]
        },
        '统计概率': {
            elementary: [
                { name: '平均数', formula: '\\bar{x} = \\frac{\\sum x_i}{n}', explanation: '所有数据的和除以数据个数。例如：1,2,3,4,5的平均数为3' }
            ],
            middle: [
                { name: '平均数', formula: '\\bar{x} = \\frac{\\sum x_i}{n}', explanation: '总体的算术平均值，反映数据的集中趋势。例如：成绩60,70,80,90,100的平均数为80' },
                { name: '方差', formula: 's² = \\frac{\\sum(x_i - \\bar{x})²}{n}', explanation: '反映数据的离散程度，方差越大，数据分布越分散。例如：数据与平均值的差的平方的平均值' },
                { name: '概率公式', formula: 'P(A) = \\frac{n(A)}{n(S)}', explanation: '事件A发生的可能性大小，等于事件A的基本事件数除以样本空间的基本事件总数。例如：抛骰子出现偶数的概率为3/6=1/2' }
            ],
            high: [
                { name: '排列数', formula: 'A_n^m = \\frac{n!}{(n-m)!}', explanation: 'n个不同元素中取m个排列的方法数。例如：5个人选3个座位的方法数为60' },
                { name: '组合数', formula: 'C_n^m = \\frac{n!}{m!(n-m)!}', explanation: 'n个不同元素中取m个组合的方法数。例如：5个人选3个代表的方法数为10' },
                { name: '二项分布', formula: 'P(X=k) = C_n^k p^k (1-p)^{n-k}', explanation: 'n次独立重复试验中成功k次的概率。例如：抛3次硬币，恰好2次正面的概率为3/8' },
                { name: '正态分布', formula: 'f(x) = \\frac{1}{\\sigma\\sqrt{2π}}e^{-\\frac{(x-μ)²}{2\\sigma²}}', explanation: '均值μ，标准差σ的正态分布密度函数。例如：标准正态分布μ=0,σ=1' }
            ]
        },
        '其他': {
            elementary: [
                { name: '速度时间路程', formula: 'v = \\frac{s}{t}, s = vt, t = \\frac{s}{v}', explanation: '速度等于路程除以时间，路程等于速度乘以时间。例如：速度60千米/小时，行驶2小时的路程为120千米' },
                { name: '单价数量总价', formula: '总价 = 单价 × 数量', explanation: '商品的总价等于单价乘以数量。例如：单价5元的铅笔买3支，总价为15元' }
            ],
            middle: [
                { name: '指数运算', formula: 'a^m × a^n = a^{m+n}, \\frac{a^m}{a^n} = a^{m-n}, (a^m)^n = a^{mn}', explanation: '同底数幂的乘除法则和幂的幂运算。例如：2³ × 2⁴ = 2⁷' },
                { name: '对数运算', formula: 'log_a(MN) = log_aM + log_aN, log_a\\frac{M}{N} = log_aM - log_aN', explanation: '对数的乘除法则。例如：log₂8 = log₂(2³) = 3' }
            ],
            high: [
                { name: '导数定义', formula: 'f\'(x) = \\lim_{h→0}\\frac{f(x+h)-f(x)}{h}', explanation: '函数在某点的瞬时变化率' },
                { name: '积分定义', formula: '\\int_a^b f(x)dx = \\lim_{n→∞}\\sum_{i=1}^n f(x_i)\\Delta x', explanation: '函数在区间上的和的极限' }
            ]
        }
    };

    // Create category buttons with container
    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'formula-section';
    categoryContainer.innerHTML = `
        <style>
            .formula-section {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .formula-categories {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            .category-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 20px;
                background: var(--primary-color);
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
            }
            .category-btn:hover {
                background: var(--primary-color-dark);
                color: white;
            }
            .category-btn.active {
                background: white;
                color: var(--primary-color);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                border: 2px solid var(--primary-color);
            }
            .formula-display {
                margin-top: 20px;
            }
            .formula-card {
                background: white;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                border: 1px solid #eee;
            }
            .formula-card:hover {
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                transform: translateY(-2px);
            }
            .formula-name {
                font-weight: bold;
                color: var(--primary-color);
                margin-bottom: 8px;
                font-size: 1.1em;
            }
            .formula-latex {
                font-family: 'KaTeX_Math', serif;
                font-size: 1.1em;
                margin: 10px 0;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
                text-align: center;
            }
            .formula-explanation {
                color: #666;
                font-size: 0.9em;
                margin-top: 8px;
                line-height: 1.5;
            }
        </style>
        <div class="formula-categories"></div>
        <div class="formula-display"></div>
    `;
    formulaSection.appendChild(categoryContainer);

    const categoryButtons = categoryContainer.querySelector('.formula-categories');
    const formulaDisplay = categoryContainer.querySelector('.formula-display');

    Object.keys(categories).forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        btn.onclick = () => showFormulas(category);
        categoryButtons.appendChild(btn);
    });

    function getEducationLevel() {
        const profileText = document.getElementById('profile-display').textContent;
        if (profileText.includes('小学')) return 'elementary';
        if (profileText.includes('初中')) return 'middle';
        if (profileText.includes('高中')) return 'high';
        return 'middle'; // Default to middle school
    }

    function showFormulas(category) {
        // Update active button
        const buttons = categoryButtons.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.textContent === category);
        });

        const level = getEducationLevel();
        const formulas = categories[category][level];

        formulaDisplay.innerHTML = '';
        formulas.forEach(formula => {
            const card = document.createElement('div');
            card.className = 'formula-card';
            card.innerHTML = `
                <div class="formula-name">${formula.name}</div>
                <div class="formula-latex">$${formula.formula}$</div>
                <div class="formula-explanation">${formula.explanation}</div>
            `;
            formulaDisplay.appendChild(card);
        });

        // Render LaTeX formulas
        if (window.MathJax) {
            MathJax.typesetPromise([formulaDisplay]).catch(err => {
                console.error('MathJax rendering error:', err);
            });
        }
    }

    // Show initial category
    showFormulas('代数');

    // Listen for profile changes
    const profileDisplay = document.getElementById('profile-display');
    if (profileDisplay) {
        const observer = new MutationObserver(() => {
            const currentActive = categoryButtons.querySelector('.category-btn.active');
            if (currentActive) {
                showFormulas(currentActive.textContent);
            }
        });
        observer.observe(profileDisplay, { childList: true, characterData: true, subtree: true });
    }
}

// Add to initialization
function initMathPage() {
    initTopicCards();
    initMathAssistant();
    initQuizGenerator();
    initFormulaSelector();
    initCommonFormulas();
    
    // Initialize visualization with a small delay to ensure proper setup
    setTimeout(() => {
        initVisualization();
    }, 100);
}