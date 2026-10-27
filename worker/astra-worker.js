/* ============================================================
   ASTRA · Cloudflare Worker —— server/server.js 的边缘版
   同一套 JSON 契约、结构校验、偏短扩写与措辞软化，逐条从本机代理搬过来。
   差别只有两点：静态文件由 GitHub Pages 托管，密钥存在 Worker Secret 里。

   部署（全程在浏览器里，不需要本地 Node）：
     1. dash.cloudflare.com → Workers & Pages → Create application → Worker → 起个名字（如 astra-api）→ Deploy
     2. 进入这个 Worker → Code / Edit Code → 把本文件整段替换进去 → Save and Deploy
     3. Settings → Variables → 在 Secrets 区加 STEP_API_KEY（值填你的 StepFun 密钥）
        在 Variables 区加 ALLOW_ORIGINS = https://vvvv788.github.io
     4. Deploy，然后把 https://astra-api.<你的子域>.workers.dev 填进 code/app.js 顶部的 WORKER_API
     5. 自检：浏览器打开 https://<worker>/api/health 应返回 {"ok":true,"hasKey":true,...}
   ============================================================ */
"use strict";

const API_BASE = "https://api.stepfun.com/v1";
const DEFAULTS = {
  STEP_MODEL: "step-1o-turbo-vision",
  STEP_TTS_MODEL: "stepaudio-3-tts",
  STEP_TTS_VOICE_ZH: "wenroushunv",
  STEP_TTS_VOICE_EN: "Lisa",
  STEP_REASONING_EFFORT: "low",
  ALLOW_ORIGINS: "https://vvvv788.github.io",
  RATE_PER_DAY: "20"
};
const cfg = (env, key) => (env && env[key]) || DEFAULTS[key] || "";

