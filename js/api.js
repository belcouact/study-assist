/**
 * 学习助手 - API请求封装
 * 处理与后端API的交互
 */

// 为演示目的，使用模拟数据
// 在实际应用中，这些应该替换为真实API调用

// API基础URL
const API_BASE_URL = 'https://api.example.com';

// 获取认证令牌
function getAuthToken() {
    return localStorage.getItem('study_assist_token');
}

/**
 * 创建标准API请求头
 * @returns {Object} - 请求头对象
 */
function createHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

/**
 * 处理API响应
 * @param {Response} response - fetch响应对象
 * @returns {Promise} - 解析后的数据
 */
async function handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        // 处理认证错误
        if (response.status === 401) {
            // 清除无效的认证信息
            localStorage.removeItem('study_assist_token');
            localStorage.removeItem('study_assist_user');
            
            // 通知用户需要重新登录
            showNotification('您的登录已过期，请重新登录。', 'error');
        }
        
        // 抛出错误
        throw new Error(data.message || '发生错误，请稍后再试');
    }
    
    return data;
}

/**
 * 通用API请求函数
 * @param {string} endpoint - API端点
 * @param {Object} options - 请求选项
 * @returns {Promise} - API响应
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: createHeaders(),
            ...options
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
}

// 示例API调用函数
const api = {
    // 认证相关
    auth: {
        /**
         * 用户登录
         * @param {Object} credentials - 登录凭据
         * @returns {Promise} - 登录响应
         */
        login: async (credentials) => {
            // 模拟API调用
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        token: 'mock-jwt-token',
                        user: {
                            id: 1,
                            name: credentials.email.split('@')[0],
                            email: credentials.email,
                            avatar: 'assets/images/default-avatar.svg'
                        }
                    });
                }, 800);
            });
            
            // 实际API调用
            // return apiRequest('/auth/login', {
            //     method: 'POST',
            //     body: JSON.stringify(credentials)
            // });
        },
        
        /**
         * 用户注册
         * @param {Object} userData - 用户数据
         * @returns {Promise} - 注册响应
         */
        register: async (userData) => {
            // 模拟API调用
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        token: 'mock-jwt-token',
                        user: {
                            id: 1,
                            name: userData.name,
                            email: userData.email,
                            avatar: 'assets/images/default-avatar.svg'
                        }
                    });
                }, 1000);
            });
            
            // 实际API调用
            // return apiRequest('/auth/register', {
            //     method: 'POST',
            //     body: JSON.stringify(userData)
            // });
        }
    },
    
    // 学习资源相关
    resources: {
        /**
         * 获取学科列表
         * @returns {Promise} - 学科列表
         */
        getSubjects: async () => {
            // 模拟API调用
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([
                        { id: 1, name: '数学', code: 'math', icon: 'math.svg' },
                        { id: 2, name: '语文', code: 'chinese', icon: 'chinese.svg' },
                        { id: 3, name: '英语', code: 'english', icon: 'english.svg' },
                        { id: 4, name: '历史', code: 'history', icon: 'history.svg' },
                        { id: 5, name: '科学', code: 'science', icon: 'science.svg' }
                    ]);
                }, 500);
            });
            
            // 实际API调用
            // return apiRequest('/resources/subjects');
        },
        
        /**
         * 获取特定学科的主题
         * @param {string} subjectCode - 学科代码
         * @returns {Promise} - 主题列表
         */
        getTopics: async (subjectCode) => {
            // 模拟API调用
            return new Promise((resolve) => {
                const topics = {
                    math: [
                        { id: 1, name: '代数', icon: 'algebra.svg' },
                        { id: 2, name: '几何', icon: 'geometry.svg' },
                        { id: 3, name: '概率与统计', icon: 'statistics.svg' }
                    ],
                    chinese: [
                        { id: 1, name: '古典诗词', icon: 'poetry.svg' },
                        { id: 2, name: '现代文学', icon: 'modern-literature.svg' },
                        { id: 3, name: '语言知识', icon: 'language.svg' }
                    ],
                    english: [
                        { id: 1, name: '词汇', icon: 'vocabulary.svg' },
                        { id: 2, name: '语法', icon: 'grammar.svg' },
                        { id: 3, name: '阅读理解', icon: 'reading.svg' }
                    ],
                    history: [
                        { id: 1, name: '古代史', icon: 'ancient.svg' },
                        { id: 2, name: '近现代史', icon: 'modern.svg' },
                        { id: 3, name: '世界史', icon: 'world.svg' }
                    ],
                    science: [
                        { id: 1, name: '物理', icon: 'physics.svg' },
                        { id: 2, name: '化学', icon: 'chemistry.svg' },
                        { id: 3, name: '生物', icon: 'biology.svg' }
                    ]
                };
                
                setTimeout(() => {
                    resolve(topics[subjectCode] || []);
                }, 500);
            });
            
            // 实际API调用
            // return apiRequest(`/resources/subjects/${subjectCode}/topics`);
        }
    },
    
    // AI服务相关
    ai: {
        /**
         * 提问AI助手
         * @param {string} question - 问题内容
         * @param {string} subject - 相关学科
         * @returns {Promise} - AI回答
         */
        askQuestion: async (question, subject = 'general') => {
            // 模拟API调用
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        answer: `这是对"${question}"的回答。AI辅助学习系统会根据您的问题提供详细的解答。`,
                        references: [
                            { title: '参考资料1', url: '#' },
                            { title: '参考资料2', url: '#' }
                        ]
                    });
                }, 1500);
            });
            
            // 实际API调用
            // return apiRequest('/ai/ask', {
            //     method: 'POST',
            //     body: JSON.stringify({ question, subject })
            // });
        },
        
        /**
         * 获取测验问题
         * @param {string} subject - 学科
         * @param {string} topic - 主题
         * @param {number} count - 问题数量
         * @returns {Promise} - 测验问题列表
         */
        getQuizQuestions: async (subject, topic, count = 5) => {
            // 模拟API调用
            return new Promise((resolve) => {
                const questions = [];
                
                for (let i = 1; i <= count; i++) {
                    questions.push({
                        id: i,
                        question: `这是关于${subject}中${topic}的第${i}个测验问题？`,
                        options: [
                            { id: 'A', text: '选项A' },
                            { id: 'B', text: '选项B' },
                            { id: 'C', text: '选项C' },
                            { id: 'D', text: '选项D' }
                        ],
                        correctAnswer: 'A',
                        explanation: `这是问题${i}的详细解释。`
                    });
                }
                
                setTimeout(() => {
                    resolve(questions);
                }, 1000);
            });
            
            // 实际API调用
            // return apiRequest('/ai/quiz', {
            //     method: 'POST',
            //     body: JSON.stringify({ subject, topic, count })
            // });
        }
    },
    
    // 用户相关
    user: {
        /**
         * 获取用户学习进度
         * @returns {Promise} - 学习进度
         */
        getProgress: async () => {
            // 模拟API调用
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        subjects: [
                            { id: 'math', name: '数学', progress: 75 },
                            { id: 'chinese', name: '语文', progress: 60 },
                            { id: 'english', name: '英语', progress: 45 },
                            { id: 'history', name: '历史', progress: 30 },
                            { id: 'science', name: '科学', progress: 20 }
                        ],
                        recentActivities: [
                            { id: 1, type: 'quiz', subject: '数学', score: '80%', date: '2023-03-15' },
                            { id: 2, type: 'question', subject: '英语', date: '2023-03-14' },
                            { id: 3, type: 'lesson', subject: '历史', date: '2023-03-12' }
                        ]
                    });
                }, 800);
            });
            
            // 实际API调用
            // return apiRequest('/user/progress');
        },
        
        /**
         * 保存测验结果
         * @param {Object} result - 测验结果数据
         * @returns {Promise} - 保存响应
         */
        saveQuizResult: async (result) => {
            // 模拟API调用
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, message: '测验结果已保存' });
                }, 500);
            });
            
            // 实际API调用
            // return apiRequest('/user/quiz-results', {
            //     method: 'POST',
            //     body: JSON.stringify(result)
            // });
        }
    }
};

// 将API导出为全局变量
window.api = api; 