// API endpoint for Cloudflare D1 database access
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

        // Get the URL path
        const url = new URL(context.request.url);
        const path = url.pathname;

        // Handle different endpoints
        if (path.endsWith('/test')) {
            // Test connection endpoint
            const testResult = await db.prepare('SELECT 1').first();
            if (testResult) {
                return new Response(JSON.stringify({
                    success: true,
                    message: "数据库连接成功！"
                }), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });
            }
            throw new Error("数据库连接测试失败");
        } else if (path.endsWith('/dynasties')) {
            // Query dynasties endpoint
            const result = await db.prepare(`
                SELECT Index, Dynasty, Period, Title, Event
                FROM chinese_dynasty 
                ORDER BY Index ASC
                LIMIT 100
            `).all();

            // Check if results exist
            if (!result || !result.results) {
                return new Response(JSON.stringify({ dynasties: [] }), {
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
        } else {
            // Invalid endpoint
            throw new Error("Invalid endpoint. Use /test for connection testing or /dynasties for querying dynasty data.");
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