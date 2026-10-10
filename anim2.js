
// ================= shared harness =================
function mkAnim(id, draw){
  var cv=document.getElementById(id); if(!cv) return;
  var ctx=cv.getContext('2d');
  var W=1,H=1,DPR=Math.min(2,window.devicePixelRatio||1),vis=false;
  function fit(){
    var r=cv.getBoundingClientRect();
    W=Math.max(280,r.width); H=Math.max(140,r.height);
    cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  fit(); window.addEventListener('resize',fit);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ vis=es[0].isIntersecting; },{threshold:0.02}).observe(cv);
  } else { vis=true; }
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t0=performance.now();
  (function loop(now){
    if(vis){ try{ draw(ctx,W,H,(now-t0)/1000,reduce); }catch(e){} }
    requestAnimationFrame(loop);
  })(t0);
}
function rr(c,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  c.beginPath(); c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);     c.arcTo(x,y,x+w,y,r);
  c.closePath();
}
function eOut(x){ return 1-Math.pow(1-x,3); }
function eInOut(x){ return x<0.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2; }
function mon(c,px,w){ c.font=(w||600)+' '+px+'px ui-monospace,SFMono-Regular,Menlo,monospace'; }
function san(c,px){ c.font='600 '+px+'px ui-sans-serif,system-ui,-apple-system,sans-serif'; }

// ================= A1: text -> token id -> vector =================
mkAnim('a1', function(ctx,W,H,t){
  ctx.clearRect(0,0,W,H);
  var Ws=[
    ['unbelievable','140613',[ 0.8,-0.3, 0.5,-0.6, 0.2, 0.7]],
    ['tokenizer',   '83017', [-0.4, 0.9, 0.2, 0.3,-0.8, 0.1]],
    ['is',          '137194',[ 0.3, 0.6,-0.7, 0.1, 0.4,-0.5]],
    ['working',     '63010', [ 0.9, 0.1,-0.2, 0.7,-0.1, 0.3]]
  ];
  var PER=3.4, k=Math.floor(t/PER)%Ws.length, p=(t%PER)/PER;
  var word=Ws[k][0], id=Ws[k][1], vec=Ws[k][2];
  var cy=H*0.58, xs=[W*0.16, W*0.5, W*0.84];
  var bw=Math.min(200,W*0.245), bh=Math.min(86,H*0.34);

  for(var i=0;i<2;i++){
    var x1=xs[i]+bw/2+6, x2=xs[i+1]-bw/2-6;
    ctx.beginPath(); ctx.moveTo(x1,cy); ctx.lineTo(x2,cy);
    ctx.strokeStyle='rgba(38,52,79,1)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2,cy); ctx.lineTo(x2-7,cy-4); ctx.lineTo(x2-7,cy+4);
    ctx.closePath(); ctx.fillStyle='rgba(38,52,79,1)'; ctx.fill();
  }
  var stage = p<0.36 ? 0 : (p<0.70 ? 1 : 2);
  for(var j=0;j<3;j++){
    var on = j===stage;
    rr(ctx,xs[j]-bw/2,cy-bh/2,bw,bh,12);
    ctx.fillStyle = on ? 'rgba(13,23,48,0.96)' : 'rgba(13,20,36,0.7)'; ctx.fill();
    ctx.strokeStyle = on ? 'rgba(77,107,254,0.95)' : 'rgba(27,39,64,1)';
    ctx.lineWidth = on ? 2 : 1; ctx.stroke();
  }
  var caps=['TEXT','TOKEN ID','EMBEDDING'];
  mon(ctx,10); ctx.textAlign='center';
  for(var m=0;m<3;m++){
    ctx.fillStyle = m===stage ? 'rgba(34,211,238,1)' : 'rgba(92,107,138,1)';
    ctx.fillText(caps[m], xs[m], cy-bh/2-12);
  }
  ctx.textAlign='center'; ctx.textBaseline='middle';
  san(ctx,Math.min(17,bw/9));
  ctx.fillStyle='rgba(234,240,253,1)';
  ctx.fillText(word, xs[0], cy);
  mon(ctx,Math.min(19,bw/8),700);
  ctx.fillStyle = stage>=1 ? 'rgba(251,191,36,1)' : 'rgba(92,107,138,1)';
  ctx.fillText('#'+id, xs[1], cy);
  var n=vec.length, cw=Math.min(16,(bw-30)/n);
  var vx0=xs[2]-(n*cw+(n-1)*3)/2;
  for(var q=0;q<n;q++){
    var v=vec[q], hue=200+v*80, lig=30+Math.abs(v)*32;
    ctx.fillStyle = stage>=2 ? 'hsl('+hue+',72%,'+lig+'%)' : 'rgba(30,42,68,1)';
    rr(ctx, vx0+q*(cw+3), cy-11, cw, 22, 3); ctx.fill();
  }
  if(stage>=2){
    mon(ctx,10); ctx.fillStyle='rgba(92,107,138,1)';
    ctx.fillText('lookup row', xs[2], cy+26);
  }
  function packet(a,b){
    var qq=(p-a)/(b-a);
    var x=xs[0]+bw/2+((xs[1]-bw/2)-(xs[0]+bw/2))*qq;
    ctx.beginPath(); ctx.arc(x,cy,5,0,Math.PI*2);
    ctx.fillStyle='rgba(34,211,238,0.95)'; ctx.fill();
  }
  if(p>0.30&&p<0.42) packet(0.30,0.42);
  if(p>0.64&&p<0.76){
    var q2=(p-0.64)/0.12;
    var x2=xs[1]+bw/2+((xs[2]-bw/2)-(xs[1]+bw/2))*q2;
    ctx.beginPath(); ctx.arc(x2,cy,5,0,Math.PI*2);
    ctx.fillStyle='rgba(34,211,238,0.95)'; ctx.fill();
  }
  ctx.textBaseline='alphabetic';
});

