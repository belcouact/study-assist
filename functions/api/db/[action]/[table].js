export async function onRequest(context) {
    // Handle CORS preflight requests
    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
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
                    ORDER BY Index ASC
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