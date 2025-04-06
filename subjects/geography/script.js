document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const chatMessages = document.getElementById('geography-chat-messages');
    const questionInput = document.getElementById('geography-question-input');
    const sendButton = document.getElementById('send-geography-question');
    const topicCards = document.querySelectorAll('.topic-card');
    
    // 存储聊天历史
    let chatHistory = [
        {
            "role": "system",
            "content": "你是一个专业的地理教学助手，擅长解答关于地形地貌、气候、人文地理、经济地理、环境保护等问题。你会提供清晰的解释、地理概念和适合用户教育水平的答案。"
        },
        {
            "role": "assistant",
            "content": "你好！我是你的地理学习助手。有什么关于地理的问题我可以帮你解答吗？"
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
            case 'physical-geography':
                topicPrompt = "地球的主要地形地貌有哪些？它们是如何形成的？";
                break;
            case 'climate':
                topicPrompt = "全球的主要气候类型有哪些？气候变化对地球有什么影响？";
                break;
            case 'human-geography':
                topicPrompt = "人口分布与自然环境有什么关系？城市化的影响是什么？";
                break;
            case 'economic-geography':
                topicPrompt = "世界经济地理格局是怎样的？资源分布如何影响经济发展？";
                break;
            case 'environmental':
                topicPrompt = "当前的主要环境问题有哪些？可持续发展的策略是什么？";
                break;
            case 'world-geography':
                topicPrompt = "介绍一下世界主要国家的地理特征以及它们的文化特点。";
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
                levelSpecificPrompt = '用户是小学生，请使用简单、基础的地理概念进行解释，多用直观例子和图解，避免复杂术语。重点讲解基本的地形、气候和文化地理知识。';
                break;
            case 'middle-school':
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的地理概念，包括地形成因、气候分区和人文地理，平衡简洁性和教育性。';
                break;
            case 'high-school':
                levelSpecificPrompt = '用户是高中生，可以讨论更复杂的地理概念，包括地质构造、气候系统、人口迁移和经济发展等高级内容，可以使用专业术语并深入分析地理现象。';
                break;
            default:
                levelSpecificPrompt = '用户是初中生，可以介绍基础到中等难度的地理概念，包括地形成因、气候分区和人文地理，平衡简洁性和教育性。';
        }
        
        // 添加主题特定提示
        let topicSpecificPrompt = '';
        
        if (currentTopic) {
            switch(currentTopic) {
                case 'physical-geography':
                    topicSpecificPrompt = '用户正在学习自然地理。请专注于地形地貌、地质构造、河流水系等概念，并提供清晰的成因解释和典型案例。';
                    break;
                case 'climate':
                    topicSpecificPrompt = '用户正在学习气候地理。请专注于气候类型、气候形成因素、气候变化等概念，并提供各气候带的特征和分布。';
                    break;
                case 'human-geography':
                    topicSpecificPrompt = '用户正在学习人文地理。请专注于人口分布、民族文化、城市化等概念，并结合社会现象进行分析。';
                    break;
                case 'economic-geography':
                    topicSpecificPrompt = '用户正在学习经济地理。请专注于产业分布、资源利用、贸易关系等概念，并解释区域经济发展差异的原因。';
                    break;
                case 'environmental':
                    topicSpecificPrompt = '用户正在学习环境地理。请专注于环境问题、生态保护、可持续发展等概念，并提供环保措施和案例分析。';
                    break;
                case 'world-geography':
                    topicSpecificPrompt = '用户正在学习世界地理。请专注于国家和地区概况、区域特征、国际关系等内容，并提供地理位置和文化背景信息。';
                    break;
                default:
                    topicSpecificPrompt = '';
            }
        }
        
        // 更新系统消息
        chatHistory[0].content = "你是一个专业的地理教学助手，擅长解答关于地形地貌、气候、人文地理、经济地理、环境保护等问题。提供清晰的解释和适当深度的回答。" + levelSpecificPrompt + (topicSpecificPrompt ? " " + topicSpecificPrompt : "") + " 当回答地理问题时，请在必要时引用地理数据和实例，可使用简单的图表描述帮助理解。";
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
    
    // 处理地图交互
    const mapContainer = document.getElementById('interactive-map');
    const mapInfo = document.getElementById('map-info');
    
    if (mapContainer && mapInfo) {
        // 模拟地图区域点击事件
        const regions = mapContainer.querySelectorAll('.map-region');
        
        if (regions.length > 0) {
            regions.forEach(region => {
                region.addEventListener('click', function() {
                    const regionId = this.getAttribute('data-region');
                    showRegionInfo(regionId);
                    
                    // 高亮选中的区域
                    regions.forEach(r => r.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        } else {
            // 如果没有找到真实的地图区域元素，创建模拟的地图交互
            createSimulatedMap();
        }
        
        function createSimulatedMap() {
            mapContainer.innerHTML = `
                <div class="simulated-map">
                    <div class="map-region" data-region="asia">亚洲</div>
                    <div class="map-region" data-region="europe">欧洲</div>
                    <div class="map-region" data-region="africa">非洲</div>
                    <div class="map-region" data-region="north-america">北美洲</div>
                    <div class="map-region" data-region="south-america">南美洲</div>
                    <div class="map-region" data-region="oceania">大洋洲</div>
                    <div class="map-region" data-region="antarctica">南极洲</div>
                </div>
                <p class="map-instruction">点击一个区域查看详细信息</p>
            `;
            
            // 为模拟地图添加样式
            const mapStyle = document.createElement('style');
            mapStyle.textContent = `
                .simulated-map {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .map-region {
                    padding: 20px;
                    text-align: center;
                    background-color: #f5f5f5;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .map-region:hover, .map-region.active {
                    background-color: var(--primary-color);
                    color: white;
                    transform: translateY(-5px);
                }
                
                .map-instruction {
                    text-align: center;
                    font-style: italic;
                    color: #666;
                }
            `;
            document.head.appendChild(mapStyle);
            
            // 为新创建的区域添加点击事件
            const newRegions = mapContainer.querySelectorAll('.map-region');
            newRegions.forEach(region => {
                region.addEventListener('click', function() {
                    const regionId = this.getAttribute('data-region');
                    showRegionInfo(regionId);
                    
                    // 高亮选中的区域
                    newRegions.forEach(r => r.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }
        
        function showRegionInfo(regionId) {
            // 显示加载状态
            mapInfo.innerHTML = '<p class="loading">正在加载区域信息...</p>';
            
            // 模拟加载延迟
            setTimeout(() => {
                // 区域信息数据库
                const regionsData = {
                    'asia': {
                        name: '亚洲',
                        area: '4,457万平方公里',
                        population: '约48亿人',
                        countries: '约50个国家',
                        features: '世界上面积最大、人口最多的大洲，拥有世界上最高的山脉（喜马拉雅山）和最深的海沟（马里亚纳海沟）。气候多样，从热带到极地气候都有。经济发展差异巨大，包括日本、中国、韩国等经济强国，也有一些世界上最不发达的国家。',
                        landmarks: '长城（中国）、泰姬陵（印度）、吴哥窟（柬埔寨）、富士山（日本）、迪拜塔（阿联酋）'
                    },
                    'europe': {
                        name: '欧洲',
                        area: '1,018万平方公里',
                        population: '约7.5亿人',
                        countries: '约50个国家',
                        features: '欧洲是世界第六大洲，地形多样，包括平原、山脉和海岸线。气候从北部的亚寒带到南部的地中海气候。是工业革命的发源地，拥有发达的经济体系和丰富的文化遗产。',
                        landmarks: '埃菲尔铁塔（法国）、罗马斗兽场（意大利）、雅典卫城（希腊）、伦敦塔桥（英国）、圣彼得大教堂（梵蒂冈）'
                    },
                    'africa': {
                        name: '非洲',
                        area: '3,036万平方公里',
                        population: '约13亿人',
                        countries: '54个国家',
                        features: '非洲是世界第二大洲，拥有世界上最大的沙漠（撒哈拉沙漠）和最长的河流之一（尼罗河）。气候以热带为主，生物多样性丰富。经济正在发展中，但仍面临贫困、疾病和政治不稳定等挑战。',
                        landmarks: '金字塔（埃及）、维多利亚瀑布（赞比亚/津巴布韦）、桌山（南非）、塞伦盖蒂国家公园（坦桑尼亚）'
                    },
                    'north-america': {
                        name: '北美洲',
                        area: '2,462万平方公里',
                        population: '约5.9亿人',
                        countries: '23个国家',
                        features: '北美拥有多样的地形，从北极苔原到热带雨林。拥有五大湖、落基山脉和密西西比河等重要地理特征。美国和加拿大是世界上最发达的国家之一，经济高度发达。',
                        landmarks: '自由女神像（美国）、尼亚加拉瀑布（美国/加拿大）、大峡谷（美国）、奇琴伊察金字塔（墨西哥）'
                    },
                    'south-america': {
                        name: '南美洲',
                        area: '1,784万平方公里',
                        population: '约4.3亿人',
                        countries: '12个国家',
                        features: '南美洲有世界上最长的山脉（安第斯山脉）和最大的雨林（亚马逊雨林）。气候从热带到温带都有。拥有丰富的自然资源和生物多样性。经济发展不均衡，巴西是最大的经济体。',
                        landmarks: '耶稣基督像（巴西）、马丘比丘（秘鲁）、伊瓜苏瀑布（阿根廷/巴西）、复活节岛（智利）'
                    },
                    'oceania': {
                        name: '大洋洲',
                        area: '900万平方公里',
                        population: '约4,200万人',
                        countries: '14个国家',
                        features: '大洋洲主要由澳大利亚大陆和太平洋上的数千个岛屿组成。拥有大堡礁等独特的生态系统和大量特有物种。澳大利亚和新西兰是发达国家，太平洋岛国经济主要依赖旅游业和农业。',
                        landmarks: '悉尼歌剧院（澳大利亚）、艾尔斯岩/乌卢鲁（澳大利亚）、米尔福德峡湾（新西兰）、波拉波拉岛（法属波利尼西亚）'
                    },
                    'antarctica': {
                        name: '南极洲',
                        area: '1,400万平方公里',
                        population: '无常住人口（科研人员约1,000-5,000人）',
                        countries: '无主权国家（由《南极条约》管理）',
                        features: '南极洲是地球上最冷、最干燥、风速最高的大陆，98%的陆地被冰雪覆盖。平均厚度约为2,100米的冰层下隐藏着山脉和湖泊。没有原住民，只有科研站和临时科研人员。拥有世界上90%的淡水冰储量。',
                        landmarks: '南极点、冰山、维尔纳德山脉、麦克默多科考站'
                    }
                };
                
                // 获取选定区域的数据
                const regionData = regionsData[regionId] || null;
                
                if (regionData) {
                    mapInfo.innerHTML = `
                        <div class="region-card">
                            <div class="region-header">
                                <h3>${regionData.name}</h3>
                                <div class="region-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">面积:</span>
                                        <span class="stat-value">${regionData.area}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">人口:</span>
                                        <span class="stat-value">${regionData.population}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">国家数:</span>
                                        <span class="stat-value">${regionData.countries}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="region-features">
                                <h4>地理特征与社会经济</h4>
                                <p>${regionData.features}</p>
                            </div>
                            <div class="region-landmarks">
                                <h4>著名地标</h4>
                                <p>${regionData.landmarks}</p>
                            </div>
                        </div>
                    `;
                } else {
                    mapInfo.innerHTML = `
                        <div class="region-card">
                            <h3>区域信息未找到</h3>
                            <p>抱歉，没有关于"${regionId}"的详细信息。请选择其他区域。</p>
                        </div>
                    `;
                }
            }, 1000);
        }
    }
}); 