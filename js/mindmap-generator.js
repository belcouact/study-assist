// Mind Map Generator functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add mind map generator button to pages
    addMindMapButton();
});

// Add mind map generator button to page
function addMindMapButton() {
    // Check if button already exists
    if (document.querySelector('.mindmap-generator-btn')) {
        return;
    }

    // Create floating mind map button
    const button = document.createElement('div');
    button.className = 'mindmap-generator-btn';
    button.innerHTML = '<i class="fas fa-project-diagram"></i>';
    button.setAttribute('title', '生成思维导图');
    button.addEventListener('click', openMindMapModal);
    
    // Add button styles
    const style = document.createElement('style');
    style.textContent = `
        .mindmap-generator-btn {
            position: fixed;
            bottom: 20px;
            right: 80px;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            z-index: 999;
            font-size: 20px;
        }
        
        .mindmap-generator-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        
        .mindmap-modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
            animation: fadeIn 0.3s;
        }
        
        .mindmap-modal-content {
            background-color: #fff;
            margin: 5% auto;
            border-radius: 15px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            width: 90%;
            max-width: 900px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.4s;
        }
        
        .mindmap-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .mindmap-modal-header h2 {
            margin: 0;
            font-size: 1.4rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .mindmap-close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: background-color 0.3s;
        }
        
        .mindmap-close-btn:hover {
            background-color: rgba(255,255,255,0.2);
        }
        
        .mindmap-modal-body {
            padding: 20px;
            overflow-y: auto;
            flex-grow: 1;
        }
        
        .mindmap-input-section {
            margin-bottom: 20px;
        }
        
        .mindmap-input-section label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        
        .mindmap-topic-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
            box-sizing: border-box;
        }
        
        .mindmap-topic-input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .mindmap-generate-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .mindmap-generate-btn:hover {
            transform: translateY(-1px);
        }
        
        .mindmap-generate-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .mindmap-loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #667eea;
        }
        
        .mindmap-spinner {
            border: 3px solid #e1e5e9;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .mindmap-result {
            display: none;
        }
        
        .mindmap-tabs {
            display: flex;
            border-bottom: 2px solid #e1e5e9;
            margin-bottom: 20px;
        }
        
        .mindmap-tab {
            padding: 10px 20px;
            background: none;
            border: none;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.3s;
            font-size: 14px;
        }
        
        .mindmap-tab.active {
            border-bottom-color: #667eea;
            color: #667eea;
            font-weight: 600;
        }
        
        .mindmap-tab-content {
            display: none;
        }
        
        .mindmap-tab-content.active {
            display: block;
        }
        
        .mindmap-markdown {
            background: #f8f9fa;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 15px;
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
        }
        
        .mindmap-iframe {
            width: 100%;
            height: 500px;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
        }
        
        .mindmap-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        
        .mindmap-action-btn {
            padding: 8px 16px;
            border: 1px solid #667eea;
            background: white;
            color: #667eea;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .mindmap-action-btn:hover {
            background: #667eea;
            color: white;
        }
        
        .mindmap-error {
            display: none;
            background: #fee;
            border: 1px solid #fcc;
            color: #c66;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }
        
        .mindmap-service-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .mindmap-service-card {
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s;
            background: white;
        }
        
        .mindmap-service-card:hover {
            border-color: #667eea;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }
        
        .mindmap-service-card.selected {
            border-color: #667eea;
            background: #f8f9ff;
        }
        
        .mindmap-service-card h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
        }
        
        .mindmap-service-card p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            .mindmap-generator-btn {
                right: 20px;
                bottom: 80px;
                width: 50px;
                height: 50px;
                font-size: 18px;
            }
            
            .mindmap-modal-content {
                width: 95%;
                margin: 2% auto;
            }
            
            .mindmap-actions {
                flex-direction: column;
            }
            
            .mindmap-action-btn {
                width: 100%;
            }
            
            .mindmap-service-options {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(button);
}

// Open mind map modal
function openMindMapModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('mindmapModal')) {
        createMindMapModal();
    }
    
    const modal = document.getElementById('mindmapModal');
    modal.style.display = 'block';
    
    // Focus on input
    setTimeout(() => {
        const input = document.getElementById('mindmapTopicInput');
        if (input) input.focus();
    }, 100);
}

// Create mind map modal
function createMindMapModal() {
    const modalHTML = `
        <div id="mindmapModal" class="mindmap-modal">
            <div class="mindmap-modal-content">
                <div class="mindmap-modal-header">
                    <h2><i class="fas fa-project-diagram"></i> AI 思维导图生成器</h2>
                    <button class="mindmap-close-btn" onclick="closeMindMapModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mindmap-modal-body">
                    <div class="mindmap-input-section">
                        <label for="mindmapTopicInput">请输入主题或问题：</label>
                        <input 
                            type="text" 
                            id="mindmapTopicInput" 
                            class="mindmap-topic-input" 
                            placeholder="例如：如何有效学习生物学"
                        >
                    </div>
                    
                    <div class="mindmap-input-section">
                        <label>选择思维导图服务：</label>
                        <div class="mindmap-service-options">
                            <div class="mindmap-service-card selected" data-service="mindmapwizard">
                                <h3><i class="fas fa-magic"></i> Mind Map Wizard</h3>
                                <p>免费在线思维导图生成，简单易用</p>
                            </div>
                            <div class="mindmap-service-card" data-service="gitmind">
                                <h3><i class="fas fa-cloud"></i> GitMind</h3>
                                <p>AI驱动的协作思维导图工具</p>
                            </div>
                        </div>
                    </div>
                    
                    <button id="mindmapGenerateBtn" class="mindmap-generate-btn" onclick="generateMindMap()">
                        <i class="fas fa-magic"></i> 生成思维导图
                    </button>
                    
                    <div id="mindmapLoading" class="mindmap-loading">
                        <div class="mindmap-spinner"></div>
                        <p>正在生成思维导图，请稍候...</p>
                    </div>
                    
                    <div id="mindmapError" class="mindmap-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span id="mindmapErrorText"></span>
                    </div>
                    
                    <div id="mindmapResult" class="mindmap-result">
                        <div class="mindmap-tabs">
                            <button class="mindmap-tab active" onclick="showMindMapTab('markdown')">
                                <i class="fas fa-file-alt"></i> Markdown
                            </button>
                            <button class="mindmap-tab" onclick="showMindMapTab('mindmap')">
                                <i class="fas fa-project-diagram"></i> 思维导图
                            </button>
                        </div>
                        
                        <div id="markdownTab" class="mindmap-tab-content active">
                            <div id="mindmapMarkdown" class="mindmap-markdown"></div>
                            <div class="mindmap-actions">
                                <button class="mindmap-action-btn" onclick="copyMarkdown()">
                                    <i class="fas fa-copy"></i> 复制 Markdown
                                </button>
                                <button class="mindmap-action-btn" onclick="downloadMarkdown()">
                                    <i class="fas fa-download"></i> 下载 Markdown
                                </button>
                            </div>
                        </div>
                        
                        <div id="mindmapTab" class="mindmap-tab-content">
                            <iframe id="mindmapFrame" class="mindmap-iframe" src=""></iframe>
                            <div class="mindmap-actions">
                                <button class="mindmap-action-btn" onclick="openMindMapInNewTab()">
                                    <i class="fas fa-external-link-alt"></i> 在新窗口打开
                                </button>
                                <button class="mindmap-action-btn" onclick="regenerateMindMap()">
                                    <i class="fas fa-redo"></i> 重新生成
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add click outside to close
    document.getElementById('mindmapModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeMindMapModal();
        }
    });
    
    // Add Enter key support
    document.getElementById('mindmapTopicInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateMindMap();
        }
    });
    
    // Add service selection
    document.querySelectorAll('.mindmap-service-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.mindmap-service-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// Close mind map modal
function closeMindMapModal() {
    const modal = document.getElementById('mindmapModal');
    if (modal) {
        modal.style.display = 'none';
        resetMindMapModal();
    }
}

// Reset modal state
function resetMindMapModal() {
    document.getElementById('mindmapResult').style.display = 'none';
    document.getElementById('mindmapLoading').style.display = 'none';
    document.getElementById('mindmapError').style.display = 'none';
    document.getElementById('mindmapGenerateBtn').disabled = false;
}

// Show mind map tab
function showMindMapTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.mindmap-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.mindmap-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Generate mind map
async function generateMindMap() {
    const topicInput = document.getElementById('mindmapTopicInput');
    const topic = topicInput.value.trim();
    
    if (!topic) {
        showMindMapError('请输入主题或问题');
        return;
    }
    
    const selectedService = document.querySelector('.mindmap-service-card.selected').getAttribute('data-service');
    
    // Show loading state
    document.getElementById('mindmapGenerateBtn').disabled = true;
    document.getElementById('mindmapLoading').style.display = 'block';
    document.getElementById('mindmapError').style.display = 'none';
    document.getElementById('mindmapResult').style.display = 'none';
    
    try {
        // Step 1: Generate markdown content using DeepSeek API (if available)
        let markdownContent = '';
        try {
            markdownContent = await generateMarkdownContent(topic);
        } catch (error) {
            console.warn('DeepSeek API not available, using fallback content generation');
            markdownContent = generateFallbackMarkdownContent(topic);
        }
        
        // Step 2: Generate mind map using selected service
        await generateMindMapFromContent(topic, markdownContent, selectedService);
        
        // Show results
        document.getElementById('mindmapResult').style.display = 'block';
        
    } catch (error) {
        console.error('Error generating mind map:', error);
        showMindMapError(error.message || '生成思维导图时发生错误，请稍后重试');
    } finally {
        document.getElementById('mindmapLoading').style.display = 'none';
        document.getElementById('mindmapGenerateBtn').disabled = false;
    }
}

// Generate markdown content using DeepSeek API
async function generateMarkdownContent(topic) {
    const prompt = `请为主题"${topic}"生成一个详细的思维导图内容，使用Markdown格式输出。要求：
1. 使用标题层级(#, ##, ###)来表示思维导图的结构
2. 包含主要概念、子概念和关键要点
3. 内容要条理清晰、逻辑性强
4. 适合学习和理解使用
5. 包含3-5个主要分支，每个分支有2-4个子项

请直接输出Markdown格式的内容，不要包含其他说明文字。`;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        const markdownContent = result.output || result.content || result.text;
        
        if (!markdownContent) {
            throw new Error('未能获取有效的内容');
        }
        
        // Display markdown content
        document.getElementById('mindmapMarkdown').textContent = markdownContent;
        
        return markdownContent;
        
    } catch (error) {
        console.error('Error calling DeepSeek API:', error);
        throw new Error('生成内容失败: ' + error.message);
    }
}

