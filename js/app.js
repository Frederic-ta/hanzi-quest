// HanziQuest — Main App Logic & Routing

const App = {
  currentScreen: 'home',
  player: null,
  npcDialogueQueue: [],
  npcDialogueIndex: 0,
  reviewMode: false,
  recapWords: [],
  recapIndex: 0,
  recapCallback: null,
  checkpointMode: false,
  _quizEndCallback: null, // callback after quiz ends (for reviews/checkpoints)

  init() {
    Audio.init();
    this.player = Storage.getPlayer();

    // Update streak on app open
    const isNewDay = RPG.updateStreak(this.player);
    if (isNewDay && this.player.streak.current > 1) {
      setTimeout(() => {
        Audio.playStreak();
        UI.showToast(`🔥 Série de ${this.player.streak.current} jours !`, 'streak', 3000);
        const bonus = RPG.awardXP(this.player, RPG.XP_REWARDS.streakBonus * this.player.streak.current);
        UI.showXPGain(bonus.xpGained);

        if (this.player.streak.current % 3 === 0) {
          SkillTree.addSkillPoints(1);
          UI.showToast('💎 +1 point de compétence !', 'quest', 3000);
        }
      }, 1000);
    }

    // Generate daily quests
    RPG.generateDailyQuests(this.player);

    // Feature 5: Check decay
    const decayed = RPG.checkDecay();

    // Feature 2: Check daily reviews
    const dueWords = this.getDueWords();

    // Setup navigation
    this.setupNav();

    // Resume audio context on first touch
    document.addEventListener('touchstart', () => {
      if (Audio._ctx && Audio._ctx.state === 'suspended') Audio._ctx.resume();
    }, { once: true });
    document.addEventListener('click', () => {
      if (Audio._ctx && Audio._ctx.state === 'suspended') Audio._ctx.resume();
    }, { once: true });

    // Show appropriate screen
    if (dueWords.length > 0) {
      this.navigate('home');
      setTimeout(() => this.showDailyReview(dueWords, decayed.length), 800);
    } else {
      this.navigate('home');
      if (decayed.length > 0) {
        setTimeout(() => UI.showToast(`${decayed.length} mots ont besoin de révision !`, 'error', 4000), 1000);
      }
    }
  },

  setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Audio.playClick();
        this.navigate(btn.dataset.screen);
      });
    });
  },

  navigate(screen) {
    this.currentScreen = screen;

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screen);
    });

    document.querySelector('.bottom-nav').style.display = 'flex';

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${screen}`);
    if (target) target.classList.add('active');

    this.player = Storage.getPlayer();
    switch (screen) {
      case 'home': this.renderHome(); break;
      case 'world': this.renderWorldMap(); break;
      case 'learn': this.renderLearn(); break;
      case 'quiz': this.renderQuizMenu(); break;
      case 'write': this.renderWriteMenu(); break;
      case 'skills': this.renderSkillTree(); break;
      case 'profile': this.renderProfile(); break;
    }
  },

  // ============================================================
  //  FEATURE 2: DAILY REVIEW SYSTEM
  // ============================================================
  getDueWords() {
    const progress = Storage.getWordProgress();
    const now = Date.now();
    const due = [];
    Object.entries(progress).forEach(([id, p]) => {
      if (p.seen && p.nextReview && p.nextReview <= now) {
        due.push(parseInt(id));
      }
    });
    return due;
  },

  showDailyReview(dueWordIds, decayCount) {
    const el = document.getElementById('screen-review');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    document.querySelector('.bottom-nav').style.display = 'none';

    const count = dueWordIds.length;
    const decayMsg = decayCount > 0
      ? `<div class="review-decay-msg">${decayCount} mots ont perdu leur maîtrise (pas révisés depuis 7+ jours)</div>`
      : '';

    el.innerHTML = `
      <div class="review-screen">
        <div class="review-header">
          <div class="review-icon">📚</div>
          <h2>Révisions du jour</h2>
          ${decayMsg}
          <div class="review-count">${count} mot${count > 1 ? 's' : ''} à réviser</div>
          <p class="review-subtitle">Complète tes révisions avant de continuer !</p>
        </div>
        <div class="review-actions">
          <button class="btn-rpg review-start-btn" onclick="App.startDailyReview()">Commencer les révisions</button>
        </div>
      </div>
    `;
  },

  startDailyReview() {
    const dueIds = this.getDueWords();
    if (dueIds.length === 0) {
      UI.showToast('Aucun mot à réviser !', 'success');
      this.navigate('home');
      return;
    }

    // Build a mixed quiz from due words (all 4 axes)
    const pool = dueIds.map(id => HSK_DATA.find(w => w.id === id)).filter(Boolean);
    if (pool.length < 4) {
      // Not enough for multiple choice — pad with random words
      const extra = HSK_DATA.filter(w => !dueIds.includes(w.id));
      Quiz.shuffle(extra);
      pool.push(...extra.slice(0, 4 - pool.length));
    }

    const types = ['charToMeaning', 'meaningToChar', 'listenPick', 'sentenceCompletion'];
    const questions = [];
    const reviewWords = dueIds.map(id => HSK_DATA.find(w => w.id === id)).filter(Boolean);

    reviewWords.forEach(word => {
      const type = types[Math.floor(Math.random() * types.length)];
      questions.push(Quiz.createQuestion(type, word, pool.length >= 4 ? pool : HSK_DATA));
    });

    Quiz.shuffle(questions);
    const maxQ = Math.min(questions.length, 20);

    Quiz.currentQuiz = {
      type: types[0],
      questions: questions.slice(0, maxQ),
      total: Math.min(questions.length, maxQ),
      startTime: Date.now(),
    };
    Quiz.currentQuestion = 0;
    Quiz.score = 0;
    Quiz.answers = [];

    this.reviewMode = true;
    this._quizEndCallback = () => {
      this.reviewMode = false;
      // After review, check for wrong answers → recap
      const wrongAnswers = Quiz.answers.filter(a => !a.correct);
      if (wrongAnswers.length > 0) {
        this.showRecap(wrongAnswers, () => this.navigate('home'));
      } else {
        UI.showToast('Révisions terminées !', 'success');
        this.navigate('home');
      }
    };

    this.renderQuizQuestion();
  },

  // ============================================================
  //  FEATURE 3: POST-QUIZ/COMBAT RECAP
  // ============================================================
  showRecap(wrongAnswers, onComplete) {
    this.recapWords = wrongAnswers.map(a => a.question.word);
    this.recapIndex = 0;
    this.recapCallback = onComplete;

    const el = document.getElementById('screen-recap');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    document.querySelector('.bottom-nav').style.display = 'none';

    this.renderRecapList();
  },

  renderRecapList() {
    const el = document.getElementById('screen-recap');
    el.innerHTML = `
      <div class="recap-screen">
        <div class="recap-header">
          <h2>Récap des erreurs</h2>
          <p class="recap-subtitle">${this.recapWords.length} mot${this.recapWords.length > 1 ? 's' : ''} à revoir</p>
        </div>
        <div class="recap-word-list">
          ${this.recapWords.map((w, i) => `
            <div class="recap-word-card">
              <div class="recap-word-hanzi">${w.hanzi}</div>
              <div class="recap-word-info">
                <div class="recap-word-pinyin">${w.pinyin}</div>
                <div class="recap-word-meaning">${w.meaning}</div>
                <div class="recap-word-sentence">${w.sentences[0] || ''}</div>
              </div>
              <button class="btn-audio-small" onclick="Audio.speakChinese('${w.hanzi}')">🔊</button>
            </div>
          `).join('')}
        </div>
        <div class="recap-actions">
          <button class="btn-rpg" onclick="App.startRecapMiniReview()">Mini-révision</button>
        </div>
      </div>
    `;

    // Auto-play first word audio
    if (this.recapWords.length > 0) {
      setTimeout(() => Audio.speakChinese(this.recapWords[0].hanzi), 500);
    }
  },

  startRecapMiniReview() {
    const pool = this.recapWords.length >= 4 ? this.recapWords : HSK_DATA;
    const types = ['charToMeaning', 'meaningToChar', 'listenPick'];
    const questions = this.recapWords.map(word => {
      const type = types[Math.floor(Math.random() * types.length)];
      return Quiz.createQuestion(type, word, pool);
    });

    Quiz.currentQuiz = {
      type: 'charToMeaning',
      questions,
      total: questions.length,
      startTime: Date.now(),
    };
    Quiz.currentQuestion = 0;
    Quiz.score = 0;
    Quiz.answers = [];

    this._quizEndCallback = () => {
      const stillWrong = Quiz.answers.filter(a => !a.correct);
      if (stillWrong.length > 0) {
        UI.showToast(`${stillWrong.length} mot(s) encore à travailler`, 'info');
      } else {
        UI.showToast('Bravo, tout est correct !', 'success');
      }
      if (this.recapCallback) {
        this.recapCallback();
        this.recapCallback = null;
      }
    };

    this.renderQuizQuestion();
  },

  // ============================================================
  //  FEATURE 4: CHECKPOINT QUIZZES
  // ============================================================
  checkCheckpoint() {
    const daily = Storage.getDailyLearning();
    const progress = Storage.getWordProgress();
    const totalSeen = Object.values(progress).filter(p => p.seen).length;
    const lastCheck = daily.lastCheckpointAt || 0;

    // Trigger checkpoint every 15 new words since last checkpoint
    if (totalSeen - lastCheck >= 15) {
      return true;
    }
    return false;
  },

  startCheckpointQuiz(onComplete) {
    const progress = Storage.getWordProgress();
    const learnedIds = Object.entries(progress)
      .filter(([id, p]) => p.seen)
      .map(([id]) => parseInt(id));

    const pool = learnedIds.map(id => HSK_DATA.find(w => w.id === id)).filter(Boolean);
    if (pool.length < 4) {
      if (onComplete) onComplete(true);
      return;
    }

    Quiz.shuffle(pool);
    const types = ['charToMeaning', 'meaningToChar', 'listenPick', 'sentenceCompletion'];
    const count = Math.min(20, pool.length);
    const questions = pool.slice(0, count).map(word => {
      const type = types[Math.floor(Math.random() * types.length)];
      return Quiz.createQuestion(type, word, pool);
    });

    Quiz.currentQuiz = {
      type: 'charToMeaning',
      questions,
      total: questions.length,
      startTime: Date.now(),
    };
    Quiz.currentQuestion = 0;
    Quiz.score = 0;
    Quiz.answers = [];

    this.checkpointMode = true;
    this._quizEndCallback = () => {
      this.checkpointMode = false;
      const results = Quiz.getResults();
      const passed = results.percentage >= 80;

      if (passed) {
        // Update checkpoint marker
        const daily = Storage.getDailyLearning();
        const totalSeen = Object.values(Storage.getWordProgress()).filter(p => p.seen).length;
        daily.lastCheckpointAt = totalSeen;
        Storage.saveDailyLearning(daily);

        UI.showToast('Checkpoint réussi ! Contenu débloqué !', 'success', 3000);
        if (onComplete) onComplete(true);
      } else {
        // Failed — show recap of wrong words then retry
        const wrongAnswers = Quiz.answers.filter(a => !a.correct);
        UI.showToast(`${results.percentage}% — Il faut 80% pour passer !`, 'error', 3000);
        if (wrongAnswers.length > 0) {
          this.showRecap(wrongAnswers, () => {
            if (onComplete) onComplete(false);
          });
        } else {
          if (onComplete) onComplete(false);
        }
      }
    };

    // Show checkpoint intro
    const el = document.getElementById('screen-quiz');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    el.classList.add('active');

    el.innerHTML = `
      <div class="checkpoint-intro">
        <div class="checkpoint-icon">🏰</div>
        <h2>Checkpoint !</h2>
        <p>Tu as appris beaucoup de nouveaux mots. Vérifie tes connaissances !</p>
        <p class="checkpoint-rule">Il faut 80% de bonnes réponses pour continuer.</p>
        <button class="btn-rpg" onclick="App.renderQuizQuestion()">Commencer</button>
      </div>
    `;
  },

  // ============================================================
  //  FEATURE 7: ANTI-RUSH (20 new words/day max)
  // ============================================================
  canLearnNewWord() {
    const daily = Storage.getDailyLearning();
    return daily.newWordsCount < 20;
  },

  trackNewWord() {
    const daily = Storage.getDailyLearning();
    daily.newWordsCount++;
    Storage.saveDailyLearning(daily);
  },

  // ============================================================
  //  HOME SCREEN
  // ============================================================
  renderHome() {
    const el = document.getElementById('screen-home');
    const progress = Storage.getWordProgress();
    const seen = Object.values(progress).filter(p => p.seen).length;
    const mastered = Object.values(progress).filter(p => p.mastered).length;
    const dueCount = this.getDueWords().length;
    const quests = RPG.generateDailyQuests(this.player);
    const combatData = Storage.getCombatData();
    const currentRegion = getRegion(this.player.currentRegion || 'village');
    const daily = Storage.getDailyLearning();

    el.innerHTML = `
      <div class="home-header">
        <div class="home-avatar" id="home-avatar"></div>
        <div class="home-info">
          <h1 class="home-title">HanziQuest</h1>
          <div class="home-subtitle">${RPG.getTitle(this.player.level)} — Niv. ${this.player.level}</div>
          <div class="home-region">${currentRegion.icon} ${currentRegion.name}</div>
        </div>
      </div>

      <div id="home-xp-bar" class="home-xp"></div>

      ${dueCount > 0 ? `
        <div class="home-review-banner" onclick="App.showDailyReview(App.getDueWords(), 0)">
          <span class="review-banner-icon">📚</span>
          <span class="review-banner-text">${dueCount} mot${dueCount > 1 ? 's' : ''} à réviser</span>
          <span class="review-banner-arrow">→</span>
        </div>
      ` : ''}

      <div id="home-streak" class="home-streak"></div>

      <div class="quick-stats">
        <div class="stat-pill"><span class="stat-val">${seen}</span><span class="stat-label">Vus</span></div>
        <div class="stat-pill"><span class="stat-val">${mastered}</span><span class="stat-label">Maîtrisés</span></div>
        <div class="stat-pill"><span class="stat-val">${combatData.totalVictories || 0}</span><span class="stat-label">Victoires</span></div>
        <div class="stat-pill"><span class="stat-val">${this.player.streak.current}🔥</span><span class="stat-label">Série</span></div>
      </div>

      <div class="quick-actions">
        <button class="action-btn action-combat" onclick="App.navigate('world')">
          <span class="action-icon">⚔️</span>
          <span class="action-text">Combat</span>
        </button>
        <button class="action-btn action-learn" onclick="App.navigate('learn')">
          <span class="action-icon">📖</span>
          <span class="action-text">Apprendre</span>
        </button>
        <button class="action-btn action-write" onclick="App.navigate('write')">
          <span class="action-icon">✍️</span>
          <span class="action-text">Écriture</span>
        </button>
      </div>

      <div class="home-daily-info">
        <span class="daily-words-count">Mots appris aujourd'hui : ${daily.newWordsCount}/20</span>
      </div>

      <div class="quests-section">
        <h2 class="section-title">Quêtes du jour</h2>
        <div class="quests-list">
          ${quests.map(q => `
            <div class="quest-card ${q.completed ? 'quest-done' : ''}">
              <div class="quest-info">
                <div class="quest-title">${q.title}</div>
                <div class="quest-desc">${q.description}</div>
                <div class="quest-progress-bar">
                  <div class="quest-fill" style="width: ${(q.progress / q.target) * 100}%"></div>
                </div>
              </div>
              <div class="quest-reward">
                ${q.completed ? '✅' : `${q.progress}/${q.target}`}
                <div class="quest-xp">${q.reward} XP</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    UI.renderAvatar(document.getElementById('home-avatar'), this.player.level);
    UI.renderXPBar(document.getElementById('home-xp-bar'), this.player);
    UI.renderStreak(document.getElementById('home-streak'), this.player.streak);
  },

  // ============================================================
  //  WORLD MAP (unchanged)
  // ============================================================
  renderWorldMap() {
    const el = document.getElementById('screen-world');
    const combatData = Storage.getCombatData();
    const bossesDefeated = combatData.bossesDefeated || [];

    el.innerHTML = `
      <div class="screen-header">
        <h2>🗺️ 龙界 — Le Royaume du Dragon</h2>
        <p class="subtitle">Explore les régions et combats les gardiens</p>
      </div>
      <div class="world-map">
        ${REGIONS.map((region, i) => {
          const unlocked = isRegionUnlocked(region.id, this.player.level);
          const bossBeaten = bossesDefeated.includes(region.id);
          const isCurrent = this.player.currentRegion === region.id;

          return `
            <div class="world-region ${unlocked ? 'region-unlocked' : 'region-locked'} ${isCurrent ? 'region-current' : ''} ${bossBeaten ? 'region-complete' : ''}"
                 style="--region-color: ${region.color}"
                 onclick="${unlocked ? `App.showRegion('${region.id}')` : ''}">
              <div class="region-connector ${i > 0 ? 'connector-visible' : ''}"></div>
              <div class="region-node">
                <div class="region-icon">${unlocked ? region.icon : '🔒'}</div>
                ${bossBeaten ? '<div class="region-star">⭐</div>' : ''}
              </div>
              <div class="region-info">
                <div class="region-name">${region.name}</div>
                <div class="region-req">${unlocked ? (bossBeaten ? 'Complété' : 'Accessible') : `Niv. ${region.unlockLevel} requis`}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  showRegion(regionId) {
    const region = getRegion(regionId);
    if (!region) return;

    this.player.currentRegion = regionId;
    Storage.savePlayer(this.player);

    const el = document.getElementById('screen-world');
    const combatData = Storage.getCombatData();
    const bossBeaten = (combatData.bossesDefeated || []).includes(regionId);
    const words = getRegionWords(regionId);

    el.innerHTML = `
      <div class="screen-header">
        <button class="back-btn" onclick="App.renderWorldMap()">← Carte</button>
        <h2>${region.icon} ${region.name}</h2>
        <div class="subtitle">${region.nameZh}</div>
      </div>

      <div class="region-description" style="--region-color: ${region.color}">
        <p>${region.description}</p>
      </div>

      <div class="region-npcs">
        <h3>Habitants</h3>
        ${region.npcs.map(npc => `
          <button class="npc-card" onclick="App.talkToNPC('${regionId}', '${npc.name}')">
            <span class="npc-card-icon">${npc.icon}</span>
            <div class="npc-card-info">
              <div class="npc-card-name">${npc.name}</div>
              <div class="npc-card-role">${npc.role}</div>
            </div>
            <span class="npc-card-talk">💬</span>
          </button>
        `).join('')}
      </div>

      <div class="region-actions">
        <h3>Actions</h3>
        <div class="region-action-grid">
          <button class="region-action-btn combat-btn" onclick="App.startRegionCombat('${regionId}')">
            <span class="ra-icon">⚔️</span>
            <span class="ra-text">Combattre</span>
            <span class="ra-desc">Affronte les créatures</span>
          </button>
          <button class="region-action-btn boss-btn ${bossBeaten ? 'boss-beaten' : ''}" onclick="App.startBossFight('${regionId}')">
            <span class="ra-icon">${region.boss.icon}</span>
            <span class="ra-text">${bossBeaten ? 'Boss vaincu' : 'Boss : ' + region.boss.name}</span>
            <span class="ra-desc">${bossBeaten ? '⭐ Rejouer' : 'Combat de boss !'}</span>
          </button>
          <button class="region-action-btn learn-btn" onclick="App.learnRegionWords('${regionId}')">
            <span class="ra-icon">📖</span>
            <span class="ra-text">Étudier</span>
            <span class="ra-desc">${words.length} mots</span>
          </button>
          <button class="region-action-btn quiz-btn" onclick="App.startRegionQuiz('${regionId}')">
            <span class="ra-icon">🎯</span>
            <span class="ra-text">Quiz</span>
            <span class="ra-desc">Teste tes connaissances</span>
          </button>
        </div>
      </div>
    `;
  },

  // NPC Dialogue
  talkToNPC(regionId, npcName) {
    const region = getRegion(regionId);
    const npc = region.npcs.find(n => n.name === npcName);
    if (!npc) return;

    this.npcDialogueQueue = npc.dialogue;
    this.npcDialogueIndex = 0;

    const overlay = document.getElementById('npc-overlay');
    document.getElementById('npc-icon').textContent = npc.icon;
    document.getElementById('npc-name').textContent = npc.name;
    document.getElementById('npc-role').textContent = npc.role;
    document.getElementById('npc-text').textContent = npc.dialogue[0];

    const btn = document.getElementById('npc-next-btn');
    btn.textContent = npc.dialogue.length > 1 ? 'Suivant' : 'Fermer';

    overlay.classList.add('show');
  },

  advanceNPCDialogue() {
    this.npcDialogueIndex++;
    if (this.npcDialogueIndex >= this.npcDialogueQueue.length) {
      document.getElementById('npc-overlay').classList.remove('show');
      return;
    }

    document.getElementById('npc-text').textContent = this.npcDialogueQueue[this.npcDialogueIndex];
    const btn = document.getElementById('npc-next-btn');
    btn.textContent = this.npcDialogueIndex >= this.npcDialogueQueue.length - 1 ? 'Fermer' : 'Suivant';
  },

  // Region Combat
  startRegionCombat(regionId) {
    const enemy = getRandomEnemy(regionId);
    if (!enemy) return;

    Combat.start(regionId, enemy, (won) => {
      if (won) {
        const combatData = Storage.getCombatData();
        if (combatData.totalVictories % 5 === 0) {
          SkillTree.addSkillPoints(1);
          setTimeout(() => UI.showToast('💎 +1 point de compétence !', 'quest', 3000), 2000);
        }
      }
      this.showRegion(regionId);
    });
  },

  startBossFight(regionId) {
    const boss = getRegionBoss(regionId);
    if (!boss) return;

    Combat.start(regionId, boss, (won) => {
      if (won) {
        SkillTree.addSkillPoints(3);
        setTimeout(() => UI.showToast('💎 +3 points de compétence (Boss) !', 'quest', 3000), 2000);
      }
      this.showRegion(regionId);
    });
  },

  learnRegionWords(regionId) {
    const region = getRegion(regionId);
    if (!region) return;

    this.navigate('learn');
    const el = document.getElementById('screen-learn');
    const progress = Storage.getWordProgress();

    el.innerHTML = `
      <div class="screen-header">
        <button class="back-btn" onclick="App.showRegion('${regionId}')">← ${region.name}</button>
        <h2>${region.icon} Mots de ${region.name}</h2>
      </div>
      <div class="category-grid">
        ${region.categories.map(key => {
          const cat = CATEGORIES[key];
          if (!cat) return '';
          const words = getWordsByCategory(key);
          const learned = words.filter(w => progress[w.id]?.seen).length;
          return `
            <button class="category-card" onclick="App.showCategory('${key}')" style="--cat-color: ${cat.color}">
              <div class="cat-icon">${cat.icon}</div>
              <div class="cat-name">${cat.name}</div>
              <div class="cat-progress">${learned}/${words.length}</div>
              <div class="cat-bar"><div class="cat-bar-fill" style="width: ${(learned / words.length) * 100}%"></div></div>
            </button>
          `;
        }).join('')}
      </div>
    `;
  },

  startRegionQuiz(regionId) {
    const region = getRegion(regionId);
    if (!region) return;

    let pool = [];
    region.categories.forEach(cat => {
      pool = pool.concat(getWordsByCategory(cat));
    });

    if (pool.length < 4) {
      UI.showToast('Pas assez de mots dans cette région !', 'error');
      return;
    }

    const quiz = Quiz.generate('charToMeaning', 10, null);
    quiz.questions = pool.slice(0, 10).map(w => Quiz.createQuestion('charToMeaning', w, pool));
    quiz.total = quiz.questions.length;
    Quiz.currentQuiz = quiz;
    Quiz.currentQuestion = 0;
    Quiz.score = 0;
    Quiz.answers = [];

    this._quizEndCallback = null;
    this.navigate('quiz');
    this.renderQuizQuestion();
  },

  // ============================================================
  //  LEARN SCREEN
  // ============================================================
  renderLearn() {
    const el = document.getElementById('screen-learn');
    const progress = Storage.getWordProgress();

    el.innerHTML = `
      <div class="screen-header">
        <h2>Apprendre</h2>
        <p class="subtitle">Choisis une catégorie</p>
      </div>
      <div class="category-grid">
        ${Object.entries(CATEGORIES).map(([key, cat]) => {
          const words = getWordsByCategory(key);
          const learned = words.filter(w => progress[w.id]?.seen).length;
          return `
            <button class="category-card" onclick="App.showCategory('${key}')" style="--cat-color: ${cat.color}">
              <div class="cat-icon">${cat.icon}</div>
              <div class="cat-name">${cat.name}</div>
              <div class="cat-progress">${learned}/${words.length}</div>
              <div class="cat-bar"><div class="cat-bar-fill" style="width: ${(learned / words.length) * 100}%"></div></div>
            </button>
          `;
        }).join('')}
      </div>
    `;
  },

  showCategory(category) {
    const el = document.getElementById('screen-learn');
    const cat = CATEGORIES[category];
    const words = getWordsByCategory(category);
    const progress = Storage.getWordProgress();

    el.innerHTML = `
      <div class="screen-header">
        <button class="back-btn" onclick="App.renderLearn()">← Retour</button>
        <h2>${cat.icon} ${cat.name}</h2>
      </div>
      <div class="word-list">
        ${words.map(w => {
          const wp = progress[w.id];
          const state = Storage.getWordState(w.id);
          const status = state.mastered ? 'mastered' : state.seen ? 'seen' : 'new';
          return `
            <div class="word-card word-${status}" onclick="App.showWord(${w.id})">
              <div class="word-hanzi">${w.hanzi}</div>
              <div class="word-pinyin">${w.pinyin}</div>
              <div class="word-meaning">${w.meaning}</div>
              <div class="word-mastery-icons">${UI.renderMasteryIcons(state.mastery)}</div>
              <div class="word-status">${status === 'mastered' ? '⭐' : status === 'seen' ? '📝' : '🆕'}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // ============================================================
  //  FEATURE 6: WORD DETAIL SCREEN (enhanced with "Compris !")
  // ============================================================
  showWord(wordId) {
    const word = HSK_DATA.find(w => w.id === wordId);
    if (!word) return;

    const state = Storage.getWordState(wordId);
    const isNewWord = !state.seen;

    // Feature 7: Anti-rush check
    if (isNewWord && !this.canLearnNewWord()) {
      const el = document.getElementById('screen-learn');
      el.innerHTML = `
        <div class="anti-rush-screen">
          <div class="anti-rush-icon">🎉</div>
          <h2>Bravo !</h2>
          <p>Tu as appris 20 nouveaux mots aujourd'hui !</p>
          <p>Reviens demain pour continuer. En attendant, révise !</p>
          <div class="anti-rush-actions">
            <button class="btn-rpg" onclick="App.navigate('quiz')">Réviser en quiz</button>
            <button class="btn-rpg btn-secondary" onclick="App.navigate('home')">Accueil</button>
          </div>
        </div>
      `;
      return;
    }

    // Mark as seen and track
    if (isNewWord) {
      state.seen = true;
      Storage.updateWordState(wordId, state);
      this.trackNewWord();
      RPG.updateQuestProgress('learn');
      const result = RPG.awardXP(this.player, RPG.XP_REWARDS.firstTimeWord);
      UI.showXPGain(result.xpGained);
      Audio.playXP();
    }

    const el = document.getElementById('screen-learn');
    const masteryHTML = UI.renderMasteryIcons(state.mastery);
    const sentencesHTML = word.sentences.map(s => `
      <div class="detail-sentence-item">
        <div class="sentence-text">${s}</div>
        <button class="btn-audio-small" onclick="Audio.speakChinese('${s.replace(/'/g, "\\'")}')">🔊</button>
      </div>
    `).join('');

    el.innerHTML = `
      <div class="screen-header">
        <button class="back-btn" onclick="App.showCategory('${word.category}')">← Retour</button>
      </div>
      <div class="word-detail">
        <div class="detail-hanzi" id="word-detail-char">${word.hanzi}</div>
        <div class="detail-pinyin">${word.pinyin}</div>
        <div class="detail-meaning">${word.meaning}</div>

        <div class="detail-mastery">${masteryHTML}</div>

        <button class="btn-audio" onclick="Audio.speakChinese('${word.hanzi}')">
          🔊 Écouter
        </button>

        <div class="detail-sentences">
          <div class="sentence-label">Exemples :</div>
          ${sentencesHTML}
        </div>

        <div class="detail-writing">
          <h3>Ordre des traits</h3>
          <div id="word-hanzi-writer" class="hanzi-writer-box"></div>
          <div class="writer-controls">
            <button class="btn-rpg" onclick="App.animateWordStrokes('${word.hanzi}')">▶ Animer</button>
            <button class="btn-rpg btn-secondary" onclick="App.practiceWordWriting(${word.id}, '${word.hanzi}')">✍️ Pratiquer</button>
          </div>
        </div>

        ${isNewWord ? `
          <div class="compris-section" id="compris-section">
            <button class="btn-rpg compris-btn" id="compris-btn" onclick="App.confirmWordUnderstood(${word.id})" disabled>Compris !</button>
            <div class="compris-timer" id="compris-timer">Attends un instant...</div>
          </div>
        ` : `
          <div class="compris-section">
            <button class="btn-rpg btn-secondary" onclick="App.showCategory('${word.category}')">Retour à la liste</button>
          </div>
        `}
      </div>
    `;

    // Auto-play stroke animation and audio
    const firstChar = word.hanzi[0];
    setTimeout(() => {
      Writing.showLearnMode(firstChar, 'word-hanzi-writer');
      setTimeout(() => Writing.animateCharacter(), 300);
    }, 100);
    setTimeout(() => Audio.speakChinese(word.hanzi), 400);

    // Enable "Compris !" after 3 seconds for new words
    if (isNewWord) {
      setTimeout(() => {
        const btn = document.getElementById('compris-btn');
        const timer = document.getElementById('compris-timer');
        if (btn) btn.disabled = false;
        if (timer) timer.textContent = '';
      }, 3000);
    }
  },

  confirmWordUnderstood(wordId) {
    const word = HSK_DATA.find(w => w.id === wordId);
    if (!word) return;

    // Check if checkpoint is due
    if (this.checkCheckpoint()) {
      this.startCheckpointQuiz(() => {
        this.navigate('learn');
        this.showCategory(word.category);
      });
    } else {
      this.showCategory(word.category);
    }
  },

  animateWordStrokes(hanzi) {
    Writing.showLearnMode(hanzi[0], 'word-hanzi-writer');
    setTimeout(() => Writing.animateCharacter(), 200);
  },

  practiceWordWriting(wordId, hanzi) {
    const chars = [...hanzi];
    Writing.showQuizMode(chars[0], 'word-hanzi-writer',
      null, null,
      (result) => {
        // Update write mastery axis
        const wordState = Storage.getWordState(wordId);
        const quality = result.perfect ? 5 : 4;
        const newState = RPG.sm2(wordState, quality, 'write');
        Storage.updateWordState(wordId, newState);

        if (result.perfect) {
          UI.showToast('Parfait !', 'success');
          const r = RPG.awardXP(this.player, RPG.XP_REWARDS.writingPerfect);
          UI.showXPGain(r.xpGained);
        } else {
          UI.showToast('Bien joué !', 'info');
          const r = RPG.awardXP(this.player, RPG.XP_REWARDS.writingCorrect);
          UI.showXPGain(r.xpGained);
        }
        RPG.updateStats(this.player, 'writing', true);
        RPG.updateQuestProgress('writing');
      }
    );
  },

  // ============================================================
  //  QUIZ SCREEN
  // ============================================================
  renderQuizMenu() {
    this._quizEndCallback = null;
    const el = document.getElementById('screen-quiz');
    el.innerHTML = `
      <div class="screen-header">
        <h2>⚔️ Quiz Combat</h2>
        <p class="subtitle">Choisis ton combat</p>
      </div>
      <div class="quiz-type-grid">
        ${Object.entries(Quiz.QUIZ_TYPES).map(([key, qt]) => `
          <button class="quiz-type-card" onclick="App.startQuiz('${key}')">
            <div class="qt-icon">${qt.icon}</div>
            <div class="qt-name">${qt.name}</div>
            <div class="qt-desc">${qt.description}</div>
          </button>
        `).join('')}
      </div>

      <div class="quiz-options">
        <h3>Options</h3>
        <div class="option-row">
          <label>Catégorie :</label>
          <select id="quiz-category">
            <option value="">Toutes</option>
            ${Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('')}
          </select>
        </div>
        <div class="option-row">
          <label>Questions :</label>
          <select id="quiz-count">
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
    `;
  },

  startQuiz(type) {
    const category = document.getElementById('quiz-category')?.value || null;
    const count = parseInt(document.getElementById('quiz-count')?.value || '10');

    Quiz.generate(type, count, category);
    this._quizEndCallback = null;
    this.renderQuizQuestion();
  },

  renderQuizQuestion() {
    const question = Quiz.getCurrentQuestion();
    if (!question) return;

    const el = document.getElementById('screen-quiz');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    el.classList.add('active');

    const qNum = Quiz.currentQuestion + 1;
    const total = Quiz.currentQuiz.total;
    const modeLabel = this.reviewMode ? '📚 Révision' : this.checkpointMode ? '🏰 Checkpoint' : '';

    let promptHTML = '';
    let optionsHTML = '';

    if (question.type === 'listen_multiple' || question.type === 'listen_input') {
      promptHTML = `
        <div class="quiz-prompt quiz-listen">
          <button class="listen-btn" onclick="Audio.speakChinese('${question.audioText}')">
            <span class="listen-icon">🔊</span>
            <span>Écouter</span>
          </button>
        </div>
      `;
      setTimeout(() => Audio.speakChinese(question.audioText), 400);
    } else {
      const displayClass = question.prompt.length <= 4 ? 'quiz-prompt-large' : 'quiz-prompt-medium';
      promptHTML = `
        <div class="quiz-prompt ${displayClass}">
          ${question.prompt}
          ${question.promptPinyin ? `<div class="quiz-prompt-pinyin">${question.promptPinyin}</div>` : ''}
        </div>
      `;
      if (/[\u4e00-\u9fff]/.test(question.prompt)) {
        setTimeout(() => Audio.speakChinese(question.prompt), 300);
      }
    }

    if (question.type === 'listen_input') {
      optionsHTML = `
        <div class="quiz-input-area">
          <input type="text" id="quiz-text-input" class="quiz-input" placeholder="Écris le pinyin..." autocomplete="off" autocapitalize="off">
          <button class="btn-rpg btn-submit" onclick="App.submitQuizAnswer(document.getElementById('quiz-text-input').value)">Valider</button>
        </div>
      `;
    } else {
      optionsHTML = `
        <div class="quiz-options-grid">
          ${question.options.map((opt, i) => `
            <button class="quiz-option" onclick="App.submitQuizAnswer('${opt.replace(/'/g, "\\'")}')">
              <span class="opt-letter">${['A', 'B', 'C', 'D'][i]}</span>
              <span class="opt-text">${opt}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    el.innerHTML = `
      <div class="quiz-header">
        ${modeLabel ? `<div class="quiz-mode-label">${modeLabel}</div>` : ''}
        <div class="quiz-progress">
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: ${(qNum / total) * 100}%"></div>
          </div>
          <div class="quiz-progress-text">${qNum} / ${total}</div>
        </div>
        <div class="quiz-score">Score: ${Quiz.score}</div>
      </div>

      <div class="quiz-body" id="quiz-body">
        ${promptHTML}
        ${optionsHTML}
      </div>
    `;

    if (question.type === 'listen_input') {
      setTimeout(() => {
        const input = document.getElementById('quiz-text-input');
        if (input) {
          input.focus();
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') App.submitQuizAnswer(input.value);
          });
        }
      }, 100);
    }
  },

  // ============================================================
  //  FEATURE 8: ENHANCED WRONG ANSWER FEEDBACK
  // ============================================================
  submitQuizAnswer(answer) {
    const result = Quiz.submitAnswer(answer);
    if (!result) return;

    const body = document.getElementById('quiz-body');
    if (!body) return;

    // Highlight correct/wrong options
    const options = body.querySelectorAll('.quiz-option');
    options.forEach(opt => {
      const text = opt.querySelector('.opt-text').textContent;
      opt.disabled = true;
      if (text === result.correctAnswer) {
        opt.classList.add('option-correct');
      } else if (text === answer && !result.correct) {
        opt.classList.add('option-wrong');
      }
    });

    if (result.correct) {
      UI.showXPGain(result.xpGained);
    } else {
      UI.shake(body);
    }

    const question = Quiz.currentQuiz.questions[Quiz.currentQuestion];

    if (!result.correct) {
      // Feature 8: Enhanced wrong answer feedback
      const feedbackHTML = `
        <div class="quiz-feedback feedback-wrong enhanced-feedback" id="enhanced-feedback">
          <div class="feedback-icon">✗</div>
          <div class="feedback-correct-answer">Réponse : ${result.correctAnswer}</div>
          <div class="enhanced-feedback-detail">
            <div class="ef-hanzi">${question.word.hanzi}</div>
            <div class="ef-pinyin">${question.word.pinyin}</div>
            <div class="ef-meaning">${question.word.meaning}</div>
            <button class="btn-audio-small ef-audio" onclick="Audio.speakChinese('${question.word.hanzi}')">🔊 Écouter</button>
            <div class="ef-sentence">${question.word.sentences[0] || ''}</div>
            <div id="ef-stroke-writer" class="ef-stroke-writer"></div>
          </div>
        </div>
      `;
      body.insertAdjacentHTML('beforeend', feedbackHTML);

      // Auto-play audio
      setTimeout(() => Audio.speakChinese(question.word.hanzi), 300);

      // Show stroke animation
      setTimeout(() => {
        const writerEl = document.getElementById('ef-stroke-writer');
        if (writerEl) {
          try {
            const writer = HanziWriter.create('ef-stroke-writer', question.word.hanzi[0], {
              width: 120, height: 120, padding: 8,
              showOutline: true, showCharacter: false,
              strokeColor: '#e0c070', outlineColor: '#3a3540',
              strokeAnimationSpeed: 1.5, delayBetweenStrokes: 200,
            });
            writer.animateCharacter();
          } catch (e) { /* fallback: just show char */ }
        }
      }, 400);

      // 3-second minimum display (Feature 8)
      const delay = 3500;
      const currentPlayer = Storage.getPlayer();
      if (currentPlayer.level > this.player.level) {
        setTimeout(() => UI.showLevelUp(currentPlayer.level), 500);
      }
      this.player = currentPlayer;

      setTimeout(() => {
        if (Quiz.nextQuestion()) {
          this.renderQuizQuestion();
        } else {
          this.renderQuizResults();
        }
      }, delay);
    } else {
      // Correct answer: normal feedback
      const feedbackHTML = `
        <div class="quiz-feedback feedback-correct">
          <div class="feedback-icon">✓</div>
          <div class="feedback-text">Correct !</div>
          <div class="feedback-word">${question.word.hanzi} — ${question.word.pinyin} — ${question.word.meaning}</div>
        </div>
      `;
      body.insertAdjacentHTML('beforeend', feedbackHTML);

      const currentPlayer = Storage.getPlayer();
      if (currentPlayer.level > this.player.level) {
        setTimeout(() => UI.showLevelUp(currentPlayer.level), 500);
      }
      this.player = currentPlayer;

      setTimeout(() => {
        if (Quiz.nextQuestion()) {
          this.renderQuizQuestion();
        } else {
          this.renderQuizResults();
        }
      }, 1500);
    }
  },

  // ============================================================
  //  QUIZ RESULTS (with recap trigger)
  // ============================================================
  renderQuizResults() {
    const results = Quiz.getResults();
    const el = document.getElementById('screen-quiz');

    const grade = results.percentage >= 90 ? 'S' :
                  results.percentage >= 80 ? 'A' :
                  results.percentage >= 70 ? 'B' :
                  results.percentage >= 50 ? 'C' : 'D';

    const gradeColors = { S: '#f0c040', A: '#60d080', B: '#60b0f0', C: '#f0a040', D: '#f06060' };

    // Check if there's a custom end callback (review/checkpoint)
    const hasCallback = !!this._quizEndCallback;
    const wrongAnswers = results.answers.filter(a => !a.correct);

    el.innerHTML = `
      <div class="results-screen">
        <div class="results-header">
          <h2>${results.isPerfect ? '🎉 Parfait !' : '⚔️ Combat terminé !'}</h2>
        </div>

        <div class="results-grade" style="--grade-color: ${gradeColors[grade]}">
          <span class="grade-letter">${grade}</span>
        </div>

        <div class="results-score">
          <span class="score-num" id="result-score">0</span> / ${results.total}
        </div>
        <div class="results-percent">${results.percentage}%</div>

        <div class="results-time">
          Temps : ${Math.round(results.timeTaken / 1000)}s
        </div>

        <div class="results-details">
          ${results.answers.map(a => `
            <div class="result-row ${a.correct ? 'row-correct' : 'row-wrong'}">
              <span class="result-icon">${a.correct ? '✓' : '✗'}</span>
              <span class="result-word">${a.question.word.hanzi}</span>
              <span class="result-meaning">${a.question.word.meaning}</span>
            </div>
          `).join('')}
        </div>

        <div class="results-actions">
          ${hasCallback ? `
            <button class="btn-rpg" onclick="App.onQuizEnd()">Continuer</button>
          ` : wrongAnswers.length > 0 ? `
            <button class="btn-rpg" onclick="App.showRecapFromResults()">Récap des erreurs (${wrongAnswers.length})</button>
            <button class="btn-rpg btn-secondary" onclick="App.renderQuizMenu()">Nouveau combat</button>
          ` : `
            <button class="btn-rpg" onclick="App.renderQuizMenu()">Nouveau combat</button>
            <button class="btn-rpg btn-secondary" onclick="App.navigate('home')">Accueil</button>
          `}
        </div>
      </div>
    `;

    setTimeout(() => {
      UI.animateNumber(document.getElementById('result-score'), 0, results.score, 1000);
    }, 300);

    if (results.isPerfect) Audio.playQuestComplete();

    const completed = RPG.updateQuestProgress('quiz');
    completed.forEach(q => {
      setTimeout(() => {
        UI.showToast(`Quête terminée : ${q.title} !`, 'quest', 3000);
        Audio.playQuestComplete();
        RPG.awardXP(this.player, q.reward);
      }, 2000);
    });
  },

  onQuizEnd() {
    if (this._quizEndCallback) {
      const cb = this._quizEndCallback;
      this._quizEndCallback = null;
      cb();
    } else {
      this.navigate('home');
    }
  },

  showRecapFromResults() {
    const wrongAnswers = Quiz.answers.filter(a => !a.correct);
    if (wrongAnswers.length > 0) {
      this.showRecap(wrongAnswers, () => this.renderQuizMenu());
    } else {
      this.renderQuizMenu();
    }
  },

  // ============================================================
  //  WRITE SCREEN
  // ============================================================
  renderWriteMenu() {
    const el = document.getElementById('screen-write');
    el.innerHTML = `
      <div class="screen-header">
        <h2>✍️ Écriture</h2>
        <p class="subtitle">Pratique l'ordre des traits</p>
      </div>

      <div class="write-modes">
        <button class="write-mode-card" onclick="App.startWritingPractice()">
          <div class="wm-icon">🎯</div>
          <div class="wm-name">Pratique libre</div>
          <div class="wm-desc">5 caractères aléatoires</div>
        </button>
        <button class="write-mode-card" onclick="App.startWritingByCategory()">
          <div class="wm-icon">📂</div>
          <div class="wm-name">Par catégorie</div>
          <div class="wm-desc">Choisis une catégorie</div>
        </button>
      </div>

      <div class="write-category-select" id="write-cat-select" style="display:none">
        <h3>Catégorie :</h3>
        <div class="category-chips">
          ${Object.entries(CATEGORIES).map(([k, v]) => `
            <button class="cat-chip" onclick="App.startWritingCategory('${k}')" style="--cat-color: ${v.color}">
              ${v.icon} ${v.name}
            </button>
          `).join('')}
        </div>
      </div>

      <div id="writing-area" style="display:none">
        <div class="writing-info">
          <div id="writing-char-info" class="writing-char-info"></div>
          <div id="writing-progress" class="writing-progress"></div>
        </div>
        <div id="hanzi-writer-container" class="hanzi-writer-box"></div>
        <div id="writing-result" class="writing-result"></div>
      </div>
    `;
  },

  startWritingPractice() {
    const { chars, words } = Writing.getRandomPracticeSet(5);
    this.runWritingSession(chars, words);
  },

  startWritingByCategory() {
    document.getElementById('write-cat-select').style.display = 'block';
  },

  startWritingCategory(category) {
    const { chars, words } = Writing.getRandomPracticeSet(5, category);
    this.runWritingSession(chars, words);
  },

  runWritingSession(chars, words) {
    const area = document.getElementById('writing-area');
    area.style.display = 'block';
    document.getElementById('write-cat-select').style.display = 'none';

    const updateCharInfo = (index) => {
      const word = words[Math.min(index, words.length - 1)];
      const infoEl = document.getElementById('writing-char-info');
      if (infoEl && word) {
        infoEl.innerHTML = `
          <div class="char-info-hanzi">${word.hanzi}</div>
          <div class="char-info-pinyin">${word.pinyin}</div>
          <div class="char-info-meaning">${word.meaning}</div>
          <button class="btn-audio-small" onclick="Audio.speakChinese('${word.hanzi}')">🔊</button>
        `;
      }
    };

    updateCharInfo(0);

    Writing.startPractice(chars, 'hanzi-writer-container', (summary) => {
      // Update write mastery for practiced words
      words.forEach(w => {
        const ws = Storage.getWordState(w.id);
        if (!ws.mastery) ws.mastery = { recognize: false, recall: false, write: false, listen: false };
        ws.mastery.write = true;
        ws.lastReviewed = Date.now();
        Storage.updateWordState(w.id, ws);
      });

      const resultEl = document.getElementById('writing-result');
      resultEl.innerHTML = `
        <div class="writing-summary">
          <h3>Session terminée !</h3>
          <div class="ws-stats">
            <div>Caractères : ${summary.total}</div>
            <div>Parfaits : ${summary.perfect}/${summary.total}</div>
            <div>XP gagnés : ${summary.totalXP}</div>
          </div>
          <button class="btn-rpg" onclick="App.renderWriteMenu()">Continuer</button>
        </div>
      `;

      if (summary.perfect === summary.total) {
        Audio.playQuestComplete();
        UI.showToast('Calligraphie parfaite !', 'success');
      }
    });
  },

  // ============================================================
  //  SKILL TREE
  // ============================================================
  renderSkillTree() {
    const el = document.getElementById('screen-skills');
    el.innerHTML = `<div id="skill-tree-content"></div>`;
    SkillTree.render('skill-tree-content');
  },

  // ============================================================
  //  FEATURE 10: ENHANCED PROFILE WITH PROGRESS TRACKING
  // ============================================================
  renderProfile() {
    const el = document.getElementById('screen-profile');
    const progress = Storage.getWordProgress();
    const allStates = HSK_DATA.map(w => ({ word: w, state: Storage.getWordState(w.id) }));
    const seen = allStates.filter(s => s.state.seen).length;
    const mastered = allStates.filter(s => s.state.mastered).length;
    const learning = allStates.filter(s => s.state.seen && !s.state.mastered).length;
    const dueCount = this.getDueWords().length;
    const accuracy = this.player.totalAttempts > 0
      ? Math.round((this.player.totalCorrect / this.player.totalAttempts) * 100)
      : 0;
    const combatData = Storage.getCombatData();
    const avatarStage = RPG.getAvatarStage(this.player.level);
    const avatarTitles = ['Voyageur', 'Lettré', 'Sage', 'Maître', 'Maître Dragon'];

    el.innerHTML = `
      <div class="profile-header">
        <div id="profile-avatar" class="profile-avatar"></div>
        <h2>${this.player.name}</h2>
        <div class="profile-title">${RPG.getTitle(this.player.level)} — Niv. ${this.player.level}</div>
        <div class="profile-evolution">
          <span class="evolution-label">Évolution :</span>
          <span class="evolution-stage">${avatarTitles[avatarStage]}</span>
        </div>
      </div>

      <div class="evolution-track">
        ${avatarTitles.map((title, i) => `
          <div class="evo-step ${i <= avatarStage ? 'evo-active' : 'evo-locked'}">
            <div class="evo-icon">${['🧒', '🧑', '🥷', '🧙', '🐉'][i]}</div>
            <div class="evo-name">${title}</div>
          </div>
          ${i < avatarTitles.length - 1 ? '<div class="evo-arrow">→</div>' : ''}
        `).join('')}
      </div>

      <div id="profile-xp" class="profile-xp"></div>

      <div class="profile-word-summary">
        <h3>Progression des mots</h3>
        <div class="word-summary-stats">
          <div class="ws-stat" onclick="App.showWordList('all')">
            <span class="ws-num">${HSK_DATA.length}</span>
            <span class="ws-lbl">Total</span>
          </div>
          <div class="ws-stat ws-mastered" onclick="App.showWordList('mastered')">
            <span class="ws-num">${mastered}</span>
            <span class="ws-lbl">Maîtrisés</span>
          </div>
          <div class="ws-stat ws-learning" onclick="App.showWordList('learning')">
            <span class="ws-num">${learning}</span>
            <span class="ws-lbl">En cours</span>
          </div>
          <div class="ws-stat ws-new" onclick="App.showWordList('new')">
            <span class="ws-num">${HSK_DATA.length - seen}</span>
            <span class="ws-lbl">Nouveaux</span>
          </div>
          <div class="ws-stat ws-due" onclick="App.showWordList('due')">
            <span class="ws-num">${dueCount}</span>
            <span class="ws-lbl">À réviser</span>
          </div>
        </div>
        <div class="word-summary-bar">
          <div class="wsb-fill wsb-mastered" style="width: ${(mastered / HSK_DATA.length) * 100}%"></div>
          <div class="wsb-fill wsb-learning" style="width: ${(learning / HSK_DATA.length) * 100}%"></div>
        </div>
      </div>

      <div class="profile-stats-section">
        <h3>Statistiques de combat</h3>
        <canvas id="radar-chart" width="280" height="280"></canvas>
      </div>

      <div class="profile-numbers">
        <div class="pn-row"><span class="pn-label">Mots vus</span><span class="pn-val">${seen} / ${HSK_DATA.length}</span></div>
        <div class="pn-row"><span class="pn-label">Mots maîtrisés (4 axes)</span><span class="pn-val">${mastered}</span></div>
        <div class="pn-row"><span class="pn-label">Combats gagnés</span><span class="pn-val">${combatData.totalVictories || 0} / ${combatData.totalFights || 0}</span></div>
        <div class="pn-row"><span class="pn-label">Boss vaincus</span><span class="pn-val">${(combatData.bossesDefeated || []).length} / ${REGIONS.length}</span></div>
        <div class="pn-row"><span class="pn-label">Quiz complétés</span><span class="pn-val">${this.player.quizzesDone}</span></div>
        <div class="pn-row"><span class="pn-label">Précision</span><span class="pn-val">${accuracy}%</span></div>
        <div class="pn-row"><span class="pn-label">XP total</span><span class="pn-val">${this.player.totalXp}</span></div>
        <div class="pn-row"><span class="pn-label">Points de compétence</span><span class="pn-val">${SkillTree.getSkillPoints()} 💎</span></div>
        <div class="pn-row"><span class="pn-label">Meilleure série</span><span class="pn-val">${this.player.streak.best} jours</span></div>
      </div>

      <div id="profile-streak" class="profile-streak"></div>

      <div class="profile-actions">
        <button class="btn-rpg btn-danger" onclick="App.confirmReset()">Réinitialiser</button>
      </div>
    `;

    UI.renderAvatar(document.getElementById('profile-avatar'), this.player.level);
    UI.renderXPBar(document.getElementById('profile-xp'), this.player);
    UI.renderStreak(document.getElementById('profile-streak'), this.player.streak);

    setTimeout(() => {
      UI.drawRadarChart('radar-chart', this.player.stats);
    }, 100);
  },

  // ============================================================
  //  FEATURE 10: WORD LIST WITH FILTER
  // ============================================================
  showWordList(filter) {
    const el = document.getElementById('screen-profile');
    const now = Date.now();

    let words = HSK_DATA.map(w => {
      const state = Storage.getWordState(w.id);
      let status = 'new';
      if (state.mastered) status = 'mastered';
      else if (state.seen) status = 'learning';
      const isDue = state.seen && state.nextReview && state.nextReview <= now;
      return { word: w, state, status, isDue };
    });

    // Filter
    if (filter === 'mastered') words = words.filter(w => w.status === 'mastered');
    else if (filter === 'learning') words = words.filter(w => w.status === 'learning');
    else if (filter === 'new') words = words.filter(w => w.status === 'new');
    else if (filter === 'due') words = words.filter(w => w.isDue);

    const filterLabels = {
      all: 'Tous les mots', mastered: 'Mots maîtrisés',
      learning: 'En apprentissage', new: 'Nouveaux mots', due: 'À réviser',
    };

    el.innerHTML = `
      <div class="screen-header">
        <button class="back-btn" onclick="App.renderProfile()">← Profil</button>
        <h2>${filterLabels[filter] || 'Mots'} (${words.length})</h2>
      </div>

      <div class="word-filter-chips">
        ${['all', 'mastered', 'learning', 'new', 'due'].map(f => `
          <button class="filter-chip ${f === filter ? 'filter-active' : ''}" onclick="App.showWordList('${f}')">${filterLabels[f]}</button>
        `).join('')}
      </div>

      <div class="word-list">
        ${words.map(({ word: w, state, status, isDue }) => `
          <div class="word-card word-${status}" onclick="App.showWordProgressDetail(${w.id})">
            <div class="word-hanzi">${w.hanzi}</div>
            <div class="word-info-col">
              <div class="word-pinyin">${w.pinyin}</div>
              <div class="word-meaning">${w.meaning}</div>
              <div class="word-mastery-icons">${UI.renderMasteryIcons(state.mastery)}</div>
            </div>
            <div class="word-status-col">
              ${isDue ? '<span class="due-badge">!</span>' : ''}
              <span>${status === 'mastered' ? '⭐' : status === 'learning' ? '📝' : '🆕'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  showWordProgressDetail(wordId) {
    const word = HSK_DATA.find(w => w.id === wordId);
    if (!word) return;
    const state = Storage.getWordState(wordId);
    const el = document.getElementById('screen-profile');
    const masteryHTML = UI.renderMasteryIcons(state.mastery);
    const status = state.mastered ? 'Maîtrisé' : state.seen ? 'En apprentissage' : 'Nouveau';
    const nextReview = state.nextReview ? new Date(state.nextReview).toLocaleDateString('fr-FR') : '-';

    el.innerHTML = `
      <div class="screen-header">
        <button class="back-btn" onclick="App.showWordList('all')">← Liste</button>
      </div>
      <div class="word-detail">
        <div class="detail-hanzi">${word.hanzi}</div>
        <div class="detail-pinyin">${word.pinyin}</div>
        <div class="detail-meaning">${word.meaning}</div>

        <div class="detail-mastery">${masteryHTML}</div>

        <button class="btn-audio" onclick="Audio.speakChinese('${word.hanzi}')">🔊 Écouter</button>

        <div class="detail-sentences">
          <div class="sentence-label">Exemples :</div>
          ${word.sentences.map(s => `
            <div class="detail-sentence-item">
              <div class="sentence-text">${s}</div>
              <button class="btn-audio-small" onclick="Audio.speakChinese('${s.replace(/'/g, "\\'")}')">🔊</button>
            </div>
          `).join('')}
        </div>

        <div class="word-progress-stats">
          <h3>Statistiques</h3>
          <div class="pn-row"><span class="pn-label">Statut</span><span class="pn-val">${status}</span></div>
          <div class="pn-row"><span class="pn-label">Bonnes réponses</span><span class="pn-val">${state.timesCorrect}</span></div>
          <div class="pn-row"><span class="pn-label">Erreurs</span><span class="pn-val">${state.timesWrong}</span></div>
          <div class="pn-row"><span class="pn-label">Facilité (ease)</span><span class="pn-val">${state.ease.toFixed(1)}</span></div>
          <div class="pn-row"><span class="pn-label">Prochaine révision</span><span class="pn-val">${nextReview}</span></div>
        </div>

        <div class="detail-writing">
          <h3>Ordre des traits</h3>
          <div id="word-hanzi-writer" class="hanzi-writer-box"></div>
          <div class="writer-controls">
            <button class="btn-rpg" onclick="App.animateWordStrokesProfile('${word.hanzi}')">▶ Animer</button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      Writing.showLearnMode(word.hanzi[0], 'word-hanzi-writer');
    }, 100);
  },

  animateWordStrokesProfile(hanzi) {
    Writing.showLearnMode(hanzi[0], 'word-hanzi-writer');
    setTimeout(() => Writing.animateCharacter(), 200);
  },

  confirmReset() {
    if (confirm('Réinitialiser toute la progression ? Cette action est irréversible !')) {
      Storage.clearAll();
      this.player = Storage.getPlayer();
      this.navigate('home');
      UI.showToast('Progression réinitialisée', 'info');
    }
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
