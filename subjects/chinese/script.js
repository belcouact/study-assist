document.addEventListener('DOMContentLoaded', () => {
    initQuizGenerator();
    initChineseChat();
});

function initQuizGenerator() {
    const generateBtn = document.getElementById('generate-quiz');
    const quizContainer = document.getElementById('quiz-container');
    
    if (generateBtn && quizContainer) {
        generateBtn.addEventListener('click', async () => {
            // Get quiz options
            const topic = document.getElementById('quiz-topic').value;
            let difficulty = document.getElementById('quiz-difficulty').value;
            const count = parseInt(document.getElementById('quiz-questions').value);
            
            // Get education level from profile display
            const profileDisplay = document.getElementById('profile-display');
            let educationLevel = 'middle-school'; // default
            let grade = '';
            let semester = '';
            
            if (profileDisplay) {
                const levelText = profileDisplay.textContent.toLowerCase();
                const profile = levelText.split(" | "); // Split by " | "

                if (levelText.includes('小学')) {
                    educationLevel = 'elementary-school';
                    // Extract grade from the text, e.g., "小学三年级"
                    // const gradeMatch = levelText.match(/小学(\d+)年级/);
                    const gradeMatch = profile[1]; // Get the second part
                    if (gradeMatch) {
                        grade = gradeMatch[1];
                    }
                } else if (levelText.includes('初中')) {
                    educationLevel = 'middle-school';
                    // Extract grade from the text, e.g., "初中二年级"
                    // const gradeMatch = levelText.match(/初中(\d+)年级/);
                    const gradeMatch = profile[1]; // Get the second part
                    if (gradeMatch) {
                        grade = gradeMatch[1];
                    }
                } else if (levelText.includes('高中')) {
                    educationLevel = 'high-school';
                    // Extract grade from the text, e.g., "高中一年级"
                    // const gradeMatch = levelText.match(/高中(\d+)年级/);
                    const gradeMatch = profile[1]; // Get the second part
                    if (gradeMatch) {
                        grade = gradeMatch[1];
                    }
                }
                
                // Extract semester from the text, e.g., "上学期" or "下学期"
                if (levelText.includes('上学期')) {
                    semester = '上学期';
                } else if (levelText.includes('下学期')) {
                    semester = '下学期';
                }
            }
            
            // Adjust quiz content based on education level, grade, and semester
            let levelSpecificPrompt = '';
            switch(educationLevel) {
                case 'elementary-school':
                    levelSpecificPrompt = `题目应简单易懂，使用基础词汇和清晰答案。解释要简单明了，使用具体例子。难度自动调整为简单。
                    针对小学${grade}年级${semester}的教学内容，包括：
                    - 基础汉字书写和认读
                    - 简单的阅读理解
                    - 基础语法知识
                    - 常用词语和成语`;
                    difficulty = 'easy';
                    break;
                case 'middle-school':
                    levelSpecificPrompt = `题目可以包含基础到中等难度内容，使用适当的学术词汇，需要一些推理。解释要详细但不复杂。
                    针对初中${grade}年级${semester}的教学内容，包括：
                    - 较复杂的汉字和词语
                    - 中等难度的阅读理解
                    - 语法规则和运用
                    - 成语和典故
                    - 简单的文学赏析`;
                    if (difficulty === 'hard') difficulty = 'medium';
                    break;
                case 'high-school':
                    levelSpecificPrompt = `题目可以包含复杂内容，使用高级词汇和批判性思维。解释要全面专业。
                    针对高中${grade}年级${semester}的教学内容，包括：
                    - 高级词汇和成语
                    - 复杂的阅读理解
                    - 语法和修辞
                    - 文学分析和鉴赏
                    - 写作技巧和表达`;
                    break;
            }
            
            // Convert topic to Chinese name
            const topicName = getTopicName(topic);
            const difficultyName = getDifficultyName(difficulty);
            const levelName = getEducationLevelName(educationLevel);
            
            // Build system message
            const systemMessage = `你是一个专业的语文教育助手，现在需要为${levelName}${grade}年级${semester}学生生成一个关于${topicName}的${difficultyName}难度测验，包含${count}道选择题。
            每个问题应包含问题描述和4个选项（A、B、C、D），并标明正确答案。
            考虑学生的教育水平、年级和学期，确保题目难度适中且符合教学大纲。
            ${levelSpecificPrompt}
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
                  "explanation": "详细解释，包括：1. 为什么这个选项是正确的；2. 为什么其他选项是错误的；3. 相关的知识点说明"
                }
              ]
            }`;
            
            console.log(systemMessage)
            // Show loading state
            quizContainer.innerHTML = '<div class="text-center"><p>正在生成测验中...</p></div>';
            
            try {
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
                                "content": `请生成一个关于${topicName}的${difficultyName}难度测验，包含${count}道选择题，适合${levelName}${grade}年级${semester}学生的水平。每个问题需要4个选项，并标明正确答案。`
                            }
                        ]
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
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
                } catch (error) {
                    console.error('解析AI响应时出错:', error);
                    quizContainer.innerHTML = `
                        <div class="text-center text-error">
                            <p>抱歉，生成测验时出现错误。请再试一次。</p>
                            <p class="small">${error.message}</p>
                            <button class="btn btn-outline mt-md" onclick="initQuizGenerator()">重试</button>
                        </div>
                    `;
                    return;
                }
                
                // Render quiz
                renderQuiz(quiz);
            } catch (error) {
                console.error('生成测验时出错:', error);
                quizContainer.innerHTML = `
                    <div class="text-center text-error">
                        <p>抱歉，生成测验时出现错误。请再试一次。</p>
                        <p class="small">${error.message}</p>
                        <button class="btn btn-outline mt-md" onclick="initQuizGenerator()">重试</button>
                    </div>
                `;
            }
        });
    }
}

