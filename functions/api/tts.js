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
        pitch: Math.round(Number(requestData.pitch || 0))
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3"
      }
    };
    
    // Process emotion metadata for more expressive speech
    if (requestData.emotion) {
      console.log(`Applying emotion profile: "${requestData.emotion}"`);
      
      // Map common emotions to voice parameters for fine-tuning
      const emotionProfiles = {
        // Sad emotions - slower, lower pitch, softer
        "悲伤": { speedMod: 0.9, pitchMod: -1, volMod: 0.85 },
        "哀伤": { speedMod: 0.85, pitchMod: -1, volMod: 0.8 },
        "沮丧": { speedMod: 0.9, pitchMod: -1, volMod: 0.9 },
        "伤感": { speedMod: 0.95, pitchMod: -1, volMod: 0.9 },
        "忧郁": { speedMod: 0.9, pitchMod: -1, volMod: 0.85 },
        "悲痛": { speedMod: 0.8, pitchMod: -1, volMod: 0.8 },
        "悲哀": { speedMod: 0.85, pitchMod: -1, volMod: 0.85 },
        
        // Happy emotions - faster, higher pitch, louder
        "欢快": { speedMod: 1.15, pitchMod: 1, volMod: 1.15 },
        "喜悦": { speedMod: 1.1, pitchMod: 1, volMod: 1.1 },
        "兴奋": { speedMod: 1.2, pitchMod: 1, volMod: 1.2 },
        "热情": { speedMod: 1.15, pitchMod: 1, volMod: 1.15 },
        "愉快": { speedMod: 1.1, pitchMod: 1, volMod: 1.05 },
        "开心": { speedMod: 1.1, pitchMod: 1, volMod: 1.1 },
        
        // Calm emotions - normal speed, normal to low pitch, normal volume
        "平静": { speedMod: 1.0, pitchMod: 0, volMod: 1.0 },
        "沉思": { speedMod: 0.95, pitchMod: 0, volMod: 0.95 },
        "冷静": { speedMod: 0.97, pitchMod: 0, volMod: 0.97 },
        "温和": { speedMod: 1.0, pitchMod: 0, volMod: 1.0 },
        
        // Serious emotions - slower, lower pitch, normal volume
        "严肃": { speedMod: 0.95, pitchMod: -1, volMod: 1.0 },
        "庄重": { speedMod: 0.9, pitchMod: -1, volMod: 1.05 },
        "郑重": { speedMod: 0.95, pitchMod: -1, volMod: 1.05 },
        
        // Excited emotions - faster, higher pitch, louder
        "激动": { speedMod: 1.15, pitchMod: 1, volMod: 1.2 },
        "振奋": { speedMod: 1.1, pitchMod: 1, volMod: 1.15 },
        "激情": { speedMod: 1.15, pitchMod: 1, volMod: 1.2 },
        
        // Poetic - slower, melodic
        "诗意": { speedMod: 0.85, pitchMod: 0, volMod: 0.95 },
        "抒情": { speedMod: 0.9, pitchMod: 0, volMod: 0.95 },
        "文学性": { speedMod: 0.9, pitchMod: 0, volMod: 1.0 }
      };
      
      // Apply fine-tuning based on detected emotion if available in our profiles
      const emotionKey = Object.keys(emotionProfiles).find(key => 
        requestData.emotion.includes(key)
      );
      
      if (emotionKey) {
        const profile = emotionProfiles[emotionKey];
        console.log(`Found matching emotion profile: ${emotionKey}`);
        
        // Apply subtle adjustments to make emotion more natural
        // Only adjust if the DeepSeek analysis hasn't already provided specific parameters
        if (requestData.speed === 1.0) {
          payload.voice_setting.speed = Math.max(0.5, Math.min(2.0, payload.voice_setting.speed * profile.speedMod));
        }
        
        if (requestData.pitch === 0) {
          // Ensure pitch is within ±1 range for natural sounding speech
          payload.voice_setting.pitch = Math.round(Math.max(-1, Math.min(1, payload.voice_setting.pitch + profile.pitchMod)));
        }
        
        if (requestData.volume === 1.0) {
          payload.voice_setting.vol = Math.max(0.1, Math.min(2.0, payload.voice_setting.vol * profile.volMod));
        }
        
        console.log(`Applied emotion profile adjustments: speed=${payload.voice_setting.speed}, pitch=${payload.voice_setting.pitch}, vol=${payload.voice_setting.vol}`);
      }
      
      // Pass emotion as metadata to TTS engine
      payload.emotion = requestData.emotion;
    }
    
    // Handle emphasis and prosody
    if (requestData.emphasis && Array.isArray(requestData.emphasis) && requestData.emphasis.length > 0) {
      console.log(`Applying emphasis on ${requestData.emphasis.length} phrases: ${requestData.emphasis.join(', ')}`);
      
      payload.prosody = {
        emphasis: requestData.emphasis
      };
      
      // Handle pause duration for better phrasing
      if (requestData.pause_duration) {
        payload.prosody.pause_duration = Number(requestData.pause_duration);
        console.log(`Setting custom pause duration: ${payload.prosody.pause_duration}`);
      } else if (requestData.text.length > 100) {
        // For longer passages without explicit pause setting
        const textType = detectTextType(requestData.text);
        
        if (textType === 'poetry') {
          payload.prosody.pause_duration = 1.5; // Longer pauses for poetry
        } else if (textType === 'dialogue') {
          payload.prosody.pause_duration = 1.3; // Medium pauses for dialogue
        } else {
          payload.prosody.pause_duration = 1.2; // Standard pause for prose
        }
        
        console.log(`Applied automatic pause duration ${payload.prosody.pause_duration} based on text type: ${textType}`);
      }
    }
    
    // Apply sentence-level analysis if available
    if (requestData.sentence_analysis && Array.isArray(requestData.sentence_analysis) && 
        requestData.sentence_analysis.length > 0) {
        
      console.log(`Applying sentence-level analysis for ${requestData.sentence_analysis.length} sentences`);
      
      // 检查是否有至少两个句子具有不同情绪
      const hasMultipleEmotions = requestData.sentence_analysis.some((sentence, index, array) => {
        if (index === 0) return false;
        return sentence.emotion !== array[0].emotion;
      });
      
      if (hasMultipleEmotions) {
        console.log('检测到多种情绪表达，应用句子级情感处理');
        
        try {
          // 使用MiniMax API的高级功能来设置每个句子的情感，而不是通过SSML标记
          // 创建一个句子数组，每个句子只包含原文，而参数通过元数据传递
          const sentences = requestData.sentence_analysis.map(sentence => ({
            text: sentence.text,
            params: {
              speed: Math.max(0.5, Math.min(2.0, Number(sentence.speed) || 1.0)),
              pitch: Math.round(Math.max(-1, Math.min(1, Number(sentence.pitch) || 0))),
              volume: Math.max(0.1, Math.min(2.0, Number(sentence.volume) || 1.0)),
              emotion: sentence.emotion || requestData.emotion
            }
          }));
          
          // 将原始句子文本直接添加到元数据中，不添加任何标记
          payload.sentence_segments = sentences.map(s => s.text);
          
          // 不修改原始文本，确保TTS只读原文
          console.log('不使用SSML标记，仅通过API元数据传递情感参数');
          
          // 设置per_sentence_settings标志，告诉API我们希望使用句子级设置
          payload.use_sentence_level_settings = true;
        } catch (error) {
          console.error('句子级处理错误：', error);
        }
      }
      
      // 无论如何，都添加句子设置作为元数据
      payload.sentence_settings = requestData.sentence_analysis.map(sentence => ({
        text: sentence.text,
        voice_setting: {
          speed: Number(sentence.speed || payload.voice_setting.speed),
          pitch: Math.round(Number(sentence.pitch || payload.voice_setting.pitch)),
          vol: Number(sentence.volume || payload.voice_setting.vol),
          emotion: sentence.emotion || requestData.emotion
        }
      }));
      
      console.log(`添加了${payload.sentence_settings.length}个句子级设置`);
    }
    
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
      "voice": "Chinese (Mandarin)_Elite_Young",
      "model": "speech-02-turbo",
      "speed": 1.0,
      "pitch": 0,
      "volume": 1.0
    },
    emotion_feature: {
      "description": "Optional AI emotion sensing feature that analyzes text sentiment",
      "parameters": {
        "emotion": "Detected emotion keyword (e.g., 'serene_melancholy', 'excited', 'calm')",
        "emphasis": ["Array of phrases to emphasize"],
        "pause_duration": "Multiplier for pause length between phrases (e.g., 1.2)"
      }
    },
    supported_voices: {
      "Chinese (Mandarin)_Elite_Young": "精英青年音色",
      "Chinese (Mandarin)_College_Student": "青年大学生音色",
      "Chinese (Mandarin)_Young_Girl": "少女音色",
      "Chinese (Mandarin)_Male_Announcer": "雄浑播音男士",
      "Chinese (Mandarin)_Lyrical_Voice": "抒情男声",
      "Chinese (Mandarin)_Pure-hearted_Boy": "纯真少年男生",
      "Chinese (Mandarin)_Warm_Girl": "温暖少年女生",
      "English_Trustworthy_Man": "Trustworthy Man",
      "English_Graceful_Lady": "Graceful Lady",
      "English_UpsetGirl": "Upset Girl",
      "English_Wiselady": "Wise Lady",
      "English_Gentle_Voiced_Man": "Gentle-voiced Man",
      "Cantonese_Professional_Host_Female": "专业女主持",
      "Cantonese_Professional_Host_Male": "专业男主持"
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
  if (!frontendVoice) return "male-qn-jingying";
  
  // Voice mapping
  // Full list of voices for MiniMax TTS API
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
    "English_Trustworthy_Man": "English_Trustworthy_Man",           // Trustworthy Man
    "English_Graceful_Lady": "English_Graceful_Lady",               // Graceful Lady
    "English_Diligent_Man": "English_Diligent_Man",                 // Diligent Man
    "English_Gentle_Voiced_Man": "English_Gentle-voiced_man",       // Gentle-voiced man
    "English_UpsetGirl": "English_UpsetGirl",                       // Upset Girl
    "English_Wiselady": "English_Wiselady"                          // Wise Lady
  };
  
  // Return mapped voice or default if mapping not found
  return voiceMap[frontendVoice] || "male-qn-jingying";
}

