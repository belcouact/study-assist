// GLM Worker Output Function
// This file provides the workerGlmOutput function for chat-glm.js

// Performance constants
const REQUEST_TIMEOUT = 25000; // 25 seconds (adjusted to be within Cloudflare limits)
const MAX_TOKENS = 20000;
const TEMPERATURE = 0.7;
const CACHE_TTL = 60 * 1000; // 1 minute cache

// Simple in-memory cache for identical requests
const requestCache = new Map();

// Generate cache key from prompt
function generateCacheKey(prompt) {
  return prompt.trim();
}

// Optimized function to handle GLM API requests
async function workerGlmOutput(prompt, env) {
  return await workerGlmOutputWithRetry(prompt, env);
}

// Retry mechanism for GLM API requests
async function workerGlmOutputWithRetry(prompt, env, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await workerGlmOutputInternal(prompt, env);
    } catch (error) {
      lastError = error;
      console.warn(`GLM API attempt ${attempt} failed:`, error.message);
      
      // If it's a timeout error, retry immediately
      if (error.message.includes('timeout') && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        continue;
      }
      
      // If it's a 5xx error, wait and retry
      if (error.status >= 500 && error.status < 600 && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        continue;
      }
      
      // Other errors don't retry
      break;
    }
  }
  
  throw lastError;
}

// Internal function for actual GLM API call
async function workerGlmOutputInternal(prompt, env) {
  const startTime = Date.now();
  
  try {
    // Get API key from environment
    const GLM_KEY = env.GLM_API_KEY;
    if (!GLM_KEY) {
      const error = new Error('GLM API key is not configured');
      error.troubleshooting_tips = [
        'Check that GLM_API_KEY environment variable is set',
        'Verify the API key is valid and not expired',
        'Contact your administrator if the issue persists'
      ];
      throw error;
    }
    
    // GLM API endpoint
    const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    
    // Check cache for identical requests
    const cacheKey = generateCacheKey(prompt);
    
    if (requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`Worker GLM cache hit for prompt: ${cacheKey}`);
        
        const responseTime = Date.now() - startTime;
        console.log(`Worker GLM (cached) completed in ${responseTime}ms`);
        
        return cached.data;
      } else {
        requestCache.delete(cacheKey);
      }
    }
    
    // Create messages array from prompt
    const messages = [{
      role: "user",
      content: prompt.trim()
    }];
    
    console.log('Sending GLM request with prompt:', prompt);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(GLM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GLM_KEY}`,
          "User-Agent": "GLM-Worker/1.0"
        },
        body: JSON.stringify({
          model: "glm-4.5",
          messages: messages,
          temperature: TEMPERATURE,
          max_tokens: MAX_TOKENS
        }),
        signal: controller.signal,
        // Performance optimizations
        cf: {
          connectTimeout: 5000,
          readTimeout: 10000
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('GLM Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const responseTime = Date.now() - startTime;
        
        console.error(`Worker GLM API error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        const error = new Error(errorData.error?.message || errorData.message || `GLM API error: ${response.status}`);
        error.status = response.status;
        error.response_time = `${responseTime}ms`;
        error.troubleshooting_tips = [
          'Check your API key is valid and has sufficient credits',
          'Verify the request payload is correctly formatted',
          'Try reducing the complexity of your prompt',
          'Check if the GLM API service is experiencing issues'
        ];
        throw error;
      }
      
      const result = await response.json();
      console.log('Raw GLM API response:', result);
      
      // Extract the content from the response
      const content = result.choices?.[0]?.message?.content || "No response from GLM";
      
      // Cache the result
      requestCache.set(cacheKey, {
        data: content,
        timestamp: Date.now()
      });
      
      // Clean up cache if it gets too large
      if (requestCache.size > 100) {
        const oldestKey = requestCache.keys().next().value;
        requestCache.delete(oldestKey);
      }
      
      const responseTime = Date.now() - startTime;
      console.log(`Worker GLM completed in ${responseTime}ms`);
      
      return content;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Worker GLM request timeout');
        const error = new Error("Request timeout");
        error.message = "The request to the GLM API timed out";
        error.status = 408;
        error.troubleshooting_tips = [
          "Try again with a shorter prompt",
          "Check if the GLM API is experiencing high load",
          "Reduce the complexity of your request"
        ];
        throw error;
      }
      
      throw fetchError;
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('GLM API call error:', error);
    
    // Add response time and troubleshooting tips if not already present
    if (!error.response_time) {
      error.response_time = `${responseTime}ms`;
    }
    
    if (!error.troubleshooting_tips) {
      error.troubleshooting_tips = [
        'Check the server logs for more details',
        'Verify all required environment variables are set',
        'Try again later if the issue persists'
      ];
    }
    
    throw error;
  }
}

// Handle HTTP requests
async function onRequest(context) {
  const { request, env } = context;
  const startTime = Date.now();
  
  try {
    // Handle OPTIONS method for CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    
    // Only handle POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        error: "Method not allowed",
        message: "Only POST method is supported",
        troubleshooting_tips: [
          "Use POST method with JSON body",
          "Include 'prompt' or 'messages' in your request"
        ]
      }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({
        error: "Invalid JSON",
        message: "Request body must be valid JSON",
        troubleshooting_tips: [
          "Ensure Content-Type is application/json",
          "Check JSON syntax for errors"
        ]
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Extract prompt from request
    const prompt = body.prompt || (body.messages && body.messages[0] && body.messages[0].content);
    
    if (!prompt) {
      return new Response(JSON.stringify({
        error: "Missing prompt",
        message: "Request must contain 'prompt' or 'messages' field",
        troubleshooting_tips: [
          "Include 'prompt' field in your request",
          "Or include 'messages' array with user message"
        ]
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Call the GLM API
    try {
      const result = await workerGlmOutput(prompt, env);
      const responseTime = Date.now() - startTime;
      
      return new Response(JSON.stringify({
        response: result,
        prompt: prompt,
        response_time: `${responseTime}ms`
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "X-Response-Time": `${responseTime}ms`
        }
      });
    } catch (glmError) {
      const responseTime = Date.now() - startTime;
      
      return new Response(JSON.stringify({
        error: glmError.message || "GLM API error",
        details: glmError.toString(),
        response_time: `${responseTime}ms`,
        troubleshooting_tips: glmError.troubleshooting_tips || [
          "Check the GLM API configuration",
          "Verify API key is valid",
          "Try again later"
        ]
      }), {
        status: glmError.status || 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "X-Response-Time": `${responseTime}ms`
        }
      });
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Error in worker-glm request handler:', error);
    
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message,
      response_time: `${responseTime}ms`,
      troubleshooting_tips: [
        "Check server logs for details",
        "Verify all environment variables are set",
        "Try again later"
      ]
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://study-llm.me",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "X-Response-Time": `${responseTime}ms`
      }
    });
  }
}

// Export for ES modules (Cloudflare Workers/Vercel)
export { workerGlmOutput, onRequest };

// Fallback for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { workerGlmOutput, onRequest };
}