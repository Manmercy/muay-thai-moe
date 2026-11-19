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
 songthaew:{kmL:10.5,seats:10,fat:1.15},
 yellowthaew:{kmL:11,seats:10,fat:1.15},
 rotdaeng:{kmL:11,seats:10,fat:1.12},
 tuktuk:{kmL:12,seats:3,fat:1.3},
 minibus:{kmL:13.5,seats:12,fat:1},
 bluevan:{kmL:15,seats:12,fat:.95},
 pinkvan:{kmL:16,seats:12,fat:.95},
 tourbus:{kmL:16.5,seats:30,fat:.85},
 limo:{kmL:18,seats:8,fat:.75},
 goldvan:{kmL:21,seats:12,fat:.8}};
const ROAD_BUS_PER_KM=1.1,ROAD_TOLL_PER_KM=.35,ROAD_ROOM=650,ROAD_FOOD=180; // per person per km / per km / per room per night / per person per day

const ROAD_REGION={north:{name:"the North",tag:"North"},isan:{name:"Isan",tag:"Isan"},central:{name:"the Central Plains",tag:"Central"},south:{name:"the South",tag:"South"}};
/* v1.91.16 (Man): the camp is in Chiang Mai, so these are rough road distances from Chiang Mai. final:1 = the regional title ring.
   Real distances are longer overall, so ROAD_KM_K scales the per-km costs and road fatigue to keep a full regional run about as dear as before
   (the north is now the cheap starter region and the south the long haul). Fuel stays honest: litres = km ÷ km/L, with km/L raised to match. */
const ROAD_DEST={
 chiangrai:{name:"Chiang Rai",r:"north",km:190},nan:{name:"Nan",r:"north",km:320},uttaradit:{name:"Uttaradit",r:"north",km:290},lampang:{name:"Lampang",r:"north",km:100},chiangmai:{name:"Chiang Mai",r:"north",km:15,final:1},
 udon:{name:"Udon Thani",r:"isan",km:700},khonkaen:{name:"Khon Kaen",r:"isan",km:680},buriram:{name:"Buriram",r:"isan",km:880},ubon:{name:"Ubon Ratchathani",r:"isan",km:1030},korat:{name:"Nakhon Ratchasima",r:"isan",km:750,final:1},
 lopburi:{name:"Lopburi",r:"central",km:590},suphan:{name:"Suphan Buri",r:"central",km:600},phetchaburi:{name:"Phetchaburi",r:"central",km:800},chanthaburi:{name:"Chanthaburi",r:"central",km:920},ayutthaya:{name:"Ayutthaya",r:"central",km:620,final:1},
 chumphon:{name:"Chumphon",r:"south",km:1150},surat:{name:"Surat Thani",r:"south",km:1330},nakhonsi:{name:"Nakhon Si Thammarat",r:"south",km:1450},songkhla:{name:"Songkhla",r:"south",km:1650},phuket:{name:"Phuket",r:"south",km:1550,final:1}};
const ROAD_KM_K=.65;
const roadNights=km=>km<600?0:km<1200?1:2;

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
  const litres=C.kmL?rt/C.kmL:0,fuel=Math.round(litres*price),toll=k==="none"?0:Math.round(rt*ROAD_TOLL_PER_KM*ROAD_KM_K),bus=Math.round(onBus*rt*ROAD_BUS_PER_KM*ROAD_KM_K);
  const rooms=Math.ceil(people/2),lodge=nights*rooms*ROAD_ROOM,food=(nights+1)*people*ROAD_FOOD;
  const fat=Math.round(D.km/100*C.fat*1.2*ROAD_KM_K); // fatigue every traveller picks up on the way
  return {dest:destKey,D,car:k,C,price,band:roadFuelBand(price),people,inCar,onBus,nights,rt,litres,fuel,toll,bus,lodge,food,fat,total:fuel+toll+bus+lodge+food};}

// ---------- driving scene: lines ----------
const ROAD_SCENERY={
 north:["The road starts winding up the mountain. Thin mist hangs over the pine tops, cold enough that we close the windows.","Terraced fields step down into the valley, the road signs carrying the Lanna script everyone at camp is used to by now."],
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
      const P=S.opts.plan||roadPlan(G,S.dest,S.car);if(S.opts.charge!==false&&!S.opts.paid){if(G.cash<P.total){toast("Not enough money for the trip");return;}G.cash-=P.total;}
      const w=G?gameWeek(G):1,rr=mulberry32((G.seed||1)+w*13)(),D=P.D,wetW=((w-1)%52)+1>=20&&((w-1)%52)+1<=40;
      return this.drive(P,D.km>=1100?"night":D.km>=600?"dusk":"day",wetW&&rr<(D.r==="south"?.5:.3));}},
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
    if(S.phase==="sheet"){const P=S.opts.plan||roadPlan(G,S.dest,S.car),D=P.D,poor=!S.opts.paid&&S.opts.charge!==false&&G.cash<P.total;
      el.innerHTML=`<div class="mbox px"><h2>🚐 Trip to ${esc(D.name)}</h2><p class="meta center">${ROAD_REGION[D.r].name} · ${D.km} km ${D.final?" · regional title ring":""}</p>
       ${this.sheetHTML(P,S)}${this.frontHTML(S)}
       ${S.opts.paid?`<p class="meta center">${S.opts.sponsor?"NAGA Energy Drink covers travel for camps in a regional title fight":"Travel cost already paid when you planned the trip"}</p><div class="mfoot roadbtns"><button class="btn primary" data-rd="go">Set off ▸</button></div></div>`
        :`<div class="mfoot roadbtns"><button class="btn" data-rd="close">Not now</button><button class="btn primary" data-rd="go" ${poor?"disabled":""}>${poor?"Not enough money":`Set off · ${fmt(P.total)}`}</button></div></div>`}`;return;}
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
    if(S.demo){S.phase="demo";this.draw();return;}const front=S.front;this.close(true);if(cb&&P)cb(P,front);},
  close(quiet){cancelAnimationFrame(this.raf);const el=document.getElementById("roadtrip");if(el)el.remove();this.st=null;if(quiet)return;try{AU.startMusic&&AU.startMusic("hub");}catch(e){}if(typeof render==="function"&&G)render();}};
try{if(/roaddemo/.test(location.hash||""))setTimeout(()=>ROAD.demo(),600);}catch(e){}

// ================= v1.90 (hidden) ศึกชิงเจ้าสี่ภาค — regional chapter core =================
/* Ships as its own file (region.js, bundled with road.js) and loads only once the chapter opens, so players in years 1–5 never download it.
   Round 1: the invitation, the four regions, planning a trip (calendar + cost + whole camp away), the provincial belt bouts.
   Later rounds: the drive scene, the champion series, minigame duels, the story, the Naka League finale. Spec: claude/regional-chapter.md */

const RG={
 north:{name:"the North",champ:"Baibua",nick:"Thorned Lotus of Lanna",col:"#e86fa0",prov:["chiangrai","nan","uttaradit","lampang"],fin:"chiangmai",tilt:{elbow:2.5,counter:2}},
 isan:{name:"Isan",champ:"Tabtim",nick:"Isan's Ruby Master",col:"#d23246",prov:["udon","khonkaen","buriram","ubon"],fin:"korat",tilt:{kick:2.5,foot:1.5}},
 central:{name:"the Central Plains",champ:"Alicia",nick:"Princess of the Muay Thai World",col:"#2f62c8",prov:["lopburi","suphan","phetchaburi","chanthaburi"],fin:"ayutthaya",tilt:{punch:2.5,clinch:1.5}},
 south:{name:"the South",champ:"Chaba",nick:"Storm Fist That Calms the Waves",col:"#1f9a7a",prov:["chumphon","surat","nakhonsi","songkhla"],fin:"phuket",tilt:{speed:2,foot:1.5,punch:1}}};
const RG_ORDER=["north","isan","central","south"];
/* the local belt holder waiting in each province */
/* v1.90: each province champion's own move — a named finisher (code effects in her province colour) plus a small edge on that weapon */
const RG_PSP={chiangrai:["White Temple Elbow","elbow",{dmg:{elbow:.10}}],nan:["Nan Longboat Knee","knee",{dmg:{knee:.10}}],uttaradit:["Broken-Sword Elbow of Phraya Phichai","elbow",{dmg:{elbow:.08},ctr:.02}],lampang:["Iron Horse Push Kick of Lampang","kick",{dmg:{kick:.08},hit:{kick:.02}}],
 udon:["Red Lotus Bloom Kick","kick",{dmg:{kick:.10}}],khonkaen:["Silk-Weaver Knee of Khon Kaen","knee",{dmg:{knee:.08},regen:.06}],buriram:["Phanom Rung Lightning Punch","punch",{dmg:{punch:.10}}],ubon:["Candle Festival Elbow","elbow",{dmg:{elbow:.08},hit:{elbow:.02}}],
 lopburi:["Monkey Fools the Master Punch","punch",{dmg:{punch:.08},evade:.01}],suphan:["Suphan Master-Move Kick","kick",{dmg:{kick:.10}}],phetchaburi:["Khao Wang Knee of Phetchaburi","knee",{dmg:{knee:.10}}],chanthaburi:["Mangosteen Shell Punch","punch",{dmg:{punch:.08},clDef:1}],
 chumphon:["Swooping Gull Kick","kick",{dmg:{kick:.08},evade:.01}],surat:["Don Sak Oyster Shell Elbow","elbow",{dmg:{elbow:.10}}],nakhonsi:["Shadow Puppet Punch","punch",{dmg:{punch:.10}}],songkhla:["Samila Mermaid Kick","kick",{dmg:{kick:.08},regen:.06}]};
const RG_JOIN_LVDROP=5,RG_JOIN_STAT=.9;
const RG_SK_ADJ={north:1.75,isan:.75,central:.72,south:.85},RG_SK_CUP={north:.015,isan:.03,central:.08,south:.065},RG_CH_SKLV=35; /* her tree grows with each cup (Lv.35→37), so the raw strength gives a little back per cup */ /* v1.91.45: champions now fight with a learned tree — their raw strength comes down by this much so the win rates stay where Man set them */
const RG_TRAIT2={baibua:{name:"Still as the Lotus Pond",desc:"Recovers 10% more between rounds · 4% more accurate below 45% HP",fx:{regen:.1,clutch:.04}},
  tabtim:{name:"Laugh It Off",desc:"Strikes cost 6% less stamina · morale counts 2% more in fights",fx:{staSave:.06,mor:.02}},
  alicia:{name:"On Camera",desc:"Base accuracy +1.5% · punches score 10% more",fx:{prep:.015,pts:{punch:.1}}},
  chaba:{name:"Undertow",desc:"Counters 4% more often · counters hit 12% harder",fx:{ctr:.04,ctrDmg:.12}}};
function rgDress(f){const P=f&&f.rg&&RG_PSP[f.rg];if(!P)return f;f.spl=[{w:P[1],def:P[0],npc:1,p:.45}];f.pfx=P[2];return f;}
/* v1.90 difficulty (18 Nov 2026, Man): every fighter gets a fair-but-hard bout — belts ~38% → 30%, a championship series ~18% → 10% —
   found by sparring her against the opponent at a few strengths (rgFit). The ladder below is the CEILING: past it the opponent stops
   growing, so a fighter beyond the stat ceiling of 20 (limit break) starts winning more. Ceiling values: */
/* (old note) difficulty ladder: opponent strength in stat points + ring craft.
   Tuned (18 Nov 2026, 200 bouts each) so a fully built Ploy (stats 20, Lv.23, full skills) wins belt 1 ~39% → belt 16 ~27% and a championship series 20% (cup 1) → 10% (cup 4).
   A casual build (stats 20, Lv.18) wins ~5% / ~0% — the limit break is meant to be the way past it. */
/* v1.90.17 (Man): no extra comeback odds on belts; a lost championship series keeps the small v1.90.14 nudge (+.03 a bout, twice) */
const RG_RETRY={bout:.03,sMax:2};
/* v1.90.21 (Man): one bar for everyone — opponent strength is fixed, not fitted to your fighter. It climbs with progress (later belts and champions have studied the tapes of earlier fights).
   Set from a "casual" fighter (stats 20, Lv.18, every skill she can learn, morale 70, no fight prep): the middle of the five heroines wins belts 48% → 32%,
   championship series 22% → 12%, the Naka members 45/40/35/30% and Ladda 20%. Morale, fight prep, the camp and limit-break growth all push past that */
const RG_FIX={belt:n=>22.25+.65*Math.min(15,n)/15,champ:(cups,tries)=>23.41+.1067*Math.min(3,cups)-.15*Math.min(2,tries||0),nl:{nia:24.21,varya:25.6,meili:24.37,rosa:25.91,ladda:24.0}}; /* v1.91.38 (Man): champions a little harder (+.3 → maxed series ~56→45%), the Naka members harder (+.5 → ~40%), Ladda a brutal final (+1.3 → ~18%) */ /* v1.91.13 (Man): set for a maxed fighter (Lv.32, every bonus, stat 20) — belts ~80% · series ~60% · Naka ~50% · Ladda ~40% */ /* v1.91.6: re-set after the heroine rebalance (v1.91.0–1.91.5), same targets, middle of the five home-line builds · v1.91.7: champions −0.35 after opponents got fixed styles */
/* v1.90.18 (Man): belts 40% every time, championship series 20% → 12% — the chapter in about 3 years for a fighter who never outgrows the fit */
const RG_ODDS={belt:n=>.40,series:cups=>.20-.08*Math.min(3,cups)/3,bout:s=>{let lo=0,hi=1;for(let i=0;i<30;i++){const m=(lo+hi)/2;m*m*(3-2*m)<s?lo=m:hi=m;}return (lo+hi)/2;}};
/* the opponent strength (≤ ceil) at which `me` wins about `p` of 5-round bouts. setT(T) rebuilds the opponent at strength T. */
/* the fit sees the fighter's lasting strength only (stats, level, skills, gear, camp): morale, fatigue, injury and this week's fight prep are left out, so they swing the real bout (v1.90.19: prep was counted if done before booking) */
function rgFit(me,opp,setT,p,ceil,rounds){const M={...me,a:{...me.a},fatigue:0,injury:0,morale:70,prepBonus:0,counterPrep:0,labPrep:0,trainLog:[]},N=60;
  const win=T=>{setT(T);let w=0;for(let i=0;i<N;i++){const F=quickFight(M,opp,40417+i*131,rounds||5);if(F.result.win==="A")w++;else if(F.result.win==="D")w+=.5;}return w/N;};
  if(win(ceil)>=p)return ceil;let lo=Math.min(12,ceil-1),hi=ceil;for(let i=0;i<7;i++){const m=(lo+hi)/2;win(m)>p?lo=m:hi=m;}const T=(lo+hi)/2;setT(T);return T;}
const RG_LADDER={belt:n=>RG_LADDER.b0+n*RG_LADDER.bs,champ:(cups,tries)=>RG_LADDER.c0+cups*RG_LADDER.cs-Math.min(RG_RETRY.sMax,tries||0)*.15,b0:24.9,bs:.027,c0:24.8,cs:.15};
const RG_OPP={chiangrai:"Kaewkan Sor Mae Sai",nan:"Namphueng Luk Muang Nan",uttaradit:"Thongdee Sit Dap Hak",lampang:"Ma Lek Luk Rot Ma",
 udon:"Buadaeng Nong Han",khonkaen:"Maikaew Luk Chonnabot",buriram:"Saifah Phanom Rung",ubon:"Thianthong Rim Khong",
 lopburi:"Jo Thong Sor Phra Prang",suphan:"Maemai Bang Pla Ma",phetchaburi:"Mokaeng Muang Phet",chanthaburi:"Mangkhut Luk Chan",
 chumphon:"Nangnuan Paknam",surat:"Nangrom Don Sak",nakhonsi:"Talung Sor Muang Khon",songkhla:"Samila Luk Songkhla"};
/* v1.91.9: province champions lean to their region's style (Tha Sao elbows and speed · Korat heavy hands · Lopburi craft · Chaiya stance) — a lean, not a rule */
const RG_BSTY={north:{inside:3,footwork:3,counter:1,power:1,pressure:1},isan:{power:4,footwork:2,inside:1,pressure:1,counter:1},
 central:{counter:3,footwork:2,inside:2,power:1,pressure:1},south:{pressure:3,footwork:3,counter:1,power:1,inside:1}};
function rgBeltSty(r,id){const W=RG_BSTY[r],K=Object.keys(W),tot=K.reduce((a,k)=>a+W[k],0);let x=((stableHash(id+"|sty")>>>0)%1000)/1000*tot;for(const k of K){x-=W[k];if(x<0)return k;}return K[0];}
const RG_TRIP_GAP=2; /* v1.91.38 (Man): one trip every 2 weeks (was every week since v1.90.17) */
const RG_LAST_WK=50; /* trips run until week 50; the last two weeks of the year are the holidays */
const RG_CUP_PRIZE=50000;
const RG_TITLE={north:"Northern title series",isan:"Isan title series",central:"Central title series",south:"Southern title series"};
/* v1.90 round 3: each champion's series — perk, letters, lines before/after each bout, the cup ceremony and the private cup night.
   Draft dialogue (dialects to be checked: คำเมือง by Man, อีสาน/ใต้ by native speakers) — the full regional scripts come in rounds 6–9. */
const RG_CH={
 north:{ring:"north",venue:"Lanna Temple Ring, Chiang Mai",pair:"kati",nightBg:"doisuthep",
  perk:{name:"Lotus with Hidden Thorns",desc:"Counters 5% more often · elbows 12% harder",fx:{ctr:.05,dmg:{elbow:.12}}},
  letter:"Dear Manager of Sirichai Camp,\n\nThis is Baibua. I heard your camp has won all four belts of the North. Congratulations.\n\nThe Lanna Temple Ring in Chiang Mai is waiting. The title series is three bouts; whoever wins two first takes the cup. I'd like you to choose one fighter to face me through all three bouts.\n\nPick at Fights › Four Regions Cup\n\nBaibua · Bua Tha Sao Camp",
  again:"Manager,\n\nI'm still waiting in Chiang Mai. Whenever Sirichai Camp is ready, send a fighter again. The same one or a new one, either is fine.\n\nI'll keep training while I wait.\n\nBaibua",
  wait:"It's all right. I can wait. Take care of your fighter first. — Baibua",
  pre:[n=>`${n}… It's an honour to fight you. I won't hold back. Tha Sao elbows never hold back for anyone.`,n=>`I'll counter harder this time. Watch out for the back elbow.`,n=>`Last bout… "Faster than the wind, Tha Sao" — I'll fight up to those words. I carry the whole Bua Tha Sao camp on my back; I can't lose.`],
  sty:["inside","counter","footwork"], /* v1.91.9 (Man): each bout has its own style, hinted in the line before it */
  reply:"Bring it. I came ready.",pairLine:"Tha Sao, same as you… but today I want to be the one who wins.",
  win:["Thank you for fighting me. I'll be waiting for the next bout.","It's not over. I know what I have to fix now.","…"],
  lose:["You're really good. I got careless. See you next bout.","You read my elbows completely… I won't give in easily in the last bout.","…"],
  lost:(G,J)=>[{n:"baibua",f:"happy",l:"fight",t:"The cup stays in Chiang Mai… but I really enjoyed fighting Sirichai Camp."},{n:"baibua",f:"flustered",l:"fight",t:"Whenever you're ready, write and tell me. I'll be waiting."},{n:"nar",t:"Baibua wais everyone before she leaves the ring, then turns back to look at the Manager once more."}],
  cup:(G,J)=>{const me=G.F[G.region.champ.north.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me.name} — the Northern title series ends ${J.w}-${J.l}`},
   {n:"npc",who:"MC",t:`Ladies and gentlemen! The Northern Regional Cup of the Four Regions Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Khun Krerk hands over a golden cup in the middle of the ring. Hundreds of Yi Peng lanterns rise into the sky at once."},
   {n:"baibua",f:"happy",l:"fight",t:"Congratulations… Manager, tonight there's a place I'd like to take you… if you don't mind."},
   {n:"baibua",f:"flustered",l:"fight",t:"There's something I want to tell you… Um, never mind. Later is fine."},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Baibua")}]:[]),
   {n:"coach",t:"The camp's first regional cup… Grandpa Chai must be smiling."}];},
  night:(G,T)=>[
   {n:"nar",t:"At five in the morning Baibua is waiting outside the hotel on an old motorbike. You ride up Doi Suthep while the sky is still dark."},
   {n:"baibua",f:"happy",l:"casual",t:"This is my place. When Dad could still teach, he brought me to watch the mist every New Year."},
   {n:"nar",t:"A cold wind rises from the valley. Baibua unfolds a small teen-chok cloth and shares half of it over the Manager's shoulders."},
   {n:"baibua",f:"sad",l:"casual",t:"Dad hurt his knee and stopped teaching two years ago. Vector came to buy the camp. They said they'd pay for all his treatment."},
   {n:"baibua",f:"sad",l:"casual",t:"I haven't answered anyone… I don't dare tell Dad either. I'm scared he'll be hurt that his daughter can't carry the camp."},
   {n:"nar",t:"Baibua falls silent. Down in the valley, the lights of Chiang Mai go out one by one.",choice:[
     {t:"\"A small camp can stand on its own. Let ours be the example\"",fx:G2=>{rgMeet(G2,"baibua",3);},then:[{n:"baibua",f:"happy",l:"casual",t:"…That's Sirichai Camp. Everyone helps each other. I'm a little jealous."}]},
     {t:"\"You don't have to carry it alone\"",fx:G2=>{rgMeet(G2,"baibua",4);},then:[{n:"baibua",f:"flustered",l:"casual",t:"…When you say that, I don't know where to put my face."}]}]},
   {n:"nar",t:"The sun rises above the sea of mist. Baibua murmurs something very softly."},
   {n:"baibua",f:"flustered",l:"casual",t:"…Ai."},
   {n:"baibua",f:"flustered",l:"casual",t:"Eh! No, I didn't say anything! Let's go down, everyone will wake up and look for us."},
   {n:"nar",t:"On the way down the mountain, Baibua rides almost twice as slowly as on the way up."}]},
 isan:{ring:"northeast",venue:"Phimai Stone Castle Ring, Nakhon Ratchasima",pair:"ploy",nightBg:"mekong",
  perk:{name:"Range-Keeping Kicks",desc:"Kicks 4% more accurate · dodges 1% better",fx:{hit:{kick:.04},evade:.01}},
  letter:"To the Manager of Sirichai Camp\n\nAwesome! All four Isan belts, done! Tabtim's been watching since the first province.\n\nCome fight for the cup at the Phimai Stone Castle Ring in Korat. Three bouts, whoever wins two first takes the cup. Send one fighter to finish all of it, okay? No swapping.\n\nPick at Fights › Four Regions Cup\n\nTabtim · Mat Nak Phimai Camp (but I kick, haha)",
  again:"Manager!\n\nThe cup's still in Korat, okay? Tabtim isn't going anywhere. When you're ready, send a fighter again, old or new, either's fine.\n\nDon't be shy. Come on!\n\nTabtim",
  wait:"No worries, okay? Tabtim can wait. Whoever's hurt, rest first. — Tabtim",
  pre:[n=>`${n}! Come on! Tabtim's been waiting ages. Nobody's ever seen a Korat kicker before, haha!`,n=>`Tabtim's for real this time. Watch out for the leaping kick, okay?`,n=>`Last bout… Dad has never once come to watch me fight. Today I'm using our family's heavy Korat fists — so he sees I'm a Mat Nak too.`],
  sty:["footwork","footwork","power"],
  reply:"I'm not giving in either.",pairLine:"Whether a Korat punch is still the real thing after years away from home — see for yourself.",
  win:["Haha, awesome! But Tabtim takes the first one!","Just one more, okay? Tabtim's keeping the cup in Korat.","…"],
  lose:["Ow, that hurt a lot! You're really good. Tabtim'll get it back next time.","Haha… not funny any more. See you in the last bout.","…"],
  lost:(G,J)=>[{n:"tabtim",f:"happy",l:"fight",t:"Haha, the cup's still in Korat! But Sirichai Camp is fierce. Tabtim hurts all over."},{n:"tabtim",f:"flustered",l:"fight",t:"Come again, okay? Tabtim'll wait… Not missing you or anything. Just want to fight again."},{n:"nar",t:"Tabtim waves so loudly the MC has to move the mic away."}],
  cup:(G,J)=>{const me=G.F[G.region.champ.isan.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me.name} — the Isan title series ends ${J.w}-${J.l}`},
   {n:"npc",who:"MC",t:`Ladies and gentlemen! The Isan Regional Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Tabtim runs over and hugs the Manager in the middle of the ring in front of everyone, so tight that Khun Krerk has to stand there holding the cup."},
   {n:"tabtim",f:"happy",l:"fight",t:"A loss is a loss! But I'm taking a hug back, okay? Haha… just a bit longer."},
   {n:"nar",t:"At the back, a dark-skinned middle-aged man stands still behind the crowd, nods once to Tabtim, then walks out."},
   {n:"tabtim",f:"flustered",l:"fight",t:"…Dad? Dad came to watch…"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Tabtim")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"That night the rocket festival along the Mun River is still going. Tabtim leads the manager away from the crowds down to the landing."},
   {n:"tabtim",f:"happy",l:"casual",t:"Tabtim's sat here since she was tiny, watching the rockets go up, thinking one day she'd kick that high."},
   {n:"nar",t:"The last rocket shoots into the sky. For the first time since you met, Tabtim goes quiet."},
   {n:"tabtim",f:"sad",l:"casual",t:"Tabtim pays for her three little siblings' school, you know… But Dad never accepted that kicking can be Korat boxing."},
   {n:"tabtim",f:"sad",l:"casual",t:"Dad came to watch today… Tabtim lost in front of him, but it's the first time he ever nodded.",choice:[
     {t:"\"Your father saw it. Your kicks are real Korat boxing\"",fx:G2=>{rgMeet(G2,"tabtim",4);},then:[{n:"tabtim",f:"flustered",l:"casual",t:"…Don't say nice things like that. Tabtim's gonna cry, okay?"}]},
     {t:"\"You already kick higher than the rockets\"",fx:G2=>{rgMeet(G2,"tabtim",3);},then:[{n:"tabtim",f:"happy",l:"casual",t:"Haha, silly! …But thanks, okay."}]}]},
   {n:"nar",t:"Tabtim leans her head on the Manager's shoulder in silence until the rocket smoke fades from the sky."},
   {n:"tabtim",f:"flustered",l:"casual",t:"…Don't tell anyone Tabtim can be quiet, okay? It'd ruin my name."}]},
 central:{ring:"central",venue:"Riverside Ring, Ayutthaya",pair:"rin",nightBg:"boat",
  perk:{name:"Princess Punch",desc:"Punches 12% harder · stronger clinch defence",fx:{dmg:{punch:.12},clDef:1}},
  letter:"Dear Manager of Sirichai Camp,\n\nAll four central belts, congratulations. I watched every fight live. …Not on purpose. It was in my feed.\n\nThe title series is at the Riverside Ring in Ayutthaya, best of three. Send one fighter for the whole series, please. I don't like switching co-stars mid-story.\n\nPick at Fights › Four Regions Cup\n\nAlicia · Hanuman Lopburi Camp",
  again:"Manager,\n\nThe cup's still with me. But our fight clips are still climbing. People want a rematch.\n\nSend a fighter whenever you're ready. I can wait. …Not because of you.\n\nAlicia",
  wait:"It's fine. A fighter's health matters more than content. — Alicia",
  pre:[n=>`${n}, right? Nice to meet you. The cameras are on, so fight like everyone's watching.`,n=>`No show this time. I'll let you come in first, then answer with the punch I drilled just for you.`,n=>`The decider… I'll come right in and fight you up close. And for the record, I'm not famous for my face.`],
  sty:["footwork","counter","inside"],
  reply:"I'm here to fight, not to be on camera.",pairLine:"I've read all your punch stats. Every percentage.",
  win:["Thank you. This clip's views will explode… but don't give up next time.","One more and the cup stays in Lopburi.","…"],
  lose:["…Okay, I admit it. You're good. But don't get the wrong idea, I'm not done.","I won't delete this clip. I'll keep it to see where I slipped. See you in the last bout.","…"],
  lost:(G,J)=>[{n:"alicia",f:"happy",l:"fight",t:"The cup is still mine. Thanks for making tonight the best content of the year."},{n:"alicia",f:"flustered",l:"fight",t:"…No, wait. It's not about content. I really want to fight your camp again."},{n:"nar",t:"Alicia switches off her camera before she leaves the ring. The first time all night."}],
  cup:(G,J)=>{const me=G.F[G.region.champ.central.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me.name} — the Central title series ends ${J.w}-${J.l}`},
   {n:"npc",who:"MC",t:`Ladies and gentlemen! The Central Regional Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Camera flashes swarm in. Khun Krerk smiles for the cameras as he hands over the cup. Alicia pushes past the photographers and stops right in front of the Manager."},
   {n:"alicia",f:"happy",l:"fight",t:"Congratulations… And also, I haven't signed with anyone yet."},
   {n:"alicia",f:"flustered",l:"fight",t:"…Understand? You don't have to answer now."},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Alicia")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"That evening Alicia has rented a small boat. No crew, no photographers."},
   {n:"alicia",f:"happy",l:"casual",t:"One loop around the island. Nobody filming, nobody streaming. …I booked it after the first bout, in case I lost and needed somewhere to cry."},
   {n:"nar",t:"The boat passes Wat Chaiwatthanaram, lit in gold. Alicia takes out her phone and deletes the live app right in front of the Manager."},
   {n:"alicia",f:"sad",l:"casual",t:"Tonight isn't content. …Everyone thinks I'm famous for my looks. The sponsors think so too. Naga League sent me their contract first."},
   {n:"alicia",f:"sad",l:"casual",t:"I almost signed, you know. If I hadn't met a camp that could beat me without a single camera.",choice:[
     {t:"\"You won with your fists, not your face\"",fx:G2=>{rgMeet(G2,"alicia",3);},then:[{n:"alicia",f:"happy",l:"casual",t:"…Can you say that again? I wasn't recording."}]},
     {t:"\"No cameras tonight. Then just be Alicia\"",fx:G2=>{rgMeet(G2,"alicia",4);},then:[{n:"alicia",f:"flustered",l:"casual",t:"…That's exactly what scares me most. But okay. For tonight."}]}]},
   {n:"nar",t:"Fireflies circle the bow. Alicia doesn't say another word until the boat docks."},
   {n:"alicia",f:"flustered",l:"casual",t:"Don't get the wrong idea. I'm reinstalling the app tomorrow morning. …Maybe late morning."}]},
 south:{ring:"south",venue:"Old Town Ring, Phuket",pair:"mali",nightBg:"andaman",
  perk:{name:"Storm Over the Waves",desc:"Dodges 2% better · recovers stamina between rounds 12% faster",fx:{evade:.02,regen:.12}},
  letter:"To the Manager of Sirichai Camp\n\nAll four southern belts. Done.\n\nCome to Phuket. Three bouts, win two, take the cup. Send one fighter.\n\nPick at Fights › Four Regions Cup\n\nChaba\n\nP.S. Tell Mali that… nothing.",
  again:"Manager\n\nThe cup is still in Phuket.\n\nCome when you're ready.\n\nChaba",
  wait:"I can wait. — Chaba",
  pre:[n=>`…${n}. You come first.`,n=>`No dodging this time.`,n=>`Last bout. I'll show you "Chaiya's fine stance". Nobody backs down.`],
  sty:["counter","pressure","footwork"],
  reply:"…Not backing down either.",pairLine:"Big sis Chaba… This time Mali won't cry.",
  win:["…Tasty.","One more.","…"],
  lose:["…Good.","…Last one.","…"],
  lost:(G,J)=>[{n:"chaba",f:"happy",l:"fight",t:"…Cup stays here."},{n:"chaba",f:"flustered",l:"fight",t:"Come again. …I want you to."},{n:"nar",t:"That's all Chaba says before she walks out of the ring. Everyone at camp looks at each other."}],
  cup:(G,J)=>{const me=G.F[G.region.champ.south.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me.name} — the Southern title series ends ${J.w}-${J.l}`},
   {n:"npc",who:"MC",t:`Ladies and gentlemen! The Southern Regional Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Beside the ring, a young man in a wheelchair claps slowly. Chaba goes to him first, then comes back to the Manager."},
   {n:"nar",t:"Chaba grips the Manager's hand hard, says nothing, and just walks off without letting go, so you have to follow three steps."},
   {n:"chaba",f:"flustered",l:"fight",t:"…My brother. Wants to meet you."},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Chaba")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"That night Chaba takes the Manager on her sidecar motorbike to a beach with no tourists. The moon is just full."},
   {n:"chaba",f:"happy",l:"casual",t:"…Here. When I was small, my brother brought me to run in the sand."},
   {n:"chaba",f:"sad",l:"casual",t:"The boat capsized. My brother's leg was hurt, he couldn't fight any more. So I fight instead. Then Naga used his story in an ad. Never asked once."},
   {n:"nar",t:"Chaba throws a seashell far out to sea. A wave washes it back to both their feet.",choice:[
     {t:"\"Your brother must be really proud of you\"",fx:G2=>{rgMeet(G2,"chaba",3);},then:[{n:"chaba",f:"happy",l:"casual",t:"…That's what he says too."}]},
     {t:"Sit down beside her, quietly",fx:G2=>{rgMeet(G2,"chaba",4);},then:[{n:"nar",t:"Chaba sits down too. Their shoulders touch a little. Neither moves away."}]}]},
   {n:"chaba",f:"flustered",l:"casual",t:"…Can you stay one more day? …Yeah?"},
   {n:"nar",t:"Chaba turns to face the sea the moment she finishes, but her ears are red enough to see in the moonlight."}]}};
/* the camp girl closest to you (bond 40+) — she reacts when a champion gets near */
function rgTopGirl(G){const L=CANON_IDS.map(id=>G.F[id]).filter(f=>f&&f.camp==="player"&&(f.bond||0)>=40).sort((a,b)=>(b.bond||0)-(a.bond||0));return L[0]||null;}
function rgJeal(id,champ){const L={kati:`Coach… ${champ} was standing a little close, wasn't she? I'm only noticing.`,mali:`Mali wants a hug too~ …Just kidding. (Not kidding.)`,
  rin:`The distance between the Manager and ${champ} just now was below the average for the whole night. Just data.`,ploy:`What's with the smiling… Nothing. I didn't say anything.`,fah:`Hey, ${champ}! The manager belongs to Sirichai Camp! …I mean, he's the camp's manager!`};return L[id]||"…";}
function rgMeet(G,cid,v){const R=G.region,m=R.meet;m[cid]=(m[cid]||0)+v;if(v>0&&R.joined&&R.joined[cid]&&G.F[cid])add(G,cid,"bond",v);rgTouch(G,cid);(R.meetPk=R.meetPk||{})[cid]=Math.max(R.meetPk[cid]||0,m[cid]);}
/* v1.90: any real contact with a champion (a trip to her region, a bout, a visit, a duel, a night out) resets her "haven't seen you" clock */
function rgTouch(G,cid){const R=G.region;if(!R)return;(R.meetT=R.meetT||{})[cid]=gameWeek(G);if(R.miss)delete R.miss[cid];}
/* three weeks apart: she writes · four or more: the bond fades a little each week (outside-camp rate), never below the level she reached */
const RG_MISS={
 north:"Dear Manager,\n\nIt's getting cold in Chiang Mai, with mist every morning… I don't have any news, really. I just miss Sirichai Camp a little.\n\nWe live in the same city, after all. Drop by my camp when you're free.\n— Baibua",
 isan:"Manager!\n\nWhere did you disappear to? Tabtim watches your camp's lives every day, but you're never on camera.\n\nMiss you! (Miss the camp, I mean, not you, haha)\n— Tabtim",
 central:"Hi,\n\nYour camp's clip views dropped a little. I checked for you. Not on purpose, it just came up.\n\nIf anything's going on… you could tell me sometimes.\n— Alicia",
 south:"…The waves are rough lately.\n\nNothing else.\n\n— Chaba"};
