// Upgrade card definitions and deck manager
// Handles rogue card draws, card weights, and omega evolutions

const CYBER_IMPLANTS = [
  {
    id: 'imp_chaos',
    nameKey: 'impChaosName',
    descKey: 'impChaosDesc',
    name: 'Печать Хаоса',
    nameEn: 'Mark of Chaos',
    desc: '30% шанс вызвать взрыв при любом прямом попадании',
    icon: '☢️',
    cost: 50
  },
  {
    id: 'imp_vampire',
    nameKey: 'impVampireName',
    descKey: 'impVampireDesc',
    name: 'Вампиризм Нанитов',
    nameEn: 'Nanite Vampirism',
    desc: 'Критические попадания лечат базу на +25 HP',
    icon: '🩸',
    cost: 60
  },
  {
    id: 'imp_magnet',
    nameKey: 'impMagnetName',
    descKey: 'impMagnetDesc',
    name: 'Грави-Магнит',
    nameEn: 'Graviton Magnet',
    desc: 'Радиус притяжения чипов и опыта увеличен на +80%',
    icon: '🧲',
    cost: 40
  }
];

const TOWER_CLASSES = [
  {
    id: 'default',
    nameKey: 'classDefaultName',
    descKey: 'classDefaultDesc',
    name: 'Страж (Баланс)',
    nameEn: 'Sentinel (Balanced)',
    desc: 'Сбалансированная турель с универсальным уроном и автоприцелом',
    icon: '⚡',
    color: '#00ffff',
    baseHpBonus: 0,
    baseDmgMult: 1.0,
    fireRateMult: 1.0,
    passive: 'Сбалансированный'
  },
  {
    id: 'tesla',
    nameKey: 'classTeslaName',
    descKey: 'classTeslaDesc',
    name: 'Тесла (Цепной шторм)',
    nameEn: 'Tesla (Chain Storm)',
    desc: 'Стартует с Цепной Молнией. Высокая скорость стрельбы',
    icon: '🌩️',
    color: '#00e1ff',
    baseHpBonus: -75,
    baseDmgMult: 0.9,
    fireRateMult: 1.30,
    startPerk: 'chain_lightning',
    passive: 'Цепной разряд'
  },
  {
    id: 'dreadnought',
    nameKey: 'classDreadnoughtName',
    descKey: 'classDreadnoughtDesc',
    name: 'Дредноут (Тяжёлая броня)',
    nameEn: 'Dreadnought (Heavy Armor)',
    desc: '+350 HP, силовой щит и стартовые кислотные нано-мины',
    icon: '💥',
    color: '#ffaa00',
    baseHpBonus: 250,
    baseDmgMult: 1.45,
    fireRateMult: 0.80,
    startPerk: 'acid_mines',
    passive: 'Тяжелый сплеш'
  },
  {
    id: 'cryo',
    nameKey: 'classCryoName',
    descKey: 'classCryoDesc',
    name: 'Крио-Фокус (Заморозка)',
    nameEn: 'Cryo-Focus (Permafrost)',
    desc: 'Стартует с заморозкой мобов и увеличенным радиусом сенсоров',
    icon: '❄️',
    color: '#9d00ff',
    baseHpBonus: 50,
    baseDmgMult: 1.0,
    fireRateMult: 1.0,
    startPerk: 'cryo_blast',
    passive: 'Ледяной купол'
  }
];

const OMEGA_EVOLUTIONS = [
  {
    id: 'evo_ion_cannon',
    nameKey: 'evoIonName',
    descKey: 'evoIonDesc',
    name: 'ИОННЫЙ ОРБИТАЛЬНЫЙ ЗАЛП',
    nameEn: 'ORBITAL ION CANNON',
    req: ['chain_lightning', 'death_ray'],
    desc: 'Орбитальный спутник выжигает огромные зоны лазером (Лазер + Молния)',
    icon: '🌌',
    color: '#00ffff',
    apply: (tower) => {
      tower.evolutions.ionCannon = true;
    }
  },
  {
    id: 'evo_cluster_napalm',
    nameKey: 'evoNapalmName',
    descKey: 'evoNapalmDesc',
    name: 'АДСКИЙ НАПАЛМ',
    nameEn: 'HELLFIRE NAPALM',
    req: ['acid_mines', 'multishot'],
    desc: 'Мины разрываются на кассетные зажигательные бомбы (Мины + Залп)',
    icon: '🌋',
    color: '#ff5500',
    apply: (tower) => {
      tower.evolutions.clusterNapalm = true;
    }
  },
  {
    id: 'evo_blizzard_saw',
    nameKey: 'evoBlizzardName',
    descKey: 'evoBlizzardDesc',
    name: 'ЛЕЗВИЕ БУРИ',
    nameEn: 'BLIZZARD SAW',
    req: ['buzzsaw_drones', 'cryo_blast'],
    desc: 'Дроны замораживают и шинкуют толпы на ледяные осколки (Дроны + Крио)',
    icon: '❄️',
    color: '#00ffff',
    apply: (tower) => {
      tower.evolutions.blizzardSaw = true;
    }
  }
];