// ================= A2: logits -> softmax =================
mkAnim('a2', function(ctx,W,H,t){
  ctx.clearRect(0,0,W,H);
  var TOK=['Paris','the','a','located','France','city'];
  var RAW=[6.2,3.4,3.0,2.6,2.4,2.0];
  var sumRaw=0,i;
  for(i=0;i<RAW.length;i++) sumRaw+=RAW[i];
  var mx=Math.max.apply(null,RAW), ex=[], s=0;
  for(i=0;i<RAW.length;i++){ ex.push(Math.exp(RAW[i]-mx)); s+=ex[i]; }
  var PROB=[], START=[];
  for(i=0;i<RAW.length;i++){ PROB.push(ex[i]/s); START.push(RAW[i]/sumRaw); }

  var PER=6.0, ph=(t%PER)/PER;
  var q = ph<0.5 ? eInOut(ph/0.5) : eInOut((1-ph)/0.5);

  var padL=70,padR=24,padB=64,padT=52;
  var plotW=W-padL-padR, plotH=H-padT-padB;
  var n=TOK.length, slot=plotW/n;

  ctx.beginPath(); ctx.moveTo(padL,H-padB); ctx.lineTo(W-padR,H-padB);
  ctx.strokeStyle='rgba(38,52,79,1)'; ctx.lineWidth=1; ctx.stroke();

  var total=0;
  for(i=0;i<n;i++){
    var v=START[i]+(PROB[i]-START[i])*q;
    total+=v;
    var h=Math.max(2,v*plotH*0.97);
    var x=padL+i*slot+slot*0.16, bwid=slot*0.68;
    var g=ctx.createLinearGradient(0,H-padB-h,0,H-padB);
    if(q<0.5){ g.addColorStop(0,'rgba(148,163,184,1)'); g.addColorStop(1,'rgba(71,85,105,1)'); }
    else     { g.addColorStop(0,'rgba(34,211,238,1)');  g.addColorStop(1,'rgba(77,107,254,1)'); }
    rr(ctx,x,H-padB-h,bwid,h,5); ctx.fillStyle=g; ctx.fill();
    mon(ctx,11); ctx.textAlign='center';
    ctx.fillStyle='rgba(147,162,192,1)';
    ctx.fillText(TOK[i], x+bwid/2, H-padB+18);
    ctx.fillStyle = q>0.5 ? 'rgba(234,240,253,1)' : 'rgba(92,107,138,1)';
    ctx.fillText((v*100).toFixed(1)+'%', x+bwid/2, Math.max(12,H-padB-h-8));
  }
  san(ctx,Math.min(15,W/44)); ctx.textAlign='left';
  ctx.fillStyle = q>0.5 ? 'rgba(34,211,238,1)' : 'rgba(148,163,184,1)';
  ctx.fillText(q>0.5 ? 'softmax -> probabilities' : 'raw logits (unnormalized)', padL, 26);
  mon(ctx,12); ctx.textAlign='right';
  ctx.fillStyle='rgba(92,107,138,1)';
  ctx.fillText('sum = '+total.toFixed(2), W-padR, 26);
  mon(ctx,11); ctx.textAlign='left';
  ctx.fillStyle='rgba(92,107,138,1)';
  ctx.fillText('p(i) = exp(z_i / T) / sum exp(z_j / T)', padL, H-14);
});

