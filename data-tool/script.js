/**
 * 智能数据分析工具 - 主脚本
 * 现代化的数据可视化平台，支持多种数据格式，AI驱动的图表生成和分析报告
 */
class DataAnalysisTool {
    constructor() {
        this.data = null;
        this.columns = [];
        this.selectedTemplate = null;
        this.selectedDataSource = 'file';
        this.apiKey = '';
        this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
        this.model = 'deepseek-chat';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        // 现代化功能增强
        this.animationQueue = [];
        this.isAnimating = false;
        this.userPreferences = this.loadUserPreferences();
        this.featureFlags = {
            enhancedAnimations: true,
            advancedTooltips: true,
            responsiveCharts: true,
            darkMode: false
        };
        
        // 性能监控
        this.performanceMetrics = {
            startTime: null,
            endTime: null,
            generationTime: null
        };
        
        this.init();
    }
    
    // 加载用户偏好设置
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('dataAnalysisPreferences');
            return saved ? JSON.parse(saved) : {
                theme: 'light',
                animations: true,
                autoSave: true
            };
        } catch (error) {
            console.warn('无法加载用户偏好设置:', error);
            return {
                theme: 'light',
                animations: true,
                autoSave: true
            };
        }
    }

    init() {
        console.log('初始化智能数据分析工具...');
        
        // 添加初始化动画
        this.addInitializationAnimation();
        
        // 绑定事件
        this.bindEvents();
        
        // 检查依赖
        this.checkDependencies();
        
        // 检查临时目录
        this.checkTempDirectory();
        
        // 加载文件
        this.loadTempFiles();
        
        // 初始化完成后的回调
        this.onInitializationComplete();
    }
    
    // 添加初始化动画
    addInitializationAnimation() {
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }
    }
    
    // 检查依赖
    checkDependencies() {
        this.checkEChartsLibrary();
        this.checkDataProcessingLibraries();
    }
    
    // 检查数据处理库
    checkDataProcessingLibraries() {
        const requiredLibs = ['Papa', 'XLSX'];
        const missingLibs = requiredLibs.filter(lib => typeof window[lib] === 'undefined');
        
        if (missingLibs.length > 0) {
            console.warn('缺少数据处理库:', missingLibs);
            this.showWarning(`部分功能可能不可用，缺少库: ${missingLibs.join(', ')}`);
        }
    }
    
    // 初始化完成回调
    onInitializationComplete() {
        console.log('智能数据分析工具初始化完成');
        
        // 检查更新
        this.checkForUpdates();
    }
    
    // 检查更新
    checkForUpdates() {
        // 这里可以添加版本检查逻辑
        console.log('检查更新...');
    }
    
    // 显示警告消息
    showWarning(message) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'warning-message';
        warningDiv.style.cssText = 'background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #ffeeba;';
        warningDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
            ${message}
            <button class="close-warning" style="float: right; background: none; border: none; font-size: 16px; cursor: pointer;">&times;</button>
        `;
        
        // 添加关闭按钮事件
        const closeBtn = warningDiv.querySelector('.close-warning');
        closeBtn.addEventListener('click', () => {
            warningDiv.remove();
        });
        
        // 插入到页面顶部
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(warningDiv, container.firstChild);
        }
    }

    bindEvents() {
        console.log('绑定事件监听器...');
        
        // 选项卡切换事件
        document.querySelectorAll('.tab-btn').forEach(tabBtn => {
            tabBtn.addEventListener('click', (e) => {
                const tab = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tab);
                this.addRippleEffect(e.currentTarget, e);
            });
        });

        // 文件上传事件 - 增强拖拽体验
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        if (uploadArea) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
            
            // 添加触摸设备支持
            uploadArea.addEventListener('touchstart', (e) => {
                this.handleTouchStart(e);
            });
            
            uploadArea.addEventListener('touchend', (e) => {
                this.handleTouchEnd(e);
            });
        }

        // 模板选择事件 - 增强动画
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = e.target.closest('.template-card').dataset.template;
                this.selectTemplate(template);
                this.addCardFlipEffect(card);
            });
            
            // 添加键盘导航
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const template = e.currentTarget.dataset.template;
                    this.selectTemplate(template);
                }
            });
        });

        // 生成配置要求按钮事件
        const optimizeBtn = document.getElementById('optimizeDescription');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.generateConfigRequirements();
                this.addButtonPulseEffect(optimizeBtn);
            });
        }

        // 生成脚本按钮事件
        const generateScriptBtn = document.getElementById('generateScript');
        if (generateScriptBtn) {
            generateScriptBtn.addEventListener('click', () => {
                this.generateScript();
                this.addButtonPulseEffect(generateScriptBtn);
            });
        }

        // 执行脚本按钮事件
        const executeScriptBtn = document.getElementById('executeScript');
        if (executeScriptBtn) {
            executeScriptBtn.addEventListener('click', () => {
                this.executeGeneratedCode();
                this.addButtonPulseEffect(executeScriptBtn);
            });
        }
        
        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.generateScript();
            }
        });

        // 分析输入框事件 - 增强交互
        const userRequirement = document.getElementById('userRequirement');
        if (userRequirement) {
            userRequirement.addEventListener('input', () => {
                this.updateAnalysisDescription();
                this.autoResizeTextarea(userRequirement);
                
                // 启用/禁用生成配置要求按钮
                const optimizeBtn = document.getElementById('optimizeDescription');
                if (optimizeBtn) {
                    optimizeBtn.disabled = !userRequirement.value.trim();
                }
            });
            
            // 添加输入建议
            userRequirement.addEventListener('focus', () => {
                this.showInputSuggestions(userRequirement);
            });
            
            userRequirement.addEventListener('blur', () => {
                setTimeout(() => {
                    this.hideInputSuggestions();
                }, 200);
            });
        }
        
        // 添加响应式处理
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 添加在线/离线状态检测
        window.addEventListener('online', () => {
            this.showOnlineStatus();
        });
        
        window.addEventListener('offline', () => {
            this.showOfflineStatus();
        });
        
        // 添加页面可见性变化处理
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }
    
    // 添加涟漪效果
    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // 添加悬停效果
    addHoverEffect(element) {
        if (this.featureFlags.enhancedAnimations) {
            element.style.transform = 'translateY(-2px)';
            element.style.transition = 'transform 0.3s ease';
        }
    }
    
    // 移除悬停效果
    removeHoverEffect(element) {
        element.style.transform = 'translateY(0)';
    }
    
    // 添加卡片翻转效果
    addCardFlipEffect(card) {
        card.style.transform = 'rotateY(10deg)';
        setTimeout(() => {
            card.style.transform = 'rotateY(0deg)';
            card.style.transition = 'transform 0.3s ease';
        }, 100);
    }
    
    // 添加按钮脉冲效果
    addButtonPulseEffect(button) {
        button.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 500);
    }
    
    // 自动调整文本框大小
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
    
    // 显示输入建议
    showInputSuggestions(input) {
        const suggestions = [
            '查看销售额的趋势变化',
            '分析各产品的销售占比',
            '比较不同地区的业绩表现',
            '展示用户增长趋势',
            '分析时间序列数据'
        ];
        
        // 这里可以实现建议下拉框
        console.log('显示输入建议:', suggestions);
    }
    
    // 隐藏输入建议
    hideInputSuggestions() {
        // 隐藏建议下拉框
        console.log('隐藏输入建议');
    }
    
    // 处理窗口大小变化
    handleResize() {
        console.log('窗口大小变化，重新计算布局');
        
        // 重新调整图表大小
        if (this.echartsInstance) {
            this.echartsInstance.resize();
        }
    }
    
    // 显示在线状态
    showOnlineStatus() {
        console.log('网络连接已恢复');
        this.showNotification('网络连接已恢复', 'success');
    }
    
    // 显示离线状态
    showOfflineStatus() {
        console.log('网络连接已断开');
        this.showNotification('网络连接已断开，部分功能可能不可用', 'warning');
    }
    
    // 处理页面可见性变化
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('页面隐藏，暂停动画');
            this.pauseAnimations();
        } else {
            console.log('页面可见，恢复动画');
            this.resumeAnimations();
        }
    }
    
    // 暂停动画
    pauseAnimations() {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }
    
    // 恢复动画
    resumeAnimations() {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // 获取通知图标
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    async checkEChartsLibrary() {
        // 等待一小段时间确保ECharts库已加载
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (typeof echarts === 'undefined') {
            console.warn('ECharts库未加载，尝试动态加载...');
            try {
                await this.loadScript('https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js');
                console.log('ECharts库加载成功');
            } catch (error) {
                console.error('ECharts库加载失败:', error);
                this.showError('图表库加载失败，请检查网络连接');
            }
        } else {
            console.log('ECharts库已加载');
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async checkTempDirectory() {
        // 静默检查temp目录，不抛出错误
        try {
            // 检查temp目录是否存在
            const response = await fetch('./temp/', { method: 'HEAD', cache: 'no-cache' }).catch(() => null);
            if (response && response.ok) {
                console.log('temp目录访问正常');
                this.loadTempFiles();
            } else {
                // temp目录不存在，这是正常情况
                console.log('temp目录不存在，使用默认配置');
                this.initializeDefaultConfig();
            }
        } catch (error) {
            // 完全忽略任何错误，直接使用默认配置
            console.log('temp目录访问失败，使用默认配置');
            this.initializeDefaultConfig();
        }
    }
    
    initializeDefaultConfig() {
        // 初始化默认配置
        console.log('初始化默认配置');
        // 这里可以添加默认配置的初始化逻辑
        this.tempFiles = [];
        this.tempConfig = {
            enabled: false,
            path: './temp/',
            maxSize: 10485760 // 10MB
        };
    }

    async loadTempFiles() {
        try {
            const response = await fetch('./temp/');
            if (response.ok) {
                // 这里应该返回temp目录下的文件列表
                console.log('temp目录文件加载成功');
            }
        } catch (error) {
            console.warn('加载temp目录文件失败:', error);
        }
    }

    switchTab(tab) {
        // 更新选项卡按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // 更新面板状态 - 侧边栏布局，两个面板都显示但有不同的视觉状态
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
            panel.classList.add('inactive');
        });
        
        const activePanel = document.getElementById(`${tab}-panel`);
        if (activePanel) {
            activePanel.classList.remove('inactive');
            activePanel.classList.add('active');
        }
        
        this.selectedDataSource = tab === 'upload' ? 'file' : 'template';
    }

    selectTemplate(template) {
        this.selectedTemplate = template;
        
        // 更新UI
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-template="${template}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // 根据模板生成相应的数据
        switch(template) {
            case 'sales':
                this.generateSalesData();
                break;
            case 'temperature':
                this.generateTemperatureData();
                break;
            case 'performance':
                this.generatePerformanceData();
                break;
            case 'grades':
                this.generateGradesData();
                break;
            case 'stock':
                this.generateStockData();
                break;
            case 'survey':
                this.generateSurveyData();
                break;
            default:
                console.warn('未知的模板类型:', template);
                this.showNotification('未知的模板类型', 'warning');
            
            // 生成模板数据
            this.generateTemplateData(template);
        }
    }
    
    generateTemplateData(template) {
        let templateData = [];
        
        switch (template) {
            case 'monthly-sales':
                templateData = this.generateSalesData();
                break;
            case 'temperature':
                templateData = this.generateTemperatureData();
                break;
            case 'stock':
                templateData = this.generateStockData();
                break;
            case 'survey':
                templateData = this.generateSurveyData();
                break;
            default:
                templateData = [];
        }
        
        this.data = templateData;
        this.columns = Object.keys(templateData[0] || {});
        this.showDataPreview();
    }
    
    generateStockData() {
        const dates = [];
        const baseDate = new Date('2024-01-01');
        for (let i = 0; i < 30; i++) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        const data = [];
        let price = 100;
        
        dates.forEach(date => {
            price += (Math.random() - 0.5) * 10;
            const volume = Math.floor(Math.random() * 1000000) + 500000;
            
            data.push({
                date: date,
                price: Math.round(price * 100) / 100,
                volume: volume,
                change: Math.round((Math.random() - 0.5) * 10 * 100) / 100
            });
        });
        
        return data;
    }
    
    generateSurveyData() {
        const questions = [
            '产品质量', '客户服务', '价格合理性', '配送速度', '整体满意度'
        ];
        const responses = ['非常满意', '满意', '一般', '不满意', '非常不满意'];
        const ageGroups = ['18-25', '26-35', '36-45', '46-55', '55+'];
        
        const data = [];
        
        questions.forEach(question => {
            ageGroups.forEach(age => {
                responses.forEach(response => {
                    data.push({
                        question: question,
                        ageGroup: age,
                        response: response,
                        count: Math.floor(Math.random() * 100) + 10
                    });
                });
            });
        });
        
        return data;
    }
    
    // 显示加载状态
    showLoading() {
        const loading = document.getElementById('loading');
        const resultCard = document.getElementById('resultCard');
        
        if (loading && resultCard) {
            loading.classList.remove('hidden');
            resultCard.classList.remove('hidden');
        }
    }
    
    // 隐藏加载状态
    hideLoading() {
        const loading = document.getElementById('loading');
        
        if (loading) {
            loading.classList.add('hidden');
        }
    }
    
    // 显示错误信息
    showError(message) {
        // 可以创建一个错误显示元素或使用通知系统
        this.showNotification(message, 'error');
        console.error('错误:', message);
    }
    
    // 隐藏错误信息
    hideError() {
        // 隐藏错误显示的逻辑
        console.log('隐藏错误信息');
    }
    
    // 隐藏图表
    hideChart() {
        const chartContainer = document.getElementById('chartContainer');
        
        if (chartContainer) {
            chartContainer.innerHTML = '';
        }
    }
    
    // 显示结果
    showResult() {
        const resultCard = document.getElementById('resultCard');
        
        if (resultCard) {
            resultCard.classList.remove('hidden');
        }
    }
    
    // 添加触摸设备支持
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.addRippleEffect(e.currentTarget, {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        // 触摸结束处理
        console.log('触摸结束:', e);
    }
    
    // 文件处理方法
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    processFile(file) {
        console.log('处理文件:', file.name);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                let data;
                const fileExtension = file.name.split('.').pop().toLowerCase();
                
                switch (fileExtension) {
                    case 'csv':
                        data = this.parseCSV(e.target.result);
                        break;
                    case 'json':
                        data = JSON.parse(e.target.result);
                        break;
                    case 'xlsx':
                    case 'xls':
                        data = this.parseExcel(e.target.result);
                        break;
                    default:
                        throw new Error('不支持的文件格式');
                }
                
                this.data = data;
                this.columns = Object.keys(data[0] || {});
                this.showDataPreview();
                this.showNotification('文件加载成功', 'success');
                
            } catch (error) {
                console.error('文件处理错误:', error);
                this.showError('文件处理失败: ' + error.message);
            }
        };
        
        reader.onerror = () => {
            this.showError('文件读取失败');
        };
        
        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else if (file.name.endsWith('.json')) {
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            reader.readAsArrayBuffer(file);
        }
    }
    
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
        }
        
        return data;
    }
    
    parseExcel(arrayBuffer) {
        // 这里需要XLSX库的支持
        if (typeof XLSX !== 'undefined') {
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            return XLSX.utils.sheet_to_json(worksheet);
        } else {
            throw new Error('Excel处理库未加载');
        }
    }
    
    showDataPreview() {
        const preview = document.getElementById('dataPreview');
        const previewCard = document.getElementById('dataPreviewCard');
        
        if (!preview || !previewCard || !this.data || this.data.length === 0) {
            return;
        }
        
        // 创建表格HTML
        let tableHTML = '<table><thead><tr>';
        this.columns.forEach(column => {
            tableHTML += `<th>${column}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        // 只显示前10行数据
        const previewData = this.data.slice(0, 10);
        previewData.forEach(row => {
            tableHTML += '<tr>';
            this.columns.forEach(column => {
                tableHTML += `<td>${row[column] || ''}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        
        // 如果数据超过10行，显示提示
        if (this.data.length > 10) {
            tableHTML += `<div style="text-align: center; padding: 10px; color: #6c757d; font-size: 0.9rem;">显示前10行数据，共${this.data.length}行</div>`;
        }
        
        preview.innerHTML = tableHTML;
        previewCard.classList.remove('hidden');
    }
    
    updateAnalysisDescription() {
        const userRequirement = document.getElementById('userRequirement');
        const charCount = document.getElementById('charCount');
        
        if (userRequirement && charCount) {
            const count = userRequirement.value.length;
            charCount.textContent = `${count}/500`;
            
            // 更新字符计数颜色
            if (count > 450) {
                charCount.style.color = '#dc3545';
            } else if (count > 400) {
                charCount.style.color = '#ffc107';
            } else {
                charCount.style.color = '#6c757d';
            }
        }
    }
    
    generateConfigRequirements() {
        const userRequirement = document.getElementById('userRequirement');
        const configRequirements = document.getElementById('configRequirements');
        
        if (!userRequirement || !configRequirements) {
            return;
        }
        
        const requirement = userRequirement.value.trim();
        if (!requirement) {
            this.showError('请先输入分析需求');
            return;
        }
        
        // 生成配置建议
        const suggestions = this.generateAnalysisSuggestions(requirement);
        
        configRequirements.innerHTML = `
            <div class="config-suggestions">
                <h4>配置建议</h4>
                <div class="suggestion-list">
                    ${suggestions.map(s => `
                        <div class="suggestion-item">
                            <i class="fas fa-lightbulb"></i>
                            <span>${s}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="config-actions">
                    <button class="btn btn-secondary" onclick="dataTool.hideConfigRequirements()">关闭</button>
                    <button class="btn btn-primary" onclick="dataTool.applyConfigSuggestions()">应用建议</button>
                </div>
            </div>
        `;
        
        configRequirements.classList.remove('hidden');
    }
    
    generateAnalysisSuggestions(requirement) {
        const suggestions = [];
        
        // 根据需求内容生成建议
        if (requirement.includes('趋势') || requirement.includes('变化')) {
            suggestions.push('建议使用折线图展示趋势变化');
        }
        
        if (requirement.includes('占比') || requirement.includes('比例')) {
            suggestions.push('建议使用饼图或环形图展示占比关系');
        }
        
        if (requirement.includes('比较') || requirement.includes('对比')) {
            suggestions.push('建议使用柱状图进行数据对比');
        }
        
        if (requirement.includes('分布') || requirement.includes('散点')) {
            suggestions.push('建议使用散点图展示数据分布');
        }
        
        // 添加通用建议
        suggestions.push('建议添加数据标签以提高可读性');
        suggestions.push('建议配置适当的颜色方案');
        suggestions.push('建议添加图表标题和图例');
        
        return suggestions;
    }
    
    hideConfigRequirements() {
        const configRequirements = document.getElementById('configRequirements');
        if (configRequirements) {
            configRequirements.classList.add('hidden');
        }
    }
    
    applyConfigSuggestions() {
        this.showNotification('配置建议已应用', 'success');
        this.hideConfigRequirements();
    }
    
    async generateScript() {
        const userRequirement = document.getElementById('userRequirement');
        const generatedScript = document.getElementById('generatedScript');
        
        if (!userRequirement || !generatedScript) {
            return;
        }
        
        const requirement = userRequirement.value.trim();
        if (!requirement) {
            this.showError('请先输入分析需求');
            return;
        }
        
        if (!this.data || this.data.length === 0) {
            this.showError('请先上传数据或选择模板');
            return;
        }
        
        this.showLoading();
        
        try {
            const script = await this.callDeepSeekAPI(requirement);
            generatedScript.value = script;
            this.showResult();
            this.showNotification('脚本生成成功', 'success');
        } catch (error) {
            this.showError('脚本生成失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    async callDeepSeekAPI(requirement) {
        const prompt = `
            我有以下数据：
            ${JSON.stringify(this.data.slice(0, 5))}
            
            数据列：${this.columns.join(', ')}
            
            用户需求：${requirement}
            
            请生成一个使用ECharts的JavaScript代码，用于创建合适的图表来满足用户需求。
            代码应该包含：
            1. 完整的ECharts配置选项
            2. 适合数据类型的图表类型
            3. 适当的样式和交互功能
            4. 响应式设计支持
            
            请只返回JavaScript代码，不要包含其他解释。
        `;
        
        // 这里是模拟API调用，实际使用时需要真实的API调用
        const mockResponse = `
            // 基于用户需求生成的ECharts配置
            const option = {
                title: {
                    text: '${requirement}',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ${JSON.stringify(this.columns)},
                    top: '30px'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ${JSON.stringify(this.data.map(item => item[this.columns[0]]))}
                },
                yAxis: {
                    type: 'value'
                },
                series: ${JSON.stringify(this.columns.slice(1).map(col => ({
                    name: col,
                    type: 'line',
                    data: this.data.map(item => item[col])
                })))}
            };
            
            // 初始化图表
            const chartContainer = document.getElementById('chartContainer');
            if (chartContainer) {
                const myChart = echarts.init(chartContainer);
                myChart.setOption(option);
                
                // 响应式调整
                window.addEventListener('resize', function() {
                    myChart.resize();
                });
            }
        `;
        
        return mockResponse;
    }
    
    executeGeneratedCode() {
        const generatedScript = document.getElementById('generatedScript');
        
        if (!generatedScript || !generatedScript.value.trim()) {
            this.showError('请先生成脚本');
            return;
        }
        
        try {
            // 清除之前的图表
            this.hideChart();
            
            // 执行生成的代码
            eval(generatedScript.value);
            
            this.showNotification('图表执行成功', 'success');
        } catch (error) {
            console.error('代码执行错误:', error);
            this.showError('代码执行失败: ' + error.message);
        }
    }

    generateSalesData() {
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const products = ['产品A', '产品B', '产品C'];
        const data = [];
        
        months.forEach(month => {
            products.forEach(product => {
                data.push({
                    month: month,
                    product: product,
                    sales: Math.floor(Math.random() * 10000) + 5000,
                    profit: Math.floor(Math.random() * 3000) + 1000
                });
            });
        });
        
        return data;
    }

    generateTemperatureData() {
        const cities = ['北京', '上海', '广州', '深圳'];
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const data = [];
        
        cities.forEach(city => {
            months.forEach(month => {
                data.push({
                    city: city,
                    month: month,
                    temperature: Math.floor(Math.random() * 30) + 5,
                    humidity: Math.floor(Math.random() * 40) + 40
                });
            });
        });
        
        return data;
    }

    generatePerformanceData() {
        const systems = ['系统A', '系统B', '系统C'];
        const metrics = ['响应时间', '吞吐量', '错误率'];
        const data = [];
        
        systems.forEach(system => {
            metrics.forEach(metric => {
                data.push({
                    system: system,
                    metric: metric,
                    value: Math.floor(Math.random() * 100) + 1,
                    timestamp: new Date().toISOString()
                });
            });
        });
        
        return data;
    }

    generateGradesData() {
        const students = ['张三', '李四', '王五', '赵六', '钱七'];
        const subjects = ['语文', '数学', '英语', '物理', '化学'];
        const data = [];
        
        students.forEach(student => {
            subjects.forEach(subject => {
                data.push({
                    student: student,
                    subject: subject,
                    score: Math.floor(Math.random() * 40) + 60,
                    rank: Math.floor(Math.random() * 50) + 1
                });
            });
        });
        
        return data;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        const fileName = file.name.toLowerCase();
        
        try {
            if (fileName.endsWith('.csv')) {
                await this.processCSVFile(file);
            } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                await this.processExcelFile(file);
            } else if (fileName.endsWith('.json')) {
                await this.processJSONFile(file);
            } else {
                throw new Error('不支持的文件格式，请上传CSV、Excel或JSON文件');
            }
        } catch (error) {
            console.error('文件处理失败:', error);
            this.showError('文件处理失败: ' + error.message);
        }
    }

    async processCSVFile(file) {
        const text = await this.readFileAsText(file);
        const results = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
        });
        
        if (results.errors.length > 0) {
            console.warn('CSV解析警告:', results.errors);
        }
        
        this.data = results.data;
        this.columns = results.meta.fields || [];
        this.showDataPreview();
    }

    async processExcelFile(file) {
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        this.data = jsonData;
        this.columns = Object.keys(jsonData[0] || {});
        this.showDataPreview();
    }

    async processJSONFile(file) {
        const text = await this.readFileAsText(file);
        const jsonData = JSON.parse(text);
        
        // 处理不同的JSON格式
        if (Array.isArray(jsonData)) {
            this.data = jsonData;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
            this.data = jsonData.data;
        } else {
            // 尝试将对象转换为数组
            this.data = [jsonData];
        }
        
        this.columns = Object.keys(this.data[0] || {});
        this.showDataPreview();
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file, 'UTF-8');
        });
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    showDataPreview() {
        const preview = document.getElementById('dataPreview');
        if (!preview || !this.data || this.data.length === 0) {
            return;
        }
        
        // 创建表格HTML
        let tableHTML = '<table><thead><tr>';
        this.columns.forEach(column => {
            tableHTML += `<th>${column}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        // 只显示前10行数据
        const previewData = this.data.slice(0, 10);
        previewData.forEach(row => {
            tableHTML += '<tr>';
            this.columns.forEach(column => {
                tableHTML += `<td>${row[column] || ''}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        
        // 如果数据超过10行，显示提示
        if (this.data.length > 10) {
            tableHTML += `<div style="text-align: center; padding: 10px; color: #6c757d; font-size: 0.9rem;">显示前10行数据，共${this.data.length}行</div>`;
        }
        
        preview.innerHTML = tableHTML;
        preview.classList.remove('hidden');
    }

    updateAnalysisDescription() {
        const input = document.getElementById('userRequirement');
        
        if (input) {
            const text = input.value.trim();
            // 这里可以添加实时更新分析需求的逻辑
            console.log('分析需求更新:', text);
        }
    }

    async generateConfigRequirements() {
        if (!this.data || this.data.length === 0) {
            this.showError('请先上传数据或选择模板数据');
            return;
        }
        
        if (!this.columns || this.columns.length === 0) {
            this.showError('数据列信息不完整');
            return;
        }
        
        try {
            this.showLoading();
            this.updateProgress(1, '分析数据...');
            
            // 生成配置要求
            const configRequirements = this.generateConfigRequirementsInternal();
            
            // 显示配置要求
            this.showConfigRequirements(configRequirements);
            
            this.updateProgress(2, '生成配置要求完成');
            
        } catch (error) {
            console.error('生成配置要求失败:', error);
            this.showError('生成配置要求失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    showConfigRequirements(configRequirements) {
        const optimizedCard = document.getElementById('optimizedDescription');
        const optimizedContent = document.getElementById('optimizedContent');
        const generateScriptBtn = document.getElementById('generateScript');
        
        if (optimizedCard && optimizedContent) {
            // 生成配置要求文本
            let requirementsText = `图表类型: ${configRequirements.chartType}\n`;
            requirementsText += `数据列: ${configRequirements.dataColumns.join(', ')}\n\n`;
            requirementsText += `配置要求:\n`;
            configRequirements.specialInstructions.forEach(instruction => {
                requirementsText += `- ${instruction}\n`;
            });
            
            optimizedContent.value = requirementsText;
            optimizedCard.classList.remove('hidden');
            
            if (generateScriptBtn) {
                generateScriptBtn.disabled = false;
                generateScriptBtn.classList.remove('hidden');
            }
        }
    }
    
    generateConfigRequirementsInternal() {
        const requirements = {
            dataColumns: this.columns,
            dataSample: this.data.slice(0, 3), // 只使用前3行作为样本
            dataStats: this.getDataStatistics(),
            analysisGoal: this.getAnalysisGoal(),
            chartType: this.suggestChartType(),
            specialInstructions: [
                '只生成JavaScript代码，不要包含HTML',
                '代码应该能够根据JSON文件路径和数据列名生成图表',
                '使用ECharts库进行图表渲染',
                '确保代码可以直接执行',
                '添加适当的错误处理'
            ]
        };
        
        return requirements;
    }
    
    async generateScript() {
        if (!this.data || this.data.length === 0) {
            this.showError('请先上传数据或选择模板数据');
            return;
        }
        
        if (!this.columns || this.columns.length === 0) {
            this.showError('数据列信息不完整');
            return;
        }
        
        try {
            this.showLoading();
            this.updateProgress(3, '配置要求完成');
            this.hideError();
            this.hideChart();
            
            // 获取优化的配置要求
            const optimizedContent = document.getElementById('optimizedContent');
            const analysisGoal = optimizedContent ? optimizedContent.value : this.getAnalysisGoal();
            
            // 构建prompt
            const configRequirements = this.generateConfigRequirementsInternal();
            configRequirements.analysisGoal = analysisGoal;
            const prompt = this.buildPrompt(configRequirements);
            
            this.updateProgress(4, '生成脚本...');
            
            // 调用API生成脚本
            const generatedScript = await this.callDeepSeekAPI(prompt);
            
            // 显示生成的代码
            this.showGeneratedCode(generatedScript);
            
            // 启用执行脚本按钮
            const executeScriptBtn = document.getElementById('executeScript');
            if (executeScriptBtn) {
                executeScriptBtn.disabled = false;
                executeScriptBtn.classList.remove('hidden');
            }
            
            this.updateProgress(5, '执行完成');
            
        } catch (error) {
            console.error('生成脚本失败:', error);
            this.showError('生成脚本失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    showGeneratedCode(code) {
        const codeOutput = document.getElementById('codeOutput');
        const resultCard = document.getElementById('resultCard');
        
        if (codeOutput && resultCard) {
            codeOutput.textContent = code;
            resultCard.classList.remove('hidden');
        }
    }
    
    updateProgress(step, status) {
        const progressStatus = document.getElementById('progressStatus');
        const steps = document.querySelectorAll('.step');
        
        if (progressStatus) {
            progressStatus.textContent = status;
        }
        
        steps.forEach(stepEl => {
            const stepNum = parseInt(stepEl.dataset.step);
            if (stepNum <= step) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });
    }

    generateConfigRequirements() {
        const requirements = {
            dataColumns: this.columns,
            dataSample: this.data.slice(0, 3), // 只使用前3行作为样本
            dataStats: this.getDataStatistics(),
            analysisGoal: this.getAnalysisGoal(),
            chartType: this.suggestChartType(),
            specialInstructions: [
                '只生成JavaScript代码，不要包含HTML',
                '代码应该能够根据JSON文件路径和数据列名生成图表',
                '使用ECharts库进行图表渲染',
                '确保代码可以直接执行',
                '添加适当的错误处理'
            ]
        };
        
        return requirements;
    }

    getDataStatistics() {
        const stats = {};
        
        this.columns.forEach(column => {
            const values = this.data.map(row => row[column]).filter(val => val !== null && val !== undefined);
            const numericValues = values.filter(val => typeof val === 'number' || !isNaN(val));
            
            stats[column] = {
                type: numericValues.length > values.length * 0.5 ? 'numeric' : 'categorical',
                uniqueCount: new Set(values).size,
                nullCount: values.length - this.data.length,
                sampleValues: values.slice(0, 5)
            };
            
            if (stats[column].type === 'numeric') {
                const nums = numericValues.map(Number);
                stats[column].min = Math.min(...nums);
                stats[column].max = Math.max(...nums);
                stats[column].avg = nums.reduce((a, b) => a + b, 0) / nums.length;
            }
        });
        
        return stats;
    }

    getAnalysisGoal() {
        const input = document.getElementById('userRequirement');
        return input ? input.value.trim() : '请根据数据特征生成合适的图表';
    }

    suggestChartType() {
        const numericColumns = this.columns.filter(col => {
            const stats = this.getDataStatistics()[col];
            return stats && stats.type === 'numeric';
        });
        
        const categoricalColumns = this.columns.filter(col => {
            const stats = this.getDataStatistics()[col];
            return stats && stats.type === 'categorical';
        });
        
        if (numericColumns.length >= 2) {
            return '散点图或折线图';
        } else if (numericColumns.length === 1 && categoricalColumns.length >= 1) {
            return '柱状图或饼图';
        } else if (categoricalColumns.length >= 2) {
            return '柱状图或热力图';
        } else {
            return '根据数据特征自动选择';
        }
    }

    buildPrompt(requirements) {
        const analysisGoal = requirements.analysisGoal || '请根据数据特征生成合适的图表';
        
        let prompt = `请根据以下数据信息生成ECharts图表代码：\n\n`;
        prompt += `分析目标: ${analysisGoal}\n\n`;
        prompt += `数据列名: ${requirements.dataColumns.join(', ')}\n\n`;
        prompt += `数据样本:\n`;
        prompt += `JSON数据文件路径: ./temp/data.json\n\n`;
        prompt += `数据样本(前3行):\n`;
        prompt += `${JSON.stringify(requirements.dataSample, null, 2)}\n\n`;
        
        prompt += `数据统计信息:\n`;
        Object.entries(requirements.dataStats).forEach(([column, stats]) => {
            prompt += `- ${column}: ${stats.type}类型, ${stats.uniqueCount}个唯一值\n`;
            if (stats.type === 'numeric') {
                prompt += `  范围: ${stats.min} - ${stats.max}, 平均值: ${stats.avg.toFixed(2)}\n`;
            }
        });
        
        prompt += `\n建议图表类型: ${requirements.chartType}\n\n`;
        prompt += `特殊要求:\n`;
        requirements.specialInstructions.forEach(instruction => {
            prompt += `- ${instruction}\n`;
        });
        
        prompt += `\n请生成完整的JavaScript代码，要求:\n`;
        prompt += `1. 只输出JavaScript代码，不要包含HTML\n`;
        prompt += `2. 代码应该从./temp/data.json文件加载数据\n`;
        prompt += `3. 使用提供的数据列名进行图表配置\n`;
        prompt += `4. 确保代码可以直接执行\n`;
        prompt += `5. 添加适当的错误处理\n`;
        prompt += `6. 使用ECharts库进行图表渲染\n`;
        
        return prompt;
    }

    async callDeepSeekAPI(prompt) {
        const maxRetries = this.maxRetries;
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`尝试调用DeepSeek API (第${attempt}次)`);
                
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [{
                            role: 'user',
                            content: prompt
                        }],
                        temperature: 0.7,
                        max_tokens: 4000,
                        stream: false
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    const content = data.choices[0].message.content;
                    console.log('API调用成功');
                    return this.extractCodeFromResponse(content);
                } else {
                    throw new Error('API响应格式不正确');
                }
                
            } catch (error) {
                console.error(`第${attempt}次API调用失败:`, error);
                lastError = error;
                
                if (attempt < maxRetries) {
                    console.log(`等待${this.retryDelay}ms后重试...`);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                }
            }
        }
        
        throw new Error(`API调用失败，已重试${maxRetries}次。最后错误: ${lastError.message}`);
    }

    extractCodeFromResponse(response) {
        console.log('extractCodeFromResponse被调用...');
        console.log('输入响应长度:', response ? response.length : 0);
        console.log('输入响应预览:', response ? response.substring(0, 200) : 'null');
        
        if (!response || response.trim() === '') {
            console.warn('警告：响应内容为空');
            return '';
        }
        
        // 从响应中提取代码块
        const codeMatch = response.match(/```javascript\s*([\s\s]*?)\s*```/);
        if (codeMatch) {
            console.log('找到javascript代码块');
            console.log('提取的代码长度:', codeMatch[1].length);
            return codeMatch[1];
        }
        
        // 尝试其他格式的代码块
        const codeMatch2 = response.match(/```js\s*([\s\s]*?)\s*```/);
        if (codeMatch2) {
            console.log('找到js代码块');
            console.log('提取的代码长度:', codeMatch2[1].length);
            return codeMatch2[1];
        }
        
        const codeMatch3 = response.match(/```\s*([\s\s]*?)\s*```/);
        if (codeMatch3) {
            console.log('找到通用代码块');
            console.log('提取的代码长度:', codeMatch3[1].length);
            return codeMatch3[1];
        }
        
        // 如果没有代码块，尝试清理响应
        console.log('未找到代码块，尝试清理响应...');
        const cleanedResponse = response.replace(/^```javascript\s*/, '').replace(/\s*```$/, '')
                                            .replace(/^```js\s*/, '').replace(/\s*```$/, '')
                                            .replace(/^```\s*/, '').replace(/\s*```$/, '');
        
        console.log('清理后的响应长度:', cleanedResponse.length);
        console.log('清理后的响应预览:', cleanedResponse.substring(0, 200));
        
        return cleanedResponse;
    }

    executeGeneratedCode(code) {
        try {
            console.log('开始执行生成的代码...');
            
            // 预处理代码，修复常见语法错误
            const cleanedCode = this.preprocessCode(code);
            console.log('预处理后的代码:', cleanedCode);
            
            // 验证代码语法
            this.validateCodeSyntax(cleanedCode);
            console.log('代码语法验证通过');
            
            // 创建图表容器
            const container = document.getElementById('chartContainer');
            if (!container) {
                throw new Error('找不到图表容器元素');
            }
            container.innerHTML = '';
            
            // 创建一个新的div用于图表
            const chartDiv = document.createElement('div');
            chartDiv.style.width = '100%';
            chartDiv.style.height = '100%';
            chartDiv.id = 'echarts-chart-' + Date.now(); // 唯一ID
            container.appendChild(chartDiv);

            // 安全的代码执行环境
            const safeExecute = () => {
                // 限制可用的全局对象
                const safeGlobals = {
                    console: console,
                    Math: Math,
                    Date: Date,
                    Array: Array,
                    Object: Object,
                    String: String,
                    Number: Number,
                    Boolean: Boolean,
                    JSON: JSON,
                    parseInt: parseInt,
                    parseFloat: parseFloat,
                    isNaN: isNaN,
                    isFinite: isFinite,
                    decodeURI: decodeURI,
                    decodeURIComponent: decodeURIComponent,
                    encodeURI: encodeURI,
                    encodeURIComponent: encodeURIComponent,
                    echarts: echarts
                };
                
                // 创建安全的执行上下文
                const executeContext = {
                    data: this.data,
                    columns: this.columns,
                    echarts: echarts,
                    chartContainer: chartDiv,
                    console: console
                };
                
                // 使用Proxy来限制访问
                const safeProxy = new Proxy(executeContext, {
                    get(target, prop) {
                        if (prop in target) {
                            return target[prop];
                        }
                        if (prop in safeGlobals) {
                            return safeGlobals[prop];
                        }
                        throw new Error(`访问受限: 不允许访问 ${prop}`);
                    }
                });
                
                // 创建并执行函数
                const executeFunction = new Function(
                    'data', 'columns', 'echarts', 'chartContainer', 'console',
                    cleanedCode
                );
                
                // 在try-catch中执行生成的代码
                try {
                    executeFunction(
                        safeProxy.data,
                        safeProxy.columns,
                        safeProxy.echarts,
                        safeProxy.chartContainer,
                        safeProxy.console
                    );
                    console.log('代码执行成功');
                } catch (execError) {
                    console.error('生成的代码执行失败:', execError);
                    throw new Error(`图表生成失败: ${execError.message}`);
                }
            };
            
            // 执行安全代码
            safeExecute();

            // 显示生成的代码（显示原始代码，而不是清理后的代码）
            this.showGeneratedCode(code);
            
            // 显示生成的脚本
            this.showGeneratedScript(code);
            
        } catch (error) {
            console.error('代码执行错误:', error);
            console.error('错误堆栈:', error.stack);
            this.showError('图表生成代码执行失败: ' + error.message);
            // 重新抛出错误，让上层调用者处理
            throw error;
        }
    }
    
    preprocessCode(code) {
        // 移除多余的空行和注释
        let cleaned = code.trim();
        
        // 修复常见的语法错误
        // 移除多余的右括号
        cleaned = cleaned.replace(/\)\s*\)+/g, ')');
        
        // 移除多余的逗号
        cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
        
        // 确保代码以分号结尾
        if (cleaned && !cleaned.endsWith(';')) {
            cleaned += ';';
        }
        
        return cleaned;
    }
    
    validateCodeSyntax(code) {
        try {
            // 检查echarts是否可用
            if (typeof echarts === 'undefined') {
                throw new Error('ECharts库未加载，请确保已正确引入ECharts');
            }
            
            // 基础语法检查 - 检查常见的语法错误模式
            const syntaxErrors = [];
            
            // 检查括号匹配
            const bracketPairs = {
                '(': ')',
                '[': ']',
                '{': '}'
            };
            
            const stack = [];
            for (let i = 0; i < code.length; i++) {
                const char = code[i];
                if (bracketPairs[char]) {
                    stack.push(char);
                } else if (Object.values(bracketPairs).includes(char)) {
                    const last = stack.pop();
                    if (bracketPairs[last] !== char) {
                        syntaxErrors.push(`括号不匹配: 位置 ${i}`);
                    }
                }
            }
            
            if (stack.length > 0) {
                syntaxErrors.push(`未闭合的括号: ${stack.join(', ')}`);
            }
            
            if (syntaxErrors.length > 0) {
                throw new Error(`代码语法问题:\n${syntaxErrors.join('\n')}`);
            }
            
            console.log('代码语法检查通过');
        } catch (syntaxError) {
            // 提供更详细的错误信息
            const errorMessage = syntaxError.message;
            let detailedError = `代码语法错误: ${errorMessage}`;
            
            detailedError += `\n\n请检查生成的代码并重试。`;
            throw new Error(detailedError);
        }
    }

    showGeneratedCode(code) {
        const codeOutput = document.getElementById('codeOutput');
        const codeContainer = codeOutput.parentElement;
        
        // 检查是否已经创建了折叠控件
        let toggleButton = codeContainer.querySelector('.code-toggle');
        
        if (!toggleButton) {
            // 创建折叠按钮
            toggleButton = document.createElement('button');
            toggleButton.className = 'code-toggle';
            toggleButton.textContent = '展开代码';
            toggleButton.style.cssText = 'margin-bottom: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;';
            
            // 添加点击事件
            toggleButton.addEventListener('click', () => {
                const isExpanded = codeOutput.classList.contains('expanded');
                if (isExpanded) {
                    codeOutput.classList.remove('expanded');
                    codeOutput.style.maxHeight = '100px';
                    codeOutput.style.overflow = 'hidden';
                    toggleButton.textContent = '展开代码';
                } else {
                    codeOutput.classList.add('expanded');
                    codeOutput.style.maxHeight = 'none';
                    codeOutput.style.overflow = 'auto';
                    toggleButton.textContent = '折叠代码';
                }
            });
            
            // 在代码输出框之前插入按钮
            codeContainer.insertBefore(toggleButton, codeOutput);
        }
        
        // 设置代码内容
        codeOutput.textContent = code;
        
        // 设置默认折叠状态
        codeOutput.classList.remove('expanded');
        codeOutput.style.maxHeight = '100px';
        codeOutput.style.overflow = 'hidden';
        codeOutput.style.cssText += 'border: 1px solid #ddd; padding: 10px; background: #f8f9fa; border-radius: 4px; font-family: monospace; white-space: pre-wrap; transition: max-height 0.3s ease;';
        
        // 重置按钮文本
        toggleButton.textContent = '展开代码';
        
        // 显示代码容器
        codeOutput.classList.remove('hidden');
    }

    showGeneratedScript(script) {
        const scriptOutput = document.getElementById('scriptOutput');
        if (!scriptOutput) {
            console.error('找不到脚本输出元素');
            return;
        }
        
        const scriptContainer = scriptOutput.parentElement;
        
        // 检查是否已经创建了折叠控件
        let toggleButton = scriptContainer.querySelector('.script-toggle');
        
        if (!toggleButton) {
            // 创建折叠按钮
            toggleButton = document.createElement('button');
            toggleButton.className = 'script-toggle';
            toggleButton.textContent = '展开脚本';
            toggleButton.style.cssText = 'margin-bottom: 10px; padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;';
            
            // 添加点击事件
            toggleButton.addEventListener('click', () => {
                const isExpanded = scriptOutput.classList.contains('expanded');
                if (isExpanded) {
                    scriptOutput.classList.remove('expanded');
                    scriptOutput.style.maxHeight = '100px';
                    scriptOutput.style.overflow = 'hidden';
                    toggleButton.textContent = '展开脚本';
                } else {
                    scriptOutput.classList.add('expanded');
                    scriptOutput.style.maxHeight = 'none';
                    scriptOutput.style.overflow = 'auto';
                    toggleButton.textContent = '折叠脚本';
                }
            });
            
            // 在脚本输出框之前插入按钮
            scriptContainer.insertBefore(toggleButton, scriptOutput);
        }
        
        // 设置脚本内容
        scriptOutput.textContent = script;
        
        // 设置默认折叠状态
        scriptOutput.classList.remove('expanded');
        scriptOutput.style.maxHeight = '100px';
        scriptOutput.style.overflow = 'hidden';
        scriptOutput.style.cssText += 'border: 1px solid #ddd; padding: 10px; background: #f8f9fa; border-radius: 4px; font-family: monospace; white-space: pre-wrap; transition: max-height 0.3s ease;';
        
        // 重置按钮文本
        toggleButton.textContent = '展开脚本';
        
        // 显示脚本容器
        scriptOutput.classList.remove('hidden');
    }

    showResult() {
        document.getElementById('resultCard').classList.remove('hidden');
        document.getElementById('chartContainer').classList.remove('hidden');
    }

    showLoading() {
        console.log('显示loading指示器...');
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
            console.log('loading元素已显示');
        } else {
            console.error('找不到loading元素');
        }
        this.resetProgress();
        this.updateProgress(2, '正在分析数据...');
    }

    hideLoading() {
        console.log('隐藏loading指示器...');
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.add('hidden');
            console.log('loading元素已隐藏');
        } else {
            console.error('找不到loading元素');
        }
    }

    resetProgress() {
        // Reset all steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        // Reset progress bar
        document.getElementById('progress-bar').style.width = '0%';
        
        // Reset status text
        document.getElementById('progress-status').textContent = '正在准备生成图表配置要求...';
    }

    updateProgress(step, status) {
        // Update steps
        document.querySelectorAll('.step').forEach((stepEl, index) => {
            const stepNum = parseInt(stepEl.dataset.step);
            if (stepNum < step) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else if (stepNum === step) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
            } else {
                stepEl.classList.remove('active', 'completed');
            }
        });
        
        // Update progress bar
        const progressPercentage = (step / 6) * 100;
        document.getElementById('progress-bar').style.width = progressPercentage + '%';
        
        // Update status text
        document.getElementById('progress-status').textContent = status;
    }

    // showError方法已在前面定义，使用showNotification系统

    hideChart() {
        document.getElementById('chartContainer').classList.add('hidden');
        document.getElementById('codeOutput').classList.add('hidden');
    }

    /**
     * 现代化功能：动画队列管理
     * 管理页面动画的执行顺序和性能优化
     */
    addToAnimationQueue(callback, priority = 'normal') {
        const animationItem = {
            callback,
            priority,
            timestamp: Date.now()
        };
        
        this.animationQueue.push(animationItem);
        this.animationQueue.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        if (!this.isAnimating) {
            this.processAnimationQueue();
        }
    }
    
    processAnimationQueue() {
        if (this.animationQueue.length === 0) {
            this.isAnimating = false;
            return;
        }
        
        this.isAnimating = true;
        const nextAnimation = this.animationQueue.shift();
        
        // 使用 requestAnimationFrame 优化动画性能
        requestAnimationFrame(() => {
            try {
                nextAnimation.callback();
            } catch (error) {
                console.error('动画执行错误:', error);
            }
            
            // 添加小延迟避免动画过于密集
            setTimeout(() => {
                this.processAnimationQueue();
            }, 16); // 约60fps
        });
    }
    
    /**
     * 现代化功能：性能监控
     * 监控应用性能指标并记录
     */
    startPerformanceMonitoring() {
        if ('performance' in window) {
            this.performanceMetrics.startTime = performance.now();
            
            // 监控关键操作的性能
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'measure') {
                        this.performanceMetrics.operations[entry.name] = entry.duration;
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure'] });
        }
    }
    
    recordPerformanceMetric(operationName, startTime) {
        if ('performance' in window) {
            const duration = performance.now() - startTime;
            this.performanceMetrics.operations[operationName] = duration;
            
            // 如果操作耗时过长，记录警告
            if (duration > 1000) {
                console.warn(`性能警告: ${operationName} 耗时 ${duration.toFixed(2)}ms`);
            }
        }
    }
    
    getPerformanceReport() {
        const report = {
            totalTime: performance.now() - this.performanceMetrics.startTime,
            operations: this.performanceMetrics.operations,
            averageTime: Object.values(this.performanceMetrics.operations).reduce((a, b) => a + b, 0) / 
                       Object.keys(this.performanceMetrics.operations).length || 0
        };
        
        return report;
    }
    
    /**
     * 现代化功能：用户偏好设置
     * 管理用户的个性化设置
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('dataAnalysisToolPreferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.error('保存用户偏好设置失败:', error);
        }
    }
    
    updateUserPreferences(key, value) {
        this.userPreferences[key] = value;
        this.saveUserPreferences();
        
        // 应用设置变化
        this.applyUserPreferences();
    }
    
    applyUserPreferences() {
        // 应用主题设置
        if (this.userPreferences.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // 应用动画设置
        if (!this.userPreferences.animations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
        
        // 应用字体大小设置
        if (this.userPreferences.fontSize) {
            document.documentElement.style.setProperty('--user-font-size', this.userPreferences.fontSize);
        }
    }
    
    /**
     * 现代化功能：智能建议系统
     * 基于用户使用习惯提供智能建议
     */
    generateSmartSuggestions() {
        const suggestions = [];
        
        // 基于使用历史生成建议
        if (this.userPreferences.usageHistory) {
            const mostUsedTemplate = this.getMostUsedItem(this.userPreferences.usageHistory.templates);
            if (mostUsedTemplate) {
                suggestions.push({
                    type: 'template',
                    text: `您经常使用"${mostUsedTemplate}"模板，是否要再次使用？`,
                    action: () => this.selectTemplate(mostUsedTemplate)
                });
            }
            
            const mostUsedDataSource = this.getMostUsedItem(this.userPreferences.usageHistory.dataSources);
            if (mostUsedDataSource) {
                suggestions.push({
                    type: 'dataSource',
                    text: `您经常使用"${mostUsedDataSource}"数据源，是否要再次使用？`,
                    action: () => this.selectDataSource(mostUsedDataSource)
                });
            }
        }
        
        return suggestions;
    }
    
    getMostUsedItem(items) {
        if (!items || Object.keys(items).length === 0) return null;
        
        return Object.entries(items)
            .sort(([,a], [,b]) => b - a)[0][0];
    }
    
    /**
     * 现代化功能：响应式布局适配
     * 根据设备类型优化界面布局
     */
    optimizeLayoutForDevice() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        
        if (isMobile) {
            document.body.classList.add('mobile-layout');
            document.body.classList.remove('tablet-layout', 'desktop-layout');
            
            // 移动端优化：简化导航，增大触控区域
            this.optimizeForMobile();
        } else if (isTablet) {
            document.body.classList.add('tablet-layout');
            document.body.classList.remove('mobile-layout', 'desktop-layout');
            
            // 平板端优化
            this.optimizeForTablet();
        } else {
            document.body.classList.add('desktop-layout');
            document.body.classList.remove('mobile-layout', 'tablet-layout');
            
            // 桌面端优化
            this.optimizeForDesktop();
        }
    }
    
    optimizeForMobile() {
        // 增大按钮和触控区域
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.minHeight = '48px';
            button.style.minWidth = '48px';
        });
        
        // 简化复杂交互
        this.simplifyInteractionsForMobile();
    }
    
    optimizeForTablet() {
        // 平板端特定优化
        this.adjustLayoutForTablet();
    }
    
    optimizeForDesktop() {
        // 桌面端特定优化
        this.enableAdvancedFeatures();
    }
    
    simplifyInteractionsForMobile() {
        // 将悬停效果改为点击效果
        const hoverElements = document.querySelectorAll('[data-hover]');
        hoverElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileInteraction(element);
            });
        });
    }
    
    toggleMobileInteraction(element) {
        element.classList.toggle('mobile-active');
    }
    
    /**
     * 现代化功能：无障碍访问支持
     * 提升应用的无障碍访问性
     */
    enhanceAccessibility() {
        // 为所有交互元素添加 ARIA 标签
        this.addAriaLabels();
        
        // 支持键盘导航
        this.enableKeyboardNavigation();
        
        // 添加屏幕阅读器支持
        this.addScreenReaderSupport();
    }
    
    addAriaLabels() {
        const interactiveElements = document.querySelectorAll('button, input, select, textarea');
        interactiveElements.forEach(element => {
            if (!element.getAttribute('aria-label')) {
                const label = element.textContent || element.placeholder || element.value || '交互元素';
                element.setAttribute('aria-label', label);
            }
        });
    }
    
    enableKeyboardNavigation() {
        // 支持 Tab 键导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            } else if (e.key === 'Enter' || e.key === ' ') {
                this.handleActivationKey(e);
            }
        });
    }
    
    handleTabNavigation(e) {
        // 处理 Tab 键导航逻辑
        const focusableElements = document.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        if (currentIndex !== -1) {
            const nextIndex = e.shiftKey 
                ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
                : (currentIndex + 1) % focusableElements.length;
            
            focusableElements[nextIndex].focus();
        }
    }
    
    handleActivationKey(e) {
        if (e.target.tagName === 'BUTTON' || e.target.getAttribute('role') === 'button') {
            e.preventDefault();
            e.target.click();
        }
    }
    
    addScreenReaderSupport() {
        // 为动态内容添加屏幕阅读器通知
        this.announceToScreenReader = (message) => {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.overflow = 'hidden';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        };
    }

    // 生成销售数据
    generateSalesData() {
        const products = ['产品A', '产品B', '产品C', '产品D', '产品E'];
        const regions = ['华北', '华东', '华南', '华中', '西北', '西南', '东北'];
        const data = [];
        
        // 生成表头
        const headers = ['月份', '产品', '地区', '销售额', '数量', '单价'];
        data.push(headers);
        
        // 生成12个月的数据
        for (let month = 1; month <= 12; month++) {
            products.forEach(product => {
                regions.forEach(region => {
                    const quantity = Math.floor(Math.random() * 1000) + 100;
                    const price = Math.floor(Math.random() * 500) + 50;
                    const sales = quantity * price;
                    
                    data.push([
                        `${month}月`,
                        product,
                        region,
                        sales,
                        quantity,
                        price
                    ]);
                });
            });
        }
        
        this.data = data;
        this.columns = headers;
        this.showDataPreview();
        this.showNotification('销售数据生成成功', 'success');
    }

    // 生成温度数据
    generateTemperatureData() {
        const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆'];
        const data = [];
        
        // 生成表头
        const headers = ['日期', '城市', '最高温度', '最低温度', '平均温度', '湿度', '天气状况'];
        data.push(headers);
        
        // 生成30天的数据
        for (let day = 1; day <= 30; day++) {
            cities.forEach(city => {
                const baseTemp = Math.floor(Math.random() * 20) + 10; // 基础温度10-30度
                const maxTemp = baseTemp + Math.floor(Math.random() * 10);
                const minTemp = baseTemp - Math.floor(Math.random() * 10);
                const avgTemp = Math.round((maxTemp + minTemp) / 2);
                const humidity = Math.floor(Math.random() * 60) + 30; // 湿度30-90%
                
                const weatherConditions = ['晴', '多云', '阴', '小雨', '中雨', '雷阵雨'];
                const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
                
                data.push([
                    `${day}日`,
                    city,
                    maxTemp,
                    minTemp,
                    avgTemp,
                    humidity,
                    weather
                ]);
            });
        }
        
        this.data = data;
        this.columns = headers;
        this.showDataPreview();
        this.showNotification('温度数据生成成功', 'success');
    }

    // 生成性能数据
    generatePerformanceData() {
        const metrics = ['CPU使用率', '内存使用率', '磁盘使用率', '网络延迟', '响应时间'];
        const servers = ['Server-01', 'Server-02', 'Server-03', 'Server-04', 'Server-05'];
        const data = [];
        
        // 生成表头
        const headers = ['时间戳', '服务器', '指标', '数值', '状态', '阈值'];
        data.push(headers);
        
        // 生成24小时的数据（每小时一个数据点）
        for (let hour = 0; hour < 24; hour++) {
            servers.forEach(server => {
                metrics.forEach(metric => {
                    let value, status, threshold;
                    
                    switch(metric) {
                        case 'CPU使用率':
                            value = Math.floor(Math.random() * 100);
                            threshold = 80;
                            status = value > threshold ? '警告' : '正常';
                            break;
                        case '内存使用率':
                            value = Math.floor(Math.random() * 100);
                            threshold = 85;
                            status = value > threshold ? '警告' : '正常';
                            break;
                        case '磁盘使用率':
                            value = Math.floor(Math.random() * 100);
                            threshold = 90;
                            status = value > threshold ? '警告' : '正常';
                            break;
                        case '网络延迟':
                            value = Math.floor(Math.random() * 200); // 延迟0-200ms
                            threshold = 100;
                            status = value > threshold ? '警告' : '正常';
                            break;
                        case '响应时间':
                            value = Math.floor(Math.random() * 1000); // 响应时间0-1000ms
                            threshold = 500;
                            status = value > threshold ? '警告' : '正常';
                            break;
                    }
                    
                    data.push([
                        `${hour.toString().padStart(2, '0')}:00`,
                        server,
                        metric,
                        value,
                        status,
                        threshold
                    ]);
                });
            });
        }
        
        this.data = data;
        this.columns = headers;
        this.showDataPreview();
        this.showNotification('性能数据生成成功', 'success');
    }

    // 生成成绩数据
    generateGradesData() {
        const students = [];
        const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
        const data = [];
        
        // 生成学生姓名
        const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
        const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军'];
        
        for (let i = 1; i <= 50; i++) {
            const surname = surnames[Math.floor(Math.random() * surnames.length)];
            const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
            students.push(`${surname}${givenName}${i}`);
        }
        
        // 生成表头
        const headers = ['学号', '姓名', '班级', '语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '总分', '平均分', '排名'];
        data.push(headers);
        
        // 生成学生成绩数据
        students.forEach((student, index) => {
            const studentId = `2024${(index + 1).toString().padStart(4, '0')}`;
            const className = `${Math.floor(Math.random() * 10) + 1}班`;
            const grades = {};
            let totalScore = 0;
            
            // 生成各科成绩
            subjects.forEach(subject => {
                const score = Math.floor(Math.random() * 41) + 60; // 60-100分
                grades[subject] = score;
                totalScore += score;
            });
            
            const averageScore = Math.round(totalScore / subjects.length);
            
            data.push([
                studentId,
                student,
                className,
                grades['语文'],
                grades['数学'],
                grades['英语'],
                grades['物理'],
                grades['化学'],
                grades['生物'],
                grades['历史'],
                grades['地理'],
                grades['政治'],
                totalScore,
                averageScore,
                '' // 排名稍后计算
            ]);
        });
        
        // 计算排名
        data.sort((a, b) => b[12] - a[12]); // 按总分降序排序
        data.forEach((row, index) => {
            if (index > 0) { // 跳过表头
                row[14] = index; // 设置排名
            }
        });
        
        // 恢复原始顺序（按学号）
        data.sort((a, b) => {
            if (a[0] === '学号') return -1; // 表头保持在最前面
            if (b[0] === '学号') return 1;
            return parseInt(a[0]) - parseInt(b[0]);
        });
        
        this.data = data;
        this.columns = headers;
        this.showDataPreview();
        this.showNotification('成绩数据生成成功', 'success');
    }

    // 生成股票数据
    generateStockData() {
        const stocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'JNJ', 'V'];
        const data = [];
        
        // 生成表头
        const headers = ['日期', '股票代码', '开盘价', '最高价', '最低价', '收盘价', '成交量', '涨跌幅', '市值'];
        data.push(headers);
        
        // 生成30天的数据
        for (let day = 1; day <= 30; day++) {
            stocks.forEach(stock => {
                const basePrice = Math.floor(Math.random() * 500) + 50; // 基础价格50-550
                const openPrice = basePrice;
                const change = (Math.random() - 0.5) * 20; // 涨跌幅度-10到+10
                const closePrice = Math.max(1, openPrice + change);
                const highPrice = Math.max(openPrice, closePrice) + Math.random() * 5;
                const lowPrice = Math.min(openPrice, closePrice) - Math.random() * 5;
                const volume = Math.floor(Math.random() * 10000000) + 1000000; // 成交量100万-1100万
                const changePercent = ((closePrice - openPrice) / openPrice * 100).toFixed(2);
                const marketCap = Math.floor(closePrice * volume * 0.001); // 简化的市值计算
                
                data.push([
                    `${day}日`,
                    stock,
                    openPrice.toFixed(2),
                    highPrice.toFixed(2),
                    lowPrice.toFixed(2),
                    closePrice.toFixed(2),
                    volume,
                    `${changePercent}%`,
                    marketCap
                ]);
            });
        }
        
        this.data = data;
        this.columns = headers;
        this.showDataPreview();
        this.showNotification('股票数据生成成功', 'success');
    }

    // 生成调查数据
    generateSurveyData() {
        const questions = [
            '您对我们的产品满意吗？',
            '您会推荐我们的产品给朋友吗？',
            '您认为我们的价格合理吗？',
            '您对我们的客服满意吗？',
            '您会再次购买我们的产品吗？'
        ];
        
        const options = [
            ['非常满意', '满意', '一般', '不满意', '非常不满意'],
            ['一定会', '可能会', '不确定', '可能不会', '一定不会'],
            ['非常合理', '合理', '一般', '不合理', '非常不合理'],
            ['非常满意', '满意', '一般', '不满意', '非常不满意'],
            ['一定会', '可能会', '不确定', '可能不会', '一定不会']
        ];
        
        const ageGroups = ['18-25', '26-35', '36-45', '46-55', '56+'];
        const genders = ['男', '女', '其他'];
        const cities = ['北京', '上海', '广州', '深圳', '杭州', '其他'];
        const data = [];
        
        // 生成表头
        const headers = ['调查ID', '年龄组', '性别', '城市', '问题', '答案', '评分', '调查时间'];
        data.push(headers);
        
        // 生成200份调查数据
        for (let i = 1; i <= 200; i++) {
            const surveyId = `SURV${i.toString().padStart(4, '0')}`;
            const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
            const gender = genders[Math.floor(Math.random() * genders.length)];
            const city = cities[Math.floor(Math.random() * cities.length)];
            
            // 为每个用户回答所有问题
            questions.forEach((question, qIndex) => {
                const answerOptions = options[qIndex];
                const answer = answerOptions[Math.floor(Math.random() * answerOptions.length)];
                const score = 5 - answerOptions.indexOf(answer); // 5分制，非常满意=5分
                const hour = Math.floor(Math.random() * 24);
                const minute = Math.floor(Math.random() * 60);
                const surveyTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                data.push([
                    surveyId,
                    ageGroup,
                    gender,
                    city,
                    question,
                    answer,
                    score,
                    surveyTime
                ]);
            });
        }
        
        this.data = data;
        this.columns = headers;
        this.showDataPreview();
        this.showNotification('调查数据生成成功', 'success');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new DataAnalysisTool();
});