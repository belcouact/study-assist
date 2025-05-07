document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loadingContainer = document.getElementById('loading-container');
    const vocabContent = document.getElementById('vocab-content');
    const vocabCard = document.getElementById('vocab-card');
    const wordText = document.getElementById('word-text');
    const wordTextBack = document.getElementById('word-text-back');
    const wordRank = document.getElementById('word-rank');
    const wordRankBack = document.getElementById('word-rank-back');
    const ukPronunciation = document.getElementById('uk-pronunciation');
    const usPronunciation = document.getElementById('us-pronunciation');
    const translationsText = document.getElementById('translations-text');
    const exampleList = document.getElementById('example-list');
    const wordList = document.getElementById('word-list');
    const progressBar = document.getElementById('progress-bar');
    const currentWordDisplay = document.getElementById('current-word');
    const totalCardsDisplay = document.getElementById('total-cards');
    const currentLevelDisplay = document.getElementById('current-level');
    const learnedPercentDisplay = document.getElementById('learned-percent');
    const totalWordsDisplay = document.getElementById('total-words');
    const learnedWordsDisplay = document.getElementById('learned-words');
    const daysStreakDisplay = document.getElementById('days-streak');
    
    // Audio elements
    const ukAudio = document.getElementById('uk-audio');
    const usAudio = document.getElementById('us-audio');
    
    // Buttons
    const loadWordsBtn = document.getElementById('load-words-btn');
    const resetProgressBtn = document.getElementById('reset-progress-btn');
    const prevWordBtn = document.getElementById('prev-word-btn');
    const flipCardBtn = document.getElementById('flip-card-btn');
    const nextWordBtn = document.getElementById('next-word-btn');
    const playUkBtn = document.getElementById('play-uk');
    const playUsBtn = document.getElementById('play-us');
    
    // Selects
    const levelSelect = document.getElementById('level-select');
    const topicSelect = document.getElementById('topic-select');
    const countSelect = document.getElementById('count-select');
    
    // State variables
    let vocabularyData = [];
    let currentWordIndex = 0;
    let userProgress = {
        learnedWords: [],
        lastStudied: null,
        streak: 0
    };
    
    // Level ranges mapping
    const levelRanges = {
        'beginner': { min: 1, max: 1000 },
        'intermediate': { min: 1001, max: 3000 },
        'advanced': { min: 3001, max: 6000 },
        'professional': { min: 6001, max: 100000 }
    };
    
    // Level display names
    const levelNames = {
        'beginner': '初级词汇',
        'intermediate': '中级词汇',
        'advanced': '高级词汇',
        'professional': '专业词汇'
    };
    
    // Initialize
    initApp();
    
    // Function to initialize the app
    function initApp() {
        // Load user progress from localStorage
        loadUserProgress();
        
        // Update stats display
        updateStatsDisplay();
        
        // Set up event listeners
        setupEventListeners();
        
        // Get URL parameters to see if we need to load specific words
        const urlParams = new URLSearchParams(window.location.search);
        const autoLoad = urlParams.get('autoload');
        
        if (autoLoad === 'true') {
            loadVocabularyData();
        }
    }
    
    // Function to set up event listeners
    function setupEventListeners() {
        // Load words button
        loadWordsBtn.addEventListener('click', loadVocabularyData);
        
        // Reset progress button
        resetProgressBtn.addEventListener('click', confirmResetProgress);
        
        // Navigation and flip buttons
        prevWordBtn.addEventListener('click', showPreviousWord);
        flipCardBtn.addEventListener('click', flipCard);
        nextWordBtn.addEventListener('click', showNextWord);
        
        // Card can also be flipped by clicking on it
        vocabCard.addEventListener('click', flipCard);
        
        // Pronunciation buttons
        playUkBtn.addEventListener('click', event => {
            event.stopPropagation(); // Prevent card flip
            playUkPronunciation();
        });
        
        playUsBtn.addEventListener('click', event => {
            event.stopPropagation(); // Prevent card flip
            playUsPronunciation();
        });
        
        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (mobileMenuToggle && mainNav) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenuToggle.classList.toggle('active');
                mainNav.classList.toggle('active');
            });
        }
    }
    
    // Function to load user progress from localStorage
    function loadUserProgress() {
        const savedProgress = localStorage.getItem('vocab_user_progress');
        
        if (savedProgress) {
            userProgress = JSON.parse(savedProgress);
            
            // Check if the streak should be maintained or reset
            const lastStudied = new Date(userProgress.lastStudied);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Reset streak if not studied yesterday or today
            if (lastStudied.toDateString() !== today.toDateString() && 
                lastStudied.toDateString() !== yesterday.toDateString()) {
                userProgress.streak = 0;
            }
        }
        
        // Update last studied date to today
        userProgress.lastStudied = new Date().toISOString();
        
        // If it's a new day and they're studying, increment streak
        const lastStudiedDate = new Date(userProgress.lastStudied).toDateString();
        const todayDate = new Date().toDateString();
        
        if (lastStudiedDate !== todayDate) {
            userProgress.streak++;
            userProgress.lastStudied = new Date().toISOString();
        }
        
        // Save the updated progress
        saveUserProgress();
    }
    
    // Function to save user progress to localStorage
    function saveUserProgress() {
        localStorage.setItem('vocab_user_progress', JSON.stringify(userProgress));
    }
    
    // Function to update stats display
    function updateStatsDisplay() {
        // Update learned words count
        learnedWordsDisplay.textContent = userProgress.learnedWords.length;
        
        // Update streak days
        daysStreakDisplay.textContent = userProgress.streak;
    }
    
    // Function to load vocabulary data
    async function loadVocabularyData() {
        try {
            // Show loading state
            loadingContainer.style.display = 'flex';
            vocabContent.style.display = 'none';
            
            // Get selected options
            const level = levelSelect.value;
            const topic = topicSelect.value;
            const count = parseInt(countSelect.value);
            
            // Get the min and max rank based on the selected level
            const { min, max } = levelRanges[level];
            
            try {
                // Fetch vocabulary data from the API
                const response = await fetch(`/api/db/query/vocabulary?min_rank=${min}&max_rank=${max}&count=${count}${topic !== 'all' ? '&topic=' + topic : ''}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch vocabulary data');
                }
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.length > 0) {
                    vocabularyData = data.data;
                    
                    // Update total words count
                    totalWordsDisplay.textContent = data.total || vocabularyData.length;
                    
                    // Initialize the display
                    currentWordIndex = 0;
                    updateWordDisplay();
                    generateWordList();
                    updateProgressDisplay();
                    
                    // Show the content
                    loadingContainer.style.display = 'none';
                    vocabContent.style.display = 'block';
                    
                    // Reset card to front
                    vocabCard.classList.remove('flipped');
                    
                    // Update display of current level
                    currentLevelDisplay.textContent = levelNames[level];
                } else {
                    throw new Error('No vocabulary data found');
                }
            } catch (error) {
                console.warn('Error fetching from API, using mock data instead:', error);
                
                // Use mock data for testing when API isn't available
                vocabularyData = getMockVocabularyData(level, count);
                
                // Update total words count (mock data)
                totalWordsDisplay.textContent = vocabularyData.length;
                
                // Initialize the display with mock data
                currentWordIndex = 0;
                updateWordDisplay();
                generateWordList();
                updateProgressDisplay();
                
                // Show the content
                loadingContainer.style.display = 'none';
                vocabContent.style.display = 'block';
                
                // Reset card to front
                vocabCard.classList.remove('flipped');
                
                // Update display of current level
                currentLevelDisplay.textContent = levelNames[level];
            }
        } catch (error) {
            console.error('Error loading vocabulary data:', error);
            
            // Show error state
            loadingContainer.style.display = 'none';
            vocabContent.style.display = 'block';
            
            // Display error message
            wordText.textContent = 'Failed to load words';
            wordTextBack.textContent = 'Failed to load words';
            translationsText.textContent = 'Error: ' + error.message;
            exampleList.innerHTML = '<li class="example-item">Error loading examples</li>';
        }
    }
    
    // Function to get mock vocabulary data for testing when API isn't available
    function getMockVocabularyData(level, count) {
        // Sample mock data
        const mockWords = [
            {
                Word_Rank: 1,
                Word: "the",
                Word_ID: "the_1",
                UK_Phonetic: "ðə",
                US_Phonetic: "ðə",
                Translations: "这，那，这个，那个（定冠词）",
                Example_Sentences: "The sky is blue.\nThe book is on the table."
            },
            {
                Word_Rank: 2,
                Word: "be",
                Word_ID: "be_2",
                UK_Phonetic: "biː",
                US_Phonetic: "biː",
                Translations: "是，在，存在",
                Example_Sentences: "She is happy.\nThey are at home."
            },
            {
                Word_Rank: 3,
                Word: "to",
                Word_ID: "to_3",
                UK_Phonetic: "tuː",
                US_Phonetic: "tuː",
                Translations: "到，往，向，对于",
                Example_Sentences: "I want to go home.\nHe gave a gift to her."
            },
            {
                Word_Rank: 4,
                Word: "of",
                Word_ID: "of_4",
                UK_Phonetic: "əv",
                US_Phonetic: "əv",
                Translations: "...的，属于",
                Example_Sentences: "The end of the story.\nA cup of coffee."
            },
            {
                Word_Rank: 5,
                Word: "and",
                Word_ID: "and_5",
                UK_Phonetic: "ænd",
                US_Phonetic: "ænd",
                Translations: "和，与，而且",
                Example_Sentences: "Bread and butter.\nShe laughed and danced."
            },
            {
                Word_Rank: 1001,
                Word: "quality",
                Word_ID: "quality_1001",
                UK_Phonetic: "ˈkwɒlɪti",
                US_Phonetic: "ˈkwɑːləti",
                Translations: "质量，品质；特质，特性",
                Example_Sentences: "The quality of the product is excellent.\nShe has many good qualities."
            },
            {
                Word_Rank: 1002,
                Word: "pressure",
                Word_ID: "pressure_1002",
                UK_Phonetic: "ˈpreʃə(r)",
                US_Phonetic: "ˈpreʃər",
                Translations: "压力，压迫；压强",
                Example_Sentences: "He's under a lot of pressure at work.\nThe water pressure is too low."
            },
            {
                Word_Rank: 3001,
                Word: "facilitate",
                Word_ID: "facilitate_3001",
                UK_Phonetic: "fəˈsɪlɪteɪt",
                US_Phonetic: "fəˈsɪləteɪt",
                Translations: "促进，促使；使便利",
                Example_Sentences: "The new system will facilitate communication between departments.\nWe need to facilitate the process."
            },
            {
                Word_Rank: 3002,
                Word: "contemplate",
                Word_ID: "contemplate_3002",
                UK_Phonetic: "ˈkɒntəmpleɪt",
                US_Phonetic: "ˈkɑːntəmpleɪt",
                Translations: "沉思，深思；注视，凝视",
                Example_Sentences: "She's contemplating a career change.\nHe sat contemplating the view."
            },
            {
                Word_Rank: 6001,
                Word: "ubiquitous",
                Word_ID: "ubiquitous_6001",
                UK_Phonetic: "juːˈbɪkwɪtəs",
                US_Phonetic: "juːˈbɪkwətəs",
                Translations: "无所不在的，普遍存在的",
                Example_Sentences: "Smartphones have become ubiquitous in modern society.\nPlastic pollution is now ubiquitous in the ocean."
            }
        ];
        
        // Filter based on level
        const { min, max } = levelRanges[level];
        const levelWords = mockWords.filter(word => 
            word.Word_Rank >= min && word.Word_Rank <= max
        );
        
        // Return the requested number of words or all if we don't have enough
        return levelWords.slice(0, Math.min(count, levelWords.length));
    }
    
    // Function to update the word display
    function updateWordDisplay() {
        if (vocabularyData.length === 0) {
            return;
        }
        
        const currentWord = vocabularyData[currentWordIndex];
        
        // Update front of card
        wordText.textContent = currentWord.Word || 'N/A';
        wordRank.textContent = currentWord.Word_Rank || 'N/A';
        ukPronunciation.textContent = currentWord.UK_Phonetic || '[N/A]';
        usPronunciation.textContent = currentWord.US_Phonetic || '[N/A]';
        
        // Update back of card
        wordTextBack.textContent = currentWord.Word || 'N/A';
        wordRankBack.textContent = currentWord.Word_Rank || 'N/A';
        translationsText.textContent = currentWord.Translations || 'No translation available';
        
        // Update examples
        updateExamplesList(currentWord);
        
        // Prepare pronunciation audio URLs
        prepareAudio(currentWord);
        
        // Update progress display
        updateProgressDisplay();
        
        // Update word list to highlight current word
        updateWordListHighlight();
    }
    
    // Function to update the examples list
    function updateExamplesList(wordData) {
        exampleList.innerHTML = '';
        
        if (wordData.Example_Sentences) {
            // Try to parse the example sentences if they're stored as JSON
            let examples = [];
            
            try {
                // Check if it's already an array or a JSON string
                if (Array.isArray(wordData.Example_Sentences)) {
                    examples = wordData.Example_Sentences;
                } else {
                    examples = JSON.parse(wordData.Example_Sentences);
                }
            } catch (e) {
                // If not JSON, split by line breaks or use as a single example
                examples = wordData.Example_Sentences.split(/\\n|\n/);
            }
            
            // Add each example to the list
            examples.forEach(example => {
                if (example && example.trim()) {
                    const li = document.createElement('li');
                    li.className = 'example-item';
                    li.textContent = example.trim();
                    exampleList.appendChild(li);
                }
            });
        } else {
            // No examples available
            const li = document.createElement('li');
            li.className = 'example-item';
            li.textContent = 'No example sentences available.';
            exampleList.appendChild(li);
        }
    }
    
    // Function to prepare audio elements
    function prepareAudio(wordData) {
        // Clear previous audio sources
        ukAudio.innerHTML = '';
        usAudio.innerHTML = '';
        
        // Check if we have audio URLs
        if (wordData.UK_Audio_URL) {
            ukAudio.src = wordData.UK_Audio_URL;
        }
        
        if (wordData.US_Audio_URL) {
            usAudio.src = wordData.US_Audio_URL;
        }
    }
    
    // Function to play UK pronunciation
    function playUkPronunciation() {
        // If we don't have direct audio, try text-to-speech
        if (!ukAudio.src) {
            const word = vocabularyData[currentWordIndex].Word;
            speakWord(word, 'uk');
        } else {
            ukAudio.play().catch(error => {
                console.error('Error playing UK audio:', error);
                // Fallback to TTS
                const word = vocabularyData[currentWordIndex].Word;
                speakWord(word, 'uk');
            });
        }
    }
    
    // Function to play US pronunciation
    function playUsPronunciation() {
        // If we don't have direct audio, try text-to-speech
        if (!usAudio.src) {
            const word = vocabularyData[currentWordIndex].Word;
            speakWord(word, 'us');
        } else {
            usAudio.play().catch(error => {
                console.error('Error playing US audio:', error);
                // Fallback to TTS
                const word = vocabularyData[currentWordIndex].Word;
                speakWord(word, 'us');
            });
        }
    }
    
    // Function to speak a word using browser's TTS
    function speakWord(word, accent) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            
            // Set language and voice based on accent
            utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
            
            // Try to find an appropriate voice
            const voices = speechSynthesis.getVoices();
            const voiceList = accent === 'uk' ? 
                voices.filter(voice => voice.lang.includes('en-GB')) : 
                voices.filter(voice => voice.lang.includes('en-US'));
            
            if (voiceList.length > 0) {
                utterance.voice = voiceList[0];
            }
            
            speechSynthesis.speak(utterance);
        }
    }
    
    // Function to generate the word list
    function generateWordList() {
        wordList.innerHTML = '';
        
        vocabularyData.forEach((word, index) => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.dataset.index = index;
            
            if (index === currentWordIndex) {
                wordItem.classList.add('active');
            }
            
            wordItem.innerHTML = `
                <div class="word-item-text">${word.Word}</div>
                <div class="word-item-translation">${word.Translations || 'No translation'}</div>
            `;
            
            wordItem.addEventListener('click', () => {
                currentWordIndex = index;
                updateWordDisplay();
                // Reset card to front
                vocabCard.classList.remove('flipped');
                
                // Smooth scroll to the card
                document.querySelector('.vocab-wrapper').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
            
            wordList.appendChild(wordItem);
        });
    }
    
    // Function to update the highlight in the word list
    function updateWordListHighlight() {
        const wordItems = wordList.querySelectorAll('.word-item');
        
        wordItems.forEach((item, index) => {
            if (index === currentWordIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Function to update progress display
    function updateProgressDisplay() {
        if (vocabularyData.length === 0) {
            return;
        }
        
        currentWordDisplay.textContent = currentWordIndex + 1;
        totalCardsDisplay.textContent = vocabularyData.length;
        
        const progressPercent = ((currentWordIndex + 1) / vocabularyData.length) * 100;
        progressBar.style.width = progressPercent + '%';
        
        // Update learned percent
        const learnedPercent = calculateLearnedPercent();
        learnedPercentDisplay.textContent = learnedPercent + '%';
    }
    
    // Function to calculate the percentage of learned words
    function calculateLearnedPercent() {
        if (vocabularyData.length === 0) return 0;
        
        // Count words that are in the learned list
        let learnedCount = 0;
        
        vocabularyData.forEach(word => {
            if (userProgress.learnedWords.includes(word.Word_ID || word.Word)) {
                learnedCount++;
            }
        });
        
        return Math.round((learnedCount / vocabularyData.length) * 100);
    }
    
    // Function to mark current word as learned
    function markCurrentWordAsLearned() {
        const currentWord = vocabularyData[currentWordIndex];
        const wordId = currentWord.Word_ID || currentWord.Word;
        
        if (!userProgress.learnedWords.includes(wordId)) {
            userProgress.learnedWords.push(wordId);
            saveUserProgress();
            updateStatsDisplay();
            updateProgressDisplay();
        }
    }
    
    // Function to show the previous word
    function showPreviousWord() {
        if (currentWordIndex > 0) {
            currentWordIndex--;
            updateWordDisplay();
            // Reset card to front
            vocabCard.classList.remove('flipped');
        }
    }
    
    // Function to show the next word
    function showNextWord() {
        // Mark current word as learned before moving to next
        markCurrentWordAsLearned();
        
        if (currentWordIndex < vocabularyData.length - 1) {
            currentWordIndex++;
            updateWordDisplay();
            // Reset card to front
            vocabCard.classList.remove('flipped');
        }
    }
    
    // Function to flip the vocabulary card
    function flipCard() {
        vocabCard.classList.toggle('flipped');
    }
    
    // Function to confirm reset progress
    function confirmResetProgress() {
        if (confirm('确定要重置学习进度吗？这将清除所有已学习的单词记录。')) {
            userProgress.learnedWords = [];
            saveUserProgress();
            updateStatsDisplay();
            updateProgressDisplay();
        }
    }
    
    // Initialize speech synthesis voices
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = function() {
            // This is just to initialize the voices list
            speechSynthesis.getVoices();
        };
    }
}); 