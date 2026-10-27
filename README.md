# ASTRA · 星尘占卜

人工智能课程作业：一个星尘粒子场景 + 六大占卜体系的沉浸式 Web Demo。解读由 StepFun 大模型实时生成，支持中英双语、夜间/白昼双主题、语音朗读，以及**唯一一种隔空手势**——张开手掌让光标跟手，停在按钮上 0.8 秒即选中。

## 目录结构

| 路径 | 说明 |
|------|------|
| `code/` | 前端（无构建步骤）：`index.html` + `app.js` + `styles.css` + `assets/` + `vendor/` |
| `code/vendor/` | 离线的 Three.js 与 MediaPipe Hands 运行时（含 wasm 与模型，手势无需联网） |
| `server/` | Node 本机代理：`server.js`（路由 / 静态服务 / TTS 缓存）、`prompts.js`（六门提示词） |
| `启动演示.bat` | Windows 双击启动：自动拉起本机服务并打开 `http://localhost:8787` |
| `1.小组提案ASTRA.docx` `2.项目过程文档.docx` `3.市场调研.html` | 课程交付物 |
| `legacy_v1/` | 第一版原型（CDN + 本地 mock 解读），仅作过程留档，不参与运行 |

## 快速开始

1. 复制 `server/.env.example` 为 `server/.env`，填入自己的 StepFun 密钥：`STEP_API_KEY=...`
2. 双击 `启动演示.bat`（或手动执行 `node server/server.js`，Node 18+，零第三方依赖）
3. 浏览器自动打开 `http://localhost:8787`

> 密钥只放在 `server/.env`，该文件已被 `.gitignore` 排除；前端代码里没有任何密钥，请求一律经本机服务转发。

## 隔空手势

只有一种手势，没有捏合 / 握拳 / 画圈：

- **张开手掌** → 屏幕上出现隔空光标，跟随掌心中心移动（镜面翻转）
- **停在按钮或卡牌上约 0.8 秒** → 自动选中，等价于一次点击；返回、切换主题同样靠「停在对应按钮上」完成

判定细节：掌心取 0/5/9/13/17 五点均值；张掌为四指中至少三指的指尖比其 PIP 关节离手腕更远（阈值 1.08 倍，开 3 帧 / 合 6 帧的滞回）；命中带容差与不应期，手抖不会重复触发，也不会误点相邻按钮。摄像头画面全程只在本机处理，不上传、不入网。

## 使用须知

- **手势必须走 `http://localhost:8787`**：`file://` 双击打开时浏览器禁止读取本地的 wasm 与模型文件，手势模型必然失败（页面取象与 AI 解读仍可用，手势状态栏会直接说明原因）。
- 摄像头若被微信 / 钉钉 / 腾讯会议 / 系统相机占用会拿不到新帧，状态栏会提示「摄像头无画面」，退出占用程序即可。
- 一次解读目标 30 秒内完成；解读文字生成后会自动逐段朗读，可随时停止。

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/reading` | 依据取象结果生成结构化解读报告（中 / 英） |
| POST | `/api/tts` | 解读朗读音频，本机带缓存 |
| GET | `/api/quote` | 首页星语签到短句 |
| GET | `/api/health` | 服务与模型配置自检 |

可用环境变量覆盖：`STEP_MODEL`、`STEP_TTS_MODEL`、`STEP_TTS_VOICE_ZH`、`STEP_TTS_VOICE_EN`、`STEP_REASONING_EFFORT`、`PORT`。

## 让别人在线也能用（GitHub Pages + Cloudflare Worker）

GitHub Pages 只能托管静态文件，存不了密钥也转发不了请求，所以线上要再挂一个免费的服务端：

1. **前端**：Settings → Pages → Branch 选 `main`、Folder 选 `/code` → Save，站点根即演示首页。
2. **后端**：dash.cloudflare.com → Workers & Pages 新建一个 Worker，把 `worker/astra-worker.js` 整段粘贴进去并 Deploy（不需要本地 Node）。
3. **密钥与白名单**：该 Worker 的 Settings → Variables → Secrets 加 `STEP_API_KEY`；Variables 加 `ALLOW_ORIGINS=https://vvvv788.github.io`。
4. **接线**：把 Worker 地址填进 `code/app.js` 顶部的 `WORKER_API`，再提交一次。

`worker/astra-worker.js` 与 `server/server.js` 是同一套契约的两个部署形态（校验、扩写、措辞软化逻辑一致），改动提示词或结构时两边都要改。未接后端时线上自动回落示例解读，解读页顶部横幅会写明「演示模式」。

