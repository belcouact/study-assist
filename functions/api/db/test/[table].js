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

        // Test connection for specific table
        const testResult = await db.prepare(`SELECT 1 FROM ${table} LIMIT 1`).first();
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