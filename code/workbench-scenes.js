/* Tangible same-draw controls. Pointer gestures always have native button/keyboard alternatives. */
(function () {
  'use strict';
  const node = (tag, cls, text) => { const el=document.createElement(tag); if(cls)el.className=cls;if(text!=null)el.textContent=text;return el; };
  function art(src, cls='scene-art') { const el=node('img',cls);el.src=src;el.alt='';el.draggable=false;el.decoding='async';return el; }
  function decorate({box,content,choices,status,facts,current,state,tx,save,choose,focus,cards}) {
    const method=current.type;box.dataset.method=method;
    const intro=node('p','scene-instruction');content.prepend(intro);
    const buttons=()=>[...choices.querySelectorAll('button[data-choice]')];
    function labelButton(button, label, index) {
      button.dataset.label=label;button.setAttribute('aria-label',label);button.replaceChildren();
      const caption=node('span','scene-caption');caption.append(node('small','scene-index',String(index+1).padStart(2,'0')),node('b','',label));button.append(caption);return caption;
    }
    function syncEffect(effect) { choices.addEventListener('click',event=>{const button=event.target.closest('button[data-choice]');if(button)effect(Number(button.dataset.choice));});if(Number.isInteger(state.selected))effect(state.selected); }
    if(method==='tarot') {
      intro.textContent=tx('轻触一张牌，让它成为本次牌阵的观察起点。','Touch a card to make it the starting point for exploring this spread.');
      buttons().forEach((button,i)=>{const card=current.data.cards?.[i],label=button.textContent;labelButton(button,label,i);if(card&&Number.isInteger(card.idx)&&card.idx>=0&&card.idx<22){const img=art('assets/tarot/'+card.idx+'.webp');if(['逆','rev','reversed',1].includes(card.orient))img.classList.add('is-reversed');button.prepend(img);} });
      choices.classList.add('scene-tarot-spread');choices.dataset.count=String(current.data.cards.length);
      const thread=node('div','tarot-thread',window.AstraTarotSpreads.get(current.data.spreadId).positions[tx('zh','en')==='en'?1:0].join(' · '));choices.after(thread);
      syncEffect(i=>{choices.dataset.active=String(i);thread.textContent=tx('从第'+(i+1)+'张出发，再回到这次想理清的问题。','Start with card '+(i+1)+', then return to the question you brought.');});
    } else if(method==='rune') {
      intro.textContent=tx('拖住石下的小握柄，放入阵心；也可以直接轻触一枚符石。','Drag a stone by its grip into the circle, or simply touch one.');
      choices.classList.add('scene-rune-stones');const altar=node('div','rune-drop');altar.append(node('span','rune-drop-mark','✦'),node('span','rune-drop-caption',tx('把一枚符石放入阵心','Place a stone in the circle')));content.insertBefore(altar,choices);
      buttons().forEach((button,i)=>{const index=current.data.runes?.[i],role=button.textContent;const name=facts.runeNames?.[i]||current.r.readings[i]?.card||role;const caption=labelButton(button,name+' · '+role,i);caption.replaceChildren(node('b','',name),node('small','',role));const stone=node('span','rune-touchstone');if(Number.isInteger(index)&&index>=0&&index<24)stone.append(art('assets/runes/visions/'+String(index).padStart(2,'0')+'.webp'));stone.append(node('span','rune-glyph',facts.glyphs?.[i]||'✦'));button.prepend(stone);const grip=node('span','rune-grip',tx('⠿ 拖入阵心','⠿ Drag to circle'));grip.dataset.grip='';button.append(grip);
        let drag=null,suppress=false;
        button.addEventListener('click',event=>{if(suppress){event.preventDefault();event.stopImmediatePropagation();}},true);
        grip.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false,ghost:null,ctrl:new AbortController()};window.addEventListener('pointerup',finish,{signal:drag.ctrl.signal});window.addEventListener('pointercancel',finish,{signal:drag.ctrl.signal});grip.setPointerCapture(event.pointerId);});
        grip.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>7&&!drag.moved){drag.moved=true;drag.ghost=stone.cloneNode(true);drag.ghost.classList.add('rune-drag-ghost');drag.ghost.setAttribute('aria-hidden','true');document.body.append(drag.ghost);altar.classList.add('is-awaiting');}if(drag.ghost){drag.ghost.style.left=event.clientX+'px';drag.ghost.style.top=event.clientY+'px';}});
        const finish=event=>{if(!drag||drag.id!==event.pointerId)return;const d=drag;drag=null;d.ctrl.abort();d.ghost?.remove();altar.classList.remove('is-awaiting');if(d.moved){const r=altar.getBoundingClientRect(),hit=event.type!=='pointercancel'&&event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;suppress=true;setTimeout(()=>{suppress=false;if(hit&&button.isConnected)button.click();},0);}};
        grip.addEventListener('pointerup',finish);grip.addEventListener('pointercancel',finish);grip.addEventListener('lostpointercapture',finish);box.addEventListener('toggle',()=>{if(!box.open&&drag){drag.ctrl.abort();drag.ghost?.remove();drag=null;altar.classList.remove('is-awaiting');}});
      });
      syncEffect(i=>{const button=buttons()[i];if(!button)return;altar.replaceChildren();const stone=button.querySelector('.rune-touchstone')?.cloneNode(true);if(stone)altar.append(stone);altar.append(node('span','rune-drop-caption',facts.runeNames?.[i]||current.r.readings[i]?.card||''));altar.dataset.selected=String(i);status.textContent=tx('这次先带上这枚符文：'+(facts.meanings?.[i]||button.dataset.label)+'。它在原解读中的位置已点亮。','Carry this rune for now: '+(facts.meanings?.[i]||button.dataset.label)+'. Its part of the reading is highlighted.');});
    } else if(method==='mansion') {
      intro.textContent=tx('拉动星幕：一边看环境，一边看自己的应对姿态。','Draw the veil: see the setting on one side and your response on the other.');
      const scene=node('div','mansion-veil'),sky=node('div','veil-sky'),beast=node('div','veil-beast');sky.append(art('assets/mansion/atlas.webp'));const src=document.querySelector('#readingStage .mansion-beast-bg')?.getAttribute('src');if(src?.startsWith('assets/mansion/'))beast.append(art(src));else beast.append(node('span','',facts.beast||''));const seam=node('span','veil-seam');scene.append(sky,beast,seam);content.insertBefore(scene,choices);
      const range=node('input','veil-slider');range.type='range';range.min='0';range.max='100';range.step='1';range.value=String(Number.isFinite(state.veil)?state.veil:50);range.setAttribute('aria-label',tx('拉动星幕切换星宿与守护兽视角','Draw the veil between mansion and guardian perspectives'));scene.append(range);
      const names=[facts.name,facts.beast];buttons().forEach((button,i)=>{const role=button.textContent;const caption=labelButton(button,(names[i]||'')+' · '+role,i);caption.replaceChildren(node('b','',names[i]||''),node('small','',role));});
      syncEffect(i=>{status.textContent=i===0?tx('从星宿看环境：','See the setting through the mansion: ')+(facts.imagery||facts.name||''):tx('借“'+(facts.beast||'守护兽')+'”的姿态，看看自己可以怎样回应。','Borrow the image of '+(facts.beast||'the guardian')+' to explore a way of responding.');});
      const setVeil=value=>{scene.style.setProperty('--veil',value+'%');range.value=String(value);};setVeil(Number(range.value));
      range.addEventListener('input',()=>{const value=Number(range.value);state.veil=value;setVeil(value);const index=value>=50?1:0;if(state.selected!==index)buttons()[index]?.click();});range.addEventListener('change',save);
      choices.addEventListener('click',event=>{const button=event.target.closest('button[data-choice]');if(button&&document.activeElement!==range){state.veil=Number(button.dataset.choice)===0?12:88;setVeil(state.veil);save();}});
    } else if(method==='number') {
      intro.textContent=tx('拨动星轨，选一个此刻想照看的方向。印记仍是这一次取到的那一枚。','Turn the orbit toward what needs attention. Your drawn symbol stays the same.');
      content.insertBefore(choices,status);choices.classList.add('orbit-options');const wheel=node('div','orbit-wheel');wheel.setAttribute('aria-hidden','true');const index=current.data.symbolIdx;if(Number.isInteger(index)&&index>=0&&index<12)wheel.append(art('assets/numerology/'+index+'.webp'));wheel.append(node('span','orbit-title',facts.symbol||''),node('span','orbit-handle'));content.insertBefore(wheel,choices);
      const range=node('input','orbit-slider');range.type='range';range.min='0';range.max='2';range.step='1';range.value=String(Number.isInteger(state.selected)?state.selected:0);range.setAttribute('aria-label',tx('拨动星轨选择留白、守住或尝试','Turn the orbit toward pause, keep or try'));content.insertBefore(range,choices);
      const labels=[tx('留白','Pause'),tx('守住','Keep'),tx('尝试','Try')];const prompts=[tx('哪一处可以暂时松手，给重要的事留一点空间？','What could you set down to make room for what matters?'),tx('哪一个已经有用的节律，值得继续保留？','Which helpful rhythm would you keep?'),tx('哪一个足够小的改变，今天就能试一试？','What small change could you try today?')];
      labels.forEach((label,i)=>choose(label,i,()=>{wheel.style.setProperty('--turn',(i*120)+'deg');range.value=String(i);status.textContent=(facts.symbol||'')+' · '+prompts[i];focus(0);}));
      if(Number.isInteger(state.selected)){wheel.style.setProperty('--turn',(state.selected*120)+'deg');status.textContent=(facts.symbol||'')+' · '+prompts[state.selected];}
      range.addEventListener('input',()=>buttons()[Number(range.value)]?.click());
      let held=false,last=-1;wheel.addEventListener('pointerdown',event=>{if(event.button!==0)return;held=true;wheel.setPointerCapture(event.pointerId);last=-1;pick(event);});wheel.addEventListener('pointermove',event=>{if(held)pick(event);});['pointerup','pointercancel','lostpointercapture'].forEach(type=>wheel.addEventListener(type,()=>{held=false;}));
      function pick(event){const r=wheel.getBoundingClientRect(),angle=(Math.atan2(event.clientY-r.top-r.height/2,event.clientX-r.left-r.width/2)+Math.PI/2+Math.PI*2)%(Math.PI*2),i=Math.floor((angle+Math.PI/3)%(Math.PI*2)/(Math.PI*2/3));if(i!==last){last=i;buttons()[i]?.click();}}
    } else if(method==='oracle') {
      intro.textContent=tx('轻触一句，或用鼠标划过签诗，留住最有共鸣的那一行。','Touch a line, or brush across the verse with your mouse, to keep the one that speaks to you.');choices.classList.add('scene-poem');
      buttons().forEach((button,i)=>{const line=button.textContent;labelButton(button,line,i);button.classList.add('poem-line');});
      let brushing=false;choices.addEventListener('pointerdown',event=>{brushing=event.pointerType==='mouse'&&event.button===0;});choices.addEventListener('pointermove',event=>{if(!brushing||!event.buttons)return;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('button[data-choice]');if(target&&choices.contains(target)&&Number(target.dataset.choice)!==state.selected)target.click();});['pointerup','pointercancel','pointerleave'].forEach(type=>choices.addEventListener(type,()=>{brushing=false;}));
    } else if(method==='gua') intro.textContent=tx('点选同一个爻位，看见它在两卦中的对应。','Touch a line to see its position in both hexagrams.');
    // Writing is optional and secondary to the tangible interaction.
    const fields=[...content.querySelectorAll(':scope > .workbench-field')];if(fields.length){const note=node('details','workbench-note');note.open=Object.values(state.notes).some(v=>typeof v==='string'&&v.trim());note.append(node('summary','',tx('留一句自己的话 · 可选','Leave a thought · optional')));const inner=node('div','workbench-note-body');fields.forEach(field=>inner.append(field));note.append(inner);content.append(note);}
    if(method!=='gua'){
      const view=node('button','ghost-btn workbench-view',tx('在正文中看这一部分 ↗','View this part in the reading ↗'));view.type='button';view.hidden=!Number.isInteger(state.selected);view.addEventListener('click',()=>{const index=['oracle','number'].includes(method)?0:state.selected;if(cards[index])focus(index,true);});status.after(view);choices.addEventListener('click',()=>{view.hidden=false;});
    }
  }
  window.AstraWorkbenchScenes={decorate};
})();
