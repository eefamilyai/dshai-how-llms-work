
// cycle length (seconds) and the fraction spent animating; the rest holds the final frame
window.__PLATE_HOLD = {
  'hero-art':[9.0,1.00],
  'p1-art':  [4.7,0.62],
  'p2-art':  [13.0,1.00],
  'p3-art':  [6.0,0.55],
  'p4-art':  [5.0,0.55],
  'p5-art':  [8.2,0.55],
  'p6-art':  [6.0,0.55],
  'p7-art':  [9.2,0.55],
  'p8-art':  [19.0,0.55],
  'p9-art':  [6.0,0.50],
  'p10-art': [3.8,0.72],
  'p11-art': [8.3,0.62],
  'p12-art': [4.4,0.62],
  'p13-art': [7.0,0.72]
};

// ---------- tiny toolkit ----------
function A(id, draw){
  var cv=document.getElementById(id); if(!cv) return;
  var c=cv.getContext('2d'), W=1,H=1, D=Math.min(2,window.devicePixelRatio||1), on=false;
  function fit(){
    var r=cv.getBoundingClientRect();
    W=Math.max(300,r.width); H=Math.max(140,r.height);
    cv.width=Math.round(W*D); cv.height=Math.round(H*D);
    c.setTransform(D,0,0,D,0,0);
  }
  fit(); addEventListener('resize',fit);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ on=e[0].isIntersecting; },{threshold:0.01}).observe(cv);
  } else on=true;
  var R=matchMedia('(prefers-reduced-motion: reduce)').matches, t0=performance.now();
  var FZ=(function(){ var m=location.search.match(/freeze=([0-9.]+)/); return m?parseFloat(m[1]):null; })();
  // Each plate runs its animation for the first ANIM_FRAC of a cycle, then holds the
  // finished, readable state for the remainder — so a reader who glances at any moment
  // sees a complete illustration rather than a half-drawn one.
  var HOLD=window.__PLATE_HOLD && window.__PLATE_HOLD[id];
  function held(sec){
    if(!HOLD) return sec;
    var cyc=HOLD[0], frac=HOLD[1], rest=cyc*frac;
    var k=sec%cyc;
    return k<rest ? k : rest;
  }
  (function lp(n){ if(on){ try{ draw(c,W,H, FZ!==null?FZ:held((n-t0)/1000), R); }catch(e){} } requestAnimationFrame(lp); })(t0);
}
function bx(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2);
  c.beginPath(); c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function EO(x){ return 1-Math.pow(1-x,3); }
function EIO(x){ return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2; }
function M(c,s,w){ c.font=(w||600)+' '+s+'px ui-monospace,SFMono-Regular,Menlo,monospace'; }
function S(c,s){ c.font='600 '+s+'px ui-sans-serif,system-ui,-apple-system,sans-serif'; }
function gd(c,W,H,step,al){
  c.strokeStyle='rgba(24,35,58,'+(al||.5)+')'; c.lineWidth=1;
  for(var x=0;x<W;x+=step){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); }
  for(var y=0;y<H;y+=step){ c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }
}
function note(c,txt,W,H){
  // shrink to fit: a caption can never run off the right edge
  var maxW=W-48, size=11.5;
  M(c,size);
  while(c.measureText(txt).width>maxW && size>7.5){ size-=0.5; M(c,size); }
  c.textAlign='left'; c.fillStyle='rgba(150,168,202,1)';
  c.fillText(txt, 24, H-20);
}

// ---------- HERO: the next-token loop ----------
A('hero-art', function(c,W,H,t){
  c.clearRect(0,0,W,H); gd(c,W,H,54,.26);
  var cx=W/2, cy=H/2+14, R=Math.min(W,H)*0.29;
  var Wd=['The','capital','of','France','is','Paris','.'];
  var N=Wd.length, step=Math.floor(t*1.15)%(N+2);
  c.beginPath(); c.arc(cx,cy,R,0,Math.PI*2);
  c.strokeStyle='rgba(38,52,79,.85)'; c.lineWidth=1; c.stroke();
  var a0=-Math.PI/2;
  for(var i=0;i<N;i++){
    var a=a0+(i/N)*Math.PI*2;
    var x=cx+Math.cos(a)*R, y=cy+Math.sin(a)*R;
    var done=i<step, now=i===step, r=now?13:(done?7:5);
    var g=c.createRadialGradient(x,y,0,x,y,r*3);
    g.addColorStop(0, now?'rgba(251,191,36,.5)':(done?'rgba(77,107,254,.4)':'rgba(85,97,128,.16)'));
    g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=g; c.beginPath(); c.arc(x,y,r*3,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2);
    c.fillStyle= now?'#fbbf24':(done?'#7c93ff':'#39435c'); c.fill();
    M(c,Math.min(12,W/76)); c.textAlign='center';
    c.fillStyle=(done||now)?'rgba(238,243,255,.95)':'rgba(85,97,128,.8)';
    c.fillText(Wd[i], x, y-r-12);
  }
  if(step<=N){
    var sa=a0+(step/N)*Math.PI*2;
    c.beginPath(); c.arc(cx,cy,R,a0,sa);
    c.strokeStyle='rgba(34,211,238,.5)'; c.lineWidth=2.5; c.stroke();
  }
  c.textAlign='center';
  M(c,Math.min(13,W/64)); c.fillStyle='rgba(34,211,238,.9)';
  c.fillText((step>=N?'stop token':('next: '+Wd[Math.min(step,N-1)])).toUpperCase(), cx, cy-4);
  S(c,Math.min(16,W/50)); c.fillStyle='rgba(143,162,196,.8)';
  c.fillText('one token per lap', cx, cy+22);
});

