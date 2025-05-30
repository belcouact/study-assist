/**
 * 核心物理模拟器类
 * 处理标签切换、画布管理和通用功能
 */
class PhysicsSimulator {
    constructor() {
        this.currentTab = 'electromagnetic';
        this.canvases = {};
        this.contexts = {};
        this.animationIds = {};
        this.isRunning = {
            electromagnetic: false,
            optics: false,
            waves: false,
            thermodynamics: false
        };
        this.simulationTime = 0;
        this.timeStep = 0.1;
        
        this.init();
    }

    init() {
        this.initializeCanvases();
        this.setupTabSwitching();
        this.setupEventListeners();
        this.resizeCanvases();
        
        // 窗口大小改变时重新调整画布
        window.addEventListener('resize', () => {
            this.resizeCanvases();
        });

        console.log('物理模拟器初始化完成');
    }

    initializeCanvases() {
        const canvasIds = ['em-canvas', 'optics-canvas', 'waves-canvas', 'thermo-canvas'];
        
        canvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const context = canvas.getContext('2d');
                const key = id.replace('-canvas', '');
                this.canvases[key] = canvas;
                this.contexts[key] = context;
                
                // 设置高DPI支持
                this.setupHighDPI(canvas, context);
            }
        });
    }

    setupHighDPI(canvas, context) {
        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        
        context.scale(ratio, ratio);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }

    resizeCanvases() {
        Object.keys(this.canvases).forEach(key => {
            const canvas = this.canvases[key];
            const context = this.contexts[key];
            if (canvas && context) {
                this.setupHighDPI(canvas, context);
            }
        });
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.simulator-tab');
        const panels = document.querySelectorAll('.simulation-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // 停止当前标签的动画
                this.stopAllAnimations();
                
                // 移除所有激活状态
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // 激活选中的标签和面板
                tab.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                this.currentTab = targetTab;
                
                // 清除当前画布
                this.clearCanvas(targetTab);
                
                console.log(`切换到${targetTab}标签`);
            });
        });
    }

    setupEventListeners() {
        // 这里会被各个模块的特定事件监听器补充
        console.log('设置事件监听器');
    }

    clearCanvas(tab) {
        const canvas = this.canvases[tab];
        const ctx = this.contexts[tab];
        
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    clearAllCanvases() {
        Object.keys(this.canvases).forEach(key => {
            this.clearCanvas(key);
        });
    }

    stopAllAnimations() {
        Object.keys(this.animationIds).forEach(key => {
            if (this.animationIds[key]) {
                cancelAnimationFrame(this.animationIds[key]);
                this.animationIds[key] = null;
            }
        });
        
        Object.keys(this.isRunning).forEach(key => {
            this.isRunning[key] = false;
        });
    }

    startAnimation(tabName, animationFunction) {
        this.stopAnimation(tabName);
        this.isRunning[tabName] = true;
        
        const animate = () => {
            if (this.isRunning[tabName]) {
                animationFunction();
                this.animationIds[tabName] = requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    stopAnimation(tabName) {
        this.isRunning[tabName] = false;
        if (this.animationIds[tabName]) {
            cancelAnimationFrame(this.animationIds[tabName]);
            this.animationIds[tabName] = null;
        }
    }

    pauseAnimation(tabName) {
        this.isRunning[tabName] = false;
    }

    resetSimulation(tabName) {
        this.stopAnimation(tabName);
        this.clearCanvas(tabName);
        this.simulationTime = 0;
        
        // 重置对应标签的信息显示
        const infoElement = document.getElementById(`${tabName.replace('electromagnetic', 'em')}-info`);
        if (infoElement) {
            const tabNames = {
                'electromagnetic': '电磁学',
                'optics': '光学',
                'waves': '波动',
                'thermodynamics': '热力学'
            };
            
            infoElement.innerHTML = `
                <h4>${tabNames[tabName]}信息</h4>
                <p>选择模拟类型开始</p>
            `;
        }
    }

    // 通用绘图工具方法
    drawArrow(ctx, fromX, fromY, toX, toY, arrowSize = 8) {
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        const headlen = arrowSize;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    drawCircle(ctx, x, y, radius, color, filled = false) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        
        if (filled) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }

    drawText(ctx, text, x, y, options = {}) {
        const {
            font = '12px Arial',
            color = '#333',
            align = 'left',
            baseline = 'top'
        } = options;

        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
    }

    // 数学工具方法
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // 物理常数
    static get CONSTANTS() {
        return {
            // 真空光速 (m/s)
            SPEED_OF_LIGHT: 299792458,
            // 真空磁导率 (H/m)
            MAGNETIC_PERMEABILITY: 4 * Math.PI * 1e-7,
            // 真空介电常数 (F/m)
            ELECTRIC_PERMITTIVITY: 8.854187817e-12,
            // 基本电荷 (C)
            ELEMENTARY_CHARGE: 1.602176634e-19,
            // 电子质量 (kg)
            ELECTRON_MASS: 9.1093837015e-31,
            // 质子质量 (kg)
            PROTON_MASS: 1.67262192369e-27,
            // 普朗克常数 (J⋅s)
            PLANCK_CONSTANT: 6.62607015e-34,
            // 玻尔兹曼常数 (J/K)
            BOLTZMANN_CONSTANT: 1.380649e-23,
            // 阿伏伽德罗常数 (mol⁻¹)
            AVOGADRO_CONSTANT: 6.02214076e23,
            // 气体常数 (J/(mol⋅K))
            GAS_CONSTANT: 8.314462618
        };
    }
}

// 全局变量
let physicsSimulator;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    physicsSimulator = new PhysicsSimulator();
});

// 导出供其他模块使用
window.PhysicsSimulator = PhysicsSimulator; 