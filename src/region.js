// ================= v1.90 (hidden) ศึกชิงเจ้าสี่ภาค — regional chapter core =================
/* Ships as its own file (region.js, bundled with road.js) and loads only once the chapter opens, so players in years 1–5 never download it.
   Round 1: the invitation, the four regions, planning a trip (calendar + cost + whole camp away), the provincial belt bouts.
   Later rounds: the drive scene, the champion series, minigame duels, the story, the Naka League finale. Spec: claude/regional-chapter.md */

const RG={
 north:{name:"ภาคเหนือ",champ:"ใบบัว",nick:"ดอกบัวซ่อนหนามแห่งล้านนา",col:"#e86fa0",prov:["chiangrai","nan","uttaradit","lampang"],fin:"chiangmai",tilt:{elbow:2.5,counter:2}},
 isan:{name:"ภาคอีสาน",champ:"ทับทิม",nick:"ทับทิมเอกเซียนอีสาน",col:"#d23246",prov:["udon","khonkaen","buriram","ubon"],fin:"korat",tilt:{kick:2.5,foot:1.5}},
 central:{name:"ภาคกลาง",champ:"อลิเซีย",nick:"เจ้าหญิงแห่งวงการมวยไทย",col:"#2f62c8",prov:["lopburi","suphan","phetchaburi","chanthaburi"],fin:"ayutthaya",tilt:{punch:2.5,clinch:1.5}},
 south:{name:"ภาคใต้",champ:"ชบา",nick:"หมัดพายุสยบคลื่น",col:"#1f9a7a",prov:["chumphon","surat","nakhonsi","songkhla"],fin:"phuket",tilt:{speed:2,foot:1.5,punch:1}}};
const RG_ORDER=["north","isan","central","south"];
/* the local belt holder waiting in each province */
const RG_OPP={chiangrai:"แก้วกาญจน์ ส.แม่สาย",nan:"น้ำผึ้ง ลูกเมืองน่าน",uttaradit:"ทองดี ศิษย์ดาบหัก",lampang:"ม้าเหล็ก ลูกรถม้า",
 udon:"บัวแดง หนองหาน",khonkaen:"ไหมแก้ว ลูกชนบท",buriram:"สายฟ้า พนมรุ้ง",ubon:"เทียนทอง ริมโขง",
 lopburi:"จ๋อทอง ศ.พระปรางค์",suphan:"แม่ไม้ บางปลาม้า",phetchaburi:"หม้อแกง เมืองเพชร",chanthaburi:"มังคุด ลูกจันท์",
 chumphon:"นางนวล ปากน้ำ",surat:"นางรม ดอนสัก",nakhonsi:"ตะลุง ศ.เมืองคอน",songkhla:"สมิหลา ลูกสงขลา"};
const RG_LAST_WK=50; /* trips run until week 50; the last two weeks of the year are the holidays */
const RG_CUP_PRIZE=50000;
const RG_TITLE={north:"ศึกชิงแชมป์ภาคเหนือ",isan:"ศึกชิงแชมป์ภาคอีสาน",central:"ศึกชิงแชมป์ภาคกลาง",south:"ศึกชิงแชมป์ภาคใต้"};
/* v1.90 round 3: each champion's series — perk, letters, lines before/after each bout, the cup ceremony and the private cup night.
   Draft dialogue (dialects to be checked: คำเมือง by Man, อีสาน/ใต้ by native speakers) — the full regional scripts come in rounds 6–9. */
