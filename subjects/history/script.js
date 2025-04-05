document.addEventListener('DOMContentLoaded', function() {
    // Initialize API
    initAPI();
    
    // History chat functionality
    const chatInput = document.getElementById('history-question-input');
    const sendButton = document.getElementById('send-history-question');
    const chatMessages = document.getElementById('history-chat-messages');
    
    sendButton.addEventListener('click', function() {
        const question = chatInput.value.trim();
        if (question) {
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'message message-user';
            userMessage.innerHTML = `<p>${question}</p>`;
            chatMessages.appendChild(userMessage);
            
            // Clear input
            chatInput.value = '';
            
            // Show loading indicator
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'message message-ai message-loading';
            loadingMessage.innerHTML = '<p>Thinking...</p>';
            chatMessages.appendChild(loadingMessage);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Get AI response (simulated)
            setTimeout(() => {
                // Remove loading message
                chatMessages.removeChild(loadingMessage);
                
                // Simulate API call
                askQuestion(question, 'history')
                    .then(response => {
                        // Add AI response
                        const aiMessage = document.createElement('div');
                        aiMessage.className = 'message message-ai';
                        aiMessage.innerHTML = `<p>${response}</p>`;
                        chatMessages.appendChild(aiMessage);
                        
                        // Scroll to bottom
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'message message-error';
                        errorMessage.innerHTML = '<p>Sorry, I encountered an error. Please try again.</p>';
                        chatMessages.appendChild(errorMessage);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    });
            }, 1000);
        }
    });
    
    // Allow Enter key to send messages
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
    
    // Quiz generator functionality
    const generateQuizButton = document.getElementById('generate-quiz');
    const quizContainer = document.getElementById('quiz-container');
    
    generateQuizButton.addEventListener('click', function() {
        const topic = document.getElementById('quiz-topic').value;
        const difficulty = document.getElementById('quiz-difficulty').value;
        const questions = document.getElementById('quiz-questions').value;
        
        // Show loading
        quizContainer.innerHTML = '<p class="loading">Generating history quiz...</p>';
        
        // Simulate API call to generate quiz
        setTimeout(() => {
            // This would be an actual API call in production
            const quizQuestions = [
                {
                    question: "Which empire was founded by Cyrus the Great in 550 BCE?",
                    options: ["Persian Empire", "Roman Empire", "Babylonian Empire", "Egyptian Empire"],
                    correctAnswer: 0
                },
                {
                    question: "The Treaty of Versailles was signed in what year, officially ending World War I?",
                    options: ["1917", "1918", "1919", "1920"],
                    correctAnswer: 2
                },
                {
                    question: "Who was the first Emperor of China, known for unifying the country in 221 BCE?",
                    options: ["Kublai Khan", "Emperor Wu", "Qin Shi Huang", "Kangxi Emperor"],
                    correctAnswer: 2
                },
                {
                    question: "The Renaissance period is generally considered to have begun in which country?",
                    options: ["France", "Germany", "England", "Italy"],
                    correctAnswer: 3
                },
                {
                    question: "Which battle, fought in 1066, resulted in the Norman conquest of England?",
                    options: ["Battle of Agincourt", "Battle of Waterloo", "Battle of Hastings", "Battle of Bosworth Field"],
                    correctAnswer: 2
                }
            ];
            
            let html = '<div class="quiz">';
            html += `<h3>${topic.charAt(0).toUpperCase() + topic.slice(1)} History Quiz (${difficulty} difficulty)</h3>`;
            
            quizQuestions.forEach((q, i) => {
                html += `
                    <div class="quiz-question">
                        <h4>${i + 1}. ${q.question}</h4>
                        <div class="quiz-options">
                `;
                
                q.options.forEach((option, j) => {
                    html += `
                        <div class="quiz-option" data-question="${i}" data-option="${j}">
                            <input type="radio" id="q${i}o${j}" name="question${i}" value="${j}">
                            <label for="q${i}o${j}">${option}</label>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += `
                <div class="quiz-actions">
                    <button id="submit-quiz" class="btn btn-primary">Submit Answers</button>
                </div>
            </div>`;
            
            quizContainer.innerHTML = html;
            
            // Add event listeners to quiz options
            document.querySelectorAll('.quiz-option').forEach(option => {
                option.addEventListener('click', function() {
                    const questionIndex = this.getAttribute('data-question');
                    const optionIndex = this.getAttribute('data-option');
                    
                    // Select the radio button
                    document.getElementById(`q${questionIndex}o${optionIndex}`).checked = true;
                    
                    // Remove selected class from all options in this question
                    document.querySelectorAll(`.quiz-option[data-question="${questionIndex}"]`).forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Add selected class to this option
                    this.classList.add('selected');
                });
            });
            
            // Add event listener to submit button
            document.getElementById('submit-quiz').addEventListener('click', function() {
                // Calculate score
                let score = 0;
                let total = quizQuestions.length;
                
                quizQuestions.forEach((q, i) => {
                    const selectedOption = document.querySelector(`input[name="question${i}"]:checked`);
                    if (selectedOption) {
                        const selected = parseInt(selectedOption.value);
                        if (selected === q.correctAnswer) {
                            score++;
                            selectedOption.closest('.quiz-option').classList.add('correct');
                        } else {
                            selectedOption.closest('.quiz-option').classList.add('incorrect');
                            document.getElementById(`q${i}o${q.correctAnswer}`).closest('.quiz-option').classList.add('correct');
                        }
                    } else {
                        document.getElementById(`q${i}o${q.correctAnswer}`).closest('.quiz-option').classList.add('correct');
                    }
                });
                
                // Disable all inputs
                document.querySelectorAll('.quiz-option input').forEach(input => {
                    input.disabled = true;
                });
                
                // Show results
                const resultsHtml = `
                    <div class="quiz-results">
                        <h3>Your Score: ${score}/${total}</h3>
                        <p>${score === total ? 'Perfect! You have an excellent grasp of this historical period.' : 
                           score >= total * 0.7 ? 'Great job! You have a good understanding of this historical period.' :
                           score >= total * 0.5 ? 'Good effort! You might want to review some aspects of this historical period.' :
                           'You might need to study this historical period more. Keep learning!'}</p>
                        <button id="new-quiz" class="btn btn-primary">Generate New Quiz</button>
                    </div>
                `;
                
                quizContainer.insertAdjacentHTML('beforeend', resultsHtml);
                
                // Hide submit button
                this.style.display = 'none';
                
                // Add event listener to new quiz button
                document.getElementById('new-quiz').addEventListener('click', function() {
                    generateQuizButton.click();
                });
            });
        }, 1500);
    });
    
    // Timeline explorer functionality
    const loadTimelineButton = document.getElementById('load-timeline');
    const timelineDisplay = document.getElementById('timeline-display');
    
    loadTimelineButton.addEventListener('click', function() {
        const period = document.getElementById('timeline-period').value;
        const region = document.getElementById('timeline-region').value;
        
        // Show loading
        timelineDisplay.innerHTML = '<p class="loading">Loading timeline data...</p>';
        
        // Simulate API call to load timeline
        setTimeout(() => {
            // This would be an actual API call in production
            let timelineHtml = '<div class="timeline">';
            
            if (period === 'ancient' && region === 'global') {
                const events = [
                    {
                        date: "3000 BCE",
                        title: "Early Bronze Age Begins",
                        description: "The development of bronze technology marks a significant advancement in human civilization."
                    },
                    {
                        date: "2560 BCE",
                        title: "Great Pyramid of Giza Completed",
                        description: "The largest of the Egyptian pyramids is built as a tomb for Pharaoh Khufu."
                    },
                    {
                        date: "1792 BCE",
                        title: "Hammurabi Becomes King of Babylon",
                        description: "His famous code of laws becomes one of the earliest written legal codes in history."
                    },
                    {
                        date: "776 BCE",
                        title: "First Olympic Games Held",
                        description: "The ancient Olympic Games begin in Olympia, Greece, dedicated to Zeus."
                    },
                    {
                        date: "333 BCE",
                        title: "Alexander the Great Defeats Persians",
                        description: "The Battle of Issus marks a critical victory in Alexander's conquest of the Persian Empire."
                    }
                ];
                
                events.forEach((event, index) => {
                    timelineHtml += `
                        <div class="timeline-event">
                            <div class="event-card">
                                <div class="event-date">${event.date}</div>
                                <h4 class="event-title">${event.title}</h4>
                                <p class="event-description">${event.description}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                timelineHtml += `
                    <div class="placeholder-content">
                        <p>A timeline for the ${period} period focusing on ${region} would be displayed here.</p>
                        <p>Try selecting "Ancient" and "Global" to see a sample timeline.</p>
                    </div>
                `;
            }
            
            timelineHtml += '</div>';
            timelineDisplay.innerHTML = timelineHtml;
        }, 1500);
    });
    
    // Primary source analysis functionality
    const loadSourceButton = document.getElementById('load-source');
    const sourceDisplay = document.getElementById('source-display');
    
    loadSourceButton.addEventListener('click', function() {
        const sourceType = document.getElementById('source-type').value;
        const sourcePeriod = document.getElementById('source-period').value;
        
        // Show loading
        sourceDisplay.innerHTML = '<p class="loading">Loading historical source...</p>';
        
        // Simulate API call to load source
        setTimeout(() => {
            // This would be an actual API call in production
            let sourceHtml = '';
            
            if (sourceType === 'document' && sourcePeriod === 'enlightenment') {
                sourceHtml = `
                    <div class="document-display">
                        <div class="document-card">
                            <div class="document-header">
                                <h3 class="document-title">Declaration of Independence</h3>
                                <p class="document-metadata">Thomas Jefferson, July 4, 1776</p>
                            </div>
                            <div class="document-content">
                                <p>When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.</p>
                                <p>We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.</p>
                            </div>
                            <div class="analysis-questions">
                                <h4>Analysis Questions</h4>
                                <ul>
                                    <li>Who authored this document and what was their role in society?</li>
                                    <li>What was the historical context in which this document was written?</li>
                                    <li>What Enlightenment ideas are expressed in this document?</li>
                                    <li>Who was the intended audience for this document?</li>
                                    <li>How did this document influence subsequent historical events?</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                sourceHtml = `
                    <div class="placeholder-content">
                        <p>A ${sourceType} from the ${sourcePeriod} period would be displayed here with analysis questions.</p>
                        <p>Try selecting "Document" and "Enlightenment" to see a sample primary source.</p>
                    </div>
                `;
            }
            
            sourceDisplay.innerHTML = sourceHtml;
        }, 1500);
    });
}); 