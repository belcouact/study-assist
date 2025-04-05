/**
 * 数学测验脚本
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化测验
    initQuiz();
    
    // 初始化MathJax
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().catch(function(err) {
            console.error('MathJax渲染错误:', err);
        });
    }
});

// 测验数据
const quizData = {
    algebra: {
        easy: [
            {
                question: "计算以下表达式的值：\\(3x + 4 = 10\\)",
                options: [
                    { id: "A", text: "$x = 1$" },
                    { id: "B", text: "$x = 2$" },
                    { id: "C", text: "$x = 3$" },
                    { id: "D", text: "$x = 4$" }
                ],
                answer: "B",
                explanation: "解答：$3x + 4 = 10$ → $3x = 10 - 4$ → $3x = 6$ → $x = 2$"
            },
            {
                question: "计算：\\(2 + 3 \\times 4\\)",
                options: [
                    { id: "A", text: "$14$" },
                    { id: "B", text: "$20$" },
                    { id: "C", text: "$14$" },
                    { id: "D", text: "$24$" }
                ],
                answer: "A",
                explanation: "根据运算顺序，先进行乘法再进行加法：$2 + 3 \\times 4 = 2 + 12 = 14$"
            },
            {
                question: "如果 \\(a = 3\\) 和 \\(b = 4\\)，计算 \\(a^2 + b^2\\)",
                options: [
                    { id: "A", text: "$7$" },
                    { id: "B", text: "$12$" },
                    { id: "C", text: "$25$" },
                    { id: "D", text: "$49$" }
                ],
                answer: "C",
                explanation: "$a^2 + b^2 = 3^2 + 4^2 = 9 + 16 = 25$"
            },
            {
                question: "求解方程 \\(x^2 = 9\\)",
                options: [
                    { id: "A", text: "$x = 9$" },
                    { id: "B", text: "$x = \\pm 3$" },
                    { id: "C", text: "$x = 3$" },
                    { id: "D", text: "$x = \\pm 4.5$" }
                ],
                answer: "B",
                explanation: "$x^2 = 9$ → $x = \\pm\\sqrt{9}$ → $x = \\pm 3$"
            },
            {
                question: "化简表达式：\\(2(x+3) - 3(x-1)\\)",
                options: [
                    { id: "A", text: "$-x + 9$" },
                    { id: "B", text: "$-x + 3$" },
                    { id: "C", text: "$-x + 6$" },
                    { id: "D", text: "$-x + 8$" }
                ],
                answer: "A",
                explanation: "$2(x+3) - 3(x-1) = 2x + 6 - 3x + 3 = -x + 9$"
            }
        ],
        medium: [
            {
                question: "如果 \\(f(x) = x^2 - 3x + 2\\)，求 \\(f(4)\\) 的值",
                options: [
                    { id: "A", text: "$6$" },
                    { id: "B", text: "$10$" },
                    { id: "C", text: "$14$" },
                    { id: "D", text: "$18$" }
                ],
                answer: "A",
                explanation: "$f(4) = 4^2 - 3 \\times 4 + 2 = 16 - 12 + 2 = 6$"
            }
        ],
        hard: [
            {
                question: "求二次函数 \\(f(x) = x^2 - 4x + 3\\) 的最小值",
                options: [
                    { id: "A", text: "$-1$" },
                    { id: "B", text: "$0$" },
                    { id: "C", text: "$1$" },
                    { id: "D", text: "$3$" }
                ],
                answer: "A",
                explanation: "使用配方法：$f(x) = x^2 - 4x + 3 = (x - 2)^2 - 4 + 3 = (x - 2)^2 - 1$。当 $x = 2$ 时，函数取最小值 $-1$。"
            }
        ]
    },
    geometry: {
        easy: [
            {
                question: "计算圆的面积，半径为 \\(r = 5\\)",
                options: [
                    { id: "A", text: "$25\\pi$" },
                    { id: "B", text: "$5\\pi$" },
                    { id: "C", text: "$10\\pi$" },
                    { id: "D", text: "$15\\pi$" }
                ],
                answer: "A",
                explanation: "圆的面积公式：$A = \\pi r^2 = \\pi \\times 5^2 = 25\\pi$"
            }
        ]
    },
    calculus: {
        easy: [
            {
                question: "求函数 \\(f(x) = x^2\\) 在点 \\(x = 3\\) 处的导数",
                options: [
                    { id: "A", text: "$3$" },
                    { id: "B", text: "$6$" },
                    { id: "C", text: "$9$" },
                    { id: "D", text: "$1$" }
                ],
                answer: "B",
                explanation: "$f'(x) = 2x$，所以 $f'(3) = 2 \\times 3 = 6$"
            }
        ]
    }
};

// 当前测验状态
let currentQuiz = {
    topic: 'algebra',
    difficulty: 'easy',
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    userAnswers: []
};

/**
 * 初始化测验
 */
