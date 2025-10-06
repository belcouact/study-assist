var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-0w0WYC/checked-fetch.js
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

// .wrangler/tmp/bundle-0w0WYC/strip-cf-connecting-ip-header.js
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

// workers/feedback-api-worker.js
var feedback_api_worker_default = {
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
          kv_bound: !!env.KV_FEEDBACK
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path === "/api/feedback" && request.method === "POST") {
        if (!env.KV_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const formData = await request.formData();
        const feedbackId = Date.now().toString();
        const feedbackData = {
          id: feedbackId,
          feedbackType: formData.get("feedbackType") || "unknown",
          userName: formData.get("userName") || "\u533F\u540D\u7528\u6237",
          userContact: formData.get("userContact") || "",
          deviceType: formData.get("deviceType") || "unknown",
          pageLocation: formData.get("pageLocation") || "",
          description: formData.get("description") || "",
          priority: formData.get("priority") || "medium",
          ratings: safeParseJSON(formData.get("ratings"), {}),
          deviceInfo: safeParseJSON(formData.get("deviceInfo"), {}),
          status: "pending",
          submitTime: (/* @__PURE__ */ new Date()).toISOString(),
          imageIds: []
        };
        const uploadedImages = [];
        const screenshots = formData.getAll("screenshots");
        console.log("\u5904\u7406\u56FE\u7247\u6587\u4EF6\uFF0C\u6570\u91CF:", screenshots.length);
        for (const file of screenshots) {
          if (file && file.size > 0) {
            try {
              const imageId = `${feedbackId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const arrayBuffer = await file.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              const binaryString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("");
              const base64Data = btoa(binaryString);
              const imageData = {
                id: imageId,
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64Data,
                uploadTime: (/* @__PURE__ */ new Date()).toISOString()
              };
              await env.KV_FEEDBACK.put(`image_${imageId}`, JSON.stringify(imageData));
              uploadedImages.push(imageId);
              console.log(`\u56FE\u7247 ${file.name} \u5B58\u50A8\u6210\u529F\uFF0CID: ${imageId}`);
            } catch (imageError) {
              console.error("\u5904\u7406\u56FE\u7247\u5931\u8D25:", file.name, imageError);
            }
          }
        }
        feedbackData.imageIds = uploadedImages;
        console.log("\u53CD\u9988\u5305\u542B\u56FE\u7247\u6570\u91CF:", uploadedImages.length);
        await env.KV_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));
        await updateFeedbackIndex(env, feedbackId);
        return new Response(JSON.stringify({
          success: true,
          id: feedbackId,
          message: `\u53CD\u9988\u63D0\u4EA4\u6210\u529F${uploadedImages.length > 0 ? `\uFF0C\u5305\u542B ${uploadedImages.length} \u5F20\u56FE\u7247` : ""}`,
          data: feedbackData,
          imagesUploaded: uploadedImages.length,
          imageIds: uploadedImages
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path === "/api/feedback" && request.method === "GET") {
        if (!env.KV_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        let indexData = await env.KV_FEEDBACK.get("feedback_index");
        let feedbackIds = indexData ? JSON.parse(indexData) : [];
        console.log("\u7D22\u5F15\u6570\u636E:", feedbackIds);
        if (feedbackIds.length === 0) {
          console.log("\u7D22\u5F15\u4E3A\u7A7A\uFF0C\u5C1D\u8BD5\u91CD\u5EFA...");
          const possibleIds = [];
          const now = Date.now();
          const searchRanges = [
            { start: now - 60 * 60 * 1e3, end: now },
            // 最近1小时
            { start: now - 24 * 60 * 60 * 1e3, end: now - 60 * 60 * 1e3 },
            // 最近24小时
            { start: now - 7 * 24 * 60 * 60 * 1e3, end: now - 24 * 60 * 60 * 1e3 }
            // 最近7天
          ];
          for (const range of searchRanges) {
            for (let timestamp = range.end; timestamp >= range.start; timestamp -= 5 * 60 * 1e3) {
              try {
                const testData = await env.KV_FEEDBACK.get(`feedback_${timestamp}`);
                if (testData) {
                  possibleIds.push(timestamp.toString());
                  console.log("\u627E\u5230\u53CD\u9988:", timestamp);
                }
              } catch (e) {
              }
              if (possibleIds.length >= 50) break;
            }
            if (possibleIds.length >= 50) break;
          }
          if (possibleIds.length > 0) {
            possibleIds.sort((a, b) => parseInt(b) - parseInt(a));
            feedbackIds = possibleIds;
            await env.KV_FEEDBACK.put("feedback_index", JSON.stringify(feedbackIds));
            console.log("\u91CD\u5EFA\u7D22\u5F15\u6210\u529F\uFF0C\u627E\u5230", possibleIds.length, "\u6761\u8BB0\u5F55");
          } else {
            console.log("\u672A\u627E\u5230\u4EFB\u4F55\u53CD\u9988\u8BB0\u5F55");
          }
        }
        const feedbacks = [];
        for (const id of feedbackIds) {
          try {
            const feedbackData = await env.KV_FEEDBACK.get(`feedback_${id}`);
            if (feedbackData) {
              const feedback = JSON.parse(feedbackData);
              if (feedback && typeof feedback === "object" && feedback.id) {
                feedbacks.push(feedback);
              } else {
                console.warn(`\u53CD\u9988 ${id} \u6570\u636E\u7ED3\u6784\u65E0\u6548:`, feedback);
              }
            } else {
              console.warn(`\u53CD\u9988 ${id} \u6570\u636E\u4E3A\u7A7A`);
            }
          } catch (parseError) {
            console.warn(`\u89E3\u6790\u53CD\u9988 ${id} \u5931\u8D25:`, parseError);
          }
        }
        console.log(`\u6210\u529F\u83B7\u53D6 ${feedbacks.length} \u6761\u6709\u6548\u53CD\u9988`);
        feedbacks.sort((a, b) => {
          try {
            const timeA = a.submitTime ? new Date(a.submitTime).getTime() : 0;
            const timeB = b.submitTime ? new Date(b.submitTime).getTime() : 0;
            return timeB - timeA;
          } catch (error) {
            console.warn("\u6392\u5E8F\u65F6\u95F4\u5931\u8D25:", error);
            return 0;
          }
        });
        return new Response(JSON.stringify(feedbacks), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path.startsWith("/api/feedback/") && request.method === "PUT") {
        if (!env.KV_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        try {
          const feedbackId = path.split("/").pop();
          console.log("\u66F4\u65B0\u53CD\u9988\u72B6\u6001:", feedbackId);
          const requestBody = await request.json();
          const { status } = requestBody;
          if (!status) {
            return new Response(JSON.stringify({
              error: "Missing status field"
            }), {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders
              }
            });
          }
          const existingData = await env.KV_FEEDBACK.get(`feedback_${feedbackId}`);
          if (!existingData) {
            return new Response(JSON.stringify({
              error: "\u53CD\u9988\u4E0D\u5B58\u5728",
              feedbackId
            }), {
              status: 404,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders
              }
            });
          }
          const feedbackData = JSON.parse(existingData);
          feedbackData.status = status;
          feedbackData.updatedTime = (/* @__PURE__ */ new Date()).toISOString();
          await env.KV_FEEDBACK.put(`feedback_${feedbackId}`, JSON.stringify(feedbackData));
          console.log(`\u53CD\u9988 ${feedbackId} \u72B6\u6001\u5DF2\u66F4\u65B0\u4E3A: ${status}`);
          return new Response(JSON.stringify({
            success: true,
            feedback: feedbackData,
            message: "\u72B6\u6001\u66F4\u65B0\u6210\u529F"
          }), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error("\u66F4\u65B0\u53CD\u9988\u72B6\u6001\u5931\u8D25:", error);
          return new Response(JSON.stringify({
            error: "Failed to update feedback status",
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
      if (path.startsWith("/api/feedback/") && request.method === "DELETE") {
        if (!env.KV_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        try {
          const feedbackId = path.split("/").pop();
          console.log("\u5220\u9664\u53CD\u9988:", feedbackId);
          const existingData = await env.KV_FEEDBACK.get(`feedback_${feedbackId}`);
          if (existingData) {
            const feedbackData = JSON.parse(existingData);
            if (feedbackData.imageIds && feedbackData.imageIds.length > 0) {
              for (const imageId of feedbackData.imageIds) {
                try {
                  await env.KV_FEEDBACK.delete(`image_${imageId}`);
                  console.log("\u5220\u9664\u56FE\u7247:", imageId);
                } catch (deleteError) {
                  console.warn("\u5220\u9664\u56FE\u7247\u5931\u8D25:", imageId, deleteError);
                }
              }
            }
          }
          await env.KV_FEEDBACK.delete(`feedback_${feedbackId}`);
          await removeFeedbackFromIndex(env, feedbackId);
          return new Response(JSON.stringify({
            success: true,
            message: "\u53CD\u9988\u5220\u9664\u6210\u529F"
          }), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error("\u5220\u9664\u53CD\u9988\u5931\u8D25:", error);
          return new Response(JSON.stringify({
            error: "Failed to delete feedback",
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
      if (path.startsWith("/api/image/") && request.method === "GET") {
        if (!env.KV_FEEDBACK) {
          return new Response("KV not bound", {
            status: 500,
            headers: corsHeaders
          });
        }
        try {
          const imageId = path.split("/").pop();
          console.log("\u83B7\u53D6\u56FE\u7247:", imageId);
          const imageData = await env.KV_FEEDBACK.get(`image_${imageId}`);
          if (!imageData) {
            return new Response("Image not found", {
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
              "Content-Type": image.type,
              "Content-Disposition": `inline; filename="${image.name}"`,
              "Cache-Control": "public, max-age=31536000",
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error("\u83B7\u53D6\u56FE\u7247\u5931\u8D25:", error);
          return new Response("Image processing error", {
            status: 500,
            headers: corsHeaders
          });
        }
      }
      if (path === "/api/admin/rebuild-index" && request.method === "POST") {
        if (!env.KV_FEEDBACK) {
          return new Response(JSON.stringify({
            error: "KV_FEEDBACK not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const now = Date.now();
        const foundIds = [];
        console.log("\u5F00\u59CB\u626B\u63CF\u53CD\u9988\u6570\u636E...");
        const scanRanges = [
          { name: "\u6700\u8FD11\u5C0F\u65F6", start: now - 60 * 60 * 1e3, end: now, interval: 60 * 1e3 },
          // 每分钟
          { name: "\u6700\u8FD124\u5C0F\u65F6", start: now - 24 * 60 * 60 * 1e3, end: now - 60 * 60 * 1e3, interval: 5 * 60 * 1e3 },
          // 每5分钟
          { name: "\u6700\u8FD17\u5929", start: now - 7 * 24 * 60 * 60 * 1e3, end: now - 24 * 60 * 60 * 1e3, interval: 30 * 60 * 1e3 }
          // 每30分钟
        ];
        for (const range of scanRanges) {
          console.log(`\u626B\u63CF${range.name}...`);
          let rangeCount = 0;
          for (let timestamp = range.end; timestamp >= range.start; timestamp -= range.interval) {
            try {
              const testData = await env.KV_FEEDBACK.get(`feedback_${timestamp}`);
              if (testData) {
                foundIds.push(timestamp.toString());
                rangeCount++;
                console.log(`\u5728${range.name}\u627E\u5230\u53CD\u9988:`, timestamp);
              }
            } catch (e) {
            }
            if (rangeCount >= 100) {
              console.log(`${range.name}\u626B\u63CF\u8FBE\u5230\u9650\u5236\uFF0C\u505C\u6B62\u626B\u63CF`);
              break;
            }
          }
          console.log(`${range.name}\u626B\u63CF\u5B8C\u6210\uFF0C\u627E\u5230 ${rangeCount} \u6761\u8BB0\u5F55`);
        }
        const uniqueIds = [...new Set(foundIds)];
        uniqueIds.sort((a, b) => parseInt(b) - parseInt(a));
        console.log(`\u603B\u5171\u627E\u5230 ${uniqueIds.length} \u6761\u552F\u4E00\u8BB0\u5F55`);
        await env.KV_FEEDBACK.put("feedback_index", JSON.stringify(uniqueIds));
        return new Response(JSON.stringify({
          success: true,
          message: "\u7D22\u5F15\u91CD\u5EFA\u5B8C\u6210",
          foundCount: uniqueIds.length,
          foundIds: uniqueIds.slice(0, 10),
          // 只返回前10个ID作为示例
          totalScanned: foundIds.length,
          uniqueCount: uniqueIds.length
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
      console.error("Worker Error:", error);
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
    const indexData = await env.KV_FEEDBACK.get("feedback_index");
    let feedbackIds = indexData ? JSON.parse(indexData) : [];
    if (!feedbackIds.includes(feedbackId)) {
      feedbackIds.unshift(feedbackId);
    }
    if (feedbackIds.length > 1e3) {
      feedbackIds = feedbackIds.slice(0, 1e3);
    }
    await env.KV_FEEDBACK.put("feedback_index", JSON.stringify(feedbackIds));
    console.log("\u7D22\u5F15\u66F4\u65B0\u6210\u529F\uFF0C\u5F53\u524D\u603B\u6570:", feedbackIds.length);
  } catch (error) {
    console.error("\u66F4\u65B0\u7D22\u5F15\u5931\u8D25:", error);
  }
}
__name(updateFeedbackIndex, "updateFeedbackIndex");
async function removeFeedbackFromIndex(env, feedbackId) {
  try {
    const indexData = await env.KV_FEEDBACK.get("feedback_index");
    let feedbackIds = indexData ? JSON.parse(indexData) : [];
    feedbackIds = feedbackIds.filter((id) => id !== feedbackId);
    await env.KV_FEEDBACK.put("feedback_index", JSON.stringify(feedbackIds));
    console.log(`\u4ECE\u7D22\u5F15\u4E2D\u5220\u9664\u53CD\u9988 ${feedbackId}\uFF0C\u5269\u4F59\u603B\u6570:`, feedbackIds.length);
  } catch (error) {
    console.error("\u4ECE\u7D22\u5F15\u5220\u9664\u53CD\u9988\u5931\u8D25:", error);
  }
}
__name(removeFeedbackFromIndex, "removeFeedbackFromIndex");
function safeParseJSON(jsonString, defaultValue = {}) {
  try {
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    console.warn("JSON \u89E3\u6790\u5931\u8D25:", jsonString, error);
    return defaultValue;
  }
}
__name(safeParseJSON, "safeParseJSON");

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

// .wrangler/tmp/bundle-0w0WYC/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = feedback_api_worker_default;

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

// .wrangler/tmp/bundle-0w0WYC/middleware-loader.entry.ts
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
//# sourceMappingURL=feedback-api-worker.js.map
