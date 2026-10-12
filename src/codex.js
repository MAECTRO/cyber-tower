// Codex data and synergy collection

const CYBER_SYNERGIES = [
  {
    id: 'syn_superconductor',
    nameKey: 'synSuperconductor',
    descKey: 'synSuperconductorDesc',
    name: 'Сверхпроводник',
    combo: ['chain_lightning', 'cryo_blast'],
    icon: '⚡❄️',
    bonus: '+40% Lightning Freezing Stun & Superconductive Shatter'
  },
  {
    id: 'syn_orbital_trap',
    nameKey: 'synOrbitalTrap',
    descKey: 'synOrbitalTrapDesc',
    name: 'Орбитальная Ловушка',
    combo: ['death_ray', 'acid_mines'],
    icon: '🔴💣',
    bonus: 'Mines fire laser tripwires dealing continuous burn'
  },
  {
    id: 'syn_singularity_swarm',
    nameKey: 'synSingularitySwarm',
    descKey: 'synSingularitySwarmDesc',
    name: 'Гравитационный Рой',
    combo: ['singularity_core', 'buzzsaw_drones'],
    icon: '🌀🤖',
    bonus: 'Black holes suck enemies directly into spinning buzz-drones'
  },
  {
    id: 'syn_nuclear_vampire',
    nameKey: 'synNuclearVampire',
    descKey: 'synNuclearVampireDesc',
    name: 'Ядерный Вампир',
    combo: ['homing_missiles', 'vampirism'],
    icon: '🚀🩸',
    bonus: 'Missile explosions heal Tower for +15 HP per kill'
  }
];

class CodexManager {
  constructor() {
    this.discovered = new Set();
    this.rewardClaimed = false;

    try {
      const saved = localStorage.getItem('cyber_codex_discovered');
      if (saved) {
        JSON.parse(saved).forEach(id => this.discovered.add(id));
      }
      this.rewardClaimed = localStorage.getItem('cyber_codex_reward_claimed') === 'true';
    } catch (e) {}

    this.initDefaultDiscoveries();
  }

  initDefaultDiscoveries() {
    ['ricochet', 'multishot'].forEach(id => {
      this.discovered.add(id);
    });
    this.save();
  }

  discover(id) {
    if (!id) return;
    if (!this.discovered.has(id)) {
      this.discovered.add(id);
      this.save();
      if (window.particleEngine) {
        const codexMsg = window.i18n ? window.i18n.t('codexDiscovered') : '📖 NEW CODEX ENTRY DISCOVERED!';
        window.particleEngine.addDamageText(window.innerWidth / 2, 120, codexMsg, '#00ffff', true);
      }
    }
  }

  save() {
    try {
      localStorage.setItem('cyber_codex_discovered', JSON.stringify(Array.from(this.discovered)));
      localStorage.setItem('cyber_codex_reward_claimed', this.rewardClaimed ? 'true' : 'false');
    } catch (e) {}
  }

  getTotalItemsCount() {
    const cardCount = window.UPGRADE_CARDS ? window.UPGRADE_CARDS.length : 13;
    const evoCount = window.OMEGA_EVOLUTIONS ? window.OMEGA_EVOLUTIONS.length : 3;
    const synCount = CYBER_SYNERGIES.length;
    return cardCount + evoCount + synCount;
  }

  getProgress() {
    const total = this.getTotalItemsCount();
    let count = 0;
    if (window.UPGRADE_CARDS) {
      window.UPGRADE_CARDS.forEach(c => { if (this.discovered.has(c.id)) count++; });
    }
    if (window.OMEGA_EVOLUTIONS) {
      window.OMEGA_EVOLUTIONS.forEach(e => { if (this.discovered.has(e.id)) count++; });
    }
    CYBER_SYNERGIES.forEach(s => {
      const isUnlocked = this.discovered.has(s.id) || (s.combo && this.discovered.has(s.combo[0]) && this.discovered.has(s.combo[1]));
      if (isUnlocked) count++;
    });

    return {
      count,
      total,
      percent: total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0
    };
  }

