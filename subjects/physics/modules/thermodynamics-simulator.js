/**
 * 热力学模拟器模块
 */
class ThermodynamicsSimulator {
    constructor() {
        this.currentType = 'gas-laws';
        this.temperature = 300; // K
        this.pressure = 101325; // Pa
        this.volume = 0.001; // m³
        this.gasConstant = 8.314; // J/(mol·K)
        this.moles = 1.0; // mol
        this.particles = [];
        this.heatCapacity = 20.8; // J/(mol·K)
        
        this.init();
    }

    init() {
        this.setupControls();
        this.initializeParticles();
    }

    setupControls() {
        const typeSelect = document.getElementById('thermo-type');
        const startBtn = document.getElementById('thermo-start');
        const pauseBtn = document.getElementById('thermo-pause');
        const resetBtn = document.getElementById('thermo-reset');

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
        const container = document.getElementById('thermo-specific-controls');
        if (!container) return;

        let html = '';
        
        switch (this.currentType) {
            case 'gas-laws':
                html = `
                    <div class="control-group">
                        <label for="gas-temperature">温度 (K)</label>
                        <input type="range" id="gas-temperature" class="control-slider" 
                               min="200" max="600" step="10" value="${this.temperature}">
                        <span id="temp-value">${this.temperature} K</span>
                    </div>
                    <div class="control-group">
                        <label for="gas-pressure">压强 (kPa)</label>
                        <input type="range" id="gas-pressure" class="control-slider" 
                               min="50" max="500" step="10" value="${this.pressure / 1000}">
                        <span id="pressure-value">${(this.pressure / 1000).toFixed(1)} kPa</span>
                    </div>
                    <div class="control-group">
                        <label for="gas-volume">体积 (L)</label>
                        <input type="range" id="gas-volume" class="control-slider" 
                               min="0.5" max="5" step="0.1" value="${this.volume * 1000}">
                        <span id="volume-value">${(this.volume * 1000).toFixed(1)} L</span>
                    </div>
                `;
                break;
                
            case 'heat-transfer':
                html = `
                    <div class="control-group">
                        <label for="material-type">材料类型</label>
                        <select id="material-type" class="control-input">
                            <option value="copper">铜</option>
                            <option value="aluminum">铝</option>
                            <option value="steel">钢</option>
                            <option value="glass">玻璃</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label for="temp-gradient">温度梯度 (K/m)</label>
                        <input type="range" id="temp-gradient" class="control-slider" 
                               min="10" max="200" step="10" value="100">
                        <span id="gradient-value">100 K/m</span>
                    </div>
                    <div class="control-group">
                        <label for="thermal-conductivity">导热系数</label>
                        <input type="range" id="thermal-conductivity" class="control-slider" 
                               min="0.1" max="500" step="1" value="400">
                        <span id="conductivity-value">400 W/(m·K)</span>
                    </div>
                `;
                break;
                
            case 'phase-changes':
                html = `
                    <div class="control-group">
                        <label for="phase-temp">温度 (°C)</label>
                        <input type="range" id="phase-temp" class="control-slider" 
                               min="-20" max="120" step="1" value="25">
                        <span id="phase-temp-value">25°C</span>
                    </div>
                    <div class="control-group">
                        <label for="phase-pressure">压强 (atm)</label>
                        <input type="range" id="phase-pressure" class="control-slider" 
                               min="0.1" max="5" step="0.1" value="1">
                        <span id="phase-pressure-value">1 atm</span>
                    </div>
                    <div class="control-group">
                        <label for="substance">物质</label>
                        <select id="substance" class="control-input">
                            <option value="water">水</option>
                            <option value="nitrogen">氮气</option>
                            <option value="carbon-dioxide">二氧化碳</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'entropy':
                html = `
                    <div class="control-group">
                        <label for="entropy-temp">温度 (K)</label>
                        <input type="range" id="entropy-temp" class="control-slider" 
                               min="100" max="1000" step="10" value="300">
                        <span id="entropy-temp-value">300 K</span>
                    </div>
                    <div class="control-group">
                        <label for="disorder-level">无序度</label>
                        <input type="range" id="disorder-level" class="control-slider" 
                               min="0.1" max="1" step="0.1" value="0.5">
                        <span id="disorder-value">0.5</span>
                    </div>
                    <div class="control-group">
                        <label for="process-type">过程类型</label>
                        <select id="process-type" class="control-input">
                            <option value="isothermal">等温过程</option>
                            <option value="adiabatic">绝热过程</option>
                            <option value="isochoric">等体过程</option>
                            <option value="isobaric">等压过程</option>
                        </select>
                    </div>
                `;
                break;
        }

        container.innerHTML = html;
        this.setupDynamicControls();
    }

    setupDynamicControls() {
        const sliders = document.querySelectorAll('#thermo-specific-controls .control-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const valueSpan = document.getElementById(e.target.id.replace(/^(.+)$/, '$1-value'));
                
                if (valueSpan) {
                    switch (e.target.id) {
                        case 'gas-temperature':
                        case 'entropy-temp':
                            this.temperature = value;
                            valueSpan.textContent = `${value} K`;
                            break;
                        case 'gas-pressure':
                            this.pressure = value * 1000;
                            valueSpan.textContent = `${value} kPa`;
                            break;
                        case 'gas-volume':
                            this.volume = value / 1000;
                            valueSpan.textContent = `${value} L`;
                            break;
                        case 'temp-gradient':
                            valueSpan.textContent = `${value} K/m`;
                            break;
                        case 'thermal-conductivity':
                            valueSpan.textContent = `${value} W/(m·K)`;
                            break;
                        case 'phase-temp':
                            valueSpan.textContent = `${value}°C`;
                            break;
                        case 'phase-pressure':
                            valueSpan.textContent = `${value} atm`;
                            break;
                        case 'disorder-level':
                            valueSpan.textContent = value.toFixed(1);
                            break;
                    }
                    
                    this.updateParticleKineticEnergy();
                    this.updateThermodynamicsInfo();
                }
            });
        });
    }

    initializeParticles() {
        const canvas = physicsSimulator.canvases.thermo;
        if (!canvas) return;

        this.particles = [];
        const numParticles = 50;

        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * (canvas.width - 20) + 10,
                y: Math.random() * (canvas.height - 20) + 10,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: 3 + Math.random() * 2,
                mass: 1,
                energy: 0,
                color: this.getParticleColor()
            });
        }

        this.updateParticleKineticEnergy();
    }

    updateParticleKineticEnergy() {
        // 根据温度更新粒子动能 (kT = 1/2 * m * v²)
        const kB = 1.380649e-23; // 玻尔兹曼常数
        const avgKineticEnergy = 1.5 * kB * this.temperature;
        
        this.particles.forEach(particle => {
            const speed = Math.sqrt(2 * avgKineticEnergy / particle.mass) * 50; // 缩放显示
            const angle = Math.random() * 2 * Math.PI;
            particle.vx = speed * Math.cos(angle);
            particle.vy = speed * Math.sin(angle);
            particle.energy = 0.5 * particle.mass * (particle.vx ** 2 + particle.vy ** 2);
            particle.color = this.getParticleColor();
        });
    }

    getParticleColor() {
        // 根据温度和类型确定粒子颜色
        if (this.temperature < 250) return '#0066cc'; // 蓝色 - 低温
        if (this.temperature < 350) return '#00cc66'; // 绿色 - 中温
        if (this.temperature < 450) return '#ffcc00'; // 黄色 - 高温
        return '#ff3300'; // 红色 - 很高温
    }

    startSimulation() {
        physicsSimulator.startAnimation('thermodynamics', () => {
            this.updateSimulation();
            this.drawSimulation();
        });
    }

    pauseSimulation() {
        physicsSimulator.pauseAnimation('thermodynamics');
    }

    resetSimulation() {
        physicsSimulator.resetSimulation('thermodynamics');
        this.initializeParticles();
    }

    updateSimulation() {
        physicsSimulator.simulationTime += physicsSimulator.timeStep;
        
        const canvas = physicsSimulator.canvases.thermo;
        if (!canvas) return;

        // 更新粒子位置
        this.particles.forEach(particle => {
            particle.x += particle.vx * physicsSimulator.timeStep;
            particle.y += particle.vy * physicsSimulator.timeStep;

            // 边界碰撞
            if (particle.x <= particle.radius || particle.x >= canvas.width - particle.radius) {
                particle.vx *= -0.9; // 能量损失
                particle.x = Math.max(particle.radius, Math.min(canvas.width - particle.radius, particle.x));
            }
            if (particle.y <= particle.radius || particle.y >= canvas.height - particle.radius) {
                particle.vy *= -0.9;
                particle.y = Math.max(particle.radius, Math.min(canvas.height - particle.radius, particle.y));
            }
        });

        // 粒子间碰撞
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                this.checkCollision(this.particles[i], this.particles[j]);
            }
        }
    }

    checkCollision(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < p1.radius + p2.radius) {
            // 简单弹性碰撞
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // 旋转速度
            const vx1 = p1.vx * cos + p1.vy * sin;
            const vy1 = p1.vy * cos - p1.vx * sin;
            const vx2 = p2.vx * cos + p2.vy * sin;
            const vy2 = p2.vy * cos - p2.vx * sin;

            // 碰撞后速度
            const finalVx1 = ((p1.mass - p2.mass) * vx1 + 2 * p2.mass * vx2) / (p1.mass + p2.mass);
            const finalVx2 = ((p2.mass - p1.mass) * vx2 + 2 * p1.mass * vx1) / (p1.mass + p2.mass);

            // 旋转回来
            p1.vx = finalVx1 * cos - vy1 * sin;
            p1.vy = vy1 * cos + finalVx1 * sin;
            p2.vx = finalVx2 * cos - vy2 * sin;
            p2.vy = vy2 * cos + finalVx2 * sin;

            // 分离粒子
            const overlap = p1.radius + p2.radius - distance;
            const separationX = (overlap / 2) * cos;
            const separationY = (overlap / 2) * sin;
            p1.x -= separationX;
            p1.y -= separationY;
            p2.x += separationX;
            p2.y += separationY;
        }
    }

    drawSimulation() {
        const canvas = physicsSimulator.canvases.thermo;
        const ctx = physicsSimulator.contexts.thermo;
        
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (this.currentType) {
            case 'gas-laws':
                this.drawGasLaws(ctx, canvas);
                break;
            case 'heat-transfer':
                this.drawHeatTransfer(ctx, canvas);
                break;
            case 'phase-changes':
                this.drawPhaseChanges(ctx, canvas);
                break;
            case 'entropy':
                this.drawEntropy(ctx, canvas);
                break;
        }
    }

    drawGasLaws(ctx, canvas) {
        // 绘制容器
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 150);

        // 绘制气体粒子
        this.particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
            ctx.fill();
        });

        // 绘制状态参数
        this.drawGasParameters(ctx, canvas);
    }

    drawGasParameters(ctx, canvas) {
        const infoY = canvas.height - 80;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(20, infoY - 10, canvas.width - 40, 70);
        
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, infoY - 10, canvas.width - 40, 70);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        // 计算理想气体状态
        const idealPressure = (this.moles * this.gasConstant * this.temperature) / this.volume;
        const realPressure = this.pressure;

        ctx.fillText(`温度: T = ${this.temperature} K (${(this.temperature - 273.15).toFixed(1)}°C)`, 30, infoY + 10);
        ctx.fillText(`压强: P = ${(realPressure / 1000).toFixed(1)} kPa`, 30, infoY + 25);
        ctx.fillText(`体积: V = ${(this.volume * 1000).toFixed(1)} L`, 30, infoY + 40);
        ctx.fillText(`理想气体: PV = nRT → P = ${(idealPressure / 1000).toFixed(1)} kPa`, 30, infoY + 55);

        // 右侧显示粒子动能分布
        const avgEnergy = this.particles.reduce((sum, p) => sum + p.energy, 0) / this.particles.length;
        ctx.fillText(`平均动能: ${avgEnergy.toFixed(2)} J`, canvas.width - 200, infoY + 10);
        ctx.fillText(`粒子数: ${this.particles.length}`, canvas.width - 200, infoY + 25);
    }

    drawHeatTransfer(ctx, canvas) {
        // 绘制热传导板
        const plateWidth = 200;
        const plateHeight = 100;
        const plateX = (canvas.width - plateWidth) / 2;
        const plateY = (canvas.height - plateHeight) / 2;

        // 温度梯度可视化
        for (let x = 0; x < plateWidth; x += 5) {
            const temp = 400 - (x / plateWidth) * 200; // 400K到200K的梯度
            const ratio = (temp - 200) / 200; // 0到1
            
            ctx.fillStyle = `hsl(${240 - ratio * 60}, 100%, ${50 + ratio * 30}%)`; // 蓝到红
            ctx.fillRect(plateX + x, plateY, 5, plateHeight);
        }

        // 边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(plateX, plateY, plateWidth, plateHeight);

        // 热流箭头
        for (let y = plateY + 20; y < plateY + plateHeight - 20; y += 20) {
            physicsSimulator.drawArrow(ctx, plateX + 20, y, plateX + plateWidth - 20, y, 6);
        }

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('热传导', canvas.width / 2, plateY - 20);
        ctx.fillText('高温端', plateX + 30, plateY + plateHeight + 20);
        ctx.fillText('低温端', plateX + plateWidth - 30, plateY + plateHeight + 20);
    }

    drawPhaseChanges(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // 根据温度和压强确定相态
        const temp = parseFloat(document.getElementById('phase-temp')?.value || 25);
        const pressure = parseFloat(document.getElementById('phase-pressure')?.value || 1);

        let phase = 'liquid';
        let phaseColor = '#4da6ff';
        let particleArrangement = 'liquid';

        if (temp < 0 && pressure >= 1) {
            phase = 'solid';
            phaseColor = '#66ccff';
            particleArrangement = 'solid';
        } else if (temp > 100 || pressure < 0.1) {
            phase = 'gas';
            phaseColor = '#ff9999';
            particleArrangement = 'gas';
        }

        // 绘制相态容器
        ctx.fillStyle = phaseColor;
        ctx.fillRect(centerX - 100, centerY - 80, 200, 160);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - 100, centerY - 80, 200, 160);

        // 绘制粒子排列
        this.drawPhaseParticles(ctx, centerX, centerY, particleArrangement);

        // 相态标签
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${phase.toUpperCase()}`, centerX, centerY - 100);
        ctx.font = '12px Arial';
        ctx.fillText(`${temp}°C, ${pressure} atm`, centerX, centerY + 120);
    }