// ================= A3: sampling wheel =================
mkAnim('a3', function(ctx,W,H,t){
  ctx.clearRect(0,0,W,H);
  var TOK=[['Paris',0.62],['the',0.14],['a',0.09],['located',0.07],['France',0.05],['other',0.03]];
  var COL=['#4d6bfe','#22d3ee','#a78bfa','#34d399','#fbbf24','#fb7185'];
  var cx=W*0.34, cy=H*0.53, R=Math.min(W*0.20,H*0.33);
  var a0=-Math.PI/2, i;
  for(i=0;i<TOK.length;i++){
    var a1=a0+TOK[i][1]*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,a0,a1); ctx.closePath();
    ctx.fillStyle=COL[i]; ctx.globalAlpha=0.82; ctx.fill(); ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(6,9,17,0.9)'; ctx.lineWidth=1.5; ctx.stroke();
    if(TOK[i][1]>0.06){
      var am=(a0+a1)/2;
      mon(ctx,11); ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle='rgba(6,9,17,0.95)';
      ctx.fillText(TOK[i][0], cx+Math.cos(am)*R*0.68, cy+Math.sin(am)*R*0.68);
    }
    a0=a1;
  }
  ctx.textBaseline='alphabetic';
  ctx.beginPath(); ctx.arc(cx,cy,R+5,0,Math.PI*2);
  ctx.strokeStyle='rgba(38,52,79,1)'; ctx.lineWidth=1.5; ctx.stroke();

  var PER=3.8, ph=t%PER;
  var spin = ph<2.2 ? eOut(ph/2.2) : 1;
  var ang = spin*(Math.PI*2*3 + (-Math.PI/2+0.62*Math.PI*2*0.5));
  var nx=cx+Math.cos(ang)*R*0.94, ny=cy+Math.sin(ang)*R*0.94;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(nx,ny);
  ctx.strokeStyle='rgba(234,240,253,0.95)'; ctx.lineWidth=3; ctx.lineCap='round'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,6,0,Math.PI*2); ctx.fillStyle='rgba(234,240,253,1)'; ctx.fill();

  var landed = ph>=2.15, rx=W*0.70;
  mon(ctx,10); ctx.textAlign='left'; ctx.fillStyle='rgba(92,107,138,1)';
  ctx.fillText('SAMPLED TOKEN', rx, cy-34);
  san(ctx,Math.min(26,W/26));
  ctx.fillStyle = landed ? 'rgba(52,211,153,1)' : 'rgba(92,107,138,1)';
  ctx.fillText(landed ? 'Paris' : '. . .', rx, cy+2);
  ctx.beginPath(); ctx.moveTo(rx,cy+22); ctx.lineTo(rx+Math.min(200,W*0.20),cy+22);
  ctx.strokeStyle='rgba(27,39,64,1)'; ctx.lineWidth=1; ctx.stroke();
  mon(ctx,11); ctx.fillStyle='rgba(147,162,192,1)';
  ctx.fillText('appended to the input,', rx, cy+46);
  ctx.fillText('then the model runs again.', rx, cy+64);
  ctx.textAlign='right'; mon(ctx,10); ctx.fillStyle='rgba(92,107,138,1)';
  ctx.fillText('slice area = probability', W-18, H-12);
});

