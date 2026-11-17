# v1.89 skill roots — every school line splits into 2 roots after its Lv.22 master move,
# every build path (สายปั้น) splits into 2 roots after its Lv.10 move.
# Same standard for everyone: 5 nodes per root =
#   1 active · 2 passive (own line) · 3 active · 4 passive that FEEDS another line · 5 legendary active
# Root A feeds the next line (line+1), root B feeds the one after (line+2), so every line gets help from both others.
# node: (name_th, name_en, flavour_th, flavour_en, [stat reqs], {fx per rank})
SCHOOL_LV=[26,30,34,38,42]
BUILD_LV=[16,20,26,32,38]

R={}
R["kati"]=[
 # 0 สายแข้ง
 [("แข้งพายุ","Storm Shin","แข้งหนัก ปิดเกมไว","heavy shins, quick finishes",[
   ("แข้งฟาดฟ้า","Sky-Splitting Shin","เตะกลางลำตัวเต็มสะโพก","full-hip body kick",["kick","power"],{"dmg":{"kick":.14},"pts":{"kick":.06}}),
   ("หน้าแข้งหินผา","Rock Shins","","",["kick"],{"dmg":{"kick":.03},"staSave":.01}),
   ("เตะเปิดฟ้าสามดอก","Three-Kick Opener","เตะซ้ำที่เดิมสามครั้ง","three kicks to one spot",["kick","speed"],{"hit":{"kick":.04},"dmg":{"kick":.12}}),
   ("แข้งส่งศอก","Shins Open for Elbows","","",["kick","elbow"],{"dmg":{"elbow":.03},"hit":{"punch":.01}}),
   ("พระพายกวาดสังเวียน","Wind God Sweeps the Ring","แข้งที่ทั้งค่ายรอดู","the kick the whole camp waits for",["kick","power"],{"dmg":{"kick":.2},"hit":{"kick":.05},"pts":{"kick":.08}})]),
  ("แข้งเชิงครู","Teacher's Kicks","เตะแม่น เก็บแต้ม","clean kicks, steady points",[
   ("เตะตัดจังหวะ","Rhythm-Cutting Kick","เตะดักก่อนคู่ชกออกอาวุธ","kick before the opponent fires",["kick","foot"],{"hit":{"kick":.04},"pts":{"kick":.1}}),
   ("ตาไวเห็นช่อง","Eye for Openings","","",["kick"],{"hit":{"kick":.015},"prep":.004}),
   ("เตะสลับเท้าท่าเสา","Tha Sao Switch Kick","สลับเท้าแล้วเตะอีกข้าง","switch stance, kick the other side",["kick","iq"],{"pts":{"kick":.12},"evade":.015}),
   ("ระยะแข้งคุมเกม","Shin-Length Control","","",["kick","guard"],{"evade":.01,"clDef":.3}),
   ("ครูเสาสอนเตะ","Master Sao's Lesson","ทุกดอกตามตำราครู","every kick by the book",["kick","iq"],{"hit":{"kick":.05},"pts":{"kick":.12},"ctr":.03})])],
 # 1 สายหมัดศอก
 [("ศอกกลับหัก","Breaking Elbows","ศอกหนักระยะประชิด","heavy elbows up close",[
   ("ศอกกลับคู่ท่าเสา","Tha Sao Double Back Elbow","หมุนศอกกลับสองข้าง","spin back with both elbows",["elbow","power"],{"dmg":{"elbow":.14},"hit":{"elbow":.02}}),
   ("ข้อศอกเหล็ก","Iron Elbows","","",["elbow"],{"dmg":{"elbow":.03},"clDef":.2}),
   ("ศอกตัดเหนือคิ้ว","Brow-Cutting Elbow","ศอกเฉียงเหนือคิ้ว","slicing elbow above the brow",["elbow","clinch"],{"dmg":{"elbow":.12},"pts":{"elbow":.1}}),
   ("วงในใจถึง","Brave in the Clinch","","",["elbow","guard"],{"clDef":.4,"clutch":.01}),
   ("ไอยราหักศอก","Elephant Breaks the Elbow","ศอกที่จบไฟต์ได้","an elbow that ends fights",["elbow","punch"],{"dmg":{"elbow":.2,"punch":.08},"hit":{"elbow":.04}})]),
  ("หมัดเร็วท่าเสา","Tha Sao Fast Hands","หมัดไว เก็บแต้มรัว","fast hands, quick points",[
   ("หมัดหน้าสายฟ้า","Lightning Jab","หมัดนำไวกว่าที่ตาเห็น","a jab faster than the eye",["punch","speed"],{"hit":{"punch":.04},"pts":{"punch":.1}}),
   ("มือไวตาไว","Quick Hands, Quick Eyes","","",["punch"],{"hit":{"punch":.015},"ctr":.01}),
   ("หมัดชุดห้าดอก","Five-Punch Combo","ชุดยาวไม่ให้ตั้งตัว","a long combo with no time to reset",["punch","stamina"],{"dmg":{"punch":.1},"pts":{"punch":.1},"staSave":.02}),
   ("หมัดเปิดทางแข้ง","Hands Open for Kicks","","",["punch","kick"],{"hit":{"kick":.015},"pts":{"kick":.04}}),
   ("หมัดฟ้าผ่าท่าเสา","Tha Sao Thunder Fist","หมัดเดียวที่ทั้งสนามได้ยิน","one punch the whole arena hears",["punch","power"],{"dmg":{"punch":.18},"hit":{"punch":.04},"pts":{"punch":.08}})])],
 # 2 สายการ์ดและใจ
 [("ใจไม่ถอย","Heart That Won't Retreat","ยิ่งเจ็บยิ่งสู้","the more it hurts, the harder she fights",[
   ("ยืนสู้กลางพายุ","Standing in the Storm","ไม่ถอยแม้เลือดเหลือน้อย","no step back, even on low health",["dur","comp"],{"clutch":.04,"regen":.1}),
   ("ใจศิริชัย","Sirichai Spirit","","",["comp"],{"mor":.01,"clutch":.01}),
   ("ล้มแล้วลุกท่าเสา","Tha Sao Rises Again","ลุกขึ้นมาแรงกว่าเดิม","gets up stronger than before",["stamina","dur"],{"regen":.15,"clutch":.03,"staSave":.02}),
   ("ใจหนุนแข้ง","Heart Behind the Shins","","",["comp","kick"],{"dmg":{"kick":.03}}),
   ("ใจเกินร้อยห้าสิบ","150% Heart","ยกสุดท้ายแรงกว่ายกแรก","the last round hits harder than the first",["comp","stamina"],{"clutch":.06,"regen":.15,"mor":.02})]),
  ("การ์ดเหล็กสวนไว","Iron Guard, Quick Return","รับให้อยู่ แล้วคืนทันที","take it, give it right back",[
   ("ปัดแล้วสวน","Parry and Return","ปัดหมัดแล้วสวนทันที","parry, then counter at once",["guard","counter"],{"ctr":.04,"evade":.015}),
   ("การ์ดไม่ตก","Guard Never Drops","","",["guard"],{"evade":.008,"clDef":.2}),
   ("รับแข้งแล้วศอก","Block the Kick, Answer with Elbow","รับเตะแล้วเข้าศอก","check the kick, step in with an elbow",["guard","elbow"],{"ctr":.03,"ctrDmg":.12,"clDef":.4}),
   ("การ์ดส่งหมัด","Guard Feeds the Hands","","",["guard","punch"],{"ctrDmg":.05,"hit":{"punch":.01}}),
   ("กำแพงสวนฟ้า","Wall That Strikes Back","ทุกดอกที่รับ คืนเป็นสองเท่า","every blow taken comes back double",["guard","iq"],{"evade":.03,"ctr":.05,"ctrDmg":.15})])]]
