// Enemy types, pathing, and wave spawner controller

class Enemy {
  constructor(x, y, type, wave = 1, isElite = false, eliteType = 'berserk') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.wave = wave;

    this.freezeTimer = 0;
    this.burnTimer = 0;
    this.burnDps = 0;
    this.shockTimer = 0;
    this.poisonTimer = 0;
    this.hitFlashTimer = 0;

    this.isElite = isElite;
    this.eliteType = eliteType;
    this.detonated = false;

    const flags = (window.vkPlayBridge && window.vkPlayBridge.flags) || {};
    let diffHpMult = 1.0;
    let diffDmgMult = 1.0;
    let diffSpeedMult = 1.0;

    if (flags.difficulty === 'hard') {
      diffHpMult = 1.20;
      diffDmgMult = 1.15;
      diffSpeedMult = 1.10;
    } else if (flags.difficulty === 'nightmare') {
      diffHpMult = 1.50;
      diffDmgMult = 1.30;
      diffSpeedMult = 1.20;
    } else if (flags.difficulty === 'easy') {
      diffHpMult = 0.65;
      diffDmgMult = 0.60;
    }

    // Fair Mobile Balancing: 28% speed reduction so phone players have ample reaction time
    const isMobileDevice = (typeof window !== 'undefined') && (window.innerWidth < 600 || window.innerHeight < 600);
    if (isMobileDevice) {
      diffSpeedMult *= 0.72;
    }

    const waveHpMult = (1 + (wave - 1) * 0.12) * diffHpMult;
    const waveDmgMult = (1 + (wave - 1) * 0.08) * diffDmgMult;

    switch (type) {
      case 'swarmer':
        this.radius = 12;
        this.maxHp = 14 * waveHpMult;
        this.hp = this.maxHp;
        this.speed = 1.45 * diffSpeedMult;
        this.damage = 6 * waveDmgMult;
        this.scrapValue = 1;
        this.expValue = 8;
        this.color = '#00ffff';
        break;

      case 'shooter':
        this.radius = 16;
        this.maxHp = 35 * waveHpMult;
        this.hp = this.maxHp;
        this.speed = 0.85 * diffSpeedMult;
        this.damage = 8 * waveDmgMult;
        this.scrapValue = 3;
        this.expValue = 18;
        this.color = '#9d00ff';
        this.shootRange = 250;
        this.shootCooldown = 2.8;
        this.shootTimer = Math.random() * 1.5;
        break;

      case 'tank':
        this.radius = 24;
        this.maxHp = 120 * waveHpMult;
        this.hp = this.maxHp;
        this.speed = 0.50 * diffSpeedMult;
        this.damage = 22 * waveDmgMult;
        this.scrapValue = 8;
        this.expValue = 45;
        this.color = '#ffaa00';
        break;

      case 'kamikaze':
        this.radius = 14;
        this.maxHp = 22 * waveHpMult;
        this.hp = this.maxHp;
        this.speed = 1.75 * diffSpeedMult;
        this.damage = 32 * waveDmgMult;
        this.scrapValue = 4;
        this.expValue = 22;
        this.color = '#ff0033';
        break;

      case 'boss':
        this.radius = 42;
        const baseBossHp = isMobileDevice ? 560 : 800;
        this.maxHp = baseBossHp * (1 + (wave / 5) * 0.95);
        this.hp = this.maxHp;
        this.speed = (isMobileDevice ? 0.30 : 0.36) * diffSpeedMult;
        this.damage = (isMobileDevice ? 28 : 40) * waveDmgMult;
        this.scrapValue = 40;
        this.expValue = 350;
        this.color = '#ff0055';
        this.isBoss = true;
        this.bossName = 'GIGA-CYBER TITAN MK-' + Math.ceil(wave / 5);
        this.attackPhaseTimer = 0;
        this.laserAngle = 0;
        this.shieldActive = true;
        this.shieldHp = isMobileDevice ? 100 : 200;
        this.maxShieldHp = this.shieldHp;
        this.coreTimer = 0;
        this.isCoreExposed = false;
        break;

      case 'leviathan':
        this.radius = 38;
        const baseLevHp = isMobileDevice ? 1800 : 2500;
        this.maxHp = baseLevHp;
        this.hp = this.maxHp;
        this.speed = (isMobileDevice ? 0.80 : 0.95) * diffSpeedMult;
        this.damage = (isMobileDevice ? 36 : 50) * waveDmgMult;
        this.scrapValue = 80;
        this.expValue = 800;
        this.color = '#00ffff';
        this.isBoss = true;
        this.isLeviathan = true;
        this.bossName = 'CYBER LEVIATHAN PRIME';
        this.attackPhaseTimer = 0;
        this.segments = [];
        this.segmentCount = isMobileDevice ? 7 : 9;
        this.snakeAngle = 0;
        this.coreTimer = 0;
        this.isCoreExposed = false;

        for (let i = 0; i < this.segmentCount; i++) {
          this.segments.push({
            x: this.x - i * 28,
            y: this.y,
            radius: 24 - i * 1.8,
            color: i % 2 === 0 ? '#ff007f' : '#00ffff'
          });
        }
        break;

      default:
        // Handle boss variants or unknown enemy types gracefully
        if (type && String(type).startsWith('boss')) {
          this.radius = 42;
          const baseBossHp = isMobileDevice ? 560 : 800;
          this.maxHp = baseBossHp * (1 + (wave / 5) * 0.95);
          this.hp = this.maxHp;
          this.speed = (isMobileDevice ? 0.30 : 0.36) * diffSpeedMult;
          this.damage = (isMobileDevice ? 28 : 40) * waveDmgMult;
          this.scrapValue = 40;
          this.expValue = 350;
          this.color = '#ff0055';
          this.isBoss = true;
          this.bossName = 'GIGA-CYBER TITAN MK-' + Math.ceil(wave / 5);
          this.attackPhaseTimer = 0;
          this.laserAngle = 0;
          this.shieldActive = true;
          this.shieldHp = isMobileDevice ? 100 : 200;
          this.maxShieldHp = this.shieldHp;
          this.coreTimer = 0;
          this.isCoreExposed = false;
        } else {
          this.radius = 14;
          this.maxHp = 18 * waveHpMult;
          this.hp = this.maxHp;
          this.speed = 1.35 * diffSpeedMult;
          this.damage = 8 * waveDmgMult;
          this.scrapValue = 2;
          this.expValue = 12;
          this.color = '#00ffff';
        }
        break;
    }

