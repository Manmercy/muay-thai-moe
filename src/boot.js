(function(){
/* v1.87: Thai code ships inside index.html; English code (en.js) and the dictionary (i18n.js) load only when needed */
var B="__BUILD__";
var L="";try{L=localStorage.getItem("mtm_lang")||"";}catch(e){}
try{var h=(location.hash||"").match(/lang=(th|en)/);if(h)L=h[1];}catch(e){}
if(L!=="th"&&L!=="en")L="th";
window.LANG=L;try{document.documentElement.lang=L;}catch(e){}
var D=null,R=null,DP=null;
function fwd(){return D||{};}
function rev(){if(!D)return {};if(!R){var d=D,c={};R={};for(var k in d){var v=d[k];if(!v||v.trim().length<2||/^[a-z0-9_]+$/.test(v))continue;if(c[v]){delete R[v];continue;}c[v]=1;R[v]=k;}}return R;}
/* plain <script src> instead of fetch, so English also works when index.html is opened straight from disk */
function addJs(u){return new Promise(function(ok,no){var el=document.createElement("script");el.src=u;el.async=false;el.onload=ok;el.onerror=function(){el.remove();no(new Error("load "+u));};document.body.appendChild(el);});}
function loadDict(){if(DP)return DP;DP=addJs("i18n.js?v="+B).then(function(){D=window.__MTM_DICT||{};R=null;return D;},function(e){DP=null;throw e;});return DP;}
window.MTM_DICT=loadDict;
/* v1.90: chapters that ship as their own file (region.js) load through the same plain <script src> */
window.MTM_JS=addJs;window.MTM_BUILD=B;
function tr(s,m,split){if(Object.prototype.hasOwnProperty.call(m,s))return m[s];
  if(split&&s.indexOf(" ")>0){var p=s.split(" ");for(var i=0;i<p.length;i++)if(!Object.prototype.hasOwnProperty.call(m,p[i]))return s;return p.map(function(x){return m[x];}).join(" ");}return s;}
function walk(o,m,split,depth){if(depth>12||!o||typeof o!=="object")return o;
  if(Array.isArray(o)){for(var i=0;i<o.length;i++){var v=o[i];o[i]=typeof v==="string"?tr(v,m,split):walk(v,m,split,depth+1);}return o;}
  var ks=Object.keys(o);for(var j=0;j<ks.length;j++){var k=ks[j],v=o[k],nv=typeof v==="string"?tr(v,m,split):walk(v,m,split,depth+1),nk=/[฀-๿]/.test(k)||split===false?tr(k,m,false):k;
    if(nk!==k&&!(nk in o)){delete o[k];o[nk]=nv;}else o[k]=nv;}return o;}
window.I18N_FIX=function(s){try{if(!s||typeof s!=="object")return s;var from=s._lang||"th";if(from===L)return s;if(!D)return s;
  if(L==="en")walk(s,fwd(),true,0);else walk(s,rev(),false,0);s._lang=L;}catch(e){}return s;};
/* a small boot screen while English or the dictionary downloads */
function veil(t){var v=document.getElementById("mtm-veil");if(!v){v=document.createElement("div");v.id="mtm-veil";
  v.innerHTML='<div class="mv-box"><img src="a/logo.webp" alt="Muay Thai Moe"><div class="mv-bar"><i></i></div><p></p></div>';document.body.appendChild(v);}
  v.querySelector("p").textContent=t;return v;}
function unveil(){var v=document.getElementById("mtm-veil");if(v)v.remove();}
function run(src){var el=document.createElement("script");el.text=src;document.body.appendChild(el);if(!window.__MTM_RAN){try{(0,eval)(src);}catch(e){console.error(e);}}}
function runTH(){run(document.getElementById("js-th").textContent);}
function hasEnSave(){try{for(var i=0;i<localStorage.length;i++){var v=localStorage.getItem(localStorage.key(i));if(v&&v.indexOf('"_lang":"en"')>=0)return true;}}catch(e){}return false;}
if(L==="en"){veil("Loading English…");
  loadDict().then(function(){return addJs("en.js?v="+B);}).then(function(){unveil();if(!window.__MTM_RAN)throw new Error("en did not run");}).catch(
    function(){if(window.__MTM_RAN)return;veil("โหลดภาษาอังกฤษไม่สำเร็จ เปิดเป็นภาษาไทยแทน · Couldn't load English, opening in Thai");L="th";window.LANG="th";try{document.documentElement.lang="th";localStorage.setItem("mtm_lang","th");}catch(e){}setTimeout(function(){unveil();runTH();},1200);});}
else if(hasEnSave()){veil("กำลังโหลด…");loadDict().then(function(){unveil();runTH();},function(){unveil();runTH();});}
else runTH();
/* keep art on the device so the next visit opens instantly (GitHub Pages / any https host) */
try{if("serviceWorker" in navigator&&location.protocol==="https:"&&!/claude|claudeusercontent|anthropic/.test(location.hostname))navigator.serviceWorker.register("sw.js?v="+B).catch(function(){});}catch(e){}
})();
