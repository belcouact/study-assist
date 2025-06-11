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
                // Draw mirror
                ctx.strokeStyle = '#aaa';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, 100);
                ctx.lineTo(canvas.width / 2, canvas.height - 100);
                ctx.stroke();
                
                // Add mirror highlight
                const mirrorGradient = ctx.createLinearGradient(
                    canvas.width / 2 - 5, 0,
                    canvas.width / 2 + 5, 0
                );
                mirrorGradient.addColorStop(0, 'rgba(200, 200, 255, 0.1)');
                mirrorGradient.addColorStop(0.5, 'rgba(220, 220, 255, 0.3)');
                mirrorGradient.addColorStop(1, 'rgba(200, 200, 255, 0.1)');
                ctx.fillStyle = mirrorGradient;
                ctx.fillRect(canvas.width / 2 - 5, 100, 10, canvas.height - 200);
                
                // Normal line at interaction point
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 50, canvas.height / 2);
                ctx.lineTo(canvas.width / 2 + 50, canvas.height / 2);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Draw angle markings
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 40, Math.PI - incidentAngle, Math.PI, false);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, incidentAngle, false);
                ctx.stroke();
                
                // Label angles
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                const angleText = `${(incidentAngle * 180 / Math.PI).toFixed(0)}°`;
                ctx.fillText(angleText, canvas.width / 2 - 45, canvas.height / 2 - 10);
                ctx.fillText(angleText, canvas.width / 2 + 45, canvas.height / 2 - 10);
                
                // Draw multiple light rays for better visualization
                for (let i = 0; i < rayCount; i++) {
                    // Adjusting the starting point based on index to create parallel rays
                    const offsetY = canvas.height / 2 - (rayCount - 1) * raySpacing / 2 + i * raySpacing;
                    
                    // Calculate ray path
                    const startX = canvas.width / 2 - Math.tan(incidentAngle) * (offsetY - canvas.height / 2) - 200;
                    const rayIntersectionX = canvas.width / 2;
                    const rayIntersectionY = offsetY;
                    
                    // Calculate reflection point
                    const reflectedX = canvas.width / 2 + 200;
                    const reflectedY = offsetY;
                    
                    // Draw incoming ray with glow effect
                    ctx.strokeStyle = rayColors[i % rayColors.length];
                    ctx.lineWidth = 3;
                    ctx.shadowColor = rayColors[i % rayColors.length];
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.moveTo(startX, offsetY);
                    ctx.lineTo(rayIntersectionX, rayIntersectionY);
                    ctx.stroke();
                    
                    // Draw reflected ray
                    ctx.beginPath();
                    ctx.moveTo(rayIntersectionX, rayIntersectionY);
                    ctx.lineTo(reflectedX, reflectedY);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    
                    // Draw light particles for animation
                    const time = Date.now() / 1000;
                    const particleCount = 5;
                    for (let j = 0; j < particleCount; j++) {
                        const t = (j / particleCount + time) % 1;
                        
                        // Particles on incoming ray
                        const particleX = startX + (rayIntersectionX - startX) * t;
                        const particleY = offsetY + (rayIntersectionY - offsetY) * t;
                        
                        ctx.fillStyle = rayColors[i % rayColors.length];
                        ctx.beginPath();
                        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Particles on reflected ray
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
                镜面类型: ${mirrorType === 'plane' ? '平面镜' : 
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
        
        // Draw the scene
        const drawBackground = () => {
            // Create a gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#171738');
            gradient.addColorStop(1, '#2E1760');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw some grid lines for depth perception
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            
            // Vertical grid lines
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // Horizontal grid lines
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        };
        
        // Calculate image distance and properties
        let imageDistance, magnification, imageHeight;
        
        if (lensType === 'convex') {
            // For convex lens using lens equation: 1/f = 1/do + 1/di
            if (objectDistance === focalLength) {
                // Special case: object at focal point produces image at infinity
                imageDistance = null;
                magnification = Infinity;
                imageHeight = null;
            } else {
                imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
                magnification = -imageDistance / objectDistance;
                imageHeight = magnification * 50; // Assuming object height of 50px
            }
        } else {
            // For concave lens
            imageDistance = (focalLength * objectDistance) / (objectDistance + Math.abs(focalLength));
            magnification = -imageDistance / objectDistance;
            imageHeight = magnification * 50; // Assuming object height of 50px
        }
        
        // Object position
        const objectX = lensX - objectDistance * scale;
        
        // Main animation loop
        const animate = () => {
            if (!this.isRunning) return;
            
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
            
            // Draw lens
            if (lensType === 'convex') {
                // Draw biconvex lens with gradient fill for realistic appearance
                const lensGradient = ctx.createRadialGradient(
                    lensX, lensY, 10,
                    lensX, lensY, 60
                );
                lensGradient.addColorStop(0, 'rgba(133, 205, 253, 0.8)');
                lensGradient.addColorStop(0.7, 'rgba(133, 205, 253, 0.2)');
                lensGradient.addColorStop(1, 'rgba(133, 205, 253, 0.1)');
                
                ctx.fillStyle = lensGradient;
                ctx.beginPath();
                
                // Left curve of biconvex lens
                ctx.moveTo(lensX, lensY - 70);
                ctx.quadraticCurveTo(lensX - 30, lensY, lensX, lensY + 70);
                
                // Right curve of biconvex lens
                ctx.quadraticCurveTo(lensX + 30, lensY, lensX, lensY - 70);
                
                ctx.fill();
                
                // Draw lens outline for better visibility
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Add a slight highlight for 3D effect
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(lensX - 10, lensY - 60);
                ctx.quadraticCurveTo(lensX - 15, lensY, lensX - 10, lensY + 60);
                ctx.stroke();
            } else {
                // Draw biconcave lens with gradient fill
                const lensGradient = ctx.createRadialGradient(
                    lensX, lensY, 10,
                    lensX, lensY, 60
                );
                lensGradient.addColorStop(0, 'rgba(133, 205, 253, 0.2)');
                lensGradient.addColorStop(0.5, 'rgba(133, 205, 253, 0.5)');
                lensGradient.addColorStop(1, 'rgba(133, 205, 253, 0.8)');
                
                ctx.fillStyle = lensGradient;
                ctx.beginPath();
                
                // Left curve of biconcave lens
                ctx.moveTo(lensX - 15, lensY - 70);
                ctx.lineTo(lensX - 15, lensY + 70);
                ctx.quadraticCurveTo(lensX + 15, lensY, lensX - 15, lensY - 70);
                
                // Right curve of biconcave lens
                ctx.moveTo(lensX + 15, lensY - 70);
                ctx.lineTo(lensX + 15, lensY + 70);
                ctx.quadraticCurveTo(lensX - 15, lensY, lensX + 15, lensY - 70);
                
                ctx.fill();
                
                // Draw lens outline
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                ctx.moveTo(lensX - 15, lensY - 70);
                ctx.lineTo(lensX - 15, lensY + 70);
                ctx.quadraticCurveTo(lensX + 15, lensY, lensX - 15, lensY - 70);
                
                ctx.moveTo(lensX + 15, lensY - 70);
                ctx.lineTo(lensX + 15, lensY + 70);
                ctx.quadraticCurveTo(lensX - 15, lensY, lensX + 15, lensY - 70);
                
                ctx.stroke();
            }
            
            // Draw focal points
            const f1X = lensX - focalLength * scale;
            const f2X = lensX + focalLength * scale;
            
            ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(f1X, lensY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(f2X, lensY, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Label focal points
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('F', f1X, lensY - 15);
            ctx.fillText('F', f2X, lensY - 15);
            
            // Draw 2F points (twice the focal length)
            const f2f1X = lensX - 2 * focalLength * scale;
            const f2f2X = lensX + 2 * focalLength * scale;
            
            ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
            if (f2f1X > 20) {
                ctx.beginPath();
                ctx.arc(f2f1X, lensY, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillText('2F', f2f1X, lensY - 15);
            }
            
            ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
            if (f2f2X < canvas.width - 20) {
                ctx.beginPath();
                ctx.arc(f2f2X, lensY, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillText('2F', f2f2X, lensY - 15);
            }
            
            // Draw object
            const objectY = lensY - 50; // Object height is 50px
            const objectBottomY = lensY;
            
            // Object stand
            ctx.strokeStyle = '#ff6b35';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(objectX, objectBottomY);
            ctx.lineTo(objectX, objectY);
            ctx.stroke();
            
            // Object arrow head
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.moveTo(objectX, objectY);
            ctx.lineTo(objectX - 10, objectY + 15);
            ctx.lineTo(objectX + 10, objectY + 15);
            ctx.closePath();
            ctx.fill();
            
            // Label object
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('Object', objectX - 15, objectY);
            
            // Draw image if it exists and is in range
            let imageX;
            if (imageDistance !== null && isFinite(imageDistance)) {
                imageX = lensX + imageDistance * scale;
                
                // Only draw if image is within canvas bounds
                if (imageX > 20 && imageX < canvas.width - 20) {
                    const imageTopY = lensY - imageHeight;
                    
                    // Image stand (dashed if virtual, solid if real)
                    ctx.strokeStyle = magnification > 0 ? '#4361ee' : '#9c27b0';
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
                    ctx.fillStyle = magnification > 0 ? '#4361ee' : '#9c27b0';
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
                    
                    // Label image
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText('Image', imageX + 15, imageTopY);
                }
            }
            
            // Draw principal rays
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
                    
                    if (imageX && imageX > 20 && imageX < canvas.width - 20) {
                        ctx.lineTo(imageX, lensY - imageHeight);
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
            
            ctx.stroke();
            
            // Ray 2: Through center of lens (no deviation)
            ctx.strokeStyle = rayColors[1];
            ctx.beginPath();
            ctx.moveTo(rayStartX, rayStartY);
            ctx.lineTo(lensX, lensY);
            
            // Extend ray to edge of canvas or image
            if (imageX && imageX > 20 && imageX < canvas.width - 20) {
                ctx.lineTo(imageX, lensY - imageHeight);
            } else {
                const slope = (lensY - rayStartY) / (lensX - rayStartX);
                const rayEndX = canvas.width - 20;
                const rayEndY = lensY + slope * (rayEndX - lensX);
                ctx.lineTo(rayEndX, rayEndY);
            }
            
            ctx.stroke();
            
            // Ray 3: Through focal point to lens, then parallel to axis
            ctx.strokeStyle = rayColors[2];
            ctx.beginPath();
            ctx.moveTo(rayStartX, rayStartY);
            
            if (lensType === 'convex') {
                if (objectDistance > focalLength) {
                    // Through first focal point to lens
                    ctx.lineTo(lensX, lensY - (rayStartY - lensY) * (lensX - f1X) / (rayStartX - f1X));
                    
                    // After refraction, parallel to axis
                    ctx.lineTo(canvas.width - 20, lensY - (rayStartY - lensY) * (lensX - f1X) / (rayStartX - f1X));
                } else {
                    // Object inside focal length - ray diverges
                    ctx.lineTo(lensX, lensY - (rayStartY - lensY) * (lensX - rayStartX) / (f1X - rayStartX));
                    ctx.lineTo(canvas.width - 20, lensY - (rayStartY - lensY) * (lensX - rayStartX) / (f1X - rayStartX));
                }
            } else {
                // For concave lens, ray towards focal point becomes parallel
                const virtualSlope = (lensY - rayStartY) / (f2X - rayStartX);
                const rayIntersectY = rayStartY + virtualSlope * (lensX - rayStartX);
                
                ctx.lineTo(lensX, rayIntersectY);
                ctx.lineTo(canvas.width - 20, rayIntersectY); // Parallel to axis after lens
            }
            
            ctx.stroke();
            
            // Display lens information
            let imageInfo;
            if (imageDistance === null || !isFinite(imageDistance)) {
                imageInfo = 'Image at infinity';
            } else if (imageDistance < 0) {
                imageInfo = `Virtual image: ${Math.abs(imageDistance).toFixed(1)}cm behind lens`;
            } else {
                imageInfo = `Real image: ${imageDistance.toFixed(1)}cm in front of lens`;
            }
            
            document.getElementById('optics-info').innerHTML = `
                <strong>透镜类型:</strong> ${lensType === 'convex' ? '凸透镜' : '凹透镜'}<br>
                <strong>焦距:</strong> ${focalLength}cm<br>
                <strong>物距:</strong> ${objectDistance}cm<br>
                <strong>像距:</strong> ${imageDistance !== null && isFinite(imageDistance) ? Math.abs(imageDistance).toFixed(1) + 'cm' : '无穷远'}<br>
                <strong>放大率:</strong> ${magnification !== null && isFinite(magnification) ? Math.abs(magnification).toFixed(2) + 'x' : '∞'}<br>
                <strong>像的性质:</strong> ${magnification > 0 ? '正立' : '倒立'}, ${Math.abs(magnification) > 1 ? '放大' : '缩小'}<br>
                <strong>像的类型:</strong> ${imageDistance < 0 || (lensType === 'concave' && imageDistance > 0) ? '虚像' : '实像'}
            `;
            
            // Continue the animation
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    simulateInterference() {
        const canvas = this.physicsSimulator.canvases.optics;
        const ctx = this.physicsSimulator.contexts.optics;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set up animation
        this.isRunning = true;
        
        // Get parameters from controls
        const wavelength = parseFloat(document.getElementById('light-wavelength').value); // nm
        const slitSpacing = parseFloat(document.getElementById('slit-spacing').value); // μm
        const screenDistance = parseFloat(document.getElementById('screen-distance').value); // cm
        
        // Convert to consistent units (meters)
        const wavelengthM = wavelength * 1e-9; // nm to m
        const slitSpacingM = slitSpacing * 1e-6; // μm to m
        const screenDistanceM = screenDistance * 1e-2; // cm to m
        
        // Scaling factor for visualization
        const scale = 1e7; // To make nanometers visible
        
        // Calculate fringe spacing using the formula: y = (wavelength * L) / d
        // where y is distance between fringes, L is screen distance, d is slit spacing
        const fringeSpacing = (wavelengthM * screenDistanceM) / slitSpacingM;
        const fringeSpacingPx = fringeSpacing * scale;
        
        // Map wavelength to color
        const getColorFromWavelength = (wavelength) => {
            // Simple mapping from wavelength (nm) to RGB
            if (wavelength >= 380 && wavelength < 450) {
                return `rgb(${Math.floor((wavelength - 380) / 70 * 255)}, 0, 255)`;
            } else if (wavelength >= 450 && wavelength < 495) {
                return `rgb(0, 0, 255)`;
            } else if (wavelength >= 495 && wavelength < 570) {
                return `rgb(0, 255, ${Math.floor((1 - (wavelength - 495) / 75) * 255)})`;
            } else if (wavelength >= 570 && wavelength < 590) {
                return `rgb(${Math.floor((wavelength - 570) / 20 * 255)}, 255, 0)`;
            } else if (wavelength >= 590 && wavelength < 620) {
                return `rgb(255, ${Math.floor((1 - (wavelength - 590) / 30) * 255)}, 0)`;
            } else if (wavelength >= 620 && wavelength <= 750) {
                return `rgb(255, 0, 0)`;
            } else {
                return 'rgb(255, 255, 255)';
            }
        };
        
        // Get appropriate light color based on wavelength
        const lightColor = getColorFromWavelength(wavelength);
        
        // Set up animation variables
        let time = 0;
        const animationSpeed = 0.03;
        
        // Draw background
        const drawBackground = () => {
            // Create a dark gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#0D0D2B');
            gradient.addColorStop(1, '#100B2B');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        
        // Set up scene elements
        const slitX = 150;
        const slitY = canvas.height / 2;
        const slitWidth = 5; // Width of each slit in pixels
        const slitHeight = 20;
        const slitSeparationPx = 30; // Visual separation between slits
        const sourceX = 80;
        const sourceY = slitY;
        const screenX = slitX + screenDistance * 5; // Scale for visualization
        const slit1Y = slitY - slitSeparationPx/2;
        const slit2Y = slitY + slitSeparationPx/2;
        
        // Helper to draw expanding circular wavefronts
        const drawWavefronts = (x, y, propagationOffset) => {
            const maxWavefronts = 15;
            const wavefrontSpacing = 30; // Pixels between wavefronts
            
            for (let i = 0; i < maxWavefronts; i++) {
                const radius = i * wavefrontSpacing + propagationOffset % wavefrontSpacing;
                const alpha = Math.max(0, 0.5 - radius / (maxWavefronts * wavefrontSpacing));
                
                ctx.strokeStyle = `rgba(${lightColor.match(/\d+/g)[0]}, ${lightColor.match(/\d+/g)[1]}, ${lightColor.match(/\d+/g)[2]}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI);
                ctx.stroke();
            }
        };

        const animate = () => {
            if (!this.isRunning) return;
            
            // Update time for animation
            time += animationSpeed;
            
            // Clear and redraw
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();
            
            // Draw the double slit apparatus
            
            // Draw barrier
            ctx.fillStyle = '#444';
            ctx.fillRect(slitX - 10, 50, 20, canvas.height - 100);
            
            // Cut out the slits
            ctx.fillStyle = '#000';
            ctx.fillRect(slitX - slitWidth/2, slitY - slitSeparationPx/2 - slitHeight/2, slitWidth, slitHeight);
            ctx.fillRect(slitX - slitWidth/2, slitY + slitSeparationPx/2 - slitHeight/2, slitWidth, slitHeight);
            
            // Draw source with glow effect
            const sourceGradient = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, 30);
            sourceGradient.addColorStop(0, lightColor);
            sourceGradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
            sourceGradient.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.fillStyle = sourceGradient;
            ctx.beginPath();
            ctx.arc(sourceX, sourceY, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Source inner core
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(sourceX, sourceY, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw incident light rays
            ctx.strokeStyle = lightColor;
            ctx.lineWidth = 1;
            
            // Draw rays from source to slits
            const rayCount = 20;
            const rayAngleSpan = Math.PI / 4;
            
            for (let i = 0; i < rayCount; i++) {
                const angle = -rayAngleSpan/2 + rayAngleSpan * (i / (rayCount - 1));
                const rayLength = 100;
                const endX = sourceX + Math.cos(angle) * rayLength;
                const endY = sourceY + Math.sin(angle) * rayLength;
                
                // Animated particles along ray
                const particleCount = 3;
                for (let j = 0; j < particleCount; j++) {
                    const t = ((time * 3 + j / particleCount) % 1);
                    const particleX = sourceX + t * (endX - sourceX);
                    const particleY = sourceY + t * (endY - sourceY);
                    
                    ctx.fillStyle = lightColor;
                    ctx.globalAlpha = 0.7;
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                }
                
                ctx.beginPath();
                ctx.moveTo(sourceX, sourceY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            
            // Draw screen
            // Screen frame
            ctx.fillStyle = '#555';
            ctx.fillRect(screenX - 5, 50, 10, canvas.height - 100);
            
            // Screen surface (white)
            ctx.fillStyle = '#fff';
            ctx.fillRect(screenX, 50, 2, canvas.height - 100);
            
            // Label screen
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Screen', screenX, 40);
            
            // Label slits
            ctx.fillText('Double Slit', slitX, 40);
            
            // Label source
            ctx.fillText('Light Source', sourceX, 40);
            ctx.fillText(`${wavelength}nm`, sourceX, canvas.height - 30);
            
            // Animation time factor for wave propagation
            const propagationOffset = time * 100 % (2 * Math.PI);
            
            // Draw wavefronts from both slits
            drawWavefronts(slitX, slit1Y, propagationOffset);
            drawWavefronts(slitX, slit2Y, propagationOffset);
            
            // Draw the interference pattern on the screen
            const patternHeight = canvas.height - 100;
            const centerY = canvas.height / 2;
            const maxY = centerY + patternHeight / 2;
            const minY = centerY - patternHeight / 2;
            
            // Calculate and draw interference pattern
            const patternResolution = 2; // Pixels per calculation point
            
            for (let y = minY; y <= maxY; y += patternResolution) {
                // Calculate path difference
                const path1 = Math.sqrt(Math.pow(screenX - slitX, 2) + Math.pow(y - slit1Y, 2));
                const path2 = Math.sqrt(Math.pow(screenX - slitX, 2) + Math.pow(y - slit2Y, 2));
                const pathDiff = Math.abs(path1 - path2);
                
                // Convert path difference to phase difference
                const wavelengthPx = wavelength * scale / 1e9; // Scale wavelength to pixel space
                const phaseDiff = (2 * Math.PI * pathDiff) / wavelengthPx;
                
                // Calculate intensity using wave interference formula
                const amplitude1 = 1.0;
                const amplitude2 = 1.0;
                const intensity = Math.pow(amplitude1 + amplitude2 * Math.cos(phaseDiff), 2);
                
                // Apply diffraction envelope (single slit diffraction)
                const beta = (Math.PI * slitWidth * (y - centerY)) / (wavelengthPx * (screenX - slitX));
                let diffraction = 1.0;
                if (beta !== 0) {
                    diffraction = Math.pow(Math.sin(beta) / beta, 2);
                }
                
                // Combine interference and diffraction
                const combinedIntensity = intensity * diffraction;
                
                // Map intensity to color brightness
                const brightness = Math.min(255, Math.floor(255 * combinedIntensity));
                
                // Apply the actual color of the wavelength with varying intensity
                const [r, g, b] = lightColor.match(/\d+/g).map(Number);
                const color = `rgb(${Math.floor(r * combinedIntensity)}, ${Math.floor(g * combinedIntensity)}, ${Math.floor(b * combinedIntensity)})`;
                
                // Draw the interference fringe point
                ctx.fillStyle = color;
                ctx.fillRect(screenX, y, 2, patternResolution);
                
                // Draw maxima indicators
                if (y > minY + patternResolution && y < maxY - patternResolution) {
                    const prevY = y - patternResolution;
                    const prevPath1 = Math.sqrt(Math.pow(screenX - slitX, 2) + Math.pow(prevY - slit1Y, 2));
                    const prevPath2 = Math.sqrt(Math.pow(screenX - slitX, 2) + Math.pow(prevY - slit2Y, 2));
                    const prevPathDiff = Math.abs(prevPath1 - prevPath2);
                    const prevPhaseDiff = (2 * Math.PI * prevPathDiff) / wavelengthPx;
                    const prevIntensity = Math.pow(amplitude1 + amplitude2 * Math.cos(prevPhaseDiff), 2);
                    
                    // Detect local maxima for fringe order labeling
                    if (combinedIntensity > 0.8 && combinedIntensity > prevIntensity && 
                        y + patternResolution <= maxY) {
                        const nextY = y + patternResolution;
                        const nextPath1 = Math.sqrt(Math.pow(screenX - slitX, 2) + Math.pow(nextY - slit1Y, 2));
                        const nextPath2 = Math.sqrt(Math.pow(screenX - slitX, 2) + Math.pow(nextY - slit2Y, 2));
                        const nextPathDiff = Math.abs(nextPath1 - nextPath2);
                        const nextPhaseDiff = (2 * Math.PI * nextPathDiff) / wavelengthPx;
                        const nextIntensity = Math.pow(amplitude1 + amplitude2 * Math.cos(nextPhaseDiff), 2);
                        
                        if (combinedIntensity > nextIntensity) {
                            // Draw maxima marker
                            ctx.fillStyle = 'white';
                            ctx.beginPath();
                            ctx.arc(screenX + 15, y, 2, 0, Math.PI * 2);
                            ctx.fill();
                            
                            // Calculate fringe order (m) from path difference
                            const order = Math.round(pathDiff / wavelengthPx);
                            if (Math.abs(y - centerY) > 5) { // Skip central maximum labeling
                                ctx.fillStyle = 'white';
                                ctx.font = '10px Arial';
                                ctx.textAlign = 'left';
                                ctx.fillText(`m=${order}`, screenX + 20, y + 4);
                            } else {
                                ctx.fillStyle = 'white';
                                ctx.font = '12px Arial';
                                ctx.textAlign = 'left';
                                ctx.fillText('Central Maximum', screenX + 20, y + 4);
                            }
                        }
                    }
                }
            }
            
            // Draw graphs and visualizations on the right side
            const graphX = screenX + 100;
            const graphWidth = canvas.width - graphX - 20;
            const graphHeight = 150;
            const graphY = 80;
            
            // Intensity profile graph
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
            
            // Graph outline
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);
            
            // Graph title
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Intensity Profile', graphX + graphWidth/2, graphY - 10);
            
            // X axis
            ctx.beginPath();
            ctx.moveTo(graphX, graphY + graphHeight/2);
            ctx.lineTo(graphX + graphWidth, graphY + graphHeight/2);
            ctx.stroke();
            
            // Draw intensity curve
            ctx.beginPath();
            ctx.moveTo(graphX, graphY + graphHeight/2);
            
            for (let x = 0; x < graphWidth; x++) {
                const y = centerY + (x - graphWidth/2) * (patternHeight / graphWidth);
                
                if (y >= minY && y <= maxY) {
                    const path1 = Math.sqrt(Math.pow(screenX - slitX, 2) + Math.pow(y - slit1Y, 2));
                    const path2 = Math.sqrt(Math.pow(screenX - slitX, 2) + Math.pow(y - slit2Y, 2));
                    const pathDiff = Math.abs(path1 - path2);
                    const wavelengthPx = wavelength * scale / 1e9;
                    const phaseDiff = (2 * Math.PI * pathDiff) / wavelengthPx;
                    const intensity = Math.pow(Math.cos(phaseDiff/2), 2);
                    const beta = (Math.PI * slitWidth * (y - centerY)) / (wavelengthPx * (screenX - slitX));
                    let diffraction = 1.0;
                    if (beta !== 0) {
                        diffraction = Math.pow(Math.sin(beta) / beta, 2);
                    }
                    const graphY2 = graphY + graphHeight/2 - intensity * diffraction * graphHeight/2;
                    ctx.lineTo(graphX + x, graphY2);
                }
            }
            
            ctx.strokeStyle = lightColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw formula visualization
            const formulaY = graphY + graphHeight + 50;
            
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Double-Slit Interference Formula', graphX + graphWidth/2, formulaY - 20);
            
            ctx.font = '14px Arial';
            ctx.fillText('d sin θ = m λ', graphX + graphWidth/2, formulaY);
            
            ctx.font = '12px Arial';
            ctx.fillText('Where:', graphX + 50, formulaY + 25);
            ctx.textAlign = 'left';
            ctx.fillText('d = slit separation = ' + slitSpacing + ' μm', graphX + 50, formulaY + 45);
            ctx.fillText('λ = wavelength = ' + wavelength + ' nm', graphX + 50, formulaY + 65);
            ctx.fillText('m = order of maximum (0, ±1, ±2, ...)', graphX + 50, formulaY + 85);
            ctx.fillText('θ = angle from center', graphX + 50, formulaY + 105);
            
            // Calculate and display fringe spacing
            const fringeSpacingMm = fringeSpacing * 1000; // Convert to mm
            
            ctx.textAlign = 'center';
            ctx.font = '14px Arial';
            ctx.fillText('Calculated Fringe Spacing = ' + fringeSpacingMm.toFixed(2) + ' mm', graphX + graphWidth/2, formulaY + 140);
            
            // Update info display
            document.getElementById('optics-info').innerHTML = `
                <strong>双缝干涉现象</strong><br>
                波长 (λ): ${wavelength} nm (${wavelength >= 620 ? '红' : 
                                           wavelength >= 590 ? '橙' : 
                                           wavelength >= 570 ? '黄' : 
                                           wavelength >= 495 ? '绿' : 
                                           wavelength >= 450 ? '蓝' : '紫'}光)<br>
                缝间距 (d): ${slitSpacing} μm<br>
                屏幕距离 (L): ${screenDistance} cm<br>
                条纹间距: ${fringeSpacingMm.toFixed(2)} mm<br>
                <strong>公式</strong>: d·sin θ = m·λ<br>
                θ ≈ y/L (小角近似)
            `;
            
            // Continue animation
            this.animationId = requestAnimationFrame(animate);
        };
        
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