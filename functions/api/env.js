// Handle environment variable requests
export async function onRequest(context) {
  const { request, env, params } = context;
  
  // Handle OPTIONS method for CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  
  // Extract the key from the URL path
  const url = new URL(request.url);
  const pathname = url.pathname;
  const key = pathname.split('/').pop(); // Get the last part of the path
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  
  try {
    // Get the environment variable value
    const envValue = env[key];
    
    if (envValue !== undefined) {
      // Return the environment variable value
      return new Response(JSON.stringify({
        key,
        value: envValue
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    } else {
      // Environment variable not found
      return new Response(JSON.stringify({
        error: `Environment variable ${key} not found`
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
  } catch (error) {
    // Handle errors
    console.error('Error getting environment variable:', error);
    return new Response(JSON.stringify({
      error: "Failed to get environment variable",
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}