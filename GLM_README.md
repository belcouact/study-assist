# GLM-4.5 Cloudflare Worker

这个项目包含一个 Cloudflare Worker，用于连接到 GLM-4.5 大语言模型，并提供了一个响应式的测试页面来测试模型功能。

## 文件结构

```
functions/api/
├── glm-worker.js          # GLM-4.5 模型连接器
├── glm-chat.js           # GLM-4.5 API 端点处理器
├── glm-route.js          # 路由转发器
└── ...

glm-test.html            # 响应式测试页面
```

## 设置说明

### 1. 环境变量配置

在 Cloudflare Workers 中设置以下环境变量：

```bash
# GLM-4.5 API 密钥
GLM_API_KEY=your_glm_api_key_here
```

### 2. 部署 Worker

将以下文件部署到 Cloudflare Workers：

- `workers/glm-worker.js` (主 Worker 文件)
- `functions/api/glm-worker.js` (GLM-4.5 模型连接器)
- `functions/api/glm-chat.js` (API 端点处理器)
- `functions/api/glm-route.js` (路由转发器)

### 3. 路由配置

在 `wrangler.toml` 中添加路由配置：

```toml
[[routes]]
pattern = "glm.study-llm.me/*"
zone_name = "study-llm.me"
worker = "glm-worker"
```

## API 使用方法

### 简单对话格式

```bash
curl -X POST https://glm.study-llm.me/api/glm-chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "你好，请介绍一下你自己"
  }'
```

### 完整对话格式

```bash
curl -X POST https://glm.study-llm.me/api/glm-chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "你是一个有帮助的助手"},
      {"role": "user", "content": "你好，请介绍一下 GLM-4.5 模型"}
    ]
  }'
```

### 响应格式

```json
{
  "output": "GLM-4.5 的回复内容",
  "model": "GLM-4.5"
}
```

或使用标准 OpenAI 格式：

```json
{
  "id": "chatcmpl-xxxxxxxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "glm-4-0520",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "GLM-4.5 的回复内容"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## 测试页面使用

1. 打开 `glm-test.html` 文件
2. 在 "API 配置" 部分确认 API 基础地址为 `https://glm.study-llm.me`
3. 使用以下功能进行测试：

   - **健康检查**: 测试 API 端点是否正常工作
   - **简单对话测试**: 输入单个问题并获取回复
   - **完整对话测试**: 进行多轮对话
   - **API 格式测试**: 使用标准 JSON 格式测试
   - **CORS 测试**: 验证跨域请求配置

## 响应式设计

测试页面采用移动优先的响应式设计：

- **移动端** (< 768px): 简化布局，优化的触控体验
- **平板端** (768px - 1024px): 适中的布局和字体大小
- **桌面端** (> 1024px): 完整功能，增强的视觉效果

## 功能特性

### GLM-4.5 Worker
- 支持 GLM-4.5 模型连接
- 兼容简单提示和完整对话格式
- 自动错误处理和日志记录
- CORS 支持跨域请求

### 测试页面
- 响应式设计，支持所有设备
- 实时对话界面
- 多种测试模式
- 详细的错误信息显示
- 加载状态指示器

## 故障排除

### 常见问题

1. **API 密钥错误**
   - 确保 `GLM_API_KEY` 环境变量已正确设置
   - 检查 API 密钥是否有效

2. **CORS 错误**
   - 确保路由配置正确
   - 检查响应头中的 CORS 设置

3. **连接超时**
   - GLM-4.5 模型响应可能需要较长时间
   - 检查网络连接状态

### 调试方法

1. 使用浏览器开发者工具检查网络请求
2. 查看 Cloudflare Workers 日志
3. 使用测试页面的健康检查功能

## 安全注意事项

- 不要在前端代码中暴露 API 密钥
- 使用环境变量管理敏感信息
- 定期轮换 API 密钥
- 监控 API 使用情况

## 许可证

本项目采用 MIT 许可证。