  renderGallery() {
    const grid = document.getElementById('codexGrid');
    const progText = document.getElementById('codexProgressText');
    const progFill = document.getElementById('codexProgressFill');
    const rewardBtn = document.getElementById('codexClaimBtn');

    if (!grid) return;

    const prog = this.getProgress();
    if (progText) progText.innerText = `${prog.count} / ${prog.total} (${prog.percent}%)`;
    if (progFill) progFill.style.width = `${prog.percent}%`;

    if (rewardBtn) {
      if (this.rewardClaimed) {
        rewardBtn.innerText = window.i18n ? window.i18n.t('codexClaimed') : '✅ НАГРАДА ПОЛУЧЕНА (+500 🪙)';
        rewardBtn.classList.add('disabled-btn');
        rewardBtn.disabled = true;
      } else if (prog.percent >= 100) {
        rewardBtn.innerText = window.i18n ? window.i18n.t('codexClaimReward') : '🎁 ЗАБРАТЬ +500 ЧИПОВ!';
        rewardBtn.classList.remove('disabled-btn');
        rewardBtn.disabled = false;
      } else {
        rewardBtn.innerText = `🔒 ${window.i18n ? window.i18n.t('codexRewardLocked') : 'Соберите 100% коллекции (+500 🪙)'}`;
        rewardBtn.classList.add('disabled-btn');
        rewardBtn.disabled = true;
      }
    }

    grid.innerHTML = '';

    // Render Cards
    if (window.UPGRADE_CARDS) {
      window.UPGRADE_CARDS.forEach(card => {
        const isUnlocked = this.discovered.has(card.id);
        const el = document.createElement('div');
        el.className = `codex-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        const name = (window.i18n && card.nameKey) ? window.i18n.t(card.nameKey) : (card.name || card.id);
        const desc = (window.i18n && card.descKey) ? window.i18n.t(card.descKey) : (card.desc || '');

        const unlockHint = window.i18n ? window.i18n.t('codexExploreToUnlock') : 'Исследуйте в забегах для открытия';
        const unlockedBadge = window.i18n ? window.i18n.t('codexUnlockedBadge') : 'ОТКРЫТО';
        const lockedBadge = window.i18n ? window.i18n.t('codexLockedBadge') : '🔒 ЗАБЛОКИРОВАНО';

        el.innerHTML = `
          <div class="codex-icon">${card.icon || '🃏'}</div>
          <div class="codex-title">${isUnlocked ? name : '???'}</div>
          <div class="codex-desc">${isUnlocked ? desc : unlockHint}</div>
          <div class="codex-badge">${isUnlocked ? unlockedBadge : lockedBadge}</div>
        `;
        grid.appendChild(el);
      });
    }

    // Render Omega Evolutions
    if (window.OMEGA_EVOLUTIONS) {
      window.OMEGA_EVOLUTIONS.forEach(evo => {
        const isUnlocked = this.discovered.has(evo.id) || (evo.req && this.discovered.has(evo.req[0]) && this.discovered.has(evo.req[1]));
        if (isUnlocked) this.discovered.add(evo.id);

        const el = document.createElement('div');
        el.className = `codex-card evo-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        const name = (window.i18n && evo.nameKey) ? window.i18n.t(evo.nameKey) : (evo.name || evo.id);
        const desc = (window.i18n && evo.descKey) ? window.i18n.t(evo.descKey) : (evo.desc || '');

        const secretTitle = window.i18n ? window.i18n.t('codexSecretEvo') : '🔒 ОМЕГА-ЭВОЛЮЦИЯ';
        const secretDesc = window.i18n ? window.i18n.t('codexEvoHint') : 'Объедините ключевые карты в бою для эволюции';
        const evoActive = window.i18n ? window.i18n.t('codexEvoActive') : 'ЭВОЛЮЦИЯ ОТКРЫТА';
        const mysteryBadge = window.i18n ? window.i18n.t('codexMysteryBadge') : '🔒 ТАЙНА';

        el.innerHTML = `
          <div class="codex-icon">${evo.icon || '🌌'}</div>
          <div class="codex-title" style="color: ${evo.color || 'var(--neon-cyan)'};">${isUnlocked ? name : secretTitle}</div>
          <div class="codex-desc">${isUnlocked ? desc : secretDesc}</div>
          <div class="codex-badge synergy-badge">${isUnlocked ? evoActive : mysteryBadge}</div>
        `;
        grid.appendChild(el);
      });
    }

    // Render Secret Synergies
    CYBER_SYNERGIES.forEach(syn => {
      const isUnlocked = this.discovered.has(syn.id) || (syn.combo && this.discovered.has(syn.combo[0]) && this.discovered.has(syn.combo[1]));
      if (isUnlocked) this.discovered.add(syn.id);

      const el = document.createElement('div');
      el.className = `codex-card synergy-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      const name = (window.i18n && syn.nameKey) ? window.i18n.t(syn.nameKey) : (syn.name || syn.id);
      const desc = (window.i18n && syn.descKey) ? window.i18n.t(syn.descKey) : (syn.bonus || '');

      const synPrefix = window.i18n ? window.i18n.t('synergyPrefix') : '⚡ СИНЕРГИЯ: ';
      const secretTitle = window.i18n ? window.i18n.t('codexSecretSynergy') : '🔒 СЕКРЕТНАЯ СИНЕРГИЯ';
      const secretDesc = window.i18n ? window.i18n.t('codexSecretDesc') : 'Объедините две редкие карты для разблокировки';
      const synActive = window.i18n ? window.i18n.t('codexSynergyActive') : 'СИНЕРГИЯ АКТИВНА';
      const mysteryBadge = window.i18n ? window.i18n.t('codexMysteryBadge') : '🔒 ТАЙНА';

      el.innerHTML = `
        <div class="codex-icon">${syn.icon || '⚡'}</div>
        <div class="codex-title" style="color: var(--neon-gold);">${isUnlocked ? `${synPrefix}${name}` : secretTitle}</div>
        <div class="codex-desc">${isUnlocked ? desc : secretDesc}</div>
        <div class="codex-badge synergy-badge">${isUnlocked ? synActive : mysteryBadge}</div>
      `;
      grid.appendChild(el);
    });
  }

  claimReward(onSuccess) {
    const prog = this.getProgress();
    if (prog.percent >= 100 && !this.rewardClaimed) {
      this.rewardClaimed = true;
      this.save();
      if (window.soundEngine) window.soundEngine.playMissionComplete();
      onSuccess(500);
      this.renderGallery();
    }
  }
}

window.CYBER_SYNERGIES = CYBER_SYNERGIES;
window.codexManager = new CodexManager();
