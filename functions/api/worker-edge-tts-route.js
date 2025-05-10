/**
 * Route handler for Worker Edge TTS API
 * This module forwards requests to the worker-edge-tts handler
 */

import { onRequest as workerEdgeTTSHandler } from './worker-edge-tts';

export const onRequest = async (context) => {
  try {
    // Add CORS headers to the response
    const response = await workerEdgeTTSHandler(context);
    
    // If the response is already an audio file, return it directly
    if (response.headers.get('Content-Type') === 'audio/mpeg') {
      return response;
    }
    
    // Otherwise, clone the response to add CORS headers for error responses
    const corsResponse = new Response(response.body, response);
    
    // Add CORS headers
    corsResponse.headers.set('Access-Control-Allow-Origin', '*');
    corsResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    corsResponse.headers.set('Access-Control-Max-Age', '86400');
    
    return corsResponse;
  } catch (error) {
    console.error('Edge TTS Route error:', error);
    
    // Return an error response with CORS headers
    return new Response(JSON.stringify({
      success: false,
      error: `Route handler error: ${error.message || 'Unknown error'}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}; 