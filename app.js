const canvas = document.getElementById('sky');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['#ffffff', '#b9c9ff', '#ffd6ec', '#b89aff'];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let stars = [];
  let orbitLights = [];
  let shootingStars = [];
  let lastFrame = 0;
  let lastMeteor = 0;
  const complimentBox = document.getElementById('compliment');
  const complimentText = complimentBox?.querySelector('p');
  const compliments = [
    'Сенің күлкің — менің ең жарық күнім.',
    'Сен осы ғаламдағы ең әдемі жұлдызсың.',
    'Сен барда әр күнім ерекше жарқырайды.',
    'Жүрегімнің ең сүйікті мекені — сен.',
    'Сенің мейірімің жұлдыздардан да жылы.',
    'Сен менің өміріме ғажайып түс бердің.',
    'Әлем кең болса да, жүрегім саған ғана жақын.',
    'Сенің барың — менің ең үлкен бақытым.',
    'Сен қараңғы түндегі ең әдемі жарықсың.',
    'Әр жұлдыз саған деген бір әдемі тілегімді сақтайды.'
  ];
  let hideToast;

  function resize() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const count = Math.min(1200, Math.max(360, Math.floor(width * height / 1050)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.35 + .35,
      alpha: Math.random() * .65 + .2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * .0018 + .0004,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    const lightCount = width < 600 ? 460 : 900;
    orbitLights = Array.from({ length: lightCount }, (_, index) => ({
      angle: Math.random() * Math.PI * 2,
      ring: Math.random(),
      speed: (Math.random() * .00011 + .000035) * (index % 2 ? 1 : -1),
      size: Math.random() * 1.45 + .35,
      alpha: Math.random() * .65 + .25,
      color: colors[Math.floor(Math.random() * colors.length)],
      x: 0, y: 0
    }));
  }

  function addMeteor(now) {
    if (reducedMotion || now - lastMeteor < 1600 + Math.random() * 3000) return;
    lastMeteor = now;
    shootingStars.push({
      x: Math.random() * width * .8 + width * .1,
      y: Math.random() * height * .38,
      vx: 7 + Math.random() * 6,
      vy: 3 + Math.random() * 4,
      life: 0,
      duration: 35 + Math.random() * 20
    });
  }

  function draw(now) {
    if (document.hidden) {
      requestAnimationFrame(draw);
      return;
    }
    if (reducedMotion && now - lastFrame < 120) {
      requestAnimationFrame(draw);
      return;
    }
    lastFrame = now;
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      const twinkle = reducedMotion ? 1 : .68 + Math.sin(now * star.speed + star.phase) * .32;
      ctx.globalAlpha = star.alpha * twinkle;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const cx = width / 2;
    const cy = height * (width < 700 ? .42 : .46);
    const radiusX = Math.min(width * .36, 380);
    const radiusY = Math.min(height * .2, 185);
    for (const light of orbitLights) {
      if (!reducedMotion) light.angle += light.speed * 16;
      const spread = .66 + light.ring * .55;
      const x = cx + Math.cos(light.angle) * radiusX * spread;
      const y = cy + Math.sin(light.angle) * radiusY * spread;
      light.x = x;
      light.y = y;
      const perspective = .72 + (Math.sin(light.angle) + 1) * .14;
      ctx.globalAlpha = light.alpha * perspective;
      ctx.fillStyle = light.color;
      ctx.beginPath();
      ctx.arc(x, y, light.size * perspective, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    addMeteor(now);
    shootingStars = shootingStars.filter(meteor => meteor.life < meteor.duration);
    for (const meteor of shootingStars) {
      const fade = Math.sin(Math.PI * meteor.life / meteor.duration);
      const tail = 90 * fade;
      const gradient = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - tail, meteor.y - tail * .45);
      gradient.addColorStop(0, `rgba(255,255,255,${fade})`);
      gradient.addColorStop(1, 'rgba(255,190,228,0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(meteor.x - tail, meteor.y - tail * .45);
      ctx.stroke();
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.life += 1;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  function showCompliment(x, y) {
    if (!complimentBox || !complimentText) return;
    complimentText.textContent = compliments[Math.floor(Math.random() * compliments.length)];
    complimentBox.style.left = `${Math.max(150, Math.min(width - 150, x))}px`;
    complimentBox.style.top = `${Math.max(90, Math.min(height - 70, y))}px`;
    complimentBox.classList.add('visible');
    complimentBox.setAttribute('aria-hidden', 'false');
    clearTimeout(hideToast);
    hideToast = setTimeout(() => {
      complimentBox.classList.remove('visible');
      complimentBox.setAttribute('aria-hidden', 'true');
    }, 3600);
  }

  canvas.addEventListener('pointerdown', event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let nearest = null;
    let nearestDistance = 25 * 25;
    for (const star of stars) {
      const dx = star.x - x;
      const dy = star.y - y;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) { nearest = star; nearestDistance = distance; }
    }
    for (const light of orbitLights) {
      const dx = light.x - x;
      const dy = light.y - y;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) { nearest = light; nearestDistance = distance; }
    }
    if (nearest) showCompliment(x, y);
  });

  complimentBox?.querySelector('button')?.addEventListener('click', () => {
    complimentBox.classList.remove('visible');
    complimentBox.setAttribute('aria-hidden', 'true');
  });
  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(draw);
}
