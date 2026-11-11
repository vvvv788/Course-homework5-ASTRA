/* Product journey, optional local records and contextual help. No remote analytics. */
(function () {
  "use strict";
  const translations = {
    zh: {
      docTitle: "ASTRA · 星尘问语", brandSub: "星尘问语", heroSub: "借六种象征整理困惑，带走一份解读与行动。",
      gateHint: "轻触门扉，启程入境", uxOptional: "可留白", uxBgmVolume: "背景音乐", uxHomeDemo: "内置示例 · 非实时解读", uxHomeLive: "实时 AI 解读 · StepFun", demoNote: "示例体验 · 当前解读为内置示例，不会按你的问题实时生成。", demoBanner: "示例解读 · 内容并非针对你的问题生成",
      shareHint: "链接包含这份解读，持有链接的人都能查看；无法撤回，请先检查内容。正文也可能透露你的处境。", liveNote: "AI 服务已配置 · 问题将发送至阶跃星辰生成本次解读。",
      cardTarotDesc: "梳理关系与选择 · 选三张牌", cardGuaDesc: "观察变化与进退 · 三枚铜钱连掷六次", cardNumberDesc: "探索自己的节奏 · 输入一组数字", cardMansionDesc: "借星宿意象换个视角 · 取一宿", cardRuneDesc: "面对变化与边界 · 掷三枚符石", cardOracleDesc: "为一件心事找切口 · 抽签读诗",
      rlStep1: "取象已保留", rlStep2: "等待解读返回", rlStep3: "收到完整内容后", rlStep4: "即可阅读与听读", rlWaitHint: "生成时间取决于网络与内容长度。你可以返回，取象与问题会保留。",
      uxRoleDoor: "你以「{{0}}」的身份来到这里。六扇门各有角度，选择此刻想探索的方式。", uxChooseDoor: "沿着星径选择一扇门，带着你的心事，慢慢探索。", uxPickCard: "选择{{0}}", uxHiddenNumber: "输入数字已隐藏", uxShowSymbols: "查看本次取象", uxDisplay: "声画", uxSkip: "跳到主要内容", uxHome: "首页", uxExplore: "探索六门", uxRecords: "我的记录", uxHelp: "帮助与设置", uxQuestion: "此刻，你想理清什么？", uxQuestionPh: "例如：在读研和工作之间，我最需要想清楚什么？", uxEntryPrivacy: "问语仅用于本次 AI 解读。", uxCareer: "学业与工作", uxLove: "关系与心事", uxChoice: "两难与选择", uxSelf: "当下的自己", uxStart: "选择旅人身份 →", uxBrowse: "跳过身份，直接选门 ↗", uxSteps: "01 选择旅人　 →　 02 推门取象　 →　 03 阅读或听解读", uxEditQuestion: "修改问题", uxRetry: "保留取象重试", uxSave: "保存到我的记录", uxBackResult: "返回取象", uxShareQuestion: "包含我的原问题与输入数字（默认不分享）", uxShareWithQuestion: "将分享：完整解读＋原问题及输入数字。请确认其中没有不想公开的信息。", uxShareWithoutQuestion: "将分享：完整解读，不附带原问题；灵数输入数字已隐藏。解读正文仍可能包含你的处境。", readingSpeak: "✦ 聆听神谕", uxOracleOverview: "本次神谕", uxFirstStep: "可以先做", uxAudioSettings: "听读设置", uxOracle: "神谕", uxOracleSub: "让星语，缓缓落在耳边", uxPrevAudio: "上一章", uxNextAudio: "下一章", uxSpeed: "朗读速度", uxClose: "关闭", uxWaiting: "取象已保留，正在等待 AI 解读", uxWaitingLong: "仍在等待解读返回，取象不会丢失", uxQuotaFailure: "当前额度暂不可用，展示的是示例解读。原取象已保留。", uxDemoFailure: "当前展示示例解读，未针对你的问题生成。原取象已保留。"
    },
    en: {
      docTitle: "ASTRA · Stardust Reflections", brandSub: "Reflections", heroSub: "Explore a question through six symbolic traditions, with a reflection and a practical next step.",
      gateHint: "Touch the gate to begin", uxOptional: "Optional", uxBgmVolume: "Background music", uxHomeDemo: "Built-in samples · Not live AI", uxHomeLive: "Live AI readings · StepFun", demoNote: "Sample experience · Readings are built-in examples, not personalized responses.", demoBanner: "Sample reading · Not generated for your question",
      shareHint: "Anyone with the link can read this report. It cannot be revoked; check it first. The report itself may reveal your situation.", liveNote: "AI configured · Your question is sent to StepFun for this reading.",
      cardTarotDesc: "Relationships & choices · Pick three cards", cardGuaDesc: "Change & timing · Six casts of three coins", cardNumberDesc: "Personal rhythms · Enter a number", cardMansionDesc: "A fresh perspective · Select a mansion", cardRuneDesc: "Change & boundaries · Cast three runes", cardOracleDesc: "One concern · Draw a poem",
      rlStep1: "Symbols preserved", rlStep2: "Waiting for AI", rlStep3: "When content arrives", rlStep4: "Read or listen", rlWaitHint: "Time varies with the network and report length. You can return; your question and symbols are preserved.",
      uxRoleDoor: "You arrive as {{0}}. Each of the six doors offers a different perspective; choose what you want to explore.", uxChooseDoor: "Choose a door along the starlit path and explore at your own pace.", uxPickCard: "Choose {{0}}", uxHiddenNumber: "Input number hidden", uxShowSymbols: "View drawn symbols", uxDisplay: "Display", uxSkip: "Skip to main content", uxHome: "Home", uxExplore: "Explore", uxRecords: "My records", uxHelp: "Help & settings", uxQuestion: "What would you like to untangle?", uxQuestionPh: "For example: what should I consider when choosing study or work?", uxEntryPrivacy: "Used for this AI reading only.", uxCareer: "Study & work", uxLove: "Relationships", uxChoice: "A difficult choice", uxSelf: "My current self", uxStart: "Choose your traveler →", uxBrowse: "Skip role · choose a door", uxSteps: "01 Choose a traveler　 →　 02 Enter & draw　 →　 03 Read or listen", uxEditQuestion: "Edit question", uxRetry: "Retry", uxSave: "Save to my records", uxBackResult: "Back to symbols", uxShareQuestion: "Include my question and input number (off by default)", uxShareWithQuestion: "Sharing the full report, your question and input number. Check for private details first.", uxShareWithoutQuestion: "Sharing the report without your question; numerology input is hidden. The report may still reveal your situation.", readingSpeak: "✦ Divine Whisper", uxOracleOverview: "YOUR READING", uxFirstStep: "A first step", uxAudioSettings: "Audio settings", uxOracle: "Oracle", uxOracleSub: "A little space to listen", uxPrevAudio: "Previous", uxNextAudio: "Next", uxSpeed: "Playback speed", uxClose: "Close", uxWaiting: "Symbols preserved · waiting for AI", uxWaitingLong: "Still waiting · your symbols are safe", uxQuotaFailure: "The request reached its usage limit. This is a sample reading. Retry with the same symbols later.", uxDemoFailure: "A live AI reading was unavailable. This is a built-in sample. Your question and symbols are preserved for retry."
    }
  };
  const modules = {
    tarot: ["塔罗", "Tarot", "适合梳理关系、处境与选择。使用 22 张大阿卡纳，提供单牌、三牌与五牌五种探索方式，保留正逆位。", "Reflect on relationships and choices. Choose among five one-, three- and five-card spreads from 22 Major Arcana, including reversals.", "选择牌阵，洗牌或转动星盘，依牌位完成选牌，再查看解读。", "Choose a spread, shuffle or turn the dial, fill its positions, then read.", "tarotReveal"],
    gua: ["六爻", "I Ching", "适合从变化与进退的视角思考一件事。三枚铜钱连掷六次，组成本卦与变卦；这是简化的象征解读。", "Explore change and timing. Six casts of three coins form the primary and changed hexagrams; this is a simplified symbolic reading.", "逐爻掷满六次，或使用一次成卦；点选动爻查看本卦与变化后的对照。", "Cast each line yourself, or complete the remaining lines at once. Compare the moving lines before reading.", "guaReveal"],
    number: ["灵数", "Numerology", "本站数字取象将数位和映射到十二枚自定义印记，不是传统灵数的根数算法。印记从0至11编号，以数位和除以12的余数选取；例如14余2，对应「潮」。不需要真实生日。", "This app maps a digit sum to twelve custom symbols, rather than a traditional numerology root. Symbols use indices 0–11: take the digit sum modulo 12. For example, 14 gives remainder 2, selecting Tide. Your real birth date is optional.", "输入数字或选择随机，生成印记后查看解读。", "Enter a number or pick a random one, generate the symbol, then read.", "numReveal"],
    mansion: ["二十八宿", "Lunar Mansions", "适合借星宿与守护兽意象换个视角。可浏览并确认星宿，也可随机摇星；不按出生时间计算本命星宿。", "Explore a new perspective through a mansion and its animal symbol. Browse and confirm a mansion or shuffle the stars; this is not a natal chart.", "转动星环或点击摇星，取一宿后查看指引。", "Turn the ring or shuffle the stars, select a mansion, then read.", "mansionPick"],
    rune: ["北欧符文", "Runes", "适合思考变化、边界与应对方式。抽取三枚符文，作为回顾、当下与下一步的象征。", "Explore change, boundaries and responses with three runes representing context, the present and a next step.", "横滑浏览符石，逐枚选入回顾、当下与下一步；也可随机补满剩余阵位。", "Browse the stones and place one in each position, or fill the remaining slots at random.", "runeReveal"],
    oracle: ["寺观灵签", "Oracle", "适合围绕一件心事，从签诗找到反思切口。使用应用内签诗库，不代表任何寺观的官方服务。", "Find a reflection prompt in a poem. Uses the app's poem collection and is not an official temple service.", "点击求签，待签号出现后，点击看签诗。", "Draw a lot, wait for its number, then open the poem.", "oracleReveal"]
  };
  const esc = text => String(text == null ? "" : text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const RECORDS_KEY = "astra.records.v1";
  const PREFS_KEY = "astra.preferences.v1";
  const DRAFT_KEY = "astra.question.v1";
  const DRAFT_INTENT_KEY = "astra.questionIntent.v1";
  const INTENT_QUESTIONS = {
          career: ["面对接下来的学业或工作安排，我最需要想清楚什么？", "What should I clarify about my next study or work decision?"],
          love: ["在这段关系中，我应该如何表达自己的需要与边界？", "How can I express my needs and boundaries in this relationship?"],
          choice: ["面对两个选择，我可以从哪些角度梳理各自的代价？", "How can I compare the trade-offs of my two options?"],
          self: ["最近的状态里，有什么值得我停下来留意？", "What in my current situation deserves a moment of reflection?"]
        };
  class AstraExperience {
    constructor(bridge) {
      this.bridge = bridge;
      this.dialog = document.getElementById("experienceDialog");
      this.content = document.getElementById("experienceContent");
      this.entry = document.getElementById("entryQuestion");
      this.followupAbort = null;
      this.followupCurrent = null;
      this.followupDrafts = new Map();
      this.noteOpen = { action: false, followup: false };
      this.boundReading = null;
      this.dirtyReading = null;
      this.failedSave = null;
      this.toastTimer = null;
      this.records = this.load(RECORDS_KEY, []);
      if (!Array.isArray(this.records)) this.records = [];
      this.records = this.records.filter(r => r && typeof r.id === "string" && modules[r.type] && r.data && r.r && typeof r.r.tone === "string" && typeof r.r.synthesis === "string" && Array.isArray(r.r.readings) && Array.isArray(r.r.actions)).slice(0, 30);
      this.preferences = this.load(PREFS_KEY, {});
      if (typeof this.preferences !== "object" || Array.isArray(this.preferences)) this.preferences = {};
      this.applyPreferences();
      this.questionIntent = null;
      try {
        this.entry.value = sessionStorage.getItem(DRAFT_KEY) || "";
        const storedIntent = sessionStorage.getItem(DRAFT_INTENT_KEY);
        if (INTENT_QUESTIONS[storedIntent] && INTENT_QUESTIONS[storedIntent].includes(window.AstraLocale.translate(this.entry.value,"en"))) this.questionIntent = storedIntent;
      } catch (_) {}
      // Recognize exact built-in drafts from the previous release; never translate arbitrary text.
      if (!this.questionIntent) this.questionIntent = Object.keys(INTENT_QUESTIONS).find(key => INTENT_QUESTIONS[key].includes(window.AstraLocale.translate(this.entry.value,"en"))) || null;
      this.syncQuestion(this.entry.value, this.questionIntent);
      document.addEventListener("keydown", event => {
        if (event.key !== "Tab") return;
        const modal = document.querySelector("dialog[open]"); if (!modal) return;
        const controls = Array.from(modal.querySelectorAll('button, input, textarea, select, a[href], [tabindex="0"]')).filter(node => !node.disabled && node.getClientRects().length);
        if (!controls.length) { event.preventDefault(); return; }
        const first = controls[0], last = controls[controls.length - 1];
        if (!modal.contains(document.activeElement) || !event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      });
      document.getElementById("closeExperience").addEventListener("click", () => this.dialog.close());
      this.dialog.addEventListener("click", e => { if (e.target === this.dialog) this.dialog.close(); });
      this.entry.addEventListener("input", () => this.syncQuestion(this.entry.value));
      document.querySelectorAll(".ask-input").forEach(input => input.addEventListener("input", () => this.syncQuestion(input.value)));
      document.getElementById("navHome").addEventListener("click", () => this.bridge.home());
      document.getElementById("navExplore").addEventListener("click", () => this.explore());
      document.getElementById("exploreDoors").addEventListener("click", () => this.explore(false, true));
      document.getElementById("startGuided").addEventListener("click", () => this.explore(true));
      document.getElementById("editEntryQuestion").addEventListener("click", () => { this.bridge.home(); setTimeout(() => this.entry.focus(), 650); });
      document.getElementById("navRecords").addEventListener("click", () => this.showRecords());
      document.getElementById("navHelp").addEventListener("click", () => this.showHelp());
      document.getElementById("readingSave").addEventListener("click", () => this.saveCurrent());
      document.querySelectorAll("[data-intent]").forEach(button => button.addEventListener("click", () => {
        const examples = INTENT_QUESTIONS;
        this.syncQuestion(this.tx(...examples[button.dataset.intent]), button.dataset.intent); this.entry.focus();
      }));
      Object.keys(modules).forEach(key => this.installGuide(key));
      ["dialSelector", "mansionSelector"].forEach(id => {
        const node = document.getElementById(id); node.tabIndex = 0; node.setAttribute("role", "button");
        node.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); node.click(); } });
      });
      const layout = window.matchMedia("(min-width: 981px)");
      layout.addEventListener("change", () => this.placeOverview());
      this.placeOverview();
      let resizeActionsFrame = 0;
      window.addEventListener("resize", () => { cancelAnimationFrame(resizeActionsFrame); resizeActionsFrame = requestAnimationFrame(() => this.resizeActionFields()); });
      const header = document.querySelector(".topbar");
      const updateHeaderSpace = () => document.documentElement.style.setProperty("--app-topbar-height", Math.ceil(header.getBoundingClientRect().height) + "px");
      if (typeof ResizeObserver !== "undefined") new ResizeObserver(updateHeaderSpace).observe(header);
      else window.addEventListener("resize", updateHeaderSpace);
      updateHeaderSpace();
      this.onLanguage();
    }
    updateReturnEntry() {
      let panel = document.getElementById("returnEntry");
      if (!panel) {
        panel = document.createElement("aside"); panel.id = "returnEntry"; panel.className = "return-entry";
        document.querySelector(".entry-journey").after(panel);
      }
      const record = this.records[0]; panel.hidden = !record;
      panel.replaceChildren(); if (!record) return;
      const copy = document.createElement("div"), label = document.createElement("small"), heading = document.createElement("p"), next = document.createElement("p"), button = document.createElement("button");
      label.textContent = this.tx("继续上次的星笺", "Continue your last star note");
      heading.textContent = String(record.r.tone || "");
      const actions = record.notes?.actions || (record.r.actions || []).map(text => ({text, done:false}));
      next.textContent = this.tx("下一步：", "Next step: ") + (actions.find(a => !a.done)?.text || this.tx("行动已完成，回来写写你的发现", "Steps complete; return to reflect"));
      button.type = "button"; button.className = "ghost-btn"; button.textContent = this.tx("继续回看 →", "Continue reflecting →");
      button.addEventListener("click", () => {
        if (!this.flushSavedEdits()) return;
        const latest = this.records.find(r => r.id === record.id); if (latest) this.bridge.restore(latest);
      });
      copy.append(label, heading, next); panel.append(copy, button);
    }
    placeOverview() {
      const overview = document.querySelector(".reading-quick");
      if (!overview) return;
      if (window.matchMedia("(max-width: 980px)").matches) document.querySelector(".reading-wrap").before(overview);
      else document.getElementById("readingBody").prepend(overview);
    }
    resizeActionFields() {
      document.querySelectorAll(".action-notebook [data-action-text]").forEach(field => {
        if (!field.getClientRects().length) return;
        field.style.height = "0px";
        field.style.height = field.scrollHeight + "px";
      });
    }
    tx(zh, en) { return window.AstraLocale.translate(this.bridge.lang() === "en" ? en : zh); }
    load(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch (_) { return fallback; } }
    write(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (_) { this.toast(this.tx("当前浏览器无法保存，请导出星图或清理存储后重试。", "Storage is unavailable. Export your report or free space and retry.")); return false; }
    }
    syncQuestion(value, intent = null) {
      this.questionIntent = INTENT_QUESTIONS[intent] ? intent : null;
      const question = String(value).slice(0, 300);
      this.entry.value = question;
      document.querySelectorAll(".ask-input").forEach(input => { if (input.value !== question) input.value = question; });
      document.getElementById("entryCounter").textContent = `${question.length} / 300`;
      try { sessionStorage.setItem(DRAFT_KEY, question); sessionStorage.setItem(DRAFT_INTENT_KEY, this.questionIntent || ""); } catch (_) {}
    }
    explore(chooseRole, skipIdentity = false) {
      this.syncQuestion(this.entry.value, this.questionIntent);
      if (chooseRole) this.bridge.beginJourney();
      else this.bridge.explore(skipIdentity);
    }
    installGuide(key) {
      const screen = document.querySelector(`[data-screen="${key}"]`);
      const guide = document.createElement("div");
      guide.className = "module-guide";
      guide.innerHTML = '<ol class="journey-steps"><li></li><li></li><li></li></ol><div class="method-profile"><div><span data-profile-eyebrow></span><p data-profile-focus></p></div><ul data-profile-angles></ul></div><p role="status" data-guide-status></p>';
      screen.querySelector(".panel-head").after(guide);
      const guideButton = document.createElement("button");
      guideButton.className = "method-guide-link";
      guideButton.type = "button";
      screen.querySelector(".panel-head").appendChild(guideButton);
      guideButton.addEventListener("click", () => this.showKnowledge(key));
      const reveal = document.getElementById(modules[key][6]);
      const trace = document.createElement("details"); trace.className = "result-trace"; trace.hidden = true;
      if (key !== "gua") (reveal.closest(".actions") || screen.lastElementChild).after(trace);
      const updateTrace = () => { if (key !== "gua") window.AstraDrawTrace.render(trace, key, this.bridge.drawFacts(key), this.bridge.lang()); };
      const update = () => {
        const ready = !reveal.disabled;
        const info = modules[key];
        let profile = window.AstraModuleProfiles[key][this.bridge.lang() === "en" ? "en" : "zh"];
        if (key === "tarot") {
          const spread=window.AstraTarotSpreads.get(document.getElementById("tarotSpread").value),i=this.bridge.lang()==="en"?1:0;
          profile = {...profile,eyebrow:spread.title[i],focus:spread.focus[i],angles:spread.positions[i],question:spread.questions?.[i]?.[0]||profile.question,mechanism:this.tx(`本局从22张大阿卡纳中不重复选取${spread.count}张，保留正逆位。牌位决定观察角度，牌面提供象征；不代替现实中的判断。`,`This spread selects ${spread.count} distinct cards from 22 Major Arcana, keeping reversals. Positions frame the reflection; the cards do not decide real-world outcomes.`)};
        }
        guide.querySelector("[data-profile-eyebrow]").textContent = profile.eyebrow;
        guide.querySelector("[data-profile-focus]").textContent = profile.focus;
        guide.querySelector("[data-profile-angles]").innerHTML = profile.angles.map(angle => `<li>${esc(angle)}</li>`).join("");
        guide.querySelector("[data-guide-status]").textContent = ready ? this.tx("取象已完成，可以查看解读；返回时会保留本次结果。", "Your symbols are ready. Open the reading; returning preserves this result.") : key === "gua" ? this.tx("逐爻掷六次，或一次成卦；成卦后点选动爻，比较变化。", "Cast one line at a time or complete the draw, then select moving lines to compare changes.") : this.tx(info[4], info[5]);
        screen.querySelector(".ask-input").placeholder = profile.question;
        reveal.title = ready ? this.tx("查看本次结果", "Open this result") : this.tx(info[4], info[5]);
        const steps = guide.querySelectorAll(".journey-steps li");
        [this.tx("1 提问（可选）", "1 Ask (optional)"), this.tx("2 完成取象", "2 Draw symbols"), this.tx("3 阅读或听读", "3 Read or listen")].forEach((text, i) => {
          steps[i].textContent = text; steps[i].classList.toggle("is-current", i === (ready ? 2 : 1));
        });
        guideButton.innerHTML = '<span class="method-guide-icon" aria-hidden="true">?</span><span>' + this.tx("玩法指引", "How it works") + '</span>';
        guideButton.setAttribute("aria-label", this.tx("查看", "About ") + this.tx(info[0], info[1]) + this.tx("玩法指引", ""));
        updateTrace();
      };
      new MutationObserver(update).observe(reveal, { attributes: true, attributeFilter: ["disabled"] });
      if(key === "tarot")document.getElementById("tarotSpread").addEventListener("change",()=>requestAnimationFrame(update));
      guide.update = update;
      guide.updateTrace = updateTrace;
      screen.addEventListener("click", event => { if (!event.target.closest(".result-trace")) requestAnimationFrame(updateTrace); });
      update();
    }
    onLanguage() {
      this.updateReturnEntry();
      if (this.questionIntent) this.syncQuestion(this.tx(...INTENT_QUESTIONS[this.questionIntent]), this.questionIntent);
      document.querySelectorAll(".module-guide").forEach(guide => guide.update());
      document.querySelectorAll(".door").forEach(door => { door.setAttribute("aria-label", door.textContent.trim()); });
    }
    onScreen(name) {
      document.querySelectorAll(".product-nav button").forEach(b => b.removeAttribute("aria-current"));
      const active = name === "home" ? "navHome" : "navExplore";
      document.getElementById(active).setAttribute("aria-current", "page");
      const input = document.querySelector(`[data-screen="${name}"] .ask-input`);
      if (input && this.entry.value.trim()) input.value = this.entry.value;
      this.onLanguage();
    }
    async refreshUsage() {
      if (this.bridge.healthy() !== true || !this.bridge.features().usage) return;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(this.bridge.api("/api/usage"), { signal: controller.signal });
        if (!response.ok) return;
        const usage = await response.json();
        const node = document.getElementById("usageNote");
        if (!usage.limit) { node.hidden = true; return; }
        node.textContent = this.tx(`今日可解读 ${usage.remaining} / ${usage.limit} 次`, `${usage.remaining} / ${usage.limit} readings left today`);
        node.title = this.tx(`恢复时间：${new Date(usage.resetAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}`, `Resets at ${new Date(usage.resetAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}`);
        node.hidden = false;
      } catch (_) {} finally { clearTimeout(timer); }
    }
    retry() { this.bridge.retry(); }
    back() { this.bridge.back(); }
    toast(message) {
      const node = document.getElementById("experienceToast");
      clearTimeout(this.toastTimer); node.textContent = message; node.hidden = false;
      this.toastTimer = setTimeout(() => { node.hidden = true; }, 4200);
    }
    openDialog(title, content, surface = "standard") {
      this.bridge.cancelEntry();
      this.dialog.dataset.surface = surface;
      document.getElementById("experienceTitle").textContent = title;
      this.content.innerHTML = content;
      if (!this.dialog.open) this.dialog.showModal();
      document.getElementById("closeExperience").focus();
    }
    applyPreferences() {
      document.documentElement.dataset.largeText = String(!!this.preferences.largeText);
      document.documentElement.dataset.calmMotion = String(!!this.preferences.calmMotion);
      if (this.bridge.motion) this.bridge.motion(!!this.preferences.calmMotion);
    }
    showHelp() {
      const intro = this.tx("写下具体处境 → 选择一种方式 → 完成取象 → 阅读或听读 → 保存与回看。你可以跳过身份选择，问题也可以留空。", "Describe a situation → choose a method → draw → read or listen → save and reflect. Identity selection and asking a question are optional.");
      this.openDialog(this.tx("帮助与设置", "Help & settings"), `
        <p>${esc(intro)}</p>
        <div class="knowledge-grid">${Object.entries(modules).map(([key, item]) => `<button class="knowledge-link" data-knowledge="${key}"><b>${esc(this.tx(item[0], item[1]))}</b><span>${esc(this.tx(item[2], item[3]))}</span></button>`).join("")}</div>
        <h3>${this.tx("阅读偏好", "Reading preferences")}</h3>
        <p class="muted">${this.tx("语言按钮切换界面文字；已有解读保留生成时的语言，新生成的解读使用当前语言。", "The language button changes the interface. Existing readings keep their original language; new readings use the current language.")}</p>
        <label class="preference-row"><input type="checkbox" id="prefLarge" ${this.preferences.largeText ? "checked" : ""}> ${this.tx("放大正文字号", "Larger body text")}</label>
        <label class="preference-row"><input type="checkbox" id="prefCalm" ${this.preferences.calmMotion ? "checked" : ""}> ${this.tx("减少环境动画", "Reduce ambient motion")}</label>
        <label class="preference-row sound-preference"><span>${this.tx("背景音乐音量", "Background music volume")}</span><input type="range" min="1" max="100" step="1" data-bgm-volume value="${this.bridge.bgmVolume()}" aria-label="${this.tx("背景音乐音量", "Background music volume")}"><output data-bgm-value>${this.bridge.bgmVolume()}%</output></label>
        <h3>${this.tx("数据与内容说明", "Data & content")}</h3>
        <p>${this.tx("真实解读与追问会把问题、取象和相关上下文发送至阶跃星辰；AI 语音会发送待朗读文字。摄像头画面只在本机处理。记录首次需主动保存，之后行动与回看修改会自动更新此浏览器中的同一份记录；换设备或清理浏览器后不会保留。问题草稿仅在当前浏览器会话保留。", "Live readings and follow-ups send your question, symbols and relevant context to StepFun; AI audio sends the text to be spoken. Camera frames stay on your device. Choose to save a report first; later edits to its actions and reflection automatically update the same local record. Records do not sync and may be lost if browser data is cleared. Question drafts last for this browser session.")}</p>
        <p>${this.tx("象征与 AI 解读用于娱乐和自我探索，不代表事实预测，也不能替代专业判断。请不要填写他人隐私或不必要的身份信息。", "Symbols and AI interpretations are for entertainment and self-reflection. They are not factual predictions or a substitute for professional judgment. Avoid unnecessary personal details and other people's private information.")}</p>
        <button class="ghost-btn" id="clearDraft">${this.tx("清空当前问题草稿", "Clear question draft")}</button>`);
      this.content.querySelectorAll("[data-knowledge]").forEach(b => b.addEventListener("click", () => this.showKnowledge(b.dataset.knowledge)));
      this.content.querySelector("[data-bgm-volume]").addEventListener("input", e => this.bridge.setBgmVolume(e.target.value));
      [["prefLarge", "largeText"], ["prefCalm", "calmMotion"]].forEach(([id, key]) => this.content.querySelector(`#${id}`).addEventListener("change", e => {
        this.preferences[key] = e.target.checked; this.applyPreferences(); this.write(PREFS_KEY, this.preferences);
      }));
      document.getElementById("clearDraft").addEventListener("click", () => { this.syncQuestion(""); this.toast(this.tx("当前问题已清空", "Question draft cleared")); });
    }
    showKnowledge(key) {
      const info = modules[key];
      const symbols = { tarot: "✦", gua: "☯", number: "∴", mansion: "✧", rune: "ᚱ", oracle: "籤" };
      const atmosphere = {
        tarot: ["让三张牌依次展开，为心事留出一片可观看的星空。", "Let three cards unfold, making a little room around the question you carry."],
        gua: ["让铜钱落下，在阴阳的变化之间，慢慢看清此刻。", "Let the coins fall, and take a moment to reflect through the changing lines."],
        number: ["写下一组与你有关的数字，听见其中的节奏。", "Bring a number that means something to you, and listen for its rhythm."],
        mansion: ["拨动星环，暂借一道星光，换个角度看待当下。", "Turn the ring of stars, and borrow a different perspective on this moment."],
        rune: ["让三枚符石落定，回望来路，也照看眼前的变化。", "Let three runes settle, reflecting on the road behind and the changes ahead."],
        oracle: ["让一支签从静处浮现，从一首短诗里，找到此刻的回声。", "Let a lot emerge from stillness, and find a moment of recognition in its poem."]
      };
      let profile = window.AstraModuleProfiles[key][this.bridge.lang() === "en" ? "en" : "zh"];
      if(key==="tarot"){const spread=window.AstraTarotSpreads.get(document.getElementById("tarotSpread").value),i=this.bridge.lang()==="en"?1:0;profile={...profile,eyebrow:spread.title[i],focus:spread.focus[i],angles:spread.positions[i],question:spread.questions?.[i]?.[0]||profile.question,mechanism:this.tx(`本局从22张大阿卡纳中不重复选取${spread.count}张，保留正逆位。牌位决定观察角度，牌面提供象征；不代替现实中的判断。`,`This spread selects ${spread.count} distinct cards from 22 Major Arcana, keeping reversals. Positions frame the reflection; the cards do not decide real-world outcomes.`)};}
      this.openDialog(this.tx(info[0], info[1]), `
        <article class="ritual-guide" data-method="${key}">
          <div class="ritual-seal" aria-hidden="true"><i></i><span>${symbols[key]}</span></div>
          <p class="ritual-eyebrow">${esc(profile.eyebrow)}</p>
          <p class="ritual-intro">${esc(profile.focus)}</p>
          <ol class="ritual-instructions">
            <li><span>01</span><div><b>${this.tx("可以这样问", "A useful question")}</b><p>${esc(profile.question)}</p></div></li>
            <li><span>02</span><div><b>${this.tx("让取象慢慢发生", "Let the symbols unfold")}</b><p>${esc(this.tx(info[4], info[5]))}</p></div></li>
            <li><span>03</span><div><b>${this.tx("从这些角度读", "How to read the result")}</b><p>${esc(profile.angles.join(this.tx("；", "; ")))}</p></div></li>
          </ol>
          <details class="ritual-about"><summary>${this.tx("取象是怎样产生的？", "Where does this result come from?")}</summary><p>${esc(profile.mechanism)}</p></details>
          <button class="primary-btn ritual-enter" id="knowledgeTry">${this.tx("步入此境", "Enter this realm")} <span aria-hidden="true">→</span></button>
        </article>`, "method");
      document.getElementById("knowledgeTry").addEventListener("click", () => { this.dialog.close(); this.bridge.open(key); });
    }
    saveCurrent(quiet) {
      const current = this.bridge.current();
      if (!current) return false;
      const record = JSON.parse(JSON.stringify(current));
      const next = [record, ...this.records.filter(r => r.id !== record.id)].slice(0, 30);
      if (!this.write(RECORDS_KEY, next)) { this.dirtyReading = current; this.failedSave = current; this.updateSaveState(true); return false; }
      this.records = next;
      this.updateReturnEntry();
      this.dirtyReading = null;
      this.failedSave = null;
      this.updateSaveState();
      this.setSaveLabel(true);
      if (!quiet) this.toast(this.tx("已保存，可在“我的记录”中回看。", "Saved. Find it in My records."));
      return true;
    }
    setSaveLabel(saved) {
      const button = document.getElementById("readingSave");
      const full = saved ? this.tx("已保存 · 更新", "Saved · update") : this.tx("保存解读", "Save reading");
      const short = saved ? this.tx("已保存", "Saved") : this.tx("保存", "Save");
      button.innerHTML = `<span class="dock-label-wide">${esc(full)}</span><span class="dock-label-short" aria-hidden="true">${esc(short)}</span>`;
      button.setAttribute("aria-label", full);
    }
    updateSaveState(failed = false) {
      const node = document.getElementById("notebookSaveState");
      if (!node) return;
      const current = this.bridge.current();
      failed = failed || this.failedSave === current;
      const saved = current && this.records.some(r => r.id === current.id);
      node.dataset.state = failed ? "error" : saved ? "saved" : "unsaved";
      node.textContent = failed ? this.tx("保存失败 · 本页修改仍保留，请重试", "Save failed · Your edits remain here. Retry saving.") : saved ? this.tx("已保存 · 修改自动更新", "Saved · Edits update automatically") : this.tx("尚未保存 · 保存星笺后可回看", "Not saved yet · Save this note to return to it");
    }
    notesChanged(current) {
      this.dirtyReading = current;
      if (this.records.some(r => r.id === current.id) || this.failedSave === current) this.saveCurrent(true);
      else this.updateSaveState();
    }
    flushSavedEdits() {
      if (!this.dirtyReading || this.dirtyReading !== this.bridge.current() || !this.records.some(r => r.id === this.dirtyReading.id) && this.failedSave !== this.dirtyReading) return true;
      return this.saveCurrent(true);
    }
    showRecords() {
      if (!this.flushSavedEdits()) return;
      this.openDialog(this.tx("我的记录", "My records"), `<p class="muted">${this.tx("仅保存于当前浏览器，最多 30 份。主动保存的内容包含原问题、解读与行动备注。", "Stored only in this browser, up to 30 records. Saved records include your question, report and action notes.")}</p><label class="record-search-label">${this.tx("搜索记录", "Search records")}<input id="recordSearch" type="search" placeholder="${this.tx("问题、标题或体系", "Question, title or method")}"></label><div id="recordList"></div>`);
      const draw = query => {
        const list = document.getElementById("recordList");
        const records = this.records.filter(r => [r.data.question, r.r.tone, ...modules[r.type].slice(0, 2)].join(" ").toLowerCase().includes(query.toLowerCase()));
        list.innerHTML = records.length ? records.map(r => `<article class="record-card"><div><b>${esc(r.r.tone)}</b><small>${esc(new Date(r.createdAt).toLocaleString(this.bridge.lang() === "en" ? "en-US" : "zh-CN"))} · ${esc(this.tx(...modules[r.type].slice(0, 2)))} · ${r.isLive ? "AI" : this.tx("示例", "Sample")}</small><p>${esc(r.data.question || this.tx("未填写问题", "No question provided"))}</p><p class="record-next">${esc(this.tx("下一步：", "Next step: ") + (r.notes?.actions?.length ? (r.notes.actions.find(a => !a.done)?.text || this.tx("行动已完成，回来写写你的发现", "Steps complete; return to reflect")) : r.r.actions[0] || this.tx("留下一句回看", "Leave a reflection")))}<br>${esc(this.tx("已践行 ", "Steps tried: ") + (r.notes?.actions || []).filter(a => a.done).length + " / " + (r.notes?.actions || r.r.actions).length)}</p></div><div class="record-actions"><button class="primary-btn" data-record-open="${esc(r.id)}">${this.tx("打开记录", "Open")}</button><button class="ghost-btn" data-record-delete="${esc(r.id)}">${this.tx("删除", "Delete")}</button></div></article>`).join("") : `<p class="empty-state">${this.tx("还没有匹配的记录。在解读页点击“保存到我的记录”，便可在这里回看。", "No matching records. Use Save to my records on a report to find it here.")}</p>`;
        list.querySelectorAll("[data-record-open]").forEach(b => b.addEventListener("click", () => {
          const record = this.records.find(r => r.id === b.dataset.recordOpen); if (!record) return;
          this.dialog.close(); this.bridge.restore(record);
        }));
        list.querySelectorAll("[data-record-delete]").forEach(b => b.addEventListener("click", () => {
          if (!b.dataset.confirm) { b.dataset.confirm = "1"; b.textContent = this.tx("再点一次删除", "Tap again to delete"); return; }
          const next = this.records.filter(r => r.id !== b.dataset.recordDelete);
          if (this.write(RECORDS_KEY, next)) { this.records = next; this.updateReturnEntry(); draw(document.getElementById("recordSearch").value); }
        }));
      };
      document.getElementById("recordSearch").addEventListener("input", e => draw(e.target.value)); draw("");
    }
    onReading(current) {
      if (!current) return;
      if (this.boundReading !== current) this.noteOpen = { action: false, followup: false };
      if (this.boundReading !== current && this.followupAbort) this.followupAbort.abort();
      this.boundReading = current;
      document.getElementById("readingBack").textContent = current.replayed || current.shared ? this.tx("重新取象", "New draw") : this.tx("返回取象", "Back to symbols");
      this.refreshUsage();
      if (!current.id) current.id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      if (!current.createdAt) current.createdAt = Date.now();
      if (!current.language) current.language = this.bridge.lang();
      if (!current.notes || !Array.isArray(current.notes.actions)) current.notes = { actions: (current.r.actions || []).map(text => ({ text, done: false })), reflection: "" };
      if (!Array.isArray(current.conversation)) current.conversation = [];
      this.setSaveLabel(this.records.some(r => r.id === current.id));
      document.querySelectorAll(".reading-companion").forEach(n => n.remove());
      const companion = document.createElement("section");
      companion.className = "reading-companion";
      const canFollowup = current.isLive && !current.shared;
      const asking = this.followupAbort && this.followupCurrent === current;
      const pen = '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 24l3-8L23 4l5 5-12 12-8 3zm3-8l5 5M7 28h18M8 24l-2 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const stars = '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 4l3.3 8.7L28 16l-8.7 3.3L16 28l-3.3-8.7L4 16l8.7-3.3L16 4zM26 3v6M23 6h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      companion.innerHTML = `
        <header class="companion-heading"><span aria-hidden="true">✦</span><p>${this.tx("星语之后，留一点回响", "Let this reading leave an echo")}</p></header>
        <details class="action-notebook star-note" ${this.noteOpen.action ? "open" : ""}>
          <summary><span class="companion-seal">${pen}</span><span class="companion-label"><small>${this.tx("01 · 写给未来", "01 · TO YOUR FUTURE SELF")}</small><strong>${this.tx("我的行动与回看", "My actions & reflection")}</strong><span>${this.tx("把此刻的启示，写成下一步。", "Turn a reflection into a small next step.")}</span></span><span class="companion-expand" aria-hidden="true"></span></summary>
          <div class="companion-content">
            <div class="notebook-intro"><p class="muted">${this.tx("把建议改成你愿意尝试的小事，完成一件，就点亮一笔。", "Make each suggestion your own. Mark a step when you have tried it.")}</p><span id="actionProgress" role="status"></span></div>
            <div id="actionChecks">${current.notes.actions.map((a, i) => `<label class="action-check"><input type="checkbox" data-action-done="${i}" aria-label="${this.tx("标记行动完成", "Mark step complete")} ${i + 1}" ${a.done ? "checked" : ""}><span class="action-index" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><textarea rows="1" maxlength="180" data-action-text="${i}" aria-label="${this.tx("编辑行动", "Edit action")} ${i + 1}">${esc(a.text)}</textarea></label>`).join("")}</div>
            <label class="notebook-reflection-label" for="reflectionNote">${this.tx("后来，星光落在何处？", "Where did the starlight lead?")}<span>${this.tx("记下后来发生的事，或此刻的心情。", "Write what happened next, or how you feel now.")}</span></label>
            <textarea id="reflectionNote" rows="3" maxlength="1200" placeholder="${this.tx("等过些日子，再回来写写你的发现……", "Return in a little while and write what you discovered…")}">${esc(current.notes.reflection)}</textarea>
            <div class="companion-footer"><span id="notebookSaveState" role="status"></span><button class="ghost-btn companion-submit" id="saveReflection">${this.tx("保存星笺", "Save my star note")} <span aria-hidden="true">↗</span></button></div>
          </div>
        </details>
        <details class="followup-panel star-note" ${this.noteOpen.followup ? "open" : ""}>
          <summary><span class="companion-seal">${stars}</span><span class="companion-label"><small>${this.tx("02 · 同一片星图", "02 · UNDER THE SAME STARS")}</small><strong>${this.tx("再问星语", "Ask the stars again")}</strong><span>${this.tx("围绕这次解读，继续聊聊心里的疑问。", "Explore a question about this reading.")}</span></span><span class="companion-expand" aria-hidden="true"></span></summary>
          <div class="companion-content">
            <p class="muted followup-context" id="followupAvailability">${canFollowup ? this.tx("沿用这次取象，继续探索你的问题。", "Explore your question with the same symbols.") : this.tx("这片星图正在回放。生成自己的真实 AI 解读后，就能围绕它继续追问。", "This is a sample or shared replay. Generate your own live AI reading to ask a follow-up.")}</p>
            <div id="followupMessages" role="log" aria-live="polite"></div>
            <form id="followupForm"><label for="followupQuestion">${this.tx("还有哪一句，想再问得深一些？", "What would you like to explore a little further?")}</label><textarea id="followupQuestion" rows="2" maxlength="400" placeholder="${this.tx("例如：如果只迈出一小步，我可以从哪里开始？", "For example: where could I begin with one small step?")}" ${!canFollowup || asking ? "disabled" : ""}>${esc(this.followupDrafts.get(current.id) || "")}</textarea><div class="companion-footer"><button class="ghost-btn companion-submit" type="submit" ${!canFollowup || asking ? "disabled" : ""}>${this.tx("寄出追问", "Send my question")} <span aria-hidden="true">↗</span></button></div><span id="followupStatus" role="status">${asking ? this.tx("正在结合本次解读思考…", "Reflecting on this reading…") : ""}</span></form>
          </div>
        </details>
        <div class="reading-feedback"><span>${this.tx("这份解读对你有帮助吗？", "Was this useful?")}</span>${[this.tx("有帮助", "Helpful"), this.tx("太泛", "Too general"), this.tx("没有回应问题", "Missed my question"), this.tx("内容有误", "Content issue")].map((label, i) => `<button class="ghost-btn" data-reading-feedback="${i}" aria-pressed="${current.feedback === i}">${esc(label)}</button>`).join("")}</div>`;
      document.getElementById("readingBody").appendChild(companion);
      this.placeOverview();
      document.querySelector(".method-reading-lens")?.remove();
      const readingProfile = window.AstraModuleProfiles[current.type][this.bridge.lang() === "en" ? "en" : "zh"];
      const lens = document.createElement("details"); lens.className = "method-reading-lens";
      if (current.type === "gua") {
        lens.innerHTML = `<summary>${this.tx("这份解读，应该怎么看？", "How should I read this?")}</summary><p>${esc(readingProfile.focus)}</p><ul>${readingProfile.angles.map(angle => `<li>${esc(angle)}</li>`).join("")}</ul>`;
      } else {
        window.AstraDrawTrace.render(lens, current.type, this.bridge.describeDraw(current.type, current.data), this.bridge.lang());
        lens.open = false;
      }
      document.querySelector(".reading-quick").appendChild(lens);
      window.AstraReadingWorkbench?.mount(this, current);
      this.resizeActionFields();
      [[".action-notebook", "action"], [".followup-panel", "followup"]].forEach(([selector, key]) => {
        companion.querySelector(selector).addEventListener("toggle", e => {
          if (this.boundReading !== current) return;
          this.noteOpen[key] = e.target.open;
          if (e.target.open) requestAnimationFrame(() => this.resizeActionFields());
        });
      });
      this.updateSaveState(this.dirtyReading === current && this.records.some(r => r.id === current.id));
      const updateProgress = () => {
        const done = current.notes.actions.filter(a => a.done).length;
        document.getElementById("actionProgress").textContent = current.notes.actions.length ? this.tx(`已践行 ${done} / ${current.notes.actions.length} 件`, `${done} / ${current.notes.actions.length} steps tried`) : this.tx("留下一句回看", "Leave yourself a reflection");
      };
      updateProgress();
      companion.querySelectorAll("[data-action-done]").forEach(input => input.addEventListener("change", () => { current.notes.actions[Number(input.dataset.actionDone)].done = input.checked; updateProgress(); this.notesChanged(current); }));
      companion.querySelectorAll("[data-action-text]").forEach(input => input.addEventListener("input", () => { current.notes.actions[Number(input.dataset.actionText)].text = input.value; this.resizeActionFields(); this.notesChanged(current); }));
      document.getElementById("reflectionNote").addEventListener("input", e => { current.notes.reflection = e.target.value; this.notesChanged(current); });
      document.getElementById("saveReflection").addEventListener("click", () => this.saveCurrent());
      companion.querySelectorAll("[data-reading-feedback]").forEach(button => button.addEventListener("click", () => {
        current.feedback = Number(button.dataset.readingFeedback);
        companion.querySelectorAll("[data-reading-feedback]").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
        if (this.records.some(r => r.id === current.id)) this.saveCurrent(true);
        this.toast(this.tx("已记下反馈；可以通过保存记录保留它。", "Feedback noted. Save this report to keep it."));
      }));
      this.renderConversation(current);
      document.getElementById("followupQuestion").addEventListener("input", e => this.followupDrafts.set(current.id, e.target.value));
      document.getElementById("followupForm").addEventListener("submit", e => { e.preventDefault(); this.followup(current); });
    }
    renderConversation(current) {
      const node = document.getElementById("followupMessages"); if (!node) return;
      node.innerHTML = current.conversation.map(message => `<div class="conversation-message ${message.role === "user" ? "from-user" : "from-assistant"}"><b>${message.role === "user" ? this.tx("你", "You") : "ASTRA"}</b><div class="conversation-content">${message.role === "user" ? `<p>${esc(message.content)}</p>` : window.AstraText.blocks(message.content)}</div></div>`).join("");
    }
    async followup(current) {
      if (this.followupAbort || current !== this.bridge.current() || !current.isLive || current.shared) return;
      const input = document.getElementById("followupQuestion");
      const question = input.value.trim(); if (!question) { input.focus(); return; }
      const button = document.querySelector("#followupForm button");
      const setStatus = text => { const node = document.getElementById("followupStatus"); if (node && current === this.bridge.current()) node.textContent = text; };
      button.disabled = true; input.disabled = true;
      const ctrl = new AbortController(); this.followupAbort = ctrl; this.followupCurrent = current;
      const timer = setTimeout(() => ctrl.abort(), 30000);
      setStatus(this.tx("正在结合本次解读思考…", "Reflecting on this reading…"));
      try {
        const response = await fetch(this.bridge.api("/api/followup"), { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
          body: JSON.stringify({ system: current.type, lang: current.language, outputLanguage:current.outputLanguage||current.r.outputLanguage||current.language, question, reading: current.r, history: current.conversation.slice(-6) }) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result.answer || current !== this.bridge.current()) return;
        current.conversation.push({ role: "user", content: question }, { role: "assistant", content: String(result.answer) });
        this.renderConversation(current); this.followupDrafts.delete(current.id);
        const liveInput = document.getElementById("followupQuestion"); if (liveInput) liveInput.value = "";
        if (this.records.some(r => r.id === current.id)) this.saveCurrent(true);
        setStatus(this.tx("已回复", "Reply ready"));
      } catch (_) {
        setStatus(this.tx("追问暂未成功，输入已保留，可以重试。", "The follow-up failed. Your question is preserved for retry."));
      } finally {
        clearTimeout(timer); if (this.followupAbort === ctrl) { this.followupAbort = null; this.followupCurrent = null; }
        if (current === this.bridge.current()) {
          const liveInput = document.getElementById("followupQuestion"), liveButton = document.querySelector("#followupForm button");
          if (liveInput) liveInput.disabled = !current.isLive || !!current.shared;
          if (liveButton) liveButton.disabled = !current.isLive || !!current.shared;
        }
      }
    }
  }
  AstraExperience.translations = translations;
  window.AstraExperience = AstraExperience;
})();
