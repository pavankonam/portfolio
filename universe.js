'use strict';

// A procedural torus-knot nebula. All artwork is drawn locally; no video,
// rendering library, tracking, API key or remote animation asset is required.
(() => {
  const canvas = document.querySelector('#universe');
  const hero = document.querySelector('.hero');
  const toggle = document.querySelector('#motion-toggle');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return; // The CSS nebula remains as a static fallback.

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let visible = true;
  let frame = 0;
  let lastTime = 0;
  let time = 0;
  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let compact = false;
  let particles = [];
  let stars = [];

  // Seeded randomness keeps the artwork stable through resizing and pausing.
  let seed = 417;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const tau = Math.PI * 2;
  function buildParticles() {
    seed = 417;
    particles = Array.from({ length: compact ? 2900 : 5800 }, () => ({
      t: random() * tau,
      angle: random() * tau,
      spread: Math.pow(random(), 2.3) * 0.24,
      size: 0.45 + random() * 1.1,
      light: 0.28 + random() * 0.7,
      color: random()
    }));
    stars = Array.from({ length: compact ? 130 : 270 }, () => ({
      x: random(), y: random(), size: 0.25 + random() * 1.1,
      phase: random() * tau, depth: 0.2 + random() * 0.8
    }));
  }

  function project(x, y, z, rotY, rotX, scale, cx, cy) {
    const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
    const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
    const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
    const perspective = 3.8 / (3.8 + z2);
    return [cx + x1 * scale * perspective, cy + y1 * scale * perspective, perspective, z2];
  }

  function draw() {
    if (!width || !height) return;
    const ctx = context;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, width, height);
    const cx = width * (compact ? 0.63 : 0.745);
    const cy = height * (compact ? 0.765 : 0.48);
    const scale = compact ? Math.min(width * 0.46, 230) : Math.min(width * 0.265, height * 0.405);
    const rotY = -0.28 + time * 0.11 + smoothX * 0.24;
    const rotX = 0.62 + Math.sin(time * 0.13) * 0.14 + smoothY * 0.18;

    const ambient = ctx.createRadialGradient(cx, cy, scale * 0.08, cx, cy, scale * 1.6);
    ambient.addColorStop(0, '#21143b');
    ambient.addColorStop(0.38, '#140e27');
    ambient.addColorStop(0.72, '#090916');
    ambient.addColorStop(1, '#05050a');
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, width, height);

    for (const star of stars) {
      const opacity = 0.12 + (Math.sin(time * 0.35 + star.phase) + 1) * 0.18;
      const x = (star.x * width + Math.sin(time * 0.025 + star.phase) * 9 + smoothX * 9 * star.depth + width) % width;
      const y = (star.y * height + time * star.depth * 0.7 + smoothY * 7 * star.depth) % height;
      ctx.fillStyle = `rgba(194,182,233,${opacity})`;
      ctx.fillRect(x, y, star.size, star.size);
      if (star.size > 1.25) {
        ctx.fillStyle = `rgba(207,193,255,${opacity * 0.22})`;
        ctx.fillRect(x - 2, y + 0.4, 5, 0.6);
        ctx.fillRect(x + 0.4, y - 2, 0.6, 5);
      }
    }

    ctx.globalCompositeOperation = 'lighter';
    // Thin filaments define the flowing silhouette behind the particle cloud.
    for (let strand = 0; strand < 10; strand++) {
      ctx.beginPath();
      for (let i = 0; i <= 400; i++) {
        const t = i / 400 * tau;
        const r = 0.73 + 0.27 * Math.cos(3 * t + time * 0.14);
        const offset = (strand - 4.5) * 0.008;
        const point = project(
          (r + offset) * Math.cos(2 * t),
          (r + offset) * Math.sin(2 * t),
          0.36 * Math.sin(3 * t + time * 0.14) + offset,
          rotY, rotX, scale, cx, cy
        );
        if (i === 0) ctx.moveTo(point[0], point[1]);
        else ctx.lineTo(point[0], point[1]);
      }
      ctx.strokeStyle = strand % 3 === 0 ? 'rgba(172,127,248,0.095)' : 'rgba(107,157,231,0.045)';
      ctx.lineWidth = strand % 3 === 0 ? 1 : 0.6;
      ctx.stroke();
    }

    for (const particle of particles) {
      const t = particle.t + time * 0.085;
      const r = 0.73 + 0.27 * Math.cos(3 * t + time * 0.14);
      const envelope = particle.spread * (0.65 + Math.sin(t * 4 + time * 0.3) * 0.35);
      const spreadX = Math.cos(particle.angle) * envelope;
      const spreadY = Math.sin(particle.angle) * envelope;
      const p = project(
        (r + spreadX) * Math.cos(2 * t),
        (r + spreadX) * Math.sin(2 * t),
        0.36 * Math.sin(3 * t + time * 0.14) + spreadY,
        rotY, rotX, scale, cx, cy
      );
      const a = Math.min(0.92, particle.light * (0.48 + p[2] * 0.42));
      const size = particle.size * p[2] * (compact ? 0.8 : 1);
      const color = particle.color > 0.89 ? '245,209,179' : particle.color > 0.53 ? '178,130,249' : '121,166,240';
      if (particle.size > 1.35) {
        ctx.fillStyle = `rgba(${color},${a * 0.055})`;
        ctx.beginPath();
        ctx.arc(p[0], p[1], size * 4, 0, tau);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(${color},${a})`;
      ctx.fillRect(p[0], p[1], size, size);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function animate(timestamp) {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    // Cap at 30fps to keep the continuous artwork modest on laptop/mobile GPUs.
    if (timestamp - lastTime >= 1000 / 30) {
      time += lastTime ? Math.min((timestamp - lastTime) / 1000, 0.08) : 0;
      lastTime = timestamp;
      smoothX += (pointerX - smoothX) * 0.045;
      smoothY += (pointerY - smoothY) * 0.045;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }
  function syncAnimation() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function updateToggle() {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.querySelector('.motion-label').textContent = paused ? 'Resume motion' : 'Pause motion';
    toggle.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
    document.body.classList.toggle('motion-paused', paused);
  }
  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const nextCompact = width <= 760;
    if (nextCompact !== compact || !particles.length) {
      compact = nextCompact;
      buildParticles();
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || paused) return;
    const rect = hero.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / width - 0.5;
    pointerY = (event.clientY - rect.top) / height - 0.5;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  toggle.addEventListener('click', () => {
    paused = !paused;
    updateToggle();
    syncAnimation();
  });
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    updateToggle();
    syncAnimation();
  });
  document.addEventListener('visibilitychange', syncAnimation);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncAnimation();
  }, { threshold: 0 }).observe(hero);
  new ResizeObserver(resize).observe(hero);
  toggle.hidden = false;
  resize();
  updateToggle();
  syncAnimation();
})();
