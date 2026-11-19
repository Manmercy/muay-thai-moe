// ================= MUAY THAI MOE v1.2 — CHARACTER DATA, DATES, CHATTER, HAPPENINGS, COMMENTARY =================
const PROFILES={
 kati:{age:21,height:"163 cm",blood:"O",bday:"April 13",home:"Born in the same district as the camp",heritage:"Tha Sao style (suggested)",
  personality:"Fighting spirit, straightforward, cheerful, but hot-headed and pushes too hard when behind",
  likes:["Chicken khao soi from Auntie Daeng's","Training before dawn, before the roosters crow","The sound of the pi chawa during wai khru"],
  dislikes:["Giving up halfway","Cilantro","Quiet cafes where you have to sit still"],
  hobby:"Collects a sticker from every venue she fights at and sticks them on her glove box",
  story:"An orphan Grandpa Chai took in at 8 after he saw her fighting boys who were bullying her friend. He told her: 'Good fists, but use them in the right place.'",
  secret:"Still keeps the first gloves Grandpa bought her under her pillow, and talks to them every night before bed"},
 mali:{age:20,height:"152 cm",blood:"B",bday:"May 2",home:"A seaside province in the south",heritage:"Chaiya style (suggested)",
  personality:"Warm, easy to get along with, chatty, but keeps her family worries to herself",
  likes:["Night markets","Khanom khrok and mango sticky rice","Frangipani flowers"],
  dislikes:["Long silences","Being called a kid","Temples at night (scared of ghosts)"],
  hobby:"Strings flower garlands for everyone in camp",
  story:"Her father was a temple-fair fighter who died when she was 14. She sends money to her mother and three younger siblings every month",
  secret:"Cries in secret after every win, because she wishes her father could see"},
 rin:{age:24,height:"170 cm",blood:"A",bday:"September 9",home:"Bangkok, moved north for university",heritage:"Lopburi style (suggested)",
  personality:"Blunt, logical, shows care through actions more than words, thinks long before deciding",
  likes:["Black coffee, no sugar","Nicely color-coded spreadsheets","Quiet places like temples or libraries"],
  dislikes:["Crowded places","People who exaggerate","Unnecessary risks"],
  hobby:"Edits fight-analysis clips for her channel with 312 subscribers",
  story:"Sports science graduate, formerly an analyst at Golden Tiger Camp. She quit because the owner made fighters fight while injured",
  secret:"Was knocked out in front of her family in her first fight. Since then she fears big stages and tries to calculate everything so it never happens again"},
 ploy:{age:26,height:"175 cm",blood:"AB",bday:"January 1",home:"Nakhon Ratchasima",heritage:"Korat style (suggested)",
  personality:"Gifted from birth, calm, disciplined, protective of juniors, but has never known what losing feels like",
  likes:["Quiet temples in the morning","Hot tea","Punctuality"],
  dislikes:["Crowded markets","People who break appointments","People who look down on juniors"],
  hobby:"Hand-sews hand wraps for every junior herself",
  story:"First fought at ten, knockout in round one. Every coach in Korat called her a prodigy. Unbeaten in Division A for three years, now captain of Golden Tiger carrying the whole junior squad",
  secret:"At 15, Grandpa Chai sent her a letter inviting her to Sirichai Camp. She still keeps that letter"},
 fah:{age:22,height:"166 cm",blood:"B",bday:"October 31",home:"A wooden house by the Ping River (rarely talks about it)",heritage:"Modern aggressive style",
  personality:"Sharp-tongued, loves a challenge, overconfident, but actually sensitive and afraid of being abandoned",
  likes:["Isan sausage","Grandma's old motorbike","Turning everything into a contest"],
  dislikes:["Being pitied","Lots of rules","Places where you must be prim, like temples"],
  hobby:"Draws tiger tattoo designs in her sketchbook",
  story:"Raised by her grandma alone. Grandma took her to get a leaping-tiger sak yant at fifteen, saying tigers mean protection, not ferocity",
  secret:"Terrified of thunder, even though her name means 'sky'"},
};
const COACH={name:"Coach Daeng",color:"#c98a5a"};
// unlock thresholds (bond)
const UNLOCK={blood:15,bday:15,hobby:15,personality:25,story:45,likesAll:55,dislikesAll:70,secret:80};

// ---------- DATES ----------
const ACTIVITIES={
  eat:{name:"Khao soi at Auntie Daeng's",cost:200,bg:"food",intro:["Auntie Daeng's khao soi shop is packed like every evening; you can smell the roasted chili from down the street","Auntie Daeng calls out from the door: \"Oh! The Sirichai crew is here. Your usual table, dear\""]},
  market:{name:"Saturday night market stroll",cost:300,bg:"fair",intro:["The walking street glows with orange lights, the sound of a seung and the smell of grilled food drifting by","The market is extra busy tonight; a busking band is playing at the head of the street"]},
  temple:{name:"Making merit at the temple near camp",cost:0,bg:"temple",intro:["The temple grounds are calm; only the wind chimes on the chapel eaves can be heard","The sun has just set; candlelight in the hall glints off the golden Buddha"]},
  cafe:{name:"Cafe and fight replays",cost:250,bg:"cafe",intro:["A tiny alley cafe with plugs at every table, perfect for long fight-tape sessions","The smell of light-roast coffee drifts by; the shop TV plays Muay Thai on mute"]},
  river:{name:"Evening bike ride along the river",cost:100,bg:"river",intro:["A cool breeze blows along the riverside bike path as the sky turns orange","Kids chase each other on the bank; someone is fishing under the bridge"]},
  jog:{name:"Morning run around the reservoir",cost:0,bg:"river",intro:["Mist still hangs over the reservoir; running shoes thud on the dirt path in rhythm","Dawn is just breaking; the patongo uncle is heating his wok for the runners"]},
  cat:{name:"Feed the cats behind the temple",cost:0,bg:"temple",intro:["Five tabby cats wait by the monks' quarters as if they know the time","A fat orange cat rolls on a haystack behind the temple and jumps up at the sound of a snack bag"]},
  stars:{name:"Stargaze on the camp roof",cost:0,bg:"camp",campOnly:true,intro:["All the camp lights are off; on the tin roof there's just a cool breeze and a sky full of stars","An old mat spread on the roof, a thermos of hot tea beside it"]},
  cook:{name:"Make som tam together at camp",cost:0,bg:"camp",campOnly:true,intro:["Grandpa Chai's big wooden mortar comes out of the kitchen; the pounding echoes down the whole lane","Two papayas from the tree behind camp are being shredded into strips"]},
  spar:{name:"One-on-one extra training",cost:0,bg:"camp",campOnly:true,intro:["Classes are done; only the fan and a still-swinging heavy bag remain","The gym lights are half on, just enough to see shadows on the ring"]},
};
// v1.88: date spots that open with the heart level (♥Lv.12 / 14 / 17) — content only, no gameplay effect
Object.assign(ACTIVITIES,{
  fairnight:{name:"Night temple fair",cost:400,bg:"fair",heart:12,intro:["The annual temple fair glows in rainbow lights. The Ferris wheel turns slowly and lam tat singing drifts from the stage behind the hall","Dart stalls, cork-gun stalls and the smell of grilled squid all at once. So crowded you have to walk shoulder to shoulder"]},
  boat:{name:"Sunset boat ride",cost:800,bg:"river",heart:14,intro:["A small longtail boat pulls away from the pier. The orange-violet sky glows on the water and the far bank's chedi lights up","A cool river breeze. The boatman cuts the engine mid-stream and lets the boat drift"]},
  country:{name:"Day trip to the rice fields",cost:1200,bg:"farm",heart:17,intro:["A songthaew drops you in a village among the fields. Green rice stretches to the hills, with a wooden hut by the paddy dyke","The smell of straw and charcoal smoke on the wind. Kids pedal past along the dykes"]},
  bangsaen:{name:"Day trip to Bang Saen beach",cost:1500,bg:"sea",heart:15,intro:["The van pulls up at Bang Saen. Rows of colourful umbrellas under the casuarinas, and the sea breeze carries the smell of grilled squid","Clear blue water, little fishing boats far out, and Khao Sam Muk standing at the end of the bay"]},
  khaoyai:{name:"Overnight at Khao Yai for the sunrise fog",cost:2500,bg:"mountain",heart:18,intro:["5:30 a.m. at a Khao Yai viewpoint. Cold enough to see your breath, and a sea of fog fills the valley below","The eastern sky turns pink and gold. Somewhere in the forest a hornbill beats past"]},
  ayutthaya:{name:"Cycling the old temples of Ayutthaya",cost:1800,bg:"ayutthaya",heart:22,intro:["The train pulls into Ayutthaya in the afternoon. Two rental bikes carry you into the old city, red-brick chedis standing quiet in the golden light","Wind moves through the ruins and bicycle bells ring faintly. Rows of stone Buddhas have watched this place for centuries"]},
  amphawa:{name:"Amphawa floating market and the fireflies",cost:2200,bg:"amphawa",heart:26,intro:["Amphawa at dusk. Noodle boats drift past and lights from the canal-side houses shimmer on the water","When it's fully dark a small boat takes you down a narrow canal. The mangroves blink with thousands of fireflies, like stars that fell into the trees"]}});
