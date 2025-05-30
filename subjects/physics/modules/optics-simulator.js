/**
 * 光学模拟器模块
 */
class OpticsSimulator {
    constructor() {
        this.currentType = 'refraction';
        this.refractiveIndex1 = 1.0; // 空气
        this.refractiveIndex2 = 1.5; // 玻璃
        this.incidentAngle = 30;
        this.wavelength = 550; // 纳米
        this.lightRays = [];
        
        this.init();
    }

    init() {
        this.setupControls();
        this.createInitialRays();
    }

    setupControls() {
        const typeSelect = document.getElementById('optics-type');
        const startBtn = document.getElementById('optics-start');
        const pauseBtn = document.getElementById('optics-pause');
        const resetBtn = document.getElementById('optics-reset');

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
        const container = document.getElementById('optics-specific-controls');
        if (!container) return;

        let html = '';
        
        switch (this.currentType) {
            case 'refraction':
                html = `
                    <div class="control-group">
                        <label for="n1">介质1折射率</label>
                        <input type="range" id="n1" class="control-slider" 
                               min="1.0" max="2.0" step="0.1" value="${this.refractiveIndex1}">
                        <span id="n1-value">${this.refractiveIndex1}</span>
                    </div>
                    <div class="control-group">
                        <label for="n2">介质2折射率</label>
                        <input type="range" id="n2" class="control-slider" 
                               min="1.0" max="3.0" step="0.1" value="${this.refractiveIndex2}">
                        <span id="n2-value">${this.refractiveIndex2}</span>
                    </div>
                    <div class="control-group">
                        <label for="incident-angle">入射角 (度)</label>
                        <input type="range" id="incident-angle" class="control-slider" 
                               min="0" max="90" step="1" value="${this.incidentAngle}">
                        <span id="angle-value">${this.incidentAngle}°</span>
                    </div>
                `;
                break;
                
            case 'reflection':
                html = `
                    <div class="control-group">
                        <label for="mirror-type">镜面类型</label>
                        <select id="mirror-type" class="control-input">
                            <option value="plane">平面镜</option>
                            <option value="concave">凹面镜</option>
                            <option value="convex">凸面镜</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label for="focal-length">焦距 (cm)</label>
                        <input type="range" id="focal-length" class="control-slider" 
                               min="10" max="100" step="5" value="50">
                        <span id="focal-value">50 cm</span>
                    </div>
                `;
                break;
                
            case 'interference':
                html = `
                    <div class="control-group">
                        <label for="slit-separation">双缝间距 (μm)</label>
                        <input type="range" id="slit-separation" class="control-slider" 
                               min="1" max="100" step="1" value="20">
                        <span id="separation-value">20 μm</span>
                    </div>
                    <div class="control-group">
                        <label for="screen-distance">屏幕距离 (m)</label>
                        <input type="range" id="screen-distance" class="control-slider" 
                               min="0.5" max="5" step="0.1" value="2">
                        <span id="distance-value">2 m</span>
                    </div>
                `;
                break;
                
            case 'diffraction':
                html = `
                    <div class="control-group">
                        <label for="slit-width">单缝宽度 (μm)</label>
                        <input type="range" id="slit-width" class="control-slider" 
                               min="1" max="50" step="1" value="10">
                        <span id="width-value">10 μm</span>
                    </div>
                    <div class="control-group">
                        <label for="wavelength">光波长 (nm)</label>
                        <input type="range" id="wavelength" class="control-slider" 
                               min="400" max="700" step="10" value="${this.wavelength}">
                        <span id="wavelength-value">${this.wavelength} nm</span>
                    </div>
                `;
                break;
        }

        container.innerHTML = html;
        this.setupDynamicControls();
    }