// ---------- 1 pipeline ----------
A('p1-art', function(c,W,H,t){
  c.clearRect(0,0,W,H); gd(c,W,H,44,.2);
  var ST=['tokenize','embed','blocks','logits','softmax','sample','append'];
  var n=ST.length, pad=Math.min(70,W*.06), gap=(W-pad*2)/n;
  var cy=H*.56, bh=Math.min(92,H*.42), bw=gap*.66;
  var act=Math.floor((t*1.5)%n);
  for(var i=0;i<n;i++){
    var x=pad+i*gap+(gap-bw)/2, on=i===act;
    bx(c,x,cy-bh/2,bw,bh,10);
    c.fillStyle= on?'rgba(13,23,48,.98)':'rgba(10,16,32,.8)'; c.fill();
    c.strokeStyle= on?'rgba(77,107,254,1)':'rgba(24,35,58,1)';
    c.lineWidth= on?2:1; c.stroke();
    M(c,Math.min(11,bw/7)); c.textAlign='center';
    c.fillStyle= on?'rgba(34,211,238,1)':'rgba(85,97,128,1)';
    c.fillText(ST[i], x+bw/2, cy+4);
    if(i<n-1){
      c.beginPath(); c.moveTo(x+bw+2,cy); c.lineTo(x+gap-2,cy);
      c.strokeStyle='rgba(38,52,79,1)'; c.lineWidth=1.5; c.stroke();
    }
    if(i===act){
      c.beginPath(); c.arc(x+bw/2, cy-bh/2-16, 5, 0, Math.PI*2);
      c.fillStyle='rgba(251,191,36,1)'; c.fill();
    }
  }
  note(c,'text → ids → vectors → layers → scores → probabilities → one draw → repeat',W,H);
});

