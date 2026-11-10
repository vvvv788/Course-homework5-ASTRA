/* Horizontal open-palm intent, independent of the camera and UI. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AstraPalmDeck=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function create(){
    let anchor=null,previous=null,filtered=null,active=false,motionX=0,motionAt=0,cooldown=0;
    function reset(){anchor=previous=filtered=null;active=false;cooldown=0;}
    function finish(now){const wasActive=active;anchor=previous=filtered=null;active=false;cooldown=now+220;return{phase:wasActive?'end':'idle'};}
    function update(sample){
      const {x,y,now,open,enabled,inside}=sample;
      if(!enabled||!open||!Number.isFinite(x)||!Number.isFinite(y))return finish(now);
      if(previous&&(now-previous.now>250||Math.hypot(x-previous.x,y-previous.y)>.2))return finish(now);
      if(!active&&!inside)return finish(now);
      if(now<cooldown){previous={x,y,now};return{phase:'idle'};}
      if(!anchor){anchor={x,y,now};previous={x,y,now};filtered=x;return{phase:'idle'};}
      const dt=Math.max(1,now-previous.now);filtered+=(x-filtered)*(1-Math.exp(-dt/35));previous={x,y,now};
      const dx=filtered-anchor.x,dy=y-anchor.y;
      if(Math.abs(dy)>.1)return finish(now);
      if(!active){
        if(Math.abs(dx)>.025&&Math.abs(dx)>Math.abs(dy)*1.5&&now-anchor.now>=70){active=true;motionX=filtered;motionAt=now;return{phase:'start',distance:dx};}
        if(now-anchor.now>250&&Math.abs(dx)<.01&&Math.abs(dy)<.01){anchor={x:filtered,y,now};}
        return{phase:'idle'};
      }
      if(Math.abs(filtered-motionX)>.008){motionX=filtered;motionAt=now;}
      if(now-motionAt>=Math.max(180,dt*1.7))return finish(now);
      return{phase:'move',distance:dx};
    }
    return{update,reset,get active(){return active;}};
  }
  return{create};
});
