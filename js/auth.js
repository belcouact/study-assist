/**
 * 学习助手 - 认证功能
 * 处理用户登录、注册和账户管理
 */

document.addEventListener('DOMContentLoaded', () => {
    initAuthButtons();
    checkAuthStatus();
});

// 用户令牌本地存储键
const TOKEN_KEY = 'study_assist_token';
const USER_DATA_KEY = 'study_assist_user';

/**
 * 初始化认证相关按钮
 */
function initAuthButtons() {
    // 登录按钮
    const loginButton = document.querySelector('.btn-login');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            showAuthModal('login');
        });
    }
    
    // 注册按钮
    const registerButton = document.querySelector('.btn-primary');
    if (registerButton && registerButton.closest('.auth-buttons')) {
        registerButton.addEventListener('click', () => {
            showAuthModal('register');
        });
    }
    
    // 注销按钮
    const logoutButton = document.querySelector('.btn-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logout();
        });
    }
}

/**
 * 检查认证状态
 */
function checkAuthStatus() {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
    
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    
    if (token && userData.name) {
        // 用户已登录
        if (authButtons && userMenu) {
            authButtons.style.display = 'none';
            userMenu.style.display = 'flex';
            
            // 更新用户信息
            const userNameElement = userMenu.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = userData.name;
            }
            
            const userAvatarElement = userMenu.querySelector('.user-avatar');
            if (userAvatarElement) {
                userAvatarElement.src = userData.avatar || 'assets/images/default-avatar.svg';
                userAvatarElement.alt = `${userData.name}的头像`;
            }
        }
    } else {
        // 用户未登录
        if (authButtons && userMenu) {
            authButtons.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }
}

/**
 * 显示认证模态框
 * @param {string} mode - 模式：'login' 或 'register'
 */
function showAuthModal(mode = 'login') {
    // 创建模态框元素
    const modalHTML = `
        <div class="modal-backdrop">
            <div class="modal auth-modal">
                <div class="modal-header">
                    <h3 class="modal-title">${mode === 'login' ? '登录' : '注册'}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="auth-form" class="auth-form">
                        ${mode === 'register' ? `
                            <div class="form-group">
                                <label for="name" class="form-label">姓名</label>
                                <input type="text" id="name" name="name" class="form-control" required>
                            </div>
                        ` : ''}
                        <div class="form-group">
                            <label for="email" class="form-label">邮箱</label>
                            <input type="email" id="email" name="email" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="password" class="form-label">密码</label>
                            <input type="password" id="password" name="password" class="form-control" required>
                        </div>
                        ${mode === 'register' ? `
                            <div class="form-group">
                                <label for="confirm-password" class="form-label">确认密码</label>
                                <input type="password" id="confirm-password" name="confirmPassword" class="form-control" required>
                            </div>
                        ` : ''}
                        <div class="form-error-message"></div>
                        <button type="submit" class="btn btn-primary btn-block">
                            ${mode === 'login' ? '登录' : '注册'}
                        </button>
                    </form>
                    <div class="auth-options">
                        ${mode === 'login' ? 
                            '<p>还没有账号？ <a href="#" class="switch-auth-mode" data-mode="register">注册</a></p>' : 
                            '<p>已有账号？ <a href="#" class="switch-auth-mode" data-mode="login">登录</a></p>'
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到DOM
    const modalElement = document.createRange().createContextualFragment(modalHTML);
    document.body.appendChild(modalElement);
    
    // 显示模态框
    setTimeout(() => {
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) {
            modalBackdrop.classList.add('visible');
        }
    }, 10);
    
    // 关闭模态框按钮
    const closeButton = document.querySelector('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeAuthModal);
    }
    
    // 点击外部区域关闭
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                closeAuthModal();
            }
        });
    }
    
    // 切换登录/注册模式
    const switchModeLinks = document.querySelectorAll('.switch-auth-mode');
    switchModeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newMode = link.getAttribute('data-mode');
            closeAuthModal();
            setTimeout(() => {
                showAuthModal(newMode);
            }, 300);
        });
    });
    
    // 表单提交处理
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (mode === 'login') {
                handleLogin(new FormData(authForm));
            } else {
                handleRegister(new FormData(authForm));
            }
        });
    }
}

/**
 * 关闭认证模态框
 */
function closeAuthModal() {
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.remove('visible');
        
        // 动画结束后移除DOM
        modalBackdrop.addEventListener('transitionend', () => {
            if (modalBackdrop.parentNode) {
                modalBackdrop.parentNode.removeChild(modalBackdrop);
            }
        }, { once: true });
    }
}

/**
 * 处理登录
 * @param {FormData} formData - 表单数据
 */
function handleLogin(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    
    // 在实际应用中，这里应该调用API进行认证
    // 这里仅作为演示，使用模拟数据
    
    if (email && password) {
        // 显示加载状态
        const submitButton = document.querySelector('#auth-form .btn-primary');
        if (submitButton) {
            submitButton.textContent = '登录中...';
            submitButton.disabled = true;
        }
        
        // 模拟API调用延迟
        setTimeout(() => {
            // 模拟成功登录
            const userData = {
                name: '测试用户',
                email: email,
                avatar: 'assets/images/default-avatar.svg'
            };
            
            // 保存认证信息
            localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
            
            // 关闭模态框
            closeAuthModal();
            
            // 更新UI
            checkAuthStatus();
            
            // 显示成功消息
            showNotification('登录成功！欢迎回来。', 'success');
        }, 1000);
    } else {
        // 显示错误
        const errorElement = document.querySelector('.form-error-message');
        if (errorElement) {
            errorElement.textContent = '请输入邮箱和密码';
        }
    }
}

/**
 * 处理注册
 * @param {FormData} formData - 表单数据
 */
function handleRegister(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // 表单验证
    const errorElement = document.querySelector('.form-error-message');
    
    if (!name || !email || !password || !confirmPassword) {
        if (errorElement) {
            errorElement.textContent = '请填写所有必填字段';
        }
        return;
    }
    
    if (password !== confirmPassword) {
        if (errorElement) {
            errorElement.textContent = '两次输入的密码不一致';
        }
        return;
    }
    
    // 显示加载状态
    const submitButton = document.querySelector('#auth-form .btn-primary');
    if (submitButton) {
        submitButton.textContent = '注册中...';
        submitButton.disabled = true;
    }
    
    // 模拟API调用延迟
    setTimeout(() => {
        // 模拟成功注册
        const userData = {
            name: name,
            email: email,
            avatar: 'assets/images/default-avatar.svg'
        };
        
        // 保存认证信息
        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        
        // 关闭模态框
        closeAuthModal();
        
        // 更新UI
        checkAuthStatus();
        
        // 显示成功消息
        showNotification('注册成功！欢迎加入。', 'success');
    }, 1000);
}

/**
 * 登出
 */
function logout() {
    // 清除本地存储的认证信息
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    
    // 更新UI
    checkAuthStatus();
    
    // 显示消息
    showNotification('您已成功登出。', 'info');
}

/**
 * 获取当前用户数据
 * @returns {Object|null} - 用户数据或null
 */
function getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
    
    if (token && userData.name) {
        return userData;
    }
    
    return null;
}

/**
 * 检查用户是否已认证
 * @returns {boolean} - 是否已认证
 */
function isAuthenticated() {
    return localStorage.getItem(TOKEN_KEY) !== null;
}

// 导出模块函数
window.auth = {
    isAuthenticated,
    getCurrentUser,
    showLoginModal: () => showAuthModal('login'),
    showRegisterModal: () => showAuthModal('register'),
    logout
}; 