const HEART_SPOT={
 kati:{ fairnight:[[{n:"kati",f:"happy",l:"casual",t:"Manager! That dart stall. I've been after that teddy bear for three years and never won it"},{n:"nar",t:"Kati throws ten darts. Two balloons pop; the other eight stick in the stall's sign"},{n:"kati",f:"pout",l:"casual",t:"The darts are bent! Not my aim!"},{choice:[{t:"Let me try",fx:G=>{},then:[{n:"nar",t:"You win the smallest bear in the stall. Kati hugs it all night"},{n:"kati",f:"flustered",l:"casual",t:"…It's tiny but it's my favourite. I'm calling it Jab Junior"}]},{t:"Your fists are more accurate than darts",fx:G=>{},then:[{n:"kati",f:"happy",l:"casual",t:"True! To the punching machine!"},{n:"nar",t:"The machine shows the night's top score. The stall owner hurriedly closes up"}]}]}],[{n:"nar",t:"At the far end of the fair there's a makeshift ring. Two young fighters are doing their wai khru"},{n:"kati",f:"happy",l:"casual",t:"I fought at a fair like this when I was fourteen. Won three hundred baht"},{n:"kati",f:"flustered",l:"casual",t:"I spent it on my first red-and-white hair cord… Grandpa said 'You bought something you can wear in the ring. Good'"},{n:"nar",t:"Kati cheers for the kid in the red corner until she's hoarse, though she's never met them"}],[{n:"nar",t:"The Ferris wheel stops with your car right at the top"},{n:"kati",f:"happy",l:"casual",t:"You can see our camp's roof from up here! There, where one light's still on"},{n:"kati",f:"pout",l:"casual",t:"Kru Daeng forgot the light again… you have to tell him off about the bill this month"},{n:"kati",f:"flustered",l:"casual",t:"…It's kind of nice though. From up here you can tell where home is"}]],
 boat:[[{n:"kati",f:"happy",l:"casual",t:"Manager! Standing on a boat is perfect balance training. I'm standing till we dock!"},{n:"nar",t:"Five minutes later Kati is sitting down, hugging a post, pale"},{n:"kati",f:"sad",l:"casual",t:"…My balance is fine. My stomach isn't"},{choice:[{t:"Lean on my shoulder",fx:G=>{},then:[{n:"kati",f:"flustered",l:"casual",t:"…Just till we dock. Just till then"}]},{t:"Look at the horizon, it helps",fx:G=>{},then:[{n:"kati",f:"happy",l:"casual",t:"It actually helps… how do you know these things?"}]}]}],[{n:"nar",t:"The sun sinks behind the chedi. Kati is quiet for unusually long"},{n:"kati",f:"happy",l:"casual",t:"It sets right there every day, but I never stop to watch. This is evening training time"},{n:"kati",f:"flustered",l:"casual",t:"Today's my first skipped session in years… if Kru Daeng asks, say it was your orders"}]],
 country:[[{n:"kati",f:"happy",l:"casual",t:"When I was small I ran around fields like this every evening, before I moved in with Grandpa"},{n:"kati",f:"happy",l:"casual",t:"Race you along the dyke? First to the hut wins!"},{n:"nar",t:"Kati takes a big lead, then slips into the paddy with a splash, mud up to her knees"},{n:"kati",f:"pout",l:"casual",t:"…Doesn't count! The dyke cheated!"},{choice:[{t:"Reach down and pull her out",fx:G=>{},then:[{n:"nar",t:"Kati takes your hand, then tugs. You go into the mud too"},{n:"kati",f:"happy",l:"casual",t:"Now it's a draw!"}]},{t:"Take a photo first",fx:G=>{},then:[{n:"kati",f:"angry",l:"casual",t:"Manager!! Delete it! …and send me a copy"}]}]}],[{n:"nar",t:"The farmer's selling this year's new rice. Kati hoists a fifteen-kilo sack onto her shoulder like it's nothing"},{n:"kati",f:"happy",l:"casual",t:"Weight training! New rice smells the best. I'm cooking it for the whole camp tonight"},{n:"kati",f:"flustered",l:"casual",t:"…Grandpa bought rice here every year. Today feels like I'm introducing you to him"}]],
 bangsaen:[[{n:"kati",f:"happy",l:"casual",t:"The sea!! Manager, I haven't seen the sea since Grandpa brought me when I was thirteen!"},{n:"kati",f:"happy",l:"casual",t:"Running on sand is the best leg training. Grandpa said so. One lap of the beach first!"},{n:"nar",t:"Kati sprints to the end of the beach and back, panting and grinning, sand up to her knees"},{choice:[{t:"No training today. Let's swim",fx:G=>{},then:[{n:"nar",t:"Kati splashes you first, then laughs so hard she swallows seawater"},{n:"kati",f:"flustered",l:"casual",t:"So salty! …But fun. The most fun all year"}]},{t:"Do another lap, I'll time you",fx:G=>{},then:[{n:"kati",f:"pout",l:"casual",t:"Manager! It's a day off!"},{n:"nar",t:"She runs another lap anyway, three seconds faster than the first"}]}]}],[{n:"nar",t:"The beach stall brings steamed blue crab and baked mussels. Kati eyes them like an opponent"},{n:"kati",f:"happy",l:"casual",t:"I'll take this crab on myself! …I mean, crack it myself"},{n:"kati",f:"sad",l:"casual",t:"When I was thirteen Grandpa brought me here after my first win. He ordered one crab and gave all of it to me. He just ate rice"},{n:"kati",f:"flustered",l:"casual",t:"Today I ordered two. One's yours. Don't you dare give it to me"}]],
 khaoyai:[[{n:"kati",f:"flustered",l:"casual",t:"Cold… I've never been this cold. Manager, lend me a sleeve"},{n:"nar",t:"The first light clears the ridge and the whole valley of fog turns gold. Kati goes quiet for a long time"},{n:"kati",f:"sad",l:"casual",t:"Grandpa always said he'd bring me to see a sea of fog someday. The camp never had enough money"},{n:"kati",f:"happy",l:"casual",t:"I made it, Grandpa. …With someone you'd definitely like"},{choice:[{t:"Let's come back next year",fx:G=>{},then:[{n:"kati",f:"happy",l:"casual",t:"Promise! Every year, until the fog gets sick of us"}]},{t:"I think he can see it",fx:G=>{},then:[{n:"kati",f:"flustered",l:"casual",t:"…Yeah. I think so too"}]}]}],[{n:"nar",t:"On the way down, a troop of monkeys lines the road. One stares fixedly at the snack bag in Kati's hand"},{n:"kati",f:"angry",l:"casual",t:"Don't you dare! That bag's for the manager! My guard is up!"},{n:"nar",t:"The monkey snatches it in one move, faster than Kati's counter"},{n:"kati",f:"pout",l:"casual",t:"…It read my timing. That monkey should be fighting instead of me"}]],
 ayutthaya:[[{n:"kati",f:"happy",l:"casual",t:"Manager! Race you to that chedi!"},{n:"nar",t:"Kati pedals way ahead, then brakes hard at the Buddha head held in tree roots. She gets off and raises her hands to wai"},{n:"kati",f:"sad",l:"casual",t:"Grandpa told me early muay thai came from this city. Fighters back then fought to protect home, not for belts"},{n:"kati",f:"happy",l:"casual",t:"I think I finally get why he loved telling me that"}],[{n:"nar",t:"At the evening market by the temple Kati spots a roti sai mai stall and joins the queue, eyes shining"},{n:"kati",f:"happy",l:"casual",t:"Real roti sai mai has to be from Ayutthaya! Three packs. One for you, one for Grandpa… and one for me"},{n:"kati",f:"flustered",l:"casual",t:"…Honestly I'll eat Grandpa's too. He won't mind"}]],
 amphawa:[[{n:"nar",t:"Fireflies blink all around the boat. Kati is unusually still, hands gripping the gunwale"},{n:"kati",f:"flustered",l:"casual",t:"…Manager, I've never seen something this beautiful and this quiet. Usually when things are pretty I jump around"},{n:"kati",f:"happy",l:"casual",t:"But today I just want to sit here next to you. I've grown up, haven't I?"},{choice:[{t:"You really have",fx:G=>{},then:[{n:"kati",f:"happy",l:"casual",t:"…I still eat three packs of roti though. Some things don't need to grow up"}]},{t:"You're good however you are",fx:G=>{},then:[{n:"kati",f:"flustered",l:"casual",t:"…Say that and the fireflies will get jealous"}]}]}]]},
 mali:{ fairnight:[[{n:"mali",f:"happy",l:"casual",t:"A temple fair!! Cork-gun stall first! That elephant plush is mine!"},{n:"nar",t:"Mali fires nine corks and knocks down nine cans. The stall owner hands over the elephant looking defeated"},{n:"mali",f:"happy",l:"casual",t:"Every year as a kid I was brought to the fair and taught to aim with one eye… I still remember exactly"},{n:"mali",f:"flustered",l:"casual",t:"This elephant's for you. Its name is Mali Junior"}]],
 boat:[[{n:"mali",f:"happy",l:"casual",t:"A boat! I can row, you know. I grew up by the sea. Can I take the oars?"},{n:"nar",t:"The boatman lets her try. Mali rows dead straight, faster than the engine"},{n:"mali",f:"sad",l:"casual",t:"…The river's so much quieter than my sea. No waves"},{n:"mali",f:"happy",l:"casual",t:"But you're here, so it's not quiet~"}]],
 bangsaen:[[{n:"mali",f:"happy",l:"casual",t:"THE SEA!!!! Manager, I'm going in!"},{n:"nar",t:"Mali runs into the water fully dressed, swims way out and waves back like a fish returned home"},{n:"mali",f:"sad",l:"casual",t:"It's not as clear as at home, but it smells the same… I miss Mom"},{choice:[{t:"Film it and send it to your mom",fx:G=>{},then:[{n:"mali",f:"happy",l:"casual",t:"Sent! Mom replied 'Who's filming?' …I said someone important"}]},{t:"Swim out with her",fx:G=>{},then:[{n:"nar",t:"Mali teaches you to float southern-style and laughs every time you sink"}]}]}]],
 country:[[{n:"mali",f:"happy",l:"casual",t:"So green! Back home it's all rubber and coconut plantations. I've never seen this many paddies"},{n:"nar",t:"Mali takes off her shoes to walk the dyke and slides halfway into the paddy"},{n:"mali",f:"flustered",l:"casual",t:"…No photos! Absolutely do not send this to Fah!"}]],
 khaoyai:[[{n:"mali",f:"sad",l:"casual",t:"So cooold. I'm a southerner. My body wasn't designed for this"},{n:"nar",t:"Mali is wrapped in three blankets with only her face showing. When the first light hits the fog she goes completely quiet"},{n:"mali",f:"happy",l:"casual",t:"…It's just like a real sea, only white. My first sea on a mountain"},{n:"mali",f:"flustered",l:"casual",t:"Thank you for bringing me. Even if I can't feel my fingers"}]],
 ayutthaya:[[{n:"mali",f:"happy",l:"casual",t:"Ayutthaya!! I've wanted grilled river prawns forever. Food first, temples after~"},{n:"nar",t:"After two giant prawns each, Mali cycles around the temples, picking up fallen plumeria to thread a garland"},{n:"mali",f:"happy",l:"casual",t:"This one's for the Buddha here. Health for everyone at home, and… for you too"}]],
 amphawa:[[{n:"mali",f:"happy",l:"casual",t:"A floating market!! Like the one back home, but more boats. I'm eating from every one!"},{n:"nar",t:"When it's dark the boat slips into the firefly canal. Mali goes quiet at once and reaches out a hand for the fireflies"},{n:"mali",f:"flustered",l:"casual",t:"As a kid I was taken to see fireflies back home and told they're stars that wanted to be closer to people"},{n:"mali",f:"happy",l:"casual",t:"Today I get it. Why the stars wanted to come down"}]]},
 rin:{ fairnight:[[{n:"rin",f:"sad",l:"casual",t:"So crowded. The density is… no. I won't calculate. Today I'm having fun"},{n:"nar",t:"Three minutes later Rin is at the dart stall, explaining optimal throwing angles to the owner"},{n:"nar",t:"She throws ten darts and pops all ten balloons. The owner asks her to go play somewhere else"},{n:"rin",f:"flustered",l:"casual",t:"…I calculated a little. Sorry. This plush is for you"}]],
 boat:[[{n:"rin",f:"happy",l:"casual",t:"Current speed is… no. I'm just going to watch the sunset"},{n:"nar",t:"Rin takes off her glasses, wipes the lenses, and doesn't put them back on. The view blurs into orange"},{n:"rin",f:"happy",l:"casual",t:"Without glasses the world gets softer. No details to analyse. Just colour"},{n:"rin",f:"flustered",l:"casual",t:"…I can still see your face clearly, though. Because you're close"}]],
 bangsaen:[[{n:"rin",f:"happy",l:"casual",t:"I brought three bottles of sunscreen. SPF 50, reapply every ninety minutes"},{n:"nar",t:"Rin reads under the umbrella all afternoon, shifting with its shadow precisely every fifteen minutes"},{n:"rin",f:"flustered",l:"casual",t:"I can't swim. …Don't tell anyone. My profile says 'moderate swimmer'"},{choice:[{t:"Paddle in the shallows with me",fx:G=>{},then:[{n:"rin",f:"happy",l:"casual",t:"Knee-deep. Safe depth. …And 40% more pleasant than I predicted"}]},{t:"Keep reading. I'll sit with you",fx:G=>{},then:[{n:"rin",f:"happy",l:"casual",t:"…This is the best beach day of my life"}]}]}]],
 country:[[{n:"rin",f:"happy",l:"casual",t:"So quiet. Around… 30 decibels. I like it here"},{n:"nar",t:"Rin sits on a bamboo bench by the paddy, shoes off, feet in the water, and says nothing for almost an hour"},{n:"rin",f:"flustered",l:"casual",t:"Sorry, I didn't say a word… but that was the first hour this year my brain actually rested"}]],
 khaoyai:[[{n:"rin",f:"happy",l:"casual",t:"Dew point below air temperature overnight, high humidity, no wind. A sea of fog is guaranteed"},{n:"nar",t:"The fog fills the valley exactly as Rin predicted. But when the first light hits it, she forgets the numbers entirely"},{n:"rin",f:"flustered",l:"casual",t:"…I know exactly how this happens. I don't know why it's this beautiful"},{n:"rin",f:"happy",l:"casual",t:"Maybe some things don't need knowing. Watching them together is enough"}]],
 ayutthaya:[[{n:"rin",f:"happy",l:"casual",t:"Wat Chaiwatthanaram was built in 1630. I read three articles. …Today I'm the guide"},{n:"nar",t:"Rin narrates the history of every temple non-stop, until the last chedi, where she falls silent and sits on the stone steps"},{n:"rin",f:"flustered",l:"casual",t:"Sorry. I talked too much. When I'm excited I say facts instead of feelings"},{n:"rin",f:"happy",l:"casual",t:"The actual feeling is… I'm happy to be here with you. No article explains that"}]],
 amphawa:[[{n:"rin",f:"happy",l:"casual",t:"Fireflies flash at a frequency of about… no. I won't count"},{n:"nar",t:"Rin takes off her glasses, letting the fireflies blur into a thousand gold dots, and slowly leans on your shoulder"},{n:"rin",f:"flustered",l:"casual",t:"…For the last three minutes I haven't thought about numbers at all. New record"}]]},
 ploy:{ fairnight:[[{n:"ploy",f:"sad",l:"casual",t:"So crowded… I don't like places like this. But you asked, so I'm here"},{n:"nar",t:"A group of kids recognise Ploy and run up for autographs. She signs for every one and shows each of them how to hold a guard"},{n:"ploy",f:"happy",l:"casual",t:"…The ring toss. I've never played. Can I try?"},{n:"nar",t:"Ploy lands ten rings out of ten, wearing her fight face the whole time"},{n:"ploy",f:"flustered",l:"casual",t:"…That was fun. Don't tell the juniors I said that"}]],
 boat:[[{n:"ploy",f:"happy",l:"casual",t:"It's quiet. Nobody knows me on a boat"},{n:"nar",t:"Ploy sits upright as if waiting for the bell, then lets her shoulders drop a little at a time as the light fades"},{n:"ploy",f:"flustered",l:"casual",t:"…I just realised I've never watched a sunset all the way through"}]],
 bangsaen:[[{n:"ploy",f:"happy",l:"casual",t:"The sea… every time I've been to the beach it was for sand-running camp. Never for fun"},{n:"nar",t:"Ploy's watch alarm goes off at 3 p.m., her training time. She stares at it a long while, then takes it off and puts it in her bag"},{n:"ploy",f:"flustered",l:"casual",t:"…Today I'm not a captain. I'm just at the sea with you"},{n:"nar",t:"Ploy walks barefoot along the waterline, slowly. The first time you've ever seen her walk slowly"}]],
 country:[[{n:"ploy",f:"happy",l:"casual",t:"Fields like this look like home in Korat. As a kid I ran the dykes every morning with my father"},{n:"ploy",f:"flustered",l:"casual",t:"He said dyke running was the best balance training. …Run with me? Not fast"},{n:"nar",t:"You run behind Ploy along the dykes. Every ten strides she glances back to check you're still there"}]],
 khaoyai:[[{n:"ploy",f:"happy",l:"casual",t:"Khao Yai's in Korat, you know. My home. Every birthday my father brought me up here to see the fog"},{n:"nar",t:"Ploy knows a viewpoint tourists don't. She leads you down a narrow forest trail in the dark"},{n:"ploy",f:"flustered",l:"casual",t:"Since I moved to Golden Tiger I haven't been back. This is the first time I've come with anyone else"},{n:"ploy",f:"happy",l:"casual",t:"…The fog hasn't changed. I have. For the better"}]],
 ayutthaya:[[{n:"ploy",f:"happy",l:"casual",t:"Ayutthaya… the old capital, where every fighter dreamed of fighting before the king"},{n:"nar",t:"Ploy cycles slowly, never once speeding up. At every chedi she stops and raises her hands to wai, deliberately"},{n:"ploy",f:"flustered",l:"casual",t:"…I haven't ridden a bike for fun since I was ten. After that bikes were training equipment"},{n:"ploy",f:"happy",l:"casual",t:"Today it's just a bike, with two ordinary people. That's nice"}]],
 amphawa:[[{n:"ploy",f:"happy",l:"casual",t:"The market's crowded… but on a boat it's fine. No one pushing"},{n:"nar",t:"The boat turns into the firefly canal. Ploy sits upright as always, then slowly leans against you as the first fireflies blink"},{n:"ploy",f:"flustered",l:"casual",t:"…Just leaning a little. Not tired. Just want to lean"}]]},
 fah:{ fairnight:[[{n:"fah",f:"happy",l:"casual",t:"Temple fair!! I challenge you at every stall! Punching machine first!"},{n:"nar",t:"Fah punches the machine to the night's top score, then turns to you with a smug grin"},{n:"fah",f:"happy",l:"casual",t:"Your turn! Under half my score and you're buying me three bags of candy floss!"},{choice:[{t:"Punch with everything",fx:G=>{},then:[{n:"nar",t:"Exactly half of Fah's. She argues you're one point short"},{n:"fah",f:"flustered",l:"casual",t:"…Fine. No need. Just one bag. We'll share"}]},{t:"Concede and buy the candy floss",fx:G=>{},then:[{n:"fah",f:"pout",l:"casual",t:"You didn't even try!! …Pink candy floss though. I like pink. Tell no one"}]}]}]],
 boat:[[{n:"fah",f:"happy",l:"casual",t:"This boat's too slow!! Uncle, can I steer?"},{n:"nar",t:"The boatman shakes his head. Fah sulks with folded arms, then slowly goes quiet as the sky turns orange"},{n:"fah",f:"flustered",l:"casual",t:"…Grandma used to take the ferry every evening to sell sausages on the other bank. I watched the sunset from her lap"},{n:"fah",f:"happy",l:"casual",t:"Haven't been on a boat like this in ages… I'm not getting emotional! It's windy. My eyes sting!"}]],
 bangsaen:[[{n:"fah",f:"happy",l:"casual",t:"The sea!!! Race to that buoy! Loser gives a leg massage!"},{n:"nar",t:"Fah leads the whole way, but at the buoy she turns back to wait for you, even though she'd already won"},{n:"fah",f:"flustered",l:"casual",t:"…I wasn't waiting! Just resting! …Is your face red from the sun or from the swim?"},{n:"fah",f:"happy",l:"casual",t:"Crab tonight! My treat… no, loser's treat!"}]],
 country:[[{n:"fah",f:"happy",l:"casual",t:"Rice fields!! Empty roads!! Watch me ride!"},{n:"nar",t:"Fah borrows a villager's motorbike and tears along the dyke in a cloud of dust, kids running after her cheering"},{n:"fah",f:"flustered",l:"casual",t:"…Grandma used to ride me out to the fields like this. I just realised she's the one who taught me not to fear speed"}]],
 khaoyai:[[{n:"fah",f:"happy",l:"casual",t:"I want to see a wild elephant! I'm not scared! If one comes I'll kick it!"},{n:"nar",t:"While you wait for the fog, a branch snaps in the forest. Fah is behind you before you can even turn"},{n:"fah",f:"pout",l:"casual",t:"…I'm not scared! I'm… protecting you! Yes! I'm standing behind you to protect you!"},{n:"nar",t:"The first light hits the sea of fog. Fah goes quiet, and still doesn't step out from behind you"},{n:"fah",f:"flustered",l:"casual",t:"…Beautiful. Grandma has to see this. Bring her next year"}]],
 ayutthaya:[[{n:"fah",f:"happy",l:"casual",t:"Ayutthaya! Race around the island! Loser buys roti sai mai!"},{n:"nar",t:"Fah shoots way ahead, then stops dead at a ruined temple, staring for a long time at a chedi broken in half"},{n:"fah",f:"sad",l:"casual",t:"…It's still standing, even half-destroyed. Like Grandma. Like my old house"},{n:"fah",f:"happy",l:"casual",t:"…I'm not getting sentimental!! Keep going! I haven't won yet!"}]],
 amphawa:[[{n:"fah",f:"happy",l:"casual",t:"I'm catching a firefly to show Grandma!"},{n:"nar",t:"Fah reaches out of the boat. A firefly lands on her finger and she freezes, afraid to move"},{n:"fah",f:"flustered",l:"casual",t:"…I won't catch it. Better to let it stay. This is its home"},{n:"fah",f:"happy",l:"casual",t:"Take a photo for Grandma instead! You take it. Get me in it too, my hand's busy!"}]]}};