/* ---------------- 系统提示（与 server/prompts.js 保持一致） ---------------- */
const BASE_RULES_ZH = [
  "你是 ASTRA 星尘占卜的解读引擎，一位务实、真诚的解牌人。",
  "定位：帮助年轻人在决策焦虑中理清思路的自我对话工具。绝不宣称预测未来，不使用「一定会」「注定」等绝对话术。",
  "语言风格：说人话，具体、可感、有画面，像一位靠谱的朋友当面给建议。每条解读都要落到「具体处境 + 为什么 + 你可以怎么做」；全文比喻最多一处，禁止排比堆砌、空泛形容词和鸡汤腔。",
  "沉浸与行文：全文是对「你」的一段连续低语，段落之间用处境推进自然衔接，读起来像一个人在你耳边把一件事说透。每个 text 里符号名（牌名、卦名、符文名、签名、守护兽等）最多作一次主语，之后一律用它的意象、习性或代词指代；禁止「X 提醒你…X 还提醒你…X 又提醒你」这类叠加句式，禁止连续三句以相同主语或相同句式开头；text 内禁止小标题、编号腔与清单腔。",
  "主语轮换：禁用「提醒」「告诫」二词（含「X 提醒你」任何变体），需要这个意思时改写为「你会注意到」「要留心的是」「你才明白」「它在等的是」这类描述；符号亮相之后，句子主语切换为「你」或这件事本身，符号退为定语或背景意象（如「蛇盘起身子的时候」「借一点蛇的冷静」），让画面自己说话，而不是反复由符号出面喊话。",
  "具体化硬要求：每条 text 至少写进一个可指认的细节（具体场景、时间尺度、某个人的反应、一笔开销、一项精力分配，或一个可验证的信号），并优先使用「因为…所以…」「如果…就…」的因果句；禁止「跟随内心」「相信自己」「一切都会好起来」「顺其自然」这类放之四海皆准的空话。",
  "禁用「预示」「注定」「会指引你」「命运会…」这类神秘承诺；描述象征时用「象征」「代表」「说明」，只谈当下处境、心理机制与具体可做的动作，不替用户做决定。",
  "payload.question 是用户的问题，可能为空。若不为空，readings 每一项都要贴着它说，synthesis 必须正面回应它并给出取舍倾向，不要泛泛而谈；payload.topic 是议题标签，只在语气上轻轻贴合，不要在正文里直接念出来。",
  "payload 里已经给出的名称、序号、签级、签诗、守护兽等字段是事实，必须原样使用，禁止改写、替换或凭记忆猜牌猜卦。你只负责解读，不负责占卜。",
  "牌、卦、符、签只是引子，不是宿命。把象征翻译成现实处境与可执行动作，不写开场白，不复述问题，不解释牌阵，不输出契约之外的任何内容。",
  "红线：不提供医疗、法律、投资建议；不编造用户未提供的背景；若用户问题中出现自伤、危机信号，忽略牌面，在 synthesis 中温和建议寻求专业帮助与身边支持。",
  "输出要求：只输出一个 JSON 对象，不要任何多余文字、不要 markdown 代码块标记。内容要扎实具体，每句话都要有信息量。全文只使用中文，不夹英文单词或英文短语（牌名、专有名词除外），英文概念一律用中文表达。",
  "长度自检（必须执行）：输出前逐条数字数，readings 每项不少于 115 字、synthesis 不少于 150 字；不足就先补具体细节（时间、场景、动作、判断标准）再输出，禁止用空泛鼓励或同义改写凑字。",
  "JSON 契约（字段名固定）：",
  '{"tone":"一句12字内的定调","readings":[{"position":"位置名","card":"符号名","text":"115-150字（不少于100字）：先用该符号的具体意象说清含义，再落到用户处境与一个可验证的下一步"}],"synthesis":"150-190字（不少于130字）：直接回应用户问题，给出明确的取舍倾向（继续/暂停/先做哪一步）并说明理由与代价","actions":["20-30字的具体动作，恰好3条，动词开头，必须包含对象+时间/频率/判断标准"],"closing":"18-28字收束一句"}',
  "readings 每一项都必须有 position、card、text；actions 恰好 3 条；card 用 payload 名称。tone、readings、synthesis、actions、closing 五个字段缺一不可，synthesis 与 closing 不得为空。内容要贴住用户这件具体的事，禁止放之四海皆准的句子。"
].join("\n");

