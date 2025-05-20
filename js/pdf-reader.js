/**
 * PDF Reader Component using PDF.js
 * Supports features like page navigation, zooming, fullscreen mode, and responsive design.
 */

// We'll use a self-invoking function to avoid polluting the global namespace
(function() {
  // Load PDF.js library from CDN (latest stable version)
  const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111';
  
  // Load the PDF.js viewer CSS
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = `${PDFJS_CDN}/pdf_viewer.min.css`;
  document.head.appendChild(linkElement);
  
  // Load PDF.js scripts
  const scriptElement = document.createElement('script');
  scriptElement.src = `${PDFJS_CDN}/pdf.min.js`;
  document.head.appendChild(scriptElement);
  
  // Initialize PDF.js after script is loaded
  scriptElement.onload = function() {
    // Set the worker source
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
    
    // Initialize the PDF viewer component
    initPDFViewer();
  };
  
  // PDF Viewer Configuration
  const DEFAULT_SCALE = 1.0;
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
    // Create or update PDF viewer container
    createPDFViewerUI();
    
    // Setup event listeners
    setupEventListeners();
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
        </div>
        <div class="pdf-zoom-controls">
          <button id="pdf-zoom-out" title="Zoom Out">−</button>
          <span id="pdf-zoom-level">100%</span>
          <button id="pdf-zoom-in" title="Zoom In">+</button>
          <button id="pdf-fullscreen" title="Fullscreen">⛶</button>
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
      
      .pdf-viewer {
        flex: 1;
        overflow: auto;
        background-color: #f5f5f5;
        position: relative;
      }
      
      .pdf-page {
        margin: 10px auto;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        background-color: white;
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
          justify-content: center;
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
    const viewer = document.getElementById('pdf-viewer');
    
    if (prevButton) prevButton.addEventListener('click', previousPage);
    if (nextButton) nextButton.addEventListener('click', nextPage);
    
    // Zoom controls
    if (zoomInButton) zoomInButton.addEventListener('click', zoomIn);
    if (zoomOutButton) zoomOutButton.addEventListener('click', zoomOut);
    
    // Fullscreen toggle
    if (fullscreenButton) fullscreenButton.addEventListener('click', toggleFullscreen);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Touch swipe for mobile devices
    setupTouchControls();
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
      case 'f':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          toggleFullscreen();
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
    
    // Clear the previous document if any
    if (currentPdfDocument) {
      currentPdfDocument.destroy();
      currentPdfDocument = null;
      pdfContainer.innerHTML = '';
    }
    
    // Reset state
    currentPage = settings.initialPage;
    currentScale = settings.scale;
    pageCache = new Map();
    pagePriority = [];
    
    // Load the PDF document
    window.pdfjsLib.getDocument(url).promise
      .then(function(pdfDoc) {
        currentPdfDocument = pdfDoc;
        totalPages = pdfDoc.numPages;
        
        // Update UI
        const totalPagesEl = document.getElementById('pdf-total-pages');
        if (totalPagesEl) totalPagesEl.textContent = totalPages;
        updatePageInfo();
        updateZoomLevel();
        
        // Setup lazy loading if enabled
        if (lazyLoadEnabled) {
          // Add scroll event listener to load pages as they become visible
          pdfContainer.addEventListener('scroll', handleScroll);
          
          // Load initial page and preload adjacent pages
          preloadVisiblePages();
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
    
    // Clear the container
    pdfContainer.innerHTML = '';
    
    // Create a container for this page
    const pageContainer = document.createElement('div');
    pageContainer.className = 'pdf-page';
    pdfContainer.appendChild(pageContainer);
    
    // Create a canvas for the page
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    pageContainer.appendChild(canvas);
    
    // Calculate viewport based on scale
    const viewport = page.getViewport({ scale: currentScale });
    
    // Set canvas dimensions
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render the page
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    page.render(renderContext).promise.then(function() {
      hideLoader();
      updatePageInfo();
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
  
  // Expose the PDF reader functions to the global scope
  window.PDFReader = {
    loadPDF,
    previousPage,
    nextPage,
    zoomIn,
    zoomOut,
    toggleFullscreen
  };
})(); 