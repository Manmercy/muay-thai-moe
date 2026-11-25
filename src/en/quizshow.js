// ================= MUAY THAI MOE — RADIO GAME SHOW "แฟนพันแท้มวยเด็ดเจ็ดครก" (v1.91.127, Man 24 พ.ย.) =================
// The community radio invites the player after they keep answering its weekly quiz right (every 3 right answers, at most 4 shows a season).
// 20 questions up a money ladder to ฿100,000, a timer on each, safe points at Q5/Q10/Q15, walk away any time with what is banked.
// Lifelines (once each): cut two wrong answers · ask the studio audience · phone someone close (Kru Daeng or a fighter you know).
// Everything the show needs to resume lives on the mail itself (m.k, m.bank, m.cq, m.ord, m.used…), so a reload never loses a show.
const QS_LAD=[500,1000,2000,3000,5000,7000,9000,12000,15000,20000,25000,30000,35000,40000,50000,55000,60000,70000,80000,100000];
const QS_SAFE=[4,9,14];
const QS_TIME=[25,30,35,40];
const QS_ABC=["A","B","C","D"];
const QS_HOST="Papa Piak";
// [question, [4 answers], right index, fact shown after the answer]
const QS_Q=[
[ // tier 1 — warm-up (Q1–5)
["Muay Thai is known as “the art of how many limbs”?",["Two limbs","Eight limbs","A con artist","Umpteen"],1,"Punches, kicks, knees and elbows, two each — eight limbs"],
["What is the dance a Thai boxer performs before fighting to honour the kru?",["Retro ramwong","Wai khru ram muay","Aerobics","A thanksgiving dance"],1,"The wai kru honours teachers, parents and the sacred, warms the body and sizes up the opponent"],
["What is the headpiece boxers wear during the wai kru called?",["Mongkhon headband","A helmet","Cat-ear headband","A big garland"],0,"The kru or cornerman puts it on, and takes it off before the fight"],
["What is the cloth tied on a boxer's upper arm for protection called?",["A pha khao ma","Prajiad armband","A scarf","Grandma's handkerchief"],1,""],
["What colours are the two fighters' corners?",["Red and blue","Pink and purple","White and black","Green and gold leaf"],0,"The other two are the neutral corners"],
["How many rounds is a pro Muay Thai fight in the big stadiums?",["3 rounds","5 rounds","12 rounds","Until the other one gets hungry"],1,"Three minutes a round, two minutes' rest between"],
["What does the referee say to separate clinching boxers?",["“Yaek!” (Break!)","“Hold on, kid”","“Cut to commercials”","“Had lunch yet?”"],0,"And “Chok!” means start fighting"],
["Which instruments play during a Muay Thai fight?",["Pi chawa, khaek drums, ching","Guitar, bass and drums","Phin, khaen and wot","Four violins"],0,"It's the pi-klong band; the tempo speeds up as the fight heats up"],
["In boxing language, what is a “teep”?",["Pushing the opponent with the sole of the foot","Cycling round the ring","Telling a joke","Running back to the corner"],0,"A good teep controls distance all round"],
["What is the pungent oil boxers rub on to warm their muscles before a fight called?",["Muay oil (namman muay)","Vegetable oil","Oyster sauce","Engine oil"],0,""],
["What do boxers wear to protect their teeth?",["A mouthguard","Grandma's dentures","Chewing gum","A sticky-rice ball"],0,""],
["What is a “boxing camp”?",["Where boxers train and live","A scout camp","A country-music label","A grilled-pork restaurant"],0,"Many boxers eat and sleep in camp from childhood"],
["Who looks after a boxer in the corner — water, plans between rounds?",["The cornerman","A director","A devoted fan auntie","A rider"],0,"A “mae yok” is a devoted fan in the crowd"],
["How far does the referee count before a downed boxer loses by knockout?",["Ten","Three","A hundred","Count until they fall asleep"],0,""],
["Which of these is a foul in Muay Thai?",["Biting the opponent","Body kicks","Knees","Push kick"],0,""],
["Where does a “low kick” usually land?",["The legs","The referee's knee","The ring ceiling","The wallet"],0,"Kick the legs a little at a time and by the late rounds they can't stand firm"],
["What most clearly sets Muay Thai apart from boxing?",["Punches, kicks, knees and elbows are all allowed","Gloves","A referee","A square ring"],0,""],
["If nobody is knocked out after all the rounds, how is the winner decided?",["The judges' scores","Rock-paper-scissors","Whoever is better-looking","A coin toss"],0,""],
["What is the knee thrown while leaping into the air called?",["Flying knee","Broken knee","Weak knees","Buckling knee"],0,""],
["In boxing, what is the “guard”?",["Raising the arms to protect yourself","A loyalty card","A wedding invitation","The game cards our camp collects"],0,"Drop your guard and the punch arrives"],
["Why must a boxer step on the scale before fight day?",["Making weight for their division","Weighing up their feelings","Weighing gold","Weighing the pig's head for the wai kru"],0,""],
["Where does a boxer sit between rounds?",["Their own corner","The referee's lap","The opponent's corner","The ring apron by the crowd"],0,""],
["Which part of the leg do most Muay Thai kicks land with?",["The shin","The little toe","The shoe heel","Socks"],0,"Thai boxers harden their shins — one kick feels like a baseball bat"],
["Where does a “neck kick” land?",["The neck","A banana stalk","A joss stick","The ankle"],0,""],
["In boxing slang, what is a “mai tai” (killer move)?",["The move that finishes the fight","A dead tree","Grandpa's cane","A toothpick"],0,""],
["What does a “Muay Khao” (knee fighter) mainly use?",["Knees and clinch","High kicks","Punch combinations","Jumping out of the way"],0,""],
["In Muay Thai, what does “yok” (round) mean?",["Each period of fighting","Weightlifting","Raising your hands in a wai","Flattering the referee"],0,""],
["Muay Thai is the national martial art and sport of which country?",["Thailand","Japan","Brazil","Pluto"],0,"This one's free — Papa Piak is generous"],
["Which of these uses the elbow?",["Spinning elbow","Push kick","Diagonal kick","Straight punch"],0,""],
["What is grabbing the neck and kneeing at close range called?",["Plam (the clinch)","American pro wrestling","A goodbye hug","Wrestling with homework"],0,""]
],
[ // tier 2 — getting warm (Q6–10)
["What is the tune the pi-klong band plays during a Muay Thai fight?",["“Sarama”","“Lao Duang Duean”","“Elephant Song”","“Bat Eats Banana”"],0,"Slow during the wai kru, then faster as the fight heats up"],
["Why do Thai boxers usually step over the top rope instead of ducking under?",["The head is sacred and shouldn't go low","The bottom rope is electrified","Too lazy to bend","To show off long legs"],0,""],
["What is “Muay Khat Chueak”?",["Ancient boxing with rope-bound hands instead of gloves","Boxing on a tightrope","Boxing while dragging a rope","Jump rope to warm up"],0,"Later replaced by gloves for safety"],
["The old Muay verse says “heavy fists, ___; clever, Lopburi; good form, Chaiya; quick, Tha Sao.” Which region fills the blank?",["Korat","Phuket","Rayong","Bangkok"],0,"Muay Korat is famous for heavy swinging punches"],
["What is “Jorakhe Fad Hang” (Crocodile Whips Its Tail)?",["Spinning back kick","Ducking low","Flying knee","Lying down and playing dead"],0,"One of the Mae Mai Muay Thai"],
["What is a “krachap” in boxing?",["A groin protector","An ancient weapon","A Thai dessert","A freshwater fish"],0,"The most essential item in a male boxer's life — Papa confirms"],
["Boxers from which country did Nai Khanom Tom famously defeat?",["Burma","Japan","Portugal","Mars"],0,"He won ten in a row before King Mangra"],
["Who is remembered every year on 17 March?",["Nai Khanom Tom, grandmaster of Muay Thai","Phraya Phichai Dap Hak","Every boxer who ever got knocked out","Papa Piak"],0,""],
["Which title made Buakaw Banchamek world famous?",["K-1 World MAX","Wimbledon","SEA Games chess","A country-music singing contest"],0,"He won it twice, in 2004 and 2006"],
["What is a “sok klap” (spinning elbow)?",["Spinning and swinging the elbow backwards","Borrowing someone's elbow and giving it back","An elbow that sprained and healed itself","Walking back to the corner"],0,""],
["What is the elbow that chops down onto the opponent from above called?",["Chopping elbow","Rising elbow","Sideways elbow","Toothpick elbow"],0,"The rising elbow is the one that comes up from below"],
["Which is against the rules of pro Muay Thai?",["Headbutting","Clinch knees","Slashing elbow","Neck-Line Kick"],0,""],
["Who should take the mongkhon off the boxer's head before the fight?",["The kru or cornerman","The referee","Opponent","A kind fan in the front row"],0,"The mongkhon is sacred — never put it on the floor or step over it"],
["How many times does a boxer usually bow down during the wai kru?",["Three times","Once","Seven, one per studio mortar","Ten if the purse is big"],0,""],
["How long is the break between rounds in pro Muay Thai?",["2 minutes","10 seconds","Half an hour","Until Kru Daeng finishes his story"],0,""],
["What does a “Muay Femur” (technical) fighter focus on?",["Craft — evasion and counters","Heavy punches only","Marching forward to trade","Singing to annoy the opponent"],0,""],
["Where does the second part of a Thai boxer's ring name usually come from?",["Their camp or sponsor","Their mother's name","An instant-noodle brand","A phone number"],0,"Like “Sit…” or the name of their camp"],
["Who are the “mae yok” in boxing?",["Fans who cheer and support boxers with all their heart","Mothers lifting heavy things","Female referees","Women who lift the ring"],0,""],
["What does “lom muay” (throwing a fight) mean?",["Losing on purpose to fix the result — against the rules and the law","Falling on a slippery ring","Dropping to dodge a punch","Quitting boxing"],0,"Good camps never touch it — Papa Piak insists"],
["What is “Krabi Krabong”?",["Thai armed martial art","An old Thai dessert","A boxing song","A kind of kick"],0,""],
["The mongkhon is sacred — what should never be done with it?",["Putting it on the floor or stepping over it","Keeping it somewhere high","Having the kru put it on","Bowing before wearing it"],0,""],
["Which is known as Thailand's first permanent standard boxing stadium?",["Rajadamnern Stadium","Tha Phae Stadium","The temple yard out back","Khlong Thom flea market"],0,"Opened in 1945 (B.E. 2488)"],
["Where is Rajadamnern Stadium?",["Bangkok","Chiang Mai","Phuket","Mars"],0,""],
["Which technique is the “push” into the body to control distance?",["Teep (straight push kick)","Low kick","Diagonal elbow","Curved knee"],0,""],
["What are the “neutral corners” of a ring?",["The corners that are neither red nor blue","The corner where the referee always stands","The drinks corner","The selfie corner"],0,"When a fighter goes down, the other must wait in a neutral corner"],
["Which Thai boxer was nicknamed “the left that pierces the gut”?",["Khaosai Galaxy","Buakaw Banchamek","Somluck Kamsing","Pone Kingpetch"],0,"His left to the body left opponent after opponent unable to stand"]
],
[ // tier 3 — the real fans (Q11–15)
["What is the Mae Mai “Mon Yan Lak” (Mon Props the Pillar)?",["A push kick with the sole of the foot","Neck-Line Kick","Spinning elbow","A clinch"],0,""],
["In Mae Mai Muay Thai, what is “Yo Khao Phra Sumen” (Lifting Mount Meru)?",["Dipping low and driving an uppercut under the chin","Climbing the corner post","A push kick to the chest","A jumping high kick"],0,""],
["In the widely taught texts, how many Mae Mai Muay Thai techniques are there?",["15","8","108","3"],0,"Plus 15 Luk Mai"],
["Which king, the story goes, disguised himself to box villagers at Talat Kruat?",["King Suea (the Tiger King)","King Taksin","King Ramkhamhaeng","King Naresuan"],0,"He beat three of the town's best boxers"],
["In which kingdom's era did King Suea reign?",["Ayutthaya","Sukhothai","Rattanakosin","Lanna"],0,""],
["How did King Mangra praise Nai Khanom Tom?",["Thais are dangerous all over","Thais eat spicy food well","Thais dance best","Thais wake up late"],0,"Even bare-handed, he could beat ten men"],
["After which event was Nai Khanom Tom taken to Burma?",["The second fall of Ayutthaya","World War II","Founding Sukhothai","Moving the capital to Chiang Mai"],0,"The capital fell in 1767 (B.E. 2310)"],
["Who was the first Thai boxer to win an Olympic gold medal for Thailand?",["Somluck Kamsing","Samart Payakaroon","Khaosai Galaxy","Buakaw Banchamek"],0,"Amateur boxing, Atlanta Olympics 1996"],
["Besides being a Muay Thai legend, which body crowned Samart Payakaroon a world boxing champion?",["WBC","FIFA","NBA","UNESCO"],0,"World super bantamweight champion"],
["The “buffalo swing” punch belongs to which style?",["Korat style","Chaiya style","Lopburi style","Tha Sao style"],0,""],
["What is the triangular footwork of ancient Muay Thai called?",["Three-Step Walk","Cha-cha","Three steps forward, two back","The Golden Triangle"],0,""],
["Muay Chaiya comes from which present-day province?",["Surat Thani","Chiang Rai","Nakhon Ratchasima","Chonburi"],0,"Known for beautiful form and a tight guard — “good form, Chaiya”"],
["In the old Muay verse, which style is called “clever”?",["Lopburi style","Korat style","Tha Sao style","Chaiya style"],0,"Known for tactics and feints"],
["Before entering service, Phraya Phichai Dap Hak was known as “Thong Di” plus which nickname?",["White Teeth","Gold Tooth","Iron Fist","Quick Legs"],0,"He didn't chew betel like people of his time, so his teeth stayed white"],
["Which body runs Lumpinee Stadium?",["The Royal Thai Army","The Royal Forest Department","The State Railway","The Fan Aunties Association of Thailand"],0,""],
["By old belief, what is a boxer's prajiad usually made from?",["Cloth from his mother, inscribed with yantra","A plastic bag","The camp curtains","The opponent's shirt"],0,"Tied on the arm, as if mother is always protecting him"],
["In which year did Buakaw Banchamek first win K-1 World MAX?",["2004","1984","2015","2025"],0,"And won it again in 2006"],
["Who was the first Thai to become a professional world boxing champion?",["Pone Kingpetch","Khaosai Galaxy","Samart Payakaroon","Somluck Kamsing"],0,"Won the title in 1960 (B.E. 2503)"],
["According to the story, how many Burmese boxers did Nai Khanom Tom beat in a row?",["Ten","Two","Fifty","A hundred and eight"],0,""],
["How is a “curved knee” different from a “straight knee”?",["A curved knee swings in from the side; a straight knee drives forward","Curved knees are for sprained legs","Straight knees are Mondays only","No difference"],0,""],
["In Muay Thai, what is the punch that rises from below to under the chin called?",["Uppercut","Straight punch","Hook","Backfist"],0,""],
["Which of these is a real Mae Mai Muay Thai?",["Crocodile Sweeps Its Tail","Elephant Steps on the Tail","Cat Steals the Mackerel","Fighting Cock Jumps the Fence"],0,""],
["What does hitting a downed opponent count as?",["A foul — against the rules","Bonus points","The referee praises it","The crowd tips"],0,""],
["Why do Thai boxers kick the bag or pads thousands of times?",["To harden the shins and make the kick natural","Because the bag likes it","So the kru can rest","To destroy the bag"],0,""],
["Who ordered the celebration at which Nai Khanom Tom fought?",["King Mangra","King Bayinnaung","King Alaungpaya","King Taksin"],0,""],
["In which year (B.E.) did Rajadamnern Stadium first open?",["2488","2400","2525","2560"],0,""]
],
[ // tier 4 — the big money (Q16–20)
["What is the Mae Mai “Nakha Bid Hang” (Naga Twists Its Tail)?",["Catching the kicking leg and twisting it","Spinning back kick","Spinning elbow","Push kick"],0,""],
["Which weapon does the Mae Mai “Pak Luk Thoi” use to stop a kick?",["Elbow","Teeth","The head","The kru's cane"],0,"Stab the elbow down into the incoming kick — it hurts more than the kick"],
["What is the Mae Mai “Hak Kho Erawan” (Breaking Erawan's Neck)?",["Pulling the opponent's head down into a knee","Kicking a real elephant's neck","Ducking a punch","A push kick to the chest"],0,""],
["At the celebration of which pagoda did Nai Khanom Tom fight?",["Shwedagon, Yangon","Phra That Doi Suthep","Phra Pathom Chedi","Phra That Phanom"],0,"A celebration of the pagoda's restoration and the raising of its spire umbrella"],
["In 2014 (B.E. 2557), to which road did Lumpinee Stadium move?",["Ram Inthra","Silom","Nimmanhaemin","Khao San"],0,""],
["Muay Tha Sao — “quick Tha Sao” — comes from which province?",["Uttaradit","Phuket","Samut Prakan","Trat"],0,"Known for quick feet and kicks"],
["Who is the revered grandmaster who preserved and spread Muay Chaiya?",["Kru Khet Sriyaphai","Nai Khanom Tom","Phraya Phichai Dap Hak","Papa Piak"],0,""],
["According to legend, how far up the arm did Muay Korat bind its rope?",["Up to the elbow","Just the fingertips","To the shoulder and round the neck","No binding at all"],0,"To support Korat's wide swinging punches"],
["In which year did IFMA, the International Federation of Muaythai Associations, receive full recognition from the International Olympic Committee?",["2021","1950","1988","Never"],0,"A big step on the road to the Olympics"],
["Where was Thailand's first international-style roped boxing ring built?",["The field of Suankularb Wittayalai School","Tha Phae, Chiang Mai","Sanam Luang","In front of Wat Arun"],0,"In 1921 (B.E. 2464)"],
["What is the ram muay posture where the boxer bows to all four directions called?",["Four-Faced Brahma","Four Directions Conquer the Mortar","The four-way spin","Bowing around the circle"],0,""],
["In the legend of King Suea at Talat Kruat, what was the boxer “Nai Lek” called?",["Iron Fist","Golden Fist","Quick Legs","Diamond Elbow"],0,"The other two were Nai Klang “Heavy Fist” and Nai Yai “Firm Fist”"],
["After beating ten men, what did Nai Khanom Tom ask of King Mangra?",["Freedom for the Thai captives","A Burmese wife","A load of gold","A general's post"],0,"The Thai captives returned to their homeland"],
["Why did gloves mainly replace rope-binding in Thai rings?",["Fighter safety","Gloves were cheaper than rope","A rope shortage","Better photos"],0,""],
["In Mae Mai Muay Thai, what kind of defence is “Hak Nguang Aiyara” (Breaking the Elephant's Trunk)?",["Catching the opponent's kick and countering at the leg","Clinching and singing","A straight punch to the nose","Crawling under the ropes to escape"],0,""],
["How does “Luk Mai” differ from “Mae Mai” in Muay Thai?",["Luk Mai are branch techniques built on the Mae Mai","Luk Mai is the fruit in the camp","Luk Mai is only for kids","No difference"],0,""],
["In pro Muay Thai scoring, how many points does the winner of a round usually get?",["10 points","100 points","1 point","Rounds aren't scored"],0,"The loser of the round gets 9 or less"],
["In the old Muay Thai verse, which style is called “good form”?",["Chaiya style","Korat style","Lopburi style","Tha Sao style"],0,""],
["In which division did Samart Payakaroon win the WBC world boxing title?",["Super bantamweight","Heavyweight","Middleweight","Weightless division"],0,"Won the title in 1986"],
["Where was Nai Khanom Tom from before he was taken captive?",["Ayutthaya","Chiang Mai","Pattani","Nakhon Ratchasima"],0,""],
["In Muay Thai, which ceremony do students hold every year to honour the kru who taught them?",["The annual wai kru ceremony","Kru's birthday","A grilled-pork party","Kicking a football"],0,""],
["Which of these is NOT a Mae Mai Muay Thai technique?",["Mackerel Jumps the Wok","Crocodile Sweeps Its Tail","Mon Braces the Post","Breaking Erawan's Neck"],0,"“Mackerel Jumps the Wok” — Papa Piak made that one up this morning"]
]];

