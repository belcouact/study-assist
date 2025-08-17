// Route handler for /api/worker-data-analysis to forward to /functions/api/data-analysis
const { dataAnalysisRoute } = require('./data-analysis-route');

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
  
  // Handle POST requests for data analysis
  if (request.method === 'POST') {
    return dataAnalysisRoute(request, env);
  }
  
  // Return 405 for other methods
  return new Response('Method not allowed', { 
    status: 405,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

export const config = {
  runtime: 'edge',
  maxDuration: 180 // Set maximum duration to 180 seconds for data analysis
};

// For browser environments
if (typeof window !== 'undefined') {
  window.onRequest = onRequest;
}