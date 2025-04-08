/**
 * Education Level Content Adaptor
 * Dynamically adjusts subject content based on user's educational level
 */

// Content difficulty levels
const DIFFICULTY_LEVELS = {
    ELEMENTARY: 'elementary',  // 小学
    JUNIOR: 'junior',         // 初中
    SENIOR: 'senior'          // 高中
};

// Grade to difficulty mapping
const GRADE_TO_DIFFICULTY = {
    // 小学
    '一年级': DIFFICULTY_LEVELS.ELEMENTARY,
    '二年级': DIFFICULTY_LEVELS.ELEMENTARY,
    '三年级': DIFFICULTY_LEVELS.ELEMENTARY,
    '四年级': DIFFICULTY_LEVELS.ELEMENTARY,
    '五年级': DIFFICULTY_LEVELS.ELEMENTARY,
    '六年级': DIFFICULTY_LEVELS.ELEMENTARY,
    // 初中
    '初一': DIFFICULTY_LEVELS.JUNIOR,
    '初二': DIFFICULTY_LEVELS.JUNIOR,
    '初三': DIFFICULTY_LEVELS.JUNIOR,
    // 高中
    '高一': DIFFICULTY_LEVELS.SENIOR,
    '高二': DIFFICULTY_LEVELS.SENIOR,
    '高三': DIFFICULTY_LEVELS.SENIOR
};

// Default content settings
const DEFAULT_DIFFICULTY = DIFFICULTY_LEVELS.JUNIOR;

// Topics visibility by subject and difficulty level
const TOPICS_VISIBILITY = {
    'math': {
        'algebra': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'geometry': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'calculus': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: false,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'statistics': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'arithmetic': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'trigonometry': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        }
    },
    'physics': {
        'mechanics': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'electromagnetism': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'thermodynamics': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'optics': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'quantum': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: false,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'relativity': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: false,
            [DIFFICULTY_LEVELS.SENIOR]: true
        }
    },
    'chemistry': {
        'atomic-structure': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'chemical-bonding': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'chemical-reactions': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'acids-bases': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'organic-chemistry': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: false,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'thermochemistry': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: false,
            [DIFFICULTY_LEVELS.SENIOR]: true
        }
    },
    'geography': {
        'physical-geography': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'human-geography': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'cartography': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'climate': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'environmental': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'economic': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        }
    },
    'biology': {
        'cells': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'genetics': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'ecology': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'human-body': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: true,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'evolution': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: true,
            [DIFFICULTY_LEVELS.SENIOR]: true
        },
        'microbiology': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: false,
            [DIFFICULTY_LEVELS.JUNIOR]: false,
            [DIFFICULTY_LEVELS.SENIOR]: true
        }
    }
};