/* ---------------- host lines (funny on purpose) ---------------- */
const QSL={
 open:"Hello, fight fans everywhere! Community radio “Our Hometown Muay” welcomes you to… Ultimate Fan! Muay! Seven… Mortaaars!",
 intro:["I'm Papa Piak, your host. I own three suits and have rotated them for fifteen years. Today's is the washed one",
  "Our contestant today is {n} — a camp owner who answers our radio quiz right so often the station had to invite them, or we'd run out of prizes!",
  "Thanks to our sponsors: Golden Mortar fermented fish sauce, “smells through your gloves”, and Fallen Boxer balm, “rub it on and get up before ten”",
  "We have seven mortars in front of the stage. Don't ask me why… I don't know either. They were here before I started",
  "A round of applause for {n}! …Very loud, considering there are twelve people in the studio. Thank you"],
 rule:"The rules are simple! Twenty right answers wins a hundred thousand baht! Questions 5, 10 and 15 are safe points, and you can stop and take the money any time. You get three lifelines, once each — like a kru's kindness, limited!",
 ask:[["Question {k}. This one's easy — so easy the mortars are laughing","Question {k} for {a}! Listen carefully","Let's warm up — question {k}","Question {k}! Get this wrong and I'm telling the som tam lady outside the station"],
  ["Question {k}, and the sweat starts… mine, not yours","Question {k} for {a}! The audience is silent… so are the mortars","The money's getting big now. Question {k} — watch out for the counter!","Question {k}. The crew are watching from behind the glass — nobody's eating lunch"],
  ["Question {k}! Round three, everyone. The money's getting heavy, the mortars are shaking","Question {k} for {a}! The uncle in the front row just sat up straight","Question {k}. Lots of people got this one wrong. I'm not threatening you, just saying"],
  ["Question {k}… round five now. Whoever's still standing is the real deal","Question {k} for {a}!! Let me breathe… hoooo… OK, listen","Question {k}! Even I had to peek at the answer card twice for this one"]],
 last:"The last question, everyone!! A hundred thousand baht!! Our legendary seventh mortar is now in the middle of the stage!",
 lock:["Answer {c}… final answer? Locked! Locked tighter than a fifth-round clinch!","{c}… let me look at {n}'s face… can't read it at all — straighter than a referee","{c}… crew, give me the drum please… thum… thum… thum…","{c}, is it… hmmm… (Papa Piak stares at you far longer than necessary)","{c}… let me say something… …nothing, I just wanted you to sweat"],
 right:["Correeeect! Righter than the neighbour auntie's lottery ticket last draw!","Correct!! All seven mortars pound in celebration — bonk, bonk, bonk!","Correct! {n} now has {a}! A bigger smile than a fan auntie when her favourite wins by KO","That's it! The back row is standing up… oh, they're going to the bathroom, but they're clapping too","Correct! I'm so happy I forgot my lines… what's the crew's sign say… oh, “keep going”"],
 safe:"Safe point! That {a} goes home with you for sure — even if you answer the next one “no idea”!",
 wrong:["Owww… that hurts more than a spinning elbow! The right answer was {c}","Nope… all seven mortars pound at once, BONK! The answer was {c}","Oof… the front row covered their eyes, and so did I. The answer was {c}","So close! Like a kick that misses and you slip over by yourself. The right answer was {c}"],
 timeout:["Time's up! You took longer than a ten count! The answer was {c}","Beeeep! Time's up! Our clock waits for no one — like a rest break that's never long enough. The answer was {c}"],
 quitAsk:"Stopping here? Take {a} home, or go on for {nx}? Miss the next one and you'll only keep {sf}…",
 quit:["No risk, no pain! Like a boxer who teeps all five rounds and wins on points. {n} takes home {a}!","Smart! The kru say knowing when to step back is knowing how to win… I just made that up, but it sounds good, right?","Take the money and go home to sleep! {a} buys Golden Mortar fish sauce for the whole camp!"],
 quitReveal:"…but if you had gone on, the answer was {c}. Hee hee",
 nostart:"You haven't won anything yet and you're leaving? The studio doors are locked. Kidding, kidding — but how about one answer first?",
 win:"A HUNDRED THOUSAAAND!!! {n} is a true Seven Mortars Ultimate Fan! The seventh mortar pounded all by itself! A miracle!",
 zero:"Going home empty-handed… but you get a bottle of Fallen Boxer balm. Rub it on your heart",
 home:"You still take {a} home! Not bad at all — that's a year of Golden Mortar fermented fish sauce",
 bye:"Thank you, {n}, and all you fight fans. See you next time… on Ultimate Fan… Seven… Mortars!",
 cut:"Crew, cut two answers! …Snip! Snip! Sorry for the noise — our crew uses hedge shears",
 aud:"Studio audience, your vote please! Press now… (the auntie in row two pressed three times — the crew allowed it)",
 heck:["Uncle in the back row: “{x}! I've been rooting for {x} since 1987!”","Kid in the front row: “{x}! …I'm guessing”","A devoted fan auntie: “Pick anything, dear, I love them all!”","Motorbike taxi guy: “{x}! I'm waiting to drive people home, don't drag it out”","Market auntie: “{x}! If you win, come buy my som tam!”"],
 phone:"Phone a friend! You get thirty seconds. This call is sponsored by… nobody. {n} pays the phone bill",
 phoneBack:"Call over! You've got your hint. Believe it or not — your life, your choice",
 hurry:["The clock is running… faster than a Tha Sao boxer's feet!","Last five seconds! Pick anything — the fan auntie in the front row loves them all!","Hurry, hurry! Fast like boxers when they hear there's a grilled-pork party!","{n}… I can see the clock. Can you see the clock?"]
};
/* v1.91.144: more host material, so a season of shows does not run out of jokes */
QSL.ask[0].push("Question {k}. The crew says a primary-school kid could answer this …our crew are primary-school kids. The owner's children","Question {k} for {a}! That buys half a jar of fermented fish sauce… a small jar","Question {k}! I'll read slowly — the sponsor pays by the second","Question {k}. Get it wrong and I won't be angry, but seven mortars will be very disappointed");
QSL.ask[1].push("Question {k} for {a}! Forty listeners at home now — a new station record!","Question {k}. I see {n} wiping sweat… oh, that's me","Question {k}! The crew just passed me a note: “talk less” …I'll keep talking","Question {k} for {a}! Let's turn on the second spotlight… the crew says the power bill isn't paid. One is enough");
QSL.ask[2].push("Question {k} for {a}! The som tam lady closed her stall to watch through the glass — left a mortar half pounded","Question {k}… let me read it in a deep voice… (ahem) …not deep at all, never mind","Question {k}. I asked a kru near the station about this one. He didn't know, and then he kicked me","Question {k}! At this money you could fight three temple-fair bouts");
QSL.ask[3].push("Question {k} for {a}!! The station manager is standing behind me. Very pale","Question {k}… our twelve audience members are now eleven. One fainted. It's fine, he'll wake up","Question {k} for {a}! I'm not allowed to help… but I really, really want to");
/* pacing: a real host does not joke on every answer — short plain lines in between (these may repeat) */
QSL.lockShort=["{c}… final answer?","{c}… locked in!","Answer {c}… here we gooo…","{c}… OK… let's see the answer…"];
QSL.rightShort=["Correct!","Correct! Keep going!","Correct! You now have {a}!","Yes! Correeect!"];
QSL.legend="Before question 16, a legend… the seventh mortar belonged to the station's founder. He said the day someone answers all twenty, it will pound by itself. I've waited fifteen years… question 16 for {a}!";
QSL.lock.push("{c}… crew, lights down please… (the whole studio goes black) …not THAT dark!","{c}… let's take a thirty-second break… kidding, we have no ad budget","{c}… how sure are you, {n}? …don't answer, I can see your hands shaking","Answer {c}… all seven mortars hold their breath (mortars can't breathe, just imagine it)","{c}… let me open the answer envelope… it's glued shut… crew! The hedge shears again!");
QSL.right.push("Correct! The auntie in row two pressed her vote button again… auntie, there's no vote right now","Correct! Let me hug you… our podiums are three metres apart. Hug the air for now","Correct! The third mortar pounded by itself… oh, the crew kicked the table. Sorry","Yes! Correct! I knew from the start {n} would get it (I did not)","Correct! A listener just called in to praise you… it's my mum","Correeect! All three judges give ten out of ten (we have one judge. It's me)","Correct! The motorbike taxi guy outside honked three times… or he's calling a customer, not sure");
QSL.wrong.push("Wrong… the fourth mortar is crying (the crew poured water on it). The answer was {c}","No, I'm truly sorry… wait, am I smiling? Sorry, my face just does that. The answer was {c}","Aaagh! The uncle in the back row dropped his rice basket. The right answer was {c}","Wrong… the crew put on a sad song… it's the Sarama. Not very sad, honestly. The answer was {c}");
QSL.timeout.push("Time's up… {n} stood so still I thought the picture froze — on a radio show. The answer was {c}");
QSL.safeAt=["First safe point! {a} goes home for sure. The first mortar just nodded (the crew shook the table)","Second safe point! {a} is yours. Mortars two to six are starting to move… or the table is wobbling, not sure","Last safe point! {a}! Only the seventh mortar is still not moving… it hasn't moved in fifteen years"];
QSL.retWin="{n} is back! Last time you won so much the station had to sell a mortar… kidding. All seven are still here";
QSL.retZero="{n} is back for revenge! Last time you went home with balm — used it up yet? We've got another bottle ready";
QSL.retChamp="The ฿100,000 champion is back! The station nearly went bankrupt, but the manager says the ratings were great, so here we are";
QSL.campCall=["Quick news before we start: {g} has called the station three times asking for a song for {n} …dear, this is a game show. No requests","Someone from {n}'s camp is cheering outside the glass… {g} brought a light-up sign that says “Fight!”, spelled right too. Very good"];
QSL.fast=["So fast! I hadn't even finished reading the question","Faster than the referee's whistle! Confidence or a twitchy finger?"];
QSL.clutch=["Answered with {s} seconds left! My heart can't take this","Close call! The crew had a finger on the time-up button"];
QSL.fRight="Credit to {f}! The station will send a bottle of balm as thanks";
QSL.fIgnoreRight="Ignored {f} and got it right! {f}, if you're listening… I apologise on their behalf";
QSL.fIgnoreWrong="{f} said {x}… why didn't you trust {f}… I won't say more, but the whole camp will";
QSL.fWrong={coach:"Kru Daeng! Sticky rice and grilled pork for the whole camp, as promised — the station has it in writing!",kati:"Kati… that thousand percent is now zero",mali:"Mali… please stop reading while you wait for the microwave",rin:"Rin, this round's error really was that glass of milk",ploy:"Ploy… I won't tell anyone you weren't sure (the whole province is listening)",fah:"Fah said if it's wrong, blame the host… sorry. I don't know what I'm apologising for",prod_B:"Baiyok, your processing system needs an urgent update"};
QSL.audWrong="The studio audience apologises… the uncle in the back row just slipped out the back door";
QSL.audAgainst="Against the crowd and right! The auntie in row two is writing {n}'s name in her notebook. Good or bad, nobody knows";
/* the people you can phone — each answers in their own voice; acc = chance of being right by tier */
const QS_FRIENDS={
 coach:{acc:[.95,.85,.72,.6],hi:["Hello! Camp owner? You're on the radio, right? Kru's listening — your voice is shaking","About that — back when Kru was young, I fought at a temple fair, and there was this old man holding a rice basket…"],
  sure:"…Fine. Say {x}. Kru's sure. If it's wrong, sticky rice and grilled pork for the whole camp on me",unsure:"Hmm… Kru isn't sure, but my gut says {x} …if it's wrong, don't tell anyone I said it",bye:"(beep… beep…) Kru hung up early — the chili paste pounding at home drowned him out"},
 kati:{acc:[.8,.6,.45,.3],always:1,hi:["Hi! Kati's listening to the radio right now! I'm so nervous for you I can't sit still!"],
  sure:"{x}! A hundred percent sure! …No, no, a thousand percent!",unsure:"{x}! A hundred percent sure!",bye:"…Why am I sure? Dunno, but the name sounds like a heavy punch! Go go!"},
 mali:{acc:[.85,.65,.5,.35],hi:["Eeek! I can hear myself on the radio! Mali's on air! Hi everyone!"],
  sure:"Mali thinks {x}! I read it while waiting for the microwave",unsure:"Ummm… {x} maybe? Mali's guessing, but Mali trusts you the most!",bye:"If you win, buy Mali some bingsu! You can do it!"},
 rin:{acc:[.95,.9,.8,.65],pct:1,hi:["Rin speaking. I'm listening to the show — I've already noted this question."],
  sure:"Based on my data, the answer is {x}, roughly {p} percent likely.",unsure:"Not enough data… if I must choose, {x}, roughly {p} percent likely",bye:"The remaining error is because you called while I was drinking milk."},
 ploy:{acc:[.9,.8,.65,.5],hi:["It's Ploy… you're calling me about this, on a show the whole province is hearing?"],
  sure:"{x}. My old camp taught basics like this in year one.",unsure:"I think {x}… don't you dare say Ploy wasn't sure.",bye:"I'm hanging up… get it right. I'm listening."},
 fah:{acc:[.8,.55,.4,.3],hi:["Hmph, it's Fah. On the radio and so nervous you had to call me?"],
  sure:"{x}, obviously. Easy",unsure:"No idea. But {x} sounds cool. Go with that — if it's wrong, blame the host",bye:"…Don't forget Fah once you get the money."},
 prod_B:{acc:[.9,.9,.85,.8],pct:1,hi:["…Call received. Baiyok is ready to answer."],
  sure:"Processing… Answer: {x}. Confidence {p} percent",unsure:"Processing… conflicting data. Answer: {x}. Confidence {p} percent",bye:"…Next time you can just call. You don't need a question."}
};