const ACT_PREF={kati:{like:["eat","spar","jog"],dislike:["cafe"]},mali:{like:["market","eat","cook"],dislike:["temple"]},rin:{like:["cafe","temple","stars"],dislike:["market"]},
  ploy:{like:["temple","river","jog"],dislike:["market"]},fah:{like:["market","river","cat"],dislike:["temple"]}};
const OPENERS={
 kati:{like:["Yay! You brought me here, you really get me!","This place! I've wanted to come since practice ended"],ok:["Anywhere's fine, as long as I don't have to sit still too long"],dislike:["Hmm… it's so quiet here. I'm not great at sitting still, hehe"]},
 mali:{like:["Wow~ I love this place the most! Come on, hurry!","How did you know I love it! Snacks are on me today!"],ok:["That was fun! Anywhere with you is fun"],dislike:["Ah… this place… it's kind of dark. Can I hold your arm?"]},
 rin:{like:["Good choice. This place helps me think clearly","I come here often. I didn't think you'd know"],ok:["Sure. I've prepared three topics of conversation"],dislike:["It's a bit crowded… I'll try"]},
 ploy:{like:["…It's peaceful here. I haven't been in a while. Thank you","Good pick. You're not like other camp managers"],ok:["Fine. I have until eight; after that I need to check on the juniors"],dislike:["This many people… I'm not used to it, but it's fine"]},
 fah:{like:["Hey! You know what Fah likes! Loser pays today!","Ha! You're something else, bringing me exactly where Fah likes"],ok:["Fine, fine, but if it's boring, Fah's leaving early"],dislike:["A temple…? Fah has to be on her best behavior? I can't breathe already"]},
};
// conversation prompts: {q, o:[[answer, score, reply], ...], know:"like0"|"dislike1"...}
const TALK={
 kati:[
  {q:"Manager, if I lost three fights in a row one day, would you still believe in me?",o:[["Of course. Wins and losses aren't all of who you are",3,"…Really? I'll remember that when I'm down"],["Then don't lose three in a row",0,"Haha, fair enough. I'll try!"],["I'd have to see the results first",-1,"…Mm. Yeah, I guess that's true"]]},
  {q:"I hate cilantro more than anything in the world. What about you, what do you hate most?",know:"dislike1",o:[["I hate seeing you push yourself until you're hurt",3,"Eh… I can't argue with an answer like that"],["Cilantro too!",2,"Really? Then we're on the same team!"],["I can eat anything",0,"Wow, so grown-up. I still can't"]]},
  {q:"Grandpa used to take me for khao soi every time I won… Do you think we should keep that tradition?",know:"like0",o:[["Of course. Every win, my treat",3,"It's a promise! I'll win so we eat a lot"],["You can come even when you lose",2,"Oh, true. Eating it cures sadness"],["Isn't that a waste of camp money?",-1,"…Right. I forgot the camp's still in debt"]]},
  {q:"If I weren't a fighter, what do you think I'd be?",o:[["A kids' Muay Thai coach. You're great at it",3,"I really do love teaching the kids… you noticed?"],["A luk thung singer",1,"Haha, no way, I sing totally off-key"],["I can't think of anything",0,"Right? I can't either"]]},
  {q:"Want to train together at five tomorrow morning?",know:"like1",o:[["Sure, I'll set three alarms",3,"Yay! I'll knock on your door to wake you!"],["Can we make it six?",1,"Six is fine… but I'll start without you"],["Can't, I won't wake up in time",-1,"Oh… okay. It's fine"]]}],
 mali:[
  {q:"Do you like khanom khrok? I think it's the best snack in the country!",know:"like1",o:[["Yes! I'll buy some to share",3,"Yay~ you're the best!"],["It's okay",0,"No worries, I'll eat your share, hehe"],["Too sweet, bad for athletes",-1,"…Waah, not even one piece?"]]},
  {q:"I have three younger siblings at home. When I call, they all fight over the phone… Do you have siblings?",o:[["Tell me about your siblings",3,"Sure! The youngest is Muk, she dreams of being a fighter like her big sister…"],["I'm an only child",1,"Then you can count me as another little sister~"],["Do you send a lot of money home?",0,"Well… a fair bit. But it's fine, I can manage"]]},
  {q:"Some people say I'm too small for the big stage… What do you think?",know:"dislike1",o:[["Your kicks aren't measured by height",3,"…Thank you. I'll kick them into silence!"],["Well, you are small",-1,"…Okay, no need to rub it in (puffs cheeks)"],["I'll deal with them",1,"Haha, don't go starting fights. I can handle it myself"]]},
  {q:"If I win a big prize, what should I do first?",o:[["Send some to your mom, and save some for your own dream too",3,"My own dream… I hardly ever think about it. Thanks for reminding me"],["Buy new gloves",1,"True, mine are falling apart, haha"],["Leave it with the camp for now",-1,"Oh… okay, sure"]]},
  {q:"I made you a flower garland! Where will you hang it?",know:"like2",o:[["On my car mirror, so you come everywhere with me",3,"…Saying that makes me blush!"],["On the spirit house in front of camp",2,"Lovely! May our camp be lucky!"],["Flowers wilt fast",-1,"…That's why I string new ones every day"]]}],
 rin:[
  {q:"I've ranked 23 coffee shops in town. Want to know number one?",know:"like0",o:[["I do. Let's go together",3,"…All right. I'll put it in next week's schedule"],["You're serious about everything",1,"Yes. And I don't consider that a flaw"],["I only drink Thai iced tea",0,"Thai iced tea… 38 grams of sugar. I won't judge"]]},
  {q:"If the data says your fighter has a 20% chance, would you still send her out?",o:[["If she's ready and wants it, I'll build the best plan I can",3,"An answer with both data and heart. I like it"],["No, too risky",1,"Safe. But sometimes a 20% chance changes a life"],["Yes. Muay Thai is decided by heart",0,"Heart matters… but I'd like a plan too"]]},
  {q:"What exactly is fun about the noise of a night market?",know:"dislike0",o:[["It doesn't have to be fun. Let's go somewhere quiet",3,"…Thank you for understanding"],["It's liveliness",1,"Maybe… I'll try to see it that way"],["You should get out and meet people",-1,"I meet people every day. Just not a thousand at once"]]},
  {q:"As a kid I wanted to be an astronaut. You?",o:[["Go on, why did you give up?",3,"Because I'm nearsighted… but now I prefer the stars in the ring"],["I wanted to own a Muay Thai camp",2,"And now you do. That's enviable"],["An astronaut? Isn't that far?",0,"It is far. That's exactly why I wanted to go"]]},
  {q:"I make fight-analysis clips for my own channel. 312 people watch… Is that too few?",know:"hobby",o:[["312 people who really watch beat ten thousand who scroll by",3,"…I'm putting that line in my next video"],["I'll help share it",2,"Thank you. Please subscribe too"],["That's a bit few",-1,"I know. You don't have to say it"]]}],
 ploy:[
  {q:"You're five minutes late. Normally I'd have left",know:"dislike1",o:[["I'm truly sorry. Next time I'll be ten minutes early",3,"…Good. I'll be timing you"],["It's only five minutes",-1,"Your five minutes are five minutes my juniors have to wait"],["I brought you hot tea",2,"…How did you know. Fine, I'll forgive you this once"]]},
  {q:"If you were camp captain and your juniors kept losing, what would you do?",o:[["Listen to them first, then adjust the training",3,"…I usually do the opposite. Maybe I should listen more"],["Double the training",0,"That's my way… but it doesn't always work"],["I don't know",0,"Honest. At least it's not a lie"]]},
  {q:"Hot tea or coffee, which do you choose?",know:"like1",o:[["Hot tea, like you",3,"…You're observant, Manager"],["Coffee",1,"Fine. Different paths, but that doesn't mean we can't walk together"],["Sweet iced tea",0,"…My juniors like that too"]]},
  {q:"Have you ever wondered who you'd be if you stopped fighting?",o:[["You'd be a great coach",3,"…No one has ever said that to me"],["A kind housewife",-1,"Hmph. Not funny"],["You don't have to think about it now",1,"True. I still have things to prove"]]},
  {q:"My juniors say I'm too strict. What do you think?",o:[["You're strict because you care, and they know it",3,"…I hope they really do"],["You are strict",1,"Honest. I like people who say it straight"],["Try smiling sometimes",0,"…(smiles a little) Like this? Enough"]]}],
 fah:[
  {q:"Isan sausage challenge, five skewers, loser pays!",know:"like0",o:[["Challenge accepted!",3,"Ha! I love this! …Wait, you're eating way too fast!"],["My treat, no contest needed",1,"Huh? Being this nice catches Fah off guard"],["Eating too much is bad for fighters",-1,"Just like the camp trainer. Boring"]]},
  {q:"Everyone stares at Fah's tattoo weird. You think Fah's some kind of thug, right?",o:[["I'd like to know what it means",3,"…A leaping tiger yant. Grandma gave it to me. Thanks for asking"],["It looks cool, really sharp",2,"Ha! You've got taste"],["It looks a bit scary",-1,"See? Everyone thinks that"]]},
  {q:"If Fah beats Kati in the final, will you be mad at Fah?",o:[["No. I want both of you to fight your best",3,"…With an answer like that, Fah can't hate you"],["Of course I'll be mad",0,"Ha! Honest"],["Kati won't lose",1,"So confident! We'll see!"]]},
  {q:"Fah hates being pitied. Do you get that?",know:"dislike0",o:[["I do. I won't pity you, but I'll be beside you",3,"…That's exactly what Fah needs"],["Everyone needs encouragement",1,"Encouragement and pity aren't the same… but thanks"],["I don't get it at all",0,"It's fine. Fah doesn't really get herself either"]]},
  {q:"Wanna ride on the back of Grandma's motorbike up the mountain? It's kinda old",know:"like1",o:[["Sure, but ride slowly",3,"Can't promise! Haha, kidding, Fah'll go easy"],["Is an old bike like that safe?",-1,"Don't you insult Grandma's bike!"],["I'll drive",2,"Huh! You can ride? Gotta see this"]]}],
};
const DATE_CLOSE={
 great:{kati:"Today was the most fun! I'll give it everything at practice tomorrow!",mali:"I was so happy today~ Let's go again!",rin:"…I've filed today under 'good days'",ploy:"Thank you for today. I haven't laughed like this in a long time",fah:"Let's come again! Next time Fah pays… maybe"},
 ok:{kati:"Thanks for inviting me. I feel so much lighter",mali:"That was fun! Let's head back to camp",rin:"Time well spent",ploy:"Not bad. See you around",fah:"It was fun. Don't tell anyone Fah went out with you"},
 meh:{kati:"…I guess I was a little tired today. Sorry",mali:"Hmm… let's head back",rin:"We weren't quite in sync today",ploy:"I'll head back first",fah:"Bored. I'm leaving"},
};

