const body = document.body;
const lightToggle = document.querySelector('.light-toggle');
const lightLabel = document.querySelector('.light-label');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('.panel')];
const reveals = document.querySelectorAll('.reveal');
const progressBar = document.querySelector('.section-progress span');

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;

const updateLightPosition = () => {
  currentX += (targetX - currentX) * 0.12;
  currentY += (targetY - currentY) * 0.12;
  document.documentElement.style.setProperty('--mouse-x', `${currentX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${currentY}px`);
  requestAnimationFrame(updateLightPosition);
};

const setPointerPosition = (x, y) => {
  targetX = x;
  targetY = y;
};

window.addEventListener('pointermove', (event) => {
  setPointerPosition(event.clientX, event.clientY);
});

window.addEventListener('touchmove', (event) => {
  const touch = event.touches[0];
  if (touch) setPointerPosition(touch.clientX, touch.clientY);
}, { passive: true });

lightToggle.addEventListener('click', () => {
  const isOn = body.classList.toggle('light-on');
  lightToggle.setAttribute('aria-pressed', String(isOn));
  lightToggle.setAttribute('aria-label', isOn ? '关闭互动灯光' : '开启互动灯光');
  lightLabel.textContent = isOn ? 'LIGHT ON' : 'LIGHT OFF';
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

reveals.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
  revealObserver.observe(element);
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === entry.target.id);
    });
  });
}, { rootMargin: '-38% 0px -52% 0px' });

sections.forEach((section) => sectionObserver.observe(section));

const updateScrollProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar.style.height = `${Math.min(progress * 100, 100)}%`;
};

window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);

updateLightPosition();
updateScrollProgress();
