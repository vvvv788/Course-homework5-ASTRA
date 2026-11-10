/* Language detection is shared by the browser and proxy; it never translates text. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.AstraSpeechLanguage = api;
})(typeof window === "undefined" ? globalThis : window, function () {
  function resolveSpeechLanguage(text, hint) {
    const value = String(text || "");
    const preferred = String(hint || "").toLowerCase().split(/[-_]/)[0];
    if (/[\u3040-\u30ff]/u.test(value)) return "ja";
    if (/[\uac00-\ud7af\u1100-\u11ff]/u.test(value)) return "ko";
    if (/\p{Script=Han}/u.test(value)) return preferred === "ja" ? "ja" : "zh";
    const lower = value.toLowerCase();
    const words = lower.match(/\p{L}+/gu) || [];
    const count = set => words.filter(word => set.includes(word)).length;
    const spanish = count(["una", "para", "puedes", "hoy", "tus", "los", "las", "con", "por", "gracias", "hola", "mañana", "paso", "corazón", "escuchar", "todo"]);
    const french = count(["vous", "votre", "avec", "pour", "une", "des", "les", "dans", "peut", "bonjour", "merci", "prendre", "temps", "petit", "aujourd", "écouter", "cœur"]);
    const english = count(["the", "your", "you", "take", "one", "small", "step", "today", "thank", "for", "time", "notice", "listen", "what", "and"]);
    if (/[¿¡ñ]/u.test(lower) || (spanish > english && spanish > french)) return "es";
    if (/[œçàâêèù]/u.test(lower) || (french > english && french > spanish)) return "fr";
    if (english >= 2 && english > spanish && english > french) return "en";
    if (["fr", "es"].includes(preferred)) return preferred;
    if (/\p{Script=Latin}/u.test(value)) return "en";
    return ["zh", "en", "ja", "ko", "fr", "es"].includes(preferred) ? preferred : "zh";
  }
  return { resolveSpeechLanguage };
});
