/* v1.92 (Man): the camp drawn from Man's sprite pack (a/camp/*.webp) in the same 320x180 frame.
   - the camp house (3 looks, by camp level) and the fighters' dorm (6 looks, by dorm level) stand apart, at the back
   - every decoration the player picks (tree, gate, ring + matching training yard, track, vehicle, bags) has its sprite
   - built facilities show as buildings in the back row, or as small props when there is no room for a building
   - sky follows the player's clock (dawn, day, sunset, night) and the rainy season brings rain; at night and in the rain
     the scene darkens and every lamp, window and floodlight throws a stepped pixel light
   - until the pictures have loaded (or if one fails) the hand-drawn camp is drawn instead, so nothing ever goes blank
   Everything is in camp units (320x180); sprites are stored at CA_PX canvas pixels per unit so they share one pixel size. */
const CA_PX=2.5,CA_DIR="camp/";
const CA_TREE={blossom:[191,261,235],champion:[194,257,232],flame:[227,292,246],golden:[200,256,231],lilawadee:[234,292,246],plain:[199,255,231],rachaphruek:[201,271,229],sakura:[206,259,234],sritrang:[200,264,223],thongkwao:[208,267,226]}; // frame w,h, canopy bottom (px)
const CA_BACK=["airgym","hall","clinic","video","kitchen","recovery","classroom"]; // back-row buildings, the grandest first (2 slots)
const CA_RING_YARD={plain:"plain",red:"red",blue:"blue",sponsor:"sponsor",gold:"gold",green:"green",purple:"purple",black:"black",pink:"pink",orange:"orange",yellow:"yellow"};
const caImg=n=>img(CA_DIR+n+".webp");
const caOK=n=>{const i=caImg(n);return i.complete&&i.naturalWidth>0;};
let caFailed=false;
/* which weather/time: the player's own clock, rain on some weeks of the rainy season. window.__campMood overrides (tests). */
function campMood(G){if(typeof window!=="undefined"&&window.__campMood)return window.__campMood;
  const wk=((typeof gameWeek==="function"?gameWeek(G):1)-1)%52+1;
  if(wk>=20&&wk<=42){const h=mulberry32((G.seed||1)*7+(typeof gameWeek==="function"?gameWeek(G):1))();if(h<.4)return "rain";}
  /* v1.91.210 (Man: night-time players only ever saw night) — the camp runs its own day: it opens in daylight and cycles
     day 150 s → sunset 30 s → night 75 s → dawn 25 s (~4.7 min a lap) instead of following the device clock */
  const c=((performance.now()-CA_T0)/1000)%CA_DAY.reduce((a,x)=>a+x[1],0);let acc=0;for(const [m,d] of CA_DAY){acc+=d;if(c<acc)return m;}return "day";}
const CA_T0=typeof performance!=="undefined"?performance.now():0,CA_DAY=[["day",150],["sunset",30],["night",75],["dawn",25]];
/* everything the current camp needs */
function campArtPlan(G){const lv=Math.max(1,Math.min(3,campLevel(G))),dl=Math.max(0,Math.min(5,(G.fac&&G.fac.dorm)||0)),F=G.fac||{};
  const tree=decorChoice(G,"tree"),gate=decorChoice(G,"gate"),ring=decorChoice(G,"ring"),track=decorChoice(G,"track"),car=decorChoice(G,"vehicle"),bags=decorChoice(G,"bags");
  const back=CA_BACK.filter(k=>(F[k]||0)>0).slice(0,2);
  return {lv,dl,F,tree,gate,ring,track,car,bags,back,yard:CA_RING_YARD[ring]||"plain",hill:F.hill||0,shrine:F.shrine>0,tani:!!(G.gh&&G.gh.shrine),sauna:F.sauna>0,lights:F.lights||0,brand:F.brand||0};}
function campArtFiles(p,mood){const L=["gym_"+(p.lv-1),"dorm_"+p.dl,"beam","bag_"+p.bags,"ring_"+p.ring,"yard_"+p.yard,"track_"+p.track,"mountains_far","mountains_near","ground_grass","ground_dirt"];
  if(mood!=="night")L.push("sky_"+(mood==="day"?"clear_day":mood),mood==="rain"?"clouds_storm":"clouds_white");
  if(p.tree!=="none")L.push("tree_"+p.tree,"leaf_"+p.tree);if(p.gate!=="none")L.push("gate_"+p.gate);if(p.car!=="none")L.push("car_"+p.car);
  p.back.forEach(k=>L.push("fac_"+k));if(p.hill)L.push(p.hill>=2?"trail":"fac_hill");if(p.shrine)L.push("shrine_por_kae");if(p.tani)L.push("shrine_tanee");
  if(p.sauna)L.push("fac_sauna");if(p.lights)L.push("pole");if(p.brand)L.push("fac_brand");return L;}
