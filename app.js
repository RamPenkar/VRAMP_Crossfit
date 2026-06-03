// ---- Data ---------------------------------------------------------------
// Edit titles/order freely. `slug` must match files in /videos and /posters.
const VIDEOS = [
  { slug: 'one-shot',        title: 'One Shot',          tag: 'Brand',   dur: 27 },
  { slug: 'martin',          title: 'Martin',            tag: 'Landing', dur: 59 },
  { slug: 'clouds',          title: 'Clouds',            tag: 'Visual',  dur: 11 },
  { slug: 'reel-01',         title: 'Field Notes 01',    tag: 'Reel',    dur: 30 },
  { slug: 'whiteboard',      title: 'Whiteboard',        tag: 'Explainer', dur: 57 },
  { slug: 'reel-02',         title: 'Field Notes 02',    tag: 'Reel',    dur: 23 },
  { slug: 'imtm',            title: 'IMTM',              tag: 'Brand',   dur: 70 },
  { slug: 'reel-03',         title: 'Field Notes 03',    tag: 'Reel',    dur: 16 },
  { slug: 'birthday-battle', title: 'Birthday Battle',   tag: 'Story',   dur: 139 },
  { slug: 'reel-04',         title: 'Field Notes 04',    tag: 'Reel',    dur: 20 },
];

// ---- Helpers ------------------------------------------------------------
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const fmtDur = s => {
  const m = Math.floor(s / 60), r = Math.round(s % 60);
  return m ? `${m}:${r.toString().padStart(2, '0')}` : `${r}s`;
};

// ---- Build grid ---------------------------------------------------------
const grid = $('#grid');

const tileHTML = (v, i) => `
  <article class="tile" data-index="${i}" data-slug="${v.slug}" tabindex="0" aria-label="Play ${v.title}">
    <div class="tile-media">
      <img src="posters/${v.slug}.jpg" alt="" loading="lazy" decoding="async" />
      <video muted loop playsinline preload="none" aria-hidden="true"></video>
    </div>
    <div class="tile-gradient"></div>
    <span class="tile-badge">${v.tag}</span>
    <div class="tile-play" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 5l12 7-12 7V5z" fill="currentColor"/></svg>
    </div>
    <div class="tile-meta">
      <div class="tile-title">${v.title}</div>
      <div class="tile-dur">${fmtDur(v.dur)}</div>
    </div>
  </article>
`;

grid.innerHTML = VIDEOS.map(tileHTML).join('');
const tiles = $$('.tile', grid);

// ---- Reveal on scroll ---------------------------------------------------
const reveal = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const i = Number(e.target.dataset.index || 0);
      e.target.style.transitionDelay = `${Math.min(i, 8) * 60}ms`;
      e.target.classList.add('in');
      reveal.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
tiles.forEach(t => reveal.observe(t));

// ---- Hover preview (desktop) -------------------------------------------
const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (canHover) {
  let active = null;
  tiles.forEach(tile => {
    const video = tile.querySelector('video');
    const slug = tile.dataset.slug;
    let primed = false;
    tile.addEventListener('mouseenter', () => {
      if (active && active !== video) { active.pause(); active.closest('.tile').classList.remove('preview'); }
      if (!primed) { video.src = `videos/${slug}.mp4`; primed = true; }
      video.currentTime = 0;
      const p = video.play();
      if (p) p.catch(() => {});
      tile.classList.add('preview');
      active = video;
    });
    tile.addEventListener('mouseleave', () => {
      video.pause();
      tile.classList.remove('preview');
      if (active === video) active = null;
    });
  });
}

// ---- Immersive viewer ---------------------------------------------------
const viewer    = $('#viewer');
const vVideo    = $('#viewerVideo');
const vTitle    = $('#viewerTitle');
const vCount    = $('#viewerCount');
const vClose    = $('#viewerClose');
const vPrev     = $('#viewerPrev');
const vNext     = $('#viewerNext');
let currentIdx  = -1;
let lastFocused = null;

const loadInto = (idx) => {
  currentIdx = (idx + VIDEOS.length) % VIDEOS.length;
  const v = VIDEOS[currentIdx];
  vVideo.poster = `posters/${v.slug}.jpg`;
  vVideo.src    = `videos/${v.slug}.mp4`;
  vTitle.textContent = v.title;
  vCount.textContent = `· ${String(currentIdx + 1).padStart(2, '0')} / ${String(VIDEOS.length).padStart(2, '0')}`;
  const p = vVideo.play();
  if (p) p.catch(() => {});
};

const openViewer = (idx) => {
  lastFocused = document.activeElement;
  viewer.classList.add('open');
  viewer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  loadInto(idx);
  vClose.focus({ preventScroll: true });
};

const closeViewer = () => {
  viewer.classList.remove('open');
  viewer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  vVideo.pause();
  vVideo.removeAttribute('src');
  vVideo.load();
  if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
};

tiles.forEach(tile => {
  const open = () => openViewer(Number(tile.dataset.index));
  tile.addEventListener('click', open);
  tile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
});

vClose.addEventListener('click', closeViewer);
vPrev.addEventListener('click', () => loadInto(currentIdx - 1));
vNext.addEventListener('click', () => loadInto(currentIdx + 1));

document.addEventListener('keydown', (e) => {
  if (!viewer.classList.contains('open')) return;
  if (e.key === 'Escape')     closeViewer();
  if (e.key === 'ArrowLeft')  loadInto(currentIdx - 1);
  if (e.key === 'ArrowRight') loadInto(currentIdx + 1);
});

// Click on backdrop closes
viewer.addEventListener('click', (e) => {
  if (e.target === viewer) closeViewer();
});

// Swipe gestures (mobile): swipe left/right to navigate, swipe down to close
let touchStart = null;
const stage = $('#viewerStage');
stage.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY, t: Date.now() };
}, { passive: true });
stage.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  const dt = Date.now() - touchStart.t;
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (dt < 500) {
    if (ax > 60 && ax > ay) {
      if (dx < 0) loadInto(currentIdx + 1); else loadInto(currentIdx - 1);
    } else if (dy > 90 && ay > ax) {
      closeViewer();
    }
  }
  touchStart = null;
}, { passive: true });

// ---- Year ---------------------------------------------------------------
$('#year').textContent = new Date().getFullYear();