// ---------- CHATTER (two characters meet) ----------
const CHATTER=[
 {id:"c_kati_mali",need:G=>G.F.mali.camp==="player",bg:"camp",look:"train",steps:[
  {n:"mali",f:"happy",t:"Kati! I made you a garland, hang it in the ring corner~",with:"kati"},
  {n:"kati",f:"flustered",t:"Oh, it's pretty! But… why do you call me 'big sis', Mali? I'm only a year older!"},
  {n:"mali",f:"happy",t:"Because you train at five every morning, you totally look like the big sister"},
  {choice:[{t:"Being the camp's big sister suits you, Kati",fx:G=>{add(G,"kati","morale",4);add(G,"mali","bond",2);},then:[{n:"kati",f:"happy",t:"If you say so, Manager… then I'll look after Mali!"}]},
   {t:"You two really are like sisters",fx:G=>{add(G,"kati","bond",2);add(G,"mali","bond",2);},then:[{n:"mali",f:"happy",t:"Right? Our camp has more sisters now~"}]}]}]},
 {id:"c_kati_rin",need:G=>G.F.rin.camp==="player",bg:"camp",look:"train",steps:[
  {n:"rin",f:"happy",t:"Kati, your left guard drops three centimeters every time you throw the right. I counted 41 times in one clip",with:"kati"},
  {n:"kati",f:"flustered",t:"Forty-one!? You actually counted, Rin!"},
  {n:"rin",f:"happy",t:"I did, and I made a chart. Want to see?"},
  {n:"kati",f:"sad",t:"…Manager, help me"},
  {choice:[{t:"Listen to Rin, this data is useful",fx:G=>{G.F.kati.a.guard=Math.min(20,G.F.kati.a.guard+.4);add(G,"rin","trust",3);add(G,"kati","trust",-1);},then:[{n:"kati",f:"happy",t:"Fine… thanks, Rin (Kati's guard +0.4)"}]},
   {t:"Rin, could you say it a bit gentler? Kati's trying her best",fx:G=>{add(G,"kati","bond",3);add(G,"rin","bond",1);},then:[{n:"rin",f:"flustered",t:"…Sorry. I'll add a smiley sticker to the chart"}]}]}]},
 {id:"c_mali_rin",need:G=>G.F.mali.camp==="player"&&G.F.rin.camp==="player",bg:"camp",look:"train",steps:[
  {n:"mali",f:"happy",t:"Rin! Want some khanom khrok? I bought ten boxes!",with:"rin"},
  {n:"rin",f:"flustered",t:"Ten boxes… about 2,400 calories. Mali, are you eating all that yourself?"},
  {n:"mali",f:"happy",t:"No! It's for the whole camp. Shared calories don't count~"},
  {n:"rin",f:"happy",t:"…There's no research supporting that theory. But I'll take two"},
  {fx:G=>{for(const f of roster(G))add(G,f.id,"morale",3);}}]},
 {id:"c_kati_fah",need:G=>G.F.fah.met&&G.week>=8,bg:"fair",look:"casual",steps:[
  {n:"fah",f:"happy",t:"Oh, Kati, strolling the market? Not training? You'll lose to Fah again",with:"kati"},
  {n:"kati",f:"flustered",t:"You're the one eating sausage at 9pm. Not worried about your weight!"},
  {n:"fah",f:"flustered",t:"…! Then let's arm wrestle right here, loser pays!"},
  {choice:[{t:"Cheer Kati on all the way",fx:G=>{add(G,"kati","bond",3);add(G,"kati","morale",4);},then:[{n:"kati",f:"happy",t:"Won! Haha, Fah owes me grilled corn!"},{n:"fah",f:"angry",t:"…Doesn't count! Fah's hand slipped!"}]},
   {t:"Neither of you. You'll hurt your wrists before a fight",fx:G=>{add(G,"kati","trust",3);add(G,"fah","bond",3);},then:[{n:"fah",f:"happy",t:"Your manager sure is a worrier… but not bad, actually"}]}]}]},
 {id:"c_rin_ploy",need:G=>G.F.rin.camp==="player"&&G.F.ploy.met,bg:"temple",look:"casual",steps:[
  {n:"ploy",f:"sad",t:"…Rin. It's been a while",with:"rin"},
  {n:"rin",f:"sad",t:"Ploy… I never apologized for leaving without a word"},
  {n:"ploy",f:"happy",t:"No need to apologize. You did the right thing. If I'd been braver back then, I'd have left too"},
  {n:"rin",f:"flustered",t:"…Hearing that from you, Ploy, wasn't in my calculations"},
  {fx:G=>{add(G,"rin","morale",6);add(G,"ploy","bond",3);}}]},
 {id:"c_ploy_kati",need:G=>G.F.ploy.met&&G.week>=16,bg:"local",look:"fight",steps:[
  {n:"ploy",f:"happy",t:"Kati, I watched your fight just now",with:"kati"},
  {n:"kati",f:"flustered",t:"Ploy! …Why were you watching?"},
  {n:"ploy",f:"happy",t:"If you keep dropping your guard on the right hand, Fah will drop an elbow right there. Remember that"},
  {n:"kati",f:"happy",t:"…Thank you. Why tell me?"},
  {n:"ploy",f:"sad",t:"Because I want to see the best possible final, not one that ends early"},
  {fx:G=>{G.F.kati.a.guard=Math.min(20,G.F.kati.a.guard+.3);add(G,"ploy","bond",2);}}]},
 {id:"c_fah_mali",need:G=>G.F.mali.met&&G.F.fah.met&&G.week>=12,bg:"fair",look:"casual",steps:[
  {n:"fah",f:"happy",t:"Who's this tiny thing? Lost on the way from kindergarten?",with:"mali"},
  {n:"mali",f:"happy",t:"Hi Fah! Your tattoo is so pretty, what's the tiger's name?"},
  {n:"fah",f:"flustered",t:"Huh…? It doesn't have a name… why aren't you mad I teased you?"},
  {n:"mali",f:"happy",t:"Because you didn't mean it~ Then I'll name it, 'Little Sky Tiger'!"},
  {n:"fah",f:"flustered",t:"…Never call it that in front of anyone!"},
  {fx:G=>{add(G,"fah","bond",2);add(G,"mali","morale",3);}}]},
 {id:"c_coach_kati",need:G=>G.week>=10,bg:"night",look:"train",steps:[
  {n:"coach",t:"Kati, sit here. I have a story about Grandpa Chai"},
  {n:"kati",f:"happy",t:"What story, Coach?"},
  {n:"coach",t:"When I was your age, I lost five in a row and almost quit. Grandpa Chai didn't say a word, just took me for khao soi every day until I came back to training"},
  {n:"kati",f:"flustered",t:"…Khao soi too. Grandpa never changed, did he"},
  {n:"coach",t:"No. And his granddaughter isn't much different"},
  {fx:G=>{add(G,"kati","trust",3);add(G,"kati","morale",4);}}]},
 {id:"c_fah_ploy",need:G=>G.F.fah.met&&G.week>=22,bg:"local",look:"fight",steps:[
  {n:"nar",t:"Backstage at the subdistrict ring, you hear two people arguing behind the curtain"},
  {n:"fah",f:"flustered",t:"How long are you going to control Fah, Ploy! Fah wants to fight like Fah!",with:"ploy"},
  {n:"ploy",f:"sad",t:"I'm not controlling you. I just don't want you knocked out for charging in blind"},
  {n:"fah",f:"sad",t:"…Then why didn't you say it like that from the start"},
  {n:"nar",t:"Both go quiet. You step away before anyone notices"},
  {fx:G=>{add(G,"fah","bond",1);add(G,"ploy","bond",1);}}]},
 {id:"c_dinner",need:G=>roster(G).length>=3,bg:"food",look:"casual",steps:[
  {n:"nar",t:"Sunday evening, the whole camp sits in a circle around a moo kratha grill in the front yard"},
  {n:"kati",f:"happy",t:"This piece is mine! I put it down first!",with:"mali"},
  {n:"mali",f:"happy",t:"But I flipped it so it cooked! By law, the pork belongs to the flipper!"},
  {n:"rin",f:"happy",t:"There's no such law. But I'll grill a new piece for both of you",with:"kati"},
  {n:"coach",t:"(laughs) This camp hasn't sounded like this in two years"},
  {fx:G=>{for(const f of roster(G)){add(G,f.id,"morale",6);add(G,f.id,"bond",2);}}}]},
];

// ---------- WEEKLY HAPPENINGS ----------
const HAPPENINGS=[
 {id:"h_roof",need:G=>!(G.seen&&G.seen.d_roof),bg:"camp",steps:[{n:"coach",t:"It rained hard last night. The gym roof leaked in streams and soaked the ring"},
  {choice:[{t:"Hire a roofer right away (฿4,000)",fx:G=>{G.cash-=4000;G.camp.beauty=Math.min(10,G.camp.beauty+1);},then:[{n:"coach",t:"Done. A shiny new roof, and the camp looks better too"}]},
   {t:"Put buckets under it for now",fx:G=>{for(const f of roster(G))add(G,f.id,"morale",-3);},then:[{n:"coach",t:"…Fine, but the kids will be slipping around in practice"}]}]}]},
 {id:"h_kid",bg:"camp",steps:[{n:"coach",t:"A girl comes and clings to the fence every evening. She wants to learn Muay Thai but can't afford the class"},
  {choice:[{t:"Let her learn for free. Our camp once got a chance like this too",fx:G=>{G.rep+=.6;add(G,"kati","bond",3);},then:[{n:"kati",f:"happy",l:"train",t:"I'll teach her myself! Like Grandpa taught me"}]},
   {t:"Let her help around camp in exchange for lessons",fx:G=>{G.rep+=.3;},then:[{n:"coach",t:"Good. She'll learn the value of training"}]}]}]},
 {id:"h_sponsor",bg:"food",steps:[{n:"coach",t:"Auntie Daeng from the khao soi shop wants to sponsor us: her logo on the fight shorts for one season"},
  {choice:[{t:"Take it. Auntie Daeng is family (+฿8,000)",fx:G=>{G.cash+=8000;G.flags.sponsorDaeng=true;},then:[{n:"nar",t:"Auntie Daeng sends thirty bowls of khao soi to celebrate"}]},
   {t:"Thanks, but we're not ready",fx:G=>{},then:[{n:"coach",t:"Fine, but don't forget to eat at her shop"}]}]}]},
 {id:"h_news",bg:"camp",steps:[{n:"coach",t:"A local reporter wants an interview about 'the old Muay Thai camp coming back to life'"},
  {choice:[{t:"Let Kati speak",fx:G=>{G.rep+=1;add(G,"kati","bond",3);add(G,"kati","morale",4);},then:[{n:"kati",f:"flustered",l:"train",t:"W-wait, me?! …Hello! Sirichai Camp is still here, and it's staying!"}]},
   {t:"Speak yourself",fx:G=>{G.rep+=.7;},then:[{n:"nar",t:"The article runs on page three with a photo of you in front of the camp sign"}]}]}]},
 {id:"h_youtuber",bg:"camp",steps:[{n:"coach",t:"A travel YouTuber wants to film a whole day training with real fighters"},
  {choice:[{t:"Welcome! The camp will get famous",fx:G=>{G.rep+=1.4;for(const f of roster(G))f.fatigue=Math.min(100,f.fatigue+6);},then:[{n:"nar",t:"The clip hits two hundred thousand views; people call about classes all week"}]},
   {t:"Decline, the fighters need rest",fx:G=>{for(const f of roster(G))add(G,f.id,"trust",2);},then:[{n:"coach",t:"Understood. The kids thank you for thinking of them"}]}]}]},
 {id:"h_curry",bg:"food",steps:[{n:"nar",t:"Auntie Daeng brings a huge pot of hang lay curry: 'Made extra for the fighters, eat lots so you're strong'"},
  {fx:G=>{for(const f of roster(G))add(G,f.id,"morale",4);}},{n:"coach",t:"Good food, everyone looks stronger (everyone's morale +4)"}]},
 {id:"h_spy",bg:"camp",steps:[{n:"coach",t:"This morning someone from Golden Tiger was secretly filming our training"},
  {choice:[{t:"Go out and talk to them directly",fx:G=>{add(G,"fah","bond",2);G.rep+=.3;},then:[{n:"fah",f:"flustered",l:"casual",t:"…Caught me? Yeah, yeah, it's Fah. Wanted to see what Kati's been training"}]},
   {t:"Let it go, we'll change the plan instead",fx:G=>{for(const f of roster(G))f.a.iq=Math.min(20,f.a.iq+.2);},then:[{n:"coach",t:"Smart. Let them watch the old stuff (everyone's fight IQ +0.2)"}]}]}]},
 {id:"h_tourist",bg:"camp",steps:[{n:"coach",t:"A foreign tourist wants to pay ฿2,500 to spar with a real fighter for an hour"},
  {choice:[{t:"Deal",fx:G=>{G.cash+=2500;const f=roster(G)[0];f.fatigue=Math.min(100,f.fatigue+5);},then:[{n:"nar",t:"He leaves with a smile and a five-star review"}]},
   {t:"No, today is serious training",fx:G=>{},then:[{n:"coach",t:"Okay, another day"}]}]}]},
 {id:"h_blackout",bg:"night",steps:[{n:"nar",t:"A blackout across the whole subdistrict. The camp is pitch dark, only candles and moonlight"},
  {n:"kati",f:"happy",l:"train",t:"Manager! Shadowbox under the moonlight with me? Grandpa used to do it during blackouts"},
  {choice:[{t:"Let's go",fx:G=>{add(G,"kati","bond",5);},then:[{n:"nar",t:"That night Kati shadowboxes in the middle of the yard; her shadow stretches all the way to the camp sign"}]},
   {t:"Get some rest",fx:G=>{G.F.kati.fatigue=Math.max(0,G.F.kati.fatigue-10);},then:[{n:"kati",f:"sad",l:"train",t:"…Okay, I'll go to bed then"}]}]}]},
 {id:"h_oldstudent",bg:"camp",steps:[{n:"nar",t:"A man in his fifties comes to camp saying he was one of Grandpa Chai's first students, carrying a brand-new heavy bag"},
  {n:"coach",t:"Brother Chan! Twenty years!"},{fx:G=>{G.camp.beauty=Math.min(10,G.camp.beauty+1);add(G,"kati","trust",3);}},
  {n:"nar",t:"He tells Grandpa Chai stories late into the night. Before leaving he says, 'Lots of people still love this camp. Don't give up yet' (camp looks better)"}]},
];

// ---------- COMMENTARY ----------
const WNAME={punch:"Punch",kick:"kick",knee:"Knee",elbow:"Elbow"};
const COM={
 start:["Round {r}! Seven Mortars Fight Night, pounding out the action!","There's the bell! Round {r} begins!","The pi chawa picks up the beat, round {r} is here, folks!","Round {r}! They touch gloves and walk to center ring!"],
 hit:{punch:["{a} fires a straight right flush to the face!","{a}'s hook lands on the jaw! The crowd erupts!","{a} unloads a one-two, both on target!","{a}'s uppercut slips right through the guard!"],
  kick:["{a} whips a left kick into the ribs, the ring shakes!","{a}'s kick slams the thigh, {d} stumbles!","High kick! {a} smashes it right into the neck!","{a} teeps straight to the body, {d} flies into the ropes!"],
  knee:["{a} drives a knee into the solar plexus!","{a}'s curved knee crashes into the ribs!","{a} leaps in with a knee! Flush to the body!"],
  elbow:["{a} chops an elbow down on the forehead!","{a}'s slashing elbow cuts across the cheekbone!","Spinning elbow! {a} turns and lands it!"]},
 clinch:["Inside now! {a} locks the neck tight and knees the ribs!","Clinch at center ring, {a} has the upper hand, dominating with knees!"],
 crit:["Wow! Clean as can be! {d} freezes for a second!","Best shot of the round! {a} lands it hard!","What a sound! The whole crowd is on its feet!"],
 miss:["{a} throws a {w} but {d} slips it beautifully!","{d} gets the guard up on the {w} just in time!","{a}'s {w} misses by a hair!","{d} steps out of range, {a} hits only air!"],
 counter:["{d} misses… and {a} counters with a {w} instantly! Beautiful timing!","Razor-sharp counter from {a}! {d} walked right into it!"],
 kd:["Down she goes! {d} is down in the middle of the ring! The count… one… two… three…","{d} sits down on the canvas! The referee steps in to count!"],
 kdUp:["{d} gets up, but her legs are still shaking!","She fights on! {d} raises her guard, ready to continue!"],
 ko:["It's over! {a} wins by knockout! The whole market's on fire, folks!","It's over, folks! {d} can't get up! {a} wins by knockout!!","The referee waves it off! {a} wins in style!"],
 cut:["She's cut! She's cut! Blood over {d}'s brow, the doctor steps up!","Blood! {d} is cut over the eyebrow by an elbow, the doctor steps up to check!"],
 tired:["{x} is breathing hard now, shoulders dropping, the guard is slipping","Looks like {x} is running out of gas, careful next round"],
 end:["End of the round! Watch closely, folks, to see what happens next","End of the round! One bookie says red, the other says blue. Nobody dares call it!","End of the round! Both go back to their corners, the cornermen splash on water","The bell ends the round! The crowd won't stop roaring"],
};
// v1.20: the commentary heats up with the stakes — district > semi > final, last round, close scores, knockdowns
const HYPE={
 1:["The crowd is starting to get loud!","Beautiful!","Hotter and hotter!","Fans are rising from their seats!"],
 2:["Wow! The cheers are shaking the arena!","This is real Muay Thai!","Whoever slips up now won't live it down!","Nobody's giving an inch!","The pi chawa speeds up, the crowd claps along!"],
 3:["Ladies and gentlemen! This is the fight everyone's been waiting for!","The whole arena is standing!","The belt is right there!","Goosebumps, real goosebumps!","The pipes and drums won't stop, hearts are about to give out!","This is championship level, no doubt!"],
 4:["Nobody takes a single step back!!","Fight of the year! Fight of the year, folks!!","The arena is about to burst!!","Every punch is life! Every knee is honor!!","Twenty years calling fights and I've never seen this!!"]};
