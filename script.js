const root = document.documentElement;
const body = document.body;
const scrollTrack = document.querySelector('.scroll-track');
const storyCards = [...document.querySelectorAll('.story-card')];
const navStops = [...document.querySelectorAll('.nav-stop')];
const statusIndex = document.querySelector('.status-index');
const statusName = document.querySelector('.status-name');
const infoToggle = document.querySelector('.info-toggle');
const aboutPanel = document.querySelector('.about-panel');
const panelClose = document.querySelector('.panel-close');
const jumpLinks = [...document.querySelectorAll('[data-jump]')];
const sceneGlow = document.querySelector('.scene-glow');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const cameraKeyframes = [
  { t: 0, x: 0, y: 10, z: 850, yaw: 0, pitch: 0 },
  { t: 0.1, x: 0, y: 0, z: 120, yaw: 0, pitch: 0 },
  { t: 0.2, x: -110, y: 10, z: -1050, yaw: -11, pitch: 0 },
  { t: 0.28, x: 150, y: 0, z: -2050, yaw: 17, pitch: -1 },
  { t: 0.38, x: 0, y: 0, z: -3200, yaw: 0, pitch: 0 },
  { t: 0.48, x: 130, y: 10, z: -4100, yaw: 15, pitch: 0 },
  { t: 0.56, x: -160, y: -10, z: -4650, yaw: -17, pitch: 1 },
  { t: 0.66, x: 0, y: 0, z: -5550, yaw: 0, pitch: 0 },
  { t: 0.75, x: -150, y: 10, z: -6450, yaw: -16, pitch: 0 },
  { t: 0.83, x: 150, y: -5, z: -6950, yaw: 17, pitch: -1 },
  { t: 0.92, x: 0, y: 0, z: -7950, yaw: 0, pitch: 0 },
  { t: 1, x: 0, y: 0, z: -8750, yaw: 0, pitch: 0 }
];

const stops = [
  { index: '00', name: 'ENTRANCE', glow: 'rgba(238, 218, 173, 0.16)' },
  { index: '01', name: 'SYMBIOSIS', glow: 'rgba(164, 177, 118, 0.22)' },
  { index: '02', name: 'BOUNDLESS', glow: 'rgba(235, 221, 194, 0.22)' },
  { index: '03', name: 'AFTERGLOW', glow: 'rgba(241, 181, 82, 0.2)' },
  { index: '04', name: 'CONTACT', glow: 'rgba(201, 213, 166, 0.18)' }
];

let targetProgress = 0;
let renderedProgress = 0;
let pointerX = 0;
let pointerY = 0;
let currentStop = -1;
let resizeFrame;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, amount) => start + (end - start) * amount;
const ease = (value) => value * value * (3 - 2 * value);
const getScrollLimit = () => Math.max(scrollTrack.offsetHeight - window.innerHeight, 1);

const getCameraAt = (progress) => {
  let start = cameraKeyframes[0];
  let end = cameraKeyframes[cameraKeyframes.length - 1];

  for (let index = 0; index < cameraKeyframes.length - 1; index += 1) {
    if (progress >= cameraKeyframes[index].t && progress <= cameraKeyframes[index + 1].t) {
      start = cameraKeyframes[index];
      end = cameraKeyframes[index + 1];
      break;
    }
  }

  const range = Math.max(end.t - start.t, 0.0001);
  const localProgress = ease(clamp((progress - start.t) / range, 0, 1));
  return {
    x: lerp(start.x, end.x, localProgress),
    y: lerp(start.y, end.y, localProgress),
    z: lerp(start.z, end.z, localProgress),
    yaw: lerp(start.yaw, end.yaw, localProgress),
    pitch: lerp(start.pitch, end.pitch, localProgress)
  };
};

const findActiveStop = (progress) => {
  if (progress < 0.13) return 0;
  if (progress < 0.39) return 1;
  if (progress < 0.67) return 2;
  if (progress < 0.89) return 3;
  return 4;
};

const updateStop = (index) => {
  if (index === currentStop) return;
  currentStop = index;
  const stop = stops[index];
  storyCards.forEach((card, cardIndex) => card.classList.toggle('active', cardIndex === index));
  navStops.forEach((button, buttonIndex) => button.classList.toggle('active', buttonIndex === index));
  statusIndex.textContent = stop.index;
  statusName.textContent = stop.name;
  sceneGlow.style.background = `radial-gradient(circle at 50% 20%, ${stop.glow}, transparent 45%)`;
};

const render = () => {
  renderedProgress = lerp(renderedProgress, targetProgress, prefersReducedMotion ? 1 : 0.065);
  if (Math.abs(renderedProgress - targetProgress) < 0.0001) renderedProgress = targetProgress;
  const camera = getCameraAt(renderedProgress);
  const parallaxYaw = prefersReducedMotion ? 0 : pointerX * 1.4;
  const parallaxPitch = prefersReducedMotion ? 0 : pointerY * -0.8;

  root.style.setProperty('--camera-x', `${-camera.x}px`);
  root.style.setProperty('--camera-y', `${-camera.y}px`);
  root.style.setProperty('--camera-z', `${-camera.z}px`);
  root.style.setProperty('--camera-yaw', `${-camera.yaw + parallaxYaw}deg`);
  root.style.setProperty('--camera-pitch', `${-camera.pitch + parallaxPitch}deg`);
  root.style.setProperty('--progress', `${renderedProgress * 100}%`);
  updateStop(findActiveStop(renderedProgress));
  requestAnimationFrame(render);
};

const updateTargetProgress = () => {
  targetProgress = clamp(window.scrollY / getScrollLimit(), 0, 1);
  body.classList.toggle('has-scrolled', targetProgress > 0.015);
};

const scrollToProgress = (progress) => {
  window.scrollTo({ top: getScrollLimit() * clamp(progress, 0, 1), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
};

const setPanel = (open) => {
  aboutPanel.classList.toggle('open', open);
  aboutPanel.setAttribute('aria-hidden', String(!open));
  infoToggle.setAttribute('aria-expanded', String(open));
};

window.addEventListener('scroll', updateTargetProgress, { passive: true });
window.addEventListener('pointermove', (event) => {
  pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
  pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(updateTargetProgress);
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Home') scrollToProgress(0);
  if (event.key === 'End') scrollToProgress(1);
});
navStops.forEach((button) => button.addEventListener('click', () => scrollToProgress(Number(button.dataset.progress))));
jumpLinks.forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  scrollToProgress(Number(link.dataset.jump));
}));
infoToggle.addEventListener('click', () => setPanel(infoToggle.getAttribute('aria-expanded') !== 'true'));
panelClose.addEventListener('click', () => setPanel(false));
const hideLoader = () => body.classList.remove('is-loading');
if (document.readyState === 'complete') {
  window.setTimeout(hideLoader, 450);
} else {
  window.addEventListener('load', () => window.setTimeout(hideLoader, 450), { once: true });
}
window.setTimeout(hideLoader, 1800);

updateTargetProgress();
updateStop(0);
render();