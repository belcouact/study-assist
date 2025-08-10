# 上传配置更新文档

## 新域名配置

**Cloudflare Worker域名**: `https://lab-upload.study-llm.me`

## 已更新的文件

### 1. `js/large-upload.js`
- 默认端点已更新为：`https://lab-upload.study-llm.me/upload`
- 支持自定义端点配置

### 2. `lab_warehouse.html`
- 显式指定Cloudflare Worker端点：`endpoint: 'https://lab-upload.study-llm.me/upload'`

### 3. `test-large-upload.html`
- 测试页面已更新为使用新域名

## 使用方法

### 标准使用
```javascript
const uploader = new LargeDatasetUploader({
    // 使用默认域名 (已配置为 lab-upload.study-llm.me)
    chunkSize: 50,
    onProgress: (progress) => console.log(progress)
});
```

### 自定义端点
```javascript
const uploader = new LargeDatasetUploader({
    endpoint: 'https://your-custom-domain.com/upload',
    chunkSize: 100,
    onProgress: (progress) => console.log(progress)
});
```

## 端点说明

- **完整URL**: `https://lab-upload.study-llm.me/upload`
- **请求方法**: POST
- **Content-Type**: multipart/form-data 或 application/json
- **参数**: 
  - `database`: 数据库名称 (通过查询参数)

## 响应格式

成功响应：
```json
{
  "success": true,
  "message": "Data uploaded successfully",
  "details": {
    "deletedCount": 0,
    "insertedCount": 100,
    "totalRows": 100
  }
}
```

## 使用说明

### 修复完成
CORS和连接问题已通过以下方式修复：
- Worker端：完整的CORS响应头配置
- 前端端：优化的数据格式和错误处理
- 兼容性：支持JSON数据格式直接上传

### 快速测试
部署Worker后，使用现有页面测试：
- `test-large-upload.html` - 测试大文件上传
- `lab_warehouse.html` - 测试仓库数据上传

### Worker部署
1. 复制 `workers/upload-worker-fixed.js` 内容
2. 登录Cloudflare Dashboard创建Worker
3. 设置自定义域名 `lab-upload.study-llm.me`
4. 保存并部署

### 验证方法
打开浏览器控制台，检查网络请求：
- 请求URL应为 `https://lab-upload.study-llm.me/upload`
- 响应状态码应为200
- 响应头应包含 `Access-Control-Allow-Origin: *`