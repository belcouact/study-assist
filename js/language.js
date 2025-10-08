// Language translations
const translations = {
    zh: {
        // Common elements
        'login-title': '系统登录',
        'login-subtitle': '请输入您的凭据以访问系统',
        'username-label': '用户名',
        'password-label': '密码',
        'login-button': '登录',
        'guest-text': '访客身份访问',
        'login-error': '用户名或密码错误，请重试',
        'page-title': '戈尔设备故障管理',
        'nav-home': '首页',
        'nav-fault-list': '故障列表',
        'nav-new-fault': '新建故障',
        'nav-fault-stats': '故障统计',
        'nav-info-mgmt': '信息管理',
        'nav-logout': '退出登录',
        'card-fault-list-title': '故障列表',
        'card-fault-list-desc': '查看所有设备故障记录',
        'card-new-fault-title': '新建故障',
        'card-new-fault-desc': '添加新的设备故障记录',
        'card-fault-stats-title': '故障统计',
        'card-fault-stats-desc': '查看设备故障数据分析',
        'card-info-mgmt-title': '信息管理',
        'card-info-mgmt-desc': '管理设备与用户信息',
        'footer-text': '网页基于智谱大模型GLM-4.5创建',
        
        // Fault List Page
        'fault-list-title': '故障列表',
        'fault-list-subtitle': '查看和管理所有设备故障记录',
        'filter-factory': '工厂筛选',
        'filter-equipment': '设备筛选',
        'filter-status': '状态筛选',
        'filter-urgency': '紧急程度筛选',
        'filter-apply': '应用筛选',
        'filter-reset': '重置筛选',
        'table-id': 'ID',
        'table-factory': '工厂',
        'table-equipment': '设备名称',
        'table-area': '区域',
        'table-subarea': '子区域',
        'table-fault-type': '故障类型',
        'table-fault-desc': '故障描述',
        'table-status': '状态',
        'table-urgency': '紧急程度',
        'table-reporter': '报告人',
        'table-report-time': '报告时间',
        'table-actions': '操作',
        'status-pending': '待处理',
        'status-in-progress': '处理中',
        'status-completed': '已完成',
        'urgency-low': '低',
        'urgency-medium': '中',
        'urgency-high': '高',
        'action-view': '查看',
        'action-edit': '编辑',
        'action-delete': '删除',
        'pagination-previous': '上一页',
        'pagination-next': '下一页',
        'pagination-info': '显示 {start}-{end} 条，共 {total} 条记录',
        'no-data': '暂无数据',
        
        // New Fault Page
        'new-fault-title': '新建故障',
        'new-fault-subtitle': '填写设备故障信息',
        'form-factory': '工厂',
        'form-equipment': '设备名称',
        'form-area': '区域',
        'form-subarea': '子区域',
        'form-fault-type': '故障类型',
        'form-fault-desc': '故障描述',
        'form-status': '状态',
        'form-urgency': '紧急程度',
        'form-reporter': '报告人',
        'form-report-time': '报告时间',
        'form-submit': '提交',
        'form-reset': '重置',
        'form-cancel': '取消',
        'form-save': '保存',
        'form-loading': '保存中...',
        'form-success': '故障记录保存成功',
        'form-error': '保存失败，请重试',
        
        // Fault Statistics Page
        'fault-stats-title': '故障统计',
        'fault-stats-subtitle': '设备故障数据分析',
        'stats-total': '故障总数',
        'stats-in-progress': '处理中',
        'stats-pending': '待处理',
        'stats-urgent': '紧急故障数',
        'chart-distribution': '按故障分类分布',
        'chart-trend': '故障时间趋势',
        'chart-equipment': '按设备分布',
        'chart-area': '按区域分布',
        'filter-month': '月',
        'filter-quarter': '季度',
        'filter-year': '年',
        'filter-equipment-btn': '按设备',
        'filter-area-btn': '按区域',
        'chart-fault-type': '故障分布',
        'chart-max': '最大值',
        'chart-min': '最小值',
        
        // Info Management Page
        'info-mgmt-title': '信息管理',
        'info-mgmt-subtitle': '管理设备与用户信息',
        'tab-equipment': '设备管理',
        'tab-user': '用户管理',
        'basic-data-maintenance': '基础数据维护',
        'fault-data-download': '故障数据下载',
        'download-description': '下载故障数据表格用于离线分析',
        'download-features': '功能特点：包含所有故障记录、支持Excel格式、可用于离线分析',
        'download-button': '下载故障数据',
        'action-add-single': '单次新增',
        'action-batch-download': '批量下载',
        'action-batch-upload': '批量上传',
        'modal-add-equipment': '新增设备',
        'modal-add-user': '新增用户',
        'modal-plant': '工厂',
        'modal-equipment-name': '设备名称',
        'modal-area': '区域',
        'modal-subarea': '子区域',
        'modal-name': '姓名',
        'modal-function': '部门',
        'modal-commitment': '岗位',
        'modal-save': '保存',
        'modal-cancel': '取消',
        'modal-loading': '保存中...',
        'modal-error': '保存失败: {error}',
        'modal-success-equipment': '设备添加成功!',
        'modal-success-user': '用户添加成功!',
        'modal-update-success-equipment': '设备更新成功!',
        'modal-update-success-user': '用户更新成功!',
        'modal-delete-confirm': '确定要删除这条记录吗？',
        'modal-delete-loading': '删除中...',
        'modal-delete-success': '删除成功',
        'modal-delete-error': '删除失败，请重试',
        'table-loading': '加载数据失败',
        'upload-success': '上传成功! {message}',
        'upload-error': '上传失败: {message}',
        
        // Additional keys for fault-list.html
        'fault-detail-title': '故障详情',
        'fault-id-label': '故障ID',
        'description-section': '描述',
        'get-fault-detail-failed': '获取故障详情失败',
        'get-fault-detail-error': '获取故障详情时出错，请稍后重试',
        'process-fault-title': '处理故障',
        'status-label': '状态',
        'handler-label': '处理人',
        'handling-description-label': '处理说明',
        'resolution-label': '故障解决',
        'submit-button': '提交',
        'cancel-button': '取消',
        'fault-status-updated': '故障处理状态已更新',
        'update-failed': '更新失败',
        'unknown-error': '未知错误',
        'update-fault-status-error': '更新故障状态时出错，请稍后重试',
        'process-fault-error': '处理故障时出错，请稍后重试',
        'delete-fault-confirm': '确定要删除此故障记录吗？此操作不可撤销。',
        'fault-deleted': '故障记录已删除',
        'delete-failed': '删除失败',
        'delete-fault-error': '删除故障时出错，请稍后重试',
        'level-high': '高',
        'level-medium': '中',
        'level-low': '低',
        'level-urgent': '紧急',
        'status-pending': '待处理',
        'status-processing': '处理中',
        'status-resolved': '已解决',
        'status-completed': '已完成',
        'unknown-time': '未知时间',
        'no-matching-faults': '没有找到符合条件的故障记录',
        'load-column-width-error': '加载列宽时出错'
    },
    en: {
        // Common elements
        'login-title': 'System Login',
        'login-subtitle': 'Please enter your credentials to access the system',
        'username-label': 'Username',
        'password-label': 'Password',
        'login-button': 'Login',
        'guest-text': 'Guest Access',
        'login-error': 'Username or password is incorrect, please try again',
        'page-title': 'Gear Equipment Fault Management',
        'nav-home': 'Home',
        'nav-fault-list': 'Fault List',
        'nav-new-fault': 'New Fault',
        'nav-fault-stats': 'Fault Statistics',
        'nav-info-mgmt': 'Info Management',
        'nav-logout': 'Logout',
        'card-fault-list-title': 'Fault List',
        'card-fault-list-desc': 'View all equipment fault records',
        'card-new-fault-title': 'New Fault',
        'card-new-fault-desc': 'Add new equipment fault record',
        'card-fault-stats-title': 'Fault Statistics',
        'card-fault-stats-desc': 'View equipment fault data analysis',
        'card-info-mgmt-title': 'Info Management',
        'card-info-mgmt-desc': 'Manage equipment and user information',
        'footer-text': 'Website created based on Zhipu AI GLM-4.5 model',
        
        // Fault List Page
        'fault-list-title': 'Fault List',
        'fault-list-subtitle': 'View and manage all equipment fault records',
        'filter-factory': 'Factory Filter',
        'filter-equipment': 'Equipment Filter',
        'filter-status': 'Status Filter',
        'filter-urgency': 'Urgency Filter',
        'filter-apply': 'Apply Filters',
        'filter-reset': 'Reset Filters',
        'table-id': 'ID',
        'table-factory': 'Factory',
        'table-equipment': 'Equipment Name',
        'table-area': 'Area',
        'table-subarea': 'Sub Area',
        'table-fault-type': 'Fault Type',
        'table-fault-desc': 'Fault Description',
        'table-status': 'Status',
        'table-urgency': 'Urgency',
        'table-reporter': 'Reporter',
        'table-report-time': 'Report Time',
        'table-actions': 'Actions',
        'status-pending': 'Pending',
        'status-in-progress': 'In Progress',
        'status-completed': 'Completed',
        'urgency-low': 'Low',
        'urgency-medium': 'Medium',
        'urgency-high': 'High',
        'action-view': 'View',
        'action-edit': 'Edit',
        'action-delete': 'Delete',
        'pagination-previous': 'Previous',
        'pagination-next': 'Next',
        'pagination-info': 'Showing {start}-{end} of {total} records',
        'no-data': 'No data available',
        
        // New Fault Page
        'new-fault-title': 'New Fault',
        'new-fault-subtitle': 'Fill in equipment fault information',
        'form-factory': 'Factory',
        'form-equipment': 'Equipment Name',
        'form-area': 'Area',
        'form-subarea': 'Sub Area',
        'form-fault-type': 'Fault Type',
        'form-fault-desc': 'Fault Description',
        'form-status': 'Status',
        'form-urgency': 'Urgency',
        'form-reporter': 'Reporter',
        'form-report-time': 'Report Time',
        'form-submit': 'Submit',
        'form-reset': 'Reset',
        'form-cancel': 'Cancel',
        'form-save': 'Save',
        'form-loading': 'Saving...',
        'form-success': 'Fault record saved successfully',
        'form-error': 'Save failed, please try again',
        
        // Fault Statistics Page
        'fault-stats-title': 'Fault Statistics',
        'fault-stats-subtitle': 'Equipment fault data analysis',
        'stats-total': 'Total Faults',
        'stats-in-progress': 'In Progress',
        'stats-pending': 'Pending',
        'stats-urgent': 'Urgent Faults',
        'chart-distribution': 'Distribution by Fault Type',
        'chart-trend': 'Fault Time Trend',
        'chart-equipment': 'Distribution by Equipment',
        'chart-area': 'Distribution by Area',
        'filter-month': 'Month',
        'filter-quarter': 'Quarter',
        'filter-year': 'Year',
        'filter-equipment-btn': 'By Equipment',
        'filter-area-btn': 'By Area',
        'chart-fault-type': 'Fault Distribution',
        'chart-max': 'Maximum',
        'chart-min': 'Minimum',
        
        // Info Management Page
        'info-mgmt-title': 'Information Management',
        'info-mgmt-subtitle': 'Manage equipment and user information',
        'tab-equipment': 'Equipment Management',
        'tab-user': 'User Management',
        'basic-data-maintenance': 'Basic Data Maintenance',
        'fault-data-download': 'Fault Data Download',
        'download-description': 'Download fault data tables for offline analysis',
        'download-features': 'Features: Includes all fault records, supports Excel format, can be used for offline analysis',
        'download-button': 'Download Fault Data',
        'action-add-single': 'Add Single',
        'action-batch-download': 'Batch Download',
        'action-batch-upload': 'Batch Upload',
        'modal-add-equipment': 'Add Equipment',
        'modal-add-user': 'Add User',
        'modal-plant': 'Plant',
        'modal-equipment-name': 'Equipment Name',
        'modal-area': 'Area',
        'modal-subarea': 'Sub Area',
        'modal-name': 'Name',
        'modal-function': 'Department',
        'modal-commitment': 'Position',
        'modal-save': 'Save',
        'modal-cancel': 'Cancel',
        'modal-loading': 'Saving...',
        'modal-error': 'Save failed: {error}',
        'modal-success-equipment': 'Equipment added successfully!',
        'modal-success-user': 'User added successfully!',
        'modal-update-success-equipment': 'Equipment updated successfully!',
        'modal-update-success-user': 'User updated successfully!',
        'modal-delete-confirm': 'Are you sure you want to delete this record?',
        'modal-delete-loading': 'Deleting...',
        'modal-delete-success': 'Deleted successfully',
        'modal-delete-error': 'Delete failed, please try again',
        'table-loading': 'Failed to load data',
        'upload-success': 'Upload successful! {message}',
        'upload-error': 'Upload failed: {message}',
        
        // Additional keys for fault-list.html
        'fault-detail-title': 'Fault Details',
        'fault-id-label': 'Fault ID',
        'description-section': 'Description',
        'get-fault-detail-failed': 'Failed to get fault details',
        'get-fault-detail-error': 'Error getting fault details, please try again later',
        'process-fault-title': 'Process Fault',
        'status-label': 'Status',
        'handler-label': 'Handler',
        'handling-description-label': 'Handling Description',
        'resolution-label': 'Resolution',
        'submit-button': 'Submit',
        'cancel-button': 'Cancel',
        'fault-status-updated': 'Fault status has been updated',
        'update-failed': 'Update failed',
        'unknown-error': 'Unknown error',
        'update-fault-status-error': 'Error updating fault status, please try again later',
        'process-fault-error': 'Error processing fault, please try again later',
        'delete-fault-confirm': 'Are you sure you want to delete this fault record? This action cannot be undone.',
        'fault-deleted': 'Fault record has been deleted',
        'delete-failed': 'Delete failed',
        'delete-fault-error': 'Error deleting fault, please try again later',
        'level-high': 'High',
        'level-medium': 'Medium',
        'level-low': 'Low',
        'level-urgent': 'Urgent',
        'status-pending': 'Pending',
        'status-processing': 'Processing',
        'status-resolved': 'Resolved',
        'status-completed': 'Completed',
        'unknown-time': 'Unknown time',
        'no-matching-faults': 'No matching fault records found',
        'load-column-width-error': 'Error loading column width'
    }
};

