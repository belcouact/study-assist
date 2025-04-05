/**
 * 学习助手 - 用户认证相关
 */

// 存储用户信息的键名
const USER_KEY = 'study_assist_user';
// 存储会话令牌的键名
const TOKEN_KEY = 'study_assist_token';

// 认证状态变化事件
const AUTH_EVENTS = {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    PROFILE_UPDATE: 'auth:profile_update'
};

/**
 * 认证模块
 */
const auth = {
    /**
     * 当前用户信息
     */
    currentUser: null,

    /**
     * 初始化认证模块
     */
    init() {
        // 从本地存储中获取用户信息
        this.currentUser = storage.get(USER_KEY);
        
        // 检查令牌是否存在并有效
        if (this.currentUser && storage.get(TOKEN_KEY)) {
            // 在实际应用中，应该验证令牌的有效性
            console.log('用户已登录:', this.currentUser.username);
            this._updateAuthUI();
        } else {
            // 清除无效的用户信息和令牌
            this.logout(false);
        }
        
        // 添加登录表单监听
        this._setupLoginForm();
        // 添加注册表单监听
        this._setupRegisterForm();
        // 添加注销按钮监听
        this._setupLogoutButton();
    },

    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<Object>} - 登录结果
     */
    async login(username, password) {
        try {
            // 在实际应用中，这里应该调用后端API进行验证
            // 这里仅作演示，使用模拟数据
            
            // 模拟API请求延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 简单验证（实际应用中不应这样实现）
            if (username && password) {
                // 模拟一个简单的用户对象
                const user = {
                    id: 'user_' + Date.now(),
                    username: username,
                    displayName: username,
                    role: 'student',
                    grade: '未设置',
                    createdAt: new Date().toISOString()
                };
                
                // 模拟一个令牌
                const token = 'mock_token_' + Date.now();
                
                // 存储用户信息和令牌
                storage.set(USER_KEY, user);
                storage.set(TOKEN_KEY, token);
                
                // 更新当前用户
                this.currentUser = user;
                
                // 更新UI
                this._updateAuthUI();
                
                // 触发登录事件
                this._dispatchEvent(AUTH_EVENTS.LOGIN, { user });
                
                return { success: true, user };
            } else {
                throw new Error('用户名和密码不能为空');
            }
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 用户注册
     * @param {Object} userData - 用户数据
     * @returns {Promise<Object>} - 注册结果
     */
    async register(userData) {
        try {
            // 在实际应用中，这里应该调用后端API进行注册
            // 这里仅作演示，使用模拟数据
            
            // 模拟API请求延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 验证必填字段
            if (!userData.username || !userData.password) {
                throw new Error('用户名和密码不能为空');
            }
            
            // 模拟一个简单的用户对象
            const user = {
                id: 'user_' + Date.now(),
                username: userData.username,
                displayName: userData.displayName || userData.username,
                role: 'student',
                grade: userData.grade || '未设置',
                createdAt: new Date().toISOString()
            };
            
            // 模拟一个令牌
            const token = 'mock_token_' + Date.now();
            
            // 存储用户信息和令牌
            storage.set(USER_KEY, user);
            storage.set(TOKEN_KEY, token);
            
            // 更新当前用户
            this.currentUser = user;
            
            // 更新UI
            this._updateAuthUI();
            
            // 触发登录事件
            this._dispatchEvent(AUTH_EVENTS.LOGIN, { user });
            
            return { success: true, user };
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 用户注销
     * @param {boolean} showNotification - 是否显示注销通知
     */
    logout(showNotification = true) {
        // 清除本地存储
        storage.remove(USER_KEY);
        storage.remove(TOKEN_KEY);
        
        // 重置当前用户
        this.currentUser = null;
        
        // 更新UI
        this._updateAuthUI();
        
        // 显示通知
        if (showNotification) {
            showNotification('您已成功注销', 'info');
        }
        
        // 触发注销事件
        this._dispatchEvent(AUTH_EVENTS.LOGOUT);
    },

    /**
     * 更新用户资料
     * @param {Object} profileData - 资料数据
     * @returns {Promise<Object>} - 更新结果
     */
    async updateProfile(profileData) {
        try {
            // 确保用户已登录
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }
            
            // 在实际应用中，这里应该调用后端API更新资料
            // 这里仅作演示，使用模拟数据
            
            // 模拟API请求延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 更新用户信息
            const updatedUser = {
                ...this.currentUser,
                ...profileData,
                updatedAt: new Date().toISOString()
            };
            
            // 存储更新后的用户信息
            storage.set(USER_KEY, updatedUser);
            
            // 更新当前用户
            this.currentUser = updatedUser;
            
            // 更新UI
            this._updateAuthUI();
            
            // 触发资料更新事件
            this._dispatchEvent(AUTH_EVENTS.PROFILE_UPDATE, { user: updatedUser });
            
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('更新资料失败:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 检查用户是否已登录
     * @returns {boolean} - 是否已登录
     */
    isLoggedIn() {
        return !!this.currentUser && !!storage.get(TOKEN_KEY);
    },

    /**
     * 获取当前用户信息
     * @returns {Object|null} - 用户信息
     */
    getUser() {
        return this.currentUser;
    },

    /**
     * 设置登录表单监听
     * @private
     */
    _setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const username = loginForm.querySelector('[name="username"]').value;
            const password = loginForm.querySelector('[name="password"]').value;
            
            // 显示加载状态
            const submitBtn = loginForm.querySelector('[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = '登录中...';
            submitBtn.disabled = true;
            
            // 执行登录
            const result = await this.login(username, password);
            
            // 恢复按钮状态
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            
            // 处理结果
            if (result.success) {
                // 显示成功消息
                showNotification('登录成功', 'success');
                
                // 关闭登录模态框（如果有的话）
                const loginModal = document.getElementById('login-modal');
                if (loginModal) {
                    // 假设有一个关闭模态框的方法
                    // closeModal(loginModal);
                }
                
                // 重定向到首页或之前的页面
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                // 显示错误消息
                showNotification('登录失败: ' + result.error, 'error');
            }
        });
    },

    /**
     * 设置注册表单监听
     * @private
     */
    _setupRegisterForm() {
        const registerForm = document.getElementById('register-form');
        if (!registerForm) return;
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const userData = {
                username: registerForm.querySelector('[name="username"]').value,
                password: registerForm.querySelector('[name="password"]').value,
                displayName: registerForm.querySelector('[name="display_name"]')?.value,
                grade: registerForm.querySelector('[name="grade"]')?.value
            };
            
            // 显示加载状态
            const submitBtn = registerForm.querySelector('[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = '注册中...';
            submitBtn.disabled = true;
            
            // 执行注册
            const result = await this.register(userData);
            
            // 恢复按钮状态
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            
            // 处理结果
            if (result.success) {
                // 显示成功消息
                showNotification('注册成功', 'success');
                
                // 关闭注册模态框（如果有的话）
                const registerModal = document.getElementById('register-modal');
                if (registerModal) {
                    // 假设有一个关闭模态框的方法
                    // closeModal(registerModal);
                }
                
                // 重定向到首页或个人资料页面
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                // 显示错误消息
                showNotification('注册失败: ' + result.error, 'error');
            }
        });
    },

    /**
     * 设置注销按钮监听
     * @private
     */
    _setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (!logoutBtn) return;
        
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    },

    /**
     * 更新认证相关UI
     * @private
     */
    _updateAuthUI() {
        // 获取UI元素
        const authElements = document.querySelectorAll('[data-auth-state]');
        const userDisplayElements = document.querySelectorAll('[data-user-display]');
        
        // 根据登录状态更新UI
        const isLoggedIn = this.isLoggedIn();
        
        authElements.forEach(element => {
            const authState = element.getAttribute('data-auth-state');
            
            if ((authState === 'logged-in' && isLoggedIn) || 
                (authState === 'logged-out' && !isLoggedIn)) {
                element.classList.remove('d-none');
            } else {
                element.classList.add('d-none');
            }
        });
        
        // 更新显示用户信息的元素
        if (isLoggedIn && this.currentUser) {
            userDisplayElements.forEach(element => {
                const userField = element.getAttribute('data-user-display');
                if (userField && this.currentUser[userField]) {
                    element.textContent = this.currentUser[userField];
                }
            });
        }
    },

    /**
     * 触发认证事件
     * @param {string} eventName - 事件名称
     * @param {Object} data - 事件数据
     * @private
     */
    _dispatchEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
};

// DOM加载完成后初始化认证模块
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
}); 