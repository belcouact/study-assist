// 简化版 Cloudflare Workers 脚本 - 用于调试
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 处理 CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 健康检查
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          kv_bound: !!env.KV_FEEDBACK,
          path: path,
          method: request.method
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 简单的反馈提交
      if (path === '/api/feedback' && request.method === 'POST') {
        // 检查 KV 绑定
        if (!env.KV_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_FEEDBACK not bound',
            message: '请在 Workers 设置中绑定 KV 命名空间'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const formData = await request.formData();
        const feedbackId = Date.now().toString();
        
        const feedbackData = {
          id: feedbackId,
          feedbackType: formData.get('feedbackType') || 'unknown',
          userName: formData.get('userName') || '匿名用户',
          description: formData.get('description') || '',
          submitTime: new Date().toISOString(),
          status: 'pending'
        };

        // 存储到 KV
        await env.KV_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));

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
      }

      // 获取反馈列表
      if (path === '/api/feedback' && request.method === 'GET') {
        if (!env.KV_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 简单返回空数组（实际应该从 KV 读取）
        return new Response(JSON.stringify([]), {
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
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack
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