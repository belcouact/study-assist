const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// KV存储配置
const KV_CONFIG = {
    accountId: 'd69fd92582f54c82b0df2dc18f6ce059',
    namespaceId: 'kv-ws-hub',
    apiToken: 'YOUR_API_TOKEN', // 需要替换为实际的API令牌
    baseUrl: `https://api.cloudflare.com/client/v4/accounts/d69fd92582f54c82b0df2dc18f6ce059/storage/kv/namespaces/kv-ws-hub`
};

// 请求头配置
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${KV_CONFIG.apiToken}`
};

// 获取环境变量
app.get('/api/env/:key', (req, res) => {
    try {
        const { key } = req.params;
        const envValue = process.env[key];
        
        if (envValue !== undefined) {
            res.json({ key, value: envValue });
        } else {
            res.status(404).json({ error: `Environment variable ${key} not found` });
        }
    } catch (error) {
        console.error('Error getting environment variable:', error);
        res.status(500).json({ error: 'Failed to get environment variable' });
    }
});

// 获取KV值
app.get('/api/kv/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const response = await axios.get(`${KV_CONFIG.baseUrl}/values/${key}`, { headers });
        res.json(response.data);
    } catch (error) {
        console.error('Error getting KV value:', error);
        res.status(500).json({ error: 'Failed to get KV value' });
    }
});

// 设置KV值
app.put('/api/kv/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value, expiration, expirationTtl, metadata } = req.body;
        
        let url = `${KV_CONFIG.baseUrl}/values/${key}`;
        
        // 添加查询参数
        const params = new URLSearchParams();
        if (expiration) params.append('expiration', expiration);
        if (expirationTtl) params.append('expiration_ttl', expirationTtl);
        if (metadata) params.append('metadata', JSON.stringify(metadata));
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await axios.put(url, value, { headers });
        res.json(response.data);
    } catch (error) {
        console.error('Error setting KV value:', error);
        res.status(500).json({ error: 'Failed to set KV value' });
    }
});

// 删除KV值
app.delete('/api/kv/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const response = await axios.delete(`${KV_CONFIG.baseUrl}/values/${key}`, { headers });
        res.json(response.data);
    } catch (error) {
        console.error('Error deleting KV value:', error);
        res.status(500).json({ error: 'Failed to delete KV value' });
    }
});

// 列出KV键
app.get('/api/kv', async (req, res) => {
    try {
        const { limit, cursor, prefix } = req.query;
        
        let url = `${KV_CONFIG.baseUrl}/keys`;
        
        // 添加查询参数
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);
        if (cursor) params.append('cursor', cursor);
        if (prefix) params.append('prefix', prefix);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await axios.get(url, { headers });
        res.json(response.data);
    } catch (error) {
        console.error('Error listing KV keys:', error);
        res.status(500).json({ error: 'Failed to list KV keys' });
    }
});

// 获取故障数据
app.get('/ws/api/faults', async (req, res) => {
    try {
        // 获取所有以 fault_ 开头的键
        const listResponse = await axios.get(`${KV_CONFIG.baseUrl}/keys?prefix=fault_`, { headers });
        const keys = listResponse.data.result || [];
        
        const faults = [];
        
        // 获取每个故障数据
        for (const key of keys) {
            try {
                const faultResponse = await axios.get(`${KV_CONFIG.baseUrl}/values/${key.name}`, { headers });
                const faultData = faultResponse.data;
                
                if (faultData && typeof faultData === 'object') {
                    // 确保数据结构包含必要字段
                    const fault = {
                        id: faultData.id || key.name.replace('fault_', ''),
                        plant: faultData.plant || 'N/A',
                        equipmentName: faultData.equipmentName || faultData.deviceName || 'N/A',
                        equipmentType: faultData.equipmentType || faultData.deviceType || 'N/A',
                        department: faultData.department || 'N/A',
                        faultArea: faultData.faultArea || 'N/A',
                        faultCategory: faultData.faultCategory || 'N/A',
                        faultLevel: faultData.faultLevel || faultData.priority || 'N/A',
                        description: faultData.description || faultData.faultDescription || 'N/A',
                        status: faultData.status || 'N/A',
                        reportTime: faultData.reportTime || faultData.createTime || new Date().toISOString(),
                        reporter: faultData.reporter || faultData.assignee || 'N/A',
                        progress: faultData.progress || '0%',
                        solution: faultData.solution || faultData.resolution || 'N/A',
                        createdAt: faultData.createdAt || faultData.createTime || new Date().toISOString()
                    };
                    
                    faults.push(fault);
                }
            } catch (error) {
                console.warn(`获取故障数据 ${key.name} 失败:`, error.message);
            }
        }
        
        // 按创建时间倒序排列
        faults.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA; // 最新的在前面
        });
        
        res.json(faults);
    } catch (error) {
        console.error('获取故障数据失败:', error);
        res.status(500).json({ 
            error: 'Failed to get fault data',
            message: error.message 
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`KV API Proxy Server running on port ${PORT}`);
});