// Default language
let currentLanguage = 'zh';

// Function to get saved language preference
function getSavedLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        return savedLang;
    }
    
    // Try to detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('en')) {
        return 'en';
    }
    
    // Default to Chinese
    return 'zh';
}

// Function to set language
function setLanguage(lang) {
    if (!translations[lang]) {
        console.error(`Language ${lang} not supported`);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // Update active language button (if they exist)
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.getElementById(`lang${lang.charAt(0).toUpperCase() + lang.slice(1)}`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Update all elements with data-lang attribute
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang][key]) {
            // Special handling for elements that might contain HTML
            if (element.tagName === 'BUTTON' && element.innerHTML.includes('<div')) {
                // For login button which contains a loading div
                const loadingDiv = element.querySelector('.login-loading');
                element.innerHTML = translations[lang][key];
                if (loadingDiv) {
                    element.appendChild(loadingDiv);
                }
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    
    // Update document title
    document.title = translations[lang]['page-title'] + ' | ' + 
                   (lang === 'zh' ? '故障管理' : 'Fault Management');
    
    // Update HTML lang attribute
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
    
    // Dispatch custom event for other scripts to react to language change
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Initialize language when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language based on saved preference or browser language
    const initialLang = getSavedLanguage();
    setLanguage(initialLang);
    
    // Add event listeners to language buttons (if they exist)
    const langZhButton = document.getElementById('langZh');
    const langEnButton = document.getElementById('langEn');
    
    if (langZhButton) {
        langZhButton.addEventListener('click', () => setLanguage('zh'));
    }
    
    if (langEnButton) {
        langEnButton.addEventListener('click', () => setLanguage('en'));
    }
    
    // Make setLanguage function globally available for other pages
    window.setLanguage = setLanguage;
    window.currentLanguage = currentLanguage;
    window.translations = translations;
});

// Function to get current language (can be used by other scripts)
function getCurrentLanguage() {
    return currentLanguage;
}

// Function to get translation for a specific key
function getTranslation(key, lang = null) {
    const language = lang || currentLanguage;
    return translations[language] && translations[language][key] ? translations[language][key] : key;
}

// Export functions for use in other scripts
window.getCurrentLanguage = getCurrentLanguage;
window.getTranslation = getTranslation;