    setupDynamicControls() {
        const sliders = document.querySelectorAll('#optics-specific-controls .control-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const valueSpan = document.getElementById(e.target.id + '-value');
                
                if (valueSpan) {
                    switch (e.target.id) {
                        case 'n1':
                            this.refractiveIndex1 = value;
                            valueSpan.textContent = value.toFixed(1);
                            break;
                        case 'n2':
                            this.refractiveIndex2 = value;
                            valueSpan.textContent = value.toFixed(1);
                            break;
                        case 'incident-angle':
                            this.incidentAngle = value;
                            valueSpan.textContent = `${value}°`;
                            break;
                        case 'focal-length':
                            valueSpan.textContent = `${value} cm`;
                            break;
                        case 'slit-separation':
                            valueSpan.textContent = `${value} μm`;
                            break;
                        case 'screen-distance':
                            valueSpan.textContent = `${value} m`;
                            break;
                        case 'slit-width':
                            valueSpan.textContent = `${value} μm`;
                            break;
                        case 'wavelength':
                            this.wavelength = value;
                            valueSpan.textContent = `${value} nm`;
                            break;
                    }
                    
                    this.updateOpticsInfo();
                }
            });
        });
    }

    createInitialRays() {
        this.lightRays = [
            { x: 50, y: 200, angle: this.incidentAngle * Math.PI / 180, intensity: 1.0 }
        ];
    }

    startSimulation() {
        physicsSimulator.startAnimation('optics', () => {
            this.updateSimulation();
            this.drawSimulation();
        });
    }

    pauseSimulation() {
        physicsSimulator.pauseAnimation('optics');
    }

    resetSimulation() {
        physicsSimulator.resetSimulation('optics');
        this.createInitialRays();
    }

    updateSimulation() {
        physicsSimulator.simulationTime += physicsSimulator.timeStep;
    }

    drawSimulation() {
        const canvas = physicsSimulator.canvases.optics;
        const ctx = physicsSimulator.contexts.optics;
        
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (this.currentType) {
            case 'refraction':
                this.drawRefraction(ctx, canvas);
                break;
            case 'reflection':
                this.drawReflection(ctx, canvas);
                break;
            case 'interference':
                this.drawInterference(ctx, canvas);
                break;
            case 'diffraction':
                this.drawDiffraction(ctx, canvas);
                break;
        }
    }

    drawRefraction(ctx, canvas) {
        const interfaceX = canvas.width / 2;
        
        // 绘制界面
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(interfaceX, 0);
        ctx.lineTo(interfaceX, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // 法线
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(interfaceX, 0);
        ctx.lineTo(interfaceX, canvas.height);
        ctx.stroke();

        const incidentY = canvas.height / 2;
        const rayLength = 150;
        
        // 入射光线
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        const incidentAngleRad = this.incidentAngle * Math.PI / 180;
        const startX = interfaceX - rayLength * Math.cos(incidentAngleRad);
        const startY = incidentY - rayLength * Math.sin(incidentAngleRad);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(interfaceX, incidentY);
        ctx.stroke();

        // 计算折射角
        const sinRefracted = (this.refractiveIndex1 / this.refractiveIndex2) * Math.sin(incidentAngleRad);
        
        if (Math.abs(sinRefracted) <= 1) {
            // 折射光线
            const refractedAngle = Math.asin(sinRefracted);
            ctx.strokeStyle = '#4444ff';
            const endX = interfaceX + rayLength * Math.cos(refractedAngle);
            const endY = incidentY + rayLength * Math.sin(refractedAngle);
            
            ctx.beginPath();
            ctx.moveTo(interfaceX, incidentY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // 反射光线
        ctx.strokeStyle = '#44ff44';
        ctx.lineWidth = 2;
        const reflectedEndX = interfaceX - rayLength * Math.cos(incidentAngleRad);
        const reflectedEndY = incidentY + rayLength * Math.sin(incidentAngleRad);
        
        ctx.beginPath();
        ctx.moveTo(interfaceX, incidentY);
        ctx.lineTo(reflectedEndX, reflectedEndY);
        ctx.stroke();

        // 标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`n₁ = ${this.refractiveIndex1}`, interfaceX - 80, 30);
        ctx.fillText(`n₂ = ${this.refractiveIndex2}`, interfaceX + 80, 30);
        ctx.fillText(`θ₁ = ${this.incidentAngle}°`, startX - 20, startY - 10);
        
        if (Math.abs(sinRefracted) <= 1) {
            const refractedAngleDeg = Math.asin(sinRefracted) * 180 / Math.PI;
            ctx.fillText(`θ₂ = ${refractedAngleDeg.toFixed(1)}°`, interfaceX + 60, incidentY + 30);
        }
    }

    drawReflection(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // 绘制镜面
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY + 50);
        ctx.lineTo(centerX + 100, centerY + 50);
        ctx.stroke();

        // 入射光线
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 3;
        const rayStartX = centerX - 80;
        const rayStartY = centerY - 60;
        
        ctx.beginPath();
        ctx.moveTo(rayStartX, rayStartY);
        ctx.lineTo(centerX, centerY + 50);
        ctx.stroke();

        // 反射光线
        const reflectedEndX = centerX + 80;
        const reflectedEndY = centerY - 60;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 50);
        ctx.lineTo(reflectedEndX, reflectedEndY);
        ctx.stroke();

        // 法线
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 50);
        ctx.lineTo(centerX, centerY - 80);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('平面镜反射', centerX, centerY + 80);
    }

    drawInterference(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // 绘制双缝
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 8;
        const slitX = centerX - 150;
        
        // 上缝
        ctx.beginPath();
        ctx.moveTo(slitX, centerY - 50);
        ctx.lineTo(slitX, centerY - 10);
        ctx.stroke();
        
        // 下缝
        ctx.beginPath();
        ctx.moveTo(slitX, centerY + 10);
        ctx.lineTo(slitX, centerY + 50);
        ctx.stroke();

        // 入射光
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const y = centerY - 40 + i * 20;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(slitX - 20, y);
            ctx.stroke();
        }

        // 从两缝发出的光
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 1;
        
        const slit1Y = centerY - 5;
        const slit2Y = centerY + 5;
        const screenX = centerX + 150;
        
        // 干涉图样
        for (let i = 0; i < 20; i++) {
            const screenY = centerY - 100 + i * 10;
            const path1 = Math.sqrt((screenX - slitX) ** 2 + (screenY - slit1Y) ** 2);
            const path2 = Math.sqrt((screenX - slitX) ** 2 + (screenY - slit2Y) ** 2);
            const pathDiff = Math.abs(path1 - path2);
            const phase = (pathDiff / (this.wavelength * 1e-9)) * 2 * Math.PI;
            const intensity = Math.cos(phase / 2) ** 2;
            
            ctx.fillStyle = `rgba(255, 255, 0, ${intensity})`;
            ctx.fillRect(screenX, screenY - 2, 10, 4);
        }

        // 屏幕
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(screenX, centerY - 120);
        ctx.lineTo(screenX, centerY + 120);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('双缝干涉', centerX, 30);
    }

    drawDiffraction(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // 绘制单缝
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 8;
        const slitX = centerX - 100;
        
        // 缝隙上方
        ctx.beginPath();
        ctx.moveTo(slitX, 50);
        ctx.lineTo(slitX, centerY - 10);
        ctx.stroke();
        
        // 缝隙下方
        ctx.beginPath();
        ctx.moveTo(slitX, centerY + 10);
        ctx.lineTo(slitX, canvas.height - 50);
        ctx.stroke();

        // 入射平行光
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            const y = 80 + i * 30;
            if (y < centerY - 10 || y > centerY + 10) continue;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(slitX - 20, y);
            ctx.stroke();
        }

        // 衍射图样
        const screenX = centerX + 120;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(screenX, 50);
        ctx.lineTo(screenX, canvas.height - 50);
        ctx.stroke();

        // 衍射强度分布
        for (let i = 0; i < 50; i++) {
            const screenY = 80 + i * 8;
            const angle = Math.atan((screenY - centerY) / (screenX - slitX));
            const beta = Math.PI * 10e-6 * Math.sin(angle) / (this.wavelength * 1e-9);
            let intensity = 1;
            
            if (beta !== 0) {
                intensity = (Math.sin(beta) / beta) ** 2;
            }
            
            ctx.fillStyle = `rgba(255, 255, 0, ${intensity})`;
            ctx.fillRect(screenX + 5, screenY - 2, 15, 4);
        }

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('单缝衍射', centerX, 30);
    }

    updateOpticsInfo() {
        const infoElement = document.getElementById('optics-info');
        if (!infoElement) return;
        
        let content = '<h4>光学信息</h4>';
        
        switch (this.currentType) {
            case 'refraction':
                const criticalAngle = this.refractiveIndex1 > this.refractiveIndex2 ? 
                    Math.asin(this.refractiveIndex2 / this.refractiveIndex1) * 180 / Math.PI : null;
                
                content += `
                    <p><strong>斯涅尔定律:</strong> n₁sinθ₁ = n₂sinθ₂</p>
                    <p><strong>入射角:</strong> ${this.incidentAngle}°</p>
                    <p><strong>折射率比:</strong> ${(this.refractiveIndex2/this.refractiveIndex1).toFixed(2)}</p>
                    ${criticalAngle ? `<p><strong>临界角:</strong> ${criticalAngle.toFixed(1)}°</p>` : ''}
                `;
                break;
                
            case 'reflection':
                content += `
                    <p><strong>反射定律:</strong> 入射角 = 反射角</p>
                    <p><strong>镜面反射遵循几何光学原理</strong></p>
                `;
                break;
                
            case 'interference':
                content += `
                    <p><strong>干涉条件:</strong> 相干光源</p>
                    <p><strong>光程差:</strong> Δ = d·sinθ</p>
                    <p><strong>明纹条件:</strong> Δ = mλ (m = 0,±1,±2...)</p>
                `;
                break;
                
            case 'diffraction':
                content += `
                    <p><strong>衍射条件:</strong> 障碍物尺寸 ≈ 波长</p>
                    <p><strong>波长:</strong> ${this.wavelength} nm</p>
                    <p><strong>衍射角度与波长成正比</strong></p>
                `;
                break;
        }
        
        infoElement.innerHTML = content;
    }
}

// 初始化光学模拟器
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.physicsSimulator) {
            window.opticsSimulator = new OpticsSimulator();
        }
    }, 100);
}); 