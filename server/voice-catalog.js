"use strict";

// Official preset IDs. Configured defaults remain available for existing installs.
// https://platform.stepfun.com/docs/zh/guides/developer/tts
// https://platform.stepfun.com/cookbook/stepaudio-3-tts
function voiceCatalog(zhDefault, enDefault) {
  const presets = {
    zh: [
      { id: "wenroushunv", name: "温柔女声", nameEn: "Gentle female" },
      { id: "zixinnansheng", name: "沉稳男声", nameEn: "Steady male" },
      { id: "zhixingjiejie", name: "知性女声", nameEn: "Thoughtful female" },
      { id: "linjiajiejie", name: "邻家女声", nameEn: "Friendly female" },
      { id: "cixingnansheng", name: "磁性男声", nameEn: "Resonant male" },
      { id: "ruyananshi", name: "儒雅男声", nameEn: "Refined male" }
    ],
    en: [
      { id: "Lisa", name: "Lisa · 轻柔女声", nameEn: "Lisa · gentle female" },
      { id: "zixinnansheng", name: "沉稳男声", nameEn: "Steady male" }
    ]
  };
  presets.en.push(...presets.zh.filter(v => !["wenroushunv", "zixinnansheng"].includes(v.id)));
  const defaults = { zh: zhDefault, en: enDefault };
  for (const lang of ["ja", "ko", "fr", "es"]) { presets[lang] = presets.zh.map(v => ({ ...v })); defaults[lang] = "zixinnansheng"; }
  for (const lang of ["zh", "en"]) {
    if (!presets[lang].some(v => v.id === defaults[lang])) presets[lang].unshift({ id: defaults[lang], name: "默认音色", nameEn: "Default voice" });
  }
  return { defaults, voices: presets };
}

module.exports = { voiceCatalog };
