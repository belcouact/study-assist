import { onRequest as __api_db__action___table__js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\db\\[action]\\[table].js"
import { onRequest as __cdn_cgi_speculation_speculation_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\cdn-cgi\\speculation\\speculation.js"
import { onRequestGet as __api_chat_js_onRequestGet } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\chat.js"
import { onRequestOptions as __api_chat_js_onRequestOptions } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\chat.js"
import { onRequestPost as __api_chat_js_onRequestPost } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\chat.js"
import { onRequestGet as __api_chat_glm_js_onRequestGet } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\chat-glm.js"
import { onRequestOptions as __api_chat_glm_js_onRequestOptions } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\chat-glm.js"
import { onRequestPost as __api_chat_glm_js_onRequestPost } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\chat-glm.js"
import { onRequestGet as __api_ninjas_js_onRequestGet } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\ninjas.js"
import { onRequestOptions as __api_ninjas_js_onRequestOptions } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\ninjas.js"
import { onRequestGet as __api_tts_js_onRequestGet } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\tts.js"
import { onRequestOptions as __api_tts_js_onRequestOptions } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\tts.js"
import { onRequestPost as __api_tts_js_onRequestPost } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\tts.js"
import { onRequestOptions as __api_tts_dialog_js_onRequestOptions } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\tts-dialog.js"
import { onRequestPost as __api_tts_dialog_js_onRequestPost } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\tts-dialog.js"
import { onRequest as ___middleware_catch_all_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\_middleware\\catch_all.js"
import { onRequest as ___middleware_headers_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\_middleware\\headers.js"
import { onRequest as ___middleware_speculation_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\_middleware\\speculation.js"
import { onRequest as __api_env_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\env.js"
import { onRequest as __api_glm_route_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\glm-route.js"
import { onRequest as __api_route_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\route.js"
import { onRequest as __api_tts_dialog_route_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\tts-dialog-route.js"
import { onRequest as __api_tts_route_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\tts-route.js"
import { onRequest as __api_worker_glm_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\api\\worker-glm.js"
import { onRequest as __cdn_cgi_rum_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\cdn-cgi\\rum.js"
import { onRequest as __cdn_cgi_speculation_js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\cdn-cgi\\speculation.js"
import { onRequest as ____path___js_onRequest } from "D:\\Alex\\study-assist\\study-assist\\functions\\[[path]].js"

export const routes = [
    {
      routePath: "/api/db/:action/:table",
      mountPath: "/api/db/:action",
      method: "",
      middlewares: [],
      modules: [__api_db__action___table__js_onRequest],
    },
  {
      routePath: "/cdn-cgi/speculation/speculation",
      mountPath: "/cdn-cgi/speculation",
      method: "",
      middlewares: [],
      modules: [__cdn_cgi_speculation_speculation_js_onRequest],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_chat_js_onRequestGet],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_chat_js_onRequestOptions],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_js_onRequestPost],
    },
  {
      routePath: "/api/chat-glm",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_chat_glm_js_onRequestGet],
    },
  {
      routePath: "/api/chat-glm",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_chat_glm_js_onRequestOptions],
    },
  {
      routePath: "/api/chat-glm",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_glm_js_onRequestPost],
    },
  {
      routePath: "/api/ninjas",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_ninjas_js_onRequestGet],
    },
  {
      routePath: "/api/ninjas",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_ninjas_js_onRequestOptions],
    },
  {
      routePath: "/api/tts",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_tts_js_onRequestGet],
    },
  {
      routePath: "/api/tts",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tts_js_onRequestOptions],
    },
  {
      routePath: "/api/tts",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_tts_js_onRequestPost],
    },
  {
      routePath: "/api/tts-dialog",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tts_dialog_js_onRequestOptions],
    },
  {
      routePath: "/api/tts-dialog",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_tts_dialog_js_onRequestPost],
    },
  {
      routePath: "/_middleware/catch_all",
      mountPath: "/_middleware",
      method: "",
      middlewares: [],
      modules: [___middleware_catch_all_js_onRequest],
    },
  {
      routePath: "/_middleware/headers",
      mountPath: "/_middleware",
      method: "",
      middlewares: [],
      modules: [___middleware_headers_js_onRequest],
    },
  {
      routePath: "/_middleware/speculation",
      mountPath: "/_middleware",
      method: "",
      middlewares: [],
      modules: [___middleware_speculation_js_onRequest],
    },
  {
      routePath: "/api/env",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_env_js_onRequest],
    },
  {
      routePath: "/api/glm-route",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_glm_route_js_onRequest],
    },
  {
      routePath: "/api/route",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_route_js_onRequest],
    },
  {
      routePath: "/api/tts-dialog-route",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_tts_dialog_route_js_onRequest],
    },
  {
      routePath: "/api/tts-route",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_tts_route_js_onRequest],
    },
  {
      routePath: "/api/worker-glm",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_worker_glm_js_onRequest],
    },
  {
      routePath: "/cdn-cgi/rum",
      mountPath: "/cdn-cgi",
      method: "",
      middlewares: [],
      modules: [__cdn_cgi_rum_js_onRequest],
    },
  {
      routePath: "/cdn-cgi/speculation",
      mountPath: "/cdn-cgi",
      method: "",
      middlewares: [],
      modules: [__cdn_cgi_speculation_js_onRequest],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [____path___js_onRequest],
    },
  ]