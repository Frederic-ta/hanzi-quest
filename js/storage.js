// HanziQuest — localStorage Management

const STORAGE_KEYS = {
  PLAYER: 'hq_player',
  WORD_PROGRESS: 'hq_word_progress',
  QUESTS: 'hq_quests',
  SETTINGS: 'hq_settings',
  COMBAT: 'hq_combat',
  SKILL_TREE: 'hq_skill_tree',
  DAILY_LEARNING: 'hq_daily_learning',
};

const Storage = {
  // === PLAYER DATA ===
  getPlayer() {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER);
    if (raw) {
      const player = JSON.parse(raw);
      // Migrate: ensure new fields exist
      if (!player.currentRegion) player.currentRegion = 'village';
      if (!player.skillPoints) player.skillPoints = 0;
      return player;
    }
    return this.createDefaultPlayer();
  },

  savePlayer(player) {
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
  },

  createDefaultPlayer() {
    const player = {
      name: "Aventurier",
      level: 1,
      xp: 0,
      totalXp: 0,
      stats: {
        attack: 0,    // vocab mastered
        defense: 0,   // grammar
        perception: 0, // listening accuracy
        dexterity: 0,  // writing accuracy
      },
      streak: {
        current: 0,
        best: 0,
        lastDate: null,
      },
      wordsLearned: 0,
      quizzesDone: 0,
      perfectQuizzes: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      currentRegion: 'village',
      createdAt: Date.now(),
    };
    this.savePlayer(player);
    return player;
  },

  // === WORD PROGRESS (SM-2 spaced repetition) ===
  getWordProgress() {
    const raw = localStorage.getItem(STORAGE_KEYS.WORD_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  },

  saveWordProgress(progress) {
    localStorage.setItem(STORAGE_KEYS.WORD_PROGRESS, JSON.stringify(progress));
  },

  getWordState(wordId) {
    const progress = this.getWordProgress();
    const state = progress[wordId] || {
      ease: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: 0,
      lastScore: 0,
      seen: false,
      mastered: false,
      timesCorrect: 0,
      timesWrong: 0,
      mastery: { recognize: false, recall: false, write: false, listen: false },
      lastReviewed: 0,
    };
    // Migration for existing data
    if (!state.mastery) state.mastery = { recognize: false, recall: false, write: false, listen: false };
    if (state.lastReviewed === undefined) state.lastReviewed = 0;
    return state;
  },

  updateWordState(wordId, state) {
    const progress = this.getWordProgress();
    progress[wordId] = state;
    this.saveWordProgress(progress);
  },

  // === QUESTS ===
  getQuests() {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTS);
    return raw ? JSON.parse(raw) : null;
  },

  saveQuests(quests) {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  },

  // === COMBAT DATA ===
  getCombatData() {
    const raw = localStorage.getItem(STORAGE_KEYS.COMBAT);
    return raw ? JSON.parse(raw) : {
      totalFights: 0,
      totalVictories: 0,
      bossesDefeated: [],
    };
  },

  saveCombatData(data) {
    localStorage.setItem(STORAGE_KEYS.COMBAT, JSON.stringify(data));
  },

  // === SKILL TREE ===
  getSkillTreeData() {
    const raw = localStorage.getItem(STORAGE_KEYS.SKILL_TREE);
    return raw ? JSON.parse(raw) : {
      skillPoints: 0,
      unlockedSkills: [],
    };
  },

  saveSkillTreeData(data) {
    localStorage.setItem(STORAGE_KEYS.SKILL_TREE, JSON.stringify(data));
  },

  // === SETTINGS ===
  getSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : {
      soundEnabled: true,
      ttsRate: 0.8,
      difficulty: 'normal',
    };
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // === DAILY LEARNING ===
  getDailyLearning() {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LEARNING);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === new Date().toDateString()) return data;
    }
    return { date: new Date().toDateString(), newWordsCount: 0, lastCheckpointAt: 0 };
  },

  saveDailyLearning(data) {
    data.date = new Date().toDateString();
    localStorage.setItem(STORAGE_KEYS.DAILY_LEARNING, JSON.stringify(data));
  },

  // === UTILITY ===
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },

  exportData() {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = localStorage.getItem(key);
    });
    return JSON.stringify(data);
  },

  importData(json) {
    const data = JSON.parse(json);
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (data[name]) localStorage.setItem(key, data[name]);
    });
  },
};
