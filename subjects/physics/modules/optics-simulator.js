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
            'slit-spacing', 'slit-width', 'screen-distance'
        ];

        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    // 根据滑块ID获取对应的值显示元素
                    let valueElementId;
                    switch(sliderId) {
                        case 'incident-angle':
                            valueElementId = 'incident-angle-value';
                            break;
                        case 'refractive-index-1':
                            valueElementId = 'n1-value';
                            break;
                        case 'refractive-index-2':
                            valueElementId = 'n2-value';
                            break;
                        case 'focal-length':
                            valueElementId = 'focal-length-value';
                            break;
                        case 'object-distance':
                            valueElementId = 'object-distance-value';
                            break;
                        case 'light-wavelength':
                            valueElementId = 'wavelength-value';
                            break;
                        case 'slit-spacing':
                            valueElementId = 'slit-spacing-value';
                            break;
                        case 'slit-width':
                            valueElementId = 'slit-width-value';
                            break;
                        case 'screen-distance':
                            valueElementId = 'screen-distance-value';
                            break;
                    }
                    
                    const valueSpan = document.getElementById(valueElementId);
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
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set up animation
        this.isRunning = true;
        const incidentAngle = parseFloat(document.getElementById('incident-angle').value) * Math.PI / 180;
        const mirrorType = document.getElementById('mirror-type').value;
        
        // Create scene environment
        const drawBackground = () => {
            // Draw a gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add some stars for atmosphere
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const radius = Math.random() * 1.5;
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        };
        
        // Initialize light rays
        const rays = [];
        const rayCount = 7; // Multiple rays for better visualization
        const raySpacing = 20;
        const rayColors = [
            'rgba(255, 0, 0, 0.8)',   // Red
            'rgba(255, 165, 0, 0.8)',  // Orange
            'rgba(255, 255, 0, 0.8)',  // Yellow
            'rgba(0, 255, 0, 0.8)',    // Green
            'rgba(0, 0, 255, 0.8)',    // Blue
            'rgba(75, 0, 130, 0.8)',   // Indigo
            'rgba(238, 130, 238, 0.8)' // Violet
        ];
        
        const animate = () => {
            if (!this.isRunning) return;
            
            // Clear and redraw scene
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();
            
            if (mirrorType === 'plane') {
                // 平面镜水平放置在画布中央
                const mirrorY = canvas.height / 2;
                
                // 绘制水平镜面
                ctx.strokeStyle = '#aaa';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(100, mirrorY);
                ctx.lineTo(canvas.width - 100, mirrorY);
                ctx.stroke();
                
                // 添加镜面高光效果
                const mirrorGradient = ctx.createLinearGradient(
                    0, mirrorY - 5,
                    0, mirrorY + 5
                );
                mirrorGradient.addColorStop(0, 'rgba(200, 200, 255, 0.1)');
                mirrorGradient.addColorStop(0.5, 'rgba(220, 220, 255, 0.3)');
                mirrorGradient.addColorStop(1, 'rgba(200, 200, 255, 0.1)');
                ctx.fillStyle = mirrorGradient;
                ctx.fillRect(100, mirrorY - 5, canvas.width - 200, 10);
                
                // 在反射点绘制法线
                const interactionX = canvas.width / 2;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(interactionX, mirrorY - 50);
                ctx.lineTo(interactionX, mirrorY + 50);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // 绘制角度标记
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(interactionX, mirrorY, 40, -Math.PI/2, -Math.PI/2 + incidentAngle, false);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(interactionX, mirrorY, 40, -Math.PI/2 - incidentAngle, -Math.PI/2, false);
                ctx.stroke();
                
                // 标记角度文本
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                const angleText = `${(incidentAngle * 180 / Math.PI).toFixed(0)}°`;
                ctx.fillText(angleText, interactionX - 10, mirrorY - 30);
                ctx.fillText(angleText, interactionX + 10, mirrorY - 30);
                
                // 绘制多条光线以增强视觉效果
                for (let i = 0; i < rayCount; i++) {
                    // 根据索引调整起点位置，创建平行光线
                    const offsetX = interactionX - (rayCount - 1) * raySpacing / 2 + i * raySpacing;
                    
                    // 计算光线路径
                    const startY = mirrorY - 200;
                    const rayIntersectionX = offsetX;
                    const rayIntersectionY = mirrorY;
                    
                    // 计算反射点
                    // 反射角等于入射角（平面镜反射时，反射角与入射角相等，但方向相反）
                    // 在水平镜面上，入射角是与垂直方向的夹角，反射后应该是向上的方向
                    const reflectedX = offsetX + Math.tan(incidentAngle) * 200;
                    const reflectedY = mirrorY - 200; // 修改这里，反射后应该向上（y值减小）
                    
                    // 绘制入射光线（带发光效果）
                    ctx.strokeStyle = rayColors[i % rayColors.length];
                    ctx.lineWidth = 3;
                    ctx.shadowColor = rayColors[i % rayColors.length];
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.moveTo(offsetX - Math.tan(incidentAngle) * 200, startY);
                    ctx.lineTo(rayIntersectionX, rayIntersectionY);
                    ctx.stroke();
                    
                    // 绘制反射光线
                    ctx.beginPath();
                    ctx.moveTo(rayIntersectionX, rayIntersectionY);
                    ctx.lineTo(reflectedX, reflectedY);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    
                    // 为动画绘制光粒子
                    const time = Date.now() / 1000;
                    const particleCount = 5;
                    for (let j = 0; j < particleCount; j++) {
                        const t = (j / particleCount + time) % 1;
                        
                        // 入射光线上的粒子
                        const incidentStartX = offsetX - Math.tan(incidentAngle) * 200;
                        const particleX = incidentStartX + (rayIntersectionX - incidentStartX) * t;
                        const particleY = startY + (rayIntersectionY - startY) * t;
                        
                        ctx.fillStyle = rayColors[i % rayColors.length];
                        ctx.beginPath();
                        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // 反射光线上的粒子
                        const reflectedParticleX = rayIntersectionX + (reflectedX - rayIntersectionX) * t;
                        const reflectedParticleY = rayIntersectionY + (reflectedY - rayIntersectionY) * t;
                        
                        ctx.beginPath();
                        ctx.arc(reflectedParticleX, reflectedParticleY, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } else if (mirrorType === 'concave') {
                // Concave mirror radius and center
                const mirrorRadius = 300;
                const centerX = canvas.width / 2 + mirrorRadius;
                const centerY = canvas.height / 2;
                
                // Draw concave mirror
                ctx.strokeStyle = '#aaa';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(centerX, centerY, mirrorRadius, Math.PI - 0.5, Math.PI + 0.5);
                ctx.stroke();
                
                // Add mirror highlight
                ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, mirrorRadius - 2, Math.PI - 0.5, Math.PI + 0.5);
                ctx.stroke();
                
                // Mirror axis
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(centerX - mirrorRadius - 50, centerY);
                ctx.lineTo(centerX, centerY);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Focal point (f = R/2)
                const focalX = centerX - mirrorRadius / 2;
                const focalY = centerY;
                
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.beginPath();
                ctx.arc(focalX, focalY, 5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('F', focalX, focalY - 10);
                
                // Draw light rays
                for (let i = 0; i < rayCount; i++) {
                    const offsetY = centerY - (rayCount - 1) * raySpacing / 2 + i * raySpacing;
                    const incomingAngle = Math.atan2(offsetY - centerY, -200);
                    
                    // Find intersection with mirror
                    const dx = centerX - (centerX - mirrorRadius - 200);
                    const dy = centerY - offsetY;
                    const a = dx * dx + dy * dy;
                    const b = 2 * (dx * (centerX - mirrorRadius - 200 - centerX) + dy * (offsetY - centerY));
                    const c = Math.pow(centerX - mirrorRadius - 200 - centerX, 2) + Math.pow(offsetY - centerY, 2) - mirrorRadius * mirrorRadius;
                    
                    const discriminant = b * b - 4 * a * c;
                    if (discriminant >= 0) {
                        const t = (-b + Math.sqrt(discriminant)) / (2 * a);
                        const intersectionX = (centerX - mirrorRadius - 200) + t * dx;
                        const intersectionY = offsetY + t * dy;
                        
                        // Calculate normal at intersection
                        const normalAngle = Math.atan2(intersectionY - centerY, intersectionX - centerX);
                        
                        // Calculate reflection angle
                        const reflectionAngle = 2 * normalAngle - incomingAngle - Math.PI;
                        
                        // Draw incoming ray
                        ctx.strokeStyle = rayColors[i % rayColors.length];
                        ctx.lineWidth = 2;
                        ctx.shadowColor = rayColors[i % rayColors.length];
                        ctx.shadowBlur = 5;
                        ctx.beginPath();
                        ctx.moveTo(centerX - mirrorRadius - 200, offsetY);
                        ctx.lineTo(intersectionX, intersectionY);
                        ctx.stroke();
                        
                        // Draw reflected ray
                        const reflectedLength = 300;
                        const reflectedEndX = intersectionX + Math.cos(reflectionAngle) * reflectedLength;
                        const reflectedEndY = intersectionY + Math.sin(reflectionAngle) * reflectedLength;
                        
                        ctx.beginPath();
                        ctx.moveTo(intersectionX, intersectionY);
                        ctx.lineTo(reflectedEndX, reflectedEndY);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        
                        // Animated particles
                        const time = Date.now() / 1000;
                        const particleCount = 5;
                        for (let j = 0; j < particleCount; j++) {
                            const t = (j / particleCount + time) % 1;
                            
                            // Particles on incoming ray
                            const particleX = (centerX - mirrorRadius - 200) + (intersectionX - (centerX - mirrorRadius - 200)) * t;
                            const particleY = offsetY + (intersectionY - offsetY) * t;
                            
                            ctx.fillStyle = rayColors[i % rayColors.length];
                            ctx.beginPath();
                            ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                            ctx.fill();
                            
                            // Particles on reflected ray
                            const reflectedParticleX = intersectionX + (reflectedEndX - intersectionX) * t;
                            const reflectedParticleY = intersectionY + (reflectedEndY - intersectionY) * t;
                            
                            ctx.beginPath();
                            ctx.arc(reflectedParticleX, reflectedParticleY, 2, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            } else if (mirrorType === 'convex') {
                // Convex mirror radius and center
                const mirrorRadius = 300;
                const centerX = canvas.width / 2 - mirrorRadius;
                const centerY = canvas.height / 2;
                
                // Draw convex mirror
                ctx.strokeStyle = '#aaa';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(centerX, centerY, mirrorRadius, -0.5, 0.5);
                ctx.stroke();
                
                // Add mirror highlight
                ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, mirrorRadius - 2, -0.5, 0.5);
                ctx.stroke();
                
                // Mirror axis
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + mirrorRadius + 50, centerY);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Focal point (virtual, f = -R/2)
                const focalX = centerX + mirrorRadius / 2;
                const focalY = centerY;
                
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.beginPath();
                ctx.arc(focalX, focalY, 5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('F', focalX, focalY - 10);
                
                // Draw light rays
                for (let i = 0; i < rayCount; i++) {
                    const offsetY = centerY - (rayCount - 1) * raySpacing / 2 + i * raySpacing;
                    
                    // Find intersection with mirror
                    const startX = centerX + mirrorRadius + 200;
                    const startY = offsetY;
                    const dx = startX - centerX;
                    const dy = startY - centerY;
                    const direction = Math.atan2(dy, dx);
                    
                    // Calculate intersection
                    const intersectionX = centerX + Math.cos(direction) * mirrorRadius;
                    const intersectionY = centerY + Math.sin(direction) * mirrorRadius;
                    
                    // Calculate normal at intersection (points outward from center)
                    const normalAngle = Math.atan2(intersectionY - centerY, intersectionX - centerX);
                    
                    // Calculate reflection angle
                    const incomingAngle = Math.PI + direction;
                    const reflectionAngle = 2 * normalAngle - incomingAngle;
                    
                    // Draw incoming ray
                    ctx.strokeStyle = rayColors[i % rayColors.length];
                    ctx.lineWidth = 2;
                    ctx.shadowColor = rayColors[i % rayColors.length];
                    ctx.shadowBlur = 5;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(intersectionX, intersectionY);
                    ctx.stroke();
                    
                    // Draw reflected ray
                    const reflectedLength = 300;
                    const reflectedEndX = intersectionX + Math.cos(reflectionAngle) * reflectedLength;
                    const reflectedEndY = intersectionY + Math.sin(reflectionAngle) * reflectedLength;
                    
                    ctx.beginPath();
                    ctx.moveTo(intersectionX, intersectionY);
                    ctx.lineTo(reflectedEndX, reflectedEndY);
                    ctx.stroke();
                    
                    // Draw virtual ray (dashed)
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(intersectionX, intersectionY);
                    ctx.lineTo(intersectionX - Math.cos(reflectionAngle) * 150, intersectionY - Math.sin(reflectionAngle) * 150);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.shadowBlur = 0;
                    
                    // Animated particles
                    const time = Date.now() / 1000;
                    const particleCount = 5;
                    for (let j = 0; j < particleCount; j++) {
                        const t = (j / particleCount + time) % 1;
                        
                        // Particles on incoming ray
                        const particleX = startX + (intersectionX - startX) * t;
                        const particleY = startY + (intersectionY - startY) * t;
                        
                        ctx.fillStyle = rayColors[i % rayColors.length];
                        ctx.beginPath();
                        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Particles on reflected ray
                        const reflectedParticleX = intersectionX + (reflectedEndX - intersectionX) * t;
                        const reflectedParticleY = intersectionY + (reflectedEndY - intersectionY) * t;
                        
                        ctx.beginPath();
                        ctx.arc(reflectedParticleX, reflectedParticleY, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            
            // Update info
            document.getElementById('optics-info').innerHTML = `
                <strong>反射定律：入射角 = 反射角</strong><br>
                入射角: ${(incidentAngle * 180 / Math.PI).toFixed(1)}°<br>
                反射角: ${(incidentAngle * 180 / Math.PI).toFixed(1)}°<br>
                镜面类型: ${mirrorType === 'plane' ? '平面镜 (反射后方向改变)' : 
                           mirrorType === 'concave' ? '凹面镜 (会聚光线)' : 
                           '凸面镜 (发散光线)'}
            `;
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    simulateRefraction() {
        const canvas = this.physicsSimulator.canvases.optics;
        const ctx = this.physicsSimulator.contexts.optics;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up animation
        this.isRunning = true;
        const incidentAngle = parseFloat(document.getElementById('incident-angle').value) * Math.PI / 180;
        const n1 = parseFloat(document.getElementById('refractive-index-1').value);
        const n2 = parseFloat(document.getElementById('refractive-index-2').value);

        // Calculate refracted angle using Snell's law
        const sinRefracted = (n1 / n2) * Math.sin(incidentAngle);
        let refractedAngle;
        let totalInternalReflection = false;
        
        if (sinRefracted > 1) {
            // Total internal reflection
            refractedAngle = 0;
            totalInternalReflection = true;
        } else {
            refractedAngle = Math.asin(sinRefracted);
        }

        // Set up the scene
        const drawBackground = () => {
            // Create a gradient for better visualization
            const upperGradient = ctx.createLinearGradient(0, 0, 0, canvas.height/2);
            upperGradient.addColorStop(0, '#001f3f');
            upperGradient.addColorStop(1, '#003366');
            
            const lowerGradient = ctx.createLinearGradient(0, canvas.height/2, 0, canvas.height);
            lowerGradient.addColorStop(0, '#006699');
            lowerGradient.addColorStop(1, '#0099cc');
            
            // Draw upper medium (n1)
            ctx.fillStyle = upperGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height/2);
            
            // Draw lower medium (n2)
            ctx.fillStyle = lowerGradient;
            ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
            
            // Draw interface line with subtle wave effect
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            // Create a subtle wave effect on the interface
            for (let x = 0; x < canvas.width; x += 5) {
                const y = canvas.height/2 + Math.sin(x/30) * 2;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Label the media
            ctx.font = '16px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.textAlign = 'left';
            ctx.fillText(`Medium 1 (n₁ = ${n1.toFixed(1)})`, 20, 40);
            ctx.fillText(`Medium 2 (n₂ = ${n2.toFixed(1)})`, 20, canvas.height - 40);
        };
        
        // Initialize light rays with different colors for better visualization
        const rayCount = 7; // Number of parallel rays
        const raySpacing = 15; // Space between rays
        const rayColors = [
            'rgba(255, 0, 0, 0.8)',   // Red
            'rgba(255, 165, 0, 0.8)',  // Orange
            'rgba(255, 255, 0, 0.8)',  // Yellow
            'rgba(0, 255, 0, 0.8)',    // Green
            'rgba(0, 0, 255, 0.8)',    // Blue
            'rgba(75, 0, 130, 0.8)',   // Indigo
            'rgba(238, 130, 238, 0.8)' // Violet
        ];
        
        const animate = () => {
            if (!this.isRunning) return;
            
            // Clear and redraw scene
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();
            
            // Draw normal line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(canvas.width/2, canvas.height/2 - 100);
            ctx.lineTo(canvas.width/2, canvas.height/2 + 100);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Label the normal
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Normal', canvas.width/2, canvas.height/2 - 110);
            
            // Draw angle markers
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 40, Math.PI - incidentAngle, Math.PI, false);
            ctx.stroke();
            ctx.fillText(`θ₁ = ${(incidentAngle * 180 / Math.PI).toFixed(1)}°`, 
                         canvas.width/2 - 60, canvas.height/2 - 20);
            
            if (!totalInternalReflection) {
                ctx.beginPath();
                ctx.arc(canvas.width/2, canvas.height/2, 40, Math.PI, Math.PI + refractedAngle, false);
                ctx.stroke();
                ctx.fillText(`θ₂ = ${(refractedAngle * 180 / Math.PI).toFixed(1)}°`, 
                             canvas.width/2 - 60, canvas.height/2 + 40);
            }
            
            // Draw multiple light rays
            for (let i = 0; i < rayCount; i++) {
                // Calculate ray offset for parallel rays
                const offsetX = (i - Math.floor(rayCount/2)) * raySpacing;
                
                // Calculate start point of incoming ray
                const startX = canvas.width/2 + offsetX - 200 * Math.sin(incidentAngle);
                const startY = canvas.height/2 - 200 * Math.cos(incidentAngle);
                
                // Calculate intersection point with interface
                const intersectionX = canvas.width/2 + offsetX;
                const intersectionY = canvas.height/2;
                
                // Draw incoming ray with glow effect
                ctx.strokeStyle = rayColors[i % rayColors.length];
                ctx.lineWidth = 2;
                ctx.shadowColor = rayColors[i % rayColors.length];
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(intersectionX, intersectionY);
                ctx.stroke();
                
                // Determine if we have total internal reflection
                if (totalInternalReflection) {
                    // Draw reflected ray (total internal reflection)
                    const reflectedX = intersectionX + 200 * Math.sin(incidentAngle);
                    const reflectedY = intersectionY - 200 * Math.cos(incidentAngle);
                    
                    ctx.beginPath();
                    ctx.moveTo(intersectionX, intersectionY);
                    ctx.lineTo(reflectedX, reflectedY);
                    ctx.stroke();
                    
                    // Animated particles for incoming ray
                    const time = Date.now() / 1000;
                    const particleCount = 5;
                    for (let j = 0; j < particleCount; j++) {
                        const t = (j / particleCount + time) % 1;
                        
                        // Particles on incoming ray
                        const particleX = startX + (intersectionX - startX) * t;
                        const particleY = startY + (intersectionY - startY) * t;
                        
                        ctx.fillStyle = rayColors[i % rayColors.length];
                        ctx.beginPath();
                        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Particles on reflected ray
                        const reflectedParticleX = intersectionX + (reflectedX - intersectionX) * t;
                        const reflectedParticleY = intersectionY + (reflectedY - intersectionY) * t;
                        
                        ctx.beginPath();
                        ctx.arc(reflectedParticleX, reflectedParticleY, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Draw refracted ray
                    const refractedX = intersectionX + 200 * Math.sin(refractedAngle);
                    const refractedY = intersectionY + 200 * Math.cos(refractedAngle);
                    
                    ctx.beginPath();
                    ctx.moveTo(intersectionX, intersectionY);
                    ctx.lineTo(refractedX, refractedY);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    
                    // Also draw partial reflected ray (Fresnel effect)
                    const fresnelReflectionCoefficient = calculateFresnelReflection(incidentAngle, refractedAngle, n1, n2);
                    
                    // Only draw reflected ray if reflection is significant
                    if (fresnelReflectionCoefficient > 0.05) {
                        const reflectedX = intersectionX + 150 * Math.sin(incidentAngle);
                        const reflectedY = intersectionY - 150 * Math.cos(incidentAngle);
                        
                        // Use alpha to represent intensity of reflection
                        const reflectionAlpha = fresnelReflectionCoefficient * 0.7;
                        const baseColor = rayColors[i % rayColors.length];
                        const transparentColor = baseColor.replace('0.8', reflectionAlpha.toFixed(2));
                        
                        ctx.strokeStyle = transparentColor;
                        ctx.beginPath();
                        ctx.moveTo(intersectionX, intersectionY);
                        ctx.lineTo(reflectedX, reflectedY);
                        ctx.stroke();
                    }
                    
                    // Animated particles
                    const time = Date.now() / 1000;
                    const particleCount = 5;
                    for (let j = 0; j < particleCount; j++) {
                        const t = (j / particleCount + time) % 1;
                        
                        // Particles on incoming ray
                        const particleX = startX + (intersectionX - startX) * t;
                        const particleY = startY + (intersectionY - startY) * t;
                        
                        ctx.fillStyle = rayColors[i % rayColors.length];
                        ctx.beginPath();
                        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Particles on refracted ray
                        const refractedParticleX = intersectionX + (refractedX - intersectionX) * t;
                        const refractedParticleY = intersectionY + (refractedY - intersectionY) * t;
                        
                        ctx.beginPath();
                        ctx.arc(refractedParticleX, refractedParticleY, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            
            // Add visual indicator for wave speed difference
            const wavesTopCount = 10;
            const wavesBottomCount = wavesTopCount * (n1 / n2);
            
            for (let i = 0; i < wavesTopCount; i++) {
                const x = 50 + i * (canvas.width - 100) / wavesTopCount;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, 50, 10, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            for (let i = 0; i < wavesBottomCount; i++) {
                const x = 50 + i * (canvas.width - 100) / wavesBottomCount;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, canvas.height - 50, 10, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Display information about refraction
            if (totalInternalReflection) {
                document.getElementById('optics-info').innerHTML = `
                    <strong>折射定律 (斯涅尔定律)</strong>: n₁sin(θ₁) = n₂sin(θ₂)<br>
                    <strong>入射角</strong>: ${(incidentAngle * 180 / Math.PI).toFixed(1)}°<br>
                    <strong>折射率</strong>: n₁ = ${n1}, n₂ = ${n2}<br>
                    <strong>发生全反射!</strong> (临界角: ${(Math.asin(n2/n1) * 180 / Math.PI).toFixed(1)}°)<br>
                    <strong>全反射</strong>: 当光从高折射率介质射向低折射率介质，且入射角大于临界角时发生
                `;
            } else {
                const criticalAngle = n2 < n1 ? Math.asin(n2/n1) * 180 / Math.PI : 'N/A';
                document.getElementById('optics-info').innerHTML = `
                    <strong>折射定律 (斯涅尔定律)</strong>: n₁sin(θ₁) = n₂sin(θ₂)<br>
                    <strong>入射角</strong>: ${(incidentAngle * 180 / Math.PI).toFixed(1)}°<br>
                    <strong>折射角</strong>: ${(refractedAngle * 180 / Math.PI).toFixed(1)}°<br>
                    <strong>折射率</strong>: n₁ = ${n1}, n₂ = ${n2}<br>
                    <strong>临界角</strong>: ${criticalAngle === 'N/A' ? '无 (n₁ < n₂)' : criticalAngle + '°'}<br>
                    <strong>相对折射率</strong>: n₂/n₁ = ${(n2/n1).toFixed(3)}
                `;
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        // Helper function to calculate Fresnel reflection coefficient
        function calculateFresnelReflection(theta1, theta2, n1, n2) {
            // Calculate reflection coefficient using Fresnel equations (simplified)
            const Rs = Math.pow((n1 * Math.cos(theta1) - n2 * Math.cos(theta2)) / 
                               (n1 * Math.cos(theta1) + n2 * Math.cos(theta2)), 2);
            
            const Rp = Math.pow((n1 * Math.cos(theta2) - n2 * Math.cos(theta1)) / 
                               (n1 * Math.cos(theta2) + n2 * Math.cos(theta1)), 2);
            
            // Average of s and p polarization
            return (Rs + Rp) / 2;
        }
        
        animate();
    }

    simulateLens() {
        const canvas = this.physicsSimulator.canvases.optics;
        const ctx = this.physicsSimulator.contexts.optics;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up animation
        this.isRunning = true;
        const focalLength = parseFloat(document.getElementById('focal-length').value);
        const objectDistance = parseFloat(document.getElementById('object-distance').value);
        const lensType = document.getElementById('lens-type').value;

        // Center of the lens and scale factor for visualization
        const lensX = canvas.width / 2;
        const lensY = canvas.height / 2;
        const scale = 5; // pixels per cm
        
        // Animation variables
        let time = 0;
        
        // Create color channels for chromatic aberration
        const colors = [
            {name: 'Red', rgb: '#ff3333', wavelength: 650, focusOffset: 0.04},
            {name: 'Green', rgb: '#33ff33', wavelength: 550, focusOffset: 0.02},
            {name: 'Blue', rgb: '#3333ff', wavelength: 450, focusOffset: 0}
        ];
        
        // Draw the scene
        const drawBackground = () => {
            ctx.save();
            
            // 使用简洁的渐变背景，移除星星和噪点
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#080820'); // 更深的蓝色，更少的紫色
            gradient.addColorStop(1, '#101040'); // 更深的蓝色，更少的紫色
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 只保留最基本的参考线，降低透明度使其更不显眼
            ctx.strokeStyle = 'rgba(100, 100, 255, 0.05)';
            ctx.lineWidth = 0.5;
            
            // 简化网格线，只绘制水平和垂直参考线
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
                
            // 水平主轴线
                ctx.beginPath();
            ctx.moveTo(20, centerY);
            ctx.lineTo(canvas.width - 20, centerY);
            ctx.stroke();
            
            // 垂直辅助线
            ctx.beginPath();
            ctx.moveTo(centerX, 20);
            ctx.lineTo(centerX, canvas.height - 20);
            ctx.stroke();
            
            // 几条简单的辅助线，间距更大，数量更少
            for (let i = 150; i < canvas.height; i += 150) {
                if (i !== centerY) { // 避免与主轴重叠
                ctx.beginPath();
                    ctx.moveTo(50, i);
                    ctx.lineTo(canvas.width - 50, i);
                ctx.stroke();
                }
            }
            
            for (let i = 150; i < canvas.width; i += 150) {
                if (i !== centerX) { // 避免与主轴重叠
                ctx.beginPath();
                    ctx.moveTo(i, 50);
                    ctx.lineTo(i, canvas.height - 50);
                ctx.stroke();
                }
            }
            
            ctx.restore();
        };
        
        // Calculate image properties for each color (chromatic aberration)
        const calculateImageProperties = (focusAdjustment = 0) => {
            const adjustedFocalLength = focalLength * (1 + focusAdjustment);
            let imageDistance, magnification, imageHeight;
            
            if (lensType === 'convex') {
                // For convex lens using lens equation: 1/f = 1/do + 1/di
                if (objectDistance === adjustedFocalLength) {
                    // Special case: object at focal point produces image at infinity
                    imageDistance = null;
                    magnification = Infinity;
                    imageHeight = null;
                } else {
                    imageDistance = (adjustedFocalLength * objectDistance) / (objectDistance - adjustedFocalLength);
                    magnification = -imageDistance / objectDistance;
                    imageHeight = magnification * 50; // Assuming object height of 50px
                }
            } else {
                // For concave lens
                imageDistance = (adjustedFocalLength * objectDistance) / (objectDistance + Math.abs(adjustedFocalLength));
                magnification = -imageDistance / objectDistance;
                imageHeight = magnification * 50; // Assuming object height of 50px
            }
            
            return { imageDistance, magnification, imageHeight };
        };
        
        // Default image properties (for green light)
        const defaultProps = calculateImageProperties();
        
        // Object position
        const objectX = lensX - objectDistance * scale;
        
        // Main animation loop
        const animate = () => {
            if (!this.isRunning) return;
            
            // Update time for animation
            time += 0.02;
            
            // Clear and redraw background
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();
            
            // Draw optical axis
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(20, lensY);
            ctx.lineTo(canvas.width - 20, lensY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw lens with 3D effect
            if (lensType === 'convex') {
                // Draw biconvex lens with enhanced 3D effect
                // Glass material gradient
                const lensGradient = ctx.createRadialGradient(
                    lensX, lensY, 10,
                    lensX, lensY, 60
                );
                lensGradient.addColorStop(0, 'rgba(220, 240, 255, 0.8)');
                lensGradient.addColorStop(0.5, 'rgba(160, 220, 255, 0.6)');
                lensGradient.addColorStop(0.8, 'rgba(120, 200, 255, 0.4)');
                lensGradient.addColorStop(1, 'rgba(100, 180, 255, 0.2)');
                
                ctx.fillStyle = lensGradient;
                ctx.beginPath();
                
                // Left curve of biconvex lens with more pronounced curvature
                ctx.moveTo(lensX, lensY - 70);
                ctx.quadraticCurveTo(lensX - 35, lensY, lensX, lensY + 70);
                
                // Right curve of biconvex lens
                ctx.quadraticCurveTo(lensX + 35, lensY, lensX, lensY - 70);
                
                ctx.fill();
                
                // Draw lens outline with metallic frame effect
                const frameGradient = ctx.createLinearGradient(lensX - 40, lensY - 70, lensX + 40, lensY + 70);
                frameGradient.addColorStop(0, '#aabbc8');
                frameGradient.addColorStop(0.5, '#889cb2');
                frameGradient.addColorStop(1, '#667d94');
                
                ctx.strokeStyle = frameGradient;
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Add light reflections for 3D glass effect
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 1;
                
                // Top highlight
                ctx.beginPath();
                ctx.moveTo(lensX - 15, lensY - 60);
                ctx.quadraticCurveTo(lensX, lensY - 40, lensX + 15, lensY - 60);
                ctx.stroke();
                
                // Bottom highlight
                ctx.beginPath();
                ctx.moveTo(lensX - 10, lensY + 40);
                ctx.quadraticCurveTo(lensX, lensY + 50, lensX + 10, lensY + 40);
                ctx.stroke();
                
                // Left side highlight
                ctx.beginPath();
                ctx.moveTo(lensX - 25, lensY - 20);
                ctx.quadraticCurveTo(lensX - 30, lensY, lensX - 25, lensY + 20);
                ctx.stroke();
                
                // Lens thickness effect (sides)
                ctx.fillStyle = 'rgba(160, 220, 255, 0.3)';
                ctx.beginPath();
                ctx.ellipse(lensX, lensY - 70, 5, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.ellipse(lensX, lensY + 70, 5, 2, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Draw biconcave lens with enhanced 3D effect
                // Glass material gradient
                const lensGradient = ctx.createRadialGradient(
                    lensX, lensY, 60,
                    lensX, lensY, 10
                );
                lensGradient.addColorStop(0, 'rgba(220, 240, 255, 0.8)');
                lensGradient.addColorStop(0.3, 'rgba(160, 220, 255, 0.6)');
                lensGradient.addColorStop(0.6, 'rgba(120, 200, 255, 0.4)');
                lensGradient.addColorStop(1, 'rgba(100, 180, 255, 0.2)');
                
                // Draw the lens in multiple parts for 3D effect
                // Lens frame
                ctx.fillStyle = 'rgba(120, 160, 200, 0.6)';
                ctx.beginPath();
                ctx.rect(lensX - 20, lensY - 70, 40, 140);
                ctx.fill();
                
                // Cut out the concave parts
                ctx.fillStyle = lensGradient;
                
                // Left concave surface
                ctx.beginPath();
                ctx.moveTo(lensX - 20, lensY - 70);
                ctx.lineTo(lensX - 20, lensY + 70);
                ctx.quadraticCurveTo(lensX + 20, lensY, lensX - 20, lensY - 70);
                ctx.fill();
                
                // Right concave surface
                ctx.beginPath();
                ctx.moveTo(lensX + 20, lensY - 70);
                ctx.lineTo(lensX + 20, lensY + 70);
                ctx.quadraticCurveTo(lensX - 20, lensY, lensX + 20, lensY - 70);
                ctx.fill();
                
                // Frame outline
                const frameGradient = ctx.createLinearGradient(lensX - 25, lensY - 70, lensX + 25, lensY + 70);
                frameGradient.addColorStop(0, '#aabbc8');
                frameGradient.addColorStop(0.5, '#889cb2');
                frameGradient.addColorStop(1, '#667d94');
                
                ctx.strokeStyle = frameGradient;
                ctx.lineWidth = 3;
                
                // Left edge
                ctx.beginPath();
                ctx.moveTo(lensX - 20, lensY - 70);
                ctx.lineTo(lensX - 20, lensY + 70);
                ctx.stroke();
                
                // Right edge
                ctx.beginPath();
                ctx.moveTo(lensX + 20, lensY - 70);
                ctx.lineTo(lensX + 20, lensY + 70);
                ctx.stroke();
                
                // Top and bottom edges
                ctx.beginPath();
                ctx.moveTo(lensX - 20, lensY - 70);
                ctx.lineTo(lensX + 20, lensY - 70);
                ctx.moveTo(lensX - 20, lensY + 70);
                ctx.lineTo(lensX + 20, lensY + 70);
                ctx.stroke();
                
                // Lens concave surface outlines
                ctx.strokeStyle = 'rgba(160, 220, 255, 0.8)';
                ctx.lineWidth = 1;
                
                // Left concave
                ctx.beginPath();
                ctx.moveTo(lensX - 20, lensY - 70);
                ctx.quadraticCurveTo(lensX + 20, lensY, lensX - 20, lensY + 70);
                ctx.stroke();
                
                // Right concave
                ctx.beginPath();
                ctx.moveTo(lensX + 20, lensY - 70);
                ctx.quadraticCurveTo(lensX - 20, lensY, lensX + 20, lensY + 70);
                ctx.stroke();
                
                // Add light reflections
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                
                // Left highlight
                ctx.beginPath();
                ctx.moveTo(lensX - 10, lensY - 40);
                ctx.quadraticCurveTo(lensX + 5, lensY, lensX - 10, lensY + 40);
                ctx.stroke();
            }
            
            // Draw focal points with glowing effect for each color
            colors.forEach((color, index) => {
                // Calculate focal point based on color (chromatic aberration)
                const adjustedFocalLength = focalLength * (1 - color.focusOffset);
                const f1X = lensX - adjustedFocalLength * scale;
                const f2X = lensX + adjustedFocalLength * scale;
                
                // Draw focal points with glow
                const glowRadius = 5 + Math.sin(time * 3 + index) * 2;
                
                // Glowing effect
                const glow = ctx.createRadialGradient(
                    f1X, lensY, 0,
                    f1X, lensY, glowRadius * 3
                );
                glow.addColorStop(0, color.rgb);
                glow.addColorStop(0.7, `${color.rgb}66`);
                glow.addColorStop(1, `${color.rgb}00`);
                
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(f1X, lensY, glowRadius * 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Second focal point
                const glow2 = ctx.createRadialGradient(
                    f2X, lensY, 0,
                    f2X, lensY, glowRadius * 3
                );
                glow2.addColorStop(0, color.rgb);
                glow2.addColorStop(0.7, `${color.rgb}66`);
                glow2.addColorStop(1, `${color.rgb}00`);
                
                ctx.fillStyle = glow2;
                ctx.beginPath();
                ctx.arc(f2X, lensY, glowRadius * 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Central points
                ctx.fillStyle = color.rgb;
                ctx.beginPath();
                ctx.arc(f1X, lensY, glowRadius / 2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(f2X, lensY, glowRadius / 2, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Label focal points
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            const f1X = lensX - focalLength * scale;
            const f2X = lensX + focalLength * scale;
            ctx.fillText('F', f1X, lensY - 15);
            ctx.fillText('F', f2X, lensY - 15);
            
            // Draw 2F points (twice the focal length)
            const f2f1X = lensX - 2 * focalLength * scale;
            const f2f2X = lensX + 2 * focalLength * scale;
            
            // 2F points with glow
            ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
            if (f2f1X > 20) {
                const glow = ctx.createRadialGradient(f2f1X, lensY, 0, f2f1X, lensY, 15);
                glow.addColorStop(0, 'rgba(255, 165, 0, 0.8)');
                glow.addColorStop(0.7, 'rgba(255, 165, 0, 0.3)');
                glow.addColorStop(1, 'rgba(255, 165, 0, 0)');
                
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(f2f1X, lensY, 15, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
                ctx.beginPath();
                ctx.arc(f2f1X, lensY, 4, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillText('2F', f2f1X, lensY - 20);
            }
            
            if (f2f2X < canvas.width - 20) {
                const glow = ctx.createRadialGradient(f2f2X, lensY, 0, f2f2X, lensY, 15);
                glow.addColorStop(0, 'rgba(255, 165, 0, 0.8)');
                glow.addColorStop(0.7, 'rgba(255, 165, 0, 0.3)');
                glow.addColorStop(1, 'rgba(255, 165, 0, 0)');
                
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(f2f2X, lensY, 15, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
                ctx.beginPath();
                ctx.arc(f2f2X, lensY, 4, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillText('2F', f2f2X, lensY - 20);
            }
            
            // Draw object with animated glow
            const objectY = lensY - 50; // Object height is 50px
            const objectBottomY = lensY;
            
            // Object stand with animated glow
            const arrowGlow = ctx.createLinearGradient(objectX, objectBottomY, objectX, objectY);
            arrowGlow.addColorStop(0, 'rgba(255, 107, 53, 0.5)');
            arrowGlow.addColorStop(0.5, 'rgba(255, 107, 53, 0.8)');
            arrowGlow.addColorStop(1, 'rgba(255, 107, 53, 1)');
            
            ctx.strokeStyle = arrowGlow;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(objectX, objectBottomY);
            ctx.lineTo(objectX, objectY);
            ctx.stroke();
            
            // Glowing halo effect
            ctx.shadowColor = '#ff6b35';
            ctx.shadowBlur = 10 + Math.sin(time * 5) * 5;
            
            // Object arrow head with glow
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.moveTo(objectX, objectY);
            ctx.lineTo(objectX - 10, objectY + 15);
            ctx.lineTo(objectX + 10, objectY + 15);
            ctx.closePath();
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            // Label object with glow
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('Object', objectX - 15, objectY);
            
            // Draw image for each color (chromatic aberration)
            colors.forEach(color => {
                const props = calculateImageProperties(color.focusOffset);
                const { imageDistance, magnification, imageHeight } = props;
                
                if (imageDistance !== null && isFinite(imageDistance)) {
                    const imageX = lensX + imageDistance * scale;
                    
                    // Only draw if image is within canvas bounds
                    if (imageX > 20 && imageX < canvas.width - 20) {
                        const imageTopY = lensY - imageHeight;
                        
                        // Image stand (dashed if virtual, solid if real)
                        ctx.strokeStyle = color.rgb;
                        ctx.lineWidth = 2;
                        
                        if (imageDistance < 0 || (lensType === 'concave' && imageDistance > 0)) {
                            // Virtual image (dashed line)
                            ctx.setLineDash([5, 5]);
                        } else {
                            // Real image (solid line)
                            ctx.setLineDash([]);
                        }
                        
                        ctx.beginPath();
                        ctx.moveTo(imageX, lensY);
                        ctx.lineTo(imageX, imageTopY);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        
                        // Image arrow head
                        ctx.fillStyle = color.rgb;
                        ctx.beginPath();
                        if (magnification > 0) {
                            // Upright image
                            ctx.moveTo(imageX, imageTopY);
                            ctx.lineTo(imageX - 10, imageTopY + 15);
                            ctx.lineTo(imageX + 10, imageTopY + 15);
                        } else {
                            // Inverted image
                            ctx.moveTo(imageX, imageTopY);
                            ctx.lineTo(imageX - 10, imageTopY - 15);
                            ctx.lineTo(imageX + 10, imageTopY - 15);
                        }
                        ctx.closePath();
                        ctx.fill();
                    }
                }
            });
            
            // Add label for image
            if (defaultProps.imageDistance !== null && isFinite(defaultProps.imageDistance)) {
                const imageX = lensX + defaultProps.imageDistance * scale;
                if (imageX > 20 && imageX < canvas.width - 20) {
                    const imageTopY = lensY - defaultProps.imageHeight;
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText('Image', imageX + 15, imageTopY);
                }
            }
            
            // Draw principal rays with animation
            // Define ray colors
            const rayColors = [
                'rgba(255, 165, 0, 0.7)',  // Orange
                'rgba(50, 205, 50, 0.7)',   // Green
                'rgba(138, 43, 226, 0.7)'   // Purple
            ];
            
            // Get tip of the object (starting point for rays)
            const rayStartX = objectX;
            const rayStartY = objectY;
            
            // Ray 1: Parallel to axis, passes through focal point
            ctx.strokeStyle = rayColors[0];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rayStartX, rayStartY);
            ctx.lineTo(lensX, rayStartY);
            
            if (lensType === 'convex') {
                // After refraction, ray passes through second focal point
                if (objectDistance > focalLength) {
                    // Ray from second focal point to image
                    ctx.lineTo(f2X, lensY);
                    
                    if (defaultProps.imageDistance !== null && isFinite(defaultProps.imageDistance)) {
                        const imageX = lensX + defaultProps.imageDistance * scale;
                        if (imageX > 20 && imageX < canvas.width - 20) {
                            ctx.lineTo(imageX, lensY - defaultProps.imageHeight);
                        }
                    } else if (objectDistance < focalLength) {
                        // Virtual image case - ray appears to come from image
                        const virtualRayEndX = canvas.width - 20;
                        const slope = (lensY - rayStartY) / (lensX - rayStartX);
                        const virtualRayEndY = rayStartY + slope * (virtualRayEndX - rayStartX);
                        ctx.lineTo(virtualRayEndX, virtualRayEndY);
                    } else {
                        // Ray extends to edge of canvas
                        ctx.lineTo(canvas.width - 20, rayStartY - (canvas.width - 20 - lensX) * Math.tan(Math.atan2(lensY - f2X, lensY - rayStartY)));
                    }
                } else {
                    // Object inside focal length - ray diverges
                    const divergeAngle = Math.atan2(rayStartY - lensY, lensX - f1X);
                    ctx.lineTo(canvas.width - 20, lensY - Math.tan(divergeAngle) * (canvas.width - 20 - lensX));
                }
            } else {
                // Concave lens - ray diverges away from focal point
                const divergeAngle = Math.atan2(rayStartY - lensY, f1X - lensX);
                ctx.lineTo(canvas.width - 20, lensY - Math.tan(divergeAngle) * (canvas.width - 20 - lensX));
            }
            
            // Add animated particles along the ray path
            ctx.stroke();
            addParticlesAlongPath(ctx, rayStartX, rayStartY, lensX, rayStartY, time, rayColors[0]);
            
            // Ray 2: Through center of lens (no deviation)
            ctx.strokeStyle = rayColors[1];
            ctx.beginPath();
            ctx.moveTo(rayStartX, rayStartY);
            ctx.lineTo(lensX, lensY);
            
            // Extend ray to edge of canvas or image
            if (defaultProps.imageDistance !== null && isFinite(defaultProps.imageDistance)) {
                const imageX = lensX + defaultProps.imageDistance * scale;
                if (imageX > 20 && imageX < canvas.width - 20) {
                    ctx.lineTo(imageX, lensY - defaultProps.imageHeight);
                }
            } else {
                const slope = (lensY - rayStartY) / (lensX - rayStartX);
                const rayEndX = canvas.width - 20;
                const rayEndY = lensY + slope * (rayEndX - lensX);
                ctx.lineTo(rayEndX, rayEndY);
            }
            
            ctx.stroke();
            addParticlesAlongPath(ctx, rayStartX, rayStartY, lensX, lensY, time + 0.3, rayColors[1]);
            
            // Ray 3: Through focal point to lens, then parallel to axis
            ctx.strokeStyle = rayColors[2];
            ctx.beginPath();
            ctx.moveTo(rayStartX, rayStartY);
            
            if (lensType === 'convex') {
                if (objectDistance > focalLength) {
                    // Through first focal point to lens
                    const lensIntersectY = lensY - (rayStartY - lensY) * (lensX - f1X) / (rayStartX - f1X);
                    ctx.lineTo(lensX, lensIntersectY);
                    
                    // After refraction, parallel to axis
                    ctx.lineTo(canvas.width - 20, lensIntersectY);
                } else {
                    // Object inside focal length - ray diverges
                    const lensIntersectY = lensY - (rayStartY - lensY) * (lensX - rayStartX) / (f1X - rayStartX);
                    ctx.lineTo(lensX, lensIntersectY);
                    ctx.lineTo(canvas.width - 20, lensIntersectY);
                }
            } else {
                // For concave lens, ray towards focal point becomes parallel
                const virtualSlope = (lensY - rayStartY) / (f2X - rayStartX);
                const rayIntersectY = rayStartY + virtualSlope * (lensX - rayStartX);
                
                ctx.lineTo(lensX, rayIntersectY);
                ctx.lineTo(canvas.width - 20, rayIntersectY); // Parallel to axis after lens
            }
            
            ctx.stroke();
            
            // Add information panel with animated accent
            const infoX = 20;
            const infoY = 20;
            const infoWidth = 200;
            const infoHeight = 180;
            
            // Panel background with glowing border
            const borderGlow = 2 + Math.sin(time * 3) * 2;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
            
            // Animated border
            ctx.strokeStyle = `rgba(100, 180, 255, ${0.5 + Math.sin(time * 2) * 0.3})`;
            ctx.lineWidth = borderGlow;
            ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);
            
            // Panel title
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Lens Properties', infoX + infoWidth / 2, infoY + 20);
            
            // Panel content
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            
            const contentX = infoX + 10;
            let contentY = infoY + 45;
            const lineHeight = 20;
            
            ctx.fillText(`Type: ${lensType === 'convex' ? 'Convex (Converging)' : 'Concave (Diverging)'}`, contentX, contentY);
            contentY += lineHeight;
            
            ctx.fillText(`Focal Length: ${focalLength} cm`, contentX, contentY);
            contentY += lineHeight;
            
            ctx.fillText(`Object Distance: ${objectDistance} cm`, contentX, contentY);
            contentY += lineHeight;
            
            if (defaultProps.imageDistance !== null && isFinite(defaultProps.imageDistance)) {
                ctx.fillText(`Image Distance: ${Math.abs(defaultProps.imageDistance).toFixed(1)} cm`, contentX, contentY);
                contentY += lineHeight;
                
                ctx.fillText(`Magnification: ${Math.abs(defaultProps.magnification).toFixed(2)}×`, contentX, contentY);
                contentY += lineHeight;
                
                ctx.fillText(`Image Type: ${defaultProps.imageDistance < 0 ? 'Virtual' : 'Real'}`, contentX, contentY);
                contentY += lineHeight;
                
                ctx.fillText(`Orientation: ${defaultProps.magnification > 0 ? 'Upright' : 'Inverted'}`, contentX, contentY);
            } else {
                ctx.fillText(`Image: At infinity`, contentX, contentY);
            }
            
            // Update info display
            const imageInfo = defaultProps.imageDistance === null || !isFinite(defaultProps.imageDistance) 
                ? '无穷远' 
                : Math.abs(defaultProps.imageDistance).toFixed(1) + 'cm';
                
            const magnificationInfo = defaultProps.magnification !== null && isFinite(defaultProps.magnification) 
                ? Math.abs(defaultProps.magnification).toFixed(2) + 'x' 
                : '∞';
                
            document.getElementById('optics-info').innerHTML = `
                <strong>透镜类型:</strong> ${lensType === 'convex' ? '凸透镜 (会聚光线)' : '凹透镜 (发散光线)'}<br>
                <strong>焦距:</strong> ${focalLength}cm<br>
                <strong>物距:</strong> ${objectDistance}cm<br>
                <strong>像距:</strong> ${imageInfo}<br>
                <strong>放大率:</strong> ${magnificationInfo}<br>
                <strong>像的性质:</strong> ${defaultProps.magnification > 0 ? '正立' : '倒立'}, ${Math.abs(defaultProps.magnification) > 1 ? '放大' : '缩小'}<br>
                <strong>像的类型:</strong> ${defaultProps.imageDistance < 0 || (lensType === 'concave' && defaultProps.imageDistance > 0) ? '虚像' : '实像'}<br>
                <strong>色差效应:</strong> 不同波长的光有不同的焦距，造成色散现象
            `;
            
            // Continue animation
            this.animationId = requestAnimationFrame(animate);
        };
        
        // Helper function to add animated particles along a ray path
        function addParticlesAlongPath(ctx, x1, y1, x2, y2, timeOffset, color) {
            const particleCount = 5;
            const particleSize = 3;
            
            for (let i = 0; i < particleCount; i++) {
                const t = ((timeOffset * 2 + i / particleCount) % 1);
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        animate();
    }

    simulateInterference() {
        const canvas = this.physicsSimulator.canvases.optics;
        const ctx = this.physicsSimulator.contexts.optics;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up animation
        this.isRunning = true;
        
        // Get parameters from user input - 使用HTML中已有的控件
        const wavelength = parseFloat(document.getElementById('light-wavelength').value); // in nm
        const slitDistance = parseFloat(document.getElementById('slit-spacing').value); // in μm
        const slitWidth = parseFloat(document.getElementById('slit-width').value); // in μm，使用新添加的控件
        const screenDistance = parseFloat(document.getElementById('screen-distance').value); // in cm
        
        // Convert to consistent units
        const wavelengthMicrons = wavelength / 1000; // convert nm to µm
        const slitDistanceMicrons = slitDistance; // 已经是μm单位
        const slitWidthMicrons = slitWidth; // 已经是μm单位
        const screenDistanceMicrons = screenDistance * 10000; // convert cm to µm
        
        // Scale factors for visualization
        const canvasScaleFactor = 0.4; // µm to pixels
        const screenHeight = canvas.height;
        const screenPosition = canvas.width * 0.8; // position of the screen
        const sourcePosition = canvas.width * 0.15; // position of the source
        const slitPosition = canvas.width * 0.3; // position of the slits
        
        // Center of the canvas
        const centerY = canvas.height / 2;
        
        // Animation variables
        let time = 0;
        const animationSpeed = 0.05; // lower is slower
        
        // Calculate the positions of the slits
        const slit1Y = centerY - (slitDistanceMicrons * canvasScaleFactor) / 2;
        const slit2Y = centerY + (slitDistanceMicrons * canvasScaleFactor) / 2;
        
        // Track mouse position for interactive measurements
        let mouseX = 0;
        let mouseY = 0;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
        
        // Get visible spectrum colors based on wavelength
        const getColorFromWavelength = (wavelength) => {
            // Approximate visible spectrum (400-700nm)
            if (wavelength < 440) return `rgba(130, 0, 238, 0.8)`; // Violet
            if (wavelength < 490) return `rgba(0, 0, 238, 0.8)`;   // Blue
            if (wavelength < 510) return `rgba(0, 238, 238, 0.8)`; // Cyan
            if (wavelength < 580) return `rgba(0, 238, 0, 0.8)`;   // Green
            if (wavelength < 645) return `rgba(238, 238, 0, 0.8)`; // Yellow
            if (wavelength < 700) return `rgba(238, 130, 0, 0.8)`; // Orange
            return `rgba(238, 0, 0, 0.8)`;                         // Red
        };
        
        // Main color based on wavelength
        const mainColor = getColorFromWavelength(wavelength);
        
        // Animation loop
        const animate = () => {
            if (!this.isRunning) return;
            
            time += animationSpeed;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background with gradient representing air
            const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            bgGradient.addColorStop(0, '#001233');
            bgGradient.addColorStop(1, '#023e7d');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars in the background
            drawStars(ctx, canvas.width, canvas.height, 100);
            
            // Draw light source with rays
            drawLightSource(ctx, sourcePosition, centerY, time, mainColor);
            
            // Draw double slit apparatus
            drawDoubleSlit(ctx, slitPosition, centerY, slit1Y, slit2Y, slitWidthMicrons * canvasScaleFactor);
            
            // Draw screen with interference pattern
            drawScreen(ctx, screenPosition, centerY, screenHeight);
            
            // Draw wave propagation from slits
            drawWavePropagation(ctx, slitPosition, slit1Y, slit2Y, slitWidthMicrons * canvasScaleFactor, 
                                wavelengthMicrons * canvasScaleFactor, time, mainColor);
            
            // Calculate and draw the interference pattern on the screen
            drawInterferencePattern(ctx, slitPosition, screenPosition, slit1Y, slit2Y, 
                                    wavelengthMicrons, slitDistanceMicrons, screenDistanceMicrons, 
                                    canvasScaleFactor, screenHeight, mainColor);
            
            // Draw the intensity profile graph
            drawIntensityProfile(ctx, wavelengthMicrons, slitDistanceMicrons, slitWidthMicrons, 
                                screenDistanceMicrons, canvas.width, canvas.height, mainColor);
            
            // Draw measurement at mouse position if it's over the screen
            if (mouseX >= screenPosition && mouseX <= screenPosition + 10) {
                drawMeasurement(ctx, mouseY, centerY, screenPosition, wavelengthMicrons, 
                                slitDistanceMicrons, screenDistanceMicrons, canvasScaleFactor);
            }
            
            // Display formula and information
            drawFormulas(ctx, wavelength, slitDistance, slitWidth, screenDistance, canvas.width, canvas.height);
            
            // Continue the animation
            this.animationId = requestAnimationFrame(animate);
        };
        
        // Helper function to draw stars in the background
        function drawStars(ctx, width, height, count) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < count; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const radius = Math.random() * 1.5;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Helper function to draw the light source
        function drawLightSource(ctx, x, y, time, color) {
            // Source housing
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.rect(x - 30, y - 25, 60, 50);
            ctx.fill();
            
            // Light source with glow
            const glowRadius = 15 + Math.sin(time * 2) * 5;
            const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
            glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            glow.addColorStop(0.2, color);
            glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw emerging light beam
            ctx.fillStyle = `${color.slice(0, -2)}0.3)`;
            ctx.beginPath();
            ctx.moveTo(x, y - 20);
            ctx.lineTo(x + (slitPosition - x) * 0.8, y - 80);
            ctx.lineTo(x + (slitPosition - x) * 0.8, y + 80);
            ctx.lineTo(x, y + 20);
            ctx.closePath();
            ctx.fill();
            
            // Animate light particles in the beam
            ctx.fillStyle = color;
            for (let i = 0; i < 15; i++) {
                const t = (time * 3 + i / 15) % 1;
                const particleX = x + (slitPosition - x - 20) * t;
                const particleWidth = (slitPosition - x - 20) * 0.05;
                const maxHeight = 40 * t;
                const particleY = y + (Math.random() * 2 - 1) * maxHeight;
                
                ctx.beginPath();
                ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Label
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Monochromatic', x, y - 35);
            ctx.fillText('Light Source', x, y - 15);
            ctx.fillText(`λ = ${wavelength} nm`, x, y + 40);
        }
        
        // Helper function to draw the double slit
        function drawDoubleSlit(ctx, x, centerY, slit1Y, slit2Y, slitWidth) {
            // Draw the opaque barrier
            const barrierGradient = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
            barrierGradient.addColorStop(0, '#555');
            barrierGradient.addColorStop(0.5, '#999');
            barrierGradient.addColorStop(1, '#555');
            
            ctx.fillStyle = barrierGradient;
            ctx.beginPath();
            ctx.rect(x - 10, 0, 20, centerY - slitWidth/2 - (slit2Y - slit1Y)/2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.rect(x - 10, slit1Y + slitWidth/2, 20, slit2Y - slit1Y - slitWidth);
            ctx.fill();
            
            ctx.beginPath();
            ctx.rect(x - 10, slit2Y + slitWidth/2, 20, canvas.height - (slit2Y + slitWidth/2));
            ctx.fill();
            
            // Add metallic effect to the barrier
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 10, 0);
            ctx.lineTo(x - 10, canvas.height);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.moveTo(x + 10, 0);
            ctx.lineTo(x + 10, canvas.height);
            ctx.stroke();
            
            // Highlight the slits with glowing effect
            const slitGlow = ctx.createLinearGradient(x - 15, 0, x + 15, 0);
            slitGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
            slitGlow.addColorStop(0.5, `rgba(255, 255, 255, ${0.5 + Math.sin(time * 3) * 0.3})`);
            slitGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = slitGlow;
            
            // First slit with glow
            ctx.beginPath();
            ctx.rect(x - 15, slit1Y - slitWidth/2, 30, slitWidth);
            ctx.fill();
            
            // Second slit with glow
            ctx.beginPath();
            ctx.rect(x - 15, slit2Y - slitWidth/2, 30, slitWidth);
            ctx.fill();
            
            // Labels
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Double Slit', x, 20);
            ctx.fillText(`d = ${slitDistance} mm`, x, 40);
            ctx.fillText(`w = ${slitWidth} mm`, x, 60);
            
            // Add measurements for slit distance
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x + 25, slit1Y);
            ctx.lineTo(x + 50, slit1Y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 25, slit2Y);
            ctx.lineTo(x + 50, slit2Y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + 37, slit1Y);
            ctx.lineTo(x + 37, slit2Y);
            ctx.stroke();
            
            ctx.setLineDash([]);
            ctx.fillText('d', x + 50, (slit1Y + slit2Y) / 2);
        }
        
        // Helper function to draw the screen
        function drawScreen(ctx, x, centerY, height) {
            // Draw screen with slight 3D effect
            const screenGradient = ctx.createLinearGradient(x - 5, 0, x + 15, 0);
            screenGradient.addColorStop(0, '#ddd');
            screenGradient.addColorStop(0.5, '#fff');
            screenGradient.addColorStop(1, '#ddd');
            
            ctx.fillStyle = screenGradient;
            ctx.beginPath();
            ctx.rect(x, 0, 10, height);
            ctx.fill();
            
            // Add screen border
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, 0, 10, height);
            
            // Label
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Screen', x + 5, 20);
            ctx.fillText(`L = ${screenDistance} mm`, x + 5, 40);
            
            // Distance line from slit to screen
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(slitPosition, centerY);
            ctx.lineTo(x, centerY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Label for distance
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText('L', (slitPosition + x) / 2, centerY - 10);
        }
        
        // Helper function to draw wave propagation from slits
        function drawWavePropagation(ctx, slitX, slit1Y, slit2Y, slitWidth, wavelengthPixels, time, color) {
            // Draw circular wavefronts emanating from each slit
            const maxRadius = Math.sqrt(Math.pow(canvas.width - slitX, 2) + Math.pow(canvas.height, 2));
            const numWavefronts = Math.floor(maxRadius / wavelengthPixels) + 1;
            
            // Calculate the wave amplitude decay factor
            const amplitudeDecay = (radius) => 1 / Math.sqrt(radius + 50);
            
            // Draw waves from first slit
            for (let i = 0; i < numWavefronts; i++) {
                const radius = ((time * 50) % wavelengthPixels) + i * wavelengthPixels;
                if (radius < maxRadius) {
                    const opacity = amplitudeDecay(radius) * 0.5;
                    
                    ctx.strokeStyle = `${color.slice(0, -2)}${opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(slitX, slit1Y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            
            // Draw waves from second slit
            for (let i = 0; i < numWavefronts; i++) {
                const radius = ((time * 50) % wavelengthPixels) + i * wavelengthPixels;
                if (radius < maxRadius) {
                    const opacity = amplitudeDecay(radius) * 0.5;
                    
                    ctx.strokeStyle = `${color.slice(0, -2)}${opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(slitX, slit2Y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            
            // Add wave particle animation from slits
            ctx.fillStyle = color;
            
            // Function to draw particles in a wave pattern
            const drawWaveParticles = (originX, originY) => {
                for (let angle = -80; angle <= 80; angle += 5) {
                    const angleRad = angle * Math.PI / 180;
                    
                    // Multiple particles along each angle
                    for (let i = 0; i < 5; i++) {
                        const t = (time * 2 + i / 5) % 1;
                        const distance = t * (screenPosition - slitX);
                        
                        // Sinusoidal motion along the ray
                        const x = originX + Math.cos(angleRad) * distance;
                        const baseY = originY + Math.sin(angleRad) * distance;
                        const waveY = baseY + Math.sin(t * Math.PI * 8) * wavelengthPixels * 0.2;
                        
                        // Only draw particles in front of the screen
                        if (x < screenPosition) {
                            const particleOpacity = (1 - t) * 0.8;
                            ctx.fillStyle = `${color.slice(0, -2)}${particleOpacity})`;
                            
                            ctx.beginPath();
                            ctx.arc(x, waveY, 1.2, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            };
            
            // Draw particles from both slits
            drawWaveParticles(slitX, slit1Y);
            drawWaveParticles(slitX, slit2Y);
        }
        
        // Helper function to calculate and draw the interference pattern on the screen
        function drawInterferencePattern(ctx, slitX, screenX, slit1Y, slit2Y, wavelengthMicrons, 
                                        slitDistanceMicrons, screenDistanceMicrons, scale, screenHeight, color) {
            
            // Young's double-slit interference formula
            // The path difference is: d * sin(θ) where θ is the angle from the center line
            // Constructive interference occurs when path difference = m * λ (m = 0, 1, 2, ...)
            // Distance y from center on screen: y = L * tan(θ) ≈ L * sin(θ) for small angles
            // So position of mth maximum: y = m * λ * L / d
            
            // Convert to consistent units
            const lambda = wavelengthMicrons;  // in µm
            const d = slitDistanceMicrons;     // in µm
            const L = screenDistanceMicrons;   // in µm
            
            // Prepare gradient for bright fringes based on wavelength
            const fringeGradient = ctx.createLinearGradient(screenX, 0, screenX + 10, 0);
            fringeGradient.addColorStop(0, `${color.slice(0, -2)}0.1)`);
            fringeGradient.addColorStop(0.5, color);
            fringeGradient.addColorStop(1, `${color.slice(0, -2)}0.1)`);
            
            // Calculate the center of the pattern
            const centerY = (slit1Y + slit2Y) / 2;
            
            // Draw base intensity (dim light everywhere)
            ctx.fillStyle = `${color.slice(0, -2)}0.1)`;
            ctx.fillRect(screenX, 0, 10, screenHeight);
            
            // Draw the interference pattern
            // We'll calculate the intensity at each pixel along the screen height
            const pixelsPerMicron = scale;
            const maxY = screenHeight / 2;  // Maximum distance from center to check
            
            // Single-slit diffraction envelope factor
            const sinc = (x) => {
                if (x === 0) return 1;
                return Math.sin(x) / x;
            };
            
            for (let y = -maxY; y <= maxY; y++) {
                const screenY = centerY + y;
                if (screenY >= 0 && screenY < screenHeight) {
                    // Calculate the path difference in wavelength units
                    const sinTheta = y / Math.sqrt(y * y + L * L);
                    const pathDiff = d * sinTheta;
                    
                    // Young's double-slit interference factor
                    const phaseYoung = Math.PI * pathDiff / lambda;
                    const youngFactor = Math.pow(Math.cos(phaseYoung), 2);
                    
                    // Single-slit diffraction factor
                    const slitWidthFactor = slitWidthMicrons / 1000; // in mm
                    const phaseSingle = Math.PI * slitWidthFactor * sinTheta / lambda;
                    const singleFactor = Math.pow(sinc(phaseSingle), 2);
                    
                    // Combined intensity (double-slit modulated by single-slit)
                    let intensity = youngFactor;
                    
                    // Apply small-slit diffraction envelope if slit width is small enough
                    if (slitWidthFactor < 0.1) {
                        intensity *= singleFactor;
                    }
                    
                    // Map intensity to alpha value (0 to 1)
                    const alpha = Math.pow(intensity, 0.5); // Apply gamma correction for better visibility
                    
                    // Skip drawing very dim points for performance
                    if (alpha > 0.05) {
                        ctx.fillStyle = `${color.slice(0, -2)}${alpha})`;
                        ctx.fillRect(screenX, screenY, 10, 1);
                    }
                    
                    // Add enhanced brightness for maxima
                    if (intensity > 0.8) {
                        // Glow effect for bright fringes
                        const glow = ctx.createRadialGradient(
                            screenX + 5, screenY, 0,
                            screenX + 5, screenY, 15
                        );
                        glow.addColorStop(0, `${color.slice(0, -2)}${alpha * 0.7})`);
                        glow.addColorStop(1, `${color.slice(0, -2)}0)`);
                        
                        ctx.fillStyle = glow;
                        ctx.beginPath();
                        ctx.arc(screenX + 5, screenY, 15, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            
            // Draw central maximum label
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('m = 0', screenX + 15, centerY);
            
            // Calculate and label some of the maxima
            const maxOrder = 3;
            for (let m = 1; m <= maxOrder; m++) {
                // Position of mth maximum: y = m * λ * L / d
                const yMax = m * lambda * L / d;
                const yMaxPixels = yMax * scale;
                
                // Upper maximum
                const upperY = centerY - yMaxPixels;
                if (upperY > 20 && upperY < screenHeight - 20) {
                    ctx.fillText(`m = ${m}`, screenX + 15, upperY);
                    
                    // Draw dashed line to the maximum
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    ctx.moveTo(screenX + 10, upperY);
                    ctx.lineTo(screenX + 30, upperY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                
                // Lower maximum
                const lowerY = centerY + yMaxPixels;
                if (lowerY > 20 && lowerY < screenHeight - 20) {
                    ctx.fillText(`m = -${m}`, screenX + 15, lowerY);
                    
                    // Draw dashed line to the maximum
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    ctx.moveTo(screenX + 10, lowerY);
                    ctx.lineTo(screenX + 30, lowerY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
        }
        
        // Helper function to draw the intensity profile graph
        function drawIntensityProfile(ctx, wavelengthMicrons, slitDistanceMicrons, slitWidthMicrons, 
                                    screenDistanceMicrons, canvasWidth, canvasHeight, color) {
            
            // Graph dimensions and position
            const graphWidth = canvasWidth * 0.2;
            const graphHeight = canvasHeight * 0.3;
            const graphX = canvasWidth - graphWidth - 20;
            const graphY = 20;
            
            // Draw graph background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
            
            // Draw graph border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);
            
            // Draw axes
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1;
            
            // X-axis (position)
            ctx.beginPath();
            ctx.moveTo(graphX, graphY + graphHeight / 2);
            ctx.lineTo(graphX + graphWidth, graphY + graphHeight / 2);
            ctx.stroke();
            
            // Y-axis (intensity)
            ctx.beginPath();
            ctx.moveTo(graphX, graphY + graphHeight);
            ctx.lineTo(graphX, graphY);
            ctx.stroke();
            
            // Draw axis labels
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Intensity Profile', graphX + graphWidth / 2, graphY - 5);
            
            ctx.textAlign = 'right';
            ctx.fillText('I', graphX - 5, graphY + 10);
            
            ctx.textAlign = 'center';
            ctx.fillText('Position (θ)', graphX + graphWidth / 2, graphY + graphHeight + 15);
            
            // Calculate and draw the intensity profile
            const lambda = wavelengthMicrons;
            const d = slitDistanceMicrons;
            const L = screenDistanceMicrons;
            const w = slitWidthMicrons;
            
            // Draw intensity curve
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            // Sample the intensity profile
            const samples = 100;
            const maxAngle = 0.1; // radians
            
            for (let i = 0; i <= samples; i++) {
                const theta = (i / samples) * maxAngle * 2 - maxAngle;
                const pathDiff = d * Math.sin(theta);
                
                // Young's double-slit interference factor
                const phaseYoung = Math.PI * pathDiff / lambda;
                const youngFactor = Math.pow(Math.cos(phaseYoung), 2);
                
                // Single-slit diffraction factor
                const phaseSingle = Math.PI * w * Math.sin(theta) / lambda;
                const sinc = (x) => (x === 0) ? 1 : Math.sin(x) / x;
                const singleFactor = Math.pow(sinc(phaseSingle), 2);
                
                // Combined intensity
                let intensity = youngFactor;
                
                // Apply diffraction envelope if slit width is small
                if (w < 100) {
                    intensity *= singleFactor;
                }
                
                // Map to graph coordinates
                const x = graphX + (i / samples) * graphWidth;
                const y = graphY + graphHeight - intensity * graphHeight;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Fill under the curve
            ctx.lineTo(graphX + graphWidth, graphY + graphHeight);
            ctx.lineTo(graphX, graphY + graphHeight);
            ctx.closePath();
            ctx.fillStyle = `${color.slice(0, -2)}0.3)`;
            ctx.fill();
            
            // Draw central line
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.moveTo(graphX + graphWidth / 2, graphY);
            ctx.lineTo(graphX + graphWidth / 2, graphY + graphHeight);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Helper function to draw measurement at mouse position
        function drawMeasurement(ctx, mouseY, centerY, screenX, wavelengthMicrons, slitDistanceMicrons, 
                                screenDistanceMicrons, scale) {
            // Calculate distance from center
            const yDistance = mouseY - centerY;
            const yDistanceMicrons = yDistance / scale;
            
            // Calculate angle
            const L = screenDistanceMicrons;
            const theta = Math.atan(yDistanceMicrons / L);
            const thetaDegrees = theta * 180 / Math.PI;
            
            // Calculate order of interference
            const lambda = wavelengthMicrons;
            const d = slitDistanceMicrons;
            const m = (d * Math.sin(theta)) / lambda;
            
            // Draw line to position
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(screenX + 10, mouseY);
            ctx.lineTo(screenX + 150, mouseY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw measurement text
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`y = ${yDistance.toFixed(0)} px (${(yDistanceMicrons / 1000).toFixed(2)} mm)`, screenX + 15, mouseY - 25);
            ctx.fillText(`θ = ${thetaDegrees.toFixed(2)}°`, screenX + 15, mouseY - 10);
            ctx.fillText(`m ≈ ${Math.abs(m).toFixed(2)}`, screenX + 15, mouseY + 15);
        }
        
        // Helper function to draw formulas and explanation
        function drawFormulas(ctx, wavelength, slitDistance, slitWidth, screenDistance, canvasWidth, canvasHeight) {
            // Draw a panel for formulas
            const panelWidth = 200;
            const panelHeight = 240;
            const panelX = 20;
            const panelY = 20;
            
            ctx.fillStyle = 'rgba(0, 30, 60, 0.8)';
            ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            ctx.strokeStyle = 'rgba(100, 149, 237, 0.8)';
            ctx.lineWidth = 2;
            ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
            
            // Title
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('干涉与衍射公式', panelX + panelWidth/2, panelY + 20);
            
            // Parameters
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            let y = panelY + 45;
            const lineHeight = 18;
            
            ctx.fillText(`波长 (λ): ${wavelength} nm`, panelX + 10, y);
            y += lineHeight;
            ctx.fillText(`狭缝间距 (d): ${slitDistance} μm`, panelX + 10, y);
            y += lineHeight;
            ctx.fillText(`狭缝宽度 (w): ${slitWidth} μm`, panelX + 10, y);
            y += lineHeight;
            ctx.fillText(`屏幕距离 (L): ${screenDistance} cm`, panelX + 10, y);
            
            // Formulas
            y += lineHeight * 1.5;
            ctx.fillText('干涉亮纹条件:', panelX + 10, y);
            y += lineHeight;
            ctx.fillText('d sin θ = mλ (m为整数)', panelX + 20, y);
            
            y += lineHeight * 1.5;
            ctx.fillText('衍射暗纹条件:', panelX + 10, y);
            y += lineHeight;
            ctx.fillText('w sin θ = nλ (n为非零整数)', panelX + 20, y);
            
            y += lineHeight * 1.5;
            ctx.fillText('小角度近似:', panelX + 10, y);
            y += lineHeight;
            ctx.fillText('sin θ ≈ θ ≈ y/L', panelX + 20, y);
            
            y += lineHeight * 1.5;
            ctx.fillText('条纹间距:', panelX + 10, y);
            y += lineHeight;
            ctx.fillText('Δy = λL / d', panelX + 20, y);
            
            y += lineHeight * 1.5;
            ctx.fillText('角度间距:', panelX + 10, y);
            y += lineHeight;
            ctx.fillText('Δθ = λ / d', panelX + 20, y);
            
            // Update info display
            document.getElementById('optics-info').innerHTML = `
                <strong>波长 (λ):</strong> ${wavelength} nm<br>
                <strong>狭缝间距 (d):</strong> ${slitDistance} μm<br>
                <strong>狭缝宽度 (w):</strong> ${slitWidth} μm<br>
                <strong>屏幕距离 (L):</strong> ${screenDistance} cm<br>
                <strong>干涉条纹角度间隔:</strong> ${(wavelength / 1000 / slitDistance).toFixed(6)} 弧度<br>
                <strong>中央亮纹宽度:</strong> ${(wavelength * screenDistance * 100 / slitDistance).toFixed(2)} mm<br>
                <strong>衍射包络线宽度:</strong> ${(wavelength * screenDistance * 100 / slitWidth).toFixed(2)} mm
            `;
        }
        
        // Start the animation
        animate();
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