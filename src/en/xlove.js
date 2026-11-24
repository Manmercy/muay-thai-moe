/* v1.91.122 (Man): Baiyok and Pailin become characters you can grow close to — chat, gifts, time together, heart scenes and love —
   once the camp has fought her often and beaten her more often than not (6 bouts, 4 wins, any of our fighters).
   Both stay in their own corner of the story: Pailin keeps running Vector in Bangkok; Baiyok, once she is yours and fighting free in white,
   can move into the camp. Their romance keeps its own track (G.xlov / G.xlex) beside the heroines' and the regional champions'. */
const XL_IDS=["prod_B","pailin"],XL_NEED={n:6,w:4};
const xlIs=id=>XL_IDS.includes(id);
const xlRec=(G,id)=>{let n=0,w=0;for(const c of G.cal||[])if(c.b===id&&G.F[c.a]){n++;if(c.res==="W")w++;}return {n,w};};
const xlOn=(G,id)=>!!(G&&G.xl&&G.xl[id]&&G.xl[id].open!=null&&G.F[id]);
const xlLov=(G,id)=>!!(G&&G.xlov&&G.xlov[id]!=null);
const xlLovN=G=>G&&G.xlov?Object.keys(G.xlov).filter(k=>G.F[k]).length:0;
const xlDue=(G,id)=>{const f=G.F[id];if(!f||xlOn(G,id))return false;if(id==="prod_B"&&!(G.prodigy&&G.prodigy.B==="prod_B"))return false;const r=xlRec(G,id);return r.n>=XL_NEED.n&&r.w>=XL_NEED.w;};
const xlWho=id=>id==="prod_B"?"Baiyok":"Pailin";
const xlCamp=(G,f)=>f.camp==="player"?"Sirichai Camp":f.id==="pailin"?"Vector Gym":f.indie?"Independent":"Golden Tiger";
function xlOpen(G,id){G.xl=G.xl||{};G.xl[id]={open:absWeek(G)};const f=G.F[id];f.met=true;f.know=f.know||{};if((f.bond||0)<12)f.bond=12;f.lastTouch=absWeek(G);G.chatIn=G.chatIn||{};G.chatIn[id]=G.week;}
function xlTake(G,id){G.xlov=G.xlov||{};G.xlov[id]=absWeek(G);if(G.xlex)delete G.xlex[id];if(G.friendz)delete G.friendz[id];if(G.mono)delete G.mono;add(G,id,"morale",12);}
function xlBreak(G,id){if(!xlLov(G,id))return;delete G.xlov[id];G.xlex=G.xlex||{};G.xlex[id]=absWeek(G);add(G,id,"bond",-20);add(G,id,"morale",-15);}
/* weekly: new chats once she is close enough (same rhythm as the heroines), a lover texts at least every other week */
function xlWeekly(G){G.chatIn=G.chatIn||{};const rng=mulberry32(G.seed*37+G.week*11+5);
  for(const id of XL_IDS){if(!xlOn(G,id))continue;const f=G.F[id];if(G.chatIn[id]||isAway(G,id))continue;if(gameWeek(G)-(G.chatLastAbs?.[id]??-999)<(xlLov(G,id)?2:3))continue;
    if(xlLov(G,id)||(f.bond||0)>=CHAT_BOND&&rng()<.35+((f.bond||0)>=50?.1:0))G.chatIn[id]=G.week;}}
/* time together — five places each, in order; after that a short visit from a small pool */
function xlHang(id){const f=G.F[id];if(!f||!xlOn(G,id)||G.freeUsed||isAway(G,id))return;G.freeUsed=true;f.lastTouch=absWeek(G);f.xlDate=f.xlDate||0;
  const D=XL_DATE[id],i=f.xlDate,first=i<D.length,d=first?D[i]:XL_AGAIN[id][(i-D.length)%XL_AGAIN[id].length];f.xlDate++;
  const gain=first?7:4;save();AU.startMusic("date");
  playScene([...d.steps(G),{inject:G2=>{add(G2,id,"bond",gain);add(G2,id,"morale",4);return [{n:"nar",t:`Bond with ${f.name} +${gain}`}];}}],()=>{AU.startMusic("hub");save();render();},{bg:d.bg,look:"casual"});}
function xlHangHTML(id){const f=G.F[id],D=XL_DATE[id],i=f.xlDate||0;const nx=i<D.length?D[i].name:"A relaxed meet-up";
  return `<h2>Time with ${esc(f.name)}</h2><p class="meta">${id==="pailin"?"Pailin lives in Bangkok · meet when she's up in Chiang Mai":"Meet wherever suits her"} · uses this week's free time</p>
   <div class="acts"><button class="actbtn hspot" data-act="xhanggo" data-id="${id}" ${G.freeUsed?"disabled":""}><b>${esc(nx)}</b><small>${i<D.length?`New place ${i+1}/${D.length}`:"Free"}</small></button></div>`;}
function xlBreakAsk(id){const f=G.F[id];if(!xlLov(G,id))return;playScene([{n:"nar",t:`Really break up with ${f.name}?`,choice:[
    {t:"Break up",fx:G2=>xlBreak(G2,id),then:XL_BREAK[id]},{t:"Not now",then:[{n:"nar",t:"You put your phone away and just text that you miss her."}]}]}],()=>{save();render();},{bg:"night",look:"casual"});}
/* which heart scene is due (25 / 45 / 65 closeness, in order) */
const xlHeartDue=(G,id,k)=>xlOn(G,id)&&!isAway(G,id)&&(G.F[id].bond||0)>=XL_HEART_AT[k]&&(k===0||G.seen["xlh_"+id+"_"+(k-1)])&&gameWeek(G)-(G.xlHeartAbs||-99)>=2;
const XL_HEART_AT=[25,45,65];
Object.assign(ACT,{xhang:d=>{UI.modal={type:"xhang",id:d.id};render();},xhanggo:d=>{UI.modal=null;xlHang(d.id);},xbreak:d=>xlBreakAsk(d.v)});

