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
        const table = context.params.table;
        
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

        // Validate table name to prevent SQL injection
        const validTables = ['chinese_dynasty', 'quote', "vocabulary", "chinese_poem", "english_dialog", "world_history", "lab_warehouse"];
        if (!validTables.includes(table)) {
            throw new Error("Invalid table name");
        }

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

        // Use D1's JavaScript transaction API
        try {
            // First, clear existing data from the table
            const deleteResult = await db.prepare(`DELETE FROM ${table}`).run();
            deletedCount = deleteResult.meta.changes || 0;

            // Then insert new data
            if (table === 'lab_warehouse') {
                await db.batch(data.map(row => {
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
                }));
            } else {
                // For other tables, use generic insert
                const columns = Object.keys(data[0]);
                const placeholders = columns.map(() => '?').join(', ');
                
                await db.batch(data.map(row => {
                    const values = columns.map(col => row[col] || null);
                    return db.prepare(`
                        INSERT INTO ${table} (${columns.join(', ')})
                        VALUES (${placeholders})
                    `).bind(...values);
                }));
            }

            insertedCount = data.length;

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
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}