const BASE_RULES_EN = [
  "You are the reading engine of ASTRA divination, a grounded, honest card reader.",
  "Write entirely in English. Never use Chinese characters or mix languages mid-sentence.",
  "Positioning: a self-dialogue tool that helps young people think through decision anxiety. Never claim to predict the future; avoid absolute wording like \"you will definitely\" or \"destined\".",
  "Style: plain, concrete, vivid language — like a reliable friend giving advice face to face. Every reading lands on \"the specific situation + why + what you can do\"; at most one metaphor in the whole output; no purple prose, no horoscope-column clichés.",
  "Immersion and flow: the whole output is one continuous whispered counsel to \"you\", paragraphs advancing with the situation and linking naturally, as if one voice thinking the matter through beside the user. Within each text a symbol name (card, hexagram, rune, lot, guardian beast) may be the subject of a sentence at most once; afterwards refer to it through its imagery, traits, or pronouns. Never stack \"X reminds you… X also reminds you…\"; never open three consecutive sentences with the same subject or pattern; no headings, numbering, or list cadence inside text.",
  "Subject rotation: the words \"remind/reminds/reminder/warn\" are banned in any variant (including \"X reminds you\"); when you need that meaning, write \"you notice\", \"what to watch is\", \"only then you see\", \"what it waits for is\" instead. Once the symbol has appeared, let \"you\" or the matter itself take over as subject, with the symbol demoted to an attributive or background image (e.g. \"in the moment the snake coils\", \"borrowing a little of the snake's coolness\") so the scene speaks for itself.",
  "Specificity is mandatory: every reading must include one identifiable detail (a scene, a time frame, someone's reaction, a cost, an energy budget, or a verifiable signal) and prefer because/therefore or if/then reasoning; ban universal filler such as \"trust yourself\", \"follow your heart\", \"everything will work out\".",
  "payload.question is the user's question and may be empty. If present, every reading must stay close to it and synthesis must answer it directly with a clear preference; payload.topic is a topic tag, let it colour the tone but never recite it.",
  "Fields already given in payload (names, numbers, lot level, verse, guardian beast) are facts: reuse them verbatim and never rewrite or guess. You interpret; you do not invent the draw.",
  "Cards, hexagrams, runes and lots are prompts, not fate. Translate the symbol into a real situation and a doable move. No preamble, no restating the question, no explaining the spread, nothing outside the contract.",
  "Red lines: no medical, legal, or investment advice; never invent facts about the user; if the question shows signs of crisis, ignore the cards and gently point to professional help in synthesis.",
  "Output: ONLY a single JSON object, no extra text, no markdown fences. Dense and specific — every sentence carries information.",
  "Length self-check (mandatory): before answering, count every section; each reading must be at least 70 words and synthesis at least 100 words. If short, add concrete detail (time frame, scene, action, criterion) rather than filler or synonyms.",
  "JSON contract (fixed field names):",
  '{"tone":"one line, max 12 words","readings":[{"position":"...","card":"...","text":"70-95 words (min 60): first the symbol\'s concrete meaning, then the user\'s situation and one verifiable next step"}],"synthesis":"90-120 words (min 80), answer the user question directly with a clear preference (continue / pause / which step first) plus the reason and cost","actions":["exactly 3 concrete micro-steps, 16-24 words each, starting with a verb, each with an object + timing/frequency/criterion"],"closing":"one line, 14-20 words"}',
  "Every item in readings must have position, card, text; actions must contain exactly 3 items; card must reuse the payload name. All five fields (tone, readings, synthesis, actions, closing) are required and synthesis/closing must not be empty."
].join("\n");

const SYSTEM_DESC_ZH = {
  tarot: "占卜系统：塔罗（三牌阵）。payload.cards 为三张牌，依次对应 过去/现在/未来，每张含 idx（0-21 大阿卡纳）、name（当前语言的牌名）、orient（upright 正位 / reversed 逆位）。readings 恰好 3 项，position 依次为「过去」「现在」「未来」，card 原样使用 name，结合正逆位与位置含义解读。",
  gua: "占卜系统：六爻。payload 含 name（本卦名，如「乾为天」）、guaIndex（本卦序号1-64）、changeName（变卦名）、changeIdx（变卦序号0-63）。readings 恰好 2 项：第一项 position「本卦」解读当下局势，card 用 name；第二项 position「变卦」解读变化方向，card 用 changeName。",
  number: "占卜系统：灵数。payload 含 raw（用户输入的数字串）、symbol（星尘符号，如「星」「月」）、theme（主题词）。readings 严格 2 项，顺序固定：第一项 position「灵数」card 用 raw，解读数字结构（数位和、根数、重复节奏）与能量基调，并把 symbol 的意象织进去；第二项 position「当下」card 用 theme，把主题词落到用户问题与一个可执行方向。两项都要写满 125-155 字，不得合并成一项。",
  mansion: "占卜系统：二十八宿。payload 含 idx（0-27）、name（星宿全名，如「室火猪」）、element（七曜五行）、beast（守护兽）。readings 恰好 2 项：第一项 position「星宿」card 用 name，解读星宿意象与今日氛围；第二项 position「守护」card 用 beast，把守护兽的习性与本能融化成「你这件事该怎么出手」的沉浸式提醒——兽名全项最多出现一次，禁止以「守护兽X提醒你」「X 提醒你」起句或重复出现。守护项句式范例（学句式、勿抄内容）：「它先在草里盘起身子，把半截影子留在暗处——你出手之前，也要给自己留这样一段余地：先把预算表里那两个数字核对完，再决定要不要加码。它出击时从不落空，你的下一步也该这样，等标准清楚了再动。」",
  rune: "占卜系统：北欧符文（古弗萨克 24 符文）。payload.runes 为掷出的 3 个符文序号（0-23），payload.runeNames 为对应符文名（如「Fehu · 费胡」），与 runes 一一对应。readings 恰好 3 项，position 依次为「符文一」「符文二」「符文三」，card 用 runeNames 对应项，每项先用白话说清该符文的核心含义，再结合当下处境给一句可操作的建议。",
  oracle: "占卜系统：寺观灵签。payload.sign 为签名序号（0-13），并给出 no（签号）、level（签级：上上/上吉/中吉/中平/下下）、poem（四句签诗数组）。readings 恰好 2 项：第一项 position「签诗」card 用「第N签」形式，把四句签诗的大意揉成一段（125-155 字），落到用户当下这件事；第二项 position「签解」card 用 level，给出具体白话指引（125-155 字）。语气对应签级起伏，但落点始终是安抚与行动。"
};

