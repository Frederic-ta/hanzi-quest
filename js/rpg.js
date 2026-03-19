// HanziQuest — RPG System (XP, Levels, Stats, Quests, Streaks)

const RPG = {
  // XP required for each level (cumulative thresholds)
  XP_TABLE: [
    0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
    4700, 5700, 6800, 8000, 9500, 11000, 13000, 15000, 17500, 20000,
    23000, 26500, 30000, 34000, 38500, 43000, 48000, 54000, 60000, 67000
  ],

  MAX_LEVEL: 30,

  // XP rewards
  XP_REWARDS: {
    correctAnswer: 10,
    perfectQuiz: 30,
    wordMastered: 50,
    writingCorrect: 15,
    writingPerfect: 40,
    listeningCorrect: 12,
    streakBonus: 5,      // per day of streak
    questComplete: 100,
    firstTimeWord: 20,
  },

  // Get XP needed for next level
  xpForLevel(level) {
    if (level >= this.MAX_LEVEL) return Infinity;
    return this.XP_TABLE[level] || (this.XP_TABLE[this.XP_TABLE.length - 1] + (level - this.XP_TABLE.length + 1) * 8000);
  },

  // Get current level progress (0-1)
  getLevelProgress(player) {
    const currentLevelXp = this.xpForLevel(player.level - 1);
    const nextLevelXp = this.xpForLevel(player.level);
    if (nextLevelXp === Infinity) return 1;
    return (player.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp);
  },

  // Award XP and check for level up — returns { xpGained, leveledUp, newLevel }
  awardXP(player, amount) {
    const streakMultiplier = 1 + Math.min(player.streak.current, 7) * 0.1;
    const xpGained = Math.round(amount * streakMultiplier);
    player.xp += xpGained;
    player.totalXp += xpGained;

    let leveledUp = false;
    let newLevel = player.level;

    while (player.level < this.MAX_LEVEL && player.totalXp >= this.xpForLevel(player.level)) {
      player.level++;
      leveledUp = true;
      newLevel = player.level;
      // Award skill points on level up
      if (typeof SkillTree !== 'undefined') {
        SkillTree.addSkillPoints(1);
      }
    }

    Storage.savePlayer(player);
    return { xpGained, leveledUp, newLevel };
  },

  // Update streak
  updateStreak(player) {
    const today = new Date().toDateString();
    const lastDate = player.streak.lastDate;

    if (lastDate === today) return false; // already counted today

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === yesterday) {
      player.streak.current++;
    } else if (lastDate !== today) {
      player.streak.current = 1;
    }

    player.streak.lastDate = today;
    if (player.streak.current > player.streak.best) {
      player.streak.best = player.streak.current;
    }

    Storage.savePlayer(player);
    return true;
  },

  // Update stats based on quiz results
  updateStats(player, quizType, correct) {
    if (correct) {
      switch (quizType) {
        case 'vocab':
        case 'meaning':
        case 'pinyin':
          player.stats.attack = Math.min(999, player.stats.attack + 1);
          break;
        case 'grammar':
        case 'fill':
          player.stats.defense = Math.min(999, player.stats.defense + 1);
          break;
        case 'listening':
          player.stats.perception = Math.min(999, player.stats.perception + 1);
          break;
        case 'writing':
          player.stats.dexterity = Math.min(999, player.stats.dexterity + 1);
          break;
      }
    }
    Storage.savePlayer(player);
  },

  // SM-2 Spaced Repetition (axis: 'recognize'|'recall'|'write'|'listen'|null)
  sm2(wordState, quality, axis = null) {
    // quality: 0-5 (0=complete fail, 5=perfect)
    const state = { ...wordState };

    // Ensure mastery object exists
    if (!state.mastery) state.mastery = { recognize: false, recall: false, write: false, listen: false };

    if (quality >= 3) {
      // correct
      if (state.repetitions === 0) {
        state.interval = 1;
      } else if (state.repetitions === 1) {
        state.interval = 6;
      } else {
        state.interval = Math.round(state.interval * state.ease);
      }
      state.repetitions++;
      state.timesCorrect++;

      // Update mastery axis
      if (axis) {
        state.mastery[axis] = true;
      }
    } else {
      // incorrect
      state.repetitions = 0;
      state.interval = 1;
      state.timesWrong++;
    }

    state.ease = Math.max(1.3, state.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    state.nextReview = Date.now() + state.interval * 86400000;
    state.lastScore = quality;
    state.lastReviewed = Date.now();
    state.seen = true;

    // Mastered = all 4 axes + 5+ correct + ease > 2.0
    const allAxes = state.mastery.recognize && state.mastery.recall &&
                    state.mastery.write && state.mastery.listen;
    if (allAxes && state.timesCorrect >= 5 && state.ease >= 2.0) {
      state.mastered = true;
    }

    return state;
  },

  // Check decay: words not reviewed in 7+ days lose mastery
  checkDecay() {
    const progress = Storage.getWordProgress();
    const now = Date.now();
    const DECAY_MS = 7 * 86400000;
    const decayed = [];

    Object.entries(progress).forEach(([id, state]) => {
      if (state.mastered && state.lastReviewed && (now - state.lastReviewed) > DECAY_MS) {
        state.mastered = false;
        if (state.mastery) {
          state.mastery = { recognize: false, recall: false, write: false, listen: false };
        }
        decayed.push(parseInt(id));
      }
    });

    if (decayed.length > 0) {
      Storage.saveWordProgress(progress);
    }
    return decayed;
  },

  // === QUESTS ===
  generateDailyQuests(player) {
    const today = new Date().toDateString();
    const existing = Storage.getQuests();
    if (existing && existing.date === today) return existing.quests;

    const quests = [
      {
        id: 'daily_learn',
        title: 'Explorateur',
        description: 'Apprends 10 nouveaux mots',
        target: 10,
        progress: 0,
        reward: this.XP_REWARDS.questComplete,
        type: 'learn',
        completed: false,
      },
      {
        id: 'daily_quiz',
        title: 'Combattant',
        description: 'Fais 3 quiz',
        target: 3,
        progress: 0,
        reward: this.XP_REWARDS.questComplete,
        type: 'quiz',
        completed: false,
      },
      {
        id: 'daily_perfect',
        title: 'Perfectionniste',
        description: 'Obtiens un score parfait sur un quiz',
        target: 1,
        progress: 0,
        reward: this.XP_REWARDS.questComplete * 1.5,
        type: 'perfect',
        completed: false,
      },
      {
        id: 'daily_writing',
        title: 'Calligraphe',
        description: 'Pratique l\'écriture de 5 caractères',
        target: 5,
        progress: 0,
        reward: this.XP_REWARDS.questComplete,
        type: 'writing',
        completed: false,
      },
    ];

    Storage.saveQuests({ date: today, quests });
    return quests;
  },

  updateQuestProgress(type, amount = 1) {
    const data = Storage.getQuests();
    if (!data) return [];
    const completed = [];

    data.quests.forEach(q => {
      if (q.type === type && !q.completed) {
        q.progress = Math.min(q.target, q.progress + amount);
        if (q.progress >= q.target) {
          q.completed = true;
          completed.push(q);
        }
      }
    });

    Storage.saveQuests(data);
    return completed;
  },

  // Get player title based on level
  getTitle(level) {
    const titles = [
      "Novice", "Apprenti", "Initié", "Adepte", "Érudit",
      "Guerrier", "Maître", "Champion", "Héros", "Légende",
      "Sage", "Archimage", "Gardien", "Oracle", "Titan",
      "Immortel", "Divin", "Transcendant", "Céleste", "Éternel",
      "Mythique", "Cosmique", "Primordial", "Absolu", "Infini",
      "Suprême", "Ultime", "Omniscient", "Dragon", "Empereur"
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
  },

  // Get avatar stage (0-4)
  getAvatarStage(level) {
    if (level <= 5) return 0;
    if (level <= 10) return 1;
    if (level <= 15) return 2;
    if (level <= 20) return 3;
    return 4;
  },
};
