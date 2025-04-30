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
    
    // First, flatten the dialog into a sequence of lines with their roles
    const dialogSequence = [];
    
    // Preserve the original dialog structure
    for (let i = 0; i < requestData.dialog.length; i++) {
      const role = requestData.dialog[i];
      for (let j = 0; j < role.lines.length; j++) {
        dialogSequence.push({
          role: role,
          line: role.lines[j],
          index: dialogSequence.length // Keep track of the original sequence
        });
      }
    }
    
    console.log(`Processing ${dialogSequence.length} lines in dialog sequence`);
    
    // Process each line in the dialog sequence
    for (const item of dialogSequence) {
      const role = item.role;
      const line = item.line;
      const roleName = role.name;
      let voiceId = getMiniMaxVoiceId(requestData.roleVoices[roleName]);
      
      // Use English text if available, otherwise use Chinese
      const text = line.english.trim() || line.chinese.trim();
      
      if (!text) {
        console.log(`Skipping empty line for ${roleName}`);
        continue; // Skip empty lines
      }
      
      console.log(`[${item.index + 1}/${dialogSequence.length}] Processing line for ${roleName}: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
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
      
      // Call MiniMax API
      const apiUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=${GROUP_ID}`;
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify(payload)
        });
        
        // Check response status
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`MiniMax API error for role '${roleName}': ${response.status} ${response.statusText}`, errorText);
          throw new Error(`MiniMax API error: ${response.status} ${response.statusText}`);
        }
        
        // Process JSON response
        const responseData = await response.json();
        
        let audioBytes;
        
        // Process audio data based on response format
        if (responseData.audio_base64) {
          // Process audio base64 response
          const base64 = responseData.audio_base64.replace(/^data:audio\/\w+;base64,/, '');
          const binary = atob(base64);
          audioBytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            audioBytes[i] = binary.charCodeAt(i);
          }
        } else if (responseData.data && responseData.data.audio) {
          // Extract the audio data (newer API format)
          const audioData = responseData.data.audio;
          
          // Determine if it's hex or base64
          if (/^[0-9a-fA-F]+$/.test(audioData)) {
            // Convert hex to binary
            audioBytes = new Uint8Array(audioData.length / 2);
            for (let i = 0; i < audioData.length; i += 2) {
              audioBytes[i / 2] = parseInt(audioData.substring(i, i + 2), 16);
            }
          } else {
            // Assume base64 and convert to binary
            const binaryString = atob(audioData);
            audioBytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              audioBytes[i] = binaryString.charCodeAt(i);
            }
          }
        } else if (responseData.audio_file || (responseData.data && responseData.data.audio_file)) {
          // Handle audio_file URLs
          const audioFileUrl = responseData.audio_file || (responseData.data && responseData.data.audio_file);
          
          if (audioFileUrl) {
            // Fetch the audio file
            const audioFileResponse = await fetch(audioFileUrl);
            const audioBuffer = await audioFileResponse.arrayBuffer();
            audioBytes = new Uint8Array(audioBuffer);
          }
        }
        
        if (!audioBytes || audioBytes.length === 0) {
          throw new Error(`No audio data returned for line: "${text.substring(0, 30)}..."`);
        }
        
        // Store the audio clip with its original sequence index to maintain order
        audioClips.push({
          index: item.index,
          audio: audioBytes,
          roleName: roleName
        });
        
        console.log(`Added audio clip #${item.index + 1} for ${roleName}, length: ${audioBytes.length} bytes`);
        
      } catch (error) {
        console.error(`Error processing line #${item.index + 1} for ${roleName}:`, error);
        // Continue with next line instead of failing the whole request
      }
    }
    
    // Merge all audio clips into a single MP3 file
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
    
    // Sort the audio clips by their original sequence index
    audioClips.sort((a, b) => a.index - b.index);
    
    console.log(`Merging ${audioClips.length} audio clips in sequence order:`);
    audioClips.forEach((clip, i) => {
      console.log(`  ${i+1}. ${clip.roleName}: ${clip.audio.length} bytes (original index: ${clip.index})`);
    });
    
    // Calculate total length of merged audio
    let totalLength = 0;
    audioClips.forEach(clip => { totalLength += clip.audio.length; });
    
    // Create buffer for merged audio
    const mergedAudio = new Uint8Array(totalLength);
    let offset = 0;
    
    // Concatenate all clips in the correct sequence order
    audioClips.forEach(clip => {
      mergedAudio.set(clip.audio, offset);
      offset += clip.audio.length;
    });
    
    console.log(`Final merged audio length: ${mergedAudio.length} bytes`);
    
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