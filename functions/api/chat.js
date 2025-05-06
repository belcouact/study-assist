// Import the workerChatOutput function
const { workerChatOutput } = require('./worker-chat.js');

// Handle chat requests to DeepSeek API
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Log environment state
    console.log('Environment state:', {
      hasEnv: !!env,
      availableKeys: env ? Object.keys(env) : []
    });
    
    // Get request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('JSON parse error:', e);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        message: e.message,
        details: "Make sure you're sending a valid JSON object with a 'prompt' field"
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
    
    if (!body.prompt) {
      return new Response(JSON.stringify({ 
        error: "Missing prompt in request body",
        details: "The request body must include a 'prompt' field"
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    try {
      // Call the workerChatOutput function with the prompt and env
      console.log('Calling workerChatOutput with prompt:', body.prompt.substring(0, 50) + '...');
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
      console.error('Worker error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      return new Response(JSON.stringify({ 
        error: "Error generating response",
        message: error.message,
        type: error.name,
        details: "An error occurred while processing your request with the AI service"
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  } catch (error) {
    console.error('Server error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: "Server error",
      message: error.message,
      type: error.name,
      details: "An unexpected error occurred while processing your request"
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
