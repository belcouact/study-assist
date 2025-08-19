// Route handler for /api/glm to forward to /functions/api/chat-glm
// Performance constants
const CACHE_TTL = 60 * 1000; // 1 minute cache
const REQUEST_TIMEOUT = 15000; // 15 seconds

// Simple in-memory cache for identical requests
const requestCache = new Map();

// Generate cache key from request body
async function generateCacheKey(request) {
  try {
    const body = await request.clone().json();
    const prompt = body.prompt || '';
    const messages = JSON.stringify(body.messages || []);
    return `${prompt}:${messages}`;
  } catch (e) {
    // If we can't parse the body, return a unique key
    return `unique-${Date.now()}-${Math.random()}`;
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const startTime = Date.now();
  
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
  
  try {
    // Generate cache key and check cache for identical non-streaming requests
    const cacheKey = await generateCacheKey(request);
    
    // Check if this is a streaming request
    const body = await request.clone().json();
    const isStreaming = body.stream === true;
    
    if (!isStreaming && requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`Cache hit for request: ${cacheKey}`);
        
        // Create response from cached data
        const cachedResponse = new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
        
        // Log performance metrics
        const responseTime = Date.now() - startTime;
        console.log(`GLM route (cached) completed in ${responseTime}ms`);
        
        return cachedResponse;
      } else {
        requestCache.delete(cacheKey);
      }
    }
    
    // Create a new request to the functions/api/chat-glm endpoint
    const url = new URL(request.url);
    const newUrl = new URL(url);
    newUrl.pathname = '/functions/api/chat-glm';
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      // Clone the request with the new URL and timeout
      const newRequest = new Request(newUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: request.redirect,
        signal: controller.signal
      });
      
      // Forward the request
      const response = await fetch(newRequest);
      clearTimeout(timeoutId);
      
      // For non-streaming responses, cache the result
      if (!isStreaming && response.ok) {
        try {
          const responseData = await response.clone().json();
          requestCache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
          });
          
          // Clean up cache if it gets too large
          if (requestCache.size > 100) {
            const oldestKey = requestCache.keys().next().value;
            requestCache.delete(oldestKey);
          }
        } catch (e) {
          // If we can't parse the response as JSON, don't cache it
          console.warn('Could not cache response: not valid JSON');
        }
      }
      
      // Add CORS headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      
      // Log performance metrics
      const responseTime = Date.now() - startTime;
      console.log(`GLM route completed in ${responseTime}ms`);
      
      // Return the response
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('GLM route request timeout');
        return new Response(JSON.stringify({
          error: "Request timeout",
          message: "The request to the GLM API timed out",
          troubleshooting_tips: [
            "Try again with a shorter prompt",
            "Check if the GLM API is experiencing high load",
            "Reduce the complexity of your request"
          ]
        }), {
          status: 408,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      }
      
      throw fetchError;
    }
  } catch (error) {
    // Handle errors
    console.error('Error in GLM route:', error);
    return new Response(JSON.stringify({
      error: "Failed to forward GLM request",
      message: error.message,
      troubleshooting_tips: [
        "Check that the GLM API endpoint is configured correctly",
        "Verify that the Cloudflare Function is deployed",
        "Check the network connection",
        "Try again later if the service is temporarily unavailable"
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
  maxDuration: 180 // Set maximum duration to 180 seconds for longer GLM responses
};