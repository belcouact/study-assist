document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const chatMessages = document.getElementById('chinese-chat-messages');
    const questionInput = document.getElementById('chinese-question-input');
    const sendButton = document.getElementById('send-chinese-question');
    const topicCards = document.querySelectorAll('.topic-card');
    
    // 存储聊天历史
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的汉语教学助手，擅长解答关于汉字、语法、文学、阅读、写作和书法等问题。你会提供清晰的解释和适合用户教育水平的答案。"
        },
        {
            "role": "assistant",
            "content": "你好！我是你的汉语学习助手。有什么关于汉语的问题我可以帮你解答吗？"
        }
    ];
    
    // 教育水平相关
    let educationLevel = localStorage.getItem('educationLevel') || 'middle-school';
    
    // 当前选择的主题
    let currentTopic = null;
    
    // 监听发送按钮点击
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // 监听输入框回车事件
    if (questionInput) {
        questionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
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
            if (questionInput) {
                questionInput.focus();
            }
        });
    });
    
    // 从页面加载时初始化聊天界面
    initializeChat();
    
    // 初始化聊天界面
    function initializeChat() {
        // 清空聊天区域
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
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
            case 'characters':
                topicPrompt = "汉字的构成要素有哪些？如何区分形近字？";
                break;
            case 'reading':
                topicPrompt = "如何提高阅读理解能力？有什么好的阅读策略？";
                break;
            case 'grammar':
                topicPrompt = "汉语的基本句型结构是什么？如何正确使用虚词？";
                break;
            case 'writing':
                topicPrompt = "如何写好一篇记叙文？文章结构应该怎么安排？";
                break;
            case 'literature':
                topicPrompt = "中国古典文学的主要流派有哪些？能推荐几部经典作品吗？";
                break;
            case 'calligraphy':
                topicPrompt = "书法的基本笔画有哪些？练习书法有什么技巧？";
                break;
            default:
                return;
        }
        
        // 自动在输入框中填入主题相关问题
        if (questionInput) {
            questionInput.value = topicPrompt;
        }
    }
    
    // 更新系统提示
    function updateSystemPrompt() {
        let levelSpecificPrompt = '';
        
        switch(educationLevel) {
            case 'elementary-school':
                levelSpecificPrompt = '用户是小学生，请使用简单、基础的汉语概念进行解释，多用直观例子和图解，避免复杂术语。重点讲解基础的汉字、句型和阅读理解。';
                break;
            case 'middle-school':
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的汉语概念，包括词语搭配、修辞手法和简单的文学鉴赏，平衡简洁性和教育性。';
                break;
            case 'high-school':
                levelSpecificPrompt = '用户是高中生，可以讨论更复杂的汉语概念，包括文言文解析、深度文学赏析和写作技巧等高级内容，可以引用经典作品和文学理论。';
                break;
            default:
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的汉语概念，包括词语搭配、修辞手法和简单的文学鉴赏，平衡简洁性和教育性。';
        }
        
        // 添加主题特定提示
        let topicSpecificPrompt = '';
        
        if (currentTopic) {
            switch(currentTopic) {
                case 'characters':
                    topicSpecificPrompt = '用户正在学习汉字。请专注于汉字的起源、结构、部首、笔顺等概念，并提供记忆方法和练习建议。';
                    break;
                case 'reading':
                    topicSpecificPrompt = '用户正在提高阅读能力。请专注于阅读理解策略、文本分析方法、词义理解等方面，并提供适合的阅读材料推荐。';
                    break;
                case 'grammar':
                    topicSpecificPrompt = '用户正在学习汉语语法。请专注于句型结构、词性、时态、语态等语法概念，并提供常见语法错误分析和纠正方法。';
                    break;
                case 'writing':
                    topicSpecificPrompt = '用户正在提高写作能力。请专注于文章结构、表达技巧、修辞手法等写作要素，并提供写作指导和范文分析。';
                    break;
                case 'literature':
                    topicSpecificPrompt = '用户正在学习中国文学。请专注于文学流派、代表作品、作家背景等内容，并提供文学作品的赏析和解读。';
                    break;
                case 'calligraphy':
                    topicSpecificPrompt = '用户正在学习书法。请专注于书法的历史、流派、技法、工具等方面，并提供书法练习的方法和欣赏指导。';
                    break;
                default:
                    topicSpecificPrompt = '';
            }
        }
        
        // 更新系统消息
        chatHistory[0].content = "你是一个专业的汉语教学助手，擅长解答关于汉字、语法、文学、阅读、写作和书法等问题。提供清晰的解释和适当深度的回答。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 当回答问题时，可以适当引用诗词名句或经典文学作品，增强回答的文化内涵。";
    }
    
    // 显示聊天历史
    function displayChatHistory() {
        if (!chatMessages) return;
        
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
        if (!questionInput || !chatMessages) return;
        
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
        if (!chatMessages) return;
        
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
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
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
    
    // 处理汉字字典查询
    const dictionaryInput = document.getElementById('dictionary-input');
    const searchButton = document.getElementById('search-character');
    const dictionaryResults = document.getElementById('dictionary-results');
    
    if (dictionaryInput && searchButton && dictionaryResults) {
        searchButton.addEventListener('click', function() {
            const character = dictionaryInput.value.trim();
            if (!character) return;
            
            // 显示加载状态
            dictionaryResults.innerHTML = '<p class="loading">正在查询...</p>';
            
            // 模拟加载延迟
            setTimeout(() => {
                // 构建一个简单的汉字数据库（实际应用中可以使用API或更完整的数据）
                const characters = {
                    '爱': {
                        pinyin: 'ài',
                        radical: '爪',
                        strokes: 10,
                        meaning: '喜爱、热爱、爱情',
                        examples: ['爱心', '爱情', '爱国'],
                        etymology: '会意字，从爪从心，表示用心抓取、珍视'
                    },
                    '学': {
                        pinyin: 'xué',
                        radical: '子',
                        strokes: 8,
                        meaning: '学习、效法、学问',
                        examples: ['学校', '学生', '学问'],
                        etymology: '会意字，从子从冖，表示在屋檐下学习'
                    },
                    '中': {
                        pinyin: 'zhōng',
                        radical: '丨',
                        strokes: 4,
                        meaning: '中间、中国、命中',
                        examples: ['中心', '中国', '中间'],
                        etymology: '象形字，表示箭射中靶心'
                    },
                    '道': {
                        pinyin: 'dào',
                        radical: '辶',
                        strokes: 12,
                        meaning: '道路、道理、方法',
                        examples: ['道路', '道德', '道理'],
                        etymology: '会意字，从辶从首，表示头脑指引前进的方向'
                    },
                    '家': {
                        pinyin: 'jiā',
                        radical: '宀',
                        strokes: 10,
                        meaning: '家庭、家族、专家',
                        examples: ['家庭', '专家', '国家'],
                        etymology: '会意字，从宀从豕，表示家中养猪'
                    }
                };
                
                // 查找匹配的汉字
                const characterInfo = characters[character] || null;
                
                if (characterInfo) {
                    dictionaryResults.innerHTML = `
                        <div class="character-card">
                            <div class="character-header">
                                <div class="character-display">${character}</div>
                                <div class="character-basics">
                                    <div class="pinyin">${characterInfo.pinyin}</div>
                                    <div class="info">部首：${characterInfo.radical} | 笔画：${characterInfo.strokes}</div>
                                </div>
                            </div>
                            <div class="character-details">
                                <div class="meaning">
                                    <h4>释义</h4>
                                    <p>${characterInfo.meaning}</p>
                                </div>
                                <div class="examples">
                                    <h4>例词</h4>
                                    <p>${characterInfo.examples.join('、')}</p>
                                </div>
                                <div class="etymology">
                                    <h4>字源</h4>
                                    <p>${characterInfo.etymology}</p>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    dictionaryResults.innerHTML = `
                        <div class="no-results">
                            <h3>未找到结果</h3>
                            <p>抱歉，未找到"${character}"的相关信息。请尝试其他汉字，如：爱、学、中、道、家</p>
                        </div>
                    `;
                }
            }, 1000);
        });
        
        // 监听输入框回车事件
        dictionaryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
        
        // 分类按钮点击事件
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // 高亮当前选中的分类
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // 显示加载状态
                dictionaryResults.innerHTML = '<p class="loading">加载中...</p>';
                
                // 模拟加载延迟
                setTimeout(() => {
                    // 根据不同分类显示不同内容
                    switch(category) {
                        case 'common':
                            dictionaryResults.innerHTML = `
                                <div class="category-results">
                                    <h3>常用汉字</h3>
                                    <div class="character-grid">
                                        <div class="character-item" data-char="爱">爱</div>
                                        <div class="character-item" data-char="学">学</div>
                                        <div class="character-item" data-char="中">中</div>
                                        <div class="character-item" data-char="道">道</div>
                                        <div class="character-item" data-char="家">家</div>
                                        <div class="character-item" data-char="人">人</div>
                                        <div class="character-item" data-char="日">日</div>
                                        <div class="character-item" data-char="月">月</div>
                                        <div class="character-item" data-char="水">水</div>
                                        <div class="character-item" data-char="火">火</div>
                                        <div class="character-item" data-char="山">山</div>
                                        <div class="character-item" data-char="木">木</div>
                                    </div>
                                    <p class="hint">点击汉字查看详细信息</p>
                                </div>
                            `;
                            break;
                        case 'radicals':
                            dictionaryResults.innerHTML = `
                                <div class="category-results">
                                    <h3>常用部首</h3>
                                    <div class="radical-grid">
                                        <div class="radical-item" title="人字旁">亻</div>
                                        <div class="radical-item" title="提手旁">扌</div>
                                        <div class="radical-item" title="草字头">艹</div>
                                        <div class="radical-item" title="水字旁">氵</div>
                                        <div class="radical-item" title="木字旁">木</div>
                                        <div class="radical-item" title="口字旁">口</div>
                                        <div class="radical-item" title="心字底">心</div>
                                        <div class="radical-item" title="宝盖头">宀</div>
                                        <div class="radical-item" title="日字旁">日</div>
                                        <div class="radical-item" title="月字旁">月</div>
                                    </div>
                                    <div class="radical-info">
                                        <h4>部首简介</h4>
                                        <p>部首是汉字的重要组成部分，用于分类和检索汉字。汉字可按部首分为214个类别（康熙字典）。通过部首可以了解汉字的意义类别和结构特点。</p>
                                    </div>
                                </div>
                            `;
                            break;
                        case 'strokes':
                            dictionaryResults.innerHTML = `
                                <div class="category-results">
                                    <h3>基本笔画</h3>
                                    <div class="strokes-grid">
                                        <div class="stroke-item">
                                            <div class="stroke-name">横</div>
                                            <div class="stroke-example">一</div>
                                        </div>
                                        <div class="stroke-item">
                                            <div class="stroke-name">竖</div>
                                            <div class="stroke-example">丨</div>
                                        </div>
                                        <div class="stroke-item">
                                            <div class="stroke-name">撇</div>
                                            <div class="stroke-example">丿</div>
                                        </div>
                                        <div class="stroke-item">
                                            <div class="stroke-name">捺</div>
                                            <div class="stroke-example">㇏</div>
                                        </div>
                                        <div class="stroke-item">
                                            <div class="stroke-name">点</div>
                                            <div class="stroke-example">丶</div>
                                        </div>
                                        <div class="stroke-item">
                                            <div class="stroke-name">提</div>
                                            <div class="stroke-example">㇀</div>
                                        </div>
                                        <div class="stroke-item">
                                            <div class="stroke-name">折</div>
                                            <div class="stroke-example">㇇</div>
                                        </div>
                                        <div class="stroke-item">
                                            <div class="stroke-name">钩</div>
                                            <div class="stroke-example">㇁</div>
                                        </div>
                                    </div>
                                    <div class="strokes-info">
                                        <h4>笔画与笔顺</h4>
                                        <p>汉字笔画是构成汉字的基本单位，书写汉字时需要遵循一定的笔顺规则，如：横、竖、撇、捺、点等基本笔画，以及从左到右、从上到下等书写顺序。</p>
                                    </div>
                                </div>
                            `;
                            break;
                        case 'idioms':
                            dictionaryResults.innerHTML = `
                                <div class="category-results">
                                    <h3>常用成语</h3>
                                    <div class="idioms-list">
                                        <div class="idiom-item">
                                            <div class="idiom-text">画龙点睛</div>
                                            <div class="idiom-meaning">比喻在关键处加以点缀使作品更为生动传神</div>
                                        </div>
                                        <div class="idiom-item">
                                            <div class="idiom-text">一目了然</div>
                                            <div class="idiom-meaning">一眼就能看清楚，形容事物清楚明白</div>
                                        </div>
                                        <div class="idiom-item">
                                            <div class="idiom-text">守株待兔</div>
                                            <div class="idiom-meaning">比喻死守狭隘经验，不知变通的愚蠢行为</div>
                                        </div>
                                        <div class="idiom-item">
                                            <div class="idiom-text">无懈可击</div>
                                            <div class="idiom-meaning">形容非常严密，找不到任何缺点</div>
                                        </div>
                                        <div class="idiom-item">
                                            <div class="idiom-text">学而不思则罔</div>
                                            <div class="idiom-meaning">只学习不思考就会迷惑而无所得</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                            break;
                        case 'classical':
                            dictionaryResults.innerHTML = `
                                <div class="category-results">
                                    <h3>古文经典</h3>
                                    <div class="classical-list">
                                        <div class="classical-item">
                                            <div class="classical-title">《论语》</div>
                                            <div class="classical-excerpt">子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"</div>
                                        </div>
                                        <div class="classical-item">
                                            <div class="classical-title">《孟子》</div>
                                            <div class="classical-excerpt">故天将降大任于斯人也，必先苦其心志，劳其筋骨，饿其体肤，空乏其身，行拂乱其所为，所以动心忍性，曾益其所不能。</div>
                                        </div>
                                        <div class="classical-item">
                                            <div class="classical-title">《道德经》</div>
                                            <div class="classical-excerpt">道可道，非常道。名可名，非常名。无名天地之始，有名万物之母。</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                            break;
                        default:
                            dictionaryResults.innerHTML = '<p>请选择一个分类查看内容</p>';
                    }
                    
                    // 为动态生成的汉字添加点击事件
                    const characterItems = document.querySelectorAll('.character-item');
                    if (characterItems.length > 0) {
                        characterItems.forEach(item => {
                            item.addEventListener('click', function() {
                                const char = this.getAttribute('data-char');
                                if (char) {
                                    dictionaryInput.value = char;
                                    searchButton.click();
                                }
                            });
                        });
                    }
                    
                }, 800);
            });
        });
    }
}); 