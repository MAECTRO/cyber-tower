// Web Audio synthesizer and procedural SFX generator
// Built with Web Audio API oscillators for zero external audio assets

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterVolume = 0.7;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.35;
    try {
      this.muted = localStorage.getItem('cyber_tower_muted') === 'true';
    } catch(e) {
      this.muted = false;
    }
    this.systemMuted = false;
    this.musicPlaying = false;
    this.wasMusicPlayingBeforeMute = false;
    this.musicTimer = null;
    this.beatIndex = 0;
    this.voiceEnabled = false;
    this.currentStation = 'synthwave'; // 'synthwave' | 'darksynth' | 'ambient'
    this.lastFocusBeamTime = 0;
    this.initAudioContext();

    window.addEventListener('game-mute-toggle', (e) => {
      if (e && e.detail && typeof e.detail.muted !== 'undefined') {
        this.setSystemMuted(e.detail.muted);
      }
    });
  }

  canPlay() {
    return !this.muted && !this.systemMuted && !!this.ctx;
  }

  initAudioContext() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
    } catch (e) {
      console.warn('[SoundEngine] initAudioContext failed:', e);
    }
  }

  resume() {
    try {
      if (this.ctx && this.ctx.state === 'suspended' && !this.systemMuted) {
        this.ctx.resume();
      }
    } catch (e) {}
  }

  setSystemMuted(state) {
    this.systemMuted = !!state;
    if (this.systemMuted) {
      this.wasMusicPlayingBeforeMute = this.musicPlaying;
      this.stopMusic();
      if (this.ctx && this.ctx.state === 'running') {
        try { this.ctx.suspend(); } catch(e) {}
      }
    } else {
      if (!this.muted && this.ctx && this.ctx.state === 'suspended') {
        try { this.ctx.resume(); } catch(e) {}
      }
      if (!this.muted && !this.musicPlaying && this.wasMusicPlayingBeforeMute && window.game && window.game.state === window.game.STATE_PLAYING) {
        this.startMusic();
      }
    }
  }

  setMuted(muteState) {
    this.muted = !!muteState;
    try {
      localStorage.setItem('cyber_tower_muted', String(this.muted));
    } catch(e) {}
    if (this.muted || this.systemMuted) {
      this.stopMusic();
      if (this.muted && this.ctx && this.ctx.state === 'running') {
        try { this.ctx.suspend(); } catch(e) {}
      }
    } else {
      this.resume();
      if (window.game && window.game.state === window.game.STATE_PLAYING) {
        this.startMusic();
      }
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setRadioStation(stationId) {
    this.currentStation = stationId;
    this.playRadioSwitch();
    if (this.musicPlaying) {
      this.stopMusic();
      this.startMusic();
    }
  }

  speak(text, lang = 'ru') {
    return;
  }

  playRadioSwitch() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(1200, t + 0.15);
      const vol = Math.max(0.0001, 0.18 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  playBossWarningSiren() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      for (let i = 0; i < 3; i++) {
        const t = this.ctx.currentTime + i * 0.45;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.linearRampToValueAtTime(550, t + 0.25);
        osc.frequency.linearRampToValueAtTime(180, t + 0.42);

        const vol = Math.max(0.0001, 0.35 * this.sfxVolume);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.42);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.42);
      }
    } catch (e) {}
  }

  playBossAlarm() {
    this.playBossWarningSiren();
  }

  playUltimate(className = 'default') {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;

      if (className === 'sentinel' || className === 'default' || className === 'class_sentinel') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.linearRampToValueAtTime(160, t + 1.2);
        const vol = Math.max(0.0001, 0.4 * this.sfxVolume);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 1.2);
      } else if (className === 'tesla' || className === 'class_tesla') {
        for (let i = 0; i < 6; i++) {
          const tt = t + i * 0.12;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(600 + Math.random() * 800, tt);
          const vol = Math.max(0.0001, 0.3 * this.sfxVolume);
          gain.gain.setValueAtTime(vol, tt);
          gain.gain.linearRampToValueAtTime(0.0001, tt + 0.1);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(tt);
          osc.stop(tt + 0.1);
        }
      } else if (className === 'dreadnought' || className === 'class_dreadnought' || className === 'heavy') {
        this.playExplosion('large');
      } else if (className === 'cryo' || className === 'class_cryo') {
        for (let i = 0; i < 5; i++) {
          const tt = t + i * 0.08;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400 + i * 300, tt);
          const vol = Math.max(0.0001, 0.25 * this.sfxVolume);
          gain.gain.setValueAtTime(vol, tt);
          gain.gain.linearRampToValueAtTime(0.0001, tt + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(tt);
          osc.stop(tt + 0.2);
        }
      }
    } catch (e) {}
  }

  playMissionComplete() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        const vol = Math.max(0.0001, 0.22 * this.sfxVolume);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch (e) {}
  }

  playWheelTick() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 + Math.random() * 200, t);
      const vol = Math.max(0.0001, 0.09 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.035);
    } catch (e) {}
  }

  playJackpot() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        const vol = Math.max(0.0001, 0.25 * this.sfxVolume);
        gain.gain.setValueAtTime(vol, t + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.0001, t + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  playSlotSpin() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(900 + Math.random() * 300, t);
      const vol = Math.max(0.0001, 0.08 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  playPickup() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
      const vol = Math.max(0.0001, 0.20 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }

  playChestOpen() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(900, t + 0.2);
      const vol = Math.max(0.0001, 0.22 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }

  playEvolution() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
      const vol = Math.max(0.0001, 0.30 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch (e) {}
  }

  playClick() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      const vol = Math.max(0.0001, 0.06 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.025);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.025);
    } catch (e) {}
  }

  playReaction() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.linearRampToValueAtTime(120, t + 0.28);

      const vol = Math.max(0.0001, 0.35 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    } catch (e) {}
  }

  playShoot(type = 'basic') {
    try {
      if (!this.canPlay()) return;
      this.resume();

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'basic') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(120, t + 0.12);
        const vol = Math.max(0.0001, 0.18 * this.sfxVolume);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      } else if (type === 'plasma') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.linearRampToValueAtTime(300, t + 0.18);
        const vol = Math.max(0.0001, 0.22 * this.sfxVolume);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      } else if (type === 'missile') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.25);
        const vol = Math.max(0.0001, 0.28 * this.sfxVolume);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      }
    } catch (e) {}
  }

  playIonBlast() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      // Dual oscillator: deep sub-rumble + laser harmonic sweep
      const oscSub = this.ctx.createOscillator();
      const gainSub = this.ctx.createGain();
      oscSub.type = 'sawtooth';
      oscSub.frequency.setValueAtTime(140, t);
      oscSub.frequency.exponentialRampToValueAtTime(35, t + 0.45);
      const volSub = Math.max(0.0001, 0.35 * this.sfxVolume);
      gainSub.gain.setValueAtTime(volSub, t);
      gainSub.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      oscSub.connect(gainSub);
      gainSub.connect(this.ctx.destination);
      oscSub.start(t);
      oscSub.stop(t + 0.45);

      const oscSweep = this.ctx.createOscillator();
      const gainSweep = this.ctx.createGain();
      oscSweep.type = 'sine';
      oscSweep.frequency.setValueAtTime(950, t);
      oscSweep.frequency.exponentialRampToValueAtTime(180, t + 0.35);
      const volSweep = Math.max(0.0001, 0.28 * this.sfxVolume);
      gainSweep.gain.setValueAtTime(volSweep, t);
      gainSweep.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      oscSweep.connect(gainSweep);
      gainSweep.connect(this.ctx.destination);
      oscSweep.start(t);
      oscSweep.stop(t + 0.35);
    } catch (e) {}
  }

  playZap() {
    try {
      if (!this.canPlay()) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.linearRampToValueAtTime(180, t + 0.15);
      const vol = Math.max(0.0001, 0.28 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  playFocusBeam() {
    try {
      if (!this.canPlay()) return;
      const t = this.ctx.currentTime;
      if (this.lastFocusBeamTime && (t - this.lastFocusBeamTime < 0.08)) return;
      this.lastFocusBeamTime = t;
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380 + Math.sin(t * 20) * 80, t);
      const vol = Math.max(0.0001, 0.08 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }

  playExplosion(size = 'normal') {
    try {
      if (!this.canPlay()) return;
      this.resume();

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(size === 'large' ? 120 : 220, t);
      osc.frequency.linearRampToValueAtTime(size === 'large' ? 20 : 35, t + (size === 'large' ? 0.6 : 0.3));

      const vol = Math.max(0.0001, (size === 'large' ? 0.5 : 0.3) * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + (size === 'large' ? 0.6 : 0.3));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + (size === 'large' ? 0.6 : 0.3));
    } catch (e) {}
  }

  playEMP() {
    try {
      if (!this.canPlay()) return;
      this.resume();

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.linearRampToValueAtTime(1400, t + 0.45);

      const vol = Math.max(0.0001, 0.45 * this.sfxVolume);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    } catch (e) {}
  }

  playLevelUp() {
    try {
      if (!this.canPlay()) return;
      this.resume();

      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        const vol = Math.max(0.0001, 0.25 * this.sfxVolume);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch (e) {}
  }

  playGameOver() {
    if (!this.canPlay()) return;
    try {
      this.initAudioContext();
      this.resume();
      const t = this.ctx.currentTime;
      [180, 140, 110, 75].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.12);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.4), t + idx * 0.12 + 0.25);
        const vol = Math.max(0.0001, 0.28 * this.sfxVolume);
        gain.gain.setValueAtTime(vol, t + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.0001, t + idx * 0.12 + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.12);
        osc.stop(t + idx * 0.12 + 0.28);
      });
    } catch (e) {}
  }

  startMusic() {
    try {
      if (this.musicPlaying || this.muted || this.systemMuted) return;
      if (window.game && window.game.state !== window.game.STATE_PLAYING) return;
      this.initAudioContext();
      this.resume();
      this.musicPlaying = true;
      this.beatIndex = 0;

      let bpm = 125;
      let bassline = [110, 110, 110, 110, 130.81, 130.81, 110, 110, 98, 98, 98, 98, 123.47, 123.47, 98, 98];
      let leadNotes = [440, 0, 523.25, 0, 659.25, 0, 587.33, 0, 523.25, 0, 440, 0, 392, 0, 440, 0];

      if (this.currentStation === 'darksynth') {
        bpm = 138;
        bassline = [73.42, 73.42, 73.42, 87.31, 73.42, 73.42, 98.00, 73.42, 65.41, 65.41, 65.41, 77.78, 65.41, 87.31, 73.42, 0];
        leadNotes = [587.33, 0, 698.46, 0, 880.00, 0, 783.99, 0, 698.46, 0, 587.33, 0, 523.25, 0, 587.33, 0];
      } else if (this.currentStation === 'ambient') {
        bpm = 95;
        bassline = [55, 0, 55, 0, 65.41, 0, 55, 0, 49, 0, 49, 0, 61.74, 0, 49, 0];
        leadNotes = [220, 0, 261.63, 0, 329.63, 0, 293.66, 0, 261.63, 0, 220, 0, 196, 0, 220, 0];
      }

      const interval = (60 / bpm) * 250;

      this.musicTimer = setInterval(() => {
        try {
          if (!this.musicPlaying || this.muted || this.systemMuted || !this.ctx) return;
          const t = this.ctx.currentTime;
          const step = this.beatIndex % 16;

          if (step % 4 === 0) {
            const kickOsc = this.ctx.createOscillator();
            const kickGain = this.ctx.createGain();
            kickOsc.type = 'sine';
            kickOsc.frequency.setValueAtTime(this.currentStation === 'darksynth' ? 160 : 130, t);
            kickOsc.frequency.linearRampToValueAtTime(35, t + 0.14);
            const vol = Math.max(0.0001, 0.38 * this.musicVolume);
            kickGain.gain.setValueAtTime(vol, t);
            kickGain.gain.linearRampToValueAtTime(0.0001, t + 0.14);
            kickOsc.connect(kickGain);
            kickGain.connect(this.ctx.destination);
            kickOsc.start(t);
            kickOsc.stop(t + 0.14);
          }

          if (step % 2 === 1) {
            const hatOsc = this.ctx.createOscillator();
            const hatGain = this.ctx.createGain();
            hatOsc.type = 'square';
            hatOsc.frequency.setValueAtTime(4500 + Math.random() * 500, t);
            const vol = Math.max(0.0001, 0.04 * this.musicVolume);
            hatGain.gain.setValueAtTime(vol, t);
            hatGain.gain.linearRampToValueAtTime(0.0001, t + 0.04);
            hatOsc.connect(hatGain);
            hatGain.connect(this.ctx.destination);
            hatOsc.start(t);
            hatOsc.stop(t + 0.04);
          }

          const bassFreq = bassline[step];
          if (bassFreq > 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = this.currentStation === 'darksynth' ? 'sawtooth' : 'triangle';
            bassOsc.frequency.setValueAtTime(bassFreq, t);
            const vol = Math.max(0.0001, (this.currentStation === 'darksynth' ? 0.16 : 0.12) * this.musicVolume);
            bassGain.gain.setValueAtTime(vol, t);
            bassGain.gain.linearRampToValueAtTime(0.0001, t + 0.12);
            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bassOsc.start(t);
            bassOsc.stop(t + 0.12);
          }

          const leadFreq = leadNotes[step];
          if (leadFreq > 0 && Math.random() > 0.3) {
            const leadOsc = this.ctx.createOscillator();
            const leadGain = this.ctx.createGain();
            leadOsc.type = this.currentStation === 'ambient' ? 'sine' : 'triangle';
            leadOsc.frequency.setValueAtTime(leadFreq, t);
            const vol = Math.max(0.0001, 0.09 * this.musicVolume);
            leadGain.gain.setValueAtTime(vol, t);
            leadGain.gain.linearRampToValueAtTime(0.0001, t + 0.18);
            leadOsc.connect(leadGain);
            leadGain.connect(this.ctx.destination);
            leadOsc.start(t);
            leadOsc.stop(t + 0.18);
          }

          this.beatIndex++;
        } catch (e) {}
      }, interval);
    } catch (e) {}
  }

  stopMusic() {
    try {
      this.musicPlaying = false;
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
    } catch (e) {}
  }
}

window.soundEngine = new SoundEngine();
