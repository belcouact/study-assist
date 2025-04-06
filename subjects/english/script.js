/**
 * Study Assist - English Subject JavaScript
 * Handles English-specific functionality and DeepSeek AI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize English subject functionality
    initTopicCards();
    initEnglishAssistant();
    initVocabBuilder();
    initPoetryAnalysis();
    initWritingAssistant();
});

// 获取API端点URL
function getApiUrl() {
    // 使用相对路径在Cloudflare Pages环境中工作
    return '/api/chat';
}

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
            const questionInput = document.getElementById('english-question-input');
            
            if (aiSection && questionInput) {
                aiSection.scrollIntoView({ behavior: 'smooth' });
                
                // Set appropriate prompt based on topic
                let prompt = '';
                switch(topic) {
                    case 'grammar':
                        prompt = 'Help me understand English grammar rules';
                        break;
                    case 'vocabulary':
                        prompt = 'I want to expand my English vocabulary';
                        break;
                    case 'literature':
                        prompt = 'Help me analyze literary works';
                        break;
                    case 'writing':
                        prompt = 'Help me improve my English writing skills';
                        break;
                    case 'comprehension':
                        prompt = 'How can I improve my reading comprehension?';
                        break;
                    case 'poetry':
                        prompt = 'Explain poetry analysis techniques';
                        break;
                    default:
                        prompt = `Help me with English ${topic}`;
                }
                
                questionInput.value = prompt;
                questionInput.focus();
            }
        });
    });
}

/**
 * Initialize the English AI assistant
 */
