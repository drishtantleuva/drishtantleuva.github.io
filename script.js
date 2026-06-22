// Scroll-triggered reveals
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Animated counters (run once when stats scroll into view)
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = prefix + (target * easeOut(p)).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll('.stat-num').forEach((el) => statObserver.observe(el));

// Project slider — arrows, drag-to-scroll, progress thumb
(function () {
  const slider = document.getElementById('projSlider');
  if (!slider) return;
  const thumb = document.getElementById('projThumb');
  const prev = document.getElementById('projPrev');
  const next = document.getElementById('projNext');
  const step = () => {
    const card = slider.querySelector('.card');
    return card ? card.getBoundingClientRect().width + 26 : 440;
  };
  const maxScroll = () => slider.scrollWidth - slider.clientWidth;

  function update() {
    const max = maxScroll();
    const frac = slider.clientWidth / slider.scrollWidth;       // visible fraction
    const pos = max > 0 ? slider.scrollLeft / max : 0;          // 0..1 progress
    thumb.style.width = Math.max(12, frac * 100) + '%';
    thumb.style.transform = `translateX(${pos * (100 / frac - 100)}%)`;
    prev.disabled = slider.scrollLeft <= 2;
    next.disabled = slider.scrollLeft >= max - 2;
  }
  slider.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  prev.addEventListener('click', () => slider.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => slider.scrollBy({ left: step(), behavior: 'smooth' }));

  // drag / swipe to scroll
  let down = false, startX = 0, startLeft = 0, moved = 0;
  slider.addEventListener('pointerdown', (e) => {
    down = true; moved = 0; startX = e.clientX; startLeft = slider.scrollLeft;
    slider.classList.add('dragging'); slider.setPointerCapture(e.pointerId);
  });
  slider.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX; moved = Math.abs(dx);
    slider.scrollLeft = startLeft - dx;
  });
  const end = () => { down = false; slider.classList.remove('dragging'); };
  slider.addEventListener('pointerup', end);
  slider.addEventListener('pointercancel', end);
  // prevent click navigation right after a drag
  slider.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

  // arrow keys when the slider region is focused/hovered
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next.click(); }
    if (e.key === 'ArrowLeft') { prev.click(); }
  });
  slider.tabIndex = 0;
  update();
})();

// Subtle hero parallax
const heroBg = document.querySelector('.hero-bg');
window.addEventListener(
  'scroll',
  () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = `translateY(${y * 0.25}px)`;
    }
  },
  { passive: true }
);