const RG_FLOOR=[20,10,5,0];
/* scenes and fights for the champions */
if(typeof BGIMG!=="undefined"){for(const d of Object.keys(RG_OPP))BGIMG["rgring_"+d]=d==="chanthaburi"?"bg_region_east.webp":`bg_ring_${d}.webp`; /* v1.91.14: the belt ceremony stays in the province's own ring */
Object.assign(BGIMG,{rg_north:"bg_region_north.webp",rg_northeast:"bg_region_northeast.webp",rg_central:"bg_region_central.webp",rg_south:"bg_region_south.webp",rg_east:"bg_region_east.webp",
  doisuthep:"bg_doisuthep.webp",mekong:"bg_mekong.webp",boat:"bg_boat.webp",andaman:"bg_andaman.webp",
  night_north:"bg_night_north.webp",night_isan:"bg_night_isan.webp",night_central:"bg_night_central.webp",night_south:"bg_night_south.webp",
  gala:"bg_gala_ballroom.webp",hotel_room:"bg_hotel_room.webp",gas_station:"bg_gas_station.webp",camp_buatasao:"bg_camp_buatasao.webp",tasao_shrine:"bg_tasao_shrine.webp",
  camp_phimai:"bg_camp_phimai.webp",somtam_stall:"bg_somtam_stall.webp",bus_terminal:"bg_bus_terminal.webp",mali_home:"bg_mali_home.webp",pier_south:"bg_pier_south.webp",
  camp_andaman:"bg_camp_andaman.webp",camp_hanuman:"bg_camp_hanuman.webp",lopburi_monkeys:"bg_lopburi_monkeys.webp",krerk_dinner:"bg_krerk_dinner.webp",
  closing_ceremony:"bg_closing_ceremony.webp",naka_underground:"bg_naka_underground.webp",naka_lab:"bg_naka_lab.webp"});}
if(typeof SPECIALS!=="undefined")Object.assign(SPECIALS,{
  /* v1.91.43 (Man): a champion's move fires like a heroine's — her weapon landing clean or a big hit when she's hurt — as a rival and in your camp, same art and effects */
  baibua:[{img:"baibua_special",w:"elbow",def:"Blooming Lotus Back Elbow",when:(e,hp)=>(e.ev==="hit"||e.ev==="counter")&&e.w==="elbow"&&(e.crit||e.ev==="counter"||hp<45),npc:1,p:.7}],
  tabtim:[{img:"tabtim_special",w:"kick",def:"Ruby Leaping Kick",when:(e,hp)=>e.ev==="hit"&&e.w==="kick"&&(e.crit||hp<45),npc:1,p:.7}],
  alicia:[{img:"alicia_special",w:"punch",def:"Princess Uppercut",when:(e,hp)=>(e.ev==="hit"||e.ev==="counter")&&e.w==="punch"&&(e.crit||hp<45),npc:1,p:.7}],
  chaba:[{img:"chaba_special",w:"punch",def:"Storm Fist That Calms the Waves",when:(e,hp)=>e.ev==="hit"&&e.w==="punch"&&(e.crit||hp<50),npc:1,p:.6}]});
/* v1.91.43 (Man): every champion has her own hot-form title once she fights for Sirichai */
if(typeof HOT_TITLES!=="undefined")Object.assign(HOT_TITLES,{
  baibua:{name:"Lotus in the Storm",desc:"counters more often, slightly better evasion",ctr:.06,ev:.012},
  tabtim:{name:"Isan Fire Ruby",desc:"heavier strikes, more starting HP",dmg:.07,hp:8},
  alicia:{name:"Princess on the Throne",desc:"more accurate, slightly heavier strikes",prep:.02,dmg:.05},
  chaba:{name:"The Storm Never Stops",desc:"better evasion, counters slightly more often",ev:.025,ctr:.03}});


/* ---------- round 4: the champion visits the camp between bout 1 and bout 2 — a minigame duel, best of 3 ---------- */
const DUEL_CFG={
 north:{game:"bag",dk:"hard",bars:5,partner:"kati",label:"Kicking the bag to the drum (hard)",target:[.74,.78,.82],unit:"Accuracy"},
 isan:{game:"somtam",dk:"normal",bars:5,partner:"ploy",label:"Pounding som tam",target:[.76,.8,.84],unit:"Accuracy"},
 central:{game:"live",partner:"rin",label:"30-second live sale",target:[9.7,11.75,13.8],unit:"Sales"},
 south:{game:"run",partner:"mali",label:"100 m sprint",pace:[6.5,6.9,7.3],unit:"Time"}};
const DUEL_TALK={
 north:{intro:"Play the drum for me… I can kick to every single beat.",rw:"Amazing… you picked a really good fighter, Manager.",rl:"Sorry, I got a little too serious.",
  win:"I lost… but that was the most fun I've had since I started fighting.",lose:"I win… Come back for a rematch, I'll be waiting."},
 isan:{intro:"A som tam contest against an Isan girl? Awesome! Tabtim won't lose at this one, okay?",rw:"Hey! How is your som tam tastier than Tabtim's!",rl:"Haha, som tam is Tabtim's home turf, okay?",
  win:"Ha ha ha, Tabtim lost to Sirichai Camp at som tam! Don't tell my mom… Can I get a consolation prize?",lose:"Tabtim wins! Tonight Tabtim makes som tam for the whole camp."},
 central:{intro:"Live-stream battle? Thirty seconds each, whoever sells more wins. …I won't go easy on you.",rw:"…How did I lose on sales to a small camp?",rl:"That's what a professional looks like.",
  win:"Okay, I admit it. Your camp really knows its audience. …Don't get the wrong idea, that wasn't praise.",lose:"I won, but your live was more fun to watch than I expected."},
 south:{intro:"…Running. Hundred metres.",rw:"…Fast.",rl:"…",
  win:"…Lost. …Tasty.",lose:"…Not enough yet, Mali."}};
const RG_VISIT={
 north:G=>[{n:"nar",t:"Baibua arrives early with a basket of khao tom mat for the whole camp."},{n:"baibua",f:"happy",l:"casual",t:"I came to see what the camp that beat me in bout 1 is like… Everyone here helps each other."},
  ...(G.F.kati&&G.F.kati.camp==="player"?[{n:"kati",f:"happy",l:"train",with:"baibua",t:"Tha Sao, same as me. Want to train together?"},{n:"nar",t:"All morning Kati and Baibua drill elbows together, one countering, one slipping, until Kru Daeng has to shout for a break."}]:[]),
  {n:"nar",t:"At noon Baibua sits and watches the whole camp carry the rice pot, wash gloves and hang hand wraps out to dry, and goes quiet for a long time."},
  {n:"baibua",f:"sad",l:"casual",t:"…At my camp, I do all of this by myself, jao."},{n:"baibua",f:"flustered",l:"casual",t:DUEL_TALK.north.intro}],
 isan:G=>[{n:"nar",t:"You hear the motorbike from the end of the lane. Tabtim waves before she's even stopped."},{n:"tabtim",f:"happy",l:"casual",t:"Visiting, okay! This is the camp that kicked Tabtim dizzy in bout 1, haha"},
  ...(G.F.ploy&&G.F.ploy.camp==="player"?[{n:"ploy",f:"pout",l:"casual",with:"tabtim",t:"Why so early… I'm not telling you to leave."},
   {n:"nar",t:"Tabtim challenges Ploy to a hundred punches each on the bag, loses by seventeen and laughs so loud the whole camp hears."}]:[]),
  {n:"nar",t:"Over lunch Tabtim tells joke after joke, until one thing slips out before she can stop it."},
  {n:"tabtim",f:"sad",l:"casual",t:"…Nobody from home has ever come to watch Tabtim fight. Not once, haha… Hey, why's everyone gone quiet?"},{n:"tabtim",f:"happy",l:"casual",t:DUEL_TALK.isan.intro}],
 central:G=>[{n:"nar",t:"A white van stops outside the camp. Alicia steps out alone in sunglasses and a cap."},{n:"alicia",f:"happy",l:"casual",t:"The sponsor's team has followed me with cameras all week. Let me hide here for a day. …Not to see anyone in particular."},
  ...(G.F.rin&&G.F.rin.camp==="player"?[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"Views on the bout 1 clip are up 340%. I have a graph."}]:[]),
  {n:"nar",t:"Alicia says she came to film \"A Day in a Small Camp\" but never turns the camera on once all day. She just sits folding hand wraps with everyone until evening."},
  {n:"alicia",f:"sad",l:"casual",t:"…Nobody here asks me to smile. It's strange."},{n:"alicia",f:"flustered",l:"casual",t:DUEL_TALK.central.intro}],
 south:G=>[{n:"nar",t:"Chaba arrives without telling anyone and has fixed half the back fence before anyone notices."},{n:"chaba",f:"happy",l:"casual",t:"…Fence wobbles"},
  ...(G.F.mali&&G.F.mali.camp==="player"?[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"Big sis Chaba! Why didn't you tell Mali you were coming~ Mali would've made snacks"}]:[]),
  {n:"nar",t:(G.pets||[]).length?"At lunch everyone sees Chaba quietly stroking the camp's pet until it falls asleep in her lap. She doesn't move her legs for half an hour.":"At lunch everyone catches Chaba sneaking rice to the sparrows outside the camp, then quickly putting on a blank face when she realises she's been seen."},
  {n:"chaba",f:"flustered",l:"casual",t:"…Don't like it. It just came to me."},{n:"chaba",f:"flustered",l:"casual",t:DUEL_TALK.south.intro}]};
const DUEL={st:null,
  el(){return document.getElementById("minibag");},
  open(r,practice,after){const C=DUEL_CFG[r],F=bagFighters(G).filter(f=>C.game!=="live"||f.canon);if(!F.length){toast("Nobody is fit to duel");after&&after(null);return;}
    const pick=F.find(f=>f.id===C.partner)||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={r,cid:REGION.champId[r],id:pick.id,round:1,w:0,l:0,log:[],practice:!!practice,phase:"intro",after};
    BAG.st={phase:"duel",mode:C.game,id:pick.id,dk:C.dk||"normal",practice:true};BAG.mount();this.draw();},
  abort(){const S=this.st;this.st=null;if(S&&S.after&&S.phase!=="end")setTimeout(()=>S.after(null),0);},
  act(a,v){const S=this.st;if(!S)return;if(a==="pick"){S.id=v;this.draw();}else if(a==="go")this.startRound();else if(a==="next")this.next();
    else if(a==="end"){const after=S.after,res={w:S.w,l:S.l};this.st=null;BAG.close();after&&after(res);}},
  target(){const S=this.st,C=DUEL_CFG[S.r],i=S.round-1;return C.target?C.target[i]:null;},
  startRound(){const S=this.st,C=DUEL_CFG[S.r],cid=S.cid;
    if(C.game==="bag"||C.game==="somtam"){BAG.st={phase:"pick",mode:C.game,id:S.id,dk:C.dk,practice:true,duel:{bars:C.bars}};BAG.start();}
    else if(C.game==="live"){BAG.st={phase:"live",mode:"live",id:S.id,practice:true};LIVE.st={phase:"pick",host:S.id,item:"shirt",practice:true,duel:true};LIVE.start();}
    else if(C.game==="run"){BAG.st={phase:"run",mode:"run",practice:true};RUN.pick({id:S.id,duel:{opp:{id:cid,name:RG[S.r].champ,pace:C.pace[S.round-1]},label:`Round ${S.round}/3`}});RUN.set();}},
  /* one round finished: res.win (sprint) or res.score against the champion's mark */
  done(res,X){const S=this.st;if(!S)return;const C=DUEL_CFG[S.r],tg=this.target();
    const win=res.win!=null?res.win:res.score>=tg;S.log.push({win,score:res.score,tg});if(win)S.w++;else S.l++;
    if(LIVE.st&&LIVE.st.duel){LIVE.st=null;}
    if(C.game!=="run"){BAG.st={phase:"duel",mode:C.game,id:S.id,practice:true};S.phase="round";this.draw();}},
  next(){const S=this.st;if(!S)return;if(RUN.st){RUN.stop();RUN.st=null;}BAG.st={phase:"duel",mode:DUEL_CFG[S.r].game,id:S.id,practice:true};
    if(S.phase==="round"||DUEL_CFG[S.r].game==="run"){if(S.w>=2||S.l>=2){this.finish();return;}S.round++;S.phase="intro";this.draw();return;}this.draw();},
  finish(){const S=this.st,cid=S.cid,won=S.w>=2;S.phase="end";const out=[];
    if(!S.practice){rgMeet(G,cid,won?4:2);const du=won?5:2;G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
      const f=G.F[S.id];if(f){f.morale=Math.min(100,(f.morale||0)+(won?5:2));out.push(`${esc(f.name)} morale +${won?5:2}`);}
      if(won){G.region.duelWon=G.region.duelWon||{};G.region.duelWon[cid]=(G.region.duelWon[cid]||0)+1;}}
    S.out=out;save();this.draw();AU.sfx&&AU.sfx(won?"level":"ui");},
  dots(){const S=this.st;return `<div class="duel-dots">${[0,1,2].map(i=>{const L=S.log[i];return L?(L.win?"🟢":"🔴"):"⚪";}).join("")}</div>`;},
  fmt(v){const C=DUEL_CFG[this.st.r];return C.game==="live"?Math.floor(v)+" sold":C.game==="run"?v.toFixed(2)+" s":Math.round(v*100)+"%";},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const C=DUEL_CFG[S.r],T=DUEL_TALK[S.r],champ=RG[S.r].champ,me=G.F[S.id];
    const vs=`<div class="duel-vs"><div><img src="${faceSrc(S.id,"happy")}" alt=""><br><b>${esc(me.name)}</b></div><b class="goldt">${S.w} : ${S.l}</b><div><img src="${faceSrc(S.cid,"happy")}" alt=""><br><b>${esc(champ)}</b></div></div>`;
    if(S.phase==="intro"){const F=bagFighters(G).filter(f=>C.game!=="live"||f.canon),tg=this.target();
      el.innerHTML=`<div class="mbox px"><h2>Duel with ${esc(champ)} · ${esc(C.label)}</h2>${this.dots()}${vs}
       <p class="meta center">Round ${S.round} of 3 · first to 2 rounds wins the duel ${tg!=null?` · ${esc(champ)} scored ${this.fmt(tg)} (${C.unit})`:""}</p>
       ${S.round===1?`<b class="meta">Who duels</b><div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.id?"on":""}" data-du="pick" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>`:""}
       ${S.practice?`<p class="meta center">Practice duel · no rewards</p>`:""}
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">Give up</button><button class="btn primary" data-du="go">Start round ${S.round} ▸</button></div></div>`;return;}
    if(S.phase==="round"){const L=S.log[S.log.length-1];
      el.innerHTML=`<div class="mbox px"><h2>${L.win?"Round won!":"Round lost"}</h2>${this.dots()}${vs}
       <p class="center">${esc(me.name)} <b>${this.fmt(L.score)}</b> · ${esc(champ)} <b>${this.fmt(L.tg)}</b></p>
       <p class="center"><i>${esc(champ)}: "${esc(L.win?T.rw:T.rl)}"</i></p>
       <div class="mfoot roadbtns"><button class="btn primary" data-du="next">Next ▸</button></div></div>`;return;}
    if(S.phase==="end"){const won=S.w>=2;
      el.innerHTML=`<div class="mbox px"><h2>${won?`Duel won ${S.w}-${S.l}!`:`${esc(champ)} wins ${S.l}-${S.w}`}</h2>${this.dots()}${vs}
       <p class="center"><i>${esc(champ)}: "${esc(won?T.win:T.lose)}"</i></p>${S.out&&S.out.length?`<p class="center"><span class="rwl">${S.out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span></p>`:""}
       <div class="mfoot roadbtns"><button class="btn primary" data-du="end">Back to camp</button></div></div>`;}}};

/* v1.90 round 5: the opening gala (the week after the invitation) and the story beat after the first cup — the green-gold contract */
const RG_CID={north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"};
const RG_CID0={...RG_CID}; /* v1.91.30: the four first champions — fixed, even when a later edition crowns someone new */
const rgIn=(G,id)=>!!(G.F[id]&&G.F[id].camp==="player");
const rgIf=(ok,steps)=>ok?steps:[];
function rgGala(G){const top=rgTopGirl(G),fah=rgIn(G,"fah"),ploy=rgIn(G,"ploy"),R=G.region,meet=(id,v)=>G2=>rgMeet(G2,id,v);return [
 {n:"nar",bg:"gala",t:"The camp's van pulls up in front of a hotel in the middle of Bangkok. A Naga Energy Drink banner three storeys high hangs above, a green-gold naga coiled at the centre, head raised high."},
 {n:"nar",t:"A life-size naga mascot waves at the door. Every time a guest walks past, it throws two punches at the air."},
 {n:"coach",t:"The last time I wore a suit was my nephew's ordination… This collar's strangling me."},
 ...rgIf(fah,[{n:"fah",f:"flustered",l:"casual",t:"You said it was a party! Why is everyone dressed for a wedding? Fah came in a tracksuit!"}]),
 ...rgIf(fah&&rgIn(G,"kati"),[{n:"kati",f:"happy",l:"casual",t:"I told you the invitation said \"smart dress\"… and Fah said \"tracksuits are smart\"."}]),
 {n:"nar",show:[],t:"The ballroom lights dim. A long drum roll starts, and the MC walks out to centre stage."},
 {n:"npc",who:"MC",t:"Welcome, everyone, to the Four Regions Cup, the first in Thailand! Please welcome the chairman of Naga Energy Drink, once the nation's Olympic medal hope… Khun Krerk!"},
 {n:"nar",show:[{id:"npc:krerk"}],t:"A man in a dark green suit embroidered with a golden naga walks on stage, smiling wide, and gently raises a hand to quiet the applause."},
 {n:"npc",who:"Khun Krerk",t:"The Olympics was a long time ago. Today belongs to the young fighters, not to an old man who can't fight anymore."},
 {n:"npc",who:"Khun Krerk",t:"The rules are simple. Each region has four provinces. Collect all four provincial champion belts and you earn the right to challenge the regional champion. Three bouts, win two, take the cup."},
 {n:"npc",who:"Khun Krerk",t:"Camps pay their own way while collecting belts. For the cup bouts, Naga Energy covers everything… Drink Naga, never run out of gas!"},
 {n:"nar",show:[],t:"Laughter fills the room. Four spotlights fall on the stage, and the MC reads out the regional champions one by one."},
 {n:"npc",who:"MC",show:[{id:"baibua",l:"casual"}],t:"The champion of the North, the lotus with hidden thorns of Lanna… Baibua!"},
 {n:"baibua",f:"happy",l:"casual",t:"Hello… I'm Baibua, from Bua Tha Sao Camp in Chiang Mai."},
 {n:"nar",t:"So quiet that the MC has to hold the mic right up close. Baibua smiles sweetly."},
 {n:"baibua",f:"happy",l:"casual",t:"My elbows aren't very strong… it's just that people tend not to get up afterwards."},
 {n:"npc",who:"MC",show:[{id:"tabtim",l:"casual"}],t:"The champion of Isan, Isan's ruby ace… Tabtim!"},
 {n:"tabtim",f:"happy",l:"casual",t:"Hello, everybody! The air-con is freezing, colder than Korat in winter! Hahaha!"},
 {n:"nar",t:"Tabtim laughs so loud the whole room laughs with her, but all the while she's quietly pacing out the width of the ring."},
 {n:"npc",who:"MC",show:[{id:"alicia",l:"casual"}],t:"The champion of the Central Plains, the princess of Muay Thai… Alicia!"},
 {n:"nar",t:"Camera flashes light up the whole room. Alicia smiles at every lens, one by one, without missing a single one."},
 {n:"alicia",f:"happy",l:"casual",t:"Thank you. Thank you, everyone. I'm not here for photos this year. I'm here to win."},
 {n:"npc",who:"MC",show:[{id:"chaba",l:"casual"}],t:"And the champion of the South, the Storm Fist that Calms the Waves… Chaba!"},
 {n:"chaba",f:"happy",l:"casual",t:"…I came to fight, not to talk."},
 {n:"nar",t:"The room goes silent for three seconds, then the MC hurriedly calls for applause."},
 {n:"nar",t:"Once the opening is over, the four champions step down from the stage and head straight for Sirichai's table.",choice:[
   {t:"Greet Baibua first",fx:meet("baibua",1),then:[{n:"baibua",f:"flustered",l:"casual",t:"The real manager of Sirichai Camp… I watch your camp's fight lives every single time."}]},
   {t:"Greet Tabtim first",fx:meet("tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"Manager! Tabtim recognises you! Your camp's lives are so much fun!"}]},
   {t:"Greet Alicia first",fx:meet("alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"Oh, the camp everyone talks about. You look more ordinary than in the clips. …That's a compliment."}]},
   {t:"Greet Chaba first",fx:meet("chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…Chaba."},{n:"nar",t:"Chaba nods once, then stays standing there longer than she needs to."}]}]},
 ...rgIf(rgIn(G,"kati"),[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"You're Kati, aren't you? Tha Sao, same as me… I've heard your name for a long time."},{n:"kati",f:"flustered",l:"casual",t:"I-I've heard of you too, Big sis Baibua! That reverse spinning elbow everyone talks about…"}]),
 ...rgIf(ploy,[{n:"tabtim",with:"ploy",f:"happy",l:"casual",t:"Oh! So this is Ploy of the Korat punch — one of our own who made her name at a Chiang Mai camp. Tabtim wants to take one of those punches!"},{n:"ploy",f:"happy",l:"casual",t:"…If you want to try, get in the ring."}]),
 ...rgIf(rgIn(G,"rin"),[{n:"alicia",with:"rin",f:"happy",l:"casual",t:"You're the one who read a fourteen-page contract before signing, right? That clip got more views than my fight clips."},{n:"rin",f:"happy",l:"casual",t:"Of course I read it. The small print at the end of a contract is usually the most expensive part."}]),
 ...rgIf(rgIn(G,"mali"),[{n:"mali",with:"chaba",f:"surprised",l:"casual",t:"Big sis Chaba!! It's you, isn't it! It's Mali! Little Mali from Chaiya!"},{n:"chaba",f:"happy",l:"casual",t:"…Wrong person."},
   {n:"nar",t:"Chaba turns and walks off, but Mali catches her ears turning red all the way down her neck."},{n:"mali",f:"sad",l:"casual",t:"…It's not the wrong person. Mali remembers."}]),
 ...rgIf(fah,[{n:"fah",f:"pout",l:"casual",t:"Wait! Baibua has Kati, Tabtim has Ploy, Alicia has Rin, Chaba has Mali… and Fah?! Why doesn't Fah get a single style sibling!"},
   {n:"coach",t:"Then give your style a name yourself."}]),
 ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"all four champions")}]:[]),
 {n:"npc",who:"MC",show:[],t:"And one more big announcement! Naga Energy presents a special guest camp that will fight in every region… Vector Camp, Bangkok!"},
 {n:"nar",t:ploy?"Pailin steps on stage in a white suit. Her eyes sweep the room and rest on Ploy a little longer than on anyone else.":"Pailin steps on stage in a white suit. Her eyes sweep the room and stop at Sirichai's table."},
 {n:"pailin",f:"happy",t:"Every camp in this room is already on my tablet. …Enjoy the trip."},
 {n:"nar",show:[{id:"pailin"},{id:"npc:krerk"}],t:"Khun Krerk walks over and shakes Pailin's hand, patting her shoulder twice, like two people who have known each other far longer than anyone here knows."},
 {n:"nar",show:[],t:"The photographer calls every camp up for a group photo in front of the naga banner."},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"In the corner beside Khun Krerk, a woman in a white hood stands perfectly still. A lock of white hair with red tips falls out from under it. No one introduces her."},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"Her knuckles are taped like an MMA fighter's, not wrapped the Muay Thai way."},
 fah?{n:"fah",f:"flustered",l:"casual",t:"…Manager, the one in the hood is staring at Fah. It's giving me goosebumps."}:{n:"coach",t:"The one in the hood over there… stands like she's ready to fight at any second."},
 {n:"nar",show:[],t:"The camera flashes. When the light fades, that corner of the room is empty."},
 {fx:G2=>{for(const r of RG_ORDER)rgTouch(G2,RG_CID[r]);}},{n:"coach",t:"Right, back to training. Sixteen belts don't come from looking sharp in a suit."}];}
/* the week after the first cup: the green-gold contract */
const RG_C1_CALL={
 north:["You got the green envelope too, Manager… Clause fourteen point three. I tripped over it as well.","When Vector came to buy my camp, their contract had a clause just like this. Exactly the same wording."],
 isan:["Manager! Did you get a green envelope too? Tabtim couldn't finish it, but my little brother studies law and he says clause fourteen is weird.","And guess what! Vector sent Tabtim a contract at the start of the year, and it had the exact same clause!"],
 central:["Has the green-gold envelope reached you yet? My manager says sign it, but I've read clause 14.3…","I know that sentence. Vector sent me an offer before the tour, and it uses the same words, letter for letter."],
 south:["…The green envelope came, didn't it.","Vector sent me a contract before the tour. Same clause, same words. …That's no coincidence."]};
function rgCup1(G,r){const cid=RG_CID[r],rin=rgIn(G,"rin"),R=G.region,L=RG_C1_CALL[r];return [
 {n:"nar",bg:"camp",t:"A sealed green-gold envelope arrives at the camp, the naga crest pressed in wax at its centre."},
 {n:"nar",t:"\"Cup Holder Agreement, Four Regions Cup.\" Naga Energy asks every camp that wins a cup to sign for promotional appearances, with a copy of a ฿30,000 appearance cheque attached as a preview."},
 {n:"coach",t:"Thirty thousand just to shoot an ad? Sign it! …Although the print is awfully small."},
 ...(rin?[{n:"rin",f:"happy",l:"casual",t:"Wait. Give me fifteen minutes."},
   {n:"nar",t:"Fifteen minutes turns into an hour. Rin reads all twenty-two pages and leaves seven red marks."},
   {n:"rin",f:"sad",l:"casual",t:"Page 19, clause 14.3: \"All fight data, images and voices of the fighters under contract become the property of the company and its affiliates, with no time limit.\""},
   {n:"rin",f:"sad",l:"casual",t:"No time limit means forever. And it never says who the \"affiliates\" are."},
   {n:"rin",f:"happy",l:"casual",t:"Thirty thousand for every fight of everyone in this camp, for life… per fight, that's cheaper than a coffee."}]
  :[{n:"coach",t:"…Hold on. Page 19, clause 14.3: \"All fight data, images and voices of the fighters under contract become the property of the company and its affiliates, with no time limit.\""},
   {n:"coach",t:"\"No time limit\"… I'm not much of a reader, but I know that means forever."}]),
 {n:"nar",t:`That night the camp phone rings. On the other end: ${RG[r].champ}`},
 {n:cid,f:"sad",l:"casual",t:L[0]},{n:cid,f:"sad",l:"casual",t:L[1]},
 rin?{n:"rin",f:"sad",l:"casual",t:"Vector's contract and the organiser's were drafted by the same person."}:{n:"coach",t:"Vector's contract and the organiser's look exactly alike… I don't like the smell of this."},
 {n:"nar",t:"The green-gold envelope sits on the office desk. What to do with it?",choice:[
   {t:"Send it back with clause 14.3 struck out",fx:()=>{R.c1="edit";},then:[
     rin?{n:"rin",f:"happy",l:"casual",t:"I'll write a note to go with it. Polite, but clear."}:{n:"coach",t:"Hand me the red pen. I'll strike it out myself."},
     {n:"nar",t:"Three days later Naga Energy calls to say thank you. The voice is still smiling, but nobody mentions the cheque again."}]},
   {t:"Keep it for now. We're not signing anything.",fx:()=>{R.c1="hold";},then:[
     {n:"coach",t:"Good. Nothing in this world is free, least of all something handed over with a smile that never stops."}]}]},
 {n:"nar",t:"The green-gold envelope goes into the office drawer, right next to the old Golden Helmet boss's loan contract."}];}
/* v1.90 round 6: the North in full — the first arrival, the Tha Sao shrine at Uttaradit (Kati's story), a richer visit, the letter after the cup and Baibua's chats.
   คำเมือง lines are drafts for Man to check. The other regions follow in rounds 7–9 (same hooks). */
const RG_ARRIVE={
 north:(G,D)=>{const top=rgTopGirl(G),kati=rgIn(G,"kati"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:`The camp's van stops for fuel at the last petrol station before ${D.name}. Mist still hangs low over the mountains.`},
  {n:"nar",t:"An old motorbike is parked in front of the coffee kiosk. A pink-haired girl stands hugging a big rattan basket."},
  {n:"baibua",f:"happy",l:"casual",t:"You're here, jao! I heard Sirichai Camp was coming to collect the northern belts, so I rode out to wait for you."},
  {n:"baibua",f:"happy",l:"casual",t:"Khao tom mat, jao. I wrapped them myself at four this morning. There's enough for everyone."},
  {n:"nar",t:"Everyone gets a khao tom mat, each tied neatly with the same bamboo strip, except the Manager's, which is tied in a little bow.",choice:[
    {t:"Ask why this one has a bow",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"N-no reason, jao! My hands just tied it that way… eat, jao, it's really good."}]},
    {t:"Say it's the prettiest wrap of all",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"You noticed, jao… I put the most care into that one."}]},
    {t:"Say thanks and eat quietly",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",f:"happy",l:"casual",t:"Is it good, jao? …Good. I'm glad."}]}]},
  {n:"baibua",f:"sad",l:"casual",t:"And… sorry about the gala, jao. I spoke too softly. The MC had to hold the mic right up to my mouth."},
  ...rgIf(kati,[{n:"kati",with:"baibua",f:"happy",l:"casual",t:"Don't worry, Big sis Baibua! Everyone in the room heard the elbow part loud and clear."},{n:"baibua",f:"flustered",l:"casual",t:"…That part I said loudly on purpose, jao."}]),
  {n:"baibua",f:"happy",l:"casual",t:`The champion of ${D.name}, I've fought her before, jao. She starts fast, so be careful in round one. By round three she starts to tire.`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name} notes down Baibua's tips on her phone · morale +3`:"Everyone notes down Baibua's tips."},
  ...(top&&top.id!=="kati"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"Baibua")}]:[]),
  {n:"coach",t:"The khao tom mat is better than the shop by the camp… don't tell Auntie Daeng."},
  {n:"nar",t:"Baibua waves the van out of the petrol station, then follows on her motorbike all the way to the arena."}];}};
/* a scene on the first night of a particular trip */
const RG_TRIPX={
 uttaradit:{bg:"tasao_shrine",steps:G=>{const kati=rgIn(G,"kati");return [
  {n:"nar",t:"Before heading back, Baibua takes the whole camp to the Tha Sao teachers' shrine: an old wooden shrine under a bodhi tree, with a worn pair of gloves hanging beside the altar."},
  {n:"baibua",f:"happy",l:"casual",t:"This is where Tha Sao boxing was born, jao. Dad brought me here to pay respects every year, before he hurt his knee."},
  ...(kati?[
   {n:"nar",t:"Kati stands in front of the shrine longer than anyone, then slowly steps back and sits on the stairs."},
   {n:"kati",f:"sad",l:"casual",t:"…I'm not sure I have the right to bow here."},
   {n:"kati",f:"sad",l:"casual",t:"My Tha Sao was learned by watching. Grandpa Chai used to watch Tha Sao masters at temple fights, remembered it all and taught me. Nobody ever formally accepted him as a student."},
   {n:"kati",f:"sad",l:"casual",t:"Baibua's Tha Sao comes straight down the line, from her dad, from her grandpa… and me, I just copied the moves.",choice:[
     {t:"\"Grandpa Chai watched until he knew every move. That's loving Tha Sao boxing.\"",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"sad",l:"casual",t:"…Grandpa really did remember every move. When I was little, I'd see him practising Tha Sao alone behind the camp every evening."}]},
     {t:"\"Why not ask Baibua?\"",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"Ask me, jao."}]}]},
   {n:"baibua",with:"kati",f:"sad",l:"casual",t:"Kati… you know, I'm jealous of you."},
   {n:"kati",f:"surprised",l:"casual",t:"You're jealous of me?!"},
   {n:"baibua",f:"sad",l:"casual",t:"I got my moves from Dad, it's true, but these days I carry the camp alone, train alone, eat with Dad, just the two of us… nobody helps, jao."},
   {n:"baibua",f:"happy",l:"casual",t:"Kati has Kru Daeng, the Manager, the whole camp watching over her. Her Tha Sao didn't come from one teacher. It came from everyone at the camp."},
   {n:"baibua",f:"happy",l:"casual",t:"Boxing doesn't live in your blood, jao. It lives in the people who still fight it… let's pay our respects together."},
   {n:"nar",t:"Kati and Baibua kneel before the shrine together and bow three times. The breeze gently sways the old gloves beside the altar."},
   {n:"kati",with:"baibua",f:"happy",l:"casual",t:"…Big sis Baibua, let's come and pay respects together again next year."},
   {n:"baibua",f:"happy",l:"casual",t:"I promise, jao."},
   {fx:G2=>{add(G2,"kati","bond",2);const k=G2.F.kati;if(k)k.morale=Math.min(100,(k.morale||0)+5);rgMeet(G2,"baibua",2);G2.flags.tasaoShrine=1;}},
   {n:"nar",t:"Kati morale +5 · Kati and Baibua grow closer"}]
  :[{n:"baibua",f:"sad",l:"casual",t:"This year I came alone, jao… thank you for keeping me company."},
   {n:"nar",t:"The Manager raises their hands in a wai to the shrine, following Baibua. The breeze gently sways the old gloves beside the altar.",fx:G2=>rgMeet(G2,"baibua",1)},
   {fx:G2=>rgMeet(G2,"baibua",1)}])];}}};
/* the week after the cup: her answer to Vector, in a letter */
const RG_POST={
 north:"Dear Manager of Sirichai Camp,\n\nI gave Vector my answer: Bua Tha Sao Camp is not for sale.\n\nDad asked where I found the courage. I told him, \"A small camp can stand on its own. Just look at Sirichai.\" He laughed for the first time in two years.\n\nThe cup is with Sirichai Camp now, but the heart of Tha Sao boxing is still here in Chiang Mai. Come up and visit Dad and me when you're free.\n\n— Baibua"};
/* champion chats: open after her first visit to the camp (or the cup); a reply moves her bond a little and counts as contact */
const RG_CHAT={
 baibua:[
  {id:"bb_mist",x:[
   ["The mist is so thick this morning, jao. Are you up yet, Manager?",[["Up already, about to watch the kids train.",1,"So hard-working, jao. I'm about to go train too."],["Not yet. I'm typing this with my eyes closed.",2,"Hehe, eyes closed and every word spelled right. Impressive, jao."],["Drive carefully in fog like this.",2,"…I'll be careful. Thank you for worrying about me."]]],
   ["Dad asked me to ask how long Sirichai Camp has been open, jao.",[["Since Grandpa Chai's day — over forty years.",1,"Oh, Dad says that's older than Bua Tha Sao Camp, jao."],["I'll show you the old photos at the camp sometime.",2,"Really? I'll be waiting!"],["Why do you ask?",0,"Nothing, jao. Dad was just curious."]]],
   ["I have to go train now, jao… let's leave it here for now.",[["Go on, we'll talk after training.",2,"Yes! I'll message you as soon as I'm done."],["Don't overdo it.",1,"Yes, I always stretch first."],["OK",0,""]]]]},
  {id:"bb_dad",x:[
   ["Dad walked around the camp twice today, jao! The doctor says his knee is getting better.",[["That's great news!",1,"Thank you, jao. I was so happy I cried."],["Tell him the whole of Sirichai is cheering for him.",2,"I told him, jao. He smiled and said that camp has a kind heart."],["Don't let him overdo it.",1,"Yes. I walk right beside him the whole time."]]],
   ["Dad wants me to go back to school and stop fighting… what do you think, Manager?",[["Ask your own heart what you want first.",2,"…My heart wants to fight, jao. I already knew. I just wanted to hear someone say it."],["You could study and fight at the same time.",1,"Can I really? …I'll think about it."],["Your dad's right.",0,"…Yes. I'll think about it."]]],
   ["Thank you for listening, jao. I don't have many people to tell this to.",[["You can tell me anything.",2,"…Then I'll tell you things often. No getting annoyed."],["Always",1,"Yes, thank you, jao."],["No problem",0,""]]]]},
  {id:"bb_food",x:[
   ["I made a huge pot of gaeng hung lay, jao. Dad and I can't finish it.",[["Send some to the camp!",2,"Sure! I'll post it… can you post curry, jao?"],["That sounds delicious.",1,"It's so good, jao. My mum's recipe."],["Put it in the fridge.",0,"Yes, I was going to put it in there."]]],
   ["What's your favourite food, Manager?",[["Baibua's khao tom mat.",2,"…If you say that, I'll wrap them for you every week, jao."],["The chicken rice by the market.",1,"The one Kati likes? I'll go try it too."],["Anything",0,"Eating anything is good too, jao."]]],
   ["We both live in Chiang Mai and you've never eaten at my secret khao soi place. I'll take you one day.",[["Promise",2,"Promise! I've never taken anyone there."],["Bring the whole camp.",1,"Sure! But the shop only has two tables, hehe."],["If I'm free",0,"Yes, if you're free."]]]]},
  {id:"bb_elbow",x:[
   ["I practised the reverse spinning lotus elbow a hundred times today, jao. My arm's about to fall off.",[["Great work, but rest a little too.",2,"Yes… if someone tells me to rest, I'll rest, jao."],["Could you teach Kati too?",1,"Sure! But Kati has to teach me her moves too."],["A hundred isn't many.",0,"…You're stricter than my own teacher, jao."]]],
   ["Did you know, Manager? Dad came up with this elbow when he saw a lotus blooming in the temple pond.",[["Beautiful, just like Tha Sao boxing.",2,"Yes… Dad's boxing is truly beautiful. I want the whole country to see it."],["Do lotuses even have thorns?",1,"They don't! Other people started calling me that, I didn't choose it, hehe."],["Lotus flowers are nice.",0,""]]],
   ["If I ever meet Kati in the ring one day, who will you cheer for, jao?",[["Baibua, quietly.",2,"…Don't tell Kati, jao. I'll cheer for you quietly too."],["Both of you.",1,"Good answer, jao… I'd cheer for Kati too."],["Kati, obviously.",0,"Hehe, that's the right answer, jao."]]]]},
  {id:"bb_vector",x:[
   ["Vector wrote again, jao. They've raised their offer for the camp by another two hundred thousand.",[["Don't decide on your own yet.",2,"…Yes. I'll talk to you before I decide anything, every time."],["Bua Tha Sao Camp isn't for sale.",2,"That's exactly what Dad said, jao… I'm glad to hear someone else say it."],["Two hundred thousand is a lot.",0,"…Yes. I know."]]],
   ["Sometimes I think if I sold the camp, Dad could get his knee treated at a good hospital.",[["There are other ways. I'll help you look.",2,"…You're really thinking it through with me. Thank you, jao."],["I know how hard that is.",1,"Yes… thank you for understanding."],["It's one option.",0,""]]],
   ["Talking to you makes my heart feel lighter, jao… I don't know why.",[["Because you're not carrying it alone anymore.",2,"…Yes. I'm not carrying it alone anymore."],["Message me anytime.",1,"Yes! I'll message you often, jao."],["Good",0,""]]]]}]};
