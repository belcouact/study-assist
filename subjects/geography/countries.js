// 世界各国地理信息探索页面脚本
document.addEventListener('DOMContentLoaded', function() {
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

    // 初始化
    init();

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
        try {
            // 检测是否为移动设备
            const isMobile = isMobileDevice();
            
            // 移动设备优化：添加加载状态提示
            if (isMobile) {
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
            await loadCountriesData();
            
            // 从countriesData中提取所有大洲信息并更新筛选器
            await updateRegionFiltersFromData();
            
            // 设置事件监听器
            setupEventListeners();
            
            // 移动设备优化：移除了欢迎提示
            if (isMobile) {
                // 延迟显示欢迎提示，确保页面已完全加载
                // setTimeout(() => {
                //     showNotification('欢迎探索世界各国地理信息！左右滑动可切换标签。', 3000);
                // }, 500);
            }
            
            // 默认选择'全部'地区
            const allFilter = document.querySelector('.filter-chip[data-region="all"]');
            if (allFilter) {
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
        } catch (error) {
            console.error('初始化失败:', error);
            showError('加载国家数据失败，请稍后再试。');
            
            // 移动设备优化：添加重试按钮
            const isMobile = isMobileDevice();
            if (isMobile) {
                setTimeout(() => {
                    const retryButton = document.createElement('button');
                    retryButton.textContent = '重试';
                    retryButton.style.position = 'fixed';
                    retryButton.style.bottom = '20px';
                    retryButton.style.right = '20px';
                    retryButton.style.padding = '12px 24px';
                    retryButton.style.backgroundColor = '#4285f4';
                    retryButton.style.color = 'white';
                    retryButton.style.border = 'none';
                    retryButton.style.borderRadius = '24px';
                    retryButton.style.fontSize = '16px';
                    retryButton.style.fontWeight = 'bold';
                    retryButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                    retryButton.style.zIndex = '1000';
                    retryButton.style.cursor = 'pointer';
                    
                    // 添加触摸反馈
                    retryButton.addEventListener('touchstart', function() {
                        this.style.transform = 'scale(0.95)';
                    }, { passive: true });
                    
                    retryButton.addEventListener('touchend', function() {
                        this.style.transform = '';
                    }, { passive: true });
                    
                    // 添加点击事件
                    retryButton.addEventListener('click', function() {
                        document.body.removeChild(retryButton);
                        init(); // 重新初始化
                    });
                    
                    document.body.appendChild(retryButton);
                }, 1000);
            }
        }
    }

    // 从Cloudflare D1数据库加载国家数据
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
            
            // 缓存功能已禁用，直接从数据源获取最新数据
            console.log('缓存功能已禁用，正在获取最新数据...');
            
            // 尝试从Cloudflare D1数据库获取数据
            try {
                // 移动设备优化：显示正在从网络加载数据的提示
                if (isMobile) {
                    const loadingText = loadingIndicator.querySelector('p');
                    if (loadingText) {
                        loadingText.textContent = '正在从数据库加载数据...';
                    }
                }
                
                countriesData = await loadCountriesFromDB();
                console.log('使用Cloudflare D1数据库数据');
            } catch (error) {
                console.error('无法从Cloudflare D1数据库加载数据:', error);
                
                // 尝试使用REST Countries API作为备用数据源
                try {
                    // 移动设备优化：显示正在从备用数据源加载数据的提示
                    if (isMobile) {
                        const loadingText = loadingIndicator.querySelector('p');
                        if (loadingText) {
                            loadingText.textContent = '正在从备用数据源加载数据...';
                        }
                    }
                    
                    countriesData = await loadCountriesFromRestAPI();
                    console.log('使用REST Countries API数据');
                } catch (apiError) {
                    console.error('无法从REST Countries API加载数据:', apiError);
                    
                    // 移动设备优化：显示错误信息
                    if (isMobile) {
                        const loadingText = loadingIndicator.querySelector('p');
                        if (loadingText) {
                            loadingText.textContent = '加载数据失败，请稍后再试';
                        }
                    }
                    
                    // 所有数据源都失败，显示错误
                    throw new Error('无法加载国家数据，请检查网络连接或稍后再试');
                }
            }
            
            // 缓存功能已禁用，不再缓存数据
            console.log('缓存功能已禁用，数据未保存到本地存储');
            
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

    // 从Cloudflare D1数据库加载国家数据
    async function loadCountriesFromDB() {
        try {
            const response = await fetch('/api/db/query/country_info');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch country data');
            }
            
            // 转换数据格式以适应现有代码结构
            return data.data.map(country => {
                // 使用Flag_SVG字段显示国旗，如果有问题则使用占位符
                let flagSvg = country.Flag_SVG;
                if (!flagSvg || typeof flagSvg !== 'string' || !flagSvg.trim().startsWith('<svg')) {
                    flagSvg = `<i class="fas fa-flag country-flag-placeholder"></i>`;
                }
                
                return {
                    code: country.Country_Code_Alpha2,
                    fipsCode: country.Country_Code_Fips_10,
                    alpha2Code: country.Country_Code_Alpha2,
                    name: country.Country_Name_Eng,
                    chineseName: country.Country_Name_Chn,
                    continent: country.Continent_Eng,
                    chineseContinent: country.Continent_Chn,
                    flagSvg: flagSvg,
                    factbookFilePath: country.Factbook_File_Path,
                    // 为了兼容现有代码，添加一些默认值
                    capital: '未知',
                    population: '未知',
                    area: '未知'
                };
            });
        } catch (error) {
            console.error('从数据库加载国家数据失败:', error);
            throw error;
        }
    }

    // 从REST Countries API加载国家数据
    async function loadCountriesFromRestAPI() {
        try {
            console.log('尝试从REST Countries API加载国家数据...');
            
            // 尝试使用v2版本的API，它更稳定
            // 添加必需的fields参数
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,alpha2Code,region,translations,flag,capital,population,area');
            
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
                    flagSvg = `<img src="${country.flag}" alt="${country.name} flag" style="width: 100%; height: 100%; object-fit: contain;">`;
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

    // 处理搜索
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filterAndDisplayCountries(searchTerm);
    }

    // 处理地区筛选
    function handleRegionFilter(e) {
        const chip = e.currentTarget;
        const region = chip.getAttribute('data-region');

        // 更新活动状态
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        // 更新当前地区
        currentRegion = region;

        // 重新筛选和显示国家
        filterAndDisplayCountries();
        
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

    // 使用Flag_SVG字段显示国旗，如果有问题则使用占位符
    let flagSvg = country.flagSvg;
    if (!flagSvg || typeof flagSvg !== 'string' || !flagSvg.trim().startsWith('<svg')) {
        flagSvg = `<i class="fas fa-flag country-flag-placeholder"></i>`;
    }
    
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
    // 查找国家数据
    const country = countriesData.find(c => c.code === countryCode);
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
        
        // 构建模态框内容
        let modalContent = `
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
                        <div class="detail-value">${apiCountry.subregion || ninjasCountryData?.region || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">首都</div>
                        <div class="detail-value">${apiCountry.capital?.join(', ') || ninjasCountryData?.capital || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">面积</div>
                        <div class="detail-value">${ninjasCountryData?.surface_area ? ninjasCountryData.surface_area.toLocaleString() + ' 平方千米' : (apiCountry.area ? apiCountry.area.toLocaleString() + ' 平方千米' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">人口密度</div>
                        <div class="detail-value">${ninjasCountryData?.pop_density ? ninjasCountryData.pop_density + ' 人/平方千米' : '未知'}</div>
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
                        <div class="detail-value">${ninjasCountryData?.population ? ninjasCountryData.population.toLocaleString() + ' 千人' : (apiCountry.population ? apiCountry.population.toLocaleString() + ' 千人' : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">人口增长率</div>
                        <div class="detail-value">${ninjasCountryData?.pop_growth ? ninjasCountryData.pop_growth + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">城市人口比例</div>
                        <div class="detail-value">${ninjasCountryData?.urban_population ? ninjasCountryData.urban_population + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">城市人口增长率</div>
                        <div class="detail-value">${ninjasCountryData?.urban_population_growth ? ninjasCountryData.urban_population_growth + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">性别比例</div>
                        <div class="detail-value">${ninjasCountryData?.sex_ratio ? ninjasCountryData.sex_ratio + ' (男/女)' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">生育率</div>
                        <div class="detail-value">${ninjasCountryData?.fertility ? ninjasCountryData.fertility + ' (每名女性)' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">男性预期寿命</div>
                        <div class="detail-value">${ninjasCountryData?.life_expectancy_male ? ninjasCountryData.life_expectancy_male + '岁' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">女性预期寿命</div>
                        <div class="detail-value">${ninjasCountryData?.life_expectancy_female ? ninjasCountryData.life_expectancy_female + '岁' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">婴儿死亡率</div>
                        <div class="detail-value">${ninjasCountryData?.infant_mortality ? ninjasCountryData.infant_mortality + '‰' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">凶杀率</div>
                        <div class="detail-value">${ninjasCountryData?.homicide_rate ? ninjasCountryData.homicide_rate + ' (每10万人)' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">难民数量</div>
                        <div class="detail-value">${ninjasCountryData?.refugees ? ninjasCountryData.refugees + '千人' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">游客数量</div>
                        <div class="detail-value">${ninjasCountryData?.tourists ? ninjasCountryData.tourists + '千人' : '未知'}</div>
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
                        <div class="detail-value">${ninjasCountryData?.gdp ? '$' + formatNumber(ninjasCountryData.gdp) + '百万' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">人均GDP</div>
                        <div class="detail-value">${ninjasCountryData?.gdp_per_capita ? '$' + formatNumber(ninjasCountryData.gdp_per_capita) : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">GDP增长率</div>
                        <div class="detail-value">${ninjasCountryData?.gdp_growth ? ninjasCountryData.gdp_growth + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">失业率</div>
                        <div class="detail-value">${ninjasCountryData?.unemployment ? ninjasCountryData.unemployment + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">农业就业比例</div>
                        <div class="detail-value">${ninjasCountryData?.employment_agriculture ? ninjasCountryData.employment_agriculture + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">工业就业比例</div>
                        <div class="detail-value">${ninjasCountryData?.employment_industry ? ninjasCountryData.employment_industry + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">服务业就业比例</div>
                        <div class="detail-value">${ninjasCountryData?.employment_services ? ninjasCountryData.employment_services + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">进口额</div>
                        <div class="detail-value">${ninjasCountryData?.imports ? '$' + formatNumber(ninjasCountryData.imports) + '百万' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">出口额</div>
                        <div class="detail-value">${ninjasCountryData?.exports ? '$' + formatNumber(ninjasCountryData.exports) + '百万' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">货币</div>
                        <div class="detail-value">${ninjasCountryData?.currency ? `${ninjasCountryData.currency.name} (${ninjasCountryData.currency.code})` : (apiCountry.currencies ? Object.values(apiCountry.currencies).map(currency => `${currency.name} (${currency.symbol})`).join(', ') : '未知')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">国际电话代码</div>
                        <div class="detail-value">${ninjasCountryData?.telephone_country_codes ? ninjasCountryData.telephone_country_codes.join(', ') : (apiCountry.idd ? `${apiCountry.idd.root}${apiCountry.idd.suffixes?.join('')}` : '未知')}</div>
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
                        <div class="detail-label">男性小学入学率</div>
                        <div class="detail-value">${ninjasCountryData?.primary_school_enrollment_male ? ninjasCountryData.primary_school_enrollment_male + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">女性小学入学率</div>
                        <div class="detail-value">${ninjasCountryData?.primary_school_enrollment_female ? ninjasCountryData.primary_school_enrollment_female + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">男性中学入学率</div>
                        <div class="detail-value">${ninjasCountryData?.secondary_school_enrollment_male ? ninjasCountryData.secondary_school_enrollment_male + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">女性中学入学率</div>
                        <div class="detail-value">${ninjasCountryData?.secondary_school_enrollment_female ? ninjasCountryData.secondary_school_enrollment_female + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">男性高等教育入学率</div>
                        <div class="detail-value">${ninjasCountryData?.post_secondary_enrollment_male ? ninjasCountryData.post_secondary_enrollment_male + '%' : '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">女性高等教育入学率</div>
                        <div class="detail-value">${ninjasCountryData?.post_secondary_enrollment_female ? ninjasCountryData.post_secondary_enrollment_female + '%' : '未知'}</div>
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
        // 缓存功能已禁用，始终返回null以确保每次都从API获取最新数据
        console.log("缓存功能已禁用，将始终从API获取最新数据");
        return null;
    }
    
    // 缓存数据
    function cacheData(data) {
        // 缓存功能已禁用，不再保存数据到localStorage
        console.log("缓存功能已禁用，数据不会保存到本地存储");
        return;
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
    
    // 显示地图视图
    function displayMapView() {
        const mapViewContainer = document.getElementById('map-view');
        if (!mapViewContainer) return;
        
        // 清空地图容器
        mapViewContainer.innerHTML = '';
        
        // 创建地图容器
        const mapContainer = document.createElement('div');
        mapContainer.id = 'leaflet-map';
        mapContainer.style.width = '100%';
        mapContainer.style.height = '500px';
        mapContainer.style.borderRadius = '8px';
        mapViewContainer.appendChild(mapContainer);
        
        // 初始化地图 - 居中显示世界地图
        const map = L.map('leaflet-map').setView([20, 0], 2);
        
        // 添加地图图层
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);
        
        // 检测是否为移动设备
        const isMobile = isMobileDevice();
        
        // 添加国家标记
        if (window.countriesData && window.countriesData.length > 0) {
            // 创建自定义图标
            const countryIcon = L.divIcon({
                className: 'country-marker',
                html: '<div style="background-color: #4285F4; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });
            
            // 为每个国家添加标记
            window.countriesData.forEach(country => {
                // 尝试获取国家坐标（如果有的话）
                let lat = country.latitude || 0;
                let lng = country.longitude || 0;
                
                // 如果没有坐标，使用默认坐标（这里可以根据国家名称设置更精确的默认坐标）
                if (lat === 0 && lng === 0) {
                    // 根据地区设置默认坐标
                    switch(country.region) {
                        case 'asia':
                            lat = 30; lng = 100;
                            break;
                        case 'europe':
                            lat = 50; lng = 10;
                            break;
                        case 'africa':
                            lat = 0; lng = 20;
                            break;
                        case 'americas':
                            lat = 20; lng = -80;
                            break;
                        case 'oceania':
                            lat = -25; lng = 140;
                            break;
                        default:
                            lat = 20; lng = 0;
                    }
                }
                
                // 创建标记
                const marker = L.marker([lat, lng], { icon: countryIcon }).addTo(map);
                
                // 创建弹出窗口内容
                const popupContent = `
                    <div style="min-width: 200px;">
                        <h3 style="margin: 0 0 10px 0; color: #1D3557;">${country.chineseName || country.name}</h3>
                        <p style="margin: 0 0 5px 0;"><strong>英文名称:</strong> ${country.name}</p>
                        <p style="margin: 0 0 5px 0;"><strong>地区:</strong> ${getRegionName(country.region)}</p>
                        <p style="margin: 0 0 10px 0;"><strong>首都:</strong> ${country.capital || '未知'}</p>
                        <button id="view-details-${country.code}" style="background-color: #4285F4; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px;">查看详情</button>
                    </div>
                `;
                
                // 绑定弹出窗口
                marker.bindPopup(popupContent);
                
                // 添加弹出窗口打开事件监听器
                marker.on('popupopen', function() {
                    // 为详情按钮添加点击事件
                    const detailsButton = document.getElementById(`view-details-${country.code}`);
                    if (detailsButton) {
                        detailsButton.addEventListener('click', function() {
                            // 关闭弹出窗口
                            marker.closePopup();
                            // 显示国家详情模态框
                            showCountryDetails(country.code);
                        });
                    }
                });
                
                // 移动设备优化：添加触摸反馈
                if (isMobile) {
                    marker.on('click', function() {
                        // 在移动设备上，点击标记时自动打开弹出窗口
                        marker.openPopup();
                    });
                }
            });
        }
        
        // 添加地图控件样式
        const style = document.createElement('style');
        style.textContent = `
            .country-marker {
                background-color: #4285F4;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .leaflet-popup-content-wrapper {
                border-radius: 8px;
                box-shadow: 0 3px 14px rgba(0,0,0,0.2);
            }
            
            .leaflet-popup-content {
                margin: 15px;
            }
            
            /* 移动设备优化 */
            @media (max-width: 768px) {
                .leaflet-popup-content {
                    margin: 10px;
                }
                
                .leaflet-popup-content-wrapper {
                    border-radius: 6px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // 响应式调整地图大小
        function resizeMap() {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
        
        // 监听窗口大小变化
        window.addEventListener('resize', resizeMap);
        
        // 初始调整地图大小
        resizeMap();
    }
});