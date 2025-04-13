document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const chatMessages = document.getElementById('english-chat-messages');
    const questionInput = document.getElementById('english-question-input');
    const sendButton = document.getElementById('send-english-question');
    const topicCards = document.querySelectorAll('.topic-card');
    
    console.log("DOM loaded, setting up English subject page event listeners");
    
    // 分析写作按钮
    const analyzeWritingButton = document.getElementById('analyze-writing');
    console.log("analyze-writing button found:", !!analyzeWritingButton);
    if (analyzeWritingButton) {
        analyzeWritingButton.addEventListener('click', function() {
            console.log("analyze-writing button clicked");
            analyzeWriting();
        });
    }
    
    // 加载诗歌按钮
    const loadPoemButton = document.getElementById('load-poem');
    console.log("load-poem button found:", !!loadPoemButton);
    if (loadPoemButton) {
        loadPoemButton.addEventListener('click', function() {
            console.log("load-poem button clicked");
            loadPoem();
        });
    }
    
    // 生成词汇按钮
    const generateVocabButton = document.getElementById('generate-vocab');
    console.log("generate-vocab button found:", !!generateVocabButton);
    if (generateVocabButton) {
        generateVocabButton.addEventListener('click', function() {
            console.log("generate-vocab button clicked");
            generateVocabulary();
        });
    }
    
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
            const systemMessage = `你是一个专业的英语写作分析助手。请分析以下${getWritingTypeName(writingType)}写作文本，并专注于${getFocusAreaName(focusArea)}方面的分析。提供清晰、有建设性的反馈，包括优点和可以改进的地方。
            作为专业的英语教师，请提供改进后的完整文本版本，确保修正所有错误并提升整体质量。
            根据用户的教育水平(${getEducationLevelName(educationLevel)})调整反馈的复杂度。`;
            
            // 构建用户消息
            const userPrompt = `请分析这段${getWritingTypeName(writingType)}写作，重点关注${getFocusAreaName(focusArea)}：\n\n${writingInput}\n\n请提供详细的反馈，包括优点和改进建议，并提供一个改进后的完整版本。`;
            
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
            
            console.log("Writing analysis response:", aiResponse);
            
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
                    const correctedTextEl = document.getElementById('corrected-text-container');
                    if (correctedTextEl) {
                        correctedTextEl.style.display = correctedTextEl.style.display === 'none' ? 'block' : 'none';
                        this.textContent = correctedTextEl.style.display === 'none' ? '查看修改后文本' : '隐藏修改后文本';
                    } else {
                        alert('详细分析已经提供。如需更多帮助，请在聊天框中提问。');
                    }
                });
            }
            
        } catch (error) {
            console.error("Error analyzing writing:", error);
            writingFeedback.innerHTML = '<p class="error">分析过程中出现错误: ' + error.message + '</p>';
        }
    }
    
    // 辅助函数 - 格式化写作反馈
    function formatWritingFeedback(response, originalText) {
        console.log("Formatting writing feedback:", response);
        
        // 简单实现 - 在实际应用中可以更复杂地解析AI响应
        let html = '';
        
        // 尝试提取修改后的文本
        let correctedText = '';
        const correctedTextIndicators = [
            '修改后的文本', '改进后的文本', '修改版本', '修正后的文本', 
            '修改建议', '改进版本', 'Corrected Version', 'Improved Version',
            '修改后:', '改进后:', '修正后:'
        ];
        
        for (const indicator of correctedTextIndicators) {
            const idx = response.indexOf(indicator);
            if (idx !== -1) {
                // 找到指示词后的文本
                const textAfter = response.substring(idx + indicator.length);
                // 找到下一个标题或分段
                const nextSectionMatch = textAfter.match(/\n\s*#|\n\s*\*\*|\n\s*优点|\n\s*优势|\n\s*改进|\n\s*conclusion/i);
                
                if (nextSectionMatch) {
                    correctedText = textAfter.substring(0, nextSectionMatch.index).trim();
                } else {
                    // 如果没有找到明确的下一节，就使用剩余的文本
                    correctedText = textAfter.trim();
                }
                
                // 清理一下可能的冒号
                correctedText = correctedText.replace(/^[:：]\s*/, '').trim();
                
                // 如果提取到了内容，就跳出循环
                if (correctedText) break;
            }
        }
        
        // 如果没有找到明确的修改后文本部分，尝试提取引用块或代码块
        if (!correctedText) {
            const blockMatch = response.match(/```(.+?)```|~~~(.+?)~~~|>(.+?)(?:\n\n|\n$)/s);
            if (blockMatch) {
                correctedText = (blockMatch[1] || blockMatch[2] || blockMatch[3]).trim();
            }
        }
        
        console.log("Extracted corrected text:", correctedText);
        
        // 尝试从响应中提取部分
        const sections = response.split(/\n\n+/);
        
        // 整体评估 - 使用第一段
        let overallAssessment = sections[0] || '';
        
        // 如果第一段很短，可能是标题，使用第二段
        if (overallAssessment.length < 20 && sections.length > 1) {
            overallAssessment = sections[1];
        }
        
        html += `
            <div class="feedback-section">
                <h4>整体评估</h4>
                <div class="feedback-meter">
                    <div class="meter-fill" style="width: 75%"></div>
                </div>
                <p>${overallAssessment}</p>
            </div>
        `;
        
        // 提取优势和改进领域
        const strengthsKeywords = ['优点', '优势', '长处', 'Strengths', 'Positive Aspects'];
        const improvementsKeywords = ['改进', '不足', '缺点', '弱点', 'Improvements', 'Areas for Improvement'];
        
        let strengthsIdx = -1;
        let improvementsIdx = -1;
        
        // 寻找优势部分
        for (const keyword of strengthsKeywords) {
            const idx = response.indexOf(keyword);
            if (idx !== -1) {
                strengthsIdx = idx;
                break;
            }
        }
        
        // 寻找改进部分
        for (const keyword of improvementsKeywords) {
            const idx = response.indexOf(keyword);
            if (idx !== -1) {
                improvementsIdx = idx;
                break;
            }
        }
        
        if (strengthsIdx !== -1) {
            const endIdx = improvementsIdx !== -1 ? improvementsIdx : response.length;
            const strengthsText = response.substring(strengthsIdx, endIdx);
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
            const startIdx = improvementsIdx;
            let endIdx = response.length;
            
            // 寻找修改后的文本部分的开始，作为改进部分的结束
            for (const indicator of correctedTextIndicators) {
                const idx = response.indexOf(indicator);
                if (idx !== -1 && idx > improvementsIdx && idx < endIdx) {
                    endIdx = idx;
                    break;
                }
            }
            
            const improvementsText = response.substring(startIdx, endIdx);
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
                <h4>原文</h4>
                <div class="highlighted-text">
                    ${originalText.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        
        // 修改后的文本，默认隐藏
        if (correctedText) {
            html += `
                <div class="feedback-section">
                    <button class="btn btn-primary" id="detailed-suggestions">查看修改后文本</button>
                    <div id="corrected-text-container" style="display: none; margin-top: 15px;">
                        <h4>修改后的文本</h4>
                        <div class="corrected-text highlighted-text">
                            ${correctedText.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <button class="btn btn-primary" id="detailed-suggestions">获取详细建议</button>
            `;
        }
        
        return html;
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
        
        if (!vocabContainer) return;
        
        // 显示加载状态
        vocabContainer.innerHTML = '<p class="loading">正在生成词汇中...</p>';
        
        try {
            // 构建prompt
            const prompt = `请生成10个${getLevelName(level)}难度的${getCategoryName(category)}英语单词，并提供以下信息：
1. 单词拼写
2. 音标
3. 词性
4. 中文定义
5. 2-3个常用词组或搭配
6. 2个使用该单词的例句
7. 同义词和反义词（如果有）
8. 记忆技巧或词源解释

请以下面的格式返回结果，确保每个单词的信息完整且格式规范：

1. **单词一**
   - 音标: [音标]
   - 词性: 词性
   - 释义: 中文定义
   - 常用词组:
     - 词组1
     - 词组2
   - 例句:
     - 例句1
     - 例句2
   - 近义词/反义词: 同义词和反义词
   - 记忆提示: 记忆技巧

2. **单词二**
   ...

确保每个单词的信息完整，例句实用，并且适合${getLevelName(level)}水平的学习者。`;
            
            console.log("Sending vocabulary generation prompt:", prompt);
            
            // 调用API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            "role": "system",
                            "content": "你是一个专业的英语词汇教学助手，精通英语词汇、语法和使用。请严格按照指定格式返回单词信息，确保每一项信息都有明确的标记和分类。"
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                throw new Error(`网络响应不正常: ${response.status}`);
            }
            
            const data = await response.json();
            const result = data.choices[0].message.content;
            
            console.log("Raw API response:", result);
            
            // 格式化并显示结果
            const formattedHtml = formatVocabularyResponse(result, level, category);
            vocabContainer.innerHTML = formattedHtml;
            
            // 初始化词汇轮播
            setTimeout(() => {
                // 给DOM有时间完成渲染
                initVocabCarousel();
            }, 100);
            
        } catch (error) {
            console.error('生成词汇时出错:', error);
            vocabContainer.innerHTML = `
                <div class="vocab-error">
                    <h3>生成词汇失败</h3>
                    <p>抱歉，生成词汇时出现错误。</p>
                    <p class="error-details">${error.message}</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="generateVocabulary()">重试</button>
                    </div>
                    <style>
                        .vocab-error {
                            text-align: center;
                            background: #fff;
                            border-radius: 10px;
                            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
                            padding: 2rem;
                            margin: 2rem auto;
                            max-width: 600px;
                        }
                        .vocab-error h3 {
                            color: #e63946;
                            margin-bottom: 1rem;
                        }
                        .error-details {
                            color: #666;
                            font-size: 0.9rem;
                            margin: 1rem 0;
                            background: #f8f9fa;
                            padding: 0.5rem;
                            border-radius: 4px;
                        }
                        .error-actions {
                            margin-top: 1.5rem;
                        }
                    </style>
                </div>
            `;
        }
    }
    
    // 辅助函数 - 从用户配置文件获取教育水平
    function getEducationLevelFromProfile(profileText) {
        if (!profileText) return '中学生';
        
        if (profileText.includes('小学')) return '小学生';
        if (profileText.includes('初中')) return '初中生';
        if (profileText.includes('高中')) return '高中生';
        if (profileText.includes('大学')) return '大学生';
        
        return '中学生'; // 默认为中学生
    }
    
    // 辅助函数 - 格式化诗歌响应
    function formatPoemResponse(response) {
        console.log("Formatting poem response:", response);
        
        // 尝试提取诗歌标题和正文
        const titleMatch = response.match(/["'](.+?)["']|[#]+\s*(.+?)[\n\r]/);
        const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : '诗歌';
        console.log("Extracted title:", title);
        
        // 尝试提取诗歌正文 - 多种可能的格式
        let poemLines = [];
        let foundPoem = false;
        
        const lines = response.split(/\n/);
        
        // 尝试方法1: 寻找引用块或缩进
        let inPoem = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('>') || trimmed.startsWith('    ') || trimmed.includes('　　')) {
                inPoem = true;
                foundPoem = true;
                poemLines.push(line.replace(/^>\s*|^    /, ''));
            } else if (inPoem && trimmed === '') {
                poemLines.push('');
            } else if (inPoem && trimmed) {
                inPoem = false;
            }
        }
        
        // 尝试方法2: 寻找代码块
        if (!foundPoem) {
            let inCodeBlock = false;
            for (const line of lines) {
                if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
                    inCodeBlock = !inCodeBlock;
                    foundPoem = true;
                    continue;
                }
                if (inCodeBlock) {
                    poemLines.push(line);
                }
            }
        }
        
        // 尝试方法3: 在标题之后和第一个空行之前的内容
        if (!foundPoem && titleMatch) {
            let titleIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(title)) {
                    titleIndex = i;
                    break;
                }
            }
            
            if (titleIndex >= 0) {
                let i = titleIndex + 1;
                while (i < lines.length && lines[i].trim() === '') i++; // 跳过空行
                
                // 收集诗歌行，直到遇到空行+非空行的模式（可能是分析的开始）
                for (; i < lines.length; i++) {
                    if (lines[i].trim() === '') {
                        // 检查下一行是否是分析的开始
                        if (i + 1 < lines.length && 
                            (lines[i+1].includes('分析') || 
                             lines[i+1].includes('解析') || 
                             lines[i+1].includes('解读') ||
                             lines[i+1].includes('主题') ||
                             lines[i+1].includes('作者'))) {
                            break;
                        }
                    }
                    poemLines.push(lines[i]);
                }
                
                if (poemLines.length > 0) foundPoem = true;
            }
        }
        
        // 尝试方法4: 找到第一个空行和第二个空行之间的内容
        if (!foundPoem) {
            let firstEmptyLine = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() === '') {
                    firstEmptyLine = i;
                    break;
                }
            }
            
            if (firstEmptyLine > 0) {
                let secondEmptyLine = -1;
                for (let i = firstEmptyLine + 1; i < lines.length; i++) {
                    if (lines[i].trim() === '') {
                        secondEmptyLine = i;
                        break;
                    }
                }
                
                if (secondEmptyLine > firstEmptyLine) {
                    poemLines = lines.slice(firstEmptyLine + 1, secondEmptyLine);
                    if (poemLines.length > 0) foundPoem = true;
                }
            }
        }
        
        // 后备方法: 使用响应的前几行
        if (!foundPoem || poemLines.length === 0) {
            // 找到第一个非空行开始
            let startLine = 0;
            while (startLine < lines.length && lines[startLine].trim() === '') startLine++;
            
            // 找到第一个可能的"分析"或"解析"关键词位置
            let endLine = lines.length;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('分析') || lines[i].includes('解析') || lines[i].includes('解读') || lines[i].includes('主题')) {
                    endLine = i;
                    break;
                }
            }
            
            // 如果没有找到分析开始，使用前10行或前1/3的内容
            if (endLine === lines.length) {
                endLine = Math.min(startLine + 10, Math.floor(lines.length / 3));
            }
            
            poemLines = lines.slice(startLine, endLine);
        }
        
        // 清理诗歌行：移除行首的数字序号、移除markdown标记等
        poemLines = poemLines.map(line => {
            // 移除行号
            return line.replace(/^\d+[\.\)]?\s*/, '')
                       .replace(/^\*\*|\*\*$/g, '') // 移除粗体标记
                       .replace(/^_|_$/g, '');      // 移除斜体标记
        });
        
        // 移除空行
        while (poemLines.length > 0 && poemLines[0].trim() === '') poemLines.shift();
        while (poemLines.length > 0 && poemLines[poemLines.length - 1].trim() === '') poemLines.pop();
        
        const poemText = poemLines.join('\n');
        console.log("Extracted poem text:", poemText);
        
        // 分析部分
        let analysisText = '';
        const analysisKeywords = ['分析', '解析', '解读', '鉴赏', '主题'];
        
        // 查找分析部分的开始
        let analysisStartIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            for (const keyword of analysisKeywords) {
                if (lines[i].includes(keyword)) {
                    analysisStartIdx = i;
                    break;
                }
            }
            if (analysisStartIdx >= 0) break;
        }
        
        if (analysisStartIdx >= 0) {
            analysisText = lines.slice(analysisStartIdx).join('\n');
        } else {
            // 如果没有找到明确的分析部分，假设诗歌后面的内容都是分析
            const poemEndIdx = lines.findIndex(line => line.includes(poemLines[poemLines.length - 1]));
            if (poemEndIdx >= 0 && poemEndIdx < lines.length - 1) {
                analysisText = lines.slice(poemEndIdx + 1).join('\n');
            } else {
                // 后备方案，使用响应的后半部分作为分析
                analysisText = response.substring(Math.floor(response.length / 2));
            }
        }
        
        let html = `
            <div class="poem-text">
                <h3>"${title}"</h3>
                <pre>${poemText || '诗歌加载中...'}</pre>
            </div>
            <div class="poem-breakdown">
                <h4>分析</h4>
                <p>${analysisText.split('\n\n')[0] || analysisText.substring(0, 200) || '分析加载中...'}</p>
        `;
        
        // 尝试提取文学手法和主题
        const techniquesIdx = analysisText.indexOf('手法') !== -1 ? 
            analysisText.indexOf('手法') : 
            analysisText.indexOf('技巧');
            
        const themesIdx = analysisText.indexOf('主题') !== -1 ? 
            analysisText.indexOf('主题') : 
            (analysisText.indexOf('内容') !== -1 ? analysisText.indexOf('内容') : -1);
        
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
    
    // 辅助函数 - 格式化词汇响应，并设置轮播初始化触发器
    function formatVocabularyResponse(response, level, category) {
        // 提取单词列表
        const words = extractEnhancedWords(response);
        console.log("Extracted enhanced words:", words);
        
        // 如果没有提取到单词，显示错误信息
        if (words.length === 0) {
            return `
                <div class="vocab-error">
                    <h3>词汇提取失败</h3>
                    <p>抱歉，我们无法从响应中提取有效的词汇数据。</p>
                    <p>这可能是由于API返回的格式不正确或者响应内容不完整。</p>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="generateVocabulary()">重试</button>
                    </div>
                    <style>
                        .vocab-error {
                            text-align: center;
                            background: #fff;
                            border-radius: 10px;
                            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
                            padding: 2rem;
                            margin: 2rem auto;
                            max-width: 600px;
                        }
                        .vocab-error h3 {
                            color: #e63946;
                            margin-bottom: 1rem;
                        }
                        .error-actions {
                            margin-top: 1.5rem;
                        }
                    </style>
                </div>
            `;
        }
        
        // 直接设置轮播为未初始化状态
        window.vocabCarouselInitialized = false;
        window.vocabCarouselPending = true;
        
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
        
        let html = `
            <div class="vocab-container">
                <h3>${levelName}${categoryName}</h3>
                
                <div class="vocab-carousel">
                    <button class="vocab-nav vocab-prev" disabled>&lt;</button>
                    
                    <div class="vocab-cards-container">
                        <div class="vocab-cards-wrapper" data-current="0" data-total="${words.length}">
        `;
        
        // 为每个单词创建卡片
        words.forEach((word, index) => {
            html += `
                <div class="vocab-card enhanced" data-index="${index}">
                    <div class="vocab-header">
                        <h4>${word.word}</h4>
                        <div class="pronunciation">${word.pronunciation || ''}</div>
                    </div>
                    
                    <div class="vocab-content">
                        <div class="vocab-section">
                            <p class="part-of-speech">${word.partOfSpeech || ''}</p>
                            <p class="definition"><strong>释义:</strong> ${word.definition || '无定义'}</p>
                        </div>
                        
                        ${word.phrases ? `
                        <div class="vocab-section">
                            <p class="section-title"><strong>常用词组:</strong></p>
                            <ul class="phrases-list">
                                ${word.phrases.map(phrase => `<li>${phrase}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        ${word.examples && word.examples.length ? `
                        <div class="vocab-section">
                            <p class="section-title"><strong>例句:</strong></p>
                            <ul class="examples-list">
                                ${word.examples.map(ex => `<li>${ex}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        ${word.synonymsAntonyms ? `
                        <div class="vocab-section">
                            <p class="section-title"><strong>近反义词:</strong></p>
                            <p>${word.synonymsAntonyms}</p>
                        </div>
                        ` : ''}
                        
                        ${word.memoryTip ? `
                        <div class="vocab-section memory-tip">
                            <p class="section-title"><strong>记忆提示:</strong></p>
                            <p>${word.memoryTip}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="vocab-footer">
                        <button class="btn btn-small btn-secondary save-word">保存单词</button>
                        <button class="btn btn-small btn-outline vocab-practice">练习</button>
                    </div>
                </div>
            `;
        });
        
        html += `
                        </div>
                    </div>
                    
                    <button class="vocab-nav vocab-next" ${words.length > 1 ? '' : 'disabled'}>&gt;</button>
                </div>
                
                <div class="vocab-progress">
                    <span class="current-card">1</span> / <span class="total-cards">${words.length}</span>
                </div>
                
                <div class="vocab-actions">
                    <button class="btn btn-primary" id="more-words">更多词汇</button>
                    <button class="btn btn-secondary" id="practice-vocab">练习全部</button>
                </div>
            </div>
        `;
        
        // 添加样式
        html += `
            <style>
                .vocab-container {
                    position: relative;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .vocab-carousel {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px 0;
                    position: relative;
                    height: auto;
                    min-height: 400px;
                }
                
                .vocab-cards-container {
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                }
                
                .vocab-cards-wrapper {
                    position: relative;
                    width: 100%;
                    min-height: 400px;
                }
                
                .vocab-card.enhanced {
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
                    padding: 20px;
                    overflow-y: auto;
                    max-height: 500px;
                    transition: opacity 0.3s;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    display: none;
                    opacity: 0;
                }
                
                .vocab-card.enhanced.active {
                    display: block;
                    opacity: 1;
                    z-index: 2;
                }
                
                .vocab-nav {
                    background: #4361ee;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                    z-index: 10;
                }
                
                .vocab-nav:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .vocab-nav:hover:not(:disabled) {
                    background: #3a56d4;
                }
                
                .vocab-progress {
                    text-align: center;
                    margin: 10px 0;
                    font-size: 16px;
                }
                
                /* 词汇卡片样式 */
                .vocab-header {
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                
                .vocab-header h4 {
                    font-size: 1.8rem;
                    color: #4361ee;
                    margin: 0 0 5px 0;
                }
                
                .pronunciation {
                    color: #666;
                    font-size: 1.1rem;
                }
                
                .vocab-content {
                    padding-right: 5px;
                }
                
                .vocab-section {
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #f5f5f5;
                }
                
                .vocab-section:last-child {
                    border-bottom: none;
                }
                
                .part-of-speech {
                    display: inline-block;
                    padding: 2px 8px;
                    background: #f0f4ff;
                    border-radius: 4px;
                    margin: 0 0 8px 0;
                }
                
                .section-title {
                    margin-bottom: 8px;
                    color: #333;
                }
                
                .vocab-section ul {
                    margin: 0;
                    padding-left: 20px;
                }
                
                .vocab-section ul li {
                    margin-bottom: 8px;
                    line-height: 1.4;
                }
                
                .memory-tip {
                    background: #fffaf0;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 5px;
                }
                
                .vocab-footer {
                    margin-top: 20px;
                    display: flex;
                    justify-content: space-between;
                    border-top: 1px solid #eee;
                    padding-top: 15px;
                }
                
                /* 自定义滚动条 */
                .vocab-card.enhanced::-webkit-scrollbar {
                    width: 8px;
                }
                
                .vocab-card.enhanced::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .vocab-card.enhanced::-webkit-scrollbar-thumb {
                    background: #c5cbe8;
                    border-radius: 10px;
                }
                
                .vocab-card.enhanced::-webkit-scrollbar-thumb:hover {
                    background: #4361ee;
                }
                
                /* 移动设备适配 */
                @media (max-width: 768px) {
                    .vocab-carousel {
                        min-height: 500px;
                    }
                    
                    .vocab-card.enhanced {
                        max-height: 450px;
                        padding: 15px;
                    }
                    
                    .vocab-header h4 {
                        font-size: 1.5rem;
                    }
                }
            </style>
        `;
        
        return html;
    }
    
    // 辅助函数 - 从响应中提取增强的单词信息
    function extractEnhancedWords(response) {
        console.log("Extracting enhanced words from response:", response);
        
        const lines = response.split('\n');
        const words = [];
        let currentWord = null;
        
        // 用于匹配单词标题行的正则表达式
        const wordHeaderRegex = /^(?:\d+[\.\)]\s+)?(?:\*\*)?([A-Za-z\s\-']+)(?:\*\*)?/;
        
        // 匹配各种部分的正则表达式
        const pronunciationRegex = /(?:发音|音标|pronunciation)(?:：|:)\s*(\[.+?\])/i;
        const partOfSpeechRegex = /(?:词性|part of speech)(?:：|:)\s*(.+)/i;
        const definitionRegex = /(?:释义|定义|中文意思|meaning)(?:：|:)\s*(.+)/i;
        const phrasesStartRegex = /(?:常用词组|词组|搭配|phrases)(?:：|:)/i;
        const examplesStartRegex = /(?:例句|例子|示例|examples)(?:：|:)/i;
        const synonymsRegex = /(?:近义词|同义词|反义词|synonyms|antonyms)(?:：|:)\s*(.+)/i;
        const memoryTipRegex = /(?:记忆技巧|记忆提示|memory tip)(?:：|:)\s*(.+)/i;
        
        let inPhrases = false;
        let inExamples = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 跳过空行
            if (line === '') continue;
            
            // 检查是否是新单词的开始
            const wordMatch = line.match(wordHeaderRegex);
            if (wordMatch && (line.match(/^\d+[\.\)]/) || i === 0 || lines[i-1].trim() === '')) {
                // 保存前一个单词
                if (currentWord) {
                    words.push(currentWord);
                }
                
                // 创建新单词对象
                currentWord = {
                    word: wordMatch[1].trim(),
                    pronunciation: '',
                    partOfSpeech: '',
                    definition: '',
                    phrases: [],
                    examples: [],
                    synonymsAntonyms: '',
                    memoryTip: ''
                };
                
                // 检查本行是否包含其他信息
                const proMatch = line.match(pronunciationRegex);
                if (proMatch) {
                    currentWord.pronunciation = proMatch[1];
                }
                
                inPhrases = false;
                inExamples = false;
                continue;
            }
            
            if (!currentWord) continue;
            
            // 处理音标
            const proMatch = line.match(pronunciationRegex);
            if (proMatch) {
                currentWord.pronunciation = proMatch[1];
                continue;
            }
            
            // 处理词性
            const posMatch = line.match(partOfSpeechRegex);
            if (posMatch) {
                currentWord.partOfSpeech = posMatch[1];
                continue;
            }
            
            // 处理释义
            const defMatch = line.match(definitionRegex);
            if (defMatch) {
                currentWord.definition = defMatch[1];
                continue;
            }
            
            // 处理近义词/反义词
            const synMatch = line.match(synonymsRegex);
            if (synMatch) {
                currentWord.synonymsAntonyms = synMatch[1];
                continue;
            }
            
            // 处理记忆提示
            const tipMatch = line.match(memoryTipRegex);
            if (tipMatch) {
                currentWord.memoryTip = tipMatch[1];
                continue;
            }
            
            // 处理词组部分的开始
            if (line.match(phrasesStartRegex)) {
                inPhrases = true;
                inExamples = false;
                continue;
            }
            
            // 处理例句部分的开始
            if (line.match(examplesStartRegex)) {
                inExamples = true;
                inPhrases = false;
                continue;
            }
            
            // 处理词组列表项
            if (inPhrases && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
                currentWord.phrases.push(line.replace(/^[-•\d\.]\s*/, ''));
                continue;
            }
            
            // 处理例句列表项
            if (inExamples && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
                currentWord.examples.push(line.replace(/^[-•\d\.]\s*/, ''));
                continue;
            }
            
            // 如果当前行不是某个标记部分的开始，尝试将其添加到最近处理的部分
            if (inPhrases && line) {
                currentWord.phrases.push(line);
            } else if (inExamples && line) {
                currentWord.examples.push(line);
            } else if (!currentWord.definition) {
                currentWord.definition = line;
            }
        }
        
        // 添加最后一个单词
        if (currentWord) {
            words.push(currentWord);
        }
        
        // 如果没有成功提取单词，返回空数组（不再使用备用数据）
        if (words.length === 0) {
            console.log("No words extracted from response");
            return [];
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

    // 初始化测验生成器
    function initQuizGenerator() {
        const generateBtn = document.getElementById('generate-quiz');
        const quizContainer = document.getElementById('quiz-container');
        
        if (!generateBtn || !quizContainer) return;
        
        generateBtn.addEventListener('click', async () => {
            // 显示测验内容
            quizContainer.style.display = 'block';
            
            // 显示加载状态
            quizContainer.innerHTML = '<div class="text-center"><p>正在生成测验中...</p></div>';
            
            try {
                // 获取测验选项
                const topic = document.getElementById('quiz-topic').value;
                const difficulty = document.getElementById('quiz-difficulty').value;
                const count = parseInt(document.getElementById('quiz-questions').value);
                
                // 从header的profile-display获取教育水平
                const profileDisplay = document.querySelector('.profile-display');
                let educationLevel = 'middle-school'; // 默认值
                if (profileDisplay) {
                    const levelText = profileDisplay.textContent.trim();
                    if (levelText.includes('小学')) {
                        educationLevel = 'elementary-school';
                    } else if (levelText.includes('初中')) {
                        educationLevel = 'middle-school';
                    } else if (levelText.includes('高中')) {
                        educationLevel = 'high-school';
                    }
                }
                
                const levelName = getEducationLevelName(educationLevel);
                const topicName = getTopicName(topic);
                const difficultyName = getDifficultyName(difficulty);
                
                // 根据教育水平调整难度和内容
                let levelSpecificPrompt = '';
                let difficultyAdjustment = '';
                
                switch(educationLevel) {
                    case 'elementary-school':
                        levelSpecificPrompt = '题目应该简单易懂，使用基础词汇和简单句子结构。每个问题都应该有明确的答案，避免模棱两可的情况。解释应该使用简单的语言，并包含具体的例子。';
                        difficultyAdjustment = 'easy';
                        break;
                    case 'middle-school':
                        levelSpecificPrompt = '题目应该包含基础到中等难度的内容，使用适当的学术词汇。可以包含一些需要推理的问题，但答案应该相对明确。解释应该详细但不过于复杂。';
                        difficultyAdjustment = difficulty === 'hard' ? 'medium' : difficulty;
                        break;
                    case 'high-school':
                        levelSpecificPrompt = '题目可以包含更复杂的内容，使用高级词汇和复杂句子结构。可以包含需要批判性思维的问题，以及一些需要深入理解的概念。解释应该全面且专业。';
                        difficultyAdjustment = difficulty;
                        break;
                    default:
                        levelSpecificPrompt = '题目应该适合初中生水平，使用适当的词汇和句子结构。';
                        difficultyAdjustment = difficulty === 'hard' ? 'medium' : difficulty;
                }
                
                // 构建系统消息
                const systemMessage = `你是一个专业的英语教育助手，现在需要为${levelName}学生生成一个关于${topicName}的${difficultyName}难度测验，包含${count}道选择题。
                
                ${levelSpecificPrompt}
                
                每个问题应包含问题描述、4个选项（A、B、C、D）、正确答案和详细的解释说明。
                解释说明应该包含：
                1. 为什么这个选项是正确的
                2. 其他选项为什么是错误的
                3. 相关的语法或语言知识
                4. 适合${levelName}学生理解的具体例子
                
                请确保题目难度适合${levelName}学生的水平，避免过于简单或过于困难。
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
                      "explanation": "详细的解释说明，包括正确答案的原因、错误选项的分析和相关语法知识"
                    }
                  ]
                }`;
                
                // 调用DeepSeek API
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
                
                // 解析JSON响应
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

    // 渲染测验
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
                            <p class="explanation">${question.explanation}</p>
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
            
            // 添加事件监听器
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
            
            // 确认答案按钮事件
            document.getElementById('confirm-answer').addEventListener('click', () => {
                // 将选项文字颜色改为黑色
                const selectedOption = quizContainer.querySelector('.quiz-option.selected span');
                if (selectedOption) {
                    selectedOption.style.color = '#000';
                    selectedOption.style.fontWeight = 'bold';
                }
                
                // 显示反馈
                document.querySelector('.quiz-feedback').style.display = 'block';
                document.getElementById('confirm-answer').disabled = true;
                
                // 标记正确/错误答案
                const userAnswer = userAnswers[currentQuestionIndex];
                const correctAnswer = question.correctAnswer;
                
                options.forEach(option => {
                    const optionId = option.dataset.option;
                    if (optionId === correctAnswer) {
                        option.classList.add('correct');
                    } else if (optionId === userAnswer && userAnswer !== correctAnswer) {
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
                    
                    const assessmentPrompt = `你是一个专业的英语教育专家。请根据以下测验结果，为${levelName}学生提供关于${topicName}主题的学习评估和改进建议：
                    
                    测验结果：
                    - 总分：${correctCount}/${quiz.questions.length} (${percentage}%)
                    - 等级：${grade}
                    
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
                                    "content": "你是一个专业的英语教育专家，擅长分析学生的学习情况并提供针对性的学习建议。"
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
        
        // 从第一题开始
        renderCurrentQuestion();
    }

    // 辅助函数：获取教育水平名称
    function getEducationLevelName(level) {
        switch(level) {
            case 'elementary-school': return '小学';
            case 'middle-school': return '初中';
            case 'high-school': return '高中';
            default: return '初中';
        }
    }

    // 辅助函数：获取主题名称
    function getTopicName(topic) {
        switch(topic) {
            case 'grammar': return '语法';
            case 'vocabulary': return '词汇';
            case 'reading': return '阅读理解';
            case 'writing': return '写作';
            default: return '英语';
        }
    }

    // 辅助函数：获取难度名称
    function getDifficultyName(difficulty) {
        switch(difficulty) {
            case 'easy': return '初级';
            case 'medium': return '中级';
            case 'hard': return '高级';
            default: return '中级';
        }
    }

    // 初始化测验生成器
    initQuizGenerator();
    
    // 使阅读测试函数全局可用
    window.generateReadingTest = generateReadingTest;
    
    // 生成阅读测试功能
    async function generateReadingTestOld() {
        const testType = document.getElementById('reading-test-type').value;
        const difficulty = document.getElementById('reading-test-difficulty').value;
        const questions = document.getElementById('reading-test-questions').value;
        const testContainer = document.getElementById('reading-test-container');
        
        // 显示测试内容并添加加载状态
        testContainer.style.display = 'block';
        testContainer.innerHTML = '<div class="loading-spinner"><div></div><div></div><div></div><div></div></div>';
        
        // 获取用户教育背景
        const userEducationLevel = getUserEducationLevel();
        
        // 准备API请求数据
        const promptData = {
            testType: testType,
            difficulty: difficulty,
            questions: parseInt(questions),
            userEducationLevel: userEducationLevel
        };
        
        // 调用API生成测试
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        "role": "system",
                        "content": "你是一个专业的英语教育助手，负责生成英语阅读测试。"
                    },
                    {
                        "role": "user",
                        "content": getReadingTestPrompt(promptData)
                    }
                ]
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(apiResponse => {
            try {
                // 从API响应中提取内容
                const responseText = apiResponse.choices[0].message.content;
                
                // 尝试从文本中提取JSON
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[0]);
                    displayReadingTest(data, testType);
                } else {
                    throw new Error('无法从响应中提取JSON');
                }
            } catch (e) {
                console.error("解析API响应时出错:", e);
                testContainer.innerHTML = '<p class="error-message">生成测试时发生错误，请重试。</p>';
            }
        })
        .catch(error => {
            console.error("API请求失败:", error);
            testContainer.innerHTML = '<p class="error-message">生成测试时发生错误: ' + error.message + '</p>';
        });
    }
    
    // 构建完形填空测试的系统消息
    function buildClozeTestSystemMessage(difficulty, questionCount, educationLevel) {
        return `你是一个专业的英语教育助手。请为${educationLevel}学生生成一个${getDifficultyName(difficulty)}难度的完形填空测试。

测试应包含以下内容：
1. 一篇短文，其中有${questionCount}个单词被挖空，并以[1]、[2]等数字标记。
2. 每个空格对应一个四选一(A/B/C/D)的选择题。
3. 正确答案和每个选项的解释说明。

请根据学生的教育水平(${educationLevel})调整文章难度和词汇量。

${difficulty === 'easy' ? '使用简单词汇和基础语法结构，话题应贴近日常生活。' : 
  difficulty === 'medium' ? '使用中等难度词汇和语法结构，话题可以包括文化、科技等内容。' : 
  '使用较复杂词汇和语法结构，话题可以包括社会、环境等更抽象的内容。'}

请以JSON格式回复，格式如下:
{
  "title": "测试标题",
  "article": "完整的文章，标记出空白处，例如：The boy [1] to the store every day.",
  "questions": [
    {
      "id": 1,
      "options": [
        { "id": "A", "text": "选项A" },
        { "id": "B", "text": "选项B" },
        { "id": "C", "text": "选项C" },
        { "id": "D", "text": "选项D" }
      ],
      "correctAnswer": "正确选项的ID（A/B/C/D）",
      "explanation": "为什么这是正确答案的解释"
    }
  ]
}`;
    }
    
    // 构建阅读理解测试的系统消息
    function buildComprehensionTestSystemMessage(difficulty, questionCount, educationLevel) {
        return `你是一个专业的英语教育助手。请为${educationLevel}学生生成一个${getDifficultyName(difficulty)}难度的阅读理解测试。

测试应包含以下内容：
1. 一篇适合${educationLevel}学生阅读水平的短文。
2. ${questionCount}个关于文章内容的四选一(A/B/C/D)问题。
3. 正确答案和每个选项的解释说明。

请根据学生的教育水平(${educationLevel})调整文章难度和词汇量。

${difficulty === 'easy' ? '使用简单词汇和基础语法结构，话题应贴近日常生活，段落简短。' : 
  difficulty === 'medium' ? '使用中等难度词汇和语法结构，话题可以包括文化、科技等内容，段落适中。' : 
  '使用较复杂词汇和语法结构，话题可以包括社会、环境等更抽象的内容，段落可以较长。'}

问题应该包括细节理解、主旨把握、逻辑推理和词汇理解等多种题型。

请以JSON格式回复，格式如下:
{
  "title": "测试标题",
  "article": "完整的文章内容",
  "questions": [
    {
      "id": 1,
      "question": "问题描述",
      "options": [
        { "id": "A", "text": "选项A" },
        { "id": "B", "text": "选项B" },
        { "id": "C", "text": "选项C" },
        { "id": "D", "text": "选项D" }
      ],
      "correctAnswer": "正确选项的ID（A/B/C/D）",
      "explanation": "为什么这是正确答案的解释"
    }
  ]
}`;
    }
    
    // 渲染完形填空测试
    function renderClozeTest(test) {
        const testContainer = document.getElementById('reading-test-container');
        const userAnswers = new Array(test.questions.length).fill(null);
        
        // 创建漂亮的HTML
        let html = `
            <div class="reading-test-content">
                <h3>${test.title}</h3>
                <div class="reading-article cloze-article">
                    ${test.article}
                </div>
                <div class="questions-container">
                    <h4>请选择最适合填入空格的选项：</h4>
                    <div class="questions-list">
        `;
        
        // 添加问题
        test.questions.forEach((question, index) => {
            html += `
                <div class="question-item" data-question="${question.id}">
                    <div class="question-header">
                        <span class="question-number">${question.id}.</span>
                    </div>
                    <div class="options-container">
            `;
            
            // 添加选项
            question.options.forEach(option => {
                html += `
                    <div class="option-item" data-option="${option.id}">
                        <label>
                            <input type="radio" name="q${question.id}" value="${option.id}">
                            <span class="option-marker">${option.id}</span>
                            <span class="option-text">${option.text}</span>
                        </label>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    <div class="explanation-container" style="display: none;">
                        <div class="correct-answer">
                            <span>正确答案: ${question.correctAnswer}</span>
                        </div>
                        <div class="explanation">
                            <p>${question.explanation}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // 完成按钮
        html += `
                    </div>
                    <div class="test-actions">
                        <button class="btn btn-primary" id="complete-test">完成题目</button>
                    </div>
                </div>
            </div>
        `;
        
        testContainer.innerHTML = html;
        
        // 添加事件监听
        document.querySelectorAll('.option-item').forEach(option => {
            option.addEventListener('click', function() {
                const questionId = parseInt(this.closest('.question-item').dataset.question);
                const optionId = this.dataset.option;
                userAnswers[questionId - 1] = optionId;
            });
        });
        
        // 完成按钮事件
        document.getElementById('complete-test').addEventListener('click', function() {
            // 显示答案解释
            document.querySelectorAll('.explanation-container').forEach((container, index) => {
                container.style.display = 'block';
            });
            
            // 计算得分
            let correctCount = 0;
            test.questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                if (isCorrect) correctCount++;
                
                // 高亮正确和错误的答案
                const questionElement = document.querySelector(`.question-item[data-question="${question.id}"]`);
                questionElement.querySelectorAll('.option-item').forEach(option => {
                    if (option.dataset.option === question.correctAnswer) {
                        option.classList.add('correct');
                    } else if (option.dataset.option === userAnswer) {
                        option.classList.add('incorrect');
                    }
                });
            });
            
            // 显示得分
            const score = Math.round((correctCount / test.questions.length) * 100);
            
            // 添加评估按钮
            const actions = document.querySelector('.test-actions');
            actions.innerHTML = `
                <div class="test-results">
                    <p>得分：${correctCount} / ${test.questions.length} (${score}%)</p>
                    <p>${score >= 80 ? '太棒了！继续保持！' : 
                        score >= 60 ? '不错！还有提升空间。' : 
                        '继续努力，你会进步的！'}</p>
                </div>
                <button class="btn btn-primary" id="evaluate-test">获取评估</button>
            `;
            
            // 添加评估按钮事件
            document.getElementById('evaluate-test').addEventListener('click', function() {
                evaluateTest(test, userAnswers, 'cloze');
            });
        });
    }
    
    // 渲染阅读理解测试
    function renderComprehensionTest(test) {
        const testContainer = document.getElementById('reading-test-container');
        const userAnswers = new Array(test.questions.length).fill(null);
        
        // 创建漂亮的HTML
        let html = `
            <div class="reading-test-content">
                <h3>${test.title}</h3>
                <div class="reading-article">
                    ${test.article}
                </div>
                <div class="questions-container">
                    <h4>请回答以下问题：</h4>
                    <div class="questions-list">
        `;
        
        // 添加问题
        test.questions.forEach((question, index) => {
            html += `
                <div class="question-item" data-question="${question.id}">
                    <div class="question-header">
                        <span class="question-number">${question.id}.</span>
                        <span class="question-text">${question.question}</span>
                    </div>
                    <div class="options-container">
            `;
            
            // 添加选项
            question.options.forEach(option => {
                html += `
                    <div class="option-item" data-option="${option.id}">
                        <label>
                            <input type="radio" name="q${question.id}" value="${option.id}">
                            <span class="option-marker">${option.id}</span>
                            <span class="option-text">${option.text}</span>
                        </label>
                    </div>
                `;
            });
            
            html += `
                    </div>
                    <div class="explanation-container" style="display: none;">
                        <div class="correct-answer">
                            <span>正确答案: ${question.correctAnswer}</span>
                        </div>
                        <div class="explanation">
                            <p>${question.explanation}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // 完成按钮
        html += `
                    </div>
                    <div class="test-actions">
                        <button class="btn btn-primary" id="complete-test">完成题目</button>
                    </div>
                </div>
            </div>
        `;
        
        testContainer.innerHTML = html;
        
        // 添加事件监听
        document.querySelectorAll('.option-item').forEach(option => {
            option.addEventListener('click', function() {
                const questionId = parseInt(this.closest('.question-item').dataset.question);
                const optionId = this.dataset.option;
                userAnswers[questionId - 1] = optionId;
            });
        });
        
        // 完成按钮事件
        document.getElementById('complete-test').addEventListener('click', function() {
            // 显示答案解释
            document.querySelectorAll('.explanation-container').forEach((container, index) => {
                container.style.display = 'block';
            });
            
            // 计算得分
            let correctCount = 0;
            test.questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                if (isCorrect) correctCount++;
                
                // 高亮正确和错误的答案
                const questionElement = document.querySelector(`.question-item[data-question="${question.id}"]`);
                questionElement.querySelectorAll('.option-item').forEach(option => {
                    if (option.dataset.option === question.correctAnswer) {
                        option.classList.add('correct');
                    } else if (option.dataset.option === userAnswer) {
                        option.classList.add('incorrect');
                    }
                });
            });
            
            // 显示得分
            const score = Math.round((correctCount / test.questions.length) * 100);
            
            // 添加评估按钮
            const actions = document.querySelector('.test-actions');
            actions.innerHTML = `
                <div class="test-results">
                    <p>得分：${correctCount} / ${test.questions.length} (${score}%)</p>
                    <p>${score >= 80 ? '太棒了！继续保持！' : 
                        score >= 60 ? '不错！还有提升空间。' : 
                        '继续努力，你会进步的！'}</p>
                </div>
                <button class="btn btn-primary" id="evaluate-test">获取评估</button>
            `;
            
            // 添加评估按钮事件
            document.getElementById('evaluate-test').addEventListener('click', function() {
                evaluateTest(test, userAnswers, 'comprehension');
            });
        });
    }
    
    // 从文本渲染完形填空测试（备用方案）
    function renderClozeTestFromText(text) {
        const testContainer = document.getElementById('reading-test-container');
        
        // 尝试提取标题、文章和问题
        const lines = text.split('\n');
        let title = '完形填空练习';
        let articleText = '';
        let questions = [];
        
        // 提取标题
        for (const line of lines) {
            if (line.trim().startsWith('#') || line.trim().startsWith('标题')) {
                title = line.replace(/^[#\s标题：:]+/, '').trim();
                break;
            }
        }
        
        // 提取文章
        let inArticle = false;
        for (const line of lines) {
            if (line.includes('文章') || line.includes('短文') || line.includes('Article')) {
                inArticle = true;
                continue;
            }
            
            if (inArticle && line.trim() && !line.match(/^(\d+\.|\[[\d+]\]|\(\d+\))/)) {
                articleText += line + '<br>';
            }
            
            if (inArticle && (line.includes('Questions') || line.includes('问题') || line.match(/^\d+\./))) {
                inArticle = false;
                break;
            }
        }
        
        // 提取问题
        let currentQuestion = null;
        for (const line of lines) {
            // 检查是否是问题开始
            const questionMatch = line.match(/(\d+)[\.、\)）]?\s*(.+)?/);
            if (questionMatch && !line.includes('文章') && !line.includes('Article')) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                
                currentQuestion = {
                    id: parseInt(questionMatch[1]),
                    options: [],
                    correctAnswer: '',
                    explanation: ''
                };
                
                continue;
            }
            
            // 如果已经有当前问题，尝试提取选项和答案
            if (currentQuestion) {
                // 尝试提取选项
                const optionMatch = line.match(/([A-D])[\.、\)）]?\s*(.+)/);
                if (optionMatch) {
                    currentQuestion.options.push({
                        id: optionMatch[1],
                        text: optionMatch[2].trim()
                    });
                    continue;
                }
                
                // 尝试提取正确答案
                if (line.includes('答案') || line.includes('Answer')) {
                    const answerMatch = line.match(/[：:]\s*([A-D])/);
                    if (answerMatch) {
                        currentQuestion.correctAnswer = answerMatch[1];
                    }
                    continue;
                }
                
                // 尝试提取解释
                if (line.includes('解释') || line.includes('Explanation')) {
                    const explanationMatch = line.match(/[：:]\s*(.+)/);
                    if (explanationMatch) {
                        currentQuestion.explanation = explanationMatch[1].trim();
                    }
                    continue;
                }
                
                // 如果没有匹配项但行不为空，可能是解释的一部分
                if (line.trim() && currentQuestion.correctAnswer && !currentQuestion.explanation) {
                    currentQuestion.explanation = line.trim();
                }
            }
        }
        
        // 添加最后一个问题
        if (currentQuestion) {
            questions.push(currentQuestion);
        }
        
        // 如果提取成功，使用提取的数据
        if (articleText && questions.length > 0) {
            const test = {
                title: title,
                article: articleText,
                questions: questions.map(q => {
                    return {
                        id: q.id,
                        options: q.options.length > 0 ? q.options : [
                            { id: 'A', text: '选项A' },
                            { id: 'B', text: '选项B' },
                            { id: 'C', text: '选项C' },
                            { id: 'D', text: '选项D' }
                        ],
                        correctAnswer: q.correctAnswer || 'A',
                        explanation: q.explanation || '无解释'
                    };
                })
            };
            
            renderClozeTest(test);
        } else {
            // 如果提取失败，显示原始响应
            testContainer.innerHTML = `
                <div class="test-error">
                    <h3>完形填空练习</h3>
                    <p>解析响应时出现问题，以下是原始内容：</p>
                    <div class="raw-response">
                        ${text.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        }
    }
    
    // 从文本渲染阅读理解测试（备用方案）
    function renderComprehensionTestFromText(text) {
        const testContainer = document.getElementById('reading-test-container');
        
        // 尝试提取标题、文章和问题
        const lines = text.split('\n');
        let title = '阅读理解练习';
        let articleText = '';
        let questions = [];
        
        // 提取标题
        for (const line of lines) {
            if (line.trim().startsWith('#') || line.trim().startsWith('标题')) {
                title = line.replace(/^[#\s标题：:]+/, '').trim();
                break;
            }
        }
        
        // 提取文章
        let inArticle = false;
        for (const line of lines) {
            if (line.includes('文章') || line.includes('短文') || line.includes('Article')) {
                inArticle = true;
                continue;
            }
            
            if (inArticle && line.trim() && !line.match(/^(\d+\.|\[[\d+]\]|\(\d+\))/)) {
                articleText += line + '<br>';
            }
            
            if (inArticle && (line.includes('Questions') || line.includes('问题') || line.match(/^\d+\./))) {
                inArticle = false;
                break;
            }
        }
        
        // 提取问题
        let currentQuestion = null;
        for (const line of lines) {
            // 检查是否是问题开始
            const questionMatch = line.match(/(\d+)[\.、\)）]?\s*(.+)/);
            if (questionMatch && !line.includes('文章') && !line.includes('Article')) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                
                currentQuestion = {
                    id: parseInt(questionMatch[1]),
                    question: questionMatch[2] ? questionMatch[2].trim() : '问题' + questionMatch[1],
                    options: [],
                    correctAnswer: '',
                    explanation: ''
                };
                
                continue;
            }
            
            // 如果已经有当前问题，尝试提取选项和答案
            if (currentQuestion) {
                // 尝试提取选项
                const optionMatch = line.match(/([A-D])[\.、\)）]?\s*(.+)/);
                if (optionMatch) {
                    currentQuestion.options.push({
                        id: optionMatch[1],
                        text: optionMatch[2].trim()
                    });
                    continue;
                }
                
                // 尝试提取正确答案
                if (line.includes('答案') || line.includes('Answer')) {
                    const answerMatch = line.match(/[：:]\s*([A-D])/);
                    if (answerMatch) {
                        currentQuestion.correctAnswer = answerMatch[1];
                    }
                    continue;
                }
                
                // 尝试提取解释
                if (line.includes('解释') || line.includes('Explanation')) {
                    const explanationMatch = line.match(/[：:]\s*(.+)/);
                    if (explanationMatch) {
                        currentQuestion.explanation = explanationMatch[1].trim();
                    }
                    continue;
                }
                
                // 如果没有匹配项但行不为空，可能是解释的一部分
                if (line.trim() && currentQuestion.correctAnswer && !currentQuestion.explanation) {
                    currentQuestion.explanation = line.trim();
                }
            }
        }
        
        // 添加最后一个问题
        if (currentQuestion) {
            questions.push(currentQuestion);
        }
        
        // 如果提取成功，使用提取的数据
        if (articleText && questions.length > 0) {
            const test = {
                title: title,
                article: articleText,
                questions: questions.map(q => {
                    return {
                        id: q.id,
                        question: q.question,
                        options: q.options.length > 0 ? q.options : [
                            { id: 'A', text: '选项A' },
                            { id: 'B', text: '选项B' },
                            { id: 'C', text: '选项C' },
                            { id: 'D', text: '选项D' }
                        ],
                        correctAnswer: q.correctAnswer || 'A',
                        explanation: q.explanation || '无解释'
                    };
                })
            };
            
            renderComprehensionTest(test);
        } else {
            // 如果提取失败，显示原始响应
            testContainer.innerHTML = `
                <div class="test-error">
                    <h3>阅读理解练习</h3>
                    <p>解析响应时出现问题，以下是原始内容：</p>
                    <div class="raw-response">
                        ${text.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        }
    }
    
    // 测试评估函数
    async function evaluateTest(test, userAnswers, testType) {
        const evalBtn = document.getElementById('evaluate-test');
        if (!evalBtn) return;
        
        // 显示评估加载中
        evalBtn.disabled = true;
        evalBtn.textContent = '评估中...';
        
        try {
            // 计算得分
            let correctCount = 0;
            const mistakes = [];
            
            test.questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                if (isCorrect) {
                    correctCount++;
                } else {
                    mistakes.push({
                        questionId: question.id,
                        userAnswer: userAnswer || '未作答',
                        correctAnswer: question.correctAnswer,
                        explanation: question.explanation
                    });
                }
            });
            
            const score = Math.round((correctCount / test.questions.length) * 100);
            
            // 获取用户的教育水平
            const profileDisplay = document.getElementById('profile-display');
            const userProfile = profileDisplay ? profileDisplay.textContent.trim() : '';
            const educationLevel = getEducationLevelFromProfile(userProfile);
            
            // 构建评估提示
            const evalPrompt = `你是一个专业的英语教育专家。请根据以下${testType === 'cloze' ? '完形填空' : '阅读理解'}测试结果，为${educationLevel}学生提供详细评估和改进建议：

测试结果：
- 测试标题：${test.title}
- 总分：${correctCount}/${test.questions.length} (${score}%)
${mistakes.length > 0 ? `
错误题目：
${mistakes.map(m => `- 题号 ${m.questionId}：学生选择了 ${m.userAnswer}，正确答案是 ${m.correctAnswer}
  解释：${m.explanation}`).join('\n')}
` : '学生全部答对了所有题目！'}

请提供：
1. 测试表现的整体评估
2. 针对学生的错误分析常见问题类型
3. 针对性的学习建议和改进策略
4. 推荐的学习资源和练习方法

请确保评估友好、鼓励性且具有教育意义，适合${educationLevel}学生的理解水平。`;
            
            // 调用API获取评估
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            "role": "system",
                            "content": "你是一个专业的英语教育专家，擅长分析学生的测试结果并提供针对性的学习建议。"
                        },
                        {
                            "role": "user",
                            "content": evalPrompt
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const assessment = data.choices[0].message.content;
            
            // 显示评估结果
            const testContainer = document.getElementById('reading-test-container');
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'assessment-container';
            resultsContainer.innerHTML = `
                <div class="assessment-header">
                    <h3>学习评估报告</h3>
                    <button class="btn btn-small btn-outline close-assessment">关闭</button>
                </div>
                <div class="assessment-content">
                    ${assessment.replace(/\n/g, '<br>')}
                </div>
            `;
            
            testContainer.appendChild(resultsContainer);
            
            // 添加关闭按钮事件
            document.querySelector('.close-assessment').addEventListener('click', function() {
                resultsContainer.remove();
                evalBtn.disabled = false;
                evalBtn.textContent = '获取评估';
            });
            
            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
                .assessment-container {
                    position: fixed;
                    top: 10%;
                    left: 10%;
                    width: 80%;
                    max-height: 80%;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.2);
                    z-index: 1000;
                    overflow-y: auto;
                    padding: 20px;
                }
                
                .assessment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                
                .assessment-header h3 {
                    margin: 0;
                    color: var(--primary-color);
                }
                
                .assessment-content {
                    line-height: 1.5;
                }
                
                .close-assessment {
                    padding: 5px 10px;
                }
                
                @media (max-width: 768px) {
                    .assessment-container {
                        top: 5%;
                        left: 5%;
                        width: 90%;
                        max-height: 90%;
                    }
                }
            `;
            document.head.appendChild(style);
            
        } catch (error) {
            console.error('获取学习评估时出错:', error);
            alert('获取学习评估时出错，请稍后再试。');
            evalBtn.disabled = false;
            evalBtn.textContent = '获取评估';
        }
    }

    // 阅读测试相关功能
    document.addEventListener('DOMContentLoaded', function() {
        const generateReadingTestBtn = document.getElementById('generate-reading-test');
        const readingTestTypeSelect = document.getElementById('reading-test-type');
        const readingTestQuestionsSelect = document.getElementById('reading-test-questions');
        
        if (generateReadingTestBtn) {
            generateReadingTestBtn.addEventListener('click', generateReadingTest);
        }
        
        if (readingTestTypeSelect) {
            readingTestTypeSelect.addEventListener('change', function() {
                // Both test types have fixed number of questions
                readingTestQuestionsSelect.disabled = true;
                
                if (this.value === 'cloze') {
                    // 完形填空固定10题
                    readingTestQuestionsSelect.innerHTML = '<option value="10" selected>10题</option>';
                } else if (this.value === 'comprehension') {
                    // 阅读理解固定5题
                    readingTestQuestionsSelect.innerHTML = '<option value="5" selected>5题</option>';
                }
            });
        }
    });

    function generateReadingTest() {
        const testType = document.getElementById('reading-test-type').value;
        const difficulty = document.getElementById('reading-test-difficulty').value;
        const questions = document.getElementById('reading-test-questions').value;
        const testContainer = document.getElementById('reading-test-container');
        
        // 显示测试内容并添加加载状态
        testContainer.style.display = 'block';
        testContainer.innerHTML = '<div class="loading-spinner"><div></div><div></div><div></div><div></div></div>';
        
        // 获取用户教育背景
        const userEducationLevel = getUserEducationLevel();
        
        // 准备API请求数据
        const promptData = {
            testType: testType,
            difficulty: difficulty,
            questions: parseInt(questions),
            userEducationLevel: userEducationLevel
        };
        
        // 调用API生成测试
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        "role": "system",
                        "content": "你是一个专业的英语教育助手，负责生成英语阅读测试。"
                    },
                    {
                        "role": "user",
                        "content": getReadingTestPrompt(promptData)
                    }
                ]
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(apiResponse => {
            try {
                // 从API响应中提取内容
                const responseText = apiResponse.choices[0].message.content;
                
                // 尝试从文本中提取JSON
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[0]);
                    displayReadingTest(data, testType);
                } else {
                    throw new Error('无法从响应中提取JSON');
                }
            } catch (e) {
                console.error("解析API响应时出错:", e);
                testContainer.innerHTML = '<p class="error-message">生成测试时发生错误，请重试。</p>';
            }
        })
        .catch(error => {
            console.error("API请求失败:", error);
            testContainer.innerHTML = '<p class="error-message">生成测试时发生错误: ' + error.message + '</p>';
        });
    }

    function getReadingTestPrompt(data) {
        const { testType, difficulty, questions, userEducationLevel } = data;
        
        let difficultyDesc = '';
        switch(difficulty) {
            case 'easy':
                difficultyDesc = '初级/简单，适合初中水平';
                break;
            case 'medium':
                difficultyDesc = '中级/中等，适合高中水平';
                break;
            case 'hard':
                difficultyDesc = '高级/困难，适合大学及以上水平';
                break;
        }
        
        let prompt = '';
        
        if (testType === 'cloze') {
            prompt = `请创建一个英语完形填空测试，难度为${difficultyDesc}，考虑用户教育背景为${userEducationLevel}。
请提供一篇文章，其中有10个空白处需要填词。为每个空白提供A、B、C、D四个选项。
请以JSON格式返回，包含以下字段：
1. title: 文章标题
2. passage: 带有空白处的文章，用__1__，__2__等表示空白
3. questions: 包含10个问题对象的数组，每个对象包含：
   - number: 题号
   - options: 四个选项 A、B、C、D
   - answer: 正确答案（A、B、C、D）
   - explanation: 答案解释
返回的JSON结构应为：
{
  "title": "文章标题",
  "passage": "文章内容带有__1__等空白处",
  "questions": [
    {
      "number": 1,
      "options": {"A": "选项A", "B": "选项B", "C": "选项C", "D": "选项D"},
      "answer": "A",
      "explanation": "解释为什么A是正确答案"
    },
    ...
  ]
}`;
        } else if (testType === 'comprehension') {
            prompt = `请创建一个英语阅读理解测试，难度为${difficultyDesc}，考虑用户教育背景为${userEducationLevel}。
请提供一篇文章，并创建5个关于这篇文章的选择题。
请以JSON格式返回，包含以下字段：
1. title: 文章标题
2. passage: 完整的文章内容
3. questions: 包含5个问题对象的数组，每个对象包含：
   - number: 题号
   - question: 问题内容
   - options: 四个选项 A、B、C、D
   - answer: 正确答案（A、B、C、D）
   - explanation: 答案解释
返回的JSON结构应为：
{
  "title": "文章标题",
  "passage": "文章完整内容",
  "questions": [
    {
      "number": 1,
      "question": "问题描述",
      "options": {"A": "选项A", "B": "选项B", "C": "选项C", "D": "选项D"},
      "answer": "A",
      "explanation": "解释为什么A是正确答案"
    },
    ...
  ]
}`;
        }
        
        return prompt;
    }

    function displayReadingTest(data, testType) {
        const testContainer = document.getElementById('reading-test-container');
        let html = '';
        
        html += `<h3 class="test-title">${data.title}</h3>`;
        
        if (testType === 'cloze') {
            // 显示完形填空文章
            html += `<div class="test-passage">${data.passage}</div>`;
            
            // 显示完形填空问题 - 一行显示一题的选项
            html += '<div class="test-questions cloze-questions">';
            data.questions.forEach(q => {
                html += `<div class="question cloze-question" data-number="${q.number}" data-answer="${q.answer}">`;
                
                // 问题编号和选项在同一行
                html += `<div class="question-row">
                    <span class="question-number">${q.number}:</span>
                    <div class="options-inline">`;
                
                // 内联显示选项 A/B/C/D
                Object.entries(q.options).forEach(([key, value]) => {
                    html += `
                        <label class="option-inline">
                            <input type="radio" id="q${q.number}${key}" name="q${q.number}" value="${key}">
                            <span class="option-marker">${key}</span>
                            <span class="option-text">${value}</span>
                        </label>`;
                });
                
                html += `</div></div>`;
                
                // 解释部分 - 中英双语
                html += `
                    <div class="explanation" style="display: none;">
                        <p><strong>正确答案:</strong> ${q.answer}</p>
                        <p><strong>英文解析:</strong> ${q.explanation}</p>                        
                    </div>
                </div>`;
            });
            html += '</div>';
        } else if (testType === 'comprehension') {
            // 显示阅读理解文章
            html += `<div class="test-passage">${data.passage}</div>`;
            
            // 显示阅读理解问题
            html += '<div class="test-questions">';
            data.questions.forEach(q => {
                html += `<div class="question" data-number="${q.number}" data-answer="${q.answer}">`;
                html += `<p class="question-text">${q.number}. ${q.question}</p>`;
                
                // 选项
                html += `<div class="options-container">`;
                Object.entries(q.options).forEach(([key, value]) => {
                    html += `
                    <div class="option">
                        <input type="radio" id="q${q.number}${key}" name="q${q.number}" value="${key}">
                        <label for="q${q.number}${key}">${key}. ${value}</label>
                    </div>`;
                });
                html += `</div>`;
                
                // 解释部分 - 中英双语
                html += `
                    <div class="explanation" style="display: none;">
                        <p><strong>正确答案:</strong> ${q.answer}</p>
                        <p><strong>英文解析:</strong> ${q.explanation}</p></p>
                    </div>
                </div>`;
            });
            html += '</div>';
        }
        
        // 添加提交、查看答案和评估按钮
        html += `
        <div class="test-controls">
            <button class="btn btn-primary" id="submit-test">提交答案</button>
            <button class="btn btn-secondary" id="show-answers">查看答案</button>
            <button class="btn btn-success" id="evaluate-performance" style="display:none;">评估表现并提供改进建议</button>
        </div>
        <div id="test-results" class="test-results"></div>`;
        
        testContainer.innerHTML = html;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .cloze-questions {
                margin-top: 20px;
            }
            .cloze-question {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            .question-row {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
            }
            .question-number {
                font-weight: bold;
                margin-right: 10px;
                min-width: 25px;
            }
            .options-inline {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            .option-inline {
                display: flex;
                align-items: center;
                margin-right: 5px;
                cursor: pointer;
            }
            .option-marker {
                font-weight: bold;
                margin: 0 5px;
            }
              border-radius: 5px;
            }
            @media (max-width: 576px) {
                .options-inline {
                    flex-direction: column;
                    gap: 5px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // 添加提交按钮事件监听
        document.getElementById('submit-test').addEventListener('click', function() {
            evaluateTest(data);
            // 显示评估按钮
            document.getElementById('evaluate-performance').style.display = 'inline-block';
        });
        
        // 添加查看答案按钮事件监听
        document.getElementById('show-answers').addEventListener('click', function() {
            showAnswers(data);
        });
        
        // 添加评估表现按钮事件监听
        document.getElementById('evaluate-performance').addEventListener('click', function() {
            evaluatePerformance(data, testType);
        });
    }
    
    // 添加新的评估表现函数
    async function evaluatePerformance(data, testType) {
        const evalButton = document.getElementById('evaluate-performance');
        evalButton.disabled = true;
        evalButton.textContent = '评估中...';
        
        try {
            // 收集用户答案
            const userAnswers = [];
            data.questions.forEach(q => {
                const selectedOption = document.querySelector(`input[name="q${q.number}"]:checked`);
                userAnswers.push({
                    questionNumber: q.number,
                    userAnswer: selectedOption ? selectedOption.value : null,
                    correctAnswer: q.answer,
                    explanation: q.explanation
                });
            });
            
            // 计算正确率
            const answeredQuestions = userAnswers.filter(a => a.userAnswer !== null);
            const correctAnswers = userAnswers.filter(a => a.userAnswer === a.correctAnswer);
            const correctRate = answeredQuestions.length > 0 ? (correctAnswers.length / answeredQuestions.length) * 100 : 0;
            
            // 收集错误的题目
            const incorrectAnswers = userAnswers.filter(a => a.userAnswer !== null && a.userAnswer !== a.correctAnswer);
            
            // 获取用户教育水平
            const userLevel = getUserEducationLevel();
            
            // 构建评估提示
            const prompt = `作为英语教育专家，请根据以下学生完成的${testType === 'cloze' ? '完形填空' : '阅读理解'}测试结果提供详细评估和改进建议：

测试信息：
- 测试标题：${data.title}
- 类型：${testType === 'cloze' ? '完形填空' : '阅读理解'}
- 难度：${data.difficulty || '中等'}
- 学生水平：${userLevel}

表现数据：
- 总题数：${data.questions.length}题
- 已答题数：${answeredQuestions.length}题
- 正确数：${correctAnswers.length}题
- 正确率：${correctRate.toFixed(1)}%

${incorrectAnswers.length > 0 ? `错误题目分析：
${incorrectAnswers.map(a => `- 第${a.questionNumber}题：学生选择了${a.userAnswer || '未作答'}，正确答案是${a.correctAnswer}
  解析：${a.explanation}`).join('\n')}` : '学生全部答对！'}

请提供：
1. 整体评价（学生在该测试中的表现如何）
2. 常见错误模式分析（如果有错误，学生犯了哪些类型的错误）
3. 针对性学习建议（包括应该重点学习的内容和提高方法）
4. 适合该学生水平的学习资源推荐

评估语言要简明易懂，既包含鼓励性评价，也提供具体实用的改进建议，适合${userLevel}学生理解。请同时提供中英文评估。`;

            // 调用API获取评估
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            "role": "system",
                            "content": "你是一位经验丰富的英语教育专家，擅长分析学生的学习表现并提供个性化的改进建议。"
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                throw new Error(`网络响应不正常: ${response.status}`);
            }
            
            const responseData = await response.json();
            const assessment = responseData.choices[0].message.content;
            
            // 显示评估结果
            const resultsContainer = document.getElementById('test-results');
            resultsContainer.innerHTML = `
                <div class="assessment-container">
                    <h3>个性化学习评估</h3>
                    <div class="assessment-content">
                        ${assessment.replace(/\n/g, '<br>')}
                    </div>
                    <div class="assessment-summary">
                        <div class="score-display">
                            <div class="score-circle">
                                <span class="score-number">${correctRate.toFixed(0)}%</span>
                            </div>
                            <p class="score-label">正确率</p>
                        </div>
                    </div>
                </div>
            `;
            
            // 添加评估结果样式
            const style = document.createElement('style');
            style.textContent = `
                .assessment-container {
                    margin-top: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .assessment-container h3 {
                    margin-top: 0;
                    color: #4361ee;
                    border-bottom: 2px solid #4361ee;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .assessment-content {
                    line-height: 1.6;
                }
                .assessment-summary {
                    display: flex;
                    justify-content: center;
                    margin-top: 20px;
                }
                .score-display {
                    text-align: center;
                }
                .score-circle {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: ${correctRate >= 80 ? '#4caf50' : correctRate >= 60 ? '#ff9800' : '#f44336'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                }
                .score-number {
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
                }
                .score-label {
                    margin-top: 10px;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
            
        } catch (error) {
            console.error('评估过程中出错:', error);
            const resultsContainer = document.getElementById('test-results');
            resultsContainer.innerHTML += '<p class="error-message">生成评估时出现错误，请稍后再试。</p>';
        } finally {
            evalButton.disabled = false;
            evalButton.textContent = '评估表现并提供改进建议';
        }
    }

    function evaluateTest(data) {
        const questions = document.querySelectorAll('.question');
        let correct = 0;
        let totalQuestions = questions.length;
        let unanswered = 0;
        
        questions.forEach(question => {
            const number = question.dataset.number;
            const correctAnswer = question.dataset.answer;
            const selectedOption = document.querySelector(`input[name="q${number}"]:checked`);
            
            if (selectedOption) {
                const userAnswer = selectedOption.value;
                const optionEl = selectedOption.parentElement;
                
                if (userAnswer === correctAnswer) {
                    correct++;
                    if (optionEl) optionEl.classList.add('correct');
                } else {
                    if (optionEl) optionEl.classList.add('incorrect');
                    // 标记正确答案
                    const correctLabel = document.querySelector(`label[for="q${number}${correctAnswer}"]`);
                    if (correctLabel && correctLabel.parentElement) {
                        correctLabel.parentElement.classList.add('correct-answer');
                    }
                }
            } else {
                unanswered++;
                // 标记正确答案
                const correctLabel = document.querySelector(`label[for="q${number}${correctAnswer}"]`);
                if (correctLabel && correctLabel.parentElement) {
                    correctLabel.parentElement.classList.add('unanswered');
                }
            }
        });
        
        const score = Math.round((correct / totalQuestions) * 100);
        const resultsContainer = document.getElementById('test-results');
        
        let feedback = '';
        if (score >= 90) {
            feedback = '优秀！你的阅读理解能力非常强！';
        } else if (score >= 70) {
            feedback = '很好！你有扎实的阅读基础。';
        } else if (score >= 60) {
            feedback = '及格，继续加油！';
        } else {
            feedback = '需要加强训练，不要气馁！';
        }
        
        resultsContainer.innerHTML = `
            <h4>测试结果</h4>
            <p>得分: <strong>${score}%</strong> (${correct}/${totalQuestions})</p>
            <p>${feedback}</p>
            ${unanswered > 0 ? `<p>你有${unanswered}道题未作答。</p>` : ''}
        `;
        
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function showAnswers(data) {
        const questions = document.querySelectorAll('.question');
        
        questions.forEach(question => {
            const explanation = question.querySelector('.explanation');
            if (explanation) {
                explanation.style.display = 'block';
            }
            
            const number = question.dataset.number;
            const correctAnswer = question.dataset.answer;
            
            // 高亮正确答案
            const correctLabel = document.querySelector(`label[for="q${number}${correctAnswer}"]`);
            if (correctLabel && correctLabel.parentElement) {
                correctLabel.parentElement.classList.add('show-correct');
            }
        });
        
        // 滚动到结果部分
        const resultsElement = document.getElementById('test-results');
        if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 从用户信息中获取教育背景
    function getUserEducationLevel() {
        // 从页面上的个人资料显示中获取
        const profileDisplay = document.getElementById('profile-display');
        const userProfile = profileDisplay ? profileDisplay.textContent.trim() : '';
        
        // 从用户配置文件中分析教育水平
        if (userProfile.includes('小学')) return '小学生';
        if (userProfile.includes('初中')) return '初中生';
        if (userProfile.includes('高中')) return '高中生';
        if (userProfile.includes('大学')) return '大学生';
        
        // 默认为高中水平
        return '高中生';
    }

    // 根据英文解析生成中文解析
    function generateChineseExplanation(explanation, testType) {
        // 如果解析本身就是中文，直接返回
        if (/[\u4e00-\u9fa5]/.test(explanation) && explanation.includes('因为')) {
            return explanation;
        }
        
        // 提取关键信息
        let result = '';
        
        if (testType === 'cloze') {
            // 完形填空的解析模式
            if (explanation.toLowerCase().includes('context') || explanation.toLowerCase().includes('paragraph')) {
                result = `这个选项正确，因为它最符合上下文的语境。根据段落内容，`;
            } else if (explanation.toLowerCase().includes('grammar') || explanation.toLowerCase().includes('tense')) {
                result = `这个选项正确，因为它符合句子的语法结构。在这个句子中，`;
            } else if (explanation.toLowerCase().includes('meaning') || explanation.toLowerCase().includes('definition')) {
                result = `这个选项正确，因为它的含义最适合这个句子。根据文章内容，`;
            } else if (explanation.toLowerCase().includes('collocation') || explanation.toLowerCase().includes('phrase')) {
                result = `这个选项正确，因为它是正确的固定搭配。在英语中，`;
            } else {
                result = `这个选项正确，因为它最符合文章的逻辑和内容。`;
            }
        } else {
            // 阅读理解的解析模式
            if (explanation.toLowerCase().includes('paragraph') || explanation.toLowerCase().includes('line')) {
                result = `这个选项正确，因为文章中明确提到了这一点。根据段落内容，`;
            } else if (explanation.toLowerCase().includes('infer') || explanation.toLowerCase().includes('imply')) {
                result = `这个选项正确，因为可以从文章内容推断出这个结论。虽然文章没有直接说明，但从上下文可以看出`;
            } else if (explanation.toLowerCase().includes('main idea') || explanation.toLowerCase().includes('theme')) {
                result = `这个选项正确，因为它抓住了文章的主旨。通读全文可以发现，`;
            } else if (explanation.toLowerCase().includes('detail') || explanation.toLowerCase().includes('specific')) {
                result = `这个选项正确，因为它准确描述了文章中的具体细节。在文章中，`;
            } else {
                result = `这个选项正确，因为它与文章内容一致。`;
            }
        }
        
        // 提取解析中的关键句子并添加到结果中
        const sentences = explanation.split(/[.!?]/).filter(s => s.trim().length > 0);
        let translatedContent = '';
        
        // 处理完整的英文解析，尝试转换为中文
        if (sentences.length > 0) {
            // 提取前1-3个句子作为补充
            const keyContent = sentences.slice(0, Math.min(3, sentences.length))
                .map(s => s.trim())
                .join('. ') + '.';
                
            // 简单翻译关键内容
            translatedContent = translateExplanationContent(keyContent);
            result += translatedContent;
        }
        
        return result;
    }
    
    // 辅助函数：简单翻译解释内容的关键部分
    function translateExplanationContent(content) {
        // 常见词汇和短语的简单翻译对照表
        const translations = {
            'the correct': '正确的',
            'answer': '答案',
            'option': '选项',
            'because': '因为',
            'context': '上下文',
            'paragraph': '段落',
            'text': '文本',
            'passage': '文章',
            'mentions': '提到',
            'states': '说明',
            'indicates': '表明',
            'suggests': '暗示',
            'implies': '暗示',
            'refers to': '指的是',
            'specifically': '特别地',
            'example': '例子',
            'instance': '例子',
            'however': '然而',
            'therefore': '因此',
            'thus': '因此',
            'main idea': '主旨',
            'theme': '主题',
            'author': '作者',
            'details': '细节',
            'information': '信息',
            'sentence': '句子',
            'meaning': '含义',
            'grammar': '语法',
            'tense': '时态',
            'verb': '动词',
            'noun': '名词',
            'adjective': '形容词',
            'adverb': '副词',
            'preposition': '介词',
            'conjunction': '连词',
            'phrase': '短语',
            'idiom': '习语',
            'expression': '表达',
            'vocabulary': '词汇',
            'word': '单词',
            'definition': '定义',
            'described': '描述的',
            'shown': '显示的',
            'illustrated': '说明的',
            'according to': '根据',
            'based on': '基于',
            'in this': '在这',
            'while': '而',
            'contrast': '对比',
            'comparison': '比较',
            'similar': '相似的',
            'different': '不同的'
        };
        
        // 替换常见词汇和短语
        let translated = content;
        for (const [eng, chi] of Object.entries(translations)) {
            const regex = new RegExp(`\\b${eng}\\b`, 'gi');
            translated = translated.replace(regex, chi);
        }
        
        // 添加简单的语法转换
        translated = translated
            .replace(/\bis\b/g, '是')
            .replace(/\bare\b/g, '是')
            .replace(/\bwas\b/g, '是')
            .replace(/\bwere\b/g, '是')
            .replace(/\bthe\b/g, '')
            .replace(/\ba\b/g, '')
            .replace(/\ban\b/g, '')
            .replace(/\bof\b/g, '的')
            .replace(/\bin\b/g, '在')
            .replace(/\bon\b/g, '在')
            .replace(/\bat\b/g, '在')
            .replace(/\bto\b/g, '到')
            .replace(/\band\b/g, '和')
            .replace(/\bor\b/g, '或')
            .replace(/\bbut\b/g, '但')
            .replace(/\bfor\b/g, '为了')
            .replace(/\bwith\b/g, '与')
            .replace(/\bnot\b/g, '不')
            .replace(/\bthis\b/g, '这个')
            .replace(/\bthat\b/g, '那个')
            .replace(/\bthese\b/g, '这些')
            .replace(/\bthose\b/g, '那些')
            .replace(/\bthere\b/g, '那里')
            .replace(/\bhere\b/g, '这里');
            
        // 根据标点符号添加中文标点
        translated = translated
            .replace(/\./g, '。')
            .replace(/,/g, '，')
            .replace(/!/g, '！')
            .replace(/\?/g, '？')
            .replace(/;/g, '；')
            .replace(/:/g, '：')
            .replace(/"/g, '"')
            .replace(/"/g, '"');
            
        return translated;
    }

    // 重写词汇轮播初始化函数，确保正确显示
    function initVocabCarousel() {
        const carouselContainer = document.querySelector('.vocab-carousel');
        const prevBtn = document.querySelector('.vocab-prev');
        const nextBtn = document.querySelector('.vocab-next');
        const cards = document.querySelectorAll('.vocab-card.enhanced');
        const currentCardEl = document.querySelector('.current-card');
        const totalCardsEl = document.querySelector('.total-cards');
        
        if (!carouselContainer || !prevBtn || !nextBtn || !cards.length) {
            console.log('Vocab carousel elements not found', {
                carouselContainer: !!carouselContainer,
                prevBtn: !!prevBtn,
                nextBtn: !!nextBtn,
                cardsLength: cards.length
            });
            return;
        }
        
        console.log('Initializing vocab carousel with', cards.length, 'cards');
        
        // 设置计数器
        totalCardsEl.textContent = cards.length;
        
        let currentIndex = 0;
        
        // 确保所有卡片正确显示
        cards.forEach((card, index) => {
            // 移除之前可能的active类
            card.classList.remove('active');
            
            // 设置初始状态
            card.style.display = 'none';
            card.style.opacity = '0';
            card.style.zIndex = '0';
        });
        
        // 显示第一张卡片
        if (cards.length > 0) {
            cards[0].classList.add('active');
            cards[0].style.display = 'block';
            cards[0].style.opacity = '1';
            cards[0].style.zIndex = '2';
            currentCardEl.textContent = '1';
        }
        
        // 更新导航按钮状态
        updateNavButtons();
        
        // 添加事件监听
        prevBtn.addEventListener('click', function() {
            console.log('Previous button clicked');
            if (currentIndex > 0) {
                showCard(--currentIndex);
            }
        });
        
        nextBtn.addEventListener('click', function() {
            console.log('Next button clicked');
            if (currentIndex < cards.length - 1) {
                showCard(++currentIndex);
            }
        });
        
        // 添加"更多词汇"按钮事件处理
        const moreWordsBtn = document.getElementById('more-words');
        if (moreWordsBtn) {
            moreWordsBtn.addEventListener('click', function() {
                console.log('More words button clicked');
                generateVocabulary();
            });
        }
        
        // 添加"练习全部"按钮事件处理
        const practiceAllBtn = document.getElementById('practice-vocab');
        if (practiceAllBtn) {
            practiceAllBtn.addEventListener('click', function() {
                alert('词汇练习功能即将推出！');
            });
        }
        
        // 为每个单词卡的保存和练习按钮添加事件
        document.querySelectorAll('.save-word').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const card = this.closest('.vocab-card');
                const word = card.querySelector('h4').textContent;
                alert(`单词"${word}"已保存到生词本！`);
            });
        });
        
        document.querySelectorAll('.vocab-practice').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const card = this.closest('.vocab-card');
                const word = card.querySelector('h4').textContent;
                alert(`开始练习"${word}"！`);
            });
        });
        
        function showCard(index) {
            console.log('Showing card', index);
            
            // 隐藏所有卡片
            cards.forEach((card) => {
                card.classList.remove('active');
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.zIndex = '0';
            });
            
            // 显示当前卡片
            if (cards[index]) {
                cards[index].classList.add('active');
                cards[index].style.display = 'block';
                cards[index].style.opacity = '1';
                cards[index].style.zIndex = '2';
                currentCardEl.textContent = index + 1;
            }
            
            // 更新导航按钮
            updateNavButtons();
        }
        
        function updateNavButtons() {
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === cards.length - 1;
        }
        
        // 标记为已初始化
        window.vocabCarouselInitialized = true;
        window.vocabCarouselPending = false;
        
        console.log('Vocab carousel initialization complete');
    }
}); 