// Middleware to handle Cloudflare Page Rules and Speculation API
export async function onRequest(context) {
  const { request, next } = context;
  
  // Get the response from the next middleware or page
  const response = await next();
  
  // Clone the response so we can modify headers
  const newResponse = new Response(response.body, response);
  
  // Add proper Speculation-Rules header with empty rules (to avoid 404 error)
  if (request.url.includes('/cdn-cgi/speculation')) {
    // Return a proper response for the speculation rules
    return new Response(JSON.stringify({
      prefetch: [{ source: "list", urls: [] }],
      prerender: [{ source: "list", urls: [] }]
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600"
      }
    });
  }
  
  // For all other requests, just pass through
  return newResponse;
} 