function initEnglishAssistant() {
    const sendButton = document.getElementById('send-english-question');
    const questionInput = document.getElementById('english-question-input');
    const chatMessages = document.getElementById('english-chat-messages');
    
    if (sendButton && questionInput && chatMessages) {
        // Listen for send button click
        sendButton.addEventListener('click', () => sendEnglishQuestion());
        
        // Listen for Enter key press
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendEnglishQuestion();
            }
        });
        
        // Function to send English question to DeepSeek API
        async function sendEnglishQuestion() {
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
                    // Get education level for context
                    const educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
                    
                    // Construct the messages for the API
                    const messages = [
                        {
                            role: "system",
                            content: `You are an AI English assistant helping a ${educationLevel} student. Provide clear, educational responses focused on English language learning. Tailor your answers to be appropriate for the ${educationLevel} level.`
                        },
                        {
                            role: "user",
                            content: question
                        }
                    ];
                    
                    // Make API request
                    const response = await fetch(getApiUrl(), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ messages })
                    });
                    
                    // Remove loading indicator
                    chatMessages.removeChild(loadingMessage);
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Get the AI's response from the API result
                        const aiMessage = data.choices && data.choices[0] && data.choices[0].message ? 
                            data.choices[0].message.content : 
                            '抱歉，我处理您的问题时遇到了问题。请稍后再试。';
                        
                        // Add AI response to chat
                        appendMessage(aiMessage, 'ai');
                    } else {
                        throw new Error('Failed to get response from AI');
                    }
                } catch (error) {
                    console.error('Error getting AI response:', error);
                    
                    // Remove loading indicator if it still exists
                    const loadingIndicator = chatMessages.querySelector('.loading');
                    if (loadingIndicator) {
                        chatMessages.removeChild(loadingIndicator);
                    }
                    
                    // Show error message
                    appendMessage('抱歉，我处理您的问题时遇到了问题。请稍后再试。', 'ai');
                }
            }
        }
        
        // Function to append message to chat
        function appendMessage(text, sender) {
            const messageElement = document.createElement('div');
            messageElement.className = `message message-${sender}`;
            
            // Convert newlines to <br> tags
            const formattedText = text.replace(/\n/g, '<br>');
            
            messageElement.innerHTML = `<p>${formattedText}</p>`;
            chatMessages.appendChild(messageElement);
            
            // Scroll to bottom of chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

/**
 * Initialize the vocabulary builder
 */
function initVocabBuilder() {
    const generateBtn = document.getElementById('generate-vocab');
    const vocabContainer = document.getElementById('vocab-container');
    const levelSelect = document.getElementById('vocab-level');
    const categorySelect = document.getElementById('vocab-category');
    
    if (generateBtn && vocabContainer) {
        generateBtn.addEventListener('click', async () => {
            // Get options
            const level = levelSelect ? levelSelect.value : 'intermediate';
            const category = categorySelect ? categorySelect.value : 'general';
            
            // Show loading state
            vocabContainer.innerHTML = '<div class="text-center"><p>生成词汇列表中...</p></div>';
            
            try {
                // Get education level for context
                const educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
                
                // Construct the messages for the API
                const messages = [
                    {
                        role: "system",
                        content: `You are an AI English vocabulary assistant. Generate a vocabulary list for a ${educationLevel} student. The list should match the difficulty level: ${level} and category: ${category}. Return your response in this format:
                        1. Word - pronunciation - part of speech
                           Definition: Simple definition
                           Example: Example sentence using the word
                        
                        Generate 5 words that are appropriate for the requested level and category.`
                    },
                    {
                        role: "user",
                        content: `Generate a vocabulary list with difficulty: ${level} in category: ${category}`
                    }
                ];
                
                // Make API request
                const response = await fetch(getApiUrl(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Get the vocab list from the API result
                    const vocabList = data.choices && data.choices[0] && data.choices[0].message ? 
                        data.choices[0].message.content : 
                        '抱歉，无法生成词汇列表。请稍后再试。';
                    
                    // Format and display the vocab list
                    vocabContainer.innerHTML = `
                        <div class="vocab-list">
                            <h3>${level} 难度 - ${getCategoryName(category)} 类别</h3>
                            <div class="vocab-content">
                                ${formatVocabList(vocabList)}
                            </div>
                        </div>
                    `;
                } else {
                    throw new Error('Failed to generate vocabulary list');
                }
            } catch (error) {
                console.error('Error generating vocabulary list:', error);
                vocabContainer.innerHTML = `
                    <div class="text-center text-error">
                        <p>抱歉，生成词汇列表时出错。请稍后再试。</p>
                        <button class="btn btn-outline mt-md" onclick="initVocabBuilder()">重试</button>
                    </div>
                `;
            }
        });
        
        // Function to format vocab list
        function formatVocabList(text) {
            // Replace numbers and line breaks with styled elements
            return text
                .replace(/(\d+)\.\s([^\n]+)/g, '<div class="vocab-item"><h4>$1. $2</h4>')
                .replace(/Definition:\s([^\n]+)/g, '<p><strong>定义：</strong> $1</p>')
                .replace(/Example:\s([^\n]+)/g, '<p><strong>例句：</strong> <em>$1</em></p></div>')
                .replace(/\n/g, '<br>');
        }
        
        // Function to get user-friendly category name
        function getCategoryName(category) {
            const categories = {
                'general': '通用词汇',
                'academic': '学术词汇',
                'literature': '文学术语',
                'idioms': '习语和短语'
            };
            
            return categories[category] || category;
        }
    }
}

/**
 * Initialize the poetry analysis feature
 */
function initPoetryAnalysis() {
    const loadPoemBtn = document.getElementById('load-poem');
    const poemDisplay = document.getElementById('poem-display');
    const periodSelect = document.getElementById('poetry-period');
    const styleSelect = document.getElementById('poetry-style');
    
    if (loadPoemBtn && poemDisplay) {
        loadPoemBtn.addEventListener('click', async () => {
            // Get options
            const period = periodSelect ? periodSelect.value : 'romantic';
            const style = styleSelect ? styleSelect.value : 'sonnet';
            
            // Show loading state
            poemDisplay.innerHTML = '<div class="text-center"><p>加载诗歌中...</p></div>';
            
            try {
                // Get education level for context
                const educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
                
                // Construct the messages for the API
                const messages = [
                    {
                        role: "system",
                        content: `You are an AI poetry expert. Select a famous poem from the ${period} period in the ${style} style that would be appropriate for a ${educationLevel} student. Provide the poem text, information about the author, an analysis of the themes, and an explanation of the poetic devices used. Structure your response in clear sections.`
                    },
                    {
                        role: "user",
                        content: `Show me a poem from the ${period} period in ${style} style`
                    }
                ];
                
                // Make API request
                const response = await fetch(getApiUrl(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Get the poem analysis from the API result
                    const poemAnalysis = data.choices && data.choices[0] && data.choices[0].message ? 
                        data.choices[0].message.content : 
                        '抱歉，无法加载诗歌。请稍后再试。';
                    
                    // Format and display the poem
                    poemDisplay.innerHTML = `
                        <div class="poem-analysis">
                            ${formatPoemAnalysis(poemAnalysis)}
                        </div>
                    `;
                } else {
                    throw new Error('Failed to load poem');
                }
            } catch (error) {
                console.error('Error loading poem:', error);
                poemDisplay.innerHTML = `
                    <div class="text-center text-error">
                        <p>抱歉，加载诗歌时出错。请稍后再试。</p>
                        <button class="btn btn-outline mt-md" onclick="initPoetryAnalysis()">重试</button>
                    </div>
                `;
            }
        });
        
        // Function to format poem analysis
        function formatPoemAnalysis(text) {
            // Replace headings and line breaks with styled elements
            let formatted = text
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/^(.+)$/m, '<h3>$1</h3>')
                .replace(/^By (.+)$/m, '<p class="poem-author">By $1</p>');
            
            // Wrap in paragraph tags if not already
            if (!formatted.startsWith('<')) {
                formatted = `<p>${formatted}</p>`;
            }
            
            return formatted;
        }
    }
}

/**
 * Initialize the writing assistant feature
 */
function initWritingAssistant() {
    const writingInput = document.getElementById('writing-input');
    const analyzeBtn = document.getElementById('analyze-writing');
    const writingFeedback = document.getElementById('writing-feedback');
    const writingType = document.getElementById('writing-type');
    const writingFocus = document.getElementById('writing-focus');
    
    if (analyzeBtn && writingInput && writingFeedback) {
        analyzeBtn.addEventListener('click', async () => {
            const text = writingInput.value.trim();
            
            if (text) {
                // Show loading state
                writingFeedback.innerHTML = '<div class="text-center"><p>分析中...</p></div>';
                
                try {
                    // Get options
                    const type = writingType ? writingType.value : 'essay';
                    const focus = writingFocus ? writingFocus.value : 'grammar';
                    
                    // Get education level for context
                    const educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
                    
                    // Construct the messages for the API
                    const messages = [
                        {
                            role: "system",
                            content: `You are an English writing coach for a ${educationLevel} student. Analyze the following ${type} text with a focus on ${focus}. Provide constructive feedback, pointing out both strengths and areas for improvement. Include specific suggestions for improvement.`
                        },
                        {
                            role: "user",
                            content: `Please analyze this ${type} with a focus on ${focus}:\n\n${text}`
                        }
                    ];
                    
                    // Make API request
                    const response = await fetch(getApiUrl(), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ messages })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Get the feedback from the API result
                        const feedback = data.choices && data.choices[0] && data.choices[0].message ? 
                            data.choices[0].message.content : 
                            '抱歉，无法分析你的文本。请稍后再试。';
                        
                        // Format and display the feedback
                        writingFeedback.innerHTML = `
                            <div class="writing-analysis">
                                <h3>写作分析</h3>
                                <div class="analysis-content">
                                    ${formatWritingFeedback(feedback)}
                                </div>
                            </div>
                        `;
                    } else {
                        throw new Error('Failed to analyze writing');
                    }
                } catch (error) {
                    console.error('Error analyzing writing:', error);
                    writingFeedback.innerHTML = `
                        <div class="text-center text-error">
                            <p>抱歉，分析文本时出错。请稍后再试。</p>
                            <button class="btn btn-outline mt-md" onclick="initWritingAssistant()">重试</button>
                        </div>
                    `;
                }
            } else {
                writingFeedback.innerHTML = `
                    <div class="text-center text-warning">
                        <p>请输入一些文本进行分析。</p>
                    </div>
                `;
            }
        });
        
        // Function to format writing feedback
        function formatWritingFeedback(text) {
            // Replace headings and line breaks with styled elements
            return text
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>');
        }
    }
} 