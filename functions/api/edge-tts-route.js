// Route handler for Edge TTS API
export async function onRequest(context) {
  const { request } = context;
  
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

  // Forward request to the edge-tts handler
  const module = await import('./edge-tts.js');
  
  if (request.method === 'POST') {
    return module.onRequestPost(context);
  } else if (request.method === 'GET') {
    return module.onRequestGet(context);
  }
  
  // Handle unsupported methods
  return new Response('Method not allowed', { 
    status: 405,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export const config = {
  runtime: 'edge',
  maxDuration: 60
};
