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
        // Check if DB binding exists
        if (!context.env.DB) {
            throw new Error('Database binding "DB" not found. Please check your Cloudflare Pages D1 database bindings.');
        }

        // Access the D1 database using the environment binding
        const db = context.env.DB;

        // Get the action and table from the URL parameters
        const { action, table } = context.params;

        // Validate table name to prevent SQL injection
        const validTables = ['chinese_dynasty', 'quote', "vocabulary", "chinese_poem", "english_dialog", "world_history"]; // Add more tables as needed
        if (!validTables.includes(table)) {
            throw new Error("Invalid table name");
        }

        // Handle different actions
        switch (action) {
            case 'test':
                // Test connection for specific table
                const testResult = await db.prepare(`SELECT 1 FROM ${table} LIMIT 1`).first();
                return new Response(JSON.stringify({
                    success: true,
                    message: `Successfully connected to ${table} table!`,
                    table: table
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
                const { data } = await context.request.json();
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error('Invalid data format. Expected non-empty array.');
                }

                let insertedCount = 0;

                // Use D1's JavaScript transaction API
                try {
                    if (table === 'chinese_dynasty') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO chinese_dynasty (Number, Dynasty, Period, Title, Event)
                                VALUES (?, ?, ?, ?, ?)
                            `).bind(
                                row.Number || null,
                                row.Dynasty || null,
                                row.Period || null,
                                row.Title || null,
                                row.Event || null
                            );
                        }));
                    } else if (table === 'quote') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO quote (Number, Type, Chinese, English, Remark_1, Remark_2)
                                VALUES (?, ?, ?, ?, ?, ?)
                            `).bind(
                                row.Number || null,
                                row.Type || null,
                                row.Chinese || null,
                                row.English || null,
                                row.Remark_1 || null,
                                row.Remark_2 || null
                            );
                        }));
                    } else if (table === 'world_history') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO world_history (CATEGORY, REGION, PERIOD, SUB_CATEGORY_1, SUB_CATEGORY_2, TITLE, BACKGROUND, EVENT, IMPACT, REMARK_1, REMARK_2, REMARK_3)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
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
                            );
                        }));
                    } else if (table === 'chinese_poem') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO chinese_poem (Title, Number, Poem, Remark_1, Remark_2, Remark_3, Author, Dynasty)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                                row.Title || null,
                                row.Number || null,
                                row.Poem || null,
                                row.Remark_1 || null,
                                row.Remark_2 || null,
                                row.Remark_3 || null,
                                row.Author || null,
                                row.Dynasty || null
                            );
                        }));
                    } else if (table === 'vocabulary') {
                        await db.batch(data.map(row => {
                            return db.prepare(`
                                INSERT INTO vocabulary (
                                    Word_Rank, Word, Word_ID, US_Pronunciation, UK_Pronunciation, 
                                    US_Speech, UK_Speech, Translations, Synonyms, Example_Sentences, 
                                    Remark_1, Remark_2, Remark_3, Remark_4, Remark_5
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
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
                            );
                        }));
                    }

                    insertedCount = data.length;

                    return new Response(JSON.stringify({
                        success: true,
                        message: 'Data uploaded successfully',
                        insertedCount
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