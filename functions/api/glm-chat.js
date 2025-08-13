// Import the glmWorkerOutput function
let glmWorkerOutput;
try {
  // Try CommonJS import first
  const glmWorker = require('./glm-worker.js');
  glmWorkerOutput = glmWorker.glmWorkerOutput;
} catch (e) {
  // Fallback to global variable if in browser context
  if (typeof self !== 'undefined' && self.glmWorkerOutput) {
    glmWorkerOutput = self.glmWorkerOutput;
  } else {
    console.error('Failed to import glmWorkerOutput:', e);
  }
}

// Handle chat requests to GLM-4.5 API
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
        // Call the glmWorkerOutput function with the prompt and env
        const output = await glmWorkerOutput(body.prompt, env);
        
        // Return the response
        return new Response(JSON.stringify({
          output: output,
          model: "GLM-4.5"
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
          error: "Error generating response from GLM-4.5",
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
      // GLM API format - messages array
      try {
        // Get API key from environment
        const GLM_KEY = env.GLM_API_KEY;
        if (!GLM_KEY) {
          throw new Error('GLM API key not configured');
        }
        
        // Forward to GLM API directly
        const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
        
        const glmResponse = await fetch(GLM_URL, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GLM_KEY}`
          },
          body: JSON.stringify({
            model: "glm-4-0520",
            messages: body.messages,
            temperature: 0.7,
            max_tokens: 2000
          })
        });
        
        if (!glmResponse.ok) {
          const errorData = await glmResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `GLM API error: ${glmResponse.status}`);
        }
        
        const result = await glmResponse.json();
        
        // Return the original GLM response format
        return new Response(JSON.stringify({
          ...result,
          model: "GLM-4.5"
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
          error: "Error calling GLM-4.5 API",
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
    message: "The GLM-4.5 chat API is working. Send POST requests to this endpoint to interact with the GLM-4.5 AI model.",
    model: "GLM-4.5",
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