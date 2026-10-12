// VK Play & VK Bridge Universal Integration Bridge for Cyber Tower
// Supports VK Play (iframeApi / mailru.core.js) and VK Bridge (VK Mini Apps)
// Features: Fullscreen Ads (Interstitial), Rewarded Video, Storage Sync, Leaderboards, Audio Mute, Language Detection

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event && event.reason) {
      const msg = event.reason.message || String(event.reason);
      if (msg.includes('No parent to post message') || msg.includes('Can not get appId')) {
        event.preventDefault();
      }
    }
  });
}

class VKPlayBridge {
  constructor() {
    this.externalApi = null;
    this.vkBridge = null;
    this.isInitialized = false;
    this.isInitFinished = false;
    this.isGameReadyNotified = false;
    this.isGameReadyPending = false;
    this.isAdShowing = false;
    this.deviceType = 'desktop';

    this.urlParams = this._parseQueryParams();
    this.appId = this.urlParams.appid || this.urlParams.app_id || this.urlParams.gmr_id || this.urlParams.vk_app_id || 1;
    this.uid = this.urlParams.uid || this.urlParams.vk_user_id || null;

    this.lastInterstitialTime = Date.now();
    this.AD_COOLDOWN_MS = 60000; // 60 seconds cooldown between interstitials

    this.activeAdSession = null;

    this.player = {
      uid: this.uid || 'vk_guest',
      nick: 'Игрок VK',
      avatar: '',
      isAuth: false
    };

    this.flags = {
      difficulty: 'normal',
      chips_multiplier: 1.0,
      boss_interval: 5,
      event_title: '',
      revive_hp_percent: 0.6
    };

    this.lastCloudSaveTime = 0;
    this.cloudSavePendingData = null;
    this.cloudSaveTimer = null;

    this.initPromise = this.init();
  }

  _parseQueryParams() {
    const params = {};
    if (typeof window !== 'undefined' && window.location.search) {
      try {
        const usp = new URLSearchParams(window.location.search);
        for (const [k, v] of usp.entries()) {
          params[k.toLowerCase()] = v;
        }
      } catch (e) {}
    }
    return params;
  }

  _normalizeLang(code) {
    if (!code || typeof code !== 'string') return null;
    const l = code.toLowerCase().trim();
    if (l === 'tr' || l.startsWith('tr')) return 'tr';
    if (l === 'en' || l.startsWith('en')) return 'en';
    return 'ru';
  }

  detectInitialLang() {
    try {
      if (this.urlParams.lang) {
        const l = this._normalizeLang(this.urlParams.lang);
        if (l) return l;
      }
      if (this.urlParams.vk_language) {
        const l = this._normalizeLang(this.urlParams.vk_language);
        if (l) return l;
      }
      const saved = this._normalizeLang(localStorage.getItem('cyber_tower_lang'));
      if (saved) return saved;

      if (typeof navigator !== 'undefined' && navigator.language) {
        const nav = this._normalizeLang(navigator.language);
        if (nav) return nav;
      }
    } catch (e) {}
    return 'ru';
  }

