/* FORM — interactions
   Content comes from data.js (projects, verbatim) and site.js (page copy, verbatim).
   Image-to-section assignment is read straight from data.js and never changed. */
(() => {
'use strict';

const PROJECTS = window.PROJECTS || [];
const DIMS = window.IMG_DIMS || {};
// Hebrew is the source; English (en.js) overlays it section by section.
const EN = window.I18N_EN || null;
const S_HE = window.SITE, UI_HE = window.UI;
let LANG = 'he';
let S = S_HE, UI = UI_HE;
const fwd = () => (LANG === 'en' ? '→' : '←');
function toEnglish(p) {
  const o = EN && EN.projects && EN.projects[p.id];
  if (!o) return p;
  const { sections: secs = {}, ...top } = o;
  return { ...p, ...top, sections: p.sections.map(sec => ({ ...sec, ...(secs[sec.id] || {}) })) };
}

// One primary colour and one primitive per project.
const META = {
  3: { slug: 'loop',    c: 'var(--blue)',   on: 'var(--white)', shape: 'circle'   }, // round earbuds
  5: { slug: 'space',   c: 'var(--red)',    on: 'var(--white)', shape: 'square'   }, // a room, a corridor
  4: { slug: 'physics', c: 'var(--yellow)', on: 'var(--ink)',   shape: 'triangle' }, // optics prism
  2: { slug: 'liba',    c: 'var(--green)',  on: 'var(--white)', shape: 'bowl'     }, // concave balance board
};
const LEAD = 'loop';
const WORK = PROJECTS.map((p, i) => ({ p, he: p, en: toEnglish(p), i, ...(META[p.id] || { slug: 'p' + p.id, c: 'var(--ink)', on: 'var(--white)', shape: 'square' }) }));
const bySlug = s => WORK.find(w => w.slug === s);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const G = window.gsap, ST = window.ScrollTrigger;
const motion = !!(G && ST) && !reduce;
if (G && ST) G.registerPlugin(ST);
if (motion) document.documentElement.classList.add('js-motion');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const app = $('#app'), hdr = $('#hdr'), progress = $('#progress');
const titleHE = document.title;
let baseTitle = titleHE;

/* smooth scroll */
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.1 });
  if (motion) { lenis.on('scroll', ST.update); G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
  else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
}
function scrollTo(target, { immediate = false, duration = 1.5, offset = 0 } = {}) {
  if (lenis) { lenis.scrollTo(target, { immediate, duration, offset, force: true }); if (!immediate) return; }
  const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + scrollY + offset;
  window.scrollTo({ top: y, behavior: immediate || reduce ? 'instant' : 'smooth' });
}
const lock = on => { if (lenis) on ? lenis.stop() : lenis.start(); document.body.style.overflow = on ? 'hidden' : ''; };

