// ================= v1.90 (hidden) ROAD TRIPS — trip cost by camp vehicle + driving scene =================
/* Regional chapter (loaded with region.js only once the chapter opens). The driving scene is wired in round 2:
   ROAD.open(destKey,{onArrive,charge}) shows the trip sheet, charges the cost, plays the drive, then calls onArrive(plan).
   ROAD.demo() opens a free preview (any region × time × vehicle) — also opens from the URL hash #roaddemo.
   The car is the camp's own vehicle slot (CAMP_DECOR.vehicle), drawn with decorVehicle() from pixel.js.
   Rule from Man: the pricier the car, the more economical the trip. */

const ROAD_FUEL_BASE=35; // ฿ per litre at an average week
/* kmL = km per litre (rises with price) · seats = riders who fit (the rest ride the public bus) · fat = fatigue multiplier on the road */
const ROAD_CAR={
 none:{name:"Intercity bus",kmL:0,seats:0,fat:1.25},
 songthaew:{kmL:7,seats:10,fat:1.15},
 yellowthaew:{kmL:7.5,seats:10,fat:1.15},
 rotdaeng:{kmL:7.5,seats:10,fat:1.12},
 tuktuk:{kmL:8,seats:3,fat:1.3},
 minibus:{kmL:9,seats:12,fat:1},
 bluevan:{kmL:10,seats:12,fat:.95},
 pinkvan:{kmL:10.5,seats:12,fat:.95},
 tourbus:{kmL:11,seats:30,fat:.85},
 limo:{kmL:12,seats:8,fat:.75},
 goldvan:{kmL:14,seats:12,fat:.8}};
const ROAD_BUS_PER_KM=1.1,ROAD_TOLL_PER_KM=.35,ROAD_ROOM=650,ROAD_FOOD=180; // per person per km / per km / per room per night / per person per day

const ROAD_REGION={north:{name:"the North",tag:"North"},isan:{name:"Isan",tag:"Isan"},central:{name:"the Central Plains",tag:"Central"},south:{name:"the South",tag:"South"}};
/* game distances from the camp (a made-up province in the upper central plain). final:1 = the regional title ring */
const ROAD_DEST={
 chiangrai:{name:"Chiang Rai",r:"north",km:780},nan:{name:"Nan",r:"north",km:640},uttaradit:{name:"Uttaradit",r:"north",km:430},lampang:{name:"Lampang",r:"north",km:560},chiangmai:{name:"Chiang Mai",r:"north",km:650,final:1},
 udon:{name:"Udon Thani",r:"isan",km:520},khonkaen:{name:"Khon Kaen",r:"isan",km:430},buriram:{name:"Buriram",r:"isan",km:390},ubon:{name:"Ubon Ratchathani",r:"isan",km:610},korat:{name:"Nakhon Ratchasima",r:"isan",km:250,final:1},
 lopburi:{name:"Lopburi",r:"central",km:120},suphan:{name:"Suphan Buri",r:"central",km:130},phetchaburi:{name:"Phetchaburi",r:"central",km:230},chanthaburi:{name:"Chanthaburi",r:"central",km:330},ayutthaya:{name:"Ayutthaya",r:"central",km:90,final:1},
 chumphon:{name:"Chumphon",r:"south",km:500},surat:{name:"Surat Thani",r:"south",km:640},nakhonsi:{name:"Nakhon Si Thammarat",r:"south",km:760},songkhla:{name:"Songkhla",r:"south",km:950},phuket:{name:"Phuket",r:"south",km:860,final:1}};
const roadNights=km=>km<300?0:km<700?1:2;

// ---------- fuel: changes every week, cheap and dear weeks come in turns, holidays push it up ----------
function roadFuel(G,wk){const w=wk!=null?wk:(G?gameWeek(G):1),s=((G&&G.seed)||1)%997,r=mulberry32(s*131+w*7919)();
  let p=1+.14*Math.sin(w*1.1+s)+.06*Math.sin(w*.37+s*2)+(r-.5)*.08;const wy=((w-1)%52)+1;if((wy>=14&&wy<=16)||wy>=51||wy<=1)p+=.1;
  return Math.round(ROAD_FUEL_BASE*p*100)/100;}
const roadFuelBand=p=>p<ROAD_FUEL_BASE*.94?"cheap":p>ROAD_FUEL_BASE*1.07?"high":"mid";
/* the news ticker guesses next week right about three times in four */
function roadFuelHint(G){const w=G?gameWeek(G):1,now=roadFuel(G,w),nx=roadFuel(G,w+1);let up=nx>now;if(mulberry32((((G&&G.seed)||1)%997)*17+w*31)()<.25)up=!up;
  return up?"Energy news: fuel looks set to go up next week ▲":"Energy news: fuel looks set to go down next week ▼";}

function roadCarKey(G){return G?decorChoice(G,"vehicle"):"none";}
function roadCarName(k){return k==="none"?ROAD_CAR.none.name:((CAMP_DECOR.vehicle.items[k]||{}).name||k);}
function roadRiders(G){return G?roster(G).filter(f=>!f.injury||f.injury<3):[];}

/* the whole bill for one trip, there and back */
function roadPlan(G,destKey,carKey,wk){const D=ROAD_DEST[destKey],k=carKey||roadCarKey(G),C=ROAD_CAR[k]||ROAD_CAR.none,price=roadFuel(G,wk);
  const people=Math.max(1,roadRiders(G).length)+1/* the manager */,nights=roadNights(D.km),rt=D.km*2;
  const inCar=k==="none"?0:Math.min(people,C.seats),onBus=people-inCar;
  const litres=C.kmL?rt/C.kmL:0,fuel=Math.round(litres*price),toll=k==="none"?0:Math.round(rt*ROAD_TOLL_PER_KM),bus=Math.round(onBus*rt*ROAD_BUS_PER_KM);
  const rooms=Math.ceil(people/2),lodge=nights*rooms*ROAD_ROOM,food=(nights+1)*people*ROAD_FOOD;
  const fat=Math.round(D.km/100*C.fat*1.2); // fatigue every traveller picks up on the way
  return {dest:destKey,D,car:k,C,price,band:roadFuelBand(price),people,inCar,onBus,nights,rt,litres,fuel,toll,bus,lodge,food,fat,total:fuel+toll+bus+lodge+food};}

