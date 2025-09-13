// 世界各国地理信息探索页面脚本
document.addEventListener('DOMContentLoaded', function() {
    // 调试信息显示功能
    const debugInfo = document.getElementById('debug-info');
    const debugContent = document.getElementById('debug-content');
    const clearDebugBtn = document.getElementById('clear-debug');
    
    // 显示调试信息
    window.showDebugInfo = function() {
        if (debugInfo) {
            debugInfo.style.display = 'block';
        }
    };
    
    // 隐藏调试信息
    window.hideDebugInfo = function() {
        if (debugInfo) {
            debugInfo.style.display = 'none';
        }
    };
    
    // 添加调试信息
    window.addDebugMessage = function(message, type = 'log') {
        if (!debugContent) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const messageElement = document.createElement('div');
        messageElement.style.marginBottom = '5px';
        
        if (type === 'error') {
            messageElement.style.color = 'red';
        } else if (type === 'warn') {
            messageElement.style.color = 'orange';
        } else {
            messageElement.style.color = 'black';
        }
        
        messageElement.textContent = `[${timestamp}] ${message}`;
        debugContent.appendChild(messageElement);
        
        // 自动滚动到底部
        debugContent.scrollTop = debugContent.scrollHeight;
    };
    
    // 清除调试信息
    if (clearDebugBtn) {
        clearDebugBtn.addEventListener('click', function() {
            if (debugContent) {
                debugContent.innerHTML = '';
            }
        });
    }
    
    // 重写console方法以同时显示在调试区域
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.log = function(...args) {
        originalConsoleLog.apply(console, args);
        window.addDebugMessage(args.join(' '), 'log');
    };
    
    console.error = function(...args) {
        originalConsoleError.apply(console, args);
        window.addDebugMessage(args.join(' '), 'error');
    };
    
    console.warn = function(...args) {
        originalConsoleWarn.apply(console, args);
        window.addDebugMessage(args.join(' '), 'warn');
    };
    
    // 添加调试开关按钮
    const debugToggle = document.createElement('button');
    debugToggle.textContent = '调试开关';
    debugToggle.style.position = 'fixed';
    debugToggle.style.bottom = '20px';
    debugToggle.style.left = '20px';
    debugToggle.style.padding = '8px 16px';
    debugToggle.style.backgroundColor = '#6c757d';
    debugToggle.style.color = 'white';
    debugToggle.style.border = 'none';
    debugToggle.style.borderRadius = '4px';
    debugToggle.style.fontSize = '14px';
    debugToggle.style.cursor = 'pointer';
    debugToggle.style.zIndex = '9999';
    
    debugToggle.addEventListener('click', function() {
        if (debugInfo.style.display === 'none' || !debugInfo.style.display) {
            window.showDebugInfo();
            debugToggle.textContent = '隐藏调试';
            debugToggle.style.backgroundColor = '#dc3545';
        } else {
            window.hideDebugInfo();
            debugToggle.textContent = '显示调试';
            debugToggle.style.backgroundColor = '#6c757d';
        }
    });
    
    document.body.appendChild(debugToggle);
    
    // DOM元素
const searchInput = document.getElementById('country-search');
const countriesGrid = document.getElementById('countries-grid');
const loadingIndicator = document.getElementById('loading-indicator');
const countryModal = document.getElementById('country-modal');
const modalClose = document.getElementById('modal-close');
const modalCountryName = document.getElementById('modal-country-name');
const modalCountryRegion = document.getElementById('modal-country-region');
const modalBody = document.getElementById('modal-body');
const errorMessage = document.getElementById('error-message');
const errorDetails = document.getElementById('error-details');
const retryButton = document.getElementById('retry-button');
const countryDetails = document.getElementById('country-details');
const statsDropdown = document.getElementById('stats-dropdown');

// 模态框内的加载指示器
const modalLoadingIndicator = modalBody.querySelector('.loading-indicator');
    let filterChips = document.querySelectorAll('.filter-chip');
    const viewButtons = document.querySelectorAll('.view-btn');
    const cardsView = document.getElementById('cards-view');
    const mapView = document.getElementById('map-view');

    // 数据存储
    let countriesData = [];
    let filteredCountries = [];
    let currentRegion = 'all';
    let currentView = 'cards';
    let coloredCountries = {}; // 用于跟踪已分配颜色的国家

    // 高亮匹配的国家
    function highlightCountries(countryIds) {
        console.log('DEBUG: highlightCountries called with countryIds:', countryIds);
        
        // 检查地图容器是否存在
        const mapContainer = document.getElementById('map-view');
        console.log('DEBUG: mapContainer:', mapContainer);
        
        if (!mapContainer) {
            console.error('DEBUG: mapContainer not found');
            return;
        }
        
        console.log('DEBUG: mapContainer display style:', mapContainer.style.display);
        
        if (mapContainer.style.display === 'none') {
            console.warn('DEBUG: mapContainer is not visible');
            return;
        }
        
        // 重置所有国家的高亮状态
        console.log('DEBUG: resetting country highlights');
        resetCountryHighlights();
        
        // 如果没有匹配的国家，直接返回
        if (!countryIds || countryIds.length === 0) {
            console.warn('DEBUG: No countryIds provided or empty array');
            return;
        }
        
        console.log(`DEBUG: Attempting to highlight ${countryIds.length} countries`);
        
        // 高亮匹配的国家
        let highlightedCount = 0;
        countryIds.forEach(countryId => {
            console.log(`DEBUG: Looking for country with ID: ${countryId} (type: ${typeof countryId})`);
            
            // 确保countryId是字符串
            const stringCountryId = typeof countryId === 'string' ? countryId : String(countryId);
            console.log(`DEBUG: Using string country ID: ${stringCountryId}`);
            
            const countryPath = document.querySelector(`.country-path[data-country-id="${stringCountryId}"]`);
            console.log(`DEBUG: countryPath for ${stringCountryId}:`, countryPath);
            
            if (countryPath) {
                console.log(`DEBUG: Highlighting country ${stringCountryId}`);
                // 使用高亮颜色
                countryPath.style.fill = '#ff6b6b';
                countryPath.style.stroke = '#ff4757';
                countryPath.style.strokeWidth = '2';
                countryPath.style.filter = 'drop-shadow(0 0 3px rgba(255, 107, 107, 0.5))';
                highlightedCount++;
            } else {
                console.warn(`DEBUG: Country path not found for ID: ${stringCountryId}`);
                
                // 尝试查找带有不同属性的国家路径
                const alternativeSelectors = [
                    `.country-path[id="${stringCountryId}"]`,
                    `.country-path[title*="${stringCountryId}"]`,
                    `path[data-country-id="${stringCountryId}"]`,
                    `path[id="${stringCountryId}"]`,
                    `path[title*="${stringCountryId}"]`
                ];
                
                for (const selector of alternativeSelectors) {
                    const altPath = document.querySelector(selector);
                    if (altPath) {
                        console.log(`DEBUG: Found country path with alternative selector: ${selector}`);
                        altPath.style.fill = '#ff6b6b';
                        altPath.style.stroke = '#ff4757';
                        altPath.style.strokeWidth = '2';
                        altPath.style.filter = 'drop-shadow(0 0 3px rgba(255, 107, 107, 0.5))';
                        highlightedCount++;
                        break;
                    }
                }
            }
        });
        
        console.log(`DEBUG: Successfully highlighted ${highlightedCount} out of ${countryIds.length} countries`);
    }
    
    // 重置所有国家的高亮状态
    function resetCountryHighlights() {
        console.log('DEBUG: resetCountryHighlights called');
        
        const countryPaths = document.querySelectorAll('.country-path');
        console.log(`DEBUG: Found ${countryPaths.length} country paths to reset`);
        
        countryPaths.forEach(path => {
            const countryId = path.getAttribute('data-country-id');
            console.log(`DEBUG: Resetting country path with ID: ${countryId} (type: ${typeof countryId})`);
            
            // 确保countryId是字符串
            const stringCountryId = typeof countryId === 'string' ? countryId : String(countryId);
            
            // 恢复原始颜色
            if (coloredCountries && coloredCountries[stringCountryId]) {
                console.log(`DEBUG: Restoring color for ${stringCountryId}: ${coloredCountries[stringCountryId]}`);
                path.style.fill = coloredCountries[stringCountryId];
            } else {
                console.log(`DEBUG: Setting default color for ${stringCountryId}`);
                path.style.fill = '#e0e0e0';
            }
            path.style.stroke = '#ffffff';
            path.style.strokeWidth = '1';
            path.style.filter = 'none';
        });
        
        console.log('DEBUG: resetCountryHighlights completed');
    }

    // 初始化
    console.log('DEBUG: Starting initialization');
    init();
    console.log('DEBUG: Initialization function called');

    // 从countriesData中提取所有大洲信息并更新筛选器
    async function updateRegionFiltersFromData() {
        if (!countriesData || countriesData.length === 0) {
            console.warn('没有可用的国家数据，无法更新筛选器');
            return;
        }
        
        // 提取所有唯一的大洲信息 - 使用Continent_Chn字段
        const continents = new Set();
        const continentCounts = {};
        
        console.log('开始处理国家数据，总共有', countriesData.length, '个国家');
        
        countriesData.forEach(country => {
            console.log('处理国家:', country.name, 'chineseContinent:', country.chineseContinent);
            if (country.chineseContinent) {
                continents.add(country.chineseContinent);
                continentCounts[country.chineseContinent] = (continentCounts[country.chineseContinent] || 0) + 1;
            } else {
                console.warn('国家', country.name, '没有chineseContinent字段');
            }
        });
        
        console.log('发现的大洲:', Array.from(continents));
        console.log('各大洲国家数量:', continentCounts);
        
        // 获取筛选器容器
        const filterContainer = document.querySelector('.filter-container');
        if (!filterContainer) {
            console.error('找不到筛选器容器');
            return;
        }
        
        // 清空现有筛选器
        filterContainer.innerHTML = '';
        
        // 添加'全部'筛选器
        const allFilter = document.createElement('div');
        allFilter.className = 'filter-chip active';
        allFilter.setAttribute('data-region', 'all');
        allFilter.innerHTML = `<span>全部 (${countriesData.length})</span>`;
        
        // 添加点击事件
        allFilter.addEventListener('click', handleRegionFilter);
        
        // 添加触摸事件（移动设备优化）
        allFilter.addEventListener('touchstart', function() {
            this.classList.add('active');
        }, { passive: true });
        
        allFilter.addEventListener('touchend', function() {
            this.classList.remove('active');
        }, { passive: true });
        
        filterContainer.appendChild(allFilter);
        
        // 为每个大洲创建筛选器
        continents.forEach(continent => {
            const filterChip = document.createElement('div');
            filterChip.className = 'filter-chip';
            filterChip.setAttribute('data-region', continent);
            
            filterChip.innerHTML = `<span>${continent} (${continentCounts[continent]})</span>`;
            
            // 添加点击事件
            filterChip.addEventListener('click', handleRegionFilter);
            
            // 添加触摸事件（移动设备优化）
            filterChip.addEventListener('touchstart', function() {
                this.classList.add('active');
            }, { passive: true });
            
            filterChip.addEventListener('touchend', function() {
                this.classList.remove('active');
            }, { passive: true });
            
            filterContainer.appendChild(filterChip);
        });
        
        // 更新filterChips变量
        filterChips = document.querySelectorAll('.filter-chip');
        
        console.log('筛选器更新完成，共创建', filterChips.length, '个筛选器');
    }
    
    // 获取大洲的中文名称
    function getChineseContinentName(continent) {
        const continentMap = {
            'africa': '非洲',
            'americas': '美洲',
            'asia': '亚洲',
            'europe': '欧洲',
            'oceania': '大洋洲',
            'australia-oceania': '大洋洲',
            'central-america-n-caribbean': '中美洲 & 加勒比',
            'central-asia': '中亚 & 东亚',
            'middle-east': '中东',
            'north-america': '北美洲',
            'south-america': '南美洲'
        };
        
        return continentMap[continent] || continent;
    }
    
    // 初始化函数
    async function init() {
        console.log('DEBUG: init function called');
        
        try {
            // 检测是否为移动设备
            const isMobile = isMobileDevice();
            console.log('DEBUG: isMobile:', isMobile);
            
            // 移动设备优化：添加加载状态提示
            if (isMobile) {
                console.log('DEBUG: Setting up mobile loading indicator');
                // 确保加载指示器在移动设备上可见
                loadingIndicator.style.display = 'flex';
                loadingIndicator.style.position = 'fixed';
                loadingIndicator.style.top = '0';
                loadingIndicator.style.left = '0';
                loadingIndicator.style.width = '100%';
                loadingIndicator.style.height = '100%';
                loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                loadingIndicator.style.zIndex = '1000';
                
                // 优化加载指示器内容
                const loadingContent = loadingIndicator.querySelector('.loading-content');
                if (loadingContent) {
                    loadingContent.style.padding = '20px';
                    loadingContent.style.textAlign = 'center';
                    
                    const loadingText = loadingContent.querySelector('p');
                    if (loadingText) {
                        loadingText.style.fontSize = '16px';
                        loadingText.style.marginTop = '15px';
                        loadingText.style.color = '#333';
                    }
                }
            }
            
            // 加载国家数据
            console.log('DEBUG: Loading countries data');
            await loadCountriesData();
            console.log('DEBUG: Countries data loaded, countriesData length:', window.countriesData ? window.countriesData.length : 'undefined');
            
            // 从countriesData中提取所有大洲信息并更新筛选器
            console.log('DEBUG: Updating region filters from data');
            await updateRegionFiltersFromData();
            
            // 加载并填充统计数据下拉列表
            console.log('DEBUG: Populating stats dropdown');
            await populateStatsDropdown();
            
            // 设置事件监听器
            console.log('DEBUG: Setting up event listeners');
            setupEventListeners();
            
            // 初始化国家ID映射系统
            console.log('DEBUG: Initializing country ID mapping system');
            createCountryIdMapping();
            console.log('DEBUG: Country ID mapping system initialized');
            
            // 移动设备优化：移除了欢迎提示
            if (isMobile) {
                // 延迟显示欢迎提示，确保页面已完全加载
                // setTimeout(() => {
                //     showNotification('欢迎探索世界各国地理信息！左右滑动可切换标签。', 3000);
                // }, 500);
            }
            
            // 默认选择'全部'地区
            console.log('DEBUG: Setting default filter to "all"');
            const allFilter = document.querySelector('.filter-chip[data-region="all"]');
            if (allFilter) {
                console.log('DEBUG: Found "all" filter, clicking it');
                // 移动设备优化：添加触摸反馈动画
                if (isMobile) {
                    allFilter.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        allFilter.style.transform = '';
                        allFilter.click(); // 触发点击事件
                    }, 150);
                } else {
                    allFilter.click(); // 触发点击事件
                }
            } else {
                console.error('DEBUG: Could not find "all" filter');
            }
            
            console.log('DEBUG: init function completed successfully');
        } catch (error) {
            console.error('DEBUG: Error in init function:', error);
        }
    }

    // 移动设备优化：添加页面可见性变化监听
    if (isMobile) {
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                // 页面重新可见时，刷新数据
                console.log('页面重新可见，刷新数据');
                // 可以在这里添加数据刷新逻辑
            }
        });
    }

    // 从本地JSON文件加载国家数据
    async function loadCountriesData() {
        try {
            // 检测是否为移动设备
            const isMobile = isMobileDevice();
            
            // 显示加载指示器
            loadingIndicator.style.display = 'flex';
            countriesGrid.style.display = 'none';
            
            // 移动设备优化：添加加载进度提示
            if (isMobile) {
                // 创建或更新加载进度提示
                let loadingProgress = document.getElementById('loading-progress');
                if (!loadingProgress) {
                    loadingProgress = document.createElement('div');
                    loadingProgress.id = 'loading-progress';
                    loadingProgress.style.width = '80%';
                    loadingProgress.style.height = '4px';
                    loadingProgress.style.backgroundColor = '#e0e0e0';
                    loadingProgress.style.borderRadius = '2px';
                    loadingProgress.style.marginTop = '15px';
                    loadingProgress.style.overflow = 'hidden';
                    
                    const progressBar = document.createElement('div');
                    progressBar.className = 'progress-bar';
                    progressBar.style.width = '0%';
                    progressBar.style.height = '100%';
                    progressBar.style.backgroundColor = '#4285f4';
                    progressBar.style.transition = 'width 0.3s ease';
                    
                    loadingProgress.appendChild(progressBar);
                    
                    const loadingContent = loadingIndicator.querySelector('.loading-content');
                    if (loadingContent) {
                        loadingContent.appendChild(loadingProgress);
                    }
                }
                
                // 模拟加载进度
                const progressBar = loadingProgress.querySelector('.progress-bar');
                if (progressBar) {
                    progressBar.style.width = '20%';
                    
                    setTimeout(() => {
                        progressBar.style.width = '50%';
                    }, 300);
                    
                    setTimeout(() => {
                        progressBar.style.width = '80%';
                    }, 600);
                }
            }
            
            // 首先尝试从本地缓存加载数据
            const cachedData = loadCachedData();
            if (cachedData) {
                countriesData = cachedData;
                console.log('使用本地缓存数据');
                
                // 移动设备优化：更新加载进度
                if (isMobile) {
                    const progressBar = document.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.style.width = '100%';
                    }
                }
            } else {
                // 从本地JSON文件加载数据
                try {
                    // 移动设备优化：显示正在从本地文件加载数据的提示
                    if (isMobile) {
                        const loadingText = loadingIndicator.querySelector('p');
                        if (loadingText) {
                            loadingText.textContent = '正在从本地文件加载数据...';
                        }
                    }
                    
                    countriesData = await loadCountriesFromJSON();
                    console.log('使用本地JSON文件数据');
                } catch (error) {
                    console.error('无法从本地JSON文件加载数据:', error);
                    
                    // 移动设备优化：显示错误信息
                    if (isMobile) {
                        const loadingText = loadingIndicator.querySelector('p');
                        if (loadingText) {
                            loadingText.textContent = '加载数据失败，请稍后再试';
                        }
                    }
                    
                    // 数据加载失败，显示错误
                    throw new Error('无法加载国家数据，请检查文件是否存在或稍后再试');
                }
                
                // 缓存数据
                cacheData(countriesData);
                
                // 移动设备优化：更新加载进度
                if (isMobile) {
                    const progressBar = document.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.style.width = '100%';
                    }
                }
            }
            
            // 移动设备优化：添加加载完成动画
            if (isMobile) {
                // 延迟隐藏加载指示器，让用户看到加载完成
                setTimeout(() => {
                    loadingIndicator.style.opacity = '0';
                    loadingIndicator.style.transition = 'opacity 0.3s ease';
                    
                    setTimeout(() => {
                        // 隐藏加载指示器，显示国家网格
                        loadingIndicator.style.display = 'none';
                        loadingIndicator.style.opacity = '1';
                        countriesGrid.style.display = 'grid';
                        
                        // 添加网格显示动画
                        countriesGrid.style.opacity = '0';
                        countriesGrid.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            countriesGrid.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                            countriesGrid.style.opacity = '1';
                            countriesGrid.style.transform = 'translateY(0)';
                        }, 50);
                    }, 300);
                }, 500);
            } else {
                // 隐藏加载指示器，显示国家网格
                loadingIndicator.style.display = 'none';
                countriesGrid.style.display = 'grid';
            }
        } catch (error) {
            console.error('加载国家数据失败:', error);
            throw error;
        }
    }

    // 从本地JSON文件加载国家数据
    async function loadCountriesFromJSON() {
        try {
            const response = await fetch('../../assets/data/geography/country_basic.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // 转换数据格式以适应现有代码结构
            return data.map(country => {
                // 使用Flag svg字段显示国旗，如果有问题则使用占位符
    let flagSvg = country["Flag svg"];
    console.log('Processing flag for country:', country["国家名称"], 'flagSvg type:', typeof flagSvg, 'flagSvg length:', flagSvg ? flagSvg.length : 0);
    
    if (!flagSvg || typeof flagSvg !== 'string' || !flagSvg.trim().startsWith('<svg')) {
        console.log('Using placeholder flag for:', country["国家名称"]);
        flagSvg = `<i class="fas fa-flag country-flag-placeholder"></i>`;
    } else {
        // 使用Blob URL来安全地渲染SVG，并确保4:3的宽高比
        try {
            // 修改SVG的viewBox以确保4:3的宽高比
            let processedSvg = flagSvg;
            
            // 检查SVG是否已有viewBox
            const viewBoxMatch = processedSvg.match(/viewBox="([^"]*)"/);
            if (!viewBoxMatch) {
                // 如果没有viewBox，尝试从width/height属性提取
                const widthMatch = processedSvg.match(/width="([^"]*)"/);
                const heightMatch = processedSvg.match(/height="([^"]*)"/);
                
                if (widthMatch && heightMatch) {
                    const width = parseFloat(widthMatch[1]);
                    const height = parseFloat(heightMatch[1]);
                    
                    // 计算保持4:3比例的viewBox
                    if (width / height > 4/3) {
                        // SVG比4:3更宽，需要裁剪宽度
                        const newWidth = height * 4/3;
                        const xOffset = (width - newWidth) / 2;
                        processedSvg = processedSvg.replace(/<svg/, `<svg viewBox="${xOffset} 0 ${newWidth} ${height}"`);
                    } else {
                        // SVG比4:3更高，需要裁剪高度
                        const newHeight = width * 3/4;
                        const yOffset = (height - newHeight) / 2;
                        processedSvg = processedSvg.replace(/<svg/, `<svg viewBox="0 ${yOffset} ${width} ${newHeight}"`);
                    }
                } else {
                    // 如果没有width/height属性，添加默认的4:3 viewBox
                    processedSvg = processedSvg.replace(/<svg/, '<svg viewBox="0 0 640 480"');
                }
            } else {
                // 如果已有viewBox，检查是否需要调整为4:3比例
                const viewBoxParts = viewBoxMatch[1].split(' ');
                if (viewBoxParts.length >= 4) {
                    const x = parseFloat(viewBoxParts[0]);
                    const y = parseFloat(viewBoxParts[1]);
                    const width = parseFloat(viewBoxParts[2]);
                    const height = parseFloat(viewBoxParts[3]);
                    
                    // 计算保持4:3比例的新viewBox
                    if (width / height > 4/3) {
                        // SVG比4:3更宽，需要裁剪宽度
                        const newWidth = height * 4/3;
                        const xOffset = x + (width - newWidth) / 2;
                        const newViewBox = `${xOffset} ${y} ${newWidth} ${height}`;
                        processedSvg = processedSvg.replace(/viewBox="[^"]*"/, `viewBox="${newViewBox}"`);
                    } else {
                        // SVG比4:3更高，需要裁剪高度
                        const newHeight = width * 3/4;
                        const yOffset = y + (height - newHeight) / 2;
                        const newViewBox = `${x} ${yOffset} ${width} ${newHeight}`;
                        processedSvg = processedSvg.replace(/viewBox="[^"]*"/, `viewBox="${newViewBox}"`);
                    }
                }
            }
            
            const blob = new Blob([processedSvg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            flagSvg = `<img src="${url}" alt="Flag" class="flag-svg-img" style="aspect-ratio: 4/3;" />`;
            console.log('Created blob URL for flag of:', country["国家名称"]);
        } catch (error) {
            console.error('Error creating blob URL for SVG:', error);
            flagSvg = `<i class="fas fa-flag country-flag-placeholder"></i>`;
        }
    }
                
                return {
                    code: country["Country code"],
                    fipsCode: country["Country code"],
                    alpha2Code: country["Country code"],
                    name: country["Country name"],
                    chineseName: country["国家名称"],
                    continent: country["Continent"],
                    chineseContinent: country["洲"],
                    flagSvg: flagSvg,
                    factbookFilePath: country["File Path"],
                    // 为了兼容现有代码，添加一些默认值
                    capital: '未知',
                    population: '未知',
                    area: '未知'
                };
            });
        } catch (error) {
            console.error('从本地JSON文件加载国家数据失败:', error);
            throw error;
        }
    }
    
    // 填充统计数据下拉列表
    async function populateStatsDropdown() {
        try {
            // 定义需要显示的统计字段及其中文名称
            const statsFields = [
                { key: 'population', name: '人口' },
                { key: 'surface_area', name: '面积' },
                { key: 'pop_density', name: '人口密度' },
                { key: 'urban_population', name: '城市人口' },
                { key: 'urban_population_growth', name: '城市人口增长率' },
                { key: 'pop_growth', name: '人口增长率' },
                { key: 'life_expectancy_male', name: '男性预期寿命' },
                { key: 'life_expectancy_female', name: '女性预期寿命' },
                { key: 'fertility', name: '生育率' },
                { key: 'infant_mortality', name: '婴儿死亡率' },
                { key: 'gdp', name: 'GDP' },
                { key: 'gdp_per_capita', name: '人均GDP' },
                { key: 'gdp_growth', name: 'GDP增长率' },
                { key: 'unemployment', name: '失业率' },
                { key: 'employment_agriculture', name: '农业就业率' },
                { key: 'employment_industry', name: '工业就业率' },
                { key: 'employment_services', name: '服务业就业率' },
                { key: 'imports', name: '进口额' },
                { key: 'exports', name: '出口额' },
                { key: 'tourists', name: '游客数量' },
                { key: 'internet_users', name: '互联网用户' },
                { key: 'co2_emissions', name: '二氧化碳排放量' },
                { key: 'forested_area', name: '森林面积' }
            ];
            
            // 清空下拉列表
            statsDropdown.innerHTML = '<option value="">请选择</option>';
            
            // 添加统计字段选项
            statsFields.forEach(field => {
                const option = document.createElement('option');
                option.value = field.key;
                option.textContent = field.name;
                statsDropdown.appendChild(option);
            });
            
            // 添加下拉列表变化事件监听器
            statsDropdown.addEventListener('change', handleStatsDropdownChange);
            
        } catch (error) {
            console.error('填充统计数据下拉列表失败:', error);
        }
    }
    
    // 处理统计数据下拉列表变化
    function handleStatsDropdownChange() {
        const selectedStat = statsDropdown.value;
        if (selectedStat) {
            // 更新地图显示以反映所选统计数据
            updateMapForStat(selectedStat);
        }
    }
    
    // 根据选定的统计数据更新地图
    function updateMapForStat(statKey) {
        if (!countriesData || countriesData.length === 0) return;
        
        // 首先尝试从country_stats.json加载统计数据
        fetch('/assets/data/geography/country_stats.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(statsData => {
                // 获取所有国家该统计数据的值
                const statValues = statsData
                    .map(country => country[statKey])
                    .filter(value => value !== null && value !== undefined && !isNaN(value));
                
                if (statValues.length === 0) return;
                
                // 计算最小值和最大值
                const minValue = Math.min(...statValues);
                const maxValue = Math.max(...statValues);
                
                // 创建一个ISO2代码到统计数据的映射
                const statsMap = {};
                statsData.forEach(country => {
                    if (country.iso2 && country[statKey] !== null && country[statKey] !== undefined && !isNaN(country[statKey])) {
                        statsMap[country.iso2] = country[statKey];
                    }
                });
                
                // 首先将所有国家路径设置为浅灰色（无数据状态）
                document.querySelectorAll('.country-path').forEach(path => {
                    path.style.fill = '#e0e0e0'; // 浅灰色表示无数据
                    // 清除之前的统计值和键
                    path.removeAttribute('data-stat-value');
                    path.removeAttribute('data-stat-key');
                });
                
                // 为有数据的国家分配颜色（基于统计值）
                statsData.forEach(country => {
                    const value = country[statKey];
                    if (value !== null && value !== undefined && !isNaN(value) && country.iso2) {
                        // 归一化值到0-1范围
                        const normalizedValue = (value - minValue) / (maxValue - minValue);
                        
                        // 使用与图例相同的颜色方案
                        const color = getColorForValue(normalizedValue);
                        
                        // 直接使用Country code而不是通过getWorldMapId转换
                        const countryId = country.iso2;
                        
                        // 更新国家颜色 - 尝试多种选择器
                        let countryPath = document.querySelector(`path[data-country="${country.iso2}"]`);
                        if (!countryPath) {
                            countryPath = document.querySelector(`path[data-country-id="${country.iso2}"]`);
                        }
                        if (!countryPath && countryId) {
                            countryPath = document.querySelector(`path[data-country-id="${countryId}"]`);
                        }
                        
                        if (countryPath) {
                            countryPath.style.fill = color;
                            countryPath.setAttribute('data-stat-value', value);
                            
                            // 存储统计值以便在工具提示中使用
                            countryPath.setAttribute('data-stat-key', statKey);
                        }
                    }
                });
                
                // 更新图例
                updateMapLegend(statKey, minValue, maxValue);
            })
            .catch(error => {
                console.error('加载统计数据失败:', error);
                // 显示错误通知
                showNotification('无法加载统计数据，请稍后再试', 3000);
            });
    }
    
    // 格式化统计值显示
    function formatStatValue(value, statKey) {
        if (value === null || value === undefined || isNaN(value)) return '无数据';
        
        // 返回保留一位小数的数值，不添加任何单位
        return parseFloat(value).toFixed(1);
    }
    
    // 更新地图图例
    function updateMapLegend(statKey, minValue, maxValue) {
        const legend = document.getElementById('map-legend');
        if (!legend) return;
        
        const statName = statsDropdown.options[statsDropdown.selectedIndex].text;
        
        // 创建图例HTML
        let legendHTML = `<div class="legend-title">${statName}</div>`;
        legendHTML += '<div class="legend-scale">';
        
        // 创建连续颜色渐变 - 增加颜色梯度数量以提供更平滑的过渡
        const gradientSteps = 50; // 从20增加到50以获得更平滑的颜色过渡
        
        // 添加渐变色条
        legendHTML += '<div class="gradient-bar-container">';
        legendHTML += '<div class="gradient-bar" id="gradient-bar"></div>';
        legendHTML += '</div>';
        
        // 添加刻度值
        legendHTML += '<div class="legend-ticks">';
        
        // 动态确定刻度位置和数量
        const tickCount = Math.min(5, Math.max(3, Math.floor((maxValue - minValue) / getOptimalTickInterval(minValue, maxValue))));
        const tickPositions = [];
        
        for (let i = 0; i <= tickCount; i++) {
            tickPositions.push(i / tickCount);
        }
        
        tickPositions.forEach(position => {
            const value = minValue + position * (maxValue - minValue);
            const formattedValue = formatStatValue(value, statKey);
            
            legendHTML += `
                <div class="legend-tick" style="left: ${position * 100}%">
                    <div class="tick-line"></div>
                    <div class="tick-label">${formattedValue}</div>
                </div>
            `;
        });
        
        legendHTML += '</div>';
        legendHTML += '</div>';
        
        // 更新图例内容
        legend.innerHTML = legendHTML;
        legend.style.display = 'block';
        
        // 创建CSS渐变
        createGradientBar(minValue, maxValue, statKey);
    }
    
    // 创建渐变色条的CSS渐变
    function createGradientBar(minValue, maxValue, statKey) {
        const gradientBar = document.getElementById('gradient-bar');
        if (!gradientBar) return;
        
        // 创建渐变色标 - 增加梯度数量以获得更平滑的过渡
        const gradientSteps = 50; // 从20增加到50以获得更平滑的颜色过渡
        let gradientStops = [];
        
        for (let i = 0; i < gradientSteps; i++) {
            const normalizedValue = i / (gradientSteps - 1);
            const color = getColorForValue(normalizedValue);
            gradientStops.push(`${color} ${normalizedValue * 100}%`);
        }
        
        // 应用CSS渐变
        gradientBar.style.background = `linear-gradient(to right, ${gradientStops.join(', ')})`;
    }
    
    // 根据归一化值获取颜色
    function getColorForValue(normalizedValue) {
        // 使用更丰富的颜色方案，提供更好的视觉区分
        // 采用多色渐变：从浅黄到橙到红到紫到深蓝
        let hue, saturation, lightness;
        
        if (normalizedValue < 0.2) {
            // 从浅黄到橙 (0-0.2)
            const adjustedValue = normalizedValue / 0.2;
            hue = 60 - adjustedValue * 15; // 从60(黄)到45(橙)
            saturation = 70 + adjustedValue * 30; // 从70%到100%
            lightness = 80 - adjustedValue * 20; // 从80%到60%
        } else if (normalizedValue < 0.4) {
            // 从橙到红 (0.2-0.4)
            const adjustedValue = (normalizedValue - 0.2) / 0.2;
            hue = 45 - adjustedValue * 45; // 从45(橙)到0(红)
            saturation = 100;
            lightness = 60 - adjustedValue * 15; // 从60%到45%
        } else if (normalizedValue < 0.6) {
            // 从红到紫 (0.4-0.6)
            const adjustedValue = (normalizedValue - 0.4) / 0.2;
            hue = 360 - adjustedValue * 120; // 从0(红)到240(紫)
            saturation = 100;
            lightness = 45 - adjustedValue * 10; // 从45%到35%
        } else if (normalizedValue < 0.8) {
            // 从紫到深蓝 (0.6-0.8)
            const adjustedValue = (normalizedValue - 0.6) / 0.2;
            hue = 240 - adjustedValue * 40; // 从240(紫)到200(深蓝)
            saturation = 100;
            lightness = 35 - adjustedValue * 10; // 从35%到25%
        } else {
            // 从深蓝到更深蓝 (0.8-1.0)
            const adjustedValue = (normalizedValue - 0.8) / 0.2;
            hue = 200 - adjustedValue * 20; // 从200(深蓝)到180(更深蓝)
            saturation = 100;
            lightness = 25 - adjustedValue * 10; // 从25%到15%
        }
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    // 计算最优刻度间隔
    function getOptimalTickInterval(minValue, maxValue) {
        const range = maxValue - minValue;
        const roughStep = range / 4;
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
        const normalizedStep = roughStep / magnitude;
        
        let step;
        if (normalizedStep <= 1) {
            step = 1;
        } else if (normalizedStep <= 2) {
            step = 2;
        } else if (normalizedStep <= 5) {
            step = 5;
        } else {
            step = 10;
        }
        
        return step * magnitude;
    }

    // 从REST Countries API加载国家数据
    async function loadCountriesFromRestAPI() {
        try {
            console.log('尝试从REST Countries API加载国家数据...');
            
            // 尝试使用v2版本的API，它更稳定
            // 添加必需的fields参数
            const response = await fetch('https://restcountries.com/v2/all?fields=name,alpha2Code,region,translations,flag,capital,population,area');
            
            console.log('API响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API响应错误内容:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('成功获取到国家数据，数量:', data.length);
            
            // 转换数据格式以适应现有代码结构
            return data.map(country => {
                // 获取中文名称（如果没有则使用英文名称）
                let chineseName = country.name;
                
                // 获取中文名称（如果有）
                if (country.translations && country.translations.zh) {
                    chineseName = country.translations.zh;
                }
                
                // 获取大陆名称（如果有）
                let chineseContinent = getChineseContinentName(country.region);
                
                // 获取国旗SVG
                let flagSvg = null;
                if (country.flag) {
                    // 使用国旗图片URL而不是SVG，因为REST Countries API只提供图片URL
                    // 添加aspect-ratio: 4/3确保4:3的宽高比
                    flagSvg = `<img src="${country.flag}" alt="${country.name} flag" style="width: 100%; height: 100%; object-fit: contain; aspect-ratio: 4/3;">`;
                }
                
                // 获取首都
                let capital = '未知';
                if (country.capital) {
                    capital = country.capital;
                }
                
                // 获取人口
                let population = '未知';
                if (country.population) {
                    population = country.population.toLocaleString();
                }
                
                // 获取面积
                let area = '未知';
                if (country.area) {
                    area = country.area.toLocaleString() + ' km²';
                }
                
                return {
                    code: country.alpha2Code,
                    fipsCode: country.alpha2Code,
                    alpha2Code: country.alpha2Code,
                    name: country.name,
                    chineseName: chineseName,
                    continent: country.region,
                    chineseContinent: chineseContinent,
                    flagSvg: flagSvg,
                    factbookFilePath: null,
                    capital: capital,
                    population: population,
                    area: area
                };
            });
        } catch (error) {
            console.error('从REST Countries API加载国家数据失败:', error);
            throw error;
        }
    }
    
    // 获取大陆中文名称
    function getChineseContinentName(continent) {
        const continentMap = {
            'Africa': '非洲',
            'Americas': '美洲',
            'Asia': '亚洲',
            'Europe': '欧洲',
            'Oceania': '大洋洲',
            'Antarctic': '南极洲'
        };
        
        return continentMap[continent] || continent;
    }



    // 设置事件监听器
    function setupEventListeners() {
        // 检测是否为移动设备
        const isMobile = isMobileDevice();
        
        // 搜索输入
        searchInput.addEventListener('input', handleSearch);
        
        // 移动设备优化：搜索输入失去焦点时隐藏键盘
        searchInput.addEventListener('blur', function() {
            // 在移动设备上，延迟隐藏键盘以确保输入完成
            if (isMobile) {
                setTimeout(() => {
                    document.activeElement.blur();
                }, 300);
            }
        });
        
        // 移动设备优化：添加搜索框清除按钮
        if (isMobile) {
            const searchContainer = searchInput.parentElement;
            const clearButton = document.createElement('button');
            clearButton.type = 'button';
            clearButton.className = 'search-clear';
            clearButton.innerHTML = '&times;';
            clearButton.style.position = 'absolute';
            clearButton.style.right = '10px';
            clearButton.style.top = '50%';
            clearButton.style.transform = 'translateY(-50%)';
            clearButton.style.background = 'none';
            clearButton.style.border = 'none';
            clearButton.style.fontSize = '20px';
            clearButton.style.color = '#999';
            clearButton.style.cursor = 'pointer';
            clearButton.style.display = 'none';
            clearButton.style.padding = '0';
            clearButton.style.width = '24px';
            clearButton.style.height = '24px';
            clearButton.style.lineHeight = '1';
            clearButton.style.borderRadius = '50%';
            clearButton.style.display = 'flex';
            clearButton.style.alignItems = 'center';
            clearButton.style.justifyContent = 'center';
            
            // 添加触摸反馈
            clearButton.addEventListener('touchstart', function() {
                this.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            }, { passive: true });
            
            clearButton.addEventListener('touchend', function() {
                this.style.backgroundColor = 'transparent';
            }, { passive: true });
            
            // 添加点击事件
            clearButton.addEventListener('click', function() {
                searchInput.value = '';
                handleSearch();
                this.style.display = 'none';
            });
            
            // 监听输入框变化，显示/隐藏清除按钮
            searchInput.addEventListener('input', function() {
                clearButton.style.display = this.value ? 'flex' : 'none';
            });
            
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(clearButton);
        }

        // 地区筛选
        filterChips.forEach(chip => {
            // 点击事件
            chip.addEventListener('click', handleRegionFilter);
            
            // 移动设备优化：触摸事件
            if (isMobile) {
                chip.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.95)';
                }, { passive: true });
                
                chip.addEventListener('touchend', function() {
                    this.style.transform = '';
                }, { passive: true });
            } else {
                chip.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                }, { passive: true });
                
                chip.addEventListener('touchend', function() {
                    this.classList.remove('touch-active');
                }, { passive: true });
            }
        });

        // 视图切换
        viewButtons.forEach(button => {
            // 点击事件
            button.addEventListener('click', handleViewToggle);
            
            // 移动设备优化：触摸事件
            if (isMobile) {
                button.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.95)';
                }, { passive: true });
                
                button.addEventListener('touchend', function() {
                    this.style.transform = '';
                }, { passive: true });
            } else {
                button.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                }, { passive: true });
                
                button.addEventListener('touchend', function() {
                    this.classList.remove('touch-active');
                }, { passive: true });
            }
        });

        // 模态框关闭
        modalClose.addEventListener('click', closeModal);
        
        // 移动设备优化：模态框关闭按钮触摸事件
        if (isMobile) {
            modalClose.style.width = '40px';
            modalClose.style.height = '40px';
            modalClose.style.display = 'flex';
            modalClose.style.alignItems = 'center';
            modalClose.style.justifyContent = 'center';
            modalClose.style.borderRadius = '50%';
            
            modalClose.addEventListener('touchstart', function() {
                this.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            }, { passive: true });
            
            modalClose.addEventListener('touchend', function() {
                this.style.backgroundColor = 'transparent';
            }, { passive: true });
        } else {
            modalClose.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            modalClose.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
        }
        
        // 点击模态框背景关闭
        countryModal.addEventListener('click', function(e) {
            if (e.target === countryModal) {
                closeModal();
            }
        });

        // 移动设备优化：触摸滑动关闭模态框
        let touchStartY = 0;
        let touchEndY = 0;
        let touchStartX = 0;
        let touchEndX = 0;
        
        countryModal.addEventListener('touchstart', function(e) {
            touchStartY = e.changedTouches[0].screenY;
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        countryModal.addEventListener('touchend', function(e) {
            touchEndY = e.changedTouches[0].screenY;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture(touchStartY, touchEndY, touchStartX, touchEndX);
        }, { passive: true });

        // ESC键关闭模态框
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && countryModal.classList.contains('active')) {
                closeModal();
            }
        });
        
        // 移动设备优化：防止双击缩放
        if (isMobile) {
            document.addEventListener('touchstart', function(e) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        // 移动设备优化：屏幕方向变化时重新布局
        if (isMobile) {
            window.addEventListener('orientationchange', function() {
                setTimeout(() => {
                    // 重新计算布局
                    if (countryModal.classList.contains('active')) {
                        // 如果模态框打开，调整其位置
                        adjustModalForOrientation();
                    }
                }, 300);
            });
            
            // 移动设备优化：窗口大小变化时重新布局
            window.addEventListener('resize', debounce(function() {
                // 重新计算布局
                if (countryModal.classList.contains('active')) {
                    adjustModalForOrientation();
                }
            }, 250));
        }
    }

    // 处理搜索 - 使用映射系统处理不同ID格式
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filterAndDisplayCountries(searchTerm);
        
        // 如果地图视图可见，更新地图视图
        if (mapView.style.display !== 'none') {
            // 使用映射系统查找匹配的国家
            const matchedCountries = [];
            
            // 遍历所有国家映射
            for (const [countryId, countryInfo] of Object.entries(countryIdMapping)) {
                // 检查国家名称、中文名称、代码是否匹配搜索词
                if (countryInfo.name && countryInfo.name.toLowerCase().includes(searchTerm) ||
                    countryInfo.chineseName && countryInfo.chineseName.toLowerCase().includes(searchTerm) ||
                    countryId.toLowerCase().includes(searchTerm) ||
                    (countryInfo.alpha2Code && countryInfo.alpha2Code.toLowerCase().includes(searchTerm)) ||
                    (countryInfo.fipsCode && countryInfo.fipsCode.toLowerCase().includes(searchTerm))) {
                    matchedCountries.push(countryId);
                }
            }
            
            // 如果映射系统中没有找到，尝试在原始数据中查找
            if (matchedCountries.length === 0 && window.countriesData) {
                for (const country of window.countriesData) {
                    // 检查国家名称、中文名称、代码是否匹配搜索词
                    if (country.name && country.name.toLowerCase().includes(searchTerm) ||
                        country.chineseName && country.chineseName.toLowerCase().includes(searchTerm) ||
                        (country.code && country.code.toLowerCase().includes(searchTerm)) ||
                        (country.alpha2Code && country.alpha2Code.toLowerCase().includes(searchTerm)) ||
                        (country.fipsCode && country.fipsCode.toLowerCase().includes(searchTerm))) {
                        // 直接使用Country code而不是通过getMainCountryId转换
                        const mainId = country.code;
                        if (mainId && !matchedCountries.includes(mainId)) {
                            matchedCountries.push(mainId);
                        }
                    }
                }
            }
            
            // 高亮匹配的国家
            highlightCountries(matchedCountries);
        }
    }

    // 处理地区筛选 - 使用映射系统处理不同ID格式
    function handleRegionFilter(e) {
        console.log('DEBUG: handleRegionFilter called with event:', e);
        
        const chip = e.currentTarget;
        const region = chip.getAttribute('data-region');
        
        console.log('DEBUG: Selected region:', region);

        // 更新活动状态
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        // 更新当前地区
        currentRegion = region;
        console.log('DEBUG: currentRegion set to:', currentRegion);

        // 重新筛选和显示国家
        filterAndDisplayCountries();
        
        // 检查地图视图是否可见
        console.log('DEBUG: mapView.style.display:', mapView.style.display);
        
        // 如果地图视图可见，更新地图视图
        if (mapView.style.display !== 'none') {
            console.log('DEBUG: Map view is visible, proceeding with country highlighting');
            
            // 确保国家ID映射已创建
            console.log('DEBUG: Creating country ID mapping');
            const mapping = createCountryIdMapping();
            console.log('DEBUG: Created mapping with', Object.keys(mapping).length, 'countries');
            
            // 使用映射系统查找匹配地区的国家
            const matchedCountries = [];
            
            // 遍历所有国家映射
            console.log('DEBUG: Searching for countries in mapping');
            for (const [countryId, countryInfo] of Object.entries(mapping)) {
                // 检查国家是否属于选定的地区
                if (region === 'all' || countryInfo.chineseContinent === region) {
                    console.log(`DEBUG: Found matching country: ${countryId}, continent: ${countryInfo.chineseContinent}`);
                    matchedCountries.push(countryId);
                }
            }
            
            console.log(`DEBUG: Found ${matchedCountries.length} countries in mapping for region: ${region}`);
            
            // 如果映射系统中没有找到，尝试在原始数据中查找
            if (matchedCountries.length === 0 && window.countriesData) {
                console.log('DEBUG: No countries found in mapping, searching in original data');
                
                for (const country of window.countriesData) {
                    // 检查国家是否属于选定的地区
                    if (region === 'all' || country.chineseContinent === region) {
                        // 直接使用Country code而不是通过getMainCountryId转换
                        const mainId = country.code;
                        console.log(`DEBUG: Found country in original data: ${country.name}, mainId: ${mainId}`);
                        
                        if (mainId && !matchedCountries.includes(mainId)) {
                            matchedCountries.push(mainId);
                        }
                    }
                }
                
                console.log(`DEBUG: Found ${matchedCountries.length} countries in original data for region: ${region}`);
            }
            
            // 如果没有找到匹配的国家，尝试使用更宽松的匹配条件
            if (matchedCountries.length === 0 && region !== 'all') {
                console.warn(`DEBUG: No countries found for ${region}, trying relaxed matching`);
                
                // 尝试匹配部分名称
                for (const country of countriesData) {
                    if (country.chineseContinent && country.chineseContinent.includes(region)) {
                        // 直接使用Country code而不是通过getMainCountryId转换
                        const mainId = country.code;
                        console.log(`DEBUG: Found country with relaxed matching: ${country.name}, mainId: ${mainId}`);
                        
                        if (mainId && !matchedCountries.includes(mainId)) {
                            matchedCountries.push(mainId);
                        }
                    }
                }
                
                console.log(`DEBUG: Found ${matchedCountries.length} countries with relaxed matching for region: ${region}`);
            }
            
            // 如果仍然没有找到匹配的国家，尝试使用英文名称匹配
            if (matchedCountries.length === 0 && region !== 'all') {
                console.warn(`DEBUG: Still no countries found for ${region}, trying English name matching`);
                
                // 英文大洲名称映射
                const continentNameMap = {
                    '欧洲': 'europe',
                    '亚洲': 'asia',
                    '非洲': 'africa',
                    '美洲': 'americas',
                    '大洋洲': 'oceania',
                    '北美洲': 'north-america',
                    '南美洲': 'south-america'
                };
                
                const englishRegion = continentNameMap[region];
                if (englishRegion) {
                    for (const country of countriesData) {
                        if (country.continent && country.continent.toLowerCase() === englishRegion) {
                            // 直接使用Country code而不是通过getMainCountryId转换
                            const mainId = country.code;
                            console.log(`DEBUG: Found country with English name matching: ${country.name}, mainId: ${mainId}`);
                            
                            if (mainId && !matchedCountries.includes(mainId)) {
                                matchedCountries.push(mainId);
                            }
                        }
                    }
                }
                
                console.log(`DEBUG: Found ${matchedCountries.length} countries with English name matching for region: ${region}`);
            }
            
            console.log(`DEBUG: Total matched countries for ${region}: ${matchedCountries.length}`);
            console.log('DEBUG: Matched country IDs:', matchedCountries);
            
            // 高亮匹配的国家
            console.log('DEBUG: Calling highlightCountries with matched countries');
            
            // 确保所有国家ID都是字符串类型
            const stringCountryIds = matchedCountries.map(id => {
                if (typeof id !== 'string') {
                    console.warn('DEBUG: Converting non-string country ID to string:', id);
                    return String(id);
                }
                return id;
            });
            
            console.log('DEBUG: Final country IDs for highlighting:', stringCountryIds);
            highlightCountries(stringCountryIds);
        } else {
            console.log('DEBUG: Map view is not visible, skipping country highlighting');
        }
        
        // 移动设备优化：添加触觉反馈
        if (isMobileDevice() && 'vibrate' in navigator) {
            // 使用try-catch来避免因用户交互限制导致的错误
            try {
                navigator.vibrate(5);
            } catch (error) {
                console.debug('Vibration not allowed:', error);
            }
        }
    }

    // 处理视图切换
    function handleViewToggle(e) {
        const button = e.currentTarget;
        const view = button.getAttribute('data-view');

        // 更新活动状态
        viewButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        // 切换视图
        if (view === 'cards') {
            cardsView.style.display = 'block';
            mapView.style.display = 'none';
        } else {
            cardsView.style.display = 'none';
            mapView.style.display = 'block';
            // 显示地图视图
            displayMapView();
        }

        currentView = view;
    }

    // 筛选和显示国家
    function filterAndDisplayCountries(searchTerm = '') {
        // 筛选国家
        filteredCountries = countriesData.filter(country => {
            // 地区筛选 - 使用chineseContinent字段而不是continent字段
            if (currentRegion && currentRegion !== 'all' && country.chineseContinent !== currentRegion) {
                return false;
            }

            // 搜索筛选 - 同时搜索中英文名称和国家代码
            if (searchTerm) {
                const lowerSearchTerm = searchTerm.toLowerCase();
                const nameMatch = country.name && country.name.toLowerCase().includes(lowerSearchTerm);
                const chineseNameMatch = country.chineseName && country.chineseName.toLowerCase().includes(lowerSearchTerm);
                const fipsCodeMatch = country.fipsCode && country.fipsCode.toLowerCase().includes(lowerSearchTerm);
                const alpha2CodeMatch = country.alpha2Code && country.alpha2Code.toLowerCase().includes(lowerSearchTerm);
                
                if (!nameMatch && !chineseNameMatch && !fipsCodeMatch && !alpha2CodeMatch) {
                    return false;
                }
            }

            return true;
        });

        // 显示国家
        displayCountries(filteredCountries);
        
        // 如果地图视图可见，更新地图视图
        if (mapView.style.display !== 'none') {
            displayMapView();
        }
        
        // 移动设备优化：添加触觉反馈
        if (isMobileDevice() && 'vibrate' in navigator) {
            // 使用try-catch来避免因用户交互限制导致的错误
            try {
                navigator.vibrate(5);
            } catch (error) {
                console.debug('Vibration not allowed:', error);
            }
        }
    }

    // 显示国家卡片
    function displayCountries(countries) {
        // 清空网格
        countriesGrid.innerHTML = '';

        // 如果没有国家，显示提示信息
        if (countries.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            
            // 检测是否为移动设备
            const isMobile = isMobileDevice();
            
            if (isMobile) {
                noResults.style.textAlign = 'center';
                noResults.style.padding = '40px 20px';
                noResults.style.color = '#666';
                
                const icon = document.createElement('i');
                icon.className = 'fas fa-search';
                icon.style.fontSize = '48px';
                icon.style.marginBottom = '20px';
                icon.style.color = '#ccc';
                
                const message = document.createElement('p');
                message.textContent = '没有找到匹配的国家';
                message.style.fontSize = '18px';
                message.style.margin = '0';
                
                noResults.appendChild(icon);
                noResults.appendChild(message);
            } else {
                noResults.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>没有找到匹配的国家</p>
                `;
            }
            
            countriesGrid.appendChild(noResults);
            return;
        }

        // 创建国家卡片
        countries.forEach(country => {
            const card = createCountryCard(country);
            countriesGrid.appendChild(card);
        });
        
        // 移动设备优化：调整网格布局
        if (isMobileDevice()) {
            countriesGrid.style.gridTemplateColumns = '1fr';
            countriesGrid.style.gap = '15px';
            countriesGrid.style.padding = '10px';
        }
    }

    // 创建国家卡片
function createCountryCard(country) {
    const card = document.createElement('div');
    card.className = 'country-card';
    card.setAttribute('data-country-code', country.code);

    // 检测是否为移动设备
    const isMobile = isMobileDevice();
    
    // 移动设备优化：调整卡片样式
    if (isMobile) {
        card.style.borderRadius = '12px';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        card.style.transition = 'transform 0.2s, box-shadow 0.2s';
        card.style.marginBottom = '15px';
    }

    // 使用预处理的flagSvg字段显示国旗
    const flagSvg = country.flagSvg;
    console.log('Creating card for:', country.chineseName, 'using pre-processed flagSvg');
    
    // 获取中英文名称
    const chineseName = country.chineseName || country.name;
    const englishName = country.name;

    card.innerHTML = `
        <div class="country-info">
            <div class="country-names">
                <div class="country-name-cn">${chineseName}</div>
            </div>
        </div>
        <div class="country-flag">
            ${flagSvg}
        </div>
        <div class="country-info">
            <div class="country-names">
                <div class="country-name-en">${englishName}</div>
            </div>
        </div>
    `;

    // 移动设备优化：添加触摸反馈
    if (isMobile) {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
            this.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.1)';
        }, { passive: true });
        
        card.addEventListener('touchend', function() {
            this.style.transform = '';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }, { passive: true });
    }

    // 添加卡片点击事件 - 显示国家详情
    card.addEventListener('click', function() {
        showCountryDetails(country.code);
    });

    return card;
}

    // 显示国家详情
async function showCountryDetails(countryCode) {
    // 直接使用Country code而不是通过getCountryInfoById转换
    let country = countriesData.find(c => c.code === countryCode);
    
    // 如果映射系统中没有找到，尝试原始方法
    if (!country) {
        country = countriesData.find(c => c.code === countryCode);
        
        if (!country) {
            country = countriesData.find(c => c.alpha2Code === countryCode);
        }
        
        if (!country) {
            country = countriesData.find(c => 
                c.code && countryCode && c.code.toLowerCase() === countryCode.toLowerCase()
            );
        }
        
        if (!country) {
            country = countriesData.find(c => 
                c.alpha2Code && countryCode && c.alpha2Code.toLowerCase() === countryCode.toLowerCase()
            );
        }
    }
    
    if (!country) {
        console.error(`未找到国家代码为 ${countryCode} 的国家数据`);
        return;
    }
    
    // 设置模态框标题
    const countryName = country.chineseName ? `${country.chineseName} (${country.name})` : country.name;
    const continentName = country.chineseContinent || country.continent || 'Unknown';
    modalCountryName.textContent = countryName;
    modalCountryRegion.textContent = continentName;
    
    // 显示模态框
    countryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 显示加载指示器
    modalLoadingIndicator.style.display = 'flex';
    errorMessage.style.display = 'none';
    countryDetails.style.display = 'none';
    
    // 移动设备优化：调整模态框位置和大小
    if (isMobileDevice()) {
        adjustModalForOrientation();
    }
    
    // 移动设备优化：添加触摸滑动关闭功能
    if (isMobileDevice()) {
        setupSwipeToClose(countryModal);
    }
    
    // 从restcountries.com API获取国家详细信息
    try {
        const apiResponse = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country.name)}?fullText=true`);
        
        if (!apiResponse.ok) {
            throw new Error(`API请求失败: ${apiResponse.status}`);
        }
        
        const countryData = await apiResponse.json();
        
        if (!countryData || countryData.length === 0) {
            throw new Error('未找到国家数据');
        }
        
        // 获取第一个国家对象（API返回数组）
        const apiCountry = countryData[0];
        
        // 从Ninjas Country API获取更详细的国家信息
        let ninjasCountryData = null;
        try {
            // 确保使用英文国家名称格式 'Country_Name_Eng' 调用Ninjas API
            console.log('Calling Ninjas API with country name:', country.name);
            const ninjasResponse = await fetch(`/api/ninjas?endpoint=country&name=${encodeURIComponent(country.name)}`);
            
            if (ninjasResponse.ok) {
                const ninjasData = await ninjasResponse.json();
                if (ninjasData && ninjasData.length > 0) {
                    ninjasCountryData = ninjasData[0];
                }
            }
        } catch (error) {
            console.error('获取Ninjas国家数据失败:', error);
            // 不阻止整体流程，仅记录错误
        }
        
        // 从country_stats.json获取统计数据
        let countryStatsData = null;
        try {
            console.log('Loading country stats from country_stats.json for:', country.name);
            const statsResponse = await fetch('/assets/data/geography/country_stats.json');
            
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                // 尝试通过多种方式匹配国家
                countryStatsData = statsData.find(stats => 
                    stats.iso2 === country.alpha2Code || 
                    stats.name.toLowerCase() === country.name.toLowerCase()
                );
                
                if (countryStatsData) {
                    console.log('Found country stats data for:', country.name);
                } else {
                    console.log('No country stats data found for:', country.name);
                }
            }
        } catch (error) {
            console.error('获取country_stats.json数据失败:', error);
            // 不阻止整体流程，仅记录错误
        }
        
        // 构建模态框内容
        let modalContent = `
            <div class="modal-header">
                <div class="modal-header-bg"></div>
                <div class="modal-header-content">
                    <div class="modal-country-flag">
                        ${country.flagSvg || `<i class="fas fa-flag"></i>`}
                    </div>
                    <div class="modal-country-region">${continentName}</div>
                </div>
                <button class="modal-close" id="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="detail-section">
                    <h3 class="detail-title">
                        <i class="fas fa-info-circle"></i>
                        <span>国家概况</span>
                    </h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">中文全称</div>
                            <div class="detail-value">${apiCountry.name.nativeName?.zho?.official || apiCountry.translations?.zho?.official || '未知'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">中文简称</div>
                            <div class="detail-value">${apiCountry.name.nativeName?.zho?.common || apiCountry.translations?.zho?.common || '未知'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">英文全称</div>
                            <div class="detail-value">${apiCountry.name.official || '未知'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">英文简称</div>
                            <div class="detail-value">${apiCountry.name.common || '未知'}</div>
                        </div>
                    </div>
                </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-globe"></i>
                    <span>地理信息</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">大洲</div>
                        <div class="detail-value">${apiCountry.continents?.join(', ') || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">地区</div>
                        <div class="detail-value">${countryStatsData?.region || ninjasCountryData?.region || apiCountry.subregion || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">首都</div>
                        <div class="detail-value">${countryStatsData?.capital || apiCountry.capital?.join(', ') || ninjasCountryData?.capital || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">面积</div>
                        <div class="detail-value">${countryStatsData?.surface_area ? countryStatsData.surface_area.toLocaleString() + ' 平方千米' : (apiCountry.area ? apiCountry.area.toLocaleString() + ' 平方千米' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">人口密度</div>
                        <div class="detail-value">${countryStatsData?.pop_density ? countryStatsData.pop_density + ' 人/平方千米' : (ninjasCountryData?.pop_density ? ninjasCountryData.pop_density + ' 人/平方千米' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">坐标</div>
                        <div class="detail-value">${apiCountry.latlng ? `纬度 ${apiCountry.latlng[0]}°, 经度 ${apiCountry.latlng[1]}°` : '未知'}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-users"></i>
                    <span>人口与社会</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">人口</div>
                        <div class="detail-value">${countryStatsData?.population ? countryStatsData.population.toLocaleString() + ' 千人' : (apiCountry.population ? apiCountry.population.toLocaleString() + ' 千人' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">人口增长率</div>
                        <div class="detail-value">${countryStatsData?.pop_growth ? countryStatsData.pop_growth + '%' : (ninjasCountryData?.pop_growth ? ninjasCountryData.pop_growth + '%' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">城市人口比例</div>
                        <div class="detail-value">${countryStatsData?.urban_population ? countryStatsData.urban_population + '%' : (ninjasCountryData?.urban_population ? ninjasCountryData.urban_population + '%' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">城市人口增长率</div>
                        <div class="detail-value">${countryStatsData?.urban_population_growth ? countryStatsData.urban_population_growth + '%' : (ninjasCountryData?.urban_population_growth ? ninjasCountryData.urban_population_growth + '%' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">性别比例</div>
                        <div class="detail-value">${ninjasCountryData?.sex_ratio ? ninjasCountryData.sex_ratio + ' (男/女)' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">生育率</div>
                        <div class="detail-value">${countryStatsData?.fertility ? countryStatsData.fertility + ' (每名女性)' : (ninjasCountryData?.fertility ? ninjasCountryData.fertility + ' (每名女性)' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">男性预期寿命</div>
                        <div class="detail-value">${countryStatsData?.life_expectancy_male ? countryStatsData.life_expectancy_male + '岁' : (ninjasCountryData?.life_expectancy_male ? ninjasCountryData.life_expectancy_male + '岁' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">女性预期寿命</div>
                        <div class="detail-value">${countryStatsData?.life_expectancy_female ? countryStatsData.life_expectancy_female + '岁' : (ninjasCountryData?.life_expectancy_female ? ninjasCountryData.life_expectancy_female + '岁' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">婴儿死亡率</div>
                        <div class="detail-value">${countryStatsData?.infant_mortality ? countryStatsData.infant_mortality + '‰' : (ninjasCountryData?.infant_mortality ? ninjasCountryData.infant_mortality + '‰' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">凶杀率</div>
                        <div class="detail-value">${ninjasCountryData?.homicide_rate ? ninjasCountryData.homicide_rate + ' (每10万人)' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">难民数量</div>
                        <div class="detail-value">${countryStatsData?.refugees ? countryStatsData.refugees + '千人' : (ninjasCountryData?.refugees ? ninjasCountryData.refugees + '千人' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">游客数量</div>
                        <div class="detail-value">${countryStatsData?.tourists ? countryStatsData.tourists + '千人' : (ninjasCountryData?.tourists ? ninjasCountryData.tourists + '千人' : '未知')}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-coins"></i>
                    <span>经济信息</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">GDP</div>
                        <div class="detail-value">${countryStatsData?.gdp ? '$' + formatNumber(countryStatsData.gdp) + '百万' : (ninjasCountryData?.gdp ? '$' + formatNumber(ninjasCountryData.gdp) + '百万' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">人均GDP</div>
                        <div class="detail-value">${countryStatsData?.gdp_per_capita ? '$' + formatNumber(countryStatsData.gdp_per_capita) : (ninjasCountryData?.gdp_per_capita ? '$' + formatNumber(ninjasCountryData.gdp_per_capita) : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">GDP增长率</div>
                        <div class="detail-value">${countryStatsData?.gdp_growth ? countryStatsData.gdp_growth + '%' : (ninjasCountryData?.gdp_growth ? ninjasCountryData.gdp_growth + '%' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">失业率</div>
                        <div class="detail-value">${countryStatsData?.unemployment ? countryStatsData.unemployment + '%' : (ninjasCountryData?.unemployment ? ninjasCountryData.unemployment + '%' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">农业就业比例</div>
                        <div class="detail-value">${countryStatsData?.employment_agriculture ? countryStatsData.employment_agriculture + '%' : (ninjasCountryData?.employment_agriculture ? ninjasCountryData.employment_agriculture + '%' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">工业就业比例</div>
                        <div class="detail-value">${countryStatsData?.employment_industry ? countryStatsData.employment_industry + '%' : (ninjasCountryData?.employment_industry ? ninjasCountryData.employment_industry + '%' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">服务业就业比例</div>
                        <div class="detail-value">${countryStatsData?.employment_services ? countryStatsData.employment_services + '%' : (ninjasCountryData?.employment_services ? ninjasCountryData.employment_services + '%' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">进口额</div>
                        <div class="detail-value">${countryStatsData?.imports ? '$' + formatNumber(countryStatsData.imports) + '百万' : (ninjasCountryData?.imports ? '$' + formatNumber(ninjasCountryData.imports) + '百万' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">出口额</div>
                        <div class="detail-value">${countryStatsData?.exports ? '$' + formatNumber(countryStatsData.exports) + '百万' : (ninjasCountryData?.exports ? '$' + formatNumber(ninjasCountryData.exports) + '百万' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">货币</div>
                        <div class="detail-value">${countryStatsData?.currency_name ? `${countryStatsData.currency_name} (${countryStatsData.currency_code})` : (ninjasCountryData?.currency ? `${ninjasCountryData.currency.name} (${ninjasCountryData.currency.code})` : (apiCountry.currencies ? Object.values(apiCountry.currencies).map(currency => `${currency.name} (${currency.symbol})`).join(', ') : '未知'))}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">国际电话代码</div>
                        <div class="detail-value">${countryStatsData?.telephone_country_codes ? countryStatsData.telephone_country_codes : (ninjasCountryData?.telephone_country_codes ? ninjasCountryData.telephone_country_codes.join(', ') : (apiCountry.idd ? `${apiCountry.idd.root}${apiCountry.idd.suffixes?.join('')}` : '未知'))}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-language"></i>
                    <span>语言与文化</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">官方语言</div>
                        <div class="detail-value">${apiCountry.languages ? Object.values(apiCountry.languages).join(', ') : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">民族称谓</div>
                        <div class="detail-value">${apiCountry.demonyms?.eng ? `${apiCountry.demonyms.eng.f}/${apiCountry.demonyms.eng.m}` : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">互联网用户</div>
                        <div class="detail-value">${countryStatsData?.internet_users ? formatNumber(countryStatsData.internet_users) + '人' : (ninjasCountryData?.internet_users ? formatNumber(ninjasCountryData.internet_users) + '人' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">二氧化碳排放</div>
                        <div class="detail-value">${countryStatsData?.co2_emissions ? formatNumber(countryStatsData.co2_emissions) + '千吨' : (ninjasCountryData?.co2_emissions ? formatNumber(ninjasCountryData.co2_emissions) + '千吨' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">森林覆盖率</div>
                        <div class="detail-value">${countryStatsData?.forested_area ? countryStatsData.forested_area + '%' : (ninjasCountryData?.forested_area ? ninjasCountryData.forested_area + '%' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">受威胁物种</div>
                        <div class="detail-value">${countryStatsData?.threatened_species ? countryStatsData.threatened_species + '种' : (ninjasCountryData?.threatened_species ? ninjasCountryData.threatened_species + '种' : '未知')}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-flag"></i>
                    <span>国家标识</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">ISO代码</div>
                        <div class="detail-value">${ninjasCountryData?.iso2 || apiCountry.cca2} / ${apiCountry.cca3} / ${apiCountry.ccn3}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">顶级域名</div>
                        <div class="detail-value">${apiCountry.tld?.join(', ') || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">FIFA代码</div>
                        <div class="detail-value">${apiCountry.fifa || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">IOC代码</div>
                        <div class="detail-value">${apiCountry.cioc || '未知'}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-map-marked-alt"></i>
                    <span>地图链接</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Google地图</div>
                        <div class="detail-value"><a href="${apiCountry.maps?.googleMaps || '#'}" target="_blank" rel="noopener noreferrer">查看地图</a></div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">OpenStreetMap</div>
                        <div class="detail-value"><a href="${apiCountry.maps?.openStreetMaps || '#'}" target="_blank" rel="noopener noreferrer">查看地图</a></div>
                    </div>
                </div>
            </div>
            </div>

        `;
        
        // 更新模态框内容
        countryDetails.innerHTML = modalContent;
        modalLoadingIndicator.style.display = 'none';
        countryDetails.style.display = 'block';
        
    } catch (error) {
        console.error('获取国家详细信息失败:', error);
        
        // 显示错误信息
        errorDetails.textContent = error.message;
        modalLoadingIndicator.style.display = 'none';
        errorMessage.style.display = 'flex';
        
        // 设置重试按钮事件
        retryButton.onclick = function() {
            showCountryDetails(countryCode);
        };
    }
}

    // 设置触摸滑动关闭功能（移动设备优化）
    function setupSwipeToClose(modalElement) {
        if (!modalElement) return;
        
        let touchStartY = 0;
        let touchEndY = 0;
        let touchStartX = 0;
        let touchEndX = 0;
        let modalStartTop = 0;
        
        // 获取模态框内容区域
        const modalContent = modalElement.querySelector('.modal-content');
        if (!modalContent) return;
        
        // 触摸开始事件
        modalContent.addEventListener('touchstart', function(e) {
            touchStartY = e.changedTouches[0].screenY;
            touchStartX = e.changedTouches[0].screenX;
            modalStartTop = parseInt(window.getComputedStyle(modalContent).top) || 0;
        }, { passive: true });
        
        // 触摸移动事件
        modalContent.addEventListener('touchmove', function(e) {
            const touchY = e.changedTouches[0].screenY;
            const touchX = e.changedTouches[0].screenX;
            const deltaY = touchY - touchStartY;
            const deltaX = touchX - touchStartX;
            
            // 只允许向下滑动关闭，且水平移动距离不能太大（防止与水平滑动冲突）
            if (deltaY > 0 && Math.abs(deltaX) < Math.abs(deltaY)) {
                // 限制最大滑动距离
                const maxSlide = window.innerHeight * 0.4;
                const slideDistance = Math.min(deltaY, maxSlide);
                
                // 应用滑动效果
                modalContent.style.transform = `translateY(${slideDistance}px)`;
                modalContent.style.opacity = 1 - (slideDistance / maxSlide);
                
                // 防止页面滚动
                e.preventDefault();
            }
        }, { passive: false });
        
        // 触摸结束事件
        modalContent.addEventListener('touchend', function(e) {
            touchEndY = e.changedTouches[0].screenY;
            touchEndX = e.changedTouches[0].screenX;
            
            const deltaY = touchEndY - touchStartY;
            const deltaX = touchEndX - touchStartX;
            
            // 如果向下滑动距离超过阈值，则关闭模态框
            if (deltaY > 100 && Math.abs(deltaX) < Math.abs(deltaY)) {
                closeModal();
            } else {
                // 重置模态框位置和透明度
                modalContent.style.transform = '';
                modalContent.style.opacity = '';
            }
        }, { passive: true });
    }

    // 关闭模态框
    function closeModal() {
        countryModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // 获取地区图标
    function getRegionIcon(region) {
        const icons = {
            'africa': 'fas fa-globe-africa',
            'americas': 'fas fa-globe-americas',
            'asia': 'fas fa-globe-asia',
            'europe': 'fas fa-globe-europe',
            'oceania': 'fas fa-globe'
        };
        return icons[region] || 'fas fa-globe';
    }

    // 获取地区名称
    function getRegionName(region) {
        const names = {
            'africa': '非洲',
            'americas': '美洲',
            'asia': '亚洲',
            'europe': '欧洲',
            'oceania': '大洋洲'
        };
        return names[region] || region;
    }

    // 格式化数字
    function formatNumber(numStr) {
        // 检查输入是否为字符串，如果不是则转换为字符串
        if (typeof numStr !== 'string') {
            numStr = String(numStr || '');
        }
        
        // 移除逗号并转换为数字
        const num = parseInt(numStr.replace(/,/g, '')) || 0;
        
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + '亿';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + '百万';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + '千';
        }
        
        return numStr;
    }
    
    // 下载国家数据
    async function downloadCountryData(countryCode) {
        try {
            // 显示加载状态
            const downloadButton = document.getElementById(`download-${countryCode}`);
            if (downloadButton) {
                downloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 下载中...';
                downloadButton.disabled = true;
            }
            
            // 从API获取国家数据
            const countryData = await fetchCountryData(countryCode);
            if (!countryData) {
                throw new Error('无法获取国家数据');
            }
            
            // 将数据转换为JSON字符串
            const dataStr = JSON.stringify(countryData, null, 2);
            
            // 创建Blob对象
            const blob = new Blob([dataStr], { type: 'application/json' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${countryData.name}_${countryData.code}_data.json`;
            
            // 触发下载
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // 恢复按钮状态
                if (downloadButton) {
                    downloadButton.innerHTML = '<i class="fas fa-download"></i> 下载数据';
                    downloadButton.disabled = false;
                }
                
                // 显示成功消息
                showNotification(`成功下载 ${countryData.name} 的数据`);
            }, 100);
        } catch (error) {
            console.error('下载数据失败:', error);
            
            // 恢复按钮状态
            const downloadButton = document.getElementById(`download-${countryCode}`);
            if (downloadButton) {
                downloadButton.innerHTML = '<i class="fas fa-download"></i> 下载数据';
                downloadButton.disabled = false;
            }
            
            // 显示错误消息
            showNotification(`下载数据失败: ${error.message}`, 'error');
        }
    }
    
    // 显示通知消息
    function showNotification(message, type = 'success') {
        // 检测是否为移动设备
        const isMobile = isMobileDevice();
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // 根据设备类型设置不同的样式
        if (isMobile) {
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.width = '90%';
            notification.style.maxWidth = '350px';
            notification.style.padding = '15px 20px';
            notification.style.borderRadius = '8px';
            notification.style.fontSize = '16px';
            notification.style.zIndex = '9999';
            notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s, transform 0.3s';
            notification.style.display = 'flex';
            notification.style.alignItems = 'center';
            notification.style.justifyContent = 'space-between';
        } else {
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.width = '300px';
            notification.style.padding = '12px 20px';
            notification.style.borderRadius = '6px';
            notification.style.fontSize = '14px';
            notification.style.zIndex = '9999';
            notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s, transform 0.3s';
            notification.style.display = 'flex';
            notification.style.alignItems = 'center';
            notification.style.justifyContent = 'space-between';
        }
        
        // 根据类型设置不同的背景颜色
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#4CAF50';
                notification.style.color = 'white';
                break;
            case 'error':
                notification.style.backgroundColor = '#F44336';
                notification.style.color = 'white';
                break;
            case 'warning':
                notification.style.backgroundColor = '#FF9800';
                notification.style.color = 'white';
                break;
            default:
                notification.style.backgroundColor = '#2196F3';
                notification.style.color = 'white';
        }
        
        // 创建通知内容
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.flex = '1';
        
        // 添加图标
        const icon = document.createElement('i');
        icon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;
        icon.style.marginRight = '10px';
        icon.style.fontSize = isMobile ? '20px' : '18px';
        
        // 添加消息文本
        const messageText = document.createElement('span');
        messageText.textContent = message;
        messageText.style.flex = '1';
        
        content.appendChild(icon);
        content.appendChild(messageText);
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '&times;';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = 'inherit';
        closeButton.style.fontSize = isMobile ? '20px' : '18px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0';
        closeButton.style.marginLeft = '10px';
        closeButton.style.lineHeight = '1';
        
        // 移动设备优化：增大关闭按钮的触摸区域
        if (isMobile) {
            closeButton.style.padding = '5px';
            closeButton.style.display = 'flex';
            closeButton.style.alignItems = 'center';
            closeButton.style.justifyContent = 'center';
            closeButton.style.width = '30px';
            closeButton.style.height = '30px';
            closeButton.style.borderRadius = '50%';
            
            // 添加触摸反馈
            closeButton.addEventListener('touchstart', function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            });
            
            closeButton.addEventListener('touchend', function() {
                this.style.backgroundColor = 'transparent';
            });
        }
        
        notification.appendChild(content);
        notification.appendChild(closeButton);
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            if (isMobile) {
                notification.style.transform = 'translateX(-50%) translateY(0)';
            } else {
                notification.style.transform = 'translateX(0)';
            }
        }, 10);
        
        // 添加关闭事件
        closeButton.addEventListener('click', () => {
            notification.style.opacity = '0';
            if (isMobile) {
                notification.style.transform = 'translateX(-50%) translateY(-20px)';
            } else {
                notification.style.transform = 'translateX(20px)';
            }
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
        
        // 移动设备优化：添加触摸滑动关闭功能
        if (isMobile) {
            let touchStartX = 0;
            let touchStartY = 0;
            
            notification.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });
            
            notification.addEventListener('touchmove', function(e) {
                const touchX = e.changedTouches[0].screenX;
                const touchY = e.changedTouches[0].screenY;
                const diffX = touchX - touchStartX;
                const diffY = touchY - touchStartY;
                
                // 只允许水平滑动
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    notification.style.transform = `translateX(calc(-50% + ${diffX}px))`;
                    notification.style.opacity = 1 - Math.abs(diffX) / 200;
                }
            }, { passive: true });
            
            notification.addEventListener('touchend', function(e) {
                const touchEndX = e.changedTouches[0].screenX;
                const diffX = touchEndX - touchStartX;
                
                // 如果滑动距离超过阈值，则关闭通知
                if (Math.abs(diffX) > 100) {
                    notification.style.opacity = '0';
                    notification.style.transform = `translateX(calc(-50% + ${diffX > 0 ? 200 : -200}px))`;
                    
                    setTimeout(() => {
                        if (notification.parentNode) {
                            document.body.removeChild(notification);
                        }
                    }, 300);
                } else {
                    // 恢复原位
                    notification.style.transform = 'translateX(-50%)';
                    notification.style.opacity = '1';
                }
            }, { passive: true });
        }
        
        // 自动关闭
        const autoCloseTime = isMobile ? 4000 : 3000; // 移动设备上显示时间稍长
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                if (isMobile) {
                    notification.style.transform = 'translateX(-50%) translateY(-20px)';
                } else {
                    notification.style.transform = 'translateX(20px)';
                }
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, autoCloseTime);
    }

    // 从本地缓存加载数据
    function loadCachedData() {
        try {
            const cachedData = localStorage.getItem('countriesData');
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                // 检查缓存是否过期（设置为7天）
                const cacheTime = localStorage.getItem('countriesDataTime');
                if (cacheTime && (Date.now() - parseInt(cacheTime)) < 7 * 24 * 60 * 60 * 1000) {
                    return parsedData;
                } else {
                    // 缓存过期，清除
                    localStorage.removeItem('countriesData');
                    localStorage.removeItem('countriesDataTime');
                }
            }
            return null;
        } catch (error) {
            console.error('加载缓存数据失败:', error);
            return null;
        }
    }
    
    // 缓存数据
    function cacheData(data) {
        try {
            localStorage.setItem('countriesData', JSON.stringify(data));
            localStorage.setItem('countriesDataTime', Date.now().toString());
        } catch (error) {
            console.error('缓存数据失败:', error);
        }
    }
    
    // 从restcountries API获取特定国家的数据
    async function fetchCountryData(countryCode) {
        try {
            // 首先获取国家名称
            const countryNameResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
            if (!countryNameResponse.ok) {
                throw new Error(`无法获取国家 ${countryCode} 的基本信息`);
            }
            
            const countryInfo = await countryNameResponse.json();
            const countryName = countryInfo[0].name.common;
            
            // 使用国家名称获取详细信息
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
            if (!response.ok) {
                throw new Error(`无法获取国家 ${countryName} 的详细信息`);
            }
            
            const countryData = await response.json();
            return countryData[0];
        } catch (error) {
            console.error(`获取国家 ${countryCode} 数据失败:`, error);
            throw error;
        }
    }
    
    // 获取模拟国家数据

    
    // 创建数据可视化图表
    function createDataVisualization(countryData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 清空容器
        container.innerHTML = '';
        
        // 创建图表容器
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        
        // 检测是否为移动设备
        const isMobile = isMobileDevice();
        
        // 创建人口与面积对比图
        const popAreaChart = document.createElement('div');
        popAreaChart.className = 'chart';
        popAreaChart.innerHTML = `
            <h3>人口与面积对比</h3>
            <div class="chart-bar">
                <div class="bar-label">人口密度</div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${Math.min(100, (countryData.population / countryData.area) * 0.1)}%"></div>
                </div>
                <div class="bar-value">${formatNumber(Math.round(countryData.population / countryData.area))} 人/平方公里</div>
            </div>
        `;
        
        // 创建GDP分布图
        const gdpChart = document.createElement('div');
        gdpChart.className = 'chart';
        gdpChart.innerHTML = `
            <h3>GDP分布</h3>
            <div class="chart-pie ${isMobile ? 'mobile-pie' : ''}">
                <div class="pie-chart" id="gdp-pie-${countryData.code}"></div>
                <div class="pie-legend ${isMobile ? 'mobile-legend' : ''}">
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #4285F4;"></div>
                        <div class="legend-label">第一产业</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #EA4335;"></div>
                        <div class="legend-label">第二产业</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #FBBC05;"></div>
                        <div class="legend-label">第三产业</div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到容器
        chartContainer.appendChild(popAreaChart);
        chartContainer.appendChild(gdpChart);
        container.appendChild(chartContainer);
        
        // 模拟GDP分布数据并绘制饼图
        setTimeout(() => {
            drawPieChart(`gdp-pie-${countryData.code}`, [
                { label: '第一产业', value: countryData.economy?.agriculture || 15, color: '#4285F4' },
                { label: '第二产业', value: countryData.economy?.industry || 35, color: '#EA4335' },
                { label: '第三产业', value: countryData.economy?.services || 50, color: '#FBBC05' }
            ]);
        }, 100);
        
        // 移动设备优化：添加触摸手势支持
        if (isMobile) {
            // 添加水平滑动支持，用于在多个图表间切换
            let touchStartX = 0;
            let touchEndX = 0;
            
            container.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            container.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
            
            function handleSwipe(startX, endX) {
                const threshold = 50; // 滑动阈值
                const diff = startX - endX;
                
                // 左右滑动切换图表
                if (Math.abs(diff) > threshold) {
                    // 可以在这里添加图表切换逻辑
                    // 例如：显示/隐藏不同的图表
                    const charts = container.querySelectorAll('.chart');
                    charts.forEach(chart => {
                        if (diff > 0) {
                            // 向左滑动
                            chart.style.transform = 'translateX(-20px)';
                            chart.style.opacity = '0.8';
                        } else {
                            // 向右滑动
                            chart.style.transform = 'translateX(20px)';
                            chart.style.opacity = '0.8';
                        }
                        
                        // 恢复原始状态
                        setTimeout(() => {
                            chart.style.transform = '';
                            chart.style.opacity = '';
                        }, 300);
                    });
                }
            }
        }
    }
    
    // 绘制饼图
    function drawPieChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;
        
        // 移动设备优化：调整图表大小
        const isMobile = isMobileDevice();
        const svgSize = isMobile ? 150 : 200;
        
        // 创建SVG元素
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', svgSize);
        svg.setAttribute('height', svgSize);
        svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
        
        // 创建饼图扇形
        data.forEach((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            // 转换为弧度
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            // 计算坐标
            const radius = isMobile ? 60 : 80;
            const centerX = svgSize / 2;
            const centerY = svgSize / 2;
            
            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);
            
            // 创建路径
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', item.color);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', '2');
            
            // 移动设备优化：添加触摸反馈
            if (isMobile) {
                path.style.cursor = 'pointer';
                path.style.transition = 'transform 0.2s, opacity 0.2s';
                
                path.addEventListener('touchstart', function() {
                    this.style.opacity = '0.8';
                    this.style.transform = 'scale(1.05)';
                }, { passive: true });
                
                path.addEventListener('touchend', function() {
                    this.style.opacity = '1';
                    this.style.transform = 'scale(1)';
                }, { passive: true });
                
                // 移动设备优化：添加触摸提示
                path.addEventListener('touchstart', function(e) {
                    // 防止默认行为，避免页面滚动
                    e.preventDefault();
                    
                    // 创建或更新提示框
                    let tooltip = document.getElementById('pie-tooltip');
                    if (!tooltip) {
                        tooltip = document.createElement('div');
                        tooltip.id = 'pie-tooltip';
                        tooltip.style.position = 'fixed';
                        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        tooltip.style.color = 'white';
                        tooltip.style.padding = '8px 12px';
                        tooltip.style.borderRadius = '4px';
                        tooltip.style.fontSize = '14px';
                        tooltip.style.zIndex = '1000';
                        tooltip.style.pointerEvents = 'none';
                        document.body.appendChild(tooltip);
                    }
                    
                    // 更新提示框内容
                    tooltip.textContent = `${item.label}: ${item.value}%`;
                    
                    // 计算触摸位置
                    const touch = e.touches[0];
                    tooltip.style.left = `${touch.clientX + 10}px`;
                    tooltip.style.top = `${touch.clientY - 30}px`;
                    tooltip.style.display = 'block';
                }, { passive: false });
                
                path.addEventListener('touchmove', function(e) {
                    // 更新提示框位置
                    const tooltip = document.getElementById('pie-tooltip');
                    if (tooltip) {
                        const touch = e.touches[0];
                        tooltip.style.left = `${touch.clientX + 10}px`;
                        tooltip.style.top = `${touch.clientY - 30}px`;
                    }
                }, { passive: true });
                
                path.addEventListener('touchend', function() {
                    // 隐藏提示框
                    const tooltip = document.getElementById('pie-tooltip');
                    if (tooltip) {
                        tooltip.style.display = 'none';
                    }
                }, { passive: true });
            } else {
                // 桌面设备：添加鼠标悬停效果
                path.style.cursor = 'pointer';
                path.style.transition = 'transform 0.2s, opacity 0.2s';
                
                path.addEventListener('mouseenter', function() {
                    this.style.opacity = '0.8';
                    this.style.transform = 'scale(1.05)';
                });
                
                path.addEventListener('mouseleave', function() {
                    this.style.opacity = '1';
                    this.style.transform = 'scale(1)';
                });
            }
            
            // 添加标题
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${item.label}: ${item.value}%`;
            path.appendChild(title);
            
            svg.appendChild(path);
            currentAngle = endAngle;
        });
        
        container.appendChild(svg);
        
        // 移动设备优化：添加图例点击交互
        if (isMobile) {
            const legendItems = container.parentElement?.querySelectorAll('.legend-item');
            if (legendItems) {
                legendItems.forEach((item, index) => {
                    item.style.cursor = 'pointer';
                    item.addEventListener('click', function() {
                        // 高亮对应的饼图扇形
                        const paths = svg.querySelectorAll('path');
                        if (paths[index]) {
                            // 重置所有路径
                            paths.forEach(p => {
                                p.style.opacity = '0.3';
                            });
                            
                            // 高亮当前路径
                            paths[index].style.opacity = '1';
                            
                            // 2秒后恢复
                            setTimeout(() => {
                                paths.forEach(p => {
                                    p.style.opacity = '1';
                                });
                            }, 2000);
                        }
                    });
                });
            }
        }
    }
    
    // 检测是否为移动设备
    function isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1) || 
               (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ||
               (window.innerWidth <= 768);
    }
    
    // 处理滑动手势
    function handleSwipeGesture(startY, endY, startX, endX) {
        const threshold = 50; // 滑动阈值
        const verticalDiff = startY - endY;
        const horizontalDiff = startX - endX;
        
        // 检查模态框是否处于活动状态
        const modal = document.querySelector('.modal.active');
        if (!modal) return;
        
        // 判断滑动方向
        const isVerticalSwipe = Math.abs(verticalDiff) > Math.abs(horizontalDiff);
        
        if (isVerticalSwipe) {
            // 垂直滑动 - 向上滑动关闭模态框
            if (verticalDiff > threshold) {
                closeModal();
            }
        } else {
            // 水平滑动 - 可以用于切换标签或内容
            if (Math.abs(horizontalDiff) > threshold) {
                // 获取所有标签按钮
                const tabButtons = modal.querySelectorAll('.tab-button');
                if (tabButtons.length === 0) return;
                
                // 找到当前活动标签
                let activeIndex = -1;
                tabButtons.forEach((button, index) => {
                    if (button.classList.contains('active')) {
                        activeIndex = index;
                    }
                });
                
                if (activeIndex === -1) return;
                
                // 根据滑动方向切换标签
                let newIndex;
                if (horizontalDiff > 0) {
                    // 向左滑动，切换到下一个标签
                    newIndex = (activeIndex + 1) % tabButtons.length;
                } else {
                    // 向右滑动，切换到上一个标签
                    newIndex = (activeIndex - 1 + tabButtons.length) % tabButtons.length;
                }
                
                // 触发标签切换
                tabButtons[newIndex].click();
                
                // 添加滑动动画效果
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.transition = 'transform 0.3s ease';
                    
                    if (horizontalDiff > 0) {
                        // 向左滑动
                        modalContent.style.transform = 'translateX(-20px)';
                    } else {
                        // 向右滑动
                        modalContent.style.transform = 'translateX(20px)';
                    }
                    
                    // 恢复原始位置
                    setTimeout(() => {
                        modalContent.style.transform = '';
                    }, 300);
                }
            }
        }
    }
    
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // 调整模态框以适应屏幕方向
    function adjustModalForOrientation() {
        const modalContent = document.querySelector('.modal-content');
        if (!modalContent) return;
        
        // 获取屏幕尺寸和方向
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isPortrait = screenHeight > screenWidth;
        
        // 根据屏幕尺寸调整模态框
        if (screenWidth < 768) {
            // 移动设备
            modalContent.style.width = '95%';
            
            if (isPortrait) {
                // 竖屏模式
                modalContent.style.maxHeight = `${screenHeight * 0.8}px`;
                modalContent.style.top = '10%';
                modalContent.style.marginTop = '0';
            } else {
                // 横屏模式
                modalContent.style.maxHeight = `${screenHeight * 0.9}px`;
                modalContent.style.top = '5%';
                modalContent.style.marginTop = '0';
            }
            
            modalContent.style.overflowY = 'auto';
            modalContent.style.borderRadius = '12px';
            
            // 调整模态框内的内容布局
            const modalHeader = modalContent.querySelector('.modal-header');
            const modalBody = modalContent.querySelector('.modal-body');
            const modalTabs = modalContent.querySelector('.modal-tabs');
            
            if (modalHeader) {
                modalHeader.style.padding = isPortrait ? '15px' : '12px 15px';
            }
            
            if (modalTabs) {
                modalTabs.style.flexWrap = isPortrait ? 'wrap' : 'nowrap';
                modalTabs.style.overflowX = isPortrait ? 'visible' : 'auto';
                
                // 调整标签按钮大小
                const tabButtons = modalTabs.querySelectorAll('.tab-button');
                tabButtons.forEach(button => {
                    button.style.padding = isPortrait ? '8px 12px' : '6px 10px';
                    button.style.fontSize = isPortrait ? '14px' : '12px';
                    button.style.marginRight = isPortrait ? '5px' : '8px';
                    button.style.marginBottom = isPortrait ? '5px' : '0';
                });
            }
            
            if (modalBody) {
                modalBody.style.padding = isPortrait ? '15px' : '12px 15px';
                
                // 调整图表容器大小
                const chartContainers = modalBody.querySelectorAll('.chart-container');
                chartContainers.forEach(container => {
                    container.style.marginBottom = isPortrait ? '20px' : '15px';
                    
                    const charts = container.querySelectorAll('.chart');
                    charts.forEach(chart => {
                        chart.style.marginBottom = isPortrait ? '15px' : '10px';
                    });
                });
                
                // 调整移动设备上的饼图布局
                const mobilePieCharts = modalBody.querySelectorAll('.mobile-pie');
                mobilePieCharts.forEach(chart => {
                    chart.style.flexDirection = isPortrait ? 'column' : 'row';
                    chart.style.alignItems = 'center';
                    
                    const pieChart = chart.querySelector('.pie-chart');
                    const pieLegend = chart.querySelector('.mobile-legend');
                    
                    if (pieChart) {
                        pieChart.style.marginBottom = isPortrait ? '15px' : '0';
                        pieChart.style.marginRight = isPortrait ? '0' : '15px';
                    }
                    
                    if (pieLegend) {
                        pieLegend.style.display = isPortrait ? 'flex' : 'block';
                        pieLegend.style.flexWrap = isPortrait ? 'wrap' : 'nowrap';
                        pieLegend.style.justifyContent = 'center';
                        
                        const legendItems = pieLegend.querySelectorAll('.legend-item');
                        legendItems.forEach(item => {
                            item.style.marginRight = isPortrait ? '10px' : '0';
                            item.style.marginBottom = isPortrait ? '5px' : '8px';
                        });
                    }
                });
            }
            
            // 调整按钮大小和间距
            const actionButtons = modalContent.querySelectorAll('.action-button');
            actionButtons.forEach(button => {
                button.style.padding = isPortrait ? '10px 15px' : '8px 12px';
                button.style.fontSize = isPortrait ? '14px' : '12px';
                button.style.marginTop = isPortrait ? '10px' : '8px';
            });
            
            // 调整关闭按钮位置和大小
            const closeButton = modalContent.querySelector('.close-button');
            if (closeButton) {
                closeButton.style.width = isPortrait ? '36px' : '32px';
                closeButton.style.height = isPortrait ? '36px' : '32px';
                closeButton.style.fontSize = isPortrait ? '20px' : '18px';
            }
        } else {
            // 桌面设备
            modalContent.style.width = '90%';
            modalContent.style.maxWidth = '800px';
            modalContent.style.maxHeight = '80vh';
            modalContent.style.top = '50%';
            modalContent.style.marginTop = modalContent.offsetHeight ? `-${modalContent.offsetHeight / 2}px` : '-200px';
            modalContent.style.borderRadius = '8px';
        }
        
        // 确保模态框在屏幕中央
        if (screenWidth >= 768) {
            modalContent.style.left = '50%';
            modalContent.style.transform = 'translateX(-50%)';
        } else {
            modalContent.style.left = '50%';
            modalContent.style.transform = 'translateX(-50%)';
        }
    }
    
    // 显示错误信息
    function showError(message) {
        // 检测是否为移动设备
        const isMobile = isMobileDevice();
        
        if (isMobile) {
            // 移动设备优化：创建全屏错误提示
            loadingIndicator.style.position = 'fixed';
            loadingIndicator.style.top = '0';
            loadingIndicator.style.left = '0';
            loadingIndicator.style.width = '100%';
            loadingIndicator.style.height = '100%';
            loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            loadingIndicator.style.zIndex = '1000';
            loadingIndicator.style.display = 'flex';
            loadingIndicator.style.flexDirection = 'column';
            loadingIndicator.style.justifyContent = 'center';
            loadingIndicator.style.alignItems = 'center';
            loadingIndicator.style.padding = '20px';
            loadingIndicator.style.boxSizing = 'border-box';
            
            loadingIndicator.innerHTML = `
                <div class="error-message" style="text-align: center; max-width: 80%;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e53e3e; margin-bottom: 20px;"></i>
                    <p style="font-size: 18px; line-height: 1.5; color: #333; margin-bottom: 30px;">${message}</p>
                    <button id="error-retry-btn" style="padding: 12px 24px; background-color: #4285f4; color: white; border: none; border-radius: 24px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">重试</button>
                </div>
            `;
            
            // 添加重试按钮事件
            const retryBtn = document.getElementById('error-retry-btn');
            if (retryBtn) {
                // 添加触摸反馈
                retryBtn.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.95)';
                    this.style.backgroundColor = '#3367d6';
                }, { passive: true });
                
                retryBtn.addEventListener('touchend', function() {
                    this.style.transform = '';
                    this.style.backgroundColor = '#4285f4';
                }, { passive: true });
                
                // 添加点击事件
                retryBtn.addEventListener('click', function() {
                    // 重新初始化应用
                    init();
                });
            }
        } else {
            // 桌面设备：使用原有样式
            loadingIndicator.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
            loadingIndicator.style.display = 'flex';
        }
    }
    
    // 根据地区从factbook.json仓库获取数据
    async function loadFactbookCountriesByRegion(region) {
        try {
            // 显示加载指示器
            loadingIndicator.style.display = 'flex';
            countriesGrid.style.display = 'none';
            
            const countriesData = [];
            
            try {
                // 获取指定大洲下的国家列表
                const countriesResponse = await fetch(`factbook.json/${region}/`);
                if (!countriesResponse.ok) {
                    throw new Error(`无法获取 ${region} 大洲的国家列表`);
                }
                
                // 解析国家列表
                const countriesList = await parseCountryList(countriesResponse);
                
                // 遍历每个国家
                for (const countryFile of countriesList) {
                    try {
                        // 获取国家数据
                        const countryResponse = await fetch(`factbook.json/${region}/${countryFile}`);
                        if (!countryResponse.ok) {
                            console.warn(`无法获取 ${countryFile} 的数据`);
                            continue;
                        }
                        
                        const countryData = await countryResponse.json();
                        
                        // 转换数据格式以匹配应用需求
                        const formattedCountry = formatFactbookCountryData(countryData, region);
                        if (formattedCountry) {
                            formattedCountry.source = 'factbook'; // 标记数据来源
                            countriesData.push(formattedCountry);
                        }
                    } catch (error) {
                        console.warn(`处理 ${countryFile} 时出错:`, error);
                    }
                }
            } catch (error) {
                console.warn(`处理 ${region} 大洲时出错:`, error);
                throw error;
            }
            
            if (countriesData.length === 0) {
                throw new Error(`未能从factbook.json仓库加载 ${region} 大洲的任何国家数据`);
            }
            
            // 更新全局数据
            window.countriesData = countriesData;
            filteredCountries = countriesData;
            
            // 显示国家
            displayCountries(countriesData);
            
            // 隐藏加载指示器，显示国家网格
            loadingIndicator.style.display = 'none';
            countriesGrid.style.display = 'grid';
            
            // 显示通知
            showNotification(`已加载 ${region} 大洲的数据`, 'success');
        } catch (error) {
            console.error(`从factbook.json仓库加载 ${region} 大洲数据失败:`, error);
            showError(`加载 ${region} 大洲数据失败: ${error.message}`);
        }
    }
    
    // 从countries_info.json文件加载国家数据
    async function loadCountriesInfoData() {
        try {
            const response = await fetch('assets/data/geography/countries_info.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const countriesInfo = await response.json();
            
            // 转换数据格式以适配应用
            const formattedCountries = countriesInfo.map(country => {
                return {
                    code: country['Country code'],
                    name: country['Country name'],
                    chineseName: country['国家名称'],
                    continent: country['Continent'],
                    chineseContinent: country['洲'],
                    flagCode: country['Flag code'],
                    flagSvg: country['Flag svg'],
                    filePath: country['File Path'],
                    // 添加基本的国家信息
                    capital: '未知',
                    population: '未知',
                    area: '未知',
                    // 添加详细信息占位符
                    details: {
                        geography: {},
                        government: {},
                        economy: {}
                    }
                };
            });
            
            return formattedCountries;
        } catch (error) {
            console.error('加载countries_info.json数据失败:', error);
            throw error;
        }
    }
    
    // 从factbook.json文件加载国家详细信息
    async function loadCountryDetailsFromFactbook(filePath) {
        try {
            // 构建factbook.json文件的URL
            const factbookUrl = `factbook.json/${filePath}`;
            
            // 尝试从本地文件加载
            const response = await fetch(factbookUrl);
            
            if (!response.ok) {
                console.warn(`无法加载 ${factbookUrl}: ${response.status} ${response.statusText}`);
                return null;
            }
            
            // 检查响应内容类型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn(`响应不是JSON格式: ${contentType}`);
                // 尝试解析响应文本，看是否是JSON格式的HTML
                try {
                    const text = await response.text();
                    // 尝试从HTML中提取JSON数据
                    const jsonMatch = text.match(/<pre>([\s\S]*?)<\/pre>/);
                    if (jsonMatch) {
                        const jsonData = JSON.parse(jsonMatch[1]);
                        return formatFactbookData(jsonData);
                    }
                } catch (parseError) {
                    console.warn('无法从HTML响应中解析JSON:', parseError);
                }
                // 返回null，让调用者使用备用数据
                return null;
            }
            
            const data = await response.json();
            return formatFactbookData(data);
        } catch (error) {
            console.error('从factbook.json加载国家详细信息失败:', error);
            // 返回null，让调用者使用备用数据
            return null;
        }
    }
    
    // 格式化factbook数据
    function formatFactbookData(data) {
        return {
            code: data.code || '',
            name: data.name || '',
            chineseName: data.chineseName || '',
            capital: data.capital || '',
            population: data.population || '',
            area: data.area || '',
            gdp: data.gdp || '',
            languages: data.languages || '',
            currency: data.currency || '',
            description: data.introduction || data.description || '',
            geography: {
                location: data.geography?.location || '',
                climate: data.geography?.climate || '',
                terrain: data.geography?.terrain || '',
                naturalResources: data.geography?.naturalResources || '',
                elevation: {
                    highest: data.geography?.elevation?.highest || ''
                }
            },
            people: {
                nationality: data.people?.nationality || '',
                ethnicGroups: data.people?.ethnicGroups || '',
                languages: data.people?.languages || data.languages || '',
                religions: data.people?.religions || ''
            },
            government: {
                type: data.government?.type || '',
                capital: data.government?.capital || data.capital || '',
                independence: data.government?.independence || ''
            },
            economy: {
                gdp: data.economy?.gdp || data.gdp || '',
                agriculture: data.economy?.agriculture || '',
                industry: data.economy?.industry || '',
                services: data.economy?.services || ''
            }
        };
    }

// 从factbook.json仓库获取数据
    async function loadFactbookData() {
        try {
            // 获取大洲列表
            const continents = ['asia', 'europe', 'africa', 'north_america', 'south_america', 'oceania'];
            const countriesData = [];
            
            // 遍历每个大洲
            for (const continent of continents) {
                try {
                    // 获取大洲下的国家列表
                    const countriesResponse = await fetch(`factbook.json/${continent}/`);
                    if (!countriesResponse.ok) {
                        console.warn(`无法获取 ${continent} 大洲的国家列表`);
                        continue;
                    }
                    
                    // 假设服务器返回的是国家文件列表
                    // 实际实现可能需要根据服务器返回的格式进行调整
                    const countriesList = await parseCountryList(countriesResponse);
                    
                    // 遍历每个国家
                    for (const countryFile of countriesList) {
                        try {
                            // 获取国家数据
                            const countryResponse = await fetch(`factbook.json/${continent}/${countryFile}`);
                            if (!countryResponse.ok) {
                                console.warn(`无法获取 ${countryFile} 的数据`);
                                continue;
                            }
                            
                            const countryData = await countryResponse.json();
                            
                            // 转换数据格式以匹配应用需求
                            const formattedCountry = formatFactbookCountryData(countryData, continent);
                            if (formattedCountry) {
                                formattedCountry.source = 'factbook'; // 标记数据来源
                                countriesData.push(formattedCountry);
                            }
                        } catch (error) {
                            console.warn(`处理 ${countryFile} 时出错:`, error);
                        }
                    }
                } catch (error) {
                    console.warn(`处理 ${continent} 大洲时出错:`, error);
                }
            }
            
            if (countriesData.length === 0) {
                throw new Error('未能从factbook.json仓库加载任何国家数据');
            }
            
            return countriesData;
        } catch (error) {
            console.error('从factbook.json仓库加载数据失败:', error);
            throw error;
        }
    }
    
    // 解析国家列表
    async function parseCountryList(response) {
        // 这里需要根据服务器返回的实际格式进行解析
        // 假设返回的是HTML页面，我们需要从中提取JSON文件链接
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 查找所有指向JSON文件的链接
        const links = Array.from(doc.querySelectorAll('a[href$=".json"]'));
        return links.map(link => link.getAttribute('href'));
    }
    
    // 格式化factbook国家数据以匹配应用需求
    function formatFactbookCountryData(factbookData, continent) {
        try {
            // 根据hk.json的格式，将factbook数据转换为应用所需的格式
            return {
                code: factbookData.country?.code || factbookData.name?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
                name: factbookData.country?.name || factbookData.name || 'Unknown',
                region: continent,
                capital: factbookData.country?.capital || factbookData.capital || 'N/A',
                population: factbookData.people?.population?.total || factbookData.population || 0,
                area: factbookData.geography?.area?.total || factbookData.area || 0,
                flag: factbookData.country?.flag || `https://flagcdn.com/w320/${factbookData.country?.code || 'xx'}.png`,
                description: factbookData.introduction?.background || factbookData.description || 'No description available.',
                geography: {
                    location: factbookData.geography?.location || 'N/A',
                    climate: factbookData.geography?.climate || 'N/A',
                    terrain: factbookData.geography?.terrain || 'N/A',
                    elevation: {
                        highest: factbookData.geography?.elevation?.highest?.point || 'N/A',
                        lowest: factbookData.geography?.elevation?.lowest?.point || 'N/A'
                    },
                    naturalResources: factbookData.geography?.natural_resources || 'N/A'
                },
                people: {
                    nationality: factbookData.people?.nationality || 'N/A',
                    ethnicGroups: factbookData.people?.ethnic_groups || 'N/A',
                    languages: factbookData.people?.languages || 'N/A',
                    religions: factbookData.people?.religions || 'N/A',
                    ageStructure: factbookData.people?.age_structure || 'N/A'
                },
                government: {
                    type: factbookData.government?.government_type || factbookData.government?.type || 'N/A',
                    capital: factbookData.government?.capital || factbookData.capital || 'N/A',
                    independence: factbookData.government?.independence || 'N/A'
                },
                economy: {
                    gdp: factbookData.economy?.gdp || 'N/A',
                    agriculture: factbookData.economy?.agriculture || 0,
                    industry: factbookData.economy?.industry || 0,
                    services: factbookData.economy?.services || 0
                }
            };
        } catch (error) {
            console.error('格式化国家数据时出错:', error);
            return null;
        }
    }
    
    // 创建国家ID映射系统，直接使用Country code作为主键
    function createCountryIdMapping() {
        console.log('DEBUG: createCountryIdMapping called');
        
        // 如果映射已存在，直接返回
        if (window.countryIdMapping) {
            console.log('DEBUG: Using existing countryIdMapping with', Object.keys(window.countryIdMapping).length, 'countries');
            return window.countryIdMapping;
        }
        
        console.log('DEBUG: Creating new countryIdMapping');
        const mapping = {};
        
        // 从countriesData创建映射，直接使用Country code作为主键
        if (window.countriesData && window.countriesData.length > 0) {
            console.log('DEBUG: Processing countriesData with', window.countriesData.length, 'countries');
            
            window.countriesData.forEach(country => {
                const countryCode = country.code || country.alpha2Code || country.fipsCode;
                
                console.log(`DEBUG: Processing country: ${country.name}, code: ${countryCode}, chineseContinent: ${country.chineseContinent}`);
                
                // 使用countryCode作为主键
                if (!mapping[countryCode]) {
                    mapping[countryCode] = {
                        mainId: countryCode,
                        iso2: country.alpha2Code || countryCode,
                        flagCode: country.flagCode || countryCode,
                        worldMapId: countryCode, // 默认使用countryCode
                        name: country.name,
                        chineseName: country.chineseName,
                        chineseContinent: country.chineseContinent
                    };
                    
                    console.log(`DEBUG: Created mapping for ${countryCode}:`, mapping[countryCode]);
                }
            });
        } else {
            console.warn('DEBUG: countriesData is empty or not available');
        }
        
        // 从worldMapData补充映射，使用Country code作为主键
        if (window.worldMapData && window.worldMapData.features) {
            console.log('DEBUG: Processing worldMapData with', window.worldMapData.features.length, 'features');
            
            window.worldMapData.features.forEach(feature => {
                const worldMapId = feature.id;
                const countryName = feature.properties.name;
                
                console.log(`DEBUG: Processing worldMap feature: ${countryName}, id: ${worldMapId}`);
                
                // 尝试从countriesData中找到对应的Country code
                let countryCode = null;
                for (const code in mapping) {
                    if (mapping[code].name === countryName || mapping[code].chineseName === countryName) {
                        countryCode = code;
                        break;
                    }
                }
                
                // 如果找到匹配的国家，更新映射
                if (countryCode && mapping[countryCode]) {
                    mapping[countryCode].worldMapId = worldMapId;
                    console.log(`DEBUG: Updated worldMapId for ${countryCode}: ${worldMapId}`);
                    
                    // 同时将worldMapId映射到countryCode
                    if (worldMapId !== countryCode) {
                        mapping[worldMapId] = mapping[countryCode];
                        console.log(`DEBUG: Added worldMapId mapping: ${worldMapId} -> ${countryCode}`);
                    }
                } else {
                    // 如果没有找到匹配的国家，创建新映射条目，使用worldMapId作为主键
                    mapping[worldMapId] = {
                        mainId: worldMapId,
                        iso2: worldMapId,
                        flagCode: worldMapId,
                        worldMapId: worldMapId,
                        name: countryName,
                        chineseName: countryName
                    };
                    
                    console.log(`DEBUG: Created new mapping for worldMap feature: ${worldMapId}`);
                }
            });
        } else {
            console.warn('DEBUG: worldMapData is empty or not available');
        }
        
        // 从countryStatsData补充映射，使用Country code作为主键
        if (window.countryStatsData && window.countryStatsData.length > 0) {
            console.log('DEBUG: Processing countryStatsData with', window.countryStatsData.length, 'countries');
            
            window.countryStatsData.forEach(country => {
                const iso2 = country.iso2;
                const countryName = country.name;
                
                console.log(`DEBUG: Processing countryStats country: ${countryName}, iso2: ${iso2}`);
                
                // 尝试从countriesData中找到对应的Country code
                let countryCode = null;
                for (const code in mapping) {
                    if (mapping[code].name === countryName || mapping[code].chineseName === countryName || 
                        mapping[code].iso2 === iso2) {
                        countryCode = code;
                        break;
                    }
                }
                
                // 如果找到匹配的国家，更新映射
                if (countryCode && mapping[countryCode]) {
                    // 更新统计信息
                    mapping[countryCode].stats = country;
                    console.log(`DEBUG: Updated stats for ${countryCode}`);
                    
                    // 同时将iso2映射到countryCode
                    if (iso2 !== countryCode) {
                        mapping[iso2] = mapping[countryCode];
                        console.log(`DEBUG: Added iso2 mapping: ${iso2} -> ${countryCode}`);
                    }
                } else {
                    // 如果没有找到匹配的国家，创建新映射条目，使用iso2作为主键
                    mapping[iso2] = {
                        mainId: iso2,
                        iso2: iso2,
                        flagCode: iso2,
                        worldMapId: iso2,
                        name: countryName,
                        chineseName: countryName,
                        stats: country
                    };
                    
                    console.log(`DEBUG: Created new mapping for countryStats country: ${iso2}`);
                }
            });
        } else {
            console.warn('DEBUG: countryStatsData is empty or not available');
        }
        
        // 保存映射到全局变量
        window.countryIdMapping = mapping;
        console.log(`DEBUG: Created countryIdMapping with ${Object.keys(mapping).length} total entries`);
        
        return mapping;
    }
    
    // 根据Country code获取国家信息
    function getCountryInfoById(countryId) {
        console.log(`DEBUG: getCountryInfoById called with ${countryId} (type: ${typeof countryId})`);
        
        // 确保countryId是字符串
        const stringCountryId = typeof countryId === 'string' ? countryId : String(countryId);
        console.log(`DEBUG: Using string country ID: ${stringCountryId}`);
        
        const mapping = createCountryIdMapping();
        const result = mapping[stringCountryId] || null;
        
        console.log(`DEBUG: getCountryInfoById result for ${stringCountryId}:`, result ? 'Found' : 'Not found');
        return result;
    }
    
    // 根据任意ID获取Country code
    function getMainCountryId(countryId) {
        console.log(`DEBUG: getMainCountryId called with ${countryId} (type: ${typeof countryId})`);
        
        // 确保countryId是字符串
        const stringCountryId = typeof countryId === 'string' ? countryId : String(countryId);
        console.log(`DEBUG: Using string country ID: ${stringCountryId}`);
        
        const countryInfo = getCountryInfoById(stringCountryId);
        if (countryInfo && countryInfo.mainId) {
            console.log(`DEBUG: Found Country code ${countryInfo.mainId} for ${stringCountryId}`);
            return countryInfo.mainId;
        }
        
        console.log(`DEBUG: No Country code found for ${stringCountryId}, returning original ID`);
        return stringCountryId;
    }
    
    // 根据任意ID获取world_map.json中的ID，但优先使用Country code
    function getWorldMapId(countryId) {
        const countryInfo = getCountryInfoById(countryId);
        // 优先返回Country code，如果没有则返回worldMapId
        return countryInfo ? (countryInfo.mainId || countryInfo.worldMapId) : countryId;
    }
    
    // 根据任意ID获取country_stats.json中的ISO2代码，但优先使用Country code
    function getStatsIso2Code(countryId) {
        const countryInfo = getCountryInfoById(countryId);
        // 优先返回Country code，如果没有则返回iso2
        return countryInfo ? (countryInfo.mainId || countryInfo.iso2) : countryId;
    }
    
    // 根据任意ID获取country_basic.json中的Flag代码，但优先使用Country code
    function getFlagCode(countryId) {
        const countryInfo = getCountryInfoById(countryId);
        // 优先返回Country code，如果没有则返回flagCode
        return countryInfo ? (countryInfo.mainId || countryInfo.flagCode) : countryId;
    }

    // 显示地图视图
    function displayMapView() {
        const mapViewContainer = document.getElementById('map-view');
        if (!mapViewContainer) return;
        
        // 创建国家ID映射
        createCountryIdMapping();
        
        // 保存地图控件（包含stats-dropdown）
        const mapControls = mapViewContainer.querySelector('.map-controls');
        
        // 保存地图图例
        const mapLegend = mapViewContainer.querySelector('#map-legend');
        
        // 清空地图容器，但保留地图控件和图例
        mapViewContainer.innerHTML = '';
        
        // 如果存在地图控件，重新添加到地图容器
        if (mapControls) {
            mapViewContainer.appendChild(mapControls);
        }
        
        // 创建地图视图容器
        const mapContainer = document.createElement('div');
        mapContainer.className = 'map-view-container';
        mapContainer.style.width = '100%';
        mapContainer.style.height = '500px';
        mapContainer.style.backgroundColor = 'var(--geography-light)';
        mapContainer.style.borderRadius = '8px';
        mapContainer.style.overflow = 'hidden';
        mapContainer.style.position = 'relative';
        mapContainer.style.touchAction = 'none'; // 防止默认触摸行为
        mapContainer.style.webkitUserSelect = 'none'; // 防止文本选择
        mapContainer.style.userSelect = 'none'; // 防止文本选择
        mapContainer.style.webkitTouchCallout = 'none'; // 禁用长按菜单
        mapViewContainer.appendChild(mapContainer);
        
        // 如果存在地图图例，重新添加到地图容器
        if (mapLegend) {
            mapViewContainer.appendChild(mapLegend);
        }
        
        // 创建加载指示器
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'map-loading';
        loadingIndicator.innerHTML = '<div class="loading-spinner"></div><p>正在加载地图数据...</p>';
        loadingIndicator.style.position = 'absolute';
        loadingIndicator.style.top = '0';
        loadingIndicator.style.left = '0';
        loadingIndicator.style.width = '100%';
        loadingIndicator.style.height = '100%';
        loadingIndicator.style.display = 'flex';
        loadingIndicator.style.flexDirection = 'column';
        loadingIndicator.style.alignItems = 'center';
        loadingIndicator.style.justifyContent = 'center';
        loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        loadingIndicator.style.zIndex = '10';
        mapContainer.appendChild(loadingIndicator);
        
        // 创建SVG地图元素
        const svgMap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgMap.setAttribute('width', '100%');
        svgMap.setAttribute('height', '100%');
        svgMap.setAttribute('viewBox', '-180 -90 360 180'); // 世界地图的视图框
        svgMap.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgMap.style.backgroundColor = '#e0f2fe';
        svgMap.style.touchAction = 'none'; // 防止默认触摸行为
        svgMap.style.webkitUserSelect = 'none'; // 防止文本选择
        svgMap.style.userSelect = 'none'; // 防止文本选择
        mapContainer.appendChild(svgMap);
        
        // 添加地图样式
        const mapStyle = document.createElement('style');
        mapStyle.textContent = `
            .svg-map-container {
                position: relative;
            }
            
            .map-loading {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: rgba(255, 255, 255, 0.9);
                z-index: 10;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(66, 133, 244, 0.2);
                border-radius: 50%;
                border-top-color: #4285F4;
                animation: spin 1s ease-in-out infinite;
                margin-bottom: 10px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .country-path {
                stroke: #ffffff;
                stroke-width: 0.5;
                transition: fill 0.3s ease;
                cursor: pointer;
            }
            
            .country-path:hover {
                stroke-width: 1;
                filter: brightness(0.9);
            }
            
            .country-tooltip {
                position: absolute;
                background-color: rgba(255, 255, 255, 0.95);
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 10px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                pointer-events: none;
                z-index: 100;
                max-width: 250px;
                font-size: 14px;
                display: none;
            }
            
            .tooltip-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: #1D3557;
            }
            
            .tooltip-info {
                margin: 3px 0;
            }
            
            .tooltip-button {
                margin-top: 8px;
                background-color: #4285F4;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                width: 100%;
            }
            
            /* 移动设备优化 */
            @media (max-width: 768px) {
                .country-path {
                    stroke-width: 1;
                }
                
                .country-tooltip {
                    max-width: 200px;
                    font-size: 12px;
                    padding: 8px;
                }
            }
        `;
        document.head.appendChild(mapStyle);
        
        // 创建工具提示元素
        const tooltip = document.createElement('div');
        tooltip.className = 'country-tooltip';
        mapContainer.appendChild(tooltip);
        
        // 检测是否为移动设备
        const isMobile = isMobileDevice();
        
        // 加载世界地图数据
        loadWorldMapData().then(worldMapData => {
            // 隐藏加载指示器
            loadingIndicator.style.display = 'none';
            
            if (!worldMapData || !worldMapData.features) {
                console.error('无法加载世界地图数据');
                mapContainer.innerHTML = '<div class="map-error"><p>无法加载地图数据，请刷新页面重试。</p></div>';
                return;
            }
            
            // 创建国家颜色映射 - 使用更多颜色确保相邻国家不同色
        const countryColors = [
            '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E44AD', 
            '#E67E22', '#1ABC9C', '#3498DB', '#9B59B6', '#2ECC71',
            '#F1C40F', '#E74C3C', '#95A5A6', '#16A085', '#27AE60',
            '#2980B9', '#8E44AD', '#F39C12', '#D35400', '#C0392B'
        ];
        
        // 重置全局coloredCountries对象
        coloredCountries = {};
        
        // 用于跟踪相邻国家
        const adjacentCountries = {};
        
        // 创建缩放控制
        const zoomControls = document.createElement('div');
        zoomControls.className = 'map-zoom-controls';
        
        // 如果是移动设备，添加移动特定类
        if (isMobile) {
            zoomControls.classList.add('mobile-zoom-controls');
        }
        
        // 添加放大按钮
        const zoomInBtn = document.createElement('button');
        zoomInBtn.innerHTML = '+';
        zoomInBtn.className = 'zoom-btn';
        zoomInBtn.setAttribute('aria-label', '放大地图');
        
        // 添加缩小按钮
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.innerHTML = '-';
        zoomOutBtn.className = 'zoom-btn';
        zoomOutBtn.setAttribute('aria-label', '缩小地图');
        
        // 添加重置按钮
        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = '⟲';
        resetBtn.className = 'reset-btn';
        resetBtn.setAttribute('aria-label', '重置地图视图');
        
        // 添加按钮到控制容器
        zoomControls.appendChild(zoomInBtn);
        zoomControls.appendChild(zoomOutBtn);
        zoomControls.appendChild(resetBtn);
        mapContainer.appendChild(zoomControls);
        
        // 初始缩放和平移参数
        let currentScale = 1;
        let currentTranslateX = 0;
        let currentTranslateY = 0;
        
        // 缩放功能
        zoomInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentScale = Math.min(currentScale * 1.2, 5); // 最大放大5倍
            updateMapTransform();
        });
        
        zoomOutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentScale = Math.max(currentScale / 1.2, 0.5); // 最小缩小到0.5倍
            updateMapTransform();
        });
        
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentScale = 1;
            currentTranslateX = 0;
            currentTranslateY = 0;
            updateMapTransform();
        });
        
        // 添加触摸事件支持到缩放按钮
        zoomInBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('active');
        }, { passive: false });
        
        zoomInBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.classList.remove('active');
            currentScale = Math.min(currentScale * 1.2, 5);
            updateMapTransform();
        }, { passive: false });
        
        zoomOutBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('active');
        }, { passive: false });
        
        zoomOutBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.classList.remove('active');
            currentScale = Math.max(currentScale / 1.2, 0.5);
            updateMapTransform();
        }, { passive: false });
        
        resetBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('active');
        }, { passive: false });
        
        resetBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.classList.remove('active');
            currentScale = 1;
            currentTranslateX = 0;
            currentTranslateY = 0;
            updateMapTransform();
        }, { passive: false });
        
        // 更新地图变换
        function updateMapTransform() {
            svgMap.setAttribute('transform', `translate(${currentTranslateX}, ${currentTranslateY}) scale(${currentScale})`);
        }
        
        // 添加拖拽功能
        let isDragging = false;
        let startX, startY;
        
        mapContainer.addEventListener('mousedown', function(e) {
            if (e.target === svgMap || e.target.parentNode === svgMap) {
                isDragging = true;
                startX = e.clientX - currentTranslateX;
                startY = e.clientY - currentTranslateY;
                mapContainer.style.cursor = 'grabbing';
            }
        });
        
        mapContainer.addEventListener('mousemove', function(e) {
            if (isDragging) {
                currentTranslateX = e.clientX - startX;
                currentTranslateY = e.clientY - startY;
                updateMapTransform();
            }
        });
        
        mapContainer.addEventListener('mouseup', function() {
            isDragging = false;
            mapContainer.style.cursor = 'default';
        });
        
        mapContainer.addEventListener('mouseleave', function() {
            isDragging = false;
            mapContainer.style.cursor = 'default';
        });
        
        // 移动设备触摸支持
        let initialPinchDistance = 0;
        let initialScale = 1;
        let touchStartDistance = 0;
        
        mapContainer.addEventListener('touchstart', function(e) {
            // 阻止默认行为，防止页面滚动和缩放
            e.preventDefault();
            
            if (e.target === svgMap || e.target.parentNode === svgMap) {
                if (e.touches.length === 1) {
                    // 单点触摸 - 拖拽模式
                    isDragging = true;
                    startX = e.touches[0].clientX - currentTranslateX;
                    startY = e.touches[0].clientY - currentTranslateY;
                    mapContainer.style.cursor = 'grabbing';
                } else if (e.touches.length === 2) {
                    // 双点触摸 - 缩放模式
                    isDragging = false;
                    
                    // 计算两点之间的初始距离
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    initialPinchDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    
                    // 保存当前缩放级别
                    initialScale = currentScale;
                    touchStartDistance = initialPinchDistance;
                }
            }
        }, { passive: false });
        
        mapContainer.addEventListener('touchmove', function(e) {
            // 阻止默认行为，防止页面滚动和缩放
            e.preventDefault();
            
            if (e.target === svgMap || e.target.parentNode === svgMap) {
                if (isDragging && e.touches.length === 1) {
                    // 单点触摸移动 - 拖拽地图
                    currentTranslateX = e.touches[0].clientX - startX;
                    currentTranslateY = e.touches[0].clientY - startY;
                    updateMapTransform();
                } else if (e.touches.length === 2) {
                    // 双点触摸移动 - 缩放地图
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    
                    // 计算当前两点之间的距离
                    const currentPinchDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    
                    // 确保距离有效
                    if (currentPinchDistance > 0 && touchStartDistance > 0) {
                        // 计算缩放比例
                        const scaleChange = currentPinchDistance / touchStartDistance;
                        
                        // 应用新的缩放级别，限制在最小和最大值之间
                        currentScale = Math.max(0.5, Math.min(5, initialScale * scaleChange));
                        
                        // 更新地图变换
                        updateMapTransform();
                    }
                }
            }
        }, { passive: false });
        
        mapContainer.addEventListener('touchend', function(e) {
            // 如果触摸点数量减少到1个，切换到拖拽模式
            if (e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX - currentTranslateX;
                startY = e.touches[0].clientY - currentTranslateY;
                mapContainer.style.cursor = 'grabbing';
            } else if (e.touches.length === 0) {
                // 所有触摸点都离开，重置状态
                isDragging = false;
                initialPinchDistance = 0;
                touchStartDistance = 0;
                mapContainer.style.cursor = 'grab';
            }
        }, { passive: false });
        
        // 获取国家相邻关系
        function findAdjacentCountries() {
            // 初始化相邻国家映射
            worldMapData.features.forEach(feature => {
                adjacentCountries[feature.id] = [];
            });
            
            // 检查每对国家是否相邻
            for (let i = 0; i < worldMapData.features.length; i++) {
                const feature1 = worldMapData.features[i];
                const countryId1 = feature1.id;
                
                for (let j = i + 1; j < worldMapData.features.length; j++) {
                    const feature2 = worldMapData.features[j];
                    const countryId2 = feature2.id;
                    
                    // 检查两个国家是否相邻
                    if (areCountriesAdjacent(feature1, feature2)) {
                        adjacentCountries[countryId1].push(countryId2);
                        adjacentCountries[countryId2].push(countryId1);
                    }
                }
            }
        }
        
        // 检查两个国家是否相邻
        function areCountriesAdjacent(feature1, feature2) {
            // 获取两个国家的边界坐标
            const coords1 = getBoundaryCoordinates(feature1.geometry);
            const coords2 = getBoundaryCoordinates(feature2.geometry);
            
            // 如果任一国家没有坐标数据，则认为不相邻
            if (!coords1 || !coords2) return false;
            
            // 检查边界是否有接触点
            for (const coord1 of coords1) {
                for (const coord2 of coords2) {
                    // 如果两个坐标点非常接近，则认为国家相邻
                    const distance = Math.sqrt(
                        Math.pow(coord1[0] - coord2[0], 2) + 
                        Math.pow(coord1[1] - coord2[1], 2)
                    );
                    
                    // 使用较小的阈值来检测相邻关系
                    if (distance < 0.5) {
                        return true;
                    }
                }
            }
            
            return false;
        }
        
        // 获取国家的边界坐标
        function getBoundaryCoordinates(geometry) {
            if (!geometry || !geometry.coordinates) return null;
            
            let boundaryCoords = [];
            
            // 处理多边形
            if (geometry.type === 'Polygon') {
                // 获取外环（第一个环）的坐标
                const outerRing = geometry.coordinates[0];
                boundaryCoords = outerRing;
            } 
            // 处理多多边形
            else if (geometry.type === 'MultiPolygon') {
                // 获取第一个多边形的外环坐标
                const firstPolygon = geometry.coordinates[0];
                if (firstPolygon && firstPolygon[0]) {
                    boundaryCoords = firstPolygon[0];
                }
            }
            
            return boundaryCoords;
        }
        
        // 为国家分配颜色，确保相邻国家不同色
        function assignCountryColors() {
            // 首先找到所有相邻关系
            findAdjacentCountries();
            
            // 按照相邻国家数量从多到少排序，这样可以先处理相邻关系复杂的国家
            const sortedFeatures = [...worldMapData.features].sort((a, b) => {
                return adjacentCountries[b.id].length - adjacentCountries[a.id].length;
            });
            
            // 为每个国家分配颜色
            sortedFeatures.forEach(feature => {
                const countryId = feature.id;
                
                // 获取相邻国家的颜色
                const adjacentColors = adjacentCountries[countryId]
                    .filter(adjId => coloredCountries[adjId])
                    .map(adjId => coloredCountries[adjId]);
                
                // 找到一个未被相邻国家使用的颜色
                let selectedColor;
                
                // 首先尝试从颜色数组中找到未被使用的颜色
                for (const color of countryColors) {
                    if (!adjacentColors.includes(color)) {
                        selectedColor = color;
                        break;
                    }
                }
                
                // 如果所有颜色都被使用了，尝试生成一个与相邻颜色差异较大的颜色
                if (!selectedColor) {
                    selectedColor = generateDistinctColor(adjacentColors);
                }
                
                // 分配颜色
                coloredCountries[countryId] = selectedColor;
            });
        }
        
        // 生成与相邻颜色差异较大的颜色
        function generateDistinctColor(adjacentColors) {
            // 如果没有相邻颜色，返回默认颜色
            if (adjacentColors.length === 0) {
                return countryColors[0];
            }
            
            // 将相邻颜色转换为HSL格式以便比较
            const adjacentHSLColors = adjacentColors.map(color => {
                return hexToHSL(color);
            });
            
            // 尝试不同的色相值，找到与相邻颜色差异最大的
            let bestColor = countryColors[0];
            let maxMinDistance = 0;
            
            for (let hue = 0; hue < 360; hue += 30) {
                const testColor = `hsl(${hue}, 70%, 50%)`;
                const testHSL = { h: hue, s: 70, l: 50 };
                
                // 计算与所有相邻颜色的最小距离
                let minDistance = Infinity;
                for (const adjHSL of adjacentHSLColors) {
                    const distance = colorDistance(testHSL, adjHSL);
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }
                
                // 如果这个最小距离大于当前的最大最小距离，则更新最佳颜色
                if (minDistance > maxMinDistance) {
                    maxMinDistance = minDistance;
                    bestColor = testColor;
                }
            }
            
            // 将HSL颜色转换回十六进制
            return hslToHex(bestColor);
        }
        
        // 计算两个HSL颜色之间的距离
        function colorDistance(color1, color2) {
            // 简化的色相距离计算（不考虑饱和度和亮度）
            let hueDiff = Math.abs(color1.h - color2.h);
            if (hueDiff > 180) {
                hueDiff = 360 - hueDiff;
            }
            return hueDiff;
        }
        
        // 将十六进制颜色转换为HSL
        function hexToHSL(hex) {
            // 转换为RGB
            let r = parseInt(hex.slice(1, 3), 16) / 255;
            let g = parseInt(hex.slice(3, 5), 16) / 255;
            let b = parseInt(hex.slice(5, 7), 16) / 255;
            
            // 转换为HSL
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0; // 灰色
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            
            return { h: h * 360, s: s * 100, l: l * 100 };
        }
        
        // 将HSL颜色转换为十六进制
        function hslToHex(hslString) {
            // 解析HSL字符串
            const matches = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (!matches) return '#000000';
            
            const h = parseInt(matches[1]) / 360;
            const s = parseInt(matches[2]) / 100;
            const l = parseInt(matches[3]) / 100;
            
            // 转换为RGB
            let r, g, b;
            
            if (s === 0) {
                r = g = b = l; // 灰色
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            // 转换为十六进制
            const toHex = x => {
                const hex = Math.round(x * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
        
        // 执行颜色分配
        assignCountryColors();
        
        
            
            // 渲染地图
            worldMapData.features.forEach(feature => {
                const countryId = feature.id;
                const countryName = feature.properties.name;
                
                // 查找国家详细信息 - 使用映射系统处理不同ID格式
                let countryInfo = null;
                if (window.countriesData) {
                    // 直接使用Country code而不是通过getCountryInfoById转换
                    countryInfo = countriesData.find(c => c.code === countryId);
                    
                    // 如果没有找到，尝试使用原始方法
                    if (!countryInfo) {
                        countryInfo = window.countriesData.find(c => c.code === countryId);
                        
                        if (!countryInfo) {
                            countryInfo = window.countriesData.find(c => c.alpha2Code === countryId);
                        }
                        
                        if (!countryInfo) {
                            countryInfo = window.countriesData.find(c => 
                                c.code && countryId && c.code.toLowerCase() === countryId.toLowerCase()
                            );
                        }
                        
                        if (!countryInfo) {
                            countryInfo = window.countriesData.find(c => 
                                c.alpha2Code && countryId && c.alpha2Code.toLowerCase() === countryId.toLowerCase()
                            );
                        }
                    }
                }
                
                // 调试信息
                if (countryId === 'US' || countryId === 'CN' || countryId === 'JP') {
                    console.log(`国家ID: ${countryId}, 找到国家信息:`, countryInfo);
                }
                
                // 确定国家颜色 - 基于大陆筛选器和搜索词
                let fillColor;
                let isHighlighted = false;
                
                // 获取当前搜索词
                const currentSearchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
                
                // 检查是否匹配搜索词
                if (currentSearchTerm && countryInfo) {
                    const nameMatch = countryInfo.name && countryInfo.name.toLowerCase().includes(currentSearchTerm);
                    const chineseNameMatch = countryInfo.chineseName && countryInfo.chineseName.toLowerCase().includes(currentSearchTerm);
                    const fipsCodeMatch = countryInfo.fipsCode && countryInfo.fipsCode.toLowerCase().includes(currentSearchTerm);
                    const alpha2CodeMatch = countryInfo.alpha2Code && countryInfo.alpha2Code.toLowerCase().includes(currentSearchTerm);
                    
                    isHighlighted = nameMatch || chineseNameMatch || fipsCodeMatch || alpha2CodeMatch;
                }
                
                // 检查是否选择了大陆筛选器
                if (currentRegion && currentRegion !== 'all') {
                    // 查找国家详细信息以确定其所属大陆
                    const countryContinent = countryInfo ? countryInfo.chineseContinent : null;
                    
                    if (countryContinent === currentRegion) {
                        // 如果国家属于所选大陆，使用分配的颜色确保相邻国家不同色
                        fillColor = coloredCountries[countryId] || '#cccccc';
                    } else {
                        // 如果国家不属于所选大陆，使用浅灰色
                        fillColor = '#e0e0e0';
                    }
                } else if (isHighlighted) {
                    // 如果没有选择大陆筛选器但匹配搜索词，使用绿色高亮
                    fillColor = '#34A853';
                } else {
                    // 如果没有选择大陆筛选器且不匹配搜索词，所有国家使用蓝色
                    fillColor = '#4285F4';
                }
                
                // 创建路径元素
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', convertGeoJSONToSVGPath(feature.geometry));
                path.setAttribute('fill', fillColor);
                path.setAttribute('class', 'country-path');
                path.setAttribute('data-country-id', countryId);
                path.setAttribute('data-country-name', countryName);
                
                // 添加鼠标事件
                path.addEventListener('mouseenter', function(e) {
                    if (!isMobile) {
                        showCountryTooltip(e, countryId, countryName, countryInfo, tooltip);
                    }
                });
                
                path.addEventListener('mousemove', function(e) {
                    if (!isMobile) {
                        updateTooltipPosition(e, tooltip);
                    }
                });
                
                path.addEventListener('mouseleave', function() {
                    if (!isMobile) {
                        tooltip.style.display = 'none';
                    }
                });
                
                // 添加点击事件
                path.addEventListener('click', function() {
                    // 直接使用Country code而不是通过getMainCountryId转换
                    const countryCode = countryId;
                    // 使用映射后的国家代码显示国家详情
                    showCountryDetails(countryCode);
                });
                
                // 移动设备优化：添加触摸事件
                if (isMobile) {
                    path.addEventListener('touchstart', function(e) {
                        e.preventDefault();
                        this.style.strokeWidth = '2';
                    }, { passive: false });
                    
                    path.addEventListener('touchend', function(e) {
                        e.preventDefault();
                        this.style.strokeWidth = '0.5';
                        
                        // 显示工具提示
                        const touch = e.changedTouches[0];
                        const rect = mapContainer.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        
                        showCountryTooltip({ clientX: touch.clientX, clientY: touch.clientY }, 
                                           countryId, countryName, countryInfo, tooltip);
                        
                        // 3秒后自动隐藏工具提示
                        setTimeout(() => {
                            tooltip.style.display = 'none';
                        }, 3000);
                    }, { passive: false });
                }
                
                // 将路径添加到SVG地图
                svgMap.appendChild(path);
            });
            
            // 图例已移除，按用户要求不再显示
            
        }).catch(error => {
            console.error('加载世界地图数据时出错:', error);
            loadingIndicator.style.display = 'none';
            mapContainer.innerHTML = '<div class="map-error"><p>加载地图数据失败，请刷新页面重试。</p></div>';
        });
    }
    
    // 加载世界地图数据
    function loadWorldMapData() {
        return new Promise((resolve, reject) => {
            // 检查是否已经加载了地图数据
            if (window.worldMapData) {
                resolve(window.worldMapData);
                return;
            }
            
            // 尝试从全局变量获取地图数据
            if (typeof countries_data !== 'undefined' && countries_data) {
                window.worldMapData = countries_data;
                resolve(countries_data);
                return;
            }
            
            // 如果全局变量中没有数据，尝试从文件加载
            fetch('../../assets/data/geography/world_map.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    window.worldMapData = data;
                    resolve(data);
                })
                .catch(error => {
                    console.error('加载世界地图数据时出错:', error);
                    reject(new Error('加载世界地图数据文件失败: ' + error.message));
                });
        });
    }
    
    // 将GeoJSON几何图形转换为SVG路径
    function convertGeoJSONToSVGPath(geometry) {
        if (!geometry || !geometry.coordinates) return '';
        
        let path = '';
        
        // 处理多边形
        if (geometry.type === 'Polygon') {
            path += processPolygon(geometry.coordinates);
        } 
        // 处理多多边形
        else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygon => {
                path += processPolygon(polygon);
            });
        }
        
        return path;
    }
    
    // 处理多边形坐标
    function processPolygon(coordinates) {
        let path = '';
        
        coordinates.forEach((ring, ringIndex) => {
            if (ring.length === 0) return;
            
            // 移动到第一个点
            path += (ringIndex === 0 ? 'M' : 'M') + ring[0][0] + ',' + (-ring[0][1]);
            
            // 绘制线条到其余点
            for (let i = 1; i < ring.length; i++) {
                path += 'L' + ring[i][0] + ',' + (-ring[i][1]);
            }
            
            // 闭合路径
            if (ringIndex === 0) {
                path += 'Z';
            }
        });
        
        return path;
    }
    
    // 显示国家工具提示
    async function showCountryTooltip(event, countryId, countryName, countryInfo, tooltip) {
        if (!tooltip) return;
        
        // 检查是否在统计视图模式
        const statsDropdown = document.getElementById('stats-dropdown');
        const isStatsView = statsDropdown && statsDropdown.value !== '';
        
        // 设置工具提示内容 - 显示来自world_map.json的name和id
        let tooltipContent = `
            <div class="tooltip-title">${countryName}</div>
            <div class="tooltip-info"><strong>国家代码:</strong> ${countryId}</div>
        `;
        
        // 如果在统计视图模式，尝试获取统计数据
        if (isStatsView) {
            try {
                // 获取当前选中的统计指标
                const statKey = statsDropdown.value;
                const statName = statsDropdown.options[statsDropdown.selectedIndex].text;
                
                // 尝试从country_stats.json获取统计数据
                const statsResponse = await fetch('/assets/data/geography/country_stats.json');
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    const countryStat = statsData.find(c => c.iso2 === countryId);
                    
                    if (countryStat && countryStat[statKey] !== null && countryStat[statKey] !== undefined) {
                        const statValue = countryStat[statKey];
                        const formattedValue = formatStatValue(statValue, statKey);
                        
                        // 添加统计信息到工具提示
                        tooltipContent += `
                            <div class="tooltip-info"><strong>${statName}:</strong> ${formattedValue}</div>
                        `;
                    } else {
                        // 显示无数据信息
                        tooltipContent += `
                            <div class="tooltip-info"><strong>${statName}:</strong> 无数据</div>
                        `;
                    }
                }
            } catch (error) {
                console.error('获取统计数据失败:', error);
            }
        }
        
        // 尝试从countriesData中获取更多信息
        const countryData = countriesData.find(c => c.code === countryId);
        if (countryData) {
            // 使用预处理的flagSvg字段显示国旗
            const flagSvg = countryData.flagSvg;
            
            // 获取中英文名称
            const chineseName = countryData.chineseName || countryData.name;
            const englishName = countryData.name;
            
            // 创建卡片样式的工具提示
            tooltipContent = `
                <div class="country-card-tooltip">
                    <div class="country-info">
                        <div class="country-names">
                            <div class="country-name-cn">${chineseName}</div>
                        </div>
                    </div>
                    <div class="country-flag">
                        ${flagSvg}
                    </div>
                    <div class="country-info">
                        <div class="country-names">
                            <div class="country-name-en">${englishName}</div>
                        </div>
                    </div>
                    <div class="country-code">国家代码: ${countryId}</div>
                    ${isStatsView ? `<div class="stat-info" id="tooltip-stat-info-${countryId}"></div>` : ''}
                    <button class="tooltip-button" onclick="showCountryDetails('${countryId}')">查看详情</button>
                </div>
            `;
            
            // 如果在统计视图模式，添加统计信息
            if (isStatsView) {
                try {
                    const statKey = statsDropdown.value;
                    const statName = statsDropdown.options[statsDropdown.selectedIndex].text;
                    
                    // 尝试从country_stats.json获取统计数据
                    const statsResponse = await fetch('/assets/data/geography/country_stats.json');
                    if (statsResponse.ok) {
                        const statsData = await statsResponse.json();
                        const countryStat = statsData.find(c => c.iso2 === countryId);
                        
                        if (countryStat && countryStat[statKey] !== null && countryStat[statKey] !== undefined) {
                            const statValue = countryStat[statKey];
                            const formattedValue = formatStatValue(statValue, statKey);
                            
                            // 更新统计信息
                            const statInfoElement = document.getElementById(`tooltip-stat-info-${countryId}`);
                            if (statInfoElement) {
                                statInfoElement.innerHTML = `<strong>${statName}:</strong> ${formattedValue}`;
                            }
                        } else {
                            // 显示无数据信息
                            const statInfoElement = document.getElementById(`tooltip-stat-info-${countryId}`);
                            if (statInfoElement) {
                                statInfoElement.innerHTML = `<strong>${statName}:</strong> 无数据`;
                            }
                        }
                    }
                } catch (error) {
                    console.error('获取统计数据失败:', error);
                }
            }
        } else if (countryInfo) {
            // 如果无法从countriesData获取数据，则使用原有数据
            tooltipContent += `
                <div class="tooltip-info"><strong>英文名称:</strong> ${countryInfo.name}</div>
                <div class="tooltip-info"><strong>地区:</strong> ${getRegionName(countryInfo.region)}</div>
                <div class="tooltip-info"><strong>首都:</strong> ${countryInfo.capital || '未知'}</div>
                <button class="tooltip-button" onclick="showCountryDetails('${countryInfo.code}')">查看详情</button>
            `;
        } else {
            // 不显示暂无详细信息的文本
        }
        
        tooltip.innerHTML = tooltipContent;
        tooltip.style.display = 'block';
        
        // 更新工具提示位置
        updateTooltipPosition(event, tooltip);
    }
    
    // 更新工具提示位置
    function updateTooltipPosition(event, tooltip) {
        if (!tooltip) return;
        
        const mapContainer = tooltip.parentElement;
        const rect = mapContainer.getBoundingClientRect();
        
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        
        // 确保工具提示不会超出地图容器边界
        const tooltipRect = tooltip.getBoundingClientRect();
        
        if (x + tooltipRect.width > rect.width) {
            x = rect.width - tooltipRect.width - 10;
        }
        
        if (y + tooltipRect.height > rect.height) {
            y = rect.height - tooltipRect.height - 10;
        }
        
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }
    
    // 创建地图图例
    function createMapLegend(mapContainer, regionColors) {
        const legend = document.createElement('div');
        legend.className = 'map-legend';
        legend.style.position = 'absolute';
        legend.style.bottom = '10px';
        legend.style.right = '10px';
        legend.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        legend.style.borderRadius = '6px';
        legend.style.padding = '10px';
        legend.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        legend.style.zIndex = '5';
        
        const legendTitle = document.createElement('div');
        legendTitle.textContent = '地区图例';
        legendTitle.style.fontWeight = 'bold';
        legendTitle.style.marginBottom = '8px';
        legend.appendChild(legendTitle);
        
        // 添加地区图例项
        const regionNames = {
            'africa': '非洲',
            'americas': '美洲',
            'asia': '亚洲',
            'europe': '欧洲',
            'oceania': '大洋洲'
        };
        
        Object.entries(regionColors).forEach(([region, color]) => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.marginBottom = '5px';
            
            const colorBox = document.createElement('div');
            colorBox.style.width = '16px';
            colorBox.style.height = '16px';
            colorBox.style.backgroundColor = color;
            colorBox.style.marginRight = '8px';
            colorBox.style.border = '1px solid #ddd';
            
            const label = document.createElement('span');
            label.textContent = regionNames[region] || region;
            label.style.fontSize = '14px';
            
            item.appendChild(colorBox);
            item.appendChild(label);
            legend.appendChild(item);
        });
        
        mapContainer.appendChild(legend);
    }
});