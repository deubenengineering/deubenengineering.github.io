(() => {
 const root = document.documentElement;
 const bar = document.getElementById('progress-bar');
 const links = [...document.querySelectorAll('.contents nav a')];
 const chapters = [...document.querySelectorAll('.chapter')];
 const smaller = document.getElementById('smaller');
 const larger = document.getElementById('larger');
 let size = 20;
 try { const stored = Number(localStorage.getItem('compassion-text-size')); if (stored >= 18 && stored <= 24) size = stored; } catch {}
 function setSize(value) {
  size = Math.max(18, Math.min(24, value));
  root.style.setProperty('--body-size', `${size}px`);
  smaller.disabled = size === 18; larger.disabled = size === 24;
  document.getElementById('size-status').textContent = `Text size: ${size} pixels`;
  try { localStorage.setItem('compassion-text-size', String(size)); } catch {}
  update();
 }
 function update() {
  const total = root.scrollHeight - window.innerHeight;
  bar.style.width = `${total > 0 ? Math.min(100, Math.max(0, window.scrollY / total * 100)) : 0}%`;
  let active = chapters[0].id;
  chapters.forEach(chapter => { if (chapter.getBoundingClientRect().top < window.innerHeight * .35) active = chapter.id; });
  links.forEach(link => { if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
 }
 smaller.addEventListener('click', () => setSize(size - 2));
 larger.addEventListener('click', () => setSize(size + 2));
 let pending = false;
 window.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(() => {update(); pending = false;}); } }, {passive:true});
 window.addEventListener('resize', update);
 window.addEventListener('load', update);
 if (document.fonts) document.fonts.ready.then(update);
 setSize(size);
})();
