// KV存储配置
const KV_CONFIG = {
    // Cloudflare账户ID
    accountId: 'd69fd92582f54c82b0df2dc18f6ce059',
    
    // KV存储命名空间ID
    namespaceId: 'kv-ws-hub',
    
    // API令牌 (需要替换为实际的API令牌)
    // 可以从Cloudflare控制台创建: https://dash.cloudflare.com/profile/api-tokens
    apiToken: 'YOUR_API_TOKEN',
    
    // KV存储中的键名
    keys: {
        faults: 'faults',           // 故障数据
        equipment: 'equipment',     // 设备数据
        users: 'users',             // 用户数据
        departments: 'departments'  // 部门数据
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KV_CONFIG;
} else {
    window.KV_CONFIG = KV_CONFIG;
}