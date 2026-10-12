// Daily mission tracker and rewards

class MissionManager {
  constructor() {
    this.todayKey = new Date().toISOString().split('T')[0];
    this.missions = [];
    this.loadDailyMissions();
  }

  loadDailyMissions() {
    try {
      const savedDate = localStorage.getItem('cyber_mission_date');
      const savedMissions = localStorage.getItem('cyber_missions');

      if (savedDate === this.todayKey && savedMissions) {
        this.missions = JSON.parse(savedMissions);
        return;
      }
    } catch (e) {}

    // Generate fresh daily missions for today
    this.generateDailyMissions();
  }

  generateDailyMissions() {
    this.missions = [
      {
        id: 'daily_kills',
        titleKey: 'missionKillsTitle',
        descKey: 'missionKillsDesc',
        target: 60,
        current: 0,
        reward: 180,
        icon: '🎯',
        claimed: false
      },
      {
        id: 'daily_slash',
        titleKey: 'missionSlashTitle',
        descKey: 'missionSlashDesc',
        target: 25,
        current: 0,
        reward: 220,
        icon: '⚔️',
        claimed: false
      },
      {
        id: 'daily_waves',
        titleKey: 'missionWavesTitle',
        descKey: 'missionWavesDesc',
        target: 7,
        current: 0,
        reward: 300,
        icon: '🌊',
        claimed: false
      }
    ];

    this.save();
  }

  save() {
    try {
      localStorage.setItem('cyber_mission_date', this.todayKey);
      localStorage.setItem('cyber_missions', JSON.stringify(this.missions));
    } catch (e) {}
  }

  trackProgress(type, amount = 1) {
    let changed = false;
    this.missions.forEach(m => {
      if (m.id === type && !m.claimed) {
        m.current = Math.min(m.target, m.current + amount);
        changed = true;
        if (m.current >= m.target && window.particleEngine) {
          const compMsg = window.i18n ? window.i18n.t('contractCompleted') : '🎯 DAILY CONTRACT COMPLETED!';
          window.particleEngine.addDamageText(window.innerWidth / 2, 80, compMsg, '#ffee00', true);
          if (window.soundEngine) window.soundEngine.playMissionComplete();
        }
      }
    });
    if (changed) this.save();
  }

  claim(missionId, onReward) {
    const m = this.missions.find(x => x.id === missionId);
    if (m && m.current >= m.target && !m.claimed) {
      m.claimed = true;
      this.save();
      if (window.soundEngine) window.soundEngine.playMissionComplete();
      onReward(m.reward);
      this.renderMissions(onReward);
    }
  }

  renderMissions(onRewardClaim = () => {}) {
    const list = document.getElementById('missionsList');
    if (!list) return;

    list.innerHTML = '';
    this.missions.forEach(m => {
      const isDone = m.current >= m.target;
      const progressPercent = Math.min(100, Math.round((m.current / m.target) * 100));

      const title = window.i18n ? window.i18n.t(m.titleKey) : m.titleKey;
      const desc = window.i18n ? window.i18n.t(m.descKey).replace('{target}', m.target) : `${m.descKey} (${m.target})`;

      const card = document.createElement('div');
      card.className = `mission-card ${m.claimed ? 'claimed' : (isDone ? 'completed' : '')}`;

      card.innerHTML = `
        <div class="mission-header">
          <div class="mission-title">
            <span>${m.icon}</span>
            <span>${title}</span>
          </div>
          <div class="mission-reward">+${m.reward} 🪙</div>
        </div>
        <div class="mission-desc">${desc}</div>
        <div class="mission-progress-bar">
          <div class="mission-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="mission-footer">
          <span class="mission-stat">${m.current} / ${m.target}</span>
          ${
            m.claimed
              ? `<span class="mission-badge claimed">${window.i18n ? window.i18n.t('claimedBadge') : '✅ ПОЛУЧЕНО'}</span>`
              : isDone
                ? `<button class="btn btn-gold claim-mission-btn" data-id="${m.id}" style="width: auto; min-height: 44px; padding: 6px 14px; margin: 0; font-size: 12px;">${window.i18n ? window.i18n.t('claimBtn') : '🎁 ЗАБРАТЬ'} +${m.reward}</button>`
                : `<span class="mission-badge in-progress">${window.i18n ? window.i18n.t('inProgressBadge') : 'В ПРОЦЕССЕ'}</span>`
          }
        </div>
      `;

      list.appendChild(card);
    });

    list.querySelectorAll('.claim-mission-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget || e.target).getAttribute('data-id');
        this.claim(id, onRewardClaim);
      });
    });
  }
}

window.missionManager = new MissionManager();
