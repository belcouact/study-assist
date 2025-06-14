# 🚀 部署指南 - 解决 Wrangler 入口点错误

## ❌ 常见错误
```
Error: Missing entry-point to Worker script or to assets directory
```

## ✅ 解决方案

### 📁 项目结构
```
study-assist/
├── workers/
│   └── feedback-api.js          # Workers 脚本
├── wrangler.toml               # Workers 配置
├── wrangler-site.toml          # 静态站点配置
├── package.json
├── index.html                  # 静态文件
├── feedback.html
└── admin.html
```

### ⚙️ 配置文件说明

#### 1. `wrangler.toml` - Workers API 配置
```toml
name = "feedback-api"
main = "workers/feedback-api.js"    # 正确的入口点
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "KV_FEEDBACK"
id = "your-kv-namespace-id"
```

#### 2. `wrangler-site.toml` - 静态站点配置
```toml
name = "study-assist-site"
compatibility_date = "2024-01-01"

[site]
bucket = "./"                       # 静态文件目录
```

### 🎯 部署命令

#### 方法一：分别部署（推荐）

```bash
# 1. 部署反馈 API (Workers)
npm run deploy:feedback
# 或
wrangler deploy --config wrangler.toml

# 2. 部署静态站点
npm run deploy:site  
# 或
wrangler deploy --config wrangler-site.toml
```

#### 方法二：直接使用 wrangler

```bash
# 部署 Workers API
wrangler deploy workers/feedback-api.js --name feedback-api

# 部署静态站点
wrangler pages deploy . --project-name study-assist-site
```

### 🔧 故障排除

#### 1. 检查文件是否存在
```bash
# 确认 Workers 脚本存在
ls -la workers/feedback-api.js

# 确认配置文件存在
ls -la wrangler.toml
```

#### 2. 验证配置文件语法
```bash
# 检查配置文件
wrangler whoami
wrangler kv:namespace list
```

#### 3. 本地测试
```bash
# 本地运行 Workers
npm run dev:feedback

# 或直接使用 wrangler
wrangler dev workers/feedback-api.js
```

### 📋 部署检查清单

- [ ] ✅ `workers/feedback-api.js` 文件存在
- [ ] ✅ `wrangler.toml` 配置正确
- [ ] ✅ KV 命名空间已创建并配置
- [ ] ✅ Cloudflare 账户已登录 (`wrangler whoami`)
- [ ] ✅ 域名已添加到 Cloudflare (如使用自定义域名)

### 🌐 部署后验证

#### 1. 测试 Workers API
```bash
# 获取 Workers 域名
curl https://feedback-api.your-subdomain.workers.dev/api/feedback

# 测试图片上传
curl -X POST https://feedback-api.your-subdomain.workers.dev/api/feedback \
  -F "feedbackType=test" \
  -F "description=测试反馈"
```

#### 2. 更新前端配置
在 `feedback.html` 和 `admin.html` 中更新 API 地址：
```javascript
const API_BASE_URL = 'https://feedback-api.your-actual-domain.workers.dev';
```

### 🔄 完整部署流程

```bash
# 1. 安装依赖
npm install

# 2. 登录 Cloudflare
wrangler login

# 3. 创建 KV 命名空间
wrangler kv:namespace create "KV_FEEDBACK"

# 4. 更新 wrangler.toml 中的 KV ID
# 编辑 wrangler.toml，填入步骤3返回的 namespace ID

# 5. 部署 Workers API
npm run deploy:feedback

# 6. 部署静态站点 (可选)
npm run deploy:site

# 7. 更新前端 API 地址
# 编辑 feedback.html 和 admin.html 中的 API_BASE_URL

# 8. 测试功能
# 访问你的站点，测试反馈提交和管理功能
```

### 💡 高级配置

#### 自定义域名
```toml
# 在 wrangler.toml 中添加
[[routes]]
pattern = "api.your-domain.com/*"
zone_name = "your-domain.com"
```

#### 环境变量
```toml
[vars]
ENVIRONMENT = "production"
MAX_FILE_SIZE = "5242880"
CORS_ORIGIN = "https://your-domain.com"
```

#### 多环境部署
```bash
# 开发环境
wrangler deploy --env development

# 生产环境  
wrangler deploy --env production
```

---

## 🆘 如果仍有问题

1. **检查 Wrangler 版本**
   ```bash
   wrangler --version
   npm install -g wrangler@latest
   ```

2. **清除缓存**
   ```bash
   wrangler logout
   wrangler login
   ```

3. **查看详细错误**
   ```bash
   wrangler deploy --verbose
   ```

4. **联系支持**
   - [Cloudflare Discord](https://discord.gg/cloudflaredev)
   - [Cloudflare Community](https://community.cloudflare.com/)

✅ **按照这个指南，您的部署问题应该能够解决！** 