// ---------- 2 tokenization ----------
A('p2-art', function(c,W,H,t){
  c.clearRect(0,0,W,H);

  // cycle: cut/separation/number entrance occupy the first 30%, then HOLD on the
  // finished state for the remaining 70% so the illustration is readable whenever
  // the reader looks at it.
  var PER=13.0, ph=(t%PER)/PER;
  var sCut = Math.min(1, Math.max(0, ph/0.08));
  var sSep = Math.min(1, Math.max(0,(ph-0.08)/0.09));
  var sNum = Math.min(1, Math.max(0,(ph-0.19)/0.11));

  var ROWS=[
    {tag:'COMMON WORD', sub:'already in the vocabulary \u2014 stays whole',
     col:'52,211,153', pcs:['The',' cat',' sat'], ids:[1824,3797,3332], cut:false},
    {tag:'RARE WORD',   sub:'not in the vocabulary \u2014 gets cut apart',
     col:'251,191,36',  pcs:['un','believ','ably'], ids:[530,24102,8901], cut:true}
  ];

  var fs   = Math.min(58, W/17);
  var gap  = fs*0.46;
  var boxH = 64;
  var rowY = [H*0.24, H*0.62];

  for(var r=0;r<ROWS.length;r++){
    var row=ROWS[r], baseY=rowY[r];
    var col = 'rgba('+row.col+',1)';
    var colSoft = 'rgba('+row.col+',0.30)';

    // --- header ---
    M(c,13,700); c.textAlign='left';
    c.fillStyle=col;
    c.fillText(row.tag, 56, baseY - fs*0.86);
    var tw = c.measureText(row.tag).width;
    M(c,12.5); c.fillStyle='rgba(150,165,195,1)';
    c.fillText('  '+row.sub, 56+tw+8, baseY - fs*0.86);

    // --- measure and lay out the pieces ---
    S(c,fs);
    var widths=[];
    for(var k=0;k<row.pcs.length;k++) widths.push(c.measureText(row.pcs[k]).width);
    var sum=0; for(var q=0;q<widths.length;q++) sum+=widths[q];
    var total = sum + gap*(row.pcs.length-1)*sSep;
    var x0 = W*0.5 - total/2;

    // --- cut marks (rare row only) ---
    if(row.cut && sCut>0){
      var fade = Math.max(0, 1-sSep*1.8);
      var cm = x0;
      for(var j=0;j<row.pcs.length-1;j++){
        cm += widths[j] + gap*sSep*0.5;
        c.beginPath();
        c.moveTo(cm, baseY - fs*1.02);
        c.lineTo(cm, baseY + fs*0.06);
        c.strokeStyle='rgba(251,191,36,'+(0.95*fade).toFixed(3)+')';
        c.lineWidth=3; c.setLineDash([9,7]); c.stroke(); c.setLineDash([]);
        // scissors handle
        if(fade>0.2){
          c.beginPath();
          c.arc(cm, baseY - fs*1.02, 5, 0, Math.PI*2);
          c.strokeStyle='rgba(251,191,36,'+(0.8*fade).toFixed(3)+')';
          c.lineWidth=2; c.stroke();
        }
      }
    }

    // --- pieces + big integer boxes ---
    var px = x0;
    for(var i=0;i<row.pcs.length;i++){
      var w = widths[i];

      // the word piece, always full brightness
      S(c,fs); c.textAlign='left';
      c.fillStyle='rgba(240,245,255,1)';
      c.fillText(row.pcs[i], px, baseY);

      // token boundary underline
      c.beginPath();
      c.moveTo(px, baseY+9);
      c.lineTo(px+w, baseY+9);
      c.strokeStyle=colSoft; c.lineWidth=3; c.stroke();

      // big integer box below
      if(sNum>0){
        var nw = Math.max(w*1.02, 118);
        var nx = px + w/2 - nw/2;
        var ny = baseY + 30;
        var a  = Math.min(1, sNum*1.7);
        c.globalAlpha = a;

        bx(c, nx, ny, nw, boxH, 10);
        c.fillStyle='rgba(10,17,34,1)'; c.fill();
        c.strokeStyle=col; c.lineWidth=2.5; c.stroke();

        var val = Math.round(row.ids[i]*sNum);
        M(c, Math.min(40, nw/3.0), 700);
        c.textAlign='center';
        c.fillStyle=col;
        c.fillText('#'+val, nx+nw/2, ny+boxH*0.68);
        c.globalAlpha = 1;
      }

      px += w + (i<row.pcs.length-1 ? gap*sSep : 0);
    }

    // --- token count at the right ---
    if(sNum>0.9){
      var a3=Math.min(1,(sNum-0.9)/0.1);
      c.globalAlpha=a3;
      var cx2 = W - 74;
      M(c,11.5); c.textAlign='right'; c.fillStyle='rgba(150,165,195,1)';
      c.fillText('becomes', cx2, baseY - 4);
      S(c,34); c.fillStyle=col;
      c.fillText(String(row.pcs.length), cx2, baseY + 30);
      M(c,11.5); c.fillStyle='rgba(150,165,195,1)';
      c.fillText('tokens', cx2, baseY + 50);
      c.globalAlpha=1;
    }
  }

  // --- footer ---
  if(sNum>0.85){
    var a4=Math.min(1,(sNum-0.85)/0.15);
    c.globalAlpha=a4;
    S(c,15); c.textAlign='center';
    c.fillStyle='rgba(160,175,205,1)';
    c.fillText('the model never sees a single letter \u2014 only these integers', W*0.5, H-30);
    c.globalAlpha=1;
  }
});

