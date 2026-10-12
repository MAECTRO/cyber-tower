// Cyber Tower - Localization Manager (RU / EN / TR)
// i18n dictionary and helper functions

const I18N_DATA = {
  ru: {
    // UI General & Menus
    gameTitle: 'КИБЕР БАШНЯ',
    gameSubtitle: 'КОСМИЧЕСКИЙ АВТОШУТЕР',
    fullGameTitle: 'Кибер Башня: Космический Автошутер',
    startRun: '⚔️ В БОЙ!',
    workshop: '🛠️ МАСТЕРСКАЯ И ИМПЛАНТЫ',
    achievements: '🏆 ДОСТИЖЕНИЯ И КВЕСТЫ',
    leaderboard: '👑 ЗАЛ СЛАВЫ (РЕКОРДЫ)',
    wheel: '🎡 КОЛЕСО ФОРТУНЫ',
    wheelTitle: '🎡 КОЛЕСО ФОРТУНЫ',
    wheelSubtitle: 'ЕЖЕДНЕВНОЕ ВРАЩЕНИЕ 1 РАЗ В ДЕНЬ',
    wheelUsedToday: '✅ ВРАЩЕНИЕ ИСПОЛЬЗОВАНО СЕГОДНЯ',
    wheelNextSpinTomorrow: '⌛ Следующее ежедневное вращение будет доступно завтра!',
    spinWheel: '🎰 КРУТИТЬ КОЛЕСО!',
    dailyGift: '🎁 ЕЖЕДНЕВНЫЙ БОНУС (+75 🪙)',
    giftClaimed: '✅ ПОДАРОК ПОЛУЧЕН!',
    highWave: 'РЕКОРД ВОЛНЫ',
    highScore: 'МАКС. СЧЕТ',
    chipBalance: 'БАЛАНС ЧИПОВ',
    selectTower: '1. ВЫБЕРИТЕ КЛАСС БАШНИ:',
    selectPet: '2. КИБЕР-ПИТОМЕЦ (КОМПАНЬОН):',
    selectBiome: '3. БИОМ / АРЕНА БИТВЫ:',
    selectSkin: '4. СКИНЫ И ФОРМА БАЗЫ:',
    active: 'АКТИВЕН',
    select: 'ВЫБРАТЬ',
    buy: 'КУПИТЬ',
    equipped: 'ЭКИПИРОВАН',
    equip: 'ВКЛЮЧИТЬ',
    level: 'Уровень',
    bonusDmgAll: 'Урона ко всем забегам',
    loadoutBtn: '⚙️ СНАРЯЖЕНИЕ И КЛАССЫ',
    loadoutTitle: '⚙️ АРСЕНАЛ И СНАРЯЖЕНИЕ',
    loadoutSubtitle: 'НАСТРОЙКА КЛАССА, ПИТОМЦА, БИОМА И СКИНА БАШНИ',
    loadoutPreview: 'АКТИВНЫЙ СЕТАП:',
    permanentBaseMods: 'ПОСТОЯННЫЕ МОДУЛИ БАЗЫ:',
    cyberImplantsRunes: 'КИБЕР-ИМПЛАНТЫ (АКТИВНЫЕ РУНЫ):',
    achievementsSubtitle: 'ВЫПОЛНЯЙТЕ КВЕСТЫ И ПОЛУЧАЙТЕ ЧИПЫ',
    // Radio, Codex & Missions
    codexBtn: '📖 КОДЕКС',
    codexTitle: '📖 КИБЕР-КОДЕКС СИНЕРГИЙ',
    codexSubtitle: 'ГАЛЕРЕЯ КАРТОЧЕК, ЭВОЛЮЦИЙ И КОМБИНАЦИЙ',
    collectionProgress: 'ПРОГРЕСС КОЛЛЕКЦИИ:',
    codexClaimReward: '🎁 ЗАБРАТЬ +500 ЧИПОВ!',
    codexClaimed: '✅ НАГРАДА ПОЛУЧЕНА (+500 🪙)',
    codexRewardLocked: 'Соберите 100% коллекции (+500 🪙)',
    
    synSuperconductor: 'Сверхпроводник',
    synSuperconductorDesc: '+40% к замораживающему электро-урону и шоку',
    synOrbitalTrap: 'Орбитальная Ловушка',
    synOrbitalTrapDesc: 'Мины активируют лазерные растяжки постоянного огня',
    synSingularitySwarm: 'Гравитационный Рой',
    synSingularitySwarmDesc: 'Чёрные дыры затягивают врагов прямо во вращающиеся пилы',
    synNuclearVampire: 'Ядерный Вампир',
    synNuclearVampireDesc: 'Взрывы ракет восстанавливают +15 HP башни за каждого убитого',

    missionsBtn: '📅 ЗАДАНИЯ',
    missionsTitle: '📅 МАТРИЦА ЗАДАНИЙ',
    missionsSubtitle: 'ЕЖЕДНЕВНЫЕ ОХОТНИЧЬИ КОНТРАКТЫ',
    missionKillsTitle: 'Истребитель Киберов',
    missionKillsDesc: 'Уничтожьте {target} любых врагов за сегодня',
    missionSlashTitle: 'Мастер Свайп-Клинка',
    missionSlashDesc: 'Разрубите {target} врагов или пуль жестом свайпа',
    missionWavesTitle: 'Выживший в Бездне',
    missionWavesDesc: 'Переживите {target} волн в одном забеге',

    radioBtn: '📻 РАДИО',
    radioTitle: '📻 СИНТВЕЙВ-РАДИО',
    radioSubtitle: 'ВЫБЕРИТЕ МУЗЫКАЛЬНУЮ ВОЛНУ',

    // In-game Modals
    levelUpTitle: '⚡ УЛУЧШЕНИЕ БАШНИ',
    levelUpSubtitle: 'ВЫБЕРИТЕ 1 ИЗ 3 КАРТОЧЕК СИНЕРГИИ (+5% УРОНА & РЕМОНТ!)',
    rerollCards: '🎬 СМЕНИТЬ КАРТЫ (РЕКЛАМА)',
    rouletteTitle: '🎰 КИБЕР-СУНДУК ФОРТУНЫ',
    rouletteSubtitle: 'СЕКТОР ПРИЗОВ РУЛЕТКИ',
    claimPrize: 'ЗАБРАТЬ ПРИЗ!',
    scanning: 'СКАНИРОВАНИЕ НАГРАДЫ...',
    wheelTitle: '🎡 КОЛЕСО ФОРТУНЫ',
    wheelSubtitle: 'КРУТИТЕ И ВЫИГРЫВАЙТЕ ДЖЕКПОТ!',
    spinWheel: '🎰 КРУТИТЬ КОЛЕСО!',
    backToMenu: '🏠 В ГЛАВНОЕ МЕНЮ',
    pauseTitle: '⏸️ ИГРА НА ПАУЗЕ',
    pauseSubtitle: 'ТАКТИЧЕСКИЙ ПЕРЕРЫВ',
    resumeBtn: '▶️ ПРОДОЛЖИТЬ',
    soundOn: '🔊 ЗВУК: ВКЛ',
    soundOff: '🔇 ЗВУК: ВЫКЛ',
    gameOverTitle: 'СИСТЕМА УНИЧТОЖЕНА',
    gameOverSubtitle: 'ОТЧЕТ О ЗАБЕГЕ',
    waveReached: 'ДОСТИГНУТА ВОЛНА',
    finalScore: 'ИТОГОВЫЙ СЧЕТ',
    earnedChips: 'ДОБЫТО ЧИПОВ',
    reviveBtn: '🎬 ВТОРОЙ ШАНС (ВОСКРЕШЕНИЕ 60% HP)',
    doubleChipsBtn: '🎬 x2 КИБЕР-ЧИПОВ ЗА РЕКЛАМУ',
    restartBtn: '🔄 НОВЫЙ ЗАБЕГ',
    overdriveReady: '⚡ ОВЕРДРАЙВ',
    overdriveCooldown: '⚡ ПЕРЕЗАРЯДКА',
    waveDone: 'ВОЛНА ПРОЙДЕНА!',
    bossKilled: 'МЕГА-БОСС УНИЧТОЖЕН!',
    bossAlert: '⚠️ ВНИМАНИЕ: МЕГА-БОСС ОБНАРУЖЕН!',
    leviathanAlert: '⚠️ ТРЕВОГА: КИБЕР-ЛЕВИАФАН ПРИБЫЛ!',
    emergencyShieldAlert: '⚡ ЭКСТРЕННЫЙ ЩИТ АКТИВИРОВАН!',
    evoAlert: '💥 ОМЕГА-ЭВОЛЮЦИЯ АКТИВИРОВАНА!',
    meteorEvent: '⚠️ СОБЫТИЕ: МЕТЕОРИТНЫЙ ДОЖДЬ!',
    stormEvent: '⚠️ СОБЫТИЕ: КИБЕР-ШТОРМ!',
    hallOfFameTop: 'ТОП-10 ЛУЧШИХ ЗАЩИТНИКОВ БАШНИ',
    loadingHall: 'Загрузка Зала Славы...',
    champion: '👑 ЧЕМПИОН',

    // Roulette Prizes
    prizeJackpot: '💥 ДЖЕКПОТ +100 ЧИПОВ',
    prizeLevels: '⚡ +3 УРОВНЯ СРАЗУ!',
    prizeRepair: '❤️‍🩹 ПОЛНЫЙ РЕМОНТ БАЗЫ',
    prizeIon: '🌌 ОРБИТАЛЬНЫЙ ИОННЫЙ ЗАЛП',

    // Classes
    classDefaultName: 'Страж (Баланс)',
    classDefaultDesc: 'Сбалансированная турель с универсальным уроном и автоприцелом',
    classTeslaName: 'Тесла (Цепной шторм)',
    classTeslaDesc: 'Стартует с Цепной Молнией. Высокая скорость стрельбы',
    classDreadnoughtName: 'Дредноут (Тяжёлая броня)',
    classDreadnoughtDesc: '+350 HP, силовой щит и стартовые кислотные нано-мины',
    classCryoName: 'Крио-Фокус (Заморозка)',
    classCryoDesc: 'Стартует с заморозкой мобов и увеличенным радиусом сенсоров',

    // Pets
    petRexName: 'Кибер-Пёс Рекс',
    petRexDesc: 'Пылесосит далекие кристаллы и кусает врагов на 80 DMG',
    petFalconName: 'Дрон-Снайпер Сокол',
    petFalconDesc: 'Парит над башней и расстреливает стрелков и боссов плазмой',
    petScarabName: 'Энерго-Скараб',
    petScarabDesc: 'Орбитальный защитник, отражает вражеские пули в силовой щит',

    // Biomes
    biomeCityName: '🌌 Туманность Ориона',
    biomeCityDesc: 'Бирюзово-фиолетовый глубокий космос с гигантской кольцевой планетой',
    biomeMatrixName: '🟢 Изумрудный Квазар',
    biomeMatrixDesc: 'Атмосфера зеленого звездного ветра и мерцающих пульсаров',
    biomeMagmaName: '🌋 Пылающая Сверхновая',
    biomeMagmaDesc: 'Багрово-янтарный солнечный катаклизм с потоками звездной пыли',

    // Skins
    skinCyanName: 'Неоновый Октагон',
    skinCyanDesc: 'Высокотехнологичный 8-гранник с 4 пилонами и плазменным реактором',
    skinGoldName: 'Корона Солнца',
    skinGoldDesc: '12-конечная царская звезда с вращающимися солярными рунами',
    skinPhantomName: 'Теневой Гексагон',
    skinPhantomDesc: 'Обсидиановый монолит с 3 парящими по орбите кристаллами',
    skinRetroName: 'Аркадная Пирамида',
    skinRetroDesc: 'Ступенчатая неоновая пирамида 80-х с пиксельной CRT-матрицей',

    // Ranks
    rank1: 'Кибер-Кадет',
    rank2: 'Защитник Сектора',
    rank3: 'Ветеран Арены',
    rank4: 'Омега-Командир',
    rank5: 'Кибер-Бог Матрицы',

    // Workshop Upgrades
    upgHpName: 'Прочность Корпуса (+120 HP)',
    upgDmgName: 'Мощность Плазмы (+20% DMG)',
    upgRegenName: 'Нано-Регенерация (+3 HP/сек)',
    upgRangeName: 'Радиус Сенсоров (+12% Range)',
    upgLuckName: 'Кибер-Удача (Шанс Epic/Legendary)',

    // Implants
    impChaosName: 'Печать Хаоса',
    impChaosDesc: '30% шанс вызвать взрыв при любом прямом попадании',
    impVampireName: 'Вампиризм Нанитов',
    impVampireDesc: 'Критические попадания лечат базу на +25 HP',
    impMagnetName: 'Грави-Магнит',
    impMagnetDesc: 'Радиус притяжения чипов и опыта увеличен на +80%',

    // Cards
    cardLaserName: 'Плазменный Лазер',
    cardLaserDesc: 'Вращающийся непрерывный луч плазмы сквозь врагов',
    cardLightningName: 'Цепная Молния',
    cardLightningDesc: 'Выстрелы бьют молнией в 3 ближайших врагов',
    cardRicochetName: 'Рикошетный Снаряд',
    cardRicochetDesc: 'Пули отскакивают в следующую цель при попадании',
    cardMultiName: 'Залповый Огонь',
    cardMultiDesc: '+1 дополнительный снаряд за каждый выстрел',
    cardMinesName: 'Кислотные Нано-Мины',
    cardMinesDesc: 'Сбрасывает мины с едким химическим ожогом',
    cardLeechName: 'Нано-Вампиризм',
    cardLeechDesc: '15% шанс восстановить 20 HP при убийстве врага',
    cardDronesName: 'Дроны-Пилы',
    cardDronesDesc: 'Вращающиеся орбитальные пилы, уничтожающие пули и мобов',
    cardCryoName: 'Крио-Заморозка',
    cardCryoDesc: 'Периодическая импульсная заморозка мобов вокруг',
    cardNovaName: 'Овердрайв Сверхновая',
    cardNovaDesc: 'Увеличивает радиус и урон Овердрайва (Пробел)',
    cardMissilesName: 'Самонаводящиеся Ракеты',
    cardMissilesDesc: 'Запуск самонаводящихся микро-ракет во врагов',
    cardSingularityName: 'Сингулярность',
    cardSingularityDesc: 'Криты создают гравитационную чёрную дыру',
    cardMinerName: 'Крипто-Майнер',
    cardMinerDesc: 'Пассивно генерирует +2 чипа каждые 4 секунды',
    cardGoldRushName: 'Золотая Лихорадка',
    cardGoldRushDesc: '+25% к добыче чипов со всех убитых врагов',

    // Evolutions
    evoIonName: 'ИОННЫЙ ОРБИТАЛЬНЫЙ ЗАЛП',
    evoIonDesc: 'Орбитальный спутник выжигает огромные зоны лазером (Лазер + Молния)',
    evoNapalmName: 'АДСКИЙ НАПАЛМ',
    evoNapalmDesc: 'Мины разрываются на кассетные зажигательные бомбы (Мины + Залп)',
    evoBlizzardName: 'ЛЕЗВИЕ БУРИ',
    evoBlizzardDesc: 'Дроны замораживают и шинкуют толпы на ледяные осколки (Дроны + Крио)',

    // In-game announcements
    contractCompleted: '🎯 КОНТРАКТ ВЫПОЛНЕН!',
    warningTitan: '⚠️ ВНИМАНИЕ: ПРИБЛИЖАЕТСЯ ТИТАН! ⚠️',
    shieldShattered: '⚡ ЩИТ ПРОБИТ! ЯДРО ОТКРЫТО!',
    coreOverheat: '🎯 ПЕРЕГРЕВ ЯДРА! x2.8 УРОНА!',
    codexDiscovered: '📖 НОВАЯ ЗАПИСЬ КОДЕКСА!',
    orbitalMelt: '⚡ ОРБИТАЛЬНЫЙ РАСПЛАВ!',
    killstreak10: '⚡ 10x НЕОСТАНОВИМ!',
    killstreak25: '💥 25x НЕОНОВАЯ РЕЗНЯ!',
    killstreak50: '🔥 50x КИБЕР-БОГ!',
    killstreak100: '🌌 100x ОМЕГА-ПОВЕЛИТЕЛЬ!',
    achFirstBlood: 'Первая Кровь',
    achFirstBloodDesc: 'Уничтожьте первого врага в секторе',
    achFirstUpgrade: 'Первый Апгрейд',
    achFirstUpgradeDesc: 'Выберите первую карточку синергии',
    achEvoMaster: 'Мастер Эволюций',
    achEvoMasterDesc: 'Активируйте мощную Омега-Эволюцию',
    achBossSlayer: 'Победитель Босса',
    achBossSlayerDesc: 'Уничтожьте гигантского Босса-Титана',
    achWave10: 'Ветеран 10 Волны',
    achWave10Desc: 'Доберитесь до 10 волны в одном забеге',

    // Review & Shortcut
    rateGame: '⭐ ОЦЕНИТЬ',
    addShortcut: '📌 НА РАБОЧИЙ СТОЛ',
    reviewSuccess: '⭐ СПАСИБО ЗА ОЦЕНКУ!',
    reviewThanks: '⭐⭐⭐⭐⭐ СПАСИБО!',
    shortcutSuccess: '📌 ЯРЛЫК ДОБАВЛЕН!',

    // Missions badges
    claimedBadge: '✅ ПОЛУЧЕНО',
    claimBtn: '🎁 ЗАБРАТЬ',
    inProgressBadge: 'В ПРОЦЕССЕ',

    // Codex badges & synergies
    codexExploreToUnlock: 'Исследуйте в забегах для открытия',
    codexUnlockedBadge: 'ОТКРЫТО',
    codexLockedBadge: '🔒 ЗАБЛОКИРОВАНО',
    codexSecretSynergy: '🔒 СЕКРЕТНАЯ СИНЕРГИЯ',
    codexSynergyActive: 'СИНЕРГИЯ АКТИВНА',
    codexSecretDesc: 'Объедините две редкие карты для разблокировки',
    codexMysteryBadge: '🔒 ТАЙНА',
    synergyPrefix: '⚡ СИНЕРГИЯ: ',
    codexSecretEvo: '🔒 ОМЕГА-ЭВОЛЮЦИЯ',
    codexEvoHint: 'Объедините ключевые карты в бою для эволюции',
    codexEvoActive: 'ЭВОЛЮЦИЯ ОТКРЫТА',

    // Wheel
    wheelSkinTitan: '👑 СКИН ТИТАН',
    wheelPetFalcon: '🦅 ДРОН СОКОЛ',
    wheelJackpot: '💥 ДЖЕКПОТ +300🪙',
    wheelSuperShield: '🛡️ СУПЕР ЩИТ'
  },

  en: {
    gameTitle: 'CYBER TOWER',
    gameSubtitle: 'SPACE AUTO-SHOOTER',
    fullGameTitle: 'Cyber Tower: Space Auto-Shooter',
    startRun: '⚔️ TO BATTLE!',
    workshop: '🛠️ WORKSHOP & IMPLANTS',
    achievements: '🏆 QUESTS & ACHIEVEMENTS',
    leaderboard: '👑 HALL OF FAME (TOP)',
    wheel: '🎡 WHEEL OF FORTUNE',
    dailyGift: '🎁 DAILY REWARD (+75 🪙)',
    giftClaimed: '✅ CLAIMED!',
    highWave: 'BEST WAVE',
    highScore: 'BEST SCORE',
    chipBalance: 'CHIP BALANCE',
    selectTower: '1. CHOOSE TOWER CLASS:',
    selectPet: '2. COMPANION PET:',
    selectBiome: '3. BATTLE BIOME:',
    selectSkin: '4. TOWER SHAPES & SKINS:',
    active: 'ACTIVE',
    select: 'SELECT',
    buy: 'BUY',
    equipped: 'EQUIPPED',
    equip: 'ENABLE',
    level: 'Level',
    bonusDmgAll: 'Damage bonus to all runs',
    loadoutBtn: '⚙️ LOADOUT & ARSENAL',
    loadoutTitle: '⚙️ TOWER LOADOUT & HANGAR',
    loadoutSubtitle: 'CONFIGURE CLASS, PET, BIOME AND SKIN',
    loadoutPreview: 'CURRENT LOADOUT:',
    permanentBaseMods: 'PERMANENT BASE MODULES:',
    cyberImplantsRunes: 'CYBER IMPLANTS (ACTIVE RUNES):',
    achievementsSubtitle: 'COMPLETE QUESTS AND EARN CHIPS',

    // Radio, Codex & Missions (EN)
    codexBtn: '📖 CODEX',
    codexTitle: '📖 CYBER CODEX & SYNERGIES',
    codexSubtitle: 'CARDS, EVOLUTIONS AND RECIPES GALLERY',
    collectionProgress: 'COLLECTION PROGRESS:',
    codexClaimReward: '🎁 CLAIM +500 CHIPS!',
    codexClaimed: '✅ REWARD CLAIMED (+500 🪙)',
    codexRewardLocked: 'Complete 100% of collection (+500 🪙)',

    synSuperconductor: 'Superconductor',
    synSuperconductorDesc: '+40% freezing shock and lightning shatter',
    synOrbitalTrap: 'Orbital Trap',
    synOrbitalTrapDesc: 'Mines deploy continuous burning laser tripwires',
    synSingularitySwarm: 'Gravity Swarm',
    synSingularitySwarmDesc: 'Black holes vortex mobs into spinning buzz-drones',
    synNuclearVampire: 'Nuclear Vampire',
    synNuclearVampireDesc: 'Missile detonations heal base for +15 HP per kill',

    missionsBtn: '📅 BOUNTIES',
    missionsTitle: '📅 MISSION MATRIX',
    missionsSubtitle: 'DAILY HUNTER CONTRACTS',
    missionKillsTitle: 'Cyber Slayer',
    missionKillsDesc: 'Destroy {target} enemies today',
    missionSlashTitle: 'Blade Master',
    missionSlashDesc: 'Slash {target} enemies or bullets with swipe gesture',
    missionWavesTitle: 'Abyss Survivor',
    missionWavesDesc: 'Survive {target} waves in a single run',

    radioBtn: '📻 RADIO',
    radioTitle: '📻 SYNTHWAVE RADIO',
    radioSubtitle: 'SELECT YOUR MUSIC WAVEFORM',

    levelUpTitle: '⚡ TOWER LEVEL UP',
    levelUpSubtitle: 'CHOOSE 1 OF 3 SYNERGY CARDS (+5% DMG & REPAIR!)',
    rerollCards: '🎬 REROLL CARDS (AD)',
    rouletteTitle: '🎰 CYBER CRATE ROULETTE',
    rouletteSubtitle: 'FORTUNE PRIZE SECTOR',
    claimPrize: 'CLAIM REWARD!',
    scanning: 'SCANNING REWARD...',
    wheelTitle: '🎡 WHEEL OF FORTUNE',
    wheelSubtitle: 'DAILY SPIN ONCE A DAY',
    wheelUsedToday: '✅ SPIN USED TODAY',
    wheelNextSpinTomorrow: '⌛ Next daily spin available tomorrow!',
    spinWheel: '🎰 SPIN THE WHEEL!',
    backToMenu: '🏠 BACK TO MENU',
    pauseTitle: '⏸️ GAME PAUSED',
    pauseSubtitle: 'TACTICAL TIMEOUT',
    resumeBtn: '▶️ RESUME',
    soundOn: '🔊 SOUND: ON',
    soundOff: '🔇 SOUND: OFF',
    gameOverTitle: 'SYSTEM DESTROYED',
    gameOverSubtitle: 'RUN DEBRIEF',
    waveReached: 'WAVE REACHED',
    finalScore: 'FINAL SCORE',
    earnedChips: 'CHIPS EARNED',
    reviveBtn: '🎬 SECOND CHANCE (REVIVE 60% HP)',
    doubleChipsBtn: '🎬 x2 CHIPS REWARD (AD)',
    restartBtn: '🔄 RESTART RUN',
    overdriveReady: '⚡ OVERDRIVE',
    overdriveCooldown: '⚡ COOLING DOWN',
    waveDone: 'WAVE CLEARED!',
    bossKilled: 'MEGA-BOSS DESTROYED!',
    bossAlert: '⚠️ WARNING: MEGA-BOSS DETECTED!',
    leviathanAlert: '⚠️ ALERT: CYBER LEVIATHAN HAS ARRIVED!',
    emergencyShieldAlert: '⚡ EMERGENCY SHIELD ENGAGED!',
    evoAlert: '💥 OMEGA EVOLUTION ACTIVATED!',
    meteorEvent: '⚠️ EVENT: METEOR RAIN HAZARD!',
    stormEvent: '⚠️ EVENT: CYBER STORM HAZARD!',
    hallOfFameTop: 'TOP 10 GUARDIANS OF CYBER TOWER',
    loadingHall: 'Loading Hall of Fame...',
    champion: '👑 CHAMPION',

    prizeJackpot: '💥 JACKPOT +100 CHIPS',
    prizeLevels: '⚡ +3 INSTANT LEVELS!',
    prizeRepair: '❤️‍🩹 FULL BASE REPAIR',
    prizeIon: '🌌 ORBITAL ION STRIKE',

    classDefaultName: 'Sentinel (Balanced)',
    classDefaultDesc: 'Versatile auto-targeting turret with balanced damage',
    classTeslaName: 'Tesla (Chain Storm)',
    classTeslaDesc: 'Starts with Chain Lightning and higher fire rate',
    classDreadnoughtName: 'Dreadnought (Heavy Armor)',
    classDreadnoughtDesc: '+350 HP, forcefield shield and starting acid nano-mines',
    classCryoName: 'Cryo-Focus (Permafrost)',
    classCryoDesc: 'Starts with freezing pulses and expanded sensor range',

    petRexName: 'Cyber-Hound Rex',
    petRexDesc: 'Vacuums distant scraps and bites nearby enemies for 80 DMG',
    petFalconName: 'Sniper Drone Falcon',
    petFalconDesc: 'Hovers above tower and snipes ranged shooters and bosses',
    petScarabName: 'Energy Scarab',
    petScarabDesc: 'Orbits tower and deflects enemy projectiles into shield',

    biomeCityName: '🌌 Orion Nebula',
    biomeCityDesc: 'Turquoise and violet deep cosmos with giant celestial ring planet',
    biomeMatrixName: '🟢 Emerald Quasar',
    biomeMatrixDesc: 'Aurora stellar wind and shimmering pulsars',
    biomeMagmaName: '🌋 Solar Supernova',
    biomeMagmaDesc: 'Crimson amber solar cataclysm with cosmic stardust flows',

    skinCyanName: 'Neon Octagon',
    skinCyanDesc: 'High-tech 8-sided chassis with 4 pylons and plasma core',
    skinGoldName: 'Solar Crown',
    skinGoldDesc: '12-pointed royal star with spinning solar runes',
    skinPhantomName: 'Shadow Hexagon',
    skinPhantomDesc: 'Obsidian monolith with 3 floating detached orbiting crystals',
    skinRetroName: 'Arcade Pyramid',
    skinRetroDesc: 'Stepped 80s neon pyramid with pixelated CRT matrix',

    rank1: 'Cyber Cadet',
    rank2: 'Sector Guardian',
    rank3: 'Arena Veteran',
    rank4: 'Omega Commander',
    rank5: 'Matrix Cyber God',

    upgHpName: 'Hull Plating (+120 HP)',
    upgDmgName: 'Plasma Core (+20% DMG)',
    upgRegenName: 'Nano-Regen (+3 HP/sec)',
    upgRangeName: 'Sensor Array (+12% Range)',
    upgLuckName: 'Cyber Luck (Epic/Legendary Chance)',

    impChaosName: 'Mark of Chaos',
    impChaosDesc: '30% chance to trigger an explosion on any direct hit',
    impVampireName: 'Nanite Vampirism',
    impVampireDesc: 'Critical strikes heal base for +25 HP',
    impMagnetName: 'Graviton Magnet',
    impMagnetDesc: 'Collection and magnet range increased by +80%',

    cardLaserName: 'Plasma Laser',
    cardLaserDesc: 'Continuous rotating plasma death beam piercing all enemies',
    cardLightningName: 'Chain Lightning',
    cardLightningDesc: 'Projectiles chain electric arcs to 3 nearby foes',
    cardRicochetName: 'Ricochet Shell',
    cardRicochetDesc: 'Projectiles bounce to secondary targets upon hit',
    cardMultiName: 'Multishot Barrage',
    cardMultiDesc: '+1 additional projectile fired per shot',
    cardMinesName: 'Acid Nano-Mines',
    cardMinesDesc: 'Drops chemical hazard mines with persistent corrosive burn',
    cardLeechName: 'Nano-Leech',
    cardLeechDesc: '15% chance to repair 20 HP upon enemy takedown',
    cardDronesName: 'Buzzsaw Drones',
    cardDronesDesc: 'Orbiting saws shredding incoming bullets and melee mobs',
    cardCryoName: 'Cryo-Freeze Pulse',
    cardCryoDesc: 'Periodic freezing wave immobilizing surrounding swarm',
    cardNovaName: 'Supernova Overdrive',
    cardNovaDesc: 'Massively increases Overdrive blast radius and damage',
    cardMissilesName: 'Homing Micro-Missiles',
    cardMissilesDesc: 'Launches lock-on seeker missiles at distant threats',
    cardSingularityName: 'Singularity Core',
    cardSingularityDesc: 'Critical hits spawn a gravitational mini black hole',
    cardMinerName: 'Crypto-Miner',
    cardMinerDesc: 'Passively produces +2 chips every 4 seconds',
    cardGoldRushName: 'Gold Rush Matrix',
    cardGoldRushDesc: '+25% chip drop rate from all destroyed enemies',

    evoIonName: 'ORBITAL ION CANNON',
    evoIonDesc: 'Orbital satellite obliterates huge zones with laser (Laser + Lightning)',
    evoNapalmName: 'HELLFIRE NAPALM',
    evoNapalmDesc: 'Mines detonate into cluster incendiary firebombs (Mines + Multishot)',
    evoBlizzardName: 'BLIZZARD SAW',
    evoBlizzardDesc: 'Drones freeze and shatter crowds into ice shards (Drones + Cryo)',

    // In-game announcements
    contractCompleted: '🎯 DAILY CONTRACT COMPLETED!',
    warningTitan: '⚠️ WARNING: TITAN APPROACHING ⚠️',
    shieldShattered: '⚡ SHIELD SHATTERED! CORE OPEN!',
    coreOverheat: '🎯 CORE OVERHEAT! x2.8 DMG!',
    codexDiscovered: '📖 NEW CODEX ENTRY DISCOVERED!',
    orbitalMelt: '⚡ ORBITAL MELT!',
    killstreak10: '⚡ 10x UNSTOPPABLE!',
    killstreak25: '💥 25x NEON CARNAGE!',
    killstreak50: '🔥 50x CYBER GOD!',
    killstreak100: '🌌 100x OMEGA OVERLORD!',
    achFirstBlood: 'First Blood',
    achFirstBloodDesc: 'Destroy the first enemy in sector',
    achFirstUpgrade: 'First Upgrade',
    achFirstUpgradeDesc: 'Select your first synergy card',
    achEvoMaster: 'Evolution Master',
    achEvoMasterDesc: 'Activate a powerful Omega Evolution',
    achBossSlayer: 'Titan Slayer',
    achBossSlayerDesc: 'Destroy the giant Titan Boss',
    achWave10: 'Wave 10 Veteran',
    achWave10Desc: 'Reach wave 10 in a single run',

    // Review & Shortcut
    rateGame: '⭐ RATE GAME',
    addShortcut: '📌 ADD TO HOME',
    reviewSuccess: '⭐ THANK YOU FOR RATING!',
    reviewThanks: '⭐⭐⭐⭐⭐ THANK YOU!',
    shortcutSuccess: '📌 SHORTCUT ADDED!',

    // Missions badges
    claimedBadge: '✅ CLAIMED',
    claimBtn: '🎁 CLAIM',
    inProgressBadge: 'IN PROGRESS',

    // Codex badges & synergies
    codexExploreToUnlock: 'Explore during runs to unlock',
    codexUnlockedBadge: 'UNLOCKED',
    codexLockedBadge: '🔒 LOCKED',
    codexSecretSynergy: '🔒 SECRET SYNERGY',
    codexSynergyActive: 'SYNERGY ACTIVE',
    codexSecretDesc: 'Combine two rare cards to unlock',
    codexMysteryBadge: '🔒 MYSTERY',
    synergyPrefix: '⚡ SYNERGY: ',
    codexSecretEvo: '🔒 OMEGA EVOLUTION',
    codexEvoHint: 'Combine key upgrade cards in battle to evolve',
    codexEvoActive: 'EVOLUTION ACTIVE',

    // Wheel
    wheelSkinTitan: '👑 TITAN SKIN',
    wheelPetFalcon: '🦅 FALCON DRONE',
    wheelJackpot: '💥 JACKPOT +300🪙',
    wheelSuperShield: '🛡️ SUPER SHIELD'
  },

  tr: {
    gameTitle: 'SİBER KULE',
    gameSubtitle: 'UZAY OTOMATİK NİŞANCI',
    fullGameTitle: 'Siber Kule: Uzay Otomatik Nişancı',
    startRun: '⚔️ SAVAŞA!',
    workshop: '🛠️ ATÖLYE VE İMPLANTLAR',
    achievements: '🏆 GÖREVLER VE BAŞARILAR',
    leaderboard: '👑 ŞÖHRETLER SALONU',
    wheel: '🎡 ŞANS ÇARKI',
    dailyGift: '🎁 GÜNLÜK HEDİYE (+75 🪙)',
    giftClaimed: '✅ ALINDI!',
    highWave: 'EN İYİ DALGA',
    highScore: 'EN İYİ PUAN',
    chipBalance: 'ÇİP BAKİYESİ',
    selectTower: '1. KULE SINIFINI SEÇ:',
    selectPet: '2. SİBER YOLDAŞ:',
    selectBiome: '3. SAVAŞ ALANI:',
    selectSkin: '4. KULE ŞEKLİ VE GÖRÜNÜMÜ:',
    active: 'AKTİF',
    select: 'SEÇ',
    buy: 'SATIN AL',
    equipped: 'KUŞANILDI',
    equip: 'ETKİNLEŞTİR',
    level: 'Seviye',
    bonusDmgAll: 'Tüm oyunlara hasar bonusu',
    loadoutBtn: '⚙️ EKİPMAN & HANGAR',
    loadoutTitle: '⚙️ EKİPMAN VE HANGAR',
    loadoutSubtitle: 'KULE SINIFI, EVCİL HAYVAN, BİYOM VE GÖRÜNÜM AYARLARI',
    loadoutPreview: 'AKTİF EKİPMAN:',
    permanentBaseMods: 'KALICI ÜS MODÜLLERİ:',
    cyberImplantsRunes: 'SİBER İMPLANTLAR (AKTİF RUNLAR):',
    achievementsSubtitle: 'GÖREVLERİ TAMAMLA VE ÇİP KAZAN',

    // Radio, Codex & Missions (TR)
    codexBtn: '📖 KODEKS',
    codexTitle: '📖 SİBER KODEKS VE SİNERJİLER',
    codexSubtitle: 'KARTLAR, EVRİMLER VE SİNERJİ GALERİSİ',
    collectionProgress: 'KOLEKSİYON İLERLEMESİ:',
    codexClaimReward: '🎁 +500 ÇİP KAZAN!',
    codexClaimed: '✅ ÖDÜL ALINDI (+500 🪙)',
    codexRewardLocked: 'Koleksiyonu %100 tamamla (+500 🪙)',

    synSuperconductor: 'Süper İletken',
    synSuperconductorDesc: '+%40 dondurucu elektrik hasarı ve şok',
    synOrbitalTrap: 'Yörünge Tuzağı',
    synOrbitalTrapDesc: 'Mayınlar sürekli lazer tuzakları kurar',
    synSingularitySwarm: 'Yerçekimi Sürüsü',
    synSingularitySwarmDesc: 'Kara delikler düşmanları testerelere çeker',
    synNuclearVampire: 'Nükleer Vampir',
    synNuclearVampireDesc: 'Füze patlamaları her leşte +15 can yeniler',

    missionsBtn: '📅 GÖREVLER',
    missionsTitle: '📅 GÜNLÜK GÖREV MATRİSİ',
    missionsSubtitle: 'GÜNLÜK SİBER AVCI SÖZLEŞMELERİ',
    missionKillsTitle: 'Siber Avcı',
    missionKillsDesc: 'Bugün {target} düşmanı yok et',
    missionSlashTitle: 'Bıçak Ustası',
    missionSlashDesc: 'Kaydırma hareketiyle {target} düşmanı kes',
    missionWavesTitle: 'Uçurumdan Sağ Çıkan',
    missionWavesDesc: 'Tek oyunda {target} dalga hayatta kal',

    radioBtn: '📻 RADYO',
    radioTitle: '📻 SYNTHWAVE RADYOSU',
    radioSubtitle: 'MÜZİK İSTASYONUNU SEÇ',

    levelUpTitle: '⚡ KULE SEVİYE ATLADI',
    levelUpSubtitle: '3 KARTTAN 1İNİ SEÇ (+5% HASAR VE TAMİR!)',
    rerollCards: '🎬 KARTLARI YENİLE (REKLAM)',
    rouletteTitle: '🎰 SİBER ŞANS SANDIĞI',
    rouletteSubtitle: 'ÖDÜL ÇARKI',
    claimPrize: 'ÖDÜLÜ AL!',
    scanning: 'ÖDÜL TARANIYOR...',
    wheelTitle: '🎡 ŞANS ÇARKI',
    wheelSubtitle: 'GÜNDE 1 KEZ DÖNDÜRME',
    wheelUsedToday: '✅ BUGÜN DÖNDÜRÜLDÜ',
    wheelNextSpinTomorrow: '⌛ Sonraki çevirme yarın hazır olacak!',
    spinWheel: '🎰 ÇARKI ÇEVİR!',
    backToMenu: '🏠 MENÜYE DÖN',
    pauseTitle: '⏸️ OYUN DURDURULDU',
    pauseSubtitle: 'TAKTİKSEL MOLA',
    resumeBtn: '▶️ DEVAM ET',
    soundOn: '🔊 SES: AÇIK',
    soundOff: '🔇 SES: KAPALI',
    gameOverTitle: 'SİSTEM İMHA EDİLDİ',
    gameOverSubtitle: 'SAVAŞ RAPORU',
    waveReached: 'ULAŞILAN DALGA',
    finalScore: 'TOPLAM PUAN',
    earnedChips: 'KAZANILAN ÇİP',
    reviveBtn: '🎬 İKİNCİ ŞANS (60% CANLA DİRİL)',
    doubleChipsBtn: '🎬 x2 ÇİP KAZAN (REKLAM)',
    restartBtn: '🔄 YENİDEN BAŞLA',
    overdriveReady: '⚡ AŞIRI YÜKLEME',
    overdriveCooldown: '⚡ BEKLEME SÜRESİ',
    waveDone: 'DALGA GEÇİLDİ!',
    bossKilled: 'DEV BOSS YOK EDİLDİ!',
    bossAlert: '⚠️ DİKKAT: DEV BOSS TESPİT EDİLDİ!',
    leviathanAlert: '⚠️ ALARM: SİBER LEVİATHAN GELDİ!',
    emergencyShieldAlert: '⚡ ACİL DURUM KALKANI DEVREDE!',
    evoAlert: '💥 OMEGA EVRİM ETKİNLEŞTİRİLDİ!',
    meteorEvent: '⚠️ TEHLİKE: METEOR YAĞMURU!',
    stormEvent: '⚠️ TEHLİKE: SİBER FIRTINA!',
    hallOfFameTop: 'CYBER TOWER EN İYİ 10 KORUYUCU',
    loadingHall: 'Şöhretler Salonu Yükleniyor...',
    champion: '👑 ŞAMPİYON',

    prizeJackpot: '💥 BÜYÜK İKRAMİYE +100 ÇİP',
    prizeLevels: '⚡ +3 ANINDA SEVİYE!',
    prizeRepair: '❤️‍🩹 TAM ÜS ONARIMI',
    prizeIon: '🌌 YÖRÜNGE İYON SALDIRISI',

    classDefaultName: 'Muhafız (Dengeli)',
    classDefaultDesc: 'Otomatik hedefleme ve dengeli hasar veren çok yönlü taret',
    classTeslaName: 'Tesla (Yıldırım Fırtınası)',
    classTeslaDesc: 'Zincirleme Yıldırımla başlar. Yüksek atış hızı',
    classDreadnoughtName: 'Dretnot (Ağır Zırh)',
    classDreadnoughtDesc: '+350 Can, enerji kalkanı ve asitli nano-mayınlarla başlar',
    classCryoName: 'Kriyo-Odak (Donma)',
    classCryoDesc: 'Genişletilmiş sensör ve düşmanları dondurma nabzıyla başlar',

    petRexName: 'Siber-Köpek Rex',
    petRexDesc: 'Uzak kristalleri toplar ve düşmanları 80 Hasarla ısırır',
    petFalconName: 'Keskin Nişancı Şahin',
    petFalconDesc: 'Kulenin üstünde uçar ve menzilli düşmanları plazmayla vurur',
    petScarabName: 'Enerji Böceği',
    petScarabDesc: 'Kulenin etrafında döner ve düşman mermilerini kalkana çevirir',

    biomeCityName: '🌌 Orion Bulutsusu',
    biomeCityDesc: 'Halkalı dev gezegenli turkuaz ve mor derin uzay',
    biomeMatrixName: '🟢 Zümrüt Kuasar',
    biomeMatrixDesc: 'Yeşil yıldız rüzgarı ve parıldayan pulsarlar',
    biomeMagmaName: '🌋 Süpernova Alevi',
    biomeMagmaDesc: 'Kozmik yıldız tozu akışlarıyla kızıl kehribar fırtına',

    skinCyanName: 'Neon Sekizgen',
    skinCyanDesc: '4 pilonlu ve plazma çekirdekli yüksek teknolojili 8gen',
    skinGoldName: 'Güneş Tacı',
    skinGoldDesc: 'Dönen güneş rünlerine sahip 12 köşeli kraliyet yıldızı',
    skinPhantomName: 'Gölge Altıgen',
    skinPhantomDesc: 'Yörüngede dönen 3 kristale sahip obsidiyen monolit',
    skinRetroName: 'Arcade Piramidi',
    skinRetroDesc: 'Piksel CRT matrisli 80ler neon basamaklı piramit',

    rank1: 'Siber Öğrenci',
    rank2: 'Sektör Koruyucusu',
    rank3: 'Arena Gazisi',
    rank4: 'Omega Komutan',
    rank5: 'Matris Siber Tanrısı',

    upgHpName: 'Gövde Zırhı (+120 Can)',
    upgDmgName: 'Plazma Gücü (+20% Hasar)',
    upgRegenName: 'Nano Yenilenme (+3 Can/sn)',
    upgRangeName: 'Sensör Menzili (+12% Menzil)',
    upgLuckName: 'Siber Şans (Destansı/Efsanevi Şansı)',

    impChaosName: 'Kaos Mührü',
    impChaosDesc: 'Her doğrudan vuruşta 30% patlama tetikleme şansı',
    impVampireName: 'Nanit Vampirliği',
    impVampireDesc: 'Kritik vuruşlar üssü +25 Can ile iyileştirir',
    impMagnetName: 'Kütleçekim Mıknatısı',
    impMagnetDesc: 'Çip ve deneyim çekme menzili +80% artar',

    cardLaserName: 'Plazma Lazeri',
    cardLaserDesc: 'Tüm düşmanları delip geçen dönen ölümcül plazma ışını',
    cardLightningName: 'Zincirleme Yıldırım',
    cardLightningDesc: 'Mermiler yakındaki 3 düşmana elektrik sıçratır',
    cardRicochetName: 'Seken Mermi',
    cardRicochetDesc: 'Mermiler isabet ettiğinde sıradaki hedefe seker',
    cardMultiName: 'Çoklu Atış',
    cardMultiDesc: 'Her atışta fazladan +1 mermi ateşlenir',
    cardMinesName: 'Asitli Nano-Mayınlar',
    cardMinesDesc: 'Kimyasal yanık bırakan tehlikeli mayınlar döker',
    cardLeechName: 'Nano-Sömürü',
    cardLeechDesc: 'Düşman öldürüldüğünde 15% şansla 20 Can yeniler',
    cardDronesName: 'Döner Testere Dronları',
    cardDronesDesc: 'Gelen mermileri ve yaratıkları biçen yörünge testereleri',
    cardCryoName: 'Kriyo-Dondurma Dalgası',
    cardCryoDesc: 'Etraftaki sürüyü hareketsiz kılan periyodik donma dalgası',
    cardNovaName: 'Süpernova Aşırı Yükleme',
    cardNovaDesc: 'Aşırı Yükleme patlama yarıçapını ve hasarını büyük oranda artırır',
    cardMissilesName: 'Güdümlü Mikro-Füzeler',
    cardMissilesDesc: 'Uzak hedeflere kilitlenen güdümlü füzeler fırlatır',
    cardSingularityName: 'Tekillik Çekirdeği',
    cardSingularityDesc: 'Kritik vuruşlar yerçekimsel bir kara delik açar',
    cardMinerName: 'Kripto Madenci',
    cardMinerDesc: 'Her 4 saniyede pasif olarak +2 çip üretir',
    cardGoldRushName: 'Altına Hücum',
    cardGoldRushDesc: 'Yok edilen tüm düşmanlardan +25% çip düşme oranı',

    evoIonName: 'YÖRÜNGE İYON LAZERİ',
    evoIonDesc: 'Yörünge uydusu dev alanları lazerle yakar (Lazer + Yıldırım)',
    evoNapalmName: 'CEHENNEM NAPALMI',
    evoNapalmDesc: 'Mayınlar yangın bombalarına ayrılır (Mayın + Çoklu Atış)',
    evoBlizzardName: 'TİPİ TESTERESİ',
    evoBlizzardDesc: 'Dronlar kalabalıkları dondurur ve parçalar (Dron + Kriyo)',

    // In-game announcements
    contractCompleted: '🎯 GÜNLÜK GÖREV TAMAMLANDI!',
    warningTitan: '⚠️ DİKKAT: TİTAN YAKLAŞIYOR ⚠️',
    shieldShattered: '⚡ KALKAN KIRILDI! ÇEKİRDEK AÇIK!',
    coreOverheat: '🎯 ÇEKİRDEK AŞIRI ISINDI! x2.8 HASAR!',
    codexDiscovered: '📖 YENİ KODEKS KAYDI!',
    orbitalMelt: '⚡ YÖRÜNGE ERİMESİ!',
    killstreak10: '⚡ 10x DURDURULAMAZ!',
    killstreak25: '💥 25x NEON KATLİAMI!',
    killstreak50: '🔥 50x SİBER TANRI!',
    killstreak100: '🌌 100x OMEGA HÜKÜMDARI!',
    achFirstBlood: 'İlk Kan',
    achFirstBloodDesc: 'Sektördeki ilk düşmanı yok edin',
    achFirstUpgrade: 'İlk Yükseltme',
    achFirstUpgradeDesc: 'İlk sinerji kartınızı seçin',
    achEvoMaster: 'Evrim Ustası',
    achEvoMasterDesc: 'Güçlü bir Omega Evrimini etkinleştirin',
    achBossSlayer: 'Titan Avcısı',
    achBossSlayerDesc: 'Devasa Titan Patronunu yok edin',
    achWave10: '10. Dalga Gazisi',
    achWave10Desc: 'Tek bir oyunda 10. dalgaya ulaşın',

    // Review & Shortcut
    rateGame: '⭐ OYUNU DEĞERLENDİR',
    addShortcut: '📌 KISAYOL EKLE',
    reviewSuccess: '⭐ DEĞERLENDİRME İÇİN TEŞEKKÜRLER!',
    reviewThanks: '⭐⭐⭐⭐⭐ TEŞEKKÜRLER!',
    shortcutSuccess: '📌 KISAYOL EKLENDİ!',

    // Missions badges
    claimedBadge: '✅ ALINDI',
    claimBtn: '🎁 AL',
    inProgressBadge: 'DEVAM EDİYOR',

    // Codex badges & synergies
    codexExploreToUnlock: 'Açmak için savaşlarda keşfedin',
    codexUnlockedBadge: 'AÇILDI',
    codexLockedBadge: '🔒 KİLİTLİ',
    codexSecretSynergy: '🔒 GİZLİ SİNERJİ',
    codexSynergyActive: 'SİNERJİ AKTİF',
    codexSecretDesc: 'Kilidi açmak için iki nadir kartı birleştirin',
    codexMysteryBadge: '🔒 GİZEM',
    synergyPrefix: '⚡ SİNERJİ: ',
    codexSecretEvo: '🔒 OMEGA EVRİMİ',
    codexEvoHint: 'Evrimleşmek için savaşta ana kartları birleştirin',
    codexEvoActive: 'EVRİM AKTİF',

    // Wheel
    wheelSkinTitan: '👑 TİTAN DESENİ',
    wheelPetFalcon: '🦅 ŞAHİN DRONU',
    wheelJackpot: '💥 BÜYÜK ÖDÜL +300🪙',
    wheelSuperShield: '🛡️ SÜPER KALKAN'
  }
};