if(typeof CHAT!=="undefined")for(const k in RG_CHAT)CHAT[k]=RG_CHAT[k];
/* v1.90 round 7: Isan in full — Tabtim hitches a ride on the first trip, Buriram brings Vector (Vega + Pailin) and Ploy's answer, a richer visit, the letter after the cup and Tabtim's chats. Isan lines are drafts for a native speaker to check. */
RG_ARRIVE.isan=(G,D)=>{const top=rgTopGirl(G),ploy=rgIn(G,"ploy"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:"A straight road runs through the rice fields as far as the eye can see. Ahead, a motorbike sits smoking outside an abandoned petrol station, and a red-haired girl stands in the middle of the road waving with both arms."},
  {n:"tabtim",f:"happy",l:"casual",t:"Stop, stop, stop! Is this Sirichai Camp? It's Tabtim! Tabtim's bike just broke down. Give Tabtim a lift to the ring!"},
  {n:"nar",t:"Before anyone can answer, Tabtim opens the front door and climbs into the passenger seat as if it were hers."},
  {n:"tabtim",f:"happy",l:"casual",t:"Tabtim's sitting in front, car sick… not really car sick, just want to sit near you, haha. Joking, joking. Take Tabtim as your girlfriend. Joking again!",choice:[
    {t:"\"Joking twice means it's not a joke.\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"tabtim",f:"flustered",l:"casual",t:"…Whoa! You answered seriously. Tabtim's out of jokes now."}]},
    {t:"Laugh and keep driving",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"Haha, you're so calm. Tabtim likes calm people."}]},
    {t:"\"Put your seatbelt on.\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"pout",l:"casual",t:"Okay, okay… geez, Manager, you're so serious."}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"Tabtim")}]:[]),
  ...rgIf(ploy,[{n:"tabtim",f:"happy",l:"casual",t:"Eh! Is that Ploy in the back? Ploy of the Korat punch, from our own home turf! Tabtim's been wanting to take one of those since the launch party!"},
    {n:"ploy",f:"pout",l:"casual",t:"…Face the front. You'll hurt your neck."}]),
  {n:"nar",bg:"somtam_stall",t:"Tabtim talks the whole way, then makes them stop at a roadside som tam stall. \"Best in the region, and Tabtim's paying!\""},
  {n:"tabtim",f:"happy",l:"casual",t:`The champion of ${D.name} is from near Tabtim's home. She kicks hard but drops her left guard, so counter with a left kick.`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name} remembers Tabtim's tips · morale +3`:"Everyone remembers Tabtim's tips."},
  {n:"coach",t:"The som tam here is so spicy Kru's crying… but it's really good."},
  {n:"tabtim",f:"happy",l:"casual",t:"Let's go, everyone! Tabtim will cheer by the ring… not saying which side, haha."}];};
RG_TRIPX.buriram={bg:"night_isan",steps:G=>{const ploy=rgIn(G,"ploy");return [
  {n:"nar",t:"Same night, same ring: on the undercard before our bout, a Vector Camp fighter wins by knockout in round two."},
  {n:"npc",who:"Vega",t:"The data said he'd raise his guard late in round two. …Data never lies."},
  ...(ploy?[
   {n:"npc",who:"Ringside gambler",t:"That Korat girl — she's been at a Chiang Mai camp so long. Is her Korat punch still the real thing, or just the name?"},
   {n:"nar",t:"The people around them laugh. Ploy hears every word, but doesn't turn around."},
   {n:"pailin",f:"happy",t:"Ploy, come to Vector with me. Nobody here sees you as Korat boxing. At Vector, you're the best data I've ever had."},
   {n:"npc",who:"Vega",t:"Big sis Ploy… your training room is still empty. Nobody dares use it."},
   {n:"ploy",f:"angry",l:"casual",with:"pailin",t:"Pailin, I'm not answering with words."},
   {n:"nar",t:"Ploy walks to the warm-up corner, picks up a pair of pads and hands them to Tabtim, who's been watching."},
   {n:"ploy",f:"happy",l:"casual",t:"Hold these for me. Hold them tight."},
   {n:"nar",t:"One swinging Korat punch. It's so loud the whole corner turns to look, and Tabtim staggers three steps back."},
   {n:"tabtim",f:"surprised",l:"casual",with:"ploy",t:"Ow! Tabtim's hand is numb up to the elbow… that's the real thing, everyone! The real deal!"},
   {n:"npc",who:"Ringside gambler",t:"…The real thing."},
   {n:"pailin",f:"sad",t:"…My data has never been able to measure that punch."},
   {n:"nar",show:[{id:"pailin"},{id:"ploy",l:"casual",f:"sad"}],t:"Pailin turns and leaves with Vega, but stops to look back at Ploy once more before the door.",choice:[
     {t:"\"That punch is Ploy's own. Nobody else's.\"",fx:G2=>add(G2,"ploy","bond",2),then:[{n:"ploy",f:"flustered",l:"casual",t:"…I knew that without you saying it. But hearing it… thank you."}]},
     {t:"\"Your sister still cares about you.\"",fx:G2=>add(G2,"ploy","bond",1),then:[{n:"ploy",f:"sad",l:"casual",t:"I know… she worries about me the way she worries about a dataset. The day she worries about me like a sister, I'll go back and talk."}]}]},
   {fx:G2=>{const p=G2.F.ploy;if(p)p.morale=Math.min(100,(p.morale||0)+5);rgMeet(G2,"tabtim",1);G2.flags.ployKorat=1;}},
   {n:"nar",t:"Ploy morale +5"}]
  :[{n:"pailin",f:"happy",t:"Sirichai Camp has gone further than my data said it would. …Interesting."},
   {n:"tabtim",f:"happy",l:"casual",t:"Data, data, data. Bangkok people really love their data. Tabtim says som tam is better, haha."},
   {fx:G2=>rgMeet(G2,"tabtim",1)}])];}};
RG_POST.isan="To Manager,\n\nDad came home and didn't say a word for three days.\n\nOn the fourth day he left his old sash by Tabtim's pillow, the one he fought in when he was young. All he said was, \"If you're going to kick, kick all the way.\"\n\nTabtim cried all night. Don't tell anyone.\n\nThe cup is at Sirichai now. Look after it, because Tabtim's coming to take it back one day, haha.\n\n— Tabtim";
RG_CHAT.tabtim=[
 {id:"tt_fee",x:[
  ["Manager! Tabtim's little sister got into university!!",[["Congratulations! You did so well getting her this far.",2,"…Hey, you praised Tabtim instead of her. Now Tabtim's going to cry."],["Shall we celebrate?",1,"Moo kratha for the whole village! You're paying half, haha."],["What's she studying?",1,"Law! Same one who read the green envelope contract."]]],
  ["But tuition is so expensive… Tabtim has to win a lot more fights.",[["Don't carry it alone. Tell me if you need anything.",2,"…You're so kind. Tabtim's not used to it."],["You'll win, your kicks are brutal.",1,"Haha, right! Tabtim's kicks pay tuition."],["There are scholarships too.",1,"Yeah! Tabtim'll go ask her."]]],
  ["Off to train! Ten kicks, each one's worth a textbook, haha.",[["Go for it.",1,"Fighting!"],["Kick one for me too",2,"Sure! The eleventh kick is for you, Manager."],["Don't forget to rest.",1,"Okay, okay. You worry so much."]]]]},
 {id:"tt_somtam",x:[
  ["Tabtim taught the girls at camp to make som tam with twenty chillies. One of them cried, haha.",[["Twenty chillies is brutal!",1,"Harsh? Isan people eat thirty chillies, no big deal."],["Send the camp the recipe.",2,"Sure! But don't tell Auntie Taew. It's Tabtim's secret family recipe."],["Is she okay?",1,"She's fine. Drank three bottles of water and now she's teasing Tabtim back."]]],
  ["Can you eat spicy food, Manager?",[["Easily.",1,"Really? Next time Tabtim'll pound ten chillies for you to try!"],["A little.",1,"No problem, Tabtim will make a mild one. Specially, just for you."],["I can if Tabtim makes it.",2,"…Ugh, Manager! Say that and Tabtim can't pound straight anymore."]]],
  ["Off to sell som tam at the morning market. For my sister's tuition!",[["Sell well!",1,"Sold out!"],["Save me a mortar's worth.",2,"Tabtim saved you one, with extra pla ra!"],["OK",0,"Yeah!"]]]]},
 {id:"tt_live",x:[
  ["Tabtim watches your camp's lives every day. It's so fun. Is Kru Daeng really that scary?",[["Scary face, kind heart.",1,"Right! Scary face, but sneaks the kids snacks. Tabtim saw it on the live."],["You watch the lives every day?",2,"…Huh, how is Tabtim supposed to answer that? Yes, every day. Happy now?"],["Really scary. Watch out or you'll be running laps.",1,"Haha, Tabtim will come run laps at your camp one day."]]],
  ["Someone commented on the live that Tabtim has the prettiest kicks in Isan!",[["It's true.",2,"…Haha, did you write it yourself? That account name looks suspicious."],["Whoever wrote that has a good eye.",1,"They've got a good eye! Tabtim's going to like that comment."],["Don't read the comments too much.",1,"Haha, I know, but the nice comments are okay to read."]]],
  ["You're definitely going on camera in the next live. Tabtim will be watching.",[["I'll wave.",2,"Wave away, Tabtim will wave back… even if you can't see it."],["I'm camera-shy.",1,"Don't be shy, your face is fine, haha."],["No promises.",0,"Aww!"]]]]},
 {id:"tt_dad",x:[
  ["Dad called today to ask if Tabtim had eaten… he's never called before.",[["Your dad's starting to open up.",2,"…That's what Tabtim thinks too. Tabtim told him yes, even though Tabtim hadn't eaten yet, haha."],["So have you eaten?",1,"Not yet! You asked just like Dad."],["I'm glad",1,"Thanks. Tabtim's been smiling all day."]]],
  ["Do you think Dad will come to watch Tabtim fight one day?",[["He'll come for sure, if you keep kicking like that.",2,"…Then Tabtim will keep kicking until Dad comes to watch."],["Invite him.",1,"Yeah, Tabtim'll try inviting him… and if Dad doesn't come, you come instead."],["I'm not sure.",0,"…Okay"]]],
  ["Thanks for listening. You're the only one Tabtim can talk to about this.",[["You can tell me anytime.",2,"…Haha, not funny anymore. Tabtim's embarrassed."],["Always",1,"Thanks!"],["No problem",0,"Okay"]]]]},
 {id:"tt_kick",x:[
  ["Tabtim's flying kick is a hand-span higher than before! Almost reaching the light bulb!",[["Don't break the light bulb.",1,"One already broke, haha. Don't tell Dad."],["Higher than the rockets yet?",2,"…You still remember the rockets? Tabtim's so happy."],["Great job",1,"Tabtim's amazing, right? More praise, more!"]]],
  ["If Tabtim met Ploy in the ring, who do you think would win?",[["Tabtim wins on kicks, Ploy wins on punches.",2,"Nobody gets upset with that answer. You're so smart."],["Ploy, she's from our camp.",1,"Ugh! Siding with your own camp. Tabtim's telling Ploy."],["I don't know",0,"Such a middle-of-the-road answer. No fun at all."]]],
  ["Back to training! A hundred more kicks!",[["Kick one for me too",2,"The hundredth kick is for you!"],["Don't overdo it.",1,"I know, I know"],["OK",0,"Yeah!"]]]]}];
CHAT.tabtim=RG_CHAT.tabtim;
/* v1.90 round 8: the South in full — Chaba's sidecar at the bus terminal, Mali's home at Chaiya and the pier at Don Sak (Mali's story), a richer visit, the letter after the cup and Chaba's chats. Southern lines are drafts for a native speaker to check. */
RG_ARRIVE.south=(G,D)=>{const top=rgTopGirl(G),mali=rgIn(G,"mali"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"bus_terminal",t:"After driving all night, the camp's van pulls into the bus terminal at dawn. By the exit, a faded sidecar motorbike is parked all alone."},
  {n:"chaba",f:"happy",l:"casual",t:"…The guesthouse is down a lane. Big vans can't get in. Sidecar. One at a time."},
  {n:"nar",t:"Chaba points at the sidecar seat and looks only at the Manager, without explaining anything.",choice:[
    {t:"Sit where Chaba points",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"Chaba rides slower than she needs to. She says nothing the whole way, but swerves around every pothole."}]},
    {t:"Ask why she picked you first",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"chaba",f:"flustered",l:"casual",t:"…Don't ask. Get on. Quick."}]},
    {t:"Let someone else go first",fx:G2=>rgMeet(G2,"chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…Fine. Next run."},{n:"nar",t:"On the last run, Chaba comes back for the Manager alone, even though everyone else has already arrived."}]}]},
  ...(top&&top.id!=="mali"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"Chaba")}]:[]),
  ...rgIf(mali,[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"Big sis Chaba! Mali gets the second ride! You used to give Mali sidecar rides when we were little!"},
    {n:"chaba",f:"happy",l:"casual",t:"…Wrong person."},{n:"nar",t:"But on the second run it's Mali in the sidecar, and Chaba takes a loop along the beach that nobody asked for."}]),
  {n:"chaba",f:"happy",l:"casual",t:`${D.name}… The champion hits hard but moves slowly. …Go in from round three.`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name} remembers Chaba's tips · morale +3`:"Everyone remembers Chaba's tips."},
  {n:"coach",t:"She really doesn't talk much… but every word counts."}];};
RG_TRIPX.surat={bg:"mali_home",steps:G=>{const mali=rgIn(G,"mali");return mali?[
  {n:"nar",t:"The morning after the bout, Mali asks to stop in Chaiya. \"Mali's house is right on the way!\" In fact it's a forty-kilometre detour."},
  {n:"nar",t:"At Mali's mother's house, her three younger siblings run out to hug her, and her mother sets out khao yam until the bench is full."},
  {n:"npc",who:"Mali's mom",t:"You're here! Eat first, all of you… Oh? And why is that girl standing out in front of the house?"},
  {n:"nar",show:[{id:"chaba",l:"casual"}],t:"Chaba leans against her motorbike outside the gate and won't come in, even when Mali's mum calls her twice."},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"Big sis Chaba… when Mali was six, you just disappeared without saying goodbye. Mali waited for you in front of the house every evening."},
  {n:"chaba",f:"sad",l:"casual",t:"…"},
  {n:"nar",bg:"pier_south",t:"That afternoon at Don Sak pier, while they wait for the boat, Chaba comes and sits beside Mali at the end of the pier."},
  {n:"chaba",f:"sad",l:"casual",t:"That year my brother's boat capsized. His leg never got better. Mum moved us to Phuket that same night. Doctors. Work."},
  {n:"chaba",f:"sad",l:"casual",t:"I didn't forget you, Mali. …Just didn't know how to say it. The longer it got, the harder."},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"…Why didn't you send even one letter? Mali could read by then.",choice:[
    {t:"\"It's not too late, for either of you.\"",fx:G2=>{add(G2,"mali","bond",2);rgMeet(G2,"chaba",1);},then:[{n:"chaba",f:"flustered",l:"casual",t:"…Not too late."}]},
    {t:"Stay quiet and let them talk",fx:G2=>{add(G2,"mali","bond",1);rgMeet(G2,"chaba",2);},then:[{n:"nar",t:"The Manager steps back and stands at a distance. For a long time, waves against the pier posts speak instead of them."}]}]},
  {n:"chaba",f:"flustered",l:"casual",t:"…I wrote. Eleven letters. Never sent one. Still in the drawer."},
  {n:"mali",f:"surprised",l:"casual",t:"Eleven letters?! …Big sis Chaba, send all of them to Mali! No more keeping them!"},
  {n:"nar",t:"Mali laughs and cries at the same time. Chaba reaches up and pats Mali's head twice, just like when Mali was little."},
  {n:"chaba",f:"happy",l:"casual",t:"…You got bigger, Mali. Still a crybaby."},
  {n:"mali",f:"happy",l:"casual",t:"I'm not a crybaby anymore! …Okay, a little."},
  {fx:G2=>{add(G2,"mali","bond",2);const m=G2.F.mali;if(m)m.morale=Math.min(100,(m.morale||0)+5);rgMeet(G2,"chaba",2);G2.flags.chabaMali=1;}},
  {n:"nar",t:"Mali morale +5 · Mali and Chaba have made up"}]
 :[{n:"nar",bg:"pier_south",t:"Before heading back, Chaba takes the Manager to sit at the end of the Don Sak pier, waiting for the last ferry."},
  {n:"chaba",f:"sad",l:"casual",t:"…When I was little there was a girl next door in Chaiya. Cried a lot. We moved and I never said goodbye."},
  {n:"chaba",f:"happy",l:"casual",t:"She must be grown now. …Probably boxing somewhere."},
  {fx:G2=>rgMeet(G2,"chaba",2)}];}};
RG_POST.south="Manager,\n\nTold Naka to take down the ad that used my brother's story.\n\nThey took it down.\n\nMy brother says thank you to Sirichai Camp. He says the day he watched from his wheelchair by the ring was the best day since the boat.\n\nThe cup is yours now. Look after it.\n\n— Chaba\n\nP.S. Sent Mali the eleven letters.";
RG_CHAT.chaba=[
 {id:"cb_sea",x:[
  ["…Big waves today.",[["Be careful if you go out to sea.",2,"…Not going out. Staying home. Thinking… never mind."],["Training on the sand?",1,"Ran already. Ten laps."],["Mm",0,"…"]]],
  ["My brother said to message you.",[["Your brother's so kind.",1,"…He said to. Not me."],["I'm glad you messaged.",2,"…I know."],["Something up?",0,"Nothing."]]],
  ["Going to train.",[["Go on, and message me again.",2,"…Mm."],["Go go!",1,"Mm."],["OK",0,"…"]]]]},
 {id:"cb_bro",x:[
  ["My brother stood up for ten seconds. Today.",[["Amazing! Tell him I said so.",2,"Told him. He cried. …Me too. A little."],["He's getting better and better.",1,"…Mm. Doctor says so."],["Only ten seconds?",0,"…Ten seconds is long."]]],
  ["My brother wants to see Sirichai Camp.",[["Anytime. I'll build a ramp for him.",2,"…A ramp. Will tell him. He'll be happy."],["He's always welcome.",1,"Mm, thanks"],["It's far",0,"…I know."]]],
  ["Thanks, Manager.",[["No need to thank me.",1,"…Thanks anyway."],["Message me more often, Chaba.",2,"…Will try."],["No problem",0,"Mm."]]]]},
 {id:"cb_food",x:[
  ["Had gaeng tai pla yet?",[["Never had it.",1,"…Never? Come to Phuket. I'll take you."],["Too spicy for me.",1,"Weak."],["Send some to the camp.",2,"…Sent. Two jars. Arrives tomorrow."]]],
  ["The kopi shop by my house. Best hot tea there is.",[["I'd love to sit there with you.",2,"…There's a free seat. One. Next to me."],["Hot tea in the morning is nice.",1,"Mm. Every morning."],["I prefer coffee.",0,"…Fine"]]],
  ["Hungry. Going to eat.",[["Eat lots.",1,"Mm."],["Send me a photo.",2,"…(sends one photo of chicken rice, no text)"],["OK",0,"…"]]]]},
 {id:"cb_mali",x:[
  ["Mali sends twenty messages a day.",[["Do you reply?",1,"I reply. …One a day."],["Mali waited for you for more than ten years, you know.",2,"…I know. I'll reply more. Two messages."],["Isn't that a lot?",0,"…Not too many."]]],
  ["Mali fights much better now. You teach well.",[["Mali's the talented one.",2,"…Same thing Mali says about you."],["Kru Daeng teaches her.",1,"Kru Daeng too."],["Thanks for the compliment.",0,"Mm."]]],
  ["Look after Mali.",[["I already am.",2,"…Trust you."],["Come and see her yourself sometimes.",1,"…Will come."],["Mali's grown up now.",0,"…Still a kid."]]]]},
 {id:"cb_naka",x:[
  ["Naka sent another contract.",[["Don't sign yet. Let Rin read it first.",2,"…Sent it to Rin. Twelve red marks."],["Is it a lot of money?",0,"…Don't care about money."],["If you don't want to sign, don't.",1,"Not signing."]]],
  ["Khun Krerk smiles all the time. …Don't like it.",[["People who smile all the time are the scariest.",2,"…You think so too."],["He seems kind.",0,"…No."],["Be careful.",1,"Being careful."]]],
  ["…Talked to you. Now I can sleep.",[["Then message me every night.",2,"…All right."],["What a lovely dream",1,"Mm. Good night."],["Go to sleep.",0,"…"]]]]}];
CHAT.chaba=RG_CHAT.chaba;
/* v1.90 round 9: the Central Plains in full — Alicia's live stream on the first trip, Lopburi's monkeys, the draft Naka League contract (Rin's story) at Suphan, a richer visit, her post after the cup and Alicia's chats. */
RG_ARRIVE.central=(G,D)=>{const top=rgTopGirl(G),rin=rgIn(G,"rin"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"camp_hanuman",t:`On the way to ${D.name}, Alicia sends a pin asking the camp to stop by Hanuman camp in Lopburi first. "Just on the way. Not an invitation."`},
  {n:"nar",t:"The van door isn't even fully open when a phone on a selfie stick pokes in, ring light blazing."},
  {n:"alicia",f:"happy",l:"casual",t:"Hi everyone~ We have a special guest today! This is the camp everyone in the comments has been talking about… Sirichai camp!"},
  {n:"nar",t:"Alicia sweeps the camera across the van, then holds it on the Manager's face several seconds too long. The live comments pour in.",choice:[
    {t:"Wave at the camera",fx:G2=>rgMeet(G2,"alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"See, everyone? The real manager smiles even better than in the clips. …That's what the comments say, I mean. Not me."}]},
    {t:"\"The camera's been stuck on me for a while.\"",fx:G2=>rgMeet(G2,"alicia",2),then:[{n:"alicia",f:"flustered",l:"casual",t:"…! The signal's lagging! Lopburi internet is bad, I didn't do it on purpose!"}]},
    {t:"Cover the camera with your hand",fx:G2=>rgMeet(G2,"alicia",1),then:[{n:"alicia",f:"pout",l:"casual",t:"Hey! Three hundred viewers just left! …Fine. I'll stop filming."}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"Alicia")}]:[]),
  ...rgIf(rin,[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"4,812 viewers on the live right now. Comments per minute are 2.3 times higher than your usual lives."},
    {n:"alicia",f:"happy",l:"casual",t:"…How did you count that since getting off the van? I'm starting to like you."}]),
  {n:"alicia",f:"happy",l:"casual",t:`This province's champion trained at my camp before. She's good with straight punches but hates low kicks. …I didn't tell you that. You guessed.`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name} remembers Alicia's advice · Morale +3`:"Everyone remembers Alicia's advice"},
  {n:"coach",t:"Is the live over? Then Kru can take off the sunglasses."}];};
RG_TRIPX.lopburi={bg:"lopburi_monkeys",steps:G=>{const top=rgTopGirl(G),fah=rgIn(G,"fah");return [
  {n:"nar",t:"That evening the whole camp stops at Phra Prang Sam Yot to buy souvenirs. Before anyone's out of the van, a troop of monkeys leaps onto the roof, a dozen of them."},
  {n:"nar",t:"The biggest monkey snatches the whole bag of souvenir snacks, then sits on a lamppost unwrapping them in front of everyone."},
  fah?{n:"fah",f:"angry",l:"casual",t:"Hey! That's Fah's snack! Get down here right now, Fah'll kick you off that pole!"}:{n:"coach",t:"Don't try to get it back. It'll call fifty more of its friends."},
  {n:"nar",t:"Another monkey grabs the hand wraps drying behind the van, wraps them round its head like a fighter, and squares up at everyone."},
  ...(fah?[{n:"fah",f:"surprised",l:"casual",t:"…Its guard is better than the new kids at camp."}]:[]),
  ...(top?[{n:top.id,f:"happy",l:"casual",t:"Take a photo first! This clip is going straight on the camp page."}]:[]),
  {n:"coach",t:"Forget it… we'll come back for the wraps next year. It'll probably be Lopburi's champion by then."},
  {fx:G2=>{for(const f of roadRiders(G2))f.morale=Math.min(100,(f.morale||0)+2);}},
  {n:"nar",t:"Everyone laughs until their stomachs hurt · Everyone's morale +2 · One pair of hand wraps lost"}];}};
RG_TRIPX.suphan={bg:"hotel_room",steps:G=>{const rin=rgIn(G,"rin");return rin?[
  {n:"nar",t:"Ten at night, someone knocks on the hotel room door. Alicia stands outside, hood pulled over her head, a thick folder in her hands."},
  {n:"alicia",f:"sad",l:"casual",t:"Sorry for coming so late… Could I borrow Rin? Just for an hour."},
  {n:"alicia",f:"sad",l:"casual",with:"rin",t:"This is the draft Naka League contract. My personal manager says it's great and wants me to sign this week. You're good at reading contracts, right? Please take a look."},
  {n:"rin",f:"happy",l:"casual",t:"Sure. I'll need a red pen and a coffee."},
  {n:"nar",t:"One hour becomes three. Forty pages cover the bed. Rin marks twenty-three spots in red."},
  {n:"rin",f:"sad",l:"casual",t:"Clause 9. Of income from the fighter's image and content, the company gets seventy percent and the fighter thirty, for the entire contract."},
  {n:"rin",f:"sad",l:"casual",t:"Clause 21. The contract runs ten years and renews automatically. Cancelling costs a penalty equal to three years of past income."},
  {n:"rin",f:"sad",l:"casual",t:"And clause 14.3… the same sentence as in the green envelope, word for word. Fight data, image and voice belong to the affiliated company forever."},
  {n:"alicia",f:"sad",l:"casual",t:"…Thirty percent, ten years, forever. My manager called it \"industry standard\"."},
  {n:"rin",f:"happy",l:"casual",t:"I can read numbers. But I don't know if people in the industry really sign things like this. You know better than I do."},
  {n:"alicia",f:"happy",l:"casual",t:"…Nobody signs like this. Good camps give fighters at least half, and nobody dares write \"forever\" into an athlete's contract."},
  {n:"nar",t:"Alicia takes the red pen from Rin's hand and circles clauses 9, 21 and 14.3 again herself.",choice:[
    {t:"\"Together you two are the best contract readers in the country.\"",fx:G2=>{add(G2,"rin","bond",2);rgMeet(G2,"alicia",1);},then:[{n:"rin",f:"flustered",l:"casual",t:"…There isn't enough data to conclude that. But I won't argue."}]},
    {t:"\"Alicia, what will you do with it now?\"",fx:G2=>{rgMeet(G2,"alicia",2);add(G2,"rin","bond",1);},then:[{n:"alicia",f:"happy",l:"casual",t:"I'll send it back with these red marks. And… I might need a new personal manager."}]}]},
  {n:"alicia",f:"flustered",l:"casual",with:"rin",t:"Rin… thank you. I've never had a friend this smart. Everyone around me is only smart about view counts."},
  {n:"rin",f:"flustered",l:"casual",t:"Friend… Noted."},
  {fx:G2=>{add(G2,"rin","bond",2);const r=G2.F.rin;if(r)r.morale=Math.min(100,(r.morale||0)+5);rgMeet(G2,"alicia",2);G2.flags.rinAlicia=1;}},
  {n:"nar",t:"Rin, morale +5 · Rin and Alicia have become friends"}]
 :[{n:"nar",t:"Ten at night, Alicia knocks on the hotel room door, holding a thick contract folder."},
  {n:"alicia",f:"sad",l:"casual",t:"The Naka League contract. My personal manager says to sign it this week. …Could you read clause 14.3 to me? My hands shake when I read it."},
  {n:"nar",t:"The Manager reads it aloud slowly: the same sentence as in the green envelope, word for word. Alicia quietly closes the folder."},
  {n:"alicia",f:"happy",l:"casual",t:"…Thank you. I know what to do with it now."},
  {fx:G2=>rgMeet(G2,"alicia",2)}];}};
RG_POST.central="📱 Notification: Alicia (@alicia.hanuman) posted\n\n\"Thank you everyone for cheering on the Central Championship. The cup now belongs to Sirichai camp, and they earned every punch of it.\n\nThere are rumours that I've signed with a new league. Let me answer right here: I haven't signed with anyone.\n\nAnd I will never sign anything with the word 'forever' in it.\"\n\n— 48,000 likes within an hour\n\n📩 One private message follows: \"You saw the post, right? …You don't have to reply. I just wanted you to see it before anyone else.\"";
RG_CHAT.alicia=[
 {id:"al_live",x:[
  ["Twenty thousand watched my live last night, but half the comments asked \"where's the Sirichai manager?\"",[["Tell them I'm working.",1,"…Already did. The viewers spammed the sad reaction."],["Then invite me on your next live.",2,"No way! …The viewers would get ideas about us… No, no."],["Forget the comments.",0,"Can't. That's my job."]]],
  ["The sponsor team makes me smile at the camera three hours a day.",[["Sounds exhausting. Take a break.",2,"…You're the first person who's told me to rest instead of telling me to smile more."],["Your smile is pretty anyway.",1,"I know. …But thank you."],["Work is work.",0,"…Yes, work is work."]]],
  ["Off to train. Real training, not training for a clip.",[["Train well.",1,"Of course."],["Send me a clip of the real training.",2,"…A clip no one's ever seen. Just for you."],["OK",0,"Bye"]]]]},
 {id:"al_rin",x:[
  ["Rin sent me a seventeen-page analysis of my punches.",[["Rin likes you, that's why she did that much.",2,"…Really? Then I'll read all seventeen pages."],["Can you read all that?",1,"Read two pages, then called Rin to ask about the rest."],["Isn't that a lot?",0,"Rin says this is the short version."]]],
  ["I took Rin to a buffet. She counted the calories on every plate.",[["That's Rin for you.",1,"Yes. And she still ate more than me."],["You two get along well.",2,"…I've never had a friend who doesn't care about view counts. It's comfortable."],["Was it good?",0,"It was delicious."]]],
  ["Don't tell Rin I told you.",[["I definitely won't.",1,"Promise"],["Too late. Rin knows everything.",2,"…True. Rin probably calculated it from the start."],["Already told her",0,"Manager!!"]]]]},
 {id:"al_hanuman",x:[
  ["Monkeys steal gloves from Hanuman camp every day. Today they took a whole pair.",[["Lopburi's monkeys stole our camp's hand wraps too.",2,"Haha, then the monkeys there could start their own boxing camp by now."],["A camp called Hanuman deserves it.",1,"…Funny. I actually laughed out loud."],["Why not chase them off?",0,"Can't. The monkeys here own the town."]]],
  ["Our camp's Hanuman Offers the Ring move. Kru says mine is the most beautiful in ten years.",[["Pretty, and powerful too.",2,"…You said strong before pretty. I'll remember that."],["Kru has a good eye.",1,"Kru has a good eye."],["Pretty alone doesn't win fights.",0,"…I know. No need to rub it in."]]],
  ["Come visit Hanuman camp sometime. I'll show you around. …Just as the host.",[["Definitely",2,"…I won't tell my team, so there'll be no cameras."],["Can I bring the whole camp?",1,"Sure. But the monkeys will like you more than me, for sure."],["If I'm free",0,"…Fine"]]]]},
 {id:"al_mgr",x:[
  ["I fired my personal manager. The one who told me to sign the Naka League contract.",[["You made the right call.",2,"…I was so scared. But hearing you say that helps."],["Who'll handle your work now?",1,"I handle it myself now. Rin checks the contracts for me."],["That took guts",1,"Right?!"]]],
  ["…Does the Sirichai camp manager ever look after fighters from outside the camp? Just asking, as a joke.",[["If it's you, always.",2,"…It was a joke question! Don't get the wrong idea! …But I'll remember that."],["Our camp is small, you know.",1,"The small camp that beat me."],["No.",0,"…It was just a joke question."]]],
  ["Forget I asked!",[["Too late to forget now.",2,"…Then remember it, fine."],["Okay, forgotten.",0,"…You forget fast."],["Forgot it, but wrote it down.",1,"Manager!"]]]]},
 {id:"al_night",x:[
  ["No live stream tonight. Just sitting alone by the river watching fireflies.",[["Just like the night on the boat.",2,"…You still remember. I thought I was the only one."],["Not streaming is nice.",1,"Yes. It's quiet."],["Watch out for mosquitoes.",1,"Already put on bug spray, haha."]]],
  ["If one day nobody watches my lives anymore, would you still watch?",[["Of course. Even if I'm your only viewer.",2,"…One viewer is enough."],["Your viewers won't disappear.",1,"Dodging the question. But thanks anyway."],["I don't know",0,"…That's a bit too honest."]]],
  ["Going to bed. Don't reply with a sticker, so I don't have to answer back.",[["(Send a sticker)",1,"…Replied. Happy? (heart sticker)"],["What a lovely dream",2,"…Sweet dreams, Manager."],["OK",0,"Good night."]]]]}];
CHAT.alicia=RG_CHAT.alicia;
/* ---------- v1.90 limit break: a fighter with every stat at 20 (Lv.20+) leaves camp for two weeks of training and comes back with a ceiling of 25 ---------- */
const LB_CAP=25;
const lbFull=f=>!!f&&ATTRS.every(([k])=>f.a[k]>=19.95);
const LB_COST=150000; /* v1.91.26 (Man): limit-break training should cost a lot */
function lbBlock(G,f){if(!G.region)return "The Four Regions chapter isn't open yet";if(stCap(f)>=LB_CAP)return "Limit already broken";if(!lbFull(f))return "Every stat must be 20";
  if((f.lvl||1)<20)return "Needs Lv.20 or higher";if(isAway(G,f.id))return "Not in camp";if(f.injury)return "Wait until she's healed";
  if(G.bookings.some(b=>(b.a===f.id||b.b===f.id)&&b.week>=G.week&&b.week<=G.week+2))return "Has a fight within 2 weeks — cancel it or fight it first";
  const T=G.region.trip;if(T&&T.abs!=null&&T.abs-absWeek(G)<=2)return "The whole camp has a regional trip within 2 weeks";if(G.cash<LB_COST)return `Not enough cash · needs ${fmt(LB_COST)}`;return "";}
