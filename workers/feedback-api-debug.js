// 调试版 Cloudflare Workers 脚本
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
      console.log('=== 请求信息 ===');
      console.log('Method:', request.method);
      console.log('Path:', path);
      console.log('URL:', request.url);
      console.log('Content-Type:', request.headers.get('Content-Type'));
      console.log('KV_FEEDBACK bound:', !!env.KV_FEEDBACK);

      // 健康检查端点
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          kv_bound: !!env.KV_FEEDBACK,
          path: path,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries())
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 处理反馈提交
      if (path === '/api/feedback' && request.method === 'POST') {
        console.log('=== 处理反馈提交 ===');
        
        // 检查 KV 绑定
        if (!env.KV_FEEDBACK) {
          console.error('KV_FEEDBACK 未绑定');
          return new Response(JSON.stringify({
            error: 'KV_FEEDBACK not bound',
            message: '请在 Workers 设置中绑定 KV 命名空间',
            instructions: '1. 进入 Workers 设置 2. 添加 KV Namespace Binding 3. Variable name: KV_FEEDBACK'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 检查请求内容类型
        const contentType = request.headers.get('Content-Type');
        console.log('Content-Type:', contentType);
        
        if (!contentType) {
          return new Response(JSON.stringify({
            error: 'Missing Content-Type header',
            message: '请求缺少 Content-Type 头'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        let formData;
        try {
          console.log('尝试解析 FormData...');
          formData = await request.formData();
          console.log('FormData 解析成功');
        } catch (formError) {
          console.error('FormData 解析失败:', formError);
          return new Response(JSON.stringify({
            error: 'Failed to parse FormData',
            message: formError.message,
            contentType: contentType
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 检查 formData 是否有效
        if (!formData) {
          return new Response(JSON.stringify({
            error: 'FormData is null or undefined',
            message: 'FormData 解析结果为空'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 安全地获取表单字段
        const feedbackId = Date.now().toString();
        console.log('生成反馈ID:', feedbackId);

        let feedbackData;
        try {
          feedbackData = {
            id: feedbackId,
            feedbackType: safeGet(formData, 'feedbackType', 'unknown'),
            userName: safeGet(formData, 'userName', '匿名用户'),
            userContact: safeGet(formData, 'userContact', ''),
            deviceType: safeGet(formData, 'deviceType', 'unknown'),
            pageLocation: safeGet(formData, 'pageLocation', ''),
            description: safeGet(formData, 'description', ''),
            priority: safeGet(formData, 'priority', 'medium'),
            ratings: safeParseJSON(safeGet(formData, 'ratings', '{}'), {}),
            deviceInfo: safeParseJSON(safeGet(formData, 'deviceInfo', '{}'), {}),
            status: 'pending',
            submitTime: new Date().toISOString(),
            imageIds: []
          };
          
          console.log('反馈数据构建成功:', feedbackData);
        } catch (buildError) {
          console.error('构建反馈数据失败:', buildError);
          return new Response(JSON.stringify({
            error: 'Failed to build feedback data',
            message: buildError.message
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 存储到 KV
        try {
          console.log('存储到 KV...');
          await env.KV_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));
          console.log('KV 存储成功');
        } catch (kvError) {
          console.error('KV 存储失败:', kvError);
          return new Response(JSON.stringify({
            error: 'Failed to store in KV',
            message: kvError.message
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

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

        try {
          console.log('=== 获取反馈列表 ===');
          
          // 获取索引
          const indexData = await env.KV_FEEDBACK.get('feedback_index');
          console.log('索引数据:', indexData);
          
          const feedbackIds = indexData ? JSON.parse(indexData) : [];
          console.log('反馈ID列表:', feedbackIds);
          
          if (feedbackIds.length === 0) {
            console.log('索引为空，尝试扫描所有键...');
            
            // 如果索引为空，尝试重建索引
            const allKeys = await scanAllFeedbackKeys(env);
            console.log('扫描到的反馈键:', allKeys);
            
            if (allKeys.length > 0) {
              // 重建索引
              await env.KV_FEEDBACK.put('feedback_index', JSON.stringify(allKeys));
              console.log('索引已重建');
              
              // 使用新索引
              feedbackIds.push(...allKeys);
            }
          }
          
          // 获取反馈数据
          const feedbacks = [];
          for (const id of feedbackIds) {
            try {
              const feedbackData = await env.KV_FEEDBACK.get(`feedback_${id}`);
              if (feedbackData) {
                const feedback = JSON.parse(feedbackData);
                feedbacks.push(feedback);
                console.log(`获取反馈 ${id} 成功`);
              } else {
                console.warn(`反馈 ${id} 数据为空`);
              }
            } catch (parseError) {
              console.warn(`解析反馈 ${id} 失败:`, parseError);
            }
          }
          
          console.log(`返回 ${feedbacks.length} 条反馈`);
          
          return new Response(JSON.stringify(feedbacks), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
          
        } catch (error) {
          console.error('获取反馈列表失败:', error);
          throw error;
        }
      }

      // 管理端点：重建索引
      if (path === '/api/admin/rebuild-index' && request.method === 'POST') {
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

        try {
          console.log('=== 重建索引 ===');
          
          const allKeys = await scanAllFeedbackKeys(env);
          console.log('扫描到的反馈键:', allKeys);
          
          await env.KV_FEEDBACK.put('feedback_index', JSON.stringify(allKeys));
          
          return new Response(JSON.stringify({
            success: true,
            message: '索引重建成功',
            feedbackCount: allKeys.length,
            feedbackIds: allKeys
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
          
        } catch (error) {
          console.error('重建索引失败:', error);
          throw error;
        }
      }

      // 管理端点：KV 调试
      if (path === '/api/admin/kv-debug' && request.method === 'GET') {
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

        try {
          console.log('=== KV 调试信息 ===');
          
          const indexData = await env.KV_FEEDBACK.get('feedback_index');
          const allKeys = await scanAllFeedbackKeys(env);
          
          // 获取第一条反馈数据作为示例
          let sampleFeedback = null;
          if (allKeys.length > 0) {
            const sampleData = await env.KV_FEEDBACK.get(`feedback_${allKeys[0]}`);
            if (sampleData) {
              sampleFeedback = JSON.parse(sampleData);
            }
          }
          
          return new Response(JSON.stringify({
            indexExists: !!indexData,
            indexContent: indexData ? JSON.parse(indexData) : null,
            scannedKeys: allKeys,
            totalFeedbacks: allKeys.length,
            sampleFeedback: sampleFeedback
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
          
        } catch (error) {
          console.error('KV 调试失败:', error);
          throw error;
        }
      }

      // 404 处理
      return new Response(JSON.stringify({
        error: 'Not Found',
        path: path,
        method: request.method,
        availableEndpoints: ['/api/health', '/api/feedback']
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('=== 全局错误 ===');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
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

// 安全获取表单字段的辅助函数
function safeGet(formData, key, defaultValue = '') {
  try {
    const value = formData.get(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.warn(`Failed to get form field '${key}':`, error);
    return defaultValue;
  }
}

// 安全解析 JSON 的辅助函数
function safeParseJSON(jsonString, defaultValue = {}) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString, error);
    return defaultValue;
  }
}

// 扫描所有反馈键的辅助函数
async function scanAllFeedbackKeys(env) {
  try {
    // 注意：Cloudflare KV 不支持列出所有键
    // 这是一个模拟函数，实际中我们需要依赖索引
    // 但我们可以尝试一些常见的ID模式
    
    const feedbackIds = [];
    const now = Date.now();
    
    // 尝试扫描最近30天的可能ID
    for (let days = 0; days < 30; days++) {
      const dayTimestamp = now - (days * 24 * 60 * 60 * 1000);
      const dayStart = Math.floor(dayTimestamp / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
      
      // 尝试一些可能的时间戳
      for (let hour = 0; hour < 24; hour++) {
        const hourTimestamp = dayStart + (hour * 60 * 60 * 1000);
        
        // 尝试几个可能的随机后缀
        const possibleSuffixes = ['a', 'b', 'c', '1', '2', '3'];
        
        for (const suffix of possibleSuffixes) {
          const possibleId = `${hourTimestamp}_${suffix}`;
          
          try {
            const data = await env.KV_FEEDBACK.get(`feedback_${possibleId}`);
            if (data) {
              feedbackIds.push(possibleId);
              console.log('找到反馈:', possibleId);
            }
          } catch (e) {
            // 忽略错误，继续扫描
          }
        }
      }
    }
    
    return feedbackIds;
    
  } catch (error) {
    console.error('扫描反馈键失败:', error);
    return [];
  }
} 