// Handle dialog text-to-speech requests 
export async function onRequestPost(context) {
  // CORS headers for all responses
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Check for required credentials
  const MINIMAX_GROUP_ID = context.env.MINIMAX_GROUP_ID;
  const MINIMAX_API_KEY = context.env.MINIMAX_API_KEY;
  const DEEPSEEK_API_KEY = context.env.DEEPSEEK_API_KEY;
  
  if (!MINIMAX_GROUP_ID || !MINIMAX_API_KEY) {
    console.error("Missing required MiniMax API credentials");
    return new Response(JSON.stringify({
      error: "Server configuration error: Missing MiniMax API credentials"
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
  
  if (!DEEPSEEK_API_KEY) {
    console.error("Missing required DeepSeek API credentials");
    return new Response(JSON.stringify({
      error: "Server configuration error: Missing DeepSeek API credentials"
    }), {
      status: 500,
      headers: corsHeaders
    });
  }

  try {
    // Parse request body
    const requestData = await context.request.json();
    
    // Validate required fields
    if (!requestData.dialog_text) {
      return new Response(JSON.stringify({
        error: "Missing required 'dialog_text' field"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    // Step 1: Use DeepSeek API to analyze the dialog text
    console.log("Analyzing dialog text with DeepSeek API...");
    const dialogAnalysis = await analyzeDialogWithDeepSeek(requestData.dialog_text, DEEPSEEK_API_KEY);
    
    if (!dialogAnalysis || !dialogAnalysis.roles || dialogAnalysis.roles.length === 0) {
      return new Response(JSON.stringify({
        error: "Failed to analyze dialog or no dialog roles detected",
        analysis: dialogAnalysis || "No analysis returned"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    console.log(`Dialog analysis completed. Found ${dialogAnalysis.roles.length} roles and ${dialogAnalysis.segments.length} dialog segments.`);
    
    // Step 2: Generate audio for each dialog segment with appropriate voice
    const audioSegments = [];
    let currentSegmentIndex = 0;
    
    for (const segment of dialogAnalysis.segments) {
      currentSegmentIndex++;
      console.log(`Processing segment ${currentSegmentIndex}/${dialogAnalysis.segments.length} for role: ${segment.role}`);
      
      // Select voice based on role
      const voiceId = selectVoiceForRole(segment.role, dialogAnalysis.roles);
      console.log(`Selected voice '${voiceId}' for role '${segment.role}'`);
      
      try {
        // Generate audio for this segment
        const audioData = await generateTTSAudio(
          segment.text,
          voiceId,
          requestData.model || "speech-02-turbo",
          requestData.speed || 1.0,
          requestData.pitch || 0,
          requestData.volume || 1.0,
          MINIMAX_GROUP_ID,
          MINIMAX_API_KEY
        );
        
        if (audioData) {
          audioSegments.push({
            role: segment.role,
            text: segment.text,
            audio_base64: audioData
          });
          console.log(`Successfully generated audio for segment ${currentSegmentIndex}`);
        } else {
          console.error(`Failed to generate audio for segment ${currentSegmentIndex}`);
        }
      } catch (error) {
        console.error(`Error generating TTS for segment ${currentSegmentIndex}:`, error);
      }
    }
    
    // Step 3: Combine all audio segments (handled client-side)
    return new Response(JSON.stringify({
      success: true,
      analysis: dialogAnalysis,
      audio_segments: audioSegments
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error(`Error processing dialog TTS request: ${error.message}`);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Helper function to analyze dialog text using DeepSeek API
async function analyzeDialogWithDeepSeek(dialogText, apiKey) {
  try {
    const messages = [
      {
        role: "system",
        content: "You are a dialog analysis expert. Your task is to analyze a dialog text, identify the roles/speakers in the conversation, and separate each spoken part with the corresponding speaker. You must extract dialog in its original language (keeping any non-English text intact) while identifying roles and segments accurately. Format your output as valid JSON only."
      },
      {
        role: "user",
        content: `Please analyze the following dialog text and output a JSON structure with the roles and dialog segments. First identify if the text contains a dialog with multiple speakers. If it's not a dialog, treat it as a single speaker monologue.

1. Identify each unique role/speaker in the dialog
2. Extract each dialog segment with its corresponding role
3. Extract any English text from Chinese-English mixed content when applicable
4. Output the result in the following JSON format:

{
  "is_dialog": true or false,
  "roles": ["Role1", "Role2", ...],
  "segments": [
    {
      "role": "Role1",
      "text": "The exact text spoken by Role1",
      "english_text": "English translation/extraction if applicable, otherwise null"
    },
    ...
  ]
}

Dialog text to analyze:
"${dialogText}"

IMPORTANT: Return ONLY valid JSON without any explanation or markdown formatting.`
      }
    ];
    
    const apiUrl = "https://api.deepseek.com/v1/chat/completions";
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error (${response.status}): ${errorText}`);
      throw new Error(`DeepSeek API returned ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices && data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in DeepSeek API response");
    }
    
    try {
      // Extract JSON from response (DeepSeek should return pure JSON due to response_format setting)
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse DeepSeek response as JSON:", e);
      console.log("Raw content:", content);
      
      // Attempt to extract JSON if it's wrapped in backticks or has extra text
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```([\s\S]*?)```/) ||
                        content.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        try {
          let jsonStr = jsonMatch[0];
          if (jsonStr.startsWith('```')) {
            jsonStr = jsonMatch[1];
          }
          return JSON.parse(jsonStr);
        } catch (e2) {
          console.error("Second attempt to parse JSON failed:", e2);
          throw new Error("Failed to parse dialog analysis result");
        }
      } else {
        throw new Error("No valid JSON found in DeepSeek response");
      }
    }
  } catch (error) {
    console.error("Error in analyzeDialogWithDeepSeek:", error);
    throw error;
  }
}

// Helper function to select appropriate voice for a role
function selectVoiceForRole(role, allRoles) {
  // Default mapping of role positions to voice IDs
  const voiceMapping = {
    // For two speakers (typical dialog)
    2: [
      "Chinese (Mandarin)_Elite_Young",     // First speaker (male)
      "Chinese (Mandarin)_Young_Girl"       // Second speaker (female)
    ],
    // For three speakers
    3: [
      "Chinese (Mandarin)_Elite_Young",     // First speaker (male professional)
      "Chinese (Mandarin)_Young_Girl",      // Second speaker (female)
      "Chinese (Mandarin)_Pure-hearted_Boy" // Third speaker (younger male)
    ],
    // For four speakers
    4: [
      "Chinese (Mandarin)_Elite_Young",     // First speaker (male professional)
      "Chinese (Mandarin)_Young_Girl",      // Second speaker (female)
      "Chinese (Mandarin)_Male_Announcer",  // Third speaker (older male)
      "Chinese (Mandarin)_Warm_Girl"        // Fourth speaker (different female)
    ],
    // For more speakers, cycle through these voices
    default: [
      "Chinese (Mandarin)_Elite_Young",
      "Chinese (Mandarin)_Young_Girl",
      "Chinese (Mandarin)_Pure-hearted_Boy",
      "Chinese (Mandarin)_Male_Announcer",
      "Chinese (Mandarin)_Warm_Girl",
      "Chinese (Mandarin)_Lyrical_Voice"
    ]
  };
  
  // Handle English content if detected
  const englishVoiceMapping = {
    2: [
      "English_Gentle_Voiced_Man",
      "English_Graceful_Lady"
    ],
    3: [
      "English_Gentle_Voiced_Man",
      "English_Graceful_Lady",
      "English_Trustworth_Man"
    ],
    4: [
      "English_Gentle_Voiced_Man",
      "English_Graceful_Lady",
      "English_Trustworth_Man",
      "English_Wiselady"
    ],
    default: [
      "English_Gentle_Voiced_Man",
      "English_Graceful_Lady",
      "English_Trustworth_Man",
      "English_Wiselady",
      "English_UpsetGirl"
    ]
  };
  
  // Get the total number of roles
  const numRoles = allRoles.length;
  
  // Get the index of the current role
  const roleIndex = allRoles.indexOf(role);
  
  // Special role-based mappings
  const specialRoles = {
    "male": "Chinese (Mandarin)_Elite_Young",
    "female": "Chinese (Mandarin)_Young_Girl",
    "boy": "Chinese (Mandarin)_Pure-hearted_Boy",
    "girl": "Chinese (Mandarin)_Warm_Girl",
    "man": "Chinese (Mandarin)_Male_Announcer",
    "woman": "Chinese (Mandarin)_Young_Girl",
    "narrator": "Chinese (Mandarin)_Male_Announcer",
    "teacher": "Chinese (Mandarin)_Elite_Young",
    "student": "Chinese (Mandarin)_Pure-hearted_Boy",
    // English special roles
    "english male": "English_Gentle_Voiced_Man",
    "english female": "English_Graceful_Lady",
    "english boy": "English_Trustworth_Man",
    "english girl": "English_UpsetGirl"
  };
  
  // Check for special role names (case insensitive)
  const lowerRole = role.toLowerCase();
  for (const [key, value] of Object.entries(specialRoles)) {
    if (lowerRole.includes(key)) {
      return value;
    }
  }
  
  // Default mapping based on position
  const useEnglish = false; // Set this based on whether segment is in English
  const voiceMap = useEnglish ? englishVoiceMapping : voiceMapping;
  
  // Get the appropriate voice mapping array based on number of roles
  const voices = voiceMap[numRoles] || voiceMap.default;
  
  // Return the voice at the role's index, or cycle through the array if index exceeds array length
  return voices[roleIndex % voices.length];
}

// Helper function to generate TTS audio for a single segment
async function generateTTSAudio(text, voice, model, speed, pitch, volume, groupId, apiKey) {
  try {
    // Map frontend voice ID to MiniMax voice ID
    const miniMaxVoiceId = getMiniMaxVoiceId(voice);
    
    // Prepare request payload
    const payload = {
      model: model || "speech-02-turbo",
      text: text,
      stream: false,
      language_boost: "auto",
      voice_setting: {
        voice_id: miniMaxVoiceId,
        speed: Number(speed || 1.0),
        vol: Number(volume || 1.0),
        pitch: Math.round(Number(pitch || 0))
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3"
      }
    };
    
    // Call MiniMax API
    const miniMaxUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=${groupId}`;
    
    const response = await fetch(miniMaxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MiniMax API error (${response.status}): ${errorText}`);
      throw new Error(`MiniMax API returned ${response.status}`);
    }
    
    // Parse response
    const jsonResponse = await response.json();
    
    // Extract audio data from response
    if (jsonResponse.data && jsonResponse.data.audio) {
      return jsonResponse.data.audio; // Return base64 audio data
    } else {
      console.error("No audio data in MiniMax API response:", jsonResponse);
      throw new Error("No audio data in response");
    }
  } catch (error) {
    console.error("Error generating TTS audio:", error);
    throw error;
  }
}

// Function to map frontend voice IDs to MiniMax voice IDs (same as in tts.js)
function getMiniMaxVoiceId(frontendVoice) {
  // Default voice if none provided
  if (!frontendVoice) return "male-qn-jingying";
  
  // Voice mapping
  const voiceMap = {
    // Chinese Mandarin voices
    "Chinese (Mandarin)_Elite_Young": "male-qn-jingying",         // 精英青年音色
    "Chinese (Mandarin)_College_Student": "male-qn-daxuesheng",   // 青年大学生音色
    "Chinese (Mandarin)_Young_Girl": "female-shaonv",             // 少女音色
    "Chinese (Mandarin)_Mature_Woman": "female-chengshu",         // 成熟女性音色
    "Chinese (Mandarin)_Sweet_Woman": "female-tianmei",           // 甜美女性音色
    "Chinese (Mandarin)_Male_Presenter": "presenter_male",        // 男性主持人
    "Chinese (Mandarin)_Female_Presenter": "presenter_female",    // 女性主持人
    "Chinese (Mandarin)_Cute_Boy": "cute_boy",                    // 可爱男童
    "Chinese (Mandarin)_Lovely_Girl": "lovely_girl",              // 萌萌女童
    "Chinese (Mandarin)_News_Anchor": "Chinese (Mandarin)_News_Anchor",               // 新闻女声
    "Chinese (Mandarin)_Refreshing_Young_Man": "Chinese (Mandarin)_Refreshing_Young_Man", // 舒朗男声
    "Chinese (Mandarin)_Male_Announcer": "Chinese (Mandarin)_Male_Announcer",         // 播报男声
    "Chinese (Mandarin)_Lyrical_Voice": "Chinese (Mandarin)_Lyrical_Voice",           // 抒情男声
    "Chinese (Mandarin)_Pure-hearted_Boy": "Chinese (Mandarin)_Pure-hearted_Boy",     // 纯真少年男生
    "Chinese (Mandarin)_Warm_Girl": "Chinese (Mandarin)_Warm_Girl",                   // 温暖少年女生
    
    // Cantonese voices
    "Cantonese_Professional_Host_Female": "Cantonese_ProfessionalHost（F)",  // 专业女主持
    "Cantonese_Professional_Host_Male": "Cantonese_ProfessionalHost（M)",    // 专业男主持
    
    // English voices
    "English_Trustworth_Man": "English_Trustworthy_Man",           // Trustworthy Man
    "English_Graceful_Lady": "English_Graceful_Lady",               // Graceful Lady
    "English_Diligent_Man": "English_Diligent_Man",                 // Diligent Man
    "English_Gentle_Voiced_Man": "English_Gentle-voiced_man",       // Gentle-voiced man
    "English_UpsetGirl": "English_UpsetGirl",                       // Upset Girl
    "English_Wiselady": "English_Wiselady"                          // Wise Lady
  };
  
  // Return mapped voice or default if mapping not found
  return voiceMap[frontendVoice] || "male-qn-jingying";
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
    message: "This is the Dialog TTS API endpoint. Please make a POST request with dialog text data to convert to multi-voice speech.",
    example: {
      "dialog_text": "小明：你好，最近在忙什么？\n小红：我在学习英语，准备考试。\n小明：英语很重要，加油！",
      "model": "speech-02-turbo",
      "speed": 1.0,
      "pitch": 0,
      "volume": 1.0
    },
    description: "This API analyzes dialog text, identifies speakers, and generates audio with different voices for each speaker",
    api_endpoint: "POST /api/tts_dialog"
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

export const config = {
  runtime: 'edge',
  maxDuration: 120 // Set maximum duration to 120 seconds for handling longer dialogs
}; 