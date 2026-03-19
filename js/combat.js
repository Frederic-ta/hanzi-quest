// HanziQuest — Combat System (Wizard Duel)

const Combat = {
  active: false,
  regionId: null,
  enemy: null,
  playerHP: 100,
  playerMaxHP: 100,
  enemyHP: 0,
  enemyMaxHP: 0,
  currentWord: null,
  wordPool: [],
  wordIndex: 0,
  combo: 0,
  maxCombo: 0,
  totalDamage: 0,
  spellsCast: 0,
  timerInterval: null,
  timeLeft: 0,
  timeMax: 15,
  isBossFight: false,
  onCombatEnd: null,
  phase: 'intro', // intro, player_turn, enemy_turn, victory, defeat
  roundType: 'qcm', // 'qcm' or 'writing'
  writingWriter: null,

  // Calculate player max HP from level + stats
  calcPlayerHP(player) {
    return 80 + player.level * 10 + player.stats.defense * 2;
  },

  // Calculate player spell damage
  calcSpellDamage(player, timeBonus, combo) {
    const base = 10 + player.level * 2 + player.stats.attack;
    const comboMultiplier = 1 + Math.min(combo, 10) * 0.15;
    const timeMult = 1 + timeBonus * 0.5; // 0-1 bonus from timer
    return Math.round(base * comboMultiplier * timeMult);
  },

  // Calculate enemy damage to player
  calcEnemyDamage(enemyAttack, player) {
    const defense = Math.min(player.stats.defense * 0.5, enemyAttack * 0.6);
    return Math.max(3, Math.round(enemyAttack - defense + (Math.random() * 4 - 2)));
  },

  // Start a combat encounter
  start(regionId, enemy, onEnd) {
    this.active = true;
    this.regionId = regionId;
    this.enemy = enemy;
    this.isBossFight = enemy.isBoss || false;
    this.onCombatEnd = onEnd;

    const player = Storage.getPlayer();
    this.playerMaxHP = this.calcPlayerHP(player);
    this.playerHP = this.playerMaxHP;
    this.enemyMaxHP = enemy.hp;
    this.enemyHP = enemy.hp;
    this.combo = 0;
    this.maxCombo = 0;
    this.totalDamage = 0;
    this.spellsCast = 0;
    this.wordIndex = 0;

    // Build word pool from region
    this.wordPool = getRegionWords(regionId);
    Quiz.shuffle(this.wordPool);
    if (this.wordPool.length === 0) this.wordPool = [...HSK_DATA];

    this.phase = 'intro';
    this.renderCombat();
  },

  // Get next word for spell casting
  getNextWord() {
    if (this.wordIndex >= this.wordPool.length) {
      Quiz.shuffle(this.wordPool);
      this.wordIndex = 0;
    }
    this.currentWord = this.wordPool[this.wordIndex++];
    return this.currentWord;
  },

  // Choose round type: writing or QCM
  chooseRoundType() {
    const writingChance = this.isBossFight ? 0.6 : 0.4;
    return Math.random() < writingChance ? 'writing' : 'qcm';
  },

  // Clean up any active HanziWriter instance
  cleanupWriter() {
    if (this.writingWriter) {
      try { this.writingWriter.cancelQuiz(); } catch (e) {}
      this.writingWriter = null;
    }
  },

  // Start the player's turn
  startPlayerTurn() {
    this.phase = 'player_turn';
    this.cleanupWriter();
    const word = this.getNextWord();
    this.roundType = this.chooseRoundType();

    if (this.roundType === 'writing') {
      this.startWritingRound(word);
    } else {
      // QCM round
      const pool = this.wordPool.length > 3 ? this.wordPool : HSK_DATA;
      const distractors = Quiz.getDistractors(word, pool, 3);
      const options = Quiz.shuffle([
        word.meaning,
        ...distractors.map(d => d.meaning)
      ]);

      this.timeMax = this.isBossFight ? 10 : 15;
      this.timeLeft = this.timeMax;

      this.renderPlayerTurn(word, options);
      this.startTimer();
    }
  },

  // === WRITING ROUND ===
  startWritingRound(word) {
    this.timeMax = this.isBossFight ? 25 : 35;
    this.timeLeft = this.timeMax;

    const char = word.hanzi[0];
    this.renderWritingRound(word, char);
    this.startTimer();

    setTimeout(() => this.initCombatWriter(char), 100);
  },

  renderWritingRound(word, char) {
    const challengeEl = document.getElementById('combat-challenge');
    const comboEl = document.getElementById('combat-combo');

    if (comboEl) {
      comboEl.innerHTML = this.combo > 0 ? `<span class="combo-text">Combo x${this.combo}</span>` : '';
    }

    if (challengeEl) {
      challengeEl.innerHTML = `
        <div class="combat-spell-prompt">
          <div class="spell-instruction">Trace le caractère</div>
          <div class="spell-meaning-prompt">${word.meaning}</div>
          <div class="spell-pinyin">${word.pinyin}</div>
        </div>
        <div id="combat-hanzi-writer" class="combat-hanzi-writer"></div>
        <button class="btn-rpg btn-secondary combat-skip-btn" onclick="Combat.skipWriting()">Passer</button>
      `;
    }
  },

  initCombatWriter(char) {
    try {
      this.writingWriter = HanziWriter.create('combat-hanzi-writer', char, {
        width: 180,
        height: 180,
        padding: 10,
        showOutline: true,
        showCharacter: false,
        showHintAfterMisses: 3,
        strokeColor: '#e0c070',
        outlineColor: '#3a3540',
        drawingColor: '#f0d090',
        highlightColor: '#70d080',
        drawingWidth: 8,
        highlightOnComplete: true,
      });

      this.writingWriter.quiz({
        onCorrectStroke: () => {
          Audio.playStrokeCorrect();
        },
        onMistake: () => {},
        onComplete: (summary) => {
          this.onWritingComplete(summary);
        },
      });
    } catch (e) {
      // HanziWriter can't render this char — treat as correct
      this.onWritingComplete({ totalMistakes: 0 });
    }
  },

  onWritingComplete(summary) {
    if (this.phase !== 'player_turn') return;
    this.stopTimer();
    this.cleanupWriter();

    const perfect = summary.totalMistakes === 0;

    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.spellsCast++;

    const player = Storage.getPlayer();
    const timeBonus = Math.max(0, this.timeLeft / this.timeMax);
    let damage = this.calcSpellDamage(player, timeBonus, this.combo);

    // Bonus damage for perfect stroke order
    if (perfect) {
      damage = Math.round(damage * 1.5);
    }

    this.totalDamage += damage;
    this.enemyHP = Math.max(0, this.enemyHP - damage);

    // Update word progress (write axis - combat writing tests writing)
    const wordState = Storage.getWordState(this.currentWord.id);
    const quality = perfect ? 5 : 4;
    const newState = RPG.sm2(wordState, quality, 'write');
    Storage.updateWordState(this.currentWord.id, newState);

    RPG.awardXP(player, RPG.XP_REWARDS.correctAnswer);
    RPG.updateStats(player, 'writing', true);

    this.showSpellEffect(damage, true, perfect);
    Audio.playCorrect();

    setTimeout(() => {
      if (this.enemyHP <= 0) {
        this.onVictory();
      } else {
        this.startEnemyTurn();
      }
    }, 1200);
  },

  skipWriting() {
    if (this.phase !== 'player_turn') return;
    this.stopTimer();
    this.cleanupWriter();

    this.combo = 0;
    this.phase = 'enemy_turn';

    // Skip: mild penalty (quality 2), no harsh SRS impact
    const wordState = Storage.getWordState(this.currentWord.id);
    const newState = RPG.sm2(wordState, 2);
    Storage.updateWordState(this.currentWord.id, newState);

    Audio.playWrong();
    this.showSpellEffect(0, false, false);

    setTimeout(() => {
      this.enemyAttacks();
    }, 800);
  },

  // Timer
  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;
      this.updateTimerDisplay();
      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.onWrongAnswer();
      }
    }, 100);
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  updateTimerDisplay() {
    const bar = document.getElementById('combat-timer-fill');
    const text = document.getElementById('combat-timer-text');
    if (bar) {
      const pct = Math.max(0, (this.timeLeft / this.timeMax) * 100);
      bar.style.width = pct + '%';
      bar.style.background = this.timeLeft < 4 ? 'var(--red)' :
                             this.timeLeft < 7 ? 'var(--gold)' : 'var(--green)';
    }
    if (text) text.textContent = Math.ceil(Math.max(0, this.timeLeft)) + 's';
  },

  // Player submits an answer
  submitAnswer(answer) {
    if (this.phase !== 'player_turn') return;
    this.stopTimer();

    const correct = answer === this.currentWord.meaning;

    if (correct) {
      this.onCorrectAnswer();
    } else {
      this.onWrongAnswer();
    }
  },

  onCorrectAnswer() {
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.spellsCast++;

    const player = Storage.getPlayer();
    const timeBonus = Math.max(0, this.timeLeft / this.timeMax);
    const damage = this.calcSpellDamage(player, timeBonus, this.combo);
    this.totalDamage += damage;
    this.enemyHP = Math.max(0, this.enemyHP - damage);

    // Update word progress (recognize axis for QCM combat)
    const wordState = Storage.getWordState(this.currentWord.id);
    const newState = RPG.sm2(wordState, 4, 'recognize');
    Storage.updateWordState(this.currentWord.id, newState);

    // Award XP for correct
    RPG.awardXP(player, RPG.XP_REWARDS.correctAnswer);
    RPG.updateStats(player, 'vocab', true);

    // Show spell effect
    this.showSpellEffect(damage, true, timeBonus > 0.5);

    Audio.playCorrect();

    setTimeout(() => {
      if (this.enemyHP <= 0) {
        this.onVictory();
      } else {
        // Small delay then enemy turn
        this.startEnemyTurn();
      }
    }, 1200);
  },

  onWrongAnswer() {
    this.combo = 0;
    this.phase = 'enemy_turn';
    this.cleanupWriter();

    // Update word progress (wrong - no axis update)
    const wordState = Storage.getWordState(this.currentWord.id);
    const newState = RPG.sm2(wordState, 1, null);
    Storage.updateWordState(this.currentWord.id, newState);

    Audio.playWrong();

    // Show failed spell
    this.showSpellEffect(0, false, false);

    // Enemy attacks immediately
    setTimeout(() => {
      this.enemyAttacks();
    }, 800);
  },

  startEnemyTurn() {
    this.phase = 'enemy_turn';
    // 30% chance enemy attacks even on correct answer (boss: 50%)
    const attackChance = this.isBossFight ? 0.5 : 0.3;
    if (Math.random() < attackChance) {
      setTimeout(() => this.enemyAttacks(), 600);
    } else {
      setTimeout(() => this.startPlayerTurn(), 600);
    }
  },

  enemyAttacks() {
    const player = Storage.getPlayer();
    const damage = this.calcEnemyDamage(this.enemy.attack, player);
    this.playerHP = Math.max(0, this.playerHP - damage);

    this.showEnemyAttack(damage);

    Audio.playTone(150, 0.3, 'sawtooth', 0.2);

    setTimeout(() => {
      if (this.playerHP <= 0) {
        this.onDefeat();
      } else {
        this.startPlayerTurn();
      }
    }, 1200);
  },

  // === SPELL EFFECTS ===
  showSpellEffect(damage, success, critical) {
    const effectArea = document.getElementById('combat-effect-area');
    if (!effectArea) return;

    if (success) {
      const critText = critical ? ' CRITIQUE !' : '';
      effectArea.innerHTML = `
        <div class="spell-effect spell-hit">
          <div class="spell-icon">${critical ? '💥' : '✨'}</div>
          <div class="spell-damage">-${damage} PV${critText}</div>
          ${this.combo > 1 ? `<div class="spell-combo">Combo x${this.combo} !</div>` : ''}
        </div>
      `;
      // Shake enemy
      const enemyEl = document.getElementById('combat-enemy-sprite');
      if (enemyEl) {
        enemyEl.classList.add('enemy-hit');
        setTimeout(() => enemyEl.classList.remove('enemy-hit'), 500);
      }
      // Screen shake on critical
      if (critical) {
        const arena = document.getElementById('combat-arena');
        if (arena) UI.shake(arena, 8);
      }
    } else {
      effectArea.innerHTML = `
        <div class="spell-effect spell-miss">
          <div class="spell-icon">💨</div>
          <div class="spell-damage">RATÉ !</div>
          <div class="spell-combo">Le sort s'est dissipé...</div>
        </div>
      `;
    }

    // Update HP bars
    this.updateHPBars();

    setTimeout(() => { if (effectArea) effectArea.innerHTML = ''; }, 1000);
  },

  showEnemyAttack(damage) {
    const effectArea = document.getElementById('combat-effect-area');
    if (!effectArea) return;

    effectArea.innerHTML = `
      <div class="spell-effect enemy-attack-effect">
        <div class="spell-icon">⚡</div>
        <div class="spell-damage enemy-dmg">-${damage} PV</div>
        <div class="spell-combo">${this.enemy.name} attaque !</div>
      </div>
    `;

    // Shake player area
    const playerEl = document.getElementById('combat-player-sprite');
    if (playerEl) {
      playerEl.classList.add('player-hit');
      setTimeout(() => playerEl.classList.remove('player-hit'), 500);
    }

    const arena = document.getElementById('combat-arena');
    if (arena) UI.shake(arena, 5);

    this.updateHPBars();

    setTimeout(() => { if (effectArea) effectArea.innerHTML = ''; }, 1000);
  },

  updateHPBars() {
    const playerBar = document.getElementById('combat-player-hp-fill');
    const enemyBar = document.getElementById('combat-enemy-hp-fill');
    const playerText = document.getElementById('combat-player-hp-text');
    const enemyText = document.getElementById('combat-enemy-hp-text');

    if (playerBar) {
      const pct = Math.max(0, (this.playerHP / this.playerMaxHP) * 100);
      playerBar.style.width = pct + '%';
      playerBar.style.background = pct < 25 ? 'var(--red)' : pct < 50 ? 'var(--gold)' : 'var(--green)';
    }
    if (enemyBar) {
      const pct = Math.max(0, (this.enemyHP / this.enemyMaxHP) * 100);
      enemyBar.style.width = pct + '%';
      enemyBar.style.background = pct < 25 ? 'var(--red)' : pct < 50 ? 'var(--gold)' : '#e05080';
    }
    if (playerText) playerText.textContent = `${Math.max(0, this.playerHP)} / ${this.playerMaxHP}`;
    if (enemyText) enemyText.textContent = `${Math.max(0, this.enemyHP)} / ${this.enemyMaxHP}`;
  },

  // === VICTORY / DEFEAT ===
  onVictory() {
    this.phase = 'victory';
    this.stopTimer();
    this.active = false;

    const player = Storage.getPlayer();
    const xpReward = this.enemy.xp || 50;
    const result = RPG.awardXP(player, xpReward);

    // Boss defeat tracking
    if (this.isBossFight) {
      const combat = Storage.getCombatData();
      if (!combat.bossesDefeated) combat.bossesDefeated = [];
      if (!combat.bossesDefeated.includes(this.regionId)) {
        combat.bossesDefeated.push(this.regionId);
      }
      Storage.saveCombatData(combat);
    }

    // Combat stats tracking
    const combatData = Storage.getCombatData();
    combatData.totalFights = (combatData.totalFights || 0) + 1;
    combatData.totalVictories = (combatData.totalVictories || 0) + 1;
    Storage.saveCombatData(combatData);

    Storage.savePlayer(player);

    this.renderVictory(xpReward, result);

    // Sound
    Audio.playQuestComplete();

    // Level up check
    if (result.leveledUp) {
      setTimeout(() => UI.showLevelUp(result.newLevel), 1500);
    }
  },

  onDefeat() {
    this.phase = 'defeat';
    this.stopTimer();
    this.active = false;

    // Still award partial XP
    const player = Storage.getPlayer();
    const partialXP = Math.round((this.enemy.xp || 50) * 0.3);
    RPG.awardXP(player, partialXP);

    const combatData = Storage.getCombatData();
    combatData.totalFights = (combatData.totalFights || 0) + 1;
    Storage.saveCombatData(combatData);

    this.renderDefeat(partialXP);

    // Defeat sound
    Audio.playTone(200, 0.4, 'sawtooth', 0.25);
    setTimeout(() => Audio.playTone(120, 0.6, 'sawtooth', 0.2), 400);
  },

  // === RENDER METHODS ===
  renderCombat() {
    const el = document.getElementById('screen-combat');
    if (!el) return;

    // Show combat screen
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    document.querySelector('.bottom-nav').style.display = 'none';

    const region = getRegion(this.regionId);
    const bossClass = this.isBossFight ? 'boss-intro' : '';

    el.innerHTML = `
      <div class="combat-intro ${bossClass}" id="combat-intro">
        <div class="combat-intro-bg" style="${region.bgGradient}"></div>
        <div class="combat-encounter-text">${this.isBossFight ? 'COMBAT DE BOSS !' : 'COMBAT !'}</div>
        <div class="combat-enemy-intro">
          <div class="enemy-intro-icon">${this.enemy.icon}</div>
          <div class="enemy-intro-name">${this.enemy.name}</div>
          <div class="enemy-intro-namezh">${this.enemy.nameZh || ''}</div>
          <div class="enemy-intro-dialogue">"${Array.isArray(this.enemy.dialogue) ? this.enemy.dialogue[0] : this.enemy.dialogue}"</div>
        </div>
        <button class="btn-rpg combat-start-btn" onclick="Combat.beginFight()">Combattre !</button>
      </div>
    `;

    // Dramatic intro sound
    Audio.playTone(150, 0.3, 'sawtooth', 0.2);
    setTimeout(() => Audio.playTone(200, 0.2, 'square', 0.15), 300);
    if (this.isBossFight) {
      setTimeout(() => Audio.playTone(100, 0.5, 'sawtooth', 0.25), 600);
    }
  },

  beginFight() {
    const el = document.getElementById('screen-combat');
    const region = getRegion(this.regionId);
    const player = Storage.getPlayer();
    const stage = RPG.getAvatarStage(player.level);
    const avatars = ['🧒', '🧑', '🥷', '🧙', '🐉'];

    el.innerHTML = `
      <div class="combat-arena" id="combat-arena" style="${region.bgGradient}">
        <div class="combat-hud">
          <div class="combat-hud-player">
            <div class="combat-hud-name">${player.name} <span class="combat-lvl">Niv.${player.level}</span></div>
            <div class="combat-hp-bar">
              <div class="combat-hp-fill player-hp" id="combat-player-hp-fill" style="width:100%"></div>
            </div>
            <div class="combat-hp-text" id="combat-player-hp-text">${this.playerHP} / ${this.playerMaxHP}</div>
          </div>
          <div class="combat-vs">VS</div>
          <div class="combat-hud-enemy">
            <div class="combat-hud-name">${this.enemy.name} ${this.isBossFight ? '👑' : ''}</div>
            <div class="combat-hp-bar">
              <div class="combat-hp-fill enemy-hp" id="combat-enemy-hp-fill" style="width:100%"></div>
            </div>
            <div class="combat-hp-text" id="combat-enemy-hp-text">${this.enemyHP} / ${this.enemyMaxHP}</div>
          </div>
        </div>

        <div class="combat-sprites">
          <div class="combat-sprite player-sprite" id="combat-player-sprite">
            <div class="sprite-icon">${avatars[stage]}</div>
          </div>
          <div id="combat-effect-area" class="combat-effect-area"></div>
          <div class="combat-sprite enemy-sprite" id="combat-enemy-sprite">
            <div class="sprite-icon">${this.enemy.icon}</div>
            ${this.isBossFight ? '<div class="boss-crown">👑</div>' : ''}
          </div>
        </div>

        <div class="combat-combo" id="combat-combo"></div>

        <div class="combat-timer" id="combat-timer">
          <div class="combat-timer-bar">
            <div class="combat-timer-fill" id="combat-timer-fill" style="width:100%"></div>
          </div>
          <div class="combat-timer-text" id="combat-timer-text">${this.timeMax}s</div>
        </div>

        <div class="combat-challenge" id="combat-challenge">
          <div class="combat-loading">Prépare ton sort...</div>
        </div>

        <div class="combat-word-info" id="combat-word-info"></div>
      </div>
    `;

    // Start first turn
    setTimeout(() => this.startPlayerTurn(), 800);
  },

  renderPlayerTurn(word, options) {
    const challengeEl = document.getElementById('combat-challenge');
    const wordInfoEl = document.getElementById('combat-word-info');
    const comboEl = document.getElementById('combat-combo');

    if (comboEl) {
      comboEl.innerHTML = this.combo > 0 ? `<span class="combo-text">Combo x${this.combo}</span>` : '';
    }

    if (challengeEl) {
      challengeEl.innerHTML = `
        <div class="combat-spell-prompt">
          <div class="spell-word">${word.hanzi}</div>
          <div class="spell-pinyin">${word.pinyin}</div>
          <div class="spell-instruction">Quel est le sens de ce caractère ?</div>
        </div>
        <div class="combat-options">
          ${options.map((opt, i) => `
            <button class="combat-option" onclick="Combat.submitAnswer('${opt.replace(/'/g, "\\'")}')">
              <span class="co-letter">${['A','B','C','D'][i]}</span>
              <span class="co-text">${opt}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    // Speak the word
    setTimeout(() => Audio.speakChinese(word.hanzi), 200);
  },

  renderVictory(xpReward, result) {
    const el = document.getElementById('screen-combat');
    const isBoss = this.isBossFight;
    const bossDefeatText = isBoss && this.enemy.defeatDialogue ? this.enemy.defeatDialogue : '';

    el.innerHTML = `
      <div class="combat-result victory">
        <div class="result-banner">VICTOIRE !</div>
        <div class="result-enemy-icon">${this.enemy.icon}</div>
        <div class="result-enemy-name">${this.enemy.name} vaincu !</div>
        ${bossDefeatText ? `<div class="boss-defeat-text">"${bossDefeatText}"</div>` : ''}

        <div class="combat-rewards">
          <div class="reward-item"><span class="reward-icon">⭐</span> +${xpReward} XP</div>
          <div class="reward-item"><span class="reward-icon">⚔️</span> ${this.spellsCast} sorts lancés</div>
          <div class="reward-item"><span class="reward-icon">🔥</span> Combo max: x${this.maxCombo}</div>
          <div class="reward-item"><span class="reward-icon">💥</span> ${this.totalDamage} dégâts totaux</div>
        </div>

        <div class="combat-result-actions">
          <button class="btn-rpg" onclick="Combat.exitCombat()">Continuer</button>
          ${!isBoss ? '<button class="btn-rpg btn-secondary" onclick="Combat.fightAgain()">Encore !</button>' : ''}
        </div>
      </div>
    `;
  },

  renderDefeat(partialXP) {
    const el = document.getElementById('screen-combat');

    el.innerHTML = `
      <div class="combat-result defeat">
        <div class="result-banner defeat-banner">DÉFAITE...</div>
        <div class="result-enemy-icon">${this.enemy.icon}</div>
        <div class="result-enemy-name">${this.enemy.name} t'a vaincu !</div>
        <div class="defeat-encourage">Ne perds pas espoir ! Apprends plus de mots et reviens plus fort !</div>

        <div class="combat-rewards">
          <div class="reward-item"><span class="reward-icon">⭐</span> +${partialXP} XP (consolation)</div>
          <div class="reward-item"><span class="reward-icon">⚔️</span> ${this.spellsCast} sorts lancés</div>
        </div>

        <div class="combat-result-actions">
          <button class="btn-rpg" onclick="Combat.exitCombat()">Retour</button>
          <button class="btn-rpg btn-secondary" onclick="Combat.fightAgain()">Réessayer</button>
        </div>
      </div>
    `;
  },

  exitCombat() {
    try {
      document.querySelector('.bottom-nav').style.display = 'flex';
      // Reset combat state
      this.active = false;
      this.stopTimer();
      if (this.onCombatEnd) {
        const callback = this.onCombatEnd;
        const won = this.phase === 'victory';
        this.onCombatEnd = null; // prevent double-call
        callback(won);
      } else {
        App.navigate('home');
      }
    } catch (e) {
      console.error('exitCombat error:', e);
      // Fallback: force navigate home
      document.querySelector('.bottom-nav').style.display = 'flex';
      App.navigate('home');
    }
  },

  fightAgain() {
    const enemy = this.isBossFight ? getRegionBoss(this.regionId) : getRandomEnemy(this.regionId);
    this.start(this.regionId, enemy, this.onCombatEnd);
  },
};