// Generate fallback markdown content when API is not available
function generateFallbackMarkdownContent(topic) {
    const templates = {
        '生物学': `# ${topic}

## 基础概念
### 生命特征
- 新陈代谢
- 生长发育
- 遗传变异
- 适应环境

### 生物分类
- 界门纲目科属种
- 分类依据
- 系统进化

## 细胞生物学
### 细胞结构
- 细胞膜
- 细胞核
- 细胞质
- 细胞器

### 细胞功能
- 物质交换
- 能量转换
- 信息传递
- 生命调节

## 生态系统
### 生态因子
- 生物因子
- 非生物因子
- 环境阻力

### 生态关系
- 种内关系
- 种间关系
- 食物链网
- 能量流动

## 遗传进化
### 遗传规律
- 基因表达
- 遗传变异
- 自然选择
- 进化机制`,

        '进化': `# ${topic}

## 进化理论
### 达尔文理论
- 自然选择
- 适者生存
- 遗传变异
- 生存斗争

### 现代综合理论
- 基因突变
- 遗传重组
- 基因流动
- 遗传漂变

## 进化证据
### 化石证据
- 地层记录
- 过渡化石
- 分子化石
- 时间顺序

### 比较解剖学
- 同源器官
- 痕迹器官
- 胚胎发育
- 分子比较

## 物种形成
### 地理隔离
- 自然屏障
- 距离隔离
- 生态隔离
- 时间隔离

### 生殖隔离
- 配偶选择
- 生理不亲和
- 杂种不育
- 行为差异

## 适应性进化
### 环境压力
- 气候变化
- 食物竞争
- 捕食关系
- 疾病压力

### 适应机制
- 形态适应
- 生理适应
- 行为适应
- 生化适应`
    };
    
    // Find the best matching template
    let selectedTemplate = '';
    for (const [key, template] of Object.entries(templates)) {
        if (topic.includes(key)) {
            selectedTemplate = template;
            break;
        }
    }
    
    // If no specific template found, use a general structure
    if (!selectedTemplate) {
        selectedTemplate = `# ${topic}

## 基本概念
### 定义
- 核心概念
- 基本特征

### 分类
- 主要类型
- 区别特点

## 重要原理
### 基础理论
- 理论基础
- 发展历程

### 应用实例
- 实际应用
- 案例分析

## 相关因素
### 影响因素
- 内在因素
- 外在条件

### 相互关系
- 因果关系
- 相互影响

## 发展趋势
### 现状分析
- 当前状况
- 存在问题

### 未来展望
- 发展方向
- 应用前景`;
    }
    
    // Display the fallback content
    document.getElementById('mindmapMarkdown').textContent = selectedTemplate;
    
    return selectedTemplate;
}

