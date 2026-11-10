(function () {
  "use strict";
  document.getElementById("statusForm").addEventListener("submit", async event => {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    const status = document.getElementById("status");
    const results = document.getElementById("results");
    button.disabled = true; results.hidden = true; status.textContent = "正在读取…";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch("/api/status", { headers: { Authorization: "Bearer " + document.getElementById("token").value }, signal: controller.signal });
      if (!response.ok) throw new Error(response.status === 404 ? "服务端尚未配置 ADMIN_TOKEN。" : response.status === 401 ? "令牌不正确或请求来源不被允许。" : "服务暂不可用。");
      const data = await response.json();
      document.getElementById("configured").textContent = data.configured ? "模型已配置" : "示例模式";
      document.getElementById("active").textContent = `${data.activeAiRequests} / ${data.maxConcurrentAi}`;
      document.getElementById("budget").textContent = `${data.provider.used} / ${data.provider.limit || "未设上限"}`;
      document.getElementById("started").textContent = "本次启动：" + new Date(data.startedAt).toLocaleString();
      const body = document.getElementById("routes"); body.replaceChildren();
      Object.entries(data.routes).forEach(([route, metric]) => {
        const row = document.createElement("tr");
        [route, metric.requests, metric.failures, Math.round(metric.totalMs / metric.requests) + " ms"].forEach(value => { const cell = document.createElement("td"); cell.textContent = String(value); row.appendChild(cell); });
        body.appendChild(row);
      });
      results.hidden = false; status.textContent = "状态已更新。";
    } catch (error) { status.textContent = error.name === "AbortError" ? "读取超时，请重试。" : error.message; }
    finally { clearTimeout(timer); button.disabled = false; }
  });
})();
