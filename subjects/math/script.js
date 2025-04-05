/**
 * 数学学科 - 页面脚本
 */

document.addEventListener('DOMContentLoaded', () => {
    setupTopicCards();
    setupAIAssistant();
    loadRecommendedContent();
});

/**
 * 设置主题卡片交互
 */
function setupTopicCards() {
    const topicCards = document.querySelectorAll('.topic-card');
    
    topicCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // 添加高亮效果
            card.classList.add('topic-highlight');
        });
        
        card.addEventListener('mouseleave', () => {
            // 移除高亮效果
            card.classList.remove('topic-highlight');
        });
        
        // 获取主题数据，在实际应用中可从API获取
        const topicId = card.getAttribute('data-topic');
        if (topicId) {
            // 这里只是示例，实际应用中应该从API获取数据
            const mockProgressData = {
                'algebra': 45,
                'geometry': 30,
                'statistics': 15
            };
            
            // 如果有进度数据，添加进度条
            if (mockProgressData[topicId]) {
                addProgressBar(card, mockProgressData[topicId]);
            }
        }
    });
}

/**
 * 添加进度条到主题卡片
 * @param {Element} card - 主题卡片元素
 * @param {number} progress - 进度百分比
 */
function addProgressBar(card, progress) {
    // 检查用户是否已登录，这里简单模拟
    const isLoggedIn = localStorage.getItem('study_assist_token') !== null;
    
    if (isLoggedIn) {
        // 创建进度条元素
        const progressContainer = document.createElement('div');
        progressContainer.classList.add('progress-container');
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">${progress}% 完成</div>
        `;
        
        // 获取卡片内的按钮
        const button = card.querySelector('.btn');
        
        // 在按钮前插入进度条
        if (button) {
            button.parentNode.insertBefore(progressContainer, button);
        } else {
            card.appendChild(progressContainer);
        }
    }
}

/**
 * 设置AI助手功能
 */
function setupAIAssistant() {
    const openAssistantButton = document.getElementById('open-assistant');
    
    if (openAssistantButton) {
        openAssistantButton.addEventListener('click', () => {
            showAIAssistantModal();
        });
    }
}

/**
 * 显示AI助手对话框
 */
function showAIAssistantModal() {
    // 创建AI助手对话框
    const modalHTML = `
        <div class="modal-backdrop">
            <div class="modal ai-modal">
                <div class="modal-header">
                    <h3 class="modal-title">数学AI助手</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="ai-chat-container">
                        <div class="ai-chat-messages" id="ai-messages">
                            <div class="ai-message">
                                <div class="ai-avatar">AI</div>
                                <div class="ai-content">
                                    <p>你好！我是你的数学学习助手。有任何数学问题都可以问我。</p>
                                </div>
                            </div>
                        </div>
                        <div class="ai-chat-input">
                            <textarea id="ai-question" placeholder="输入你的数学问题..." class="form-control"></textarea>
                            <button id="ai-submit" class="btn btn-primary">提问</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到DOM
    const modalElement = document.createRange().createContextualFragment(modalHTML);
    document.body.appendChild(modalElement);
    
    // 显示模态框
    setTimeout(() => {
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) {
            modalBackdrop.classList.add('visible');
        }
    }, 10);
    
    // 设置关闭按钮
    const closeButton = document.querySelector('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    // 点击外部区域关闭
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
    }
    
    // 设置提交按钮
    const submitButton = document.getElementById('ai-submit');
    const questionInput = document.getElementById('ai-question');
    
    if (submitButton && questionInput) {
        submitButton.addEventListener('click', () => {
            const question = questionInput.value.trim();
            if (question) {
                sendQuestionToAI(question);
                questionInput.value = '';
            }
        });
        
        // 输入框回车键提交
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitButton.click();
            }
        });
    }
}

/**
 * 关闭模态框
 */
function closeModal() {
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.remove('visible');
        
        // 动画结束后移除DOM
        modalBackdrop.addEventListener('transitionend', () => {
            if (modalBackdrop.parentNode) {
                modalBackdrop.parentNode.removeChild(modalBackdrop);
            }
        }, { once: true });
    }
}

/**
 * 发送问题给AI
 * @param {string} question - 用户问题
 */
