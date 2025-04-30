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
    
    for (const role of requestData.dialog) {
      const roleName = role.name;
      let voiceId = getMiniMaxVoiceId(requestData.roleVoices[roleName]);
      
      // Special case for Mom role - directly assign female voice to avoid mapping issues
      if (roleName === 'Mom' || roleName.toLowerCase() === 'mom') {
        // Use a female voice that we know works well with MiniMax
        const selectedVoiceName = requestData.roleVoices[roleName];
        if (selectedVoiceName && selectedVoiceName.includes("English_")) {
          voiceId = "English_Graceful_Lady"; // English female voice
        } else {
          voiceId = "female-shaonv"; // Default Chinese female voice
        }
        console.log(`Special handling for Mom role: Force using voice '${voiceId}'`);
      }
      
      console.log(`Processing ${role.lines.length} lines for role '${roleName}' with voice '${voiceId}'`);
      
      // Process each line for this role
      for (const line of role.lines) {
        // Use English text if available, otherwise use Chinese
        const text = line.english.trim() || line.chinese.trim();
        
        if (!text) continue; // Skip empty lines
        
        // Create the payload for this line
        const payload = {
          model: requestData.model || "speech-02-hd", // Use HD model for better quality
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
        
        // Adjust speed and pitch based on role characteristics
        if (role.gender === 'female' || role.name.toLowerCase().includes('mom') || 
            role.name.toLowerCase().includes('mother') || role.name.toLowerCase().includes('woman')) {
          // Make female voices slightly faster and higher pitched
          payload.voice_setting.speed = 1.05;
          payload.voice_setting.pitch = 1;
        } else if (role.type === 'child' || role.name.toLowerCase().includes('child') || 
                  role.name.toLowerCase().includes('kid') || role.name.toLowerCase().includes('baby')) {
          // Make child voices faster and higher pitched
          payload.voice_setting.speed = 1.1;
          payload.voice_setting.pitch = 1;
        }
        
        // Add short pause at the end of each line
        payload.text = payload.text + "，"; // Add a comma to create a natural pause
        
        // Enhanced logging for troubleshooting the 'Mom' role
        if (roleName === 'Mom') {
          console.log(`Mom role - Using voice ID: '${voiceId}'`);
          console.log(`Mom role - Text: "${text}"`);
          console.log(`Mom role - Full payload:`, JSON.stringify(payload));
        }
        
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
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`MiniMax API error for role '${roleName}': ${response.status} ${response.statusText}`, errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(`MiniMax API error: ${errorData.message || errorData.base_resp?.status_msg || 'Unknown error'}`);
          } catch (e) {
            throw new Error(`MiniMax API error: ${response.status} ${response.statusText}`);
          }
        }
        
        const responseData = await response.json();
        
        // Log response data for 'Mom' role for debugging
        if (roleName === 'Mom') {
          console.log(`Mom role - Response status: ${response.status}`);
          console.log(`Mom role - Response has base_resp:`, !!responseData.base_resp);
          console.log(`Mom role - Response has audio_base64:`, !!responseData.audio_base64);
          if (responseData.base_resp) {
            console.log(`Mom role - base_resp status_code:`, responseData.base_resp.status_code);
            console.log(`Mom role - base_resp status_msg:`, responseData.base_resp.status_msg);
          }
        }
        
        if (responseData.base_resp && responseData.base_resp.status_code !== 0) {
          throw new Error(`MiniMax API error: ${responseData.base_resp.status_msg || 'Unknown error'}`);
        }
        
        if (!responseData.audio_base64) {
          throw new Error(`MiniMax API returned no audio data for role '${roleName}'`);
        }
        
        // Convert base64 to array buffer
        const base64 = responseData.audio_base64.replace(/^data:audio\/\w+;base64,/, '');
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        
        // Add audio clip to the collection
        audioClips.push(bytes);
      }
    }
    
    // Merge all audio clips into a single MP3 file
    if (audioClips.length === 0) {
      throw new Error("No audio was generated. Check that the dialog contains valid text.");
    }
    
    // Simple concatenation of MP3 files (this works because MP3 is frame-based)
    // For production use, you might want a more sophisticated approach with proper MP3 handling
    let totalLength = 0;
    audioClips.forEach(clip => { totalLength += clip.length; });
    
    const mergedAudio = new Uint8Array(totalLength);
    let offset = 0;
    
    audioClips.forEach(clip => {
      mergedAudio.set(clip, offset);
      offset += clip.length;
    });
    
    // Return the merged audio
    return new Response(mergedAudio, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mp3'
      }
    });
    
  } catch (error) {
    console.error("TTS dialog error:", error);
    
    return new Response(JSON.stringify({
      error: error.message || "An error occurred processing the dialog"
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