/* ---------- Baiyok ---------- */
SPK.prod_B={name:"Baiyok",color:"#d9b24a"};
const XL_PROF={
 prod_B:{age:20,height:"171 cm",blood:"B",bday:"14 February",home:"Chiang Mai · her grandmother's house by the Mae Kha canal",heritage:"Her grandmother's boxing (before Golden Tiger)",
  personality:"Calm, terse, so straightforward she seems cold. Kind, without knowing how to show it. Learning to enjoy boxing for the first time.",likes:["Wooden-handled skipping ropes","Rice soup at 5 a.m.","Training in the rain"],
  dislikes:["Whistles","Black kit","The words 'as planned'"],hobby:"Counts her kicks a hundred at a time and writes them in a little notebook",
  story:"Her grandmother taught her boxing from age seven. Golden Tiger took her at thirteen; ten hours a day made her a prodigy who never smiled, until the day she fought under her own name.",
  secret:"Keeps the ticket of every fight against Sirichai in a shoebox, with the result written on the back."},
 pailin:{age:31,height:"175 cm",blood:"A",bday:"23 August",home:"Korat · now a condo near Vector's lab in Bangkok",heritage:"Korat boxing (same line as Ploy) + sports science",
  personality:"Confident, thinks in numbers, a sharp teaser. Slow to admit she's wrong, but always honest with the data. Worries about her sister more than she lets on.",likes:["Black coffee, no sugar","Spreadsheets","The sea of mist at Khao Yai"],
  dislikes:["People who say 'luck'","Data without units","Being called 'Ploy's sister'"],hobby:"Running at 5 a.m. with three watches",
  story:"Eldest daughter of a PE teacher's family in Korat. Boxed before Ploy, studied sports science in Bangkok, then founded Vector with funding she later learned the source of.",
  secret:"Still keeps Ploy's first pair of gloves in her office cabinet. Ploy thinks they were thrown out long ago."}};
Object.assign(GIFTS,{
 yb_rope:{name:"Wooden-handled skipping rope, engraved",price:600,bond:18,only:"prod_B",cat:"keep"},yb_ribbon:{name:"New gold silk hair ribbon",price:1500,bond:40,only:"prod_B",cat:"wear"},
 pl_pen:{name:"Engraved fountain pen",price:1400,bond:20,only:"pailin",cat:"keep"},pl_scarf:{name:"Purple Korat silk scarf",price:2600,bond:42,only:"pailin",cat:"wear"}});
const XL_GPREF={prod_B:{love:["yb_rope","yb_ribbon","khanom","wrap","malai"],like:["sausage","tea","photo","shorts","mongkhon"],dislike:["stickers"]},
 pailin:{love:["pl_pen","pl_scarf","coffee","book","bracelet"],like:["tea","sketch","spa","prajiad"],dislike:["doll"]}};
const XL_GLINES={prod_B:{love:"…For me? No one's ever bought me something just because they wanted to. I'll use it every day.",like:"Thanks. …I'll keep it safe.",ok:"Thanks.",dislike:"…I don't know where to stick these. But thanks."},
 pailin:{love:"…Your data on me is more accurate than I thought. I'll use it every day, and count how many days.",like:"Not bad. I'd give it eight out of ten.",ok:"Thank you",dislike:"A doll… I'll send it to Ploy. She likes pretending she doesn't like things like this."}};
const XL_GAGAIN={prod_B:{food:["{g} again… I finished the last one in one night.","I'll share half with Grandma. She asked who gave it. I haven't answered yet."],wear:["The old one isn't worn through, but I'll use this one on fight days.","Another {g}. …Now I can swap them."],keep:["{g} again. I keep it in the same box as the fight tickets.","You remembered I like it. …Not many people remember things about me."],exp:["Again? …Fine. I won't train that day."]},
 pailin:{food:["{g} again. I've started tracking how many weeks apart you buy them.","I'll share this batch with the lab team, so they know someone sends me things."],wear:["Another {g}. I alternate them, Mondays and Thursdays.","The old one's still in good shape, but I'll take this one too. That doesn't mean I wanted it."],keep:["{g} again. I keep it on my desk. My team asks about it every day.","Data confirmed again: you remember what I like."],exp:["Again? I'll clear my schedule."]}};
for(const id of XL_IDS){if(typeof PROFILES!=="undefined"&&!PROFILES[id])PROFILES[id]=XL_PROF[id];if(!GIFT_PREF[id])GIFT_PREF[id]=XL_GPREF[id];if(!GIFT_LINES[id])GIFT_LINES[id]=XL_GLINES[id];if(!GIFT_AGAIN[id])GIFT_AGAIN[id]=XL_GAGAIN[id];if(typeof SOUV_LOVE!=="undefined"&&!SOUV_LOVE[id])SOUV_LOVE[id]=id==="prod_B"?["n_umbrella","p_lampang"]:["c_bencharong","i_praewa"];}
Object.assign(TELL_MEET,{prod_B:"…Fine. The riverside temple ground. I'll be there first.",pailin:"Yes. I'll take the 6 p.m. flight. Nine o'clock at the café under my friend's condo."});
Object.assign(TELL_SPOT,{prod_B:"the riverside temple ground",pailin:"a late-night café in the middle of Nimman"});
const XL_YES={prod_B:"…I don't know how to answer. No one taught me this. …But my heart's beating faster than in round five, so I guess that means yes.",
 pailin:"I'd calculated you would say it today. …I hadn't calculated I'd be this happy. Yes."};
