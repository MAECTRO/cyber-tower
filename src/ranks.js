// Commander rank progression system

const COMMANDER_RANKS = [
  { rank: 1, titleKey: 'rank1', title: 'Кибер-Кадет', reqChips: 0, bonusDmg: 0, reward: 0, icon: '🔰' },
  { rank: 2, titleKey: 'rank2', title: 'Защитник Сектора', reqChips: 150, bonusDmg: 0.05, reward: 50, icon: '⚡' },
  { rank: 3, titleKey: 'rank3', title: 'Ветеран Арены', reqChips: 350, bonusDmg: 0.10, reward: 100, icon: '🛡️' },
  { rank: 4, titleKey: 'rank4', title: 'Омега-Командир', reqChips: 750, bonusDmg: 0.18, reward: 200, icon: '👑' },
  { rank: 5, titleKey: 'rank5', title: 'Кибер-Бог Матрицы', reqChips: 1500, bonusDmg: 0.30, reward: 500, icon: '🌌' }
];

window.COMMANDER_RANKS = COMMANDER_RANKS;