/* ---------------- invitation + counting ---------------- */
function qsState(G){if(!G.qs){const r=(G.mail||[]).filter(m=>m.kind==="quiz"&&m.done&&m.ok).length;G.qs={right:r,used:0,yr:{},last:-99,seen:{},shows:0,best:0};}return G.qs;}
function qsInvite(G){const S=qsState(G);S.last=gameWeek(G);const yk=G.season||1;S.yr[yk]=(S.yr[yk]||0)+1;
  return addMail(G,{kind:"event",ev:"qshow",from:"Community radio “Our Hometown Muay”",title:"You're on air! Ultimate Fan: Seven Mortars Muay",
    body:"You answer our quiz right so often that Papa Piak wants to meet you in person! Come compete live on “Ultimate Fan: Seven Mortars Muay” — 20 right answers wins up to ฿100,000 (come within 2 weeks)",exp:G.week+2});}
function qsWeekly(G){const S=qsState(G);if(G.week<5||G.week>50)return;if((G.mail||[]).some(m=>m.ev==="qshow"&&!m.done&&!m.expired))return;
  if(S.right-S.used>=3&&(S.yr[G.season||1]||0)<4&&gameWeek(G)-S.last>=6){S.used+=3;qsInvite(G);}}
{const _w=xlWeekly;xlWeekly=function(G){_w(G);try{qsWeekly(G);}catch(e){console.error("qshow",e);}};}
{const _q=ACT.mquiz;ACT.mquiz=d=>{const m=G.mail.find(x=>x.id===d.v);const was=m&&m.done;_q(d);if(m&&!was&&m.done&&m.ok)qsState(G).right++;};}
{const _e=evMailAct;evMailAct=function(m){if(m.ev!=="qshow")return _e(m);
  if(m.done)return `<p class="meta center">${m.win?`Aired · won ${fmt(m.win)} (answered ${m.k||0} right)`:`Aired · answered ${m.k||0} right · went home with a bottle of Fallen Boxer balm`}</p>`;
  if(m.expired)return `<p class="meta center">You missed this one. Keep answering the radio quiz and the station will invite you again</p>`;
  return `<button class="btn primary" data-act="qsgo" data-v="${m.id}">${m.st?"Back to the studio ▸":"Go on air ▸"}</button>`;};}
