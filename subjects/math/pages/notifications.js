/**
 * 通知工具
 * 提供简单的接口来展示临时通知
 */

/**
 * 显示一个临时通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 (success, info, warning, danger)
 * @param {number} duration - 通知持续时间（毫秒） 
 */
function showNotification(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加到文档
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    container.appendChild(notification);
    
    // 添加显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 持续时间后移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
            
            // 如果容器中没有更多通知，移除容器
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300); // 淡出动画时间
    }, duration);
}

/**
 * 创建通知容器
 * @returns {HTMLElement} 通知容器元素
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

/**
 * 成功通知
 * @param {string} message - 通知消息
 * @param {number} duration - 通知持续时间（毫秒）
 */
function showSuccessNotification(message, duration = 3000) {
    showNotification(message, 'success', duration);
}

/**
 * 警告通知
 * @param {string} message - 通知消息
 * @param {number} duration - 通知持续时间（毫秒）
 */
function showWarningNotification(message, duration = 3000) {
    showNotification(message, 'warning', duration);
}

/**
 * 错误通知
 * @param {string} message - 通知消息
 * @param {number} duration - 通知持续时间（毫秒）
 */
function showErrorNotification(message, duration = 3000) {
    showNotification(message, 'danger', duration);
} 