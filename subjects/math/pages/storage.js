/**
 * 本地存储工具
 * 提供简单的接口来存储和获取本地存储中的数据
 */

const storage = {
    /**
     * 存储数据到本地存储
     * @param {string} key - 存储的键名
     * @param {any} value - 存储的值（会自动转换为JSON字符串）
     */
    set: function(key, value) {
        try {
            const valueToStore = JSON.stringify(value);
            localStorage.setItem(key, valueToStore);
            return true;
        } catch (error) {
            console.error('保存到本地存储时出错:', error);
            return false;
        }
    },

    /**
     * 从本地存储中获取数据
     * @param {string} key - 存储的键名
     * @param {any} defaultValue - 如果键不存在时返回的默认值
     * @returns {any} 解析后的值或默认值
     */
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error('从本地存储获取数据时出错:', error);
            return defaultValue;
        }
    },

    /**
     * 从本地存储中删除数据
     * @param {string} key - 要删除的键名
     */
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('从本地存储删除数据时出错:', error);
            return false;
        }
    },

    /**
     * 清空本地存储中的所有数据
     */
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清空本地存储时出错:', error);
            return false;
        }
    }
}; 