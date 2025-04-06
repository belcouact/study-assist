document.addEventListener('DOMContentLoaded', function() {
    // Initialize API
    initAPI();
    
    // Science chat functionality
    const chatInput = document.getElementById('science-question-input');
    const sendButton = document.getElementById('send-science-question');
    const chatMessages = document.getElementById('science-chat-messages');
    
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
            loadingMessage.innerHTML = '<p>分析科学问题中...</p>';
            chatMessages.appendChild(loadingMessage);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Get AI response (simulated)
            setTimeout(() => {
                // Remove loading message
                chatMessages.removeChild(loadingMessage);
                
                // Simulate API call
                askQuestion(question, 'science')
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
                        errorMessage.innerHTML = '<p>抱歉，我在处理您的问题时遇到了错误。请再试一次。</p>';
                        chatMessages.appendChild(errorMessage);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    });
            }, 1500);
        }
    });
    
    // Allow Enter key to send messages
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
    
    // Simulation functionality
    const loadSimulationButton = document.getElementById('load-simulation');
    const simulationDisplay = document.getElementById('simulation-display');
    
    loadSimulationButton.addEventListener('click', function() {
        const topic = document.getElementById('simulation-topic').value;
        const type = document.getElementById('simulation-type').value;
        
        // Show loading state
        simulationDisplay.innerHTML = '<p class="loading">加载模拟中...</p>';
        
        // Simulate loading a simulation (would be an actual API call in production)
        setTimeout(() => {
            let simulationHtml = '<div class="simulation-viewer">';
            
            if (topic === 'physics' && type === 'particle-motion') {
                simulationHtml += `
                    <div class="simulation-info">
                        <h3>粒子运动模拟</h3>
                        <p>这个交互式模拟演示了粒子在各种环境和不同力的作用下的运动情况。</p>
                    </div>
                    <div class="simulation-frame">
                        <div class="placeholder-simulation">
                            <img src="../../assets/icons/physics-icon.svg" alt="物理模拟" style="width: 120px; height: 120px;">
                            <p>这里将展示一个交互式粒子运动模拟。</p>
                            <p>用户可以调整粒子质量、速度和环境力等参数。</p>
                        </div>
                    </div>
                    <div class="simulation-controls">
                        <div class="control-group">
                            <label>粒子数量</label>
                            <input type="range" min="1" max="100" value="50">
                        </div>
                        <div class="control-group">
                            <label>重力</label>
                            <input type="range" min="0" max="100" value="50">
                        </div>
                        <div class="control-group">
                            <label>摩擦力</label>
                            <input type="range" min="0" max="100" value="20">
                        </div>
                        <button class="btn btn-primary">重置模拟</button>
                    </div>
                `;
            } else {
                simulationHtml += `
                    <div class="placeholder-content">
                        <p>这里将展示带有交互控制的${topic}的${type}模拟。</p>
                        <p>尝试选择"物理"和"粒子运动"查看示例界面。</p>
                    </div>
                `;
            }
            
            simulationHtml += '</div>';
            simulationDisplay.innerHTML = simulationHtml;
        }, 1500);
    });
    
    // Experiment browser functionality
    const browseExperimentsButton = document.getElementById('browse-experiments');
    const experimentBrowser = document.getElementById('experiment-browser');
    
    browseExperimentsButton.addEventListener('click', function() {
        const category = document.getElementById('experiment-category').value;
        const level = document.getElementById('experiment-level').value;
        
        // Show loading state
        experimentBrowser.innerHTML = '<p class="loading">加载实验中...</p>';
        
        // Simulate loading experiments (would be an actual API call in production)
        setTimeout(() => {
            let experimentsHtml = '<div class="experiments-list">';
            let levelName, categoryName;
            
            // 翻译难度等级
            switch(level) {
                case 'beginner': levelName = '初级'; break;
                case 'intermediate': levelName = '中级'; break;
                case 'advanced': levelName = '高级'; break;
                default: levelName = level;
            }
            
            // 翻译类别
            switch(category) {
                case 'biology': categoryName = '生物学'; break;
                case 'chemistry': categoryName = '化学'; break;
                case 'physics': categoryName = '物理'; break;
                case 'earth': categoryName = '地球科学'; break;
                default: categoryName = category;
            }
            
            experimentsHtml += `<h3>${levelName}${categoryName}实验</h3>`;
            
            if (category === 'chemistry' && level === 'intermediate') {
                // Sample experiments
                const experiments = [
                    {
                        title: "酸碱滴定",
                        description: "通过精确滴定确定未知酸或碱的浓度。",
                        duration: "45分钟",
                        difficulty: "中级",
                        materials: ["数字pH计", "滴定管", "锥形瓶", "各种酸和碱"]
                    },
                    {
                        title: "水的电解",
                        description: "通过电解将水分解为氢气和氧气，并测量气体体积。",
                        duration: "30分钟",
                        difficulty: "中级",
                        materials: ["电源", "电解装置", "蒸馏水", "电极"]
                    },
                    {
                        title: "反应速率与催化剂",
                        description: "研究温度、浓度和催化剂如何影响反应速率。",
                        duration: "60分钟",
                        difficulty: "中级",
                        materials: ["过氧化氢", "二氧化锰", "温度计", "秒表"]
                    }
                ];
                
                experiments.forEach(exp => {
                    experimentsHtml += `
                        <div class="experiment-card">
                            <h4>${exp.title}</h4>
                            <p class="experiment-description">${exp.description}</p>
                            <div class="experiment-details">
                                <span class="detail"><strong>时长:</strong> ${exp.duration}</span>
                                <span class="detail"><strong>难度:</strong> ${exp.difficulty}</span>
                            </div>
                            <h5>所需材料:</h5>
                            <ul class="materials-list">
                                ${exp.materials.map(material => `<li>${material}</li>`).join('')}
                            </ul>
                            <button class="btn btn-primary view-experiment">开始实验</button>
                        </div>
                    `;
                });
            } else {
                experimentsHtml += `
                    <div class="placeholder-content">
                        <p>这里将显示${levelName}${categoryName}实验列表。</p>
                        <p>尝试选择"化学"和"中级"查看示例实验。</p>
                    </div>
                `;
            }
            
            experimentsHtml += '</div>';
            experimentBrowser.innerHTML = experimentsHtml;
            
            // Add event listeners to experiment buttons
            document.querySelectorAll('.view-experiment').forEach(button => {
                button.addEventListener('click', function() {
                    alert('在完整版中，这将启动一个交互式虚拟实验界面。');
                });
            });
        }, 1500);
    });
    
    // Reference tab functionality
    const referenceTabs = document.querySelectorAll('.reference-tab');
    const referenceContents = document.querySelectorAll('.reference-tab-content');
    
    referenceTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            referenceTabs.forEach(t => t.classList.remove('active'));
            referenceContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const target = this.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });
}); 