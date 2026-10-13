const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');

function closeMenu() {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  mobileNav.hidden = true;
}

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
    mobileNav.hidden = open;
  });
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 650) closeMenu();
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const sections = [...document.querySelectorAll('main section[id]')];
const navigationLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const href = `#${entry.target.id}`;
      navigationLinks.forEach((link) => {
        if (link.getAttribute('href') === href) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-24% 0px -65% 0px' });
  sections.forEach((section) => sectionObserver.observe(section));
}

let scrollFrame = 0;
function updateScrollProgress() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / range));
    document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
    scrollFrame = 0;
  });
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
window.addEventListener('load', updateScrollProgress);
if (document.fonts?.ready) document.fonts.ready.then(updateScrollProgress);
updateScrollProgress();

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionToggles = [...document.querySelectorAll('.motion-toggle')];
const revealTargets = [...document.querySelectorAll('.reveal')];
let savedMotion = null;
try { savedMotion = window.localStorage.getItem('portfolio-motion'); } catch { /* Storage may be unavailable. */ }

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }) : null;

function setMotion(enabled, save = false) {
  if (save) {
    savedMotion = enabled ? 'on' : 'off';
    try { window.localStorage.setItem('portfolio-motion', savedMotion); } catch { /* Continue without persistence. */ }
  }
  document.documentElement.classList.toggle('motion-override', enabled && motionPreference.matches);
  document.documentElement.classList.toggle('motion-ready', enabled && Boolean(revealObserver));
  document.documentElement.classList.toggle('motion-paused', !enabled);
  motionToggles.forEach((button) => {
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Pausar animaciones' : 'Activar animaciones');
    const state = button.querySelector('.motion-state');
    if (state) state.textContent = enabled ? 'Sí' : 'No';
  });
  if (!revealObserver) return;
  revealObserver.disconnect();
  revealTargets.forEach((target) => target.classList.remove('is-visible'));
  if (enabled) revealTargets.forEach((target) => revealObserver.observe(target));
}

motionToggles.forEach((button) => button.addEventListener('click', () => {
  setMotion(button.getAttribute('aria-pressed') !== 'true', true);
}));
motionPreference.addEventListener?.('change', () => {
  if (savedMotion === null) setMotion(!motionPreference.matches);
});
setMotion(savedMotion === 'on' || (savedMotion === null && !motionPreference.matches));
