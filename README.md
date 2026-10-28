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

## 在线访问与可选的后端

**当前状态**：https://vvvv788.github.io/Course-homework5-ASTRA/ 可直接打开完整演示（六大占卜系统、中英双语、四套主题、隔空手势），解读为内置示例文案，页面顶部与报告底部都会标明「演示模式」。要拿到按你的问题实时生成的 StepFun 解读，请在本地双击 `启动演示.bat`。

**为什么在线版没有接大模型**：GitHub Pages 只能托管静态文件，存不了密钥也转发不了请求，所以线上必须再挂一个能保存密钥的服务端；而免注册费、不要信用卡、且国内可达的免费服务端只剩少数几家，实测矩阵如下。

| 托管 | 国内可达性（实测） | 是否要信用卡 | 结论 |
| --- | --- | --- | --- |
| `*.workers.dev`（Cloudflare Worker） | DNS 能解析但 TCP 连不上 | 不要 | ❌ 放弃 |
| `*.vercel.app` | 超时 | 不要 | ❌ 被污染 |
| `huggingface.co` | 超时（DNS 污染） | 不要 | ❌ 后台进不去 |
| `*.onrender.com` + `console.render.com` | ✅ 可达 | **要绑卡** | ⚠️ 无国际卡则卡住 |
| `*.koyeb.app` + `app.koyeb.com` | ✅ 可达 | 不要 | ✅ 若要继续，选它 |

**若要继续接后端**（代码已备好，零改动）：Koyeb → Create a Web Service → 连本仓库 `main` → Buildpack 选 **Node.js**、Run command 填 `node server/server.js`、区域 **Singapore**、环境变量 `STEP_API_KEY`（Secret）、`ALLOW_ORIGINS=https://vvvv788.github.io`、`RATE_PER_DAY=20`；拿到 `https://…koyeb.app` 后填进 `code/app.js` 顶部的 `PUBLIC_API` 并提交即生效。Render 路径见 `render.yaml`（Blueprint 会自动带出同样的配置），`worker/astra-worker.js` 保留作为海外备选。

**前端**：Pages 的发布目录只能选 `root` 或 `/docs`，选不到 `/code`，所以仓库根放了一个跳转页 `index.html`（配 `.nojekyll` 关掉 Jekyll 渲染），根链接会立即进入 `code/` 演示首页。

`server/server.js` 与 `worker/astra-worker.js` 是同一套契约的两个部署形态（校验、扩写、措辞软化逻辑一致），改提示词或结构时两边都要改。`ALLOW_ORIGINS` 与 `RATE_PER_DAY` 只在公开部署时设置；不设置时服务端保持只对本机与 `file://` 开放，本机演示不受限。未接后端或超出当日额度时，前端自动回落示例解读，解读页顶部横幅会写明「演示模式」。