const UPGRADE_CARDS = [
  {
    id: 'death_ray',
    nameKey: 'cardLaserName',
    descKey: 'cardLaserDesc',
    name: 'Плазменный Лазер',
    nameEn: 'Plasma Laser',
    desc: 'Вращающийся непрерывный луч плазмы сквозь врагов',
    icon: '🔴',
    rarity: 'rare',
    apply: (tower) => {
      tower.upgrades.laserRay = true;
      tower.upgrades.laserDamageMult += 0.35;
    }
  },
  {
    id: 'chain_lightning',
    nameKey: 'cardLightningName',
    descKey: 'cardLightningDesc',
    name: 'Цепная Молния',
    nameEn: 'Chain Lightning',
    desc: 'Выстрелы бьют молнией в 3 ближайших врагов',
    icon: '🌩️',
    rarity: 'rare',
    apply: (tower) => {
      tower.upgrades.chainLightning = true;
      tower.upgrades.lightningChains = (tower.upgrades.lightningChains || 3) + 1;
      tower.upgrades.chainCount = tower.upgrades.lightningChains;
    }
  },
  {
    id: 'ricochet',
    nameKey: 'cardRicochetName',
    descKey: 'cardRicochetDesc',
    name: 'Рикошетный Снаряд',
    nameEn: 'Ricochet Shell',
    desc: 'Пули отскакивают в следующую цель при попадании',
    icon: '🪃',
    rarity: 'common',
    apply: (tower) => {
      tower.upgrades.ricochets = (tower.upgrades.ricochets || 0) + 1;
      tower.upgrades.ricochet = true;
      tower.upgrades.ricochetBounces = tower.upgrades.ricochets;
    }
  },
  {
    id: 'multishot',
    nameKey: 'cardMultiName',
    descKey: 'cardMultiDesc',
    name: 'Залповый Огонь',
    nameEn: 'Multishot Barrage',
    desc: '+1 дополнительный снаряд за каждый выстрел',
    icon: '🔱',
    rarity: 'rare',
    apply: (tower) => {
      tower.upgrades.projectilesPerShot = (tower.upgrades.projectilesPerShot || 1) + 1;
      tower.upgrades.multishotCount = tower.upgrades.projectilesPerShot;
    }
  },
  {
    id: 'acid_mines',
    nameKey: 'cardMinesName',
    descKey: 'cardMinesDesc',
    name: 'Кислотные Нано-Мины',
    nameEn: 'Acid Nano-Mines',
    desc: 'Сбрасывает мины с едким химическим ожогом',
    icon: '☣️',
    rarity: 'epic',
    apply: (tower) => {
      tower.upgrades.minesEnabled = true;
      tower.upgrades.mineCount += 2;
    }
  },
  {
    id: 'vampirism',
    nameKey: 'cardLeechName',
    descKey: 'cardLeechDesc',
    name: 'Нано-Вампиризм',
    nameEn: 'Nano-Leech',
    desc: '15% шанс восстановить 20 HP при убийстве врага',
    icon: '🩸',
    rarity: 'epic',
    apply: (tower) => {
      tower.upgrades.leechChance = Math.min(0.5, (tower.upgrades.leechChance || 0) + 0.15);
      tower.upgrades.vampirismChance = tower.upgrades.leechChance;
    }
  },
  {
    id: 'buzzsaw_drones',
    nameKey: 'cardDronesName',
    descKey: 'cardDronesDesc',
    name: 'Дроны-Пилы',
    nameEn: 'Buzzsaw Drones',
    desc: 'Вращающиеся орбитальные пилы, уничтожающие пули и мобов',
    icon: '🪚',
    rarity: 'epic',
    apply: (tower) => {
      tower.upgrades.dronesEnabled = true;
      tower.upgrades.droneCount += 1;
    }
  },
  {
    id: 'cryo_blast',
    nameKey: 'cardCryoName',
    descKey: 'cardCryoDesc',
    name: 'Крио-Заморозка',
    nameEn: 'Cryo-Freeze Pulse',
    desc: 'Периодическая импульсная заморозка мобов вокруг',
    icon: '❄️',
    rarity: 'rare',
    apply: (tower) => {
      tower.upgrades.cryoFreeze = true;
      tower.upgrades.freezeDuration += 0.8;
    }
  },
  {
    id: 'supernova_nova',
    nameKey: 'cardNovaName',
    descKey: 'cardNovaDesc',
    name: 'Овердрайв Сверхновая',
    nameEn: 'Supernova Overdrive',
    desc: 'Увеличивает радиус и урон Овердрайва (Пробел)',
    icon: '💥',
    rarity: 'rare',
    apply: (tower) => {
      tower.upgrades.empSupernova = true;
      tower.upgrades.empRadiusMult = (tower.upgrades.empRadiusMult || 1.0) + 0.35;
      tower.upgrades.empDamageMult = (tower.upgrades.empDamageMult || 1.0) + 0.50;
    }
  },
  {
    id: 'homing_missiles',
    nameKey: 'cardMissilesName',
    descKey: 'cardMissilesDesc',
    name: 'Самонаводящиеся Ракеты',
    nameEn: 'Homing Micro-Missiles',
    desc: 'Запуск самонаводящихся микро-ракет во врагов',
    icon: '🚀',
    rarity: 'legendary',
    apply: (tower) => {
      tower.upgrades.missilesEnabled = true;
      tower.upgrades.homingMissiles = true;
      tower.upgrades.missileCount = (tower.upgrades.missileCount || 0) + 2;
    }
  },
  {
    id: 'singularity_core',
    nameKey: 'cardSingularityName',
    descKey: 'cardSingularityDesc',
    name: 'Сингулярность',
    nameEn: 'Singularity Core',
    desc: 'Криты создают гравитационную чёрную дыру',
    icon: '🕳️',
    rarity: 'legendary',
    apply: (tower) => {
      tower.upgrades.singularity = true;
      tower.upgrades.singularityOnCrit = true;
    }
  },
  {
    id: 'crypto_miner',
    nameKey: 'cardMinerName',
    descKey: 'cardMinerDesc',
    name: 'Крипто-Майнер',
    nameEn: 'Crypto-Miner',
    desc: 'Пассивно генерирует +2 чипа каждые 4 секунды',
    icon: '⛏️',
    rarity: 'common',
    apply: (tower) => {
      tower.upgrades.cryptoMiner = (Number(tower.upgrades.cryptoMiner) || 0) + 2;
      tower.upgrades.minerLevel = (tower.upgrades.minerLevel || 0) + 1;
    }
  },
  {
    id: 'gold_rush',
    nameKey: 'cardGoldRushName',
    descKey: 'cardGoldRushDesc',
    name: 'Золотая Лихорадка',
    nameEn: 'Gold Rush Matrix',
    desc: '+25% к добыче чипов со всех убитых врагов',
    icon: '🪙',
    rarity: 'rare',
    apply: (tower) => {
      tower.stats.chipBonusMult += 0.25;
    }
  }
];

