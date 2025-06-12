/**
 * 电磁学模拟器模块
 */
class ElectromagneticSimulator {
    constructor(physicsSimulator) {
        this.physicsSimulator = physicsSimulator;
        this.electricCharges = [];
        this.currentType = 'electric-field';
        this.isRunning = false;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.setupControls();
        this.setupElectricField();
    }

    setupControls() {
        const typeSelect = document.getElementById('em-type');
        const startBtn = document.getElementById('start-em');
        const resetBtn = document.getElementById('reset-em');
        const addChargeBtn = document.getElementById('add-charge');

        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.switchElectromagnetismType(e.target.value);
            });
        }

        // Add event listeners for EM sliders
        const sliders = [
            'charge-count', 'charge-strength', 'magnetic-strength', 'current',
            'coil-turns', 'magnet-speed', 'magnet-strength', 'voltage', 'resistance'
        ];

        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const valueSpan = document.getElementById(sliderId + '-value');
                    if (valueSpan) {
                        valueSpan.textContent = e.target.value;
                    }
                });
            }
        });

        if (startBtn) startBtn.addEventListener('click', () => this.startElectromagnetismSimulation());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetElectromagnetismSimulation());
        if (addChargeBtn) addChargeBtn.addEventListener('click', () => this.addElectricCharge());
    }

    switchElectromagnetismType(type) {
        document.getElementById('electric-field-controls').style.display = 
            type === 'electric-field' ? 'block' : 'none';
        document.getElementById('magnetic-field-controls').style.display = 
            type === 'magnetic-field' ? 'block' : 'none';
        document.getElementById('induction-controls').style.display = 
            type === 'electromagnetic-induction' ? 'block' : 'none';
        document.getElementById('circuit-controls').style.display = 
            type === 'circuit' ? 'block' : 'none';
    }

    setupElectricField() {
        const canvas = this.physicsSimulator.canvases.em;
        if (canvas) {
            this.electricCharges = [
                { x: canvas.width * 0.3, y: canvas.height * 0.5, charge: 1, radius: 20 },
                { x: canvas.width * 0.7, y: canvas.height * 0.5, charge: -1, radius: 20 }
            ];
        }
    }

    startElectromagnetismSimulation() {
        const type = document.getElementById('em-type').value;
        this.isRunning = true;

        if (type === 'electric-field') {
            this.simulateElectricField();
        } else if (type === 'magnetic-field') {
            this.simulateMagneticField();
        } else if (type === 'electromagnetic-induction') {
            this.simulateElectromagneticInduction();
        } else if (type === 'circuit') {
            this.simulateCircuit();
        }
    }

    simulateElectricField() {
        const canvas = this.physicsSimulator.canvases.em;
        const ctx = this.physicsSimulator.contexts.em;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Initialize charges if not exists
        if (!this.electricCharges || this.electricCharges.length === 0) {
            this.electricCharges = [
                { x: canvas.width * 0.3, y: canvas.height * 0.5, charge: 1, radius: 20 },
                { x: canvas.width * 0.7, y: canvas.height * 0.5, charge: -1, radius: 20 }
            ];
        }
        
        // Draw electric field lines
        if (document.getElementById('show-field-lines') && document.getElementById('show-field-lines').checked) {
            this.drawElectricFieldLines(ctx, canvas);
        }
        
        // Draw charges
        this.electricCharges.forEach(charge => {
            ctx.fillStyle = charge.charge > 0 ? '#ff4444' : '#4444ff';
            ctx.beginPath();
            ctx.arc(charge.x, charge.y, charge.radius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(charge.charge > 0 ? '+' : '-', charge.x, charge.y + 5);
        });
        
        document.getElementById('em-info').innerHTML = `
            电荷数量: ${this.electricCharges.length}<br>
            点击画布添加电荷<br>
            观察电场分布
        `;
    }

    drawElectricFieldLines(ctx, canvas) {
        ctx.strokeStyle = 'rgba(67, 97, 238, 0.7)';
        ctx.lineWidth = 1;
        
        // Draw field lines from positive charges
        this.electricCharges.forEach(charge => {
            if (charge.charge > 0) {
                for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 8) {
                    this.drawFieldLine(ctx, charge.x, charge.y, angle, canvas);
                }
            }
        });
    }

    drawFieldLine(ctx, startX, startY, angle, canvas) {
        let x = startX + 25 * Math.cos(angle);
        let y = startY + 25 * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        for (let i = 0; i < 100 && x > 0 && x < canvas.width && y > 0 && y < canvas.height; i++) {
            const field = this.calculateElectricField(x, y);
            const magnitude = Math.sqrt(field.x * field.x + field.y * field.y);
            
            if (magnitude < 0.01) break;
            
            x += (field.x / magnitude) * 5;
            y += (field.y / magnitude) * 5;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }

    calculateElectricField(x, y) {
        let Ex = 0, Ey = 0;
        
        this.electricCharges.forEach(charge => {
            const dx = x - charge.x;
            const dy = y - charge.y;
            const r2 = dx * dx + dy * dy;
            const r = Math.sqrt(r2);
            
            if (r > charge.radius) {
                const k = 8.99e9; // Coulomb constant (simplified)
                const E = k * Math.abs(charge.charge) / r2;
                Ex += E * dx / r * Math.sign(charge.charge);
                Ey += E * dy / r * Math.sign(charge.charge);
            }
        });
        
        return { x: Ex, y: Ey };
    }

    simulateMagneticField() {
        const canvas = this.physicsSimulator.canvases.em;
        const ctx = this.physicsSimulator.contexts.em;
        const magneticStrength = parseFloat(document.getElementById('magnetic-strength').value);
        const current = parseFloat(document.getElementById('current').value);
        
        // Animation loop
        const animate = () => {
            if (!this.isRunning) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Set up background
            ctx.fillStyle = 'rgba(240, 248, 255, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const wireThickness = 12;
            
            // Enhanced visualization based on current
            // Right-hand rule visualization - 使用右手定则
            this.drawRightHandRule(ctx, centerX, centerY - 150, current);
            
            // Create gradient for current visualization
            const gradientCurrent = ctx.createLinearGradient(0, 100, 0, canvas.height - 100);
            gradientCurrent.addColorStop(0, '#ff6b35');
            gradientCurrent.addColorStop(0.5, '#ff8c61');
            gradientCurrent.addColorStop(1, '#ff6b35');
            
            // Draw current-carrying wire
            ctx.strokeStyle = gradientCurrent;
            ctx.lineWidth = wireThickness;
            ctx.beginPath();
            ctx.moveTo(centerX, 100);
            ctx.lineTo(centerX, canvas.height - 100);
            ctx.stroke();
            
            // Add current direction indicators
            this.drawCurrentDirectionIndicators(ctx, centerX, canvas.height - 100, centerX, 100, current);
            
            // Draw magnetic field lines
            this.drawMagneticFieldLines(ctx, centerX, centerY, magneticStrength * 5, current);
            
            // Draw compass needles to show field direction
            const compassPositions = [
                {x: centerX - 150, y: centerY},
                {x: centerX + 150, y: centerY},
                {x: centerX, y: centerY - 150},
                {x: centerX, y: centerY + 150},
                {x: centerX - 120, y: centerY - 120},
                {x: centerX + 120, y: centerY + 120},
                {x: centerX - 120, y: centerY + 120},
                {x: centerX + 120, y: centerY - 120}
            ];
            
            compassPositions.forEach(pos => {
                this.drawCompassNeedle(ctx, pos.x, pos.y, centerX, centerY, current);
            });
            
            // Add explanation
            this.drawMagneticFieldExplanation(ctx, canvas.width, canvas.height, magneticStrength, current);
            
            // Continue animation
            this.animationId = requestAnimationFrame(animate);
        };
        
        // Start animation
        this.isRunning = true;
        animate();
        
        // Update info panel with explanation
        document.getElementById('em-info').innerHTML = `
            <strong>安培环路定则与右手定则</strong><br>
            电流大小: ${current} A<br>
            磁场强度: ${magneticStrength} T<br>
            观察指南针方向变化，了解电流产生的磁场方向<br>
            根据右手握住导线，大拇指指向电流方向，弯曲的四指指向磁场方向
        `;
    }
    
    drawRightHandRule(ctx, x, y, current) {
        // Draw hand illustration
        ctx.save();
        
        // Determine direction based on current
        const scaleX = current >= 0 ? 1 : -1;
        ctx.translate(x, y);
        ctx.scale(scaleX, 1);
        
        // Draw simplified hand
        ctx.fillStyle = '#ffd6cc';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // Palm
        ctx.beginPath();
        ctx.ellipse(0, 0, 30, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Thumb pointing up (current direction)
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.quadraticCurveTo(30, -40, 20, -70);
        ctx.lineTo(10, -65);
        ctx.quadraticCurveTo(15, -40, -5, -20);
        ctx.fill();
        ctx.stroke();
        
        // Fingers curling (magnetic field direction)
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, -10 + i * 15);
            ctx.quadraticCurveTo(-40 - i * 5, -10 + i * 15, -45 - i * 3, 20);
            ctx.lineTo(-35 - i * 3, 20);
            ctx.quadraticCurveTo(-30 - i * 5, -5 + i * 15, 0, 0 + i * 15);
            ctx.fill();
            ctx.stroke();
        }
        
        // Add arrows to illustrate field direction
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = Math.PI * 0.8 + i * 0.2;
            const r = 60 + i * 10;
            const arrowX = -Math.cos(angle) * r;
            const arrowY = Math.sin(angle) * r;
            
            ctx.beginPath();
            ctx.moveTo(-30, 0);
            ctx.lineTo(arrowX, arrowY);
            ctx.stroke();
            
            // Arrow head
            this.drawArrowhead(ctx, arrowX, arrowY, angle, 8);
        }
        
        // Label
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText(current >= 0 ? '右手定则' : '右手定则 (反向电流)', 0, 70);
        
        ctx.restore();
    }
    
    drawCurrentDirectionIndicators(ctx, x1, y1, x2, y2, current) {
        const direction = current >= 0 ? 1 : -1;
        const count = 8; // Number of indicators
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        for (let i = 1; i < count; i++) {
            const t = i / count;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
            // Draw direction symbol
            if (direction > 0) {
                // Draw dot (current coming out of page)
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                // Add center dot
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
            } else {
                // Draw X (current going into page)
                ctx.beginPath();
                ctx.moveTo(x - 5, y - 5);
                ctx.lineTo(x + 5, y + 5);
                ctx.moveTo(x + 5, y - 5);
                ctx.lineTo(x - 5, y + 5);
                ctx.stroke();
            }
        }
    }
    
    drawMagneticFieldLines(ctx, centerX, centerY, strength, current) {
        const direction = current >= 0 ? 1 : -1;
        const fieldDensity = Math.abs(current) * strength;
        
        // Create gradient for field lines
        const gradient = ctx.createLinearGradient(centerX - 200, centerY, centerX + 200, centerY);
        gradient.addColorStop(0, 'rgba(67, 97, 238, 0.7)');
        gradient.addColorStop(0.5, 'rgba(114, 9, 183, 0.7)');
        gradient.addColorStop(1, 'rgba(67, 97, 238, 0.7)');
        
        ctx.strokeStyle = gradient;
        
        // Draw concentric field circles
        for (let r = 20; r < 300; r += 20 / (fieldDensity * 0.5 + 0.5)) {
            ctx.lineWidth = 2 - r / 200; // Make closer lines thicker
            ctx.setLineDash([5, 5]); // Dashed line for field lines
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
            
            // Add direction arrows on field lines
            const arrowCount = Math.floor(r / 30) * 2; // More arrows on larger circles
            if (arrowCount > 0) {
                ctx.setLineDash([]); // Solid line for arrows
                for (let a = 0; a < arrowCount; a++) {
                    const angle = (a * Math.PI * 2 / arrowCount) + Date.now() * 0.001 * direction;
                    const arrowX = centerX + Math.cos(angle) * r;
                    const arrowY = centerY + Math.sin(angle) * r;
                    
                    // Direction depends on current direction (right-hand rule)
                    this.drawArrowhead(ctx, arrowX, arrowY, angle + Math.PI/2 * direction, 6);
                }
            }
        }
        
        ctx.setLineDash([]); // Reset dash pattern
    }
    
    drawArrowhead(ctx, x, y, angle, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size);
        ctx.lineTo(0, -size/2);
        ctx.lineTo(size, -size);
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        
        ctx.restore();
    }
    
    drawCompassNeedle(ctx, x, y, wireX, wireY, current) {
        // Calculate angle based on position relative to wire and current direction
        const dx = x - wireX;
        const dy = y - wireY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Base angle from right-hand rule (tangent to circle)
        let angle = Math.atan2(dy, dx) + Math.PI/2;
        
        // Adjust direction based on current
        if (current < 0) angle += Math.PI;
        
        // Draw compass circle
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw needle
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Red (north) end
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -15);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff4444';
        ctx.stroke();
        
        // Blue (south) end
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 15);
        ctx.strokeStyle = '#4444ff';
        ctx.stroke();
        
        // Needle center
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        
        ctx.restore();
    }
    
    drawMagneticFieldExplanation(ctx, width, height, magneticStrength, current) {
        // Draw explanation box
        const boxWidth = 250;
        const boxHeight = 130;
        const boxX = 20;
        const boxY = 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
        ctx.fill();
        ctx.stroke();
        
        // Add text explanation
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('磁场方向与强度', boxX + 10, boxY + 25);
        
        ctx.font = '14px Arial';
        ctx.fillText(`• 电流: ${current.toFixed(1)} A`, boxX + 10, boxY + 50);
        ctx.fillText(`• 磁场强度: ${magneticStrength.toFixed(2)} T`, boxX + 10, boxY + 70);
        ctx.fillText(`• 磁感线密度 ∝ 电流大小`, boxX + 10, boxY + 90);
        ctx.fillText(`• 磁场强度 ∝ 1/距离`, boxX + 10, boxY + 110);
        
        // Formula
        ctx.fillStyle = '#4361ee';
        ctx.font = 'italic 16px Arial';
        ctx.fillText('B = μ₀I / (2πr)', width - 150, height - 30);
    }

    simulateElectromagneticInduction() {
        const canvas = this.physicsSimulator.canvases.em;
        const ctx = this.physicsSimulator.contexts.em;
        
        const coilTurns = parseInt(document.getElementById('coil-turns').value);
        const magnetSpeed = parseFloat(document.getElementById('magnet-speed').value);
        const magnetStrength = parseFloat(document.getElementById('magnet-strength').value);
        
        // Animation function
        const animate = () => {
            if (!this.isRunning) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Set up background
            ctx.fillStyle = 'rgba(240, 248, 255, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const coilX = canvas.width / 2;
            const coilY = canvas.height / 2;
            const coilWidth = 150;
            const coilHeight = 80;
            
            // Calculate magnet position based on time and speed
            const time = Date.now() * 0.001;
            const oscillationSpeed = magnetSpeed * 0.02;
            const magnetX = coilX - 150 + 300 * Math.sin(time * oscillationSpeed);
            const distanceToCoil = Math.abs(magnetX - coilX);
            
            // Calculate induced EMF based on position, speed and direction
            const magnetVelocity = 300 * oscillationSpeed * Math.cos(time * oscillationSpeed);
            const fluxChange = magnetStrength * Math.abs(magnetVelocity) * 0.01;
            const inducedEMF = fluxChange * coilTurns * (distanceToCoil < 120 ? 1 : 0.2);
            const currentDirection = -Math.sign(magnetVelocity) * Math.sign(magnetX - coilX);
            
            // Draw experiment setup with perspective
            this.drawExperimentBackground(ctx, canvas.width, canvas.height);
            
            // Draw coil with proper perspective
            this.drawCoil(ctx, coilX, coilY, coilWidth, coilHeight, coilTurns, inducedEMF, currentDirection);
            
            // Draw galvanometer
            this.drawGalvanometer(ctx, coilX, coilY - 180, inducedEMF * 20 * currentDirection);
            
            // Draw magnet with field lines
            this.drawMagnet(ctx, magnetX, coilY, magnetStrength);
            
            // Draw magnetic field lines
            this.drawMagneticFieldAround(ctx, magnetX, coilY, magnetStrength);
            
            // Draw magnetic flux through coil
            this.drawMagneticFlux(ctx, coilX, coilY, coilWidth, coilHeight, magnetX, magnetStrength);
            
            // Draw explanation box
            this.drawInductionExplanation(ctx, coilTurns, magnetSpeed, magnetStrength, inducedEMF, magnetVelocity);
            
            // Draw graphs
            this.drawInductionGraphs(ctx, canvas.width, canvas.height, time, oscillationSpeed, inducedEMF);
            
            // Draw Faraday's law formula
            ctx.fillStyle = '#4361ee';
            ctx.font = 'italic 16px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('ℰ = -N · dΦ/dt', canvas.width - 30, canvas.height - 30);
            
            // Continue animation
            this.animationId = requestAnimationFrame(animate);
        };
        
        // Start animation
        this.isRunning = true;
        animate();
        
        // Update info panel
        document.getElementById('em-info').innerHTML = `
            <strong>法拉第电磁感应定律</strong><br>
            线圈匝数: ${coilTurns} 匝<br>
            磁铁移动速度: ${magnetSpeed} m/s<br>
            磁铁强度: ${magnetStrength} T<br>
            观察磁铁移动时，感应电流与磁通量变化率的关系
        `;
    }
    
    drawExperimentBackground(ctx, width, height) {
        // Draw experimental table
        ctx.fillStyle = '#d4c0a1';
        ctx.fillRect(width * 0.1, height * 0.65, width * 0.8, height * 0.25);
        
        // Table edge
        ctx.fillStyle = '#b2a18c';
        ctx.fillRect(width * 0.1, height * 0.65, width * 0.8, 10);
        
        // Draw lab environment elements
        ctx.fillStyle = '#eeeeee';
        ctx.fillRect(width * 0.05, height * 0.05, 120, 100);
        ctx.strokeStyle = '#cccccc';
        ctx.strokeRect(width * 0.05, height * 0.05, 120, 100);
    }
    
    drawCoil(ctx, x, y, width, height, turns, inducedEMF, currentDirection) {
        // Draw coil frame
        ctx.fillStyle = '#f5f5f5';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // Coil holder
        ctx.fillRect(x - width/2 - 15, y - height/2 - 15, width + 30, height + 30);
        ctx.strokeRect(x - width/2 - 15, y - height/2 - 15, width + 30, height + 30);
        
        // Draw coil turns with proper 3D perspective
        const turnSpacing = Math.min(8, 150 / turns);
        const coilThickness = Math.max(2, Math.min(4, 20 / turns));
        
        // Back turns
        for (let i = 0; i < turns; i++) {
            const offset = (i - turns/2) * turnSpacing;
            
            // Draw wire turn
            ctx.beginPath();
            ctx.ellipse(x, y + offset, width/2, height/2, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(67, 97, 238, ${0.5 + 0.5 * Math.min(1, Math.abs(inducedEMF))})`;
            ctx.lineWidth = coilThickness;
            ctx.stroke();
        }
        
        // Draw induced current if significant
        if (Math.abs(inducedEMF) > 0.05) {
            // Draw current direction indicators
            const currentArrowCount = Math.max(2, Math.min(8, Math.floor(turns / 3)));
            const arrowOpacity = Math.min(1, Math.abs(inducedEMF) * 2);
            
            ctx.fillStyle = `rgba(255, 107, 53, ${arrowOpacity})`;
            
            for (let i = 0; i < currentArrowCount; i++) {
                const angle = i * Math.PI * 2 / currentArrowCount;
                const arrowX = x + Math.cos(angle) * width/2;
                const arrowY = y + Math.sin(angle) * height/2;
                
                // Draw current arrow
                ctx.save();
                ctx.translate(arrowX, arrowY);
                ctx.rotate(angle + (currentDirection > 0 ? 0 : Math.PI));
                
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-10, -5);
                ctx.lineTo(-10, 5);
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
            }
            
            // Add current labels
            ctx.fillStyle = `rgba(255, 107, 53, ${arrowOpacity})`;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`感应电流: ${(inducedEMF * currentDirection).toFixed(2)} A`, x - width/2, y + height/2 + 60);
        }
        
        // Connect to galvanometer
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - width/2, y);
        ctx.lineTo(x - width/2 - 50, y);
        ctx.lineTo(x - width/2 - 50, y - 170);
        ctx.lineTo(x - 30, y - 170);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width/2 + 50, y);
        ctx.lineTo(x + width/2 + 50, y - 170);
        ctx.lineTo(x + 30, y - 170);
        ctx.stroke();
    }
    
    drawGalvanometer(ctx, x, y, needleAngle) {
        // Clamp needle angle
        needleAngle = Math.max(-45, Math.min(45, needleAngle));
        
        // Draw galvanometer body
        ctx.fillStyle = '#e0e0e0';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.ellipse(x, y, 40, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw scale
        ctx.beginPath();
        ctx.arc(x, y, 35, Math.PI * 0.75, Math.PI * 0.25, false);
        ctx.stroke();
        
        // Draw scale marks
        for (let i = -45; i <= 45; i += 15) {
            const angle = (i + 90) * Math.PI / 180;
            const innerRadius = i % 45 === 0 ? 25 : 30;
            
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * innerRadius, y + Math.sin(angle) * innerRadius);
            ctx.lineTo(x + Math.cos(angle) * 35, y + Math.sin(angle) * 35);
            ctx.stroke();
            
            if (i % 45 === 0) {
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const textRadius = 20;
                ctx.fillText(i === 0 ? '0' : (i < 0 ? '-' : '+'), 
                             x + Math.cos(angle) * textRadius, 
                             y + Math.sin(angle) * textRadius);
            }
        }
        
        // Draw needle
        const needleAngleRad = (needleAngle + 90) * Math.PI / 180;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(needleAngleRad);
        
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.stroke();
        
        // Needle point
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(25, -3);
        ctx.lineTo(25, 3);
        ctx.closePath();
        ctx.fillStyle = '#ff4444';
        ctx.fill();
        
        // Needle pivot
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        
        ctx.restore();
        
        // Label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('检流计', x, y + 50);
    }
    
    drawMagnet(ctx, x, y, strength) {
        const magnetWidth = 60;
        const magnetHeight = 30;
        
        // Draw magnet body
        const gradient = ctx.createLinearGradient(x - magnetWidth/2, y, x + magnetWidth/2, y);
        gradient.addColorStop(0, '#ff4444');  // North pole
        gradient.addColorStop(0.5, '#ff6b6b');
        gradient.addColorStop(1, '#4444ff');  // South pole
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Bar magnet
        ctx.beginPath();
        ctx.roundRect(x - magnetWidth/2, y - magnetHeight/2, magnetWidth, magnetHeight, 5);
        ctx.fill();
        ctx.stroke();
        
        // Label poles
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', x - magnetWidth/4, y);
        ctx.fillText('S', x + magnetWidth/4, y);
        
        // Strength indicator
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`${strength.toFixed(1)} T`, x, y - magnetHeight/2 - 10);
    }
    
    drawMagneticFieldAround(ctx, x, y, strength) {
        // Draw simplified magnetic field lines around magnet
        const magnetWidth = 60;
        const fieldExtent = 100 * strength;
        
        ctx.strokeStyle = 'rgba(67, 97, 238, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        
        // Field lines from north pole to south pole
        for (let i = 1; i <= 4; i++) {
            const offset = i * 10;
            
            // Top field line
            ctx.beginPath();
            ctx.moveTo(x - magnetWidth/2, y - offset);
            ctx.bezierCurveTo(
                x - magnetWidth/2 - fieldExtent, y - offset - fieldExtent/2,
                x + magnetWidth/2 + fieldExtent, y - offset - fieldExtent/2,
                x + magnetWidth/2, y - offset
            );
            ctx.stroke();
            
            // Bottom field line
            ctx.beginPath();
            ctx.moveTo(x - magnetWidth/2, y + offset);
            ctx.bezierCurveTo(
                x - magnetWidth/2 - fieldExtent, y + offset + fieldExtent/2,
                x + magnetWidth/2 + fieldExtent, y + offset + fieldExtent/2,
                x + magnetWidth/2, y + offset
            );
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    }
    
    drawMagneticFlux(ctx, coilX, coilY, coilWidth, coilHeight, magnetX, magnetStrength) {
        // Only show flux when magnet is close to coil
        const distanceToCoil = Math.abs(magnetX - coilX);
        if (distanceToCoil > 120) return;
        
        // Calculate flux density based on distance
        const fluxDensity = Math.max(0, 1 - distanceToCoil / 120) * magnetStrength;
        
        // Draw magnetic flux lines passing through coil
        ctx.strokeStyle = `rgba(114, 9, 183, ${fluxDensity * 0.6})`;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        
        const linesCount = Math.floor(fluxDensity * 10) + 1;
        const step = coilWidth / (linesCount + 1);
        
        for (let i = 1; i <= linesCount; i++) {
            const x = coilX - coilWidth/2 + i * step;
            
            ctx.beginPath();
            ctx.moveTo(x, coilY - coilHeight/2 - 40);
            ctx.lineTo(x, coilY + coilHeight/2 + 40);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Indicate flux direction with arrows
        if (fluxDensity > 0.2) {
            ctx.fillStyle = `rgba(114, 9, 183, ${fluxDensity * 0.8})`;
            
            for (let i = 1; i <= linesCount; i++) {
                const x = coilX - coilWidth/2 + i * step;
                
                // Draw arrows on flux lines
                this.drawArrowhead(ctx, x, coilY, Math.PI/2, 6);
                this.drawArrowhead(ctx, x, coilY + 60, Math.PI/2, 6);
                this.drawArrowhead(ctx, x, coilY - 60, Math.PI/2, 6);
            }
        }
        
        // Label flux
        if (fluxDensity > 0.1) {
            ctx.fillStyle = `rgba(114, 9, 183, ${fluxDensity * 0.8})`;
            ctx.font = 'italic 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Φ', coilX, coilY - coilHeight/2 - 50);
        }
    }
    
    drawInductionExplanation(ctx, coilTurns, magnetSpeed, magnetStrength, inducedEMF, magnetVelocity) {
        // Draw explanation box
        const boxWidth = 250;
        const boxHeight = 170;
        const boxX = 20;
        const boxY = 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
        ctx.fill();
        ctx.stroke();
        
        // Add text explanation
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('电磁感应现象', boxX + 10, boxY + 25);
        
        ctx.font = '14px Arial';
        ctx.fillText(`• 线圈匝数 N: ${coilTurns}`, boxX + 10, boxY + 50);
        ctx.fillText(`• 磁铁速度 v: ${Math.abs(magnetVelocity).toFixed(2)} m/s`, boxX + 10, boxY + 70);
        ctx.fillText(`• 磁场强度 B: ${magnetStrength.toFixed(2)} T`, boxX + 10, boxY + 90);
        ctx.fillText(`• 感应电动势 ℰ: ${Math.abs(inducedEMF).toFixed(2)} V`, boxX + 10, boxY + 110);
        
        ctx.fillText(`• 感应电流方向: ${magnetVelocity > 0 ? 
            (magnetVelocity * inducedEMF > 0 ? '顺时针' : '逆时针') : 
            (magnetVelocity * inducedEMF > 0 ? '逆时针' : '顺时针')}`, 
            boxX + 10, boxY + 130);
            
        ctx.fillText(`• 楞次定律: 感应电流方向阻碍磁通量变化`, boxX + 10, boxY + 150);
    }
    
    drawInductionGraphs(ctx, width, height, time, oscillationSpeed, inducedEMF) {
        // Draw graph container
        const graphWidth = 250;
        const graphHeight = 100;
        const graphX = width - graphWidth - 20;
        const graphY = 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(graphX, graphY, graphWidth, graphHeight);
        ctx.fill();
        ctx.stroke();
        
        // Draw graph axes
        ctx.beginPath();
        ctx.moveTo(graphX, graphY + graphHeight/2);
        ctx.lineTo(graphX + graphWidth, graphY + graphHeight/2);
        ctx.moveTo(graphX, graphY);
        ctx.lineTo(graphX, graphY + graphHeight);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('感应电动势随时间变化', graphX + graphWidth/2, graphY - 5);
        
        // Draw EMF graph
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Plot EMF over time
        const timeRange = 4 * Math.PI / oscillationSpeed; // Show 2 complete cycles
        const timeStep = timeRange / graphWidth;
        
        for (let i = 0; i < graphWidth; i++) {
            const t = time - timeRange + i * timeStep;
            const magnetVelocity = 300 * oscillationSpeed * Math.cos(t * oscillationSpeed);
            const emf = -magnetVelocity * 0.02; // Simplified EMF calculation
            
            const x = graphX + i;
            const y = graphY + graphHeight/2 - emf * graphHeight/4;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Mark current time point
        const currentX = graphX + graphWidth - 1;
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(currentX, graphY + graphHeight/2 - inducedEMF * graphHeight/4, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    simulateCircuit() {
        const canvas = this.physicsSimulator.canvases.em;
        const ctx = this.physicsSimulator.contexts.em;
        
        const voltage = parseFloat(document.getElementById('voltage').value);
        const resistance = parseFloat(document.getElementById('resistance').value);
        
        // Calculate current using Ohm's law
        const current = voltage / resistance;
        
        // Animation function
        const animate = () => {
            if (!this.isRunning) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Background
            ctx.fillStyle = 'rgba(240, 248, 255, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Draw circuit board background
            this.drawCircuitBoard(ctx, canvas.width, canvas.height);
            
            // Draw complete circuit with components
            this.drawCompleteCircuit(ctx, centerX, centerY, voltage, resistance, current);
            
            // Animate electricity flow
            const time = Date.now() * 0.001;
            this.drawElectricityFlow(ctx, centerX, centerY, current, time);
            
            // Draw circuit measurements and meters
            this.drawCircuitMeters(ctx, centerX, centerY, voltage, current, resistance);
            
            // Draw explanation and formulas
            this.drawCircuitExplanation(ctx, voltage, current, resistance);
            
            // Draw power calculation
            const power = voltage * current;
            ctx.fillStyle = '#333';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`功率: P = ${power.toFixed(2)} W`, centerX, canvas.height - 30);
            
            // Continue animation
            this.animationId = requestAnimationFrame(animate);
        };
        
        // Start animation
        this.isRunning = true;
        animate();
        
        // Update info panel
        document.getElementById('em-info').innerHTML = `
            <strong>欧姆定律与电路分析</strong><br>
            电压: ${voltage} V<br>
            电阻: ${resistance} Ω<br>
            电流: ${current.toFixed(2)} A<br>
            功率: ${(voltage * current).toFixed(2)} W<br>
            欧姆定律: I = U/R
        `;
    }
    
    drawCircuitBoard(ctx, width, height) {
        // Draw circuit board background
        ctx.fillStyle = '#e0f7fa';  // Light cyan for circuit board
        ctx.fillRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
        
        // Draw grid lines for circuit board
        ctx.strokeStyle = 'rgba(0, 150, 136, 0.2)';  // Teal grid lines
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let x = width * 0.1; x <= width * 0.9; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, height * 0.1);
            ctx.lineTo(x, height * 0.9);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = height * 0.1; y <= height * 0.9; y += 20) {
            ctx.beginPath();
            ctx.moveTo(width * 0.1, y);
            ctx.lineTo(width * 0.9, y);
            ctx.stroke();
        }
        
        // Draw circuit board holes
        ctx.fillStyle = 'rgba(0, 77, 64, 0.2)';  // Dark teal for holes
        for (let x = width * 0.15; x <= width * 0.85; x += 40) {
            for (let y = height * 0.15; y <= height * 0.85; y += 40) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    drawCompleteCircuit(ctx, centerX, centerY, voltage, resistance, current) {
        const circuitWidth = 400;
        const circuitHeight = 300;
        
        // Calculate component positions
        const batteryX = centerX - circuitWidth * 0.3;
        const batteryY = centerY;
        const resistorX = centerX + circuitWidth * 0.3;
        const resistorY = centerY - circuitHeight * 0.25;
        const lampX = centerX + circuitWidth * 0.15;
        const lampY = centerY + circuitHeight * 0.25;
        const switchX = centerX - circuitWidth * 0.15;
        const switchY = centerY - circuitHeight * 0.25;
        
        // Draw connecting wires
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        
        // Top wire
        ctx.beginPath();
        ctx.moveTo(batteryX, batteryY - 50);
        ctx.lineTo(batteryX, centerY - circuitHeight * 0.4);
        ctx.lineTo(switchX - 30, centerY - circuitHeight * 0.4);
        ctx.stroke();
        
        // Switch to resistor
        ctx.beginPath();
        ctx.moveTo(switchX + 30, switchY);
        ctx.lineTo(resistorX - 40, resistorY);
        ctx.stroke();
        
        // Resistor to lamp
        ctx.beginPath();
        ctx.moveTo(resistorX + 40, resistorY);
        ctx.lineTo(resistorX + 60, resistorY);
        ctx.lineTo(resistorX + 60, lampY - 30);
        ctx.lineTo(lampX, lampY - 30);
        ctx.stroke();
        
        // Lamp to battery
        ctx.beginPath();
        ctx.moveTo(lampX, lampY + 30);
        ctx.lineTo(lampX, centerY + circuitHeight * 0.4);
        ctx.lineTo(batteryX, centerY + circuitHeight * 0.4);
        ctx.lineTo(batteryX, batteryY + 50);
        ctx.stroke();
        
        // Draw components
        this.drawBattery(ctx, batteryX, batteryY, voltage);
        this.drawResistor(ctx, resistorX, resistorY, resistance);
        this.drawLamp(ctx, lampX, lampY, current);
        this.drawSwitch(ctx, switchX, switchY, true);
        
        // Draw component labels
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        ctx.fillText(`电池 (${voltage}V)`, batteryX, batteryY + 80);
        ctx.fillText(`电阻 (${resistance}Ω)`, resistorX, resistorY - 30);
        ctx.fillText(`灯泡`, lampX, lampY + 60);
        ctx.fillText(`开关`, switchX, switchY - 30);
    }
    
    drawBattery(ctx, x, y, voltage) {
        const batteryHeight = 100;
        const batteryWidth = 50;
        
        // Battery body
        ctx.fillStyle = '#ffeb3b';  // Yellow
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        // Draw battery body
        ctx.beginPath();
        ctx.roundRect(x - batteryWidth/2, y - batteryHeight/2, batteryWidth, batteryHeight, 5);
        ctx.fill();
        ctx.stroke();
        
        // Draw battery terminals
        const terminalWidth = 20;
        const terminalHeight = 10;
        
        // Positive terminal
        ctx.fillStyle = '#f44336';  // Red
        ctx.beginPath();
        ctx.rect(x - terminalWidth/2, y - batteryHeight/2 - terminalHeight, terminalWidth, terminalHeight);
        ctx.fill();
        ctx.stroke();
        
        // Draw + symbol
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', x, y - batteryHeight/2 - terminalHeight/2);
        
        // Negative terminal
        ctx.fillStyle = '#2196f3';  // Blue
        ctx.beginPath();
        ctx.rect(x - terminalWidth/2, y + batteryHeight/2, terminalWidth, terminalHeight);
        ctx.fill();
        ctx.stroke();
        
        // Draw - symbol
        ctx.fillStyle = 'white';
        ctx.fillText('-', x, y + batteryHeight/2 + terminalHeight/2);
        
        // Draw voltage
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${voltage}V`, x, y);
    }
    
    drawResistor(ctx, x, y, resistance) {
        const resistorWidth = 80;
        const resistorHeight = 30;
        
        // Draw resistor body
        ctx.fillStyle = '#ff9800';  // Orange
        ctx.strokeStyle = '#e65100';  // Dark orange
        ctx.lineWidth = 2;
        
        // Zigzag resistor
        ctx.beginPath();
        ctx.moveTo(x - resistorWidth/2, y);
        
        const segments = 6;
        const segmentWidth = resistorWidth / segments;
        const zigzagHeight = resistorHeight / 2;
        
        for (let i = 0; i <= segments; i++) {
            const segX = x - resistorWidth/2 + i * segmentWidth;
            const segY = y + (i % 2 === 0 ? -zigzagHeight : zigzagHeight);
            ctx.lineTo(segX, segY);
        }
        
        ctx.stroke();
        
        // Draw resistance value
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${resistance}Ω`, x, y + resistorHeight);
        
        // Draw connection points
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - resistorWidth/2 - 5, y, 3, 0, Math.PI * 2);
        ctx.arc(x + resistorWidth/2 + 5, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawLamp(ctx, x, y, current) {
        const lampRadius = 20;
        const brightness = Math.min(1, current * 0.1);
        
        // Draw bulb
        ctx.beginPath();
        ctx.arc(x, y, lampRadius, 0, Math.PI * 2);
        
        // Create glow effect based on current
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, lampRadius);
        gradient.addColorStop(0, `rgba(255, 255, 200, ${brightness})`);
        gradient.addColorStop(0.7, `rgba(255, 200, 0, ${brightness * 0.5})`);
        gradient.addColorStop(1, 'rgba(200, 120, 0, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw filament
        ctx.beginPath();
        ctx.moveTo(x - lampRadius * 0.6, y);
        ctx.lineTo(x - lampRadius * 0.3, y - lampRadius * 0.4);
        ctx.lineTo(x, y);
        ctx.lineTo(x + lampRadius * 0.3, y - lampRadius * 0.4);
        ctx.lineTo(x + lampRadius * 0.6, y);
        ctx.strokeStyle = `rgba(255, 100, 0, ${0.5 + brightness * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw lamp base
        ctx.beginPath();
        ctx.moveTo(x - lampRadius * 0.5, y + lampRadius);
        ctx.lineTo(x - lampRadius * 0.7, y + lampRadius * 1.5);
        ctx.lineTo(x + lampRadius * 0.7, y + lampRadius * 1.5);
        ctx.lineTo(x + lampRadius * 0.5, y + lampRadius);
        ctx.fillStyle = '#b0bec5';  // Light blue-grey
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw connection points
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x, y - lampRadius - 5, 3, 0, Math.PI * 2);
        ctx.arc(x, y + lampRadius + 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSwitch(ctx, x, y, isOn) {
        const switchWidth = 60;
        const switchHeight = 20;
        
        // Draw switch base
        ctx.fillStyle = '#607d8b';  // Blue-grey
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.rect(x - switchWidth/2, y - switchHeight/2, switchWidth, switchHeight);
        ctx.fill();
        ctx.stroke();
        
        // Draw switch lever
        ctx.beginPath();
        if (isOn) {
            ctx.moveTo(x - switchWidth/2 + 5, y);
            ctx.lineTo(x + switchWidth/2 - 5, y);
        } else {
            ctx.moveTo(x - switchWidth/2 + 5, y);
            ctx.lineTo(x, y - switchHeight);
        }
        
        ctx.strokeStyle = isOn ? '#4caf50' : '#f44336';  // Green if on, red if off
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw connection points
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - switchWidth/2 - 5, y, 3, 0, Math.PI * 2);
        ctx.arc(x + switchWidth/2 + 5, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawElectricityFlow(ctx, centerX, centerY, current, time) {
        const circuitWidth = 400;
        const circuitHeight = 300;
        
        // Skip if current is too low
        if (Math.abs(current) < 0.1) return;
        
        // Calculate flow speed based on current
        const flowSpeed = Math.min(5, Math.abs(current)) * 0.2;
        const particleCount = Math.min(20, Math.ceil(Math.abs(current) * 2));
        
        // Define circuit path points
        const pathPoints = [
            { x: centerX - circuitWidth * 0.3, y: centerY - 50 },  // Battery top
            { x: centerX - circuitWidth * 0.3, y: centerY - circuitHeight * 0.4 },
            { x: centerX - circuitWidth * 0.15 - 30, y: centerY - circuitHeight * 0.4 },
            { x: centerX - circuitWidth * 0.15 - 30, y: centerY - circuitHeight * 0.25 },  // Switch in
            { x: centerX - circuitWidth * 0.15 + 30, y: centerY - circuitHeight * 0.25 },  // Switch out
            { x: centerX + circuitWidth * 0.3 - 40, y: centerY - circuitHeight * 0.25 },  // Resistor in
            { x: centerX + circuitWidth * 0.3 + 40, y: centerY - circuitHeight * 0.25 },  // Resistor out
            { x: centerX + circuitWidth * 0.3 + 60, y: centerY - circuitHeight * 0.25 },
            { x: centerX + circuitWidth * 0.3 + 60, y: centerY + circuitHeight * 0.25 - 30 },
            { x: centerX + circuitWidth * 0.15, y: centerY + circuitHeight * 0.25 - 30 },  // Lamp in
            { x: centerX + circuitWidth * 0.15, y: centerY + circuitHeight * 0.25 + 30 },  // Lamp out
            { x: centerX + circuitWidth * 0.15, y: centerY + circuitHeight * 0.4 },
            { x: centerX - circuitWidth * 0.3, y: centerY + circuitHeight * 0.4 },
            { x: centerX - circuitWidth * 0.3, y: centerY + 50 }  // Battery bottom
        ];
        
        // Calculate total path length
        let totalLength = 0;
        for (let i = 1; i < pathPoints.length; i++) {
            const dx = pathPoints[i].x - pathPoints[i-1].x;
            const dy = pathPoints[i].y - pathPoints[i-1].y;
            totalLength += Math.sqrt(dx*dx + dy*dy);
        }
        
        // Draw electron flow
        ctx.fillStyle = current > 0 ? '#2196f3' : '#f44336';  // Blue for conventional, red for electron flow
        
        for (let i = 0; i < particleCount; i++) {
            // Calculate particle position along the path
            let particlePos = (time * flowSpeed * 100 + i * (totalLength / particleCount)) % totalLength;
            
            // Find segment
            let currentLength = 0;
            let segmentIndex = 0;
            let segmentPos = 0;
            
            for (let j = 1; j < pathPoints.length; j++) {
                const dx = pathPoints[j].x - pathPoints[j-1].x;
                const dy = pathPoints[j].y - pathPoints[j-1].y;
                const segmentLength = Math.sqrt(dx*dx + dy*dy);
                
                if (currentLength + segmentLength > particlePos) {
                    segmentIndex = j - 1;
                    segmentPos = (particlePos - currentLength) / segmentLength;
                    break;
                }
                
                currentLength += segmentLength;
            }
            
            // Calculate particle coordinates
            const p1 = pathPoints[segmentIndex];
            const p2 = pathPoints[segmentIndex + 1];
            const particleX = p1.x + (p2.x - p1.x) * segmentPos;
            const particleY = p1.y + (p2.y - p1.y) * segmentPos;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawCircuitMeters(ctx, centerX, centerY, voltage, current, resistance) {
        // Draw voltmeter
        this.drawMeter(ctx, centerX - 200, centerY - 150, 'V', voltage, 'V', '#f44336');
        
        // Draw ammeter
        this.drawMeter(ctx, centerX, centerY - 150, 'A', current.toFixed(2), 'A', '#2196f3');
        
        // Draw ohmmeter
        this.drawMeter(ctx, centerX + 200, centerY - 150, 'Ω', resistance, 'Ω', '#4caf50');
    }
    
    drawMeter(ctx, x, y, symbol, value, unit, color) {
        const meterRadius = 40;
        
        // Draw meter body
        ctx.fillStyle = '#f5f5f5';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(x, y, meterRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw meter face
        ctx.beginPath();
        ctx.arc(x, y, meterRadius - 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
        
        // Draw meter symbol
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, x, y - 10);
        
        // Draw meter value
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText(`${value} ${unit}`, x, y + 10);
    }
    
    drawCircuitExplanation(ctx, voltage, current, resistance) {
        // Draw main explanation box
        const boxWidth = 280;
        const boxHeight = 180;
        const boxX = 20;
        const boxY = 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
        ctx.fill();
        ctx.stroke();
        
        // Add title with gradient
        const titleGradient = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY);
        titleGradient.addColorStop(0, '#4361ee');
        titleGradient.addColorStop(1, '#7209b7');
        
        ctx.fillStyle = titleGradient;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('欧姆定律与电路分析', boxX + 10, boxY + 25);
        
        // Add electrical parameters with units
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText(`• 电压 (U): ${voltage} V`, boxX + 10, boxY + 50);
        ctx.fillText(`• 电流 (I): ${current.toFixed(2)} A`, boxX + 10, boxY + 70);
        ctx.fillText(`• 电阻 (R): ${resistance} Ω`, boxX + 10, boxY + 90);
        ctx.fillText(`• 功率 (P): ${(voltage * current).toFixed(2)} W`, boxX + 10, boxY + 110);
        
        // Add key formulas with different colors
        ctx.fillStyle = '#4361ee';  // Blue for Ohm's Law
        ctx.font = 'bold italic 16px Arial';
        ctx.fillText('欧姆定律: I = U/R', boxX + 10, boxY + 135);
        
        ctx.fillStyle = '#e91e63';  // Pink for Power formula
        ctx.fillText('功率公式: P = U·I', boxX + 10, boxY + 160);
        
        // Add explanation note about conventional current
        const noteBox = {
            x: boxX + 10,
            y: boxY + boxHeight + 10,
            width: boxWidth,
            height: 80
        };
        
        ctx.fillStyle = 'rgba(255, 248, 225, 0.9)';  // Light yellow for note
        ctx.strokeStyle = '#ffa000';  // Amber for note border
        ctx.beginPath();
        ctx.roundRect(noteBox.x, noteBox.y, noteBox.width, noteBox.height, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#6d4c41';  // Brown for note text
        ctx.font = 'bold 14px Arial';
        ctx.fillText('电流流向说明:', noteBox.x + 10, noteBox.y + 20);
        
        ctx.font = '13px Arial';
        ctx.fillText('• 传统电流: 从正极(+)流向负极(-)', noteBox.x + 10, noteBox.y + 40);
        ctx.fillText('• 电子流: 从负极(-)流向正极(+)', noteBox.x + 10, noteBox.y + 60);
        
        // Add educational insight about resistors and Ohm's law
        const insightBox = {
            x: boxX + boxWidth + 20,
            y: boxY,
            width: 270,
            height: 180
        };
        
        ctx.fillStyle = 'rgba(232, 245, 233, 0.9)';  // Light green for insight
        ctx.strokeStyle = '#4caf50';  // Green for insight border
        ctx.beginPath();
        ctx.roundRect(insightBox.x, insightBox.y, insightBox.width, insightBox.height, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#2e7d32';  // Dark green for insight title
        ctx.font = 'bold 16px Arial';
        ctx.fillText('电阻的作用与影响', insightBox.x + 10, insightBox.y + 25);
        
        ctx.fillStyle = '#333';
        ctx.font = '13px Arial';
        ctx.fillText('• 电阻限制电路中的电流大小', insightBox.x + 10, insightBox.y + 50);
        ctx.fillText('• 电阻越大，电流越小', insightBox.x + 10, insightBox.y + 70);
        ctx.fillText('• 并联电路的总电阻小于任一分支电阻', insightBox.x + 10, insightBox.y + 90);
        ctx.fillText('• 串联电路的总电阻是所有电阻之和', insightBox.x + 10, insightBox.y + 110);
        ctx.fillText('• 实际应用: 灯泡、电热器、保险丝等', insightBox.x + 10, insightBox.y + 130);
        ctx.fillText('• 电阻可以转化电能为热能和光能', insightBox.x + 10, insightBox.y + 150);
        
        // Draw formula transformation box (for students to learn equation manipulation)
        const formulaBox = {
            x: insightBox.x,
            y: insightBox.y + insightBox.height + 10,
            width: insightBox.width,
            height: 100
        };
        
        ctx.fillStyle = 'rgba(225, 245, 254, 0.9)';  // Light blue for formulas
        ctx.strokeStyle = '#03a9f4';  // Light blue for formula border
        ctx.beginPath();
        ctx.roundRect(formulaBox.x, formulaBox.y, formulaBox.width, formulaBox.height, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#01579b';  // Dark blue for formula title
        ctx.font = 'bold 16px Arial';
        ctx.fillText('欧姆定律的变形', formulaBox.x + 10, formulaBox.y + 25);
        
        ctx.font = 'bold 15px Arial';
        ctx.fillText('I = U/R', formulaBox.x + 30, formulaBox.y + 55);
        ctx.fillText('U = I·R', formulaBox.x + 120, formulaBox.y + 55);
        ctx.fillText('R = U/I', formulaBox.x + 210, formulaBox.y + 55);
        
        // Add explanatory arrows for formula transformation
        ctx.strokeStyle = '#0288d1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(formulaBox.x + 75, formulaBox.y + 55);
        ctx.lineTo(formulaBox.x + 100, formulaBox.y + 55);
        ctx.moveTo(formulaBox.x + 165, formulaBox.y + 55);
        ctx.lineTo(formulaBox.x + 190, formulaBox.y + 55);
        ctx.stroke();
        
        // Add arrowheads
        ctx.fillStyle = '#0288d1';
        ctx.beginPath();
        ctx.moveTo(formulaBox.x + 100, formulaBox.y + 55);
        ctx.lineTo(formulaBox.x + 95, formulaBox.y + 50);
        ctx.lineTo(formulaBox.x + 95, formulaBox.y + 60);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(formulaBox.x + 190, formulaBox.y + 55);
        ctx.lineTo(formulaBox.x + 185, formulaBox.y + 50);
        ctx.lineTo(formulaBox.x + 185, formulaBox.y + 60);
        ctx.closePath();
        ctx.fill();
        
        // Add practical example
        ctx.font = '13px Arial';
        ctx.fillStyle = '#01579b';
        ctx.fillText('例: 若U=12V，R=4Ω，则I=3A', formulaBox.x + 10, formulaBox.y + 85);
    }

    addElectricCharge() {
        if (!this.electricCharges) {
            this.electricCharges = [];
        }
        
        const canvas = this.physicsSimulator.canvases.em;
        const charge = Math.random() > 0.5 ? 1 : -1;
        
        this.electricCharges.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20,
            charge: charge,
            radius: 20
        });
        
        this.simulateElectricField();
    }

    resetElectromagnetismSimulation() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.physicsSimulator.contexts.em.clearRect(
            0, 0, 
            this.physicsSimulator.canvases.em.width, 
            this.physicsSimulator.canvases.em.height
        );
        this.electricCharges = null;
        document.getElementById('em-info').textContent = '点击画布添加电荷，观察电场分布';
    }
}

// 初始化电磁学模拟器
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.physicsSimulator) {
            window.electromagneticSimulator = new ElectromagneticSimulator(window.physicsSimulator);
        }
    }, 100);
}); 