// Alternative content for different educational levels
const CONTENT_ADAPTATIONS = {
    // 主题描述适配
    'topic-descriptions': {
        'math': {
            'algebra': {
                [DIFFICULTY_LEVELS.ELEMENTARY]: '基础数学和简单方程',
                [DIFFICULTY_LEVELS.JUNIOR]: '方程、函数和多项式',
                [DIFFICULTY_LEVELS.SENIOR]: '方程、函数、多项式和高级数学概念'
            },
            'calculus': {
                [DIFFICULTY_LEVELS.JUNIOR]: '初级微积分概念',
                [DIFFICULTY_LEVELS.SENIOR]: '导数、积分和极限'
            }
            // 其他数学主题...
        },
        'physics': {
            'mechanics': {
                [DIFFICULTY_LEVELS.JUNIOR]: '基础力学和运动',
                [DIFFICULTY_LEVELS.SENIOR]: '牛顿定律、能量守恒和复杂力学系统'
            },
            'quantum': {
                [DIFFICULTY_LEVELS.SENIOR]: '量子力学基础概念'
            }
            // 其他物理主题...
        },
        'chemistry': {
            'chemical-reactions': {
                [DIFFICULTY_LEVELS.ELEMENTARY]: '基本化学反应和安全实验',
                [DIFFICULTY_LEVELS.JUNIOR]: '化学反应和平衡',
                [DIFFICULTY_LEVELS.SENIOR]: '化学计量学、平衡和反应类型'
            },
            'organic-chemistry': {
                [DIFFICULTY_LEVELS.SENIOR]: '碳化合物和官能团'
            }
            // 其他化学主题...
        },
        'biology': {
            'cells': {
                [DIFFICULTY_LEVELS.ELEMENTARY]: '细胞的基本概念和结构',
                [DIFFICULTY_LEVELS.JUNIOR]: '细胞结构和功能',
                [DIFFICULTY_LEVELS.SENIOR]: '细胞结构、功能和细胞分裂'
            },
            'genetics': {
                [DIFFICULTY_LEVELS.JUNIOR]: '基础遗传学和DNA',
                [DIFFICULTY_LEVELS.SENIOR]: 'DNA、基因表达和遗传规律'
            }
            // 其他生物主题...
        }
    },
    
    // 欢迎信息适配
    'welcome-messages': {
        'math': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: '欢迎来到数学世界！让我们一起学习基础数学知识，理解数字和图形的奥秘。',
            [DIFFICULTY_LEVELS.JUNIOR]: '欢迎学习数学！我们将探索代数、几何和更多有趣的数学概念。',
            [DIFFICULTY_LEVELS.SENIOR]: '欢迎深入学习数学！我们将探讨高级代数、微积分和统计学等复杂概念。'
        },
        'physics': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: '欢迎了解物理世界！我们将用简单有趣的方式探索自然现象。',
            [DIFFICULTY_LEVELS.JUNIOR]: '欢迎学习物理！我们将探索力学、电学和光学等基础物理概念。',
            [DIFFICULTY_LEVELS.SENIOR]: '欢迎深入研究物理学！我们将探讨力学、电磁学、热力学和现代物理学等复杂概念。'
        },
        'chemistry': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: '欢迎了解化学世界！我们将用简单有趣的方式探索物质变化。',
            [DIFFICULTY_LEVELS.JUNIOR]: '欢迎学习化学！我们将探索原子、分子和化学反应的基础知识。',
            [DIFFICULTY_LEVELS.SENIOR]: '欢迎深入研究化学！我们将探讨原子结构、化学键、有机化学和热化学等复杂概念。'
        },
        'geography': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: '欢迎了解地理世界！让我们一起探索地球和不同的地方。',
            [DIFFICULTY_LEVELS.JUNIOR]: '欢迎学习地理！我们将探索地球的自然和人文环境。',
            [DIFFICULTY_LEVELS.SENIOR]: '欢迎深入研究地理学！我们将探讨物理地理、人文地理和环境地理等复杂概念。'
        },
        'biology': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: '欢迎了解生物世界！让我们一起探索植物、动物和我们自己的身体。',
            [DIFFICULTY_LEVELS.JUNIOR]: '欢迎学习生物学！我们将探索细胞、生态系统和人体系统的基础知识。',
            [DIFFICULTY_LEVELS.SENIOR]: '欢迎深入研究生物学！我们将探讨细胞生物学、遗传学、生态学和人体系统等复杂概念。'
        }
    },
    
    // AI助手提示信息适配
    'ai-assistant-prompts': {
        'math': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: '你好！我是你的数学助手。有关于数字、形状或简单计算的问题吗？',
            [DIFFICULTY_LEVELS.JUNIOR]: '你好！我是你的DeepSeek数学助手。今天我能如何帮助你解决数学问题？',
            [DIFFICULTY_LEVELS.SENIOR]: '你好！我是你的DeepSeek数学助手。无论是代数、几何、微积分还是统计学问题，我都能帮你解答。'
        },
        'physics': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: '你好！我是你的科学助手。有关于物体运动或自然现象的问题吗？',
            [DIFFICULTY_LEVELS.JUNIOR]: '你好！我是你的DeepSeek物理助手。需要帮助理解物理概念或解决问题吗？',
            [DIFFICULTY_LEVELS.SENIOR]: '你好！我是你的DeepSeek物理助手。无论是经典力学、电磁学、热力学还是现代物理学问题，我都能帮你解答。'
        },
        'chemistry': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: '你好！我是你的科学助手。有关于物质变化或化学实验的问题吗？',
            [DIFFICULTY_LEVELS.JUNIOR]: '你好！我是你的DeepSeek化学助手。需要帮助理解化学概念或解决问题吗？',
            [DIFFICULTY_LEVELS.SENIOR]: '你好！我是你的DeepSeek化学助手。我能帮助你理解化学概念、解决问题或练习化学平衡。'
        },
        'biology': {
            [DIFFICULTY_LEVELS.ELEMENTARY]: '你好！我是你的科学助手。有关于植物、动物或人体的问题吗？',
            [DIFFICULTY_LEVELS.JUNIOR]: '你好！我是你的DeepSeek生物学助手。需要帮助理解生物学概念或解决问题吗？',
            [DIFFICULTY_LEVELS.SENIOR]: '你好！我是你的DeepSeek生物学助手。我能帮助你理解生物学概念、解答问题或探索生命的奥秘。'
        }
    }
};

