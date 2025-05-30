/**
 * 波动模拟器模块
 */
class WavesSimulator {
    constructor() {
        this.currentType = 'mechanical';
        this.frequency = 2.0; // Hz
        this.amplitude = 50; // pixels
        this.wavelength = 100; // pixels
        this.waveSpeed = 200; // pixels/second
        this.dampingFactor = 0.98;
        this.waveData = [];
        
        this.init();
    }

    init() {
        this.setupControls();
        this.initializeWave();
    }

    setupControls() {
        const typeSelect = document.getElementById('waves-type');
        const startBtn = document.getElementById('waves-start');
        const pauseBtn = document.getElementById('waves-pause');
        const resetBtn = document.getElementById('waves-reset');

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
        const container = document.getElementById('waves-specific-controls');
        if (!container) return;

        let html = '';
        
        switch (this.currentType) {
            case 'mechanical':
                html = `
                    <div class="control-group">
                        <label for="wave-frequency">频率 (Hz)</label>
                        <input type="range" id="wave-frequency" class="control-slider" 
                               min="0.5" max="5" step="0.1" value="${this.frequency}">
                        <span id="frequency-value">${this.frequency} Hz</span>
                    </div>
                    <div class="control-group">
                        <label for="wave-amplitude">振幅</label>
                        <input type="range" id="wave-amplitude" class="control-slider" 
                               min="10" max="100" step="5" value="${this.amplitude}">
                        <span id="amplitude-value">${this.amplitude}</span>
                    </div>
                    <div class="control-group">
                        <label for="wave-speed">波速 (m/s)</label>
                        <input type="range" id="wave-speed" class="control-slider" 
                               min="50" max="400" step="10" value="${this.waveSpeed}">
                        <span id="speed-value">${this.waveSpeed}</span>
                    </div>
                `;
                break;
                
            case 'sound':
                html = `
                    <div class="control-group">
                        <label for="sound-frequency">音频 (Hz)</label>
                        <input type="range" id="sound-frequency" class="control-slider" 
                               min="100" max="2000" step="50" value="440">
                        <span id="sound-freq-value">440 Hz</span>
                    </div>
                    <div class="control-group">
                        <label for="medium-density">介质密度</label>
                        <input type="range" id="medium-density" class="control-slider" 
                               min="0.5" max="2.0" step="0.1" value="1.0">
                        <span id="density-value">1.0</span>
                    </div>
                    <div class="control-group">
                        <label for="temperature">温度 (°C)</label>
                        <input type="range" id="temperature" class="control-slider" 
                               min="-20" max="50" step="1" value="20">
                        <span id="temp-value">20°C</span>
                    </div>
                `;
                break;
                
            case 'standing':
                html = `
                    <div class="control-group">
                        <label for="standing-frequency">频率 (Hz)</label>
                        <input type="range" id="standing-frequency" class="control-slider" 
                               min="1" max="10" step="0.5" value="3">
                        <span id="standing-freq-value">3 Hz</span>
                    </div>
                    <div class="control-group">
                        <label for="boundary-type">边界条件</label>
                        <select id="boundary-type" class="control-input">
                            <option value="fixed">固定端</option>
                            <option value="free">自由端</option>
                            <option value="mixed">混合</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'doppler':
                html = `
                    <div class="control-group">
                        <label for="source-speed">波源速度 (m/s)</label>
                        <input type="range" id="source-speed" class="control-slider" 
                               min="0" max="100" step="5" value="30">
                        <span id="source-speed-value">30 m/s</span>
                    </div>
                    <div class="control-group">
                        <label for="observer-speed">观察者速度 (m/s)</label>
                        <input type="range" id="observer-speed" class="control-slider" 
                               min="0" max="50" step="2" value="10">
                        <span id="observer-speed-value">10 m/s</span>
                    </div>
                    <div class="control-group">
                        <label for="original-frequency">原始频率 (Hz)</label>
                        <input type="range" id="original-frequency" class="control-slider" 
                               min="100" max="1000" step="50" value="500">
                        <span id="original-freq-value">500 Hz</span>
                    </div>
                `;
                break;
        }

        container.innerHTML = html;
        this.setupDynamicControls();
    }

    setupDynamicControls() {
        const sliders = document.querySelectorAll('#waves-specific-controls .control-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const valueSpan = document.getElementById(e.target.id.replace(/^(.+)$/, '$1-value'));
                
                if (valueSpan) {
                    switch (e.target.id) {
                        case 'wave-frequency':
                        case 'standing-frequency':
                            this.frequency = value;
                            valueSpan.textContent = `${value} Hz`;
                            break;
                        case 'wave-amplitude':
                            this.amplitude = value;
                            valueSpan.textContent = value;
                            break;
                        case 'wave-speed':
                            this.waveSpeed = value;
                            valueSpan.textContent = value;
                            break;
                        case 'sound-frequency':
                            valueSpan.textContent = `${value} Hz`;
                            break;
                        case 'medium-density':
                            valueSpan.textContent = value.toFixed(1);
                            break;
                        case 'temperature':
                            valueSpan.textContent = `${value}°C`;
                            break;
                        case 'source-speed':
                            valueSpan.textContent = `${value} m/s`;
                            break;
                        case 'observer-speed':
                            valueSpan.textContent = `${value} m/s`;
                            break;
                        case 'original-frequency':
                            valueSpan.textContent = `${value} Hz`;
                            break;
                    }
                    
                    this.updateWavesInfo();
                }
            });
        });
    }

    initializeWave() {
        const canvas = physicsSimulator.canvases.waves;
        if (canvas) {
            this.waveData = [];
            for (let x = 0; x < canvas.width; x += 2) {
                this.waveData.push({
                    x: x,
                    y: canvas.height / 2,
                    velocity: 0,
                    phase: 0
                });
            }
        }
    }

    startSimulation() {
        physicsSimulator.startAnimation('waves', () => {
            this.updateSimulation();
            this.drawSimulation();
        });
    }

    pauseSimulation() {
        physicsSimulator.pauseAnimation('waves');
    }

    resetSimulation() {
        physicsSimulator.resetSimulation('waves');
        this.initializeWave();
    }

    updateSimulation() {
        physicsSimulator.simulationTime += physicsSimulator.timeStep;
        
        // 更新波的相位
        const canvas = physicsSimulator.canvases.waves;
        if (canvas && this.waveData.length > 0) {
            const omega = 2 * Math.PI * this.frequency;
            const k = 2 * Math.PI / this.wavelength;
            
            this.waveData.forEach((point, index) => {
                switch (this.currentType) {
                    case 'mechanical':
                        point.phase = omega * physicsSimulator.simulationTime - k * point.x;
                        point.y = canvas.height / 2 + this.amplitude * Math.sin(point.phase);
                        break;
                        
                    case 'sound':
                        // 声波压缩和稀疏
                        point.phase = omega * physicsSimulator.simulationTime - k * point.x;
                        const density = 1 + 0.3 * Math.sin(point.phase);
                        point.density = density;
                        break;
                        
                    case 'standing':
                        // 驻波
                        const amplitude = 2 * this.amplitude * Math.sin(k * point.x);
                        point.y = canvas.height / 2 + amplitude * Math.cos(omega * physicsSimulator.simulationTime);
                        break;
                        
                    case 'doppler':
                        // 多普勒效应
                        const sourcePosition = 100 + 50 * physicsSimulator.simulationTime;
                        const distance = Math.abs(point.x - sourcePosition);
                        const effectiveFreq = this.frequency * (1 + 0.3 * Math.sin(distance / 50));
                        point.phase = 2 * Math.PI * effectiveFreq * physicsSimulator.simulationTime;
                        point.y = canvas.height / 2 + this.amplitude * Math.sin(point.phase) * Math.exp(-distance / 200);
                        break;
                }
            });
        }
    }

    drawSimulation() {
        const canvas = physicsSimulator.canvases.waves;
        const ctx = physicsSimulator.contexts.waves;
        
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (this.currentType) {
            case 'mechanical':
                this.drawMechanicalWave(ctx, canvas);
                break;
            case 'sound':
                this.drawSoundWave(ctx, canvas);
                break;
            case 'standing':
                this.drawStandingWave(ctx, canvas);
                break;
            case 'doppler':
                this.drawDopplerEffect(ctx, canvas);
                break;
        }

        this.drawWaveInfo(ctx, canvas);
    }

    drawMechanicalWave(ctx, canvas) {
        // 绘制波形
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 3;
        ctx.beginPath();

        this.waveData.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        // 绘制参考线
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制波长指示
        const waveStartX = 50;
        const waveEndX = waveStartX + this.wavelength;
        
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(waveStartX, canvas.height - 40);
        ctx.lineTo(waveEndX, canvas.height - 40);
        ctx.stroke();

        // 箭头
        physicsSimulator.drawArrow(ctx, waveStartX, canvas.height - 40, waveEndX, canvas.height - 40, 6);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('λ', (waveStartX + waveEndX) / 2, canvas.height - 20);
    }

    drawSoundWave(ctx, canvas) {
        // 绘制声波的压缩和稀疏
        this.waveData.forEach((point, index) => {
            const density = point.density || 1;
            const alpha = Math.min(density, 1);
            const radius = 2 + density;
            
            ctx.fillStyle = `rgba(67, 97, 238, ${alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(point.x, canvas.height / 2, radius, 0, 2 * Math.PI);
            ctx.fill();
        });

        // 绘制压力波形
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.waveData.forEach((point, index) => {
            const pressure = (point.density || 1) - 1;
            const y = canvas.height * 0.75 + pressure * 50;
            
            if (index === 0) {
                ctx.moveTo(point.x, y);
            } else {
                ctx.lineTo(point.x, y);
            }
        });
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('声波传播', 20, 30);
        ctx.fillText('压力变化', 20, canvas.height * 0.75 - 20);
    }

    drawStandingWave(ctx, canvas) {
        // 绘制驻波
        ctx.strokeStyle = '#9c27b0';
        ctx.lineWidth = 3;
        ctx.beginPath();

        this.waveData.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        // 绘制节点和反节点
        const nodeSpacing = this.wavelength / 2;
        
        for (let x = 0; x < canvas.width; x += nodeSpacing) {
            // 节点（振幅为0的点）
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(x, canvas.height / 2, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('N', x, canvas.height / 2 - 10);
        }

        // 反节点标记
        for (let x = nodeSpacing / 2; x < canvas.width; x += nodeSpacing) {
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.arc(x, canvas.height / 2, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('A', x, canvas.height / 2 - 10);
        }

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('驻波模式', 20, 30);
        ctx.fillText('N-节点  A-反节点', 20, 50);
    }

    drawDopplerEffect(ctx, canvas) {
        // 绘制移动的波源
        const sourceX = 100 + 50 * physicsSimulator.simulationTime;
        const sourceY = canvas.height / 2;
        
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(sourceX % canvas.width, sourceY, 8, 0, 2 * Math.PI);
        ctx.fill();

        // 绘制波圈
        for (let i = 0; i < 10; i++) {
            const radius = (physicsSimulator.simulationTime * 100 - i * 20) % 200;
            if (radius > 0 && radius < 150) {
                ctx.strokeStyle = `rgba(67, 97, 238, ${1 - radius / 150})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(sourceX % canvas.width, sourceY, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }

        // 绘制观察者
        const observerX = canvas.width - 100;
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(observerX, sourceY, 6, 0, 2 * Math.PI);
        ctx.fill();

        // 绘制波形
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.waveData.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('波源', sourceX % canvas.width, sourceY + 25);
        ctx.fillText('观察者', observerX, sourceY + 25);
    }

    drawWaveInfo(ctx, canvas) {
        // 在右上角显示波的参数
        const infoX = canvas.width - 150;
        const infoY = 30;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(infoX - 10, infoY - 10, 140, 80);
        
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 1;
        ctx.strokeRect(infoX - 10, infoY - 10, 140, 80);

        ctx.fillStyle = '#333';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`频率: ${this.frequency.toFixed(1)} Hz`, infoX, infoY);
        ctx.fillText(`振幅: ${this.amplitude}`, infoX, infoY + 15);
        ctx.fillText(`波长: ${this.wavelength.toFixed(0)}px`, infoX, infoY + 30);
        ctx.fillText(`波速: ${this.waveSpeed}px/s`, infoX, infoY + 45);
        ctx.fillText(`时间: ${physicsSimulator.simulationTime.toFixed(1)}s`, infoX, infoY + 60);
    }

    updateWavesInfo() {
        const infoElement = document.getElementById('waves-info');
        if (!infoElement) return;
        
        let content = '<h4>波动信息</h4>';
        
        switch (this.currentType) {
            case 'mechanical':
                const period = 1 / this.frequency;
                const angularFreq = 2 * Math.PI * this.frequency;
                
                content += `
                    <p><strong>频率:</strong> f = ${this.frequency.toFixed(1)} Hz</p>
                    <p><strong>周期:</strong> T = ${period.toFixed(2)} s</p>
                    <p><strong>角频率:</strong> ω = ${angularFreq.toFixed(1)} rad/s</p>
                    <p><strong>波长:</strong> λ = ${this.wavelength}px</p>
                    <p><strong>波速:</strong> v = fλ = ${(this.frequency * this.wavelength).toFixed(0)}px/s</p>
                `;
                break;
                
            case 'sound':
                content += `
                    <p><strong>声波特性:</strong></p>
                    <p>• 纵波传播</p>
                    <p>• 压缩和稀疏交替</p>
                    <p>• 速度受介质影响</p>
                    <p><strong>空气中声速:</strong> ~343 m/s (20°C)</p>
                `;
                break;
                
            case 'standing':
                content += `
                    <p><strong>驻波特征:</strong></p>
                    <p>• 节点：振幅始终为0</p>
                    <p>• 反节点：振幅最大</p>
                    <p>• 相邻节点距离：λ/2</p>
                    <p><strong>共振条件:</strong> L = nλ/2</p>
                `;
                break;
                
            case 'doppler':
                content += `
                    <p><strong>多普勒效应:</strong></p>
                    <p>f' = f(v±v₀)/(v±vₛ)</p>
                    <p>• 波源接近：频率增高</p>
                    <p>• 波源远离：频率降低</p>
                    <p><strong>应用:</strong> 雷达、医学超声</p>
                `;
                break;
        }
        
        infoElement.innerHTML = content;
    }
}

// 初始化波动模拟器
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.physicsSimulator) {
            window.wavesSimulator = new WavesSimulator();
        }
    }, 100);
}); 