const XL_WAIT={prod_B:"…I don't know what I feel yet. Give me time. It doesn't mean no.",pailin:"Not enough data yet. …Let me collect a little more. Don't misunderstand. It doesn't mean no."};
const XL_BREAK={prod_B:[{n:"prod_B",f:"pout",l:"casual",t:"…Got it."},{n:"prod_B",f:"pout",l:"casual",t:"I won't cry in front of anyone, Grandma taught me. …But tonight I'll kick the bag a little longer."}],
 pailin:[{n:"pailin",f:"sad",l:"casual",t:"…I've seen the signs for a while. I just didn't want to believe my own data."},{n:"pailin",f:"sad",l:"casual",t:"Thank you for being honest. Go, before I change my mind and ask you to stay."}]};

/* the opening scenes — after 6 bouts and 4 losses she comes to find out why */
EVENTS.push({id:"xl_open_prod_B",look:"casual",bg:"camp_night",pri:45,when:G=>xlDue(G,"prod_B"),steps:[
 {inject:G=>{const r=xlRec(G,"prod_B");return [{n:"nar",t:"Past nine at night, the training-yard lights are off. Someone is standing at the camp gate holding a small notebook."},
  {n:"prod_B",f:"happy",l:"casual",t:`I counted. Fought this camp ${r.n} times, won ${r.n-r.w} lost ${r.w}`}];}},
 {n:"prod_B",f:"pout",l:"casual",t:"At Golden Tiger, lose twice in a row and you train three extra hours. I've added so much I don't know where to add any more."},
 {n:"prod_B",f:"happy",l:"casual",t:"So I came to ask the one who stands in the corner of the girls who beat me. …What does this camp train that I don't?"},
 {n:"nar",t:"What will you reply?",choice:[
  {t:"\"Train to enjoy it first, then train hard.\"",fx:G=>add(G,"prod_B","bond",4),then:[{n:"prod_B",f:"pout",l:"casual",t:"Fun… I've written it down. I don't understand it yet, but it's written down."}]},
  {t:"\"There's someone waiting to eat with them after training.\"",fx:G=>add(G,"prod_B","bond",6),then:[{n:"prod_B",f:"flustered",l:"casual",t:"…Dinner counts? I never thought it counted."}]},
  {t:"\"Come and see for yourself. Sunday.\"",fx:G=>add(G,"prod_B","bond",5),then:[{n:"prod_B",f:"happy",l:"casual",t:"Sunday… fine. I'll come before anyone wakes up."}]}]},
 {n:"prod_B",f:"pout",l:"casual",t:"…Can I have your number? In case I have a boxing question. Only boxing."},
 {fx:G=>xlOpen(G,"prod_B")},{n:"nar",t:"Baiyok added you as a friend · chat, gifts and time together are in the Characters tab"}]});
EVENTS.push({id:"xl_open_pailin",look:"casual",bg:"cafe",pri:45,when:G=>xlDue(G,"pailin"),steps:[
 {n:"nar",t:"📱 A message from an unsaved Bangkok number: \"I'm in Chiang Mai tomorrow. The café by the university, ten o'clock. Not coming counts as a forfeit.\""},
 {inject:G=>{const r=xlRec(G,"pailin");return [{n:"nar",t:"Pailin is already waiting, her tablet face-down on the table, her second black coffee half gone."},
  {n:"pailin",f:"happy",l:"casual",t:`${r.n} fights the data said I should win, and I lost ${r.w}. …Today I'm not here as the head of Vector.`}];}},
 {n:"pailin",f:"pout",l:"casual",t:"I came as someone who wants to know what the variable I can't measure is, and why it's in your camp and not in my lab."},
 {n:"nar",t:"What will you reply?",choice:[
  {t:"\"If you could measure it, it wouldn't be boxing.\"",fx:G=>add(G,"pailin","bond",4),then:[{n:"pailin",f:"pout",l:"casual",t:"The answer I hate most. …But I still have no data to argue with it."}]},
  {t:"\"Because they fight for the people waiting for them, not for the numbers.\"",fx:G=>add(G,"pailin","bond",6),then:[{n:"pailin",f:"flustered",l:"casual",t:"…Ploy said that sentence to me ten years ago. Word for word."}]},
  {t:"\"It's no fun if I tell you now.\"",fx:G=>add(G,"pailin","bond",5),then:[{n:"pailin",f:"happy",l:"casual",t:"That's cheating. Then I'll just have to keep collecting data on you."}]}]},
 {n:"pailin",f:"happy",l:"casual",t:"Let's swap LINE. Purely for research. …And don't tell Ploy I came up to Chiang Mai."},
 {fx:G=>xlOpen(G,"pailin")},{n:"nar",t:"Pailin added you as a friend · chat, gifts and time together are in the Characters tab"}]});