/* ───────── templates ───────── */
function img(src, alt = '', { eager = false } = {}) {
  const d = DIMS[src];
  return `<img src="${src}" alt="${attr(alt)}"${d ? ` width="${d[0]}" height="${d[1]}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
const COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><rect x="9" y="9" width="13" height="13"/><path d="M5 15H2V2h13v3"/></svg>';
const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
const split = t => { const k = t.indexOf(' | '); return k < 0 ? { he: t, en: '' } : { he: t.slice(0, k), en: t.slice(k + 3) }; };
const paras = body => (body || '').split('\n\n').filter(Boolean).map(t => `<p>${t.replace(/\n/g, '<br>')}</p>`).join('');
const bidi = s => s.replace(/[A-Za-z][A-Za-z.]*(?:\s+[A-Za-z][A-Za-z.]*)*/g, m => `<bdi>${m}</bdi>`);
const vars = w => `--c:${w.c};--on:${w.on}`;
const hostAttrs = (w, st = '') => `style="${vars(w)}${st}" data-shape="${w.shape}" data-c="${w.c}" data-on="${w.on}"`;

// The opening field: black primitives that drift away from the pointer and light up.
const LIT = ['var(--blue)', 'var(--red)', 'var(--yellow)', 'var(--green)'];
const FIELD = [
  { t: 'circle',   x: 4,  y: 13, s: '4.6vw' },
  { t: 'square',   x: 31, y: 10, s: '2.6vw', r: 12 },
  { t: 'triangle', x: 42, y: 21, s: '4.4vw' },
  { t: 'bar',      x: 2,  y: 71, s: '16vw', h: '.8vw' },
  { t: 'bowl',     x: 8,  y: 79, s: '6.4vw' },
  { t: 'square',   x: 37, y: 71, s: '3vw', r: 14 },
  { t: 'dot',      x: 46, y: 52, s: '2vw' },
  { t: 'triangle', x: 56, y: 12, s: '2.8vw', r: 180 },
  { t: 'bar',      x: 67, y: 7,  s: '.8vw', h: '8vw' },
  { t: 'ring',     x: 78, y: 11, s: '5.6vw' },
  { t: 'dot',      x: 91, y: 31, s: '2.4vw' },
  { t: 'square',   x: 24, y: 89, s: '3.4vw' },
  { t: 'bowl',     x: 49, y: 87, s: '3.4vw', r: 180 },
  { t: 'dot',      x: 62, y: 40, s: '1.4vw' },
  { t: 'ring',     x: 34, y: 50, s: '2.6vw' },
  { t: 'circle',   x: 52, y: 30, s: '1.8vw' },
  { t: 'square',   x: 84, y: 44, s: '2vw', r: 24 },
  { t: 'triangle', x: 72, y: 30, s: '3.2vw', r: 12 },
  { t: 'bowl',     x: 93, y: 52, s: '2.6vw' },
  { t: 'ring',     x: 50, y: 42, s: '2.2vw' },
  { t: 'dot',      x: 3,  y: 50, s: '1.6vw' },
  { t: 'triangle', x: 2,  y: 90, s: '2.4vw', r: 200 },
  { t: 'square',   x: 47, y: 63, s: '1.6vw', r: 40 },
  { t: 'circle',   x: 40, y: 94, s: '1.4vw' },
  { t: 'bar',      x: 50, y: 3,  s: '7vw', h: '.6vw' },
  { t: 'circle',   x: 18, y: 26, s: '5.2vw' },
  { t: 'triangle', x: 28, y: 40, s: '3.6vw', r: -14 },
  { t: 'square',   x: 12, y: 44, s: '2.8vw', r: 30 },
  { t: 'ring',     x: 22, y: 58, s: '4vw' },
  { t: 'bar',      x: 16, y: 16, s: '.7vw', h: '6vw' },
  { t: 'dot',      x: 36, y: 30, s: '1.6vw' },
  { t: 'bowl',     x: 30, y: 61, s: '4vw', r: 180 },
  { t: 'dot',      x: 9,  y: 34, s: '1.2vw' },
  { t: 'triangle', x: 60, y: 22, s: '1.8vw', r: 60 },
  { t: 'square',   x: 66, y: 46, s: '1.4vw', r: 10 },
  { t: 'circle',   x: 76, y: 52, s: '1.6vw' },
  { t: 'bar',      x: 30, y: 80, s: '10vw', h: '.6vw' },
];
const shapeClass = t => ({ circle: 'shape--circle', dot: 'shape--circle', square: 'shape--square', triangle: 'shape--triangle', bowl: 'shape--bowl' })[t] || '';

function homeHTML() {
  const tags = S.heroDesc.split(' | ').map(t => `<li>${t}</li>`).join('');
  const field = FIELD.map((f, i) => `<span class="fx fx--${f.t}" style="--x:${f.x}%;--y:${f.y}%;--s:clamp(14px,${f.s},999px);--r:${f.r || 0}deg;--lc:${LIT[i % LIT.length]}${f.h ? `;--h:clamp(6px,${f.h},999px)` : ''}">
      <span class="fx__m"><span class="fx__b ${shapeClass(f.t)}"></span></span></span>`).join('');
  const lead = bySlug(LEAD);
  const leadHTML = lead ? `
    <a class="lead" href="#/work/${lead.slug}" ${hostAttrs(lead)} data-cursor="open" aria-label="${attr(lead.p.title)}">
      <span class="lead__waves" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="lead__disc">${img(lead.p.heroImg, lead.p.title, { eager: true })}<i class="lead__dot" aria-hidden="true"></i></span>
      <span class="lead__tag"><i aria-hidden="true">←</i><b>${lead.p.title}</b><span>${lead.p.categoryLabel || ''}</span></span>
    </a>` : '';

  const ratio = src => (DIMS[src] ? DIMS[src][0] / DIMS[src][1] : 1.33);
  const cards = WORK.map(w => { const p = w.p; return `
    <a class="wcard" href="#/work/${w.slug}" ${hostAttrs(w, `;--ar:${ratio(p.heroImg).toFixed(4)}`)} data-slug="${w.slug}" data-cursor="open" data-flip>
      <span class="wcard__img">${img(p.heroImg, p.title)}<i class="wcard__gloss" aria-hidden="true"></i><i class="wcard__shape shape shape--${w.shape}" aria-hidden="true"></i></span>
      <span class="wcard__body">
        <span class="wcard__cat">${p.cardLabel || p.categoryLabel || p.category || ''}</span>
        <span class="wcard__title">${p.title}</span>
        <span class="wcard__sub">${p.subtitle || ''}</span>
      </span>
    </a>`; });
  const rows = []; for (let i = 0; i < cards.length; i += 2) rows.push(`<div class="wrow">${cards.slice(i, i + 2).join('')}</div>`);

  const lastLine = S.aboutLines.length - 1;
  const aboutTitle = S.aboutLines.map((ln, i) =>
    `<span class="ln">${ln.split(' ').map(x => `<span class="w">${x}</span>`).join(' ')}${i === lastLine ? '<i class="sq" aria-hidden="true"></i>' : ''}</span>`).join('');

  return `
  <section class="hero" id="top">
    <div class="field" id="field" aria-hidden="true">${field}</div>
    <div class="hero__text">
      <ul class="hero__tags">${tags}</ul>
      <h1 class="hero__title"><span class="mask"><span>${S.heroName}</span></span></h1>
      <span class="hero__rule" aria-hidden="true"></span>
      <div class="hero__cta">
        <a class="btn btn--ink" href="#projects" data-scroll="projects">${S.ctaProjects}</a>
        <a class="btn btn--line" href="#contact" data-scroll="contact">${S.ctaContact}</a>
      </div>
    </div>
  </section>

  <section class="about" id="about">
    <div class="label" data-reveal style="--c:var(--red)">${S.nav.about}</div>
    <h2 class="about__title">${aboutTitle}</h2>
    <div class="about__grid">
      <div class="about__text" data-reveal>${S.aboutText.map(t => `<p>${t}</p>`).join('')}</div>
      <ol class="about__list">${S.aboutCards.map(([t, s], i) => { const w = WORK[i % WORK.length];
        return `<li data-reveal style="${vars(w)}"><i class="shape shape--${w.shape}" aria-hidden="true"></i><b>${bidi(t)}</b><span>${bidi(s)}</span></li>`; }).join('')}</ol>
    </div>
  </section>

  <section class="work" id="projects">
    <div class="sec-head">
      <h2 class="sec-title" data-reveal>${S.projectsTitle}</h2>
      <span class="legend" aria-hidden="true">${WORK.map(w => `<i class="shape shape--${w.shape}" style="${vars(w)}"></i>`).join('')}</span>
    </div>
    <div class="wrows">${rows.join('')}</div>
  </section>

  <section class="contact" id="contact" data-dark>
    <div class="contact__comp" aria-hidden="true"><i class="shape shape--circle a"></i><i class="shape shape--square b"></i><i class="shape shape--triangle c"></i></div>
    <div class="label">${S.nav.contact}</div>
    <div class="contact__row">
      <a class="contact__mail" href="mailto:${S.email}">${S.email}</a>
      <button class="copy" type="button" data-copy="${S.email}" aria-label="${S.copyEmailLabel}" title="${S.copyEmailTitle}">${COPY_SVG}<span>${S.copyEmailTitle}</span></button>
      <span class="contact__sep" aria-hidden="true"></span>
      <a class="contact__phone" href="tel:${S.phoneHref}">${S.phone}</a>
      <button class="copy" type="button" data-copy="${S.phone}" aria-label="${S.copyPhoneLabel}" title="${S.copyPhoneTitle}">${COPY_SVG}<span>${S.copyPhoneTitle}</span></button>
    </div>
    <footer class="foot"><span>${S.footerLeft}</span><span>${S.footerRight}</span></footer>
  </section>`;
}

function caseHTML(w) {
  const p = w.p, next = WORK[(w.i + 1) % WORK.length];
  const fig = (src, alt, k) => `<figure class="fig" data-idx="${k}" data-cursor="zoom" tabindex="0" role="button" aria-label="${attr(alt)}">
      <div class="fig__clip">${img(src, alt)}</div>
    </figure>`;
  let k = 0;
  const sections = p.sections.map((sec, si) => {
    const imgs = (sec.images || []).filter(Boolean);
    const kind = sec.layout === 'quote' ? 'quote' : !imgs.length ? 'text' : sec.layout === 'text-full-img' ? 'full' : 'media';
    const t = split(sec.title);
    const head = `<div class="cs__head"><i class="cs__mark" aria-hidden="true"></i>
      <h2 class="cs__title"><span class="he">${t.he}</span>${t.en ? `<span class="en">${t.en}</span>` : ''}</h2></div>`;
    const body = kind === 'quote'
      ? `<blockquote class="quote"${(sec.body || '').length > 150 ? ' style="font-size:clamp(22px,2.3vw,38px)"' : ''}>${(sec.body || '').replace(/\n/g, '<br>')}</blockquote>`
      : `<div class="cs__text">${paras(sec.body)}</div>`;
    const principles = (sec.principles || []).length ? `<div class="principles">${sec.principles.map(x => `<span>${x}</span>`).join('')}</div>` : '';
    const team = sec.team && (sec.team.members || []).length ? `<div class="team"><p class="team__title">${sec.team.title || ''}</p><ul class="team__list">${sec.team.members.map(m => `<li>${m}</li>`).join('')}</ul></div>` : '';
    const media = imgs.length ? `<div class="cs__media">${imgs.map((src, j) => fig(src, `${p.title} — ${sec.title} ${j + 1}`, ++k)).join('')}</div>` : '';
    return `<section class="cs cs--${kind}${imgs.length ? ' has-media' : ''}" id="s${si + 1}"${kind === 'quote' ? ' data-dark' : ''}><div class="cs__copy">${head}${body}${principles}${team}</div>${media}</section>`;
  }).join('');

  return `
  <article class="case" ${hostAttrs(w)}>
    <header class="case-hero">
      <div class="case-hero__info">
        <div class="case-cat">${p.categoryLabel || p.category || ''}</div>
        <h1 class="case-title"><span class="mask"><span>${p.title}</span></span></h1>
        <p class="case-sub">${p.subtitle || ''}</p>
        <ul class="tags">${(p.tags || []).map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
      <figure class="case-cover" data-idx="0" data-cursor="zoom" tabindex="0" role="button" aria-label="${attr(p.title)}">
        ${img(p.heroImg, p.title, { eager: true })}
      </figure>
    </header>
    <div class="case-body">${sections}</div>
    <a class="next" href="#/work/${next.slug}" ${hostAttrs(next)} data-cursor="open">
      <span class="next__label">${UI.next}</span>
      <span class="next__img">${img(next.p.heroImg, '')}</span>
      <span class="next__row"><span class="next__title">${next.p.title}</span><span class="next__arrow" aria-hidden="true">${fwd()}</span></span>
    </a>
    <div class="case-foot"><span>${S.footerLeft}</span><span>${S.footerRight}</span></div>
  </article>`;
}

/* ───────── fit type ───────── */
function fit(el, maxW, maxPx) {
  el.style.fontSize = '100px';
  const w = el.scrollWidth || el.getBoundingClientRect().width || 1;
  el.style.fontSize = Math.max(28, Math.min(maxPx, (100 * maxW) / w)) + 'px';
}
function fitAll() {
  const W = innerWidth, H = innerHeight, g = Math.min(44, Math.max(16, W * 0.03)), mob = W < 760;
}

/* ───────── router ───────── */
let view = null, busy = false, queued = null, pendingScroll = null, disposers = [], flipFrom = null;
let lastPointer = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener('pointerdown', e => { lastPointer = { x: e.clientX, y: e.clientY }; }, { passive: true });

function parse() {
  const m = location.hash.match(/^#\/work\/([\w-]+)/);
  return m && bySlug(m[1]) ? { type: 'case', slug: m[1] } : { type: 'home' };
}
addEventListener('hashchange', () => go(parse()));

function cleanup() {
  disposers.forEach(f => f()); disposers = [];
  if (ST) ST.getAll().forEach(t => t.kill());
}

function mount(target) {
  cleanup();
  const isCase = target.type === 'case', w = isCase && bySlug(target.slug);
  document.body.classList.toggle('is-case', isCase);
  $('#closeBtn').hidden = !isCase;
  app.innerHTML = isCase ? caseHTML(w) : homeHTML();
  progress.style.setProperty('--c', isCase ? w.c : 'var(--ink)');
  document.title = isCase ? `${w.p.title} — ${S.introB}` : baseTitle;
  view = target;
  scrollTo(0, { immediate: true });
  fitAll();
  isCase ? initCase() : initHome();
  initCommon();
  if (ST) ST.refresh();
  app.focus({ preventScroll: true });
}

function afterHomeMount(from) {
  if (pendingScroll) { const el = $('#' + pendingScroll); pendingScroll = null; if (el) scrollTo(el, { immediate: true }); }
  else if (from && from.type === 'case') { const el = $(`.wcard[data-slug="${from.slug}"]`) || $('#projects'); if (el) scrollTo(el, { immediate: true, offset: -120 }); }
  if (ST) ST.update();
}

async function go(target, initial = false) {
  if (busy) { queued = target; return; }
  if (!initial && view && view.type === target.type && view.slug === target.slug) {
    if (pendingScroll && target.type === 'home') { scrollTo($('#' + pendingScroll)); pendingScroll = null; }
    return;
  }
  busy = true;
  const from = view;
  closeLB(true);
  if (initial || !motion) {
    flipFrom = null;
    mount(target);
    if (!initial && target.type === 'home') afterHomeMount(from);
  } else if (target.type === 'case' && flipFrom && flipFrom.slug === target.slug) {
    lock(true);
    await flipTo(target);
    lock(false);
  } else {
    flipFrom = null;
    lock(true);
    await cover(target.type === 'case' ? bySlug(target.slug) : null);
    mount(target);
    if (target.type === 'home') afterHomeMount(from);
    await Promise.all([uncover(), target.type === 'case' ? introCase() : Promise.resolve()]);
    lock(false);
  }
  busy = false;
  if (queued) { const q = queued; queued = null; if (q.type !== view.type || q.slug !== view.slug) go(q); }
}

/* ───────── transitions ───────── */
// From the index: the photo simply grows into its place on the project page and takes back its colour.
async function flipTo(target) {
  const f = flipFrom; flipFrom = null;
  const ov = document.createElement('div'); ov.className = 'flip';
  const im = new Image(); im.className = 'flip__img'; im.src = f.src; im.alt = '';
  ov.appendChild(im); document.body.appendChild(ov);
  G.set(im, { left: f.rect.left, top: f.rect.top, width: f.rect.width, height: f.rect.height, filter: 'grayscale(1)' });
  await G.to(ov, { backgroundColor: 'rgba(242,241,236,1)', duration: 0.3, ease: 'power1.out' });
  mount(target);
  const dest = $('.case-cover img');
  if (dest) {
    const t = dest.getBoundingClientRect();
    // grow into place, take colour and settle at the background's own softness
    await G.to(im, { left: t.left, top: t.top, width: t.width, height: t.height, borderRadius: 0, filter: 'grayscale(0)', opacity: 0.4, duration: 1.1, ease: 'power2.inOut' });
  }
  // the page (same photo, same softness, plus its gentle fade) shows through as the overlay dissolves
  await G.timeline()
    .to(ov, { backgroundColor: 'rgba(242,241,236,0)', duration: 0.8, ease: 'sine.inOut' }, 0)
    .to(im, { opacity: 0, duration: 0.8, ease: 'sine.inOut' }, 0);
  ov.remove();
}

// Elsewhere: the project's own shape grows from where you clicked.
const wipe = $('#wipe'), wipeTitle = $('#wipeTitle');
function cover(w) {
  const { x, y } = lastPointer, W = innerWidth, H = innerHeight;
  wipe.style.setProperty('--c', w ? w.c : 'var(--ink)');
  wipe.style.setProperty('--on', w ? w.on : 'var(--white)');
  wipeTitle.textContent = w ? w.p.title : '';
  G.set(wipeTitle, { opacity: 0, y: 50 });
  let from, to;
  const shape = w ? w.shape : 'rise';
  if (shape === 'circle' || shape === 'bowl') {
    const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 20;
    from = `circle(0px at ${x}px ${y}px)`; to = `circle(${R}px at ${x}px ${y}px)`;
  } else if (shape === 'square') {
    from = `inset(${y}px ${W - x}px ${H - y}px ${x}px)`; to = 'inset(0px 0px 0px 0px)';
  } else if (shape === 'triangle') {
    from = `polygon(${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px)`;
    to = `polygon(${W / 2}px ${-H * 1.6}px, ${W * 2.6}px ${H * 2}px, ${-W * 1.6}px ${H * 2}px)`;
  } else { from = 'inset(100% 0px 0px 0px)'; to = 'inset(0% 0px 0px 0px)'; }
  G.set(wipe, { clipPath: from });
  wipe.classList.add('is-on');
  const tl = G.timeline().to(wipe, { clipPath: to, duration: 0.9, ease: 'expo.inOut' });
  if (w) tl.to(wipeTitle, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.35');
  return tl;
}
function uncover() {
  return G.timeline({ onComplete: () => { wipe.classList.remove('is-on'); G.set([wipe, wipeTitle], { clearProps: 'all' }); } })
    .to(wipeTitle, { opacity: 0, y: -40, duration: 0.4, ease: 'power2.in' })
    .set(wipe, { clipPath: 'inset(0% 0px 0% 0px)' })
    .to(wipe, { clipPath: 'inset(0% 0px 100% 0px)', duration: 0.8, ease: 'expo.inOut' }, '-=0.05');
}

/* ───────── intros ───────── */
function introHome() {
  if (!motion) return Promise.resolve();
  return G.timeline()
    .from('.fx', { scale: 0, opacity: 0, duration: 1, stagger: { each: 0.04, from: 'random' }, ease: 'back.out(1.6)', clearProps: 'scale,opacity' }, 0.05)
    .from('.lead__disc', { scale: 0.6, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.2)
    .from('.lead__dot', { scale: 0, duration: 1.1, ease: 'back.out(1.6)' }, 0.6)
    .from('.lead__waves, .lead__tag', { opacity: 0, y: 16, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, 0.8)
    .from('.hero__title .mask > span', { yPercent: 110, duration: 1.2, ease: 'expo.out' }, 0.25)
    .from('.hero__rule', { scaleX: 0, transformOrigin: 'right center', duration: 1, ease: 'expo.inOut' }, 0.4)
    .from('.hero__tags li, .hero__cta .btn', { opacity: 0, y: 22, stagger: 0.06, duration: 0.9, ease: 'expo.out' }, 0.5)
    .from('.hdr > *', { opacity: 0, y: -16, stagger: 0.08, duration: 0.8, ease: 'expo.out' }, 0.35);
}
function introCase(afterFlip = false) {
  if (!motion) return Promise.resolve();
  const tl = G.timeline()
    .from('.case-title .mask > span', { yPercent: 110, duration: 1.2, ease: 'expo.out' }, 0.05)
    .from('.case-cat, .case-sub, .tags li', { opacity: 0, y: 20, stagger: 0.04, duration: 0.8, ease: 'expo.out' }, 0.2)
  if (!afterFlip) tl.from('.case-cover img', { opacity: 0, duration: 1, ease: 'power1.out', clearProps: 'opacity' }, 0.1);
  return tl;
}

/* ───────── home ───────── */
function initHome() {
  initField();
  initHero3D();
  initTilt();
  if (motion) {
    G.to('.field', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    G.to('.lead', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    $$('.wcard').forEach(card => {
      G.from(card, { y: 90, opacity: 0, duration: 1.2, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: card, start: 'top 92%' } });
    });
    G.from('.contact__comp .shape', { scale: 0, rotation: 45, stagger: 0.12, duration: 1.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.contact', start: 'top 70%' } });
  }
  const title = $('.about__title');
  if (title) {
    const words = $$('.w', title), sq = $('.sq', title);
    if (!motion) { words.forEach(w => w.classList.add('on')); sq && sq.classList.add('on'); }
    else ST.create({ trigger: title, start: 'top 82%', end: 'bottom 48%', onUpdate: s => {
      const n = Math.round(s.progress * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n)); sq && sq.classList.toggle('on', s.progress > 0.97);
    } });
  }
}

function initField() {
  const field = $('#field'); if (!field) return;
  const items = $$('.fx', field).map(el => ({ el, m: $('.fx__m', el), lit: false, q: null, cx: 0, cy: 0, r: 0 }));
  if (G && !reduce) {
    items.forEach((it, i) => {
      // slow ambient drift, as if suspended
      G.to(it.el, { y: `+=${8 + (i % 4) * 4}`, x: `+=${(i % 2 ? 1 : -1) * (4 + (i % 3) * 3)}`, duration: 3.4 + (i % 5) * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: (i % 7) * 0.3 });
      it.q = {
        x: G.quickTo(it.m, 'x', { duration: 1.4, ease: 'power3' }), y: G.quickTo(it.m, 'y', { duration: 1.4, ease: 'power3' }),
        z: G.quickTo(it.m, 'z', { duration: 1.6, ease: 'power3' }),
        rx: G.quickTo(it.m, 'rotationX', { duration: 1.6, ease: 'power3' }), ry: G.quickTo(it.m, 'rotationY', { duration: 1.6, ease: 'power3' }),
        rz: G.quickTo(it.m, 'rotationZ', { duration: 2, ease: 'power3' }),
      };
    });
  }
  const measure = () => items.forEach(it => { const b = it.el.getBoundingClientRect(); it.cx = b.left + b.width / 2; it.cy = b.top + b.height / 2 + scrollY; it.r = Math.max(b.width, b.height) / 2; });
  measure();
  let pending = false, px = -1e4, py = -1e4;
  const apply = () => {
    pending = false;
    const y0 = py + scrollY;
    items.forEach(it => {
      const dx = it.cx - px, dy = it.cy - y0, d = Math.hypot(dx, dy) || 1, R = it.r + 120;
      const near = d < R;
      if (near !== it.lit) { it.lit = near; it.el.classList.toggle('is-lit', near); }
      if (!it.q) return;
      if (near) {
        const f = 1 - d / R, ux = dx / d, uy = dy / d;
        it.q.x(ux * f * 70); it.q.y(uy * f * 70); it.q.z(f * 160);
        it.q.rx(-uy * f * 55); it.q.ry(ux * f * 55); it.q.rz(ux * f * 30);
      } else { it.q.x(0); it.q.y(0); it.q.z(0); it.q.rx(0); it.q.ry(0); it.q.rz(0); }
    });
  };
  const onMove = e => { px = e.clientX; py = e.clientY; if (!pending) { pending = true; requestAnimationFrame(apply); } };
  const onLeave = () => { px = py = -1e4; apply(); };
  const hero = $('.hero');
  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerdown', onMove, { passive: true });
  hero.addEventListener('pointerleave', onLeave);
  addEventListener('resize', measure);
  const remeasure = setInterval(measure, 1500);
  disposers.push(() => { removeEventListener('resize', measure); clearInterval(remeasure); if (G) items.forEach(it => G.killTweensOf([it.el, it.m])); });
}

/* ───────── 3D field: the same primitives as solids in space ───────── */
function initHero3D() {
  const field = $('#field'), hero = $('.hero'), T = window.THREE;
  if (!field || !hero || !T) return;
  let renderer = null;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); if (!renderer.getContext()) renderer = null; } catch (_) { renderer = null; }
  if (!renderer) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'field__gl';
  field.appendChild(renderer.domElement);
  field.classList.add('is-gl');

  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(32, 1, 0.1, 400); cam.position.set(0, 0, 40);
  scene.add(new T.HemisphereLight(0xffffff, 0x3a3a36, 0.7));
  const key = new T.DirectionalLight(0xffffff, 1.05); key.position.set(-10, 14, 18); scene.add(key);
  const rim = new T.DirectionalLight(0xffffff, 0.5); rim.position.set(14, -8, -6); scene.add(rim);
  scene.add(new T.AmbientLight(0xffffff, 0.12));

  const LITHEX = [0x1661C6, 0xE2251B, 0xF5C000, 0x2E8C4E];
  const INK = new T.Color(0x171717);
  const geoFor = t => {
    switch (t) {
      case 'circle': case 'dot': return new T.SphereGeometry(0.5, 48, 32);
      case 'square': return new T.BoxGeometry(0.74, 0.74, 0.74);
      case 'triangle': return new T.ConeGeometry(0.55, 0.92, 3);
      case 'bowl': return new T.SphereGeometry(0.5, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      case 'ring': return new T.TorusGeometry(0.42, 0.055, 24, 72);
      default: return new T.BoxGeometry(1, 1, 1);
    }
  };
  const items = FIELD.map((f, i) => {
    const mat = new T.MeshStandardMaterial({ color: INK.clone(), roughness: 0.38, metalness: 0.12, side: f.t === 'bowl' ? T.DoubleSide : T.FrontSide });
    const mesh = new T.Mesh(geoFor(f.t), mat);
    scene.add(mesh);
    const base = { rx: 0, ry: 0, rz: -((f.r || 0) * Math.PI) / 180 };
    if (f.t === 'square') { base.rx = 0.45; base.ry = 0.62; }
    if (f.t === 'triangle') { base.rx = 0.25; base.ry = 0.5; if (f.r === 180) base.rz = Math.PI; }
    if (f.t === 'bowl') { base.rx = 0.35; if (f.r === 180) base.rz = Math.PI; }
    if (f.t === 'ring') { base.rx = 0.5; }
    return { f, mesh, mat, lc: new T.Color(LITHEX[i % LITHEX.length]), base, bx: 0, by: 0, rad: 1,
      ox: 0, oy: 0, oz: 0, sx: 0, sy: 0, lit: 0, hold: -1, ph: i * 1.7 };
  });

  let W = 1, H = 1, viewW = 1, viewH = 1, px2w = 1;
  const vw = v => innerWidth * parseFloat(v) / 100;
  function layout() {
    const r = field.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    cam.aspect = W / H; cam.updateProjectionMatrix();
    viewH = 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z; viewW = viewH * cam.aspect; px2w = viewW / W;
    items.forEach(it => {
      const f = it.f, sPx = Math.max(14, vw(f.s)), hPx = f.h ? Math.max(6, vw(f.h)) : sPx;
      const cx = (f.x / 100) * W + sPx / 2, cy = (f.y / 100) * H + hPx / 2;
      it.bx = (cx / W - 0.5) * viewW; it.by = -(cy / H - 0.5) * viewH;
      if (f.t === 'bar') it.mesh.scale.set(sPx * px2w, hPx * px2w, Math.min(sPx, hPx) * px2w);
      else it.mesh.scale.setScalar(sPx * px2w);
      it.rad = (Math.max(sPx, hPx) / 2) * px2w;
    });
  }
  layout();

  const mouse = { x: 1e4, y: 1e4 };
  const onMove = e => {
    const r = field.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / W - 0.5) * viewW;
    mouse.y = -((e.clientY - r.top) / H - 0.5) * viewH;
  };
  const onLeave = () => { mouse.x = mouse.y = 1e4; };
  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerdown', onMove, { passive: true });
  hero.addEventListener('pointerleave', onLeave);

  let visible = true, alive = true, raf = 0; const t0 = performance.now();
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(field);
  const frame = now => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const t = (now - t0) / 1000;
    items.forEach(it => {
      const dx = it.bx - mouse.x, dy = it.by - mouse.y, d = Math.hypot(dx, dy) || 1e-3;
      const R = it.rad + 130 * px2w, near = d < R;
      let tx = 0, ty = 0, tz = 0;
      if (near && !reduce) {
        const f = 1 - d / R;
        tx = (dx / d) * f * 80 * px2w; ty = (dy / d) * f * 80 * px2w; tz = f * 9;
        it.sx += (-dy / d) * f * 0.012; it.sy += (dx / d) * f * 0.012;   // tumble away from the pointer
      }
      if (near) it.hold = t + 0.9;
      const want = t < it.hold ? 1 : 0;
      it.lit += (want - it.lit) * (want ? 0.2 : 0.03);
      it.mat.color.copy(INK).lerp(it.lc, it.lit);
      it.ox += (tx - it.ox) * 0.06; it.oy += (ty - it.oy) * 0.06; it.oz += (tz - it.oz) * 0.06;
      it.sx *= 0.95; it.sy *= 0.95;
      it.base.rx += it.sx; it.base.ry += it.sy;
      const bob = reduce ? 0 : Math.sin(t * 0.7 + it.ph) * 0.18;
      it.mesh.position.set(it.bx + it.ox, it.by + it.oy + bob, it.oz);
      it.mesh.rotation.set(it.base.rx + (reduce ? 0 : Math.sin(t * 0.3 + it.ph) * 0.08), it.base.ry + (reduce ? 0 : t * 0.05), it.base.rz);
    });
    renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame);
  const onResize = () => layout();
  addEventListener('resize', onResize);
  disposers.push(() => {
    alive = false; cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', onResize);
    items.forEach(it => { it.mesh.geometry.dispose(); it.mat.dispose(); });
    renderer.dispose(); renderer.domElement.remove();
  });
}

/* ───────── LOOP: on hover the disc becomes a globe, turning ───────── */
function initGlobe() {
  const lead = $('.lead'), host = lead && $('.lead__globe', lead), T = window.THREE;
  if (!host || !T) return;
  let renderer = null;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); if (!renderer.getContext()) renderer = null; } catch (_) { renderer = null; }
  if (!renderer) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0, 0, 1 / Math.sin(Math.PI / 12) + 0.02);
  scene.add(new T.HemisphereLight(0xffffff, 0x404040, 0.75));
  const key = new T.DirectionalLight(0xffffff, 1.0); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new T.DirectionalLight(0x1661C6, 1.2); rim.position.set(4, -2, -3); scene.add(rim);
  const src = $('.lead__disc img', lead).getAttribute('src');
  const tex = new T.TextureLoader().load(src, () => { lead.classList.add('has-globe'); });
  tex.wrapS = T.RepeatWrapping; tex.repeat.set(2, 1);
  const geo = new T.SphereGeometry(1, 64, 48);
  const mat = new T.MeshStandardMaterial({ map: tex, roughness: 0.48, metalness: 0.06 });
  const globe = new T.Mesh(geo, mat);
  const tilt = new T.Group(); tilt.rotation.z = 0.41; tilt.add(globe); scene.add(tilt);
  let hover = false, speed = 0.003, alive = true, raf = 0;
  const on = () => { hover = true; }, off = () => { hover = false; };
  lead.addEventListener('pointerenter', on); lead.addEventListener('pointerleave', off);
  lead.addEventListener('focus', on); lead.addEventListener('blur', off);
  const size = () => { const r = host.getBoundingClientRect(); renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false); };
  size();
  const frame = () => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    speed += ((hover ? 0.024 : 0.003) - speed) * 0.05;
    if (!reduce) globe.rotation.y += speed;
    if (hover || speed > 0.004) renderer.render(scene, cam);
  };
  raf = requestAnimationFrame(frame);
  addEventListener('resize', size);
  disposers.push(() => {
    alive = false; cancelAnimationFrame(raf); removeEventListener('resize', size);
    geo.dispose(); mat.dispose(); tex.dispose(); renderer.dispose(); renderer.domElement.remove();
  });
}