const RG_CH={
 north:{ring:"north",venue:"เวทีวัดล้านนา เชียงใหม่",pair:"kati",nightBg:"doisuthep",
  perk:{name:"ดอกบัวซ่อนหนาม",desc:"สวนกลับบ่อยขึ้น 5% · ศอกแรงขึ้น 12%",fx:{ctr:.05,dmg:{elbow:.12}}},
  letter:"เรียน ผู้จัดการค่ายศิริชัยเจ้า\n\nหนูใบบัวเจ้า ได้ข่าวว่าค่ายของผู้จัดการเก็บเข็มขัดครบทั้งสี่จังหวัดของภาคเหนือแล้ว ขอแสดงความยินดีด้วยเจ้า\n\nเวทีวัดล้านนาที่เชียงใหม่รออยู่เจ้า ศึกชิงแชมป์ชกสามนัด ใครชนะสองนัดก่อนได้ถ้วย หนูขอให้ผู้จัดการเลือกนักมวยคนเดียว ชกกับหนูให้จบทั้งสามนัดเน้อ\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nใบบัว · ค่ายบัวท่าเสา",
  again:"ผู้จัดการเจ้า\n\nหนูยังรออยู่ที่เชียงใหม่เน้อ ถ้าค่ายศิริชัยพร้อมเมื่อไหร่ ส่งนักมวยมาอีกได้เลยเจ้า คราวนี้จะเลือกคนเดิมหรือคนใหม่ก็ได้\n\nหนูก่จะซ้อมรอเหมือนกันเจ้า\n\nใบบัว",
  wait:"บ่เป็นหยังเจ้า หนูรอได้ ดูแลนักมวยให้ดีก่อนเน้อ — ใบบัว",
  pre:[n=>`${n}… ยินดีที่ได้ชกกันเจ้า หนูจะไม่ออมมือเน้อ ศอกของท่าเสาไม่เคยออมใคร`,n=>`นัดนี้หนูจะสวนให้หนักกว่าเดิมเจ้า ระวังศอกกลับหลังเน้อ`,n=>`นัดสุดท้ายแล้วเจ้า… หนูแบกชื่อค่ายบัวท่าเสามาทั้งหมด จะยอมแพ้บ่ได้`],
  reply:"มาเลย ฉันเตรียมมาแล้ว",pairLine:"ท่าเสาเหมือนกัน… แต่วันนี้หนูขอเป็นฝ่ายชนะนะคะ",
  win:["ขอบคุณที่ชกด้วยกันเจ้า นัดหน้าหนูจะรอเน้อ","ยังบ่จบเน้อ หนูรู้แล้วว่าต้องแก้ตรงไหน","…"],
  lose:["เก่งแท้เจ้า หนูประมาทไปหน่อย นัดหน้าเจอกันเน้อ","ศอกหนูโดนอ่านขาดเลยเจ้า… นัดสุดท้ายหนูจะบ่ยอมง่าย ๆ","…"],
  lost:(G,J)=>[{n:"baibua",f:"happy",l:"fight",t:"ถ้วยยังอยู่ที่เชียงใหม่เจ้า… แต่หนูสนุกแท้ที่ได้ชกกับค่ายศิริชัย"},{n:"baibua",f:"flustered",l:"fight",t:"ถ้าผู้จัดการพร้อมเมื่อไหร่ ส่งจดหมายมาบอกหนูเน้อ หนูจะรอเจ้า"},{n:"nar",t:"ใบบัวไหว้ทุกคนก่อนเดินลงเวที แล้วหันกลับมามองผู้จัดการอีกครั้งหนึ่ง"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.north.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคเหนือจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคเหนือ ศึกชิงเจ้าสี่ภาค ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"คุณเกริกขึ้นมามอบถ้วยทองกลางเวที โคมยี่เป็งลอยขึ้นฟ้าพร้อมกันหลายร้อยดวง"},
   {n:"baibua",f:"happy",l:"fight",t:"ยินดีด้วยเจ้า… ผู้จัดการ คืนนี้หนูมีที่หนึ่งอยากพาไป… ถ้าบ่ว่าอะไรเน้อ"},
   {n:"baibua",f:"flustered",l:"fight",t:"หนูมีเรื่องอยากบอกอยู่เรื่องหนึ่ง… เอ่อ บ่เป็นหยังเจ้า ไว้ก่อนก็ได้"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ใบบัว")}]:[]),
   {n:"coach",t:"ถ้วยแรกของค่ายระดับภาค… ปู่ชัยต้องยิ้มอยู่แน่ ๆ"}];},
  night:(G,T)=>[
   {n:"nar",t:"ตีห้า ใบบัวมารอหน้าโรงแรมพร้อมรถมอเตอร์ไซค์คันเก่า ขึ้นดอยสุเทพไปตอนที่ฟ้ายังมืด"},
   {n:"baibua",f:"happy",l:"casual",t:"ตรงนี้เป็นที่ประจำของหนูเจ้า ตอนพ่อยังสอนมวยได้ พ่อพามาดูหมอกทุกปีใหม่"},
   {n:"nar",t:"ลมหนาวพัดขึ้นมาจากหุบเขา ใบบัวคลี่ผ้าซิ่นตีนจกผืนเล็กออก แล้วแบ่งให้ผู้จัดการคลุมไหล่ครึ่งหนึ่ง"},
   {n:"baibua",f:"sad",l:"casual",t:"พ่อเจ็บเข่าเลิกสอนมาสองปีแล้วเจ้า เวกเตอร์มาขอซื้อค่าย บอกว่าจะจ่ายค่ารักษาพ่อให้ทั้งหมด"},
   {n:"baibua",f:"sad",l:"casual",t:"หนูยังบ่ได้ตอบใคร… บ่กล้าบอกพ่อด้วย กลัวพ่อเสียใจที่ลูกสาวแบกค่ายไว้บ่ไหว"},
   {n:"nar",t:"ใบบัวเงียบไป ใต้หุบเขาไฟในเมืองเชียงใหม่ค่อย ๆ ดับทีละดวง",choice:[
     {t:"\"ค่ายเล็กก็ยืนได้ ค่ายเราเป็นตัวอย่างให้\"",fx:G2=>{rgMeet(G2,"baibua",3);},then:[{n:"baibua",f:"happy",l:"casual",t:"…ค่ายศิริชัยแท้ ๆ เจ้า ทุกคนช่วยกันหมด หนูอิจฉาเน้อ"}]},
     {t:"\"ไม่ต้องแบกคนเดียวก็ได้นะ\"",fx:G2=>{rgMeet(G2,"baibua",4);},then:[{n:"baibua",f:"flustered",l:"casual",t:"…ผู้จัดการพูดแบบนี้ หนูก่บ่รู้จะเอาหน้าไว้ไหนแล้วเจ้า"}]}]},
   {n:"nar",t:"ดวงอาทิตย์โผล่พ้นทะเลหมอก ใบบัวพึมพำอะไรบางอย่างเบามาก"},
   {n:"baibua",f:"flustered",l:"casual",t:"…อ้าย"},
   {n:"baibua",f:"flustered",l:"casual",t:"เอ๊ะ! บ่ใช่เจ้า หนูบ่ได้พูดหยัง! ลงดอยกันเถอะเจ้า เดี๋ยวทุกคนตื่นมาหา"},
   {n:"nar",t:"ทางลงดอย ใบบัวขับช้ากว่าตอนขาขึ้นเกือบเท่าตัว"}]},
 isan:{ring:"northeast",venue:"เวทีปราสาทหินพิมาย นครราชสีมา",pair:"ploy",nightBg:"mekong",
  perk:{name:"เตะคุมระยะ",desc:"เตะแม่นขึ้น 4% · หลบได้ดีขึ้น 1%",fx:{hit:{kick:.04},evade:.01}},
  letter:"เถิง ผู้จัดการค่ายศิริชัย\n\nคักแท้! เก็บเข็มขัดอีสานครบสี่จังหวัดแล้วเด้อ ทับทิมรอเบิ่งมาตั้งแต่จังหวัดแรกแล้ว\n\nมาชิงถ้วยกันที่เวทีปราสาทหินพิมาย โคราชเด้อ ชกกันสามนัด ใครชนะสองนัดก่อนเอาถ้วยไป ส่งนักมวยมาคนเดียวชกให้จบเด้อ บ่ต้องเปลี่ยนตัวไปมา\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nทับทิม · ค่ายหมัดหนักพิมาย (แต่เตะเด้อ ฮ่า ๆ)",
  again:"ผู้จัดการเด้อ!\n\nถ้วยยังอยู่โคราชเด้อ ทับทิมบ่ได้ไปไส ถ้าพร้อมแล้วกะส่งนักมวยมาอีก คนเก่าคนใหม่กะได้\n\nบ่ต้องเกรงใจเด้อ มาเลย!\n\nทับทิม",
  wait:"บ่เป็นหยังเด้อ ทับทิมรอได้ ไผเจ็บกะพักก่อน — ทับทิม",
  pre:[n=>`${n}! มาเด้อ ทับทิมรอมาโดนแล้ว เตะโคราชบ่เคยมีไผเห็นมาก่อนดอก ฮ่า ๆ`,n=>`นัดนี้ทับทิมสิเอาจริงเด้อ ระวังเตะกระโดดเด้อ`,n=>`นัดสุดท้ายแล้ว… พ่อบ่เคยมาเบิ่งทับทิมชกจักเทื่อ มื้อนี้กะเหมือนเดิมนั่นล่ะ แต่ทับทิมสิชนะให้ได้`],
  reply:"ฉันก็ไม่ยอมเหมือนกัน",pairLine:"หมัดโคราชของคนกรุงเทพฯ จะเป็นของแท้ไหม ดูเอาเองแล้วกัน",
  win:["ฮ่า ๆ คักแท้ แต่ทับทิมได้นัดแรกเด้อ!","อีกนัดเดียวเด้อ ทับทิมสิเอาถ้วยไว้ที่โคราช","…"],
  lose:["โอ๊ย เจ็บหลาย! เก่งแท้เด้อ นัดหน้าทับทิมเอาคืน","ฮ่า ๆ…บ่ฮาแล้วเด้อ นัดสุดท้ายเจอกัน","…"],
  lost:(G,J)=>[{n:"tabtim",f:"happy",l:"fight",t:"ฮ่า ๆ ถ้วยยังอยู่โคราชเด้อ! แต่ค่ายศิริชัยแซบแท้ ทับทิมเจ็บทั้งตัวเลย"},{n:"tabtim",f:"flustered",l:"fight",t:"มาอีกเด้อ ทับทิมสิรอ… บ่ได้คิดฮอดดอก แค่อยากชกด้วยอีก"},{n:"nar",t:"ทับทิมโบกมือเสียงดังจนพิธีกรต้องเลื่อนไมค์หนี"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.isan.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคอีสานจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคอีสาน ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"ทับทิมวิ่งเข้ามากอดผู้จัดการกลางเวทีต่อหน้าคนทั้งงาน กอดแน่นจนคุณเกริกต้องยืนถือถ้วยรอ"},
   {n:"tabtim",f:"happy",l:"fight",t:"แพ้กะแพ้! แต่ขอกอดเอาคืนหน่อยเด้อ ฮ่า ๆ… อีกแป๊บเดียว"},
   {n:"nar",t:"ท้ายเวที ชายวัยกลางคนผิวคล้ำยืนนิ่งอยู่หลังคนดู พยักหน้าให้ทับทิมหนึ่งครั้ง แล้วเดินออกไป"},
   {n:"tabtim",f:"flustered",l:"fight",t:"…พ่อ? พ่อมาเบิ่งเด้…"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ทับทิม")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"คืนนั้นงานบุญบั้งไฟริมโขงยังไม่เลิก ทับทิมพาผู้จัดการเดินเลี่ยงคนออกมาที่ท่าน้ำ"},
   {n:"tabtim",f:"happy",l:"casual",t:"ตรงนี้ทับทิมมานั่งตั้งแต่น้อย ๆ เบิ่งบั้งไฟขึ้นฟ้า แล้วคิดว่าสักมื้อสิเตะให้สูงเท่านั้น"},
   {n:"nar",t:"บั้งไฟลูกสุดท้ายพุ่งขึ้นฟ้า ทับทิมเงียบไปเป็นครั้งแรกตั้งแต่รู้จักกัน"},
   {n:"tabtim",f:"sad",l:"casual",t:"ทับทิมส่งเงินให้น้องสามคนเรียนเด้อ… แต่พ่อบ่เคยยอมรับว่าเตะกะเป็นมวยโคราชได้"},
   {n:"tabtim",f:"sad",l:"casual",t:"มื้อนี้พ่อมาเบิ่ง… ทับทิมแพ้ต่อหน้าพ่อ แต่เป็นครั้งแรกที่พ่อพยักหน้า",choice:[
     {t:"\"พ่อเห็นแล้วว่าเตะของเธอเป็นมวยโคราชจริง ๆ\"",fx:G2=>{rgMeet(G2,"tabtim",4);},then:[{n:"tabtim",f:"flustered",l:"casual",t:"…อย่าพูดดี ๆ แบบนี้สิ ทับทิมสิฮ้องไห้แล้วเด้อ"}]},
     {t:"\"เธอเตะสูงกว่าบั้งไฟไปแล้วนะ\"",fx:G2=>{rgMeet(G2,"tabtim",3);},then:[{n:"tabtim",f:"happy",l:"casual",t:"ฮ่า ๆ บ้าบอ! …แต่ขอบใจเด้อ"}]}]},
   {n:"nar",t:"ทับทิมเอนหัวพิงไหล่ผู้จัดการเงียบ ๆ จนควันบั้งไฟจางหายไปจากฟ้า"},
   {n:"tabtim",f:"flustered",l:"casual",t:"…บ่ต้องบอกไผเด้อว่าทับทิมเงียบได้ เสียชื่อหมด"}]},
 central:{ring:"central",venue:"เวทีริมน้ำ อยุธยา",pair:"rin",nightBg:"boat",
  perk:{name:"หมัดเจ้าหญิง",desc:"หมัดแรงขึ้น 12% · ป้องกันวงในดีขึ้น",fx:{dmg:{punch:.12},clDef:1}},
  letter:"Dear ผู้จัดการค่ายศิริชัย\n\nสี่เข็มขัดภาคกลางครบแล้วนะคะ ยินดีด้วย ฉันดูไลฟ์ทุกไฟต์ …ไม่ได้ตั้งใจดูหรอก มันขึ้นฟีดเอง\n\nศึกชิงแชมป์ที่เวทีริมน้ำอยุธยา 3 นัด ชนะ 2 ส่งนักมวยมาคนเดียวทั้งซีรีส์นะคะ ฉันไม่ชอบเปลี่ยนคู่กลางเรื่อง\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nอลิเซีย · ค่ายหนุมานลพบุรี",
  again:"ผู้จัดการคะ\n\nถ้วยยังอยู่กับฉันนะคะ แต่ยอดวิวคลิปไฟต์ของเรายังขึ้นอยู่เลย คนดูอยากเห็น rematch\n\nพร้อมเมื่อไหร่ก็ส่งนักมวยมา ฉันรอได้ …ไม่ได้รอเพราะคุณนะ\n\nอลิเซีย",
  wait:"ไม่เป็นไรค่ะ สุขภาพนักมวยสำคัญกว่าคอนเทนต์ — อลิเซีย",
  pre:[n=>`${n} สินะ ยินดีที่ได้รู้จัก กล้องจับอยู่นะคะ ชกให้สมกับที่ทุกคนดูอยู่`,n=>`นัดนี้ไม่มีโชว์แล้วนะ ฉันจะใช้หมัดที่ซ้อมมาเพื่อเธอโดยเฉพาะ`,n=>`นัดตัดสิน… บอกไว้ก่อน ฉันไม่ได้ดังเพราะหน้าตา`],
  reply:"ฉันมาชก ไม่ได้มาออกกล้อง",pairLine:"สถิติหมัดของคุณฉันอ่านมาหมดแล้วค่ะ ทุกเปอร์เซ็นต์",
  win:["ขอบคุณค่ะ คลิปนี้ยอดวิวคงพุ่ง… แต่นัดหน้าอย่าเพิ่งยอมแพ้นะ","อีกนัดเดียว ถ้วยจะอยู่ที่ลพบุรีต่อไป","…"],
  lose:["…โอเค ยอมรับค่ะ เธอเก่งจริง แต่อย่าเข้าใจผิด ฉันยังไม่จบ","ฉันจะไม่ตัดคลิปนี้ทิ้ง เก็บไว้ดูว่าพลาดตรงไหน นัดสุดท้ายเจอกัน","…"],
  lost:(G,J)=>[{n:"alicia",f:"happy",l:"fight",t:"ถ้วยยังเป็นของฉันค่ะ ขอบคุณที่ทำให้คอนเทนต์คืนนี้ดีที่สุดของปี"},{n:"alicia",f:"flustered",l:"fight",t:"…ไม่ใช่สิ ไม่ใช่เรื่องคอนเทนต์ ฉันอยากชกกับค่ายคุณอีกจริง ๆ"},{n:"nar",t:"อลิเซียปิดกล้องก่อนลงเวที ครั้งแรกของคืนนั้น"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.central.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคกลางจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคกลาง ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"แฟลชกล้องรุมเข้ามา คุณเกริกยิ้มให้กล้องขณะยื่นถ้วยให้ อลิเซียเดินฝ่าช่างภาพมาหยุดตรงหน้าผู้จัดการ"},
   {n:"alicia",f:"happy",l:"fight",t:"ยินดีด้วยค่ะ… แล้วก็ ฉันยังไม่ได้เซ็นกับใครนะ"},
   {n:"alicia",f:"flustered",l:"fight",t:"…เข้าใจไหม ไม่ต้องตอบตอนนี้"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"อลิเซีย")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"ค่ำนั้นอลิเซียเช่าเรือลำเล็กลำหนึ่งไว้ ไม่มีทีมงาน ไม่มีช่างภาพ"},
   {n:"alicia",f:"happy",l:"casual",t:"ล่องรอบเกาะเมืองหนึ่งรอบ ไม่มีใครถ่าย ไม่มีใครไลฟ์ …ฉันจองไว้ตั้งแต่นัดแรก เผื่อแพ้จะได้มีที่ร้องไห้"},
   {n:"nar",t:"เรือผ่านวัดไชยวัฒนารามที่เปิดไฟสีทอง อลิเซียหยิบโทรศัพท์ขึ้นมา แล้วลบแอปไลฟ์ทิ้งต่อหน้าผู้จัดการ"},
   {n:"alicia",f:"sad",l:"casual",t:"คืนนี้ไม่ใช่คอนเทนต์ …ทุกคนคิดว่าฉันดังเพราะหน้าตา สปอนเซอร์ก็คิดแบบนั้น นาคาลีกส่งสัญญามาให้ฉันเป็นคนแรก"},
   {n:"alicia",f:"sad",l:"casual",t:"ฉันเกือบเซ็นแล้วนะ ถ้าไม่ได้เจอค่ายที่ชนะฉันได้โดยไม่ต้องมีกล้องสักตัว",choice:[
     {t:"\"เธอชนะมาด้วยหมัด ไม่ใช่หน้าตา\"",fx:G2=>{rgMeet(G2,"alicia",3);},then:[{n:"alicia",f:"happy",l:"casual",t:"…พูดซ้ำอีกทีได้ไหม ฉันไม่ได้อัดเสียงไว้"}]},
     {t:"\"คืนนี้ไม่มีกล้อง งั้นก็เป็นแค่อลิเซียไปเลย\"",fx:G2=>{rgMeet(G2,"alicia",4);},then:[{n:"alicia",f:"flustered",l:"casual",t:"…นั่นแหละที่ฉันกลัวที่สุด แต่ก็โอเค สำหรับคืนนี้"}]}]},
   {n:"nar",t:"หิ่งห้อยบินวนรอบหัวเรือ อลิเซียไม่พูดอะไรอีกเลยจนเรือเทียบท่า"},
   {n:"alicia",f:"flustered",l:"casual",t:"อย่าเข้าใจผิดนะ ฉันจะโหลดแอปกลับคืนพรุ่งนี้เช้า …อาจจะสาย ๆ หน่อย"}]},
 south:{ring:"south",venue:"เวทีเมืองเก่า ภูเก็ต",pair:"mali",nightBg:"andaman",
  perk:{name:"พายุสยบคลื่น",desc:"หลบได้ดีขึ้น 2% · ฟื้นแรงระหว่างยกเร็วขึ้น 12%",fx:{evade:.02,regen:.12}},
  letter:"ถึง ผู้จัดการค่ายศิริชัย\n\nเข็มขัดภาคใต้ครบสี่แล้ว\n\nมาภูเก็ต ชกสามนัด ชนะสองได้ถ้วย ส่งมาคนเดียว\n\nเลือกที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nชบา\n\nป.ล. ฝากบอกมะลิว่า…ไม่มีอะไร",
  again:"ผู้จัดการ\n\nถ้วยยังอยู่ภูเก็ต\n\nพร้อมเมื่อไหร่ก็มา\n\nชบา",
  wait:"รอได้ — ชบา",
  pre:[n=>`…${n}`,n=>`นัดนี้ไม่หลบแล้ว`,n=>`นัดสุดท้าย ม่ายมีใครถอย`],
  reply:"…ไม่ถอยเหมือนกัน",pairLine:"พี่ชบา… ครั้งนี้มะลิจะไม่ร้องไห้แล้วนะ",
  win:["…หรอย","อีกนัด","…"],
  lose:["…ดี","…นัดสุดท้าย","…"],
  lost:(G,J)=>[{n:"chaba",f:"happy",l:"fight",t:"…ถ้วยอยู่นี่"},{n:"chaba",f:"flustered",l:"fight",t:"มาอีกได้ …อยากให้มา"},{n:"nar",t:"ชบาพูดเท่านั้นแล้วเดินลงเวทีไป ทุกคนในค่ายหันมามองหน้ากัน"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.south.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคใต้จบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคใต้ ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"ข้างเวที ชายหนุ่มนั่งรถเข็นปรบมือช้า ๆ ชบาเดินไปหาเขาก่อน แล้วถึงเดินกลับมาหาผู้จัดการ"},
   {n:"nar",t:"ชบาจับมือผู้จัดการแน่น ไม่พูดอะไร แล้วเดินจากไปเฉย ๆ ทั้งที่ยังไม่ปล่อยมือ จนต้องเดินตามไปสามก้าว"},
   {n:"chaba",f:"flustered",l:"fight",t:"…พี่ชาย อยากรู้จัก"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ชบา")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"คืนนั้นชบาพาผู้จัดการขี่มอเตอร์ไซค์พ่วงข้างไปชายหาดที่ไม่มีนักท่องเที่ยว พระจันทร์เต็มดวงพอดี"},
   {n:"chaba",f:"happy",l:"casual",t:"…ที่นี่ ตอนเด็ก พี่ชายพามาซ้อมวิ่งในทราย"},
   {n:"chaba",f:"sad",l:"casual",t:"เรือคว่ำ พี่ขาเจ็บ ม่ายได้ชกอีก ชบาชกแทน แล้วนาคาเอาเรื่องพี่ไปทำโฆษณา ม่ายถามสักคำ"},
   {n:"nar",t:"ชบาโยนเปลือกหอยลงทะเลไกลมาก คลื่นซัดมันกลับมาที่เท้าทั้งคู่",choice:[
     {t:"\"พี่ชายเธอคงภูมิใจในตัวเธอมาก\"",fx:G2=>{rgMeet(G2,"chaba",3);},then:[{n:"chaba",f:"happy",l:"casual",t:"…พี่บอกแบบนั้นเหมือนกัน"}]},
     {t:"นั่งลงข้าง ๆ เงียบ ๆ",fx:G2=>{rgMeet(G2,"chaba",4);},then:[{n:"nar",t:"ชบานั่งลงตาม ไหล่ชนกันนิดหนึ่ง ไม่มีใครขยับหนี"}]}]},
   {n:"chaba",f:"flustered",l:"casual",t:"…อยู่ต่ออีกวันได้ไหม …ไซ"},
   {n:"nar",t:"ชบาหันหน้าไปทางทะเลทันทีที่พูดจบ แต่หูแดงจนเห็นได้ใต้แสงจันทร์"}]}};
/* the camp girl closest to you (bond 40+) — she reacts when a champion gets near */
function rgTopGirl(G){const L=CANON_IDS.map(id=>G.F[id]).filter(f=>f&&f.camp==="player"&&(f.bond||0)>=40).sort((a,b)=>(b.bond||0)-(a.bond||0));return L[0]||null;}
function rgJeal(id,champ){const L={kati:`ครูคะ… ${champ}ยืนใกล้ไปหรือเปล่า หนูแค่สังเกตเฉย ๆ ค่ะ`,mali:`มะลิก็อยากได้กอดบ้างนะ~ …ล้อเล่นค่ะ (ไม่ได้ล้อเล่น)`,
  rin:`ระยะห่างระหว่างผู้จัดการกับ${champ}เมื่อกี้ น้อยกว่าค่าเฉลี่ยของทั้งคืนค่ะ ข้อมูลเฉย ๆ`,ploy:`ยิ้มอะไรนักหนา …เปล่า ไม่ได้ว่าอะไร`,fah:`เฮ้! ${champ}! ผู้จัดการเป็นของค่ายศิริชัยนะ! …หมายถึงผู้จัดการค่ายน่ะ!`};return L[id]||"…";}
function rgMeet(G,cid,v){const R=G.region,m=R.meet;m[cid]=(m[cid]||0)+v;rgTouch(G,cid);(R.meetPk=R.meetPk||{})[cid]=Math.max(R.meetPk[cid]||0,m[cid]);}
/* v1.90: any real contact with a champion (a trip to her region, a bout, a visit, a duel, a night out) resets her "haven't seen you" clock */
function rgTouch(G,cid){const R=G.region;if(!R)return;(R.meetT=R.meetT||{})[cid]=gameWeek(G);if(R.miss)delete R.miss[cid];}
/* three weeks apart: she writes · four or more: the bond fades a little each week (outside-camp rate), never below the level she reached */
const RG_MISS={
 north:"ผู้จัดการเจ้า\n\nช่วงนี้เชียงใหม่หนาวแล้วเจ้า หมอกลงทุกเช้าเลย… หนูบ่ได้มีหยังจะเล่าหรอกเจ้า แค่คิดถึงค่ายศิริชัยนิดหน่อย\n\nถ้าว่างก็ขึ้นมาแอ่วเน้อ\n— ใบบัว",
 isan:"พี่ผู้จัดการ!\n\nเงียบหายไปไสเด้อ ทับทิมเปิดไลฟ์ค่ายพี่ดูทุกมื้อ แต่บ่เห็นพี่ออกกล้องเลย\n\nคิดฮอดเด้อ (คิดฮอดค่ายเฉย ๆ บ่ได้คิดฮอดพี่ ฮ่า ๆ)\n— ทับทิม",
 central:"Hi,\n\nยอดวิวคลิปค่ายคุณตกลงนิดหน่อยนะ ฉันเช็กให้แล้ว ไม่ได้ตั้งใจดูหรอก แค่ผ่านตา\n\nมีอะไรคืบหน้าก็… บอกกันบ้างก็ได้\n— อลิเซีย",
 south:"…ช่วงนี้คลื่นแรง\n\nไม่มีอะไร\n\n— ชบา"};
const RG_FLOOR=[20,10,5,0];
/* scenes and fights for the champions */
if(typeof BGIMG!=="undefined")Object.assign(BGIMG,{rg_north:"bg_region_north.webp",rg_northeast:"bg_region_northeast.webp",rg_central:"bg_region_central.webp",rg_south:"bg_region_south.webp",rg_east:"bg_region_east.webp",
  doisuthep:"bg_doisuthep.webp",mekong:"bg_mekong.webp",boat:"bg_boat.webp",andaman:"bg_andaman.webp",
  night_north:"bg_night_north.webp",night_isan:"bg_night_isan.webp",night_central:"bg_night_central.webp",night_south:"bg_night_south.webp",
  gala:"bg_gala_ballroom.webp",hotel_room:"bg_hotel_room.webp",gas_station:"bg_gas_station.webp",camp_buatasao:"bg_camp_buatasao.webp",tasao_shrine:"bg_tasao_shrine.webp",
  camp_phimai:"bg_camp_phimai.webp",somtam_stall:"bg_somtam_stall.webp",bus_terminal:"bg_bus_terminal.webp",mali_home:"bg_mali_home.webp",pier_south:"bg_pier_south.webp",
  camp_andaman:"bg_camp_andaman.webp",camp_hanuman:"bg_camp_hanuman.webp",lopburi_monkeys:"bg_lopburi_monkeys.webp",krerk_dinner:"bg_krerk_dinner.webp",
  closing_ceremony:"bg_closing_ceremony.webp",naka_underground:"bg_naka_underground.webp",naka_lab:"bg_naka_lab.webp"});
if(typeof SPECIALS!=="undefined")Object.assign(SPECIALS,{
  baibua:[{img:"baibua_special",w:"elbow",def:"ศอกบัวบานกลับหลัง"}],tabtim:[{img:"tabtim_special",w:"kick",def:"เตะกระโดดทับทิมแดง"}],
  alicia:[{img:"alicia_special",w:"punch",def:"อัปเปอร์คัตเจ้าหญิง"}],chaba:[{img:"chaba_special",w:"punch",def:"หมัดพายุสยบคลื่น"}]});


/* ---------- round 4: the champion visits the camp between bout 1 and bout 2 — a minigame duel, best of 3 ---------- */
const DUEL_CFG={
 north:{game:"bag",dk:"hard",bars:5,partner:"kati",label:"เตะกระสอบตามกลองแขก (ยาก)",target:[.74,.78,.82],unit:"ความแม่นยำ"},
 isan:{game:"somtam",dk:"normal",bars:5,partner:"ploy",label:"ตำส้มตำ",target:[.76,.8,.84],unit:"ความแม่นยำ"},
 central:{game:"live",partner:"rin",label:"ไลฟ์ขายของ 30 วินาที",target:[9.7,11.75,13.8],unit:"ยอดขาย"},
 south:{game:"run",partner:"mali",label:"วิ่งแข่ง 100 เมตร",pace:[6.5,6.9,7.3],unit:"เวลา"}};
const DUEL_TALK={
 north:{intro:"ตีกลองแขกให้หนูนะเจ้า… หนูเตะตามจังหวะได้ทุกโน้ตเลยเน้อ",rw:"ลำขนาดเจ้า… ผู้จัดการเลือกนักมวยเก่งแท้",rl:"ขอโทษเจ้า หนูเผลอเอาจริงไปหน่อย",
  win:"หนูแพ้แล้วเจ้า… แต่สนุกที่สุดตั้งแต่ขึ้นชกมาเลย",lose:"หนูชนะเจ้า… ไว้มาแก้มือใหม่เน้อ หนูจะรอ"},
 isan:{intro:"ตำส้มตำแข่งกับคนอีสาน? คักแท้! ทับทิมบ่ยอมแพ้เรื่องนี้ดอกเด้อ",rw:"เฮ้ย! ตำแซบกว่าทับทิมได้จั่งได๋!",rl:"ฮ่า ๆ ส้มตำคือบ้านทับทิมเด้อ",
  win:"ฮ่า ๆ ๆ ทับทิมแพ้คนกรุงเทพฯ เรื่องส้มตำ! อย่าบอกแม่เด้อ… ขอรางวัลปลอบใจได้บ่",lose:"ทับทิมชนะ! คืนนี้ทับทิมตำเลี้ยงทั้งค่ายเอง"},
 central:{intro:"ไลฟ์แข่งกันไหม คนละสามสิบวินาที ใครขายได้มากกว่าชนะ …ฉันไม่ออมมือให้หรอกนะ",rw:"…ยอดขายแพ้ค่ายเล็กได้ยังไงเนี่ย",rl:"มืออาชีพก็ต้องแบบนี้ค่ะ",
  win:"โอเค ยอมรับ ค่ายเธอรู้จักคนดูจริง ๆ …อย่าเข้าใจผิดนะ ไม่ได้ชม",lose:"ฉันชนะ แต่ไลฟ์ของพวกเธอน่าดูกว่าที่คิด"},
 south:{intro:"…วิ่ง ร้อยเมตร",rw:"…ไว",rl:"…",
  win:"…แพ้ …หรอย",lose:"…ยังไม่พอ มะลิ"}};
const RG_VISIT={
 north:G=>[{n:"nar",t:"ใบบัวมาถึงค่ายแต่เช้า ถือตะกร้าข้าวต้มมัดมาฝากทั้งค่าย"},{n:"baibua",f:"happy",l:"casual",t:"หนูมาดูว่าค่ายที่ชนะหนูนัดแรกเป็นจะได เจ้า… ค่ายนี้ทุกคนช่วยกันหมดเลยเน้อ"},
  ...(G.F.kati&&G.F.kati.camp==="player"?[{n:"kati",f:"happy",l:"train",with:"baibua",t:"ท่าเสาเหมือนกัน มาซ้อมด้วยกันไหมคะ"},{n:"nar",t:"ทั้งเช้ากะทิกับใบบัวซ้อมศอกคู่กัน คนหนึ่งสวน อีกคนหลบ จนครูแดงต้องตะโกนเรียกพัก"}]:[]),
  {n:"nar",t:"ตอนเที่ยง ใบบัวนั่งดูทุกคนในค่ายช่วยกันยกหม้อข้าว ล้างนวม ตากผ้าพันมือ แล้วเงียบไปนาน"},
  {n:"baibua",f:"sad",l:"casual",t:"…ที่ค่ายหนู งานพวกนี้หนูทำคนเดียวทั้งหมดเลยเจ้า"},{n:"baibua",f:"flustered",l:"casual",t:DUEL_TALK.north.intro}],
 isan:G=>[{n:"nar",t:"เสียงมอเตอร์ไซค์ดังมาตั้งแต่ปากซอย ทับทิมโบกมือก่อนจอดเสียอีก"},{n:"tabtim",f:"happy",l:"casual",t:"มาเยี่ยมเด้อ! ค่ายนี้แหละที่เตะทับทิมจนมึนนัดแรก ฮ่า ๆ"},
  ...(G.F.ploy&&G.F.ploy.camp==="player"?[{n:"ploy",f:"pout",l:"casual",with:"tabtim",t:"มาทำไมแต่เช้า …ไม่ได้ไล่นะ"}]:[]),{n:"tabtim",f:"happy",l:"casual",t:DUEL_TALK.isan.intro}],
 central:G=>[{n:"nar",t:"รถตู้สีขาวจอดหน้าค่าย อลิเซียลงมาคนเดียว ใส่แว่นดำ หมวกแก๊ป"},{n:"alicia",f:"happy",l:"casual",t:"ทีมสปอนเซอร์ตามถ่ายฉันทั้งอาทิตย์ ขอหลบที่นี่สักวัน …ไม่ได้มาหาใครเป็นพิเศษหรอกนะ"},
  ...(G.F.rin&&G.F.rin.camp==="player"?[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"ยอดวิวคลิปไฟต์นัดแรกขึ้น 340% ค่ะ ฉันมีกราฟ"}]:[]),{n:"alicia",f:"flustered",l:"casual",t:DUEL_TALK.central.intro}],
 south:G=>[{n:"nar",t:"ชบามาถึงค่ายโดยไม่บอกใคร ช่วยซ่อมรั้วหลังค่ายไปครึ่งแถวก่อนที่จะมีคนเห็น"},{n:"chaba",f:"happy",l:"casual",t:"…รั้วโยก"},
  ...(G.F.mali&&G.F.mali.camp==="player"?[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"พี่ชบา! มาทำไมไม่บอกมะลิ~ มะลิจะได้เตรียมขนม"}]:[]),{n:"chaba",f:"flustered",l:"casual",t:DUEL_TALK.south.intro}]};
