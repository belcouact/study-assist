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
    
    // Get voice ID from the mapping function
    const voiceId = getMiniMaxVoiceId(requestData.voice);
    console.log(`Mapping voice '${requestData.voice}' to MiniMax voice_id: '${voiceId}'`);
    
    // Using the newer API structure for t2a_v2 endpoint
    const payload = {
      model: requestData.model || "speech-02-turbo", // Use model from request or default to turbo
      text: requestData.text,
      stream: false,
      language_boost: "auto",
      voice_setting: {
        voice_id: voiceId,
        speed: Number(requestData.speed || 1.0),
        vol: Number(requestData.volume || 1.0),
        pitch: Number(requestData.pitch || 0)
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3"
      }
    };
    
    // Debug the final JSON structure
    const finalJSON = JSON.stringify(payload);
    console.log(`Final request payload: ${finalJSON}`);
    
    // Log request to MiniMax API
    console.log(`Sending TTS request to MiniMax API for text: "${payload.text.substring(0, 30)}${payload.text.length > 30 ? '...' : ''}"`);
    
    // Call MiniMax API with the new endpoint
    const miniMaxUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=${GROUP_ID}`;
    
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
      console.log(`Received JSON response:`, jsonResponse);
      
      // Process newer t2a_v2 API response format
      if (jsonResponse.data && jsonResponse.data.audio) {
        // Extract the audio data
        const audioData = jsonResponse.data.audio;
        
        try {
          // Direct binary conversion from base64 or hex to a binary response
          let bytes;
          
          // Detect if it's hex format
          if (/^[0-9a-fA-F]+$/.test(audioData)) {
            // Convert hex to binary
            bytes = new Uint8Array(audioData.length / 2);
            for (let i = 0; i < audioData.length; i += 2) {
              bytes[i / 2] = parseInt(audioData.substring(i, i + 2), 16);
            }
            console.log(`Converted hex audio data (${bytes.byteLength} bytes)`);
          } else {
            // Assume base64 and convert to binary
            const binaryString = atob(audioData);
            bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            console.log(`Converted base64 audio data (${bytes.byteLength} bytes)`);
          }
          
          // Return binary audio data with appropriate headers
          return new Response(bytes, {
            headers: {
              'Content-Type': 'audio/mp3',
              'Cache-Control': 'public, max-age=86400',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
          });
        } catch (error) {
          console.error(`Error processing audio data: ${error.message}`);
          // If conversion fails, return the original response
          return new Response(JSON.stringify({
            error: "Failed to process audio data",
            original_response: jsonResponse
          }), {
            headers: corsHeaders
          });
        }
      } 
      // Legacy format with audio_base64
      else if (jsonResponse.audio_base64) {
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
      } 
      // Handle audio_file URLs
      else if (jsonResponse.audio_file || (jsonResponse.data && jsonResponse.data.audio_file)) {
        const audioFileUrl = jsonResponse.audio_file || (jsonResponse.data && jsonResponse.data.audio_file);
        
        if (audioFileUrl) {
          // If the API returns a URL to an audio file
          console.log(`Audio file URL received: ${audioFileUrl}`);
          
          // Fetch the audio file
          const audioFileResponse = await fetch(audioFileUrl);
          const audioData = await audioFileResponse.arrayBuffer();
          
          console.log(`Returning audio file data (${audioData.byteLength} bytes)`);
          
          // Return audio data with appropriate headers
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
      }
      
      // Pass through any other JSON responses
      return new Response(JSON.stringify(jsonResponse), {
        headers: corsHeaders
      });
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
      "model": "speech-02-turbo",
      "speed": 1.0,
      "pitch": 0,
      "volume": 1.0
    },
    supported_voices: {
      "Chinese (Mandarin)_Male_Announcer": "Male voice with professional announcer tone",
      "Chinese (Mandarin)_Female_Friendly": "Female voice with friendly, natural tone",
      "English_ReservedYoungMan": "English male voice with reserved tone",
      "English_Wiselady": "English female voice with wise, mature tone",
      "Japanese_Male": "Japanese male voice",
      "Korean_Female": "Korean female voice"
    },
    models: {
      "speech-02-turbo": "Recommended: Fast, high-quality speech synthesis",
      "speech-02-hd": "Premium quality with better emotional expression (higher latency)"
    },
    api_endpoint: "POST /api/tts",
    documentation: "Using MiniMax T2A v2 API"
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
  // Full list of voices for MiniMax TTS API
  const voiceMap = {
    // Chinese voices
    "Chinese (Mandarin)_Male_Announcer": "male-qn-qingse",
    "Chinese (Mandarin)_Female_Friendly": "female-shaonv",
    "Chinese (Mandarin)_Male_Friendly": "male-qn-hechang",
    "Chinese (Mandarin)_Female_Storyteller": "female-zh-sweet",
    "Chinese (Mandarin)_Male_Mature": "male-zh-deep",
    "Chinese (Cantonese)_Male": "male-yue",
    "Chinese (Cantonese)_Female": "female-yue",
    
    // English voices
    "English_ReservedYoungMan": "male-en-us-reserved",
    "English_Wiselady": "female-en-us-wiselady",
    "English_CasualGuy": "male-en-us-casual",
    "English_FriendlyGirl": "female-en-us-friendly",
    "English_BritishMale": "male-en-gb-standard",
    "English_BritishFemale": "female-en-gb-standard",
    "English_AustralianMale": "male-en-au-standard",
    "English_AustralianFemale": "female-en-au-standard",
    
    // Japanese and Korean voices
    "Japanese_Male": "male-ja-standard",
    "Japanese_Female": "female-ja-standard",
    "Korean_Male": "male-ko-standard",
    "Korean_Female": "female-ko-standard"
  };
  
  // Return mapped voice or default if mapping not found
  return voiceMap[frontendVoice] || "male-qn-qingse";
}

export const config = {
  runtime: 'edge',
  maxDuration: 60 // Set maximum duration to 60 seconds
}; 