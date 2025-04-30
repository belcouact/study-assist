// Handle dialog text-to-speech requests to MiniMax API
export async function onRequestPost(context) {
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Check for required credentials
  const GROUP_ID = context.env.MINIMAX_GROUP_ID;
  const API_KEY = context.env.MINIMAX_API_KEY;
  
  console.log("MINIMAX_GROUP_ID exists:", !!GROUP_ID);
  console.log("MINIMAX_API_KEY exists:", !!API_KEY);
  
  if (!GROUP_ID || !API_KEY) {
    console.error("Missing required MiniMax API credentials");
    return new Response(JSON.stringify({
      error: "Server configuration error: Missing API credentials"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  
  // Test the credentials with a basic API call
  try {
    console.log("Testing MiniMax API credentials...");
    const testUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=${GROUP_ID}`;
    
    const testResponse = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "speech-02-turbo",
        text: "Hello, testing credentials.",
        stream: false,
        language_boost: "auto",
        voice_setting: {
          voice_id: "male-qn-jingying",
          speed: 1.0,
          vol: 1.0,
          pitch: 0
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: "mp3"
        }
      })
    });
    
    // If credentials are invalid, we'll usually get a 401 or 403 response
    if (testResponse.status === 401 || testResponse.status === 403) {
      const errorText = await testResponse.text();
      console.error("Credential validation failed:", errorText);
      
      return new Response(JSON.stringify({
        error: "MiniMax API credential validation failed",
        status: testResponse.status,
        details: errorText
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log("Credential test response status:", testResponse.status);
  } catch (error) {
    console.error("Error testing credentials:", error);
    // Continue execution - this is just a pre-check, main logic will also handle errors
  }

  try {
    // Parse request body
    const requestData = await context.request.json();
    console.log("Request data received:", JSON.stringify(requestData).substring(0, 200) + "...");
    
    // Validate required fields
    if (!requestData.dialog || !Array.isArray(requestData.dialog) || requestData.dialog.length === 0) {
      return new Response(JSON.stringify({
        error: "Missing or invalid 'dialog' field. Expected an array of roles with lines."
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (!requestData.roleVoices || typeof requestData.roleVoices !== 'object') {
      return new Response(JSON.stringify({
        error: "Missing or invalid 'roleVoices' field. Expected an object mapping roles to voices."
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Generate individual audio clips for each line in the dialog
    const audioClips = [];
    
    // Try with a simplified approach - just attempt to generate one piece of audio to test the API
    const testRole = requestData.dialog[0]; // Get the first role
    const testLine = testRole.lines[0]; // Get the first line
    const testText = testLine.english.trim() || testLine.chinese.trim();
    
    console.log("Testing API with role:", testRole.name);
    console.log("Test text:", testText);
    console.log("Using basic voice: male-qn-jingying");
    
    // Create a simplified test payload
    const testPayload = {
      model: "speech-02-turbo", // Use turbo model which might be more reliable
      text: testText,
      stream: false,
      language_boost: "auto",
      voice_setting: {
        voice_id: "male-qn-jingying", // Use a known reliable voice
        speed: 1.0,
        vol: 1.0,
        pitch: 0
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3"
      }
    };
    
    // Call MiniMax API with simplified test
    const apiUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=${GROUP_ID}`;
    
    console.log("Calling MiniMax API with test payload...");
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log("API response status:", response.status);
    console.log("API response status text:", response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error("Parsed error data:", errorData);
        
        // Return the API error details to the client for debugging
        return new Response(JSON.stringify({
          error: "MiniMax API returned an error",
          details: errorData,
          status: response.status,
          statusText: response.statusText
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({
          error: `MiniMax API error: ${response.status} ${response.statusText}`,
          responseText: errorText
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    const responseData = await response.json();
    console.log("API response has base_resp:", !!responseData.base_resp);
    console.log("API response has audio_base64:", !!responseData.audio_base64);
    
    if (responseData.base_resp) {
      console.log("base_resp status_code:", responseData.base_resp.status_code);
      console.log("base_resp status_msg:", responseData.base_resp.status_msg);
      
      if (responseData.base_resp.status_code !== 0) {
        return new Response(JSON.stringify({
          error: `MiniMax API returned error code ${responseData.base_resp.status_code}`,
          message: responseData.base_resp.status_msg,
          details: responseData.base_resp
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    if (!responseData.audio_base64) {
      console.error("No audio data in response");
      return new Response(JSON.stringify({
        error: "MiniMax API returned no audio data in test",
        response: responseData
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log("Successfully received audio data from API");
    
    // Process the single audio clip for testing
    try {
      const base64 = responseData.audio_base64.replace(/^data:audio\/\w+;base64,/, '');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      audioClips.push(bytes);
    } catch (error) {
      console.error("Error processing audio data:", error);
      return new Response(JSON.stringify({
        error: "Error processing audio data",
        message: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Skip processing all the other lines for this test
    console.log("Test successful. Skipping processing of other lines.");
    
    // Merge all audio clips into a single MP3 file (just the one test clip in this case)
    if (audioClips.length === 0) {
      return new Response(JSON.stringify({
        error: "No audio was generated. Check that the dialog contains valid text."
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Simple concatenation (just one clip in this case)
    let totalLength = 0;
    audioClips.forEach(clip => { totalLength += clip.length; });
    
    const mergedAudio = new Uint8Array(totalLength);
    let offset = 0;
    
    audioClips.forEach(clip => {
      mergedAudio.set(clip, offset);
      offset += clip.length;
    });
    
    console.log("Final audio data length:", mergedAudio.length);
    
    // Return the merged audio
    return new Response(mergedAudio, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mp3'
      }
    });
    
  } catch (error) {
    console.error("TTS dialog error:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({
      error: error.message || "An error occurred processing the dialog",
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle OPTIONS requests for CORS
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

// Function to map frontend voice names to MiniMax voice IDs
function getMiniMaxVoiceId(frontendVoice) {
  // Default voice if none provided
  if (!frontendVoice) return "male-qn-jingying";
  
  // Complete voice mapping from frontend names to MiniMax API voice IDs
  const voiceMap = {
    // Chinese Mandarin voices
    "Chinese (Mandarin)_Elite_Young": "male-qn-jingying",
    "Chinese (Mandarin)_Young_Girl": "female-shaonv",
    "Chinese (Mandarin)_Lyrical_Voice": "male-shuqing",
    "Chinese (Mandarin)_Male_Announcer": "male-bobo",
    "Chinese (Mandarin)_Pure-hearted_Boy": "male-chunzhen",
    "Chinese (Mandarin)_Warm_Girl": "female-nuannan",
    
    // Cantonese voices - keeping the original IDs as they appear to be direct passes
    "Cantonese_Professional_Host_Female": "Cantonese_ProfessionalHost（F)",
    "Cantonese_Professional_Host_Male": "Cantonese_ProfessionalHost（M)",
    
    // English voices - these appear to use the frontend name directly as the voice ID
    "English_Graceful_Lady": "English_Graceful_Lady",
    "English_Gentle_Voiced_Man": "English_Gentle-voiced_man", // Note the slight difference in casing
    "English_UpsetGirl": "English_UpsetGirl",
    "English_Wiselady": "English_Wiselady",
    "English_Trustworthy_Man": "English_Trustworthy_Man"
  };
  
  // Log the mapping operation
  console.log(`Voice mapping: '${frontendVoice}' -> '${voiceMap[frontendVoice] || "male-qn-jingying"}'`);
  
  // Return mapped voice or default if mapping not found
  return voiceMap[frontendVoice] || "male-qn-jingying";
} 