    drawPhaseParticles(ctx, centerX, centerY, arrangement) {
        const numParticles = 20;
        
        switch (arrangement) {
            case 'solid':
                // 有序排列
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 4; j++) {
                        const x = centerX - 60 + i * 30;
                        const y = centerY - 45 + j * 30;
                        ctx.fillStyle = '#0066cc';
                        ctx.beginPath();
                        ctx.arc(x, y, 4, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
                break;
                
            case 'liquid':
                // 半有序排列
                for (let i = 0; i < numParticles; i++) {
                    const x = centerX - 80 + Math.random() * 160;
                    const y = centerY - 60 + Math.random() * 120;
                    ctx.fillStyle = '#0099ff';
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, 2 * Math.PI);
                    ctx.fill();
                }
                break;
                
            case 'gas':
                // 随机分布
                for (let i = 0; i < numParticles; i++) {
                    const x = centerX - 90 + Math.random() * 180;
                    const y = centerY - 70 + Math.random() * 140;
                    ctx.fillStyle = '#ff6666';
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // 运动轨迹
                    ctx.strokeStyle = 'rgba(255, 102, 102, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10);
                    ctx.stroke();
                }
                break;
        }
    }

    drawEntropy(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // 绘制系统框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - 150, centerY - 100, 300, 200);

        // 根据无序度绘制粒子分布
        const disorderLevel = parseFloat(document.getElementById('disorder-level')?.value || 0.5);
        
        for (let i = 0; i < 30; i++) {
            let x, y;
            
            if (disorderLevel < 0.3) {
                // 低熵：有序排列
                x = centerX - 120 + (i % 8) * 30;
                y = centerY - 60 + Math.floor(i / 8) * 30;
            } else if (disorderLevel < 0.7) {
                // 中等熵：部分随机
                x = centerX - 120 + (i % 8) * 30 + (Math.random() - 0.5) * 20;
                y = centerY - 60 + Math.floor(i / 8) * 30 + (Math.random() - 0.5) * 20;
            } else {
                // 高熵：完全随机
                x = centerX - 140 + Math.random() * 280;
                y = centerY - 90 + Math.random() * 180;
            }

            const hue = disorderLevel * 60; // 0°(红) 到 60°(黄)
            ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }

        // 熵值显示
        const entropy = disorderLevel * 100; // 简化的熵值
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`熵 S = ${entropy.toFixed(1)} J/K`, centerX, centerY - 120);
        ctx.font = '12px Arial';
        ctx.fillText(`无序度: ${(disorderLevel * 100).toFixed(0)}%`, centerX, centerY + 130);
    }

    updateThermodynamicsInfo() {
        const infoElement = document.getElementById('thermo-info');
        if (!infoElement) return;
        
        let content = '<h4>热力学信息</h4>';
        
        switch (this.currentType) {
            case 'gas-laws':
                const idealPressure = (this.moles * this.gasConstant * this.temperature) / this.volume;
                const ratio = (this.pressure / idealPressure) * 100;
                
                content += `
                    <p><strong>理想气体定律:</strong> PV = nRT</p>
                    <p><strong>计算压强:</strong> ${(idealPressure / 1000).toFixed(1)} kPa</p>
                    <p><strong>实际压强:</strong> ${(this.pressure / 1000).toFixed(1)} kPa</p>
                    <p><strong>符合度:</strong> ${ratio.toFixed(1)}%</p>
                    <p><strong>分子动能:</strong> ∝ T</p>
                `;
                break;
                
            case 'heat-transfer':
                content += `
                    <p><strong>傅里叶定律:</strong> q = -k∇T</p>
                    <p><strong>热传导:</strong>从高温到低温</p>
                    <p><strong>导热系数:</strong>材料特性</p>
                    <p><strong>应用:</strong>散热器、保温材料</p>
                `;
                break;
                
            case 'phase-changes':
                content += `
                    <p><strong>相变条件:</strong></p>
                    <p>• 固→液：熔点 (0°C, 1atm)</p>
                    <p>• 液→气：沸点 (100°C, 1atm)</p>
                    <p><strong>相图:</strong>P-T关系</p>
                    <p><strong>潜热:</strong>相变能量</p>
                `;
                break;
                
            case 'entropy':
                content += `
                    <p><strong>熵增原理:</strong> ΔS ≥ 0</p>
                    <p><strong>玻尔兹曼公式:</strong> S = k ln Ω</p>
                    <p><strong>无序度:</strong>系统混乱程度</p>
                    <p><strong>热力学第二定律</strong></p>
                `;
                break;
        }
        
        infoElement.innerHTML = content;
    }
}

// 初始化热力学模拟器
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.physicsSimulator) {
            window.thermodynamicsSimulator = new ThermodynamicsSimulator();
        }
    }, 100);
}); 