/* ───────── project photos: a little depth under the pointer ───────── */
function initTilt() {
  if (!finePointer || reduce) return;
  $$('.wcard').forEach(card => {
    const box = $('.wcard__img', card);
    card.addEventListener('mousemove', e => {
      const r = box.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      box.style.setProperty('--ry', (nx * 7).toFixed(2) + 'deg'); box.style.setProperty('--rx', (-ny * 5).toFixed(2) + 'deg');
      box.style.setProperty('--sx', (nx * 22).toFixed(1) + 'px'); box.style.setProperty('--sy', (ny * 22).toFixed(1) + 'px');
      box.style.setProperty('--gx', ((nx + 0.5) * 100).toFixed(1) + '%'); box.style.setProperty('--gy', ((ny + 0.5) * 100).toFixed(1) + '%');
    });
    card.addEventListener('mouseleave', () => ['--rx', '--ry', '--sx', '--sy'].forEach(k => box.style.removeProperty(k)));
  });
}

/* ───────── case study ───────── */
function initCase() {
  if (!motion) return;
  $$('.cs').forEach(sec => {
    G.from($$('.cs__head, .cs__text, .quote, .principles', sec), { opacity: 0, y: 40, stagger: 0.08, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: sec, start: 'top 80%' } });
    // photos simply fade in, never scaled or cropped
    $$('.fig', sec).forEach(f => G.from(f, { opacity: 0, y: 30, duration: 1, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: f, start: 'top 92%' } }));
  });
}