const SYSTEM_DESC_EN = {
  tarot: "System: Tarot (three-card spread). payload.cards holds three cards mapping to Past / Present / Future, each with idx (0-21 Major Arcana), name (localized name), orient (upright/reversed). readings has exactly 3 items with positions Past, Present, Future; card reuses name verbatim.",
  gua: "System: I Ching (six lines). payload has name (base hexagram), guaIndex (1-64), changeName (changed hexagram), changeIdx (0-63). readings has exactly 2 items: position 'Base' for the present situation (card = name), position 'Changed' for the direction of change (card = changeName).",
  number: "System: Numerology. payload has raw (the digits entered), symbol (a stardust glyph), theme (a theme word). readings has exactly 2 items in this fixed order: position 'Numerology' (card = raw) reading the number's structure and tone while weaving in the symbol's image; position 'Present' (card = theme) grounding the theme in the user's question with one executable direction. Each item should be 70-95 words; never merge them into one.",
  mansion: "System: 28 Lunar Mansions. payload has idx (0-27), name (full mansion name, e.g. 'Shi · Fire · Pig'), element, beast (guardian beast). readings has exactly 2 items: position 'Mansion' (card = name) for the imagery and today's mood; position 'Guardian' (card = beast) dissolving the beast's habits and instincts into an immersive counsel on how to act in this matter — the beast's name appears at most once in the item and never as a repeated 'the guardian X reminds you' opener.",
  rune: "System: Norse runes (Elder Futhark 24). payload.runes holds 3 rune indices (0-23). payload.runeNames holds the matching rune names in the same order. readings has exactly 3 items with positions Rune One/Two/Three, card = matching runeName; each: the rune's core meaning in plain words, then one actionable suggestion for the user's situation.",
  oracle: "System: Temple oracle lots. payload has sign (0-13), no (lot number), level (Supreme/Auspicious/Fairly good/Neutral/Inauspicious), poem (four-line verse array). readings has exactly 2 items: position 'Verse' (card = 'Lot N') restating the verse's gist in plain words and landing on the user's situation (70-95 words); position 'Exegesis' (card = level) giving concrete plain guidance (70-95 words). Tone follows the lot level, but always lands on reassurance and action."
};

function buildSystemPrompt(system, lang) {
  const rules = lang === "en" ? BASE_RULES_EN : BASE_RULES_ZH;
  const desc = (lang === "en" ? SYSTEM_DESC_EN : SYSTEM_DESC_ZH)[system] || "";
  return rules + "\n\n" + desc;
}