    if (this.isElite) {
      this.radius *= 1.3;
      this.maxHp *= 2.0;
      this.hp = this.maxHp;
      this.scrapValue = Math.round(this.scrapValue * 2.5);
      this.expValue = Math.round(this.expValue * 2.5);
      if (this.eliteType === 'shield') this.color = '#00e1ff';
      if (this.eliteType === 'berserk') this.speed *= 1.3;
      if (this.eliteType === 'golden') this.color = '#ffee00';
    }
  }

  applyFreeze(duration = 2.0) {
    this.freezeTimer = Math.max(this.freezeTimer, duration);
  }

  applyBurn(arg1 = 3.0, arg2 = 15) {
    let duration = 3.0;
    let dps = 15;
    if (arg1 > 10 && arg2 <= 10) {
      dps = arg1;
      duration = arg2;
    } else {
      duration = arg1;
      dps = arg2;
    }
    this.burnTimer = Math.max(this.burnTimer, duration);
    this.burnDps = Math.max(this.burnDps, dps);
  }

  takeDamage(amount, isCrit = false, dmgColor = '#ffee00') {
    amount = Math.max(1, Number(amount) || 1);
    if (this.isBoss && this.shieldActive && this.shieldHp > 0) {
      this.shieldHp -= amount;
      if (window.particleEngine) {
        window.particleEngine.addSparks(this.x, this.y, '#00ffff', 6, 0.9);
      }
      if (this.shieldHp <= 0) {
        this.shieldActive = false;
        this.isCoreExposed = true;
        this.coreTimer = 3.5;
        if (window.particleEngine) {
          const shatterMsg = window.i18n ? window.i18n.t('shieldShattered') : '⚡ SHIELD SHATTERED! CORE OPEN!';
          window.particleEngine.addDamageText(this.x, this.y - 30, shatterMsg, '#00ffff', true);
        }
      }
      return false;
    }

    if (this.isBoss && this.isCoreExposed) {
      amount *= 2.8;
      isCrit = true;
      dmgColor = '#ffee00';
    }

    this.hp -= amount;
    this.hitFlashTimer = 0.08;
    if (window.particleEngine) {
      window.particleEngine.addDamageText(this.x, this.y, Math.round(amount), dmgColor, isCrit);
    }

    if (this.hp <= 0) {
      if (window.game && typeof window.game.onEnemyKilled === 'function') {
        window.game.onEnemyKilled(this);
      }
      return true;
    }
    return false;
  }

  update(dt, tower, enemyProjectiles, allEnemies) {
    if (this.hp <= 0) return true;
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      dt *= 0.35;
    }

    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.hp -= this.burnDps * dt;
      if (this.hp <= 0) {
        if (window.game && typeof window.game.onEnemyKilled === 'function') {
          window.game.onEnemyKilled(this);
        }
        return true;
      }
    }

    if (this.isBoss) {
      this.coreTimer += dt;
      if (this.coreTimer >= 5.0) {
        this.coreTimer = 0;
        this.isCoreExposed = true;
        if (window.particleEngine) {
          const overheatMsg = window.i18n ? window.i18n.t('coreOverheat') : '🎯 CORE OVERHEAT! x2.8 DMG!';
          window.particleEngine.addDamageText(this.x, this.y - 25, overheatMsg, '#ffee00', true);
          window.particleEngine.addShockwave(this.x, this.y, '#ffee00', 80, 0.3);
        }
      } else if (this.coreTimer >= 2.5 && this.isCoreExposed) {
        this.isCoreExposed = false;
      }
    }

    const angle = Math.atan2(tower.y - this.y, tower.x - this.x);

    if (this.isLeviathan) {
      this.snakeAngle += dt * 1.8;
      const waveOffset = Math.sin(this.snakeAngle) * 35;
      const perpAngle = angle + Math.PI / 2;

      this.x += (Math.cos(angle) * this.speed + Math.cos(perpAngle) * (waveOffset * 0.05)) * dt * 60;
      this.y += (Math.sin(angle) * this.speed + Math.sin(perpAngle) * (waveOffset * 0.05)) * dt * 60;

      let prevX = this.x;
      let prevY = this.y;
      for (const seg of this.segments) {
        const segDx = prevX - seg.x;
        const segDy = prevY - seg.y;
        const segDist = Math.hypot(segDx, segDy);
        if (segDist > 20) {
          const segAngle = Math.atan2(segDy, segDx);
          seg.x = prevX - Math.cos(segAngle) * 20;
          seg.y = prevY - Math.sin(segAngle) * 20;
        }
        prevX = seg.x;
        prevY = seg.y;
      }
    } else if (this.type === 'shooter') {
      const dist = Math.hypot(tower.x - this.x, tower.y - this.y);
      if (dist > this.shootRange) {
        this.x += Math.cos(angle) * this.speed * dt * 60;
        this.y += Math.sin(angle) * this.speed * dt * 60;
      }

      this.shootTimer += dt;
      if (this.shootTimer >= this.shootCooldown) {
        this.shootTimer = 0;
        const projSpeed = 3.2;
        enemyProjectiles.push({
          x: this.x,
          y: this.y,
          vx: Math.cos(angle) * projSpeed,
          vy: Math.sin(angle) * projSpeed,
          damage: this.damage,
          radius: 5.5,
          color: '#ff007f'
        });
        if (window.soundEngine) window.soundEngine.playShoot('plasma');
      }
    } else if (this.isBoss) {
      this.x += Math.cos(angle) * this.speed * dt * 60;
      this.y += Math.sin(angle) * this.speed * dt * 60;

      this.attackPhaseTimer += dt;
      if (this.attackPhaseTimer >= 4.0) {
        this.attackPhaseTimer = 0;
        const isMobile = typeof window !== 'undefined' && (window.innerWidth < 600 || window.innerHeight < 600);
        const bulletCount = isMobile ? 6 : 8;
        const bulletSpeed = isMobile ? 1.9 : 2.6;
        for (let b = 0; b < bulletCount; b++) {
          const bAngle = angle + (Math.PI * 2 * b) / bulletCount;
          enemyProjectiles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(bAngle) * bulletSpeed,
            vy: Math.sin(bAngle) * bulletSpeed,
            damage: this.damage * 0.7,
            radius: 6.5,
            color: '#ff0055'
          });
        }
        if (window.soundEngine) window.soundEngine.playShoot('plasma');
      }
    } else {
      this.x += Math.cos(angle) * this.speed * dt * 60;
      this.y += Math.sin(angle) * this.speed * dt * 60;
    }

    const distToTower = Math.hypot(tower.x - this.x, tower.y - this.y);
    if (distToTower <= tower.radius + this.radius) {
      if (this.isBoss || this.isLeviathan) {
        this.contactAttackTimer = (this.contactAttackTimer || 0) + dt;
        if (this.contactAttackTimer >= 1.0) {
          this.contactAttackTimer = 0;
          tower.takeDamage(this.damage);
        }
      } else {
        // Regular enemies detonate upon impacting tower shields
        this.detonated = true;
        tower.takeDamage(this.damage);
        if (window.particleEngine) window.particleEngine.addExplosion(this.x, this.y, this.color || '#ff0033', this.type === 'tank');
        if (window.soundEngine) window.soundEngine.playExplosion('small');
        return true;
      }
    }

    return false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const now = Date.now() * 0.005;

    // Freeze Aura
    if (this.freezeTimer > 0) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // White Impact Flash Aura
    if (this.hitFlashTimer > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this.type === 'swarmer') {
      // 🚀 Cosmic Swarm Stealth Fighter
      const angle = Math.atan2(window.game?.tower?.y - this.y, window.game?.tower?.x - this.x);
      ctx.rotate(angle);

      // Outer Glow & Hull
      ctx.fillStyle = '#061329';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(this.radius * 1.6, 0); // Needle Nose
      ctx.lineTo(this.radius * 0.4, -this.radius * 0.5);
      ctx.lineTo(-this.radius * 0.9, -this.radius * 1.1); // Left Wing
      ctx.lineTo(-this.radius * 0.4, 0); // Engine Indent
      ctx.lineTo(-this.radius * 0.9, this.radius * 1.1); // Right Wing
      ctx.lineTo(this.radius * 0.4, this.radius * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing Wingtip Cannons
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.radius * 0.9 - 2, -this.radius * 1.1 - 2, 4, 4);
      ctx.fillRect(-this.radius * 0.9 - 2, this.radius * 1.1 - 2, 4, 4);

      // Core Cockpit Eye
      const pulse = 0.8 + Math.sin(now * 3) * 0.2;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.radius * 0.2, 0, 3.5 * pulse, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'shooter') {
      // 🌌 Quasar Plasma Star Cruiser
      ctx.rotate(now * 0.8);

      // 6-Pointed Star Crystal Hull
      ctx.fillStyle = '#110426';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 16;

      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const r = (i % 2 === 0) ? this.radius * 1.25 : this.radius * 0.55;
        const a = (Math.PI / 6) * i;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Outer Rotating Energy Ring
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // Core Plasma Reactor
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'tank') {
      // 🛡️ Galactic Heavy Dreadnought Cruiser
      const targetX = (window.game && window.game.tower) ? window.game.tower.x : 0;
      const targetY = (window.game && window.game.tower) ? window.game.tower.y : 0;
      const angle = Math.atan2(targetY - this.y, targetX - this.x);
      ctx.rotate(isNaN(angle) ? 0 : angle);

      // Heavy Armored Hull
      ctx.fillStyle = '#1c1303';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.moveTo(this.radius * 1.3, 0);
      ctx.lineTo(this.radius * 0.7, -this.radius * 0.9);
      ctx.lineTo(-this.radius * 0.8, -this.radius * 0.8);
      ctx.lineTo(-this.radius * 1.1, -this.radius * 0.4);
      ctx.lineTo(-this.radius * 1.1, this.radius * 0.4);
      ctx.lineTo(-this.radius * 0.8, this.radius * 0.8);
      ctx.lineTo(this.radius * 0.7, this.radius * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Armor Shielding Plates
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(-this.radius * 0.4, -this.radius * 0.6, this.radius * 0.8, this.radius * 1.2);

      // Heavy Twin Cannons
      ctx.fillStyle = '#050814';
      ctx.fillRect(this.radius * 0.3, -this.radius * 0.45, 14, 4);
      ctx.fillRect(this.radius * 0.3, this.radius * 0.35, 14, 4);

      // Orange Heat Exhaust Core
      ctx.fillStyle = '#ffee00';
      ctx.shadowColor = '#ffee00';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(-this.radius * 0.5, 0, 5, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'kamikaze') {
      // 💣 Supernova Spiked Void Mine
      ctx.rotate(-now * 2.5);

      ctx.fillStyle = '#1a0005';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 20;

      // 8 Spiked Containment Fins
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const r = (i % 2 === 0) ? this.radius * 1.35 : this.radius * 0.7;
        const a = (Math.PI / 8) * i;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pulsing Anti-Matter Core
      const warnPulse = 0.5 + Math.abs(Math.sin(now * 6)) * 0.5;
      ctx.fillStyle = `rgba(255, 0, 51, ${warnPulse})`;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.isBoss && !this.isLeviathan) {
      // 🛸 Titan Destroyer Mothership
      ctx.rotate(now * 0.4);

      // Outer Heavy Armor Hull
      ctx.fillStyle = '#0f0208';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 28;

      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i;
        const px = Math.cos(a) * this.radius;
        const py = Math.sin(a) * this.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4 Cardinal Weapon Pods
      for (let p = 0; p < 4; p++) {
        const pa = (Math.PI / 2) * p;
        const px = Math.cos(pa) * (this.radius + 4);
        const py = Math.sin(pa) * (this.radius + 4);
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central Reactor Core (Exposed Weakness Indicator)
      const coreColor = this.isCoreExposed ? '#ffee00' : '#00ffff';
      ctx.fillStyle = coreColor;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = this.isCoreExposed ? 35 : 18;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * (this.isCoreExposed ? 0.65 : 0.45), 0, Math.PI * 2);
      ctx.fill();

      if (this.isCoreExposed) {
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Forcefield Shield Barrier
      if (this.shieldActive) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 14, 0, Math.PI * 2);
        ctx.stroke();
      }

    } else if (this.isLeviathan) {
      // 🐍 Interstellar Star Leviathan Serpent
      ctx.fillStyle = this.color;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 22;

      for (const seg of this.segments) {
        ctx.save();
        ctx.fillStyle = seg.color;
        ctx.shadowColor = seg.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(seg.x - this.x, seg.y - this.y, seg.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dragon Head Crown
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!this.isBoss && this.hp < this.maxHp) {
      const barW = this.radius * 2;
      const barH = 4;
      const hpPercent = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2, -this.radius - 8, barW, barH);
      ctx.fillStyle = this.isElite ? '#ffaa00' : '#39ff14';
      ctx.fillRect(-barW / 2, -this.radius - 8, barW * hpPercent, barH);
    }

    ctx.restore();
  }
}

