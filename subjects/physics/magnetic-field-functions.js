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
} 