// ---------- 3 embeddings ----------
A('p3-art', function(c,W,H,t){
  c.clearRect(0,0,W,H); gd(c,W,H,58,.10);

  // Hand-placed semantic map. Every position and label side is chosen so that
  // no two labels can overlap, at any canvas size.
  //   [word, x, y, side]   x,y in -1..1
  var PTS=[
    ['kitten', -0.78, -0.62, 'l'],
    ['cat',    -0.60, -0.30, 'l'],
    ['dog',    -0.40, -0.08, 'l'],
    ['man',     0.06,  0.22, 'b'],
    ['king',    0.50,  0.18, 'r'],
    ['woman',   0.12,  0.66, 'b'],
    ['queen',   0.56,  0.62, 'r'],
    ['Paris',   0.64, -0.50, 'r'],
    ['France',  0.84, -0.78, 'r']
  ];
  var cx=W*0.48, cy=H*0.54, sc=Math.min(W*0.40,H*0.40);

  function P(nm){
    for(var i=0;i<PTS.length;i++) if(PTS[i][0]===nm)
      return {x:cx+PTS[i][1]*sc, y:cy-PTS[i][2]*sc};
    return {x:cx,y:cy};
  }

  // axes
  c.beginPath(); c.moveTo(26,cy); c.lineTo(W-26,cy);
  c.moveTo(cx,24); c.lineTo(cx,H-26);
  c.strokeStyle='rgba(32,47,76,1)'; c.lineWidth=1; c.stroke();

  // the analogy: two parallel arrows
  var pairs=[['man','woman'],['king','queen']];
  for(var q=0;q<pairs.length;q++){
    var A0=P(pairs[q][0]), B0=P(pairs[q][1]);
    c.beginPath(); c.moveTo(A0.x,A0.y); c.lineTo(B0.x,B0.y);
    c.strokeStyle='rgba(251,191,36,.9)'; c.lineWidth=3; c.stroke();
    var ang=Math.atan2(B0.y-A0.y,B0.x-A0.x);
    c.beginPath();
    c.moveTo(B0.x,B0.y);
    c.lineTo(B0.x-13*Math.cos(ang-0.42), B0.y-13*Math.sin(ang-0.42));
    c.lineTo(B0.x-13*Math.cos(ang+0.42), B0.y-13*Math.sin(ang+0.42));
    c.closePath(); c.fillStyle='rgba(251,191,36,1)'; c.fill();
  }

  // points, then labels drawn clear of the cluster
  var pulse=0.5+0.5*Math.sin(t*1.6);
  for(var i=0;i<PTS.length;i++){
    var w0=PTS[i][0], x=cx+PTS[i][1]*sc, y=cy-PTS[i][2]*sc, side=PTS[i][3];
    var r=6.5+2.5*pulse;
    var g=c.createRadialGradient(x,y,0,x,y,r*4);
    g.addColorStop(0,'rgba(34,211,238,.40)'); g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=g; c.beginPath(); c.arc(x,y,r*4,0,Math.PI*2); c.fill();

    c.beginPath(); c.arc(x,y,r,0,Math.PI*2);
    c.fillStyle='#8aa0ff'; c.fill();

    M(c,14,700);
    c.fillStyle='rgba(240,245,255,1)';
    if(side==='r'){ c.textAlign='left';   c.fillText(w0, x+14, y+5); }
    else if(side==='l'){ c.textAlign='right'; c.fillText(w0, x-14, y+5); }
    else { c.textAlign='center'; c.fillText(w0, x, y+30); }
  }

  // the analogy statement, anchored top-right where nothing else lives
  M(c,12.5,700); c.textAlign='right';
  c.fillStyle='rgba(251,191,36,1)';
  c.fillText('man \u2192 woman', W-26, 32);
  c.fillText('king \u2192 queen', W-26, 52);
  M(c,11); c.fillStyle='rgba(150,165,195,1)';
  c.fillText('same direction, same meaning shift', W-26, 72);

  note(c,'meaning lives in the direction of the vector \u2014 not in any single number',W,H);
});

// ---------- 4 attention ----------
A('p4-art', function(c,W,H,t){
  c.clearRect(0,0,W,H); gd(c,W,H,58,.10);
  var N=9, CY=H*0.52;
  var pad=Math.min(96,W*0.10);
  var gap=(W-pad*2)/(N-1);
  var X=function(i){ return pad+i*gap; };

  // The animation completes by the end of its animated window, so the HELD frame
  // always shows the full coreference example the caption describes.
  var PER=5.0, ph=(t%PER)/PER, ANIM=0.55;
  var focus=Math.min(N-1, Math.floor((ph/ANIM)*N));

  // the sentence
  var lab=['The','cat','sat','on','the','mat','because','it','slept'];

  // arcs from the focused token back to everything it reads
  for(var j=0;j<focus;j++){
    var wt=(j===focus-1) ? 0.62 : 0.10*Math.pow(0.80,focus-j);
    if(focus===8 && j===1) wt=1.0;              // "slept" -> "cat"
    if(focus===8 && j===7) wt=0.55;             // "slept" -> "it"
    var al=Math.min(1, 0.30 + wt*0.85);
    var x1=X(j), x2=X(focus);
    var mx=(x1+x2)/2, my=CY - Math.min(72, gap*1.5);
    c.beginPath(); c.moveTo(x1,CY-9); c.quadraticCurveTo(mx,my,x2,CY-9);
    c.strokeStyle='rgba(34,211,238,'+al.toFixed(2)+')';
    c.lineWidth=1.6+wt*5.5; c.stroke();
  }

  // tokens
  for(var i=0;i<N;i++){
    var on=(i===focus);
    var r=on?11:6.5;
    if(on){
      var g=c.createRadialGradient(X(i),CY,0,X(i),CY,r*3.4);
      g.addColorStop(0,'rgba(251,191,36,.5)'); g.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=g; c.beginPath(); c.arc(X(i),CY,r*3.4,0,Math.PI*2); c.fill();
    }
    c.beginPath(); c.arc(X(i),CY,r,0,Math.PI*2);
    c.fillStyle= on ? '#fbbf24' : (i<focus ? '#6b83d6' : '#39435c'); c.fill();
  }

  M(c,12.5,700); c.textAlign='center';
  for(var k=0;k<N;k++){
    c.fillStyle = k===focus ? 'rgba(251,191,36,1)'
                : (k<focus ? 'rgba(190,205,235,.95)' : 'rgba(96,110,142,.8)');
    c.fillText(lab[k], X(k), CY+34);
  }

  note(c,'"slept" reaches back to "cat" \u2014 who did the sleeping is learned, not given',W,H);
});

