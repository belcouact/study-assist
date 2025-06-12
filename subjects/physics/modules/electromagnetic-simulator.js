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
        
        // 初始化磁铁的运动状态（如果未初始化）
        if (!this.magnetMotionState) {
            this.magnetMotionState = {
                startTime: Date.now() * 0.001,
                mode: 'oscillate', // 'oscillate'=振荡, 'move_away'=远离, 'reset'=重置
                lastModeChangeTime: Date.now() * 0.001,
                distanceFromCoil: 0,
                direction: 1  // 1=向右, -1=向左
            };
        }
        
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
            
            // 当前时间
            const currentTime = Date.now() * 0.001;
            const elapsedTime = currentTime - this.magnetMotionState.startTime;
            const oscillationSpeed = magnetSpeed * 0.02;
            
            // 根据当前模式计算磁铁位置
            let magnetX, magnetVelocity;
            
            if (this.magnetMotionState.mode === 'oscillate') {
                // 标准的左右振荡运动
                magnetX = coilX - 150 + 300 * Math.sin(elapsedTime * oscillationSpeed);
                magnetVelocity = 300 * oscillationSpeed * Math.cos(elapsedTime * oscillationSpeed);
                
                // 每10秒切换一次到远离模式
                if (currentTime - this.magnetMotionState.lastModeChangeTime > 10) {
                    this.magnetMotionState.mode = 'move_away';
                    this.magnetMotionState.lastModeChangeTime = currentTime;
                    this.magnetMotionState.direction = Math.random() > 0.5 ? 1 : -1; // 随机选择向左或向右远离
                    this.magnetMotionState.distanceFromCoil = Math.abs(magnetX - coilX);
                }
            } else if (this.magnetMotionState.mode === 'move_away') {
                // 横向远离线圈的运动
                const moveTime = currentTime - this.magnetMotionState.lastModeChangeTime;
                const maxDistance = canvas.width * 0.4; // 最大移动距离为画布宽度的40%
                
                // 随时间加速远离
                const distanceMultiplier = Math.min(1, moveTime / 3); // 3秒内加速到最大速度
                const moveDistance = maxDistance * distanceMultiplier;
                
                // 计算当前位置
                magnetX = coilX + (this.magnetMotionState.direction * moveDistance);
                
                // 计算速度（用于感应电流方向）
                magnetVelocity = this.magnetMotionState.direction * magnetSpeed * (1 - distanceMultiplier * 0.8);
                
                // 如果移动时间超过5秒，则重置磁铁位置
                if (moveTime > 5) {
                    this.magnetMotionState.mode = 'reset';
                    this.magnetMotionState.lastModeChangeTime = currentTime;
                }
            } else if (this.magnetMotionState.mode === 'reset') {
                // 重置磁铁位置（快速回到线圈附近）
                const resetTime = currentTime - this.magnetMotionState.lastModeChangeTime;
                const resetDuration = 1.0; // 1秒内完成重置
                
                if (resetTime < resetDuration) {
                    // 线性插值回到起始位置
                    const targetX = coilX - 150; // 起始位置
                    const startX = coilX + (this.magnetMotionState.direction * canvas.width * 0.4);
                    const progress = resetTime / resetDuration;
                    
                    magnetX = startX + (targetX - startX) * progress;
                    magnetVelocity = (targetX - startX) / resetDuration;
                } else {
                    // 重置完成，切换回振荡模式
                    this.magnetMotionState.mode = 'oscillate';
                    this.magnetMotionState.lastModeChangeTime = currentTime;
                    this.magnetMotionState.startTime = currentTime;
                    
                    // 开始新的振荡
                    magnetX = coilX - 150;
                    magnetVelocity = 0;
                }
            }
            
            // 计算到线圈的距离和感应电动势
            const distanceToCoil = Math.abs(magnetX - coilX);
            const fluxChange = magnetStrength * Math.abs(magnetVelocity) * 0.01;
            
            // 随距离增加，感应电动势减弱
            const distanceFactor = Math.max(0, 1 - Math.pow(distanceToCoil / (canvas.width * 0.4), 2));
            const inducedEMF = fluxChange * coilTurns * distanceFactor;
            
            // 感应电流方向取决于磁铁运动方向和相对位置
            const currentDirection = -Math.sign(magnetVelocity) * Math.sign(magnetX - coilX);
            
            // 绘制实验装置
            this.drawExperimentBackground(ctx, canvas.width, canvas.height);
            this.drawCoil(ctx, coilX, coilY, coilWidth, coilHeight, coilTurns, inducedEMF, currentDirection);
            this.drawGalvanometer(ctx, coilX, coilY - 180, inducedEMF * 20 * currentDirection);
            
            // 绘制磁铁及磁场
            this.drawMagnet(ctx, magnetX, coilY, magnetStrength);
            this.drawMagneticFieldAround(ctx, magnetX, coilY, magnetStrength);
            this.drawMagneticFlux(ctx, coilX, coilY, coilWidth, coilHeight, magnetX, magnetStrength);
            
            // 绘制说明和图表
            this.drawInductionExplanation(ctx, coilTurns, magnetSpeed, magnetStrength, inducedEMF, magnetVelocity);
            this.drawInductionGraphs(ctx, canvas.width, canvas.height, elapsedTime, oscillationSpeed, inducedEMF);
            
            // 显示法拉第定律公式
            ctx.fillStyle = '#4361ee';
            ctx.font = 'italic 16px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('ℰ = -N · dΦ/dt', canvas.width - 30, canvas.height - 30);
            
            // 继续动画
            this.animationId = requestAnimationFrame(animate);
        };
        
        // 开始动画
        this.isRunning = true;
        animate();
        
        // 更新信息面板
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
        const canvasWidth = ctx.canvas.width;
        
        // 计算磁铁与线圈之间的距离
        const distanceToCoil = Math.abs(magnetX - coilX);
        const maxDistance = canvasWidth * 0.4; // 最大考虑距离为画布宽度的40%
        
        // 根据距离计算磁通量密度（使用二次反比函数提供更平滑的过渡）
        const distanceFactor = Math.max(0, 1 - Math.pow(distanceToCoil / maxDistance, 2));
        const fluxDensity = distanceFactor * magnetStrength;
        
        // 如果磁通量密度太小，则不显示
        if (fluxDensity < 0.05) return;
        
        // 绘制穿过线圈的磁力线
        ctx.strokeStyle = `rgba(114, 9, 183, ${fluxDensity * 0.6})`;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        
        // 磁力线数量根据密度动态调整
        const linesCount = Math.max(1, Math.floor(fluxDensity * 12));
        const step = coilWidth / (linesCount + 1);
        
        // 磁力线倾斜角度基于磁铁相对位置
        const angle = Math.atan2(coilY - coilY, magnetX - coilX);
        const bendFactor = Math.min(0.3, distanceToCoil / maxDistance * 0.5); // 控制弯曲程度
        
        for (let i = 1; i <= linesCount; i++) {
            const x = coilX - coilWidth/2 + i * step;
            
            // 根据磁铁位置调整磁力线
            const magnetDirection = Math.sign(magnetX - coilX);
            const lineOffset = magnetDirection * bendFactor * 100;
            
            // 绘制弯曲的磁力线，表示磁铁位置的影响
            ctx.beginPath();
            
            // 绘制上半部分磁力线
            ctx.moveTo(x, coilY - coilHeight/2 - 40);
            ctx.bezierCurveTo(
                x + lineOffset, coilY - coilHeight/2 - 20,
                x, coilY - coilHeight/4,
                x, coilY
            );
            
            // 绘制下半部分磁力线
            ctx.moveTo(x, coilY);
            ctx.bezierCurveTo(
                x, coilY + coilHeight/4,
                x + lineOffset, coilY + coilHeight/2 + 20,
                x, coilY + coilHeight/2 + 40
            );
            
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // 如果磁通量显著，添加方向指示箭头
        if (fluxDensity > 0.15) {
            ctx.fillStyle = `rgba(114, 9, 183, ${fluxDensity * 0.8})`;
            
            for (let i = 1; i <= linesCount; i++) {
                if (i % 2 === 0) continue; // 只在部分线上添加箭头，避免过度拥挤
                
                const x = coilX - coilWidth/2 + i * step;
                
                // 磁力线上的箭头
                const arrowAngle = Math.PI/2 + bendFactor * Math.sign(magnetX - coilX);
                this.drawArrowhead(ctx, x, coilY, arrowAngle, 6);
                
                // 磁力线末端的箭头，根据位置调整角度
                const topArrowAngle = Math.PI/2 - bendFactor * 2 * Math.sign(magnetX - coilX);
                const bottomArrowAngle = Math.PI/2 + bendFactor * 2 * Math.sign(magnetX - coilX);
                
                this.drawArrowhead(ctx, x, coilY - coilHeight/2 - 20, topArrowAngle, 6);
                this.drawArrowhead(ctx, x, coilY + coilHeight/2 + 20, bottomArrowAngle, 6);
            }
            
            // 磁通量标签，随着磁通量密度变化透明度
            ctx.fillStyle = `rgba(114, 9, 183, ${fluxDensity * 0.9})`;
            ctx.font = 'italic 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Φ', coilX, coilY - coilHeight/2 - 50);
            
            // 显示磁通量变化率
            const changeFactor = Math.min(1, distanceToCoil / 100);
            if (changeFactor > 0.1 && changeFactor < 0.9) {
                ctx.fillStyle = `rgba(255, 102, 0, ${(1 - changeFactor) * 0.9})`;
                ctx.font = 'italic 14px Arial';
                ctx.fillText('dΦ/dt', coilX + 50, coilY - coilHeight/2 - 50);
            }
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
        // 绘制图表容器 - 增加高度以容纳双图表
        const graphWidth = 280;
        const graphHeight = 180;
        const graphX = width - graphWidth - 20;
        const graphY = 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(graphX, graphY, graphWidth, graphHeight, 8);
        ctx.fill();
        ctx.stroke();
        
        // 分隔上下两个图表
        const dividerY = graphY + graphHeight * 0.55;
        ctx.beginPath();
        ctx.moveTo(graphX + 10, dividerY);
        ctx.lineTo(graphX + graphWidth - 10, dividerY);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
        
        // ===== 上半部分：磁通量和感应电动势图 =====
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('磁通量和感应电动势', graphX + graphWidth/2, graphY + 15);
        
        // 绘制坐标轴
        const upperGraphTop = graphY + 30;
        const upperGraphBottom = dividerY - 10;
        const upperGraphLeft = graphX + 40;
        const upperGraphRight = graphX + graphWidth - 20;
        const upperGraphHeight = upperGraphBottom - upperGraphTop;
        const upperGraphMidY = upperGraphTop + upperGraphHeight / 2;
        
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        // Y轴
        ctx.moveTo(upperGraphLeft, upperGraphTop);
        ctx.lineTo(upperGraphLeft, upperGraphBottom);
        // X轴 (零线)
        ctx.moveTo(upperGraphLeft, upperGraphMidY);
        ctx.lineTo(upperGraphRight, upperGraphMidY);
        ctx.stroke();
        
        // 坐标轴标签
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('电动势/磁通量', upperGraphLeft - 5, upperGraphTop + 10);
        
        ctx.textAlign = 'center';
        ctx.fillText('时间', (upperGraphLeft + upperGraphRight) / 2, upperGraphBottom + 10);
        
        // 绘制磁通量曲线
        ctx.beginPath();
        const timeRange = 8; // 显示8秒数据
        const pixelsPerSecond = (upperGraphRight - upperGraphLeft) / timeRange;
        
        for (let x = 0; x <= upperGraphRight - upperGraphLeft; x++) {
            const t = time - timeRange + x / pixelsPerSecond;
            if (t < 0) continue;
            
            // 根据磁铁运动状态计算磁通量
            let fluxValue;
            
            if (this.magnetMotionState && this.magnetMotionState.mode === 'move_away') {
                // 远离模式：磁通量随距离增加而减小
                const moveTime = time - this.magnetMotionState.lastModeChangeTime;
                const distance = Math.min(1, moveTime / 5); // 5秒内远离
                fluxValue = Math.max(0, 1 - Math.pow(distance, 2)) * Math.sin(t * oscillationSpeed * 0.2);
            } 
            else if (this.magnetMotionState && this.magnetMotionState.mode === 'reset') {
                // 重置模式：磁通量逐渐回到原始状态
                const resetTime = time - this.magnetMotionState.lastModeChangeTime;
                const resetProgress = Math.min(1, resetTime);
                fluxValue = resetProgress * Math.sin(t * oscillationSpeed * 0.2);
            }
            else {
                // 标准振荡模式
                fluxValue = Math.sin(t * oscillationSpeed);
            }
            
            const y = upperGraphMidY - fluxValue * (upperGraphHeight / 3);
            
            if (x === 0) {
                ctx.moveTo(upperGraphLeft + x, y);
            } else {
                ctx.lineTo(upperGraphLeft + x, y);
            }
        }
        
        ctx.strokeStyle = 'rgba(65, 105, 225, 0.8)'; // 磁通量用蓝色
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 绘制感应电动势曲线
        ctx.beginPath();
        
        for (let x = 0; x <= upperGraphRight - upperGraphLeft; x++) {
            const t = time - timeRange + x / pixelsPerSecond;
            if (t < 0) continue;
            
            // 根据磁铁运动状态计算感应电动势
            let emfValue;
            
            if (this.magnetMotionState && this.magnetMotionState.mode === 'move_away') {
                // 远离模式：感应电动势由磁通量变化率决定
                const moveTime = time - this.magnetMotionState.lastModeChangeTime;
                const distance = Math.min(1, moveTime / 5);
                // 远离时感应电动势是磁通量变化率
                const changeRate = -2 * distance * (1 - Math.pow(distance, 2)) * Math.sin(t * oscillationSpeed * 0.2) 
                                 + Math.max(0, 1 - Math.pow(distance, 2)) * Math.cos(t * oscillationSpeed * 0.2) * oscillationSpeed * 0.2;
                emfValue = changeRate * 2;
            } 
            else if (this.magnetMotionState && this.magnetMotionState.mode === 'reset') {
                // 重置模式：有短暂的高感应电动势
                const resetTime = time - this.magnetMotionState.lastModeChangeTime;
                if (resetTime < 1) {
                    emfValue = Math.sin(t * oscillationSpeed * 0.2) * 2;
                } else {
                    emfValue = Math.cos(t * oscillationSpeed * 0.2) * oscillationSpeed * 0.2;
                }
            }
            else {
                // 振荡模式：感应电动势是磁通量的导数
                emfValue = Math.cos(t * oscillationSpeed) * oscillationSpeed;
            }
            
            const y = upperGraphMidY - emfValue * (upperGraphHeight / 3);
            
            if (x === 0) {
                ctx.moveTo(upperGraphLeft + x, y);
            } else {
                ctx.lineTo(upperGraphLeft + x, y);
            }
        }
        
        ctx.strokeStyle = 'rgba(233, 30, 99, 0.8)'; // 感应电动势用红色
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 添加图例
        ctx.fillStyle = 'rgba(65, 105, 225, 0.8)';
        ctx.fillRect(upperGraphRight - 100, upperGraphTop, 10, 5);
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        ctx.fillText('磁通量 Φ', upperGraphRight - 85, upperGraphTop + 5);
        
        ctx.fillStyle = 'rgba(233, 30, 99, 0.8)';
        ctx.fillRect(upperGraphRight - 100, upperGraphTop + 15, 10, 5);
        ctx.fillStyle = '#333';
        ctx.fillText('感应电动势 ℰ', upperGraphRight - 85, upperGraphTop + 20);
        
        // ===== 下半部分：磁铁位置示意图 =====
        const lowerGraphTop = dividerY + 10;
        const lowerGraphBottom = graphY + graphHeight - 20;
        const lowerGraphLeft = upperGraphLeft;
        const lowerGraphRight = upperGraphRight;
        const lowerGraphHeight = lowerGraphBottom - lowerGraphTop;
        const lowerGraphMidY = lowerGraphTop + lowerGraphHeight / 2;
        
        // 绘制坐标轴
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        // Y轴
        ctx.moveTo(lowerGraphLeft, lowerGraphTop);
        ctx.lineTo(lowerGraphLeft, lowerGraphBottom);
        // X轴
        ctx.moveTo(lowerGraphLeft, lowerGraphMidY);
        ctx.lineTo(lowerGraphRight, lowerGraphMidY);
        ctx.stroke();
        
        // 标签
        ctx.textAlign = 'center';
        ctx.fillText('磁铁位置', (lowerGraphLeft + lowerGraphRight) / 2, lowerGraphBottom + 10);
        
        ctx.save();
        ctx.translate(lowerGraphLeft - 10, (lowerGraphTop + lowerGraphBottom) / 2);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign = 'center';
        ctx.fillText('距离线圈', 0, 0);
        ctx.restore();
        
        // 在中央绘制线圈位置标记
        ctx.beginPath();
        const coilX = (lowerGraphLeft + lowerGraphRight) / 2;
        ctx.moveTo(coilX, lowerGraphTop);
        ctx.lineTo(coilX, lowerGraphBottom);
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 线圈标签
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.fillText('线圈', coilX, lowerGraphTop - 2);
        
        // 绘制磁铁位置曲线
        ctx.beginPath();
        
        for (let x = 0; x <= lowerGraphRight - lowerGraphLeft; x++) {
            const t = time - timeRange + x / pixelsPerSecond;
            if (t < 0) continue;
            
            // 计算磁铁位置
            let magnetPosition;
            
            if (this.magnetMotionState && this.magnetMotionState.mode === 'move_away') {
                // 远离模式
                const moveTime = time - this.magnetMotionState.lastModeChangeTime;
                const maxDistance = 0.8; // 最大距离因子
                
                // 随时间加速远离
                const distance = Math.min(maxDistance, Math.pow(moveTime / 5, 2) * maxDistance);
                
                // 方向由magnetMotionState.direction决定
                const direction = this.magnetMotionState.direction || 1;
                magnetPosition = distance * direction;
            } 
            else if (this.magnetMotionState && this.magnetMotionState.mode === 'reset') {
                // 重置模式
                const resetTime = time - this.magnetMotionState.lastModeChangeTime;
                const resetDuration = 1.0;
                
                if (resetTime < resetDuration) {
                    // 线性插值回到原位
                    const direction = this.magnetMotionState.direction || 1;
                    const startPos = 0.8 * direction;
                    const progress = resetTime / resetDuration;
                    magnetPosition = startPos * (1 - progress);
                } else {
                    magnetPosition = 0;
                }
            }
            else {
                // 振荡模式
                magnetPosition = Math.sin(t * oscillationSpeed) * 0.4;
            }
            
            // 计算图上的Y坐标
            const y = lowerGraphMidY - magnetPosition * lowerGraphHeight / 2;
            
            if (x === 0) {
                ctx.moveTo(lowerGraphLeft + x, y);
            } else {
                ctx.lineTo(lowerGraphLeft + x, y);
            }
        }
        
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)'; // 磁铁位置用绿色
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制当前磁铁位置标记
        let currentMagnetPosition;
        if (this.magnetMotionState) {
            if (this.magnetMotionState.mode === 'move_away') {
                const moveTime = time - this.magnetMotionState.lastModeChangeTime;
                const maxDistance = 0.8;
                const distance = Math.min(maxDistance, Math.pow(moveTime / 5, 2) * maxDistance);
                currentMagnetPosition = distance * this.magnetMotionState.direction;
            } 
            else if (this.magnetMotionState.mode === 'reset') {
                const resetTime = time - this.magnetMotionState.lastModeChangeTime;
                const resetDuration = 1.0;
                
                if (resetTime < resetDuration) {
                    const direction = this.magnetMotionState.direction;
                    const startPos = 0.8 * direction;
                    const progress = resetTime / resetDuration;
                    currentMagnetPosition = startPos * (1 - progress);
                } else {
                    currentMagnetPosition = 0;
                }
            }
            else {
                currentMagnetPosition = Math.sin(time * oscillationSpeed) * 0.4;
            }
        } else {
            currentMagnetPosition = Math.sin(time * oscillationSpeed) * 0.4;
        }
        
        const currentY = lowerGraphMidY - currentMagnetPosition * lowerGraphHeight / 2;
        
        // 绘制当前位置的磁铁图标
        ctx.fillStyle = 'rgba(76, 175, 80, 1)';
        ctx.beginPath();
        ctx.arc(lowerGraphRight, currentY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加"磁铁"标签
        ctx.fillStyle = 'rgba(76, 175, 80, 1)';
        ctx.textAlign = 'left';
        ctx.fillText('磁铁', lowerGraphRight + 10, currentY + 5);
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
        
        // 重置电磁感应相关状态
        this.magnetMotionState = null;
        
        // 重置电场相关状态
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