/* ───────── shared per view ───────── */
function initCommon() {
  if (ST) ST.create({ start: 0, end: 'max', onUpdate: s => { progress.style.transform = `scaleX(${s.progress})`; } });
  if (motion) ST.batch('[data-reveal]', { start: 'top 92%', onEnter: els => G.to(els, { opacity: 1, y: 0, stagger: 0.08, duration: 1.1, ease: 'expo.out', overwrite: true }) });
  else $$('[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
}

/* ───────── header ───────── */
function headerText() {
  $('#logoName').textContent = S.logoName;
  $('#logoTag').textContent = S.logoTag;
  $('#closeLabel').textContent = S.nav.projects;
  $('#closeBtn').setAttribute('aria-label', S.nav.projects);
  $('#hdrContact').textContent = S.nav.contact;
  $('#nav').setAttribute('aria-label', S.navLabel || 'ניווט');
  $('#nav').innerHTML = [['about', S.nav.about], ['projects', S.nav.projects]]
    .map(([id, t]) => `<a href="#${id}" data-scroll="${id}">${t}</a>`).join('');
  const lb = $('#langBtn');
  if (lb) {
    const toEN = LANG !== 'en';
    lb.querySelector('.lang__full').textContent = toEN ? 'ENGLISH' : 'עברית';
    lb.querySelector('.lang__short').textContent = toEN ? 'EN' : 'עב';
    lb.setAttribute('lang', toEN ? 'en' : 'he');
    lb.setAttribute('aria-label', toEN ? 'Switch to English' : 'מעבר לעברית');
  }
  // lightbox arrows follow reading direction
  $('#lbPrev span').textContent = LANG === 'en' ? '←' : '→';
  $('#lbNext span').textContent = LANG === 'en' ? '→' : '←';
}

/* ───────── language: Hebrew ⇄ English ───────── */
function setLang(lang) {
  LANG = lang === 'en' && EN ? 'en' : 'he';
  S = LANG === 'en' ? { ...S_HE, ...EN.site, nav: { ...S_HE.nav, ...EN.site.nav } } : S_HE;
  UI = LANG === 'en' ? { ...UI_HE, ...EN.ui } : UI_HE;
  WORK.forEach(w => { w.p = LANG === 'en' ? w.en : w.he; });
  baseTitle = LANG === 'en' ? (EN.title || titleHE) : titleHE;
  const root = document.documentElement;
  root.lang = LANG; root.dir = LANG === 'en' ? 'ltr' : 'rtl';
  headerText();
  try { localStorage.setItem('portfolio-lang', LANG); } catch (_) {}
}
async function switchLang() {
  if (busy) return;
  busy = true;
  const y = scrollY;
  if (G && !reduce) await G.to(app, { opacity: 0, duration: 0.25, ease: 'power1.out' });
  setLang(LANG === 'en' ? 'he' : 'en');
  closeLB(true);
  mount(view);
  scrollTo(Math.min(y, document.documentElement.scrollHeight - innerHeight), { immediate: true });
  if (ST) ST.refresh();
  if (G && !reduce) await G.to(app, { opacity: 1, duration: 0.35, ease: 'power1.out', clearProps: 'opacity' });
  busy = false;
}

function initHeader() {
  headerText();
  const lb = $('#langBtn');
  if (lb) lb.addEventListener('click', switchLang);
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (y > lastY + 4 && y > 160) hdr.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 160) hdr.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });
}

