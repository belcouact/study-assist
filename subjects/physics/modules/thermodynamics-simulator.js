/**
 * 热力学模拟器模块
 */
class ThermodynamicsSimulator {
    constructor(physicsSimulator) {
        this.physicsSimulator = physicsSimulator;
        this.particles = [];
        this.isRunning = false;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.setupControls();
        this.setupGasParticles();
    }

    setupControls() {
        const startBtn = document.getElementById('start-thermo');
        const resetBtn = document.getElementById('reset-thermo');
        const pauseBtn = document.getElementById('pause-thermo');

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
        this.setupGasParticles();
        document.getElementById('thermo-info').innerHTML = '平均动能: <span id="avg-kinetic">--</span><br>体积: <span id="volume">--</span>';
    }

    pauseThermodynamicsSimulation() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.simulateThermodynamics();
        }
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