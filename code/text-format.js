/* Restricted presentation for model output. Raw HTML is always escaped. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.AstraText = api;
})(typeof window === "undefined" ? globalThis : window, function () {
  function escape(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function plainModelText(text) {
    return String(text == null ? "" : text).replace(/\r\n?/g, "\n")
      .replace(/^\s*```[^\n]*\n?|^\s*```\s*$/gm, "")
      .replace(/!\[([^\]]*)\]\([^\n)]*\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^\n)]*\)/g, "$1")
      .replace(/\*\*\*([\s\S]+?)\*\*\*/g, "$1")
      .replace(/\*\*([\s\S]+?)\*\*|__([\s\S]+?)__/g, (_, a, b) => a || b)
      .replace(/`([^`\n]+)`/g, "$1")
      .replace(/^\s{0,3}#{1,6}\s+|^\s*>\s?|^\s*[-*+]\s+/gm, "")
      .trim();
  }
  function inline(text) {
    const codes = [];
    let value = escape(text).replace(/\u0000/g, "").replace(/`([^`\n]+)`/g, (_, code) => { codes.push(`<code>${code}</code>`); return `\u0000${codes.length - 1}\u0000`; });
    value = value.replace(/\*\*\*([^\n]+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    value = value.replace(/\*\*([^\n]+?)\*\*|__([^\n]+?)__/g, (_, a, b) => `<strong>${a || b}</strong>`);
    return value.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
  }
  function blocks(text) {
    const lines = String(text == null ? "" : text).replace(/\r\n?/g, "\n").split("\n");
    const result = []; let paragraph = [], items = [], type = "", code = null;
    const flush = () => {
      if (paragraph.length) result.push(`<p>${paragraph.map(inline).join("<br>")}</p>`);
      if (items.length) result.push(`<${type}>${items.map(item => `<li>${inline(item)}</li>`).join("")}</${type}>`);
      paragraph = []; items = []; type = "";
    };
    for (const line of lines) {
      if (/^\s*```/.test(line)) { flush(); if (code) { result.push(`<pre><code>${escape(code.join("\n"))}</code></pre>`); code = null; } else code = []; continue; }
      if (code) { code.push(line); continue; }
      if (!line.trim()) { flush(); continue; }
      const heading = line.match(/^\s{0,3}#{1,6}\s+(.+)$/);
      if (heading) { flush(); result.push(`<h4>${inline(heading[1])}</h4>`); continue; }
      const list = line.match(/^\s*(?:([-*+])\s+|\d+[.)]\s+)(.+)$/);
      if (list) { const next = list[1] ? "ul" : "ol"; if (paragraph.length || (type && type !== next)) flush(); type = next; items.push(list[2]); continue; }
      if (items.length) flush();
      paragraph.push(line.replace(/^\s*>\s?/, ""));
    }
    flush(); if (code) result.push(`<pre><code>${escape(code.join("\n"))}</code></pre>`);
    return result.join("");
  }
  return { escape, inline, blocks, plain: plainModelText, plainModelText };
});
