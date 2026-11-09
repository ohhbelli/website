(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Kopf: Unterschrift erscheint, sobald man den Wald verlässt */
  const top = $('#top');
  const links = $$('.nav a');
  const onScroll = () => {
    if (top && !top.classList.contains('top--solid')) top.classList.toggle('is-deep', scrollY > innerHeight * .6);
    if (scrollY < innerHeight * .5) links.forEach((a) => a.classList.remove('is-here'));
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a) => { const t = $(a.getAttribute('href')); if (t) io.observe(t); });

  /* Aus dem Nebel auftauchen */
  const rev = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); rev.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.emerge').forEach((el, i) => {
    if (el.closest('.meadow')) el.style.transitionDelay = (i % 6) * 120 + 'ms';
    rev.observe(el);
  });

  /* Portale → Video in einer Lichtung (YouTube erst nach Klick) */
  let lastFocus;
  function openVideo(id, title) {
    lastFocus = document.activeElement;
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', title);
    box.innerHTML = `<button class="lightbox__close" type="button">schließen ✕</button>
      <div class="lightbox__frame"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1"
        title="${title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
    document.body.appendChild(box);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => box.classList.add('is-open'));
    const close = () => {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => box.remove(), 500);
      removeEventListener('keydown', esc);
      if (lastFocus) lastFocus.focus();
    };
    const esc = (e) => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', esc);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    $('.lightbox__close', box).addEventListener('click', close);
    $('.lightbox__close', box).focus();
  }
  $$('.portal__door').forEach((b) => b.addEventListener('click', (e) => {
    const r = b.getBoundingClientRect();
    if (window.fairyBurst) window.fairyBurst(r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => openVideo(b.dataset.yt, b.getAttribute('aria-label').replace(' abspielen', '')), 250);
  }));

  /* Feenkreis → Bandsintown erst nach Klick */
  const summon = $('#summon');
  if (summon) summon.addEventListener('click', () => {
    const r = summon.getBoundingClientRect();
    if (window.fairyBurst) window.fairyBurst(r.left + r.width / 2, r.top + r.height / 2);
    const box = $('#live-widget');
    const a = document.createElement('a');
    a.className = 'bit-widget-initializer';
    const opts = {
      'artist-name': 'id_15575670', 'language': 'de', 'font': 'Cormorant Garamond',
      'background-color': 'rgba(0,0,0,0)', 'text-color': '#e3f1ec', 'separator-color': 'rgba(141,255,224,0.2)',
      'auto-style': 'false', 'display-limit': 'all', 'display-lineup': 'false', 'display-start-time': 'false',
      'date-format': 'D. MMM YYYY', 'date-orientation': 'horizontal', 'date-border-color': 'rgba(141,255,224,0.4)',
      'date-border-radius': '0px', 'event-ticket-text': 'TICKETS', 'event-ticket-cta-bg-color': 'rgba(0,0,0,0)',
      'event-ticket-cta-text-color': '#8dffe0', 'event-ticket-cta-border-color': '#8dffe0', 'event-ticket-cta-border-width': '1px',
      'event-ticket-cta-border-radius': '0px', 'event-rsvp-position': 'hidden', 'follow-section-position': 'hidden',
      'play-my-city-position': 'bottom', 'play-my-city-header-text': 'Keine Show in deiner Nähe?',
      'play-my-city-cta-text': 'SHOW ANFRAGEN', 'play-my-city-cta-bg-color': 'rgba(0,0,0,0)', 'play-my-city-cta-text-color': '#8dffe0',
      'play-my-city-cta-border-color': '#8dffe0', 'play-my-city-cta-border-width': '1px', 'play-my-city-cta-border-radius': '0px',
      'layout-breakpoint': '700', 'app-id': '891f8f3855f2e384a898d81dc5630ce6', 'bit-logo-position': 'hidden',
    };
    Object.entries(opts).forEach(([k, v]) => a.setAttribute('data-' + k, v));
    box.innerHTML = '';
    box.appendChild(a);
    const s = document.createElement('script');
    s.src = 'https://widgetv3.bandsintown.com/main.min.js';
    s.charset = 'utf-8';
    document.body.appendChild(s);
    box.hidden = false;
    $('#ring-center').innerHTML = '<p>Die Feen bringen die Termine …</p>';
    setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'center' }), 900);
  });

  /* Botschaft: Adresse vor Bots verstecken */
  const letter = $('#letter');
  if (letter) {
    const addr = `${letter.dataset.u}@${letter.dataset.d}`;
    letter.href = 'mailto:' + addr;
    letter.textContent = addr;
    const toast = $('#toast');
    $('#copy').addEventListener('click', async (e) => {
      if (window.fairyBurst) window.fairyBurst(e.clientX, e.clientY);
      try { await navigator.clipboard.writeText(addr); toast.textContent = '✧ eingefangen ✧'; }
      catch { toast.textContent = addr; }
      toast.classList.add('is-on');
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove('is-on'), 2400);
    });
  }

  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