R["mali"]=[
 [("ศอกเหินฟ้า","Soaring Elbows","กระโดดศอกจากระยะไกล","jumping elbows from range",[
   ("กระโดดศอกฟ้าแลบ","Lightning Leap Elbow","กระโดดเข้าพร้อมศอก","leap in with an elbow",["elbow","speed"],{"dmg":{"elbow":.14},"hit":{"elbow":.02}}),
   ("สปริงขาไชยา","Chaiya Spring Legs","","",["elbow"],{"dmg":{"knee":.02,"elbow":.02}}),
   ("ศอกกลับกลางอากาศ","Mid-Air Back Elbow","หมุนศอกกลับตอนลอยตัว","spin back elbow while airborne",["elbow","foot"],{"dmg":{"elbow":.12},"pts":{"elbow":.1}}),
   ("เหินแล้วเตะ","Soar, Then Kick","","",["elbow","kick"],{"hit":{"kick":.015},"dmg":{"kick":.02}}),
   ("ครุฑพ่าห์ศอก","Garuda Elbow","ศอกที่ตัวเล็กแต่หนักที่สุด","the smallest girl's heaviest elbow",["elbow","knee"],{"dmg":{"elbow":.2,"knee":.1},"hit":{"elbow":.03}})]),
  ("ศอกเข่าวงใน","Clinch Elbow and Knee","จับคอ ตีเข่า ปิดด้วยศอก","grab, knee, finish with elbow",[
   ("จับคอตีเข่าไชยา","Chaiya Clinch Knee","ล็อกคอแล้วตีเข่าตรง","lock the neck, straight knee",["knee","clinch"],{"dmg":{"knee":.14},"clDef":.3}),
   ("คอแข็งไชยา","Chaiya Strong Neck","","",["clinch"],{"clDef":.3,"hit":{"knee":.01}}),
   ("เข่าโทนศอกตาม","Knee Then Elbow","เข่าเปิดแล้วศอกตาม","knee opens, elbow follows",["knee","elbow"],{"dmg":{"knee":.1,"elbow":.08},"pts":{"knee":.08}}),
   ("วงในปิดประตู","Clinch Shuts the Gate","","",["clinch","guard"],{"clDef":.3,"evade":.008}),
   ("หักคอเอราวัณคู่","Twin Erawan Neck Pull","ดึงคอลงสองจังหวะ","two-beat neck pull",["knee","elbow"],{"dmg":{"knee":.16,"elbow":.12},"hit":{"knee":.03}})])],
 [("ลมเตะไชยา","Chaiya Wind Kicks","เตะเร็ว เตะเบา เตะไม่หยุด","light, fast, endless kicks",[
   ("เตะลมพัดใบไม้","Leaf-in-the-Wind Kick","เตะเบาแต่ไม่พลาด","light kick that never misses",["kick","speed"],{"hit":{"kick":.04},"dmg":{"kick":.1}}),
   ("ก้าวเบาเหมือนลม","Light as Wind","","",["foot"],{"evade":.008,"staSave":.01}),
   ("เตะเปิดดอกมะลิ","Jasmine Opening Kick","เตะเปิดการ์ดให้กรรมการเห็น","a kick the judges can't miss",["kick","foot"],{"pts":{"kick":.12},"hit":{"kick":.03}}),
   ("ลมหลบเข้าป้อง","Wind Into Guard","","",["foot","guard"],{"evade":.012}),
   ("มะลิพายุ","Jasmine Storm","เตะต่อเนื่องจนคู่ชกตามไม่ทัน","kick after kick until they can't follow",["kick","speed"],{"dmg":{"kick":.16},"hit":{"kick":.05},"evade":.02})]),
  ("ร่ายรำไม่เหนื่อย","Dance Without Tiring","เคลื่อนไหวทั้งไฟต์แรงไม่ตก","moving all fight, never fading",[
   ("ย่างสามขุมเร็ว","Quick Three-Step","ก้าวสามขุมเร็วขึ้นเท่าตัว","the three-step, twice as fast",["foot","stamina"],{"regen":.15,"evade":.015}),
   ("ลมหายใจยาวไชยา","Chaiya Long Breath","","",["stamina"],{"regen":.05,"staSave":.01}),
   ("รำแล้วรุก","Dance, Then Attack","ร่ายรำหลอกแล้วรุกเข้า","dance to fool them, then step in",["foot","kick"],{"pts":{"kick":.08},"regen":.1,"mor":.01}),
   ("เบาแรงส่งศอก","Saved Breath for Elbows","","",["stamina","elbow"],{"dmg":{"elbow":.03}}),
   ("นาฏลีลาไชยา","Chaiya Dance of War","มวยที่สวยเหมือนการแสดง","boxing as beautiful as a performance",["foot","stamina"],{"regen":.2,"evade":.025,"staSave":.03})])],
 [("ป้อมไชยา","Chaiya Fortress","ปิดทุกช่อง ไม่เสียแต้ม","close every gap, give nothing away",[
   ("ปิดการ์ดสามชั้น","Three-Layer Guard","การ์ดซ้อนสามชั้น","a guard stacked three deep",["guard","dur"],{"clDef":.6,"evade":.015}),
   ("ยืนหลักไม่สะเทือน","Rooted Stance","","",["guard"],{"clDef":.3,"regen":.03}),
   ("ปัดเข่าออกศอก","Parry the Knee, Answer with Elbow","ปัดเข่าแล้วศอกสวน","parry the knee, elbow back",["guard","elbow"],{"ctr":.03,"ctrDmg":.1,"clDef":.4}),
   ("ป้อมส่งศอก","Fortress Feeds the Elbows","","",["guard","elbow"],{"hit":{"elbow":.015},"ctrDmg":.03}),
   ("สุเมรุไม่สั่น","Unshaken Meru","ภูเขาที่ไม่มีวันขยับ","the mountain that never moves",["guard","dur"],{"clDef":1,"evade":.03,"regen":.1})]),
  ("ยิ้มรับทุกดอก","Smile Through Every Blow","ยิ้มไว้ แล้วสวนกลับ","keep smiling, then hit back",[
   ("ยิ้มแล้วสวน","Smile and Counter","ยิ้มให้คู่ชกแล้วสวน","smile at them, then counter",["comp","counter"],{"ctr":.04,"mor":.01}),
   ("ใจใหญ่กว่าตัว","Heart Bigger Than Her","","",["comp"],{"clutch":.015,"mor":.005}),
   ("ล้มไม่ได้ เพราะยิ้มอยู่","Can't Fall While Smiling","ยังยิ้มได้ก็ยังสู้ได้","still smiling, still fighting",["comp","dur"],{"clutch":.04,"regen":.1}),
   ("ใจเบาเท้าเบา","Light Heart, Light Feet","","",["comp","foot"],{"hit":{"kick":.01},"regen":.03}),
   ("มะลิไม่มีวันเหี่ยว","Jasmine Never Wilts","ยิ่งยกท้ายยิ่งสดใส","brighter every round",["comp","stamina"],{"clutch":.05,"ctr":.04,"mor":.02})])]]
