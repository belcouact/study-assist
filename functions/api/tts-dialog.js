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
    
    // Just try with the first role first
    const firstRole = requestData.dialog[0];
    const roleName = firstRole.name;
    let voiceId = getMiniMaxVoiceId(requestData.roleVoices[roleName]);
    
    console.log(`Processing role '${roleName}' with voice '${voiceId}'`);
    
    // Process the first line for this role
    const line = firstRole.lines[0];
    
    // Use English text if available, otherwise use Chinese
    const text = line.english.trim() || line.chinese.trim();
    
    if (!text) {
      return new Response(JSON.stringify({
        error: "First line has no text. Check the dialog content."
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Create the payload for this line
    const payload = {
      model: requestData.model || "speech-02-turbo", // Use turbo model for better compatibility
      text: text,
      stream: false,
      language_boost: "auto",
      voice_setting: {
        voice_id: voiceId,
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
    
    console.log(`Sending request to MiniMax API with payload: ${JSON.stringify(payload).substring(0, 200)}...`);
    
    // Call MiniMax API
    const apiUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=${GROUP_ID}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log("API response status:", response.status);
    console.log("API response status text:", response.statusText);
    
    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MiniMax API error (${response.status}): ${errorText}`);
      return new Response(JSON.stringify({
        error: `MiniMax API returned ${response.status}`,
        details: errorText
      }), {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Check content type
    const contentType = response.headers.get('Content-Type') || '';
    console.log(`MiniMax API responded with Content-Type: ${contentType}`);
    
    // Process JSON response
    const responseData = await response.json();
    console.log("Response has audio_base64:", !!responseData.audio_base64);
    
    let audioBytes;
    
    if (responseData.audio_base64) {
      // Process audio base64 response
      try {
        const base64 = responseData.audio_base64.replace(/^data:audio\/\w+;base64,/, '');
        const binary = atob(base64);
        audioBytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          audioBytes[i] = binary.charCodeAt(i);
        }
        console.log(`Processed audio data (${audioBytes.length} bytes)`);
      } catch (error) {
        console.error("Error processing audio_base64:", error);
        return new Response(JSON.stringify({
          error: "Failed to process audio data",
          message: error.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    } else {
      // Check for alternative response formats
      if (responseData.data && responseData.data.audio) {
        // Extract the audio data (newer API format)
        const audioData = responseData.data.audio;
        
        try {
          // Determine if it's hex or base64
          if (/^[0-9a-fA-F]+$/.test(audioData)) {
            // Convert hex to binary
            audioBytes = new Uint8Array(audioData.length / 2);
            for (let i = 0; i < audioData.length; i += 2) {
              audioBytes[i / 2] = parseInt(audioData.substring(i, i + 2), 16);
            }
            console.log(`Converted hex audio data (${audioBytes.byteLength} bytes)`);
          } else {
            // Assume base64 and convert to binary
            const binaryString = atob(audioData);
            audioBytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              audioBytes[i] = binaryString.charCodeAt(i);
            }
            console.log(`Converted base64 audio data (${audioBytes.byteLength} bytes)`);
          }
        } catch (error) {
          console.error("Error processing audio data:", error);
          return new Response(JSON.stringify({
            error: "Failed to process audio data from data.audio",
            message: error.message,
            response: responseData
          }), {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      } else if (responseData.audio_file || (responseData.data && responseData.data.audio_file)) {
        // Handle audio_file URLs
        const audioFileUrl = responseData.audio_file || (responseData.data && responseData.data.audio_file);
        
        if (audioFileUrl) {
          try {
            // Fetch the audio file
            console.log(`Fetching audio from URL: ${audioFileUrl}`);
            const audioFileResponse = await fetch(audioFileUrl);
            const audioBuffer = await audioFileResponse.arrayBuffer();
            
            audioBytes = new Uint8Array(audioBuffer);
            console.log(`Fetched audio data from URL (${audioBytes.byteLength} bytes)`);
          } catch (error) {
            console.error("Error fetching audio file:", error);
            return new Response(JSON.stringify({
              error: "Failed to fetch audio from URL",
              message: error.message
            }), {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
        }
      } else {
        console.error("No audio data found in response:", responseData);
        return new Response(JSON.stringify({
          error: "No audio data in MiniMax API response",
          response: responseData
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    if (!audioBytes || audioBytes.length === 0) {
      return new Response(JSON.stringify({
        error: "No audio data was generated",
        response: responseData
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // If test was successful, we can directly return the audio data
    console.log("Successfully processed single line, returning audio");
    
    return new Response(audioBytes, {
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