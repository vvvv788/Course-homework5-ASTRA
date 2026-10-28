/* ============================================================
   占卜站 Demo · app.js
   星尘粒子引擎 + 状态机 + 塔罗/六爻/灵数三模块 + 本地示例解读
   注：解读为 MOCK 数据，接 StepFun 时只需把 mockReading 换成 /api/reading 调用
   ============================================================ */
(function () {
  "use strict";

  /* 接口地址：双击 file:// 打开指向本机服务；本机 http 走同源代理；
     线上静态托管（GitHub Pages 没有后端）把公开部署的地址填到 PUBLIC_API */
  const PUBLIC_API = "";   // 例：https://astra.onrender.com
  const API_ORIGIN = location.protocol === "file:" ? "http://localhost:8787"
    : /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? "" : PUBLIC_API;
  const api = p => API_ORIGIN + p;

  /* 展示字体：异步补载 Noto Serif SC / Cormorant Garamond，离线或被墙时静默回退本地衬线，
     动态插入的 link 不阻塞首屏渲染 */
  (function () {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Noto+Serif+SC:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  })();

  /* 分享链接的公开站点地址：部署后会按当前域名自动生成，无需填写；
     本地 file:// / localhost 预览时，填这里或在分享弹窗里填一次即可生成可打开的链接 */
  const SHARE_BASE = "";
  const SHARE_BASE_KEY = "astra.shareBase";

  /* ---------------- 主题 ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    if (window.__particles) window.__particles.recolor();
    recolorCards();
  }
  themeToggle && themeToggle.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "night" ? "day" : "night");
  });
  try {
    const saved = localStorage.getItem("theme");
    if (saved) applyTheme(saved);
  } catch (e) {}

  /* ---------------- 多语言 i18n ---------------- */
  let lang = "zh";
  try { const l = localStorage.getItem("lang"); if (l === "en" || l === "zh") lang = l; } catch (e) {}
  const I18N = {
    zh: {
      docTitle: "ASTRA · 占卜 Demo",
      brandSub: "占卜",
      themeToggle: "夜仪 / 昼谕",
      cameraToggle: "🎥 摄像头交互",
      cameraOn: "🎥 摄像头：开",
      soundOff: "🔕 音效",
      soundOn: "🔔 音效",
      bgmOff: "🔈 BGM",
      bgmOn: "🔊 BGM",
      heroTitle: "在星尘落下之前<br/>先问一句",
      heroSub: "星径尽头立着六扇门，每一扇后都藏着一套古老的问卜之法。",
      gateHint: "门扉将自行开启 · 亦可轻触门扉",
      idKicker: "第一步 · 择一旅人",
      idTitle: "你以何种身份走过星径？",
      idSub: "身份会为你点亮一扇相应的门，并替你写下第一句问语。",
      idWanderer: "迷途旅人", idWandererLine: "问前路：学业、事业、下一步往哪走",
      idHeart: "心事之人", idHeartLine: "问情感：喜欢、牵挂、复合与告别",
      idChooser: "抉择之人", idChooserLine: "问两难：选甲或乙，开始或停下",
      idStargazer: "观星之人", idStargazerLine: "问自身：近况、心境与运势",
      idBack: "‹ 回到门前",
      idSkip: "不选身份 · 随缘而行",
      pathKicker: "第二步 · 择门",
      pathTitle: "星径六门",
      idChipPre: "身份 · ",
      idChipNone: "身份 · 未择，随缘而行",
      doorRandom: "✦ 随缘推门",
      pathBack: "‹ 换个身份",
      startBtn: "开始占卜",
      demoNote: "在线演示模式：解读为内置示例文案。本机双击「启动演示.bat」即可接入 StepFun 大模型，按你的问题实时生成。",
      demoBanner: "演示模式 · 内置示例解读（本机运行「启动演示.bat」可实时生成）",
      cardTarot: "塔罗", cardTarotDesc: "三星牌，照见过去·现在·未来",
      cardGua: "六爻", cardGuaDesc: "三掷铜钱，自下成卦",
      cardNumber: "灵数", cardNumberDesc: "以数问星，静待回响",
      cardMansion: "二十八宿", cardMansionDesc: "一宿一兽，星野指路",
      cardRune: "北欧符文", cardRuneDesc: "三枚符石，掷地听讯",
      cardOracle: "寺观灵签", cardOracleDesc: "摇筒求签，诗示吉凶",
      backBtn: "‹ 返回",
      titleTarot: "塔罗 · 环星指引", titleGua: "六爻 · 起卦法阵",
      titleNumber: "灵数 · 数之回响", titleMansion: "二十八宿 · 星野指路",
      titleRune: "北欧符文 · 远古之语", titleOracle: "寺观灵签 · 一签之示",
      hintTarot: "点击「洗牌」生成牌阵，左右拖动卡组切换，正中大图即当前牌。三张对应 过去 / 现在 / 未来。",
      hintGua: "点击「摇卦」，连掷六次，自下而上成卦。法阵将逐爻点亮。",
      hintNumber: "写下一段数字（生日、任意 1–9 位皆可），点「生成」，星尘会为你凝出一枚数之印记。",
      hintMansion: "转动星环，让目标宿停在顶部「取宿口」，或点「摇星」随机点亮一宿。",
      hintRune: "点击「掷符」，聆听三枚远古符文的讯息。",
      hintOracle: "点击「求签」，静心摇筒，得一签之示。",
      askPh: "（可选）此刻你想问什么？写下你的问题或心愿…",
      askRandom: "随缘一问",
      askRandomAria: "随机换一个建议问题",
      askHint: "灵感问题 · 轻触填入",
      dialSel: "选牌口",
      tarotShuffle: "洗牌", tarotReveal: "揭示解读", tarotReset: "重新抽牌",
      guaToss: "摇卦", guaReveal: "查看解读",
      numPh: "例如 19980918", numGen: "生成", numReveal: "查看解读",
      mansionSel: "取宿口", mansionSpin: "摇星", mansionPick: "取宿指引",
      runeCast: "掷符", runeReveal: "查看解读",
      oracleDraw: "求签", oracleReveal: "看签诗",
      readingTitle: "解读", readingSpeak: "🔊 朗读", readingExport: "⤓ 导出星图", readingExit: "✕ 退出",
      camClose: "关闭", camStatus: "画面只在本地处理，不上传",
      camGesturePrefix: "手势：", camNoHand: "未检测到手 · 抬手入镜", camHandOn: "✋ 手掌 · 停住即选中", camModelFail: "模型未加载 · 请改用鼠标",
      camNeedOpen: "✋ 请张开手掌 · 掌心即光标",
      camDetecting: "检测中…", camNoResult: "手势模型无响应 · 请刷新页面或改用鼠标", camHit: "✓ 已选中 · {{0}}",
      camNeedHttp: "隔空手势的手势模型无法从 file:// 加载（浏览器禁止读取本地模型文件）。\n\n解决：双击 HW05 目录里的「启动演示.bat」，它会自动打开 http://localhost:8787\n也可手动在地址栏输入 http://localhost:8787\n\n其余功能（六门取象、AI 解读）在当前页面照常可用。",
      camLoading: "模型加载中… 已等 {{0}}s", camNoVideo: "摄像头无画面 · 可能被其他软件占用", camSendFail: "手势模型运行失败 · 请改用鼠标",
      cgOpen: "张开手掌 · 移动光标，停住即选中",
      skipReveal: "跳过揭晓",
      stageTarot: "牌 阵", stageGua: "卦 象", stageNumber: "灵 数", stageMansion: "星 宿", stageRune: "符 文", stageOracle: "签",
      tarotHintIdle: "左右拖动卡组，正中间的大图即当前牌；点击它或顶部「选牌口」取牌。",
      tarotPicked3: "三张已就位，点击「揭示解读」。",
      tarotPickedN: "已取 {{0}} 张，继续转动星盘取牌。",
      tarotShuffledKept: "已重新洗牌，已选 {{0}} 张保留。",
      tarotUsed: "这张牌已取过，转动星盘换一张。",
      guaHintIdle: "点击「摇卦」，连掷六次，自下而上成卦。法阵将逐爻点亮。",
      guaCasting: "法阵运转中……逐爻自下方升起。",
      guaDone: "六爻已成，点击「查看解读」。",
      numEmpty: "请先写下一段数字",
      numBirth: "生日", numToday: "今日", numLucky: "吉数",
      numRandom: "✦ 随机",
      numGuide: "不想自己输入？点「随机」，让星尘替你选一个数字",
      numRevealTip: "印记已现 · 点下方展开完整星语",
      numSum: "数之和 {{0}}", numRoot: "取象 {{0}}",
      guaIdle: "静候六爻",
      triUpper: "上卦", triLower: "下卦",
      mansionKicker: "本宿",
      runeCastDone: "已得三枚：{{0}}。点击「查看解读」。",
      cupLabel: "灵签",
      oracleGot: "第 {{0}} 签 · {{1}} · {{2}}",
      oracleDone: "已得一签，点击「看签诗」。",
      mansionHintIdle: "转动星环，让目标宿停在顶部「取宿口」，或点「摇星」随机点亮一宿。",
      mansionChosen: "已取「{{0}}」，点击「取宿指引」。",
      tLove: "感情", tCareer: "事业", tHealth: "身心", tChoice: "抉择", tRelation: "人际", tOther: "随缘",
      tailLove: "你问的是一段关系：先分清你想要的是对方，还是被回应的感觉；如果是前者，就给出一个具体邀约；如果是后者，先把自己的生活填满。",
      tailCareer: "你问的是事业：把目标拆成本周能交付的一个结果，先让作品说话，再谈选择。",
      tailHealth: "你问的是身心：今晚提前半小时睡，明天用十分钟走路代替刷手机，连续三天再看状态。",
      tailChoice: "你问的是一个抉择：列出两种选择各自的代价，选那个你愿意承担代价的，而不是看起来更体面的。",
      tailRelation: "你问的是人际：把话说具体——说事实、说感受、说请求，别让对方猜。",
      tailOther: "",
      lblYouAsk: "你问 · ", lblYouAskSpeech: "你问：",
      lblSynthesis: "综合", lblActions: "可执行建议",
      roOverview: "总览", roActions: "建议",
      disclaimer: "以上为在线演示的内置示例解读。本机运行「启动演示.bat」后，同样的结构会由 StepFun 大模型按你的问题实时生成。",
      rdTarot: "塔罗解读", rdGua: "六爻解读", rdNumber: "灵数解读", rdMansion: "二十八宿解读", rdRune: "北欧符文解读", rdOracle: "寺观灵签解读",
      expBrand: "ASTRA 占卜", expFooter: "在线演示 · 内置示例解读 · ",
      expSynthesis: "综合", expActions: "可执行建议",
      readingShare: "❋ 分享链接", shareTitle: "分享这份星图", shareHint: "链接内已包含完整解读内容，对方打开即可直接查看，无需服务器。",
      shareCopy: "复制链接", shareCopied: "已复制 ✓", shareClose: "关闭", shareMaking: "正在生成链接…",
      shareBaseLabel: "站点公开地址",
      shareBasePh: "https://用户名.github.io/HW05/",
      shareBaseNote: "部署后会自动使用当前站点地址；本地预览先填这里，生成的链接部署后即可打开。",
      shareNoBase: "先填写站点公开地址，部署后链接自动可用",
      shareBanner: "来自分享 · 星图回放", shareBad: "分享链接无效或已损坏",
      orientUp: "正位", orientRev: "逆位", orientUpShort: "正", orientRevShort: "逆",
      lblBaseHex: "本卦", lblChangeHex: "变卦",
      hexInfo: "第 {{0}} 卦 · 变：{{1}}",
      lblStar: "星宿", lblGuardian: "守护", lblGuardianPrefix: "守护 · ",
      lblVerse: "签诗", lblSol: "签解",
      lblNum: "灵数", lblNumSymbol: "取象", lblNumNow: "当下",
      speakPlay: "🔊 朗读", speakStop: "⏸ 停止",
      noSpeech: "当前浏览器不支持语音朗读（Web Speech API）。",
      liveNote: "已接入 StepFun 大模型：解读与语音由 AI 实时生成。",
      liveBanner: "实时生成 · StepFun 大模型",
      genReading: "正在为你生成解读…",
      rlWorking: "正在生成解读",
      rlWorking2: "星象正在成形",
      rlWorking3: "就快好了 · 星辰正在落笔",
      rlWorking4: "这一问有点深，请再稍候",
      rlReady: "解读已生成",
      rlElapsed: "已等待 {{0}} 秒",
      rlCosmos: "在你等待的 {{0}} 秒里 · 星光走了 {{1}} 万公里 · 地球带着你飞了 {{2}} 公里 · 心跳约 {{3}} 次",
      rlDraw: "✦ 换一条星语",
      rlSign: "第 {{0}} 签 · {{1}}",
      rlStep1: "整理取象", rlStep2: "解析象征", rlStep3: "对应所问", rlStep4: "生成建议",
      rlWaitHint: "通常需要 15–30 秒，可以先把问题在心里过一遍。",
      ldTarot: "三张牌分别对应过去、现在与未来。解读会结合牌位、正逆位与牌面象征，梳理这件事的来路、当下与可能走向。",
      ldGua: "六爻以本卦看当下处境，以变卦看趋势。解读会落在卦象、动爻与五行关系上，判断此刻宜进还是宜守。",
      ldNumber: "灵数从这组数字的和、根数与重复节奏中取象，读出你此刻的能量倾向，以及可以落地的行动方向。",
      ldMansion: "二十八宿以所取星宿与四象归属为线索。解读会结合值宿意象与星野方位，照见当下的人事与时机。",
      ldRune: "三枚符石各有立场与时间意味。解读会结合符文含义与落位，给出此刻最值得留意的一条提示。",
      ldOracle: "灵签以签等与签诗为纲。解读会拆解诗中的意象与典故，判断所问之事的吉凶倾向与应对方式。",
      disclaimerLive: "以上由 StepFun 大模型生成，仅供灵感与反思，不构成任何医疗、法律或投资建议。",
      ttsLoading: "⏳ 合成语音…",
      ttsFail: "语音合成失败，已改用浏览器朗读。",
      expFooterLive: "StepFun 实时生成 · 仅供灵感 · ",
      tarotTone: "牌面已经给出线索。",
      tarotUp: "{{0}}正位落在「{{1}}」，关键词是{{2}}。它说明这段处境的主动权在你手上：阻碍更多来自节奏没排好，而不是外部条件不够。把下周要完成的事缩到一个具体动作，先做出来，再根据反馈调整。",
      tarotRev: "{{0}}逆位出现在「{{1}}」，关键词是{{2}}。它更像在提醒：你在某个环节上硬撑或回避，能量没有真正流动。与其加倍用力，不如先找出让你迟迟不动的具体顾虑，把它写下来，再决定要不要继续。",
      tarotSynth: "把三张牌连起来看：过去那张解释了你为什么会走到今天，现在这张决定你此刻的手感，未来那张只是当下选择的延长线。你真正要处理的不是结果，而是还在拖的那件小事。设一个明确的时间点，比如这周日晚上，只看进度不看情绪。",
      tarotAct1: "今晚列出这件事最坏的结果，以及你能接受的底线",
      tarotAct2: "这周约一个具体的人，问一个具体的问题，别用消息试探",
      tarotAct3: "三天后回看：哪一步真的推动了事情，哪一步只是缓解焦虑",
      tarotClose: "牌只是把选择摆回你面前，路仍由你走。",
      guaTone: "{{0}}，先稳住再动。",
      guaBase: "本卦{{0}}（第{{1}}卦）说的是当下的地形：外部看起来在推你，内部却还没准备好。先分清哪部分是你真正能控制的，把力气放在那上面；控制不了的部分，暂缓表态，给自己留出回旋空间。",
      guaChange: "变卦指向{{0}}，说明局面不会原地不动。真正需要挪动的往往不是大方向，而是一个小支点：一次沟通、一个截止时间，或一项资源的重新分配。先动这一处，其他压力会跟着松开。",
      guaSynth: "六爻自下而上，最底下那一爻最实。你现在最该做的，是把最基础的一步落实：该确认的确认，该拒绝的拒绝，该补的漏洞补上。基础一稳，上面的选择会自己变清楚，不必急着一次想完所有可能。",
      guaAct1: "今天把这件事的最小一步写成一个 30 分钟能完成的任务",
      guaAct2: "列一张「我能控制 / 我不能控制」两栏清单，只处理左栏",
      guaAct3: "这周找一个信得过的人，把顾虑说出口，不要独自推演",
      guaClose: "卦象只是地形，走哪条路仍由你决定。",
      manTone: "{{0}} 当值，先稳住节奏。",
      manGuardCard: "守护 · {{0}}",
      manStarText: "本宿{{0}}，星象意象是「{{1}}」。{{2}} 落到你眼下的处境，它更像在提醒：先把生活里一个具体角落收拾好，比如桌面、睡眠，或一件拖了很久的小事；秩序感回来，判断也会跟着回来。",
      manGuardText: "今日的守护来自「{{0}}」。{{1}} 别把它当成命令，只当成一个检查点：今天有没有为这件事投入哪怕十分钟？有，就继续；没有，就把明天的第一步缩小到十分钟。",
      manSynth: "二十八宿轮值，这一宿把注意力从喧闹拉回一个具体意象。你现在缺的不是更多信息，而是一个能立刻执行的小动作。把它安排在今天的固定时段，做完就停，不用一次解决全部问题。",
      manAct1: "今天花十分钟整理桌面或背包，只留下本周要用的东西",
      manAct2: "把守护兽的那句提醒写进手机备忘录，设一个晚间提醒",
      manAct3: "睡前抬头看一分钟夜空，顺便写下明天最重要的一件事",
      manClose: "星宿给的是意象，日子仍要你一天一天过。",
      runeTone: "三枚符文落地，先听后动。",
      runePos1: "这一枚更像在说已经发生的事：先承认它的影响，再决定要不要沿用旧做法。",
      runePos2: "这一枚对应你此刻的位置：把注意力放在能马上做的那一步，而不是反复评估。",
      runePos3: "这一枚指向接下来：给自己设一个观察期，用结果验证判断，而不是靠感觉。",
      runeSynth: "三枚符文不是判决书，而是三块路标：一枚解释来路，一枚照见当下，一枚提示下一步。把它们放在一起，你会看到一个共同点——你现在最需要的是减少同时进行的事，把精力收回到一件真正重要的事情上。先做减法，再谈突破。",
      runeAct1: "今天删掉一件可做可不做的安排，把时间还给最重要的事",
      runeAct2: "把那枚最打动你的符文写在便签上，贴在看得见的地方",
      runeAct3: "设一个三天的观察期，只记录结果，不急着下结论",
      runeClose: "石头不说话，选择仍在你手里。",
      oracleTone: "{{0}} · 第 {{1}} 签。",
      oracleSolCard: "解",
      oracleVerse: "签诗写的是「{{0}}」。大意是事情正在起变化，眼前的不顺更像过渡而不是终点。把它放回你问的这件事上：先处理最具体的一环，别被情绪带着做决定；等这一环松动，后面会顺很多。",
      oracleGuide: "此签为{{0}}。{{1}} 具体到行动：今天先完成一件能带来确定感的小事，再决定要不要加码；如果心里仍然不安，就把决定推迟到明天同一时间，给自己一个冷静窗口。",
      oracleSynth: "签文的价值不在吉凶两个字，而在它是否说中了你心里的结。你现在需要的不是再求一个答案，而是把问题缩小到一个可以验证的动作：做一次沟通、交一份材料，或设一个截止时间。做完再看，局面会比想象中清楚。",
      oracleAct1: "把签诗读三遍，圈出最戳你的那一句，写下一个对应的行动",
      oracleAct2: "今天完成一件能带来确定感的小事，再决定要不要加码",
      oracleAct3: "把重要决定推迟到明天同一时间，留一个冷静窗口",
      oracleClose: "签示一时之象，路仍由你走。",
      numTone: "灵数 · {{0}} 凝成「{{1}}」。",
      numText: "把 {{0}} 逐位相加得到 {{1}}，约到第 {{2}} 号能量「{{3}}」。{{4}} 这组数字更像在说：你现在不缺想法，缺的是一个明确的起手式。先把手上最乱的那件事收拢成一条可执行的动作，再谈方向。",
      numSymbolText: "取象为「{{0}}」，主题是「{{1}}」。落到日常，它提醒你把注意力从「别人怎么看」挪回「我今天能完成什么」。如果你最近总在等一个更好的时机，这组数字更支持你先做出一个 60 分的小结果，再根据反馈调整。",
      numNowText: "「{{0}}」落在当下，具体指向你正在拖的那件事。先问自己：它卡在信息不足，还是怕做错？如果是信息不足，今天补一个关键问题；如果是怕做错，把任务缩到 20 分钟能完成的最小版本。做完这一步，判断会清楚很多。",
      numSynth: "把这组数字当成一张当下状态的草图：你有能量，也有方向感，但容易被「再准备一下」拖住。更有效的做法是设一个 72 小时窗口，只推进一件最重要的小事，用结果代替反复权衡；做完再决定下一步，而不是现在就逼自己想清全部。",
      numAct1: "今晚写下三个必须完成项，删掉一个，只留最重要的两个",
      numAct2: "给那件拖着的事设一个 20 分钟计时器，时间到就停",
      numAct3: "三天后回看一次进度，只记录做成了什么，不评价情绪",
      numClose: "灵数只是入口，门后仍是你自己的生活。"
    },
    en: {
      docTitle: "ASTRA · Divination Demo",
      brandSub: "Divination",
      themeToggle: "Night / Day",
      cameraToggle: "🎥 Camera",
      cameraOn: "🎥 Camera: On",
      soundOff: "🔕 Sound",
      soundOn: "🔔 Sound",
      bgmOff: "🔈 BGM",
      bgmOn: "🔊 BGM",
      heroTitle: "Before the stardust falls,<br/>ask one question",
      heroSub: "At the path's end stand six doors; behind each waits an old way of asking the stars.",
      gateHint: "The gate opens by itself · or touch it to enter",
      idKicker: "STEP ONE · CHOOSE YOUR GUISE",
      idTitle: "As whom will you walk the star-path?",
      idSub: "Your identity lights up its answering door and writes your first question for you.",
      idWanderer: "The Wanderer", idWandererLine: "Asks the road: study, career, the next step",
      idHeart: "The Heartbearer", idHeartLine: "Asks the heart: love, longing, reunion and goodbye",
      idChooser: "The Chooser", idChooserLine: "Asks the fork: this or that, begin or stop",
      idStargazer: "The Stargazer", idStargazerLine: "Asks the self: state, mood and fortune",
      idBack: "‹ Back to the gate",
      idSkip: "No identity · drift as fate wills",
      pathKicker: "STEP TWO · CHOOSE A DOOR",
      pathTitle: "The Six Doors",
      idChipPre: "As · ",
      idChipNone: "No identity chosen — drifting",
      doorRandom: "✦ Let fate pick a door",
      pathBack: "‹ Change identity",
      startBtn: "Begin",
      demoNote: "Online demo mode: readings are built-in samples. Double-click 启动演示.bat locally to connect StepFun and generate readings for your own question.",
      demoBanner: "Demo · built-in sample reading (run 启动演示.bat locally for live AI)",
      cardTarot: "Tarot", cardTarotDesc: "Three cards: past, present, future",
      cardGua: "I Ching", cardGuaDesc: "Cast coins, build a hexagram",
      cardNumber: "Numerology", cardNumberDesc: "Ask the stars with numbers",
      cardMansion: "28 Mansions", cardMansionDesc: "A beast per mansion, guiding the sky",
      cardRune: "Runes", cardRuneDesc: "Three rune-stones, cast for counsel",
      cardOracle: "Oracle", cardOracleDesc: "Shake for a lot, verses reveal fate",
      backBtn: "‹ Back",
      titleTarot: "Tarot · Star-ring Guidance", titleGua: "I Ching · Casting Array",
      titleNumber: "Numerology · Echo of Numbers", titleMansion: "Lunar Mansions · Sky Guidance",
      titleRune: "Runes · Ancient Tongue", titleOracle: "Oracle · One Lot's Omen",
      hintTarot: "Tap “Shuffle” to build the spread, then drag the deck sideways — the large center card is your current card. The three cards map to Past / Present / Future.",
      hintGua: "Tap “Cast” to toss six times, building the hexagram from bottom up. The array lights line by line.",
      hintNumber: "Write a number (a birthday, or any 1–9 digits), then tap Generate — the dust condenses it into a sigil.",
      hintMansion: "Spin the ring so a mansion rests at the top capture point, or tap “Spin” to light one at random.",
      hintRune: "Tap “Cast” to hear the message of three ancient rune-stones.",
      hintOracle: "Tap “Draw Lot”, calm your mind, and receive one lot's omen.",
      askPh: "(optional) What do you wish to ask? Write your question or wish…",
      askRandom: "Surprise me",
      askRandomAria: "Fill in a random suggested question",
      askHint: "Try a prompt · tap to fill",
      dialSel: "Selector",
      tarotShuffle: "Shuffle", tarotReveal: "Reveal Reading", tarotReset: "Start Over",
      guaToss: "Cast", guaReveal: "View Reading",
      numPh: "e.g. 19980918", numGen: "Generate", numReveal: "View Reading",
      mansionSel: "Capture", mansionSpin: "Spin", mansionPick: "Mansion Guidance",
      runeCast: "Cast", runeReveal: "View Reading",
      oracleDraw: "Draw Lot", oracleReveal: "View Verse",
      readingTitle: "Reading", readingSpeak: "🔊 Read", readingExport: "⤓ Export", readingExit: "✕ Exit",
      camClose: "Close", camStatus: "Processed locally, never uploaded",
      camGesturePrefix: "Gesture: ", camNoHand: "No hand · raise your hand into view", camHandOn: "✋ Open palm · hold to select", camModelFail: "Model not loaded · use the mouse",
      camNeedOpen: "✋ Open your palm · palm becomes the cursor",
      camDetecting: "Detecting…", camNoResult: "Gesture model not responding · reload or use the mouse", camHit: "✓ Selected · {{0}}",
      camNeedHttp: "The gesture model can't load from file:// (browsers block local file fetches).\n\nFix: double-click 启动演示.bat in the HW05 folder — it opens http://localhost:8787\nYou can also type http://localhost:8787 in the address bar.\n\nEverything else (six gates, AI readings) still works on this file:// page.",
      camLoading: "Loading model… {{0}}s", camNoVideo: "No camera frames · another app may be using it", camSendFail: "Gesture model failed · use the mouse",
      cgOpen: "Open palm · move cursor, hold to select",
      skipReveal: "Skip reveal",
      stageTarot: "SPREAD", stageGua: "HEXAGRAM", stageNumber: "NUMEROLOGY", stageMansion: "MANSION", stageRune: "RUNES", stageOracle: "LOT",
      tarotHintIdle: "Drag the deck sideways — the large center card is your current card; click it or the selector above to pick.",
      tarotPicked3: "Three cards placed. Tap “Reveal Reading”.",
      tarotPickedN: "{{0}} card(s) taken. Keep spinning to pick more.",
      tarotShuffledKept: "Deck reshuffled — {{0}} card(s) kept.",
      tarotUsed: "That card is already taken. Spin the wheel for another.",
      guaHintIdle: "Tap “Cast” to toss six times, building the hexagram from bottom up. The array lights line by line.",
      guaCasting: "The array is turning… lines rise from below.",
      guaDone: "Six lines formed. Tap “View Reading”.",
      numEmpty: "Please enter a number first",
      numBirth: "Birthday", numToday: "Today", numLucky: "Lucky 7s",
      numRandom: "✦ Random",
      numGuide: "No number in mind? Tap Random and let the dust choose one.",
      numRevealTip: "Your sigil is ready · tap below for the full reading",
      numSum: "Digit sum {{0}}", numRoot: "Resonance {{0}}",
      guaIdle: "Awaiting six lines",
      triUpper: "Upper", triLower: "Lower",
      mansionKicker: "MANSION",
      runeCastDone: "Three stones drawn: {{0}}. Tap “View Reading”.",
      cupLabel: "LOTS",
      oracleGot: "Lot {{0}} · {{1}} · {{2}}",
      oracleDone: "A lot has been drawn. Tap “View Verse”.",
      mansionHintIdle: "Spin the ring so a mansion rests at the top capture point, or tap “Spin” to light one at random.",
      mansionChosen: "Captured “{{0}}”. Tap “Mansion Guidance”.",
      tLove: "Love", tCareer: "Career", tHealth: "Well-being", tChoice: "Choice", tRelation: "Relations", tOther: "Open",
      tailLove: "Your question points at a relationship: first separate wanting this person from wanting to be answered. If it's the former, make one concrete invitation; if the latter, fill your own life first.",
      tailCareer: "Your question points at career: turn the goal into one deliverable this week and let the work speak before you weigh options.",
      tailHealth: "Your question points at body and mind: sleep 30 minutes earlier tonight, walk ten minutes instead of scrolling tomorrow, and check again in three days.",
      tailChoice: "Your question points at a choice: list the price of each option and pick the one whose price you're willing to pay, not the one that looks better.",
      tailRelation: "Your question points at people: speak concretely — facts, feelings, requests — and stop making the other person guess.",
      tailOther: "",
      lblYouAsk: "You ask · ", lblYouAskSpeech: "You ask: ",
      lblSynthesis: "Synthesis", lblActions: "Suggested steps",
      roOverview: "Summary", roActions: "Steps",
      disclaimer: "This is the built-in sample reading of the online demo. Run 启动演示.bat locally and the same structure is generated live by StepFun for your question.",
      rdTarot: "Tarot Reading", rdGua: "I Ching Reading", rdNumber: "Numerology Reading", rdMansion: "Mansions Reading", rdRune: "Runes Reading", rdOracle: "Oracle Reading",
      expBrand: "ASTRA Divination", expFooter: "Online demo · sample reading · ",
      expSynthesis: "Synthesis", expActions: "Suggested steps",
      readingShare: "❋ Share", shareTitle: "Share this star chart", shareHint: "The link embeds the full reading — anyone opening it sees the same chart, no server needed.",
      shareCopy: "Copy link", shareCopied: "Copied ✓", shareClose: "Close", shareMaking: "Generating link…",
      shareBaseLabel: "Public site URL",
      shareBasePh: "https://username.github.io/HW05/",
      shareBaseNote: "Once deployed, the current site URL is used automatically. Fill this in to preview working links locally.",
      shareNoBase: "Add your public site URL to create a shareable link",
      shareBanner: "Shared reading · replay", shareBad: "Share link is invalid or corrupted",
      orientUp: "Upright", orientRev: "Reversed", orientUpShort: "Up", orientRevShort: "Rev",
      lblBaseHex: "Base", lblChangeHex: "Changed",
      hexInfo: "Hexagram {{0}} · Changes to: {{1}}",
      lblStar: "Mansion", lblGuardian: "Guardian", lblGuardianPrefix: "Guardian · ",
      lblVerse: "Verse", lblSol: "Exegesis",
      lblNum: "Numerology", lblNumSymbol: "Glyph", lblNumNow: "Present",
      speakPlay: "🔊 Read", speakStop: "⏸ Stop",
      noSpeech: "This browser does not support speech reading (Web Speech API).",
      liveNote: "Connected to StepFun: readings & voice are generated live by AI.",
      liveBanner: "Live · StepFun model",
      genReading: "Weaving your reading…",
      rlWorking: "Generating reading",
      rlWorking2: "The signs are taking shape",
      rlWorking3: "Almost there · the stars are writing",
      rlWorking4: "A deep question — thanks for waiting",
      rlReady: "Reading ready",
      rlElapsed: "{{0}}s elapsed",
      rlCosmos: "While you waited {{0}}s · light covered {{1}} km · Earth carried you {{2}} km · your heart beat ~{{3}} times",
      rlDraw: "✦ Another star note",
      rlSign: "Lot {{0}} · {{1}}",
      rlStep1: "Gather the signs", rlStep2: "Interpret symbols", rlStep3: "Connect your question", rlStep4: "Compose guidance",
      rlWaitHint: "Usually 15–30 seconds — hold your question in mind meanwhile.",
      ldTarot: "Three cards map to past, present, and future. The reading weighs position, orientation, and symbolism to trace where this matter came from and where it may go.",
      ldGua: "The primary hexagram reflects your current situation; the changed hexagram hints at the trend. The reading works through trigrams, moving lines, and the five phases.",
      ldNumber: "Numerology draws on the sum, root, and repeating rhythm of your number to reflect your current energy and a practical direction.",
      ldMansion: "The chosen lunar mansion and its quadrant set the frame. The reading draws on its imagery and position to illuminate the people and timing involved.",
      ldRune: "Each of the three rune stones carries a stance and a sense of time. The reading joins their meanings and placement into one message worth heeding.",
      ldOracle: "The lot's grade and poem are the backbone. The reading unpacks its imagery and allusions to gauge the tendency of your question and how best to respond.",
      disclaimerLive: "Generated by the StepFun model for inspiration & reflection only. Not medical, legal, or investment advice.",
      ttsLoading: "⏳ Synthesizing…",
      ttsFail: "Voice synthesis failed, switched to browser speech.",
      expFooterLive: "StepFun live generation · inspiration only · ",
      tarotTone: "The cards have already left a clue.",
      tarotUp: "{{0}} upright in “{{1}}”, keyed to {{2}}. It says the initiative is still in your hands: the block is more about pacing than about conditions. Shrink next week's goal to one concrete move, make it, then adjust from the feedback.",
      tarotRev: "{{0}} reversed in “{{1}}”, keyed to {{2}}. It suggests you're forcing or avoiding one part of this, so the energy isn't moving. Instead of pushing harder, name the specific worry that keeps you still, write it down, then decide whether to continue.",
      tarotSynth: "Read together: the past card explains how you got here, the present card sets your current grip, and the future card is only an extension of today's choice. What needs handling isn't the outcome but the small thing still being postponed. Pick a fixed checkpoint, say Sunday evening, and review progress, not mood.",
      tarotAct1: "Tonight, write the worst realistic outcome and the bottom line you can accept",
      tarotAct2: "This week, ask one specific person one specific question — no hinting by text",
      tarotAct3: "In three days, check which step moved things and which only eased anxiety",
      tarotClose: "The cards only set the choice back before you; the road is still yours.",
      guaTone: "{{0}}: steady first, then move.",
      guaBase: "The base hexagram {{0}} (No. {{1}}) maps the present terrain: outside pressure is real, but inside you're not ready. Separate what you can actually control and put force there; for the rest, delay your position and keep room to turn.",
      guaChange: "The changed hexagram points to {{0}}, so this won't stay still. What needs shifting is usually not the whole direction but one pivot: a conversation, a deadline, or a reallocation of resources. Move that one piece and the other pressure loosens.",
      guaSynth: "The hexagram builds from the bottom, and the first line is the most real. Your next move is to settle the most basic step: confirm what needs confirming, decline what needs declining, patch the gap. Once the base is steady, the upper choices clarify themselves — you don't have to think through every possibility now.",
      guaAct1: "Today, turn the smallest step into a task you can finish in 30 minutes",
      guaAct2: "Make a two-column list — in my control / not — and touch only the left",
      guaAct3: "This week, say the worry out loud to someone you trust; stop solo replaying",
      guaClose: "The hexagram is only terrain; which road to take is still yours.",
      manTone: "{{0}} takes its turn — steady the rhythm first.",
      manGuardCard: "Guardian · {{0}}",
      manStarText: "This mansion is {{0}}; its image is “{{1}}”. {{2}} For your situation, it reads as a prompt to tidy one concrete corner of daily life — your desk, your sleep, or a small task long postponed. Once order returns, judgment follows.",
      manGuardText: "Today's guardian is “{{0}}”. {{1}} Don't treat it as an order; treat it as a checkpoint: did you give this ten minutes today? If yes, continue. If not, shrink tomorrow's first step to ten minutes.",
      manSynth: "The 28 mansions take turns, and this one pulls attention from noise back to one concrete image. What you lack is not more information but one action you can take now. Put it at a fixed time today, stop when it's done, and don't try to solve everything at once.",
      manAct1: "Spend ten minutes clearing your desk or bag; keep only this week's needs",
      manAct2: "Put the guardian's reminder in your phone notes with an evening alert",
      manAct3: "Before sleep, look at the sky for a minute and note tomorrow's top task",
      manClose: "The mansion lends an image; the days are still yours to live.",
      runeTone: "Three runes have landed — listen before moving.",
      runePos1: "This one speaks of what already happened: acknowledge its pull before deciding whether to keep the old approach.",
      runePos2: "This one marks where you stand now: put attention on the step you can take immediately, not on more evaluation.",
      runePos3: "This one points ahead: set an observation window and test the judgment against results, not against mood.",
      runeSynth: "The three runes are not a verdict but three signposts: one explains the approach, one mirrors the present, one hints at the next move. Together they share a theme — you need fewer things running at once and more energy returned to one thing that matters. Subtract first; breakthrough later.",
      runeAct1: "Today, cancel one optional commitment and give the time to what matters",
      runeAct2: "Write the rune that moved you on a note and keep it in sight",
      runeAct3: "Set a three-day window and record only results, not conclusions",
      runeClose: "The stones stay silent; the choosing remains yours alone.",
      oracleTone: "{{0}} · Lot {{1}}.",
      oracleSolCard: "Exegesis",
      oracleVerse: "The verse reads: “{{0}}”. Its gist is that things are shifting; the current friction is a passage, not the end. Bring it back to your question: handle the most concrete piece first and don't let mood make the decision. Once that piece loosens, the rest follows.",
      oracleGuide: "This is a {{0}} lot. {{1}} In practice: finish one small thing today that restores certainty, then decide whether to add more. If unease remains, delay the decision until the same time tomorrow and give yourself a cooling-off window.",
      oracleSynth: "The lot's value isn't in the label “auspicious” or “inauspicious” but in whether it names the knot in your chest. What you need now is not another answer but a smaller, testable action: one conversation, one document submitted, or one deadline set. Do it, then look again — the picture will be clearer than you expect.",
      oracleAct1: "Read the verse three times, circle the line that stings, name one action",
      oracleAct2: "Finish one small thing that restores certainty before adding more",
      oracleAct3: "Delay the big decision until the same time tomorrow; keep a cooling window",
      oracleClose: "The lot shows a moment's image; the road is still yours.",
      numTone: "Numerology · {{0}} condenses into “{{1}}”.",
      numText: "Adding the digits of {{0}} gives {{1}}, resolving to energy No. {{2}}, “{{3}}”. {{4}} The number suggests you don't lack ideas; you lack a clear first move. Gather the messiest thing on your plate into one executable action before talking about direction.",
      numSymbolText: "The glyph is “{{0}}”, themed “{{1}}”. In daily terms, it asks you to move attention from “how others see it” back to “what I can finish today”. If you've been waiting for a better moment, this number favors a 60-point result first, then adjustment from feedback.",
      numNowText: "“{{0}}” lands in the present and points at the thing you keep postponing. Ask yourself: is it blocked by missing information, or by fear of being wrong? Missing information — ask one key question today. Fear — shrink it to a 20-minute minimum version. After that step, the judgment gets much clearer.",
      numSynth: "Treat this number as a sketch of your current state: you have energy and a sense of direction, but “let me prepare a bit more” keeps delaying you. A better move is a 72-hour window with one important small task, letting results replace rumination. Decide the next step after finishing, not before.",
      numAct1: "Tonight, list three must-dos, delete one, and keep the two that matter",
      numAct2: "Set a 20-minute timer on the postponed task and stop when it rings",
      numAct3: "In three days, review only what got done, not how you felt about it",
      numClose: "The number is only a doorway; behind it is still your own life."
    }
  };
  function t(key, args) {
    let s = (I18N[lang] && I18N[lang][key] != null) ? I18N[lang][key] : (I18N.zh[key] != null ? I18N.zh[key] : key);
    if (args && args.length) s = s.replace(/\{\{(\d+)\}\}/g, (m, i) => (args[+i] != null ? args[+i] : m));
    return s;
  }
  function applyI18nStatic() {
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
  }
  function applyLang() {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    applyI18nStatic();
    if (themeToggle) themeToggle.textContent = t("themeToggle");
    if (cameraToggle) cameraToggle.textContent = camOn ? t("cameraOn") : t("cameraToggle");
    if (soundToggle) {
      soundToggle.textContent = soundOn ? t("soundOn") : t("soundOff");
      soundToggle.classList.toggle("is-on", soundOn);
    }
    if (bgmToggle) { bgmToggle.textContent = bgmOn ? t("bgmOn") : t("bgmOff"); bgmToggle.classList.toggle("is-on", bgmOn); }
    if (langToggle) langToggle.textContent = lang === "zh" ? "EN" : "中";
    document.title = t("docTitle");
    refreshQuestionChips();
    refreshDynamicLang();
    refreshHomeNote();
    refreshReadingBanner();
    loadHeroQuote();
    // 已生成的解读是模型按原语言写死的：切语言时重新求一次，避免中英混排
    if (state.screen === "reading") {
      const rr = pendingReading || currentReading;
      if (rr) showReading(rr.type, rr.data);
    }
  }
  function setLang(l) {
    if (l !== "en" && l !== "zh") return;
    if (state.screen === "reading") { stopAudio(); resetSpeakBtn(); }
    lang = l;
    try { localStorage.setItem("lang", l); } catch (e) {}
    applyLang();
  }
  const langToggle = document.getElementById("langToggle");
  const bgmToggle = document.getElementById("bgmToggle");

  /* ---------------- 状态机 ---------------- */
  const state = { screen: "home" };
  const reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const MODULE_SCREENS = { tarot: 1, gua: 1, number: 1, mansion: 1, rune: 1, oracle: 1 };
  const sceneVeil = document.getElementById("sceneVeil");
  let lastModule = null;
  let switchTimer = 0, transTimer = 0, arriveTimer = 0, castTimer = 0;

  // 换屏时切换 <html data-module>，只换“房间光”，解读页沿用上一间房
  function applyRoom(name) {
    if (MODULE_SCREENS[name]) lastModule = name;
    const room = name === "reading" ? lastModule : (MODULE_SCREENS[name] ? name : null);
    if (room) document.documentElement.setAttribute("data-module", room);
    else document.documentElement.removeAttribute("data-module");
    if (window.__particles) window.__particles.recolor();   // 星尘跟着房间换色
  }
  function onEnterScreen(name) {
    // 入门一记主题色迸溅：此刻星尘已由 applyRoom 换成该门的配色
    if (MODULE_SCREENS[name] && window.__particles && !reduced) window.__particles.burst();
    if (name === "home") { setStage(journey.entered ? "path" : "gate", true); updateIdChip(); armGateAuto(); }
    if (name === "tarot") resetTarot();
    if (name === "gua") { resetGua(); startGuaAnim(); }
    if (name === "number") resetNumber();
    if (name === "mansion") resetMansion();
    if (name === "rune") { resetRune(); ensureRuneTextures(); }
    if (name === "oracle") resetOracle();
    if (name !== "gua") stopGuaAnim();
  }
  function switchScreen(name) {
    if (state.screen === name) return;
    if (state.screen === "reading" && name !== "reading") { stopAudio(); resetSpeakBtn(); }
    const toReading = name === "reading";
    sfx("whoosh");
    clearTimeout(castTimer);
    document.body.classList.remove("is-cast");
    if (!reduced) document.body.classList.add("is-transitioning");
    // 解读自带星尘揭晓层，不再叠一层幕布
    if (!reduced && !toReading) sceneVeil.classList.add("in");
    if (window.__particles) window.__particles.collapse();
    clearTimeout(switchTimer);
    const swapAt = reduced ? 0 : (toReading ? 360 : 560);
    switchTimer = setTimeout(() => {
      document.querySelectorAll(".screen").forEach(s => s.classList.remove("is-active", "is-arriving"));
      const el = document.querySelector('[data-screen="' + name + '"]');
      if (el) {
        el.classList.add("is-active");
        if (!reduced) {
          el.classList.add("is-arriving");
          clearTimeout(arriveTimer);
          arriveTimer = setTimeout(() => el.classList.remove("is-arriving"), 1900);
        }
      }
      state.screen = name;
      applyRoom(name);
      document.body.classList.toggle("is-ritual", toReading);
      if (window.__particles) window.__particles.expand();
      bumpIdle();
      onEnterScreen(name);
      if (!reduced && !toReading) requestAnimationFrame(() => sceneVeil.classList.remove("in"));
      if (!reduced) {
        clearTimeout(transTimer);
        transTimer = setTimeout(() => document.body.classList.remove("is-transitioning"), 950);
      }
    }, swapAt);
  }
  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => switchScreen(btn.getAttribute("data-go")));
  });
  // 起卦 / 抽牌 / 生成时，顶栏与提示主动退让，把画面留给法阵
  document.addEventListener("click", e => {
    const btn = e.target.closest ? e.target.closest(".screen.is-active .primary-btn") : null;
    if (!btn || reduced || !MODULE_SCREENS[state.screen]) return;
    document.body.classList.add("is-cast");
    clearTimeout(castTimer);
    castTimer = setTimeout(() => document.body.classList.remove("is-cast"), 1800);
  });

  /* ---------------- 粒子引擎 ---------------- */
  function initParticles() {
    if (typeof THREE === "undefined") return null; // 离线降级
    const canvas = document.getElementById("bg");
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 ||
      (window.matchMedia && window.matchMedia("(max-width: 680px)").matches);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 3000);
    camera.position.z = 600;

    // 柔光圆点贴图
    const tex = (function () {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const g = c.getContext("2d");
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.4, "rgba(255,255,255,0.5)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();

    function makeLayer(count, spread, size, spin) {
      const pos = new Float32Array(count * 3);
      const base = new Float32Array(count * 3);
      const vel = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const shade = new Float32Array(count);   // 固定每颗星的混色比例，换主题时不再重新随机
      const bias = new Float32Array(count);    // 收拢速度的个体差异，避免整块同步缩小
      for (let i = 0; i < count; i++) {
        // 极坐标撒点：椭圆盘 + 略带起伏的边界，收拢时是星云而不是矩形
        const a = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random());
        const edge = 0.88 + 0.09 * Math.sin(a * 3 + 0.7) + 0.04 * Math.sin(a * 7 + 2.1);
        const x = Math.cos(a) * rr * spread.x * edge;
        const y = Math.sin(a) * rr * spread.y * edge;
        const z = (Math.random() * 2 - 1) * spread.z;
        pos[i*3] = base[i*3] = x;
        pos[i*3+1] = base[i*3+1] = y;
        pos[i*3+2] = base[i*3+2] = z;
        shade[i] = Math.random();
        bias[i] = 0.7 + Math.random() * 0.55;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        size: size, map: tex, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, vertexColors: true, opacity: 0.9
      });
      const points = new THREE.Points(geo, mat);
      const group = new THREE.Group(); group.add(points);
      scene.add(group);
      return { geo, pos, base, vel, col, shade, bias, count, size, spin, group, points, mat };
    }

    const near = makeLayer(lowPower ? 700 : 1500, { x: 926, y: 586, z: 300 }, 6.4, 0.62);
    const far = makeLayer(lowPower ? 1300 : 2400, { x: 1013, y: 634, z: 540 }, 3.7, 0.42);

    const colors = { a: new THREE.Color(), b: new THREE.Color(), tmp: new THREE.Color() };
    function readColors() {
      const a = getComputedStyle(root).getPropertyValue("--particle-a").trim() || "#C9D4FF";
      const b = getComputedStyle(root).getPropertyValue("--particle-b").trim() || "#6F7BD8";
      colors.a.set(a); colors.b.set(b);
    }
    function recolor() {
      readColors();
      [near, far].forEach(L => {
        for (let i = 0; i < L.count; i++) {
          colors.tmp.copy(colors.a).lerp(colors.b, L.shade[i]);
          L.col[i*3] = colors.tmp.r; L.col[i*3+1] = colors.tmp.g; L.col[i*3+2] = colors.tmp.b;
        }
        L.geo.attributes.color.needsUpdate = true;
      });
    }
    readColors(); recolor();

    // 交互状态
    const pointer = { x: 0, y: 0 };
    const ripples = [];
    const attractor = { active: false, x: 0, y: 0 };
    let collapsing = false;
    let camTargetW = null;
    let impact = 0;                 // 揭晓瞬间的冲击余波（0-1，指数回落）
    const CAM_Z = 600, FOV0 = 60;   // 镜头基准，warp 结束后必须原样复位
    // 星际穿越：蓄力收拢 → 整片星尘沿 z 轴扑向镜头 → 回涌归位
    const warp = { active: false, t: 0, charge: 0.17, run: 0.68, release: 0.52 };

    function toWorld(ndcX, ndcY, zPlane) {
      const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
      const dir = v.sub(camera.position).normalize();
      const t = (zPlane - camera.position.z) / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(t));
    }

    window.addEventListener("pointermove", e => {
      if (window.__camOn) return;   // 摄像头模式下由摄像头驱动指针
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.x = nx; pointer.y = ny;
    });
    window.addEventListener("pointerdown", e => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      const w = toWorld(nx, ny, 0);
      ripples.push({ x: w.x, y: w.y, r: 0, max: 360, strength: 1.1 });
    });

    // 卡片 hover → 粒子聚拢
    document.querySelectorAll(".card").forEach(card => {
      const dir = card.getAttribute("data-attract");
      const tx = dir === "left" ? -220 : dir === "right" ? 220 : 0;
      card.addEventListener("pointerenter", () => { attractor.active = true; attractor.x = tx; attractor.y = 40; });
      card.addEventListener("pointerleave", () => { attractor.active = false; });
    });

    function updateLayer(L) {
      const { pos, vel, base, bias, count, group, spin } = L;
      const inward = collapsing;
      const agx = attractor.active ? attractor.x - group.position.x : null;
      const agy = attractor.active ? attractor.y - group.position.y : null;
      // 1 蓄力 · 2 冲刺 · 3 回涌（0 表示无 warp）
      const wp = warp.active
        ? (warp.t < warp.charge ? 1 : warp.t < warp.charge + warp.run ? 2 : 3)
        : 0;
      const wrk = wp === 2 ? Math.min(1, (warp.t - warp.charge) / warp.run) : 0;
      const wrl = wp === 3 ? Math.min(1, (warp.t - warp.charge - warp.run) / warp.release) : 0;
      for (let i = 0; i < count; i++) {
        const ix = i*3, iy = ix+1, iz = ix+2;
        let px = pos[ix], py = pos[iy], pz = pos[iz];
        let vx = vel[ix], vy = vel[iy], vz = vel[iz];
        if (wp === 1) {
          // 蓄力：星尘向中心轻轻收拢，把张力压到最紧，随即放手
          const b = bias[i], c = 1 - warp.t / warp.charge;
          vx += -px * 0.05 * b * c; vy += -py * 0.05 * b * c; vz += -pz * 0.03 * c;
          vx *= 0.9; vy *= 0.9; vz *= 0.9;
          px += vx; py += vy; pz += vz;
          pos[ix] = px; pos[iy] = py; pos[iz] = pz;
          vel[ix] = vx; vel[iy] = vy; vel[iz] = vz;
          continue;
        }
        if (wp === 2) {
          // 冲刺：沿 z 轴扑向镜头（PointsMaterial 自带透视缩放，越近越大）
          // 略过镜头后回到深邃处、换一个横向位置补位，形成扑面不绝的星流
          pz += (17 + 36 * wrk) * bias[i];
          px += px * 0.013 * bias[i];
          py += py * 0.013 * bias[i];
          if (pz > CAM_Z - 40) {
            const j = (Math.random() * count) | 0;
            const s = 0.8 + Math.random() * 0.9;
            px = base[j*3] * s; py = base[j*3+1] * s;
            pz = -1180 - Math.random() * 520;
          }
          vel[ix] = 0; vel[iy] = 0; vel[iz] = 0;
          pos[ix] = px; pos[iy] = py; pos[iz] = pz;
          continue;
        }
        if (wp === 3) {
          // 回涌：加大弹簧系数，星尘从深处流回原位，重新铺成星云
          const k = 0.05 + 0.08 * wrl;
          vx += (base[ix] - px) * k; vy += (base[iy] - py) * k; vz += (base[iz] - pz) * k;
          vx *= 0.86; vy *= 0.86; vz *= 0.86;
          px += vx; py += vy; pz += vz;
          pos[ix] = px; pos[iy] = py; pos[iz] = pz;
          vel[ix] = vx; vel[iy] = vy; vel[iz] = vz;
          continue;
        }
        if (inward) {
          // 螺旋内收：向心吸引 + 切向旋转，越远转得越快，个体速度有快有慢
          const b = bias[i];
          const d = Math.sqrt(px * px + py * py) + 0.001;
          vx += -px * 0.055 * b; vy += -py * 0.055 * b; vz += -pz * 0.05;
          const sw = spin * Math.min(1, d / 280) * b;
          vx += (-py / d) * sw; vy += (px / d) * sw;
        } else {
          vx += (base[ix] - px) * 0.03;
          vy += (base[iy] - py) * 0.03;
          vz += (base[iz] - pz) * 0.03;
        }
        if (!reduced && !inward) {
          for (let k = 0; k < ripples.length; k++) {
            const r = ripples[k];
            const dx = px - (r.x - group.position.x);
            const dy = py - (r.y - group.position.y);
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > 0.01 && Math.abs(d - r.r) < 46) {
              const f = (1 - Math.abs(d - r.r) / 46) * r.strength * (1 - r.r / r.max);
              vx += (dx / d) * f; vy += (dy / d) * f;
            }
          }
          if (attractor.active) {
            const dx = agx - px, dy = agy - py; const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 260 && d > 0.01) { const f = (1 - d / 260) * 0.5; vx += dx * f * 0.05; vy += dy * f * 0.05; }
          }
          if (camTargetW) {
            const dx = camTargetW.x - group.position.x - px;
            const dy = camTargetW.y - group.position.y - py;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 520 && d > 0.01) { const f = (1 - d / 520) * 0.32; vx += dx * f * 0.04; vy += dy * f * 0.04; }
          }
        }
        vx *= 0.9; vy *= 0.9; vz *= 0.9;
        px += vx; py += vy; pz += vz;
        pos[ix] = px; pos[iy] = py; pos[iz] = pz;
        vel[ix] = vx; vel[iy] = vy; vel[iz] = vz;
      }
      L.geo.attributes.position.needsUpdate = true;
    }

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize); resize();

    let raf = null, paused = false;
    document.addEventListener("visibilitychange", () => {
      paused = document.hidden;
      if (!paused && raf === null) loop();
    });

    // 偶发流星：一道细长辉光斜掠夜空，克制不抢戏
    const meteors = [];
    let nextMeteor = 3 + Math.random() * 5;
    function spawnMeteor() {
      const mat = new THREE.SpriteMaterial({
        map: tex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending
      });
      mat.color.copy(colors.a).lerp(colors.b, 0.35);
      const sp = new THREE.Sprite(mat);
      const vh = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
      const vw = vh * camera.aspect;
      const fromLeft = Math.random() < 0.5;
      const x0 = (fromLeft ? -1 : 1) * (vw / 2 + 90);
      const y0 = vh * (0.16 + Math.random() * 0.3);
      const dx = -x0 + (fromLeft ? 1 : -1) * vw * (0.05 + Math.random() * 0.1);
      const dy = -vh * (0.22 + Math.random() * 0.18);
      sp.position.set(x0, y0, 0);
      sp.scale.set(120, 2.6, 1);
      mat.rotation = Math.atan2(dy, dx);
      scene.add(sp);
      meteors.push({ sp, mat, x0, y0, dx, dy, t: 0, dur: 0.9 + Math.random() * 0.5 });
    }
    function updateMeteors(dt) {
      if (reduced) return;
      nextMeteor -= dt;
      if (nextMeteor <= 0 && meteors.length < 2) { spawnMeteor(); nextMeteor = 6 + Math.random() * 9; }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.t += dt;
        const k = m.t / m.dur;
        if (k >= 1) { scene.remove(m.sp); m.mat.dispose(); meteors.splice(i, 1); continue; }
        m.sp.position.x = m.x0 + m.dx * k;
        m.sp.position.y = m.y0 + m.dy * k;
        m.mat.opacity = Math.sin(k * Math.PI) * 0.5;
      }
    }

    let lastT = performance.now();
    function loop() {
      if (paused) { raf = null; return; }
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const tw = now * 0.001;
      if (impact > 0) impact = Math.max(0, impact - dt * 1.7);
      // 穿越强度：蓄力渐强 → 冲刺满档 → 回涌衰减
      const wAmp = warp.active
        ? (warp.t < warp.charge ? 0.32 + 0.68 * (warp.t / warp.charge)
          : warp.t < warp.charge + warp.run ? 1
          : Math.max(0, 1 - (warp.t - warp.charge - warp.run) / warp.release))
        : 0;
      const flash = Math.max(impact * impact, wAmp * 0.85);
      if (warp.active) {
        // 镜头：蓄力微收窄下蹲 → 冲刺推近 + 峰值轻震 → 回涌复位
        let fovB = 0, zB = 0, shake = 0;
        const t = warp.t;
        if (t < warp.charge) {
          const c = t / warp.charge;
          fovB = -7 * c; zB = 26 * c;
        } else if (t < warp.charge + warp.run) {
          const punch = Math.sin(Math.min(1, (t - warp.charge) / warp.run) * Math.PI);
          fovB = 22 * punch; zB = -78 * punch; shake = 6.5 * punch;
        } else {
          const d = 1 - Math.min(1, (t - warp.charge - warp.run) / warp.release);
          fovB = 10 * d; zB = -34 * d;
        }
        camera.fov = FOV0 + fovB; camera.updateProjectionMatrix();
        camera.position.z = CAM_Z + zB;
        camera.position.x = shake ? (Math.random() - 0.5) * shake : 0;
        camera.position.y = shake ? (Math.random() - 0.5) * shake : 0;
        warp.t += dt;
        if (warp.t >= warp.charge + warp.run + warp.release) {
          warp.active = false;
          camera.fov = FOV0; camera.updateProjectionMatrix();
          camera.position.set(0, 0, CAM_Z);
          ripples.push({ x: 0, y: 0, r: 0, max: 620, strength: 1 });   // 落位后荡开一圈余波
        }
      }
      // 视差
      near.group.position.x = -pointer.x * 42; near.group.position.y = pointer.y * 30;
      far.group.position.x = -pointer.x * 16; far.group.position.y = pointer.y * 12;
      // 星光呼吸 + 缓慢天旋（小幅度摆动，保证涟漪/吸附的世界坐标仍准确）；冲击时整体提亮
      near.mat.opacity = Math.min(1, 0.78 + 0.13 * Math.sin(tw * 1.15) + flash * 0.45);
      far.mat.opacity = Math.min(1, 0.6 + 0.15 * Math.sin(tw * 0.9 + 2.1) + flash * 0.32);
      // 穿越时颗粒整体放大一档，配合透视缩放形成扑面的星流
      near.mat.size = near.size * (1 + flash * 0.7 + wAmp * 1.6);
      far.mat.size = far.size * (1 + flash * 0.5 + wAmp * 1.3);
      near.group.rotation.z = Math.sin(tw * 0.045) * 0.1;
      far.group.rotation.z = Math.sin(tw * 0.03 + 1.7) * 0.14;
      camTargetW = (window.__camOn && !reduced) ? toWorld(pointer.x, pointer.y, 0) : null;
      for (let k = ripples.length - 1; k >= 0; k--) {
        ripples[k].r += 7;
        if (ripples[k].r > ripples[k].max) ripples.splice(k, 1);
      }
      updateMeteors(dt);
      updateLayer(near); updateLayer(far);
      renderer.render(scene, camera);
    }
    loop();

    return {
      collapse() { if (!reduced) collapsing = true; },
      expand() {
        if (collapsing) {
          // 反向爆开：径向冲量 + 延续旋涡方向，散成星云而不是重新铺回矩形
          [near, far].forEach(L => {
            const { pos, vel, count } = L;
            for (let i = 0; i < count; i++) {
              const ix = i*3, iy = ix+1, iz = ix+2;
              const px = pos[ix], py = pos[iy];
              const d = Math.sqrt(px * px + py * py) || 1;
              const k = 2.2 + Math.random() * 3.0;
              vel[ix] += (px / d) * k - (py / d) * k * 0.35;
              vel[iy] += (py / d) * k + (px / d) * k * 0.35;
              vel[iz] += (Math.random() - 0.5) * 1.6;
            }
          });
        }
        collapsing = false;
      },
      recolor,
      // 星际穿越：整片星尘朝镜头扑来（揭晓/出报告时用）
      warp() {
        if (reduced) return;
        collapsing = false;                  // 别让收拢逻辑和冲刺抢方向盘
        warp.active = true; warp.t = 0;
        impact = 1;
      },
      setPointer(x, y) { pointer.x = x; pointer.y = y; },
      pulseRipple(x, y) { const w = toWorld(x, y, 0); ripples.push({ x: w.x, y: w.y, r: 0, max: 360, strength: 1.1 }); },
      burst(x, y) {
        if (reduced) return;
        const w = toWorld(x == null ? 0 : x, y == null ? 0 : y, 0);
        ripples.push({ x: w.x, y: w.y, r: 0, max: 620, strength: 1.9 });
        // 越靠近冲击中心被推得越远，边缘只轻轻一荡，回弹交给原有弹簧
        [near, far].forEach(L => {
          const { pos, vel, count, group } = L;
          const cx = w.x - group.position.x, cy = w.y - group.position.y;
          for (let i = 0; i < count; i++) {
            const ix = i * 3, iy = ix + 1, iz = ix + 2;
            const dx = pos[ix] - cx, dy = pos[iy] - cy;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const push = Math.max(0, 1 - d / 820);
            const k = 0.9 + 5.2 * push * (0.55 + Math.random() * 0.9);
            vel[ix] += (dx / d) * k;
            vel[iy] += (dy / d) * k;
            vel[iz] += (Math.random() - 0.5) * (0.6 + 2.2 * push);
          }
        });
        impact = 1;
      }
    };
  }
  window.__particles = initParticles();

  /* ============================================================
     本地示例数据
     ============================================================ */
  const TAROT = [
    ["愚者","启程","The Fool","Beginnings"], ["魔术师","创造","The Magician","Creation"], ["女祭司","直觉","The High Priestess","Intuition"], ["皇后","丰盈","The Empress","Abundance"], ["皇帝","秩序","The Emperor","Order"],
    ["教皇","传承","The Hierophant","Tradition"], ["恋人","抉择","The Lovers","Choice"], ["战车","意志","The Chariot","Will"], ["力量","内省","Strength","Inner Strength"], ["隐士","退省","The Hermit","Retreat"],
    ["命运之轮","转机","Wheel of Fortune","Turning Point"], ["正义","平衡","Justice","Balance"], ["倒吊人","转念","The Hanged Man","Reversal"], ["死神","结束","Death","Ending"], ["节制","调和","Temperance","Harmony"],
    ["恶魔","执念","The Devil","Obsession"], ["高塔","崩解","The Tower","Collapse"], ["星星","希望","The Star","Hope"], ["月亮","迷雾","The Moon","Illusion"], ["太阳","明朗","The Sun","Clarity"],
    ["审判","觉醒","Judgement","Awakening"], ["世界","圆满","The World","Fulfillment"]
  ];
  // 离线 AI 牌面（assets/tarot/<idx>.webp）—— 存在则用，缺失走程序化兜底
  const TAROT_IMG = [];
  let tarotRedrawTimer = 0;
  function tarotImgReady(i) { const im = TAROT_IMG[i]; return !!(im && im.complete && im.naturalWidth > 0); }
  // 22 张图陆续加载完成时合并重绘，避免每张 onload 都全量重画一遍
  function scheduleTarotRedraw() {
    if (tarotRedrawTimer) return;
    tarotRedrawTimer = setTimeout(() => { tarotRedrawTimer = 0; redrawTarotFaces(); }, 120);
  }
  function tarotDPR() { return Math.min(2, window.devicePixelRatio || 1); }
  function loadTarotImages() {
    for (let i = 0; i < TAROT.length; i++) {
      const im = new Image();
      im.onload = () => { if (im.naturalWidth > 0) scheduleTarotRedraw(); };
      im.onerror = () => {};
      im.src = "assets/tarot/" + i + ".webp";
      TAROT_IMG[i] = im;
    }
  }
  function drawDialCards() {
    document.querySelectorAll(".dial-card canvas").forEach(cv => {
      drawCardFace(cv.getContext("2d"), cv.width, cv.height, +cv.dataset.idx, tarotName(+cv.dataset.idx));
    });
  }
  function redrawTarotFaces() {
    drawDialCards();
    document.querySelectorAll(".tarot-card .face canvas").forEach(cv => {
      drawCardFace(cv.getContext("2d"), cv.width, cv.height, +cv.dataset.idx, cv.dataset.name);
    });
    document.querySelectorAll("#readingStage .stage-card canvas").forEach(cv => {
      drawCardFace(cv.getContext("2d"), cv.width, cv.height, +cv.dataset.idx, cv.dataset.name, cv.dataset.rev === "1");
    });
  }
  const POS = ["过去", "现在", "未来"];
  const POS_EN = ["Past", "Present", "Future"];
  function posName(i) { return lang === "en" ? (POS_EN[i] || POS[i]) : (POS[i] || POS_EN[i]); }
  function tarotName(i) { return lang === "en" ? TAROT[i][2] : TAROT[i][0]; }
  function tarotKw(i) { return lang === "en" ? TAROT[i][3] : TAROT[i][1]; }
  const GUA = ["乾","坤","屯","蒙","需","讼","师","比","小畜","履","泰","否","同人","大有","谦","豫",
    "随","蛊","临","观","噬嗑","贲","剥","复","无妄","大畜","颐","大过","坎","离","咸","恒",
    "遁","大壮","晋","明夷","家人","睽","蹇","解","损","益","夬","姤","萃","升","困","井",
    "革","鼎","震","艮","渐","归妹","丰","旅","巽","兑","涣","节","中孚","小过","既济","未济"];
  const GUA_FULL = ["乾为天","坤为地","水雷屯","山水蒙","水天需","天水讼","地水师","水地比",
    "风天小畜","天泽履","地天泰","天地否","天火同人","火天大有","地山谦","雷地豫",
    "泽雷随","山风蛊","地泽临","风地观","火雷噬嗑","山火贲","山地剥","地雷复",
    "天雷无妄","山天大畜","山雷颐","泽风大过","坎为水","离为火","泽山咸","雷风恒",
    "天山遁","雷天大壮","火地晋","地火明夷","风火家人","火泽睽","水山蹇","雷水解",
    "山泽损","风雷益","泽天夬","天风姤","泽地萃","地风升","泽水困","水风井",
    "泽火革","火风鼎","震为雷","艮为山","风山渐","雷泽归妹","雷火丰","火山旅",
    "巽为风","兑为泽","风水涣","水泽节","风泽中孚","雷山小过","水火既济","火水未济"];
  const GUA_FULL_EN = ["The Creative","The Receptive","Difficulty at the Beginning","Youthful Folly","Waiting","Conflict","The Army","Holding Together",
    "The Taming Power of the Small","Treading","Peace","Standstill","Fellowship","Possession in Great Measure","Modesty","Enthusiasm",
    "Following","Work on the Decayed","Approach","Contemplation","Biting Through","Grace","Splitting Apart","Return",
    "Innocence","The Taming Power of the Great","Nourishment","Preponderance of the Great","The Abysmal Water","The Clinging Fire","Influence","Duration",
    "Retreat","The Power of the Great","Progress","Darkening of the Light","The Family","Opposition","Obstruction","Deliverance",
    "Decrease","Increase","Breakthrough","Coming to Meet","Gathering Together","Pushing Upward","Oppression","The Well",
    "Revolution","The Cauldron","The Arousing Thunder","Keeping Still Mountain","Development","The Marrying Maiden","Abundance","The Wanderer",
    "The Gentle Wind","The Joyous Lake","Dispersion","Limitation","Inner Truth","Preponderance of the Small","After Completion","Before Completion"];
  function guaFullName(i) { return lang === "en" ? (GUA_FULL_EN[i] || GUA_FULL[i]) : (GUA_FULL[i] || GUA_FULL_EN[i]); }
  // 八卦按三爻二进制索引（自下而上）：0 坤 · 1 震 · 2 坎 · 3 兑 · 4 艮 · 5 离 · 6 巽 · 7 乾
  const TRI = [
    { code: "kun",  zh: "坤", el: "地", en: "Earth" },
    { code: "zhen", zh: "震", el: "雷", en: "Thunder" },
    { code: "kan",  zh: "坎", el: "水", en: "Water" },
    { code: "dui",  zh: "兑", el: "泽", en: "Lake" },
    { code: "gen",  zh: "艮", el: "山", en: "Mountain" },
    { code: "li",   zh: "离", el: "火", en: "Fire" },
    { code: "xun",  zh: "巽", el: "风", en: "Wind" },
    { code: "qian", zh: "乾", el: "天", en: "Heaven" }
  ];
  function triName(tri) { return lang === "en" ? tri.en : tri.zh + " · " + tri.el; }
  // 八宫上下卦 → 文王卦序（GUA_FULL 下标）：行=上卦，列=下卦，索引同 TRI
  const GUA_KW = [
    [1, 23, 6, 18, 14, 35, 45, 10],
    [15, 50, 39, 53, 61, 54, 31, 33],
    [7, 2, 28, 59, 38, 62, 47, 4],
    [44, 16, 46, 57, 30, 48, 27, 42],
    [22, 26, 3, 40, 51, 21, 17, 25],
    [34, 20, 63, 37, 55, 29, 49, 13],
    [19, 41, 58, 60, 52, 36, 56, 8],
    [11, 24, 5, 9, 32, 12, 43, 0]
  ];
  function guaKingWen(binaryBase) {
    return GUA_KW[(binaryBase >> 3) & 7][binaryBase & 7];
  }
  const NUMBER_SYMBOLS = ["星","月","潮","林","镜","焰","羽","石","桥","钟","雾","灯"];
  const NUMBER_SYMBOLS_EN = ["Star","Moon","Tide","Forest","Mirror","Flame","Feather","Stone","Bridge","Bell","Mist","Lantern"];
  const NUMBER_THEME = ["开始","沉淀","连接","生长","映照","热情","轻盈","稳固","过渡","节律","未知","微光"];
  const NUMBER_THEME_EN = ["Beginning","Stillness","Connection","Growth","Reflection","Passion","Lightness","Stability","Transition","Rhythm","Unknown","Glimmer"];
  const NUMBER_GLOSS = [
    "一点光，先于道路出现。", "未满之处，正是余地。", "来去有时，不必久留。", "向下扎根，向上分岔。",
    "你照见的，也在照见你。", "热度需要形状，才成火。", "轻一点，才飞得起来。", "慢，是它保存自己的方式。",
    "连接不是抵达，是愿意过去。", "一响之后，留白也是声音。", "看不清时，先看清脚下。", "光不必大，够照下一步就好。"
  ];
  const NUMBER_GLOSS_EN = [
    "A single light before the road appears.", "In what is not yet full lies room.", "The tide keeps its hour; nothing must stay.", "Root downward, branch upward.",
    "What you see is seeing you.", "Heat needs a shape to become fire.", "Be lighter, and you can rise.", "Slowness is how stone keeps itself.",
    "A bridge is not arrival but willingness to cross.", "After one strike, the silence is also sound.", "When the view blurs, see your feet first.", "The light need only reach the next step."
  ];
  function numSymbol(i) { return lang === "en" ? NUMBER_SYMBOLS_EN[i] : NUMBER_SYMBOLS[i]; }
  function numThemeStr(i) { return lang === "en" ? NUMBER_THEME_EN[i] : NUMBER_THEME[i]; }
  function numGlossStr(i) { return lang === "en" ? NUMBER_GLOSS_EN[i] : NUMBER_GLOSS[i]; }

  // 灵数徽记（生成图，缺失时回退到程序化曼陀罗）
  const NUM_IMG = [];
  function numImgReady(i) { const im = NUM_IMG[i]; return !!(im && im.complete && im.naturalWidth > 0); }
  function ensureNumImg(i) {
    if (i == null || i < 0 || NUM_IMG[i]) return;
    const im = new Image();
    im.onload = () => {
      if (!im.naturalWidth) return;
      if (numData && numResult) {
        const old = numResult.querySelector("canvas[data-mandala]");
        if (old) old.replaceWith(drawNumMandala(numData.raw, numData.symbolIdx));
        else renderNumberResult();
      }
      if (window.__reading && window.__reading.type === "number" && state.screen === "reading") refreshStage();
    };
    im.onerror = () => {};
    im.src = "assets/numerology/" + i + ".webp";
    NUM_IMG[i] = im;
  }

  /* 二十八宿：七曜配兽（角木蛟 … 轸水蚓）。c=宿名 e=五行 b=守护兽 img=意象 adv=建议 */
  const MANSION = [
    { c:"角", e:"木", b:"蛟", img:"苍龙昂首，春光初动。", adv:"适合开启一件拖延已久的事。", ce:"Jiao", ee:"Wood", be:"Flood Dragon", imge:"Azure dragon lifts its head; spring light first stirs.", adve:"A good day to start something long delayed." },
    { c:"亢", e:"金", b:"龙", img:"金龙蓄势，过犹不及。", adv:"收敛锋芒，别把话说满。", ce:"Kang", ee:"Metal", be:"Dragon", imge:"Golden dragon gathers force; too much overshoots.", adve:"Rein in your edge; don't overpromise." },
    { c:"氐", e:"土", b:"貉", img:"土厚载物，根基渐稳。", adv:"把基础打牢，慢即是快。", ce:"Di", ee:"Earth", be:"Badger", imge:"Deep earth bears all; the foundation steadies.", adve:"Build the base solid; slow is fast." },
    { c:"房", e:"日", b:"兔", img:"玉兔东升，家宅安宁。", adv:"多陪家人，或整理居所。", ce:"Fang", ee:"Sun", be:"Rabbit", imge:"Jade rabbit rises east; home is at peace.", adve:"Spend time with family, or tidy your space." },
    { c:"心", e:"月", b:"狐", img:"月下灵狐，直觉敏锐。", adv:"相信第一感觉，别过度分析。", ce:"Xin", ee:"Moon", be:"Fox", imge:"Spirit fox under the moon; intuition is sharp.", adve:"Trust the first feeling; don't over-analyze." },
    { c:"尾", e:"火", b:"虎", img:"火虎摆尾，势头正盛。", adv:"借势推进，但留三分余地。", ce:"Wei", ee:"Fire", be:"Tiger", imge:"Fire tiger swishes its tail; momentum is high.", adve:"Ride the momentum, but leave room." },
    { c:"箕", e:"水", b:"豹", img:"水豹乘风，口舌生财。", adv:"适合沟通、表达、洽谈。", ce:"Ji", ee:"Water", be:"Leopard", imge:"Water leopard rides the wind; words bring gain.", adve:"Good for communication, expression, negotiation." },
    { c:"斗", e:"木", b:"獬", img:"木獬持衡，是非自明。", adv:"遇到争执，交给时间裁断。", ce:"Dou", ee:"Wood", be:"Unicorn", imge:"Wood unicorn holds the scales; right and wrong show clearly.", adve:"In a dispute, let time judge." },
    { c:"牛", e:"金", b:"牛", img:"金牛踏实，稳步前行。", adv:"重复的事做好，便是积累。", ce:"Niu", ee:"Metal", be:"Ox", imge:"Metal ox is steady; move forward step by step.", adve:"Do the repeated things well; that is accumulation." },
    { c:"女", e:"土", b:"蝠", img:"土蝠低飞，暗中小心。", adv:"留意细碎疏漏与身边小人。", ce:"Nyu", ee:"Earth", be:"Bat", imge:"Earth bat flies low; beware the small print.", adve:"Watch for small oversights and petty people nearby." },
    { c:"虚", e:"日", b:"鼠", img:"日鼠穿隙，虚处藏机。", adv:"留白往往比填满更有用。", ce:"Xu", ee:"Sun", be:"Rat", imge:"Sun rat slips through gaps; opportunity hides in emptiness.", adve:"Negative space is often more useful than filling all." },
    { c:"危", e:"月", b:"燕", img:"月燕临危，谨慎过关。", adv:"高风险动作今天先缓一缓。", ce:"Wei", ee:"Moon", be:"Swallow", imge:"Moon swallow meets danger; pass with care.", adve:"Ease off high-risk moves today." },
    { c:"室", e:"火", b:"猪", img:"火猪归舍，安顿身心。", adv:"给生活一处可以停下的角落。", ce:"Shi", ee:"Fire", be:"Pig", imge:"Fire pig returns home; settle body and mind.", adve:"Give life a corner where you can stop." },
    { c:"壁", e:"水", b:"貐", img:"水貐守垣，屏障自成。", adv:"设一道边界，保护你的专注。", ce:"Bi", ee:"Water", be:"Wolf", imge:"Water wolf guards the wall; a boundary forms itself.", adve:"Set a boundary to protect your focus." },
    { c:"奎", e:"木", b:"狼", img:"木狼啸野，才思涌动。", adv:"适合写作、创作与发散。", ce:"Kui", ee:"Wood", be:"Wolf", imge:"Wood wolf howls in the wild; ideas surge.", adve:"Good for writing, creating, brainstorming." },
    { c:"娄", e:"金", b:"狗", img:"金狗司守，忠信可托。", adv:"兑现一个对别人的承诺。", ce:"Lou", ee:"Metal", be:"Dog", imge:"Metal dog stands guard; loyalty can be trusted.", adve:"Honor a promise you made to someone." },
    { c:"胃", e:"土", b:"雉", img:"土雉啄食，蓄养待时。", adv:"默默积累，不必急于显形。", ce:"Wei", ee:"Earth", be:"Pheasant", imge:"Earth pheasant pecks; nourish and wait for the time.", adve:"Accumulate quietly; no need to show yet." },
    { c:"昴", e:"日", b:"鸡", img:"日鸡报晓，群聚生辉。", adv:"团队里你的一句话就能提气。", ce:"Mao", ee:"Sun", be:"Rooster", imge:"Sun rooster announces dawn; gathering shines.", adve:"In a team, one word from you lifts the mood." },
    { c:"毕", e:"月", b:"乌", img:"月乌敛翼，网罗渐收。", adv:"收尾比开头更见功夫。", ce:"Bi", ee:"Moon", be:"Crow", imge:"Moon crow folds wings; the net draws in.", adve:"Finishing shows more skill than starting." },
    { c:"觜", e:"火", b:"猴", img:"火猴攀枝，机变灵动。", adv:"遇到卡点，换个角度试试。", ce:"Zi", ee:"Fire", be:"Monkey", imge:"Fire monkey climbs; quick and nimble.", adve:"Stuck? Try a different angle." },
    { c:"参", e:"水", b:"猿", img:"水猿饮涧，三才并济。", adv:"平衡几方关系，莫偏废。", ce:"Shen", ee:"Water", be:"Ape", imge:"Water ape drinks from the stream; three forces balanced.", adve:"Balance several relationships; neglect none." },
    { c:"井", e:"木", b:"犴", img:"木犴汲泉，润物无声。", adv:"用耐心滋养一件长期的事。", ce:"Jing", ee:"Wood", be:"Mongoose", imge:"Wood mongoose draws spring; nourishes without sound.", adve:"Nourish a long-term thing with patience." },
    { c:"鬼", e:"金", b:"羊", img:"金羊入庙，幽微可察。", adv:"留意那些被忽略的信号。", ce:"Gui", ee:"Metal", be:"Goat", imge:"Metal goat enters the shrine; subtleties are seen.", adve:"Notice the signals others miss." },
    { c:"柳", e:"土", b:"獐", img:"土獐栖柳，柔韧随形。", adv:"以柔克刚，顺势而为。", ce:"Liu", ee:"Earth", be:"Antelope", imge:"Earth antelope rests by willow; bend and follow form.", adve:"Use softness to overcome; go with the flow." },
    { c:"星", e:"日", b:"马", img:"日马驰原，声名渐显。", adv:"适合展示成果、主动亮相。", ce:"Xing", ee:"Sun", be:"Horse", imge:"Sun horse gallops the plain; fame grows.", adve:"Show your results; step forward." },
    { c:"张", e:"月", b:"鹿", img:"月鹿衔花，开合有度。", adv:"懂得展开，也懂得收束。", ce:"Zhang", ee:"Moon", be:"Deer", imge:"Moon deer carries flowers; open and close in measure.", adve:"Know when to unfold and when to gather." },
    { c:"翼", e:"火", b:"蛇", img:"火蛇展翼，远举高飞。", adv:"把目光放远，谋划下一步。", ce:"Yi", ee:"Fire", be:"Snake", imge:"Fire snake spreads wings; soar high and far.", adve:"Look further ahead; plan the next step." },
    { c:"轸", e:"水", b:"蚓", img:"水蚓缠心，周而复始。", adv:"复盘一段循环，便能新生。", ce:"Zhen", ee:"Water", be:"Earthworm", imge:"Water worm coils the heart; cycles repeat.", adve:"Review a cycle, and you are reborn." }
  ];
  function mansionFull(m) { return lang === "en" ? (m.ce + " · " + m.be + " (" + m.ee + ")") : (m.c + m.e + m.b); }
  function mansionImg(m) { return lang === "en" ? m.imge : m.img; }
  function mansionAdv(m) { return lang === "en" ? m.adve : m.adv; }
  // 二十八宿分四象：每七宿一象，顺序与 MANSION 一致
  const BEAST = [
    { code: "east", zh: "青龙", en: "Azure Dragon" },
    { code: "north", zh: "玄武", en: "Black Tortoise" },
    { code: "west", zh: "白虎", en: "White Tiger" },
    { code: "south", zh: "朱雀", en: "Vermilion Bird" }
  ];
  function mansionBeast(idx) { return BEAST[Math.floor(idx / 7)] || BEAST[0]; }

  /* 北欧符文（古弗萨克 24 符文）。n=名 z=中文 g=字形 m=含义 a=提示 */
  const RUNE = [
    { n:"Fehu", z:"费胡", g:"ᚠ", m:"火与丰盛", a:"行动带来收获，今天值得为想要的东西迈一步。", me:"Fire & abundance", ae:"Action brings reward; worth a step toward what you want today." },
    { n:"Uruz", z:"乌鲁", g:"ᚢ", m:"原始之力", a:"你的生命力比想象中强，先动起来。", me:"Primal strength", ae:"Your vitality is stronger than you think; start moving." },
    { n:"Thurisaz", z:"瑟里", g:"ᚦ", m:"荆棘与界", a:"前方有阻力，谨慎比强冲更明智。", me:"Thorn & boundary", ae:"Resistance ahead; caution beats forcing." },
    { n:"Ansuz", z:"安苏", g:"ᚨ", m:"神谕之声", a:"一句话或一条讯息会点醒你，认真听。", me:"Voice of the gods", ae:"A word or message will wake you; listen well." },
    { n:"Raidho", z:"雷多", g:"ᚱ", m:"旅程与序", a:"定下节奏，路会自己展开。", me:"Journey & order", ae:"Set the rhythm; the road unfolds." },
    { n:"Kenaz", z:"肯纳", g:"ᚲ", m:"火把之光", a:"灵感将至，抓住那一瞬的明亮。", me:"Torch-light", ae:"Inspiration comes; catch that bright instant." },
    { n:"Gebo", z:"盖波", g:"ᚷ", m:"礼物之环", a:"关系里有来有往，主动给出。", me:"Gift-ring", ae:"In relationships, give and take; offer first." },
    { n:"Wunjo", z:"温约", g:"ᚹ", m:"喜悦和谐", a:"今天适合与让你放松的人在一起。", me:"Joy & harmony", ae:"Good day to be with those who relax you." },
    { n:"Hagalaz", z:"哈格拉", g:"ᚺ", m:"冰雹突变", a:"旧结构会裂，裂处正是新生。", me:"Hail & disruption", ae:"Old structure cracks; the break is new birth." },
    { n:"Naudiz", z:"瑙迪", g:"ᚾ", m:"必要之需", a:"受限之中藏着转机，别急。", me:"Need & constraint", ae:"Within limits hides a turning point; be patient." },
    { n:"Isa", z:"伊萨", g:"ᛁ", m:"静水之冰", a:"停一停，内省比前进更有用。", me:"Ice & stillness", ae:"Pause; introspection beats pushing forward." },
    { n:"Jera", z:"耶拉", g:"ᛃ", m:"年轮收获", a:"种下的会因时结果，耐心等。", me:"Year-wheel harvest", ae:"What's sown ripens in time; wait." },
    { n:"Eihwaz", z:"艾瓦", g:"ᛇ", m:"紫杉之韧", a:"撑住，连接此岸与彼岸。", me:"Yew & resilience", ae:"Hold; it bridges this shore and the far." },
    { n:"Perthro", z:"佩斯", g:"ᛈ", m:"命运之杯", a:"未知里藏惊喜，别急着揭开。", me:"Fate-cup", ae:"Surprise hides in the unknown; don't rush to open." },
    { n:"Algiz", z:"阿尔吉", g:"ᛉ", m:"守护之角", a:"警觉是你的护盾，相信直觉。", me:"Guardian-horn", ae:"Alertness is your shield; trust instinct." },
    { n:"Sowilo", z:"索维洛", g:"ᛋ", m:"太阳胜利", a:"光明一面终会胜出，坚持。", me:"Sun & victory", ae:"The bright side wins; persist." },
    { n:"Tiwaz", z:"提瓦", g:"ᛏ", m:"战神正义", a:"为认为对的事挺身，勇气到位。", me:"Tyr & justice", ae:"Stand for what's right; courage is here." },
    { n:"Berkano", z:"贝卡诺", g:"ᛒ", m:"白桦新生", a:"有种子要发芽，照料它。", me:"Birch & new life", ae:"A seed sprouts; tend it." },
    { n:"Ehwaz", z:"埃瓦", g:"ᛖ", m:"骏马同行", a:"合作能让你走得更远。", me:"Horse & partnership", ae:"Cooperation carries you farther." },
    { n:"Mannaz", z:"曼纳兹", g:"ᛗ", m:"人本之镜", a:"在关系里照见自己。", me:"Man & mirror", ae:"See yourself in relation." },
    { n:"Laguz", z:"拉古兹", g:"ᛚ", m:"流水直觉", a:"跟随感觉的流向，别硬拦。", me:"Water & intuition", ae:"Follow feeling's current; don't dam it." },
    { n:"Ingwaz", z:"英格", g:"ᛜ", m:"丰饶内守", a:"先完成内在的整合，再向外。", me:"Ing & inner wealth", ae:"Integrate within first, then outward." },
    { n:"Dagaz", z:"达格兹", g:"ᛞ", m:"白昼破晓", a:"转折就在眼前，天亮了。", me:"Dawn & breakthrough", ae:"The turn is at hand; day breaks." },
    { n:"Othala", z:"奥萨拉", g:"ᛟ", m:"根源传承", a:"回望来处，你会更清楚去处。", me:"Heritage & roots", ae:"Look back to where you're from; clarity on where to go." }
  ];
  function runeM(rr) { return lang === "en" ? rr.me : rr.m; }
  function runeA(rr) { return lang === "en" ? rr.ae : rr.a; }
  function runeCard(rr) { return lang === "en" ? rr.n : (rr.n + " · " + rr.z); }

  /* 寺观灵签。no=签号 level=等级 poem=四句诗 sol=签解 */
  const ORACLE = [
    { no:1, level:"上上", poem:["云开见月明","东风送好音","所谋皆遂意","行处遇知音"], sol:"诸事顺遂，宜把握时机主动推进。", levele:"Supreme", poeme:["Clouds part, the moon shines clear","East wind brings good news","All you plan comes true","Where you go, kindred appear"], sole:"Everything goes smoothly; seize the moment to push forward." },
    { no:2, level:"上吉", poem:["庭前喜鹊喧","旧愿得重圆","莫嫌步子慢","稳处自生莲"], sol:"慢中求稳，自有回甘。", levele:"Auspicious", poeme:["Magpie chirps before the court","Old wish rounds again","Mind not the slow step","From steadiness, lotus grows"], sole:"Slow yet steady; sweetness comes." },
    { no:3, level:"中吉", poem:["半岭云初散","清溪石上流","耐心过此渡","前路渐悠悠"], sol:"过一关便宽，别慌。", levele:"Fairly good", poeme:["Mist clears on the mid-slope","Clear stream over the stones","Patience past this crossing","The road eases ahead"], sole:"Clear one gate and it widens; don't panic." },
    { no:4, level:"中平", poem:["月满还亏缺","花开有落时","随缘莫强求","心安即相宜"], sol:"平常心最好，顺其自然。", levele:"Neutral", poeme:["Moon full then wanes","Flowers have their falling","Let be, don't force","A calm mind suits"], sole:"An even mind is best; let nature take its course." },
    { no:5, level:"中平", poem:["舟行浅水滨","莫急莫生嗔","待潮来早晚","自可过重津"], sol:"等风来，时机未到不必硬闯。", levele:"Neutral", poeme:["Boat drifts the shallow shore","No rush, no anger","Wait for the tide's hour","Cross the ford at ease"], sole:"Wait for the wind; don't force before the time." },
    { no:6, level:"下下", poem:["雾重路难分","独行慎夜昏","莫向险处去","守拙保其身"], sol:"宜守不宜进，先求安稳。", levele:"Inauspicious", poeme:["Fog thick, roads unclear","Walk alone, wary of night","Go not to danger","Keep humble, keep safe"], sole:"Hold, don't advance; first seek safety." },
    { no:7, level:"上吉", poem:["宝镜拂尘埃","久暗今重开","旧识还相顾","喜从意外来"], sol:"旧缘回暖，故人旧事有转机。", levele:"Auspicious", poeme:["Bright mirror wipes the dust","Long dark reopens now","Old acquaintance returns","Joy comes unexpected"], sole:"Old ties warm; past people and things turn." },
    { no:8, level:"中吉", poem:["春园一树花","半开半藏芽","待风传远信","不必苦思家"], sol:"好消息将至，不必挂心。", levele:"Fairly good", poeme:["A tree of blossoms in spring","Half open, half budding","Wait wind for distant news","No need to pine at home"], sole:"Good news approaches; don't worry." },
    { no:9, level:"上上", poem:["鹏翼搏长风","一举上苍穹","声名从此起","四海尽相通"], sol:"可图远大，宜高调亮相。", levele:"Supreme", poeme:["Peng spreads on the long wind","One lift to the high vault","Fame rises from here","All quarters connect"], sole:"Aim high; a bold showing fits." },
    { no:10, level:"中平", poem:["棋局半边残","落子且从宽","莫贪一步胜","全局自安安"], sol:"顾全大局，别争一时。", levele:"Neutral", poeme:["Half a board remains","Play wide, not tight","Crave not one win","The whole stays calm"], sole:"Mind the big picture; don't fight one moment." },
    { no:11, level:"下下", poem:["灯残夜未央","心事两茫茫","且把愁肠解","莫教累寸肠"], sol:"先安己心，郁结宜疏不宜积。", levele:"Inauspicious", poeme:["Lamp low, night not done","Hearts dim and lost","Unknot the worried gut","Don't let it weigh the heart"], sole:"First settle yourself; gloom is better loosened than kept." },
    { no:12, level:"上吉", poem:["灵泉石上生","涤尽旧时腥","一身轻似叶","何处不逍停"], sol:"放下即轻，宜断舍离。", levele:"Auspicious", poeme:["Spirit spring on the stone","Washes the old stain","Light as a leaf again","Where not at ease?"], sole:"Let go and lighten; good to release." },
    { no:13, level:"中吉", poem:["禾苗待雨匀","莫怨陇头贫","秋来仓廪实","笑语慰辛勤"], sol:"勤有厚报，耐心耕耘。", levele:"Fairly good", poeme:["Seedlings wait for even rain","Blame not the poor ridge","Autumn fills the barn","Laughter rewards the toil"], sole:"Diligence repays; tend patiently." },
    { no:14, level:"上上", poem:["星河落掌中","所愿尽相通","但行光明事","福自与时丰"], sol:"心光所至皆宜，行善得助。", levele:"Supreme", poeme:["Star-river in your palm","All wishes align","Walk the bright deeds","Fortune grows with the time"], sole:"Where your light reaches, all fits; good done finds aid." }
  ];
  function oracleLevel(s) { return lang === "en" ? s.levele : s.level; }
  function oraclePoem(s) { return lang === "en" ? s.poeme : s.poem; }
  function oracleSol(s) { return lang === "en" ? s.sole : s.sol; }

  /* ============================================================
     程序化牌面 / 牌背（对应提示词 P5：CanvasTexture 思路的 2D 实现，绕开图片版权）
     ============================================================ */
  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  // 用户输入转义，防止注入到 innerHTML
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  let BACK_URL = "";
  function buildBackURL() {
    const W = 240, H = 366;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    drawCardBack(c.getContext("2d"), W, H);
    BACK_URL = c.toDataURL();
    return BACK_URL;
  }
  function drawCardBack(ctx, W, H) {
    const pal = {
      bg1: cssVar("--bg-1") || "#0B0E1A", bg0: cssVar("--bg-0") || "#05060B",
      accent: cssVar("--accent") || "#7C8CFF", accent2: cssVar("--accent-2") || "#A970FF"
    };
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.bg1); g.addColorStop(1, pal.bg0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    ctx.strokeStyle = pal.accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
    for (let r = 16; r < H * 0.34; r += 18) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * H * 0.4, cy + Math.sin(a) * H * 0.4); ctx.stroke();
    }
    ctx.globalAlpha = 0.9; ctx.fillStyle = pal.accent2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
    ctx.shadowColor = pal.accent2; ctx.shadowBlur = 22;
    ctx.fillRect(-24, -24, 48, 48); ctx.restore();
    ctx.globalAlpha = 1; ctx.strokeStyle = pal.accent; ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, W - 16, H - 16);
    ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.strokeRect(14, 14, W - 28, H - 28);
    ctx.globalAlpha = 1;
  }

  const ROMAN = ["O","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV",
    "XV","XVI","XVII","XVIII","XIX","XX","XXI"];
  function drawStar(ctx, cx, cy, R, points, r2) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rad = (i % 2 ? r2 : R);
      const a = i / (points * 2) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fill();
  }
  function drawEmblem(ctx, cx, cy, r, idx, pal) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(idx * 0.21);
    ctx.strokeStyle = pal.accent; ctx.fillStyle = pal.accent2; ctx.lineWidth = 2;
    const sides = 3 + (idx % 6), petals = 4 + (idx % 6);
    ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = i / sides * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r * 0.8, y = Math.sin(a) * r * 0.8;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 0.42;
    for (let i = 0; i < petals; i++) {
      const a = i / petals * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
    }
    ctx.globalAlpha = 0.95; ctx.fillStyle = pal.accent2;
    drawStar(ctx, 0, 0, r * 0.3, 5, r * 0.55);
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function drawCardFace(ctx, W, H, idx, name, rev) {
    const k = W / 240;
    if (tarotImgReady(idx)) {
      const im = TAROT_IMG[idx];
      const ir = im.width / im.height, cr = W / H;
      let sx, sy, sw, sh;
      if (ir > cr) { sh = im.height; sw = sh * cr; sx = (im.width - sw) / 2; sy = 0; }
      else { sw = im.width; sh = sw / cr; sx = 0; sy = (im.height - sh) / 2; }
      // 逆位只倒转画面，边框与牌名保持可读
      ctx.save();
      if (rev) { ctx.translate(W, H); ctx.rotate(Math.PI); }
      ctx.drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
      ctx.restore();
      ctx.strokeStyle = "rgba(124,140,255,0.9)"; ctx.lineWidth = 3 * k; ctx.strokeRect(8 * k, 8 * k, W - 16 * k, H - 16 * k);
      ctx.fillStyle = "rgba(5,6,11,0.55)"; ctx.fillRect(0, H - 42 * k, W, 42 * k);
      ctx.fillStyle = "#E8ECFF"; ctx.textAlign = "center";
      ctx.font = "500 " + (20 * k) + "px Georgia, 'Noto Serif SC', serif"; ctx.fillText(name, W / 2, H - 14 * k);
      return;
    }
    const pal = {
      bg1: cssVar("--bg-1") || "#0B0E1A", bg0: cssVar("--bg-0") || "#05060B",
      t1: cssVar("--text-1") || "#E8ECFF", accent: cssVar("--accent") || "#7C8CFF",
      accent2: cssVar("--accent-2") || "#A970FF"
    };
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.bg1); g.addColorStop(1, pal.bg0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 3 * k; ctx.strokeRect(8 * k, 8 * k, W - 16 * k, H - 16 * k);
    ctx.globalAlpha = 0.5; ctx.lineWidth = 1 * k; ctx.strokeRect(14 * k, 14 * k, W - 28 * k, H - 28 * k); ctx.globalAlpha = 1;
    ctx.fillStyle = pal.t1; ctx.textAlign = "center";
    ctx.font = "500 " + (16 * k) + "px Georgia, serif"; ctx.fillText(ROMAN[idx] || String(idx), W / 2, 34 * k);
    if (rev) {
      ctx.save(); ctx.translate(W / 2, H / 2 - 4 * k); ctx.rotate(Math.PI);
      drawEmblem(ctx, 0, 0, Math.min(W, H) * 0.3, idx, pal);
      ctx.restore();
    } else {
      drawEmblem(ctx, W / 2, H / 2 - 4 * k, Math.min(W, H) * 0.3, idx, pal);
    }
    ctx.fillStyle = pal.t1; ctx.font = "500 " + (20 * k) + "px Georgia, 'Noto Serif SC', serif";
    ctx.fillText(name, W / 2, H - 22 * k);
  }
  // 主题切换时重绘所有牌：牌背 + 已翻开的牌面
  function recolorCards() {
    buildBackURL();
    document.querySelectorAll(".mini").forEach(el => {
      el.style.backgroundImage = "url(" + BACK_URL + ")"; el.style.backgroundSize = "cover";
    });
    document.querySelectorAll(".tarot-card .back").forEach(el => {
      el.style.backgroundImage = "url(" + BACK_URL + ")"; el.style.backgroundSize = "cover";
    });
    document.querySelectorAll(".tarot-card .face canvas").forEach(cv => {
      drawCardFace(cv.getContext("2d"), cv.width, cv.height, +cv.dataset.idx, cv.dataset.name);
    });
    // 环形星盘牌面随主题重绘
    drawDialCards();
    // 符文石随主题重绘
    document.querySelectorAll(".rune-stone").forEach(cv => {
      paintRuneStone(cv.getContext("2d"), +cv.dataset.idx);
    });
    // 二十八宿星野随主题重绘
    if (document.getElementById("mansionSky")) drawMansionSky();
    // 六爻法阵 / 灵数曼陀罗随主题重绘
    if (typeof window.__redrawDivination === "function") window.__redrawDivination();
    // 解读页结果台随主题重绘
    if (window.__reading) {
      const st = document.getElementById("readingStage");
      if (st && st.children.length) renderStage(window.__reading.type, window.__reading.data);
    }
  }

  /* ============================================================
     议题识别（关键词匹配，无需模型）
     ============================================================ */
  const TOPIC_KEY = { love:"tLove", career:"tCareer", health:"tHealth", choice:"tChoice", relationship:"tRelation", other:"tOther" };
  function topicLabel(topic) { return t(TOPIC_KEY[topic] || "tOther"); }
  function detectTopic(q) {
    if (!q) return "other";
    const map = [
      { key:"love", words:["爱","恋","感情","喜欢","暗恋","桃花","对象","另一半","分手","复合","婚姻","表白","异地","暧昧","在一起"] },
      { key:"career", words:["工作","事业","职业","求职","面试","跳槽","升职","加薪","创业","公司","老板","同事","offer","项目","考公","考研","前程"] },
      { key:"health", words:["健康","身体","病","医院","睡眠","焦虑","压力","情绪","抑郁","养生","精神","心理","疲惫"] },
      { key:"choice", words:["选择","抉择","怎么选","要不要","该不该","决定","去哪","选哪个","选哪","哪条","哪一条","该选","两条路","取舍","犹豫","纠结","二选","两难","怎么办"] },
      { key:"relationship", words:["朋友","家人","父母","关系","矛盾","误会","和解","人际","室友","团队","同事"] }
    ];
    for (let i = 0; i < map.length; i++) if (map[i].words.some(w => q.indexOf(w) >= 0)) return map[i].key;
    return "other";
  }
  function topicTail(topic) {
    const map = { love:"tailLove", career:"tailCareer", health:"tailHealth", choice:"tailChoice", relationship:"tailRelation", other:"tailOther" };
    return t(map[topic] || "tailOther");
  }
  // 读取某模块屏里的提问框，并顺带识别议题
  function readQuestion(type) {
    const el = document.querySelector('[data-screen="' + type + '"] .ask-input');
    const q = el && el.value ? el.value.trim() : "";
    return { question: q, topic: detectTopic(q) };
  }

  /* ============================================================
     示例解读生成（mock）—— 接真实模型时整段替换
     ============================================================ */
  function mockReading(type, data) {
    let r;
    if (type === "tarot") {
      const readings = data.cards.map((c, i) => {
        const nm = tarotName(c.idx), kw = tarotKw(c.idx), pos = posName(i);
        const rev = c.orient === "逆";
        return {
          position: pos,
          card: nm + (rev ? (lang === "en" ? " (Rev)" : "（逆）") : ""),
          text: rev ? t("tarotRev", [nm, pos, kw]) : t("tarotUp", [nm, pos, kw])
        };
      });
      r = {
        tone: t("tarotTone"),
        readings,
        synthesis: t("tarotSynth"),
        actions: [t("tarotAct1"), t("tarotAct2"), t("tarotAct3")],
        closing: t("tarotClose")
      };
    }
    else if (type === "gua") {
      const baseName = guaFullName(data.guaIndex - 1);
      const changeName = guaFullName(data.changeIdx);
      r = {
        tone: t("guaTone", [baseName]),
        readings: [
          { position: t("lblBaseHex"), card: baseName, text: t("guaBase", [baseName, data.guaIndex]) },
          { position: t("lblChangeHex"), card: changeName, text: t("guaChange", [changeName]) }
        ],
        synthesis: t("guaSynth"),
        actions: [t("guaAct1"), t("guaAct2"), t("guaAct3")],
        closing: t("guaClose")
      };
    }
    // 二十八宿
    else if (type === "mansion") {
      const m = MANSION[data.idx];
      const full = mansionFull(m);
      r = {
        tone: t("manTone", [full]),
        readings: [
          { position: t("lblStar"), card: full, text: t("manStarText", [full, mansionImg(m), mansionAdv(m)]) },
          { position: t("manGuardCard", [m.be]), card: t("manGuardCard", [m.be]), text: t("manGuardText", [m.be, mansionAdv(m)]) }
        ],
        synthesis: t("manSynth"),
        actions: [t("manAct1"), t("manAct2"), t("manAct3")],
        closing: t("manClose")
      };
    }
    // 北欧符文
    else if (type === "rune") {
      const join = lang === "en" ? ". " : "。";
      const stripEnd = s => String(s).replace(/[.。]$/, "");
      const readings = data.runes.map((ri, i) => {
        const rr = RUNE[ri];
        return {
          position: (lang === "en" ? "Rune " : "符文 ") + (i + 1),
          card: runeCard(rr),
          text: stripEnd(runeM(rr)) + join + stripEnd(runeA(rr)) + join + t("runePos" + (i + 1))
        };
      });
      r = {
        tone: t("runeTone"),
        readings,
        synthesis: t("runeSynth"),
        actions: [t("runeAct1"), t("runeAct2"), t("runeAct3")],
        closing: t("runeClose")
      };
    }
    // 寺观灵签
    else if (type === "oracle") {
      const s = ORACLE[data.sign];
      const poem = oraclePoem(s).join(lang === "en" ? ", " : "，") + (lang === "en" ? "." : "。");
      const lotCard = lang === "en" ? "Lot " + s.no : "第" + s.no + "签";
      r = {
        tone: t("oracleTone", [oracleLevel(s), s.no]),
        readings: [
          { position: t("lblVerse"), card: lotCard, text: t("oracleVerse", [poem]) },
          { position: t("oracleSolCard"), card: oracleLevel(s), text: t("oracleGuide", [oracleLevel(s), oracleSol(s)]) }
        ],
        synthesis: t("oracleSynth"),
        actions: [t("oracleAct1"), t("oracleAct2"), t("oracleAct3")],
        closing: t("oracleClose")
      };
    }
    // number
    else {
      const raw = String(data.raw);
      const symbol = numSymbol(data.symbolIdx), theme = numThemeStr(data.themeIdx);
      const sum = raw.split("").reduce((a, b) => a + Number(b || 0), 0);
      const gloss = numGlossStr(data.symbolIdx);
      r = {
        tone: t("numTone", [raw, symbol]),
        readings: [
          { position: t("lblNum"), card: raw, text: t("numText", [raw, sum, data.symbolIdx + 1, theme, gloss]) },
          { position: t("lblNumSymbol"), card: symbol, text: t("numSymbolText", [symbol, theme]) },
          { position: t("lblNumNow"), card: theme, text: t("numNowText", [theme]) }
        ],
        synthesis: t("numSynth"),
        actions: [t("numAct1"), t("numAct2"), t("numAct3")],
        closing: t("numClose")
      };
    }

    // 议题识别 + 提问回响：把用户的问题轻柔地接进综合段
    if (data && data.question) {
      r.question = data.question;
      r.questionTopic = topicLabel(data.topic);
      const tail = topicTail(data.topic);
      if (tail) r.synthesis = r.synthesis + (lang === "en" ? " " : " ") + tail;
    }
    return r;
  }

  /* ============================================================
     解读页 · 结果视觉台（把抽到的东西留在眼前，而不是只剩文字）
     ============================================================ */
  const readingStage = document.getElementById("readingStage");
  const STAGE_KEY = { tarot: "stageTarot", gua: "stageGua", number: "stageNumber", mansion: "stageMansion", rune: "stageRune", oracle: "stageOracle" };
  function stageDiv(cls) { const d = document.createElement("div"); d.className = cls; return d; }
  function stageCap(text) { const d = stageDiv("stage-cap"); d.textContent = text; return d; }
  function stageTri(tri, label) {
    const cell = stageDiv("stage-tri");
    const em = document.createElement("img");
    em.className = "stage-tri-emblem";
    em.src = "assets/gua/" + tri.code + ".webp";
    em.alt = "";
    const lb = stageDiv("stage-tri-label"); lb.textContent = t(label);
    const nm = stageDiv("stage-tri-name"); nm.textContent = lang === "en" ? tri.en : tri.zh;
    cell.appendChild(em); cell.appendChild(lb); cell.appendChild(nm);
    return cell;
  }

  function drawMansionStage(idx) {
    const S = 320;
    const k = S / 240;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cv = document.createElement("canvas");
    cv.width = S * dpr; cv.height = S * dpr;
    cv.style.width = S + "px"; cv.style.height = S + "px";
    const ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    const cx = S / 2, cy = S / 2;
    const accent = cssVar("--accent") || "#7C8CFF";
    const accent2 = cssVar("--accent-2") || "#A970FF";
    ctx.strokeStyle = "rgba(" + (cssVar("--accent-rgb") || "124,140,255") + ",0.22)";
    ctx.lineWidth = 1;
    [104, 86, 52].forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, Math.PI * 2); ctx.stroke(); });
    for (let i = 0; i < MANSION_COUNT; i++) {
      const a = -Math.PI / 2 + i / MANSION_COUNT * Math.PI * 2;
      const x = cx + Math.cos(a) * 104 * k, y = cy + Math.sin(a) * 104 * k;
      ctx.beginPath(); ctx.arc(x, y, (i === idx ? 5 : 1.8) * k, 0, Math.PI * 2);
      ctx.fillStyle = i === idx ? accent2 : accent;
      ctx.globalAlpha = i === idx ? 1 : 0.5;
      if (i === idx) { ctx.shadowColor = accent2; ctx.shadowBlur = 18 * k; }
      ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    const a = -Math.PI / 2 + idx / MANSION_COUNT * Math.PI * 2;
    ctx.strokeStyle = accent2; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 100 * k, cy + Math.sin(a) * 100 * k); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = cssVar("--text-1") || "#E8ECFF";
    ctx.font = "500 " + Math.round(46 * k) + "px Georgia, 'Noto Serif SC', serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(MANSION[idx][lang === "en" ? "ce" : "c"], cx, cy + 2);
    return cv;
  }

  function renderStage(type, data) {
    if (!readingStage || !data) return;
    readingStage.innerHTML = "";
    readingStage.dataset.type = type;
    if (readingRail) readingRail.dataset.type = type;
    const label = stageDiv("stage-label");
    label.textContent = t(STAGE_KEY[type] || "stageTarot");
    readingStage.appendChild(label);
    let body = null;

    if (type === "tarot" && Array.isArray(data.cards)) {
      body = stageDiv("stage-cards");
      data.cards.forEach((c, i) => {
        const cell = stageDiv("stage-card" + (c.orient === "逆" ? " rev" : ""));
        cell.style.animationDelay = (i * 0.1) + "s";
        const cv = document.createElement("canvas");
        cv.width = 240; cv.height = 366;
        cv.dataset.idx = c.idx; cv.dataset.name = tarotName(c.idx);
        cv.dataset.rev = c.orient === "逆" ? "1" : "";
        drawCardFace(cv.getContext("2d"), 240, 366, c.idx, tarotName(c.idx), c.orient === "逆");
        cell.appendChild(cv);
        const pos = stageDiv("st-pos");
        pos.textContent = posName(i) + (c.orient === "逆" ? (lang === "en" ? " · Rev" : " · 逆") : "");
        cell.appendChild(pos);
        body.appendChild(cell);
      });
      const cap = stageCap(data.cards.map(c => tarotName(c.idx)).join(" · "));
      body.appendChild(cap);
    } else if (type === "gua") {
      body = stageDiv("stage-gua");
      const disc = stageDiv("stage-gua-disc");
      const bg = document.createElement("img");
      bg.className = "gua-disc-bg";
      bg.src = "assets/gua/altar.webp";
      bg.alt = "";
      disc.appendChild(bg);
      const binary = (data.lines && data.lines.length === 6) ? guaIndices(data.lines).base : 0;
      const row = stageDiv("stage-gua-row");
      row.appendChild(stageTri(TRI[(binary >> 3) & 7], "triUpper"));
      const hex = stageDiv("stage-hex");
      (data.lines || []).forEach(v => {
        const yang = (v === 7 || v === 9), old = (v === 6 || v === 9);
        const y = stageDiv("yao" + (yang ? "" : " yin") + (old ? " old" : ""));
        if (old) { const tag = document.createElement("span"); tag.className = "tag"; tag.textContent = v === 6 ? "×" : "○"; y.appendChild(tag); }
        settleYao(y);
        hex.appendChild(y);
      });
      row.appendChild(hex);
      row.appendChild(stageTri(TRI[binary & 7], "triLower"));
      disc.appendChild(row);
      body.appendChild(disc);
      body.appendChild(stageCap(guaFullName(data.guaIndex - 1) + (data.changeIdx != null ? "  →  " + guaFullName(data.changeIdx) : "")));
    } else if (type === "number") {
      body = stageDiv("stage-number");
      ensureNumImg(data.symbolIdx);
      const mandala = drawNumMandala(String(data.raw), data.symbolIdx);
      mandala.style.width = "min(280px, 66vw)"; mandala.style.height = "min(280px, 66vw)";
      body.appendChild(mandala);
      body.appendChild(stageCap(data.raw + "  →  " + numSymbol(data.symbolIdx) + " · " + numThemeStr(data.themeIdx)));
    } else if (type === "mansion") {
      body = stageDiv("stage-mansion");
      const disc = stageDiv("stage-mansion-disc");
      const beast = document.createElement("img");
      beast.className = "mansion-beast-bg";
      beast.src = "assets/mansion/" + mansionBeast(data.idx).code + ".webp";
      beast.alt = "";
      disc.appendChild(beast);
      const wheel = drawMansionStage(data.idx);
      wheel.classList.add("mansion-wheel");
      disc.appendChild(wheel);
      body.appendChild(disc);
      const beastName = lang === "en" ? mansionBeast(data.idx).en : mansionBeast(data.idx).zh;
      body.appendChild(stageCap(mansionFull(MANSION[data.idx]) + " · " + beastName));
    } else if (type === "rune" && Array.isArray(data.runes)) {
      body = stageDiv("stage-runes");
      ensureRuneTextures();
      data.runes.forEach((ri, i) => {
        const cell = stageDiv("stage-rune");
        cell.style.animationDelay = (i * 0.1) + "s";
        const cv = drawRuneStone(ri);
        cv.style.width = "110px"; cv.style.height = "161px";
        cell.appendChild(cv);
        const nm = stageDiv("st-pos");
        nm.textContent = posName(i);
        cell.appendChild(nm);
        body.appendChild(cell);
      });
      body.appendChild(stageCap(data.runes.map(ri => runeCard(RUNE[ri])).join(" · ")));
    } else if (type === "oracle") {
      const s = ORACLE[data.sign];
      body = stageDiv("stage-oracle");
      const slip = stageDiv("oracle-slip");
      const seal = stageDiv("slip-seal"); seal.textContent = "签";
      slip.appendChild(seal);
      const no = stageDiv("lot-no"); no.textContent = s.no;
      const lv = stageDiv("lot-level"); lv.textContent = oracleLevel(s);
      slip.appendChild(no); slip.appendChild(lv);
      oraclePoem(s).forEach(line => { const p = stageDiv("lot-line"); p.textContent = line; slip.appendChild(p); });
      body.appendChild(slip);
    }

    if (body) readingStage.appendChild(body);
    readingStage.classList.remove("stage-in", "stage-settled");
    void readingStage.offsetWidth;
    readingStage.classList.add("stage-in");
    setTimeout(() => readingStage.classList.add("stage-settled"), 1500);
  }
  function refreshStage() {
    const cr = window.__reading;
    if (cr && state.screen === "reading") renderStage(cr.type, cr.data);
  }

  /* ============================================================
     渲染解读
     ============================================================ */
  const readingBody = document.getElementById("readingBody");
  const vortex = document.getElementById("vortex");
  const readingTitle = document.getElementById("readingTitle");
  const readingRail = document.getElementById("readingRail");
  const readingRailQ = document.getElementById("readingRailQ");
  const readingRailQTag = document.getElementById("readingRailQTag");
  const readingRailQText = document.getElementById("readingRailQText");
  const readingOutline = document.getElementById("readingOutline");
  const readingTools = document.getElementById("readingTools");
  const readingSpeak = document.getElementById("readingSpeak");
  const readingExport = document.getElementById("readingExport");
  const readingExit = document.getElementById("readingExit");
  const revealSkip = document.getElementById("revealSkip");
  const readingLoading = document.getElementById("readingLoading");
  const rlStatus = document.getElementById("rlStatus");
  const rlDesc = document.getElementById("rlDesc");
  const rlElapsed = document.getElementById("rlElapsed");
  const rlFill = document.getElementById("rlFill");
  const rlTrack = document.getElementById("rlTrack");
  const rlSteps = readingLoading ? Array.from(readingLoading.querySelectorAll(".rl-steps li")) : [];
  let currentReading = null;        // { type, data, r } —— 供朗读 / 导出复用
  let pendingReading = null;        // 正在请求的解读，语言切换时据此重发
  let currentReadingText = "";      // 纯文本，供语音朗读
  let revealTimers = [];
  let revealActive = false;
  let loadTimer = null, loadToken = 0, loadStarted = 0, loadType = null, loadFinished = false;
  let loreTimer = null, loreIdx = 0;
  const rlRitual = document.getElementById("rlRitual");
  const rlCosmos = document.getElementById("rlCosmos");
  const rlDrawBtn = document.getElementById("rlDraw");
  let loadData = null, loadP = 6, ritualItems = [], ritualWinEls = [], ritualTube = null;
  const LOAD_DESC = { tarot: "ldTarot", gua: "ldGua", number: "ldNumber", mansion: "ldMansion", rune: "ldRune", oracle: "ldOracle" };
  // 等待期的星象冷知识：轮播展示，点卡片或「换一条星语」可切换；带 mod 的优先匹配当前模块
  const LORE = [
    { mod: "mansion", zh: "二十八宿轮流值日，今晚当值的星官，正替你把这一卦看完。", en: "The twenty-eight mansions take turns on duty — tonight's star officer is reading this cast with you." },
    { mod: "gua", zh: "古人把六爻藏在阴阳之变里：三枚铜钱落地，是一次与他们的问答。", en: "The six lines hide in yin and yang: three coins landing is one question asked across centuries." },
    { mod: "tarot", zh: "塔罗大阿卡纳共二十二张，对应生命之树上的二十二条路径。", en: "The twenty-two Major Arcana mirror the twenty-two paths on the Tree of Life." },
    { mod: "rune", zh: "如尼文字最初不是用来占卜，而是用来刻写：每一道笔画既是字母，也是低语。", en: "Runes were first carved, not cast: every stroke is a letter and a whisper at once." },
    { mod: "number", zh: "灵数相信数字是宇宙的节奏；你报出的数字，就是此刻的拍点。", en: "Numerology hears numbers as the universe's rhythm — yours is the beat of this very moment." },
    { mod: "oracle", zh: "寺观灵签借神明之口说话，解签的人再把话还给你的生活。", en: "Temple slips borrow a divine voice; the reader hands the words back to your life." },
    { zh: "星光走了很多年才落到你眼里；你要等的答案，也在路上了。", en: "Starlight travelled years to reach your eyes — the answer you await is also on its way." },
    { mod: "tarot", zh: "牌面逆位不是凶兆：它只是提醒能量转向内在，等着被看见。", en: "A reversed card is not a bad omen: energy turned inward, waiting to be seen." },
    { mod: "mansion", zh: "苍龙、白虎、朱雀、玄武不是四只兽，而是四季星空轮转的四组星群。", en: "The four beasts are not animals but the star groups of the four seasons turning overhead." },
    { zh: "给问题留一点空白，解读往往就藏在空白里。", en: "Leave a little blank in your question — the reading often hides in that blank." },
    { mod: "tarot", zh: "洗牌时牌会记住你的手温：三张牌不是预言，而是三个时间点。", en: "Cards remember the warmth of your hands: three cards are not prophecy but three points in time." },
    { mod: "gua", zh: "六爻自下而上生长，最下面那一爻，是这件事刚发芽时的样子。", en: "The six lines grow upward — the bottom one is what this matter looked like when it first sprouted." },
    { mod: "number", zh: "把一串数字反复相加到只剩一位，灵数叫它「根数」，是事情的底色。", en: "Add a number's digits down to one and numerology calls it the root — the undertone of the matter." },
    { mod: "mansion", zh: "月亮每晚借宿一宿，二十八天正好走完一整圈天赤道。", en: "The moon lodges in one mansion each night, completing the celestial equator in twenty-eight days." },
    { mod: "rune", zh: "符石落地时朝上的一面才算数；北欧人相信，是命运挑了那一面。", en: "Only the face-up side counts when stones land; the Norse believed fate chose that face." },
    { mod: "oracle", zh: "签筒里上百支签，只有一支会跳出来——古人说，那是神明伸手。", en: "Of a hundred slips in the tube only one leaps out — the old readers called that a divine hand." },
    { zh: "等待本身也是仪式的一部分：古人起卦前要斋戒三日，你只需要三十秒。", en: "Waiting is part of the rite: the ancients fasted three days before a cast — you only need thirty seconds." },
    { zh: "同一个人两次问同一件事，卦象往往不同：变的不是天，是心境。", en: "Ask the same question twice and the signs differ: it is not the sky that changed, but the mind." }
  ];
  const LORE_GEN = LORE.filter(x => !x.mod);
  const LORE_MOD = {};
  LORE.forEach(x => { if (x.mod) (LORE_MOD[x.mod] = LORE_MOD[x.mod] || []).push(x); });
  function lorePick(first) {
    const mod = LORE_MOD[loadType] || [];
    const pool = (mod.length && (first || Math.random() < 0.62)) ? mod : LORE_GEN;
    let i = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && pool[i] === LORE[loreIdx]) i = (i + 1) % pool.length;
    return LORE.indexOf(pool[i]);
  }
  function paintLore(next) {
    const node = document.getElementById("rlLore");
    if (!node) return;
    if (next) loreIdx = lorePick();
    const line = LORE[loreIdx][lang === "en" ? "en" : "zh"];
    node.classList.add("fade");
    setTimeout(() => { node.textContent = "✦ " + line; node.classList.remove("fade"); }, 260);
  }

  function loadElapsed() { return Math.max(0, Math.round((Date.now() - loadStarted) / 1000)); }

  function paintLoadSteps(active, done) {
    rlSteps.forEach((el, i) => {
      el.classList.toggle("done", done || i < active);
      el.classList.toggle("active", !done && i === active);
    });
  }

  /* 等待期「取象成形」：把刚取到的卦象在卡内逐步点亮，让进度条有画面可看 */
  function mkEl(tag, cls, txt) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  function buildRitual(type, data) {
    if (!rlRitual) return;
    const kind = type || "tarot";
    const d = data || {};
    ritualItems = []; ritualWinEls = []; ritualTube = null;
    rlRitual.innerHTML = "";
    rlRitual.dataset.ritual = kind;

    if (kind === "gua") {
      (Array.isArray(d.lines) ? d.lines : []).slice(0, 6).forEach(v => {
        const yang = v === 7 || v === 9, old = v === 6 || v === 9;
        const n = mkEl("div", "rr rr-yao " + (yang ? "yang" : "yin") + (old ? " old" : ""));
        n.appendChild(mkEl("i"));
        if (!yang) n.appendChild(mkEl("i"));
        rlRitual.appendChild(n); ritualItems.push(n);
      });
    } else if (kind === "number") {
      String(d.raw == null ? "" : d.raw).replace(/\D+/g, "").slice(0, 8).split("").forEach((ch, i) => {
        const n = mkEl("span", "rr rr-digit", ch);
        n.style.animationDelay = (i * 0.34).toFixed(2) + "s";
        rlRitual.appendChild(n); ritualItems.push(n);
      });
      if (ritualItems.length) {
        const eq = mkEl("span", "rr rr-eq", "⇒");
        rlRitual.appendChild(eq); ritualItems.push(eq);
      }
      const core = mkEl("span", "rr rr-digit core", d.symbolIdx != null ? String(d.symbolIdx) : "·");
      rlRitual.appendChild(core); ritualItems.push(core);
      ritualWinEls = [core];
    } else if (kind === "mansion") {
      const total = 28, idx = Math.max(0, Math.min(total - 1, d.idx | 0));
      const sky = mkEl("div", "rr-sky");
      const stars = [];
      for (let i = 0; i < total; i++) {
        const s = mkEl("span", "rr-star");
        s.style.setProperty("--a", (i * 360 / total).toFixed(2) + "deg");
        sky.appendChild(s); stars.push(s);
      }
      rlRitual.appendChild(sky);
      // 值宿自本宿的下一宿起绕环一周，最后停回本宿，扫过的星都留一点亮
      for (let k = 1; k <= total; k++) ritualItems.push(stars[(idx + k) % total]);
      ritualWinEls = [stars[idx]];
      const m = MANSION[idx];
      if (m) {
        const mc = mkEl("b", "rr-mc", lang === "en" ? m.ce : m.c);
        rlRitual.appendChild(mc); ritualItems.push(mc);
      }
    } else if (kind === "rune") {
      const rots = [-7, 5, -3];
      (Array.isArray(d.runes) ? d.runes : []).slice(0, 3).forEach((ri, i) => {
        const r = RUNE[ri];
        const n = mkEl("span", "rr rr-stone", r && r.g ? r.g : "ᚱ");
        n.style.setProperty("--rot", rots[i % 3] + "deg");
        rlRitual.appendChild(n); ritualItems.push(n);
      });
    } else if (kind === "oracle") {
      const xs = [13, 32, 51, 68, 86], rises = [-3, -9, -16, -24, -33];
      const tube = mkEl("div", "rr-tube");
      xs.forEach((x, i) => {
        const s = mkEl("span", "rr-stick");
        s.style.setProperty("--x", x + "%");
        s.style.setProperty("--rise", rises[i] + "px");
        tube.appendChild(s); ritualItems.push(s);
      });
      rlRitual.appendChild(tube);
      ritualTube = tube;
      const s = ORACLE[d.sign];
      const sign = mkEl("span", "rr-sign", s ? t("rlSign", [s.no, oracleLevel(s)]) : "");
      rlRitual.appendChild(sign); ritualItems.push(sign);
      ritualWinEls = [ritualItems[ritualItems.length - 2], sign];
    } else {
      (Array.isArray(d.cards) ? d.cards : []).slice(0, 3).forEach(c => {
        const rev = c && (c.orient === "rev" || c.orient === 1);
        const n = mkEl("span", "rr rr-card" + (rev ? " rev" : ""), "✦");
        rlRitual.appendChild(n); ritualItems.push(n);
      });
    }
  }

  function ritualStep(val, done) {
    const n = ritualItems.length;
    if (!n) return;
    const k = done ? n : Math.max(0, Math.min(n, Math.round(((val - 6) / 84) * n)));
    for (let i = 0; i < n; i++) ritualItems[i].classList.toggle("on", i < k);
    ritualWinEls.forEach(e => { if (e) e.classList.toggle("win", k >= n); });
    if (ritualTube) ritualTube.classList.toggle("calm", k >= n - 1);
  }

  function setLoadProgress(p, done) {
    const val = Math.max(0, Math.min(100, p));
    loadP = val;
    if (rlFill) rlFill.style.width = val.toFixed(1) + "%";
    if (rlTrack) rlTrack.setAttribute("aria-valuenow", String(Math.round(val)));
    paintLoadSteps(done ? 0 : val < 30 ? 0 : val < 58 ? 1 : val < 84 ? 2 : 3, done);
    ritualStep(val, done);
  }

  // 把等待换算成宇宙尺度：光走了多远、地球飞了多远、心跳了几次
  function paintCosmos() {
    if (!rlCosmos) return;
    const s = loadElapsed();
    const light = s * 299792, earth = Math.round(s * 29.8), beats = Math.round(s * 1.17);
    const args = lang === "en"
      ? [s, Math.round(light).toLocaleString("en-US"), earth.toLocaleString("en-US"), beats]
      : [s, (light / 10000).toFixed(1), earth.toLocaleString("zh-CN"), beats];
    rlCosmos.textContent = t("rlCosmos", args);
  }

  function paintStatus() {
    if (!rlStatus) return;
    if (loadFinished) { rlStatus.textContent = t("rlReady"); return; }
    const s = loadElapsed();
    rlStatus.textContent = t(s > 34 ? "rlWorking4" : s > 19 ? "rlWorking3" : s > 7 ? "rlWorking2" : "rlWorking");
  }

  function updateLoadElapsed() {
    if (rlElapsed) rlElapsed.textContent = t("rlElapsed", [loadElapsed()]);
    paintCosmos();
    paintStatus();
  }

  function startReadingLoading(type, data) {
    if (!readingLoading) return;
    loadToken++;
    loadType = type;
    loadData = data || {};
    loadStarted = Date.now();
    loadFinished = false;
    clearInterval(loadTimer);
    readingLoading.hidden = false;
    if (vortex) vortex.classList.add("hide");
    if (rlDesc) rlDesc.textContent = t(LOAD_DESC[type] || "ldTarot");
    paintStatus();
    buildRitual(type, loadData);
    setLoadProgress(6, false);
    updateLoadElapsed();
    loreIdx = lorePick(true);
    paintLore(false);
    clearInterval(loreTimer);
    loreTimer = setInterval(() => paintLore(true), 5200);
    loadTimer = setInterval(() => {
      if (loadFinished) { clearInterval(loadTimer); loadTimer = null; return; }
      const p = 6 + 88 * (1 - Math.exp(-(Date.now() - loadStarted) / 1800));
      setLoadProgress(Math.min(p, 94), false);
      updateLoadElapsed();
    }, 300);
  }

  function finishReadingLoading(token) {
    return new Promise(resolve => {
      if (token !== loadToken || !readingLoading || readingLoading.hidden) { resolve(); return; }
      // 真实接口可能毫秒级返回，给「取象」留出可读的最短时长，避免一闪而过
      const wait = reduced ? 0 : Math.max(0, 3400 - (Date.now() - loadStarted));
      const ready = () => {
        if (token !== loadToken) { resolve(); return; }
        loadFinished = true;
        clearInterval(loadTimer); loadTimer = null;
        clearInterval(loreTimer); loreTimer = null;
        setLoadProgress(100, true);
        paintStatus();
        updateLoadElapsed();
        setTimeout(() => {
          if (token === loadToken) readingLoading.hidden = true;
          resolve();
        }, reduced ? 0 : 900);
      };
      if (wait) setTimeout(ready, wait); else ready();
    });
  }
  // 等待卡可点：换一条星语 + 星尘涟漪，让等待有事可做
  function swapLore(e) {
    if (e) e.stopPropagation();
    paintLore(true);
    if (window.__particles) window.__particles.pulseRipple();
    sfx("tick");
  }
  if (readingLoading) readingLoading.addEventListener("click", () => swapLore());
  if (rlDrawBtn) rlDrawBtn.addEventListener("click", swapLore);

  function clearRevealTimers() {
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
  }
  function finishReveal() {
    clearRevealTimers();
    if (!revealActive) return;
    revealActive = false;
    readingBody.querySelectorAll(".r-block.pre").forEach(el => {
      el.classList.remove("pre"); el.classList.add("in");
    });
    if (readingTools) readingTools.hidden = false;
    if (revealSkip) revealSkip.hidden = true;
  }
  function readingScrollTarget() {
    const wide = window.matchMedia && window.matchMedia("(min-width: 981px)").matches;
    return wide ? readingBody : document.querySelector('.screen[data-screen="reading"]');
  }
  function scrollReveal(el) {
    const scroller = readingScrollTarget();
    if (!scroller) return;
    const r = el.getBoundingClientRect();
    const box = scroller.getBoundingClientRect();
    const margin = 48;
    if (r.bottom > box.bottom - margin) {
      scroller.scrollTo({
        top: scroller.scrollTop + (r.bottom - box.bottom) + margin + 24,
        behavior: reduced ? "auto" : "smooth"
      });
    }
  }

  /* ---------------- 左侧解读台：问题回显 + 章节导航 ---------------- */
  let outlineItems = [];
  let outlineTick = 0;
  function resetReadingRail() {
    outlineItems = [];
    if (readingOutline) { readingOutline.hidden = true; readingOutline.innerHTML = ""; }
    if (readingRailQ) readingRailQ.hidden = true;
    if (readingRail) {
      readingRail.hidden = true;
      readingRail.dataset.type = "";
      readingRail.scrollTop = 0;
    }
  }
  function paintRailQuestion(r) {
    if (!readingRailQ) return;
    const q = String((r && r.question) || "").trim();
    readingRailQ.hidden = !q;
    if (!q) return;
    readingRailQTag.textContent = t("lblYouAsk") + (r.questionTopic || t("tOther"));
    readingRailQText.textContent = q;
  }
  function buildReadingOutline() {
    if (!readingOutline) return;
    const rows = [];
    Array.from(readingBody.children).forEach(el => {
      let label = "";
      if (el.classList.contains("tone")) label = t("roOverview");
      else if (el.classList.contains("r-card")) {
        const pos = el.querySelector(".pos");
        label = pos ? pos.textContent.trim() : "";
      } else if (el.classList.contains("synthesis")) label = t("lblSynthesis");
      else if (el.classList.contains("actions-list")) label = t("roActions");
      if (label) rows.push({ el, label });
    });
    outlineItems = rows;
    readingOutline.innerHTML = "";
    rows.forEach(row => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ro-chip";
      b.textContent = row.label;
      b.addEventListener("click", () => jumpToReadingBlock(row.el));
      readingOutline.appendChild(b);
    });
    readingOutline.hidden = !rows.length;
    // 嵌入/分享直达时屏幕还在切换动画里，等布局可见后再校准一次高亮
    requestAnimationFrame(() => requestAnimationFrame(syncReadingOutline));
    setTimeout(syncReadingOutline, 640);
  }
  function jumpToReadingBlock(el) {
    const scroller = readingScrollTarget();
    if (!scroller || !el) return;
    const top = scroller.scrollTop + el.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top - 24;
    scroller.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
  }
  function syncReadingOutline() {
    if (!outlineItems.length || !readingOutline) return;
    const scroller = readingScrollTarget();
    if (!scroller) return;
    const edge = scroller.getBoundingClientRect().top + 140;
    let idx = 0;
    outlineItems.forEach((row, i) => {
      if (row.el.getBoundingClientRect().top <= edge) idx = i;
    });
    if (scroller.scrollHeight > scroller.clientHeight + 8 &&
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8) {
      idx = outlineItems.length - 1;
    }
    Array.from(readingOutline.children).forEach((b, i) => b.classList.toggle("is-on", i === idx));
  }
  const readingScrollBox = document.querySelector('.screen[data-screen="reading"]');
  const onReadingScroll = () => {
    if (outlineTick || !outlineItems.length) return;
    outlineTick = requestAnimationFrame(() => { outlineTick = 0; syncReadingOutline(); });
  };
  if (readingScrollBox) readingScrollBox.addEventListener("scroll", onReadingScroll, { passive: true });
  readingBody.addEventListener("scroll", onReadingScroll, { passive: true });
  // 把整段解读切成 2-3 个短段：先按句末标点断句，再按目标长度合并，避免大段文字糊成一团
  function splitParas(text, target) {
    const raw = String(text || "").trim();
    if (!raw) return [];
    const sentRe = lang === "en"
      ? /[^.!?]+[.!?]+(?:["'）)\]]+)?|[^.!?]+$/g
      : /[^。！？!?；;]+[。！？!?；;]+(?:[」』”’）)]*)?|[^。！？!?；;]+$/g;
    const out = [];
    let cur = "";
    const joinSep = lang === "en" ? " " : "";
    raw.split(/\n+/).forEach(chunk => {
      const sents = chunk.match(sentRe) || [];
      sents.forEach(s => {
        const t = s.trim();
        if (!t) return;
        if (cur && cur.length + t.length > target && cur.length >= target * 0.55) {
          out.push(cur);
          cur = t;
        } else {
          cur = cur ? cur + joinSep + t : t;
        }
      });
      if (cur) { out.push(cur); cur = ""; }
    });
    return out;
  }
  function renderReading(r, isLive, opts) {
    const instant = !!(opts && opts.instant);
    let html = "";
    let text = "";
    const sep = lang === "en" ? ". " : "。";
    const listSep = lang === "en" ? "; " : "；";
    if (r.question) {
      html += '<div class="ask-echo"><span class="ask-echo-tag">' + t("lblYouAsk") + (r.questionTopic || t("tOther")) + '</span>' +
        '<span class="ask-echo-q">' + esc(r.question) + '</span></div>';
      text += t("lblYouAskSpeech") + r.question + sep;
    }
    html += '<div class="tone">' + esc(r.tone) + "</div>";
    text += r.tone + sep;
    (r.readings || []).forEach(rr => {
      const paras = splitParas(rr.text, lang === "en" ? 210 : 82);
      html += '<div class="r-card"><div class="pos"><span>' + esc(rr.position) + '</span></div>' +
        '<div class="cname">' + esc(rr.card) + '</div><div class="txt">' +
        paras.map((p, i) => '<p' + (i ? "" : ' class="lead"') + ">" + esc(p) + "</p>").join("") +
        "</div></div>";
      text += rr.position + (lang === "en" ? ", " : "，") + rr.card + sep + rr.text + " ";
    });
    const synParas = splitParas(r.synthesis, lang === "en" ? 240 : 96);
    html += '<div class="synthesis"><div class="block-title">' + t("lblSynthesis") + '</div>' +
      synParas.map((p, i) => '<p' + (i ? "" : ' class="lead"') + ">" + esc(p) + "</p>").join("") + "</div>";
    text += t("lblSynthesis") + (lang === "en" ? ": " : "：") + r.synthesis + " ";
    html += '<div class="actions-list"><div class="block-title">' + t("lblActions") + '</div><ul>';
    (r.actions || []).forEach((a, i) => html += '<li data-step="' + String(i + 1).padStart(2, "0") + '">' + esc(a) + "</li>");
    html += "</ul></div>";
    if (r.actions && r.actions.length) text += t("lblActions") + (lang === "en" ? ": " : "：") + r.actions.join(listSep) + sep;
    html += '<div class="closing">' + esc(r.closing) + "</div>";
    html += '<div class="disclaimer">' + t(isLive ? "disclaimerLive" : "disclaimer") + "</div>";
    readingBody.innerHTML = html;
    currentReadingText = text + r.closing;
    if (readingRail) readingRail.hidden = false;
    paintRailQuestion(r);
    buildReadingOutline();

    const blocks = Array.from(readingBody.children);
    blocks.forEach(el => el.classList.add("r-block"));
    clearRevealTimers();

    if (instant || reduced) {
      revealActive = false;
      readingBody.classList.add("no-anim");
      blocks.forEach(el => el.classList.add("in"));
      if (readingTools) readingTools.hidden = false;
      if (revealSkip) revealSkip.hidden = true;
      return;
    }
    readingBody.classList.remove("no-anim");
    revealActive = true;
    if (readingTools) readingTools.hidden = true;
    if (revealSkip) revealSkip.hidden = false;
    blocks.forEach(el => el.classList.add("pre"));
    const base = 1050, gap = 650;
    blocks.forEach((el, i) => {
      revealTimers.push(setTimeout(() => {
        el.classList.remove("pre"); el.classList.add("in");
        setTimeout(() => el.classList.add("settled"), 900);
        sfx("tick");
        scrollReveal(el);
      }, base + i * gap));
    });
    revealTimers.push(setTimeout(finishReveal, base + blocks.length * gap + 300));
  }
  function showReading(type, data) {
    const qa = readQuestion(type);
    data = Object.assign({}, data || {}, { question: qa.question, topic: qa.topic });
    readingTitle.textContent = t(
      type === "tarot" ? "rdTarot" : type === "gua" ? "rdGua" : type === "mansion" ? "rdMansion"
      : type === "rune" ? "rdRune" : type === "oracle" ? "rdOracle" : "rdNumber"
    );
    switchScreen("reading");
    vortex.classList.remove("hide");
    readingBody.innerHTML = "";
    if (readingStage) readingStage.innerHTML = "";
    resetReadingRail();
    const scroller = document.querySelector('.screen[data-screen="reading"]');
    if (scroller) scroller.scrollTop = 0;
    readingBody.scrollTop = 0;
    if (readingTools) readingTools.hidden = true;
    if (revealSkip) revealSkip.hidden = true;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (soundOn) ensureAudio();                 // 在点击手势内预热音频上下文
    pendingReading = { type, data };
    startReadingLoading(type, data);
    const wait = reduced ? 180 : 260;
    playRevealVeil();
    bgmReveal();                                 // BGM 切到「揭晓」片刻，再回到 ambient
    setReadingBanner("gen");
    const token = loadToken;
    setTimeout(() => { fetchReading(type, data, token); }, wait);
  }

  /* ---------------- 真实解读（StepFun） + 兜底 ---------------- */
  // 送给模型的 payload 需要自带可核对的名称：模型只负责解读，不负责猜星宿/签文
  function apiPayload(type, data) {
    const p = Object.assign({}, data || {});
    if (type === "tarot" && Array.isArray(p.cards)) {
      p.cards = p.cards.map(c => {
        const t = TAROT[c.idx] || [];
        return Object.assign({}, c, {
          name: lang === "en" ? t[2] : t[0],
          orient: (c.orient === "逆" || c.orient === "rev" || c.orient === 1) ? "reversed" : "upright"
        });
      });
    } else if (type === "mansion") {
      const m = MANSION[p.idx];
      if (m) {
        p.name = mansionFull(m);
        p.beast = lang === "en" ? m.be : m.b;
        p.element = lang === "en" ? m.ee : m.e;
      }
    } else if (type === "rune" && Array.isArray(p.runes)) {
      p.runeNames = p.runes.map(i => runeCard(RUNE[i]));
    } else if (type === "oracle") {
      const s = ORACLE[p.sign];
      if (s) {
        p.no = s.no;
        p.level = oracleLevel(s);
        p.poem = oraclePoem(s);
      }
    }
    return p;
  }
  async function getReading(type, data) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 28000);
    try {
      const res = await fetch(api("/api/reading"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: type, lang: lang, payload: apiPayload(type, data) }),
        signal: ctrl.signal
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const j = await res.json();
      if (!j || !Array.isArray(j.readings) || !j.readings.length ||
          typeof j.tone !== "string" || typeof j.synthesis !== "string" ||
          !Array.isArray(j.actions)) throw new Error("bad payload");
      return j;
    } catch (e) {
      return null;                                // 触发兜底，绝不白屏
    } finally {
      clearTimeout(to);
    }
  }
  async function fetchReading(type, data, token) {
    if (token !== loadToken) return;
    let r = null;
    try { r = await getReading(type, data); } catch (e) { r = null; }
    if (token !== loadToken) return;            // 期间已发起新的解读请求，丢弃旧结果
    const isLive = !!r;
    if (!r) r = mockReading(type, data);
    else if (r.question && !r.questionTopic) r.questionTopic = topicLabel((data && data.topic) || "other");
    await finishReadingLoading(token);
    if (token !== loadToken) return;
    setReadingBanner(isLive ? "live" : "demo");
    currentReading = { type, data, r, isLive };
    pendingReading = null;
    window.__reading = currentReading;
    vortex.classList.add("hide");
    renderStage(type, data);
    renderReading(r, isLive);
    playRevealMoment();
  }
  let readingBannerMode = "demo";
  function setReadingBanner(mode) { readingBannerMode = mode; refreshReadingBanner(); }
  function refreshReadingBanner() {
    const el = document.getElementById("readingBanner");
    if (!el) return;
    const m = readingBannerMode;
    el.textContent = m === "live" ? t("liveBanner") : m === "gen" ? t("genReading") : m === "share" ? t("shareBanner") : t("demoBanner");
    el.hidden = m === "gen";               // 生成中由进度卡接管，避免重复状态条
    el.classList.toggle("is-live", m === "live");
    el.classList.toggle("is-demo", m !== "live");
  }

  /* ---------------- 朗读：StepFun TTS 优先，Web Speech 兜底 ---------------- */
  let ttsAudio = null;
  let ttsAbort = null;
  let ttsSeq = 0;                    // 每次停止/重新朗读自增，丢弃迟到的合成结果
  function stopAudio() {
    ttsSeq++;
    if (ttsAbort) { try { ttsAbort.abort(); } catch (e) {} ttsAbort = null; }
    if (ttsAudio) { try { ttsAudio.pause(); ttsAudio.src = ""; } catch (e) {} ttsAudio = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    duckBgm(1);
  }
  function resetSpeakBtn() {
    if (!readingSpeak) return;
    readingSpeak.dataset.on = "0"; readingSpeak.textContent = t("speakPlay");
  }
  async function playTts(text, seq) {
    const ctrl = new AbortController();
    ttsAbort = ctrl;
    const to = setTimeout(() => ctrl.abort(), 90000);
    try {
      const res = await fetch(api("/api/tts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
        signal: ctrl.signal
      });
      if (!res.ok || seq !== ttsSeq) return false;
      const blob = await res.blob();
      if (!blob || blob.size < 1200) return false;   // 过小视为失败
      if (seq !== ttsSeq) return true;               // 合成期间已退出：丢弃，不播
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      ttsAudio = a;
      const finish = () => {
        URL.revokeObjectURL(url);
        if (ttsAudio !== a) return;                  // 已被 stopAudio 接管，别覆盖新状态
        ttsAudio = null; duckBgm(1); resetSpeakBtn();
      };
      a.onended = finish;
      a.onerror = finish;
      duckBgm(0.2);                      // 朗读时让 BGM 退到背后
      a.volume = 0.0001;                 // 140ms 淡入：抹掉 mp3 起播的闷响/爆音
      await a.play();
      const t0 = performance.now();
      const ramp = () => {
        if (ttsAudio !== a) return;
        const k = Math.min(1, (performance.now() - t0) / 140);
        a.volume = 0.0001 + k * k * 0.9999;
        if (k < 1) requestAnimationFrame(ramp);
      };
      requestAnimationFrame(ramp);
      return true;
    } catch (e) { return false; }
    finally { clearTimeout(to); if (ttsAbort === ctrl) ttsAbort = null; }
  }
  function speakWeb(text) {
    if (!("speechSynthesis" in window)) { alert(t("noSpeech")); resetSpeakBtn(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "en" ? "en-US" : "zh-CN"; u.rate = 1.03; u.pitch = 1.0;
    const vs = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const names = lang === "en"
      ? ["Microsoft Aria", "Microsoft Jenny", "Google US English", "Samantha"]
      : ["Microsoft Xiaoxiao", "Microsoft Yunxi", "Microsoft Huihui", "Google 普通话", "Tingting"];
    const v = names.map(n => vs.find(x => (x.name || "").includes(n))).find(Boolean) ||
      vs.find(x => (x.lang || "").toLowerCase().startsWith(lang === "en" ? "en" : "zh"));
    if (v) u.voice = v;
    u.onend = () => { duckBgm(1); resetSpeakBtn(); };
    u.onerror = () => { duckBgm(1); resetSpeakBtn(); };
    window.speechSynthesis.cancel();
    duckBgm(0.2);
    window.speechSynthesis.speak(u);
  }
  function initReadingSpeak() {
    if (!readingSpeak) return;
    readingSpeak.addEventListener("click", async () => {
      if (readingSpeak.dataset.on === "1") { stopAudio(); resetSpeakBtn(); return; }
      if (!currentReadingText) return;
      stopAudio();                       // 取消上一段仍在合成的请求
      const seq = ttsSeq;
      readingSpeak.dataset.on = "1"; readingSpeak.textContent = t("ttsLoading");
      const ok = await playTts(currentReadingText, seq);
      if (seq !== ttsSeq) return;        // 已退出/切换语言：不再改按钮或兜底朗读
      if (ok) { readingSpeak.textContent = t("speakStop"); }
      else { readingSpeak.textContent = t("speakStop"); speakWeb(currentReadingText); }
    });
  }

  /* ---------------- 导出星图（合成海报 PNG） ---------------- */
  function heroSrcFor(type, data) {
    if (type === "tarot" && data.cards && data.cards[1]) return "assets/tarot/" + data.cards[1].idx + ".webp";
    if (type === "gua") return "assets/gua/altar.webp";
    if (type === "mansion") return "assets/mansion/" + mansionBeast(data.idx).code + ".webp";
    if (type === "rune" && data.runes && data.runes.length) return runeVisionSrc(data.runes[Math.floor(data.runes.length / 2)]);
    if (type === "oracle") return "assets/oracle/altar.webp";
    if (type === "number" && data.symbolIdx != null) return "assets/numerology/" + data.symbolIdx + ".webp";
    return null;
  }
  function loadImgSafe(src) {
    return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  }
  /* 直接用 file:// 打开时，把本地图片画进 canvas 会污染画布，toDataURL 必失败。
     这种场景改用程序化星纹徽记，保证导出永远可用。 */
  function canDrawLocalImages() {
    try { return location.protocol === "http:" || location.protocol === "https:"; }
    catch (e) { return false; }
  }
  function drawStarSeal(ctx, cx, cy, accent, accent2) {
    ctx.save();
    const glow = ctx.createRadialGradient(cx, cy, 16, cx, cy, 210);
    glow.addColorStop(0, rgba(accent, 0.26)); glow.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = glow; ctx.fillRect(cx - 240, cy - 240, 480, 480);

    for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 190;
      ctx.globalAlpha = 0.15 + Math.random() * 0.55;
      ctx.fillStyle = Math.random() < 0.5 ? accent : accent2;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0.6 + Math.random() * 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    [150, 116, 82].forEach((r, i) => {
      ctx.beginPath();
      ctx.strokeStyle = rgba(i === 1 ? accent2 : accent, i === 1 ? 0.42 : 0.24);
      ctx.lineWidth = i === 1 ? 1.2 : 1;
      if (i === 2) ctx.setLineDash([3, 9]);
      ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    });
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2, long = i % 6 === 0;
      const r0 = long ? 128 : 138, r1 = 150;
      ctx.strokeStyle = rgba(long ? accent2 : accent, long ? 0.7 : 0.26);
      ctx.lineWidth = long ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }
    const star = (spikes, outer, inner) => {
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 ? inner : outer;
        const a = -Math.PI / 2 + (i * Math.PI) / spikes;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
    };
    const sg = ctx.createLinearGradient(cx - 60, cy - 60, cx + 60, cy + 60);
    sg.addColorStop(0, accent); sg.addColorStop(1, accent2);
    ctx.shadowColor = rgba(accent, 0.7); ctx.shadowBlur = 26;
    ctx.strokeStyle = sg; ctx.lineWidth = 2.2;
    star(8, 66, 26); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = rgba(accent, 0.9);
    ctx.beginPath(); ctx.arc(cx, cy, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function rgba(hex, a) {
    let h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h.split("").map(x => x + x).join("");
    const n = parseInt(h, 16);
    if (!isFinite(n)) return "rgba(124,140,255," + a + ")";
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function wrapLines(ctx, text, maxW) {
    const NO_START = "，。、；：！？）」』】…·,%!?;:]}>”’";   // 行首禁则：闭点号挤进上一行
    const chars = String(text).split("");
    const out = []; let line = "";
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxW && line) {
        if (NO_START.includes(chars[i])) { out.push(test); line = ""; continue; }
        out.push(line); line = chars[i];
      }
      else line = test;
    }
    if (line) out.push(line);
    return out;
  }
  async function exportStarMap() {
    if (!currentReading || !readingExport) return;
    readingExport.disabled = true;
    try {
      const { type, data, r } = currentReading;
      const W = 1080, M = 88, PAD = 58;
      const c = document.createElement("canvas");
      const ctx = c.getContext("2d");
      c.width = W; c.height = 600;                       // 先占位测量，稍后按内容定高
      const pal = {
        bg0: cssVar("--bg-0") || "#05060B", bg1: cssVar("--bg-1") || "#0B0E1A",
        t1: cssVar("--text-1") || "#E8ECFF", t2: cssVar("--text-2") || "#A8B0D0",
        t3: cssVar("--text-3") || "#6B7290",
        accent: cssVar("--accent") || "#7C8CFF", accent2: cssVar("--accent-2") || "#A970FF"
      };
      if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
      const heroSrc = canDrawLocalImages() ? heroSrcFor(type, data) : null;
      const hero = heroSrc ? await loadImgSafe(heroSrc) : null;

      /* ---- 正文块：先排版测量，保证一字不裁 ---- */
      const F = {
        tone: "500 40px 'Noto Serif SC', Georgia, serif",
        head: "600 33px 'Noto Serif SC', Georgia, serif",
        body: "400 29px 'Noto Sans SC', sans-serif",
        item: "400 29px 'Noto Sans SC', sans-serif",
        close: "500 31px 'Noto Serif SC', Georgia, serif"
      };
      const LH = { tone: 58, head: 46, body: 42, item: 42, close: 46 };
      const GAP = { tone: 22, head: 6, body: 18, item: 6, close: 0 };
      const q = lang === "en" ? "“" : "「", qq = lang === "en" ? "”" : "」";
      const blocks = [{ kind: "tone", text: q + r.tone + qq }];
      (r.readings || []).forEach(rr => {
        blocks.push({ kind: "head", text: rr.position + " · " + rr.card });
        blocks.push({ kind: "body", text: rr.text });
      });
      blocks.push({ kind: "head", text: t("expSynthesis") });
      blocks.push({ kind: "body", text: r.synthesis });
      if (r.actions && r.actions.length) {
        blocks.push({ kind: "head", text: t("expActions") });
        r.actions.forEach(a => blocks.push({ kind: "item", text: "· " + a }));
      }
      if (r.closing) blocks.push({ kind: "close", text: r.closing });
      const innerW = W - M * 2 - PAD * 2;
      const laid = blocks.map(b => { ctx.font = F[b.kind]; return { b, lines: wrapLines(ctx, b.text, b.kind === "item" ? innerW - 24 : innerW) }; });
      let textH = 0;
      laid.forEach(L => { textH += L.lines.length * LH[L.b.kind] + GAP[L.b.kind]; });

      /* ---- 纵向布局 ---- */
      const headBottom = 268;                              // 品牌 + 模块名 + 日期
      const heroBox = { w: W - M * 2 - 120, h: 400 };
      let heroTop = headBottom + 26, heroH = 0;
      if (hero && hero.naturalWidth) {
        const k = Math.min(heroBox.w / hero.naturalWidth, heroBox.h / hero.naturalHeight);
        heroH = Math.round(hero.naturalHeight * k);
      } else {
        heroH = 320;                                       // 无位图时给星纹徽记留出空间
      }
      const heroBottom = heroTop + heroH;
      ctx.font = "500 38px 'Noto Serif SC', Georgia, serif";
      const title = t(
        type === "tarot" ? "rdTarot" : type === "gua" ? "rdGua" : type === "mansion" ? "rdMansion"
        : type === "rune" ? "rdRune" : type === "oracle" ? "rdOracle" : "rdNumber"
      );
      let highlight = "";
      if (type === "tarot") highlight = data.cards.map(cc => tarotName(cc.idx) + (cc.orient === "逆" ? (lang === "en" ? " (Rev)" : "（逆）") : "")).join("  ·  ");
      else if (type === "gua") highlight = guaFullName(data.guaIndex - 1) + "  →  " + guaFullName(data.changeIdx);
      else if (type === "mansion") highlight = mansionFull(MANSION[data.idx]);
      else if (type === "rune") highlight = data.runes.map(ri => runeCard(RUNE[ri])).join("  ·  ");
      else if (type === "oracle") highlight = (lang === "en" ? "Lot " : "第 ") + ORACLE[data.sign].no + (lang === "en" ? " · " : " 签 · ") + oracleLevel(ORACLE[data.sign]);
      else highlight = data.raw + "  →  " + numSymbol(data.symbolIdx) + " " + numThemeStr(data.themeIdx);
      const hlLines = wrapLines(ctx, highlight, W - M * 2);
      const hlTop = heroBottom + 66;
      const hlBottom = hlTop + (hlLines.length - 1) * 52;
      const panelY = hlBottom + 62;
      const panelH = textH + PAD * 2;
      const H = panelY + panelH + 132;
      c.height = H;                                      // 定高（重置画布），以下正式绘制

      /* ---- 背景：夜空渐变 + 星尘 + 星座连线 + 暗角 ---- */
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, pal.bg1); g.addColorStop(0.55, pal.bg0); g.addColorStop(1, pal.bg1);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const stars = [];
      for (let i = 0; i < 340; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 1.7, a: 0.1 + Math.random() * 0.5 });
      stars.forEach(s => {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = Math.random() < 0.5 ? pal.accent : pal.accent2;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = rgba(pal.accent, 0.16); ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {                        // 星座折线：随机但连贯
        let x = 60 + Math.random() * (W - 120), y = 40 + Math.random() * (H - 80);
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let k = 0; k < 4; k++) {
          x += (Math.random() - 0.5) * 260; y += (Math.random() - 0.5) * 220;
          ctx.lineTo(x, y);
          ctx.save(); ctx.fillStyle = rgba(pal.accent2, 0.5); ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        ctx.stroke();
      }
      const vig = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.2, W / 2, H * 0.5, H * 0.85);
      vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.42)");
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

      /* ---- 页眉 ---- */
      ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.fillStyle = pal.t1; ctx.font = "500 66px Georgia, 'Noto Serif SC', serif";
      ctx.shadowColor = rgba(pal.accent, 0.75); ctx.shadowBlur = 26;
      ctx.fillText(t("expBrand"), W / 2, 132);
      ctx.shadowBlur = 0;
      const rule = ctx.createLinearGradient(W / 2 - 150, 0, W / 2 + 150, 0);
      rule.addColorStop(0, rgba(pal.accent, 0)); rule.addColorStop(0.5, rgba(pal.accent2, 0.8)); rule.addColorStop(1, rgba(pal.accent, 0));
      ctx.strokeStyle = rule; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(W / 2 - 150, 162); ctx.lineTo(W / 2 + 150, 162); ctx.stroke();
      ctx.fillStyle = pal.accent2; ctx.font = "500 36px 'Noto Serif SC', Georgia, serif";
      ctx.fillText(title, W / 2, 214);
      ctx.fillStyle = pal.t3; ctx.font = "400 24px 'Noto Sans SC', sans-serif";
      const ts = new Date().toLocaleString(lang === "en" ? "en-US" : "zh-CN", { hour12: false });
      ctx.fillText(ts, W / 2, 252);

      /* ---- 主视觉：模块意象 + 柔光 ---- */
      if (hero && hero.naturalWidth) {
        const k = Math.min(heroBox.w / hero.naturalWidth, heroBox.h / hero.naturalHeight);
        const dw = Math.round(hero.naturalWidth * k), dh = Math.round(hero.naturalHeight * k);
        const dx = (W - dw) / 2, dy = heroTop;
        const glow = ctx.createRadialGradient(W / 2, dy + dh / 2, 20, W / 2, dy + dh / 2, Math.max(dw, dh) * 0.72);
        glow.addColorStop(0, rgba(pal.accent, 0.2)); glow.addColorStop(1, rgba(pal.accent, 0));
        ctx.fillStyle = glow; ctx.fillRect(0, dy - 120, W, dh + 240);
        ctx.strokeStyle = rgba(pal.accent2, 0.35); ctx.lineWidth = 1;   // 饰环垫在图下，不刮牌面
        ctx.beginPath(); ctx.arc(W / 2, dy + dh / 2, Math.max(dw, dh) * 0.62, 0, Math.PI * 2); ctx.stroke();
        ctx.save();
        ctx.shadowColor = rgba(pal.accent, 0.55); ctx.shadowBlur = 34;
        ctx.drawImage(hero, dx, dy, dw, dh);
        ctx.restore();
      } else {
        drawStarSeal(ctx, W / 2, heroTop + heroH / 2, pal.accent, pal.accent2);
      }

      /* ---- 结果摘要 ---- */
      ctx.font = "500 38px 'Noto Serif SC', Georgia, serif";
      ctx.fillStyle = pal.t1;
      hlLines.forEach((ln, i) => ctx.fillText(ln, W / 2, hlTop + i * 52));

      /* ---- 正文面板 ---- */
      ctx.save();
      roundRectPath(ctx, M, panelY, W - M * 2, panelH, 22);
      ctx.fillStyle = rgba(pal.bg1, 0.66); ctx.fill();
      ctx.strokeStyle = rgba(pal.accent, 0.4); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = rgba(pal.accent2, 0.8); ctx.lineWidth = 2;   // 四角饰线
      [[M, panelY, 1, 1], [W - M, panelY, -1, 1], [M, panelY + panelH, 1, -1], [W - M, panelY + panelH, -1, -1]].forEach(([cx0, cy0, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(cx0 + sx * 34, cy0 + sy * 10); ctx.lineTo(cx0 + sx * 10, cy0 + sy * 10); ctx.lineTo(cx0 + sx * 10, cy0 + sy * 34);
        ctx.stroke();
      });
      let y = panelY + PAD;
      const x0 = M + PAD;
      laid.forEach(L => {
        const b = L.b, lh = LH[b.kind];
        if (b.kind === "tone") {
          ctx.font = F.tone; ctx.fillStyle = pal.accent; ctx.textAlign = "left";
          L.lines.forEach((ln, i) => ctx.fillText(ln, x0, y + 40 + i * lh));
        } else if (b.kind === "head") {
          ctx.font = F.head; ctx.fillStyle = pal.accent2; ctx.textAlign = "left";
          L.lines.forEach((ln, i) => ctx.fillText(ln, x0, y + 33 + i * lh));
        } else if (b.kind === "close") {
          ctx.font = F.close; ctx.fillStyle = pal.accent2; ctx.textAlign = "center";
          L.lines.forEach((ln, i) => ctx.fillText(ln, W / 2, y + 31 + i * lh));
        } else {
          ctx.font = F[b.kind]; ctx.fillStyle = pal.t2; ctx.textAlign = "left";
          L.lines.forEach((ln, i) => ctx.fillText(ln, x0 + (b.kind === "item" ? 24 : 0), y + 29 + i * lh));
        }
        y += L.lines.length * lh + GAP[b.kind];
      });

      /* ---- 页脚 ---- */
      ctx.textAlign = "center"; ctx.fillStyle = pal.t3; ctx.font = "400 22px 'Noto Sans SC', sans-serif";
      ctx.fillText(t(currentReading.isLive ? "expFooterLive" : "expFooter") + ts, W / 2, H - 52);
      ctx.fillStyle = rgba(pal.accent2, 0.7);
      ctx.beginPath(); ctx.arc(W / 2, H - 88, 3, 0, Math.PI * 2); ctx.fill();

      const url = c.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url; a.download = "astra-" + type + "-" + Date.now() + ".png";
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { alert("导出失败：" + (e && e.message ? e.message : e)); }
    finally { readingExport.disabled = false; }
  }
  function initReadingExport() {
    if (readingExport) readingExport.addEventListener("click", exportStarMap);
  }
  /* 退出解读：导航回首页由 data-go="home" 统一处理；此处仅收尾——停止朗读并复位朗读按钮 */
  function initReadingExit() {
    if (!readingExit) return;
    readingExit.addEventListener("click", () => {
      stopAudio(); resetSpeakBtn();
    });
  }
  initReadingSpeak();
  initReadingExport();
  initReadingExit();

  /* ---------------- 分享链接：整份解读压缩进 hash，打开即回放 ---------------- */
  const shareModal = document.getElementById("shareModal");
  const shareInput = document.getElementById("shareInput");
  const shareCopy = document.getElementById("shareCopy");
  const shareClose = document.getElementById("shareClose");
  const shareBaseRow = document.getElementById("shareBaseRow");
  const shareBaseInput = document.getElementById("shareBaseInput");

  function isLocalOrigin() {
    const h = location.hostname || "";
    return location.protocol === "file:" || h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "[::1]";
  }
  function getShareBase() {
    let v = SHARE_BASE || "";
    try { v = v || localStorage.getItem(SHARE_BASE_KEY) || ""; } catch (e) {}
    return String(v || "").trim();
  }
  // 线上直接用当前页面地址；本地预览用填写的公开站点地址（GitHub Pages / 自定义域名）
  function publicShareBase() {
    if (!isLocalOrigin()) return location.href.split(/[?#]/)[0];
    let base = getShareBase();
    if (!base) return "";
    if (!/^https?:\/\//i.test(base)) base = "https://" + base;
    base = base.replace(/[?#].*$/, "");
    return /\.html?$/i.test(base) ? base : base.replace(/\/?$/, "/") + "index.html";
  }
  function setShareCopyEnabled(on) {
    if (shareCopy) shareCopy.disabled = !on;
  }
  function b64urlEncode(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64urlDecode(str) {
    const s = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  async function makeShareLink() {
    const payload = { v: 1, t: currentReading.type, d: currentReading.data, r: currentReading.r, l: lang, ts: Date.now() };
    const json = JSON.stringify(payload);
    let code = null;
    if (window.CompressionStream) {
      try {
        const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"));
        code = "z" + b64urlEncode(new Uint8Array(await new Response(stream).arrayBuffer()));
      } catch (e) { code = null; }
    }
    if (!code) code = "j" + b64urlEncode(new TextEncoder().encode(json));
    const base = publicShareBase();
    return base ? base + "#s=" + code : "";
  }
  async function decodeShareCode(code) {
    let bytes = b64urlDecode(code.slice(1));
    if (code[0] === "z") {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    } else if (code[0] !== "j") throw new Error("bad tag");
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  const SHARE_TYPES = { tarot: 1, gua: 1, number: 1, mansion: 1, rune: 1, oracle: 1 };
  function readingTitleKey(type) {
    return type === "tarot" ? "rdTarot" : type === "gua" ? "rdGua" : type === "mansion" ? "rdMansion"
      : type === "rune" ? "rdRune" : type === "oracle" ? "rdOracle" : "rdNumber";
  }
  async function openShareModal() {
    if (!currentReading || !shareModal) return;
    shareModal.hidden = false;
    if (shareBaseRow) shareBaseRow.hidden = !isLocalOrigin();
    if (shareBaseInput) shareBaseInput.value = getShareBase();
    if (shareInput) shareInput.value = t("shareMaking");
    setShareCopyEnabled(false);
    const u = await makeShareLink();
    if (!shareInput || shareModal.hidden) return;
    shareInput.value = u || t("shareNoBase");
    setShareCopyEnabled(!!u);
    sfx("tick");
  }
  function initReadingShare() {
    const btn = document.getElementById("readingShare");
    if (btn) btn.addEventListener("click", openShareModal);
    if (!shareModal) return;
    shareModal.addEventListener("click", e => { if (e.target === shareModal) shareModal.hidden = true; });
    if (shareClose) shareClose.addEventListener("click", () => { shareModal.hidden = true; });
    if (shareBaseInput) {
      const commitBase = async () => {
        const v = shareBaseInput.value.trim();
        try { if (v) localStorage.setItem(SHARE_BASE_KEY, v); else localStorage.removeItem(SHARE_BASE_KEY); } catch (e) {}
        const u = await makeShareLink();
        if (!shareInput) return;
        shareInput.value = u || t("shareNoBase");
        setShareCopyEnabled(!!u);
      };
      shareBaseInput.addEventListener("change", commitBase);
      shareBaseInput.addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); commitBase(); shareBaseInput.blur(); }
      });
    }
    if (shareCopy) shareCopy.addEventListener("click", async () => {
      if (!shareInput || shareCopy.disabled) return;
      let ok = false;
      try { await navigator.clipboard.writeText(shareInput.value); ok = true; } catch (e) { ok = false; }
      if (!ok) { try { shareInput.focus(); shareInput.select(); ok = document.execCommand("copy"); } catch (e) { ok = false; } }
      shareCopy.textContent = ok ? t("shareCopied") : t("shareCopy");
      setTimeout(() => { if (shareCopy) shareCopy.textContent = t("shareCopy"); }, 1600);
    });
  }
  async function restoreFromShare() {
    const m = location.hash.match(/^#s=([A-Za-z0-9\-_]+)$/);
    if (!m) return;
    let p = null;
    try { p = await decodeShareCode(m[1]); } catch (e) { p = null; }
    if (!p || !p.r || !p.t || !SHARE_TYPES[p.t]) { alert(t("shareBad")); return; }
    if (p.l && p.l !== lang) setLang(p.l);
    currentReading = { type: p.t, data: p.d || {}, r: p.r, isLive: false, shared: true };
    window.__reading = currentReading;
    readingTitle.textContent = t(readingTitleKey(p.t));
    switchScreen("reading");
    renderStage(p.t, currentReading.data);
    renderReading(p.r, false, { instant: true });
    setReadingBanner("share");
    if (readingTools) readingTools.hidden = false;
    if (revealSkip) revealSkip.hidden = true;
  }
  initReadingShare();

  /* ---------------- 首页旅程：抵达之门 → 旅人身份 → 星径六门 ---------------- */
  const IDENTITIES = {
    wanderer: { door: "mansion", key: "idWanderer" },
    heart: { door: "tarot", key: "idHeart" },
    chooser: { door: "gua", key: "idChooser" },
    stargazer: { door: "number", key: "idStargazer" }
  };
  const ID_SEED = {
    wanderer: { zh: "我接下来该往哪个方向走？", en: "Which way should I head next?" },
    heart: { zh: "我心里放不下的那段感情，会有结果吗？", en: "Will the love I cannot let go of come to something?" },
    chooser: { zh: "两条路摆在面前，我该选哪一条？", en: "Two roads lie before me — which one should I take?" },
    stargazer: { zh: "我最近的状态与运势如何？", en: "How are my state and fortune lately?" }
  };
  const ALL_ID_SEEDS = new Set(Object.values(ID_SEED).flatMap(s => [s.zh, s.en]));
  /* 每个模块的建议问题池：前四条显示为 chips，「随缘一问」从全池抽取 */
  const QUESTION_POOLS = {
    tarot: {
      zh: [
        "这段感情，我该主动还是再等等？",
        "眼前这份工作，值得继续投入吗？",
        "我最近总是焦虑，问题出在哪里？",
        "有个决定拖了很久，现在适合做吗？",
        "我和 TA 之间还有可能吗？",
        "接下来三个月，我该把力气用在哪？",
        "这次改变，会把我带向哪里？",
        "我放不下的，到底是人还是遗憾？"
      ],
      en: [
        "Should I make the first move, or wait?",
        "Is this job still worth my investment?",
        "Why have I been so anxious lately?",
        "A decision has waited too long — is now the time?",
        "Is there still a chance between us?",
        "Where should I put my energy in the next three months?",
        "Where will this change take me?",
        "What can't I let go of — the person, or the regret?"
      ]
    },
    gua: {
      zh: [
        "当下这件事，是进还是退？",
        "我该不该接受这个新机会？",
        "这段关系接下来会如何发展？",
        "最近的低潮，什么时候会过去？",
        "这个计划现在启动合适吗？",
        "我担心的那件事，会朝哪个方向走？",
        "换个环境，对我是不是更好？",
        "我和某人的误会，还能解开吗？"
      ],
      en: [
        "In this situation, should I advance or retreat?",
        "Should I take this new opportunity?",
        "Where is this relationship heading?",
        "When will this low period pass?",
        "Is now the right time to start this plan?",
        "Which way will the thing I worry about turn?",
        "Would a change of environment be better for me?",
        "Can this misunderstanding still be cleared up?"
      ]
    },
    number: {
      zh: [
        "我的天赋与短板分别是什么？",
        "当下的状态，在提醒我什么？",
        "今年我该抓住怎样的节奏？",
        "我适合什么样的工作方式？",
        "这段关系里，我真正需要的是什么？",
        "我最近为什么总觉得累？",
        "下一个阶段，我该重点修炼什么？",
        "我身上最值得被看见的部分是什么？"
      ],
      en: [
        "What are my gifts and blind spots?",
        "What is my current state trying to tell me?",
        "What rhythm should I keep this year?",
        "What kind of work suits me best?",
        "What do I truly need in a relationship?",
        "Why have I been feeling so tired?",
        "What should I focus on growing next?",
        "What part of me most deserves to be seen?"
      ]
    },
    mansion: {
      zh: [
        "两条路摆在面前，我该选哪一条？",
        "今天适合推进哪件事？",
        "我最近的方向感为什么变弱了？",
        "这次等待，是沉淀还是错过？",
        "我该主动联系那个人吗？",
        "眼下的阻力，来自外界还是自己？",
        "换个城市生活，会更好吗？",
        "我正在坚持的事，值得吗？"
      ],
      en: [
        "Two roads lie before me — which one should I take?",
        "What should I move forward today?",
        "Why has my sense of direction faded?",
        "Is this waiting a pause, or a missed chance?",
        "Should I reach out to that person?",
        "Is the resistance outside me, or within?",
        "Would life be better in another city?",
        "Is what I'm holding on to worth it?"
      ]
    },
    rune: {
      zh: [
        "我该用什么姿态面对眼前的变局？",
        "这次冒险，值得一试吗？",
        "我卡住的地方，突破口在哪？",
        "一段旧关系，该放下还是再试？",
        "我该如何守住自己的边界？",
        "接下来最该优先处理什么？",
        "我为什么总在同一个地方跌倒？",
        "这次远行，会带来什么？"
      ],
      en: [
        "How should I face the change ahead?",
        "Is this risk worth taking?",
        "Where is the opening in what's blocking me?",
        "An old bond — let go, or try again?",
        "How do I hold my boundaries?",
        "What should I deal with first?",
        "Why do I keep stumbling in the same place?",
        "What will this journey bring?"
      ]
    },
    oracle: {
      zh: [
        "所求之事，近期会有转机吗？",
        "我该继续等，还是主动争取？",
        "这段缘分，是正缘还是过客？",
        "眼下的难，什么时候能过去？",
        "这次考试或面试，我该注意什么？",
        "家人之间的矛盾，该如何化解？",
        "我今年的运势重心在哪里？",
        "我该相信直觉还是理性？"
      ],
      en: [
        "Will there be a turn for the better soon?",
        "Should I keep waiting or make a move?",
        "Is this connection meant to last?",
        "When will this hard time pass?",
        "What should I watch for in this exam or interview?",
        "How can I ease the tension in my family?",
        "Where does my luck centre this year?",
        "Should I trust my gut or my reason?"
      ]
    }
  };
  function askModule(node) {
    const scr = node && node.closest ? node.closest(".screen[data-screen]") : null;
    return scr ? scr.getAttribute("data-screen") : "";
  }
  function askPool(mod) {
    const p = QUESTION_POOLS[mod];
    return p ? (p[lang] || p.zh) : [];
  }
  function askInputOf(mod) {
    const scr = document.querySelector('[data-screen="' + mod + '"]');
    return scr ? scr.querySelector(".ask-input") : null;
  }
  function askChipsOf(mod) {
    const scr = document.querySelector('[data-screen="' + mod + '"]');
    return scr ? scr.querySelector("[data-ask-chips]") : null;
  }
  function syncAskChips(mod) {
    const input = askInputOf(mod), box = askChipsOf(mod);
    if (!input || !box) return;
    const v = input.value.trim();
    box.querySelectorAll(".ask-chip").forEach(c => c.classList.toggle("is-picked", !!v && c.textContent === v));
  }
  function fillAsk(mod, value) {
    const input = askInputOf(mod);
    if (!input || !value) return;
    input.value = value;
    input.classList.remove("is-filled");
    void input.offsetWidth;
    input.classList.add("is-filled");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    syncAskChips(mod);
  }
  function randomAsk(mod) {
    const pool = askPool(mod), input = askInputOf(mod);
    if (!pool.length || !input) return "";
    const cur = input.value.trim();
    let pick = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && pick === cur) {
      pick = pool[(pool.indexOf(pick) + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length];
    }
    fillAsk(mod, pick);
    return pick;
  }
  function translateAskInputs() {
    const seedMap = {};
    Object.keys(ID_SEED).forEach(k => {
      seedMap[ID_SEED[k].zh] = ID_SEED[k].en;
      seedMap[ID_SEED[k].en] = ID_SEED[k].zh;
    });
    document.querySelectorAll("[data-ask-chips]").forEach(box => {
      const mod = askModule(box), p = QUESTION_POOLS[mod];
      if (!p) return;
      const scr = box.closest(".screen");
      const input = scr && scr.querySelector(".ask-input");
      if (!input) return;
      const v = input.value.trim();
      if (!v) return;
      if (seedMap[v]) { input.value = seedMap[v]; return; }
      const from = lang === "en" ? p.zh : p.en;
      const to = lang === "en" ? p.en : p.zh;
      const i = from.indexOf(v);
      if (i >= 0 && to[i]) input.value = to[i];
    });
  }
  function refreshQuestionChips() {
    document.querySelectorAll("[data-ask-chips]").forEach(box => {
      const mod = askModule(box);
      const pool = askPool(mod);
      box.dataset.label = t("askHint");
      box.innerHTML = "";
      pool.slice(0, 6).forEach(q => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "ask-chip";
        chip.textContent = q;
        chip.addEventListener("click", () => { fillAsk(mod, q); sfx("tick"); });
        box.appendChild(chip);
      });
      syncAskChips(mod);
    });
    translateAskInputs();
    Object.keys(QUESTION_POOLS).forEach(syncAskChips);
  }
  document.querySelectorAll("[data-ask-random]").forEach(btn => {
    btn.addEventListener("click", () => {
      randomAsk(askModule(btn));
      btn.classList.remove("is-spin");
      void btn.offsetWidth;
      btn.classList.add("is-spin");
      sfx("tick");
    });
  });
  const journey = { stage: "gate", identity: null, entered: false, busy: false };
  const gateScene = document.getElementById("gateScene");
  const idChip = document.getElementById("idChip");

  function setStage(name, instant) {
    if (journey.stage === name) return;
    const apply = () => {
      document.querySelectorAll(".j-stage").forEach(s => s.classList.remove("is-on", "is-leaving"));
      const el = document.querySelector('.j-stage[data-stage="' + name + '"]');
      if (el) el.classList.add("is-on");
      journey.stage = name;
      const scroller = document.querySelector('.screen[data-screen="home"]');
      if (scroller) scroller.scrollTop = 0;
    };
    if (instant || reduced) { apply(); return; }
    const cur = document.querySelector('.j-stage[data-stage="' + journey.stage + '"]');
    if (cur) cur.classList.add("is-leaving");
    setTimeout(apply, 480);
  }
  function applyFated() {
    document.querySelectorAll(".door").forEach(d => {
      const fated = !!journey.identity && IDENTITIES[journey.identity].door === d.getAttribute("data-door");
      d.classList.toggle("is-fated", fated);
      const star = d.querySelector(".door-star");
      if (star) star.hidden = !fated;
    });
  }
  /* 星径中央的人物跟着所选身份换：未选身份时回到默认旅人 */
  const pathWalker = document.querySelector(".path-walker");
  function applyIdentityFigure() {
    if (pathWalker) pathWalker.setAttribute("data-id", journey.identity || "wanderer");
  }
  function updateIdChip() {
    applyIdentityFigure();
    if (!idChip) return;
    if (journey.identity) { idChip.hidden = false; idChip.textContent = t("idChipPre") + t(IDENTITIES[journey.identity].key); }
    else if (journey.entered) { idChip.hidden = false; idChip.textContent = t("idChipNone"); }
    else idChip.hidden = true;
  }
  function seedQuestion(mod) {
    const el = askInputOf(mod);
    const seed = journey.identity ? ID_SEED[journey.identity] : null;
    if (el && seed) {
      // 换身份后旧身份写进去的种子问题要跟着换；用户自己输入的问题不动
      const v = el.value.trim();
      if (!v || ALL_ID_SEEDS.has(v)) el.value = seed[lang] || seed.zh;
    }
    syncAskChips(mod);
  }
  let gateAutoTimer = 0;
  function armGateAuto() {
    clearTimeout(gateAutoTimer);
    if (journey.entered || journey.busy || journey.stage !== "gate") return;
    gateAutoTimer = setTimeout(() => {
      if (state.screen === "home" && journey.stage === "gate" && !journey.busy) openGate(false);
    }, 1100);
  }
  function openGate(byUser) {
    if (journey.busy || journey.entered || journey.stage !== "gate") return;
    clearTimeout(gateAutoTimer);
    journey.busy = true;
    if (byUser) sfx("knock");
    gateScene.classList.add("is-open");
    if (window.__particles) window.__particles.pulseRipple();
    setTimeout(() => { if (byUser) sfx("whoosh"); }, 720);
    setTimeout(() => {
      journey.busy = false;
      journey.entered = true;
      setStage("identity");
    }, 2800);
  }
  if (gateScene) {
    gateScene.addEventListener("click", () => openGate(true));
    gateScene.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGate(true); }
    });
  }
  document.querySelectorAll(".id-card").forEach(btn => btn.addEventListener("click", () => {
    if (journey.busy) return;
    journey.busy = true;
    journey.identity = btn.getAttribute("data-id");
    btn.classList.add("is-picked");
    sfx("chime");
    if (window.__particles) window.__particles.pulseRipple();
    setTimeout(() => {
      btn.classList.remove("is-picked");
      journey.busy = false;
      applyFated(); updateIdChip(); setStage("path");
    }, 900);
  }));
  const idSkip = document.getElementById("idSkip");
  if (idSkip) idSkip.addEventListener("click", () => {
    if (journey.busy) return;
    journey.identity = null;
    applyFated(); updateIdChip(); setStage("path");
  });
  const idBack = document.getElementById("idBack");
  if (idBack) idBack.addEventListener("click", () => {
    if (journey.busy) return;
    clearTimeout(gateAutoTimer);          // 手动退回时不再自动开门，让门保持可点击
    journey.entered = false;
    journey.identity = null;
    gateScene.classList.remove("is-open");
    applyFated(); updateIdChip();
    setStage("gate");
  });
  document.querySelectorAll(".door").forEach(btn => btn.addEventListener("click", () => {
    if (journey.busy) return;
    journey.busy = true;
    const mod = btn.getAttribute("data-door");
    seedQuestion(mod);
    btn.classList.add("is-open");
    sfx("knock");
    setTimeout(() => sfx("whoosh"), 700);
    setTimeout(() => {
      btn.classList.remove("is-open");
      journey.busy = false;
      switchScreen(mod);
    }, 1300);
  }));
  const doorRandom = document.getElementById("doorRandom");
  if (doorRandom) doorRandom.addEventListener("click", () => {
    if (journey.busy) return;
    journey.busy = true;
    const doors = Array.from(document.querySelectorAll(".door"));
    let i = Math.floor(Math.random() * doors.length);
    let steps = 10 + Math.floor(Math.random() * 5);
    const spin = setInterval(() => {
      doors.forEach((d, k) => d.classList.toggle("is-lit", k === i));
      sfx("tick");
      steps--;
      if (steps <= 0) {
        clearInterval(spin);
        const pick = doors[i];
        doors.forEach(d => d.classList.remove("is-lit"));
        journey.busy = false;
        pick.click();
      } else i = (i + 1) % doors.length;
    }, 135);
  });
  const pathBack = document.getElementById("pathBack");
  if (pathBack) pathBack.addEventListener("click", () => setStage("identity"));

  /* ---------------- 健康探测 + 首页星象引言 ---------------- */
  let apiHealthy = null;                          // null=未知，true/false=已探测
  async function checkHealth() {
    try {
      const res = await fetch(api("/api/health"));
      const j = await res.json();
      apiHealthy = !!(j && j.ok && j.hasKey);
    } catch (e) { apiHealthy = false; }
    refreshHomeNote();
  }
  function refreshHomeNote() {
    ["homeNote", "pathNote"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (apiHealthy === true) { el.textContent = t("liveNote"); el.classList.add("is-live"); }
      else if (apiHealthy === false) { el.textContent = t("demoNote"); el.classList.remove("is-live"); }
      // apiHealthy === null 时保留静态 i18n 默认文案
    });
  }
  async function loadHeroQuote() {
    const el = document.getElementById("heroQuote");
    if (!el) return;
    try {
      const res = await fetch(api("/api/quote?lang=" + encodeURIComponent(lang)));
      const j = await res.json();
      if (j && j.quote) { el.textContent = "“" + j.quote + "”"; el.hidden = false; }
    } catch (e) { /* 保持隐藏，降级静默 */ }
  }

  /* ============================================================
     声音层：主总线 + 混响 + 交互音效（全部 Web Audio 合成，不依赖音频文件）
     - 音效默认开启；BGM 独立开关
     - 所有声音经 masterBus，并可按比例送入 convolver 混响，避免「干声贴脸」
     ============================================================ */
  const revealVeil = document.getElementById("revealVeil");
  const rvc = revealVeil ? revealVeil.getContext("2d") : null;
  let soundOn = true;
  const soundToggle = document.getElementById("soundToggle");
  let audioCtx = null, masterBus = null, reverb = null, reverbSend = null, noiseBuf = null;

  function makeNoiseBuffer(ac) {
    const len = ac.sampleRate * 2;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  function makeImpulse(ac, seconds, decay) {
    const len = Math.floor(ac.sampleRate * seconds);
    const buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function ensureAudio() {
    if (!audioCtx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
        masterBus = audioCtx.createGain(); masterBus.gain.value = 0.9;
        const mhp = audioCtx.createBiquadFilter(); mhp.type = "highpass"; mhp.frequency.value = 30; mhp.Q.value = 0.3;
        masterBus.connect(mhp); mhp.connect(audioCtx.destination);   // 主输出低切：挡掉次声 rumble
        reverb = audioCtx.createConvolver(); reverb.buffer = makeImpulse(audioCtx, 3.2, 2.6);
        const rhp = audioCtx.createBiquadFilter(); rhp.type = "highpass"; rhp.frequency.value = 280; rhp.Q.value = 0.5;
        const wet = audioCtx.createGain(); wet.gain.value = 0.5;
        reverbSend = audioCtx.createGain(); reverbSend.gain.value = 0.5;
        reverbSend.connect(reverb); reverb.connect(rhp); rhp.connect(wet); wet.connect(masterBus);   // 混响回程高通：不留低频嗡嗡尾
        noiseBuf = makeNoiseBuffer(audioCtx);
      } catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }
  /* 单音：短起音 + 长衰减；wet 控制混响送量 */
  function tone(opts) {
    const ac = audioCtx; if (!ac) return;
    const t0 = opts.t != null ? opts.t : ac.currentTime;
    const dur = opts.dur || 0.3;
    const o = ac.createOscillator();
    o.type = opts.type || "sine";
    o.frequency.setValueAtTime(opts.freq, t0);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t0 + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(opts.gain || 0.05, t0 + (opts.attack || 0.025));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let out = g;
    if (ac.createStereoPanner && opts.pan != null) {
      const p = ac.createStereoPanner(); p.pan.value = opts.pan;
      g.connect(p); out = p;
    }
    out.connect(masterBus);
    if (opts.wet) { const s = ac.createGain(); s.gain.value = opts.wet; out.connect(s); s.connect(reverbSend); }
    o.connect(g); o.start(t0); o.stop(t0 + dur + 0.06);
  }
  /* 噪声段：用于纸张、铜钱、木头等材质感 */
  function noiseHit(opts) {
    const ac = audioCtx; if (!ac) return;
    const t0 = opts.t != null ? opts.t : ac.currentTime;
    const dur = opts.dur || 0.12;
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = opts.filter || "bandpass";
    f.frequency.setValueAtTime(opts.freq || 1200, t0);
    if (opts.to) f.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), t0 + dur);
    f.Q.value = opts.q != null ? opts.q : 1.2;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(opts.gain || 0.05, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let out = g;
    if (ac.createStereoPanner && opts.pan != null) {
      const p = ac.createStereoPanner(); p.pan.value = opts.pan;
      g.connect(p); out = p;
    }
    src.connect(f); f.connect(g); out.connect(masterBus);
    if (opts.wet) { const s = ac.createGain(); s.gain.value = opts.wet; out.connect(s); s.connect(reverbSend); }
    src.start(t0); src.stop(t0 + dur + 0.03);
  }
  function sfx(name) {
    if (!soundOn) return;
    const ac = ensureAudio(); if (!ac) return;
    const now = ac.currentTime;
    if (name === "chime") {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone({ freq: f, gain: i === 3 ? 0.05 : 0.1, dur: 1.9 + i * 0.2, t: now + i * 0.09, wet: 0.75, pan: -0.3 + i * 0.2 }));
    } else if (name === "tick") {
      tone({ freq: 1320, gain: 0.022, dur: 0.14, wet: 0.35 });
      tone({ freq: 1980, gain: 0.012, dur: 0.1, t: now + 0.012, wet: 0.3 });
    } else if (name === "card") {
      noiseHit({ freq: 2400, dur: 0.075, gain: 0.06, wet: 0.25, filter: "bandpass", q: 1.6 });
      tone({ freq: 190, to: 120, gain: 0.045, dur: 0.12, wet: 0.2 });
    } else if (name === "shuffle") {
      noiseHit({ freq: 500, to: 2800, dur: 0.45, gain: 0.05, wet: 0.45, filter: "bandpass", q: 0.7 });
    } else if (name === "coin") {
      [1480, 2170, 2960].forEach((f, i) => tone({ freq: f, gain: 0.03 - i * 0.006, dur: 0.42, t: now + i * 0.017, wet: 0.55, pan: -0.25 + i * 0.25 }));
    } else if (name === "rune") {
      tone({ freq: 120, to: 70, gain: 0.11, dur: 0.34, wet: 0.3 });
      noiseHit({ freq: 800, to: 300, dur: 0.16, gain: 0.05, wet: 0.3, filter: "lowpass" });
    } else if (name === "knock") {
      tone({ freq: 260, to: 150, gain: 0.08, dur: 0.16, wet: 0.3 });
      noiseHit({ freq: 1100, dur: 0.06, gain: 0.045, wet: 0.25 });
    } else if (name === "whoosh") {
      noiseHit({ freq: 3200, to: 420, dur: 0.55, gain: 0.045, wet: 0.55, filter: "lowpass" });
    } else if (name === "warp") {
      // 星尘扑面：蓄力时一缕低频抬升 → 冲刺时宽频扫过 → 掠过耳畔后回落
      tone({ freq: 96, to: 300, gain: 0.085, dur: 0.5, wet: 0.35, type: "sine" });
      noiseHit({ freq: 380, to: 5400, dur: 0.62, gain: 0.075, wet: 0.6, filter: "bandpass", q: 0.6, t: now + 0.1 });
      noiseHit({ freq: 5400, to: 420, dur: 0.5, gain: 0.05, wet: 0.5, filter: "lowpass", q: 0.9, t: now + 0.68 });
    } else if (name === "bell") {
      tone({ freq: 1046.5, gain: 0.05, dur: 3.2, wet: 0.85 });
      tone({ freq: 1568, gain: 0.022, dur: 2.6, t: now + 0.04, wet: 0.85 });
    } else if (name === "impact") {
      // 揭晓一记：低频闷响落地，随后一缕高频星尘上扬，不抢人声
      tone({ freq: 118, to: 44, gain: 0.15, dur: 0.42, wet: 0.2 });
      tone({ freq: 236, to: 88, gain: 0.05, dur: 0.24, t: now + 0.006, wet: 0.2 });
      noiseHit({ freq: 760, to: 150, dur: 0.24, gain: 0.07, wet: 0.3, filter: "lowpass", q: 0.8 });
      tone({ freq: 1568, gain: 0.02, dur: 1.5, t: now + 0.07, wet: 0.8 });
      tone({ freq: 2093, gain: 0.011, dur: 1.1, t: now + 0.11, wet: 0.8 });
    }
  }
  function playChime() { sfx("chime"); }
  function playRevealVeil() {
    if (!rvc) return;
    if (reduced) { revealVeil.classList.add("show"); setTimeout(() => revealVeil.classList.remove("show"), 220); return; }
    const W = revealVeil.width = window.innerWidth;
    const H = revealVeil.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const N = 150;
    const parts = [];
    for (let i = 0; i < N; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.max(W, H) * 0.55 + Math.random() * 260;
      parts.push({ x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad, r: 1 + Math.random() * 2.6, a: Math.random() });
    }
    const dur = 1000, started = performance.now();
    revealVeil.classList.add("show");
    const accentRgb = cssVar("--accent-rgb") || "124,140,255";
    function frame(t) {
      const k = Math.min(1, (t - started) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      rvc.clearRect(0, 0, W, H);
      const accent = cssVar("--accent") || "#7C8CFF";
      const accent2 = cssVar("--accent-2") || "#A970FF";
      parts.forEach(p => {
        const x = p.x + (cx - p.x) * ease;
        const y = p.y + (cy - p.y) * ease;
        const fade = k < 0.82 ? 1 : (1 - (k - 0.82) / 0.18);
        rvc.globalAlpha = fade * (0.45 + 0.55 * p.a);
        rvc.fillStyle = p.a > 0.5 ? accent : accent2;
        rvc.beginPath(); rvc.arc(x, y, p.r, 0, Math.PI * 2); rvc.fill();
      });
      rvc.globalAlpha = 1;
      if (k > 0.3) {
        // 星尘收束成一点柔光，再荡开一圈极淡的余辉：没有棱边，不会压在文案上
        const f = (k - 0.3) / 0.7;
        const vis = Math.min(1, f / 0.22) * Math.pow(1 - f, 1.3);
        const R = 18 + f * 108;
        const core = rvc.createRadialGradient(cx, cy, 0, cx, cy, R);
        core.addColorStop(0, "rgba(" + accentRgb + "," + (0.32 * vis).toFixed(3) + ")");
        core.addColorStop(0.4, "rgba(" + accentRgb + "," + (0.11 * vis).toFixed(3) + ")");
        core.addColorStop(1, "rgba(" + accentRgb + ",0)");
        rvc.fillStyle = core;
        rvc.beginPath(); rvc.arc(cx, cy, R, 0, Math.PI * 2); rvc.fill();
        const ringF = Math.max(0, f - 0.18) / 0.82;
        if (ringF > 0 && ringF < 1) {
          rvc.globalAlpha = Math.pow(1 - ringF, 2) * 0.22;
          rvc.strokeStyle = accent2;
          rvc.lineWidth = 1;
          rvc.beginPath(); rvc.arc(cx, cy, 14 + ringF * 118, 0, Math.PI * 2); rvc.stroke();
          rvc.globalAlpha = 1;
        }
      }
      if (k < 1) requestAnimationFrame(frame);
      else { rvc.clearRect(0, 0, W, H); revealVeil.classList.remove("show"); }
    }
    requestAnimationFrame(frame);
  }
  // 出结果那一刻：中心一圈冲击环 + 星屑外溅，压住加载卡消失后的空档
  function playImpactWave() {
    if (!rvc || reduced) return;
    const W = revealVeil.width = window.innerWidth;
    const H = revealVeil.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const accentRgb = cssVar("--accent-rgb") || "124,140,255";
    const accent2 = cssVar("--accent-2") || "#A970FF";
    const hue = cssVar("--particle-a") || "#C9D4FF";
    const shards = [];
    for (let i = 0; i < 44; i++) {
      shards.push({ ang: Math.random() * Math.PI * 2, v: 0.35 + Math.random() * 0.65, r: 1 + Math.random() * 2.2, roll: Math.random() });
    }
    const dur = 780, started = performance.now();
    revealVeil.classList.add("show");
    function frame(t) {
      const k = Math.min(1, (t - started) / dur);
      const out = 1 - Math.pow(1 - k, 2.2);
      rvc.clearRect(0, 0, W, H);
      const glow = Math.pow(1 - k, 2.4);
      if (glow > 0.01) {
        const R = Math.max(W, H) * (0.16 + 0.5 * out);
        const g = rvc.createRadialGradient(cx, cy, 0, cx, cy, R);
        g.addColorStop(0, "rgba(" + accentRgb + "," + (0.3 * glow).toFixed(3) + ")");
        g.addColorStop(0.45, "rgba(" + accentRgb + "," + (0.09 * glow).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + accentRgb + ",0)");
        rvc.fillStyle = g;
        rvc.beginPath(); rvc.arc(cx, cy, R, 0, Math.PI * 2); rvc.fill();
      }
      const ringK = Math.min(1, k / 0.86);
      if (ringK < 1) {
        rvc.globalAlpha = Math.pow(1 - ringK, 1.8) * 0.42;
        rvc.strokeStyle = accent2;
        rvc.lineWidth = 2.4 - ringK * 1.7;
        rvc.beginPath(); rvc.arc(cx, cy, 20 + ringK * Math.min(W, H) * 0.52, 0, Math.PI * 2); rvc.stroke();
        rvc.globalAlpha = 1;
      }
      shards.forEach(s => {
        const rr = 26 + out * Math.min(W, H) * 0.46 * s.v;
        rvc.globalAlpha = Math.max(0, 1 - k) * (0.35 + 0.6 * s.roll);
        rvc.fillStyle = s.roll > 0.55 ? accent2 : hue;
        rvc.beginPath();
        rvc.arc(cx + Math.cos(s.ang) * rr, cy + Math.sin(s.ang) * rr, s.r, 0, Math.PI * 2);
        rvc.fill();
      });
      rvc.globalAlpha = 1;
      if (k < 1) requestAnimationFrame(frame);
      else { rvc.clearRect(0, 0, W, H); revealVeil.classList.remove("show"); }
    }
    requestAnimationFrame(frame);
  }
  function playRevealMoment() {
    if (reduced) { playChime(); return; }
    const P = window.__particles;
    if (P && P.warp) P.warp(); else if (P) P.burst();
    sfx("warp");                     // 迎面而来的一记风声，先于闷响
    // 闷响与冲击波压在星流最盛时（冲刺中段），落位后再散开铜铃
    setTimeout(() => { playImpactWave(); sfx("impact"); }, 300);
    setTimeout(playChime, 520);
  }
  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      soundOn = !soundOn;
      ensureAudio();                         // 在用户手势内创建/恢复 AudioContext
      soundToggle.textContent = soundOn ? t("soundOn") : t("soundOff");
      soundToggle.classList.toggle("is-on", soundOn);
      if (soundOn) sfx("tick");
    });
  }

  /* ============================================================
     背景音乐（BGM）：一首循环的轻音乐（D 大调 · 76 BPM · I–V–vi–IV）
     - 软电钢琶音 + 暖垫 + 轻低音 + 稀疏旋律，无低频 drone
     - 全部 Web Audio 合成，不引入音频文件；首次手势内启动
     - 揭晓结果时提亮并加一串高音星点，随后回到 ambient
     ============================================================ */
  let bgmOn = true, bgmStarted = false;
  let bgmGain = null, bgmDuck = null, bgmFilter = null, bgmLfo = null;
  let bgmTimer = null, bgmStopTimer = 0, bgmRevealTimer = 0;
  let bgmNextTime = 0, bgmStep = 0;
  const BGM_BPM = 76;
  const BGM_STEP = 60 / BGM_BPM / 2;          // 八分音符
  const BGM_STEPS = 128;                       // 16 小节（A/B 两段）一循环
  const BGM_LEVEL = 1.6;
  // 和弦：D – A/C# – Bm – G；每两小节一换
  const BGM_CHORDS = [
    { bass: 146.83, arp: [293.66, 369.99, 440.00, 587.33] },  // D
    { bass: 138.59, arp: [277.18, 329.63, 440.00, 554.37] },  // A/C#
    { bass: 123.47, arp: [293.66, 369.99, 493.88, 587.33] },  // Bm
    { bass: 98.00,  arp: [246.94, 293.66, 392.00, 493.88] }   // G
  ];
  const BGM_BARS = [0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 0, 0, 2, 2, 1, 1];
  const BGM_ARP = [0, 1, 2, 3, 2, 1, 2, -1];   // 上行再回落，末拍留白
  const BGM_ARP_VEL = [0.050, 0.028, 0.038, 0.030, 0.026, 0.032, 0.036, 0];
  // A 段：F# A E – D B G；B 段：B G F# – D F# E
  const BGM_MELODY = [739.99, 880.00, 659.25, 0, 587.33, 987.77, 783.99, 0,
                      987.77, 783.99, 739.99, 0, 587.33, 739.99, 659.25, 0];

  function startBgm() {
    const ac = ensureAudio();
    if (!ac) return;
    if (bgmStarted) {
      clearTimeout(bgmStopTimer);
      if (!bgmTimer) {
        bgmNextTime = ac.currentTime + 0.08;
        bgmTick(); bgmTimer = setInterval(bgmTick, 70);
      }
      bgmGain.gain.setTargetAtTime(BGM_LEVEL, ac.currentTime, 0.5);
      return;
    }
    bgmStarted = true;
    bgmGain = ac.createGain(); bgmGain.gain.value = 0.0001;
    bgmDuck = ac.createGain(); bgmDuck.gain.value = 1;
    bgmGain.connect(bgmDuck); bgmDuck.connect(masterBus);
    const wet = ac.createGain(); wet.gain.value = 0.16;
    bgmDuck.connect(wet); wet.connect(reverbSend);
    bgmGain.gain.linearRampToValueAtTime(BGM_LEVEL, ac.currentTime + 2.4);
    bgmFilter = ac.createBiquadFilter(); bgmFilter.type = "lowpass";
    bgmFilter.frequency.value = 6000; bgmFilter.Q.value = 0.35;
    bgmFilter.connect(bgmGain);
    bgmLfo = ac.createOscillator(); const lfoGain = ac.createGain();
    bgmLfo.frequency.value = 0.05; lfoGain.gain.value = 160;
    bgmLfo.connect(lfoGain); lfoGain.connect(bgmFilter.frequency); bgmLfo.start();
    bgmStep = 0;
    bgmNextTime = ac.currentTime + 0.08;
    bgmTick();
    bgmTimer = setInterval(bgmTick, 70);
  }
  // 前瞻调度：用音频时钟排音符，避免 setTimeout 抖动
  function bgmTick() {
    const ac = audioCtx;
    if (!ac || !bgmStarted) return;
    if (bgmNextTime < ac.currentTime - 0.2) bgmNextTime = ac.currentTime + 0.05;
    while (bgmNextTime < ac.currentTime + 0.2) {
      scheduleBgmStep(bgmStep, bgmNextTime);
      bgmStep = (bgmStep + 1) % BGM_STEPS;
      bgmNextTime += BGM_STEP;
    }
  }
  function scheduleBgmStep(step, t) {
    const bar = Math.floor(step / 8), pos = step % 8;
    const chord = BGM_CHORDS[BGM_BARS[bar]];
    const idx = BGM_ARP[pos];
    if (idx >= 0) {
      const sparkle = pos === 6 && bar % 2 === 1;
      const freq = sparkle ? chord.arp[3] * 2 : chord.arp[idx];
      const vel = (sparkle ? 0.02 : BGM_ARP_VEL[pos]) * (0.9 + Math.random() * 0.2);
      const swing = pos % 2 ? 0.018 : 0;      // 轻微摇摆，避免机械感
      bgmNote(freq, t + swing + (Math.random() - 0.5) * 0.012, vel,
        [-0.18, -0.05, 0.08, 0.2][idx] + (Math.random() - 0.5) * 0.06,
        freq > 600 ? 2.4 : 1.9);
    }
    if (pos === 0 || pos === 4) {
      bgmBass(chord.bass, t, pos === 0 ? 0.036 : 0.024);
    }
    if (pos === 2) {
      const mel = BGM_MELODY[bar];
      if (mel) bgmNote(mel, t + 0.01, 0.026, 0.16, 3.2);
    }
    if (pos === 4 && bar % 2 === 1) {
      bgmNote(chord.arp[3] * 2, t + 0.02, 0.012, -0.26, 2.2);
    }
  }
  // 软电钢音色：基频 + 轻二次谐波，短起音、长衰减
  function bgmNote(freq, t, vel, pan, decay) {
    const ac = audioCtx; if (!ac) return;
    const o = ac.createOscillator(); o.type = "triangle"; o.frequency.value = freq;
    const o2 = ac.createOscillator(); o2.type = "sine";
    o2.frequency.value = freq * 2; o2.detune.value = 4;
    const g2 = ac.createGain(); g2.gain.value = 0.12;
    const o3 = ac.createOscillator(); o3.type = "sine"; o3.frequency.value = freq * 3;
    const g3 = ac.createGain(); g3.gain.value = 0.05;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000; lp.Q.value = 0.5;
    const p = ac.createStereoPanner(); p.pan.value = Math.max(-0.8, Math.min(0.8, pan));
    o.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g);
    g.connect(lp); lp.connect(p); p.connect(bgmFilter);
    o.start(t); o2.start(t); o3.start(t);
    o.stop(t + decay + 0.05); o2.stop(t + decay + 0.05); o3.stop(t + decay + 0.05);
  }
  function bgmBass(freq, t, vel) {
    const ac = audioCtx; if (!ac) return;
    const o = ac.createOscillator(); o.type = "sine"; o.frequency.value = freq;
    const o2 = ac.createOscillator(); o2.type = "triangle"; o2.frequency.value = freq * 2;
    const g2 = ac.createGain(); g2.gain.value = 0.1;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);   // 收在下一颗贝斯之前，不叠成持续低床
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520; lp.Q.value = 0.4;
    o.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(lp); lp.connect(bgmFilter);
    o.start(t); o2.start(t); o.stop(t + 1.25); o2.stop(t + 1.25);
  }
  // 说明：原先的「暖垫」层（三个常驻振荡器 + 260~1500Hz 窄带）会形成一层持续的闷响床声，
  // 听感上就是背景里那阵「嗡嗡叫」。现已整层移除，只保留琶音 / 低音 / 旋律三条干净的声部。
  function duckBgm(factor) {
    if (bgmDuck && audioCtx) bgmDuck.gain.setTargetAtTime(factor, audioCtx.currentTime, 0.22);
  }
  function setBgmScene(scene) {
    if (!bgmStarted || !bgmOn || !audioCtx) return;
    const ac = audioCtx;
    bgmGain.gain.cancelScheduledValues(ac.currentTime);
    if (scene === "reveal") {
      bgmGain.gain.setTargetAtTime(2.3, ac.currentTime, 0.5);
      sfx("bell");
      [1174.66, 1760.00, 1479.98].forEach((f, i) => {
        bgmNote(f, ac.currentTime + 0.04 + i * 0.14, 0.019, i % 2 ? 0.3 : -0.3, 2.6);
      });
      clearTimeout(bgmRevealTimer);
      bgmRevealTimer = setTimeout(() => setBgmScene("ambient"), 4600);
    } else {
      bgmGain.gain.setTargetAtTime(BGM_LEVEL, ac.currentTime, 1.2);
    }
  }
  function bgmReveal() { if (bgmOn) setBgmScene("reveal"); }
  function stopBgm() {
    bgmOn = false;
    const ac = audioCtx;
    if (ac && bgmGain) bgmGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.35);
    clearInterval(bgmTimer); bgmTimer = null;
    clearTimeout(bgmRevealTimer);
    clearTimeout(bgmStopTimer);
    if (!bgmStarted) return;
    bgmStopTimer = setTimeout(() => {
      if (bgmOn) return;                    // 800ms 内又打开：保留声场
      if (bgmLfo) { try { bgmLfo.stop(); } catch (e) {} bgmLfo = null; }
      bgmStarted = false;
    }, 800);
  }
  // 首次用户手势内启动 BGM（满足浏览器自动播放策略）
  document.addEventListener("pointerdown", () => { if (bgmOn && !bgmStarted) startBgm(); }, { passive: true });

  if (bgmToggle) {
    bgmToggle.addEventListener("click", () => {
      bgmOn = !bgmOn;
      if (bgmOn) {
        ensureAudio();
        startBgm();
        if (bgmGain && audioCtx) bgmGain.gain.setTargetAtTime(BGM_LEVEL, audioCtx.currentTime, 0.4);
        bgmToggle.textContent = t("bgmOn");
      } else {
        stopBgm();
        bgmToggle.textContent = t("bgmOff");
      }
      bgmToggle.classList.toggle("is-on", bgmOn);
    });
  }
  if (langToggle) {
    langToggle.addEventListener("click", () => setLang(lang === "zh" ? "en" : "zh"));
  }

  // 语言切换时刷新当前屏的动态文案（静态部分由 applyLang 处理）
  function refreshDynamicLang() {
    const scr = state.screen;
    if (scr === "home") updateIdChip();
    if (scr === "reading" && readingLoading && !readingLoading.hidden && loadType) {
      if (rlDesc) rlDesc.textContent = t(LOAD_DESC[loadType] || "ldTarot");
      buildRitual(loadType, loadData);       // 星宿名 / 签号随语言重绘
      ritualStep(loadP, loadFinished);
      updateLoadElapsed();
      paintLore(false);
    }
    if (scr === "tarot") {
      if (tarotHint) tarotHint.textContent = tarotPicks.length === 3 ? t("tarotPicked3") : (tarotPicks.length ? t("tarotPickedN", [tarotPicks.length]) : t("tarotHintIdle"));
      if (dialCards.length) updateFocus();
      recolorCards();                 // 牌面重绘（牌名随语言变化）
    } else if (scr === "rune") {
      recolorCards();                 // 符石文字随语言变化
      refreshRuneLabels();
    } else if (scr === "gua") {
      if (guaHint && guaLines.length === 0) guaHint.textContent = t("guaHintIdle");
      refreshGuaName();
    } else if (scr === "mansion") {
      if (mNodes.length) updateMFocus();
      if (mansionHint && mChosen === null) mansionHint.textContent = t("mansionHintIdle");
    } else if (scr === "number") {
      if (numData) renderNumberResult();
    } else if (scr === "oracle") {
      updateOracleLabels();
    } else if (scr === "reading" && currentReading) {
      renderStage(currentReading.type, currentReading.data);
      renderReading(currentReading.r, currentReading.isLive, { instant: true });
      if (readingTitle) readingTitle.textContent = t(
        currentReading.type === "tarot" ? "rdTarot" : currentReading.type === "gua" ? "rdGua" : currentReading.type === "mansion" ? "rdMansion"
        : currentReading.type === "rune" ? "rdRune" : currentReading.type === "oracle" ? "rdOracle" : "rdNumber"
      );
    }
  }

  /* ============================================================
     塔罗模块（环形星盘）
     - 22 张主牌绕一圈排成可旋转星盘；
     - 顶部「选牌口」对准的牌即当前焦点（高亮 + 中心显示牌名）；
     - 鼠标拖动旋转；点击任意牌 / 点击选牌口 / 握拳手势 → 取该牌；
     - 取三张落入 过去 / 现在 / 未来。
     ============================================================ */
  buildBackURL();
  loadTarotImages();
  const dialWrap = document.getElementById("tarotDialWrap");
  const tarotDial = document.getElementById("tarotDial");
  const dialSelector = document.getElementById("dialSelector");
  const dialCenter = document.getElementById("dialCenter");
  const slots = document.getElementById("tarotSlots");
  const tarotReveal = document.getElementById("tarotReveal");
  const tarotShuffle = document.getElementById("tarotShuffle");
  const tarotReset = document.getElementById("tarotReset");
  const tarotHint = document.getElementById("tarotHint");
  const TAROT_COUNT = TAROT.length;            // 22 张主牌
  const DIAL_STEP = 360 / TAROT_COUNT;
  const DIAL_R = 130;
  let dialOrder = [];                          // dialOrder[i] = 第 i 个位置对应的 TAROT 索引
  let dialCards = [];                          // { el, inner, cv, idx, used }
  let tarotPicks = [];
  let dialAngle = 0, focusedIndex = 0;
  let dragging = false, dragStartX = 0, dragStartAngle = 0;
  let dialAnim = 0;
  let slideSeq = 0;

  function stopDialSlide() {
    if (dialAnim) cancelAnimationFrame(dialAnim);
    dialAnim = 0;
    dialWrap.classList.remove("sliding");
  }
  function focusIndexAt(angle) {
    let f = Math.round(-angle / DIAL_STEP) % TAROT_COUNT;
    if (f < 0) f += TAROT_COUNT;
    return f;
  }
  // 洗牌的手感：快速向左滑一段再缓停，而不是整盘瞬间换位
  function slideDial(target, duration) {
    stopDialSlide();
    const from = dialAngle;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setDialAngle(target); return; }
    dialWrap.classList.add("sliding");
    const t0 = performance.now();
    const ease = p => 1 - Math.pow(1 - p, 4);
    const tick = now => {
      const p = Math.min(1, (now - t0) / duration);
      setDialAngle(from + (target - from) * ease(p));
      if (p < 1) dialAnim = requestAnimationFrame(tick);
      else { dialAnim = 0; dialWrap.classList.remove("sliding"); setDialAngle(target); }
    };
    dialAnim = requestAnimationFrame(tick);
    // 后台标签页 rAF 停摆会让 dialAnim 永久卡死、无法取牌；到点强制落位（序号防止误杀新动画）
    const my = ++slideSeq;
    setTimeout(() => { if (slideSeq === my && dialAnim) { stopDialSlide(); setDialAngle(target); } }, duration + 150);
  }

  function resetTarot() {
    stopDialSlide();
    slots.innerHTML = ""; tarotPicks = [];
    if (!dialCards.length) buildDial();
    else { dialCards.forEach(c => c.used = false); syncDialUsed(); }
    updateTarotState();
  }

  function updateTarotState() {
    const n = tarotPicks.length;
    tarotReveal.disabled = n !== 3;
    tarotShuffle.disabled = n === 3;          // 三张已定，洗牌不再影响牌阵
    if (tarotReset) tarotReset.hidden = n === 0;
    if (tarotHint) tarotHint.textContent = n === 3 ? t("tarotPicked3") : n ? t("tarotPickedN", [n]) : t("tarotHintIdle");
  }

  function buildDial(keepPicked, angle) {
    stopDialSlide();
    const kept = keepPicked ? new Set(tarotPicks.map(p => p.idx)) : null;
    tarotDial.innerHTML = ""; dialCards = [];
    dialOrder = Array.from({ length: TAROT_COUNT }, (_, i) => i);
    for (let i = dialOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = dialOrder[i]; dialOrder[i] = dialOrder[j]; dialOrder[j] = t;
    }
    for (let i = 0; i < TAROT_COUNT; i++) {
      const ti = dialOrder[i];
      const card = document.createElement("div");
      card.className = "dial-card";
      const inner = document.createElement("div");
      inner.className = "dial-card-inner";
      const cv = document.createElement("canvas");
      const dpr = tarotDPR();
      cv.width = Math.round(172 * dpr); cv.height = Math.round(260 * dpr); cv.dataset.idx = ti;
      // 直接按画布实际像素绘制，Retina 屏下轮盘牌面不再发虚
      drawCardFace(cv.getContext("2d"), cv.width, cv.height, ti, tarotName(ti));
      inner.appendChild(cv);
      card.appendChild(inner);
      card.addEventListener("click", () => pickCardByIndex(i));
      tarotDial.appendChild(card);
      dialCards.push({ el: card, inner, cv, idx: ti, used: kept ? kept.has(ti) : false });
    }
    syncDialUsed();
    setDialAngle(typeof angle === "number" ? angle : 0);
    updateFocus();
  }

  function setDialAngle(a) {
    dialAngle = a;
    const f = focusIndexAt(a);
    if (f !== focusedIndex) { focusedIndex = f; updateFocus(); }
    renderDial();
  }
  // 星盘弧线：中心牌最低、最大、最亮，两侧沿弧线向上抬起并后退，像一只托住中心牌的星盘
  function renderDial() {
    const frac = -dialAngle / DIAL_STEP;
    const sp = Math.min(118, (tarotDial.clientWidth || 760) / 6.1);   // 卡距，窄屏自适应
    const wrapH = tarotDial.clientHeight || 330;
    const baseY = wrapH * 0.10;        // 整体下沉，给顶部「选牌口」留出呼吸
    const arcLift = wrapH * 0.13;      // 两侧沿弧线抬升的高度
    for (let i = 0; i < TAROT_COUNT; i++) {
      const c = dialCards[i];
      if (!c) continue;
      let off = (i - frac) % TAROT_COUNT;
      if (off > TAROT_COUNT / 2) off -= TAROT_COUNT;
      if (off < -TAROT_COUNT / 2) off += TAROT_COUNT;
      const a = Math.abs(off);
      if (a > 5.5) { c.el.style.visibility = "hidden"; continue; }
      c.el.style.visibility = "visible";
      const x = off * sp;
      const scale = Math.max(0.5, 1 - a * 0.085);
      const rotY = Math.max(-36, Math.min(36, -off * 20));
      const arc = Math.pow(Math.min(a, 5) / 5, 1.25);   // 0（中心）→ 1（最外侧）
      const y = baseY - arcLift * arc;
      const rotZ = Math.max(-8, Math.min(8, -off * 2.4));
      const op = a <= 1 ? 1 : Math.max(0, 1 - (a - 1) * 0.28);
      c.el.style.transform =
        "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) " +
        "rotateZ(" + rotZ.toFixed(2) + "deg) rotateY(" + rotY.toFixed(1) + "deg) scale(" + scale.toFixed(3) + ")";
      c.el.style.opacity = op;
      c.el.style.zIndex = String(100 - Math.round(a * 10));
      c.el.style.filter = a <= 0.5 ? "none" : "brightness(" + Math.max(0.45, 1 - a * 0.15) + ")";
    }
  }
  function updateFocus() {
    dialCards.forEach((c, i) => c.el.classList.toggle("focus", i === focusedIndex));
    const ti = dialCards[focusedIndex] ? dialCards[focusedIndex].idx : 0;
    dialCenter.textContent = tarotName(ti);
  }
  function syncDialUsed() {
    dialCards.forEach(c => c.el.classList.toggle("used", c.used));
  }
  function pickCardByIndex(i) {
    const c = dialCards[i];
    if (!c || dialAnim) return;
    if (tarotPicks.length >= 3) return;
    if (c.used) {
      if (tarotHint) tarotHint.textContent = t("tarotUsed");
      return;
    }
    sfx("card");
    c.used = true; syncDialUsed();
    const ti = c.idx;
    const orient = Math.random() < 0.22 ? "逆" : "正";
    tarotPicks.push({ idx: ti, name: TAROT[ti][0], orient });
    placeInSlot(tarotPicks.length - 1, ti, orient);
    if (window.__particles) window.__particles.collapse();
    setTimeout(() => { if (window.__particles) window.__particles.expand(); }, 200);
    updateTarotState();
    // 取走当前牌后把星盘转一格，让选牌口落在下一张未取的牌上
    for (let step = 1; step <= TAROT_COUNT; step++) {
      const j = (i + step) % TAROT_COUNT;
      if (!dialCards[j].used) { setDialAngle(dialAngle - step * DIAL_STEP); break; }
    }
  }
  function confirmPick() { pickCardByIndex(focusedIndex); }   // 供手势 / 选牌口调用
  function placeInSlot(slot, ti, orient) {
    const card = document.createElement("div");
    card.className = "tarot-card";
    const back = document.createElement("div");
    back.className = "back";
    back.style.backgroundImage = "url(" + BACK_URL + ")"; back.style.backgroundSize = "cover";
    const face = document.createElement("div");
    face.className = "face";
    const cv = document.createElement("canvas");
    cv.width = 240; cv.height = 366;
    cv.dataset.idx = ti; cv.dataset.name = tarotName(ti);
    drawCardFace(cv.getContext("2d"), 240, 366, ti, tarotName(ti));
    face.appendChild(cv);
    const meta = document.createElement("div");
    meta.className = "face-meta";
    meta.innerHTML = '<div class="pos">' + posName(slot) + '</div>' +
      '<div class="orient">' + (orient === "逆" ? t("orientRev") : t("orientUp")) + "</div>";
    face.appendChild(meta);
    card.appendChild(back); card.appendChild(face);
    slots.appendChild(card);
    setTimeout(() => card.classList.add("flip"), 260);
  }

  // 拖动横移（封面流）
  dialWrap.addEventListener("pointerdown", e => {
    if (dialAnim) return;
    dragging = true; dialWrap.classList.add("dragging"); dragStartX = e.clientX; dragStartAngle = dialAngle;
  });
  dialWrap.addEventListener("pointermove", e => { if (dragging) setDialAngle(dragStartAngle + (e.clientX - dragStartX) * 0.6); });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false; dialWrap.classList.remove("dragging");
    setDialAngle(Math.round(dialAngle / DIAL_STEP) * DIAL_STEP);
  };
  dialWrap.addEventListener("pointerup", endDrag);
  dialWrap.addEventListener("pointercancel", endDrag);
  dialSelector.addEventListener("click", confirmPick);

  tarotShuffle.addEventListener("click", () => {
    if (tarotPicks.length >= 3 || dialAnim) return;
    sfx("shuffle");
    const from = dialAngle;
    buildDial(true, from);       // 只重排未取的牌，已选牌保留
    // 向左甩 6-9 格后缓停；落点避开已取走的牌
    let end = from - (6 + Math.floor(Math.random() * 4)) * DIAL_STEP;
    const f = focusIndexAt(end);
    if (dialCards[f] && dialCards[f].used) {
      for (let s = 1; s <= TAROT_COUNT; s++) {
        const j = (f + s) % TAROT_COUNT;
        if (!dialCards[j].used) { end -= s * DIAL_STEP; break; }
      }
    }
    slideDial(end, 820);
    updateTarotState();
    if (tarotPicks.length && tarotHint) tarotHint.textContent = t("tarotShuffledKept", [tarotPicks.length]);
  });
  tarotReset.addEventListener("click", () => {
    sfx("shuffle");
    stopDialSlide();
    slots.innerHTML = ""; tarotPicks = [];
    buildDial(false);
    updateTarotState();
  });
  tarotReveal.addEventListener("click", () => {
    if (tarotPicks.length !== 3) return;
    showReading("tarot", { cards: tarotPicks });
  });

  /* ============================================================
     六爻模块 · 起卦法阵
     ============================================================ */
  const hexWrap = document.getElementById("hexWrap");
  const guaToss = document.getElementById("guaToss");
  const guaReveal = document.getElementById("guaReveal");
  const guaStage = document.getElementById("guaStage");
  const guaArray = document.getElementById("guaArray");
  const guaName = document.getElementById("guaName");
  const guaHint = document.getElementById("guaHint");
  const guaCoins = document.getElementById("guaCoins");
  const guaCount = document.getElementById("guaCount");
  const guaTris = document.getElementById("guaTris");
  const gctx = guaArray ? guaArray.getContext("2d") : null;
  let guaLines = [];
  let guaTossTimer = null;
  let guaBaseIdx = null, guaChangeIdx = null;
  const GUA_IDX_ZH = ["初", "二", "三", "四", "五", "上"];
  function guaIdxName(i) { return lang === "en" ? String(i + 1) : GUA_IDX_ZH[i]; }
  const guaAnim = { active: false, angle: 0, locked: false, lines: [], raf: null };

  function guaIndices(lines) {
    let base = 0, change = 0;
    lines.forEach((v, i) => { if (v === 7 || v === 9) base += 1 << i; });
    lines.forEach((v, i) => {
      const c = v === 6 ? 7 : v === 9 ? 8 : v;
      if (c === 7) change += 1 << i;
    });
    return { base, change };
  }
  function setGuaCount(n) {
    if (!guaCount) return;
    guaCount.innerHTML = "<b>" + n + "</b><span> / 6</span>";
  }
  function renderGuaSlots() {
    hexWrap.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const y = document.createElement("div");
      y.className = "yao ghost";
      const idx = document.createElement("span");
      idx.className = "idx";
      idx.textContent = guaIdxName(i);
      y.appendChild(idx);
      hexWrap.appendChild(y);
    }
  }
  function renderGuaTris(base) {
    if (!guaTris) return;
    guaTris.innerHTML = "";
    if (base == null) return;
    const lower = TRI[base & 7], upper = TRI[(base >> 3) & 7];
    [[upper, "triUpper"], [lower, "triLower"]].forEach(([tri, label]) => {
      const chip = document.createElement("span");
      chip.className = "gua-tri";
      const em = document.createElement("img");
      em.className = "gua-tri-emblem";
      em.src = "assets/gua/" + tri.code + ".webp";
      em.alt = "";
      const txt = document.createElement("span");
      txt.className = "gua-tri-txt";
      const cap = document.createElement("i");
      cap.textContent = t(label);
      const nm = document.createElement("b");
      nm.textContent = triName(tri);
      txt.appendChild(cap); txt.appendChild(nm);
      chip.appendChild(em); chip.appendChild(txt);
      guaTris.appendChild(chip);
    });
  }
  function refreshGuaName() {
    if (!guaName) return;
    if (guaBaseIdx == null) {
      guaName.innerHTML = '<span class="gua-idle">' + esc(t("guaIdle")) + "</span>";
      renderGuaTris(null);
      return;
    }
    guaName.innerHTML = guaName_html(guaBaseIdx, guaChangeIdx);
    renderGuaTris(guaBaseIdx);
  }
  function settleYao(el) {
    // 动画若被后台标签页冻结会停在隐藏起始帧，超时后强制落到终态
    setTimeout(() => el.classList.add("settled"), 640);
  }
  function setGuaLine(i, v) {
    const ghost = hexWrap.children[i];
    if (!ghost) return;
    const yang = (v === 7 || v === 9), old = (v === 6 || v === 9);
    const y = document.createElement("div");
    y.className = "yao" + (yang ? "" : " yin") + (old ? " old" : "");
    const idx = document.createElement("span");
    idx.className = "idx";
    idx.textContent = guaIdxName(i);
    y.appendChild(idx);
    if (old) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = v === 6 ? "×" : "○";
      y.appendChild(tag);
    }
    hexWrap.replaceChild(y, ghost);
    settleYao(y);
  }
  function flipCoins() {
    if (!guaCoins) return;
    guaCoins.classList.remove("casting");
    void guaCoins.offsetWidth;               // 强制回流，连点时也能重新触发翻转
    guaCoins.classList.add("casting");
  }

  function drawGuaArray() {
    if (!gctx) return;
    const W = 360, H = 360, cx = W / 2, cy = H / 2;
    gctx.clearRect(0, 0, W, H);
    const rgb = cssVar("--accent-rgb") || "124,140,255";
    const accent = cssVar("--accent") || "#7C8CFF";
    const accent2 = cssVar("--accent-2") || "#A970FF";
    gctx.save();
    gctx.translate(cx, cy);
    // 三层法阵环
    gctx.strokeStyle = "rgba(" + rgb + ",0.5)"; gctx.lineWidth = 1.5;
    [150, 120, 92].forEach(r => { gctx.beginPath(); gctx.arc(0, 0, r, 0, Math.PI * 2); gctx.stroke(); });
    // 外环刻度（缓慢旋转）
    gctx.save(); gctx.rotate(guaAnim.angle * 0.6);
    gctx.strokeStyle = "rgba(" + rgb + ",0.7)"; gctx.lineWidth = 1;
    const N = 36;
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2;
      const r1 = 132, r2 = i % 3 === 0 ? 150 : 142;
      gctx.beginPath();
      gctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      gctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      gctx.stroke();
    }
    gctx.restore();
    // 内圈符点（反向旋转）
    gctx.save(); gctx.rotate(-guaAnim.angle * 1.4);
    gctx.strokeStyle = accent2; gctx.globalAlpha = 0.6; gctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      gctx.beginPath(); gctx.arc(Math.cos(a) * 70, Math.sin(a) * 70, 6, 0, Math.PI * 2); gctx.stroke();
    }
    gctx.restore();
    // 已掷爻：在中环点亮节点
    gctx.globalAlpha = 1;
    guaAnim.lines.forEach((v, i) => {
      const a = -Math.PI / 2 + i / 6 * Math.PI * 2;
      const yang = (v === 7 || v === 9);
      gctx.fillStyle = yang ? accent : accent2;
      gctx.shadowColor = yang ? accent : accent2; gctx.shadowBlur = 14;
      gctx.beginPath(); gctx.arc(Math.cos(a) * 104, Math.sin(a) * 104, 6, 0, Math.PI * 2); gctx.fill();
    });
    gctx.shadowBlur = 0;
    // 锁定：中心辉光核
    if (guaAnim.locked) {
      gctx.shadowColor = accent; gctx.shadowBlur = 30; gctx.fillStyle = "rgba(" + rgb + ",0.95)";
      gctx.beginPath(); gctx.arc(0, 0, 9, 0, Math.PI * 2); gctx.fill(); gctx.shadowBlur = 0;
    }
    gctx.restore();
  }
  function startGuaAnim() {
    if (reduced) { drawGuaArray(); return; }
    if (guaAnim.raf) cancelAnimationFrame(guaAnim.raf);
    guaAnim.active = true;
    const loop = () => {
      if (!guaAnim.active) return;
      guaAnim.angle += guaAnim.locked ? 0.002 : 0.013;
      drawGuaArray();
      guaAnim.raf = requestAnimationFrame(loop);
    };
    loop();
  }
  function stopGuaAnim() {
    guaAnim.active = false;
    if (guaAnim.raf) cancelAnimationFrame(guaAnim.raf);
    guaAnim.raf = null;
  }
  function guaName_html(base, change) {
    const kw = guaKingWen(base), kc = guaKingWen(change);
    const b = guaFullName(kw), c = guaFullName(kc);
    return b + " <small>" + t("hexInfo", [kw + 1, c]) + "</small>";
  }
  function resetGua() {
    renderGuaSlots();
    guaLines = []; guaBaseIdx = null; guaChangeIdx = null;
    guaReveal.disabled = true;
    guaAnim.locked = false; guaAnim.lines = []; guaAnim.angle = 0;
    if (guaCoins) guaCoins.classList.remove("casting");
    setGuaCount(0);
    refreshGuaName();
    if (guaHint) guaHint.textContent = t("guaHintIdle");
    drawGuaArray();
  }
  guaToss.addEventListener("click", () => {
    clearInterval(guaTossTimer);                 // 连点时重新起卦，避免多个计时器叠加
    renderGuaSlots();
    guaLines = []; guaAnim.lines = []; guaAnim.locked = false;
    guaBaseIdx = null; guaChangeIdx = null;
    guaReveal.disabled = true;
    setGuaCount(0);
    refreshGuaName();
    if (guaHint) guaHint.textContent = t("guaCasting");
    let i = 0;
    guaTossTimer = setInterval(() => {
      const heads = (Math.random() < 0.5 ? 1 : 0) + (Math.random() < 0.5 ? 1 : 0) + (Math.random() < 0.5 ? 1 : 0);
      // heads: 0→老阴(6) 1→少阴(8) 2→少阳(7) 3→老阳(9)
      const v = heads === 0 ? 6 : heads === 1 ? 8 : heads === 2 ? 7 : 9;
      flipCoins();
      sfx("coin");
      guaLines.push(v); guaAnim.lines.push(v); // 自下而上，appendChild 在 column-reverse 下自底向上
      setGuaLine(i, v);
      setGuaCount(i + 1);
      i++;
      if (window.__particles) window.__particles.collapse();
      if (i >= 6) {
        clearInterval(guaTossTimer); guaTossTimer = null;
        guaAnim.locked = true;
        const gi = guaIndices(guaLines);
        guaBaseIdx = gi.base; guaChangeIdx = gi.change;
        refreshGuaName();
        if (guaHint) guaHint.textContent = t("guaDone");
        setTimeout(() => { if (window.__particles) window.__particles.expand(); }, 200);
        guaReveal.disabled = false;
      }
    }, 360);
  });
  guaReveal.addEventListener("click", () => {
    if (guaLines.length !== 6) return;
    const gi = guaIndices(guaLines);
    guaBaseIdx = gi.base; guaChangeIdx = gi.change;
    guaAnim.locked = true;
    refreshGuaName();
    const kw = guaKingWen(gi.base), kc = guaKingWen(gi.change);
    showReading("gua", Object.assign({ name: guaFullName(kw), guaIndex: kw + 1, changeName: guaFullName(kc), changeIdx: kc, lines: guaLines.slice() }, readQuestion("gua")));
  });

  /* ============================================================
     灵数模块
     ============================================================ */
  const numInput = document.getElementById("numInput");
  const numGen = document.getElementById("numGen");
  const numResult = document.getElementById("numResult");
  const numReveal = document.getElementById("numReveal");
  const numQuick = document.getElementById("numQuick");
  const numRandom = document.getElementById("numRandom");
  let numData = null;
  function resetNumber() { numResult.textContent = ""; numReveal.disabled = true; numData = null; }

  function renderNumberResult() {
    if (!numData || !numResult) return;
    const raw = numData.raw, s = numData.symbolIdx;
    const sum = raw.split("").reduce((a, b) => a + Number(b), 0);
    ensureNumImg(s);
    numResult.innerHTML = "";
    const card = document.createElement("div"); card.className = "num-card";
    const wrap = document.createElement("div"); wrap.className = "num-mandala-wrap";
    wrap.appendChild(drawNumMandala(raw, s));
    const meta = document.createElement("div"); meta.className = "num-meta";
    const sym = document.createElement("div"); sym.className = "num-symbol"; sym.textContent = numSymbol(s);
    const theme = document.createElement("div"); theme.className = "num-theme"; theme.textContent = numThemeStr(s);
    const gloss = document.createElement("div"); gloss.className = "num-gloss"; gloss.textContent = numGlossStr(s);
    const facts = document.createElement("div"); facts.className = "num-facts";
    const f1 = document.createElement("span"); f1.className = "num-fact"; f1.textContent = t("numSum", [sum]);
    const f2 = document.createElement("span"); f2.className = "num-fact"; f2.textContent = t("numRoot", [s + 1]);
    facts.appendChild(f1); facts.appendChild(f2);
    const rawEl = document.createElement("div"); rawEl.className = "num-raw";
    rawEl.textContent = raw.split("").join(" + ") + " = " + sum;
    meta.appendChild(sym); meta.appendChild(theme); meta.appendChild(gloss); meta.appendChild(facts); meta.appendChild(rawEl);
    card.appendChild(wrap); card.appendChild(meta);
    numResult.appendChild(card);
    setTimeout(() => card.classList.add("settled"), 700);
  }

  // 主题切换时补绘其他模块的程序化画面（此刻各模块状态已初始化）
  window.__redrawDivination = function () {
    if (guaLines.length) drawGuaArray();
    if (numData) renderNumberResult();
  };

  if (numQuick) {
    const pad = n => String(n).padStart(2, "0");
    const now = new Date();
    const todayChip = numQuick.querySelector('[data-fill="today"]');
    if (todayChip) todayChip.dataset.fill = "" + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
    numQuick.addEventListener("click", e => {
      const btn = e.target.closest(".num-chip");
      if (!btn || btn.classList.contains("num-chip-rand")) return;
      numInput.value = btn.dataset.fill || "";
      sfx("tick");
      numInput.focus();
      numInput.select();
    });
  }
  numInput.addEventListener("input", () => {
    const raw = (numInput.value || "").replace(/\D/g, "").slice(0, 9);
    if (numData && raw !== numData.raw) {
      numData = null; numResult.innerHTML = ""; numReveal.disabled = true;
    }
  });

  // 对称灵数曼陀罗：有生成徽记时以徽记为主视觉，逐位数字化作外圈刻度；缺失时回退程序化花瓣
  function drawNumMandala(raw, s) {
    const S = 300;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cv = document.createElement("canvas");
    cv.width = S * dpr; cv.height = S * dpr;
    cv.style.width = S + "px"; cv.style.height = S + "px";
    cv.style.borderRadius = "50%";
    cv.dataset.mandala = "1";
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", numSymbol(s) + " · " + numThemeStr(s));
    const ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    const cx = S / 2, cy = S / 2;
    const bg0 = cssVar("--bg-0") || "#05060B", bg1 = cssVar("--bg-1") || "#0B0E1A";
    const accent = cssVar("--accent") || "#7C8CFF", accent2 = cssVar("--accent-2") || "#A970FF";
    const day = document.documentElement.getAttribute("data-theme") === "day";
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, S / 2);
    g.addColorStop(0, bg1); g.addColorStop(1, bg0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    const digits = raw.split("").map(Number);

    if (numImgReady(s)) {
      const R = 140;
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#04050A"; ctx.fillRect(0, 0, S, S);
      ctx.filter = day ? "saturate(.80) brightness(1.08) contrast(1.04)" : "saturate(1.03)";
      ctx.drawImage(NUM_IMG[s], 0, 0, S, S);
      ctx.filter = "none";
      // 边缘压暗 + 极淡主题色洗，和站点配色统一
      const wash = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
      wash.addColorStop(0, day ? "rgba(123,98,201,0.05)" : "rgba(124,140,255,0.05)");
      wash.addColorStop(0.7, "rgba(0,0,0,0)");
      wash.addColorStop(1, day ? "rgba(250,247,242,0.16)" : "rgba(5,6,11,0.62)");
      ctx.fillStyle = wash; ctx.fillRect(0, 0, S, S);
      ctx.restore();

      ctx.strokeStyle = day ? "rgba(43,37,64,.22)" : "rgba(200,212,255,.26)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R + 0.5, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = day ? "rgba(43,37,64,.10)" : "rgba(200,212,255,.10)";
      ctx.beginPath(); ctx.arc(cx, cy, R + 6.5, 0, Math.PI * 2); ctx.stroke();

      // 逐位刻度：数字越大刻度越长，绕徽记一圈
      ctx.save(); ctx.translate(cx, cy);
      digits.forEach((d, i) => {
        const a = -Math.PI / 2 + i / Math.max(digits.length, 1) * Math.PI * 2;
        const len = 3 + d * 1.1;
        ctx.strokeStyle = i % 2 ? accent2 : accent;
        ctx.globalAlpha = 0.52 + d * 0.025;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (R + 2), Math.sin(a) * (R + 2));
        ctx.lineTo(Math.cos(a) * (R + 2 + len), Math.sin(a) * (R + 2 + len));
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.restore();
      return cv;
    }

    const N = 6 + (digits.length % 6);   // 对称阶数随位数变化
    // 同心环
    ctx.strokeStyle = "rgba(124,140,255,0.16)"; ctx.lineWidth = 1;
    for (let r = 22; r < S / 2; r += 18) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
    // 花瓣层（每阶旋转，逐位叠加）
    ctx.save(); ctx.translate(cx, cy);
    for (let k = 0; k < N; k++) {
      ctx.save(); ctx.rotate(k / N * Math.PI * 2);
      digits.forEach((d, i) => {
        const rr = 28 + i * 20 + d * 2.4;
        ctx.fillStyle = i % 2 ? accent2 : accent;
        ctx.globalAlpha = 0.42 + 0.045 * d;
        ctx.beginPath();
        ctx.ellipse(0, -rr, 4.5 + d * 1.4, 11 + d * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        // 连线，强化“曼陀罗”网感
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = i % 2 ? accent : accent2; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -rr - (11 + d * 1.8)); ctx.stroke();
      });
      ctx.restore();
    }
    ctx.restore();
    // 中心符文
    ctx.save(); ctx.translate(cx, cy); ctx.shadowColor = accent2; ctx.shadowBlur = 24;
    ctx.fillStyle = accent2; ctx.font = "500 70px Georgia, 'Noto Serif SC', serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(numSymbol(s), 0, 2); ctx.restore();
    return cv;
  }

  function runNumber() {
    const raw = (numInput.value || "").replace(/\D/g, "").slice(0, 9);
    if (!raw) {
      numResult.innerHTML = "";
      const empty = document.createElement("div");
      empty.className = "num-empty";
      empty.textContent = t("numEmpty");
      numResult.appendChild(empty);
      numData = null; numReveal.disabled = true;
      return;
    }
    sfx("whoosh");
    if (window.__particles) window.__particles.collapse();
    setTimeout(() => { if (window.__particles) window.__particles.expand(); }, 360);
    const s = raw.split("").reduce((a, b) => a + Number(b), 0) % NUMBER_SYMBOLS.length;
    numData = { raw, symbol: numSymbol(s), theme: numThemeStr(s), symbolIdx: s, themeIdx: s };
    renderNumberResult();
    numReveal.disabled = false;
    requestAnimationFrame(revealNumResult);
  }
  // 印记生成后若落在视口之外，滚到能同时看见印记与「查看解读」的位置
  function revealNumResult() {
    const scroller = numResult.closest(".screen");
    if (!scroller) return;
    const box = scroller.getBoundingClientRect();
    const card = numResult.getBoundingClientRect();
    const actions = numReveal.closest(".actions");
    const bottom = Math.max(card.bottom, actions ? actions.getBoundingClientRect().bottom : card.bottom);
    const overflow = bottom - box.bottom;
    if (overflow <= 0) return;
    const top = Math.max(0, Math.min(scroller.scrollTop + overflow + 24, scroller.scrollHeight - scroller.clientHeight));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { scroller.scrollTop = top; return; }
    // 自己走缓动：原生 smooth 在无合成帧的环境里会直接不动
    const from = scroller.scrollTop, dist = top - from, t0 = performance.now(), ms = 520;
    const step = now => {
      const p = Math.min(1, (now - t0) / ms);
      scroller.scrollTop = from + dist * (1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  numGen.addEventListener("click", runNumber);
  numInput.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); runNumber(); }
  });
  if (numRandom) numRandom.addEventListener("click", () => {
    const len = 6 + Math.floor(Math.random() * 3);
    let s = String(1 + Math.floor(Math.random() * 9));
    for (let i = 1; i < len; i++) s += Math.floor(Math.random() * 10);
    numInput.value = s;
    sfx("tick");
    runNumber();
  });
  numReveal.addEventListener("click", () => { if (numData) showReading("number", numData); });

  /* ============================================================
     二十八宿模块 · 星野指引（环形星环，复用环形星盘机制）
     ============================================================ */
  const mansionStage = document.getElementById("mansionStage");
  const mansionRing = document.getElementById("mansionRing");
  const mansionCenter = document.getElementById("mansionCenter");
  const mansionSelector = document.getElementById("mansionSelector");
  const mansionSpin = document.getElementById("mansionSpin");
  const mansionPick = document.getElementById("mansionPick");
  const mansionHint = document.getElementById("mansionHint");
  const mansionCaption = document.getElementById("mansionCaption");
  const MANSION_COUNT = MANSION.length;        // 28
  const MSTEP = 360 / MANSION_COUNT;
  const MR_RATIO = 130 / 320;
  function mansionRadius() {
    return Math.round((mansionStage.clientWidth || 320) * MR_RATIO);
  }
  let mLblOff = 22;                       // 宿名径向偏移，实际值从 CSS 变量 --lbl-off 读取
  function measureMansionLabel() {
    if (!mNodes.length) return;
    const v = parseFloat(getComputedStyle(mNodes[0]).getPropertyValue("--lbl-off"));
    if (v) mLblOff = v;
  }
  // 宿名变换：先沿半径朝外推 mLblOff，再反向补偿环角让文字始终正立
  function mansionLabelTransform(i, a) {
    return "translate(-50%,-50%) translateY(-" + mLblOff + "px) rotate(" + (-(i * MSTEP) - a) + "deg)";
  }
  let mNodes = [], mFocus = 0, mAngle = 0, mChosen = null, mDragging = false, mStartX = 0, mStartA = 0, mSpinning = false;

  // 四象星野：四段弧 + 28 颗星点 + 同宿连线
  function drawMansionSky() {
    const cv = document.getElementById("mansionSky");
    if (!cv) return;
    const S = mansionStage.clientWidth || 320;
    const k = S / 320;
    const dpr = 2;
    if (cv.width !== S * dpr) { cv.width = S * dpr; cv.height = S * dpr; }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);
    const cx = S / 2, cy = S / 2;
    // 星点/连线对齐 DOM 交互星环（此前固定 146k 会撞上宿名文字圈）
    const R = mansionRadius();
    const rgb = cssVar("--accent-rgb") || "124,140,255";
    const day = document.documentElement.getAttribute("data-theme") === "day";
    const QC = day
      ? ["#2E9C8C", "#5B6BD6", "#8A7A4A", "#C05A64"]
      : ["#5FD0C0", "#7C8CFF", "#DCE2FF", "#FF8F9C"];
    const glow = ctx.createRadialGradient(cx, cy, 8 * k, cx, cy, 118 * k);
    glow.addColorStop(0, "rgba(" + rgb + ",0.11)");
    glow.addColorStop(1, "rgba(" + rgb + ",0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, 118 * k, 0, Math.PI * 2); ctx.fill();
    const sweep = Math.PI * 2 / 4;
    ctx.lineWidth = 2 * k;
    for (let q = 0; q < 4; q++) {
      ctx.strokeStyle = QC[q];
      ctx.globalAlpha = day ? 0.45 : 0.38;
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2 + q * sweep + 0.07, -Math.PI / 2 + (q + 1) * sweep - 0.07);
      ctx.stroke();
    }
    const step = Math.PI * 2 / 28;
    for (let i = 0; i < 28; i++) {
      const a = -Math.PI / 2 + i * step, q = Math.floor(i / 7);
      ctx.fillStyle = QC[q];
      ctx.globalAlpha = i % 7 === 0 ? 0.95 : 0.45;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, (i % 7 === 0 ? 2.2 : 1.3) * k, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineWidth = 1 * k;
    for (let g = 0; g < 4; g++) {
      ctx.strokeStyle = QC[g]; ctx.globalAlpha = day ? 0.18 : 0.22;
      ctx.beginPath();
      for (let k2 = 0; k2 < 7; k2++) {
        const a = -Math.PI / 2 + (g * 7 + k2) * step;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        if (k2 === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(" + rgb + ",0.35)"; ctx.globalAlpha = 0.55;
    for (let q = 0; q < 4; q++) {
      const a = -Math.PI / 2 + q * sweep;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (R - 7 * k), cy + Math.sin(a) * (R - 7 * k));
      ctx.lineTo(cx + Math.cos(a) * (R + 6 * k), cy + Math.sin(a) * (R + 6 * k));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function setMansionLabels() {
    mNodes.forEach((n, i) => {
      const lbl = n.querySelector(".lbl");
      if (!lbl) return;
      lbl.textContent = lang === "en" ? MANSION[i].ce : MANSION[i].c;
      lbl.style.transform = mansionLabelTransform(i, mAngle);
    });
  }
  function buildMansion() {
    if (mNodes.length) return;
    mansionRing.innerHTML = "";
    const radius = mansionRadius();
    for (let i = 0; i < MANSION_COUNT; i++) {
      const nd = document.createElement("div");
      nd.className = "mansion-node";
      nd.style.transform = "rotate(" + (i * MSTEP) + "deg) translateY(-" + radius + "px)";
      const dot = document.createElement("div"); dot.className = "dot";
      const lbl = document.createElement("div"); lbl.className = "lbl";
      nd.appendChild(dot); nd.appendChild(lbl);
      nd.addEventListener("click", () => chooseMansion(i));
      mansionRing.appendChild(nd);
      mNodes.push(nd);
    }
    measureMansionLabel();
    drawMansionSky();
    setMAngle(0);
    setMansionLabels();
  }
  function setMAngle(a) {
    mAngle = a;
    mansionRing.style.transform = "rotate(" + a + "deg)";
    mNodes.forEach((n, i) => {
      const lbl = n.querySelector(".lbl");
      if (lbl) lbl.style.transform = mansionLabelTransform(i, a);
    });
    let f = Math.round(-a / MSTEP) % MANSION_COUNT;
    if (f < 0) f += MANSION_COUNT;
    if (f !== mFocus) { mFocus = f; updateMFocus(); }
  }
  function updateMFocus() {
    const m = MANSION[mFocus];
    setMansionLabels();
    mNodes.forEach((n, i) => n.classList.toggle("focus", i === mFocus));
    if (mansionCenter) {
      const q = Math.floor(mFocus / 7);
      mansionCenter.classList.remove("q0", "q1", "q2", "q3");
      mansionCenter.classList.add("q" + q);
      const name = mansionCenter.querySelector(".mc-name");
      const meta = mansionCenter.querySelector(".mc-meta");
      const beast = mansionBeast(mFocus);
      if (name) name.textContent = lang === "en" ? m.ce : m.c;
      if (meta) meta.textContent = lang === "en" ? (beast.en + " · " + m.ee + " · " + m.be) : (beast.zh + " · " + m.e + " · " + m.b);
    }
    if (mansionCaption) mansionCaption.textContent = mansionImg(m);
  }
  function chooseMansion(i) {
    if (mSpinning || mChosen !== null) return;
    sfx("tick");
    mChosen = i;
    mFocus = i;
    updateMFocus();
    mNodes.forEach((n, k) => n.classList.toggle("chosen", k === i));
    if (mansionCenter) mansionCenter.classList.add("chosen");
    mansionPick.disabled = false;
    if (mansionHint) mansionHint.textContent = t("mansionChosen", [mansionFull(MANSION[i])]);
  }
  function resetMansion() {
    mNodes = [];
    mChosen = null; mFocus = 0; mAngle = 0; mDragging = false; mSpinning = false;
    if (mansionCenter) mansionCenter.classList.remove("chosen");
    mansionPick.disabled = true;
    mansionRing.innerHTML = "";
    buildMansion();
    updateMFocus();
    if (mansionHint) mansionHint.textContent = t("mansionHintIdle");
  }
  mansionStage.addEventListener("pointerdown", e => {
    if (mChosen !== null) return;
    mDragging = true; mStartX = e.clientX; mStartA = mAngle;
  });
  mansionStage.addEventListener("pointermove", e => { if (mDragging) setMAngle(mStartA + (e.clientX - mStartX) * 0.6); });
  const mEndDrag = () => { if (!mDragging) return; mDragging = false; setMAngle(Math.round(mAngle / MSTEP) * MSTEP); };
  mansionStage.addEventListener("pointerup", mEndDrag);
  mansionStage.addEventListener("pointercancel", mEndDrag);
  mansionSelector.addEventListener("click", () => chooseMansion(mFocus));
  mansionSpin.addEventListener("click", () => {
    if (mSpinning) return;
    sfx("whoosh");
    mSpinning = true; mChosen = null; mansionPick.disabled = true;
    if (mansionCenter) mansionCenter.classList.remove("chosen");
    mNodes.forEach(n => n.classList.remove("chosen"));
    const target = mAngle + 360 * 3 + Math.random() * 360;
    const start = mAngle, dur = 1100, t0 = performance.now();
    function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setMAngle(start + (target - start) * e);
      if (k < 1) requestAnimationFrame(step);
      else { mSpinning = false; chooseMansion(mFocus); }
    }
    requestAnimationFrame(step);
  });
  mansionPick.addEventListener("click", () => { if (mChosen !== null) showReading("mansion", Object.assign({ idx: mChosen }, readQuestion("mansion"))); });

  // 舞台尺寸随视口变化，重排星宿半径并重绘星空
  let mMansionResizeRaf = 0;
  window.addEventListener("resize", () => {
    if (!mNodes.length || mMansionResizeRaf) return;
    mMansionResizeRaf = requestAnimationFrame(() => {
      mMansionResizeRaf = 0;
      const radius = mansionRadius();
      measureMansionLabel();                 // 断点切换后宿名的径向距离也要跟着变
      mNodes.forEach((n, i) => {
        n.style.transform = "rotate(" + (i * MSTEP) + "deg) translateY(-" + radius + "px)";
      });
      setMansionLabels();
      drawMansionSky();
    });
  });

  /* ============================================================
     北欧符文模块 · 远古之语
     ============================================================ */
  const runeRow = document.getElementById("runeRow");
  const runeCast = document.getElementById("runeCast");
  const runeReveal = document.getElementById("runeReveal");
  const runeHint = document.getElementById("runeHint");
  let runePicks = [];
  let runeSlots = [];
  let runeCastSeq = 0;

  // 手凿石板外形：四角略不规则，画面铺满整块石板
  function runeSlabPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(97, 1);
    ctx.quadraticCurveTo(109, 2, 109, 13);
    ctx.lineTo(108, 147);
    ctx.quadraticCurveTo(108, 159, 96, 159);
    ctx.lineTo(13, 160);
    ctx.quadraticCurveTo(1, 160, 1, 147);
    ctx.lineTo(1, 12);
    ctx.quadraticCurveTo(1, 1, 12, 0);
    ctx.closePath();
  }

  // 三种石料：玄武岩 / 古骨 / 板岩。纹理按运行序号取不同区域，三枚不会重复
  const RUNE_MATS = ["basalt", "bone", "slate"];
  const RUNE_TEX_SRC = {
    basalt: "stone-basalt.webp", bone: "stone-bone.webp", slate: "stone-slate.webp",
    altar: "altar.webp", knot: "knot.webp"
  };
  const RUNE_TEX = {};
  let runeTexLoading = false;
  function runeTexReady(k) { const im = RUNE_TEX[k]; return !!(im && im.complete && im.naturalWidth > 0); }
  // 每枚符文的专属意象图：作为石面，符文叠在构图中央的暗部
  const RUNE_VISION = {};
  function runeVisionSrc(idx) { return "assets/runes/visions/" + String(idx).padStart(2, "0") + ".webp"; }
  function repaintRuneStone(idx) {
    document.querySelectorAll(".rune-stone").forEach(cv => {
      if (+cv.dataset.idx === idx) paintRuneStone(cv.getContext("2d"), idx);
    });
  }
  function ensureRuneVision(idx) {
    let im = RUNE_VISION[idx];
    if (im) return im;
    im = new Image();
    im.onload = () => repaintRuneStone(idx);
    im.src = runeVisionSrc(idx);
    RUNE_VISION[idx] = im;
    return im;
  }
  function ensureRuneTextures() {
    if (runeTexLoading) return;
    runeTexLoading = true;
    Object.keys(RUNE_TEX_SRC).forEach(k => {
      const im = new Image();
      im.onload = () => {
        if (!im.naturalWidth || RUNE_MATS.indexOf(k) < 0) return;
        document.querySelectorAll(".rune-stone").forEach(cv => paintRuneStone(cv.getContext("2d"), +cv.dataset.idx));
      };
      im.onerror = () => {};
      im.src = "assets/runes/" + RUNE_TEX_SRC[k];
      RUNE_TEX[k] = im;
    });
  }

  function paintRuneStone(ctx, idx) {
    const day = document.documentElement.getAttribute("data-theme") === "day";
    const t1 = cssVar("--text-1") || "#E8ECFF";
    const accent = cssVar("--accent") || "#7C8CFF";
    const accent2 = cssVar("--accent-2") || "#A970FF";
    const variant = idx % 3;
    const mat = RUNE_MATS[variant];
    const bone = mat === "bone";
    const palettes = [
      day
        ? { top: "#8B9288", mid: "#666D64", bottom: "#4A5048" }
        : { top: "#4B5365", mid: "#2A3040", bottom: "#121623" },
      day
        ? { top: "#F2E8D2", mid: "#DFCFAE", bottom: "#C3AF88" }
        : { top: "#DCCDB0", mid: "#C6B28C", bottom: "#9C8863" },
      day
        ? { top: "#98A0A6", mid: "#767E84", bottom: "#565D62" }
        : { top: "#5B6879", mid: "#38424F", bottom: "#1A212A" }
    ];
    const pal = palettes[variant];
    // 2× 渲染，画面放大到 118px 卡片上仍然清晰
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, 110, 160);
    const vision = RUNE_VISION[idx];
    const hasVision = !!(vision && vision.complete && vision.naturalWidth);

    ctx.save();
    runeSlabPath(ctx);
    ctx.clip();
    const g = ctx.createLinearGradient(12, 4, 98, 156);
    g.addColorStop(0, pal.top);
    g.addColorStop(0.55, pal.mid);
    g.addColorStop(1, pal.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 110, 160);

    // 专属意象图铺满石板，符文刻印压在顶部暗部
    if (hasVision) {
      const iw = vision.naturalWidth, ih = vision.naturalHeight;
      const sc = Math.max(110 / iw, 160 / ih);
      const dw = iw * sc, dh = ih * sc;
      ctx.filter = day ? "brightness(1.04) contrast(1.08) saturate(1.04)" : "brightness(1.38) saturate(1.06)";
      ctx.globalAlpha = day ? 0.92 : 1;
      ctx.drawImage(vision, (110 - dw) / 2, (160 - dh) / 2, dw, dh);
      ctx.filter = "none";
      if (!day) {
        // 轻提暗部，缩到 118px 也能看清构图
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.10;
        ctx.drawImage(vision, (110 - dw) / 2, (160 - dh) / 2, dw, dh);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = 1;
      if (day) { ctx.fillStyle = "rgba(250,246,238,.10)"; ctx.fillRect(0, 0, 110, 160); }
      // 顶部顺势压暗，给符文刻印一个干净的落点（改用线性渐变，避免圆形暗斑）
      const crown = ctx.createLinearGradient(0, 0, 0, 62);
      crown.addColorStop(0, day ? "rgba(24,18,10,.48)" : "rgba(3,5,10,.64)");
      crown.addColorStop(0.6, day ? "rgba(24,18,10,.26)" : "rgba(3,5,10,.34)");
      crown.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = crown;
      ctx.fillRect(0, 0, 110, 62);
      // 边缘压暗，画面收进石板里
      const vg = ctx.createRadialGradient(55, 78, 30, 55, 78, 96);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, day ? "rgba(30,24,16,.26)" : "rgba(0,0,0,.42)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, 110, 160);
    }
    // 固定种子的石纹，主题/语言重绘时不闪烁
    let seed = (idx + 3) * 7919;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 46; i++) {
      ctx.globalAlpha = 0.05 + rnd() * 0.10;
      ctx.fillStyle = rnd() > 0.5 ? "#ffffff" : "#000000";
      ctx.beginPath();
      ctx.arc(6 + rnd() * 98, 6 + rnd() * 148, 0.5 + rnd() * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = i ? (bone ? "rgba(84,60,28,.30)" : "rgba(0,0,0,.22)") : "rgba(255,255,255,.07)";
      ctx.beginPath();
      ctx.moveTo(14 + rnd() * 20, 20 + rnd() * 40);
      ctx.bezierCurveTo(38 + rnd() * 10, 52 + rnd() * 24, 62 + rnd() * 14, 74 + rnd() * 26, 88 + rnd() * 8, 118 + rnd() * 26);
      ctx.stroke();
    }
    // 石料纹理：每种材质两遍叠色，粗粝感和裂纹都从图里来
    if (runeTexReady(mat)) {
      const sx = (idx * 137) % 460, sy = (idx * 83) % 460;
      const im = RUNE_TEX[mat];
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = hasVision ? 0.18 : (bone ? 0.55 : (day ? 0.34 : 0.58));
      ctx.drawImage(im, sx, sy, 512, 512, 0, 0, 110, 160);
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = hasVision ? 0.09 : (bone ? 0.42 : (day ? 0.16 : 0.26));
      ctx.drawImage(im, sy, sx, 512, 512, 0, 0, 110, 160);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
    // 左上受光
    ctx.globalAlpha = hasVision ? (day ? 0.07 : 0.06) : (bone ? (day ? 0.16 : 0.12) : (day ? 0.10 : 0.14));
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(38, 36, 34, 24, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // 右下压暗，给石头一点体积
    const shade = ctx.createLinearGradient(30, 60, 100, 150);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, hasVision ? (day ? "rgba(60,50,30,.20)" : "rgba(0,0,0,.34)") : (bone ? "rgba(60,40,14,.32)" : "rgba(0,0,0,.42)"));
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, 110, 160);
    if (hasVision) {
      const plate = ctx.createLinearGradient(0, 108, 0, 160);
      plate.addColorStop(0, "rgba(0,0,0,0)");
      plate.addColorStop(0.35, day ? "rgba(248,244,236,.74)" : "rgba(3,5,10,.56)");
      plate.addColorStop(1, day ? "rgba(250,247,240,.94)" : "rgba(3,5,10,.86)");
      ctx.fillStyle = plate;
      ctx.fillRect(0, 108, 110, 52);
    }
    ctx.restore();

    // 石板边缘：右下暗线 + 左上高光
    ctx.save();
    ctx.translate(0.7, 0.9);
    runeSlabPath(ctx);
    ctx.strokeStyle = "rgba(0,0,0,.52)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(-0.5, -0.6);
    runeSlabPath(ctx);
    ctx.strokeStyle = day ? "rgba(255,252,246,.72)" : "rgba(220,230,255,.26)";
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();

    // 符文刻印：压在顶部暗部，画面完整露出
    const glyph = RUNE[idx].g;
    const glyphColor = day ? (hasVision ? "#CDBEFF" : "#4B327F") : accent2;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "500 " + (hasVision ? 44 : 62) + "px 'Segoe UI Symbol','Noto Sans Symbols 2',serif";
    const gy = hasVision ? 31 : 70;
    ctx.fillStyle = day ? "rgba(28,20,10,.45)" : "rgba(0,0,0,.55)";
    ctx.fillText(glyph, 56, gy + 2);
    ctx.fillStyle = glyphColor;
    ctx.shadowColor = glyphColor; ctx.shadowBlur = hasVision ? 14 : 18;
    ctx.fillText(glyph, 55, gy);
    ctx.shadowBlur = 0;

    ctx.globalAlpha = day ? 0.30 : 0.42;
    ctx.strokeStyle = day ? "rgba(60,44,22,.40)" : accent;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(32, 121); ctx.lineTo(78, 121); ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = day ? "rgba(38,28,14,.95)" : t1;
    ctx.font = (lang === "en" ? "500 14px " : "500 16px ") + "'Noto Serif SC', serif";
    ctx.fillText(lang === "en" ? RUNE[idx].n : RUNE[idx].z, 55, 140);
  }
  function drawRuneStone(idx) {
    ensureRuneVision(idx);
    const cv = document.createElement("canvas");
    cv.width = 220; cv.height = 320; cv.className = "rune-stone";
    cv.dataset.idx = idx;
    paintRuneStone(cv.getContext("2d"), idx);
    return cv;
  }
  function buildRuneSlots() {
    runeRow.innerHTML = "";
    runeSlots = [];
    for (let i = 0; i < 3; i++) {
      const slot = document.createElement("div");
      slot.className = "rune-slot";
      const ph = document.createElement("span");
      ph.className = "rune-ph";
      ph.textContent = "?";
      const pos = document.createElement("span");
      pos.className = "rune-pos";
      pos.textContent = posName(i);
      slot.appendChild(ph); slot.appendChild(pos);
      runeRow.appendChild(slot);
      runeSlots.push(slot);
    }
  }
  function refreshRuneLabels() {
    runeSlots.forEach((slot, i) => {
      const pos = slot.querySelector(".rune-pos");
      if (pos) pos.textContent = posName(i);
    });
  }
  function resetRune() {
    runePicks = []; runeReveal.disabled = true;
    buildRuneSlots();
    if (runeHint) runeHint.textContent = t("hintRune");
  }
  runeCast.addEventListener("click", () => {
    const seq = ++runeCastSeq;
    runePicks = []; runeReveal.disabled = true;
    runeSlots.forEach(slot => {
      const cv = slot.querySelector("canvas");
      if (cv) cv.remove();
      slot.classList.remove("filled");
      slot.style.animation = "";
    });
    const pool = []; for (let i = 0; i < RUNE.length; i++) pool.push(i);
    for (let k = 0; k < 3 && pool.length; k++) {
      const j = Math.floor(Math.random() * pool.length);
      runePicks.push(pool.splice(j, 1)[0]);
    }
    runePicks.forEach((idx, k) => {
      const slot = runeSlots[k];
      if (!slot) return;
      const cv = drawRuneStone(idx);
      slot.appendChild(cv);
      slot.classList.add("filled");
      slot.style.animation = "none";
      void slot.offsetWidth;
      slot.style.animation = "runeIn 0.5s var(--ease-out) both";
      slot.style.animationDelay = (k * 0.12) + "s";
      setTimeout(() => { if (seq === runeCastSeq) { slot.style.animation = "none"; slot.style.animationDelay = ""; } }, 900);
      setTimeout(() => sfx("rune"), k * 130);
    });
    if (runeHint) {
      const names = runePicks.map(i => lang === "en" ? RUNE[i].n : RUNE[i].z).join(" · ");
      runeHint.textContent = t("runeCastDone", [names]);
    }
    runeReveal.disabled = false;
  });
  runeReveal.addEventListener("click", () => { if (runePicks.length) showReading("rune", { runes: runePicks }); });

  /* ============================================================
     寺观灵签模块 · 一签之示
     ============================================================ */
  const oracleStage = document.getElementById("oracleStage");
  const oracleCup = document.getElementById("oracleCup");
  const oracleStick = document.getElementById("oracleStick");
  const oracleNum = document.getElementById("oracleNum");
  const oracleLevelEl = document.getElementById("oracleLevel");
  const oracleCaptionEl = document.getElementById("oracleCaption");
  const oracleDraw = document.getElementById("oracleDraw");
  const oracleReveal = document.getElementById("oracleReveal");
  const oracleHintEl = document.getElementById("oracleHint");
  let oracleChosen = null, oracleBusy = false;
  function updateOracleLabels() {
    if (oracleHintEl) oracleHintEl.textContent = oracleChosen === null ? t("hintOracle") : t("oracleDone");
    if (oracleChosen === null) {
      if (oracleLevelEl) oracleLevelEl.textContent = "";
      if (oracleCaptionEl) oracleCaptionEl.textContent = "";
      return;
    }
    const s = ORACLE[oracleChosen];
    if (oracleLevelEl) oracleLevelEl.textContent = oracleLevel(s);
    if (oracleCaptionEl) oracleCaptionEl.textContent = t("oracleGot", [s.no, oracleLevel(s), oraclePoem(s)[0]]);
  }
  function resetOracle() {
    oracleChosen = null; oracleBusy = false; oracleReveal.disabled = true;
    oracleStick.classList.remove("show", "settled");
    oracleCup.classList.remove("shake");
    if (oracleNum) oracleNum.textContent = "";
    updateOracleLabels();
  }
  oracleDraw.addEventListener("click", () => {
    if (oracleBusy) return;
    oracleBusy = true; oracleReveal.disabled = true; oracleChosen = null;
    oracleStick.classList.remove("show", "settled");
    if (oracleNum) oracleNum.textContent = "";
    updateOracleLabels();
    oracleCup.classList.add("shake");
    sfx("knock");
    if (window.__particles) window.__particles.collapse();
    setTimeout(() => {
      oracleCup.classList.remove("shake");
      const idx = Math.floor(Math.random() * ORACLE.length);
      oracleChosen = idx;
      const s = ORACLE[idx];
      if (oracleNum) oracleNum.textContent = String(s.no).padStart(2, "0");
      updateOracleLabels();
      oracleStick.classList.add("show");
      setTimeout(() => oracleStick.classList.add("settled"), 1600);
      sfx("card");
      if (window.__particles) window.__particles.expand();
      oracleReveal.disabled = false; oracleBusy = false;
    }, 620);
  });
  oracleReveal.addEventListener("click", () => { if (oracleChosen !== null) showReading("oracle", { sign: oracleChosen }); });

  /* ============================================================
     微交互：磁吸按钮 + 点击涟漪（辉光呼吸在 styles.css）
     ============================================================ */
  function initMagnetic(selector, strength) {
    if (reduced) return;
    document.querySelectorAll(selector).forEach(el => {
      if (el.dataset.mag) return;
      el.dataset.mag = "1";
      const s = strength || 0.28;
      el.addEventListener("pointermove", e => {
        if (el.disabled) { el.style.transform = ""; return; }
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (dx * s).toFixed(1) + "px," + (dy * s).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
      el.addEventListener("blur", () => { el.style.transform = ""; });
    });
  }
  function spawnRipple(el, x, y) {
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 1.6;
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.width = span.style.height = size + "px";
    span.style.left = (x - r.left - size / 2) + "px";
    span.style.top = (y - r.top - size / 2) + "px";
    el.appendChild(span);
    setTimeout(() => span.remove(), 640);
  }
  function initRipple(selector) {
    document.addEventListener("pointerdown", e => {
      const el = e.target.closest(selector);
      if (!el || el.disabled) return;
      spawnRipple(el, e.clientX, e.clientY);
    });
  }
  initMagnetic(".primary-btn, .ghost-btn", 0.3);
  initMagnetic(".card", 0.16);
  initRipple(".primary-btn, .ghost-btn, .card, .dial-card");

  /* ============================================================
     摄像头手势：张开手掌 = 隔空光标，停在按钮 / 牌上约 0.8s = 选中。
     只保留这一种交互——原先的捏合点击、握拳返回与运动追踪降级
     因误触发频发已移除；返回请停在「‹ 返回」按钮上。
     MediaPipe Hands 已本地化（vendor/mediapipe），加载失败明确提示，不再静默降级。
     ============================================================ */
  const cameraToggle = document.getElementById("cameraToggle");
  const camClose = document.getElementById("camClose");
  const camWrap = document.getElementById("camWrap");
  const camVideo = document.getElementById("camVideo");

  // 全屏光环：把手掌位置“投射”到整个屏幕，让用户看清自己此刻瞄准的位置
  const camReticle = document.getElementById("camReticle");
  const retCtx = camReticle ? camReticle.getContext("2d") : null;
  let retDpr = Math.min(window.devicePixelRatio || 1, 2);
  function retResize() {
    if (!camReticle) return;
    retDpr = Math.min(window.devicePixelRatio || 1, 2);
    camReticle.width = Math.floor(window.innerWidth * retDpr);
    camReticle.height = Math.floor(window.innerHeight * retDpr);
    if (retCtx) retCtx.setTransform(retDpr, 0, 0, retDpr, 0, 0);
  }

  let camOn = false, camStream = null, hands = null, handsBusy = false;
  let handReady = false, handLast = 0, camStartedAt = 0, modelFailShown = false;
  let sendFails = 0, lastSendErr = "", handsLaunched = false;
  let vidTime = -1, vidStaleAt = 0;
  let cur = { x: 0.5, y: 0.5 }, curInit = false, prevX = 0.5, prevY = 0.5;
  let lastFrame = 0, lastPulse = 0, dwellEl = null, dwellT = 0, dwellLost = 0;
  let hitEl = null, hitAt = 0, toastUntil = 0;
  const camGestureEl = document.getElementById("camGesture");

  // 可达映射：手不必伸到画面最边缘，画面中部 74% 的活动范围就能覆盖整屏
  // —— 左上角的返回按钮、四角的按钮才够得着
  const REACH = 0.13;
  function mapReach(v) { return Math.min(1, Math.max(0, (v - REACH) / (1 - 2 * REACH))); }

  window.addEventListener("resize", () => { if (camOn) retResize(); });

  function startCamera() {
    if (camOn) return;
    // file:// 下浏览器禁止 fetch 本地 wasm / 模型，MediaPipe 必然失败，别让人对着「检测中」猜
    if (location.protocol === "file:") {
      alert(t("camNeedHttp"));
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("当前环境不支持摄像头（需 https 或 localhost）。演示仍可用鼠标交互。");
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then(stream => {
        camStream = stream;
        camVideo.srcObject = stream;
        camVideo.play().catch(e => console.warn("摄像头画面未播放：", e));
        camOn = true; window.__camOn = true;
        camWrap.hidden = false; retResize();
        cameraToggle.textContent = t("cameraOn"); cameraToggle.classList.add("is-on");
        camStartedAt = performance.now(); modelFailShown = false; handReady = false; handLast = 0;
        sendFails = 0; lastSendErr = ""; handsLaunched = false; lastFrame = 0;
        vidTime = 0; vidStaleAt = performance.now();
        setGestureText(t("camDetecting"));
        // hands.js 是 async 引入，可能比首次点击更晚到位：等它最多 4s 再判定失败
        whenHands(ok => {
          if (!camOn) return;
          if (ok && initHands()) { handsLaunched = true; pumpHands(); }
          else modelFail();
        }, 16);
        requestAnimationFrame(camLoop);
      })
      .catch(err => {
        const name = (err && err.name) || String(err);
        const hint = name === "NotAllowedError" || name === "SecurityError"
          ? "浏览器未授权：点地址栏右侧的摄像头/🔒 图标，改成「允许」后刷新页面。"
          : name === "NotReadableError" || name === "AbortError"
          ? "摄像头被其他软件占用：请彻底退出微信 / 钉钉 / 腾讯会议 / 系统相机后重试。"
          : name === "NotFoundError" || name === "OverconstrainedError"
          ? "没有可用的摄像头，或系统隐私设置禁止浏览器访问相机。" : "";
        alert("无法开启摄像头：" + name + (hint ? "\n" + hint : "") + "\n（演示仍可用鼠标交互）");
      });
  }

  function stopCamera() {
    camOn = false; window.__camOn = false;
    if (camStream) camStream.getTracks().forEach(tr => tr.stop());
    camStream = null; camVideo.srcObject = null;
    camWrap.hidden = true;
    cameraToggle.textContent = t("cameraToggle"); cameraToggle.classList.remove("is-on");
    hands = null; handReady = false; curInit = false;
    palmOpen = false; openVotes = closeVotes = 0;
    dwellEl = null; dwellT = 0; dwellLost = 0; hitEl = null; toastUntil = 0;
    if (retCtx) { retCtx.save(); retCtx.setTransform(1, 0, 0, 1, 0, 0); retCtx.clearRect(0, 0, camReticle.width, camReticle.height); retCtx.restore(); }
  }

  /* ---------------- MediaPipe Hands（本地 vendor/mediapipe，离线可用） ---------------- */
  function whenHands(cb, tries) {
    if (typeof Hands !== "undefined") return cb(true);
    if (tries <= 0) return cb(false);
    setTimeout(() => whenHands(cb, tries - 1), 250);
  }
  function initHands() {
    if (typeof Hands === "undefined") return false;   // 脚本未加载
    try {
      hands = new Hands({ locateFile: (f) => "vendor/mediapipe/" + f });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      hands.onResults(onHandResults);
      return true;
    } catch (e) { console.warn("MediaPipe Hands 初始化失败：", e); return false; }
  }
  async function pumpHands() {
    if (!camOn || !hands) return;
    if (camVideo.readyState >= 2 && !handsBusy) {
      handsBusy = true;
      try { await hands.send({ image: camVideo }); sendFails = 0; }
      catch (e) {
        sendFails++;
        lastSendErr = String((e && (e.message || e)) || "unknown").slice(0, 60);
        if (sendFails === 1) console.warn("MediaPipe hands.send 失败：", e);
        await new Promise(r => setTimeout(r, 400));
      }
      handsBusy = false;
    }
    requestAnimationFrame(pumpHands);
  }
  function setGestureText(text) {
    const s = t("camGesturePrefix") + text;
    if (camGestureEl && camGestureEl.__txt !== s) {
      camGestureEl.__txt = s; camGestureEl.textContent = s;
      console.info("[手势] " + s);   // 状态一变就打一行，卡住时按 F12 能直接看到卡在哪
    }
  }
  /* 模型始终没出过任何结果 → 明确报错，不再静默降级 */
  function modelFail() {
    if (modelFailShown || !camOn) return;
    modelFailShown = true;
    setGestureText(t("camModelFail"));
  }
  /* 「检测中」不能是死寂：按当前卡住的阶段给出可执行的提示 */
  function videoIsStale() {
    const c = camVideo.currentTime;
    if (c !== vidTime) { vidTime = c; vidStaleAt = performance.now(); return false; }
    return performance.now() - vidStaleAt > 2500;   // 有流但 2.5s 没有新帧 = 设备被占用
  }
  function diagnoseGesture() {
    if (handReady || !camOn) return;
    const waited = (performance.now() - camStartedAt) / 1000;
    if (waited < 1.2) return;
    if (!handsLaunched) { if (waited > 8) modelFail(); else setGestureText(t("camLoading", [Math.round(waited)])); return; }
    if (camVideo.readyState < 2 || videoIsStale()) { setGestureText(t("camNoVideo")); return; }
    if (sendFails >= 3) { setGestureText(t("camSendFail") + "（" + lastSendErr + "）"); return; }
    if (waited > 20) { modelFailShown = true; setGestureText(t("camNoResult")); return; }   // wasm 挂起：脚本在、有画面、但从不出结果
    setGestureText(t("camLoading", [Math.round(waited)]));
  }

  /* 张掌判定：四指中至少三指的指尖明显比第二关节更远离手腕。
     进/出各需连续若干帧确认，避免手抖导致光标忽隐忽现 */
  let palmOpen = false, openVotes = 0, closeVotes = 0;
  function isPalmOpen(lms) {
    const w = lms[0];
    let ext = 0;
    [5, 9, 13, 17].forEach(pip => {
      const tip = lms[pip + 3];
      const dTip = Math.hypot(tip.x - w.x, tip.y - w.y);
      if (dTip > Math.hypot(lms[pip].x - w.x, lms[pip].y - w.y) * 1.08) ext++;
    });
    return ext >= 3;
  }
  function votePalm(open) {
    if (open) { openVotes++; closeVotes = 0; if (openVotes >= 3) palmOpen = true; }
    else { closeVotes++; openVotes = 0; if (closeVotes >= 6) palmOpen = false; }
  }

  /* ---------------- 手部结果：张开手掌 → 掌心 = 光标，唯一的交互 ---------------- */
  function onHandResults(res) {
    handReady = true;                                  // 模型已出结果（无论有无手）
    const lms = res.multiHandLandmarks && res.multiHandLandmarks[0];
    if (!lms) { handLast = 0; palmOpen = false; openVotes = closeVotes = 0; setGestureText(t("camNoHand")); return; }
    votePalm(isPalmOpen(lms));
    // 手在画面里但没张开：按「没有光标」处理，握拳 / 捏合都不产生任何动作
    if (!palmOpen) { handLast = 0; setGestureText(t("camNeedOpen")); return; }
    handLast = performance.now();
    // 掌心中心（镜像：MediaPipe 读原始像素，故 x 取 1-x）
    const ids = [0, 5, 9, 13, 17];
    let cx = 0, cy = 0;
    ids.forEach(i => { cx += lms[i].x; cy += lms[i].y; });
    cx = 1 - cx / ids.length; cy = cy / ids.length;
    if (!curInit) { cur.x = cx; cur.y = cy; curInit = true; }
    else {
      const d0 = Math.hypot(cx - cur.x, cy - cur.y);
      // 自适应平滑：手稳时几乎不动、手快时跟得紧；大跳变直接跟上
      const k = d0 > 0.35 ? 1 : Math.min(0.62, 0.24 + d0 * 2.4);
      cur.x += (cx - cur.x) * k; cur.y += (cy - cur.y) * k;
    }
    if (performance.now() > toastUntil) setGestureText(t("camHandOn"));   // 刚命中的那 0.9s 保留「✓ 已选中」
  }

  if (cameraToggle) cameraToggle.addEventListener("click", () => { camOn ? stopCamera() : startCamera(); });
  if (camClose) camClose.addEventListener("click", stopCamera);

  // 手势命中的就是「页面上当前可见的任何可点控件」：六门、身份卡、顶栏开关、返回、
  // 解读页工具、主按钮、星盘牌——因为按设计，切主题 / 返回也只能靠停在对应按钮上完成。
  function camHitOne(sx, sy) {
    const hit = document.elementFromPoint(sx, sy);
    if (!hit) return null;
    const el = hit.closest(".dial-card:not(.used), .dial-selector, button:not([disabled]), .card[data-go]");
    if (!el || el.classList.contains("used")) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    // 未激活舞台里的按钮仍在 DOM 中，别让隔空光标误触
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return null;
    return el;
  }
  // 隔空光标天然有几像素的抖动，按钮之间又常只留十几 px 缝隙：正点没命中时向四周探一下，
  // 否则光标停在缝隙里就永远锁不到目标，驻留计时也就永远开始不了
  const CAM_PROBE = [[24, 0], [-24, 0], [0, 24], [0, -24]];
  function camElementAt(sx, sy) {
    const direct = camHitOne(sx, sy);
    if (direct) return direct;
    for (let i = 0; i < CAM_PROBE.length; i++) {
      const el = camHitOne(sx + CAM_PROBE[i][0], sy + CAM_PROBE[i][1]);
      if (el) return el;
    }
    return null;
  }
  function camDeepInside(el, sx, sy, inset) {
    const r = el.getBoundingClientRect();
    return sx > r.left + inset && sx < r.right - inset && sy > r.top + inset && sy < r.bottom - inset;
  }
  // 容差随元素大小走：小按钮几 px 的抖动就出界，大卡片则要抖出几十 px 才算移开
  function camPad(r) { return 26 + Math.min(r.width, r.height) * 0.35; }
  function camNearRect(r, sx, sy, pad) {
    return sx >= r.left - pad && sx <= r.right + pad && sy >= r.top - pad && sy <= r.bottom + pad;
  }

  function camLoop(ts) {
    if (!camOn) return;
    requestAnimationFrame(camLoop);
    const dt = lastFrame ? Math.min(0.1, (ts - lastFrame) / 1000) : 0.016;
    lastFrame = ts;
    if (!handReady) diagnoseGesture();                                          // 一直没出结果：说清卡在哪一步
    const fresh = handLast && performance.now() - handLast < 500;             // 手 0.5s 内出现过才有效
    const W = window.innerWidth, H = window.innerHeight;
    if (!fresh) {
      dwellEl = null; dwellT = 0; dwellLost = 0;
      drawReticle(null, 0, null, 0);
      return;
    }
    const sx = mapReach(cur.x) * W, sy = mapReach(cur.y) * H;
    const ndx = sx / W * 2 - 1, ndy = sy / H * 2 - 1;
    if (window.__particles) {
      window.__particles.setPointer(ndx, ndy);
      // 手快速划过时激起一道星尘涟漪（纯氛围，不参与判定）
      const speed = Math.hypot(cur.x - prevX, cur.y - prevY) / dt;
      if (!reduced && speed > 0.55 && performance.now() - lastPulse > 420) { window.__particles.pulseRipple(ndx, ndy); lastPulse = performance.now(); }
    }
    prevX = cur.x; prevY = cur.y;
    const now = performance.now();
    let over = camElementAt(sx, sy);
    // 目标滞回：相邻按钮之间常只有十几 px 缝隙，手抖会让光标在两个按钮间来回跳，
    // 于是驻留计时每帧被当成「换了目标」清零。新目标必须深深落进自己的矩形才抢走锁定。
    if (dwellEl && dwellEl.isConnected && over !== dwellEl && now - dwellLost < 500) {
      const r = dwellEl.getBoundingClientRect();
      if (camNearRect(r, sx, sy, camPad(r)) && !(over && camDeepInside(over, sx, sy, 30))) over = dwellEl;
    }
    // 不应期：光标还赖在刚点过的元素附近就不再重新计时（否则停在按钮缝隙里会连着点中左右两个）；
    // 一旦离开它的容差范围就解除，允许重新瞄准同一个按钮。
    if (hitEl && hitEl.isConnected) {
      const h = hitEl.getBoundingClientRect();
      if (!camNearRect(h, sx, sy, camPad(h))) hitEl = null;
      else if (over && (over === hitEl || !camDeepInside(over, sx, sy, 30))) over = null;
    } else hitEl = null;
    if (over !== dwellEl) { dwellEl = over; dwellT = 0; }
    if (over) {
      dwellLost = now;
      dwellT += dt;
      if (dwellT > 0.8 && !over.classList.contains("picked") && !over.classList.contains("used")) fireDwell(over);
    } else dwellT = 0;
    drawReticle(sx, sy, over, dwellT);
  }

  // 命中即给出可见 + 可读的确认，否则用户分不清「没生效」和「已经生效但没什么变化」
  function fireDwell(el) {
    const label = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 14);
    hitEl = el; dwellT = 0; dwellEl = null;
    toastUntil = performance.now() + 900;
    setGestureText(t("camHit", [label]));
    el.classList.add("cam-hit");
    setTimeout(() => el.classList.remove("cam-hit"), 460);
    el.click();
  }

  // 全屏光环：跟随手掌，命中可交互元素时画出驻留进度环 + 高亮框
  function drawReticle(sx, sy, over, t) {
    if (!retCtx) return;
    const W = window.innerWidth, H = window.innerHeight;
    retCtx.clearRect(0, 0, W, H);
    if (sx == null) return;
    retCtx.save();
    // 外环 + 辉光
    retCtx.lineWidth = 2.5;
    retCtx.strokeStyle = "rgba(124,140,255,0.95)";
    retCtx.shadowColor = "rgba(124,140,255,0.9)";
    retCtx.shadowBlur = 18;
    retCtx.beginPath(); retCtx.arc(sx, sy, 24, 0, Math.PI * 2); retCtx.stroke();
    // 准星十字（内段）
    retCtx.shadowBlur = 0;
    retCtx.lineWidth = 1.5;
    retCtx.beginPath();
    retCtx.moveTo(sx - 36, sy); retCtx.lineTo(sx - 28, sy);
    retCtx.moveTo(sx + 28, sy); retCtx.lineTo(sx + 36, sy);
    retCtx.moveTo(sx, sy - 36); retCtx.lineTo(sx, sy - 28);
    retCtx.moveTo(sx, sy + 28); retCtx.lineTo(sx, sy + 36);
    retCtx.stroke();
    if (over) {
      // 驻留进度环（紫色），填满约 0.8s 即自动触发
      retCtx.lineWidth = 4;
      retCtx.strokeStyle = "#A970FF";
      retCtx.shadowColor = "rgba(169,112,255,0.9)";
      retCtx.shadowBlur = 14;
      retCtx.beginPath();
      retCtx.arc(sx, sy, 34, -Math.PI / 2, -Math.PI / 2 + Math.min(t / 0.8, 1) * Math.PI * 2);
      retCtx.stroke();
      // 命中元素高亮描边
      const r = over.getBoundingClientRect();
      retCtx.shadowBlur = 0;
      retCtx.strokeStyle = "rgba(169,112,255,0.9)";
      retCtx.lineWidth = 2;
      retCtx.strokeRect(r.left - 4, r.top - 4, r.width + 8, r.height + 8);
    }
    retCtx.restore();
  }

  /* ---------------- 跳过揭晓 / Esc 返回 / 顶栏静默隐去 ---------------- */
  if (revealSkip) revealSkip.addEventListener("click", e => { e.stopPropagation(); finishReveal(); });
  const readingScroller = document.querySelector('.screen[data-screen="reading"]');
  if (readingScroller) {
    readingScroller.addEventListener("pointerdown", () => { if (revealActive) finishReveal(); });
  }
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (camOn) { stopCamera(); return; }
    if (state.screen === "reading" && revealActive) { finishReveal(); return; }
    if (state.screen !== "home") switchScreen("home");
  });

  let idleTimer = null;
  function bumpIdle() {
    document.body.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (state.screen !== "home" && !camOn) document.body.classList.add("is-idle");
    }, 3200);
  }
  ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"].forEach(ev => window.addEventListener(ev, bumpIdle, { passive: true }));
  bumpIdle();

  /* 初始进入 home 时若离线无粒子，至少跑一次 resize 占位 */

  /* 应用初始语言（静态 + 顶栏 + 当前屏动态文案） */
  applyLang();
  checkHealth();                                 // 探测后端/密钥，决定首页状态文案
  restoreFromShare();                            // 带 #s= 的分享链接：直接回放解读
  armGateAuto();                                 // 首次抵达：门扉自行缓缓开启
})();
