/**
 * 光学模拟器模块
 */
class OpticsSimulator {
    constructor(physicsSimulator) {
        this.physicsSimulator = physicsSimulator;
        this.currentType = 'reflection';
        this.isRunning = false;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.setupControls();
    }

    setupControls() {
        const typeSelect = document.getElementById('optics-type');
        const startBtn = document.getElementById('start-optics');
        const resetBtn = document.getElementById('reset-optics');

        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.switchOpticsType(e.target.value);
            });
        }

        // Add event listeners for optics sliders
        const sliders = [
            'incident-angle', 'refractive-index-1', 'refractive-index-2',
            'focal-length', 'object-distance', 'light-wavelength', 
            'slit-spacing', 'screen-distance'
        ];

        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const valueSpan = document.getElementById('incident-angle-value') ||
                                     document.getElementById('n1-value') ||
                                     document.getElementById('n2-value') ||
                                     document.getElementById('focal-length-value') ||
                                     document.getElementById('object-distance-value') ||
                                     document.getElementById('wavelength-value') ||
                                     document.getElementById('slit-spacing-value') ||
                                     document.getElementById('screen-distance-value');
                    if (valueSpan) {
                        valueSpan.textContent = e.target.value;
                    }
                });
            }
        });

        if (startBtn) startBtn.addEventListener('click', () => this.startOpticsSimulation());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetOpticsSimulation());
    }

    switchOpticsType(type) {
        document.getElementById('reflection-controls').style.display = 
            type === 'reflection' ? 'block' : 'none';
        document.getElementById('refraction-controls').style.display = 
            type === 'refraction' ? 'block' : 'none';
        document.getElementById('lens-controls').style.display = 
            type === 'lens' ? 'block' : 'none';
        document.getElementById('interference-controls').style.display = 
            type === 'interference' ? 'block' : 'none';
    }

    startOpticsSimulation() {
        const type = document.getElementById('optics-type').value;
        
        if (type === 'reflection') {
            this.simulateReflection();
        } else if (type === 'refraction') {
            this.simulateRefraction();
        } else if (type === 'lens') {
            this.simulateLens();
        } else if (type === 'interference') {
            this.simulateInterference();
        }
    }

    simulateReflection() {
        const canvas = this.physicsSimulator.canvases.optics;
        const ctx = this.physicsSimulator.contexts.optics;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const incidentAngle = parseFloat(document.getElementById('incident-angle').value) * Math.PI / 180;
        const mirrorType = document.getElementById('mirror-type').value;

        if (mirrorType === 'plane') {
            // 平面镜反射
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 100);
            ctx.lineTo(canvas.width / 2, canvas.height - 100);
            ctx.stroke();

            // 法线
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 50, canvas.height / 2);
            ctx.lineTo(canvas.width / 2 + 50, canvas.height / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // 入射光线
            const incidentX = canvas.width / 2 - 150 * Math.sin(incidentAngle);
            const incidentY = canvas.height / 2 - 150 * Math.cos(incidentAngle);
            
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(incidentX, incidentY);
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.stroke();

            // 反射光线
            const reflectedX = canvas.width / 2 + 150 * Math.sin(incidentAngle);
            const reflectedY = canvas.height / 2 - 150 * Math.cos(incidentAngle);
            
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.lineTo(reflectedX, reflectedY);
            ctx.stroke();

            document.getElementById('optics-info').innerHTML = `
                入射角: ${(incidentAngle * 180 / Math.PI).toFixed(1)}°<br>
                反射角: ${(incidentAngle * 180 / Math.PI).toFixed(1)}°<br>
                反射定律: 入射角 = 反射角
            `;
        }
    }

    simulateRefraction() {
        const canvas = this.physicsSimulator.canvases.optics;
        const ctx = this.physicsSimulator.contexts.optics;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const incidentAngle = parseFloat(document.getElementById('incident-angle').value) * Math.PI / 180;
        const n1 = parseFloat(document.getElementById('refractive-index-1').value);
        const n2 = parseFloat(document.getElementById('refractive-index-2').value);

        // 计算折射角 (斯涅尔定律)
        const sinRefracted = (n1 / n2) * Math.sin(incidentAngle);
        const refractedAngle = Math.asin(Math.min(1, Math.abs(sinRefracted)));

        // 绘制界面
        ctx.fillStyle = 'rgba(67, 97, 238, 0.1)';
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // 绘制法线
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 100);
        ctx.lineTo(canvas.width / 2, canvas.height - 100);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制入射光线
        const incidentX = canvas.width / 2 - 150 * Math.sin(incidentAngle);
        const incidentY = canvas.height / 2 - 150 * Math.cos(incidentAngle);
        
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(incidentX, incidentY);
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.stroke();

        // 绘制折射光线
        if (sinRefracted <= 1) {
            const refractedX = canvas.width / 2 + 150 * Math.sin(refractedAngle);
            const refractedY = canvas.height / 2 + 150 * Math.cos(refractedAngle);
            
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.lineTo(refractedX, refractedY);
            ctx.stroke();
        }

        // 更新信息
        document.getElementById('optics-info').innerHTML = `
            入射角: ${(incidentAngle * 180 / Math.PI).toFixed(1)}°<br>
            折射角: ${sinRefracted <= 1 ? (refractedAngle * 180 / Math.PI).toFixed(1) + '°' : '全反射'}<br>
            n₁ = ${n1}, n₂ = ${n2}<br>
            ${sinRefracted > 1 ? '发生全反射！' : ''}
        `;
    }

    simulateLens() {
        const canvas = this.physicsSimulator.canvases.optics;
        const ctx = this.physicsSimulator.contexts.optics;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const focalLength = parseFloat(document.getElementById('focal-length').value);
        const objectDistance = parseFloat(document.getElementById('object-distance').value);
        const lensType = document.getElementById('lens-type').value;

        const lensX = canvas.width / 2;
        const scale = 5; // 像素/cm

        // 绘制透镜
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 4;
        if (lensType === 'convex') {
            // 凸透镜
            ctx.beginPath();
            ctx.arc(lensX - 20, canvas.height / 2, 100, -Math.PI/6, Math.PI/6);
            ctx.arc(lensX + 20, canvas.height / 2, 100, Math.PI - Math.PI/6, Math.PI + Math.PI/6);
            ctx.stroke();
        } else {
            // 凹透镜
            ctx.beginPath();
            ctx.arc(lensX + 60, canvas.height / 2, 100, Math.PI - Math.PI/6, Math.PI + Math.PI/6);
            ctx.arc(lensX - 60, canvas.height / 2, 100, -Math.PI/6, Math.PI/6);
            ctx.stroke();
        }

        // 绘制光轴
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(50, canvas.height / 2);
        ctx.lineTo(canvas.width - 50, canvas.height / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制物体
        const objectX = lensX - objectDistance * scale;
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objectX, canvas.height / 2);
        ctx.lineTo(objectX, canvas.height / 2 - 40);
        ctx.stroke();

        // 计算像距
        let imageDistance;
        if (lensType === 'convex') {
            imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
        } else {
            imageDistance = -(focalLength * objectDistance) / (objectDistance + focalLength);
        }

        if (isFinite(imageDistance)) {
            const imageX = lensX + imageDistance * scale;
            const magnification = -imageDistance / objectDistance;
            
            // 绘制像
            ctx.strokeStyle = magnification > 0 ? '#4361ee' : '#ff4444';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(imageX, canvas.height / 2);
            ctx.lineTo(imageX, canvas.height / 2 - 40 * magnification);
            ctx.stroke();

            document.getElementById('optics-info').innerHTML = `
                物距: ${objectDistance}cm<br>
                焦距: ${focalLength}cm<br>
                像距: ${imageDistance.toFixed(1)}cm<br>
                放大倍数: ${magnification.toFixed(2)}<br>
                像的性质: ${magnification > 0 ? '正立' : '倒立'}，${Math.abs(magnification) > 1 ? '放大' : '缩小'}
            `;
        } else {
            document.getElementById('optics-info').innerHTML = `
                物距: ${objectDistance}cm<br>
                焦距: ${focalLength}cm<br>
                无法成像（物体在焦点上）
            `;
        }
    }

    simulateInterference() {
        const canvas = this.physicsSimulator.canvases.optics;
        const ctx = this.physicsSimulator.contexts.optics;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const wavelength = parseFloat(document.getElementById('light-wavelength').value);
        const slitSpacing = parseFloat(document.getElementById('slit-spacing').value);
        const screenDistance = parseFloat(document.getElementById('screen-distance').value);

        // 绘制双缝
        const slitX = 200;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(slitX, 100);
        ctx.lineTo(slitX, canvas.height / 2 - 30);
        ctx.moveTo(slitX, canvas.height / 2 + 30);
        ctx.lineTo(slitX, canvas.height - 100);
        ctx.stroke();

        // 绘制屏幕
        const screenX = slitX + screenDistance * 100;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(screenX, 100);
        ctx.lineTo(screenX, canvas.height - 100);
        ctx.stroke();

        // 计算干涉条纹
        const k = 2 * Math.PI / wavelength;
        const slitSeparation = slitSpacing / 1000; // 转换为mm

        // 绘制干涉条纹
        for (let y = 100; y < canvas.height - 100; y += 2) {
            const screenY = y - canvas.height / 2;
            const pathDiff = slitSeparation * screenY / (screenDistance * 1000);
            const phase = k * pathDiff;
            const intensity = Math.pow(Math.cos(phase / 2), 2);
            
            const brightness = Math.floor(255 * intensity);
            ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
            ctx.fillRect(screenX - 5, y, 10, 2);
        }

        document.getElementById('optics-info').innerHTML = `
            波长: ${wavelength}nm<br>
            缝间距: ${slitSpacing}μm<br>
            屏幕距离: ${screenDistance}m<br>
            观察到明暗相间的干涉条纹
        `;
    }

    resetOpticsSimulation() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.physicsSimulator.contexts.optics.clearRect(
            0, 0, 
            this.physicsSimulator.canvases.optics.width, 
            this.physicsSimulator.canvases.optics.height
        );
        document.getElementById('optics-info').textContent = '调整参数观察光线传播规律';
    }
}

// 初始化光学模拟器
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.physicsSimulator) {
            window.opticsSimulator = new OpticsSimulator(window.physicsSimulator);
        }
    }, 100);
}); 