/* cached layers per canvas: sky, and mountains + ground (tinted for the mood) */
function caLayer(ctx,key,draw){const cv=ctx.canvas,c=cv.__ca||(cv.__ca={});if(c[key])return c[key];const o=document.createElement("canvas");o.width=cv.width;o.height=cv.height;draw(o.getContext("2d"));return c[key]=o;}
let caSkyWarm=0;
function campArt(ctx,G,t){
  if(caFailed||!G||!G.fac||(typeof SETTINGS!=="undefined"&&SETTINGS.classicCamp))return false; /* v1.92 (Man): players can keep the classic hand-drawn camp */
  const p=campArtPlan(G),cv=ctx.canvas;let mood=campMood(G),files=campArtFiles(p,mood);
  /* the day cycle switches moods while the camp is open: warm every mood's sky, and if the next one isn't loaded yet keep the last one */
  if(!caSkyWarm){caSkyWarm=1;for(const n of ["sky_clear_day","sky_sunset","sky_dawn","sky_rain","clouds_white","clouds_storm"])caImg(n);}
  const isReady=L=>{for(const n of L){const i=caImg(n);if(i.complete&&i.naturalWidth===0&&i.src)return -1;if(!(i.complete&&i.naturalWidth))return 0;}return 1;};
  let rd=isReady(files);if(rd<0){caFailed=true;return false;}
  if(!rd&&cv.__caMood&&cv.__caMood!==mood&&isReady(campArtFiles(p,cv.__caMood))===1){mood=cv.__caMood;files=campArtFiles(p,mood);rd=1;}
  if(!rd)return false;
  if(cv.__caMood&&cv.__caMood!==mood&&!window.__campMood)cv.__caFade=t;cv.__caMood=mood;
  const S=ctx.canvas.width/320,NIGHT=mood==="night",RAIN=mood==="rain";
  const P=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x*S),Math.round(y*S),Math.max(1,Math.round(w*S)),Math.max(1,Math.round(h*S)));};
  const dimOf=(n,sc)=>{const i=caImg(n);return [i.naturalWidth/CA_PX*(sc||1),i.naturalHeight/CA_PX*(sc||1)];};
  const spr=(c,n,x,bot,sc,dy)=>{const i=caImg(n),[w,h]=dimOf(n,sc);c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";c.drawImage(i,Math.round(x*S),Math.round((bot-h+(dy||0))*S),Math.round(w*S),Math.round(h*S));return w;};
  const disc=(c,cx,cy,r,col)=>{c.fillStyle=col;for(let y=-r;y<=r;y+=.5){const hw=Math.round(Math.sqrt(Math.max(0,r*r-y*y))*2)/2;c.fillRect(Math.round((cx-hw)*S),Math.round((cy+y)*S),Math.max(1,Math.round(hw*2*S)),Math.max(1,Math.round(.5*S)));}};
  const LIGHTS=[];
  // --- sky
  ctx.drawImage(caLayer(ctx,"sky_"+mood,c=>{
    if(NIGHT){["#0b0a22","#100e2e","#16133a","#1b1846","#211d50","#28235c","#2e2864"].forEach((col,i)=>{c.fillStyle=col;c.fillRect(0,i*16*S,320*S,16*S);});
      const r=mulberry32(77);c.fillStyle="#f4e9ff";for(let i=0;i<70;i++)c.fillRect(Math.floor(r()*320)*S,Math.floor(r()*80)*S,S,S);
      const mg=c.createRadialGradient(262*S,22*S,8*S,262*S,22*S,20*S);mg.addColorStop(0,"rgba(240,236,210,.25)");mg.addColorStop(1,"rgba(240,236,210,0)");c.fillStyle=mg;c.fillRect(240*S,0,44*S,44*S);
      disc(c,262,22,8,"#f4f0d8");disc(c,259,20,1.6,"#d8d2b8");disc(c,265,25,1.2,"#d8d2b8");disc(c,263,18,.9,"#d8d2b8");}
    else{c.imageSmoothingEnabled=true;c.drawImage(caImg("sky_"+(mood==="day"?"clear_day":mood)),0,0,320*S,112*S);
      if(mood==="sunset"||mood==="dawn"){const sx=mood==="sunset"?250:70,sg=c.createRadialGradient(sx*S,88*S,6*S,sx*S,88*S,40*S);sg.addColorStop(0,"rgba(255,200,120,.55)");sg.addColorStop(1,"rgba(255,200,120,0)");c.fillStyle=sg;c.fillRect((sx-50)*S,40*S,100*S,70*S);
        disc(c,sx,88,10,"#ffd27a");disc(c,sx,88,8,"#ffe3a0");}}}),0,0);
  if(NIGHT){const r=mulberry32(78);ctx.fillStyle="#0b0a22";for(let i=0;i<14;i++){const x=Math.floor(r()*320),y=Math.floor(r()*80);if((Math.floor(t/600)+i)%4===0)ctx.fillRect(x*S,y*S,S,S);}}
  else{const cl=RAIN?"clouds_storm":"clouds_white",ci=caImg(cl),cw=360,ch=ci.naturalHeight*cw/ci.naturalWidth,ox=(t/(RAIN?120:400))%cw;
    ctx.save();ctx.globalAlpha=RAIN?.95:mood==="sunset"||mood==="dawn"?.55:.9;ctx.imageSmoothingEnabled=true;for(let x=-ox;x<320;x+=cw-.5)ctx.drawImage(ci,x*S,((RAIN?70:58)-ch)*S,cw*S,ch*S);ctx.restore();}
  // --- hills + ground (cached; tinted with source-atop so it works on every browser)
  ctx.drawImage(caLayer(ctx,"land_"+mood+"_"+(p.lv),c=>{c.imageSmoothingEnabled=true;
    const band=(n,wu,bot)=>{const i=caImg(n),h=i.naturalHeight*wu/i.naturalWidth;for(let x=0;x<320;x+=wu-.5)c.drawImage(i,x*S,(bot-h)*S,wu*S,h*S);};
    band("mountains_far",520,104);band("mountains_near",360,114);
    const tile=(n,x0,y0,x1,y1)=>{const i=caImg(n),w=i.naturalWidth/2,h=i.naturalHeight/2;c.save();c.beginPath();c.rect(x0*S,y0*S,(x1-x0)*S,(y1-y0)*S);c.clip();for(let y=y0;y<y1;y+=h-.5)for(let x=x0;x<x1;x+=w-.5)c.drawImage(i,x*S,y*S,w*S,h*S);c.restore();};
    tile(p.lv>=2?"ground_grass":"ground_dirt",0,108,320,180);
    if(p.lv>=2){c.save();c.beginPath();c.moveTo(0,118*S);for(let x=0;x<=160;x+=4)c.lineTo(x*S,(117+((x*7)%5))*S);for(let y=118;y<=156;y+=4)c.lineTo((156+((y*5)%6))*S,y*S);for(let x=160;x>=0;x-=4)c.lineTo(x*S,(154+((x*3)%4))*S);c.closePath();c.clip();tile("ground_dirt",0,112,170,162);c.restore();}
    const tint={night:"rgba(10,12,40,.55)",rain:"rgba(40,50,70,.3)",sunset:"rgba(120,60,90,.18)",dawn:"rgba(140,90,120,.15)"}[mood];
    if(tint){c.globalCompositeOperation="source-atop";c.fillStyle=tint;c.fillRect(0,0,c.canvas.width,c.canvas.height);c.globalCompositeOperation="source-over";}}),0,0);
  // --- the camp, back to front
  const EX=[],put=(n,x,bot,sc,sortY,after)=>{const [w,h]=dimOf(n,sc);if(sortY==null){spr(ctx,n,x,bot,sc);if(after)after(w,h);}else EX.push({y:sortY,f:()=>{caShadow(ctx,S,x,bot,w);spr(ctx,n,x,bot,sc);if(after)after(w,h);}});return [w,h];};
  const puffs=(px,py,col,big)=>{for(let q=0;q<4;q++){const ph=((t/(big>1?900:1400))+q/4)%1;ctx.globalAlpha=(big>1?.6:.45)*(1-ph);ctx.fillStyle=col;const r=(big>1?1.5:.8)+ph*(big>1?3:1.5);
    ctx.fillRect(Math.round((px+Math.sin(t/400+q*2)*1.5*ph*big)*S),Math.round((py-ph*(big>1?16:12))*S),Math.max(1,Math.round(r*S)),Math.max(1,Math.round(r*S)));}ctx.globalAlpha=1;};
  // back row: up to two buildings between the dorm and the ring
  // tree (8-frame sprite + code sway; harder in the rain)
  if(p.tree!=="none"&&CA_TREE[p.tree]){const [fw,fh,cb]=CA_TREE[p.tree],w=fw/CA_PX,h=fh/CA_PX,x=204,bot=104,fr=Math.floor(t/125)%8,wind=RAIN?2.2:1,sk=Math.sin(t/(RAIN?520:1100))*.035*wind+Math.sin(t/370)*.008*wind,top=bot-cb/CA_PX;
    ctx.save();ctx.imageSmoothingEnabled=true;ctx.translate(0,bot*S);ctx.transform(1,0,-sk,1,0,0);ctx.translate(0,-bot*S);
    for(const n of ["tree_","leaf_"])ctx.drawImage(caImg(n+p.tree),fr*fw,0,fw,fh,x*S,top*S,w*S,h*S);ctx.restore();}
  if(p.hill){const n=p.hill>=2?"trail":"fac_hill",sc=p.hill>=2?1:42/36,[w]=dimOf(n,sc);put(n,322-w,116,sc);} /* flush with the right edge so the path runs out of frame */
  put("dorm_"+p.dl,98,112,1,null,(w,h)=>{const fl=p.dl>=3?3:p.dl>=2?2:1;for(let f=0;f<fl;f++)for(const fx of [.25,.75])LIGHTS.push([98+w*fx,112-h*(.22+f*.28),11,.9]);});
  // back row: up to two buildings beside the dorm, clear of the bag beam (v1.92, Man: they were hidden)
  {let bxx=Math.max(150,98+dimOf("dorm_"+p.dl)[0]-10);p.back.forEach((k,i)=>{const [w,h]=put("fac_"+k,bxx,114-i,26/36);LIGHTS.push([bxx+w/2,114-i-h*.4,14,.7]);if(k==="kitchen"&&(p.F.kitchen||0)>=2)puffs(bxx+w*.4,114-i-h*.7,"#f4f4f4",2);bxx+=w-6;});}
  put("gym_"+(p.lv-1),-4,116,1,null,(w,h)=>LIGHTS.push([-4+w*.5,116-h*.3,30,1],[-4+w*.2,116-h*.2,16,.9],[-4+w*.8,116-h*.2,16,.9],[-4+w*.5,122,22,.7]));
  if(p.lights)for(const px of [184,284])put("pole",px,112,1,null,(w,h)=>{LIGHTS.push([px+w/2,112-h+4,14,p.lights>=2?1.5:1.3],[px+w/2,112,16,.8]);
    const on=(Math.floor(t/90)+px)%23===0?.12:.3,g=ctx.createRadialGradient((px+w/2)*S,(112-h+5)*S,1,(px+w/2)*S,(112-h+5)*S,12*S);g.addColorStop(0,`rgba(255,240,190,${on})`);g.addColorStop(1,"rgba(255,240,190,0)");ctx.fillStyle=g;ctx.fillRect((px+w/2-12)*S,(112-h-7)*S,24*S,24*S);});
  if(p.tani)put("shrine_tanee",290,138,32/36,136,(w,h)=>{puffs(290+w*.62,138-h*.35,"#e8e2d8",1);LIGHTS.push([290+w/2,138-h*.4,12,.9]);});
  if(p.shrine)put("shrine_por_kae",98,124,30/36,122,(w,h)=>{puffs(98+w*.5,124-h*.42,"#e8e2d8",1);LIGHTS.push([98+w/2,124-h*.4,12,.9]);});
  if(p.sauna)put("fac_sauna",284,164,34/36,152,(w,h)=>{puffs(284+w*.25,164-h*.92,"#f4f4f4",2);LIGHTS.push([284+w/2,164-h*.4,14,.7]);});
  if(p.brand)put("fac_brand",138,177,34/36,175);
  put("yard_"+p.yard,34,162,1,121);
  put("ring_"+p.ring,196,138,1,104);
  // bags on the beam: one per training-gear level; the first swings away from whoever is punching it
  const [bw,bh]=dimOf("beam"),bx0=112,bbot=136,nb=Math.min(3,1+(p.F.gym||0)),bagX=j=>bx0+bw*(.5+(j-(nb-1)/2)*.22),hitter=campPeople(G).some(q=>q.spot==="bag");
  EX.push({y:133,f:()=>{caShadow(ctx,S,bx0,bbot,bw);spr(ctx,"beam",bx0,bbot);}});
  for(let j=0;j<nb;j++){const bx=bagX(j)-4,by=bbot-bh*.8;EX.push({y:133.5,f:()=>{let a=Math.sin(t/350+j)*(RAIN?.05:.024);if(j===0&&hitter&&!RAIN){const dt=(((t/150-2)%4)+4)%4*150;a+=-.26*Math.exp(-dt/260)*Math.sin(dt/70);}
    ctx.save();ctx.translate((bx+4)*S,by*S);ctx.rotate(a);ctx.translate(-(bx+4)*S,-by*S);spr(ctx,"bag_"+p.bags,bx,by+24,24/24);ctx.restore();}});}
  // string lights from the camp house to the ring (once the camp looks cared for)
  const look=campLook(G);if(look>=6){EX.push({y:60,f:()=>{for(let i=0;i<30;i++){const u=i/29;P(84+u*186,70+Math.sin(u*Math.PI)*10,1.5,1.5,["#ffd36b","#ff7b8a","#8ad7ff"][(Math.floor(t/400)+i)%3]);}}});for(let i=0;i<30;i+=3){const u=i/29;LIGHTS.push([84+u*186,70+Math.sin(u*Math.PI)*10,7,.6]);}}
  // vehicle: idling (a little shake, exhaust); long ones are kept to the slot
  if(p.car!=="none"){const [w0,h0]=dimOf("car_"+p.car),sc=Math.min(1,96/w0),w=w0*sc,x=300-w;
    EX.push({y:179,f:()=>{caShadow(ctx,S,x,180,w);spr(ctx,"car_"+p.car,x,180,sc,(Math.floor(t/70)%3===0)?-.5:0);
      for(let q=0;q<3;q++){const ph=((t/700)+q/3)%1;ctx.globalAlpha=.55*(1-ph);ctx.fillStyle="#d8d4cc";const r=1+ph*2.5;ctx.fillRect(Math.round((x+2-ph*12)*S),Math.round((174-ph*5)*S),Math.round(r*S),Math.round(r*S));}ctx.globalAlpha=1;}});
    LIGHTS.push([x+w+6,180-h0*sc*.4,18,1]);}
  if(p.gate!=="none")EX.push({y:999,f:()=>spr(ctx,"gate_"+p.gate,0,178)});
  // track along the front edge
  {const n="track_"+p.track,i=caImg(n),[w,h]=dimOf(n),sx=i.naturalWidth*.12,sw=i.naturalWidth*.76,tw=w*.76;ctx.imageSmoothingEnabled=true;for(let x=-2;x<320;x+=tw-1)ctx.drawImage(i,sx,0,sw,i.naturalHeight,Math.round(x*S),Math.round((180-h)*S),Math.round(tw*S)+1,Math.round(h*S));}
  // --- people (rain: everyone under the camp house roof)
  const YL={drill:[52,19,118],stu:[56,120,140,124],coach:[60,108,140,112],staff:[150,128,180,150],player:[150,132,300,152],dog:[10,162,300,170],hens:[164,126],ring:[178,80],bag:[bagX(0)-9,bbot+1],extra:EX,
    pet:k=>({cat:[60,120,140,128],dog:[150,140,200,150],rooster:[120,140,160,150],turtle:[60,150,130,154],otter:[150,150,250,156]})[k]};
  if(typeof window!=="undefined"&&window.__campLineup)YL.lineup=1;
  if(RAIN)Object.assign(YL,{drill:[8,13,93],stu:[6,92,84,96],coach:[14,92,80,95],staff:[10,94,80,98],player:[20,94,84,98],shelter:[10,112,80,119],says:["ฝนตก~","เปียกหมด!","รอฝนหยุด"]});
  YL.post=()=>{caLight(ctx,S,t,mood,LIGHTS,p);if(typeof yearFx==="function")yearFx(ctx,(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)*S,Math.round(y)*S,Math.round(w)*S,Math.round(h)*S);},G,t);};
  campYard(ctx,G,t,S,P,YL);
  /* a soft dip when the day cycle moves on to the next mood */
  if(cv.__caFade!=null){const a=1-(t-cv.__caFade)/1400;if(a>0){ctx.fillStyle=`rgba(24,16,44,${(.5*a).toFixed(3)})`;ctx.fillRect(0,0,cv.width,cv.height);}else cv.__caFade=null;}
  return true;}