const START_HOT={
 district:["Round {r} at the district level! It's packed to the ring apron!","Bell for round {r}! The district ring is on fire tonight!"],
 semi:["Round {r} of the semifinal! The winner fights for the belt!","Bell for round {r}! Semifinal, the loser goes home!"],
 final:["Bell for round {r} of the final! Brace yourselves, folks!","Round {r}! The championship belt waits ringside!","Round {r} of the final! The whole province is watching!"],
 last:["Final round!! Whoever wants it has to empty the tank!","Final round! The pi chawa is racing, the whole arena is up!","The deciding round!! Three minutes to remember for a lifetime!"],
 close:["Neck and neck on the cards! This round decides everything!","Nobody's pulled away! The judges can't blink!"]};
const KO_HOT=["It's over! It's over!! {a} by knockout! History in front of our eyes!!","{d} can't get up!! {a}!! {a}!! The whole arena chants one name!!"];
const TIER_HEAT={evloy:0,pro:0,exhibition:0,local:0,special:1,district:1,semi:2,final:3,quest:1,beast:1};
function fightHeat(F){const base=TIER_HEAT[F.tier]??0;const sc=F.cards.reduce((x,c)=>x+c[0]-c[1],0);
  return Math.max(0,Math.min(4,base-(F.round<=1&&base>=2?1:0)+(F.round>=F.rounds&&F.rounds>1?1:0)+(Math.abs(sc)<=1&&F.round>=3?1:0)+((F.A.kd+F.B.kd)>0?1:0)+(F.week>=40&&base>0?0:0)));}
function startLine(F,rng){const R=a=>a[Math.floor(rng()*a.length)];const h=fightHeat(F);const sc=F.cards.reduce((x,c)=>x+c[0]-c[1],0);
  let t=F.round>=F.rounds&&F.rounds>1&&TIER_HEAT[F.tier]>=1?R(START_HOT.last):START_HOT[F.tier]?R(START_HOT[F.tier]):R(COM.start);
  if(F.round>=3&&Math.abs(sc)<=1&&TIER_HEAT[F.tier]>=1)t+=" "+R(START_HOT.close);
  if(F.round===1&&typeof isMonoT==="function"&&typeof G!=="undefined"&&G&&F.A&&F.A.f&&isMonoT(G,G.F[F.A.f.id]))t=R(MONO_CALL).replace(/\{n\}/g,F.A.f.name)+" "+t;
  return {text:t.replace("{r}",F.round),heat:h};}
/* v1.91.31: the ring call for the one you chose */
const MONO_CALL=["In the red corner tonight, {n}! The soulmate of Sirichai's own manager, ladies and gentlemen!","Make some noise for {n}! Word is there's one person ringside who has never missed a single fight of hers!","{n} steps into the ring! The manager's soulmate — and she's brought her own personal cheering section!"];
// v1.23: a funnier, louder booth — two commentators who can't help themselves, plus lines for the odd opponents
// classic ringside catchphrases (homage to Thai TV commentary), tied to what just happened
const SIG={"punch": ["One punch is all it takes for a thrill!", "Her head snaps back like a folk dancer's!", "One punch, the whole arena felt it!"], "kickHead": ["Aiming high. Going for the neck!", "May I borrow your chin to rest my foot!"], "kick": ["That's her body, not a place to park your shin!", "Shins sweet enough to eat!"], "knee": ["Eat lime and your belly burns. Eat a knee and your whole body aches!"], "hot": ["Pile it on! Pile it on!", "It's so wild the monks' robes are flying!", "A heart bigger than her liver!", "The arena's full, folks. Don't bother coming!", "Come on, fight! Get in there!", "Seven Mortars Fight Night, pounding out the action!"], "kd": ["Heaven help us!", "Counted out. That's a knockout!"]};
const FUN={"hit": ["Auntie Taew bangs her wash-basin!", "They heard that at the som tam stall!", "The crowd says 'ouch' for her!", "The uncle up front flinches too!", "Ouch. I felt that one!", "The camera's still shaking!"], "miss": ["Front row felt that breeze!", "Dodged like a debt collector!", "The crowd leans to dodge with her!", "That breeze cooled me down!"], "counter": ["Even the ref nods!", "A whole row is on its feet!", "Coach Daeng cracks a smile!"], "kd": ["The crowd jumps up, chairs go flying!", "Auntie Taew drops her wash-basin!", "The whole arena goes dead silent!"], "cheer": ["The fans are hammering their wash-basins!", "The pi chawa player is going red in the face!", "The uncle up front yells 'Kick! Kick! Kick!'"]};
const CREATURE_COM={"rooster": {"cHit": ["A peck to the head! The ref is still checking the rulebook!", "{c} leaps with a two-footed kick! Pure Chaiya style!", "Wing slap to the face! {p} has no idea what hit her!", "Peck and run! Master-class chicken boxing!"], "pHit": ["Clean hit! Feathers all over the ring!", "{c} squawks! I can't translate it, but that hurt!", "That lands! The rooster wobbles onto the ropes!", "Lands! The owner is covering his eyes!"], "cMiss": ["The rooster pecks and misses! Beak-first into the canvas!", "Flies clean over her head! Lands in the wrong corner!", "{c} kicks air, then scratches the dirt like nothing happened!"], "pMiss": ["Whoosh! How do you kick something that small!", "{p} hits air! The rooster's already run between her legs!", "Missed! The rooster stands there crowing at her!"], "counter": ["Counter! Cock-a-doodle-doo! And he crows about it too!", "Counter! The whole crowd crows along!", "Lovely counter! Is this Muay Thai or a nature documentary!?"], "cKd": ["The rooster is down! Wings spread! The ref can't count in chicken!", "{c} is down! The owner runs in to fan him!", "Down! The cleaner is already sweeping feathers!"], "pKd": ["{p} is down, because of a chicken! This clip is going viral!", "Knocked down by a chicken! Twenty years calling fights, never seen it!"]}, "bull": {"cHit": ["The cow charges! The ring shakes all the way to the som tam stall!", "Caught by a horn! Those aren't padded, folks!", "{c} holds a guard and kicks! Cows really can kick!", "Tail whip to the face! Which rule covers that!?"], "pHit": ["Flush to the ribs! A long, sad mooo!", "Hit! The cowbell goes ding-a-ling!", "{p} lands a kick! The cow turns and looks displeased!", "Lands! But the cow just keeps chewing!"], "cMiss": ["The cow charges and misses! Straight into the corner post!", "{c} kicks air! Four legs, all tangled!", "Missed! The cow can't brake, slides into the ropes!"], "pMiss": ["Missed! A target that big, and missed!", "Whoosh! The cow flicks her tail, mocking!", "{p} hits air! The cow yawns at her!"], "counter": ["Counter! Mooo! That is not the pi chawa, folks!", "Counter! Uncle Chaloem slaps his knee!", "Lovely counter! The ice-cream man stops his cart to watch!"], "cKd": ["The cow is down! The ring is tilting to one side!", "{c} is down! The ref counts and pets at the same time!", "Down! Somebody lure her up with grass!"], "pKd": ["{p} is down! Knocked down by a cow. I'm telling my grandkids!", "Down! The cow stands over her, chewing cud!"]}, "gang": {"cHit": ["That lands! Punching with a helmet still on!", "{c} headbutts! With a helmet on. Not fair!", "Lands! The goons honk their bikes!", "That lands! The goons cheer, the traffic cop starts looking!"], "pHit": ["Clean hit! The helmet spins backwards, he can't see!", "Hit! The helmet flies to row three. Finders please return it!", "{p} lands a kick! Spatulas bang all over the market!", "Lands! Twenty percent interest, repaid in fists!"], "cMiss": ["Missed! His visor's fogged up, he can't see!", "{c} swings wide! The helmet's so heavy he follows the punch!", "Missed! The goons pretend to look elsewhere!"], "pMiss": ["Whoosh! {c} dodges. Must practice dodging cops!", "Missed! Just grazed the helmet!", "{p} hits air! A goon laughs, then a vendor stares him silent!"], "counter": ["Counter! Auntie Sri waves her morning glory!", "Counter! The goons are already starting their bikes!", "Lovely counter! The market roars. Even the mackerel!"], "cKd": ["Down! Good thing he wore a helmet. Safety first!", "{c} is down! The goons back off toward the parking lot!", "Down! The vendors count for the ref. Very fast!"], "pKd": ["{p} is down! The goons honk all over the market!", "Down! The whole market gasps, hands over mouths!"]}};
// v1.89.9: a bigger booth — more lines for every moment, round-one feeling-out, the crowd's 'Oh!', ringside odds, a line for each heroine
COM.start.push("Bell for round {r}! Both step to the middle!","Round {r}! The crowd's settled in!","The pi java starts round {r}, folks!","Round {r}! The points are up for grabs!","Here's round {r}! Who walks forward first?","Round {r} underway! Corners are out of the ring!");
COM.clinch.push("Clinch in the middle! {a} gets the neck first!","{a} pulls {d}'s head down, knees in a row!","The clinch belongs to {a}! Pinned on the ropes!","{a} twists {d} off balance, then a knee!","The ref's late to split them! {a} lands another knee!","Locked tight. Whoever's stronger wins this!");
COM.crit.push("Oh! That one landed clean!","That one went all the way in!","Replay that one!","You heard that one at the market!","You could hear that one with your eyes shut!");
COM.miss.push("{a} throws the {w}, {d} slips it!","{d} calmly parries the {w}!","{a}'s {w} misses by a nose!","{d} ducks the {w}, not a hair moved!","{a}'s {w} is one beat late!","{d} checks the {w} with the shin!","{a} feints into the {w}, {d} doesn't bite!","{d} leans away from the {w} and smiles!");
COM.counter.push("{d} comes in… {a} meets it with a {w}!","Patient… then {a} counters with the {w}!","{a} parries and fires the {w} in one beat!","Read it! {a}'s {w} lands before {d} can get out!","{d} leaves a gap and {a} takes it!","A textbook counter!");
COM.kd.push("{d} goes down! The ref starts the count!","Down! {d} sits in the corner!","{d}'s knees buckle! Half the stadium goes quiet!","{d} is down! {a}'s corner slaps the ropes!","The count is on! {d} reaches for the ropes!");
COM.kdUp.push("{d} is up at eight! Nods to say okay!","{d} gets up, shaking off the fog!","Not over! {d} puts the guard back up!","{d} beats the count, but the eyes are glassy!");
COM.ko.push("Lights out! {a} wins by knockout!","No need to finish the count! {a} wins!","{a} wins by KO! The whole stadium stands!","Game over! {a} puts {d} down for good!");
COM.cut.push("Cut above the brow! {d} has blood in the eye!","The doctor checks {d}'s cut! Can they go on?","{d}'s cut is wide open. The corner has work to do!");
COM.tired.push("{x}'s feet are getting heavy","{x} is breathing through the mouth, guard drooping","{x} is slowing down. Needs a second wind","{x}'s legs have lost their bounce");
COM.end.push("End of the round! The corners rush in!","Bell! Check the cards for who took it!","Round's over! Liniment ready, towels ready!","That's the round! The bettors are re-pricing!","Saved by the bell!");
COM.hit.punch.push("{a} lands a straight right down the middle!","{a}'s left hook lands flush on the cheek!","{a} doubles up! {d}'s head snaps back!","{a} digs an uppercut under the chin!","{a} rips three to the body!","{a}'s long jab splits the guard!");
COM.hit.kick.push("{a}'s left kick thuds like a sandbag!","{a}'s low kick wobbles {d}'s leg!","{a}'s full right kick goes through the arms!","{a}'s teep sends {d} flying back!","{a}'s kick clips over the guard onto the shoulder!","{a} kicks the same spot again! The ribs are red!");
COM.hit.knee.push("{a} drives a knee to the gut! {d} folds!","{a} knees left, right, won't let go!","{a}'s curving knee thumps the ribs!","{a} grabs the neck, knee to the middle!");
COM.hit.elbow.push("{a} slices an elbow above the brow!","{a}'s upward elbow catches the chin!","{a} chops a diagonal elbow down the forehead!","{a} spears an elbow at close range!");
COM.feel=["Round one. Still feeling each other out.","Testing teeps. Nobody's in a hurry.","Round one rarely scores. Settle in.","Both measuring range. Not open yet.","Circling quietly, like two cats.","The bettors are waiting for round two."];
HYPE[1].push("The engines are warming up!");
HYPE[2].push("Nobody's holding back!","Nobody can stay seated!");
HYPE[3].push("This is what everyone paid to see!");
HYPE[4].push("History is happening right now!!");
FUN.hit.push("The meatball seller stops grilling to watch!","Even the dog by the ring is barking!");
FUN.miss.push("So much air, nobody needs the AC!");
FUN.counter.push("The crowd slaps their knees!");
FUN.kd.push("Uncle in front drops his sticky rice!");
FUN.cheer.push("A kid in the back blows a whistle!");
const CHANT=["Oh!!","Oh!! The crowd calls every kick!","The whole stadium goes 'Oh!'"],ODDS=["The odds just moved!","Ringside bettors flip the odds!","The bettors wave for takers!","The underdog backers are smiling now!"];
const CHAR_COM={kati:["Sirichai blood! No stepping back!","Kati's smiling through the red face!","Grandpa Chai is smiling up there!"],mali:["Sweet smile. Not a sweet elbow.","Small frame, huge heart!","Chaiya form, all of it!"],rin:["Rin had that one calculated!","Measured with a ruler!","Lopburi brains!"],ploy:["Pure talent!","A true Korat buffalo swing!","She doesn't even look tired!"],fah:["Fah's playing to the camera again!","There's Fah's smirk!","Silver hair flying across the ring!"]};
function comLine(e,F,rng){if(e.ev==="wake")return e.t;const R=a=>a[Math.floor(rng()*a.length)];const fill=(s,o)=>s.replace(/\{(\w)\}/g,(m,k)=>o[k]??"");
  const o={a:e.an,d:e.dn,w:WNAME[e.w]||""};const h=fightHeat(F);const grp=F.B.f&&F.B.f.grp,C=grp&&CREATURE_COM[grp];
  // special bouts (rooster / bull / helmet gang): the caller goes all-in on jokes
  if(C){const cA=e.an===F.B.name;const k=e.ev==="hit"?(cA?"cHit":"pHit"):e.ev==="miss"?(cA?"cMiss":"pMiss"):e.ev==="counter"?"counter":e.ev==="kd"?(e.dn===F.B.name?"cKd":"pKd"):"";
    if(k&&rng()<(e.ev==="kd"?.9:.5)){const L=C[k].filter(y=>y!==F.lastFun);const y=R(L);F.lastFun=y;return fill(y,{c:F.B.name,p:F.A.name});}}
  const fun=x=>{if(!x||C)return x;const L=FUN[e.ev==="counter"?"counter":e.ev==="kd"?"kd":e.ev==="miss"?"miss":e.ev==="hit"?"hit":""];
    const sk=e.ev==="kd"?"kd":e.ev!=="hit"?"":h>=3&&rng()<.5?"hot":e.w==="kick"?(/คอ|คาง|หน้า|neck|chin|head|face/i.test(x)?"kickHead":"kick"):e.w==="punch"?"punch":e.w==="knee"?"knee":"";
    if(e.ev==="hit"&&e.w==="kick"&&F.round>=2&&rng()<.14)return x+" "+R(CHANT);
    if((e.crit||e.ev==="kd")&&h>=1&&rng()<.18)return x+" "+R(ODDS);
    {const id=e.an===F.A.name?F.A.f&&F.A.f.id:F.B.f&&F.B.f.id,CL=id&&CHAR_COM[id];if(CL&&(e.ev==="hit"||e.ev==="counter")&&rng()<.1)return x+" "+R(CL);}
    if(sk&&rng()<(e.ev==="kd"?.3:.1)){const y=R(SIG[sk].filter(z=>z!==F.lastFun));if(y){F.lastFun=y;return x+" "+y;}}
    if(L&&rng()<(e.ev==="kd"?.3:.11)){const y=R(L.filter(z=>z!==F.lastFun));F.lastFun=y;return x+" "+fill(y,o);}if(e.ev==="hit"&&rng()<.03)return x+" "+R(FUN.cheer);return x;};
  const hype=x=>{if(!h||!x)return x;const big=e.crit||e.ev==="kd"||e.ev==="skill"||e.ev==="rage";
    if(rng()>=(big?.8:.1+h*.1))return x;const L=HYPE[Math.min(4,h+(big&&h>=2?1:0))].filter(y=>y!==F.lastHype);const y=R(L);F.lastHype=y;return x+" "+y;};
  const b=baseLine(e,F,R,fill,o,h);if(!b||COM.feel.includes(b))return b;let x=hype(b);if(x===b)x=fun(b);return x.length>COM_MAX?b:x;}