// ---------- 5 causal mask ----------
A('p5-art', function(c,W,H,t){
  c.clearRect(0,0,W,H);
  var n=15, side=Math.min(H-84,W*.46), cell=side/n;
  var ox=W/2-side/2, oy=(H-side)/2+4;
  var row=Math.floor(((t*2.2)%(n+3)));
  for(var r=0;r<n;r++) for(var cc=0;cc<n;cc++){
    var vis=cc<=r, y=oy+r*cell;
    c.beginPath(); c.rect(ox+cc*cell+1, y+1, cell-2, cell-2);
    if(vis){
      if(r<row){
        c.fillStyle = cc===r ? 'rgba(251,191,36,.9)' : 'hsla('+(214+(cc/Math.max(1,r))*20)+',78%,58%,.72)';
      } else c.fillStyle='rgba(16,24,42,.9)';
    } else c.fillStyle='rgba(8,12,24,.92)';
    c.fill(); c.strokeStyle='rgba(24,35,58,.7)'; c.lineWidth=.6; c.stroke();
  }
  M(c,10.5); c.textAlign='center'; c.fillStyle='rgba(85,97,128,1)';
  c.fillText('rows = the token looking   |   columns = the token being read', W/2, oy-14);
  c.fillText('everything above the diagonal is masked out - the model cannot see the future', W/2, oy+side+24);
});

// ---------- 6 multi-head ----------
A('p6-art', function(c,W,H,t){
  c.clearRect(0,0,W,H); gd(c,W,H,58,.10);
  var HD=['previous token','coreference','syntax','delimiters'];
  var n=16;
  var gapx=Math.max(24, W*0.045);
  var side=W-90;                               // usable width
  var cell=Math.min((side-gapx*3)/(4*n), (H-150)/n);
  var tot=cell*n;
  var totalW=tot*4+gapx*3;
  var ox0=(W-totalW)/2;
  var oy=Math.max(66, (H-tot)/2 + 8);
  var pulse=0.6+0.4*Math.sin(t*2);

  for(var h=0;h<4;h++){
    var ox=ox0+h*(tot+gapx);
    for(var r=0;r<n;r++){
      for(var cc=0;cc<n;cc++){
        var visible = cc<=r;
        c.beginPath();
        c.rect(ox+cc*cell+0.7, oy+r*cell+0.7, cell-1.4, cell-1.4);
        if(visible){
          var strong=false;
          if(h===0) strong=(cc===r-1);
          else if(h===1) strong=(cc===0)||(r>10&&cc===3);
          else if(h===2) strong=(cc===r)||((r-cc)%4===0);
          else strong=(cc===r)||((r*cc)%7===0);
          if(strong){
            c.fillStyle = (cc===r) ? 'rgba(251,191,36,.95)'
                                   : 'hsla(212,85%,62%,'+(0.65+0.3*pulse)+')';
          } else if(cc<r){
            c.fillStyle='rgba(40,56,92,.55)';
          } else c.fillStyle='rgba(16,24,42,.9)';
        } else c.fillStyle='rgba(10,15,28,.9)';
        c.fill();
      }
    }
    M(c,11.5,700); c.textAlign='center';
    c.fillStyle='rgba(165,180,210,1)';
    c.fillText(HD[h], ox+tot/2, oy-14);
  }
  note(c,'dozens of these run in parallel \u2014 each one learns a different relationship',W,H);
});

// ---------- 7 MoE ----------
A('p7-art', function(c,W,H,t){
  c.clearRect(0,0,W,H); gd(c,W,H,50,.14);
  var EXP=12, cols=6, rows=2;
  var bw=Math.min(118,W*.145), bh=44;
  var gx=Math.min(80,(W-bw*cols)/(cols+1)), gy=32;
  var ox=(W-(bw*cols+gx*(cols-1)))/2, oy=H*.28;
  var act=Math.floor(t*1.3)%EXP;
  for(var i=0;i<EXP;i++){
    var r=Math.floor(i/cols), cc=i%cols;
    var x=ox+cc*(bw+gx), y=oy+r*(bh+gy), on=i===act;
    bx(c,x,y,bw,bh,8);
    c.fillStyle= on?'rgba(13,23,48,.98)':'rgba(10,16,32,.85)'; c.fill();
    c.strokeStyle= on?'rgba(77,107,254,1)':'rgba(24,35,58,1)';
    c.lineWidth= on?2:1; c.stroke();
    M(c,11); c.textAlign='center';
    c.fillStyle= on?'rgba(34,211,238,1)':'rgba(85,97,128,1)';
    c.fillText('expert '+(i+1), x+bw/2, y+bh/2+4);
  }
  var tx=W*.5, ty=H*.11;
  c.beginPath(); c.arc(tx,ty,7,0,Math.PI*2); c.fillStyle='#fbbf24'; c.fill();
  M(c,10.5); c.textAlign='center'; c.fillStyle='rgba(251,191,36,.9)';
  c.fillText('one token', tx, ty-14);
  var r2=Math.floor(act/cols), c2=act%cols;
  var dx=ox+c2*(bw+gx)+bw/2, dy=oy+r2*(bh+gy);
  c.beginPath(); c.moveTo(tx,ty+10); c.quadraticCurveTo((tx+dx)/2, ty+40, dx, dy);
  c.strokeStyle='rgba(34,211,238,.6)'; c.lineWidth=2; c.setLineDash([5,4]); c.stroke();
  c.setLineDash([]);
  note(c,'the token visits a couple of experts, not all of them',W,H);
});

