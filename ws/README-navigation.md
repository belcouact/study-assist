# 可重用导航组件使用说明

## 概述

本导航组件为ws目录下的所有故障相关页面提供了一个统一的、响应式的导航菜单，可以在任何页面中轻松引入，无需重复编写导航代码。

## 文件结构

```
ws/
├── navigation.html              # 导航组件HTML文件
├── navigation-demo.html         # 导航组件使用演示页面
├── fault-list-example.html      # 集成导航组件的故障列表示例
└── js/
    └── navigation-loader.js     # 导航组件加载器
```

## 使用方法

### 基本用法

要在任何页面中使用导航组件，只需在页面的`<head>`部分添加以下脚本引用：

```html
<script src="js/navigation-loader.js"></script>
```

### 完整示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>故障列表</title>
    <link rel="stylesheet" href="../css/common.css">
    <link rel="stylesheet" href="../css/responsive.css">
    <script src="js/navigation-loader.js"></script>
    <!-- 其他样式和脚本 -->
</head>
<body>
    <div class="container">
        <!-- 页面内容 -->
    </div>
    
    <!-- 页面特定的JavaScript代码 -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 页面特定的功能代码
        });
    </script>
</body>
</html>
```

## 功能特点

1. **响应式设计**：自动适应PC和移动设备
2. **自动高亮**：自动检测当前页面并高亮对应的导航链接
3. **登录状态管理**：基于登录状态显示/隐藏退出登录按钮
4. **信息模态窗口**：包含系统信息展示功能
5. **移动端菜单**：支持移动端菜单切换

## 导航链接

导航组件包含以下链接：

- 首页 (index.html)
- 故障列表 (fault-list.html)
- 新建故障 (new-fault.html)
- 故障统计 (fault-statistics.html)
- 信息管理 (info-management.html)
- 用户资料 (user-profile.html)
- 意见反馈 (feedback.html)
- 退出登录 (仅当用户登录时显示)

## 自定义样式

如果需要自定义导航栏的样式，可以通过以下CSS类进行修改：

- `.ws-navigation` - 导航栏容器
- `.nav-container` - 导航内容容器
- `.page-title` - 页面标题
- `.nav-menu` - 导航菜单
- `.nav-menu a` - 导航链接
- `.nav-menu a.active` - 活动导航链接
- `.mobile-menu-toggle` - 移动端菜单切换按钮

## 注意事项

1. 确保脚本引用放在所有其他脚本之后，但在页面内容之前
2. 导航组件会自动为页面添加顶部内边距，以适应固定定位的导航栏
3. 如果页面已有自己的导航栏，请先移除或修改现有导航代码
4. 确保相关CSS文件（common.css, responsive.css）路径正确

## 演示页面

- `navigation-demo.html` - 详细的使用说明和示例
- `fault-list-example.html` - 集成导航组件的故障列表页面示例

## 故障排除

如果导航组件未正确显示，请检查：

1. 脚本路径是否正确
2. 是否存在网络连接问题
3. 浏览器控制台是否有错误信息
4. 相关CSS文件是否正确加载