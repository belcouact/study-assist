/**
 * Ark Image Generation API
 * This module provides a serverless function for generating images using an external API.
 * It uses environment variables for API key and URL for security.
 */

import { createHash, createHmac } from 'crypto';
import axios from 'axios';

// 豆包 Text to Image API implementation
const API_URL = process.env.ARK_IMAGE_URL;
const ACCESS_KEY = process.env.ARK_IMAGE_KEY;
const SECRET_KEY = process.env.DOUPACK_SECRET_KEY;

/**
 * Generate SHA-256 hash of the given data
 * @param {string|Buffer} data - Data to hash
 * @returns {string} - Hex encoded hash
 */
function hashSHA256(data) {
  const hash = createHash('sha256');
  hash.update(typeof data === 'string' ? data : Buffer.from(data));
  return hash.digest('hex');
}

/**
 * Get formatted X-Date header
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - Formatted date
 */
function getFormattedXDate(timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Generate signature for the API request
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @param {string} accessKey - Access key
 * @param {string} secretKey - Secret key
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {string} contentType - Content type
 * @param {string} requestBody - Request body
 * @returns {string} - Authorization header value
 */
function generateSignature(timestamp, accessKey, secretKey, method, path, contentType, requestBody) {
  const xDate = getFormattedXDate(timestamp);
  const contentSha256 = hashSHA256(requestBody);
  
  const stringToSign = `${method}\n${path}\n${contentType}\n${xDate}\n${contentSha256}`;
  const signature = createHmac('sha256', secretKey).update(stringToSign).digest('hex');
  
  return `HMAC-SHA256 AccessKey=${accessKey}, Signature=${signature}`;
}

/**
 * Generate image from text prompt
 * @param {string} prompt - Text prompt for image generation
 * @param {string} modelVersion - Model version, default is "general_v2.0_L"
 * @param {string} reqKey - Request key, default is "high_aes_general_v20_L"
 * @returns {Promise<Object>} - API response
 */
async function generateImage(prompt, modelVersion = "general_v2.0_L", reqKey = "high_aes_general_v20_L") {
  try {
    const timestamp = Date.now();
    const method = "POST";
    const path = "/generate";
    const contentType = "application/json";

    const requestData = {
      req_key: reqKey,
      prompt: prompt,
      model_version: modelVersion
    };

    const requestBody = JSON.stringify(requestData);
    const signature = generateSignature(
      timestamp, 
      ACCESS_KEY, 
      SECRET_KEY, 
      method, 
      path, 
      contentType, 
      requestBody
    );

    const response = await axios({
      method: method,
      url: API_URL,
      headers: {
        'Content-Type': contentType,
        'X-Date': getFormattedXDate(timestamp),
        'X-Content-Sha256': hashSHA256(requestBody),
        'Authorization': signature
      },
      data: requestData
    });

    return response.data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

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
    const imageResponse = await generateImage(fullPrompt, size, count);
    
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

// For local testing and debugging
export const config = {
  path: "/api/ark-image",
  method: ["POST"],
};

export { generateImage }; 