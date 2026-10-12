// Biome environments and tower skins definitions

const CYBER_BIOMES = [
  {
    id: 'neon_city',
    nameKey: 'biomeCityName',
    descKey: 'biomeCityDesc',
    name: '🌌 Туманность Ориона',
    desc: 'Бирюзово-фиолетовый глубокий космос с гигантской кольцевой планетой',
    icon: '🌌',
    skyTop: '#020208',
    skyBottom: '#060317'
  },
  {
    id: 'matrix_core',
    nameKey: 'biomeMatrixName',
    descKey: 'biomeMatrixDesc',
    name: '🟢 Изумрудный Квазар',
    desc: 'Атмосфера зеленого звездного ветра и мерцающих пульсаров',
    icon: '🟢',
    skyTop: '#010803',
    skyBottom: '#031408'
  },
  {
    id: 'magma_foundry',
    nameKey: 'biomeMagmaName',
    descKey: 'biomeMagmaDesc',
    name: '🌋 Пылающая Сверхновая',
    desc: 'Багрово-янтарный солнечный катаклизм с потоками звездной пыли',
    icon: '🌋',
    skyTop: '#0a0104',
    skyBottom: '#170308'
  }
];

const TOWER_SKINS = [
  {
    id: 'skin_cyan',
    nameKey: 'skinCyanName',
    descKey: 'skinCyanDesc',
    name: 'Неоновый Октагон',
    desc: 'Высокотехнологичный 8-гранник с 4 пилонами и плазменным реактором',
    color: '#00ffff',
    cost: 0,
    icon: '💎'
  },
  {
    id: 'skin_gold',
    nameKey: 'skinGoldName',
    descKey: 'skinGoldDesc',
    name: 'Корона Солнца',
    desc: '12-конечная царская звезда с вращающимися солярными рунами',
    color: '#ffee00',
    cost: 150,
    icon: '👑'
  },
  {
    id: 'skin_phantom',
    nameKey: 'skinPhantomName',
    descKey: 'skinPhantomDesc',
    name: 'Теневой Гексагон',
    desc: 'Обсидиановый монолит с 3 парящими по орбите кристаллами',
    color: '#9d00ff',
    cost: 250,
    icon: '🔮'
  },
  {
    id: 'skin_retro',
    nameKey: 'skinRetroName',
    descKey: 'skinRetroDesc',
    name: 'Аркадная Пирамида',
    desc: 'Ступенчатая неоновая пирамида 80-х с пиксельной CRT-матрицей',
    color: '#ff007f',
    cost: 350,
    icon: '🕹️'
  }
];

window.CYBER_BIOMES = CYBER_BIOMES;
window.TOWER_SKINS = TOWER_SKINS;
