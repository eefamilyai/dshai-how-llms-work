
// ---------- tokenizer demo ----------
const TOKIN = document.getElementById('tokin');
const TOKOUT = document.getElementById('tokout');
function fakeId(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return Math.abs(h)%199000+1000}
function splitTokens(text){
  const out=[]; const re=/(\s?[A-Za-z]+|\s?\d+|\s?[^\sA-Za-z\d]+)/g; let m;
  while((m=re.exec(text))!==null){ if(m[0]!=='') out.push(m[0]); }
  const res=[];
  for(const t of out){
    if(t.replace(/\s/g,'').length>11){ // chop very long words
      let body=t.trim(), pre=t.startsWith(' ')?' ':'';
      for(let i=0;i<body.length;i+=6) res.push((i===0?pre:'')+body.slice(i,i+6));
    } else res.push(t);
  }
  return res;
}
function renderTokens(){
  const toks=splitTokens(TOKIN.value);
  TOKOUT.innerHTML='';
  toks.forEach(t=>{
    const d=document.createElement('div'); d.className='tok';
    const shown=t.replace(/ /g,'␣');
    d.innerHTML='<span>'+shown.replace(/[<>&]/g,c=>({'<':'<','>':'>','&':'&'}[c]))+'</span><i>'+fakeId(t)+'</i>';
    TOKOUT.appendChild(d);
  });
  if(!toks.length) TOKOUT.innerHTML='<span class="small muted">Type something above.</span>';
}
TOKIN.addEventListener('input',renderTokens); renderTokens();

// ---------- embedding vector ----------
(function(){
  const v=document.getElementById('vec1');
  for(let i=0;i<14;i++){
    const val=Math.sin(i*1.7+2)*0.5+Math.sin(i*0.6)*0.5;
    const hue=200+val*90; const l=28+Math.abs(val)*34;
    const c=document.createElement('i');
    c.style.background='hsl('+hue+',72%,'+l+'%)';
    c.textContent=val.toFixed(1);
    v.appendChild(c);
  }
})();

// ---------- attention demo ----------
const SENT=['The','cat','sat','on','the','mat','because','it','was','tired'];
const LINKS={0:[0],1:[0],2:[1],3:[2],4:[3],5:[4,3],6:[2],7:[1],8:[7],9:[7,8]};
const NOTES={
  0:'The first token has nothing before it, so it can only attend to itself.',
  1:'"cat" leans on its determiner.',
  2:'"sat" reaches back to its subject.',
  7:'This is the interesting one. "it" resolves to "cat", not to "mat" — coreference is learned, not given.',
  9:'"tired" gathers the pronoun and the verb to complete the predicate.'
};
const at=document.getElementById('attnToks'), ab=document.getElementById('attnBars'), an=document.getElementById('attnNote');
let cur=7;
function drawAttn(i){
  cur=i; an.textContent=NOTES[i]||('"'+SENT[i]+'" mostly follows the recent context.');
  at.innerHTML=''; ab.innerHTML='';
  SENT.forEach((t,j)=>{
    const c=document.createElement('button'); c.className='tokchip'+(j===i?' on':''); c.textContent=t;
    c.onclick=()=>drawAttn(j); at.appendChild(c);
  });
  const chosen=LINKS[i];
  const w=SENT.map((_,j)=>{
    if(j>i) return 0;
    let base=0.06*Math.pow(0.82,i-j);
    if(chosen.includes(j)) base+=0.85/chosen.length;
    return base;
  });
  const s=w.reduce((a,b)=>a+b,0);
  const norm=w.map(x=>x/s);
  SENT.forEach((t,j)=>{
    const d=document.createElement('div'); d.className='bar';
    const f=document.createElement('div'); f.className='fill';
    f.style.height=Math.max(2,norm[j]*120)+'px';
    f.style.opacity=j>i?0.12:1;
    if(j===i) f.style.background='linear-gradient(180deg,var(--amber),#b45309)';
    const l=document.createElement('div'); l.className='lb'; l.textContent=t;
    d.appendChild(f); d.appendChild(l); ab.appendChild(d);
    if(j===i) at.children[j].classList.add('on');
    else if(norm[j]>0.10) at.children[j].classList.add('att');
  });
}
drawAttn(7);

// ---------- causal mask ----------
(function(){
  const n=10, g=document.getElementById('maskGrid');
  g.style.gridTemplateColumns='repeat('+n+',1fr)';
  for(let r=0;r<n;r++) for(let c=0;c<n;c++){
    const i=document.createElement('i');
    if(c<=r) i.className=(c===r?'diag':'vis');
    g.appendChild(i);
  }
})();