/* ───────── cursor: takes the project's shape and colour ───────── */
function initCursor() {
  if (!finePointer || reduce) return;
  const c = $('#cursor'), icon = $('.cursor__icon', c);
  document.body.classList.add('has-cursor');
  let x = -100, y = -100, cx = x, cy = y;
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    const t = e.target instanceof Element ? e.target : null;
    const open = t && t.closest('[data-cursor="open"]'), zoom = !open && t && t.closest('[data-cursor="zoom"]');
    const link = !open && !zoom && t && t.closest('a, button, [role="button"], .lb__stage');
    const inField = !open && !zoom && !link && t && t.closest('.hero');
    const host = (open || zoom) && (open || zoom).closest('[data-shape]');
    c.classList.toggle('is-open', !!open); c.classList.toggle('is-zoom', !!zoom); c.classList.toggle('is-link', !!link); c.classList.toggle('is-field', !!inField);
    c.classList.toggle('is-dark', !!(t && t.closest('[data-dark], .lb')));
    c.classList.toggle('is-hidden', !!(t && t.closest('.lb__stage') && $('#lbLoupe').classList.contains('is-on')));
    if (host) { c.dataset.shape = host.dataset.shape; c.style.setProperty('--c', host.dataset.c); c.style.setProperty('--on', host.dataset.on); }
    else { c.dataset.shape = ''; }
    icon.textContent = open ? fwd() : zoom ? '+' : '';
  }, { passive: true });
  document.addEventListener('pointerleave', () => c.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => c.classList.remove('is-hidden'));
  const loop = () => { cx += (x - cx) * 0.25; cy += (y - cy) * 0.25; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); };
  loop();
}

