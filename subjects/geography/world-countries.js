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
    let filterChips = document.querySelectorAll('.filter-chip');
    const viewButtons = document.querySelectorAll('.view-btn');
    const cardsView = document.getElementById('cards-view');
    const mapView = document.getElementById('map-view');

    // 数据存储
    let countriesData = [];
    let filteredCountries = [];
    let currentRegion = '';
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
        
        // 添加"全部"筛选器
        const allFilter = document.createElement('div');
        allFilter.className = 'filter-chip';
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
        
        // 将"全部"筛选器插入到第一个位置
        filterContainer.insertBefore(allFilter, filterContainer.firstChild);
        
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
            
            // 移动设备优化：添加欢迎提示
            if (isMobile) {
                // 延迟显示欢迎提示，确保页面已完全加载
                setTimeout(() => {
                    showNotification('欢迎探索世界各国地理信息！左右滑动可切换标签。', 3000);
                }, 500);
            }
            
            // 默认选择第一个地区
            if (filterChips.length > 0) {
                // 获取第一个筛选器的data-region值
                currentRegion = filterChips[0].getAttribute('data-region');
                
                // 移动设备优化：添加触摸反馈动画
                if (isMobile) {
                    const firstChip = filterChips[0];
                    firstChip.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        firstChip.style.transform = '';
                        filterChips[0].click(); // 触发点击事件
                    }, 150);
                } else {
                    filterChips[0].click(); // 触发点击事件
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
                    console.warn('无法从Cloudflare D1数据库加载数据，使用模拟数据:', error);
                    
                    // 移动设备优化：显示正在使用模拟数据的提示
                    if (isMobile) {
                        const loadingText = loadingIndicator.querySelector('p');
                        if (loadingText) {
                            loadingText.textContent = '正在准备模拟数据...';
                        }
                    }
                    
                    // 从数据库获取数据失败，使用模拟数据
                    countriesData = getMockCountriesData();
                    console.log('使用模拟数据');
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
            return data.data.map(country => ({
                code: country.Country_Code_Alpha2,
                fipsCode: country.Country_Code_Fips_10,
                alpha2Code: country.Country_Code_Alpha2,
                name: country.Country_Name_Eng,
                chineseName: country.Country_Name_Chn,
                continent: country.Continent_Eng,
                chineseContinent: country.Continent_Chn,
                flagSvg: country.Flag_SVG,
                factbookFilePath: country.Factbook_File_Path,
                // 为了兼容现有代码，添加一些默认值
                capital: '未知',
                population: '未知',
                area: '未知'
            }));
        } catch (error) {
            console.error('从数据库加载国家数据失败:', error);
            throw error;
        }
    }

    // 获取模拟国家数据（实际应用中应从API获取）
    function getMockCountriesData() {
        return [
            {
                code: 'ch',
                name: '中国',
                region: 'asia',
                subregion: '东亚',
                capital: '北京',
                population: '1,439,323,776',
                area: '9,596,960 sq km',
                gdp: '$14.34 trillion',
                languages: '中文（普通话）',
                currency: '人民币 (CNY)',
                introduction: '中国是世界四大文明古国之一，拥有悠久的历史和丰富的文化遗产。作为世界上人口最多的国家和第二大经济体，中国在全球事务中扮演着重要角色。',
                geography: {
                    location: '东亚，濒临太平洋',
                    coordinates: '35 00 N, 105 00 E',
                    climate: '多样化，从热带到亚寒带',
                    terrain: '多样，西部多山，东部平原',
                    naturalResources: '煤炭、铁矿石、石油、天然气、水力资源'
                },
                government: {
                    type: '社会主义共和国',
                    capital: '北京',
                    administrativeDivisions: '23个省，5个自治区，4个直辖市，2个特别行政区'
                },
                economy: {
                    overview: '世界第二大经济体，制造业和出口大国',
                    gdpPerCapita: '$10,500',
                    industries: '制造业、农业、服务业、建筑业',
                    exports: '电子产品、机械设备、纺织品、家具'
                }
            },
            {
                code: 'us',
                name: '美国',
                region: 'americas',
                subregion: '北美洲',
                capital: '华盛顿特区',
                population: '332,915,073',
                area: '9,833,517 sq km',
                gdp: '$21.43 trillion',
                languages: '英语',
                currency: '美元 (USD)',
                introduction: '美国是世界第三大人口国家和最大的经济体。作为一个多元文化的移民国家，美国在科技、娱乐、经济和军事等领域具有全球影响力。',
                geography: {
                    location: '北美洲，介于加拿大和墨西哥之间',
                    coordinates: '38 00 N, 97 00 W',
                    climate: '多样化，大部分为温带',
                    terrain: '广阔的中部平原，西部山脉，东部丘陵和低山',
                    naturalResources: '煤炭、铜、铅、钼、磷酸盐、铀、铝土矿、黄金、铁、汞、镍、银、钨、锌、石油、天然气、木材'
                },
                government: {
                    type: '联邦立宪共和国',
                    capital: '华盛顿特区',
                    administrativeDivisions: '50个州，1个特区'
                },
                economy: {
                    overview: '世界最大经济体，技术和服务业主导',
                    gdpPerCapita: '$65,280',
                    industries: '技术、金融、医疗、娱乐、制造业',
                    exports: '机械设备、电子产品、航空器、汽车、药品'
                }
            },
            {
                code: 'gm',
                name: '德国',
                region: 'europe',
                subregion: '西欧',
                capital: '柏林',
                population: '83,783,942',
                area: '357,022 sq km',
                gdp: '$3.85 trillion',
                languages: '德语',
                currency: '欧元 (EUR)',
                introduction: '德国是中欧最大的经济体，以其工程、汽车工业和技术创新而闻名。作为欧盟的创始成员国之一，德国在欧洲政治和经济中扮演着核心角色。',
                geography: {
                    location: '中欧，濒临波罗的海和北海',
                    coordinates: '51 00 N, 9 00 E',
                    climate: '温带，海洋性和大陆性',
                    terrain: '北部低地，中部高地，南部巴伐利亚阿尔卑斯山',
                    naturalResources: '煤炭、褐煤、天然气、铁矿石、铜、镍、铀、钾碱、盐、建筑用材料、木材、耕地'
                },
                government: {
                    type: '联邦议会共和国',
                    capital: '柏林',
                    administrativeDivisions: '16个州'
                },
                economy: {
                    overview: '欧洲最大经济体，出口导向型',
                    gdpPerCapita: '$46,560',
                    industries: '汽车、机械、化工、电子',
                    exports: '汽车、机械、化工产品、电子产品'
                }
            },
            {
                code: 'br',
                name: '巴西',
                region: 'americas',
                subregion: '南美洲',
                capital: '巴西利亚',
                population: '212,559,417',
                area: '8,515,770 sq km',
                gdp: '$1.84 trillion',
                languages: '葡萄牙语',
                currency: '雷亚尔 (BRL)',
                introduction: '巴西是南美洲最大的国家和经济体，以其丰富的自然资源、多样的生态系统和充满活力的文化而闻名。巴西也是世界上生物多样性最丰富的国家之一。',
                geography: {
                    location: '南美洲东部，濒临大西洋',
                    coordinates: '10 00 S, 55 00 W',
                    climate: '大部分为热带，南部为温带',
                    terrain: '广阔的亚马逊盆地，中部高原，南部山脉',
                    naturalResources: '铝土矿、黄金、铁矿石、锰、镍、磷酸盐、铂、铀、石油、水力资源、木材'
                },
                government: {
                    type: '联邦总统制共和国',
                    capital: '巴西利亚',
                    administrativeDivisions: '26个州，1个联邦区'
                },
                economy: {
                    overview: '南美洲最大经济体，农业和制造业并重',
                    gdpPerCapita: '$8,717',
                    industries: '纺织、鞋类、化工、水泥、木材、铁矿石、锡、钢铁、飞机、汽车和零部件',
                    exports: '铁矿石、大豆、石油、汽车、咖啡'
                }
            },
            {
                code: 'ng',
                name: '尼日利亚',
                region: 'africa',
                subregion: '西非',
                capital: '阿布贾',
                population: '206,139,589',
                area: '923,768 sq km',
                gdp: '$432.3 billion',
                languages: '英语（官方），豪萨语、约鲁巴语、伊博语',
                currency: '奈拉 (NGN)',
                introduction: '尼日利亚是非洲人口最多的国家和最大的经济体，以其丰富的石油资源、多样的文化和充满活力的娱乐产业而闻名。',
                geography: {
                    location: '西非，濒临几内亚湾',
                    coordinates: '10 00 N, 8 00 E',
                    climate: '热带，南部为赤道气候，北部为干旱气候',
                    terrain: '南部低地，中部丘陵和高原，北部平原',
                    naturalResources: '石油、天然气、锡、铁矿石、煤炭、石灰石、铅、锌、铌、耕地'
                },
                government: {
                    type: '联邦总统制共和国',
                    capital: '阿布贾',
                    administrativeDivisions: '36个州，1个联邦首都特区'
                },
                economy: {
                    overview: '非洲最大经济体，石油出口主导',
                    gdpPerCapita: '$2,097',
                    industries: '石油、钢铁、纺织、食品加工、建筑材料',
                    exports: '石油和石油产品、可可、橡胶'
                }
            },
            {
                code: 'au',
                name: '澳大利亚',
                region: 'oceania',
                subregion: '澳大利亚和新西兰',
                capital: '堪培拉',
                population: '25,499,884',
                area: '7,741,220 sq km',
                gdp: '$1.39 trillion',
                languages: '英语',
                currency: '澳元 (AUD)',
                introduction: '澳大利亚是世界第六大国家，以其独特的野生动物、自然景观和高生活质量而闻名。作为一个发达国家，澳大利亚在教育和医疗保健方面具有高标准。',
                geography: {
                    location: '大洋洲，介于印度洋和南太平洋之间',
                    coordinates: '27 00 S, 133 00 E',
                    climate: '一般干旱到半干旱，南部和东部为温带',
                    terrain: '主要是低高原，沙漠，肥沃的东南和西南沿海平原',
                    naturalResources: '铝土矿、煤炭、铁矿石、铜、锡、黄金、银、铀、镍、钨、稀土矿物、铅、锌、钻石、天然气、石油'
                },
                government: {
                    type: '联邦议会立宪君主制',
                    capital: '堪培拉',
                    administrativeDivisions: '6个州，2个主要领地'
                },
                economy: {
                    overview: '发达的市场经济，服务业和资源出口主导',
                    gdpPerCapita: '$55,060',
                    industries: '采矿、工业和运输设备、食品加工、化工、钢铁',
                    exports: '铁矿石、煤炭、黄金、肉类、羊毛、铝土矿、小麦、机械和运输设备'
                }
            },
            {
                code: 'in',
                name: '印度',
                region: 'asia',
                subregion: '南亚',
                capital: '新德里',
                population: '1,380,004,385',
                area: '3,287,263 sq km',
                gdp: '$2.87 trillion',
                languages: '印地语、英语（官方）',
                currency: '印度卢比 (INR)',
                introduction: '印度是世界第二人口大国和第五大经济体，拥有悠久的历史和多元的文化。印度以其信息技术服务、电影产业和民主传统而闻名。',
                geography: {
                    location: '南亚，濒临阿拉伯海和孟加拉湾',
                    coordinates: '20 00 N, 77 00 E',
                    climate: '从热带季风到温带',
                    terrain: '北部为喜马拉雅山脉，南部为德干高原，中部为恒河平原',
                    naturalResources: '煤炭（世界第四大储量）、铁矿石、锰、云母、铝土矿、钛矿石、铬铁矿、天然气、钻石、石油、石灰石、耕地'
                },
                government: {
                    type: '联邦议会民主共和国',
                    capital: '新德里',
                    administrativeDivisions: '28个邦，8个联邦属地'
                },
                economy: {
                    overview: '世界第五大经济体，多元化发展',
                    gdpPerCapita: '$2,100',
                    industries: '纺织、化工、食品加工、钢铁、运输设备、水泥、采矿、石油、机械、软件',
                    exports: '石油产品、珠宝、汽车、机械、服装、化工产品'
                }
            },
            {
                code: 'fr',
                name: '法国',
                region: 'europe',
                subregion: '西欧',
                capital: '巴黎',
                population: '65,273,511',
                area: '643,801 sq km',
                gdp: '$2.72 trillion',
                languages: '法语',
                currency: '欧元 (EUR)',
                introduction: '法国是西欧最大的国家，以其文化影响力、美食、时尚和艺术而闻名。作为联合国安理会常任理事国和欧盟核心成员国，法国在国际事务中发挥着重要作用。',
                geography: {
                    location: '西欧，濒临大西洋、北海和地中海',
                    coordinates: '46 00 N, 2 00 E',
                    climate: '海洋性到大陆性，南部为地中海气候',
                    terrain: '主要是平原或平缓起伏的丘陵，西部和南部为山脉',
                    naturalResources: '煤炭、铁矿石、铝土矿、铀、锌、铅、铜、钾碱、木材、渔业、水力资源'
                },
                government: {
                    type: '半总统制共和国',
                    capital: '巴黎',
                    administrativeDivisions: '18个大区'
                },
                economy: {
                    overview: '高度发达的混合经济，服务业主导',
                    gdpPerCapita: '$42,870',
                    industries: '机械、化学品、汽车、飞机、电子产品、纺织、食品加工、旅游',
                    exports: '机械和运输设备、飞机、塑料、化学品、药品、铁和钢、饮料'
                }
            },
            {
                code: 'eg',
                name: '埃及',
                region: 'africa',
                subregion: '北非',
                capital: '开罗',
                population: '102,334,404',
                area: '1,001,450 sq km',
                gdp: '$361.8 billion',
                languages: '阿拉伯语（官方），英语和法语广泛使用',
                currency: '埃及镑 (EGP)',
                introduction: '埃及是世界上最古老的文明之一，以其古埃及文明、金字塔和尼罗河而闻名。作为连接非洲和亚洲的桥梁，埃及在地缘政治上具有重要地位。',
                geography: {
                    location: '北非，濒临地中海和红海',
                    coordinates: '27 00 N, 30 00 E',
                    climate: '沙漠气候，炎热干燥；夏季炎热，冬季温和',
                    terrain: '广阔的沙漠高原，尼罗河河谷和三角洲',
                    naturalResources: '石油、天然气、铁矿石、磷酸盐、锰、石灰石、石膏、滑石、石棉、铅、锌'
                },
                government: {
                    type: '总统制共和国',
                    capital: '开罗',
                    administrativeDivisions: '27个省'
                },
                economy: {
                    overview: '多元化经济，依赖农业、旅游业和能源',
                    gdpPerCapita: '$3,514',
                    industries: '纺织、食品加工、旅游、化工、制药、石油和天然气',
                    exports: '原油、石油产品、棉花、纺织品、金属制品、化工产品'
                }
            },
            {
                code: 'ca',
                name: '加拿大',
                region: 'americas',
                subregion: '北美洲',
                capital: '渥太华',
                population: '37,742,154',
                area: '9,984,670 sq km',
                gdp: '$1.74 trillion',
                languages: '英语、法语（官方）',
                currency: '加元 (CAD)',
                introduction: '加拿大是世界第二大国家，以其自然美景、多元文化和高生活质量而闻名。作为G7成员国，加拿大拥有发达的经济和稳定的社会政治环境。',
                geography: {
                    location: '北美洲，北部濒临北冰洋，东部濒临大西洋，西部濒临太平洋',
                    coordinates: '60 00 N, 95 00 W',
                    climate: '从温带到极地，南部为温带，北部为寒带',
                    terrain: '主要是平原，西部有山脉，北部为苔原',
                    naturalResources: '铁矿石、镍、锌、铜、黄金、铅、钼、铝土矿、钾碱、钻石、银、渔业、煤炭、石油、天然气、水力资源、木材'
                },
                government: {
                    type: '联邦议会立宪君主制',
                    capital: '渥太华',
                    administrativeDivisions: '10个省，3个地区'
                },
                economy: {
                    overview: '高度发达的技术导向型市场经济',
                    gdpPerCapita: '$46,230',
                    industries: '运输设备、化工、加工和非矿物金属产品、食品、木材和纸张产品、石油和天然气',
                    exports: '汽车及零部件、工业机械、飞机、电信设备、电子设备、化学品、塑料、化肥、木材'
                }
            },
            {
                code: 'ja',
                name: '日本',
                region: 'asia',
                subregion: '东亚',
                capital: '东京',
                population: '126,476,461',
                area: '377,915 sq km',
                gdp: '$5.08 trillion',
                languages: '日语',
                currency: '日元 (JPY)',
                introduction: '日本是东亚的岛国，以其先进的技术、独特的文化和悠久的历史而闻名。作为世界第三大经济体，日本在汽车、电子和机器人技术等领域处于领先地位。',
                geography: {
                    location: '东亚，位于太平洋上的岛链',
                    coordinates: '36 00 N, 138 00 E',
                    climate: '从温带到热带，南部为亚热带',
                    terrain: '多为山地和丘陵，沿海平原狭窄',
                    naturalResources: '鱼类，森林资源，少量矿产'
                },
                government: {
                    type: '议会立宪君主制',
                    capital: '东京',
                    administrativeDivisions: '47个都道府县'
                },
                economy: {
                    overview: '高度发达的自由市场经济，技术先进',
                    gdpPerCapita: '$40,190',
                    industries: '汽车、电子产品、机械、钢铁、金属加工、化工、纺织品、食品加工',
                    exports: '汽车、电子产品、钢铁、机械、化学品'
                }
            },
            {
                code: 'uk',
                name: '英国',
                region: 'europe',
                subregion: '西欧',
                capital: '伦敦',
                population: '67,886,011',
                area: '243,610 sq km',
                gdp: '$2.83 trillion',
                languages: '英语',
                currency: '英镑 (GBP)',
                introduction: '英国是由英格兰、苏格兰、威尔士和北爱尔兰组成的岛国，对世界历史、文化和政治产生了深远影响。作为联合国安理会常任理事国和主要金融中心，英国在国际事务中保持重要地位。',
                geography: {
                    location: '西欧，包括大不列颠岛东北部的三分之一和爱尔兰岛北部',
                    coordinates: '54 00 N, 2 00 W',
                    climate: '温带，海洋性，多雨',
                    terrain: '多为低地，西部和北部为山地',
                    naturalResources: '煤炭、石油、天然气、石灰石、铁矿石、盐、粘土、白垩、石膏、铅、硅、耕地'
                },
                government: {
                    type: '议会立宪君主制',
                    capital: '伦敦',
                    administrativeDivisions: '4个构成国'
                },
                economy: {
                    overview: '高度发达的多元化经济，服务业主导',
                    gdpPerCapita: '$42,330',
                    industries: '机械和运输设备、石油、化工、食品加工、纺织、服装、其他消费品',
                    exports: '机械、汽车、航空航天设备、电子产品、化工产品、金属制品'
                }
            }
        ];
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
        }

        currentView = view;
    }

    // 筛选和显示国家
    function filterAndDisplayCountries(searchTerm = '') {
        // 筛选国家
        filteredCountries = countriesData.filter(country => {
            // 地区筛选 - 使用chineseContinent字段而不是continent字段
            if (currentRegion !== 'all' && country.chineseContinent !== currentRegion) {
                return false;
            }

            // 搜索筛选 - 同时搜索中英文名称
            if (searchTerm) {
                const lowerSearchTerm = searchTerm.toLowerCase();
                const nameMatch = country.name && country.name.toLowerCase().includes(lowerSearchTerm);
                const chineseNameMatch = country.chineseName && country.chineseName.toLowerCase().includes(lowerSearchTerm);
                
                if (!nameMatch && !chineseNameMatch) {
                    return false;
                }
            }

            return true;
        });

        // 显示国家
        displayCountries(filteredCountries);
        
        // 移动设备优化：添加触觉反馈
        if (isMobileDevice() && 'vibrate' in navigator) {
            navigator.vibrate(5);
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
    card.setAttribute('data-continent', country.chineseContinent);

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

    // 使用Flag_SVG字段显示国旗
    const flagSvg = country.flagSvg || `<i class="fas fa-flag country-flag-placeholder"></i>`;
    
    // 显示中英文名称
    const countryName = country.chineseName ? `${country.chineseName} (${country.name})` : country.name;
    const continentName = country.chineseContinent || 'Unknown';

    card.innerHTML = `
        <div class="country-flag">
            ${flagSvg}
        </div>
        <div class="country-info">
            <h3 class="country-name">${countryName}</h3>
            <div class="country-region">
                <i class="fas fa-globe"></i>
                <span>${continentName}</span>
            </div>
            <div class="country-facts">
                <div class="country-fact">
                    <span class="fact-label">FIPS代码</span>
                    <span class="fact-value">${country.fipsCode || '未知'}</span>
                </div>
                <div class="country-fact">
                    <span class="fact-label">Alpha2代码</span>
                    <span class="fact-value">${country.alpha2Code || '未知'}</span>
                </div>
                <div class="country-fact">
                    <span class="fact-label">英文名称</span>
                    <span class="fact-value">${country.name || '未知'}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="card-button details-button" data-country-code="${country.code}">
                    <i class="fas fa-info-circle"></i> 详情
                </button>
                <button class="card-button download-button" id="download-${country.code}" data-country-code="${country.code}">
                    <i class="fas fa-download"></i> 下载数据
                </button>
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
        
        // 移动设备优化：调整卡片内部元素样式
        const countryName = card.querySelector('.country-name');
        countryName.style.fontSize = '18px';
        countryName.style.marginBottom = '8px';
        
        const countryFacts = card.querySelector('.country-facts');
        countryFacts.style.marginTop = '12px';
        
        const factLabels = card.querySelectorAll('.fact-label');
        factLabels.forEach(label => {
            label.style.fontSize = '12px';
            label.style.color = '#666';
        });
        
        const factValues = card.querySelectorAll('.fact-value');
        factValues.forEach(value => {
            value.style.fontSize = '14px';
            value.style.fontWeight = '500';
        });
        
        const cardActions = card.querySelector('.card-actions');
        cardActions.style.marginTop = '15px';
        cardActions.style.display = 'flex';
        cardActions.style.gap = '10px';
        
        const cardButtons = card.querySelectorAll('.card-button');
        cardButtons.forEach(button => {
            button.style.flex = '1';
            button.style.padding = '10px';
            button.style.fontSize = '14px';
            button.style.borderRadius = '6px';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.gap = '5px';
        });
    }

    // 添加点击事件 - 使用事件委托而不是内联onclick
    const detailsButton = card.querySelector('.details-button');
    const downloadButton = card.querySelector('.download-button');
    
    detailsButton.addEventListener('click', function(e) {
        e.stopPropagation();
        showCountryDetails(country.code);
    });
    
    downloadButton.addEventListener('click', function(e) {
        e.stopPropagation();
        downloadCountryData(country.code);
    });
    
    // 移动设备优化：为按钮添加触摸反馈
    if (isMobile) {
        detailsButton.addEventListener('touchstart', function() {
            this.style.backgroundColor = '#f0f0f0';
        }, { passive: true });
        
        detailsButton.addEventListener('touchend', function() {
            this.style.backgroundColor = '';
        }, { passive: true });
        
        downloadButton.addEventListener('touchstart', function() {
            this.style.backgroundColor = '#f0f0f0';
        }, { passive: true });
        
        downloadButton.addEventListener('touchend', function() {
            this.style.backgroundColor = '';
        }, { passive: true });
    }

    // 添加卡片点击事件
    card.addEventListener('click', function(e) {
        // 如果点击的是按钮，不触发卡片点击事件
        if (e.target.closest('.card-button')) return;
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
    
    // 显示加载指示器
    modalBody.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>正在加载国家详细信息...</p>
        </div>
    `;
    
    // 显示模态框
    countryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 移动设备优化：调整模态框位置和大小
    if (isMobileDevice()) {
        adjustModalForOrientation();
    }
    
    // 移动设备优化：添加触摸滑动关闭功能
    if (isMobileDevice()) {
        setupSwipeToClose(countryModal);
    }
    
    // 尝试从factbook.json文件加载详细信息
    try {
        let detailedData = null;
        
        // 如果有文件路径，尝试从factbook.json加载
        if (country.factbookFilePath) {
            detailedData = await loadCountryDetailsFromFactbook(country.factbookFilePath);
        }
        
        // 如果无法从factbook.json加载，使用基本数据
        if (!detailedData) {
            detailedData = {
                ...country,
                details: country.details || {
                    geography: {},
                    government: {},
                    economy: {}
                }
            };
        }
        
        // 构建模态框内容
        let modalContent = `
            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-info-circle"></i>
                    <span>国家概况</span>
                </h3>
                <p class="detail-content">${detailedData.description || detailedData.introduction || '暂无描述'}</p>
            </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-globe"></i>
                    <span>地理信息</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">位置</div>
                        <div class="detail-value">${detailedData.geography?.location || detailedData.details?.geography?.location || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">气候</div>
                        <div class="detail-value">${detailedData.geography?.climate || detailedData.details?.geography?.climate || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">地形</div>
                        <div class="detail-value">${detailedData.geography?.terrain || detailedData.details?.geography?.terrain || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">最高点</div>
                        <div class="detail-value">${detailedData.geography?.elevation?.highest || detailedData.details?.geography?.elevation?.highest || '未知'}</div>
                    </div>
                </div>
                <div class="detail-content" style="margin-top: 1rem;">
                    <strong>自然资源：</strong> ${detailedData.geography?.naturalResources || detailedData.details?.geography?.naturalResources || '未知'}
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-users"></i>
                    <span>人口信息</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">人口</div>
                        <div class="detail-value">${detailedData.population || country.population || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">国籍</div>
                        <div class="detail-value">${detailedData.people?.nationality || detailedData.details?.people?.nationality || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">民族</div>
                        <div class="detail-value">${detailedData.people?.ethnicGroups || detailedData.details?.people?.ethnicGroups || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">语言</div>
                        <div class="detail-value">${detailedData.people?.languages || detailedData.details?.people?.languages || detailedData.languages || '未知'}</div>
                    </div>
                </div>
                <div class="detail-content" style="margin-top: 1rem;">
                    <strong>宗教：</strong> ${detailedData.people?.religions || detailedData.details?.people?.religions || '未知'}
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-landmark"></i>
                    <span>政府信息</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">政体</div>
                        <div class="detail-value">${detailedData.government?.type || detailedData.details?.government?.type || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">首都</div>
                        <div class="detail-value">${detailedData.government?.capital || detailedData.capital || country.capital || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">独立日</div>
                        <div class="detail-value">${detailedData.government?.independence || detailedData.details?.government?.independence || '未知'}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-chart-line"></i>
                    <span>经济概况</span>
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">GDP</div>
                        <div class="detail-value">${detailedData.economy?.gdp || detailedData.gdp || '未知'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">农业</div>
                        <div class="detail-value">${detailedData.economy?.agriculture || detailedData.details?.economy?.agriculture || '未知'}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">工业</div>
                        <div class="detail-value">${detailedData.economy?.industry || detailedData.details?.economy?.industry || '未知'}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">服务业</div>
                        <div class="detail-value">${detailedData.economy?.services || detailedData.details?.economy?.services || '未知'}%</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3 class="detail-title">
                    <i class="fas fa-chart-pie"></i>
                    <span>数据可视化</span>
                </h3>
                <div id="country-charts-${country.code}" class="charts-container">
                    <div class="loading-charts">加载图表中...</div>
                </div>
            </div>
        `;

        // 设置模态框内容
        modalBody.innerHTML = modalContent;
        
        // 加载数据可视化图表
        setTimeout(() => {
            createDataVisualization(detailedData, `country-charts-${country.code}`);
        }, 100);
        
    } catch (error) {
        console.error('加载国家详细信息失败:', error);
        modalBody.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>加载国家详细信息失败: ${error.message}</p>
                <button class="btn btn-primary retry-button" data-country-code="${countryCode}">
                    <i class="fas fa-redo"></i> 重试
                </button>
            </div>
        `;
        
        // 添加重试按钮事件
        const retryButton = modalBody.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', function() {
                showCountryDetails(countryCode);
            });
        }
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
        // 移除逗号并转换为数字
        const num = parseInt(numStr.replace(/,/g, ''));
        
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
    
    // 从factbook.json API获取特定国家的数据
    async function fetchCountryData(countryCode) {
        try {
            // 模拟API调用 - 实际应用中应替换为真实的API调用
            // 例如: const response = await fetch(`https://api.example.com/factbook/${countryCode}`);
            
            // 返回模拟数据
            return getMockCountryData(countryCode);
        } catch (error) {
            console.error(`获取国家 ${countryCode} 数据失败:`, error);
            throw error;
        }
    }
    
    // 获取模拟国家数据
    function getMockCountryData(countryCode) {
        // 从模拟数据中查找指定国家
        const allCountries = getMockCountriesData();
        return allCountries.find(country => country.code === countryCode) || null;
    }
    
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
            throw new Error(`无法加载 ${factbookUrl}: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 格式化数据以匹配应用所需的格式
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
    } catch (error) {
        console.error('从factbook.json加载国家详细信息失败:', error);
        throw error;
    }
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
});