// ================= A4: training loop =================
mkAnim('a4', function(ctx,W,H,t){
  ctx.clearRect(0,0,W,H);
  var L=6;
  var lx=W*0.06, lw=Math.min(190,W*0.26);
  var top=42, bot=H-30, rowH=(bot-top)/L;
  var PER=4.2, ph=t%PER;
  var fwd = ph<1.3 ? ph/1.3 : 1;
  var bwd = ph>1.5 ? Math.min(1,(ph-1.5)/1.3) : 0;

  for(var i=0;i<L;i++){
    var y=top+i*rowH;
    var passedF = fwd*L > i;
    var passedB = bwd*L > (L-1-i);
    var fill='rgba(13,20,36,0.85)', stroke='rgba(27,39,64,1)';
    if(passedB){ fill='rgba(42,16,24,0.9)'; stroke='rgba(251,113,133,0.85)'; }
    else if(passedF){ fill='rgba(13,23,48,0.95)'; stroke='rgba(77,107,254,0.85)'; }
    rr(ctx,lx,y+3,lw,rowH-8,8); ctx.fillStyle=fill; ctx.fill();
    ctx.strokeStyle=stroke; ctx.lineWidth=1.5; ctx.stroke();
    mon(ctx,10); ctx.textAlign='left';
    ctx.fillStyle = passedB ? 'rgba(251,113,133,1)' : (passedF ? 'rgba(124,147,255,1)' : 'rgba(92,107,138,1)');
    ctx.fillText('layer '+(i+1), lx+12, y+rowH/2+4);
  }
  if(ph<1.35){
    var y1=top+(fwd*L)*rowH-3;
    ctx.beginPath(); ctx.arc(lx+lw+18, Math.min(bot,y1), 6, 0, Math.PI*2);
    ctx.fillStyle='rgba(77,107,254,1)'; ctx.fill();
  }
  if(ph>1.45&&ph<2.9){
    var y2=bot-(bwd*L)*rowH+3;
    ctx.beginPath(); ctx.arc(lx+lw+18, Math.max(top,y2), 6, 0, Math.PI*2);
    ctx.fillStyle='rgba(251,113,133,1)'; ctx.fill();
  }
  san(ctx,12); ctx.textAlign='left';
  ctx.fillStyle = (ph<1.35) ? 'rgba(124,147,255,1)' : 'rgba(92,107,138,1)';
  ctx.fillText('forward pass', lx, 22);
  ctx.fillStyle = (ph>1.45&&ph<2.9) ? 'rgba(251,113,133,1)' : 'rgba(92,107,138,1)';
  ctx.fillText('backward pass', lx+lw+40, 22);

  var gx=W*0.46, gw=W*0.50, gy=48, gh=H-96;
  ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx,gy+gh); ctx.lineTo(gx+gw,gy+gh);
  ctx.strokeStyle='rgba(27,39,64,1)'; ctx.lineWidth=1; ctx.stroke();
  var steps=Math.max(2,Math.floor((ph/PER)*90));
  ctx.beginPath();
  for(var k=0;k<=steps;k++){
    var x=gx+(k/90)*gw;
    var v=0.92*Math.exp(-k/26)+0.10+0.018*Math.sin(k*1.9);
    var yy=gy+gh-(v*gh*0.92);
    if(k===0) ctx.moveTo(x,yy); else ctx.lineTo(x,yy);
  }
  ctx.strokeStyle='rgba(52,211,153,1)'; ctx.lineWidth=2.5; ctx.stroke();
  mon(ctx,11); ctx.textAlign='left'; ctx.fillStyle='rgba(92,107,138,1)';
  ctx.fillText('training loss', gx+6, gy+14);
  ctx.textAlign='right'; ctx.fillStyle='rgba(52,211,153,1)';
  ctx.fillText('step '+Math.round(ph/PER*90), gx+gw-4, gy+14);
  ctx.textAlign='left'; ctx.fillStyle='rgba(92,107,138,1)'; mon(ctx,10);
  ctx.fillText('predict next token  ->  measure error  ->  nudge every weight', gx, H-14);
});