function lbCardHTML(f){if(!G.region||f.camp!=="player")return "";
  if(isAway(G,f.id)&&f.lbTrip)return `<div class="lbcard"><h4>✦ Training away</h4><p class="meta">${esc(f.name)} Back in camp in ${awayLeft(G,f.id)} weeks · no training, no fights</p></div>`;
  if(stCap(f)>=LB_CAP||!lbFull(f))return "";const why=lbBlock(G,f);
  return `<div class="lbcard"><h4>✦ Limit Break</h4><p class="meta">Every stat is at 20 · train away from camp for 2 weeks (no training, no fights) and the stat ceiling rises to ${LB_CAP}</p>
    <p class="meta">Teacher, lodging, food and travel, total <b class="goldt">${fmt(LB_COST)}</b></p>
    <p class="meta">Stats above 20 grow slower than usual. It takes a long time</p>${why?`<p class="meta redt">${why}</p>`:""}<button class="btn primary" data-act="lbgo" data-v="${f.id}" ${why?"disabled":""}>Send away to train ▸</button></div>`;}
const LB_GO={
 kati:[{n:"coach",t:"Kati, your stats are all maxed. More training here will only keep them where they are."},{n:"coach",t:"I know an old monk at a mountain temple near Omkoi. When he was young he fought Grandpa Chai. Go stay with him for two weeks."},
  {n:"kati",f:"sad",t:"Two weeks… I've never been away from camp that long."}],
 mali:[{n:"coach",t:"Mali, your stats are all maxed. There's an old master in Chaiya who still teaches Yang Sam Khum the traditional way."},{n:"mali",f:"happy",t:"Back to Chaiya~? Grandma will be so happy! But Mali's going to miss everyone!"}],
 rin:[{n:"coach",t:"Rin, your numbers have topped out. The same training won't raise them."},{n:"rin",f:"happy",t:"I know. And I've planned it already: two weeks in Bangkok, at the camp where I was knocked out at nineteen."},
  {n:"rin",f:"sad",t:"I'll step into that ring again… the one variable I've never solved."}],
 ploy:[{n:"coach",t:"Ploy, your stats are all maxed. How about two weeks back in Korat? I've already talked to your dad."},{n:"ploy",f:"pout",t:"I don't want to go back… but Dad calls every week to ask if I can still run up the hill."}],
 fah:[{n:"coach",t:"Fah, your stats are all maxed. Want to go train somewhere for two weeks?"},{n:"fah",f:"happy",t:"Doi Inthanon! Fah's going to run to the summit every morning. Nobody will keep up!"}]};
const LB_BACK={
 kati:[{n:"nar",t:"Two weeks later Kati walks back into camp before dawn, darker from the sun, hands wrapped in old white cloth."},{n:"kati",f:"happy",t:"The abbot had me carry water up the mountain a hundred times a day. I didn't hit a bag once."},
  {n:"kati",f:"sad",t:"On the last day he said Grandpa Chai didn't leave my training unfinished — he kept the last move for me to find myself."},{n:"coach",t:"And did you find it?"},{n:"kati",f:"happy",t:"Not yet. But I know now it isn't at twenty."}],
 mali:[{n:"nar",t:"Mali comes back with a big foam box — Grandma made khanom jeen with tai pla curry for the whole camp."},{n:"mali",f:"happy",t:"The old master had me walk Yang Sam Khum on the paddy dykes every day, and on the last day I didn't fall in the mud once~"},
  {n:"mali",f:"happy",t:"Now I can walk in on an opponent without thinking. My feet just go!"}],
 rin:[{n:"nar",t:"Rin comes back with a new notebook. Every page is blank."},{n:"rin",f:"happy",t:"I got back in that same ring. This time I didn't count anything. I just fought."},
  {n:"rin",f:"flustered",t:"Results: fear down about ninety percent… I'm keeping the other ten to remind myself."}],
 ploy:[{n:"nar",t:"Ploy comes back in new running shoes. The old pair died on the mountain."},{n:"ploy",f:"happy",t:"Dad timed my hill runs every day. On the last day I beat the record he set when he was young."},
  {n:"ploy",f:"flustered",t:"Dad didn't praise me… he just wiped his own name off the board and wrote mine instead."}],
 fah:[{n:"nar",t:"Fah comes back with ten bags of mountain coffee."},{n:"fah",f:"happy",t:"Fah ran to the summit fourteen times! The last time I watched the sunrise all alone."},
  {n:"fah",f:"sad",t:"…and I missed the camp a lot. Don't tell anyone."},{n:"fah",f:"happy",t:"This coffee's for everyone! Manager, pay me back!"}]};
const lbGo=(f)=>LB_GO[f.id]||[{n:"coach",t:`${f.name} has maxed every stat. I'll send her to train with an old master I know, for two weeks.`}];
const lbBack=(f)=>LB_BACK[f.id]||[{n:"nar",t:`${f.name} is back from two weeks of training, eyes calmer than before`},{n:"coach",t:"Don't tell me. I can see it in how you walk."}];
function lbStart(G,id){const f=G.F[id];if(!f||lbBlock(G,f))return;const who=LB_GO[id]?id:"coach";
  playScene([...lbGo(f).map(x=>({l:"casual",...x})),{n:"nar",t:`Send ${f.name} away to train for 2 weeks?`,choice:[
    {t:`Go. The camp can wait (${fmt(LB_COST)})`,fx:G2=>{if(G2.cash<LB_COST)return;G2.cash-=LB_COST;sendAway(G2,id,2,"train");G2.F[id].lbTrip=1;G2.log.push(`${f.name} left camp for 2 weeks of training · paid ${fmt(LB_COST)}`);},then:[{n:who==="coach"?"coach":id,f:"happy",l:"casual",t:"See you in two weeks!"}]},
    {t:"Not yet",then:[{n:"coach",t:"All right, no rush. Tell me when you're ready."}]}]}],()=>{save();render();},{bg:"camp",look:"casual"});}
/* weekly: the homecoming, else the first time someone hits the ceiling Kru Daeng points it out */
function lbWeek(G,done){const R=roster(G).concat(Object.values(G.F).filter(f=>f.lbTrip&&f.camp==="player"&&!roster(G).includes(f)));
  const back=R.find(f=>f.lbTrip&&!isAway(G,f.id));
  if(back){playScene([...lbBack(back).map(x=>({l:"casual",...x})),{fx:G2=>{const f=G2.F[back.id];f.cap=LB_CAP;f.potential=Math.max(f.potential||14,LB_CAP);f.lbTrip=0;f.awayBack=true;
      for(const [k] of ATTRS)f.a[k]=Math.min(LB_CAP,f.a[k]+.2);f.morale=Math.min(100,(f.morale||0)+10);G2.log.push(`${f.name} broke the limit · stat ceiling 20 → ${LB_CAP}`);}},
    {n:"nar",t:`${back.name} broke the limit · stat ceiling 20 → ${LB_CAP} · every stat +0.2 · morale +10`}],()=>{save();done();},{bg:"camp",look:"casual"});return true;}
  const ready=roster(G).find(f=>!f.lbNote&&stCap(f)<LB_CAP&&lbFull(f)&&(f.lvl||1)>=20);
  if(ready){ready.lbNote=1;playScene([{n:"coach",t:`Manager, ${ready.name} has maxed every stat at 20 — no amount of training raises them now.`},{n:"coach",t:"There is one way. Go look at her stats page."},
    {n:"nar",t:"Unlocked: Limit Break · see Fighter › Stats"}],()=>{save();done();},{bg:"camp",look:"casual"});return true;}
  return false;}
/* ---------- v1.90 round 10: the Naka League team (names locked 18 Nov 2026 — see project doc claude/naka-league-team.md) ----------
   "Naka" is the family name of Krerk and Ladda only; the four team members are hired fighters from other disciplines.
   shape = stat offsets from the fitted level · grap/sub = takedown / submission game (0–20) · nlsk = the three skills the AI fires
   spl = special sheets (code effects if none) · td:1 = the throw sheet that plays on a takedown */
const NL={
 nia:{name:"Nia Okafor",nick:"Black Drum Rhythm",art:"Boxing",col:"#3a7bd5",sprite:"nl_nia",sty:"pressure",
  shape:{punch:3,kick:-6,knee:-5,elbow:-5,clinch:-4,guard:2,foot:3,counter:3,speed:2,iq:1},grap:0,sub:0,pfx:{dmg:{punch:.12},ctr:.04,evade:.02},
  nlsk:[{id:"nl_peek",name:"Peek-a-Boo",k:"def"},{id:"nl_liver",name:"Liver Shot",k:"atk",w:"punch"},{id:"nl_dempsey",name:"Dempsey Roll",k:"atk",w:"punch"}],
  spl:[{img:"nl_nia_special",w:"punch",def:"Dempsey Roll",npc:1,p:.5}],tip:"Fast hands and great counters, but she's never had to take kicks or knees"},
 varya:{name:"Varya Sokolova",nick:"Red Bear",art:"Sambo + MMA",col:"#d43a3a",sprite:"nl_varya",sty:"inside",
  shape:{clinch:3,power:3,dur:2,stamina:1,kick:-3,foot:-2,speed:-1},grap:18,sub:15,tdName:["Double Leg","Hip Throw","Suplex"],subName:["Heel Hook","Kneebar"],pfx:{gnp:.25},
  nlsk:[{id:"nl_double",name:"Double Leg",k:"td"},{id:"nl_suplex",name:"Suplex",k:"td"},{id:"nl_heelhook",name:"Heel Hook",k:"sub"}],
  spl:[{img:"nl_varya_special",def:"Suplex",td:1}],tip:"Big throws and leg locks · once she drags you down she never stops pounding"},
 meili:{name:"Meili Sae-Tang",nick:"Dragon of Yaowarat",art:"Kung Fu",col:"#e0662a",sprite:"nl_meili",sty:"footwork",
  shape:{kick:4,speed:3,foot:2,punch:1,clinch:-4,knee:-3,dur:-2},grap:0,sub:0,pfx:{dmg:{kick:.12},evade:.02},
  nlsk:[{id:"nl_shadowless",name:"Shadowless Kick",k:"atk",w:"kick"},{id:"nl_inch",name:"One-Inch Punch",k:"atk",w:"punch"},{id:"nl_crane",name:"Crane Stance",k:"def"}],
  spl:[{img:"nl_meili_kick",w:"kick",def:"Shadowless Kick",npc:1,p:.5},{img:"nl_meili_special",w:"punch",def:"One-Inch Punch",npc:1,p:.5}],tip:"Fast, long kicks · in close she's only half the fighter"},
 rosa:{name:"Corazón Rosa",nick:"Pink Heart",art:"Lucha Libre",col:"#ea5aa0",sprite:"nl_rosa",sty:"power",
  shape:{clinch:3,stamina:3,dur:3,power:1,guard:-2,counter:-2,iq:-1},grap:15,sub:10,tdName:["Hurricanrana","DDT"],subName:["La Mística"],pfx:{regen:.05,dmg:{elbow:.08}},
  nlsk:[{id:"nl_hurricanrana",name:"Hurricanrana",k:"td"},{id:"nl_mistica",name:"La Mística",k:"sub"},{id:"nl_moonsault",name:"Moonsault",k:"atk",w:"elbow"}],
  spl:[{img:"nl_rosa_special",def:"Hurricanrana",td:1}],tip:"Tireless and tough, loves a showy throw for the crowd · leaves her guard open a lot"},
 /* boss: three forms, one per round (Man 18 Nov 2026) — 1 hood: heavy · 2 hood off: fast and sharp · 3 blood mode: the Naka family's sports medicine,
    she punches herself to boil the blood — red skin, red eyes, furious, very fast */
 ladda:{name:"Ladda",nick:"The Killing Machine of Women's Muay Thai",art:"MMA + Modern Muay Thai",col:"#f2f2f2",sprite:"nl_ladda_hood",phR:[1,1,2,2,3]/* v1.91.9 (Man): 5 rounds — hood 1–2 · no hood 3–4 · blood mode 5 */,hpX:45,hurt:{def:.4,ev:.1,sta:.5,rec:1.1,rnd:14},
  shape:{elbow:2,knee:1,clinch:2,iq:2,comp:2},grap:16,sub:16,tdName:["Double Leg","Leg Grab"],subName:["Rear-Naked Choke","Guillotine"],pfx:{dmg:{elbow:.1},gnp:.15},
  nlsk:[{id:"nl_ld_double",name:"Double Leg",k:"td"},{id:"nl_ld_superman",name:"Superman Punch",k:"atk",w:"punch"},{id:"nl_ld_rnc",name:"Rear-Naked Choke",k:"sub"}],
  phases:[{n:1,fst:"power",sprite:"nl_ladda_hood",dmg:1.18,hit:-.01,ini:-1,say:"Ladda pulls the hood down over half her face and stands still… every punch lands like a hammer"},
   {n:2,fst:"read",fall:"footwork",sprite:"nl_ladda",dmg:1,hit:.05,ini:3,ev:.04,say:"Ladda flings the hood away, white hair with red tips spilling out — her speed changes in an instant!"},
   {n:3,fst:"pressure",lvUp:1,sprite:"nl_ladda_blood",dmg:1.3,hit:.08,ini:4,ev:.03,self:5,blood:1,say:"Ladda punches herself in the face twice — the Naka family's sports medicine wakes the blood! Red skin, red eyes… blood mode!"}],
  spl:[{img:"nl_ladda_sp_superman",w:"punch",def:"Superman Punch",npc:1,p:.55,ph:1},{img:"nl_ladda_sp_headkick",w:"kick",def:"Head Kick",npc:1,p:.55,ph:1},
   {img:"nl_ladda_sp_spinkick",w:"kick",def:"Spinning Back Kick",npc:1,p:.55,ph:2},{img:"nl_ladda_sp_backfist",w:"punch",def:"Spinning Back Fist",npc:1,p:.55,ph:2},
   {img:"nl_ladda_sp_bloodfist",w:"punch",def:"Naka Blood Fist",npc:1,p:.6,ph:3},{img:"nl_ladda_sp_bloodkick",w:"kick",def:"Spinning Wheel Kick",npc:1,p:.6,ph:3},{img:"nl_ladda_sp_bloodslam",def:"Blood Boil Slam",td:1,ph:3},{img:"nl_ladda_sp_awaken",def:"Blood-boil mode",awaken:1,ph:3}],
  tip:"Changes form mid-fight · rounds 1–2 hooded, heavy and steady · rounds 3–4 hood off, very fast · round 5 blood mode"}};
const NL_ORDER=["nia","varya","meili","rosa","ladda"];
/* build (or refresh) a team member sized against `me`: she wins about `p` of 5-round bouts, never above the ceiling `ceil` */
function nlFighter(G,k,me,p,ceil,leg){const D=NL[k],id="nl_"+k;let f=G.F[id];
  if(!f){f=baseFighter(id,mkNPC(id,D.name,"X",14,mulberry32(hashStr(id)),2));f.camp="quest";f.div="X";G.F[id]=f;}
  Object.assign(f,{name:D.name,full:D.name,color:D.col,grap:D.grap,sub:D.sub,tdName:D.tdName,subName:D.subName,pfx:D.pfx,nlsk:D.nlsk,spl:D.spl.length?D.spl:null,nl:k,lvUpd:0,phases:D.phases||null,phR:D.phR||null,rgSty:D.sty||null,hpX:D.hpX||0,hurt:D.hurt||null});
  if(D.sprite)f.sprite=D.sprite;f.fatigue=0;f.injury=0;f.morale=75;f.lvl=Math.max(me&&me.lvl||1,1)+(k==="ladda"?9:NL_ORDER.indexOf(k)<2?7:8)/* v1.90.20 (Man): members +7–8, Ladda +9 (+10 in blood mode) — the label only, strength comes from the fit */;
  const setT=T=>{f.vet=0;for(const [a] of ATTRS)f.a[a]=Math.max(1,Math.min(20,T-.6+(D.shape[a]||0)));liftOpponent(f,T,20);};
  {const T=RG_FIX.nl[k]+(leg?(k==="ladda"?LEG_UP.l:LEG_UP.n):0);setT(T);f.nlT=T;}if(leg)f.lvl+=2;f.leg=!!leg;return f;} /* v1.90.21: fixed strength (p and ceil kept only for the old dev calls) */
function nlTest(k){const me=roster(G).filter(f=>!isAway(G,f.id)).sort((a,b)=>effOvr(G,b)-effOvr(G,a))[0];if(!me)return;
  const o=nlFighter(G,k,me,k==="ladda"?.25:.4,RG_LADDER.champ(3,0)+(k==="ladda"?.5:0));
  const b={id:"nltest"+Date.now(),a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",nltest:1};G.bookings.push(b);save();openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);save();render();});}
/* ===================== round 11: cups 2–3 story, the closing ceremony, the underground final (v1.91.20) ===================== */
const RG_DEAL_CASH=200000;
/* the week after the second cup: dinner with Khun Krerk */
function rgCup2(G){const R=G.region,rin=rgIn(G,"rin");return [
 {n:"nar",bg:"camp",t:"A gold invitation arrives at the camp. Khun Krerk invites the manager to a one-on-one dinner at the top-floor restaurant of the Naga Energy tower"},
 {n:"nar",bg:"krerk_dinner",show:[{id:"npc:krerk"}],t:"A long table for twenty, but only two place settings. Glass all around, with all of Bangkok in view"},
 {n:"npc",who:"Khun Krerk",t:(R.cups||[]).length>=2?"Two cups in a single tournament. I haven't seen a small camp like yours in a long time":"A small camp from Chiang Mai fighting at regional level. I haven't seen that in a long time"},
 {n:"npc",who:"Khun Krerk",t:"I used to fight too. National team. That year I already had my Olympic ticket in hand"},
 {n:"npc",who:"Khun Krerk",t:"Three weeks before we left, the team van skidded on the road. My knee broke in three places. The doctor said I was lucky to walk at all"},
 {n:"npc",who:"Khun Krerk",t:"Nobody was at fault. It rained, the road was slick… it was luck, that's all"},
 {n:"npc",who:"Khun Krerk",t:"From that day I promised myself I'd never let luck decide a fighter's life again. Money, data, science, I'll control all of it myself"},
 {n:"nar",t:"He slides a green-and-gold folder in front of you. The cover reads \"Partner Contract\""},
 {n:"npc",who:"Khun Krerk",t:`I'd like to partner with Sirichai Camp. ${fmt(RG_DEAL_CASH)} today, in exchange for the right to manage your fighters, from every meal to the data on every punch`},
 {n:"nar",t:"A green-and-gold folder lies in front of you",choice:[
   {t:"Accept",fx:G2=>{G2.region.c2="deal";G2.cash+=RG_DEAL_CASH;},then:[
     {n:"npc",who:"Khun Krerk",t:"A wise decision. I'll take the very best care of Sirichai Camp"},
     rin?{n:"rin",f:"sad",l:"casual",t:"…Let Rin read the contract before you sign. At least then Rin will know what we just sold"}:{n:"coach",t:"Money this big, I've never seen anyone hand it out for free"}]},
   {t:"Let me think about it",fx:G2=>{G2.region.c2="later";},then:[
     {n:"npc",who:"Khun Krerk",t:"Of course. My door is always open"}]},
   {t:"Decline",fx:G2=>{G2.region.c2="no";},then:[
     {n:"npc",who:"Khun Krerk",t:"A pity… but I respect that"},
     {n:"nar",t:"He keeps smiling the same way, but the hand pulling the folder back grips it until his knuckles go white"}]}]},
 {n:"nar",t:"While you wait for the elevator down, the doors of the one across are closing. Inside stands a lone woman with white hair, red at the tips. The doors shut before you can see her face"},
 {fx:()=>{R.c2=R.c2||"later";}}];}
/* the week after the third cup: Pailin "forgets" a tablet */
function rgCup3(G){const R=G.region,rin=rgIn(G,"rin"),ploy=rgIn(G,"ploy"),kati=rgIn(G,"kati");return [
 {n:"nar",bg:"camp",t:"A rainy night. Pailin stands at the camp gate without an umbrella"},
 {n:"pailin",f:"sad",t:"I didn't come to see anyone. I was just passing by"},
 {n:"nar",t:"She hands over Vector's tablet, three files left open on the screen"},
 {n:"nar",t:"The first file is the full Naka League contract draft. The second is monthly transfer slips from Naga Energy to Vector since last year. The third is a video clip"},
 {n:"nar",bg:"naka_lab",t:"In the clip, four women from different disciplines train on the mats: boxing, sambo, kung fu, lucha wrestling. A fifth in a white hood takes them down one at a time"},
 {n:"pailin",f:"sad",t:"Research funding, lab fees, equipment… I thought he gave it because he believed in sports science like I do"},
 {n:"pailin",f:"sad",t:"But he used the data from every fight I logged to build that person"},
 ...rgIf(ploy,[{n:"ploy",f:"sad",l:"casual",t:"Sis…"},{n:"pailin",f:"sad",t:"Don't say anything, Ploy. I know I was stupid"},{n:"ploy",l:"casual",t:"You weren't stupid. You just trusted the wrong person… once"}]),
 rin?{n:"rin",f:"sad",l:"casual",t:"Clause 14.3 of the Naka League contract covers data obtained from Vector too. That means data from every camp Vector has ever fought"}:{n:"coach",t:"Data from every camp Vector has ever fought… it's all in Naka's hands now"},
 {n:"coach",bg:"camp",t:"Including our camp"},
 /* v1.91.23 (Man): the money behind Phayak Thong is Krerk's — revealed on the same tablet */
 {n:"nar",t:"At the end of the draft there's one more page, an appendix headed \"Naka Energy Affiliated Camps\". The first name is Vector. The second is Phayak Thong Camp, Chiang Mai."},
 {n:"nar",t:"The date Naka took its stake in Phayak Thong falls in the same month Grandpa Chai passed away."},
 {n:"pailin",f:"sad",t:"I never opened this page… I only signed the ones with Vector's name on them."},
 ...rgIf(ploy,[{n:"ploy",f:"angry",l:"casual",t:"The sponsor hand wraps the camp always made me use… that pattern at the wrist is a naga's tail."}]),
 ...rgIf(rin,[{n:"rin",f:"sad",l:"casual",t:"The year the boss sent an injured junior into the ring… the results targets he pushed on everyone were handed to him by someone else."}]),
 {n:"coach",t:"Once Grandpa Chai was gone, every one of our kids moved to Phayak Thong within a year… I always thought it was just money."},
 ...rgIf(kati,[{n:"kati",f:"sad",l:"casual",t:"I thought everyone just didn't want to stay at an empty camp… but someone wanted Grandpa's camp empty from the start."}]),
 {n:"nar",t:"The manager remembers what was said at the top-floor dinner in the Naka tower: \"I haven't seen a small camp like this in a long time.\" …He'd been watching all along."},
 R.c2==="deal"?{n:"coach",t:"And the green-and-gold folder we signed… our camp's name is on that page now too."}:{n:"coach",t:"That green-and-gold folder he slid across to you… it was the same move, second time round."},
 {n:"pailin",t:"I didn't come to warn you. I just forgot my tablet here. You can send it back tomorrow"},
 {n:"nar",t:"Pailin walks back into the rain and never looks back"},
 {fx:()=>{R.c3="seen";}}];}
/* who in the camp the regional champion likes best: the one who says the camp's name at the ceremony */
const RG_CLOSE_SAY={baibua:"A small camp can stand tall. I saw it with my own eyes. Sirichai Camp",tabtim:"Sirichai Camp doesn't have much money, but they fight for each other with all their heart. Tabtim has seen it",
 alicia:"I want to fight the Sirichai way. Where nobody asks me to smile for the camera",chaba:"…I want to stay at a camp that fixes its own fence"};
/* after the fourth cup (or once the tournament has run its course): Naka League, the refusals, Ladda */
function rgClose(G){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin");
 const fav=["baibua","tabtim","alicia","chaba"].sort((a,b)=>((R.meet||{})[b]||0)-((R.meet||{})[a]||0))[0];
 return [
 {n:"nar",bg:"closing_ceremony",show:[{id:"npc:krerk"}],t:"The Four Regions Championship closing ceremony is held in Bangkok. The hall glows green and gold. On stage sits a long table with four golden pens laid out in a row"},
 {n:"npc",who:"Khun Krerk",t:"Thank you, every camp. This tournament convinced me of one thing: Muay Thai has to go further than temple-fair rings"},
 {n:"npc",who:"Khun Krerk",t:"Introducing… Naka League! The country's first all-round fighting league. Muay Thai, boxing, MMA, every discipline on one stage"},
 {n:"npc",who:"Khun Krerk",t:"And the first four fighters I'd like to invite are the four regional champions. Please come up and sign on stage"},
 {n:"nar",show:[{id:"baibua"},{id:"tabtim"},{id:"alicia"},{id:"chaba"}],t:"Baibua, Tabtim, Alicia and Chaba walk up to the stage, but none of them picks up a pen"},
 {n:"baibua",f:"sad",l:"fight",t:"Thank you… but I won't sign. Bua Tha Sao Camp still has me"},
 {n:"tabtim",l:"fight",t:"Tabtim won't sign either. My little brother read me clause fourteen"},
 {n:"alicia",l:"fight",t:"I already said I won't sign anything with the word \"forever\" in it"},
 {n:"chaba",l:"fight",t:"…not signing"},
 {n:fav,f:"happy",l:"fight",t:RG_CLOSE_SAY[fav]},
 fah?{n:"fah",f:"flustered",l:"casual",t:"Hear that, mister?! Nobody wants your league!"}:{n:"coach",t:"Hear that, Khun Krerk? Nobody wants your league"},
 {n:"pailin",t:"And Vector Gym withdraws from the Naka League partnership, as of this second"},
 {n:"nar",show:[{id:"npc:krerk"}],t:"The whole room goes silent. Every eye turns to Khun Krerk"},
 {n:"npc",who:"Khun Krerk",t:"…No matter. Then let my daughter introduce herself instead"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"A woman in a white hood steps into the ring and pulls the hood off. Long white hair with red tips falls down her back"},
 {n:"lada",l:"casual",t:"Ladda Naka"},
 {n:"lada",l:"casual",t:"I want to know how good the four regional champions are. Come up one at a time. Here. Now"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"baibua",l:"fight"}],t:"Before anyone can stop her, Baibua steps in first. Her spinning elbow misses Ladda's chin by millimetres. Ladda answers with an elbow, wraps her waist and throws her to the canvas in a single motion"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"tabtim",l:"fight"}],t:"Tabtim leaps into a kick. Ladda closes the distance before the leg can fully extend, grabs the standing leg and pulls her down"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"alicia",l:"fight"}],t:"Alicia throws a combination. Ladda ducks every punch, slips around behind her and locks in a choke. Alicia taps within five seconds"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"chaba",l:"fight"}],t:"Chaba presses forward and never takes a step back. Ladda lets her drive all the way to the ropes, then uses that same force to drag Chaba to the mat"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"Blood seeps from the corner of Ladda's mouth, where Baibua's elbow grazed her. She touches it with a fingertip, and smiles for the first time"},
 {n:"lada",l:"casual",t:"…that was fun"},
 fah?{n:"fah",f:"sad",l:"casual",t:"That's… modern fighting. Just like Fah"}:{n:"coach",t:"That's not just Muay Thai… that's everything combined"},
 {n:"npc",who:"Khun Krerk",t:"Thank you all for coming"},
 {n:"nar",bg:"camp",show:[],t:"Three days later, a black card with no logo arrives at the camp"},
 {n:"nar",t:"\"Sirichai Camp is invited: five on five · the old beverage factory warehouse, Khlong Toei port · open rules, throws and locks allowed · no prize, no press\""},
 {n:"nar",t:"Handwritten on the back: \"I just want to know how well your small Muay Thai camp handles the real world — L.\""},
 ...rgIf(R.c2==="deal",[rin?{n:"rin",f:"flustered",l:"casual",t:"Manager, the partner contract we took money for. Clause 30 says: \"Should Naka League lose to the partner camp, this contract shall terminate immediately\""}:{n:"coach",t:"The partner contract we took money for. Clause 30 says if Naka League loses to our camp, the contract ends immediately…"},
   {n:"coach",t:"He was that confident, to write this clause in"}]),
 {n:"coach",t:"Throws allowed, locks allowed… we haven't trained for any of that, not even one day"},
 {n:"coach",t:"Three weeks to prepare. Choose how to train for it on the Four Regions Championship page"}];}
const RG_FPREP={sprawl:{n:"Stop takedowns",d:"Kick them off when they shoot in, and land clinch knees more often"},escape:{n:"Escape locks",d:"Get up off the mat and slip out of locks more often"},strike:{n:"Stand and trade",d:"Ignore the takedowns. Sharpen your strikes and finish it before they drag you down"}};
function rgFinalIntro(G){const R=G.region,F=R.final;return [
 {n:"nar",bg:"naka_underground",t:F.tries?"The same warehouse by Khlong Toei port, as dim as last time. The same small crowd stands silent in the shadows":"An old warehouse by Khlong Toei port. Dim lights, the smell of sour syrup drifting from old tanks. In the middle, a ring with black ropes and soft MMA-style mats on the floor"},
 {n:"npc",who:"Khun Krerk",t:F.tries?"Back again, I see. I like that kind of stubbornness":"Welcome. No cameras, no press, no prize money. Just one question"},
 {n:"lada",l:"casual",t:"Five bouts, first to three takes it. I fight last"},
 {n:"coach",t:`Remember, everyone. We trained for ${RG_FPREP[F.prep||"strike"].n} Do what we trained. Don't play their game`}];}
function rgFinalBetween(G,i,me,o,res,w,l){return [
 {n:"nar",t:`${res==="W"?`${me.name} Win ${o.name}`:res==="D"?`${me.name} Tied with ${o.name}`:`${o.name} Win ${me.name}`} · Sirichai ${w} – ${l} Naka League`}];}
function rgFinalWin(G,w,l,beatLadda,ladFid){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin"),looked=ladFid==="fah"&&fah?"Fah":"Manager";return [
 {n:"nar",bg:"naka_underground",t:`Five bouts done. Sirichai ${w} – ${l} Naka League`},
 {n:"nar",show:[{id:"npc:krerk"}],t:"Khun Krerk claps slowly from the second-floor balcony. The sound echoes through the whole warehouse"},
 {n:"npc",who:"Khun Krerk",t:"Congratulations, Sirichai Camp… luck was on your side today"},
 {n:"npc",who:"Khun Krerk",t:"Then I'll see you at the national level"},
 ...(beatLadda?[{n:"nar",show:[{id:"lada",l:"casual"}],t:"Ladda rises slowly from the mat and licks the blood from the corner of her mouth"},{n:"lada",l:"casual",t:"…that was fun"}]
  :[{n:"lada",l:"casual",t:"You beat the team. You haven't beaten me yet"}]),
 {n:"nar",show:[{id:"lada",l:"casual"}],t:`Before following her father out, Ladda stops and looks ${looked} One beat too long. Then she pulls the hood back over her head`},
 ...rgIf(R.c2==="deal",[rin?{n:"rin",f:"happy",l:"casual",t:"Clause 30. Naka League lost to its contract partner, so the contract ends immediately. The money is ours. And our data is ours again"}:{n:"coach",t:"Clause 30… Naka League lost to us, the contract's over, and the money's still ours. Ha!"}]),
 {n:"nar",show:[{id:"baibua"},{id:"tabtim"},{id:"alicia"},{id:"chaba"}],t:"At ringside, the four regional champions have watched since the first bout. No one says a word, but they are all thinking the same thing"},
 {n:"coach",bg:"camp",show:[],t:"Let's go home. Five a.m. tomorrow, same as always"}];}
function rgFinalLose(G,w,l){return [
 {n:"nar",bg:"naka_underground",t:`Five bouts done. Sirichai ${w} – ${l} Naka League`},
 {n:"npc",who:"Khun Krerk",t:"It's all right. The door is still open. Come back whenever you like"},
 {n:"lada",l:"casual",t:"…not enough yet"},
 {n:"coach",t:"Get hurt, remember it, and come back"}];}
/* v1.91.23 (Man): the week after the underground final — Tiger Boss comes without an envelope (once per save) */
function rgTiger(G){const kati=rgIn(G,"kati"),ploy=rgIn(G,"ploy");return [
 {n:"nar",bg:"camp",show:[{id:"npc:tiger_boss"}],t:"The gold sedan pulls up at the camp like always, but this time Boss Suea gets out alone. No envelope, no entourage. He doesn't even take the cigar out of his shirt pocket."},
 {n:"npc",who:"Boss Suea",t:"No need to put your guard up. I'm not here to buy anyone today."},
 {n:"npc",who:"Boss Suea",t:"Naka sent a letter this morning. Every baht to Phayak Thong, cut. The one job Khun Krerk ever gave me was to get Sirichai Camp shut down… and I couldn't do it."},
 {n:"npc",who:"Boss Suea",t:"Every baht since the month Grandpa Chai passed was his. This car too. I was just the man standing in front of the sign."},
 {n:"coach",t:"And when you took our kids away from this camp back then?"},
 {n:"nar",show:[{id:"npc:tiger_boss_cry"}],t:"Boss Suea pulls out his cigar to light it, and it slips from his fingers. He clutches his head and breaks down crying right there at the camp gate."},
 {n:"npc",who:"Boss Suea",img:"tiger_boss_cry",t:"…He gave the order, I did it. I thought I was the tiger. Turns out I was just the nameplate."},
 ...rgIf(kati,[{n:"kati",f:"sad",l:"casual",t:"Boss… the older kids who moved over back then, are they still fighting?"},{n:"npc",who:"Boss Suea",img:"tiger_boss_cry",t:"Every one of them. I'm no good at raising kids, but I never dropped a single one."}]),
 ...rgIf(ploy,[{n:"ploy",l:"casual",t:"So what happens to Phayak Thong now?"},{n:"npc",who:"Boss Suea",img:"tiger_boss_cry",t:"From now on it runs on my own money. A bit smaller… but finally actually mine."},{n:"ploy",f:"happy",l:"casual",t:"…I'll tell the juniors myself that the boss didn't run off."}]),
 {n:"npc",who:"Boss Suea",img:"tiger_boss_cry",t:"Grandpa Chai told me when I was young: a good punch has to land in the right place. …I never listened.",choice:[
   {t:"Offer your hand",then:[{n:"nar",show:[{id:"npc:tiger_boss"}],t:"Boss Suea wipes his face on his sleeve and looks at the hand so long you think he won't take it. Then he does, firmer than you expected."}]},
   {t:"\"See you in the ring.\"",then:[{n:"npc",who:"Boss Suea",t:"Ha! Deal. Phayak Thong's kids will be waiting… on my own money this time."}]},
   {t:"Nod quietly",then:[{n:"nar",t:"Boss Suea picks his cigar up off the ground, nods back, then turns and walks to his car."}]}]},
 {n:"nar",t:"The gold sedan backs out slowly. For the first time, it doesn't honk at the camp gate."}];}
