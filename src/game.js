// Main game loop and canvas controller

class CyberTowerGame {
  constructor() {
    window.game = this;
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Game States
    this.STATE_MENU = 'MENU';
    this.STATE_PLAYING = 'PLAYING';
    this.STATE_PAUSED = 'PAUSED';
    this.STATE_LEVEL_UP = 'LEVEL_UP';
    this.STATE_ROULETTE = 'ROULETTE';
    this.STATE_WHEEL = 'WHEEL';
    this.STATE_LEADERBOARD = 'LEADERBOARD';
    this.STATE_GAME_OVER = 'GAME_OVER';
    this.STATE_WORKSHOP = 'WORKSHOP';
    this.STATE_ACHIEVEMENTS = 'ACHIEVEMENTS';
    this.state = this.STATE_MENU;

    // Selections
    this.selectedClass = 'default';
    this.selectedPet = 'rex';
    this.selectedBiome = 'neon_city';
    this.selectedSkin = 'skin_cyan';
    this.equippedImplants = [];

    // Entities
    this.tower = null;
    this.pet = null;
    this.enemies = [];
    this.enemyProjectiles = [];
    this.scraps = [];
    this.waveManager = new WaveManager();
    this.cyberWheel = null;

    // Session Progress
    this.level = 1;
    this.currentExp = 0;
    this.expToNextLevel = 18;
    this.score = 0;
    this.runChipsEarned = 0;
    this.hasRevivedThisRun = false;
    this.pickedCardIds = [];

    // Kill Combo Multiplier (Fever Mode)
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboMult = 1.0;

    // Meta Progression
    this.meta = {
      totalChips: 100,
      hasClaimedStarterBonus: true,
      lastDailyGiftDate: '',
      highWave: 1,
      highScore: 0,
      hpLevel: 0,
      dmgLevel: 0,
      regenLevel: 0,
      rangeLevel: 0,
      luckLevel: 0,
      unlockedPets: ['rex'],
      unlockedSkins: ['skin_cyan'],
      unlockedImplants: [],
      completedAchievements: []
    };

    this.loadLocalSaveSync();

    this.timeScale = 1.0;
    this.slowMoTimer = 0;
    this.rouletteResult = null;
    this.drawnCards = [];
    this.lastTime = 0;

    this.init();
  }