/**
 * Get current user's educational difficulty level
 * @returns {string} Difficulty level
 */
function getCurrentDifficultyLevel() {
    // Check if educational profile exists in localStorage
    const savedProfile = localStorage.getItem('educationalProfile');
    if (savedProfile) {
        try {
            const parsedProfile = JSON.parse(savedProfile);
            const grade = parsedProfile.grade;
            
            if (grade && GRADE_TO_DIFFICULTY[grade]) {
                return GRADE_TO_DIFFICULTY[grade];
            }
        } catch (error) {
            console.error('Failed to parse educational profile:', error);
        }
    }
    
    // Return default difficulty if no profile found
    return DEFAULT_DIFFICULTY;
}

/**
 * Adapt page content based on educational level
 */
function adaptContentToEducationalLevel() {
    const currentDifficulty = getCurrentDifficultyLevel();
    const currentSubject = getCurrentSubject();
    
    if (!currentSubject) return;
    
    // Update welcome message
    updateWelcomeMessage(currentSubject, currentDifficulty);
    
    // Update AI assistant message
    updateAIAssistantPrompt(currentSubject, currentDifficulty);
    
    // Update topic visibility and descriptions
    updateTopicCards(currentSubject, currentDifficulty);
    
    // Update quiz selection options
    updateQuizOptions(currentSubject, currentDifficulty);
    
    // Add educational level indicator
    addEducationalLevelIndicator(currentDifficulty);
}

/**
 * Get current subject from URL path
 * @returns {string|null} Current subject or null if not in a subject page
 */
function getCurrentSubject() {
    const path = window.location.pathname;
    const subjectMatch = path.match(/\/subjects\/([^\/]+)/);
    
    if (subjectMatch && subjectMatch[1]) {
        return subjectMatch[1];
    }
    
    return null;
}

/**
 * Update the welcome message based on educational level
 */
function updateWelcomeMessage(subject, difficulty) {
    const heroDescription = document.querySelector('.subject-description');
    if (!heroDescription) return;
    
    const welcomeMessages = CONTENT_ADAPTATIONS['welcome-messages'];
    if (welcomeMessages[subject] && welcomeMessages[subject][difficulty]) {
        heroDescription.textContent = welcomeMessages[subject][difficulty];
    }
}

/**
 * Update AI assistant prompt based on educational level
 */
function updateAIAssistantPrompt(subject, difficulty) {
    const aiPromptElement = document.querySelector('.chat-messages .message-ai p');
    if (!aiPromptElement) return;
    
    const aiPrompts = CONTENT_ADAPTATIONS['ai-assistant-prompts'];
    if (aiPrompts[subject] && aiPrompts[subject][difficulty]) {
        aiPromptElement.textContent = aiPrompts[subject][difficulty];
    }
}

/**
 * Update topic cards visibility and descriptions based on educational level
 */
function updateTopicCards(subject, difficulty) {
    const topicCards = document.querySelectorAll('.topic-card');
    if (!topicCards.length) return;
    
    topicCards.forEach(card => {
        const topicId = card.getAttribute('data-topic');
        
        // Check if topic should be visible for current difficulty
        if (TOPICS_VISIBILITY[subject] && 
            TOPICS_VISIBILITY[subject][topicId] && 
            TOPICS_VISIBILITY[subject][topicId][difficulty] === false) {
            card.style.display = 'none';
        } else {
            card.style.display = '';
            
            // Update description if available
            const descElement = card.querySelector('p');
            if (descElement && 
                CONTENT_ADAPTATIONS['topic-descriptions'][subject] && 
                CONTENT_ADAPTATIONS['topic-descriptions'][subject][topicId] && 
                CONTENT_ADAPTATIONS['topic-descriptions'][subject][topicId][difficulty]) {
                descElement.textContent = CONTENT_ADAPTATIONS['topic-descriptions'][subject][topicId][difficulty];
            }
        }
    });
    
    // Adjust grid layout for remaining visible cards
    adjustTopicsGridLayout();
}