/**
 * Detect the type of text to optimize TTS parameters
 */
function detectTextType(text) {
  // Check for poetry patterns
  const poetryPatterns = [
    /[，。！？；][，。！？；]/, // Multiple punctuation in sequence (common in Chinese poetry)
    /[\n\r]{2,}/,           // Multiple line breaks
    /[，。][，。]/          // Multiple punctuation in sequence
  ];
  
  // Check for dialogue patterns
  const dialoguePatterns = [
    /[""].*?[""]/, // Quoted speech
    /[""]/,        // Quotation marks
    /[：].*?[。？！]/  // Colon followed by statement
  ];
  
  // Check for sentence split patterns
  const sentenceSplitPatterns = [
    /[。！？；]/     // Chinese sentence ending punctuation
  ];
  
  // Test for poetry
  for (const pattern of poetryPatterns) {
    if (pattern.test(text)) {
      return 'poetry';
    }
  }
  
  // Test for dialogue
  for (const pattern of dialoguePatterns) {
    if (pattern.test(text)) {
      return 'dialogue';
    }
  }
  
  // Default to prose
  return 'prose';
}

/**
 * Split text into sentences for analysis
 * This function helps when the client doesn't provide sentence analysis
 */
function splitIntoSentences(text) {
  // 简单的句子分割规则
  const sentences = text.split(/(?<=[。！？；])/);
  
  // 过滤掉空句子
  return sentences.filter(sentence => sentence.trim().length > 0);
}

export const config = {
  runtime: 'edge',
  maxDuration: 60 // Set maximum duration to 60 seconds
}; 