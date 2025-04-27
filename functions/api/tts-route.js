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
  
  // Log the forwarding if in development mode
  if (env.NODE_ENV === 'development') {
    console.log(`Forwarding ${request.method} request from ${url.pathname} to ${newUrl.pathname}`);
  }
  
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
    
    // For audio responses, preserve content type
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("audio")) {
      // For audio responses, add CORS headers but preserve content type
      const audioData = await response.arrayBuffer();
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      
      // Ensure content type is set for audio/mpeg if not specified correctly
      if (!contentType.includes("mpeg")) {
        newHeaders.set("Content-Type", "audio/mpeg");
      }
      
      // Add caching headers for audio responses
      newHeaders.set("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
      
      return new Response(audioData, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } else {
      // For non-audio responses (like JSON errors), add CORS headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      newHeaders.set("Cache-Control", "no-store"); // Don't cache error responses
      
      // Return the response
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
  } catch (error) {
    // Log the error if in development mode
    if (env.NODE_ENV === 'development') {
      console.error('Error forwarding request:', error);
    }
    
    // Handle errors
    return new Response(JSON.stringify({
      error: "Failed to forward request to TTS endpoint",
      message: error.message,
      troubleshooting_tips: [
        "Check that the API endpoint is configured correctly",
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