class WaveManager {
  constructor() {
    this.currentWave = 1;
    this.waveTimer = 0;
    this.waveDuration = 30;
    this.spawnTimer = 0;
    this.spawnInterval = 1.4;
    this.bossSpawnedThisWave = false;
    this.bossWarningTriggered = false;
    this.isBossWave = false;
    this.activeEvent = null;
    this.meteors = [];
    this.meteorTimer = 0;
    this.crates = [];
  }

  reset() {
    this.currentWave = 1;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 1.4;
    this.bossSpawnedThisWave = false;
    this.bossWarningTriggered = false;
    this.isBossWave = false;
    this.activeEvent = null;
    this.meteors = [];
    this.meteorTimer = 0;
    this.crates = [];
  }

  spawnCrate(x, y, isBossCrate = false) {
    // Strict Cap: Maximum 1 crate active on the field at any time
    if (this.crates.length >= 1) {
      if (isBossCrate) {
        this.crates = []; // Guarantee 100% boss crate drop by replacing stale regular crate
      } else {
        return;
      }
    }

    this.crates.push({
      x,
      y,
      radius: 12,
      pulse: 0,
      color: isBossCrate ? '#ff00ff' : '#ffee00',
      isBossCrate: !!isBossCrate
    });
  }

  update(dt, canvasWidth, canvasHeight, enemies, tower) {
    this.waveTimer += dt;
    this.spawnTimer += dt;
    this.isBossWave = this.currentWave % 5 === 0;

    if (!this.activeEvent && (this.currentWave >= 4) && (this.currentWave % 3 === 0) && this.waveTimer > 5) {
      this.activeEvent = Math.random() > 0.5 ? 'meteors' : 'cyber_storm';
      if (window.particleEngine) {
        const evtName = this.activeEvent === 'meteors' ? (window.i18n ? window.i18n.t('meteorEvent') : 'METEORS') : (window.i18n ? window.i18n.t('stormEvent') : 'CYBER STORM');
        window.particleEngine.addDamageText(canvasWidth / 2, 90, evtName, '#ffee00', true);
      }
    }

    if (this.activeEvent === 'meteors') {
      this.meteorTimer += dt;
      if (this.meteorTimer >= 1.8) {
        this.meteorTimer = 0;
        this.meteors.push({
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          radius: 20,
          delay: 2.0,
          elapsed: 0
        });
      }
    }

    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.elapsed += dt;
      if (m.elapsed >= m.delay) {
        if (window.particleEngine) {
          window.particleEngine.addExplosion(m.x, m.y, '#ff5500', true);
        }
        if (window.soundEngine) window.soundEngine.playExplosion('big');

        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(e.x - m.x, e.y - m.y) <= 95) {
            if (e.takeDamage(220, true, '#ff5500', enemies)) enemies.splice(j, 1);
          }
        }

