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

        // Query dynasties
        const result = await db.prepare(`
            SELECT name as Dynasty, period as Period, 
                   start_year as StartYear, end_year as EndYear, 
                   capital as Capital
            FROM chinese_dynasty 
            ORDER BY start_year ASC
            LIMIT 100
        `).all();

        // Check if results exist
        if (!result || !result.results) {
            return new Response(JSON.stringify({
                success: true,
                dynasties: []
            }), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }

        // Return the results
        return new Response(JSON.stringify({ 
            success: true,
            dynasties: result.results 
        }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
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