const COM_MAX=100;
function baseLine(e,F,R,fill,o,h){
  if(e.ev==="ko"&&h>=2)return fill(R(KO_HOT),o);
  if(F.round===1&&F.rounds>=3&&!e.crit&&(e.ev==="miss"?Math.random()<.35:e.ev==="hit"&&Math.random()<.12))return R(COM.feel);
  if(e.ev==="hit"){if(e.crit)return fill(R(COM.crit),o)+" "+fill(R(COM.hit[e.w]),o);return fill(e.cl&&Math.random()<.5?R(COM.clinch):R(COM.hit[e.w]),o);}
  if(e.ev==="miss")return fill(R(COM.miss),o);
  if(e.ev==="counter"){return fill(R(COM.counter),{a:e.an,d:e.dn,w:WNAME[e.w]});}
  if(e.ev==="kd"){const k1=fill(R(COM.kd),o),k2=k1+" "+fill(R(COM.kdUp),o);return k2.length>COM_MAX?k1:k2;}
  if(e.ev==="ko")return fill(R(COM.ko),o);
  if(e.ev==="cut")return fill(R(COM.cut),o);
  return e.t;}

// ---------- GIFTS ----------
const GIFTS={
  stickers:{name:"Limited-edition ring stickers",price:180},wrap:{name:"Kanok-pattern hand wraps",price:350},khanom:{name:"Big bag of khanom khrok",price:80},
  malai:{name:"Jasmine garland",price:120},coffee:{name:"Light-roast Doi coffee beans",price:280},sausage:{name:"Big set of Isan sausage",price:150},
  tea:{name:"Doi Mae Salong oolong tea",price:260},sketch:{name:"Leather sketchbook",price:320},doll:{name:"Soft tiger plushie",price:290},book:{name:"Sports statistics book",price:390},
  // v1.18: more personal gifts open up as you get closer (worth more bond)
  shorts:{name:"Name-embroidered fight shorts",price:900,bond:15},prajiad:{name:"Lucky-pattern prajiad",price:650,bond:15},
  photo:{name:"Sirichai team photo frame",price:500,bond:25},spa:{name:"Full-day Thai spa voucher",price:1200,bond:25},
  bracelet:{name:"Kanok-pattern silver bracelet",price:1800,bond:35},mongkhon:{name:"A mongkhon you braided yourself",price:400,bond:45},
  // v1.21: personal gifts — each girl has her own, unlocked at different closeness so it can't be guessed
  k_album:{name:"Muay Thai sticker album",price:450,bond:18,only:"kati",cat:"keep"},k_glove:{name:"Grandpa Chai's old gloves, restored",price:1500,bond:38,only:"kati",cat:"wear"},
  m_pan:{name:"Tabletop mini khanom khrok pan",price:700,bond:14,only:"mali",cat:"keep"},m_ticket:{name:"Bus ticket home to Chaiya",price:1100,bond:33,only:"mali",cat:"exp"},
  r_drip:{name:"Ceramic coffee dripper",price:850,bond:20,only:"rin",cat:"keep"},r_watch:{name:"Pro coach stopwatch",price:1600,bond:42,only:"rin",cat:"wear"},
  p_teaset:{name:"Dan Kwian clay tea set",price:950,bond:16,only:"ploy",cat:"keep"},p_silk:{name:"Small Pak Thong Chai silk scarf",price:1700,bond:36,only:"ploy",cat:"wear"},
  f_buds:{name:"Lightning-pattern wireless earbuds",price:1200,bond:22,only:"fah",cat:"keep"},f_jacket:{name:"Bomber jacket embroidered FAH",price:1900,bond:40,only:"fah",cat:"wear"},
};
// v1.89.23: regional souvenirs — bought only at the shop before the bus leaves a trip city, kept in G.souv, given later for free (no cash at the gift screen)
const SOUV_RN={north:"the North",isan:"Isan",central:"the Central Plains",south:"the South"};
Object.assign(GIFTS,{
  n_umbrella:{name:"Hand-painted Bo Sang umbrella",price:2400,souv:"north",cat:"keep"},n_jok:{name:"Mae Chaem teen jok sarong",price:5800,souv:"north",cat:"wear"},
  i_pillow:{name:"Khit-cloth triangle pillow",price:2200,souv:"isan",cat:"keep"},i_praewa:{name:"Kalasin Praewa silk",price:6500,souv:"isan",cat:"wear"},
  c_khon:{name:"Handcrafted Khon mask",price:3600,souv:"central",cat:"keep"},c_bencharong:{name:"Benjarong tea set",price:4800,souv:"central",cat:"keep"},
  s_talung:{name:"Hand-carved shadow puppet",price:2600,souv:"south",cat:"keep"},s_pearl:{name:"Phuket pearl necklace",price:6800,souv:"south",cat:"wear"}});
const SOUV_IDS=Object.keys(GIFTS).filter(g=>GIFTS[g].souv);
const SOUV_LOVE={kati:["c_khon","n_umbrella"],mali:["s_talung","s_pearl"],rin:["c_bencharong","n_jok"],ploy:["i_praewa","c_bencharong"],fah:["i_pillow","s_pearl"]};
const SOUV_TALK={
 kati:{c_khon:"A Khon mask! Grandpa Chai took me to see Khon only once when I was little… I'll put it right next to his photo.",n_umbrella:"A flower umbrella… it's too pretty to open! I'll hang it up in my room.",like:"{g}, all the way from {r}… I'll keep it to remember this trip!"},
 mali:{s_talung:"Nang talung! As a kid I'd sneak behind the screen to watch the puppeteer at every temple fair~ I miss home.",s_pearl:"Pearls… really, for me? I'll wear them when I visit Mom. She's going to be so surprised~",like:"A souvenir from {r}~ I'm so happy you thought of me on the trip!"},
 rin:{c_bencharong:"Hand-painted in five colours… I'll only brew coffee in these on days we win.",n_jok:"A pattern like this takes months to weave… I'll save it for the most important day.",like:"{g}… the real thing doesn't come cheap. Thank you for choosing it so carefully."},
 ploy:{i_praewa:"Praewa silk… My mother had exactly one piece. She kept it in a chest and let no one touch it. Thank you. I'll take care of it.",c_bencharong:"Tea in Benjarong cups… Want to brew some together? Just the two of us.",like:"{g}, from {r}… It's beautiful. Thanks."},
 fah:{i_pillow:"A triangle pillow! It's for my naps after training. Nobody gets to borrow it. Ever!",s_pearl:"Pearls!? Won't I look like some rich girl in these… Don't you dare laugh!",like:"A souvenir from {r}! It's… not bad. I'll take good care of it."}};
const souvLine=(id,g,t)=>{const L=SOUV_TALK[id];if(!L)return null;return t==="love"&&L[g]?L[g]:(L.like||"").replace("{g}",GIFTS[g].name).replace("{r}",SOUV_RN[GIFTS[g].souv]);};
const GIFT_CAT={khanom:"food",sausage:"food",coffee:"food",tea:"food",wrap:"wear",shorts:"wear",prajiad:"wear",bracelet:"wear",mongkhon:"wear",stickers:"keep",photo:"keep",doll:"keep",sketch:"keep",book:"keep",malai:"keep",spa:"exp"};
const giftCat=g=>GIFTS[g].cat||GIFT_CAT[g]||"keep";
// shared bond gifts open at a different closeness for each girl
const GIFT_UNLOCK={kati:{shorts:12,prajiad:20,photo:26,spa:34,bracelet:40,mongkhon:46},mali:{spa:12,photo:18,bracelet:24,shorts:30,prajiad:38,mongkhon:44},
  rin:{bracelet:14,spa:20,prajiad:28,photo:34,shorts:40,mongkhon:48},ploy:{prajiad:12,mongkhon:22,spa:28,bracelet:34,shorts:40,photo:46},fah:{shorts:10,bracelet:18,photo:26,prajiad:32,spa:38,mongkhon:44}};
const giftBond=(id,g)=>(GIFT_UNLOCK[id]&&GIFT_UNLOCK[id][g])||GIFTS[g].bond||0;
const giftsFor=id=>Object.keys(GIFTS).filter(g=>!GIFTS[g].souv&&(!GIFTS[g].only||GIFTS[g].only===id));
const GIFT_PREF={kati:{love:["stickers","mongkhon","k_album","k_glove","prajiad"],like:["wrap","khanom","shorts","photo","sausage","malai","doll"],dislike:["coffee"]},
  mali:{love:["khanom","spa","m_pan","m_ticket","photo"],like:["malai","doll","bracelet","stickers","shorts","sausage","tea"],dislike:["book"]},
  rin:{love:["coffee","bracelet","r_drip","r_watch","book"],like:["tea","spa","sketch","shorts","mongkhon"],dislike:["sausage"]},
  ploy:{love:["tea","prajiad","p_teaset","p_silk"],like:["wrap","malai","mongkhon","khanom","sausage","sketch","spa"],dislike:["doll","photo"]},
  fah:{love:["sausage","shorts","f_buds","f_jacket"],like:["sketch","doll","bracelet","stickers","coffee","khanom"],dislike:["tea","spa"]}};
const GIFT_LINES={
 kati:{love:"Wow! You can't find this edition anymore! I'm sticking it right in the middle of my glove box!",like:"Thank you! I'll take good care of it",ok:"Thank you, it's cute",dislike:"Oh… coffee? It makes my heart race. But thanks for thinking of me"},
 mali:{love:"Khanom khrok!! How did you know? I'm eating it right now~",like:"It's so cute! I'll keep it safe",ok:"Thank you~",dislike:"A book… so many numbers. Reading it makes me sleepy, hehe"},
 rin:{love:"Light-roast Doi beans… you picked perfectly. I'll brew some for you to try",like:"Useful. Thank you",ok:"Thank you",dislike:"Sausage… very high in sodium. But… thank you for the thought"},
 ploy:{love:"…I've loved this shop's tea since I was little. Truly, thank you",like:"This works well. Thank you",ok:"Thanks",dislike:"A plushie… I'm not a child. I'll give it to my juniors"},
 fah:{love:"Huh! A big set of sausage! You know Fah best!",like:"Well… not bad. Thanks",ok:"Mm, thanks",dislike:"Tea? Fah's not a grandma!"},
};
function giftTier(id,g){if(GIFTS[g]&&GIFTS[g].souv)return (SOUV_LOVE[id]||[]).includes(g)?"love":"like";const P=GIFT_PREF[id];return P.love.includes(g)?"love":P.like.includes(g)?"like":P.dislike.includes(g)?"dislike":"ok";}
function giveGift(G,id,g){const f=G.F[id],it=GIFTS[g],sv=!!it.souv;if(sv?!((G.souv||{})[g]>0):G.cash<it.price)return null;if(f.giftWeek===gameWeek(G))return null;if(sv)G.souv[g]--;else G.cash-=it.price;f.giftWeek=gameWeek(G);if(typeof absWeek==="function")f.lastTouch=absWeek(G);
  // v1.16: the same gift again means less (and she says so)
  f.giftN=f.giftN||{};f.giftL=f.giftL||{};if(f.giftL[g]&&gameWeek(G)-f.giftL[g]>=6)f.giftN[g]=0;const n=f.giftN[g]||0;f.giftN[g]=n+1;f.giftL[g]=gameWeek(G);f.giftTot=(f.giftTot||0)+1;
  const t=giftTier(id,g),base=sv?{love:24,like:15}[t]:Math.round({love:6,like:4,ok:2,dislike:0}[t]*(it.bond&&t!=="dislike"?1.5:1)),gain=base>0?Math.max(1,Math.round(base*(n===0?1:t==="love"?(n===1?.6:.4):(n===1?.5:.25)))):base;
  const before=(f.bond||0)+(f.bondX||0);add(G,id,"bond",gain);if(t==="love")add(G,id,"morale",n<2?6:4);
  f.know["gift_"+g]=t;return {t,gain:Math.round(((f.bond||0)+(f.bondX||0)-before)*10)/10,g,n};}
