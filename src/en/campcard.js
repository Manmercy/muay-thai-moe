/* v1.92 (Man): the camp card — a Pokédex-style profile card of the camp, saved as a PNG to show off.
   The player picks the weather, whether the fighters line up and cheer, and the card's pixel pattern.
   The card is drawn into a 1080x1350 canvas (4:5, fits a social post); the preview <img> is the PNG itself,
   so a long press saves it even where the share sheet is missing. */
const CC_W=1080,CC_H=1400;
const CC_THEMES={
  dex:{name:"Dex red",bg:"#c8283c",bg2:"#a01e30",pat:"dots",panel:"#f4ead8",ink:"#1b1230",sub:"#6a5a7a",acc:"#ffd34a",line:"#1b1230"},
  gold:{name:"Champion gold",bg:"#d9a520",bg2:"#b8861a",pat:"diamond",panel:"#fff6dc",ink:"#3a2408",sub:"#8a6a30",acc:"#c8283c",line:"#3a2408"},
  thai:{name:"Thai pattern",bg:"#7a1f2b",bg2:"#f2c14e",pat:"kanok",panel:"#fbf1dc",ink:"#3a1018",sub:"#8a4a50",acc:"#f2c14e",line:"#3a1018"},
  night:{name:"Starry night",bg:"#1d1f4a",bg2:"#f4e9ff",pat:"stars",panel:"#2b2d5e",ink:"#f4ecff",sub:"#b8b4e0",acc:"#8ad7ff",line:"#0b0a22",hd:"#ffd34a"},
  jade:{name:"Jade",bg:"#2f8a4f",bg2:"#226a3c",pat:"stripes",panel:"#eef7e6",ink:"#123a20",sub:"#4a7a5a",acc:"#f2c14e",line:"#123a20"},
  pink:{name:"Sweet pink",bg:"#e07fae",bg2:"#f8b6d3",pat:"check",panel:"#fff0f6",ink:"#5c2140",sub:"#a4427a",acc:"#7a3fc0",line:"#5c2140"},
  mono:{name:"Retro mono",bg:"#2a2a2e",bg2:"#e8e8e0",pat:"check",panel:"#e8e8e0",ink:"#1a1a1e",sub:"#5a5a60",acc:"#c8283c",line:"#1a1a1e"},
};
const CC_MOODS=[["day","☀️ Day"],["sunset","🌇 Sunset"],["dawn","🌅 Dawn"],["rain","🌧️ Rain"],["night","🌙 Night"]];
const ccOpt=()=>{UI.ccard=UI.ccard||{mood:"sunset",theme:"dex",lineup:1};return UI.ccard;};
function campCardHTML(){const o=ccOpt();
  const chip=(act,v,lab,on,ttl)=>`<button class="ccchip${on?" on":""}" data-act="${act}" data-v="${v}" aria-pressed="${on}"${ttl?` title="${ttl}" aria-label="${ttl}"`:""}>${lab}</button>`;
  return `<h2>Camp Card</h2>
   <div class="ccprev"><img id="ccardimg" alt="Muay Thai camp card" src=""><div class="ccwait">Drawing the card…</div></div>
   <div class="ccopts">
    <div class="ccrow">${CC_MOODS.map(([k,l])=>chip("ccmood",k,l.split(" ")[0],o.mood===k,l.split(" ").slice(1).join(" "))).join("")}<span class="ccsep"></span>${chip("cclineup",o.lineup?"0":"1",o.lineup?"🙌":"🥊",!!o.lineup,o.lineup?"Line up & cheer":"Training as usual")}</div>
    <div class="ccrow">${Object.entries(CC_THEMES).map(([k,t])=>`<button class="ccsw${o.theme===k?" on":""}" data-act="cctheme" data-v="${k}" aria-pressed="${o.theme===k}" title="${t.name}" aria-label="${t.name}" style="--a:${t.bg};--b:${t.panel}"></button>`).join("")}</div></div>
   <button class="btn primary ccsave" data-act="showcaseSave">💾 Save sticker PNG</button>
   <p class="meta center ccnote">Transparent background, ready for your story · long-press the image to save too</p>`;}