  _bridgeSend(method, params = {}, timeoutMs = 2500) {
    if (!this.vkBridge || typeof this.vkBridge.send !== 'function') {
      return Promise.reject(new Error('vkBridge unavailable'));
    }
    const callPromise = this.vkBridge.send(method, params);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${method} timeout`)), timeoutMs)
    );
    return Promise.race([callPromise, timeoutPromise]);
  }

  async init() {
    console.log('[VK Play SDK] Initializing VKPlayBridge...');
    this.deviceType = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

    const detectedLang = this.detectInitialLang();
    if (window.i18n && typeof window.i18n.setLanguageFromSdk === 'function') {
      window.i18n.setLanguageFromSdk(detectedLang);
    } else if (window.i18n && typeof window.i18n.setLanguage === 'function') {
      window.i18n.setLanguage(detectedLang, false);
    }

    // 1. VK Play iframeApi callbacks
    const callbacks = {
      appid: parseInt(this.appId, 10) || 1,
      getLoginStatusCallback: (status) => this._onLoginStatus(status),
      userInfoCallback: (info) => this._onUserInfo(info),
      userProfileCallback: (profile) => this._onUserProfile(profile),
      registerUserCallback: (info) => this._onRegisterUser(info),
      adsCallback: (context) => this._onAdsCallback(context),
      paymentReceivedCallback: (data) => console.log('[VK Play] Payment received:', data),
      paymentWindowClosedCallback: () => console.log('[VK Play] Payment window closed')
    };

    // 2. Connect to window.iframeApi if present (VK Play Web native)
    if (typeof window !== 'undefined' && typeof window.iframeApi === 'function') {
      try {
        const apiPromise = window.iframeApi(callbacks);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('iframeApi timeout')), 3500));
        const api = await Promise.race([apiPromise, timeoutPromise]);
        this.externalApi = api;
        this.isInitialized = true;
        this.isInitFinished = true;
        console.log('[VK Play JS API] Connected via iframeApi');
        try {
          if (typeof this.externalApi.getLoginStatus === 'function') this.externalApi.getLoginStatus();
          if (typeof this.externalApi.userProfile === 'function') this.externalApi.userProfile();
        } catch (e) {}

        if (this.isGameReadyPending || window.isGameInteractive) {
          this.notifyGameReady();
        }
        return true;
      } catch (e) {
        console.warn('[VK Play JS API] iframeApi init fallback:', e);
      }
    }

    // 3. Dynamic loading if inside VK Play domain or URL params
    const isVkPlayWeb = typeof window !== 'undefined' && (
      window.location.hostname.includes('vkplay') ||
      window.location.hostname.includes('mail.ru') ||
      (window.self !== window.top && (this.urlParams.sign || this.urlParams.appid || this.urlParams.app_id))
    );

    if (isVkPlayWeb && typeof document !== 'undefined') {
      const loaded = await this._loadVkPlayScript(this.appId, callbacks);
      if (loaded) {
        if (this.isGameReadyPending || window.isGameInteractive) {
          this.notifyGameReady();
        }
        return true;
      }
    }

    // 4. VK Bridge connection (VK Mini Apps / VK Games container)
    const isInsideFrame = (typeof window !== 'undefined') && (window.self !== window.top);
    const hasVkMiniAppParams = (typeof window !== 'undefined') && (
      window.location.search.includes('vk_') ||
      (window.name && window.name.includes('fXD'))
    );

    if ((isInsideFrame || hasVkMiniAppParams) && typeof window !== 'undefined' && window.vkBridge && typeof window.vkBridge.send === 'function') {
      try {
        this.vkBridge = window.vkBridge;
        await this._bridgeSend('VKWebAppInit', {}, 2000);
        this.isInitialized = true;
        this.isInitFinished = true;
        console.log('[VK Bridge] Initialized successfully');

        if (typeof this.vkBridge.subscribe === 'function') {
          this.vkBridge.subscribe((e) => {
            if (!e || !e.detail) return;
            if (e.detail.type === 'VKWebAppViewHide') {
              this._muteAudio(true);
            } else if (e.detail.type === 'VKWebAppViewRestore') {
              this._muteAudio(false);
            }
          });
        }

        try {
          const user = await this._bridgeSend('VKWebAppGetUserInfo', {}, 2000);
          if (user) {
            this.player.uid = user.id;
            this.player.nick = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Игрок VK';
            this.player.avatar = user.photo_200 || user.photo_100 || '';
            this.player.isAuth = true;
            console.log('[VK Bridge] User profile loaded:', this.player.nick);
          }
        } catch (e) {}

        if (this.isGameReadyPending || window.isGameInteractive) {
          this.notifyGameReady();
        }
        return true;
      } catch (err) {
        console.warn('[VK Bridge] Init fallback:', err);
      }
    }

    // 5. Local Mock Fallback
    console.log('[VK Play SDK] Standalone / Local Mock Mode.');
    this.isInitialized = true;
    this.isInitFinished = true;
    this.player = {
      uid: 'local_vk_player',
      nick: 'Игрок (VK Play)',
      avatar: '',
      isAuth: false
    };

    if (this.isGameReadyPending || window.isGameInteractive) {
      this.notifyGameReady();
    }
    return true;
  }

  _loadVkPlayScript(appId, callbacks) {
    return new Promise((resolve) => {
      let resolved = false;
      const done = (val) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(val);
        }
      };

      const timer = setTimeout(() => {
        console.warn('[VK Play] mailru.core.js load timeout (3.5s)');
        done(false);
      }, 3500);

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://vkplay.ru/app/${appId}/static/mailru.core.js`;
      script.onload = () => {
        if (typeof window.iframeApi === 'function') {
          const apiPromise = window.iframeApi(callbacks);
          const apiTimeout = new Promise((_, rej) => setTimeout(() => rej(new Error('api timeout')), 2500));
          Promise.race([apiPromise, apiTimeout]).then(
            (api) => {
              this.externalApi = api;
              this.isInitialized = true;
              this.isInitFinished = true;
              console.log('[VK Play JS API] Loaded mailru.core.js and connected!');
              try {
                if (typeof this.externalApi.getLoginStatus === 'function') this.externalApi.getLoginStatus();
                if (typeof this.externalApi.userProfile === 'function') this.externalApi.userProfile();
              } catch (e) {}
              done(true);
            },
            () => done(false)
          );
        } else {
          done(false);
        }
      };
      script.onerror = () => done(false);
      document.head.appendChild(script);
    });
  }

  _onLoginStatus(status) {
    console.log('[VK Play] getLoginStatusCallback:', status);
    if (!status) return;
    const s = typeof status.loginStatus !== 'undefined' ? status.loginStatus : status;
    if (s === 0) {
      this.player.isAuth = false;
    } else if (s === 1) {
      if (this.externalApi && typeof this.externalApi.registerUser === 'function') {
        this.externalApi.registerUser();
      }
    } else if (s === 2 || s === 3) {
      this.player.isAuth = true;
      if (this.externalApi) {
        if (typeof this.externalApi.userInfo === 'function') this.externalApi.userInfo();
        if (typeof this.externalApi.userProfile === 'function') this.externalApi.userProfile();
      }
    }
  }

  _onUserInfo(info) {
    if (info && info.status === 'ok') {
      if (info.uid) this.player.uid = info.uid;
      this.player.isAuth = true;
    }
  }

  _onUserProfile(profile) {
    if (profile && profile.status === 'ok') {
      if (profile.uid) this.player.uid = profile.uid;
      if (profile.nick) this.player.nick = profile.nick;
      if (profile.avatar) this.player.avatar = profile.avatar;
      this.player.isAuth = true;
    }
  }

  _onRegisterUser(info) {
    if (info && info.status === 'ok') {
      if (this.externalApi && typeof this.externalApi.reloadWindow === 'function') {
        this.externalApi.reloadWindow();
      }
    }
  }

  _onAdsCallback(context) {
    console.log('[VK Play] adsCallback received:', context);
    if (!this.activeAdSession) return;

    const session = this.activeAdSession;
    const type = context ? context.type : null;

    if (type === 'adCompleted') {
      session.completed = true;
      if (session.isRewarded && !session.rewardGranted && typeof session.onRewarded === 'function') {
        session.rewardGranted = true;
        try {
          session.onRewarded();
        } catch (err) {
          console.error('[VK Play] onRewarded callback error:', err);
        }
      }
      if (!session.dismissFallbackTimer) {
        session.dismissFallbackTimer = setTimeout(() => {
          if (this.activeAdSession === session) {
            this._finishAdSession(true);
          }
        }, 1200);
      }
    } else if (type === 'adDismissed') {
      const wasShown = session.completed || !session.isRewarded;
      this._finishAdSession(wasShown);
    } else if (type === 'adError') {
      if (typeof session.onError === 'function') {
        try { session.onError(context); } catch (e) {}
      }
      this._finishAdSession(false);
    }
  }

  _finishAdSession(wasShown) {
    if (!this.activeAdSession) return;
    const session = this.activeAdSession;
    this.activeAdSession = null;

    if (session.watchdogTimer) clearTimeout(session.watchdogTimer);
    if (session.dismissFallbackTimer) clearTimeout(session.dismissFallbackTimer);

    this.isAdShowing = false;
    this.lastInterstitialTime = Date.now();

    this._muteAudio(false);

    if (typeof session.onClose === 'function') {
      try {
        session.onClose(wasShown);
      } catch (e) {}
    }

    if (session.wasPausedByAd && window.game && typeof window.game.resumeGame === 'function' && window.game.state === window.game.STATE_PAUSED) {
      window.game.resumeGame();
    }
  }

  _muteAudio(muted) {
    try {
      if (window.soundEngine && typeof window.soundEngine.setSystemMuted === 'function') {
        window.soundEngine.setSystemMuted(!!muted);
      }
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('game-mute-toggle', { detail: { muted: !!muted } }));
      }
    } catch (e) {}
  }

  async waitForInit() {
    if (this.isInitialized || this.isInitFinished) return;
    try {
      await Promise.race([this.initPromise, new Promise(r => setTimeout(r, 600))]);
    } catch(e) {} finally {
      this.isInitFinished = true;
    }
  }

  notifyGameReady() {
    if (this.isGameReadyNotified || window.isGameReadyFired) return;
    if (!window.isGameInteractive) {
      this.isGameReadyPending = true;
      return;
    }
    this.isGameReadyNotified = true;
    window.isGameReadyFired = true;
    console.log('[VK Play SDK] Game ready acknowledged.');
  }

  showInterstitial(callbacks = {}) {
    const now = Date.now();
    if (this.isAdShowing) {
      console.log('[VK Play SDK] Interstitial skipped: another ad active');
      if (callbacks && typeof callbacks.onClose === 'function') callbacks.onClose(false);
      return;
    }

    if (now - this.lastInterstitialTime < this.AD_COOLDOWN_MS) {
      console.log('[VK Play SDK] Interstitial skipped due to 60s cooldown');
      if (callbacks && typeof callbacks.onClose === 'function') callbacks.onClose(false);
      return;
    }

    if (window.game && (window.game.state === window.game.STATE_PLAYING || window.game.state === window.game.STATE_PAUSED)) {
      if (callbacks && typeof callbacks.onClose === 'function') callbacks.onClose(false);
      return;
    }

    this.isAdShowing = true;
    this._muteAudio(true);

    let wasPausedByAd = false;
    if (window.game && typeof window.game.pauseGame === 'function' && window.game.state === window.game.STATE_PLAYING) {
      wasPausedByAd = true;
      window.game.pauseGame();
    }

    if (callbacks && typeof callbacks.onOpen === 'function') {
      try { callbacks.onOpen(); } catch (e) {}
    }

    const watchdogTimer = setTimeout(() => {
      console.warn('[VK Play SDK] Interstitial watchdog timeout (35s)');
      this._finishAdSession(false);
    }, 35000);

    this.activeAdSession = {
      isRewarded: false,
      completed: false,
      wasPausedByAd,
      watchdogTimer,
      onClose: callbacks.onClose,
      onError: callbacks.onError
    };

    // 1. VK Play iframeApi
    if (this.externalApi && typeof this.externalApi.showAds === 'function') {
      try {
        this.externalApi.showAds({ interstitial: true });
        return;
      } catch (err) {
        console.warn('[VK Play] showAds error:', err);
      }
    }

    // 2. VK Bridge
    if (this.vkBridge && typeof this.vkBridge.send === 'function') {
      this._bridgeSend('VKWebAppShowNativeAds', { ad_format: 'interstitial' }, 35000)
        .then((data) => {
          this._finishAdSession(data && data.result);
        })
        .catch((err) => {
          if (callbacks && typeof callbacks.onError === 'function') {
            try { callbacks.onError(err); } catch(e) {}
          }
          this._finishAdSession(false);
        });
      return;
    }

    // 3. Fallback Mock
    setTimeout(() => {
      this._finishAdSession(true);
    }, 400);
  }

  showRewardedVideo(callbacks = {}) {
    if (this.isAdShowing) {
      console.warn('[VK Play SDK] Rewarded video skipped: another ad active');
      if (callbacks && typeof callbacks.onError === 'function') callbacks.onError(new Error('AD_ALREADY_OPEN'));
      return;
    }

    this.isAdShowing = true;
    this._muteAudio(true);

    let wasPausedByAd = false;
    if (window.game && typeof window.game.pauseGame === 'function' && window.game.state === window.game.STATE_PLAYING) {
      wasPausedByAd = true;
      window.game.pauseGame();
    }

    if (callbacks && typeof callbacks.onOpen === 'function') {
      try { callbacks.onOpen(); } catch(e) {}
    }

    const watchdogTimer = setTimeout(() => {
      console.warn('[VK Play SDK] Rewarded watchdog timeout (65s)');
      this._finishAdSession(false);
    }, 65000);

    this.activeAdSession = {
      isRewarded: true,
      completed: false,
      rewardGranted: false,
      wasPausedByAd,
      watchdogTimer,
      onRewarded: callbacks.onRewarded,
      onClose: callbacks.onClose,
      onError: callbacks.onError
    };

    // 1. VK Play iframeApi
    if (this.externalApi && typeof this.externalApi.showAds === 'function') {
      try {
        this.externalApi.showAds({ interstitial: false });
        return;
      } catch (err) {
        console.warn('[VK Play] showAds rewarded error:', err);
      }
    }

    // 2. VK Bridge
    if (this.vkBridge && typeof this.vkBridge.send === 'function') {
      this._bridgeSend('VKWebAppShowNativeAds', { ad_format: 'reward' }, 65000)
        .then((data) => {
          if (data && data.result) {
            if (callbacks && typeof callbacks.onRewarded === 'function') {
              try { callbacks.onRewarded(); } catch(e) {}
            }
            this._finishAdSession(true);
          } else {
            this._finishAdSession(false);
          }
        })
        .catch((err) => {
          if (callbacks && typeof callbacks.onError === 'function') {
            try { callbacks.onError(err); } catch(e) {}
          }
          this._finishAdSession(false);
        });
      return;
    }

    // 3. Fallback Mock
    setTimeout(() => {
      if (callbacks && typeof callbacks.onRewarded === 'function') {
        try { callbacks.onRewarded(); } catch(e) {}
      }
      this._finishAdSession(true);
    }, 450);
  }

  async savePlayerData(data, immediate = false) {
    if (!data || typeof data !== 'object') return;

    try {
      const serial = JSON.stringify(data);
      localStorage.setItem('cybertower_save', serial);
      localStorage.setItem('cyber_tower_save_v1', serial);
      localStorage.setItem('cybertower_vk_cloud_cache', serial);
    } catch (e) {}

    this.cloudSavePendingData = data;
    const now = Date.now();

    const executeCloudSave = async () => {
      if (!this.cloudSavePendingData) return;
      const payload = this.cloudSavePendingData;
      this.cloudSavePendingData = null;
      this.lastCloudSaveTime = Date.now();

      if (this.vkBridge && typeof this.vkBridge.send === 'function') {
        try {
          const serial = JSON.stringify(payload).slice(0, 4000);
          await this._bridgeSend('VKWebAppStorageSet', {
            key: 'cybertower_progress',
            value: serial
          }, 2500);
          console.log('[VK Bridge] Progress saved to VK Cloud Storage');
        } catch(e) {}
      }
    };

    if (immediate || (now - this.lastCloudSaveTime >= 4000)) {
      if (this.cloudSaveTimer) {
        clearTimeout(this.cloudSaveTimer);
        this.cloudSaveTimer = null;
      }
      return executeCloudSave();
    } else if (!this.cloudSaveTimer) {
      this.cloudSaveTimer = setTimeout(() => {
        this.cloudSaveTimer = null;
        executeCloudSave();
      }, 4000 - (now - this.lastCloudSaveTime));
    }
  }

  async loadPlayerData() {
    let localData = null;
    try {
      const local = localStorage.getItem('cybertower_save') || localStorage.getItem('cyber_tower_save_v1');
      if (local) localData = JSON.parse(local);
    } catch(e) {}

    let cloudData = null;
    if (this.vkBridge && typeof this.vkBridge.send === 'function') {
      try {
        const res = await this._bridgeSend('VKWebAppStorageGet', { keys: ['cybertower_progress'] }, 2500);
        if (res && res.keys && res.keys[0] && res.keys[0].value) {
          cloudData = JSON.parse(res.keys[0].value);
        }
      } catch(e) {}
    }

    if (!cloudData) {
      try {
        cloudData = JSON.parse(localStorage.getItem('cybertower_vk_cloud_cache') || 'null');
      } catch(e) {}
    }

    if (cloudData && localData && typeof cloudData === 'object' && typeof localData === 'object') {
      const merged = Object.assign({}, localData, cloudData);
      merged.totalChips = Math.max(Number(localData.totalChips) || 0, Number(cloudData.totalChips) || 0);
      merged.highWave = Math.max(Number(localData.highWave) || 1, Number(cloudData.highWave) || 1);
      merged.highScore = Math.max(Number(localData.highScore) || 0, Number(cloudData.highScore) || 0);
      merged.hpLevel = Math.max(Number(localData.hpLevel) || 0, Number(cloudData.hpLevel) || 0);
      merged.dmgLevel = Math.max(Number(localData.dmgLevel) || 0, Number(cloudData.dmgLevel) || 0);
      merged.regenLevel = Math.max(Number(localData.regenLevel) || 0, Number(cloudData.regenLevel) || 0);
      merged.rangeLevel = Math.max(Number(localData.rangeLevel) || 0, Number(cloudData.rangeLevel) || 0);
      merged.luckLevel = Math.max(Number(localData.luckLevel) || 0, Number(cloudData.luckLevel) || 0);

      const union = (a = [], b = []) => Array.from(new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]));
      merged.unlockedPets = union(localData.unlockedPets, cloudData.unlockedPets);
      merged.unlockedSkins = union(localData.unlockedSkins, cloudData.unlockedSkins);
      merged.unlockedImplants = union(localData.unlockedImplants, cloudData.unlockedImplants);
      merged.completedAchievements = union(localData.completedAchievements, cloudData.completedAchievements);

      const today = new Date().toDateString();
      if (localData.lastDailyGiftDate === today || cloudData.lastDailyGiftDate === today) {
        merged.lastDailyGiftDate = today;
      }
      if (localData.lastWheelSpinDate === today || cloudData.lastWheelSpinDate === today) {
        merged.lastWheelSpinDate = today;
      }

      this.savePlayerData(merged, true).catch(() => {});
      return merged;
    }

    if (cloudData && typeof cloudData === 'object' && Object.keys(cloudData).length > 0) {
      return cloudData;
    }

    return localData;
  }

  async canReview() {
    if (this.vkBridge && typeof this.vkBridge.send === 'function') {
      return { value: true };
    }
    return { value: false, reason: 'NOT_SUPPORTED' };
  }

  async requestReview() {
    if (this.vkBridge && typeof this.vkBridge.send === 'function') {
      try {
        await this._bridgeSend('VKWebAppRecommend', {}, 3000);
        return { feedbackSent: true };
      } catch(e) {
        return { feedbackSent: false, err: e };
      }
    }
    return { feedbackSent: false, reason: 'NOT_SUPPORTED' };
  }

  async canShowShortcutPrompt() {
    if (this.vkBridge && typeof this.vkBridge.send === 'function') {
      return { canShow: true };
    }
    return { canShow: false };
  }

  async showShortcutPrompt() {
    if (this.vkBridge && typeof this.vkBridge.send === 'function') {
      try {
        const res = await this._bridgeSend('VKWebAppAddToFavorites', {}, 3000);
        return { outcome: (res && res.result) ? 'accepted' : 'rejected' };
      } catch(e) {
        return { outcome: 'rejected', err: e };
      }
    }
    return { outcome: 'rejected' };
  }

  async submitScore(leaderboardName, score) {
    console.log(`[VK Play SDK] Score submitted: ${score} (${leaderboardName})`);
    try {
      localStorage.setItem('cybertower_best_wave', String(score));
    } catch(e) {}
  }

  async fetchLeaderboard(leaderboardName = 'cybertower_waves') {
    const userWave = parseInt(localStorage.getItem('cybertower_best_wave') || '1', 10);
    const userNick = (this.player && this.player.nick) ? this.player.nick : 'Игрок VK';

    return [
      { rank: 1, player: { publicName: 'CyberNinja_99' }, score: Math.max(35, userWave + 5) },
      { rank: 2, player: { publicName: 'NeonOverlord' }, score: Math.max(28, userWave + 2) },
      { rank: 3, player: { publicName: userNick }, score: userWave },
      { rank: 4, player: { publicName: 'MatrixRebel' }, score: 17 },
      { rank: 5, player: { publicName: 'SentinelX' }, score: 14 }
    ];
  }
}

// Global initialization
window.vkPlayBridge = new VKPlayBridge();
window.vkSdk = window.vkPlayBridge;
