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

## 测试

可以通过以下方式测试新域名：

1. 打开 `test-large-upload.html`
2. 生成测试数据或上传文件
3. 查看上传进度和结果
4. 检查浏览器网络面板确认请求发送到新域名