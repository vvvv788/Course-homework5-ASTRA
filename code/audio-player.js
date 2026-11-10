/* ASTRA chapter navigation with paragraph-level playback and highlighting. */
(function () {
  "use strict";
  class AstraAudioPlayer {
    constructor(options) {
      this.options = options;
      this.diagnostics = [];
      this.phaseStarted = performance.now();
      this.el = document.getElementById("audioPlayer");
      this.button = document.getElementById("readingSpeak");
      this.segments = [];
      this.chapters = [];
      this.cache = new Map();
      this.epoch = 0;
      this.run = 0;
      this.index = 0;
      this.status = "idle";
      this.rate = 1;
      this.follow = true;
      this.desired = false;
      this.audio = null;
      this.highlighted = null;
      this.timer = null;
      this.playbackTimer = null;
      this.media = new Audio();
      this.media.id = "oracleMedia";
      this.media.hidden = true;
      this.media.setAttribute("playsinline", "");
      this.media.setAttribute("aria-hidden", "true");
      this.media.preload = "auto";
      this.el.appendChild(this.media);
      this.scope = "all";
      this.voice = "";
      this.readingLanguage = "zh";
      this.languageOverride = "";
      this.voiceCatalog = null;
      this.voiceReady = Promise.resolve();
      this.errorKind = "";
      const settings = this.el.querySelector("[data-audio=settings]");
      const optionsPanel = this.el.querySelector("#audioOptions");
      this.diagnosticButton = document.createElement("button");
      this.diagnosticButton.className = "ghost-btn"; this.diagnosticButton.hidden = true;
      this.diagnosticButton.addEventListener("click", () => {
        const url = URL.createObjectURL(new Blob([JSON.stringify({version:1, events:this.diagnostics}, null, 2)], {type:"application/json"}));
        const link = document.createElement("a"); link.href = url; link.download = "astra-audio-diagnostics.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      optionsPanel.appendChild(this.diagnosticButton);
      const tools = this.el.querySelector("#readingTools");
      const more = this.el.querySelector("[data-audio=more]");
      const closeMore = () => { tools.dataset.expanded = "false"; more.setAttribute("aria-expanded", "false"); };
      const closeSettings = () => { optionsPanel.hidden = true; settings.setAttribute("aria-expanded", "false"); };
      more.addEventListener("click", () => {
        closeSettings();
        const expanded = tools.dataset.expanded !== "true";
        tools.dataset.expanded = String(expanded); more.setAttribute("aria-expanded", String(expanded));
      });
      tools.addEventListener("click", event => { if (event.target.closest(".dock-extra button")) closeMore(); });
      settings.addEventListener("click", () => {
        closeMore();
        optionsPanel.hidden = !optionsPanel.hidden;
        settings.setAttribute("aria-expanded", String(!optionsPanel.hidden));
      });
      this.el.addEventListener("keydown", event => {
        if (event.key === "Escape" && tools.dataset.expanded === "true") { event.preventDefault(); event.stopPropagation(); closeMore(); more.focus(); return; }
        if (event.key === "Escape" && !optionsPanel.hidden) { event.preventDefault(); event.stopPropagation(); closeSettings(); settings.focus(); }
      });
      document.addEventListener("pointerdown", event => { if (!this.el.contains(event.target)) { closeSettings(); closeMore(); } });
      this.el.querySelector("[data-audio=toggle]").addEventListener("click", () => this.toggle());
      if (this.button !== this.el.querySelector("[data-audio=toggle]")) this.button.addEventListener("click", () => this.toggle());
      this.el.querySelector("[data-audio=prev]").addEventListener("click", () => this.playChapter(this.chapterIndex() - 1));
      this.el.querySelector("[data-audio=next]").addEventListener("click", () => this.playChapter(this.chapterIndex() + 1));
      this.el.querySelector("[data-audio=chapter]").addEventListener("change", e => this.playChapter(Number(e.target.value)));
      this.el.querySelector("[data-audio=scope]").addEventListener("change", e => {
        this.scope = e.target.value;
        if (this.scope === "all") {
          if (this.desired) this.playAt(0);
          else { this._silence(); this.index = 0; this.status = "idle"; }
        }
        this.update();
      });
      this.el.querySelector("[data-audio=voice]").addEventListener("change", e => this.changeVoice(e.target.value));
      this.el.querySelector("[data-audio=language]").addEventListener("change", e => this.changeLanguage(e.target.value));
      this.el.querySelector("[data-audio=rate]").addEventListener("change", e => {
        this.rate = Number(e.target.value);
        if (this.audio) this.audio.playbackRate = this.rate;
      });
      this.el.querySelector("[data-audio=follow]").addEventListener("click", () => {
        this.follow = !this.follow;
        this.update();
        if (this.follow && this.highlighted) this.options.scroll(this.highlighted);
      });
      this.el.querySelector("[data-audio=seek]").addEventListener("input", e => {
        if (this.audio && Number.isFinite(this.audio.duration)) this.audio.currentTime = Number(e.target.value);
      });
      // User scroll always wins. Programmatic smooth scrolling emits neither wheel nor touchstart.
      document.querySelectorAll("#readingBody, [data-screen=reading]").forEach(node => {
        ["wheel", "touchstart", "pointerdown", "keydown"].forEach(event => node.addEventListener(event, e => {
          if (event === "keydown" && !["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) return;
          if (this.desired && this.follow) { this.follow = false; this.update(); }
        }, { passive: true }));
      });
      const updatePlayerSpace = () => {
        const height = this.el.hidden ? 0 : Math.ceil(innerHeight - this.el.getBoundingClientRect().top + 16);
        document.documentElement.style.setProperty("--oracle-player-height", height + "px");
        this.paintTransportLabel();
        if (innerWidth > 680) closeMore();
      };
      if (typeof ResizeObserver !== "undefined") new ResizeObserver(updatePlayerSpace).observe(this.el);
      window.addEventListener("resize", updatePlayerSpace);
      window.addEventListener("pagehide", () => this.stop());
    }
    diagnose(phase, kind = "") {
      const now = performance.now();
      this.diagnostics.push({ phase, kind, elapsedMs: Math.round(now - this.phaseStarted), language: this.speechLanguage(), voice: this.voice || "default" });
      this.phaseStarted = now;
      if (this.diagnostics.length > 100) this.diagnostics.shift();
    }
    tx(zh, en) { return this.options.lang() === "en" ? en : zh; }
    paintTransportLabel() {
      const label = this.el.querySelector("[data-audio=toggle-label]");
      if (label && this.toggleLabel) label.textContent = innerWidth <= 680 ? this.compactToggleLabel : this.toggleLabel;
    }
    speechLanguage() { return this.languageOverride || this.readingLanguage; }
    chapterIndex() { return this.segments[this.index]?.chapter ?? 0; }
    playChapter(index) {
      const chapter = this.chapters[Math.max(0, Math.min(this.chapters.length - 1, index))];
      if (!chapter) return;
      this.pendingSeek = null;
      this.playAt(chapter.start);
    }
    continuesTo(index) {
      return index < this.segments.length && (this.scope === "all" || this.segments[index].chapter === this.chapterIndex());
    }
    captureState() {
      return { index: this.index, offset: this.audio ? this.audio.currentTime : this.pendingSeek || 0, desired: this.desired, status: this.status, errorKind: this.errorKind, voice: this.voice, scope: this.scope, follow: this.follow, rate: this.rate, languageOverride: this.languageOverride };
    }
    async restoreState(saved) {
      if (!saved || !this.segments.length) return;
      const epoch = this.epoch;
      this.languageOverride = saved.languageOverride;
      await this.voiceReady;
      if (epoch !== this.epoch) return;
      this.index = Math.min(saved.index, this.segments.length - 1);
      this.voice = saved.voice; this.scope = saved.scope; this.follow = saved.follow; this.rate = saved.rate;
      this.pendingSeek = saved.offset;
      this.el.querySelector("[data-audio=rate]").value = String(this.rate);
      if (saved.desired) this.playAt(this.index);
      else { this.status = saved.status; this.errorKind = saved.errorKind; this.update(); }
    }
    setReading(body, options) {
      this.stop();
      this.apiAvailable = !options || options.apiAvailable !== false;
      const original = Array.from(body.querySelectorAll(".tone, .r-card .txt p, .synthesis p, .actions-list li, .closing")).map(n => n.textContent).join("\n");
      this.explicitSourceLanguage=options?.sourceLanguage||"";
      this.readingLanguage = this.explicitSourceLanguage || window.AstraSpeechLanguage.resolveSpeechLanguage(original, this.options.speechLang());
      this.languageOverride = "";
      this.languageNotice = "";
      this.scope = "all";
      this.voice = "";
      this.voiceReady = this.loadVoices();
      this.segments = [];
      this.chapters = [];
      body.querySelectorAll(".tone, .r-card .txt p, .synthesis p, .actions-list li, .closing").forEach(node => {
        if (!node.textContent.trim()) return;
        const parent = node.closest(".r-card");
        // A chapter is a semantic section. Paragraphs remain private playback units
        // so text highlighting and bounded requests retain their original precision.
        const owner = parent || node.closest(".synthesis, .actions-list") || node;
        const label = parent ? [parent.querySelector(".pos"), parent.querySelector(".cname")].filter(Boolean).map(x => x.textContent.trim()).join(" · ")
          : node.closest(".actions-list") ? this.tx("行动建议", "Next steps")
          : node.closest(".synthesis") ? this.tx("综合解读", "Synthesis")
          : node.matches(".closing") ? this.tx("结语", "Closing") : this.tx("开篇星语", "Opening");
        let chapter = this.chapters[this.chapters.length - 1];
        if (!chapter || chapter.owner !== owner) {
          chapter = { owner, label, start: this.segments.length, end: this.segments.length };
          this.chapters.push(chapter);
        }
        const chapterIndex = this.chapters.length - 1;
        // Bounded requests without ever truncating a paragraph or a complete reading.
        let text = node.textContent.trim();
        const segmentLanguage = this.explicitSourceLanguage || window.AstraSpeechLanguage.resolveSpeechLanguage(text, this.readingLanguage);
        if (parent && node === parent.querySelector(".txt p") && window.AstraSpeechLanguage.resolveSpeechLanguage(label, segmentLanguage) === segmentLanguage) text = label + (segmentLanguage === "zh" ? "。" : ". ") + text;
        const sentences = text.match(/[^。！？.!?]+[。！？.!?]*|[。！？.!?]+/gu) || [text];
        let chunk = "";
        const push = () => {
          if (chunk.trim()) this.segments.push({ node, label, chapter: chapterIndex, text: chunk.trim(), lang: segmentLanguage });
          chapter.end = this.segments.length;
          chunk = "";
        };
        sentences.forEach(sentence => {
          if (chunk.length + sentence.length > 900) push();
          while (sentence.length > 900) { chunk = sentence.slice(0, 900); push(); sentence = sentence.slice(900); }
          chunk += sentence;
        });
        push();
      });
      const select = this.el.querySelector("[data-audio=chapter]");
      select.replaceChildren(...this.chapters.map((chapter, i) => new Option(`${i + 1}. ${chapter.label}`, String(i))));
      this.el.hidden = !this.segments.length;
      document.body.classList.toggle("has-audio-player", !!this.segments.length);
      this.update();
    }
    async loadVoices() {
      const epoch = this.epoch;
      let saved = "";
      try { saved = localStorage.getItem("astra.voice." + this.speechLanguage()) || ""; } catch (_) {}
      // One catalog contains every language. Switching languages need not wait
      // on a second catalog request before preparing the selected voice.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        if (!this.voiceCatalog) {
          const response = await fetch(this.options.endpoint().replace(/\/tts(?:\?.*)?$/, "/voices"), { signal: controller.signal });
          if (response.ok) {
            const catalog = await response.json();
            if (epoch === this.epoch && catalog.voices && catalog.defaults) this.voiceCatalog = catalog;
          }
        }
      } catch (_) { /* Keep the last valid catalog and configured default available. */ }
      finally { clearTimeout(timeout); }
      if (epoch !== this.epoch) return;
      const voices = this.voiceCatalog && this.voiceCatalog.voices[this.speechLanguage()] || [];
      if (voices.some(v => v.id === saved)) this.voice = saved;
      else if (saved.startsWith("device:")) { try { localStorage.removeItem("astra.voice." + this.speechLanguage()); } catch (_) {} }
      this.renderVoices();
    }
    renderVoices() {
      const select = this.el.querySelector("[data-audio=voice]");
      const lang = this.speechLanguage();
      const fallback = [
        { id: "wenroushunv", name: "温柔女声", nameEn: "Gentle female" },
        { id: "zixinnansheng", name: "沉稳男声", nameEn: "Steady male" },
        { id: "zhixingjiejie", name: "知性女声", nameEn: "Thoughtful female" },
        { id: "linjiajiejie", name: "邻家女声", nameEn: "Friendly female" },
        { id: "cixingnansheng", name: "磁性男声", nameEn: "Resonant male" },
        { id: "ruyananshi", name: "儒雅男声", nameEn: "Refined male" }
      ];
      if (lang === "en") fallback[0] = { id: "Lisa", name: "Lisa · 轻柔女声", nameEn: "Lisa · gentle female" };
      const presets = this.voiceCatalog && this.voiceCatalog.voices[lang] || fallback;
      const defaultId = this.voiceCatalog && this.voiceCatalog.defaults[lang] || (["ja", "ko", "fr", "es"].includes(lang) ? "zixinnansheng" : fallback[0].id);
      const defaultVoice = presets.find(v => v.id === defaultId) || presets[0];
      const choices = [defaultVoice, ...presets.filter(v => v.id !== defaultId)];
      select.replaceChildren(...choices.map(v => new Option((this.options.lang() === "en" ? v.nameEn : v.name) + (v === defaultVoice ? this.tx(" · 默认", " · default") : ""), v === defaultVoice ? "" : v.id)));
      select.value = this.voice !== defaultId && choices.some(v => v.id === this.voice) ? this.voice : "";
    }
    changeVoice(value) {
      const playing = this.desired;
      this._silence(playing);
      this.epoch++;
      this.cache.forEach(entry => { entry.controller.abort(); if (entry.url) URL.revokeObjectURL(entry.url); });
      this.cache.clear();
      this.voice = value;
      this.errorKind = "";
      try { localStorage.setItem("astra.voice." + this.speechLanguage(), value); } catch (_) {}
      if (playing) this.playAt(this.index);
      else { this.desired = false; this.status = "idle"; this.update(); }
    }
    changeLanguage(value) {
      // A language override corrects detection; it is not a translation request.
      // Do not send a Chinese reading as an unrelated language to the provider.
      if (value && value !== this.readingLanguage && !this.segments.some(segment => segment.lang === value)) {
        this.languageNotice = "original";
        this.update();
        return;
      }
      this.languageNotice = "";
      if (value === this.languageOverride) { this.update(); return; }
      const playing = this.desired;
      this._silence(playing);
      this.epoch++;
      this.cache.forEach(entry => { entry.controller.abort(); if (entry.url) URL.revokeObjectURL(entry.url); });
      this.cache.clear();
      this.languageOverride = value;
      this.voice = "";
      this.errorKind = "";
      this.voiceReady = this.loadVoices();
      if (playing) this.playAt(this.index);
      else { this.desired = false; this.status = "idle"; this.update(); }
    }
    _fail(kind) {
      this.diagnose("error", kind);
      this.desired = false;
      this._silence();
      this.status = "error";
      this.errorKind = kind;
      if (this.highlighted) { this.highlighted.classList.remove("is-speaking"); this.highlighted.removeAttribute("aria-current"); }
      this.highlighted = null;
      this.update();
    }
    _silence(keepDucked = false) {
      this.run++;
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
      clearInterval(this.timer);
      this.timer = null;
      if (this.audio) {
        this.audio.onended = this.audio.onerror = this.audio.ontimeupdate = this.audio.onloadedmetadata = null;
        this.audio.pause(); this.audio.removeAttribute("src"); this.audio.load(); this.audio = null;
      }
      this.options.duck(keepDucked ? .2 : 1);
    }
    stop() {
      this.el.querySelector("#audioOptions").hidden = true;
      this.el.querySelector("[data-audio=settings]").setAttribute("aria-expanded", "false");
      this.desired = false;
      this._silence();
      this.epoch++;
      this.cache.forEach(entry => { entry.controller.abort(); if (entry.url) URL.revokeObjectURL(entry.url); });
      this.cache.clear();
      this.index = 0;
      this.pendingSeek = null;
      this.status = "idle";
      this.errorKind = "";
      this.el.querySelector("#readingTools").dataset.expanded = "false";
      this.el.querySelector("[data-audio=more]").setAttribute("aria-expanded", "false");
      if (this.highlighted) { this.highlighted.classList.remove("is-speaking"); this.highlighted.removeAttribute("aria-current"); }
      this.highlighted = null;
      this.el.hidden = true;
      document.body.classList.remove("has-audio-player");
      this.update();
    }
    pause() {
      this.diagnose("paused");
      this.desired = false;
      if (this.audio) this.audio.pause();
      clearTimeout(this.timer);
      this.options.duck(1);
      this.status = "paused";
      this.update();
    }
    async toggle() {
      if (!this.segments.length) return;
      if (this.options.prepare) this.options.prepare();
      if (this.desired) { this.pause(); return; }
      this.desired = true;
      if (this.status === "paused" && this.audio) {
        const run = this.run, audio = this.audio;
        try { await audio.play(); if (run !== this.run || !this.desired) return; this.status = "loading"; this._watchMedia(audio, run); }
        catch (error) { if (run === this.run) this._fail(error.name === "NotAllowedError" ? "blocked" : "playback"); }
        this.update(); return;
      }
      if (this.status === "ended") this.index = this.scope === "all" ? 0 : this.chapters[this.chapterIndex()].start;
      this.playAt(this.index);
    }
    _mark() {
      const segment = this.segments[this.index];
      if (!segment) return;
      if (this.highlighted) { this.highlighted.classList.remove("is-speaking"); this.highlighted.removeAttribute("aria-current"); }
      this.highlighted = segment.node;
      this.highlighted.classList.add("is-speaking");
      this.highlighted.setAttribute("aria-current", "true");
      if (this.follow) this.options.scroll(this.highlighted);
    }
    _request(index) {
      if (this.cache.has(index)) return this.cache.get(index).promise;
      const controller = new AbortController();
      const epoch = this.epoch;
      const entry = { controller, url: null, promise: null };
      this.diagnose("synthesis-start");
      // Allow the proxy's bounded short-chunk retry to finish before timing out.
      const timeout = setTimeout(() => { entry.timedOut = true; controller.abort(); }, 70000);
      entry.promise = (async () => {
        await this.voiceReady;
        if (epoch !== this.epoch || controller.signal.aborted) throw new Error("stale audio");
        const res = await fetch(this.options.endpoint(), {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: this.segments[index].text, lang: this.languageOverride || this.segments[index].lang, ...(this.voice ? { voice: this.voice } : {}) }), signal: controller.signal
        });
        if (!res.ok) {
          const error = new Error(`HTTP ${res.status}`); error.status = res.status;
          const body = await res.json().catch(() => ({}));
          if (body.error === "unsupported voice") error.kind = "voice";
          else if (body.error === "unsupported speech language") error.kind = "language";
          throw error;
        }
        const blob = await res.blob();
        if (blob.size < 100) { const error = new Error("empty audio"); error.kind = "playback"; throw error; }
        if (epoch !== this.epoch) throw new Error("stale audio");
        this.diagnose("synthesis-ready");
        entry.url = URL.createObjectURL(blob);
        return entry.url;
      })().catch(error => { if (entry.timedOut) error.kind = "timeout"; throw error; }).finally(() => clearTimeout(timeout));
      this.cache.set(index, entry);
      // A failed prefetch can be retried by an explicit attempt to play the paragraph.
      entry.promise.catch(() => { if (this.cache.get(index) === entry) this.cache.delete(index); });
      return entry.promise;
    }
    async playAt(index) {
      if (!this.segments.length) return;
      if (this.options.prepare) this.options.prepare();
      this._silence(this.desired && this.status === "playing");
      this.index = Math.max(0, Math.min(this.segments.length - 1, index));
      this.desired = true;
      this.status = "loading";
      this.errorKind = "";
      const run = this.run;
      const epoch = this.epoch;
      this.update();
      await this.voiceReady;
      if (run !== this.run || epoch !== this.epoch) return;
      let url;
      try { url = await this._request(this.index); }
      catch (error) {
        if (run !== this.run || epoch !== this.epoch) return;
        if (this.desired) this._fail(error.kind || (error.status === 429 ? "busy" : error.status === 413 ? "length" : !error.status ? "network" : "synthesis"));
        return;
      }
      if (run !== this.run || epoch !== this.epoch) return;
      const audio = this.media;
      audio.src = url;
      audio.muted = false;
      audio.volume = 1;
      this.audio = audio;
      audio.playbackRate = this.rate;
      audio.onended = () => { if (run === this.run) this._next(); };
      audio.onerror = () => {
        if (run !== this.run) return;
        this.diagnose("decode-error");
        this._fallback(run);
      };
      audio.ontimeupdate = () => { if (run === this.run) this.updateTime(); };
      audio.onloadedmetadata = () => {
        if (run !== this.run) return;
        if (this.pendingSeek != null && Number.isFinite(audio.duration)) { audio.currentTime = Math.min(this.pendingSeek, Math.max(0, audio.duration - .02)); this.pendingSeek = null; }
        this.diagnose("metadata-ready");
        this.updateTime();
      };
      if (!this.desired) { this.status = "paused"; this.update(); return; }
      const startupTimer = this.timer = setTimeout(() => { if (run === this.run && this.desired) this._fail("playback"); }, 12000);
      try {
        await audio.play();
        clearTimeout(startupTimer);
        if (run !== this.run) return;
        if (!this.desired) { audio.pause(); return; }
        this._watchMedia(audio, run);
        if (this.continuesTo(this.index + 1)) this._request(this.index + 1).catch(() => {});
      } catch (error) {
        if (run !== this.run) return;
        if (error.name === "NotAllowedError") this._fail("blocked");
        else this._fallback(run);
      }
    }
    _watchMedia(audio, run) {
      clearInterval(this.playbackTimer);
      let position = audio.currentTime, movedAt = performance.now();
      const check = () => {
        if (run !== this.run || !this.desired) { movedAt = performance.now(); return; }
        if (audio.currentTime > position + .005) {
          position = audio.currentTime; movedAt = performance.now();
          if (this.status !== "playing") {
            this.diagnose("playing");
            this._mark(); this.status = "playing"; this.options.duck(.2); this.update();
          }
        } else if (performance.now() - movedAt > 4500) this._fail("stalled");
        this.updateTime();
      };
      this.playbackTimer = setInterval(check, 100);
      this.update();
    }
    _fallback(run) {
      if (run !== this.run) return;
      const entry = this.cache.get(this.index);
      if (entry) { entry.controller.abort(); if (entry.url) URL.revokeObjectURL(entry.url); this.cache.delete(this.index); }
      this._fail("playback");
    }
    _next() {
      if (!this.desired) return;
      if (this.continuesTo(this.index + 1)) this.playAt(this.index + 1);
      else {
        this.diagnose("ended");
        this.desired = false; this._silence(); this.status = "ended";
        if (this.highlighted) { this.highlighted.classList.remove("is-speaking"); this.highlighted.removeAttribute("aria-current"); }
        this.highlighted = null; this.update();
      }
    }
    updateTime() {
      const seek = this.el.querySelector("[data-audio=seek]");
      const chapter = this.chapters[this.chapterIndex()];
      const part = chapter ? this.tx(`本章第 ${this.index - chapter.start + 1} / ${chapter.end - chapter.start} 段的播放进度`, `Playback of passage ${this.index - chapter.start + 1} / ${chapter.end - chapter.start} in this chapter`) : this.tx("播放进度", "Playback progress");
      seek.setAttribute("aria-label", part);
      this.el.querySelector(".audio-progress").title = part;
      const audio = this.audio;
      const valid = audio && Number.isFinite(audio.duration) && audio.duration > 0;
      seek.disabled = !valid;
      seek.max = valid ? audio.duration : 1;
      seek.value = valid ? audio.currentTime : 0;
      const format = n => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
      this.el.querySelector("[data-audio=time]").textContent = valid ? `${format(audio.currentTime)} / ${format(audio.duration)}` : "— / —";
    }
    update() {
      const labels = {
        idle: this.tx("待你聆听", "Ready to listen"),
        loading: this.tx("正在准备声音…", "Preparing the voice…"),
        playing: this.tx("神谕轻述中", "The whisper is unfolding"), paused: this.tx("已暂歇 · 可续听", "Paused · ready to resume"),
        ended: this.tx("余音落定，愿你有所收获", "The whisper rests"), error: this.tx("声音暂未抵达，可再次聆听", "The voice is unavailable · try again")
      };
      this.el.dataset.status = this.status;
      this.diagnosticButton.hidden = !this.diagnostics.some(event => event.phase === "error");
      this.diagnosticButton.textContent = this.tx("导出声音诊断（不含正文）", "Export audio diagnostics (no reading text)");
      const errors = {
        blocked: this.tx("播放被浏览器拦截，请点击重试", "Playback blocked · tap to retry"),
        playback: this.tx("声音未能播放，请点击重试", "Playback failed · tap to retry"),
        synthesis: this.tx("神谕暂未抵达，请点击重试", "Voice unavailable · tap to retry"),
        stalled: this.tx("播放未启动，请点击重试或换浏览器", "Playback stalled · retry or try another browser"),
        voice: this.tx("此音色暂不可用，请换一种音色", "This voice is unavailable · choose another"),
        language: this.tx("此语种暂不可用，请选自动识别", "Language unavailable · choose Automatic"),
        timeout: this.tx("声音准备超时，请点击重试", "Voice request timed out · retry"),
        network: this.tx("语音连接中断，请点击重试", "Voice connection interrupted · retry"),
        busy: this.tx("语音服务繁忙，请稍后重试", "Voice service busy · retry shortly"),
        length: this.tx("此段文字过长，请切换章节重试", "Text too long · try another chapter")
      };
      const progress = this.chapters.length ? this.tx(`第 ${this.chapterIndex() + 1} / ${this.chapters.length} 章`, `Chapter ${this.chapterIndex() + 1} / ${this.chapters.length}`) : "";
      this.el.querySelector("[data-audio=status]").textContent = this.status === "error" ? errors[this.errorKind] || labels.error : labels[this.status] + (this.desired ? " · " + progress : "");
      this.el.querySelector("[data-audio=status]").title = this.el.querySelector("[data-audio=status]").textContent;
      const label = this.desired ? this.tx("暂歇", "Pause") : this.status === "paused" ? this.tx("续听", "Resume") : this.status === "error" ? this.tx("重试", "Retry") : this.scope === "all" ? this.tx("听全部", "Listen to all") : this.tx("听本章", "Listen to this chapter");
      this.toggleLabel = label;
      this.compactToggleLabel = this.options.lang() === "en" && !this.desired && !["paused", "error"].includes(this.status) ? "Listen" : label;
      this.paintTransportLabel();
      this.el.querySelector("[data-audio=toggle]").dataset.playing = String(this.desired);
      this.el.querySelector("[data-audio=toggle]").setAttribute("aria-label", this.tx(this.scope === "all" ? "连续聆听完整解读" : "聆听当前完整章节", this.scope === "all" ? "Listen to the full reading" : "Listen to the current chapter") + " · " + label);
      if (this.button !== this.el.querySelector("[data-audio=toggle]")) this.button.textContent = this.desired ? this.tx("Ⅱ 暂歇神谕", "Ⅱ Pause whisper") : this.status === "paused" ? this.tx("✦ 续听神谕", "✦ Resume whisper") : this.tx("✦ 聆听神谕", "✦ Divine Whisper");
      this.button.setAttribute("aria-pressed", String(this.desired));
      this.el.querySelector("[data-audio=prev]").disabled = this.chapterIndex() === 0;
      this.el.querySelector("[data-audio=next]").disabled = this.chapterIndex() >= this.chapters.length - 1;
      this.el.querySelector("[data-audio=chapter]").value = String(this.chapterIndex());
      this.el.querySelector("[data-audio=chapter]").setAttribute("aria-label", this.tx("选择朗读章节", "Choose a chapter"));
      this.el.querySelector("[data-audio=scope]").value = this.scope;
      this.el.querySelector("[data-audio=scope] option[value=all]").textContent = this.tx("听全部 · 自动接续", "All chapters · continuous");
      this.el.querySelector("[data-audio=scope] option[value=single]").textContent = this.tx("仅当前章", "Current chapter only");
      this.el.querySelector("[data-audio-label=voice]").textContent = this.tx("神谕音色", "Voice");
      this.el.querySelector("[data-audio-label=scope]").textContent = this.tx("聆听范围", "Listen to");
      this.el.querySelector("[data-audio-label=language]").textContent = this.tx("原文语种", "Text language");
      const language = this.el.querySelector("[data-audio=language]");
      const names = { zh: ["中文", "Chinese"], en: ["英语", "English"], ja: ["日语", "Japanese"], ko: ["韩语", "Korean"], fr: ["法语", "French"], es: ["西班牙语", "Spanish"] };
      language.value = this.languageOverride;
      Array.from(language.options).forEach(option => { option.textContent = option.value ? this.tx(...names[option.value]) + (["ja", "ko", "fr", "es"].includes(option.value) ? this.tx(" · 试用", " · preview") : "") : this.tx("自动识别 · ", "Automatic · ") + this.tx(...names[this.readingLanguage]); });
      language.setAttribute("aria-label", this.tx("原文语种", "Text language"));
      [["prev", this.tx("上一章", "Previous chapter")], ["next", this.tx("下一章", "Next chapter")], ["more", this.tx("更多操作", "More actions")], ["settings", this.tx("音色与听读设置", "Voice and audio settings")]].forEach(([key, text]) => {
        const control = this.el.querySelector(`[data-audio=${key}]`);
        control.setAttribute("aria-label", text); control.title = text;
      });
      this.el.querySelector(".dock-more-label").textContent = this.tx("更多操作", "Actions");
      this.el.querySelector("#readingTools").setAttribute("aria-label", this.tx("解读操作", "Reading actions"));
      this.el.querySelector("[data-audio=voice]").setAttribute("aria-label", this.tx("神谕音色", "Reading voice"));
      this.el.querySelector("[data-audio=scope]").setAttribute("aria-label", this.tx("聆听范围", "Listening scope"));
      const follow = this.el.querySelector("[data-audio=follow]");
      follow.textContent = this.follow ? this.tx("跟随文字：开", "Follow text: on") : this.tx("回到朗读处", "Follow reading");
      follow.setAttribute("aria-pressed", String(this.follow));
      this.el.querySelector("[data-audio=source]").textContent = this.languageNotice === "original"
        ? this.tx("已保留原文语言。请在上方选择解读语言，再用相同取象生成解读。", "The original language is kept. Choose Reading language above, then Generate with these symbols.")
        : this.tx("按原文语种朗读，保留原文内容", "Reads the original language without translating");
      this.updateTime();
      this.renderVoices();
    }
  }
  window.AstraAudioPlayer = AstraAudioPlayer;
})();
