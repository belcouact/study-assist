// Text-to-Speech API using MiniMax
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Get API key and Group ID from environment variables
    const apiKey = env.MINIMAX_API_KEY;
    const groupId = env.MINIMAX_GROUP_ID;
    
    if (!apiKey || !groupId) {
      return new Response(JSON.stringify({ 
        error: "API credentials not configured",
        troubleshooting_tips: [
          "Set the MINIMAX_API_KEY and MINIMAX_GROUP_ID environment variables in your Cloudflare Pages dashboard",
          "Make sure the credentials are correct and have not expired"
        ]
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Get request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        message: e.message,
        troubleshooting_tips: [
          "Check that your request includes a valid JSON body",
          "Verify the Content-Type header is set to application/json"
        ]
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
    
    // Validate required parameters
    if (!body.text) {
      return new Response(JSON.stringify({
        error: "Missing required parameter: text",
        troubleshooting_tips: [
          "Include 'text' parameter in your request body"
        ]
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
    
    // Prepare request body with default values if not provided
    const requestBody = {
      model: body.model || "speech-02-hd",
      text: body.text,
      timber_weights: body.timber_weights || [
        {
          voice_id: body.voice_id || "Chinese (Mandarin)_Male_Announcer",
          weight: 1
        }
      ],
      voice_setting: body.voice_setting || {
        voice_id: "",
        speed: body.speed || 1,
        pitch: body.pitch || 0,
        vol: body.volume || 1,
        latex_read: false
      },
      audio_setting: body.audio_setting || {
        sample_rate: 32000,
        bitrate: 128000,
        format: body.format || "mp3"
      },
      language_boost: body.language_boost || "auto"
    };
    
    // Create an AbortController with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 seconds timeout
    
    try {
      // Make API request to MiniMax
      const response = await fetch(`https://api.minimax.chat/v1/t2a_v2?GroupId=${groupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Handle API response
      if (!response.ok) {
        try {
          const errorData = await response.json();
          return new Response(JSON.stringify({
            error: "MiniMax API request failed",
            status: response.status,
            statusText: response.statusText,
            apiError: errorData,
            troubleshooting_tips: [
              "Check your API key and Group ID are valid",
              "Verify the request format is correct",
              "The API service might be experiencing issues"
            ]
          }), {
            status: response.status,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
        } catch (e) {
          // If can't parse as JSON, return text
          const textContent = await response.text();
          return new Response(JSON.stringify({
            error: "MiniMax API request failed with non-JSON response",
            status: response.status,
            statusText: response.statusText,
            responseText: textContent.substring(0, 500),
            troubleshooting_tips: [
              "Check your API key and Group ID are valid",
              "Verify the API endpoint is correct",
              "The API service might be experiencing issues"
            ]
          }), {
            status: response.status,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
        }
      }

      // Handle successful response - return audio data or JSON response
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("audio")) {
        // If response is audio, return it directly with appropriate CORS headers
        const audioData = await response.arrayBuffer();
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Access-Control-Allow-Origin", "*");
        newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        return new Response(audioData, {
          status: 200,
          headers: newHeaders
        });
      } else {
        // If response is JSON, parse and return
        try {
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: { 
              "Content-Type": "application/json; charset=utf-8",
              "X-Content-Type-Options": "nosniff",
              "Cache-Control": "no-store",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
        } catch (e) {
          const textContent = await response.text();
          return new Response(JSON.stringify({
            error: "Failed to parse API response",
            message: e.message,
            responseText: textContent.substring(0, 500),
            troubleshooting_tips: [
              "The API might be returning malformed data",
              "Check if the API endpoint is correct"
            ]
          }), {
            status: 502,
            headers: { 
              "Content-Type": "application/json; charset=utf-8",
              "X-Content-Type-Options": "nosniff",
              "Cache-Control": "no-store",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
        }
      }
    } catch (error) {
      // Clear the timeout if it's still active
      clearTimeout(timeoutId);
      
      // Check if this was a timeout error
      if (error.name === 'AbortError') {
        return new Response(JSON.stringify({ 
          error: "Request timeout",
          message: "The request to the MiniMax API timed out after 30 seconds",
          troubleshooting_tips: [
            "The API service might be experiencing high load",
            "Try again later or with a shorter text",
            "Check if the API endpoint is correct"
          ]
        }), {
          status: 504, // Gateway Timeout
          headers: { 
            "Content-Type": "application/json; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: "Server error processing request",
        message: error.message,
        stack: error.stack,
        troubleshooting_tips: [
          "This is likely a bug in the serverless function",
          "Check the Cloudflare Pages function logs for more details",
          "Verify that all environment variables are set correctly"
        ]
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Unhandled server error",
      message: error.message,
      stack: error.stack,
      troubleshooting_tips: [
        "This is an unexpected error in the serverless function",
        "Check the Cloudflare Pages function logs for more details"
      ]
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}

// Handle OPTIONS request for CORS preflight
export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// Handle GET requests
export function onRequestGet() {
  return new Response(JSON.stringify({
    error: "Method not allowed",
    message: "This endpoint only supports POST requests",
    troubleshooting_tips: [
      "Use a POST request with JSON body containing 'text' parameter",
      "Set Content-Type header to application/json"
    ]
  }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      "Allow": "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

export const config = {
  runtime: 'edge',
  maxDuration: 60 // Set maximum duration to 60 seconds
}; 