const DUEL={st:null,
  el(){return document.getElementById("minibag");},
  open(r,practice,after){const C=DUEL_CFG[r],F=bagFighters(G).filter(f=>C.game!=="live"||f.canon);if(!F.length){toast("ไม่มีนักมวยที่พร้อมดวล");after&&after(null);return;}
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
    else if(C.game==="run"){BAG.st={phase:"run",mode:"run",practice:true};RUN.pick({id:S.id,duel:{opp:{id:cid,name:RG[S.r].champ,pace:C.pace[S.round-1]},label:`รอบ ${S.round}/3`}});RUN.set();}},
  /* one round finished: res.win (sprint) or res.score against the champion's mark */
  done(res,X){const S=this.st;if(!S)return;const C=DUEL_CFG[S.r],tg=this.target();
    const win=res.win!=null?res.win:res.score>=tg;S.log.push({win,score:res.score,tg});if(win)S.w++;else S.l++;
    if(LIVE.st&&LIVE.st.duel){LIVE.st=null;}
    if(C.game!=="run"){BAG.st={phase:"duel",mode:C.game,id:S.id,practice:true};S.phase="round";this.draw();}},
  next(){const S=this.st;if(!S)return;if(RUN.st){RUN.stop();RUN.st=null;}BAG.st={phase:"duel",mode:DUEL_CFG[S.r].game,id:S.id,practice:true};
    if(S.phase==="round"||DUEL_CFG[S.r].game==="run"){if(S.w>=2||S.l>=2){this.finish();return;}S.round++;S.phase="intro";this.draw();return;}this.draw();},
  finish(){const S=this.st,cid=S.cid,won=S.w>=2;S.phase="end";const out=[];
    if(!S.practice){rgMeet(G,cid,won?4:2);const du=won?5:2;G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
      const f=G.F[S.id];if(f){f.morale=Math.min(100,(f.morale||0)+(won?5:2));out.push(`${esc(f.name)} กำลังใจ +${won?5:2}`);}
      if(won){G.region.duelWon=G.region.duelWon||{};G.region.duelWon[cid]=(G.region.duelWon[cid]||0)+1;}}
    S.out=out;save();this.draw();AU.sfx&&AU.sfx(won?"level":"ui");},
  dots(){const S=this.st;return `<div class="duel-dots">${[0,1,2].map(i=>{const L=S.log[i];return L?(L.win?"🟢":"🔴"):"⚪";}).join("")}</div>`;},
  fmt(v){const C=DUEL_CFG[this.st.r];return C.game==="live"?Math.floor(v)+" ชิ้น":C.game==="run"?v.toFixed(2)+" วิ":Math.round(v*100)+"%";},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const C=DUEL_CFG[S.r],T=DUEL_TALK[S.r],champ=RG[S.r].champ,me=G.F[S.id];
    const vs=`<div class="duel-vs"><div><img src="${faceSrc(S.id,"happy")}" alt=""><br><b>${esc(me.name)}</b></div><b class="goldt">${S.w} : ${S.l}</b><div><img src="${faceSrc(S.cid,"happy")}" alt=""><br><b>${esc(champ)}</b></div></div>`;
    if(S.phase==="intro"){const F=bagFighters(G).filter(f=>C.game!=="live"||f.canon),tg=this.target();
      el.innerHTML=`<div class="mbox px"><h2>ดวลกับ${esc(champ)} · ${esc(C.label)}</h2>${this.dots()}${vs}
       <p class="meta center">รอบที่ ${S.round} จาก 3 · ชนะ 2 รอบก่อนชนะการดวล${tg!=null?` · ${esc(champ)}ทำไว้ ${this.fmt(tg)} (${C.unit})`:""}</p>
       ${S.round===1?`<b class="meta">ใครลงดวล</b><div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.id?"on":""}" data-du="pick" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>`:""}
       ${S.practice?`<p class="meta center">ดวลซ้อม · ไม่มีรางวัล</p>`:""}
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">ยอมแพ้</button><button class="btn primary" data-du="go">เริ่มรอบ ${S.round} ▸</button></div></div>`;return;}
    if(S.phase==="round"){const L=S.log[S.log.length-1];
      el.innerHTML=`<div class="mbox px"><h2>${L.win?"ชนะรอบนี้!":"แพ้รอบนี้"}</h2>${this.dots()}${vs}
       <p class="center">${esc(me.name)} <b>${this.fmt(L.score)}</b> · ${esc(champ)} <b>${this.fmt(L.tg)}</b></p>
       <p class="center"><i>${esc(champ)}: "${esc(L.win?T.rw:T.rl)}"</i></p>
       <div class="mfoot roadbtns"><button class="btn primary" data-du="next">ต่อไป ▸</button></div></div>`;return;}
    if(S.phase==="end"){const won=S.w>=2;
      el.innerHTML=`<div class="mbox px"><h2>${won?`ชนะการดวล ${S.w}-${S.l}!`:`${esc(champ)}ชนะ ${S.l}-${S.w}`}</h2>${this.dots()}${vs}
       <p class="center"><i>${esc(champ)}: "${esc(won?T.win:T.lose)}"</i></p>${S.out&&S.out.length?`<p class="center"><span class="rwl">${S.out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span></p>`:""}
       <div class="mfoot roadbtns"><button class="btn primary" data-du="end">กลับค่าย</button></div></div>`;}}};