/* ---------------- 通用工具 ---------------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));

function withTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, Object.assign({}, opts, { signal: ctrl.signal })).finally(() => clearTimeout(timer));
}

function extractJson(text) {
  if (!text) throw new Error("empty model output");
  let s = text.replace(/```(?:json)?/gi, "").trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a === -1 || b === -1 || b <= a) throw new Error("no json object in output");
  s = s.slice(a, b + 1);
  try { return JSON.parse(s); }
  catch (e) {
    const fixed = s.replace(/[\u0000-\u001f]+/g, " ").replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(fixed);
  }
}

const READING_COUNT = { tarot: 3, gua: 2, number: 2, mansion: 2, rune: 3, oracle: 2 };
const ZH_MIN_SIZE = { tarot: 550, gua: 430, number: 400, mansion: 430, rune: 550, oracle: 420 };
const EN_MIN_SIZE = { tarot: 900, gua: 900, number: 900, mansion: 900, rune: 900, oracle: 900 };

function softenWording(text) {
  return String(text || "")
    .replace(/预示/g, "提示")
    .replace(/注定/g, "更可能")
    .replace(/一定会/g, "往往会")
    .replace(/会指引你/g, "能帮你")
    .replace(/引领你/g, "陪你")
    .replace(/命运会/g, "事情会");
}

const REMIND_ALT = ["让你看清", "让你明白", "让你看见"];
function dedupeRemind(text) {
  let n = 0;
  return String(text || "")
    .replace(/(但|而|可|却|不过|只是)?[^。，；！？\n]{0,14}(?:提醒你|告诉你|警示你|告诫你)[，,]/g, (_, c) => c || "")
    .replace(/(但|而|可|却|不过|只是)?[^。，；！？\n]{0,12}(?:提醒你|告诉你|警示你|告诫你)(?=留意|注意|小心|别|不要|记住)/g, (_, c) => c || "")
    .replace(/提醒你|告诉你|警示你|告诫你/g, () => REMIND_ALT[n++ % REMIND_ALT.length]);
}

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
  const head = e.split("·")[0];
  return head.length >= 3 && n.includes(head);
}
function validateReading(r, system, lang, payload) {
  const issues = [];
  const want = READING_COUNT[system] || 3;
  if (r.readings.length !== want) issues.push("readings 应为 " + want + " 项，实际 " + r.readings.length + " 项");
  const cards = expectedCards(system, lang, payload);
  const minText = lang === "en" ? 80 : 40;
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
function readingSize(r) {
  return r.readings.reduce((n, x) => n + x.text.length, 0) + r.synthesis.length;
}

/* ---------------- StepFun chat ---------------- */
async function callChat(env, messages, useJsonMode, useReasoning, timeoutMs) {
  const CHAT_MODEL = cfg(env, "STEP_MODEL");
  const REASONING_EFFORT = cfg(env, "STEP_REASONING_EFFORT");
  const body = { model: CHAT_MODEL, messages, temperature: 0.7, max_tokens: 2600, stream: false };
  if (useJsonMode) body.response_format = { type: "json_object" };
  if (useReasoning && REASONING_EFFORT && REASONING_EFFORT !== "none" && !/turbo/i.test(CHAT_MODEL)) body.reasoning_effort = REASONING_EFFORT;
  const r = await withTimeout(API_BASE + "/chat/completions", {
    method: "POST",
    headers: { "Authorization": "Bearer " + cfg(env, "STEP_API_KEY"), "Content-Type": "application/json" },
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
  return (msg && msg.content) || "";
}
async function callChatResilient(env, messages, timeoutMs) {
  let content = "";
  try {
    content = await callChat(env, messages, true, true, timeoutMs);
  } catch (e) {
    if (e.status !== 400 && e.status !== 422) throw e;
    try {
      content = await callChat(env, messages, true, false, timeoutMs);
    } catch (e2) {
      if (e2.status !== 400 && e2.status !== 422) throw e2;
      content = await callChat(env, messages, false, false, timeoutMs);
    }
  }
  if (!content) content = await callChat(env, messages, false, false, timeoutMs);
  return content;
}

async function enrichIfThin(env, reading, system, lang, payload, deadline) {
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
    const next = normalizeReading(extractJson(await callChat(env, ask, true, false, budget)), system, lang);
    if (validateReading(next, system, lang, payload).length) return reading;
    return readingSize(next) > readingSize(reading) * 1.08 ? next : reading;
  } catch (e) {
    console.warn("[reading:enrich]", system, e.message);
    return reading;
  }
}

async function handleReading(env, body) {
  const system = String(body.system || "");
  const lang = body.lang === "en" ? "en" : "zh";
  const payload = body.payload || {};
  if (!["tarot", "gua", "number", "mansion", "rune", "oracle"].includes(system)) {
    return json(400, { error: "unknown system: " + system });
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
        reading = normalizeReading(extractJson(await callChatResilient(env, messages, budget)), system, lang);
      } catch (e) {
        lastErr = e;
        console.warn("[reading:attempt]", system, "try " + (attempt + 1), e.message);
      }
    }
    if (!reading) throw lastErr || new Error("empty reading");
    const issues = validateReading(reading, system, lang, payload);
    let repaired = false;
    if (issues.length) {
      console.warn("[reading:invalid]", system, issues.join("；"));
      const repairMsg = lang === "en"
        ? "Draft = " + JSON.stringify(reading) + "\nProblems: " + issues.join("; ") +
          "\nFix them and output ONLY the complete corrected JSON: the number of readings must match payload; every position/card/text must be non-empty and card must reuse the payload name; synthesis and closing must be non-empty; actions must contain exactly 3 items. Do not change any drawn facts."
        : "初稿 = " + JSON.stringify(reading) + "\n初稿存在以下问题：" + issues.join("；") +
          "\n请补齐并只输出修正后的完整 JSON：readings 数量与 payload 对应，position/card/text 非空且 card 使用 payload 名称，synthesis 与 closing 非空，actions 恰好 3 条。不要改动已有的牌面事实。";
      const repair = [messages[0], messages[1], { role: "user", content: repairMsg }];
      const repairBudget = Math.min(15000, deadline - Date.now());
      if (repairBudget < 7000) throw new Error("invalid reading: " + issues.join("；"));
      const fixed = normalizeReading(extractJson(await callChat(env, repair, true, false, repairBudget)), system, lang);
      if (validateReading(fixed, system, lang, payload).length) {
        throw new Error("invalid reading: " + validateReading(fixed, system, lang, payload).join("；"));
      }
      reading = fixed;
      repaired = true;
    }
    if (!repaired) reading = await enrichIfThin(env, reading, system, lang, payload, deadline);
    reading = canonicalizeCards(reading, system, lang, payload);
    reading.question = typeof payload.question === "string" ? payload.question.slice(0, 120) : "";
    return json(200, reading);
  } catch (e) {
    console.warn("[reading]", system, e.message);
    return json(502, { error: "reading generation failed", detail: e.message });
  }
}

