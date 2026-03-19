// HanziQuest — TTS and Sound Effects

const Audio = {
  synth: window.speechSynthesis,
  _voices: [],
  _ready: false,

  init() {
    // Load voices (retry multiple times — mobile browsers load them async)
    const loadVoices = () => {
      this._voices = this.synth.getVoices();
      if (this._voices.length > 0) this._ready = true;
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    // Fallback: retry loading voices after delays (iOS/Android quirk)
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1500);
    setTimeout(loadVoices, 3000);
  },

  // Speak Chinese text
  speakChinese(text, rate = 0.8) {
    if (!Storage.getSettings().soundEnabled) return;
    // Reload voices if empty (mobile quirk)
    if (this._voices.length === 0) {
      this._voices = this.synth.getVoices();
    }
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a Chinese voice (try multiple lang codes)
    const zhVoice = this._voices.find(v => v.lang === 'zh-CN') 
      || this._voices.find(v => v.lang.startsWith('zh'))
      || this._voices.find(v => v.lang.includes('CN') || v.lang.includes('Chinese'));
    if (zhVoice) utterance.voice = zhVoice;

    this.synth.speak(utterance);
    return utterance;
  },

  // Speak French text
  speakFrench(text) {
    if (!Storage.getSettings().soundEnabled) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1;
    const frVoice = this._voices.find(v => v.lang.startsWith('fr'));
    if (frVoice) utterance.voice = frVoice;
    this.synth.speak(utterance);
  },

  // === SOUND EFFECTS (Web Audio API) ===
  _ctx: null,

  getCtx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  },

  // Play a tone
  playTone(freq, duration, type = 'sine', vol = 0.3) {
    if (!Storage.getSettings().soundEnabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) { /* audio not available */ }
  },

  // Correct answer sound
  playCorrect() {
    this.playTone(523, 0.15, 'sine', 0.5);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.5), 120);
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.5), 240);
  },

  // Wrong answer sound
  playWrong() {
    this.playTone(200, 0.2, 'sawtooth', 0.4);
    setTimeout(() => this.playTone(150, 0.25, 'sawtooth', 0.4), 180);
  },

  // Level up fanfare
  playLevelUp() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.25), i * 150);
    });
    setTimeout(() => {
      this.playTone(1047, 0.4, 'sine', 0.3);
      this.playTone(784, 0.4, 'sine', 0.15);
    }, 600);
  },

  // XP gain sound
  playXP() {
    this.playTone(880, 0.08, 'sine', 0.1);
    setTimeout(() => this.playTone(1100, 0.08, 'sine', 0.1), 60);
  },

  // Streak sound
  playStreak() {
    const notes = [440, 554, 659, 880];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.12, 'triangle', 0.2), i * 80);
    });
  },

  // Quest complete
  playQuestComplete() {
    const melody = [659, 784, 880, 1047, 1175, 1319];
    melody.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.15, 'sine', 0.2), i * 100);
    });
  },

  // Button click
  playClick() {
    this.playTone(600, 0.08, 'sine', 0.3);
  },

  // Stroke correct
  playStrokeCorrect() {
    this.playTone(700 + Math.random() * 200, 0.08, 'sine', 0.15);
  },

  // Combat spell cast
  playSpellCast() {
    this.playTone(400, 0.08, 'sine', 0.2);
    setTimeout(() => this.playTone(600, 0.08, 'sine', 0.2), 80);
    setTimeout(() => this.playTone(900, 0.15, 'sine', 0.25), 160);
  },

  // Combat enemy hit
  playEnemyHit() {
    this.playTone(300, 0.1, 'square', 0.15);
    setTimeout(() => this.playTone(150, 0.15, 'sawtooth', 0.2), 100);
  },

  // Combat victory
  playVictory() {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319];
    melody.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.2, 'sine', 0.25), i * 120);
    });
  },

  // Boss encounter
  playBossIntro() {
    this.playTone(100, 0.4, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(120, 0.4, 'sawtooth', 0.2), 400);
    setTimeout(() => this.playTone(80, 0.6, 'sawtooth', 0.25), 800);
  },
};
