// 修复版 Cloudflare Workers 脚本 - 重点解决索引问题
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
          kv_bound: !!env.KV_FEEDBACK
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 提交反馈
      if (path === '/api/feedback' && request.method === 'POST') {
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

        const formData = await request.formData();
        const feedbackId = Date.now().toString();
        
        const feedbackData = {
          id: feedbackId,
          feedbackType: formData.get('feedbackType') || 'unknown',
          userName: formData.get('userName') || '匿名用户',
          userContact: formData.get('userContact') || '',
          deviceType: formData.get('deviceType') || 'unknown',
          pageLocation: formData.get('pageLocation') || '',
          description: formData.get('description') || '',
          priority: formData.get('priority') || 'medium',
          ratings: safeParseJSON(formData.get('ratings'), {}),
          deviceInfo: safeParseJSON(formData.get('deviceInfo'), {}),
          status: 'pending',
          submitTime: new Date().toISOString(),
          imageIds: []
        };

        // 处理上传的图片文件
        const uploadedImages = [];
        const screenshots = formData.getAll('screenshots');
        
        console.log('处理图片文件，数量:', screenshots.length);
        
        for (const file of screenshots) {
          if (file && file.size > 0) {
            try {
              const imageId = `${feedbackId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              // 将文件转换为 ArrayBuffer，然后转换为 base64
              const arrayBuffer = await file.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
              const base64Data = btoa(binaryString);
              
              // 存储图片数据
              const imageData = {
                id: imageId,
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64Data,
                uploadTime: new Date().toISOString()
              };
              
              await env.KV_FEEDBACK.put(`image_${imageId}`, JSON.stringify(imageData));
              uploadedImages.push(imageId);
              
              console.log(`图片 ${file.name} 存储成功，ID: ${imageId}`);
              
            } catch (imageError) {
              console.error('处理图片失败:', file.name, imageError);
              // 继续处理其他图片，不中断整个流程
            }
          }
        }
        
        // 更新反馈数据中的图片ID列表
        feedbackData.imageIds = uploadedImages;
        console.log('反馈包含图片数量:', uploadedImages.length);

        // 存储反馈数据
        await env.KV_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));
        
        // 更新索引 - 关键修复点
        await updateFeedbackIndex(env, feedbackId);

        return new Response(JSON.stringify({
          success: true,
          id: feedbackId,
          message: `反馈提交成功${uploadedImages.length > 0 ? `，包含 ${uploadedImages.length} 张图片` : ''}`,
          data: feedbackData,
          imagesUploaded: uploadedImages.length,
          imageIds: uploadedImages
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 获取反馈列表 - 修复版本
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

        // 获取索引
        let indexData = await env.KV_FEEDBACK.get('feedback_index');
        let feedbackIds = indexData ? JSON.parse(indexData) : [];
        
        console.log('索引数据:', feedbackIds);

        // 如果索引为空，尝试重建
        if (feedbackIds.length === 0) {
          console.log('索引为空，尝试重建...');
          
          const possibleIds = [];
          const now = Date.now();
          
          // 更高效的重建策略：检查最近的时间戳
          // 由于我们使用 Date.now() 作为ID，可以按时间范围搜索
          const searchRanges = [
            { start: now - 60 * 60 * 1000, end: now }, // 最近1小时
            { start: now - 24 * 60 * 60 * 1000, end: now - 60 * 60 * 1000 }, // 最近24小时
            { start: now - 7 * 24 * 60 * 60 * 1000, end: now - 24 * 60 * 60 * 1000 } // 最近7天
          ];
          
          for (const range of searchRanges) {
            // 每5分钟检查一次，减少API调用
            for (let timestamp = range.end; timestamp >= range.start; timestamp -= 5 * 60 * 1000) {
              try {
                const testData = await env.KV_FEEDBACK.get(`feedback_${timestamp}`);
                if (testData) {
                  possibleIds.push(timestamp.toString());
                  console.log('找到反馈:', timestamp);
                }
              } catch (e) {
                // 忽略错误，继续搜索
              }
              
              // 限制搜索数量，避免超时
              if (possibleIds.length >= 50) break;
            }
            if (possibleIds.length >= 50) break;
          }
          
          if (possibleIds.length > 0) {
            // 按时间倒序排列
            possibleIds.sort((a, b) => parseInt(b) - parseInt(a));
            feedbackIds = possibleIds;
            await env.KV_FEEDBACK.put('feedback_index', JSON.stringify(feedbackIds));
            console.log('重建索引成功，找到', possibleIds.length, '条记录');
          } else {
            console.log('未找到任何反馈记录');
          }
        }

        // 获取反馈数据
        const feedbacks = [];
        for (const id of feedbackIds) {
          try {
            const feedbackData = await env.KV_FEEDBACK.get(`feedback_${id}`);
            if (feedbackData) {
              const feedback = JSON.parse(feedbackData);
              
              // 验证反馈数据的基本结构
              if (feedback && typeof feedback === 'object' && feedback.id) {
                feedbacks.push(feedback);
              } else {
                console.warn(`反馈 ${id} 数据结构无效:`, feedback);
              }
            } else {
              console.warn(`反馈 ${id} 数据为空`);
            }
          } catch (parseError) {
            console.warn(`解析反馈 ${id} 失败:`, parseError);
          }
        }
        
        console.log(`成功获取 ${feedbacks.length} 条有效反馈`);

        // 按时间倒序排列（安全排序）
        feedbacks.sort((a, b) => {
          try {
            const timeA = a.submitTime ? new Date(a.submitTime).getTime() : 0;
            const timeB = b.submitTime ? new Date(b.submitTime).getTime() : 0;
            return timeB - timeA; // 最新的在前面
          } catch (error) {
            console.warn('排序时间失败:', error);
            return 0; // 如果排序失败，保持原顺序
          }
        });

        return new Response(JSON.stringify(feedbacks), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 更新反馈状态
      if (path.startsWith('/api/feedback/') && request.method === 'PUT') {
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
          const feedbackId = path.split('/').pop();
          console.log('更新反馈状态:', feedbackId);
          
          const requestBody = await request.json();
          const { status } = requestBody;
          
          if (!status) {
            return new Response(JSON.stringify({
              error: 'Missing status field'
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }

          // 获取现有反馈数据
          const existingData = await env.KV_FEEDBACK.get(`feedback_${feedbackId}`);
          if (!existingData) {
            return new Response(JSON.stringify({
              error: '反馈不存在',
              feedbackId: feedbackId
            }), {
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

          // 保存更新后的数据
          await env.KV_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));

          console.log(`反馈 ${feedbackId} 状态已更新为: ${status}`);

          return new Response(JSON.stringify({
            success: true,
            feedback: feedbackData,
            message: '状态更新成功'
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });

        } catch (error) {
          console.error('更新反馈状态失败:', error);
          return new Response(JSON.stringify({
            error: 'Failed to update feedback status',
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

      // 删除反馈
      if (path.startsWith('/api/feedback/') && request.method === 'DELETE') {
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
          const feedbackId = path.split('/').pop();
          console.log('删除反馈:', feedbackId);

          // 获取反馈数据以删除关联图片
          const existingData = await env.KV_FEEDBACK.get(`feedback_${feedbackId}`);
          if (existingData) {
            const feedbackData = JSON.parse(existingData);

            // 删除关联的图片
            if (feedbackData.imageIds && feedbackData.imageIds.length > 0) {
              for (const imageId of feedbackData.imageIds) {
                try {
                  await env.KV_FEEDBACK.delete(`image_${imageId}`);
                  console.log('删除图片:', imageId);
                } catch (deleteError) {
                  console.warn('删除图片失败:', imageId, deleteError);
                }
              }
            }
          }

          // 删除反馈数据
          await env.KV_FEEDBACK.delete(`feedback_${feedbackId}`);

          // 更新索引
          await removeFeedbackFromIndex(env, feedbackId);

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
          console.error('删除反馈失败:', error);
          return new Response(JSON.stringify({
            error: 'Failed to delete feedback',
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

      // 获取图片
      if (path.startsWith('/api/image/') && request.method === 'GET') {
        if (!env.KV_FEEDBACK) {
          return new Response('KV not bound', { 
            status: 500,
            headers: corsHeaders 
          });
        }

        try {
          const imageId = path.split('/').pop();
          console.log('获取图片:', imageId);

          const imageData = await env.KV_FEEDBACK.get(`image_${imageId}`);
          if (!imageData) {
            return new Response('Image not found', { 
              status: 404,
              headers: corsHeaders 
            });
          }

          const image = JSON.parse(imageData);
          
          // 将base64转换为二进制数据
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
          console.error('获取图片失败:', error);
          return new Response('Image processing error', { 
            status: 500,
            headers: corsHeaders 
          });
        }
      }

      // 手动重建索引端点
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

        // 扫描最近的反馈
        const now = Date.now();
        const foundIds = [];
        
        console.log('开始扫描反馈数据...');
        
        // 更智能的扫描策略
        const scanRanges = [
          { name: '最近1小时', start: now - 60 * 60 * 1000, end: now, interval: 60 * 1000 }, // 每分钟
          { name: '最近24小时', start: now - 24 * 60 * 60 * 1000, end: now - 60 * 60 * 1000, interval: 5 * 60 * 1000 }, // 每5分钟
          { name: '最近7天', start: now - 7 * 24 * 60 * 60 * 1000, end: now - 24 * 60 * 60 * 1000, interval: 30 * 60 * 1000 } // 每30分钟
        ];
        
        for (const range of scanRanges) {
          console.log(`扫描${range.name}...`);
          let rangeCount = 0;
          
          for (let timestamp = range.end; timestamp >= range.start; timestamp -= range.interval) {
            try {
              const testData = await env.KV_FEEDBACK.get(`feedback_${timestamp}`);
              if (testData) {
                foundIds.push(timestamp.toString());
                rangeCount++;
                console.log(`在${range.name}找到反馈:`, timestamp);
              }
            } catch (e) {
              // 忽略错误，继续扫描
            }
            
            // 限制每个范围的扫描数量，避免超时
            if (rangeCount >= 100) {
              console.log(`${range.name}扫描达到限制，停止扫描`);
              break;
            }
          }
          
          console.log(`${range.name}扫描完成，找到 ${rangeCount} 条记录`);
        }
        
        // 按时间倒序排列并去重
        const uniqueIds = [...new Set(foundIds)];
        uniqueIds.sort((a, b) => parseInt(b) - parseInt(a));
        
        console.log(`总共找到 ${uniqueIds.length} 条唯一记录`);

        // 更新索引
        await env.KV_FEEDBACK.put('feedback_index', JSON.stringify(uniqueIds));

        return new Response(JSON.stringify({
          success: true,
          message: '索引重建完成',
          foundCount: uniqueIds.length,
          foundIds: uniqueIds.slice(0, 10), // 只返回前10个ID作为示例
          totalScanned: foundIds.length,
          uniqueCount: uniqueIds.length
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      return new Response(JSON.stringify({
        error: 'Not Found',
        path: path
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
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

// 更新反馈索引
async function updateFeedbackIndex(env, feedbackId) {
  try {
    const indexData = await env.KV_FEEDBACK.get('feedback_index');
    let feedbackIds = indexData ? JSON.parse(indexData) : [];
    
    // 添加新ID到索引开头（最新的在前面）
    if (!feedbackIds.includes(feedbackId)) {
      feedbackIds.unshift(feedbackId);
    }
    
    // 限制索引大小（保留最新的1000条）
    if (feedbackIds.length > 1000) {
      feedbackIds = feedbackIds.slice(0, 1000);
    }
    
    await env.KV_FEEDBACK.put('feedback_index', JSON.stringify(feedbackIds));
    console.log('索引更新成功，当前总数:', feedbackIds.length);
    
  } catch (error) {
    console.error('更新索引失败:', error);
    // 不抛出错误，避免影响主要功能
  }
}

// 从索引中删除反馈
async function removeFeedbackFromIndex(env, feedbackId) {
  try {
    const indexData = await env.KV_FEEDBACK.get('feedback_index');
    let feedbackIds = indexData ? JSON.parse(indexData) : [];
    
    // 从索引中移除指定ID
    feedbackIds = feedbackIds.filter(id => id !== feedbackId);
    
    await env.KV_FEEDBACK.put('feedback_index', JSON.stringify(feedbackIds));
    console.log(`从索引中删除反馈 ${feedbackId}，剩余总数:`, feedbackIds.length);
    
  } catch (error) {
    console.error('从索引删除反馈失败:', error);
    // 不抛出错误，避免影响主要功能
  }
}

// 安全解析 JSON
function safeParseJSON(jsonString, defaultValue = {}) {
  try {
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    console.warn('JSON 解析失败:', jsonString, error);
    return defaultValue;
  }
} 