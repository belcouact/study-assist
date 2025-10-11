var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-HPbZwt/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-HPbZwt/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// workers/ws-feedback-worker.js
var ws_feedback_worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (path === "/api/health") {
        return new Response(JSON.stringify({
          status: "ok",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          kv_bound: !!env.KV_WS_FEEDBACK
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path === "/api/feedback" && request.method === "POST") {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_WS_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        let feedbackData;
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          feedbackData = await request.json();
        } else {
          const formData = await request.formData();
          feedbackData = {
            id: Date.now().toString(),
            feedbackType: formData.get("feedbackType") || "other",
            subject: formData.get("subject") || "",
            userName: formData.get("userName") || "\u533F\u540D\u7528\u6237",
            userEmail: formData.get("userEmail") || "",
            message: formData.get("message") || "",
            status: "pending",
            submitTime: (/* @__PURE__ */ new Date()).toISOString(),
            deviceInfo: {
              userAgent: request.headers.get("user-agent") || "",
              screenSize: `${screen.width}x${screen.height}`,
              viewport: `${window.innerWidth}x${window.innerHeight}`
            }
          };
        }
        if (!feedbackData.id) {
          feedbackData.id = Date.now().toString();
        }
        feedbackData.likes = feedbackData.likes || 0;
        feedbackData.dislikes = feedbackData.dislikes || 0;
        feedbackData.userLiked = feedbackData.userLiked || false;
        feedbackData.userDisliked = feedbackData.userDisliked || false;
        feedbackData.comments = feedbackData.comments || [];
        feedbackData.status = feedbackData.status || "pending";
        feedbackData.submitTime = feedbackData.submitTime || (/* @__PURE__ */ new Date()).toISOString();
        feedbackData.updateTime = feedbackData.updateTime || feedbackData.submitTime;
        if (!feedbackData.deviceInfo) {
          feedbackData.deviceInfo = {
            userAgent: request.headers.get("user-agent") || "",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
        await env.KV_WS_FEEDBACK.put(`feedback_${feedbackData.id}`, JSON.stringify(feedbackData));
        await updateFeedbackIndex(env, feedbackData.id);
        return new Response(JSON.stringify({
          success: true,
          id: feedbackData.id,
          message: "Feedback submitted successfully",
          data: feedbackData
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path === "/api/feedback" && request.method === "GET") {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_WS_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        let indexData = await env.KV_WS_FEEDBACK.get("feedback_index");
        let feedbackIds = indexData ? JSON.parse(indexData) : [];
        if (feedbackIds.length === 0) {
          console.log("Index is empty, attempting to rebuild...");
          feedbackIds = await rebuildFeedbackIndex(env);
        }
        const feedbacks = [];
        for (const id of feedbackIds) {
          try {
            const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${id}`);
            if (feedbackData) {
              const feedback = JSON.parse(feedbackData);
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
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path.startsWith("/api/feedback/") && request.method === "GET") {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_WS_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedbackId = path.split("/").pop();
        const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        if (!feedbackData) {
          return new Response(JSON.stringify({
            error: "Feedback not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedback = JSON.parse(feedbackData);
        const commentsData = await env.KV_WS_FEEDBACK.get(`comments_${feedbackId}`);
        feedback.comments = commentsData ? JSON.parse(commentsData) : [];
        feedback.commentsCount = feedback.comments.length;
        return new Response(JSON.stringify({
          success: true,
          data: feedback
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path.startsWith("/api/feedback/") && request.method === "PUT") {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_WS_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedbackId = path.split("/").pop();
        const updateData = await request.json();
        const existingData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        if (!existingData) {
          return new Response(JSON.stringify({
            error: "Feedback not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedbackData = {
          ...JSON.parse(existingData),
          ...updateData,
          id: feedbackId,
          // Ensure ID doesn't change
          updateTime: (/* @__PURE__ */ new Date()).toISOString()
        };
        await env.KV_WS_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));
        return new Response(JSON.stringify({
          success: true,
          message: "Feedback updated successfully",
          data: feedbackData
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path.endsWith("/like") && request.method === "POST") {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_WS_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedbackId = path.split("/")[3];
        const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        if (!feedbackData) {
          return new Response(JSON.stringify({
            error: "Feedback not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedback = JSON.parse(feedbackData);
        if (!feedback.likes) feedback.likes = 0;
        if (!feedback.dislikes) feedback.dislikes = 0;
        if (!feedback.userLiked) feedback.userLiked = false;
        if (!feedback.userDisliked) feedback.userDisliked = false;
        if (feedback.userLiked) {
          feedback.likes = Math.max(0, feedback.likes - 1);
          feedback.userLiked = false;
        } else {
          feedback.likes += 1;
          feedback.userLiked = true;
          if (feedback.userDisliked) {
            feedback.dislikes = Math.max(0, feedback.dislikes - 1);
            feedback.userDisliked = false;
          }
        }
        await env.KV_WS_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedback));
        return new Response(JSON.stringify({
          success: true,
          likes: feedback.likes,
          dislikes: feedback.dislikes,
          userLiked: feedback.userLiked,
          userDisliked: feedback.userDisliked
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path.endsWith("/dislike") && request.method === "POST") {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_WS_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedbackId = path.split("/")[3];
        const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        if (!feedbackData) {
          return new Response(JSON.stringify({
            error: "Feedback not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedback = JSON.parse(feedbackData);
        if (!feedback.likes) feedback.likes = 0;
        if (!feedback.dislikes) feedback.dislikes = 0;
        if (!feedback.userLiked) feedback.userLiked = false;
        if (!feedback.userDisliked) feedback.userDisliked = false;
        if (feedback.userDisliked) {
          feedback.dislikes = Math.max(0, feedback.dislikes - 1);
          feedback.userDisliked = false;
        } else {
          feedback.dislikes += 1;
          feedback.userDisliked = true;
          if (feedback.userLiked) {
            feedback.likes = Math.max(0, feedback.likes - 1);
            feedback.userLiked = false;
          }
        }
        await env.KV_WS_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedback));
        return new Response(JSON.stringify({
          success: true,
          likes: feedback.likes,
          dislikes: feedback.dislikes,
          userLiked: feedback.userLiked,
          userDisliked: feedback.userDisliked
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path.endsWith("/comments") && request.method === "GET") {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_WS_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedbackId = path.split("/")[3];
        const commentsData = await env.KV_WS_FEEDBACK.get(`comments_${feedbackId}`);
        const comments = commentsData ? JSON.parse(commentsData) : [];
        return new Response(JSON.stringify({
          success: true,
          comments
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path.endsWith("/comments") && request.method === "POST") {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_WS_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedbackId = path.split("/")[3];
        const commentsData = await env.KV_WS_FEEDBACK.get(`comments_${feedbackId}`);
        let comments = commentsData ? JSON.parse(commentsData) : [];
        const commentData = await request.json();
        const newComment = {
          id: Date.now().toString(),
          feedbackId,
          userName: commentData.userName || "\u533F\u540D\u7528\u6237",
          message: commentData.message,
          createTime: (/* @__PURE__ */ new Date()).toISOString()
        };
        comments.push(newComment);
        await env.KV_WS_FEEDBACK.put(`comments_${feedbackId}`, JSON.stringify(comments));
        return new Response(JSON.stringify({
          success: true,
          comment: newComment
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path.startsWith("/api/feedback/") && request.method === "DELETE") {
        if (!env.KV_WS_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_WS_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const feedbackId = path.split("/").pop();
        const feedbackData = await env.KV_WS_FEEDBACK.get(`feedback_${feedbackId}`);
        if (!feedbackData) {
          return new Response(JSON.stringify({
            error: "Feedback not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        await env.KV_WS_FEEDBACK.delete(`feedback_${feedbackId}`);
        await env.KV_WS_FEEDBACK.delete(`comments_${feedbackId}`);
        await removeFromFeedbackIndex(env, feedbackId);
        return new Response(JSON.stringify({
          success: true,
          message: "Feedback deleted successfully"
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      return new Response(JSON.stringify({
        error: "Not Found",
        path
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(JSON.stringify({
        error: "Internal Server Error",
        message: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  }
};
async function updateFeedbackIndex(env, feedbackId) {
  try {
    let indexData = await env.KV_WS_FEEDBACK.get("feedback_index");
    let feedbackIds = indexData ? JSON.parse(indexData) : [];
    if (!feedbackIds.includes(feedbackId)) {
      feedbackIds.unshift(feedbackId);
      if (feedbackIds.length > 1e3) {
        feedbackIds = feedbackIds.slice(0, 1e3);
      }
      await env.KV_WS_FEEDBACK.put("feedback_index", JSON.stringify(feedbackIds));
    }
  } catch (error) {
    console.error("Error updating feedback index:", error);
  }
}
__name(updateFeedbackIndex, "updateFeedbackIndex");
async function removeFromFeedbackIndex(env, feedbackId) {
  try {
    let indexData = await env.KV_WS_FEEDBACK.get("feedback_index");
    let feedbackIds = indexData ? JSON.parse(indexData) : [];
    feedbackIds = feedbackIds.filter((id) => id !== feedbackId);
    await env.KV_WS_FEEDBACK.put("feedback_index", JSON.stringify(feedbackIds));
  } catch (error) {
    console.error("Error removing from feedback index:", error);
  }
}
__name(removeFromFeedbackIndex, "removeFromFeedbackIndex");
async function rebuildFeedbackIndex(env) {
  try {
    console.log("Rebuilding feedback index...");
    const feedbackIds = [];
    const now = Date.now();
    const searchRanges = [
      { start: now - 60 * 60 * 1e3, end: now },
      // Last hour
      { start: now - 24 * 60 * 60 * 1e3, end: now - 60 * 60 * 1e3 },
      // Last 24 hours
      { start: now - 7 * 24 * 60 * 60 * 1e3, end: now - 24 * 60 * 60 * 1e3 }
      // Last 7 days
    ];
    for (const range of searchRanges) {
      for (let timestamp = range.end; timestamp >= range.start; timestamp -= 5 * 60 * 1e3) {
        try {
          const testData = await env.KV_WS_FEEDBACK.get(`feedback_${timestamp}`);
          if (testData) {
            feedbackIds.push(timestamp.toString());
            console.log("Found feedback:", timestamp);
          }
        } catch (e) {
        }
        if (feedbackIds.length >= 50) break;
      }
      if (feedbackIds.length >= 50) break;
    }
    if (feedbackIds.length > 0) {
      feedbackIds.sort((a, b) => parseInt(b) - parseInt(a));
      await env.KV_WS_FEEDBACK.put("feedback_index", JSON.stringify(feedbackIds));
      console.log("Index rebuilt successfully, found", feedbackIds.length, "records");
    } else {
      console.log("No feedback records found");
    }
    return feedbackIds;
  } catch (error) {
    console.error("Error rebuilding feedback index:", error);
    return [];
  }
}
__name(rebuildFeedbackIndex, "rebuildFeedbackIndex");

// C:/Users/45333/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/45333/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-HPbZwt/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = ws_feedback_worker_default;

// C:/Users/45333/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-HPbZwt/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=ws-feedback-worker.js.map
