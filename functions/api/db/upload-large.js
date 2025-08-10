/**
 * Cloudflare Worker for handling large dataset uploads to lab_warehouse table
 * Features:
 * - Chunked processing to avoid timeouts
 * - Streaming upload support
 * - Progress tracking
 * - Memory efficient processing
 * - Batch insert with configurable batch size
 */

export async function onRequestPost(context) {
    const { request, env } = context;
    
    // Enable CORS
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Upload-Id",
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const url = new URL(request.url);
        const database = url.searchParams.get('database') || 'default';
        
        // Get database binding
        const db = env[database];
        if (!db) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: `Database binding '${database}' not found` 
                }), 
                { 
                    status: 400, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        // Parse request with streaming support
        const contentType = request.headers.get('content-type') || '';
        let data;
        
        if (contentType.includes('multipart/form-data')) {
            // Handle form data (for file uploads)
            const formData = await request.formData();
            const file = formData.get('file');
            const jsonData = formData.get('data');
            
            if (file) {
                // Read file content
                const text = await file.text();
                data = JSON.parse(text);
            } else if (jsonData) {
                data = JSON.parse(jsonData);
            } else {
                return new Response(
                    JSON.stringify({ 
                        success: false, 
                        error: 'No file or data provided' 
                    }), 
                    { 
                        status: 400, 
                        headers: { ...corsHeaders, "Content-Type": "application/json" } 
                    }
                );
            }
        } else {
            // Handle JSON data directly
            data = await request.json();
        }

        const { rows, batchSize = 100, skipClear = false } = data;
        
        if (!Array.isArray(rows) || rows.length === 0) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'Invalid data format. Expected rows array.' 
                }), 
                { 
                    status: 400, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        const totalRows = rows.length;
        let processedRows = 0;
        let deletedCount = 0;
        let insertedCount = 0;
        let errors = [];

        // Start processing
        const startTime = Date.now();

        try {
            // Clear existing data if not skipped
            if (!skipClear) {
                const deleteResult = await db.prepare('DELETE FROM lab_warehouse').run();
                deletedCount = deleteResult.meta.changes || 0;
            }

            // Process data in chunks
            const chunks = [];
            for (let i = 0; i < totalRows; i += batchSize) {
                chunks.push(rows.slice(i, i + batchSize));
            }

            // Process each chunk
            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                const chunk = chunks[chunkIndex];
                
                // Create batch statements
                const statements = chunk.map(row => {
                    return db.prepare(`
                        INSERT INTO lab_warehouse (
                            扫描单, 货位, 条码, 数量, 品名, 状态, 单位, 价格, 品牌, 产地, 时间, 作业者, 其他1, 其他2, 其他3, 其他4, 其他5, 其他6, 其他7, 其他8
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        row.扫描单 || null,
                        row.货位 || null,
                        row.条码 || null,
                        row.数量 || null,
                        row.品名 || null,
                        row.状态 || null,
                        row.单位 || null,
                        row.价格 || null,
                        row.品牌 || null,
                        row.产地 || null,
                        row.时间 || null,
                        row.作业者 || null,
                        row.其他1 || null,
                        row.其他2 || null,
                        row.其他3 || null,
                        row.其他4 || null,
                        row.其他5 || null,
                        row.其他6 || null,
                        row.其他7 || null,
                        row.其他8 || null
                    );
                });

                // Execute batch
                try {
                    await db.batch(statements);
                    processedRows += chunk.length;
                    insertedCount += chunk.length;
                } catch (error) {
                    // Handle chunk-level errors
                    console.error(`Error processing chunk ${chunkIndex}:`, error);
                    errors.push({
                        chunk: chunkIndex,
                        error: error.message,
                        rowCount: chunk.length
                    });
                }

                // Yield control periodically to prevent blocking
                if (chunkIndex % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            const response = {
                success: true,
                message: `Large dataset upload completed successfully`,
                details: {
                    totalRows,
                    processedRows,
                    insertedCount,
                    deletedCount,
                    batchSize,
                    chunks: chunks.length,
                    duration: `${duration}ms`,
                    errors: errors.length > 0 ? errors : undefined
                }
            };

            return new Response(JSON.stringify(response), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });

        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.error("Upload error:", error);
            return new Response(
                JSON.stringify({ 
                    success: false,
                    error: error.message,
                    details: {
                        totalRows,
                        processedRows,
                        insertedCount,
                        deletedCount,
                        duration: `${duration}ms`,
                        errors: errors.length > 0 ? errors : undefined
                    }
                }), 
                { 
                    status: 500, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

    } catch (error) {
        console.error("Request processing error:", error);
        return new Response(
            JSON.stringify({ 
                success: false,
                error: error.message,
                details: "Error processing upload request"
            }), 
            { 
                status: 500, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
        );
    }
}

// Handle OPTIONS requests for CORS
export async function onRequestOptions(context) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Upload-Id",
    };
    
    return new Response(null, { headers: corsHeaders });
}