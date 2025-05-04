// quote.js - Handles the quote functionality on the home page

document.addEventListener('DOMContentLoaded', () => {
    // Initialize quotes
    loadQuotes();
    
    // Add event listener for type selection
    const typeSelect = document.getElementById('quote-type-select');
    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
            filterQuotesByType(e.target.value);
        });
    }

    // Add click handler for quote card
    const quoteCard = document.querySelector('.quote-card');
    let isFlipping = false;

    if (quoteCard) {
        quoteCard.addEventListener('click', function() {
            if (isFlipping) return;
            isFlipping = true;

            this.classList.add('flipped');
            
            setTimeout(() => {
                showRandomQuote();
                this.classList.remove('flipped');
                setTimeout(() => {
                    isFlipping = false;
                }, 800);
            }, 500);
        });
    }
});

// Global variables
let quotes = [];
let quoteTypes = [];
let currentQuoteIndex = -1;
let filteredQuotes = [];

// Sample default quotes in case API fails
const defaultQuotes = [
    {
        Chinese: "学而不思则罔，思而不学则殆。",
        English: "Learning without thought is labor lost; thought without learning is perilous.",
        Type: "学习"
    },
    {
        Chinese: "知之为知之，不知为不知，是知也。",
        English: "To know what you know and what you do not know, that is true knowledge.",
        Type: "知识"
    },
    {
        Chinese: "不积跬步，无以至千里；不积小流，无以成江海。",
        English: "A journey of a thousand miles begins with a single step.",
        Type: "努力"
    }
];

// Load quotes from API or use defaults
async function loadQuotes() {
    try {
        const response = await fetch('/api/db/query/quote');
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            quotes = result.data;
        } else {
            console.log('Using default quotes as API returned no data');
            quotes = defaultQuotes;
        }
        
        filteredQuotes = [...quotes];
        
        // Extract unique quote types
        quoteTypes = [...new Set(quotes.map(quote => quote.Type))].filter(Boolean);
        
        // Populate the dropdown
        const typeSelect = document.getElementById('quote-type-select');
        if (typeSelect) {
            typeSelect.innerHTML = '';
            
            // Add all option
            const allOption = document.createElement('option');
            allOption.value = "";
            allOption.textContent = "所有类型";
            typeSelect.appendChild(allOption);
            
            // Add specific type options
            if (quoteTypes.length > 0) {
                quoteTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    typeSelect.appendChild(option);
                });
            }
        }
        
        // Show an initial quote
        showRandomQuote();
    } catch (error) {
        console.error('Error loading quotes:', error);
        quotes = defaultQuotes;
        filteredQuotes = [...quotes];
        
        // Extract types from default quotes
        quoteTypes = [...new Set(quotes.map(quote => quote.Type))].filter(Boolean);
        
        // Populate dropdown with default types
        const typeSelect = document.getElementById('quote-type-select');
        if (typeSelect) {
            typeSelect.innerHTML = '';
            
            // Add all option
            const allOption = document.createElement('option');
            allOption.value = "";
            allOption.textContent = "所有类型";
            typeSelect.appendChild(allOption);
            
            // Add specific type options
            quoteTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
        }
        
        // Show a default quote
        showRandomQuote();
    }
}

// Filter quotes by type
function filterQuotesByType(type) {
    if (!type) {
        filteredQuotes = [...quotes];
    } else {
        filteredQuotes = quotes.filter(quote => quote.Type === type);
    }
    
    // Reset current index and show a quote from filtered list
    currentQuoteIndex = -1;
    showRandomQuote();
}

// Show a random quote
function showRandomQuote() {
    if (filteredQuotes.length === 0) return;

    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * filteredQuotes.length);
    } while (newIndex === currentQuoteIndex && filteredQuotes.length > 1);

    currentQuoteIndex = newIndex;
    const quote = filteredQuotes[currentQuoteIndex];

    const chineseQuoteEl = document.querySelector('.quote-card-front .chinese-quote');
    const englishQuoteEl = document.querySelector('.quote-card-front .english-quote');
    
    if (chineseQuoteEl) {
        chineseQuoteEl.textContent = quote.Chinese || '';
    }
    
    if (englishQuoteEl) {
        englishQuoteEl.textContent = quote.English || '';
    }
} 