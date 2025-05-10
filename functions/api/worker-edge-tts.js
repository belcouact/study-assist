/**
 * Worker Edge TTS API
 * This module provides a serverless function for generating speech using Microsoft Edge TTS
 */

async function generateTTS(text, voice) {
  // Use Microsoft Edge TTS to generate speech
  const SSML = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="${voice}">
        ${text}
      </voice>
    </speak>`;

  const response = await fetch('https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.35'
    },
    body: SSML
  });

  if (!response.ok) {
    throw new Error(`TTS generation failed with status: ${response.status}`);
  }

  return response.arrayBuffer();
}

export const onRequest = async (context) => {
  try {
    // Extract request data
    const { request, env } = context;
    
    // Handle OPTIONS preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    
    // Check request method
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Only POST method is allowed'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Validate required parameters
    const { text, voice } = requestData;
    if (!text) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameter: text'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Use default voice if not provided
    const selectedVoice = voice || 'zh-CN-XiaoxiaoNeural';
    
    try {
      // Generate TTS directly
      const audioData = await generateTTS(text, selectedVoice);
      
      // Return the audio response
      return new Response(audioData, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    } catch (ttsError) {
      return new Response(JSON.stringify({
        success: false,
        error: `TTS generation failed: ${ttsError.message}`
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.error('Edge TTS API error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: `Internal server error: ${error.message || 'Unknown error'}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};