// ---------- heads ----------
(function(){
  const g=document.getElementById('headGrid');
  const names=['previous-token','coreference','syntactic dependency','rare-token / delimiter'];
  const n=12;
  for(let h=0;h<4;h++){
    const card=document.createElement('div'); card.className='card';
    const t=document.createElement('div'); t.className='pill'; t.style.fontSize='10px'; t.textContent=names[h];
    const m=document.createElement('div'); m.className='mask'; m.style.gridTemplateColumns='repeat('+n+',1fr)';
    for(let r=0;r<n;r++) for(let c=0;c<n;c++){
      const i=document.createElement('i');
      let on=false;
      if(c<=r){
        if(h===0) on=(c===r-1);
        else if(h===1) on=(c===0||(r>7&&c===2));
        else if(h===2) on=(c===r||(r-c)%4===0);
        else on=(c===r)||((r*c)%7===0);
      }
      if(on) i.className=(c===r?'diag':'vis');
      m.appendChild(i);
    }
    card.appendChild(t); card.appendChild(m); g.appendChild(card);
  }
})();

// ---------- logits ----------
(function(){
  const data=[['Paris',96.4],['the',1.1],['a',0.7],['located',0.5],['France',0.4],['city',0.3],['home',0.2],['other…',0.4]];
  const g=document.getElementById('logitBars');
  data.forEach(([nm,p])=>{
    const r=document.createElement('div'); r.className='brow'+(p>50?' win':'');
    r.innerHTML='<span class="nm">'+nm+'</span><span class="track"><span class="bar2" style="width:'+p+'%"></span></span><span class="pc">'+p.toFixed(1)+'%</span>';
    g.appendChild(r);
  });
})();

// ---------- sampling ----------
const CAND=[['Paris',6.2],['the',3.4],['a',3.0],['located',2.6],['France',2.4],['city',2.0],['home',1.5],['big',1.2],['Lyon',1.0],['other',0.6]];
let generated='';
const el=id=>document.getElementById(id);
function sampleRender(){
  const T=parseFloat(el('temp').value), K=parseInt(el('topk').value,10), P=parseFloat(el('topp').value);
  el('tempv').textContent=T.toFixed(2); el('topkv').textContent=K; el('toppv').textContent=P.toFixed(2);
  const scaled=CAND.map(([n,l])=>[n,l/T]);
  const mx=Math.max(...scaled.map(s=>s[1]));
  const ex=scaled.map(([n,l])=>[n,Math.exp(l-mx)]);
  const sum=ex.reduce((a,b)=>a+b[1],0);
  let probs=ex.map(([n,v])=>[n,v/sum]);
  // top-k
  const order=[...probs].sort((a,b)=>b[1]-a[1]);
  const keep=new Set(order.slice(0,K).map(o=>o[0]));
  probs=probs.map(([n,p])=>[n,keep.has(n)?p:0]);
  // top-p (nucleus) over the kept set
  let acc=0; const sorted=[...probs].filter(p=>p[1]>0).sort((a,b)=>b[1]-a[1]);
  const nucleus=new Set();
  for(const [n,p] of sorted){ if(acc>=P) break; nucleus.add(n); acc+=p; }
  if(nucleus.size===0&&sorted.length) nucleus.add(sorted[0][0]);
  probs=probs.map(([n,p])=>[n,nucleus.has(n)?p:0]);
  const total=probs.reduce((a,b)=>a+b[1],0)||1;
  probs=probs.map(([n,p])=>[n,p/total]);
  const g=el('sampBars'); g.innerHTML='';
  const best=Math.max(...probs.map(p=>p[1]));
  probs.forEach(([n,p])=>{
    const r=document.createElement('div');
    r.className='brow'+(p>0&&p===best?' win':'');
    r.innerHTML='<span class="nm">'+n+'</span><span class="track"><span class="bar2'+(p>0?'':' cut')+'" style="width:'+(p*100).toFixed(1)+'%"></span></span><span class="pc">'+(p>0?(p*100).toFixed(1)+'%':'—')+'</span>';
    g.appendChild(r);
  });
  const alive=probs.filter(p=>p[1]>0).length;
  el('sampNote').textContent=alive+' of '+CAND.length+' candidates survive. '+
    (alive===1?'The distribution is now deterministic — every draw returns the same token.':'Renormalized over the survivors, so the probabilities still sum to 1.');
  return probs;
}
['temp','topk','topp'].forEach(id=>el(id).addEventListener('input',sampleRender));
el('drawBtn').onclick=()=>{
  const probs=sampleRender();
  let r=Math.random(), pick=probs[probs.length-1][0];
  for(const [n,p] of probs){ if(r<p){pick=n;break} r-=p; }
  generated+=(generated?' ':'')+pick;
  el('genLine').innerHTML='The capital of France is <span style="color:var(--cyan)">'+generated.replace(/[<>&]/g,c=>({'<':'<','>':'>','&':'&'}[c]))+'</span> <span style="color:var(--amber)">▮</span>';
};
el('resetBtn').onclick=()=>{generated='';el('genLine').textContent='';sampleRender()};
sampleRender();

// ---------- scroll progress + toc ----------
const prog=document.getElementById('progress');
const links=[...document.querySelectorAll('.toc a')];
const secs=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
function onScroll(){
  const h=document.documentElement.scrollHeight-window.innerHeight;
  prog.style.width=(h>0?(window.scrollY/h*100):0)+'%';
  let idx=0;
  secs.forEach((s,i)=>{ if(s.getBoundingClientRect().top<=140) idx=i; });
  links.forEach((a,i)=>a.classList.toggle('on',i===idx));
}
window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
