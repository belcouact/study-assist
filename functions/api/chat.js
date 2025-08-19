// Import the workerChatOutput function
import { workerChatOutput } from './worker-chat.js';

// Handle chat requests to DeepSeek API
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Get request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        message: e.message
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Check for different request formats
    if (body.prompt) {
      // Worker-chat format - single prompt
      try {
        // Call the workerChatOutput function with the prompt and env
        const output = await workerChatOutput(body.prompt, env);
        
        // Return the response
          return new Response(JSON.stringify({
          output: output
          }), {
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
      } catch (error) {
          return new Response(JSON.stringify({
          error: "Error generating response",
          message: error.message
          }), {
          status: 500,
            headers: { 
              "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    } else if (body.messages && Array.isArray(body.messages)) {
      // Original DeepSeek API format - messages array
      try {
        // Get API key from environment
        const DS_KEY = env.DEEPSEEK_API_KEY;
        if (!DS_KEY) {
          throw new Error('API key not configured');
        }
        
        // Forward to DeepSeek API directly
        const DS_URL = "https://api.deepseek.com/v1/chat/completions";
        
        const deepSeekResponse = await fetch(DS_URL, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DS_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: body.messages,
            temperature: 0.7,
            max_tokens: 2000
          })
        });
        
        if (!deepSeekResponse.ok) {
          const errorData = await deepSeekResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `DeepSeek API error: ${deepSeekResponse.status}`);
        }
        
        const result = await deepSeekResponse.json();
        
        // Return the original DeepSeek response format
        return new Response(JSON.stringify(result), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
          error: "Error calling DeepSeek API",
          message: error.message
        }), {
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    } else {
      return new Response(JSON.stringify({ 
        error: "Missing prompt or messages in request body"
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Server error",
      message: error.message
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

// Handle OPTIONS requests for CORS
export function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store"
    }
  });
}

// Handle GET requests in the same function
export function onRequestGet() {
  return new Response(JSON.stringify({
    message: "The chat API is working. Send POST requests to this endpoint to interact with the AI.",
    example: {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {role: "system", content: "You are a helpful assistant"},
          {role: "user", content: "Hello, how are you?"}
        ]
      }, null, 2)
    }
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
