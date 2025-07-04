# 数学学习工具集

## 概述
数学学习工具集是一个综合性的交互式学习平台，包含函数模拟器和几何画板等工具，帮助学生从小学到高中阶段理解数学概念和培养数学思维。

## 功能特点

## 1. 函数模拟器 (Function Simulator)

### 支持的函数类型
1. **一次函数** (Linear Functions) - `y = ax + b`
2. **二次函数** (Quadratic Functions) - `y = ax² + bx + c`
3. **指数函数** (Exponential Functions) - `y = a·bˣ + c`
4. **幂函数** (Power Functions) - `y = axⁿ`
5. **对数函数** (Logarithmic Functions) - `y = a·log_b(x) + c`
6. **三角函数** (Trigonometric Functions) - `y = a·sin(bx + c) + d`
7. **有理函数** (Rational Functions) - `y = (ax + b)/(cx + d)`
8. **绝对值函数** (Absolute Value Functions) - `y = a|x - h| + k`
9. **反比例函数** (Inverse Proportional Functions) - `y = k/x + b`
10. **根式函数** (Radical Functions) - `y = a√(x - h) + k`

### 交互功能
- **参数调节**: 通过滑块和数值输入框实时调整函数参数
- **动画演示**: 观察参数变化对函数图形的影响
- **实时图表**: 使用Plotly.js绘制高质量的交互式图表
- **函数信息**: 每种函数类型都有详细的数学描述

### 响应式设计
- 桌面端: 分屏布局，参数控制面板和图表并排显示
- 移动端: 垂直布局，优先显示图表
- 触屏友好: 支持触摸滑块和按钮操作

## 2. 几何画板 (Geometry Board)

### 绘图工具
- **基础工具**: 选择、点、直线、线段、射线
- **几何图形**: 圆、矩形、三角形、多边形
- **测量工具**: 距离测量、角度测量、面积计算

### 交互功能
- **图形操作**: 选择、移动、删除图形（双击删除）
- **实时预览**: 绘制过程中显示虚线预览
- **参数调节**: 颜色选择、线条粗细调整
- **网格系统**: 可切换的坐标网格，便于精确绘图

### 辅助功能
- **坐标显示**: 鼠标位置实时显示坐标信息
- **图形统计**: 自动统计画布上的图形数量
- **测量结果**: 显示距离、角度等测量数据
- **操作提示**: 根据当前工具显示相应的操作指导

## 3. 代数工具 (Algebra Tools)

### 核心功能
- **方程求解**: 一元一次、二次方程自动求解
- **因式分解**: 多项式分解为因子乘积
- **多项式运算**: 加减乘除四则运算
- **方程组求解**: 线性方程组求解（克拉默法则）
- **表达式化简**: 代数表达式自动化简
- **科学计算器**: 支持三角函数、对数等高级运算

### 教学特色
- **步骤详解**: 每个计算都显示详细求解步骤
- **示例学习**: 丰富的例题库，点击即可加载
- **错误提示**: 智能错误检测和友好提示
- **多种方法**: 支持多种求解方法和验证

### 用户体验
- **标签式界面**: 6个功能模块，清晰分类
- **实时计算**: 输入即时反馈，所见即所得
- **响应式设计**: 完美适配桌面和移动设备
- **交互友好**: 一键清空、示例加载、快捷输入

## 技术实现

### 前端技术
- **HTML5**: 语义化结构
- **CSS3**: 现代化样式和响应式布局
- **JavaScript ES6+**: 模块化代码和现代语法
- **Canvas API**: 高性能2D图形绘制（几何画板）
- **无外部依赖**: 所有功能均使用原生Web技术实现

### 数学计算
- **函数计算**: 实时函数计算、定义域和值域处理
- **几何计算**: 距离计算、角度测量、面积计算
- **坐标变换**: 屏幕坐标与数学坐标的转换
- **数值稳定性**: 特殊点和渐近线处理优化

## 使用说明

### 函数模拟器使用方法
1. **选择函数类型**: 点击顶部的函数标签
2. **调整参数**: 使用滑块或直接输入数值
3. **观察变化**: 图表会实时更新
4. **播放动画**: 点击"播放动画"按钮观看参数动态变化
5. **重置参数**: 点击"重置"按钮恢复默认设置

### 几何画板使用方法
1. **选择工具**: 在工具栏中选择绘图工具
2. **绘制图形**: 在画布上点击或拖拽创建图形
3. **移动图形**: 选择工具模式下拖拽图形进行移动
4. **测量功能**: 使用测量工具计算距离、角度等
5. **删除图形**: 双击图形即可删除
6. **清空画布**: 点击清空按钮清除所有图形

## 教育价值

### 适用年级
- **小学**: 基础几何图形认识、简单测量
- **初中**: 一次函数、二次函数、反比例函数、几何作图
- **高中**: 指数函数、对数函数、三角函数、解析几何

### 学习目标
- **函数学习**: 理解函数概念、观察参数影响、培养数形结合思维
- **几何学习**: 掌握基本图形性质、培养空间想象能力、学习几何测量
- **数学思维**: 提高逻辑推理能力、培养数学建模思想
- **实践能力**: 通过动手操作加深对数学概念的理解

## 文件结构
```
subjects/math/
├── function-simulator.html    # 函数模拟器页面
├── geometry-board.html        # 几何画板页面
├── algebra-tools.html         # 代数工具页面
├── main.html                 # 数学学科首页
├── style.css                 # 样式文件
├── script.js                 # 脚本文件
└── README.md                 # 说明文档
```

## 浏览器兼容性
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 更新日志
- v3.0.0: 新增代数工具套件，包含方程求解、因式分解等6大功能模块
- v2.1.0: 几何画板增强：改进角度和面积测量，添加详细操作提示
- v2.0.0: 新增几何画板工具，支持多种几何图形绘制和测量
- v1.1.0: 移除外部依赖，使用原生Canvas API重写函数绘图
- v1.0.0: 初始版本，支持10种基本函数类型
- 集成到Alex的学习助手平台
- 响应式设计优化
- 动画功能实现 