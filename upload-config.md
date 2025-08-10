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

### 使用调试工具
1. **打开debug-upload.html**:
   - 访问 `debug-upload.html`
   - 选择测试数据类型（简单、仓库格式或自定义JSON）
   - 输入数据库名称（如：db-gore）
   - 点击"测试健康检查"验证Worker状态
   - 点击"测试上传"进行完整测试
   - 查看详细的调试输出

### 测试原有页面
1. **测试test-large-upload.html**:
   - 打开 `test-large-upload.html`
   - 点击"生成测试数据"按钮
   - 输入数据库名称（如：test-db）
   - 点击"开始上传"
   - 观察进度条和完成提示

2. **测试lab_warehouse.html**:
   - 打开 `lab_warehouse.html`
   - 选择表格类型
   - 上传Excel文件
   - 预览数据后点击"上传数据"

### 400错误排查
- 使用debug-upload.html查看具体错误信息
- 检查浏览器控制台日志（F12 → Console）
- 验证数据是否为有效的JSON数组
- 确认Worker已正确部署到域名

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