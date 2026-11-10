/* Product guidance describes the actual draw and a distinct way to read it. */
(function (root) {
  // These are editorial metaphors, not numerical claims about a person's traits.
  root.AstraNumberLenses = {
    zh: [
      ["星光先给出方向，路却仍要一步步走出来。这里借‘星’谈开始：先找到值得靠近的一点，再决定怎样出发。", "你愿意先靠近哪件小事，来辨认自己想走的方向？"],
      ["月有盈亏，也有不发光的一面。这里借‘月’谈沉淀：给尚未成形的想法一点安静，不急着填满空白。", "有哪些答案还需要时间，而你可以先照顾好什么？"],
      ["潮水有进有退，退去也在为下一次积蓄空间。这里借‘潮’谈连接：观察付出与回应怎样往复。", "哪段连接让你恢复力量，哪一次付出需要稍作停顿？"],
      ["树先扎根，再慢慢分出枝叶。这里借‘林’谈生长：把眼前的扩展，与支撑它的基础放在一起看。", "你想长出的那根新枝，需要先补上什么养分？"],
      ["镜面只映出眼前，解释却来自观看的人。这里借‘镜’谈映照：分清你确实看见的事，与自己加上的判断。", "如果暂时放下评价，你能描述出哪一件具体发生的事？"],
      ["火焰需要燃料，也需要边界，才不至于转瞬烧尽。这里借‘焰’谈热情：看见愿望，也看见持续投入的代价。", "你愿意把有限的精力留给哪件事，又该停止消耗在哪里？"],
      ["羽毛乘风，也懂得减去重量。这里借‘羽’谈轻盈：不是放弃在意的事，而是辨认哪些负担可以暂放。", "今天少承担哪一件事，会让重要的事更容易继续？"],
      ["石头因承重与停留，成为可以落脚的地方。这里借‘石’谈稳固：找到一个能重复、能依靠的小支点。", "在变化里，你希望先守住哪一个日常或边界？"],
      ["桥连接两岸，中间却仍有一段要亲自走过。这里借‘桥’谈过渡：允许自己尚未抵达，也看清下一块落脚处。", "从现在走向想去的地方，哪一步已经有条件迈出？"],
      ["钟声因一响一歇才有节律，停顿也让下一声被听见。这里借‘钟’谈安排与留白：什么值得按时回应，什么可以慢一些。", "你的日常里，哪件事值得固定下来，哪一处需要留出空白？"],
      ["雾里看不见远处，却仍能看见脚下几步。这里借‘雾’谈未知：把必须知道的事，与可以边走边确认的事分开。", "在作决定前，你最需要先确认哪一条信息？"],
      ["一盏灯照不亮整条路，却足够辨认下一步。这里借‘灯’谈微光：从可掌握的小范围开始，看看行动带来什么。", "今天哪一个足够小的行动，能让事情比现在清楚一点？"]
    ],
    en: [
      ["A star offers a direction before there is a path. Its image frames a beginning: find one point worth approaching before planning the whole journey.", "What small thing would you approach first to discover a direction?"],
      ["The moon has phases and a side left in shadow. Its image makes room for stillness and ideas that need time to take shape.", "Which answer needs more time, and what can you care for while waiting?"],
      ["A tide moves in and out; retreat also makes room for its return. Its image frames connection as a rhythm of giving and receiving.", "Which connection restores you, and where could you pause your giving?"],
      ["A forest grows roots before new branches. Its image links growth with the foundations that can support it.", "What nourishment would the new branch you want need first?"],
      ["A mirror reflects what is there; the viewer adds an interpretation. Its image separates an observed event from a judgment about it.", "Without evaluating it, how would you describe one thing that actually happened?"],
      ["A flame needs fuel and a boundary to keep burning. Its image puts enthusiasm beside the cost of sustaining it.", "Where would you keep investing your energy, and where could you stop spending it?"],
      ["A feather travels by carrying less. Its image invites you to set down a burden so that what matters can continue.", "What could you carry less of today to make room for something important?"],
      ["A stone can become a place to stand because it holds weight and stays. Its image asks for one dependable support.", "Which small routine or boundary would you keep through a change?"],
      ["A bridge connects two shores, yet the crossing takes steps. Its image makes room for being between places and finding a foothold.", "Which step toward the other side is already possible?"],
      ["A bell's rhythm comes from both its sound and the silence between strikes. Its image frames a daily rhythm with space to pause.", "What deserves a regular place in your day, and where would you leave some silence?"],
      ["Mist hides the distance while leaving a few steps visible. Its image separates what you must know now from what you can learn along the way.", "What is the one piece of information you need before deciding?"],
      ["A lantern cannot light the whole road, but it can reveal the next step. Its image starts with what you can reach and observe.", "What small action today would make the situation a little clearer?"]
    ]
  };
  root.AstraModuleProfiles = {
    tarot: {
      zh: { eyebrow: "三张牌 · 心境与选择", focus: "把同一个困惑放进三个位置，分清过去的惯性、眼前的处境与可以尝试的方向。", angles: ["过去：沿用的模式", "现在：看见的处境", "未来：可试的方向"], question: "面对这个选择，我正在沿用什么模式，又有哪些新的可能？", mechanism: "从22张大阿卡纳中选三张，保留正逆位。位置决定看问题的角度，牌面提供意象；第三张是探索方向，不是已确定的未来。" },
      en: { eyebrow: "Three cards · feelings & choices", focus: "Separate the patterns you bring, the situation you face, and a direction you could explore.", angles: ["Past: a carried pattern", "Present: the situation", "Future: a possible direction"], question: "Which pattern am I carrying into this choice, and what could I try differently?", mechanism: "Choose three cards from 22 Major Arcana, keeping reversals. Positions frame the question and the cards supply imagery. The third card explores a direction rather than a certain future." }
    },
    gua: {
      zh: { eyebrow: "六次掷币 · 条件与变化", focus: "先看清本卦，再沿动爻比较条件发生变化后，哪些地方值得进、退或继续观察。", angles: ["本卦：眼前的结构", "动爻：变化在何处", "变卦：变化后的参照"], question: "这件事的推进条件在哪里，哪些变化值得我先观察？", mechanism: "三枚铜钱每次记2或3点，相加得到一爻，自下而上掷六次。只有6、9是动爻，翻转后得到变卦；没有动爻时本卦不变。本功能不进行完整纳甲、六亲世应或应期断卦。" },
      en: { eyebrow: "Six casts · conditions & change", focus: "Read the primary structure, then use its moving lines to compare what changes and what needs observation.", angles: ["Primary: current structure", "Moving lines: the focus", "Changed: a comparison"], question: "Which conditions would support progress, and what changes should I watch first?", mechanism: "Each of three coins scores 2 or 3. Their sum forms one of six lines, recorded bottom to top. Only 6 and 9 move; flipping them gives the changed hexagram. With no moving lines, the primary stays the same. This does not perform a full traditional calendrical divination." }
    },
    number: {
      zh: { eyebrow: "十二枚印记 · 自我观察", focus: "让一组数字成为观察自己的入口，借印记的意象，寻找当下可辨认的节律。", angles: ["数字：取象的来路", "印记：当下的节律"], question: "最近让我充实或疲惫的时刻，呈现出怎样的节律？", mechanism: "将输入数字逐位相加，再用数位和除以12的余数，选出本站十二枚自定义印记之一。同一组数字会得到同一印记；它不是传统灵数根数算法，也不从数字断定性格或命运。不必填写真实生日。" },
      en: { eyebrow: "Twelve symbols · self-observation", focus: "Use a number as a starting point for noticing the rhythms you can recognize in your life.", angles: ["Number: the mapping", "Symbol: a present rhythm"], question: "What patterns appear in the moments that leave me fulfilled or tired?", mechanism: "Add the input digits and use the sum modulo 12 to select one of this app's twelve custom symbols. The same input produces the same symbol. This is not a traditional numerology root or a personality prediction. Your real birth date is unnecessary." }
    },
    mansion: {
      zh: { eyebrow: "一宿一兽 · 换个视角", focus: "借一宿的气质与守护兽的行动意象，换一个角度看待自己与环境的关系。", angles: ["星宿：另一种视角", "守护兽：一种行动姿态"], question: "如果换一种应对姿态，我现在可以看见哪些被忽略的可能？", mechanism: "在二十八宿星环中取一宿，结合它的名称、七曜属性与守护兽意象来读。这是象征取宿，不按出生时间或实时天象计算本命，也不代表天体正在影响你的决定。" },
      en: { eyebrow: "One mansion & animal · perspective", focus: "Borrow the character of a mansion and its animal imagery to see your relationship with the situation differently.", angles: ["Mansion: a perspective", "Animal: a way to respond"], question: "What might I notice if I tried a different way of responding?", mechanism: "Select one of 28 mansions and read its name, celestial association and animal imagery. This is a symbolic draw, not a natal or real-time sky calculation, and it does not establish celestial causes for your decisions." }
    },
    rune: {
      zh: { eyebrow: "三枚符文 · 力量与边界", focus: "沿三枚符石梳理力量从哪里来、边界在哪里，以及面对变化可以怎样回应。", angles: ["回顾：力量的来处", "当下：要照看的边界", "下一步：回应的方式"], question: "面对这次变化，我能调用什么力量，又需要守住什么边界？", mechanism: "从24枚符石中不重复选取三枚，也可随机补满剩余阵位；依次作为回顾、当下与下一步的象征。重点是符文含义之间的关系和你能采用的回应，不把它们当成命令或固定吉凶。" },
      en: { eyebrow: "Three runes · resources & boundaries", focus: "Trace the resources you bring, the boundaries that matter, and a response to the change ahead.", angles: ["Context: your resources", "Present: a boundary", "Next: a response"], question: "What resources can I draw on, and which boundary should I protect through this change?", mechanism: "Choose three distinct stones from 24 runes, or fill the remaining positions at random. The positions represent context, the present and a next step. Read their relationship and the responses available to you, rather than treating them as commands or fixed omens." }
    },
    oracle: {
      zh: { eyebrow: "一支签诗 · 一件心事", focus: "从一首短诗里抓住与你此刻有关的意象，再把诗意转成一件能做的小事。", angles: ["签诗：关键意象", "解签：贴近这件事"], question: "围绕这件心事，我最需要放下或留意的是什么？", mechanism: "从应用内签诗库取一支签，先读原诗，再看意象怎样联系你明确提出的心事。签号与签级是抽取结果，不用吉凶代替现实判断，也不代表任何寺观的官方服务。" },
      en: { eyebrow: "One poem · one concern", focus: "Find an image in a short verse that speaks to your concern, then turn it into a small practical step.", angles: ["Verse: a key image", "Reading: this concern"], question: "What should I release or pay attention to in this particular concern?", mechanism: "Draw a lot from this app's poem collection. Read the original verse before relating its imagery to the concern you stated. A lot's number and grade do not replace real-world judgment or represent an official temple service." }
    }
  };
})(window);
