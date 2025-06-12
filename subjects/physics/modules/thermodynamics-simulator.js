/**
 * 热力学模拟器模块
 */
class ThermodynamicsSimulator {
    constructor(physicsSimulator) {
        this.physicsSimulator = physicsSimulator;
        this.particles = [];
        this.isRunning = false;
        this.animationId = null;
        this.simulationType = 'gas-particles';
        // 热传导网格
        this.temperatureGrid = [];
        // 相变系统
        this.phaseState = {
            state: 'solid',  // solid, liquid, gas
            temperature: 250,
            particles: []
        };
        // 卡诺循环
        this.carnotState = {
            stage: 0, // 0-3代表循环的四个阶段
            pressure: 1.0,
            volume: 1.0,
            temperature: 300,
            work: 0,
            heat: 0,
            efficiency: 0
        };
        
        this.init();
    }

    init() {
        this.setupControls();
        this.setupGasParticles();
        this.initializeTemperatureGrid();
    }

    setupControls() {
        const startBtn = document.getElementById('start-thermo');
        const resetBtn = document.getElementById('reset-thermo');
        const pauseBtn = document.getElementById('pause-thermo');
        const typeSelect = document.getElementById('thermo-type');

        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.switchSimulationType(e.target.value);
            });
        }

        if (document.getElementById('gas-temperature')) {
            document.getElementById('gas-temperature').addEventListener('input', (e) => {
                document.getElementById('temperature-value').textContent = e.target.value;
                this.updateParticleVelocities(parseFloat(e.target.value));
            });
        }

        if (document.getElementById('gas-pressure')) {
            document.getElementById('gas-pressure').addEventListener('input', (e) => {
                document.getElementById('pressure-value').textContent = e.target.value;
            });
        }

        if (document.getElementById('gas-volume')) {
            document.getElementById('gas-volume').addEventListener('input', (e) => {
                document.getElementById('gas-volume-value').textContent = e.target.value;
            });
        }

        // 热传导控制
        if (document.getElementById('heat-source-temp')) {
            document.getElementById('heat-source-temp').addEventListener('input', (e) => {
                document.getElementById('heat-source-temp-value').textContent = e.target.value;
                if (this.simulationType === 'heat-conduction') {
                    this.updateHeatSource(parseFloat(e.target.value));
                }
            });
        }

        if (document.getElementById('cold-source-temp')) {
            document.getElementById('cold-source-temp').addEventListener('input', (e) => {
                document.getElementById('cold-source-temp-value').textContent = e.target.value;
                if (this.simulationType === 'heat-conduction') {
                    this.updateColdSource(parseFloat(e.target.value));
                }
            });
        }

        // 相变控制
        if (document.getElementById('initial-temp')) {
            document.getElementById('initial-temp').addEventListener('input', (e) => {
                document.getElementById('initial-temp-value').textContent = e.target.value;
                if (this.simulationType === 'phase-transition') {
                    this.phaseState.temperature = parseFloat(e.target.value);
                }
            });
        }

        if (document.getElementById('heating-power')) {
            document.getElementById('heating-power').addEventListener('input', (e) => {
                document.getElementById('heating-power-value').textContent = e.target.value;
            });
        }

        // 卡诺循环控制
        if (document.getElementById('hot-reservoir')) {
            document.getElementById('hot-reservoir').addEventListener('input', (e) => {
                document.getElementById('hot-reservoir-value').textContent = e.target.value;
                if (this.simulationType === 'carnot-cycle') {
                    this.carnotState.hotTemp = parseFloat(e.target.value);
                }
            });
        }

        if (document.getElementById('cold-reservoir')) {
            document.getElementById('cold-reservoir').addEventListener('input', (e) => {
                document.getElementById('cold-reservoir-value').textContent = e.target.value;
                if (this.simulationType === 'carnot-cycle') {
                    this.carnotState.coldTemp = parseFloat(e.target.value);
                }
            });
        }

        if (startBtn) startBtn.addEventListener('click', () => this.startThermodynamicsSimulation());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetThermodynamicsSimulation());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseThermodynamicsSimulation());
    }

    setupGasParticles() {
        const canvas = this.physicsSimulator.canvases.thermo;
        if (!canvas) return;

        this.particles = [];
        const numParticles = 50;

        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * (canvas.width - 40) + 20,
                y: Math.random() * (canvas.height - 40) + 20,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: 4,
                mass: 1,
                color: this.getParticleColor()
            });
        }
    }

    getParticleColor() {
        const colors = ['#ff6b35', '#4361ee', '#06ffa5', '#ffbe0b', '#8338ec'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateParticleVelocities(temperature) {
        const tempFactor = temperature / 300; // 基准温度300K
        this.particles.forEach(particle => {
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            const newSpeed = Math.sqrt(tempFactor) * 3;
            const angle = Math.atan2(particle.vy, particle.vx);
            particle.vx = newSpeed * Math.cos(angle);
            particle.vy = newSpeed * Math.sin(angle);
        });
    }

    switchSimulationType(type) {
        this.simulationType = type;
        this.resetThermodynamicsSimulation();
        
        // 根据模拟类型准备相应的系统
        if (type === 'gas-particles') {
            this.setupGasParticles();
        } else if (type === 'heat-conduction') {
            this.initializeTemperatureGrid();
        } else if (type === 'phase-transition') {
            this.initializePhaseSystem();
        } else if (type === 'carnot-cycle') {
            this.initializeCarnotCycle();
        }
    }

    initializeTemperatureGrid() {
        const canvas = this.physicsSimulator.canvases.thermo;
        if (!canvas) return;

        // 创建温度网格 - 20x20网格
        this.temperatureGrid = [];
        const gridSize = 20;
        const rows = Math.floor((canvas.height - 40) / gridSize);
        const cols = Math.floor((canvas.width - 40) / gridSize);

        // 初始化为中等温度
        for (let i = 0; i < rows; i++) {
            this.temperatureGrid[i] = [];
            for (let j = 0; j < cols; j++) {
                this.temperatureGrid[i][j] = 250; // 默认中等温度
            }
        }

        // 设置热源和冷源
        const hotTemp = parseFloat(document.getElementById('heat-source-temp').value);
        const coldTemp = parseFloat(document.getElementById('cold-source-temp').value);

        // 左侧热源
        for (let i = 0; i < rows; i++) {
            this.temperatureGrid[i][0] = hotTemp;
        }

        // 右侧冷源
        for (let i = 0; i < rows; i++) {
            this.temperatureGrid[i][cols-1] = coldTemp;
        }
    }

    updateHeatSource(temp) {
        if (!this.temperatureGrid.length) return;
        
        // 更新左侧热源温度
        for (let i = 0; i < this.temperatureGrid.length; i++) {
            this.temperatureGrid[i][0] = temp;
        }
    }

    updateColdSource(temp) {
        if (!this.temperatureGrid.length) return;
        
        // 更新右侧冷源温度
        for (let i = 0; i < this.temperatureGrid.length; i++) {
            this.temperatureGrid[i][this.temperatureGrid[0].length-1] = temp;
        }
    }

    simulateHeatConduction() {
        const canvas = this.physicsSimulator.canvases.thermo;
        const ctx = this.physicsSimulator.contexts.thermo;
        if (!canvas || !ctx) return;

        // 绘制网格
        const gridSize = 20;
        const rows = this.temperatureGrid.length;
        const cols = this.temperatureGrid[0].length;

        // 热传导物理计算
        const newGrid = JSON.parse(JSON.stringify(this.temperatureGrid));
        const conductivity = 0.1; // 热传导系数

        for (let i = 1; i < rows - 1; i++) {
            for (let j = 1; j < cols - 1; j++) {
                // 四个相邻单元的平均温度影响
                const avgTemp = (
                    this.temperatureGrid[i-1][j] + 
                    this.temperatureGrid[i+1][j] + 
                    this.temperatureGrid[i][j-1] + 
                    this.temperatureGrid[i][j+1]
                ) / 4;
                
                // 温度变化
                newGrid[i][j] = this.temperatureGrid[i][j] + conductivity * (avgTemp - this.temperatureGrid[i][j]);
            }
        }

        this.temperatureGrid = newGrid;

        // 绘制热图
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = 20 + j * gridSize;
                const y = 20 + i * gridSize;
                
                // 温度到颜色的映射
                const minTemp = parseFloat(document.getElementById('cold-source-temp').value);
                const maxTemp = parseFloat(document.getElementById('heat-source-temp').value);
                const normTemp = (this.temperatureGrid[i][j] - minTemp) / (maxTemp - minTemp);
                
                // 颜色从蓝(冷)到红(热)
                const hue = 240 - normTemp * 240;
                ctx.fillStyle = `hsl(${hue}, 90%, 50%)`;
                ctx.fillRect(x, y, gridSize, gridSize);
                
                // 添加温度值文本（每3个格子显示一次）
                if (i % 3 === 0 && j % 3 === 0) {
                    ctx.fillStyle = 'white';
                    ctx.font = '8px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(Math.round(this.temperatureGrid[i][j]), x + gridSize/2, y + gridSize/2 + 3);
                }
            }
        }

        // 绘制边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, cols * gridSize, rows * gridSize);

        // 添加图例
        this.drawTemperatureLegend(ctx, canvas, minTemp, maxTemp);

        // 计算热流和温度梯度
        this.calculateHeatFlow(ctx, canvas, rows, cols, gridSize);

        // 更新热传导信息
        document.getElementById('thermo-info').innerHTML = `
            <strong>热传导分析:</strong><br>
            热源温度: ${document.getElementById('heat-source-temp').value} K<br>
            冷源温度: ${document.getElementById('cold-source-temp').value} K<br>
            温度梯度: ${((maxTemp - minTemp) / cols).toFixed(2)} K/格<br>
            <strong>能量传递:</strong><br>
            热传导系数: ${conductivity}<br>
            傅里叶定律: q = -k ∇T<br>
            <strong>应用分析:</strong><br>
            绝缘体: 低热传导率<br>
            导体: 高热传导率<br>
            热传导是从高温区域到低温区域
        `;
    }

    drawTemperatureLegend(ctx, canvas, minTemp, maxTemp) {
        const legendWidth = 30;
        const legendHeight = 200;
        const x = canvas.width - 60;
        const y = (canvas.height - legendHeight) / 2;

        // 绘制温度梯变
        const gradient = ctx.createLinearGradient(x, y + legendHeight, x, y);
        gradient.addColorStop(0, 'hsl(240, 90%, 50%)'); // 冷色
        gradient.addColorStop(1, 'hsl(0, 90%, 50%)');   // 热色
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, legendWidth, legendHeight);
        
        // 边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, legendWidth, legendHeight);
        
        // 标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(maxTemp)}K`, x + legendWidth + 5, y + 10);
        ctx.fillText(`${Math.round(minTemp)}K`, x + legendWidth + 5, y + legendHeight - 5);
        ctx.textAlign = 'center';
        ctx.fillText('温度', x + legendWidth/2, y - 10);
    }

    calculateHeatFlow(ctx, canvas, rows, cols, gridSize) {
        // 绘制热流方向箭头
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1;
        
        for (let i = 2; i < rows - 2; i += 3) {
            for (let j = 2; j < cols - 2; j += 3) {
                // 计算温度梯度
                const gradX = (this.temperatureGrid[i][j+1] - this.temperatureGrid[i][j-1]) / 2;
                const gradY = (this.temperatureGrid[i+1][j] - this.temperatureGrid[i-1][j]) / 2;
                
                // 热流方向与温度梯度相反
                const flowX = -gradX;
                const flowY = -gradY;
                
                // 热流大小
                const magnitude = Math.sqrt(flowX * flowX + flowY * flowY);
                if (magnitude > 1) {
                    // 归一化并缩放
                    const scale = 10;
                    const normX = (flowX / magnitude) * scale;
                    const normY = (flowY / magnitude) * scale;
                    
                    const x = 20 + j * gridSize + gridSize/2;
                    const y = 20 + i * gridSize + gridSize/2;
                    
                    // 绘制箭头
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + normX, y + normY);
                    ctx.stroke();
                    
                    // 绘制箭头头部
                    const angle = Math.atan2(normY, normX);
                    const headLen = 4;
                    ctx.beginPath();
                    ctx.moveTo(x + normX, y + normY);
                    ctx.lineTo(x + normX - headLen * Math.cos(angle - Math.PI/6), y + normY - headLen * Math.sin(angle - Math.PI/6));
                    ctx.moveTo(x + normX, y + normY);
                    ctx.lineTo(x + normX - headLen * Math.cos(angle + Math.PI/6), y + normY - headLen * Math.sin(angle + Math.PI/6));
                    ctx.stroke();
                }
            }
        }
    }

    startThermodynamicsSimulation() {
        this.isRunning = true;
        this.simulateThermodynamics();
    }

    simulateThermodynamics() {
        const canvas = this.physicsSimulator.canvases.thermo;
        const ctx = this.physicsSimulator.contexts.thermo;

        const animate = () => {
            if (!this.isRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 根据选择的模拟类型执行相应的模拟
            if (this.simulationType === 'gas-particles') {
                // 绘制容器
                this.drawContainer(ctx, canvas);

                // 更新和绘制粒子
                this.updateParticles(canvas);
                this.drawParticles(ctx);

                // 计算和显示热力学数据
                this.updateThermodynamicsInfo();

                // 绘制速度分布图
                this.drawVelocityDistribution(ctx, canvas);

                // 绘制温度可视化
                this.drawTemperatureVisualization(ctx, canvas);
            } 
            else if (this.simulationType === 'heat-conduction') {
                this.simulateHeatConduction();
            } 
            else if (this.simulationType === 'phase-transition') {
                this.simulatePhaseTransition(ctx, canvas);
            } 
            else if (this.simulationType === 'carnot-cycle') {
                this.simulateCarnotCycle(ctx, canvas);
            }

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    drawContainer(ctx, canvas) {
        // 绘制气体容器
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(20, 20, canvas.width - 40, canvas.height - 40);
        ctx.stroke();

        // 绘制活塞（如果适用）
        const volume = parseFloat(document.getElementById('gas-volume').value);
        const containerHeight = (canvas.height - 40) * volume / 3; // 最大体积为3L
        
        ctx.fillStyle = 'rgba(102, 102, 102, 0.3)';
        ctx.fillRect(20, 20 + (canvas.height - 40) - containerHeight, canvas.width - 40, containerHeight);
        
        // 活塞
        ctx.fillStyle = '#666';
        ctx.fillRect(20, 20 + (canvas.height - 40) - containerHeight, canvas.width - 40, 5);
    }

    updateParticles(canvas) {
        const volume = parseFloat(document.getElementById('gas-volume').value);
        const containerHeight = (canvas.height - 40) * volume / 3;
        const containerBottom = 20 + (canvas.height - 40) - containerHeight;

        this.particles.forEach(particle => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;

            // 碰撞检测 - 容器壁
            if (particle.x <= 20 + particle.radius || particle.x >= canvas.width - 20 - particle.radius) {
                particle.vx = -particle.vx;
                particle.x = Math.max(20 + particle.radius, Math.min(canvas.width - 20 - particle.radius, particle.x));
            }

            if (particle.y <= containerBottom + particle.radius || particle.y >= canvas.height - 20 - particle.radius) {
                particle.vy = -particle.vy;
                particle.y = Math.max(containerBottom + particle.radius, Math.min(canvas.height - 20 - particle.radius, particle.y));
            }

            // 粒子间碰撞（简化）
            this.particles.forEach(other => {
                if (particle !== other) {
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < particle.radius + other.radius) {
                        // 简单弹性碰撞
                        const angle = Math.atan2(dy, dx);
                        const sin = Math.sin(angle);
                        const cos = Math.cos(angle);
                        
                        // 交换速度分量
                        const v1 = particle.vx * cos + particle.vy * sin;
                        const v2 = other.vx * cos + other.vy * sin;
                        
                        particle.vx = v2 * cos - particle.vy * sin;
                        particle.vy = v2 * sin + particle.vy * cos;
                        other.vx = v1 * cos - other.vy * sin;
                        other.vy = v1 * sin + other.vy * cos;
                        
                        // 分离粒子
                        const overlap = particle.radius + other.radius - distance;
                        particle.x += overlap * 0.5 * cos;
                        particle.y += overlap * 0.5 * sin;
                        other.x -= overlap * 0.5 * cos;
                        other.y -= overlap * 0.5 * sin;
                    }
                }
            });
        });
    }

    drawParticles(ctx) {
        this.particles.forEach(particle => {
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            const intensity = Math.min(speed / 8, 1);
            
            // 根据速度调整颜色亮度
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = 0.7 + intensity * 0.3;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
            ctx.fill();
            
            // 速度矢量（可选）
            if (speed > 2) {
                ctx.strokeStyle = particle.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particle.x + particle.vx * 3, particle.y + particle.vy * 3);
                ctx.stroke();
            }
        });
        ctx.globalAlpha = 1;
    }

    updateThermodynamicsInfo() {
        const temperature = parseFloat(document.getElementById('gas-temperature').value);
        const pressure = parseFloat(document.getElementById('gas-pressure').value);
        const volume = parseFloat(document.getElementById('gas-volume').value);
        
        // 计算平均动能
        let totalKineticEnergy = 0;
        this.particles.forEach(particle => {
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            totalKineticEnergy += 0.5 * particle.mass * speed * speed;
        });
        const avgKineticEnergy = totalKineticEnergy / this.particles.length;
        
        // 理想气体定律计算
        const R = 8.314; // 气体常数
        const n = 0.1; // 摩尔数（假设）
        const theoreticalPressure = (n * R * temperature) / volume;
        
        document.getElementById('thermo-info').innerHTML = `
            <strong>热力学状态:</strong><br>
            温度: ${temperature} K<br>
            压强: ${pressure.toFixed(2)} atm<br>
            体积: ${volume.toFixed(1)} L<br>
            <strong>微观分析:</strong><br>
            粒子数: ${this.particles.length}<br>
            平均动能: ${avgKineticEnergy.toFixed(3)} 单位<br>
            <strong>理想气体定律:</strong><br>
            PV = nRT<br>
            理论压强: ${theoreticalPressure.toFixed(2)} atm<br>
            <strong>热力学过程:</strong><br>
            等温过程: T = 常数<br>
            等压过程: P = 常数<br>
            等容过程: V = 常数<br>
            绝热过程: PVᵧ = 常数
        `;

        // 更新显示元素
        document.getElementById('avg-kinetic').textContent = avgKineticEnergy.toFixed(3);
        document.getElementById('volume').textContent = volume.toFixed(1) + ' L';
    }

    drawVelocityDistribution(ctx, canvas) {
        const histogramX = canvas.width - 180;
        const histogramY = 20;
        const histogramWidth = 150;
        const histogramHeight = 120;

        // 背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(histogramX, histogramY, histogramWidth, histogramHeight);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(histogramX, histogramY, histogramWidth, histogramHeight);

        // 速度直方图
        const speeds = this.particles.map(p => Math.sqrt(p.vx * p.vx + p.vy * p.vy));
        const maxSpeed = Math.max(...speeds);
        const bins = 10;
        const binSize = maxSpeed / bins;
        const histogram = new Array(bins).fill(0);

        speeds.forEach(speed => {
            const binIndex = Math.min(Math.floor(speed / binSize), bins - 1);
            histogram[binIndex]++;
        });

        const maxCount = Math.max(...histogram);
        ctx.fillStyle = '#4361ee';

        histogram.forEach((count, i) => {
            const barHeight = (count / maxCount) * (histogramHeight - 40);
            const barWidth = (histogramWidth - 20) / bins;
            const x = histogramX + 10 + i * barWidth;
            const y = histogramY + histogramHeight - 20 - barHeight;
            
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });

        // 标签
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('速度分布', histogramX + histogramWidth / 2, histogramY + 15);
    }

    drawTemperatureVisualization(ctx, canvas) {
        // 温度热图
        const temperature = parseFloat(document.getElementById('gas-temperature').value);
        const heatmapSize = 20;
        
        for (let x = 20; x < canvas.width - 20; x += heatmapSize) {
            for (let y = 20; y < canvas.height - 20; y += heatmapSize) {
                // 计算该区域的平均粒子密度和速度
                let localEnergy = 0;
                let particleCount = 0;
                
                this.particles.forEach(particle => {
                    const dx = particle.x - (x + heatmapSize / 2);
                    const dy = particle.y - (y + heatmapSize / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < heatmapSize) {
                        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                        localEnergy += speed * speed;
                        particleCount++;
                    }
                });
                
                if (particleCount > 0) {
                    const avgEnergy = localEnergy / particleCount;
                    const intensity = Math.min(avgEnergy / 20, 1);
                    const hue = 240 - intensity * 240; // 蓝到红
                    
                    ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.2)`;
                    ctx.fillRect(x, y, heatmapSize, heatmapSize);
                }
            }
        }
    }

    resetThermodynamicsSimulation() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.physicsSimulator.contexts.thermo.clearRect(
            0, 0, 
            this.physicsSimulator.canvases.thermo.width, 
            this.physicsSimulator.canvases.thermo.height
        );
        
        // 根据当前的模拟类型重置相应的系统
        if (this.simulationType === 'gas-particles') {
            this.setupGasParticles();
            document.getElementById('thermo-info').innerHTML = '平均动能: <span id="avg-kinetic">--</span><br>体积: <span id="volume">--</span>';
        } else if (this.simulationType === 'heat-conduction') {
            this.initializeTemperatureGrid();
        } else if (this.simulationType === 'phase-transition') {
            this.initializePhaseSystem();
        } else if (this.simulationType === 'carnot-cycle') {
            this.initializeCarnotCycle();
        }
    }

    pauseThermodynamicsSimulation() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.simulateThermodynamics();
        }
    }

    initializePhaseSystem() {
        const canvas = this.physicsSimulator.canvases.thermo;
        if (!canvas) return;

        // 初始化相变状态
        this.phaseState = {
            state: 'solid',  // solid, liquid, gas
            temperature: parseFloat(document.getElementById('initial-temp').value),
            particles: [],
            timeElapsed: 0,
            totalEnergy: 0,
            phase: 'heating' // heating, melting, boiling, cooling
        };

        // 创建物质粒子
        const numParticles = 100;
        const particleSize = 5;
        const containerWidth = canvas.width - 150; // 留出右侧空间绘制图表
        const containerHeight = canvas.height - 100;

        // 创建排列整齐的固态粒子
        const rows = 10;
        const cols = 10;
        const spacing = Math.min(
            containerWidth / (cols + 2), 
            containerHeight / (rows + 2)
        );

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = (canvas.width - containerWidth) / 2 + spacing * (j + 1);
                const y = 50 + spacing * (i + 1);
                
                this.phaseState.particles.push({
                    x: x,
                    y: y,
                    originalX: x,
                    originalY: y,
                    vx: 0,
                    vy: 0,
                    radius: particleSize,
                    vibration: 0.2 // 初始振动幅度
                });
            }
        }
    }

    simulatePhaseTransition(ctx, canvas) {
        if (!canvas || !ctx) return;

        // 更新相变物理状态
        this.updatePhaseState();
        
        // 绘制背景和容器
        this.drawPhaseContainer(ctx, canvas);
        
        // 绘制粒子
        this.drawPhaseParticles(ctx);
        
        // 绘制温度和相变图表
        this.drawPhaseChart(ctx, canvas);
        
        // 更新相变信息
        this.updatePhaseInfo();
    }

    updatePhaseState() {
        const heatingPower = parseFloat(document.getElementById('heating-power').value);
        const dt = 0.02;
        
        // 更新模拟时间
        this.phaseState.timeElapsed += dt;
        
        // 相变的关键温度（开尔文）
        const meltingPoint = 273;
        const boilingPoint = 373;
        
        // 比热容（不同相态不同）
        let specificHeat;
        if (this.phaseState.state === 'solid') {
            specificHeat = 2; // 固态比热
        } else if (this.phaseState.state === 'liquid') {
            specificHeat = 4; // 液态比热
        } else {
            specificHeat = 2; // 气态比热
        }
        
        // 潜热
        const meltingLatentHeat = 100;
        const boilingLatentHeat = 200;
        
        // 能量增加
        this.phaseState.totalEnergy += heatingPower * dt;
        
        // 更新温度和相态（考虑相变过程中温度不变）
        if (this.phaseState.state === 'solid' && this.phaseState.temperature < meltingPoint) {
            // 固体加热
            this.phaseState.temperature += (heatingPower * dt) / specificHeat;
            this.phaseState.phase = 'heating';
            
            // 达到熔点
            if (this.phaseState.temperature >= meltingPoint) {
                this.phaseState.temperature = meltingPoint;
                this.phaseState.phase = 'melting';
            }
        }
        else if (this.phaseState.state === 'solid' && this.phaseState.temperature >= meltingPoint) {
            // 融化过程
            this.phaseState.phase = 'melting';
            
            // 计算已经吸收的融化潜热
            const meltingEnergyNeeded = meltingLatentHeat;
            const currentMeltingEnergy = this.phaseState.totalEnergy - (meltingPoint * specificHeat);
            
            // 熔化进度
            const meltingProgress = Math.min(1, currentMeltingEnergy / meltingEnergyNeeded);
            
            // 如果完全熔化
            if (meltingProgress >= 1) {
                this.phaseState.state = 'liquid';
                this.phaseState.phase = 'heating';
            }
            
            // 更新粒子的振动和运动，表示熔化进度
            this.updateParticlesForMelting(meltingProgress);
        }
        else if (this.phaseState.state === 'liquid' && this.phaseState.temperature < boilingPoint) {
            // 液体加热
            this.phaseState.temperature += (heatingPower * dt) / specificHeat;
            this.phaseState.phase = 'heating';
            
            // 达到沸点
            if (this.phaseState.temperature >= boilingPoint) {
                this.phaseState.temperature = boilingPoint;
                this.phaseState.phase = 'boiling';
            }
            
            // 更新液体粒子运动
            this.updateLiquidParticles();
        }
        else if (this.phaseState.state === 'liquid' && this.phaseState.temperature >= boilingPoint) {
            // 沸腾过程
            this.phaseState.phase = 'boiling';
            
            // 计算已经吸收的汽化潜热
            const boilingEnergyNeeded = boilingLatentHeat;
            const currentBoilingEnergy = this.phaseState.totalEnergy - (meltingPoint * specificHeat) 
                                        - meltingLatentHeat - ((boilingPoint - meltingPoint) * specificHeat);
            
            // 汽化进度
            const boilingProgress = Math.min(1, currentBoilingEnergy / boilingEnergyNeeded);
            
            // 如果完全汽化
            if (boilingProgress >= 1) {
                this.phaseState.state = 'gas';
                this.phaseState.phase = 'heating';
            }
            
            // 更新粒子状态，表示沸腾进度
            this.updateParticlesForBoiling(boilingProgress);
        }
        else if (this.phaseState.state === 'gas') {
            // 气体继续加热
            this.phaseState.temperature += (heatingPower * dt) / specificHeat;
            this.phaseState.phase = 'heating';
            
            // 限制最高温度
            if (this.phaseState.temperature > 500) {
                this.phaseState.temperature = 500;
            }
            
            // 更新气体粒子运动
            this.updateGasParticles();
        }
    }

    updateParticlesForMelting(progress) {
        this.phaseState.particles.forEach(particle => {
            // 随着熔化的进行，粒子振动幅度增加，逐渐离开原位
            const maxVibration = 3 + progress * 10;
            const randomMovement = progress * 15;
            
            // 振动和随机运动的混合
            particle.x = particle.originalX + (Math.random() - 0.5) * maxVibration + (Math.random() - 0.5) * randomMovement * progress;
            particle.y = particle.originalY + (Math.random() - 0.5) * maxVibration + (Math.random() - 0.5) * randomMovement * progress;
            
            // 粒子速度也随着熔化进行而增加
            particle.vx = (Math.random() - 0.5) * progress * 2;
            particle.vy = (Math.random() - 0.5) * progress * 2;
            
            // 粒子振动属性更新
            particle.vibration = 0.2 + progress * 1.5;
        });
    }

    updateLiquidParticles() {
        const canvas = this.physicsSimulator.canvases.thermo;
        const containerWidth = canvas.width - 150;
        const containerHeight = canvas.height - 100;
        
        this.phaseState.particles.forEach(particle => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 添加随机运动
            particle.vx += (Math.random() - 0.5) * 0.4;
            particle.vy += (Math.random() - 0.5) * 0.4;
            
            // 阻尼
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            
            // 添加重力效应
            particle.vy += 0.05;
            
            // 边界碰撞
            if (particle.x < (canvas.width - containerWidth) / 2 + particle.radius) {
                particle.x = (canvas.width - containerWidth) / 2 + particle.radius;
                particle.vx = Math.abs(particle.vx);
            }
            if (particle.x > (canvas.width - containerWidth) / 2 + containerWidth - particle.radius) {
                particle.x = (canvas.width - containerWidth) / 2 + containerWidth - particle.radius;
                particle.vx = -Math.abs(particle.vx);
            }
            if (particle.y < 50 + particle.radius) {
                particle.y = 50 + particle.radius;
                particle.vy = Math.abs(particle.vy);
            }
            if (particle.y > 50 + containerHeight - particle.radius) {
                particle.y = 50 + containerHeight - particle.radius;
                particle.vy = -Math.abs(particle.vy) * 0.8; // 一些能量损失
            }
        });
    }

    updateParticlesForBoiling(progress) {
        const canvas = this.physicsSimulator.canvases.thermo;
        const containerWidth = canvas.width - 150;
        const containerHeight = canvas.height - 100;
        
        this.phaseState.particles.forEach((particle, index) => {
            // 随机选择一些粒子进行"汽化"
            if (Math.random() < 0.01 * progress && particle.y > 50 + containerHeight/2) {
                // 增加向上的速度，模拟汽泡效应
                particle.vy -= 2 * Math.random();
            }
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 增加随机运动
            particle.vx += (Math.random() - 0.5) * (0.5 + progress);
            particle.vy += (Math.random() - 0.5) * (0.5 + progress);
            
            // 阻尼减小（气体的阻尼比液体小）
            const damping = 0.95 - progress * 0.1;
            particle.vx *= damping;
            particle.vy *= damping;
            
            // 随着进度增加，减少重力影响
            const gravity = 0.05 * (1 - progress * 0.9);
            particle.vy += gravity;
            
            // 边界碰撞
            if (particle.x < (canvas.width - containerWidth) / 2 + particle.radius) {
                particle.x = (canvas.width - containerWidth) / 2 + particle.radius;
                particle.vx = Math.abs(particle.vx);
            }
            if (particle.x > (canvas.width - containerWidth) / 2 + containerWidth - particle.radius) {
                particle.x = (canvas.width - containerWidth) / 2 + containerWidth - particle.radius;
                particle.vx = -Math.abs(particle.vx);
            }
            if (particle.y < 50 + particle.radius) {
                particle.y = 50 + particle.radius;
                particle.vy = Math.abs(particle.vy);
            }
            if (particle.y > 50 + containerHeight - particle.radius) {
                particle.y = 50 + containerHeight - particle.radius;
                particle.vy = -Math.abs(particle.vy) * (0.8 - progress * 0.3); // 反弹系数随进度减小
            }
        });
    }

    updateGasParticles() {
        const canvas = this.physicsSimulator.canvases.thermo;
        const containerWidth = canvas.width - 150;
        const containerHeight = canvas.height - 100;
        
        this.phaseState.particles.forEach(particle => {
            // 气体粒子运动更加剧烈
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 随机运动
            particle.vx += (Math.random() - 0.5) * 0.8;
            particle.vy += (Math.random() - 0.5) * 0.8;
            
            // 气体的阻尼更小
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // 几乎没有重力影响
            particle.vy += 0.01;
            
            // 边界碰撞 - 完全弹性
            if (particle.x < (canvas.width - containerWidth) / 2 + particle.radius) {
                particle.x = (canvas.width - containerWidth) / 2 + particle.radius;
                particle.vx = Math.abs(particle.vx);
            }
            if (particle.x > (canvas.width - containerWidth) / 2 + containerWidth - particle.radius) {
                particle.x = (canvas.width - containerWidth) / 2 + containerWidth - particle.radius;
                particle.vx = -Math.abs(particle.vx);
            }
            if (particle.y < 50 + particle.radius) {
                particle.y = 50 + particle.radius;
                particle.vy = Math.abs(particle.vy);
            }
            if (particle.y > 50 + containerHeight - particle.radius) {
                particle.y = 50 + containerHeight - particle.radius;
                particle.vy = -Math.abs(particle.vy);
            }
        });
    }

    drawPhaseContainer(ctx, canvas) {
        const containerWidth = canvas.width - 150;
        const containerHeight = canvas.height - 100;
        
        // 绘制容器背景
        ctx.fillStyle = 'rgba(240, 240, 240, 0.6)';
        ctx.fillRect((canvas.width - containerWidth) / 2, 50, containerWidth, containerHeight);
        
        // 容器边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect((canvas.width - containerWidth) / 2, 50, containerWidth, containerHeight);
        
        // 添加温度计
        this.drawThermometer(ctx, canvas.width - 100, 100, 200, this.phaseState.temperature);
        
        // 添加加热器图示
        this.drawHeater(ctx, (canvas.width - containerWidth) / 2 + containerWidth / 2, 50 + containerHeight + 10);
    }

    drawThermometer(ctx, x, y, height, temperature) {
        const width = 20;
        const bulbRadius = 15;
        
        // 温度计玻璃管
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.fillRect(x - width/2, y, width, height);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - width/2, y, width, height);
        
        // 温度计底部圆球
        ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y + height, bulbRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // 计算水银高度
        const minTemp = 200;
        const maxTemp = 500;
        const mercuryHeight = Math.max(0, Math.min(1, (temperature - minTemp) / (maxTemp - minTemp))) * height;
        
        // 绘制水银柱
        const mercuryGradient = ctx.createLinearGradient(x - width/2, y + height - mercuryHeight, x + width/2, y + height - mercuryHeight);
        mercuryGradient.addColorStop(0, '#ff4444');
        mercuryGradient.addColorStop(0.5, '#ff0000');
        mercuryGradient.addColorStop(1, '#ff4444');
        
        ctx.fillStyle = mercuryGradient;
        ctx.fillRect(x - width/2 + 2, y + height - mercuryHeight, width - 4, mercuryHeight);
        
        // 温度计球体中的水银
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(x, y + height, bulbRadius - 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // 温度刻度
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        
        // 刻度线和标签
        for (let t = minTemp; t <= maxTemp; t += 50) {
            const lineY = y + height - ((t - minTemp) / (maxTemp - minTemp)) * height;
            
            // 刻度线
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - width/2 - 5, lineY);
            ctx.lineTo(x - width/2, lineY);
            ctx.stroke();
            
            // 温度标签
            ctx.fillText(`${t}K`, x - width/2 - 8, lineY + 3);
        }
        
        // 当前温度显示
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(temperature)}K`, x, y - 10);
    }

    drawHeater(ctx, x, y) {
        const heatingPower = parseFloat(document.getElementById('heating-power').value);
        const width = 100;
        const height = 20;
        
        // 绘制加热器底座
        ctx.fillStyle = '#555';
        ctx.fillRect(x - width/2, y, width, height);
        
        // 加热线圈
        const numCoils = 5;
        const coilSpacing = width / (numCoils + 1);
        
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 1; i <= numCoils; i++) {
            const coilX = x - width/2 + i * coilSpacing;
            ctx.moveTo(coilX, y);
            ctx.lineTo(coilX, y + height);
        }
        
        ctx.stroke();
        
        // 功率显示
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`加热功率: ${heatingPower}W`, x, y + height + 15);
        
        // 绘制表示功率的热辐射
        if (heatingPower > 0) {
            const numRays = Math.floor(heatingPower / 50) + 2;
            const maxLength = heatingPower / 10;
            
            ctx.strokeStyle = '#ff9900';
            ctx.lineWidth = 2;
            
            for (let i = 0; i < numRays; i++) {
                const rayX = x - width/2 + (i + 0.5) * (width / numRays);
                const rayLength = 5 + Math.random() * maxLength;
                
                ctx.beginPath();
                ctx.moveTo(rayX, y + height);
                ctx.lineTo(rayX, y + height + rayLength);
                ctx.stroke();
            }
        }
    }

    drawPhaseParticles(ctx) {
        this.phaseState.particles.forEach(particle => {
            // 确定粒子颜色，根据相态不同
            let color;
            if (this.phaseState.state === 'solid') {
                color = '#4361ee'; // 蓝色
            } else if (this.phaseState.state === 'liquid') {
                color = '#4cc9f0'; // 淡蓝色
            } else {
                color = '#a8dadc'; // 更淡的蓝色
            }
            
            // 如果处于相变过程，混合颜色
            if (this.phaseState.phase === 'melting') {
                color = this.lerpColor('#4361ee', '#4cc9f0', Math.random());
            } else if (this.phaseState.phase === 'boiling') {
                color = this.lerpColor('#4cc9f0', '#a8dadc', Math.random());
            }
            
            // 绘制粒子
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
            ctx.fill();
            
            // 粒子边框
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            // 沸腾阶段的气泡效果
            if (this.phaseState.phase === 'boiling' && Math.random() < 0.02) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                const bubbleSize = 2 + Math.random() * 4;
                const bubbleX = particle.x + (Math.random() - 0.5) * 5;
                const bubbleY = particle.y - 5 - Math.random() * 10;
                
                ctx.beginPath();
                ctx.arc(bubbleX, bubbleY, bubbleSize, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }

    lerpColor(a, b, amount) {
        const ah = parseInt(a.replace(/#/g, ''), 16);
        const ar = ah >> 16;
        const ag = ah >> 8 & 0xff;
        const ab = ah & 0xff;
        const bh = parseInt(b.replace(/#/g, ''), 16);
        const br = bh >> 16;
        const bg = bh >> 8 & 0xff;
        const bb = bh & 0xff;
        const rr = ar + amount * (br - ar);
        const rg = ag + amount * (bg - ag);
        const rb = ab + amount * (bb - ab);

        return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1)}`;
    }

    drawPhaseChart(ctx, canvas) {
        const chartWidth = 140;
        const chartHeight = 200;
        const chartX = canvas.width - chartWidth - 5;
        const chartY = 50;
        
        // 背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
        
        // 图表标题
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('温度-时间曲线', chartX + chartWidth/2, chartY - 5);
        
        // 坐标轴
        ctx.beginPath();
        ctx.moveTo(chartX + 30, chartY + 20);
        ctx.lineTo(chartX + 30, chartY + chartHeight - 20);
        ctx.lineTo(chartX + chartWidth - 10, chartY + chartHeight - 20);
        ctx.stroke();
        
        // 轴标签
        ctx.textAlign = 'right';
        ctx.fillText('温度(K)', chartX + 25, chartY + 10);
        ctx.textAlign = 'right';
        ctx.fillText('500', chartX + 25, chartY + 30);
        ctx.fillText('400', chartX + 25, chartY + 70);
        ctx.fillText('300', chartX + 25, chartY + 110);
        ctx.fillText('200', chartX + 25, chartY + 150);
        
        ctx.textAlign = 'center';
        ctx.fillText('时间(s)', chartX + chartWidth/2, chartY + chartHeight - 5);
        
        // 相变特殊点标记
        const meltingPoint = 273;
        const boilingPoint = 373;
        
        const tempToY = (temp) => {
            return chartY + 150 - (temp - 200) * (120 / 300);
        };
        
        // 绘制熔点和沸点水平线
        ctx.strokeStyle = '#ff6b6b';
        ctx.setLineDash([2, 2]);
        
        // 熔点线
        ctx.beginPath();
        ctx.moveTo(chartX + 30, tempToY(meltingPoint));
        ctx.lineTo(chartX + chartWidth - 10, tempToY(meltingPoint));
        ctx.stroke();
        
        // 沸点线
        ctx.beginPath();
        ctx.moveTo(chartX + 30, tempToY(boilingPoint));
        ctx.lineTo(chartX + chartWidth - 10, tempToY(boilingPoint));
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // 添加熔点和沸点标签
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('熔点', chartX + chartWidth - 35, tempToY(meltingPoint) - 5);
        ctx.fillText('沸点', chartX + chartWidth - 35, tempToY(boilingPoint) - 5);
        
        // 绘制温度曲线
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 2;
        
        // 理想相变曲线（考虑潜热）
        const maxTime = 20; // 假设20秒为满量程
        const timeToX = (t) => {
            return chartX + 30 + (t / maxTime) * (chartWidth - 40);
        };
        
        // 根据当前相态和温度绘制实际曲线
        ctx.beginPath();
        ctx.moveTo(chartX + 30, tempToY(this.phaseState.temperature));
        
        // 生成理想的温度-时间曲线
        const curvePoints = [];
        let t = 0;
        let temp = 200;
        let timeStep = 0.1;
        let currentState = 'solid';
        let totalTime = 0;
        
        while (t <= maxTime && totalTime < this.phaseState.timeElapsed) {
            if (currentState === 'solid' && temp < meltingPoint) {
                temp += 2 * timeStep; // 固体加热速率
            } else if (currentState === 'solid' && temp >= meltingPoint) {
                // 熔化平台
                t += 1 * timeStep; // 停留更长时间在熔点
                currentState = 'liquid';
            } else if (currentState === 'liquid' && temp < boilingPoint) {
                temp += 1 * timeStep; // 液体加热速率
            } else if (currentState === 'liquid' && temp >= boilingPoint) {
                // 沸腾平台
                t += 2 * timeStep; // 停留更长时间在沸点
                currentState = 'gas';
            } else if (currentState === 'gas') {
                temp += 1.5 * timeStep; // 气体加热速率
            }
            
            if (temp > 500) temp = 500; // 温度上限
            
            curvePoints.push({x: timeToX(t), y: tempToY(temp)});
            t += timeStep;
            totalTime += timeStep;
        }
        
        // 绘制理想曲线（虚线）
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        
        if (curvePoints.length > 0) {
            ctx.moveTo(chartX + 30, tempToY(200));
            curvePoints.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
        
        // 绘制实际温度曲线（实线）
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        
        ctx.moveTo(chartX + 30, tempToY(200));
        
        // 仅绘制到当前温度的线段
        const currentTimeX = timeToX(Math.min(this.phaseState.timeElapsed, maxTime));
        const currentTempY = tempToY(this.phaseState.temperature);
        
        for (let i = 0; i < curvePoints.length; i++) {
            if (curvePoints[i].x <= currentTimeX) {
                ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
            }
        }
        
        // 确保曲线连接到当前温度点
        ctx.lineTo(currentTimeX, currentTempY);
        ctx.stroke();
        
        // 标记当前温度点
        ctx.fillStyle = '#4361ee';
        ctx.beginPath();
        ctx.arc(currentTimeX, currentTempY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // 添加当前状态标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        let stateLabel;
        
        if (this.phaseState.state === 'solid') {
            stateLabel = '固态';
        } else if (this.phaseState.state === 'liquid') {
            stateLabel = '液态';
        } else {
            stateLabel = '气态';
        }
        
        // 如果在相变过程中
        if (this.phaseState.phase === 'melting') {
            stateLabel = '熔化中';
        } else if (this.phaseState.phase === 'boiling') {
            stateLabel = '沸腾中';
        }
        
        ctx.fillText(`当前状态: ${stateLabel}`, chartX + chartWidth/2, chartY + chartHeight + 15);
    }

    updatePhaseInfo() {
        // 相变关键温度
        const meltingPoint = 273; // K
        const boilingPoint = 373; // K
        
        // 状态描述
        let stateDesc, phaseDesc;
        
        if (this.phaseState.state === 'solid') {
            stateDesc = '固态';
            if (this.phaseState.phase === 'melting') {
                phaseDesc = '熔化中（固态→液态）';
            } else {
                phaseDesc = '加热中';
            }
        } else if (this.phaseState.state === 'liquid') {
            stateDesc = '液态';
            if (this.phaseState.phase === 'boiling') {
                phaseDesc = '沸腾中（液态→气态）';
            } else {
                phaseDesc = '加热中';
            }
        } else {
            stateDesc = '气态';
            phaseDesc = '加热中';
        }
        
        // 更新信息面板
        document.getElementById('thermo-info').innerHTML = `
            <strong>相变分析:</strong><br>
            温度: ${Math.round(this.phaseState.temperature)} K<br>
            物质状态: ${stateDesc}<br>
            阶段: ${phaseDesc}<br>
            <strong>相变参数:</strong><br>
            熔点: ${meltingPoint} K<br>
            沸点: ${boilingPoint} K<br>
            加热功率: ${document.getElementById('heating-power').value} W<br>
            模拟时间: ${this.phaseState.timeElapsed.toFixed(1)} s<br>
            <strong>热力学过程:</strong><br>
            相变过程中温度不变<br>
            需要吸收或释放潜热<br>
            注意观察温度-时间曲线
        `;
    }

    initializeCarnotCycle() {
        // 初始化卡诺循环状态
        const hotTemp = parseFloat(document.getElementById('hot-reservoir').value);
        const coldTemp = parseFloat(document.getElementById('cold-reservoir').value);
        
        this.carnotState = {
            stage: 0, // 0-3代表循环的四个阶段
            pressure: 1.0,
            volume: 1.0,
            temperature: hotTemp,
            work: 0,
            heat: 0,
            efficiency: 1 - (coldTemp / hotTemp),
            progress: 0,
            totalTime: 0,
            // 循环各阶段的参数
            stages: [
                {p: 1.0, v: 1.0, t: hotTemp}, // 初始状态
                {p: 0.5, v: 2.0, t: hotTemp}, // 等温膨胀后
                {p: 0.25, v: 2.0, t: coldTemp}, // 绝热膨胀后
                {p: 0.5, v: 1.0, t: coldTemp}  // 等温压缩后
            ],
            hotTemp: hotTemp,
            coldTemp: coldTemp,
            cyclePoints: [],
            cycleCount: 0
        };
        
        // 生成PV图上的完整循环路径点
        this.generateCarnotCyclePath();
    }

    generateCarnotCyclePath() {
        const { hotTemp, coldTemp } = this.carnotState;
        this.carnotState.cyclePoints = [];
        
        // 阶段1: 等温膨胀 (热源, T1) - 状态0到状态1
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const v = 1.0 + t;
            const p = 1.0 / v;
            this.carnotState.cyclePoints.push({
                p: p,
                v: v,
                t: hotTemp,
                stage: 0,
                progress: t
            });
        }
        
        // 阶段2: 绝热膨胀 - 状态1到状态2
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const temp = hotTemp - t * (hotTemp - coldTemp);
            const v = 2.0;
            const p = 0.5 - t * 0.25;
            this.carnotState.cyclePoints.push({
                p: p,
                v: v,
                t: temp,
                stage: 1,
                progress: t
            });
        }
        
        // 阶段3: 等温压缩 (冷源, T2) - 状态2到状态3
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const v = 2.0 - t;
            const p = 0.25 + t * 0.25;
            this.carnotState.cyclePoints.push({
                p: p,
                v: v,
                t: coldTemp,
                stage: 2,
                progress: t
            });
        }
        
        // 阶段4: 绝热压缩 - 状态3到状态0
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const temp = coldTemp + t * (hotTemp - coldTemp);
            const v = 1.0;
            const p = 0.5 + t * 0.5;
            this.carnotState.cyclePoints.push({
                p: p,
                v: v,
                t: temp,
                stage: 3,
                progress: t
            });
        }
    }

    simulateCarnotCycle(ctx, canvas) {
        if (!canvas || !ctx) return;
        
        // 更新卡诺循环的物理状态
        this.updateCarnotState();
        
        // 绘制PV图
        this.drawPVDiagram(ctx, canvas);
        
        // 绘制卡诺循环活塞系统
        this.drawCarnotSystem(ctx, canvas);
        
        // 更新卡诺循环信息
        this.updateCarnotInfo();
    }

    updateCarnotState() {
        const dt = 0.02;
        this.carnotState.totalTime += dt;
        
        // 循环周期（完成一个循环的时间）
        const cyclePeriod = 10; // 每10秒完成一个循环
        
        // 计算循环进度 (0-1范围内)
        this.carnotState.progress = (this.carnotState.totalTime % cyclePeriod) / cyclePeriod;
        
        // 确定当前所处的阶段 (0-3)
        if (this.carnotState.progress < 0.25) {
            this.carnotState.stage = 0; // 等温膨胀
        } else if (this.carnotState.progress < 0.5) {
            this.carnotState.stage = 1; // 绝热膨胀
        } else if (this.carnotState.progress < 0.75) {
            this.carnotState.stage = 2; // 等温压缩
        } else {
            this.carnotState.stage = 3; // 绝热压缩
        }
        
        // 计算阶段内的进度 (0-1)
        const stageProgress = (this.carnotState.progress * 4) % 1;
        
        // 更新当前系统状态 (压力、体积、温度)
        const stageStartIdx = this.carnotState.stage * 20;
        const pointIdx = Math.min(
            stageStartIdx + Math.floor(stageProgress * 20),
            this.carnotState.cyclePoints.length - 1
        );
        
        const currentPoint = this.carnotState.cyclePoints[pointIdx];
        this.carnotState.pressure = currentPoint.p;
        this.carnotState.volume = currentPoint.v;
        this.carnotState.temperature = currentPoint.t;
        
        // 如果完成一个循环，增加计数
        if (this.carnotState.progress < 0.01 && this.carnotState.totalTime > 1) {
            this.carnotState.cycleCount++;
            
            // 计算每个循环的功和热量
            this.carnotState.work = this.carnotState.hotTemp * Math.log(2) - this.carnotState.coldTemp * Math.log(2);
            this.carnotState.heat = this.carnotState.hotTemp * Math.log(2);
            this.carnotState.efficiency = this.carnotState.work / this.carnotState.heat;
        }
    }

    drawPVDiagram(ctx, canvas) {
        const diagramWidth = 300;
        const diagramHeight = 250;
        const diagramX = 50;
        const diagramY = 50;
        
        // 背景
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(diagramX, diagramY, diagramWidth, diagramHeight);
        
        // 边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(diagramX, diagramY, diagramWidth, diagramHeight);
        
        // 标题
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('卡诺循环 P-V 图', diagramX + diagramWidth/2, diagramY - 10);
        
        // 坐标轴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(diagramX + 40, diagramY + diagramHeight - 40);
        ctx.lineTo(diagramX + diagramWidth - 20, diagramY + diagramHeight - 40); // x轴
        ctx.moveTo(diagramX + 40, diagramY + diagramHeight - 40);
        ctx.lineTo(diagramX + 40, diagramY + 20); // y轴
        ctx.stroke();
        
        // 轴标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('体积 (V)', diagramX + diagramWidth/2, diagramY + diagramHeight - 10);
        
        ctx.save();
        ctx.translate(diagramX + 15, diagramY + diagramHeight/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillText('压力 (P)', 0, 0);
        ctx.restore();
        
        // 体积刻度
        for (let v = 0.5; v <= 2.5; v += 0.5) {
            const x = diagramX + 40 + (v - 0.5) * 100;
            ctx.beginPath();
            ctx.moveTo(x, diagramY + diagramHeight - 40);
            ctx.lineTo(x, diagramY + diagramHeight - 35);
            ctx.stroke();
            ctx.fillText(v.toFixed(1), x, diagramY + diagramHeight - 25);
        }
        
        // 压力刻度
        for (let p = 0.25; p <= 1.25; p += 0.25) {
            const y = diagramY + diagramHeight - 40 - (p - 0.25) * 160;
            ctx.beginPath();
            ctx.moveTo(diagramX + 40, y);
            ctx.lineTo(diagramX + 35, y);
            ctx.stroke();
            ctx.textAlign = 'right';
            ctx.fillText(p.toFixed(2), diagramX + 30, y + 4);
        }
        
        // 等温线 (T1)
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        for (let v = 0.5; v <= 2.5; v += 0.1) {
            const p = 1.0 / v; // PV = nRT, T = 常数
            const x = diagramX + 40 + (v - 0.5) * 100;
            const y = diagramY + diagramHeight - 40 - (p - 0.25) * 160;
            if (v === 0.5) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // 等温线 (T2)
        ctx.strokeStyle = '#4cc9f0';
        ctx.beginPath();
        for (let v = 0.5; v <= 2.5; v += 0.1) {
            const p = (this.carnotState.coldTemp / this.carnotState.hotTemp) * (1.0 / v);
            const x = diagramX + 40 + (v - 0.5) * 100;
            const y = diagramY + diagramHeight - 40 - (p - 0.25) * 160;
            if (v === 0.5) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 绘制卡诺循环路径
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // 转换点坐标到图表坐标系
        const pointToCoords = (point) => {
            const x = diagramX + 40 + (point.v - 0.5) * 100;
            const y = diagramY + diagramHeight - 40 - (point.p - 0.25) * 160;
            return { x, y };
        };
        
        // 绘制循环路径
        const firstPoint = pointToCoords(this.carnotState.cyclePoints[0]);
        ctx.moveTo(firstPoint.x, firstPoint.y);
        
        this.carnotState.cyclePoints.forEach(point => {
            const { x, y } = pointToCoords(point);
            ctx.lineTo(x, y);
        });
        
        // 闭合路径
        ctx.closePath();
        ctx.stroke();
        
        // 标记四个关键状态点
        const statePoints = [0, 20, 40, 60].map(idx => pointToCoords(this.carnotState.cyclePoints[idx]));
        
        ctx.fillStyle = '#4361ee';
        statePoints.forEach((point, idx) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // 标记状态点
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText(idx, point.x, point.y - 10);
        });
        
        // 显示循环方向箭头
        const midPoints = [10, 30, 50, 70].map(idx => pointToCoords(this.carnotState.cyclePoints[idx]));
        
        ctx.strokeStyle = '#4361ee';
        ctx.fillStyle = '#4361ee';
        midPoints.forEach((point, idx) => {
            // 计算切线方向
            const nextIdx = (idx + 1) % 4;
            const dx = midPoints[nextIdx].x - point.x;
            const dy = midPoints[nextIdx].y - point.y;
            const angle = Math.atan2(dy, dx);
            
            // 绘制箭头
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(
                point.x + 10 * Math.cos(angle),
                point.y + 10 * Math.sin(angle)
            );
            ctx.stroke();
            
            // 箭头头部
            ctx.beginPath();
            ctx.moveTo(
                point.x + 10 * Math.cos(angle),
                point.y + 10 * Math.sin(angle)
            );
            ctx.lineTo(
                point.x + 7 * Math.cos(angle - Math.PI/4),
                point.y + 7 * Math.sin(angle - Math.PI/4)
            );
            ctx.lineTo(
                point.x + 7 * Math.cos(angle + Math.PI/4),
                point.y + 7 * Math.sin(angle + Math.PI/4)
            );
            ctx.closePath();
            ctx.fill();
        });
        
        // 标记当前位置
        const currentIdx = Math.floor(this.carnotState.progress * this.carnotState.cyclePoints.length);
        const currentPoint = pointToCoords(this.carnotState.cyclePoints[currentIdx]);
        
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(currentPoint.x, currentPoint.y, 7, 0, 2 * Math.PI);
        ctx.fill();
        
        // 图例
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('T₁ = ' + this.carnotState.hotTemp + 'K', diagramX + diagramWidth - 150, diagramY + 30);
        ctx.fillStyle = '#4cc9f0';
        ctx.fillText('T₂ = ' + this.carnotState.coldTemp + 'K', diagramX + diagramWidth - 150, diagramY + 50);
        
        // 标记循环阶段
        const stageDescriptions = [
            '1→2: 等温膨胀 (T₁)',
            '2→3: 绝热膨胀',
            '3→4: 等温压缩 (T₂)',
            '4→1: 绝热压缩'
        ];
        
        ctx.fillStyle = '#333';
        stageDescriptions.forEach((desc, idx) => {
            const isCurrentStage = idx === this.carnotState.stage;
            if (isCurrentStage) {
                ctx.fillStyle = '#ff6b35';
                ctx.font = 'bold 12px Arial';
            } else {
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
            }
            ctx.fillText(desc, diagramX + 60, diagramY + diagramHeight - 10 - (3 - idx) * 20);
        });
    }

    drawCarnotSystem(ctx, canvas) {
        const systemWidth = 300;
        const systemHeight = 220;
        const systemX = canvas.width - systemWidth - 50;
        const systemY = 60;
        
        // 背景
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(systemX, systemY, systemWidth, systemHeight);
        
        // 边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(systemX, systemY, systemWidth, systemHeight);
        
        // 标题
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('卡诺热机', systemX + systemWidth/2, systemY - 10);
        
        // 绘制气缸和活塞
        const cylinderWidth = 120;
        const maxCylinderHeight = 140;
        const cylinderX = systemX + 90;
        const cylinderY = systemY + 40;
        
        // 计算当前活塞位置（基于体积）
        const cylinderHeight = maxCylinderHeight * (this.carnotState.volume / 2);
        
        // 绘制气缸
        ctx.fillStyle = '#ddd';
        ctx.fillRect(cylinderX, cylinderY, cylinderWidth, cylinderHeight);
        
        // 气缸边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cylinderX, cylinderY);
        ctx.lineTo(cylinderX, cylinderY + cylinderHeight);
        ctx.lineTo(cylinderX + cylinderWidth, cylinderY + cylinderHeight);
        ctx.lineTo(cylinderX + cylinderWidth, cylinderY);
        ctx.stroke();
        
        // 绘制活塞
        const pistonHeight = 20;
        const pistonY = cylinderY + cylinderHeight;
        
        ctx.fillStyle = '#888';
        ctx.fillRect(cylinderX - 10, pistonY, cylinderWidth + 20, pistonHeight);
        ctx.strokeRect(cylinderX - 10, pistonY, cylinderWidth + 20, pistonHeight);
        
        // 连杆
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cylinderX + cylinderWidth/2, pistonY + pistonHeight);
        ctx.lineTo(cylinderX + cylinderWidth/2, pistonY + pistonHeight + 30);
        ctx.stroke();
        
        // 绘制飞轮
        const flywheelRadius = 30;
        const flywheelX = cylinderX + cylinderWidth/2;
        const flywheelY = pistonY + pistonHeight + 30 + flywheelRadius;
        
        // 飞轮
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(flywheelX, flywheelY, flywheelRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 飞轮标记
        const angle = this.carnotState.progress * 2 * Math.PI;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(
            flywheelX + flywheelRadius * 0.7 * Math.cos(angle),
            flywheelY + flywheelRadius * 0.7 * Math.sin(angle),
            5, 0, 2 * Math.PI
        );
        ctx.fill();
        ctx.stroke();
        
        // 绘制热源和冷源
        this.drawThermalReservoirs(ctx, cylinderX, cylinderY, cylinderWidth, cylinderHeight);
        
        // 显示当前状态
        this.drawCurrentState(ctx, systemX, systemY, systemWidth, systemHeight);
    }

    drawThermalReservoirs(ctx, cylinderX, cylinderY, cylinderWidth, cylinderHeight) {
        // 确定当前阶段
        const stage = this.carnotState.stage;
        
        // 热源 (在等温膨胀阶段接触)
        const hotSource = {
            x: cylinderX - 50,
            y: cylinderY + 20,
            width: 30,
            height: cylinderHeight - 40
        };
        
        // 冷源 (在等温压缩阶段接触)
        const coldSource = {
            x: cylinderX + cylinderWidth + 20,
            y: cylinderY + 20,
            width: 30,
            height: cylinderHeight - 40
        };
        
        // 绘制热源
        const hotGradient = ctx.createLinearGradient(
            hotSource.x, hotSource.y,
            hotSource.x + hotSource.width, hotSource.y
        );
        hotGradient.addColorStop(0, '#ff6b6b');
        hotGradient.addColorStop(1, '#ff9e80');
        
        ctx.fillStyle = hotGradient;
        ctx.fillRect(hotSource.x, hotSource.y, hotSource.width, hotSource.height);
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(hotSource.x, hotSource.y, hotSource.width, hotSource.height);
        
        // 绘制冷源
        const coldGradient = ctx.createLinearGradient(
            coldSource.x, coldSource.y,
            coldSource.x + coldSource.width, coldSource.y
        );
        coldGradient.addColorStop(0, '#4cc9f0');
        coldGradient.addColorStop(1, '#a3daff');
        
        ctx.fillStyle = coldGradient;
        ctx.fillRect(coldSource.x, coldSource.y, coldSource.width, coldSource.height);
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 1;
        ctx.strokeRect(coldSource.x, coldSource.y, coldSource.width, coldSource.height);
        
        // 标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`热源 (${this.carnotState.hotTemp}K)`, hotSource.x + hotSource.width/2, hotSource.y - 5);
        ctx.fillText(`冷源 (${this.carnotState.coldTemp}K)`, coldSource.x + coldSource.width/2, coldSource.y - 5);
        
        // 绘制热流 (仅在相应阶段)
        if (stage === 0) { // 等温膨胀 - 从热源到气缸
            this.drawHeatFlow(ctx, 
                hotSource.x + hotSource.width, hotSource.y + hotSource.height/2,
                cylinderX, cylinderY + cylinderHeight/2,
                '#ff6b6b'
            );
        } else if (stage === 2) { // 等温压缩 - 从气缸到冷源
            this.drawHeatFlow(ctx,
                cylinderX + cylinderWidth, cylinderY + cylinderHeight/2,
                coldSource.x, coldSource.y + coldSource.height/2,
                '#4cc9f0'
            );
        }
    }

    drawHeatFlow(ctx, x1, y1, x2, y2, color) {
        // 波浪热流效果
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        
        // 动画效果
        const time = this.carnotState.totalTime * 5;
        const amplitude = 5;
        const frequency = 0.1;
        
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.01) {
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t + amplitude * Math.sin((t * 10 + time) * frequency * Math.PI * 2);
            
            if (t === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // 箭头
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI/6), y2 - 10 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI/6), y2 - 10 * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    drawCurrentState(ctx, systemX, systemY, systemWidth, systemHeight) {
        // 显示当前状态信息
        const infoX = systemX + 20;
        const infoY = systemY + systemHeight - 80;
        
        ctx.textAlign = 'left';
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        
        // 阶段描述
        const stageDescriptions = [
            '等温膨胀 (吸热)',
            '绝热膨胀 (无热交换)',
            '等温压缩 (放热)',
            '绝热压缩 (无热交换)'
        ];
        
        ctx.fillStyle = '#ff6b35';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`当前阶段: ${stageDescriptions[this.carnotState.stage]}`, infoX, infoY);
        
        // 状态参数
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`压力: ${this.carnotState.pressure.toFixed(2)} 单位`, infoX, infoY + 20);
        ctx.fillText(`体积: ${this.carnotState.volume.toFixed(2)} 单位`, infoX, infoY + 40);
        ctx.fillText(`温度: ${this.carnotState.temperature.toFixed(0)} K`, infoX, infoY + 60);
        
        // 循环计数
        ctx.textAlign = 'right';
        ctx.fillStyle = '#333';
        ctx.fillText(`完成循环数: ${this.carnotState.cycleCount}`, systemX + systemWidth - 20, infoY + 60);
    }

    updateCarnotInfo() {
        // 卡诺热机效率
        const efficiency = 1 - (this.carnotState.coldTemp / this.carnotState.hotTemp);
        
        // 阶段描述
        const stageDescriptions = [
            '等温膨胀：系统从热源吸热，体积增加',
            '绝热膨胀：系统做功，温度下降',
            '等温压缩：系统向冷源放热，体积减小',
            '绝热压缩：环境对系统做功，温度升高'
        ];
        
        // 更新信息面板
        document.getElementById('thermo-info').innerHTML = `
            <strong>卡诺循环分析:</strong><br>
            热源温度: ${this.carnotState.hotTemp} K<br>
            冷源温度: ${this.carnotState.coldTemp} K<br>
            <strong>当前状态:</strong><br>
            压力: ${this.carnotState.pressure.toFixed(2)} 单位<br>
            体积: ${this.carnotState.volume.toFixed(2)} 单位<br>
            温度: ${this.carnotState.temperature.toFixed(0)} K<br>
            <strong>热机效率:</strong><br>
            理论效率: ${(efficiency * 100).toFixed(1)}%<br>
            完成循环数: ${this.carnotState.cycleCount}<br>
            <strong>当前阶段:</strong><br>
            ${stageDescriptions[this.carnotState.stage]}
        `;
    }
}

// 初始化热力学模拟器
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.physicsSimulator) {
            window.thermodynamicsSimulator = new ThermodynamicsSimulator(window.physicsSimulator);
        }
    }, 100);
}); 