// ══════════════════════════════════════════════════════════════════════════
// UTILITIES - Modal, Toast, Floating Leaves, Background Animation
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════ MODAL ══════════════════
function openModal(id) {
  document.getElementById(id).classList.add('open');
  if (id === 'modal-kancing') renderTahap4();
  if (id === 'modal-addnews') initQuestionBuilder('questionBuilder');
  if (id === 'modal-addquestion') initQuestionBuilder('newQuestionBuilder');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });
});

// ══════════════════ TOAST ══════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ══════════════════ FLOATING LEAVES ══════════════════
function generateLeaves() {
  const container = document.getElementById('floatingLeaves');
  if (!container) return;
  const emojis = ['🍃','🌿','🍀','🌱','🌾'];
  container.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.animationDuration = (8 + Math.random() * 12) + 's';
    leaf.style.animationDelay = (Math.random() * 10) + 's';
    leaf.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    container.appendChild(leaf);
  }
}

// ══════════════════════════════════════════════════════════════════════════
// BACKGROUND ANIMATION ENGINE
// ══════════════════════════════════════════════════════════════════════════
(function initBackground() {

  // ── 1. CANVAS: sky-to-earth gradient + animated sun/moon + hills + stars ──
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawFrame() {
    t += 0.004;
    ctx.clearRect(0, 0, W, H);

    // Sky gradient — slow color cycle between day blue and golden hour
    const skyTop    = lerpColor('#b8e8f5','#ffe8a3', (Math.sin(t*0.3)+1)/2 * 0.35);
    const skyBottom = lerpColor('#d4f0e0','#f0faf4', (Math.sin(t*0.2)+1)/2 * 0.2);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(0.55, skyBottom);
    skyGrad.addColorStop(1, '#e8f7ee');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Sun
    const sunX = W * 0.78;
    const sunY = H * 0.14 + Math.sin(t * 0.5) * 8;
    const sunR = Math.min(W, H) * 0.055;
    // Glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.3, sunX, sunY, sunR * 3.5);
    sunGlow.addColorStop(0, 'rgba(255,224,80,0.28)');
    sunGlow.addColorStop(1, 'rgba(255,224,80,0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath(); ctx.arc(sunX, sunY, sunR * 3.5, 0, Math.PI*2); ctx.fill();
    // Sun body
    const sunGrad = ctx.createRadialGradient(sunX-sunR*0.25, sunY-sunR*0.25, 0, sunX, sunY, sunR);
    sunGrad.addColorStop(0, '#fff5b0');
    sunGrad.addColorStop(0.5, '#F4C430');
    sunGrad.addColorStop(1, '#e8a800');
    ctx.fillStyle = sunGrad;
    ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI*2); ctx.fill();
    // Sun rays
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(t * 0.4);
    ctx.strokeStyle = 'rgba(244,196,48,0.35)';
    for (let i=0; i<8; i++) {
      const a = (i/8)*Math.PI*2;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*(sunR+6), Math.sin(a)*(sunR+6));
      ctx.lineTo(Math.cos(a)*(sunR+22), Math.sin(a)*(sunR+22));
      ctx.stroke();
    }
    ctx.restore();

    // Layered hills
    drawHill(ctx, W, H, 0.62, 0.38, '#c8ead4', 0.6, t * 0.12);
    drawHill(ctx, W, H, 0.72, 0.30, '#a8d5b5', 0.75, t * -0.09);
    drawHill(ctx, W, H, 0.82, 0.22, '#74b88a', 0.9, t * 0.07);
    // Foreground strip
    const fgGrad = ctx.createLinearGradient(0, H*0.88, 0, H);
    fgGrad.addColorStop(0, '#4a9e6e');
    fgGrad.addColorStop(1, '#2d6a4f');
    ctx.fillStyle = fgGrad;
    ctx.fillRect(0, H*0.88, W, H*0.12);

    // Trees on front hill
    for (let i=0; i<12; i++) {
      const tx = (i/11)*W*0.9 + W*0.05 + Math.sin(i*1.7)*30;
      const ty = H*0.80 - Math.abs(Math.sin((tx/W)*Math.PI))*H*0.06;
      const th = 18 + (i%3)*10 + Math.sin(i+t)*3;
      drawTree(ctx, tx, ty, th);
    }

    requestAnimationFrame(drawFrame);
  }
  drawFrame();

  function drawHill(ctx, W, H, yFrac, amp, color, alpha, phase) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x=0; x<=W; x+=4) {
      const nx = x / W;
      const y = H * yFrac - Math.sin(nx * Math.PI + phase) * H * amp * 0.13
                           - Math.sin(nx * Math.PI * 2.3 + phase*1.3) * H * 0.028;
      x===0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawTree(ctx, x, y, h) {
    // trunk
    ctx.fillStyle = '#5a3e28';
    ctx.fillRect(x-2, y, 4, h*0.35);
    // foliage layers
    [1, 0.7, 0.45].forEach((scale, i) => {
      ctx.fillStyle = i===0 ? '#2d6a4f' : i===1 ? '#3d8a5f' : '#52b788';
      ctx.beginPath();
      ctx.moveTo(x, y - h*scale);
      ctx.lineTo(x - h*scale*0.38, y - h*i*0.22);
      ctx.lineTo(x + h*scale*0.38, y - h*i*0.22);
      ctx.closePath();
      ctx.fill();
    });
  }

  function lerpColor(a, b, t) {
    const ah = a.replace('#',''), bh = b.replace('#','');
    const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16);
    const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16);
    const rr = Math.round(ar+(br-ar)*t), rg = Math.round(ag+(bg-ag)*t), rb = Math.round(ab+(bb-ab)*t);
    return `rgb(${rr},${rg},${rb})`;
  }

  // ── 2. SVG CLOUDS ──
  const cloudLayer = document.getElementById('cloudLayer');
  if (cloudLayer) {
    const cloudShapes = [
      `<svg viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="90" cy="55" rx="85" ry="28" fill="white"/><ellipse cx="65" cy="48" rx="42" ry="32" fill="white"/><ellipse cx="110" cy="46" rx="38" ry="30" fill="white"/><ellipse cx="90" cy="40" rx="30" ry="24" fill="white"/></svg>`,
      `<svg viewBox="0 0 130 60" xmlns="http://www.w3.org/2000/svg"><ellipse cx="65" cy="42" rx="60" ry="20" fill="rgba(255,255,255,0.9)"/><ellipse cx="48" cy="36" rx="30" ry="24" fill="rgba(255,255,255,0.9)"/><ellipse cx="82" cy="34" rx="28" ry="22" fill="rgba(255,255,255,0.9)"/></svg>`,
      `<svg viewBox="0 0 100 45" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="32" rx="46" ry="16" fill="rgba(255,255,255,0.7)"/><ellipse cx="38" cy="26" rx="24" ry="18" fill="rgba(255,255,255,0.7)"/><ellipse cx="62" cy="25" rx="20" ry="16" fill="rgba(255,255,255,0.7)"/></svg>`,
    ];

    const cloudDefs = [
      { w:280, top:'4%',  dur:55, delay:0,    shape:0, op:0.75 },
      { w:200, top:'10%', dur:80, delay:-25,  shape:1, op:0.6  },
      { w:160, top:'7%',  dur:100,delay:-55,  shape:2, op:0.5  },
      { w:320, top:'1%',  dur:70, delay:-40,  shape:0, op:0.55 },
      { w:180, top:'14%', dur:90, delay:-15,  shape:1, op:0.45 },
      { w:240, top:'3%',  dur:65, delay:-60,  shape:2, op:0.65 },
    ];

    cloudDefs.forEach(c => {
      const div = document.createElement('div');
      div.className = 'cloud';
      div.style.cssText = `top:${c.top};width:${c.w}px;opacity:${c.op};animation-duration:${c.dur}s;animation-delay:${c.delay}s;`;
      div.innerHTML = cloudShapes[c.shape];
      cloudLayer.appendChild(div);
    });
  }

  // ── 3. FLOATING CLIMATE EMOJIS ──
  const floaterContainer = document.getElementById('bgFloaters');
  if (floaterContainer) {
    const floaterEmojis = ['🍃','🌿','🌱','🍀','🌾','💧','❄️','🌸','🌻','🍃','🌿','🌱'];

    floaterEmojis.forEach((em, i) => {
      const el = document.createElement('div');
      el.className = 'bg-floater';
      el.textContent = em;
      const size = 1.1 + Math.random() * 1.2;
      el.style.cssText = `
        left: ${5 + (i / floaterEmojis.length) * 90}%;
        font-size: ${size}rem;
        animation-duration: ${14 + Math.random() * 18}s;
        animation-delay: ${-Math.random() * 20}s;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
      `;
      floaterContainer.appendChild(el);
    });
  }

})(); // end initBackground

// Export functions globally
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.generateLeaves = generateLeaves;
