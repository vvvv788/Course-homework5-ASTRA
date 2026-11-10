/* Explain the actual selected symbols, without generating another reading. */
(function (root) {
  function rows(type, data, lang) {
    const en = lang === "en", tx = (zh, english) => en ? english : zh;
    const profile = root.AstraModuleProfiles[type][en ? "en" : "zh"];
    if (type === "tarot") return data.cards.map((card, i) => ({ label: root.AstraTarotSpreads.get(data.spreadId).positions[en?1:0][i], value: card.name + " · " + (card.orient === "reversed" ? tx("逆位", "Reversed") : tx("正位", "Upright")), detail: tx("意象：", "Imagery: ") + card.keyword + tx("。", ". ") + root.AstraTarotSpreads.get(data.spreadId).lenses[en?1:0][i] + (card.orient === "reversed" ? tx("。留意这种力量是否受阻、过度或转向内在，不直接等于坏运。", ". Consider whether this quality is blocked, overused or turned inward; a reversal is not automatically bad luck.") : tx("。先看这种力量如何在处境中表达，再对照现实条件。", ". Consider how this quality could appear in the situation, then compare it with real conditions.")) }));
    if (type === "rune") return data.runeNames.map((name, i) => ({ label: tx(["回顾", "当下", "下一步"][i], ["Context", "Present", "Next"][i]), value: name + " · " + data.meanings[i], detail: tx([
      "回想过去一次与这种力量有关的经历：你当时依靠了什么，其中哪些资源今天仍在？",
      "把这个意象放到眼前，看看它是否过强或不足：哪条边界值得先照看？",
      "把这个意象转成一次小回应，再与前两枚对照：它补上了什么，又需要避开什么？"
    ][i], [
      "Recall a time connected with this quality. What supported you then, and which resources are still available?",
      "Place this image beside the present situation. Could the quality be overused or missing, and which boundary needs care?",
      "Turn the image into one small response. Compare it with the first two runes: what does it add, and what needs care?"
    ][i]) }));
    if (type === "number") return [
      { label: tx("先看见意象", "See the image"), value: data.symbol + " · " + data.theme, detail: data.symbolMeaning },
      { label: tx("再把它带回生活", "Bring it into your life"), value: data.reflectionQuestion, detail: tx("选过去一周的一个具体片刻来回答，再带着这个细节读完整解读。意象提供一个提问的角度，你的经历让它有意义。", "Answer with one specific moment from the past week, then bring that detail to the reading. The image frames a question; your experience gives it meaning.") }
    ];
    if (type === "mansion") return [
      { label: tx("这次取宿", "Selected mansion"), value: data.name + " · " + data.element, detail: tx("这宿的意象是：", "Its imagery: ") + data.imagery + tx(" 从这个画面里找一个与你处境有关的细节，作为观察的入口。", " Pick a detail in that image that connects with your situation as a starting point for observation.") },
      { label: tx("守护兽意象", "Animal imagery"), value: data.beast, detail: tx("再想想这种动物的行动姿态，哪一点能转成你愿意尝试的回应。", "Consider whether a way this animal moves or responds could suggest a response you want to try.") }
    ];
    if (type === "oracle") return [
      { label: tx("这次的签", "Selected lot"), value: tx("第", "Lot ") + data.no + tx("签", "") + " · " + data.level, detail: tx("签号与签级是本次抽取记录，用来定位原诗，不替你做现实决定。", "The number and grade locate the original poem; they do not decide real-world choices for you.") },
      { label: tx("从原诗开始", "Begin with the verse"), value: (data.poem || []).join("\n"), detail: tx("先选一句最有共鸣的诗句，问自己它对应哪个现实细节，再读解签。", "Choose the line that resonates, connect it to a real detail, then read the interpretation.") },
      { label: tx("读签的顺序", "Reading sequence"), value: tx("原诗意象 → 现实切口 → 一件小事", "Verse image → a relevant angle → one small step"), detail: tx("看解读是否回应了你这件心事，保留能验证的建议。", "Look for a response to your particular concern and keep the suggestions you can test.") }
    ];
    return [];
  }
  function render(panel, type, data, lang) {
    if (!data) { panel.hidden = true; panel.dataset.signature = ""; return; }
    const signature = JSON.stringify([lang, data]);
    if (panel.dataset.signature === signature) return;
    panel.dataset.signature = signature; panel.hidden = false;
    const open = panel.dataset.initialized ? panel.open : true;
    panel.dataset.initialized = "true"; panel.replaceChildren();
    const titles = {
      tarot: ["这次牌阵，如何连成一个故事", "How to read these cards together"],
      rune: ["这三枚符文，如何彼此回应", "How to read these runes together"],
      number: ["这枚印记，与你有什么关系", "How to read this symbol in your life"],
      mansion: ["一宿一兽，怎样照见此刻", "How to read this mansion and its animal"],
      oracle: ["这支签，从哪一句开始读", "How to read this verse"]
    };
    const summary = document.createElement("summary"); summary.textContent = titles[type][lang === "en" ? 1 : 0];
    const list = document.createElement("div"); list.className = "result-trace-items";
    rows(type, data, lang).forEach(row => {
      const item = document.createElement("article"), label = document.createElement("span"), value = document.createElement("strong"), detail = document.createElement("p");
      item.className = "result-trace-item"; label.textContent = row.label; value.textContent = row.value; detail.textContent = row.detail;
      item.append(label, value, detail); list.appendChild(item);
    });
    panel.append(summary, list);
    if (type === "number" && data.raw != null) {
      const route = document.createElement("details"); route.className = "result-trace-route";
      const title = document.createElement("summary"); title.textContent = lang === "en" ? "Why was this symbol selected?" : "为什么这次取到这枚印记？";
      const explanation = document.createElement("p"); explanation.textContent = lang === "en" ? "This app arranges twelve everyday images in a cycle. The number selects an entry point; the image offers a reflection prompt. This is a custom mapping, not a claim that a number has an inherent personality or destiny." : "本站将十二种日常意象排成一圈，数字负责选取入口，意象负责打开提问。这是本站的自定义映射，不是说某个数字天生就具有这种性格或命运。";
      const calculation = document.createElement("p"); calculation.className = "result-trace-calculation";
      calculation.textContent = String(data.raw).split("").filter(c => /\d/.test(c)).join(" + ") + " = " + data.digitSum + "；" + data.digitSum + " ÷ 12 → " + (lang === "en" ? "remainder " : "余数 ") + data.symbolIdx + " → " + data.symbol;
      const index = document.createElement("p"); index.textContent = lang === "en" ? "The cycle is indexed 0–11, so the same input returns the same image. It does not use a traditional numerology root." : "十二枚印记从0至11编号，相同输入会落在相同位置；这里不使用传统灵数根数算法。";
      route.append(title, explanation, calculation, index); panel.appendChild(route);
    }
    panel.open = open;
  }
  root.AstraDrawTrace = { render };
})(window);
