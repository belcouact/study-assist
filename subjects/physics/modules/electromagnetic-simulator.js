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
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw magnetic field visualization
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('磁场模拟', canvas.width / 2, 50);
        ctx.fillText('(完整功能开发中)', canvas.width / 2, 80);
        
        // Basic magnetic field pattern
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw current-carrying wire
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(centerX, 100);
        ctx.lineTo(centerX, canvas.height - 100);
        ctx.stroke();
        
        // Draw magnetic field circles
        ctx.strokeStyle = 'rgba(255, 107, 53, 0.7)';
        ctx.lineWidth = 2;
        for (let r = 50; r < 200; r += 30) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        document.getElementById('em-info').innerHTML = `
            磁场强度设置<br>
            电流设置<br>
            磁场可视化
        `;
    }

    simulateElectromagneticInduction() {
        const canvas = this.physicsSimulator.canvases.em;
        const ctx = this.physicsSimulator.contexts.em;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw coil and magnet
        const coilX = canvas.width / 2;
        const coilY = canvas.height / 2;
        
        // Draw coil
        ctx.strokeStyle = '#4361ee';
        ctx.lineWidth = 4;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(coilX, coilY + i * 10, 40, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Draw moving magnet
        const magnetX = coilX - 100 + 50 * Math.sin(Date.now() * 0.002);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(magnetX - 20, coilY - 15, 40, 30);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', magnetX - 10, coilY + 5);
        ctx.fillText('S', magnetX + 10, coilY + 5);
        
        // Continue animation
        if (this.isRunning) {
            this.animationId = requestAnimationFrame(() => this.simulateElectromagneticInduction());
        }
        
        document.getElementById('em-info').innerHTML = `
            线圈匝数设置<br>
            磁铁运动<br>
            感应电流分析
        `;
    }

    simulateCircuit() {
        const canvas = this.physicsSimulator.canvases.em;
        const ctx = this.physicsSimulator.contexts.em;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Simple DC circuit visualization
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw circuit components
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        
        // Battery
        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY - 50);
        ctx.lineTo(centerX - 100, centerY + 50);
        ctx.stroke();
        
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 90, centerY - 30);
        ctx.lineTo(centerX - 90, centerY + 30);
        ctx.stroke();
        
        // Resistor
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(centerX + 50, centerY - 15, 60, 30);
        ctx.stroke();
        
        // Connecting wires
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY - 50);
        ctx.lineTo(centerX + 50, centerY - 50);
        ctx.lineTo(centerX + 50, centerY - 15);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 110, centerY + 15);
        ctx.lineTo(centerX + 110, centerY + 50);
        ctx.lineTo(centerX - 100, centerY + 50);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('V', centerX - 120, centerY + 5);
        ctx.fillText('R', centerX + 80, centerY + 5);
        
        document.getElementById('em-info').innerHTML = `
            电压设置<br>
            电阻分析<br>
            电路特性
        `;
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