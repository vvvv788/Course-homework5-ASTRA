/* Three-coin facts only. No interpretation or network calls. */
(function (root, factory) {
  const core = factory();
  if (typeof module === "object" && module.exports) module.exports = core;
  else root.AstraGuaCore = core;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function lineFromCoins(coins) {
    if (!Array.isArray(coins) || coins.length !== 3 || coins.some(v => v !== 2 && v !== 3)) throw new TypeError("Three coins must each be 2 or 3");
    return coins.reduce((sum, value) => sum + value, 0);
  }
  function drawLine(random = Math.random) {
    const coins = Array.from({ length: 3 }, () => random() < .5 ? 2 : 3);
    return { coins, value: lineFromCoins(coins) };
  }
  function derive(lines) {
    if (!Array.isArray(lines) || lines.length !== 6 || lines.some(v => ![6, 7, 8, 9].includes(v))) throw new TypeError("A hexagram needs six values from 6 to 9");
    let base = 0, change = 0;
    const movingLines = [], changedLines = [];
    lines.forEach((value, index) => {
      const yang = value === 7 || value === 9;
      const changed = value === 6 ? 7 : value === 9 ? 8 : value;
      if (yang) base |= 1 << index;
      if (changed === 7) change |= 1 << index;
      changedLines.push(changed);
      if (value === 6 || value === 9) movingLines.push({ position: index + 1, value, from: yang ? "yang" : "yin", to: yang ? "yin" : "yang" });
    });
    return { base, change, lines: lines.slice(), changedLines, movingLines, movingPositions: movingLines.map(line => line.position), isStatic: movingLines.length === 0 };
  }
  return { lineFromCoins, drawLine, derive };
});
