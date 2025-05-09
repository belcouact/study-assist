/**
 * Route handler for the Ark Image Generation API
 * This module forwards requests to the ark-image.js implementation
 */

import { onRequest as arkImageHandler } from './ark-image';

export const onRequest = async (context) => {
  // Add CORS headers to the response
  const response = await arkImageHandler(context);
  
  // Clone the response to add CORS headers
  const corsResponse = new Response(response.body, response);
  
  // Add CORS headers
  corsResponse.headers.set('Access-Control-Allow-Origin', '*');
  corsResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  corsResponse.headers.set('Access-Control-Max-Age', '86400');
  
  return corsResponse;
};

// Handle OPTIONS requests for CORS preflight
export const onRequestOptions = async (context) => {
  // Create a Response with CORS headers
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
};

// Configuration for the route
export const config = {
  path: "/api/ark-image",
  method: ["POST", "OPTIONS"],
}; 