/* ---------- chats (5 topics each · a reply moves her closeness a little) ---------- */
CHAT.prod_B=[
 {id:"yb_count",x:[
  ["Three hundred left kicks, three hundred right. Done. …No one counts for me, so I'm sending them to you to count.",[["Counted. Exactly six hundred. Well done.",2,"…It feels strangely lighter with someone counting."],["Rest your legs a bit.",1,"No one has ever worried about my legs. Thanks."],["Why not seven hundred?",0,"…Fine. Seven hundred tomorrow."]]],
  ["At Golden Tiger, if your kicks weren't done, the coach blew the whistle until they were. I still hear it in my sleep.",[["There are no whistles here. Just Auntie Daeng yelling that dinner's ready.",2,"…Being called to eat. I'd rather hear that instead."],["Let it fade slowly.",1,"I'm trying."],["Good for discipline, though.",0,"…Mm"]]],
  ["Going to sleep. Five a.m. tomorrow.",[["Sweet dreams. Don't dream about whistles.",2,"…If I do, I'll think of Auntie Daeng's voice instead."],["Five a.m. at the temple ground.",1,"Fine. Don't be late."],["Mm.",0,"Mm."]]]]},
 {id:"yb_grandma",x:[
  ["Grandma asked why I've been eating more slowly lately.",[["So what did you tell her?",1,"I said someone taught me a meal doesn't have ten minutes. Grandma laughed until she coughed."],["Your grandma notices a lot.",2,"Grandma notices everything. …She also asked the teacher's name."],["Eating fast isn't wrong.",0,"…I like it slow better now."]]],
  ["The elbow I close rounds with, Grandma taught me at seven, before anyone called me a prodigy.",[["Your grandma's boxing is the most beautiful thing about how you fight.",2,"…I'll tell Grandma. She'll be so happy."],["I'd love to meet your grandma.",2,"Grandma wants to meet you too. She said to bring you for rice soup."],["Golden Tiger didn't teach that move?",0,"They told me to drop it. I didn't."]]],
  ["On Sunday Grandma's making sour curry. If you're free…",[["I'm free! I'll be there.",2,"…I'll tell Grandma to make it less spicy."],["Let me check my schedule.",1,"It's fine. Next time."],["I can't eat spicy food.",0,"Grandma will make clear soup for you. …Grandma's kinder than me."]]]]},
 {id:"yb_fah",x:[
  ["Fah sent a photo of the white hand wraps with gold trim and asked if I still use them.",[["You still use them every fight, right?",2,"Every fight. But don't tell Fah, she'll get smug."],["Fah worries about you.",1,"…I know. I just don't know how to answer someone who worries."],["Message her back.",0,"I've typed and deleted three times."]]],
  ["At Golden Tiger the coach made me watch Fah's tapes every night. Said I had to fight like her.",[["But now you fight as yourself.",2,"…Yes. I chose my kit myself, my moves myself. And who I want to talk to, myself."],["Fah really is good.",1,"She's good. But I'll beat her one day."],["That must have been exhausting.",0,"I'm used to it."]]],
  ["If I beat Fah next time, will you be angry?",[["I'll be happy for whoever fights better.",2,"…The fairest answer I've ever heard."],["I'm cheering for Fah, of course.",0,"Fair enough. She's in your camp."],["Try it.",1,"…I will."]]]]},
 {id:"yb_rain",x:[
  ["It's raining, the temple ground is mud. I'm still training.",[["You can train under the camp roof.",2,"…Really? I'll wipe my feet before I come in."],["Careful not to slip",1,"I've slipped twice. It didn't hurt."],["Rest when it rains.",0,"I don't know how to rest."]]],
  ["When I was little, Grandma said rain is the angels clapping, so I like training in the rain.",[["Then the angels must be your fan club.",2,"…You say strange things. But I like it."],["Your grandma says such lovely things.",1,"Grandma says everything beautifully, except about money."],["You'll catch a cold if you get soaked.",0,"I never do."]]],
  ["The rain's stopped. The sky's so orange… I took a photo, I'm sending it.",[["Beautiful. Thanks for sending it.",2,"I've never taken a photo of the sky to send anyone before."],["It's the same colour over the camp.",1,"Then we're looking at the same sky."],["Your phone takes sharp photos.",0,"…Grandma bought it for me."]]]]},
 {id:"yb_smile",x:[
  ["I won at the temple fair today, and the crowd said I smiled when they raised my hand. I didn't even notice.",[["I want to see! Send me the clip.",2,"…Don't laugh. I'm not good at smiling."],["Congratulations!",1,"Thanks."],["Careful smiling in the ring, you'll get countered.",0,"I know. …I'll be careful."]]],
  ["At my old camp, smiling in the ring wasn't in the manual, so I thought I didn't know how.",[["Of course you can. You just had no one to smile with.",2,"…Now there is."],["You can learn slowly.",1,"I practised in the mirror. Grandma said it was scary."],["No smile looks cool",0,"Then I won't smile for you."]]],
  ["If I smiled more often, would you be happy?",[["I'd be happiest of all.",2,"…Then I'll smile more. Only when you're there."],["Smile for yourself first.",2,"Myself first… I've written it down."],["Up to you.",0,"Mm"]]]]}];
