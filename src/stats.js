;/* v1.91.165 — anonymous play statistics (PostHog capture API, no SDK, no cookies).
   Sends only: a random per-browser id, game progress (season/week), feature use, fights, story scenes seen,
   device type, language and version. No names, no save contents. Off when SETTINGS.analytics===false
   or when STATS_KEY is empty. Batches events and flushes with sendBeacon. */
const STATS_KEY="phc_C7kqHmFMTwvFsaAWp7Gk8a88YnibRorqGZMUdMEdejsY";                              /* PostHog project API key (phc_…) — public by design */
const STATS_HOST="https://us.i.posthog.com";     /* EU projects: https://eu.i.posthog.com */
(function(){
  if(typeof window==="undefined")return;
  const on=()=>!!STATS_KEY&&SETTINGS.analytics!==false&&!/localhost|127\.0\.0\.1/.test(location.hostname);
  const rid=()=>(crypto&&crypto.randomUUID)?crypto.randomUUID():"x"+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
  let aid="",first=false;try{aid=localStorage.getItem("mtm_aid")||"";if(!aid){aid=rid();first=true;localStorage.setItem("mtm_aid",aid);}}catch(e){aid=rid();}
  const sid=rid(),t0=Date.now();let q=[],wk0=null,errs=0,lastSeen=null,timer=null;
  const ua=navigator.userAgent||"";
  const os=/iPhone|iPad|iPod/.test(ua)?"iOS":/Android/.test(ua)?"Android":/Windows/.test(ua)?"Windows":/Mac/.test(ua)?"Mac":/Linux/.test(ua)?"Linux":"Other";
  const inapp=/FBAN|FBAV|Instagram|Line\//.test(ua)?"in-app":"browser";
  const mobile=(window.matchMedia&&matchMedia("(pointer:coarse)").matches)||/Mobi|Android|iPhone/.test(ua);
  const base=()=>{const p={distinct_id:aid,$session_id:sid,v:typeof VERSION!=="undefined"?VERSION:"",lang:window.LANG||"th",
      device:mobile?"mobile":"desktop",os,app:inapp,$screen_width:screen.width,$screen_height:screen.height,$current_url:location.origin+location.pathname,$lib:"mtm"};
    if(typeof G!=="undefined"&&G&&G.player){p.season=G.season||1;p.week=G.week;p.weeks_played=typeof gameWeek==="function"?gameWeek(G):null;p.slot=UI&&UI.slot;}
    return p;};
  const send=(beacon)=>{if(!q.length)return;const body=JSON.stringify({api_key:STATS_KEY,batch:q});q=[];
    try{if(beacon&&navigator.sendBeacon){navigator.sendBeacon(STATS_HOST+"/batch/",new Blob([body],{type:"text/plain"}));return;}
      fetch(STATS_HOST+"/batch/",{method:"POST",body,headers:{"Content-Type":"text/plain"},keepalive:true}).catch(()=>{});}catch(e){}};
  const track=(event,props)=>{if(!on())return;try{q.push({event,properties:Object.assign(base(),props||{}),timestamp:new Date().toISOString()});
      if(q.length>=20)send();else{clearTimeout(timer);timer=setTimeout(()=>send(),8000);}}catch(e){}};
  window.MTM_STATS={track,flush:()=>send(true),id:()=>aid};
  /* session start + pageview */
  setTimeout(()=>{let saves=0;try{for(let i=1;i<=3;i++)if(typeof slotKey==="function"&&localStorage.getItem(slotKey(i)))saves++;}catch(e){}
    track("$pageview",{$set_once:{first_seen_v:typeof VERSION!=="undefined"?VERSION:"",first_lang:window.LANG||"th"},$set:{lang:window.LANG||"th",device:mobile?"mobile":"desktop",os}});
    track("session_start",{new_player:first,saves,referrer:document.referrer?(()=>{try{return new URL(document.referrer).hostname;}catch(e){return "";}})():""});},1500);
  /* session end */
  const end=()=>{if(!on())return;track("session_end",{minutes:Math.round((Date.now()-t0)/600)/100,weeks_this_session:wk0===null||typeof G==="undefined"||!G?0:Math.max(0,gameWeek(G)-wk0)});send(true);};
  addEventListener("pagehide",end);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")send(true);});
  /* errors (first 5 per session) */
  addEventListener("error",e=>{if(errs++<5)track("js_error",{msg:String(e.message||"").slice(0,160),src:String(e.filename||"").replace(/.*\//,"")+":"+(e.lineno||0)});});
  /* new game */
  const wrapAct=(k,fn)=>{if(typeof ACT==="undefined"||typeof ACT[k]!=="function")return;const o=ACT[k];ACT[k]=function(d){const r=o.apply(this,arguments);try{fn(d);}catch(e){}return r;};};
  wrapAct("beginNew",i=>track("new_game",{slot:i}));
  wrapAct("avsave",()=>{if(typeof G!=="undefined"&&G&&gameWeek(G)<=1&&!Object.keys(G.seen||{}).length){lastSeen=0;wk0=gameWeek(G);track("creator_done",{});}});
  wrapAct("pickslot",()=>{if(typeof G!=="undefined"&&G&&G.player){wk0=gameWeek(G);lastSeen=Object.keys(G.seen||{}).length;track("game_loaded",{});}});
  /* feature use */
  const FEAT={minibag:"minigame",qsgo:"quiz_show",petsopen:"pets",petgo:"pet_play",giftpick:"gift_menu",give:"gift_given",sign:"sign_fighter",
    dmpick:"deathmatch_menu",dmstart:"deathmatch_start",campacts:"camp_activities",date:"date",chat:"chat",tab:"tab"};
  for(const k in FEAT)wrapAct(k,d=>{if(k==="tab"){track("tab_open",{tab:d&&d.v});return;}track("feature",{name:FEAT[k],id:d&&(d.id||d.v)||null});});
  /* weekly progress + story scenes (diff of G.seen) */
  if(typeof endWeek==="function"){const ow=endWeek;window.endWeek=endWeek=function(){if(typeof G!=="undefined"&&G){if(wk0===null)wk0=gameWeek(G);if(lastSeen===null)lastSeen=Object.keys(G.seen||{}).length;}const r=ow.apply(this,arguments);
    try{setTimeout(()=>{if(typeof G==="undefined"||!G)return;const w=gameWeek(G);
      track("week_end",{cash:Math.round(G.cash||0),fighters:typeof roster==="function"?roster(G).length:null,merit:typeof GHX!=="undefined"&&GHX.ghSt?GHX.ghSt(G).merit:null,pets:(G.pets||[]).length});
      const ks=Object.keys(G.seen||{});if(lastSeen!==null&&ks.length>lastSeen)ks.slice(lastSeen).slice(0,12).forEach(id=>track("story_scene",{id}));lastSeen=ks.length;
      if(G.ended&&!G.__endSent){G.__endSent=1;track("game_over",{reason:String(G.ended).slice(0,40),weeks:w});}
      if(w%26===0)track("milestone",{weeks:w});},0);}catch(e){}return r;};}
  if(typeof newSeason==="function"){const os2=newSeason;window.newSeason=newSeason=function(){const r=os2.apply(this,arguments);try{track("season_start",{season:(arguments[0]&&arguments[0].season)||(typeof G!=="undefined"&&G&&G.season)});}catch(e){}return r;};}
  if(typeof fightEnd==="function"){const of=fightEnd;window.fightEnd=fightEnd=function(){const U=UI.fight;const r=of.apply(this,arguments);
    try{const b=U&&U.b||{},w=U&&U.F&&U.F.result&&U.F.result.win;track("fight",{tier:b.tier||"",result:w==="A"?"win":w==="B"?"lose":"draw",quest:b.ev?String(b.ev).slice(0,20):null,dm:!!b.dm,rounds:b.rounds||null});}catch(e){}return r;};}
})();
