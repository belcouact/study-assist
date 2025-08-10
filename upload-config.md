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
CORS和连接问题已通过以下方式解决：
- Worker端完整CORS配置（支持OPTIONS预检请求）
- 支持GET方法用于健康检查
- 前端数据格式优化（JSON格式上传）
- 增强数据解析兼容性
- 修复400错误：简化数据发送逻辑

### 快速测试
1. 直接访问：https://lab-upload.study-llm.me/upload?database=test
   - 应该返回：{"success":true,"message":"Upload endpoint is ready"}

2. 使用 `test-large-upload.html` 测试上传功能
   - 如果400错误，检查浏览器控制台日志
   - 确保数据是有效的JSON数组

3. 使用 `lab_warehouse.html` 测试完整流程

### Worker部署
1. 登录Cloudflare控制台 → Workers
2. 创建新的Worker，名称：`upload-worker`
3. 复制 `workers/upload-worker-fixed.js` 全部内容
4. 保存并部署
5. 添加自定义域名：`lab-upload.study-llm.me`
6. 确保域名DNS解析正确

### 验证方法
部署完成后：
1. 浏览器访问：https://lab-upload.study-llm.me/
   - 应该看到Worker运行状态
2. 浏览器访问：https://lab-upload.study-llm.me/upload?database=test
   - 应该返回健康检查信息
3. 打开浏览器开发者工具 → Network面板
4. 测试上传，检查：
   - 请求URL包含正确的database参数
   - HTTP状态码为200
   - CORS响应头包含Access-Control-Allow-Origin