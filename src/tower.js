// Central defense tower class and combat weapons

class Tower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 28;
    this.maxHp = 750;
    this.hp = this.maxHp;
    this.maxShield = 200;
    this.shield = this.maxShield;
    this.shieldRechargeDelay = 2.0;
    this.shieldRechargeTimer = 0;

    this.currentClass = 'default';
    this.skinId = 'skin_cyan';
    this.towerColor = '#00ffff';

    this.upgrades = {
      ricochets: 0,
      chainLightning: false,
      lightningChains: 3,
      projectilesPerShot: 1,
      minesEnabled: false,
      mineCount: 0,
      leechChance: 0,
      laserRay: false,
      laserDamageMult: 1,
      dronesEnabled: false,
      droneCount: 0,
      cryoFreeze: false,
      empSupernova: false,
      missilesEnabled: false,
      missileCount: 0,
      singularity: false,
      cryptoMiner: 0
    };

    this.evolutions = {
      ionCannon: false,
      clusterNapalm: false,
      blizzardSaw: false
    };

    this.implants = {
      chaos: false,
      vampire: false,
      magnet: false
    };

    this.isManualAiming = false;
    this.manualAimTarget = { x: 0, y: 0 };
    this.recoilOffset = { x: 0, y: 0 };
    this.dishAngle = 0;
    this.crystalSpin = 0;
    this.cryptoMinerTimer = 0;

    this.stats = {
      baseDamage: 30,
      damageMult: 1.0,
      fireRateMult: 1.15,
      rangeMult: 1.1,
      baseRange: 300,
      critChance: 0.10,
      critMult: 2.5,
      regenHpSec: 3.0,
      magnetRange: 380,
      chipBonusMult: 1.0
    };

    this.empReady = true;
    this.empCooldown = 0;
    this.empCooldownMax = 5.0;

    this.emergencyShieldTimer = 0;
    this.emergencyShieldUsed = false;

    this.shootTimer = 0;
    this.baseFireInterval = 0.28;
    this.laserAngle = 0;
    this.droneAngle = 0;
    this.mineTimer = 0;
    this.cryoTimer = 0;
    this.missileTimer = 0;
    this.ionTimer = 0;

    this.projectiles = [];
    this.mines = [];
    this.missiles = [];
  }

  reset(x, y, metaUpgrades = {}, chosenClass = 'default', activeImplants = [], skinId = 'skin_cyan') {
    this.x = x;
    this.y = y;
    this.currentClass = chosenClass;
    this.skinId = skinId;

    const classData = (window.TOWER_CLASSES && window.TOWER_CLASSES.find(c => c.id === chosenClass)) || {
      baseHpBonus: 0,
      baseDmgMult: 1.0,
      fireRateMult: 1.0,
      color: '#00ffff'
    };

    const skinData = (window.TOWER_SKINS && window.TOWER_SKINS.find(s => s.id === skinId)) || {
      color: '#00ffff'
    };
    this.towerColor = skinData.color || classData.color || '#00ffff';

    this.maxHp = 750 + classData.baseHpBonus + (metaUpgrades.hpLevel || 0) * 120;
    this.hp = this.maxHp;
    this.maxShield = 200;
    this.shield = this.maxShield;

    const isMobileDevice = (typeof window !== 'undefined') && (window.innerWidth < 600 || window.innerHeight < 600);
    this.stats = {
      baseDamage: 32,
      damageMult: (classData.baseDmgMult || 1.0) + (metaUpgrades.dmgLevel || 0) * 0.20,
      fireRateMult: (classData.fireRateMult || 1.0) * (isMobileDevice ? 1.25 : 1.15),
      baseRange: isMobileDevice ? 260 : 200,
      rangeMult: 1.1 + (metaUpgrades.rangeLevel || 0) * 0.12,
      critChance: 0.15,
      critMult: 2.5,
      regenHpSec: 3.0 + (metaUpgrades.regenLevel || 0) * 3.0,
      chipBonusMult: 1.0,
      magnetRange: 180
    };
    this.baseFireInterval = isMobileDevice ? 0.22 : 0.28;

    this.implants = {
      chaos: activeImplants.includes('imp_chaos'),
      vampire: activeImplants.includes('imp_vampire'),
      magnet: activeImplants.includes('imp_magnet')
    };

    if (this.implants.magnet) {
      this.stats.magnetRange *= 1.8;
    }

    this.emergencyShieldTimer = 0;
    this.emergencyShieldUsed = false;
    this.isManualAiming = false;
    this.cryptoMinerTimer = 0;

    this.upgrades = {
      ricochets: 0,
      chainLightning: false,
      lightningChains: 3,
      projectilesPerShot: 1,
      minesEnabled: false,
      mineCount: 0,
      leechChance: 0,
      laserRay: false,
      laserDamageMult: 1,
      dronesEnabled: false,
      droneCount: 0,
      cryoFreeze: false,
      empSupernova: false,
      missilesEnabled: false,
      missileCount: 0,
      singularity: false,
      cryptoMiner: 0
    };

    this.evolutions = {
      ionCannon: false,
      clusterNapalm: false,
      blizzardSaw: false
    };

    if (classData.startPerk && window.UPGRADE_CARDS) {
      const startCard = window.UPGRADE_CARDS.find(c => c.id === classData.startPerk);
      if (startCard) startCard.apply(this);
    }

    this.empCooldown = 0;
    this.empReady = true;
    this.projectiles = [];
    this.mines = [];
    this.missiles = [];
  }

  takeDamage(amount) {
    if (this.emergencyShieldTimer > 0) return false;

    this.shieldRechargeTimer = 0;

    if (this.shield > 0) {
      this.shield -= amount;
      if (this.shield < 0) {
        this.hp += this.shield;
        this.shield = 0;
      }
    } else {
      this.hp -= amount;
    }

    if (this.hp <= this.maxHp * 0.25 && !this.emergencyShieldUsed) {
      this.emergencyShieldUsed = true;
      this.emergencyShieldTimer = 2.5;
      this.shield = this.maxShield;
      if (window.particleEngine) {
        window.particleEngine.addShockwave(this.x, this.y, '#00ffff', 180, 0.4);
        const shieldText = window.i18n ? window.i18n.t('emergencyShieldAlert') : '⚡ EMERGENCY SHIELD!';
        window.particleEngine.addDamageText(this.x, this.y - 30, shieldText, '#00ffff', true);
      }
      if (window.soundEngine) {
        window.soundEngine.speak(window.i18n ? window.i18n.t('emergencyShieldAlert') : 'Emergency Shield Engaged', window.i18n ? window.i18n.currentLang : 'ru');
      }
    }

    if (window.particleEngine) {
      window.particleEngine.addSparks(this.x, this.y, '#ff0033', 4, 1.2);
      window.particleEngine.addDamageText(this.x, this.y, Math.round(amount), '#ff0033', false);
      window.particleEngine.shake(4, 0.12);
      window.particleEngine.triggerGlitch(0.2);
    }
    if (window.soundEngine) {
      window.soundEngine.playExplosion('small');
    }

    return this.hp <= 0;
  }

  triggerEMP(enemies, enemyProjectiles = []) {
    if (this.empCooldown > 0) return false;

    this.empCooldown = this.empCooldownMax;
    const isSupernova = this.upgrades.empSupernova;
    const rMult = this.upgrades.empRadiusMult || (isSupernova ? 1.5 : 1.0);
    const dMult = this.upgrades.empDamageMult || (isSupernova ? 2.1 : 1.0);
    const blastDamage = 180 * dMult * this.stats.damageMult;
    const blastRadius = 360 * rMult;

    // Clear all enemy projectiles on screen
    if (enemyProjectiles) {
      for (const ep of enemyProjectiles) {
        if (window.particleEngine) window.particleEngine.addSparks(ep.x, ep.y, '#00ffff', 3, 0.8);
      }
      enemyProjectiles.length = 0;
    }

    if (window.soundEngine) {
      window.soundEngine.playUltimate(this.currentClass);
    }

    // --- 1. SENTINEL: ORBITAL JUDGEMENT BEAM ---
    if (this.currentClass === 'class_sentinel' || this.currentClass === 'default' || this.currentClass === 'sentinel') {
      if (window.particleEngine) {
        window.particleEngine.addIonCannon(this.x, this.y);
        window.particleEngine.addShockwave(this.x, this.y, '#00ffff', blastRadius * 1.3, 0.5);
      }
      const meltText = window.i18n ? window.i18n.t('orbitalMelt') : '⚡ ORBITAL MELT!';
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.isBoss) {
          e.shieldActive = false;
          e.shieldHp = 0;
          e.isCoreExposed = true;
          e.coreTimer = 3.5;
          e.applyFreeze(3.5);
          if (window.particleEngine) window.particleEngine.addDamageText(e.x, e.y - 35, meltText, '#00ffff', true);
        }
        if (e.takeDamage(blastDamage * 1.4, true, '#00ffff')) {
          enemies.splice(i, 1);
        }
      }
    }

    // --- 2. TESLA: ZEUS 100,000V SUPER STORM ---
    else if (this.currentClass === 'class_tesla' || this.currentClass === 'tesla') {
      if (window.particleEngine) {
        window.particleEngine.addShockwave(this.x, this.y, '#ffee00', blastRadius * 1.4, 0.45);
        window.particleEngine.shake(18, 0.4);
      }
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.applyFreeze(3.0);
        if (window.particleEngine) window.particleEngine.addSparks(e.x, e.y, '#ffee00', 8, 1.4);
        if (e.isBoss) {
          e.shieldActive = false;
          e.shieldHp = 0;
          e.isCoreExposed = true;
          e.coreTimer = 3.5;
        }
        if (e.takeDamage(blastDamage * 1.25, true, '#ffee00')) {
          enemies.splice(i, 1);
        }
      }
    }

    // --- 3. DREADNOUGHT: THERMONUCLEAR NUKE BARRAGE ---
    else if (this.currentClass === 'class_dreadnought' || this.currentClass === 'dreadnought' || this.currentClass === 'heavy') {
      if (window.particleEngine) {
        window.particleEngine.addExplosion(this.x, this.y, '#ff5500', true);
        window.particleEngine.shake(24, 0.5);
      }
      for (let m = 0; m < 12; m++) {
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        if (target) {
          this.missiles.push({
            x: this.x,
            y: this.y,
            target,
            speed: 7.5,
            damage: 180 * this.stats.damageMult,
            life: 3.0
          });
        }
      }
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.isBoss) {
          e.shieldActive = false;
          e.shieldHp = 0;
          e.isCoreExposed = true;
          e.coreTimer = 3.5;
        }
        if (e.takeDamage(blastDamage * 1.5, true, '#ff5500')) {
          enemies.splice(i, 1);
        }
      }
    }

    // --- 4. CRYO CITADEL: ABSOLUTE ZERO GLACIAL SHATTER ---
    else if (this.currentClass === 'class_cryo' || this.currentClass === 'cryo') {
      if (window.particleEngine) {
        window.particleEngine.addShockwave(this.x, this.y, '#00e1ff', 650, 0.5);
      }
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.applyFreeze(5.0);
        if (e.isBoss) {
          e.shieldActive = false;
          e.shieldHp = 0;
          e.isCoreExposed = true;
          e.coreTimer = 4.0;
        }
        if (window.particleEngine) window.particleEngine.addSparks(e.x, e.y, '#00e1ff', 10, 1.2);
        if (e.takeDamage(blastDamage * 1.15, true, '#00e1ff')) {
          enemies.splice(i, 1);
        }
      }
    }

    return true;
  }

  update(dt, enemies, enemyProjectiles, onPassiveChips = () => {}) {
    this.dishAngle += dt * 2.0;
    this.crystalSpin += dt * 3.0;

    this.recoilOffset.x *= 0.85;
    this.recoilOffset.y *= 0.85;

    if (this.emergencyShieldTimer > 0) {
      this.emergencyShieldTimer -= dt;
    }

    if (this.upgrades.cryptoMiner > 0) {
      this.cryptoMinerTimer += dt;
      if (this.cryptoMinerTimer >= 4.0) {
        this.cryptoMinerTimer = 0;
        const minedChips = this.upgrades.cryptoMiner;
        onPassiveChips(minedChips);
        if (window.particleEngine) {
          window.particleEngine.addDamageText(this.x, this.y - 20, `+${minedChips} 🪙`, '#ffee00', false);
        }
      }
    }

    if (this.stats.regenHpSec > 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.stats.regenHpSec * dt);
    }

    if (this.isOverdrive) {
      for (const e of enemies) {
        const d = Math.hypot(this.x - e.x, this.y - e.y);
        if (d > this.radius + e.radius && d < 380) {
          const angle = Math.atan2(this.y - e.y, this.x - e.x);
          e.x += Math.cos(angle) * 3.8 * dt * 60;
          e.y += Math.sin(angle) * 3.8 * dt * 60;
        }
      }
    }

    if (this.shield < this.maxShield) {
      this.shieldRechargeTimer += dt;
      if (this.shieldRechargeTimer >= this.shieldRechargeDelay) {
        this.shield = Math.min(this.maxShield, this.shield + 45 * dt);
      }
    }

    if (this.empCooldown > 0) {
      this.empCooldown = Math.max(0, this.empCooldown - dt);
    }

    const currentRange = this.stats.baseRange * this.stats.rangeMult;

    // Manual Focus Beam
    if (this.isManualAiming) {
      if (window.soundEngine) window.soundEngine.playFocusBeam();
      const focusDmg = 90 * this.stats.damageMult * dt;

      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (Math.hypot(e.x - this.manualAimTarget.x, e.y - this.manualAimTarget.y) <= e.radius + 25) {
          if (window.particleEngine) {
            window.particleEngine.addSparks(e.x, e.y, '#ff007f', 2, 0.6);
          }
          if (e.takeDamage(focusDmg, true, '#ff007f')) {
            enemies.splice(j, 1);
          }
        }
      }
    }

    // Auto-Targeting
    this.shootTimer += dt;
    const currentFireInterval = this.baseFireInterval / this.stats.fireRateMult;

    if (this.shootTimer >= currentFireInterval && enemies.length > 0) {
      let priorityTarget = null;
      let minDistance = Infinity;

      for (const enemy of enemies) {
        const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (d <= currentRange) {
          if (enemy.type === 'shooter' && d < minDistance) {
            minDistance = d;
            priorityTarget = enemy;
          }
        }
      }

      if (!priorityTarget) {
        for (const enemy of enemies) {
          const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (d <= currentRange && d < minDistance) {
            minDistance = d;
            priorityTarget = enemy;
          }
        }
      }

      if (priorityTarget) {
        this.shootTimer = 0;
        this.firePrimaryProjectiles(priorityTarget);
      }
    }

    // Update Projectiles & Bullet Interception
    if (this.projectiles.length > 80) {
      this.projectiles.splice(0, this.projectiles.length - 80);
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life -= dt;

      if (window.particleEngine) {
        window.particleEngine.addTrail(p.x, p.y, this.towerColor, 3);
      }

      if (enemyProjectiles) {
        for (let b = enemyProjectiles.length - 1; b >= 0; b--) {
          const ep = enemyProjectiles[b];
          if (Math.hypot(ep.x - p.x, ep.y - p.y) <= ep.radius + p.radius + 4) {
            if (window.particleEngine) window.particleEngine.addSparks(ep.x, ep.y, '#00ffff', 4, 0.8);
            enemyProjectiles.splice(b, 1);
            p.life = 0;
            break;
          }
        }
      }

      let hit = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (Math.hypot(enemy.x - p.x, enemy.y - p.y) <= enemy.radius + p.radius) {
          hit = true;
          const isCrit = Math.random() < this.stats.critChance;
          const dmg = p.damage * (isCrit ? this.stats.critMult : 1);

          if (isCrit && this.upgrades.singularity && window.particleEngine) {
            window.particleEngine.addBlackHole(enemy.x, enemy.y);
          }

          if (this.implants.chaos && Math.random() < 0.30 && window.particleEngine) {
            window.particleEngine.addExplosion(enemy.x, enemy.y, '#ffaa00', false);
          }

          if (isCrit && this.implants.vampire) {
            this.hp = Math.min(this.maxHp, this.hp + 25);
            if (window.particleEngine) window.particleEngine.addDamageText(this.x, this.y, '+25 HP', '#39ff14');
          }

          if (this.upgrades.chainLightning) {
            this.triggerChainLightning(enemy, enemies, this.upgrades.lightningChains, dmg * 0.8);
          }

          if (this.upgrades.leechChance > 0 && Math.random() < this.upgrades.leechChance) {
            this.hp = Math.min(this.maxHp, this.hp + 20);
            if (window.particleEngine) window.particleEngine.addDamageText(this.x, this.y, '+20 HP', '#39ff14');
          }

          if (enemy.takeDamage(dmg, isCrit, this.towerColor)) {
            enemies.splice(j, 1);
          }

          if (p.bouncesLeft > 0 && enemies.length > 0) {
            p.bouncesLeft--;
            const nextTarget = enemies.find(e => e !== enemy && Math.hypot(e.x - p.x, e.y - p.y) < 240);
            if (nextTarget) {
              const angle = Math.atan2(nextTarget.y - p.y, nextTarget.x - p.x);
              p.vx = Math.cos(angle) * 10;
              p.vy = Math.sin(angle) * 10;
              hit = false;
            }
          }
          break;
        }
      }

      if (hit || p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // OMEGA EVOLUTION: Orbital Ion Cannon
    if (this.evolutions.ionCannon) {
      this.ionTimer += dt;
      if (this.ionTimer >= 3.5 && enemies.length > 0) {
        this.ionTimer = 0;
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        if (window.particleEngine) {
          window.particleEngine.addIonCannon(target.x, target.y);
        }
        if (window.soundEngine) window.soundEngine.playIonBlast();

        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(e.x - target.x, e.y - target.y) <= 140) {
            if (e.takeDamage(320 * this.stats.damageMult, true, '#00ffff')) {
              enemies.splice(j, 1);
            }
          }
        }
      }
    }

    // Rotating Laser Beam
    if (this.upgrades.laserRay) {
      this.laserAngle += dt * 1.6;
      const laserLength = currentRange;
      const lx = this.x + Math.cos(this.laserAngle) * laserLength;
      const ly = this.y + Math.sin(this.laserAngle) * laserLength;
      const laserDmg = 65 * this.stats.damageMult * this.upgrades.laserDamageMult * dt;

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (this.distToSegment({ x: this.x, y: this.y }, { x: lx, y: ly }, enemy) <= enemy.radius + 8) {
          if (enemy.takeDamage(laserDmg, false, '#ff007f')) {
            enemies.splice(j, 1);
          }
        }
      }
    }

    // Orbiting Drones & Deflection
    if (this.upgrades.dronesEnabled && this.upgrades.droneCount > 0) {
      const droneSpeed = this.evolutions.blizzardSaw ? 6.0 : 3.2;
      this.droneAngle += dt * droneSpeed;
      const droneOrbitRadius = 90;
      const count = this.upgrades.droneCount;

      for (let i = 0; i < count; i++) {
        const angle = this.droneAngle + (Math.PI * 2 * i) / count;
        const dx = this.x + Math.cos(angle) * droneOrbitRadius;
        const dy = this.y + Math.sin(angle) * droneOrbitRadius;

        if (enemyProjectiles) {
          for (let b = enemyProjectiles.length - 1; b >= 0; b--) {
            const ep = enemyProjectiles[b];
            if (Math.hypot(ep.x - dx, ep.y - dy) <= 16) {
              enemyProjectiles.splice(b, 1);
            }
          }
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (Math.hypot(enemy.x - dx, enemy.y - dy) <= enemy.radius + 16) {
            const droneDmg = (this.evolutions.blizzardSaw ? 120 : 70) * this.stats.damageMult * dt * 4;
            if (this.evolutions.blizzardSaw) enemy.applyFreeze(1.8);
            if (enemy.takeDamage(droneDmg, false, '#9d00ff')) {
              enemies.splice(j, 1);
            }
          }
        }
      }
    }

    // Acid Nano-Mines Spawner
    if (this.upgrades.minesEnabled) {
      this.mineTimer += dt;
      if (this.mineTimer >= 3.0) {
        this.mineTimer = 0;
        for (let i = 0; i < this.upgrades.mineCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (currentRange * 0.7) + 40;
          this.mines.push({
            x: this.x + Math.cos(angle) * dist,
            y: this.y + Math.sin(angle) * dist,
            radius: 14,
            damage: 85 * this.stats.damageMult,
            life: 14.0
          });
        }
      }
    }

    // Acid Nano-Mines Update & Detonation
    if (this.mines.length > 0) {
      if (this.mines.length > 25) {
        this.mines.splice(0, this.mines.length - 25);
      }
      for (let i = this.mines.length - 1; i >= 0; i--) {
        const mine = this.mines[i];
        mine.life -= dt;
        let triggered = false;

        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (Math.hypot(enemy.x - mine.x, enemy.y - mine.y) <= enemy.radius + mine.radius) {
            triggered = true;
            if (window.particleEngine) {
              window.particleEngine.addExplosion(mine.x, mine.y, this.evolutions.clusterNapalm ? '#ff5500' : '#39ff14', false);
            }
            if (window.soundEngine) window.soundEngine.playExplosion('small');

            for (let k = enemies.length - 1; k >= 0; k--) {
              const near = enemies[k];
              if (Math.hypot(near.x - mine.x, near.y - mine.y) <= 85) {
                near.applyBurn(3.5, 45 * this.stats.damageMult);
                if (near.takeDamage(mine.damage, false, '#ff5500')) {
                  enemies.splice(k, 1);
                }
              }
            }
            break;
          }
        }

        if (triggered || mine.life <= 0) {
          this.mines.splice(i, 1);
        }
      }
    }

    // Cryo Stun Matrix
    if (this.upgrades.cryoFreeze) {
      this.cryoTimer += dt;
      if (this.cryoTimer >= 3.5) {
        this.cryoTimer = 0;
        if (window.particleEngine) {
          window.particleEngine.addShockwave(this.x, this.y, '#00e1ff', currentRange * 0.9, 0.35);
        }
        for (const enemy of enemies) {
          if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= currentRange * 0.9) {
            enemy.applyFreeze(2.2 + (this.upgrades.freezeDuration || 0));
          }
        }
      }
    }

    // Homing Missiles Spawner
    if (this.upgrades.missilesEnabled) {
      this.missileTimer += dt;
      if (this.missileTimer >= 1.8 && enemies.length > 0) {
        this.missileTimer = 0;
        for (let i = 0; i < this.upgrades.missileCount; i++) {
          const target = enemies[Math.floor(Math.random() * enemies.length)];
          this.missiles.push({
            x: this.x,
            y: this.y,
            target,
            speed: 6.0,
            damage: 95 * this.stats.damageMult,
            life: 3.5
          });
        }
        if (window.soundEngine) window.soundEngine.playShoot('missile');
      }
    }

    // Homing Missiles & Dreadnought EMP Missiles Update & Detonation
    if (this.missiles.length > 0) {
      if (this.missiles.length > 30) {
        this.missiles.splice(0, this.missiles.length - 30);
      }
      for (let i = this.missiles.length - 1; i >= 0; i--) {
        const m = this.missiles[i];
        m.life -= dt;

        if (m.target && m.target.hp > 0) {
          const angle = Math.atan2(m.target.y - m.y, m.target.x - m.x);
          m.x += Math.cos(angle) * m.speed * dt * 60;
          m.y += Math.sin(angle) * m.speed * dt * 60;
        } else if (enemies.length > 0) {
          m.target = enemies[0];
        }

        let exploded = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (Math.hypot(enemy.x - m.x, enemy.y - m.y) <= enemy.radius + 8) {
            exploded = true;
            if (window.particleEngine) {
              window.particleEngine.addExplosion(m.x, m.y, '#ffee00', true);
            }
            if (window.soundEngine) window.soundEngine.playExplosion('small');

            for (let k = enemies.length - 1; k >= 0; k--) {
              const near = enemies[k];
              if (Math.hypot(near.x - m.x, near.y - m.y) <= 85) {
                if (near.takeDamage(m.damage, true, '#ffee00')) {
                  enemies.splice(k, 1);
                }
              }
            }
            break;
          }
        }

        if (exploded || m.life <= 0) {
          this.missiles.splice(i, 1);
        }
      }
    }
  }

  firePrimaryProjectiles(target) {
    const baseAngle = Math.atan2(target.y - this.y, target.x - this.x);
    const count = this.upgrades.projectilesPerShot || 1;
    const spreadAngle = 0.14;

    this.recoilOffset.x = -Math.cos(baseAngle) * 4;
    this.recoilOffset.y = -Math.sin(baseAngle) * 4;

    for (let i = 0; i < count; i++) {
      const angleOffset = (i - (count - 1) / 2) * spreadAngle;
      const finalAngle = baseAngle + angleOffset;
      const speed = 10.5;

      this.projectiles.push({
        x: this.x + Math.cos(finalAngle) * this.radius,
        y: this.y + Math.sin(finalAngle) * this.radius,
        vx: Math.cos(finalAngle) * speed,
        vy: Math.sin(finalAngle) * speed,
        radius: 5.0,
        damage: this.stats.baseDamage * this.stats.damageMult,
        bouncesLeft: this.upgrades.ricochets || 0,
        life: 1.8
      });
    }

    if (window.soundEngine) window.soundEngine.playShoot('basic');
  }

  triggerChainLightning(originEnemy, allEnemies, chainCount, damage) {
    let currentOrigin = originEnemy;
    const hitSet = new Set([originEnemy]);

    for (let c = 0; c < chainCount; c++) {
      let nearest = null;
      let minDist = 220;

      for (const other of allEnemies) {
        if (!hitSet.has(other)) {
          const d = Math.hypot(other.x - currentOrigin.x, other.y - currentOrigin.y);
          if (d < minDist) {
            minDist = d;
            nearest = other;
          }
        }
      }

      if (nearest) {
        hitSet.add(nearest);
        if (window.particleEngine) {
          window.particleEngine.addSparks(nearest.x, nearest.y, '#00ffff', 6, 1.2);
        }
        if (window.soundEngine) window.soundEngine.playZap();
        nearest.takeDamage(damage, false, '#00ffff');
        currentOrigin = nearest;
      } else {
        break;
      }
    }
  }

  distToSegment(p1, p2, p) {
    const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - p1.x, p.y - p1.y);
    let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (p1.x + t * (p2.x - p1.x)), p.y - (p1.y + t * (p2.y - p1.y)));
  }

  // --- UNIQUE GEOMETRIC SHAPES FOR EACH SKIN ---
  draw(ctx) {
    ctx.save();

    const range = this.stats.baseRange * this.stats.rangeMult;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(this.x, this.y, range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (this.isManualAiming) {
      ctx.save();
      // Outer Cyan Energy Ray
      ctx.strokeStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 26;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.manualAimTarget.x, this.manualAimTarget.y);
      ctx.stroke();

      // Inner Hyper-Intense White Core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.manualAimTarget.x, this.manualAimTarget.y);
      ctx.stroke();

      // High-Tech Cyber Crosshair at Target
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.manualAimTarget.x, this.manualAimTarget.y, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair reticle ticks
      ctx.beginPath();
      ctx.moveTo(this.manualAimTarget.x - 22, this.manualAimTarget.y);
      ctx.lineTo(this.manualAimTarget.x + 22, this.manualAimTarget.y);
      ctx.moveTo(this.manualAimTarget.x, this.manualAimTarget.y - 22);
      ctx.lineTo(this.manualAimTarget.x, this.manualAimTarget.y + 22);
      ctx.stroke();
      ctx.restore();
    } else if (this.upgrades.laserRay) {
      const lx = this.x + Math.cos(this.laserAngle) * range;
      const ly = this.y + Math.sin(this.laserAngle) * range;
      ctx.save();
      ctx.strokeStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 24;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(lx, ly);
      ctx.stroke();
      ctx.restore();
    }

    for (const mine of this.mines) {
      ctx.save();
      ctx.fillStyle = this.evolutions.clusterNapalm ? '#ff5500' : '#39ff14';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(mine.x, mine.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const p of this.projectiles) {
      ctx.save();
      ctx.fillStyle = this.towerColor;
      ctx.shadowColor = this.towerColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const m of this.missiles) {
      ctx.save();
      ctx.fillStyle = '#ffee00';
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this.upgrades.dronesEnabled && this.upgrades.droneCount > 0) {
      const count = this.upgrades.droneCount;
      const droneOrbitRadius = 90;
      for (let i = 0; i < count; i++) {
        const angle = this.droneAngle + (Math.PI * 2 * i) / count;
        const dx = this.x + Math.cos(angle) * droneOrbitRadius;
        const dy = this.y + Math.sin(angle) * droneOrbitRadius;

        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(this.droneAngle * 5);

        const primaryColor = this.evolutions.blizzardSaw ? '#00e1ff' : '#9d00ff';
        const glowColor = this.evolutions.blizzardSaw ? '#00ffff' : '#ff00ff';

        // 1. Spinning 6-Tooth Energy Saw Blade
        ctx.fillStyle = primaryColor;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        for (let s = 0; s < 12; s++) {
          const sa = (Math.PI / 6) * s;
          const r = (s % 2 === 0) ? 14 : 7;
          const px = Math.cos(sa) * r;
          const py = Math.sin(sa) * r;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Armored Center Hub
        ctx.fillStyle = '#060a17';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // 3. Glowing Neon Reactor Eye
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // --- DRAW PHYSICAL TOWER BODY BASED ON SKIN ID ---
    ctx.save();
    ctx.translate(this.x + this.recoilOffset.x, this.y + this.recoilOffset.y);

    const nowSec = Date.now() * 0.003;

    // 🌌 1. Base Orbital Holographic Ring & Floating Anti-Grav Nodes
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let p = 0; p < 4; p++) {
      const pa = (Math.PI / 2) * p + nowSec * 0.8;
      const px = Math.cos(pa) * (this.radius + 14);
      const py = Math.sin(pa) * (this.radius + 14);
      ctx.fillStyle = this.towerColor;
      ctx.shadowColor = this.towerColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 🔫 2. Multi-Stage Futuristic Railgun Barrels
    const barrelCount = this.upgrades.projectilesPerShot || 1;
    for (let b = 0; b < barrelCount; b++) {
      const bAngle = (Math.PI * 2 * b) / barrelCount;
      ctx.save();
      ctx.rotate(bAngle);

      // Main Railgun Housing
      ctx.fillStyle = '#051329';
      ctx.strokeStyle = this.towerColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.towerColor;
      ctx.shadowBlur = 10;
      ctx.fillRect(this.radius - 4, -5, 16, 10);
      ctx.strokeRect(this.radius - 4, -5, 16, 10);

      // Plasma Accelerator Coils
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.radius + 4, -3, 3, 6);
      ctx.fillRect(this.radius + 9, -3, 3, 6);
      ctx.restore();
    }

    // 🏛️ 3. Physical Tower Body & Core by Skin ID
    if (this.skinId === 'skin_gold') {
      // 1. «Золотой Владыка» (12-Pointed Solar Archon Crown Star)
      ctx.fillStyle = '#1c1303';
      ctx.strokeStyle = '#ffee00';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ffee00';
      ctx.shadowBlur = 24;

      ctx.beginPath();
      const points = 12;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? this.radius + 8 : this.radius * 0.65;
        const a = (Math.PI / points) * i + nowSec * 0.5;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Spinning Sun Corona Core
      ctx.fillStyle = '#ffee00';
      ctx.shadowColor = '#ffee00';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.skinId === 'skin_phantom') {
      // 2. «Теневой Призрак» (Dark Matter Hexagon Monolith + Floating Rift Shards)
      ctx.fillStyle = '#0b0217';
      ctx.strokeStyle = '#9d00ff';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 26;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = Math.cos(a) * (this.radius + 2);
        const py = Math.sin(a) * (this.radius + 2);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3 Detached Floating Outer Rift Shards
      for (let s = 0; s < 3; s++) {
        const sa = nowSec * 1.5 + (Math.PI * 2 * s) / 3;
        const sx = Math.cos(sa) * (this.radius + 14);
        const sy = Math.sin(sa) * (this.radius + 14);
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Singularity Black Hole Core
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9d00ff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

    } else if (this.skinId === 'skin_retro') {
      // 3. «Ретровейв 1984» (Arcade Stepped Laser Pyramid)
      ctx.fillStyle = '#1f0418';
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 22;

      ctx.beginPath();
      ctx.moveTo(0, -this.radius - 10);
      ctx.lineTo(this.radius + 8, this.radius + 6);
      ctx.lineTo(0, this.radius + 2);
      ctx.lineTo(-this.radius - 8, this.radius + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // CRT Scanline Grid Core
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(-9, -9, 18, 18);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(-5, -5, 10, 10);

    } else {
      // 4. «Неоновый Киберпанк» (Default Octagon Orbital Spire)
      ctx.fillStyle = '#051329';
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 22;

      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i;
        const x = Math.cos(a) * this.radius;
        const y = Math.sin(a) * this.radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4 Cardinal Antenna Pylons
      for (let p = 0; p < 4; p++) {
        const pa = (Math.PI / 2) * p;
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.fillRect(Math.cos(pa) * (this.radius - 1) - 3, Math.sin(pa) * (this.radius - 1) - 3, 6, 6);
      }

      const pulse = 1 + Math.sin(nowSec * 2) * 0.18;
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 10 * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // 🛡️ 4. Futuristic Hexagonal Energy Shield Dome
    if (this.shield > 0 || this.emergencyShieldTimer > 0) {
      const shieldPercent = this.shield / this.maxShield;
      const shieldColor = this.emergencyShieldTimer > 0 ? '#ffee00' : `rgba(0, 255, 255, ${0.45 + shieldPercent * 0.45})`;
      ctx.strokeStyle = shieldColor;
      ctx.lineWidth = this.emergencyShieldTimer > 0 ? 5.0 : 3.5;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 11, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }
}

window.Tower = Tower;