  loadLocalSaveSync() {
    try {
      const local = localStorage.getItem('cybertower_save') || localStorage.getItem('cyber_tower_save_v1');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          this.meta = Object.assign(this.meta, parsed);
          if (parsed.selectedClass) this.selectedClass = parsed.selectedClass;
          if (parsed.selectedPet) this.selectedPet = parsed.selectedPet;
          if (parsed.selectedBiome) this.selectedBiome = parsed.selectedBiome;
          if (parsed.selectedSkin) this.selectedSkin = parsed.selectedSkin;
        }
      }
    } catch(e) {}
  }

  saveData(immediate = false) {
    const bridge = window.vkPlayBridge;
    if (bridge && typeof bridge.savePlayerData === 'function') {
      bridge.savePlayerData(this.meta, immediate);
    } else {
      try {
        const serial = JSON.stringify(this.meta);
        localStorage.setItem('cybertower_save', serial);
        localStorage.setItem('cyber_tower_save_v1', serial);
      } catch (e) {}
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resizeCanvas(), 200));

    // Early Language Detection from Platform Bridge
    if (window.vkPlayBridge && typeof window.vkPlayBridge.detectInitialLang === 'function') {
      try {
        const lang = window.vkPlayBridge.detectInitialLang();
        if (window.i18n) window.i18n.setLanguageFromSdk(lang);
      } catch (e) {}
    }

    this.tower = new Tower(this.canvas.width / 2, this.canvas.height / 2);
    this.pet = new PetCompanion(this.tower, this.selectedPet);

    this.bindEvents();
    this.initWheel();
    this.applyAllTranslations();

    // Start loop immediately on frame 1 to guarantee 0ms blackscreen
    requestAnimationFrame((t) => this.loop(t));
    this.render();

    // Notify GameReady API when initial start screen is fully rendered & interactive
    window.isGameInteractive = true;
    if (typeof window.fireGameReady === 'function') window.fireGameReady();
    const bridge = window.vkPlayBridge;
    if (bridge) {
      bridge.notifyGameReady();
      bridge.loadPlayerData().then((saved) => {
        if (saved) {
          this.meta = Object.assign(this.meta, saved);
          if (saved.selectedClass) this.selectedClass = saved.selectedClass;
          if (saved.selectedPet) this.selectedPet = saved.selectedPet;
          if (saved.selectedBiome) this.selectedBiome = saved.selectedBiome;
          if (saved.selectedSkin) this.selectedSkin = saved.selectedSkin;
          if (this.pet && saved.selectedPet) this.pet.reset(this.selectedPet);
          this.applyAllTranslations();
          this.updateUI();
        }
        if (this.meta && this.meta.highWave > 1 && typeof bridge.submitScore === 'function') {
          bridge.submitScore('cybertower_waves', this.meta.highWave);
        }
        this.checkShortcutAvailability();
      }).catch((err) => {
        console.warn('[Game] Async loadPlayerData error:', err);
      });
    }
  }

  t(key) {
    return window.i18n ? window.i18n.t(key) : key;
  }

  applyAllTranslations() {
    if (window.i18n) {
      window.i18n.applyTranslations();
      const currentLang = window.i18n.currentLang || 'ru';
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
      });
    }
    this.renderClassSelector();
    this.renderPetSelector();
    this.renderBiomeSelector();
    this.renderSkinSelector();
    this.updateUI();
  }

  initWheel() {
    this.cyberWheel = new CyberWheel('wheelCanvas', (prize) => {
      this.handleWheelPrize(prize);
    });
  }

  resizeCanvas() {
    const container = document.getElementById('canvasContainer');
    const displayW = container ? (container.clientWidth || window.innerWidth) : window.innerWidth;
    const displayH = container ? (container.clientHeight || window.innerHeight) : window.innerHeight;

    this.canvas.width = displayW;
    this.canvas.height = displayH;

    if (this.tower) {
      this.tower.x = displayW / 2;
      this.tower.y = displayH / 2;
    }
    this.autoScaleMobileUI();
  }

  autoScaleMobileUI() {
    const isMobileOrTablet = window.innerWidth < 768 || window.innerHeight < 700;
    const cards = document.querySelectorAll('.screen-card');
    
    if (isMobileOrTablet) {
      const availH = Math.floor(window.innerHeight - 20);
      cards.forEach(card => {
        card.style.maxHeight = `${availH}px`;
      });
    } else {
      cards.forEach(card => {
        card.style.maxHeight = '90vh';
      });
    }
  }

  triggerHaptic(duration = 15) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  }

  getCameraZoom() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const isPortrait = h > w;
    if (isPortrait) {
      // Mobile portrait: fit the enlarged 400px radar arena with 16px safe screen margin
      const availableRadius = Math.max(140, (w / 2) - 16);
      return availableRadius / 400;
    } else {
      // PC landscape: exact original standard 1.0 zoom
      return 1.0;
    }
  }

  screenToWorld(screenX, screenY) {
    const zoom = this.getCameraZoom();
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    return {
      x: (screenX - cx) / zoom + cx,
      y: (screenY - cy) / zoom + cy
    };
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerOneButtonAction();
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === this.STATE_PLAYING) {
          this.pauseGame();
        } else if (this.state === this.STATE_PAUSED) {
          this.resumeGame();
        } else if (this.state !== this.STATE_MENU) {
          this.showMenu();
        }
      }
    });

    const handleAimStart = (clientX, clientY) => {
      if (this.state === this.STATE_PLAYING && this.tower) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;
        const worldPos = this.screenToWorld(canvasX, canvasY);

        // Check if player directly tapped/clicked a loot crate
        if (this.waveManager && this.waveManager.crates) {
          for (let i = this.waveManager.crates.length - 1; i >= 0; i--) {
            const c = this.waveManager.crates[i];
            if (Math.hypot(worldPos.x - c.x, worldPos.y - c.y) <= c.radius + 24) {
              this.waveManager.crates.splice(i, 1);
              this.triggerHaptic(25);
              this.collectCrate(c);
              return;
            }
          }
        }

        this.tower.isManualAiming = true;
        this.tower.manualAimTarget = worldPos;
        this.lastTouchPos = worldPos;
        this.triggerHaptic(10);
      }
    };

    const handleAimMove = (clientX, clientY) => {
      if (this.state === this.STATE_PLAYING && this.tower && this.tower.isManualAiming) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;
        const worldPos = this.screenToWorld(canvasX, canvasY);
        this.tower.manualAimTarget = worldPos;

        if (this.lastTouchPos) {
          const dx = worldPos.x - this.lastTouchPos.x;
          const dy = worldPos.y - this.lastTouchPos.y;
          const speed = Math.hypot(dx, dy);

          // Fast swipe gesture (Cyber Blade Slash) - Only triggers on rapid flick gestures (speed >= 52)
          if (speed >= 52) {
            if (window.particleEngine) {
              window.particleEngine.addSlashBlade(this.lastTouchPos.x, this.lastTouchPos.y, worldPos.x, worldPos.y, '#00ffff');
            }

            for (let j = this.enemies.length - 1; j >= 0; j--) {
              const e = this.enemies[j];
              if (this.tower.distToSegment(this.lastTouchPos, worldPos, e) <= e.radius + 18) {
                if (window.particleEngine) window.particleEngine.addSparks(e.x, e.y, '#00ffff', 6, 1.2);
                if (e.takeDamage(120 * this.tower.stats.damageMult, true, '#00ffff')) {
                  this.enemies.splice(j, 1);
                }
              }
            }

            for (let b = this.enemyProjectiles.length - 1; b >= 0; b--) {
              const ep = this.enemyProjectiles[b];
              if (this.tower.distToSegment(this.lastTouchPos, worldPos, ep) <= ep.radius + 16) {
                this.enemyProjectiles.splice(b, 1);
                if (window.particleEngine) window.particleEngine.addSparks(ep.x, ep.y, '#ff007f', 4, 1.0);
              }
            }

            this.triggerHaptic(12);
          }
        }
        this.lastTouchPos = worldPos;
      }
    };

    const handleAimEnd = () => {
      if (this.tower) {
        this.tower.isManualAiming = false;
        this.lastTouchPos = null;
      }
    };

    if (window.PointerEvent) {
      this.canvas.addEventListener('pointerdown', (e) => handleAimStart(e.clientX, e.clientY));
      this.canvas.addEventListener('pointermove', (e) => handleAimMove(e.clientX, e.clientY));
      window.addEventListener('pointerup', handleAimEnd);
      window.addEventListener('pointercancel', handleAimEnd);
    } else {
      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          handleAimStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          handleAimMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('touchend', handleAimEnd, { passive: true });
      window.addEventListener('touchcancel', handleAimEnd, { passive: true });
    }

    // Menu Buttons with Clean Direct Click Listener for 100% Iframe & Device Compatibility
    const bindBtn = (id, callback) => {
      const el = document.getElementById(id);
      if (el) {
        el.onclick = (e) => {
          this.triggerHaptic(20);
          callback(e);
        };
      }
    };

    // Web Audio API user gesture unlock listener for mobile & desktop autoplay policies
    const unlockAudio = () => {
      if (window.soundEngine && typeof window.soundEngine.resume === 'function') {
        window.soundEngine.resume();
      }
    };
    ['pointerdown', 'touchstart', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { once: true, passive: true });
    });

    let lastStartRunTime = 0;
    const safeStartRun = () => {
      const now = Date.now();
      if (now - lastStartRunTime < 500) return;
      lastStartRunTime = now;
      try { window.focus(); } catch(err) {}
      this.startRun();
    };

    bindBtn('startBtn', safeStartRun);

    // Bulletproof Capture-Phase Dispatcher for startBtn (bypasses any platform iframe overlay block)
    const handleGlobalStartRun = (e) => {
      const target = e.target;
      if (target && (target.id === 'startBtn' || (target.closest && target.closest('#startBtn')))) {
        safeStartRun();
      }
    };
    document.addEventListener('click', handleGlobalStartRun, true);
    bindBtn('loadoutBtn', () => this.openLoadout());
    bindBtn('closeLoadoutBtn', () => this.showMenu());
    bindBtn('workshopBtn', () => this.openWorkshop());
    bindBtn('closeWorkshopBtn', () => this.closeWorkshop());
    bindBtn('achievementsBtn', () => this.openAchievements());
    bindBtn('closeAchBtn', () => this.showMenu());
    bindBtn('leaderboardBtn', () => this.openLeaderboard());
    bindBtn('closeLeaderboardBtn', () => this.showMenu());
    bindBtn('wheelMenuBtn', () => this.openWheelModal());
    bindBtn('closeWheelBtn', () => this.showMenu());
    bindBtn('codexBtn', () => this.openCodex());
    bindBtn('closeCodexBtn', () => this.showMenu());
    bindBtn('missionsBtn', () => this.openMissions());
    bindBtn('closeMissionsBtn', () => this.showMenu());
    bindBtn('radioBtn', () => this.openRadio());
    bindBtn('closeRadioBtn', () => this.showMenu());
    bindBtn('restartBtn', () => {
      if (this.state === this.STATE_GAME_OVER && window.vkPlayBridge) {
        window.vkPlayBridge.showInterstitial({
          onClose: () => {
            this.startRun();
          }
        });
      } else {
        this.startRun();
      }
    });
    bindBtn('menuBtn', () => {
      if (this.state === this.STATE_GAME_OVER && window.vkPlayBridge) {
        window.vkPlayBridge.showInterstitial({
          onClose: () => {
            this.showMenu();
          }
        });
      } else {
        this.showMenu();
      }
    });
    bindBtn('pauseBtn', () => this.pauseGame());
    bindBtn('resumeBtn', () => this.resumeGame());
    bindBtn('pauseMenuBtn', () => {
      if (this.waveManager) {
        this.meta.highWave = Math.max(this.meta.highWave || 1, this.waveManager.currentWave);
        this.meta.highScore = Math.max(this.meta.highScore || 0, this.score);
        this.saveData(true);
        if (window.vkPlayBridge && typeof window.vkPlayBridge.submitScore === 'function') {
          window.vkPlayBridge.submitScore('cybertower_waves', this.meta.highWave);
        }
      }
      this.showMenu();
    });
    bindBtn('rateGameBtn', () => this.rateGame());
    bindBtn('shortcutBtn', () => this.addShortcut());

    // Codex Claim Button
    const codexClaim = document.getElementById('codexClaimBtn');
    if (codexClaim) {
      codexClaim.addEventListener('click', () => {
        if (window.codexManager) {
          window.codexManager.claimReward((chips) => {
            this.meta.totalChips += chips;
            window.vkPlayBridge.savePlayerData(this.meta);
            this.updateUI();
          });
        }
      });
    }

    // Radio station selector
    document.querySelectorAll('.radio-station-card').forEach(btn => {
      btn.addEventListener('click', () => {
        this.triggerHaptic(20);
        document.querySelectorAll('.radio-station-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const station = btn.getAttribute('data-station');
        if (window.soundEngine) {
          window.soundEngine.setRadioStation(station);
        }
      });
    });

    // Language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.triggerHaptic(15);
        const lang = btn.getAttribute('data-lang');
        if (window.i18n) {
          window.i18n.setLanguage(lang);
          this.applyAllTranslations();
        }
      });
    });

    bindBtn('spinWheelBtn', () => {
      const today = new Date().toDateString();
      if (!this.meta) this.meta = {};

      if (this.meta.lastWheelSpinDate === today) {
        if (window.particleEngine) {
          window.particleEngine.addDamageText(this.canvas.width / 2, 220, this.t('wheelUsedToday') || '✅ УЖЕ ИСПОЛЬЗОВАНО СЕГОДНЯ!', '#00ffff', true);
        }
        return;
      }

      if (this.cyberWheel && !this.cyberWheel.isSpinning) {
        this.meta.lastWheelSpinDate = today;
        this.saveData(true);
        this.cyberWheel.spin();
        
        const spinBtn = document.getElementById('spinWheelBtn');
        if (spinBtn) {
          spinBtn.classList.add('disabled');
          spinBtn.innerText = this.t('wheelUsedToday') || '✅ ВРАЩЕНИЕ ИСПОЛЬЗОВАНО СЕГОДНЯ';
        }
      }
    });

    let lastDailyGiftClaimTime = 0;
    const claimDailyGift = () => {
      const now = Date.now();
      if (now - lastDailyGiftClaimTime < 600) return;
      lastDailyGiftClaimTime = now;
      this.triggerHaptic(30);
      const today = new Date().toDateString();
      if (!this.meta) this.meta = {};
      if (this.meta.lastDailyGiftDate !== today) {
        this.meta.lastDailyGiftDate = today;
        this.meta.totalChips = (this.meta.totalChips || 0) + 75;
        this.saveData(true);
        if (window.soundEngine) window.soundEngine.playPickup();
        if (window.particleEngine) {
          window.particleEngine.addDamageText(this.canvas.width / 2, 220, '🎁 +75 🪙', '#ffee00', true);
        }
        this.updateUI();
      } else {
        if (window.particleEngine) {
          window.particleEngine.addDamageText(this.canvas.width / 2, 220, this.t('giftClaimed') || '✅ УЖЕ ПОЛУЧЕНО СЕГОДНЯ!', '#00ffff', true);
        }
      }
    };
    bindBtn('dailyGiftBtn', claimDailyGift);

    const syncSoundBtns = () => {
      const isMuted = window.soundEngine ? window.soundEngine.muted : false;
      const sBtn = document.getElementById('soundBtn');
      if (sBtn) sBtn.innerText = isMuted ? '🔇' : '🔊';
      const pBtn = document.getElementById('pauseSoundBtn');
      if (pBtn) pBtn.innerText = isMuted ? this.t('soundOff') : this.t('soundOn');
    };

    bindBtn('soundBtn', () => {
      if (window.soundEngine) window.soundEngine.toggleMute();
      syncSoundBtns();
    });

    bindBtn('pauseSoundBtn', () => {
      if (window.soundEngine) window.soundEngine.toggleMute();
      syncSoundBtns();
    });
    syncSoundBtns();

    const overBtn = document.getElementById('overdriveBtn');
    if (overBtn) {
      overBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerOneButtonAction();
      });
    }

    bindBtn('claimRouletteBtn', () => this.closeRoulette());

    bindBtn('reviveAdBtn', () => {
      if (window.vkPlayBridge && typeof window.vkPlayBridge.showRewardedVideo === 'function') {
        window.vkPlayBridge.showRewardedVideo({
          onRewarded: () => this.reviveTower(),
          onClose: () => {},
          onError: () => {
            if (window.particleEngine) {
              window.particleEngine.addDamageText(this.canvas.width / 2, 200, '⚠️ РЕКЛАМА НЕДОСТУПНА', '#ff0055', true);
            }
          }
        });
      } else {
        this.reviveTower();
      }
    });

    bindBtn('doubleChipsAdBtn', () => {
      if (window.vkPlayBridge && typeof window.vkPlayBridge.showRewardedVideo === 'function') {
        window.vkPlayBridge.showRewardedVideo({
          onRewarded: () => this.doubleChips(),
          onClose: () => {},
          onError: () => {
            if (window.particleEngine) {
              window.particleEngine.addDamageText(this.canvas.width / 2, 200, '⚠️ РЕКЛАМА НЕДОСТУПНА', '#ff0055', true);
            }
          }
        });
      } else {
        this.doubleChips();
      }
    });

    bindBtn('rerollCardsBtn', () => {
      if (window.vkPlayBridge && typeof window.vkPlayBridge.showRewardedVideo === 'function') {
        window.vkPlayBridge.showRewardedVideo({
          onRewarded: () => this.rerollUpgradeCards(),
          onClose: () => {},
          onError: () => {
            if (window.particleEngine) {
              window.particleEngine.addDamageText(this.canvas.width / 2, 200, '⚠️ РЕКЛАМА НЕДОСТУПНА', '#ff0055', true);
            }
          }
        });
      } else {
        this.rerollUpgradeCards();
      }
    });

    // Section 1.3 Requirement: Automatic pause & mute when tab loses focus / is backgrounded
    const handleLossOfFocus = () => {
      if (window.soundEngine) window.soundEngine.setSystemMuted(true);
      if (this.state === this.STATE_PLAYING) {
        this.pauseGame();
      }
    };

    const handleGainOfFocus = () => {
      if (!document.hidden) {
        if (window.vkPlayBridge && window.vkPlayBridge.isAdShowing) return;
        if (window.soundEngine) window.soundEngine.setSystemMuted(false);
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        handleLossOfFocus();
      } else {
        handleGainOfFocus();
      }
    });

    window.addEventListener('blur', handleLossOfFocus);
    window.addEventListener('focus', handleGainOfFocus);
    window.addEventListener('pagehide', handleLossOfFocus);
    window.addEventListener('pageshow', handleGainOfFocus);

    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('selectstart', (e) => e.preventDefault());
    document.addEventListener('dragstart', (e) => e.preventDefault());
  }

  pauseGame() {
    if (this.state === this.STATE_PLAYING) {
      this.state = this.STATE_PAUSED;
      this.showModal('pauseModal');
    }
  }

  resumeGame() {
    if (this.state === this.STATE_PAUSED) {
      this.state = this.STATE_PLAYING;
      this.hideModal('pauseModal');
    }
  }

  handleWheelPrize(prize) {
    try {
      if (!prize) return;
      this.triggerHaptic([30, 50, 30]);

      if (!this.meta) this.meta = {};
      if (!this.meta.unlockedPets) this.meta.unlockedPets = ['rex'];
      if (!this.meta.unlockedSkins) this.meta.unlockedSkins = ['skin_cyan'];
      if (!this.meta.totalChips && this.meta.totalChips !== 0) this.meta.totalChips = 100;
      this.meta.lastWheelSpinDate = new Date().toDateString();

      const resultText = document.getElementById('wheelResultText');
      if (resultText) {
        resultText.innerText = `🎉 ${prize.label}!`;
        resultText.style.display = 'block';
        resultText.style.color = prize.color || '#ffee00';
      }

      const spinBtn = document.getElementById('spinWheelBtn');
      if (spinBtn) {
        spinBtn.innerText = this.t('wheelUsedToday') || '✅ ВРАЩЕНИЕ ИСПОЛЬЗОВАНО СЕГОДНЯ';
        spinBtn.classList.add('disabled');
      }

      if (prize.type === 'chips') {
        this.meta.totalChips += (prize.value || 0);
      } else if (prize.type === 'pet') {
        if (!this.meta.unlockedPets.includes(prize.value)) {
          this.meta.unlockedPets.push(prize.value);
        }
        this.selectedPet = prize.value;
      } else if (prize.type === 'skin') {
        if (!this.meta.unlockedSkins.includes(prize.value)) {
          this.meta.unlockedSkins.push(prize.value);
        }
        this.selectedSkin = prize.value;
      } else if (prize.type === 'buff') {
        this.meta.totalChips += 100;
      }

      if (window.soundEngine) window.soundEngine.playPickup();
      if (window.particleEngine) {
        window.particleEngine.addDamageText(this.canvas.width / 2, 180, `🎁 +${prize.label}`, prize.color || '#ffee00', true);
      }

      this.saveData();
      this.updateUI();
      console.log('[Wheel] Prize awarded:', prize);
    } catch(err) {
      console.error('[Wheel] Error handling wheel prize:', err);
    }
  }

  async openLeaderboard() {
    this.state = this.STATE_LEADERBOARD;
    this.hideAllModals();
    document.getElementById('leaderboardModal').classList.remove('hidden');

    const container = document.getElementById('leaderboardList');
    container.innerHTML = `<div style="color: var(--text-muted); padding: 12px;">${this.t('loadingHall')}</div>`;

    let entries = [];
    if (window.vkPlayBridge && typeof window.vkPlayBridge.fetchLeaderboard === 'function') {
      try {
        entries = await window.vkPlayBridge.fetchLeaderboard();
      } catch(e) {
        console.warn('[Leaderboard] Fetch error:', e);
      }
    }
    if (!entries || !entries.length) {
      entries = [
        { rank: 1, player: { publicName: 'CyberNinja_99' }, score: 28 },
        { rank: 2, player: { publicName: 'NeonOverlord' }, score: 22 },
        { rank: 3, player: { publicName: 'MatrixRebel' }, score: 17 },
        { rank: 4, player: { publicName: 'SentinelX' }, score: 14 },
        { rank: 5, player: { publicName: 'ViperPilot' }, score: 11 }
      ];
    }
    container.innerHTML = '';

    entries.forEach((e, idx) => {
      const row = document.createElement('div');
      const rankNum = e.rank || (idx + 1);
      const isTop = rankNum === 1;
      row.className = `workshop-row ${isTop ? 'done' : ''}`;
      const rawName = (e.player && (e.player.publicName || e.player.name)) ? (e.player.publicName || e.player.name) : `Commander_${rankNum}`;
      const playerName = this.escapeHtml(rawName);
      row.innerHTML = `
        <div class="workshop-info">
          <span style="font-size: 16px; font-weight: bold; color: ${rankNum <= 3 ? 'var(--neon-gold)' : 'var(--neon-cyan)'};">#${rankNum}</span>
          <div>
            <div class="workshop-title">${playerName}</div>
            <div class="workshop-level">${this.t('highWave')}: <b>${e.score}</b></div>
          </div>
        </div>
        <div style="font-weight: bold; color: var(--neon-gold);">
          ${isTop ? this.t('champion') : `${e.score} 🌊`}
        </div>
      `;
      container.appendChild(row);
    });
  }

  openWheelModal() {
    this.state = this.STATE_WHEEL;
    this.hideAllModals();
    const modal = document.getElementById('wheelModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }

    if (!this.meta) this.meta = {};
    const today = new Date().toDateString();
    const spinBtn = document.getElementById('spinWheelBtn');
    const resText = document.getElementById('wheelResultText');

    if (this.meta.lastWheelSpinDate === today) {
      if (spinBtn) {
        spinBtn.innerText = this.t('wheelUsedToday') || '✅ ВРАЩЕНИЕ ИСПОЛЬЗОВАНО СЕГОДНЯ';
        spinBtn.classList.add('disabled');
      }
      if (resText) {
        resText.innerText = this.t('wheelNextSpinTomorrow') || '⌛ Следующее ежедневное вращение будет доступно завтра!';
        resText.style.display = 'block';
        resText.style.color = '#00ffff';
      }
    } else {
      if (spinBtn) {
        spinBtn.innerText = this.t('spinWheel') || '🎰 КРУТИТЬ КОЛЕСО!';
        spinBtn.classList.remove('disabled');
      }
      if (resText) resText.style.display = 'none';
    }

    if (!this.cyberWheel && typeof window.CyberWheel === 'function') {
      this.initWheel();
    }
    if (this.cyberWheel) {
      this.cyberWheel.draw();
    }
  }

  renderPetSelector() {
    const container = document.getElementById('petSelector');
    if (!container) return;
    container.innerHTML = '';
    if (!this.meta) this.meta = {};
    if (!this.meta.unlockedPets) this.meta.unlockedPets = ['rex'];

    window.CYBER_PETS.forEach(p => {
      const isUnlocked = this.meta.unlockedPets.includes(p.id);
      const isSelected = this.selectedPet === p.id;
      const el = document.createElement('div');
      el.className = `class-card ${isSelected ? 'active' : ''}`;
      const nameText = this.t(p.nameKey) || p.name;
      const descText = this.t(p.descKey) || p.desc;
      el.innerHTML = `
        <div class="class-icon">${p.icon}</div>
        <div class="class-title">${nameText}</div>
        <div class="class-desc">${descText}</div>
        <div style="font-size: 9.5px; margin-top: 3px; color: ${isUnlocked ? '#39ff14' : 'var(--neon-gold)'};">
          ${isUnlocked ? (isSelected ? this.t('active') : this.t('select')) : `${this.t('buy')}: ${p.cost} 🪙`}
        </div>
      `;
      el.onclick = () => {
        try {
          this.triggerHaptic(15);
          if (window.soundEngine && typeof window.soundEngine.playClick === 'function') {
            window.soundEngine.playClick();
          }
          if (isUnlocked) {
            this.selectedPet = p.id;
            if (this.meta) this.meta.selectedPet = p.id;
            this.saveData();
            if (this.pet) this.pet.reset(p.id);
            this.renderPetSelector();
            this.updateUI();
          } else if ((this.meta.totalChips || 0) >= p.cost) {
            this.meta.totalChips -= p.cost;
            this.meta.unlockedPets.push(p.id);
            this.selectedPet = p.id;
            if (this.meta) this.meta.selectedPet = p.id;
            if (this.pet) this.pet.reset(p.id);
            this.saveData();
            this.renderPetSelector();
            this.updateUI();
          }
        } catch(err) {
          console.error('[PetSelector] Click error:', err);
        }
      };
      container.appendChild(el);
    });
  }

  renderBiomeSelector() {
    const container = document.getElementById('biomeSelector');
    if (!container) return;
    container.innerHTML = '';

    window.CYBER_BIOMES.forEach(b => {
      const isSelected = this.selectedBiome === b.id;
      const el = document.createElement('div');
      el.className = `class-card ${isSelected ? 'active' : ''}`;
      const nameText = this.t(b.nameKey) || b.name;
      const descText = this.t(b.descKey) || b.desc;
      el.innerHTML = `
        <div class="class-icon">${b.icon}</div>
        <div class="class-title">${nameText}</div>
        <div class="class-desc">${descText}</div>
      `;
      el.onclick = () => {
        try {
          this.triggerHaptic(15);
          if (window.soundEngine && typeof window.soundEngine.playClick === 'function') {
            window.soundEngine.playClick();
          }
          this.selectedBiome = b.id;
          if (this.meta) this.meta.selectedBiome = b.id;
          this.saveData();
          this.renderBiomeSelector();
          this.updateUI();
        } catch(err) {
          console.error('[BiomeSelector] Click error:', err);
        }
      };
      container.appendChild(el);
    });
  }

  renderSkinSelector() {
    const container = document.getElementById('skinSelector');
    if (!container) return;
    container.innerHTML = '';
    if (!this.meta) this.meta = {};
    if (!this.meta.unlockedSkins) this.meta.unlockedSkins = ['skin_cyan'];

    window.TOWER_SKINS.forEach(s => {
      const isUnlocked = this.meta.unlockedSkins.includes(s.id);
      const isSelected = this.selectedSkin === s.id;
      const el = document.createElement('div');
      el.className = `class-card ${isSelected ? 'active' : ''}`;
      const nameText = this.t(s.nameKey) || s.name;
      const descText = this.t(s.descKey) || s.desc;
      el.innerHTML = `
        <div class="class-icon" style="color: ${s.color}">${s.icon}</div>
        <div class="class-title" style="color: ${s.color}">${nameText}</div>
        <div class="class-desc">${descText}</div>
        <div style="font-size: 9.5px; margin-top: 3px; color: ${isUnlocked ? '#39ff14' : 'var(--neon-gold)'};">
          ${isUnlocked ? (isSelected ? this.t('active') : this.t('select')) : `${this.t('buy')}: ${s.cost} 🪙`}
        </div>
      `;
      el.onclick = () => {
        try {
          this.triggerHaptic(15);
          if (window.soundEngine && typeof window.soundEngine.playClick === 'function') {
            window.soundEngine.playClick();
          }
          if (isUnlocked) {
            this.selectedSkin = s.id;
            if (this.meta) this.meta.selectedSkin = s.id;
            this.saveData();
            if (this.tower) this.tower.skinId = s.id;
            this.renderSkinSelector();
            this.updateUI();
          } else if ((this.meta.totalChips || 0) >= s.cost) {
            this.meta.totalChips -= s.cost;
            this.meta.unlockedSkins.push(s.id);
            this.selectedSkin = s.id;
            if (this.meta) this.meta.selectedSkin = s.id;
            if (this.tower) this.tower.skinId = s.id;
            this.saveData();
            this.renderSkinSelector();
            this.updateUI();
          }
        } catch(err) {
          console.error('[SkinSelector] Click error:', err);
        }
      };
      container.appendChild(el);
    });
  }

  renderClassSelector() {
    const container = document.getElementById('classSelector');
    if (!container) return;
    container.innerHTML = '';

    window.TOWER_CLASSES.forEach(tc => {
      const el = document.createElement('div');
      el.className = `class-card ${this.selectedClass === tc.id ? 'active' : ''}`;
      const nameText = this.t(tc.nameKey) || tc.name;
      const descText = this.t(tc.descKey) || tc.desc;
      el.innerHTML = `
        <div class="class-icon">${tc.icon}</div>
        <div class="class-title">${nameText}</div>
        <div class="class-desc">${descText}</div>
      `;
      el.onclick = () => {
        try {
          this.triggerHaptic(15);
          if (window.soundEngine && typeof window.soundEngine.playClick === 'function') {
            window.soundEngine.playClick();
          }
          this.selectedClass = tc.id;
          if (this.meta) this.meta.selectedClass = tc.id;
          this.saveData();
          if (this.tower) this.tower.currentClass = tc.id;
          this.renderClassSelector();
          this.updateUI();
        } catch(err) {
          console.error('[ClassSelector] Click error:', err);
        }
      };
      container.appendChild(el);
    });
  }

  triggerOneButtonAction() {
    if (this.state === this.STATE_PLAYING && this.tower) {
      this.tower.triggerEMP(this.enemies, this.enemyProjectiles);
      this.triggerHaptic([40, 60, 40]);
    }
  }

  startRun() {
    if (this.state === this.STATE_PLAYING) return;
    try {
      this.state = this.STATE_PLAYING;
      this.enemies = [];
      this.enemyProjectiles = [];
      this.scraps = [];
      this.level = 1;
      this.currentExp = 0;
      this.expToNextLevel = 18;
      this.score = 0;
      this.runChipsEarned = 0;
      this.comboCount = 0;
      this.comboMult = 1.0;
      this.hasRevivedThisRun = false;
      this.pickedCardIds = [];

      if (this.waveManager) this.waveManager.reset();
      if (window.particleEngine) window.particleEngine.reset();
      
      const width = (this.canvas && this.canvas.width) ? this.canvas.width : window.innerWidth;
      const height = (this.canvas && this.canvas.height) ? this.canvas.height : window.innerHeight;

      if (this.tower) {
        this.tower.reset(width / 2, height / 2, this.meta || {}, this.selectedClass || 'default', this.equippedImplants || [], this.selectedSkin || 'skin_cyan');
      }

      const rankInfo = this.getCommanderRank();
      if (rankInfo && rankInfo.bonusDmg && this.tower && this.tower.stats) {
        this.tower.stats.damageMult += rankInfo.bonusDmg;
      }

      if (this.pet) this.pet.reset(this.selectedPet || 'rex');

      this.hideAllModals();
      const menu = document.getElementById('menuScreen');
      if (menu) {
        menu.classList.add('hidden');
        menu.style.display = 'none';
      }

      const hud = document.getElementById('hud');
      if (hud) {
        hud.classList.remove('hidden');
        hud.style.display = 'block';
      }

      if (window.soundEngine && !window.soundEngine.muted) {
        window.soundEngine.startMusic();
      }
      console.log('[Game] startRun executed successfully. State set to PLAYING.');
    } catch (err) {
      console.error('[Game] Error during startRun execution:', err);
      // Force start state fallback
      this.state = this.STATE_PLAYING;
      this.hideAllModals();
      const menu = document.getElementById('menuScreen');
      if (menu) {
        menu.classList.add('hidden');
        menu.style.display = 'none';
      }
      const hud = document.getElementById('hud');
      if (hud) {
        hud.classList.remove('hidden');
        hud.style.display = 'block';
      }
    }
  }

  getCommanderRank() {
    const chips = this.meta.totalChips || 0;
    let highestRank = window.COMMANDER_RANKS[0];
    for (const r of window.COMMANDER_RANKS) {
      if (chips >= r.reqChips) highestRank = r;
    }
    return highestRank;
  }

  showMenu() {
    this.state = this.STATE_MENU;
    if (window.soundEngine) {
      window.soundEngine.stopMusic();
    }
    if (window.particleEngine) {
      window.particleEngine.shakeIntensity = 0;
      window.particleEngine.shakeDuration = 0;
    }
    this.hideAllModals();
    const hud = document.getElementById('hud');
    if (hud) hud.classList.add('hidden');
    const menu = document.getElementById('menuScreen');
    if (menu) {
      menu.classList.remove('hidden');
      menu.style.display = 'flex';
    }
    this.applyAllTranslations();
    this.checkShortcutAvailability();
  }

  async rateGame() {
    if (!window.vkPlayBridge) return;
    try {
      const reviewCheck = await window.vkPlayBridge.canReview();
      if (reviewCheck && reviewCheck.value) {
        const res = await window.vkPlayBridge.requestReview();
        if (res && res.feedbackSent) {
          if (window.particleEngine) {
            window.particleEngine.addDamageText(this.canvas.width / 2, 100, this.t('reviewSuccess'), '#ffee00', true);
          }
        }
      } else {
        console.log('[Game] Cannot review at this time:', reviewCheck ? reviewCheck.reason : 'unknown');
        if (window.particleEngine) {
          window.particleEngine.addDamageText(this.canvas.width / 2, 100, this.t('reviewThanks') || '⭐⭐⭐⭐⭐', '#00ffff', true);
        }
      }
    } catch (e) {
      console.warn('[Game] rateGame error:', e);
    }
  }

  async addShortcut() {
    if (!window.vkPlayBridge) return;
    try {
      const res = await window.vkPlayBridge.showShortcutPrompt();
      if (res && res.outcome === 'accepted') {
        const btn = document.getElementById('shortcutBtn');
        if (btn) btn.style.display = 'none';
        if (window.particleEngine) {
          window.particleEngine.addDamageText(this.canvas.width / 2, 100, this.t('shortcutSuccess'), '#39ff14', true);
        }
      }
    } catch (e) {
      console.warn('[Game] addShortcut error:', e);
    }
  }

  async checkShortcutAvailability() {
    if (!window.vkPlayBridge) return;
    try {
      const res = await window.vkPlayBridge.canShowShortcutPrompt();
      const btn = document.getElementById('shortcutBtn');
      if (btn) {
        btn.style.display = (res && res.canShow) ? 'inline-flex' : 'none';
      }
    } catch (e) {}
  }

  returnToMenu() {
    return this.showMenu();
  }

  closeCodex() {
    return this.showMenu();
  }

  closeWorkshop() {
    return this.showMenu();
  }

  closeMissions() {
    return this.showMenu();
  }

  closeLeaderboard() {
    return this.showMenu();
  }

  closeLoadout() {
    return this.showMenu();
  }

  closeRadio() {
    return this.showMenu();
  }

  setClass(classId) {
    if (classId === 'heavy') classId = 'dreadnought';
    if (classId === 'sentinel') classId = 'default';
    this.selectedClass = classId;
    if (this.tower && this.tower.reset) {
      const width = (this.canvas && this.canvas.width) ? this.canvas.width : window.innerWidth;
      const height = (this.canvas && this.canvas.height) ? this.canvas.height : window.innerHeight;
      this.tower.reset(width / 2, height / 2, this.meta || {}, this.selectedClass || 'default', this.equippedImplants || [], this.selectedSkin || 'skin_cyan');
    }
    this.applyAllTranslations();
  }

  setPet(petId) {
    this.selectedPet = petId;
    if (this.pet && this.pet.reset) this.pet.reset(petId);
    this.applyAllTranslations();
  }

  setBiome(biomeId) {
    this.selectedBiome = biomeId;
    this.applyAllTranslations();
  }

  setSkin(skinId) {
    this.selectedSkin = skinId;
    if (this.tower) {
      this.tower.skinId = skinId;
      if (skinId === 'skin_gold') this.tower.towerColor = '#ffee00';
      else if (skinId === 'skin_phantom') this.tower.towerColor = '#9d00ff';
      else this.tower.towerColor = '#00ffff';
    }
    this.applyAllTranslations();
  }

  openLoadout() {
    this.hideAllModals();
    const modal = document.getElementById('loadoutModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    this.renderClassSelector();
    this.renderPetSelector();
    this.renderBiomeSelector();
    this.renderSkinSelector();
  }

  openWorkshop() {
    this.state = this.STATE_WORKSHOP;
    this.hideAllModals();
    const modal = document.getElementById('workshopModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    this.renderWorkshopCards();
    this.renderImplants();
  }

  openAchievements() {
    this.state = this.STATE_ACHIEVEMENTS;
    this.hideAllModals();
    const modal = document.getElementById('achievementsModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    this.renderAchievements();
  }

  openCodex() {
    this.hideAllModals();
    const modal = document.getElementById('codexModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    if (window.codexManager) {
      window.codexManager.renderGallery();
    }
  }

  openMissions() {
    this.hideAllModals();
    const modal = document.getElementById('missionsModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    if (window.missionManager) {
      window.missionManager.renderMissions((reward) => {
        this.meta.totalChips += reward;
        window.vkPlayBridge.savePlayerData(this.meta);
        this.updateUI();
      });
    }
  }

  openRadio() {
    this.hideAllModals();
    const modal = document.getElementById('radioModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
  }

  showModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      el.style.display = 'flex';
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    }
  }

  hideModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  }

  hideAllModals() {
    document.querySelectorAll('.modal, .screen-overlay').forEach(el => {
      el.classList.add('hidden');
      el.style.display = 'none';
    });
  }

  openRoulette() {
    this.state = this.STATE_ROULETTE;
    if (window.soundEngine) window.soundEngine.playChestOpen();

    const modal = document.getElementById('rouletteModal');
    modal.classList.remove('hidden');

    const reel = document.getElementById('rouletteReel');
    const claimBtn = document.getElementById('claimRouletteBtn');
    claimBtn.style.display = 'none';

    const possiblePrizes = [
      { text: this.t('prizeJackpot'), icon: '🪙', apply: () => { this.runChipsEarned += 100; this.meta.totalChips = (this.meta.totalChips || 0) + 100; this.saveData(); } },
      { text: this.t('prizeLevels'), icon: '🌟', apply: () => { this.triggerLevelUp(); } },
      { text: this.t('prizeRepair'), icon: '🛡️', apply: () => { this.tower.hp = this.tower.maxHp; this.tower.shield = this.tower.maxShield; } },
      { text: this.t('prizeIon'), icon: '🚀', apply: () => { this.tower.triggerEMP(this.enemies, this.enemyProjectiles); } }
    ];

    let spinCount = 0;
    const spinInterval = setInterval(() => {
      const p = possiblePrizes[Math.floor(Math.random() * possiblePrizes.length)];
      reel.innerHTML = `<span style="font-size: 34px;">${p.icon}</span><br><b>${p.text}</b>`;
      if (window.soundEngine) window.soundEngine.playSlotSpin();
      this.triggerHaptic(10);
      spinCount++;

      if (spinCount >= 14) {
        clearInterval(spinInterval);
        this.rouletteResult = possiblePrizes[Math.floor(Math.random() * possiblePrizes.length)];
        reel.innerHTML = `<span style="font-size: 40px;">${this.rouletteResult.icon}</span><br><b style="color: var(--neon-gold); font-size: 16px;">${this.rouletteResult.text}</b>`;
        if (window.soundEngine) window.soundEngine.playJackpot();
        if (window.particleEngine) window.particleEngine.shake(14, 0.4);
        this.triggerHaptic([40, 60, 40]);
        claimBtn.style.display = 'inline-flex';
      }
    }, 90);
  }

  closeRoulette() {
    document.getElementById('rouletteModal').classList.add('hidden');
    this.state = this.STATE_PLAYING;
    if (this.rouletteResult && this.rouletteResult.apply) {
      this.rouletteResult.apply();
    }
  }

  triggerLevelUp() {
    if (this.state === this.STATE_LEVEL_UP || this.state === this.STATE_GAME_OVER) return;
    this.state = this.STATE_LEVEL_UP;
    this.level++;
    this.currentExp = Math.max(0, this.currentExp - this.expToNextLevel);
    this.expToNextLevel = Math.floor(this.expToNextLevel * 1.25 + 10);

    this.tower.stats.damageMult += 0.05;
    this.tower.hp = Math.min(this.tower.maxHp, this.tower.hp + this.tower.maxHp * 0.20);
    this.tower.shield = this.tower.maxShield;

    if (window.soundEngine) window.soundEngine.playLevelUp();
    if (window.particleEngine) {
      window.particleEngine.addDamageText(this.tower.x, this.tower.y - 45, `⚡ LVL ${this.level}: +5% DMG & REPAIR!`, '#00ffff', true);
      window.particleEngine.addShockwave(this.tower.x, this.tower.y, '#00ffff', 120, 0.35);
    }
    this.triggerHaptic([30, 40, 50]);

    this.drawnCards = window.upgradeDeck.drawCards(3, this.meta.luckLevel || 0);
    this.renderLevelUpCards();
    this.showModal('levelUpModal');
  }

  renderLevelUpCards() {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';

    this.drawnCards.forEach((card) => {
      const cardEl = document.createElement('div');
      cardEl.className = `upgrade-card upgrade-card-item rarity-${card.rarity}`;
      const nameText = this.t(card.nameKey) || card.name;
      const descText = this.t(card.descKey) || card.desc;
      cardEl.innerHTML = `
        <div class="card-icon">${card.icon}</div>
        <div>
          <div class="card-rarity-badge">${card.rarity.toUpperCase()}</div>
          <div class="card-title">${nameText}</div>
          <div class="card-desc">${descText}</div>
        </div>
      `;
      cardEl.addEventListener('click', () => {
        this.triggerHaptic(20);
        this.selectUpgradeCard(card);
      });
      container.appendChild(cardEl);
    });
  }

  selectUpgradeCard(card) {
    card.apply(this.tower);
    this.pickedCardIds.push(card.id);
    if (window.codexManager) {
      window.codexManager.discover(card.id);
    }
    this.checkAchievement('first_upgrade', 1);

    const newEvos = window.upgradeDeck.checkEvolutions(this.tower, this.pickedCardIds);
    if (newEvos.length > 0) {
      newEvos.forEach(evo => {
        if (window.codexManager) window.codexManager.discover(evo.id);
        this.triggerEvolutionBanner(evo);
      });
      this.checkAchievement('evo_master', 1);
    }

    this.hideModal('levelUpModal');
    this.state = this.STATE_PLAYING;

    if (this.currentExp >= this.expToNextLevel) {
      this.triggerLevelUp();
    }
  }

  triggerEvolutionBanner(evo) {
    const evoName = this.t(evo.nameKey) || evo.name;
    const evoDesc = this.t(evo.descKey) || evo.desc;
    if (window.soundEngine) {
      window.soundEngine.playEvolution();
      window.soundEngine.speak(this.t('evoAlert'), window.i18n ? window.i18n.currentLang : 'ru');
    }
    const banner = document.getElementById('evolutionBanner');
    if (banner) {
      banner.innerHTML = `
        <div class="evo-title">${this.t('evoAlert')}</div>
        <div class="evo-name">${evoName}</div>
        <div class="evo-desc">${evoDesc}</div>
      `;
      banner.classList.remove('hidden');
      setTimeout(() => banner.classList.add('hidden'), 3500);
    }
  }

  rerollUpgradeCards() {
    this.drawnCards = window.upgradeDeck.drawCards(3, (this.meta.luckLevel || 0) + 2);
    this.renderLevelUpCards();
  }

  gameOver() {
    return this.onGameOver();
  }

  onGameOver() {
    this.state = this.STATE_GAME_OVER;
    const hud = document.getElementById('hud');
    if (hud) hud.classList.add('hidden');

    if (window.particleEngine) {
      window.particleEngine.shakeIntensity = 0;
      window.particleEngine.shakeDuration = 0;
    }

    this.showModal('gameOverScreen');

    this.meta.highWave = Math.max(this.meta.highWave, this.waveManager.currentWave);
    this.meta.highScore = Math.max(this.meta.highScore, this.score);

    this.saveData(true);
    if (window.vkPlayBridge && typeof window.vkPlayBridge.submitScore === 'function') {
      window.vkPlayBridge.submitScore('cybertower_waves', this.meta.highWave);
    }

    const elWave = document.getElementById('finalWave');
    if (elWave) elWave.innerText = this.waveManager.currentWave;
    const elScore = document.getElementById('finalScore');
    if (elScore) elScore.innerText = this.score;
    const elChips = document.getElementById('earnedChips');
    if (elChips) elChips.innerText = `${this.runChipsEarned} 🪙`;

    const reviveBtn = document.getElementById('reviveAdBtn');
    if (reviveBtn) reviveBtn.style.display = this.hasRevivedThisRun ? 'none' : 'inline-flex';

    const doubleBtn = document.getElementById('doubleChipsAdBtn');
    if (doubleBtn) doubleBtn.style.display = (this.runChipsEarned > 0) ? 'inline-flex' : 'none';

    if (window.soundEngine) {
      window.soundEngine.stopMusic();
      window.soundEngine.playGameOver();
    }

    if (this.waveManager.currentWave >= 10) {
      this.checkAchievement('wave_10', 1);
    }

    this.triggerHaptic([100, 100, 200]);
  }

  reviveTower() {
    this.hasRevivedThisRun = true;
    const reviveHpRatio = (window.vkPlayBridge && window.vkPlayBridge.flags.revive_hp_percent) || 0.6;
    this.tower.hp = Math.floor(this.tower.maxHp * reviveHpRatio);
    this.tower.shield = this.tower.maxShield;
    this.state = this.STATE_PLAYING;
    this.hideAllModals();
    const hud = document.getElementById('hud');
    if (hud) {
      hud.classList.remove('hidden');
      hud.style.display = 'block';
    }
    this.tower.triggerEMP(this.enemies, this.enemyProjectiles);
    if (window.soundEngine && !window.soundEngine.muted) {
      window.soundEngine.startMusic();
    }
  }

  doubleChips() {
    this.meta.totalChips = (this.meta.totalChips || 0) + this.runChipsEarned;
    this.runChipsEarned *= 2;
    const elEarned = document.getElementById('earnedChips');
    if (elEarned) elEarned.innerText = `${this.runChipsEarned} 🪙`;
    const doubleBtn = document.getElementById('doubleChipsAdBtn');
    if (doubleBtn) doubleBtn.style.display = 'none';
    if (window.soundEngine) window.soundEngine.playPickup();
    if (window.particleEngine) {
      window.particleEngine.addDamageText(this.canvas.width / 2, 180, `+${this.runChipsEarned} 🪙 (2X)!`, '#ffee00', true);
    }
    this.saveData(true);
  }

  checkAchievement(id, amount = 1) {
    if (!this.meta.completedAchievements) this.meta.completedAchievements = [];
    if (this.meta.completedAchievements.includes(id)) return;

    const ach = window.ACHIEVEMENTS.find(a => a.id === id);
    if (ach) {
      this.meta.completedAchievements.push(id);
      this.meta.totalChips += ach.reward;
      this.saveData(true);

      const achName = this.t(ach.nameKey) || ach.name;
      if (window.particleEngine) {
        window.particleEngine.addDamageText(this.canvas.width / 2, 140, `🏆 ${achName} (+${ach.reward}🪙)`, '#ffee00', true);
      }
    }
  }

  renderAchievements() {
    const list = document.getElementById('achievementsList');
    if (!list) return;
    list.innerHTML = '';

    window.ACHIEVEMENTS.forEach(ach => {
      const isDone = (this.meta.completedAchievements || []).includes(ach.id);
      const row = document.createElement('div');
      row.className = `workshop-row ${isDone ? 'done' : ''}`;
      const achName = this.t(ach.nameKey) || ach.name;
      row.innerHTML = `
        <div class="workshop-info">
          <span class="workshop-icon">${isDone ? '✅' : '🔒'}</span>
          <div>
            <div class="workshop-title">${achName}</div>
            <div class="workshop-level">${ach.desc}</div>
          </div>
        </div>
        <div style="font-weight: bold; color: ${isDone ? '#39ff14' : 'var(--neon-gold)'};">
          +${ach.reward} 🪙
        </div>
      `;
      list.appendChild(row);
    });
  }

  renderImplants() {
    const container = document.getElementById('implantsList');
    if (!container) return;
    container.innerHTML = '';

    window.CYBER_IMPLANTS.forEach(imp => {
      const isUnlocked = (this.meta.unlockedImplants || []).includes(imp.id);
      const isEquipped = this.equippedImplants.includes(imp.id);
      const impName = this.t(imp.nameKey) || imp.name;
      const impDesc = this.t(imp.descKey) || imp.desc;

      const row = document.createElement('div');
      row.className = `workshop-row ${isEquipped ? 'done' : ''}`;
      row.innerHTML = `
        <div class="workshop-info">
          <span class="workshop-icon">${imp.icon}</span>
          <div>
            <div class="workshop-title">${impName}</div>
            <div class="workshop-level">${impDesc}</div>
          </div>
        </div>
        <button class="btn btn-buy ${!isUnlocked && this.meta.totalChips < imp.cost ? 'disabled' : ''}">
          ${!isUnlocked ? `${imp.cost} 🪙` : (isEquipped ? this.t('equipped') : this.t('equip'))}
        </button>
      `;

      const btn = row.querySelector('.btn-buy');
      btn.addEventListener('click', () => {
        this.triggerHaptic(15);
        if (!isUnlocked) {
          if (this.meta.totalChips >= imp.cost) {
            this.meta.totalChips -= imp.cost;
            if (!this.meta.unlockedImplants) this.meta.unlockedImplants = [];
            this.meta.unlockedImplants.push(imp.id);
            this.equippedImplants.push(imp.id);
            window.vkPlayBridge.savePlayerData(this.meta);
            this.renderImplants();
            document.getElementById('workshopChips').innerText = this.meta.totalChips;
          }
        } else {
          if (isEquipped) {
            this.equippedImplants = this.equippedImplants.filter(id => id !== imp.id);
          } else {
            this.equippedImplants.push(imp.id);
          }
          this.renderImplants();
        }
      });

      container.appendChild(row);
    });
  }

  renderWorkshopCards() {
    const container = document.getElementById('workshopList');
    if (!container) return;
    container.innerHTML = '';

    const upgrades = [
      { key: 'hpLevel', nameKey: 'upgHpName', icon: '🛡️', baseCost: 10 },
      { key: 'dmgLevel', nameKey: 'upgDmgName', icon: '💥', baseCost: 15 },
      { key: 'regenLevel', nameKey: 'upgRegenName', icon: '❤️‍🩹', baseCost: 20 },
      { key: 'rangeLevel', nameKey: 'upgRangeName', icon: '📡', baseCost: 10 },
      { key: 'luckLevel', nameKey: 'upgLuckName', icon: '🍀', baseCost: 25 }
    ];

    document.getElementById('workshopChips').innerText = this.meta.totalChips;

    upgrades.forEach(u => {
      const lvl = this.meta[u.key] || 0;
      const cost = Math.floor(u.baseCost * Math.pow(1.25, lvl));
      const upgName = this.t(u.nameKey) || u.key;

      const row = document.createElement('div');
      row.className = 'workshop-row';
      row.innerHTML = `
        <div class="workshop-info">
          <span class="workshop-icon">${u.icon}</span>
          <div>
            <div class="workshop-title">${upgName}</div>
            <div class="workshop-level">${this.t('level')}: <b>${lvl}</b></div>
          </div>
        </div>
        <button class="btn btn-buy ${this.meta.totalChips < cost ? 'disabled' : ''}">
          ${cost} 🪙
        </button>
      `;

      const buyBtn = row.querySelector('.btn-buy');
      buyBtn.addEventListener('click', () => {
        this.triggerHaptic(15);
        if (this.meta.totalChips >= cost) {
          this.meta.totalChips -= cost;
          this.meta[u.key] = (this.meta[u.key] || 0) + 1;
          window.vkPlayBridge.savePlayerData(this.meta);
          this.renderWorkshopCards();
        }
      });

      container.appendChild(row);
    });
  }

  spawnScrap(x, y, value, exp) {
    if (this.scraps.length >= 100) {
      this.collectSingleScrap(this.scraps[0]);
    }
    this.scraps.push({
      x,
      y,
      value,
      exp,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: 4.5,
      color: '#00ffff'
    });
  }

  collectSingleScrap(s) {
    const flags = (window.vkPlayBridge && window.vkPlayBridge.flags) || {};
    const remoteChipsMult = flags.chips_multiplier || 1.0;
    const expMult = flags.event_exp_mult || 1.0;
    const towerChipMult = this.tower.stats.chipBonusMult || 1.0;

    const totalChipMult = remoteChipsMult * towerChipMult * this.comboMult;
    const earnedChips = Math.max(1, Math.round(s.value * totalChipMult));
    const earnedExp = Math.round(s.exp * expMult);

    this.runChipsEarned += earnedChips;
    this.meta.totalChips += earnedChips;
    this.score += earnedExp * 12;
    this.currentExp += earnedExp;

    if (window.soundEngine) window.soundEngine.playPickup();
    if (window.particleEngine) {
      window.particleEngine.addSparks(s.x, s.y, '#00ffff', 4, 0.8);
    }

    const idx = this.scraps.indexOf(s);
    if (idx >= 0) this.scraps.splice(idx, 1);

    if (this.currentExp >= this.expToNextLevel && this.state === this.STATE_PLAYING) {
      this.triggerLevelUp();
    }
  }

  collectCrate(c) {
    if (window.particleEngine) {
      window.particleEngine.addSparks(c.x, c.y, c.color || '#ffee00', 16, 1.3);
    }
    if (window.soundEngine) window.soundEngine.playPickup();

    if (c.isBossCrate) {
      // Epic Boss Crate -> Opens Roulette Wheel modal
      if (window.particleEngine) {
        window.particleEngine.addDamageText(c.x, c.y - 12, '👑 БОСС-КЕЙС!', '#ff00ff', true);
      }
      this.openRoulette();
    } else {
      // Regular Elite Crate -> Instant juicy tactical power-up WITHOUT freezing the battle!
      const rewards = ['chips', 'shield', 'emp', 'vacuum'];
      const pick = rewards[Math.floor(Math.random() * rewards.length)];

      if (pick === 'chips') {
        const bonus = 35 + this.waveManager.currentWave * 5;
        this.runChipsEarned += bonus;
        this.meta.totalChips = (this.meta.totalChips || 0) + bonus;
        this.score += bonus * 10;
        this.updateUI();
        this.saveData();
        if (window.particleEngine) {
          window.particleEngine.addDamageText(c.x, c.y - 12, `+${bonus} 💎`, '#ffee00', true);
        }
      } else if (pick === 'shield') {
        this.tower.shield = Math.min(this.tower.maxShield, this.tower.shield + this.tower.maxShield * 0.45);
        if (window.particleEngine) {
          window.particleEngine.addDamageText(c.x, c.y - 12, '+45% 🛡️ ЩИТ', '#00ffff', true);
        }
      } else if (pick === 'emp') {
        this.tower.triggerEMP(this.enemies, this.enemyProjectiles);
        if (window.particleEngine) {
          window.particleEngine.addDamageText(c.x, c.y - 12, '⚡ ЭМИ-ВСПЫШКА!', '#00e1ff', true);
        }
      } else {
        // Super Vacuum: pull all scraps directly into tower
        for (const s of this.scraps) {
          s.x = this.tower.x;
          s.y = this.tower.y;
        }
        if (window.particleEngine) {
          window.particleEngine.addDamageText(c.x, c.y - 12, '🧲 ВАКУУМ!', '#39ff14', true);
        }
      }
    }
  }

  updateScraps(dt) {
    const magnetDist = this.tower.stats.magnetRange;

    for (let i = this.waveManager.crates.length - 1; i >= 0; i--) {
      const c = this.waveManager.crates[i];
      const d = Math.hypot(this.tower.x - c.x, this.tower.y - c.y);

      // Magnet pulls crates toward the tower
      if (d <= magnetDist + 120) {
        const angle = Math.atan2(this.tower.y - c.y, this.tower.x - c.x);
        const pullSpeed = 9.5 * (1 - d / (magnetDist + 120)) + 3.5;
        c.x += Math.cos(angle) * pullSpeed * dt * 60;
        c.y += Math.sin(angle) * pullSpeed * dt * 60;
      }

      if (d <= this.tower.radius + c.radius + 15) {
        this.waveManager.crates.splice(i, 1);
        this.collectCrate(c);
        break;
      }
    }

    for (let i = this.scraps.length - 1; i >= 0; i--) {
      const s = this.scraps[i];
      s.x += s.vx * dt * 60;
      s.y += s.vy * dt * 60;
      s.vx *= 0.92;
      s.vy *= 0.92;

      const d = Math.hypot(this.tower.x - s.x, this.tower.y - s.y);
      if (d <= magnetDist) {
        const angle = Math.atan2(this.tower.y - s.y, this.tower.x - s.x);
        const pullSpeed = 10.5 * (1 - d / magnetDist) + 4.5;
        s.x += Math.cos(angle) * pullSpeed * dt * 60;
        s.y += Math.sin(angle) * pullSpeed * dt * 60;
      }

      if (d <= this.tower.radius + s.radius + 8) {
        this.collectSingleScrap(s);
      }
    }
  }

  update(dt) {
    if (this.state !== this.STATE_PLAYING) return;

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.comboMult = 1.0;
      }
    }

    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= dt;
      if (this.slowMoTimer <= 0) this.timeScale = 1.0;
    }

    const effectiveDt = dt * this.timeScale;

    const waveFinished = this.waveManager.update(dt, this.canvas.width, this.canvas.height, this.enemies, this.tower);
    if (waveFinished) {
      const waveBonus = Math.min(50, this.waveManager.currentWave * 10);
      this.runChipsEarned += waveBonus;
      this.meta.totalChips += waveBonus;
      this.score += 1500;
      this.saveData();
      if (window.missionManager) {
        window.missionManager.trackProgress('daily_waves', 1);
      }

      if (window.particleEngine) {
        window.particleEngine.addDamageText(this.tower.x, this.tower.y - 40, `${this.t('waveDone')} +${waveBonus}🪙`, '#ffee00', true);
      }
    }

    if (this.pet) {
      this.pet.update(effectiveDt, this.enemies, this.scraps, this.enemyProjectiles, (scrap) => {
        this.collectSingleScrap(scrap);
      });
    }

    this.tower.update(effectiveDt, this.enemies, this.enemyProjectiles, (mined) => {
      this.runChipsEarned += mined;
      this.meta.totalChips += mined;
      this.saveData();
    });

    if (this.tower.hp <= 0) {
      this.onGameOver();
      return;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const died = e.update(effectiveDt, this.tower, this.enemyProjectiles, this.enemies);
      if (died || e.hp <= 0) {
        this.onEnemyKilled(e);
        this.enemies.splice(i, 1);
      }
    }

    if (this.enemyProjectiles.length > 30) {
      this.enemyProjectiles.splice(0, this.enemyProjectiles.length - 30);
    }

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx * effectiveDt * 60;
      ep.y += ep.vy * effectiveDt * 60;

      if (Math.hypot(this.tower.x - ep.x, this.tower.y - ep.y) <= this.tower.radius + ep.radius) {
        this.tower.takeDamage(ep.damage);
        this.enemyProjectiles.splice(i, 1);
      } else if (ep.x < -30 || ep.x > this.canvas.width + 30 || ep.y < -30 || ep.y > this.canvas.height + 30) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    this.updateScraps(effectiveDt);
    window.particleEngine.update(effectiveDt);
    this.updateHUD();
  }

  onEnemyKilled(e) {
    if (!e || e._killedHandled) return;
    e._killedHandled = true;

    this.comboCount++;
    this.comboTimer = 2.0;
    this.comboMult = Math.min(2.5, 1.0 + this.comboCount * 0.08);

    if (window.particleEngine) {
      window.particleEngine.addExplosion(e.x, e.y, e.color, e.isBoss);
      window.particleEngine.addHullDebris(e.x, e.y, e.color || '#00ffff', e.isBoss ? 8 : (e.isElite ? 5 : 3));
    }

    this.checkKillstreakAnnouncer(this.comboCount, e.x, e.y);

    if (window.missionManager) {
      window.missionManager.trackProgress('daily_kills', 1);
    }

    this.spawnScrap(e.x, e.y, e.scrapValue, e.expValue);

    if (e.isBoss) {
      this.waveManager.spawnCrate(e.x, e.y, true);
    } else if (e.isElite && Math.random() < 0.15) {
      this.waveManager.spawnCrate(e.x, e.y, false);
    }

    if (e.isBoss) {
      this.timeScale = 0.25;
      this.slowMoTimer = 1.2;
      this.checkAchievement('boss_slayer', 1);
      if (window.particleEngine) {
        window.particleEngine.shake(25, 0.6);
        window.particleEngine.addDamageText(e.x, e.y, this.t('bossKilled'), '#ffee00', true);
      }
    }

    this.checkAchievement('first_blood', 1);
  }

  checkKillstreakAnnouncer(count, x, y) {
    let bannerText = null;
    let bannerColor = '#00ffff';

    if (count === 10) {
      bannerText = this.t('killstreak10') || '⚡ 10x UNSTOPPABLE!';
      bannerColor = '#00ffff';
    } else if (count === 25) {
      bannerText = this.t('killstreak25') || '💥 25x NEON CARNAGE!';
      bannerColor = '#ff0055';
    } else if (count === 50) {
      bannerText = this.t('killstreak50') || '🔥 50x CYBER GOD!';
      bannerColor = '#ffee00';
    } else if (count === 100) {
      bannerText = this.t('killstreak100') || '🌌 100x OMEGA OVERLORD!';
      bannerColor = '#ff00ff';
    }

    if (bannerText) {
      if (window.particleEngine) {
        window.particleEngine.addDamageText(x, y - 25, bannerText, bannerColor, true);
        window.particleEngine.shake(12, 0.25);
      }
      if (window.soundEngine) {
        window.soundEngine.playLevelUp();
      }
    }
  }

  render() {
    const zoom = this.getCameraZoom();

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (window.particleEngine && window.particleEngine.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * window.particleEngine.shakeIntensity;
      const sy = (Math.random() - 0.5) * window.particleEngine.shakeIntensity;
      this.ctx.translate(sx, sy);
    }

    // 1. Draw Full Uncut Screen Cosmos Background (Edge-to-Edge)
    window.particleEngine.drawSynthwaveBackground(this.ctx, this.canvas.width, this.canvas.height, this.selectedBiome);

    // 2. Apply Panoramic Entity Camera Zoom (Centered on Tower)
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.scale(zoom, zoom);
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

    if (this.state === this.STATE_PLAYING || this.state === this.STATE_PAUSED || this.state === this.STATE_LEVEL_UP || this.state === this.STATE_ROULETTE || this.state === this.STATE_GAME_OVER) {
      // 🌌 Cyber Radar Perimeter Boundary Ring (400px radius on mobile, 450px on PC)
      const isPortrait = this.canvas.height > this.canvas.width;
      const radarRadius = isPortrait ? 400 : 450;
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.18)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([8, 8]);
      this.ctx.beginPath();
      this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, radarRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();

      this.waveManager.drawMeteors(this.ctx);
      this.waveManager.drawCrates(this.ctx);

      for (const s of this.scraps) {
        this.ctx.save();
        this.ctx.fillStyle = s.color;
        this.ctx.shadowColor = s.color;
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      for (const e of this.enemies) {
        e.draw(this.ctx);
      }

      for (const ep of this.enemyProjectiles) {
        this.ctx.save();
        this.ctx.fillStyle = ep.color;
        this.ctx.shadowColor = ep.color;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      this.tower.draw(this.ctx);
      if (this.pet) this.pet.draw(this.ctx);

      window.particleEngine.draw(this.ctx);
    }

    this.ctx.restore(); // Restore entity camera zoom

    // 3. Screen-Space Overlays & Threat Indicators
    if (this.state === this.STATE_PLAYING || this.state === this.STATE_PAUSED || this.state === this.STATE_LEVEL_UP || this.state === this.STATE_ROULETTE) {
      this.drawThreatIndicators();
      this.drawBossOverlay();
    }

    this.ctx.restore();
  }

  // 360-Degree Glowing Neon Radar Threat Chevrons for Mobile & Desktop
  drawThreatIndicators() {
    const margin = 26;
    for (const e of this.enemies) {
      const isOffscreen = e.x < -10 || e.x > this.canvas.width + 10 || e.y < -10 || e.y > this.canvas.height + 10;
      if (isOffscreen) {
        const clampedX = Math.max(margin, Math.min(this.canvas.width - margin, e.x));
        const clampedY = Math.max(margin, Math.min(this.canvas.height - margin, e.y));
        const angle = Math.atan2(e.y - clampedY, e.x - clampedX);

        this.ctx.save();
        this.ctx.translate(clampedX, clampedY);
        this.ctx.rotate(angle);

        let threatColor = '#00ffff';
        let arrowSize = 9;
        if (e.isBoss) {
          threatColor = '#ff0055';
          arrowSize = 16;
        } else if (e.type === 'kamikaze') {
          threatColor = '#ff0033';
          arrowSize = 13;
        } else if (e.type === 'shooter') {
          threatColor = '#9d00ff';
          arrowSize = 11;
        } else if (e.type === 'tank') {
          threatColor = '#ffaa00';
          arrowSize = 12;
        }

        this.ctx.fillStyle = threatColor;
        this.ctx.shadowColor = threatColor;
        this.ctx.shadowBlur = 14;

        this.ctx.beginPath();
        this.ctx.moveTo(arrowSize, 0);
        this.ctx.lineTo(-arrowSize * 0.7, -arrowSize * 0.7);
        this.ctx.lineTo(-arrowSize * 0.3, 0);
        this.ctx.lineTo(-arrowSize * 0.7, arrowSize * 0.7);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
      }
    }
  }

  drawBossOverlay() {
    const boss = this.enemies.find(e => e.isBoss);
    if (!boss) return;

    this.ctx.save();
    const barW = Math.min(420, this.canvas.width - 32);
    const barH = 12;
    const x = (this.canvas.width - barW) / 2;
    const y = 52;

    this.ctx.font = '900 12px "Courier New", monospace';
    this.ctx.fillStyle = '#ff0055';
    this.ctx.shadowColor = '#ff0055';
    this.ctx.shadowBlur = 10;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`⚠️ ${boss.bossName} ⚠️`, this.canvas.width / 2, y - 6);

    this.ctx.fillStyle = 'rgba(10, 10, 25, 0.8)';
    this.ctx.fillRect(x, y, barW, barH);
    this.ctx.strokeStyle = '#ff0055';
    this.ctx.strokeRect(x, y, barW, barH);

    const fillPercent = Math.max(0, boss.hp / boss.maxHp);
    this.ctx.fillStyle = '#ff0055';
    this.ctx.fillRect(x + 2, y + 2, (barW - 4) * fillPercent, barH - 4);

    this.ctx.restore();
  }

  updateHUD() {
    if (!this.tower) return;

    const hpPercent = Math.max(0, (this.tower.hp / this.tower.maxHp) * 100);
    document.getElementById('hpFill').style.width = `${hpPercent}%`;
    document.getElementById('hpText').innerText = `${Math.ceil(this.tower.hp)}/${this.tower.maxHp}`;

    const expPercent = Math.min(100, (this.currentExp / this.expToNextLevel) * 100);
    document.getElementById('expFill').style.width = `${expPercent}%`;
    const expText = document.getElementById('expText');
    if (expText) {
      expText.innerText = `${this.currentExp}/${this.expToNextLevel}`;
    }

    document.getElementById('waveCount').innerText = this.waveManager.currentWave;
    document.getElementById('levelCount').innerText = this.level;
    document.getElementById('scoreCount').innerText = this.score;

    const comboText = this.comboMult > 1.0 ? ` (+${Math.round((this.comboMult - 1) * 100)}%🔥)` : '';
    document.getElementById('chipCount').innerText = `${this.runChipsEarned}${comboText}`;

    const overBtn = document.getElementById('overdriveBtn');
    if (overBtn) {
      if (this.tower.empCooldown <= 0) {
        overBtn.classList.remove('cooling-down');
        overBtn.innerText = this.t('overdriveReady');
      } else {
        overBtn.classList.add('cooling-down');
        overBtn.innerText = `${this.t('overdriveCooldown')} (${this.tower.empCooldown.toFixed(1)}s)`;
      }
    }
  }

  updateUI() {
    if (!this.meta) this.meta = {};
    const highWaveEl = document.getElementById('menuHighWave');
    if (highWaveEl) highWaveEl.innerText = this.meta.highWave || 1;
    const highScoreEl = document.getElementById('menuHighScore');
    if (highScoreEl) highScoreEl.innerText = this.meta.highScore || 0;
    const chipsEl = document.getElementById('menuChips');
    if (chipsEl) chipsEl.innerText = `${this.meta.totalChips || 0} 🪙`;

    const giftBtn = document.getElementById('dailyGiftBtn');
    if (giftBtn) {
      const today = new Date().toDateString();
      if (this.meta.lastDailyGiftDate === today) {
        giftBtn.innerText = this.t('giftClaimed') || '✅ ПОДАРОК ПОЛУЧЕН!';
        giftBtn.classList.add('disabled');
      } else {
        giftBtn.innerText = this.t('dailyGift') || '🎁 ЕЖЕДНЕВНЫЙ БОНУС (+75 🪙)';
        giftBtn.classList.remove('disabled');
      }
    }

    const rankInfo = this.getCommanderRank();
    const rankEl = document.getElementById('menuCommanderRank');
    if (rankEl && rankInfo) {
      const rankTitle = this.t(rankInfo.titleKey) || rankInfo.title;
      rankEl.innerHTML = `${rankInfo.icon} <b>${rankTitle}</b> (+${Math.round(rankInfo.bonusDmg * 100)}% ${this.t('bonusDmgAll')})`;
    }

    const cls = window.TOWER_CLASSES ? window.TOWER_CLASSES.find(c => c.id === this.selectedClass) : null;
    const pet = window.CYBER_PETS ? window.CYBER_PETS.find(p => p.id === this.selectedPet) : null;
    const bio = window.CYBER_BIOMES ? window.CYBER_BIOMES.find(b => b.id === this.selectedBiome) : null;
    const skin = window.TOWER_SKINS ? window.TOWER_SKINS.find(s => s.id === this.selectedSkin) : null;

    const clsName = cls ? (this.t(cls.nameKey) || cls.name) : this.selectedClass;
    const petName = pet ? (this.t(pet.nameKey) || pet.name) : this.selectedPet;
    const bioName = bio ? (this.t(bio.nameKey) || bio.name) : this.selectedBiome;
    const skinName = skin ? (this.t(skin.nameKey) || skin.name) : this.selectedSkin;

    const loadoutPreview = document.getElementById('loadoutPreviewText');
    if (loadoutPreview) {
      loadoutPreview.innerText = `${clsName} | ${petName} | ${bioName} | ${skinName}`;
    }

    const flags = (window.vkPlayBridge && window.vkPlayBridge.flags) || {};
    const eventBanner = document.getElementById('eventBanner');
    if (eventBanner && flags.event_title) {
      eventBanner.innerText = flags.event_title;
      eventBanner.classList.remove('hidden');
    }
  }

  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const dt = Math.min(0.08, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    if (this.state === this.STATE_PLAYING) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

function bootGame() {
  if (!window.game) {
    try {
      window.game = new CyberTowerGame();
      console.log('[Game] CyberTowerGame booted successfully.');
    } catch (err) {
      console.error('[Game] Fatal boot error:', err);
    }
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGame);
} else {
  bootGame();
}
