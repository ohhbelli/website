/* =========================================================
   BELLI · Elfenwald – die Szene
   Sternenhimmel, Mond, Nebel, Bäume, Pilze, Feen & Feenstaub
   ========================================================= */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 700px)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  const TAU = Math.PI * 2;

  /* ---------- Zufall mit Samen ---------- */
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  const PALETTE = {
    mint:   { core: '#f2fffb', mid: '#8dffe0', edge: '#145a4c', stem: '#cfeee6', glow: 'rgba(141,255,224,.85)', rgb: [141, 255, 224] },
    violet: { core: '#f7f1ff', mid: '#c9b2ff', edge: '#3f2777', stem: '#e2dcf2', glow: 'rgba(201,178,255,.85)', rgb: [201, 178, 255] },
    gold:   { core: '#fffaf0', mid: '#ffd98a', edge: '#6e4510', stem: '#f1e8d4', glow: 'rgba(255,217,138,.8)',  rgb: [255, 230, 166] },
  };

  /* =======================================================
     PILZE (SVG)
     ======================================================= */
  const MUSH = {
    mint:   { hi: '#c4e9df', mid: '#68b6a3', lo: '#2b6a5d', edge: '#0b2822', stem: '#bfd3cc', glow: '141,255,224' },
    violet: { hi: '#d9cff1', mid: '#9a8bd0', lo: '#4c3c8a', edge: '#171035', stem: '#cfc7e3', glow: '201,178,255' },
    gold:   { hi: '#f1e1ba', mid: '#d3a465', lo: '#80532a', edge: '#2b1b08', stem: '#e2d6bd', glow: '255,217,138' },
  };

  // gemeinsame Verläufe & Filter (einmal im Dokument)
  (function mushDefs() {
    let d = `<filter id="mnoise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 .04  0 0 0 0 .03  0 0 0 1.6 -.55" result="c"/><feComposite in="c" in2="SourceAlpha" operator="in"/></filter>
      <filter id="msoft" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation=".65"/></filter>
      <linearGradient id="mfade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#050d0b" stop-opacity="0"/><stop offset=".5" stop-color="#050d0b" stop-opacity=".06"/><stop offset="1" stop-color="#050d0b" stop-opacity=".88"/></linearGradient>
      <radialGradient id="mhl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
    Object.entries(MUSH).forEach(([k, p]) => {
      d += `<radialGradient id="mc-${k}" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="${p.hi}"/><stop offset=".38" stop-color="${p.mid}"/><stop offset=".8" stop-color="${p.lo}"/><stop offset="1" stop-color="${p.edge}" stop-opacity=".9"/></radialGradient>
        <linearGradient id="ms-${k}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${p.lo}" stop-opacity=".85"/><stop offset=".35" stop-color="${p.stem}" stop-opacity=".92"/><stop offset=".7" stop-color="${p.stem}" stop-opacity=".8"/><stop offset="1" stop-color="${p.lo}" stop-opacity=".7"/></linearGradient>
        <radialGradient id="mg-${k}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".95"/><stop offset=".65" stop-color="${p.lo}"/><stop offset="1" stop-color="${p.mid}"/></radialGradient>
        <radialGradient id="mgl-${k}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgb(${p.glow})" stop-opacity=".5"/><stop offset="1" stop-color="rgb(${p.glow})" stop-opacity="0"/></radialGradient>`;
    });
    document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${d}</defs></svg>`);
  })();

  // ein einzelner Pilz: kind 0 = Schirmling (mit Ring & Punkten), 1 = flacher Hut, 2 = Glockenpilz
  function mushBody(r, key, cap, h, kind, cx, gy) {
    const lean = (r() - .5) * cap * .26;
    const ccx = cx + lean;
    const T = 6;
    const ch = cap * (kind === 1 ? lerp(.34, .44, r()) : kind === 2 ? lerp(.8, 1.0, r()) : lerp(.46, .6, r()));
    const capW = kind === 2 ? cap * .62 : cap;
    const y0 = T + ch;
    const ry = capW * .085;
    const L = ccx - capW / 2, R = ccx + capW / 2;
    const sw = cap * (kind === 2 ? lerp(.07, .09, r()) : lerp(.12, .18, r()));
    const st = sw * .8;
    const sb = kind === 0 ? sw * lerp(1.5, 2.0, r()) : sw * lerp(1.0, 1.3, r());
    const len = Math.max(gy - y0, cap * .3);
    const f = (n) => n.toFixed(1);

    const k1 = kind === 0 ? .98 : kind === 1 ? .85 : .55;
    const k2 = kind === 0 ? .30 : kind === 1 ? .36 : .10;
    const dome = `M${f(L)},${f(y0)} C${f(L)},${f(y0 - ch * k1)} ${f(ccx - capW * k2)},${T} ${f(ccx)},${T} C${f(ccx + capW * k2)},${T} ${f(R)},${f(y0 - ch * k1)} ${f(R)},${f(y0)} Q${f(ccx)},${f(y0 - ry * 2)} ${f(L)},${f(y0)}Z`;
    const stem = `M${f(cx - sb / 2)},${f(gy)} C${f(cx - sw / 2)},${f(gy - len * .25)} ${f(ccx - st / 2 - lean * .1)},${f(y0 + len * .5)} ${f(ccx - st / 2)},${f(y0)} L${f(ccx + st / 2)},${f(y0)} C${f(ccx + st / 2 + lean * .1)},${f(y0 + len * .5)} ${f(cx + sw / 2)},${f(gy - len * .25)} ${f(cx + sb / 2)},${f(gy)}Z`;

    let o = `<ellipse class="cap-glow" cx="${f(ccx)}" cy="${f(y0 - ch * .45)}" rx="${f(capW * .95)}" ry="${f(ch * 1.25)}" fill="url(#mgl-${key})"/>`;
    // Lamellen-Unterseite
    o += `<ellipse cx="${f(ccx)}" cy="${f(y0)}" rx="${f(capW / 2 * .99)}" ry="${f(ry)}" fill="url(#mg-${key})"/>`;
    let gl = '';
    for (let a = 0; a < Math.PI * 2; a += .22) {
      gl += `M${f(ccx + Math.cos(a) * capW * .09)},${f(y0 + Math.sin(a) * ry * .2)}L${f(ccx + Math.cos(a) * capW * .48)},${f(y0 + Math.sin(a) * ry * .95)}`;
    }
    o += `<path d="${gl}" stroke="${MUSH[key].hi}" stroke-width=".5" opacity=".16" fill="none"/>`;
    // Stiel
    o += `<path d="${stem}" fill="url(#ms-${key})"/><path d="${stem}" fill="url(#mfade)"/>`;
    o += `<ellipse cx="${f(ccx)}" cy="${f(y0)}" rx="${f(st / 2)}" ry="${f(st * .13)}" fill="url(#ms-${key})"/>`;
    let fib = '';
    [-.28, 0, .26].forEach((q) => { fib += `M${f(ccx + q * st)},${f(y0 + len * .04)}L${f(cx + q * sw * 1.1)},${f(gy - len * .04)}`; });
    o += `<path d="${fib}" stroke="${MUSH[key].edge}" stroke-width=".7" opacity=".1" fill="none"/>`;
    // Ring
    if (kind === 0 || (kind === 1 && r() < .4)) {
      const yr = y0 + len * .2, xr = lerp(ccx, cx, .2);
      o += `<path d="M${f(xr - st * .5)},${f(yr)}Q${f(xr)},${f(yr + st * .3)} ${f(xr + st * .5)},${f(yr)}L${f(xr + st * 1.35)},${f(yr + st * .7)}Q${f(xr)},${f(yr + st * 1.1)} ${f(xr - st * 1.35)},${f(yr + st * .7)}Z" fill="${MUSH[key].stem}" opacity=".6"/>`;
      o += `<path d="M${f(xr - st * 1.3)},${f(yr + st * .72)}Q${f(xr)},${f(yr + st * 1.1)} ${f(xr + st * 1.3)},${f(yr + st * .72)}" stroke="${MUSH[key].edge}" stroke-width=".6" opacity=".2" fill="none"/>`;
    }
    // Hut
    o += `<path d="${dome}" fill="url(#mc-${key})"/>`;
    o += `<path d="${dome}" filter="url(#mnoise)" opacity=".22"/>`;
    // Punkte / Streifen
    if (kind === 0 || kind === 1) {
      const n = kind === 0 ? 6 + Math.floor(r() * 7) : 3 + Math.floor(r() * 4);
      let sp = '';
      for (let i = 0; i < n; i++) {
        const u = (r() - .5) * 1.7;
        const yd = y0 - ch * Math.pow(Math.max(0, 1 - u * u), .6);
        const yy = yd + (y0 - ry * .8 - yd) * Math.pow(r(), 1.3) * .85 + 2;
        const sr = capW * lerp(.018, .045, r()) * (1 - Math.abs(u) * .55) * (kind === 1 ? .6 : 1);
        sp += `<ellipse cx="${f(ccx + u * capW / 2 * .95)}" cy="${f(yy)}" rx="${f(sr)}" ry="${f(sr * .62)}"/>`;
      }
      o += `<g fill="#fff6e6" opacity="${kind === 0 ? .5 : .32}">${sp}</g>`;
    } else {
      let st2 = '';
      for (let i = -3; i <= 3; i++) st2 += `M${f(ccx + i * capW * .02)},${f(T + 3)}Q${f(ccx + i * capW * .12)},${f(y0 - ch * .4)} ${f(ccx + i * capW * .15)},${f(y0 - 1)}`;
      o += `<path d="${st2}" stroke="${MUSH[key].edge}" stroke-width=".7" opacity=".14" fill="none"/>`;
    }
    // Lichtreflex & Randlicht
    o += `<ellipse cx="${f(ccx - capW * .17)}" cy="${f(T + ch * .3)}" rx="${f(capW * .2)}" ry="${f(ch * .13)}" transform="rotate(-18 ${f(ccx - capW * .17)} ${f(T + ch * .3)})" fill="url(#mhl)"/>`;
    return `<g filter="url(#msoft)">${o}</g>`;
  }

  function shroomSVG({ glow = 'mint', h = 160, cap = 120, seed = 1 }) {
    const r = rng(seed * 977 + 13);
    const key = MUSH[glow] ? glow : 'mint';
    const kind = Math.abs(Math.round(seed)) % 3;
    const W = Math.round(cap * 1.9), H = Math.round(h) + 10;
    const cx = W / 2, gy = H - 8;
    let out = `<ellipse class="cap-glow" cx="${cx}" cy="${gy}" rx="${cap * .85}" ry="${cap * .12}" fill="url(#mgl-${key})"/>`;
    // kleine Geschwister im Hintergrund
    const babies = cap > 60 ? 1 + Math.floor(r() * 2) : 0;
    for (let i = 0; i < babies; i++) {
      const s = lerp(.34, .5, r()), dir = i === 0 ? (r() < .5 ? -1 : 1) : (out.includes('data-b="-1"') ? 1 : -1);
      const dx = dir * cap * lerp(.36, .5, r());
      out += `<g data-b="${dir}" transform="translate(${(cx + dx - s * cx).toFixed(1)} ${(gy - s * gy).toFixed(1)}) scale(${s.toFixed(2)})" opacity=".92">${mushBody(r, key, cap, h * lerp(.6, .9, r()), (kind + 1 + i) % 3, cx, gy)}</g>`;
    }
    out += mushBody(r, key, cap, h, kind, cx, gy);
    // Waldboden & Moos
    out += `<path d="M${(cx - cap * .6).toFixed(1)},${gy + 6} Q${(cx - cap * .3).toFixed(1)},${(gy - cap * .08).toFixed(1)} ${cx},${(gy - cap * .03).toFixed(1)} Q${(cx + cap * .32).toFixed(1)},${(gy - cap * .1).toFixed(1)} ${(cx + cap * .62).toFixed(1)},${gy + 6}Z" fill="#071410"/>`;
    out += `<path d="M${(cx - cap * .5).toFixed(1)},${(gy + 1).toFixed(1)} Q${(cx - cap * .25).toFixed(1)},${(gy - cap * .07).toFixed(1)} ${cx},${(gy - cap * .02).toFixed(1)} Q${(cx + cap * .3).toFixed(1)},${(gy - cap * .08).toFixed(1)} ${(cx + cap * .52).toFixed(1)},${(gy + 1).toFixed(1)}" stroke="#2a7a60" stroke-width="1.4" opacity=".55" fill="none"/>`;
    let gr = '';
    const gn = 10 + Math.floor(cap / 18);
    for (let i = 0; i < gn; i++) {
      const x = cx + (r() - .5) * cap * 1.5, hh = lerp(7, 26, r() * r()), bend = (r() - .5) * 14;
      gr += `<path d="M${x.toFixed(1)},${gy + 5}Q${(x + bend * .3).toFixed(1)},${(gy - hh * .6).toFixed(1)} ${(x + bend).toFixed(1)},${(gy - hh).toFixed(1)}" stroke="${i % 3 ? '#0a2219' : '#17402f'}" stroke-width="${lerp(.8, 1.7, r()).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
    }
    out += gr;
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true" style="overflow:visible">${out}</svg>`;
  }

  // Pilze aus data-shroom="glow:mint;h:200;cap:150;seed:3"
  document.querySelectorAll('[data-shroom]').forEach((el) => {
    const o = {};
    el.dataset.shroom.split(';').forEach((kv) => { const [k, v] = kv.split(':'); o[k] = isNaN(+v) ? v : +v; });
    if (small) { o.h *= .62; o.cap *= .62; }
    el.innerHTML = shroomSVG(o);
  });

  // Pilzgruppen am Waldboden des Hero
  const ground = document.querySelector('[data-shrooms="ground"]');
  function plantGround() {
    if (!ground) return;
    const w = ground.clientWidth;
    const r = rng(42);
    const glows = ['mint', 'mint', 'violet', 'gold'];
    let html = '';
    const clusters = small ? [0.08, 0.86] : [0.06, 0.2, 0.74, 0.9];
    clusters.forEach((cx, ci) => {
      const count = 3 + Math.floor(r() * 4);
      for (let i = 0; i < count; i++) {
        const s = lerp(.25, 1, r()) * (i === 0 ? 1.25 : 1);
        const g = glows[(ci + i) % glows.length];
        const x = (cx + (r() - .5) * .09) * w;
        const svg = shroomSVG({ glow: g, h: 90 * s + 20, cap: 60 * s + 12, seed: ci * 31 + i * 7 + 1 });
        html += `<span style="position:absolute;left:${x.toFixed(0)}px;bottom:${(r() * 6 - 4).toFixed(0)}px;translate:-50% 0;transform:scale(${small ? .7 : 1});transform-origin:50% 100%;z-index:${Math.round(s * 10)}">${svg}</span>`;
      }
    });
    ground.innerHTML = html;
  }
  plantGround();

  // Feenkreis: Pilze im perspektivischen Ring
  const ring = document.getElementById('ring');
  function plantRing() {
    if (!ring) return;
    ring.querySelectorAll('.ring__shroom').forEach((n) => n.remove());
    const w = ring.clientWidth, h = ring.clientHeight;
    const rx = w * .42, ry = h * .26;
    const N = small ? 11 : 15;
    const r = rng(7);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU + r() * .2;
      const depth = (Math.sin(a) + 1) / 2;           // 0 = hinten, 1 = vorne
      const s = lerp(.45, 1.05, depth) * lerp(.75, 1.1, r()) * (small ? .7 : 1);
      const el = document.createElement('span');
      el.className = 'ring__shroom';
      el.style.left = `calc(50% + ${(Math.cos(a) * rx).toFixed(0)}px)`;
      el.style.top = `calc(56% + ${(Math.sin(a) * ry).toFixed(0)}px)`;
      el.style.zIndex = depth > .5 ? 3 : 1;
      el.style.opacity = lerp(.55, 1, depth);
      el.innerHTML = shroomSVG({ glow: ['mint', 'violet', 'mint', 'gold'][i % 4], h: 70 * s + 10, cap: 50 * s + 8, seed: 100 + i });
      ring.appendChild(el);
    }
  }
  plantRing();

  /* =======================================================
     WALD (Canvas, einmal gezeichnet)
     ======================================================= */
  function branch(ctx, r, x, y, len, ang, w, depth) {
    if (depth <= 0 || len < 2) {
      return;
    }
    const bendA = ang + (r() - .5) * .5;
    const x2 = x + Math.cos(bendA) * len, y2 = y + Math.sin(bendA) * len;
    const mx = x + Math.cos(ang + (r() - .5) * .9) * len * .5, my = y + Math.sin(ang + (r() - .5) * .9) * len * .5;
    ctx.lineWidth = Math.max(.6, w);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
    const kids = depth > 6 ? 2 : (r() < .7 ? 2 : 3);
    for (let i = 0; i < kids; i++) {
      const spread = lerp(.25, .75, r()) * (i % 2 ? 1 : -1);
      branch(ctx, r, x2, y2, len * lerp(.66, .8, r()), bendA + spread + (r() - .5) * .3, w * .68, depth - 1);
    }
    // hängende Ranken
    if (depth < 4 && r() < .12) {
      ctx.lineWidth = .6;
      ctx.beginPath(); ctx.moveTo(x2, y2);
      ctx.quadraticCurveTo(x2 + (r() - .5) * 8, y2 + len * .7, x2 + (r() - .5) * 4, y2 + len * lerp(.8, 2.2, r()));
      ctx.stroke();
    }
  }

  function tree(ctx, r, x, baseY, height, lean = 0) {
    const trunkW = height * lerp(.035, .06, r());
    // Wurzeln
    for (let i = 0; i < 4; i++) {
      ctx.lineWidth = trunkW * .45;
      ctx.beginPath(); ctx.moveTo(x, baseY - trunkW);
      const dir = i < 2 ? -1 : 1;
      ctx.quadraticCurveTo(x + dir * trunkW * 1.2, baseY - trunkW * .2, x + dir * trunkW * lerp(1.6, 2.8, r()), baseY + 4);
      ctx.stroke();
    }
    branch(ctx, r, x, baseY + 2, height * .34, -Math.PI / 2 + lean + (r() - .5) * .25, trunkW, small ? 8 : 9);
  }

  function hills(ctx, r, W, H, base, amp, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, H);
    const p1 = r() * TAU, p2 = r() * TAU;
    for (let x = 0; x <= W; x += 8) {
      const y = base + Math.sin(x / W * 3 + p1) * amp + Math.sin(x / W * 11 + p2) * amp * .35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }

  function grass(ctx, r, W, baseY, count, color) {
    ctx.strokeStyle = color;
    for (let i = 0; i < count; i++) {
      const x = r() * W, hgt = lerp(8, 34, r() * r());
      ctx.lineWidth = lerp(.6, 1.6, r());
      ctx.beginPath(); ctx.moveTo(x, baseY + 6);
      ctx.quadraticCurveTo(x + (r() - .5) * 10, baseY - hgt * .6, x + (r() - .5) * 18, baseY - hgt);
      ctx.stroke();
    }
  }

  function fern(ctx, r, x, y, size, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    const fronds = 5;
    for (let f = 0; f < fronds; f++) {
      const ang = -Math.PI / 2 + (f - (fronds - 1) / 2) * .38 + (r() - .5) * .2;
      let px = x, py = y;
      const segs = 14, segL = size / segs;
      for (let s = 0; s < segs; s++) {
        const a = ang + s * .045 * (ang < -Math.PI / 2 ? -1 : 1);
        const nx = px + Math.cos(a) * segL, ny = py + Math.sin(a) * segL;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny); ctx.stroke();
        const leaf = size * .14 * (1 - s / segs);
        ctx.beginPath();
        ctx.moveTo(nx, ny); ctx.lineTo(nx + Math.cos(a - 1.1) * leaf, ny + Math.sin(a - 1.1) * leaf);
        ctx.moveTo(nx, ny); ctx.lineTo(nx + Math.cos(a + 1.1) * leaf, ny + Math.sin(a + 1.1) * leaf);
        ctx.stroke();
        px = nx; py = ny;
      }
    }
  }

  function mistBand(ctx, W, H, from, alpha) {
    const g = ctx.createLinearGradient(0, H * from, 0, H);
    g.addColorStop(0, 'rgba(190,232,220,0)');
    g.addColorStop(.55, `rgba(190,232,220,${alpha})`);
    g.addColorStop(1, `rgba(190,232,220,${alpha * .6})`);
    ctx.fillStyle = g; ctx.fillRect(0, H * from, W, H * (1 - from));
  }

  function drawForest(cv) {
    const kind = cv.dataset.forest;
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    const ctx = cv.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    const r = rng(kind.length * 1337 + 5);

    if (kind === 'far') {
      const layers = [
        { c: 'rgba(40,86,76,.38)', base: .78, n: small ? 6 : 12, hMin: .35, hMax: .6, mist: .07 },
        { c: 'rgba(18,48,41,.62)', base: .86, n: small ? 4 : 8, hMin: .4, hMax: .68, mist: .05 },
      ];
      layers.forEach((L) => {
        ctx.strokeStyle = L.c;
        for (let i = 0; i < L.n; i++) {
          let x = (i + r() * .8) / L.n * W;
          // Mitte freilassen, damit BELLI im Nebel sichtbar bleibt
          if (Math.abs(x - W / 2) < W * .2) x += (x < W / 2 ? -1 : 1) * W * .2;
          tree(ctx, r, x, H * L.base, H * lerp(L.hMin, L.hMax, r()));
        }
        hills(ctx, r, W, H, H * L.base, H * .02, L.c);
        mistBand(ctx, W, H, L.base - .35, L.mist);
      });
    }

    if (kind === 'near') {
      const c = '#020705';
      ctx.strokeStyle = c;
      const edge = small ? .08 : .12;
      const trees = small
        ? [[-W * .04, .62, -.5], [W * 1.04, .58, .5], [W * .1, .34, -.55], [W * .9, .3, .55]]
        : [[r() * edge * W, 1.0, -.38], [W - r() * edge * W, .95, .38], [(edge + .05) * W, .55, -.45], [W - (edge + .06) * W, .5, .45]];
      trees.forEach(([x, s, lean]) => {
        tree(ctx, r, x, H * .97, H * s, lean);
      });
      hills(ctx, r, W, H, H * .93, H * .025, c);
      for (let i = 0; i < (small ? 6 : 12); i++) fern(ctx, r, r() * W, H * .95, lerp(30, 80, r()), c);
      grass(ctx, r, W, H * .93, small ? 260 : 520, c);
    }

    if (kind === 'roots') {
      const layers = [
        { c: 'rgba(18,48,41,.6)', base: .82, n: small ? 6 : 12, hMin: .5, hMax: .9 },
        { c: '#020605', base: .97, n: small ? 4 : 8, hMin: .55, hMax: 1 },
      ];
      layers.forEach((L, li) => {
        ctx.strokeStyle = L.c;
        for (let i = 0; i < L.n; i++) tree(ctx, r, (i + r()) / L.n * W, H * L.base, H * lerp(L.hMin, L.hMax, r()));
        hills(ctx, r, W, H, H * L.base, H * .03, L.c);
        if (li === 0) mistBand(ctx, W, H, .4, .09);
      });
      for (let i = 0; i < (small ? 5 : 10); i++) fern(ctx, r, r() * W, H * .99, lerp(25, 60, r()), '#020605');
      grass(ctx, r, W, H * .97, small ? 200 : 420, '#020605');
    }
  }

  const forests = [...document.querySelectorAll('canvas[data-forest]')];
  const redrawAll = () => { forests.forEach(drawForest); plantGround(); plantRing(); };
  forests.forEach(drawForest);
  let rz;
  let lastW = innerWidth;
  addEventListener('resize', () => {
    if (Math.abs(innerWidth - lastW) < 40) return;   // mobile Adressleiste ignorieren
    lastW = innerWidth;
    clearTimeout(rz); rz = setTimeout(redrawAll, 250);
  });

  /* =======================================================
     NEBEL-TEXTUR (kachelbar, einmal erzeugt)
     ======================================================= */
  (function makeFog() {
    const w = 512, h = 220, P = 8;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const r = rng(9);
    const lat = Array.from({ length: 64 * 64 }, r);
    const val = (x, y, per) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const s = (t) => t * t * (3 - 2 * t);
      const g = (i, j) => lat[(((i % per) + per) % per) + (((j % 64) + 64) % 64) * 64];
      const a = g(xi, yi), b = g(xi + 1, yi), cc = g(xi, yi + 1), d = g(xi + 1, yi + 1);
      return lerp(lerp(a, b, s(xf)), lerp(cc, d, s(xf)), s(yf));
    };
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let n = 0, amp = .55, f = 1;
        for (let o = 0; o < 4; o++) { n += val(x / w * P * f, y / h * 3 * f, P * f) * amp; amp *= .5; f *= 2; }
        const vert = Math.sin(Math.PI * y / h);
        const a = Math.max(0, n - .35) * 2.2 * vert;
        const i = (y * w + x) * 4;
        img.data[i] = 215; img.data[i + 1] = 240; img.data[i + 2] = 232; img.data[i + 3] = Math.min(255, a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    const url = c.toDataURL();
    document.querySelectorAll('.fog').forEach((f) => { f.style.backgroundImage = `url(${url})`; });
  })();

  /* =======================================================
     HIMMEL + FEEN (Animationsschleife)
     ======================================================= */
  const sky = document.getElementById('sky');
  const fx = document.getElementById('fx');
  if (!sky || !fx) return;
  const sctx = sky.getContext('2d');
  const fctx = fx.getContext('2d');
  let W = 0, H = 0, stars = [], fairies = [], dust = [], glimmers = [];

  let moon = null;
  function makeMoon(mr) {
    const S = Math.ceil(mr * 2 * DPR) + 8, cx = S / 2, R = mr * DPR;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    const r = rng(31);
    const inDisc = (k = 1) => { const a = r() * TAU, d = Math.sqrt(r()) * R * .93 * k; return [cx + Math.cos(a) * d, cx + Math.sin(a) * d]; };
    g.save(); g.beginPath(); g.arc(cx, cx, R, 0, TAU); g.clip();
    let gr = g.createRadialGradient(cx - R * .3, cx - R * .25, R * .1, cx, cx, R);
    gr.addColorStop(0, '#f6f3e8'); gr.addColorStop(.65, '#dedbcf'); gr.addColorStop(1, '#a8a79f');
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    // Meere: weiche graue Flecken
    for (let i = 0; i < 8; i++) {
      const [x, y] = inDisc(.7), rad = R * lerp(.16, .36, r());
      const m = g.createRadialGradient(x, y, 0, x, y, rad);
      m.addColorStop(0, 'rgba(92,98,108,.40)'); m.addColorStop(1, 'rgba(92,98,108,0)');
      g.fillStyle = m; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
    }
    // Krater
    for (let i = 0; i < 75; i++) {
      const [x, y] = inDisc(), rad = R * lerp(.012, .075, Math.pow(r(), 1.8));
      g.fillStyle = 'rgba(78,80,88,.30)'; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.34)'; g.lineWidth = Math.max(.5, rad * .22);
      g.beginPath(); g.arc(x + rad * .08, y + rad * .08, rad, Math.PI * .75, Math.PI * 1.75); g.stroke();
    }
    // punktierte Textur
    for (let i = 0; i < 380; i++) {
      const [x, y] = inDisc(), dk = r() < .6;
      g.fillStyle = dk ? `rgba(70,74,82,${lerp(.1, .3, r())})` : `rgba(255,255,255,${lerp(.1, .3, r())})`;
      g.beginPath(); g.arc(x, y, Math.max(.35, R * lerp(.004, .016, r())), 0, TAU); g.fill();
    }
    // Randabdunklung
    const ld = g.createRadialGradient(cx, cx, R * .62, cx, cx, R);
    ld.addColorStop(0, 'rgba(40,46,58,0)'); ld.addColorStop(1, 'rgba(40,46,58,.38)');
    g.fillStyle = ld; g.fillRect(0, 0, S, S);
    g.restore();
    // Phase: Schatten weich ausschneiden (transparent statt schwarz)
    g.globalCompositeOperation = 'destination-out';
    const sx = cx + R * .66, sy = cx - R * .12, sr = R * 1.06;
    const sh = g.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sh.addColorStop(0, 'rgba(0,0,0,1)'); sh.addColorStop(.82, 'rgba(0,0,0,1)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = 'source-over';
    // aschgraues Erdlicht auf der Schattenseite
    const out = document.createElement('canvas'); out.width = out.height = S;
    const o = out.getContext('2d');
    const eg = o.createRadialGradient(cx - R * .2, cx, R * .2, cx, cx, R);
    eg.addColorStop(0, 'rgba(120,140,175,.10)'); eg.addColorStop(1, 'rgba(120,140,175,.05)');
    o.fillStyle = eg; o.beginPath(); o.arc(cx, cx, R, 0, TAU); o.fill();
    o.strokeStyle = 'rgba(170,190,225,.12)'; o.lineWidth = 1; o.beginPath(); o.arc(cx, cx, R - .5, 0, TAU); o.stroke();
    o.drawImage(c, 0, 0);
    return out;
  }

  function sizeCanvases() {
    W = innerWidth; H = innerHeight;
    [sky, fx].forEach((c) => { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); });
    sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const mr = Math.max(20, Math.min(W, H) * .052);
    const mimg = makeMoon(mr);
    moon = { img: mimg, size: mimg.width / DPR, r: mr, x: W * (small ? .8 : .84), y: H * (small ? .17 : .17) };
    const r = rng(2024);
    const count = Math.min(small ? 180 : 420, Math.round(W * H / 3800));
    stars = Array.from({ length: count }, () => {
      const y = Math.pow(r(), 1.6) * H;              // oben dichter
      return { x: r() * W, y, s: r() < .05 ? lerp(1.4, 2.2, r()) : lerp(.3, 1.1, r()), p: r() * TAU, v: lerp(.4, 2.2, r()), tint: r() };
    });
    glimmers = Array.from({ length: small ? 14 : 30 }, () => ({
      x: r() * W, y: lerp(.45, 1, r()) * H, p: r() * TAU, v: lerp(.2, .6, r()), c: r() < .7 ? PALETTE.mint.rgb : PALETTE.gold.rgb,
    }));
  }
  sizeCanvases();
  addEventListener('resize', () => { if (Math.abs(innerHeight - H) > 120 || innerWidth !== W) sizeCanvases(); });

  const fr = rng(77);
  // Glühwürmchen: warmes Gelbgrün, Mint, Gold, ein Hauch Violett
  const flyColors = [[236, 255, 150], [141, 255, 224], [255, 226, 140], [200, 255, 170], [201, 178, 255], [236, 255, 150], [141, 255, 224], [255, 226, 140], [200, 255, 170]];
  fairies = flyColors.slice(0, small ? 5 : 9).map((rgb, i) => ({
    rgb, a1: lerp(.04, .1, fr()), a2: lerp(.06, .14, fr()), b1: lerp(.07, .15, fr()), b2: lerp(.2, .4, fr()),
    p1: fr() * TAU, p2: fr() * TAU, p3: fr() * TAU, blink: lerp(.5, 1.1, fr()), bp: fr() * TAU,
    size: lerp(.7, 1.15, fr()), flap: lerp(36, 52, fr()), x: 0, y: 0, i,
  }));

  let shooting = null, nextShoot = 3 + Math.random() * 6;

  function drawSky(t) {
    const g = sctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#010309'); g.addColorStop(.55, '#031010'); g.addColorStop(1, '#06150f');
    sctx.fillStyle = g; sctx.fillRect(0, 0, W, H);

    // Polarlicht-artiger Schimmer
    const ax = W * (.3 + .1 * Math.sin(t * .05)), ay = H * .25;
    let rg = sctx.createRadialGradient(ax, ay, 0, ax, ay, W * .55);
    rg.addColorStop(0, 'rgba(60,170,140,.10)'); rg.addColorStop(1, 'rgba(60,170,140,0)');
    sctx.fillStyle = rg; sctx.fillRect(0, 0, W, H);
    const bx = W * (.75 + .08 * Math.cos(t * .04)), by = H * .4;
    rg = sctx.createRadialGradient(bx, by, 0, bx, by, W * .45);
    rg.addColorStop(0, 'rgba(130,100,210,.08)'); rg.addColorStop(1, 'rgba(130,100,210,0)');
    sctx.fillStyle = rg; sctx.fillRect(0, 0, W, H);

    // Sterne
    for (const s of stars) {
      const tw = reduce ? .8 : .55 + .45 * Math.sin(t * s.v + s.p);
      const col = s.tint < .15 ? `rgba(255,236,190,${tw})` : s.tint < .3 ? `rgba(190,255,235,${tw})` : `rgba(235,245,255,${tw})`;
      sctx.fillStyle = col;
      if (s.s > 1.3) {
        sctx.globalAlpha = tw;
        sctx.strokeStyle = col; sctx.lineWidth = .6;
        const l = s.s * 3.2 * tw;
        sctx.beginPath(); sctx.moveTo(s.x - l, s.y); sctx.lineTo(s.x + l, s.y); sctx.moveTo(s.x, s.y - l); sctx.lineTo(s.x, s.y + l); sctx.stroke();
        sctx.globalAlpha = 1;
      }
      sctx.beginPath(); sctx.arc(s.x, s.y, s.s, 0, TAU); sctx.fill();
    }

    // Mond (nach den Sternen, ohne schwarze Scheibe)
    if (moon) {
      const glow = sctx.createRadialGradient(moon.x, moon.y, moon.r * .8, moon.x, moon.y, moon.r * 6.5);
      glow.addColorStop(0, 'rgba(225,238,255,.17)'); glow.addColorStop(.4, 'rgba(190,215,245,.06)'); glow.addColorStop(1, 'rgba(190,215,245,0)');
      sctx.fillStyle = glow; sctx.beginPath(); sctx.arc(moon.x, moon.y, moon.r * 6.5, 0, TAU); sctx.fill();
      sctx.drawImage(moon.img, moon.x - moon.size / 2, moon.y - moon.size / 2, moon.size, moon.size);
    }

    // Sternschnuppe
    if (!reduce) {
      if (!shooting && t > nextShoot) {
        shooting = { x: Math.random() * W * .7, y: Math.random() * H * .3, vx: 9 + Math.random() * 5, vy: 3 + Math.random() * 2, life: 1 };
        nextShoot = t + 6 + Math.random() * 10;
      }
      if (shooting) {
        const s = shooting;
        const lg = sctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
        lg.addColorStop(0, `rgba(255,255,255,${s.life})`); lg.addColorStop(1, 'rgba(255,255,255,0)');
        sctx.strokeStyle = lg; sctx.lineWidth = 1.4;
        sctx.beginPath(); sctx.moveTo(s.x, s.y); sctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12); sctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= .018;
        if (s.life <= 0) shooting = null;
      }
    }
  }

  /* --- Feenstaub --- */
  function spawn(x, y, rgb, n = 1, burst = 0) {
    for (let i = 0; i < n; i++) {
      if (dust.length > 700) dust.shift();
      const a = Math.random() * TAU, sp = burst ? Math.random() * burst : Math.random() * .4;
      dust.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (burst ? .5 : 0),
        life: 1, decay: lerp(.006, .016, Math.random()), s: lerp(.5, 2, Math.random()),
        star: Math.random() < .18, rgb: rgb || PALETTE.gold.rgb, p: Math.random() * TAU,
      });
    }
  }

  function drawFairy(f, t) {
    const x = W * (.5 + .46 * Math.sin(t * f.a1 + f.p1) * Math.cos(t * f.a2 * .7 + f.p2)) + Math.sin(t * 2.3 + f.i) * 5;
    const y = H * (.46 + .36 * Math.sin(t * f.b1 + f.p3)) + Math.sin(t * f.b2 * 5 + f.i) * 9;
    f.x = x; f.y = y;
    const [r, g, b] = f.rgb;
    const s = f.size;
    // sanftes Aufleuchten wie bei Glühwürmchen
    const pulse = Math.pow(Math.max(0, Math.sin(t * f.blink + f.bp)), 2);
    const a = reduce ? .8 : .22 + .78 * pulse;

    const halo = fctx.createRadialGradient(x, y, 0, x, y, 20 * s);
    halo.addColorStop(0, `rgba(${r},${g},${b},${.6 * a})`);
    halo.addColorStop(.35, `rgba(${r},${g},${b},${.16 * a})`);
    halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
    fctx.fillStyle = halo; fctx.beginPath(); fctx.arc(x, y, 20 * s, 0, TAU); fctx.fill();

    // winzige Flügel – nur zwei schnelle Striche
    const w = reduce ? .6 : .3 + .7 * Math.abs(Math.sin(t * f.flap + f.i));
    fctx.strokeStyle = `rgba(255,255,255,${.28 * (.4 + a)})`;
    fctx.lineWidth = .8;
    fctx.lineCap = 'round';
    fctx.beginPath();
    fctx.moveTo(x, y); fctx.lineTo(x - 4.5 * s, y - 3.5 * s * w);
    fctx.moveTo(x, y); fctx.lineTo(x + 4.5 * s, y - 3.5 * s * w);
    fctx.stroke();

    fctx.fillStyle = `rgba(255,255,235,${.5 + .5 * a})`;
    fctx.beginPath(); fctx.arc(x, y, 1.4 * s, 0, TAU); fctx.fill();

    if (!reduce && pulse > .3 && Math.random() < .25) spawn(x, y, f.rgb, 1);
  }

  function drawDust() {
    for (let i = dust.length - 1; i >= 0; i--) {
      const d = dust[i];
      d.x += d.vx; d.y += d.vy; d.vy += .012; d.vx *= .985; d.vy *= .985;
      d.life -= d.decay;
      if (d.life <= 0) { dust.splice(i, 1); continue; }
      const [r, g, b] = d.rgb;
      const a = d.life * (.6 + .4 * Math.sin(d.p += .25));
      fctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      if (d.star) {
        fctx.strokeStyle = `rgba(255,255,255,${a})`; fctx.lineWidth = .6;
        const l = d.s * 2.6;
        fctx.beginPath(); fctx.moveTo(d.x - l, d.y); fctx.lineTo(d.x + l, d.y); fctx.moveTo(d.x, d.y - l); fctx.lineTo(d.x, d.y + l); fctx.stroke();
      }
      fctx.beginPath(); fctx.arc(d.x, d.y, d.s, 0, TAU); fctx.fill();
    }
  }

  function drawGlimmers(t) {
    for (const g of glimmers) {
      g.x += Math.sin(t * g.v + g.p) * .3; g.y += Math.cos(t * g.v * 1.3 + g.p) * .2;
      const a = Math.max(0, Math.sin(t * g.v * 2 + g.p)) * .7;
      const [r, gg, b] = g.c;
      const rad = fctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, 7);
      rad.addColorStop(0, `rgba(${r},${gg},${b},${a})`); rad.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      fctx.fillStyle = rad; fctx.beginPath(); fctx.arc(g.x, g.y, 7, 0, TAU); fctx.fill();
    }
  }

  // Maus / Finger hinterlässt Feenstaub
  let lastSpawn = 0;
  addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (reduce || now - lastSpawn < 16) return;
    lastSpawn = now;
    spawn(e.clientX, e.clientY, [PALETTE.gold.rgb, PALETTE.mint.rgb, PALETTE.violet.rgb][Math.floor(Math.random() * 3)], 2);
  }, { passive: true });
  addEventListener('pointerdown', (e) => { if (!reduce) spawn(e.clientX, e.clientY, PALETTE.gold.rgb, 34, 3.2); }, { passive: true });
  window.fairyBurst = (x, y) => spawn(x, y, PALETTE.mint.rgb, 60, 4);

  /* --- Parallaxe --- */
  const far = document.querySelector('.forest--far');
  const near = document.querySelector('.forest--near');
  const vision = document.querySelector('.vision');
  function parallax() {
    const y = scrollY;
    if (y > H * 1.2) return;
    if (far) far.style.transform = `translateY(${y * .18}px)`;
    if (vision) vision.style.transform = `translateY(${y * .35}px)`;
  }
  addEventListener('scroll', parallax, { passive: true });

  /* --- Schleife --- */
  const t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / 1000;
    drawSky(t);
    fctx.clearRect(0, 0, W, H);
    fctx.globalCompositeOperation = 'lighter';
    drawGlimmers(t);
    fairies.forEach((f) => drawFairy(f, t + 20));
    drawDust();
    fctx.globalCompositeOperation = 'source-over';
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
