/* ============================================================
   ASTRA · server.js  —— 零依赖 Node 服务
   路由：
     POST /api/reading  → step-1o-turbo-vision 生成结构化解读（JSON，4-7s）
     POST /api/tts      → stepaudio-3-tts 语音合成（mp3）
     GET  /api/quote    → 每日星象引言（按日期+语言缓存）
     GET  /api/health   → 健康检查
     GET  /*            → 静态托管 ../code
   密钥仅存在于服务端环境变量 STEP_API_KEY，前端永不接触。
   运行：node server.js   （默认 http://localhost:8787）
   ============================================================ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { buildSystemPrompt } = require("./prompts");

/* ---------- 环境变量（.env 简易加载） ---------- */
(function loadEnv() {
  try {
    const env = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
    env.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    });
  } catch (e) { /* .env 不存在则依赖系统环境变量 */ }
})();

const PORT = parseInt(process.env.PORT || "8787", 10);
const API_KEY = process.env.STEP_API_KEY || "";
const CHAT_MODEL = process.env.STEP_MODEL || "step-1o-turbo-vision";
const TTS_MODEL = process.env.STEP_TTS_MODEL || "stepaudio-3-tts";
const TTS_VOICE_ZH = process.env.STEP_TTS_VOICE_ZH || "wenroushunv";  // 温柔熟女·成熟舒缓，深夜电台般的陪伴感
const TTS_VOICE_EN = process.env.STEP_TTS_VOICE_EN || "Lisa";            // 英文女声·轻柔叙述
const REASONING_EFFORT = process.env.STEP_REASONING_EFFORT || "low";     // 低推理档：报告够用，延迟更短
const API_BASE = "https://api.stepfun.com/v1";
const STATIC_DIR = path.join(__dirname, "..", "code");
/* 公开部署（Render 等）才需要这两项；本机演示留空/0 即保持原来的宽松行为 */
const ALLOW_ORIGINS = (process.env.ALLOW_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
const RATE_PER_DAY = parseInt(process.env.RATE_PER_DAY || "0", 10);      // 0 = 不限次

/* 来源闸门：file:// 的 "null"、本机、以及与本服务同源的页面放行，其余需在白名单里 */
function isAllowedOrigin(origin, host) {
  if (!origin) return true;                                              // 无 Origin：同源 GET 或 curl
  if (origin === "null") return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (host && origin === "http://" + host) return true;
  return ALLOW_ORIGINS.includes(origin);
}
const dayHits = new Map();
function clientIp(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.socket.remoteAddress || "unknown";
}
function overLimit(req) {
  if (!RATE_PER_DAY) return false;
  const key = new Date().toISOString().slice(0, 10) + "|" + clientIp(req);
  const n = (dayHits.get(key) || 0) + 1;
  dayHits.set(key, n);
  if (dayHits.size > 20000) dayHits.clear();
  return n > RATE_PER_DAY;
}

/* ---------- 小工具 ---------- */
function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", c => { size += c.length; if (size > 1e6) { reject(new Error("body too large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); }
      catch (e) { reject(new Error("invalid json body")); }
    });
    req.on("error", reject);
  });
}
function fetchWithTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, Object.assign({}, opts, { signal: ctrl.signal })).finally(() => clearTimeout(timer));
}
/* 从模型输出中稳健地提取 JSON（容忍 ```json 包裹、前后杂文字） */
function extractJson(text) {
  if (!text) throw new Error("empty model output");
  let s = text.replace(/```(?:json)?/gi, "").trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a === -1 || b === -1 || b <= a) throw new Error("no json object in output");
  s = s.slice(a, b + 1);
  try { return JSON.parse(s); }
  catch (e) {
    // 修掉尾逗号与字符串里的裸控制字符
    const fixed = s.replace(/[\u0000-\u001f]+/g, " ").replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(fixed);
  }
}
/* 校验并规整解读结构；读牌数量由系统决定，超出即截断 */
const READING_COUNT = { tarot: 3, gua: 2, number: 2, mansion: 2, rune: 3, oracle: 2 };
/* 中文最低字数：低于该值补一次扩写，保证报告不空泛 */
const ZH_MIN_SIZE = { tarot: 550, gua: 430, number: 400, mansion: 430, rune: 550, oracle: 420 };
const EN_MIN_SIZE = { tarot: 900, gua: 900, number: 900, mansion: 900, rune: 900, oracle: 900 };
/* 模型偶尔滑回宿命口吻；按产品红线做最后一道措辞软化 */
function softenWording(text) {
  return String(text || "")
    .replace(/预示/g, "提示")
    .replace(/注定/g, "更可能")
    .replace(/一定会/g, "往往会")
    .replace(/会指引你/g, "能帮你")
    .replace(/引领你/g, "陪你")
    .replace(/命运会/g, "事情会");
}
/* 模型仍会叠「X 提醒你」式起句：带逗号的引子整段删去（后面必接主句，删后句意完整，转折词保留）；
   后接「注意/留意」类动词时连符号主语一起删，留下祈使句；其余改写成以「你」为主语的叙述，替换词轮换避免新的重复 */
const REMIND_ALT = ["让你看清", "让你明白", "让你看见"];
function dedupeRemind(text) {
  let n = 0;
  return String(text || "")
    .replace(/(但|而|可|却|不过|只是)?[^。，；！？\n]{0,14}(?:提醒你|告诉你|警示你|告诫你)[，,]/g, (_, c) => c || "")
    .replace(/(但|而|可|却|不过|只是)?[^。，；！？\n]{0,12}(?:提醒你|告诉你|警示你|告诫你)(?=留意|注意|小心|别|不要|记住)/g, (_, c) => c || "")
    .replace(/提醒你|告诉你|警示你|告诫你/g, () => REMIND_ALT[n++ % REMIND_ALT.length]);
}
/* 中文稿偶发夹带英文单词（prompt 已禁但模型会漏），破坏语体：删去字母串，只留通用缩写 */
const LATIN_KEEP = /^(ASTRA|KPI|OKR|APP|AI|IT|CEO|PPT|MBTI|OK)$/i;
function stripStrayLatin(text) {
  return String(text || "").replace(/[A-Za-z]{2,}/g, w => LATIN_KEEP.test(w) ? w : "")
    .replace(/([\u4e00-\u9fa5])[ \t]+([\u4e00-\u9fa5])/g, "$1$2")
    .replace(/[ \t]{2,}/g, " ").replace(/[ \t]+([，。；：！？、])/g, "$1");
}
function normalizeReading(r, system, lang) {
  const fix = t => {
    t = dedupeRemind(softenWording(t));
    return lang === "en" ? t : stripStrayLatin(t);
  };
  const out = {};
  out.tone = fix(String(r.tone || "")).slice(0, 80) || "星尘落定。";
  const limit = READING_COUNT[system] || 3;
  out.readings = Array.isArray(r.readings) ? r.readings.slice(0, limit).map(rr => ({
    position: String((rr && rr.position) || "").slice(0, 30),
    card: String((rr && rr.card) || "").slice(0, 40),
    text: fix(rr && rr.text).slice(0, 900)
  })) : [];
  if (!out.readings.length) throw new Error("reading.readings empty");
  out.synthesis = fix(r.synthesis).slice(0, 1200);
  out.actions = Array.isArray(r.actions) ? r.actions.map(a => fix(a).trim().slice(0, 180)).filter(Boolean).slice(0, 3) : [];
  out.closing = fix(r.closing).slice(0, 180);
  return out;
}

/* ---------- /api/reading ---------- */
async function callChat(messages, useJsonMode, useReasoning, timeoutMs) {
  const body = { model: CHAT_MODEL, messages, temperature: 0.7, max_tokens: 2600, stream: false };
  if (useJsonMode) body.response_format = { type: "json_object" };
  if (useReasoning && REASONING_EFFORT && REASONING_EFFORT !== "none" && !/turbo/i.test(CHAT_MODEL)) body.reasoning_effort = REASONING_EFFORT;
  const r = await fetchWithTimeout(API_BASE + "/chat/completions", {
    method: "POST",
    headers: { "Authorization": "Bearer " + API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }, timeoutMs || 20000);
  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    const err = new Error("step api " + r.status + ": " + errText.slice(0, 300));
    err.status = r.status;
    throw err;
  }
  const data = await r.json();
  const msg = data && data.choices && data.choices[0] && data.choices[0].message;
  const content = (msg && msg.content) || "";
  if (!content) {
    console.error("[chat] empty content. finish_reason:", data && data.choices && data.choices[0] && data.choices[0].finish_reason,
      "usage:", JSON.stringify(data && data.usage || {}).slice(0, 200));
  }
  return content;
}
async function callChatResilient(messages, timeoutMs) {
  let content = "";
  try {
    content = await callChat(messages, true, true, timeoutMs);
  } catch (e) {
    if (e.status !== 400 && e.status !== 422) throw e;
    try {
      content = await callChat(messages, true, false, timeoutMs);
    } catch (e2) {
      if (e2.status !== 400 && e2.status !== 422) throw e2;
      content = await callChat(messages, false, false, timeoutMs);
    }
  }
  if (!content) content = await callChat(messages, false, false, timeoutMs);   // 推理耗尽 token → 再要一次纯文本
  return content;
}
async function handleReading(req, res) {
  if (!API_KEY) return sendJson(res, 500, { error: "STEP_API_KEY not configured on server" });
  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: e.message }); }
  const system = String(body.system || "");
  const lang = body.lang === "en" ? "en" : "zh";
  const payload = body.payload || {};
  if (!["tarot", "gua", "number", "mansion", "rune", "oracle"].includes(system)) {
    return sendJson(res, 400, { error: "unknown system: " + system });
  }
  const messages = [
    { role: "system", content: buildSystemPrompt(system, lang) },
    { role: "user", content: "payload = " + JSON.stringify(payload) }
  ];
  const startedAt = Date.now();
  const deadline = startedAt + 26000;
  try {
    let reading = null, lastErr = null;
    for (let attempt = 0; attempt < 2 && !reading; attempt++) {
      const budget = Math.min(20000, deadline - Date.now() - 5000);
      if (budget < 8000) break;
      try {
        reading = normalizeReading(extractJson(await callChatResilient(messages, budget)), system, lang);
      } catch (e) {
        lastErr = e;
        console.error("[reading:attempt]", system, "try " + (attempt + 1), e.message);
      }
    }
    if (!reading) throw lastErr || new Error("empty reading");
    const issues = validateReading(reading, system, lang, payload);
    let repaired = false;
    if (issues.length) {
      console.error("[reading:invalid]", system, issues.join("；"));
      const repairMsg = lang === "en"
        ? "Draft = " + JSON.stringify(reading) + "\nProblems: " + issues.join("; ") +
          "\nFix them and output ONLY the complete corrected JSON: the number of readings must match payload; every position/card/text must be non-empty and card must reuse the payload name; synthesis and closing must be non-empty; actions must contain exactly 3 items. Do not change any drawn facts."
        : "初稿 = " + JSON.stringify(reading) + "\n初稿存在以下问题：" + issues.join("；") +
          "\n请补齐并只输出修正后的完整 JSON：readings 数量与 payload 对应，position/card/text 非空且 card 使用 payload 名称，synthesis 与 closing 非空，actions 恰好 3 条。不要改动已有的牌面事实。";
      const repair = [
        messages[0],
        messages[1],
        { role: "user", content: repairMsg }
      ];
      const repairBudget = Math.min(15000, deadline - Date.now());
      if (repairBudget < 7000) throw new Error("invalid reading: " + issues.join("；"));
      const fixed = normalizeReading(extractJson(await callChat(repair, true, false, repairBudget)), system, lang);
      const fixedIssues = validateReading(fixed, system, lang, payload);
      if (fixedIssues.length) throw new Error("invalid reading: " + fixedIssues.join("；"));
      reading = fixed;
      repaired = true;
    }
    // 修复已花掉一次往返，且修复稿通常已够长；此时不再扩写，守住 28s 客户端上限
    if (!repaired) reading = await enrichIfThin(reading, system, lang, payload, deadline);
    reading = canonicalizeCards(reading, system, lang, payload);
    reading.question = typeof payload.question === "string" ? payload.question.slice(0, 120) : "";
    sendJson(res, 200, reading);
  } catch (e) {
    console.error("[reading]", system, e.message);
    sendJson(res, 502, { error: "reading generation failed", detail: e.message });
  }
}
/* 结构校验：条数、字段、actions、牌面名称都必须与 payload 对得上 */
function expectedCards(system, lang, payload) {
  if (system === "tarot") return (payload.cards || []).map(c => c.name);
  if (system === "gua") return [payload.name, payload.changeName];
  if (system === "number") return [payload.raw, payload.theme];
  if (system === "mansion") return [payload.name, payload.beast];
  if (system === "rune") return payload.runeNames || [];
  if (system === "oracle") return [lang === "en" ? "Lot " + payload.no : "第" + payload.no + "签", payload.level];
  return [];
}
const normCard = v => String(v || "").replace(/\s+/g, "").toLowerCase();
function cardMatches(actual, expected) {
  const n = normCard(actual), e = normCard(expected);
  if (!e) return false;
  if (n.includes(e)) return true;
  const head = e.split("·")[0];                    // "Fehu · 费胡" 允许写成 "Fehu"
  return head.length >= 3 && n.includes(head);
}
function validateReading(r, system, lang, payload) {
  const issues = [];
  const want = READING_COUNT[system] || 3;
  if (r.readings.length !== want) issues.push("readings 应为 " + want + " 项，实际 " + r.readings.length + " 项");
  const cards = expectedCards(system, lang, payload);
  const minText = lang === "en" ? 80 : 40;          // 只拦病态短句，正常扩写交给 enrich
  const minSynth = lang === "en" ? 80 : 50;
  r.readings.forEach((x, i) => {
    if (!x.position || !x.card || !x.text) issues.push("第 " + (i + 1) + " 项字段为空");
    else if (x.text.length < minText) issues.push("第 " + (i + 1) + " 项 text 过短");
    const exp = cards[i];
    if (exp && !cardMatches(x.card, exp)) {
      issues.push("第 " + (i + 1) + " 项 card 应为「" + exp + "」，实际「" + x.card + "」");
    }
  });
  if (!r.synthesis || r.synthesis.length < minSynth) issues.push("synthesis 为空或过短");
  if (r.actions.length !== 3 || r.actions.some(a => !a)) issues.push("actions 必须恰好 3 条");
  if (!r.closing) issues.push("closing 为空");
  return issues;
}
/* 模型常把 "Fehu · 费胡" 简写成 "Fehu"：只要命中主名，就把展示名补回 payload 的完整写法 */
function canonicalizeCards(reading, system, lang, payload) {
  const cards = expectedCards(system, lang, payload);
  reading.readings.forEach((x, i) => {
    const exp = cards[i];
    if (!exp) return;
    const n = normCard(x.card), e = normCard(exp);
    if (n.includes(e)) return;
    const head = e.split("·")[0];
    if (head.length >= 3 && n.includes(head)) x.card = exp;
  });
  return reading;
}
/* 中文报告偏短时补一次扩写：事实与牌面锁定，只加厚度；失败或漂移则保留初稿。 */
function readingSize(r) {
  return r.readings.reduce((n, x) => n + x.text.length, 0) + r.synthesis.length;
}
async function enrichIfThin(reading, system, lang, payload, deadline) {
  const isEn = lang === "en";
  const minSize = (isEn ? EN_MIN_SIZE : ZH_MIN_SIZE)[system] || (isEn ? 900 : 400);
  if (readingSize(reading) >= minSize) return reading;
  const budget = Math.min(10000, (deadline || Infinity) - Date.now());
  if (budget < 5000) return reading;
  const lens = reading.readings.map(x => x.text.length).join("/");
  const instruction = isEn
    ? "This is an EXPANSION task, not proofreading. The draft is too short: readings = " + lens + " chars, synthesis = " + reading.synthesis.length + " chars. All facts and drawn symbols are locked. Expand every reading to 80-100 words and synthesis to 100-130 words. You MUST add new information: concrete scenes, time frames, verifiable signals, cause-and-effect reasoning. Do not merely swap synonyms, do not shorten, do not restate the question. Keep positions, cards, order and the number of actions unchanged. Output only the complete JSON."
    : "这是扩写任务，不是校对。初稿明显偏短：各段字数为 " + lens + "，synthesis 为 " + reading.synthesis.length + " 字。事实、牌面、顺序与 actions 条数全部锁定。请把每项 text 扩写到 140-160 字，把 synthesis 扩写到 170-200 字；必须增加新信息——具体场景、时间尺度、可验证信号、因果解释；禁止只换同义词、禁止删减、禁止复述问题。只输出完整 JSON。";
  const ask = [
    { role: "system", content: buildSystemPrompt(system, lang) + "\n\n" + instruction },
    { role: "user", content: "payload = " + JSON.stringify(payload) + "\n初稿 = " + JSON.stringify(reading) }
  ];
  try {
    const next = normalizeReading(extractJson(await callChat(ask, true, false, budget)), system, lang);
    if (validateReading(next, system, lang, payload).length) return reading;
    return readingSize(next) > readingSize(reading) * 1.08 ? next : reading;
  } catch (e) {
    console.error("[reading:enrich]", system, e.message);
    return reading;
  }
}

/* ---------- /api/tts ---------- */
const TTS_INSTR = {
  zh: "你在读一段写给对方的占卜解读：声音温柔、舒缓、有质感，像深夜睡前轻声讲述一个真实发生过的故事；吐字清晰，语速从容放慢、不慌不忙，句与句之间留出呼吸般的停顿；不要播音腔，不要刻意甜美，不要气声或耳语，不要轻快或急促。",
  en: "Warm, intimate and gently narrated, like a friend telling a story on a quiet night; clear articulation, natural and lightly brisk pace, no broadcast tone, no breathiness or whispering."
};
/* TTS 耗时随字数线性上升：长文按句切块并行合成，再拼成一个 mp3。
   每块 API 返回 ID3v2 头 + 裸 mp3 帧，去掉头部后可直接相连。 */
function chunkTtsText(text, lang) {
  const minLen = lang === "en" ? 160 : 80;
  const maxLen = lang === "en" ? 280 : 220;
  const breakRe = lang === "en" ? /[.!?;,\n]/ : /[。！？；，、\n]/;
  const parts = [];
  let cur = "";
  for (const ch of text) {
    cur += ch;
    if (cur.length >= maxLen) { parts.push(cur); cur = ""; }
    else if (cur.length >= minLen && breakRe.test(ch)) { parts.push(cur); cur = ""; }
  }
  if (cur.trim()) parts.push(cur);
  return parts.map(s => s.trim()).filter(Boolean);
}
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}
function stripId3(buf) {
  if (buf.length > 10 && buf.slice(0, 3).toString("latin1") === "ID3") {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    let end = 10 + size;
    if (buf[5] & 0x10) end += 10;
    return buf.slice(Math.min(end, buf.length));
  }
  return buf;
}
async function synthChunk(text, voice, lang) {
  for (let attempt = 0; ; attempt++) {
    const r = await fetchWithTimeout(API_BASE + "/audio/speech", {
      method: "POST",
      headers: { "Authorization": "Bearer " + API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: text,
        voice,
        instruction: TTS_INSTR[lang],
        response_format: "mp3",
        sample_rate: 48000,                    // 默认 24k 发闷，48k 明显更亮更清晰
        speed: lang === "zh" ? 0.9 : 1.03,
        text_normalization: lang === "zh" ? "enhanced" : "standard"
      })
    }, 30000);
    if (r.ok) return stripId3(Buffer.from(await r.arrayBuffer()));
    const errText = await r.text().catch(() => "");
    if (r.status === 429 && attempt < 2) {
      await new Promise(res => setTimeout(res, 1200 + attempt * 900));
      continue;
    }
    const err = new Error("tts " + r.status + ": " + errText.slice(0, 200));
    err.status = r.status;
    throw err;
  }
}
/* 单块偶发超时/断连时，从中间标点劈成两半重试：更短的输入合成更快，避免整段退回浏览器朗读 */
function splitTtsChunk(text) {
  const mid = Math.floor(text.length / 2);
  for (let d = 0; d < 24; d++) {
    for (const i of [mid - d, mid + d]) {
      if (i > 8 && i < text.length - 8 && /[。！？；，、\n]/.test(text[i])) return i + 1;
    }
  }
  return mid;
}
async function synthChunkSafe(text, voice, lang) {
  try {
    return await synthChunk(text, voice, lang);
  } catch (e) {
    if (text.length < 40) throw e;
    const cut = splitTtsChunk(text);
    const [a, b] = await Promise.all([
      synthChunk(text.slice(0, cut), voice, lang),
      synthChunk(text.slice(cut), voice, lang)
    ]);
    return Buffer.concat([a, b]);
  }
}
const ttsCache = new Map();             // key → { buf, at }，同一段文字重播直接命中
const TTS_CACHE_TTL = 20 * 60 * 1000;
function ttsCacheGet(key) {
  const hit = ttsCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTS_CACHE_TTL) { ttsCache.delete(key); return null; }
  ttsCache.delete(key); ttsCache.set(key, hit);
  return hit.buf;
}
function ttsCacheSet(key, buf) {
  ttsCache.set(key, { buf, at: Date.now() });
  while (ttsCache.size > 8) ttsCache.delete(ttsCache.keys().next().value);
}
async function handleTts(req, res) {
  if (!API_KEY) return sendJson(res, 500, { error: "STEP_API_KEY not configured on server" });
  let body;
  try { body = await readBody(req); } catch (e) { return sendJson(res, 400, { error: e.message }); }
  const lang = body.lang === "en" ? "en" : "zh";
  let text = String(body.text || "")
    .replace(/[#*_`>\[\]()]/g, " ")          // 去掉 markdown/括号（括号内容会被当指令）
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1800);                          // 上限，超出部分不朗读
  if (!text) return sendJson(res, 400, { error: "empty text" });
  const voice = body.voice || (lang === "en" ? TTS_VOICE_EN : TTS_VOICE_ZH);
  const cacheKey = voice + "|" + lang + "|" + text;
  const cached = ttsCacheGet(cacheKey);
  if (cached) {
    res.writeHead(200, { "Content-Type": "audio/mpeg", "Content-Length": cached.length, "Cache-Control": "no-store" });
    return res.end(cached);
  }
  try {
    const chunks = chunkTtsText(text, lang);
    const bufs = await mapLimit(chunks, 5, c => synthChunkSafe(c, voice, lang));
    const out = Buffer.concat(bufs);
    if (!out.length) throw new Error("empty audio");
    ttsCacheSet(cacheKey, out);
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Content-Length": out.length,
      "Cache-Control": "no-store"
    });
    res.end(out);
  } catch (e) {
    console.error("[tts]", e.message);
    sendJson(res, 502, { error: "tts failed", detail: e.message });
  }
}