// v1.21: repeat-gift lines follow what the gift is (food / something to wear / a keepsake / an outing) so they always fit
const GIFT_AGAIN={
 kati:{food:["{g} again! I finished the last one already, I'm so happy","Got {g} again~ This time I'll share with Coach Daeng"],
   wear:["Another {g}! Now I can rotate them, thank you","My old one was just getting worn, the new {g} came right on time"],
   keep:["{g} again! I line them up on my shelf, I never get tired of them","You remembered I like {g}, didn't you? I'm so happy"],
   exp:["We get to go again! I still haven't finished telling everyone about last time","Again? You're being way too kind"]},
 mali:{food:["{g} again~! Mali could eat it every day, never gets old","Hehe, {g} again! This time I'll share with the kids in camp"],
   wear:["Another {g}~ Mali will wear them on alternate days","Got {g} again! I'm sending Mom another photo~"],
   keep:["{g} again~ Mali has a whole collection now","You really get Mali. The more {g}, the better"],
   exp:["We get to go again!! This time Mali's dragging you along~","Again~? Mali's legs say thank you"]},
 rin:{food:["{g} again… my consumption has doubled. But I'm still happy","Duplicate data: {g} again… yet the happiness output is unchanged"],
   wear:["Another {g}. Having a spare does no harm. Thank you","I'll use this {g} on fight days and keep the old one for training"],
   keep:["You're observant. You remembered I like {g}","{g} again… statistics say I've never once tired of it"],
   exp:["Again? My body thanks you","I'll note that you've given this twice… so I can thank you properly"]},
 ploy:{food:["{g} again… you really remembered. Thank you","Got {g} again. I'll brew some for my juniors too"],
   wear:["Another {g}, I just used up the old one. Thanks","I like your consistency"],
   keep:["{g} again. I'll keep it close","I never tire of things like this. Thank you"],
   exp:["Again… I suppose I should find time to rest. Thank you","You really do worry about me"]},
 fah:{food:["{g} again!! You know Fah best!","Haha, {g} again, Fah never gets bored, keep 'em coming!"],
   wear:["Another {g}! Fah'll wear it every day …don't tell anyone Fah's happy","Got it again, yes! Gonna wear it to Golden Tiger to make them jealous"],
   keep:["{g} again, fine, Fah'll keep it in the locker","Not bad, again. Thanks"],
   exp:["Again? …Fine, fine, Fah'll go","You really like spoiling Fah, huh"]}};
const giftAgainLine=(id,t,n,g)=>{const C=GIFT_AGAIN[id];if(!C)return null;const L=C[g?giftCat(g):"keep"]||C.keep;return L[(n-1)%L.length].replace("{g}",g?GIFTS[g].name:"this one");};

// ---------- v1.3: more talk topics (no repeats) — only a fitting answer reveals the fact ----------
const TALK_MORE={
 kati:[
  {q:"Before a fight I like listening to a certain sound to calm down… guess what it is",know:"like2",o:[["The sound of the pi chawa during wai khru",3,"Exactly! Whenever I hear it, it's like Grandpa is standing ringside"],["Loud rock music",0,"Haha, nope, I'm not that type"],["Total silence",-1,"Too quiet makes me more nervous…"]]},
  {q:"My glove box is covered in stickers. Do you know where they're from?",know:"hobby",o:[["From every venue you've fought at, right?",3,"How did you know! This one's from my very first temple fair"],["Bought them at a stationery shop",-1,"Nope! Every one of them means something"],["The kid next door stuck them on",0,"Only one is hers, I collected the rest"]]},
  {q:"People ask if I've ever thought about quitting… what do you think I say?",know:"dislike0",o:[["Never. You hate giving up halfway",3,"…You understand me more than I thought"],["Sure, everyone does",1,"I've thought about it, but never done it, because I hate giving up most of all"],["I don't know",-1,"Hmm… I'll tell you another day"]]},
  {q:"My birthday is on Songkran. Which day do you think?",know:"bday",o:[["April 13, the first day of Songkran",3,"Correct! This year I'm soaking you"],["April 15",0,"Close, it's the first day"],["New Year's Day",-1,"That's January!"]]},
 ],
 mali:[
  {q:"Guess where I most love to walk at night",know:"like0",o:[["Night markets",3,"Yes~ lights, people, food. Literally heaven!"],["Somewhere quiet by the river",0,"It's pretty, but quiet for too long gets lonely"],["A temple at night",-2,"No way! Temples at night are terrifying"]]},
  {q:"If someone called me 'little girl' in front of reporters, what would you do?",know:"dislike1",o:[["Tell them you're a professional fighter, not a kid",3,"Waah… that's exactly what I wanted to hear"],["Laugh along",-1,"…I'm not laughing"],["Nothing, they'll forget",0,"I don't really forget, but it's okay"]]},
  {q:"Why do you think I talk so much? I don't really notice it myself",know:"dislike0",o:[["You don't like long silences, right?",3,"…Yeah. My home was always loud. Silence feels lonely"],["Because you're too polite",0,"A little, but that's not all"],["Talking less would be nice",-2,"…Okay. I'll try"]]},
  {q:"Do you know how Chaiya style teaches 'block, parry, close, open'?",know:"hobby",o:[["Defend tight first, then open the counter",3,"Exactly! When I'm free I string garlands and tell Chaiya master stories, it's calming"],["Attacking first gives the edge",-1,"Not Chaiya at all, haha"],["No idea, tell me",1,"Sure! When I string garlands I like to think through techniques too"]]},
 ],
 rin:[
  {q:"If you had to choose between a high-paying fight with injury risk and a safe ordinary one, which would you pick?",know:"dislike2",o:[["Look at the data first. No unnecessary risks",3,"Agreed. Unnecessary risk is what I dislike most"],["Take the risk, money matters",-2,"…I'll have to make you another spreadsheet"],["Whatever the fighter wants",1,"True, but a manager should have numbers in hand too"]]},
  {q:"I re-colored the training schedule. Can you see what changed?",know:"like1",o:[["Green is rest days, red is hard days. Much easier to read",3,"…You actually noticed. I spent two hours choosing colors"],["I don't see any difference",-1,"Hm. It's fine"],["It's pretty",1,"Thank you. I like nicely colored spreadsheets"]]},
  {q:"How do you feel when reporters call a temple-fair fight 'the fight of the century'?",know:"dislike1",o:[["A bit exaggerated",3,"Right? I can't stand exaggeration"],["Exciting",0,"For you, I suppose"],["Good, it promotes our camp",1,"From a business view, fair. I admit it"]]},
  {q:"The Lopburi masters say 'clever Lopburi'. What do you think clever means here?",know:"like2",o:[["Read your opponent before you strike",3,"Same as I think. Sometimes I sit in a quiet library pondering it"],["Tricking the opponent",0,"Part of it, but not the core"],["Winning fast",-1,"…No"]]},
 ],
 ploy:[
  {q:"Where do I like to go in the morning before training? Can you guess?",know:"like0",o:[["Quiet temples in the morning",3,"Yes. Ten minutes there and my mind stays calm all day"],["A coffee shop",0,"I drink tea, mostly"],["The morning market",-1,"Too crowded. I don't like it much"]]},
  {q:"Every junior in my camp has hand wraps of the same color. Know who made them?",know:"hobby",o:[["You sewed them all yourself, didn't you?",3,"…I haven't told anyone. Don't spread it"],["Bought by the dozen",-1,"No"],["The camp ordered them",0,"Close, but no"]]},
  {q:"If someone in camp belittled a junior in front of you, what would you do?",know:"dislike2",o:[["Stop them immediately",3,"Good. That's what I'd do"],["Let it go, they'll grow up",-2,"I disagree"],["Talk to them privately later",1,"A polite way"]]},
  {q:"Do you know why they say 'heavy fists of Korat'?",know:"like2",o:[["The buffalo swing, from the hips, full power",3,"Yes. And it has to be on time. My coach taught me a late punch is a wasted punch"],["Because Korat people are big",-1,"Nothing to do with it"],["No idea",0,"I'll teach you sometime"]]},
 ],
 fah:[
  {q:"What do you think I hate most? Guess",know:"dislike0",o:[["Being pitied",3,"…Heh. You read people well too"],["Losing",0,"Losing I can take, but some things I can't"],["Cilantro",-1,"That's Kati"]]},
  {q:"Golden Tiger has sixty rules. How many do you think I follow?",know:"dislike1",o:[["Not many. You hate lots of rules",3,"Ha! Right. Three is plenty"],["All of them",-1,"You don't know me at all"],["Half",1,"Too generous"]]},
  {q:"My sketchbook fell out at weigh-ins. Did you see inside?",know:"hobby",o:[["I saw the tiger tattoo designs. Beautiful",3,"…Don't tell anyone. I drew them myself"],["I didn't look",1,"Good"],["Just the weight numbers",0,"Fine, then that's that"]]},
  {q:"If you took me to a temple, what face would I make?",know:"dislike2",o:[["A bored face. You hate having to be prim",3,"Good that you know. Don't take me"],["A peaceful face",-1,"Me? Dream on"],["Depends on the temple",0,"Every temple's the same"]]},
 ],
};
for(const id in TALK_MORE)TALK[id].push(...TALK_MORE[id]);
// quiet moments when every topic is used — each plays once, no choice
const MOMENTS={
 kati:["Kati retells the story of her first temple-fair fight, but this time she talks about how Grandpa patted her head after she lost","Kati sits down to rest and dozes off on your shoulder, then pretends she wasn't asleep","Kati gets you to practice the first wai khru move together; she teaches so seriously you can't help laughing"],
 mali:["Mali video-calls her siblings and hands you the phone to say hi. The youngest asks if you're Mali's boyfriend","Mali strings a small garland while waiting, then quietly ties it around your wrist","Mali tells you her dream of opening a khanom khrok stall in front of the camp, eyes sparkling the whole time"],
 rin:["Rin shows you a fight-analysis clip and explains every beat. It's the first time you've seen her smile while talking Muay Thai","Rin writes something in her notebook. When you ask, she says she just 'noted that today was good'","Rin sits silently for a long while, then says this is the first place she hasn't had to prove herself"],
 ploy:["Ploy wraps hand wraps for you one turn at a time, explaining which turn protects against a broken wrist","Ploy pours you a cup of tea without a word, but it isn't an awkward silence","Ploy tells you about her first Korat coach, her voice softer than ever"],
 fah:["Fah challenges you to a sausage-eating contest, loses, and demands a rematch","Fah drives you around the village on her grandma's old motorbike without saying where you're going","Fah hands you a tiger sketch: 'Messed it up, couldn't throw it away'"],
};

// v1.5: a reaction line for every gift, so food is eaten, drinks are brewed and items are kept
const GIFT_TALK_PERSONAL={
 kati:{k_album:"A sticker album! My stickers are scattered all over my glove box… now I can line them up nicely!",k_glove:"Grandpa's gloves… you had them repaired?… (hugs them tight) I can smell Grandpa. Thank you… thank you so much"},
 mali:{m_pan:"A mini khanom khrok pan!!! Mali will practice every evening, and you'll be the first to taste, promise~",m_ticket:"A ticket home to Chaiya… Mali hasn't been home in almost a year… Mom will be so happy. Thank you"},
 rin:{r_drip:"This ceramic dripper gives the most even flow rate… did you research this? I'm… impressed",r_watch:"A coach's stopwatch… you see me as more than a fighter… I'll use it both fighting and analyzing"},
 ploy:{p_teaset:"Dan Kwian clay… from my hometown… I haven't seen this in so long. Let's brew tea together tonight",p_silk:"Pak Thong Chai silk. My mother wove this for a living… how did you know? I'll keep it all my life"},
 fah:{f_buds:"Lightning earbuds!! So cool! Fah'll wear them on morning runs, no more listening to the coach nag, haha",f_jacket:"A jacket with FAH embroidered… big letters across the back… Fah… Fah will wear it the day of the final. Watch closely"}};
