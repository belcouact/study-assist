/**
 * Mathematics Subject JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize topic cards with saved progress
    initializeTopicCards();
    
    // Setup grade filter
    setupGradeFilter();
    
    // Setup calculator functionality
    setupCalculator();
    
    // Setup calculator type switching
    setupCalculatorTypes();
    
    // Setup progress visualization
    setupProgressVisualization();
    
    // Setup practice generator
    setupPracticeGenerator();
});

/**
 * Initialize topic cards with saved progress
 */
function initializeTopicCards() {
    // Get all topic cards
    const topicCards = document.querySelectorAll('.topic-card');
    
    topicCards.forEach(card => {
        const topic = card.querySelector('.topic-link').dataset.topic;
        const progressBar = card.querySelector('.progress-bar');
        const progressText = card.querySelector('.progress-text');
        const progressElement = card.querySelector('.topic-progress');
        
        // Get progress from user data
        const progress = getUserProgress('math', topic) || 0;
        
        // Update progress display
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        progressElement.dataset.progress = progress;
        
        // Add click handler to topic link
        card.querySelector('.topic-link').addEventListener('click', function(e) {
            e.preventDefault();
            simulateTopicStart(topic);
        });
    });
}

/**
 * Setup grade filter for topics
 */
function setupGradeFilter() {
    const gradeSelect = document.getElementById('grade-select');
    const topicCards = document.querySelectorAll('.topic-card');
    
    gradeSelect.addEventListener('change', function() {
        const selectedGrade = this.value;
        
        topicCards.forEach(card => {
            if (selectedGrade === 'all' || card.dataset.grade === selectedGrade) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

/**
 * Setup calculator functionality
 */
function setupCalculator() {
    const calculatorKeys = document.querySelectorAll('.calc-key');
    const calculationInput = document.getElementById('calculation-input');
    const calculationHistory = document.getElementById('calculation-history');
    
    let currentInput = '0';
    let currentCalculation = '';
    let waitingForOperand = false;
    let lastResult = null;
    
    // Add click handlers to calculator keys
    calculatorKeys.forEach(key => {
        key.addEventListener('click', function() {
            // Get key type and value
            const keyContent = this.textContent;
            const keyAction = this.dataset.action;
            
            // Handle different key types
            if (this.classList.contains('digit')) {
                handleDigit(keyContent);
            } else if (keyAction === 'clear') {
                handleClear();
            } else if (keyAction === 'backspace') {
                handleBackspace();
            } else if (keyAction === 'toggle-sign') {
                handleToggleSign();
            } else if (keyAction === 'percent') {
                handlePercent();
            } else if (this.classList.contains('operator')) {
                handleOperator(keyContent, keyAction);
            } else if (keyAction === 'calculate') {
                handleCalculate();
            }
            
            // Update display
            updateCalculatorDisplay();
        });
    });
    
    // Handle digit key press
    function handleDigit(digit) {
        if (digit === '.' && currentInput.includes('.')) {
            return; // Prevent multiple decimal points
        }
        
        if (currentInput === '0' && digit !== '.') {
            currentInput = digit;
        } else if (waitingForOperand) {
            currentInput = digit;
            waitingForOperand = false;
        } else {
            currentInput += digit;
        }
    }
    
    // Handle clear key press
    function handleClear() {
        currentInput = '0';
        currentCalculation = '';
        waitingForOperand = false;
        lastResult = null;
    }
    
    // Handle backspace key press
    function handleBackspace() {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
    }
    
    // Handle toggle sign key press
    function handleToggleSign() {
        currentInput = (parseFloat(currentInput) * -1).toString();
    }
    
    // Handle percent key press
    function handlePercent() {
        const value = parseFloat(currentInput);
        currentInput = (value / 100).toString();
    }
    
    // Handle operator key press
    function handleOperator(display, operation) {
        const inputNum = parseFloat(currentInput);
        
        // If we're waiting for a second operand, update the operator
        if (waitingForOperand) {
            currentCalculation = currentCalculation.slice(0, -1) + display;
        } else {
            // If this is the first operator, use the current input as first operand
            if (!currentCalculation) {
                currentCalculation = currentInput + ' ' + display;
            } else {
                // Otherwise, calculate the result so far and continue
                currentCalculation += ' ' + currentInput;
                const calculation = currentCalculation.replace(/×/g, '*').replace(/÷/g, '/');
                try {
                    lastResult = eval(calculation);
                    currentInput = lastResult.toString();
                    currentCalculation = currentInput + ' ' + display;
                } catch (error) {
                    currentInput = 'Error';
                    currentCalculation = '';
                    waitingForOperand = true;
                    return;
                }
            }
        }
        
        waitingForOperand = true;
    }
    
    // Handle calculate (equals) key press
    function handleCalculate() {
        if (!currentCalculation) {
            return; // Nothing to calculate
        }
        
        // Add the current input to the calculation if not waiting for a second operand
        if (!waitingForOperand) {
            currentCalculation += ' ' + currentInput;
        }
        
        // Replace display operators with JavaScript operators
        const calculation = currentCalculation.replace(/×/g, '*').replace(/÷/g, '/');
        
        // Store the calculation in history
        calculationHistory.textContent = currentCalculation + ' =';
        
        // Evaluate the calculation
        try {
            lastResult = eval(calculation);
            currentInput = lastResult.toString();
            currentCalculation = '';
            waitingForOperand = true;
        } catch (error) {
            currentInput = 'Error';
            currentCalculation = '';
            waitingForOperand = true;
        }
    }
    
    // Update calculator display
    function updateCalculatorDisplay() {
        calculationInput.textContent = currentInput;
        calculationHistory.textContent = currentCalculation;
    }
    
    // Add keyboard support
    document.addEventListener('keydown', function(e) {
        // Only handle keys if the calculator tab is active
        if (!document.getElementById('calculator').classList.contains('active')) {
            return;
        }
        
        // Map keyboard keys to calculator buttons
        const key = e.key;
        
        if (/[0-9\.]/.test(key)) {
            // Digit or decimal point
            const digitKey = document.querySelector(`.calc-key:not([data-action]):contains('${key}')`);
            if (digitKey) digitKey.click();
        } else if (key === '+') {
            document.querySelector(`.calc-key[data-action="add"]`).click();
        } else if (key === '-') {
            document.querySelector(`.calc-key[data-action="subtract"]`).click();
        } else if (key === '*') {
            document.querySelector(`.calc-key[data-action="multiply"]`).click();
        } else if (key === '/') {
            document.querySelector(`.calc-key[data-action="divide"]`).click();
        } else if (key === '%') {
            document.querySelector(`.calc-key[data-action="percent"]`).click();
        } else if (key === 'Enter' || key === '=') {
            document.querySelector(`.calc-key[data-action="calculate"]`).click();
        } else if (key === 'Backspace') {
            document.querySelector(`.calc-key[data-action="backspace"]`).click();
        } else if (key === 'Escape') {
            document.querySelector(`.calc-key[data-action="clear"]`).click();
        }
    });
}

/**
 * Setup calculator type switching
 */
function setupCalculatorTypes() {
    const calculatorTypeButtons = document.querySelectorAll('.calculator-types li');
    const calculators = document.querySelectorAll('.calculator');
    
    calculatorTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const calculatorType = this.dataset.calculator;
            
            // Update active button
            calculatorTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update active calculator
            calculators.forEach(calc => calc.classList.remove('active'));
            document.getElementById(`${calculatorType}-calculator`).classList.add('active');
        });
    });
}

/**
 * Setup progress visualization
 */
function setupProgressVisualization() {
    // Get all topics and their progress
    const mathProgress = getUserProgress('math') || {};
    const topicsCount = document.querySelectorAll('.topic-card').length;
    
    // Calculate overall progress
    let totalProgress = 0;
    let completedTopics = 0;
    let totalExercisesCompleted = 0;
    
    // Get topic names for table
    const topicNames = {
        'basic-operations': '基础运算',
        'fractions': '分数',
        'geometry-basics': '基础几何',
        'algebra': '代数入门',
        'functions': '函数',
        'statistics': '统计与概率',
        'advanced-functions': '高级函数',
        'calculus': '微积分',
        'vectors': '向量与矩阵'
    };
    
    // Populate progress details
    const progressTableBody = document.querySelector('.progress-table tbody');
    progressTableBody.innerHTML = '';
    
    // Process each topic
    Object.keys(topicNames).forEach(topic => {
        const progress = mathProgress[topic] || 0;
        totalProgress += progress;
        
        if (progress === 100) {
            completedTopics++;
        }
        
        // Track exercises (simulated)
        const exercisesCount = Math.floor(progress / 10); // Assume 1 exercise per 10% progress
        totalExercisesCompleted += exercisesCount;
        
        // Add to table
        const row = document.createElement('tr');
        
        // Format last studied date (simulated)
        let lastStudiedDate = '';
        if (progress > 0) {
            // Simulate a date in the last 30 days
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            lastStudiedDate = formatDate(date);
        } else {
            lastStudiedDate = '尚未开始';
        }
        
        row.innerHTML = `
            <td>${topicNames[topic]}</td>
            <td>
                <div class="table-progress">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                    <span>${progress}%</span>
                </div>
            </td>
            <td>${lastStudiedDate}</td>
            <td>
                <button class="btn small ${progress === 0 ? 'primary' : 'secondary'}">
                    ${progress === 0 ? '开始学习' : '继续学习'}
                </button>
            </td>
        `;
        
        progressTableBody.appendChild(row);
    });
    
    // Calculate average progress
    const averageProgress = totalProgress / topicsCount;
    
    // Update progress visualizations
    updateProgressCircle(averageProgress);
    document.querySelector('.overview-card:nth-child(2) .stat-number').textContent = `${completedTopics}/${topicsCount}`;
    document.querySelector('.overview-card:nth-child(3) .stat-number').textContent = totalExercisesCompleted.toString();
    
    // Streak days (simulated)
    const streakDays = Math.floor(Math.random() * 15); // Simulate a streak
    document.querySelector('.overview-card:nth-child(4) .stat-number').textContent = streakDays.toString();
    
    // Setup learning history chart (placeholder)
    setupLearningHistoryChart();
}

/**
 * Update progress circle visualization
 */
function updateProgressCircle(percentage) {
    const circle = document.querySelector('.progress-circle');
    const circleText = circle.querySelector('.progress-circle-text');
    const circleBar = circle.querySelector('.progress-circle-bar');
    
    // Round percentage
    const roundedPercentage = Math.round(percentage);
    
    // Update text
    circleText.textContent = `${roundedPercentage}%`;
    
    // Update circle
    const circumference = 2 * Math.PI * 54; // r=54
    const offset = circumference - (roundedPercentage / 100) * circumference;
    
    // Animate the progress
    circleBar.style.strokeDasharray = `${circumference}`;
    circleBar.style.strokeDashoffset = `${offset}`;
}

/**
 * Setup learning history chart (placeholder)
 */
function setupLearningHistoryChart() {
    // Placeholder function - in a real app, this would use a charting library like Chart.js
    const chartContainer = document.getElementById('learning-chart-container');
    
    // Create a canvas placeholder
    chartContainer.innerHTML = `
        <div class="chart-placeholder">
            <p>学习历史图表将显示在此处。</p>
            <p>在实际应用中，这里将使用Chart.js等图表库来可视化你的学习数据。</p>
        </div>
    `;
}

/**
 * Setup practice generator
 */
function setupPracticeGenerator() {
    const generateButton = document.getElementById('generate-practice');
    
    generateButton.addEventListener('click', function() {
        const topic = document.getElementById('practice-topic').value;
        const difficulty = document.getElementById('difficulty').value;
        const questionCount = document.getElementById('question-count').value;
        
        // Generate practice problems (simulated)
        generatePracticeProblems(topic, difficulty, questionCount);
    });
}

/**
 * Generate practice problems (simulated)
 */
function generatePracticeProblems(topic, difficulty, count) {
    // Show loading indicator
    const chatMessages = document.getElementById('ai-chat-messages');
    
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('chat-message', 'ai-message', 'loading-message');
    loadingElement.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(loadingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate API call
    setTimeout(() => {
        // Remove loading indicator
        chatMessages.removeChild(loadingElement);
        
        // Add AI message with generated practice problems
        const practiceMessage = document.createElement('div');
        practiceMessage.classList.add('chat-message', 'ai-message');
        
        // Generate problems based on topic
        let problems;
        if (topic === 'any') {
            // Randomly select a topic
            const topics = ['basic-operations', 'fractions', 'geometry-basics', 'algebra', 'functions'];
            topic = topics[Math.floor(Math.random() * topics.length)];
        }
        
        problems = generateProblemsByTopic(topic, difficulty, parseInt(count));
        
        // Format problems as message content
        practiceMessage.innerHTML = `
            <div class="message-sender">AI助手：</div>
            <div class="message-content">
                <p>以下是${difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}难度的${count}道${getTopicName(topic)}练习题。请在下方输入你的答案，我会为你检查。</p>
                <ol class="practice-problems">
                    ${problems.map(p => `<li>${p.question}</li>`).join('')}
                </ol>
                <p>完成后，你可以输入"检查答案"，我会为你评分并解析。</p>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        chatMessages.appendChild(practiceMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
}

/**
 * Generate problems by topic (simulated)
 */
function generateProblemsByTopic(topic, difficulty, count) {
    const problems = [];
    
    // Generate problems based on topic and difficulty
    switch(topic) {
        case 'basic-operations':
            for (let i = 0; i < count; i++) {
                problems.push(generateBasicOperationProblem(difficulty));
            }
            break;
        case 'fractions':
            for (let i = 0; i < count; i++) {
                problems.push(generateFractionProblem(difficulty));
            }
            break;
        case 'geometry-basics':
            for (let i = 0; i < count; i++) {
                problems.push(generateGeometryProblem(difficulty));
            }
            break;
        case 'algebra':
            for (let i = 0; i < count; i++) {
                problems.push(generateAlgebraProblem(difficulty));
            }
            break;
        case 'functions':
            for (let i = 0; i < count; i++) {
                problems.push(generateFunctionProblem(difficulty));
            }
            break;
        default:
            // Default to basic operations
            for (let i = 0; i < count; i++) {
                problems.push(generateBasicOperationProblem(difficulty));
            }
    }
    
    return problems;
}

/**
 * Get topic name in Chinese
 */
function getTopicName(topic) {
    const topicNames = {
        'basic-operations': '基础运算',
        'fractions': '分数',
        'geometry-basics': '基础几何',
        'algebra': '代数入门',
        'functions': '函数',
        'statistics': '统计与概率',
        'advanced-functions': '高级函数',
        'calculus': '微积分',
        'vectors': '向量与矩阵',
        'any': '数学'
    };
    
    return topicNames[topic] || '数学';
}

/**
 * Generate basic operation problem
 */
function generateBasicOperationProblem(difficulty) {
    let a, b, c, operation1, operation2;
    
    if (difficulty === 'easy') {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        const operations = ['+', '-', '×'];
        operation1 = operations[Math.floor(Math.random() * operations.length)];
        
        let question = `${a} ${operation1} ${b} = ?`;
        return { question, difficulty };
    } else if (difficulty === 'medium') {
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        c = Math.floor(Math.random() * 10) + 1;
        
        const operations = ['+', '-', '×', '÷'];
        operation1 = operations[Math.floor(Math.random() * operations.length)];
        operation2 = operations[Math.floor(Math.random() * operations.length)];
        
        let question = `${a} ${operation1} ${b} ${operation2} ${c} = ?`;
        return { question, difficulty };
    } else {
        a = Math.floor(Math.random() * 30) + 10;
        b = Math.floor(Math.random() * 30) + 10;
        c = Math.floor(Math.random() * 20) + 5;
        const d = Math.floor(Math.random() * 10) + 1;
        
        const operations = ['+', '-', '×', '÷'];
        operation1 = operations[Math.floor(Math.random() * operations.length)];
        operation2 = operations[Math.floor(Math.random() * operations.length)];
        const operation3 = operations[Math.floor(Math.random() * operations.length)];
        
        let question = `${a} ${operation1} ${b} ${operation2} ${c} ${operation3} ${d} = ?`;
        return { question, difficulty };
    }
}

/**
 * Generate fraction problem
 */
function generateFractionProblem(difficulty) {
    let a, b, c, d;
    
    if (difficulty === 'easy') {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        
        let question = `\\(\\frac{${a}}{${b}} + \\frac{${b}}{${a+b}} = ?\\)`;
        return { question, difficulty };
    } else if (difficulty === 'medium') {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 2;
        c = Math.floor(Math.random() * 10) + 1;
        d = Math.floor(Math.random() * 10) + 2;
        
        let question = `\\(\\frac{${a}}{${b}} \\times \\frac{${c}}{${d}} = ?\\)`;
        return { question, difficulty };
    } else {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 2;
        c = Math.floor(Math.random() * 10) + 1;
        d = Math.floor(Math.random() * 10) + 2;
        
        let question = `\\(\\frac{${a}}{${b}} \\div \\frac{${c}}{${d}} = ?\\)`;
        return { question, difficulty };
    }
}

/**
 * Generate geometry problem
 */
function generateGeometryProblem(difficulty) {
    if (difficulty === 'easy') {
        const width = Math.floor(Math.random() * 10) + 5;
        const height = Math.floor(Math.random() * 10) + 5;
        
        let question = `一个矩形的宽是${width}厘米，长是${height}厘米，求它的面积。`;
        return { question, difficulty };
    } else if (difficulty === 'medium') {
        const radius = Math.floor(Math.random() * 10) + 5;
        
        let question = `一个圆的半径是${radius}厘米，求它的面积和周长。(π取3.14)`;
        return { question, difficulty };
    } else {
        const side1 = Math.floor(Math.random() * 10) + 5;
        const side2 = Math.floor(Math.random() * 10) + 5;
        
        let question = `一个直角三角形的两条直角边分别是${side1}厘米和${side2}厘米，求它的斜边长度和面积。`;
        return { question, difficulty };
    }
}

/**
 * Generate algebra problem
 */
function generateAlgebraProblem(difficulty) {
    if (difficulty === 'easy') {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        
        let question = `解方程：${a}x + ${b} = ${a*5+b}`;
        return { question, difficulty };
    } else if (difficulty === 'medium') {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 20) + 1;
        
        let question = `解方程：${a}x² + ${b}x + ${c} = 0`;
        return { question, difficulty };
    } else {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        
        let question = `解不等式并表示出解集：${a}x² - ${b}x > 0`;
        return { question, difficulty };
    }
}

/**
 * Generate function problem
 */
function generateFunctionProblem(difficulty) {
    if (difficulty === 'easy') {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        
        let question = `函数f(x) = ${a}x + ${b}，求f(3)的值。`;
        return { question, difficulty };
    } else if (difficulty === 'medium') {
        const a = Math.floor(Math.random() * 3) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        const c = Math.floor(Math.random() * 10) + 1;
        
        let question = `函数f(x) = ${a}x² + ${b}x + ${c}，求f'(x)。`;
        return { question, difficulty };
    } else {
        let question = `已知二次函数f(x) = ax² + bx + c的图像过点(1, 2)，(2, 1)，(3, 4)，求该函数的解析式。`;
        return { question, difficulty };
    }
}

/**
 * Simulate starting a topic
 */
function simulateTopicStart(topic) {
    // In a real app, this would navigate to the topic page
    // For this demo, we'll just update the progress
    
    // Get current progress
    let progress = getUserProgress('math', topic) || 0;
    
    // Increment progress by a random amount (5-15%)
    progress += Math.floor(Math.random() * 11) + 5;
    if (progress > 100) progress = 100;
    
    // Save progress
    saveUserProgress('math', topic, progress);
    
    // Update UI
    const card = document.querySelector(`.topic-card .topic-link[data-topic="${topic}"]`).closest('.topic-card');
    const progressBar = card.querySelector('.progress-bar');
    const progressText = card.querySelector('.progress-text');
    const progressElement = card.querySelector('.topic-progress');
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
    progressElement.dataset.progress = progress;
    
    // Show a message
    alert(`已开始学习"${getTopicName(topic)}"主题！进度已更新到${progress}%。`);
    
    // Update progress visualization
    setupProgressVisualization();
} 