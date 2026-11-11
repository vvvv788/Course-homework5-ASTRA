/* Interface localization never rewrites a generated reading or a user's text. */
(function(){
 'use strict';
 const names={zh:'中文',en:'English',ja:'日本語',ko:'한국어',fr:'Français',es:'Español'};
 let locale='zh';try{const saved=localStorage.getItem('astra.locale')||localStorage.getItem('lang');if(names[saved])locale=saved;}catch(_){}
 const originals=new WeakMap(),attributes=new WeakMap(),compiled={};let observer=null,ticket=0;
 const protectedContent='.tone,.r-card .txt,.synthesis p,.actions-list li,.closing,.ask-echo-q,.followup-messages,.conversation-content,.record-card p,.record-card b,.reading-quick h3,.reading-quick>p,#oracleVerse,.oracle-caption,.scene-poem,textarea,script,style,[data-original-content],#langToggle,[data-reading-language]';
 const extras={
 ja:{"The original language is kept. Choose Reading language above, then Generate with these symbols.":"原文の言語を保持します。上で解釈の言語を選び、同じ象徴で生成してください。","Save reading":"解釈を保存","YOUR READING":"今回の解釈",'Interface language':'表示言語','Reading language':'解釈の言語','解读语言':'解釈の言語','Use interface language':'表示言語に合わせる','Generate with these symbols':'同じ象徴で解釈を生成','保留取象，按此语言生成':'同じ象徴で解釈を生成','Generation failed. Your previous reading is preserved. Select a language and retry.':'生成できませんでした。前の解釈は保持されています。言語を選び直して再試行してください。'},
 ko:{"The original language is kept. Choose Reading language above, then Generate with these symbols.":"원문 언어를 유지합니다. 위에서 해석 언어를 선택한 뒤 같은 상징으로 생성해 주세요.","Save reading":"해석 저장","YOUR READING":"이번 해석",'Interface language':'화면 언어','Reading language':'해석 언어','解读语言':'해석 언어','Use interface language':'화면 언어 사용','Generate with these symbols':'같은 상징으로 해석 생성','保留取象，按此语言生成':'같은 상징으로 해석 생성','Generation failed. Your previous reading is preserved. Select a language and retry.':'생성하지 못했습니다. 이전 해석은 보존되었습니다. 언어를 선택하고 다시 시도해 주세요.'},
 fr:{"The original language is kept. Choose Reading language above, then Generate with these symbols.":"La langue originale est conservée. Choisissez la langue de l’interprétation ci-dessus, puis générez avec les mêmes symboles.","Save reading":"Enregistrer l’interprétation","YOUR READING":"VOTRE INTERPRÉTATION",'Interface language':"Langue de l’interface",'Reading language':"Langue de l’interprétation",'解读语言':"Langue de l’interprétation",'Use interface language':"Langue de l’interface",'Generate with these symbols':'Générer avec ces symboles','保留取象，按此语言生成':'Générer avec ces symboles','Generation failed. Your previous reading is preserved. Select a language and retry.':"La génération a échoué. Votre interprétation précédente est conservée. Choisissez une langue et réessayez."},
 es:{"The original language is kept. Choose Reading language above, then Generate with these symbols.":"Se conserva el idioma original. Elige el idioma de la interpretación arriba y genera con los mismos símbolos.","Save reading":"Guardar interpretación","YOUR READING":"TU INTERPRETACIÓN",'Interface language':'Idioma de la interfaz','Reading language':'Idioma de la interpretación','解读语言':'Idioma de la interpretación','Use interface language':'Usar el idioma de la interfaz','Generate with these symbols':'Generar con estos símbolos','保留取象，按此语言生成':'Generar con estos símbolos','Generation failed. Your previous reading is preserved. Select a language and retry.':'No se pudo generar. Se conserva la interpretación anterior. Selecciona un idioma e inténtalo de nuevo.'}
 };
 const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 let reverse=null,reverseTemplates=[];
 function canonical(text){
  if(!reverse){reverse=new Map();for(const language of ['ja','ko','fr','es'])for(const [source,value] of Object.entries({...window.AstraLocaleData?.[language],...extras[language]})){if(source!==value&&!reverse.has(value))reverse.set(value,source);}
   for(const [value,source] of reverse){if(/\{\{\d+\}\}/.test(value)&&value.replace(/\{\{\d+\}\}/g,'').length>4){const markers=value.match(/\{\{\d+\}\}/g);reverseTemplates.push({source,markers,regex:new RegExp('^'+value.split(/\{\{\d+\}\}/).map(escape).join('([\\s\\S]+?)')+'$')});}}
  }
  if(reverse.has(text))return reverse.get(text);
  const trimmed=text.trim();if(reverse.has(trimmed))return text.replace(trimmed,reverse.get(trimmed));
  for(const row of reverseTemplates){const match=text.match(row.regex);if(match){let source=row.source;row.markers.forEach((marker,i)=>source=source.split(marker).join(match[i+1]));return source;}}
  return text;
 }
 function translate(text,target=locale,depth=0){
  if(typeof text!=='string'||!text)return text;
  text=canonical(text);
  if(target==='zh')return window.AstraLocaleChinese?.[text]||(text==='Save'?'保存':text==='Saved'?'已保存':'')||text;
  if(target==='en')return text;
  const dictionary=window.AstraLocaleData?.[target]||{},extra=extras[target]||{};
  if(extra[text]!=null)return extra[text];if(dictionary[text]!=null)return dictionary[text];
  const trim=text.trim();if(trim!==text){const value=translate(trim,target,depth);if(value!==trim)return text.slice(0,text.indexOf(trim))+value+text.slice(text.indexOf(trim)+trim.length);}
  if(!compiled[target])compiled[target]=Object.entries(dictionary).filter(([source])=>/\{\{\d+\}\}/.test(source)).map(([source,value])=>{const markers=source.match(/\{\{\d+\}\}/g);const pattern=source.split(/\{\{\d+\}\}/).map(escape).join('([\\s\\S]+?)');return{regex:new RegExp('^'+pattern+'$'),value,markers};});
  for(const row of compiled[target]){const match=text.match(row.regex);if(match){let output=row.value;row.markers.forEach((marker,i)=>output=output.split(marker).join(match[i+1]));return output;}}
  if(depth<2){const numbered=text.match(/^(\d+[.)]\s+)(.+)$/s);if(numbered)return numbered[1]+translate(numbered[2],target,depth+1);if(/ · | → | — /.test(text)){const parts=text.split(/( · | → | — )/);for(let end=parts.length;end>0;end-=2){const prefix=parts.slice(0,end).join('');if(dictionary[prefix]!=null)return dictionary[prefix]+translate(parts.slice(end).join(''),target,depth+1);}return parts.map(part=>translate(part,target,depth+1)).join('');}}
  return text;
 }
 function localize(root=document.body){
  if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){const parent=node.parentElement;if(!parent||parent.closest(protectedContent))continue;const record=originals.get(node),source=record&&node.nodeValue===record.rendered?record.source:node.nodeValue,rendered=translate(source);if(rendered!==node.nodeValue)node.nodeValue=rendered;originals.set(node,{source,rendered});}
  root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el=>{if(el.matches('#langToggle,[data-reading-language]')||(el.closest(protectedContent)&&!el.matches('input,textarea')))return;const records=attributes.get(el)||{};for(const name of ['placeholder','aria-label','title']){const value=el.getAttribute(name);if(!value)continue;const previous=records[name],source=previous&&value===previous.rendered?previous.source:value,rendered=translate(source);if(rendered!==value)el.setAttribute(name,rendered);records[name]={source,rendered};}attributes.set(el,records);});
 }
 function schedule(){if(ticket)return;ticket=requestAnimationFrame(()=>{ticket=0;localize();});}
 function set(value){if(!names[value])return false;locale=value;try{localStorage.setItem('astra.locale',locale);}catch(_){}document.documentElement.lang=value==='zh'?'zh-CN':value;schedule();return true;}
 function start(){if(observer)return;observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});localize();}
 window.AstraLocale={names,get:()=>locale,set,translate,localize,start};
})();
