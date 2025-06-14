// Cloudflare Workers 脚本 - 反馈系统 KV 存储 (修复版)
// 部署到 Cloudflare Workers，绑定 KV 命名空间为 KV_FEEDBACK

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 启用 CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 调试信息
      console.log('Request:', {
        method: request.method,
        path: path,
        url: request.url
      });

      // 检查 KV 绑定
      if (!env.KV_FEEDBACK) {
        console.error('KV_FEEDBACK binding not found');
        return new Response(JSON.stringify({ 
          error: 'KV binding not configured',
          message: 'KV_FEEDBACK namespace is not bound to this worker'
        }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }

      // 路由处理
      if (path === '/api/feedback' && request.method === 'POST') {
        return await handleCreateFeedback(request, env, corsHeaders);
      }
      
      if (path === '/api/feedback' && request.method === 'GET') {
        return await handleGetFeedbacks(request, env, corsHeaders);
      }
      
      if (path.startsWith('/api/feedback/') && request.method === 'PUT') {
        return await handleUpdateFeedback(request, env, corsHeaders);
      }
      
      if (path.startsWith('/api/feedback/') && request.method === 'DELETE') {
        return await handleDeleteFeedback(request, env, corsHeaders);
      }
      
      if (path.startsWith('/api/image/') && request.method === 'GET') {
        return await handleGetImage(request, env, corsHeaders);
      }

      // 健康检查端点
      if (path === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'ok',
          timestamp: new Date().toISOString(),
          kv_bound: !!env.KV_FEEDBACK
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      return new Response(JSON.stringify({ 
        error: 'Not Found',
        path: path,
        method: request.method
      }), { 
        status: 404, 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });

    } catch (error) {
      console.error('Worker Error:', error);
      console.error('Error stack:', error.stack);
      
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack // 调试时包含堆栈信息
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }
  }
};

