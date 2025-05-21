/**
 * PDF Reader Component using PDF.js
 * Supports features like page navigation, zooming, fullscreen mode, and responsive design.
 */

// We'll use a self-invoking function to avoid polluting the global namespace
(function() {
  // Load PDF.js library from CDN (latest stable version)
  const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111';
  
  // Track library loading status
  let isLibraryLoaded = false;
  let libraryLoadingError = null;
  
  // Load the PDF.js viewer CSS
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = `${PDFJS_CDN}/pdf_viewer.min.css`;
  document.head.appendChild(linkElement);
  
  // Load PDF.js scripts
  const scriptElement = document.createElement('script');
  scriptElement.src = `${PDFJS_CDN}/pdf.min.js`;
  document.head.appendChild(scriptElement);
  
  // Load the text layer builder
  const textLayerScript = document.createElement('script');
  textLayerScript.src = `${PDFJS_CDN}/pdf_viewer.min.js`;
  document.head.appendChild(textLayerScript);
  
  // Handle script loading error
  scriptElement.onerror = function(error) {
    console.error('Failed to load PDF.js library:', error);
    libraryLoadingError = 'Failed to load PDF.js library. Please check your internet connection and try again.';
    displayLibraryError();
  };
  
  textLayerScript.onerror = function(error) {
    console.error('Failed to load PDF.js viewer script:', error);
    // We can still use basic functionality without the text layer
    if (window.pdfjsLib) {
      initPDFViewer();
    }
  };
  
  // Initialize PDF.js after script is loaded
  scriptElement.onload = function() {
    if (!window.pdfjsLib) {
      console.error('PDF.js library loaded but pdfjsLib not defined.');
      libraryLoadingError = 'PDF.js library failed to initialize. Please try refreshing the page.';
      displayLibraryError();
      return;
    }
    
    try {
      // Set the worker source
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
      
      // Configure CMap URL for proper font rendering
      window.pdfjsLib.GlobalWorkerOptions.CMapReaderFactory = window.pdfjsLib.DOMCMapReaderFactory;
      window.pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = `${PDFJS_CDN}/standard_fonts/`;
      
      // Track successful loading
      isLibraryLoaded = true;
      
      // Initialize the PDF viewer component only after text layer is loaded
      textLayerScript.onload = function() {
        initPDFViewer();
      };
      
      // If text layer script is taking too long, go ahead with viewer initialization
      setTimeout(function() {
        if (!window.pdfjsLib.renderTextLayer) {
          console.warn('PDF.js text layer not loaded in time, proceeding with basic viewer');
          initPDFViewer();
        }
      }, 3000); // 3 second timeout
    } catch (error) {
      console.error('Error initializing PDF.js:', error);
      libraryLoadingError = 'Error initializing PDF.js library. Please try refreshing the page.';
      displayLibraryError();
    }
  };
  
  /**
   * Display library error message to the user
   */
  function displayLibraryError() {
    // Create error message element
    const errorContainer = document.createElement('div');
    errorContainer.style.padding = '20px';
    errorContainer.style.margin = '20px auto';
    errorContainer.style.maxWidth = '600px';
    errorContainer.style.backgroundColor = '#f8d7da';
    errorContainer.style.color = '#721c24';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.border = '1px solid #f5c6cb';
    errorContainer.style.textAlign = 'center';
    
    errorContainer.innerHTML = `
      <h3 style="margin-top: 0;">PDF Viewer Error</h3>
      <p>${libraryLoadingError || 'An error occurred while loading the PDF viewer.'}</p>
      <button style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
    `;
    
    // Add retry button functionality
    const retryButton = errorContainer.querySelector('button');
    retryButton.onclick = function() {
      window.location.reload();
    };
    
    // Find a suitable place to show the error
    const pdfContainer = document.getElementById('pdf-viewer-container');
    if (pdfContainer) {
      pdfContainer.innerHTML = '';
      pdfContainer.appendChild(errorContainer);
    } else {
      // If no container exists, append to body
      document.body.appendChild(errorContainer);
    }
  }
  
  // PDF Viewer Configuration
  const DEFAULT_SCALE = window.devicePixelRatio > 1 ? 1.2 : 1.0; // Higher default scale for high-DPI displays
  const ZOOM_STEP = 0.1;
  const MAX_SCALE = 3.0;
  const MIN_SCALE = 0.5;
  
  // Store current state
  let currentPdfDocument = null;
  let currentPage = 1;
  let currentScale = DEFAULT_SCALE;
  let totalPages = 0;
  let pdfContainer = null;
  let isFullscreen = false;
  let currentPdfUrl = null; // Track the current PDF URL
  
  // Highlight and note modes
  let isHighlightMode = false;
  let isNoteMode = false;
  let highlights = []; // Store highlight data
  let notes = []; // Store note data
  
  // Cache for lazy loading
  let pageCache = new Map();
  let pagePriority = [];
  let lazyLoadEnabled = true;
  let preloadPageCount = 2;
  let maxCacheSize = 10;
  
  /**
   * Initialize the PDF Viewer component
   */
  function initPDFViewer() {
    try {
      // Create or update PDF viewer container
      createPDFViewerUI();
      
      // Ensure the pdfContainer reference is set
      if (!pdfContainer) {
        pdfContainer = document.getElementById('pdf-viewer');
        if (!pdfContainer) {
          console.error("Could not find or create pdf-viewer element");
        }
      }
      
      // Setup event listeners
      setupEventListeners();
      
      return true; // Indicate successful initialization
    } catch (error) {
      console.error("Error initializing PDF viewer:", error);
      return false; // Indicate failed initialization
    }
  }
  
  /**
   * Create the PDF viewer UI elements
   */
  function createPDFViewerUI() {
    // Check if container already exists
    let container = document.getElementById('pdf-viewer-container');
    
    if (!container) {
      // Create new container if it doesn't exist
      container = document.createElement('div');
      container.id = 'pdf-viewer-container';
      container.classList.add('pdf-viewer-container');
      
      // Add the container to the document
      document.body.appendChild(container);
    }
    
    // Build the viewer UI
    container.innerHTML = `
      <div class="pdf-viewer-toolbar">
        <div class="pdf-controls">
          <button id="pdf-prev" title="Previous Page">◀</button>
          <span id="pdf-page-info">Page <span id="pdf-current-page">0</span> of <span id="pdf-total-pages">0</span></span>
          <button id="pdf-next" title="Next Page">▶</button>
          <div class="pdf-page-search">
            <input type="number" id="pdf-page-input" min="1" placeholder="Go to page" title="Go to page">
            <button id="pdf-go-to-page" title="Go to Page">Go</button>
          </div>
        </div>
        <div class="pdf-zoom-controls">
          <button id="pdf-zoom-out" title="Zoom Out">−</button>
          <span id="pdf-zoom-level">100%</span>
          <button id="pdf-zoom-in" title="Zoom In">+</button>
          <button id="pdf-fullscreen" title="Fullscreen">⛶</button>
          <button id="pdf-download" title="Download PDF"><i class="fas fa-download"></i></button>
          <button id="pdf-print" title="Print PDF"><i class="fas fa-print"></i></button>
          <button id="pdf-highlight" title="Highlight Text" class="pdf-highlight-btn"><i class="fas fa-highlighter"></i></button>
          <button id="pdf-note" title="Add Note" class="pdf-note-btn"><i class="fas fa-sticky-note"></i></button>
        </div>
      </div>
      <div id="pdf-viewer" class="pdf-viewer"></div>
      <div id="pdf-viewer-loader" class="pdf-viewer-loader">Loading PDF...</div>
      <div id="pdf-viewer-error" class="pdf-viewer-error">Failed to load PDF. Please try again.</div>
    `;
    
    // Add styles if not already included
    if (!document.getElementById('pdf-viewer-style')) {
      addPDFViewerStyles();
    }
    
    // Set the pdfContainer reference
    pdfContainer = document.getElementById('pdf-viewer');
  }
  
  /**
   * Add styles for PDF viewer
   */
  function addPDFViewerStyles() {
    const style = document.createElement('style');
    style.id = 'pdf-viewer-style';
    style.textContent = `
      .pdf-viewer-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 600px;
        max-width: 100%;
        margin: 0 auto;
        border: 1px solid #ccc;
        background-color: #f5f5f5;
        position: relative;
      }
      
      .pdf-viewer-container.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
      }
      
      .pdf-viewer-toolbar {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        background-color: #eee;
        border-bottom: 1px solid #ccc;
      }
      
      .pdf-controls, .pdf-zoom-controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .pdf-page-search {
        display: flex;
        align-items: center;
        margin-left: 15px;
      }
      
      .pdf-page-search input {
        width: 80px;
        padding: 4px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-right: 5px;
      }
      
      .pdf-page-search button {
        padding: 4px 8px;
        background-color: #4361ee;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .pdf-page-search button:hover {
        background-color: #3a56d4;
      }
      
      #pdf-download {
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 12px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      #pdf-download:hover {
        background-color: #45a049;
      }
      
      #pdf-print {
        background-color: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 12px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      #pdf-print:hover {
        background-color: #0b7dda;
      }
      
      .pdf-highlight-btn {
        background-color: #FFC107;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 12px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .pdf-highlight-btn:hover {
        background-color: #e5ac06;
      }
      
      .pdf-highlight-btn.active {
        background-color: #FF9800;
      }
      
      .pdf-note-btn {
        background-color: #9C27B0;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 12px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .pdf-note-btn:hover {
        background-color: #7B1FA2;
      }
      
      .pdf-note-btn.active {
        background-color: #6A1B9A;
      }
      
      .pdf-highlight {
        background-color: rgba(255, 193, 7, 0.4);
        border-radius: 2px;
        cursor: pointer;
      }
      
      .pdf-note-container {
        position: absolute;
        background-color: #FFEB3B;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 100;
        max-width: 300px;
      }
      
      .pdf-note-container textarea {
        width: 100%;
        min-height: 80px;
        border: 1px solid #ddd;
        padding: 5px;
        margin-bottom: 5px;
        font-family: inherit;
      }
      
      .pdf-note-container .note-controls {
        display: flex;
        justify-content: space-between;
      }
      
      .pdf-note-container button {
        padding: 3px 8px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      }
      
      .pdf-note-container .save-note {
        background-color: #4CAF50;
        color: white;
      }
      
      .pdf-note-container .delete-note {
        background-color: #F44336;
        color: white;
      }
      
      .pdf-note-marker {
        position: absolute;
        width: 20px;
        height: 20px;
        background-color: #FFEB3B;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #000;
      }
      
      .pdf-viewer {
        flex: 1;
        overflow: auto;
        background-color: #525659;
        position: relative;
        text-align: center;
        padding: 20px 0;
      }
      
      .pdf-page {
        margin: 10px auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        background-color: white;
        position: relative;
        display: inline-block;
        box-sizing: border-box;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
      
      .pdf-page canvas {
        display: block;
        image-rendering: -webkit-optimize-contrast; /* For Webkit browsers */
        image-rendering: crisp-edges; /* For Firefox */
        -ms-interpolation-mode: nearest-neighbor; /* For IE */
      }
      
      .pdf-page-textlayer {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        opacity: 0.2;
        line-height: 1.0;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .pdf-page-textlayer.active {
        color: transparent;
        opacity: 1;
      }
      
      .pdf-page-textlayer span {
        color: transparent;
        position: absolute;
        white-space: pre;
        cursor: text;
        transform-origin: 0% 0%;
      }
      
      .pdf-page-textlayer ::selection {
        background: rgba(67, 97, 238, 0.3);
      }
      
      .pdf-viewer-loader, .pdf-viewer-error {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background-color: rgba(255,255,255,0.9);
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: none;
      }
      
      .pdf-viewer-error {
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .pdf-viewer-toolbar {
          flex-direction: column;
          gap: 10px;
        }
        
        .pdf-controls, .pdf-zoom-controls {
          width: 100%;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .pdf-page-search {
          margin-left: 0;
          margin-top: 10px;
          width: 100%;
          justify-content: space-between;
        }
        
        .pdf-page-search input {
          flex: 1;
          margin-right: 5px;
        }
        
        .pdf-viewer-container {
          height: 80vh;
          max-height: 600px;
        }
        
        .pdf-zoom-controls button {
          padding: 6px 10px;
          font-size: 14px;
        }
        
        .pdf-note-container {
          max-width: 250px;
        }
      }
      
      @media (max-width: 480px) {
        .pdf-zoom-controls {
          justify-content: center;
        }
        
        .pdf-zoom-controls button {
          padding: 8px;
          margin: 2px;
        }
        
        #pdf-zoom-level {
          min-width: 50px;
          text-align: center;
        }
        
        .pdf-note-container {
          max-width: 200px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Setup event listeners for PDF viewer controls
   */
  function setupEventListeners() {
    // Page navigation
    const prevButton = document.getElementById('pdf-prev');
    const nextButton = document.getElementById('pdf-next');
    const zoomInButton = document.getElementById('pdf-zoom-in');
    const zoomOutButton = document.getElementById('pdf-zoom-out');
    const fullscreenButton = document.getElementById('pdf-fullscreen');
    const pageInput = document.getElementById('pdf-page-input');
    const goToPageButton = document.getElementById('pdf-go-to-page');
    const downloadButton = document.getElementById('pdf-download');
    const printButton = document.getElementById('pdf-print');
    const highlightButton = document.getElementById('pdf-highlight');
    const noteButton = document.getElementById('pdf-note');
    const viewer = document.getElementById('pdf-viewer');
    
    if (prevButton) prevButton.addEventListener('click', previousPage);
    if (nextButton) nextButton.addEventListener('click', nextPage);
    
    // Zoom controls
    if (zoomInButton) zoomInButton.addEventListener('click', zoomIn);
    if (zoomOutButton) zoomOutButton.addEventListener('click', zoomOut);
    
    // Fullscreen toggle
    if (fullscreenButton) fullscreenButton.addEventListener('click', toggleFullscreen);
    
    // Download button
    if (downloadButton) downloadButton.addEventListener('click', downloadPDF);
    
    // Print button
    if (printButton) printButton.addEventListener('click', printPDF);
    
    // Highlight button
    if (highlightButton) highlightButton.addEventListener('click', toggleHighlightMode);
    
    // Note button
    if (noteButton) noteButton.addEventListener('click', toggleNoteMode);
    
    // Page search
    if (pageInput && goToPageButton) {
      // Go to page when button is clicked
      goToPageButton.addEventListener('click', () => goToPage(pageInput.value));
      
      // Go to page when Enter key is pressed in the input field
      pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          goToPage(pageInput.value);
        }
      });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Touch swipe for mobile devices
    setupTouchControls();
    
    // Add text selection event handler for highlighting and notes
    if (viewer) {
      viewer.addEventListener('mouseup', handleTextSelection);
      viewer.addEventListener('click', handleViewerClick);
    }
  }
  
  /**
   * Setup touch controls for swipe navigation
   */
  function setupTouchControls() {
    let touchStartX = 0;
    const viewer = document.getElementById('pdf-viewer');
    
    if (!viewer) return; // Exit if viewer doesn't exist
    
    viewer.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    viewer.addEventListener('touchend', function(e) {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      // If the swipe distance is significant enough
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left, go to next page
          nextPage();
        } else {
          // Swipe right, go to previous page
          previousPage();
        }
      }
    }, { passive: true });
  }
  
  /**
   * Handle keyboard shortcuts
   */
  function handleKeyboardShortcuts(e) {
    if (!currentPdfDocument) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        previousPage();
        break;
      case 'ArrowRight':
        nextPage();
        break;
      case '+':
        zoomIn();
        break;
      case '-':
        zoomOut();
        break;
      case 'g':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const pageNum = prompt(`Enter page number (1-${totalPages}):`, currentPage);
          if (pageNum !== null) {
            goToPage(pageNum);
          }
        }
        break;
      case 'f':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          toggleFullscreen();
        }
        break;
      case 's':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          downloadPDF();
        }
        break;
    }
  }
  
  /**
   * Load a PDF file from URL
   * @param {string} url - URL of the PDF file
   * @param {Object} options - Additional options
   */
  function loadPDF(url, options = {}) {
    showLoader();
    
    // Store the PDF URL
    currentPdfUrl = url;
    
    // Reset annotations
    highlights = [];
    notes = [];
    
    // Load saved annotations for this PDF
    loadAnnotations();
    
    // Default options
    const defaultOptions = {
      initialPage: 1,
      scale: DEFAULT_SCALE,
      lazyLoad: true,          // Enable lazy loading by default
      preloadPages: 2,         // Number of pages to preload ahead/behind
      cacheSize: 10            // Maximum number of pages to keep in memory cache
    };
    
    // Merge default options with provided options
    const settings = { ...defaultOptions, ...options };
    
    // Update global settings
    lazyLoadEnabled = settings.lazyLoad;
    preloadPageCount = settings.preloadPages;
    maxCacheSize = settings.cacheSize;
    
    // Make sure pdfContainer exists
    if (!pdfContainer) {
      console.error("PDF container not found. Trying to initialize viewer again.");
      initPDFViewer();
      pdfContainer = document.getElementById('pdf-viewer');
      if (!pdfContainer) {
        console.error("Failed to initialize PDF viewer. Container element not found.");
        showError();
        return;
      }
    }
    
    // Clear the previous document if any
    if (currentPdfDocument) {
      currentPdfDocument.destroy();
      currentPdfDocument = null;
    }
    
    // Clear the container safely
    if (pdfContainer) {
      pdfContainer.innerHTML = '';
    }
    
    // Reset state
    currentPage = settings.initialPage;
    currentScale = settings.scale;
    pageCache = new Map();
    pagePriority = [];
    
    // Configure PDF.js options with CMap URL for proper font rendering
    const pdfOptions = {
      cMapUrl: `${PDFJS_CDN}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${PDFJS_CDN}/standard_fonts/`,
      disableFontFace: false,
      nativeImageDecoderSupport: 'display',
      useSystemFonts: true
    };
    
    // Load the PDF document
    window.pdfjsLib.getDocument({url: url, ...pdfOptions}).promise
      .then(function(pdfDoc) {
        currentPdfDocument = pdfDoc;
        totalPages = pdfDoc.numPages;
        
        // Update UI
        const totalPagesEl = document.getElementById('pdf-total-pages');
        if (totalPagesEl) totalPagesEl.textContent = totalPages;
        updatePageInfo();
        updateZoomLevel();
        
        // Setup lazy loading if enabled
        if (lazyLoadEnabled && pdfContainer) {
          try {
            // Add scroll event listener to load pages as they become visible
            pdfContainer.addEventListener('scroll', handleScroll);
            
            // Load initial page and preload adjacent pages
            preloadVisiblePages();
          } catch (error) {
            console.error("Error setting up lazy loading:", error);
            // Fallback to regular rendering
            renderPage(currentPage);
          }
        } else {
          // Render the initial page without lazy loading
          renderPage(currentPage);
        }
        
        hideLoader();
      })
      .catch(function(error) {
        console.error('Error loading PDF:', error);
        showError();
      });
  }
  
  /**
   * Handle scroll events for lazy loading pages
   */
  function handleScroll() {
    // Throttle the scroll event to avoid excessive page loading
    if (!this.scrollTimeout) {
      this.scrollTimeout = setTimeout(() => {
        // Calculate which pages are visible based on scroll position
        preloadVisiblePages();
        this.scrollTimeout = null;
      }, 200);
    }
  }
  
  /**
   * Preload visible and adjacent pages
   */
  function preloadVisiblePages() {
    if (!currentPdfDocument) return;
    
    // Start with current page and preload adjacent pages
    const pagesToLoad = [currentPage];
    
    // Add pages before current page
    for (let i = 1; i <= preloadPageCount; i++) {
      if (currentPage - i >= 1) {
        pagesToLoad.push(currentPage - i);
      }
    }
    
    // Add pages after current page
    for (let i = 1; i <= preloadPageCount; i++) {
      if (currentPage + i <= totalPages) {
        pagesToLoad.push(currentPage + i);
      }
    }
    
    // Load each page, prioritizing visible pages
    pagesToLoad.forEach(pageNum => {
      // Update page priority
      const priorityIndex = pagePriority.indexOf(pageNum);
      if (priorityIndex !== -1) {
        pagePriority.splice(priorityIndex, 1);
      }
      pagePriority.unshift(pageNum);
      
      // Load page if not already in cache
      if (!pageCache.has(pageNum)) {
        // Load page and add to cache
        currentPdfDocument.getPage(pageNum).then(page => {
          pageCache.set(pageNum, page);
          
          // If this is the current page, render it
          if (pageNum === currentPage) {
            renderPageFromCache(pageNum);
          }
          
          // Clean up cache if it exceeds the size limit
          if (pageCache.size > maxCacheSize) {
            // Remove least recently used page
            const lruPage = pagePriority.pop();
            pageCache.delete(lruPage);
          }
        });
      } else if (pageNum === currentPage) {
        // If current page is already in cache, render it
        renderPageFromCache(pageNum);
      }
    });
  }
  
  /**
   * Render a page from the cache
   * @param {number} pageNum - Page number to render
   */
  function renderPageFromCache(pageNum) {
    if (!pageCache.has(pageNum)) return;
    
    const page = pageCache.get(pageNum);
    renderPageContent(page);
  }
  
  /**
   * Render the content of a specific page
   * @param {Object} page - PDF.js page object
   */
  function renderPageContent(page) {
    showLoader();
    
    // Check if pdfContainer exists
    if (!pdfContainer) {
      console.error("PDF container not found. Cannot render content.");
      showError();
      return;
    }
    
    // Clear the container
    pdfContainer.innerHTML = '';
    
    // Create a container for this page
    const pageContainer = document.createElement('div');
    pageContainer.className = 'pdf-page';
    pageContainer.dataset.pageNumber = page.pageNumber;
    pdfContainer.appendChild(pageContainer);
    
    // Create a canvas for the page
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    pageContainer.appendChild(canvas);
    
    // Get device pixel ratio for high-DPI displays (like Retina)
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Calculate viewport based on scale
    const viewport = page.getViewport({ 
      scale: currentScale
    });
    
    // Set display size (css pixels)
    const displayWidth = viewport.width / devicePixelRatio;
    const displayHeight = viewport.height / devicePixelRatio;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    const scaleFactor = devicePixelRatio;
    canvas.width = Math.floor(viewport.width * scaleFactor);
    canvas.height = Math.floor(viewport.height * scaleFactor);
    
    // Scale context to ensure correct drawing operations
    context.scale(scaleFactor, scaleFactor);
    
    // Improve image rendering quality
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    
    // Render the page with appropriate quality settings
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      enableWebGL: true,
      renderInteractiveForms: true,
      // Use fine-grained render parameters for better quality
      transform: devicePixelRatio > 1 ? [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0] : null,
    };
    
    // Create a div for the text layer
    const textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'pdf-page-textlayer';
    pageContainer.appendChild(textLayerDiv);
    
    // Scale the text layer correctly to match the canvas
    textLayerDiv.style.width = `${displayWidth}px`;
    textLayerDiv.style.height = `${displayHeight}px`;
    
    // Enable text selection by rendering the text layer
    page.render(renderContext).promise.then(function() {
      // Get the text content from the page
      return page.getTextContent();
    }).then(function(textContent) {
      // Enable text layer only if PDF.js TextLayerBuilder is available
      if (textContent && window.pdfjsLib && window.pdfjsLib.renderTextLayer) {
        try {
          // Render text layer with better resolution
          window.pdfjsLib.renderTextLayer({
            textContent: textContent,
            container: textLayerDiv,
            viewport: viewport,
            textDivs: [],
            enhanceTextSelection: true
          });
          
          // Add active class to make text selectable
          textLayerDiv.classList.add('active');
        } catch (error) {
          console.error("Error rendering text layer:", error);
        }
      }
      
      // Render existing highlights and notes for this page
      renderPageAnnotations(page.pageNumber, viewport, textLayerDiv);
      
      hideLoader();
      updatePageInfo();
    }).catch(function(error) {
      console.error("Error rendering page content:", error);
      hideLoader();
    });
  }
  
  /**
   * Render a specific page
   * @param {number} pageNumber - Page number to render
   */
  function renderPage(pageNumber) {
    if (!currentPdfDocument) return;
    
    // If lazy loading is enabled, use the cache system
    if (lazyLoadEnabled) {
      // Check if the page is in cache
      if (pageCache.has(pageNumber)) {
        renderPageFromCache(pageNumber);
      } else {
        // Load and render the page
        showLoader();
        currentPdfDocument.getPage(pageNumber).then(page => {
          // Add to cache
          pageCache.set(pageNumber, page);
          
          // Update priority
          const priorityIndex = pagePriority.indexOf(pageNumber);
          if (priorityIndex !== -1) {
            pagePriority.splice(priorityIndex, 1);
          }
          pagePriority.unshift(pageNumber);
          
          // Render the page
          renderPageContent(page);
          
          // Clean up cache if needed
          if (pageCache.size > maxCacheSize) {
            const lruPage = pagePriority.pop();
            pageCache.delete(lruPage);
          }
        });
      }
    } else {
      // Direct rendering without cache
      showLoader();
      currentPdfDocument.getPage(pageNumber).then(function(page) {
        renderPageContent(page);
      });
    }
  }
  
  /**
   * Go to the previous page
   */
  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
    }
  }
  
  /**
   * Go to the next page
   */
  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
    }
  }
  
  /**
   * Zoom in
   */
  function zoomIn() {
    if (currentScale < MAX_SCALE) {
      currentScale += ZOOM_STEP;
      renderPage(currentPage);
      updateZoomLevel();
    }
  }
  
  /**
   * Zoom out
   */
  function zoomOut() {
    if (currentScale > MIN_SCALE) {
      currentScale -= ZOOM_STEP;
      renderPage(currentPage);
      updateZoomLevel();
    }
  }
  
  /**
   * Toggle fullscreen mode
   */
  function toggleFullscreen() {
    const container = document.getElementById('pdf-viewer-container');
    const fullscreenButton = document.getElementById('pdf-fullscreen');
    
    if (!container) return;
    
    isFullscreen = !isFullscreen;
    
    if (isFullscreen) {
      container.classList.add('fullscreen');
      if (fullscreenButton) fullscreenButton.textContent = '⤢';
    } else {
      container.classList.remove('fullscreen');
      if (fullscreenButton) fullscreenButton.textContent = '⛶';
    }
    
    // Re-render the page to fit the new container size
    renderPage(currentPage);
  }
  
  /**
   * Update the page information display
   */
  function updatePageInfo() {
    const currentPageEl = document.getElementById('pdf-current-page');
    if (currentPageEl) {
      currentPageEl.textContent = currentPage;
    }
  }
  
  /**
   * Update the zoom level display
   */
  function updateZoomLevel() {
    const zoomLevelEl = document.getElementById('pdf-zoom-level');
    if (zoomLevelEl) {
      const zoomPercent = Math.round(currentScale * 100);
      zoomLevelEl.textContent = `${zoomPercent}%`;
    }
  }
  
  /**
   * Show the loader
   */
  function showLoader() {
    const loader = document.getElementById('pdf-viewer-loader');
    const error = document.getElementById('pdf-viewer-error');
    
    if (loader) loader.style.display = 'block';
    if (error) error.style.display = 'none';
  }
  
  /**
   * Hide the loader
   */
  function hideLoader() {
    const loader = document.getElementById('pdf-viewer-loader');
    if (loader) loader.style.display = 'none';
  }
  
  /**
   * Show error message
   */
  function showError() {
    const loader = document.getElementById('pdf-viewer-loader');
    const error = document.getElementById('pdf-viewer-error');
    
    if (loader) loader.style.display = 'none';
    if (error) error.style.display = 'block';
  }
  
  /**
   * Go to a specific page
   * @param {number|string} pageNum - Page number to go to
   */
  function goToPage(pageNum) {
    // Convert input to a number
    const targetPage = parseInt(pageNum, 10);
    
    // Validate page number
    if (isNaN(targetPage) || targetPage < 1 || targetPage > totalPages) {
      alert(`Please enter a valid page number between 1 and ${totalPages}`);
      return;
    }
    
    // Go to the specified page if it's different from current page
    if (targetPage !== currentPage) {
      currentPage = targetPage;
      renderPage(currentPage);
      
      // Clear the input field
      const pageInput = document.getElementById('pdf-page-input');
      if (pageInput) {
        pageInput.value = '';
      }
    }
  }
  
  /**
   * Download the current PDF file
   */
  function downloadPDF() {
    if (!currentPdfDocument || !currentPdfUrl) {
      alert('No PDF is currently loaded.');
      return;
    }
    
    try {
      // Create a hidden anchor element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = currentPdfUrl;
      
      // Extract the filename from the URL
      const filename = currentPdfUrl.split('/').pop();
      downloadLink.download = filename;
      
      // Append, trigger click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      console.log('PDF download initiated:', filename);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again or download directly from the source.');
    }
  }
  
  /**
   * Toggle highlight mode
   */
  function toggleHighlightMode() {
    isHighlightMode = !isHighlightMode;
    isNoteMode = false; // Turn off note mode
    
    // Update button states
    const highlightButton = document.getElementById('pdf-highlight');
    const noteButton = document.getElementById('pdf-note');
    
    if (highlightButton) {
      if (isHighlightMode) {
        highlightButton.classList.add('active');
      } else {
        highlightButton.classList.remove('active');
      }
    }
    
    if (noteButton) {
      noteButton.classList.remove('active');
    }
    
    // Update cursor style
    if (pdfContainer) {
      if (isHighlightMode) {
        pdfContainer.style.cursor = 'text';
      } else {
        pdfContainer.style.cursor = 'auto';
      }
    }
  }
  
  /**
   * Toggle note mode
   */
  function toggleNoteMode() {
    isNoteMode = !isNoteMode;
    isHighlightMode = false; // Turn off highlight mode
    
    // Update button states
    const highlightButton = document.getElementById('pdf-highlight');
    const noteButton = document.getElementById('pdf-note');
    
    if (noteButton) {
      if (isNoteMode) {
        noteButton.classList.add('active');
      } else {
        noteButton.classList.remove('active');
      }
    }
    
    if (highlightButton) {
      highlightButton.classList.remove('active');
    }
    
    // Update cursor style
    if (pdfContainer) {
      if (isNoteMode) {
        pdfContainer.style.cursor = 'text';
      } else {
        pdfContainer.style.cursor = 'auto';
      }
    }
  }
  
  /**
   * Handle text selection for highlighting or adding notes
   */
  function handleTextSelection(e) {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;
    
    const range = selection.getRangeAt(0);
    const textLayerElements = document.querySelectorAll('.pdf-page-textlayer');
    
    // Check if selection is within a text layer
    let textLayer = null;
    let pageNumber = null;
    
    for (const el of textLayerElements) {
      if (el.contains(range.commonAncestorContainer)) {
        textLayer = el;
        const pageEl = el.closest('.pdf-page');
        if (pageEl) {
          pageNumber = parseInt(pageEl.dataset.pageNumber, 10);
        }
        break;
      }
    }
    
    if (!textLayer || !pageNumber) return;
    
    if (isHighlightMode) {
      addHighlight(range, textLayer, pageNumber);
      selection.removeAllRanges(); // Clear selection after highlighting
    } else if (isNoteMode) {
      addNoteToSelection(range, textLayer, pageNumber);
      selection.removeAllRanges(); // Clear selection after adding note
    }
  }
  
  /**
   * Handle clicks on viewer (for closing notes, etc.)
   */
  function handleViewerClick(e) {
    // Close all open note editors
    const noteEditors = document.querySelectorAll('.pdf-note-container');
    noteEditors.forEach(editor => {
      // Don't close if clicking inside a note editor
      if (!editor.contains(e.target)) {
        editor.remove();
      }
    });
    
    // Handle note marker clicks
    if (e.target.classList.contains('pdf-note-marker')) {
      const noteId = e.target.dataset.noteId;
      if (noteId) {
        showNoteContent(noteId, e.target);
      }
    }
  }
  
  /**
   * Add highlight to selected text
   */
  function addHighlight(range, textLayer, pageNumber) {
    const highlightId = `highlight-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      // Create highlight element
      const highlight = document.createElement('div');
      highlight.className = 'pdf-highlight';
      highlight.id = highlightId;
      
      // Get the client rects of the range
      const rects = Array.from(range.getClientRects());
      
      // Convert client rects to positions relative to the text layer
      const textLayerRect = textLayer.getBoundingClientRect();
      
      // Store highlight data for persistence
      const highlightData = {
        id: highlightId,
        pageNumber: pageNumber,
        rects: rects.map(rect => ({
          left: (rect.left - textLayerRect.left) / textLayerRect.width,
          top: (rect.top - textLayerRect.top) / textLayerRect.height,
          width: rect.width / textLayerRect.width,
          height: rect.height / textLayerRect.height
        })),
        text: range.toString(),
        timestamp: new Date().toISOString()
      };
      
      highlights.push(highlightData);
      
      // Render the highlight
      renderHighlight(highlightData, textLayer);
      
      console.log('Highlight added:', highlightData);
      saveAnnotations();
      
    } catch (error) {
      console.error('Error adding highlight:', error);
    }
  }
  
  /**
   * Render a highlight on the page
   */
  function renderHighlight(highlightData, textLayer) {
    const textLayerRect = textLayer.getBoundingClientRect();
    
    highlightData.rects.forEach((rect, index) => {
      const highlightEl = document.createElement('div');
      highlightEl.className = 'pdf-highlight';
      highlightEl.dataset.highlightId = highlightData.id;
      highlightEl.dataset.highlightIndex = index;
      
      // Position and size the highlight based on stored percentages
      highlightEl.style.position = 'absolute';
      highlightEl.style.left = `${rect.left * 100}%`;
      highlightEl.style.top = `${rect.top * 100}%`;
      highlightEl.style.width = `${rect.width * 100}%`;
      highlightEl.style.height = `${rect.height * 100}%`;
      
      // Add a tooltip with the highlighted text
      highlightEl.title = highlightData.text;
      
      // Add click handler to remove highlight
      highlightEl.addEventListener('click', function(e) {
        if (e.ctrlKey || e.metaKey) {
          removeHighlight(highlightData.id);
        }
      });
      
      textLayer.appendChild(highlightEl);
    });
  }
  
  /**
   * Remove a highlight
   */
  function removeHighlight(highlightId) {
    // Remove from DOM
    document.querySelectorAll(`[data-highlight-id="${highlightId}"]`).forEach(el => {
      el.remove();
    });
    
    // Remove from data store
    highlights = highlights.filter(h => h.id !== highlightId);
    
    // Save updated annotations
    saveAnnotations();
  }
  
  /**
   * Add a note to the selected text
   */
  function addNoteToSelection(range, textLayer, pageNumber) {
    const noteId = `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      // Get position for the note marker
      const rects = Array.from(range.getClientRects());
      if (rects.length === 0) return;
      
      const textLayerRect = textLayer.getBoundingClientRect();
      
      // Use the first rect for the note marker position
      const rect = rects[0];
      
      // Store note data
      const noteData = {
        id: noteId,
        pageNumber: pageNumber,
        position: {
          left: (rect.left - textLayerRect.left) / textLayerRect.width,
          top: (rect.top - textLayerRect.top) / textLayerRect.height
        },
        text: range.toString(),
        content: '',
        timestamp: new Date().toISOString()
      };
      
      // Add to notes array
      notes.push(noteData);
      
      // Create note marker
      renderNoteMarker(noteData, textLayer);
      
      // Show note editor
      const marker = document.querySelector(`[data-note-id="${noteId}"]`);
      if (marker) {
        showNoteEditor(noteData, marker);
      }
      
      console.log('Note added:', noteData);
      saveAnnotations();
      
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }
  
  /**
   * Render a note marker
   */
  function renderNoteMarker(noteData, textLayer) {
    const marker = document.createElement('div');
    marker.className = 'pdf-note-marker';
    marker.dataset.noteId = noteData.id;
    marker.innerHTML = '<i class="fas fa-sticky-note"></i>';
    marker.title = noteData.text;
    
    // Position the marker
    marker.style.position = 'absolute';
    marker.style.left = `${noteData.position.left * 100}%`;
    marker.style.top = `${noteData.position.top * 100}%`;
    
    textLayer.appendChild(marker);
  }
  
  /**
   * Show note editor
   */
  function showNoteEditor(noteData, markerElement) {
    // Close any open note editors
    document.querySelectorAll('.pdf-note-container').forEach(el => el.remove());
    
    // Create note editor container
    const noteContainer = document.createElement('div');
    noteContainer.className = 'pdf-note-container';
    noteContainer.dataset.noteId = noteData.id;
    
    const markerRect = markerElement.getBoundingClientRect();
    const viewerRect = pdfContainer.getBoundingClientRect();
    
    // Position the note container next to the marker
    const left = markerRect.right - viewerRect.left + 10;
    const top = markerRect.top - viewerRect.top;
    
    noteContainer.style.position = 'absolute';
    noteContainer.style.left = `${left}px`;
    noteContainer.style.top = `${top}px`;
    
    // Create editor content
    noteContainer.innerHTML = `
      <p><strong>Note for:</strong> ${noteData.text.length > 50 ? noteData.text.substring(0, 50) + '...' : noteData.text}</p>
      <textarea placeholder="Type your note here...">${noteData.content || ''}</textarea>
      <div class="note-controls">
        <button class="save-note">Save</button>
        <button class="delete-note">Delete</button>
      </div>
    `;
    
    // Add event listeners
    const saveButton = noteContainer.querySelector('.save-note');
    const deleteButton = noteContainer.querySelector('.delete-note');
    const textarea = noteContainer.querySelector('textarea');
    
    saveButton.addEventListener('click', function() {
      const updatedContent = textarea.value.trim();
      saveNoteContent(noteData.id, updatedContent);
      noteContainer.remove();
    });
    
    deleteButton.addEventListener('click', function() {
      removeNote(noteData.id);
      noteContainer.remove();
    });
    
    // Auto-focus the textarea
    textarea.focus();
    
    // Add the note container to the viewer
    pdfContainer.appendChild(noteContainer);
  }
  
  /**
   * Show note content (when clicking on a note marker)
   */
  function showNoteContent(noteId, markerElement) {
    const noteData = notes.find(n => n.id === noteId);
    if (!noteData) return;
    
    showNoteEditor(noteData, markerElement);
  }
  
  /**
   * Save note content
   */
  function saveNoteContent(noteId, content) {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      notes[noteIndex].content = content;
      saveAnnotations();
    }
  }
  
  /**
   * Remove a note
   */
  function removeNote(noteId) {
    // Remove from DOM
    document.querySelectorAll(`[data-note-id="${noteId}"]`).forEach(el => {
      el.remove();
    });
    
    // Remove from data store
    notes = notes.filter(n => n.id !== noteId);
    
    // Save updated annotations
    saveAnnotations();
  }
  
  /**
   * Print the current PDF
   */
  function printPDF() {
    if (!currentPdfDocument || !currentPdfUrl) {
      alert('No PDF is currently loaded.');
      return;
    }
    
    try {
      // Create an iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      iframe.onload = function() {
        try {
          // Wait for iframe to load, then start printing
          setTimeout(function() {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Remove the iframe after print dialog is closed
            setTimeout(function() {
              document.body.removeChild(iframe);
            }, 1000);
          }, 1000); // Give PDF time to load
        } catch (err) {
          console.error('Error during print operation:', err);
          document.body.removeChild(iframe);
          // Fallback - open the PDF in a new tab
          window.open(currentPdfUrl, '_blank');
          alert('Print dialog could not be opened automatically. A new tab has been opened with the PDF instead.');
        }
      };
      
      // Set the iframe source to the PDF URL
      iframe.src = currentPdfUrl;
    } catch (error) {
      console.error('Error setting up print operation:', error);
      // Fallback - open the PDF in a new tab
      window.open(currentPdfUrl, '_blank');
      alert('Print operation failed. A new tab has been opened with the PDF instead.');
    }
  }
  
  /**
   * Render existing annotations for a page
   */
  function renderPageAnnotations(pageNumber, viewport, textLayer) {
    // Render highlights for this page
    highlights
      .filter(h => h.pageNumber === pageNumber)
      .forEach(highlight => {
        renderHighlight(highlight, textLayer);
      });
    
    // Render note markers for this page
    notes
      .filter(n => n.pageNumber === pageNumber)
      .forEach(note => {
        renderNoteMarker(note, textLayer);
      });
  }
  
  /**
   * Save annotations to localStorage
   */
  function saveAnnotations() {
    try {
      if (!currentPdfUrl) return;
      
      // Create a key based on the PDF URL
      const storageKey = `pdf-annotations-${btoa(currentPdfUrl).replace(/[=+/]/g, '')}`;
      
      const annotationData = {
        highlights: highlights,
        notes: notes,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(annotationData));
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  }
  
  /**
   * Load annotations from localStorage
   */
  function loadAnnotations() {
    try {
      if (!currentPdfUrl) return;
      
      // Create a key based on the PDF URL
      const storageKey = `pdf-annotations-${btoa(currentPdfUrl).replace(/[=+/]/g, '')}`;
      
      const savedData = localStorage.getItem(storageKey);
      if (!savedData) return;
      
      const annotationData = JSON.parse(savedData);
      
      // Set the annotations
      highlights = annotationData.highlights || [];
      notes = annotationData.notes || [];
      
      console.log('Loaded annotations:', highlights.length, 'highlights,', notes.length, 'notes');
    } catch (error) {
      console.error('Error loading annotations:', error);
    }
  }

  // Expose the PDF reader functions to the global scope
  window.PDFReader = {
    loadPDF,
    previousPage,
    nextPage,
    zoomIn,
    zoomOut,
    toggleFullscreen,
    goToPage,
    downloadPDF,
    printPDF,
    toggleHighlightMode,
    toggleNoteMode
  };
})(); 