# 📊 Cloudflare KV 反馈数据存储结构详解

## 🗃️ 主要存储键值对

### 1. 反馈主数据 - `feedback_{id}`

每条反馈的完整数据存储在一个 JSON 对象中：

```json
{
  // === 基础信息 ===
  "id": "1672531200000_abc123def",           // 自动生成的唯一ID
  "submitTime": "2023-01-01T10:00:00.000Z",  // 提交时间
  "updatedTime": "2023-01-01T10:30:00.000Z", // 最后更新时间
  "status": "pending",                        // 处理状态: pending/processing/resolved
  
  // === 反馈分类信息 ===
  "feedbackType": "bug",                      // 反馈类型
  "priority": "high",                         // 紧急程度
  "pageLocation": "数学练习页面",              // 页面位置
  
  // === 用户信息 ===
  "userName": "张三",                         // 用户姓名
  "userContact": "zhangsan@email.com",        // 联系方式
  "deviceType": "mobile",                     // 设备类型
  
  // === 反馈内容 ===
  "description": "计算器功能出现错误，点击等号没有反应", // 详细描述
  
  // === 用户评分 ===
  "ratings": {
    "functionality": 3,    // 功能性评分 (1-5星)
    "performance": 4,      // 性能评分
    "design": 5,          // 界面设计评分
    "overall": 4          // 整体满意度评分
  },
  
  // === 技术信息 ===
  "deviceInfo": {
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...",
    "screenSize": "375x812",      // 屏幕分辨率
    "viewport": "375x647"         // 浏览器视口大小
  },
  
  // === 附件信息 ===
  "imageIds": [                   // 关联的图片ID列表
    "1672531200000_abc123def_img_1672531250000_xyz789",
    "1672531200000_abc123def_img_1672531260000_def456"
  ]
}
```

### 2. 图片数据 - `image_{imageId}`

每张上传的图片单独存储：

```json
{
  "name": "screenshot.png",                    // 原始文件名
  "type": "image/png",                        // MIME类型
  "size": 125840,                             // 文件大小(字节)
  "data": "iVBORw0KGgoAAAANSUhEUgAA..."       // Base64编码的图片数据
}
```

### 3. 索引数据 - `feedback_index`

用于快速获取所有反馈ID的数组：

```json
[
  "1672531200000_abc123def",
  "1672531300000_def456ghi", 
  "1672531400000_ghi789jkl"
]
```

## 🎯 表单字段与存储字段对应关系

| 表单字段 | HTML name属性 | KV存储字段 | 数据类型 | 说明 |
|---------|---------------|------------|----------|------|
| **反馈类型** | `feedbackType` | `feedbackType` | string | bug/feature/content/ui/support |
| **用户姓名** | `userName` | `userName` | string | 可选，默认"匿名用户" |
| **联系方式** | `userContact` | `userContact` | string | 邮箱或电话 |
| **设备类型** | `deviceType` | `deviceType` | string | 自动检测或用户选择 |
| **页面位置** | `pageLocation` | `pageLocation` | string | 当前页面或用户输入 |
| **详细描述** | `description` | `description` | string | 问题详细说明 |
| **紧急程度** | `priority` | `priority` | string | low/medium/high/urgent |
| **功能性评分** | - | `ratings.functionality` | number | 1-5星评分 |
| **性能评分** | - | `ratings.performance` | number | 1-5星评分 |
| **界面评分** | - | `ratings.design` | number | 1-5星评分 |
| **整体评分** | - | `ratings.overall` | number | 1-5星评分 |
| **上传图片** | `screenshots` | `imageIds[]` | array | 图片ID数组 |

## 🔄 数据流程

### 提交流程
1. **表单数据收集** → FormData对象
2. **数据验证** → 检查必填字段和文件格式
3. **生成ID** → 时间戳 + 随机字符串
4. **处理图片** → 转换为Base64并存储
5. **存储主数据** → 完整反馈对象存入KV
6. **更新索引** → 添加新ID到索引数组

### 查询流程
1. **获取索引** → 读取 `feedback_index`
2. **批量查询** → 根据ID列表获取反馈数据
3. **应用过滤** → 按类型、状态、优先级筛选
4. **排序返回** → 按时间倒序排列

## 📈 存储优化策略

### 1. 数据压缩
```javascript
// 可选：压缩大型JSON数据
const compressedData = JSON.stringify(feedbackData);
await env.KV_FEEDBACK.put(`feedback_${id}`, compressedData);
```

### 2. 分页查询
```javascript
// 支持分页的查询API
GET /api/feedback?page=1&limit=20&type=bug&status=pending
```

### 3. 缓存策略
```javascript
// 为频繁访问的数据设置TTL
await env.KV_FEEDBACK.put(key, value, {
  expirationTtl: 3600 // 1小时后过期
});
```

## 🔍 数据查询示例

### 按类型查询
```bash
# 获取所有Bug反馈
GET /api/feedback?type=bug

# 获取高优先级反馈
GET /api/feedback?priority=high

# 组合查询
GET /api/feedback?type=bug&status=pending&priority=high
```

### 统计查询
```javascript
// 在Workers中实现统计功能
const stats = {
  total: feedbacks.length,
  pending: feedbacks.filter(f => f.status === 'pending').length,
  byType: {
    bug: feedbacks.filter(f => f.feedbackType === 'bug').length,
    feature: feedbacks.filter(f => f.feedbackType === 'feature').length
  }
};
```

## 💾 存储容量估算

### 单条反馈数据大小
- **文本数据**: ~2KB (包含所有字段)
- **单张图片**: ~100KB (压缩后的Base64)
- **总计**: ~200KB (含1-2张图片)

### 容量规划
- **1000条反馈**: ~200MB
- **5000条反馈**: ~1GB (接近免费额度上限)
- **建议**: 定期清理旧数据或升级付费计划

## 🔧 维护操作

### 数据备份
```bash
# 导出所有反馈数据
wrangler kv:key list --binding KV_FEEDBACK | grep "feedback_" | \
xargs -I {} wrangler kv:key get {} --binding KV_FEEDBACK > backup.json
```

### 数据清理
```javascript
// 删除超过6个月的反馈
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

feedbacks.forEach(async (feedback) => {
  if (new Date(feedback.submitTime) < sixMonthsAgo) {
    await deleteFeedback(feedback.id);
  }
});
```

---

✅ **所有反馈数据都已完整存储在 Cloudflare KV 中！** 