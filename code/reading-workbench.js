/* Optional, same-draw reflection. No extra draw or automatic AI request. */
(function () {
  'use strict';
  function mount(experience, current) {
    document.querySelector('.reading-workbench')?.remove();
    const en = experience.bridge.lang() === 'en', tx = (zh, english) => en ? english : zh;
    const facts = experience.bridge.describeDraw(current.type, current.data);
    const state = current.exploration || (current.exploration = { selected: null, notes: {} });
    if (!state.notes || typeof state.notes !== 'object') state.notes = {};
    const cards = [...document.querySelectorAll('#readingBody > .r-card')];
    const box = document.createElement('details'); box.className = 'reading-workbench';
    const title = document.createElement('summary');
    const titles = {
      tarot: ['从最有共鸣的一张，读懂三牌的关系', 'Explore the relationship between your three cards'],
      gua: ['沿着本次爻位，比较与观察', 'Compare and observe this draw, line by line'],
      number: ['把这枚印记，放回你的日常', 'Bring this symbol into your everyday life'],
      mansion: ['换一个视角，选择应对的姿态', 'See the setting, then choose a response'],
      rune: ['力量、边界与一次回应', 'Resources, boundaries and a response'],
      oracle: ['留住与你有共鸣的一句诗', 'Keep a line of verse that speaks to you']
    };
    title.textContent = current.type === "tarot" ? window.AstraTarotSpreads.get(current.data.spreadId).title[en?1:0] + tx(" · 选择共鸣牌", " · explore a card") : tx(...titles[current.type]); box.append(title);
    const content = document.createElement('div'); content.className = 'workbench-content'; box.append(content);
    const save = () => experience.notesChanged(current);
    function paragraph(text, cls) { const p = document.createElement('p'); if (cls) p.className = cls; p.textContent = text; content.append(p); return p; }
    function field(key, label) {
      const wrap = document.createElement('label'); wrap.className = 'workbench-field';
      const span = document.createElement('span'); span.textContent = label;
      const input = document.createElement('textarea'); input.rows = 2; input.maxLength = 400; input.value = String(state.notes[key] || '');
      input.addEventListener('input', () => { state.notes[key] = input.value; save(); }); wrap.append(span,input); content.append(wrap);
    }
    const choices = document.createElement('div'); choices.className = 'workbench-choices'; content.append(choices);
    const status = paragraph('', 'workbench-status'); status.setAttribute('role','status');
    function focus(index, jump = current.type === 'gua') {
      cards.forEach((card,i) => card.classList.toggle('is-reflection-focus',i === index));
      const target = cards[index];
      if (target && jump) { target.tabIndex = -1; target.focus({preventScroll:true}); target.scrollIntoView({block:'nearest',behavior:'auto'}); }
    }
    function choose(label, value, action) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'ghost-btn'; button.textContent = label;
      button.dataset.choice = String(value); button.dataset.label = label; button.setAttribute('aria-pressed',String(state.selected === value));
      button.addEventListener('click', () => { state.selected = value; choices.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); action(); save(); });
      choices.append(button); return button;
    }
    if (current.type === 'tarot') {
      (current.r.readings || []).forEach((r,i) => choose(r.position+' · '+r.card,i, () => {
        status.textContent = tx('你选了「'+r.card+'」。把意象放回本次问题：有哪些条件值得核实，又有什么可以试一试？','You chose '+r.card+'. Bring the image back to this question: what would you check, and what could you try?'); focus(i);
      }));
      field('pattern',tx('哪一种模式让你感到熟悉？下一次想试着改变哪一步？','Which pattern feels familiar? What would you try differently next time?'));
    } else if (current.type === 'gua' && Array.isArray(facts.lines) && facts.lines.length === 6) {
      const core = window.AstraGuaCore.derive(facts.lines), labels = en ? ['1','2','3','4','5','6'] : ['初','二','三','四','五','上'];
      const boards = document.createElement('div'); boards.className = 'workbench-gua'; content.insertBefore(boards,status);
      [facts.lines,core.changedLines].forEach((values,k) => {
        const board = document.createElement('div'); const h = document.createElement('b'); h.textContent = k ? tx('变化后','After changing') : tx('本卦','Primary'); board.append(h);
        for (let i=5;i>=0;i--) {
          const row = document.createElement('button'); row.type='button'; row.className='workbench-line'; row.dataset.line=String(i); row.setAttribute('aria-pressed',String(state.selected === i));
          const n = document.createElement('span'); n.textContent=labels[i]; const line=document.createElement('span'); line.className='workbench-line-shape'+([6,8].includes(values[i])?' yin':'');
          const v=document.createElement('span');v.textContent=values[i]+(core.movingPositions.includes(i+1)?' ·':'');row.append(n,line,v);
          row.addEventListener('click',()=>{state.selected=i;boards.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.line)===i)));
            const moving=core.movingPositions.includes(i+1);status.textContent=tx(labels[i]+'爻：'+facts.lines[i]+' → '+core.changedLines[i]+'。'+(moving?'本次动爻，在两卦中翻转。':'本次静爻，保留原来的形态。')+'这是一项取象事实；可结合下方对应解读核实自己的条件。','Line '+labels[i]+': '+facts.lines[i]+' → '+core.changedLines[i]+'. '+(moving?'Moving in this draw.':'Unchanged in this draw.')+' This is a draw fact; use the interpretation below to examine your conditions.');
            const exact = cards.findIndex(card => card.dataset.readingLine === String(i+1));
            if (moving && exact >= 0) focus(exact);
            else {
              if (moving) status.textContent += tx('这份记录尚无独立逐爻文字，已标出变化焦点的综合解释。','This record has no separate line text; the general change interpretation is highlighted.');
              focus(moving?1:0);
            }
            save();});board.append(row);
        }boards.append(board);
      });
      choices.remove();
      paragraph(core.isStatic?tx('本次没有动爻。可以选择任一爻位观察；静卦不代表现实已经稳定。','This draw has no moving lines. Select any line to observe; a static draw does not establish stability in real life.'):tx('带点的是本次动爻；点选任一爻位，两边会同步选中，有独立逐爻解读时会直接定位到该爻。','Dots mark moving lines. Select a line to highlight both forms and locate its own explanation when available.'));
      paragraph(tx('观察问题按本站的爻位框架组织，不是经典爻辞。','Observation questions use this app’s positional framework, rather than classical line quotations.'));
      field('advance',tx('推进前，我需要确认什么条件？','What condition would I check before proceeding?'));
      field('signal',tx('什么实际信号，能帮助我重新判断？','What observable signal would help me reassess?'));
      field('pause',tx('出现什么情况，我会先暂缓？','What would lead me to pause?'));
    } else if (current.type === 'mansion') {
      [tx('看见环境','See the setting'),tx('选择姿态','Choose a response')].forEach((label,i)=>choose(label,i,()=>{status.textContent=tx('已选中「'+label+'」，相应解读已标出。','Selected '+label+'. The corresponding interpretation is highlighted.');focus(i);}));
      field('response',tx('面对这件事，我愿意尝试怎样的应对姿态？','What way of responding would I try in this situation?'));
    } else if (current.type === 'number') {
      choices.remove();paragraph(facts.reflectionQuestion || tx('这个意象，让你想起日常中的哪一刻？','What everyday moment does this image bring to mind?'));
      field('observation',tx('记录一个真实发生过的时刻','Describe a moment that actually happened'));
    } else if (current.type === 'rune') {
      [tx('可调用的力量','Available resources'),tx('要守住的边界','A boundary to protect'),tx('一次回应','One response')].forEach((label,i)=>choose(label,i,()=>{status.textContent=tx('已选中「'+label+'」，相应解读已标出。','Selected '+label+'. The corresponding interpretation is highlighted.');focus(i);}));
      field('boundary',tx('我愿意做什么，又需要怎样表达自己的边界？','What am I willing to do, and how would I express my boundary?'));
    } else if (current.type === 'oracle') {
      (facts.poem || []).forEach((line,i)=>choose(String(line),i,()=>{status.textContent=tx('留下「'+line+'」，再结合原诗解读：这一句让你想起什么具体经历？','Keep “'+line+'” and return to the verse interpretation. What specific experience does this line bring to mind?');focus(0);}));
      field('verse',tx('这一句与我的心事，有什么联系？','How does this line connect to my concern?'));
    }
    if (current.isLive && !current.shared) {
      const follow=document.createElement('button');follow.type='button';follow.className='ghost-btn';follow.textContent=tx('带着这些观察，继续追问 →','Continue with these observations →');
      follow.addEventListener('click',()=>{const input=document.getElementById('followupQuestion');const lines=Object.values(state.notes).filter(v=>typeof v==='string' && v.trim());
        const selection=typeof state.selected==='number'?(current.type==='gua'?tx('第'+(state.selected+1)+'爻','Line '+(state.selected+1)):choices.querySelector('[data-choice="'+state.selected+'"]')?.dataset.label):'';
        input.value=(tx('沿用这次取象，我想继续探索：','Continuing the same draw: ')+(selection?selection+'。 ':'')+lines.join('；')).slice(0,400);input.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.followup-panel').open=true;input.focus();input.scrollIntoView({block:'center'});});content.append(follow);
    }
    window.AstraWorkbenchScenes?.decorate({box,content,choices,status,facts,current,state,tx,save,choose,focus,cards});
    const anchor=document.querySelector('#readingBody > .synthesis');if(anchor)anchor.after(box);
  }
  window.AstraReadingWorkbench={mount};
})();
