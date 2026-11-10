(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AstraPinchCore=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function ratio(points){
    if(!Array.isArray(points)||points.length<21||!points.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)))return null;
    const distance=(a,b)=>Math.hypot(points[a].x-points[b].x,points[a].y-points[b].y);
    const width=distance(5,17);return width>.03?distance(4,8)/width:null;
  }
  function create(){
    let armed=false,held=false,last=null,candidate=null,since=0;
    function reset(){armed=false;held=false;last=null;candidate=null;since=0;}
    function update(points,now){
      const value=ratio(points);
      if(value===null){if(last!==null&&now-last>=350){const active=held||armed;reset();return active?'lost':null;}return null;}
      if(last!==null&&now-last>=350){const active=held;reset();last=now;return active?'lost':null;}
      last=now;
      const intent=held?(value>=.42?'release':null):(!armed?(value>=.42?'arm':null):(value<=.28?'start':null));
      if(!intent){candidate=null;return null;}
      if(candidate!==intent){candidate=intent;since=now;return null;}
      if(now-since<70)return null;
      candidate=null;
      if(intent==='arm'){armed=true;return null;}
      if(intent==='start'){held=true;return 'start';}
      held=false;armed=true;return 'release';
    }
    return{update,reset,get held(){return held;},get armed(){return armed;}};
  }
  return{ratio,create};
});
