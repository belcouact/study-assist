// Route handler for /api/tts to forward to /functions/api/tts
export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle OPTIONS method for CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  
  // Create a new request to the functions/api/tts endpoint
  const url = new URL(request.url);
  const newUrl = new URL(url);
  newUrl.pathname = '/functions/api/tts';
  
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
    newHeaders.set("Access-Control-Allow-Origin", "*");
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
      error: "Failed to forward request",
      message: error.message,
      troubleshooting_tips: [
        "Check that the TTS API endpoint is configured correctly",
        "Verify that the Cloudflare Function is deployed",
        "Check the network connection"
      ]
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}

export const config = {
  runtime: 'edge',
  maxDuration: 60 // Set maximum duration to 60 seconds
}; 