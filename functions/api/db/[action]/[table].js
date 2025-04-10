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
        const validTables = ['chinese_dynasty']; // Add more tables as needed
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
                    ORDER BY Number ASC
                    LIMIT 100
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

                // Begin transaction
                await db.prepare('BEGIN TRANSACTION').run();
                let insertedCount = 0;

                try {
                    // Prepare the insert statement
                    const stmt = await db.prepare(`
                        INSERT INTO ${table} (Number, Dynasty, Period, Title, Event)
                        VALUES (?, ?, ?, ?, ?)
                    `);

                    // Insert each row
                    for (const row of data) {
                        await stmt.bind(
                            row.Number || null,
                            row.Dynasty || null,
                            row.Period || null,
                            row.Title || null,
                            row.Event || null
                        ).run();
                        insertedCount++;
                    }

                    // Commit transaction
                    await db.prepare('COMMIT').run();

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
                    // Rollback on error
                    await db.prepare('ROLLBACK').run();
                    throw error;
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