// ---------- 8 depth ----------
A('p8-art', function(c,W,H,t){
  c.clearRect(0,0,W,H);
  var L=14, bw=Math.min(320,W*.46);
  var ox=W*.5-bw/2, oy=40, bh=(H-96)/L-3;
  var wave=Math.floor(((t*1.05)%(L+6)));
  for(var i=0;i<L;i++){
    var y=oy+i*(bh+3), on=i<=wave, hue=222-(i/L)*48;
    bx(c,ox,y,bw,bh,5);
    c.fillStyle= on ? 'hsla('+hue+',72%,52%,.8)' : 'rgba(11,17,32,.85)'; c.fill();
    if(!on){ c.strokeStyle='rgba(24,35,58,1)'; c.lineWidth=1; c.stroke(); }
    if(on&&i===wave){ c.strokeStyle='rgba(251,191,36,1)'; c.lineWidth=2; c.stroke(); }
    if(bh>13){
      M(c,10); c.textAlign='left';
      c.fillStyle= on?'rgba(4,6,12,.9)':'rgba(85,97,128,1)';
      c.fillText(i<3?'surface':(i<7?'syntax':(i<11?'facts':'task state')), ox+12, y+bh/2+3.5);
    }
  }
  note(c,'the same block, repeated 60–120 times',W,H);
});

// ---------- 9 logits / softmax ----------
A('p9-art', function(c,W,H,t){
  c.clearRect(0,0,W,H);
  var TK=['Paris','the','a','located','France','city'], RA=[6.2,3.4,3.0,2.6,2.4,2.0];
  var s=0,i; for(i=0;i<RA.length;i++) s+=RA[i];
  var mx=Math.max.apply(null,RA), ex=[], e=0;
  for(i=0;i<RA.length;i++){ ex.push(Math.exp(RA[i]-mx)); e+=ex[i]; }
  var PR=[], ST=[]; for(i=0;i<RA.length;i++){ PR.push(ex[i]/e); ST.push(RA[i]/s); }
  var PER=6, ph=(t%PER)/PER, q= ph<.5?EIO(ph/.5):EIO((1-ph)/.5);
  var padL=70,padR=30,padT=46,padB=68;
  var pw=W-padL-padR, phh=H-padT-padB, slot=pw/TK.length;
  c.beginPath(); c.moveTo(padL,H-padB); c.lineTo(W-padR,H-padB);
  c.strokeStyle='rgba(38,52,79,1)'; c.stroke();
  var tot=0;
  for(i=0;i<TK.length;i++){
    var v=ST[i]+(PR[i]-ST[i])*q; tot+=v;
    var hh=Math.max(2,v*phh*.96), x=padL+i*slot+slot*.18, wd=slot*.64;
    var g=c.createLinearGradient(0,H-padB-hh,0,H-padB);
    if(q<.5){ g.addColorStop(0,'#94a3b8'); g.addColorStop(1,'#475569'); }
    else { g.addColorStop(0,'#22d3ee'); g.addColorStop(1,'#4d6bfe'); }
    bx(c,x,H-padB-hh,wd,hh,5); c.fillStyle=g; c.fill();
    M(c,11.5); c.textAlign='center';
    c.fillStyle= q>.5?'rgba(238,243,255,.95)':'rgba(85,97,128,1)';
    c.fillText(TK[i], x+wd/2, H-padB+20);
    c.fillStyle= q>.5?'rgba(34,211,238,1)':'rgba(85,97,128,1)';
    c.fillText((v*100).toFixed(1)+'%', x+wd/2, Math.max(14,H-padB-hh-8));
  }
  S(c,14); c.textAlign='left';
  c.fillStyle= q>.5?'rgba(34,211,238,1)':'rgba(143,162,196,1)';
  c.fillText(q>.5?'softmax -> a probability distribution':'raw scores (logits), unnormalized', padL, 24);
  M(c,12); c.textAlign='right'; c.fillStyle='rgba(85,97,128,1)';
  c.fillText('sum = '+tot.toFixed(2), W-padR, 24);
});

