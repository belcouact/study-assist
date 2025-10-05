// 故障数据管理 Worker
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
      if (path === '/ws/api/faults/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          kv_bound: !!env.KV_WS_HUB
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 获取故障列表
      if (path === '/ws/api/faults' && request.method === 'GET') {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: 'KV_WS_HUB not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 获取索引
        let indexData = await env.KV_WS_HUB.get('faults_index');
        let faultIds = indexData ? JSON.parse(indexData) : [];
        
        console.log('故障索引数据:', faultIds);

        // 如果索引为空，尝试重建
        if (faultIds.length === 0) {
          console.log('故障索引为空，尝试重建...');
          
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
                const testData = await env.KV_WS_HUB.get(`fault_${timestamp}`);
                if (testData) {
                  possibleIds.push(timestamp.toString());
                  console.log('找到故障记录:', timestamp);
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
            faultIds = possibleIds;
            await env.KV_WS_HUB.put('faults_index', JSON.stringify(faultIds));
            console.log('重建故障索引成功，找到', possibleIds.length, '条记录');
          } else {
            console.log('未找到任何故障记录');
          }
        }

        // 获取故障数据
        const faults = [];
        for (const id of faultIds) {
          try {
            const faultData = await env.KV_WS_HUB.get(`fault_${id}`);
            if (faultData) {
              const fault = JSON.parse(faultData);
              
              // 验证故障数据的基本结构
              if (fault && typeof fault === 'object' && fault.id) {
                faults.push(fault);
              } else {
                console.warn(`故障 ${id} 数据结构无效:`, fault);
              }
            } else {
              console.warn(`故障 ${id} 数据为空`);
            }
          } catch (parseError) {
            console.warn(`解析故障 ${id} 失败:`, parseError);
          }
        }
        
        console.log(`成功获取 ${faults.length} 条有效故障记录`);

        // 按时间倒序排列（安全排序）
        faults.sort((a, b) => {
          try {
            const timeA = a.reportTime ? new Date(a.reportTime).getTime() : 0;
            const timeB = b.reportTime ? new Date(b.reportTime).getTime() : 0;
            return timeB - timeA; // 最新的在前面
          } catch (error) {
            console.warn('排序时间失败:', error);
            return 0; // 如果排序失败，保持原顺序
          }
        });

        return new Response(JSON.stringify(faults), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 创建新故障
      if (path === '/ws/api/faults' && request.method === 'POST') {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: 'KV_WS_HUB not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        try {
          const faultData = await request.json();
          const faultId = Date.now().toString();
          
          // 添加默认字段
          const newFault = {
            id: faultId,
            equipmentId: faultData.equipmentId || '',
            equipmentName: faultData.equipmentName || '',
            faultType: faultData.faultType || '',
            faultLevel: faultData.faultLevel || 'medium',
            reportTime: faultData.reportTime || new Date().toISOString(),
            reporter: faultData.reporter || '',
            faultDescription: faultData.faultDescription || '',
            status: faultData.status || 'pending',
            handler: faultData.handler || '',
            handleTime: faultData.handleTime || '',
            handleDescription: faultData.handleDescription || '',
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          };

          // 存储故障数据
          await env.KV_WS_HUB.put(`fault_${faultId}`, JSON.stringify(newFault));
          
          // 更新索引
          await updateFaultIndex(env, faultId);

          return new Response(JSON.stringify({
            success: true,
            id: faultId,
            message: '故障创建成功',
            data: newFault
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });

        } catch (error) {
          console.error('创建故障失败:', error);
          return new Response(JSON.stringify({
            error: 'Failed to create fault',
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

      // 更新故障状态
      if (path.startsWith('/ws/api/faults/') && request.method === 'PUT') {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: 'KV_WS_HUB not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        try {
          const faultId = path.split('/').pop();
          console.log('更新故障状态:', faultId);
          
          const requestBody = await request.json();
          const { status, handler, handleDescription } = requestBody;
          
          // 获取现有故障数据
          const existingData = await env.KV_WS_HUB.get(`fault_${faultId}`);
          if (!existingData) {
            return new Response(JSON.stringify({
              error: '故障不存在',
              faultId: faultId
            }), {
              status: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }

          const faultData = JSON.parse(existingData);
          
          // 更新字段
          if (status) faultData.status = status;
          if (handler) faultData.handler = handler;
          if (handleDescription) faultData.handleDescription = handleDescription;
          
          // 如果状态变为处理中或已完成，更新处理时间
          if (status && (status === 'processing' || status === 'completed') && faultData.status !== status) {
            faultData.handleTime = new Date().toISOString();
          }
          
          faultData.updateTime = new Date().toISOString();

          // 保存更新后的数据
          await env.KV_WS_HUB.put(`fault_${faultId}`, JSON.stringify(faultData));

          console.log(`故障 ${faultId} 状态已更新为: ${status}`);

          return new Response(JSON.stringify({
            success: true,
            fault: faultData,
            message: '故障更新成功'
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });

        } catch (error) {
          console.error('更新故障状态失败:', error);
          return new Response(JSON.stringify({
            error: 'Failed to update fault',
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

      // 删除故障
      if (path.startsWith('/ws/api/faults/') && request.method === 'DELETE') {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: 'KV_WS_HUB not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        try {
          const faultId = path.split('/').pop();
          console.log('删除故障:', faultId);

          // 删除故障数据
          await env.KV_WS_HUB.delete(`fault_${faultId}`);

          // 更新索引
          await removeFaultFromIndex(env, faultId);

          return new Response(JSON.stringify({
            success: true,
            message: '故障删除成功'
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });

        } catch (error) {
          console.error('删除故障失败:', error);
          return new Response(JSON.stringify({
            error: 'Failed to delete fault',
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

      // 手动重建索引端点
      if (path === '/ws/api/faults/rebuild-index' && request.method === 'POST') {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: 'KV_WS_HUB not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // 扫描最近的故障记录
        const now = Date.now();
        const foundIds = [];
        
        console.log('开始扫描故障数据...');
        
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
              const testData = await env.KV_WS_HUB.get(`fault_${timestamp}`);
              if (testData) {
                foundIds.push(timestamp.toString());
                rangeCount++;
                console.log(`在${range.name}找到故障记录:`, timestamp);
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
        await env.KV_WS_HUB.put('faults_index', JSON.stringify(uniqueIds));

        return new Response(JSON.stringify({
          success: true,
          message: '故障索引重建完成',
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

// 更新故障索引
async function updateFaultIndex(env, faultId) {
  try {
    const indexData = await env.KV_WS_HUB.get('faults_index');
    let faultIds = indexData ? JSON.parse(indexData) : [];
    
    // 添加新ID到索引开头（最新的在前面）
    if (!faultIds.includes(faultId)) {
      faultIds.unshift(faultId);
    }
    
    // 限制索引大小（保留最新的1000条）
    if (faultIds.length > 1000) {
      faultIds = faultIds.slice(0, 1000);
    }
    
    await env.KV_WS_HUB.put('faults_index', JSON.stringify(faultIds));
    console.log('故障索引更新成功，当前总数:', faultIds.length);
    
  } catch (error) {
    console.error('更新故障索引失败:', error);
    // 不抛出错误，避免影响主要功能
  }
}

// 从索引中删除故障
async function removeFaultFromIndex(env, faultId) {
  try {
    const indexData = await env.KV_WS_HUB.get('faults_index');
    let faultIds = indexData ? JSON.parse(indexData) : [];
    
    // 从索引中移除指定ID
    faultIds = faultIds.filter(id => id !== faultId);
    
    await env.KV_WS_HUB.put('faults_index', JSON.stringify(faultIds));
    console.log(`从索引中删除故障 ${faultId}，剩余总数:`, faultIds.length);
    
  } catch (error) {
    console.error('从索引删除故障失败:', error);
    // 不抛出错误，避免影响主要功能
  }
}