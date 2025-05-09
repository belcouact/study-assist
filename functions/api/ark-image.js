/**
 * Ark Image Generation API
 * This module provides a serverless function for generating images using an external API.
 * It uses environment variables for API key and URL for security.
 */

export const onRequest = async (context) => {
  try {
    // Extract request data
    const { request, env } = context;
    
    // Check request method
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Only POST method is allowed'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extract parameters from request
    const { prompt, size = "1024x1024", style = "", count = 1 } = requestData;
    
    // Validate prompt
    if (!prompt) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Prompt is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get API key and URL from environment variables
    const apiKey = env.ARK_IMAGE_KEY;
    const apiUrl = env.ARK_IMAGE_URL;
    
    // Verify environment variables are set
    if (!apiKey || !apiUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error: Missing API credentials'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Construct full prompt with style if provided
    const fullPrompt = style ? `${style}风格，${prompt}` : prompt;
    
    // Call the image generation API
    const imageResponse = await generateImage(apiKey, apiUrl, fullPrompt, size, count);
    
    // Return the API response
    return new Response(JSON.stringify({
      success: true,
      data: imageResponse
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Call the external image generation API
 * 
 * @param {string} apiKey - API key from environment variable
 * @param {string} apiUrl - API URL from environment variable
 * @param {string} prompt - The text prompt for image generation
 * @param {string} size - Image size (e.g., "1024x1024")
 * @param {number} count - Number of images to generate
 * @returns {Object} The API response
 */
async function generateImage(apiKey, apiUrl, prompt, size, count) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      n: count,
      size: size,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
}

// For local testing and debugging
export const config = {
  path: "/api/ark-image",
  method: ["POST"],
}; 