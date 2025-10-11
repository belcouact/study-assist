// Dedicated Feedback Worker for WS Directory
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          kv_bound: !!env.KV_WS_FEEDBACK
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Submit feedback
      if (path === '/api/feedback' && request.method === 'POST') {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_WS_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        let feedbackData;
        
        // Check if the request is JSON or form data
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          // Handle JSON data
          feedbackData = await request.json();
        } else {
          // Handle form data
          const formData = await request.formData();
          feedbackData = {
            id: Date.now().toString(),
            feedbackType: formData.get('feedbackType') || 'other',
            subject: formData.get('subject') || '',
            userName: formData.get('userName') || '匿名用户',
            userEmail: formData.get('userEmail') || '',
            message: formData.get('message') || '',
            status: 'pending',
            submitTime: new Date().toISOString(),
            deviceInfo: {
              userAgent: request.headers.get('user-agent') || '',
              screenSize: `${screen.width}x${screen.height}`,
              viewport: `${window.innerWidth}x${window.innerHeight}`
            }
          };
        }

        // Generate ID if not provided
        if (!feedbackData.id) {
          feedbackData.id = Date.now().toString();
        }

        // Initialize like/dislike counters and other metadata
        feedbackData.likes = feedbackData.likes || 0;
        feedbackData.dislikes = feedbackData.dislikes || 0;
        feedbackData.userLiked = feedbackData.userLiked || false;
        feedbackData.userDisliked = feedbackData.userDisliked || false;
        feedbackData.comments = feedbackData.comments || [];
        feedbackData.status = feedbackData.status || 'pending';
        feedbackData.submitTime = feedbackData.submitTime || new Date().toISOString();
        feedbackData.updateTime = feedbackData.updateTime || feedbackData.submitTime;
        
        // Store device info if not provided
        if (!feedbackData.deviceInfo) {
          feedbackData.deviceInfo = {
            userAgent: request.headers.get('user-agent') || '',
            timestamp: new Date().toISOString()
          };
        }

        // Store feedback data
        await env.KV_WS_FEEDBACK.put(`feedback_${feedbackData.id}`, JSON.stringify(feedbackData));
        
        // Update index
        await updateFeedbackIndex(env, feedbackData.id);

        return new Response(JSON.stringify({
          success: true,
          id: feedbackData.id,
          message: 'Feedback submitted successfully',
          data: feedbackData
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Get feedback list
      if (path === '/api/feedback' && request.method === 'GET') {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_WS_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // Get index
        let indexData = await env.KV_WS_FEEDBACK.get('feedback_index');
        let feedbackIds = indexData ? JSON.parse(indexData) : [];
        
        // If index is empty, try to rebuild
        if (feedbackIds.length === 0) {
          console.log('Index is empty, attempting to rebuild...');
          feedbackIds = await rebuildFeedbackIndex(env);
        }

        // Get feedback data
        const feedbacks = [];
        for (const id of feedbackIds) {
          try {
            const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${id}`);
            if (feedbackData) {
              const feedback = JSON.parse(feedbackData);
              
              // Get comments for this feedback
              const commentsData = await env.KV_WS_FEEDBACK.get(`comments_${id}`);
              feedback.comments = commentsData ? JSON.parse(commentsData) : [];
              feedback.commentsCount = feedback.comments.length;
              
              feedbacks.push(feedback);
            }
          } catch (e) {
            console.error(`Error retrieving feedback ${id}:`, e);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          count: feedbacks.length,
          data: feedbacks
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Get single feedback
      if (path.startsWith('/api/feedback/') && request.method === 'GET') {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_WS_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedbackId = path.split('/').pop();
        const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        
        if (!feedbackData) {
          return new Response(JSON.stringify({
            error: 'Feedback not found'
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedback = JSON.parse(feedbackData);
        
        // Get comments for this feedback
        const commentsData = await env.KV_WS_FEEDBACK.get(`comments_${feedbackId}`);
        feedback.comments = commentsData ? JSON.parse(commentsData) : [];
        feedback.commentsCount = feedback.comments.length;

        return new Response(JSON.stringify({
          success: true,
          data: feedback
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Update feedback
      if (path.startsWith('/api/feedback/') && request.method === 'PUT') {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_WS_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedbackId = path.split('/').pop();
        const updateData = await request.json();
        
        // Get existing feedback
        const existingData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        if (!existingData) {
          return new Response(JSON.stringify({
            error: 'Feedback not found'
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // Merge data
        const feedbackData = {
          ...JSON.parse(existingData),
          ...updateData,
          id: feedbackId, // Ensure ID doesn't change
          updateTime: new Date().toISOString()
        };

        // Store updated feedback
        await env.KV_WS_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));

        return new Response(JSON.stringify({
          success: true,
          message: 'Feedback updated successfully',
          data: feedbackData
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Like feedback
      if (path.endsWith('/like') && request.method === 'POST') {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_WS_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedbackId = path.split('/')[3]; // Extract ID from /api/feedback/{id}/like
        
        // Get existing feedback
        const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        if (!feedbackData) {
          return new Response(JSON.stringify({
            error: 'Feedback not found'
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedback = JSON.parse(feedbackData);
        
        // Initialize like/dislike counters if not exist
        if (!feedback.likes) feedback.likes = 0;
        if (!feedback.dislikes) feedback.dislikes = 0;
        if (!feedback.userLiked) feedback.userLiked = false;
        if (!feedback.userDisliked) feedback.userDisliked = false;
        
        // Toggle like state
        if (feedback.userLiked) {
          // Unlike
          feedback.likes = Math.max(0, feedback.likes - 1);
          feedback.userLiked = false;
        } else {
          // Like
          feedback.likes += 1;
          feedback.userLiked = true;
          
          // Remove dislike if exists
          if (feedback.userDisliked) {
            feedback.dislikes = Math.max(0, feedback.dislikes - 1);
            feedback.userDisliked = false;
          }
        }
        
        // Update feedback
        await env.KV_WS_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedback));

        return new Response(JSON.stringify({
          success: true,
          likes: feedback.likes,
          dislikes: feedback.dislikes,
          userLiked: feedback.userLiked,
          userDisliked: feedback.userDisliked
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Dislike feedback
      if (path.endsWith('/dislike') && request.method === 'POST') {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_WS_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedbackId = path.split('/')[3]; // Extract ID from /api/feedback/{id}/dislike
        
        // Get existing feedback
        const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        if (!feedbackData) {
          return new Response(JSON.stringify({
            error: 'Feedback not found'
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedback = JSON.parse(feedbackData);
        
        // Initialize like/dislike counters if not exist
        if (!feedback.likes) feedback.likes = 0;
        if (!feedback.dislikes) feedback.dislikes = 0;
        if (!feedback.userLiked) feedback.userLiked = false;
        if (!feedback.userDisliked) feedback.userDisliked = false;
        
        // Toggle dislike state
        if (feedback.userDisliked) {
          // Remove dislike
          feedback.dislikes = Math.max(0, feedback.dislikes - 1);
          feedback.userDisliked = false;
        } else {
          // Add dislike
          feedback.dislikes += 1;
          feedback.userDisliked = true;
          
          // Remove like if exists
          if (feedback.userLiked) {
            feedback.likes = Math.max(0, feedback.likes - 1);
            feedback.userLiked = false;
          }
        }
        
        // Update feedback
        await env.KV_WS_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedback));

        return new Response(JSON.stringify({
          success: true,
          likes: feedback.likes,
          dislikes: feedback.dislikes,
          userLiked: feedback.userLiked,
          userDisliked: feedback.userDisliked
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Get comments for feedback
      if (path.endsWith('/comments') && request.method === 'GET') {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_WS_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedbackId = path.split('/')[3]; // Extract ID from /api/feedback/{id}/comments
        
        // Get comments for this feedback
        const commentsData = await env.KV_WS_FEEDBACK.get(`comments_${feedbackId}`);
        const comments = commentsData ? JSON.parse(commentsData) : [];

        return new Response(JSON.stringify({
          success: true,
          comments: comments
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Add comment to feedback
      if (path.endsWith('/comments') && request.method === 'POST') {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_WS_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedbackId = path.split('/')[3]; // Extract ID from /api/feedback/{id}/comments
        
        // Get existing comments
        const commentsData = await env.KV_WS_FEEDBACK.get(`comments_${feedbackId}`);
        let comments = commentsData ? JSON.parse(commentsData) : [];
        
        // Add new comment
        const commentData = await request.json();
        const newComment = {
          id: Date.now().toString(),
          feedbackId: feedbackId,
          userName: commentData.userName || '匿名用户',
          message: commentData.message,
          createTime: new Date().toISOString()
        };
        
        comments.push(newComment);
        
        // Store updated comments
        await env.KV_WS_FEEDBACK.put(`comments_${feedbackId}`, JSON.stringify(comments));

        return new Response(JSON.stringify({
          success: true,
          comment: newComment
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Delete feedback
      if (path.startsWith('/api/feedback/') && request.method === 'DELETE') {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: 'KV_WS_FEEDBACK not bound'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        const feedbackId = path.split('/').pop();
        
        // Check if feedback exists
        const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        if (!feedbackData) {
          return new Response(JSON.stringify({
            error: 'Feedback not found'
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        // Delete feedback and its comments
        await env.KV_WS_FEEDBACK.delete(`feedback_${feedbackId}`);
        await env.KV_WS_FEEDBACK.delete(`comments_${feedbackId}`);
        
        // Update index
        await removeFromFeedbackIndex(env, feedbackId);

        return new Response(JSON.stringify({
          success: true,
          message: 'Feedback deleted successfully'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Default response for unmatched routes
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
      console.error('Error processing request:', error);
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

// Helper function to update feedback index
async function updateFeedbackIndex(env, feedbackId) {
  try {
    let indexData = await env.KV_WS_FEEDBACK.get('feedback_index');
    let feedbackIds = indexData ? JSON.parse(indexData) : [];
    
    // Add new ID to the beginning of the array (newest first)
    if (!feedbackIds.includes(feedbackId)) {
      feedbackIds.unshift(feedbackId);
      
      // Keep only the most recent 1000 entries
      if (feedbackIds.length > 1000) {
        feedbackIds = feedbackIds.slice(0, 1000);
      }
      
      await env.KV_WS_FEEDBACK.put('feedback_index', JSON.stringify(feedbackIds));
    }
  } catch (error) {
    console.error('Error updating feedback index:', error);
  }
}

// Helper function to remove from feedback index
async function removeFromFeedbackIndex(env, feedbackId) {
  try {
    let indexData = await env.KV_WS_FEEDBACK.get('feedback_index');
    let feedbackIds = indexData ? JSON.parse(indexData) : [];
    
    // Remove ID from the array
    feedbackIds = feedbackIds.filter(id => id !== feedbackId);
    
    await env.KV_WS_FEEDBACK.put('feedback_index', JSON.stringify(feedbackIds));
  } catch (error) {
    console.error('Error removing from feedback index:', error);
  }
}

// Helper function to rebuild feedback index
async function rebuildFeedbackIndex(env) {
  try {
    console.log('Rebuilding feedback index...');
    
    const feedbackIds = [];
    const now = Date.now();
    
    // Search for feedback keys
    // Since we use timestamp as ID, we can search by time ranges
    const searchRanges = [
      { start: now - 60 * 60 * 1000, end: now }, // Last hour
      { start: now - 24 * 60 * 60 * 1000, end: now - 60 * 60 * 1000 }, // Last 24 hours
      { start: now - 7 * 24 * 60 * 60 * 1000, end: now - 24 * 60 * 60 * 1000 } // Last 7 days
    ];
    
    for (const range of searchRanges) {
      // Check every 5 minutes to reduce API calls
      for (let timestamp = range.end; timestamp >= range.start; timestamp -= 5 * 60 * 1000) {
        try {
          const testData = await env.KV_WS_FEEDBACK.get(`feedback_${timestamp}`);
          if (testData) {
            feedbackIds.push(timestamp.toString());
            console.log('Found feedback:', timestamp);
          }
        } catch (e) {
          // Ignore errors, continue searching
        }
        
        // Limit search to avoid timeout
        if (feedbackIds.length >= 50) break;
      }
      if (feedbackIds.length >= 50) break;
    }
    
    if (feedbackIds.length > 0) {
      // Sort by time in descending order
      feedbackIds.sort((a, b) => parseInt(b) - parseInt(a));
      await env.KV_WS_FEEDBACK.put('feedback_index', JSON.stringify(feedbackIds));
      console.log('Index rebuilt successfully, found', feedbackIds.length, 'records');
    } else {
      console.log('No feedback records found');
    }
    
    return feedbackIds;
  } catch (error) {
    console.error('Error rebuilding feedback index:', error);
    return [];
  }
}

// Helper function to safely parse JSON
function safeParseJSON(jsonString, defaultValue = {}) {
  try {
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
}