CHAT.pailin=[
 {id:"pl_data",x:[
  ["Your camp, three months: you lose the first round 12% more often than average but win the fifth 31% more. What do you do to them?",[["I tell them to breathe long and enjoy the first round.",2,"…Enjoy the first round. I'll add that column to the spreadsheet."],["Camp secret.",1,"So possessive. Then I'll analyse it myself."],["Luck, maybe",0,"Nothing is a coincidence at 31%."]]],
  ["My lab team calls your camp 'the outlier' in every meeting.",[["Sounds like a compliment.",2,"…It is a compliment. Don't let it go to your head."],["Off the chart is good.",1,"Good for you. A headache for me."],["Why call it that?",0,"Because it can't be predicted. Obviously."]]],
  ["Tonight I'll watch your camp's tapes until two. Don't worry, I have coffee.",[["Get some sleep. The tapes aren't going anywhere.",2,"…You sound just like Ploy. Fine. One a.m."],["Send me your notes in exchange.",1,"Keep dreaming."],["Go go!",0,"Thank you"]]]]},
 {id:"pl_ploy",x:[
  ["Is Ploy eating three meals a day? Don't tell her I asked.",[["All three, and she steals Fah's sausages too.",2,"…Good. As a kid she only ate rice with omelette."],["Why not ask her yourself?",1,"If I ask, she'll say 'Stay out of it, sis.' I know."],["Not sure.",0,"You should know. You're the manager."]]],
  ["When Ploy won by first-round knockout at ten, everyone called her a prodigy. Nobody asked if she was tired.",[["You were the first to ask, weren't you?",2,"…Yes. And then I went to Bangkok and left her alone with that word."],["Ploy's stronger than you think.",1,"I know. Too strong, even."],["Talent's a good thing.",0,"…Good for the audience."]]],
  ["Thank you for looking after my sister. I'll only say this once.",[["Said once, remembered forever.",2,"…You answer so well it's annoying."],["Ploy can look after herself.",1,"Yes. But it's better with someone helping."],["No problem",0,"It is"]]]]},
 {id:"pl_run",x:[
  ["5:20 a.m., ten kilometres, average heart rate 148. Just sharing.",[["Faster than yesterday, too.",2,"…You remember yesterday's?"],["You're up early.",1,"I wake up before every one of my watches."],["Isn't 148 a bit high?",0,"It's within range. Don't worry."]]],
  ["Why do people keep asking why I run, when I don't fight much any more?",[["Because running clears your head.",2,"Correct. You're the first person who's answered it for me."],["Because you still want to fight, right?",2,"…You've read me already. That's not fair."],["I don't know",0,"That's fine."]]],
  ["Come running with me sometime? I'll slow down for you. …A little.",[["Yes! But don't leave me behind.",2,"I'll wait at every kilometre marker. Promise."],["Can I follow on a bicycle?",1,"That's cheating. But I'll allow it."],["I can't keep up.",0,"Then I'll run alone."]]]]},
 {id:"pl_vector",x:[
  ["Today I signed away another of the old funding contracts. The whole lab went quiet.",[["You did the right thing.",2,"…Thank you. I wanted to hear someone say that."],["Will Vector be all right?",1,"I don't know. But I'll find a way that doesn't mean selling myself."],["Shame about the money.",0,"…That money had a higher price."]]],
  ["My team asked why I don't just move the camp to Chiang Mai. I told them it's none of their business.",[["Then whose business is it?",2,"…Mine. I haven't answered myself yet."],["Bangkok's fine as it is.",1,"Yes. The data says so too."],["Come to Chiang Mai. The weather's nice.",1,"You're a good salesman."]]],
  ["I still believe science can make fighting safer. We just can't forget that fighters are people.",[["That's exactly what makes you different.",2,"…I'll remember that sentence when I'm ready to give up."],["Agreed.",1,"Good. Then we're on the same team."],["People are just a set of numbers.",0,"…I used to think that. It led me the wrong way."]]]]},
 {id:"pl_korat",x:[
  ["Mum sent a three-tier tiffin all the way to my condo. I can't eat it fast enough.",[["Send one tier up to Chiang Mai.",2,"It can't go by post. …I'll carry it onto the plane for you."],["Your mum worries about you.",1,"Mum worries about everyone except herself."],["Put it in the fridge.",0,"Already done."]]],
  ["When we were kids, Dad timed Ploy and me running up the hill. I won every time until Ploy was thirteen. Never again after that.",[["So you stopped racing your sister?",1,"So I switched to competing in things I could win. Mathematics, for example."],["Do you miss those days?",2,"…Every time I see the mist on Khao Yai."],["Ploy really is good.",0,"My sister. Of course."]]],
  ["If one day I took you to Khao Yai when the mist comes down, would you come?",[["Definitely. Name the day.",2,"…I'll check ten years of weather records to find the best day."],["Shall we bring the whole camp?",1,"No. This one isn't a camp trip."],["Let me think about it",0,"No rush."]]]]}];