// 创建反馈
async function handleCreateFeedback(request, env, corsHeaders) {
  try {
    console.log('Processing feedback creation...');
    
    // 检查请求内容类型
    const contentType = request.headers.get('Content-Type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      throw new Error('Invalid content type. Expected multipart/form-data');
    }

    const formData = await request.formData();
    console.log('FormData received, processing...');
    
    // 生成唯一ID
    const feedbackId = generateFeedbackId();
    console.log('Generated feedback ID:', feedbackId);
    
    // 处理文本数据
    const feedbackData = {
      id: feedbackId,
      feedbackType: formData.get('feedbackType') || 'unknown',
      userName: formData.get('userName') || '匿名用户',
      userContact: formData.get('userContact') || '',
      deviceType: formData.get('deviceType') || 'unknown',
      pageLocation: formData.get('pageLocation') || '',
      description: formData.get('description') || '',
      priority: formData.get('priority') || 'medium',
      ratings: {},
      deviceInfo: {},
      status: 'pending',
      submitTime: new Date().toISOString(),
      imageIds: []
    };

    // 安全解析 JSON 字段
    try {
      const ratingsStr = formData.get('ratings');
      if (ratingsStr) {
        feedbackData.ratings = JSON.parse(ratingsStr);
      }
    } catch (e) {
      console.warn('Failed to parse ratings:', e);
      feedbackData.ratings = {};
    }

    try {
      const deviceInfoStr = formData.get('deviceInfo');
      if (deviceInfoStr) {
        feedbackData.deviceInfo = JSON.parse(deviceInfoStr);
      }
    } catch (e) {
      console.warn('Failed to parse deviceInfo:', e);
      feedbackData.deviceInfo = {};
    }
    
    console.log('Feedback data prepared:', feedbackData);
    
    // 处理图片上传
    const imageFiles = formData.getAll('screenshots');
    console.log('Image files count:', imageFiles.length);
    
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (file && file.size > 0) {
          console.log(`Processing image ${i + 1}:`, file.name, file.size, 'bytes');
          
          // 检查文件大小 (5MB 限制)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`图片 ${file.name} 大小超过 5MB 限制`);
          }
          
          // 检查文件类型
          if (!file.type.startsWith('image/')) {
            throw new Error(`文件 ${file.name} 不是有效的图片格式`);
          }
          
          const imageId = `${feedbackId}_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          try {
            // 将图片转换为 base64 并存储到 KV
            const arrayBuffer = await file.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            
            const imageData = {
              name: file.name,
              type: file.type,
              size: file.size,
              data: base64
            };
            
            await env.KV_FEEDBACK.put(`image_${imageId}`, JSON.stringify(imageData));
            feedbackData.imageIds.push(imageId);
            console.log(`Image ${imageId} stored successfully`);
            
          } catch (imageError) {
            console.error(`Failed to process image ${file.name}:`, imageError);
            // 继续处理其他图片，不中断整个流程
          }
        }
      }
    }
    
    // 存储反馈数据到 KV
    console.log('Storing feedback data to KV...');
    await env.KV_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));
    
    // 更新反馈列表索引
    console.log('Updating feedback index...');
    await updateFeedbackIndex(env, feedbackId, 'add');
    
    console.log('Feedback created successfully:', feedbackId);
    
    return new Response(JSON.stringify({
      success: true,
      id: feedbackId,
      message: '反馈提交成功',
      data: feedbackData
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Error in handleCreateFeedback:', error);
    throw error; // 重新抛出错误，让上层处理
  }
}

// 获取所有反馈
async function handleGetFeedbacks(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    
    console.log('Fetching feedbacks with filters:', { type, status, priority });
    
    // 获取反馈ID列表
    const indexData = await env.KV_FEEDBACK.get('feedback_index');
    const feedbackIds = indexData ? JSON.parse(indexData) : [];
    
    console.log('Found feedback IDs:', feedbackIds.length);
    
    // 批量获取反馈数据
    const feedbacks = [];
    for (const id of feedbackIds) {
      try {
        const feedbackData = await env.KV_FEEDBACK.get(`feedback_${id}`);
        if (feedbackData) {
          const feedback = JSON.parse(feedbackData);
          
          // 应用过滤器
          if (type && feedback.feedbackType !== type) continue;
          if (status && feedback.status !== status) continue;
          if (priority && feedback.priority !== priority) continue;
          
          feedbacks.push(feedback);
        }
      } catch (parseError) {
        console.warn(`Failed to parse feedback ${id}:`, parseError);
      }
    }
    
    // 按提交时间倒序排列
    feedbacks.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime));
    
    console.log('Returning feedbacks:', feedbacks.length);
    
    return new Response(JSON.stringify(feedbacks), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Error in handleGetFeedbacks:', error);
    throw error;
  }
}

// 更新反馈状态
async function handleUpdateFeedback(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const feedbackId = url.pathname.split('/').pop();
    const { status } = await request.json();
    
    console.log('Updating feedback:', feedbackId, 'to status:', status);
    
    // 获取现有反馈数据
    const existingData = await env.KV_FEEDBACK.get(`feedback_${feedbackId}`);
    if (!existingData) {
      return new Response(JSON.stringify({ error: '反馈不存在' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    const feedbackData = JSON.parse(existingData);
    feedbackData.status = status;
    feedbackData.updatedTime = new Date().toISOString();
    
    await env.KV_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));
    
    return new Response(JSON.stringify({
      success: true,
      feedback: feedbackData
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Error in handleUpdateFeedback:', error);
    throw error;
  }
}

// 删除反馈
async function handleDeleteFeedback(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const feedbackId = url.pathname.split('/').pop();
    
    console.log('Deleting feedback:', feedbackId);
    
    // 获取反馈数据以删除关联图片
    const existingData = await env.KV_FEEDBACK.get(`feedback_${feedbackId}`);
    if (existingData) {
      const feedbackData = JSON.parse(existingData);
      
      // 删除关联的图片
      if (feedbackData.imageIds && feedbackData.imageIds.length > 0) {
        for (const imageId of feedbackData.imageIds) {
          try {
            await env.KV_FEEDBACK.delete(`image_${imageId}`);
            console.log('Deleted image:', imageId);
          } catch (deleteError) {
            console.warn('Failed to delete image:', imageId, deleteError);
          }
        }
      }
    }
    
    // 删除反馈数据
    await env.KV_FEEDBACK.delete(`feedback_${feedbackId}`);
    
    // 更新索引
    await updateFeedbackIndex(env, feedbackId, 'remove');
    
    return new Response(JSON.stringify({
      success: true,
      message: '反馈删除成功'
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Error in handleDeleteFeedback:', error);
    throw error;
  }
}

// 获取图片
async function handleGetImage(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const imageId = url.pathname.split('/').pop();
    
    console.log('Fetching image:', imageId);
    
    const imageData = await env.KV_FEEDBACK.get(`image_${imageId}`);
    if (!imageData) {
      return new Response('Image not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }
    
    const image = JSON.parse(imageData);
    const binaryData = atob(image.data);
    const bytes = new Uint8Array(binaryData.length);
    
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    
    return new Response(bytes, {
      headers: {
        'Content-Type': image.type,
        'Content-Disposition': `inline; filename="${image.name}"`,
        'Cache-Control': 'public, max-age=31536000',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Error in handleGetImage:', error);
    throw error;
  }
}

// 生成反馈ID
function generateFeedbackId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}_${random}`;
}

// 更新反馈索引
async function updateFeedbackIndex(env, feedbackId, action) {
  try {
    const indexData = await env.KV_FEEDBACK.get('feedback_index');
    let feedbackIds = indexData ? JSON.parse(indexData) : [];
    
    if (action === 'add') {
      if (!feedbackIds.includes(feedbackId)) {
        feedbackIds.push(feedbackId);
      }
    } else if (action === 'remove') {
      feedbackIds = feedbackIds.filter(id => id !== feedbackId);
    }
    
    await env.KV_FEEDBACK.put('feedback_index', JSON.stringify(feedbackIds));
    console.log('Updated feedback index, total count:', feedbackIds.length);
    
  } catch (error) {
    console.error('Error updating feedback index:', error);
    throw error;
  }
} 