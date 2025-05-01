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
    
    // 重要：完全重设整体处理逻辑 - 首先获取角色名到角色对象的映射
    console.log("创建角色名到角色对象的映射...");
    const roleMap = {};
    requestData.dialog.forEach(role => {
      roleMap[role.name] = role;
    });
    
    // 确保收到了顺序信息
    if (!requestData.original_sequence || !Array.isArray(requestData.original_sequence)) {
      console.error("缺少顺序信息，无法确定对话顺序");
      return new Response(JSON.stringify({
        error: "Missing sequence information. Cannot determine dialog order."
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 按照sequence_position排序原始序列
    const sortedSequence = [...requestData.original_sequence].sort((a, b) => {
      return a.sequence_position - b.sequence_position;
    });
    
    console.log(`按顺序排列的对话序列 (${sortedSequence.length} 行):`);
    sortedSequence.forEach((seq, i) => {
      console.log(`${i+1}. 位置 ${seq.sequence_position}: ${seq.role} 行 ${seq.line_index}`);
    });
    
    // 逐行处理对话并生成音频
    const audioSegments = [];
    
    // 为每一行生成音频，严格按照原始顺序处理
    for (let i = 0; i < sortedSequence.length; i++) {
      const seq = sortedSequence[i];
      const roleName = seq.role;
      const lineIndex = seq.line_index;
      
      // 获取角色对象
      const role = roleMap[roleName];
      if (!role) {
        console.warn(`找不到角色 "${roleName}"，跳过此行`);
        continue;
      }
      
      // 获取该角色的台词
      const line = role.lines[lineIndex];
      if (!line) {
        console.warn(`找不到角色 "${roleName}" 的第 ${lineIndex} 行台词，跳过此行`);
        continue;
      }
      
      // 获取语音ID
      const voiceId = getMiniMaxVoiceId(requestData.roleVoices[roleName]);
      
      // 根据语言偏好选择文本
      let text;
      if (requestData.language_preference === 'chinese') {
        text = line.chinese?.trim() || line.english?.trim();
        console.log(`使用中文文本: "${roleName}" (如果需要会回退到英文)`);
      } else if (requestData.language_preference === 'english') {
        text = line.english?.trim() || line.chinese?.trim();
        console.log(`使用英文文本: "${roleName}" (如果需要会回退到中文)`);
      } else {
        // 默认行为 - 优先使用英文
        text = line.english?.trim() || line.chinese?.trim();
        console.log(`未指定语言偏好: "${roleName}"，默认使用英文`);
      }
      
      if (!text) {
        console.log(`[${i+1}/${sortedSequence.length}] 跳过空行: ${roleName}`);
        continue; // 跳过空行
      }
      
      console.log(`[${i+1}/${sortedSequence.length}] 处理: ${roleName} 说 "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      console.log(`使用语音ID: ${voiceId}`);
      
      // 创建请求payload
      const payload = {
        model: requestData.model || "speech-02-turbo",
        text: text,
        stream: false,
        language_boost: "auto",
        voice_setting: {
          voice_id: voiceId,
          speed: 1.0,  // 固定速度
          vol: 1.0,    // 固定音量
          pitch: 0     // 固定音调
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: "mp3"
        }
      };
      
      // 在每句话结尾添加短暂停顿
      payload.text = payload.text + "，";
      
      // 调用MiniMax API
      const apiUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=${GROUP_ID}`;
      
      try {
        console.log(`发送请求到MiniMax API，角色: '${roleName}'，顺序: ${i+1}`);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify(payload)
        });
        
        // 检查响应状态
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`MiniMax API错误: ${roleName}, ${response.status}`, errorText);
          throw new Error(`MiniMax API错误: ${response.status}`);
        }
        
        // 获取并处理音频数据
        let audioBytes;
        const contentType = response.headers.get('Content-Type') || '';
        
        if (contentType.includes('application/json')) {
          // 处理JSON响应
          const responseData = await response.json();
          
          // 处理不同格式的音频数据
          if (responseData.data && responseData.data.audio) {
            const audioData = responseData.data.audio;
            
            if (/^[0-9a-fA-F]+$/.test(audioData)) {
              // 十六进制格式
              audioBytes = new Uint8Array(audioData.length / 2);
              for (let j = 0; j < audioData.length; j += 2) {
                audioBytes[j / 2] = parseInt(audioData.substring(j, j + 2), 16);
              }
            } else {
              // Base64格式
              const binaryString = atob(audioData);
              audioBytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                audioBytes[j] = binaryString.charCodeAt(j);
              }
            }
          } else if (responseData.audio_base64) {
            // 旧的Base64格式
            const base64 = responseData.audio_base64.replace(/^data:audio\/\w+;base64,/, '');
            const binary = atob(base64);
            audioBytes = new Uint8Array(binary.length);
            for (let j = 0; j < binary.length; j++) {
              audioBytes[j] = binary.charCodeAt(j);
            }
          } else if (responseData.audio_file || (responseData.data && responseData.data.audio_file)) {
            // 处理音频文件URL
            const audioFileUrl = responseData.audio_file || (responseData.data && responseData.data.audio_file);
            
            if (audioFileUrl) {
              const audioFileResponse = await fetch(audioFileUrl);
              const audioBuffer = await audioFileResponse.arrayBuffer();
              audioBytes = new Uint8Array(audioBuffer);
            }
          }
        } else {
          // 假设是二进制音频数据
          const audioBuffer = await response.arrayBuffer();
          audioBytes = new Uint8Array(audioBuffer);
        }
        
        if (!audioBytes || audioBytes.length === 0) {
          throw new Error(`没有返回音频数据: "${text.substring(0, 30)}..."`);
        }
        
        // 将音频段保存到数组中，使用原始顺序作为索引
        audioSegments.push({
          originalIndex: i,  // 使用循环索引作为原始位置
          audio: audioBytes,
          role: roleName,
          text: text.substring(0, 30) + (text.length > 30 ? '...' : '')
        });
        
        console.log(`[${i+1}/${sortedSequence.length}] 成功生成音频: ${roleName}, ${audioBytes.length} 字节`);
        
      } catch (error) {
        console.error(`[${i+1}/${sortedSequence.length}] 处理错误: ${roleName}:`, error);
        // 继续处理下一行，而不是失败整个请求
      }
    }
    
    // 如果没有生成任何音频，返回错误
    if (audioSegments.length === 0) {
      return new Response(JSON.stringify({
        error: "没有生成任何音频。请检查对话文本是否有效。"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 按原始索引排序音频段
    audioSegments.sort((a, b) => a.originalIndex - b.originalIndex);
    
    console.log("最终音频合并顺序:");
    audioSegments.forEach((segment, i) => {
      console.log(`  ${i+1}. ${segment.role}: "${segment.text}" (原始位置: ${segment.originalIndex})`);
    });
    
    // 计算合并后的音频总长度
    let totalLength = 0;
    audioSegments.forEach(segment => { totalLength += segment.audio.length; });
    
    // 创建合并后的音频缓冲区
    const mergedAudio = new Uint8Array(totalLength);
    let offset = 0;
    
    // 按顺序拼接所有音频段
    audioSegments.forEach(segment => {
      mergedAudio.set(segment.audio, offset);
      offset += segment.audio.length;
    });
    
    console.log(`最终合并音频长度: ${mergedAudio.length} 字节`);
    
    // 返回合并后的音频
    return new Response(mergedAudio, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mp3',
        'Cache-Control': 'public, max-age=86400'
      }
    });
    
  } catch (error) {
    console.error("TTS对话错误:", error);
    console.error("错误栈:", error.stack);
    
    return new Response(JSON.stringify({
      error: error.message || "处理对话时发生错误",
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
    "male-qn-qingse": "male-qn-qingse",                 // 青涩青年音色
    "male-qn-jingying": "male-qn-jingying",             // 精英青年音色
    "male-qn-badao": "male-qn-badao",                   // 霸道青年音色
    "female-shaonv": "female-shaonv",                   // 少女音色
    "female-yujie": "female-yujie",                     // 御姐音色
    "female-chengshu": "female-chengshu",               // 成熟女性音色
    "female-tianmei": "female-tianmei",                 // 甜美女性音色
    "presenter_male": "presenter_male",                 // 男性主持人
    "presenter_female": "presenter_female",             // 女性主持人
    "audiobook_male_1": "audiobook_male_1",             // 男性有声书1
    "audiobook_male_2": "audiobook_male_2",             // 男性有声书2
    "audiobook_female_1": "audiobook_female_1",         // 女性有声书1
    "audiobook_female_2": "audiobook_female_2",         // 女性有声书2
    "clever_boy": "clever_boy",                         // 聪明男童
    "cute_boy": "cute_boy",                             // 可爱男童
    "lovely_girl": "lovely_girl",                       // 萌萌女童
    "junlang_nanyou": "junlang_nanyou",                 // 俊朗男友
    "chunzhen_xuedi": "chunzhen_xuedi",                 // 纯真学弟
    "qiaopi_mengmei": "qiaopi_mengmei",                 // 俏皮萌妹
    
    // English voices
    "Santa_Claus": "Santa_Claus",                       // Santa Claus
    "Grinch": "Grinch",                                 // Grinch
    "Rudolph": "Rudolph",                               // Rudolph
    "Arnold": "Arnold",                                 // Arnold
    "Charming_Santa": "Charming_Santa",                 // Charming Santa
    "Charming_Lady": "Charming_Lady",                   // Charming Lady
    "Sweet_Girl": "Sweet_Girl",                         // Sweet Girl
    "Cute_Elf": "Cute_Elf",                             // Cute Elf
    "Attractive_Girl": "Attractive_Girl",               // Attractive Girl
    "Serene_Woman": "Serene_Woman",                     // Serene Woman
    
    // Chinese Mandarin voices (alternative labeling)
    "Chinese (Mandarin)_News_Anchor": "Chinese (Mandarin)_News_Anchor",                   // 新闻女声
    "Chinese (Mandarin)_Refreshing_Young_Man": "Chinese (Mandarin)_Refreshing_Young_Man", // 舒朗男声
    "Chinese (Mandarin)_Unrestrained_Young_Man": "Chinese (Mandarin)_Unrestrained_Young_Man", // 不羁青年
    "Chinese (Mandarin)_Kind-hearted_Antie": "Chinese (Mandarin)_Kind-hearted_Antie",     // 热心大婶
    "Chinese (Mandarin)_Gentleman": "Chinese (Mandarin)_Gentleman",                       // 温润男声
    "Chinese (Mandarin)_Male_Announcer": "Chinese (Mandarin)_Male_Announcer",             // 播报男声
    "Chinese (Mandarin)_Sweet_Lady": "Chinese (Mandarin)_Sweet_Lady",                     // 甜美女声
    "Chinese (Mandarin)_Wise_Women": "Chinese (Mandarin)_Wise_Women",                     // 阅历姐姐
    "Chinese (Mandarin)_Gentle_Youth": "Chinese (Mandarin)_Gentle_Youth",                 // 温润青年
    "Chinese (Mandarin)_Warm_Girl": "Chinese (Mandarin)_Warm_Girl",                       // 温暖少女
    "Chinese (Mandarin)_Kind-hearted_Elder": "Chinese (Mandarin)_Kind-hearted_Elder",     // 花甲奶奶
    "Chinese (Mandarin)_Radio_Host": "Chinese (Mandarin)_Radio_Host",                     // 电台男主播
    "Chinese (Mandarin)_Lyrical_Voice": "Chinese (Mandarin)_Lyrical_Voice",               // 抒情男声
    "Chinese (Mandarin)_Straightforward_Boy": "Chinese (Mandarin)_Straightforward_Boy",   // 率真弟弟
    "Chinese (Mandarin)_Sincere_Adult": "Chinese (Mandarin)_Sincere_Adult",               // 真诚青年
    "Chinese (Mandarin)_Gentle_Senior": "Chinese (Mandarin)_Gentle_Senior",               // 温柔学姐
    "Chinese (Mandarin)_Stubborn_Friend": "Chinese (Mandarin)_Stubborn_Friend",           // 嘴硬竹马
    "Chinese (Mandarin)_Crisp_Girl": "Chinese (Mandarin)_Crisp_Girl",                     // 清脆少女
    "Chinese (Mandarin)_Pure-hearted_Boy": "Chinese (Mandarin)_Pure-hearted_Boy",         // 清澈邻家弟弟
    
    // Cantonese voices
    "Cantonese_ProfessionalHost（F)": "Cantonese_ProfessionalHost（F)",                   // 专业女主持
    "Cantonese_ProfessionalHost（M)": "Cantonese_ProfessionalHost（M)",                   // 专业男主持
    "Cantonese_PlayfulMan": "Cantonese_PlayfulMan",                                       // 活泼男声
    "Cantonese_CuteGirl": "Cantonese_CuteGirl",                                           // 可爱女孩
    
    // English voices (alternative labeling)
    "English_Trustworthy_Man": "English_Trustworthy_Man",           // Trustworthy Man
    "English_Graceful_Lady": "English_Graceful_Lady",               // Graceful Lady
    "English_Aussie_Bloke": "English_Aussie_Bloke",                 // Aussie Bloke
    "English_Gentle-voiced_man": "English_Gentle-voiced_man",       // Gentle-voiced man
    
    // Backward compatibility with old naming
    "Chinese (Mandarin)_Elite_Young": "male-qn-jingying",
    "Chinese (Mandarin)_College_Student": "male-qn-daxuesheng",
    "Chinese (Mandarin)_Young_Girl": "female-shaonv",
    "Chinese (Mandarin)_Mature_Woman": "female-chengshu",
    "Chinese (Mandarin)_Sweet_Woman": "female-tianmei",
    "Chinese (Mandarin)_Male_Presenter": "presenter_male",
    "Chinese (Mandarin)_Female_Presenter": "presenter_female",
    "Chinese (Mandarin)_Cute_Boy": "cute_boy",
    "Chinese (Mandarin)_Lovely_Girl": "lovely_girl",
    "Cantonese_Professional_Host_Female": "Cantonese_ProfessionalHost（F)",
    "Cantonese_Professional_Host_Male": "Cantonese_ProfessionalHost（M)",
    "English_Diligent_Man": "English_Diligent_Man",
    "English_Gentle_Voiced_Man": "English_Gentle-voiced_man",
    "English_UpsetGirl": "English_UpsetGirl",
    "English_Wiselady": "English_Wiselady"
  };
  
  // Log the mapping operation
  console.log(`Voice mapping: '${frontendVoice}' -> '${voiceMap[frontendVoice] || "male-qn-jingying"}'`);
  
  // Return mapped voice or default if mapping not found
  return voiceMap[frontendVoice] || "male-qn-jingying";
}

export const config = {
  runtime: 'edge',
  maxDuration: 60 // Set maximum duration to 60 seconds
}; 