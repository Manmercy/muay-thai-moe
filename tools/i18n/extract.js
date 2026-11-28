// collect every string literal / template chunk containing Thai, with positions
const acorn=require('acorn'),walk=require('acorn-walk'),fs=require('fs');
const SRC=(process.env.SRC||'../../src/'),FILES=['engine','chibi','data','story','pixel','campart','campcard','ui','quest','chat','xlove','quizshow','ghost','pets','scard','guide','road','region'];const TH=/[฀-๿]/;
const out={};let segs=new Map();
for(const f of FILES){const code=fs.readFileSync(SRC+f+'.js','utf8');const ast=acorn.parse(code,{ecmaVersion:2022,sourceType:'script',allowReturnOutsideFunction:true});const L=[];
  const B={...walk.base,Property(n,st,c){if(n.key.type==='Literal')c(n.key,st);walk.base.Property(n,st,c);}};
  walk.full(ast,n=>{if(n.type==='Literal'&&typeof n.value==='string'&&TH.test(n.value))L.push({k:'s',s:n.start,e:n.end,v:n.value});
    if(n.type==='TemplateElement'&&TH.test(n.value.cooked))L.push({k:'t',s:n.start,e:n.end,v:n.value.cooked});},B);
  const by=new Map(L.filter(x=>x.k==='s').map(x=>[x.s,x]));const isStr=n=>n.type==='Literal'&&typeof n.value==='string'||n.type==='TemplateLiteral';
  const rm=n=>n.type==='BinaryExpression'&&n.operator==='+'?rm(n.right):n;
  walk.full(ast,n=>{if(n.type!=='BinaryExpression'||n.operator!=='+')return;
    if(n.right.type==='Literal'&&by.has(n.right.start)&&!isStr(rm(n.left)))by.get(n.right.start).pre=1;
    const lr=rm(n.left);if(lr.type==='Literal'&&by.has(lr.start)&&!isStr(n.right))by.get(lr.start).post=1;},B);
  out[f]=L;for(const x of L)segs.set(x.v,(segs.get(x.v)||'')||f);}
fs.writeFileSync('pos.json',JSON.stringify(out));
const arr=[...segs.keys()];fs.writeFileSync('segs.json',JSON.stringify(arr));
console.log('unique',arr.length,'chars',arr.reduce((a,b)=>a+b.length,0));
