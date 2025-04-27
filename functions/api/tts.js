// Handle text-to-speech requests to MiniMax API
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Get API credentials from environment variables
    const groupId = env.MINIMAX_GROUP_ID;
    const apiKey = env.MINIMAX_API_KEY;
    
    if (!groupId || !apiKey) {
      return new Response(JSON.stringify({ 
        error: "MiniMax API credentials not configured",
        troubleshooting_tips: [
          "Set the MINIMAX_GROUP_ID and MINIMAX_API_KEY environment variables in your Cloudflare Pages dashboard",
          "Make sure the API credentials are correct and have not expired"
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
    
    // Validate the input text
    if (!body.text || typeof body.text !== 'string' || body.text.trim() === '') {
      return new Response(JSON.stringify({
        error: "Missing or invalid text input",
        troubleshooting_tips: [
          "Ensure you provide a non-empty 'text' field in your request"
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
    
    // Prepare the request to MiniMax API
    const requestBody = {
      "model": body.model || "speech-02-hd",
      "text": body.text,
      "timber_weights": body.timber_weights || [
        {
          "voice_id": body.voice || "Chinese (Mandarin)_Male_Announcer",
          "weight": 1
        }
      ],
      "voice_setting": body.voice_setting || {
        "voice_id": "",
        "speed": body.speed || 1,
        "pitch": body.pitch || 0,
        "vol": body.volume || 1,
        "latex_read": false
      },
      "audio_setting": body.audio_setting || {
        "sample_rate": 32000,
        "bitrate": 128000,
        "format": "mp3"
      },
      "language_boost": body.language_boost || "auto"
    };
    
    // Create an AbortController with a 60-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000); // 60 seconds timeout
    
    try {
      // Forward request to MiniMax API
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
      
      // Check if response is OK
      if (!response.ok) {
        let errorResponse;
        
        try {
          errorResponse = await response.json();
        } catch {
          errorResponse = { message: await response.text() };
        }
        
        return new Response(JSON.stringify({
          error: "API request failed",
          status: response.status,
          statusText: response.statusText,
          apiError: errorResponse,
          troubleshooting_tips: [
            "Check your API key and group ID are valid",
            "Verify the request format is correct",
            "The MiniMax TTS service might be experiencing issues"
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
      
      // Return the successful response directly with proper headers
      // This preserves the binary audio data or JSON response from MiniMax
      const contentType = response.headers.get("Content-Type");
      
      return new Response(response.body, {
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Cache-Control": "public, max-age=86400" // Cache audio for 24 hours
        }
      });
    } catch (error) {
      // Clear the timeout if it's still active
      clearTimeout(timeoutId);
      
      // Check if this was a timeout error
      if (error.name === 'AbortError') {
        return new Response(JSON.stringify({ 
          error: "Request timeout",
          message: "The request to the MiniMax API timed out after 60 seconds",
          troubleshooting_tips: [
            "The MiniMax service might be experiencing high load",
            "Try again later or with shorter text",
            "Verify that your API credentials have the correct permissions"
          ]
        }), {
          status: 504, // Gateway Timeout
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: "Server error processing request",
        message: error.message,
        troubleshooting_tips: [
          "This is likely a bug in the serverless function",
          "Check the Cloudflare Pages function logs for more details",
          "Verify that all environment variables are set correctly"
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
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Unexpected server error",
      message: error.message,
      troubleshooting_tips: [
        "This is an unexpected error in the serverless function",
        "Please report this issue to the developer"
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
}

// Handle OPTIONS requests for CORS
export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  });
}

// Handle GET requests with a friendly message
export function onRequestGet() {
  return new Response(JSON.stringify({
    message: "This is the TTS API endpoint. Please make a POST request with text data to convert to speech.",
    example: {
      "text": "人工智能不是要替代人类，而是要增强人类的能力。",
      "speed": 1,
      "pitch": 0,
      "volume": 1,
      "voice": "Chinese (Mandarin)_Male_Announcer"
    }
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export const config = {
  runtime: 'edge',
  maxDuration: 60 // Set maximum duration to 60 seconds
}; 