/* ───────── lightbox with detail loupe ───────── */
const lb = { el: $('#lb'), img: $('#lbImg'), stage: $('#lbStage'), loupe: $('#lbLoupe'), list: [], i: 0, opener: null };
function lbList() {
  return $$('[data-idx]', app).sort((a, b) => a.dataset.idx - b.dataset.idx)
    .filter((f, k, arr) => k === 0 || f.dataset.idx !== arr[k - 1].dataset.idx)
    .map(f => { const im = $('img', f); return { src: im.getAttribute('src'), alt: im.alt || f.getAttribute('aria-label') || '' }; });
}
function lbShow(i) {
  lb.i = (i + lb.list.length) % lb.list.length;
  const it = lb.list[lb.i];
  lb.img.src = it.src; lb.img.alt = it.alt;
  lb.loupe.style.backgroundImage = `url("${it.src}")`;
}
function openLB(fig) {
  lb.list = lbList(); lb.opener = fig;
  const host = fig.closest('[data-shape]');
  if (host) { lb.el.style.setProperty('--c', host.dataset.c); lb.el.style.setProperty('--on', host.dataset.on); }
  lb.el.setAttribute('aria-label', UI.image);
  $('#lbPrev').setAttribute('aria-label', UI.prev); $('#lbNext').setAttribute('aria-label', UI.nextImg); $('#lbClose').setAttribute('aria-label', S.close);
  const k = lb.list.findIndex(it => it.src === $('img', fig).getAttribute('src'));
  lbShow(k < 0 ? 0 : k);
  lb.el.hidden = false; lock(true);
  requestAnimationFrame(() => lb.el.classList.add('is-open'));
  const src = $('img', fig);
  if (motion && src) {
    const from = src.getBoundingClientRect();
    const run = () => G.fromTo(lb.img, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' });
    lb.img.decode ? lb.img.decode().then(run, run) : run();
  }
  $('#lbClose').focus();
}
function closeLB(silent) {
  if (lb.el.hidden) return;
  lb.el.classList.remove('is-open'); lb.loupe.classList.remove('is-on');
  const done = () => { lb.el.hidden = true; if (G) G.set(lb.img, { clearProps: 'all' }); };
  silent ? done() : setTimeout(done, 350);
  if (!silent) { lock(false); lb.opener && lb.opener.focus({ preventScroll: true }); }
}
function initLB() {
  $('#lbClose').addEventListener('click', () => closeLB());
  $('#lbPrev').addEventListener('click', () => lbShow(lb.i - 1));
  $('#lbNext').addEventListener('click', () => lbShow(lb.i + 1));
  lb.stage.addEventListener('click', e => { if (e.target === lb.stage) closeLB(); });
  lb.stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = lb.img.getBoundingClientRect();
    const inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
    lb.loupe.classList.toggle('is-on', inside);
    if (!inside) return;
    const Z = Math.max(2.2, (lb.img.naturalWidth / r.width) * 1.15);
    lb.loupe.style.backgroundSize = `${r.width * Z}px ${r.height * Z}px`;
    lb.loupe.style.backgroundPosition = `${-((e.clientX - r.left) * Z - 120)}px ${-((e.clientY - r.top) * Z - 120)}px`;
    lb.loupe.style.translate = `${e.clientX}px ${e.clientY}px`;
  });
  lb.stage.addEventListener('pointerleave', () => lb.loupe.classList.remove('is-on'));
}

