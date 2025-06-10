// 标签页切换功能
function initTabs() {
    const tabs = document.querySelectorAll('.genetics-tab');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签和面板的活动状态
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // 激活当前标签和对应面板
            tab.classList.add('active');
            const panelId = tab.getAttribute('data-tab') + '-panel';
            document.getElementById(panelId).classList.add('active');
        });
    });
}

// DNA 结构标签页功能
function initDNACanvas() {
    const canvas = document.getElementById('dna-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let angle = 0;
    let animationId = null;
    
    // 使画布适应容器大小
    function resizeCanvas() {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 设置最大尺寸
        const maxWidth = Math.min(containerWidth, 400);
        const maxHeight = Math.min(containerHeight, 300);
        
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        
        // 立即重绘
        drawDNA();
    }
    
    // 初始调整和窗口大小变化时调整
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 绘制DNA双螺旋
    function drawDNA() {
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 画布缩放因子
        const scale = Math.min(width, height) / 400;
        
        // DNA 参数
        const dnaLength = height * 0.8;
        const dnaWidth = width * 0.4;
        const steps = 20;
        const stepHeight = dnaLength / steps;
        
        // 绘制背景
        ctx.fillStyle = '#f8fffe';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制DNA骨架
        for (let i = 0; i < steps; i++) {
            const y = centerY - dnaLength/2 + i * stepHeight;
            const x1 = centerX - dnaWidth/2 * Math.sin(i * 0.5 + angle);
            const x2 = centerX + dnaWidth/2 * Math.sin(i * 0.5 + angle);
            
            // 左侧骨架
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x1, y + stepHeight);
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();
            
            // 右侧骨架
            ctx.beginPath();
            ctx.moveTo(x2, y);
            ctx.lineTo(x2, y + stepHeight);
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();
            
            // 碱基对
            if (i % 2 === 0) {
                ctx.beginPath();
                ctx.moveTo(x1, y + stepHeight/2);
                ctx.lineTo(x2, y + stepHeight/2);
                
                // 随机选择碱基颜色
                const baseColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
                const baseColor = baseColors[Math.floor(Math.random() * 4)];
                
                ctx.strokeStyle = baseColor;
                ctx.lineWidth = 3 * scale;
                ctx.stroke();
                
                // 绘制碱基标记
                const baseRadius = 5 * scale;
                ctx.fillStyle = baseColor;
                ctx.beginPath();
                ctx.arc(x1, y + stepHeight/2, baseRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x2, y + stepHeight/2, baseRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // 动画旋转DNA
    function rotateDNA() {
        angle += 0.05;
        drawDNA();
        animationId = requestAnimationFrame(rotateDNA);
    }
    
    // 生成随机DNA序列
    function generateSequence() {
        const bases = ['A', 'T', 'G', 'C'];
        const length = 12;
        const sequenceDisplay = document.getElementById('sequence-display');
        
        let topStrand = '5\' - ';
        let bottomStrand = '3\' - ';
        
        for (let i = 0; i < length; i++) {
            const randomBase = bases[Math.floor(Math.random() * 4)];
            let complementaryBase;
            
            // 碱基配对规则: A-T, G-C
            switch(randomBase) {
                case 'A': complementaryBase = 'T'; break;
                case 'T': complementaryBase = 'A'; break;
                case 'G': complementaryBase = 'C'; break;
                case 'C': complementaryBase = 'G'; break;
            }
            
            topStrand += `<span class="base-${randomBase.toLowerCase()}">${randomBase}</span>`;
            bottomStrand += `<span class="base-${complementaryBase.toLowerCase()}">${complementaryBase}</span>`;
        }
        
        topStrand += ' - 3\'';
        bottomStrand += ' - 5\'';
        
        sequenceDisplay.innerHTML = `<div>${topStrand}</div><div>${bottomStrand}</div>`;
    }
    
    // 初始绘制
    drawDNA();
    
    // 按钮事件处理
    const rotateBtn = document.getElementById('rotate-dna');
    if (rotateBtn) {
        rotateBtn.addEventListener('click', function() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
                this.innerHTML = '<i class="fas fa-sync-alt"></i> 旋转DNA';
            } else {
                rotateDNA();
                this.innerHTML = '<i class="fas fa-pause"></i> 暂停旋转';
            }
        });
    }
    
    const generateBtn = document.getElementById('generate-sequence');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateSequence);
    }
    
    // DNA功能按钮事件
    const replicationBtn = document.getElementById('show-dna-replication');
    if (replicationBtn) {
        replicationBtn.addEventListener('click', function() {
            alert('DNA复制是半保守的过程，每条子链包含一条原链和一条新链。包括解旋、引物合成、延伸和校对等步骤。');
        });
    }
    
    // DNA结构互动按钮
    const basePairingBtn = document.getElementById('show-base-pairing');
    if (basePairingBtn) {
        basePairingBtn.addEventListener('click', function() {
            alert('DNA中的碱基遵循特定的配对规则：腺嘌呤(A)与胸腺嘧啶(T)通过两个氢键配对，鸟嘌呤(G)与胞嘧啶(C)通过三个氢键配对。');
        });
    }
    
    const dnaFormsBtn = document.getElementById('show-dna-forms');
    if (dnaFormsBtn) {
        dnaFormsBtn.addEventListener('click', function() {
            alert('DNA可以存在于几种不同的结构形式中：B型DNA（最常见的右手螺旋）、A型DNA（更宽更短的右手螺旋）、Z型DNA（左手螺旋）等。');
        });
    }
    
    const dnaDamageBtn = document.getElementById('show-dna-damage');
    if (dnaDamageBtn) {
        dnaDamageBtn.addEventListener('click', function() {
            alert('DNA可能因紫外线、化学物质或电离辐射而损伤。细胞具有多种修复机制，如碱基切除修复、核苷酸切除修复、错配修复和同源重组修复等。');
        });
    }
}