R["rin"]=[
 [("สวนตัดคม","Razor Counters","สวนเร็ว สวนหนัก","fast counters, heavy counters",[
   ("สวนก่อนสาม","Counter Before Three","สวนก่อนคู่ชกนับจังหวะจบ","counter before they finish the count",["counter","speed"],{"ctr":.04,"ctrDmg":.12}),
   ("จังหวะครึ่งวินาที","Half-Second Timing","","",["counter"],{"ctr":.012}),
   ("แทงกริชสองชั้น","Double Kris Thrust","หมัดตรงสวนสองดอกติด","two straight counters back to back",["counter","punch"],{"ctrDmg":.16,"hit":{"punch":.02}}),
   ("สวนแล้วจด","Counter, Then Take Notes","","",["counter","iq"],{"corner":.08,"prep":.003}),
   ("ทฤษฎีบทสวนกลับ","Counter Theorem","พิสูจน์แล้วว่าสวนได้ทุกดอก","proven: every blow can be countered",["counter","iq"],{"ctr":.06,"ctrDmg":.22,"hit":{"punch":.03}})]),
  ("ม่านลวง","Veil of Feints","หลบให้พลาด แล้วสวนที่ช่องว่าง","make them miss, hit the gap",[
   ("เอนหลบหมัดตรง","Lean Away","เอนตัวหลบแล้วสวน","lean out, then counter",["counter","foot"],{"evade":.02,"ctr":.03}),
   ("ไม่เปิดช่อง","No Openings","","",["counter","guard"],{"evade":.008,"clDef":.2}),
   ("ล่อแล้วสวนเข่า","Lure Into the Knee","ล่อให้เข้าแล้วสวนเข่า","draw them in, knee on the way",["counter","knee"],{"ctr":.03,"dmg":{"knee":.1}}),
   ("หลบแล้วถีบ","Slip, Then Teep","","",["counter","kick"],{"hit":{"kick":.015},"pts":{"kick":.03}}),
   ("เงาลพบุรี","Lopburi Shadow","คู่ชกตีได้แค่เงา","they only ever hit the shadow",["counter","speed"],{"evade":.03,"ctr":.05,"ctrDmg":.12})])],
 [("ตำราลับ","Secret Manual","วางแผนก่อนเสียงระฆัง","plan before the bell",[
   ("บทที่หนึ่ง: อ่านคู่ชก","Chapter One: Read Them","อ่านคู่ชกตั้งแต่ยกแรก","read them from round one",["iq","comp"],{"corner":.3,"prep":.01}),
   ("จดทุกยก","Notes Every Round","","",["iq"],{"prep":.004,"corner":.05}),
   ("บทที่สาม: ตัดทางหนี","Chapter Three: Cut the Exits","บีบคู่ชกเข้ามุม","pin them in the corner",["iq","foot"],{"corner":.25,"evade":.015,"ctr":.02}),
   ("คำนวณระยะ","Distance Math","","",["iq","kick"],{"hit":{"kick":.015},"evade":.006}),
   ("ภาคผนวก: ชนะก่อนชก","Appendix: Won Before the Bell","ชนะตั้งแต่ในสมุด","won in the notebook first",["iq","comp"],{"corner":.5,"prep":.018,"ctr":.03})]),
  ("อ่านแล้วเล่น","Read and Play","อ่านเกมแล้วตอบทันที","read the game, answer at once",[
   ("หลอกสองชั้น","Double Feint","หลอกซ้อนหลอก","a feint inside a feint",["iq","counter"],{"ctr":.03,"evade":.015,"corner":.1}),
   ("ตาไม่กะพริบ","Unblinking","","",["iq"],{"ctr":.008,"prep":.002}),
   ("ล่อเข้ากับดัก","Into the Trap","เปิดช่องให้ แล้วปิดกับดัก","leave a gap, spring the trap",["iq","counter"],{"ctrDmg":.14,"ctr":.03}),
   ("อ่านแล้วสวน","Read, Then Counter","","",["iq","counter"],{"ctr":.012,"ctrDmg":.03}),
   ("หมากรุกในสังเวียน","Chess in the Ring","เดินหมากล่วงหน้าห้าตา","five moves ahead",["iq","comp"],{"corner":.35,"ctr":.05,"ctrDmg":.1})])],
 [("ถีบเป็นกำแพง","Teep Wall","ถีบกันระยะ เก็บแต้มสะอาด","teeps hold range, clean points",[
   ("ถีบหน้าตัดทาง","Lane-Cutting Teep","ถีบตัดทางเดินหน้า","teep that stops the advance",["kick","foot"],{"hit":{"kick":.04},"pts":{"kick":.1}}),
   ("ขายาวคุมวง","Long Legs, Wide Ring","","",["kick"],{"evade":.008,"pts":{"kick":.02}}),
   ("ถีบกระโดดลพบุรี","Lopburi Jumping Teep","กระโดดถีบเต็มแรง","full-power jumping teep",["kick","power"],{"dmg":{"kick":.14},"hit":{"kick":.02}}),
   ("ระยะสวนพอดี","Perfect Counter Range","","",["kick","counter"],{"ctr":.01,"ctrDmg":.03}),
   ("ประตูเมืองลพบุรี","Gates of Lopburi","ไม่มีใครผ่านลูกถีบไปได้","no one gets past the teep",["kick","foot"],{"hit":{"kick":.05},"pts":{"kick":.12},"evade":.02})]),
  ("วนรอบนอก","Outer Circle","วนรอบ ไม่ให้ตั้งหลัก","circle, never let them set",[
   ("วนซ้ายหลบหมัด","Circle Left","วนออกจากหมัดหนัก","circle off the power hand",["foot","speed"],{"evade":.025,"staSave":.02}),
   ("ก้าวประหยัด","Economical Steps","","",["foot"],{"staSave":.015}),
   ("วนแล้วเตะกลับ","Circle and Kick Back","วนแล้วเตะสวน","circle out, kick back",["foot","kick"],{"dmg":{"kick":.1},"evade":.015,"ctr":.02}),
   ("ระยะให้เวลาคิด","Distance Buys Thinking Time","","",["foot","iq"],{"corner":.08,"prep":.002}),
   ("วงโคจรลพบุรี","Lopburi Orbit","คู่ชกหมุนตามจนเวียนหัว","they spin chasing her",["foot","speed"],{"evade":.035,"staSave":.03,"hit":{"kick":.03}})])]]
