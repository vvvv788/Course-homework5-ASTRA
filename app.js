/* ============================================================
   占卜站 Demo · app.js
   星尘粒子引擎 + 状态机 + 塔罗/六爻/灵数三模块 + 本地示例解读
   注：解读为 MOCK 数据，接 StepFun 时只需把 mockReading 换成 /api/reading 调用
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 主题 ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    if (window.__particles) window.__particles.recolor();
    recolorCards();
  }
  themeToggle && themeToggle.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "night" ? "day" : "night");
  });
  try {
    const saved = localStorage.getItem("theme");
    if (saved) applyTheme(saved);
  } catch (e) {}

  /* ---------------- 多语言 i18n ---------------- */
  let lang = "zh";
  try { const l = localStorage.getItem("lang"); if (l === "en" || l === "zh") lang = l; } catch (e) {}
  const I18N = {
    zh: {
      docTitle: "ASTRA · 占卜 Demo",
      brandSub: "占卜",
      themeToggle: "夜仪 / 昼谕",
      cameraToggle: "🎥 摄像头交互",
      cameraOn: "🎥 摄像头：开",
      soundOff: "🔕 轻音",
      soundOn: "🔔 轻音",
      bgmOff: "🔈 BGM",
      bgmOn: "🔊 BGM",
      heroTitle: "在星尘落下之前<br/>先问一句",
      heroSub: "择一星轨，开始一次安静的占卜。",
      startBtn: "开始占卜",
      demoNote: "当前为演示模式，解读为示例文案，尚未接入大模型。",
      demoBanner: "演示模式 · 示例解读，尚未接入大模型",
      cardTarot: "塔罗", cardTarotDesc: "三星牌，照见过去·现在·未来",
      cardGua: "六爻", cardGuaDesc: "三掷铜钱，自下成卦",
      cardNumber: "灵数", cardNumberDesc: "以数问星，静待回响",
      cardMansion: "二十八宿", cardMansionDesc: "一宿一兽，星野指路",
      cardRune: "北欧符文", cardRuneDesc: "三枚符石，掷地听讯",
      cardOracle: "寺观灵签", cardOracleDesc: "摇筒求签，诗示吉凶",
      backBtn: "‹ 返回",
      titleTarot: "塔罗 · 环星指引", titleGua: "六爻 · 起卦法阵",
      titleNumber: "灵数 · 数之回响", titleMansion: "二十八宿 · 星野指路",
      titleRune: "北欧符文 · 远古之语", titleOracle: "寺观灵签 · 一签之示",
      hintTarot: "点击「洗牌」生成牌阵，转动星盘让卡片停在顶部「选牌口」。三张对应 过去 / 现在 / 未来。",
      hintGua: "点击「摇卦」，连掷六次，自下而上成卦。法阵将逐爻点亮。",
      hintNumber: "写下一段数字（生日、任意 1–9 位皆可），让星尘为你凝结成谶。",
      hintMansion: "转动星环，让目标宿停在顶部「取宿口」，或点「摇星」随机点亮一宿。",
      hintRune: "点击「掷符」，聆听三枚远古符文的讯息。",
      hintOracle: "点击「求签」，静心摇筒，得一签之示。",
      askPh: "（可选）此刻你想问什么？写下你的问题或心愿…",
      dialSel: "选牌口",
      tarotShuffle: "洗牌", tarotReveal: "揭示解读",
      guaToss: "摇卦", guaReveal: "查看解读",
      numPh: "例如 19980918", numGen: "生成", numReveal: "查看解读",
      mansionSel: "取宿口", mansionSpin: "摇星", mansionPick: "取宿指引",
      runeCast: "掷符", runeReveal: "查看解读",
      oracleDraw: "求签", oracleReveal: "看签诗",
      readingTitle: "解读", readingSpeak: "🔊 朗读", readingExport: "⤓ 导出星图",
      camClose: "关闭", camStatus: "开启后画面中心出现跟随手部的光环：移到元素上停留约 1 秒自动触发。塔罗可用手势：张开手掌转动星盘、握拳取牌 · 🔒 仅本地处理，不上传", camGesture: "手势：检测中…",
      camMotion: "手势：运动追踪（无手部模型）", camNoHand: "未检测到手", camFist: "✊ 握拳 · 取牌", camOpen: "✋ 张开 · 转动", camGesturePrefix: "手势：",
      tarotHintIdle: "转动星盘，让目标牌停在顶部「选牌口」，停留或握拳取牌。",
      tarotPicked3: "三张已就位，点击「揭示解读」。",
      tarotPickedN: "已取 {{0}} 张，继续转动星盘取牌。",
      guaHintIdle: "点击「摇卦」，连掷六次，自下而上成卦。法阵将逐爻点亮。",
      guaCasting: "法阵运转中……逐爻自下方升起。",
      guaDone: "六爻已成，点击「查看解读」。",
      numEmpty: "请先写下一段数字",
      mansionHintIdle: "转动星环，让目标宿停在顶部「取宿口」，或点「摇星」随机点亮一宿。",
      mansionChosen: "已取「{{0}}」，点击「取宿指引」。",
      tLove: "感情", tCareer: "事业", tHealth: "身心", tChoice: "抉择", tRelation: "人际", tOther: "随缘",
      tailLove: "你问的指向一段关系——牌象之外，你心里多半早已写好了答案，占卜只是帮你把它读出来。",
      tailCareer: "你问的指向事业——能量更偏向行动与节奏，先把眼前这一步做实，远方的格局会自然接上。",
      tailHealth: "你问的指向身心——先照顾好今晚的睡眠与呼吸，任何决定都不如安稳睡一觉来得实在。",
      tailChoice: "你问的指向一个抉择——与其求一个对错，不如看哪种选择会让你事后更少后悔。",
      tailRelation: "你问的指向一段关系——把「我」和「我们」都放进来想一想，答案往往藏在缝隙里。",
      tailOther: "",
      lblYouAsk: "你问 · ", lblYouAskSpeech: "你问：",
      lblSynthesis: "综合", lblActions: "可执行建议",
      disclaimer: "以上为本地示例解读，未接入大模型。接 StepFun 后将按相同结构返回真实内容。",
      rdTarot: "塔罗解读", rdGua: "六爻解读", rdNumber: "灵数解读", rdMansion: "二十八宿解读", rdRune: "北欧符文解读", rdOracle: "寺观灵签解读",
      expBrand: "ASTRA 占卜", expFooter: "本地示例解读 · 未接入大模型 · ",
      expSynthesis: "综合", expActions: "可执行建议",
      orientUp: "正位", orientRev: "逆位", orientUpShort: "正", orientRevShort: "逆",
      lblBaseHex: "本卦", lblChangeHex: "变卦",
      hexInfo: "第 {{0}} 卦 · 变：{{1}}",
      lblStar: "星宿", lblGuardian: "守护", lblGuardianPrefix: "守护 · ",
      lblVerse: "签诗", lblSol: "签解",
      lblNum: "灵数",
      speakPlay: "🔊 朗读", speakStop: "⏸ 停止",
      noSpeech: "当前浏览器不支持语音朗读（Web Speech API）。",
      tarotTone: "三张牌把一段时间收拢成一束光。",
      tarotUp: "{{0}}正位落在「{{1}}」，把{{2}}的力量带到当下：它不催促你，只是轻轻指一个方向。",
      tarotRev: "{{0}}逆位出现在「{{1}}」，提示你原本的{{2}}之势被内收，能量没有顺畅流出，值得回看而非强推。",
      tarotSynth: "过去留下的痕迹、此刻的手感与未来的可能，并没有冲突，只是需要你把注意力从「结果」移回「过程」。",
      tarotAct1: "这周挑一个最轻的念头，先不做决定，只是观察它三天",
      tarotAct2: "把当下那张牌写在一张纸角，作为明天的提醒",
      tarotAct3: "若感到反复，回到过去那张牌给的线索里找起因",
      tarotClose: "牌不替你选择，它只是把你看过的路再指一遍。",
      guaTone: "{{0}}之象，动而能静。",
      guaBase: "本卦{{0}}（{{1}}）勾勒出当下局势的主轴：外显与内守之间，先稳住能稳住的那一部分。",
      guaChange: "其中一处变爻指向{{0}}，意味着只需挪动一个支点，整体的张力便会重新分布。",
      guaSynth: "自下而上成卦，初爻最实。先把最底下的那一步做扎实，上面的爻象自然会跟着理顺。",
      guaAct1: "就最基础的那件事，今天给出一个小而确定的动作",
      guaAct2: "对变爻提示的方向保持开放，不必立刻下定论",
      guaAct3: "三日后回看，是否那处变动真的发生了",
      guaClose: "卦是此刻的地形图，路仍由你走。",
      manTone: "{{0}} 当值，星野为你点亮一隅。",
      manGuardCard: "守护 · {{0}}",
      manGuardText: "今日的守护来自「{{0}}」，它轻声提醒你——{{1}}",
      manSynth: "二十八宿各司其时，这一宿落在你头上并非偶然；它把注意力从喧嚣拉回到一个具体的意象上。",
      manAct1: "把这一宿的意象当作今天的题眼，做一件与之呼应的事",
      manAct2: "若感到卡顿，回想守护兽带来的那句提醒",
      manAct3: "夜里抬头找一找属于它的那片星空",
      manClose: "星辰不替你决定，它只是借一宿之名，让你听见自己的心。",
      runeTone: "三枚符文落下，远古的低语至此。",
      runeSynth: "符文从不替你许诺结果，它们像三块路标，指出你此刻能量的三种流向。",
      runeAct1: "把三枚符文里最打动你的一句，写下来带在身边",
      runeAct2: "让「含义」与「提示」互相印证，而非只取其一",
      runeAct3: "三天后再看，哪一枚最先应验",
      runeClose: "石头沉默，但它说出的，往往比你问的更准。",
      oracleTone: "{{0}} · 第 {{1}} 签。",
      oracleSolCard: "解",
      oracleSynth: "签诗是古人留给迷途者的一句暗号，重点不在吉凶的字面，而在它是否说中了你心里的那个结。",
      oracleAct1: "把签诗读三遍，看哪一句最戳中你",
      oracleAct2: "若为上签，借势头做一件拖延的事；若为下签，先求稳住",
      oracleAct3: "别把签文当定数，它是指引不是判决",
      oracleClose: "签示一时之象，路仍由你走。",
      numTone: "灵数 · {{0}} 凝成「{{1}}」之象。",
      numText: "这串灵数落在「{{0}}」的频率上：它不预言什么，只是提醒你此刻更靠近这类议题。",
      numSynth: "星尘聚成字形又散去，像一段被短暂照亮的念头——重点不在灵数本身，而在你看到它时的那一下安静。",
      numAct1: "把今天的心情记一个词，和这个主题对照",
      numAct2: "不要为灵数赋予太多意义，留一点余白",
      numAct3: "若它让你舒服，就带着这份轻快去做一件小事",
      numClose: "灵数只是入口，门后仍是你自己的生活。"
    },
    en: {
      docTitle: "ASTRA · Divination Demo",
      brandSub: "Divination",
      themeToggle: "Night / Day",
      cameraToggle: "🎥 Camera",
      cameraOn: "🎥 Camera: On",
      soundOff: "🔕 Sound",
      soundOn: "🔔 Sound",
      bgmOff: "🔈 BGM",
      bgmOn: "🔊 BGM",
      heroTitle: "Before the stardust falls,<br/>ask one question",
      heroSub: "Choose a star-path, and begin a quiet divination.",
      startBtn: "Begin",
      demoNote: "Demo mode: readings are sample text, not yet connected to an LLM.",
      demoBanner: "Demo · sample reading, LLM not connected",
      cardTarot: "Tarot", cardTarotDesc: "Three cards: past, present, future",
      cardGua: "I Ching", cardGuaDesc: "Cast coins, build a hexagram",
      cardNumber: "Numerology", cardNumberDesc: "Ask the stars with numbers",
      cardMansion: "28 Mansions", cardMansionDesc: "A beast per mansion, guiding the sky",
      cardRune: "Runes", cardRuneDesc: "Three rune-stones, cast for counsel",
      cardOracle: "Oracle", cardOracleDesc: "Shake for a lot, verses reveal fate",
      backBtn: "‹ Back",
      titleTarot: "Tarot · Star-ring Guidance", titleGua: "I Ching · Casting Array",
      titleNumber: "Numerology · Echo of Numbers", titleMansion: "Lunar Mansions · Sky Guidance",
      titleRune: "Runes · Ancient Tongue", titleOracle: "Oracle · One Lot's Omen",
      hintTarot: "Tap “Shuffle” to build the spread, then spin the ring so a card rests at the top selector. The three cards map to Past / Present / Future.",
      hintGua: "Tap “Cast” to toss six times, building the hexagram from bottom up. The array lights line by line.",
      hintNumber: "Write a number (birthday, or any 1–9 digits) and let the stardust condense it into an omen.",
      hintMansion: "Spin the ring so a mansion rests at the top capture point, or tap “Spin” to light one at random.",
      hintRune: "Tap “Cast” to hear the message of three ancient rune-stones.",
      hintOracle: "Tap “Draw Lot”, calm your mind, and receive one lot's omen.",
      askPh: "(optional) What do you wish to ask? Write your question or wish…",
      dialSel: "Selector",
      tarotShuffle: "Shuffle", tarotReveal: "Reveal Reading",
      guaToss: "Cast", guaReveal: "View Reading",
      numPh: "e.g. 19980918", numGen: "Generate", numReveal: "View Reading",
      mansionSel: "Capture", mansionSpin: "Spin", mansionPick: "Mansion Guidance",
      runeCast: "Cast", runeReveal: "View Reading",
      oracleDraw: "Draw Lot", oracleReveal: "View Verse",
      readingTitle: "Reading", readingSpeak: "🔊 Read", readingExport: "⤓ Export",
      camClose: "Close", camStatus: "When on, a halo follows your hand at center: dwell ~1s on an element to trigger it. Tarot gestures: open palm spins the ring, fist picks a card · 🔒 local only, never uploaded", camGesture: "Gesture: detecting…",
      camMotion: "Gesture: motion tracking (no hand model)", camNoHand: "No hand detected", camFist: "✊ Fist · pick", camOpen: "✋ Open · spin", camGesturePrefix: "Gesture: ",
      tarotHintIdle: "Spin the ring so your card rests at the top selector; dwell or make a fist to pick.",
      tarotPicked3: "Three cards placed. Tap “Reveal Reading”.",
      tarotPickedN: "{{0}} card(s) taken. Keep spinning to pick more.",
      guaHintIdle: "Tap “Cast” to toss six times, building the hexagram from bottom up. The array lights line by line.",
      guaCasting: "The array is turning… lines rise from below.",
      guaDone: "Six lines formed. Tap “View Reading”.",
      numEmpty: "Please enter a number first",
      mansionHintIdle: "Spin the ring so a mansion rests at the top capture point, or tap “Spin” to light one at random.",
      mansionChosen: "Captured “{{0}}”. Tap “Mansion Guidance”.",
      tLove: "Love", tCareer: "Career", tHealth: "Well-being", tChoice: "Choice", tRelation: "Relations", tOther: "Open",
      tailLove: "Your question points at a relationship — beyond the cards, you've likely already written the answer; divination only helps you read it out.",
      tailCareer: "Your question points at career — energy leans toward action and rhythm; make today's step real, and the larger pattern follows.",
      tailHealth: "Your question points at body and mind — first care for tonight's sleep and breath; no decision beats a good night's rest.",
      tailChoice: "Your question points at a choice — rather than demand right or wrong, see which option you'd regret less later.",
      tailRelation: "Your question points at a relationship — put both “me” and “us” into the thought; the answer often hides in the gap.",
      tailOther: "",
      lblYouAsk: "You ask · ", lblYouAskSpeech: "You ask: ",
      lblSynthesis: "Synthesis", lblActions: "Suggested steps",
      disclaimer: "This is a local sample reading, not connected to an LLM. With StepFun it will return real content in the same structure.",
      rdTarot: "Tarot Reading", rdGua: "I Ching Reading", rdNumber: "Numerology Reading", rdMansion: "Mansions Reading", rdRune: "Runes Reading", rdOracle: "Oracle Reading",
      expBrand: "ASTRA Divination", expFooter: "Local sample reading · LLM not connected · ",
      expSynthesis: "Synthesis", expActions: "Suggested steps",
      orientUp: "Upright", orientRev: "Reversed", orientUpShort: "Up", orientRevShort: "Rev",
      lblBaseHex: "Base", lblChangeHex: "Changed",
      hexInfo: "Hexagram {{0}} · Changes to: {{1}}",
      lblStar: "Mansion", lblGuardian: "Guardian", lblGuardianPrefix: "Guardian · ",
      lblVerse: "Verse", lblSol: "Exegesis",
      lblNum: "Numerology",
      speakPlay: "🔊 Read", speakStop: "⏸ Stop",
      noSpeech: "This browser does not support speech reading (Web Speech API).",
      tarotTone: "Three cards gather a span of time into a single beam of light.",
      tarotUp: "{{0}} upright in “{{1}}” brings the power of {{2}} into the present: it doesn't rush you, only points gently in a direction.",
      tarotRev: "{{0}} reversed appears in “{{1}}”, suggesting the {{2}} energy is drawn inward, not flowing freely — worth revisiting rather than forcing.",
      tarotSynth: "The traces of the past, the feel of the now, and the possibilities of the future are not in conflict; you only need to move your attention from the “result” back to the “process”.",
      tarotAct1: "This week, pick the lightest thought — don't decide, just observe it for three days",
      tarotAct2: "Write today's card on a corner of paper as tomorrow's reminder",
      tarotAct3: "If you feel stuck in loops, return to the clue the past card gives",
      tarotClose: "The cards don't choose for you; they only point again at the roads you've seen.",
      guaTone: "{{0}}: movement that can also be still.",
      guaBase: "The base hexagram {{0}} ({{1}}) sketches the spine of the present: between what shows and what's held, first steady the part you can steady.",
      guaChange: "One changing line points to {{0}}, meaning a single pivot shifted is enough to redistribute the whole tension.",
      guaSynth: "The hexagram builds from the bottom up; the first line is the most real. Make the bottom step solid, and the upper lines sort themselves out.",
      guaAct1: "Give one small, certain action to the most basic thing today",
      guaAct2: "Stay open to where the changing line points; don't conclude yet",
      guaAct3: "In three days, check whether that shift truly happened",
      guaClose: "The hexagram is a map of this moment's terrain; the road is still yours.",
      manTone: "{{0}} takes its turn, lighting one corner of the sky for you.",
      manGuardCard: "Guardian · {{0}}",
      manGuardText: "Today's guardian is “{{0}}”, whispering — {{1}}",
      manSynth: "Each of the 28 mansions has its season; that this one fell on you is no accident — it pulls your attention from noise back to one concrete image.",
      manAct1: "Take this mansion's image as today's motif; do one thing that echoes it",
      manAct2: "If stuck, recall the reminder the guardian beast brought",
      manAct3: "At night, look up and find its patch of sky",
      manClose: "The stars don't decide for you; they borrow a mansion's name so you can hear your own heart.",
      runeTone: "Three runes fall; the ancient whisper arrives.",
      runeSynth: "Runes never promise an outcome; like three signposts, they show the three currents of your present energy.",
      runeAct1: "Write down the one line that moves you most, and carry it",
      runeAct2: "Let “meaning” and “advice” confirm each other, not just one",
      runeAct3: "Check in three days which rune came true first",
      runeClose: "The stone is silent, yet what it says is often truer than your question.",
      oracleTone: "{{0}} · Lot {{1}}.",
      oracleSolCard: "Exegesis",
      oracleSynth: "The lot-verse is an ancient signal left for the lost; what matters isn't the literal fortune, but whether it names the knot in your heart.",
      oracleAct1: "Read the verse three times; see which line hits you",
      oracleAct2: "If upper lot, ride the momentum to do a delayed thing; if lower, first seek steadiness",
      oracleAct3: "Don't treat the verse as fate — it guides, not judges",
      oracleClose: "The lot shows a moment's image; the road is still yours.",
      numTone: "Numerology · {{0}} condenses into the sign “{{1}}”.",
      numText: "This number rests on the frequency of “{{0}}”: it foretells nothing, only reminds you that you're closer to this theme right now.",
      numSynth: "Stardust gathers into a glyph then scatters, like a thought briefly lit — what matters isn't the number itself, but the stillness you feel seeing it.",
      numAct1: "Name today's mood in one word and compare it with this theme",
      numAct2: "Don't load the number with too much meaning; leave some blank",
      numAct3: "If it comforts you, carry that lightness into a small act",
      numClose: "The number is only a doorway; behind it is still your own life."
    }
  };
  function t(key, args) {
    let s = (I18N[lang] && I18N[lang][key] != null) ? I18N[lang][key] : (I18N.zh[key] != null ? I18N.zh[key] : key);
    if (args && args.length) s = s.replace(/\{\{(\d+)\}\}/g, (m, i) => (args[+i] != null ? args[+i] : m));
    return s;
  }
  function applyI18nStatic() {
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
  }
  function applyLang() {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    applyI18nStatic();
    if (themeToggle) themeToggle.textContent = t("themeToggle");
    if (cameraToggle) cameraToggle.textContent = camOn ? t("cameraOn") : t("cameraToggle");
    if (soundToggle) soundToggle.textContent = soundOn ? t("soundOn") : t("soundOff");
    if (bgmToggle) { bgmToggle.textContent = bgmOn ? t("bgmOn") : t("bgmOff"); bgmToggle.classList.toggle("is-on", bgmOn); }
    if (langToggle) langToggle.textContent = lang === "zh" ? "EN" : "中";
    document.title = t("docTitle");
    refreshDynamicLang();
  }
  function setLang(l) {
    if (l !== "en" && l !== "zh") return;
    lang = l;
    try { localStorage.setItem("lang", l); } catch (e) {}
    applyLang();
  }
  const langToggle = document.getElementById("langToggle");
  const bgmToggle = document.getElementById("bgmToggle");

  /* ---------------- 状态机 ---------------- */
  const state = { screen: "home" };
  const reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function onEnterScreen(name) {
    if (name === "tarot") resetTarot();
    if (name === "gua") { resetGua(); startGuaAnim(); }
    if (name === "number") resetNumber();
    if (name === "mansion") resetMansion();
    if (name === "rune") resetRune();
    if (name === "oracle") resetOracle();
    if (name !== "gua") stopGuaAnim();
  }
  function switchScreen(name) {
    if (state.screen === name) return;
    if (window.__particles) window.__particles.collapse();
    setTimeout(() => {
      document.querySelectorAll(".screen").forEach(s => s.classList.remove("is-active"));
      const el = document.querySelector('[data-screen="' + name + '"]');
      if (el) el.classList.add("is-active");
      state.screen = name;
      if (window.__particles) window.__particles.expand();
      onEnterScreen(name);
    }, 480);
  }
  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => switchScreen(btn.getAttribute("data-go")));
  });

  /* ---------------- 粒子引擎 ---------------- */
  function initParticles() {
    if (typeof THREE === "undefined") return null; // 离线降级
    const canvas = document.getElementById("bg");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 3000);
    camera.position.z = 600;

    // 柔光圆点贴图
    const tex = (function () {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const g = c.getContext("2d");
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.4, "rgba(255,255,255,0.5)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();

    function makeLayer(count, spread, size) {
      const pos = new Float32Array(count * 3);
      const base = new Float32Array(count * 3);
      const vel = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const x = (Math.random() * 2 - 1) * spread.x;
        const y = (Math.random() * 2 - 1) * spread.y;
        const z = (Math.random() * 2 - 1) * spread.z;
        pos[i*3] = base[i*3] = x;
        pos[i*3+1] = base[i*3+1] = y;
        pos[i*3+2] = base[i*3+2] = z;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        size: size, map: tex, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, vertexColors: true, opacity: 0.9
      });
      const points = new THREE.Points(geo, mat);
      const group = new THREE.Group(); group.add(points);
      scene.add(group);
      return { geo, pos, base, vel, col, count, size, group, points, mat };
    }

    const near = makeLayer(2400, { x: 820, y: 520, z: 260 }, 6);
    const far = makeLayer(4000, { x: 900, y: 560, z: 460 }, 3.4);

    const colors = { a: new THREE.Color(), b: new THREE.Color() };
    function readColors() {
      const a = getComputedStyle(root).getPropertyValue("--particle-a").trim() || "#C9D4FF";
      const b = getComputedStyle(root).getPropertyValue("--particle-b").trim() || "#6F7BD8";
      colors.a.set(a); colors.b.set(b);
    }
    function recolor() {
      readColors();
      [near, far].forEach(L => {
        for (let i = 0; i < L.count; i++) {
          const t = Math.random();
          const cc = colors.a.clone().lerp(colors.b, t);
          L.col[i*3] = cc.r; L.col[i*3+1] = cc.g; L.col[i*3+2] = cc.b;
        }
        L.geo.attributes.color.needsUpdate = true;
      });
    }
    readColors(); recolor();

    // 交互状态
    const pointer = { x: 0, y: 0 };
    const ripples = [];
    const attractor = { active: false, x: 0, y: 0 };
    let collapsing = false;
    let camTargetW = null;

    function toWorld(ndcX, ndcY, zPlane) {
      const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
      const dir = v.sub(camera.position).normalize();
      const t = (zPlane - camera.position.z) / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(t));
    }

    window.addEventListener("pointermove", e => {
      if (window.__camOn) return;   // 摄像头模式下由摄像头驱动指针
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.x = nx; pointer.y = ny;
    });
    window.addEventListener("pointerdown", e => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      const w = toWorld(nx, ny, 0);
      ripples.push({ x: w.x, y: w.y, r: 0, max: 360, strength: 1.1 });
    });

    // 卡片 hover → 粒子聚拢
    document.querySelectorAll(".card").forEach(card => {
      const dir = card.getAttribute("data-attract");
      const tx = dir === "left" ? -220 : dir === "right" ? 220 : 0;
      card.addEventListener("pointerenter", () => { attractor.active = true; attractor.x = tx; attractor.y = 40; });
      card.addEventListener("pointerleave", () => { attractor.active = false; });
    });

    function updateLayer(L) {
      const { pos, vel, base, col, count, group } = L;
      const agx = attractor.active ? attractor.x - group.position.x : null;
      const agy = attractor.active ? attractor.y - group.position.y : null;
      for (let i = 0; i < count; i++) {
        const ix = i*3, iy = ix+1, iz = ix+2;
        let px = pos[ix], py = pos[iy], pz = pos[iz];
        let vx = vel[ix], vy = vel[iy], vz = vel[iz];
        const tx = collapsing ? 0 : base[ix];
        const ty = collapsing ? 0 : base[iy];
        const tz = collapsing ? 0 : base[iz];
        vx += (tx - px) * 0.06; vy += (ty - py) * 0.06; vz += (tz - pz) * 0.06;
        if (!reduced) {
          for (let k = 0; k < ripples.length; k++) {
            const r = ripples[k];
            const dx = px - (r.x - group.position.x);
            const dy = py - (r.y - group.position.y);
            const d = Math.hypot(dx, dy);
            if (d > 0.01 && Math.abs(d - r.r) < 46) {
              const f = (1 - Math.abs(d - r.r) / 46) * r.strength * (1 - r.r / r.max);
              vx += (dx / d) * f; vy += (dy / d) * f;
            }
          }
          if (attractor.active) {
            const dx = agx - px, dy = agy - py; const d = Math.hypot(dx, dy);
            if (d < 260 && d > 0.01) { const f = (1 - d / 260) * 0.5; vx += dx * f * 0.05; vy += dy * f * 0.05; }
          }
          if (camTargetW) {
            const dx = camTargetW.x - group.position.x - px;
            const dy = camTargetW.y - group.position.y - py;
            const d = Math.hypot(dx, dy);
            if (d < 520 && d > 0.01) { const f = (1 - d / 520) * 0.32; vx += dx * f * 0.04; vy += dy * f * 0.04; }
          }
        }
        vx *= 0.9; vy *= 0.9; vz *= 0.9;
        px += vx; py += vy; pz += vz;
        pos[ix] = px; pos[iy] = py; pos[iz] = pz;
        vel[ix] = vx; vel[iy] = vy; vel[iz] = vz;
      }
      L.geo.attributes.position.needsUpdate = true;
    }

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize); resize();

    let raf = null, paused = false;
    document.addEventListener("visibilitychange", () => {
      paused = document.hidden;
      if (!paused && raf === null) loop();
    });

    function loop() {
      if (paused) { raf = null; return; }
      raf = requestAnimationFrame(loop);
      // 视差
      near.group.position.x = -pointer.x * 42; near.group.position.y = pointer.y * 30;
      far.group.position.x = -pointer.x * 16; far.group.position.y = pointer.y * 12;
      camTargetW = (window.__camOn && !reduced) ? toWorld(pointer.x, pointer.y, 0) : null;
      for (let k = ripples.length - 1; k >= 0; k--) {
        ripples[k].r += 7;
        if (ripples[k].r > ripples[k].max) ripples.splice(k, 1);
      }
      updateLayer(near); updateLayer(far);
      renderer.render(scene, camera);
    }
    loop();

    return {
      collapse() { if (!reduced) collapsing = true; },
      expand() { collapsing = false; },
      recolor,
      setPointer(x, y) { pointer.x = x; pointer.y = y; },
      pulseRipple(x, y) { const w = toWorld(x, y, 0); ripples.push({ x: w.x, y: w.y, r: 0, max: 360, strength: 1.1 }); }
    };
  }
  window.__particles = initParticles();

  /* ============================================================
     本地示例数据
     ============================================================ */
  const TAROT = [
    ["愚者","启程","The Fool","Beginnings"], ["魔术师","创造","The Magician","Creation"], ["女祭司","直觉","The High Priestess","Intuition"], ["皇后","丰盈","The Empress","Abundance"], ["皇帝","秩序","The Emperor","Order"],
    ["教皇","传承","The Hierophant","Tradition"], ["恋人","抉择","The Lovers","Choice"], ["战车","意志","The Chariot","Will"], ["力量","内省","Strength","Inner Strength"], ["隐士","退省","The Hermit","Retreat"],
    ["命运之轮","转机","Wheel of Fortune","Turning Point"], ["正义","平衡","Justice","Balance"], ["倒吊人","转念","The Hanged Man","Reversal"], ["死神","结束","Death","Ending"], ["节制","调和","Temperance","Harmony"],
    ["恶魔","执念","The Devil","Obsession"], ["高塔","崩解","The Tower","Collapse"], ["星星","希望","The Star","Hope"], ["月亮","迷雾","The Moon","Illusion"], ["太阳","明朗","The Sun","Clarity"],
    ["审判","觉醒","Judgement","Awakening"], ["世界","圆满","The World","Fulfillment"]
  ];
  const POS = ["过去", "现在", "未来"];
  const POS_EN = ["Past", "Present", "Future"];
  function posName(i) { return lang === "en" ? (POS_EN[i] || POS[i]) : (POS[i] || POS_EN[i]); }
  function tarotName(i) { return lang === "en" ? TAROT[i][2] : TAROT[i][0]; }
  function tarotKw(i) { return lang === "en" ? TAROT[i][3] : TAROT[i][1]; }
  const GUA = ["乾","坤","屯","蒙","需","讼","师","比","小畜","履","泰","否","同人","大有","谦","豫",
    "随","蛊","临","观","噬嗑","贲","剥","复","无妄","大畜","颐","大过","坎","离","咸","恒",
    "遁","大壮","晋","明夷","家人","睽","蹇","解","损","益","夬","姤","萃","升","困","井",
    "革","鼎","震","艮","渐","归妹","丰","旅","巽","兑","涣","节","中孚","小过","既济","未济"];
  const GUA_FULL = ["乾为天","坤为地","水雷屯","山水蒙","水天需","天水讼","地水师","水地比",
    "风天小畜","天泽履","地天泰","天地否","天火同人","火天大有","地山谦","雷地豫",
    "泽雷随","山风蛊","地泽临","风地观","火雷噬嗑","山火贲","山地剥","地雷复",
    "天雷无妄","山天大畜","山雷颐","泽风大过","坎为水","离为火","泽山咸","雷风恒",
    "天山遁","雷天大壮","火地晋","地火明夷","风火家人","火泽睽","水山蹇","雷水解",
    "山泽损","风雷益","泽天夬","天风姤","泽地萃","地风升","泽水困","水风井",
    "泽火革","火风鼎","震为雷","艮为山","风山渐","雷泽归妹","雷火丰","火山旅",
    "巽为风","兑为泽","风水涣","水泽节","风泽中孚","雷山小过","水火既济","火水未济"];
  const GUA_FULL_EN = ["The Creative","The Receptive","Difficulty at the Beginning","Youthful Folly","Waiting","Conflict","The Army","Holding Together",
    "The Taming Power of the Small","Treading","Peace","Standstill","Fellowship","Possession in Great Measure","Modesty","Enthusiasm",
    "Following","Work on the Decayed","Approach","Contemplation","Biting Through","Grace","Splitting Apart","Return",
    "Innocence","The Taming Power of the Great","Nourishment","Preponderance of the Great","The Abysmal Water","The Clinging Fire","Influence","Duration",
    "Retreat","The Power of the Great","Progress","Darkening of the Light","The Family","Opposition","Obstruction","Deliverance",
    "Decrease","Increase","Breakthrough","Coming to Meet","Gathering Together","Pushing Upward","Oppression","The Well",
    "Revolution","The Cauldron","The Arousing Thunder","Keeping Still Mountain","Development","The Marrying Maiden","Abundance","The Wanderer",
    "The Gentle Wind","The Joyous Lake","Dispersion","Limitation","Inner Truth","Preponderance of the Small","After Completion","Before Completion"];
  function guaFullName(i) { return lang === "en" ? (GUA_FULL_EN[i] || GUA_FULL[i]) : (GUA_FULL[i] || GUA_FULL_EN[i]); }
  const NUMBER_SYMBOLS = ["星","月","潮","林","镜","焰","羽","石","桥","钟","雾","灯"];
  const NUMBER_SYMBOLS_EN = ["Star","Moon","Tide","Forest","Mirror","Flame","Feather","Stone","Bridge","Bell","Mist","Lantern"];
  const NUMBER_THEME = ["开始","沉淀","连接","生长","映照","热情","轻盈","稳固","过渡","节律","未知","微光"];
  const NUMBER_THEME_EN = ["Beginning","Stillness","Connection","Growth","Reflection","Passion","Lightness","Stability","Transition","Rhythm","Unknown","Glimmer"];
  function numSymbol(i) { return lang === "en" ? NUMBER_SYMBOLS_EN[i] : NUMBER_SYMBOLS[i]; }
  function numThemeStr(i) { return lang === "en" ? NUMBER_THEME_EN[i] : NUMBER_THEME[i]; }

  /* 二十八宿：七曜配兽（角木蛟 … 轸水蚓）。c=宿名 e=五行 b=守护兽 img=意象 adv=建议 */
  const MANSION = [
    { c:"角", e:"木", b:"蛟", img:"苍龙昂首，春光初动。", adv:"适合开启一件拖延已久的事。", ce:"Jiao", ee:"Wood", be:"Flood Dragon", imge:"Azure dragon lifts its head; spring light first stirs.", adve:"A good day to start something long delayed." },
    { c:"亢", e:"金", b:"龙", img:"金龙蓄势，过犹不及。", adv:"收敛锋芒，别把话说满。", ce:"Kang", ee:"Metal", be:"Dragon", imge:"Golden dragon gathers force; too much overshoots.", adve:"Rein in your edge; don't overpromise." },
    { c:"氐", e:"土", b:"貉", img:"土厚载物，根基渐稳。", adv:"把基础打牢，慢即是快。", ce:"Di", ee:"Earth", be:"Badger", imge:"Deep earth bears all; the foundation steadies.", adve:"Build the base solid; slow is fast." },
    { c:"房", e:"日", b:"兔", img:"玉兔东升，家宅安宁。", adv:"多陪家人，或整理居所。", ce:"Fang", ee:"Sun", be:"Rabbit", imge:"Jade rabbit rises east; home is at peace.", adve:"Spend time with family, or tidy your space." },
    { c:"心", e:"月", b:"狐", img:"月下灵狐，直觉敏锐。", adv:"相信第一感觉，别过度分析。", ce:"Xin", ee:"Moon", be:"Fox", imge:"Spirit fox under the moon; intuition is sharp.", adve:"Trust the first feeling; don't over-analyze." },
    { c:"尾", e:"火", b:"虎", img:"火虎摆尾，势头正盛。", adv:"借势推进，但留三分余地。", ce:"Wei", ee:"Fire", be:"Tiger", imge:"Fire tiger swishes its tail; momentum is high.", adve:"Ride the momentum, but leave room." },
    { c:"箕", e:"水", b:"豹", img:"水豹乘风，口舌生财。", adv:"适合沟通、表达、洽谈。", ce:"Ji", ee:"Water", be:"Leopard", imge:"Water leopard rides the wind; words bring gain.", adve:"Good for communication, expression, negotiation." },
    { c:"斗", e:"木", b:"獬", img:"木獬持衡，是非自明。", adv:"遇到争执，交给时间裁断。", ce:"Dou", ee:"Wood", be:"Unicorn", imge:"Wood unicorn holds the scales; right and wrong show clearly.", adve:"In a dispute, let time judge." },
    { c:"牛", e:"金", b:"牛", img:"金牛踏实，稳步前行。", adv:"重复的事做好，便是积累。", ce:"Niu", ee:"Metal", be:"Ox", imge:"Metal ox is steady; move forward step by step.", adve:"Do the repeated things well; that is accumulation." },
    { c:"女", e:"土", b:"蝠", img:"土蝠低飞，暗中小心。", adv:"留意细碎疏漏与身边小人。", ce:"Nyu", ee:"Earth", be:"Bat", imge:"Earth bat flies low; beware the small print.", adve:"Watch for small oversights and petty people nearby." },
    { c:"虚", e:"日", b:"鼠", img:"日鼠穿隙，虚处藏机。", adv:"留白往往比填满更有用。", ce:"Xu", ee:"Sun", be:"Rat", imge:"Sun rat slips through gaps; opportunity hides in emptiness.", adve:"Negative space is often more useful than filling all." },
    { c:"危", e:"月", b:"燕", img:"月燕临危，谨慎过关。", adv:"高风险动作今天先缓一缓。", ce:"Wei", ee:"Moon", be:"Swallow", imge:"Moon swallow meets danger; pass with care.", adve:"Ease off high-risk moves today." },
    { c:"室", e:"火", b:"猪", img:"火猪归舍，安顿身心。", adv:"给生活一处可以停下的角落。", ce:"Shi", ee:"Fire", be:"Pig", imge:"Fire pig returns home; settle body and mind.", adve:"Give life a corner where you can stop." },
    { c:"壁", e:"水", b:"貐", img:"水貐守垣，屏障自成。", adv:"设一道边界，保护你的专注。", ce:"Bi", ee:"Water", be:"Wolf", imge:"Water wolf guards the wall; a boundary forms itself.", adve:"Set a boundary to protect your focus." },
    { c:"奎", e:"木", b:"狼", img:"木狼啸野，才思涌动。", adv:"适合写作、创作与发散。", ce:"Kui", ee:"Wood", be:"Wolf", imge:"Wood wolf howls in the wild; ideas surge.", adve:"Good for writing, creating, brainstorming." },
    { c:"娄", e:"金", b:"狗", img:"金狗司守，忠信可托。", adv:"兑现一个对别人的承诺。", ce:"Lou", ee:"Metal", be:"Dog", imge:"Metal dog stands guard; loyalty can be trusted.", adve:"Honor a promise you made to someone." },
    { c:"胃", e:"土", b:"雉", img:"土雉啄食，蓄养待时。", adv:"默默积累，不必急于显形。", ce:"Wei", ee:"Earth", be:"Pheasant", imge:"Earth pheasant pecks; nourish and wait for the time.", adve:"Accumulate quietly; no need to show yet." },
    { c:"昴", e:"日", b:"鸡", img:"日鸡报晓，群聚生辉。", adv:"团队里你的一句话就能提气。", ce:"Mao", ee:"Sun", be:"Rooster", imge:"Sun rooster announces dawn; gathering shines.", adve:"In a team, one word from you lifts the mood." },
    { c:"毕", e:"月", b:"乌", img:"月乌敛翼，网罗渐收。", adv:"收尾比开头更见功夫。", ce:"Bi", ee:"Moon", be:"Crow", imge:"Moon crow folds wings; the net draws in.", adve:"Finishing shows more skill than starting." },
    { c:"觜", e:"火", b:"猴", img:"火猴攀枝，机变灵动。", adv:"遇到卡点，换个角度试试。", ce:"Zi", ee:"Fire", be:"Monkey", imge:"Fire monkey climbs; quick and nimble.", adve:"Stuck? Try a different angle." },
    { c:"参", e:"水", b:"猿", img:"水猿饮涧，三才并济。", adv:"平衡几方关系，莫偏废。", ce:"Shen", ee:"Water", be:"Ape", imge:"Water ape drinks from the stream; three forces balanced.", adve:"Balance several relationships; neglect none." },
    { c:"井", e:"木", b:"犴", img:"木犴汲泉，润物无声。", adv:"用耐心滋养一件长期的事。", ce:"Jing", ee:"Wood", be:"Mongoose", imge:"Wood mongoose draws spring; nourishes without sound.", adve:"Nourish a long-term thing with patience." },
    { c:"鬼", e:"金", b:"羊", img:"金羊入庙，幽微可察。", adv:"留意那些被忽略的信号。", ce:"Gui", ee:"Metal", be:"Goat", imge:"Metal goat enters the shrine; subtleties are seen.", adve:"Notice the signals others miss." },
    { c:"柳", e:"土", b:"獐", img:"土獐栖柳，柔韧随形。", adv:"以柔克刚，顺势而为。", ce:"Liu", ee:"Earth", be:"Antelope", imge:"Earth antelope rests by willow; bend and follow form.", adve:"Use softness to overcome; go with the flow." },
    { c:"星", e:"日", b:"马", img:"日马驰原，声名渐显。", adv:"适合展示成果、主动亮相。", ce:"Xing", ee:"Sun", be:"Horse", imge:"Sun horse gallops the plain; fame grows.", adve:"Show your results; step forward." },
    { c:"张", e:"月", b:"鹿", img:"月鹿衔花，开合有度。", adv:"懂得展开，也懂得收束。", ce:"Zhang", ee:"Moon", be:"Deer", imge:"Moon deer carries flowers; open and close in measure.", adve:"Know when to unfold and when to gather." },
    { c:"翼", e:"火", b:"蛇", img:"火蛇展翼，远举高飞。", adv:"把目光放远，谋划下一步。", ce:"Yi", ee:"Fire", be:"Snake", imge:"Fire snake spreads wings; soar high and far.", adve:"Look further ahead; plan the next step." },
    { c:"轸", e:"水", b:"蚓", img:"水蚓缠心，周而复始。", adv:"复盘一段循环，便能新生。", ce:"Zhen", ee:"Water", be:"Earthworm", imge:"Water worm coils the heart; cycles repeat.", adve:"Review a cycle, and you are reborn." }
  ];
  function mansionFull(m) { return lang === "en" ? (m.ce + " · " + m.be + " (" + m.ee + ")") : (m.c + m.e + m.b); }
  function mansionImg(m) { return lang === "en" ? m.imge : m.img; }
  function mansionAdv(m) { return lang === "en" ? m.adve : m.adv; }

  /* 北欧符文（古弗萨克 24 符文）。n=名 z=中文 g=字形 m=含义 a=提示 */
  const RUNE = [
    { n:"Fehu", z:"费胡", g:"ᚠ", m:"火与丰盛", a:"行动带来收获，今天值得为想要的东西迈一步。", me:"Fire & abundance", ae:"Action brings reward; worth a step toward what you want today." },
    { n:"Uruz", z:"乌鲁", g:"ᚢ", m:"原始之力", a:"你的生命力比想象中强，先动起来。", me:"Primal strength", ae:"Your vitality is stronger than you think; start moving." },
    { n:"Thurisaz", z:"瑟里", g:"ᚦ", m:"荆棘与界", a:"前方有阻力，谨慎比强冲更明智。", me:"Thorn & boundary", ae:"Resistance ahead; caution beats forcing." },
    { n:"Ansuz", z:"安苏", g:"ᚨ", m:"神谕之声", a:"一句话或一条讯息会点醒你，认真听。", me:"Voice of the gods", ae:"A word or message will wake you; listen well." },
    { n:"Raidho", z:"雷多", g:"ᚱ", m:"旅程与序", a:"定下节奏，路会自己展开。", me:"Journey & order", ae:"Set the rhythm; the road unfolds." },
    { n:"Kenaz", z:"肯纳", g:"ᚲ", m:"火把之光", a:"灵感将至，抓住那一瞬的明亮。", me:"Torch-light", ae:"Inspiration comes; catch that bright instant." },
    { n:"Gebo", z:"盖波", g:"ᚷ", m:"礼物之环", a:"关系里有来有往，主动给出。", me:"Gift-ring", ae:"In relationships, give and take; offer first." },
    { n:"Wunjo", z:"温约", g:"ᚹ", m:"喜悦和谐", a:"今天适合与让你放松的人在一起。", me:"Joy & harmony", ae:"Good day to be with those who relax you." },
    { n:"Hagalaz", z:"哈格拉", g:"ᚺ", m:"冰雹突变", a:"旧结构会裂，裂处正是新生。", me:"Hail & disruption", ae:"Old structure cracks; the break is new birth." },
    { n:"Naudiz", z:"瑙迪", g:"ᚾ", m:"必要之需", a:"受限之中藏着转机，别急。", me:"Need & constraint", ae:"Within limits hides a turning point; be patient." },
    { n:"Isa", z:"伊萨", g:"ᛁ", m:"静水之冰", a:"停一停，内省比前进更有用。", me:"Ice & stillness", ae:"Pause; introspection beats pushing forward." },
    { n:"Jera", z:"耶拉", g:"ᛃ", m:"年轮收获", a:"种下的会因时结果，耐心等。", me:"Year-wheel harvest", ae:"What's sown ripens in time; wait." },
    { n:"Eihwaz", z:"艾瓦", g:"ᛇ", m:"紫杉之韧", a:"撑住，连接此岸与彼岸。", me:"Yew & resilience", ae:"Hold; it bridges this shore and the far." },
    { n:"Perthro", z:"佩斯", g:"ᛈ", m:"命运之杯", a:"未知里藏惊喜，别急着揭开。", me:"Fate-cup", ae:"Surprise hides in the unknown; don't rush to open." },
    { n:"Algiz", z:"阿尔吉", g:"ᛉ", m:"守护之角", a:"警觉是你的护盾，相信直觉。", me:"Guardian-horn", ae:"Alertness is your shield; trust instinct." },
    { n:"Sowilo", z:"索维洛", g:"ᛋ", m:"太阳胜利", a:"光明一面终会胜出，坚持。", me:"Sun & victory", ae:"The bright side wins; persist." },
    { n:"Tiwaz", z:"提瓦", g:"ᛏ", m:"战神正义", a:"为认为对的事挺身，勇气到位。", me:"Tyr & justice", ae:"Stand for what's right; courage is here." },
    { n:"Berkano", z:"贝卡诺", g:"ᛒ", m:"白桦新生", a:"有种子要发芽，照料它。", me:"Birch & new life", ae:"A seed sprouts; tend it." },
    { n:"Ehwaz", z:"埃瓦", g:"ᛖ", m:"骏马同行", a:"合作能让你走得更远。", me:"Horse & partnership", ae:"Cooperation carries you farther." },
    { n:"Mannaz", z:"曼纳兹", g:"ᛗ", m:"人本之镜", a:"在关系里照见自己。", me:"Man & mirror", ae:"See yourself in relation." },
    { n:"Laguz", z:"拉古兹", g:"ᛚ", m:"流水直觉", a:"跟随感觉的流向，别硬拦。", me:"Water & intuition", ae:"Follow feeling's current; don't dam it." },
    { n:"Ingwaz", z:"英格", g:"ᛜ", m:"丰饶内守", a:"先完成内在的整合，再向外。", me:"Ing & inner wealth", ae:"Integrate within first, then outward." },
    { n:"Dagaz", z:"达格兹", g:"ᛞ", m:"白昼破晓", a:"转折就在眼前，天亮了。", me:"Dawn & breakthrough", ae:"The turn is at hand; day breaks." },
    { n:"Othala", z:"奥萨拉", g:"ᛟ", m:"根源传承", a:"回望来处，你会更清楚去处。", me:"Heritage & roots", ae:"Look back to where you're from; clarity on where to go." }
  ];
  function runeM(rr) { return lang === "en" ? rr.me : rr.m; }
  function runeA(rr) { return lang === "en" ? rr.ae : rr.a; }
  function runeCard(rr) { return lang === "en" ? rr.n : (rr.n + " · " + rr.z); }

  /* 寺观灵签。no=签号 level=等级 poem=四句诗 sol=签解 */
  const ORACLE = [
    { no:1, level:"上上", poem:["云开见月明","东风送好音","所谋皆遂意","行处遇知音"], sol:"诸事顺遂，宜把握时机主动推进。", levele:"Supreme", poeme:["Clouds part, the moon shines clear","East wind brings good news","All you plan comes true","Where you go, kindred appear"], sole:"Everything goes smoothly; seize the moment to push forward." },
    { no:2, level:"上吉", poem:["庭前喜鹊喧","旧愿得重圆","莫嫌步子慢","稳处自生莲"], sol:"慢中求稳，自有回甘。", levele:"Auspicious", poeme:["Magpie chirps before the court","Old wish rounds again","Mind not the slow step","From steadiness, lotus grows"], sole:"Slow yet steady; sweetness comes." },
    { no:3, level:"中吉", poem:["半岭云初散","清溪石上流","耐心过此渡","前路渐悠悠"], sol:"过一关便宽，别慌。", levele:"Fairly good", poeme:["Mist clears on the mid-slope","Clear stream over the stones","Patience past this crossing","The road eases ahead"], sole:"Clear one gate and it widens; don't panic." },
    { no:4, level:"中平", poem:["月满还亏缺","花开有落时","随缘莫强求","心安即相宜"], sol:"平常心最好，顺其自然。", levele:"Neutral", poeme:["Moon full then wanes","Flowers have their falling","Let be, don't force","A calm mind suits"], sole:"An even mind is best; let nature take its course." },
    { no:5, level:"中平", poem:["舟行浅水滨","莫急莫生嗔","待潮来早晚","自可过重津"], sol:"等风来，时机未到不必硬闯。", levele:"Neutral", poeme:["Boat drifts the shallow shore","No rush, no anger","Wait for the tide's hour","Cross the ford at ease"], sole:"Wait for the wind; don't force before the time." },
    { no:6, level:"下下", poem:["雾重路难分","独行慎夜昏","莫向险处去","守拙保其身"], sol:"宜守不宜进，先求安稳。", levele:"Inauspicious", poeme:["Fog thick, roads unclear","Walk alone, wary of night","Go not to danger","Keep humble, keep safe"], sole:"Hold, don't advance; first seek safety." },
    { no:7, level:"上吉", poem:["宝镜拂尘埃","久暗今重开","旧识还相顾","喜从意外来"], sol:"旧缘回暖，故人旧事有转机。", levele:"Auspicious", poeme:["Bright mirror wipes the dust","Long dark reopens now","Old acquaintance returns","Joy comes unexpected"], sole:"Old ties warm; past people and things turn." },
    { no:8, level:"中吉", poem:["春园一树花","半开半藏芽","待风传远信","不必苦思家"], sol:"好消息将至，不必挂心。", levele:"Fairly good", poeme:["A tree of blossoms in spring","Half open, half budding","Wait wind for distant news","No need to pine at home"], sole:"Good news approaches; don't worry." },
    { no:9, level:"上上", poem:["鹏翼搏长风","一举上苍穹","声名从此起","四海尽相通"], sol:"可图远大，宜高调亮相。", levele:"Supreme", poeme:["Peng spreads on the long wind","One lift to the high vault","Fame rises from here","All quarters connect"], sole:"Aim high; a bold showing fits." },
    { no:10, level:"中平", poem:["棋局半边残","落子且从宽","莫贪一步胜","全局自安安"], sol:"顾全大局，别争一时。", levele:"Neutral", poeme:["Half a board remains","Play wide, not tight","Crave not one win","The whole stays calm"], sole:"Mind the big picture; don't fight one moment." },
    { no:11, level:"下下", poem:["灯残夜未央","心事两茫茫","且把愁肠解","莫教累寸肠"], sol:"先安己心，郁结宜疏不宜积。", levele:"Inauspicious", poeme:["Lamp low, night not done","Hearts dim and lost","Unknot the worried gut","Don't let it weigh the heart"], sole:"First settle yourself; gloom is better loosened than kept." },
    { no:12, level:"上吉", poem:["灵泉石上生","涤尽旧时腥","一身轻似叶","何处不逍停"], sol:"放下即轻，宜断舍离。", levele:"Auspicious", poeme:["Spirit spring on the stone","Washes the old stain","Light as a leaf again","Where not at ease?"], sole:"Let go and lighten; good to release." },
    { no:13, level:"中吉", poem:["禾苗待雨匀","莫怨陇头贫","秋来仓廪实","笑语慰辛勤"], sol:"勤有厚报，耐心耕耘。", levele:"Fairly good", poeme:["Seedlings wait for even rain","Blame not the poor ridge","Autumn fills the barn","Laughter rewards the toil"], sole:"Diligence repays; tend patiently." },
    { no:14, level:"上上", poem:["星河落掌中","所愿尽相通","但行光明事","福自与时丰"], sol:"心光所至皆宜，行善得助。", levele:"Supreme", poeme:["Star-river in your palm","All wishes align","Walk the bright deeds","Fortune grows with the time"], sole:"Where your light reaches, all fits; good done finds aid." }
  ];
  function oracleLevel(s) { return lang === "en" ? s.levele : s.level; }
  function oraclePoem(s) { return lang === "en" ? s.poeme : s.poem; }
  function oracleSol(s) { return lang === "en" ? s.sole : s.sol; }

  /* ============================================================
     程序化牌面 / 牌背（对应提示词 P5：CanvasTexture 思路的 2D 实现，绕开图片版权）
     ============================================================ */
  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  // 用户输入转义，防止注入到 innerHTML
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  let BACK_URL = "";
  function buildBackURL() {
    const W = 240, H = 366;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    drawCardBack(c.getContext("2d"), W, H);
    BACK_URL = c.toDataURL();
    return BACK_URL;
  }
  function drawCardBack(ctx, W, H) {
    const pal = {
      bg1: cssVar("--bg-1") || "#0B0E1A", bg0: cssVar("--bg-0") || "#05060B",
      accent: cssVar("--accent") || "#7C8CFF", accent2: cssVar("--accent-2") || "#A970FF"
    };
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.bg1); g.addColorStop(1, pal.bg0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    ctx.strokeStyle = pal.accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
    for (let r = 16; r < H * 0.34; r += 18) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * H * 0.4, cy + Math.sin(a) * H * 0.4); ctx.stroke();
    }
    ctx.globalAlpha = 0.9; ctx.fillStyle = pal.accent2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
    ctx.shadowColor = pal.accent2; ctx.shadowBlur = 22;
    ctx.fillRect(-24, -24, 48, 48); ctx.restore();
    ctx.globalAlpha = 1; ctx.strokeStyle = pal.accent; ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, W - 16, H - 16);
    ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.strokeRect(14, 14, W - 28, H - 28);
    ctx.globalAlpha = 1;
  }

  const ROMAN = ["O","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV",
    "XV","XVI","XVII","XVIII","XIX","XX","XXI"];
  function drawStar(ctx, cx, cy, R, points, r2) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rad = (i % 2 ? r2 : R);
      const a = i / (points * 2) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fill();
  }
  function drawEmblem(ctx, cx, cy, r, idx, pal) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(idx * 0.21);
    ctx.strokeStyle = pal.accent; ctx.fillStyle = pal.accent2; ctx.lineWidth = 2;
    const sides = 3 + (idx % 6), petals = 4 + (idx % 6);
    ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = i / sides * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r * 0.8, y = Math.sin(a) * r * 0.8;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 0.42;
    for (let i = 0; i < petals; i++) {
      const a = i / petals * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
    }
    ctx.globalAlpha = 0.95; ctx.fillStyle = pal.accent2;
    drawStar(ctx, 0, 0, r * 0.3, 5, r * 0.55);
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function drawCardFace(ctx, W, H, idx, name) {
    const pal = {
      bg1: cssVar("--bg-1") || "#0B0E1A", bg0: cssVar("--bg-0") || "#05060B",
      t1: cssVar("--text-1") || "#E8ECFF", accent: cssVar("--accent") || "#7C8CFF",
      accent2: cssVar("--accent-2") || "#A970FF"
    };
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.bg1); g.addColorStop(1, pal.bg0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 3; ctx.strokeRect(8, 8, W - 16, H - 16);
    ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.strokeRect(14, 14, W - 28, H - 28); ctx.globalAlpha = 1;
    ctx.fillStyle = pal.t1; ctx.textAlign = "center";
    ctx.font = "500 16px Georgia, serif"; ctx.fillText(ROMAN[idx] || String(idx), W / 2, 34);
    drawEmblem(ctx, W / 2, H / 2 - 4, Math.min(W, H) * 0.3, idx, pal);
    ctx.fillStyle = pal.t1; ctx.font = "500 20px Georgia, 'Noto Serif SC', serif";
    ctx.fillText(name, W / 2, H - 22);
  }
  // 主题切换时重绘所有牌：牌背 + 已翻开的牌面
  function recolorCards() {
    buildBackURL();
    document.querySelectorAll(".mini").forEach(el => {
      el.style.backgroundImage = "url(" + BACK_URL + ")"; el.style.backgroundSize = "cover";
    });
    document.querySelectorAll(".tarot-card .back").forEach(el => {
      el.style.backgroundImage = "url(" + BACK_URL + ")"; el.style.backgroundSize = "cover";
    });
    document.querySelectorAll(".tarot-card .face canvas").forEach(cv => {
      drawCardFace(cv.getContext("2d"), cv.width, cv.height, +cv.dataset.idx, cv.dataset.name);
    });
    // 环形星盘牌面随主题重绘
    document.querySelectorAll(".dial-card canvas").forEach(cv => {
      const ti = +cv.dataset.idx;
      const big = document.createElement("canvas"); big.width = 240; big.height = 366;
      drawCardFace(big.getContext("2d"), 240, 366, ti, tarotName(ti));
      cv.getContext("2d").drawImage(big, 0, 0, cv.width, cv.height);
    });
    // 符文石随主题重绘
    document.querySelectorAll(".rune-stone").forEach(cv => {
      paintRuneStone(cv.getContext("2d"), +cv.dataset.idx);
    });
  }

  /* ============================================================
     议题识别（关键词匹配，无需模型）
     ============================================================ */
  const TOPIC_KEY = { love:"tLove", career:"tCareer", health:"tHealth", choice:"tChoice", relationship:"tRelation", other:"tOther" };
  function topicLabel(topic) { return t(TOPIC_KEY[topic] || "tOther"); }
  function detectTopic(q) {
    if (!q) return "other";
    const map = [
      { key:"love", words:["爱","恋","感情","喜欢","暗恋","桃花","对象","另一半","分手","复合","婚姻","表白","异地","暧昧","在一起"] },
      { key:"career", words:["工作","事业","职业","求职","面试","跳槽","升职","加薪","创业","公司","老板","同事","offer","项目","考公","考研","前程"] },
      { key:"health", words:["健康","身体","病","医院","睡眠","焦虑","压力","情绪","抑郁","养生","精神","心理","疲惫"] },
      { key:"choice", words:["选择","抉择","怎么选","要不要","该不该","决定","去哪","选哪个","犹豫","纠结","二选","两难","怎么办"] },
      { key:"relationship", words:["朋友","家人","父母","关系","矛盾","误会","和解","人际","室友","团队","同事"] }
    ];
    for (let i = 0; i < map.length; i++) if (map[i].words.some(w => q.indexOf(w) >= 0)) return map[i].key;
    return "other";
  }
  function topicTail(topic) {
    const map = { love:"tailLove", career:"tailCareer", health:"tailHealth", choice:"tailChoice", relationship:"tailRelation", other:"tailOther" };
    return t(map[topic] || "tailOther");
  }
  // 读取某模块屏里的提问框，并顺带识别议题
  function readQuestion(type) {
    const el = document.querySelector('[data-screen="' + type + '"] .ask-input');
    const q = el && el.value ? el.value.trim() : "";
    return { question: q, topic: detectTopic(q) };
  }

  /* ============================================================
     示例解读生成（mock）—— 接真实模型时整段替换
     ============================================================ */
  function mockReading(type, data) {
    let r;
    if (type === "tarot") {
      const readings = data.cards.map((c, i) => {
        const nm = tarotName(c.idx), kw = tarotKw(c.idx), pos = posName(i);
        const rev = c.orient === "逆";
        return {
          position: pos,
          card: nm + (rev ? (lang === "en" ? " (Rev)" : "（逆）") : ""),
          text: rev ? t("tarotRev", [nm, pos, kw]) : t("tarotUp", [nm, pos, kw])
        };
      });
      r = {
        tone: t("tarotTone"),
        readings,
        synthesis: t("tarotSynth"),
        actions: [t("tarotAct1"), t("tarotAct2"), t("tarotAct3")],
        closing: t("tarotClose")
      };
    }
    else if (type === "gua") {
      const baseName = guaFullName(data.guaIndex - 1);
      const changeName = guaFullName(data.changeIdx);
      r = {
        tone: t("guaTone", [baseName]),
        readings: [
          { position: t("lblBaseHex"), card: baseName, text: t("guaBase", [baseName, data.guaIndex]) },
          { position: t("lblChangeHex"), card: changeName, text: t("guaChange", [changeName]) }
        ],
        synthesis: t("guaSynth"),
        actions: [t("guaAct1"), t("guaAct2"), t("guaAct3")],
        closing: t("guaClose")
      };
    }
    // 二十八宿
    else if (type === "mansion") {
      const m = MANSION[data.idx];
      const full = mansionFull(m);
      r = {
        tone: t("manTone", [full]),
        readings: [
          { position: t("lblStar"), card: full, text: mansionImg(m) },
          { position: t("manGuardCard", [m.be]), card: t("manGuardCard", [m.be]), text: t("manGuardText", [m.be, mansionAdv(m)]) }
        ],
        synthesis: t("manSynth"),
        actions: [t("manAct1"), t("manAct2"), t("manAct3")],
        closing: t("manClose")
      };
    }
    // 北欧符文
    else if (type === "rune") {
      const readings = data.runes.map((ri, i) => {
        const rr = RUNE[ri];
        return {
          position: (lang === "en" ? "Rune " : "符文 ") + (i + 1),
          card: runeCard(rr),
          text: runeM(rr) + (lang === "en" ? ". " : "。") + runeA(rr)
        };
      });
      r = {
        tone: t("runeTone"),
        readings,
        synthesis: t("runeSynth"),
        actions: [t("runeAct1"), t("runeAct2"), t("runeAct3")],
        closing: t("runeClose")
      };
    }
    // 寺观灵签
    else if (type === "oracle") {
      const s = ORACLE[data.sign];
      r = {
        tone: t("oracleTone", [oracleLevel(s), s.no]),
        readings: [
          { position: t("lblVerse"), card: oracleLevel(s), text: oraclePoem(s).join(lang === "en" ? ", " : "，") + (lang === "en" ? "." : "。") },
          { position: t("oracleSolCard"), card: t("oracleSolCard"), text: oracleSol(s) }
        ],
        synthesis: t("oracleSynth"),
        actions: [t("oracleAct1"), t("oracleAct2"), t("oracleAct3")],
        closing: t("oracleClose")
      };
    }
    // number
    else {
      const symbol = numSymbol(data.symbolIdx), theme = numThemeStr(data.themeIdx);
      r = {
        tone: t("numTone", [data.raw, symbol]),
        readings: [
          { position: t("lblNum"), card: String(data.raw), text: t("numText", [theme]) }
        ],
        synthesis: t("numSynth"),
        actions: [t("numAct1"), t("numAct2"), t("numAct3")],
        closing: t("numClose")
      };
    }

    // 议题识别 + 提问回响：把用户的问题轻柔地接进综合段
    if (data && data.question) {
      r.question = data.question;
      r.questionTopic = topicLabel(data.topic);
      const tail = topicTail(data.topic);
      if (tail) r.synthesis = r.synthesis + (lang === "en" ? " " : " ") + tail;
    }
    return r;
  }

  /* ============================================================
     渲染解读
     ============================================================ */
  const readingBody = document.getElementById("readingBody");
  const vortex = document.getElementById("vortex");
  const readingTitle = document.getElementById("readingTitle");
  const readingTools = document.getElementById("readingTools");
  const readingSpeak = document.getElementById("readingSpeak");
  const readingExport = document.getElementById("readingExport");
  let currentReading = null;        // { type, data, r } —— 供朗读 / 导出复用
  let currentReadingText = "";      // 纯文本，供语音朗读
  function renderReading(r) {
    let html = "";
    let text = "";
    const sep = lang === "en" ? ". " : "。";
    const listSep = lang === "en" ? "; " : "；";
    if (r.question) {
      html += '<div class="ask-echo"><span class="ask-echo-tag">' + t("lblYouAsk") + (r.questionTopic || t("tOther")) + '</span>' +
        '<span class="ask-echo-q">' + esc(r.question) + '</span></div>';
      text += t("lblYouAskSpeech") + r.question + sep;
    }
    html += '<div class="tone">' + r.tone + "</div>";
    text += r.tone + sep;
    r.readings.forEach(rr => {
      html += '<div class="r-card"><div class="pos">' + rr.position + '</div>' +
        '<div class="cname">' + rr.card + '</div><div class="txt">' + rr.text + "</div></div>";
      text += rr.position + (lang === "en" ? ", " : "，") + rr.card + sep + rr.text + " ";
    });
    html += '<div class="synthesis"><div class="block-title">' + t("lblSynthesis") + '</div>' + r.synthesis + "</div>";
    text += t("lblSynthesis") + (lang === "en" ? ": " : "：") + r.synthesis + " ";
    html += '<div class="actions-list"><div class="block-title">' + t("lblActions") + '</div><ul>';
    r.actions.forEach(a => html += "<li>" + a + "</li>");
    html += "</ul></div>";
    if (r.actions && r.actions.length) text += t("lblActions") + (lang === "en" ? ": " : "：") + r.actions.join(listSep) + sep;
    html += '<div class="closing">' + r.closing + "</div>";
    html += '<div class="disclaimer">' + t("disclaimer") + "</div>";
    readingBody.innerHTML = html;
    currentReadingText = text + r.closing;
    if (readingTools) readingTools.hidden = false;
  }
  function showReading(type, data) {
    readingTitle.textContent = t(
      type === "tarot" ? "rdTarot" : type === "gua" ? "rdGua" : type === "mansion" ? "rdMansion"
      : type === "rune" ? "rdRune" : type === "oracle" ? "rdOracle" : "rdNumber"
    );
    switchScreen("reading");
    vortex.classList.remove("hide");
    readingBody.innerHTML = "";
    if (readingTools) readingTools.hidden = true;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (soundOn) ensureAudio();                 // 在点击手势内预热音频上下文
    const wait = reduced ? 220 : 950;
    playRevealVeil();
    bgmReveal();                                 // BGM 切到「揭晓」片刻，再回到 ambient
    setTimeout(() => {
      const r = mockReading(type, data);
      currentReading = { type, data, r };
      vortex.classList.add("hide");
      renderReading(r);
      playChime();
    }, wait);
  }

  /* ---------------- 朗读（Web Speech API） ---------------- */
  function initReadingSpeak() {
    if (!readingSpeak) return;
    readingSpeak.addEventListener("click", () => {
      if (!("speechSynthesis" in window)) { alert(t("noSpeech")); return; }
      if (readingSpeak.dataset.on === "1") {
        window.speechSynthesis.cancel();
        readingSpeak.dataset.on = "0"; readingSpeak.textContent = t("speakPlay");
        return;
      }
      if (!currentReadingText) return;
      const u = new SpeechSynthesisUtterance(currentReadingText);
      u.lang = lang === "en" ? "en-US" : "zh-CN"; u.rate = 0.96; u.pitch = 1.0;
      u.onend = () => { readingSpeak.dataset.on = "0"; readingSpeak.textContent = t("speakPlay"); };
      u.onerror = u.onend;
      readingSpeak.dataset.on = "1"; readingSpeak.textContent = t("speakStop");
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  }

  /* ---------------- 导出星图（合成海报 PNG） ---------------- */
  function wrapText(ctx, text, x, y, maxW, lineH) {
    const chars = text.split("");
    let line = "", yy = y;
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, yy); line = chars[i]; yy += lineH;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, yy);
    return yy + lineH;
  }
  function wrapTextCenter(ctx, text, cx, y, maxW, lineH) {
    const chars = text.split("");
    let line = "", yy = y;
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, cx, yy); line = chars[i]; yy += lineH; }
      else line = test;
    }
    if (line) ctx.fillText(line, cx, yy);
    return yy + lineH;
  }
  function exportStarMap() {
    if (!currentReading) return;
    const W = 1080, H = 1350;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    const pal = {
      bg0: cssVar("--bg-0") || "#05060B", bg1: cssVar("--bg-1") || "#0B0E1A",
      t1: cssVar("--text-1") || "#E8ECFF", t2: cssVar("--text-2") || "#A8B0D0",
      t3: cssVar("--text-3") || "#6B7290",
      accent: cssVar("--accent") || "#7C8CFF", accent2: cssVar("--accent-2") || "#A970FF"
    };
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.bg1); g.addColorStop(1, pal.bg0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // 星尘粒子
    ctx.save();
    for (let i = 0; i < 280; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = Math.random() * 1.9;
      ctx.globalAlpha = 0.12 + Math.random() * 0.5;
      ctx.fillStyle = Math.random() < 0.5 ? pal.accent : pal.accent2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // 标题
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = pal.t1; ctx.font = "500 72px Georgia, 'Noto Serif SC', serif";
    ctx.shadowColor = pal.accent; ctx.shadowBlur = 30;
    ctx.fillText(t("expBrand"), W / 2, 140);
    ctx.shadowBlur = 0;
    ctx.fillStyle = pal.accent2; ctx.font = "500 38px 'Noto Serif SC', serif";
    const title = t(
      currentReading.type === "tarot" ? "rdTarot" : currentReading.type === "gua" ? "rdGua" : currentReading.type === "mansion" ? "rdMansion"
      : currentReading.type === "rune" ? "rdRune" : currentReading.type === "oracle" ? "rdOracle" : "rdNumber"
    );
    ctx.fillText(title, W / 2, 210);

    // 中央星印
    ctx.save();
    ctx.translate(W / 2, 360);
    ctx.shadowColor = pal.accent; ctx.shadowBlur = 26; ctx.fillStyle = pal.accent;
    drawStar(ctx, 0, 0, 70, 5, 30);
    ctx.shadowBlur = 0; ctx.fillStyle = pal.accent2; ctx.globalAlpha = 0.85;
    drawStar(ctx, 0, 0, 30, 5, 13);
    ctx.restore();

    // 顶部结果摘要
    const { type, data, r } = currentReading;
    let highlight = "";
    if (type === "tarot") highlight = data.cards.map(c => tarotName(c.idx) + (c.orient === "逆" ? (lang === "en" ? " (Rev)" : "（逆）") : "")).join("  ·  ");
    else if (type === "gua") highlight = guaFullName(data.guaIndex - 1) + "  →  " + guaFullName(data.changeIdx);
    else if (type === "mansion") highlight = mansionFull(MANSION[data.idx]);
    else if (type === "rune") highlight = data.runes.map(ri => runeCard(RUNE[ri])).join("  ·  ");
    else if (type === "oracle") highlight = (lang === "en" ? "Lot " : "第 ") + ORACLE[data.sign].no + (lang === "en" ? " · " : " 签 · ") + oracleLevel(ORACLE[data.sign]);
    else highlight = data.raw + "  →  " + numSymbol(data.symbolIdx) + " " + numThemeStr(data.themeIdx);
    ctx.textAlign = "center"; ctx.fillStyle = pal.t1; ctx.font = "500 40px 'Noto Serif SC', serif";
    ctx.fillText(highlight, W / 2, 520);

    // 正文
    let y = 600;
    const maxW = W - 160;
    ctx.textAlign = "left";
    // 基调
    ctx.fillStyle = pal.accent; ctx.font = "500 38px 'Noto Serif SC', serif";
    const q = lang === "en" ? "“" : "「";
    y = wrapText(ctx, q + r.tone + q, 80, y, maxW, 50) + 16;
    // 各卡 / 综合
    ctx.fillStyle = pal.t2; ctx.font = "400 30px 'Noto Sans SC', sans-serif";
    r.readings.forEach(rr => {
      ctx.fillStyle = pal.accent2; ctx.font = "500 32px 'Noto Serif SC', serif";
      y = wrapText(ctx, rr.position + " · " + rr.card, 80, y, maxW, 42) + 6;
      ctx.fillStyle = pal.t2; ctx.font = "400 28px 'Noto Sans SC', sans-serif";
      y = wrapText(ctx, rr.text, 80, y, maxW, 40) + 18;
    });
    ctx.fillStyle = pal.accent2; ctx.font = "500 32px 'Noto Serif SC', serif";
    y = wrapText(ctx, t("expSynthesis"), 80, y, maxW, 42) + 6;
    ctx.fillStyle = pal.t2; ctx.font = "400 28px 'Noto Sans SC', sans-serif";
    y = wrapText(ctx, r.synthesis, 80, y, maxW, 40) + 18;
    if (r.actions && r.actions.length) {
      ctx.fillStyle = pal.accent2; ctx.font = "500 32px 'Noto Serif SC', serif";
      y = wrapText(ctx, t("expActions"), 80, y, maxW, 42) + 6;
      ctx.fillStyle = pal.t2; ctx.font = "400 28px 'Noto Sans SC', sans-serif";
      r.actions.forEach(a => { y = wrapText(ctx, "· " + a, 100, y, maxW - 20, 40) + 8; });
    }

    // 脚注 + 时间
    ctx.textAlign = "center"; ctx.fillStyle = pal.t3; ctx.font = "400 22px 'Noto Sans SC', sans-serif";
    const ts = new Date().toLocaleString(lang === "en" ? "en-US" : "zh-CN", { hour12: false });
    ctx.fillText(t("expFooter") + ts, W / 2, H - 56);

    // 下载
    try {
      const url = c.toDataURL("image/png");
      const a = document.createElement("a");
      const fname = "astra-" + (type) + "-" + Date.now() + ".png";
      a.href = url; a.download = fname;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { alert("导出失败：" + (e && e.message ? e.message : e)); }
  }
  function initReadingExport() {
    if (readingExport) readingExport.addEventListener("click", exportStarMap);
  }
  initReadingSpeak();
  initReadingExport();

  /* ============================================================
     揭晓仪式感：星尘聚拢动画 + 可选轻音（Web Audio）
     - 轻音默认关闭，由顶部「轻音」按钮开启；首次开启在用户手势内建 AudioContext
     - 揭晓动画在 showReading 时播放，reduced 动效下只做极短淡入
     ============================================================ */
  const revealVeil = document.getElementById("revealVeil");
  const rvc = revealVeil ? revealVeil.getContext("2d") : null;
  let soundOn = false;
  const soundToggle = document.getElementById("soundToggle");
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try { const AC = window.AudioContext || window.webkitAudioContext; audioCtx = new AC(); } catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }
  function playChime() {
    const ac = ensureAudio(); if (!ac || !soundOn) return;
    const now = ac.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {     // 柔和的大三和弦（C5-E5-G5）
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.value = f;
      const t = now + i * 0.11;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + 1.6);
    });
  }
  function playRevealVeil() {
    if (!rvc) return;
    if (reduced) { revealVeil.classList.add("show"); setTimeout(() => revealVeil.classList.remove("show"), 220); return; }
    const W = revealVeil.width = window.innerWidth;
    const H = revealVeil.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const N = 150;
    const parts = [];
    for (let i = 0; i < N; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.max(W, H) * 0.55 + Math.random() * 260;
      parts.push({ x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad, r: 1 + Math.random() * 2.6, a: Math.random() });
    }
    const dur = 900, started = performance.now();
    revealVeil.classList.add("show");
    function frame(t) {
      const k = Math.min(1, (t - started) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      rvc.clearRect(0, 0, W, H);
      const accent = cssVar("--accent") || "#7C8CFF";
      const accent2 = cssVar("--accent-2") || "#A970FF";
      parts.forEach(p => {
        const x = p.x + (cx - p.x) * ease;
        const y = p.y + (cy - p.y) * ease;
        const fade = k < 0.78 ? 1 : (1 - (k - 0.78) / 0.22);
        rvc.globalAlpha = fade * (0.45 + 0.55 * p.a);
        rvc.fillStyle = p.a > 0.5 ? accent : accent2;
        rvc.beginPath(); rvc.arc(x, y, p.r, 0, Math.PI * 2); rvc.fill();
      });
      if (k > 0.55) {                       // 中心星印爆开
        const f2 = (k - 0.55) / 0.45;
        rvc.globalAlpha = f2 * 0.85;
        rvc.fillStyle = accent2;
        drawStar(rvc, cx, cy, 8 + f2 * 46, 5, 18 + f2 * 70);
      }
      rvc.globalAlpha = 1;
      if (k < 1) requestAnimationFrame(frame);
      else { rvc.clearRect(0, 0, W, H); revealVeil.classList.remove("show"); }
    }
    requestAnimationFrame(frame);
  }
  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      soundOn = !soundOn;
      ensureAudio();                         // 在用户手势内创建/恢复 AudioContext
      soundToggle.textContent = soundOn ? t("soundOn") : t("soundOff");
      soundToggle.classList.toggle("is-on", soundOn);
    });
  }

  /* ============================================================
     背景音乐（BGM）：Web Audio 合成轻柔氛围 pad（项目不附带音频文件）
     - 默认开启，在用户首次点击手势内启动（满足自动播放策略）
     - 揭晓结果时切到「reveal」片刻（更亮 + 高音铃光），随后回到 ambient
     ============================================================ */
  let bgmOn = true, bgmStarted = false;
  let bgmOsc = [], bgmGain = null, bgmFilter = null, bgmLfo = null, bgmTimer = null;
  const BGM_CHORDS = [
    [130.81, 196.00, 261.63],   // C3 G3 C4
    [146.83, 220.00, 293.66],   // D3 A3 D4
    [174.61, 261.63, 349.23],   // F3 C4 F4
    [164.81, 246.94, 329.63]    // E3 B3 E4
  ];
  function startBgm() {
    const ac = ensureAudio();
    if (!ac || bgmStarted) return;
    bgmStarted = true;
    bgmGain = ac.createGain(); bgmGain.gain.value = 0.0001;
    bgmGain.gain.linearRampToValueAtTime(0.08, ac.currentTime + 2.4);
    bgmFilter = ac.createBiquadFilter(); bgmFilter.type = "lowpass"; bgmFilter.frequency.value = 720; bgmFilter.Q.value = 0.6;
    bgmFilter.connect(bgmGain); bgmGain.connect(ac.destination);
    bgmLfo = ac.createOscillator(); const lfoGain = ac.createGain();
    bgmLfo.frequency.value = 0.05; lfoGain.gain.value = 240;
    bgmLfo.connect(lfoGain); lfoGain.connect(bgmFilter.frequency); bgmLfo.start();
    const ch = BGM_CHORDS[0];
    for (let i = 0; i < 3; i++) {
      const o = ac.createOscillator(); o.type = i === 0 ? "sine" : "triangle"; o.frequency.value = ch[i];
      const g = ac.createGain(); g.gain.value = i === 0 ? 0.5 : 0.32;
      o.connect(g); g.connect(bgmFilter); o.start(); bgmOsc.push({ o, g });
    }
    scheduleBgmChord();
  }
  function scheduleBgmChord() {
    if (!bgmStarted) return;
    clearTimeout(bgmTimer);
    bgmTimer = setTimeout(() => {
      if (!bgmOn || !bgmStarted || !audioCtx) return;
      const ch = BGM_CHORDS[Math.floor(Math.random() * BGM_CHORDS.length)];
      const now = audioCtx.currentTime;
      bgmOsc.forEach((n, i) => { n.o.frequency.linearRampToValueAtTime(ch[i], now + 4); });
      scheduleBgmChord();
    }, 12000);
  }
  function setBgmScene(scene) {
    if (!bgmStarted || !bgmOn || !audioCtx) return;
    const ac = audioCtx;
    if (scene === "reveal") {
      bgmGain.gain.cancelScheduledValues(ac.currentTime);
      bgmGain.gain.setTargetAtTime(0.16, ac.currentTime, 0.4);
      const bell = ac.createOscillator(), bg = ac.createGain();
      bell.type = "sine"; bell.frequency.value = 1046.5;   // C6 铃光
      bg.gain.setValueAtTime(0.0001, ac.currentTime);
      bg.gain.linearRampToValueAtTime(0.06, ac.currentTime + 0.05);
      bg.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 3.0);
      bell.connect(bg); bg.connect(bgmGain); bell.start(); bell.stop(ac.currentTime + 3.2);
      setTimeout(() => setBgmScene("ambient"), 4200);
    } else {
      bgmGain.gain.setTargetAtTime(0.08, ac.currentTime, 1.2);
    }
  }
  function bgmReveal() { if (bgmOn) setBgmScene("reveal"); }
  function stopBgm() {
    if (!bgmStarted) { bgmOn = false; return; }
    const ac = audioCtx;
    if (ac && bgmGain) bgmGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.4);
    bgmOn = false;
    setTimeout(() => {
      bgmOsc.forEach(n => { try { n.o.stop(); } catch (e) {} });
      bgmOsc = []; bgmStarted = false; clearTimeout(bgmTimer);
      if (bgmLfo) { try { bgmLfo.stop(); } catch (e) {} bgmLfo = null; }
    }, 800);
  }
  // 首次用户手势内启动 BGM（满足浏览器自动播放策略）
  document.addEventListener("pointerdown", () => { if (bgmOn && !bgmStarted) startBgm(); }, { passive: true });

  if (bgmToggle) {
    bgmToggle.addEventListener("click", () => {
      bgmOn = !bgmOn;
      if (bgmOn) {
        ensureAudio();
        startBgm();
        if (bgmGain && audioCtx) bgmGain.gain.setTargetAtTime(0.08, audioCtx.currentTime, 0.4);
        bgmToggle.textContent = t("bgmOn");
      } else {
        stopBgm();
        bgmToggle.textContent = t("bgmOff");
      }
      bgmToggle.classList.toggle("is-on", bgmOn);
    });
  }
  if (langToggle) {
    langToggle.addEventListener("click", () => setLang(lang === "zh" ? "en" : "zh"));
  }

  // 语言切换时刷新当前屏的动态文案（静态部分由 applyLang 处理）
  function refreshDynamicLang() {
    const scr = state.screen;
    if (scr === "tarot") {
      if (tarotHint) tarotHint.textContent = tarotPicks.length === 3 ? t("tarotPicked3") : (tarotPicks.length ? t("tarotPickedN", [tarotPicks.length]) : t("tarotHintIdle"));
      if (dialCards.length) updateFocus();
      recolorCards();                 // 牌面重绘（牌名随语言变化）
    } else if (scr === "rune") {
      recolorCards();                 // 符石文字随语言变化
    } else if (scr === "gua") {
      if (guaHint && guaLines.length === 0) guaHint.textContent = t("guaHintIdle");
    } else if (scr === "mansion") {
      if (mNodes.length) updateMFocus();
      if (mansionHint && mChosen === null) mansionHint.textContent = t("mansionHintIdle");
    } else if (scr === "reading" && currentReading) {
      renderReading(currentReading.r);
      if (readingTitle) readingTitle.textContent = t(
        currentReading.type === "tarot" ? "rdTarot" : currentReading.type === "gua" ? "rdGua" : currentReading.type === "mansion" ? "rdMansion"
        : currentReading.type === "rune" ? "rdRune" : currentReading.type === "oracle" ? "rdOracle" : "rdNumber"
      );
    }
  }

  /* ============================================================
     塔罗模块（环形星盘）
     - 22 张主牌绕一圈排成可旋转星盘；
     - 顶部「选牌口」对准的牌即当前焦点（高亮 + 中心显示牌名）；
     - 鼠标拖动旋转；点击任意牌 / 点击选牌口 / 握拳手势 → 取该牌；
     - 取三张落入 过去 / 现在 / 未来。
     ============================================================ */
  buildBackURL();
  const dialWrap = document.getElementById("tarotDialWrap");
  const tarotDial = document.getElementById("tarotDial");
  const dialSelector = document.getElementById("dialSelector");
  const dialCenter = document.getElementById("dialCenter");
  const slots = document.getElementById("tarotSlots");
  const tarotReveal = document.getElementById("tarotReveal");
  const tarotShuffle = document.getElementById("tarotShuffle");
  const tarotHint = document.getElementById("tarotHint");
  const TAROT_COUNT = TAROT.length;            // 22 张主牌
  const DIAL_STEP = 360 / TAROT_COUNT;
  const DIAL_R = 130;
  let dialOrder = [];                          // dialOrder[i] = 第 i 个位置对应的 TAROT 索引
  let dialCards = [];                          // { el, inner, cv, idx, used }
  let tarotPicks = [];
  let dialAngle = 0, focusedIndex = 0;
  let dragging = false, dragStartX = 0, dragStartAngle = 0;

  function resetTarot() {
    slots.innerHTML = ""; tarotPicks = [];
    tarotReveal.disabled = true;
    if (!dialCards.length) buildDial();
    else { dialCards.forEach(c => c.used = false); syncDialUsed(); }
    if (tarotHint) tarotHint.textContent = t("tarotHintIdle");
  }

  function buildDial() {
    tarotDial.innerHTML = ""; dialCards = [];
    dialOrder = Array.from({ length: TAROT_COUNT }, (_, i) => i);
    for (let i = dialOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = dialOrder[i]; dialOrder[i] = dialOrder[j]; dialOrder[j] = t;
    }
    for (let i = 0; i < TAROT_COUNT; i++) {
      const ti = dialOrder[i];
      const card = document.createElement("div");
      card.className = "dial-card";
      card.style.transform = "rotate(" + (i * DIAL_STEP) + "deg) translateY(-" + DIAL_R + "px)";
      const inner = document.createElement("div");
      inner.className = "dial-card-inner";
      const cv = document.createElement("canvas");
      cv.width = 58; cv.height = 88; cv.dataset.idx = ti;
      // 复用主牌面绘制（离屏大图缩放，保证视觉一致）
      const big = document.createElement("canvas"); big.width = 240; big.height = 366;
      drawCardFace(big.getContext("2d"), 240, 366, ti, tarotName(ti));
      cv.getContext("2d").drawImage(big, 0, 0, 58, 88);
      inner.appendChild(cv);
      card.appendChild(inner);
      card.addEventListener("click", () => pickCardByIndex(i));
      tarotDial.appendChild(card);
      dialCards.push({ el: card, inner, cv, idx: ti, used: false });
    }
    setDialAngle(0);
  }

  function setDialAngle(a) {
    dialAngle = a;
    tarotDial.style.transform = "rotate(" + a + "deg)";
    let f = Math.round(-a / DIAL_STEP) % TAROT_COUNT;
    if (f < 0) f += TAROT_COUNT;
    if (f !== focusedIndex) { focusedIndex = f; updateFocus(); }
  }
  function updateFocus() {
    dialCards.forEach((c, i) => c.el.classList.toggle("focus", i === focusedIndex));
    const ti = dialCards[focusedIndex] ? dialCards[focusedIndex].idx : 0;
    dialCenter.textContent = tarotName(ti);
  }
  function syncDialUsed() {
    dialCards.forEach(c => c.el.classList.toggle("used", c.used));
  }
  function pickCardByIndex(i) {
    const c = dialCards[i];
    if (!c || c.used || tarotPicks.length >= 3) return;
    c.used = true; syncDialUsed();
    const ti = c.idx;
    const orient = Math.random() < 0.22 ? "逆" : "正";
    tarotPicks.push({ idx: ti, name: TAROT[ti][0], orient });
    placeInSlot(tarotPicks.length - 1, ti, orient);
    if (window.__particles) window.__particles.collapse();
    setTimeout(() => { if (window.__particles) window.__particles.expand(); }, 200);
    if (tarotPicks.length === 3) {
      if (tarotHint) tarotHint.textContent = t("tarotPicked3");
      tarotReveal.disabled = false;
    } else {
      if (tarotHint) tarotHint.textContent = t("tarotPickedN", [tarotPicks.length]);
    }
  }
  function confirmPick() { pickCardByIndex(focusedIndex); }   // 供手势 / 选牌口调用
  function placeInSlot(slot, ti, orient) {
    const card = document.createElement("div");
    card.className = "tarot-card";
    const back = document.createElement("div");
    back.className = "back";
    back.style.backgroundImage = "url(" + BACK_URL + ")"; back.style.backgroundSize = "cover";
    const face = document.createElement("div");
    face.className = "face";
    const cv = document.createElement("canvas");
    cv.width = 240; cv.height = 366;
    cv.dataset.idx = ti; cv.dataset.name = tarotName(ti);
    drawCardFace(cv.getContext("2d"), 240, 366, ti, tarotName(ti));
    face.appendChild(cv);
    const meta = document.createElement("div");
    meta.className = "face-meta";
    meta.innerHTML = '<div class="pos">' + posName(slot) + '</div>' +
      '<div class="orient">' + (orient === "逆" ? t("orientRev") : t("orientUp")) + "</div>";
    face.appendChild(meta);
    card.appendChild(back); card.appendChild(face);
    slots.appendChild(card);
    setTimeout(() => card.classList.add("flip"), 260);
  }

  // 拖动旋转
  dialWrap.addEventListener("pointerdown", e => { dragging = true; dragStartX = e.clientX; dragStartAngle = dialAngle; });
  dialWrap.addEventListener("pointermove", e => { if (dragging) setDialAngle(dragStartAngle + (e.clientX - dragStartX) * 0.6); });
  const endDrag = () => { if (!dragging) return; dragging = false; setDialAngle(Math.round(dialAngle / DIAL_STEP) * DIAL_STEP); };
  dialWrap.addEventListener("pointerup", endDrag);
  dialWrap.addEventListener("pointercancel", endDrag);
  dialSelector.addEventListener("click", confirmPick);

  tarotShuffle.addEventListener("click", () => {
    slots.innerHTML = ""; tarotPicks = []; tarotReveal.disabled = true;
    buildDial();
    if (tarotHint) tarotHint.textContent = t("tarotHintIdle");
  });
  tarotReveal.addEventListener("click", () => {
    if (tarotPicks.length !== 3) return;
    showReading("tarot", { cards: tarotPicks });
  });

  /* ============================================================
     六爻模块 · 起卦法阵
     ============================================================ */
  const hexWrap = document.getElementById("hexWrap");
  const guaToss = document.getElementById("guaToss");
  const guaReveal = document.getElementById("guaReveal");
  const guaStage = document.getElementById("guaStage");
  const guaArray = document.getElementById("guaArray");
  const guaName = document.getElementById("guaName");
  const guaHint = document.getElementById("guaHint");
  const gctx = guaArray ? guaArray.getContext("2d") : null;
  let guaLines = [];
  const guaAnim = { active: false, angle: 0, locked: false, lines: [], raf: null };

  function drawGuaArray() {
    if (!gctx) return;
    const W = 360, H = 360, cx = W / 2, cy = H / 2;
    gctx.clearRect(0, 0, W, H);
    const rgb = cssVar("--accent-rgb") || "124,140,255";
    const accent = cssVar("--accent") || "#7C8CFF";
    const accent2 = cssVar("--accent-2") || "#A970FF";
    gctx.save();
    gctx.translate(cx, cy);
    // 三层法阵环
    gctx.strokeStyle = "rgba(" + rgb + ",0.5)"; gctx.lineWidth = 1.5;
    [150, 120, 92].forEach(r => { gctx.beginPath(); gctx.arc(0, 0, r, 0, Math.PI * 2); gctx.stroke(); });
    // 外环刻度（缓慢旋转）
    gctx.save(); gctx.rotate(guaAnim.angle * 0.6);
    gctx.strokeStyle = "rgba(" + rgb + ",0.7)"; gctx.lineWidth = 1;
    const N = 36;
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2;
      const r1 = 132, r2 = i % 3 === 0 ? 150 : 142;
      gctx.beginPath();
      gctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      gctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      gctx.stroke();
    }
    gctx.restore();
    // 内圈符点（反向旋转）
    gctx.save(); gctx.rotate(-guaAnim.angle * 1.4);
    gctx.strokeStyle = accent2; gctx.globalAlpha = 0.6; gctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      gctx.beginPath(); gctx.arc(Math.cos(a) * 70, Math.sin(a) * 70, 6, 0, Math.PI * 2); gctx.stroke();
    }
    gctx.restore();
    // 已掷爻：在中环点亮节点
    gctx.globalAlpha = 1;
    guaAnim.lines.forEach((v, i) => {
      const a = -Math.PI / 2 + i / 6 * Math.PI * 2;
      const yang = (v === 7 || v === 9);
      gctx.fillStyle = yang ? accent : accent2;
      gctx.shadowColor = yang ? accent : accent2; gctx.shadowBlur = 14;
      gctx.beginPath(); gctx.arc(Math.cos(a) * 104, Math.sin(a) * 104, 6, 0, Math.PI * 2); gctx.fill();
    });
    gctx.shadowBlur = 0;
    // 锁定：中心辉光核
    if (guaAnim.locked) {
      gctx.shadowColor = accent; gctx.shadowBlur = 30; gctx.fillStyle = "rgba(" + rgb + ",0.95)";
      gctx.beginPath(); gctx.arc(0, 0, 9, 0, Math.PI * 2); gctx.fill(); gctx.shadowBlur = 0;
    }
    gctx.restore();
  }
  function startGuaAnim() {
    if (reduced) { drawGuaArray(); return; }
    if (guaAnim.raf) cancelAnimationFrame(guaAnim.raf);
    guaAnim.active = true;
    const loop = () => {
      if (!guaAnim.active) return;
      guaAnim.angle += guaAnim.locked ? 0.002 : 0.013;
      drawGuaArray();
      guaAnim.raf = requestAnimationFrame(loop);
    };
    loop();
  }
  function stopGuaAnim() {
    guaAnim.active = false;
    if (guaAnim.raf) cancelAnimationFrame(guaAnim.raf);
    guaAnim.raf = null;
  }
  function guaName_html(base, change) {
    const b = guaFullName(base), c = guaFullName(change);
    return b + " <small>" + t("hexInfo", [base + 1, c]) + "</small>";
  }
  function resetGua() {
    hexWrap.innerHTML = ""; guaLines = []; guaReveal.disabled = true;
    guaAnim.locked = false; guaAnim.lines = []; guaAnim.angle = 0;
    if (guaName) guaName.innerHTML = "";
    if (guaHint) guaHint.textContent = t("guaHintIdle");
    drawGuaArray();
  }
  guaToss.addEventListener("click", () => {
    hexWrap.innerHTML = ""; guaLines = []; guaAnim.lines = []; guaAnim.locked = false; guaReveal.disabled = true;
    if (guaName) guaName.innerHTML = "";
    if (guaHint) guaHint.textContent = t("guaCasting");
    let i = 0;
    const timer = setInterval(() => {
      const heads = (Math.random() < 0.5 ? 1 : 0) + (Math.random() < 0.5 ? 1 : 0) + (Math.random() < 0.5 ? 1 : 0);
      // heads: 0→老阴(6) 1→少阴(8) 2→少阳(7) 3→老阳(9)
      const v = heads === 0 ? 6 : heads === 1 ? 8 : heads === 2 ? 7 : 9;
      guaLines.push(v); guaAnim.lines.push(v); // 自下而上，appendChild 在 column-reverse 下自底向上
      const yang = (v === 7 || v === 9);
      const old = (v === 6 || v === 9);
      const y = document.createElement("div");
      y.className = "yao" + (yang ? "" : " yin") + (old ? " old" : "");
      y.style.width = yang ? "60%" : "60%";
      if (old) { const t = document.createElement("span"); t.className = "tag"; t.textContent = v === 6 ? "×" : "○"; y.appendChild(t); }
      hexWrap.appendChild(y);
      i++;
      if (window.__particles) window.__particles.collapse();
      if (i >= 6) {
        clearInterval(timer);
        guaAnim.locked = true;
        if (guaHint) guaHint.textContent = t("guaDone");
        setTimeout(() => { if (window.__particles) window.__particles.expand(); }, 200);
        guaReveal.disabled = false;
      }
    }, 360);
  });
  guaReveal.addEventListener("click", () => {
    if (guaLines.length !== 6) return;
    let base = 0, change = 0;
    guaLines.forEach((v, i) => { if (v === 7 || v === 9) base += 1 << i; });
    const changeLines = guaLines.map(v => v === 6 ? 7 : v === 9 ? 8 : v);
    changeLines.forEach((v, i) => { if (v === 7 || v === 9) change += 1 << i; });
    const name = GUA_FULL[base];
    const changeName = GUA_FULL[change];
    guaAnim.locked = true;
    if (guaName) guaName.innerHTML = guaName_html(base, change);
    showReading("gua", Object.assign({ name, guaIndex: base + 1, changeName, changeIdx: change }, readQuestion("gua")));
  });

  /* ============================================================
     灵数模块
     ============================================================ */
  const numInput = document.getElementById("numInput");
  const numGen = document.getElementById("numGen");
  const numResult = document.getElementById("numResult");
  const numReveal = document.getElementById("numReveal");
  let numData = null;
  function resetNumber() { numResult.textContent = ""; numReveal.disabled = true; numData = null; }

  // 对称灵数曼陀罗：灵数逐位驱动花瓣，整体按对称阶数旋转重复
  function drawNumMandala(raw, symbol) {
    const S = 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cv = document.createElement("canvas");
    cv.width = S * dpr; cv.height = S * dpr;
    cv.style.width = S + "px"; cv.style.height = S + "px";
    cv.style.borderRadius = "50%";
    cv.dataset.mandala = "1";
    const ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    const cx = S / 2, cy = S / 2;
    const bg0 = cssVar("--bg-0") || "#05060B", bg1 = cssVar("--bg-1") || "#0B0E1A";
    const accent = cssVar("--accent") || "#7C8CFF", accent2 = cssVar("--accent-2") || "#A970FF";
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, S / 2);
    g.addColorStop(0, bg1); g.addColorStop(1, bg0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    const digits = raw.split("").map(Number);
    const N = 6 + (digits.length % 6);   // 对称阶数随位数变化
    // 同心环
    ctx.strokeStyle = "rgba(124,140,255,0.16)"; ctx.lineWidth = 1;
    for (let r = 22; r < S / 2; r += 18) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    // 花瓣层（每阶旋转，逐位叠加）
    ctx.save(); ctx.translate(cx, cy);
    for (let k = 0; k < N; k++) {
      ctx.save(); ctx.rotate(k / N * Math.PI * 2);
      digits.forEach((d, i) => {
        const rr = 28 + i * 20 + d * 2.4;
        ctx.fillStyle = i % 2 ? accent2 : accent;
        ctx.globalAlpha = 0.42 + 0.045 * d;
        ctx.beginPath();
        ctx.ellipse(0, -rr, 4.5 + d * 1.4, 11 + d * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        // 连线，强化“曼陀罗”网感
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = i % 2 ? accent : accent2; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -rr - (11 + d * 1.8)); ctx.stroke();
      });
      ctx.restore();
    }
    ctx.restore();
    // 中心符文
    ctx.save(); ctx.translate(cx, cy); ctx.shadowColor = accent2; ctx.shadowBlur = 24;
    ctx.fillStyle = accent2; ctx.font = "500 70px Georgia, 'Noto Serif SC', serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(symbol, 0, 2); ctx.restore();
    return cv;
  }

  numGen.addEventListener("click", () => {
    const raw = (numInput.value || "").replace(/\D/g, "").slice(0, 9);
    if (!raw) { numResult.textContent = t("numEmpty"); return; }
    if (window.__particles) window.__particles.collapse();
    setTimeout(() => { if (window.__particles) window.__particles.expand(); }, 360);
    const s = raw.split("").reduce((a, b) => a + Number(b), 0) % NUMBER_SYMBOLS.length;
    const symbol = numSymbol(s);
    const theme = numThemeStr(s);
    numResult.innerHTML = "";
    const mandala = drawNumMandala(raw, symbol);
    const cap = document.createElement("div");
    cap.style.cssText = "margin-top:14px;font-family:var(--font-display);font-size:var(--fs-28);letter-spacing:.1em;color:var(--accent-2);text-shadow:var(--glow);";
    cap.textContent = raw + "  →  " + symbol + " · " + theme;
    numResult.appendChild(mandala);
    numResult.appendChild(cap);
    numData = { raw, symbol, theme, symbolIdx: s, themeIdx: s };
    numReveal.disabled = false;
  });
  numReveal.addEventListener("click", () => { if (numData) showReading("number", numData); });

  /* ============================================================
     二十八宿模块 · 星野指引（环形星环，复用环形星盘机制）
     ============================================================ */
  const mansionStage = document.getElementById("mansionStage");
  const mansionRing = document.getElementById("mansionRing");
  const mansionCenter = document.getElementById("mansionCenter");
  const mansionSelector = document.getElementById("mansionSelector");
  const mansionSpin = document.getElementById("mansionSpin");
  const mansionPick = document.getElementById("mansionPick");
  const mansionHint = document.getElementById("mansionHint");
  const MANSION_COUNT = MANSION.length;        // 28
  const MSTEP = 360 / MANSION_COUNT;
  const MR = 130;
  let mNodes = [], mFocus = 0, mAngle = 0, mChosen = null, mDragging = false, mStartX = 0, mStartA = 0, mSpinning = false;
  function buildMansion() {
    if (mNodes.length) return;
    mansionRing.innerHTML = "";
    for (let i = 0; i < MANSION_COUNT; i++) {
      const nd = document.createElement("div");
      nd.className = "mansion-node";
      nd.style.transform = "rotate(" + (i * MSTEP) + "deg) translateY(-" + MR + "px)";
      const dot = document.createElement("div"); dot.className = "dot";
      const lbl = document.createElement("div"); lbl.className = "lbl"; lbl.textContent = lang === "en" ? MANSION[i].ce : MANSION[i].c;
      nd.appendChild(dot); nd.appendChild(lbl);
      nd.addEventListener("click", () => chooseMansion(i));
      mansionRing.appendChild(nd);
      mNodes.push(nd);
    }
    setMAngle(0);
  }
  function setMAngle(a) {
    mAngle = a;
    mansionRing.style.transform = "rotate(" + a + "deg)";
    let f = Math.round(-a / MSTEP) % MANSION_COUNT;
    if (f < 0) f += MANSION_COUNT;
    if (f !== mFocus) { mFocus = f; updateMFocus(); }
  }
  function updateMFocus() {
    mNodes.forEach((n, i) => n.classList.toggle("focus", i === mFocus));
    mansionCenter.textContent = lang === "en" ? MANSION[mFocus].ce : MANSION[mFocus].c;
  }
  function chooseMansion(i) {
    if (mSpinning || mChosen !== null) return;
    mChosen = i;
    mNodes.forEach((n, k) => n.classList.toggle("focus", k === i));
    mansionCenter.textContent = lang === "en" ? MANSION[i].ce : MANSION[i].c;
    mansionPick.disabled = false;
    if (mansionHint) mansionHint.textContent = t("mansionChosen", [mansionFull(MANSION[i])]);
  }
  function resetMansion() {
    mNodes = []; buildMansion();
    mChosen = null; mFocus = 0; mAngle = 0;
    mansionPick.disabled = true;
    if (mansionHint) mansionHint.textContent = t("mansionHintIdle");
  }
  mansionStage.addEventListener("pointerdown", e => { mDragging = true; mStartX = e.clientX; mStartA = mAngle; });
  mansionStage.addEventListener("pointermove", e => { if (mDragging) setMAngle(mStartA + (e.clientX - mStartX) * 0.6); });
  const mEndDrag = () => { if (!mDragging) return; mDragging = false; setMAngle(Math.round(mAngle / MSTEP) * MSTEP); };
  mansionStage.addEventListener("pointerup", mEndDrag);
  mansionStage.addEventListener("pointercancel", mEndDrag);
  mansionSelector.addEventListener("click", () => chooseMansion(mFocus));
  mansionSpin.addEventListener("click", () => {
    if (mSpinning) return;
    mSpinning = true; mChosen = null; mansionPick.disabled = true;
    const target = mAngle + 360 * 3 + Math.random() * 360;
    const start = mAngle, dur = 1100, t0 = performance.now();
    function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setMAngle(start + (target - start) * e);
      if (k < 1) requestAnimationFrame(step);
      else { mSpinning = false; chooseMansion(mFocus); }
    }
    requestAnimationFrame(step);
  });
  mansionPick.addEventListener("click", () => { if (mChosen !== null) showReading("mansion", Object.assign({ idx: mChosen }, readQuestion("mansion"))); });

  /* ============================================================
     北欧符文模块 · 远古之语
     ============================================================ */
  const runeRow = document.getElementById("runeRow");
  const runeCast = document.getElementById("runeCast");
  const runeReveal = document.getElementById("runeReveal");
  let runePicks = [];
  function paintRuneStone(ctx, idx) {
    const pal = {
      bg1: cssVar("--bg-1") || "#0B0E1A", bg0: cssVar("--bg-0") || "#05060B",
      t1: cssVar("--text-1") || "#E8ECFF", accent: cssVar("--accent") || "#7C8CFF",
      accent2: cssVar("--accent-2") || "#A970FF"
    };
    const g = ctx.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, pal.bg1); g.addColorStop(1, pal.bg0);
    ctx.clearRect(0, 0, 110, 160);
    ctx.fillStyle = g;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(2, 2, 106, 156, 14); else ctx.rect(2, 2, 106, 156);
    ctx.fill();
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc(8 + Math.random() * 94, 8 + Math.random() * 144, 1, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = pal.accent2; ctx.font = "500 84px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = pal.accent2; ctx.shadowBlur = 18;
    ctx.fillText(RUNE[idx].g, 55, 74); ctx.shadowBlur = 0;
    ctx.fillStyle = pal.t1; ctx.font = (lang === "en" ? "500 15px " : "500 16px ") + "'Noto Serif SC', serif";
    ctx.fillText(lang === "en" ? RUNE[idx].n : RUNE[idx].z, 55, 140);
  }
  function drawRuneStone(idx) {
    const cv = document.createElement("canvas");
    cv.width = 110; cv.height = 160; cv.className = "rune-stone";
    cv.dataset.idx = idx;
    paintRuneStone(cv.getContext("2d"), idx);
    return cv;
  }
  function resetRune() { runeRow.innerHTML = ""; runePicks = []; runeReveal.disabled = true; }
  runeCast.addEventListener("click", () => {
    runeRow.innerHTML = ""; runePicks = []; runeReveal.disabled = true;
    const pool = []; for (let i = 0; i < RUNE.length; i++) pool.push(i);
    for (let k = 0; k < 3 && pool.length; k++) {
      const j = Math.floor(Math.random() * pool.length);
      runePicks.push(pool.splice(j, 1)[0]);
    }
    runePicks.forEach((idx, k) => {
      const cv = drawRuneStone(idx);
      cv.style.animation = "runeIn 0.5s var(--ease-out) both";
      cv.style.animationDelay = (k * 0.12) + "s";
      runeRow.appendChild(cv);
    });
    runeReveal.disabled = false;
  });
  runeReveal.addEventListener("click", () => { if (runePicks.length) showReading("rune", { runes: runePicks }); });

  /* ============================================================
     寺观灵签模块 · 一签之示
     ============================================================ */
  const oracleStage = document.getElementById("oracleStage");
  const oracleCup = document.getElementById("oracleCup");
  const oracleStick = document.getElementById("oracleStick");
  const oracleNum = document.getElementById("oracleNum");
  const oracleDraw = document.getElementById("oracleDraw");
  const oracleReveal = document.getElementById("oracleReveal");
  let oracleChosen = null, oracleBusy = false;
  function resetOracle() {
    oracleChosen = null; oracleBusy = false; oracleReveal.disabled = true;
    oracleStick.classList.remove("show"); oracleNum.textContent = "";
    oracleCup.classList.remove("shake");
  }
  oracleDraw.addEventListener("click", () => {
    if (oracleBusy) return;
    oracleBusy = true; oracleReveal.disabled = true;
    oracleStick.classList.remove("show"); oracleNum.textContent = "";
    oracleCup.classList.add("shake");
    setTimeout(() => {
      oracleCup.classList.remove("shake");
      const idx = Math.floor(Math.random() * ORACLE.length);
      oracleChosen = idx;
      oracleNum.textContent = ORACLE[idx].no;
      oracleStick.classList.add("show");
      oracleReveal.disabled = false; oracleBusy = false;
    }, 620);
  });
  oracleReveal.addEventListener("click", () => { if (oracleChosen !== null) showReading("oracle", { sign: oracleChosen }); });

  /* ============================================================
     微交互：磁吸按钮 + 点击涟漪（辉光呼吸在 styles.css）
     ============================================================ */
  function initMagnetic(selector, strength) {
    if (reduced) return;
    document.querySelectorAll(selector).forEach(el => {
      if (el.dataset.mag) return;
      el.dataset.mag = "1";
      const s = strength || 0.28;
      el.addEventListener("pointermove", e => {
        if (el.disabled) { el.style.transform = ""; return; }
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (dx * s).toFixed(1) + "px," + (dy * s).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
      el.addEventListener("blur", () => { el.style.transform = ""; });
    });
  }
  function spawnRipple(el, x, y) {
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 1.6;
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.width = span.style.height = size + "px";
    span.style.left = (x - r.left - size / 2) + "px";
    span.style.top = (y - r.top - size / 2) + "px";
    el.appendChild(span);
    setTimeout(() => span.remove(), 640);
  }
  function initRipple(selector) {
    document.addEventListener("pointerdown", e => {
      const el = e.target.closest(selector);
      if (!el || el.disabled) return;
      spawnRipple(el, e.clientX, e.clientY);
    });
  }
  initMagnetic(".primary-btn, .ghost-btn", 0.3);
  initMagnetic(".card", 0.16);
  initRipple(".primary-btn, .ghost-btn, .card, .dial-card");

  /* ============================================================
     摄像头粒子交互 + 卡牌选择（纯 getUserMedia + Canvas，零外部依赖，全部本地处理）
     - 开启后，画面运动被采样为“控制点”，星尘随之聚拢 / 扰动；
     - 控制点停留在某张塔罗牌上约 0.9s 即自动选中（替代鼠标点击）。
     ============================================================ */
  const cameraToggle = document.getElementById("cameraToggle");
  const camClose = document.getElementById("camClose");
  const camWrap = document.getElementById("camWrap");
  const camVideo = document.getElementById("camVideo");
  const camFx = document.getElementById("camFx");
  const fxCtx = camFx ? camFx.getContext("2d") : null;

  // 全屏光环：把摄像头控制点“投射”到整个屏幕，让用户看清自己此刻瞄准的位置
  const camReticle = document.getElementById("camReticle");
  const retCtx = camReticle ? camReticle.getContext("2d") : null;
  let retDpr = Math.min(window.devicePixelRatio || 1, 2);
  function retResize() {
    if (!camReticle) return;
    retDpr = Math.min(window.devicePixelRatio || 1, 2);
    camReticle.width = Math.floor(window.innerWidth * retDpr);
    camReticle.height = Math.floor(window.innerHeight * retDpr);
    if (retCtx) retCtx.setTransform(retDpr, 0, 0, retDpr, 0, 0);
  }

  let camOn = false, camStream = null, camCanvas = null, camCtx2 = null, prevGray = null;
  let ctrl = { x: 0.5, y: 0.5 }, camActivity = 0, lastPulse = 0, lastSample = 0, cellEMA = null;
  let dwellEl = null, dwellT = 0;
  const GX = 16, GY = 12, SAMP_W = 64, SAMP_H = 48;

  // MediaPipe Hands（真实手势，加载失败自动降级为运动追踪）
  let hands = null, handsBusy = false, useHands = false;
  const handScreen = { x: 0.5, y: 0.5, seen: false, last: 0, prevAng: null, fist: false, lastFist: 0 };
  const camGestureEl = document.getElementById("camGesture");

  function camResize() { if (camFx) { camFx.width = camWrap.clientWidth; camFx.height = camVideo.clientHeight || 165; } }
  window.addEventListener("resize", () => { if (camOn) { camResize(); retResize(); } });

  function startCamera() {
    if (camOn) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("当前环境不支持摄像头（需 https 或 localhost）。演示仍可用鼠标交互。");
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false })
      .then(stream => {
        camStream = stream;
        camVideo.srcObject = stream;
        camVideo.play();
        camCanvas = document.createElement("canvas");
        camCanvas.width = SAMP_W; camCanvas.height = SAMP_H;
        camCtx2 = camCanvas.getContext("2d", { willReadFrequently: true });
        prevGray = null; cellEMA = new Float32Array(GX * GY);
        camOn = true; window.__camOn = true;
        camWrap.hidden = false; camResize(); retResize();
        cameraToggle.textContent = t("cameraOn"); cameraToggle.classList.add("is-on");
        if (initHands()) { useHands = true; pumpHands(); }
        else if (camGestureEl) camGestureEl.textContent = t("camMotion");
        requestAnimationFrame(camLoop);
      })
      .catch(err => alert("无法开启摄像头：" + (err && err.message ? err.message : err) + "\n（演示仍可用鼠标交互）"));
  }

  function stopCamera() {
    camOn = false; window.__camOn = false;
    if (camStream) camStream.getTracks().forEach(t => t.stop());
    camStream = null; camVideo.srcObject = null;
    camWrap.hidden = true;
    cameraToggle.textContent = t("cameraToggle"); cameraToggle.classList.remove("is-on");
    dwellEl = null; dwellT = 0;
    useHands = false; hands = null; handScreen.seen = false; handScreen.prevAng = null;
    if (fxCtx) fxCtx.clearRect(0, 0, camFx.width, camFx.height);
    if (retCtx) { retCtx.save(); retCtx.setTransform(1, 0, 0, 1, 0, 0); retCtx.clearRect(0, 0, camReticle.width, camReticle.height); retCtx.restore(); }
  }

  /* ---------------- MediaPipe Hands ---------------- */
  function initHands() {
    if (typeof Hands === "undefined") return false;   // CDN 未加载 → 降级
    try {
      hands = new Hands({ locateFile: (f) => "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + f });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      hands.onResults(onHandResults);
      return true;
    } catch (e) { console.warn("MediaPipe Hands 初始化失败：", e); return false; }
  }
  async function pumpHands() {
    if (!camOn || !hands) return;
    if (camVideo.readyState >= 2 && !handsBusy) {
      handsBusy = true;
      try { await hands.send({ image: camVideo }); } catch (e) {}
      handsBusy = false;
    }
    requestAnimationFrame(pumpHands);
  }
  function updateCamStatusGesture(text) {
    if (camGestureEl) camGestureEl.textContent = t("camGesturePrefix") + text;
  }
  function onHandResults(res) {
    const lms = res.multiHandLandmarks && res.multiHandLandmarks[0];
    if (!lms) {
      handScreen.seen = false; handScreen.prevAng = null;
      updateCamStatusGesture(t("camNoHand"));
      return;
    }
    // 手掌中心（镜像，符合自拍直觉）：视频已 CSS 镜像，但 MediaPipe 读的是原始像素，故 x 取 1-x
    const ids = [0, 5, 9, 13, 17];
    let cx = 0, cy = 0;
    ids.forEach(i => { cx += lms[i].x; cy += lms[i].y; });
    cx = 1 - cx / ids.length; cy = cy / ids.length;
    handScreen.x = cx; handScreen.y = cy; handScreen.seen = true; handScreen.last = performance.now();

    // 画圈手势：手绕屏幕中心的角度增量 → 转动星盘
    const ang = Math.atan2(cy - 0.5, cx - 0.5);
    if (handScreen.prevAng !== null) {
      let d = ang - handScreen.prevAng;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      if (Math.abs(d) < 0.012) d = 0;                 // 死区，避免静止抖动
      setDialAngle(dialAngle - d * 1.35);              // 手顺时针 → 星盘顺时针
    }
    handScreen.prevAng = ang;

    // 握拳检测（四指是否收拢）→ 边缘触发取牌
    const ext = (tip, pip) => lms[tip].y < lms[pip].y - 0.02;
    let count = 0;
    if (ext(8, 6)) count++; if (ext(12, 10)) count++;
    if (ext(16, 14)) count++; if (ext(20, 18)) count++;
    const fist = count <= 1;
    if (fist && !handScreen.fist && (performance.now() - handScreen.lastFist) > 700) {
      handScreen.lastFist = performance.now();
      confirmPick();
    }
    handScreen.fist = fist;
    updateCamStatusGesture(fist ? t("camFist") : t("camOpen"));
    // 选牌口随取牌手势高亮
    if (dialSelector) dialSelector.classList.toggle("active", fist);
  }

  if (cameraToggle) cameraToggle.addEventListener("click", () => { camOn ? stopCamera() : startCamera(); });
  if (camClose) camClose.addEventListener("click", stopCamera);

  // 摄像头命中的元素：环形星盘牌 / 选牌口 / 通用卡片按钮（实现免手动全流程）
  function camElementAt(sx, sy) {
    const hit = document.elementFromPoint(sx, sy);
    if (!hit) return null;
    let el = hit.closest(".dial-card:not(.used)");   // 直接瞄准某张星盘牌 → 取该牌
    if (el) return el;
    el = hit.closest(".dial-selector");               // 瞄准顶部选牌口 → 取焦点牌
    if (el) return el;
    el = hit.closest(".card[data-go], .primary-btn, .back-btn, .ghost-btn");
    if (el) {
      if (el.id === "cameraToggle" || el.id === "camClose" || el.classList.contains("cam-close")) return null;
      if (el.disabled) return null;
      return el;
    }
    return null;
  }

  function camLoop(ts) {
    if (!camOn) return;
    requestAnimationFrame(camLoop);
    if (!camCtx2 || camVideo.readyState < 2) return;
    if (ts - lastSample < 33) return;   // 约 30fps 采样，省 CPU
    lastSample = ts;
    camCtx2.drawImage(camVideo, 0, 0, SAMP_W, SAMP_H);
    let data;
    try { data = camCtx2.getImageData(0, 0, SAMP_W, SAMP_H).data; } catch (e) { return; }
    const gray = new Float32Array(SAMP_W * SAMP_H);
    for (let i = 0, p = 0; i < gray.length; i++, p += 4) gray[i] = data[p] * 0.3 + data[p + 1] * 0.59 + data[p + 2] * 0.11;
    if (!prevGray) { prevGray = gray.slice(); return; }
    let best = -1, bestM = 0, sumM = 0;
    const cw = (SAMP_W / GX) | 0, ch = (SAMP_H / GY) | 0;
    const cellPx = cw * ch;
    for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
      let m = 0;
      for (let y = gy * ch; y < (gy + 1) * ch; y++)
        for (let x = gx * cw; x < (gx + 1) * cw; x++)
          m += Math.abs(gray[y * SAMP_W + x] - prevGray[y * SAMP_W + x]);
      sumM += m;
      const idx = gy * GX + gx;
      const avg = m / cellPx;                         // 单像素平均差，排除格子大小影响
      cellEMA[idx] = cellEMA[idx] * 0.8 + avg * 0.2;   // 时间平滑，抑制传感器/压缩噪声
      if (cellEMA[idx] > bestM) { bestM = cellEMA[idx]; best = idx; }
    }
    prevGray = gray;
    camActivity = sumM / (GX * GY);
    // 仅当存在明显运动（EMA 单像素差 > 8）才移动控制点；静止时冻结，消除光环抖动
    if (best >= 0 && bestM > 8) {
      const tx = ((best % GX) + 0.5) / GX, ty = (((best / GX) | 0) + 0.5) / GY;
      ctrl.x += (tx - ctrl.x) * 0.28; ctrl.y += (ty - ctrl.y) * 0.28;
    }
    const W = window.innerWidth, H = window.innerHeight;
    const msx = (1 - ctrl.x) * W, msy = ctrl.y * H;   // 运动追踪（降级路径）
    let sx, sy;
    if (useHands && handScreen.seen && (performance.now() - handScreen.last) < 400) {
      sx = handScreen.x * W; sy = handScreen.y * H;    // 手部坐标（优先）
    } else { sx = msx; sy = msy; }
    const ndx = sx / W * 2 - 1, ndy = sy / H * 2 - 1;
    if (window.__particles) {
      window.__particles.setPointer(ndx, ndy);
      const now = performance.now();
      if (!reduced && camActivity > 60 && now - lastPulse > 350) { window.__particles.pulseRipple(ndx, ndy); lastPulse = now; }
    }
    const over = camElementAt(sx, sy);
    if (over !== dwellEl) { dwellEl = over; dwellT = 0; }
    if (over) {
      dwellT += 1 / 30;
      if (dwellT > 0.9 && !over.classList.contains("picked") && !over.classList.contains("used")) { over.click(); dwellT = 0; dwellEl = null; }
    } else dwellT = 0;
    drawCamFx(over, dwellT);
    drawReticle(sx, sy, over, dwellT);
  }

  function drawCamFx(over, t) {
    if (!fxCtx) return;
    const W = camFx.width, H = camFx.height;
    fxCtx.clearRect(0, 0, W, H);
    const px = (1 - ctrl.x) * W, py = ctrl.y * H;     // 与视频同步镜像
    fxCtx.lineWidth = 2;
    fxCtx.strokeStyle = "rgba(124,140,255,0.95)";
    fxCtx.beginPath(); fxCtx.arc(px, py, 13, 0, Math.PI * 2); fxCtx.stroke();
    if (over) {
      fxCtx.strokeStyle = "#A970FF";
      fxCtx.beginPath(); fxCtx.arc(px, py, 20, -Math.PI / 2, -Math.PI / 2 + Math.min(t / 0.9, 1) * Math.PI * 2); fxCtx.stroke();
    }
  }

  // 全屏光环：跟随控制点，命中可交互元素时画出驻留进度环 + 高亮框
  function drawReticle(sx, sy, over, t) {
    if (!retCtx) return;
    const W = window.innerWidth, H = window.innerHeight;
    retCtx.clearRect(0, 0, W, H);
    retCtx.save();
    // 外环 + 辉光
    retCtx.lineWidth = 2.5;
    retCtx.strokeStyle = "rgba(124,140,255,0.95)";
    retCtx.shadowColor = "rgba(124,140,255,0.9)";
    retCtx.shadowBlur = 18;
    retCtx.beginPath(); retCtx.arc(sx, sy, 24, 0, Math.PI * 2); retCtx.stroke();
    // 准星十字（内段）
    retCtx.shadowBlur = 0;
    retCtx.lineWidth = 1.5;
    retCtx.beginPath();
    retCtx.moveTo(sx - 36, sy); retCtx.lineTo(sx - 28, sy);
    retCtx.moveTo(sx + 28, sy); retCtx.lineTo(sx + 36, sy);
    retCtx.moveTo(sx, sy - 36); retCtx.lineTo(sx, sy - 28);
    retCtx.moveTo(sx, sy + 28); retCtx.lineTo(sx, sy + 36);
    retCtx.stroke();
    if (over) {
      // 驻留进度环（紫色），填满约 0.9s 即自动触发
      retCtx.lineWidth = 4;
      retCtx.strokeStyle = "#A970FF";
      retCtx.shadowColor = "rgba(169,112,255,0.9)";
      retCtx.shadowBlur = 14;
      retCtx.beginPath();
      retCtx.arc(sx, sy, 34, -Math.PI / 2, -Math.PI / 2 + Math.min(t / 0.9, 1) * Math.PI * 2);
      retCtx.stroke();
      // 命中元素高亮描边
      const r = over.getBoundingClientRect();
      retCtx.shadowBlur = 0;
      retCtx.strokeStyle = "rgba(169,112,255,0.9)";
      retCtx.lineWidth = 2;
      retCtx.strokeRect(r.left - 4, r.top - 4, r.width + 8, r.height + 8);
    }
    retCtx.restore();
  }

  /* 初始进入 home 时若离线无粒子，至少跑一次 resize 占位 */

  /* 应用初始语言（静态 + 顶栏 + 当前屏动态文案） */
  applyLang();
})();