let ccBusy=0,ccLastKey="",ccURL="";
function campCardMount(){const im=document.getElementById("ccardimg");if(!im||typeof G==="undefined"||!G)return;const o=ccOpt(),key=JSON.stringify(o)+"|"+(G.week||0);
  if(key===ccLastKey&&ccURL){if(im.getAttribute("src")!==ccURL){im.src=ccURL;im.parentNode.classList.add("ok");}return;}
  if(ccBusy)return;ccBusy=1;campCardDraw(o).then(cv=>{ccBusy=0;ccLastKey=key;try{ccURL=cv.toDataURL("image/png");}catch(e){ccURL="";}const el=document.getElementById("ccardimg");if(el&&ccURL){el.src=ccURL;el.parentNode.classList.add("ok");}
    if(JSON.stringify(ccOpt())+"|"+(G.week||0)!==key)campCardMount();}).catch(e=>{ccBusy=0;console.error(e);});}
/* the camp scene, as the live camp would draw it with the chosen weather / line-up */
function ccScene(o,W,H){return new Promise(res=>{const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");let n=0;
  const step=()=>{window.__campMood=o.mood;window.__campLineup=o.lineup?1:0;try{x.clearRect(0,0,W,H);for(let i=0;i<3;i++)drawCamp(x,G,61000+i*40);}finally{window.__campMood=null;window.__campLineup=0;}
    if(c.__caOn||++n>40||(typeof SETTINGS!=="undefined"&&SETTINGS.classicCamp))res(c);else setTimeout(step,80);};step();});}
const ccWaitImg=im=>new Promise(r=>{if(!im||(im.complete&&im.naturalWidth)||im.complete)return r();im.addEventListener("load",r,{once:true});im.addEventListener("error",r,{once:true});setTimeout(r,2500);});
/* v1.92 (Man): the pill shows the relationship — heart level and the step on her ladder — not injuries */
function ccStatus(f){let lv=1,lab="";try{lv=heartLv(f).lv||1;}catch(e){}try{lab=relLabel(G,f,null,true)||"";}catch(e){}
  const lover=(G.lovers||[]).includes(f.id)||(G.romance&&G.romance===f.id);
  return [`♥${lv}${lab?" · "+lab:""}`,lover?"#e0569a":lv>=7?"#c8283c":lv>=4?"#d0601c":"#7a5a8a"];}
function ccPortrait(e){return new Promise(res=>{if(typeof MGRP==="undefined"||!G)return res(null);const L=G.avatar||{gender:(G.player&&G.player.gender)||"m"};let done=0;
  const go=()=>{if(done)return;const u=MGRP.url(L,e,go);if(!u)return;done=1;const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=u;};go();setTimeout(()=>{if(!done){done=1;res(null);}},4000);});}
