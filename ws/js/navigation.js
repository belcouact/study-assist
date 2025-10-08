// 导航菜单通用功能
document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // 点击页面任意位置隐藏导航菜单
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    }
    
    // 检查登录状态并显示/隐藏退出登录按钮
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const logoutLink = document.getElementById('logoutLink');
    
    if (logoutLink) {
        if (isLoggedIn === 'true') {
            logoutLink.style.display = 'block';
            
            // 添加退出登录事件监听
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 清除会话存储
                sessionStorage.clear();
                
                // 跳转到首页
                window.location.href = 'index.html';
            });
        } else {
            logoutLink.style.display = 'none';
        }
    }
});