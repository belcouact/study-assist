// Cloudflare Workers 脚本 - 反馈系统 KV 存储
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

      return new Response('Not Found', { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
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
  const formData = await request.formData();
  
  // 生成唯一ID
  const feedbackId = generateFeedbackId();
  
  // 处理文本数据
  const feedbackData = {
    id: feedbackId,
    feedbackType: formData.get('feedbackType'),
    userName: formData.get('userName') || '匿名用户',
    userContact: formData.get('userContact'),
    deviceType: formData.get('deviceType'),
    pageLocation: formData.get('pageLocation'),
    description: formData.get('description'),
    priority: formData.get('priority'),
    ratings: JSON.parse(formData.get('ratings') || '{}'),
    deviceInfo: JSON.parse(formData.get('deviceInfo') || '{}'),
    status: 'pending',
    submitTime: new Date().toISOString(),
    imageIds: []
  };
  
  // 处理图片上传
  const imageFiles = formData.getAll('screenshots');
  if (imageFiles && imageFiles.length > 0) {
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const imageId = `${feedbackId}_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
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
      }
    }
  }
  
  // 存储反馈数据到 KV
  await env.KV_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));
  
  // 更新反馈列表索引
  await updateFeedbackIndex(env, feedbackId, 'add');
  
  return new Response(JSON.stringify({
    success: true,
    id: feedbackId,
    message: '反馈提交成功'
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// 获取所有反馈
async function handleGetFeedbacks(request, env, corsHeaders) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');
  const priority = url.searchParams.get('priority');
  
  // 获取反馈ID列表
  const indexData = await env.KV_FEEDBACK.get('feedback_index');
  const feedbackIds = indexData ? JSON.parse(indexData) : [];
  
  // 批量获取反馈数据
  const feedbacks = [];
  for (const id of feedbackIds) {
    const feedbackData = await env.KV_FEEDBACK.get(`feedback_${id}`);
    if (feedbackData) {
      const feedback = JSON.parse(feedbackData);
      
      // 应用过滤器
      if (type && feedback.feedbackType !== type) continue;
      if (status && feedback.status !== status) continue;
      if (priority && feedback.priority !== priority) continue;
      
      feedbacks.push(feedback);
    }
  }
  
  // 按提交时间倒序排列
  feedbacks.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime));
  
  return new Response(JSON.stringify(feedbacks), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// 更新反馈状态
async function handleUpdateFeedback(request, env, corsHeaders) {
  const url = new URL(request.url);
  const feedbackId = url.pathname.split('/').pop();
  const { status } = await request.json();
  
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
}

// 删除反馈
async function handleDeleteFeedback(request, env, corsHeaders) {
  const url = new URL(request.url);
  const feedbackId = url.pathname.split('/').pop();
  
  // 获取反馈数据以删除关联图片
  const existingData = await env.KV_FEEDBACK.get(`feedback_${feedbackId}`);
  if (existingData) {
    const feedbackData = JSON.parse(existingData);
    
    // 删除关联的图片
    if (feedbackData.imageIds && feedbackData.imageIds.length > 0) {
      for (const imageId of feedbackData.imageIds) {
        await env.KV_FEEDBACK.delete(`image_${imageId}`);
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
}

// 获取图片
async function handleGetImage(request, env, corsHeaders) {
  const url = new URL(request.url);
  const imageId = url.pathname.split('/').pop();
  
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
}

// 生成反馈ID
function generateFeedbackId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}_${random}`;
}

// 更新反馈索引
async function updateFeedbackIndex(env, feedbackId, action) {
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
} 