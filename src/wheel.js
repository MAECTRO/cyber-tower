// Cyber roulette wheel controller

const WHEEL_SECTORS = [
  { label: '+50 🪙', type: 'chips', value: 50, color: '#00ffff' },
  { label: '👑 СКИН ТИТАН', labelKey: 'wheelSkinTitan', type: 'skin', value: 'skin_gold', color: '#ffee00' },
  { label: '+100 🪙', type: 'chips', value: 100, color: '#00e1ff' },
  { label: '🦅 ДРОН СОКОЛ', labelKey: 'wheelPetFalcon', type: 'pet', value: 'falcon', color: '#ff007f' },
  { label: '💥 ДЖЕКПОТ +300🪙', labelKey: 'wheelJackpot', type: 'chips', value: 300, color: '#ffee00' },
  { label: '+75 🪙', type: 'chips', value: 75, color: '#39ff14' },
  { label: '🛡️ СУПЕР ЩИТ', labelKey: 'wheelSuperShield', type: 'buff', value: 'shield', color: '#9d00ff' },
  { label: '+150 🪙', type: 'chips', value: 150, color: '#ffaa00' }
];

class CyberWheel {
  constructor(canvasId, onPrizeClaimed) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.onPrizeClaimed = onPrizeClaimed;

    this.angle = 0;
    this.angularVelocity = 0;
    this.isSpinning = false;
    this.lastTickIndex = -1;
    this.resultSector = null;

    if (this.canvas) {
      this.draw();
    }
  }

  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.resultSector = null;

    // Spin between 4 to 7 full rotations + random angle
    const targetSpins = 4 + Math.random() * 3;
    this.angularVelocity = targetSpins * Math.PI * 2;
    this.animate();
  }

  animate() {
    if (!this.isSpinning) return;

    this.angle += this.angularVelocity * 0.016;
    this.angularVelocity *= 0.982; // Friction deceleration

    // Check ticker sector pass for audio
    const numSectors = WHEEL_SECTORS.length;
    const normAngle = (this.angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const sectorIndex = Math.floor((normAngle / (Math.PI * 2)) * numSectors);

    if (sectorIndex !== this.lastTickIndex) {
      this.lastTickIndex = sectorIndex;
      if (window.soundEngine) window.soundEngine.playWheelTick();
    }

    this.draw();

    if (this.angularVelocity < 0.05) {
      this.isSpinning = false;
      this.angularVelocity = 0;

      // Pointer is at the top (angle - PI/2)
      const pointerAngle = (Math.PI * 1.5 - (this.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let winningIndex = Math.floor((pointerAngle / (Math.PI * 2)) * numSectors);
      winningIndex = (winningIndex % numSectors + numSectors) % numSectors;
      this.resultSector = WHEEL_SECTORS[winningIndex] || WHEEL_SECTORS[0];

      if (window.soundEngine && typeof window.soundEngine.playJackpot === 'function') {
        window.soundEngine.playJackpot();
      }
      if (window.particleEngine) window.particleEngine.shake(12, 0.4);

      if (this.onPrizeClaimed) {
        try {
          this.onPrizeClaimed(this.resultSector);
        } catch(err) {
          console.error('[Wheel] Error calling onPrizeClaimed:', err);
        }
      }
    } else {
      requestAnimationFrame(() => this.animate());
    }
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 14;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle);

    const count = WHEEL_SECTORS.length;
    const slice = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const sec = WHEEL_SECTORS[i];
      const startAngle = i * slice;
      const endAngle = startAngle + slice;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = i % 2 === 0 ? 'rgba(10, 20, 45, 0.95)' : 'rgba(5, 12, 28, 0.95)';
      ctx.fill();

      ctx.strokeStyle = sec.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text label inside sector
      ctx.save();
      ctx.rotate(startAngle + slice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = sec.color;
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.shadowColor = sec.color;
      ctx.shadowBlur = 8;
      const displayLabel = (sec.labelKey && window.i18n) ? window.i18n.t(sec.labelKey) : sec.label;
      ctx.fillText(displayLabel, radius - 18, 4);
      ctx.restore();
    }

    // Outer Neon Ring & Pegs
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < count; i++) {
      const a = i * slice;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (radius - 4), Math.sin(a) * (radius - 4), 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center Hub
    ctx.fillStyle = '#050814';
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Top Fixed Arrow Pointer (Red/Magenta)
    ctx.save();
    ctx.translate(cx, 16);
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(-10, -4);
    ctx.lineTo(10, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

window.CyberWheel = CyberWheel;
window.WHEEL_SECTORS = WHEEL_SECTORS;