/* the card is drawn on a transparent canvas, then cut out like a sticker: a white rim and a soft drop shadow around its outline */
async function campCardDraw(o){const T=CC_THEMES[o.theme]||CC_THEMES.dex,W=CC_W;let H=CC_H;
  try{if(document.fonts&&document.fonts.ready)await document.fonts.ready;}catch(e){}
  const R=roster(G).slice().sort((a,b)=>(b.lvl||0)-(a.lvl||0)),pets=(G.pets||[]);
  await Promise.all(R.slice(0,6).map(f=>ccWaitImg(sheetFor(f))));
  const [scene,face]=await Promise.all([ccScene(o,960,540),ccPortrait("smile")]);
  const petIm=pets.slice(0,6).map(p=>{const i=new Image();try{i.src=petIcon(p.k);}catch(e){}return i;});await Promise.all(petIm.map(ccWaitImg));
  /* v1.91.208 (Man: show off the camp's honours) — a trophy shelf under the camp scene: the same pixel cups/belts/medals as the trophy room,
     one per kind with a ×count, most prestigious first */
  const LVR={national:0,region:1,province:2,district:3,local:4,gen:5},HG=[];
  try{for(const t of trophyItems()){if(t.kind==="cert")continue;const k=t.kind+"|"+t.title+"|"+(t.pal&&t.pal.b)+"|"+(t.pal&&t.pal.c);let g=HG.find(z=>z.k===k);if(!g)HG.push(g={k,t,n:0});g.n++;}}catch(e){}
  HG.sort((a,b)=>(LVR[a.t.lv]??9)-(LVR[b.t.lv]??9)||b.n-a.n);
  const HS=HG.length?182:0;
  const CX=48,CY=120,CW=W-96,HY=CY+30,SY=HY+190,FY=SY+572+HS,nr=Math.ceil(Math.min(6,R.length)/2),PY=FY+(nr?nr*112+30:0),END=(pets.length?PY+136:PY-14)+64,CH=END-CY;H=END+48;
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");
  const B=(X,Y,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(X),Math.round(Y),Math.round(w),Math.round(h));};
  const box=(X,Y,w,h,fill,line,u)=>{u=u||6;B(X+u,Y,w-2*u,h,line);B(X,Y+u,w,h-2*u,line);B(X+u,Y+u,w-2*u,h-2*u,fill);};
  const FONT=(px,w)=>`${w||700} ${px}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;
  const txt=(s,X,Y,px,c,al,w,mw)=>{x.font=FONT(px,w);if(mw){const m=x.measureText(s).width;if(m>mw){px=Math.floor(px*mw/m);x.font=FONT(px,w);}}x.fillStyle=c;x.textAlign=al||"left";x.textBaseline="alphabetic";x.fillText(s,X,Y);};
  const disc=(cx,cy,r,c)=>{for(let dy=-r;dy<=r;dy+=4){const hw=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy))/4)*4;B(cx-hw,cy+dy,hw*2,4,c);}};
  // --- card body: patterned frame with stepped pixel corners
  const u=12;
  box(CX,CY,CW,CH,T.bg,T.line,24);
  x.save();x.beginPath();x.rect(CX+10,CY+10,CW-20,CH-20);x.clip();
  for(let yy=CY;yy<CY+CH;yy+=u)for(let xx=CX;xx<CX+CW;xx+=u){const i=Math.round((xx-CX)/u),j=Math.round((yy-CY)/u);let on=false;
    if(T.pat==="dots")on=i%4===1&&j%4===1;else if(T.pat==="check")on=(Math.floor(i/2)+Math.floor(j/2))%2===0;else if(T.pat==="stripes")on=(i+j)%6<2;
    else if(T.pat==="diamond")on=Math.abs((i%8)-4)+Math.abs((j%8)-4)===3;else if(T.pat==="stars")on=((i*37+j*91)%53===0)||((i*13+j*7)%97===0);
    else if(T.pat==="kanok"){const a=i%10,b=j%10;on=(a===5&&b<=6&&b>=2)||(b===6&&Math.abs(a-5)<=2)||(b===3&&Math.abs(a-5)===1)||(a===0&&b===0);}
    if(on)B(xx,yy,u,u,T.bg2);}
  x.restore();
  // --- header: manager portrait breaking out of the top-left, camp name, year badge on the top-right corner
  box(CX+30,HY,CW-60,170,T.panel,T.line,8);
  const name=(G.player&&G.player.name)||"Manager";
  txt(`Muay Thai camp of ${name}`,CX+300,HY+86,54,T.ink,"left",700,500);
  txt("SIRICHAI MUAY THAI",CX+302,HY+128,26,T.sub,"left",700,480);
  const H2=(G.honors||[]).length;txt(`Fame ${(G.rep||0).toFixed(0)} · ${students(G)} · ${H2}`,CX+302,HY+158,22,T.sub,"left",600,480);
  // year badge: an upright pixel glove that gets grander every year played (1..10), with more effects the longer the camp has run
  const bx=W-150,by=CY+40,yr=Math.max(1,G.season||1),tier=Math.min(10,yr);
  const GT=[null,
    {b:"#f4f4f4",h:"#ffffff",s:"#b8b8c4",c:"#c8283c",l:"#ffffff",ring:T.acc,in:"#8a6a9a"},
    {b:"#2c5fb3",h:"#6a9ae0",s:"#1d3f80",c:"#f4f4f4",l:"#2c5fb3",ring:T.acc,in:"#f4ead8"},
    {b:"#c8283c",h:"#f06a78",s:"#8a1426",c:"#f4f4f4",l:"#c8283c",ring:T.acc,in:"#f4ead8"},
    {b:"#2a2a30",h:"#5a5a66",s:"#121216",c:"#c8283c",l:"#f4f4f4",ring:"#c8ccd8",in:"#e8e0d0"},
    {b:"#e2b02a",h:"#fff0a0",s:"#a87a10",c:"#f4f4f4",l:"#c8283c",ring:"#c8ccd8",in:"#3a2a6a"},
    {b:"#e2b02a",h:"#fff0a0",s:"#a87a10",c:"#2c5fb3",l:"#c8283c",ring:"#c8ccd8",in:"#3a2a6a",flag:1},
    {b:"#c8283c",h:"#ff8a96",s:"#8a1426",c:"#e2b02a",l:"#fff0a0",ring:"#f2c14e",in:"#2a1440",rays:1},
    {b:"#7a3fc0",h:"#c89af0",s:"#3e1a70",c:"#e2b02a",l:"#fff0a0",ring:"#f2c14e",in:"#120a2a",rays:1,stars:1},
    {b:"#e2b02a",h:"#fffad0",s:"#b8801a",c:"#c8283c",l:"#fff0a0",ring:"#f2c14e",in:"#2a0a10",rays:1,stars:1,fire:1},
    {b:"#bfefff",h:"#ffffff",s:"#5ab0f0",c:"#e2b02a",l:"#c8283c",ring:"rainbow",in:"#140a30",rays:1,stars:1,fire:1,crown:1}][tier];
  const tt=Date.now()/1000;
  if(GT.ring==="rainbow"){["#e8434f","#f0a04b","#f2c14e","#4fb06a","#5ab0f0","#7a3fc0"].forEach((col,i)=>disc(bx,by,104-i*2,col));}else{disc(bx,by,104,T.line);disc(bx,by,94,GT.ring);}
  disc(bx,by,80,T.line);disc(bx,by,74,GT.in);
  /* effects stay inside the badge, in pixels (Man): light rays, flames behind the glove */
  if(GT.rays)for(let k=0;k<12;k++){const a=k/12*Math.PI*2;for(let r=18;r<70;r+=6){if((r/6+k)%2)continue;B(Math.round((bx+Math.cos(a)*r)/4)*4-2,Math.round((by+Math.sin(a)*r)/4)*4-2,6,6,k%2?"rgba(255,240,160,.55)":"rgba(255,255,255,.4)");}}
  if(GT.fire){const fl=[[-40,40,26],[-24,46,40],[-8,50,48],[8,50,44],[24,46,38],[40,40,24]];fl.forEach(([dx,dy,h])=>{B(bx+dx-8,by+dy-h,16,h,"#ff7b2a");B(bx+dx-5,by+dy-h+10,10,h-10,"#ffd34a");B(bx+dx-2,by+dy-h+20,4,Math.max(4,h-22),"#fff0a0");});}
  if(GT.stars)for(let k=0;k<10;k++){const sx=bx-60+((k*37)%120),sy=by-60+((k*53)%120);if(Math.hypot(sx-bx,sy-by)<66)B(sx,sy,4,4,"#ffffff");}
  const GLOVE=["....oooooo....","..oohhbbbboo..",".ohhbbbbbbbbo.",".ohbbbbbbbbbso","ohbbbbbbbbbbso","ohbbbbbbbbbbso","obbbbbbbbbbbso","obbbbbbbbbbsso","oooobbbbbbbsso","ohhhobbbbbbsso","ohbbbobbbbbsso","obbbbobbbbsso.",".obbbbbbbbsso.","..ossbbbbsso..","..occcccccco..","..oclcclcclo..","..occcccccco..","..oooooooooo.."];
  {const ps=7,gx=bx-49,gy=by-66;GLOVE.forEach((row,j)=>[...row].forEach((ch,i)=>{let col={o:"#1b1230",b:GT.b,h:GT.h,s:GT.s,c:GT.c,l:GT.l}[ch];if(GT.flag&&ch==="c")col=["#c8283c","#f4f4f4","#2c5fb3"][(j-14)%3]||col;if(col)B(gx+i*ps,gy+j*ps,ps,ps,col);}));}
  if(GT.crown){const cx0=bx-24,cy0=by-72;[[0,12,8,16],[10,0,8,28],[20,8,8,20],[30,0,8,28],[40,12,8,16]].forEach(([dx,dy,w,h])=>B(cx0+dx,cy0+dy,w,h,"#1b1230"));[[2,14,4,14],[12,2,4,26],[22,10,4,18],[32,2,4,26],[42,14,4,14]].forEach(([dx,dy,w,h])=>B(cx0+dx,cy0+dy,w,h,"#f2c14e"));B(cx0,cy0+26,48,8,"#1b1230");B(cx0+2,cy0+28,44,4,"#ffd34a");}
  if(tier>=5)[[-50,-36],[46,-44],[50,14],[-52,12]].forEach(([dx,dy],i)=>{const sx=bx+dx,sy=by+dy,c2=i%2?"#ffffff":"#fff0a0";B(sx-2,sy-8,4,16,c2);B(sx-8,sy-2,16,4,c2);});
  box(bx-62,by+82,124,40,T.line,T.line,4);txt((window.LANG==="en"?"YEAR ":"Year ")+yr,bx,by+111,24,"#ffffff","center",700);
  // manager portrait (the cutscene art), head above the card
  if(face){const fw=300,fh=fw*face.naturalHeight/face.naturalWidth,sy=0,sh=face.naturalHeight*.55;x.save();x.beginPath();x.rect(0,0,W,HY+170);x.clip();x.imageSmoothingEnabled=true;
    x.drawImage(face,0,sy,face.naturalWidth,sh,CX+6,HY+172-fh*.55*(1),fw,fh*.55);x.restore();}
  else if(G.avatar&&typeof CHIBI!=="undefined"){try{const ch=CHIBI.canvasFor(G.avatar,{dy:0}),sc=6;x.imageSmoothingEnabled=false;x.drawImage(ch,CX+150-ch.width*sc/2,HY+170-ch.height*sc,ch.width*sc,ch.height*sc);}catch(e){}}
  // --- the camp scene
  box(CX+30,SY,CW-60,556,T.line,T.line,6);x.imageSmoothingEnabled=false;x.drawImage(scene,CX+36,SY+8,CW-72,540*(CW-72)/960);
  // --- trophy shelf
  if(HS){const TY=SY+572;box(CX+30,TY,CW-60,HS-16,T.panel,T.line,8);
    const tot=(G.honors||[]).length;txt(window.LANG==="en"?`CAMP HONOURS · ${tot}`:`CAMP HONOURS · ${tot}`,CX+52,TY+34,22,T.sub,"left",700);
    const plank=TY+HS-46;B(CX+44,plank,CW-88,12,"#8a5a32");B(CX+44,plank+12,CW-88,6,"#5a3a20");B(CX+44,plank,CW-88,3,"#b07a48");
    const ps=5,gap=22,maxW=CW-120;let xx=CX+60,shown=0;
    for(const g of HG){const rows=TROPHY_PX[g.t.kind];if(!rows)continue;const w=Math.max(...rows.map(r=>r.length))*ps,h=rows.length*ps;
      if(xx+w>CX+60+maxW-(HG.length-shown>1?70:0))break;
      rows.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!==".")B(xx+i*ps,plank-h+j*ps,ps,ps,g.t.pal[ch]||"#fff");}));
      if(g.n>1){const lab="×"+g.n;x.font=FONT(22,700);const lw=x.measureText(lab).width+14;box(xx+w-lw+8,plank-h-14,lw,30,T.line,T.line,4);txt(lab,xx+w-lw/2+8,plank-h+8,22,"#ffffff","center",700);}
      xx+=w+gap;shown++;}
    if(shown<HG.length){const more=HG.slice(shown).reduce((a,g)=>a+g.n,0);txt("+"+more,xx+6,plank-14,30,T.ink,"left",700);}}
  // --- fighters: two columns of compact rows
  const cols=2,cw=(CW-60-12)/2,rh=112,rows=R.slice(0,6);
  if(rows.length){box(CX+30,FY,CW-60,nr*rh+16,T.panel,T.line,8);
    rows.forEach((f,i)=>{const cx=CX+38+(i%cols)*(cw+12),y=FY+8+Math.floor(i/cols)*rh;
      /* v1.92 (Man): a bigger fighter, and her relationship pill tucked under the level line */
      x.save();x.beginPath();x.rect(cx,y+2,118,rh-4);x.clip();x.imageSmoothingEnabled=true;try{drawFrame(x,sheetFor(f),o.lineup?ROW.win:ROW.idle,1,cx+60,y+rh+34,170,false);}catch(e){}x.restore();
      txt(f.name,cx+124,y+36,30,T.ink,"left",700,cw-134);const r=f.rec||{w:0,l:0,d:0};txt(`Lv.${f.lvl||1} · ${r.w}-${r.l}`,cx+124,y+64,21,T.sub,"left",600);
      const [st,sc]=ccStatus(f);x.font=FONT(19);const tw=Math.min(cw-134,x.measureText(st).width+22);box(cx+124,y+74,tw,32,sc,T.line,4);txt(st,cx+124+tw/2,y+97,19,"#ffffff","center",700,tw-12);});}
  // --- pets
  if(pets.length){box(CX+30,PY,CW-60,136,T.panel,T.line,8);
    const np=Math.min(6,pets.length),slot=(CW-80)/np; /* v1.92 (Man): each pet's name sits under its picture */
    pets.slice(0,6).forEach((p,i)=>{const cx=CX+40+slot*(i+.5),fy=PY+84;let drawn=false;
      try{x.imageSmoothingEnabled=true;drawn=typeof petHub==="function"&&petHub(x,p.k,cx,fy,1,0,false,2.4);}catch(e){}
      if(!drawn){try{x.imageSmoothingEnabled=false;x.drawImage(petIm[i],cx-34,fy-52,68,52);}catch(e){}}
      txt(p.name||"",cx,PY+120,24,T.ink,"center",700,slot-20);});}
  txt("Muay Thai Moe",W/2,CY+CH-22,22,T.bg2===T.panel?T.ink:"#ffffff","center",700);
  // --- sticker cut: white rim + shadow following the outline
  const out=document.createElement("canvas");out.width=W;out.height=H;const y=out.getContext("2d");
  const tinted=col=>{const t=document.createElement("canvas");t.width=W;t.height=H;const z=t.getContext("2d");z.drawImage(cv,0,0);z.globalCompositeOperation="source-in";z.fillStyle=col;z.fillRect(0,0,W,H);return t;};
  const sh=tinted("rgba(20,10,30,.35)"),wh=tinted("#ffffff");
  for(let a=0;a<16;a++){const dx=Math.cos(a/16*Math.PI*2)*16,dy=Math.sin(a/16*Math.PI*2)*16;y.drawImage(sh,dx+6,dy+12);}
  for(let a=0;a<24;a++){const dx=Math.cos(a/24*Math.PI*2)*14,dy=Math.sin(a/24*Math.PI*2)*14;y.drawImage(wh,dx,dy);}
  y.drawImage(cv,0,0);return out;}
async function campCardSave(){let url=ccURL;if(!url){const cv=await campCardDraw(ccOpt());url=cv.toDataURL("image/png");}
  const fn=`muay-thai-moe-camp-y${G.season||1}.png`;
  try{const blob=await (await fetch(url)).blob(),file=new File([blob],fn,{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"Sirichai Muay Thai Camp"});return;}
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=fn;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);toast("Camp card saved");}
  catch(e){if(e&&e.name==="AbortError")return;toast("This device can't save it directly — long-press the card and choose Save Image");}}
