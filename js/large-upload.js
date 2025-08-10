/**
 * Large dataset upload handler for lab_warehouse
 * Provides chunked upload, progress tracking, and error handling
 */

class LargeDatasetUploader {
    constructor(options = {}) {
        this.chunkSize = options.chunkSize || 100;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.endpoint = options.endpoint || 'https://lab-upload.study-llm.me/upload';
        this.onProgress = options.onProgress || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onError = options.onError || (() => {});
    }

    /**
     * Upload large dataset with progress tracking
     * @param {Array} data - Array of row objects
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result
     */
    async upload(data, options = {}) {
        const {
            database = 'db_gore',
            batchSize = this.chunkSize,
            skipClear = false,
            showProgress = true
        } = options;

        try {
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid data: expected non-empty array');
            }

            // Validate data format
            const validation = this.validateData(data);
            if (!validation.valid) {
                throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
            }
            if (validation.warnings.length > 0) {
                console.warn('Data validation warnings:', validation.warnings);
            }

            const totalRows = data.length;
            let uploadedRows = 0;
            let errors = [];

            // Show initial progress
            if (showProgress) {
                this.updateProgress(0, totalRows, '准备上传...');
            }

            // Perform upload with retry logic - 直接传递数据数组
            const result = await this.uploadWithRetry(data, database, showProgress);
            
            if (result.success) {
                uploadedRows = result.details.insertedCount || 0;
                
                if (showProgress) {
                    this.updateProgress(100, totalRows, '上传完成');
                }

                console.log('Calling onComplete with success data:', {
                    success: true,
                    totalRows,
                    uploadedRows,
                    details: result.details
                });
                this.onComplete({
                    success: true,
                    totalRows,
                    uploadedRows,
                    details: result.details
                });

                const returnMessage = `成功上传 ${uploadedRows} 条数据`;
                console.log('Upload return message:', returnMessage);
                return {
                    success: true,
                    message: returnMessage,
                    details: result.details
                };
            } else {
                throw new Error(result.error || 'Upload failed');
            }

        } catch (error) {
            const errorMessage = `上传失败: ${error.message}`;
            
            if (showProgress) {
                this.updateProgress(0, 0, errorMessage);
            }

            console.log('Calling onError with error data:', {
                success: false,
                error: errorMessage,
                details: error
            });
            this.onError({
                success: false,
                error: errorMessage,
                details: error
            });

            throw error;
        }
    }

    /**
     * Upload with retry mechanism
     * @param {Array} data - Array data to upload directly
     * @param {string} database - Database name
     * @param {boolean} showProgress - Show progress updates
     * @returns {Promise<Object>} Upload result
     */
    async uploadWithRetry(data, database, showProgress) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                if (showProgress && attempt > 1) {
                    this.updateProgress(0, 0, `重试第 ${attempt} 次...`);
                }

                // 直接使用数据数组，不再经过FormData
                const batchSize = parseInt(document.getElementById('batch-size')?.value || this.chunkSize);
                
                const uploadData = {
                    data: data,
                    database: database,
                    batchSize: batchSize,
                    filename: 'uploaded_data.json'
                };

                // 增强日志记录，显示更多数据详情
                console.log('Sending upload data:', {
                    dataLength: data.length,
                    database,
                    batchSize,
                    endpoint: this.endpoint,
                    sampleData: data.length > 0 ? JSON.stringify(data[0]) : 'No data',
                    fullDataPreview: data.length > 0 ? JSON.stringify(data.slice(0, 3)) : 'No data',
                    dataType: Array.isArray(data) ? 'Array' : typeof data,
                    uploadDataSize: new Blob([JSON.stringify(uploadData)]).size + ' bytes'
                });
                
                // 验证数据是否存在
                if (!data || data.length === 0) {
                    console.error('Attempting to upload empty data!');
                }

                const response = await fetch(`${this.endpoint}?database=${database}&batchSize=${batchSize}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(uploadData),
                    signal: AbortSignal.timeout(60000),
                    mode: 'cors',
                    credentials: 'omit'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response:', errorText);
                    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
                }

                const result = await response.json();
                console.log('Upload success:', result);
                
                // Verify upload result
                if (!result.details || typeof result.details.recordsProcessed !== 'number') {
                    throw new Error('Invalid upload result: missing recordsProcessed information');
                }
                
                if (result.details.recordsProcessed !== data.length) {
                    console.warn(`Upload mismatch: sent ${data.length} records, but server processed ${result.details.recordsProcessed}`);
                }
                
                return result;

            } catch (error) {
                lastError = error;
                console.error(`Upload attempt ${attempt} failed:`, error);
                
                if (attempt < this.maxRetries) {
                    const delayMs = this.retryDelay * attempt * 2;
                    console.warn(`Retrying in ${delayMs}ms...`);
                    await this.delay(delayMs);
                } else {
                    console.error(`All ${this.maxRetries} upload attempts failed`, error);
                }
            }
        }

        throw lastError;
    }

    /**
     * Update progress display
     * @param {number} percentage - Progress percentage
     * @param {number} current - Current rows processed
     * @param {number} total - Total rows
     * @param {string} message - Progress message
     */
    updateProgress(percentage, current, total, message) {
        const progressData = {
            percentage: Math.round(percentage),
            current: current,
            total: total,
            message: message
        };

        this.onProgress(progressData);
        
        // Update UI if elements exist
        const progressBar = document.getElementById('upload-progress-bar');
        const progressText = document.getElementById('upload-progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progressData.percentage}%`;
            progressBar.setAttribute('aria-valuenow', progressData.percentage);
        }
        
        if (progressText) {
            progressText.textContent = `${message} (${current}/${total})`;
        }
    }

    /**
     * Create a delay
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Validate data format
     * @param {Array} data - Data to validate
     * @returns {Object} Validation result
     */
    validateData(data) {
        const errors = [];
        const warnings = [];

        if (!Array.isArray(data)) {
            errors.push('Data must be an array');
            return { valid: false, errors, warnings };
        }

        if (data.length === 0) {
            errors.push('Data array cannot be empty');
            return { valid: false, errors, warnings };
        }

        // Check for required fields in lab_warehouse data
        const requiredFields = ['扫描单', '货位', '条码', '数量', '品名'];
        
        data.forEach((row, index) => {
            if (typeof row !== 'object' || row === null) {
                errors.push(`Row ${index + 1}: must be an object`);
                return;
            }

            requiredFields.forEach(field => {
                if (!(field in row)) {
                    warnings.push(`Row ${index + 1}: missing field '${field}'`);
                }
            });
        });

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            rowCount: data.length
        };
    }

    /**
     * Create a progress indicator element
     * @returns {HTMLElement} Progress indicator element
     */
    createProgressIndicator() {
        const container = document.createElement('div');
        container.className = 'upload-progress-container';
        container.innerHTML = `
            <div class="upload-progress-info">
                <div class="upload-progress-bar-container">
                    <div class="upload-progress-bar" id="upload-progress-bar" role="progressbar" 
                         aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                        <span class="upload-progress-fill"></span>
                    </div>
                </div>
                <div class="upload-progress-text" id="upload-progress-text">准备上传...</div>
            </div>
            <style>
                .upload-progress-container {
                    margin: 20px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #dee2e6;
                }
                .upload-progress-bar-container {
                    width: 100%;
                    height: 8px;
                    background: #e9ecef;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                .upload-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #007bff, #0056b3);
                    width: 0%;
                    transition: width 0.3s ease;
                }
                .upload-progress-text {
                    font-size: 14px;
                    color: #495057;
                    text-align: center;
                }
                @media (max-width: 768px) {
                    .upload-progress-container {
                        margin: 10px 0;
                        padding: 10px;
                    }
                }
            </style>
        `;
        return container;
    }
}

// Export for use in other modules
window.LargeDatasetUploader = LargeDatasetUploader;

// Example usage function
async function uploadLargeDataset(data, options = {}) {
    const uploader = new LargeDatasetUploader({
        chunkSize: 50, // Smaller chunks for better progress tracking
        maxRetries: 3,
        onProgress: (progress) => {
            console.log(`Progress: ${progress.percentage}% (${progress.current}/${progress.total}) - ${progress.message}`);
        },
        onComplete: (result) => {
            if (result.success) {
                alert(`上传完成！共上传 ${result.uploadedRows} 条数据`);
            }
        },
        onError: (error) => {
            console.error('Upload failed:', error);
            alert(`上传失败: ${error.error}`);
        }
    });

    return await uploader.upload(data, options);
}

// Export convenience function
window.uploadLargeDataset = uploadLargeDataset;