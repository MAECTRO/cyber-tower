// Companion pets and defense drones logic

const CYBER_PETS = [
  {
    id: 'rex',
    nameKey: 'petRexName',
    descKey: 'petRexDesc',
    name: 'Кибер-Пёс «Рекс»',
    desc: 'Бегает по арене, мгновенно пылесосит далекие чипы и кусает врагов.',
    icon: '🐕',
    color: '#00ffff',
    cost: 0
  },
  {
    id: 'falcon',
    nameKey: 'petFalconName',
    descKey: 'petFalconDesc',
    name: 'Дрон «Сокол»',
    desc: 'Парит в небе и снайперским лазером ваншотит стрелков каждые 2.2с.',
    icon: '🦅',
    color: '#ff007f',
    cost: 80
  },
  {
    id: 'scarab',
    nameKey: 'petScarabName',
    descKey: 'petScarabDesc',
    name: 'Нано-Жук «Скарабей»',
    desc: 'Летает вокруг башни и своим телом блокирует вражеские снаряды.',
    icon: '🛡️',
    color: '#39ff14',
    cost: 100
  }
];

class PetCompanion {
  constructor(tower, petType = 'rex') {
    this.tower = tower;
    this.type = petType;
    this.x = tower.x + 40;
    this.y = tower.y + 40;
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = 4.5;
    this.angle = 0;
    this.actionTimer = 0;
    this.biteTimer = 0;
  }

  reset(petType = 'rex') {
    this.type = petType;
    this.x = this.tower.x + 40;
    this.y = this.tower.y + 40;
    this.targetX = this.x;
    this.targetY = this.y;
    this.actionTimer = 0;
    this.biteTimer = 0;
  }

  update(dt, enemies, scraps, enemyProjectiles, onCollectScrap) {
    this.actionTimer += dt;

    if (this.type === 'rex') {
      let nearestTarget = null;
      let minTargetDist = Infinity;
      let isTargetCrate = false;

      // Prioritize fetching high-value loot crates first!
      if (window.game && window.game.waveManager && window.game.waveManager.crates) {
        for (const c of window.game.waveManager.crates) {
          const d = Math.hypot(c.x - this.x, c.y - this.y);
          if (d < minTargetDist) {
            minTargetDist = d;
            nearestTarget = c;
            isTargetCrate = true;
          }
        }
      }

      if (!nearestTarget) {
        for (const s of scraps) {
          const d = Math.hypot(s.x - this.x, s.y - this.y);
          if (d < minTargetDist) {
            minTargetDist = d;
            nearestTarget = s;
          }
        }
      }

      if (nearestTarget) {
        this.targetX = nearestTarget.x;
        this.targetY = nearestTarget.y;
      } else {
        this.targetX = this.tower.x + Math.cos(this.actionTimer * 1.5) * 80;
        this.targetY = this.tower.y + Math.sin(this.actionTimer * 1.5) * 80;
      }

      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        this.angle = Math.atan2(dy, dx);
        this.x += (dx / dist) * this.speed * dt * 60;
        this.y += (dy / dist) * this.speed * dt * 60;
      }

      // Check crate pickups
      if (window.game && window.game.waveManager && window.game.waveManager.crates) {
        for (let i = window.game.waveManager.crates.length - 1; i >= 0; i--) {
          const c = window.game.waveManager.crates[i];
          if (Math.hypot(c.x - this.x, c.y - this.y) <= 24) {
            window.game.waveManager.crates.splice(i, 1);
            if (window.game.collectCrate) {
              window.game.collectCrate(c);
            }
            break;
          }
        }
      }

      // Check scrap pickups
      for (let i = scraps.length - 1; i >= 0; i--) {
        const s = scraps[i];
        if (Math.hypot(s.x - this.x, s.y - this.y) <= 18) {
          onCollectScrap(s);
          if (window.particleEngine) {
            window.particleEngine.addSparks(s.x, s.y, '#00ffff', 4, 0.6);
          }
        }
      }

      this.biteTimer += dt;
      if (this.biteTimer >= 0.8) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(e.x - this.x, e.y - this.y) <= e.radius + 20) {
            this.biteTimer = 0;
            if (window.soundEngine) window.soundEngine.playZap();
            if (window.particleEngine) {
              window.particleEngine.addDamageText(e.x, e.y - 15, '80 🐕', '#00ffff');
            }
            if (e.takeDamage(80, false, '#00ffff')) {
              enemies.splice(j, 1);
            }
            break;
          }
        }
      }
    } else if (this.type === 'falcon') {
      this.x = this.tower.x + Math.cos(this.actionTimer * 2.2) * 65;
      this.y = this.tower.y - 50 + Math.sin(this.actionTimer * 3.0) * 15;
      this.angle = this.actionTimer * 2.2;

      this.biteTimer += dt;
      if (this.biteTimer >= 2.2 && enemies.length > 0) {
        let priorityEnemy = enemies.find(e => e.type === 'shooter' || e.isBoss) || enemies[0];
        if (priorityEnemy) {
          this.biteTimer = 0;
          if (window.soundEngine) window.soundEngine.playShoot('plasma');
          if (window.particleEngine) {
            window.particleEngine.addSparks(priorityEnemy.x, priorityEnemy.y, '#ff007f', 12, 1.4);
            window.particleEngine.addDamageText(priorityEnemy.x, priorityEnemy.y - 20, '220 🦅 SNIPER!', '#ff007f', true);
          }
          if (priorityEnemy.takeDamage(220, true, '#ff007f')) {
            const idx = enemies.indexOf(priorityEnemy);
            if (idx >= 0) enemies.splice(idx, 1);
          }
        }
      }
    } else if (this.type === 'scarab') {
      const orbitRadius = 48;
      this.angle = this.actionTimer * 3.5;
      this.x = this.tower.x + Math.cos(this.angle) * orbitRadius;
      this.y = this.tower.y + Math.sin(this.angle) * orbitRadius;

      if (enemyProjectiles) {
        for (let b = enemyProjectiles.length - 1; b >= 0; b--) {
          const ep = enemyProjectiles[b];
          if (Math.hypot(ep.x - this.x, ep.y - this.y) <= 22) {
            enemyProjectiles.splice(b, 1);
            this.tower.shield = Math.min(this.tower.maxShield, this.tower.shield + 20);
            if (window.particleEngine) {
              window.particleEngine.addSparks(this.x, this.y, '#39ff14', 8, 1.0);
              window.particleEngine.addDamageText(this.x, this.y - 15, '+20 SHIELD 🛡️', '#39ff14');
            }
          }
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 'rex') {
      ctx.rotate(this.angle);
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(8, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff007f';
      ctx.fillRect(8, -2, 2, 2);
      ctx.fillRect(8, 1, 2, 2);
    } else if (this.type === 'falcon') {
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-8, -9);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-8, 9);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.type === 'scarab') {
      ctx.fillStyle = '#39ff14';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

window.CYBER_PETS = CYBER_PETS;
window.PetCompanion = PetCompanion;