/**
 * Adjust topics grid layout after hiding some cards
 */
function adjustTopicsGridLayout() {
    const topicsGrid = document.querySelector('.topics-grid');
    if (!topicsGrid) return;
    
    const visibleCards = Array.from(topicsGrid.querySelectorAll('.topic-card'))
        .filter(card => card.style.display !== 'none');
    
    // Adjust grid template if needed
    if (visibleCards.length <= 3) {
        topicsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    } else {
        topicsGrid.style.gridTemplateColumns = '';
    }
}

/**
 * Update quiz options based on educational level
 */
function updateQuizOptions(subject, difficulty) {
    const quizTopicSelect = document.getElementById('quiz-topic');
    if (!quizTopicSelect) return;
    
    // Remove options for topics that are not visible
    Array.from(quizTopicSelect.options).forEach(option => {
        const topicId = option.value;
        if (TOPICS_VISIBILITY[subject] && 
            TOPICS_VISIBILITY[subject][topicId] && 
            TOPICS_VISIBILITY[subject][topicId][difficulty] === false) {
            option.remove();
        }
    });
    
    // Adjust difficulty options based on educational level
    const difficultySelect = document.getElementById('quiz-difficulty');
    if (difficultySelect) {
        Array.from(difficultySelect.options).forEach(option => {
            // Hide "困难" option for elementary school
            if (difficulty === DIFFICULTY_LEVELS.ELEMENTARY && option.value === 'hard') {
                // option.remove();
            }
        });
    }
}

/**
 * Add an educational level indicator to the page
 */
function addEducationalLevelIndicator(difficulty) {
    // Create or update the level indicator
    let levelIndicator = document.getElementById('level-indicator');
    
    if (!levelIndicator) {
        levelIndicator = document.createElement('div');
        levelIndicator.id = 'level-indicator';
        levelIndicator.className = 'level-indicator';
        
        // Add to page after hero section
        const heroSection = document.querySelector('.subject-hero');
        if (heroSection) {
            heroSection.parentNode.insertBefore(levelIndicator, heroSection.nextSibling);
        }
    }
    
    // Set content based on difficulty
    let difficultyName, color;
    switch (difficulty) {
        case DIFFICULTY_LEVELS.ELEMENTARY:
            difficultyName = '小学';
            color = '#4CAF50'; // Green
            break;
        case DIFFICULTY_LEVELS.JUNIOR:
            difficultyName = '初中';
            color = '#2196F3'; // Blue
            break;
        case DIFFICULTY_LEVELS.SENIOR:
            difficultyName = '高中';
            color = '#FF5722'; // Orange
            break;
        default:
            difficultyName = '通用';
            color = '#9E9E9E'; // Gray
    }
    
    levelIndicator.innerHTML = `
        <div class="container">
            <div class="level-content">
                <span class="level-dot" style="background-color: ${color}"></span>
                <span class="level-text">内容已根据<strong>${difficultyName}</strong>学习阶段进行优化</span>
                <button id="change-level-btn" class="btn btn-small">调整</button>
            </div>
        </div>
    `;
    
    // Add event listener to change button
    const changeButton = document.getElementById('change-level-btn');
    if (changeButton) {
        changeButton.addEventListener('click', showProfileModal);
    }
    
    // Add styles for level indicator if not already added
    addLevelIndicatorStyles();
}

/**
 * Add styles for the level indicator
 */
function addLevelIndicatorStyles() {
    if (document.getElementById('level-indicator-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'level-indicator-styles';
    styleElement.textContent = `
        .level-indicator {
            background-color: #f5f5f5;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .level-content {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #616161;
        }
        
        .level-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .level-text {
            flex: 1;
        }
        
        .btn-small {
            padding: 4px 8px;
            font-size: 12px;
            background-color: #f5f5f5;
            border: 1px solid #bdbdbd;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .btn-small:hover {
            background-color: #e0e0e0;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Adapt content based on user's educational level
    adaptContentToEducationalLevel();
    
    // Listen for profile changes
    window.addEventListener('storage', (event) => {
        if (event.key === 'educationalProfile') {
            adaptContentToEducationalLevel();
        }
    });
}); 