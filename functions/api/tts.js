// Handle text-to-speech requests to MiniMax API
export async function onRequestPost(context) {
  // CORS headers for all responses
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Check for required credentials
  const GROUP_ID = context.env.MINIMAX_GROUP_ID;
  const API_KEY = context.env.MINIMAX_API_KEY;
  
  if (!GROUP_ID || !API_KEY) {
    console.error("Missing required MiniMax API credentials");
    return new Response(JSON.stringify({
      error: "Server configuration error: Missing API credentials"
    }), {
      status: 500,
      headers: corsHeaders
    });
  }

  try {
    // Parse request body
    const requestData = await context.request.json();
    
    // Validate required fields
    if (!requestData.text) {
      return new Response(JSON.stringify({
        error: "Missing required 'text' field"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    // Prepare request data for MiniMax API
    const voiceId = getMiniMaxVoiceId(requestData.voice);
    console.log(`Mapping voice '${requestData.voice}' to MiniMax voice_id: '${voiceId}'`);
    
    // Ensure all parameters match the expected types for MiniMax API
    const payload = {
      text: requestData.text,
      model: "speech-01",
      voice_id: voiceId,
      speed: Number(requestData.speed || 1.0),
      vol: Number(requestData.volume || 1.0),
      pitch: Number(requestData.pitch || 0)
      // Remove problematic parameters
    };
    
    // Debug the final JSON structure
    const finalJSON = JSON.stringify(payload);
    console.log(`Final request payload: ${finalJSON}`);
    
    // Log request to MiniMax API
    console.log(`Sending TTS request to MiniMax API for text: "${payload.text.substring(0, 30)}${payload.text.length > 30 ? '...' : ''}"`);
    
    // Call MiniMax API
    const miniMaxUrl = `https://api.minimax.chat/v1/text_to_speech?GroupId=${GROUP_ID}`;
    
    const response = await fetch(miniMaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: finalJSON
    });
    
    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MiniMax API error (${response.status}): ${errorText}`);
      return new Response(JSON.stringify({
        error: `MiniMax API returned ${response.status}`,
        details: errorText
      }), {
        status: response.status,
        headers: corsHeaders
      });
    }
    
    // Check content type
    const contentType = response.headers.get('Content-Type') || '';
    console.log(`MiniMax API responded with Content-Type: ${contentType}`);
    
    // Handle response based on content type
    if (contentType.includes('application/json')) {
      const jsonResponse = await response.json();
      
      if (jsonResponse.audio_base64) {
        // Convert base64 to binary data
        const binaryString = atob(jsonResponse.audio_base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log(`Returning audio data (${bytes.length} bytes)`);
        
        // Return audio data with appropriate headers
        return new Response(bytes, {
          headers: {
            'Content-Type': 'audio/mp3',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      } else {
        // Return JSON response if no audio data found
        return new Response(JSON.stringify(jsonResponse), {
          headers: corsHeaders
        });
      }
    } else {
      // Assume binary audio data from response
      const audioData = await response.arrayBuffer();
      
      // Check if we have data
      if (audioData.byteLength === 0) {
        return new Response(JSON.stringify({
          error: "Received empty audio data from MiniMax API",
          tip: "Check API credentials and request parameters"
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
      
      console.log(`Returning binary audio data (${audioData.byteLength} bytes)`);
      
      // Return binary data with appropriate headers
      return new Response(audioData, {
        headers: {
          'Content-Type': 'audio/mp3',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  } catch (error) {
    console.error(`Error processing TTS request: ${error.message}`);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Handle GET requests with a friendly message
export function onRequestGet() {
  return new Response(JSON.stringify({
    message: "This is the TTS API endpoint. Please make a POST request with text data to convert to speech.",
    example: {
      "text": "人工智能不是要替代人类，而是要增强人类的能力。",
      "voice": "Chinese (Mandarin)_Male_Announcer",
      "speed": 1.0,
      "pitch": 0,
      "volume": 1.0
    },
    supported_voices: {
      "Chinese (Mandarin)_Male_Announcer": "Male voice with professional announcer tone",
      "Chinese (Mandarin)_Female_Announcer": "Female voice with professional announcer tone",
      "Chinese (Mandarin)_Male_Friendly": "Male voice with friendly, natural tone",
      "Chinese (Mandarin)_Female_Friendly": "Female voice with friendly, natural tone"
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

// Function to map frontend voice IDs to MiniMax voice IDs
function getMiniMaxVoiceId(frontendVoice) {
  // Default voice if none provided
  if (!frontendVoice) return "male-qn-qingse";
  
  // Voice mapping
  // 
  const voiceMap = {
    "Chinese (Mandarin)_Male_Announcer": "male-qn-qingse",
    "Chinese (Mandarin)_Female_Friendly": "female-shaonv",
    "English_ReservedYoungMan": "male-en-us-reserved",
    "English_Wiselady": "female-en-us-wiselady"
  };
  
  // Return mapped voice or default if mapping not found
  return voiceMap[frontendVoice] || "male-qn-qingse";
}

export const config = {
  runtime: 'edge',
  maxDuration: 60 // Set maximum duration to 60 seconds
}; 