const ACHIEVEMENTS = [
  { id: 'first_blood', nameKey: 'achFirstBlood', descKey: 'achFirstBloodDesc', name: 'Первая Кровь', nameEn: 'First Blood', desc: 'Уничтожьте первого врага в секторе', reward: 25 },
  { id: 'first_upgrade', nameKey: 'achFirstUpgrade', descKey: 'achFirstUpgradeDesc', name: 'Первый Апгрейд', nameEn: 'First Upgrade', desc: 'Выберите первую карточку синергии', reward: 25 },
  { id: 'evo_master', nameKey: 'achEvoMaster', descKey: 'achEvoMasterDesc', name: 'Мастер Эволюций', nameEn: 'Evolution Master', desc: 'Активируйте мощную Омега-Эволюцию', reward: 100 },
  { id: 'boss_slayer', nameKey: 'achBossSlayer', descKey: 'achBossSlayerDesc', name: 'Победитель Босса', nameEn: 'Titan Slayer', desc: 'Уничтожьте гигантского Босса-Титана', reward: 150 },
  { id: 'wave_10', nameKey: 'achWave10', descKey: 'achWave10Desc', name: 'Ветеран 10 Волны', nameEn: 'Wave 10 Veteran', desc: 'Доберитесь до 10 волны в одном забеге', reward: 250 }
];

class UpgradeDeck {
  constructor() {
    this.deck = UPGRADE_CARDS;
  }

  drawCards(count = 3, luckLevel = 0) {
    const pool = [...this.deck];
    const drawn = [];

    const getWeight = (rarity) => {
      let w = 60;
      if (rarity === 'rare') w = 30 + luckLevel * 3;
      if (rarity === 'epic') w = 10 + luckLevel * 3;
      if (rarity === 'legendary') w = 3 + luckLevel * 2;
      return w;
    };

    while (drawn.length < count && pool.length > 0) {
      const totalWeight = pool.reduce((acc, card) => acc + getWeight(card.rarity), 0);
      let rand = Math.random() * totalWeight;

      for (let i = 0; i < pool.length; i++) {
        const card = pool[i];
        rand -= getWeight(card.rarity);
        if (rand <= 0) {
          drawn.push(card);
          pool.splice(i, 1);
          break;
        }
      }
    }

    return drawn;
  }

  checkEvolutions(tower, pickedCards) {
    const triggered = [];
    OMEGA_EVOLUTIONS.forEach(evo => {
      if (!tower.activeEvolutions) tower.activeEvolutions = [];
      if (tower.activeEvolutions.includes(evo.id)) return;

      const hasAll = evo.req.every(reqId => pickedCards.includes(reqId));
      if (hasAll) {
        tower.activeEvolutions.push(evo.id);
        evo.apply(tower);
        triggered.push(evo);
      }
    });
    return triggered;
  }
}

window.CYBER_IMPLANTS = CYBER_IMPLANTS;
window.TOWER_CLASSES = TOWER_CLASSES;
window.OMEGA_EVOLUTIONS = OMEGA_EVOLUTIONS;
window.UPGRADE_CARDS = UPGRADE_CARDS;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.upgradeDeck = new UpgradeDeck();
