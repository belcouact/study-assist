/**
 * Worker Edge TTS API
 * This module provides a serverless function for generating speech using the edge-tts.study-llm.me worker
 */

export const onRequest = async (context) => {
  try {
    // Extract request data
    const { request, env } = context;
    
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
    
    // Forward the request to edge-tts.study-llm.me worker
    const edgeTTSResponse = await fetch('https://edge-tts.study-llm.me/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        voice: selectedVoice
      })
    });
    
    if (!edgeTTSResponse.ok) {
      const errorText = await edgeTTSResponse.text();
      return new Response(JSON.stringify({
        success: false,
        error: `Edge TTS worker error: ${errorText}`
      }), {
        status: edgeTTSResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Return the audio response directly
    const audioBuffer = await edgeTTSResponse.arrayBuffer();
    
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    console.error('Edge TTS API error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: `Internal server error: ${error.message}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}; 