/* v1.90 round 5: the opening gala (the week after the invitation) and the story beat after the first cup — the green-gold contract */
const RG_CID={north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"};
const rgIn=(G,id)=>!!(G.F[id]&&G.F[id].camp==="player");
const rgIf=(ok,steps)=>ok?steps:[];
function rgGala(G){const top=rgTopGirl(G),fah=rgIn(G,"fah"),ploy=rgIn(G,"ploy"),R=G.region,meet=(id,v)=>G2=>rgMeet(G2,id,v);return [
 {n:"nar",bg:"gala",t:"รถของค่ายจอดหน้าโรงแรมกลางกรุงเทพฯ ป้ายนาคาเอเนอร์จี้ดริงค์สูงเท่าตึกสามชั้น พญานาคสีเขียวทองขดตัวชูคออยู่กลางป้าย"},
 {n:"nar",t:"มาสคอตพญานาคตัวเท่าคนยืนโบกมืออยู่หน้าประตู ทุกครั้งที่มีแขกเดินผ่าน มันจะชกลมให้ดูสองที"},
 {n:"coach",t:"ครูใส่สูทครั้งล่าสุดตอนงานบวชหลานชาย… คอเสื้อมันรัดชะมัด"},
 ...rgIf(fah,[{n:"fah",f:"flustered",l:"casual",t:"ไหนบอกว่างานเลี้ยงไง! ทำไมทุกคนแต่งตัวเหมือนไปงานแต่งงาน ฟ้าใส่ชุดวอร์มมานะ!"}]),
 ...rgIf(fah&&rgIn(G,"kati"),[{n:"kati",f:"happy",l:"casual",t:"หนูบอกแล้วนะคะว่าบัตรเชิญเขียนว่า \"แต่งกายสุภาพ\"… ฟ้าตอบว่า \"ชุดวอร์มก็สุภาพ\""}]),
 {n:"nar",show:[],t:"ไฟในห้องบอลรูมหรี่ลง เสียงกลองยาวรัวขึ้น พิธีกรเดินออกมากลางเวที"},
 {n:"npc",who:"พิธีกร",t:"ขอต้อนรับทุกท่านสู่ศึกชิงเจ้าสี่ภาค ครั้งแรกของประเทศไทย! ขอเชิญประธานนาคาเอเนอร์จี้ดริงค์ อดีตความหวังเหรียญโอลิมปิกของชาติ… คุณเกริกครับ!"},
 {n:"nar",show:[{id:"npc:krerk"}],t:"ชายในสูทเขียวเข้มปักลายนาคสีทองเดินขึ้นเวที ยิ้มกว้าง แล้วยกมือห้ามเสียงปรบมือเบา ๆ"},
 {n:"npc",who:"คุณเกริก",t:"เรื่องโอลิมปิกมันนานมาแล้วครับ วันนี้เป็นวันของน้อง ๆ นักมวย ไม่ใช่ของคนแก่ที่ชกไม่ได้แล้ว"},
 {n:"npc",who:"คุณเกริก",t:"กติกาง่าย ๆ ครับ ภาคละสี่จังหวัด เก็บเข็มขัดแชมป์ประจำจังหวัดให้ครบสี่เส้น แล้วจะได้สิทธิ์ท้าแชมป์ประจำภาค ชกสามนัด ชนะสองได้ถ้วย"},
 {n:"npc",who:"คุณเกริก",t:"ค่าเดินทางตอนเก็บเข็มขัด ค่ายจ่ายกันเองนะครับ ส่วนศึกชิงถ้วย นาคาเอเนอร์จี้ออกให้หมด… ดื่มนาคา ชกไม่มีหมด!"},
 {n:"nar",show:[],t:"เสียงหัวเราะดังทั่วห้อง สปอตไลต์สี่ดวงส่องลงมาบนเวที พิธีกรอ่านชื่อแชมป์ประจำภาคทีละคน"},
 {n:"npc",who:"พิธีกร",show:[{id:"baibua",l:"casual"}],t:"แชมป์ภาคเหนือ ดอกบัวซ่อนหนามแห่งล้านนา… ใบบัว!"},
 {n:"baibua",f:"happy",l:"casual",t:"สวัสดีเจ้า… หนูใบบัว มาจากค่ายบัวท่าเสา เชียงใหม่เจ้า"},
 {n:"nar",t:"เสียงเบาจนพิธีกรต้องยื่นไมค์เข้าไปใกล้ ๆ ใบบัวยิ้มหวาน"},
 {n:"baibua",f:"happy",l:"casual",t:"ศอกของหนูบ่ได้แรงหยังหรอกเจ้า… แค่คู่ชกมักจะลุกบ่ขึ้นเท่านั้นเอง"},
 {n:"npc",who:"พิธีกร",show:[{id:"tabtim",l:"casual"}],t:"แชมป์ภาคอีสาน ทับทิมเอกเซียนอีสาน… ทับทิม!"},
 {n:"tabtim",f:"happy",l:"casual",t:"สวัสดีพี่น้องทั้งห้องเด้อ! แอร์เย็นคักแท้ หนาวกว่าโคราชหน้าหนาวอีก ฮ่า ๆ ๆ"},
 {n:"nar",t:"ทับทิมหัวเราะลั่นจนทั้งห้องหัวเราะตาม แต่ระหว่างนั้นเธอแอบก้าวยาว ๆ วัดความกว้างของเวทีไปด้วย"},
 {n:"npc",who:"พิธีกร",show:[{id:"alicia",l:"casual"}],t:"แชมป์ภาคกลาง เจ้าหญิงแห่งวงการมวยไทย… อลิเซีย!"},
 {n:"nar",t:"แฟลชกล้องรัวจนห้องสว่างวาบ อลิเซียหันยิ้มให้กล้องทีละตัวแบบไม่พลาดสักตัว"},
 {n:"alicia",f:"happy",l:"casual",t:"ขอบคุณค่ะ Thank you, everyone. ปีนี้ฉันไม่ได้มาถ่ายรูปนะคะ ฉันมาเพื่อชนะ"},
 {n:"npc",who:"พิธีกร",show:[{id:"chaba",l:"casual"}],t:"และแชมป์ภาคใต้ หมัดพายุสยบคลื่น… ชบา!"},
 {n:"chaba",f:"happy",l:"casual",t:"…มาชก ไม่ได้มาแหลง"},
 {n:"nar",t:"ห้องเงียบไปสามวินาที แล้วพิธีกรก็รีบชวนทุกคนปรบมือ"},
 {n:"nar",t:"พอพิธีเปิดจบ แชมป์ทั้งสี่เดินลงจากเวที แล้วตรงมาที่โต๊ะของค่ายศิริชัย",choice:[
   {t:"ทักใบบัวก่อน",fx:meet("baibua",1),then:[{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการค่ายศิริชัยตัวจริงแท้ ๆ… หนูดูไลฟ์ไฟต์ค่ายนี้ทุกนัดเลยเจ้า"}]},
   {t:"ทักทับทิมก่อน",fx:meet("tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"พี่ผู้จัดการ! ทับทิมจำหน้าได้ ไลฟ์ค่ายพี่ม่วนคักแท้เด้อ"}]},
   {t:"ทักอลิเซียก่อน",fx:meet("alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"Oh ค่ายที่ใคร ๆ ก็พูดถึง ตัวจริงดูธรรมดากว่าในคลิปนะคะ …ฉันชมนะ"}]},
   {t:"ทักชบาก่อน",fx:meet("chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…ชบา"},{n:"nar",t:"ชบาพยักหน้าครั้งเดียว แต่ยืนอยู่ตรงนั้นนานกว่าที่จำเป็น"}]}]},
 ...rgIf(rgIn(G,"kati"),[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"กะทิใช่ก่เจ้า ท่าเสาเหมือนกันเจ้า… หนูได้ยินชื่อมาตั้งนานแล้ว"},{n:"kati",f:"flustered",l:"casual",t:"ห-หนูก็ได้ยินชื่อพี่ใบบัวค่ะ! ศอกบัวบานกลับหลังที่ลือกันนั่น…"}]),
 ...rgIf(ploy,[{n:"tabtim",with:"ploy",f:"happy",l:"casual",t:"อ้อ! นี่เองหมัดโคราชของคนกรุงเทพฯ ทับทิมอยากลองโดนสักหมัดเด้อ"},{n:"ploy",f:"happy",l:"casual",t:"…อยากลองก็ขึ้นเวทีมาสิ"}]),
 ...rgIf(rgIn(G,"rin"),[{n:"alicia",with:"rin",f:"happy",l:"casual",t:"เธอคือคนที่อ่านสัญญาสิบสี่หน้าก่อนเซ็นใช่ไหม? คลิปนั้นยอดวิวเยอะกว่าคลิปไฟต์ฉันอีกนะ"},{n:"rin",f:"happy",l:"casual",t:"ก็ต้องอ่านสิคะ ตัวหนังสือเล็ก ๆ ท้ายสัญญามักเป็นส่วนที่แพงที่สุด"}]),
 ...rgIf(rgIn(G,"mali"),[{n:"mali",with:"chaba",f:"surprised",l:"casual",t:"พี่ชบา!! พี่ชบาใช่ไหมคะ! มะลิเองไง มะลิตัวเล็กที่ไชยา!"},{n:"chaba",f:"happy",l:"casual",t:"…จำผิดคนแล้ว"},
   {n:"nar",t:"ชบาหันหลังเดินไป แต่มะลิทันเห็นว่าหูของเธอแดงไปถึงต้นคอ"},{n:"mali",f:"sad",l:"casual",t:"…ไม่ผิดคนหรอก มะลิจำได้"}]),
 ...rgIf(fah,[{n:"fah",f:"pout",l:"casual",t:"เดี๋ยวนะ! ใบบัวมีกะทิ ทับทิมมีพลอย อลิเซียมีริน ชบามีมะลิ… แล้วฟ้าล่ะ! ทำไมฟ้าไม่มีพี่น้องร่วมสายเลยสักคน!"},
   {n:"coach",t:"สายของฟ้ายังไม่มีชื่อ ก็ตั้งชื่อเองสิ"}]),
 ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"แชมป์ทั้งสี่")}]:[]),
 {n:"npc",who:"พิธีกร",show:[],t:"และอีกหนึ่งข่าวใหญ่! นาคาเอเนอร์จี้ขอแนะนำค่ายรับเชิญพิเศษ ที่จะร่วมชกในทุกภาค… ค่ายเวกเตอร์ กรุงเทพฯ!"},
 {n:"nar",t:ploy?"ไพลินเดินขึ้นเวทีในชุดสูทขาว สายตากวาดไปทั่วห้อง แล้วหยุดอยู่ที่พลอยนานกว่าคนอื่น":"ไพลินเดินขึ้นเวทีในชุดสูทขาว สายตากวาดไปทั่วห้อง แล้วหยุดอยู่ที่โต๊ะค่ายศิริชัย"},
 {n:"pailin",f:"happy",t:"ข้อมูลของทุกค่ายในห้องนี้อยู่ในแท็บเล็ตของฉันหมดแล้วค่ะ …ขอให้สนุกกับการเดินทางนะคะ"},
 {n:"nar",show:[{id:"pailin"},{id:"npc:krerk"}],t:"คุณเกริกเดินเข้าไปจับมือไพลิน ตบไหล่เบา ๆ สองที ท่าทางเหมือนคนที่รู้จักกันมานานกว่าที่ใครในห้องรู้"},
 {n:"nar",show:[],t:"ช่างภาพเรียกทุกค่ายขึ้นถ่ายรูปหมู่หน้าป้ายพญานาค"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"มุมห้องข้างคุณเกริก มีผู้หญิงใส่ฮู้ดสีขาวยืนนิ่งอยู่คนเดียว ปอยผมสีขาวปลายแดงโผล่ออกมาจากฮู้ด ไม่มีใครแนะนำเธอ"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"ข้อนิ้วของเธอพันเทปแบบนักสู้ MMA ไม่ใช่ผ้าพันมือแบบมวยไทย"},
 fah?{n:"fah",f:"flustered",l:"casual",t:"…ผู้จัดการ คนใส่ฮู้ดตรงนั้นมองฟ้าอยู่ ขนลุกไปทั้งตัวเลย"}:{n:"coach",t:"คนใส่ฮู้ดตรงนั้น… ยืนเหมือนคนที่พร้อมจะชกได้ตลอดเวลา"},
 {n:"nar",show:[],t:"แฟลชกล้องวาบขึ้น พอแสงจางลง มุมห้องตรงนั้นก็ว่างเปล่า"},
 {fx:G2=>{for(const r of RG_ORDER)rgTouch(G2,RG_CID[r]);}},{n:"coach",t:"เอาล่ะ กลับไปซ้อมกัน เข็มขัดสิบหกเส้นไม่ได้มาเพราะใส่สูทหล่อหรอก"}];}
/* the week after the first cup: the green-gold contract */
const RG_C1_CALL={
 north:["ผู้จัดการได้ซองเขียวเหมือนกันก่เจ้า… ข้อสิบสี่จุดสาม หนูก่สะดุดตรงนั้นเหมือนกัน","ตอนเวกเตอร์มาขอซื้อค่ายหนู สัญญาของเขาก่มีข้อแบบนี้ ตัวหนังสือเหมือนกันเปี๊ยบเลยเจ้า"],
 isan:["พี่ผู้จัดการ ได้ซองเขียวคือกันบ่! ทับทิมอ่านบ่จบดอก แต่น้องชายเรียนนิติฯ บอกว่าข้อสิบสี่มันแปลก ๆ","แล้วฮู้บ่ เวกเตอร์เคยส่งสัญญามาให้ทับทิมตอนต้นปี ข้อเดียวกันเป๊ะเลยเด้อ"],
 central:["ซองเขียวทองมาถึงหรือยังคะ? ผู้จัดการส่วนตัวของฉันบอกให้เซ็น แต่ฉันอ่านข้อ 14.3 แล้ว…","ฉันคุ้นประโยคนั้น เวกเตอร์ส่งข้อเสนอมาให้ฉันก่อนทัวร์ ใช้คำเดียวกันทุกตัวอักษรเลยค่ะ"],
 south:["…ซองเขียวมาแล้วใช่ไหม","เวกเตอร์ส่งสัญญามาให้ก่อนทัวร์ ข้อเดียวกัน คำเดียวกัน …ไม่ใช่เรื่องบังเอิญ"]};
function rgCup1(G,r){const cid=RG_CID[r],rin=rgIn(G,"rin"),R=G.region,L=RG_C1_CALL[r];return [
 {n:"nar",bg:"camp",t:"จดหมายปิดผนึกสีเขียวทองมาถึงค่าย ตราพญานาคประทับครั่งไว้กลางซอง"},
 {n:"nar",t:"\"สัญญาเจ้าของถ้วย ศึกชิงเจ้าสี่ภาค\" นาคาเอเนอร์จี้ขอให้ค่ายที่ได้ถ้วยเซ็นรับสิทธิ์ร่วมงานโปรโมต แนบสำเนาเช็คค่าตัวมาให้ดูก่อน ฿30,000"},
 {n:"coach",t:"สามหมื่นแค่ถ่ายโฆษณาเนี่ยนะ? เซ็นเลยสิ… ว่าแต่ตัวหนังสือมันเล็กชะมัด"},
 ...(rin?[{n:"rin",f:"happy",l:"casual",t:"เดี๋ยวก่อนค่ะ ขอสิบห้านาที"},
   {n:"nar",t:"สิบห้านาทีกลายเป็นหนึ่งชั่วโมง รินอ่านครบทั้งยี่สิบสองหน้า ขีดปากกาแดงไปเจ็ดจุด"},
   {n:"rin",f:"sad",l:"casual",t:"หน้า 19 ข้อ 14.3 ค่ะ \"ข้อมูลการชก ภาพ และเสียงของนักมวยในสังกัด ให้ตกเป็นสิทธิ์ของบริษัทและบริษัทในเครือ โดยไม่มีกำหนดเวลา\""},
   {n:"rin",f:"sad",l:"casual",t:"ไม่มีกำหนดเวลา แปลว่าตลอดไปค่ะ แล้วก็ไม่ได้เขียนไว้เลยว่า \"บริษัทในเครือ\" คือใคร"},
   {n:"rin",f:"happy",l:"casual",t:"สามหมื่นแลกข้อมูลทุกไฟต์ของทุกคนในค่ายไปตลอดชีวิต… หารต่อไฟต์แล้วถูกกว่าค่ากาแฟอีกค่ะ"}]
  :[{n:"coach",t:"…เดี๋ยวนะ หน้า 19 ข้อ 14.3 \"ข้อมูลการชก ภาพ และเสียงของนักมวยในสังกัด ให้ตกเป็นสิทธิ์ของบริษัทและบริษัทในเครือ โดยไม่มีกำหนดเวลา\""},
   {n:"coach",t:"ไม่มีกำหนดเวลา… ครูอ่านหนังสือไม่เก่ง แต่คำนี้ครูรู้ว่าแปลว่าตลอดไป"}]),
 {n:"nar",t:`คืนนั้นโทรศัพท์ของค่ายดังขึ้น ปลายสายคือ${RG[r].champ}`},
 {n:cid,f:"sad",l:"casual",t:L[0]},{n:cid,f:"sad",l:"casual",t:L[1]},
 rin?{n:"rin",f:"sad",l:"casual",t:"สัญญาของเวกเตอร์กับของผู้จัดงาน ร่างมาจากคนคนเดียวกันค่ะ"}:{n:"coach",t:"สัญญาของเวกเตอร์กับของผู้จัดงานหน้าตาเหมือนกันเปี๊ยบ… ครูไม่ชอบกลิ่นมันเลย"},
 {n:"nar",t:"ซองเขียวทองวางอยู่บนโต๊ะทำงาน จะเอายังไงกับมันดี",choice:[
   {t:"ส่งกลับไป ขีดฆ่าข้อ 14.3 ทิ้ง",fx:()=>{R.c1="edit";},then:[
     rin?{n:"rin",f:"happy",l:"casual",t:"เดี๋ยวรินเขียนหมายเหตุแนบไปให้ค่ะ สุภาพ แต่ชัดเจน"}:{n:"coach",t:"เอาปากกาแดงมา ครูขีดเอง"},
     {n:"nar",t:"สามวันต่อมา นาคาเอเนอร์จี้โทรมาขอบคุณ น้ำเสียงยังยิ้มเหมือนเดิม แต่ไม่มีใครพูดถึงเช็คอีกเลย"}]},
   {t:"เก็บไว้ก่อน ยังไม่เซ็นอะไรทั้งนั้น",fx:()=>{R.c1="hold";},then:[
     {n:"coach",t:"ดีแล้ว ของฟรีไม่มีในโลก ยิ่งของที่มีคนยิ้มให้ตลอดเวลายิ่งไม่ฟรี"}]}]},
 {n:"nar",t:"ซองเขียวทองถูกเก็บไว้ในลิ้นชักห้องทำงาน ข้าง ๆ สัญญาเงินกู้ของเสี่ยหมวกทองฉบับเก่า"}];}
/* v1.90 round 6: the North in full — the first arrival, the Tha Sao shrine at Uttaradit (Kati's story), a richer visit, the letter after the cup and Baibua's chats.
   คำเมือง lines are drafts for Man to check. The other regions follow in rounds 7–9 (same hooks). */
const RG_ARRIVE={
 north:(G,D)=>{const top=rgTopGirl(G),kati=rgIn(G,"kati"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:`รถของค่ายแวะเติมน้ำมันที่ปั๊มสุดท้ายก่อนเข้า${D.name} หมอกยังลอยต่ำอยู่เหนือภูเขา`},
  {n:"nar",t:"หน้าร้านกาแฟมีมอเตอร์ไซค์คันเก่าจอดรออยู่ ผู้หญิงผมชมพูยืนกอดตะกร้าหวายใบใหญ่ไว้แน่น"},
  {n:"baibua",f:"happy",l:"casual",t:"มาฮอดแล้วเจ้า! หนูได้ข่าวว่าค่ายศิริชัยจะขึ้นมาเก็บเข็มขัดภาคเหนือ ก่เลยขี่รถมาดักรอเจ้า"},
  {n:"baibua",f:"happy",l:"casual",t:"ข้าวต้มมัดเจ้า หนูห่อเองตั้งแต่ตีสี่ มีพอหื้อทุกคนเน้อ"},
  {n:"nar",t:"ทุกคนได้ข้าวต้มมัดคนละห่อ มัดตอกเรียบร้อยเหมือนกันหมด ยกเว้นห่อของผู้จัดการที่ผูกตอกเป็นโบเล็ก ๆ",choice:[
    {t:"ถามว่าทำไมห่อนี้มีโบ",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"บ่… บ่มีหยังเจ้า! มือมันผูกไปเองเจ้า… กิ๋นเถอะเจ้า ลำขนาดเลย"}]},
    {t:"ชมว่าห่อนี้สวยกว่าทุกห่อ",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการตาไวแท้เจ้า… ห่อนั้นหนูตั้งใจที่สุดเจ้า"}]},
    {t:"ขอบคุณแล้วนั่งกินเงียบ ๆ",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",f:"happy",l:"casual",t:"ลำบ่เจ้า? …ลำก่ดีแล้วเจ้า"}]}]},
  {n:"baibua",f:"sad",l:"casual",t:"แล้วก่… ขอโทษเรื่องวันงานเปิดตัวเจ้า หนูอู้เสียงเบาไป พิธีกรต้องเอาไมค์มาจ่อปากเลย"},
  ...rgIf(kati,[{n:"kati",with:"baibua",f:"happy",l:"casual",t:"ไม่เป็นไรเลยค่ะพี่ใบบัว! เรื่องศอกนี่คนทั้งห้องได้ยินชัดแจ๋วเลย"},{n:"baibua",f:"flustered",l:"casual",t:"…อันนั้นหนูตั้งใจอู้ดังเจ้า"}]),
  {n:"baibua",f:"happy",l:"casual",t:`แชมป์ประจำ${D.name}คนนี้หนูเคยชกด้วยเจ้า เปิ้นออกตัวไว ยกแรกระวังหน่อยเน้อ พอยกสามเปิ้นจะเริ่มหมดแรงเจ้า`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จดคำแนะนำของใบบัวไว้ในมือถือ · กำลังใจ +3`:"ทุกคนจดคำแนะนำของใบบัวไว้"},
  ...(top&&top.id!=="kati"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ใบบัว")}]:[]),
  {n:"coach",t:"ข้าวต้มมัดอร่อยกว่าร้านหน้าค่ายอีก… อย่าไปบอกป้าแต๋วนะ"},
  {n:"nar",t:"ใบบัวโบกมือส่งรถออกจากปั๊ม แล้วขี่มอเตอร์ไซค์ตามมาห่าง ๆ จนถึงสนามมวย"}];}};
/* a scene on the first night of a particular trip */
const RG_TRIPX={
 uttaradit:{bg:"tasao_shrine",steps:G=>{const kati=rgIn(G,"kati");return [
  {n:"nar",t:"ก่อนกลับที่พัก ใบบัวพาทั้งค่ายแวะศาลครูมวยท่าเสา ศาลไม้เก่าใต้ต้นโพธิ์ มีนวมเก่าคู่หนึ่งแขวนอยู่ข้างหิ้ง"},
  {n:"baibua",f:"happy",l:"casual",t:"ตรงนี้เป็นบ้านเกิดของมวยท่าเสาเจ้า พ่อหนูพามากราบครูทุกปี ก่อนพ่อจะเจ็บเข่า"},
  ...(kati?[
   {n:"nar",t:"กะทิยืนนิ่งอยู่หน้าศาลนานกว่าทุกคน แล้วค่อย ๆ ถอยออกมานั่งที่ขั้นบันได"},
   {n:"kati",f:"sad",l:"casual",t:"…หนูไม่แน่ใจว่าหนูมีสิทธิ์กราบตรงนี้ไหมคะ"},
   {n:"kati",f:"sad",l:"casual",t:"ท่าเสาของหนูเป็นครูพักลักจำค่ะ ปู่ชัยแอบดูครูท่าเสาชกตามงานวัด จำมาแล้วสอนหนู ไม่เคยมีใครครอบครูให้ปู่เลยสักครั้ง"},
   {n:"kati",f:"sad",l:"casual",t:"พี่ใบบัวเป็นท่าเสาสายตรง ตั้งแต่พ่อ ตั้งแต่ปู่ของพี่… ส่วนหนู หนูแค่ลอกท่าเขามา",choice:[
     {t:"\"ปู่ชัยดูจนจำได้ทุกท่า นั่นก็คือรักมวยท่าเสาแล้ว\"",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"sad",l:"casual",t:"…ปู่จำได้ทุกท่าจริง ๆ ค่ะ ตอนเด็ก ๆ หนูเห็นปู่รำท่าเสาคนเดียวหลังค่ายทุกเย็น"}]},
     {t:"\"ลองถามพี่ใบบัวดูสิ\"",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"ถามหนูได้เลยเจ้า"}]}]},
   {n:"baibua",with:"kati",f:"sad",l:"casual",t:"กะทิ… รู้บ่ หนูอิจฉากะทิเน้อ"},
   {n:"kati",f:"surprised",l:"casual",t:"อิจฉาหนูเหรอคะ?!"},
   {n:"baibua",f:"sad",l:"casual",t:"หนูได้ท่ามาจากพ่อก่จริง แต่ทุกวันนี้หนูแบกค่ายคนเดียว ซ้อมคนเดียว กิ๋นข้าวกับพ่อสองคน… บ่มีใผช่วยเลยเจ้า"},
   {n:"baibua",f:"happy",l:"casual",t:"กะทิมีครูแดง มีผู้จัดการ มีเพื่อนทั้งค่ายคอยดู ท่าเสาของกะทิบ่ได้มาจากครูคนเดียว มันมาจากคนทั้งค่ายเจ้า"},
   {n:"baibua",f:"happy",l:"casual",t:"มวยบ่ได้อยู่ในสายเลือดหรอกเจ้า มันอยู่ในคนที่ยังชกมันอยู่… มากราบครูด้วยกันเน้อ"},
   {n:"nar",t:"กะทิกับใบบัวคุกเข่าลงหน้าศาลพร้อมกัน กราบสามครั้ง ลมพัดนวมเก่าข้างหิ้งแกว่งเบา ๆ"},
   {n:"kati",with:"baibua",f:"happy",l:"casual",t:"…พี่ใบบัวคะ ปีหน้ามากราบครูด้วยกันอีกนะคะ"},
   {n:"baibua",f:"happy",l:"casual",t:"สัญญาเจ้า"},
   {fx:G2=>{add(G2,"kati","bond",2);const k=G2.F.kati;if(k)k.morale=Math.min(100,(k.morale||0)+5);rgMeet(G2,"baibua",2);G2.flags.tasaoShrine=1;}},
   {n:"nar",t:"กะทิ กำลังใจ +5 · กะทิกับใบบัวสนิทกันขึ้น"}]
  :[{n:"baibua",f:"sad",l:"casual",t:"ปีนี้หนูมาคนเดียวเจ้า… ขอบคุณที่มาเป็นเพื่อนเน้อ"},
   {n:"nar",t:"ผู้จัดการพนมมือไหว้ศาลครูตามใบบัว ลมพัดนวมเก่าข้างหิ้งแกว่งเบา ๆ",fx:G2=>rgMeet(G2,"baibua",1)},
   {fx:G2=>rgMeet(G2,"baibua",1)}])];}}};
/* the week after the cup: her answer to Vector, in a letter */
const RG_POST={
 north:"เรียน ผู้จัดการค่ายศิริชัยเจ้า\n\nหนูตอบเวกเตอร์ไปแล้วเจ้า ว่าค่ายบัวท่าเสาบ่ขาย\n\nพ่อถามว่าเอาความกล้ามาจากไหน หนูตอบว่า \"ค่ายเล็กก็ยืนได้ ดูค่ายศิริชัยสิเจ้า\" พ่อหัวเราะครั้งแรกในรอบสองปีเลยเจ้า\n\nถ้วยอยู่กับค่ายศิริชัยแล้ว แต่ใจของมวยท่าเสายังอยู่ที่เชียงใหม่เน้อ ว่าง ๆ ขึ้นมาแอ่วหาหนูกับพ่อเจ้า\n\n— ใบบัว"};
/* champion chats: open after her first visit to the camp (or the cup); a reply moves her bond a little and counts as contact */
const RG_CHAT={
 baibua:[
  {id:"bb_mist",x:[
   ["เช้านี้หมอกลงหนาขนาดเลยเจ้า ผู้จัดการตื่นแล้วก่",[["ตื่นแล้ว กำลังจะไปดูเด็ก ๆ ซ้อม",1,"ขยันแท้เจ้า หนูก่กำลังจะไปซ้อมเหมือนกันเจ้า"],["ยังเลย นี่พิมพ์ทั้งที่หลับตาอยู่",2,"ฮิ ๆ หลับตาก็พิมพ์ถูกทุกตัวเลยเจ้า เก่งแท้"],["หมอกแบบนี้ขับรถระวังด้วยนะ",2,"…หนูจะระวังเจ้า ขอบคุณที่เป็นห่วงเน้อ"]]],
   ["พ่อให้หนูถามว่า ค่ายศิริชัยเปิดมากี่ปีแล้วเจ้า",[["ตั้งแต่รุ่นปู่ชัย เกือบห้าสิบปีแล้ว",1,"โอ้ พ่อบอกว่าเก่ากว่าค่ายบัวท่าเสาอีกเจ้า"],["เดี๋ยวพาไปดูรูปเก่าในค่ายนะ",2,"จริงก่เจ้า! หนูจะรอเน้อ"],["ถามทำไมเหรอ",0,"บ่มีหยังเจ้า พ่อแค่อยากรู้"]]],
   ["หนูต้องไปซ้อมแล้วเจ้า… คุยกันแค่นี้ก่อนเน้อ",[["ไปเถอะ ซ้อมเสร็จค่อยคุยต่อ",2,"เจ้า! ซ้อมเสร็จหนูทักไปเลยเน้อ"],["อย่าหักโหมนะ",1,"เจ้า หนูจะยืดเส้นก่อนทุกครั้ง"],["โอเค",0,"เจ้า"]]]]},
  {id:"bb_dad",x:[
   ["วันนี้พ่อลุกเดินรอบค่ายได้สองรอบเจ้า! หมอบอกว่าเข่าดีขึ้นแล้ว",[["ดีใจด้วยนะ!",1,"ขอบคุณเจ้า หนูดีใจจนน้ำตาไหลเลย"],["ฝากบอกพ่อว่าทั้งค่ายศิริชัยเชียร์อยู่",2,"หนูบอกแล้วเจ้า พ่อยิ้มแล้วบอกว่าค่ายนั้นใจ๋ดีแท้"],["อย่าให้พ่อหักโหมนะ",1,"เจ้า หนูคอยเดินตามอยู่ข้าง ๆ ตลอดเลย"]]],
   ["พ่ออยากหื้อหนูกลับไปเรียนต่อ บ่อยากหื้อชกมวยแล้ว… ผู้จัดการคิดว่าจะได",[["ถามใจตัวเองก่อนว่าอยากทำอะไร",2,"…ใจหนูอยากชกเจ้า หนูรู้อยู่แล้ว แค่อยากได้ยินคนพูด"],["เรียนไปด้วยชกไปด้วยก็ได้นะ",1,"ทำได้แท้ก่เจ้า… หนูจะลองคิดดูเน้อ"],["พ่อพูดถูกนะ",0,"…เจ้า หนูจะลองคิดดู"]]],
   ["ขอบคุณที่ฟังเน้อเจ้า หนูบ่ค่อยมีใผหื้อเล่าเรื่องนี้",[["เล่าได้ทุกเรื่องเลย",2,"…หนูจะเล่าบ่อย ๆ เลยเน้อ ห้ามรำคาญ"],["ยินดีเสมอ",1,"เจ้า ขอบคุณเจ้า"],["ไม่เป็นไร",0,"เจ้า"]]]]},
  {id:"bb_food",x:[
   ["หนูทำแกงฮังเลหม้อใหญ่เจ้า กิ๋นกับพ่อสองคนบ่หมด",[["ส่งมาค่ายบ้างสิ",2,"ได้เจ้า! เดี๋ยวหนูส่งไปรษณีย์… แกงส่งไปรษณีย์ได้ก่เจ้า"],["น่ากินจัง",1,"ลำขนาดเลยเจ้า สูตรแม่หนูเน้อ"],["แช่ตู้เย็นไว้สิ",0,"เจ้า หนูก่ว่าจะแช่ไว้"]]],
   ["ผู้จัดการชอบกิ๋นอะหยังที่สุดเจ้า",[["ข้าวต้มมัดของใบบัว",2,"…ผู้จัดการพูดแบบนี้ หนูจะห่อหื้อทุกอาทิตย์เลยเจ้า"],["ข้าวมันไก่หน้าตลาด",1,"ร้านที่กะทิชอบใช่ก่เจ้า หนูจะไปลองบ้าง"],["อะไรก็ได้",0,"กิ๋นได้ทุกอย่างก่ดีเจ้า"]]],
   ["คราวหน้าขึ้นมาเชียงใหม่ หนูจะพาไปกิ๋นข้าวซอยร้านลับเน้อ",[["สัญญานะ",2,"สัญญาเจ้า! ร้านนี้หนูบ่เคยพาใผไปเลย"],["พาทั้งค่ายไปเลย",1,"ได้เจ้า แต่ร้านเปิ้นมีโต๊ะแค่สองตัวเจ้า ฮิ ๆ"],["ถ้าว่างนะ",0,"เจ้า ถ้าว่างเน้อ"]]]]},
  {id:"bb_elbow",x:[
   ["วันนี้หนูซ้อมศอกบัวบานกลับหลังร้อยรอบเจ้า แขนจะหลุดแล้ว",[["เก่งมาก แต่พักบ้างนะ",2,"เจ้า… มีคนบอกหื้อพัก หนูก่จะพักเจ้า"],["สอนกะทิบ้างได้ไหม",1,"ได้เจ้า! แต่กะทิต้องสอนท่าของกะทิหื้อหนูด้วยเน้อ"],["ร้อยรอบน้อยไปนะ",0,"…ผู้จัดการโหดกว่าครูหนูอีกเจ้า"]]],
   ["ผู้จัดการรู้บ่ ศอกท่านี้พ่อคิดขึ้นตอนเห็นดอกบัวบานในสระวัด",[["สวยแบบมวยท่าเสาเลย",2,"เจ้า… มวยของพ่อสวยแต๊ ๆ หนูอยากหื้อคนทั้งประเทศได้เห็น"],["ดอกบัวมีหนามด้วยเหรอ",1,"บ่มีเจ้า! คนอื่นเปิ้นเรียกหนูเอง หนูบ่ได้ตั้ง ฮิ ๆ"],["ดอกบัวก็ดี",0,"เจ้า"]]],
   ["ถ้าวันหนึ่งหนูเจอกะทิบนเวที ผู้จัดการจะเชียร์ใผเจ้า",[["เชียร์ใบบัวแบบเงียบ ๆ",2,"…ห้ามบอกกะทิเน้อเจ้า หนูก่จะเชียร์ผู้จัดการเงียบ ๆ เหมือนกัน"],["เชียร์ทั้งคู่",1,"ตอบเก่งแท้เจ้า… หนูก่จะเชียร์กะทิเหมือนกันเน้อ"],["เชียร์กะทิสิ",0,"ฮิ ๆ ก่ถูกแล้วเจ้า"]]]]},
  {id:"bb_vector",x:[
   ["เวกเตอร์ส่งจดหมายมาอีกแล้วเจ้า ขึ้นราคาค่ายหื้ออีกสองแสน",[["อย่าเพิ่งตัดสินใจคนเดียวนะ",2,"…เจ้า หนูจะปรึกษาผู้จัดการก่อนทุกครั้งเลยเน้อ"],["ค่ายบัวท่าเสาไม่ได้มีไว้ขาย",2,"พ่อก่พูดแบบนี้เลยเจ้า… หนูดีใจที่ได้ยินอีกคน"],["สองแสนก็เยอะนะ",0,"…เจ้า หนูรู้เจ้า"]]],
   ["บางทีหนูก่คิดว่า ถ้าขายค่าย พ่อจะได้รักษาเข่าที่โรงพยาบาลดี ๆ",[["มีทางอื่นอีกหลายทาง เดี๋ยวช่วยหา",2,"…ผู้จัดการช่วยหนูคิดแท้ ๆ ก่เจ้า ขอบคุณเจ้า"],["เข้าใจเลยว่าลำบาก",1,"เจ้า… ขอบคุณที่เข้าใจเน้อ"],["ก็เป็นทางหนึ่ง",0,"เจ้า"]]],
   ["คุยกับผู้จัดการแล้วใจเบาขึ้นเจ้า… บ่รู้เป็นจะได",[["เพราะไม่ได้แบกคนเดียวแล้วไง",2,"…เจ้า หนูบ่ได้แบกคนเดียวแล้วเน้อ"],["ทักมาได้ทุกเมื่อ",1,"เจ้า! หนูจะทักบ่อย ๆ"],["ดีแล้ว",0,"เจ้า"]]]]}]};
if(typeof CHAT!=="undefined")for(const k in RG_CHAT)CHAT[k]=RG_CHAT[k];
const REGION={
  /* end of week (after the weekly events): the gala the week after the invitation, the contract beat the week after the first cup */
  weekScene(G,done){const R=G.region;if(!R){done();return;}const now=gameWeek(G);
    if(!R.gala){if(R.galaAbs==null)R.galaAbs=now+1;if(now>=R.galaAbs){R.gala=1;AU.startMusic&&AU.startMusic("hub");playScene(rgGala(G),()=>{save();done();},{bg:"gala",look:"casual"});return;}}
    const r=(R.cups||[])[0],c=r&&R.champ[r];
    if(r&&!R.c1&&c&&now>=(c.wonAbs||0)+1){R.c1="seen";playScene(rgCup1(G,r),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    done();},
  /* ---------- state helpers ---------- */
  base(G){return ((G.season||1)-1)*52;},
  beltCount(G,r){const b=(G.region.belts||{})[r]||{};return RG[r].prov.filter(p=>b[p]).length;},
  beltTotal(G){return RG_ORDER.reduce((s,r)=>s+this.beltCount(G,r),0);},
  /* the first week the whole camp is free to travel: after the rest week, nobody else booked, not past week 50 */
  tripWeek(G){const R=G.region,from=Math.max(G.week+1,(R.nextTripAbs||0)-this.base(G));
    for(let w=from;w<=RG_LAST_WK;w++){if(!G.bookings.some(b=>b.week===w&&G.F[b.a]&&G.F[b.a].camp==="player")&&!this.nearSeries(G,this.base(G)+w))return w;}return null;},
  /* a championship bout is booked within a week of this one (the camp needs its rest week either side) */
  nearSeries(G,abs,skip){return RG_ORDER.some(r=>{const c=G.region.champ[r];return r!==skip&&c&&c.next&&Math.abs(c.next.abs-abs)<=1;});},
  riders(G,wk){return roster(G).filter(f=>!f.injury&&!G.bookings.some(b=>b.week===wk&&(b.a===f.id||b.b===f.id)));},

  /* ---------- booking a belt trip ---------- */
  makeOpp(G,dest,me,abs){const r=ROAD_DEST[dest].r,id=`rg_${dest}_${abs}`;if(G.F[id])return id;
    /* a little under your fighter at the first belt, a little over by the sixteenth; the regional style (tilt) is part of that budget, not on top of it */
    const n=this.beltTotal(G),target=Math.min(20,ovr(me.a)-.7+n*.06),rng=mulberry32((G.seed||1)+stableHash(id)),tilt=RG[r].tilt;
    const f=baseFighter(id,mkNPC(id,RG_OPP[dest]||"แชมป์ประจำจังหวัด","X",Math.round(target-1),rng,RG_ORDER.indexOf(r)+2));
    for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);
    liftOpponent(f,target,20);
    for(let i=0;i<60&&ovr(f.a)>target+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.15);f.camp="quest";f.div="X";f.rg=dest;f.sprite="rgp_"+dest;/* v1.89.14: high-level sheet dyed in the province colour */f.color=RG[r].col;f.lvl=me.lvl||1;f.fatigue=0;f.morale=70;
    G.F[id]=f;syncFighterAges(G);return id;},
  purse(G){const n=this.beltTotal(G),w=Math.round((10000+n*800)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  book(G,dest,fid){const R=G.region,D=ROAD_DEST[dest],me=G.F[fid];if(!R||!D||!me)return {ok:false,why:"ข้อมูลไม่ครบ"};
    if(R.trip)return {ok:false,why:"มีทริปที่นัดไว้แล้ว"};if((R.belts[D.r]||{})[dest])return {ok:false,why:"ได้เข็มขัดจังหวัดนี้แล้ว"};
    const wk=this.tripWeek(G);if(!wk)return {ok:false,why:"ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว"};
    if(!this.riders(G,wk).some(f=>f.id===fid))return {ok:false,why:`${me.name}ไม่พร้อมเดินทาง`};
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs);if(G.cash<P.total)return {ok:false,why:"เงินไม่พอค่าเดินทาง"};
    const opp=this.makeOpp(G,dest,me,abs),pay=this.purse(G),bid=`rg${abs}_${dest}`;
    G.bookings.push({id:bid,a:fid,b:opp,week:wk,tier:"region",rounds:3,win:pay.win,lose:pay.lose,region:{r:D.r,dest},bg:dest==="chanthaburi"?"bg_region_east.webp":`bg_ring_${dest}.webp`});
    G.cash-=P.total;G.offers=(G.offers||[]).filter(o=>o.week!==wk);
    R.trip={abs,season:G.season||1,wk,dest,fid,opp,bid,cost:P.total,car:P.car,fat:P.fat};
    G.log=G.log||[];G.log.push(`วางแผนเดินทางไป${D.name} สัปดาห์ ${wk} · ค่าเดินทาง ${fmt(P.total)}`);return {ok:true,wk,cost:P.total};},
  cancel(G){const R=G.region,T=R&&R.trip;if(!T)return false;G.bookings=G.bookings.filter(b=>b.id!==T.bid);G.cash+=T.cost;
    (R.gc=R.gc||[]).push(T.opp);R.trip=null;return true;},

  /* ---------- results + weekly upkeep ---------- */
  flush(G){const R=G.region;if(!R||!R.pend||!R.pend.length)return;const done=R.pend.splice(0);
    for(const p of done){const rg=p.region||{},r=rg.r,dest=rg.dest,D=ROAD_DEST[dest];if(!D||!RG[r])continue;
      if(rg.series){this.seriesResult(G,r,p);continue;}
      rgTouch(G,RG_CID[r]);const T=R.trip,abs=T&&T.bid===p.bid?T.abs:gameWeek(G);
      if(p.res==="W"){R.belts[r]=R.belts[r]||{};R.belts[r][dest]=1;G.log=G.log||[];G.log.push(`${G.F[p.a]?G.F[p.a].name:""}คว้าเข็มขัดจังหวัด${D.name}!`);
        if(this.beltCount(G,r)===4&&R.champ[r].state==="locked"){R.champ[r].state="letter";this.champFighter(G,r);
          addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`${RG_TITLE[r]}: ครบสี่เข็มขัดแล้ว`,body:RG_CH[r].letter});}}
      R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+2);(R.gc=R.gc||[]).push(p.b);}},
  /* weekly: post-cup letters and champion chats */
  letters(G){const R=G.region,now=gameWeek(G);R.postDone=R.postDone||{};
    for(const r of RG_ORDER){if(R.post&&R.post[r]!=null&&now>=R.post[r]&&!R.postDone[r]&&RG_POST[r]){R.postDone[r]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`จดหมายจาก${RG[r].champ}`,body:RG_POST[r]});}
      const cid=RG_CID[r],c=R.champ[r]||{},open=RG_CHAT[cid]&&G.F[cid]&&(c.visit==="done"||c.state==="won");G.chatIn=G.chatIn||{};
      if(open&&!G.chatIn[cid]&&now-((G.chatLastAbs||{})[cid]??-999)>=2&&mulberry32((G.seed||1)+now*31+cid.length)()<.45)G.chatIn[cid]=G.week;}},
  fade(G){const R=G.region,now=gameWeek(G),m=R.meet||{};R.meetT=R.meetT||{};R.miss=R.miss||{};
    for(const r of RG_ORDER){const cid=RG_CID[r];if(!(m[cid]>0))continue;if(R.meetT[cid]==null){R.meetT[cid]=now;continue;}if(R.joined&&R.joined[cid])continue;
      const gap=now-R.meetT[cid];
      if(gap>=3&&!R.miss[cid]){R.miss[cid]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`จดหมายจาก${RG[r].champ}`,body:RG_MISS[r]});}
      if(gap>=4){const pk=(R.meetPk||{})[cid]||m[cid],fl=RG_FLOOR.find(t=>pk>=t)||0;if(m[cid]>fl)m[cid]=Math.max(fl,Math.round((m[cid]-.25)*100)/100);}}},
  weekly(G){const R=G.region;this.flush(G);this.seriesWeekly(G);this.fade(G);this.letters(G);const T=R.trip;
    /* a trip whose bout vanished (the week went by, the booking was dropped) is let go */
    if(T&&gameWeek(G)>T.abs&&!G.bookings.some(b=>b.id===T.bid)){(R.gc=R.gc||[]).push(T.opp);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,T.abs+2);}
    const keep=new Set(G.bookings.map(b=>b.b));R.gc=(R.gc||[]).filter(id=>{if(keep.has(id))return true;if(G.F[id]&&G.F[id].rg)delete G.F[id];return false;});},

  /* ---------- the trip week: drive → bout → hotel → home (round 2) ---------- */
  champId:{north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"},
  hotelBg:{north:"night_north",isan:"night_isan",central:"night_central",south:"night_south"},
  trip(b,done){if(b.region&&b.region.series){this.seriesTrip(b,done);return;}
    const R=G.region,T=R&&R.trip&&R.trip.bid===b.id?{...R.trip}:null,dest=b.region&&b.region.dest;
    if(!T||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const P=roadPlan(G,dest,T.car||null,T.abs);
    ROAD.open(dest,{paid:true,plan:P,onArrive:(P2,front)=>{this.arrive(G,T,P2||P,front);const go=()=>openFight(b,()=>this.night(T,P2||P,1,done)),A=this.firstArrive(G,ROAD_DEST[dest].r,dest);
      if(A){playScene(A,go,{bg:"gas_station",look:"casual"});}else go();}});},
  /* the first trip into a region: its champion comes to meet the camp on the way in */
  firstArrive(G,r,dest){const R=G.region;R.arrived=R.arrived||{};if(R.arrived[r]||!RG_ARRIVE[r])return null;R.arrived[r]=1;rgTouch(G,RG_CID[r]);return RG_ARRIVE[r](G,ROAD_DEST[dest]);},
  /* road fatigue for everyone on board (the fighter only half: the corner keeps her off her feet) · the shotgun seat is a small moment */
  arrive(G,T,P,front){const fat=P.fat||0;for(const f of roadRiders(G)){const k=f.id===T.fid?.5:1;f.fatigue=Math.min(100,(f.fatigue||0)+Math.round(fat*k));}
    if(front&&G.F[front]){add(G,front,"bond",1);G.F[front].morale=Math.min(100,(G.F[front].morale||0)+2);}
    G.log=G.log||[];G.log.push(`ทั้งค่ายเดินทางถึง${ROAD_DEST[T.dest].name} · ความล้า +${fat}`);},
  /* night n of the trip. Far trips stay over (1–2 nights); a day trip may stay one extra night if you pay for the rooms */
  night(T,P,n,done){const D=ROAD_DEST[T.dest],r=D.r,nights=P.nights||0;
    /* after the cup: the champion's private night takes the place of the first hotel night (even on a day trip) */
    if(T.cupNight&&n===1){playScene(RG_CH[r].night(G,T),()=>{T.cupNight=0;this.night(T,P,2,done);},{bg:RG_CH[r].nightBg,look:"casual"});return;}
    {const X=RG_TRIPX[T.dest],tx=G.region.tx=G.region.tx||{};if(n===1&&X&&!tx[T.dest]&&!T.series){tx[T.dest]=1;rgTouch(G,RG_CID[r]);playScene(X.steps(G,T),()=>this.night(T,P,n,done),{bg:X.bg,look:"casual"});return;}}
    if(n>nights){if(nights===0&&n===1&&!T.extra&&!T.series){const rooms=Math.ceil((P.people||roadRiders(G).length)/2),cost=rooms*ROAD_ROOM;
        playScene([{n:"nar",t:`ไฟต์ที่${D.name}จบแล้ว ทุกคนยืนรออยู่ข้างรถ`,choice:[
          {t:"กลับค่ายเลย",then:[{n:"nar",t:"รถเลี้ยวออกจากเมือง ทุกคนหลับกันตั้งแต่ยังไม่พ้นเขตจังหวัด"}]},
          {t:`อยู่เที่ยวต่ออีก 1 คืน (ค่าห้อง ${fmt(cost)})`,fx:G2=>{if(G2.cash<cost){T.extraNo=1;return;}G2.cash-=cost;T.extra=1;}}]}],
          ()=>{if(T.extra)this.night(T,{...P,nights:1},1,done);else{if(T.extraNo)toast("เงินไม่พอค่าห้อง กลับค่ายกันก่อน");this.home(T,done);}},{bg:this.hotelBg[r],look:"casual"});return;}
      return this.home(T,done);}
    const cid=this.champId[r],C=RG[r],girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b)=>(b.bond||0)-(a.bond||0)).slice(0,3);
    const top=girls[0],jeal=top&&(top.bond||0)>=40?top:null;
    const choice=[{t:`ไปเดินเล่นกับ${C.champ} (แชมป์${C.name})`,fx:G2=>{rgMeet(G2,cid,3);if(jeal)jeal.morale=Math.max(0,(jeal.morale||0)-3);},
        then:[...this.dateLines(cid,D),...(jeal?[{n:jeal.id,f:"pout",l:"casual",t:this.jealLine(jeal.id,C.champ)}]:[])]},
      ...girls.map(g=>({t:`พา${g.name}ไปเที่ยว${D.name}`,fx:G2=>{add(G2,g.id,"bond",2);g.morale=Math.min(100,(g.morale||0)+4);},then:[{n:g.id,f:"happy",l:"casual",t:this.girlLine(g.id,D.name)}]})),
      {t:"พักผ่อนให้หายล้า",fx:G2=>{for(const f of roadRiders(G2))f.fatigue=Math.max(0,(f.fatigue||0)-10);},then:[{n:"nar",t:"ทุกคนเข้านอนแต่หัวค่ำ เช้ามาร่างกายสดชื่นขึ้น · ความล้า −10"}]},
      {t:"ซ้อมเบา ๆ ที่ลานจอดรถโรงแรม",fx:G2=>{for(const f of roadRiders(G2)){f.exp=(f.exp||0)+6;f.fatigue=Math.min(100,(f.fatigue||0)+2);}},then:[{n:"nar",t:"เตะเป้าใต้ไฟลานจอดรถจนยามโรงแรมมาดู · ประสบการณ์ +6"}]}];
    playScene([{n:"nar",t:nights>1?`คืนที่ ${n} ที่${D.name}`:`คืนนี้ทั้งค่ายพักที่${D.name}`},{n:"nar",t:"คืนนี้ทำอะไรดี?",choice}],()=>this.night(T,P,n+1,done),{bg:this.hotelBg[r],look:"casual"});},
  home(T,done){G.log=G.log||[];G.log.push(`กลับถึงค่ายจาก${ROAD_DEST[T.dest].name}`);save();done();},
  dateLines(cid,D){const L={
    baibua:[{n:"npc",who:"ใบบัว",t:`ถนนคนเดินคืนนี้คนเยอะเจ้า… ถ้าหลงกัน จับแขนเสื้อหนูไว้ก็ได้เจ้า`},{n:"nar",t:"ใบบัวเดินช้า ๆ ให้ผู้จัดการเดินทัน มือเกือบชนกันหลายครั้ง แต่ไม่มีใครพูดอะไร"}],
    tabtim:[{n:"npc",who:"ทับทิม",t:"ไปกินส้มตำกันเด้อ! ร้านนี้แซบหลาย… ฮ่า ๆ ๆ เผ็ดจนน้ำตาไหลแล้วอ้าย"},{n:"nar",t:"ทับทิมหัวเราะเสียงดังทั้งร้าน แต่พอผู้จัดการยื่นทิชชูให้ เธอเงียบไปครู่หนึ่ง"}],
    alicia:[{n:"npc",who:"อลิเซีย",t:"อย่าเข้าใจผิดนะ ฉันแค่อยากมีคนเดินเป็นเพื่อน คืนนี้กล้องปิดแล้ว…"},{n:"nar",t:"อลิเซียคว่ำโทรศัพท์ไว้บนโต๊ะทั้งคืน ไม่ได้หยิบขึ้นมาเลยสักครั้ง"}],
    chaba:[{n:"npc",who:"ชบา",t:"…ทะเลตอนกลางคืนสวย"},{n:"nar",t:"ชบาไม่พูดอะไรอีก แต่ยืนอยู่ข้าง ๆ จนน้ำขึ้นถึงข้อเท้า"}]};
    return L[cid]||[{n:"nar",t:`เดินเล่นยามค่ำที่${D.name}`}];},
  jealLine(id,champ){const L={kati:`ครูไปเดินกับ${champ}มาเหรอคะ… เปล่าค่ะ หนูไม่ได้ถาม`,mali:`มะลิเห็นนะ~ ไปกับ${champ}มาใช่ไหม… มะลิก็อยากไปบ้าง`,
    rin:`ไปกับ${champ}สองชั่วโมงสิบสองนาที รินไม่ได้จับเวลานะ แค่บังเอิญดูนาฬิกา`,ploy:`ไปกับ${champ}มาเหรอ ก็ดีนี่ …ทำไมต้องถามด้วย`,fah:`อ๋อ ไปกับ${champ}มาล่ะสิ! ฟ้าไม่ได้งอนนะ! แค่…หิว!`};return L[id]||"…";},
  girlLine(id,city){const L={kati:`ตลาดคืนนี้ของ${city}มีขนมเยอะจัง… ซื้อให้หนูชิ้นนึงได้ไหมคะ แค่ชิ้นเดียวจริง ๆ`,mali:`${city}ตอนกลางคืนสวยจัง~ ขอบคุณที่พามะลิมานะ จะจำไว้เลย`,
    rin:`รินจดร้านอร่อยของ${city}ไว้สามร้าน ไปร้านแรกก่อนนะคะ เหลือเวลาพอดี`,ploy:`ไม่ได้ขอให้พามานะ …แต่ก็ ขอบใจ`,fah:`${city}มีของกินแปลก ๆ เพียบ! ฟ้าจะลองให้หมดเลย ผู้จัดการจ่ายนะ!`};return L[id]||`คืนนี้ที่${city}สนุกดี`;},

  /* ---------- the championship series: 3 bouts, first to 2 wins (round 3) ---------- */
  /* the champion as a fighter: her own sheet, special move and perk; sized against your fighter before every bout */
  champFighter(G,r,me){const C=RG[r],H=RG_CH[r],id=this.champId[r];let f=G.F[id];
    if(!f){const rng=mulberry32((G.seed||1)+stableHash(id));f=baseFighter(id,mkNPC(id,C.champ,"X",14,rng,RG_ORDER.indexOf(r)+2));
      Object.assign(f,{name:C.champ,nick:C.nick,color:C.col,canon:true,camp:"region",div:"X",fatigue:0,injury:0,morale:75});G.F[id]=f;syncFighterAges(G);}
    f.pfx=H.perk.fx;f.canon=true;f.camp="region";
    if(me){const cups=(G.region.cups||[]).length,c=G.region.champ[r],target=Math.min(20.5,ovr(me.a)-.45+cups*.1-Math.min(2,c.tries||0)*.15),tilt=C.tilt;
      for(const k in f.a)f.a[k]=Math.max(1,Math.min(20,target-.6));for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);
      liftOpponent(f,target,20);for(let i=0;i<80&&ovr(f.a)>target+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.12);
      f.lvl=Math.max(me.lvl||1,1)+1;f.fatigue=0;f.injury=0;f.morale=75;}
    return f;},
  seriesPurse(G){const cups=(G.region.cups||[]).length,w=Math.round((30000+cups*6000)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  /* the first week from `from` that suits a championship bout: weeks 1–50, the camp home and rested, no other trip next to it */
  spot(G,r,from){const c=G.region.champ[r],T=G.region.trip;
    for(let abs=Math.max(from,gameWeek(G)+1),i=0;i<80;abs++,i++){const season=Math.floor((abs-1)/52)+1,wk=abs-(season-1)*52;if(wk<2||wk>RG_LAST_WK)continue;
      if(T&&Math.abs(T.abs-abs)<=1)continue;if(this.nearSeries(G,abs,r))continue;
      if(season===(G.season||1)&&G.bookings.some(b=>b.week===wk&&G.F[b.a]&&G.F[b.a].camp==="player"))continue;
      return {abs,season,wk};}return null;},
  schedule(G,r,from){const c=G.region.champ[r],s=this.spot(G,r,from);if(!s){c.next=null;return null;}
    c.next={...s,bid:`rgc_${r}_${s.abs}`,n:(c.n||0)+1};this.ensureBooking(G,r);return c.next;},
  ensureBooking(G,r){const c=G.region.champ[r],x=c.next;if(!x||x.season!==(G.season||1)||x.wk<G.week||G.bookings.some(b=>b.id===x.bid))return;
    const me=G.F[c.fid];if(!me||me.camp!=="player")return;const cid=this.champId[r];this.champFighter(G,r,me);const pay=this.seriesPurse(G);
    G.bookings.push({id:x.bid,a:c.fid,b:cid,week:x.wk,tier:"region",rounds:5,win:pay.win,lose:pay.lose,region:{r,dest:RG[r].fin,series:x.n},bg:`bg_region_${RG_CH[r].ring}.webp`});
    G.offers=(G.offers||[]).filter(o=>o.week!==x.wk);},
  /* the letter came: pick the fighter who carries the whole series */
  startSeries(G,r,fid){const c=G.region.champ[r],me=G.F[fid];if(!c||c.state!=="letter"||!me||me.camp!=="player")return {ok:false,why:"เลือกนักมวยไม่ได้"};
    Object.assign(c,{state:"series",fid,w:0,l:0,n:0,next:null});this.champFighter(G,r,me);
    const s=this.schedule(G,r,gameWeek(G)+1);if(!s){c.state="letter";c.fid=null;return {ok:false,why:"ปีนี้ไม่มีสัปดาห์ว่างพอสำหรับศึกแชมป์แล้ว"};}
    G.log=G.log||[];G.log.push(`${RG_TITLE[r]}: ${me.name} vs ${RG[r].champ} · นัดที่ 1 สัปดาห์ ${s.wk}${s.season!==(G.season||1)?` (ปีหน้า)`:""}`);
    return {ok:true,s};},
  seriesResult(G,r,p){const R=G.region,c=R.champ[r];if(!c||c.state!=="series")return;rgTouch(G,RG_CID[r]);const abs=c.next?c.next.abs:gameWeek(G),me=G.F[c.fid];
    c.n=(c.n||0)+1;if(p.res==="W")c.w++;else if(p.res==="L")c.l++;c.next=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+2);G.log=G.log||[];
    if(c.w>=2){c.state="won";c.wonAbs=abs;(R.post=R.post||{})[r]=abs+1;R.cups=R.cups||[];if(!R.cups.includes(r))R.cups.push(r);G.cash+=RG_CUP_PRIZE;G.rep+=4;
      if(me){G.honors=G.honors||[];const key=`${G.season||1}:rg_${r}:${me.div}::${me.id}`;if(!G.honors.some(h=>h.key===key))G.honors.push({key,season:G.season||1,week:G.week,id:me.id,div:me.div,kind:"rg_"+r});}
      rgMeet(G,this.champId[r],4);R.just={r,kind:"cup",res:p.res,w:c.w,l:c.l};
      G.log.push(`${HONOR_LABEL["rg_"+r]}: ${me?me.name:""} ${c.w}-${c.l} ${RG[r].champ} · เงินรางวัล ${fmt(RG_CUP_PRIZE)}`);return;}
    if(c.l>=2){c.state="lost";c.tries=(c.tries||0)+1;c.letterAbs=abs+4;R.just={r,kind:"lost",res:p.res,w:c.w,l:c.l};
      G.log.push(`${RG_TITLE[r]}: ${RG[r].champ} ป้องกันแชมป์ไว้ได้ ${c.l}-${c.w}`);return;}
    R.just={r,kind:"bout",res:p.res,w:c.w,l:c.l,n:c.n};const s=this.schedule(G,r,abs+4);
    /* between bout 1 and bout 2 the champion drops by the camp (round 4) — missed if bout 2 comes first */
    if(c.n===1&&!c.visit){c.visit="due";addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`${RG[r].champ}จะแวะมาที่ค่าย`,body:`${RG[r].champ}ฝากข่าวมาว่าจะแวะมาเยี่ยมค่ายก่อนนัดที่ 2\n\nไปต้อนรับได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค`});}
    else if(c.n>=2&&c.visit==="due")c.visit="missed";
    G.log.push(`${RG_TITLE[r]} นัดที่ ${c.n}: ${p.res==="W"?"ชนะ":p.res==="L"?"แพ้":"เสมอ"} · สกอร์ ${c.w}-${c.l}${s?` · นัดต่อไปสัปดาห์ ${s.wk}`:""}`);},
  /* weekly: a hurt fighter gets the bout moved, a dropped bout is rescheduled, a lost series sends a new letter later */
  seriesWeekly(G){const R=G.region,now=gameWeek(G);
    for(const r of RG_ORDER){const c=R.champ[r];if(!c)continue;
      if(c.state==="lost"&&now>=(c.letterAbs||0)){c.state="letter";c.fid=null;c.w=0;c.l=0;c.n=0;
        addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`${RG_TITLE[r]}: คำท้าครั้งใหม่`,body:RG_CH[r].again});continue;}
      if(c.state!=="series")continue;const me=G.F[c.fid];
      if(!me||me.camp!=="player"){G.bookings=G.bookings.filter(b=>!(c.next&&b.id===c.next.bid));Object.assign(c,{state:"letter",fid:null,w:0,l:0,n:0,next:null});continue;}
      const x=c.next;
      if(!x){this.schedule(G,r,now+1);continue;}
      const booked=G.bookings.find(b=>b.id===x.bid),pend=(R.pend||[]).some(p=>p.bid===x.bid);
      if(x.abs<now&&!booked&&!pend){this.postpone(G,r,now+2,"ไฟต์ไม่ได้ชกตามนัด");continue;}
      if(x.abs===now&&me.injury>0){G.bookings=G.bookings.filter(b=>b.id!==x.bid);this.postpone(G,r,now+me.injury+1,`${me.name}ยังเจ็บอยู่`);continue;}
      this.ensureBooking(G,r);}},
  postpone(G,r,from,why){const c=G.region.champ[r];c.next=null;const s=this.schedule(G,r,from);
    addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`เลื่อนนัด: ${RG_TITLE[r]}`,
      body:`${why} · ผู้จัดเลื่อนนัดที่ ${(c.n||0)+1}${s?` ไปเป็นสัปดาห์ ${s.wk}${s.season!==(G.season||1)?` (ปีหน้า)`:""}`:""}\n\n${RG_CH[r].wait}`});},
  /* the championship trip: drive (paid by the sponsor) → the champion before the bell → the bout → cup or hotel → home */
  seriesTrip(b,done){const r=b.region.r,c=G.region.champ[r],dest=RG[r].fin;
    if(!c||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const abs=c.next?c.next.abs:gameWeek(G),P=roadPlan(G,dest,null,abs),T={abs,dest,fid:b.a,series:1,bid:b.id};G.region.just=null;
    ROAD.open(dest,{paid:true,sponsor:true,plan:P,onArrive:(P2,front)=>{const PP=P2||P;this.arrive(G,T,PP,front);
      playScene(this.preBout(r,b),()=>openFight2(b,()=>this.afterBout(T,PP,done)),{bg:"rg_"+RG_CH[r].ring,look:"fight"});}});},
  preBout(r,b){const c=G.region.champ[r],H=RG_CH[r],cid=this.champId[r],me=G.F[b.a],n=b.region.series,sc=`${c.w}-${c.l}`;
    const head={n:"nar",t:`${H.venue} · ${RG_TITLE[r]} นัดที่ ${n}${n>1?` · สกอร์ ${me.name} ${sc} ${RG[r].champ}`:""}`};
    const line=n===1?H.pre[0]:c.w===1&&c.l===1?H.pre[2]:H.pre[1];
    const mine=CANON_IDS.includes(me.id)?[{n:me.id,f:"angry",l:"fight",with:cid,t:me.id===H.pair?H.pairLine:H.reply}]:[{n:"nar",t:`${me.name}พยักหน้ารับ แล้วเดินกลับมุมแดง`}];
    return [head,{n:cid,f:n===1?"happy":"angry",l:"fight",t:line(me.name)},...mine];},
  afterBout(T,P,done){const R=G.region,J=R.just;R.just=null;const r=ROAD_DEST[T.dest].r,H=RG_CH[r],cid=this.champId[r];
    if(!J){this.home(T,done);return;}
    if(J.kind==="cup"){AU.startMusic&&AU.startMusic("victory");AU.sfx&&AU.sfx("champ");
      playScene(H.cup(G,J),()=>{T.cupNight=1;this.night(T,P,1,done);},{bg:"rg_"+H.ring,look:"fight"});return;}
    const steps=J.kind==="lost"?H.lost(G,J):[{n:cid,f:J.res==="W"?"sad":"happy",l:"fight",t:(J.res==="W"?H.lose:H.win)[Math.min(2,(J.n||1)-1)]},
      {n:"nar",t:`สกอร์ตอนนี้ ${J.w}-${J.l} · นัดต่อไปอีกราว 4 สัปดาห์`}];
    playScene(steps,()=>this.night(T,P,1,done),{bg:"rg_"+H.ring,look:"fight"});},
  /* the series fighter picker (modal) */
  seriesHTML(r){const C=RG[r],H=RG_CH[r],c=G.region.champ[r],R=roster(G).filter(f=>!f.injury);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const pay=this.seriesPurse(G);
    return `<h2>${esc(RG_TITLE[r])}</h2><p class="meta">${esc(C.champ)} · ${esc(C.nick)} · เวที ${esc(ROAD_DEST[C.fin].name)}</p>
     <div class="kv-row"><span>รูปแบบ</span><b>3 นัด ชนะ 2 · นัดละ 5 ยก · ห่างกันราว 4 สัปดาห์</b></div>
     <div class="kv-row"><span>จุดเด่นของ${esc(C.champ)}</span><b>${esc(H.perk.name)}</b></div><p class="meta">${esc(H.perk.desc)}</p>
     <div class="kv-row"><span>ค่าตัวต่อนัด</span><b class="num">${fmt(pay.win)} / แพ้ ${fmt(pay.lose)}</b></div><div class="kv-row"><span>ได้ถ้วย</span><b class="num">${fmt(RG_CUP_PRIZE)}</b></div>
     <h3>ใครขึ้นชกทั้งซีรีส์</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgsfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">ไม่มีนักมวยที่พร้อมชก</p>`}
     <p class="meta">เลือกแล้วเปลี่ยนตัวไม่ได้จนจบซีรีส์ · บาดเจ็บ = เลื่อนนัด · ผู้จัดออกค่าเดินทางให้ทุกนัด${c.tries?` · ครั้งที่ ${c.tries+1}`:""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">ไว้ก่อน</button><button class="btn primary" data-act="rgsgo" data-v="${r}" ${UI.rgFid?"":"disabled"}>รับคำท้า</button></div>`;},
  finRow(r){const C=RG[r],c=G.region.champ[r]||{},n=this.beltCount(G,r),F=ROAD_DEST[C.fin],me=G.F[c.fid];
    const st=c.state==="won"?`<span class="rg-belt">🏆 ได้ถ้วย</span>`:n<4?`<span class="meta">🔒 ครบ 4 เข็มขัดก่อน (${n}/4)</span>`
      :c.state==="letter"?`<button class="btn sm gold" data-act="rgser" data-v="${r}">เลือกนักมวยชิงแชมป์</button>`
      :c.state==="series"?`<span class="meta">${me?esc(me.name):""} ${c.w}-${c.l}${c.next?` · นัด ${c.next.n} สัปดาห์ ${c.next.wk}${c.next.season!==(G.season||1)?` (ปีหน้า)`:""}`:""}</span>${c.visit==="due"?`<button class="btn sm gold" data-act="rgvisit" data-v="${r}">ต้อนรับ${esc(C.champ)}ที่ค่าย</button>`:c.visit==="done"?`<button class="btn sm" data-act="rgduel" data-v="${r}">ดวลซ้อม</button>`:""}`
      :c.state==="lost"?`<span class="meta">${esc(C.champ)}ป้องกันแชมป์ไว้ได้ · รอจดหมายท้าครั้งใหม่</span>`:`<span class="meta">✉️ รอจดหมายนัดจากแชมป์</span>`;
    const chat=G.chatIn&&G.chatIn[RG_CID[r]]&&G.F[RG_CID[r]]?`<button class="btn sm gold" data-act="rgchat" data-v="${RG_CID[r]}">💬 ${esc(C.champ)}ทักแชตมา</button>`:"";
    const R=G.region,cid=RG_CID[r],gap=(R.meet||{})[cid]>0&&(R.meetT||{})[cid]!=null?gameWeek(G)-R.meetT[cid]:0;
    return `<div class="rg-prov rg-fin"><span><b>${esc(F.name)}</b> <small>เวทีชิงแชมป์ภาค</small>${gap>=3?`<small class="rg-miss">💭 ${gap} สัปดาห์แล้วที่ไม่ได้เจอ${esc(C.champ)}</small>`:""}</span>${chat}${st}</div>`;},

  /* ---------- screens ---------- */
  css(){if(typeof document==="undefined"||document.getElementById("rg-css"))return;const st=document.createElement("style");st.id="rg-css";
    st.textContent=`.rg-head{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between}.rg-head h3{margin:0}
.rg-stats{display:flex;gap:.4rem;flex-wrap:wrap}.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem}
.rg-reg{border-top:6px solid var(--rc);position:relative}.rg-reg h3{margin:.1rem 0 0}.rg-reg h3::first-letter{text-transform:uppercase}.rg-champ{font-size:.85rem;opacity:.85;margin-bottom:.5rem}
.rg-prov{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px dashed rgba(0,0,0,.15)}
.rg-prov:last-child{border-bottom:0}.rg-prov small{opacity:.7}.rg-fin{opacity:.9}.rg-miss{display:block;color:#d4688f;opacity:1!important}.rg-belt{color:#b8860b;font-weight:700}
.rg-trip{border-left:6px solid var(--gold,#d9a21b)}.rg-pick{display:flex;flex-wrap:wrap;gap:.4rem;margin:.4rem 0}
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
    return `<p class="meta">ราคาน้ำมันสัปดาห์นี้ <b class="rg-fuel ${b}">฿${p.toFixed(2)}/ลิตร · ${b==="cheap"?"ถูก":b==="high"?"แพง":"ปกติ"}</b> · ${esc(roadFuelHint(G))}</p>`;},
  html(){this.css();
    if(!G.region){const t=(G.honors||[]).filter(h=>h.kind==="province").length;
      return `<section class="px card"><h3>ศึกชิงเจ้าสี่ภาค</h3><p>ทัวร์นาเมนต์ระดับภาคจะส่งจดหมายเชิญมา เมื่อจบปีที่ 5 และค่ายได้แชมป์จังหวัดครบ 3 ครั้ง</p>
       <div class="kv-row"><span>ปีที่</span><b>${G.season||1} / 6</b></div><div class="kv-row"><span>แชมป์จังหวัด</span><b>${t} / 3</b></div>
       ${!REGION_LIVE?`<div class="mfoot"><button class="btn gold" data-act="rgdevstart">เปิดบทเลย (โหมดทดสอบ)</button></div>`:""}</section>`;}
    const R=G.region,T=R.trip,cups=(R.cups||[]).length,belts=this.beltTotal(G),nx=T?null:this.tripWeek(G);
    const tripCard=T?`<section class="px card rg-trip"><h3>ทริปที่นัดไว้</h3><div class="kv-row"><span>${esc(ROAD_DEST[T.dest].name)} · ${esc(RG[ROAD_DEST[T.dest].r].name)}</span><b>สัปดาห์ ${T.wk}</b></div>
       <div class="kv-row"><span>นักมวย</span><b>${G.F[T.fid]?esc(G.F[T.fid].name):"-"}</b></div><div class="kv-row"><span>คู่ชก</span><b>${G.F[T.opp]?esc(G.F[T.opp].name):"-"}</b></div>
       <div class="kv-row"><span>ค่าเดินทาง (จ่ายแล้ว)</span><b class="num">${fmt(T.cost)}</b></div>
       <p class="meta">สัปดาห์นั้นทั้งค่ายไปด้วยกัน จึงไม่รับไฟต์อื่น</p><div class="mfoot"><button class="btn" data-act="rgcancel">ยกเลิกทริป (คืนเงิน)</button></div></section>`:"";
    const regs=RG_ORDER.map(r=>{const C=RG[r],b=R.belts[r]||{},n=this.beltCount(G,r),ch=R.champ[r]||{},F=ROAD_DEST[C.fin];
      const rows=C.prov.map(p=>{const D=ROAD_DEST[p],got=b[p],nights=roadNights(D.km);
        return `<div class="rg-prov"><span><b>${esc(D.name)}</b> <small>${D.km} กม. · ${nights?`ค้าง ${nights} คืน`:"ไปกลับวันเดียว"}</small></span>${got?`<span class="rg-belt">🏅 ได้เข็มขัด</span>`:`<button class="btn sm${T||!nx?"":" primary"}" data-act="rgplan" data-v="${p}" ${T||!nx?"disabled":""}>วางแผน</button>`}</div>`;}).join("");
      const fin=this.finRow(r);
      return `<section class="px card rg-reg" style="--rc:${C.col}"><h3>${esc(C.name)}</h3><div class="rg-champ">แชมป์ภาค: <b>${esc(C.champ)}</b> · ${esc(C.nick)}</div>${rows}${fin}</section>`;}).join("");
    return `<section class="px card rg-head"><div><h3>ศึกชิงเจ้าสี่ภาค</h3><span class="meta">ครั้งที่ ${R.edition||1}</span></div>
       <div class="rg-stats"><span class="pill gold">ถ้วย ${cups}/4</span><span class="pill">เข็มขัด ${belts}/16</span><span class="pill ${T?"red":nx?"green":""}">${T?`ทริป: ${esc(ROAD_DEST[T.dest].name)} · สัปดาห์ ${T.wk}`:nx?`เดินทางได้สัปดาห์ ${nx}`:"ปีนี้เดินทางไม่ได้แล้ว"}</span></div></section>
     ${!R.gala?`<p class="meta rg-gala">🎉 งานเปิดตัวศึกชิงเจ้าสี่ภาคที่กรุงเทพฯ ${R.galaAbs!=null&&gameWeek(G)<R.galaAbs?"จัดปลายสัปดาห์หน้า":"จัดปลายสัปดาห์นี้"} · ทั้งค่ายได้รับเชิญ</p>`:""}${!REGION_LIVE?`<p class="meta">โหมดทดสอบ: <button class="btn sm" data-act="rggala" data-v="gala">ดูงานเปิดตัว</button>${(R.cups||[]).length?` <button class="btn sm" data-act="rggala" data-v="c1">ดูฉากซองเขียว</button>`:""}</p>`:""}
     ${tripCard}${this.fuelLine(G)}<div class="rg-grid">${regs}</div>`;},
  planHTML(dest){const D=ROAD_DEST[dest],C=RG[D.r],wk=this.tripWeek(G);if(!wk)return `<h2>${esc(D.name)}</h2><p>ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว</p>`;
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs),R=this.riders(G,wk);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const me=UI.rgFid&&G.F[UI.rgFid],poor=G.cash<P.total,line=(k,v)=>v?`<div class="kv-row"><span>${k}</span><b class="num">${fmt(v)}</b></div>`:"";
    return `<h2>${esc(D.name)} <small class="meta">· ${esc(C.name)}</small></h2>
     <p class="meta">เดินทางสัปดาห์ <b>${wk}</b> · ${D.km} กม. · ${P.nights?`ค้าง ${P.nights} คืน`:"ไปกลับวันเดียว"} · คู่ชก: <b>${esc(RG_OPP[dest]||"แชมป์ประจำจังหวัด")}</b> แชมป์ประจำจังหวัด</p>
     <h3>ใครขึ้นชก</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">ไม่มีนักมวยที่พร้อมเดินทางสัปดาห์นี้</p>`}
     <h3>ค่าเดินทาง ไป-กลับ</h3><div class="rg-bill"><div class="kv-row"><span>รถ</span><b>${esc(roadCarName(P.car))}</b></div>
      ${line(`น้ำมัน ${Math.round(P.litres)} ลิตร × ฿${P.price.toFixed(2)}`,P.fuel)}${line("ทางด่วน",P.toll)}${line(`ตั๋วรถทัวร์ × ${P.onBus}`,P.bus)}${line(`ที่พัก ${P.nights} คืน`,P.lodge)}${line(`ค่ากิน × ${P.people}`,P.food)}
      <div class="kv-row"><span><b>รวม</b></span><b class="num ${poor?"redt":"goldt"}">${fmt(P.total)}</b></div></div>
     <p class="meta">ทั้งค่าย ${P.people} คนไปด้วยกัน สัปดาห์นั้นไม่รับไฟต์อื่น · ความล้าระหว่างทางราว +${P.fat} ต่อคน${P.car==="none"?" · ยังไม่มีรถประจำค่าย ต้องนั่งรถทัวร์ (แพงและล้ากว่า)":""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">ไว้ก่อน</button><button class="btn primary" data-act="rggo" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"เงินไม่พอ":"ยืนยันการเดินทาง"}</button></div>`;}
};

if(typeof XMODAL!=="undefined"){XMODAL.rgplan=m=>({body:REGION.planHTML(m.dest),foot:false});XMODAL.rgser=m=>({body:REGION.seriesHTML(m.r),foot:false});}
if(typeof ACT!=="undefined")Object.assign(ACT,{
  rgplan:d=>{UI.rgFid=null;UI.modal={type:"rgplan",dest:d.v};render();},
  rgfid:d=>{UI.rgFid=d.v;render();},
  rggo:d=>{const r=REGION.book(G,d.v,UI.rgFid);if(!r.ok){toast(r.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`นัดเดินทางสัปดาห์ ${r.wk} แล้ว · จ่ายค่าเดินทาง ${fmt(r.cost)}`);save();render();},
  rgvisit:d=>{const r=d.v,c=G.region.champ[r],cid=REGION.champId[r];if(!c||c.visit!=="due")return;
    playScene(RG_VISIT[r](G),()=>DUEL.open(r,false,res=>{if(!res){render();return;}c.visit="done";const T=DUEL_TALK[r];
      playScene([{n:cid,f:res.w>=2?"flustered":"happy",l:"casual",t:res.w>=2?T.win:T.lose},{n:"nar",t:`${RG[r].champ}กลับไปตอนค่ำ · นัดที่ 2 เจอกันที่เวทีภาค`}],()=>{const g=typeof cardCheck==="function"?cardCheck(G):[];if(g.length){G.cardPend=(G.cardPend||[]).concat(g);UI.modal={type:"cardnew"};}save();render();},{bg:"camp",look:"casual"});}),{bg:"camp",look:"casual"});},
  rgduel:d=>{DUEL.open(d.v,true,()=>render());},
  rgser:d=>{UI.rgFid=null;UI.modal={type:"rgser",r:d.v};render();},
  rgsfid:d=>{UI.rgFid=d.v;render();},
  rgsgo:d=>{const x=REGION.startSeries(G,d.v,UI.rgFid);if(!x.ok){toast(x.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`รับคำท้าแล้ว · นัดที่ 1 สัปดาห์ ${x.s.wk}${x.s.season!==(G.season||1)?" ปีหน้า":""}`);save();render();},
  rgcancel:()=>{if(REGION.cancel(G)){toast("ยกเลิกทริปแล้ว ได้เงินค่าเดินทางคืน");save();render();}},
  rgdevstart:()=>{if(REGION_LIVE)return;regionStart(G);save();render();},
  rgchat:d=>{const f=G.F[d.v];if(!f)return;f.met=true;rgTouch(G,d.v);chatOpen(d.v);},
  rggala:d=>{if(REGION_LIVE)return;const R=G.region;if(d.v==="c1"){const r=R.cups[0];playScene(rgCup1(G,r),()=>{R.c1=R.c1||"seen";save();render();},{bg:"camp",look:"casual"});return;}
    playScene(rgGala(G),()=>{R.gala=1;save();render();},{bg:"gala",look:"casual"});}});
if(typeof G!=="undefined"&&G&&G.region)REGION.flush(G);