const REGION={
  /* end of week (after the weekly events): the gala the week after the invitation, the contract beat the week after the first cup */
  weekScene(G,done){const R=G.region;if(!R){done();return;}rgApply(G);const now=gameWeek(G);if(lbWeek(G,done))return;
    /* v1.91.26 (Man): Kru Daeng reminds you to watch tape and train the counter before each regional title bout — no new buttons */
    for(const r of RG_ORDER){const c=R.champ[r],x=c&&c.next;if(!c||c.state!=="series"||!x||x.warned)continue;const left=x.abs-now;if(left<1||left>2)continue;
      const me=G.F[c.fid],cf=G.F[this.champId[r]];if(!me||!cf)continue;const tape=G.scoutAbs&&G.scoutAbs[cf.id]!=null&&now-G.scoutAbs[cf.id]<=8,ok=tape&&me.plan&&me.plan.preset===counterPreset(cf);x.warned=1;if(ok)continue;
      playScene([{n:"coach",t:`Regional title bout in ${left} weeks: ${me.name} vs ${RG[r].champ} bout ${x.n||1}`},
        {n:"coach",t:(x.n||1)>1?`Regional champions never fight the same way twice. ${tape?"The tape you watched still counts, but your training has to match it":"Go watch her latest bout first"}, then train the right counter. Switch to fight prep in fight week`
          :`A regional champion isn't a temple-fair opponent. ${tape?"You've seen the tape":"Watch her tape first"}, then train the counter to match what you saw. Switch to fight prep in fight week. Train like that and you'll have the edge from the first round`}],()=>{save();done();},{bg:"camp",look:"casual"});return;}
    /* v1.91.28 round 12: a champion moves in · a camp girl notices a two-timing champion romance · a champion confesses */
    if(R.joinPend&&now>=R.joinPend.abs){const cid=R.joinPend.cid;delete R.joinPend;const S=this.joinSteps(G,cid),k=S.findIndex(x=>x.t==="This week, Sirichai Camp has a new member");this.joinApply(G,cid);
      const B={baibua:"temple",tabtim:"night",alicia:"vector_lab",chaba:"sea"};playScene(S.slice(0,k),()=>playScene(S.slice(k),()=>{save();done();},{bg:"camp",look:"casual"}),{bg:B[cid]||"camp",look:"casual"});return;}
    if(R.twoQ&&now>=R.twoQ.abs){const q=R.twoQ;delete R.twoQ;const g=G.F[q.id];if(g&&g.camp==="player"&&!isAway(G,q.id)&&this.isLovC(G,q.cid)&&RG_TWO[q.id]&&(isPartner(G,q.id)||this.isLovC(G,q.id))){add(G,q.id,"bond",-8);
      playScene([{n:q.id,f:"sad",l:"casual",t:RG_TWO[q.id]},{n:"nar",t:`${g.name} now knows about you and ${G.F[q.cid].name}`}],()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const cid=this.confDue(G);if(cid){playScene(this.confSteps(G,cid),()=>{save();done();},{bg:"camp_night",look:"casual"});return;}}
    if(!R.gala){if(R.galaAbs==null)R.galaAbs=now+1;if(now>=R.galaAbs){R.gala=1;AU.startMusic&&AU.startMusic("hub");playScene(rgGala(G),()=>{save();done();},{bg:"gala",look:"casual"});return;}}
    const r=(R.cups||[])[0],c=r&&R.champ[r];
    if(r&&!R.c1&&c&&now>=(c.wonAbs||0)+1){R.c1="seen";playScene(rgCup1(G,r),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    {const r2=(R.cups||[])[1],c2=r2&&R.champ[r2];if(r2&&!R.c2&&c2&&now>=(c2.wonAbs||0)+1){R.c2="later";playScene(rgCup2(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const r3=(R.cups||[])[2],c3=r3&&R.champ[r3];if(r3&&!R.c3&&c3&&now>=(c3.wonAbs||0)+1){R.c3="seen";playScene(rgCup3(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const F=R.final;if(F&&F.won&&!G.tigerRev&&now>=(F.wonAbs||0)+1){G.tigerRev=1;playScene(rgTiger(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    /* v1.91.47 (playtest): a camp that reaches the closing ceremony on the time limit with only one or two cups still gets Krerk's dinner and Pailin's tablet first — the ceremony and the reveal lean on them */
    if(this.closeDue(G)&&!R.c2){R.c2="later";playScene(rgCup2(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    if(this.closeDue(G)&&!R.c3){R.c3="seen";playScene(rgCup3(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    if(this.closeDue(G)){this.openFinal(G);playScene(rgClose(G),()=>{save();done();},{bg:"closing_ceremony",look:"casual"});return;} /* v1.91.20 round 11 */
    done();},
  /* ---------- state helpers ---------- */
  base(G){return ((G.season||1)-1)*52;},
  beltCount(G,r){const b=(G.region.belts||{})[r]||{};return RG[r].prov.filter(p=>b[p]).length;},
  beltTotal(G){return RG_ORDER.reduce((s,r)=>s+this.beltCount(G,r),0);},
  /* the first week the whole camp is free to travel: after the rest week, nobody else booked, not past week 50 */
  tripWeek(G){const R=G.region,from=Math.max(G.week,/* v1.90.17 (Man): a trip can go this very week, so one every week */ (R.nextTripAbs||0)-this.base(G));
    for(let w=from;w<=RG_LAST_WK;w++){if(!G.bookings.some(b=>b.week===w&&G.F[b.a]&&G.F[b.a].camp==="player")&&!this.nearSeries(G,this.base(G)+w))return w;}return null;},
  /* a championship bout is booked within a week of this one (the camp needs its rest week either side) */
  nearSeries(G,abs,skip){return RG_ORDER.some(r=>{const c=G.region.champ[r];return r!==skip&&c&&c.next&&c.next.abs===abs;});},
  riders(G,wk){return roster(G).filter(f=>!f.injury&&!G.bookings.some(b=>b.week===wk&&(b.a===f.id||b.b===f.id)));},

  /* ---------- booking a belt trip ---------- */
  makeOpp(G,dest,me,abs){const r=ROAD_DEST[dest].r,id=`rg_${dest}_${abs}`;if(G.F[id]){G.F[id].rgSty=G.F[id].rgSty||rgBeltSty(r,id);return id;}
    /* a little under your fighter at the first belt, a little over by the sixteenth; the regional style (tilt) is part of that budget, not on top of it */
    const n=this.beltTotal(G),target=RG_LADDER.belt(n),rng=mulberry32((G.seed||1)+stableHash(id)),tilt=RG[r].tilt;
    const f=baseFighter(id,mkNPC(id,this.oppName(G,dest),"X",Math.min(19,Math.round(target-1)),rng,RG_ORDER.indexOf(r)+2)),base={...f.a};
    const setT=T=>{f.a={...base};f.vet=0;for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);liftOpponent(f,T,20);
      for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.15);};
    f.rg=dest;rgDress(f);f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;setT(RG_FIX.belt(n)+rgEdB(G,"eb"));f.rgT=+(RG_FIX.belt(n)+rgEdB(G,"eb")).toFixed(2);f.camp="quest";f.div="X";f.rg=dest;f.rgSty=rgBeltSty(r,id);rgDress(f);f.sprite="rgp_"+dest;/* v1.89.14: high-level sheet dyed in the province colour */f.color=RG[r].col;f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;
    G.F[id]=f;syncFighterAges(G);return id;},
  purse(G){const n=this.beltTotal(G),w=Math.round((10000+n*800)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  book(G,dest,fid){const R=G.region,D=ROAD_DEST[dest],me=G.F[fid];if(!R||!D||!me)return {ok:false,why:"Missing data"};
    if(R.trip)return {ok:false,why:"A trip is already planned"};if((R.belts[D.r]||{})[dest])return {ok:false,why:"Already won this province's belt"};
    const wk=this.tripWeek(G);if(!wk)return {ok:false,why:"No free week left to travel this year"};
    if(!this.riders(G,wk).some(f=>f.id===fid))return {ok:false,why:`${me.name} isn't fit to travel`};
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs);if(G.cash<P.total)return {ok:false,why:"Not enough money for the trip"};
    const opp=this.makeOpp(G,dest,me,abs),pay=this.purse(G),bid=`rg${abs}_${dest}`;
    G.bookings.push({id:bid,a:fid,b:opp,week:wk,tier:"region",rounds:3,win:pay.win,lose:pay.lose,region:{r:D.r,dest},bg:dest==="chanthaburi"?"bg_region_east.webp":`bg_ring_${dest}.webp`});
    G.cash-=P.total;G.offers=(G.offers||[]).filter(o=>o.week!==wk);
    R.trip={abs,season:G.season||1,wk,dest,fid,opp,bid,cost:P.total,car:P.car,fat:P.fat,quick:this.canQuick(G,dest)&&!!R.quickPref};
    G.log=G.log||[];G.log.push(`Trip planned to ${D.name} week ${wk} · travel cost ${fmt(P.total)}`);return {ok:true,wk,cost:P.total};},
  cancel(G){const R=G.region,T=R&&R.trip;if(!T)return false;G.bookings=G.bookings.filter(b=>b.id!==T.bid);G.cash+=T.cost;
    (R.gc=R.gc||[]).push(T.opp);R.trip=null;return true;},

  /* ---------- results + weekly upkeep ---------- */
  flush(G){const R=G.region;if(R)rgApply(G);if(R&&R.joined)this.joinSkills(G);if(R)this.bondSync(G);if(!R||!R.pend||!R.pend.length)return;const done=R.pend.splice(0);
    for(const p of done){const rg=p.region||{},r=rg.r,dest=rg.dest,D=ROAD_DEST[dest];if(rg.nlfinal){if(R.final){R.final.cur=R.final.cur||{};R.final.cur[rg.nlfinal]=p.res||"L";}continue;}if(rg.nlleg){this.legResult(G,rg.nlleg,p);continue;}if(!D||!RG[r])continue;
      if(rg.series){this.seriesResult(G,r,p);continue;}
      rgTouch(G,RG_CID[r]);const T=R.trip,abs=T&&T.bid===p.bid?T.abs:gameWeek(G);
      if(p.res==="W"){R.belts[r]=R.belts[r]||{};R.belts[r][dest]=1;G.log=G.log||[];G.log.push(`${G.F[p.a]?G.F[p.a].name:""} wins the provincial belt of ${D.name}!`);if(G.F[p.a])recordHonor(G,"rgbelt",p.a,G.F[p.a].div,G.week,dest); /* v1.91.14 (Man): a province belt gets the same ceremony as the main game */
        if(this.beltCount(G,r)===4&&R.champ[r].state==="locked"){R.champ[r].state="letter";this.champFighter(G,r);
          addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`${RG_TITLE[r]}: all four belts won`,body:RG_CH[r].letter+((t=>t?`\n\n(${t})`:"")(this.tipText(G,r)))});}}
      R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);(R.gc=R.gc||[]).push(p.b);}},
  /* weekly: post-cup letters and champion chats */
  letters(G){const R=G.region,now=gameWeek(G);R.postDone=R.postDone||{};
    for(const r of RG_ORDER){if(R.post&&R.post[r]!=null&&now>=R.post[r]&&!R.postDone[r]&&RG_POST[r]){R.postDone[r]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`A letter from ${RG[r].champ}`,body:RG_POST[r]});}
      const cid=RG_CID0[r],c=R.champ[r]||{},open=RG_CHAT[cid]&&G.F[cid]&&((R.joined&&R.joined[cid])||c.visit==="done"||c.state==="won"||rgEd(G)>=2);G.chatIn=G.chatIn||{};
      if(open&&!G.chatIn[cid]&&now-((G.chatLastAbs||{})[cid]??-999)>=2&&mulberry32((G.seed||1)+now*31+cid.length)()<.45)G.chatIn[cid]=G.week;}},
  fade(G){const R=G.region,now=gameWeek(G),m=R.meet||{};R.meetT=R.meetT||{};R.miss=R.miss||{};
    for(const r of RG_ORDER){const cid=RG_CID0[r];if(!(m[cid]>0))continue;if(R.meetT[cid]==null){R.meetT[cid]=now;continue;}if(R.joined&&R.joined[cid])continue;
      const gap=now-R.meetT[cid];
      if(gap>=3&&!R.miss[cid]){R.miss[cid]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`A letter from ${RG[r].champ}`,body:RG_MISS[r]});}
      if(gap>=4){const pk=(R.meetPk||{})[cid]||m[cid],fl=RG_FLOOR.find(t=>pk>=t)||0;if(m[cid]>fl)m[cid]=Math.max(fl,Math.round((m[cid]-.25)*100)/100);}}},
  weekly(G){const R=G.region;rgApply(G);this.flush(G);this.seriesWeekly(G);this.fade(G);this.letters(G);this.finalWeekly(G);this.joinWeekly(G);this.joinPerks(G);this.loopWeekly(G);const T=R.trip;
    /* a trip whose bout vanished (the week went by, the booking was dropped) is let go */
    if(T&&gameWeek(G)>T.abs&&!G.bookings.some(b=>b.id===T.bid)){(R.gc=R.gc||[]).push(T.opp);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,T.abs+RG_TRIP_GAP);}
    const keep=new Set(G.bookings.map(b=>b.b));R.gc=(R.gc||[]).filter(id=>{if(keep.has(id))return true;if(G.F[id]&&G.F[id].rg)delete G.F[id];return false;});},

  /* ---------- the trip week: drive → bout → hotel → home (round 2) ---------- */
  champId:{north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"},
  hotelBg:{north:"night_north",isan:"night_isan",central:"night_central",south:"night_south"},
  trip(b,done){if(b.region&&b.region.series){this.seriesTrip(b,done);return;}
    const R=G.region,T=R&&R.trip&&R.trip.bid===b.id?{...R.trip}:null,dest=b.region&&b.region.dest;rgDress(G.F[b.b]);
    if(!T||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const P=roadPlan(G,dest,T.car||null,T.abs);
    /* v1.91.50 (playtest): a quick trip to a region you know — no drive, no hotel menu, no shop; the nights are rest */
    if(T.quick&&this.canQuick(G,dest)){this.arrive(G,T,P,null);openFight(b,()=>{const n=P.nights||0;if(n){for(const f of roadRiders(G))f.fatigue=Math.max(0,(f.fatigue||0)-10*n);}
      G.log=G.log||[];G.log.push(`Back at camp from ${ROAD_DEST[dest].name}${n?` · rested at the hotel ${n} night(s), fatigue −${10*n}`:""}`);save();done();});return;}
    ROAD.open(dest,{paid:true,plan:P,onArrive:(P2,front)=>{this.arrive(G,T,P2||P,front);const go=()=>openFight(b,()=>this.night(T,P2||P,1,done)),A=this.firstArrive(G,ROAD_DEST[dest].r,dest);
      if(A){playScene(A,go,{bg:"gas_station",look:"casual"});}else go();}});},
  /* the first trip into a region: its champion comes to meet the camp on the way in */
  firstArrive(G,r,dest){const R=G.region;R.arrived=R.arrived||{};if(R.arrived[r]||!RG_ARRIVE[r])return null;R.arrived[r]=1;rgTouch(G,RG_CID[r]);return RG_ARRIVE[r](G,ROAD_DEST[dest]);},
  /* road fatigue for everyone on board (the fighter only half: the corner keeps her off her feet) · the shotgun seat is a small moment */
  arrive(G,T,P,front){const fat=P.fat||0;for(const f of roadRiders(G)){const k=f.id===T.fid?.5:1;f.fatigue=Math.min(100,(f.fatigue||0)+Math.round(fat*k));}
    if(front&&G.F[front]){add(G,front,"bond",1);G.F[front].morale=Math.min(100,(G.F[front].morale||0)+2);}
    G.log=G.log||[];G.log.push(`The whole camp arrives in ${ROAD_DEST[T.dest].name} · fatigue +${fat}`);},
  /* night n of the trip. Far trips stay over (1–2 nights); a day trip may stay one extra night if you pay for the rooms */
  night(T,P,n,done){const D=ROAD_DEST[T.dest],r=D.r,nights=P.nights||0;
    /* after the cup: the champion's private night takes the place of the first hotel night (even on a day trip) */
    if(T.cupNight&&n===1){playScene(RG_CH[r].night(G,T),()=>{T.cupNight=0;this.night(T,P,2,done);},{bg:RG_CH[r].nightBg,look:"casual"});return;}
    {const X=RG_TRIPX[T.dest],tx=G.region.tx=G.region.tx||{};if(n===1&&X&&!tx[T.dest]&&!T.series){tx[T.dest]=1;rgTouch(G,RG_CID[r]);playScene(X.steps(G,T),()=>this.night(T,P,n,done),{bg:X.bg,look:"casual"});return;}}
    if(n>nights){if(nights===0&&n===1&&!T.extra&&!T.series){const rooms=Math.ceil((P.people||roadRiders(G).length)/2),cost=rooms*ROAD_ROOM;
        playScene([{n:"nar",t:`The bout in ${D.name} is over. Everyone waits by the car.`,choice:[
          {t:"Head back to camp",then:[{n:"nar",t:"The car pulls out of town, and everyone is asleep before you even leave the province."}]},
          {t:`Stay one more night (rooms ${fmt(cost)})`,fx:G2=>{if(G2.cash<cost){T.extraNo=1;return;}G2.cash-=cost;T.extra=1;}}]}],
          ()=>{if(T.extra)this.night(T,{...P,nights:1},1,done);else{if(T.extraNo)toast("Not enough money for the rooms, so back to camp for now");this.home(T,done);}},{bg:this.hotelBg[r],look:"casual"});return;}
      return this.home(T,done);}
    const cid=this.champId[r],C=RG[r],girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b)=>(b.bond||0)-(a.bond||0)).slice(0,3);
    const top=girls[0],jeal=top&&(top.bond||0)>=40?top:null;
    const choice=[{t:`Go for a walk with ${C.champ} (champion of ${C.name})`,fx:G2=>{rgMeet(G2,cid,3);if(jeal)jeal.morale=Math.max(0,(jeal.morale||0)-3);},
        then:[...this.dateLines(cid,D),...(jeal?[{n:jeal.id,f:"pout",l:"casual",t:this.jealLine(jeal.id,C.champ)}]:[])]},
      ...girls.map(g=>({t:`Take ${g.name} around ${D.name}`,fx:G2=>{add(G2,g.id,"bond",2);g.morale=Math.min(100,(g.morale||0)+4);},then:[{n:g.id,f:"happy",l:"casual",t:this.girlLine(g.id,D.name)}]})),
      {t:"Rest and recover",fx:G2=>{for(const f of roadRiders(G2))f.fatigue=Math.max(0,(f.fatigue||0)-10);},then:[{n:"nar",t:"Everyone turns in early and wakes up fresh · fatigue −10"}]},
      {t:"Light training in the hotel parking lot",fx:G2=>{for(const f of roadRiders(G2)){f.exp=(f.exp||0)+6;f.fatigue=Math.min(100,(f.fatigue||0)+2);}},then:[{n:"nar",t:"Pad work under the parking-lot lights until the hotel guard comes to watch · EXP +6"}]}];
    playScene([{n:"nar",t:nights>1?`Night ${n} in ${D.name}`:`The whole camp stays the night in ${D.name}`},{n:"nar",t:"What shall we do tonight?",choice}],()=>this.night(T,P,n+1,done),{bg:this.hotelBg[r],look:"casual"});},
  home(T,done){if(!T.shopDone){T.shopDone=1;this.shop(T,()=>this.home(T,done),1);return;}G.log=G.log||[];G.log.push(`Back at camp from ${ROAD_DEST[T.dest].name}`);save();done();},
  /* v1.89.23: the souvenir shop on the way out of town — the only place regional souvenirs are sold; keep buying until you get back on the bus */
  shopIntro:{north:"On the way home the bus stops at a roadside souvenir shop. Paper umbrellas hang in rows; fine handwoven cloth lies folded on a wooden table.",
    isan:"On the way out of town the bus stops at the provincial silk centre. Triangle pillows are piled like a mountain; Praewa silk hangs behind glass.",
    central:"Before heading home the bus stops at a roadside Thai crafts shop. Khon masks stare down from the walls; Benjarong cups line the shelves.",
    south:"On the way out of town the bus stops at a seaside souvenir shop. Shadow puppets glow in the shopfront; pearls sit in a glass case."},
  shop(T,next,first){const r=ROAD_DEST[T.dest].r,L=SOUV_IDS.filter(k=>GIFTS[k].souv===r);if(!L.length){next();return;}
    G.souv=G.souv||{};const st={};
    const choice=[...L.map(k=>({t:`Buy ${GIFTS[k].name} (${fmt(GIFTS[k].price)}${G.souv[k]?` · own ${G.souv[k]}`:""})`,
        fx:G2=>{if(G2.cash<GIFTS[k].price){st.no=1;return;}G2.cash-=GIFTS[k].price;G2.souv=G2.souv||{};G2.souv[k]=(G2.souv[k]||0)+1;st.got=k;}})),
      {t:first?"Nothing today, back on the bus":"That's enough, back on the bus",fx:()=>{st.end=1;}}];
    const head=first?[{n:"nar",t:this.shopIntro[r]},{n:"nar",t:"Souvenirs aren't cheap, but the girls will love them · buy now, give later (shops like this only on trips)"}]:[];
    playScene([...head,{n:"nar",t:first?"Pick up anything to take home?":"Anything else?",choice}],()=>{
      if(st.end){next();return;}if(st.no)toast("Not enough money");if(st.got)toast(`Bought: ${GIFTS[st.got].name} · give it from the Gift button`);this.shop(T,next,0);},{bg:this.hotelBg[r],look:"casual"});},
  dateLines(cid,D){const L={
    baibua:[{n:"npc",who:"Baibua",t:`The walking street's crowded tonight, jao… if we get separated, you can hold on to my sleeve, jao.`},{n:"nar",t:"Baibua walks slowly so you can keep up. Your hands almost touch a few times, but neither of you says anything."}],
    tabtim:[{n:"npc",who:"Tabtim",t:"Let's go eat som tam, de! This stall's real spicy… haha, I'm crying already, ai!"},{n:"nar",t:"Tabtim laughs loud enough for the whole stall to hear, but when you hand her a tissue she goes quiet for a moment."}],
    alicia:[{n:"npc",who:"Alicia",t:"Don't get the wrong idea. I just wanted someone to walk with. The camera's off tonight…"},{n:"nar",t:"Alicia leaves her phone face down on the table all night. She never picks it up once."}],
    chaba:[{n:"npc",who:"Chaba",t:"…The sea is pretty at night."},{n:"nar",t:"Chaba says nothing more, but she stays beside you until the tide reaches her ankles."}]};
    return L[cid]||[{n:"nar",t:`An evening walk in ${D.name}`}];},
  jealLine(id,champ){const L={kati:`You went walking with ${champ}? …No, I'm not asking.`,mali:`Mali saw that~ You went out with ${champ}, right? …Mali wants to go too.`,
    rin:`Out with ${champ} for two hours twelve minutes. I wasn't timing it. I just happened to look at my watch.`,ploy:`Out with ${champ}, huh? Good for you. …Why are you even asking?`,fah:`Oh, so you went out with ${champ}, huh! Fah's not sulking! Just… hungry!`};return L[id]||"…";},
  girlLine(id,city){const L={kati:`The night market in ${city} has so many sweets… could you buy me one? Just one, really.`,mali:`${city} is so pretty at night~ Thank you for bringing Mali. I'll remember this.`,
    rin:`I noted three good places to eat in ${city}. Let's hit the first one; we have just enough time.`,ploy:`Didn't ask you to bring me. …But, thanks.`,fah:`${city} has so much weird food! Fah's trying all of it. Manager's paying!`};return L[id]||`Tonight in ${city} was fun.`;},

  /* ---------- the championship series: 3 bouts, first to 2 wins (round 3) ---------- */
  /* the champion as a fighter: her own sheet, special move and perk; sized against your fighter before every bout */
  champFighter(G,r,me){this.treeInit();const C=RG[r],H=RG_CH[r],id=this.champId[r];let f=G.F[id];
    if(!f){const rng=mulberry32((G.seed||1)+stableHash(id));f=baseFighter(id,mkNPC(id,C.champ,"X",14,rng,RG_ORDER.indexOf(r)+2));
      Object.assign(f,{name:C.champ,nick:C.nick,color:C.col,canon:true,camp:"region",div:"X",fatigue:0,injury:0,morale:75});G.F[id]=f;syncFighterAges(G);}
    const NC=G.region.nc&&G.region.nc[r];f.pfx=H.perk.fx;f.canon=!NC;f.camp="region";if(NC){f.sprite="rgp_"+NC.home;f.color=C.col;f.name=C.champ;}
    if(me){const cups=(G.region.cups||[]).length,c=G.region.champ[r],ceil=RG_LADDER.champ(cups,c.tries),tilt=C.tilt;
      f.lvl=Math.max(me.lvl||1,1)+3+Math.min(2,cups)/* v1.90.20 (Man): regional champions 3–5 levels above */;f.fatigue=0;f.injury=0;f.morale=75;
      /* re-fit only when your fighter or the stakes changed (this runs before every bout) */
      const key=[cups,c.tries||0,rgEd(G)].join("|");
      if(f.rgKey!==key){const setT=T=>{f.vet=0;for(const k in f.a)f.a[k]=Math.max(1,Math.min(20,T-.6));for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);
          liftOpponent(f,T,20);for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.12);};
        const T=RG_FIX.champ(cups,c.tries)+rgEdB(G,G.region.nc&&G.region.nc[r]?"nb":"cb")-(RG_SK_ADJ[r]||0)-(RG_SK_CUP[r]||0)*Math.min(3,cups); /* a lost series makes the rematch a little easier (v1.90.14) */setT(T);f.rgT=+T.toFixed(2);f.rgKey=key;}
      /* her tree is built at a fixed level (35 + cups, max 37) — never from your fighter's level, so heavy and casual players meet the same champion (v1.90.21 rule) */
      {const tl=RG_CH_SKLV+Math.min(2,cups);if(f.rgSkLv!==tl&&hasTree(id)){const lv=f.lvl;f.lvl=tl;this.autoLearn(G,id);f.lvl=lv;f.rgSkLv=tl;}}}
    return f;},
  seriesPurse(G){const cups=(G.region.cups||[]).length,w=Math.round((30000+cups*6000)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  /* the first week from `from` that suits a championship bout: weeks 1–50, the camp home and rested, no other trip next to it */
  spot(G,r,from){const c=G.region.champ[r],T=G.region.trip;
    for(let abs=Math.max(from,gameWeek(G)+1),i=0;i<80;abs++,i++){const season=Math.floor((abs-1)/52)+1,wk=abs-(season-1)*52;if(wk<2||wk>RG_LAST_WK)continue;
      if(T&&T.abs===abs)continue;if(this.nearSeries(G,abs,r))continue;
      if(season===(G.season||1)&&G.bookings.some(b=>b.week===wk&&G.F[b.a]&&G.F[b.a].camp==="player"))continue;
      return {abs,season,wk};}return null;},
  schedule(G,r,from){const c=G.region.champ[r],s=this.spot(G,r,from);if(!s){c.next=null;return null;}
    c.next={...s,bid:`rgc_${r}_${s.abs}`,n:(c.n||0)+1};this.ensureBooking(G,r);return c.next;},
  ensureBooking(G,r){const c=G.region.champ[r],x=c.next;{const cf=G.F[this.champId[r]];if(x&&cf&&RG_CH[r].sty)cf.rgSty=RG_CH[r].sty[Math.min(2,Math.max(1,x.n||1)-1)];}if(!x||x.season!==(G.season||1)||x.wk<G.week||G.bookings.some(b=>b.id===x.bid))return;
    const me=G.F[c.fid];if(!me||me.camp!=="player")return;const cid=this.champId[r];this.champFighter(G,r,me);const pay=this.seriesPurse(G);
    G.bookings.push({id:x.bid,a:c.fid,b:cid,week:x.wk,tier:"region",rounds:5,win:pay.win,lose:pay.lose,region:{r,dest:RG[r].fin,series:x.n},bg:`bg_region_${RG_CH[r].ring}.webp`});
    G.offers=(G.offers||[]).filter(o=>o.week!==x.wk);},
  /* the letter came: pick the fighter who carries the whole series */
  startSeries(G,r,fid){const c=G.region.champ[r],me=G.F[fid];if(!c||c.state!=="letter"||!me||me.camp!=="player")return {ok:false,why:"Can't pick that fighter"};
    if(this.overTime(G))return {ok:false,why:"This Clash of the Four Regions is over · challenge again in the next edition"};
    Object.assign(c,{state:"series",fid,w:0,l:0,n:0,next:null});this.champFighter(G,r,me);
    const s=this.schedule(G,r,gameWeek(G)+1);if(!s){c.state="letter";c.fid=null;return {ok:false,why:"There aren't enough free weeks left this year for a title series"};}
    G.log=G.log||[];G.log.push(`${RG_TITLE[r]}: ${me.name} vs ${RG[r].champ} · bout 1, week ${s.wk}${s.season!==(G.season||1)?` (next year)`:""}`);
    return {ok:true,s};},
  seriesResult(G,r,p){const R=G.region,c=R.champ[r];if(!c||c.state!=="series")return;rgTouch(G,RG_CID[r]);const abs=c.next?c.next.abs:gameWeek(G),me=G.F[c.fid];
    c.n=(c.n||0)+1;if(p.res==="W")c.w++;else if(p.res==="L")c.l++;c.next=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);G.log=G.log||[];
    if(c.w>=2){c.state="won";c.wonAbs=abs;(R.post=R.post||{})[r]=abs+1;R.cups=R.cups||[];if(!R.cups.includes(r))R.cups.push(r);G.cash+=RG_CUP_PRIZE;G.rep+=4;
      if(me){G.honors=G.honors||[];const key=`${G.season||1}:rg_${r}:${me.div}::${me.id}`;if(!G.honors.some(h=>h.key===key))G.honors.push({key,season:G.season||1,week:G.week,id:me.id,div:me.div,kind:"rg_"+r});}
      rgMeet(G,this.champId[r],4);R.just={r,kind:"cup",res:p.res,w:c.w,l:c.l};
      G.log.push(`${HONOR_LABEL["rg_"+r]}: ${me?me.name:""} ${c.w}-${c.l} ${RG[r].champ} · prize ${fmt(RG_CUP_PRIZE)}`);return;}
    if(c.l>=2){c.state="lost";c.tries=(c.tries||0)+1;c.letterAbs=abs+2;R.just={r,kind:"lost",res:p.res,w:c.w,l:c.l};
      G.log.push(`${RG_TITLE[r]}: ${RG[r].champ} keeps the title ${c.l}-${c.w}`);return;}
    R.just={r,kind:"bout",res:p.res,w:c.w,l:c.l,n:c.n};const s=this.schedule(G,r,abs+2); /* v1.90.17 (Man): bouts two weeks apart */
    /* between bout 1 and bout 2 the champion drops by the camp (round 4) — missed if bout 2 comes first */
    if(c.n===1&&!c.visit){c.visit="due";addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`${RG[r].champ} is dropping by the camp`,body:`${RG[r].champ} sent word she'll drop by the camp before bout 2

Welcome her at Fights › Four Regions Cup`});}
    else if(c.n>=2&&c.visit==="due")c.visit="missed";
    G.log.push(`${RG_TITLE[r]} bout ${c.n}: ${p.res==="W"?"Win":p.res==="L"?"Loss":"Draw"} · score ${c.w}-${c.l}${s?` · next bout in week ${s.wk}`:""}`);},
  /* weekly: a hurt fighter gets the bout moved, a dropped bout is rescheduled, a lost series sends a new letter later */
  seriesWeekly(G){const R=G.region,now=gameWeek(G);
    {const n=(R.cups||[]).length;if(!R.close&&!R.endWarn&&n>=1&&n<4&&now>=(R.startAbs||0)+130){R.endWarn=1; /* v1.91.47: half a year of warning before the time limit */
      addMail(G,{kind:"letter",from:"NAGA Energy Drink",title:"Clash of the Four Regions: about half a year left",body:"Dear Manager of Sirichai Camp,\n\nThis Clash of the Four Regions closes in about half a year. After that there will be no new challenges to the regional champions. Any series still under way will be fought to the end, and then comes the closing ceremony in Bangkok.\n\nIf there are cups left to win, win them before time runs out.\n\nNaka Energy Drink · Drink Naka, fight without end!"});}}
    for(const r of RG_ORDER){const c=R.champ[r];if(!c)continue;
      if(c.state==="lost"&&now>=(c.letterAbs||0)&&!this.overTime(G)){c.state="letter";c.fid=null;c.w=0;c.l=0;c.n=0;
        addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`${RG_TITLE[r]}: a new challenge`,body:RG_CH[r].again+((t=>t?`\n\n(${t})`:"")((this.tipFor(G,r,true),this.tipText(G,r))))});continue;}
      if(c.state!=="series")continue;const me=G.F[c.fid];
      if(!me||me.camp!=="player"){G.bookings=G.bookings.filter(b=>!(c.next&&b.id===c.next.bid));Object.assign(c,{state:"letter",fid:null,w:0,l:0,n:0,next:null});continue;}
      const x=c.next;
      if(!x){this.schedule(G,r,now+1);continue;}
      const booked=G.bookings.find(b=>b.id===x.bid),pend=(R.pend||[]).some(p=>p.bid===x.bid);
      if(x.abs<now&&!booked&&!pend){this.postpone(G,r,now+2,"The bout didn't go ahead as booked");continue;}
      if(x.abs===now&&me.injury>0){G.bookings=G.bookings.filter(b=>b.id!==x.bid);this.postpone(G,r,now+me.injury+1,`${me.name} is still injured`);continue;}
      this.ensureBooking(G,r);}},
  postpone(G,r,from,why){const c=G.region.champ[r];c.next=null;const s=this.schedule(G,r,from);
    addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`Bout postponed: ${RG_TITLE[r]}`,
      body:`${why} · the organiser has moved bout ${(c.n||0)+1}${s?` to week ${s.wk}${s.season!==(G.season||1)?` (next year)`:""}`:""}\n\n${RG_CH[r].wait}`});},
  /* the championship trip: drive (paid by the sponsor) → the champion before the bell → the bout → cup or hotel → home */
  seriesTrip(b,done){const r=b.region.r,c=G.region.champ[r],dest=RG[r].fin;
    if(!c||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const abs=c.next?c.next.abs:gameWeek(G),P=roadPlan(G,dest,null,abs),T={abs,dest,fid:b.a,series:1,bid:b.id};G.region.just=null;
    ROAD.open(dest,{paid:true,sponsor:true,plan:P,onArrive:(P2,front)=>{const PP=P2||P;this.arrive(G,T,PP,front);
      playScene(this.preBout(r,b),()=>openFight2(b,()=>this.afterBout(T,PP,done)),{bg:"rg_"+RG_CH[r].ring,look:"fight"});}});},
  preBout(r,b){const c=G.region.champ[r],H=RG_CH[r],cid=this.champId[r],me=G.F[b.a],n=b.region.series,sc=`${c.w}-${c.l}`;
    const head={n:"nar",t:`${H.venue} · ${RG_TITLE[r]} bout ${n}${n>1?` · score ${me.name} ${sc} ${RG[r].champ}`:""}`};
    const line=n===1?H.pre[0]:c.w===1&&c.l===1?H.pre[2]:H.pre[1];
    const NC=G.region.nc&&G.region.nc[r];const mine=CANON_IDS.includes(me.id)?[{n:me.id,f:"angry",l:"fight",...(NC?{}:{with:cid}),t:me.id===H.pair?H.pairLine:H.reply}]:[{n:"nar",t:`${me.name} nods and walks back to the red corner`}];
    return [head,...(rgEd(G)>=2&&n===1&&!NC?[{n:"nar",t:`${RG[r].champ} kept the regional title for another reign, and is stronger than three years ago`}]:[]),{...this.spk(r,n===1?"happy":"angry","fight"),t:line(me.name)},...mine];},
  afterBout(T,P,done){const R=G.region,J=R.just;R.just=null;const r=ROAD_DEST[T.dest].r,H=RG_CH[r],cid=this.champId[r];
    if(!J){this.home(T,done);return;}
    if(J.kind==="cup"){AU.startMusic&&AU.startMusic("victory");AU.sfx&&AU.sfx("champ");
      {const aw={kind:"rg_"+r,key:"cup"+r};AU.startMusic("victory");AU.sfx("champ");playScene(H.cup(G,J),()=>{AU.startMusic("hub");T.cupNight=rgEd(G)===1?1:0;this.night(T,P,1,done);},{bg:"rg_"+H.ring,look:"fight",award:aw});
        [600,1300,2200,3300,4700,6200].forEach(ms=>setTimeout(()=>{if(UI.scene&&UI.scene.award===aw)AU.sfx("pop");},ms));}return;} /* v1.91.14: the cup gets the ceremony overlay, fireworks and the victory song */
    const steps=J.kind==="lost"?H.lost(G,J):[{...this.spk(r,J.res==="W"?"sad":"happy","fight"),t:(J.res==="W"?H.lose:H.win)[Math.min(2,(J.n||1)-1)]},
      {n:"nar",t:`Score now ${J.w}-${J.l} · next bout in about 2 weeks`}];
    playScene(steps,()=>this.night(T,P,1,done),{bg:"rg_"+H.ring,look:"fight"});},
  /* the series fighter picker (modal) */
  /* v1.91.50 (playtest): Daeng watches the champion's tapes and says who fits — a player sending the wrong girl lost a series ten times without knowing why */
  tipFor(G,r,force){const R=G.region,c=R&&R.champ[r];if(!c)return null;const now=gameWeek(G);if(!force&&c.tip&&now-(c.tip.abs||0)<8)return c.tip;
    const pool=roster(G).filter(f=>f.camp==="player").sort((a,b)=>effOvr(G,b)-effOvr(G,a)).slice(0,6);if(pool.length<2)return null;
    const sc=pool.map(me=>{const o=this.champFighter(G,r,me);let w=0;const N=16;for(let i=1;i<=N;i++){const x=quickFight(me,o,stableHash(me.id+r)+i*977,5);if((x.result||x).win==="A")w++;}return [me.id,w/N];}).sort((a,b)=>b[1]-a[1]);
    const top=sc[0][1],good=sc.filter(x=>x[1]>=top*.8).slice(0,2).map(x=>x[0]),bad=sc.filter(x=>x[1]<=top*.45).slice(-2).map(x=>x[0]);
    c.tip={abs:now,good,bad};return c.tip;},
  tipText(G,r){const t=this.tipFor(G,r);if(!t||!t.good.length)return "";const nm=(ids,j)=>ids.filter(id=>G.F[id]).map(id=>G.F[id].name).join(j);
    return `Coach Daeng watched the tapes of ${RG[r].champ} · best match: ${nm(t.good," or ")}${t.bad.length?` · not yet: ${nm(t.bad,", ")}`:""}`;},
  seriesHTML(r){const C=RG[r],H=RG_CH[r],c=G.region.champ[r],R=roster(G).filter(f=>!f.injury);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const pay=this.seriesPurse(G);
    return `<h2>${esc(RG_TITLE[r])}</h2><p class="meta">${esc(C.champ)} · ${esc(C.nick)} · venue ${esc(ROAD_DEST[C.fin].name)}</p>
     <div class="kv-row"><span>Format</span><b>Best of 3 · 5 rounds each · about 2 weeks apart</b></div>${(G.region.champ[r].tries||0)?`<div class="kv-row"><span>Rematch</span><b class="goldt">Series lost so far: ${G.region.champ[r].tries} · the camp knows this champion's game better now</b></div>`:""}
     ${(t=>t?`<p class="goldt rg-tip">📼 ${esc(t)}</p>`:"")(this.tipText(G,r))}
     <div class="kv-row"><span>Strength of ${esc(C.champ)}</span><b>${esc(H.perk.name)}</b></div><p class="meta">${esc(H.perk.desc)}</p>
     <div class="kv-row"><span>Purse per bout</span><b class="num">${fmt(pay.win)} / loss ${fmt(pay.lose)}</b></div><div class="kv-row"><span>Cup prize</span><b class="num">${fmt(RG_CUP_PRIZE)}</b></div>
     <h3>Who fights the whole series</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgsfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">Nobody is fit to fight</p>`}
     <p class="meta">Once picked, she fights the whole series · an injury postpones the bout · the organiser pays travel for every bout ${c.tries?` · attempt ${c.tries+1}`:""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">Not now</button><button class="btn primary" data-act="rgsgo" data-v="${r}" ${UI.rgFid?"":"disabled"}>Accept the challenge</button></div>`;},
  finRow(r){const C=RG[r],c=G.region.champ[r]||{},n=this.beltCount(G,r),F=ROAD_DEST[C.fin],me=G.F[c.fid];
    const st=c.state==="won"?`<span class="rg-belt">🏆 Cup won</span>`:n<4?`<span class="meta">🔒 Win all 4 belts first (${n}/4)</span>`
      :c.state==="letter"?`<button class="btn sm gold" data-act="rgser" data-v="${r}">Pick a title fighter</button>`
      :c.state==="series"?`<span class="meta">${me?esc(me.name):""} ${c.w}-${c.l}${c.next?` · bout ${c.next.n} week ${c.next.wk}${c.next.season!==(G.season||1)?` (next year)`:""}`:""}</span>${c.visit==="due"?`<button class="btn sm gold" data-act="rgvisit" data-v="${r}">Welcome ${esc(C.champ)} to camp</button>`:c.visit==="done"?`<button class="btn sm" data-act="rgduel" data-v="${r}">Practice duel</button>`:""}`
      :c.state==="lost"?`<span class="meta">${esc(C.champ)} kept her title · ${this.overTime(G)?"this edition's time is up":"waiting for a new challenge letter"}</span>`:`<span class="meta">✉️ Waiting for the champion's letter</span>`;
    const chat=G.chatIn&&G.chatIn[RG_CID[r]]&&G.F[RG_CID[r]]?`<button class="btn sm gold" data-act="rgchat" data-v="${RG_CID[r]}">💬 ${esc(C.champ)} sent a message</button>`:"";
    const R=G.region,cid=RG_CID[r],gap=(R.meet||{})[cid]>0&&(R.meetT||{})[cid]!=null?gameWeek(G)-R.meetT[cid]:0;
    return `<div class="rg-prov rg-fin"><span><b>${esc(F.name)}</b> <small>regional championship ring</small>${gap>=3?`<small class="rg-miss">💭 ${gap} weeks since you last saw ${esc(C.champ)}</small>`:""}</span>${chat}${st}</div>`;},

  /* ---------- screens ---------- */
  css(){if(typeof document==="undefined"||document.getElementById("rg-css"))return;const st=document.createElement("style");st.id="rg-css";
    st.textContent=`.rg-head{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between}.rg-head h3{margin:0}
.rg-stats{display:flex;gap:.4rem;flex-wrap:wrap}.rg-final{border-top:6px solid #1a1a1a;background:linear-gradient(180deg,#2a1414 0,#160c0c 100%);color:#f3e6e6}.rg-final h3,.rg-final h4{color:#ff5a5a}.rg-final .meta{color:#d9bcbc}.rg-final.won{border-top-color:#d4a52a}.rg-fprep button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;max-width:22rem}.rg-fprep small{opacity:.8;font-size:.72rem;white-space:normal}.rg-fprep button,.rg-fprep button *{text-align:left!important;align-self:stretch}.rg-nl .kv-row{border-bottom:1px dashed rgba(255,255,255,.15)}.rg-slot{margin:.4rem 0 .7rem;padding:0 .9rem .4rem 0;border-bottom:1px dashed rgba(0,0,0,.2)}.rg-slot .kv-row{flex-wrap:wrap;gap:4px 12px}.rg-slot .kv-row small{margin-left:auto}.m-rgfline{max-width:580px;background:linear-gradient(180deg,#120a1e,#0b0812);color:#fff}.m-rgfline .meta{color:#c9c0dc}.vs-head{display:flex;align-items:center;justify-content:center;gap:.6rem;margin:.2rem 0 .3rem;font-weight:900;letter-spacing:.02em}.vs-tl,.vs-tr{flex:1;padding:.35rem .6rem;font-size:1.05rem;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5)}.vs-tl{text-align:right;background:linear-gradient(90deg,transparent,#c0182a);clip-path:polygon(0 0,100% 0,92% 100%,0 100%)}.vs-tr{text-align:left;background:linear-gradient(90deg,#1d4fe0,transparent);clip-path:polygon(8% 0,100% 0,100% 100%,0 100%)}.vs-sc{font-size:1.7rem;min-width:3.4rem;text-align:center;color:#ffd84a;text-shadow:0 0 12px rgba(255,216,74,.5)}.vs-sub{text-align:center;font-size:.72rem;margin:0 0 .5rem}.vs-rows{display:flex;flex-direction:column;gap:6px}.vs-row{display:grid;grid-template-columns:1fr 46px 1fr;align-items:stretch;height:84px;position:relative}.vs-l,.vs-r{position:relative;display:flex;align-items:center;gap:.4rem;overflow:hidden;color:#fff;border:0;font:inherit;min-width:0}.vs-l{justify-content:flex-start;background:linear-gradient(90deg,#4a0710,#d01d2c 70%,#ff3b47);clip-path:polygon(0 0,100% 0,88% 100%,0 100%);padding-right:12%}.vs-r{justify-content:flex-end;background:linear-gradient(90deg,#3f7bff,#1d4fe0 30%,#0a1f6b);clip-path:polygon(12% 0,100% 0,100% 100%,0 100%);padding-left:12%;cursor:pointer;text-align:right}.vs-r:not([disabled]):hover{filter:brightness(1.15)}.vs-row.next .vs-r{box-shadow:inset 0 0 0 3px #ffd84a}.vs-row.next .vs-r:not(:has(.vs-art)){animation:vsPulse 1.2s ease-in-out infinite}@keyframes vsPulse{50%{filter:brightness(1.35)}}.vs-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:1.35rem;font-style:italic;color:#fff;  text-shadow:-2px 0 0 #d01d2c,2px 0 0 #1d4fe0,0 0 10px rgba(255,255,255,.4);z-index:2}.vs-mid small{font-size:.58rem;font-style:normal;text-shadow:none;color:#c9c0dc}.vs-art{position:relative;flex:0 0 74px;height:84px;overflow:hidden}.vs-art img{position:absolute;left:50%;top:2px;height:235%;transform:translateX(-50%);max-width:none}.vs-art canvas{position:absolute;left:50%;top:-4px;width:150px;height:150px;transform:translateX(-50%);image-rendering:auto}.vs-tx{display:flex;flex-direction:column;min-width:0;line-height:1.15}.vs-tx b{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 rgba(0,0,0,.45)}.vs-tx em{font-style:normal;font-size:.7rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.95}.vs-tx small{font-size:.64rem;opacity:.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.vs-empty b{font-size:.85rem;opacity:.95}.vs-row.done .vs-l,.vs-row.done .vs-r{cursor:default}.vs-row.done .vs-l.lost,.vs-row.done .vs-r.lost{filter:grayscale(1) brightness(.72)}.vs-st{position:absolute;top:50%;transform:translate(-50%,-50%) rotate(-10deg);pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.6);font-style:normal;font-weight:900;font-size:1.05rem;letter-spacing:.06em;  padding:.05rem .45rem;border:3px solid currentColor;border-radius:4px;background:rgba(0,0,0,.55);z-index:3}.vs-st.vsl{left:11%}.vs-st.vsr{left:89%}.vs-st.w{color:#ffd84a}.vs-st.l{color:#ff6a6a}.vs-st.d{color:#d8d8d8}.rg-stars i{font-style:normal;color:#5a4a4a;font-size:1rem;letter-spacing:1px}.rg-stars i.on{color:#ffd84a;text-shadow:0 0 6px rgba(255,216,74,.6)}.rg-leg .kv-row{align-items:center}.vs-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin:.5rem 0}.vs-pc{display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 0 .4rem;border:0;color:#fff;font:inherit;cursor:pointer;  background:linear-gradient(180deg,#2a5bf0,#0d2478);box-shadow:inset 0 0 0 2px rgba(255,255,255,.15)}.vs-pc.on{box-shadow:inset 0 0 0 3px #ffd84a}.vs-pc[disabled]{filter:grayscale(1) brightness(.55);cursor:default}.vs-pc .vs-art{flex:none;width:100%;height:96px}.vs-pc small{font-size:.66rem;opacity:.85}@media (prefers-reduced-motion:reduce){.vs-row.next .vs-r{animation:none}}.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem}
.rg-reg{border-top:6px solid var(--rc);position:relative}.rg-reg h3{margin:.1rem 0 0}.rg-reg h3::first-letter{text-transform:uppercase}.rg-champ{font-size:.85rem;opacity:.85;margin-bottom:.5rem}
.rg-prov{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px dashed rgba(0,0,0,.15)}
.rg-prov:last-child{border-bottom:0}.rg-prov small{opacity:.7}.rg-fin{opacity:.9}.rg-miss{display:block;color:#d4688f;opacity:1!important}.rg-belt{color:#b8860b;font-weight:700}
.rg-trip{border-left:6px solid var(--gold,#d9a21b)}.rg-quick{display:grid;grid-template-columns:auto 1fr;column-gap:.5rem;align-items:center;margin:.6rem 0;cursor:pointer}.rg-quick small{grid-column:2}.rg-pick{display:flex;flex-wrap:wrap;gap:.4rem;margin:.4rem 0}
.rg-pick button{display:flex;align-items:center;gap:.35rem}.rg-pick button[aria-pressed="true"]{outline:3px solid var(--gold,#d9a21b)}
.rg-bill .kv-row{padding:.15rem 0}.rg-fuel.cheap{color:#2f8a50}.rg-fuel.high{color:#c8283c}
#rdcv{width:100%;height:auto;image-rendering:pixelated;background:#1b1530;box-shadow:inset 0 0 0 2px var(--line)}
.rd-play{width:min(560px,100%)}
.rd-say{display:flex;gap:10px;align-items:flex-start;min-height:92px;padding:10px 12px 22px;position:relative;background:var(--bg1,#231c3a);cursor:pointer}
.rd-say img{width:56px;height:56px;object-fit:cover;object-position:top;flex:none;box-shadow:inset 0 0 0 2px #4a3f6b}
.rd-say b{display:block;color:var(--gold)}.rd-say p{margin:2px 0 0;line-height:1.5}.rd-say.nar p{font-style:italic;color:#d8d0ec}
.rd-say small{position:absolute;right:10px;bottom:4px;font-size:11px;color:var(--muted)}
.rd-car{display:grid;justify-items:center;gap:2px}.rd-car small{color:var(--muted);font-size:12px}
.rd-fuel{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center}.rd-fuel b{grid-column:1/-1;text-align:center;font-size:14px}.rd-pump{font-size:22px}
.rd-gauge{position:relative;height:12px;background:linear-gradient(90deg,#3f9a4f 0 33%,#e0b41b 33% 66%,#d23246 66%);box-shadow:inset 0 0 0 2px #120c1c}
.rd-gauge i{position:absolute;top:-4px;width:4px;height:20px;margin-left:-2px;background:#fff;box-shadow:0 0 0 1px #120c1c}
.rd-fuel.cheap b{color:#7fd88a}.rd-fuel.high b{color:#ff8f8f}
.rd-bill{display:grid;gap:2px;padding:8px 10px}.rd-bill .kv-row{font-size:13px}.rd-total{border-top:1px dashed #4a3f6b;padding-top:4px;margin-top:2px}
.rd-seg{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}#roadtrip{background:#0a0616}`;document.head.appendChild(st);},
  fuelLine(G){const p=roadFuel(G,gameWeek(G)),b=roadFuelBand(p);
    return `<p class="meta">Fuel this week <b class="rg-fuel ${b}">฿${p.toFixed(2)}/L · ${b==="cheap"?"cheap":b==="high"?"pricey":"Normal"}</b> · ${esc(roadFuelHint(G))}</p>`;},
  html(){this.css();
    if(!G.region){const t=(G.honors||[]).filter(h=>h.kind==="province").length;
      return `<section class="px card"><h3>Four Regions Championship</h3><p>The regional tournament sends its invitation once year 5 is over and the camp has won 3 provincial titles.</p>
       <div class="kv-row"><span>Year</span><b>${G.season||1} / 6</b></div><div class="kv-row"><span>Provincial titles</span><b>${t} / 3</b></div>
       ${!REGION_LIVE?`<div class="mfoot"><button class="btn gold" data-act="rgdevstart">Open the chapter now (test mode)</button></div>`:""}</section>`;}
    rgApply(G);const R=G.region,T=R.trip,cups=(R.cups||[]).length,belts=this.beltTotal(G),nx=T?null:this.tripWeek(G);
    const tripCard=T?`<section class="px card rg-trip"><h3>Planned trip</h3><div class="kv-row"><span>${esc(ROAD_DEST[T.dest].name)} · ${esc(RG[ROAD_DEST[T.dest].r].name)}</span><b>Week ${T.wk}</b></div>
       <div class="kv-row"><span>Fighter</span><b>${G.F[T.fid]?esc(G.F[T.fid].name):"-"}</b></div><div class="kv-row"><span>Opponent</span><b>${G.F[T.opp]?esc(G.F[T.opp].name):"-"}</b></div>
       <div class="kv-row"><span>Travel cost (paid)</span><b class="num">${fmt(T.cost)}</b></div>
       <p class="meta">The whole camp travels together that week, so no other bouts.</p><div class="mfoot"><button class="btn" data-act="rgcancel">Cancel trip (refund)</button></div></section>`:"";
    const regs=RG_ORDER.map(r=>{const C=RG[r],b=R.belts[r]||{},n=this.beltCount(G,r),ch=R.champ[r]||{},F=ROAD_DEST[C.fin];
      const rows=C.prov.map(p=>{const D=ROAD_DEST[p],got=b[p],nights=roadNights(D.km);
        const P=R.pc&&R.pc[p];return `<div class="rg-prov"><span><b>${esc(D.name)}</b> <small>${D.km} km · ${nights?`Stay ${nights} night(s)`:"Day trip"}</small>${P?this.histHTML(P,p,`Provincial champion: ${rgNm(P,p)}`):""}</span>${got?`<span class="rg-belt">🏅 Belt won</span>`:`<button class="btn sm${T||!nx?"":" primary"}" data-act="rgplan" data-v="${p}" ${T||!nx?"disabled":""}>Plan</button>`}</div>`;}).join("");
      const fin=this.finRow(r);
      return `<section class="px card rg-reg" style="--rc:${C.col}"><h3>${esc(C.name)}</h3><div class="rg-champ">Regional champion: <b>${esc(C.champ)}</b> · ${esc(C.nick)}${R.nc&&R.nc[r]?this.histHTML(R.nc[r],R.nc[r].home,"The new regional champion's story"):""}</div>${rows}${fin}</section>`;}).join("");
    return `<section class="px card rg-head"><div><h3>Four Regions Championship</h3><span class="meta">Edition ${R.edition||1}${this.nextEdTxt(G)}</span></div>
       <div class="rg-stats"><span class="pill gold">Cups ${cups}/4</span><span class="pill">Belts ${belts}/16</span><span class="pill ${T?"red":nx?"green":""}">${T?`Trip: ${esc(ROAD_DEST[T.dest].name)} · Week ${T.wk}`:nx?`Can travel week ${nx}`:"No more trips this year"}</span></div></section>
     ${!R.gala?`<p class="meta rg-gala">🎉 The Four Regions Cup opening gala in Bangkok ${R.galaAbs!=null&&gameWeek(G)<R.galaAbs?"is held at the end of next week":"is held at the end of this week"} · the whole camp is invited</p>`:""}${!REGION_LIVE?`<p class="meta">Test mode: <button class="btn sm" data-act="rggala" data-v="gala">Watch the gala</button> Underground test fight (open rules): ${NL_ORDER.map(k=>`<button class="btn sm" data-act="nltest" data-v="${k}">${esc(NL[k].name)}</button>`).join(" ")}${(R.cups||[]).length?` <button class="btn sm" data-act="rggala" data-v="c1">Watch the green envelope scene</button>`:""}</p>`:""}
     ${this.finalCard(G)}${this.legendCard(G)}${this.joinCard(G)}${tripCard}${this.fuelLine(G)}<div class="rg-grid">${regs}</div>`;},
  /* quick trips: only once the region's first meeting and this province's own story have been seen */
  /* v1.91.50 (playtest): a champion coming to visit shows on the home screen too — it was easy to miss on the regional tab */
  visitBanner(G){const R=G.region;if(!R||!R.champ)return "";const r=RG_ORDER.find(x=>R.champ[x]&&R.champ[x].visit==="due");if(!r)return "";const cid=this.champId[r];
    return `<button class="px newfighter" data-act="rgvisit" data-v="${r}"><span class="newb">NEW!</span>${G.F[cid]?`<img src="${faceSrc(cid,"happy")}" alt="">`:""}<span><b>${esc(RG[r].champ)} is visiting the camp</b><small>Tap to welcome her · only until bout 2</small></span><span class="chev">▸</span></button>`;},
  canQuick(G,dest){const R=G.region,D=ROAD_DEST[dest];if(!R||!D)return false;return !!((R.arrived||{})[D.r])&&!(RG_TRIPX[dest]&&!((R.tx||{})[dest]));},
  planHTML(dest){const D=ROAD_DEST[dest],C=RG[D.r],wk=this.tripWeek(G);if(!wk)return `<h2>${esc(D.name)}</h2><p>No free week left to travel this year</p>`;
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs),R=this.riders(G,wk);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const me=UI.rgFid&&G.F[UI.rgFid],poor=G.cash<P.total,line=(k,v)=>v?`<div class="kv-row"><span>${k}</span><b class="num">${fmt(v)}</b></div>`:"";
    return `<h2>${esc(D.name)} <small class="meta">· ${esc(C.name)}</small></h2>
     <p class="meta">Travel in week <b>${wk}</b> · ${D.km} km · ${P.nights?`Stay ${P.nights} night(s)`:"Day trip"} · opponent: <b>${esc(this.oppName(G,dest))}</b>, the provincial champion</p>
     <h3>Who fights?</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">Nobody is fit to travel that week</p>`}
     <h3>Round-trip travel cost</h3><div class="rg-bill"><div class="kv-row"><span>Vehicle</span><b>${esc(roadCarName(P.car))}</b></div>
      ${line(`Fuel ${Math.round(P.litres)} L × ฿${P.price.toFixed(2)}`,P.fuel)}${line("Tolls",P.toll)}${line(`Bus tickets × ${P.onBus}`,P.bus)}${line(`Lodging ${P.nights} night(s)`,P.lodge)}${line(`Food × ${P.people}`,P.food)}
      <div class="kv-row"><span><b>Total</b></span><b class="num ${poor?"redt":"goldt"}">${fmt(P.total)}</b></div><div class="kv-row"><span>Camp cash after paying</span><b class="num ${poor?"redt":""}">${fmt(G.cash-P.total)}</b></div></div>
     <p class="meta">The whole camp: ${P.people} people travel together; no other bouts that week · road fatigue about +${P.fat} each ${P.car==="none"?" · the camp has no vehicle yet, so it's the bus (pricier and more tiring)":""}</p>
     ${this.canQuick(G,dest)?`<label class="rg-quick"><input type="checkbox" data-act="rgquick" ${G.region.quickPref?"checked":""}> Quick trip <small class="meta">skip the drive, the hotel nights and the souvenir shop · nights away count as rest</small></label>`:""}
     <div class="mfoot"><button class="btn" data-act="closeModal">Not now</button><button class="btn primary" data-act="rggo" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"Not enough money":"Confirm the trip"}</button></div>`;}
};

/* round 11: the underground final — state, the region-page card, the line-up and the five bouts */
Object.assign(REGION,{
  /* v1.91.47 (playtest): three years in with a cup, no new challenge letters — the series in progress ends, then the closing ceremony comes (before, a player who always re-accepted at once never reached it) */
  overTime(G){const R=G.region;if(!R||(R.cups||[]).length>=4||rgEd(G)>=2)return false; /* later editions have no time limit */return R.close!=null||((R.cups||[]).length>=1&&gameWeek(G)>=(R.startAbs||0)+156);},
  closeDue(G){const R=G.region,now=gameWeek(G),cups=R.cups||[];if(R.close)return false;
    if(cups.length>=4){const last=R.champ[cups[3]];return now>=((last&&last.wonAbs)||0)+2;}
    /* the tournament runs its course without four cups: three years in, nothing in progress */
    return cups.length>=1&&now>=(R.startAbs||0)+156&&!RG_ORDER.some(r=>R.champ[r]&&R.champ[r].state==="series")&&!R.trip;},
  openFinal(G){const R=G.region,now=gameWeek(G);R.close=now;R.final={stage:"prep",abs:now+3,prep:null,tries:0,won:false,intelAbs:now+1};
    addMail(G,{kind:"letter",from:"(no sender)",title:"Black card",body:`Sirichai Camp is invited: five on five
The old beverage factory warehouse, Khlong Toei port
From week ${((R.final.abs-1)%52)+1} onward

Open rules. Throws allowed. Locks allowed.
No prize. No press.

I just want to know how well your small Muay Thai camp handles the real world.
— L.`});},
  finalWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||F.intel||now<F.intelAbs)return;F.intel=1;
    addMail(G,{kind:"letter",from:"(unsigned)",title:"Naka League team intel",body:"Don't ask who sent this\n\n"+NL_ORDER.map(k=>`${NL[k].name} · ${NL[k].art}\n${NL[k].tip||""}`).join("\n\n")+"\n\nLadda looks for old fight tapes of everyone in your camp. The ones she has never seen fight, she can't read.\n\nP.S. No need to return the tablet."});},
  finalCard(G){const R=G.region,F=R.final;if(!F)return "";const now=gameWeek(G),ready=now>=F.abs,wk=((F.abs-1)%52)+1;
    const plans=Object.entries(RG_FPREP).map(([k,P])=>`<button class="btn sm ${F.prep===k?"gold":""}" data-act="rgfprep" data-v="${k}" aria-pressed="${F.prep===k}"><b>${esc(P.n)}</b><small>${esc(P.d)}</small></button>`).join("");
    const team=F.intel?`<div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><small>${NL[k].nlsk.map(s=>esc(s.name)).join(" · ")}</small></div>`).join("")}</div>`:`<p class="meta">You know nothing about the Naka League team yet</p>`;
    if(F.won)return `<section class="px card rg-final won"><h3>Underground fight · Naka League</h3><p>Sirichai Camp won ${F.score||""} · ${F.beatLadda?"Ladda went down too":"Ladda is still unbeaten"}</p></section>`;
    return `<section class="px card rg-final"><h3>🂠 Black card · Naka League underground fight</h3>
      <p class="meta">Five on five · first to three · open rules, throws and locks allowed · no prize ${F.tries?` · attempts so far: ${F.tries} times`:""}</p>
      <h4>Underground training plan</h4><div class="rg-pick rg-fprep">${plans}</div>
      <h4>Naka League team</h4>${team}
      <div class="mfoot">${ready?`<button class="btn primary" data-act="rgfline" ${F.prep?"":"disabled"}>${!F.prep?"Choose a training plan first":F.live?"Back into the warehouse ▸":"Go to the underground warehouse ▸"}</button>`:`<span class="meta">Available from week ${wk} · trained ${F.abs-now} more weeks</span>`}</div></section>`;},
  finalPool(G){return roster(G).filter(f=>!f.injury&&!isAway(G,f.id));},
  vsArt(f,side,win){const A={kati:1,mali:1,rin:1,ploy:1,fah:1,baibua:1,tabtim:1,alicia:1,chaba:1,pailin:1};
    if(f.nl==="ladda")return `<img src="${ASSET}lada_fight_${win?"happy":"angry"}.webp" alt="">`;
    if(f.nl)return `<img src="${ASSET}nl_${f.nl}${f.nl==="rosa"&&win?"_win":""}_por.webp" alt="">`; /* v1.91.23: Man's Naka League portraits */
    if(A[f.id])return `<img src="${ASSET}${f.id}_fight_happy.webp" alt="">`;
    return `<canvas width="128" height="128" data-sprite="${f.id}" data-mode="guard" ${side==="r"?'data-flip="1"':""}></canvas>`;},
  boardHTML(){const R=G.region,F=R.final,pool=this.finalPool(G),L=F.line=F.line||{},K=F.clear=F.clear||{};
    if(!F.live){F.cur={};for(const k in K){F.cur[k]="W";delete L[k];}} /* v1.91.24 (Man, option 1): bouts already won stay won */
    const C=F.cur;
    for(const k of NL_ORDER)if(!C[k]&&L[k]&&!pool.some(f=>f.id===L[k]))delete L[k];
    if(!F.live&&!NL_ORDER.some(k=>!C[k]&&L[k])){const used=new Set();for(const k of NL_ORDER){if(C[k])continue;const f=pool.filter(x=>!used.has(x.id)).sort((a,b)=>effOvr(G,b)-effOvr(G,a))[0];if(f){L[k]=f.id;used.add(f.id);}}}
    const ref=pool[0]||roster(G)[0];for(const k of NL_ORDER)if(!G.F["nl_"+k]&&ref)nlFighter(G,k,ref);
    const v=Object.values(C),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,next=NL_ORDER.find(k=>!C[k]);
    if(UI.rgPick&&!C[UI.rgPick]){const k=UI.rgPick,o=G.F["nl_"+k],at=id=>NL_ORDER.find(x=>L[x]===id);
      return `<div class="vsb"><h2>Bout ${NL_ORDER.indexOf(k)+1} · Who fights ${esc(NL[k].name)}</h2><p class="meta">${esc(NL[k].art)}</p>
        <div class="vs-pick">${pool.map(f=>{const x=at(f.id),done=x&&C[x];return `<button class="vs-pc ${L[k]===f.id?"on":""}" data-act="rgfset" data-v="${k}|${f.id}" ${done?"disabled":""}>
          <span class="vs-art">${this.vsArt(f,"r")}</span><b>${esc(f.name)}</b><small>Lv.${f.lvl||1}${done?" · already fought":x&&x!==k?` · in bout ${NL_ORDER.indexOf(x)+1}`:""}</small></button>`;}).join("")}</div>
        ${pool.length<5?`<p class="redt">You need at least 5 fighters ready to fight (right now: ${pool.length})</p>`:""}
        <div class="mfoot"><button class="btn" data-act="rgfpickx">Back</button></div></div>`;}
    const stamp=(r,sd)=>r?`<i class="vs-st ${sd} ${r==="W"?"w":r==="L"?"l":"d"}">${r==="W"?"WIN":r==="L"?"LOSE":"DRAW"}</i>`:"";
    const rows=NL_ORDER.map((k,i)=>{const o=G.F["nl_"+k],kept=!!(K[k]&&!L[k]),me=kept?G.F[K[k]]:L[k]&&G.F[L[k]],r=C[k],their=r==="W"?"L":r==="L"?"W":r;
      return `<div class="vs-row ${r?"done":""} ${kept?"kept":""} ${k===next?"next":""}">
        <div class="vs-l ${r&&their!=="W"?"lost":""}"><span class="vs-art">${o?this.vsArt(o,"l",their==="W"):""}</span><span class="vs-tx">${(n=>`<b>${esc(n[0])}</b>${n[1]?`<em>${esc(n.slice(1).join(" "))}</em>`:""}`)(NL[k].name.split(" "))}<small>${esc(NL[k].art)}</small></span></div>
        <div class="vs-mid">VS<small>Bout ${i+1}</small></div>
        <button class="vs-r ${r&&r!=="W"?"lost":""}" data-act="rgfslot" data-v="${k}" ${r?"disabled":""}>${me?`<span class="vs-tx"><b>${esc(me.name)}</b><small>${kept?"Won last time":`Lv.${me.lvl||1}`}</small></span><span class="vs-art">${this.vsArt(me,"r")}</span>`:`<span class="vs-tx vs-empty"><b>+ Pick a fighter</b></span>`}</button>${stamp(their,"vsl")}${stamp(r,"vsr")}</div>`;}).join("");
    const nk=next&&NL_ORDER.indexOf(next)+1,full=NL_ORDER.every(k=>C[k]||L[k]),ok=next&&L[next]&&(F.live||full); /* v1.91.47 (playtest): every bout needs a fighter before the first bell — an injured fifth fighter left the night stuck at bout 5 */
    return `<div class="vsb"><div class="vs-head"><span class="vs-tl">Naka League</span><b class="vs-sc">${w>0||l>0?`${l} – ${w}`:"VS"}</b><span class="vs-tr">Sirichai Camp</span></div>
      <p class="meta vs-sub">Five on five · first to three · tap a blue slot to pick a fighter · bouts you already won stay won · no injuries carry over after the fight</p>
      <div class="vs-rows">${rows}</div>
      <div class="mfoot">${next?`${F.live?"":`<button class="btn" data-act="closeModal">Not yet</button>`}<button class="btn primary" data-act="rgfgo" ${ok?"":"disabled"}>${ok?`Fight bout ${nk} ▸`:L[next]&&!full?(pool.length<NL_ORDER.filter(k=>!C[k]).length?"Not enough fit fighters":"Pick a fighter for every bout first"):`Pick a fighter for bout ${nk} first`}</button>`:`<button class="btn primary" data-act="rgfend">See the result ▸</button>`}</div></div>`;},
  finalNext(){const R=G.region,F=R.final,C=F.cur=F.cur||{},k=NL_ORDER.find(x=>!C[x]);if(!k||!(F.line||{})[k])return;UI.modal=null;UI.rgPick=null;
    if(!F.live){F.live=true;save();AU.startMusic&&AU.startMusic("hub");playScene(rgFinalIntro(G),()=>this.finalBout(k),{bg:"naka_underground",look:"casual"});return;}
    this.finalBout(k);},
  finalBout(k){const R=G.region,F=R.final,i=NL_ORDER.indexOf(k),me=G.F[F.line[k]];if(!me)return;
    const keep={injury:me.injury||0,fatigue:me.fatigue||0},o=nlFighter(G,k,me);
    const b={id:`nlf${F.tries||0}_${i}_${gameWeek(G)}`,a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",gprep:F.prep,region:{nlfinal:k}};
    G.bookings.push(b);save();
    openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);me.injury=keep.injury;me.fatigue=keep.fatigue;this.flush(G);
      if(!F.cur[k])F.cur[k]="L";if(F.cur[k]==="W"){F.clear=F.clear||{};F.clear[k]=me.id;}save();UI.modal={type:"rgfline"};render();});},
  finalEnd(){const R=G.region,F=R.final,v=Object.values(F.cur||{}),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,beat=(F.cur||{}).ladda==="W";F.tries=(F.tries||0)+1;F.live=false;UI.modal=null;
    if(w>=3){F.won=true;F.stage="done";F.wonAbs=gameWeek(G);F.score=`${w}–${l}`;F.beatLadda=beat;R.hall=R.hall||[];R.hall.push({k:"naka",season:G.season||1,score:F.score,ladda:beat});
      for(const r of RG_ORDER)rgTouch(G,RG_CID[r]);G.rep+=3;
      AU.startMusic&&AU.startMusic("victory");playScene(rgFinalWin(G,w,l,beat,F.line.ladda),()=>{AU.startMusic&&AU.startMusic("hub");save();render();},{bg:"naka_underground",look:"casual"});return;}
    playScene(rgFinalLose(G,w,l),()=>{save();UI.modal={type:"rgflost"};render();},{bg:"naka_underground",look:"casual"});},
});
/* v1.91.27 (Man): legend mode — optional, after the underground final. Stars: ★ win · ★★ win without going down · ★★★ that, and inside the distance */
const LEG_UP={n:.65,l:.6}, /* v1.91.38: the final got harder — legend members stay where they were (~29%), legend Ladda stays above the final */LEG_DUST=4;
Object.assign(REGION,{
  legStars(n){return `<span class="rg-stars">${[1,2,3].map(i=>`<i class="${i<=n?"on":""}">★</i>`).join("")}</span>`;},
  legendCard(G){const R=G.region,F=R.final;if(!F||!F.won)return "";const L=R.legend=R.legend||{},tot=NL_ORDER.reduce((a,k)=>a+(L[k]||0),0),used=R.legWk===gameWeek(G);
    return `<section class="px card rg-final rg-leg ${tot>=15?"won":""}"><h3>✦ Legend · Naka League <small class="meta">${tot}/15 stars</small></h3>
      <p class="meta">Optional · tougher than the underground final · one bout a week · injuries and fatigue count · ★ win · ★★ win without going down · ★★★ no knockdown and inside the distance · each new star gives stardust ${LEG_DUST}</p>
      <div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><span>${this.legStars(L[k]||0)} <button class="btn sm" data-act="rglegpick" data-v="${k}" ${used?"disabled":""}>Challenge ▸</button></span></div>`).join("")}</div>
      ${used?`<p class="meta">Already fought a legend bout this week</p>`:""}</section>`;},
  legPickHTML(k){const R=G.region,pool=this.finalPool(G),L=R.legend||{};
    return `<h2>Legend · ${esc(NL[k].name)}</h2><p class="meta">${esc(NL[k].art)} · now ${this.legStars(L[k]||0)} · 5 rounds, open rules</p>
      <div class="vs-pick">${pool.map(f=>`<button class="vs-pc" data-act="rglego" data-v="${k}|${f.id}"><span class="vs-art">${this.vsArt(f,"r")}</span><b>${esc(f.name)}</b><small>Lv.${f.lvl||1}</small></button>`).join("")}</div>
      ${pool.length?"":`<p class="redt">Nobody is fit to fight</p>`}<div class="mfoot"><button class="btn" data-act="closeModal">Not yet</button></div>`;},
  legGo(k,id){const R=G.region,me=G.F[id];if(!me||R.legWk===gameWeek(G))return;UI.modal=null;R.legWk=gameWeek(G);
    const o=nlFighter(G,k,me,0,0,true),b={id:`nlleg_${k}_${gameWeek(G)}`,a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",region:{nlleg:k}};
    G.bookings.push(b);save();openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);this.flush(G);save();render();});},
  legResult(G,k,p){const R=G.region,L=R.legend=R.legend||{},st=p.res==="W"?1+(p.kdA?0:1)+(!p.kdA&&p.stop?1:0):0,was=L[k]||0;
    if(st>was){L[k]=st;G.dust=(G.dust||0)+(st-was)*LEG_DUST;toast&&toast(`Legend · ${NL[k].name} ${"★".repeat(st)} · stardust +${(st-was)*LEG_DUST}`);}
    const tot=NL_ORDER.reduce((a,x)=>a+(L[x]||0),0);if(tot>=15&&!R.legAll){R.legAll=gameWeek(G);G.rep+=2;R.hall=R.hall||[];R.hall.push({k:"legend",season:G.season||1});
      G.log=G.log||[];G.log.push("Naka League legend mode: all 15 stars · fame +2");}},
});
if(typeof ACT!=="undefined")Object.assign(ACT,{
  rglegpick:d=>{if(!G.region||!G.region.final||!G.region.final.won)return;UI.modal={type:"rgleg",k:d.v};render();},
  rglego:d=>{const [k,id]=d.v.split("|");REGION.legGo(k,id);},
  rgfprep:d=>{const F=G.region&&G.region.final;if(!F||F.won)return;F.prep=d.v;save();render();},
  rgfline:()=>{const F=G.region&&G.region.final;if(!F||F.won||!F.prep||gameWeek(G)<F.abs)return;UI.rgPick=null;UI.modal={type:"rgfline"};render();},
  rgfslot:d=>{const F=G.region.final;if((F.cur||{})[d.v])return;UI.rgPick=d.v;render();},
  rgfpickx:()=>{UI.rgPick=null;render();},
  rgfset:d=>{const [k,id]=d.v.split("|"),F=G.region.final,L=F.line=F.line||{},C=F.cur||{};if(C[k])return;
    const was=NL_ORDER.find(x=>L[x]===id);if(was&&C[was])return;if(was&&was!==k){if(L[k])L[was]=L[k];else delete L[was];}L[k]=id;UI.rgPick=null;save();render();},
  rgfgo:()=>REGION.finalNext(),
  rgfend:()=>{const F=G.region.final;if(NL_ORDER.every(k=>(F.cur||{})[k]))REGION.finalEnd();},
  rgfagain:()=>{const F=G.region.final;F.cur={};F.live=false;UI.rgPick=null;UI.modal={type:"rgfline"};render();},
  rgfhome:()=>{const F=G.region.final;F.abs=gameWeek(G)+1;UI.modal=null;addMail(G,{kind:"letter",from:"(no sender)",title:"A new black card",body:"The door is still open\n— L."});save();render();},
});
if(typeof XMODAL!=="undefined"){XMODAL.rgfline=()=>({body:REGION.boardHTML(),foot:false});XMODAL.rgleg=m=>({body:REGION.legPickHTML(m.k),foot:false});
  XMODAL.rgflost=()=>({body:`<h2>Lost the underground fight</h2><p>Bouts you already won stay won; next time you only fight the rest · What now?</p><div class="mfoot"><button class="btn" data-act="rgfhome">Train first (come back next week)</button><button class="btn primary" data-act="rgfagain">New lineup, fight on now</button></div>`,foot:false});}
if(typeof XMODAL!=="undefined"){XMODAL.rgplan=m=>({body:REGION.planHTML(m.dest),foot:false});XMODAL.rgser=m=>({body:REGION.seriesHTML(m.r),foot:false});}
if(typeof ACT!=="undefined")Object.assign(ACT,{
  lbgo:d=>{UI.modal=null;lbStart(G,d.v);},
  nltest:d=>{if(REGION_LIVE)return;nlTest(d.v);},
  rgplan:d=>{UI.rgFid=null;UI.modal={type:"rgplan",dest:d.v};render();},
  rgfid:d=>{UI.rgFid=d.v;render();},
  rgquick:()=>{G.region.quickPref=!G.region.quickPref;save();render();},
  rggo:d=>{const r=REGION.book(G,d.v,UI.rgFid);if(!r.ok){toast(r.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`Trip booked for week ${r.wk} · travel cost paid ${fmt(r.cost)}`);save();render();},
  rgvisit:d=>{const r=d.v,c=G.region.champ[r],cid=REGION.champId[r];if(!c||c.visit!=="due")return;
    playScene(RG_VISIT[r](G),()=>DUEL.open(r,false,res=>{if(!res){render();return;}c.visit="done";const T=DUEL_TALK[r];
      playScene([{n:cid,f:res.w>=2?"flustered":"happy",l:"casual",t:res.w>=2?T.win:T.lose},{n:"nar",t:`${RG[r].champ} heads home that evening · bout 2 is at the regional ring`}],()=>{const g=typeof cardCheck==="function"?cardCheck(G):[];if(g.length){G.cardPend=(G.cardPend||[]).concat(g);UI.modal={type:"cardnew"};}save();render();},{bg:"camp",look:"casual"});}),{bg:"camp",look:"casual"});},
  rgduel:d=>{DUEL.open(d.v,true,()=>render());},
  rgser:d=>{UI.rgFid=null;UI.modal={type:"rgser",r:d.v};render();},
  rgsfid:d=>{UI.rgFid=d.v;render();},
  rgsgo:d=>{const x=REGION.startSeries(G,d.v,UI.rgFid);if(!x.ok){toast(x.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`Challenge accepted · bout 1 in week ${x.s.wk}${x.s.season!==(G.season||1)?" next year":""}`);save();render();},
  rgcancel:()=>{if(REGION.cancel(G)){toast("Trip cancelled. The travel money is refunded.");save();render();}},
  rgdevstart:()=>{if(REGION_LIVE)return;regionStart(G);save();render();},
  rgchat:d=>{const f=G.F[d.v];if(!f)return;f.met=true;rgTouch(G,d.v);chatOpen(d.v);},
  rggala:d=>{if(REGION_LIVE)return;const R=G.region;if(d.v==="c1"){const r=R.cups[0];playScene(rgCup1(G,r),()=>{R.c1=R.c1||"seen";save();render();},{bg:"camp",look:"casual"});return;}
    playScene(rgGala(G),()=>{R.gala=1;save();render();},{bg:"gala",look:"casual"});}});
/* ---------- v1.91.28 round 12 (Man): after the underground final the regional champions ask to join, one at a time ----------
   hidden bar: closeness (R.meet) ≥ RG_JOIN_MIN · offers come in order of closeness, 4 weeks apart · accepting needs a free room (5 + dorm level) and the signing fee
   she arrives the next week (leaving her old camp + arriving at Sirichai) at ~70% of her champion level/stats, with skill points for her lineage's tree (the partner girl's)
   romance (Man): one-love or two-timing only — never the harem team. Kept on its own track (R.lov / R.ex), shown through relState */
const rgBondOf=m=>Math.min(70,Math.round((m||0)*3));
const RG0=Object.fromEntries(Object.entries(RG).map(([r,C])=>[r,{name:C.name,champ:C.champ,nick:C.nick}]));
const RG_HOME_LINE={baibua:2,tabtim:1,alicia:2,chaba:0}; /* Baibua counters (Tha Sao) · Tabtim keeps range (Korat) · Alicia fights inside (Lopburi) · Chaba presses (Chaiya) */
const RG_JOIN_MIN=12,RG_JOIN_GAP=4,RG_JOIN_FEE=350000,RG_JOIN_WAGE=5000; /* v1.91.30 (Man): a regional champion costs a fortune, and is worth it */
/* v1.91.30 (Man): every champion brings something the camp wants — her ring perk stays, plus a camp-wide gift */
/* v1.91.43: each joined champion's own Lv.42 legend skills — old id (her partner's) → [new id, name, desc, signature bonus] */
const RG_CAP={
 baibua:{kati_0a5:["baibua_0a5","Lotus Blooming in the Ring","Lv.42 · Legend · a kick that opens like a lotus petal · kick power +20%, kick accuracy +5%, kick points +8% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_0b5:["baibua_0b5","The Bua Tasao Kicking Scroll","Lv.42 · Legend · every kick from the scroll Camp Bua handed down · kick accuracy +5%, kick points +12%, counters +3% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_1a5:["baibua_1a5","Lotus-Petal Sky-Flip Elbow","Lv.42 · Legend · the spinning elbow all of Chiang Mai knows · elbow power +20%, punch power +8%, elbow accuracy +4% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_1b5:["baibua_1b5","Doi Suthep Rain Fists","Lv.42 · Legend · fists as thick as mountain rain · punch power +18%, punch accuracy +4%, punch points +8% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_2a5:["baibua_2a5","The Lotus Never Sinks","Lv.42 · Legend · however often she falls, she rises above the water · +6% accuracy at low health, recovery +15%, morale effect +2% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_2b5:["baibua_2b5","Lanna Mist Veil","Lv.42 · Legend · take the blow, answer from inside the mist · evade +3%, counters +5%, counter-punch power +15% · Baibua's mark: counter +1%",r=>({ctr:.01*r})]},
 tabtim:{ploy_0a5:["tabtim_0a5","Phimai Lam Sing Fists","Lv.42 · Legend · heavy fists on the beat of the phin · punch power +22%, punch accuracy +3%, punch points +6% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_0b5:["tabtim_0b5","Smile First, Win First","Lv.42 · Legend · she smiles at you first, then she wins · punch accuracy +5%, punch power +14%, counters +3% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_1a5:["tabtim_1a5","Red Ruby in the Sky","Lv.42 · Legend · a jumping kick that falls from the sky · kick power +20%, kick accuracy +4%, kick points +8% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_1b5:["tabtim_1b5","Stone Castle Neck Lock","Lv.42 · Legend · a lock as solid as the Phimai stones · knee power +20%, clinch defense +0.6, knee accuracy +3% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_2a5:["tabtim_2a5","Wall of Laughter","Lv.42 · Legend · the more she is hit, the more she laughs, and the harder she answers · evade +3%, counters +5%, counter-punch power +15% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_2b5:["tabtim_2b5","The Khaen Keeps the Game","Lv.42 · Legend · she sets the rhythm of the whole fight like a khaen player · corner orders +45%, base accuracy +1.5%, counters +4% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})]},
 alicia:{rin_0a5:["alicia_0a5","Queen of the Counter","Lv.42 · Legend · an elegant counter, right on camera · counters +6%, counter-punch power +22%, punch accuracy +3% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_0b5:["alicia_0b5","Shadow on the Live Stream","Lv.42 · Legend · so fast the camera only catches her shadow · evade +3%, counters +5%, counter-punch power +12% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_1a5:["alicia_1a5","The Pre-Fight Speech","Lv.42 · Legend · she wins at the interview before the bell · corner orders +50%, base accuracy +1.8%, counters +3% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_1b5:["alicia_1b5","The Princess's Board","Lv.42 · Legend · the whole ring is her game board · corner orders +35%, counters +5%, counter-punch power +10% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_2a5:["alicia_2a5","Ayutthaya Palace Gate","Lv.42 · Legend · a push kick no one gets past into the palace · kick accuracy +5%, kick points +12%, evade +2% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_2b5:["alicia_2b5","Riverside Princess Dance","Lv.42 · Legend · footwork that circles you like a dance · evade +3.5%, stamina use -3%, kick accuracy +3% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})]},
 chaba:{mali_0a5:["chaba_0a5","Andaman Wave Elbow","Lv.42 · Legend · elbows that come in waves · elbow power +20%, knee power +10%, elbow accuracy +3% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_0b5:["chaba_0b5","Pulled Under the Sea","Lv.42 · Legend · two pulls on the neck, like an undertow · knee power +16%, elbow power +12%, knee accuracy +3% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_1a5:["chaba_1a5","Red Hibiscus Storm","Lv.42 · Legend · strike after strike until you can't set your feet · kick power +16%, kick accuracy +5%, evade +2% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_1b5:["chaba_1b5","Longtail Boat Through the Waves","Lv.42 · Legend · she slips away with the waves · recovery +20%, evade +2.5%, stamina use -3% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_2a5:["chaba_2a5","Phang Nga Karst","Lv.42 · Legend · she stands as still as a rock island in the sea · clinch defense +1, evade +3%, recovery +10% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_2b5:["chaba_2b5","The Hibiscus Blooms Last Round","Lv.42 · Legend · the later the fight, the brighter she blooms · +5% accuracy at low health, counters +4%, morale effect +2% · Chaba's mark: evasion +1%",r=>({evade:.01*r})]}};
const rgFxAdd=(a,b)=>{const o={...a};for(const k in b){if(b[k]&&typeof b[k]==="object"){o[k]={...(a[k]||{})};for(const w in b[k])o[k][w]=(o[k][w]||0)+b[k][w];}else o[k]=(o[k]||0)+b[k];}return o;};
const RG_TRAIT={
 baibua:{name:"Tha Sao Elbow Teacher",desc:"Tha Sao counter elbows (counter +5%, elbow +12%) · teaches elbows to the camp: fighters whose elbow/counter is under 17 improve a little each week"},
 tabtim:{name:"Isan Laughter",desc:"Accurate kicks and quick evasion · wherever she is, it's lively: every fighter in camp +2 morale each week"},
 alicia:{name:"Live Star",desc:"Heavy hands and inside defence · streams training with the camp: ad income every week (grows with camp fame) and fame slowly rises"},
 chaba:{name:"Silent Fixer",desc:"Quick evasion and fast recovery · looks after the injured like she looks after her brother: injured fighters heal one extra week each week"}};
const RG_JOIN={
 baibua:{letter:"Manager\n\nI've been thinking since the night of the cup. I want to train at Sirichai Camp. I want to fight beside Kati, not against her\n\nMy father says the Tha Sao teachers taught us to go where our fists get better, not to stay in one place forever\n\nIf the camp has a free room, I'd like to apply\n— Baibua",
  leave:[{n:"nar",t:"Moving day. The morning mist hasn't lifted. Baibua bows to her teacher at the wooden shrine in front of her old camp"},{n:"baibua",f:"sad",l:"casual",t:"Teacher, I'm going to another camp… I'm not leaving Tha Sao behind. I'm taking it with me"},
   {n:"nar",t:"Her coach ties a white thread around her wrist, then pats her back lightly twice"},{n:"baibua",f:"happy",l:"casual",t:"My father sent sai ua for the whole camp. He says if it tastes good, take good care of his daughter"}],
  arrive:[{n:"nar",t:"Baibua stands under the Sirichai Camp sign with two bags and one box of sai ua"},{n:"baibua",f:"flustered",l:"casual",t:"Manager… please take care of me. I won't let you down"}],
  pair:"Pi Baibua! Your room's right next to mine. I already made the bed for you!",pairBack:"…Thank you, Kati. Two Tha Sao fighters in one camp. Our teacher must be smiling",
  hang:[
   [{n:"nar",t:"Baibua takes you to the morning market. She picks vegetables as carefully as she picks opponents"},{n:"baibua",f:"happy",l:"casual",t:"Hang lay curry needs pork belly… can you eat spicy food, manager?",choice:[
     {t:"\"Sure, as spicy as you like\"",b:4,then:[{n:"baibua",f:"flustered",l:"casual",t:"Then I'll add more chillies… but if you cry, don't blame me"}]},
     {t:"\"Make it the way your family eats it\"",b:5,then:[{n:"baibua",f:"happy",l:"casual",t:"…The way my father likes it. I haven't cooked for anyone in a long time"}]}]}],
   [{n:"nar",t:"Evening. Baibua sits embroidering teen chok patterns outside her room. The needle is smaller than you'd think"},{n:"baibua",f:"flustered",l:"casual",t:"It's for Kati… no, for the whole camp. This one's the manager's — oh, no, it isn't finished yet",choice:[
     {t:"\"I can wait. No rush\"",b:5,then:[{n:"baibua",f:"happy",l:"casual",t:"…Then I'll embroider slowly"}]},
     {t:"\"Can you teach me to embroider?\"",b:4,then:[{n:"nar",t:"Half an hour later your cloth has one lotus on it. It looks like a cabbage"},{n:"baibua",f:"happy",l:"casual",t:"Pretty… pretty like a cabbage"}]}]}],
   [{n:"nar",t:"Before dawn, Baibua drills spinning elbows on the bag. She doesn't hear you come"},{n:"baibua",f:"surprised",l:"fight",t:"Eh! Manager… have you been watching long?",choice:[
     {t:"\"That's the most beautiful elbow I've ever seen\"",b:5,then:[{n:"baibua",f:"flustered",l:"fight",t:"…Don't say that while I'm throwing an elbow. It'll miss"}]},
     {t:"Hold the bag so she can keep training",b:4,then:[{n:"nar",t:"The next elbow is a little softer. She says she was afraid of hurting you"}]}]}]],
  love:[{n:"nar",t:"This Saturday Baibua takes you to the walking street. Her hand finds yours on its own in the crowd"},{n:"baibua",f:"flustered",l:"casual",t:"If we get separated… hold on like this"},{n:"baibua",f:"happy",l:"casual",t:"I'm not scared of getting lost"}],
  conf:G=>[{n:"nar",t:"Late at night Baibua knocks on your door, holding the same teen chok shawl from Doi Suthep"},{n:"baibua",f:"flustered",l:"casual",t:"I wrote it in the contract letter, but I erased it… because I wanted to say it myself"},{n:"baibua",f:"flustered",l:"casual",t:G.player.gender==="f"?"I love you… you can answer whenever you like":"I love you… you can answer whenever you like"}],
  yes:G=>G.player.gender==="f"?"…Yes. I'll call you that every day now. No more saying it in secret":"…Yes. I'll call you that every day now. No more saying it in secret",no:"It's fine. I'm still at this camp, still see your face every day. That's enough",bye:"…Yes. I understand. I'll still fight my best for this camp, same as always"},
 tabtim:{letter:"Manager\n\nA champion of Isan like me doesn't lose easily, but losing to Sirichai Camp was something else. I want to know how this camp trains\n\nSo I'm moving there to train with you! Ploy, don't worry, I won't take your spot. I'll only take your sticky rice\n\nIf there's a free room, write back\n— Tabtim",
  leave:[{n:"nar",t:"Her last night at the old camp. All the juniors sit in a circle for a farewell dinner"},{n:"tabtim",f:"happy",l:"casual",t:"No crying, everyone! I'm just going to train, not going anywhere!"},
   {n:"nar",t:"Her coach hands her a big basket of sticky rice. Tabtim laughs loudly, but her eyes are red"},{n:"tabtim",f:"sad",l:"casual",t:"…My coach taught me since I couldn't even kick a banana tree down. Take good care of me, manager"}],
  arrive:[{n:"nar",t:"Tabtim steps out of the van with three bags of grilled chicken and a jar of pla ra bong"},{n:"tabtim",f:"happy",l:"casual",t:"Manager! From now on Tabtim belongs to Sirichai Camp …as a fighter. Don't overthink it!"}],
  pair:"Your room is across from mine. If it's loud after ten, I'll knock on the wall",pairBack:"Haha, sure, Ploy! Knock and I'll knock back in a long-drum rhythm",
  hang:[
   [{n:"nar",t:"Tabtim drags you to a som tam stall and orders for the whole table without opening the menu"},{n:"tabtim",f:"happy",l:"casual",t:"Som tam with crab and pla ra, ten chillies! How many for you, manager?",choice:[
     {t:"\"Ten, same as you\"",b:5,then:[{n:"nar",t:"Ten minutes later you're on your third glass of ice water"},{n:"tabtim",f:"happy",l:"casual",t:"Haha, you've got guts! I like people with guts …I mean eaters!"}]},
     {t:"\"Just one\"",b:3,then:[{n:"tabtim",f:"pout",l:"casual",t:"One chilli is just plain rice! Here, have a bite of mine"}]}]}],
   [{n:"nar",t:"Tabtim plays mor lam on her phone and dances alone in the middle of the camp yard"},{n:"tabtim",f:"happy",l:"casual",t:"Come dance, manager! These are the feet I kick with",choice:[
     {t:"Get up and dance with her",b:5,then:[{n:"nar",t:"The whole camp comes out to watch. Tabtim spins you three times by the hand and laughs until she sits on the ground"}]},
     {t:"Clap along to the beat",b:4,then:[{n:"tabtim",f:"flustered",l:"casual",t:"…You're staring a lot. I get shy too, you know"}]}]}],
   [{n:"nar",t:"After training, Tabtim sits unusually quiet, looking at a photo of her brother in his student uniform"},{n:"tabtim",f:"sad",l:"casual",t:"My little brother… he got into law school. I fight to see him through",choice:[
     {t:"\"He's lucky to have a sister like you\"",b:5,then:[{n:"tabtim",f:"flustered",l:"casual",t:"…Don't say that. I cry easily. I'm not joking"}]},
     {t:"\"This camp can help you put him through school\"",b:4,then:[{n:"tabtim",f:"happy",l:"casual",t:"This camp's so kind… I'll fight harder than before"}]}]}]],
  love:[{n:"nar",t:"The Mekong at dusk. Tabtim is quiet for longer than ever"},{n:"tabtim",f:"flustered",l:"casual",t:"I used to think happiness was winning… now it's sitting here with you"},{n:"tabtim",f:"happy",l:"casual",t:"Don't tell anyone I can talk sweet!"}],
  conf:()=>[{n:"nar",t:"Tabtim pulls you out behind the camp, where the mor lam from her room can't be heard"},{n:"tabtim",f:"flustered",l:"casual",t:"Manager! I'm saying this once. I'm not joking like before"},{n:"tabtim",f:"flustered",l:"casual",t:"I really, really like you …answer now. I'm not scared of the answer"}],
  yes:()=>"…Really?! Haha, I'm telling the whole camp! …No, no, too embarrassing. Later",no:"It's fine. I'm still at this camp. We still eat sticky rice together every meal, same as before",bye:"…I get it. I'm not angry. I just need to go kick the bag hard for a while"},
 alicia:{letter:"To the manager\n\nMy contract with Vector is over. I'm not renewing, and I won't sign anything with the word \"forever\" in it, like I said\n\nRin says Sirichai Camp's contract is only two pages. You can read it in five minutes. I'm interested. That doesn't mean I want to come because of you. It's because the contract is short\n\nIf there's a room, send the contract\n— Alicia",
  leave:[{n:"nar",t:"Her last day at Vector camp. The sponsor team asks Alicia for a farewell live stream"},{n:"alicia",f:"pout",l:"casual",t:"No. Today isn't content"},
   {n:"nar",t:"She leaves her pass on the desk and takes off the sponsor's wristband, keeping only the old hand wraps she bought herself at fifteen"},{n:"alicia",f:"happy",l:"casual",t:"I feel so light… don't tell anyone about this"}],
  arrive:[{n:"nar",t:"Alicia arrives with five suitcases: four of clothes, one of royal Thai sweets for the whole camp"},{n:"alicia",f:"flustered",l:"casual",t:"I didn't buy them to please anyone. My hand just picked them up"}],
  pair:"I've made a dishwashing roster. Miss Alicia gets Wednesdays and Saturdays",pairBack:"Fine. …Which dish soap do I use?",
  hang:[
   [{n:"nar",t:"Alicia asks you to hold the camera, but once it's on she turns the lens on you"},{n:"alicia",f:"happy",l:"casual",t:"Today I'm filming you. The content's called 'The Manager Who Won't Smile'",choice:[
     {t:"Smile for the camera",b:5,then:[{n:"alicia",f:"flustered",l:"casual",t:"…You don't have to smile that much. This file isn't getting posted. I'm keeping it to watch. I mean, to review"}]},
     {t:"\"Film yourself instead. You're prettier\"",b:4,then:[{n:"alicia",f:"pout",l:"casual",t:"I know. You don't have to say it. …But you can say it again"}]}]}],
   [{n:"nar",t:"Alicia is reading comments on her phone. Her finger stops on one for too long"},{n:"alicia",f:"sad",l:"casual",t:"'Famous for her face' …people still type it, even after the cup",choice:[
     {t:"\"The cup didn't come from your looks\"",b:5,then:[{n:"alicia",f:"flustered",l:"casual",t:"…I know. But when you say it, it sounds truer than when I say it"}]},
     {t:"Turn her screen off",b:4,then:[{n:"alicia",f:"happy",l:"casual",t:"Rude. …Thank you"}]}]}],
   [{n:"nar",t:"Rin and Alicia go over the camp's fight contracts together. Two red pens"},{n:"alicia",f:"happy",l:"casual",t:"Clause 6, the purse is too low. Manager, can you negotiate?",choice:[
     {t:"\"Teach me\"",b:5,then:[{n:"alicia",f:"happy",l:"casual",t:"Lesson one: don't smile before the other side names a number. …You're smiling right now. Fail"}]},
     {t:"\"I've got you and Rin\"",b:4,then:[{n:"alicia",f:"flustered",l:"casual",t:"Taking advantage, obviously. …Fine, I'll do it"}]}]}]],
  love:[{n:"nar",t:"Alicia takes you on the Ayutthaya boat again. Her phone stays switched off in her bag"},{n:"alicia",f:"flustered",l:"casual",t:"Last time I said tonight isn't content… this time too, and next time as well"},{n:"alicia",f:"happy",l:"casual",t:"Don't get used to it. …Kidding. Get used to it"}],
  conf:()=>[{n:"nar",t:"Alicia closes the training room door and turns off the spotlights, leaving only the small bulb above the bag"},{n:"alicia",f:"flustered",l:"casual",t:"Listen. I'm saying this once. No retakes"},{n:"alicia",f:"flustered",l:"casual",t:"I like you. Not as a manager. Answer straight. I don't like contracts I can't read"}],
  yes:()=>"…Deal. This contract never expires, but it doesn't say forever either. It renews every day",no:"OK. I respect the answer. …Not crying. My eyes are just dry",bye:"…I understand. I don't sign anything the other side doesn't want to sign anyway"},
 chaba:{letter:"Manager\n\nMy brother says go\nHe says he can live in Phuket alone, he can look after himself\n\nMali says the room next to hers is still free\n\nIf there's no room, that's fine\n— Chaba",
  leave:[{n:"nar",t:"Phuket pier in the morning. Chaba's brother wheels himself all the way to the gate of the Chaiya Andaman camp to see her off"},{n:"nar",t:"He hands her a seashell. \"Give this to Mali. Say it's from me\""},
   {n:"chaba",f:"sad",l:"casual",t:"…I'll come home every Chak Phra. Never miss one"},{n:"nar",t:"Chaba gets in the car without looking back, and only checks the mirror after the first bend"}],
  arrive:[{n:"nar",t:"Chaba arrives with one backpack and a bag of khanom la"},{n:"chaba",f:"happy",l:"casual",t:"Manager. Take care of me"}],
  pair:"Pi Chaba! Your room's next to Mali's. Mali put on hibiscus sheets for you!",pairBack:"…Didn't have to. (That night the whole camp sees her asleep hugging a pillow with the same print)",
  hang:[
   [{n:"nar",t:"Chaba is fixing the fence behind the camp again, though the fence isn't broken"},{n:"chaba",f:"happy",l:"casual",t:"Pass the hammer",choice:[
     {t:"Pass the hammer and hold the boards",b:5,then:[{n:"nar",t:"Two hours pass with barely a word. The fence is much sturdier than before"},{n:"chaba",f:"happy",l:"casual",t:"…Good, today"}]},
     {t:"\"The fence isn't broken, you know\"",b:3,then:[{n:"chaba",f:"pout",l:"casual",t:"I know. I want to hammer"}]}]}],
   [{n:"nar",t:"A stray cat is asleep on Chaba's lap. She hasn't moved for forty minutes"},{n:"chaba",f:"flustered",l:"casual",t:"…Don't like it. It just came",choice:[
     {t:"Sit down beside her and say nothing",b:5,then:[{n:"nar",t:"The cat moves to your lap. Chaba looks at it like she's been betrayed, then laughs softly"}]},
     {t:"\"Want to give it a name?\"",b:4,then:[{n:"chaba",f:"happy",l:"casual",t:"…Khai Khem. (Salted Egg — Mali is happy all day when she hears it)"}]}]}],
   [{n:"nar",t:"Sunday evening, Chaba is on a video call with her brother, and hands you the phone mid-call"},{n:"chaba",f:"flustered",l:"casual",t:"My brother wants to talk to the manager",choice:[
     {t:"\"You can leave your sister with me\"",b:5,then:[{n:"nar",t:"Her brother laughs. Chaba grabs the phone back and hangs up at once, red all the way down her neck"}]},
     {t:"Tell him how hard Chaba trains",b:4,then:[{n:"chaba",f:"happy",l:"casual",t:"…You don't have to tell him everything"}]}]}]],
  love:[{n:"nar",t:"Chaba asks you out to the sea at night. She rides the sidecar bike over herself, even though you have a car"},{n:"chaba",f:"flustered",l:"casual",t:"You ride first, same as always"},{n:"chaba",f:"happy",l:"casual",t:"…Can you stay one more day? Same question as before"}],
  conf:()=>[{n:"nar",t:"Chaba knocks three times, then stands so still for so long that you open the door yourself"},{n:"chaba",f:"flustered",l:"casual",t:"Manager"},{n:"nar",t:"The wind passes once"},{n:"chaba",f:"flustered",l:"casual",t:"…Like you. That's all. Can't talk long"}],
  yes:()=>"…Mm. (She squeezes your hand tight, then just walks back to her room)",no:"…It's fine. We can still fix fences together",bye:"…Got it. No need to say more"}};
/* v1.91.30: champions who move in get a profile, gift tastes and gift lines like the main cast */
const RG_PROF={
 baibua:{height:"165 cm",blood:"A",bday:"12 November (Yi Peng)",home:"Chiang Mai · a wooden house behind her father's small camp",heritage:"Muay Tha Sao (same lineage as Kati)",
  personality:"Shy, reserved, soft-spoken, apologises before every counter elbow, yet never backs down in the ring",likes:["Khao soi from a hidden stall behind the market","Mist before dawn","Teen chok embroidery"],
  dislikes:["Being stared at while she talks","Cameras","Food that isn't spicy"],hobby:"Embroiders teen chok for the people who matter, slowly, so it finishes later",
  story:"Carried her father's small camp alone since his knee went: training, dishes, accounts, until she saw Sirichai Camp where everyone helps",secret:"Her first contract letter had one sentence she wrote and erased, erased until the paper wore thin"},
 tabtim:{height:"168 cm",blood:"B",bday:"14 April",home:"Korat · a rice-field house where her father once boxed at temple fairs",heritage:"Muay Korat (same lineage as Ploy)",
  personality:"Loud, laughs easily, cries even more easily. Wild outside the ring, calculates every step inside it",likes:["Som tam with ten chillies","Mor lam sing","Grilled chicken with hot sticky rice"],
  dislikes:["Long silences","Eating alone","People who look down on country kids"],hobby:"Dancing alone in the middle of the yard when nobody's watching (everyone is)",
  story:"Fights to put her younger brother through law school. Her father, a temple-fair boxer, never came to watch her fight until the day she won the Isan cup",secret:"Practised saying 'I like you' in Isan in the mirror for three weeks before saying it"},
 alicia:{height:"170 cm",blood:"AB",bday:"January 1",home:"Bangkok · a condo the sponsor rented (moved out)",heritage:"Muay Lopburi (same lineage as Rin)",
  personality:"Tsundere, stubborn, works harder than she lets anyone see, slips into English when flustered",likes:["Royal Thai sweets","Boat rides at night","Contracts you can read in five minutes"],
  dislikes:["The words 'famous for her face'","Contracts with the word forever","Being told to smile"],hobby:"Edits her training clips at 2 a.m. and never posts them",
  story:"Famous since her first fight for her looks, so she trained harder than anyone so people would remember her fists, not her face",secret:"The first hand wraps she bought herself at fifteen are still in her bag, though half of them are torn"},
 chaba:{height:"160 cm",blood:"O",bday:"5 October",home:"Born in Chaiya next door to Mali · grew up in Phuket",heritage:"Muay Chaiya (same lineage as Mali)",
  personality:"Still, quiet, deadpan funny, weak to anything cute",likes:["Khao yam","Stray cats","The sea at night"],
  dislikes:["People who talk too long","Cameras pointed at her brother","Being asked if she's tired"],hobby:"Fixing things that aren't broken",
  story:"Her brother's boat capsized and left him in a wheelchair. Chaba has fought in his place since that night, and moved from Chaiya to Phuket without saying goodbye to Mali",secret:"Eleven letters to Mali she never sent. She still remembers every line"}};
const RG_GPREF={baibua:{love:["malai","tea","n_umbrella"],like:["sketch","wrap","khanom","photo"],dislike:["coffee"]},
 tabtim:{love:["sausage","i_pillow","photo"],like:["khanom","stickers","shorts","doll"],dislike:["book"]},
 alicia:{love:["bracelet","c_khon","spa"],like:["tea","sketch","photo","coffee"],dislike:["sausage"]},
 chaba:{love:["doll","s_talung","s_pearl"],like:["khanom","wrap","photo"],dislike:["stickers"]}};
const RG_GLINES={baibua:{love:"…This is really for me? I'll take good care of it",like:"Thank you, it's lovely",ok:"Thank you",dislike:"…I'll give it a try"},
 tabtim:{love:"Oh! This is exactly what I wanted! Love it!",like:"Thanks! I'll use it every meal",ok:"Thanks a lot!",dislike:"…This one makes me sleepy. Thanks though"},
 alicia:{love:"…How did you know I like this? I'm not happy or anything. Just… thank you",like:"Not bad taste. Acceptable",ok:"Thank you",dislike:"I don't eat much of that. …But thanks"},
 chaba:{love:"……(She hugs it tight and looks away)",like:"…Like it",ok:"Thank you",dislike:"…Just leave it there"}};
for(const cid of Object.keys(RG_PROF)){RG_PROF[cid].age=18+stableHash(cid+"age")%13; /* the age she always had */if(typeof PROFILES!=="undefined"&&!PROFILES[cid])PROFILES[cid]=RG_PROF[cid];if(typeof GIFT_PREF!=="undefined"&&!GIFT_PREF[cid])GIFT_PREF[cid]=RG_GPREF[cid];
  if(typeof GIFT_LINES!=="undefined"&&!GIFT_LINES[cid])GIFT_LINES[cid]=RG_GLINES[cid];if(typeof SOUV_LOVE!=="undefined"&&!SOUV_LOVE[cid])SOUV_LOVE[cid]=RG_GPREF[cid].love.filter(g=>GIFTS[g]&&GIFTS[g].souv);}
/* the girl closest to you who notices a champion lover while you are with her */
const RG_TWO={kati:"Coach… I've heard already. I don't have to ask, but it's not like I don't know",mali:"Mali saw who was holding whose hand last night… Mali isn't crying. Not crying",
 baibua:"…I've seen it. I don't have to ask, but my heart isn't blind",tabtim:"Manager… I'm not stupid, you know. I see it. I just don't say it",alicia:"I'm not blind. …I just haven't decided how angry to be",chaba:"…Seen it",
 rin:"Lately the hours you disappear don't match the schedule. I've logged it. I don't need an explanation, I just want you to know that I know",ploy:"…Don't say it. I've seen it",fah:"Hey! You think Fah's blind?! …Don't answer. Fah's going to train"};
Object.assign(REGION,{
  /* v1.91.30 (Man): champions you know show in the Characters tab — before she moves in, her hearts follow your closeness with her */
  bondSync(G){const R=G.region;if(!R)return;for(const cid of Object.values(RG_CID0)){const f=G.F[cid];if(f&&!Number.isFinite(f.age)){delete f.ageAnchorWeek;delete f.age;if(typeof syncFighterAges==="function")syncFighterAges(G);}}for(const r of RG_ORDER){const cid=RG_CID0[r],f=G.F[cid];if(!f||(R.joined&&R.joined[cid]))continue;f.bond=rgBondOf((R.meet||{})[cid]);f.bondX=0;}},
  peopleIds(G){const R=G.region;if(!R)return [];return RG_ORDER.map(r=>RG_CID0[r]).filter(cid=>{const f=G.F[cid];return f&&((R.joined&&R.joined[cid]&&f.camp==="player")||f.met||((R.meet||{})[cid]>0));});},
  campOf(cid){const r=RG_ORDER.find(x=>RG_CID0[x]===cid);return r?{north:"Champion of the North",isan:"Champion of Isan",central:"Champion of the Central Plains",south:"Champion of the South"}[r]:"";},
  /* her move from her champion days, shown in the skill tab like a signature */
  perkCard(f){const r=f&&RG_ORDER.find(x=>RG_CID0[x]===f.id),R=G.region;if(!r||!R||!R.joined||!R.joined[f.id])return "";if(typeof TRAITS!=="undefined"&&TRAITS[f.id])return ""; /* v1.91.45: shown in the hidden-power box now */const P=RG_CH0[r].perk;
    return `<div class="sigcard on rg-perk"><b>✦ Signature trait: ${esc(P.name)}</b><p class="meta">${esc(P.desc)} · hers since she was champion of ${esc(RG0[r].name)} · works in every fight, no skill slot needed</p>${typeof traitLvRow==="function"&&G.F[f.id]&&G.F[f.id].camp==="player"?traitLvRow(f,true):""}</div>`;},
  joinRooms(G){const R=G.region,J=R.joined||{};return CANON_IDS.filter(id=>G.F[id]&&G.F[id].camp==="player").length+Object.keys(J).filter(c=>G.F[c]&&G.F[c].camp==="player").length;},
  /* the champion's skill tree is her lineage's — the partner girl's tree (Tha Sao / Korat / Lopburi / Chaiya) */
  /* v1.91.45: each champion's second hidden power (the first is the signature perk she brought as a champion) */
  /* v1.91.45 (Man): every champion has her tree from the start — as a rival she fights with skills learned along her own line, and the same tree comes with her when she joins */
  treeInit(){for(const r of RG_ORDER){const cid=RG_CID0[r],pr=RG_CH0[r].pair;if(typeof REQ_ALIAS!=="undefined")REQ_ALIAS[cid]=pr;
      {const P=RG_CH0[r].perk,T2=RG_TRAIT2[cid];if(typeof TRAITS!=="undefined"&&P&&T2&&!TRAITS[cid])TRAITS[cid]=[{id:"rgp_"+cid,name:P.name,desc:P.desc,fx:P.fx},{id:"rg2_"+cid,...T2}];}
      if((!SKILLS[cid]||SKILLS[cid]===SKILLS[pr])&&SKILLS[pr]){const C=RG_CAP[cid]||{};SKILLS[cid]=SKILLS[pr].map(s=>{const c=C[s.id];if(!c)return s;const [id,name,desc,ad]=c;return {...s,id,name,desc,fx:r=>rgFxAdd(s.fx(r),ad(r))};});}}},
  /* fresh build along her home line: 3 points a level, home line first, then build lines, then the rest */
  autoLearn(G,cid){const f=G.F[cid];if(!f)return;f.skills={};f.equip=[];f.sp=3*Math.max(0,(f.lvl||1)-1);const L=RG_HOME_LINE[cid],ord=[...skillList(cid)].sort((x,y)=>((x.line===L?0:x.school==="build"?1:2)-(y.line===L?0:y.school==="build"?1:2)));
    let go=true;for(let i=0;go&&f.sp>0&&i<400;i++){go=false;for(const sk of ord){if(f.sp>0&&learnSkill(G,cid,sk.id)){go=true;break;}}}},
  joinSkills(G){this.treeInit();const J=(G.region&&G.region.joined)||{};for(const r of RG_ORDER){const cid=RG_CID0[r],pr=RG_CH0[r].pair;if(!J[cid])continue;
      {const g=G.F&&G.F[cid];if(g&&g.trLv==null){g.trLv=3;g.trBase=3;}} /* v1.91.45 (Man): same standard as the main five — two hidden powers to switch, 10 levels at 5 points; a champion arrives at Lv.3 (her full champion strength) */
    /* v1.91.43 (Man): same roots as her lineage partner, but the Lv.42 legend tips are her own — new name, her story, plus a small signature bonus */
    {const f=G.F&&G.F[cid],C=RG_CAP[cid]||{};if(f)for(const o in C){const n=C[o][0];if(f.skills&&f.skills[o]){f.skills[n]=(f.skills[n]||0)+f.skills[o];delete f.skills[o];}if(Array.isArray(f.equip))f.equip=f.equip.map(x=>x===o?n:x);}}
    /* v1.91.38: in the camp she fights like a main-cast fighter on her lineage's lines — her own home line, the line's style, the same per-line balance as her partner */
    if(typeof HOME_STYLE!=="undefined"&&!HOME_STYLE[cid]){const L=RG_HOME_LINE[cid],sch=(SKILLS[pr]||[]).find(s=>s.school&&s.school!=="build");HOME_LINE[cid]=L;HOME_STYLE[cid]=((LINE_STYLE[sch&&sch.school]||[])[L])||HOME_STYLE[pr];if(LINE_K[pr]&&!LINE_K[cid])LINE_K[cid]=LINE_K[pr];}}},
  joinWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||!F.won||now<(F.wonAbs||0)+3)return;R.joined=R.joined||{};R.offers=R.offers||[];R.joinQ=R.joinQ||[];R.offers=R.offers.filter(c=>!R.joined[c]);R.joinQ=R.joinQ.filter(c=>!R.joined[c]&&!(R.joinPend&&R.joinPend.cid===c));
    const m=R.meet||{};for(const r of RG_ORDER){const cid=RG_CID0[r];if(rgEd(G)>=2&&!(R.nc&&R.nc[r])&&!(R.champ[r]&&R.champ[r].state==="won"))continue;if(!R.joined[cid]&&!(R.joinPend&&R.joinPend.cid===cid)&&!R.offers.includes(cid)&&!R.joinQ.includes(cid)&&!(R.joinGone||{})[cid]&&(m[cid]||0)>=RG_JOIN_MIN)R.joinQ.push(cid);}
    R.joinQ.sort((a,b)=>(m[b]||0)-(m[a]||0));
    if(R.joinQ.length&&now>=(R.joinNext||0)){const cid=R.joinQ.shift(),r=RG_ORDER.find(x=>RG_CID0[x]===cid);R.offers.push(cid);R.joinNext=now+RG_JOIN_GAP;
      addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`Application from ${RG[r].champ}`,body:RG_JOIN[cid].letter+`

(Contract: signing fee ${fmt(RG_JOIN_FEE)} · wage ${fmt(RG_JOIN_WAGE)}/week · trait: ${RG_TRAIT[cid].name} · she will need rebuilding: 5 levels lower, slightly lower stats · see the contract on the Camp page › Coaches & Fighters)`});}},
  joinOk(G,cid){const R=G.region;if(!R.offers||!R.offers.includes(cid)||(R.joined&&R.joined[cid]))return "No such contract";if(R.joinPend)return "Wait for the one who already said yes to move in first";{const r=RG_ORDER.find(x=>RG_CID0[x]===cid);if(rgEd(G)>=2&&!(R.nc&&R.nc[r])&&R.champ[r]&&R.champ[r].state!=="won")return "She is defending her regional title · win this edition's cup first";}
    if(this.joinRooms(G)>=dormRooms(G))return `Rooms full (${dormRooms(G)} rooms) · upgrade the dorm first`;if(G.cash<RG_JOIN_FEE)return `Not enough cash · signing fee ${fmt(RG_JOIN_FEE)}`;return "";},
  joinAccept(G,cid){const why=this.joinOk(G,cid);if(why){toast(why);return;}const R=G.region;G.cash-=RG_JOIN_FEE;R.offers=R.offers.filter(x=>x!==cid);R.joinPend={cid,abs:gameWeek(G)+1};
    G.log=G.log||[];G.log.push(`Signed a contract with ${G.F[cid]?G.F[cid].name:cid} · signing fee ${fmt(RG_JOIN_FEE)} · moves in next week`);toast(`Contract signed · ${G.F[cid]?G.F[cid].name:""} moves in next week`);},
  joinApply(G,cid){if(G.region.joined&&G.region.joined[cid])return; /* v1.91.35: never twice */const R=G.region,r=RG_ORDER.find(x=>RG_CID0[x]===cid),f=G.F[cid]||this.champFighter(G,r),pair=G.F[RG_CH[r].pair],now=gameWeek(G);
    f.camp="player";f.canon=true;f.met=true;f.div=(pair&&(pair.div==="A"||pair.div==="B"))?pair.div:"A";
    f.lvl=Math.max(10,(f.rgSkLv||f.lvl||14)-RG_JOIN_LVDROP);for(const k in f.a)f.a[k]=Math.round(Math.min(20,f.a[k])*RG_JOIN_STAT*10)/10;f.vet=0; /* v1.91.45 (Man): she has to be rebuilt — level −5, stats ×0.9, ring craft stays behind */
    f.spv=2;f.xp=0;f.wage=RG_JOIN_WAGE;f.fee=0;f.potential=20;f.fatigue=0;f.injury=0;f.morale=80;f.trust=Math.max(f.trust||0,50);
    f.bond=Math.max(f.bond||0,Math.max(30,rgBondOf(R.meet[cid])));f.joinAbs=now;f.lastTouch=absWeek(G);delete f.rgKey;delete f.rgT;delete f.rgSty;
    G.rank=G.rank||{A:{},B:{}};G.rank[f.div]=G.rank[f.div]||{};if(!G.rank[f.div][f.id])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};
    (R.joined=R.joined||{})[cid]=now;this.joinSkills(G);
    /* v1.91.39 (Man): she arrives with her skills already learned along her own line, like a fighter who has been building for years — the player can look and reset */
    this.autoLearn(G,cid);delete f.rgSkLv;if(typeof syncFighterAges==="function")syncFighterAges(G);
    G.log=G.log||[];G.log.push(`${f.name} moves into Sirichai Camp · Lv.${f.lvl} · skill points ${f.sp}`);},
  joinSteps(G,cid){const r=RG_ORDER.find(x=>RG_CID0[x]===cid),J=RG_JOIN[cid],pid=RG_CH[r].pair,pf=G.F[pid],top=typeof rgTopGirl==="function"?rgTopGirl(G):null;
    const S=[...J.leave,{n:"nar",t:"This week, Sirichai Camp has a new member"},...J.arrive];
    if(pf&&pf.camp==="player")S.push({n:pid,f:"happy",l:"casual",t:J.pair},{n:cid,f:"happy",l:"casual",t:J.pairBack});
    else S.push({n:"coach",t:`The room at the end of the hall is free. ${RG[r].champ} takes that room. Dinner at six sharp. Late means no side dishes`});
    if(top&&top.id!==pid)S.push({n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,RG[r].champ)});
    S.push({n:"nar",t:`${RG[r].champ} has joined the camp · train, fight and spend time together from the Battle of the Four Regions page · she gets skill points in the same lineage as ${pf?pf.name:"her lineage partner"}`});return S;},
  /* romance: one-love or two-timing, never the harem team */
  isLovC(G,cid){const L=G.region&&G.region.lov;return !!(L&&L[cid]!=null);},
  confDue(G){const R=G.region,J=R.joined||{},now=gameWeek(G);R.confN=R.confN||{};R.confNo=R.confNo||{};
    for(const cid of Object.keys(J)){const f=G.F[cid];if(!f||f.camp!=="player"||this.isLovC(G,cid)||(R.ex&&R.ex[cid]!=null)||isAway(G,cid))continue;
      if((f.bond||0)<75||now-(J[cid]||now)<6||(R.confN[cid]||0)>=3)continue;if(R.confNo[cid]!=null&&now-R.confNo[cid]<13)continue;return cid;}return null;},
  confSteps(G,cid){const J=RG_JOIN[cid],R=G.region,two=partners(G).length>0||Object.keys(R.lov||{}).some(k=>k!==cid);R.confN[cid]=(R.confN[cid]||0)+1;
    const warn=two?[{n:"nar",t:"⚠ You already have someone. Saying yes means two-timing… a regional champion can't join the harem team"}]:[];
    return [...J.conf(G),...warn,{n:"nar",t:"She waits for your answer",choice:[
      {t:two?"\"I like you too\" (two-timing)":"\"I like you too\"",fx:G2=>REGION.takeC(G2,cid),then:[{n:cid,f:"happy",l:"casual",t:J.yes(G)}]},
      {t:"\"Let's stay like this for now\"",fx:G2=>{G2.region.confNo[cid]=gameWeek(G2);add(G2,cid,"trust",3);},then:[{n:cid,f:"sad",l:"casual",t:J.no}]}]}];},
  takeC(G,cid){const R=G.region,now=gameWeek(G);R.lov=R.lov||{};const P=[...partners(G),...Object.keys(R.lov).filter(k=>k!==cid&&G.F[k])];R.lov[cid]=now;if(P.length&&G.mono)delete G.mono;if(R.ex)delete R.ex[cid];const f=G.F[cid];if(f)f.morale=Math.min(100,(f.morale||0)+15);
    if(P.length){const top=P.map(k=>G.F[k]).filter(Boolean).sort((a,b)=>((b.bond||0)+(b.bondX||0))-((a.bond||0)+(a.bondX||0)))[0];if(top)R.twoQ={id:top.id,cid,abs:now+3};}
    G.log=G.log||[];G.log.push(`${f?f.name:cid} and the Manager started dating ${P.length?" (two-timing)":""}`);},
  breakC(G,cid){const R=G.region,f=G.F[cid];if(!this.isLovC(G,cid))return;delete R.lov[cid];(R.ex=R.ex||{})[cid]=gameWeek(G);if(R.twoQ&&R.twoQ.cid===cid)delete R.twoQ;if(f)add(G,cid,"bond",-35);},
  hangC(G,cid){const f=G.F[cid];if(!f||G.freeUsed||isAway(G,cid))return;const J=RG_JOIN[cid],R=G.region;R.hangI=R.hangI||{};const i=R.hangI[cid]||0,lov=this.isLovC(G,cid);
    const P=lov&&i%2===1?J.love:J.hang[Math.floor(i/(lov?2:1))%J.hang.length];R.hangI[cid]=i+1;G.freeUsed=true;f.hangWk=G.week;
    const S=P.map(x=>x.choice?{...x,choice:x.choice.map(o=>({t:o.t,fx:G2=>{add(G2,cid,"bond",o.b);add(G2,cid,"morale",3);},then:o.then}))}:{...x});
    if(!S.some(x=>x.choice))S.push({fx:G2=>{add(G2,cid,"bond",5);add(G2,cid,"morale",3);}});
    save();playScene(S,()=>{save();render();},{bg:"camp",look:"casual"});},
  /* v1.91.30 (Man): contracts show where every contract shows (camp › trainers & fighters); the champions who moved in live in the Characters tab */
  joinCard(G){const R=G.region;return R&&R.joinPend&&G.F[R.joinPend.cid]?`<section class="px card rg-join"><p class="meta">🏠 ${esc(G.F[R.joinPend.cid].name)} is on her way · arrives at camp next week</p></section>`:"";},
  recruitHTML(G){const R=G.region,offers=(R&&R.offers||[]).filter(cid=>G.F[cid]);if(!offers.length)return "";
    return `<section class="px card recruit rg-recruit"><h3><span class="newb">NEW!</span> A regional champion wants to join</h3>${offers.map(cid=>{const f=G.F[cid],r=RG_ORDER.find(x=>RG_CID0[x]===cid),T=RG_TRAIT[cid],why=this.joinOk(G,cid);
      return `<div class="rcard"><button class="rface" data-act="fighter" data-id="${cid}" aria-label="View info ${esc(f.name)}"><img src="${faceSrc(cid,"happy")}" alt=""></button>
       <div class="rinfo"><b>${esc(f.name)} <small>Champion of ${esc(RG[r].name)}</small></b><span class="meta">Trait <b class="goldt">${esc(T.name)}</b> · ${esc(T.desc)}</span><span class="meta">Signing fee ${fmt(RG_JOIN_FEE)} · wage ${fmt(RG_JOIN_WAGE)}/week · rooms ${this.joinRooms(G)}/${dormRooms(G)}</span>${why?`<span class="meta redt">${esc(why)}</span>`:""}</div>
       <div class="rbtns"><button class="btn sm" data-act="fighter" data-id="${cid}">Details</button><button class="btn sm gold" data-act="rgjoin" data-v="${cid}" ${why?"disabled":""}>Sign</button></div></div>`;}).join("")}
     <p class="meta">A new camp takes some settling in · she arrives 5 levels lower with slightly lower stats, to be built up again here (her hidden power and trait come in full) · no need to answer now, the contract will wait</p></section>`;},
  /* the camp-wide side of each champion's trait, once a week */
  joinPerks(G){const J=(G.region&&G.region.joined)||{},mine=roster(G);
    for(const cid of Object.keys(J)){const f=G.F[cid];if(!f||f.camp!=="player"||isAway(G,cid))continue;
      if(cid==="baibua")for(const x of mine)if(x.id!==cid){const cap=stCap(x);for(const k of ["elbow","counter"])if(x.a[k]<17)x.a[k]=Math.min(cap,Math.round((x.a[k]+.04)*100)/100);} /* she teaches the ones still learning */
      if(cid==="tabtim")for(const x of mine)x.morale=Math.min(100,(x.morale||0)+2);
      if(cid==="alicia"){const v=Math.round((1500+Math.min(G.rep||0,60)*60)/100)*100;G.cash+=v;G.rep=Math.round(((G.rep||0)+.05)*100)/100;G.log=G.log||[];G.log.push(`Alicia streams training with the camp · ad income ${fmt(v)}`);}
      if(cid==="chaba")for(const x of mine)if(x.injury>0)x.injury=Math.max(0,x.injury-1);}},

});
if(typeof ACT!=="undefined")Object.assign(ACT,{
  rgjoin:d=>{REGION.joinAccept(G,d.v);save();render();},
  rghang:d=>REGION.hangC(G,d.v),
  rgbreak:d=>{if(!REGION.isLovC(G,d.v))return;UI.modal={type:"rgbreak",cid:d.v};render();},
  rgbreakgo:d=>{const cid=d.v,J=RG_JOIN[cid];UI.modal=null;if(!REGION.isLovC(G,cid))return;REGION.breakC(G,cid);
    playScene([{n:cid,f:"sad",l:"casual",t:J.bye},{n:"nar",t:`${G.F[cid].name} and the manager have broken up · she stays at the camp`}],()=>{save();render();},{bg:"camp_night",look:"casual"});},
});
if(typeof XMODAL!=="undefined")XMODAL.rgbreak=m=>({body:`<h2>Break up with ${esc(G.F[m.cid].name)}?</h2><p>Your closeness drops a lot · she stays at the camp, but she won't confess again</p><div class="mfoot"><button class="btn" data-act="closeModal">Not now</button><button class="btn primary" data-act="rgbreakgo" data-v="${m.cid}">Break up</button></div>`,foot:false});
/* ---------- v1.91.34 the Four Regions every 3 years (Man) ----------
   · a new edition opens 3 years after the last one began (the first needs its underground final won), never mid-trip or mid-series
   · province champions are decided by the bots: a 4-woman bracket per province (last edition's holder + 3 challengers), real quick fights — whoever wins holds the belt, each with her own history
   · a regional champion still at her own camp returns stronger; one who moved in to Sirichai is replaced by a new champion (a bracket of the four province runners-up)
   · regional champion data is swapped into the shared tables (RG / RG_CID / champId / RG_CH) per save by rgApply */
const RG_LOOP={wk:156,rest:26,eb:.2,cb:.3,nb:.15,cap:3};
const RG_CH0={...RG_CH};
const RG_FN=["Daoruang","Praewa","Khwanjai","Nilubon","Amphan","Rungnapha","Janpen","Butsaba","Lamduan","Prakai","Mukda","Thongkwao","Pikul","Kalong","Leelawadee","Ketkaew","Saimai","Namkhang","Kaewta","Baitoey","Maprang","Pomelo","Buaphan","Champa","Chomphu","Phakakrong","Rerai","Parichat","Bunga","Anchan","Dala","Ratri","Fueangfa","Phutson","Yihup","Karaket","Soithong","Nuanchan"];
const RG_PRE=["Sor.","Sit ","Luk "];
const RG_PL={chiangrai:["Chiang Saen","Doi Tung","Mae Chan"],nan:["Pua","Bo Kluea","Wiang Sa"],uttaradit:["Laplae","Tha Pla","Phichai"],lampang:["Ko Kha","Chae Hom","Thoen"],
 udon:["Kumphawapi","Ban Chiang","Nong Han"],khonkaen:["Phu Wiang","Chum Phae","Nam Phong"],buriram:["Nang Rong","Prakhon Chai","Lam Plai Mat"],ubon:["Phibun","Khong Chiam","Warin"],
 lopburi:["Ban Mi","Tha Wung","Khok Samrong"],suphan:["U Thong","Song Phi Nong","Bang Pla Ma"],phetchaburi:["Cha-am","Ban Lat","Tha Yang"],chanthaburi:["Tha Mai","Khlung","Laem Sing"],
 chumphon:["Lang Suan","Pak Nam","Tha Sae"],surat:["Don Sak","Ko Samui","Phunphin"],nakhonsi:["Pak Phanang","Thung Song","Khanom"],songkhla:["Sathing Phra","Ranot","Chana"]};
const RG_FN_EN=["Daoruang", "Praewa", "Khwanjai", "Nilubon", "Amphan", "Rungnapha", "Janpen", "Butsaba", "Lamduan", "Prakai", "Mukda", "Thongkwao", "Phikun", "Kalong", "Leelawadee", "Ketkaew", "Saimai", "Namkhang", "Kaewta", "Baitoey", "Maprang", "Som-o", "Buaphan", "Champa", "Chomphu", "Phakakrong", "Rerai", "Parichat", "Bunga", "Anchan", "Dala", "Ratri", "Fueangfa", "Phutson", "Yihup", "Karaket", "Soithong", "Nuanchan"],RG_PRE_EN=["Sor.","Sit ","Luk "],RG_PL_EN={chiangrai: ["Chiang Saen", "Doi Tung", "Mae Chan"], "nan": ["Pua", "Bo Kluea", "Wiang Sa"], "uttaradit": ["Laplae", "Tha Pla", "Phichai"], "lampang": ["Ko Kha", "Chae Hom", "Thoen"], "udon": ["Kumphawapi", "Ban Chiang", "Nong Han"], "khonkaen": ["Phu Wiang", "Chum Phae", "Nam Phong"], "buriram": ["Nang Rong", "Prakhon Chai", "Lam Plai Mat"], "ubon": ["Phibun", "Khong Chiam", "Warin"], "lopburi": ["Ban Mi", "Tha Wung", "Khok Samrong"], "suphan": ["U Thong", "Song Phi Nong", "Bang Pla Ma"], "phetchaburi": ["Cha-am", "Ban Lat", "Tha Yang"], "chanthaburi": ["Tha Mai", "Khlung", "Laem Sing"], "chumphon": ["Lang Suan", "Pak Nam", "Tha Sae"], "surat": ["Don Sak", "Ko Samui", "Phunphin"], "nakhonsi": ["Pak Phanang", "Thung Song", "Khanom"], "songkhla": ["Sathing Phra", "Ranot", "Chana"]};
const RG_TR=["A farmer's daughter who practises kicks on rice sacks in the granary","School track athlete who switched to Muay Thai at sixteen","Her father referees temple-fair bouts; she's watched fights since she can remember",
 "Sold meatballs outside the stadium every night until a camp owner asked her to try fighting","Fights to put two younger siblings through school","Former provincial taekwondo team member, kicks hard but her range control is loose",
 "Runs up three hundred temple steps every morning","Drives deliveries by day, trains by night","Granddaughter of an old-school teacher, wears her grandfather's mongkhon",
 "Knocked out in round one of her first fight, never knocked out since","Nursing student who took half a year off to try for the belt","Trains with her twin sister in the same weight class",
 "Streams training daily to fifty regular viewers","Learned Muay Thai from phone clips before any camp took her","Works the factory night shift, then trains in the morning","Was the last regional champion's sparring partner"];
const RG_NK={north:["Elbow Queen of Lanna","Mountain Leopard","Twin Swords of Laplae"],isan:["Isan Kick Storm","Queen of Thung Kula","Golden Silk, Heavy Hands"],
 central:["Queen of the Chao Phraya","Diamond of Phetchaburi","Golden Monkey of Lopburi"],south:["Andaman Giant Wave","Southern Sea Hawk","Samui Storm"]};
const RG_NFX={north:{name:"Mountain Elbow",desc:"Counters +4% · elbows +10%",fx:{ctr:.04,dmg:{elbow:.1}}},isan:{name:"Open-Field Kick",desc:"Kicks +3% accuracy · +8% power",fx:{hit:{kick:.03},dmg:{kick:.08}}},
 central:{name:"Chao Phraya Fist",desc:"Punches +10% · better inside defence",fx:{dmg:{punch:.1},clDef:1}},south:{name:"Breaking Wave",desc:"Evasion +1.5% · recovers stamina 10% faster",fx:{evade:.015,regen:.1}}};
/* a returning champion writes again */
const RG_RET={baibua:"Manager\n\nThe Battle of the Four Regions has come round again. I'm still the Northern champion\n\nI've trained my elbows every morning for three years without missing a day. This time I won't give in easily\n\nWaiting in Chiang Mai\n— Baibua",
 tabtim:"Manager!\n\nTabtim's back! The Isan cup is still in Korat. Whoever wants it can come take it\n\nI've kicked down a lot of banana trees these three years, haha. Come and see!\n\n— Tabtim",
 alicia:"To the manager\n\nThe Central cup is still mine. Don't be surprised\n\nFor three years I trained without turning the camera on once. This isn't content. Bring your best.\n\n— Alicia",
 chaba:"Manager\n\nThe cup's still in Phuket\n\nTrained three years. Didn't stop\n\nCome\n— Chaba"};
const rgEd=G=>(G.region&&G.region.edition)||1;
const rgEdB=(G,k)=>RG_LOOP[k]*Math.min(RG_LOOP.cap,rgEd(G)-1);
const rgEN=()=>typeof CUR_LANG!=="undefined"&&CUR_LANG==="en"; /* names and places are spelled, not translated */
const rgNm=(o,dest)=>{if(!o)return "";const e=rgEN(),N=e?RG_FN_EN:RG_FN,P=e?RG_PRE_EN:RG_PRE,L=e?RG_PL_EN:RG_PL;return `${N[o.f%N.length]} ${P[o.k%P.length]}${(L[dest]||L.chiangrai)[o.p%3]}`;};
/* swap this save's regional champions into the shared tables (idempotent) */
function rgApply(G){const R=G&&G.region,key=R?`${rgEd(G)}|${JSON.stringify(R.nc||{})}`:"-";if(rgApply.k===key&&rgApply.g===G)return;rgApply.k=key;rgApply.g=G;
  for(const r of RG_ORDER){const N=R&&R.nc&&R.nc[r],ret=!N&&rgEd(G)>=2;
    RG[r].champ=N?rgNm(N,N.home):RG0[r].champ;RG[r].nick=N?RG_NK[r][N.nk%3]:RG0[r].nick;
    RG_CID[r]=REGION.champId[r]=N?N.id:RG_CID0[r];
    RG_CH[r]=N?REGION.genH(r,N):ret?Object.assign({},RG_CH0[r],{letter:RG_RET[RG_CID0[r]]||RG_CH0[r].letter,cup:(G2,J)=>REGION.genCup(G2,r,J)}):RG_CH0[r];}}
Object.assign(REGION,{
  spk(r,f,l){const N=G.region&&G.region.nc&&G.region.nc[r];return N?{n:"npc",who:RG[r].champ}:{n:this.champId[r],f,l};},
  /* a new champion who has no art of her own speaks as an NPC */
  genH(r,N){const H0=RG_CH0[r],nm=rgNm(N,N.home),S=(t)=>({n:"npc",who:nm,t}),P=RG_NFX[r];
    return {ring:H0.ring,venue:H0.venue,pair:null,nightBg:H0.nightBg,perk:P,sty:H0.sty,reply:H0.reply,pairLine:H0.reply,
      letter:`Dear Manager of Sirichai Camp

I'm ${nm}, the new champion of ${RG0[r].name}. I hear your camp has collected all four provincial belts

The last champion moved to your camp. I want to know if she chose right

I'll be waiting at ${H0.venue}\n— ${nm}`,
      again:`Manager

The cup is still mine. Send a fighter again whenever you're ready

— ${nm}`,wait:`No problem. Heal up first — ${nm}`,
      pre:[n=>`${n}… I've watched every tape of your camp. Nothing will surprise me today`,n=>`I've changed my plan for this one. Try to keep up`,n=>`Last bout. Let's see who wants the cup more`],
      win:["Thanks for the fight. I won't slip next time","Not over yet","…"],lose:["As good as they say","I won't give the last bout away easily","…"],
      lost:()=>[S("The cup stays with me… but your camp just made me train a lot harder"),{n:"coach",t:"It's not over. Wait for the next challenge letter"}],
      cup:(G2,J)=>this.genCup(G2,r,J),night:()=>[]};},
  genCup(G2,r,J){const R=G2.region,me=G2.F[R.champ[r].fid],ed=rgEd(G2),n=(R.hall||[]).filter(h=>h.k==="cup"&&h.r===r).length+1,top=typeof rgTopGirl==="function"?rgTopGirl(G2):null;
    const who=this.spk(r,"happy","fight");
    return [{n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me?me.name:""}`},{n:"nar",t:`${RG_TITLE[r]}, Edition ${ed} · ${J.w}-${J.l}`},
      {n:"npc",who:"MC",t:`Ladies and gentlemen! The champion's cup of ${RG0[r].name}, Edition ${ed} is… ${me?me.name:""} of Sirichai Gym!`},
      {...who,t:R.nc&&R.nc[r]?"Congratulations. Sirichai Camp really is as strong as they say":"…Lost again, but I went further this time. Congratulations"},
      ...(top?[{n:top.id,f:"happy",l:"fight",t:"You're the best! Another cup for our camp!"}]:[]),
      {n:"coach",t:`This region's cup no. ${n} for the camp… Grandpa Chai wouldn't believe his eyes`}];},
  /* the bots' own tournament for one province: 4 entrants, semis + final, real quick fights */
  bracket(G,seed,ents,tag){const rng=mulberry32(seed),mk=(e,i)=>{const id=`rgb_${tag}_${i}`,f=baseFighter(id,mkNPC(id,"x","X",Math.round(14+e.s*3),mulberry32(seed+i*977),1+i%5));f.lvl=18+Math.round(e.s*6);return f;};
    const F=ents.map(mk),bout=(a,b,k)=>{const Q=quickFight(F[a],F[b],seed+k*131,3),w=Q.result.win==="A"?a:Q.result.win==="B"?b:(rng()<.5?a:b),rt=Q.result.type||"";
      return {w,l:w===a?b:a,m:Q.result.win==="D"||!(/KO|TKO/.test(rt)||Q.result.sub||Q.result.towel)?"pts":"ko",rd:Q.result.round||3};};
    const s1=bout(0,3,1),s2=bout(1,2,2),fi=bout(s1.w,s2.w,3);return {win:fi.w,ru:fi.l,path:[{o:s1.w===fi.w?s1.l:s2.l,m:(s1.w===fi.w?s1:s2).m,rd:(s1.w===fi.w?s1:s2).rd},{o:fi.l,m:fi.m,rd:fi.rd}]};},
  newEnt(rng,used,dest){let f;if(used.size>=RG_FN.length)used.clear();for(let i=0;i<80;i++){f=Math.floor(rng()*RG_FN.length);if(!used.has(f))break;}used.add(f);return {f,k:Math.floor(rng()*3),p:Math.floor(rng()*3),age:18+Math.floor(rng()*9),tr:Math.floor(rng()*RG_TR.length),s:rng()};},
  provTourney(G,ed){const R=G.region,out={},ru={},seed=(G.seed||1)*31+ed*7919;
    const used=new Set();for(const r of RG_ORDER)for(const dest of RG[r].prov){const rng=mulberry32(seed+stableHash(dest)),prev=R.pc&&R.pc[dest];
      const ents=[prev?{...prev,s:Math.min(1,.55+rng()*.4),def:1,age:(prev.age||22)+3}:null].filter(Boolean);if(prev)used.add(prev.f);while(ents.length<4)ents.push(this.newEnt(rng,used,dest));
      const B=this.bracket(G,seed+stableHash(dest),ents,dest),W=ents[B.win],L=ents[B.ru];
      out[dest]={f:W.f,k:W.k,p:W.p,age:W.age,tr:W.tr,ed,reign:W.def?(prev.reign||1)+1:1,prev:prev&&!W.def?{f:prev.f,k:prev.k,p:prev.p}:null,
        path:B.path.map(x=>({o:{f:ents[x.o].f,k:ents[x.o].k,p:ents[x.o].p},m:x.m,rd:x.rd}))};
      ru[dest]={...L,s:L.s};}
    return {pc:out,ru};},
  /* the regional title left vacant by a champion who moved in: the four province runners-up fight for it */
  genChamp(G,r,ed,ru){const seed=(G.seed||1)*17+ed*104729+stableHash(r),ents=RG[r].prov.map(d=>({...ru[d],home:d}));
    const B=this.bracket(G,seed,ents,"c"+r),W=ents[B.win];
    return {id:`rgc_${r}_${ed}`,f:W.f,k:W.k,p:W.p,age:W.age,tr:W.tr,home:W.home,nk:Math.floor(mulberry32(seed)()*3),ed,
      path:B.path.map(x=>({o:{f:ents[x.o].f,k:ents[x.o].k,p:ents[x.o].p,home:ents[x.o].home},m:x.m,rd:x.rd}))};},
  oppName(G,dest){const P=G.region&&G.region.pc&&G.region.pc[dest];return P?rgNm(P,dest):RG_OPP[dest]||"Provincial champion";},
  mtxt(x){return x.m==="ko"?`Stoppage win (round ${x.rd})`:"Decision win";},
  histHTML(P,dest,title){const L=[`Age ${P.age} yrs · ${RG_TR[P.tr%RG_TR.length]}`,
      ...P.path.map((x,i)=>`${i?"Final":"Semifinal"}: ${rgNm(x.o,x.o.home||dest)} · ${this.mtxt(x)}`),
      P.reign>1?`Defended the title · reign ${P.reign}`:P.prev?`Dethroned the old champion ${rgNm(P.prev,dest)}`:""].filter(Boolean);
    return `<details class="rg-hist"><summary>${esc(title)}</summary>${L.map(t=>`<p class="meta">${esc(t)}</p>`).join("")}</details>`;},
  /* when the next edition opens (shown once this one is done) */
  nextEdTxt(G){const R=G.region,ed=rgEd(G),done=ed===1?(R.final&&R.final.won?(R.final.wonAbs||gameWeek(G)):null):R.edDone;if(done==null)return "";
    const abs=Math.max((R.startAbs||0)+RG_LOOP.wk,done+RG_LOOP.rest),y=Math.floor((abs-1)/52)+1,w=((abs-1)%52)+1;return ` · next edition: year ${y} week ${w}`;},
  loopWeekly(G){const R=G.region,now=gameWeek(G),ed=rgEd(G);
    if(ed===1&&!(R.final&&R.final.won))return;
    const doneAbs=ed===1?(R.final.wonAbs||now):R.edDone;
    if(ed>=2&&(R.cups||[]).length>=4&&!R.edDone){R.edDone=now;G.rep+=2;(R.hall=R.hall||[]).push({k:"ed",ed,season:G.season||1});G.log=G.log||[];G.log.push(`Battle of the Four Regions, Edition ${ed}: all 4 cups · fame +2`);}
    if(now<(R.startAbs||0)+RG_LOOP.wk||(doneAbs!=null&&now<doneAbs+RG_LOOP.rest))return;
    if(R.trip||RG_ORDER.some(r=>R.champ[r]&&R.champ[r].state==="series")||R.joinPend)return;
    this.newEdition(G);},
  newEdition(G){const R=G.region,ed=rgEd(G)+1,now=gameWeek(G);
    for(const r of RG_ORDER)if((R.cups||[]).includes(r))(R.hall=R.hall||[]).push({k:"cup",r,ed:ed-1,season:G.season||1});
    const T=this.provTourney(G,ed);R.pc=T.pc;R.nc=R.nc||{};
    Object.assign(R,{edition:ed,startAbs:now,edDone:null,belts:Object.fromEntries(RG_ORDER.map(r=>[r,{}])),cups:[],trip:null,nextTripAbs:now+1});
    for(const r of RG_ORDER){const c0=RG_CID0[r],gone=R.joined&&R.joined[c0];
      if(gone)R.nc[r]=this.genChamp(G,r,ed,T.ru);else delete R.nc[r];
      R.champ[r]={state:"locked",fid:null,w:0,l:0,tries:0,visit:gone?"none":"done"};}
    rgApply.k=null;rgApply(G);
    const lines=RG_ORDER.map(r=>{const N=R.nc[r];return N?`${RG0[r].name}: ${rgNm(N,N.home)} "${RG_NK[r][N.nk%3]}" — new champion (${RG0[r].champ} has moved to Sirichai Camp)`:`${RG0[r].name}: ${RG0[r].champ} — the reigning champion, back and stronger`;}).join("\n");
    addMail(G,{kind:"letter",from:"NAGA Energy Drink",title:`Invitation: Battle of the Four Regions, Edition ${ed}`,
      body:`Dear Manager of Sirichai Camp

The Battle of the Four Regions, Edition ${ed} is open · all 16 provincial belts were decided again in each province's own qualifier. The winners are the new provincial champions waiting for your camp

Regional champions
${lines}

Collect all four provincial belts, then challenge for the cup as before`});
    G.log=G.log||[];G.log.push(`Battle of the Four Regions, Edition ${ed} has begun`);},
});
if(typeof G!=="undefined"&&G&&G.region)REGION.flush(G);
/* v1.91.47 (playtest): styles go in as soon as the chapter loads — the underground board opened before the regional tab was visited showed full-size portraits */
try{REGION.css();}catch(e){}