R["ploy"]=[
 [("หมัดเหวี่ยงทลาย","Wrecking Swings","หมัดวงกว้างที่หนักที่สุด","the heaviest wide punches",[
   ("เหวี่ยงควายสามดอก","Triple Buffalo Swing","เหวี่ยงซ้ำสามดอก","three swings in a row",["punch","power"],{"dmg":{"punch":.14},"pts":{"punch":.06}}),
   ("ไหล่โคราช","Korat Shoulders","","",["punch"],{"dmg":{"punch":.03}}),
   ("หมัดเหวี่ยงก้านคอ","Neckline Swing","เหวี่ยงเข้าก้านคอ","a swing to the neckline",["punch","speed"],{"dmg":{"punch":.14},"hit":{"punch":.03}}),
   ("หมัดเปิดคอ","Fists Open the Neck","","",["punch","kick"],{"dmg":{"kick":.025},"hit":{"kick":.01}}),
   ("ควายเผือกถล่มเสา","White Buffalo Topples the Post","หมัดที่ทำให้โคราชลือ","the punch Korat talks about",["punch","power"],{"dmg":{"punch":.22},"hit":{"punch":.03},"pts":{"punch":.06}})]),
  ("หมัดอัจฉริยะ","Genius Hands","หมัดแม่นที่คำนวณมาแล้ว","calculated, accurate punches",[
   ("หมัดเดียวรู้ผล","One Punch Tells","หมัดเดียววัดเกม","one punch to measure the fight",["punch","iq"],{"hit":{"punch":.04},"pts":{"punch":.1}}),
   ("คำนวณหมัด","Punch Calculation","","",["punch"],{"hit":{"punch":.012},"prep":.002}),
   ("สวนหมัดเหวี่ยง","Swing Counter","สวนด้วยหมัดเหวี่ยง","counter with a swing",["punch","counter"],{"ctr":.03,"ctrDmg":.12}),
   ("อ่านจากหมัด","Read Through the Fists","","",["punch","iq"],{"ctr":.01,"corner":.05}),
   ("พรสวรรค์ไร้พ่าย","Unbeaten Gift","หมัดของคนที่ไม่เคยแพ้","the hands of someone who never loses",["punch","iq"],{"hit":{"punch":.05},"dmg":{"punch":.14},"ctr":.03})])],
 [("เตะคอขาด","Neck-Breaker Kicks","เตะสูง เตะหนัก","high kicks, heavy kicks",[
   ("เตะก้านคอสองข้าง","Both-Side Neck Kick","เตะก้านคอซ้ายขวา","neck kicks left and right",["kick","power"],{"dmg":{"kick":.14},"hit":{"kick":.02}}),
   ("แข้งโคราช","Korat Shins","","",["kick"],{"dmg":{"kick":.03}}),
   ("เตะสูงกลับหลัง","Spinning High Kick","หมุนตัวเตะสูง","spin into a high kick",["kick","foot"],{"dmg":{"kick":.12},"pts":{"kick":.1}}),
   ("แข้งกันวง","Shins Guard the Ring","","",["kick","guard"],{"clDef":.3,"evade":.006}),
   ("พยัคฆ์ทองตะปบ","Golden Tiger Pounce","เตะที่ปิดเกมในดอกเดียว","one kick to close it",["kick","power"],{"dmg":{"kick":.2},"hit":{"kick":.04},"pts":{"kick":.08}})]),
  ("ปล้ำคอโคราช","Korat Clinch","ล็อกคอแล้วไม่ปล่อย","lock the neck and never let go",[
   ("ล็อกคอตีเข่าเฉียง","Diagonal Clinch Knee","ล็อกคอตีเข่าเฉียงเข้าซี่โครง","clinch knee to the ribs",["knee","clinch"],{"dmg":{"knee":.14},"clDef":.3}),
   ("แขนเหล็กล็อกคอ","Iron-Arm Lock","","",["clinch"],{"clDef":.3,"hit":{"knee":.01}}),
   ("เข่าโค้งโคราช","Korat Curved Knee","เข่าโค้งเข้าข้างลำตัว","curving knee to the side",["knee","power"],{"dmg":{"knee":.14},"pts":{"knee":.08}}),
   ("ดึงคอส่งหมัด","Pull the Neck, Feed the Fist","","",["clinch","punch"],{"dmg":{"punch":.03}}),
   ("ล็อกคอพยัคฆ์","Tiger Lock","ใครโดนล็อกก็หมดแรง","whoever she locks runs out of air",["knee","clinch"],{"dmg":{"knee":.2},"clDef":.6,"hit":{"knee":.03}})])],
 [("กำแพงสวนหนัก","Wall That Hits Back","รับให้อยู่ แล้วคืนหนัก","take it, return it heavy",[
   ("ปิดสูงสวนเหวี่ยง","High Guard, Swing Back","ปิดการ์ดสูงแล้วเหวี่ยงสวน","high guard, swing counter",["guard","counter"],{"ctr":.04,"ctrDmg":.1}),
   ("การ์ดโคราช","Korat Guard","","",["guard"],{"evade":.008,"clDef":.2}),
   ("รับแล้วคืนสองเท่า","Return It Double","รับดอกหนึ่ง คืนสองดอก","take one, give two",["guard","power"],{"ctrDmg":.18,"ctr":.02}),
   ("สวนด้วยหมัดเหวี่ยง","Counter with a Swing","","",["guard","punch"],{"dmg":{"punch":.02},"ctrDmg":.03}),
   ("กำแพงพยัคฆ์ทอง","Golden Tiger Wall","กำแพงที่กัดกลับ","a wall that bites back",["guard","comp"],{"evade":.03,"ctr":.05,"ctrDmg":.15})]),
  ("แผนพี่สาว","Sister's Plans","แผนไฟต์ที่ไพลินทิ้งไว้","the fight plans Pailin left behind",[
   ("แผนยกแรก","Round One Plan","เปิดเกมตามแผน","open by the plan",["iq","comp"],{"corner":.3,"prep":.01}),
   ("สมุดไพลิน","Pailin's Notebook","","",["iq"],{"corner":.05,"prep":.003}),
   ("แผนยกสุดท้าย","Final Round Plan","แผนสำหรับยกที่เหนื่อยที่สุด","the plan for the hardest round",["iq","stamina"],{"corner":.25,"clutch":.03,"regen":.08}),
   ("แผนเปิดเตะ","Plan to Open the Kicks","","",["iq","kick"],{"hit":{"kick":.015},"pts":{"kick":.03}}),
   ("มรดกพยัคฆ์","Tiger's Legacy","สิ่งที่พี่สาวอยากเห็น","what her sister wanted to see",["iq","comp"],{"corner":.45,"prep":.015,"ctr":.04})])]]
