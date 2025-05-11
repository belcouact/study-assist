/**
 * Route handler for the Ark Image Generation API
 * This module forwards requests to the ark-image.js implementation
 */

const { generateImage } = require('./ark-image');

/**
 * API handler for text to image generation requests
 */
export const onRequest = async (context) => {
  try {
    // Set CORS headers
    context.header('Access-Control-Allow-Origin', '*');
    context.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    context.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (context.request.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }
    
    if (context.request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const requestData = await context.request.json();
    const { prompt, modelVersion, reqKey } = requestData;
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call the image generation function
    const result = await generateImage(prompt, modelVersion, reqKey);
    
    // Return the result
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate image',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// For local testing and debugging
export const config = {
  path: "/api/ark-image-route",
  method: ["POST", "OPTIONS"],
}; 