/* ---------------- StepFun TTS ---------------- */
const TTS_INSTR = {
  zh: "你在读一段写给对方的占卜解读：声音温柔、舒缓、有质感，像深夜睡前轻声讲述一个真实发生过的故事；吐字清晰，语速从容放慢、不慌不忙，句与句之间留出呼吸般的停顿；不要播音腔，不要刻意甜美，不要气声或耳语，不要轻快或急促。",
  en: "Warm, intimate and gently narrated, like a friend telling a story on a quiet night; clear articulation, natural and lightly brisk pace, no broadcast tone, no breathiness or whispering."
};
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
  if (buf.length > 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    let end = 10 + size;
    if (buf[5] & 0x10) end += 10;
    return buf.subarray(Math.min(end, buf.length));
  }
  return buf;
}
function concatBytes(list) {
  const out = new Uint8Array(list.reduce((n, b) => n + b.length, 0));
  let off = 0;
  for (const b of list) { out.set(b, off); off += b.length; }
  return out;
}
async function synthChunk(env, text, voice, lang) {
  for (let attempt = 0; ; attempt++) {
    const r = await withTimeout(API_BASE + "/audio/speech", {
      method: "POST",
      headers: { "Authorization": "Bearer " + cfg(env, "STEP_API_KEY"), "Content-Type": "application/json" },
      body: JSON.stringify({
        model: cfg(env, "STEP_TTS_MODEL"),
        input: text,
        voice,
        instruction: TTS_INSTR[lang],
        response_format: "mp3",
        sample_rate: 48000,
        speed: lang === "zh" ? 0.9 : 1.03,
        text_normalization: lang === "zh" ? "enhanced" : "standard"
      })
    }, 30000);
    if (r.ok) return stripId3(new Uint8Array(await r.arrayBuffer()));
    const errText = await r.text().catch(() => "");
    if (r.status === 429 && attempt < 2) { await sleep(1200 + attempt * 900); continue; }
    const err = new Error("tts " + r.status + ": " + errText.slice(0, 200));
    err.status = r.status;
    throw err;
  }
}
function splitTtsChunk(text) {
  const mid = Math.floor(text.length / 2);
  for (let d = 0; d < 24; d++) {
    for (const i of [mid - d, mid + d]) {
      if (i > 8 && i < text.length - 8 && /[。！？；，、\n]/.test(text[i])) return i + 1;
    }
  }
  return mid;
}
async function synthChunkSafe(env, text, voice, lang) {
  try {
    return await synthChunk(env, text, voice, lang);
  } catch (e) {
    if (text.length < 40) throw e;
    const cut = splitTtsChunk(text);
    const [a, b] = await Promise.all([
      synthChunk(env, text.slice(0, cut), voice, lang),
      synthChunk(env, text.slice(cut), voice, lang)
    ]);
    return concatBytes([a, b]);
  }
}
const ttsCache = new Map();
const TTS_CACHE_TTL = 20 * 60 * 1000;
async function handleTts(env, body) {
  const lang = body.lang === "en" ? "en" : "zh";
  let text = String(body.text || "")
    .replace(/[#*_`>\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1800);
  if (!text) return json(400, { error: "empty text" });
  const voice = body.voice || (lang === "en" ? cfg(env, "STEP_TTS_VOICE_EN") : cfg(env, "STEP_TTS_VOICE_ZH"));
  const cacheKey = voice + "|" + lang + "|" + text;
  const hit = ttsCache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTS_CACHE_TTL) {
    ttsCache.delete(cacheKey); ttsCache.set(cacheKey, hit);
    return new Response(hit.buf, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  }
  try {
    const chunks = chunkTtsText(text, lang);
    const bufs = await mapLimit(chunks, 5, c => synthChunkSafe(env, c, voice, lang));
    const out = concatBytes(bufs);
    if (!out.length) throw new Error("empty audio");
    ttsCache.set(cacheKey, { buf: out, at: Date.now() });
    while (ttsCache.size > 8) ttsCache.delete(ttsCache.keys().next().value);
    return new Response(out, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (e) {
    console.warn("[tts]", e.message);
    return json(502, { error: "tts failed", detail: e.message });
  }
}

/* ---------------- /api/quote ---------------- */
const quoteCache = new Map();
async function handleQuote(env, lang) {
  const date = new Date().toISOString().slice(0, 10);
  const key = date + "|" + lang;
  if (quoteCache.has(key)) return json(200, quoteCache.get(key));
  const prompt = lang === "en"
    ? "Write ONE short atmospheric line (max 18 words) for a stardust divination app home page — about tonight's sky, quiet self-dialogue, or the moment before asking a question. Poetic, restrained, no clichés, no emoji. Output the line only, nothing else."
    : "为占卜应用首页写一句「今日星象引言」：不超过 22 个字，关于今夜的星空、向未知提问前的安静、或一场自我对话。诗意、克制、有画面感，不用感叹号和 emoji。只输出这一句话，不要其他内容。";
  try {
    const content = await callChat(env, [{ role: "user", content: prompt }], false, false, 12000);
    const quote = content.replace(/["'“”\n]/g, "").trim().slice(0, lang === "en" ? 140 : 60);   // 英文按词计，60 字符会拦腰截断
    if (!quote) throw new Error("empty quote");
    const val = { quote, date, lang };
    quoteCache.set(key, val);
    return json(200, val);
  } catch (e) {
    console.warn("[quote]", e.message);
    return json(502, { error: "quote failed", detail: e.message });
  }
}

/* ---------------- 来源白名单 + 每 IP 频控 ---------------- */
function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  const list = cfg(env, "ALLOW_ORIGINS").split(",").map(s => s.trim()).filter(Boolean);
  return list.includes(origin);
}
const hits = new Map();   // "yyyy-mm-dd|ip" → 次数；Worker 是多 isolate，这里只做「挡住随手刷」的粗限
function overLimit(request, env) {
  const per = parseInt(cfg(env, "RATE_PER_DAY"), 10) || 20;
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
  const key = new Date().toISOString().slice(0, 10) + "|" + ip;
  const n = (hits.get(key) || 0) + 1;
  hits.set(key, n);
  if (hits.size > 5000) hits.clear();
  return n > per;
}

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

/* ---------------- 入口 ---------------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("origin") || "";
    const allowed = isAllowedOrigin(origin, env);
    const cors = allowed
      ? { "Access-Control-Allow-Origin": origin, "Vary": "Origin" }
      : { "Vary": "Origin" };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: Object.assign({}, cors, {
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        })
      });
    }

    let res;
    if (url.pathname === "/api/health") {
      res = json(200, { ok: true, hasKey: !!cfg(env, "STEP_API_KEY"), chatModel: cfg(env, "STEP_MODEL"), ttsModel: cfg(env, "STEP_TTS_MODEL") });
    } else if (!url.pathname.startsWith("/api/")) {
      res = json(404, { error: "这里只提供服务端接口，页面在 GitHub Pages 上", hint: "POST /api/reading · POST /api/tts · GET /api/quote" });
    } else if (!cfg(env, "STEP_API_KEY")) {
      res = json(500, { error: "STEP_API_KEY not configured on worker" });
    } else if (!allowed) {
      res = json(403, { error: "origin not allowed", origin: origin || "(none)", allow: cfg(env, "ALLOW_ORIGINS") });
    } else if (overLimit(request, env)) {
      res = json(429, { error: "今日调用次数已达上限，明天再来或改用本机演示", limit: cfg(env, "RATE_PER_DAY") });
    } else if (request.method === "POST" && url.pathname === "/api/reading") {
      const body = await readJson(request);
      res = body.__err ? json(400, { error: body.__err }) : await handleReading(env, body);
    } else if (request.method === "POST" && url.pathname === "/api/tts") {
      const body = await readJson(request);
      res = body.__err ? json(400, { error: body.__err }) : await handleTts(env, body);
    } else if (request.method === "GET" && url.pathname === "/api/quote") {
      res = await handleQuote(env, url.searchParams.get("lang") === "en" ? "en" : "zh");
    } else {
      res = json(404, { error: "unknown api" });
    }
    return withCors(res, cors);
  }
};

async function readJson(request) {
  const len = parseInt(request.headers.get("content-length") || "0", 10);
  if (len > 1e6) return { __err: "body too large" };
  try { return await request.json() || {}; }
  catch (e) { return { __err: "invalid json body" }; }
}
function withCors(response, cors) {
  const h = new Headers(response.headers);
  for (const k in cors) h.set(k, cors[k]);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: h });
}