function initQuiz() {
    // 设置难度按钮事件
    const difficultyButtons = document.querySelectorAll('.quiz-difficulty button');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            // 为当前按钮添加active类
            this.classList.add('active');
            // 更新难度
            currentQuiz.difficulty = this.getAttribute('data-difficulty');
            // 加载新测验
            loadQuiz();
        });
    });
    
    // 设置主题选择事件
    const topicSelect = document.getElementById('quiz-topic-select');
    topicSelect.addEventListener('change', function() {
        currentQuiz.topic = this.value;
        loadQuiz();
    });
    
    // 设置检查答案按钮事件
    const checkAnswerBtn = document.getElementById('check-answer');
    checkAnswerBtn.addEventListener('click', checkAnswer);
    
    // 设置下一题按钮事件
    const nextQuestionBtn = document.getElementById('next-question');
    nextQuestionBtn.addEventListener('click', nextQuestion);
    
    // 设置重新测验按钮事件
    const retryQuizBtn = document.getElementById('retry-quiz');
    retryQuizBtn.addEventListener('click', loadQuiz);
    
    // 设置选项选择事件
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('option') || e.target.closest('.option')) {
            const option = e.target.classList.contains('option') ? e.target : e.target.closest('.option');
            const radio = option.querySelector('input[type="radio"]');
            
            // 选中单选按钮
            radio.checked = true;
            
            // 移除所有选项的选中状态
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // 为当前选项添加选中状态
            option.classList.add('selected');
        }
    });
    
    // 加载初始测验
    loadQuiz();
}

/**
 * 加载测验
 */
function loadQuiz() {
    // 重置测验状态
    currentQuiz.currentQuestionIndex = 0;
    currentQuiz.score = 0;
    currentQuiz.userAnswers = [];
    
    // 从测验数据中获取问题
    let questions = quizData[currentQuiz.topic][currentQuiz.difficulty];
    
    // 如果问题不足5个，从中等难度或简单难度中添加
    if (questions.length < 5) {
        let additionalQuestions = [];
        if (currentQuiz.difficulty === 'hard') {
            additionalQuestions = quizData[currentQuiz.topic]['medium'] || [];
        }
        if (additionalQuestions.length < 5 - questions.length) {
            additionalQuestions = additionalQuestions.concat(quizData[currentQuiz.topic]['easy'] || []);
        }
        
        // 随机选择额外问题
        additionalQuestions = shuffleArray(additionalQuestions).slice(0, 5 - questions.length);
        questions = questions.concat(additionalQuestions);
    }
    
    // 限制问题数量为5个
    if (questions.length > 5) {
        questions = shuffleArray(questions).slice(0, 5);
    }
    
    currentQuiz.questions = questions;
    
    // 更新总问题数
    document.getElementById('total-questions').textContent = currentQuiz.questions.length;
    document.getElementById('total-score').textContent = currentQuiz.questions.length;
    
    // 隐藏结果区域，显示问题区域
    document.getElementById('quiz-results').style.display = 'none';
    document.getElementById('quiz-card').style.display = 'block';
    
    // 显示第一个问题
    showQuestion(0);
}

/**
 * 显示指定索引的问题
 * @param {number} index - 问题索引
 */
function showQuestion(index) {
    // 检查索引是否有效
    if (index < 0 || index >= currentQuiz.questions.length) return;
    
    const question = currentQuiz.questions[index];
    
    // 更新当前问题索引
    currentQuiz.currentQuestionIndex = index;
    
    // 更新问题计数
    document.getElementById('current-question').textContent = index + 1;
    
    // 更新进度条
    const progressPercentage = (index / currentQuiz.questions.length) * 100;
    document.getElementById('quiz-progress-bar').style.width = progressPercentage + '%';
    
    // 更新问题文本
    document.getElementById('quiz-question').innerHTML = `<h4>${question.question}</h4>`;
    
    // 更新选项
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, i) => {
        const optionElem = document.createElement('div');
        optionElem.className = 'option';
        optionElem.innerHTML = `
            <input type="radio" name="answer" id="option-${option.id.toLowerCase()}" value="${option.id}">
            <label for="option-${option.id.toLowerCase()}">${option.id}. ${option.text}</label>
        `;
        optionsContainer.appendChild(optionElem);
    });
    
    // 隐藏反馈
    document.getElementById('quiz-feedback').style.display = 'none';
    
    // 显示检查答案按钮，隐藏下一题按钮
    document.getElementById('check-answer').style.display = 'block';
    document.getElementById('next-question').style.display = 'none';
    
    // 渲染数学公式
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().catch(function(err) {
            console.error('MathJax渲染错误:', err);
        });
    }
}