Object.assign(ACT,{qsgo:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||m.expired)return;UI.modal=null;render();QS.open(m);}});
{const _t=xlTestSetup;xlTestSetup=function(G){_t(G);try{qsState(G);qsInvite(G);}catch(e){console.error(e);}};}

/* ---------------- the show ---------------- */
const QS={st:null,tm:null,
  m(){return this.st&&G.mail.find(x=>x.id===this.st.mid);},
  fill(s,o){const m=this.m(),k=m?m.k||0:0;o=o||{};return String(s).replace(/\{n\}/g,ME(G)).replace(/\{k\}/g,k+1).replace(/\{a\}/g,fmt(o.a!=null?o.a:QS_LAD[k])).replace(/\{nx\}/g,fmt(QS_LAD[Math.min(19,k)])).replace(/\{sf\}/g,fmt(qsSafe(k))).replace(/\{c\}/g,o.c||"").replace(/\{x\}/g,o.x||"").replace(/\{p\}/g,o.p||"");},
  pick(a){return a[Math.floor(Math.random()*a.length)];},
  /* v1.91.144 (Man: "ลองเทสความฮา"): host lines never repeat inside one show, and prefer lines this player has not heard in recent shows */
  line(a,short){const S=this.st,Q=qsState(G);Q.heard=Q.heard||[];const U=S?(S.usedL=S.usedL||[]):[];let c=a.filter(x=>!U.includes(x));if(short&&(!c.length||Math.random()<.45))return this.pick(short);if(!c.length)c=a;const f=c.filter(x=>!Q.heard.includes(x));const r=this.pick(f.length?f:c);U.push(r);Q.heard.push(r);if(Q.heard.length>90)Q.heard.splice(0,Q.heard.length-90);return r;},
  introLines(){const Q=qsState(G),L=[QSL.open];const ret=Q.shows>0;if(ret)L.push(Q.lastWin>=QS_LAD[19]?QSL.retChamp:Q.lastWin>0?QSL.retWin:QSL.retZero);
    const g=["kati","mali","rin","ploy","fah","prod_B"].filter(id=>G.F[id]&&inCamp(G,id));if(g.length&&Math.random()<.6)L.push(this.line(QSL.campCall).replace(/\{g\}/g,(SPK[this.pick(g)]||{}).name||""));
    while(L.length<3)L.push(this.line(QSL.intro));L.push(QSL.rule);return L;},
  open(m){if(!m.st){m.st=1;m.k=0;m.bank=0;m.used={};}this.st={mid:m.id,phase:m.cq?"q":"intro",step:0,host:"excited",say:QSL.open,me:"smile"};this.st.intro=this.introLines();
    if(m.cq){this.st.host="smile";this.st.say="Welcome back to the studio! The signal just came back — same question, let's carry on!";this.st.left=QS_TIME[qsTier(m.k)]*1000;}
    save();this.mount();this.draw();if(this.st.phase==="q")this.startTimer();try{AU.sfx("bell");}catch(e){}},
  shuf(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
  mount(){let el=document.getElementById("qshow");if(!el){el=document.createElement("div");el.id="qshow";el.className="mgame qshow";document.body.appendChild(el);}
    el.onclick=e=>{const b=e.target.closest("[data-qs]");if(!b||b.disabled)return;if(performance.now()<(this.armAt||0))return;/* swallow the 2nd tap of a double-tap: "next question" and the answer buttons share a spot */this.act(b.dataset.qs,b.dataset.v);};},
  close(){this.stopTimer();const el=document.getElementById("qshow");if(el)el.remove();this.st=null;save();render();},
  q(){const m=this.m();if(!m||!m.cq)return null;const [t,i]=m.cq.split(".").map(Number);const Q=QS_Q[t]&&QS_Q[t][i];return Q?{q:Q[0],o:Q[1],a:Q[2],x:Q[3]||"",t}:null;},
  draw1(){const m=this.m(),t=qsTier(m.k),S=qsState(G),key="t"+t;S.seen[key]=S.seen[key]||[];let pool=QS_Q[t].map((_,i)=>i).filter(i=>!S.seen[key].includes(i));if(!pool.length){S.seen[key]=[];pool=QS_Q[t].map((_,i)=>i);}
    const i=this.pick(pool);S.seen[key].push(i);m.cq=t+"."+i;m.ord=this.shuf([0,1,2,3]);m.cut=null;m.aud=null;m.hint=null;save();},
  next(){const m=this.m();this.draw1();this.st.phase="q";this.st.host="smile";this.st.me="normal";this.st.react="";this.st.say=this.fill(m.k===19?QSL.last:m.k===15?QSL.legend:this.line(QSL.ask[qsTier(m.k)]));this.st.left=QS_TIME[qsTier(m.k)]*1000;this.st.hurried=false;this.draw();this.startTimer();},
  arm(ms=650){this.armAt=performance.now()+ms;},
  startTimer(){this.stopTimer();this.st.end=performance.now()+this.st.left;this.tm=setInterval(()=>this.tick(),200);},
  stopTimer(){if(this.tm){clearInterval(this.tm);this.tm=null;}if(this.st&&this.st.end)this.st.left=Math.max(0,this.st.end-performance.now());},
  tick(){const S=this.st;if(!S||S.phase!=="q"){this.stopTimer();return;}const left=S.end-performance.now(),m=this.m(),tot=QS_TIME[qsTier(m.k)]*1000;
    const bar=document.querySelector(".qs-time i"),num=document.querySelector(".qs-time b");if(bar)bar.style.width=Math.max(0,left/tot*100)+"%";if(num)num.textContent=Math.max(0,Math.ceil(left/1000));
    const sec=Math.ceil(left/1000);if(sec<=5&&sec!==S.lastSec&&left>0){S.lastSec=sec;try{AU.sfx("tick");}catch(e){}if(!S.hurried){S.hurried=true;S.me="flustered";S.host="suspense";S.say=this.fill(this.line(QSL.hurry));this.stopTimer();this.st.left=left;this.draw();this.startTimer();}}
    if(left<=0){this.stopTimer();this.reveal(-1);}},
  act(a,v){const S=this.st,m=this.m();if(!S||!m)return;if(a!=="aud")S.heck=null;
    if(a==="introNext"){S.step++;if(S.step<S.intro.length){S.say=this.fill(S.intro[S.step]);S.host=S.step===S.intro.length-1?"correct":"smile";this.draw();}else this.next();return;}
    if(a==="ans"&&S.phase==="q"){const d=+v;if(m.cut&&m.cut.includes(d))return;S.ansLeft=S.end-performance.now();this.stopTimer();S.phase="lock";S.sel=d;S.host="suspense";S.me="serious";S.say=this.fill(this.line(QSL.lock,QSL.lockShort),{c:QS_ABC[d]});this.draw();try{AU.sfx("choose");}catch(e){}setTimeout(()=>{if(this.st===S)this.reveal(d);},1900);return;}
    if(a==="cut"&&S.phase==="q"&&!m.used.c){m.used.c=1;const Q=this.q(),ri=m.ord.indexOf(Q.a),wr=[0,1,2,3].filter(i=>i!==ri);m.cut=this.shuf(wr).slice(0,2);if(m.aud)m.aud=this.audience();S.host="excited";S.say=QSL.cut;save();this.draw();try{AU.sfx("pop");}catch(e){}return;}
    if(a==="aud"&&S.phase==="q"&&!m.used.a){m.used.a=1;m.aud=this.audience();S.host="excited";const top=m.aud.indexOf(Math.max(...m.aud));S.heck=this.fill(this.line(QSL.heck),{x:QS_ABC[Math.random()<.6?top:this.pick([0,1,2,3].filter(i=>!(m.cut||[]).includes(i)))]});S.say=QSL.aud;save();this.draw();try{AU.sfx("pop");}catch(e){}return;}
    if(a==="phone"&&S.phase==="q"&&!m.used.p){this.stopTimer();S.phase="phone";S.host="smile";S.say=this.fill(QSL.phone);this.draw();return;}
    if(a==="phoneBack"&&S.phase==="phone"){S.phase="q";S.say="Not calling after all? Save it for later — smart!";this.draw();this.startTimer();return;}
    if(a==="call"&&S.phase==="phone"){m.used.p=1;S.call=this.callLines(v);S.callI=0;S.phase="call";save();this.draw();try{AU.sfx("pop");}catch(e){}return;}
    if(a==="callNext"&&S.phase==="call"){S.callI++;if(S.callI>=S.call.lines.length){m.hint={id:S.call.id,x:S.call.x,p:S.call.p};S.phase="q";S.host="smile";S.say=this.fill(QSL.phoneBack);save();this.draw();this.startTimer();}else this.draw();return;}
    if(a==="quit"&&S.phase==="q"){this.stopTimer();if(!m.k){S.say=this.fill(QSL.nostart);S.host="wrong";this.draw();this.startTimer();return;}S.phase="quitask";S.host="suspense";S.say=this.fill(QSL.quitAsk,{a:m.bank});this.draw();return;}
    if(a==="quitNo"&&S.phase==="quitask"){S.phase="q";S.host="excited";S.say="Brave! That's a camp owner! Let's keep going!";this.draw();this.startTimer();return;}
    if(a==="quitYes"&&S.phase==="quitask"){const Q=this.q();S.host="correct";S.me="smile";S.say=this.fill(this.line(QSL.quit),{a:m.bank});S.post=this.fill(QSL.quitReveal,{c:`${QS_ABC[m.ord.indexOf(Q.a)]}. ${Q.o[Q.a]}`});S.rightD=m.ord.indexOf(Q.a);this.finish(m.bank,"quit");return;}
    if(a==="go"&&S.phase==="right"){this.next();return;}
    if(a==="close"&&S.phase==="end"){this.close();return;}},
  audience(){const m=this.m(),Q=this.q(),t=qsTier(m.k),ri=m.ord.indexOf(Q.a),live=[0,1,2,3].filter(i=>!(m.cut||[]).includes(i));
    const w=[0,0,0,0];for(const i of live)w[i]=.15+Math.random()*.55;w[ri]+=[1.6,1.05,.7,.45][t]+Math.random()*.3;const s=w.reduce((a,b)=>a+b,0);const p=w.map(x=>Math.round(x/s*100));p[ri]+=100-p.reduce((a,b)=>a+b,0);return p;},
  friends(){const L=["coach"];for(const id of ["kati","mali","rin","ploy","fah","prod_B"]){const f=G.F[id];if(f&&(inCamp(G,id)||(f.bond||0)>=40))L.push(id);}return L;},
  callLines(id){const P=QS_FRIENDS[id]||QS_FRIENDS.coach,m=this.m(),Q=this.q(),t=qsTier(m.k),ri=m.ord.indexOf(Q.a),live=[0,1,2,3].filter(i=>!(m.cut||[]).includes(i));
    const ok=Math.random()<P.acc[t],x=ok?ri:this.pick(live.filter(i=>i!==ri)),sure=P.always||(ok?Math.random()<.75:Math.random()<.35);
    const p=P.pct?String(ok?60+Math.floor(Math.random()*35):35+Math.floor(Math.random()*25))+(id==="prod_B"?"."+Math.floor(Math.random()*10):""):"";
    const xs=`${QS_ABC[x]}. ${Q.o[m.ord[x]]}`;
    const lines=[...P.hi.map(s=>this.fill(s)),this.fill(sure?P.sure:P.unsure,{x:xs,p}),this.fill(P.bye)];return {id,x,p,lines};},
  /* what the host says about HOW you answered: on the buzzer, in a hurry, with or against your phone friend / the audience */
  reactTo(d,ok){const S=this.st,m=this.m(),R=[];if(d<0)return "";const tot=QS_TIME[qsTier(m.k)]*1000,left=S.ansLeft||0;
    if(m.hint){const nm=(SPK[m.hint.id]||{name:"Coach Daeng"}).name,fol=d===m.hint.x,xs=QS_ABC[m.hint.x];
      R.push(ok&&fol?QSL.fRight:ok?QSL.fIgnoreRight:fol?(QSL.fWrong[m.hint.id]||QSL.fWrong.coach):QSL.fIgnoreWrong);S._f={f:nm,x:xs};}
    else if(m.aud){const top=m.aud.indexOf(Math.max(...m.aud)),fol=d===top;if(!ok&&fol)R.push(QSL.audWrong);else if(ok&&!fol)R.push(QSL.audAgainst);}
    if(!R.length&&left>tot-3000&&qsTier(m.k)>0)R.push(this.line(QSL.fast));
    if(!R.length&&left<3000)R.push(this.line(QSL.clutch));
    const f=S._f||{};S._f=null;return R.length?this.fill(R[0].replace(/\{f\}/g,f.f||"").replace(/\{x\}/g,f.x||"").replace(/\{s\}/g,Math.max(1,Math.ceil(left/1000)))):"";},
  reveal(d){const S=this.st,m=this.m(),Q=this.q();if(!Q)return;const ri=m.ord.indexOf(Q.a),cs=`${QS_ABC[ri]}. ${Q.o[Q.a]}`;S.sel=d;S.rightD=ri;S.lastQ=Q;S.lastOrd=m.ord;S.react=this.reactTo(d,d===ri);
    if(d===ri){m.k++;m.bank=QS_LAD[m.k-1];S.fact=Q.x;try{AU.sfx("level");}catch(e){}
      if(m.k>=20){S.host="excited";S.me="surprised";S.say=this.fill(QSL.win);this.finish(QS_LAD[19],"win");try{AU.sfx("champ");}catch(e){}return;}
      S.phase="right";S.host="correct";S.me="smile";S.say=this.fill(this.line(QSL.right,QSL.rightShort),{a:m.bank});if(QS_SAFE.includes(m.k-1))S.safe=this.fill(QSL.safeAt[QS_SAFE.indexOf(m.k-1)],{a:m.bank});else S.safe="";m.cq=null;save();this.draw();S.bump=1;return;}
    try{AU.sfx("miss");}catch(e){}S.host="wrong";S.me="sad";S.fact=Q.x;const sf=qsSafe(m.k);S.say=this.fill(this.line(d<0?QSL.timeout:QSL.wrong),{c:cs});S.post=this.fill(sf?QSL.home:QSL.zero,{a:sf});S.shake=1;this.finish(sf,"lose");},
  finish(amt,how){const S=this.st,m=this.m(),Q=qsState(G);this.stopTimer();m.done=true;m.win=amt;m.how=how;m.cq=null;G.cash+=amt;Q.shows++;Q.lastWin=amt;Q.best=Math.max(Q.best||0,m.k||0);S.phase="end";S.amt=amt;
    if(amt>0)toast(`Prize from the show: ${fmt(amt)}`);save();this.draw();},
  meImg(e){const L=G.avatar||{gender:G.player.gender};const u=typeof MGRP!=="undefined"?MGRP.url(L,e,()=>{if(this.st)this.draw();}):"";if(u)this.lastMe=u;return u||this.lastMe||"";},
  draw(){const S=this.st,el=document.getElementById("qshow"),m=this.m();if(!S||!el||!m)return;const qk=S.phase+":"+(m.k||0);if(qk!==this.lastQk){this.lastQk=qk;this.arm();}const k=m.k||0,Q=this.q()||(S.phase==="right"?S.lastQ:null),t=qsTier(Math.min(19,k));
    const me=this.meImg(S.me==="normal"?"normal":S.me);
    const lad=`<ol class="qs-lad">${QS_LAD.map((a,i)=>`<li class="${i===k&&S.phase!=="end"?"on":""} ${i<k?"ok":""} ${QS_SAFE.includes(i)?"sf":""}"><span>${i+1}</span><b>${fmt(a)}</b></li>`).reverse().join("")}</ol>`;
    const krok=`<div class="qs-krok ${S.shake?"shake":""} ${S.phase==="right"||S.phase==="end"&&S.amt>=QS_LAD[19]?"hop":""}">${"<i></i>".repeat(7)}</div>`;
    const stage=`<div class="qs-stage"><div class="qs-pod me"><div class="qs-fig">${me?`<img src="${me}" alt="">`:`<div class="qs-sil"></div>`}</div><div class="qs-plate">${esc(ME(G))}</div></div>
      <div class="qs-pod host"><div class="qs-fig"><img src="${ASSET}qhost_${S.host||"smile"}_half.webp" alt=""></div><div class="qs-plate">${QS_HOST}</div></div>${krok}</div>`;
    const say=`<div class="qs-say"><small>${QS_HOST}</small><p>${esc(S.say||"")}</p>${S.heck&&S.phase==="q"&&m.aud?`<p class="qs-heck">${esc(S.heck)}</p>`:""}${S.react&&(S.phase==="right"||S.phase==="end")?`<p class="qs-heck">${esc(S.react)}</p>`:""}</div>`;
    let body="";
    if(S.phase==="intro")body=`<div class="qs-foot"><button class="btn primary" data-qs="introNext">${S.step>=S.intro.length-1?"Let's go! ▸":"Next ▸"}</button></div>`;
    else if(S.phase==="end"){body=`<div class="qs-end"><p class="qs-amt ${S.amt?"":"zero"}">${S.amt?"+"+fmt(S.amt):"฿0"}</p>${S.post?`<p class="meta center">${esc(S.post)}</p>`:""}${S.fact&&m.how==="lose"?`<p class="qs-fact">💡 ${esc(S.fact)}</p>`:""}<p class="meta center">${esc(this.fill(QSL.bye))}</p><div class="qs-foot"><button class="btn primary" data-qs="close">Back to camp ▸</button></div></div>`;}
    else if(Q){const ord=S.phase==="right"?S.lastOrd:m.ord,cut=m.cut||[],live=S.phase==="q";
      const info=S.phase==="right"?`<div class="qs-info"><span>Cleared <b>${k}</b>/20</span><span>Holding <b class="goldt">${fmt(m.bank)}</b></span></div>`:`<div class="qs-info"><span>Question <b>${k+1}</b>/20</span><span>for <b class="goldt">${fmt(QS_LAD[k])}</b></span><span>${k?`Holding ${fmt(m.bank)}`:""}${QS_SAFE.some(i=>i<k)?` · safe ${fmt(qsSafe(k))}`:""}</span></div>`;
      const tot=QS_TIME[t]*1000,lf=S.left||0;
      const timer=S.phase==="q"||S.phase==="phone"||S.phase==="call"||S.phase==="quitask"?`<div class="qs-time ${S.phase!=="q"?"pause":""}"><i style="width:${Math.max(0,lf/tot*100)}%"></i><b>${Math.ceil(lf/1000)}</b></div>`:"";
      const opts=`<div class="qs-opts">${ord.map((oi,d)=>{const c=[cut.includes(d)?"cut":"",S.sel===d&&S.phase==="lock"?"lock":"",(S.phase==="right"||S.phase==="end")&&d===S.rightD?"right":"",S.phase==="end"&&S.sel===d&&d!==S.rightD?"bad":""].join(" ");
        return `<button class="qs-o ${c}" data-qs="ans" data-v="${d}" ${!live||cut.includes(d)?"disabled":""}><i>${QS_ABC[d]}</i><span>${cut.includes(d)?"":esc(Q.o[oi])}</span>${m.aud&&!cut.includes(d)&&S.phase!=="right"?`<em style="--p:${m.aud[d]}%">${m.aud[d]}%</em>`:""}</button>`;}).join("")}</div>`;
      const hint=m.hint&&S.phase==="q"?`<p class="qs-hint">📞 ${esc((SPK[m.hint.id]||{name:"Coach Daeng"}).name)}: ${QS_ABC[m.hint.x]}${m.hint.p?` (${m.hint.p}%)`:""}</p>`:"";
      let ctl="";
      if(S.phase==="q")ctl=`<div class="qs-life"><button class="qs-l" data-qs="cut" ${m.used.c?"disabled":""}>✂️<small>Cut to 2</small></button><button class="qs-l" data-qs="aud" ${m.used.a?"disabled":""}>📣<small>Ask the audience</small></button><button class="qs-l" data-qs="phone" ${m.used.p?"disabled":""}>📞<small>Phone a friend</small></button><button class="qs-l stop" data-qs="quit">🏳️<small>${k?`Stop, take ${fmt(m.bank)}`:"Go home"}</small></button></div>`;
      if(S.phase==="quitask")ctl=`<div class="qs-foot"><button class="btn" data-qs="quitNo">Keep going!</button><button class="btn primary" data-qs="quitYes">Take ${fmt(m.bank)} home</button></div>`;
      if(S.phase==="right")ctl=`${S.safe?`<p class="qs-safe">🛡️ ${esc(S.safe)}</p>`:""}${S.fact?`<p class="qs-fact">💡 ${esc(S.fact)}</p>`:""}<div class="qs-foot"><button class="btn primary" data-qs="go">Next question for ${fmt(QS_LAD[k])} ▸</button></div><p class="meta center">Want to stop? Tap 🏳️ on the next question — you are holding ${fmt(m.bank)}</p>`;
      if(S.phase==="phone")ctl=`<div class="qs-phone"><p class="meta center">Who will you call? (the clock stops while you talk)</p><div class="qs-fr">${this.friends().map(id=>`<button class="qs-f" data-qs="call" data-v="${id}"><img src="${faceSrc(id,"happy")}" alt=""><small>${esc((SPK[id]||{name:"Coach Daeng"}).name)}</small></button>`).join("")}</div><div class="qs-foot"><button class="btn ghost" data-qs="phoneBack">Never mind</button></div></div>`;
      if(S.phase==="call"){const c=S.call,nm=(SPK[c.id]||{name:"Coach Daeng"}).name,last=S.callI>=c.lines.length-1;ctl=`<div class="qs-callbox"><img src="${faceSrc(c.id,S.callI===c.lines.length-2?"happy":"flustered")}" alt=""><div><small>📞 ${esc(nm)}</small><p>${esc(c.lines[S.callI])}</p></div></div><div class="qs-foot"><button class="btn primary" data-qs="callNext">${last?"Hang up ▸":"Next ▸"}</button></div>`;}
      body=`${info}${timer}<div class="qs-q"><p>${esc(Q.q)}</p></div>${hint}${opts}${ctl}`;}
    el.innerHTML=`<div class="qs-wrap"><div class="qs-main"><div class="qs-top"><span class="qs-air">● ON AIR</span><h2>Ultimate Fan<br><b>Seven Mortars Muay</b></h2><span class="qs-fm">FM 99.7</span></div>${stage}${say}${body}</div>${lad}</div>`;
    S.shake=0;const on=el.querySelector('.qs-lad li.on');if(on&&getComputedStyle(el.querySelector('.qs-lad')).flexDirection==='row-reverse'){const L=on.parentElement;L.scrollLeft=on.offsetLeft-L.clientWidth/2+on.clientWidth/2;}}
};
const qsTier=k=>k<5?0:k<10?1:k<15?2:3;
const qsSafe=k=>{let s=0;for(const i of QS_SAFE)if(i<k)s=QS_LAD[i];return s;};

/* v1.91.153 (Man): the contestant talks back — a sigh, a mutter, a jab at Pa Piak, under the host's line */
const QS_ME={
 q:["(I've read about this one… while waiting for a fighter to go on)","(Breathe deep, the way Kru Daeng taught… in… out…)","(Why are the studio lights hotter than the ring lights?)","(Kru Daeng must be listening on the radio — don't blow it)","(Focus… it's not an exam, it's only a hundred thousand baht)"],
 qh:["Wait wait wait — is the clock running faster than usual, Pa?!","Pa, don't talk yet, give me one second!","(My mind's as blank as a fresh hand wrap)"],
 lock:["Locked in… you don't have to drag it out that long, Pa.","(My heart's pounding harder than at a belt fight)","Pa… please, don't make the sad face before the reveal.","(If this is wrong, Kati will tease me for a month)"],
 right:["Phew… survived another one.","Pa always does the sad voice before the reveal. My heart can't take it!","Correct! Pork barbecue for the whole camp when I get back!","(Grinning so wide my gums are drying out)","Kru Daeng! Did you hear that! Right again!"],
 cut:["Down to two… still a headache, though.","(The two that are left look exactly the same)"],
 aud:["Let's ask the audience… hope it isn't a rival camp's cheering section tonight.","(Why is the front row smirking like that?)"],
 phone:["Using a lifeline… please pick up.","(Praying they're not in the middle of training)"],
 quitask:["(Money in hand… or a bird in the bush… why does Pa have to ask now?)"],
 win:["Is this real… somebody pinch me!","A hundred thousand! New heavy bags for the whole camp!"],
 lose:["(Long sigh) Kru Daeng is going to tease me about this all year.","Phew… never mind. At least I got to be on the radio.","This one's too brutal, Pa! Who wrote these questions?!"],
 quit:["That's enough for today. The camp still has an electricity bill.","(Walking out of the studio like a winner… even without the hundred grand)"]};
{const _d=QS.draw;QS.draw=function(){_d.call(this);try{const S=this.st,m=this.m();if(!S||!m)return;
  const used=m.used||{};const key=S.phase==="end"?(m.how||"lose"):S.phase==="q"?(S.hurried?"qh":used.c&&!S.myC?"cut":used.a&&!S.myA?"aud":"q"):S.phase;
  if(key==="cut")S.myC=1;if(key==="aud")S.myA=1;
  const kk=key+"|"+(m.k||0);
  if(kk!==S.myK){S.myK=kk;const L=QS_ME[key];S.my=L&&(key!=="q"||Math.random()<.45)?L[Math.floor(Math.random()*L.length)]:null;}
  if(!S.my)return;const box=document.querySelector("#qshow .qs-say");if(!box||box.querySelector(".qs-my"))return;
  const p=document.createElement("p");p.className="qs-my";const b=document.createElement("b");b.textContent=`${ME(G)}: `;p.appendChild(b);p.appendChild(document.createTextNode(S.my));box.appendChild(p);}catch(e){}};}

/* v1.91.155 (Man): phone calls and Pa Piak's jokes play as ordinary story cutscenes (the show steps aside, then comes back) */
const QS_CUT=(steps,done,bg)=>{try{const S=QS.st;if(S){S.log=S.log||[];for(const x of steps){if(!x.t||typeof x.t!=="string")continue;const who=x.n==="npc"?x.who:x.n==="me"?""+ME(G):x.n==="nar"?"":x.n==="coach"?"Coach Daeng":((SPK[x.n]||{}).name||"");if(who&&who!==QS_HOST)S.log.push({who,t:x.t,c:x.n==="me"?"m":"f"});}}}catch(e){}document.body.classList.add("qs-cutting");   /* the show dims behind; the scene's own background is hidden */
  const back=()=>{document.body.classList.remove("qs-cutting");QS.arm();done&&done();};
  try{playScene(steps,back,{bg:bg||"tvstudio",look:"casual"});}catch(e){console.error("qs cut",e);back();}};
const QS_PICK=a=>a[Math.floor(Math.random()*a.length)];
const QS_TEASE=["Before I reveal it… you said “{c}”, {n} — how sure are you? Ten out of ten?","“{c}”… the whole crew backstage just went silent","{n}, if this one's wrong… don't worry, Pa has smelling salts ready","Let me look at your face, {n}… hmm… a face like that… I can't read it at all","“{c}”, then… not changing? Locked in? Sure? …Just kidding, you can't change it now"];
const QS_ME_TEASE=["Confident… about half.","Pa, just reveal it, please","(Nods, legs shaking)","Ten out of ten! …Nine and a half, fine.","Pa, stop looking at me like that!"];
const QS_DRAG=["The correct answer is… da… da-da… da-da-da-da-da…","Easy now, {n}… da-da-da-da-da… da-da-da-da…","Your answer, {n}… is… (holds his breath for three seconds) …da-da-da-da…","Everyone at home, hold your breath with me… da… da… da-da-da-da-da-da…","No sound effects budget — Pa does them himself… da-da-da-da-da… DUN!"];
{const _d=QS.draw;QS.draw=function(){const S=this.st,m=this.m();
  if(S&&m&&S.phase==="call"&&S.call&&!S.callScene){S.callScene=1;const c=S.call,n=c.lines.length,nm=(SPK[c.id]||{name:"Coach Daeng"}).name;
    const say=(t,i)=>c.id==="coach"?{n:"coach",t}:{n:c.id,f:i===n-2?"happy":i===0?"surprised":"flustered",l:"casual",t};
    QS_CUT([{n:"nar",t:`📞 Ring… ring… calling ${nm} at Sirichai camp`},...c.lines.map(say)],()=>{if(this.st!==S)return;S.callScene=0;S.callI=n-1;this.act("callNext");});_d.call(this);return;}
  _d.call(this);
  /* v1.91.156 (Man): the middle box is a running log — host lines, jabs, the contestant's mutters and each result */
  if(S&&m){S.log=S.log||[];const add=(who,t,c)=>{if(!t)return;const L=S.log,last=L[L.length-1];if(last&&last.t===t)return;L.push({who,t,c:c||""});if(L.length>30)L.shift();};
    if(S.say!==S.lgSay){S.lgSay=S.say;add(QS_HOST,S.say,"h");}
    if(S.heck&&S.heck!==S.lgHeck){S.lgHeck=S.heck;add("Audience",S.heck,"a");}
    if(S.react&&S.react!==S.lgReact){S.lgReact=S.react;add(QS_HOST,S.react,"h");}
    if(S.my&&S.my!==S.lgMy&&S.phase!=="right"&&S.phase!=="end"){S.lgMy=S.my;add(""+ME(G),S.my,"m");}
    const rk=S.phase+"|"+(m.k||0);if((S.phase==="right"||S.phase==="end")&&S.lgRes!==rk){S.lgRes=rk;const how=S.phase==="end"?(m.how||"lose"):"right";
      add("Result",how==="right"?`✓ Right · passed question ${m.k} · in hand ${fmt(m.bank)}`:how==="win"?`🏆 All 20 questions! ${fmt(S.amt||0)}`:how==="quit"?`🏳 Walked away · took ${fmt(S.amt||0)}`:`✗ Wrong · going home with ${fmt(S.amt||0)}`,how==="right"||how==="win"?"r":"x");}
    const box=document.querySelector("#qshow .qs-say");if(box){box.classList.add("qs-log");box.innerHTML=`<small>${QS_HOST} · show log</small><div class="qs-logl">${S.log.slice(-6).map(e=>`<p class="lg-${e.c}"><b>${esc(e.who)}:</b> ${esc(e.t)}</p>`).join("")}</div>`;const l=box.querySelector(".qs-logl");if(l)l.scrollTop=l.scrollHeight;}}
  /* every reveal is a cutscene: Pa Piak drags it out, then right or wrong, his jab if he has one, and the contestant's answer */
  if(S&&m&&(S.phase==="right"||S.phase==="end")&&S.revK!==S.phase+"|"+(m.k||0)){S.revK=S.phase+"|"+(m.k||0);
    const key=S.phase==="end"?(m.how||"lose"):"right",H=(img,t)=>({n:"npc",who:QS_HOST,img:"qhost_"+img,t}),steps=[];
    const Q=S.lastQ,od=S.lastOrd,ch=Q&&od&&S.sel>=0&&S.sel!=null?`${QS_ABC[S.sel]}. ${Q.o[od[S.sel]]}`:"";
    if(key!=="quit"&&ch&&Math.random()<.65){steps.push(H("suspense",QS_PICK(QS_TEASE).replace(/\{n\}/g,ME(G)).replace(/\{c\}/g,ch)));steps.push({n:"me",t:QS_PICK(QS_ME_TEASE)});}
    if(key!=="quit")steps.push(H("suspense",QS_PICK(QS_DRAG).replace(/\{n\}/g,ME(G))));
    if(S.say)steps.push(H(S.host||"smile",S.say));if(S.react)steps.push(H(S.host||"smile",S.react));
    const L=QS_ME[key];if(L)steps.push({n:"me",t:QS_PICK(L)});
    setTimeout(()=>{if(this.st===S)QS_CUT(steps,()=>{if(this.st===S)this.draw();});},350);}};}

/* v1.91.156 (Man): the opening monologue and the audience heckle are cutscenes too (the clock is stopped while they play) */
{const _d=QS.draw;QS.draw=function(){const S=this.st,m=this.m();
  if(S&&m&&S.phase==="intro"&&S.intro&&!S.introScene&&S.step===0){S.introScene=1;_d.call(this);
    const steps=S.intro.map((t,i)=>({n:"npc",who:QS_HOST,img:"qhost_"+(i===S.intro.length-1?"correct":i===0?"excited":"smile"),t:this.fill(t)}));
    setTimeout(()=>{if(this.st===S)QS_CUT(steps,()=>{if(this.st!==S||S.phase!=="intro")return;S.step=S.intro.length-1;this.act("introNext");});},250);return;}
  _d.call(this);};}
{const _a=QS.act;QS.act=function(a,v){const S=this.st,m=this.m(),was=m&&m.used&&m.used.a;_a.call(this,a,v);
  if(a==="aud"&&S&&m&&!was&&m.used.a&&S.phase==="q"&&S.heck){this.stopTimer();const i=S.heck.indexOf(": ");const who=i>0?S.heck.slice(0,i):"Audience",t=i>0?S.heck.slice(i+2):S.heck;
    const steps=[{n:"nar",t:"📣 The mic goes out to the audience…"},{n:"npc",who,t},{n:"npc",who:QS_HOST,img:"qhost_excited",t:QS_PICK(QS_AUDC)},{n:"me",t:QS_PICK(QS_ME.aud)}];
    QS_CUT(steps,()=>{if(this.st===S&&S.phase==="q"){this.draw();this.startTimer();}});}};}
const QS_AUDC=["You heard it loud and clear — expert opinion from the front row!","The voice of the people is the voice of heaven… sometimes a heaven that's lost its way.","Thank you! The crew will send you a bottle of water."];