/* ---------- time together: five places each, then short visits ---------- */
const xB=(f,t)=>({n:"prod_B",f,l:"casual",t}),xP=(f,t)=>({n:"pailin",f,l:"casual",t}),xN=t=>({n:"nar",t});
const XL_DATE={
 prod_B:[
  {name:"The riverside temple ground, 5 a.m.",bg:"river_dawn",steps:G=>[xN("The sky isn't light yet. Baiyok has one heavy bag hung from a tamarind branch, a skipping rope around her neck."),xB("happy","You're on time. …I thought you wouldn't get up."),
   xN("She hands you an old skipping rope, its wooden handles worn into fingerprints."),xB("pout","A hundred, no stopping. …I'm joking. Fifty is fine."),xN("When you stop, gasping, at thirty, she lets out a short laugh and quickly turns away."),xB("flustered","I wasn't laughing. …It was the wind.")]},
  {name:"Grandma's rice-soup stall",bg:"food",steps:G=>[xN("An old shophouse rice-soup stall. Baiyok's grandmother serves you fish rice soup in a bowl twice the size of her granddaughter's."),xB("pout","Grandma never serves me this much."),
   xN("Grandma whispers that her granddaughter got up at four to slice ginger the moment she knew you were coming."),xB("flustered","Grandma! …You don't have to tell everything."),xB("happy","…Eat slowly. Nobody counts the time here.")]},
  {name:"Old tapes while the rain falls",bg:"camp_rain",steps:G=>[xN("The rain is so heavy you shelter under the camp eaves. Baiyok opens a clip of an old fight on her phone: black kit, no smile."),
   xB("sad","The one in this clip won every fight, but I can't remember what she felt at all."),{n:"nar",t:"What do you say?",choice:[
    {t:"\"What do you feel now?\"",fx:G2=>add(G2,"prod_B","bond",2),then:[xB("flustered","…Cold. And I don't want the rain to stop.")]},
    {t:"\"The one in the clip is very good. But I like the one beside me better.\"",fx:G2=>add(G2,"prod_B","bond",3),then:[xB("flustered","…The clip's closed. We don't need to watch it.")]}]}]},
  {name:"A Chiang Mai temple fair",bg:"fair",steps:G=>[xN("A Saturday night temple fair. Baiyok stands stock-still in front of the dart stall with the dolls."),xB("happy","I hit every balloon, but they won't give me the big doll."),
   xN("You buy another set of darts and miss every one. She laughs so loudly people turn to look."),xB("flustered","…Sorry. I haven't laughed that loud in a long time."),xN("On the way back she holds the smallest doll she won tight the whole way.")]},
  {name:"Doi Suthep at dusk",bg:"mountain",steps:G=>[xN("The viewpoint on Doi Suthep. The lights of Chiang Mai come on one by one."),xB("happy","Ten years at Golden Tiger and I never once came up here, because Sundays were for training too."),
   xB("pout","Now I have Sundays of my own. …I want to spend them like this."),xN("The wind is so strong the gold ribbon in her hair flies loose. You catch it in time."),xB("flustered","…Thanks. Can you tie it for me? I can't see behind me.")]}],
 pailin:[
  {name:"A late-night café in Nimman",bg:"cafe",steps:G=>[xN("Pailin orders two black coffees, one for you and one for her, then a spare."),xP("happy","I've prepared twenty questions. About your camp."),
   xN("By question three, they've turned into what food you like, what you do on days off, and why you became a camp manager."),xP("flustered","…Questions four to twenty were filed under the wrong heading. You don't have to answer."),xP("happy","But if you'd like to answer, I have until the café closes.")]},
  {name:"A morning run around the old city moat",bg:"river",steps:G=>[xN("Five-thirty a.m. Pailin, wearing three watches, stretches while she waits at Tha Phae Gate."),xP("happy","I've slowed down for you. 5:30 per kilometre."),
   xN("At the third kilometre you start gasping. She jogs backwards to wait and laughs."),xP("pout","Your heart rate is 172. You can stop. I won't record it."),xN("You both sit by the moat to rest. She hands you the water bottle, the only one she brought."),xP("flustered","…I miscalculated. I should have brought two.")]},
  {name:"Vector's Chiang Mai lab, not yet open",bg:"vector_lab",steps:G=>[xN("An empty second floor in an old building. A treadmill and two motion-capture cameras still in plastic."),
   xP("happy","I've rented it for three months. I haven't told anyone, not even Ploy."),xP("sad","I want a place where science helps small camps without anyone having to sell anything to anyone."),{n:"nar",t:"What do you say?",choice:[
    {t:"\"Sirichai will be your first client.\"",fx:G2=>add(G2,"pailin","bond",3),then:[xP("flustered","…There's no staff discount. But I'll give you the friendliest price.")]},
    {t:"\"Then why tell me before Ploy?\"",fx:G2=>add(G2,"pailin","bond",2),then:[xP("flustered","…That data isn't ready for release.")]}]}]},
  {name:"Warorot Market",bg:"market",steps:G=>[xN("Pailin walks the fruit stalls like someone with a planned route. Every stall has a note on her phone."),xP("happy","The longans here are 1.5 Brix sweeter than next door. I measured them last year."),
   xN("The vendor asks if you're her boyfriend. Pailin answers 'business partner' a little too quickly."),xP("flustered","…Academic partner. Don't smile like that."),xP("happy","Take some back for the camp. Tell Ploy you bought them yourself.")]},
  {name:"The rooftop after the rain",bg:"camp_night",steps:G=>[xN("Her flight back to Bangkok is delayed three hours. Pailin calls to tell you in a voice that doesn't sound sorry at all."),xP("happy","I have free time I didn't plan for. …It feels strange."),
   xN("The camp rooftop is still wet with rain. She sits on the one plastic chair and never once opens her tablet."),xP("sad","Since founding Vector I've never sat still for more than five minutes."),xP("flustered","…Forty minutes have passed. I wasn't counting. My watch told me.")]}]};
const XL_AGAIN={
 prod_B:[{bg:"river_dawn",steps:G=>[xN("Five a.m. at the temple ground again. Baiyok shows you her kick count, then has you count for her."),xB("happy","Two hundred… you didn't lose count today.")]},
  {bg:"food",steps:G=>[xN("Grandma's rice soup. Your bowl is even bigger than last time."),xB("pout","Grandma loves you more than me now.")]},
  {bg:"camp",steps:G=>[xN("Baiyok drops by camp on Sunday and cleans the ring until it's cleaner than before."),xB("happy","I came before everyone woke up again.")]}],
 pailin:[{bg:"cafe",steps:G=>[xN("The same café. Pailin arrives ten minutes early, as always."),xP("happy","My third coffee of the day. This one counts as yours.")]},
  {bg:"river",steps:G=>[xN("Another run around the moat. Today she's brought two bottles of water."),xP("happy","I've corrected the error.")]},
  {bg:"camp_night",steps:G=>[xN("A video call at ten at night. Pailin is still in the lab, but turns the camera to show you the Bangkok skyline."),xP("flustered","…Nothing. I just wanted you to see the lights.")]}]};

