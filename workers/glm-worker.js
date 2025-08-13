// GLM-4.5 Worker for Cloudflare
// This worker handles GLM-4.5 API requests

// Import the GLM chat functionality
import { onRequestPost, onRequestOptions, onRequestGet } from '../functions/api/glm-chat.js';

// Export the request handlers
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle different HTTP methods
    switch (request.method) {
      case 'POST':
        return onRequestPost({ request, env });
      case 'GET':
        return onRequestGet({ request, env });
      case 'OPTIONS':
        return onRequestOptions();
      default:
        return new Response('Method not allowed', { 
          status: 405,
          headers: {
            'Allow': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
          }
        });
    }
  }
};