function sendQuestionToAI(question) {
    const messagesContainer = document.getElementById('ai-messages');
    
    if (messagesContainer) {
        // 添加用户消息
        const userMessageHTML = `
            <div class="user-message">
                <div class="user-content">
                    <p>${question}</p>
                </div>
                <div class="user-avatar">我</div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', userMessageHTML);
        
        // 添加AI正在思考的提示
        const thinkingID = 'ai-thinking';
        const thinkingHTML = `
            <div class="ai-message" id="${thinkingID}">
                <div class="ai-avatar">AI</div>
                <div class="ai-content">
                    <p><em>思考中...</em></p>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', thinkingHTML);
        
        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // 模拟AI回复（实际应用中应该调用API）
        setTimeout(() => {
            // 移除思考中提示
            const thinkingElement = document.getElementById(thinkingID);
            if (thinkingElement) {
                thinkingElement.remove();
            }
            
            // 生成简单的响应（实际应用中应该从API获取）
            let response = '';
            
            if (question.includes('方程') || question.includes('解方程')) {
                response = `
                    <p>解方程是代数中的基本操作。以一个简单的一元一次方程为例：</p>
                    <div class="math-formula">3x + 5 = 20</div>
                    <p>解题步骤：</p>
                    <ol>
                        <li>将变量项和常数项分开: 3x = 20 - 5</li>
                        <li>计算右边: 3x = 15</li>
                        <li>两边同除以3: x = 5</li>
                    </ol>
                    <p>因此，方程的解是 x = 5。你可以通过代回原方程验证：3×5 + 5 = 20。</p>
                `;
            } else if (question.includes('三角形') || question.includes('勾股定理')) {
                response = `
                    <p>勾股定理是关于直角三角形的重要定理，描述了三边长度之间的关系：</p>
                    <div class="math-formula">a² + b² = c²</div>
                    <p>其中a和b是直角三角形的两条直角边的长度，c是斜边的长度。</p>
                    <p>例如，如果一个直角三角形的两条直角边长为3和4，那么斜边长为：</p>
                    <div class="math-formula">c = √(3² + 4²) = √(9 + 16) = √25 = 5</div>
                    <p>勾股定理在几何学和实际应用中都非常重要。</p>
                `;
            } else if (question.includes('概率') || question.includes('统计')) {
                response = `
                    <p>概率表示事件发生的可能性，用0到1之间的数值表示。</p>
                    <p>例如，掷一个骰子得到数字6的概率是1/6（约0.167或16.7%）。</p>
                    <p>概率的基本公式：</p>
                    <div class="math-formula">P(A) = 事件A发生的方式数 / 所有可能结果的数量</div>
                    <p>在统计学中，我们使用样本来估计总体的特性，如均值、方差等。</p>
                `;
            } else {
                response = `
                    <p>你的问题很有趣！在数学学习中，理解概念比记忆公式更重要。</p>
                    <p>如果你能告诉我更具体的问题，我可以提供更详细的解答。你可以问我关于：</p>
                    <ul>
                        <li>代数（方程、函数、表达式等）</li>
                        <li>几何（图形、定理、证明等）</li>
                        <li>概率与统计（随机事件、数据分析等）</li>
                    </ul>
                    <p>或者特定的习题解答。</p>
                `;
            }
            
            // 添加AI回复
            const aiMessageHTML = `
                <div class="ai-message">
                    <div class="ai-avatar">AI</div>
                    <div class="ai-content">
                        ${response}
                    </div>
                </div>
            `;
            messagesContainer.insertAdjacentHTML('beforeend', aiMessageHTML);
            
            // 滚动到底部
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1500);
    }
}

/**
 * 加载推荐内容
 */
function loadRecommendedContent() {
    // 检查用户是否已登录
    const isLoggedIn = localStorage.getItem('study_assist_token') !== null;
    
    // 只为登录用户显示个性化推荐
    if (isLoggedIn) {
        // 这里应该从API获取数据，现在使用模拟数据
        const recommendedContent = [
            {
                title: '二次函数图像分析',
                type: 'lesson',
                difficulty: '中级',
                progress: 30,
                url: '#'
            },
            {
                title: '概率基础测验',
                type: 'quiz',
                difficulty: '初级',
                questions: 10,
                url: '#'
            },
            {
                title: '几何证明方法',
                type: 'article',
                readTime: '5分钟',
                url: '#'
            }
        ];
        
        // 检查是否应该创建推荐区域
        const mainElement = document.querySelector('main');
        const featuresSection = document.querySelector('.features');
        
        if (mainElement && featuresSection) {
            // 创建推荐内容区域
            const recommendedSection = document.createElement('section');
            recommendedSection.classList.add('recommended');
            
            // 构建HTML内容
            let recommendedHTML = `
                <div class="container">
                    <h2 class="section-title">个性化推荐</h2>
                    <div class="recommended-grid">
            `;
            
            // 添加推荐项
            recommendedContent.forEach(item => {
                recommendedHTML += `
                    <a href="${item.url}" class="recommended-item">
                        <div class="recommended-badge">${item.type}</div>
                        <h3>${item.title}</h3>
                        <div class="recommended-meta">
                            <span>难度: ${item.difficulty || '基础'}</span>
                            ${item.progress ? `<div class="mini-progress"><div style="width: ${item.progress}%"></div></div>` : ''}
                            ${item.questions ? `<span>${item.questions}个问题</span>` : ''}
                            ${item.readTime ? `<span>${item.readTime}</span>` : ''}
                        </div>
                    </a>
                `;
            });
            
            recommendedHTML += `
                    </div>
                </div>
            `;
            
            // 设置HTML内容
            recommendedSection.innerHTML = recommendedHTML;
            
            // 插入到DOM中
            mainElement.insertBefore(recommendedSection, featuresSection);
            
            // 添加样式
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .recommended {
                    padding: var(--spacing-16) 0;
                    background-color: white;
                }
                
                .recommended-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: var(--spacing-4);
                    margin-top: var(--spacing-8);
                }
                
                .recommended-item {
                    display: block;
                    padding: var(--spacing-4);
                    border-radius: var(--radius-lg);
                    background-color: var(--neutral-50);
                    transition: transform var(--transition-fast) ease, box-shadow var(--transition-fast) ease;
                    position: relative;
                }
                
                .recommended-item:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-md);
                }
                
                .recommended-badge {
                    position: absolute;
                    top: var(--spacing-3);
                    right: var(--spacing-3);
                    padding: var(--spacing-1) var(--spacing-2);
                    border-radius: var(--radius-full);
                    background-color: var(--math-light);
                    color: var(--math-primary);
                    font-size: var(--text-xs);
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .recommended-item h3 {
                    margin-bottom: var(--spacing-2);
                    padding-right: var(--spacing-12);
                }
                
                .recommended-meta {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    color: var(--neutral-600);
                    font-size: var(--text-sm);
                }
                
                .mini-progress {
                    flex-grow: 1;
                    height: 4px;
                    background-color: var(--neutral-200);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                }
                
                .mini-progress > div {
                    height: 100%;
                    background-color: var(--math-primary);
                }
            `;
            
            document.head.appendChild(styleElement);
        }
    }
} 