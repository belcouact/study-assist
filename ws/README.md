# KV存储集成说明

## 概述

本项目已集成Cloudflare KV存储，用于存储和管理故障数据。为了安全地访问KV存储，我们使用了一个代理服务器来处理API请求，避免在客户端暴露API令牌。

## 文件结构

```
ws/
├── js/
│   ├── config.js          # KV存储配置文件
│   └── kv-storage.js      # KV存储操作工具类
├── server/
│   ├── kv-proxy.js        # KV存储代理服务器
│   └── package.json       # 服务器依赖配置
└── fault-list.html        # 故障列表页面
```

## 设置步骤

### 1. 获取Cloudflare API令牌

1. 登录到[Cloudflare控制台](https://dash.cloudflare.com/)
2. 转到"我的个人资料" > "API令牌"
3. 点击"创建令牌"
4. 选择"编辑"模板，或创建自定义令牌
5. 确保令牌具有以下权限：
   - Account > Cloudflare Workers KV Storage > Edit
6. 创建令牌并复制保存

### 2. 更新配置文件

编辑 `ws/js/config.js` 文件，将 `YOUR_API_TOKEN` 替换为您实际的API令牌：

```javascript
// API令牌 (需要替换为实际的API令牌)
// 可以从Cloudflare控制台创建: https://dash.cloudflare.com/profile/api-tokens
apiToken: 'your_actual_api_token_here',
```

同时，更新 `ws/server/kv-proxy.js` 文件中的API令牌：

```javascript
apiToken: 'your_actual_api_token_here', // 需要替换为实际的API令牌
```

### 3. 安装依赖并启动代理服务器

1. 打开终端，导航到 `ws/server` 目录：

```bash
cd ws/server
```

2. 安装依赖：

```bash
npm install
```

3. 启动代理服务器：

```bash
npm start
```

服务器将在端口3001上运行。

### 4. 启动主应用服务器

在另一个终端中，导航到项目根目录并启动HTTP服务器：

```bash
cd d:\Alex\study-assist\study-assist
python -m http.server 8000
```

### 5. 访问应用

打开浏览器，访问 `http://localhost:8000/ws/index.html`，然后点击"故障列表"卡片。

## 使用说明

### 故障列表页面

故障列表页面 (`fault-list.html`) 从KV存储中获取故障数据并显示在表格中。页面提供以下功能：

1. **搜索**：可以按设备ID、设备名称、故障类型或处理人员搜索
2. **筛选**：可以按状态（待处理、处理中、已完成）和故障类型筛选
3. **查看详情**：点击"查看"按钮查看故障详细信息
4. **处理故障**：对于待处理的故障，可以点击"处理"按钮分配处理人

### KV存储操作

`kv-storage.js` 提供了以下操作：

1. **获取数据**：`get(key)` - 获取指定键的值
2. **存储数据**：`put(key, value, options)` - 存储键值对
3. **删除数据**：`delete(key)` - 删除指定键
4. **列出键**：`list(options)` - 列出所有键

`FaultDataManager` 类提供了更高级的故障数据操作：

1. **获取所有故障**：`getAllFaults()`
2. **添加故障**：`addFault(fault)`
3. **更新故障状态**：`updateFaultStatus(faultId, status, handler)`
4. **删除故障**：`deleteFault(faultId)`
5. **获取统计信息**：`getFaultStatistics()`

## 故障排除

### 1. 代理服务器无法启动

确保已安装Node.js和npm。检查端口3001是否被其他应用占用。

### 2. 无法获取KV数据

1. 确保代理服务器正在运行
2. 检查API令牌是否正确
3. 检查KV存储命名空间ID是否正确
4. 查看浏览器控制台和服务器日志中的错误信息

### 3. CORS错误

确保代理服务器已正确配置CORS中间件。如果仍有问题，可以尝试在浏览器中安装CORS扩展进行开发测试。

## 数据结构

### 故障数据

```javascript
{
    id: '1',                    // 唯一标识符
    equipmentId: 'EQ001',       // 设备ID
    equipmentName: '生产线A',   // 设备名称
    faultType: '机械故障',      // 故障类型
    reportTime: '2023-06-15 09:30',  // 报告时间
    status: 'completed',        // 状态：pending/processing/completed
    handler: '张工',           // 处理人
    description: '生产线A机械臂故障，已更换零件',  // 故障描述
    completionTime: '2023-06-15 16:45'  // 完成时间
}
```

## 扩展功能

您可以根据需要扩展此系统，例如：

1. 添加用户认证和授权
2. 实现更复杂的数据分析和报表
3. 添加通知系统（邮件、短信等）
4. 集成其他数据源
5. 添加数据导出功能