const GIFT_TALK={
 kati:{stickers:"Wow! You can't find this edition anymore! I'm sticking it right in the middle of my glove box!",
  wrap:"Kanok hand wraps… too pretty to train in. I'll save them for real fight days!",
  khanom:"The khanom khrok is still warm! Can I eat it now… mmm, so much coconut! Half for you",
  coffee:"Coffee? Whenever I drink it my heart races all night. I'll give it to Coach Daeng instead",
  malai:"The garland smells lovely. I'll offer it to Grandpa's picture on the shelf",
  sausage:"Isan sausage! Grilled crispy, with sliced ginger, bird's-eye chili and cabbage, it's the best! Thank you",
  tea:"Oolong… I don't drink much tea, but I'll try brewing it",
  sketch:"A sketchbook? I can't draw at all… can I use it for training schedules instead?",
  doll:"A tiger plushie… it looks just like Fah, haha. I'll put it by my bed to guard the camp",
  book:"A statistics book… I'll fall asleep after two pages, but I'll ask Rin to summarize it for me",
  shorts:"Fight shorts embroidered 'Kati Sirichai'… the letters look just like Grandpa's. I'm wearing them next fight!",
  prajiad:"A prajiad… Grandpa tied one on me for my first fight. Thank you, I'll tie it on my arm",
  photo:"A photo of everyone in camp… when I first came here it was just me and Coach Daeng. Now the frame is full",
  spa:"A whole spa day! I've never been… will I even want to come back to training after?",
  bracelet:"A silver bracelet… isn't it too pretty for me? I'll take it off before every training",
  mongkhon:"You braided this yourself?… all night?… I… I'll wear it in the final. I promise"},
 mali:{khanom:"Khanom khrok!! How did you know? I'm eating it right now~ Mmm, so good I could cry!",
  malai:"A jasmine garland! Same name as me~ I'll hang it on my bedroom mirror",
  doll:"Such a cute tiger plushie! I'll hug it every night and name it 'Little Coach'",
  book:"A statistics book… so many numbers my eyes are spinning. Can I not read it?",
  stickers:"Ring stickers! I'll stick them on my water bottle so everyone's jealous~",
  wrap:"The kanok hand wraps are beautiful. I'll wrap them the way the Chaiya master taught",
  coffee:"Coffee beans… I can't brew it, but I'll send them to Mom, she loves it",
  sausage:"Isan sausage! I can share it with so many of my siblings. Thank you~",
  tea:"Oolong tea, I'll brew it for everyone after training to cool down",
  sketch:"A sketchbook! I'll write down khanom khrok recipes for my future shop~",
  shorts:"Shorts embroidered with Mali! With jasmine flowers too~ I'll take a photo for Mom first",
  prajiad:"Such a pretty prajiad. I'll tie it for wai khru, the Chaiya master will definitely compliment it",
  photo:"Our team photo! Mali has the funniest face, haha. I'll put it by my bed",
  spa:"Spa!! How did you know Mali's legs have been sore for three days~ Wanna come too? Hehe",
  bracelet:"A kanok silver bracelet… so sparkly. I'll wear it to the night market so everyone sees~",
  mongkhon:"A mongkhon you braided yourself… this part's a little crooked, but that's exactly what I love about it"},
 rin:{coffee:"Light-roast Doi beans… you picked perfectly. I'll make a pour-over for you to taste",
  book:"I've wanted this book for ages. The statistical comparison tables are very detailed. Thank you",
  tea:"Mae Salong oolong… it smells good. Perfect for nights of fight analysis",
  sausage:"Sausage… too much fat and sodium during a weight cut. I'll pass it to Fah",
  stickers:"Stickers… I suppose I can put one on my laptop",
  wrap:"Good-quality wraps. I'll hand them out to our fighters for training",
  khanom:"Khanom khrok… a bit sweet for me, but it pairs well with black coffee",
  malai:"A garland… thank you. I'll offer it at the temple tomorrow morning",
  sketch:"A leather notebook. I'll handwrite training plans in it; sometimes paper helps me think better than a screen",
  doll:"A plushie… I can put it on my desk. It's… not that cute or anything",
  shorts:"Name-embroidered shorts… they make me feel like a real fighter, not just the stats girl. Thank you",
  prajiad:"A prajiad… statistically it has no effect, but I'll tie it on. Just in case",
  photo:"The team photo… I'm at the edge as usual, but at least I'm in it",
  spa:"A spa day really does help muscle recovery. I'll book it for the day after a fight",
  bracelet:"…A silver bracelet. You think I wear things like this? …I didn't say I don't like it. Don't look at me like that",
  mongkhon:"A hand-braided mongkhon… I can't measure how much it's worth, but I'll keep it safe"},
 ploy:{tea:"…I've drunk this shop's tea since I was a child. Truly, thank you. Shall we brew some together tonight?",
  wrap:"Good wraps, dense weave. I'll let my juniors use them first",
  malai:"Jasmine garland smells nice. I'll offer it at wai khru before morning training",
  doll:"A plushie… I'm not a child. But… thank you",
  stickers:"Stickers? I'll save them for the juniors, they love these",
  khanom:"The khanom khrok is still hot. Eat with me, I can't finish it alone",
  coffee:"Coffee… I drink tea more, but I'll try brewing it",
  sausage:"Isan sausage… a Korat favorite. I'll grill it with the juniors tonight",
  sketch:"A good leather notebook. I'll record the Korat techniques my coach taught me",
  book:"A statistics book… I don't read numbers much, but I'll take a look",
  shorts:"Embroidered shorts… I have a closet full of sponsor gear, but I'll keep these to train in myself",
  prajiad:"A prajiad… my first Korat coach tied one like this. I never thought anyone would give me another. Truly, thank you",
  photo:"A photo of your camp… I'm not from this camp. Where would I even put it?",
  spa:"A spa voucher… I rarely rest. I'll try it someday",
  bracelet:"A silver bracelet, pretty. I'll wear it when I'm not training",
  mongkhon:"You braided this yourself… your hands aren't a craftsman's, but I'll wear it"},
 fah:{sausage:"Huh! A big set of sausage! You know Fah best! Grill it, grill it, I'm starving!",
  sketch:"A leather sketchbook… not bad. Fah'll draw you a tiger",
  doll:"A tiger plushie? …It's fierce, I guess. Fah'll keep it in the locker. Don't tell anyone",
  tea:"Tea? Fah's not a grandma. Give it to Ploy",
  stickers:"Ring stickers, they'd look cool on a helmet",
  wrap:"Kanok wraps… Golden Tiger only lets us use sponsor gear, Fah'll sneak them on at training",
  khanom:"Khanom khrok… gone in three bites. Got another bag?",
  malai:"A garland? Fah'll hang it on Grandma's motorbike",
  coffee:"Roasted coffee… good before a morning run. Thanks",
  book:"A book of nothing but numbers… give it to your camp manager",
  shorts:"Shorts with a big 'FAH' embroidered! So cool! Wearing them next fight so everyone remembers Fah's name!",
  prajiad:"A prajiad… Grandma had one too. Fah'll tie it on the left arm",
  photo:"A photo of your camp… Fah's not even in it. Fine, put it somewhere",
  spa:"A spa? Fah's not some rich lady! …But if it's free, Fah'll go",
  bracelet:"A bracelet… mm, not that Fah likes it, just something to keep the hands busy",
  mongkhon:"A self-braided mongkhon… so crooked, haha …no, you're not getting it back, Fah's keeping it"},
};
// v1.34: more gifts, a few of them silly on purpose
Object.assign(GIFTS,{moo:{name:"20 sticks of moo ping with sticky rice",price:200,cat:"food"},pla:{name:"Big basket of Mae Klong mackerel",price:160,cat:"food"},
  yadom:{name:"Herbal smelling salts, 12-pack",price:120,cat:"keep",fun:1},helmet:{name:"Golden helmet (confiscated from the gang)",price:60,cat:"wear",fun:1},
  poster:{name:"Life-size poster of the Manager",price:450,cat:"keep",fun:1},rooster:{name:"A real fighting rooster named Diamond",price:800,cat:"keep",fun:1}});
[["kati",{like:["moo","yadom","poster"],dislike:["rooster"]}],["mali",{love:["moo"],like:["pla","poster"],dislike:["rooster"]}],["rin",{like:["yadom"],dislike:["poster","moo"]}],
 ["ploy",{like:["pla","yadom"],dislike:["poster","helmet"]}],["fah",{love:["rooster"],like:["helmet","moo"],dislike:["yadom"]}]].forEach(([id,P])=>{for(const k in P)GIFT_PREF[id][k].push(...P[k]);});
const GIFT_TALK2={
 kati:{moo:"Moo ping and sticky rice! This is real fighter food. I'm taking the first three sticks, the rest for Coach Daeng",pla:"Mackerel! I'll fry it for the whole camp tomorrow morning; the whole lane will smell it",
  yadom:"Twelve smelling salts! I'll put them in every corner of camp in case anyone gets dizzy training hard",helmet:"That gang's helmet… I'll wear it when I bike to the market so they see it and get scared!",
  poster:"A poster… of the Manager… life-size. I'll… hang it outside the training room. For motivation (blushing)",rooster:"A chicken!? You're giving me a chicken!? It's pecking me! Diamond is pecking me!!"},
 mali:{moo:"Moo pinggg! Mali smelled it the moment you walked in. Thank you, Mali's eating it with sticky rice right now~",pla:"Mackerel! I miss home. Down south we eat it with shrimp-paste chili dip. Mali'll make some for you",
  yadom:"So many smelling salts~ Mali will keep one for the bus ride home",helmet:"A golden helmet… can Mali bake khanom krok in it? It's the same shape as the pan, hehe",
  poster:"Wow~ it's you, life-size! Mali'll put it by the bed, wait, no, by the camp gate is better!",rooster:"Eek! That chicken's bigger than our dog back home! Mali's scared, let Diamond live with the rooster boss instead"},
 rin:{moo:"Moo ping… very high in saturated fat. But… it smells so good I can't do the math. One stick, please",pla:"Mackerel. Good protein, high omega-3. A logical gift. Thank you",
  yadom:"Twelve smelling salts. I'll pin them to the stats board for when the numbers won't add up",helmet:"That gang's helmet… I'll keep it as evidence, in case it's needed in court",
  poster:"…A poster of you, life-size. I don't know where to put it so I won't have to make eye contact",rooster:"A fighting rooster… about two years old, strong legs. If he could box, I'd analyze him"},
 ploy:{moo:"Market moo ping… I haven't had this in ages; Golden Tiger watches our diet closely. Thank you",pla:"Mae Klong mackerel, bent necks and all, the real thing. I'll make tom yum for the juniors tonight",
  yadom:"Herbal smelling salts… I like this scent. It reminds me of Grandma. Thank you",helmet:"A thug's helmet… why give this to me? Return it to its owner",
  poster:"…You want me to hang your face up at Golden Tiger? The boss would faint",rooster:"A fighting rooster… I don't keep animals, but this one stands up straight. Disciplined. Thank you"},
 fah:{moo:"Moo ping! Fah can eat thirty sticks, you only bought twenty? …Kidding. Thanks",pla:"Mackerel? Fah's not a cat! …But Iron Fist will love it. Thanks on his behalf",
  yadom:"Smelling salts? Fah's not some old auntie! Give them to Rin",helmet:"Ha! Their helmet! Fah's wearing it round the market so they know who really runs this town!",
  poster:"A poster of YOU… who'd want that!! …Fine, give it. Fah'll use it as a kicking target (but hang it in the bedroom)",rooster:"A FIGHTING ROOSTER!!! Diamond! He's the coolest thing in the world! Fah's gonna teach him to kick! And introduce him to Iron Fist!"}};
for(const id in GIFT_TALK2)Object.assign(GIFT_TALK[id],GIFT_TALK2[id]);
// v1.34: after many gifts she says something about it, and after more she gives one back
const GIFT_FREQ={
 kati:[[{n:"kati",f:"flustered",t:"Manager… if you keep giving me things, Coach Daeng teases that I'm the favorite grandkid"},{n:"coach",t:"It's true. Kati's room has more stuff than the glove room now"}],
  [{n:"kati",f:"happy",t:"This time let me give you something back! Hand wraps I wrapped myself. They're not very neat, but I tried really hard"},{n:"nar",t:"Red hand wraps with a little bow tied at the end, held out with both hands"}]],
 mali:[[{n:"mali",f:"flustered",t:"You've given Mali so much that Mom called to ask, 'Who is this manager, dear?' Mali didn't know what to say~"}],
  [{n:"mali",f:"happy",t:"Now it's Mali's turn! The first tray from the pan I've practiced on all month. Only a little burnt. Try it"},{n:"nar",t:"Only half the tray is burnt. The other half is so good you forget the first"}]],
 rin:[[{n:"rin",f:"flustered",t:"I've been keeping stats. You've given me gifts 5 times, well above the average person… I'm not complaining"}],
  [{n:"rin",f:"happy",t:"This time I prepared something for you. A summary of every fight our camp has had, handwritten, the whole book"},{n:"nar",t:"The first page reads: 'For the Manager, who gives every number its meaning'"}]],
 ploy:[[{n:"ploy",f:"flustered",t:"You give me things so often the juniors at Golden Tiger are getting suspicious. I have to say a fan sent them"}],
  [{n:"ploy",f:"happy",t:"Take it. Tea from the hills that I roasted with my grandma. I've never given it to anyone outside family"},{n:"nar",t:"A neat packet of tea leaves tied with banana string, with small handwriting: 'Brew at 85 degrees'"}]],
 fah:[[{n:"fah",f:"flustered",t:"You give Fah stuff so often, Iron Fist is getting jealous! …Fah's not jealous, Fah said the CAT is jealous!"}],
  [{n:"fah",f:"pout",t:"Here! I didn't buy it for you, I just found it"},{n:"nar",t:"A leather wristband stitched with tiny letters: 'Team Fah'. The price tag is still on it: ฿390"}]]};
// v1.5: sulky / shy moments that use the new casual expressions
CHATTER.push(
 {id:"c_kati_jealous",need:G=>G.F.kati.bond>=30&&["mali","rin","fah","ploy"].some(id=>G.F[id].bond>=25),bg:"night",look:"casual",steps:[
  {n:"kati",f:"pout",t:G=>{const o=["mali","rin","fah","ploy"].filter(id=>G.F[id].bond>=25).sort((a,b)=>G.F[b].bond-G.F[a].bond)[0];return `I heard you went out yesterday with ${G.F[o].name}? …Not that I'm asking because I want to know. Just asking`;}},
  {choice:[{t:"Next week I'll go with you",fx:G=>add(G,"kati","bond",3),then:[{n:"kati",f:"flustered",t:"…That's a promise! No backing out!"}]},
   {t:"Just checking out some camp business",then:[{n:"kati",f:"pout",t:"Hmph… what kind of camp business involves eating bingsu?"}]}]}]},
 {id:"c_rin_praise",need:G=>G.F.rin.camp==="player"&&G.F.rin.bond>=35,bg:"camp",look:"casual",steps:[
  {n:"rin",f:"happy",t:"I've completely redone this month's training schedule. Everyone's fatigue is down twelve percent"},
  {choice:[{t:"Amazing. Without Rin this camp would fall apart",fx:G=>add(G,"rin","bond",4),then:[{n:"rin",f:"flustered",t:"…That's an exaggeration. I dislike exaggeration. …But I'll allow it this once"}]},
   {t:"The numbers look good",then:[{n:"rin",f:"pout",t:"Look good… that's it? I skipped sleep for three nights"}]}]}]},
 {id:"c_fah_sulk",need:G=>G.F.fah.met&&G.F.fah.bond>=30,bg:"fair",look:"casual",steps:[
  {n:"nar",t:"Fah is squatting behind the temple-fair ring, sulking like a cat whose fish got stolen"},
  {n:"fah",f:"pout",t:"The boss won't let me eat sausage before weigh-ins… what's left to live for"},
  {choice:[{t:"After weigh-ins, a big feast on me",fx:G=>add(G,"fah","bond",4),then:[{n:"fah",f:"flustered",t:"Huh… for real? …Fine. Not that Fah's happy or anything"}]},
   {t:"Hang in there",then:[{n:"fah",f:"pout",t:"Hmph. Anyone can say that"}]}]}]},
 {id:"c_ploy_shy",need:G=>G.F.ploy.met&&G.F.ploy.bond>=35,bg:"river",look:"casual",steps:[
  {n:"ploy",f:"happy",t:"My juniors say I'm too strict… am I really?"},
  {choice:[{t:"Strict, but the kindest senior in camp",fx:G=>add(G,"ploy","bond",4),then:[{n:"ploy",f:"flustered",t:"…Don't say that in front of others. I won't know how to act"}]},
   {t:"A little strict",then:[{n:"ploy",f:"pout",t:"A little still means strict… understood"}]}]}]},
 {id:"c_mali_tease",need:G=>G.F.mali.camp==="player"&&G.F.mali.bond>=35,bg:"food",look:"casual",steps:[
  {n:"mali",f:"flustered",t:"Boss~ if I win the next fight, take me to the usual khanom khrok shop! Promise!"},
  {choice:[{t:"Okay, if you win we'll go, just the two of us",fx:G=>add(G,"mali","bond",4),then:[{n:"mali",f:"flustered",t:"Just us two! …Uh, I mean, I'm happy to eat snacks!"}]},
   {t:"Let's invite everyone in camp",then:[{n:"mali",f:"pout",t:"Everyone? …Okay"}]}]}]}
);