function caShadow(ctx,S,x,bot,w){ctx.fillStyle="rgba(20,14,30,.28)";ctx.beginPath();ctx.ellipse((x+w/2)*S,(bot-1)*S,w/2*S*.9,2.2*S,0,0,7);ctx.fill();}
/* night / rain: a 320x180 light map in hard concentric bands (8 steps), darkness over the unlit parts, a warm wash over the lit ones.
   Rebuilt a few times a second (lamp flicker), reused in between. */
function caLight(ctx,S,t,mood,LIGHTS,p){const NIGHT=mood==="night",RAIN=mood==="rain";
  if(RAIN){ctx.fillStyle="rgba(210,220,240,.55)";const rr=mulberry32(5);for(let i=0;i<170;i++){const x=(rr()*360+t/6)%360-20,y=((rr()*200)+t/3.2)%200-10;ctx.fillRect(Math.round((x-y*.15)*S),Math.round(y*S),S,4*S);}
    const sp=mulberry32(9);for(let i=0;i<26;i++){const x=sp()*320,y=110+sp()*68,ph=((t/300)+sp())%1;if(ph<.35){ctx.fillStyle=`rgba(220,230,250,${.7-ph*2})`;ctx.fillRect(Math.round((x-ph*4)*S),Math.round(y*S),S,S);ctx.fillRect(Math.round((x+ph*4)*S),Math.round(y*S),S,S);}}}
  if(mood==="day"){ctx.save();ctx.globalCompositeOperation="soft-light";ctx.fillStyle="rgba(255,250,235,.25)";ctx.fillRect(0,0,320*S,180*S);ctx.restore();}
  if(!NIGHT&&!RAIN)return;
  const cv=ctx.canvas,c=cv.__ca||(cv.__ca={}),key=mood+"|"+Math.floor(t/120);
  if(c.lightKey!==key){c.lightKey=key;if(p.lights)LIGHTS.push([242,110,58,1.15]);
    const W=320,H=180,L=new Float32Array(W*H);
    for(const [lx,ly,r,s] of LIGHTS){const R=r*(1+.04*Math.sin(t/90+lx*3)),x0=Math.max(0,Math.floor(lx-R)),x1=Math.min(W-1,Math.ceil(lx+R)),y0=Math.max(0,Math.floor(ly-R)),y1=Math.min(H-1,Math.ceil(ly+R));
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const d=Math.hypot(x+.5-lx,(y+.5-ly)*1.15);if(d<R)L[y*W+x]+=(1-d/R)*s;}}
    const mk=()=>{const o=document.createElement("canvas");o.width=W;o.height=H;return o;};
    c.dark=c.dark||mk();c.warm=c.warm||mk();const dx=c.dark.getContext("2d"),wx=c.warm.getContext("2d"),di=dx.createImageData(W,H),wi=wx.createImageData(W,H);
    const base=NIGHT?.62:.34,tint=NIGHT?[14,16,52]:[34,42,64];
    for(let i=0;i<W*H;i++){const q=Math.min(7,Math.floor(Math.pow(Math.min(1,L[i]),.85)*7+.0001))/7;
      di.data[i*4]=tint[0];di.data[i*4+1]=tint[1];di.data[i*4+2]=tint[2];di.data[i*4+3]=Math.round(255*base*(1-q));
      wi.data[i*4]=255;wi.data[i*4+1]=196;wi.data[i*4+2]=110;wi.data[i*4+3]=Math.round(255*(NIGHT?.16:.08)*q);}
    dx.putImageData(di,0,0);wx.putImageData(wi,0,0);}
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(c.dark,0,0,320*S,180*S);ctx.globalCompositeOperation="lighter";ctx.drawImage(c.warm,0,0,320*S,180*S);ctx.restore();}
