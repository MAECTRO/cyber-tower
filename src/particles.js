// Particle effects engine & cosmos background renderer
// Manages sparks, slash effects, debris, and nebulae

class ParticleEngine {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.glitchTimer = 0;
    this.ionBeams = [];
    this.blackHoles = [];
    this.trails = [];
    this.shootingStars = [];
    this.shootingStarTimer = 0;
    this.slashes = [];
    this.hullDebris = [];

    // Multi-Layered Cosmos Starfield (3 Layers: Deep, Mid, Bright Pulsars)
    this.stars = [];
    this.nebulaTime = 0;
    this.isMobile = (typeof window !== 'undefined') && (window.innerWidth < 650 || window.innerHeight < 650 || ('ontouchstart' in window));
    this.initCosmos();
  }

  initCosmos() {
    this.stars = [];
    const starCount = this.isMobile ? 75 : 240;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * 2600,
        y: Math.random() * 2600,
        size: Math.random() * 2.2 + 0.6,
        baseAlpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 2.5 + 1.0,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: Math.floor(Math.random() * 3),
        color: Math.random() > 0.8 ? '#00ffff' : (Math.random() > 0.6 ? '#ff99ff' : '#ffffff')
      });
    }
  }

  reset() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.glitchTimer = 0;
    this.ionBeams = [];
    this.blackHoles = [];
    this.trails = [];
    this.shootingStars = [];
    this.slashes = [];
    this.hullDebris = [];
  }

  shake(intensity = 8, duration = 0.25) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  triggerGlitch(duration = 0.3) {
    this.glitchTimer = Math.max(this.glitchTimer, duration);
  }

  addSlashBlade(x1, y1, x2, y2, color = '#ff007f') {
    if (this.slashes.length >= 15) this.slashes.shift();
    this.slashes.push({
      x1, y1, x2, y2,
      color,
      alpha: 1.0,
      width: 5,
      life: 0.25,
      maxLife: 0.25
    });
  }

  addTrail(x, y, color = '#00ffff', size = 3) {
    if (this.trails.length > (this.isMobile ? 35 : 70)) return;
    this.trails.push({
      x,
      y,
      color,
      size,
      alpha: 0.75,
      life: 0.2,
      maxLife: 0.2
    });
  }

  addSparks(x, y, color = '#00ffff', count = 12, speedMult = 1, sizeMult = 1) {
    if (this.particles.length > (this.isMobile ? 35 : 60)) return;
    const finalCount = this.isMobile ? Math.min(count, 5) : count;
    for (let i = 0; i < finalCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 4 + 1.5) * speedMult;
      const life = Math.random() * 0.4 + 0.3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (Math.random() * 3 + 2) * sizeMult,
        color,
        alpha: 1,
        life,
        maxLife: life,
        decay: 1 / life
      });
    }
  }

  addExplosion(x, y, color = '#ff007f', isBig = false) {
    const count = isBig ? (this.isMobile ? 18 : 36) : (this.isMobile ? 8 : 16);
    const speed = isBig ? 8 : 4.5;
    this.addSparks(x, y, color, count, speed, isBig ? 2.2 : 1.3);
    this.addSparks(x, y, '#ffffff', Math.floor(count / 2), speed * 1.2, 1);
    this.addShockwave(x, y, color, isBig ? 95 : 50, isBig ? 0.4 : 0.25);
    this.shake(isBig ? 16 : 6, isBig ? 0.35 : 0.15);
  }

  addShockwave(x, y, color = '#00ffff', maxRadius = 60, duration = 0.3) {
    if (this.shockwaves.length >= 15) this.shockwaves.shift();
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      alpha: 1,
      duration,
      elapsed: 0
    });
  }

  addIonCannon(x, y) {
    if (this.ionBeams.length >= 8) this.ionBeams.shift();
    this.ionBeams.push({
      x,
      y,
      width: 52,
      alpha: 1,
      duration: 0.65,
      elapsed: 0
    });
    this.addShockwave(x, y, '#00ffff', 160, 0.45);
    this.shake(20, 0.45);
  }

  addBlackHole(x, y) {
    if (this.blackHoles.length >= 8) this.blackHoles.shift();
    this.blackHoles.push({
      x,
      y,
      radius: 38,
      duration: 3.5,
      elapsed: 0,
      angle: 0
    });
  }

  addDamageText(x, y, text, color = '#ffee00', isCrit = false) {
    if (this.floatingTexts.length >= 40) this.floatingTexts.shift();
    this.floatingTexts.push({
      x: x + (Math.random() * 16 - 8),
      y: y - 10,
      vy: -2,
      text: String(text),
      color,
      isCrit,
      alpha: 1,
      life: 0.7,
      maxLife: 0.7
    });
  }

  addHullDebris(x, y, color = '#00ffff', count = 4) {
    const maxAllowed = this.isMobile ? 25 : 55;
    if (this.hullDebris.length > maxAllowed) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.2;
      this.hullDebris.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 6,
        size: Math.random() * 5 + 3,
        color,
        life: 1.1,
        maxLife: 1.1
      });
    }
  }

  update(dt) {
    this.nebulaTime += dt;

    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) this.shakeIntensity = 0;
    }
    if (this.glitchTimer > 0) {
      this.glitchTimer -= dt;
    }

    this.shootingStarTimer += dt;
    if (this.shootingStarTimer >= 4.5 && Math.random() < 0.4) {
      this.shootingStarTimer = 0;
      const screenW = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1280;
      const screenH = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 720;
      this.shootingStars.push({
        x: Math.random() * (screenW * 0.8) + screenW * 0.2,
        y: Math.random() * Math.min(350, screenH * 0.45),
        vx: -(Math.random() * 12 + 10),
        vy: Math.random() * 7 + 5,
        length: Math.random() * 80 + 60,
        alpha: 1,
        life: 0.75
      });
    }

    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const sl = this.slashes[i];
      sl.life -= dt;
      sl.alpha = Math.max(0, sl.life / sl.maxLife);
      if (sl.life <= 0) {
        this.slashes.splice(i, 1);
      }
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx * dt * 60;
      ss.y += ss.vy * dt * 60;
      ss.life -= dt;
      ss.alpha = Math.max(0, ss.life / 0.75);
      if (ss.life <= 0) {
        this.shootingStars.splice(i, 1);
      }
    }

    for (let i = this.trails.length - 1; i >= 0; i--) {
      const t = this.trails[i];
      t.life -= dt;
      t.alpha = Math.max(0, t.life / t.maxLife);
      if (t.life <= 0) {
        this.trails.splice(i, 1);
      }
    }

    for (let i = this.hullDebris.length - 1; i >= 0; i--) {
      const d = this.hullDebris[i];
      d.life -= dt;
      d.x += d.vx * dt * 60;
      d.y += d.vy * dt * 60;
      d.vx *= 0.94;
      d.vy *= 0.94;
      d.rot += d.vRot * dt;
      if (d.life <= 0) {
        this.hullDebris.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.elapsed += dt;
      const progress = s.elapsed / s.duration;
      s.radius = 5 + (s.maxRadius - 5) * Math.sin((progress * Math.PI) / 2);
      s.alpha = Math.max(0, 1 - progress);
      if (s.elapsed >= s.duration) {
        this.shockwaves.splice(i, 1);
      }
    }

    for (let i = this.ionBeams.length - 1; i >= 0; i--) {
      const b = this.ionBeams[i];
      b.elapsed += dt;
      b.alpha = Math.max(0, 1 - (b.elapsed / b.duration));
      if (b.elapsed >= b.duration) {
        this.ionBeams.splice(i, 1);
      }
    }

    for (let i = this.blackHoles.length - 1; i >= 0; i--) {
      const bh = this.blackHoles[i];
      bh.elapsed += dt;
      bh.angle += dt * 8;
      if (bh.elapsed >= bh.duration) {
        this.blackHoles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy * dt * 60;
      t.life -= dt;
      t.alpha = Math.max(0, t.life / t.maxLife);
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- BREATHTAKING DEEP SPACE COSMOS RENDERING ---
  drawSynthwaveBackground(ctx, width, height, biomeId = 'neon_city') {
    ctx.save();

    let spaceColorTop = '#020208';
    let spaceColorMid = '#060317';
    let spaceColorBottom = '#020713';
    let nebColor1 = 'rgba(0, 255, 255, 0.18)';
    let nebColor2 = 'rgba(255, 0, 127, 0.15)';
    let nebColor3 = 'rgba(157, 0, 255, 0.14)';
    let ringColor = 'rgba(0, 255, 255, 0.4)';

    if (biomeId === 'matrix_core') {
      spaceColorTop = '#010803';
      spaceColorMid = '#031408';
      spaceColorBottom = '#010502';
      nebColor1 = 'rgba(57, 255, 20, 0.18)';
      nebColor2 = 'rgba(0, 255, 200, 0.14)';
      nebColor3 = 'rgba(10, 60, 30, 0.22)';
      ringColor = 'rgba(57, 255, 20, 0.45)';
    } else if (biomeId === 'magma_foundry') {
      spaceColorTop = '#0a0104';
      spaceColorMid = '#170308';
      spaceColorBottom = '#080102';
      nebColor1 = 'rgba(255, 85, 0, 0.22)';
      nebColor2 = 'rgba(255, 0, 60, 0.16)';
      nebColor3 = 'rgba(255, 200, 0, 0.12)';
      ringColor = 'rgba(255, 100, 0, 0.5)';
    }

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, spaceColorTop);
    bgGrad.addColorStop(0.5, spaceColorMid);
    bgGrad.addColorStop(1, spaceColorBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const drift1X = width * 0.3 + Math.sin(this.nebulaTime * 0.15) * 60;
    const drift1Y = height * 0.35 + Math.cos(this.nebulaTime * 0.12) * 50;
    const nebGrad1 = ctx.createRadialGradient(drift1X, drift1Y, 30, drift1X, drift1Y, 480);
    nebGrad1.addColorStop(0, nebColor1);
    nebGrad1.addColorStop(0.6, nebColor3);
    nebGrad1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nebGrad1;
    ctx.beginPath();
    ctx.arc(drift1X, drift1Y, 480, 0, Math.PI * 2);
    ctx.fill();

    const drift2X = width * 0.75 + Math.cos(this.nebulaTime * 0.18) * 70;
    const drift2Y = height * 0.65 + Math.sin(this.nebulaTime * 0.14) * 60;
    const nebGrad2 = ctx.createRadialGradient(drift2X, drift2Y, 40, drift2X, drift2Y, 520);
    nebGrad2.addColorStop(0, nebColor2);
    nebGrad2.addColorStop(0.5, nebColor1);
    nebGrad2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nebGrad2;
    ctx.beginPath();
    ctx.arc(drift2X, drift2Y, 520, 0, Math.PI * 2);
    ctx.fill();

    const planetX = width * 0.82;
    const planetY = height * 0.22;
    const planetRadius = Math.min(width, height) * 0.11;

    ctx.save();
    ctx.fillStyle = '#050711';
    ctx.shadowColor = ringColor;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
    ctx.fill();

    const atmoGrad = ctx.createRadialGradient(planetX - planetRadius * 0.4, planetY - planetRadius * 0.4, planetRadius * 0.6, planetX, planetY, planetRadius);
    atmoGrad.addColorStop(0, 'rgba(0,0,0,0)');
    atmoGrad.addColorStop(0.85, 'rgba(0,0,0,0)');
    atmoGrad.addColorStop(1, ringColor);
    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(planetX, planetY, planetRadius * 1.8, planetRadius * 0.45, Math.PI / 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 📡 Sleek Cyber Radar Sweep Beam
    const scanAngle = this.nebulaTime * 0.9;
    const cx = width / 2;
    const cy = height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    if (typeof ctx.createConicGradient === 'function') {
      const radarSweepGrad = ctx.createConicGradient(scanAngle, 0, 0);
      radarSweepGrad.addColorStop(0, 'rgba(0, 255, 255, 0.08)');
      radarSweepGrad.addColorStop(0.12, 'rgba(0, 255, 255, 0.0)');
      radarSweepGrad.addColorStop(1, 'rgba(0, 255, 255, 0.0)');
      ctx.fillStyle = radarSweepGrad;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(width, height), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    for (const s of this.stars) {
      const sx = s.x % width;
      const sy = s.y % height;
      const twinkle = s.baseAlpha * (0.6 + 0.4 * Math.sin(this.nebulaTime * s.twinkleSpeed + s.twinklePhase));

      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, twinkle));
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = s.layer === 2 ? 8 : (s.layer === 1 ? 4 : 0);

      if (s.layer === 2) {
        ctx.fillRect(sx - s.size * 1.5, sy - 0.5, s.size * 3, 1);
        ctx.fillRect(sx - 0.5, sy - s.size * 1.5, 1, s.size * 3);
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const ss of this.shootingStars) {
      ctx.save();
      const tailX = ss.x - (ss.vx / 10) * ss.length;
      const tailY = ss.y - (ss.vy / 10) * ss.length;

      // Soft luminous fading meteor tail
      const tailGrad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      tailGrad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha * 0.95})`);
      tailGrad.addColorStop(0.25, `rgba(0, 255, 255, ${ss.alpha * 0.65})`);
      tailGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');

      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Glowing meteor head
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  draw(ctx) {
    ctx.save();

    // Slices and Cyber Blade Trails
    for (const sl of this.slashes) {
      ctx.save();
      ctx.globalAlpha = sl.alpha;
      ctx.strokeStyle = sl.color;
      ctx.shadowColor = sl.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = sl.width * sl.alpha;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sl.x1, sl.y1);
      ctx.lineTo(sl.x2, sl.y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, (sl.width / 2) * sl.alpha);
      ctx.stroke();
      ctx.restore();
    }

    for (const tr of this.trails) {
      ctx.save();
      ctx.globalAlpha = tr.alpha * 0.6;
      ctx.fillStyle = tr.color;
      ctx.shadowColor = tr.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, tr.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 🛸 Cyber Hull Debris Rendering
    for (const d of this.hullDebris) {
      const alpha = Math.max(0, d.life / d.maxLife);
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.moveTo(-d.size, -d.size * 0.5);
      ctx.lineTo(d.size, 0);
      ctx.lineTo(-d.size * 0.4, d.size * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    for (const bh of this.blackHoles) {
      ctx.save();
      ctx.translate(bh.x, bh.y);
      ctx.rotate(bh.angle);
      ctx.fillStyle = '#9d00ff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, bh.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const b of this.ionBeams) {
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = 'rgba(0, 255, 255, 0.45)';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 35;
      ctx.fillRect(b.x - b.width / 2, 0, b.width, b.y);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(b.x - b.width / 6, 0, b.width / 3, b.y);
      ctx.restore();
    }

    for (const s of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = s.alpha * 0.85;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 9;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.font = t.isCrit ? '900 18px "Trebuchet MS", "Arial Black", sans-serif' : '800 13px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Dark drop-shadow outline for instant readability
      ctx.lineWidth = t.isCrit ? 3.5 : 2.5;
      ctx.strokeStyle = 'rgba(2, 6, 18, 0.9)';
      ctx.strokeText(t.text, t.x, t.y);

      // Neon fill with bloom
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = t.isCrit ? 12 : 5;
      ctx.fillText(t.text, t.x, t.y);

      ctx.restore();
    }

    ctx.restore();
  }
}

window.particleEngine = new ParticleEngine();
