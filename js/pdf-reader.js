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
      
      // Configure CMap URL for proper font rendering with CORS mode
      window.pdfjsLib.GlobalWorkerOptions.CMapReaderFactory = function({ baseUrl, isCompressed }) {
        return {
          fetch: function(cmapName) {
            return fetch(`${baseUrl}${cmapName}${isCompressed ? '.bcmap' : ''}`, { 
              mode: 'cors',  // Try with CORS first
              credentials: 'same-origin'
            })
            .then(response => {
              if (!response.ok) {
                // If CORS fails, fall back to no-cors (for CDN resources)
                return fetch(`${baseUrl}${cmapName}${isCompressed ? '.bcmap' : ''}`, { 
                  mode: 'no-cors' 
                });
              }
              return response;
            })
            .then(response => {
              if (isCompressed) {
                return response.arrayBuffer();
              }
              return response.text();
            });
          }
        };
      };
      
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
  const DEFAULT_SCALE = 1.0; // Base scale - let auto-fit determine optimal size
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
  let isHighQualityMode = true; // Default to high quality rendering
  let eventListenersSetup = false; // Track if event listeners are already set up
  
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
      console.log("Initializing PDF Viewer...");
      
      // Initialize the PDF container
      if (!initializePDFContainer()) {
        console.error("Failed to initialize PDF container during viewer initialization");
        return false;
      }
      
      // Setup event listeners
      setupEventListeners();
      
      console.log("PDF Viewer initialized successfully");
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
          <button id="pdf-fullscreen" title="Fullscreen">⛶</button>
          <button id="pdf-download" title="Download PDF"><i class="fas fa-download"></i></button>
        </div>
      </div>
      <div id="pdf-viewer" class="pdf-viewer"></div>
      <div id="pdf-viewer-loader" class="pdf-viewer-loader">Loading PDF...</div>
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
        height: 90vh;
        min-height: 800px;
        max-width: 100%;
        margin: 0 auto;
        border: 1px solid #ccc;
        background-color: #f5f5f5;
        position: relative;
        overflow: hidden;
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
      

      
      .pdf-viewer {
        flex: 1;
        overflow: auto;
        background-color: #525659;
        position: relative;
        text-align: center;
        padding: 5px;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
      }
      
      .pdf-page {
        margin: 5px auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        background-color: white;
        position: relative;
        display: block;
        box-sizing: border-box;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        max-width: 100%;
        width: auto;
        height: auto;
        min-width: 200px;
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
        }
        
        .pdf-controls, .pdf-zoom-controls {
          width: 100%;
          justify-content: center;
        }
        
        .pdf-page-search {
          margin-left: 0;
          margin-top: 10px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Setup event listeners for PDF viewer controls
   */
  function setupEventListeners() {
    // Check if event listeners are already set up to prevent duplicates
    if (eventListenersSetup) {
      console.log("Event listeners already set up, skipping");
      return;
    }
    
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
    
    if (prevButton) {
      prevButton.addEventListener('click', previousPage);
      console.log("Previous button event listener added");
    }
    if (nextButton) {
      nextButton.addEventListener('click', nextPage);
      console.log("Next button event listener added");
    }
    
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
    
    // Keyboard shortcuts (only add once)
    if (!eventListenersSetup) {
      document.addEventListener('keydown', handleKeyboardShortcuts);
    }
    
    // Touch swipe for mobile devices
    setupTouchControls();
    
    // Mark event listeners as set up
    eventListenersSetup = true;
    console.log("PDF viewer event listeners set up successfully");
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
   * Initialize the PDF container and ensure it exists
   * @returns {boolean} True if container is successfully initialized, false otherwise
   */
  function initializePDFContainer() {
    console.log("=== Starting PDF container initialization ===");
    
    // Check if container already exists and is valid (has inner structure)
    let container = document.getElementById('pdf-viewer-container');
    let viewer = document.getElementById('pdf-viewer');
    
    console.log("Initial check - Container:", !!container, "Viewer:", !!viewer);
    
    if (container && viewer) {
      pdfContainer = viewer;
      console.log("PDF container already exists and is valid");
      return true;
    }
    
    let populationResult = null;
    
    // If container exists but is empty, populate it
    if (container && !viewer) {
      console.log("PDF container exists but is empty, populating it");
      console.log("Container element:", container);
      console.log("Container innerHTML before:", container.innerHTML);
      
      try {
        populationResult = populateExistingContainer(container);
        console.log("Population result:", !!populationResult);
        console.log("Container innerHTML after:", container.innerHTML.substring(0, 200) + "...");
      } catch (error) {
        console.error("Error populating existing container:", error);
        return false;
      }
    } else {
      // Try to find an existing PDF container element in the page
      const existingPdfContainer = document.querySelector('.pdf-container');
      
      console.log("Looking for .pdf-container:", !!existingPdfContainer);
      
      if (existingPdfContainer) {
        console.log("Found existing PDF container, populating it");
        try {
          populationResult = populateExistingContainer(existingPdfContainer);
          console.log("Population result:", !!populationResult);
        } catch (error) {
          console.error("Error populating found container:", error);
          return false;
        }
      } else {
        // Create a new container
        console.log("Creating new PDF viewer container");
        try {
          createPDFViewerUI();
        } catch (error) {
          console.error("Error creating new PDF viewer UI:", error);
          return false;
        }
      }
    }
    
    // Add a small delay to ensure DOM is updated
    setTimeout(() => {
      // Verify the container was created successfully
      const finalContainer = document.getElementById('pdf-viewer-container');
      const finalViewer = document.getElementById('pdf-viewer');
      
      console.log("Final verification - Container:", !!finalContainer, "Viewer:", !!finalViewer);
      
      if (finalViewer) {
        pdfContainer = finalViewer;
        console.log("PDF container set successfully");
      }
    }, 10);
    
    // Immediate verification (synchronous)
    container = document.getElementById('pdf-viewer-container');
    viewer = document.getElementById('pdf-viewer');
    
    console.log("Immediate verification - Container:", !!container, "Viewer:", !!viewer);
    
    // If we have a population result, use it
    if (populationResult) {
      console.log("Using population result for viewer");
      viewer = populationResult;
    }
    
    if (!container || !viewer) {
      console.error("Failed to create PDF viewer container or viewer element");
      console.log("Container exists:", !!container);
      console.log("Viewer exists:", !!viewer);
      
      // Try once more with direct DOM query
      const allViewers = document.querySelectorAll('#pdf-viewer');
      console.log("All pdf-viewer elements found:", allViewers.length);
      
      if (allViewers.length > 0) {
        console.log("Found viewer via querySelectorAll, using first one");
        pdfContainer = allViewers[0];
        viewer = allViewers[0];
      } else {
        return false;
      }
    }
    
    // Set the global reference
    pdfContainer = viewer;
    
    // Now setup event listeners
    try {
      console.log("Setting up event listeners...");
      setupEventListeners();
    } catch (error) {
      console.error("Error setting up event listeners:", error);
      // Continue anyway, as the viewer might still work
    }
    
    console.log("PDF container initialized successfully");
    console.log("=== PDF container initialization complete ===");
    return true;
  }
  
  /**
   * Populate an existing container with PDF viewer elements
   */
  function populateExistingContainer(container) {
    console.log("Populating existing container:", container);
    
    // Ensure the container has the correct ID and class
    if (container.id !== 'pdf-viewer-container') {
      console.log("Setting container ID to pdf-viewer-container");
      container.id = 'pdf-viewer-container';
    }
    container.classList.add('pdf-viewer-container');
    
    // Build the viewer UI
    const viewerHTML = `
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
        </div>
      </div>
      <div id="pdf-viewer" class="pdf-viewer"></div>
      <div id="pdf-viewer-loader" class="pdf-viewer-loader">Loading PDF...</div>
      <div id="pdf-viewer-error" class="pdf-viewer-error">Failed to load PDF. Please try again.</div>
    `;
    
    console.log("Setting innerHTML...");
    container.innerHTML = viewerHTML;
    
    // Force a reflow to ensure DOM is updated
    container.offsetHeight;
    
    console.log("Checking if pdf-viewer element was created...");
    const viewer = document.getElementById('pdf-viewer');
    console.log("pdf-viewer element found:", !!viewer);
    
    // Add styles if not already included
    if (!document.getElementById('pdf-viewer-style')) {
      console.log("Adding PDF viewer styles...");
      addPDFViewerStyles();
    }
    
    // Set the pdfContainer reference
    if (viewer) {
      pdfContainer = viewer;
      console.log("pdfContainer reference set successfully");
    } else {
      console.error("Failed to find pdf-viewer element after innerHTML set");
    }
    
    // Don't setup event listeners here - let the caller handle it
    console.log("Container population complete");
    return viewer; // Return the viewer element for verification
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
    
    // Ensure the PDF reader is properly initialized
    if (!initializePDFContainer()) {
      console.error("Failed to initialize PDF viewer container.");
      return;
    }
    
    showLoader();
    
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
    
    // Configure PDF.js options - disable external resources to avoid CORS issues
    const pdfOptions = {
      // Disable external font and cmap loading to avoid CORS issues
      cMapUrl: null,
      cMapPacked: false,
      standardFontDataUrl: null,
      disableFontFace: true, // Use system fonts instead
      nativeImageDecoderSupport: 'display',
      useSystemFonts: true,
      // Enable range requests for better loading performance
      rangeChunkSize: 65536,
      disableStream: false,
      disableAutoFetch: false,
      // Ignore errors for missing fonts
      stopAtErrors: false
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
    
    // Log container and page dimensions for debugging
    console.log("PDF Container dimensions:", pdfContainer.clientWidth, "x", pdfContainer.clientHeight);
    
    // Make the page container use available height
    pageContainer.style.minHeight = `${pdfContainer.clientHeight - 20}px`;
    pageContainer.style.display = 'flex';
    pageContainer.style.alignItems = 'center';
    pageContainer.style.justifyContent = 'center';
    
    pdfContainer.appendChild(pageContainer);
    
    // Create a canvas for the page
    const canvas = document.createElement('canvas');
    // Add will-read-frequently attribute for better performance when using getImageData
    canvas.setAttribute('willReadFrequently', 'true');
    const context = canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: false // Better performance for opaque content
    });
    pageContainer.appendChild(canvas);
    
    // Get device pixel ratio for high-DPI displays (like Retina)
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Determine quality factor based on mode
    const qualityFactor = isHighQualityMode ? (devicePixelRatio > 1 ? 1.2 : 1) : 1;
    
    // Get container dimensions for optimal scaling
    const containerWidth = pdfContainer.clientWidth - 20; // Reduced padding
    const containerHeight = pdfContainer.clientHeight - 20;
    
    console.log("Container dimensions:", containerWidth, "x", containerHeight);
    
    // Calculate viewport with initial scale
    let initialViewport = page.getViewport({ scale: 1.0 });
    console.log("Page dimensions:", initialViewport.width, "x", initialViewport.height);
    
    // Calculate scale to fit width primarily
    const widthScale = (containerWidth / initialViewport.width) * 0.98;
    
    // Calculate scale to fit height
    const heightScale = (containerHeight / initialViewport.height) * 0.98;
    
    // Use the smaller scale to ensure the entire page fits
    let optimalScale = Math.min(widthScale, heightScale);
    
    // But don't make it too small - prioritize readability
    if (optimalScale < 0.6) {
      optimalScale = widthScale; // Prefer width fitting if height constraint makes it too small
    }
    
    // Ensure we don't go below a minimum readable scale
    optimalScale = Math.max(optimalScale, 0.4);
    
    console.log("Width scale:", widthScale, "Height scale:", heightScale, "Chosen scale:", optimalScale);
    
    // Apply user's zoom level on top of the optimal scale
    optimalScale = optimalScale * (currentScale / DEFAULT_SCALE);
    
    console.log("Calculated optimal scale:", optimalScale);
    
    // Calculate viewport based on optimal scale
    const viewport = page.getViewport({ 
      scale: optimalScale * qualityFactor
    });
    
    // Set display size (css pixels)
    const displayWidth = viewport.width / devicePixelRatio;
    const displayHeight = viewport.height / devicePixelRatio;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    console.log("Canvas display size:", displayWidth, "x", displayHeight);
    console.log("Viewport size:", viewport.width, "x", viewport.height);
    
    // Set actual size in memory (scaled to account for extra pixel density)
    const scaleFactor = isHighQualityMode ? (devicePixelRatio * 1.2) : devicePixelRatio;
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
      // Show the effective zoom level based on current scale relative to DEFAULT_SCALE
      const effectiveZoom = (currentScale / DEFAULT_SCALE) * 100;
      const zoomPercent = Math.round(effectiveZoom);
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
   * Prevent browser native PDF viewer and ensure our custom viewer is used
   */
  function interceptPDFLinks() {
    // Intercept clicks on PDF links to use our custom viewer
    document.addEventListener('click', function(e) {
      const target = e.target.closest('a, [data-path]');
      if (target) {
        const url = target.href || target.dataset.path;
        if (url && url.toLowerCase().endsWith('.pdf')) {
          e.preventDefault();
          
          // Load with our custom viewer
          const title = target.dataset.name || target.textContent || 'PDF Document';
          console.log(`Intercepting PDF link: ${url}`);
          
          // Ensure container is initialized before loading
          if (initializePDFContainer()) {
            loadPDF(url, {
              initialPage: 1,
              scale: DEFAULT_SCALE,
              lazyLoad: true
            });
          } else {
            console.error("Failed to initialize PDF container for intercepted link");
          }
        }
      }
    });
    
    // Also intercept direct PDF navigation
    if (window.location.pathname.toLowerCase().endsWith('.pdf')) {
      console.log("PDF detected in URL, using custom viewer");
      if (initializePDFContainer()) {
        loadPDF(window.location.href);
      }
    }
  }
  
  // Initialize PDF link interception when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', interceptPDFLinks);
  } else {
    interceptPDFLinks();
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
    initializePDFContainer,
    populateExistingContainer,
    
    // Expose a method to check if the viewer is initialized
    isInitialized: function() {
      return isLibraryLoaded && !!pdfContainer;
    },
    
    // Method to manually initialize the viewer
    init: function() {
      return initPDFViewer();
    }
  };
})(); 