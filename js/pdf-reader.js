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
      
      // Disable CMap to avoid CORS issues
      window.pdfjsLib.GlobalWorkerOptions.cMapUrl = null;
      window.pdfjsLib.GlobalWorkerOptions.cMapPacked = false;
      
      // Disable standard fonts to avoid CORS issues
      window.pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = null;
      
      // Use system fonts and disable web fonts to avoid CORS
      window.pdfjsLib.GlobalWorkerOptions.useSystemFonts = true;
      window.pdfjsLib.GlobalWorkerOptions.disableFontFace = true;
      
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
  const DEFAULT_SCALE = 2.0; // Set to 200% zoom by default
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
  let isHighQualityMode = false; // Default to SD quality rendering
  
  // Cache for lazy loading
  let pageCache = new Map();
  let pagePriority = [];
  let lazyLoadEnabled = true;
  let preloadPageCount = 2;
  let maxCacheSize = 10;
  
  // State management for PDF viewer
  let pdfViewerInitialized = false;
  let initializationInProgress = false;
  let pendingLoadRequests = [];
  
  /**
   * Ensure DOM is ready before proceeding
   */
  function waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }
  
  /**
   * Wait for an element to exist in the DOM with retry mechanism
   */
  function waitForElement(selector, maxAttempts = 10, delay = 100) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      function checkElement() {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error(`Element ${selector} not found after ${maxAttempts} attempts`));
          return;
        }
        
        setTimeout(checkElement, delay * Math.pow(1.5, attempts)); // Exponential backoff
      }
      
      checkElement();
    });
  }
  
  /**
   * Robust PDF viewer initialization with retry mechanism
   */
  async function ensurePDFViewerInitialized() {
    // If already initialized, return immediately
    if (pdfViewerInitialized && pdfContainer && document.getElementById('pdf-viewer')) {
      return true;
    }
    
    // If initialization is in progress, wait for it
    if (initializationInProgress) {
      return new Promise((resolve) => {
        const checkInit = () => {
          if (pdfViewerInitialized) {
            resolve(true);
          } else if (!initializationInProgress) {
            resolve(false);
          } else {
            setTimeout(checkInit, 50);
          }
        };
        checkInit();
      });
    }
    
    initializationInProgress = true;
    
    try {
      // Wait for DOM to be ready
      await waitForDOM();
      
      // Try to initialize the PDF viewer
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!success && attempts < maxAttempts) {
        attempts++;
        console.log(`PDF viewer initialization attempt ${attempts}/${maxAttempts}`);
        
        try {
          // Check if we have a container to work with
          let targetContainer = document.querySelector('.pdf-container') || 
                               document.querySelector('#pdf-viewer-container') ||
                               document.body;
          
          // Create PDF viewer UI
          if (targetContainer.classList.contains('pdf-container')) {
            createPDFViewerInContainer(targetContainer);
          } else {
            createPDFViewerUI();
          }
          
          // Wait for the PDF viewer element to be available
          await waitForElement('#pdf-viewer', 5, 100);
          
          // Set pdfContainer reference
          pdfContainer = document.getElementById('pdf-viewer');
          
          if (!pdfContainer) {
            throw new Error('PDF viewer element not found after creation');
          }
          
          // Setup event listeners
          setupEventListeners();
          
          // Mark as initialized
          pdfViewerInitialized = true;
          success = true;
          
          console.log('PDF viewer initialized successfully');
          
        } catch (error) {
          console.warn(`PDF viewer initialization attempt ${attempts} failed:`, error);
          
          if (attempts < maxAttempts) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
          } else {
            throw error;
          }
        }
      }
      
      return success;
      
    } catch (error) {
      console.error('Failed to initialize PDF viewer after all attempts:', error);
      return false;
    } finally {
      initializationInProgress = false;
    }
  }
  
  /**
   * Initialize the PDF Viewer component
   */
  async function initPDFViewer() {
    console.log("Legacy initPDFViewer called, using new robust initialization");
    return await ensurePDFViewerInitialized();
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
          <span id="pdf-quality-indicator" title="Standard Definition" style="background-color: #9c27b0; color: white; border: none; border-radius: 4px; padding: 4px 8px; opacity: 0.7; font-size: 12px;">SD</span>
          <button id="pdf-fullscreen" title="Fullscreen">⛶</button>
          <button id="pdf-download" title="Download PDF"><i class="fas fa-download"></i></button>
        </div>
      </div>
      <div id="pdf-viewer" class="pdf-viewer"></div>
      <div id="pdf-viewer-loader" class="pdf-viewer-loader"></div>
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
   * Create the PDF viewer inside an existing container
   */
  function createPDFViewerInContainer(container) {
    // Clear existing content
    container.innerHTML = '';
    
    // Create the PDF viewer container
    const viewerContainer = document.createElement('div');
    viewerContainer.id = 'pdf-viewer-container';
    viewerContainer.classList.add('pdf-viewer-container');
    
    // Build the viewer UI
    viewerContainer.innerHTML = `
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
          <span id="pdf-quality-indicator" title="Standard Definition" style="background-color: #9c27b0; color: white; border: none; border-radius: 4px; padding: 4px 8px; opacity: 0.7; font-size: 12px;">SD</span>
          <button id="pdf-fullscreen" title="Fullscreen">⛶</button>
          <button id="pdf-download" title="Download PDF"><i class="fas fa-download"></i></button>
        </div>
      </div>
      <div id="pdf-viewer" class="pdf-viewer"></div>
      <div id="pdf-viewer-loader" class="pdf-viewer-loader"></div>
      <div id="pdf-viewer-error" class="pdf-viewer-error">Failed to load PDF. Please try again.</div>
    `;
    
    // Add the container to the document
    container.appendChild(viewerContainer);
    
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
      
      #pdf-toggle-quality {
        background-color: #9c27b0;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        transition: all 0.3s;
        opacity: 0.7;
      }
      
      #pdf-toggle-quality.active {
        opacity: 1;
        font-weight: bold;
      }
      
      #pdf-toggle-quality:hover {
        opacity: 1;
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
        will-change: transform; /* Optimization for performance */
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
          padding: 8px;
        }
        
        .pdf-controls, .pdf-zoom-controls {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .pdf-page-search {
          margin-left: 0;
          margin-top: 5px;
        }
        
        .pdf-page-search input {
          width: 60px;
          font-size: 14px;
        }
        
        .pdf-viewer-container {
          height: 500px; /* Smaller height on mobile */
        }
        
        /* Mobile-friendly button sizes */
        .pdf-viewer-toolbar button {
          min-height: 44px; /* Touch-friendly size */
          min-width: 44px;
          padding: 8px 12px;
          font-size: 14px;
        }
        
        /* Better error message styling for mobile */
        .pdf-viewer-error {
          padding: 20px 15px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        /* Better loader styling for mobile */
        .pdf-viewer-loader {
          font-size: 14px;
        }
      }
      
      /* Responsive improvements for very small screens */
      @media (max-width: 480px) {
        .pdf-viewer-container {
          height: 400px;
        }
        
        .pdf-controls span, .pdf-zoom-controls span {
          font-size: 12px;
        }
        
        #pdf-quality-indicator {
          font-size: 10px !important;
          padding: 2px 6px !important;
        }
        
        .pdf-viewer-toolbar button {
          min-height: 40px;
          min-width: 40px;
          padding: 6px 10px;
          font-size: 12px;
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
    
    // Fullscreen change event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
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
  async function loadPDF(url, options = {}) {
    showLoader();
    
    // Store the PDF URL
    currentPdfUrl = url;
    
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
    
    try {
      // Ensure PDF viewer is properly initialized
      const initSuccess = await ensurePDFViewerInitialized();
      
      if (!initSuccess) {
        console.error("Failed to initialize PDF viewer");
        showError("PDF阅读器初始化失败。请刷新页面重试。");
        return;
      }
      
      // Double-check that pdfContainer exists after initialization
      if (!pdfContainer) {
        pdfContainer = document.getElementById('pdf-viewer');
        if (!pdfContainer) {
          console.error("PDF container still not found after initialization");
          showError("PDF容器未找到。请刷新页面重试。");
          return;
        }
      }
      
    } catch (error) {
      console.error("Error during PDF viewer initialization:", error);
      showError("PDF阅读器初始化出现错误。请刷新页面重试。");
      return;
    }
    
    // Clear the previous document if any
    if (currentPdfDocument) {
      try {
        currentPdfDocument.destroy();
      } catch (e) {
        console.warn("Error destroying previous PDF document:", e);
      }
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
    
    // Configure PDF.js options with improved CORS handling
    const pdfOptions = {
      // Disable cmaps to avoid CORS issues
      cMapUrl: null,
      cMapPacked: false,
      // Disable standard fonts to avoid CORS issues
      standardFontDataUrl: null,
      // Use built-in font handling
      disableFontFace: true,
      useSystemFonts: true,
      nativeImageDecoderSupport: 'display',
      // Enable range requests for better loading performance
      rangeChunkSize: 65536,
      disableStream: false,
      disableAutoFetch: false,
      // Ignore font errors
      ignoreErrors: true
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
        hideLoader();
        
        // Provide more specific error messages based on error type
        let errorMessage = '加载PDF文件时出现错误：';
        
        if (error.name === 'InvalidPDFException') {
          if (error.message.includes('Invalid PDF structure')) {
            errorMessage = '该PDF文件损坏或为空文件，无法正常加载。请联系管理员更新正确的教材文件。';
          } else {
            errorMessage = '该PDF文件格式无效或损坏，无法正常打开。';
          }
        } else if (error.name === 'MissingPDFException') {
          errorMessage = '未找到指定的PDF文件，文件可能已被移动或删除。';
        } else if (error.name === 'UnexpectedResponseException') {
          errorMessage = '网络错误或服务器响应异常，请检查网络连接后重试。';
        } else {
          errorMessage += error.message || '未知错误';
        }
        
        showError(errorMessage);
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
    pdfContainer.appendChild(pageContainer);
    
    // Create a canvas for the page
    const canvas = document.createElement('canvas');
    // Add will-read-frequently attribute for better performance when using getImageData
    canvas.setAttribute('willReadFrequently', 'true');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    pageContainer.appendChild(canvas);
    
    // Get device pixel ratio for high-DPI displays (like Retina)
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Determine quality factor based on mode
    const qualityFactor = isHighQualityMode ? (devicePixelRatio > 1 ? 1.2 : 1) : 1;
    
    // Calculate viewport based on scale
    const viewport = page.getViewport({ 
      scale: currentScale * qualityFactor
    });
    
    // Set display size (css pixels)
    const displayWidth = viewport.width / devicePixelRatio;
    const displayHeight = viewport.height / devicePixelRatio;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    const scaleFactor = isHighQualityMode ? (devicePixelRatio * 1.5) : devicePixelRatio;
    canvas.width = Math.floor(viewport.width * scaleFactor);
    canvas.height = Math.floor(viewport.height * scaleFactor);
    
    // Scale context to ensure correct drawing operations
    context.scale(scaleFactor, scaleFactor);
    
    // Improve image rendering quality
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = isHighQualityMode ? 'high' : 'medium';
    
    // Render the page with appropriate quality settings
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      enableWebGL: isHighQualityMode, // Use WebGL for high quality
      renderInteractiveForms: true,
      // Use fine-grained render parameters for better quality
      transform: isHighQualityMode && devicePixelRatio > 1 ? [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0] : null,
    };
    
    // Create a div for the text layer
    const textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'pdf-page-textlayer';
    pageContainer.appendChild(textLayerDiv);
    
    // Scale the text layer correctly to match the canvas
    textLayerDiv.style.width = `${displayWidth}px`;
    textLayerDiv.style.height = `${displayHeight}px`;
    
    // Set the scale factor CSS variable for text layer alignment
    textLayerDiv.style.setProperty('--scale-factor', viewport.scale);
    
    // Enable text selection by rendering the text layer
    page.render(renderContext).promise.then(function() {
      // Get the text content from the page
      return isHighQualityMode ? page.getTextContent() : null;
    }).then(function(textContent) {
      // Enable text layer only if PDF.js TextLayerBuilder is available and we're in high quality mode
      if (isHighQualityMode && textContent && window.pdfjsLib && window.pdfjsLib.renderTextLayer) {
        try {
          // Use modern API with textContentSource instead of deprecated textContent parameter
          window.pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport: viewport,
            textDivs: [],
            enhanceTextSelection: true
          });
          
          // Add active class to make text selectable
          textLayerDiv.classList.add('active');
        } catch (error) {
          console.error("Error rendering text layer:", error);
          // Try with deprecated API as fallback
          try {
            window.pdfjsLib.renderTextLayer({
              textContent: textContent,
              container: textLayerDiv,
              viewport: viewport,
              textDivs: [],
              enhanceTextSelection: true
            });
            textLayerDiv.classList.add('active');
          } catch (fallbackError) {
            console.error("Error rendering text layer with fallback method:", fallbackError);
          }
        }
      }
      
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
   * Toggle fullscreen mode using browser's fullscreen API
   */
  function toggleFullscreen() {
    const container = document.getElementById('pdf-viewer-container');
    const fullscreenButton = document.getElementById('pdf-fullscreen');
    
    if (!container) return;
    
    // Check if we're currently in fullscreen
    const isCurrentlyFullscreen = document.fullscreenElement || 
                                  document.webkitFullscreenElement || 
                                  document.mozFullScreenElement || 
                                  document.msFullscreenElement;
    
    if (isCurrentlyFullscreen) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      // Enter fullscreen
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    }
  }
  
  /**
   * Handle fullscreen change events
   */
  function handleFullscreenChange() {
    const container = document.getElementById('pdf-viewer-container');
    const fullscreenButton = document.getElementById('pdf-fullscreen');
    
    const isCurrentlyFullscreen = document.fullscreenElement || 
                                  document.webkitFullscreenElement || 
                                  document.mozFullScreenElement || 
                                  document.msFullscreenElement;
    
    isFullscreen = !!isCurrentlyFullscreen;
    
    if (isFullscreen) {
      if (container) container.classList.add('fullscreen');
      if (fullscreenButton) fullscreenButton.textContent = '⤢';
    } else {
      if (container) container.classList.remove('fullscreen');
      if (fullscreenButton) fullscreenButton.textContent = '⛶';
    }
    
    // Re-render the page to fit the new container size
    setTimeout(() => {
      renderPage(currentPage);
    }, 100);
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
  function showError(message) {
    const loader = document.getElementById('pdf-viewer-loader');
    const error = document.getElementById('pdf-viewer-error');
    
    if (loader) loader.style.display = 'none';
    if (error) error.style.display = 'block';
    if (error) error.textContent = message;
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
  

  
  // Auto-initialize on DOM ready with error handling
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      console.log('DOM ready, attempting PDF viewer auto-initialization...');
      await ensurePDFViewerInitialized();
      console.log('PDF viewer auto-initialization complete');
    } catch (error) {
      console.warn('PDF viewer auto-initialization failed, will retry on first use:', error);
      // Don't throw error here, just log it - viewer will initialize on first use
    }
  });

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
    // Expose initialization functions
    initPDFViewer,
    ensureInitialized: ensurePDFViewerInitialized,
    // Expose a method to check if the viewer is initialized
    isInitialized: function() {
      return isLibraryLoaded && !!pdfContainer && pdfViewerInitialized;
    }
  };
})(); 