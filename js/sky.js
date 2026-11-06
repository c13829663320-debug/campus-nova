/* Campus Nova · 天空背景组件（DAY / NIGHT） */
(function () {
  const mount = document.getElementById("sky");
  if (!mount) return;

  mount.innerHTML = `
    <div class="sky-day">
      <span class="sky-sun"></span>
      <span class="sky-rays"></span>
      <span class="cloud cloud-1"></span>
      <span class="cloud cloud-2"></span>
      <span class="cloud cloud-3"></span>
    </div>
    <div class="sky-night">
      <span class="aurora aurora-1"></span>
      <span class="aurora aurora-2"></span>
      <span class="sky-horizon"></span>
    </div>
  `;

  const canvas = document.createElement("canvas");
  canvas.className = "sky-particles";
  mount.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  let width = 0;
  let height = 0;
  let dpr = 1;
  let dots = [];
  let raf = 0;
  let running = false;

  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = mount.clientWidth;
    height = mount.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    const max = theme === "dark" ? 110 : 38;
    const count = Math.min(max, Math.round(width / (theme === "dark" ? 14 : 34)));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: theme === "dark" ? Math.random() * 1.2 + .35 : Math.random() * 1.6 + .5,
      speed: Math.random() * .55 + .2,
      sway: Math.random() * Math.PI * 2,
      alpha: Math.random() * .45 + .28,
      base: Math.random() * height
    }));
  }

  function paint(time) {
    ctx.clearRect(0, 0, width, height);
    const dark = theme === "dark";
    for (const dot of dots) {
      const x = dot.x + Math.sin(time * .00018 * dot.speed + dot.sway) * 12;
      const y = (dot.base + time * .012 * dot.speed) % (height + 40);
      const flicker = .55 + .45 * Math.sin(time * .0011 * dot.speed + dot.sway);
      if (dark) {
        ctx.fillStyle = `rgba(31, 253, 145, ${dot.alpha * .22 * flicker})`;
        ctx.beginPath();
        ctx.arc(x, y, dot.r * 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(214, 255, 238, ${dot.alpha * flicker})`;
      } else {
        ctx.fillStyle = `rgba(240, 184, 92, ${dot.alpha * .78 * flicker})`;
      }
      ctx.beginPath();
      ctx.arc(x, y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(time) {
    paint(time);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function resize() {
    measure();
    seed();
    paint(performance.now());
  }

  function setTheme(next) {
    theme = next === "dark" ? "dark" : "light";
    mount.dataset.theme = theme;
    seed();
    paint(performance.now());
    start();
  }

  measure();
  seed();
  paint(0);
  start();

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  window.NovaSky = { setTheme };
})();