        if (Math.hypot(tower.x - m.x, tower.y - m.y) <= 85) {
          tower.takeDamage(25);
        }

        this.meteors.splice(i, 1);
      }
    }

    if (this.isBossWave && !this.bossSpawnedThisWave) {
      if (!this.bossWarningTriggered && this.waveTimer > 0.5) {
        this.bossWarningTriggered = true;
        try {
          if (window.soundEngine) window.soundEngine.playBossWarningSiren();
        } catch (e) {}
        if (window.particleEngine) {
          window.particleEngine.shake(14, 0.35);
          const warnMsg = window.i18n ? window.i18n.t('warningTitan') : '⚠️ WARNING: TITAN APPROACHING ⚠️';
          window.particleEngine.addDamageText(canvasWidth / 2, 110, warnMsg, '#ff0033', true);
        }
        if (window.game) {
          window.game.timeScale = 0.45;
          window.game.slowMoTimer = 0.7;
        }
      }

      if (this.waveTimer > 1.8) {
        this.bossSpawnedThisWave = true;
        const { x, y } = this.getFairSpawnCoords(canvasWidth, canvasHeight, tower.x, tower.y);

        if (this.currentWave >= 10) {
          enemies.push(new Enemy(x, y, 'leviathan', this.currentWave));
          try {
            if (window.soundEngine && typeof window.soundEngine.playBossAlarm === 'function') {
              window.soundEngine.playBossAlarm();
            }
          } catch (e) {}
        } else {
          enemies.push(new Enemy(x, y, 'boss', this.currentWave));
          try {
            if (window.soundEngine && typeof window.soundEngine.playBossAlarm === 'function') {
              window.soundEngine.playBossAlarm();
            }
          } catch (e) {}
        }
      }
      return;
    }

    const currentSpawnRate = Math.max(0.65, 1.5 - (this.currentWave - 1) * 0.05);
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 600 || window.innerHeight < 600);
    const maxEnemies = isMobile ? 24 : 36;

    if (!this.isBossWave && enemies.length < maxEnemies && this.spawnTimer >= currentSpawnRate) {
      this.spawnTimer = 0;
      const spawnCount = Math.min(3, 1 + Math.floor((this.currentWave - 1) / 4));

      for (let i = 0; i < spawnCount; i++) {
        if (enemies.length >= maxEnemies) break;
        const { x, y } = this.getFairSpawnCoords(canvasWidth, canvasHeight, tower.x, tower.y);
        const typeRoll = Math.random();
        let type = 'swarmer';

        if (this.currentWave >= 3 && typeRoll > 0.70) type = 'shooter';
        if (this.currentWave >= 4 && typeRoll > 0.85) type = 'kamikaze';
        if (this.currentWave >= 5 && typeRoll > 0.92) type = 'tank';

        const isElite = Math.random() < 0.12;
        const eliteTypes = ['golden', 'golden', 'shield', 'berserk'];
        const eliteType = eliteTypes[Math.floor(Math.random() * eliteTypes.length)];

        enemies.push(new Enemy(x, y, type, this.currentWave, isElite, eliteType));
      }
    }

    if (this.isBossWave) {
      const activeBoss = enemies.find(e => e.isBoss);
      if (!activeBoss && this.bossSpawnedThisWave) {
        this.currentWave++;
        this.waveTimer = 0;
        this.bossSpawnedThisWave = false;
        this.bossWarningTriggered = false;
        this.activeEvent = null;
        return true;
      }
    } else if (this.waveTimer >= this.waveDuration) {
      this.currentWave++;
      this.waveTimer = 0;
      this.bossSpawnedThisWave = false;
      this.bossWarningTriggered = false;
      this.activeEvent = null;
      return true;
    }

    return false;
  }

  drawCrates(ctx) {
    for (const c of this.crates) {
      c.pulse = (c.pulse || 0) + 0.08;
      const p = 1 + Math.sin(c.pulse) * 0.25;

      ctx.save();
      ctx.translate(c.x, c.y);

      if (c.isBossCrate) {
        // Epic Boss Crate: Majestic Magenta & Gold with Crown Glyph
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00aa';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.rect(-9 * p, -9 * p, 18 * p, 18 * p);
        ctx.fill();

        ctx.fillStyle = '#ffee00';
        ctx.fillRect(-2.5, -9 * p, 5, 18 * p);
        ctx.fillRect(-9 * p, -2.5, 18 * p, 5);

        // Pulsing mini crown symbol
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffee00';
        ctx.shadowBlur = 8;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👑', 0, 0);
      } else {
        // Regular Elite Crate: Vivid Neon Amber with Cyan Ribbon
        ctx.fillStyle = '#ffee00';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.rect(-8 * p, -8 * p, 16 * p, 16 * p);
        ctx.fill();

        ctx.fillStyle = '#ff0055';
        ctx.fillRect(-2, -8 * p, 4, 16 * p);
        ctx.fillRect(-8 * p, -2, 16 * p, 4);
      }

      ctx.restore();
    }
  }

  drawMeteors(ctx) {
    for (const m of this.meteors) {
      ctx.save();
      const progress = Math.min(1.0, m.elapsed / m.delay);
      ctx.strokeStyle = '#ff5500';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(m.x, m.y, Math.max(1, 85 * (1 - progress)), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 85, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  getFairSpawnCoords(w, h, towerX, towerY) {
    const isPortrait = h > w;
    let spawnDist;
    if (isPortrait) {
      // On portrait mobile phone: spawn at 400px (further out on deep space boundary)
      spawnDist = 400 + Math.random() * 20;
    } else {
      // On PC landscape: revert to original outer viewport boundary spawn
      spawnDist = Math.hypot(w / 2, h / 2) * 0.70 + 40;
    }
    const angle = Math.random() * Math.PI * 2;
    return {
      x: towerX + Math.cos(angle) * spawnDist,
      y: towerY + Math.sin(angle) * spawnDist
    };
  }
}

window.Enemy = Enemy;
window.WaveManager = WaveManager;
