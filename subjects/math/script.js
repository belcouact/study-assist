/**
 * Study Assist - Mathematics Subject JavaScript
 * Handles math-specific functionality and DeepSeek AI interactions
 */

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
                questionInput.value = `Help me understand ${topic}`;
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
                appendMessage(question, 'user');
                
                // Clear input
                questionInput.value = '';
                
                // Show loading indicator
                const loadingMessage = document.createElement('div');
                loadingMessage.className = 'message message-ai loading';
                loadingMessage.innerHTML = '<p>Thinking...</p>';
                chatMessages.appendChild(loadingMessage);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                try {
                    // Make API request
                    const response = await deepSeekAPI.askQuestion(question, 'math');
                    
                    // Remove loading indicator
                    chatMessages.removeChild(loadingMessage);
                    
                    // Add AI response to chat
                    if (response && response.success) {
                        appendMessage(response.response.answer, 'ai');
                    } else {
                        throw new Error('Failed to get response from AI');
                    }
                } catch (error) {
                    console.error('Error getting AI response:', error);
                    
                    // Remove loading indicator
                    chatMessages.removeChild(loadingMessage);
                    
                    // Show error message
                    appendMessage('Sorry, I encountered an error while processing your question. Please try again.', 'ai');
                }
            }
        }
        
        // Function to append message to chat
        function appendMessage(text, sender) {
            const messageElement = document.createElement('div');
            messageElement.className = `message message-${sender}`;
            
            // Process text for MathJax if it contains LaTeX
            let processedText = text;
            
            // Look for math expressions in the text (delimited by $ or $$)
            // and ensure they are properly formatted for MathJax
            if (sender === 'ai' && (text.includes('$') || text.includes('\\('))) {
                // Replace \( \) syntax with $ $ for inline math
                processedText = processedText.replace(/\\\((.*?)\\\)/g, '$$$1$$');
                
                // Replace \[ \] syntax with $$ $$ for block math
                processedText = processedText.replace(/\\\[(.*?)\\\]/g, '$$$$1$$$$');
            }
            
            // Convert newlines to <br> tags
            processedText = processedText.replace(/\n/g, '<br>');
            
            messageElement.innerHTML = `<p>${processedText}</p>`;
            chatMessages.appendChild(messageElement);
            
            // Scroll to bottom of chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Render math expressions with MathJax if available
            if (window.MathJax && sender === 'ai') {
                window.MathJax.typeset([messageElement]);
            }
        }
    }
}

/**
 * Initialize the quiz generator
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
            quizContainer.innerHTML = '<div class="text-center"><p>Generating your quiz...</p></div>';
            
            try {
                // Make API request to generate quiz
                const response = await deepSeekAPI.generateQuiz(topic, difficulty, count);
                
                if (response && response.success) {
                    renderQuiz(response.quiz);
                } else {
                    throw new Error('Failed to generate quiz');
                }
            } catch (error) {
                console.error('Error generating quiz:', error);
                quizContainer.innerHTML = `
                    <div class="text-center text-error">
                        <p>Sorry, there was an error generating your quiz. Please try again.</p>
                        <button class="btn btn-outline mt-md" onclick="initQuizGenerator()">Try Again</button>
                    </div>
                `;
            }
        });
        
        // Function to render quiz
        function renderQuiz(quiz) {
            // Create quiz HTML
            let quizHTML = `
                <div class="quiz-header">
                    <h3>${quiz.title}</h3>
                    <p>Answer the following ${quiz.questions.length} questions.</p>
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
                    <button class="btn btn-outline quiz-prev" disabled>Previous</button>
                    <div class="quiz-progress">Question 1 of ${quiz.questions.length}</div>
                    <button class="btn btn-primary quiz-next">Next</button>
                </div>
            `;
            
            quizHTML += `
                </div>
                <div class="quiz-results" style="display: none;">
                    <h3>Quiz Results</h3>
                    <p class="result-summary"></p>
                    <button class="btn btn-primary quiz-restart">Try Again</button>
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
                quizProgress.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
                
                // Update quiz container data attribute
                quizContainer.setAttribute('data-current-question', currentQuestion);
                
                // If last question, change next button text
                if (currentQuestion === questions.length - 1) {
                    nextBtn.textContent = 'Finish Quiz';
                } else {
                    nextBtn.textContent = 'Next';
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
                    <div class="result-score">${correct} out of ${total} correct (${percentage}%)</div>
                    <div class="result-message">
                        ${percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
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