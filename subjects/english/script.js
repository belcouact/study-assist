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
        
        // 获取用户的教育水平
        const profileDisplay = document.getElementById('profile-display');
        const userProfile = profileDisplay ? profileDisplay.textContent.trim() : '';
        const educationLevel = getEducationLevelFromProfile(userProfile);
        
        // 显示加载
        vocabContainer.innerHTML = '<p class="loading">正在生成词汇列表...</p>';
        
        try {
            // 构建系统消息
            const systemMessage = `你是一个专业的英语词汇教学助手。请生成一个包含8个${getLevelName(level)}难度的${getCategoryName(category)}词汇列表。

根据用户的教育水平(${educationLevel})调整词汇和解释的复杂度。

对每个单词，提供以下详细信息：
1) 英文单词
2) 音标发音（英式和美式）
3) 中文定义（按词性分类）
4) 词性（名词/动词/形容词等）
5) 3-4个相关词组或搭配及其中文意思
6) 近义词和反义词（如果有）
7) 词源简介（如果有趣或有帮助）
8) 使用该单词的2个例句（附中文翻译）
9) 记忆技巧或助记方法
10) 在实际语境中的应用场景

使每个单词的学习内容生动、有趣且易于记忆。适合${educationLevel}学生的知识水平和兴趣。`;
            
            // 构建用户消息
            const userPrompt = `请生成8个${getLevelName(level)}难度的${getCategoryName(category)}词汇，包含完整的学习信息（音标、词性、中文释义、例句、词组等）。这些词汇将用于我作为一名${educationLevel}学生的英语学习。`;
            
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
    
    // 辅助函数 - 格式化词汇响应
    function formatVocabularyResponse(response, level, category) {
        // 提取单词列表
        const words = extractEnhancedWords(response);
        console.log("Extracted enhanced words:", words);
        
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
                <div class="vocab-card enhanced">
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
            <div class="vocab-actions">
                <button class="btn btn-primary" id="more-words">更多词汇</button>
                <button class="btn btn-secondary" id="practice-vocab">练习全部</button>
            </div>
            
            <style>
                .vocab-card.enhanced {
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
                    margin-bottom: 20px;
                    padding: 0;
                    overflow: hidden;
                    transition: transform 0.2s;
                }
                
                .vocab-card.enhanced:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                
                .vocab-header {
                    background: linear-gradient(135deg, #4361ee, #7209b7);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px 10px 0 0;
                }
                
                .vocab-header h4 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                
                .pronunciation {
                    font-family: Arial, sans-serif;
                    margin-top: 5px;
                    opacity: 0.9;
                }
                
                .vocab-content {
                    padding: 15px 20px;
                }
                
                .vocab-section {
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .vocab-section:last-child {
                    border-bottom: none;
                }
                
                .section-title {
                    margin-bottom: 8px;
                    color: #4361ee;
                }
                
                .part-of-speech {
                    display: inline-block;
                    padding: 3px 8px;
                    background: #f0f4ff;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    margin-bottom: 5px;
                }
                
                .phrases-list, .examples-list {
                    padding-left: 20px;
                }
                
                .phrases-list li, .examples-list li {
                    margin-bottom: 5px;
                }
                
                .memory-tip {
                    background: #fffaf0;
                    padding: 10px;
                    border-radius: 5px;
                    font-style: italic;
                }
                
                .vocab-footer {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #eee;
                }
                
                .btn-outline {
                    background: transparent;
                    border: 1px solid #4361ee;
                    color: #4361ee;
                }
                
                .btn-outline:hover {
                    background: #4361ee;
                    color: white;
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
        
        // 如果没有成功提取单词，使用备用数据
        if (words.length === 0) {
            console.log("No words extracted, using fallback examples");
            return [
                {
                    word: 'Eloquent',
                    pronunciation: '[ˈeləkwənt]',
                    partOfSpeech: '形容词 (adj.)',
                    definition: '口齿流利的；有说服力的；雄辩的',
                    phrases: [
                        'eloquent speech - 雄辩的演讲',
                        'eloquent plea - 有说服力的恳求',
                        'eloquent silence - 意味深长的沉默'
                    ],
                    examples: [
                        'She gave an eloquent speech that moved the audience. - 她发表了一场动人的演讲，打动了观众。',
                        'His eloquent defense of the policy convinced many skeptics. - 他对该政策的雄辩辩护说服了许多怀疑者。'
                    ],
                    synonymsAntonyms: '近义词: articulate, expressive, fluent; 反义词: inarticulate, inexpressive',
                    memoryTip: '记忆提示: "elo-" 来源于拉丁语 eloqui（表达），想象一个人能"流利地说出"（e-loquent）自己的想法。'
                },
                {
                    word: 'Meticulous',
                    pronunciation: '[məˈtɪkjələs]',
                    partOfSpeech: '形容词 (adj.)',
                    definition: '一丝不苟的；小心谨慎的；注重细节的',
                    phrases: [
                        'meticulous attention to detail - 对细节的一丝不苟',
                        'meticulous planning - 周密的计划',
                        'meticulous research - 细致的研究'
                    ],
                    examples: [
                        'He is meticulous about keeping accurate records. - 他对保持准确的记录非常严谨。',
                        'The restoration work was done with meticulous care. - 修复工作是以极其细致的态度完成的。'
                    ],
                    synonymsAntonyms: '近义词: careful, precise, thorough; 反义词: careless, sloppy, negligent',
                    memoryTip: '记忆提示: "meti-" 源自拉丁语 metus（恐惧），一个"过于害怕"出错的人会非常谨慎。'
                }
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

    // 初始化测验生成器
    function initQuizGenerator() {
        const generateBtn = document.getElementById('generate-quiz');
        const quizContainer = document.getElementById('quiz-container');
        
        if (!generateBtn || !quizContainer) return;
        
        generateBtn.addEventListener('click', async () => {
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
            
            const confirmBtn = document.getElementById('confirm-answer');
            confirmBtn.addEventListener('click', () => {
                const feedback = quizContainer.querySelector('.quiz-feedback');
                feedback.style.display = 'block';
                confirmBtn.disabled = true;
                
                // 禁用所有选项
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
}); 