/* ---------- heart scenes (closeness 25 / 45 / 65) ---------- */
const XL_HEART={
 prod_B:[
  [xN("Baiyok texts at midnight: \"Come out to the camp gate.\""),xN("She's standing under the streetlight with an old shoebox in her hands."),xB("happy","I've kept the ticket from every fight against this camp, with the result written on the back."),
   xB("pout","At first I wrote 'lost, fix it'. Now I write 'fun'. …I don't know when it changed."),{n:"nar",t:"What do you say?",choice:[
    {t:"\"It changed when you chose to fight as yourself.\"",fx:G=>add(G,"prod_B","bond",3),then:[xB("flustered","…Or when someone stood in my corner without me asking.")]},
    {t:"\"Fill the whole box.\"",fx:G=>add(G,"prod_B","bond",2),then:[xB("happy","I've already bought the second box.")]}]}],
  [xN("The night before a big fight, Baiyok calls and says nothing for almost a minute."),xB("sad","…Grandma's in hospital. The doctor says it's not serious, but I'm sitting outside the room alone."),
   xN("You drive there in twenty minutes. She stands the moment she sees you, then doesn't know what to do with her hands."),xB("sad","At my old camp, if anyone had trouble at home, the coach said leave it outside the ring. So I don't know where to put being scared."),
   {n:"nar",t:"What do you do?",choice:[{t:"Sit beside her in silence until morning",fx:G=>add(G,"prod_B","bond",4),then:[xN("At six the doctor says her grandmother is awake. Baiyok is asleep, head drooped on your shoulder.")]},
    {t:"\"Leave it with me for now.\"",fx:G=>add(G,"prod_B","bond",4),then:[xB("flustered","…It's heavy."),xN("She rests her head on your shoulder until morning.")]}]}],
  [xN("Baiyok wins by knockout in the third. She runs down from the ring to the Sirichai corner, though it isn't her corner."),xB("happy","Did you see? …I smiled when they raised my hand. I knew it this time."),
   xB("flustered","I smiled because I looked for you in the crowd, and found you."),xN("The referee calls her back to the ring three times. She still won't let go of your hand."),xB("pout","…Go on. Don't you disappear anywhere.")]],
 pailin:[
  [xN("Pailin sends a file at one in the morning, named 'outlier_v7'."),xN("It isn't camp statistics. It's a blurry photo of you and the fighters laughing at the ringside."),
   xP("flustered","Wrong file. Delete it."),xP("pout","…If you haven't deleted it, then tell me why everyone in the photo looks so happy. I can't find the variable."),{n:"nar",t:"What will you reply?",choice:[
    {t:"\"Because no one was being measured right then.\"",fx:G=>add(G,"pailin","bond",3),then:[xP("sad","…A conclusion I didn't want to hear. But I'll note it.")]},
    {t:"\"Come sit there with us. Then you'll know.\"",fx:G=>add(G,"pailin","bond",3),then:[xP("flustered","…That's not proper research methodology. But I'll try it.")]}]}],
  [xN("Pailin fights a warm-up bout in Bangkok and loses on points to a nineteen-year-old."),xN("That night she video-calls from the athletes' room, her hand wraps still on."),
   xP("sad","The data says I should have retired three years ago. My speed drops 4% a year."),xP("sad","But today, losing, I was glad to still be standing in the ring. …I don't understand myself."),
   {n:"nar",t:"What do you say?",choice:[{t:"\"Some things you don't have to understand. You just keep going.\"",fx:G=>add(G,"pailin","bond",4),then:[xP("flustered","…You sound like someone who has never opened a spreadsheet. But I'll believe you.")]},
    {t:"\"I'm glad you're still fighting.\"",fx:G=>add(G,"pailin","bond",4),then:[xP("flustered","…No one has said that to me since my father.")]}]}],
  [xN("Pailin comes up to Chiang Mai unannounced. She's waiting at the camp gate at sunset with one small bag."),xP("happy","I cancelled three meetings, pushed back a lab test, and lied to my team that I was on a site visit."),
   xP("flustered","All this to watch a sunset with you, which has no statistical value whatsoever."),xN("She stops talking and looks at the sky instead."),xP("pout","…I'm losing control of my variables. And I don't want to control them.")]]};
for(const id of XL_IDS)XL_HEART[id].forEach((st,k)=>EVENTS.push({id:"xlh_"+id+"_"+k,look:"casual",bg:id==="pailin"?["cafe","night","camp"][k]:["camp_night","hospital","hall"][k],pri:30,
  when:G=>xlHeartDue(G,id,k),steps:[{fx:G=>{G.xlHeartAbs=gameWeek(G);}},...st,{inject:G=>{add(G,id,"bond",3);return [{n:"nar",t:`Bond with ${G.F[id].name} +3`}];}}]}));

/* ---------- Baiyok moves in while she fights free in white and a dorm room is open: four weeks after she is yours, or (Man) as a close friend (closeness 60) eight weeks after she opened up ---------- */
const xlJoinDue=G=>{const f=G.F.prod_B;return !!f&&xlOn(G,"prod_B")&&(xlLov(G,"prod_B")?absWeek(G)-G.xlov.prod_B>=4:(f.bond||0)>=60&&absWeek(G)-G.xl.prod_B.open>=8)&&f.camp!=="player"&&byFree(G)&&!(G.xlJoinNo&&absWeek(G)-G.xlJoinNo<8);};
EVENTS.push({id:"xl_join_prod_B",look:"casual",bg:"camp",pri:40,when:xlJoinDue,steps:[
 xN("Sunday morning. Baiyok reaches camp before anyone else, as always, but today there's an old suitcase beside her."),xB("pout","They're repairing the pavilion at the temple ground. No training for three months."),
 xB("flustered","…I lied. The pavilion isn't being repaired. I just want to train here every day, not only on Sundays."),
 {inject:G=>dormUsed(G)>=dormRooms(G)?[xN(`The dorm is full (${dormRooms(G)} rooms) · upgrade the dorm and she'll ask again`),{fx:G2=>{G2.xlJoinNo=absWeek(G2);if(G2.seen)delete G2.seen.xl_join_prod_B;}}]:[{n:"nar",t:"What will you reply?",choice:[
  {t:"\"There's a free room upstairs. Move in.\"",fx:G2=>{joinCamp(G2,"prod_B",2500);const f=G2.F.prod_B;f.indie=false;f.full="Baiyok";add(G2,"prod_B","bond",5);add(G2,"prod_B","morale",15);},
   then:[xB("happy","…I won't let anyone down."),xB("flustered","Except oversleeping. I have never overslept."),xN("Baiyok moves into Sirichai Camp · she fights Division B for us")]},
  {t:"\"Not just yet.\"",fx:G2=>{G2.xlJoinNo=absWeek(G2);if(G2.seen)delete G2.seen.xl_join_prod_B;},then:[xB("pout","…All right. I'll wait. But I'm still coming Sundays.")]}]}]}]});

