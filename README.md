# 学习助手 - AI辅助学习平台

这是一个面向小学生到高中生的AI辅助学习网站，提供多学科学习支持，包括问答、测验、单词学习、诗词鉴赏和历史事件追溯等功能。

## 项目介绍

学习助手是一个旨在通过AI技术辅助学生学习的平台，具有以下特点：

- **多学科支持**：覆盖数学、英语、语文、历史等多个学科
- **学段适配**：根据不同年级调整内容难度，适合小学生到高中生
- **即时反馈**：测验和问答提供即时反馈
- **进度追踪**：显示学习进度和成绩
- **趣味学习**：通过游戏化元素增强学习动力

## 技术实现

本项目使用原生HTML、CSS和JavaScript实现，不依赖任何框架，便于部署和维护。主要技术特点：

- 响应式设计，适配不同设备屏幕大小
- 模块化CSS结构，包括通用样式、组件样式和工具类样式
- 基于对象的JavaScript架构，实现功能的分离与复用
- LocalStorage实现简单的用户数据存储
- 学科特定功能（如数学公式渲染）

## 项目结构

```
study-assist/
├── assets/                     # 静态资源
│   ├── images/                 # 公共图片
│   ├── fonts/                  # 字体文件
│   └── icons/                  # 图标资源
├── index.html                  # 主入口页面
├── css/
│   ├── common.css              # 通用样式(布局/颜色变量/字体等)
│   ├── components.css          # 公共组件样式
│   ├── utilities.css           # 工具类(Tailwind风格)
│   └── responsive.css          # 响应式设计
├── js/
│   ├── common.js               # 通用功能(初始化/工具函数)
│   ├── navigation.js           # 导航控制
│   ├── auth.js                 # 认证相关
│   └── api.js                  # API请求封装
└── subjects/                   # 各科目目录
    ├── _template/              # 科目模板(供新建科目复制)
    │   ├── main.html
    │   ├── script.js
    │   └── style.css
    ├── math/                   # 数学科目
    │   ├── main.html
    │   ├── script.js
    │   ├── style.css
    │   └── pages/              # 数学子页面
    │       ├── qa.html         # 问答页面
    │       ├── quiz.html       # 测验页面
    │       └── ...
    ├── english/                # 英语科目
    ├── chinese/                # 语文科目
    └── history/                # 历史科目
```

## 本地运行

由于项目使用原生技术栈，无需复杂的构建过程，可以直接通过以下方式运行：

1. 克隆项目到本地
```
git clone https://github.com/yourusername/study-assist.git
```

2. 使用本地服务器打开项目（避免CORS问题）
```
# 使用Python内置服务器
python -m http.server

# 或使用Node.js的http-server
npx http-server
```

3. 在浏览器中访问 `http://localhost:8000`

## 扩展功能

项目设计了良好的扩展性，可以方便地添加新功能：

1. 添加新学科：复制`subjects/_template`目录并修改相应内容
2. 添加新功能模块：扩展JS功能并在HTML中添加对应UI元素
3. 集成真实AI服务：修改`api.js`中的相关接口，连接到实际的AI服务

## 贡献

欢迎贡献代码、报告问题或提出改进建议。请通过以下方式参与：

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交修改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 详见LICENSE文件

## 联系方式

如有疑问或建议，请通过以下方式联系：

- 邮箱：your.email@example.com
- 项目主页：https://github.com/yourusername/study-assist