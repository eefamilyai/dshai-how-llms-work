
// ============ animated residual stream ============
(function(){
  const cv=document.getElementById('streamCanvas'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const N=8, L=10;
  const TOK=['The','cat','sat','on','the','mat','and','slept'];
  let W=0,H=0, DPR=Math.min(2, window.devicePixelRatio||1);
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fit(){
    const r=cv.getBoundingClientRect();
    W=Math.max(340,r.width); H=Math.max(300,r.height);
    cv.width=W*DPR; cv.height=H*DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  window.addEventListener('resize',fit); fit();

  // deterministic attention weights, varied by layer depth
  function weight(i,j,l){
    if(j>i) return 0;
    let w = 0.07*Math.pow(0.70,i-j);
    if(j===i) w += 0.26;
    if(i===7&&j===1) w += 0.62;           // coreference: "slept" -> "cat"
    if(i===5&&j===3) w += 0.22;           // "mat" -> "the"
    if(i===2&&j===1) w += 0.30;           // "sat" -> "cat"
    if(l>=6 && (i-j)<=2) w *= 0.55;       // deep layers reach less locally
    if(l>=6 && j<=1)     w *= 1.9;        // ...and more at the subject
    return Math.min(0.95, w*(0.55+0.45*Math.abs(Math.sin(l*1.6+i*0.8))));
  }

  let t=0, dir=1, hold=0;

  function draw(){
    ctx.clearRect(0,0,W,H);
    const padX=Math.min(76,W*0.085), padTop=48, padBot=58;
    const colW=(W-padX*2)/(N-1);
    const rowH=(H-padTop-padBot)/L;
    const xOf=i=>padX+i*colW, yOf=l=>padTop+l*rowH;

    // layer bands
    for(let l=0;l<L;l++){
      const y=yOf(l), near=Math.abs(t-l);
      const a = near<1 ? (1-near)*0.11 : 0;
      ctx.fillStyle='rgba(77,107,254,'+a.toFixed(3)+')';
      ctx.fillRect(padX-36,y+rowH*0.36,W-padX*2+72,rowH*0.28);
      ctx.fillStyle='rgba(255,255,255,0.014)';
      ctx.fillRect(padX-36,y+rowH*0.46,W-padX*2+72,rowH*0.08);
    }

    // token labels at top
    ctx.font='600 12px ui-monospace,monospace'; ctx.textAlign='center';
    for(let i=0;i<N;i++){
      ctx.fillStyle = i===N-1 ? 'rgba(251,191,36,0.9)' : 'rgba(147,162,192,0.75)';
      ctx.fillText(TOK[i], xOf(i), 26);
    }

    // attention arcs at the active layer
    const lNow=Math.min(L-1,Math.floor(t));
    const pulse=Math.max(0, 1-Math.abs(t-(lNow+0.35))*1.7);
    if(pulse>0.01){
      for(let i=0;i<N;i++){
        for(let j=0;j<i;j++){
          const wt=weight(i,j,lNow); if(wt<0.07) continue;
          const a=Math.min(0.9, wt*1.4)*pulse;
          const x1=xOf(j), y1=yOf(t), x2=xOf(i), y2=yOf(t);
          const mx=(x1+x2)/2, my=yOf(t)-Math.min(30,colW*0.55);
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(mx,my,x2,y2);
          ctx.strokeStyle='rgba(34,211,238,'+a.toFixed(3)+')';
          ctx.lineWidth=0.9+wt*2.4; ctx.stroke();
        }
      }
    }

    // vertical token columns
    for(let i=0;i<N;i++){
      const x=xOf(i);
      ctx.beginPath(); ctx.moveTo(x,padTop); ctx.lineTo(x,yOf(L-1));
      ctx.strokeStyle='rgba(30,42,68,0.85)'; ctx.lineWidth=1; ctx.stroke();
    }

    // the moving row of dots
    const y=yOf(t);
    for(let i=0;i<N;i++){
      const x=xOf(i), last=(i===N-1);
      const r = last ? 6.2 : 4.6;
      // glow
      const g=ctx.createRadialGradient(x,y,0,x,y,r*3.6);
      g.addColorStop(0, last?'rgba(251,191,36,0.55)':'rgba(77,107,254,0.5)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r*3.6,0,Math.PI*2); ctx.fill();
      // core
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle = last ? '#fbbf24' : '#7c93ff'; ctx.fill();
      // trailing streak
      ctx.beginPath();
      ctx.moveTo(x, Math.max(padTop, y-13));
      ctx.lineTo(x, y-1);
      ctx.strokeStyle = last?'rgba(251,191,36,0.5)':'rgba(77,107,254,0.42)';
      ctx.lineWidth=2; ctx.stroke();
    }

    // exit fan at the bottom
    if(t>L-1.05){
      const a=Math.min(1,(t-(L-1.05))/0.4);
      const x=xOf(N-1), y0=yOf(L-1);
      const outs=[['Paris',0.62],['the',0.14],['a',0.09],['city',0.06]];
      outs.forEach((o,k)=>{
        const ang=(k-1.5)*0.28;
        const len=54+o[1]*90;
        const ex=x+Math.sin(ang)*len, ey=y0+Math.cos(ang)*len;
        ctx.beginPath(); ctx.moveTo(x,y0+4); ctx.lineTo(ex,ey);
        ctx.strokeStyle='rgba(52,211,153,'+(a*(0.35+o[1])).toFixed(3)+')';
        ctx.lineWidth=1.2+o[1]*4; ctx.stroke();
        ctx.font='600 11px ui-monospace,monospace'; ctx.textAlign='left';
        ctx.fillStyle='rgba(52,211,153,'+(a*0.95).toFixed(3)+')';
        ctx.fillText(o[0]+'  '+(o[1]*100).toFixed(0)+'%', ex+5, ey+4);
      });
    }
  }

  function tick(){
    if(!reduce){
      if(hold>0){ hold--; }
      else if(dir>0){ t+=0.035; if(t>=L-0.6){ t=L-0.6; hold=90; dir=-1; } }
      else { t-=0.075; if(t<=0){ t=0; hold=40; dir=1; } }
    } else { t=Math.min(L-0.6, t+0.02); if(t>=L-0.6) t=0; }
    draw(); requestAnimationFrame(tick);
  }
  t=0; tick();
})();

// ============ animated generation ============
(function(){
  const out=document.getElementById('genOut'), bars=document.getElementById('genBars');
  if(!out) return;
  // each step: token, its probability, and a few runner-up probabilities
  const STEPS=[
    ['The',   .58, [['The',.58],['A',.16],['In',.09],['This',.06],['It',.04]]],
    ['capital',.91,[['capital',.91],['largest',.03],['city',.02],['main',.01],['biggest',.01]]],
    ['of',    .97, [['of',.97],['in',.01],['is',.01],['was',.005],['—',.003]]],
    ['France',.99, [['France',.99],['the',.004],['Italy',.002],['Europe',.001],['Spain',.001]]],
    ['is',    .96, [['is',.96],['was',.02],['has',.008],['remains',.004],['became',.003]]],
    ['Paris', .94, [['Paris',.94],['Lyon',.02],['a',.01],['the',.008],['located',.006]]],
    ['.',     .71, [['.',.71],[',',.15],[' and',.05],[' —',.03],[';',.02]]],
    ['',      0,   [['⟨end⟩',.83],['The',.05],['It',.04],['Its',.03],['This',.02]]]
  ];
  let i=0, timer=null;

  function renderBars(){
    if(i>=STEPS.length){ return; }
    const st=STEPS[i];
    bars.innerHTML='';
    st[2].forEach(([n,p],k)=>{
      const r=document.createElement('div');
      r.className='brow'+(k===0?' win':'');
      r.innerHTML='<span class="nm">'+(n==='.'?'&nbsp;.':n)+'</span>'+
        '<span class="track"><span class="bar2" style="width:'+(p*100).toFixed(1)+'%"></span></span>'+
        '<span class="pc">'+(p*100).toFixed(1)+'%</span>';
      bars.appendChild(r);
    });
  }

  function step(){
    if(i>=STEPS.length){ clearInterval(timer); timer=null; return; }
    const [tok]=STEPS[i];
    if(tok) out.textContent += (out.textContent && tok!=='.' ? ' ' : '') + tok;
    else out.textContent += ' ▮';
    renderBars();
    i++;
  }

  document.getElementById('genGo').onclick=()=>{
    if(timer) return;
    out.textContent=''; i=0; renderBars();
    timer=setInterval(step, 620);
  };
  document.getElementById('genClear').onclick=()=>{
    if(timer){clearInterval(timer); timer=null;}
    out.textContent=''; i=0; bars.innerHTML='';
  };
  renderBars();
})();
