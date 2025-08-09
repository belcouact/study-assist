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
        const { database } = context.params;
        let db;

        // Determine which database to use
        if (database === 'gore') {
            if (!context.env.DB_GORE) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Database binding "DB_GORE" not found.',
                    availableBindings: Object.keys(context.env || {})
                }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }
            db = context.env.DB_GORE;
        } else {
            if (!context.env.DB) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Database binding "DB" not found.',
                    availableBindings: Object.keys(context.env || {})
                }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }
            db = context.env.DB;
        }

        // Get list of tables
        let tables;
        try {
            const result = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            tables = result.results.map(row => row.name);
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to query tables: ' + error.message,
                database: database
            }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }

        // Check if lab_samples exists specifically
        const labSamplesExists = tables.includes('lab_samples');
        
        // Get table info for lab_samples if it exists
        let labSamplesInfo = null;
        if (labSamplesExists) {
            try {
                const info = await db.prepare("PRAGMA table_info(lab_samples)").all();
                labSamplesInfo = info.results;
            } catch (error) {
                labSamplesInfo = 'Error getting table info: ' + error.message;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            database: database,
            tables: tables,
            lab_samples_exists: labSamplesExists,
            lab_samples_info: labSamplesInfo
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
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}