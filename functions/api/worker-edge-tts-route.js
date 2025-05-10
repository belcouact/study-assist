/**
 * Route handler for Worker Edge TTS API
 * This module forwards requests to the worker-edge-tts handler
 */

import { onRequest as workerEdgeTTSHandler } from './worker-edge-tts';

export const onRequest = async (context) => {
  try {
    // Forward the request to the worker handler
    const response = await workerEdgeTTSHandler(context);
    
    // Response should already have CORS headers from the worker
    // but let's ensure they're set properly
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // If it's a preflight request (OPTIONS), return immediately
    if (context.request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // For audio responses, return as is since they already have proper headers
    const contentType = response.headers.get('Content-Type');
    if (contentType === 'audio/mpeg') {
      return response;
    }

    // For error responses, ensure CORS headers are present
    const responseBody = await response.text();
    return new Response(responseBody, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Route handler error:', error);
    
    // Return error response with CORS headers
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error in route handler'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
};