// ================= A5: KV cache growth =================
mkAnim('a5', function(ctx,W,H,t){
  ctx.clearRect(0,0,W,H);
  var LAY=8, MAXT=22;
  var padL=64, padT=44, padB=44, padR=110;
  var gw=W-padL-padR, gh=H-padT-padB;
  var cw=gw/MAXT, ch=gh/LAY;
  var STEP=0.30, PER=STEP*MAXT+1.6, ph=t%PER;
  var filled=Math.min(MAXT, Math.floor(ph/STEP));
  var l,i;
  mon(ctx,10); ctx.textAlign='right';
  for(l=0;l<LAY;l++){
    ctx.fillStyle='rgba(92,107,138,1)';
    ctx.fillText('L'+(l+1), padL-8, padT+l*ch+ch/2+3);
  }
  for(l=0;l<LAY;l++){
    for(i=0;i<MAXT;i++){
      var x=padL+i*cw, y=padT+l*ch;
      ctx.beginPath(); ctx.rect(x+1.2,y+1.2,cw-2.4,ch-2.4);
      if(i<filled){
        var hue=222-(l/LAY)*40;
        ctx.fillStyle = (i===filled-1) ? 'rgba(251,191,36,0.92)' : 'hsla('+hue+',80%,58%,0.72)';
      } else { ctx.fillStyle='rgba(13,20,36,0.75)'; }
      ctx.fill();
      ctx.strokeStyle='rgba(27,39,64,0.9)'; ctx.lineWidth=0.8; ctx.stroke();
    }
  }
  ctx.strokeStyle='rgba(38,52,79,1)'; ctx.lineWidth=1;
  ctx.strokeRect(padL,padT,gw,gh);
  mon(ctx,10); ctx.textAlign='left'; ctx.fillStyle='rgba(92,107,138,1)';
  ctx.fillText('tokens generated ->', padL, padT-14);
  ctx.textAlign='center';
  ctx.fillText('layers', padL-32, padT-14);

  var rx=W-padR+16;
  mon(ctx,10); ctx.textAlign='left'; ctx.fillStyle='rgba(92,107,138,1)';
  ctx.fillText('CACHE GROWTH', rx, padT+8);
  san(ctx,Math.min(22,W/30)); ctx.fillStyle='rgba(34,211,238,1)';
  ctx.fillText(String(filled*LAY), rx, padT+40);
  mon(ctx,10); ctx.fillStyle='rgba(92,107,138,1)';
  ctx.fillText('K/V columns', rx, padT+56);
  ctx.fillText('890 B per token', rx, padT+72);
  ctx.fillStyle='rgba(147,162,192,1)';
  ctx.fillText('linear in', rx, padT+100);
  ctx.fillText('context length', rx, padT+116);

  ctx.textAlign='left'; mon(ctx,10); ctx.fillStyle='rgba(92,107,138,1)';
  ctx.fillText('each new token adds one full column - this is why context costs memory', padL, H-14);
});