// ---------- 10 sampling ----------
A('p10-art', function(c,W,H,t){
  c.clearRect(0,0,W,H); gd(c,W,H,50,.14);
  var T=[['Paris',.62],['the',.14],['a',.09],['located',.07],['France',.05],['other',.03]];
  var C=['#4d6bfe','#22d3ee','#a78bfa','#34d399','#fbbf24','#fb7185'];
  var cx=W*.36, cy=H*.54, R=Math.min(W*.18,H*.33), a0=-Math.PI/2,i;
  for(i=0;i<T.length;i++){
    var a1=a0+T[i][1]*Math.PI*2;
    c.beginPath(); c.moveTo(cx,cy); c.arc(cx,cy,R,a0,a1); c.closePath();
    c.fillStyle=C[i]; c.globalAlpha=.84; c.fill(); c.globalAlpha=1;
    c.strokeStyle='rgba(4,6,12,.9)'; c.lineWidth=2; c.stroke();
    if(T[i][1]>.06){
      var am=(a0+a1)/2;
      M(c,12); c.textAlign='center'; c.textBaseline='middle';
      c.fillStyle='rgba(4,6,12,.95)';
      c.fillText(T[i][0], cx+Math.cos(am)*R*.66, cy+Math.sin(am)*R*.66);
    }
    a0=a1;
  }
  c.textBaseline='alphabetic';
  var PER=3.8, ph=t%PER, sp= ph<2.2?EO(ph/2.2):1;
  var ang=sp*(Math.PI*2*3+(-Math.PI/2+.62*Math.PI*2*.5));
  var nx=cx+Math.cos(ang)*R*.94, ny=cy+Math.sin(ang)*R*.94;
  c.beginPath(); c.moveTo(cx,cy); c.lineTo(nx,ny);
  c.strokeStyle='rgba(238,243,255,.96)'; c.lineWidth=3.5; c.lineCap='round'; c.stroke();
  c.beginPath(); c.arc(cx,cy,7,0,Math.PI*2); c.fillStyle='#eef3ff'; c.fill();
  var landed=ph>=2.15, rx=W*.66;
  M(c,10.5); c.textAlign='left'; c.fillStyle='rgba(85,97,128,1)';
  c.fillText('SAMPLED TOKEN', rx, cy-30);
  S(c,Math.min(30,W/24)); c.fillStyle= landed?'rgba(52,211,153,1)':'rgba(85,97,128,1)';
  c.fillText(landed?'Paris':'. . .', rx, cy+8);
  M(c,11.5); c.fillStyle='rgba(143,162,196,.9)';
  c.fillText('appended to the input,', rx, cy+40);
  c.fillText('then the whole thing runs again', rx, cy+58);
  M(c,10); c.textAlign='right'; c.fillStyle='rgba(85,97,128,1)';
  c.fillText('slice area = probability', W-20, H-16);
});

// ---------- 11 KV cache ----------
A('p11-art', function(c,W,H,t){
  c.clearRect(0,0,W,H);
  var L=9, MXT=26, padL=64,padT=46,padB=46,padR=120;
  var gw=W-padL-padR, gh=H-padT-padB, cw=gw/MXT, ch=gh/L;
  var PER=.26*MXT+1.5, ph=t%PER, f=Math.min(MXT, Math.floor(ph/.26));
  for(var l=0;l<L;l++) for(var i=0;i<MXT;i++){
    c.beginPath(); c.rect(padL+i*cw+1, padT+l*ch+1, cw-2, ch-2);
    if(i<f){
      var hue=222-(l/L)*44;
      c.fillStyle= (i===f-1)?'rgba(251,191,36,.95)':'hsla('+hue+',78%,56%,.72)';
    } else c.fillStyle='rgba(11,17,32,.8)';
    c.fill();
    c.strokeStyle='rgba(24,35,58,.8)'; c.lineWidth=.6; c.stroke();
  }
  c.strokeStyle='rgba(38,52,79,1)'; c.lineWidth=1; c.strokeRect(padL,padT,gw,gh);
  M(c,10.5); c.textAlign='left'; c.fillStyle='rgba(85,97,128,1)';
  c.fillText('tokens generated ->', padL, padT-14);
  var rx=W-padR+18;
  c.fillText('CACHE', rx, padT+6);
  S(c,Math.min(26,W/28)); c.fillStyle='rgba(34,211,238,1)';
  c.fillText(String(f*L), rx, padT+38);
  M(c,10.5); c.fillStyle='rgba(85,97,128,1)';
  c.fillText('entries', rx, padT+54);
  c.fillStyle='rgba(143,162,196,.9)';
  c.fillText('linear in', rx, padT+84);
  c.fillText('context', rx, padT+100);
  note(c,'every new token adds one full column across every layer',W,H);
});