R["fah"]=[
 [("ศอกสายฟ้า","Lightning Elbows","ศอกเร็ว ศอกแรง","fast elbows, hard elbows",[
   ("ศอกฟ้าแลบคู่","Twin Flash Elbows","ศอกซ้ายขวาเร็วจนเห็นแสง","left-right elbows like a flash",["elbow","speed"],{"dmg":{"elbow":.14},"hit":{"elbow":.02}}),
   ("ข้อศอกคม","Sharp Elbows","","",["elbow"],{"dmg":{"elbow":.03}}),
   ("ศอกพุ่งฝ่าการ์ด","Guard-Piercing Elbow","พุ่งศอกทะลุการ์ด","drive the elbow through the guard",["elbow","power"],{"dmg":{"elbow":.14},"pts":{"elbow":.08}}),
   ("ศอกเปิดทางบุก","Elbows Open the Rush","","",["elbow","punch"],{"dmg":{"punch":.025},"staSave":.005}),
   ("ฟ้าฟาดศอก","Sky Strikes Down","ศอกเดียวเหมือนฟ้าผ่า","one elbow like a thunderbolt",["elbow","power"],{"dmg":{"elbow":.22},"hit":{"elbow":.04}})]),
  ("ศอกโชว์","Showtime Elbows","ศอกสวยที่คนดูกรี๊ด","pretty elbows the crowd screams for",[
   ("ศอกหมุนโชว์","Spinning Show Elbow","หมุนศอกให้กล้องจับ","a spin made for the cameras",["elbow","foot"],{"pts":{"elbow":.14},"mor":.01}),
   ("ท่าสวยต้องโชว์","Pretty Moves Get Shown","","",["elbow"],{"pts":{"elbow":.03},"mor":.004}),
   ("ศอกเต้นรำ","Dancing Elbows","ขยับเหมือนเต้นแล้วศอก","dance in, elbow out",["elbow","foot"],{"evade":.015,"dmg":{"elbow":.1},"pts":{"elbow":.06}}),
   ("โชว์แล้วยิ้ม","Show Off, Then Smile","","",["elbow","comp"],{"clutch":.01,"mor":.005}),
   ("เวทีของฟ้า","Fah's Stage","ทั้งสนามเป็นเวทีของเธอ","the whole arena is her stage",["elbow","comp"],{"pts":{"elbow":.16},"dmg":{"elbow":.12},"mor":.02})])],
 [("บุกไม่หยุด","Non-Stop Rush","บุกตั้งแต่ระฆังถึงระฆัง","attack bell to bell",[
   ("หมัดชุดเจ็ดดอก","Seven-Punch Combo","ชุดยาวจนนับไม่ทัน","a combo too long to count",["punch","stamina"],{"pts":{"punch":.1},"dmg":{"punch":.1},"staSave":.02}),
   ("ปอดเหล็ก","Iron Lungs","","",["stamina"],{"staSave":.015,"regen":.03}),
   ("บุกชนมุม","Pin to the Corner","ไล่ต้อนจนติดมุม","chase them into the corner",["punch","power"],{"dmg":{"punch":.16},"hit":{"punch":.02}}),
   ("บุกจนคู่ชกกลัว","Rush Until They Flinch","","",["punch","comp"],{"clutch":.01,"ctr":.006}),
   ("พายุไม่มีวันสงบ","Storm That Never Calms","บุกทั้งไฟต์แรงไม่ตก","the whole fight at full speed",["punch","stamina"],{"dmg":{"punch":.18},"pts":{"punch":.1},"staSave":.04})]),
  ("บ้าบิ่นถึงที่สุด","All the Way Reckless","แลกได้ ไม่ถอยสักก้าว","trade freely, never step back",[
   ("หมัดเสี่ยงตาย","Do-or-Die Punch","ทุ่มหมดตัวในดอกเดียว","everything in one punch",["punch","comp"],{"dmg":{"punch":.18},"clutch":.02}),
   ("เลือดร้อน","Hot Blood","","",["comp"],{"clutch":.012,"dmg":{"punch":.01}}),
   ("แลกหมัดไม่ถอย","Trade and Stay","แลกหมัดกลางวง","trading in the middle of the ring",["punch","dur"],{"dmg":{"punch":.14},"clDef":.3}),
   ("บ้าพอจะศอก","Crazy Enough to Elbow","","",["comp","elbow"],{"dmg":{"elbow":.03}}),
   ("ฟ้าผ่าฟ้า","Lightning Strikes the Sky","หมัดที่ไม่มีใครกล้ารับ","a punch nobody dares to take",["punch","power"],{"dmg":{"punch":.24},"hit":{"punch":.03},"clutch":.03})])],
 [("ยั่วจนพัง","Taunt Until They Break","ยั่วให้พลาด แล้วสวน","bait the mistake, then counter",[
   ("ยิ้มยั่วกลางยก","Mid-Round Smirk","ยิ้มยั่วให้คู่ชกพุ่งเข้ามา","smirk until they charge",["comp","iq"],{"ctr":.04,"evade":.015}),
   ("ยิ้มไม่หุบ","Smile That Won't Quit","","",["comp"],{"mor":.005,"ctr":.006}),
   ("ชี้หน้าแล้วสวน","Point and Counter","ชี้หน้าแล้วสวนตอนพุ่งเข้า","point, then counter the charge",["comp","counter"],{"ctr":.03,"ctrDmg":.14}),
   ("ยั่วให้เข้าระยะศอก","Bait Into Elbow Range","","",["comp","elbow"],{"hit":{"elbow":.015},"ctrDmg":.02}),
   ("ราชินียิ้มเยาะ","Queen of the Smirk","ยิ้มเดียวทำคู่ชกเสียทรง","one smirk wrecks their shape",["comp","counter"],{"ctr":.06,"ctrDmg":.16,"evade":.02})]),
  ("ยิ่งเจ็บยิ่งยิ้ม","Smile Wider When Hurt","ไม่ยอมล้มต่อหน้าคนดู","never falls in front of the crowd",[
   ("ยิ้มทั้งที่เลือดออก","Smiling Through the Cut","ยิ้มสู้ทั้งที่เจ็บ","smiling through the pain",["comp","dur"],{"clutch":.04,"regen":.1}),
   ("ไม่ยอมล้มต่อหน้าแฟนคลับ","Won't Fall Before Her Fans","","",["comp"],{"clutch":.015}),
   ("ลุกขึ้นมาโชว์ต่อ","Back Up for the Show","ลุกขึ้นมาเหมือนไม่เป็นไร","up again like nothing happened",["comp","stamina"],{"regen":.15,"mor":.015}),
   ("ยิ้มแล้วบุก","Smile, Then Rush","","",["comp","punch"],{"staSave":.01,"pts":{"punch":.03}}),
   ("ดาวไม่มีวันดับ","A Star That Never Fades","ยกสุดท้ายสว่างที่สุด","brightest in the last round",["comp","stamina"],{"clutch":.06,"regen":.18,"mor":.02})])]]