// ---------- driving scene: lines ----------
const ROAD_SCENERY={
 north:["The road starts winding up the mountain. Thin mist hangs over the pine tops, cold enough that we close the windows.","Terraced fields step down into the valley, and the road signs start carrying Lanna script too."],
 isan:["Rice fields stretch to the horizon, sugar palms standing far apart. The sky is so wide you can see every whole cloud.","Smoke billows from a roadside grilled-chicken stall, and the smell of sticky rice drifts in through the window."],
 central:["Green rice paddies on both sides, an irrigation canal running beside the road as far as the eye can see.","We pass roadside temples with orange-and-green roofs shining in the sun, souvenir stalls lined up out front."],
 south:["Limestone hills stand in a row, and a jade-green sea peeks out now and then between the rubber trees.","Palm plantations and rubber groves take turns forever. It drizzles for a minute, then the sun comes back out."]};
const ROAD_CAR_GAG={
 none:"The camp has no vehicle yet, so everyone takes the intercity bus. The seats barely recline and the air con is arctic.",
 songthaew:"The wind whips everyone's hair into a mess and the canvas roof flaps the whole way.",yellowthaew:"The wind whips everyone's hair into a mess and the canvas roof flaps the whole way.",rotdaeng:"Wherever the red truck goes, people flag it down thinking it's a taxi.",
 tuktuk:"The tuk-tuk only seats three. Everyone else follows by bus and keeps complaining on LINE.",
 minibus:"The van hums along with the air con on cold. Two people are asleep before we've even left the province.",bluevan:"The van hums along with the air con on cold. Two people are asleep before we've even left the province.",pinkvan:"Wherever the pink van goes, kids by the road wave the whole way.",
 tourbus:"The camp bus has room to stretch out and a karaoke screen up front. Nobody will let go of the mic.",
 limo:"The limousine is so smooth you can't tell it's moving. The car alongside slows down to stare the whole way.",
 goldvan:"The gold van flashes in the sun so much the car behind keeps its distance. People by the road keep snapping photos."};
/* {km} is filled with the distance. Voices follow the heroines' chats: Kati หนู/ค่ะ, Mali มะลิ~, Rin ฉัน/ค่ะ + numbers, Ploy ฉัน/เธอ, Fah ฟ้า/นาย */
const ROAD_TALK={
 kati:{any:["Manager, sleepy? I'll unwrap a candy for you. The driver has to stay awake!","I wrote down which petrol stations have the cleanest toilets. Let's stop at the next one."],
  isan:"Grilled chicken… Manager, can we stop for a second? Just one second, really.",south:"The sea!! Manager, it's the sea! …Sorry. I've never been this way before."},
 mali:{any:["Mali packed sticky rice and fried pork for everyone~ No fighting over it.","Shall we sing~? Mali will put on some luk thung."],
  south:"We're close to Mali's home now~ I can smell the sea. I miss Mom.",north:"So cold~ Can Mali borrow somebody's jacket?"},
 rin:{any:["{km} kilometres. If we hold this speed, we'll arrive seventeen minutes early.","I've summarised the stats for the ring we're heading to. I can read in the car. I don't get carsick. …Probably."],
  north:"There are thirty-two bends on this stretch. I counted. …Nineteen to go."},
 ploy:{any:["At my old camp I always sat alone on trips. A full car like this is… not bad.","You drive smoothly. I can sleep."],
  isan:"Everyone says Korat means heavy punches. …I'd rather see where it comes from with my own eyes."},
 fah:{any:["Hey! Put on Fah's song! You have to sing this one while the car's going fast!","Who ate Fah's snacks!! The bag's nothing but crumbs!"],
  central:"These rice fields look just like Grandma's. …Don't look at me like that, Fah's not homesick!"}};
const ROAD_SHOTGUN={
 kati:"I really get the front seat? …Then I'll read the map! …Manager, you should've turned left back there.",
 mali:"I get to sit up front with you~ Want Mali to feed you a snack? Say aah~",
 rin:"I'm only in front because I don't get carsick. …No other reason. Really, none.",
 ploy:"Quiet like this is nice. …If you get sleepy, say so. I can take the wheel.",
 fah:"The front seat is Fah's! Got a problem?! …Drive carefully, okay. Not that Fah's scared. Just saying."};

