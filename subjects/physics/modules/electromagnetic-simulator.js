/**
 * 电磁学模拟器模块
 */
class ElectromagneticSimulator {
    constructor() {
        this.electricCharges = [];
        this.currentType = 'electric-field';
        this.currentValue = 5.0;
        this.wireType = 'straight';
        
        this.init();
    }

    init() {
        this.setupControls();
        this.setupElectricField();
    }

    setupControls() {
        const typeSelect = document.getElementById('em-type');
        const startBtn = document.getElementById('em-start');
        const pauseBtn = document.getElementById('em-pause');
        const resetBtn = document.getElementById('em-reset');

        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.currentType = e.target.value;
                this.updateSpecificControls();
            });
        }

        if (startBtn) startBtn.addEventListener('click', () => this.startSimulation());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseSimulation());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSimulation());

        this.updateSpecificControls();
    }

    updateSpecificControls() {
        const container = document.getElementById('em-specific-controls');
        if (!container) return;

        let html = '';
        
        switch (this.currentType) {
            case 'electric-field':
                html = `
                    <div class="control-group">
                        <label for="charge-amount">电荷量 (μC)</label>
                        <input type="range" id="charge-amount" class="control-slider" 
                               min="-10" max="10" step="0.5" value="5">
                        <span id="charge-value">5.0 μC</span>
                    </div>
                    <div class="control-group">
                        <label for="charge-config">电荷配置</label>
                        <select id="charge-config" class="control-input">
                            <option value="single">单个电荷</option>
                            <option value="dipole">偶极子</option>
                            <option value="quadrupole">四极子</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'magnetic-field':
                html = `
                    <div class="control-group">
                        <label for="current-amount">电流 (A)</label>
                        <input type="range" id="current-amount" class="control-slider" 
                               min="0.1" max="20" step="0.1" value="5">
                        <span id="current-value">5.0 A</span>
                    </div>
                    <div class="control-group">
                        <label for="wire-type">导线类型</label>
                        <select id="wire-type" class="control-input">
                            <option value="straight">直导线</option>
                            <option value="loop">环形导线</option>
                            <option value="solenoid">螺线管</option>
                            <option value="helmholtz">亥姆霍兹线圈</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'electromagnetic-induction':
                html = `
                    <div class="control-group">
                        <label for="flux-rate">磁通变化率 (Wb/s)</label>
                        <input type="range" id="flux-rate" class="control-slider" 
                               min="0.1" max="2" step="0.1" value="0.5">
                        <span id="flux-value">0.5 Wb/s</span>
                    </div>
                    <div class="control-group">
                        <label for="coil-turns">线圈匝数</label>
                        <input type="range" id="coil-turns" class="control-slider" 
                               min="10" max="200" step="10" value="50">
                        <span id="turns-value">50</span>
                    </div>
                `;
                break;
                
            case 'circuit':
                html = `
                    <div class="control-group">
                        <label for="voltage">电压 (V)</label>
                        <input type="range" id="voltage" class="control-slider" 
                               min="1" max="24" step="1" value="12">
                        <span id="voltage-value">12 V</span>
                    </div>
                    <div class="control-group">
                        <label for="circuit-type">电路类型</label>
                        <select id="circuit-type" class="control-input">
                            <option value="dc-series">直流串联</option>
                            <option value="rc-circuit">RC电路</option>
                            <option value="ac-circuit">交流电路</option>
                        </select>
                    </div>
                `;
                break;
        }

        container.innerHTML = html;
        this.setupDynamicControls();
    }

    setupDynamicControls() {
        // 设置滑块事件监听器
        const sliders = document.querySelectorAll('#em-specific-controls .control-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const valueSpan = document.getElementById(e.target.id.replace('-amount', '-value').replace('-rate', '-value').replace('-turns', '-value'));
                
                if (valueSpan) {
                    if (e.target.id.includes('charge')) {
                        valueSpan.textContent = `${value} μC`;
                        this.currentValue = value;
                    } else if (e.target.id.includes('current')) {
                        valueSpan.textContent = `${value} A`;
                        this.currentValue = value;
                        this.updateMagneticFieldInfo(value, this.wireType);
                    } else if (e.target.id.includes('flux')) {
                        valueSpan.textContent = `${value} Wb/s`;
                    } else if (e.target.id.includes('turns')) {
                        valueSpan.textContent = value;
                    } else if (e.target.id.includes('voltage')) {
                        valueSpan.textContent = `${value} V`;
                    }
                }
            });
        });

        // 设置选择器事件监听器
        const selects = document.querySelectorAll('#em-specific-controls .control-input');
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                if (e.target.id === 'wire-type') {
                    this.wireType = e.target.value;
                    this.updateMagneticFieldInfo(this.currentValue, this.wireType);
                }
            });
        });
    }

    setupElectricField() {
        const canvas = physicsSimulator.canvases.em;
        if (canvas) {
            this.electricCharges = [
                { x: canvas.width * 0.5, y: canvas.height * 0.5, charge: 5, radius: 10 }
            ];
        }
    }

    startSimulation() {
        physicsSimulator.startAnimation('electromagnetic', () => {
            this.updateSimulation();
            this.drawSimulation();
        });
    }

    pauseSimulation() {
        physicsSimulator.pauseAnimation('electromagnetic');
    }

    resetSimulation() {
        physicsSimulator.resetSimulation('electromagnetic');
        this.setupElectricField();
    }

    updateSimulation() {
        physicsSimulator.simulationTime += physicsSimulator.timeStep;
    }

    drawSimulation() {
        const canvas = physicsSimulator.canvases.em;
        const ctx = physicsSimulator.contexts.em;
        
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (this.currentType) {
            case 'electric-field':
                this.drawElectricField(ctx, canvas);
                break;
            case 'magnetic-field':
                this.drawMagneticField(ctx, canvas);
                break;
            case 'electromagnetic-induction':
                this.drawElectromagneticInduction(ctx, canvas);
                break;
            case 'circuit':
                this.drawCircuit(ctx, canvas);
                break;
        }
    }

    drawElectricField(ctx, canvas) {
        // 绘制电场线
        ctx.strokeStyle = 'rgba(67, 97, 238, 0.6)';
        ctx.lineWidth = 2;

        this.electricCharges.forEach(charge => {
            const numLines = 12;
            for (let i = 0; i < numLines; i++) {
                const angle = (i / numLines) * 2 * Math.PI;
                const startRadius = 15;
                const endRadius = 100;

                ctx.beginPath();
                for (let r = startRadius; r <= endRadius; r += 5) {
                    const x = charge.x + r * Math.cos(angle);
                    const y = charge.y + r * Math.sin(angle);
                    
                    if (r === startRadius) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();

                // 箭头
                if (charge.charge > 0) {
                    const arrowX = charge.x + 60 * Math.cos(angle);
                    const arrowY = charge.y + 60 * Math.sin(angle);
                    physicsSimulator.drawArrow(ctx, arrowX - 5 * Math.cos(angle), arrowY - 5 * Math.sin(angle), arrowX, arrowY, 5);
                }
            }

            // 绘制电荷
            const color = charge.charge > 0 ? '#ff4444' : '#4444ff';
            physicsSimulator.drawCircle(ctx, charge.x, charge.y, charge.radius, color, true);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(charge.charge > 0 ? '+' : '-', charge.x, charge.y);
        });
    }

    drawMagneticField(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
        ctx.lineWidth = 3;

        switch (this.wireType) {
            case 'straight':
                // 直导线
                ctx.beginPath();
                ctx.moveTo(centerX, 0);
                ctx.lineTo(centerX, canvas.height);
                ctx.stroke();

                // 圆形磁场线
                ctx.strokeStyle = 'rgba(0, 100, 255, 0.6)';
                ctx.lineWidth = 2;
                for (let i = 1; i <= 5; i++) {
                    const radius = i * 40;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                break;

            case 'loop':
                // 环形导线
                ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
                ctx.stroke();

                // 轴向磁场线
                ctx.strokeStyle = 'rgba(0, 100, 255, 0.6)';
                ctx.lineWidth = 2;
                for (let i = 1; i <= 3; i++) {
                    const height = i * 30;
                    ctx.beginPath();
                    ctx.moveTo(centerX - 20, centerY - height);
                    ctx.lineTo(centerX + 20, centerY - height);
                    ctx.moveTo(centerX - 20, centerY + height);
                    ctx.lineTo(centerX + 20, centerY + height);
                    ctx.stroke();
                }
                break;

            case 'solenoid':
                // 螺线管
                const solenoidWidth = 200;
                const solenoidHeight = 100;
                
                ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.rect(centerX - solenoidWidth/2, centerY - solenoidHeight/2, solenoidWidth, solenoidHeight);
                ctx.stroke();

                // 内部均匀磁场
                ctx.strokeStyle = 'rgba(0, 100, 255, 0.7)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 8; i++) {
                    const y = centerY - solenoidHeight/2 + 20 + (i * 10);
                    ctx.beginPath();
                    ctx.moveTo(centerX - solenoidWidth/2 + 20, y);
                    ctx.lineTo(centerX + solenoidWidth/2 - 20, y);
                    ctx.stroke();
                }
                break;

            case 'helmholtz':
                // 亥姆霍兹线圈
                const coilRadius = 50;
                const coilSeparation = 100;
                
                ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
                ctx.lineWidth = 4;
                
                // 左线圈
                ctx.beginPath();
                ctx.arc(centerX - coilSeparation/2, centerY, coilRadius, 0, 2 * Math.PI);
                ctx.stroke();
                
                // 右线圈
                ctx.beginPath();
                ctx.arc(centerX + coilSeparation/2, centerY, coilRadius, 0, 2 * Math.PI);
                ctx.stroke();

                // 中心区域的均匀磁场
                ctx.strokeStyle = 'rgba(0, 100, 255, 0.7)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 5; i++) {
                    const y = centerY - 40 + i * 20;
                    ctx.beginPath();
                    ctx.moveTo(centerX - 30, y);
                    ctx.lineTo(centerX + 30, y);
                    ctx.stroke();
                }
                break;
        }

        // 标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`电流: ${this.currentValue.toFixed(1)} A`, centerX, 30);
    }

    drawElectromagneticInduction(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // 绘制线圈
        ctx.strokeStyle = '#cc6600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
        ctx.stroke();

        // 绘制变化的磁场
        const magnetX = centerX - 50 + 30 * Math.sin(physicsSimulator.simulationTime * 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(magnetX, centerY, 25, 0, 2 * Math.PI);
        ctx.fill();

        // 感应电流指示
        const currentDirection = Math.sin(physicsSimulator.simulationTime * 2) > 0 ? 1 : -1;
        ctx.strokeStyle = currentDirection > 0 ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 4;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * 2 * Math.PI;
            const startAngle = angle + (currentDirection > 0 ? 0 : Math.PI);
            const endAngle = startAngle + Math.PI / 4;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, 50, startAngle, endAngle);
            ctx.stroke();
        }
    }

    drawCircuit(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // 绘制简单电路
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        
        // 电路框架
        ctx.beginPath();
        ctx.rect(centerX - 100, centerY - 60, 200, 120);
        ctx.stroke();

        // 电池
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY - 10);
        ctx.lineTo(centerX - 80, centerY + 10);
        ctx.stroke();
        
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 70, centerY - 15);
        ctx.lineTo(centerX - 70, centerY + 15);
        ctx.stroke();

        // 电阻
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const x = centerX + 40 + i * 10;
            const y = centerY + (i % 2 === 0 ? -10 : 10);
            if (i === 0) ctx.moveTo(x, centerY);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 电流指示
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        const arrowY = centerY - 40;
        physicsSimulator.drawArrow(ctx, centerX - 50, arrowY, centerX + 50, arrowY, 8);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('电流方向', centerX, arrowY - 15);
    }

    updateMagneticFieldInfo(current, wireType) {
        const infoElement = document.getElementById('em-info');
        if (!infoElement) return;
        
        const mu0 = 4 * Math.PI * 1e-7;
        let maxFieldStrength = 0;
        let description = '';
        let formula = '';
        
        switch (wireType) {
            case 'straight':
                maxFieldStrength = mu0 * current / (2 * Math.PI * 0.01);
                description = '无限长直导线磁场';
                formula = 'B = μ₀I/(2πr)';
                break;
            case 'loop':
                maxFieldStrength = mu0 * current / (2 * 0.05);
                description = '圆形载流线圈磁场';
                formula = 'B = μ₀I/(2R)';
                break;
            case 'solenoid':
                maxFieldStrength = mu0 * 1000 * current;
                description = '螺线管内部磁场';
                formula = 'B = μ₀nI';
                break;
            case 'helmholtz':
                maxFieldStrength = (8/125) * mu0 * current / 0.05;
                description = '亥姆霍兹线圈磁场';
                formula = 'B = (8/5√5) × μ₀I/R';
                break;
        }
        
        infoElement.innerHTML = `
            <h4>磁场分析</h4>
            <p><strong>类型:</strong> ${description}</p>
            <p><strong>电流:</strong> ${current.toFixed(2)} A</p>
            <p><strong>磁感应强度:</strong> ${(maxFieldStrength * 1000).toFixed(2)} mT</p>
            <p><strong>公式:</strong> ${formula}</p>
            <p><strong>说明:</strong> 调节电流滑块观察磁场变化</p>
        `;
    }
}

// 初始化电磁学模拟器
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.physicsSimulator) {
            window.electromagneticSimulator = new ElectromagneticSimulator();
        }
    }, 100);
}); 