# build paths (same for every fighter) — line 3 ปั้นนักน็อก, 4 ปั้นเก็บแต้ม, 5 ปั้นถึกอึด; their 4th node feeds the school lines
B=[
 [("ปิดไว","Quick Finish","จบให้ไวที่สุด","end it as fast as possible",[
   ("ดอกแรกต้องจุก","First Shot Hurts","เปิดด้วยดอกหนัก","open with a heavy shot",["power","punch"],{"dmg":{"punch":.1,"kick":.06}}),
   ("แรงระเบิด","Explosive Power","","",["power"],{"dmg":{"punch":.02,"kick":.02}}),
   ("ชุดปิดจ็อบ","Closing Combo","ชุดปิดที่ผสมทุกอาวุธ","a closer with every weapon",["power","speed"],{"dmg":{"punch":.1,"elbow":.08,"knee":.08}}),
   ("แรงทุกอาวุธ","Power in Every Weapon","","",["power"],{"dmg":{"punch":.015,"kick":.015,"elbow":.015,"knee":.015}}),
   ("น็อกในยกแรก","First-Round Knockout","ไม่ต้องรอยกสอง","no need for round two",["power","speed"],{"dmg":{"punch":.16,"kick":.1},"hit":{"punch":.02}})]),
  ("หนักแต่ทน","Heavy and Sturdy","แลกได้เพราะทนกว่า","trade because she lasts longer",[
   ("แลกแล้วชนะ","Trade and Win","ยอมโดนหนึ่ง เพื่อคืนหนัก","take one to give a heavy one",["power","dur"],{"dmg":{"punch":.08},"clDef":.4}),
   ("กระดูกหนา","Thick Bones","","",["dur"],{"clDef":.2,"clutch":.008}),
   ("เข่าศอกถล่ม","Knee-Elbow Barrage","เข่าศอกในวงใน","knees and elbows in the clinch",["power","clinch"],{"dmg":{"knee":.12,"elbow":.12}}),
   ("แม่นทุกอาวุธ","Accuracy in Every Weapon","","",["power"],{"hit":{"punch":.008,"kick":.008,"elbow":.008,"knee":.008}}),
   ("รถถังนักน็อก","Knockout Tank","เดินหน้าแล้วไม่มีใครหยุด","nobody stops her once she moves",["power","dur"],{"dmg":{"punch":.12,"knee":.1},"clDef":.6})])],
 [("เก็บทุกแต้ม","Every Point Counts","ทุกดอกต้องเป็นแต้ม","every strike must score",[
   ("แต้มสวยทุกดอก","Clean Every Time","ออกอาวุธให้กรรมการเห็น","strike where the judges see it",["iq","foot"],{"pts":{"punch":.08,"kick":.08}}),
   ("สายตากรรมการ","Judge's Eye","","",["iq"],{"pts":{"kick":.02,"punch":.02}}),
   ("เก็บแต้มวงใน","Clinch Scoring","เก็บแต้มด้วยเข่าศอก","score with knees and elbows",["iq","clinch"],{"pts":{"knee":.1,"elbow":.1},"clDef":.3}),
   ("แต้มทุกอาวุธ","Points in Every Weapon","","",["iq"],{"pts":{"punch":.02,"kick":.02,"elbow":.02,"knee":.02}}),
   ("ผู้ชนะบนใบคะแนน","Winner on the Scorecard","ชนะขาดทุกยก","clear win, every round",["iq","comp"],{"pts":{"punch":.12,"kick":.12},"prep":.01})]),
  ("คุมเกม","Run the Fight","เดินเกมตามแผนมุม","fight to the corner's plan",[
   ("เดินเกมตามแผน","Fight to the Plan","ทำตามแผนทุกยก","follow the plan every round",["iq","comp"],{"corner":.25,"prep":.008}),
   ("ฟังเสียงมุม","Listen to the Corner","","",["iq"],{"corner":.06}),
   ("ปรับเกมกลางยก","Mid-Round Adjustment","เปลี่ยนแผนกลางยก","change the plan mid-round",["iq","foot"],{"corner":.2,"evade":.015,"ctr":.02}),
   ("เชิงมวยรอบด้าน","All-Round Ring IQ","","",["iq"],{"prep":.004,"ctr":.006}),
   ("เจ้าแห่งเกมห้ายก","Master of Five Rounds","คุมเกมได้ทั้งห้ายก","in control for all five rounds",["iq","comp"],{"corner":.4,"prep":.015,"evade":.02})])],
 [("อึดไม่จบ","Endless Gas Tank","แรงไม่ตกทั้งไฟต์","energy that never drops",[
   ("หายใจลึก","Deep Breaths","คุมลมหายใจระหว่างยก","breathing control between rounds",["stamina","dur"],{"regen":.15,"staSave":.02}),
   ("ปอดนักวิ่ง","Runner's Lungs","","",["stamina"],{"regen":.04,"staSave":.008}),
   ("ห้ายกเต็มแรง","Five Rounds Full Power","ยกห้าเหมือนยกหนึ่ง","round five like round one",["stamina","foot"],{"regen":.12,"staSave":.04}),
   ("แรงไม่ตก","Energy That Holds","","",["stamina"],{"staSave":.01,"regen":.03}),
   ("เครื่องยนต์ไม่ดับ","Engine Never Stops","ยิ่งนานยิ่งได้เปรียบ","the longer it goes, the better",["stamina","dur"],{"regen":.22,"staSave":.05})]),
  ("ถึกไม่ล้ม","Too Tough to Fall","รับได้ทุกอย่าง","takes everything",[
   ("รับเต็มแรง","Take It Full","รับดอกหนักแบบไม่ถอย","eat a heavy shot without stepping back",["dur","guard"],{"clDef":.6,"evade":.01}),
   ("ผิวหนังเหล็ก","Iron Skin","","",["dur"],{"clDef":.2,"clutch":.008}),
   ("ล้มแล้วลุก","Down and Up","ลุกขึ้นมาทุกครั้ง","gets up every time",["dur","comp"],{"clutch":.04,"regen":.1}),
   ("ใจไม่แตก","Unbreakable Nerve","","",["dur"],{"clutch":.01,"mor":.005}),
   ("ภูเขาไม่ล้ม","Mountain Doesn't Fall","ไม่มีใครล้มภูเขาได้","no one knocks over a mountain",["dur","guard"],{"clDef":1,"clutch":.05,"evade":.02})])]]