class I18nManager {
  constructor() {
    this.currentLang = 'ru';
    this.detectLanguage();

    if (window.vkPlayBridge && typeof window.vkPlayBridge.detectInitialLang === 'function') {
      try {
        const detected = window.vkPlayBridge.detectInitialLang();
        if (detected) this.setLanguageFromSdk(detected);
      } catch(e) {}
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.applyTranslations());
    } else {
      this.applyTranslations();
    }
  }

  detectLanguage() {
    // 1. Check URL parameters (e.g. ?lang=en, ?lang=tr, ?vk_language=ru)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang') || urlParams.get('vk_language');
      if (urlLang) {
        this.currentLang = this.resolveLangCode(urlLang);
        return;
      }
    } catch(e) {}

    // 2. Check explicit user choice preference in localStorage
    try {
      const userPref = localStorage.getItem('cyber_tower_user_chosen_lang');
      if (userPref && I18N_DATA[userPref]) {
        this.currentLang = userPref;
        return;
      }
    } catch(e) {}

    // 3. Check Platform Bridge if available
    try {
      if (window.vkPlayBridge && window.vkPlayBridge.lang) {
        this.currentLang = this.resolveLangCode(window.vkPlayBridge.lang);
        return;
      }
    } catch(e) {}

    // 4. Fallback to saved previous session lang if valid
    try {
      const saved = localStorage.getItem('cyber_tower_lang');
      if (saved && I18N_DATA[saved]) {
        this.currentLang = saved;
        return;
      }
    } catch(e) {}

    // 5. Fallback to navigator.language
    const userLang = (navigator.language || navigator.userLanguage || 'ru').toLowerCase();
    this.currentLang = this.resolveLangCode(userLang);
  }

  resolveLangCode(code) {
    if (!code) return 'ru';
    const lang = code.toLowerCase();
    if (lang === 'tr' || lang.startsWith('tr')) {
      return 'tr';
    } else if (['ru', 'be', 'uk', 'kk', 'ky', 'uz', 'tg'].includes(lang) || lang.startsWith('ru')) {
      return 'ru';
    } else {
      return 'en';
    }
  }

  setLanguageFromSdk(sdkLang) {
    if (!sdkLang) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang') || urlParams.get('vk_language');
      const userChoice = localStorage.getItem('cyber_tower_user_chosen_lang');
      if (urlLang || (userChoice && I18N_DATA[userChoice])) return;
    } catch(e) {}
    const target = this.resolveLangCode(sdkLang);
    console.log(`[i18n] Auto-detected Language from Platform SDK: ${sdkLang} -> ${target}`);
    this.setLanguage(target, false);
  }

  setLanguage(lang, isUserChoice = false) {
    if (I18N_DATA[lang]) {
      this.currentLang = lang;
      try {
        localStorage.setItem('cyber_tower_lang', lang);
        if (isUserChoice) {
          localStorage.setItem('cyber_tower_user_chosen_lang', lang);
        }
      } catch(e) {}
      this.applyTranslations();
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      });
    }
  }

  t(key) {
    const dict = I18N_DATA[this.currentLang] || I18N_DATA['ru'];
    return dict[key] !== undefined ? dict[key] : key;
  }

  applyTranslations() {
    try {
      const fullTitle = this.t('fullGameTitle') || this.t('gameTitle');
      document.title = fullTitle + ' | VK Play';
    } catch(e) {}

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.innerText = this.t(key);
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
    });

    if (window.game) {
      window.game.renderClassSelector();
      window.game.renderPetSelector();
      window.game.renderBiomeSelector();
      window.game.renderSkinSelector();
      window.game.renderWorkshopCards();
      window.game.renderImplants();
      window.game.renderAchievements();
      window.game.updateUI();
    }
  }
}

window.i18n = new I18nManager();
window.I18N_DATA = I18N_DATA;
window.setGameLang = function(lang) {
  if (window.i18n) {
    window.i18n.setLanguage(lang, true);
  }
  if (window.game) {
    window.game.applyAllTranslations();
    window.game.triggerHaptic(15);
  }
};
