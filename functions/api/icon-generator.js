// Icon Generator API - 专门用于生成SVG图标
import { workerGlmOutput } from './worker-glm.js';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // 获取请求体
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        message: e.message
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    const { message, temperature = 0.5, action = 'generate' } = body;
    
    if (!message) {
      return new Response(JSON.stringify({ 
        error: "Message is required"
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    // 根据不同的action处理不同的请求
    if (action === 'optimize') {
      // 优化用户的需求描述
      return await optimizePrompt(message, temperature, env);
    } else if (action === 'generate') {
      // 生成SVG图标
      return await generateSvg(message, temperature, env);
    } else {
      return new Response(JSON.stringify({ 
        error: "Invalid action. Use 'optimize' or 'generate'"
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Icon Generator Server error",
      message: error.message
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

// 优化用户的需求描述
async function optimizePrompt(userPrompt, temperature, env) {
  try {
    const optimizationPrompt = `你是一个专业的图标设计师，请优化以下图标设计需求，使其更加具体和适合AI生成SVG图标：
    
原始需求：${userPrompt}
    
请返回一个优化后的描述，包含以下要素：
1. 具体的视觉元素和形状描述
2. 推荐的颜色搭配方案
3. 明确的风格特征（如：极简、扁平、线框、渐变等）
4. 适用场景说明
5. 技术实现要点（如：使用路径、基本形状等）
    
要求：
- 用中文返回优化后的描述
- 描述要具体、详细，便于AI理解
- 长度控制在200-300字之间
- 避免模糊的表述，如"好看的"、"漂亮的"等
    
优化后的描述：`;
    
    // 使用workerGlmOutput函数调用GLM API
    const optimizedDescription = await workerGlmOutput(optimizationPrompt, env);
    
    return new Response(JSON.stringify({
      success: true,
      action: 'optimize',
      original_prompt: userPrompt,
      optimized_prompt: optimizedDescription,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Failed to optimize prompt",
      message: error.message
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

// 生成SVG图标
async function generateSvg(optimizedPrompt, temperature, env) {
  try {
    const svgGenerationPrompt = `你是一个专业的SVG图标设计师，请根据以下需求生成一个完整的SVG图标代码：
    
需求描述：${optimizedPrompt}
    
技术要求：
1. 返回纯SVG代码，不要包含任何说明文字、代码块标记（如\`\`\`）
2. SVG代码必须是完整的，包含XML声明和SVG标签
3. 使用现代、简洁的设计风格
4. 确保图标清晰、可缩放
5. 使用路径（path）和基本形状（rect, circle, ellipse等）组合
6. 添加适当的viewBox属性，建议使用"0 0 128 128"
7. 可以使用渐变、阴影等效果增强视觉效果
8. 确保代码简洁高效，避免不必要的复杂性
    
请直接返回SVG代码，不要包含任何其他文字：`;
    
    // 使用workerGlmOutput函数调用GLM API生成SVG
    let svgCode = await workerGlmOutput(svgGenerationPrompt, env);
    
    // 清理和验证SVG代码
    svgCode = cleanSvgCode(svgCode);
    
    // 验证SVG代码的基本结构
    if (!isValidSvg(svgCode)) {
      throw new Error('生成的SVG代码格式无效');
    }
    
    return new Response(JSON.stringify({
      success: true,
      action: 'generate',
      prompt: optimizedPrompt,
      svg_code: svgCode,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Failed to generate SVG",
      message: error.message
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

// 清理SVG代码
function cleanSvgCode(svgCode) {
  // 移除代码块标记
  svgCode = svgCode.replace(/```svg\n?/g, '').replace(/```/g, '');
  
  // 移除前后空白
  svgCode = svgCode.trim();
  
  // 确保以XML声明开头
  if (!svgCode.startsWith('<?xml')) {
    svgCode = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgCode;
  }
  
  // 确保SVG标签有必要的属性
  if (!svgCode.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgCode = svgCode.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  // 确保有viewBox属性
  if (!svgCode.includes('viewBox=')) {
    svgCode = svgCode.replace('<svg', '<svg viewBox="0 0 128 128"');
  }
  
  return svgCode;
}

// 验证SVG代码的基本结构
function isValidSvg(svgCode) {
  try {
    // 检查是否包含基本的SVG标签
    if (!svgCode.includes('<svg') || !svgCode.includes('</svg>')) {
      return false;
    }
    
    // 检查是否包含XML命名空间
    if (!svgCode.includes('xmlns="http://www.w3.org/2000/svg"')) {
      return false;
    }
    
    // 尝试解析XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, 'image/svg+xml');
    
    // 检查是否有解析错误
    if (doc.querySelector('parsererror')) {
      return false;
    }
    
    // 检查是否有SVG元素
    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('SVG validation error:', error);
    return false;
  }
}

// 处理OPTIONS请求（CORS预检）
export function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store"
    }
  });
}

// 处理GET请求
export function onRequestGet() {
  return new Response(JSON.stringify({
    message: "Icon Generator API is working. Send POST requests to this endpoint to generate SVG icons.",
    endpoints: {
      optimize: {
        method: "POST",
        description: "Optimize user's icon description prompt",
        parameters: {
          message: "User's icon description",
          temperature: "Optional: creativity level (0-1)",
          action: "'optimize'"
        }
      },
      generate: {
        method: "POST", 
        description: "Generate SVG icon from optimized prompt",
        parameters: {
          message: "Optimized icon description",
          temperature: "Optional: creativity level (0-1)",
          action: "'generate'"
        }
      }
    },
    example: {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "一个现代化的购物车图标，蓝色渐变，简洁风格",
        temperature: 0.5,
        action: "generate"
      })
    }
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}