// Generate mind map from content using selected service
async function generateMindMapFromContent(topic, content, service) {
    try {
        let mindMapUrl = '';
        
        switch (service) {
            case 'mindmapwizard':
                mindMapUrl = `https://mindmapwizard.com/?topic=${encodeURIComponent(topic)}`;
                break;
            case 'gitmind':
                // For GitMind, we'll open their AI generation page
                mindMapUrl = `https://gitmind.com/one-liner-mindmap`;
                break;
            default:
                mindMapUrl = `https://mindmapwizard.com/?topic=${encodeURIComponent(topic)}`;
        }
        
        // Set the iframe source
        document.getElementById('mindmapFrame').src = mindMapUrl;
        
        // Store the URL for later use
        window.currentMindMapUrl = mindMapUrl;
        
    } catch (error) {
        console.error('Error generating mind map:', error);
        throw new Error('生成思维导图失败: ' + error.message);
    }
}

// Show error message
function showMindMapError(message) {
    document.getElementById('mindmapErrorText').textContent = message;
    document.getElementById('mindmapError').style.display = 'block';
}

// Copy markdown to clipboard
function copyMarkdown() {
    const markdownText = document.getElementById('mindmapMarkdown').textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(markdownText).then(() => {
            showToast('Markdown已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopy(markdownText);
        });
    } else {
        fallbackCopy(markdownText);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast('Markdown已复制到剪贴板');
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动选择复制');
    }
    document.body.removeChild(textArea);
}

// Download markdown file
function downloadMarkdown() {
    const markdownText = document.getElementById('mindmapMarkdown').textContent;
    const topic = document.getElementById('mindmapTopicInput').value.trim();
    
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `思维导图-${topic || '主题'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Markdown文件已下载');
}

// Open mind map in new tab
function openMindMapInNewTab() {
    if (window.currentMindMapUrl) {
        window.open(window.currentMindMapUrl, '_blank');
    }
}

// Regenerate mind map
function regenerateMindMap() {
    generateMindMap();
}

// Show toast notification
function showToast(message) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('mindmapToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'mindmapToast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
    }, 3000);
}

// Initialize mind map generator
window.openMindMapModal = openMindMapModal;
window.closeMindMapModal = closeMindMapModal;
window.showMindMapTab = showMindMapTab;
window.generateMindMap = generateMindMap;
window.copyMarkdown = copyMarkdown;
window.downloadMarkdown = downloadMarkdown;
window.openMindMapInNewTab = openMindMapInNewTab;
window.regenerateMindMap = regenerateMindMap;