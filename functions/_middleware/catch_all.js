// Catch-all middleware to handle missing endpoints
export async function onRequest(context) {
  const { request, next } = context;
  
  try {
    // Try to process the request with the next handler
    return await next();
  } catch (err) {
    // If the request URL includes 'functions/api'
    if (request.url.includes('/functions/api')) {
      return new Response(JSON.stringify({
        error: "API endpoint not found or not accessible",
        message: "The API endpoint you're trying to access doesn't exist or is not configured correctly.",
        url: request.url,
        method: request.method,
        troubleshooting_tips: [
          "Check that the API endpoint path is correct",
          "Verify that the necessary Cloudflare Function is deployed",
          "Make sure your function has the correct export for this HTTP method"
        ]
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // For all other missing endpoints
    return new Response(JSON.stringify({
      error: "Resource not found",
      url: request.url
    }), {
      status: 404,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}