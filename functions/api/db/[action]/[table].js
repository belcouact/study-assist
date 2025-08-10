export async function onRequest(context) {
    // Handle CORS preflight requests
    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    try {
        // Get database parameter from query string or request body
        const url = new URL(context.request.url);
        const databaseParam = url.searchParams.get('database') || 'default';
        
        let db;
        if (databaseParam === 'db-gore') {
            if (!context.env.DB_GORE) {
                throw new Error('Database binding "DB_GORE" not found. Please check your Cloudflare Pages D1 database bindings.');
            }
            db = context.env.DB_GORE;
        } else {
            if (!context.env.DB) {
                throw new Error('Database binding "DB" not found. Please check your Cloudflare Pages D1 database bindings.');
            }
            db = context.env.DB;
        }

        // Get the action and table from the URL parameters
        const { action, table } = context.params;

        // Validate table name to prevent SQL injection
        const validTables = ['chinese_dynasty', 'quote', "vocabulary", "chinese_poem", "english_dialog", "world_history", "lab_warehouse"]; // Add more tables as needed
        if (!validTables.includes(table)) {
            throw new Error("Invalid table name");
        }

        // Handle different actions
        switch (action) {
            case 'test':
                // Test connection for specific table
                const testResult = await db.prepare(`SELECT 1 FROM ${table} LIMIT 1`).first();
                const url = new URL(context.request.url);
                const databaseName = url.searchParams.get('database') || 'default';
                return new Response(JSON.stringify({
                    success: true,
                    message: `Successfully connected to ${table} table!`,
                    table: table,
                    database: databaseName
                }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });

            case 'query':
                // Query table data
                const queryResult = await db.prepare(`
                    SELECT * FROM ${table}
                `).all();

                return new Response(JSON.stringify({
                    success: true,
                    table: table,
                    data: queryResult.results || []
                }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });

            case 'upload':
                // Handle data upload
                if (context.request.method !== 'POST') {
                    throw new Error('Upload requires POST method');
                }

                // Parse the request body
                const { data, database } = await context.request.json();
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error('Invalid data format. Expected non-empty array.');
                }

                let insertedCount = 0;
                let deletedCount = 0;

                try {
                    // First, clear existing data from the table
                    const deleteResult = await db.prepare(`DELETE FROM ${table}`).run();
                    deletedCount = deleteResult.meta.changes || 0;

                    // Use parameterized batch insert for better performance and to avoid timeout
                    let batchSize = 1000; // Default batch size
                    
                    if (table === 'lab_warehouse') {
                        // lab_warehouse has 20 columns - using optimized batching for Cloudflare Workers
                        // Conservative batch size: 20 columns * 45 rows = 900 variables (safe under 999 limit)
                        const safeBatchSize = 45;
                        const totalBatches = Math.ceil(data.length / safeBatchSize);
                        
                        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                            const startIdx = batchIndex * safeBatchSize;
                            const endIdx = Math.min(startIdx + safeBatchSize, data.length);
                            const batch = data.slice(startIdx, endIdx);
                            
                            // Build batch insert query
                            const placeholders = batch.map(() => 
                                "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                            ).join(", ");
                            
                            const query = `INSERT INTO lab_warehouse (
                                扫描单, 货位, 条码, 数量, 品名, 状态, 单位, 价格, 品牌, 产地, 
                                时间, 作业者, 其他1, 其他2, 其他3, 其他4, 其他5, 其他6, 其他7, 其他8
                            ) VALUES ${placeholders}`;
                            
                            // Flatten batch data into parameters array
                            const params = [];
                            batch.forEach(row => {
                                params.push(
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
                            
                            const result = await db.prepare(query).bind(...params).run();
                            insertedCount += result.meta.changes || 0;
                        }
                    } else if (table === 'chinese_dynasty') {
                        // 5 columns, safe batch size: 999/5 = 199 rows
                        const safeBatchSize = 190;
                        for (let i = 0; i < data.length; i += safeBatchSize) {
                            const batch = data.slice(i, i + safeBatchSize);
                            const placeholders = batch.map(() => "(?, ?, ?, ?, ?)").join(", ");
                            const query = `INSERT INTO chinese_dynasty (Number, Dynasty, Period, Title, Event) VALUES ${placeholders}`;
                            const params = batch.flatMap(row => [
                                row.Number || null,
                                row.Dynasty || null,
                                row.Period || null,
                                row.Title || null,
                                row.Event || null
                            ]);
                            const result = await db.prepare(query).bind(...params).run();
                            insertedCount += result.meta.changes || 0;
                        }
                    } else if (table === 'quote') {
                        // 6 columns, safe batch size: 999/6 = 166 rows
                        const safeBatchSize = 160;
                        for (let i = 0; i < data.length; i += safeBatchSize) {
                            const batch = data.slice(i, i + safeBatchSize);
                            const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");
                            const query = `INSERT INTO quote (Number, Type, Chinese, English, Remark_1, Remark_2) VALUES ${placeholders}`;
                            const params = batch.flatMap(row => [
                                row.Number || null,
                                row.Type || null,
                                row.Chinese || null,
                                row.English || null,
                                row.Remark_1 || null,
                                row.Remark_2 || null
                            ]);
                            const result = await db.prepare(query).bind(...params).run();
                            insertedCount += result.meta.changes || 0;
                        }
                    } else if (table === 'world_history') {
                        // 12 columns, safe batch size: 999/12 = 83 rows
                        const safeBatchSize = 80;
                        for (let i = 0; i < data.length; i += safeBatchSize) {
                            const batch = data.slice(i, i + safeBatchSize);
                            const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
                            const query = `INSERT INTO world_history (CATEGORY, REGION, PERIOD, SUB_CATEGORY_1, SUB_CATEGORY_2, TITLE, BACKGROUND, EVENT, IMPACT, REMARK_1, REMARK_2, REMARK_3) VALUES ${placeholders}`;
                            const params = batch.flatMap(row => [
                                row.CATEGORY || null,
                                row.REGION || null,
                                row.PERIOD || null,
                                row.SUB_CATEGORY_1 || null,
                                row.SUB_CATEGORY_2 || null,
                                row.TITLE || null,
                                row.BACKGROUND || null,
                                row.EVENT || null,
                                row.IMPACT || null,
                                row.REMARK_1 || null,
                                row.REMARK_2 || null,
                                row.REMARK_3 || null
                            ]);
                            const result = await db.prepare(query).bind(...params).run();
                            insertedCount += result.meta.changes || 0;
                        }
                    } else if (table === 'chinese_poem') {
                        // 8 columns, safe batch size: 999/8 = 124 rows
                        const safeBatchSize = 120;
                        for (let i = 0; i < data.length; i += safeBatchSize) {
                            const batch = data.slice(i, i + safeBatchSize);
                            const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
                            const query = `INSERT INTO chinese_poem (Title, Number, Poem, Remark_1, Remark_2, Remark_3, Author, Dynasty) VALUES ${placeholders}`;
                            const params = batch.flatMap(row => [
                                row.Title || null,
                                row.Number || null,
                                row.Poem || null,
                                row.Remark_1 || null,
                                row.Remark_2 || null,
                                row.Remark_3 || null,
                                row.Author || null,
                                row.Dynasty || null
                            ]);
                            const result = await db.prepare(query).bind(...params).run();
                            insertedCount += result.meta.changes || 0;
                        }
                    } else if (table === 'vocabulary') {
                        // 15 columns, safe batch size: 999/15 = 66 rows
                        const safeBatchSize = 60;
                        for (let i = 0; i < data.length; i += safeBatchSize) {
                            const batch = data.slice(i, i + safeBatchSize);
                            const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
                            const query = `INSERT INTO vocabulary (Word_Rank, Word, Word_ID, US_Pronunciation, UK_Pronunciation, US_Speech, UK_Speech, Translations, Synonyms, Example_Sentences, Remark_1, Remark_2, Remark_3, Remark_4, Remark_5) VALUES ${placeholders}`;
                            const params = batch.flatMap(row => [
                                row.Word_Rank || null,
                                row.Word || null,
                                row.Word_ID || null,
                                row.US_Pronunciation || null,
                                row.UK_Pronunciation || null,
                                row.US_Speech || null,
                                row.UK_Speech || null,
                                row.Translations || null,
                                row.Synonyms || null,
                                row.Example_Sentences || null,
                                row.Remark_1 || null,
                                row.Remark_2 || null,
                                row.Remark_3 || null,
                                row.Remark_4 || null,
                                row.Remark_5 || null
                            ]);
                            const result = await db.prepare(query).bind(...params).run();
                            insertedCount += result.meta.changes || 0;
                        }
                    } else {
                        // Fallback for other tables using batch API
                        await db.batch(data.map(row => {
                            const columns = Object.keys(row).join(', ');
                            const placeholders = Object.keys(row).map(() => '?').join(', ');
                            const values = Object.values(row);
                            return db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).bind(...values);
                        }));
                        insertedCount = data.length;
                    }

                    return new Response(JSON.stringify({
                        success: true,
                        message: `Data uploaded successfully. Cleared ${deletedCount} existing records and inserted ${insertedCount} new records.`,
                        insertedCount,
                        deletedCount,
                        totalRows: insertedCount
                    }), {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                    });
                } catch (error) {
                    throw new Error(`Upload failed: ${error.message}`);
                }

            default:
                throw new Error(`Unsupported action: ${action}`);
        }

    } catch (error) {
        console.error("Database error:", error);
        return new Response(
            JSON.stringify({ 
                success: false,
                error: error.message,
                details: "If you're seeing a database binding error, please ensure the D1 database is properly bound in your Cloudflare Pages settings."
            }), 
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    }
}