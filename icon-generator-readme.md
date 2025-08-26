# AI图标生成器

一个基于GLM AI模型的智能SVG图标生成器，可以根据用户描述自动生成精美的SVG图标。

## 功能特点

- 🎨 **智能需求优化** - 使用AI优化用户的图标描述，生成更具体、更专业的需求
- 🖼️ **SVG图标生成** - 基于优化后的需求自动生成高质量的SVG图标
- 🎯 **多种设计风格** - 支持极简、扁平、线框、渐变、3D、卡通等多种风格
- 🎨 **自定义颜色** - 支持自定义主色调和辅助色
- 📱 **响应式设计** - 完美适配PC端和移动端
- 💾 **多格式下载** - 支持SVG和PNG格式下载
- ⚡ **实时预览** - 即时预览生成的图标效果

## 使用方法

### 1. 访问图标生成器

在浏览器中打开：`http://localhost:8000/icon-generator.html`

### 2. 输入图标需求

在"图标描述"文本框中输入您想要的图标描述，例如：
- "一个现代化的购物车图标，蓝色渐变，简洁风格"
- "可爱的猫咪头像，粉色系，卡通风格"
- "科技感的齿轮图标，金属质感，3D效果"

### 3. 选择设计参数

- **图标尺寸**：选择64x64、128x128、256x256或512x512像素
- **设计风格**：点击选择极简、扁平、线框、渐变、3D或卡通风格
- **颜色配置**：选择主色调和辅助色

### 4. 生成图标

点击"生成图标"按钮，系统会：
1. 使用GLM AI优化您的需求描述
2. 基于优化后的描述生成SVG图标
3. 在右侧预览区域显示生成的图标

### 5. 下载图标

生成完成后，您可以：
- **下载SVG**：获得矢量格式的图标文件，可无限缩放
- **下载PNG**：获得指定尺寸的位图格式图标

## 技术架构

### 前端组件

- **HTML/CSS/JavaScript** - 响应式用户界面
- **现代CSS技术** - 使用Grid、Flexbox和媒体查询实现响应式设计
- **原生JavaScript** - 无依赖的纯JS实现

### 后端API

- **icon-generator.js** - 专门的图标生成API
- **GLM AI模型** - 智能需求优化和SVG代码生成
- **CORS支持** - 跨域请求处理

### 文件结构

```
├── icon-generator.html          # 主页面
├── functions/api/
│   ├── icon-generator.js        # 图标生成API
│   └── icon-route.js           # 路由处理
└── icon-generator-readme.md    # 说明文档
```

## API接口说明

### 优化需求接口

**端点**：`POST /api/icon-generator`

**请求参数**：
```json
{
  "message": "用户输入的图标描述",
  "temperature": 0.7,
  "action": "optimize"
}
```

**响应格式**：
```json
{
  "success": true,
  "action": "optimize",
  "original_prompt": "原始需求",
  "optimized_prompt": "优化后的需求",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 生成图标接口

**端点**：`POST /api/icon-generator`

**请求参数**：
```json
{
  "message": "优化后的图标需求",
  "temperature": 0.3,
  "action": "generate"
}
```

**响应格式**：
```json
{
  "success": true,
  "action": "generate",
  "prompt": "使用的需求描述",
  "svg_code": "完整的SVG代码",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 响应式设计

### 移动端优化 (< 768px)
- 单列布局，垂直排列输入和输出区域
- 简化的导航和控件
- 触控友好的按钮尺寸（最小48×48px）
- 优化的字体大小和间距

### 平板端适配 (768-1024px)
- 适当的间距和字体大小
- 触控和鼠标操作兼容
- 灵活的网格布局

### 桌面端增强 (> 1024px)
- 双列布局，并排显示输入和输出
- 完整的功能展示
- 悬停效果和精确交互

## 部署说明

### 本地开发

1. 确保安装了Python 3.x
2. 在项目根目录运行：
   ```bash
   python -m http.server 8000
   ```
3. 在浏览器中访问：`http://localhost:8000/icon-generator.html`

### 生产环境部署

1. 配置Cloudflare Workers环境变量
2. 部署API函数到Cloudflare Workers
3. 配置路由规则
4. 上传静态文件到CDN

## 故障排除

### 常见问题

**Q: 图标生成失败**
A: 检查网络连接，确保API服务正常运行，验证GLM API密钥配置

**Q: SVG显示异常**
A: 检查生成的SVG代码格式，确保包含必要的XML声明和命名空间

**Q: 下载功能不工作**
A: 确保浏览器支持Blob API和文件下载功能

### 调试方法

1. 打开浏览器开发者工具（F12）
2. 查看Console标签页的错误信息
3. 检查Network标签页的API请求状态
4. 验证响应数据的格式和内容

## 参考资源

- [SVGMaker](https://svgmaker.io/) - 灵感来源
- [GLM AI文档](https://open.bigmodel.cn/) - AI模型文档
- [SVG规范](https://www.w3.org/TR/SVG/) - SVG技术标准

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**注意**：使用本工具需要有效的GLM API密钥和相应的网络环境配置。