function roadLines(S){const P=S.plan,D=P.D,r=D.r,rng=mulberry32(S.seed),pick=a=>a[Math.floor(rng()*a.length)],L=[];
  L.push({n:"nar",t:`${roadCarName(P.car)} of Sirichai Camp sets off in ${S.time==="night"?"the afternoon":"the small hours"}, heading for ${D.name}, ${D.km} km away.`});
  if(P.car!=="none"&&P.band!=="mid")L.push({n:"nar",t:`Fuel stop, per litre: ${fmt(P.price)} ${P.band==="high"?"— so pricey this week the manager lets out a long sigh":P.band==="cheap"?"— cheaper than last week, everyone cheers":"— a normal price, nobody complains"}`});
  L.push({n:"nar",t:ROAD_CAR_GAG[P.car]||ROAD_CAR_GAG.minibus});
  L.push({n:"nar",t:pick(ROAD_SCENERY[r])});
  const ids=S.riders.filter(id=>ROAD_TALK[id]);
  if(S.front&&ROAD_SHOTGUN[S.front])L.push({n:S.front,t:ROAD_SHOTGUN[S.front]});
  const others=ids.filter(id=>id!==S.front);for(let i=others.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
  for(const id of others.slice(0,2)){const T=ROAD_TALK[id],own=T[r];L.push({n:id,t:(own&&rng()<.6?own:pick(T.any)).replace("{km}",D.km)});}
  if(S.wet)L.push({n:"nar",t:"The rain pours so hard the wipers can't keep up. Nobody in the car says a word."});
  L.push({n:"nar",t:S.time==="night"?`The lights of ${D.name} glow up ahead. Only a few more kilometres to the hotel.`:`A "Welcome to ${D.name}" sign slides past on the right. The ring is only a few kilometres away.`,sign:1});
  return L;}

// ---------- driving scene: drawing (320×180 units, ×2 on canvas, like the camp) ----------
const RW=320,RH=180,RS=2;
const wrapX=(x,p)=>((x%p)+p)%p;
const ROAD_SKY={day:["#78c3ee","#93d0f0","#b4def0","#d8eeec"],dusk:["#3b2c63","#7a3f78","#c8646e","#f09a5c"],night:["#0d0b24","#16133a","#1f1b4c","#29245a"],wet:["#6f7a8c","#808a9a","#929aa6","#a6acb4"]};
const ROAD_DIM={day:0,dusk:.22,night:.55,wet:.18};
function roadDraw(ctx,S,t){const F=decorPainter(ctx,RS),dim=ROAD_DIM[S.wet?"wet":S.time]+(S.wet&&S.time==="night"?.4:0),dk=c=>dim?shadeHex(c,-Math.min(.75,dim)):c,
  P=(x,y,w,h,c)=>F(x,y,w,h,dk(c)),v=S.v,dist=v*t/1000;ctx.imageSmoothingEnabled=false;
  // sky
  const sky=ROAD_SKY[S.wet?"wet":S.time];sky.forEach((c,i)=>F(0,i*28,RW,28,S.wet&&S.time==="night"?shadeHex(c,-.6):c));
  if(S.time==="night"&&!S.wet){const r=mulberry32(9);for(let i=0;i<40;i++){const x=r()*RW,y=r()*80;if((Math.floor(t/500)+i)%7)F(x,y,.5,.5,"#f4e9ff");}F.disc(262,26,7,"#fff3c4");F.disc(259,24,6,"#16133a");}
  else if(!S.wet){const sy=S.time==="dusk"?78:28,sc=S.time==="dusk"?"#ffb26b":"#fff4c8";F.glow(70,sy,26,S.time==="dusk"?"rgba(255,170,100,.55)":"rgba(255,250,210,.6)");F.disc(70,sy,9,sc);}
  // clouds
  for(let i=0;i<5;i++){const x=wrapX(i*83-dist*.03,RW+60)-30,y=14+((i*29)%40);const c=S.wet?"#b8bec8":S.time==="night"?"#3a3566":S.time==="dusk"?"#f2b8a0":"#ffffff";
    F(x,y,24,4,c);F(x+5,y-3,14,4,c);F(x+3,y+2,20,2,S.wet?"#9aa2ae":shadeHex(c,-.08));}
  ROAD_LAYERS[S.r](F,P,dk,dist,t,S);
  // road
  P(0,132,RW,2,"#6a6458");P(0,134,RW,44,"#4a4652");P(0,134,RW,1,"#f2c94c");P(0,175,RW,1,"#f2f2f2");P(0,176,RW,4,"#5f7a45");
  for(let i=0;i<10;i++){const x=wrapX(i*40-dist,400)-40;P(x,154,18,1.5,"#f2f2f2");}
  if(S.wet)for(let i=0;i<6;i++){const x=wrapX(i*57-dist*.9,RW+40)-20;F(x,160+((i*7)%12),14,.5,"rgba(200,220,255,.35)");}
  // km posts beside the far edge
  for(let i=0;i<4;i++){const x=wrapX(i*90+20-dist,360)-20;P(x,125,3,9,"#f2f2f2");P(x,125,3,2,"#c8283c");}
  // welcome sign rolls in for the last line
  if(S.signAt!=null){const sx=RW+10-(t-S.signAt)*v/1000;if(sx>-110){P(sx+6,100,2.5,34,"#6a6a72");P(sx+91,100,2.5,34,"#6a6a72");F.box(sx,74,100,28,dk("#2c5fb3"),"#120c1c",dk("#5a8ae0"));F(sx+2,76,96,.5,dk("#f2f2f2"));F(sx+2,99.5,96,.5,dk("#f2f2f2"));
    F.text("Welcome to",sx+50,82.5,6,dk("#ffffff"));F.text(S.plan.D.name,sx+50,93,S.plan.D.name.length>9?6:7.5,dk("#ffe9a0"));}}
  // the camp's own car (or the public bus)
  roadCar(F,S,t,dk);
  // puffs behind the car
  for(let i=0;i<5;i++){const a=((t/90)+i*7)%30;F.disc(S.carX-8-a*1.4,162-a*.25,1+a*.08,`rgba(${S.wet?"190,200,215":"235,225,210"},${Math.max(0,.45-a/40)})`);}
  // foreground grass + posts pass in front
  for(let i=0;i<14;i++){const x=wrapX(i*27-dist*1.5,RW+30)-15;P(x,176,2,4,"#3f6a2f");P(x+3,177,1.5,3,"#4f7a3a");}
  for(let i=0;i<3;i++){const x=wrapX(i*140-dist*1.6,RW+60)-30;P(x,170,2.5,10,"#d8d8d8");P(x,170,2.5,1.5,"#c8283c");}
  if(S.wet)for(let i=0;i<70;i++){const x=wrapX(i*37+t*.35,RW+20)-10,y=wrapX(i*53+t*.9,RH);F(x,y,.5,4,"rgba(200,215,240,.45)");}
  if(S.time==="night"&&!S.wet)F(0,0,RW,RH,"rgba(10,8,30,.08)");}

/* each region: far range, middle strip, things by the road */
const ROAD_LAYERS={
 north(F,P,dk,d,t,S){
  for(const [sp,base,amp,col,fr] of [[.05,92,26,"#6f8fb0",31],[.1,104,22,"#55779a",23],[.18,114,16,"#3f6a5f",17]])
   for(let x=0;x<RW;x+=2){const X=x+d*sp,h=amp*(.55+.45*Math.sin(X/fr))+Math.sin(X/7)*3;P(x,base-h,2,h+(130-base),col);}
  F(0,86,RW,5,`rgba(255,255,255,${S.time==="night"?.06:.22})`);F(0,100,RW,4,`rgba(255,255,255,${S.time==="night"?.05:.16})`);
  for(let i=0;i<6;i++){const y=118+i*2.4;P(0,y,RW,2.4,i%2?"#7fae4a":"#8fbe55");}
  for(let i=0;i<9;i++){const x=wrapX(i*41-d*.35,RW+40)-20,h=14+(i%3)*4;P(x+3,122-h+10,1.5,h-6,"#4a3a2a");for(let k=0;k<4;k++)P(x+3-k*1.6,122-h+k*3.2,1.5+k*3.2,3,"#2f5a3a");}},
 isan(F,P,dk,d,t,S){
  for(let x=0;x<RW;x+=2){const X=x+d*.04;const mesa=wrapX(X,260)<70?10:0;P(x,108-mesa-Math.sin(X/40)*1.5,2,6+mesa,"#b4accc");}
  P(0,112,RW,20,"#a8c45a");for(let i=0;i<5;i++)P(0,114+i*3.6,RW,.6,"#94b04a");
  for(let i=0;i<3;i++){const x=wrapX(i*150+60-d*.3,RW+120)-60;P(x,110,18,8,"#8a6a4a");for(let k=0;k<6;k++)P(x-2+k,104+k,22-k*2,1,"#6a4a2a");P(x+2,118,1.5,6,"#5a4030");P(x+14,118,1.5,6,"#5a4030");}
  for(let i=0;i<7;i++){const x=wrapX(i*53-d*.42,RW+40)-20,h=26+(i%3)*5;P(x,124-h,1.5,h,"#5a4030");
    for(let k=-4;k<=4;k++){P(x+.75+k*1.6,124-h-Math.abs(k)*.8+1,1.6,1.2,"#3f6a2f");P(x+.75+k*1.2,124-h+Math.abs(k)*.9+1,1.2,1.2,"#4f7a3a");}}},
 central(F,P,dk,d,t,S){
  for(let i=0;i<4;i++){const x=wrapX(i*120+30-d*.05,RW+80)-40,c="#8a92b4";P(x,104,22,4,c);P(x+2,100,18,4,c);
    for(let k=0;k<10;k++){const w=14-Math.abs(k-6)*1.6;if(w>0)P(x+11-w/2,99-k,w,1,c);}for(let k=0;k<14;k++)P(x+11-(1.6-k*.1),89-k,3.2-k*.2,1,c);}
  P(0,108,RW,24,"#5fae4a");for(let i=0;i<6;i++)P(0,110+i*3.6,RW,.6,"#4f9a3c");
  P(0,124,RW,4,"#4f8fc0");for(let i=0;i<8;i++){const x=wrapX(i*45-d*.5,RW+20);F(x,125,4,.5,dk("#bfe4f2"));}
  { const x=wrapX(200-d*.3,RW+260)-60;P(x,96,40,12,"#e8d8b8");for(let k=0;k<3;k++){P(x-4+k*4,92-k*5,48-k*8,4,k%2?"#2f8a4f":"#e8892a");}P(x+18,74,4,6,"#d9a520");}
  for(let i=0;i<6;i++){const x=wrapX(i*61-d*.42,RW+40)-20,h=28+(i%2)*6;for(let k=0;k<h;k+=2)P(x+Math.sin(k/9)*1.5,122-k,1.6,2,"#7a5a3a");
    for(const [a,b] of [[-8,2],[-5,-1],[0,-2],[5,-1],[8,2]])P(x+a*.9,122-h+b,4,1.5,"#2f7a3a");}},
 south(F,P,dk,d,t,S){
  for(let i=0;i<6;i++){const x=wrapX(i*70-d*.05,RW+80)-40,h=38+(i%3)*12,w=20+(i%2)*10;
    for(let c=0;c<w;c+=1){const u=(c-w/2)/(w/2),hh=h*Math.pow(Math.max(0,1-u*u),.35)*(1-.08*Math.sin(c*1.7+i));P(x+c,108-hh,1,hh,c>w*.7?"#557f70":"#628f7f");P(x+c,108-hh,1,2.5,"#4f7a45");}}
  P(0,104,RW,10,"#2f8ab8");for(let i=0;i<12;i++){const x=wrapX(i*29-d*.12+Math.sin(t/400+i)*2,RW);F(x,106+(i%3)*2.5,3,.5,dk("#d8f2ff"));}
  P(0,114,RW,18,"#3f7a3a");
  for(let i=0;i<10;i++){const x=wrapX(i*33-d*.45,RW+30)-15;P(x,104,1.5,22,"#8a7a6a");P(x-5,98,12,8,"#2f5a2f");P(x-3,95,8,4,"#3f6a3a");}}};

function roadCar(F,S,t,dk){const k=S.plan.car,bob=Math.sin(t/90)>.6?-.5:0,ctx=F.ctx;
  if(k==="none"){const x=S.carX-34,y=140+bob,ol="#120c1c";F.shadow(x+34,y+27,36,2.5);
    F.box(x,y,68,22,dk("#f2f2f2"),ol);F(x,y+13,68,3,dk("#2c5fb3"));F(x,y+16.5,68,1,dk("#c8283c"));for(let i=0;i<6;i++)F(x+3+i*9.5,y+3,8,7,dk("#2c3a4a"));F(x+60,y+3,7,9,dk("#2c3a4a"));
    F.text("Bus",x+30,y+19.5,3.4,dk("#2c5fb3"));for(const wx of [x+9,x+54]){F.disc(wx,y+22,4,ol);F.disc(wx,y+22,2.2,"#9aa0aa");}if(S.time==="night")F.glow(x+74,y+16,18,"rgba(255,240,180,.35)");return;}
  const CX={songthaew:253,rotdaeng:253,yellowthaew:253,minibus:253,pinkvan:253,bluevan:253,tuktuk:259,tourbus:246,limo:249,goldvan:253}[k]||253;
  ctx.save();ctx.translate(S.carX*RS,(166+bob)*RS);ctx.scale(1.3,1.3);ctx.translate(-CX*RS,-178*RS);
  decorVehicle(null,{decor:{vehicle:k},decorUnlocks:{vehicle:[k]}},t,F);
  ctx.restore();
  if(S.time==="night"||S.wet){F.glow(S.carX+42,156+bob,26,"rgba(255,240,180,.32)");}}

// ---------- overlay: trip sheet → drive → arrive ----------
const ROAD={st:null,
  el(){let el=document.getElementById("roadtrip");if(!el){el=document.createElement("div");el.id="roadtrip";el.className="mgame";document.body.appendChild(el);
    el.onclick=e=>{const b=e.target.closest("[data-rd]");if(!b){if(this.st&&this.st.phase==="drive"&&e.target.closest(".rd-say"))this.next();return;}this.act(b.dataset.rd,b.dataset.v);};}
    if(!this.keyH){this.keyH=e=>{if(!this.st||this.st.phase!=="drive")return;if(e.key===" "||e.key==="Enter"){e.preventDefault();this.next();}else if(e.key==="Escape")this.finish();};document.addEventListener("keydown",this.keyH);}
    return el;},
  /* real trip: charge:true takes the money; onArrive(plan) runs after the drive */
  open(destKey,opts={}){if(!ROAD_DEST[destKey])return;const riders=roadRiders(G).map(f=>f.id);
    this.st={phase:"sheet",dest:destKey,car:roadCarKey(G),front:riders.find(id=>CANON_IDS.includes(id))||null,riders,opts,demo:false};this.el();this.draw();},
  /* free preview of any region, time, weather and car */
  demo(){const riders=G?roadRiders(G).map(f=>f.id).filter(id=>ROAD_TALK[id]):CANON_IDS.slice();
    this.st={phase:"demo",region:"north",time:"day",wet:false,car:G?roadCarKey(G):"minibus",front:riders[0]||null,riders,demo:true,opts:{}};this.el();this.draw();},
  act(a,v){const S=this.st;if(!S)return;
    if(a==="close")return this.close();if(a==="skip")return this.finish();if(a==="next")return this.next();
    if(a==="front"){S.front=S.front===v?null:v;return this.draw();}
    if(a==="region"){S.region=v;return this.draw();}if(a==="time"){S.time=v;return this.draw();}if(a==="wet"){S.wet=!S.wet;return this.draw();}if(a==="car"){S.car=v;return this.draw();}
    if(a==="go"){if(S.demo){const dk=Object.keys(ROAD_DEST).find(k=>ROAD_DEST[k].r===S.region&&ROAD_DEST[k].final);return this.drive(roadPlan(G,dk,S.car),S.time,S.wet);}
      const P=roadPlan(G,S.dest,S.car);if(S.opts.charge!==false){if(G.cash<P.total){toast("Not enough money for the trip");return;}G.cash-=P.total;}
      const w=G?gameWeek(G):1,rr=mulberry32((G.seed||1)+w*13)(),D=P.D,wetW=((w-1)%52)+1>=20&&((w-1)%52)+1<=40;
      return this.drive(P,D.km>=700?"night":D.km>=400?"dusk":"day",wetW&&rr<(D.r==="south"?.5:.3));}},
  sheetHTML(P,S){const band={cheap:["cheap","cheap"],mid:["Normal","mid"],high:["pricey","high"]}[P.band],pos=Math.max(4,Math.min(96,50+(P.price/ROAD_FUEL_BASE-1)*250));
    const row=(a,b)=>`<div class="kv-row"><span>${a}</span><span>${b}</span></div>`;
    return `<div class="rd-car"><b>${esc(roadCarName(P.car))}</b><small>${P.car==="none"?"The camp has no vehicle yet · everyone buys a bus ticket":`Economy ${P.C.kmL} km/L · seats ${P.C.seats} fighters in camp`}</small></div>
     <div class="rd-fuel ${band[1]}"><span class="rd-pump">⛽</span><div class="rd-gauge"><i style="left:${pos}%"></i></div><b>${fmt(P.price)}/L · ${band[0]}</b></div>
     ${G?`<p class="meta center">${roadFuelHint(G)}</p>`:""}
     <div class="px rd-bill">${P.fuel?row(`Fuel (round trip ${P.rt.toLocaleString("en-US")} km · ${Math.round(P.litres)} L)`,fmt(P.fuel)):""}${P.toll?row("Tolls",fmt(P.toll)):""}
      ${P.bus?row(`Bus tickets ${P.onBus} fighters in camp ${P.car!=="none"?" (not enough seats)":""}`,fmt(P.bus)):""}${P.lodge?row(`Lodging ${P.nights} night(s)`,fmt(P.lodge)):""}${row(`Food ${P.people} fighters in camp`,fmt(P.food))}
      <div class="kv-row rd-total"><span>Total</span><b class="goldt">${fmt(P.total)}</b></div></div>
     <p class="meta center">Road fatigue +${P.fat} each ${P.nights?` · stay ${P.nights} night(s)`:" · day trip"}</p>`;},
  frontHTML(S){const ids=S.riders.filter(id=>ROAD_SHOTGUN[id]);if(!ids.length||(S.car==="none"))return "";
    return `<p class="meta center">Who rides shotgun?</p><div class="mbpick">${ids.map(id=>`<button class="mbf ${S.front===id?"on":""}" data-rd="front" data-v="${id}"><img src="${faceSrc(id,"happy","casual")}" alt=""><small>${esc(G&&G.F[id]?G.F[id].name:id)}</small></button>`).join("")}</div>`;},
  draw(){const S=this.st,el=this.el();if(!S)return;
    if(S.phase==="sheet"){const P=roadPlan(G,S.dest,S.car),D=P.D,poor=S.opts.charge!==false&&G.cash<P.total;
      el.innerHTML=`<div class="mbox px"><h2>🚐 Trip to ${esc(D.name)}</h2><p class="meta center">${ROAD_REGION[D.r].name} · ${D.km} km ${D.final?" · regional title ring":""}</p>
       ${this.sheetHTML(P,S)}${this.frontHTML(S)}
       <div class="mfoot roadbtns"><button class="btn" data-rd="close">Not now</button><button class="btn primary" data-rd="go" ${poor?"disabled":""}>${poor?"Not enough money":`Set off · ${fmt(P.total)}`}</button></div></div>`;return;}
    if(S.phase==="demo"){const cars=["none",...Object.keys(CAMP_DECOR.vehicle.items).filter(k=>k!=="none"&&ROAD_CAR[k])];
      const dk=Object.keys(ROAD_DEST).find(k=>ROAD_DEST[k].r===S.region&&ROAD_DEST[k].final),P=roadPlan(G,dk,S.car);
      const seg=(a,list,cur)=>`<div class="rd-seg">${list.map(([k,n])=>`<button class="btn sm ${k===cur?"primary":""}" data-rd="${a}" data-v="${k}">${n}</button>`).join("")}</div>`;
      el.innerHTML=`<div class="mbox px"><h2>🚐 Driving scene preview</h2><p class="meta center">Free · see the scene and compare each vehicle's trip cost</p>
       ${seg("region",Object.entries(ROAD_REGION).map(([k,R])=>[k,R.tag]),S.region)}
       ${seg("time",[["day","Day"],["dusk","Dusk"],["night","Night"]],S.time)}
       <div class="rd-seg"><button class="btn sm ${S.wet?"primary":""}" data-rd="wet">🌧 Rain</button></div>
       ${seg("car",cars.map(k=>[k,roadCarName(k)]),S.car)}
       <p class="meta center">Sample trip cost to ${esc(ROAD_DEST[dk].name)} (${ROAD_DEST[dk].km} km)</p>${this.sheetHTML(P,S)}${this.frontHTML(S)}
       <div class="mfoot roadbtns"><button class="btn" data-rd="close">Close</button><button class="btn primary" data-rd="go">Set off ▸</button></div></div>`;return;}
    if(S.phase==="drive"){const L=S.lines[S.i],who=L.n!=="nar"&&(G&&G.F[L.n]?G.F[L.n].name:({kati:"Kati",mali:"Mali",rin:"Rin",ploy:"Ploy",fah:"Fah"})[L.n]||L.n);
      el.innerHTML=`<div class="mplay rd-play"><div class="mhud"><b>🚐 ${esc(S.plan.D.name)}</b><span>${ROAD_REGION[S.plan.D.r].name}</span><button class="btn sm" data-rd="skip">Skip ▸▸</button></div>
       <canvas id="rdcv" width="${RW*RS}" height="${RH*RS}"></canvas>
       <div class="rd-say px ${L.n==="nar"?"nar":""}">${who?`<img src="${faceSrc(L.n,"happy","casual")}" alt=""><div><b>${esc(who)}</b><p>${esc(L.t)}</p></div>`:`<p>${esc(L.t)}</p>`}<small>${S.i+1}/${S.lines.length} · tap to continue</small></div></div>`;
      const cv=document.getElementById("rdcv");S.x=cv.getContext("2d");}},
  drive(P,time,wet){const S=this.st;S.phase="drive";S.plan=P;S.time=time;S.wet=!!wet;S.r=P.D.r;S.v=60;S.carX=150;S.seed=((G&&G.seed)||7)+(G?gameWeek(G):0)*7+P.D.km;
    S.lines=roadLines(S);S.i=0;S.signAt=null;S.t0=performance.now();S.lineAt=S.t0;try{AU.startMusic&&AU.startMusic("date");}catch(e){}
    this.draw();cancelAnimationFrame(this.raf);
    const RMQ=typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loop=now=>{if(!this.st||this.st.phase!=="drive")return;const t=RMQ?0:now-S.t0;
      if(S.x&&S.x.canvas.isConnected){S.x.clearRect(0,0,RW*RS,RH*RS);roadDraw(S.x,S,t);}
      const L=S.lines[S.i];if(now-S.lineAt>2600+L.t.length*45)this.next();
      this.raf=requestAnimationFrame(loop);};
    this.raf=requestAnimationFrame(loop);},
  next(){const S=this.st;if(!S||S.phase!=="drive")return;if(S.i>=S.lines.length-1)return this.finish();S.i++;S.lineAt=performance.now();
    if(S.lines[S.i].sign&&S.signAt==null)S.signAt=performance.now()-S.t0;this.draw();},
  finish(){const S=this.st;if(!S)return;cancelAnimationFrame(this.raf);const P=S.plan,cb=S.opts&&S.opts.onArrive;
    if(S.demo){S.phase="demo";this.draw();return;}this.close();if(cb&&P)cb(P);},
  close(){cancelAnimationFrame(this.raf);const el=document.getElementById("roadtrip");if(el)el.remove();this.st=null;try{AU.startMusic&&AU.startMusic("hub");}catch(e){}if(typeof render==="function"&&G)render();}};
try{if(/roaddemo/.test(location.hash||""))setTimeout(()=>ROAD.demo(),600);}catch(e){}

// ================= v1.90 (hidden) ศึกชิงเจ้าสี่ภาค — regional chapter core =================
/* Ships as its own file (region.js, bundled with road.js) and loads only once the chapter opens, so players in years 1–5 never download it.
   Round 1: the invitation, the four regions, planning a trip (calendar + cost + whole camp away), the provincial belt bouts.
   Later rounds: the drive scene, the champion series, minigame duels, the story, the Naka League finale. Spec: claude/regional-chapter.md */

const RG={
 north:{name:"the North",champ:"Baibua",nick:"Thorned Lotus of Lanna",col:"#e86fa0",prov:["chiangrai","nan","uttaradit","lampang"],fin:"chiangmai",tilt:{elbow:2.5,counter:2}},
 isan:{name:"Isan",champ:"Tubtim",nick:"Isan's Ruby Master",col:"#d23246",prov:["udon","khonkaen","buriram","ubon"],fin:"korat",tilt:{kick:2.5,foot:1.5}},
 central:{name:"the Central Plains",champ:"Alicia",nick:"Princess of the Muay Thai World",col:"#2f62c8",prov:["lopburi","suphan","phetchaburi","chanthaburi"],fin:"ayutthaya",tilt:{punch:2.5,clinch:1.5}},
 south:{name:"the South",champ:"Chaba",nick:"Storm Fist That Calms the Waves",col:"#1f9a7a",prov:["chumphon","surat","nakhonsi","songkhla"],fin:"phuket",tilt:{speed:2,foot:1.5,punch:1}}};
const RG_ORDER=["north","isan","central","south"];
/* the local belt holder waiting in each province */
const RG_OPP={chiangrai:"Kaewkan Sor Mae Sai",nan:"Namphueng Luk Muang Nan",uttaradit:"Thongdee Sit Dap Hak",lampang:"Ma Lek Luk Rot Ma",
 udon:"Buadaeng Nong Han",khonkaen:"Maikaew Luk Chonnabot",buriram:"Saifah Phanom Rung",ubon:"Thianthong Rim Khong",
 lopburi:"Jo Thong Sor Phra Prang",suphan:"Maemai Bang Pla Ma",phetchaburi:"Mokaeng Muang Phet",chanthaburi:"Mangkhut Luk Chan",
 chumphon:"Nangnuan Paknam",surat:"Nangrom Don Sak",nakhonsi:"Talung Sor Muang Khon",songkhla:"Samila Luk Songkhla"};
const RG_LAST_WK=50; /* trips run until week 50; the last two weeks of the year are the holidays */

const REGION={
  /* ---------- state helpers ---------- */
  base(G){return ((G.season||1)-1)*52;},
  beltCount(G,r){const b=(G.region.belts||{})[r]||{};return RG[r].prov.filter(p=>b[p]).length;},
  beltTotal(G){return RG_ORDER.reduce((s,r)=>s+this.beltCount(G,r),0);},
  /* the first week the whole camp is free to travel: after the rest week, nobody else booked, not past week 50 */
  tripWeek(G){const R=G.region,from=Math.max(G.week+1,(R.nextTripAbs||0)-this.base(G));
    for(let w=from;w<=RG_LAST_WK;w++){if(!G.bookings.some(b=>b.week===w&&G.F[b.a]&&G.F[b.a].camp==="player"))return w;}return null;},
  riders(G,wk){return roster(G).filter(f=>!f.injury&&!G.bookings.some(b=>b.week===wk&&(b.a===f.id||b.b===f.id)));},

  /* ---------- booking a belt trip ---------- */
  makeOpp(G,dest,me,abs){const r=ROAD_DEST[dest].r,id=`rg_${dest}_${abs}`;if(G.F[id])return id;
    const n=this.beltTotal(G),target=Math.min(21,ovr(me.a)+.3+n*.12),rng=mulberry32((G.seed||1)+stableHash(id));
    const f=baseFighter(id,mkNPC(id,RG_OPP[dest]||"Provincial champion","X",Math.round(target-1),rng,RG_ORDER.indexOf(r)+2));
    for(const [k,v] of Object.entries(RG[r].tilt))f.a[k]=Math.min(20,f.a[k]+v);
    liftOpponent(f,target,20);f.camp="quest";f.div="X";f.rg=dest;f.color=RG[r].col;f.lvl=me.lvl||1;f.fatigue=0;f.morale=70;
    G.F[id]=f;syncFighterAges(G);return id;},
  purse(G){const n=this.beltTotal(G),w=Math.round((10000+n*800)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  book(G,dest,fid){const R=G.region,D=ROAD_DEST[dest],me=G.F[fid];if(!R||!D||!me)return {ok:false,why:"Missing data"};
    if(R.trip)return {ok:false,why:"A trip is already planned"};if((R.belts[D.r]||{})[dest])return {ok:false,why:"Already won this province's belt"};
    const wk=this.tripWeek(G);if(!wk)return {ok:false,why:"No free week left to travel this year"};
    if(!this.riders(G,wk).some(f=>f.id===fid))return {ok:false,why:`${me.name} isn't fit to travel`};
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs);if(G.cash<P.total)return {ok:false,why:"Not enough money for the trip"};
    const opp=this.makeOpp(G,dest,me,abs),pay=this.purse(G),bid=`rg${abs}_${dest}`;
    G.bookings.push({id:bid,a:fid,b:opp,week:wk,tier:"region",rounds:3,win:pay.win,lose:pay.lose,region:{r:D.r,dest},bg:"bg_district.webp"});
    G.cash-=P.total;G.offers=(G.offers||[]).filter(o=>o.week!==wk);
    R.trip={abs,season:G.season||1,wk,dest,fid,opp,bid,cost:P.total,car:P.car,fat:P.fat};
    G.log=G.log||[];G.log.push(`Trip planned to ${D.name} week ${wk} · travel cost ${fmt(P.total)}`);return {ok:true,wk,cost:P.total};},
  cancel(G){const R=G.region,T=R&&R.trip;if(!T)return false;G.bookings=G.bookings.filter(b=>b.id!==T.bid);G.cash+=T.cost;
    (R.gc=R.gc||[]).push(T.opp);R.trip=null;return true;},

  /* ---------- results + weekly upkeep ---------- */
  flush(G){const R=G.region;if(!R||!R.pend||!R.pend.length)return;const done=R.pend.splice(0);
    for(const p of done){const rg=p.region||{},r=rg.r,dest=rg.dest,D=ROAD_DEST[dest];if(!D||!RG[r])continue;
      const T=R.trip,abs=T&&T.bid===p.bid?T.abs:gameWeek(G);
      if(p.res==="W"){R.belts[r]=R.belts[r]||{};R.belts[r][dest]=1;G.log=G.log||[];G.log.push(`${G.F[p.a]?G.F[p.a].name:""} wins the provincial belt of ${D.name}!`);
        if(this.beltCount(G,r)===4&&R.champ[r].state==="locked"){R.champ[r].state="letter";const C=RG[r];
          addMail(G,{kind:"letter",from:`${C.champ} · Champion of ${C.name}`,title:`${C.name}: all four belts won`,body:`All four provincial belts of ${C.name} are yours. The title ring in ${ROAD_DEST[C.fin].name} is waiting for your camp.

I'll send you the date of our bout soon. Get the fighter who'll face me ready.

${C.champ}`});}}
      R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+2);(R.gc=R.gc||[]).push(p.b);}},
  weekly(G){const R=G.region;this.flush(G);const T=R.trip;
    /* a trip whose bout vanished (the week went by, the booking was dropped) is let go */
    if(T&&gameWeek(G)>T.abs&&!G.bookings.some(b=>b.id===T.bid)){(R.gc=R.gc||[]).push(T.opp);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,T.abs+2);}
    const keep=new Set(G.bookings.map(b=>b.b));R.gc=(R.gc||[]).filter(id=>{if(keep.has(id))return true;if(G.F[id]&&G.F[id].rg)delete G.F[id];return false;});},

  /* ---------- screens ---------- */
  css(){if(typeof document==="undefined"||document.getElementById("rg-css"))return;const st=document.createElement("style");st.id="rg-css";
    st.textContent=`.rg-head{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between}.rg-head h3{margin:0}
.rg-stats{display:flex;gap:.4rem;flex-wrap:wrap}.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem}
.rg-reg{border-top:6px solid var(--rc);position:relative}.rg-reg h3{margin:.1rem 0 0}.rg-reg h3::first-letter{text-transform:uppercase}.rg-champ{font-size:.85rem;opacity:.85;margin-bottom:.5rem}
.rg-prov{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px dashed rgba(0,0,0,.15)}
.rg-prov:last-child{border-bottom:0}.rg-prov small{opacity:.7}.rg-fin{opacity:.9}.rg-belt{color:#b8860b;font-weight:700}
.rg-trip{border-left:6px solid var(--gold,#d9a21b)}.rg-pick{display:flex;flex-wrap:wrap;gap:.4rem;margin:.4rem 0}
.rg-pick button{display:flex;align-items:center;gap:.35rem}.rg-pick button[aria-pressed="true"]{outline:3px solid var(--gold,#d9a21b)}
.rg-bill .kv-row{padding:.15rem 0}.rg-fuel.cheap{color:#2f8a50}.rg-fuel.high{color:#c8283c}`;document.head.appendChild(st);},
  fuelLine(G){const p=roadFuel(G,gameWeek(G)),b=roadFuelBand(p);
    return `<p class="meta">Fuel this week <b class="rg-fuel ${b}">฿${p.toFixed(2)}/L · ${b==="cheap"?"cheap":b==="high"?"pricey":"Normal"}</b> · ${esc(roadFuelHint(G))}</p>`;},
  html(){this.css();
    if(!G.region){const t=(G.honors||[]).filter(h=>h.kind==="province").length;
      return `<section class="px card"><h3>Four Regions Championship</h3><p>The regional tournament sends its invitation once year 5 is over and the camp has won 3 provincial titles.</p>
       <div class="kv-row"><span>Year</span><b>${G.season||1} / 6</b></div><div class="kv-row"><span>Provincial titles</span><b>${t} / 3</b></div>
       ${!REGION_LIVE?`<div class="mfoot"><button class="btn gold" data-act="rgdevstart">Open the chapter now (test mode)</button></div>`:""}</section>`;}
    const R=G.region,T=R.trip,cups=(R.cups||[]).length,belts=this.beltTotal(G),nx=T?null:this.tripWeek(G);
    const tripCard=T?`<section class="px card rg-trip"><h3>Planned trip</h3><div class="kv-row"><span>${esc(ROAD_DEST[T.dest].name)} · ${esc(RG[ROAD_DEST[T.dest].r].name)}</span><b>Week ${T.wk}</b></div>
       <div class="kv-row"><span>Fighter</span><b>${G.F[T.fid]?esc(G.F[T.fid].name):"-"}</b></div><div class="kv-row"><span>Opponent</span><b>${G.F[T.opp]?esc(G.F[T.opp].name):"-"}</b></div>
       <div class="kv-row"><span>Travel cost (paid)</span><b class="num">${fmt(T.cost)}</b></div>
       <p class="meta">The whole camp travels together that week, so no other bouts.</p><div class="mfoot"><button class="btn" data-act="rgcancel">Cancel trip (refund)</button></div></section>`:"";
    const regs=RG_ORDER.map(r=>{const C=RG[r],b=R.belts[r]||{},n=this.beltCount(G,r),ch=R.champ[r]||{},F=ROAD_DEST[C.fin];
      const rows=C.prov.map(p=>{const D=ROAD_DEST[p],got=b[p],nights=roadNights(D.km);
        return `<div class="rg-prov"><span><b>${esc(D.name)}</b> <small>${D.km} km · ${nights?`Stay ${nights} night(s)`:"Day trip"}</small></span>${got?`<span class="rg-belt">🏅 Belt won</span>`:`<button class="btn sm${T||!nx?"":" primary"}" data-act="rgplan" data-v="${p}" ${T||!nx?"disabled":""}>Plan</button>`}</div>`;}).join("");
      const fin=`<div class="rg-prov rg-fin"><span><b>${esc(F.name)}</b> <small>regional title ring</small></span><span class="meta">${ch.state==="won"?"🏆 Cup won":n<4?`🔒 Win all 4 belts first (${n}/4)`:"✉️ Waiting for the champion's letter"}</span></div>`;
      return `<section class="px card rg-reg" style="--rc:${C.col}"><h3>${esc(C.name)}</h3><div class="rg-champ">Regional champion: <b>${esc(C.champ)}</b> · ${esc(C.nick)}</div>${rows}${fin}</section>`;}).join("");
    return `<section class="px card rg-head"><div><h3>Four Regions Championship</h3><span class="meta">Edition ${R.edition||1}</span></div>
       <div class="rg-stats"><span class="pill gold">Cups ${cups}/4</span><span class="pill">Belts ${belts}/16</span><span class="pill ${T?"red":nx?"green":""}">${T?`Trip: ${esc(ROAD_DEST[T.dest].name)} · Week ${T.wk}`:nx?`Can travel week ${nx}`:"No more trips this year"}</span></div></section>
     ${tripCard}${this.fuelLine(G)}<div class="rg-grid">${regs}</div>`;},
  planHTML(dest){const D=ROAD_DEST[dest],C=RG[D.r],wk=this.tripWeek(G);if(!wk)return `<h2>${esc(D.name)}</h2><p>No free week left to travel this year</p>`;
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs),R=this.riders(G,wk);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const me=UI.rgFid&&G.F[UI.rgFid],poor=G.cash<P.total,line=(k,v)=>v?`<div class="kv-row"><span>${k}</span><b class="num">${fmt(v)}</b></div>`:"";
    return `<h2>${esc(D.name)} <small class="meta">· ${esc(C.name)}</small></h2>
     <p class="meta">Travel in week <b>${wk}</b> · ${D.km} km · ${P.nights?`Stay ${P.nights} night(s)`:"Day trip"} · opponent: <b>${esc(RG_OPP[dest]||"Provincial champion")}</b>, the provincial champion</p>
     <h3>Who fights?</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">Nobody is fit to travel that week</p>`}
     <h3>Round-trip travel cost</h3><div class="rg-bill"><div class="kv-row"><span>Vehicle</span><b>${esc(roadCarName(P.car))}</b></div>
      ${line(`Fuel ${Math.round(P.litres)} L × ฿${P.price.toFixed(2)}`,P.fuel)}${line("Tolls",P.toll)}${line(`Bus tickets × ${P.onBus}`,P.bus)}${line(`Lodging ${P.nights} night(s)`,P.lodge)}${line(`Food × ${P.people}`,P.food)}
      <div class="kv-row"><span><b>Total</b></span><b class="num ${poor?"redt":"goldt"}">${fmt(P.total)}</b></div></div>
     <p class="meta">The whole camp: ${P.people} people travel together; no other bouts that week · road fatigue about +${P.fat} each ${P.car==="none"?" · the camp has no vehicle yet, so it's the bus (pricier and more tiring)":""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">Not now</button><button class="btn primary" data-act="rggo" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"Not enough money":"Confirm the trip"}</button></div>`;}
};

if(typeof XMODAL!=="undefined")XMODAL.rgplan=m=>({body:REGION.planHTML(m.dest),foot:false});
if(typeof ACT!=="undefined")Object.assign(ACT,{
  rgplan:d=>{UI.rgFid=null;UI.modal={type:"rgplan",dest:d.v};render();},
  rgfid:d=>{UI.rgFid=d.v;render();},
  rggo:d=>{const r=REGION.book(G,d.v,UI.rgFid);if(!r.ok){toast(r.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`Trip booked for week ${r.wk} · travel cost paid ${fmt(r.cost)}`);save();render();},
  rgcancel:()=>{if(REGION.cancel(G)){toast("Trip cancelled. The travel money is refunded.");save();render();}},
  rgdevstart:()=>{if(REGION_LIVE)return;regionStart(G);save();render();}});
if(typeof G!=="undefined"&&G&&G.region)REGION.flush(G);

