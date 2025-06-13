# 反馈系统后端集成指南

## 数据存储方案

### 当前状态
- ✅ 前端界面完成 (`feedback.html`)
- ✅ 管理界面完成 (`admin.html`)
- ✅ 本地存储演示 (localStorage)
- ⏳ 需要后端API集成

## 后端API集成方案

### 1. Node.js + Express + MongoDB 方案

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// 反馈数据模型
const feedbackSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    feedbackType: String,
    userName: String,
    userContact: String,
    deviceType: String,
    pageLocation: String,
    description: String,
    priority: String,
    ratings: {
        overall: Number,
        interface: Number,
        functionality: Number,
        recommendation: Number
    },
    screenshots: [String],
    deviceInfo: {
        userAgent: String,
        screenSize: String,
        viewport: String
    },
    status: { type: String, default: 'pending' },
    submitTime: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// API路由
// 提交反馈
app.post('/api/feedback', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.json({ success: true, id: feedback.id });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 获取所有反馈
app.get('/api/feedback', async (req, res) => {
    try {
        const { type, status, priority } = req.query;
        const filter = {};
        
        if (type) filter.feedbackType = type;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        
        const feedbacks = await Feedback.find(filter).sort({ submitTime: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新反馈状态
app.patch('/api/feedback/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const feedback = await Feedback.findOneAndUpdate(
            { id: req.params.id },
            { status },
            { new: true }
        );
        res.json(feedback);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 删除反馈
app.delete('/api/feedback/:id', async (req, res) => {
    try {
        await Feedback.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

mongoose.connect('mongodb://localhost:27017/feedback_db');
app.listen(3000, () => console.log('Server running on port 3000'));
```

### 2. PHP + MySQL 方案

```php
<?php
// api/feedback.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$dbname = 'feedback_db';
$username = 'your_username';
$password = 'your_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['error' => 'Database connection failed']));
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        // 提交反馈
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO feedbacks (
                feedback_type, user_name, user_contact, device_type, 
                page_location, description, priority, ratings, 
                device_info, status, submit_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        ");
        
        $result = $stmt->execute([
            $data['feedbackType'],
            $data['userName'],
            $data['userContact'],
            $data['deviceType'],
            $data['pageLocation'],
            $data['description'],
            $data['priority'],
            json_encode($data['ratings']),
            json_encode($data['deviceInfo'])
        ]);
        
        echo json_encode(['success' => $result]);
        break;
        
    case 'GET':
        // 获取反馈列表
        $whereClause = '';
        $params = [];
        
        if (!empty($_GET['type'])) {
            $whereClause .= " WHERE feedback_type = ?";
            $params[] = $_GET['type'];
        }
        
        if (!empty($_GET['status'])) {
            $whereClause .= ($whereClause ? " AND" : " WHERE") . " status = ?";
            $params[] = $_GET['status'];
        }
        
        $stmt = $pdo->prepare("SELECT * FROM feedbacks$whereClause ORDER BY submit_time DESC");
        $stmt->execute($params);
        
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
}
?>
```

### 3. 前端API调用更新

```javascript
// 更新 feedback.html 中的提交函数
async function submitToServer(feedbackData) {
    const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
        throw new Error('服务器提交失败');
    }
    
    return response.json();
}

// 更新 admin.html 中的数据加载
async function loadFeedbacksFromServer() {
    try {
        const response = await fetch('/api/feedback');
        const feedbacks = await response.json();
        
        allFeedbacks = feedbacks;
        filteredFeedbacks = [...allFeedbacks];
        
        updateStats();
        renderFeedbacks();
    } catch (error) {
        console.error('加载反馈失败:', error);
        // 降级到localStorage
        loadFeedbacks();
    }
}
```

## 第三方服务集成

### 1. Google Sheets API
```javascript
// 使用Google Sheets作为数据库
async function submitToGoogleSheets(feedbackData) {
    const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
    });
}
```

### 2. Airtable API
```javascript
async function submitToAirtable(feedbackData) {
    const response = await fetch('https://api.airtable.com/v0/YOUR_BASE_ID/Feedback', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fields: feedbackData
        })
    });
}
```

### 3. Firebase Firestore
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
    // Your config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function submitToFirestore(feedbackData) {
    try {
        const docRef = await addDoc(collection(db, "feedbacks"), feedbackData);
        return { success: true, id: docRef.id };
    } catch (error) {
        throw new Error('Firestore提交失败');
    }
}
```

## 部署建议

### 1. 静态托管 + 无服务器函数
- **前端**: Netlify, Vercel, GitHub Pages
- **后端**: Netlify Functions, Vercel Functions, AWS Lambda

### 2. 全栈托管
- **Heroku**: 支持Node.js + PostgreSQL
- **Railway**: 现代化的全栈部署
- **DigitalOcean App Platform**: 简单易用

### 3. 自托管
- **VPS**: 阿里云, 腾讯云, AWS EC2
- **Docker**: 容器化部署
- **PM2**: Node.js进程管理

## 数据库表结构

```sql
CREATE TABLE feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_type VARCHAR(50) NOT NULL,
    user_name VARCHAR(100),
    user_contact VARCHAR(255) NOT NULL,
    device_type VARCHAR(50),
    page_location VARCHAR(100),
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    ratings JSON,
    screenshots JSON,
    device_info JSON,
    status ENUM('pending', 'processing', 'resolved') DEFAULT 'pending',
    submit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 安全考虑

1. **输入验证**: 前后端都要验证数据
2. **防CSRF**: 使用CSRF令牌
3. **SQL注入防护**: 使用参数化查询
4. **文件上传安全**: 限制文件类型和大小
5. **访问控制**: 管理界面需要身份验证

## 监控和通知

```javascript
// 邮件通知新反馈
const nodemailer = require('nodemailer');

async function sendNotification(feedbackData) {
    const transporter = nodemailer.createTransporter({
        // Email config
    });
    
    await transporter.sendMail({
        from: 'noreply@example.com',
        to: 'admin@example.com',
        subject: `新反馈: ${feedbackData.feedbackType}`,
        html: `
            <h3>收到新的用户反馈</h3>
            <p><strong>类型:</strong> ${feedbackData.feedbackType}</p>
            <p><strong>用户:</strong> ${feedbackData.userName}</p>
            <p><strong>描述:</strong> ${feedbackData.description}</p>
        `
    });
}
```

## 现状总结

✅ **已完成**:
- 响应式反馈表单
- 完整的管理界面
- 本地存储演示功能
- 数据筛选和状态管理

🔄 **下一步**:
1. 选择后端技术栈
2. 部署数据库
3. 更新前端API调用
4. 添加身份验证
5. 配置邮件通知

您希望我帮您实现哪种后端方案？或者有其他特定的需求吗？ 