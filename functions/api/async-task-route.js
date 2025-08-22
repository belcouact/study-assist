// Route handler for /api/async-task to forward to /functions/api/async-task
export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle OPTIONS method for CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://study-llm.me",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  
  // Create a new request to the functions/api/async-task endpoint
  const url = new URL(request.url);
  const newUrl = new URL(url);
  newUrl.pathname = '/functions/api/async-task';
  
  // Clone the request with the new URL
  const newRequest = new Request(newUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
    signal: request.signal
  });
  
  try {
    // Forward the request
    const response = await fetch(newRequest);
    
    // Add CORS headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "https://study-llm.me");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    // Return the response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error) {
    // Handle errors
    return new Response(JSON.stringify({
      error: "Failed to forward async task request",
      message: error.message,
      troubleshooting_tips: [
        "Check that the async task endpoint is configured correctly",
        "Verify that the Cloudflare Function is deployed",
        "Check the network connection"
      ]
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://study-llm.me",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}

export const config = {
  runtime: 'edge',
  maxDuration: 180
};