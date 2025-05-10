// Microsoft Edge TTS Worker
const EDGE_TTS_URL = "https://api.edge-tts.com/v1";

// Handle POST requests for text-to-speech conversion
export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  try {
    const requestData = await context.request.json();
    
    // Validate required fields
    if (!requestData.text || !requestData.voice) {
      return new Response(JSON.stringify({
        error: "Missing required fields: text and voice"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Prepare request to Edge TTS API
    const payload = {
      text: requestData.text,
      voice: requestData.voice,
      outputFormat: 'mp3',
      rate: requestData.rate || 1.0,
      pitch: requestData.pitch || 0,
      volume: requestData.volume || 1.0
    };

    const response = await fetch(EDGE_TTS_URL + "/synthesize", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.env.EDGE_TTS_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({
        error: error.message || 'Failed to generate speech'
      }), {
        status: response.status,
        headers: corsHeaders
      });
    }

    // Get audio data and return with appropriate headers
    const audioData = await response.arrayBuffer();
    return new Response(audioData, {
      headers: {
        'Content-Type': 'audio/mp3',
        'Cache-Control': 'public, max-age=86400',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Edge TTS error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: corsHeaders
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

// Handle GET requests with API info
export function onRequestGet() {
  return new Response(JSON.stringify({
    service: "Microsoft Edge TTS API",
    endpoints: {
      POST: "/api/edge-tts",
      OPTIONS: "/api/edge-tts"
    },
    voices: {
      "en-US-JennyNeural": "English US (Jenny)",
      "en-US-GuyNeural": "English US (Guy)",
      "zh-CN-XiaoxiaoNeural": "Chinese (Xiaoxiao)",
      "zh-CN-YunxiNeural": "Chinese (Yunxi)"
    },
    request_format: {
      text: "string (required)",
      voice: "string (required)",
      rate: "number (optional, default: 1.0)",
      pitch: "number (optional, default: 0)",
      volume: "number (optional, default: 1.0)"
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export const config = {
  runtime: 'edge',
  maxDuration: 60
};