// ---------- 12 training ----------
A('p12-art', function(c,W,H,t){
  c.clearRect(0,0,W,H); gd(c,W,H,50,.14);
  var L=7, lx=Math.min(90,W*.08), lw=Math.min(200,W*.24);
  var top=54, bot=H-34, rh=(bot-top)/L, PER=4.4, ph=t%PER;
  var fw= ph<1.4?ph/1.4:1, bw2= ph>1.6?Math.min(1,(ph-1.6)/1.4):0;
  for(var i=0;i<L;i++){
    var y=top+i*rh, pF=fw*L>i, pB=bw2*L>(L-1-i);
    bx(c,lx,y+3,lw,rh-8,7);
    c.fillStyle= pB?'rgba(48,16,26,.92)':(pF?'rgba(13,23,48,.96)':'rgba(11,17,32,.85)'); c.fill();
    c.strokeStyle= pB?'rgba(251,113,133,.9)':(pF?'rgba(77,107,254,.9)':'rgba(24,35,58,1)');
    c.lineWidth=1.6; c.stroke();
    M(c,10.5); c.textAlign='left';
    c.fillStyle= pB?'rgba(251,113,133,1)':(pF?'rgba(124,147,255,1)':'rgba(85,97,128,1)');
    c.fillText('layer '+(i+1), lx+12, y+rh/2+4);
  }
  if(ph<1.45){
    c.beginPath(); c.arc(lx+lw+20, Math.min(bot,top+(fw*L)*rh-4), 7, 0, Math.PI*2);
    c.fillStyle='#4d6bfe'; c.fill();
  }
  if(ph>1.55&&ph<3){
    c.beginPath(); c.arc(lx+lw+20, Math.max(top,bot-(bw2*L)*rh+4), 7, 0, Math.PI*2);
    c.fillStyle='#fb7185'; c.fill();
  }
  S(c,12.5); c.textAlign='left';
  c.fillStyle= ph<1.4?'rgba(124,147,255,1)':'rgba(85,97,128,1)';
  c.fillText('forward', lx, 26);
  c.fillStyle= (ph>1.6&&ph<3)?'rgba(251,113,133,1)':'rgba(85,97,128,1)';
  c.fillText('backward', lx+lw+44, 26);
  var gx=W*.50, gw=W*.44, gy=58, gh=H-106;
  c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx,gy+gh); c.lineTo(gx+gw,gy+gh);
  c.strokeStyle='rgba(24,35,58,1)'; c.stroke();
  var st=Math.max(2,Math.floor((ph/PER)*90));
  c.beginPath();
  for(var k=0;k<=st;k++){
    var x=gx+(k/90)*gw, v=.92*Math.exp(-k/26)+.10+.018*Math.sin(k*1.9);
    var yy=gy+gh-(v*gh*.92);
    if(k===0) c.moveTo(x,yy); else c.lineTo(x,yy);
  }
  c.strokeStyle='#34d399'; c.lineWidth=2.6; c.stroke();
  M(c,10.5); c.textAlign='left'; c.fillStyle='rgba(85,97,128,1)';
  c.fillText('training loss', gx+6, gy+14);
  c.textAlign='right'; c.fillStyle='rgba(52,211,153,1)';
  c.fillText('step '+Math.round(ph/PER*90), gx+gw-4, gy+14);
  M(c,10.5); c.textAlign='left'; c.fillStyle='rgba(85,97,128,1)';
  c.fillText('predict  →  measure error  →  nudge every weight  →  repeat', lx, H-14);
});

// ---------- 13 cost ----------
A('p13-art', function(c,W,H,t){
  c.clearRect(0,0,W,H); gd(c,W,H,50,.14);
  var gx=70, gy=46, gw=W-140, gh=H-112;
  c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx,gy+gh); c.lineTo(gx+gw,gy+gh);
  c.strokeStyle='rgba(38,52,79,1)'; c.stroke();
  var prog=Math.min(1,(t%7)/5), i;
  c.beginPath();
  for(i=0;i<=100*prog;i++){
    var x=gx+(i/100)*gw, y=gy+gh-Math.pow(i/100,2)*gh*.94;
    if(i===0) c.moveTo(x,y); else c.lineTo(x,y);
  }
  c.strokeStyle='#fb7185'; c.lineWidth=2.4; c.stroke();
  c.beginPath();
  for(i=0;i<=100*prog;i++){
    var x2=gx+(i/100)*gw, y2=gy+gh-(i/100)*gh*.72;
    if(i===0) c.moveTo(x2,y2); else c.lineTo(x2,y2);
  }
  c.strokeStyle='#fbbf24'; c.lineWidth=2.4; c.stroke();
  c.beginPath();
  for(i=0;i<=100*prog;i++){
    var x3=gx+(i/100)*gw, y3=gy+gh-Math.pow(i/100,.9)*gh*.5;
    if(i===0) c.moveTo(x3,y3); else c.lineTo(x3,y3);
  }
  c.strokeStyle='#a78bfa'; c.lineWidth=2.4; c.stroke();
  M(c,11.5); c.textAlign='left';
  c.fillStyle='rgba(251,113,133,1)'; c.fillText('attention compute   O(n^2)', gx+14, gy+18);
  c.fillStyle='rgba(251,191,36,1)';  c.fillText('KV cache memory   O(n)', gx+14, gy+38);
  c.fillStyle='rgba(167,139,250,1)'; c.fillText('prefill work   O(n*L)', gx+14, gy+58);
  M(c,10.5); c.fillStyle='rgba(85,97,128,1)';
  c.fillText('context length ->', gx+gw-140, gy+gh+22);
  c.fillText('three things blow up with context - every long-context architecture attacks one of these lines', gx, H-16);
});

// ---------- scroll bar ----------
var bar=document.getElementById('bar');
addEventListener('scroll',function(){
  var h=document.documentElement.scrollHeight-innerHeight;
  bar.style.width=(h>0?(scrollY/h*100):0)+'%';
},{passive:true});
