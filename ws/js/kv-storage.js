// KV存储操作工具类
class KVStorage {
    constructor() {
        // 从配置文件加载配置
        if (typeof KV_CONFIG !== 'undefined') {
            this.accountId = KV_CONFIG.accountId;
            this.namespaceId = KV_CONFIG.namespaceId;
            this.apiToken = KV_CONFIG.apiToken;
            this.keys = KV_CONFIG.keys;
        } else {
            // 如果配置文件未加载，使用默认值
            this.accountId = 'd69fd92582f54c82b0df2dc18f6ce059';
            this.namespaceId = 'kv-ws-hub';
            this.apiToken = 'YOUR_API_TOKEN';
            this.keys = {
                faults: 'faults',
                equipment: 'equipment',
                users: 'users',
                departments: 'departments'
            };
        }
        
        // 使用代理服务器URL
        this.proxyUrl = 'http://localhost:3001/api/kv';
    }

    // 获取KV存储中的值
    async get(key) {
        try {
            const response = await fetch(`${this.proxyUrl}/${key}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to get value for key ${key}`);
            }
            
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Error getting value from KV storage:', error);
            throw error;
        }
    }

    // 向KV存储中写入值
    async put(key, value, options = {}) {
        try {
            const url = `${this.proxyUrl}/${key}`;
            
            const requestBody = {
                value: value
            };
            
            // 添加可选参数
            if (options.expiration) {
                requestBody.expiration = options.expiration;
            }
            if (options.expirationTtl) {
                requestBody.expirationTtl = options.expirationTtl;
            }
            if (options.metadata) {
                requestBody.metadata = options.metadata;
            }
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to put value for key ${key}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error putting value to KV storage:', error);
            throw error;
        }
    }

    // 删除KV存储中的键
    async delete(key) {
        try {
            const response = await fetch(`${this.proxyUrl}/${key}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to delete key ${key}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting key from KV storage:', error);
            throw error;
        }
    }

    // 列出KV存储中的所有键
    async list(options = {}) {
        try {
            let url = this.proxyUrl;
            
            // 添加查询参数
            const params = new URLSearchParams();
            if (options.limit) {
                params.append('limit', options.limit);
            }
            if (options.cursor) {
                params.append('cursor', options.cursor);
            }
            if (options.prefix) {
                params.append('prefix', options.prefix);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to list keys');
            }
            
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Error listing keys from KV storage:', error);
            throw error;
        }
    }
}

// 故障数据管理类
class FaultDataManager {
    constructor() {
        // 初始化KV存储实例
        this.kvStorage = new KVStorage();
    }

    // 获取所有故障数据
    async getAllFaults() {
        try {
            const faults = await this.kvStorage.get(this.kvStorage.keys.faults);
            return faults || [];
        } catch (error) {
            console.error('Error getting all faults:', error);
            // 返回示例数据作为后备
            return [
                {
                    id: '1',
                    equipmentId: 'EQ001',
                    equipmentName: '生产线A',
                    faultType: '机械故障',
                    reportTime: '2023-06-15 09:30',
                    status: 'completed',
                    handler: '张工',
                    description: '生产线A机械臂故障，已更换零件',
                    reportTime: '2023-06-15 09:30',
                    completionTime: '2023-06-15 16:45'
                },
                {
                    id: '2',
                    equipmentId: 'EQ002',
                    equipmentName: '检测仪B',
                    faultType: '电气故障',
                    reportTime: '2023-06-16 14:20',
                    status: 'processing',
                    handler: '李工',
                    description: '检测仪B电路板故障，正在维修中',
                    reportTime: '2023-06-16 14:20',
                    completionTime: null
                },
                {
                    id: '3',
                    equipmentId: 'EQ003',
                    equipmentName: '传送带C',
                    faultType: '软件故障',
                    reportTime: '2023-06-17 10:45',
                    status: 'pending',
                    handler: null,
                    description: '传送带C控制系统软件错误',
                    reportTime: '2023-06-17 10:45',
                    completionTime: null
                }
            ];
        }
    }

    // 添加新故障
    async addFault(fault) {
        try {
            const faults = await this.getAllFaults();
            const newFault = {
                ...fault,
                id: Date.now().toString(), // 简单生成唯一ID
                reportTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
                status: 'pending',
                handler: null,
                completionTime: null
            };
            
            faults.push(newFault);
            await this.kvStorage.put(this.kvStorage.keys.faults, faults);
            return newFault;
        } catch (error) {
            console.error('Error adding fault:', error);
            throw error;
        }
    }

    // 更新故障状态
    async updateFaultStatus(faultId, status, handler = null) {
        try {
            const faults = await this.getAllFaults();
            const faultIndex = faults.findIndex(f => f.id === faultId);
            
            if (faultIndex === -1) {
                throw new Error(`Fault with ID ${faultId} not found`);
            }
            
            faults[faultIndex].status = status;
            if (handler) {
                faults[faultIndex].handler = handler;
            }
            
            if (status === 'completed') {
                faults[faultIndex].completionTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            }
            
            await this.kvStorage.put(this.kvStorage.keys.faults, faults);
            return faults[faultIndex];
        } catch (error) {
            console.error('Error updating fault status:', error);
            throw error;
        }
    }

    // 删除故障
    async deleteFault(faultId) {
        try {
            const faults = await this.getAllFaults();
            const updatedFaults = faults.filter(f => f.id !== faultId);
            
            if (updatedFaults.length === faults.length) {
                throw new Error(`Fault with ID ${faultId} not found`);
            }
            
            await this.kvStorage.put(this.kvStorage.keys.faults, updatedFaults);
            return true;
        } catch (error) {
            console.error('Error deleting fault:', error);
            throw error;
        }
    }

    // 获取故障统计信息
    async getFaultStatistics() {
        try {
            const faults = await this.getAllFaults();
            
            const statistics = {
                total: faults.length,
                completed: faults.filter(f => f.status === 'completed').length,
                processing: faults.filter(f => f.status === 'processing').length,
                pending: faults.filter(f => f.status === 'pending').length,
                byType: {},
                byEquipment: {}
            };
            
            // 按故障类型统计
            faults.forEach(fault => {
                statistics.byType[fault.faultType] = (statistics.byType[fault.faultType] || 0) + 1;
                statistics.byEquipment[fault.equipmentName] = (statistics.byEquipment[fault.equipmentName] || 0) + 1;
            });
            
            return statistics;
        } catch (error) {
            console.error('Error getting fault statistics:', error);
            throw error;
        }
    }
}