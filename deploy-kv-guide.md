# GLM Worker KV存储部署指南

## 问题背景

之前的异步任务API存在404错误，根本原因是Cloudflare Workers的无状态特性导致内存中的任务数据无法在请求间共享。解决方案是使用Cloudflare KV存储来持久化任务数据。

## 临时解决方案

我们已经实现了回退机制，在KV存储配置完成前，系统会使用`globalThis.tasks`作为内存存储。但请注意：
- 内存存储在Worker重启后会丢失所有任务数据
- 内存存储无法在多个Worker实例间共享
- 仅用于开发和测试环境

## 生产环境要求

在生产环境中，必须配置KV存储以确保：
- 任务数据持久化
- 多实例间数据共享
- 系统可靠性

## 部署步骤

### 1. 创建KV命名空间

首先需要创建一个KV命名空间来存储任务数据：

```bash
# 创建生产环境KV命名空间
wrangler kv:namespace create TASKS_KV --env production

# 创建开发环境KV命名空间
wrangler kv:namespace create TASKS_KV --env development
```

执行后会显示类似以下输出：

```
{ "id": "your-kv-namespace-id" }
```

### 2. 更新配置文件

将 `wrangler-glm.toml` 中的 `your-kv-namespace-id` 替换为实际的KV命名空间ID：

```toml
[[env.production.kv_namespaces]]
binding = "TASKS_KV"
id = "实际的KV命名空间ID"

[[env.development.kv_namespaces]]
binding = "TASKS_KV"
id = "实际的KV命名空间ID"
```

### 3. 部署Worker

使用以下命令部署更新后的Worker：

```bash
# 部署到生产环境
wrangler deploy --env production --config wrangler-glm.toml

# 或者使用npm脚本
npm run deploy:glm
```

### 4. 验证部署

部署完成后，可以通过以下方式验证异步任务API是否正常工作：

```bash
# 测试健康检查端点
curl https://glm.study-llm.me/health

# 测试任务提交
curl -X POST https://glm.study-llm.me/api/async-task \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, world!"}'

# 使用返回的taskId测试状态查询
curl "https://glm.study-llm.me/api/async-task?taskId=your-task-id"
```

## 代码变更说明

### 主要修改

1. **存储方式变更**：从内存Map改为Cloudflare KV存储
2. **任务存储**：POST请求中使用 `env.TASKS_KV.put()` 存储任务
3. **任务检索**：GET请求中使用 `env.TASKS_KV.get()` 获取任务
4. **任务状态更新**：在 `processAsyncTask` 函数中使用KV存储更新任务状态

### 解决的问题

- ✅ 修复了GET请求返回404错误的问题
- ✅ 确保任务数据在多个请求间持久化
- ✅ 支持异步任务的状态跟踪
- ✅ 提高了Worker的可靠性和可扩展性

## 故障排除

### 如果遇到权限错误

确保已登录Cloudflare账户：

```bash
wrangler login
```

### 如果KV命名空间已存在

如果KV命名空间已存在，可以使用以下命令查看现有命名空间：

```bash
wrangler kv:namespace list
```

### 如果部署失败

检查配置文件格式是否正确，特别是KV命名空间ID是否有效。

## 性能考虑

- KV存储的读写操作有一定的延迟，但对于异步任务场景是可接受的
- KV存储有每日免费额度限制，请根据使用情况监控
- 在高并发场景下，考虑添加缓存层来减少KV读取次数