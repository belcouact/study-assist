/**
 * 波动模拟器模块
 */
class WavesSimulator {
    constructor(physicsSimulator) {
        this.physicsSimulator = physicsSimulator;
        this.currentType = 'transverse';
        this.isRunning = false;
        this.animationId = null;
        this.time = 0;
        
        this.init();
    }

    init() {
        this.setupControls();
        this.updateWaveInfo();
    }

    setupControls() {
        const typeSelect = document.getElementById('wave-type');
        const startBtn = document.getElementById('start-waves');
        const resetBtn = document.getElementById('reset-waves');
        const pauseBtn = document.getElementById('pause-waves');

        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.currentType = e.target.value;
            });
        }

        if (document.getElementById('wave-frequency')) {
            document.getElementById('wave-frequency').addEventListener('input', (e) => {
                document.getElementById('frequency-value').textContent = e.target.value;
                this.updateWaveInfo();
            });
        }

        if (document.getElementById('wave-amplitude')) {
            document.getElementById('wave-amplitude').addEventListener('input', (e) => {
                document.getElementById('amplitude-value').textContent = e.target.value;
            });
        }

        if (document.getElementById('wave-speed')) {
            document.getElementById('wave-speed').addEventListener('input', (e) => {
                document.getElementById('wave-speed-value').textContent = e.target.value;
                this.updateWaveInfo();
            });
        }

        if (startBtn) startBtn.addEventListener('click', () => this.startWavesSimulation());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetWavesSimulation());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseWavesSimulation());
    }

    updateWaveInfo() {
        const frequencyEl = document.getElementById('wave-frequency');
        const speedEl = document.getElementById('wave-speed');
        const wavelengthEl = document.getElementById('wavelength');
        const periodEl = document.getElementById('period');

        if (frequencyEl && speedEl && wavelengthEl && periodEl) {
            const frequency = parseFloat(frequencyEl.value);
            const speed = parseFloat(speedEl.value);
            const wavelength = speed / frequency;
            const period = 1 / frequency;

            wavelengthEl.textContent = wavelength.toFixed(1) + 'm';
            periodEl.textContent = period.toFixed(2) + 's';
        }
    }

    startWavesSimulation() {
        this.isRunning = true;
        this.simulateWaves();
    }

    simulateWaves() {
        const canvas = this.physicsSimulator.canvases.waves;
        const ctx = this.physicsSimulator.contexts.waves;
        
        const frequency = parseFloat(document.getElementById('wave-frequency').value);
        const amplitude = parseFloat(document.getElementById('wave-amplitude').value);
        const speed = parseFloat(document.getElementById('wave-speed').value);
        const type = document.getElementById('wave-type').value;

        const wavelength = speed / frequency;
        const period = 1 / frequency;
        const omega = 2 * Math.PI * frequency;
        const k = 2 * Math.PI / wavelength;

        const animate = () => {
            if (!this.isRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制坐标系和网格
            this.drawWaveCoordinateSystem(ctx, canvas);

            if (type === 'transverse') {
                this.drawTransverseWave(ctx, canvas, amplitude, k, omega, this.time);
            } else if (type === 'longitudinal') {
                this.drawLongitudinalWave(ctx, canvas, amplitude, k, omega, this.time);
            } else if (type === 'standing') {
                this.drawStandingWave(ctx, canvas, amplitude, k, omega, this.time);
            } else if (type === 'interference') {
                this.drawWaveInterference(ctx, canvas, amplitude, k, omega, this.time);
            }

            // 绘制波的参数信息
            this.drawWaveParameters(ctx, canvas, frequency, amplitude, speed, wavelength, period);

            // 绘制粒子运动轨迹
            this.drawParticleMotion(ctx, canvas, type, amplitude, k, omega, this.time);

            // 绘制能量密度分布
            this.drawEnergyDensity(ctx, canvas, type, amplitude, k, omega, this.time);

            // 绘制频谱分析
            this.drawFrequencySpectrum(ctx, canvas, frequency, amplitude);

            // 实时更新波的物理量
            const instantaneousPower = this.calculateInstantaneousPower(amplitude, omega);
            const energyDensity = this.calculateEnergyDensity(amplitude, frequency);
            const intensity = this.calculateWaveIntensity(amplitude, frequency, speed);

            document.getElementById('waves-info').innerHTML = `
                <strong>波动分析:</strong><br>
                频率: ${frequency.toFixed(2)} Hz<br>
                波长: ${wavelength.toFixed(1)} m<br>
                周期: ${period.toFixed(2)} s<br>
                波速: ${speed} m/s<br>
                振幅: ${amplitude} 单位<br>
                <strong>能量分析:</strong><br>
                瞬时功率: ${instantaneousPower.toFixed(3)} W<br>
                能量密度: ${energyDensity.toFixed(3)} J/m³<br>
                波强: ${intensity.toFixed(3)} W/m²<br>
                <strong>波动类型:</strong><br>
                ${this.getWaveTypeDescription(type)}<br>
                <strong>物理现象:</strong><br>
                • 波的反射和透射<br>
                • 干涉和衍射效应<br>
                • 多普勒效应<br>
                • 能量传播分析
            `;

            this.time += 0.02;
            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    drawWaveCoordinateSystem(ctx, canvas) {
        // Grid
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        for (let x = 0; x <= canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }

    drawTransverseWave(ctx, canvas, amplitude, k, omega, time) {
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x += 2) {
            const y = canvas.height / 2 + amplitude * Math.sin(k * x / 10 - omega * time);
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    drawLongitudinalWave(ctx, canvas, amplitude, k, omega, time) {
        const particles = 50;
        ctx.fillStyle = '#4361ee';
        
        for (let i = 0; i < particles; i++) {
            const x0 = (i / particles) * canvas.width;
            const displacement = amplitude * 0.5 * Math.sin(k * x0 / 10 - omega * time);
            const x = x0 + displacement;
            const density = 1 + 0.5 * Math.sin(k * x0 / 10 - omega * time);
            
            ctx.globalAlpha = density;
            ctx.beginPath();
            ctx.arc(x, canvas.height / 2, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawStandingWave(ctx, canvas, amplitude, k, omega, time) {
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let x = 0; x <= canvas.width; x += 2) {
            const envelope = amplitude * Math.abs(Math.sin(k * x / 10));
            const y = canvas.height / 2 + envelope * Math.cos(omega * time);
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    drawWaveInterference(ctx, canvas, amplitude, k, omega, time) {
        // Two wave sources
        const source1X = canvas.width * 0.3;
        const source2X = canvas.width * 0.7;
        
        ctx.strokeStyle = 'rgba(67, 97, 238, 0.6)';
        ctx.lineWidth = 2;
        
        for (let x = 0; x <= canvas.width; x += 2) {
            const d1 = Math.abs(x - source1X);
            const d2 = Math.abs(x - source2X);
            const wave1 = amplitude * Math.sin(k * d1 / 10 - omega * time);
            const wave2 = amplitude * Math.sin(k * d2 / 10 - omega * time);
            const y = canvas.height / 2 + wave1 + wave2;
            
            if (x === 0) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    drawWaveParameters(ctx, canvas, frequency, amplitude, speed, wavelength, period) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(10, 10, 200, 100);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(10, 10, 200, 100);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`频率: ${frequency.toFixed(2)} Hz`, 20, 30);
        ctx.fillText(`波长: ${wavelength.toFixed(1)} m`, 20, 50);
        ctx.fillText(`周期: ${period.toFixed(2)} s`, 20, 70);
        ctx.fillText(`波速: ${speed} m/s`, 20, 90);
    }

    drawParticleMotion(ctx, canvas, type, amplitude, k, omega, time) {
        // Simplified particle motion visualization
        const particles = 10;
        ctx.fillStyle = '#ff6b35';
        
        for (let i = 0; i < particles; i++) {
            const x = (i / particles) * canvas.width;
            let y = canvas.height / 2;
            
            if (type === 'transverse') {
                y += amplitude * 0.5 * Math.sin(k * x / 10 - omega * time);
            }
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    drawEnergyDensity(ctx, canvas, type, amplitude, k, omega, time) {
        // Energy density visualization
        ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        
        for (let x = 0; x < canvas.width; x += 10) {
            const energy = Math.pow(amplitude * Math.cos(k * x / 10 - omega * time), 2);
            const height = energy * 50;
            ctx.fillRect(x, canvas.height - height, 8, height);
        }
    }

    drawFrequencySpectrum(ctx, canvas, frequency, amplitude) {
        const spectrumX = canvas.width - 150;
        const spectrumY = 10;
        const spectrumWidth = 130;
        const spectrumHeight = 80;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(spectrumX, spectrumY, spectrumWidth, spectrumHeight);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(spectrumX, spectrumY, spectrumWidth, spectrumHeight);
        
        // Draw frequency peak
        const peakX = spectrumX + (frequency / 5) * spectrumWidth;
        const peakHeight = amplitude * 0.5;
        
        ctx.fillStyle = '#4361ee';
        ctx.fillRect(peakX, spectrumY + spectrumHeight - peakHeight, 4, peakHeight);
        
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.fillText('频谱', spectrumX + 5, spectrumY + 15);
    }

    calculateInstantaneousPower(amplitude, omega) {
        return 0.5 * amplitude * amplitude * omega * omega;
    }

    calculateEnergyDensity(amplitude, frequency) {
        return 0.5 * amplitude * amplitude * frequency * frequency;
    }

    calculateWaveIntensity(amplitude, frequency, speed) {
        return 0.5 * amplitude * amplitude * frequency * frequency * speed;
    }

    getWaveTypeDescription(type) {
        const descriptions = {
            'transverse': '横波：振动方向垂直于传播方向',
            'longitudinal': '纵波：振动方向平行于传播方向',
            'standing': '驻波：两个相向传播的波的叠加',
            'interference': '干涉：两个或多个波的叠加现象'
        };
        return descriptions[type] || '未知波型';
    }

    resetWavesSimulation() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.physicsSimulator.contexts.waves.clearRect(
            0, 0, 
            this.physicsSimulator.canvases.waves.width, 
            this.physicsSimulator.canvases.waves.height
        );
        this.time = 0;
        document.getElementById('waves-info').innerHTML = '波长: 100m<br>周期: 1.0s';
    }

    pauseWavesSimulation() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.simulateWaves();
        }
    }
}

// 初始化波动模拟器
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.physicsSimulator) {
            window.wavesSimulator = new WavesSimulator(window.physicsSimulator);
        }
    }, 100);
}); 