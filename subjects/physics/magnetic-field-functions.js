// 添加缺失的磁场绘制函数
if (typeof PhysicsSimulator !== 'undefined') {
    PhysicsSimulator.prototype.drawStraightWireMagneticField = function(ctx, canvas, current) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
        ctx.lineWidth = 3;
        
        // 绘制直导线
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
        
        // 绘制圆形磁场线
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.6)';
        ctx.lineWidth = 2;
        
        for (let i = 1; i <= 5; i++) {
            const radius = i * 40;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // 导线标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('直导线 I = ' + current.toFixed(1) + ' A', centerX + 10, 30);
    };
    
    PhysicsSimulator.prototype.drawLoopMagneticField = function(ctx, canvas, current) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const loopRadius = 60;
        
        // 绘制线圈
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, loopRadius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // 绘制磁感线
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.6)';
        ctx.lineWidth = 2;
        
        // 线圈中心轴上的磁感线
        for (let i = 1; i <= 3; i++) {
            const height = i * 30;
            ctx.beginPath();
            ctx.moveTo(centerX - 20, centerY - height);
            ctx.lineTo(centerX + 20, centerY - height);
            ctx.moveTo(centerX - 20, centerY + height);
            ctx.lineTo(centerX + 20, centerY + height);
            ctx.stroke();
        }
        
        // 线圈标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('线圈 I = ' + current.toFixed(1) + ' A', centerX, centerY + loopRadius + 25);
    };
    
    PhysicsSimulator.prototype.drawSolenoidMagneticField = function(ctx, canvas, current) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const solenoidWidth = 200;
        const solenoidHeight = 100;
        
        // 绘制螺线管
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
        ctx.lineWidth = 3;
        
        // 绘制螺线管轮廓
        ctx.beginPath();
        ctx.rect(centerX - solenoidWidth/2, centerY - solenoidHeight/2, solenoidWidth, solenoidHeight);
        ctx.stroke();
        
        // 内部均匀磁场
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.7)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 8; i++) {
            const y = centerY - solenoidHeight/2 + 20 + (i * 10);
            ctx.beginPath();
            ctx.moveTo(centerX - solenoidWidth/2 + 20, y);
            ctx.lineTo(centerX + solenoidWidth/2 - 20, y);
            ctx.stroke();
        }
        
        // 螺线管标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('螺线管 I = ' + current.toFixed(1) + ' A', centerX, centerY + solenoidHeight/2 + 25);
    };
    
    PhysicsSimulator.prototype.drawHelmholtzCoilField = function(ctx, canvas, current) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const coilRadius = 50;
        const coilSeparation = 100;
        
        // 绘制两个线圈
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
        ctx.lineWidth = 4;
        
        // 左线圈
        ctx.beginPath();
        ctx.arc(centerX - coilSeparation/2, centerY, coilRadius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // 右线圈
        ctx.beginPath();
        ctx.arc(centerX + coilSeparation/2, centerY, coilRadius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // 中心区域的均匀磁场
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.7)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 5; i++) {
            const y = centerY - 40 + i * 20;
            ctx.beginPath();
            ctx.moveTo(centerX - 30, y);
            ctx.lineTo(centerX + 30, y);
            ctx.stroke();
        }
        
        // 标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('亥姆霍兹线圈 I = ' + current.toFixed(1) + ' A', centerX, centerY + coilRadius + 35);
    };
    
    PhysicsSimulator.prototype.updateMagneticFieldInfo = function(current, wireType) {
        const infoElement = document.getElementById('em-info');
        if (!infoElement) return;
        
        // 物理常数
        const mu0 = 4 * Math.PI * 1e-7; // 真空磁导率 H/m
        
        // 根据导线类型计算相关参数
        let maxFieldStrength = 0;
        let fieldDescription = '';
        let physicsFormula = '';
        let practicalInfo = '';
        
        switch (wireType) {
            case 'straight':
                maxFieldStrength = mu0 * current / (2 * Math.PI * 0.01); // 距离1cm处
                fieldDescription = '无限长直导线磁场';
                physicsFormula = 'B = μ₀I/(2πr)';
                practicalInfo = '磁场呈同心圆分布，距离导线越远磁场越弱';
                break;
                
            case 'loop':
                const loopRadius = 0.05; // 5cm
                maxFieldStrength = mu0 * current / (2 * loopRadius);
                fieldDescription = '圆形载流线圈磁场';
                physicsFormula = 'B = μ₀I/(2R) (中心处)';
                practicalInfo = '线圈中心磁场最强，沿轴线方向分布';
                break;
                
            case 'solenoid':
                const turnsPerMeter = 1000; // 假设1000匝/米
                maxFieldStrength = mu0 * turnsPerMeter * current;
                fieldDescription = '螺线管内部磁场';
                physicsFormula = 'B = μ₀nI (内部均匀)';
                practicalInfo = '内部磁场均匀，外部磁场很弱';
                break;
                
            case 'helmholtz':
                const helmholtzRadius = 0.05; // 5cm
                maxFieldStrength = (8/125) * mu0 * current / helmholtzRadius;
                fieldDescription = '亥姆霍兹线圈磁场';
                physicsFormula = 'B = (8/5√5) × μ₀I/R (中心处)';
                practicalInfo = '中心区域磁场高度均匀，常用于精密测量';
                break;
        }
        
        // 计算其他相关量
        const magneticFlux = maxFieldStrength * 0.01; // 假设面积1cm²
        const magneticEnergy = (maxFieldStrength * maxFieldStrength) / (2 * mu0);
        
        // 安全提示
        let safetyWarning = '';
        if (current > 10) {
            safetyWarning = '<span style="color: #ff6600;">⚠️ 大电流警告：注意散热和安全</span><br>';
        }
        
        infoElement.innerHTML = `
            <strong>磁场分析</strong><br>
            <strong>基本信息:</strong><br>
            磁场类型: ${fieldDescription}<br>
            电流强度: ${current.toFixed(2)} A<br>
            最大磁感应强度: ${(maxFieldStrength * 1000).toFixed(2)} mT<br>
            磁通量: ${(magneticFlux * 1000).toFixed(2)} mWb<br>
            磁能密度: ${(magneticEnergy / 1000).toFixed(2)} kJ/m³<br>
            <br>
            <strong>核心公式:</strong><br>
            ${physicsFormula}<br>
            <br>
            <strong>物理常数:</strong><br>
            真空磁导率: μ₀ = 4π×10⁻⁷ H/m<br>
            <br>
            <strong>特性说明:</strong><br>
            ${practicalInfo}<br>
            <br>
            ${safetyWarning}
            <strong>操作提示:</strong><br>
            • 调节电流滑块观察磁场变化<br>
            • 切换磁场类型对比不同形态<br>
            • 磁感线密度反映磁场强度<br>
            • 蓝色线为磁感应强度等值线
        `;
    };
} 