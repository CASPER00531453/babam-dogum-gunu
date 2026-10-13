(() => {
  'use strict';

  const BIRTH = new Date(1978, 9, 13, 0, 0, 0); // 13 Ekim 1978
  const DAY = 86400000;
  const YEAR = 365.2425 * DAY;
  const $ = (s, r = document) => r.querySelector(s);
  const fmt = new Intl.NumberFormat('tr-TR');
  const fmt1 = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

  function ageYears(now = new Date()) {
    let a = now.getFullYear() - BIRTH.getFullYear();
    if (now.getMonth() < BIRTH.getMonth() || (now.getMonth() === BIRTH.getMonth() && now.getDate() < BIRTH.getDate())) a--;
    return a;
  }
  const isBirthday = (d = new Date()) => d.getMonth() === BIRTH.getMonth() && d.getDate() === BIRTH.getDate();

  /* ================= Konfeti ================= */
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  let parts = [];
  let raf = null;
  const COLORS = ['#d61317', '#ffffff', '#ffcc4d', '#a50e12', '#ff6b6e'];
  function resize() { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; }
  addEventListener('resize', resize); resize();

  function confetti(n = 160, x = innerWidth / 2, y = innerHeight / 2, spread = 1) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = (4 + Math.random() * 10) * spread;
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: 4 + Math.random() * 6,
        c: COLORS[(Math.random() * COLORS.length) | 0], rot: Math.random() * 6, vr: (Math.random() - .5) * .4,
        life: 140 + Math.random() * 80, shape: Math.random() < .3 ? 'heart' : Math.random() < .5 ? 'circle' : 'rect',
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function rain(n = 120) {
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .6, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3,
        r: 4 + Math.random() * 5, c: COLORS[(Math.random() * COLORS.length) | 0], rot: Math.random() * 6, vr: (Math.random() - .5) * .3,
        life: 400, shape: Math.random() < .25 ? 'heart' : 'rect',
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function heart(r) {
    ctx.beginPath();
    ctx.moveTo(0, r * .3);
    ctx.bezierCurveTo(-r, -r * .4, -r * .5, -r * 1.1, 0, -r * .45);
    ctx.bezierCurveTo(r * .5, -r * 1.1, r, -r * .4, 0, r * .3);
    ctx.fill();
  }
  function tick() {
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 40);
    for (const p of parts) {
      p.vy += .18; p.vx *= .99; p.vy *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillStyle = p.c;
      if (p.c === '#ffffff') { ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 2; }
      if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, 7); ctx.fill(); }
      else if (p.shape === 'heart') heart(p.r * 1.2);
      else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      ctx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tick) : null;
    if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
  }

  /* ================= Balonlar ================= */
  const balloonBox = $('.balloons');
  function balloon() {
    if (document.hidden) return;
    const b = document.createElement('div');
    b.className = 'balloon' + (Math.random() < .35 ? ' white' : '');
    b.style.left = Math.random() * 95 + 'vw';
    b.style.setProperty('--d', 12 + Math.random() * 10 + 's');
    const s = .6 + Math.random() * .7;
    b.style.scale = s;
    balloonBox.appendChild(b);
    b.addEventListener('animationend', () => b.remove());
  }

  /* ================= Müzik (Web Audio ile "İyi ki doğdun") ================= */
  const NOTES = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
  const SONG = [
    ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
    ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
    ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
    ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
  ];
  let audio = null, playing = false, loopTimer = null;
  const musicBtn = $('#musicBtn');
  function playSong() {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const beat = .42;
    let t = audio.currentTime + .1;
    const master = audio.createGain();
    master.gain.value = .18;
    master.connect(audio.destination);
    for (const [n, d] of SONG) {
      const f = NOTES[n];
      for (const [type, mult, vol] of [['triangle', 1, 1], ['sine', 2, .25]]) {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = type; o.frequency.value = f * mult;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + .03);
        g.gain.exponentialRampToValueAtTime(.001, t + d * beat * .98);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + d * beat);
      }
      t += d * beat;
    }
    const total = SONG.reduce((s, [, d]) => s + d, 0) * beat;
    loopTimer = setTimeout(() => playing && playSong(), (total + 1.2) * 1000);
    playSong.master = master;
  }
  function setMusic(on) {
    playing = on;
    musicBtn.classList.toggle('on', on);
    clearTimeout(loopTimer);
    if (on) playSong();
    else if (playSong.master) { playSong.master.gain.setTargetAtTime(0, audio.currentTime, .05); }
  }
  musicBtn.addEventListener('click', () => setMusic(!playing));

  /* ================= Intro ================= */
  const intro = $('#intro');
  document.body.classList.add('locked');
  $('#giftBtn').addEventListener('click', (e) => {
    e.currentTarget.classList.add('open');
    confetti(220, innerWidth / 2, innerHeight / 2, 1.2);
    try { setMusic(true); } catch (_) { /* ses desteklenmiyorsa sessiz devam */ }
    setTimeout(() => {
      intro.classList.add('gone');
      document.body.classList.remove('locked');
      startHero();
    }, 900);
  });

  /* ================= Hero ================= */
  function splitTitle(el) {
    const text = el.textContent;
    el.textContent = '';
    let i = 0;
    for (const word of text.split(' ')) {
      const w = document.createElement('span');
      w.style.whiteSpace = 'nowrap';
      w.style.display = 'inline-block';
      for (const ch of word) {
        const s = document.createElement('span');
        s.className = 'ch'; s.textContent = ch; s.style.setProperty('--i', i++);
        w.appendChild(s);
      }
      el.appendChild(w);
      el.appendChild(document.createTextNode(' '));
    }
  }
  splitTitle($('#heroTitle'));
  $('#thisYear').textContent = new Date().getFullYear();

  function countUp(el, to, dur = 2000) {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const PHRASES = [
    'Dünyanın en iyi babası 🏆',
    'Kahramanım, rehberim, en yakın dostum 💪',
    'Çay demlemenin ustası ☕',
    'Her yaşta daha da yakışıklı 😎',
    'İyi ki varsın, iyi ki babamsın ❤️',
  ];
  function typeLoop(el) {
    let pi = 0, ci = 0, del = false;
    const go = () => {
      const chars = [...PHRASES[pi]];
      ci += del ? -1 : 1;
      el.textContent = chars.slice(0, ci).join('');
      let wait = del ? 35 : 70;
      if (!del && ci >= chars.length) { del = true; wait = 1800; }
      if (del && ci <= 0) { del = false; pi = (pi + 1) % PHRASES.length; wait = 400; }
      setTimeout(go, wait);
    };
    go();
  }

  let heroStarted = false;
  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    $('#heroTitle').classList.add('go');
    countUp($('#ageNumber'), ageYears(), 2200);
    typeLoop($('#typed'));
    for (let i = 0; i < 8; i++) setTimeout(balloon, i * 350);
    setInterval(balloon, 2200);
    if (isBirthday()) setTimeout(() => rain(150), 1200);
  }

  // Canlı yaş sayacı
  const ticker = $('#ticker');
  function updateTicker() {
    const now = new Date();
    const y = ageYears(now);
    const anchor = new Date(BIRTH); anchor.setFullYear(BIRTH.getFullYear() + y);
    let months = 0;
    while (true) {
      const n = new Date(anchor); n.setMonth(anchor.getMonth() + months + 1);
      if (n > now) break;
      months++;
    }
    const m = new Date(anchor); m.setMonth(anchor.getMonth() + months);
    let rest = now - m;
    const d = Math.floor(rest / DAY); rest -= d * DAY;
    const h = Math.floor(rest / 3600000); rest -= h * 3600000;
    const mi = Math.floor(rest / 60000); rest -= mi * 60000;
    const s = Math.floor(rest / 1000);
    ticker.innerHTML = [[y, 'yıl'], [months, 'ay'], [d, 'gün'], [h, 'saat'], [mi, 'dakika'], [s, 'saniye']]
      .map(([v, l]) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  }
  updateTicker();
  setInterval(updateTicker, 1000);

  /* ================= Hayat istatistikleri ================= */
  // Her kart: değer = f(ms) — doğumdan bu yana geçen milisaniye
  const yearsSince = (ms, fromAge = 0) => Math.max(0, ms / YEAR - fromAge);
  const daysSince = (ms, fromAge = 0) => Math.max(0, ms / DAY - fromAge * 365.2425);
  const STATS = [
    { icon: '📆', label: 'gün yaşadın', f: (ms) => Math.floor(ms / DAY), note: 'Her biri ayrı bir hikâye' },
    { icon: '⏰', label: 'saattir hayattasın', f: (ms) => Math.floor(ms / 3600000), live: true },
    { icon: '⏱️', label: 'saniye geçti', f: (ms) => Math.floor(ms / 1000), live: true, note: 'Sayfayı açık tut, izle!' },
    { icon: '❤️', label: 'kez kalbin attı', f: (ms) => Math.floor(ms / 60000 * 75), live: true, heart: true, note: 'Dakikada ortalama 75 atış' },
    { icon: '🌬️', label: 'nefes aldın', f: (ms) => Math.floor(ms / 60000 * 16), live: true, note: 'Dakikada ~16 nefes' },
    { icon: '🍵', label: 'bardak çay içtin', f: (ms) => Math.floor(daysSince(ms, 7) * 5), note: '7 yaşından beri günde ~5 ince belli' },
    { icon: '🫖', label: 'litre çay eder', f: (ms) => Math.floor(daysSince(ms, 7) * 5 * .1), note: 'Bir ince belli ≈ 100 ml' },
    { icon: '😴', label: 'yıl uyudun', f: (ms) => fmt1.format(yearsSince(ms) / 3), raw: true, note: 'Günde 8 saat — hak ettin!' },
    { icon: '👣', label: 'adım attın', f: (ms) => Math.floor(daysSince(ms, 1) * 7000), note: '1 yaşından beri günde ~7.000 adım' },
    { icon: '🌍', label: 'km yürüdün', f: (ms) => Math.floor(daysSince(ms, 1) * 7000 * .00075), note: 'Dünyanın çevresini dolaşacak kadar!' },
    { icon: '🍽️', label: 'öğün yemek yedin', f: (ms) => Math.floor(daysSince(ms) * 3) },
    { icon: '👁️', label: 'kez göz kırptın', f: (ms) => Math.floor(daysSince(ms) * 16 * 60 * 15), note: 'Uyanıkken dakikada ~15' },
    { icon: '😂', label: 'kez kahkaha attın', f: (ms) => Math.floor(daysSince(ms, 1) * 15), note: 'Günde en az 15 — azı değil!' },
    { icon: '🗣️', label: 'kelime konuştun', f: (ms) => Math.floor(daysSince(ms, 2) * 16000), note: 'Nasihatler dahil 😄' },
    { icon: '☀️', label: 'km Güneş etrafında yol aldın', f: (ms) => Math.floor(ms / 1000 * 29.78), live: true, note: 'Saniyede 29,78 km hızla' },
    { icon: '🌕', label: 'dolunay gördün', f: (ms) => Math.floor(ms / DAY / 29.53) },
    { icon: '🎉', label: 'hafta sonu yaşadın', f: (ms) => Math.floor(ms / DAY / 7) },
    { icon: '🕌', label: 'bayram kutladın', f: (ms) => Math.floor(yearsSince(ms)) * 2, note: 'Ramazan + Kurban Bayramları' },
    { icon: '💇', label: 'metre saç uzattın', f: (ms) => fmt1.format(yearsSince(ms) * .15), raw: true, note: 'Yılda ~15 cm (berberler sağ olsun)' },
    { icon: '🎂', label: 'doğum günü pastası', f: (ms) => Math.floor(yearsSince(ms)) + 1, note: 'Bugünkü dahil!' },
  ];

  const statsEl = $('#stats');
  statsEl.innerHTML = STATS.map((s, i) => `
    <div class="stat reveal${s.live ? ' live' : ''}${s.heart ? ' heart' : ''}" style="transition-delay:${(i % 4) * 80}ms">
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-value" data-i="${i}">0</div>
      <div class="stat-label">${s.label}</div>
      ${s.note ? `<div class="stat-note">${s.note}</div>` : ''}
    </div>`).join('');

  const statVals = [...statsEl.querySelectorAll('.stat-value')];
  const animatedOnce = new Set();
  function statValue(i) { return STATS[i].f(Date.now() - BIRTH); }
  function animateStat(el) {
    const i = +el.dataset.i;
    if (animatedOnce.has(i)) return;
    animatedOnce.add(i);
    const s = STATS[i];
    if (s.raw) { el.textContent = s.f(Date.now() - BIRTH); return; }
    const start = performance.now(), dur = 2200;
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.floor(statValue(i) * e));
      if (p < 1) requestAnimationFrame(step);
      else el.dataset.done = '1';
    };
    requestAnimationFrame(step);
  }
  setInterval(() => {
    for (const el of statVals) {
      const s = STATS[+el.dataset.i];
      if (el.dataset.done && s.live) el.textContent = fmt.format(statValue(+el.dataset.i));
    }
  }, 250);

  /* ================= Doğduğu gün & zaman çizelgesi ================= */
  $('#weekday').textContent = BIRTH.toLocaleDateString('tr-TR', { weekday: 'long' });

  const MILESTONES = [
    [1978, 'Dünyaya merhaba! 13 Ekim, bir Terazi doğdu. 👶'],
    [1984, '6 yaşında — ilk okul heyecanı, ilk önlük, ilk karne. 🎒'],
    [1990, '12 yaşında — sokak maçları, bisiklet ve bitmeyen oyunlar. ⚽'],
    [1996, '18 yaşında — artık koca adam! 🎓'],
    [2000, 'Yeni bir yüzyıl, yeni hayaller. 🌟'],
    [2008, '30 yaşında — sorumluluklar büyüdükçe kalbi de büyüyen adam. 💼'],
    [2018, '40 yaşında — "hayat 40\'ında başlar" dedik, doğruymuş! 🎉'],
    [new Date().getFullYear(), `${ageYears()} yaşında — ve hâlâ ailesinin süper kahramanı! 🦸‍♂️`],
  ];
  $('#timeline').innerHTML = MILESTONES.map(([y, t]) => `
    <div class="tl-item reveal"><div class="tl-year">${y}</div><div class="tl-text">${t}</div></div>`).join('');

  /* ================= Galeri ================= */
  const gallery = $('#gallery');
  let photos = [];
  async function loadPhotos() {
    try {
      const r = await fetch('/api/photos', { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      photos = data.photos || [];
    } catch (_) {
      photos = [];
    }
    if (!photos.length) {
      gallery.innerHTML = '<div class="gallery-empty">📸 Henüz fotoğraf eklenmedi.<br>Yakında burada en güzel anılarımız olacak!</div>';
      return;
    }
    gallery.innerHTML = photos.map((p, i) => `
      <div class="gallery-item reveal" style="--r:${(Math.random() * 4 - 2).toFixed(1)}deg" data-i="${i}" tabindex="0" role="button" aria-label="Fotoğraf ${i + 1}">
        <img src="${p.url}" alt="Anı ${i + 1}" loading="lazy">
      </div>`).join('');
    gallery.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  }
  gallery.addEventListener('click', (e) => {
    const it = e.target.closest('.gallery-item');
    if (it) openLb(+it.dataset.i);
  });
  gallery.addEventListener('keydown', (e) => {
    const it = e.target.closest('.gallery-item');
    if (it && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLb(+it.dataset.i); }
  });

  // Lightbox
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount'), lbPlay = $('#lbPlay');
  let cur = 0, slideTimer = null;
  function show(i) {
    cur = (i + photos.length) % photos.length;
    lbImg.classList.remove('anim'); void lbImg.offsetWidth; lbImg.classList.add('anim');
    lbImg.src = photos[cur].url;
    lbCount.textContent = `${cur + 1} / ${photos.length}`;
    const next = new Image(); next.src = photos[(cur + 1) % photos.length].url;
  }
  function openLb(i) { lb.hidden = false; document.body.classList.add('locked'); show(i); }
  function closeLb() { lb.hidden = true; document.body.classList.remove('locked'); stopSlide(); }
  function stopSlide() { clearInterval(slideTimer); slideTimer = null; lbPlay.textContent = '▶ Slayt gösterisi'; }
  $('#lbPrev').addEventListener('click', () => show(cur - 1));
  $('#lbNext').addEventListener('click', () => show(cur + 1));
  $('#lbClose').addEventListener('click', closeLb);
  lbImg.addEventListener('click', () => show(cur + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  lbPlay.addEventListener('click', () => {
    if (slideTimer) return stopSlide();
    lbPlay.textContent = '⏸ Durdur';
    slideTimer = setInterval(() => show(cur + 1), 3000);
  });
  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'Escape') closeLb();
  });
  let tx = null;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
    tx = null;
  });

  /* ================= Pasta ================= */
  const candlesEl = $('#candles'), wish = $('#wish'), relight = $('#relight');
  const CANDLES = 5;
  function lightCandles() {
    candlesEl.innerHTML = Array.from({ length: CANDLES }, () => '<button class="candle" aria-label="Mumu söndür"><span class="flame"></span></button>').join('');
    wish.innerHTML = '&nbsp;';
    relight.hidden = true;
  }
  candlesEl.addEventListener('click', (e) => {
    const c = e.target.closest('.candle');
    if (!c || c.classList.contains('out')) return;
    c.classList.add('out');
    const r = c.getBoundingClientRect();
    confetti(18, r.left + r.width / 2, r.top, .5);
    const left = candlesEl.querySelectorAll('.candle:not(.out)').length;
    wish.textContent = left ? `${left} mum kaldı... 🌬️` : '';
    if (!left) {
      setTimeout(() => {
        wish.textContent = 'Dileğin kabul olsun babacığım! 🎉';
        rain(200);
        confetti(200, innerWidth / 2, innerHeight / 2, 1.3);
        relight.hidden = false;
      }, 500);
    }
  });
  relight.addEventListener('click', lightCandles);
  lightCandles();

  /* ================= Sonraki doğum günü ================= */
  const cd = $('#countdown');
  function updateCountdown() {
    const now = new Date();
    if (isBirthday(now)) {
      $('#countdownTitle').textContent = 'Geri Sayım Bitti!';
      cd.innerHTML = '<div class="today">🎂 BUGÜN SENİN GÜNÜN! 🎂</div>';
      return;
    }
    $('#countdownTitle').textContent = `${ageYears(now) + 1}. Yaş Gününe Kalan`;
    let next = new Date(now.getFullYear(), BIRTH.getMonth(), BIRTH.getDate());
    if (next <= now) next = new Date(now.getFullYear() + 1, BIRTH.getMonth(), BIRTH.getDate());
    let rest = next - now;
    const d = Math.floor(rest / DAY); rest -= d * DAY;
    const h = Math.floor(rest / 3600000); rest -= h * 3600000;
    const m = Math.floor(rest / 60000); rest -= m * 60000;
    const s = Math.floor(rest / 1000);
    cd.innerHTML = [[d, 'gün'], [h, 'saat'], [m, 'dakika'], [s, 'saniye']]
      .map(([v, l]) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ================= Scroll animasyonları ================= */
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      en.target.classList.add('in');
      const v = en.target.querySelector('.stat-value');
      if (v) animateStat(v);
      io.unobserve(en.target);
    }
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  loadPhotos();
})();
