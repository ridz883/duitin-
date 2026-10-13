// src/utils/confetti.js
export const triggerConfetti = () => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
  const confettiCount = 70;
  const confettis = Array.from({ length: confettiCount }).map(() => ({
    x: window.innerWidth * (0.2 + Math.random() * 0.6),
    y: window.innerHeight * 0.4,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 12,
    vy: (Math.random() - 1) * 10 - 4,
    angle: Math.random() * 360,
    vAngle: (Math.random() - 0.5) * 10,
    alpha: 1
  }));

  let animationFrame;
  const startTime = Date.now();

  const render = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const elapsed = Date.now() - startTime;

    confettis.forEach(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.35; // gravitasi
      c.angle += c.vAngle;
      if (elapsed > 1600) c.alpha = Math.max(0, c.alpha - 0.03);

      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.translate(c.x, c.y);
      ctx.rotate((c.angle * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      ctx.restore();
    });

    if (elapsed < 2500) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };

  render();
};
