// Middleware to handle Cloudflare Page Rules and Speculation API
export async function onRequest(context) {
  const { request, next } = context;
  
  // Check if this is a request to the speculation rules endpoint
  if (new URL(request.url).pathname === '/cdn-cgi/speculation') {
    // Return a proper response for the speculation rules with some actual useful rules
    return new Response(JSON.stringify({
      prefetch: [
        {
          source: "document",
          where: {
            and: [{ href_matches: "/*", relative_to: "document" }]
          },
          eagerness: "conservative"
        }
      ]
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  
  // For regular page requests, add the Speculation-Rules header pointing to our endpoint
  const response = await next();
  const newResponse = new Response(response.body, response);
  
  // Only add the header to HTML responses
  const contentType = newResponse.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    newResponse.headers.set('Speculation-Rules', '/cdn-cgi/speculation');
  }
  
  return newResponse;
} 