function renderQuiz(quiz) {
    const quizContainer = document.getElementById('quiz-container');
    let currentQuestionIndex = 0;
    const userAnswers = [];
    
    function updateQuestion() {
        const question = quiz.questions[currentQuestionIndex];
        const progress = `${currentQuestionIndex + 1}/${quiz.questions.length}`;
        
        let optionsHTML = '';
        question.options.forEach(option => {
            optionsHTML += `
                <div class="quiz-option" data-option="${option.id}">
                    <input type="radio" name="answer" id="option-${option.id}" value="${option.id}">
                    <label for="option-${option.id}">${option.text}</label>
                </div>
            `;
        });
        
        quizContainer.innerHTML = `
            <div class="quiz-header">
                <h3>${quiz.title}</h3>
                <div class="quiz-progress">第 ${progress} 题</div>
            </div>
            <div class="quiz-question">
                <p>${question.question}</p>
                <div class="quiz-options">
                    ${optionsHTML}
                </div>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-outline" id="prev-question" ${currentQuestionIndex === 0 ? 'disabled' : ''}>上一题</button>
                <button class="btn btn-primary" id="confirm-answer" disabled>确认答案</button>
                <button class="btn btn-primary" id="next-question" ${currentQuestionIndex === quiz.questions.length - 1 ? 'disabled' : ''}>下一题</button>
            </div>
            <div class="quiz-feedback" style="display: none;"></div>
        `;
        
        // Add event listeners
        setupQuizEvents();
    }
    
    function setupQuizEvents() {
        const options = quizContainer.querySelectorAll('.quiz-option');
        const confirmBtn = document.getElementById('confirm-answer');
        const nextBtn = document.getElementById('next-question');
        const prevBtn = document.getElementById('prev-question');
        const feedbackDiv = document.querySelector('.quiz-feedback');
        
        // Option selection
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                confirmBtn.disabled = false;
            });
        });
        
        // Confirm answer
        confirmBtn.addEventListener('click', () => {
            const selectedOption = quizContainer.querySelector('.quiz-option.selected');
            if (!selectedOption) return;
            
            const question = quiz.questions[currentQuestionIndex];
            const isCorrect = selectedOption.dataset.option === question.correctAnswer;
            
            // Record answer
            userAnswers[currentQuestionIndex] = {
                questionId: question.id,
                selectedOption: selectedOption.dataset.option,
                isCorrect: isCorrect
            };
            
            // Show feedback
            feedbackDiv.style.display = 'block';
            feedbackDiv.innerHTML = `
                <div class="feedback-content ${isCorrect ? 'correct' : 'incorrect'}">
                    <h4>${isCorrect ? '回答正确！' : '回答错误'}</h4>
                    <p>${question.explanation}</p>
                </div>
            `;
            
            // Disable options and confirm button
            options.forEach(opt => {
                opt.classList.add('disabled');
                if (opt.dataset.option === question.correctAnswer) {
                    opt.classList.add('correct');
                } else if (opt.dataset.option === selectedOption.dataset.option && !isCorrect) {
                    opt.classList.add('incorrect');
                }
            });
            confirmBtn.disabled = true;
            
            // Enable next button if not last question
            if (currentQuestionIndex < quiz.questions.length - 1) {
                nextBtn.disabled = false;
            } else {
                // Show results
                showResults();
            }
        });
        
        // Next question
        nextBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            updateQuestion();
        });
        
        // Previous question
        prevBtn.addEventListener('click', () => {
            currentQuestionIndex--;
            updateQuestion();
        });
    }
    
    function showResults() {
        const correctCount = userAnswers.filter(answer => answer.isCorrect).length;
        const totalQuestions = quiz.questions.length;
        const percentage = Math.round((correctCount / totalQuestions) * 100);
        let grade = '';
        
        if (percentage >= 90) grade = 'A';
        else if (percentage >= 80) grade = 'B';
        else if (percentage >= 70) grade = 'C';
        else if (percentage >= 60) grade = 'D';
        else grade = 'F';
        
        quizContainer.innerHTML = `
            <div class="quiz-results">
                <h3>测验完成！</h3>
                <div class="result-summary">
                    <div class="score">得分: ${correctCount}/${totalQuestions} (${percentage}%)</div>
                    <div class="grade">等级: ${grade}</div>
                </div>
                <div class="result-message">
                    ${percentage >= 80 ? '太棒了！你的语文水平很好！' : 
                      percentage >= 60 ? '不错！继续努力！' : 
                      '别灰心，多加练习会更好！'}
                </div>
                <button class="btn btn-primary" id="learning-assessment">学习评估</button>
                <button class="btn btn-outline" onclick="initQuizGenerator()">再试一次</button>
            </div>
        `;
        
        // Add learning assessment functionality
        document.getElementById('learning-assessment').addEventListener('click', async () => {
            const assessmentContainer = document.createElement('div');
            assessmentContainer.className = 'learning-assessment';
            assessmentContainer.innerHTML = '<p>正在生成学习评估...</p>';
            quizContainer.appendChild(assessmentContainer);
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                "role": "system",
                                "content": `你是一个专业的语文教育专家，需要根据学生的测验结果提供学习评估和建议。
                                测验结果：${correctCount}/${totalQuestions} 正确，等级 ${grade}。
                                请提供：
                                1. 知识掌握情况分析
                                2. 薄弱环节识别
                                3. 个性化学习建议
                                4. 推荐的学习资源和方法`
                            },
                            {
                                "role": "user",
                                "content": "请根据以上测验结果提供详细的学习评估和建议。"
                            }
                        ]
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                const assessment = data.choices[0].message.content;
                
                assessmentContainer.innerHTML = `
                    <h4>学习评估</h4>
                    <div class="assessment-content">
                        ${assessment}
                    </div>
                `;
            } catch (error) {
                console.error('生成学习评估时出错:', error);
                assessmentContainer.innerHTML = `
                    <div class="text-error">
                        <p>抱歉，生成学习评估时出现错误。</p>
                        <p class="small">${error.message}</p>
                    </div>
                `;
            }
        });
    }
    
    // Start with first question
    updateQuestion();
}

