// ================= MUAY THAI MOE v1.2 — SYNTH AUDIO (no files) =================
const AU={ctx:null,master:null,music:null,sfxBus:null,crowdG:null,timer:null,step:0,next:0,tempo:132,muted:false,playing:false,
  init(){if(this.ctx)return true;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;this.ctx=new C();}catch(e){return false;}
    const c=this.ctx;this.master=c.createGain();this.master.gain.value=this.muted?0:.8;this.master.connect(c.destination);
    this.music=c.createGain();this.music.gain.value=.32;this.music.connect(this.master);this.sfxBus=c.createGain();this.sfxBus.gain.value=.9;this.sfxBus.connect(this.master);
    // noise buffer
    const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.noise=b;
    // crowd bed
    const n=c.createBufferSource();n.buffer=b;n.loop=true;const bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=900;bp.Q.value=.6;
    this.crowdG=c.createGain();this.crowdG.gain.value=0;n.connect(bp);bp.connect(this.crowdG);this.crowdG.connect(this.master);n.start();
    return true;},
  setMuted(m){this.muted=m;try{localStorage.setItem("mtm-mute",m?"1":"0");}catch(e){}if(this.master)this.master.gain.setTargetAtTime(m?0:.8,this.ctx.currentTime,.05);},
  // v1.9: iOS leaves the context "interrupted" after switching apps — resume on any state but running,
  // play a 1-sample buffer to unlock, and ask Safari to ignore the silent switch for game audio
  resume(){if(!this.init())return;const c=this.ctx;try{if(navigator.audioSession&&navigator.audioSession.type!=="playback")navigator.audioSession.type="playback";}catch(e){}
    if(c.state!=="running"){const p=c.resume();if(p&&p.catch)p.catch(()=>{});}
    if(!this.unlocked){try{const s=c.createBufferSource();s.buffer=c.createBuffer(1,1,22050);s.connect(c.destination);s.start(0);this.unlocked=true;}catch(e){}}
    if(this.playing&&this.next<c.currentTime)this.next=c.currentTime+.05;},
  env(g,t,a,d,peak){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);},
  noiseHit(t,{f=1200,type="lowpass",q=1,dur=.12,peak=.8,sweep=0}){const c=this.ctx,s=c.createBufferSource();s.buffer=this.noise;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);
    if(sweep)fl.frequency.exponentialRampToValueAtTime(Math.max(60,f*sweep),t+dur);fl.Q.value=q;const g=c.createGain();this.env(g,t,.004,dur,peak);s.connect(fl);fl.connect(g);g.connect(this.sfxBus);s.start(t,Math.random());s.stop(t+dur+.05);},
  tone(t,{f=200,type="sine",dur=.15,peak=.6,to=0,bus}){const c=this.ctx,o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);
    const g=c.createGain();this.env(g,t,.005,dur,peak);o.connect(g);g.connect(bus||this.sfxBus);o.start(t);o.stop(t+dur+.05);},
  sfx(kind){if(!this.init()||this.muted||!SETTINGS.sfx)return;const t=this.ctx.currentTime+.01;
    if(kind==="punch"){this.noiseHit(t,{f:1400,dur:.09,peak:.9});this.tone(t,{f:120,to:55,dur:.12,peak:.8});}
    if(kind==="kick"){this.noiseHit(t,{f:3000,type:"bandpass",q:.8,dur:.16,peak:.5,sweep:.25});this.noiseHit(t+.08,{f:900,dur:.1,peak:.9});this.tone(t+.08,{f:95,to:45,dur:.16,peak:.9});}
    if(kind==="knee"){this.tone(t,{f:80,to:40,dur:.18,peak:1});this.noiseHit(t,{f:500,dur:.12,peak:.7});}
    if(kind==="elbow"){this.noiseHit(t,{f:4500,type:"highpass",dur:.05,peak:.9});this.tone(t,{f:160,to:70,dur:.08,peak:.6});}
    if(kind==="miss"){this.noiseHit(t,{f:2500,type:"bandpass",q:.7,dur:.2,peak:.25,sweep:.4});}
    if(kind==="kd"){this.tone(t,{f:70,to:30,dur:.4,peak:1});this.noiseHit(t,{f:300,dur:.3,peak:.8});this.cheer(1);}
    if(kind==="bell"){for(let i=0;i<3;i++){const s=t+i*.32;[1,2.76,5.4].forEach((m,k)=>this.tone(s,{f:880*m,dur:1.4/(k+1),peak:.35/(k+1)}));}}
    if(kind==="bell1"){[1,2.76,5.4].forEach((m,k)=>this.tone(t,{f:880*m,dur:1.4/(k+1),peak:.35/(k+1)}));}
    if(kind==="ui"){this.tone(t,{f:880,type:"square",dur:.035,peak:.16});this.tone(t+.035,{f:1320,type:"square",dur:.04,peak:.12});}
    if(kind==="win"){[523,659,784,1047].forEach((f,i)=>this.tone(t+i*.12,{f,type:"square",dur:i===3?.45:.12,peak:.18}));this.cheer(1);}
    if(kind==="champ"){[392,523,659,784,1047].forEach((f,i)=>this.tone(t+i*.13,{f,type:"triangle",dur:i===4?1.1:.3,peak:.22}));this.noiseHit(t+.7,{f:3300,type:"highpass",dur:.7,peak:.25});this.cheer(1);}
    if(kind==="lose"){[392,349,311,262].forEach((f,i)=>this.tone(t+i*.22,{f,type:"triangle",dur:i===3?.6:.22,peak:.2}));}
    if(kind==="tick"){this.tone(t,{f:1500,type:"triangle",dur:.03,peak:.14});}
    if(kind==="choose"){this.tone(t,{f:660,type:"square",dur:.05,peak:.14});this.tone(t+.05,{f:990,type:"square",dur:.06,peak:.12});}
    if(kind==="level"){[523,659,784,1046].forEach((f,i)=>this.tone(t+i*.09,{f,type:"square",dur:.12,peak:.15}));}
  },
  cheer(level){if(!this.init())return;const g=this.crowdG.gain,t=this.ctx.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);
    g.linearRampToValueAtTime(this.muted?0:.12+level*.25,t+.15);g.linearRampToValueAtTime(this.muted||!(UI&&UI.fight)?0:.06,t+1.6);}, /* v1.80: the roar always settles back, and to silence once the fight is over */
  // --- Sarama-style loop: pi java + klong khaek + ching ---
  MEL:[69,0,71,69,67,0,64,67,69,0,0,67,64,62,64,0,67,69,71,74,71,69,67,0,64,67,69,67,64,62,0,0],
  mode:"fight",
  startMusic(mode="fight"){if(!this.init())return;this.resume();{const g=this.crowdG.gain,t=this.ctx.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.setTargetAtTime(this.muted||mode!=="fight"?0:.03,t,.3);}if(!SETTINGS.music)return;
    const prev=this.mode;this.mode=mode;this.tempo=mode==="hub"?84:mode==="title"?148:mode==="victory"?144:mode==="date"?70:mode==="waikhru"?62:Math.max(this.tempo,120);
    if(this.music)this.music.gain.setTargetAtTime(mode==="hub"?.2:mode==="title"?.3:mode==="victory"?.36:mode==="date"?.22:.32,this.ctx.currentTime,.4);
    this.crowdG.gain.setTargetAtTime(this.muted||mode!=="fight"?0:.03,this.ctx.currentTime,.5);
    if(this.playing)return;this.playing=true;this.step=0;this.next=this.ctx.currentTime+.1;
    this.timer=setInterval(()=>this.sched(),25);},
  watch(){if(!this.ctx||!this.playing)return;if(this.ctx.state!=="running")this.resume();if(this.next<this.ctx.currentTime-.2)this.next=this.ctx.currentTime+.05;},
  stopMusic(){this.playing=false;clearInterval(this.timer);if(this.crowdG){const g=this.crowdG.gain,t=this.ctx.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.setTargetAtTime(0,t,.3);}},
  setTempo(b){this.tempo=b;},
  sched(){const c=this.ctx;const spb=60/this.tempo/2;while(this.next<c.currentTime+.12){this.playStep(this.step,this.next,spb);this.next+=spb;this.step=(this.step+1)%32;}},
  HUB:[76,0,79,0,81,79,76,0,74,0,76,0,0,0,72,74,76,0,79,81,84,0,81,79,76,0,74,72,74,0,0,0],
  playStep(s,t,spb){const m=this.music,st=s%16;if(this.mode==="hub"){this.hubStep(s,t,spb);return;}if(this.mode==="title"){this.titleStep(s,t,spb);return;}if(this.mode==="victory"){this.victoryStep(s,t,spb);return;}if(this.mode==="date"){this.dateStep(s,t,spb);return;}if(this.mode==="waikhru"){this.waiStep(s,t,spb);return;}
    // ching (open on 0, closed "chap" on 8)
    if(st===0)[2600,3900,5200].forEach((f,k)=>this.tone(t,{f,dur:.5/(k+1),peak:.08/(k+1),bus:m}));
    if(st===8)this.tone(t,{f:3100,dur:.06,peak:.08,bus:m});
    // klong khaek: tum (low) & ting (high slap)
    if([0,3,6,10,12].includes(st))this.tone(t,{f:150,to:95,dur:.16,peak:.5,bus:m});
    if([2,5,8,11,14,15].includes(st)){this.tone(t,{f:420,to:300,dur:.06,peak:.25,bus:m});}
    // pi java
    const n=this.MEL[s];if(n){const f=440*Math.pow(2,(n-69)/12),c=this.ctx,o=c.createOscillator(),o2=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),bp=c.createBiquadFilter(),g=c.createGain();
      o.type="sawtooth";o2.type="square";o.frequency.value=f;o2.frequency.value=f*1.003;lfo.frequency.value=6;lg.gain.value=f*.012;lfo.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
      bp.type="bandpass";bp.frequency.value=1500;bp.Q.value=1.6;const dur=spb*1.9;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(bp);o2.connect(bp);bp.connect(g);g.connect(m);[o,o2,lfo].forEach(x=>{x.start(t);x.stop(t+dur+.05);});}
  },
  // Championship fanfare: brass-like lead over a rising bass, ching and arena drums.
  VICTORY:[72,0,76,79,84,0,79,76,77,0,81,84,89,0,84,81,79,0,83,86,91,0,86,83,84,0,79,76,72,0,72,84],
  victoryStep(s,t,spb){const m=this.music,st=s%8,n=this.VICTORY[s],ch=[[48,52,55],[53,57,60],[55,59,62],[48,52,55]][Math.floor(s/8)];
    if(st===0){ch.forEach((v,i)=>this.tone(t,{f:440*Math.pow(2,(v-69)/12),type:"sawtooth",dur:spb*7,peak:i===0?.09:.045,bus:m}));this.tone(t,{f:130,to:65,dur:.22,peak:.3,bus:m});}
    if(st===4)this.tone(t,{f:420,to:250,dur:.08,peak:.17,bus:m});
    if(st%2===0)this.tone(t,{f:2700,dur:.15,peak:.035,bus:m});
    if(n){const f=440*Math.pow(2,(n-69)/12);this.tone(t,{f,type:"sawtooth",dur:spb*1.35,peak:.09,bus:m});this.tone(t,{f:f*2,type:"sine",dur:spb*.9,peak:.035,bus:m});}
  },
  // v1.12 wai khru: slow pi java over sparse klong khaek and ringing ching
  WAI:[64,0,0,0,67,0,69,0,67,0,64,0,62,0,0,0,64,0,67,0,69,0,72,0,69,0,67,0,64,0,0,0],
  waiStep(s,t,spb){const m=this.music,st=s%16;
    if(st%8===0)[2600,3900,5200].forEach((f,k)=>this.tone(t,{f,dur:1.2/(k+1),peak:.07/(k+1),bus:m}));
    if(st%8===4)this.tone(t,{f:3100,dur:.07,peak:.06,bus:m});
    if(st===0||st===10)this.tone(t,{f:140,to:90,dur:.3,peak:.45,bus:m});
    if(st===6||st===14)this.tone(t,{f:400,to:290,dur:.08,peak:.2,bus:m});
    const n=this.WAI[s];if(n){const f=440*Math.pow(2,(n-69)/12),c=this.ctx,o=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),bp=c.createBiquadFilter(),g=c.createGain();
      o.type="sawtooth";o.frequency.value=f;lfo.frequency.value=5;lg.gain.value=f*.015;lfo.connect(lg);lg.connect(o.frequency);bp.type="bandpass";bp.frequency.value=1400;bp.Q.value=1.8;
      const dur=spb*3.6;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.14,t+.08);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(bp);bp.connect(g);g.connect(m);[o,lfo].forEach(x=>{x.start(t);x.stop(t+dur+.05);});}
  },
  // upbeat festival loop for the title screen: ranat-style lead, bass, klong, ching
  TTL:[81,84,86,84,81,0,79,81,84,0,86,88,86,84,81,79,81,84,86,88,91,88,86,84,86,0,84,81,79,81,84,0],
  TBASS:[45,45,52,45,43,43,50,43,45,45,52,45,48,48,52,50],
  titleStep(s,t,spb){const m=this.music,st=s%16;
    if(st%4===0)[2600,3900,5200].forEach((f,k)=>this.tone(t,{f,dur:.3/(k+1),peak:.06/(k+1),bus:m}));
    if(st%4===2)this.tone(t,{f:3100,dur:.04,peak:.06,bus:m});
    if([0,4,8,11,12].includes(st))this.tone(t,{f:140,to:70,dur:.16,peak:.55,bus:m});
    if([2,6,10,14,15].includes(st))this.tone(t,{f:430,to:320,dur:.05,peak:.22,bus:m});
    if(st%2===0){const b=this.TBASS[(s>>1)%16];this.tone(t,{f:440*Math.pow(2,(b-69)/12),type:"triangle",dur:spb*1.6,peak:.28,bus:m});}
    const n=this.TTL[s];if(n){const f=440*Math.pow(2,(n-69)/12);this.tone(t,{f,type:"square",dur:spb*.9,peak:.07,bus:m});this.tone(t,{f:f*2,type:"sine",dur:spb*.5,peak:.05,bus:m});}
  },
  // soft, warm loop for private time: khim-like plucks over a slow pad
  DATE:[72,0,76,0,79,0,76,0,74,0,77,0,81,0,79,77,76,0,79,0,84,0,83,0,81,0,79,0,76,0,0,0],
  DCH:[[48,55,64],[50,57,65],[53,60,69],[55,62,71]],
  dateStep(s,t,spb){const m=this.music,st=s%16;
    if(st===0){const ch=this.DCH[(s>>3)%4];ch.forEach(n=>this.tone(t,{f:440*Math.pow(2,(n-69)/12),type:"sine",dur:spb*15,peak:.07,bus:m}));}
    if(st===0||st===8)this.tone(t,{f:2900,dur:.9,peak:.025,bus:m});
    const n=this.DATE[s];if(n){const f=440*Math.pow(2,(n-69)/12);this.tone(t,{f,type:"triangle",dur:spb*2.4,peak:.13,bus:m});this.tone(t+.01,{f:f*2,type:"sine",dur:spb*1.2,peak:.035,bus:m});}
  },
  hubStep(s,t,spb){const m=this.music,st=s%16;
    if(st===0)[2600,3900].forEach((f,k)=>this.tone(t,{f,dur:.6/(k+1),peak:.05/(k+1),bus:m}));
    if(st===8)this.tone(t,{f:3100,dur:.05,peak:.05,bus:m});
    if(st===0||st===10)this.tone(t,{f:120,to:85,dur:.22,peak:.35,bus:m});
    const n=this.HUB[s];if(n){const f=440*Math.pow(2,(n-69)/12);this.tone(t,{f,type:"triangle",dur:spb*1.6,peak:.14,bus:m});this.tone(t,{f:f*2,type:"sine",dur:spb*.8,peak:.04,bus:m});}
  },
};
const SETTINGS={music:true,sfx:true,coach:true,quick:false};
try{Object.assign(SETTINGS,JSON.parse(localStorage.getItem("mtm-settings")||"{}"));}catch(e){}
function saveSettings(){try{localStorage.setItem("mtm-settings",JSON.stringify(SETTINGS));}catch(e){}}