/* ───────── global events ───────── */
document.addEventListener('click', e => {
  const t = e.target instanceof Element ? e.target : null; if (!t) return;
  const sc = t.closest('[data-scroll]');
  if (sc) {
    e.preventDefault();
    if (view && view.type === 'home') scrollTo($('#' + sc.dataset.scroll), { duration: 1.8 });
    else { pendingScroll = sc.dataset.scroll; location.hash = '#/'; }
    return;
  }
  const home = t.closest('[data-home]');
  if (home && view && view.type === 'home') { e.preventDefault(); scrollTo(0, { duration: 1.8 }); return; }
  const card = t.closest('[data-flip]');
  if (card && motion) {
    const im = $('.wcard__img img', card);
    if (im) {
      const box = $('.wcard__img', card), prev = box.style.transform;
      box.style.transition = 'none'; box.style.transform = 'none';
      flipFrom = { slug: card.dataset.slug, src: im.currentSrc || im.getAttribute('src'), rect: im.getBoundingClientRect() };
      box.style.transform = prev; box.offsetWidth; box.style.transition = '';
    }
    return; // the link's own hash change does the rest
  }
  const cp = t.closest('[data-copy]');
  if (cp) { copy(cp.dataset.copy, cp); return; }
  const fig = t.closest('[data-idx]');
  if (fig && app.contains(fig)) openLB(fig);
});
document.addEventListener('keydown', e => {
  if (!lb.el.hidden) {
    if (e.key === 'Escape') closeLB();
    const rtl = LANG !== 'en';
    if (e.key === 'ArrowLeft') lbShow(lb.i + (rtl ? 1 : -1));
    if (e.key === 'ArrowRight') lbShow(lb.i + (rtl ? -1 : 1));
    return;
  }
  const fig = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-idx]');
  if (fig && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLB(fig); return; }
  if (e.key === 'Escape' && view && view.type === 'case') location.hash = '#/';
});
function copy(text, btn) {
  const done = () => {
    const prev = btn.innerHTML; btn.classList.add('is-done'); btn.innerHTML = CHECK_SVG + $('span', btn).outerHTML;
    setTimeout(() => { btn.classList.remove('is-done'); btn.innerHTML = prev; }, 1500);
  };
  const fallback = () => { const ta = Object.assign(document.createElement('textarea'), { value: text }); ta.style.cssText = 'position:fixed;top:-999px'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (_) {} ta.remove(); done(); };
  try { navigator.clipboard.writeText(text).then(done, fallback); } catch (_) { fallback(); }
}
let rz;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { fitAll(); ST && ST.refresh(); }, 160); });

/* ───────── boot ───────── */
async function boot() {
  let saved = 'he';
  try { saved = localStorage.getItem('portfolio-lang') || 'he'; } catch (_) {}
  setLang(saved);
  $('#loaderA').textContent = S.introA;
  $('#loaderB').textContent = S.introB;
  initHeader(); initCursor(); initLB();
  lock(true);
  await go(parse(), true);

  const imgs = $$('img[fetchpriority="high"]', app).slice(0, 6);
  const ready = Promise.all(imgs.map(im => im.complete ? 0 : new Promise(r => { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); })));
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => { fitAll(); ST && ST.refresh(); });
  addEventListener('load', () => { fitAll(); ST && ST.refresh(); });
  if (!reduce) await Promise.race([Promise.all([ready, fontsReady, new Promise(r => setTimeout(r, 1200))]), new Promise(r => setTimeout(r, 5000))]);

  fitAll(); ST && ST.refresh();
  document.body.classList.remove('is-loading');
  const loader = $('#loader');
  if (!motion) { loader.style.display = 'none'; lock(false); return; }
  G.to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut', onComplete: () => { loader.style.display = 'none'; } });
  await (view.type === 'home' ? introHome() : introCase());
  lock(false);
}
boot();
})();
