// HanziQuest — HanziWriter Integration

const Writing = {
  writer: null,
  currentChar: null,
  container: null,
  mode: 'learn', // 'learn' or 'quiz'
  quizResults: [],
  charQueue: [],
  currentIndex: 0,
  onComplete: null,

  // Initialize with a container element
  init(containerId) {
    this.container = document.getElementById(containerId);
  },

  // Show character in learn mode (stroke animation)
  showLearnMode(char, containerId) {
    this.currentChar = char;
    this.mode = 'learn';
    const el = document.getElementById(containerId);
    el.innerHTML = '';

    try {
      this.writer = HanziWriter.create(containerId, char, {
        width: 280,
        height: 280,
        padding: 15,
        showOutline: true,
        showCharacter: false,
        strokeColor: '#e0c070',
        outlineColor: '#3a3540',
        drawingColor: '#f0d090',
        radicalColor: '#c08040',
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 300,
        highlightOnComplete: true,
        drawingWidth: 8,
        highlightColor: '#70d080',
      });
    } catch (e) {
      el.innerHTML = `<div class="writing-fallback"><span class="big-char">${char}</span><p>HanziWriter non disponible</p></div>`;
    }
  },

  // Animate all strokes
  animateCharacter(onComplete) {
    if (!this.writer) return;
    this.writer.animateCharacter({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
  },

  // Show character in quiz mode (user draws)
  showQuizMode(char, containerId, onCorrect, onMistake, onComplete) {
    this.currentChar = char;
    this.mode = 'quiz';
    const el = document.getElementById(containerId);
    el.innerHTML = '';

    try {
      this.writer = HanziWriter.create(containerId, char, {
        width: 280,
        height: 280,
        padding: 15,
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

      this.writer.quiz({
        onCorrectStroke: (data) => {
          Audio.playStrokeCorrect();
          if (onCorrect) onCorrect(data);
        },
        onMistake: (data) => {
          if (onMistake) onMistake(data);
        },
        onComplete: (summary) => {
          const result = {
            char,
            totalMistakes: summary.totalMistakes,
            strokeCount: summary.totalStrokes || 0,
            perfect: summary.totalMistakes === 0,
          };
          this.quizResults.push(result);
          if (onComplete) onComplete(result);
        },
      });
    } catch (e) {
      el.innerHTML = `<div class="writing-fallback"><span class="big-char">${char}</span><p>HanziWriter non disponible pour le quiz</p></div>`;
      if (onComplete) onComplete({ char, totalMistakes: 0, strokeCount: 0, perfect: true });
    }
  },

  // Start a writing practice session with multiple words (writes ALL chars per word)
  startPractice(chars, containerId, onFinish, words = null) {
    // Check for words set externally (workaround for inline callbacks)
    if (!words && this._practiceWords) {
      words = this._practiceWords;
      this._practiceWords = null;
    }
    // If words provided, build a queue of {char, wordHanzi, wordPinyin, wordMeaning} for context
    this.wordQueue = [];
    if (words && words.length > 0) {
      words.forEach(w => {
        const wordChars = [...w.hanzi];
        wordChars.forEach((c, i) => {
          this.wordQueue.push({
            char: c,
            wordHanzi: w.hanzi,
            wordPinyin: w.pinyin,
            wordMeaning: w.meaning,
            charIndex: i,
            totalChars: wordChars.length,
          });
        });
      });
    } else {
      // Fallback: just single chars
      this.wordQueue = chars.map(c => ({ char: c, wordHanzi: c, wordPinyin: '', wordMeaning: '', charIndex: 0, totalChars: 1 }));
    }

    this.currentIndex = 0;
    this.quizResults = [];
    this.onComplete = onFinish;
    this.charQueue = this.wordQueue.map(q => q.char);
    this.practiceNextChar(containerId);
  },

  practiceNextChar(containerId) {
    if (this.currentIndex >= this.wordQueue.length) {
      this.finishPractice();
      return;
    }

    const entry = this.wordQueue[this.currentIndex];
    this.currentIndex++;

    // Update progress display
    const progressEl = document.getElementById('writing-progress');
    if (progressEl) {
      progressEl.textContent = `${this.currentIndex} / ${this.wordQueue.length}`;
    }

    // Show word context (which char we're writing in the word)
    const contextEl = document.getElementById('writing-word-context');
    if (contextEl && entry.totalChars > 1) {
      const highlighted = [...entry.wordHanzi].map((c, i) => 
        i === entry.charIndex 
          ? `<span style="color:var(--gold);font-size:1.3em;font-weight:bold;">${c}</span>` 
          : `<span style="opacity:0.4;">${c}</span>`
      ).join('');
      contextEl.innerHTML = `
        <div style="text-align:center;margin-bottom:8px;">
          <div style="font-size:24px;">${highlighted}</div>
          <div style="font-size:14px;color:var(--text-secondary);">${entry.wordPinyin} — ${entry.wordMeaning}</div>
          <div style="font-size:12px;color:var(--text-muted);">Caractère ${entry.charIndex + 1}/${entry.totalChars}</div>
        </div>
      `;
    } else if (contextEl) {
      contextEl.innerHTML = `
        <div style="text-align:center;margin-bottom:8px;">
          <div style="font-size:14px;color:var(--text-secondary);">${entry.wordPinyin} — ${entry.wordMeaning}</div>
        </div>
      `;
    }

    this.showQuizMode(entry.char, containerId,
      null, null,
      (result) => {
        setTimeout(() => this.practiceNextChar(containerId), 800);
      }
    );
  },

  finishPractice() {
    const player = Storage.getPlayer();
    let totalXP = 0;

    this.quizResults.forEach(r => {
      const xpAmount = r.perfect ? RPG.XP_REWARDS.writingPerfect : RPG.XP_REWARDS.writingCorrect;
      const result = RPG.awardXP(player, xpAmount);
      totalXP += result.xpGained;
      RPG.updateStats(player, 'writing', true);
    });

    RPG.updateQuestProgress('writing', this.quizResults.length);

    if (this.onComplete) {
      this.onComplete({
        results: this.quizResults,
        totalXP,
        total: this.charQueue.length,
        perfect: this.quizResults.filter(r => r.perfect).length,
      });
    }
  },

  // Get characters from a word (for multi-char words)
  getCharsFromWord(word) {
    return [...word.hanzi];
  },

  // Get random practice set
  getRandomPracticeSet(count = 5, categoryFilter = null) {
    let pool = [...HSK_DATA];
    if (categoryFilter) {
      pool = pool.filter(w => w.category === categoryFilter);
    }

    Quiz.shuffle(pool);
    const selected = pool.slice(0, count);
    const chars = [];

    selected.forEach(word => {
      const wordChars = this.getCharsFromWord(word);
      wordChars.forEach(c => {
        if (!chars.includes(c)) chars.push(c);
      });
    });

    return { chars: chars.slice(0, count), words: selected };
  },
};
