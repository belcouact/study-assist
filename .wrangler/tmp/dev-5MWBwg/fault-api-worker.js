var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-umzYD2/checked-fetch.js
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

// .wrangler/tmp/bundle-umzYD2/strip-cf-connecting-ip-header.js
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

// workers/fault-api-worker.js
var fault_api_worker_default = {
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
      if (path === "/api/faults/health") {
        return new Response(JSON.stringify({
          status: "ok",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          kv_bound: !!env.KV_WS_HUB
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path === "/api/faults" && request.method === "GET") {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: "KV_WS_HUB not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        let indexData = await env.KV_WS_HUB.get("faults_index");
        let faultIds = indexData ? JSON.parse(indexData) : [];
        console.log("\u6545\u969C\u7D22\u5F15\u6570\u636E:", faultIds);
        if (faultIds.length === 0) {
          console.log("\u6545\u969C\u7D22\u5F15\u4E3A\u7A7A\uFF0C\u5C1D\u8BD5\u91CD\u5EFA...");
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
                const testData = await env.KV_WS_HUB.get(`fault_${timestamp}`);
                if (testData) {
                  possibleIds.push(timestamp.toString());
                  console.log("\u627E\u5230\u6545\u969C\u8BB0\u5F55:", timestamp);
                }
              } catch (e) {
              }
              if (possibleIds.length >= 50) break;
            }
            if (possibleIds.length >= 50) break;
          }
          if (possibleIds.length > 0) {
            possibleIds.sort((a, b) => parseInt(b) - parseInt(a));
            faultIds = possibleIds;
            await env.KV_WS_HUB.put("faults_index", JSON.stringify(faultIds));
            console.log("\u91CD\u5EFA\u6545\u969C\u7D22\u5F15\u6210\u529F\uFF0C\u627E\u5230", possibleIds.length, "\u6761\u8BB0\u5F55");
          } else {
            console.log("\u672A\u627E\u5230\u4EFB\u4F55\u6545\u969C\u8BB0\u5F55");
          }
        }
        const faults = [];
        for (const id of faultIds) {
          try {
            const faultData = await env.KV_WS_HUB.get(`fault_${id}`);
            if (faultData) {
              const fault = JSON.parse(faultData);
              if (fault && typeof fault === "object" && fault.id) {
                faults.push(fault);
              } else {
                console.warn(`\u6545\u969C ${id} \u6570\u636E\u7ED3\u6784\u65E0\u6548:`, fault);
              }
            } else {
              console.warn(`\u6545\u969C ${id} \u6570\u636E\u4E3A\u7A7A`);
            }
          } catch (parseError) {
            console.warn(`\u89E3\u6790\u6545\u969C ${id} \u5931\u8D25:`, parseError);
          }
        }
        console.log(`\u6210\u529F\u83B7\u53D6 ${faults.length} \u6761\u6709\u6548\u6545\u969C\u8BB0\u5F55`);
        faults.sort((a, b) => {
          try {
            const timeA = a.reportTime ? new Date(a.reportTime).getTime() : 0;
            const timeB = b.reportTime ? new Date(b.reportTime).getTime() : 0;
            return timeB - timeA;
          } catch (error) {
            console.warn("\u6392\u5E8F\u65F6\u95F4\u5931\u8D25:", error);
            return 0;
          }
        });
        return new Response(JSON.stringify(faults), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (path === "/api/faults" && request.method === "POST") {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: "KV_WS_HUB not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        try {
          const faultData = await request.json();
          const faultId = Date.now().toString();
          const newFault = {
            id: faultId,
            equipmentId: faultData.equipmentId || "",
            equipmentName: faultData.equipmentName || "",
            faultType: faultData.faultType || "",
            faultLevel: faultData.faultLevel || "medium",
            reportTime: faultData.reportTime || (/* @__PURE__ */ new Date()).toISOString(),
            reporter: faultData.reporter || "",
            faultDescription: faultData.faultDescription || "",
            status: faultData.status || "pending",
            handler: faultData.handler || "",
            handleTime: faultData.handleTime || "",
            handleDescription: faultData.handleDescription || "",
            createTime: (/* @__PURE__ */ new Date()).toISOString(),
            updateTime: (/* @__PURE__ */ new Date()).toISOString()
          };
          await env.KV_WS_HUB.put(`fault_${faultId}`, JSON.stringify(newFault));
          await updateFaultIndex(env, faultId);
          return new Response(JSON.stringify({
            success: true,
            id: faultId,
            message: "\u6545\u969C\u521B\u5EFA\u6210\u529F",
            data: newFault
          }), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error("\u521B\u5EFA\u6545\u969C\u5931\u8D25:", error);
          return new Response(JSON.stringify({
            error: "Failed to create fault",
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
      if (path.startsWith("/api/faults/") && request.method === "PUT") {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: "KV_WS_HUB not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        try {
          const faultId = path.split("/").pop();
          console.log("\u66F4\u65B0\u6545\u969C\u72B6\u6001:", faultId);
          const requestBody = await request.json();
          const { status, handler, handleDescription } = requestBody;
          const existingData = await env.KV_WS_HUB.get(`fault_${faultId}`);
          if (!existingData) {
            return new Response(JSON.stringify({
              error: "\u6545\u969C\u4E0D\u5B58\u5728",
              faultId
            }), {
              status: 404,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders
              }
            });
          }
          const faultData = JSON.parse(existingData);
          if (status) faultData.status = status;
          if (handler) faultData.handler = handler;
          if (handleDescription) faultData.handleDescription = handleDescription;
          if (status && (status === "processing" || status === "completed") && faultData.status !== status) {
            faultData.handleTime = (/* @__PURE__ */ new Date()).toISOString();
          }
          faultData.updateTime = (/* @__PURE__ */ new Date()).toISOString();
          await env.KV_WS_HUB.put(`fault_${faultId}`, JSON.stringify(faultData));
          console.log(`\u6545\u969C ${faultId} \u72B6\u6001\u5DF2\u66F4\u65B0\u4E3A: ${status}`);
          return new Response(JSON.stringify({
            success: true,
            fault: faultData,
            message: "\u6545\u969C\u66F4\u65B0\u6210\u529F"
          }), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error("\u66F4\u65B0\u6545\u969C\u72B6\u6001\u5931\u8D25:", error);
          return new Response(JSON.stringify({
            error: "Failed to update fault",
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
      if (path.startsWith("/api/faults/") && request.method === "DELETE") {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: "KV_WS_HUB not bound"
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        try {
          const faultId = path.split("/").pop();
          console.log("\u5220\u9664\u6545\u969C:", faultId);
          await env.KV_WS_HUB.delete(`fault_${faultId}`);
          await removeFaultFromIndex(env, faultId);
          return new Response(JSON.stringify({
            success: true,
            message: "\u6545\u969C\u5220\u9664\u6210\u529F"
          }), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        } catch (error) {
          console.error("\u5220\u9664\u6545\u969C\u5931\u8D25:", error);
          return new Response(JSON.stringify({
            error: "Failed to delete fault",
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
      if (path === "/api/faults/rebuild-index" && request.method === "POST") {
        if (!env.KV_WS_HUB) {
          return new Response(JSON.stringify({
            error: "KV_WS_HUB not bound"
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
        console.log("\u5F00\u59CB\u626B\u63CF\u6545\u969C\u6570\u636E...");
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
              const testData = await env.KV_WS_HUB.get(`fault_${timestamp}`);
              if (testData) {
                foundIds.push(timestamp.toString());
                rangeCount++;
                console.log(`\u5728${range.name}\u627E\u5230\u6545\u969C\u8BB0\u5F55:`, timestamp);
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
        await env.KV_WS_HUB.put("faults_index", JSON.stringify(uniqueIds));
        return new Response(JSON.stringify({
          success: true,
          message: "\u6545\u969C\u7D22\u5F15\u91CD\u5EFA\u5B8C\u6210",
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
async function updateFaultIndex(env, faultId) {
  try {
    const indexData = await env.KV_WS_HUB.get("faults_index");
    let faultIds = indexData ? JSON.parse(indexData) : [];
    if (!faultIds.includes(faultId)) {
      faultIds.unshift(faultId);
    }
    if (faultIds.length > 1e3) {
      faultIds = faultIds.slice(0, 1e3);
    }
    await env.KV_WS_HUB.put("faults_index", JSON.stringify(faultIds));
    console.log("\u6545\u969C\u7D22\u5F15\u66F4\u65B0\u6210\u529F\uFF0C\u5F53\u524D\u603B\u6570:", faultIds.length);
  } catch (error) {
    console.error("\u66F4\u65B0\u6545\u969C\u7D22\u5F15\u5931\u8D25:", error);
  }
}
__name(updateFaultIndex, "updateFaultIndex");
async function removeFaultFromIndex(env, faultId) {
  try {
    const indexData = await env.KV_WS_HUB.get("faults_index");
    let faultIds = indexData ? JSON.parse(indexData) : [];
    faultIds = faultIds.filter((id) => id !== faultId);
    await env.KV_WS_HUB.put("faults_index", JSON.stringify(faultIds));
    console.log(`\u4ECE\u7D22\u5F15\u4E2D\u5220\u9664\u6545\u969C ${faultId}\uFF0C\u5269\u4F59\u603B\u6570:`, faultIds.length);
  } catch (error) {
    console.error("\u4ECE\u7D22\u5F15\u5220\u9664\u6545\u969C\u5931\u8D25:", error);
  }
}
__name(removeFaultFromIndex, "removeFaultFromIndex");

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

// .wrangler/tmp/bundle-umzYD2/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = fault_api_worker_default;

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

// .wrangler/tmp/bundle-umzYD2/middleware-loader.entry.ts
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
//# sourceMappingURL=fault-api-worker.js.map
