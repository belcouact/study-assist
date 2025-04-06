document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const chatMessages = document.getElementById('english-chat-messages');
    const questionInput = document.getElementById('english-question-input');
    const sendButton = document.getElementById('send-english-question');
    const topicCards = document.querySelectorAll('.topic-card');
    
    // 存储聊天历史
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的英语教学助手，擅长回答关于英语语法、词汇、文学和写作的问题。提供清晰、准确且有教育意义的回答。根据用户的英语水平调整回答的复杂度。鼓励学习者思考并提供有用的例子。对于语法问题，解释规则并给出示例；对于词汇问题，提供定义、用法和例句；对于文学分析，讨论主题、风格和解释；对于写作建议，提供结构和技巧指导。"
        },
        {
            "role": "assistant",
            "content": "你好！我是你的DeepSeek英语助手。今天我能如何帮助你提高英语技能？"
        }
    ];
    
    // 教育水平相关
    let educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
    
    // 当前选择的主题
    let currentTopic = null;
    
    // 监听发送按钮点击
    sendButton.addEventListener('click', sendMessage);
    
    // 监听输入框回车事件
    questionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 为主题卡片添加点击事件
    topicCards.forEach(card => {
        card.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            setTopic(topic);
            
            // 高亮选中的主题卡片
            topicCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // 滚动到聊天部分
            document.querySelector('.ai-assistant-section').scrollIntoView({ behavior: 'smooth' });
            
            // 聚焦到输入框
            questionInput.focus();
        });
    });
    
    // 从页面加载时初始化聊天界面
    initializeChat();
    
    // 初始化聊天界面
    function initializeChat() {
        // 清空聊天区域
        chatMessages.innerHTML = '';
        
        // 显示聊天历史
        displayChatHistory();
        
        // 更新系统提示
        updateSystemPrompt();
        
        // 检测教育水平变化
        window.addEventListener('education-level-change', function(event) {
            educationLevel = event.detail.level;
            updateSystemPrompt();
        });
    }
    
    // 设置当前主题
    function setTopic(topic) {
        currentTopic = topic;
        updateSystemPrompt();
        
        // 添加话题引导消息
        let topicPrompt = "";
        
        switch(topic) {
            case 'grammar':
                topicPrompt = "我想学习英语语法。你能帮我解释一下基本的语法规则吗？";
                break;
            case 'vocabulary':
                topicPrompt = "我想扩展我的词汇量。请问你能给我推荐一些学习词汇的方法吗？";
                break;
            case 'literature':
                topicPrompt = "我对英语文学感兴趣。你能向我介绍一些经典作品和作者吗？";
                break;
            case 'writing':
                topicPrompt = "我想提高我的英语写作能力。有哪些写作技巧可以分享？";
                break;
            case 'comprehension':
                topicPrompt = "请问提高英语阅读理解能力有什么好方法？";
                break;
            case 'poetry':
                topicPrompt = "我对英语诗歌很感兴趣。能介绍一些常见的诗歌形式和结构吗？";
                break;
            default:
                return;
        }
        
        // 自动在输入框中填入主题相关问题
        questionInput.value = topicPrompt;
    }
    
    // 更新系统提示
    function updateSystemPrompt() {
        let levelSpecificPrompt = '';
        
        switch(educationLevel) {
            case 'elementary-school':
                levelSpecificPrompt = '用户是小学生，请使用简单、基础的英语概念进行解释，多用直观例子，避免复杂术语。';
                break;
            case 'middle-school':
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的英语概念，平衡简洁性和教育性。';
                break;
            case 'high-school':
                levelSpecificPrompt = '用户是高中生，可以讨论更复杂的英语概念，包括高级语法、修辞手法和文学分析。';
                break;
            default:
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的英语概念，平衡简洁性和教育性。';
        }
        
        // 添加主题特定提示
        let topicSpecificPrompt = '';
        
        if (currentTopic) {
            switch(currentTopic) {
                case 'grammar':
                    topicSpecificPrompt = '用户正在学习英语语法。请专注于解释语法规则、句子结构、动词时态、语态等概念，并提供清晰的例子。';
                    break;
                case 'vocabulary':
                    topicSpecificPrompt = '用户正在学习英语词汇。请专注于单词含义、同义词、反义词、词根词缀、词汇记忆方法等，并提供示例句子。';
                    break;
                case 'literature':
                    topicSpecificPrompt = '用户正在学习英语文学。请专注于文学作品、作者、文学流派、分析技巧、主题和风格等概念。';
                    break;
                case 'writing':
                    topicSpecificPrompt = '用户正在学习英语写作。请专注于写作技巧、文章结构、段落组织、修辞手法和写作类型等概念。';
                    break;
                case 'comprehension':
                    topicSpecificPrompt = '用户正在学习英语阅读理解。请专注于阅读策略、推断、理解主旨、找出细节和批判性思考等概念。';
                    break;
                case 'poetry':
                    topicSpecificPrompt = '用户正在学习英语诗歌。请专注于诗歌形式、韵律、韵脚、诗歌术语和解读技巧等概念。';
                    break;
                default:
                    topicSpecificPrompt = '';
            }
        }
        
        // 更新系统消息
        chatHistory[0].content = "你是一个专业的英语教学助手，擅长回答关于英语语法、词汇、文学和写作的问题。提供清晰、准确且有教育意义的回答。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 鼓励学习者思考并提供有用的例子。对于语法问题，解释规则并给出示例；对于词汇问题，提供定义、用法和例句；对于文学分析，讨论主题、风格和解释；对于写作建议，提供结构和技巧指导。";
    }
    
    // 显示聊天历史
    function displayChatHistory() {
        chatHistory.forEach(message => {
            if (message.role === 'assistant' || message.role === 'user') {
                displayMessage(message.role, message.content);
            }
        });
        
        // 滚动到底部
        scrollToBottom();
    }
    
    // 发送消息到API
    async function sendMessage() {
        const userMessage = questionInput.value.trim();
        
        // 检查是否为空消息
        if (userMessage === '') return;
        
        // 清空输入框
        questionInput.value = '';
        
        // 显示用户消息
        displayMessage('user', userMessage);
        
        // 添加到聊天历史
        chatHistory.push({
            "role": "user",
            "content": userMessage
        });
        
        // 显示加载状态
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message message-ai loading';
        loadingMessage.innerHTML = '<p>思考中...</p>';
        chatMessages.appendChild(loadingMessage);
        scrollToBottom();
        
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
            displayMessage('assistant', aiResponse);
            
            // 添加到聊天历史
            chatHistory.push({
                "role": "assistant",
                "content": aiResponse
            });
            
        } catch (error) {
            console.error("Error getting AI response:", error);
            
            // 移除加载消息
            chatMessages.removeChild(loadingMessage);
            
            // 显示错误消息
            displayMessage('assistant', '抱歉，我遇到了问题。请稍后再试。' + error.message);
        }
    }
    
    // 显示消息在聊天界面
    function displayMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = role === 'user' ? 'message message-user' : 'message message-ai';
        
        // 处理内容中可能的换行
        const formattedContent = content.replace(/\n/g, '<br>');
        messageDiv.innerHTML = `<p>${formattedContent}</p>`;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 添加加载动画CSS
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

    // 添加新函数 - 分析写作
    async function analyzeWriting() {
        const writingInput = document.getElementById('writing-input').value.trim();
        const writingType = document.getElementById('writing-type').value;
        const focusArea = document.getElementById('writing-focus').value;
        const writingFeedback = document.getElementById('writing-feedback');
        
        if (writingInput.length < 20) {
            writingFeedback.innerHTML = '<p class="error">请输入更多文本以获得有意义的分析（至少20个字符）。</p>';
            return;
        }
        
        // 显示加载
        writingFeedback.innerHTML = '<p class="loading">正在分析您的写作...</p>';
        
        try {
            // 构建系统消息
            const systemMessage = `你是一个专业的英语写作分析助手。请分析以下${getWritingTypeName(writingType)}写作文本，并专注于${getFocusAreaName(focusArea)}方面的分析。提供清晰、有建设性的反馈，包括优点和可以改进的地方。根据用户的教育水平(${getEducationLevelName(educationLevel)})调整反馈的复杂度。`;
            
            // 构建用户消息
            const userPrompt = `请分析这段${getWritingTypeName(writingType)}写作，重点关注${getFocusAreaName(focusArea)}：\n\n${writingInput}`;
            
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
            
            // 调用API
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
            
            // 处理并显示分析结果
            let feedbackHtml = '<div class="writing-analysis">';
            feedbackHtml += '<h3>写作分析</h3>';
            feedbackHtml += formatWritingFeedback(aiResponse, writingInput);
            feedbackHtml += '</div>';
            
            writingFeedback.innerHTML = feedbackHtml;
            
            // 为详细建议按钮添加事件监听器，如果存在
            const detailedSuggestionsBtn = document.getElementById('detailed-suggestions');
            if (detailedSuggestionsBtn) {
                detailedSuggestionsBtn.addEventListener('click', function() {
                    alert('详细分析已经提供。如需更多帮助，请在聊天框中提问。');
                });
            }
            
        } catch (error) {
            console.error("Error analyzing writing:", error);
            writingFeedback.innerHTML = '<p class="error">分析过程中出现错误: ' + error.message + '</p>';
        }
    }
    
    // 加载诗歌功能
    async function loadPoem() {
        const period = document.getElementById('poetry-period').value;
        const style = document.getElementById('poetry-style').value;
        const poemDisplay = document.getElementById('poem-display');
        
        // 显示加载
        poemDisplay.innerHTML = '<p class="loading">正在加载诗歌...</p>';
        
        try {
            // 构建系统消息
            const systemMessage = `你是一个专业的诗歌专家。请生成一首${getPeriodName(period)}时期的${getStyleName(style)}诗歌，并提供详细分析。分析应包括诗歌的结构、韵律、主题、象征意义和文学手法。根据用户的教育水平(${getEducationLevelName(educationLevel)})调整分析的复杂度。`;
            
            // 构建用户消息
            const userPrompt = `请提供一首${getPeriodName(period)}时期的${getStyleName(style)}诗歌，并进行详细分析。`;
            
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
            
            // 调用API
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
            
            // 处理并显示诗歌结果
            let poemHtml = '<div class="poem-analysis">';
            poemHtml += formatPoemResponse(aiResponse);
            poemHtml += '</div>';
            
            poemDisplay.innerHTML = poemHtml;
            
        } catch (error) {
            console.error("Error loading poem:", error);
            poemDisplay.innerHTML = '<p class="error">加载诗歌时出现错误: ' + error.message + '</p>';
        }
    }
    
    // 生成词汇功能
    async function generateVocabulary() {
        const level = document.getElementById('vocab-level').value;
        const category = document.getElementById('vocab-category').value;
        const vocabContainer = document.getElementById('vocab-container');
        
        // 显示加载
        vocabContainer.innerHTML = '<p class="loading">正在生成词汇列表...</p>';
        
        try {
            // 构建系统消息
            const systemMessage = `你是一个专业的英语词汇教学助手。请生成一个包含10个${getLevelName(level)}难度的${getCategoryName(category)}词汇列表。对每个单词，提供：1) 英文单词，2) 中文定义，3) 一个使用该单词的例句（附中文翻译）。根据用户的教育水平(${getEducationLevelName(educationLevel)})调整词汇和解释的复杂度。`;
            
            // 构建用户消息
            const userPrompt = `请生成10个${getLevelName(level)}难度的${getCategoryName(category)}词汇，包含定义和例句。`;
            
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
            
            // 调用API
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
            
            // 处理并显示词汇结果
            let html = '<div class="vocab-list">';
            html += formatVocabularyResponse(aiResponse, level, category);
            html += '</div>';
            
            vocabContainer.innerHTML = html;
            
            // 为新按钮添加事件监听器
            const moreWordsBtn = document.getElementById('more-words');
            if (moreWordsBtn) {
                moreWordsBtn.addEventListener('click', generateVocabulary);
            }
            
            // 为保存按钮添加事件监听器
            document.querySelectorAll('.save-word').forEach(button => {
                button.addEventListener('click', function() {
                    this.innerHTML = '已保存 ✓';
                    this.disabled = true;
                });
            });
            
        } catch (error) {
            console.error("Error generating vocabulary:", error);
            vocabContainer.innerHTML = '<p class="error">生成词汇时出现错误: ' + error.message + '</p>';
        }
    }
    
    // 辅助函数 - 格式化写作反馈
    function formatWritingFeedback(response, originalText) {
        // 简单实现 - 在实际应用中可以更复杂地解析AI响应
        let html = '';
        
        // 尝试从响应中提取部分
        const sections = response.split('\n\n');
        
        // 整体评估
        html += `
            <div class="feedback-section">
                <h4>整体评估</h4>
                <div class="feedback-meter">
                    <div class="meter-fill" style="width: 75%"></div>
                </div>
                <p>${sections[0] || response.substring(0, 150)}</p>
            </div>
        `;
        
        // 提取优势和改进领域 (如果存在)
        const strengthsIdx = response.indexOf('优势') !== -1 ? response.indexOf('优势') : response.indexOf('Strengths');
        const improvementsIdx = response.indexOf('改进') !== -1 ? response.indexOf('改进') : response.indexOf('Improvements');
        
        if (strengthsIdx !== -1) {
            const strengthsText = response.substring(strengthsIdx, improvementsIdx !== -1 ? improvementsIdx : response.length);
            const strengthsList = extractListItems(strengthsText);
            
            html += `
                <div class="feedback-section">
                    <h4>优势</h4>
                    <ul>
                        ${strengthsList.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (improvementsIdx !== -1) {
            const improvementsText = response.substring(improvementsIdx);
            const improvementsList = extractListItems(improvementsText);
            
            html += `
                <div class="feedback-section">
                    <h4>改进领域</h4>
                    <ul>
                        ${improvementsList.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // 原文高亮
        html += `
            <div class="feedback-section">
                <h4>高亮文本</h4>
                <div class="highlighted-text">
                    ${originalText.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <button class="btn btn-primary" id="detailed-suggestions">获取详细建议</button>
        `;
        
        return html;
    }
    
    // 辅助函数 - 格式化诗歌响应
    function formatPoemResponse(response) {
        // 简单实现 - 在实际应用中可以更复杂地解析AI响应
        
        // 尝试提取诗歌标题和正文
        const titleMatch = response.match(/["'](.+?)["']|#+\s*(.+?)\n/);
        const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : '诗歌';
        
        // 尝试提取诗歌正文 - 寻找缩进或引用块
        let poemText = '';
        const lines = response.split('\n');
        let inPoem = false;
        let poemLines = [];
        
        for (const line of lines) {
            if (line.trim().startsWith('>') || line.trim().startsWith('    ') || line.includes('　　')) {
                inPoem = true;
                poemLines.push(line.replace(/^>\s*|^    /, ''));
            } else if (inPoem && line.trim() === '') {
                poemLines.push('');
            } else if (inPoem) {
                inPoem = false;
                break;
            }
        }
        
        // 如果没有找到明确格式的诗歌，尝试查找第一个空行前的内容
        if (poemLines.length === 0) {
            const firstEmptyLineIdx = lines.findIndex(line => line.trim() === '');
            if (firstEmptyLineIdx > 0) {
                poemLines = lines.slice(0, firstEmptyLineIdx);
            } else {
                // 作为后备，使用响应的前几行
                poemLines = lines.slice(0, Math.min(10, lines.length));
            }
        }
        
        poemText = poemLines.join('\n');
        
        // 分析部分
        const analysisIdx = response.indexOf('分析');
        const analysisText = analysisIdx !== -1 ? 
            response.substring(analysisIdx) : 
            response.substring(poemText.length + title.length + 10); // 估计位置
        
        let html = `
            <div class="poem-text">
                <h3>"${title}"</h3>
                <pre>${poemText}</pre>
            </div>
            <div class="poem-breakdown">
                <h4>分析</h4>
                <p>${analysisText.split('\n\n')[0] || analysisText.substring(0, 200)}</p>
        `;
        
        // 尝试提取文学手法和主题
        const techniquesIdx = analysisText.indexOf('手法') !== -1 ? 
            analysisText.indexOf('手法') : 
            analysisText.indexOf('Techniques');
            
        const themesIdx = analysisText.indexOf('主题') !== -1 ? 
            analysisText.indexOf('主题') : 
            analysisText.indexOf('Themes');
        
        if (techniquesIdx !== -1) {
            const techniquesText = analysisText.substring(techniquesIdx, themesIdx !== -1 ? themesIdx : analysisText.length);
            const techniquesList = extractListItems(techniquesText);
            
            html += `
                <h4>文学手法</h4>
                <ul>
                    ${techniquesList.map(item => `<li>${item}</li>`).join('')}
                </ul>
            `;
        }
        
        if (themesIdx !== -1) {
            const themesText = analysisText.substring(themesIdx);
            const themesList = extractListItems(themesText);
            
            html += `
                <h4>关键主题</h4>
                <ul>
                    ${themesList.map(item => `<li>${item}</li>`).join('')}
                </ul>
            `;
        }
        
        html += `</div>`;
        return html;
    }
    
    // 辅助函数 - 格式化词汇响应
    function formatVocabularyResponse(response, level, category) {
        // 提取单词列表
        const words = extractWords(response);
        
        let levelName, categoryName;
        
        // 翻译难度等级
        switch(level) {
            case 'elementary': levelName = '初级'; break;
            case 'intermediate': levelName = '中级'; break;
            case 'advanced': levelName = '高级'; break;
            case 'academic': levelName = '学术'; break;
            default: levelName = level;
        }
        
        // 翻译类别
        switch(category) {
            case 'general': categoryName = '通用词汇'; break;
            case 'academic': categoryName = '学术词汇'; break;
            case 'literature': categoryName = '文学术语'; break;
            case 'idioms': categoryName = '习语和短语'; break;
            default: categoryName = category;
        }
        
        let html = `<h3>${levelName}${categoryName}</h3>`;
        
        words.forEach(word => {
            html += `
                <div class="vocab-card">
                    <h4>${word.word}</h4>
                    <p class="definition"><strong>定义:</strong> ${word.definition}</p>
                    <p class="example"><strong>示例:</strong> <em>${word.example}</em></p>
                    <button class="btn btn-small btn-secondary save-word">保存到我的列表</button>
                </div>
            `;
        });
        
        html += `
            <div class="vocab-actions">
                <button class="btn btn-primary" id="more-words">加载更多词汇</button>
                <button class="btn btn-secondary" id="practice-vocab">练习这些词汇</button>
            </div>
        `;
        
        return html;
    }
    
    // 辅助函数 - 提取列表项
    function extractListItems(text) {
        const lines = text.split('\n');
        const listItems = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            // 匹配列表格式（以-、*、数字.或中文数字开头）
            if (trimmed.match(/^[-*•]|^\d+\.|^[一二三四五六七八九十]+[、.]|^[（(]\d+[)）]/)) {
                listItems.push(trimmed.replace(/^[-*•]|^\d+\.|^[一二三四五六七八九十]+[、.]|^[（(]\d+[)）]/, '').trim());
            }
        }
        
        // 如果没有找到明确的列表，尝试分割段落
        if (listItems.length === 0) {
            const paragraphs = text.split('\n\n');
            return paragraphs.slice(0, Math.min(5, paragraphs.length)).map(p => p.trim());
        }
        
        return listItems.length > 0 ? listItems : ['没有找到具体条目'];
    }
    
    // 辅助函数 - 从响应中提取单词
    function extractWords(response) {
        // 这是一个简化的实现，实际应用中可能需要更复杂的解析
        const lines = response.split('\n');
        const words = [];
        let currentWord = null;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // 新单词（数字+点 或 粗体文本 开头）
            if (trimmed.match(/^\d+\.\s+\*\*(.+?)\*\*/) || trimmed.match(/^\d+\.\s+(.+?)[\s:：]/)) {
                if (currentWord) words.push(currentWord);
                
                const wordMatch = trimmed.match(/^\d+\.\s+\*\*(.+?)\*\*/) || trimmed.match(/^\d+\.\s+(.+?)[\s:：]/);
                const word = wordMatch ? wordMatch[1] : trimmed.split(/[\s:：]/)[0];
                
                currentWord = {
                    word: word,
                    definition: '',
                    example: ''
                };
                
                // 尝试从同一行提取定义
                const defMatch = trimmed.match(/[定义释意]*[:：]\s*(.+)/);
                if (defMatch) {
                    currentWord.definition = defMatch[1];
                }
            } 
            // 定义行
            else if (currentWord && (trimmed.includes('定义') || trimmed.includes('释义') || trimmed.match(/^[\-\*•]?\s*[定义释意]*[:：]/))) {
                const defMatch = trimmed.match(/[定义释意]*[:：]\s*(.+)/);
                if (defMatch) {
                    currentWord.definition = defMatch[1];
                } else {
                    currentWord.definition = trimmed.replace(/^[\-\*•]?\s*/, '');
                }
            } 
            // 例句行
            else if (currentWord && (trimmed.includes('例句') || trimmed.includes('示例') || trimmed.match(/^[\-\*•]?\s*[例句示例]*[:：]/))) {
                const exampleMatch = trimmed.match(/[例句示例]*[:：]\s*(.+)/);
                if (exampleMatch) {
                    currentWord.example = exampleMatch[1];
                } else {
                    currentWord.example = trimmed.replace(/^[\-\*•]?\s*/, '');
                }
            }
            // 空行，表示当前单词处理完毕
            else if (trimmed === '' && currentWord) {
                words.push(currentWord);
                currentWord = null;
            }
        }
        
        // 添加最后一个单词，如果有的话
        if (currentWord) {
            words.push(currentWord);
        }
        
        // 如果没有成功提取单词，返回示例单词
        if (words.length === 0) {
            return [
                { word: 'Eloquent', definition: '口齿流利或有说服力的', example: 'She gave an eloquent speech that moved the audience.（她发表了一场感人的演讲，打动了观众。）' },
                { word: 'Meticulous', definition: '非常细心；非常仔细和精确', example: 'He was meticulous in his research, checking every fact twice.（他在研究中非常细致，每个事实都核对两次。）' },
                { word: 'Ambiguous', definition: '可作多种理解的；有双重含义的', example: 'The poem\'s ambiguous ending has been debated by scholars for decades.（这首诗模糊的结尾已被学者们讨论了几十年。）' },
                { word: 'Benevolent', definition: '善意的；亲切的', example: 'The benevolent organization provided food and shelter to those in need.（这个慈善组织为有需要的人提供食物和住所。）' },
                { word: 'Rhetoric', definition: '修辞；有效或有说服力的演讲或写作的艺术', example: 'The politician was known for his powerful rhetoric during debates.（这位政治家以在辩论中有力的修辞而闻名。）' }
            ];
        }
        
        return words;
    }
    
    // 辅助函数 - 获取写作类型名称（中文）
    function getWritingTypeName(type) {
        switch(type) {
            case 'essay': return '学术论文';
            case 'creative': return '创意写作';
            case 'report': return '报告';
            case 'letter': return '信件/邮件';
            default: return type;
        }
    }
    
    // 辅助函数 - 获取重点领域名称（中文）
    function getFocusAreaName(area) {
        switch(area) {
            case 'grammar': return '语法和技巧';
            case 'structure': return '结构和组织';
            case 'style': return '风格和语调';
            case 'overall': return '整体改进';
            default: return area;
        }
    }
    
    // 辅助函数 - 获取诗歌时代名称（中文）
    function getPeriodName(period) {
        switch(period) {
            case 'renaissance': return '文艺复兴';
            case 'romantic': return '浪漫主义';
            case 'victorian': return '维多利亚';
            case 'modern': return '现代';
            case 'contemporary': return '当代';
            default: return period;
        }
    }
    
    // 辅助函数 - 获取诗歌风格名称（中文）
    function getStyleName(style) {
        switch(style) {
            case 'sonnet': return '十四行诗';
            case 'haiku': return '俳句';
            case 'ode': return '颂诗';
            case 'freeverse': return '自由诗';
            case 'narrative': return '叙事诗';
            default: return style;
        }
    }
    
    // 辅助函数 - 获取词汇级别名称（中文）
    function getLevelName(level) {
        switch(level) {
            case 'elementary': return '初级';
            case 'intermediate': return '中级';
            case 'advanced': return '高级';
            case 'academic': return '学术';
            default: return level;
        }
    }
    
    // 辅助函数 - 获取词汇类别名称（中文）
    function getCategoryName(category) {
        switch(category) {
            case 'general': return '通用词汇';
            case 'academic': return '学术词汇';
            case 'literature': return '文学术语';
            case 'idioms': return '习语和短语';
            default: return category;
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
    
    // 添加事件监听器
    document.addEventListener('DOMContentLoaded', function() {
        // 分析写作按钮
        const analyzeWritingButton = document.getElementById('analyze-writing');
        if (analyzeWritingButton) {
            analyzeWritingButton.addEventListener('click', analyzeWriting);
        }
        
        // 加载诗歌按钮
        const loadPoemButton = document.getElementById('load-poem');
        if (loadPoemButton) {
            loadPoemButton.addEventListener('click', loadPoem);
        }
        
        // 生成词汇按钮
        const generateVocabButton = document.getElementById('generate-vocab');
        if (generateVocabButton) {
            generateVocabButton.addEventListener('click', generateVocabulary);
        }
    });
}); 