// 基因组学标签页防溢出处理
function fixGenomicsOverflow() {
    const analysisPanel = document.getElementById('analysis-panel');
    if (!analysisPanel) return;
    
    // 确保所有资源链接都被正确包含
    const resourceLinks = analysisPanel.querySelectorAll('.resource-link');
    resourceLinks.forEach(link => {
        // 确保链接在容器中不会溢出
        link.style.display = 'inline-flex';
        link.style.maxWidth = '100%';
        link.style.wordBreak = 'break-word';
        link.style.overflowWrap = 'break-word';
    });
    
    // 确保所有图片都是响应式的
    const images = analysisPanel.querySelectorAll('img');
    images.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
    });
    
    // 处理数据库链接部分
    const databaseLinks = analysisPanel.querySelector('.database-links');
    if (databaseLinks) {
        databaseLinks.style.display = 'flex';
        databaseLinks.style.flexWrap = 'wrap';
        databaseLinks.style.gap = '1rem';
    }
}

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 初始化各种功能
    initTabs();
    initDNACanvas();
    fixGenomicsOverflow();
    
    // 测试用随机DNA序列生成
    const generateSequenceBtn = document.getElementById('generate-sequence');
    if (generateSequenceBtn) {
        generateSequenceBtn.click();
    }
    
    // 设置各种测验的事件处理
    const quizBtns = document.querySelectorAll('[id^="check-"][id$="-quiz"]');
    quizBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const quizId = this.id.replace('check-', '');
            const questions = document.querySelectorAll(`#${quizId} .quiz-question`);
            
            questions.forEach(question => {
                const selected = question.querySelector('.quiz-option.selected');
                const correct = question.querySelector('.quiz-option[data-correct="true"]');
                const feedback = question.querySelector('.quiz-feedback');
                
                if (selected) {
                    if (selected.hasAttribute('data-correct')) {
                        selected.classList.add('correct');
                        feedback.textContent = '✓ 正确答案!';
                        feedback.classList.add('correct');
                    } else {
                        selected.classList.add('incorrect');
                        correct.classList.add('correct');
                        feedback.textContent = '✗ 错误答案。正确答案已标出。';
                        feedback.classList.add('incorrect');
                    }
                } else {
                    feedback.textContent = '请选择一个答案。';
                    feedback.classList.add('incorrect');
                }
            });
        });
    });
    
    // 为测验选项添加选择功能
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除同一问题中的其他选中状态
            const question = this.closest('.quiz-question');
            question.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected', 'correct', 'incorrect');
            });
            
            // 移除反馈
            const feedback = question.querySelector('.quiz-feedback');
            feedback.textContent = '';
            feedback.className = 'quiz-feedback';
            
            // 选中当前选项
            this.classList.add('selected');
        });
    });
}); 