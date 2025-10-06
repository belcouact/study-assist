var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-ASNGBl/checked-fetch.js
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

// .wrangler/tmp/bundle-ASNGBl/strip-cf-connecting-ip-header.js
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

// .wrangler/tmp/pages-KrOJof/functionsWorker-0.9917579234318874.mjs
var __defProp2 = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __esm = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
var urls2;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-KIniRn/checked-fetch.js"() {
    urls2 = /* @__PURE__ */ new Set();
    __name2(checkURL2, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL2(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});
function stripCfConnectingIPHeader2(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
var init_strip_cf_connecting_ip_header = __esm({
  "../.wrangler/tmp/bundle-KIniRn/strip-cf-connecting-ip-header.js"() {
    __name2(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        return Reflect.apply(target, thisArg, [
          stripCfConnectingIPHeader2.apply(null, argArray)
        ]);
      }
    });
  }
});
var table_exports = {};
__export(table_exports, {
  onRequest: /* @__PURE__ */ __name(() => onRequest, "onRequest")
});
async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  try {
    const url = new URL(context.request.url);
    const databaseParam = url.searchParams.get("database") || "default";
    let db;
    if (databaseParam === "db_gore") {
      if (!context.env.DB_GORE) {
        throw new Error('Database binding "DB_GORE" not found. Please check your Cloudflare Pages D1 database bindings.');
      }
      db = context.env.DB_GORE;
    } else if (databaseParam === "ws-hub-db") {
      if (!context.env.DB_WS_HUB) {
        throw new Error('Database binding "DB_WS_HUB" not found. Please check your Cloudflare Pages D1 database bindings.');
      }
      db = context.env.DB_WS_HUB;
    } else {
      if (!context.env.DB) {
        throw new Error('Database binding "DB" not found. Please check your Cloudflare Pages D1 database bindings.');
      }
      db = context.env.DB;
    }
    const { action, table } = context.params;
    const validTables = ["chinese_dynasty", "quote", "vocabulary", "chinese_poem", "english_dialog", "world_history", "lab_warehouse", "fa_svg", "country_info", "equipment_basic_info", "personnel_list"];
    if (!validTables.includes(table)) {
      throw new Error("Invalid table name");
    }
    switch (action) {
      case "test":
        const testResult = await db.prepare(`SELECT 1 FROM ${table} LIMIT 1`).first();
        const url2 = new URL(context.request.url);
        const databaseName = url2.searchParams.get("database") || "default";
        return new Response(JSON.stringify({
          success: true,
          message: `Successfully connected to ${table} table!`,
          table,
          database: databaseName
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      case "query":
        const queryResult = await db.prepare(`
                    SELECT * FROM ${table}
                `).all();
        return new Response(JSON.stringify({
          success: true,
          table,
          data: queryResult.results || []
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      case "upload":
        if (context.request.method !== "POST") {
          throw new Error("Upload requires POST method");
        }
        const { data, database } = await context.request.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("Invalid data format. Expected non-empty array.");
        }
        let insertedCount = 0;
        let deletedCount = 0;
        try {
          if (table === "chinese_dynasty") {
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO chinese_dynasty (Number, Dynasty, Period, Title, Event)
                                VALUES (?, ?, ?, ?, ?)
                            `).bind(
                row.Number || null,
                row.Dynasty || null,
                row.Period || null,
                row.Title || null,
                row.Event || null
              );
            }));
          } else if (table === "quote") {
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO quote (Number, Type, Chinese, English, Remark_1, Remark_2)
                                VALUES (?, ?, ?, ?, ?, ?)
                            `).bind(
                row.Number || null,
                row.Type || null,
                row.Chinese || null,
                row.English || null,
                row.Remark_1 || null,
                row.Remark_2 || null
              );
            }));
          } else if (table === "world_history") {
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO world_history (CATEGORY, REGION, PERIOD, SUB_CATEGORY_1, SUB_CATEGORY_2, TITLE, BACKGROUND, EVENT, IMPACT, REMARK_1, REMARK_2, REMARK_3)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                row.CATEGORY || null,
                row.REGION || null,
                row.PERIOD || null,
                row.SUB_CATEGORY_1 || null,
                row.SUB_CATEGORY_2 || null,
                row.TITLE || null,
                row.BACKGROUND || null,
                row.EVENT || null,
                row.IMPACT || null,
                row.REMARK_1 || null,
                row.REMARK_2 || null,
                row.REMARK_3 || null
              );
            }));
          } else if (table === "chinese_poem") {
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO chinese_poem (Title, Number, Poem, Remark_1, Remark_2, Remark_3, Author, Dynasty)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                row.Title || null,
                row.Number || null,
                row.Poem || null,
                row.Remark_1 || null,
                row.Remark_2 || null,
                row.Remark_3 || null,
                row.Author || null,
                row.Dynasty || null
              );
            }));
          } else if (table === "fa_svg") {
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO fa_svg (Name, Category, Path)
                                VALUES (?, ?, ?)
                            `).bind(
                row.Name || null,
                row.Category || null,
                row.Path || null
              );
            }));
          } else if (table === "country_info") {
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO country_info (Country_Code_Fips_10, Factbook_File_Path, Country_Code_Alpha2, Continent_Eng, Country_Name_Eng, Continent_Chn, Country_Name_Chn, Flag_SVG, Other1, Other2, Other3)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                row.Country_Code_Fips_10 || null,
                row.Factbook_File_Path || null,
                row.Country_Code_Alpha2 || null,
                row.Continent_Eng || null,
                row.Country_Name_Eng || null,
                row.Continent_Chn || null,
                row.Country_Name_Chn || null,
                row.Flag_SVG || null,
                row.Other1 || null,
                row.Other2 || null,
                row.Other3 || null
              );
            }));
          } else if (table === "vocabulary") {
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO vocabulary (
                                    Word_Rank, Word, Word_ID, US_Pronunciation, UK_Pronunciation, 
                                    US_Speech, UK_Speech, Translations, Synonyms, Example_Sentences, 
                                    Remark_1, Remark_2, Remark_3, Remark_4, Remark_5
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                row.Word_Rank || null,
                row.Word || null,
                row.Word_ID || null,
                row.US_Pronunciation || null,
                row.UK_Pronunciation || null,
                row.US_Speech || null,
                row.UK_Speech || null,
                row.Translations || null,
                row.Synonyms || null,
                row.Example_Sentences || null,
                row.Remark_1 || null,
                row.Remark_2 || null,
                row.Remark_3 || null,
                row.Remark_4 || null,
                row.Remark_5 || null
              );
            }));
          } else if (table === "lab_warehouse") {
            const deleteResult = await db.prepare(`DELETE FROM ${table}`).run();
            deletedCount = deleteResult.meta.changes || 0;
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO lab_warehouse (
                                    \u626B\u63CF\u5355, \u8D27\u4F4D, \u6761\u7801, \u6570\u91CF, \u54C1\u540D, \u72B6\u6001, \u5355\u4F4D, \u4EF7\u683C, \u54C1\u724C, \u4EA7\u5730, \u65F6\u95F4, \u4F5C\u4E1A\u8005, \u5176\u4ED61, \u5176\u4ED62, \u5176\u4ED63, \u5176\u4ED64, \u5176\u4ED65, \u5176\u4ED66, \u5176\u4ED67, \u5176\u4ED68
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `).bind(
                row.\u626B\u63CF\u5355 || null,
                row.\u8D27\u4F4D || null,
                row.\u6761\u7801 || null,
                row.\u6570\u91CF || null,
                row.\u54C1\u540D || null,
                row.\u72B6\u6001 || null,
                row.\u5355\u4F4D || null,
                row.\u4EF7\u683C || null,
                row.\u54C1\u724C || null,
                row.\u4EA7\u5730 || null,
                row.\u65F6\u95F4 || null,
                row.\u4F5C\u4E1A\u8005 || null,
                row.\u5176\u4ED61 || null,
                row.\u5176\u4ED62 || null,
                row.\u5176\u4ED63 || null,
                row.\u5176\u4ED64 || null,
                row.\u5176\u4ED65 || null,
                row.\u5176\u4ED66 || null,
                row.\u5176\u4ED67 || null,
                row.\u5176\u4ED68 || null
              );
            }));
          } else if (table === "equipment_basic_info") {
            const deleteResult = await db.prepare(`DELETE FROM ${table}`).run();
            deletedCount = deleteResult.meta.changes || 0;
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO equipment_basic_info (plant, equipment, area, sub_area)
                                VALUES (?, ?, ?, ?)
                            `).bind(
                row.plant || null,
                row.equipment || null,
                row.area || null,
                row.sub_area || null
              );
            }));
          } else if (table === "personnel_list") {
            const deleteResult = await db.prepare(`DELETE FROM ${table}`).run();
            deletedCount = deleteResult.meta.changes || 0;
            await db.batch(data.map((row) => {
              return db.prepare(`
                                INSERT INTO personnel_list (plant, name, function, commitment)
                                VALUES (?, ?, ?, ?)
                            `).bind(
                row.plant || null,
                row.name || null,
                row.function || null,
                row.commitment || null
              );
            }));
          }
          insertedCount = data.length;
          return new Response(JSON.stringify({
            success: true,
            message: `Data uploaded successfully. Cleared ${deletedCount} existing records and inserted ${insertedCount} new records.`,
            insertedCount,
            deletedCount,
            totalRows: insertedCount
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        } catch (error) {
          throw new Error(`Upload failed: ${error.message}`);
        }
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: "If you're seeing a database binding error, please ensure the D1 database is properly bound in your Cloudflare Pages settings."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
__name(onRequest, "onRequest");
var init_table = __esm({
  "api/db/[action]/[table].js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest, "onRequest");
  }
});
function onRequest2(context) {
  return new Response(JSON.stringify({
    // Empty rules set to prevent 404 errors
    prefetch: [{ source: "list", urls: [] }],
    prerender: [{ source: "list", urls: [] }]
  }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
__name(onRequest2, "onRequest2");
var init_speculation = __esm({
  "cdn-cgi/speculation/speculation.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest2, "onRequest");
  }
});
async function workerChatOutput(prompt, env) {
  try {
    if (!prompt || prompt.trim() === "") {
      throw new Error("Please enter a valid prompt");
    }
    const DS_KEY = env.DEEPSEEK_API_KEY;
    if (!DS_KEY) {
      throw new Error("API key not configured");
    }
    console.log("Sending request with prompt:", prompt.trim());
    console.log("Request URL:", DS_URL);
    const response = await fetch(DS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DS_KEY}`
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: prompt.trim()
        }],
        temperature: 0.7,
        max_tokens: 2e3
      })
    });
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    console.log("Raw API response:", result);
    if (result.choices && result.choices[0]?.message?.content) {
      return result.choices[0].message.content;
    } else if (result.message) {
      return result.message;
    }
    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error("Worker call error:", error);
    throw error;
  }
}
__name(workerChatOutput, "workerChatOutput");
var DS_URL;
var init_worker_chat = __esm({
  "api/worker-chat.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    DS_URL = "https://chat-api.study-llm.me";
    __name2(workerChatOutput, "workerChatOutput");
  }
});
var chat_exports = {};
__export(chat_exports, {
  onRequestGet: /* @__PURE__ */ __name(() => onRequestGet, "onRequestGet"),
  onRequestOptions: /* @__PURE__ */ __name(() => onRequestOptions, "onRequestOptions"),
  onRequestPost: /* @__PURE__ */ __name(() => onRequestPost, "onRequestPost")
});
async function onRequestPost(context) {
  try {
    const { request, env } = context;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body",
        message: e.message
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    if (body.prompt) {
      try {
        const output = await workerChatOutput(body.prompt, env);
        return new Response(JSON.stringify({
          output
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: "Error generating response",
          message: error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    } else if (body.messages && Array.isArray(body.messages)) {
      try {
        const DS_KEY = env.DEEPSEEK_API_KEY;
        if (!DS_KEY) {
          throw new Error("API key not configured");
        }
        const DS_URL2 = "https://api.deepseek.com/v1/chat/completions";
        const deepSeekResponse = await fetch(DS_URL2, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DS_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: body.messages,
            temperature: 0.7,
            max_tokens: 2e3
          })
        });
        if (!deepSeekResponse.ok) {
          const errorData = await deepSeekResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `DeepSeek API error: ${deepSeekResponse.status}`);
        }
        const result = await deepSeekResponse.json();
        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: "Error calling DeepSeek API",
          message: error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    } else {
      return new Response(JSON.stringify({
        error: "Missing prompt or messages in request body"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Server error",
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestPost, "onRequestPost");
function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");
function onRequestGet() {
  return new Response(JSON.stringify({
    message: "The chat API is working. Send POST requests to this endpoint to interact with the AI.",
    example: {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant" },
          { role: "user", content: "Hello, how are you?" }
        ]
      }, null, 2)
    }
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestGet, "onRequestGet");
var init_chat = __esm({
  "api/chat.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_worker_chat();
    __name2(onRequestPost, "onRequestPost");
    __name2(onRequestOptions, "onRequestOptions");
    __name2(onRequestGet, "onRequestGet");
  }
});
function generateCacheKey(prompt) {
  return prompt.trim();
}
__name(generateCacheKey, "generateCacheKey");
async function workerGlmOutput(prompt, env) {
  return await workerGlmOutputWithRetry(prompt, env);
}
__name(workerGlmOutput, "workerGlmOutput");
async function workerGlmOutputWithRetry(prompt, env, maxRetries = 2) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await workerGlmOutputInternal(prompt, env);
    } catch (error) {
      lastError = error;
      console.warn(`GLM API attempt ${attempt} failed:`, error.message);
      if (error.message.includes("timeout") && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        continue;
      }
      if (error.status >= 500 && error.status < 600 && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        continue;
      }
      break;
    }
  }
  throw lastError;
}
__name(workerGlmOutputWithRetry, "workerGlmOutputWithRetry");
async function workerGlmOutputInternal(prompt, env) {
  const startTime = Date.now();
  try {
    const GLM_KEY = env.GLM_API_KEY;
    if (!GLM_KEY) {
      const error = new Error("GLM API key is not configured");
      error.troubleshooting_tips = [
        "Check that GLM_API_KEY environment variable is set",
        "Verify the API key is valid and not expired",
        "Contact your administrator if the issue persists"
      ];
      throw error;
    }
    const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    const cacheKey = generateCacheKey(prompt);
    if (requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`Worker GLM cache hit for prompt: ${cacheKey}`);
        const responseTime = Date.now() - startTime;
        console.log(`Worker GLM (cached) completed in ${responseTime}ms`);
        return cached.data;
      } else {
        requestCache.delete(cacheKey);
      }
    }
    const messages = [{
      role: "user",
      content: prompt.trim()
    }];
    console.log("Sending GLM request with prompt:", prompt);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(GLM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GLM_KEY}`,
          "User-Agent": "GLM-Worker/1.0"
        },
        body: JSON.stringify({
          model: "glm-4.5",
          messages,
          temperature: TEMPERATURE,
          max_tokens: MAX_TOKENS
        }),
        signal: controller.signal,
        // Performance optimizations
        cf: {
          connectTimeout: 5e3,
          readTimeout: 1e4
        }
      });
      clearTimeout(timeoutId);
      console.log("GLM Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        const responseTime2 = Date.now() - startTime;
        console.error(`Worker GLM API error: ${response.status} - ${JSON.stringify(errorData)}`);
        const error = new Error(errorData.error?.message || errorData.message || `GLM API error: ${response.status}`);
        error.status = response.status;
        error.response_time = `${responseTime2}ms`;
        error.troubleshooting_tips = [
          "Check your API key is valid and has sufficient credits",
          "Verify the request payload is correctly formatted",
          "Try reducing the complexity of your prompt",
          "Check if the GLM API service is experiencing issues"
        ];
        throw error;
      }
      const result = await response.json();
      console.log("Raw GLM API response:", result);
      const content = result.choices?.[0]?.message?.content || "No response from GLM";
      requestCache.set(cacheKey, {
        data: content,
        timestamp: Date.now()
      });
      if (requestCache.size > 100) {
        const oldestKey = requestCache.keys().next().value;
        requestCache.delete(oldestKey);
      }
      const responseTime = Date.now() - startTime;
      console.log(`Worker GLM completed in ${responseTime}ms`);
      return content;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.error("Worker GLM request timeout");
        const error = new Error("Request timeout");
        error.message = "The request to the GLM API timed out";
        error.status = 408;
        error.troubleshooting_tips = [
          "Try again with a shorter prompt",
          "Check if the GLM API is experiencing high load",
          "Reduce the complexity of your request"
        ];
        throw error;
      }
      throw fetchError;
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error("GLM API call error:", error);
    if (!error.response_time) {
      error.response_time = `${responseTime}ms`;
    }
    if (!error.troubleshooting_tips) {
      error.troubleshooting_tips = [
        "Check the server logs for more details",
        "Verify all required environment variables are set",
        "Try again later if the issue persists"
      ];
    }
    throw error;
  }
}
__name(workerGlmOutputInternal, "workerGlmOutputInternal");
async function onRequest3(context) {
  const { request, env } = context;
  const startTime = Date.now();
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({
        error: "Method not allowed",
        message: "Only POST method is supported",
        troubleshooting_tips: [
          "Use POST method with JSON body",
          "Include 'prompt' or 'messages' in your request"
        ]
      }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({
        error: "Invalid JSON",
        message: "Request body must be valid JSON",
        troubleshooting_tips: [
          "Ensure Content-Type is application/json",
          "Check JSON syntax for errors"
        ]
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    const prompt = body.prompt || body.messages && body.messages[0] && body.messages[0].content;
    if (!prompt) {
      return new Response(JSON.stringify({
        error: "Missing prompt",
        message: "Request must contain 'prompt' or 'messages' field",
        troubleshooting_tips: [
          "Include 'prompt' field in your request",
          "Or include 'messages' array with user message"
        ]
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    try {
      const result = await workerGlmOutput(prompt, env);
      const responseTime = Date.now() - startTime;
      return new Response(JSON.stringify({
        response: result,
        prompt,
        response_time: `${responseTime}ms`
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "X-Response-Time": `${responseTime}ms`
        }
      });
    } catch (glmError) {
      const responseTime = Date.now() - startTime;
      return new Response(JSON.stringify({
        error: glmError.message || "GLM API error",
        details: glmError.toString(),
        response_time: `${responseTime}ms`,
        troubleshooting_tips: glmError.troubleshooting_tips || [
          "Check the GLM API configuration",
          "Verify API key is valid",
          "Try again later"
        ]
      }), {
        status: glmError.status || 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "X-Response-Time": `${responseTime}ms`
        }
      });
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error("Error in worker-glm request handler:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message,
      response_time: `${responseTime}ms`,
      troubleshooting_tips: [
        "Check server logs for details",
        "Verify all environment variables are set",
        "Try again later"
      ]
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://study-llm.me",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "X-Response-Time": `${responseTime}ms`
      }
    });
  }
}
__name(onRequest3, "onRequest3");
var REQUEST_TIMEOUT;
var MAX_TOKENS;
var TEMPERATURE;
var CACHE_TTL;
var requestCache;
var init_worker_glm = __esm({
  "api/worker-glm.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    REQUEST_TIMEOUT = 25e3;
    MAX_TOKENS = 2e4;
    TEMPERATURE = 0.7;
    CACHE_TTL = 60 * 1e3;
    requestCache = /* @__PURE__ */ new Map();
    __name2(generateCacheKey, "generateCacheKey");
    __name2(workerGlmOutput, "workerGlmOutput");
    __name2(workerGlmOutputWithRetry, "workerGlmOutputWithRetry");
    __name2(workerGlmOutputInternal, "workerGlmOutputInternal");
    __name2(onRequest3, "onRequest");
  }
});
async function onRequestPost2(context) {
  try {
    const { request, env } = context;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body",
        message: e.message
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    if (body.prompt) {
      try {
        const output = await workerGlmOutput(body.prompt, env);
        return new Response(JSON.stringify({
          output
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://study-llm.me",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: "Error generating GLM response",
          message: error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://study-llm.me"
          }
        });
      }
    } else if (body.messages && Array.isArray(body.messages)) {
      try {
        const GLM_KEY = env.GLM_API_KEY || env.DEEPSEEK_API_KEY;
        if (!GLM_KEY) {
          throw new Error("Neither GLM API key nor DeepSeek API key is configured");
        }
        const isStreaming = body.stream === true;
        const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
        if (isStreaming) {
          const glmResponse = await fetch(GLM_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${GLM_KEY}`
            },
            body: JSON.stringify({
              model: "glm-4.5",
              messages: body.messages,
              temperature: 0.7,
              max_tokens: 2e3,
              stream: true
            })
          });
          if (!glmResponse.ok) {
            const errorData = await glmResponse.json().catch(() => ({}));
            throw new Error(errorData.error?.message || errorData.message || `GLM API error: ${glmResponse.status}`);
          }
          return new Response(glmResponse.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Access-Control-Allow-Origin": "https://study-llm.me",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
        } else {
          const glmResponse = await fetch(GLM_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${GLM_KEY}`
            },
            body: JSON.stringify({
              model: "glm-4.5",
              messages: body.messages,
              temperature: 0.7,
              max_tokens: 2e3
            })
          });
          if (!glmResponse.ok) {
            const errorData = await glmResponse.json().catch(() => ({}));
            throw new Error(errorData.error?.message || errorData.message || `GLM API error: ${glmResponse.status}`);
          }
          const result = await glmResponse.json();
          return new Response(JSON.stringify(result), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "https://study-llm.me",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({
          error: "Error calling GLM API",
          message: error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://study-llm.me"
          }
        });
      }
    } else {
      return new Response(JSON.stringify({
        error: "Missing prompt or messages in request body"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me"
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      error: "GLM Server error",
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://study-llm.me"
      }
    });
  }
}
__name(onRequestPost2, "onRequestPost2");
function onRequestOptions2() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://study-llm.me",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store"
    }
  });
}
__name(onRequestOptions2, "onRequestOptions2");
function onRequestGet2() {
  return new Response(JSON.stringify({
    message: "The GLM-4.5 chat API is working. Send POST requests to this endpoint to interact with the AI.",
    example: {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant" },
          { role: "user", content: "Hello, how are you?" }
        ]
      }, null, 2)
    }
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://study-llm.me",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestGet2, "onRequestGet2");
var init_chat_glm = __esm({
  "api/chat-glm.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    init_worker_glm();
    __name2(onRequestPost2, "onRequestPost");
    __name2(onRequestOptions2, "onRequestOptions");
    __name2(onRequestGet2, "onRequestGet");
  }
});
async function handleCountryData(request, env) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "";
  if (!name) {
    return Response.json({ error: "Missing 'name' query param" }, { status: 400 });
  }
  const upstream = new URL("https://api.api-ninjas.com/v1/country");
  upstream.searchParams.set("name", name);
  const cacheKey = new Request(upstream.toString(), { headers: { "X-Api-Key": "omitted" } });
  const cache = caches.default;
  let cached = await cache.match(cacheKey);
  if (cached) return cached;
  const res = await fetch(upstream.toString(), {
    headers: { "X-Api-Key": env.API_NINJAS_KEY }
    // secret from CF
  });
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  if (res.ok) headers.set("Cache-Control", "public, s-maxage=43200");
  const out = new Response(text, { status: res.status, headers });
  if (res.ok) await cache.put(cacheKey, out.clone());
  return out;
}
__name(handleCountryData, "handleCountryData");
async function handleCountryFlag(request, env) {
  const url = new URL(request.url);
  const country = url.searchParams.get("country") || "";
  if (!country) {
    return Response.json({ error: "Missing 'country' query param" }, { status: 400 });
  }
  const upstream = new URL("https://api.api-ninjas.com/v1/countryflag");
  upstream.searchParams.set("country", country);
  const cacheKey = new Request(upstream.toString(), { headers: { "X-Api-Key": "omitted" } });
  const cache = caches.default;
  let cached = await cache.match(cacheKey);
  if (cached) return cached;
  const res = await fetch(upstream.toString(), {
    headers: { "X-Api-Key": env.API_NINJAS_KEY }
    // secret from CF
  });
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  if (res.ok) headers.set("Cache-Control", "public, s-maxage=43200");
  const out = new Response(text, { status: res.status, headers });
  if (res.ok) await cache.put(cacheKey, out.clone());
  return out;
}
__name(handleCountryFlag, "handleCountryFlag");
async function handleAdvice(request, env) {
  const upstream = new URL("https://api.api-ninjas.com/v1/advice");
  const cacheKey = new Request(upstream.toString(), { headers: { "X-Api-Key": "omitted" } });
  const cache = caches.default;
  let cached = await cache.match(cacheKey);
  if (cached) return cached;
  const res = await fetch(upstream.toString(), {
    headers: { "X-Api-Key": env.API_NINJAS_KEY }
    // secret from CF
  });
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  if (res.ok) headers.set("Cache-Control", "public, s-maxage=43200");
  const out = new Response(text, { status: res.status, headers });
  if (res.ok) await cache.put(cacheKey, out.clone());
  return out;
}
__name(handleAdvice, "handleAdvice");
async function handleHoroscope(request, env) {
  const url = new URL(request.url);
  const zodiac = url.searchParams.get("zodiac") || "aries";
  const upstream = new URL("https://api.api-ninjas.com/v1/horoscope");
  upstream.searchParams.set("zodiac", zodiac);
  const cacheKey = new Request(upstream.toString(), { headers: { "X-Api-Key": "omitted" } });
  const cache = caches.default;
  let cached = await cache.match(cacheKey);
  if (cached) return cached;
  const res = await fetch(upstream.toString(), {
    headers: { "X-Api-Key": env.API_NINJAS_KEY }
    // secret from CF
  });
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  if (res.ok) headers.set("Cache-Control", "public, s-maxage=43200");
  const out = new Response(text, { status: res.status, headers });
  if (res.ok) await cache.put(cacheKey, out.clone());
  return out;
}
__name(handleHoroscope, "handleHoroscope");
var onRequestOptions3;
var onRequestGet3;
var init_ninjas = __esm({
  "api/ninjas.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    onRequestOptions3 = /* @__PURE__ */ __name2(async ({ request }) => {
      const headers = {
        "Access-Control-Allow-Origin": "*",
        // tighten in production
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };
      return new Response(null, { headers });
    }, "onRequestOptions");
    onRequestGet3 = /* @__PURE__ */ __name2(async ({ request, env }) => {
      const url = new URL(request.url);
      const endpoint = url.searchParams.get("endpoint") || "country";
      if (endpoint === "countryflag") {
        return handleCountryFlag(request, env);
      }
      if (endpoint === "advice") {
        return handleAdvice(request, env);
      }
      if (endpoint === "horoscope") {
        return handleHoroscope(request, env);
      }
      return handleCountryData(request, env);
    }, "onRequestGet");
    __name2(handleCountryData, "handleCountryData");
    __name2(handleCountryFlag, "handleCountryFlag");
    __name2(handleAdvice, "handleAdvice");
    __name2(handleHoroscope, "handleHoroscope");
  }
});
async function onRequestPost3(context) {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  const GROUP_ID = context.env.MINIMAX_GROUP_ID;
  const API_KEY = context.env.MINIMAX_API_KEY;
  if (!GROUP_ID || !API_KEY) {
    console.error("Missing required MiniMax API credentials");
    return new Response(JSON.stringify({
      error: "Server configuration error: Missing API credentials"
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
  try {
    const requestData = await context.request.json();
    if (!requestData.text) {
      return new Response(JSON.stringify({
        error: "Missing required 'text' field"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const voiceId = getMiniMaxVoiceId(requestData.voice);
    console.log(`Mapping voice '${requestData.voice}' to MiniMax voice_id: '${voiceId}'`);
    const payload = {
      model: requestData.model || "speech-02-turbo",
      // Use model from request or default to turbo
      text: requestData.text,
      stream: false,
      language_boost: "auto",
      voice_setting: {
        voice_id: voiceId,
        speed: Number(requestData.speed || 1),
        vol: Number(requestData.volume || 1),
        pitch: Math.round(Number(requestData.pitch || 0))
      },
      audio_setting: {
        sample_rate: 32e3,
        bitrate: 128e3,
        format: "mp3"
      }
    };
    if (requestData.emotion) {
      console.log(`Applying emotion profile: "${requestData.emotion}"`);
      const emotionProfiles = {
        // Sad emotions - slower, lower pitch, softer
        "\u60B2\u4F24": { speedMod: 0.9, pitchMod: -1, volMod: 0.85 },
        "\u54C0\u4F24": { speedMod: 0.85, pitchMod: -1, volMod: 0.8 },
        "\u6CAE\u4E27": { speedMod: 0.9, pitchMod: -1, volMod: 0.9 },
        "\u4F24\u611F": { speedMod: 0.95, pitchMod: -1, volMod: 0.9 },
        "\u5FE7\u90C1": { speedMod: 0.9, pitchMod: -1, volMod: 0.85 },
        "\u60B2\u75DB": { speedMod: 0.8, pitchMod: -1, volMod: 0.8 },
        "\u60B2\u54C0": { speedMod: 0.85, pitchMod: -1, volMod: 0.85 },
        // Happy emotions - faster, higher pitch, louder
        "\u6B22\u5FEB": { speedMod: 1.15, pitchMod: 1, volMod: 1.15 },
        "\u559C\u60A6": { speedMod: 1.1, pitchMod: 1, volMod: 1.1 },
        "\u5174\u594B": { speedMod: 1.2, pitchMod: 1, volMod: 1.2 },
        "\u70ED\u60C5": { speedMod: 1.15, pitchMod: 1, volMod: 1.15 },
        "\u6109\u5FEB": { speedMod: 1.1, pitchMod: 1, volMod: 1.05 },
        "\u5F00\u5FC3": { speedMod: 1.1, pitchMod: 1, volMod: 1.1 },
        // Calm emotions - normal speed, normal to low pitch, normal volume
        "\u5E73\u9759": { speedMod: 1, pitchMod: 0, volMod: 1 },
        "\u6C89\u601D": { speedMod: 0.95, pitchMod: 0, volMod: 0.95 },
        "\u51B7\u9759": { speedMod: 0.97, pitchMod: 0, volMod: 0.97 },
        "\u6E29\u548C": { speedMod: 1, pitchMod: 0, volMod: 1 },
        // Serious emotions - slower, lower pitch, normal volume
        "\u4E25\u8083": { speedMod: 0.95, pitchMod: -1, volMod: 1 },
        "\u5E84\u91CD": { speedMod: 0.9, pitchMod: -1, volMod: 1.05 },
        "\u90D1\u91CD": { speedMod: 0.95, pitchMod: -1, volMod: 1.05 },
        // Excited emotions - faster, higher pitch, louder
        "\u6FC0\u52A8": { speedMod: 1.15, pitchMod: 1, volMod: 1.2 },
        "\u632F\u594B": { speedMod: 1.1, pitchMod: 1, volMod: 1.15 },
        "\u6FC0\u60C5": { speedMod: 1.15, pitchMod: 1, volMod: 1.2 },
        // Poetic - slower, melodic
        "\u8BD7\u610F": { speedMod: 0.85, pitchMod: 0, volMod: 0.95 },
        "\u6292\u60C5": { speedMod: 0.9, pitchMod: 0, volMod: 0.95 },
        "\u6587\u5B66\u6027": { speedMod: 0.9, pitchMod: 0, volMod: 1 }
      };
      const emotionKey = Object.keys(emotionProfiles).find(
        (key) => requestData.emotion.includes(key)
      );
      if (emotionKey) {
        const profile = emotionProfiles[emotionKey];
        console.log(`Found matching emotion profile: ${emotionKey}`);
        if (requestData.speed === 1) {
          payload.voice_setting.speed = Math.max(0.5, Math.min(2, payload.voice_setting.speed * profile.speedMod));
        }
        if (requestData.pitch === 0) {
          payload.voice_setting.pitch = Math.round(Math.max(-1, Math.min(1, payload.voice_setting.pitch + profile.pitchMod)));
        }
        if (requestData.volume === 1) {
          payload.voice_setting.vol = Math.max(0.1, Math.min(2, payload.voice_setting.vol * profile.volMod));
        }
        console.log(`Applied emotion profile adjustments: speed=${payload.voice_setting.speed}, pitch=${payload.voice_setting.pitch}, vol=${payload.voice_setting.vol}`);
      }
      payload.emotion = requestData.emotion;
    }
    if (requestData.emphasis && Array.isArray(requestData.emphasis) && requestData.emphasis.length > 0) {
      console.log(`Applying emphasis on ${requestData.emphasis.length} phrases: ${requestData.emphasis.join(", ")}`);
      payload.prosody = {
        emphasis: requestData.emphasis
      };
      if (requestData.pause_duration) {
        payload.prosody.pause_duration = Number(requestData.pause_duration);
        console.log(`Setting custom pause duration: ${payload.prosody.pause_duration}`);
      } else if (requestData.text.length > 100) {
        const textType = detectTextType(requestData.text);
        if (textType === "poetry") {
          payload.prosody.pause_duration = 1.5;
        } else if (textType === "dialogue") {
          payload.prosody.pause_duration = 1.3;
        } else {
          payload.prosody.pause_duration = 1.2;
        }
        console.log(`Applied automatic pause duration ${payload.prosody.pause_duration} based on text type: ${textType}`);
      }
    }
    if (requestData.sentence_analysis && Array.isArray(requestData.sentence_analysis) && requestData.sentence_analysis.length > 0) {
      console.log(`Applying sentence-level analysis for ${requestData.sentence_analysis.length} sentences`);
      const hasMultipleEmotions = requestData.sentence_analysis.some((sentence, index, array) => {
        if (index === 0) return false;
        return sentence.emotion !== array[0].emotion;
      });
      if (hasMultipleEmotions) {
        console.log("\u68C0\u6D4B\u5230\u591A\u79CD\u60C5\u7EEA\u8868\u8FBE\uFF0C\u5E94\u7528\u53E5\u5B50\u7EA7\u60C5\u611F\u5904\u7406");
        try {
          const sentences = requestData.sentence_analysis.map((sentence) => ({
            text: sentence.text,
            params: {
              speed: Math.max(0.5, Math.min(2, Number(sentence.speed) || 1)),
              pitch: Math.round(Math.max(-1, Math.min(1, Number(sentence.pitch) || 0))),
              volume: Math.max(0.1, Math.min(2, Number(sentence.volume) || 1)),
              emotion: sentence.emotion || requestData.emotion
            }
          }));
          payload.sentence_segments = sentences.map((s) => s.text);
          console.log("\u4E0D\u4F7F\u7528SSML\u6807\u8BB0\uFF0C\u4EC5\u901A\u8FC7API\u5143\u6570\u636E\u4F20\u9012\u60C5\u611F\u53C2\u6570");
          payload.use_sentence_level_settings = true;
        } catch (error) {
          console.error("\u53E5\u5B50\u7EA7\u5904\u7406\u9519\u8BEF\uFF1A", error);
        }
      }
      payload.sentence_settings = requestData.sentence_analysis.map((sentence) => ({
        text: sentence.text,
        voice_setting: {
          speed: Number(sentence.speed || payload.voice_setting.speed),
          pitch: Math.round(Number(sentence.pitch || payload.voice_setting.pitch)),
          vol: Number(sentence.volume || payload.voice_setting.vol),
          emotion: sentence.emotion || requestData.emotion
        }
      }));
      console.log(`\u6DFB\u52A0\u4E86${payload.sentence_settings.length}\u4E2A\u53E5\u5B50\u7EA7\u8BBE\u7F6E`);
    }
    const finalJSON = JSON.stringify(payload);
    console.log(`Final request payload: ${finalJSON}`);
    console.log(`Sending TTS request to MiniMax API for text: "${payload.text.substring(0, 30)}${payload.text.length > 30 ? "..." : ""}"`);
    const miniMaxUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=${GROUP_ID}`;
    const response = await fetch(miniMaxUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: finalJSON
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MiniMax API error (${response.status}): ${errorText}`);
      return new Response(JSON.stringify({
        error: `MiniMax API returned ${response.status}`,
        details: errorText
      }), {
        status: response.status,
        headers: corsHeaders
      });
    }
    const contentType = response.headers.get("Content-Type") || "";
    console.log(`MiniMax API responded with Content-Type: ${contentType}`);
    if (contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      console.log(`Received JSON response:`, jsonResponse);
      if (jsonResponse.data && jsonResponse.data.audio) {
        const audioData = jsonResponse.data.audio;
        try {
          let bytes;
          if (/^[0-9a-fA-F]+$/.test(audioData)) {
            bytes = new Uint8Array(audioData.length / 2);
            for (let i = 0; i < audioData.length; i += 2) {
              bytes[i / 2] = parseInt(audioData.substring(i, i + 2), 16);
            }
            console.log(`Converted hex audio data (${bytes.byteLength} bytes)`);
          } else {
            const binaryString = atob(audioData);
            bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            console.log(`Converted base64 audio data (${bytes.byteLength} bytes)`);
          }
          return new Response(bytes, {
            headers: {
              "Content-Type": "audio/mp3",
              "Cache-Control": "public, max-age=86400",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
        } catch (error) {
          console.error(`Error processing audio data: ${error.message}`);
          return new Response(JSON.stringify({
            error: "Failed to process audio data",
            original_response: jsonResponse
          }), {
            headers: corsHeaders
          });
        }
      } else if (jsonResponse.audio_base64) {
        const binaryString = atob(jsonResponse.audio_base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        console.log(`Returning audio data (${bytes.length} bytes)`);
        return new Response(bytes, {
          headers: {
            "Content-Type": "audio/mp3",
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      } else if (jsonResponse.audio_file || jsonResponse.data && jsonResponse.data.audio_file) {
        const audioFileUrl = jsonResponse.audio_file || jsonResponse.data && jsonResponse.data.audio_file;
        if (audioFileUrl) {
          console.log(`Audio file URL received: ${audioFileUrl}`);
          const audioFileResponse = await fetch(audioFileUrl);
          const audioData = await audioFileResponse.arrayBuffer();
          console.log(`Returning audio file data (${audioData.byteLength} bytes)`);
          return new Response(audioData, {
            headers: {
              "Content-Type": "audio/mp3",
              "Cache-Control": "public, max-age=86400",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
          });
        }
      }
      return new Response(JSON.stringify(jsonResponse), {
        headers: corsHeaders
      });
    } else {
      const audioData = await response.arrayBuffer();
      if (audioData.byteLength === 0) {
        return new Response(JSON.stringify({
          error: "Received empty audio data from MiniMax API",
          tip: "Check API credentials and request parameters"
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
      console.log(`Returning binary audio data (${audioData.byteLength} bytes)`);
      return new Response(audioData, {
        headers: {
          "Content-Type": "audio/mp3",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
  } catch (error) {
    console.error(`Error processing TTS request: ${error.message}`);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
__name(onRequestPost3, "onRequestPost3");
async function onRequestOptions4() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  });
}
__name(onRequestOptions4, "onRequestOptions4");
function onRequestGet4() {
  return new Response(JSON.stringify({
    message: "This is the TTS API endpoint. Please make a POST request with text data to convert to speech.",
    example: {
      "text": "\u4EBA\u5DE5\u667A\u80FD\u4E0D\u662F\u8981\u66FF\u4EE3\u4EBA\u7C7B\uFF0C\u800C\u662F\u8981\u589E\u5F3A\u4EBA\u7C7B\u7684\u80FD\u529B\u3002",
      "voice": "Chinese (Mandarin)_Elite_Young",
      "model": "speech-02-turbo",
      "speed": 1,
      "pitch": 0,
      "volume": 1
    },
    emotion_feature: {
      "description": "Optional AI emotion sensing feature that analyzes text sentiment",
      "parameters": {
        "emotion": "Detected emotion keyword (e.g., 'serene_melancholy', 'excited', 'calm')",
        "emphasis": ["Array of phrases to emphasize"],
        "pause_duration": "Multiplier for pause length between phrases (e.g., 1.2)"
      }
    },
    supported_voices: {
      "Chinese (Mandarin)_Elite_Young": "\u7CBE\u82F1\u9752\u5E74\u97F3\u8272",
      "Chinese (Mandarin)_College_Student": "\u9752\u5E74\u5927\u5B66\u751F\u97F3\u8272",
      "Chinese (Mandarin)_Young_Girl": "\u5C11\u5973\u97F3\u8272",
      "Chinese (Mandarin)_Male_Announcer": "\u96C4\u6D51\u64AD\u97F3\u7537\u58EB",
      "Chinese (Mandarin)_Lyrical_Voice": "\u6292\u60C5\u7537\u58F0",
      "Chinese (Mandarin)_Pure-hearted_Boy": "\u7EAF\u771F\u5C11\u5E74\u7537\u751F",
      "Chinese (Mandarin)_Warm_Girl": "\u6E29\u6696\u5C11\u5E74\u5973\u751F",
      "English_Trustworthy_Man": "Trustworthy Man",
      "English_Graceful_Lady": "Graceful Lady",
      "English_UpsetGirl": "Upset Girl",
      "English_Wiselady": "Wise Lady",
      "English_Gentle_Voiced_Man": "Gentle-voiced Man",
      "Cantonese_Professional_Host_Female": "\u4E13\u4E1A\u5973\u4E3B\u6301",
      "Cantonese_Professional_Host_Male": "\u4E13\u4E1A\u7537\u4E3B\u6301"
    },
    models: {
      "speech-02-turbo": "Recommended: Fast, high-quality speech synthesis",
      "speech-02-hd": "Premium quality with better emotional expression (higher latency)"
    },
    api_endpoint: "POST /api/tts",
    documentation: "Using MiniMax T2A v2 API"
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestGet4, "onRequestGet4");
function getMiniMaxVoiceId(frontendVoice) {
  if (!frontendVoice) return "male-qn-jingying";
  const voiceMap = {
    // Chinese Mandarin voices
    "male-qn-qingse": "male-qn-qingse",
    // 青涩青年音色
    "male-qn-jingying": "male-qn-jingying",
    // 精英青年音色
    "male-qn-badao": "male-qn-badao",
    // 霸道青年音色
    "female-shaonv": "female-shaonv",
    // 少女音色
    "female-yujie": "female-yujie",
    // 御姐音色
    "female-chengshu": "female-chengshu",
    // 成熟女性音色
    "female-tianmei": "female-tianmei",
    // 甜美女性音色
    "presenter_male": "presenter_male",
    // 男性主持人
    "presenter_female": "presenter_female",
    // 女性主持人
    "audiobook_male_1": "audiobook_male_1",
    // 男性有声书1
    "audiobook_male_2": "audiobook_male_2",
    // 男性有声书2
    "audiobook_female_1": "audiobook_female_1",
    // 女性有声书1
    "audiobook_female_2": "audiobook_female_2",
    // 女性有声书2
    "clever_boy": "clever_boy",
    // 聪明男童
    "cute_boy": "cute_boy",
    // 可爱男童
    "lovely_girl": "lovely_girl",
    // 萌萌女童
    "junlang_nanyou": "junlang_nanyou",
    // 俊朗男友
    "chunzhen_xuedi": "chunzhen_xuedi",
    // 纯真学弟
    "qiaopi_mengmei": "qiaopi_mengmei",
    // 俏皮萌妹
    // English voices
    "Santa_Claus": "Santa_Claus",
    // Santa Claus
    "Grinch": "Grinch",
    // Grinch
    "Rudolph": "Rudolph",
    // Rudolph
    "Arnold": "Arnold",
    // Arnold
    "Charming_Santa": "Charming_Santa",
    // Charming Santa
    "Charming_Lady": "Charming_Lady",
    // Charming Lady
    "Sweet_Girl": "Sweet_Girl",
    // Sweet Girl
    "Cute_Elf": "Cute_Elf",
    // Cute Elf
    "Attractive_Girl": "Attractive_Girl",
    // Attractive Girl
    "Serene_Woman": "Serene_Woman",
    // Serene Woman
    // Chinese Mandarin voices (alternative labeling)
    "Chinese (Mandarin)_News_Anchor": "Chinese (Mandarin)_News_Anchor",
    // 新闻女声
    "Chinese (Mandarin)_Refreshing_Young_Man": "Chinese (Mandarin)_Refreshing_Young_Man",
    // 舒朗男声
    "Chinese (Mandarin)_Unrestrained_Young_Man": "Chinese (Mandarin)_Unrestrained_Young_Man",
    // 不羁青年
    "Chinese (Mandarin)_Kind-hearted_Antie": "Chinese (Mandarin)_Kind-hearted_Antie",
    // 热心大婶
    "Chinese (Mandarin)_Gentleman": "Chinese (Mandarin)_Gentleman",
    // 温润男声
    "Chinese (Mandarin)_Male_Announcer": "Chinese (Mandarin)_Male_Announcer",
    // 播报男声
    "Chinese (Mandarin)_Sweet_Lady": "Chinese (Mandarin)_Sweet_Lady",
    // 甜美女声
    "Chinese (Mandarin)_Wise_Women": "Chinese (Mandarin)_Wise_Women",
    // 阅历姐姐
    "Chinese (Mandarin)_Gentle_Youth": "Chinese (Mandarin)_Gentle_Youth",
    // 温润青年
    "Chinese (Mandarin)_Warm_Girl": "Chinese (Mandarin)_Warm_Girl",
    // 温暖少女
    "Chinese (Mandarin)_Kind-hearted_Elder": "Chinese (Mandarin)_Kind-hearted_Elder",
    // 花甲奶奶
    "Chinese (Mandarin)_Radio_Host": "Chinese (Mandarin)_Radio_Host",
    // 电台男主播
    "Chinese (Mandarin)_Lyrical_Voice": "Chinese (Mandarin)_Lyrical_Voice",
    // 抒情男声
    "Chinese (Mandarin)_Straightforward_Boy": "Chinese (Mandarin)_Straightforward_Boy",
    // 率真弟弟
    "Chinese (Mandarin)_Sincere_Adult": "Chinese (Mandarin)_Sincere_Adult",
    // 真诚青年
    "Chinese (Mandarin)_Gentle_Senior": "Chinese (Mandarin)_Gentle_Senior",
    // 温柔学姐
    "Chinese (Mandarin)_Stubborn_Friend": "Chinese (Mandarin)_Stubborn_Friend",
    // 嘴硬竹马
    "Chinese (Mandarin)_Crisp_Girl": "Chinese (Mandarin)_Crisp_Girl",
    // 清脆少女
    "Chinese (Mandarin)_Pure-hearted_Boy": "Chinese (Mandarin)_Pure-hearted_Boy",
    // 清澈邻家弟弟
    // Cantonese voices
    "Cantonese_ProfessionalHost\uFF08F)": "Cantonese_ProfessionalHost\uFF08F)",
    // 专业女主持
    "Cantonese_ProfessionalHost\uFF08M)": "Cantonese_ProfessionalHost\uFF08M)",
    // 专业男主持
    "Cantonese_PlayfulMan": "Cantonese_PlayfulMan",
    // 活泼男声
    "Cantonese_CuteGirl": "Cantonese_CuteGirl",
    // 可爱女孩
    // English voices (alternative labeling)
    "English_Trustworthy_Man": "English_Trustworthy_Man",
    // Trustworthy Man
    "English_Graceful_Lady": "English_Graceful_Lady",
    // Graceful Lady
    "English_Aussie_Bloke": "English_Aussie_Bloke",
    // Aussie Bloke
    "English_Gentle-voiced_man": "English_Gentle-voiced_man",
    // Gentle-voiced man
    // Backward compatibility with old naming
    "Chinese (Mandarin)_Elite_Young": "male-qn-jingying",
    "Chinese (Mandarin)_College_Student": "male-qn-daxuesheng",
    "Chinese (Mandarin)_Young_Girl": "female-shaonv",
    "Chinese (Mandarin)_Mature_Woman": "female-chengshu",
    "Chinese (Mandarin)_Sweet_Woman": "female-tianmei",
    "Chinese (Mandarin)_Male_Presenter": "presenter_male",
    "Chinese (Mandarin)_Female_Presenter": "presenter_female",
    "Chinese (Mandarin)_Cute_Boy": "cute_boy",
    "Chinese (Mandarin)_Lovely_Girl": "lovely_girl",
    "Cantonese_Professional_Host_Female": "Cantonese_ProfessionalHost\uFF08F)",
    "Cantonese_Professional_Host_Male": "Cantonese_ProfessionalHost\uFF08M)",
    "English_Diligent_Man": "English_Diligent_Man",
    "English_Gentle_Voiced_Man": "English_Gentle-voiced_man",
    "English_UpsetGirl": "English_UpsetGirl",
    "English_Wiselady": "English_Wiselady"
  };
  return voiceMap[frontendVoice] || "male-qn-jingying";
}
__name(getMiniMaxVoiceId, "getMiniMaxVoiceId");
function detectTextType(text) {
  const poetryPatterns = [
    /[，。！？；][，。！？；]/,
    // Multiple punctuation in sequence (common in Chinese poetry)
    /[\n\r]{2,}/,
    // Multiple line breaks
    /[，。][，。]/
    // Multiple punctuation in sequence
  ];
  const dialoguePatterns = [
    /[""].*?[""]/,
    // Quoted speech
    /[""]/,
    // Quotation marks
    /[：].*?[。？！]/
    // Colon followed by statement
  ];
  const sentenceSplitPatterns = [
    /[。！？；]/
    // Chinese sentence ending punctuation
  ];
  for (const pattern of poetryPatterns) {
    if (pattern.test(text)) {
      return "poetry";
    }
  }
  for (const pattern of dialoguePatterns) {
    if (pattern.test(text)) {
      return "dialogue";
    }
  }
  return "prose";
}
__name(detectTextType, "detectTextType");
var init_tts = __esm({
  "api/tts.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequestPost3, "onRequestPost");
    __name2(onRequestOptions4, "onRequestOptions");
    __name2(onRequestGet4, "onRequestGet");
    __name2(getMiniMaxVoiceId, "getMiniMaxVoiceId");
    __name2(detectTextType, "detectTextType");
  }
});
async function onRequestPost4(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  const GROUP_ID = context.env.MINIMAX_GROUP_ID;
  const API_KEY = context.env.MINIMAX_API_KEY;
  console.log("MINIMAX_GROUP_ID exists:", !!GROUP_ID);
  console.log("MINIMAX_API_KEY exists:", !!API_KEY);
  if (!GROUP_ID || !API_KEY) {
    console.error("Missing required MiniMax API credentials");
    return new Response(JSON.stringify({
      error: "Server configuration error: Missing API credentials"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    const requestData = await context.request.json();
    console.log("Request data received:", JSON.stringify(requestData).substring(0, 200) + "...");
    if (!requestData.dialog || !Array.isArray(requestData.dialog) || requestData.dialog.length === 0) {
      return new Response(JSON.stringify({
        error: "Missing or invalid 'dialog' field. Expected an array of roles with lines."
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    if (!requestData.roleVoices || typeof requestData.roleVoices !== "object") {
      return new Response(JSON.stringify({
        error: "Missing or invalid 'roleVoices' field. Expected an object mapping roles to voices."
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("\u521B\u5EFA\u89D2\u8272\u540D\u5230\u89D2\u8272\u5BF9\u8C61\u7684\u6620\u5C04...");
    const roleMap = {};
    requestData.dialog.forEach((role) => {
      roleMap[role.name] = role;
    });
    if (!requestData.original_sequence || !Array.isArray(requestData.original_sequence)) {
      console.error("\u7F3A\u5C11\u987A\u5E8F\u4FE1\u606F\uFF0C\u65E0\u6CD5\u786E\u5B9A\u5BF9\u8BDD\u987A\u5E8F");
      return new Response(JSON.stringify({
        error: "Missing sequence information. Cannot determine dialog order."
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const sortedSequence = [...requestData.original_sequence].sort((a, b) => {
      return a.sequence_position - b.sequence_position;
    });
    console.log(`\u6309\u987A\u5E8F\u6392\u5217\u7684\u5BF9\u8BDD\u5E8F\u5217 (${sortedSequence.length} \u884C):`);
    sortedSequence.forEach((seq, i) => {
      console.log(`${i + 1}. \u4F4D\u7F6E ${seq.sequence_position}: ${seq.role} \u884C ${seq.line_index}`);
    });
    const audioSegments = [];
    for (let i = 0; i < sortedSequence.length; i++) {
      const seq = sortedSequence[i];
      const roleName = seq.role;
      const lineIndex = seq.line_index;
      const role = roleMap[roleName];
      if (!role) {
        console.warn(`\u627E\u4E0D\u5230\u89D2\u8272 "${roleName}"\uFF0C\u8DF3\u8FC7\u6B64\u884C`);
        continue;
      }
      const line = role.lines[lineIndex];
      if (!line) {
        console.warn(`\u627E\u4E0D\u5230\u89D2\u8272 "${roleName}" \u7684\u7B2C ${lineIndex} \u884C\u53F0\u8BCD\uFF0C\u8DF3\u8FC7\u6B64\u884C`);
        continue;
      }
      const voiceId = getMiniMaxVoiceId2(requestData.roleVoices[roleName]);
      let text;
      if (requestData.language_preference === "chinese") {
        text = line.chinese?.trim() || line.english?.trim();
        console.log(`\u4F7F\u7528\u4E2D\u6587\u6587\u672C: "${roleName}" (\u5982\u679C\u9700\u8981\u4F1A\u56DE\u9000\u5230\u82F1\u6587)`);
      } else if (requestData.language_preference === "english") {
        text = line.english?.trim() || line.chinese?.trim();
        console.log(`\u4F7F\u7528\u82F1\u6587\u6587\u672C: "${roleName}" (\u5982\u679C\u9700\u8981\u4F1A\u56DE\u9000\u5230\u4E2D\u6587)`);
      } else {
        text = line.english?.trim() || line.chinese?.trim();
        console.log(`\u672A\u6307\u5B9A\u8BED\u8A00\u504F\u597D: "${roleName}"\uFF0C\u9ED8\u8BA4\u4F7F\u7528\u82F1\u6587`);
      }
      if (!text) {
        console.log(`[${i + 1}/${sortedSequence.length}] \u8DF3\u8FC7\u7A7A\u884C: ${roleName}`);
        continue;
      }
      console.log(`[${i + 1}/${sortedSequence.length}] \u5904\u7406: ${roleName} \u8BF4 "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`);
      console.log(`\u4F7F\u7528\u8BED\u97F3ID: ${voiceId}`);
      const payload = {
        model: requestData.model || "speech-02-turbo",
        text,
        stream: false,
        language_boost: "auto",
        voice_setting: {
          voice_id: voiceId,
          speed: 1,
          // 固定速度
          vol: 1,
          // 固定音量
          pitch: 0
          // 固定音调
        },
        audio_setting: {
          sample_rate: 32e3,
          bitrate: 128e3,
          format: "mp3"
        }
      };
      payload.text = payload.text + "\uFF0C";
      const apiUrl = `https://api.minimax.chat/v1/t2a_v2?GroupId=${GROUP_ID}`;
      try {
        console.log(`\u53D1\u9001\u8BF7\u6C42\u5230MiniMax API\uFF0C\u89D2\u8272: '${roleName}'\uFF0C\u987A\u5E8F: ${i + 1}`);
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`MiniMax API\u9519\u8BEF: ${roleName}, ${response.status}`, errorText);
          throw new Error(`MiniMax API\u9519\u8BEF: ${response.status}`);
        }
        let audioBytes;
        const contentType = response.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
          const responseData = await response.json();
          if (responseData.data && responseData.data.audio) {
            const audioData = responseData.data.audio;
            if (/^[0-9a-fA-F]+$/.test(audioData)) {
              audioBytes = new Uint8Array(audioData.length / 2);
              for (let j = 0; j < audioData.length; j += 2) {
                audioBytes[j / 2] = parseInt(audioData.substring(j, j + 2), 16);
              }
            } else {
              const binaryString = atob(audioData);
              audioBytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                audioBytes[j] = binaryString.charCodeAt(j);
              }
            }
          } else if (responseData.audio_base64) {
            const base64 = responseData.audio_base64.replace(/^data:audio\/\w+;base64,/, "");
            const binary = atob(base64);
            audioBytes = new Uint8Array(binary.length);
            for (let j = 0; j < binary.length; j++) {
              audioBytes[j] = binary.charCodeAt(j);
            }
          } else if (responseData.audio_file || responseData.data && responseData.data.audio_file) {
            const audioFileUrl = responseData.audio_file || responseData.data && responseData.data.audio_file;
            if (audioFileUrl) {
              const audioFileResponse = await fetch(audioFileUrl);
              const audioBuffer = await audioFileResponse.arrayBuffer();
              audioBytes = new Uint8Array(audioBuffer);
            }
          }
        } else {
          const audioBuffer = await response.arrayBuffer();
          audioBytes = new Uint8Array(audioBuffer);
        }
        if (!audioBytes || audioBytes.length === 0) {
          throw new Error(`\u6CA1\u6709\u8FD4\u56DE\u97F3\u9891\u6570\u636E: "${text.substring(0, 30)}..."`);
        }
        audioSegments.push({
          originalIndex: i,
          // 使用循环索引作为原始位置
          audio: audioBytes,
          role: roleName,
          text: text.substring(0, 30) + (text.length > 30 ? "..." : "")
        });
        console.log(`[${i + 1}/${sortedSequence.length}] \u6210\u529F\u751F\u6210\u97F3\u9891: ${roleName}, ${audioBytes.length} \u5B57\u8282`);
      } catch (error) {
        console.error(`[${i + 1}/${sortedSequence.length}] \u5904\u7406\u9519\u8BEF: ${roleName}:`, error);
      }
    }
    if (audioSegments.length === 0) {
      return new Response(JSON.stringify({
        error: "\u6CA1\u6709\u751F\u6210\u4EFB\u4F55\u97F3\u9891\u3002\u8BF7\u68C0\u67E5\u5BF9\u8BDD\u6587\u672C\u662F\u5426\u6709\u6548\u3002"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    audioSegments.sort((a, b) => a.originalIndex - b.originalIndex);
    console.log("\u6700\u7EC8\u97F3\u9891\u5408\u5E76\u987A\u5E8F:");
    audioSegments.forEach((segment, i) => {
      console.log(`  ${i + 1}. ${segment.role}: "${segment.text}" (\u539F\u59CB\u4F4D\u7F6E: ${segment.originalIndex})`);
    });
    let totalLength = 0;
    audioSegments.forEach((segment) => {
      totalLength += segment.audio.length;
    });
    const mergedAudio = new Uint8Array(totalLength);
    let offset = 0;
    audioSegments.forEach((segment) => {
      mergedAudio.set(segment.audio, offset);
      offset += segment.audio.length;
    });
    console.log(`\u6700\u7EC8\u5408\u5E76\u97F3\u9891\u957F\u5EA6: ${mergedAudio.length} \u5B57\u8282`);
    return new Response(mergedAudio, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mp3",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (error) {
    console.error("TTS\u5BF9\u8BDD\u9519\u8BEF:", error);
    console.error("\u9519\u8BEF\u6808:", error.stack);
    return new Response(JSON.stringify({
      error: error.message || "\u5904\u7406\u5BF9\u8BDD\u65F6\u53D1\u751F\u9519\u8BEF",
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
}
__name(onRequestPost4, "onRequestPost4");
async function onRequestOptions5() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  });
}
__name(onRequestOptions5, "onRequestOptions5");
function getMiniMaxVoiceId2(frontendVoice) {
  if (!frontendVoice) return "male-qn-jingying";
  const voiceMap = {
    // Chinese Mandarin voices
    "male-qn-qingse": "male-qn-qingse",
    // 青涩青年音色
    "male-qn-jingying": "male-qn-jingying",
    // 精英青年音色
    "male-qn-badao": "male-qn-badao",
    // 霸道青年音色
    "female-shaonv": "female-shaonv",
    // 少女音色
    "female-yujie": "female-yujie",
    // 御姐音色
    "female-chengshu": "female-chengshu",
    // 成熟女性音色
    "female-tianmei": "female-tianmei",
    // 甜美女性音色
    "presenter_male": "presenter_male",
    // 男性主持人
    "presenter_female": "presenter_female",
    // 女性主持人
    "audiobook_male_1": "audiobook_male_1",
    // 男性有声书1
    "audiobook_male_2": "audiobook_male_2",
    // 男性有声书2
    "audiobook_female_1": "audiobook_female_1",
    // 女性有声书1
    "audiobook_female_2": "audiobook_female_2",
    // 女性有声书2
    "clever_boy": "clever_boy",
    // 聪明男童
    "cute_boy": "cute_boy",
    // 可爱男童
    "lovely_girl": "lovely_girl",
    // 萌萌女童
    "junlang_nanyou": "junlang_nanyou",
    // 俊朗男友
    "chunzhen_xuedi": "chunzhen_xuedi",
    // 纯真学弟
    "qiaopi_mengmei": "qiaopi_mengmei",
    // 俏皮萌妹
    // English voices
    "Santa_Claus": "Santa_Claus",
    // Santa Claus
    "Grinch": "Grinch",
    // Grinch
    "Rudolph": "Rudolph",
    // Rudolph
    "Arnold": "Arnold",
    // Arnold
    "Charming_Santa": "Charming_Santa",
    // Charming Santa
    "Charming_Lady": "Charming_Lady",
    // Charming Lady
    "Sweet_Girl": "Sweet_Girl",
    // Sweet Girl
    "Cute_Elf": "Cute_Elf",
    // Cute Elf
    "Attractive_Girl": "Attractive_Girl",
    // Attractive Girl
    "Serene_Woman": "Serene_Woman",
    // Serene Woman
    // Chinese Mandarin voices (alternative labeling)
    "Chinese (Mandarin)_News_Anchor": "Chinese (Mandarin)_News_Anchor",
    // 新闻女声
    "Chinese (Mandarin)_Refreshing_Young_Man": "Chinese (Mandarin)_Refreshing_Young_Man",
    // 舒朗男声
    "Chinese (Mandarin)_Unrestrained_Young_Man": "Chinese (Mandarin)_Unrestrained_Young_Man",
    // 不羁青年
    "Chinese (Mandarin)_Kind-hearted_Antie": "Chinese (Mandarin)_Kind-hearted_Antie",
    // 热心大婶
    "Chinese (Mandarin)_Gentleman": "Chinese (Mandarin)_Gentleman",
    // 温润男声
    "Chinese (Mandarin)_Male_Announcer": "Chinese (Mandarin)_Male_Announcer",
    // 播报男声
    "Chinese (Mandarin)_Sweet_Lady": "Chinese (Mandarin)_Sweet_Lady",
    // 甜美女声
    "Chinese (Mandarin)_Wise_Women": "Chinese (Mandarin)_Wise_Women",
    // 阅历姐姐
    "Chinese (Mandarin)_Gentle_Youth": "Chinese (Mandarin)_Gentle_Youth",
    // 温润青年
    "Chinese (Mandarin)_Warm_Girl": "Chinese (Mandarin)_Warm_Girl",
    // 温暖少女
    "Chinese (Mandarin)_Kind-hearted_Elder": "Chinese (Mandarin)_Kind-hearted_Elder",
    // 花甲奶奶
    "Chinese (Mandarin)_Radio_Host": "Chinese (Mandarin)_Radio_Host",
    // 电台男主播
    "Chinese (Mandarin)_Lyrical_Voice": "Chinese (Mandarin)_Lyrical_Voice",
    // 抒情男声
    "Chinese (Mandarin)_Straightforward_Boy": "Chinese (Mandarin)_Straightforward_Boy",
    // 率真弟弟
    "Chinese (Mandarin)_Sincere_Adult": "Chinese (Mandarin)_Sincere_Adult",
    // 真诚青年
    "Chinese (Mandarin)_Gentle_Senior": "Chinese (Mandarin)_Gentle_Senior",
    // 温柔学姐
    "Chinese (Mandarin)_Stubborn_Friend": "Chinese (Mandarin)_Stubborn_Friend",
    // 嘴硬竹马
    "Chinese (Mandarin)_Crisp_Girl": "Chinese (Mandarin)_Crisp_Girl",
    // 清脆少女
    "Chinese (Mandarin)_Pure-hearted_Boy": "Chinese (Mandarin)_Pure-hearted_Boy",
    // 清澈邻家弟弟
    // Cantonese voices
    "Cantonese_ProfessionalHost\uFF08F)": "Cantonese_ProfessionalHost\uFF08F)",
    // 专业女主持
    "Cantonese_ProfessionalHost\uFF08M)": "Cantonese_ProfessionalHost\uFF08M)",
    // 专业男主持
    "Cantonese_PlayfulMan": "Cantonese_PlayfulMan",
    // 活泼男声
    "Cantonese_CuteGirl": "Cantonese_CuteGirl",
    // 可爱女孩
    // English voices (alternative labeling)
    "English_Trustworthy_Man": "English_Trustworthy_Man",
    // Trustworthy Man
    "English_Graceful_Lady": "English_Graceful_Lady",
    // Graceful Lady
    "English_Aussie_Bloke": "English_Aussie_Bloke",
    // Aussie Bloke
    "English_Gentle-voiced_man": "English_Gentle-voiced_man",
    // Gentle-voiced man
    // Backward compatibility with old naming
    "Chinese (Mandarin)_Elite_Young": "male-qn-jingying",
    "Chinese (Mandarin)_College_Student": "male-qn-daxuesheng",
    "Chinese (Mandarin)_Young_Girl": "female-shaonv",
    "Chinese (Mandarin)_Mature_Woman": "female-chengshu",
    "Chinese (Mandarin)_Sweet_Woman": "female-tianmei",
    "Chinese (Mandarin)_Male_Presenter": "presenter_male",
    "Chinese (Mandarin)_Female_Presenter": "presenter_female",
    "Chinese (Mandarin)_Cute_Boy": "cute_boy",
    "Chinese (Mandarin)_Lovely_Girl": "lovely_girl",
    "Cantonese_Professional_Host_Female": "Cantonese_ProfessionalHost\uFF08F)",
    "Cantonese_Professional_Host_Male": "Cantonese_ProfessionalHost\uFF08M)",
    "English_Diligent_Man": "English_Diligent_Man",
    "English_Gentle_Voiced_Man": "English_Gentle-voiced_man",
    "English_UpsetGirl": "English_UpsetGirl",
    "English_Wiselady": "English_Wiselady"
  };
  console.log(`Voice mapping: '${frontendVoice}' -> '${voiceMap[frontendVoice] || "male-qn-jingying"}'`);
  return voiceMap[frontendVoice] || "male-qn-jingying";
}
__name(getMiniMaxVoiceId2, "getMiniMaxVoiceId2");
var init_tts_dialog = __esm({
  "api/tts-dialog.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequestPost4, "onRequestPost");
    __name2(onRequestOptions5, "onRequestOptions");
    __name2(getMiniMaxVoiceId2, "getMiniMaxVoiceId");
  }
});
async function onRequest4(context) {
  const { request, next } = context;
  try {
    return await next();
  } catch (err) {
    if (request.url.includes("/functions/api")) {
      return new Response(JSON.stringify({
        error: "API endpoint not found or not accessible",
        message: "The API endpoint you're trying to access doesn't exist or is not configured correctly.",
        url: request.url,
        method: request.method,
        troubleshooting_tips: [
          "Check that the API endpoint path is correct",
          "Verify that the necessary Cloudflare Function is deployed",
          "Make sure your function has the correct export for this HTTP method"
        ]
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    return new Response(JSON.stringify({
      error: "Resource not found",
      url: request.url
    }), {
      status: 404,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
__name(onRequest4, "onRequest4");
var init_catch_all = __esm({
  "_middleware/catch_all.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest4, "onRequest");
  }
});
async function onRequest5(context) {
  const { request, next } = context;
  const response = await next();
  const newResponse = new Response(response.body, response);
  newResponse.headers.delete("Speculation-Rules");
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");
  return newResponse;
}
__name(onRequest5, "onRequest5");
var init_headers = __esm({
  "_middleware/headers.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest5, "onRequest");
  }
});
async function onRequest6(context) {
  const { request, next } = context;
  if (new URL(request.url).pathname === "/cdn-cgi/speculation") {
    return new Response(JSON.stringify({
      prefetch: [
        {
          source: "document",
          where: {
            and: [{ href_matches: "/*", relative_to: "document" }]
          },
          eagerness: "conservative"
        }
      ]
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "https://study-llm.me"
      }
    });
  }
  const response = await next();
  const newResponse = new Response(response.body, response);
  const contentType = newResponse.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    newResponse.headers.set("Speculation-Rules", "/cdn-cgi/speculation");
  }
  return newResponse;
}
__name(onRequest6, "onRequest6");
var init_speculation2 = __esm({
  "_middleware/speculation.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest6, "onRequest");
  }
});
var env_exports = {};
__export(env_exports, {
  onRequest: /* @__PURE__ */ __name(() => onRequest7, "onRequest")
});
async function onRequest7(context) {
  const { request, env, params } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  const url = new URL(request.url);
  const pathname = url.pathname;
  const key = pathname.split("/").pop();
  if (request.method !== "GET") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  try {
    const envValue = env[key];
    if (envValue !== void 0) {
      return new Response(JSON.stringify({
        key,
        value: envValue
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    } else {
      return new Response(JSON.stringify({
        error: `Environment variable ${key} not found`
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
  } catch (error) {
    console.error("Error getting environment variable:", error);
    return new Response(JSON.stringify({
      error: "Failed to get environment variable",
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}
__name(onRequest7, "onRequest7");
var init_env = __esm({
  "api/env.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest7, "onRequest");
  }
});
var glm_route_exports = {};
__export(glm_route_exports, {
  config: /* @__PURE__ */ __name(() => config, "config"),
  onRequest: /* @__PURE__ */ __name(() => onRequest8, "onRequest")
});
function processQueue() {
  if (requestQueue.length === 0) return;
  const activeRequests = requestQueue.filter((req) => !req.completed && req.processing).length;
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) return;
  const nextRequest = requestQueue.find((req) => !req.completed && !req.processing);
  if (!nextRequest) return;
  nextRequest.processing = true;
  nextRequest.fn().then((result) => {
    nextRequest.result = result;
    nextRequest.completed = true;
    nextRequest.resolve(result);
  }).catch((error) => {
    nextRequest.error = error;
    nextRequest.completed = true;
    nextRequest.reject(error);
  }).finally(() => {
    const index = requestQueue.indexOf(nextRequest);
    if (index > -1) {
      requestQueue.splice(index, 1);
    }
    processQueue();
  });
}
__name(processQueue, "processQueue");
async function queueRequest(requestFn) {
  return new Promise((resolve, reject) => {
    const queueItem = {
      fn: requestFn,
      processing: false,
      completed: false,
      result: null,
      error: null,
      resolve,
      reject
    };
    requestQueue.push(queueItem);
    processQueue();
  });
}
__name(queueRequest, "queueRequest");
async function generateCacheKey2(request) {
  try {
    const body = await request.clone().json();
    const prompt = body.prompt || "";
    const messages = JSON.stringify(body.messages || []);
    return `${prompt}:${messages}`;
  } catch (e) {
    return `unique-${Date.now()}-${Math.random()}`;
  }
}
__name(generateCacheKey2, "generateCacheKey2");
async function onRequest8(context) {
  const { request, env } = context;
  const startTime = Date.now();
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://study-llm.me",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  try {
    const cacheKey = await generateCacheKey2(request);
    const body = await request.clone().json();
    const isStreaming = body.stream === true;
    if (!isStreaming && requestCache2.has(cacheKey)) {
      const cached = requestCache2.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL2) {
        console.log(`Cache hit for request: ${cacheKey}`);
        const cachedResponse = new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://study-llm.me",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
        const responseTime = Date.now() - startTime;
        console.log(`GLM route (cached) completed in ${responseTime}ms`);
        return cachedResponse;
      } else {
        requestCache2.delete(cacheKey);
      }
    }
    const url = new URL(request.url);
    const newUrl = new URL(url);
    newUrl.pathname = "/functions/api/chat-glm";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT2);
    try {
      const newRequest = new Request(newUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: request.redirect,
        signal: controller.signal
      });
      const response = await queueRequest(async () => {
        return await fetch(newRequest);
      });
      clearTimeout(timeoutId);
      if (!isStreaming && response.ok) {
        try {
          const responseData = await response.clone().json();
          requestCache2.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
          });
          if (requestCache2.size > 100) {
            const oldestKey = requestCache2.keys().next().value;
            requestCache2.delete(oldestKey);
          }
        } catch (e) {
          console.warn("Could not cache response: not valid JSON");
        }
      }
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "https://study-llm.me");
      newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      const responseTime = Date.now() - startTime;
      console.log(`GLM route completed in ${responseTime}ms`);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.error("GLM route request timeout");
        return new Response(JSON.stringify({
          error: "GLM API Timeout",
          message: "\u8BF7\u6C42\u5904\u7406\u65F6\u95F4\u8FC7\u957F\uFF0C\u8BF7\u5C1D\u8BD5\u4EE5\u4E0B\u89E3\u51B3\u65B9\u6848\uFF1A",
          suggestions: [
            "\u7B80\u5316\u95EE\u9898\uFF0C\u5206\u591A\u6B21\u8BE2\u95EE",
            "\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u72B6\u6001",
            "\u7A0D\u540E\u91CD\u8BD5\uFF0C\u670D\u52A1\u5668\u53EF\u80FD\u7E41\u5FD9",
            "\u5982\u679C\u95EE\u9898\u6301\u7EED\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458"
          ],
          error_code: "TIMEOUT_524"
        }), {
          status: 408,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://study-llm.me",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error in GLM route:", error);
    return new Response(JSON.stringify({
      error: "Failed to forward GLM request",
      message: error.message,
      troubleshooting_tips: [
        "Check that the GLM API endpoint is configured correctly",
        "Verify that the Cloudflare Function is deployed",
        "Check the network connection",
        "Try again later if the service is temporarily unavailable"
      ]
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://study-llm.me",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}
__name(onRequest8, "onRequest8");
var CACHE_TTL2;
var REQUEST_TIMEOUT2;
var requestCache2;
var requestQueue;
var MAX_CONCURRENT_REQUESTS;
var config;
var init_glm_route = __esm({
  "api/glm-route.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    CACHE_TTL2 = 60 * 1e3;
    REQUEST_TIMEOUT2 = 25e3;
    requestCache2 = /* @__PURE__ */ new Map();
    requestQueue = [];
    MAX_CONCURRENT_REQUESTS = 3;
    __name2(processQueue, "processQueue");
    __name2(queueRequest, "queueRequest");
    __name2(generateCacheKey2, "generateCacheKey");
    __name2(onRequest8, "onRequest");
    config = {
      runtime: "edge",
      maxDuration: 180
      // Set maximum duration to 180 seconds for longer GLM responses
    };
  }
});
async function onRequest9(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  const url = new URL(request.url);
  const newUrl = new URL(url);
  newUrl.pathname = "/functions/api/chat";
  const newRequest = new Request(newUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
    signal: request.signal
  });
  try {
    const response = await fetch(newRequest);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to forward request",
      message: error.message,
      troubleshooting_tips: [
        "Check that the API endpoint is configured correctly",
        "Verify that the Cloudflare Function is deployed",
        "Check the network connection"
      ]
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}
__name(onRequest9, "onRequest9");
var init_route = __esm({
  "api/route.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest9, "onRequest");
  }
});
async function onRequest10(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  const url = new URL(request.url);
  const newUrl = new URL(url);
  newUrl.pathname = "/functions/api/tts-dialog";
  const newRequest = new Request(newUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
    signal: request.signal
  });
  try {
    const response = await fetch(newRequest);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to forward request",
      message: error.message,
      troubleshooting_tips: [
        "Check that the Dialog TTS API endpoint is configured correctly",
        "Verify that the Cloudflare Function is deployed",
        "Check the network connection"
      ]
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}
__name(onRequest10, "onRequest10");
var init_tts_dialog_route = __esm({
  "api/tts-dialog-route.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest10, "onRequest");
  }
});
var tts_route_exports = {};
__export(tts_route_exports, {
  config: /* @__PURE__ */ __name(() => config2, "config"),
  onRequest: /* @__PURE__ */ __name(() => onRequest11, "onRequest")
});
async function onRequest11(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  const url = new URL(request.url);
  const newUrl = new URL(url);
  newUrl.pathname = "/functions/api/tts";
  const newRequest = new Request(newUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
    signal: request.signal
  });
  try {
    const response = await fetch(newRequest);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to forward request",
      message: error.message,
      troubleshooting_tips: [
        "Check that the TTS API endpoint is configured correctly",
        "Verify that the Cloudflare Function is deployed",
        "Check the network connection"
      ]
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}
__name(onRequest11, "onRequest11");
var config2;
var init_tts_route = __esm({
  "api/tts-route.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest11, "onRequest");
    config2 = {
      runtime: "edge",
      maxDuration: 60
      // Set maximum duration to 60 seconds
    };
  }
});
async function onRequest12(context) {
  return new Response(JSON.stringify({
    success: true,
    message: "RUM metrics received"
  }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequest12, "onRequest12");
var init_rum = __esm({
  "cdn-cgi/rum.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest12, "onRequest");
  }
});
async function onRequest13(context) {
  return new Response(JSON.stringify({
    // Empty rules set to prevent 404 errors
    prefetch: [{ source: "list", urls: [] }],
    prerender: [{ source: "list", urls: [] }]
  }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
__name(onRequest13, "onRequest13");
var init_speculation3 = __esm({
  "cdn-cgi/speculation.js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest13, "onRequest");
  }
});
async function onRequest14(context) {
  const { request, env, params } = context;
  const { pathname } = new URL(request.url);
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/env/")) {
      return await Promise.resolve().then(() => (init_env(), env_exports)).then((module) => module.onRequest(context)).catch((error) => {
        console.error("Error loading env module:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Internal server error loading env module"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      });
    }
    if (pathname === "/api/edge-tts") {
      return await import("./api/edge-tts-route.js").then((module) => module.onRequest(context)).catch((error) => {
        console.error("Error loading edge-tts-route module:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Internal server error loading worker-edge-tts module"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      });
    }
    if (pathname === "/api/tts") {
      return await Promise.resolve().then(() => (init_tts_route(), tts_route_exports)).then((module) => module.onRequest(context)).catch((error) => {
        console.error("Error loading tts-route module:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Internal server error loading tts module"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      });
    }
    if (pathname === "/api/ark-image") {
      return await import("./api/ark-image-route.js").then((module) => module.onRequest(context)).catch((error) => {
        console.error("Error loading ark-image-route module:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Internal server error loading ark-image module"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      });
    }
    if (pathname === "/api/chat") {
      return await Promise.resolve().then(() => (init_chat(), chat_exports)).then((module) => module.onRequest(context)).catch((error) => {
        console.error("Error loading chat module:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Internal server error loading chat module"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      });
    }
    if (pathname === "/api/glm") {
      return await Promise.resolve().then(() => (init_glm_route(), glm_route_exports)).then((module) => module.onRequest(context)).catch((error) => {
        console.error("Error loading glm-route module:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Internal server error loading glm module"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      });
    }
    if (pathname.startsWith("/api/db/query/")) {
      const queryPath = pathname.replace("/api/db/query/", "");
      return await Promise.resolve().then(() => (init_table(), table_exports)).then((module) => {
        context.params = { action: "query", table: queryPath };
        return module.onRequest(context);
      }).catch((error) => {
        console.error("Error loading db-query module:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Internal server error loading db-query module"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      });
    }
    if (pathname.startsWith("/api/db/upload/")) {
      const uploadPath = pathname.replace("/api/db/upload/", "");
      return await Promise.resolve().then(() => (init_table(), table_exports)).then((module) => {
        context.params = { action: "upload", table: uploadPath };
        return module.onRequest(context);
      }).catch((error) => {
        console.error("Error loading db-upload module:", error);
        return new Response(JSON.stringify({
          success: false,
          error: "Internal server error loading db-upload module"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      });
    }
    if (pathname.startsWith("/ws/api/db/query/")) {
      const queryPath = pathname.replace("/ws/api/db/query/", "");
      console.log("Forwarding to database API for query:", queryPath);
      try {
        const dbHandler = await Promise.resolve().then(() => (init_table(), table_exports));
        const context2 = {
          request,
          env,
          params: { action: "query", table: queryPath }
        };
        return await dbHandler.onRequest(context2);
      } catch (error) {
        console.error("Error forwarding query request:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    if (pathname.startsWith("/ws/api/db/upload/")) {
      const uploadPath = pathname.replace("/ws/api/db/upload/", "");
      console.log("Forwarding to database API for upload:", uploadPath);
      try {
        const dbHandler = await Promise.resolve().then(() => (init_table(), table_exports));
        const context2 = {
          request,
          env,
          params: { action: "upload", table: uploadPath }
        };
        return await dbHandler.onRequest(context2);
      } catch (error) {
        console.error("Error forwarding upload request:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    return new Response(JSON.stringify({
      success: false,
      error: "API endpoint not found"
    }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  return context.next();
}
__name(onRequest14, "onRequest14");
var init_path = __esm({
  "[[path]].js"() {
    init_functionsRoutes_0_7724356590623558();
    init_checked_fetch();
    init_strip_cf_connecting_ip_header();
    __name2(onRequest14, "onRequest");
  }
});
var routes;
var init_functionsRoutes_0_7724356590623558 = __esm({
  "../.wrangler/tmp/pages-KrOJof/functionsRoutes-0.7724356590623558.mjs"() {
    init_table();
    init_speculation();
    init_chat();
    init_chat();
    init_chat();
    init_chat_glm();
    init_chat_glm();
    init_chat_glm();
    init_ninjas();
    init_ninjas();
    init_tts();
    init_tts();
    init_tts();
    init_tts_dialog();
    init_tts_dialog();
    init_catch_all();
    init_headers();
    init_speculation2();
    init_env();
    init_glm_route();
    init_route();
    init_tts_dialog_route();
    init_tts_route();
    init_worker_glm();
    init_rum();
    init_speculation3();
    init_path();
    routes = [
      {
        routePath: "/api/db/:action/:table",
        mountPath: "/api/db/:action",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/cdn-cgi/speculation/speculation",
        mountPath: "/cdn-cgi/speculation",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/chat",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/chat",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions]
      },
      {
        routePath: "/api/chat",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/chat-glm",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/chat-glm",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions2]
      },
      {
        routePath: "/api/chat-glm",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/ninjas",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3]
      },
      {
        routePath: "/api/ninjas",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions3]
      },
      {
        routePath: "/api/tts",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet4]
      },
      {
        routePath: "/api/tts",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions4]
      },
      {
        routePath: "/api/tts",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/tts-dialog",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions5]
      },
      {
        routePath: "/api/tts-dialog",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost4]
      },
      {
        routePath: "/_middleware/catch_all",
        mountPath: "/_middleware",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/_middleware/headers",
        mountPath: "/_middleware",
        method: "",
        middlewares: [],
        modules: [onRequest5]
      },
      {
        routePath: "/_middleware/speculation",
        mountPath: "/_middleware",
        method: "",
        middlewares: [],
        modules: [onRequest6]
      },
      {
        routePath: "/api/env",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest7]
      },
      {
        routePath: "/api/glm-route",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest8]
      },
      {
        routePath: "/api/route",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest9]
      },
      {
        routePath: "/api/tts-dialog-route",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest10]
      },
      {
        routePath: "/api/tts-route",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest11]
      },
      {
        routePath: "/api/worker-glm",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/cdn-cgi/rum",
        mountPath: "/cdn-cgi",
        method: "",
        middlewares: [],
        modules: [onRequest12]
      },
      {
        routePath: "/cdn-cgi/speculation",
        mountPath: "/cdn-cgi",
        method: "",
        middlewares: [],
        modules: [onRequest13]
      },
      {
        routePath: "/:path*",
        mountPath: "/",
        method: "",
        middlewares: [],
        modules: [onRequest14]
      }
    ];
  }
});
init_functionsRoutes_0_7724356590623558();
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_functionsRoutes_0_7724356590623558();
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_functionsRoutes_0_7724356590623558();
init_checked_fetch();
init_strip_cf_connecting_ip_header();
init_functionsRoutes_0_7724356590623558();
init_checked_fetch();
init_strip_cf_connecting_ip_header();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
init_functionsRoutes_0_7724356590623558();
init_checked_fetch();
init_strip_cf_connecting_ip_header();
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
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
init_functionsRoutes_0_7724356590623558();
init_checked_fetch();
init_strip_cf_connecting_ip_header();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
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
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
init_functionsRoutes_0_7724356590623558();
init_checked_fetch();
init_strip_cf_connecting_ip_header();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
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
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
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
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
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
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
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
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// C:/Users/45333/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
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
var middleware_ensure_req_body_drained_default2 = drainBody2;

// C:/Users/45333/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-ASNGBl/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// C:/Users/45333/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-ASNGBl/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
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
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
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
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
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
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.9917579234318874.js.map