/**
 * 检查答案
 */
function checkAnswer() {
    // 获取用户选择的答案
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    
    // 如果没有选择答案，则返回
    if (!selectedOption) {
        showNotification('请选择一个答案', 'warning');
        return;
    }
    
    const userAnswer = selectedOption.value;
    const question = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    const isCorrect = userAnswer === question.answer;
    
    // 保存用户答案
    currentQuiz.userAnswers[currentQuiz.currentQuestionIndex] = {
        userAnswer,
        isCorrect
    };
    
    // 如果答案正确，增加分数
    if (isCorrect) {
        currentQuiz.score++;
    }
    
    // 显示反馈
    const feedbackElement = document.getElementById('quiz-feedback');
    
    if (isCorrect) {
        feedbackElement.innerHTML = `
            <div class="alert alert-success">
                <h5>正确！</h5>
                <p>${question.explanation}</p>
            </div>
        `;
    } else {
        feedbackElement.innerHTML = `
            <div class="alert alert-danger">
                <h5>不正确！</h5>
                <p>正确答案是：${question.answer}</p>
                <p>${question.explanation}</p>
            </div>
        `;
    }
    
    feedbackElement.style.display = 'block';
    
    // 标记选项为正确或错误
    document.querySelectorAll('.option').forEach(option => {
        const optionValue = option.querySelector('input').value;
        if (optionValue === question.answer) {
            option.classList.add('correct');
        } else if (optionValue === userAnswer && userAnswer !== question.answer) {
            option.classList.add('incorrect');
        }
    });
    
    // 隐藏检查答案按钮，显示下一题或完成按钮
    document.getElementById('check-answer').style.display = 'none';
    document.getElementById('next-question').style.display = 'block';
    
    // 如果是最后一个问题，将下一题按钮文本更改为"查看结果"
    if (currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1) {
        document.getElementById('next-question').textContent = '查看结果';
    }
    
    // 渲染数学公式
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().catch(function(err) {
            console.error('MathJax渲染错误:', err);
        });
    }
}

/**
 * 下一题
 */
function nextQuestion() {
    // 如果是最后一个问题，显示结果
    if (currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1) {
        showResults();
        return;
    }
    
    // 显示下一个问题
    showQuestion(currentQuiz.currentQuestionIndex + 1);
}

/**
 * 显示测验结果
 */
function showResults() {
    // 隐藏问题区域，显示结果区域
    document.getElementById('quiz-card').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'block';
    
    // 更新分数
    document.getElementById('score').textContent = currentQuiz.score;
    
    // 更新结果消息
    const resultMessage = document.getElementById('result-message');
    const scorePercentage = (currentQuiz.score / currentQuiz.questions.length) * 100;
    
    if (scorePercentage >= 80) {
        resultMessage.textContent = '太棒了！你掌握了这些知识点！';
    } else if (scorePercentage >= 60) {
        resultMessage.textContent = '不错！继续努力，你会做得更好！';
    } else {
        resultMessage.textContent = '继续学习，你会进步的！';
    }
    
    // 将测验结果保存到本地存储
    saveQuizResult();
}

/**
 * 保存测验结果
 */
function saveQuizResult() {
    // 检查storage是否可用
    if (typeof storage === 'undefined') return;
    
    const result = {
        topic: currentQuiz.topic,
        difficulty: currentQuiz.difficulty,
        score: currentQuiz.score,
        totalQuestions: currentQuiz.questions.length,
        timestamp: new Date().toISOString()
    };
    
    // 获取现有结果
    let quizResults = storage.get('math_quiz_results', []);
    
    // 添加新结果
    quizResults.push(result);
    
    // 只保留最新的10个结果
    if (quizResults.length > 10) {
        quizResults = quizResults.slice(-10);
    }
    
    // 保存结果
    storage.set('math_quiz_results', quizResults);
}

/**
 * 打乱数组顺序
 * @param {Array} array - 要打乱的数组
 * @returns {Array} - 打乱后的数组
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
} 