/* ---------- two sisters (Pailin and Ploy) ---------- */
const xlPloyNear=G=>G.F.ploy&&G.F.ploy.met&&(G.F.ploy.bond||0)>=40;
EVENTS.push({id:"xl_sis1",look:"casual",bg:"camp",pri:35,when:G=>xlOn(G,"pailin")&&(G.F.pailin.bond||0)>=45&&xlPloyNear(G)&&!isAway(G,"ploy"),steps:[
 xN("Ploy sets her phone down in front of you, open to her sister's chat. The latest message: \"Your camp manager runs very slowly. Pass that on.\""),
 {n:"ploy",f:"pout",l:"casual",t:"My sister hasn't messaged me first in three years. She's messaged about you three days running."},{n:"ploy",f:"pout",l:"casual",t:"…When did you go running with my sister?"},
 {n:"nar",t:"What will you reply?",choice:[{t:"\"Pailin misses you. She just doesn't know how to start.\"",fx:G=>{add(G,"ploy","bond",3);add(G,"pailin","bond",2);},then:[{n:"ploy",f:"sad",l:"casual",t:"…I don't know either."},{n:"ploy",f:"pout",l:"casual",t:"Tell her this Saturday, if she's free, to come run the hill here. The three of us."}]},
  {t:"\"Jealous?\"",fx:G=>add(G,"ploy","bond",1),then:[{n:"ploy",f:"flustered",l:"casual",t:"Jealous of my sister or jealous of you, I haven't decided. Don't ask yet."}]}]}]});
EVENTS.push({id:"xl_sis2",look:"casual",bg:"night",pri:36,when:G=>xlOn(G,"pailin")&&G.F.ploy&&G.F.ploy.met&&!isAway(G,"ploy")&&
  ((xlLov(G,"pailin")&&(G.F.ploy.bond||0)>=45)||(isPartner(G,"ploy")&&(G.F.pailin.bond||0)>=45)),steps:[
 {inject:G=>{const withP=xlLov(G,"pailin");return [xN("That night the two sisters sit on opposite sides of the camp dinner table. Neither touches her plate."),
  withP?{n:"ploy",f:"pout",l:"casual",t:"You always got everything before me. Fought first, went to Bangkok first… and now again."}:{n:"pailin",f:"sad",l:"casual",t:"Ploy always got everything I wanted. The talent, the punch… and now this person too."},
  withP?{n:"pailin",f:"sad",l:"casual",t:"…I'm not taking anything from you, Ploy. I've just never dared ask for something I really wanted. Until now."}:{n:"ploy",f:"sad",l:"casual",t:"…I never knew what you wanted from me, because you never said."},
  {n:"nar",t:"They both turn to look at you.",choice:[
   {t:"\"You two matter to me in different ways.\"",fx:G2=>{add(G2,"ploy","bond",2);add(G2,"pailin","bond",2);},then:[{n:"pailin",f:"pout",l:"casual",t:"A very diplomatic answer. I'd give it six out of ten."},{n:"ploy",f:"pout",l:"casual",t:"…Five out of ten. But I'll give you today."}]},
   {t:"\"Talk it out first. I'll wait outside.\"",fx:G2=>{add(G2,"ploy","bond",3);add(G2,"pailin","bond",3);},then:[xN("Twenty minutes later, both sisters' laughter drifts out of the room. The first time you've heard them laugh together."),{n:"ploy",f:"happy",l:"casual",t:"…We've worked it out. The details are classified."}]}]}];}}]});

/* ---------- when a heroine notices (once per new romance, if she is close to you) ---------- */
const XL_TWO={kati:"Coach… I've seen you smiling at your phone all day. I don't have to ask. But I know.",mali:"Mali heard you go running in the mornings with someone… Mali's not upset. She's just kicking a little harder in training~",
 rin:"For three weeks you have left camp every Sunday morning. I've logged it. I'm not asking for an explanation.",ploy:"…Don't say it. I've seen it",fah:"Hey! You think Fah doesn't know who's been texting you every night!? …Don't answer. Fah's going to train."};
const xlTwoWho=(G,id)=>{const P=partners(G).filter(k=>XL_TWO[k]&&G.F[k]&&G.F[k].camp==="player"&&!isAway(G,k));if(P.length)return P[0];
  const L=["kati","mali","rin","ploy","fah"].map(k=>G.F[k]).filter(f=>f&&f.camp==="player"&&f.met&&(f.bond||0)>=50&&!isAway(G,f.id)&&!(id==="pailin"&&f.id==="ploy")).sort((a,b)=>(b.bond||0)-(a.bond||0));return L.length?L[0].id:null;};
for(const id of XL_IDS)EVENTS.push({id:"xl_two_"+id,look:"casual",bg:"camp",pri:34,when:G=>xlLov(G,id)&&absWeek(G)-G.xlov[id]>=1&&!!xlTwoWho(G,id),
 steps:[{inject:G=>{const k=xlTwoWho(G,id);add(G,k,"bond",-2);return [{n:k,f:"pout",l:"casual",t:XL_TWO[k]},xN(`${G.F[k].name} knows about you and ${xlWho(id)}`)];}}]});
Object.assign(TELL_WAIT,XL_WAIT);
/* test host only (loadTestSave): Vector and Baiyok exist and the camp already has 6 bouts / 4 wins against each, so both opening scenes play at the end of the first week */
function xlTestSetup(G){try{G.arcs=G.arcs||{};if(!G.arcs.vector){G.arcs.vector=G.season||1;ensureVector(G);}if(!G.F.prod_B&&G.F.fah){makeProdigy(G,"B","fah");}G.flags=G.flags||{};if(G.flags.byFree==null)G.flags.byFree=absWeek(G);fixProdigies(G);
  for(const id of XL_IDS){if(!G.F[id]||xlRec(G,id).n>=6)continue;for(const res of ["W","W","L","W","L","W"])G.cal.push({wk:1,season:1,absWeek:1,a:"kati",b:id,bn:G.F[id].name,tier:"local",res});}}catch(e){console.error("xl test",e);}}