function getEducationLevelName(level) {
    switch(level) {
        case 'elementary-school': return '小学生';
        case 'middle-school': return '初中生';
        case 'high-school': return '高中生';
        default: return '初中生';
    }
}

function getTopicName(topic) {
    switch(topic) {
        case 'characters': return '汉字';
        case 'reading': return '阅读理解';
        case 'grammar': return '语法';
        case 'idioms': return '成语';
        case 'literature': return '文学知识';
        case 'comprehensive': return '综合';
        default: return '综合';
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

function initChineseChat() {
    const sendButton = document.getElementById('send-chinese-question');
    const questionInput = document.getElementById('chinese-question-input');
    const chatMessages = document.getElementById('chinese-chat-messages');
    
    if (!sendButton || !questionInput || !chatMessages) return;
    
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的语文教学助手，擅长解答关于汉字、语法、阅读、写作和文学等方面的问题。你会根据用户的教育水平提供适当的解释和指导。"
        }
    ];
    
    function updateSystemPrompt() {
        const profileDisplay = document.getElementById('profile-display');
        let educationLevel = 'middle-school';
        if (profileDisplay) {
            const levelText = profileDisplay.textContent.toLowerCase();
            if (levelText.includes('小学')) {
                educationLevel = 'elementary-school';
            } else if (levelText.includes('初中')) {
                educationLevel = 'middle-school';
            } else if (levelText.includes('高中')) {
                educationLevel = 'high-school';
            }
        }
        
        let levelSpecificPrompt = '';
        switch(educationLevel) {
            case 'elementary-school':
                levelSpecificPrompt = '用户是小学生，请使用简单易懂的语言，避免复杂术语，多使用具体例子和形象比喻。';
                break;
            case 'middle-school':
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的语文知识，使用适当的学术词汇，平衡简洁性和教育性。';
                break;
            case 'high-school':
                levelSpecificPrompt = '用户是高中生，可以讨论更复杂的语文概念，包括文学分析、写作技巧等，使用更专业的术语和深入的讲解。';
                break;
        }
        
        chatHistory[0].content = `你是一个专业的语文教学助手，擅长解答关于汉字、语法、阅读、写作和文学等方面的问题。${levelSpecificPrompt} 你会根据用户的教育水平提供适当的解释和指导。`;
    }
    
    function displayMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role}`;
        messageDiv.innerHTML = `<p>${content}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    async function sendMessage() {
        const question = questionInput.value.trim();
        if (!question) return;
        
        // Display user message
        displayMessage('user', question);
        questionInput.value = '';
        
        // Update system prompt based on current education level
        updateSystemPrompt();
        
        // Add user message to chat history
        chatHistory.push({
            "role": "user",
            "content": question
        });
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message message-ai loading';
        loadingDiv.innerHTML = '<p>思考中...</p>';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
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
            
            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);
            
            // Display AI response
            displayMessage('ai', aiResponse);
            
            // Add AI response to chat history
            chatHistory.push({
                "role": "assistant",
                "content": aiResponse
            });
        } catch (error) {
            console.error('发送消息时出错:', error);
            
            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);
            
            // Display error message
            displayMessage('ai', `抱歉，我遇到了问题。请稍后再试。错误信息: ${error.message}`);
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Initial system prompt update
    updateSystemPrompt();
}; 