/* ---------- /api/quote（每日星象引言，按日期+语言缓存） ---------- */
const quoteCache = new Map();   // key: date|lang → {quote}
async function handleQuote(req, res, url) {
  const lang = url.searchParams.get("lang") === "en" ? "en" : "zh";
  const date = new Date().toISOString().slice(0, 10);
  const key = date + "|" + lang;
  if (quoteCache.has(key)) return sendJson(res, 200, quoteCache.get(key));
  if (!API_KEY) return sendJson(res, 503, { error: "no key" });
  const prompt = lang === "en"
    ? "Write ONE short atmospheric line (max 18 words) for a stardust divination app home page — about tonight's sky, quiet self-dialogue, or the moment before asking a question. Poetic, restrained, no clichés, no emoji. Output the line only, nothing else."
    : "为占卜应用首页写一句「今日星象引言」：不超过 22 个字，关于今夜的星空、向未知提问前的安静、或一场自我对话。诗意、克制、有画面感，不用感叹号和 emoji。只输出这一句话，不要其他内容。";
  try {
    const content = await callChat([{ role: "user", content: prompt }], false);
    const quote = content.replace(/["'“”\n]/g, "").trim().slice(0, lang === "en" ? 140 : 60);   // 英文按词计，60 字符会拦腰截断
    if (!quote) throw new Error("empty quote");
    const val = { quote, date, lang };
    quoteCache.set(key, val);
    sendJson(res, 200, val);
  } catch (e) {
    console.error("[quote]", e.message);
    sendJson(res, 502, { error: "quote failed", detail: e.message });
  }
}

/* ---------- 静态文件 ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8", ".ico": "image/x-icon", ".mp3": "audio/mpeg",
  ".wasm": "application/wasm", ".tflite": "application/octet-stream", ".data": "application/octet-stream",
  ".binarypb": "application/octet-stream"
};
function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p === "/" || p === "") p = "/index.html";
  const file = path.normalize(path.join(STATIC_DIR, p));
  if (!file.startsWith(STATIC_DIR)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("not found"); }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

/* ---------- HTTP 服务 ---------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  /* 只放行 file://（Origin: null）、本机、同源以及白名单里的线上页面，防止任意网站借这台服务消耗额度 */
  const origin = req.headers.origin || "";
  const corsOk = isAllowedOrigin(origin, req.headers.host);
  if (corsOk) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  try {
    if (req.method === "OPTIONS") {
      if (corsOk) {
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      }
      res.writeHead(204);
      return res.end();
    }
    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, hasKey: !!API_KEY, chatModel: CHAT_MODEL, ttsModel: TTS_MODEL, ratePerDay: RATE_PER_DAY || "unlimited" });
    }
    if (url.pathname.startsWith("/api/")) {
      if (!corsOk) return sendJson(res, 403, { error: "origin not allowed", origin: origin || "(none)", allow: ALLOW_ORIGINS.join(",") });
      if (overLimit(req)) return sendJson(res, 429, { error: "今日调用次数已达上限，明天再来或改用本机演示", limit: String(RATE_PER_DAY) });
    }
    if (req.method === "POST" && url.pathname === "/api/reading") return await handleReading(req, res);
    if (req.method === "POST" && url.pathname === "/api/tts") return await handleTts(req, res);
    if (req.method === "GET" && url.pathname === "/api/quote") return await handleQuote(req, res, url);
    if (url.pathname.startsWith("/api/")) return sendJson(res, 404, { error: "unknown api" });
    return serveStatic(req, res, url);
  } catch (e) {
    console.error("[server]", e);
    try { sendJson(res, 500, { error: "internal error", detail: e.message }); } catch (_) {}
  }
});
server.listen(PORT, () => {
  console.log("ASTRA server → http://localhost:" + PORT);
  console.log("  chat model :", CHAT_MODEL, API_KEY ? "(key loaded)" : "(NO KEY — set STEP_API_KEY in server/.env)");
  console.log("  tts  model :", TTS_MODEL);
  console.log("  来源白名单 :", ALLOW_ORIGINS.length ? ALLOW_ORIGINS.join(", ") : "仅本机与 file://");
  console.log("  每 IP 日限 :", RATE_PER_DAY || "不限");
});
