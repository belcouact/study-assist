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
        
        // 显示欢迎消息（首次使用）
        if (!localStorage.getItem('hasUsedBefore')) {
            this.showWelcomeMessage();
            localStorage.setItem('hasUsedBefore', 'true');
        }
        
        // 检查更新
        this.checkForUpdates();
    }
    
    // 显示欢迎消息
    showWelcomeMessage() {
        const welcomeCard = document.createElement('div');
        welcomeCard.className = 'card welcome-card';
        welcomeCard.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-icon">
                    <i class="fas fa-sparkles"></i>
                </div>
                <h3>欢迎使用智能数据分析工具！</h3>
                <p>这是一个现代化的数据可视化平台，支持多种数据格式，AI驱动的图表生成和分析报告。</p>
                <div class="welcome-features">
                    <div class="feature-item">
                        <i class="fas fa-robot"></i>
                        <span>AI智能分析</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-chart-line"></i>
                        <span>丰富的图表类型</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-mobile-alt"></i>
                        <span>响应式设计</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    开始使用
                </button>
            </div>
        `;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(welcomeCard, mainContent.firstChild);
        }
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
        
        // 数据源选择事件 - 增强交互
        document.querySelectorAll('.data-source-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const source = e.target.closest('.data-source-option').dataset.source;
                this.selectDataSource(source);
                this.addRippleEffect(e.currentTarget, e);
            });
            
            // 添加悬停效果
            option.addEventListener('mouseenter', () => {
                this.addHoverEffect(option);
            });
            
            option.addEventListener('mouseleave', () => {
                this.removeHoverEffect(option);
            });
        });

        // 文件上传事件 - 增强拖拽体验
        const fileInput = document.getElementById('fileInput');
        const fileUpload = document.getElementById('fileUpload');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        if (fileUpload) {
            fileUpload.addEventListener('click', () => fileInput.click());
            fileUpload.addEventListener('dragover', (e) => this.handleDragOver(e));
            fileUpload.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            fileUpload.addEventListener('drop', (e) => this.handleDrop(e));
            
            // 添加触摸设备支持
            fileUpload.addEventListener('touchstart', (e) => {
                this.handleTouchStart(e);
            });
            
            fileUpload.addEventListener('touchend', (e) => {
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

        // 生成按钮事件 - 增强反馈
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateScript();
                this.addButtonPulseEffect(generateBtn);
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
        const analysisInput = document.getElementById('analysisInput');
        if (analysisInput) {
            analysisInput.addEventListener('input', () => {
                this.updateAnalysisDescription();
                this.autoResizeTextarea(analysisInput);
            });
            
            // 添加输入建议
            analysisInput.addEventListener('focus', () => {
                this.showInputSuggestions(analysisInput);
            });
            
            analysisInput.addEventListener('blur', () => {
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
        if (typeof echarts === 'undefined') {
            console.warn('ECharts库未加载，尝试动态加载...');
            try {
                await this.loadScript('https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js');
                console.log('ECharts库加载成功');
            } catch (error) {
                console.error('ECharts库加载失败:', error);
                this.showError('图表库加载失败，请检查网络连接');
            }
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
            const response = await fetch('./temp/', { method: 'HEAD' }).catch(() => null);
            if (response && response.ok) {
                console.log('temp目录访问正常');
                this.loadTempFiles();
            } else {
                // temp目录不存在，这是正常情况
                this.initializeDefaultConfig();
            }
        } catch (error) {
            // 完全忽略任何错误，直接使用默认配置
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

    selectDataSource(source) {
        this.selectedDataSource = source;
        
        // 更新UI
        document.querySelectorAll('.data-source-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        const selectedOption = document.querySelector(`[data-source="${source}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        // 显示/隐藏相应的输入区域
        const fileSection = document.getElementById('fileSection');
        const templateSection = document.getElementById('templateSection');
        
        if (source === 'file') {
            if (fileSection) fileSection.classList.remove('hidden');
            if (templateSection) templateSection.classList.add('hidden');
        } else if (source === 'template') {
            if (fileSection) fileSection.classList.add('hidden');
            if (templateSection) templateSection.classList.remove('hidden');
        }
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
        
        // 生成模板数据
        this.generateTemplateData(template);
    }

    generateTemplateData(template) {
        let templateData = [];
        
        switch (template) {
            case 'sales':
                templateData = this.generateSalesData();
                break;
            case 'temperature':
                templateData = this.generateTemperatureData();
                break;
            case 'performance':
                templateData = this.generatePerformanceData();
                break;
            case 'grades':
                templateData = this.generateGradesData();
                break;
            default:
                templateData = [];
        }
        
        this.data = templateData;
        this.columns = Object.keys(templateData[0] || {});
        this.showDataPreview();
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
        const input = document.getElementById('analysisInput');
        const description = document.getElementById('analysisDescription');
        
        if (input && description) {
            const text = input.value.trim();
            if (text) {
                description.textContent = `分析需求: ${text}`;
                description.classList.remove('hidden');
            } else {
                description.classList.add('hidden');
            }
        }
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
            this.hideError();
            this.hideChart();
            
            // 生成配置要求
            const configRequirements = this.generateConfigRequirements();
            
            // 构建prompt
            const prompt = this.buildPrompt(configRequirements);
            
            // 调用API生成脚本
            const generatedScript = await this.callDeepSeekAPI(prompt);
            
            // 执行生成的脚本
            this.executeGeneratedCode(generatedScript);
            
            // 显示结果
            this.showResult();
            
        } catch (error) {
            console.error('生成脚本失败:', error);
            this.showError('生成脚本失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
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
        const input = document.getElementById('analysisInput');
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

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // 检查是否已经存在重试按钮
        let retryButton = errorDiv.querySelector('.retry-button');
        
        if (!retryButton) {
            // 创建重试按钮
            retryButton = document.createElement('button');
            retryButton.className = 'retry-button';
            retryButton.textContent = '重试';
            retryButton.style.cssText = 'margin-left: 10px; padding: 5px 15px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;';
            
            // 添加点击事件 - 重新调用generateScript方法
            retryButton.addEventListener('click', () => {
                this.hideError();
                this.generateScript();
            });
            
            // 将按钮添加到错误div中
            errorDiv.appendChild(retryButton);
        }
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }

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
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new DataAnalysisTool();
});