# 📚 Cloudflare KV + Workers 反馈系统部署指南

## 🚀 快速开始

### 1. 创建 Cloudflare KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **KV**
3. 点击 **Create namespace**
4. 输入命名空间名称：`kv_feedback`
5. 记录生成的 **Namespace ID**

### 2. 配置 wrangler.toml

更新 `wrangler.toml` 文件中的以下配置：

```toml
# 替换为你的实际值
[[kv_namespaces]]
binding = "KV_FEEDBACK"
id = "your-actual-kv-namespace-id"  # 第1步获取的ID
preview_id = "your-preview-kv-namespace-id"  # 可选：预览环境ID

[vars]
API_BASE_URL = "https://your-worker-domain.workers.dev"  # 部署后获取

[[routes]]
pattern = "your-domain.com/api/*"  # 替换为你的域名
zone_name = "your-domain.com"      # 替换为你的域名
```

### 3. 安装依赖

```bash
npm install
# 或
yarn install
```

### 4. 部署 Workers

```bash
# 部署反馈 API
npm run deploy:feedback

# 或使用 wrangler 直接部署
wrangler deploy workers/feedback-api.js --name feedback-api
```

### 5. 获取 Workers 域名

部署成功后，Cloudflare 会提供一个域名，类似：
```
https://feedback-api.your-subdomain.workers.dev
```

### 6. 更新前端配置

在 `feedback.html` 和 `admin.html` 中更新 API 地址：

```javascript
// 替换为你的实际 Workers 域名
const API_BASE_URL = 'https://feedback-api.your-subdomain.workers.dev';
```

## 🔧 详细配置

### KV 数据结构

#### 反馈数据 (Key: `feedback_{id}`)
```json
{
  "id": "1672531200000_abc123def",
  "feedbackType": "bug",
  "userName": "张三",
  "userContact": "zhangsan@email.com",
  "deviceType": "mobile",
  "pageLocation": "数学练习页",
  "description": "计算结果显示错误",
  "priority": "high",
  "ratings": {
    "functionality": 3,
    "performance": 4,
    "design": 5,
    "overall": 4
  },
  "deviceInfo": {
    "userAgent": "...",
    "screenSize": "1920x1080",
    "viewport": "1200x800"
  },
  "status": "pending",
  "submitTime": "2023-01-01T10:00:00.000Z",
  "updatedTime": "2023-01-01T10:30:00.000Z",
  "imageIds": ["1672531200000_abc123def_img_1672531250000_xyz789"]
}
```

#### 图片数据 (Key: `image_{imageId}`)
```json
{
  "name": "screenshot.png",
  "type": "image/png",
  "size": 125840,
  "data": "iVBORw0KGgoAAAANSUhEUgAA..." // base64编码
}
```

#### 索引数据 (Key: `feedback_index`)
```json
["1672531200000_abc123def", "1672531300000_def456ghi", ...]
```

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/feedback` | 创建新反馈 |
| GET | `/api/feedback` | 获取所有反馈 |
| GET | `/api/feedback?type=bug` | 按类型过滤 |
| GET | `/api/feedback?status=pending` | 按状态过滤 |
| PUT | `/api/feedback/{id}` | 更新反馈状态 |
| DELETE | `/api/feedback/{id}` | 删除反馈 |
| GET | `/api/image/{imageId}` | 获取图片 |

### 环境变量

可在 `wrangler.toml` 中配置：

```toml
[vars]
ENVIRONMENT = "production"
MAX_FILE_SIZE = "5242880"  # 5MB
ALLOWED_FILE_TYPES = "image/jpeg,image/png,image/gif,image/webp"
```

## 🔒 安全配置

### 1. CORS 设置

Workers 中已配置基本 CORS，生产环境建议限制来源：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.com', // 限制域名
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### 2. 文件大小限制

当前限制：5MB，可在 Workers 中调整：

```javascript
if (file.size > 5 * 1024 * 1024) { // 5MB
  throw new Error('文件大小超过限制');
}
```

### 3. 文件类型限制

当前允许：`image/jpeg`, `image/png`, `image/gif`, `image/webp`

## 📊 监控和调试

### 1. 查看日志

```bash
# 实时查看 Workers 日志
wrangler tail

# 查看特定 Worker 的日志
wrangler tail --name feedback-api
```

### 2. 本地开发

```bash
# 本地运行 Workers
npm run dev

# 或
wrangler dev workers/feedback-api.js
```

### 3. KV 数据管理

通过 Cloudflare Dashboard 或 wrangler CLI：

```bash
# 查看所有键
wrangler kv:key list --binding KV_FEEDBACK

# 获取特定数据
wrangler kv:key get "feedback_index" --binding KV_FEEDBACK

# 删除数据
wrangler kv:key delete "feedback_123" --binding KV_FEEDBACK
```

## 📈 性能优化

### 1. KV 访问优化

- 使用索引减少遍历操作
- 批量操作时考虑并发限制
- 图片使用 CDN 缓存

### 2. Workers 优化

- 启用 Smart Placement
- 使用 Durable Objects（如需要）
- 考虑 Workers 执行时间限制（CPU 时间 10ms，总时间 30s）

### 3. 缓存策略

```javascript
// 图片设置长期缓存
return new Response(bytes, {
  headers: {
    'Content-Type': image.type,
    'Cache-Control': 'public, max-age=31536000', // 1年
    'ETag': imageId
  }
});
```

## 🔄 数据迁移

如需从 localStorage 迁移到 KV：

```javascript
// 在浏览器控制台运行
const localData = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
localData.forEach(async (feedback) => {
  const formData = new FormData();
  Object.keys(feedback).forEach(key => {
    if (key !== 'screenshots') {
      formData.append(key, typeof feedback[key] === 'object' 
        ? JSON.stringify(feedback[key]) 
        : feedback[key]
      );
    }
  });
  
  await fetch(`${API_BASE_URL}/api/feedback`, {
    method: 'POST',
    body: formData
  });
});
```

## 🆘 故障排除

### 常见问题

1. **KV 绑定失败**
   - 检查 `wrangler.toml` 中的 Namespace ID
   - 确认 KV 命名空间已创建

2. **CORS 错误**
   - 检查 `Access-Control-Allow-Origin` 设置
   - 确认请求域名在允许列表中

3. **图片上传失败**
   - 检查文件大小（<5MB）
   - 确认文件类型为图片格式

4. **Workers 超时**
   - 优化代码减少执行时间
   - 考虑分批处理大量数据

### 调试技巧

```javascript
// 在 Workers 中添加调试日志
console.log('Debug info:', { 
  path, 
  method: request.method,
  contentType: request.headers.get('Content-Type')
});
```

## 💰 成本估算

### Cloudflare Workers 免费额度
- 每天 100,000 次请求
- CPU 时间：每天 10ms × 100,000 = 1,000 秒

### KV 免费额度
- 每天 100,000 次读取
- 每天 1,000 次写入/删除
- 1GB 存储空间

超出免费额度后：
- Workers: $0.50 per million requests
- KV Reads: $0.50 per million reads
- KV Writes: $5.00 per million writes
- KV Storage: $0.50 per GB per month

## 🎯 下一步优化

1. **数据库集成**：考虑 Cloudflare D1 SQL 数据库
2. **实时通知**：使用 WebSockets 或 Server-Sent Events
3. **分析面板**：添加反馈趋势分析
4. **自动化处理**：结合 AI 进行反馈分类
5. **移动应用**：开发原生移动应用

---

✅ **部署完成后记得测试所有功能！** 