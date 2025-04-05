/**
 * 学习助手 - API请求封装
 */

// API基础URL（实际项目中应替换为真实API地址）
const API_BASE_URL = '/api';

// 默认请求超时时间（毫秒）
const DEFAULT_TIMEOUT = 10000;

/**
 * API请求模块
 */
const api = {
    /**
     * 发送GET请求
     * @param {string} endpoint - API端点
     * @param {Object} params - 查询参数
     * @param {Object} options - 请求选项
     * @returns {Promise<any>} - 响应数据
     */
    async get(endpoint, params = {}, options = {}) {
        const url = this._buildUrl(endpoint, params);
        return this._request(url, {
            method: 'GET',
            ...options
        });
    },
    
    /**
     * 发送POST请求
     * @param {string} endpoint - API端点
     * @param {Object} data - 请求数据
     * @param {Object} options - 请求选项
     * @returns {Promise<any>} - 响应数据
     */
    async post(endpoint, data = {}, options = {}) {
        const url = this._buildUrl(endpoint);
        return this._request(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        });
    },
    
    /**
     * 发送PUT请求
     * @param {string} endpoint - API端点
     * @param {Object} data - 请求数据
     * @param {Object} options - 请求选项
     * @returns {Promise<any>} - 响应数据
     */
    async put(endpoint, data = {}, options = {}) {
        const url = this._buildUrl(endpoint);
        return this._request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        });
    },
    
    /**
     * 发送DELETE请求
     * @param {string} endpoint - API端点
     * @param {Object} options - 请求选项
     * @returns {Promise<any>} - 响应数据
     */
    async delete(endpoint, options = {}) {
        const url = this._buildUrl(endpoint);
        return this._request(url, {
            method: 'DELETE',
            ...options
        });
    },
    
    /**
     * 发送请求到AI服务
     * @param {string} prompt - 提示文本
     * @param {Object} options - 请求选项
     * @returns {Promise<any>} - AI响应
     */
    async askAI(prompt, options = {}) {
        return this.post('/ai/chat', { prompt }, options);
    },
    
    /**
     * 构建URL
     * @param {string} endpoint - API端点
     * @param {Object} params - 查询参数
     * @returns {string} - 完整URL
     * @private
     */
    _buildUrl(endpoint, params = {}) {
        const url = new URL(API_BASE_URL + endpoint, window.location.origin);
        
        // 添加查询参数
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        
        return url.toString();
    },
    
    /**
     * 发送请求
     * @param {string} url - 请求URL
     * @param {Object} options - 请求选项
     * @returns {Promise<any>} - 响应数据
     * @private
     */
    async _request(url, options = {}) {
        try {
            // 合并默认选项
            const requestOptions = {
                ...options,
                headers: {
                    ...options.headers
                }
            };
            
            // 添加认证令牌（如果存在）
            const token = storage.get('study_assist_token');
            if (token) {
                requestOptions.headers.Authorization = `Bearer ${token}`;
            }
            
            // 使用超时处理
            const controller = new AbortController();
            const timeout = options.timeout || DEFAULT_TIMEOUT;
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            requestOptions.signal = controller.signal;
            
            // 发送请求
            const response = await fetch(url, requestOptions);
            clearTimeout(timeoutId);
            
            // 解析响应
            const data = await response.json();
            
            // 检查响应状态
            if (!response.ok) {
                throw new Error(data.message || `请求失败: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            
            console.error('API请求错误:', error);
            throw error;
        }
    }
};

// 导出API模块
window.api = api; 