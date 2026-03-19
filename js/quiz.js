// HanziQuest — Quiz Engine

const Quiz = {
  currentQuiz: null,
  currentQuestion: 0,
  score: 0,
  answers: [],

  QUIZ_TYPES: {
    meaningToChar: {
      name: "Sens → Caractère",
      description: "Trouve le bon caractère",
      icon: "🎯",
      stat: 'vocab',
    },
    charToMeaning: {
      name: "Caractère → Sens",
      description: "Trouve la bonne traduction",
      icon: "📖",
      stat: 'vocab',
    },
    pinyinToChar: {
      name: "Pinyin → Caractère",
      description: "Trouve le bon caractère à partir du pinyin",
      icon: "🔤",
      stat: 'vocab',
    },
    listenPick: {
      name: "Écoute → Choix",
      description: "Écoute et trouve la bonne réponse",
      icon: "👂",
      stat: 'listening',
    },
    listenPinyin: {
      name: "Écoute → Pinyin",
      description: "Écoute et écris le pinyin",
      icon: "✍️",
      stat: 'listening',
    },
    sentenceCompletion: {
      name: "Compléter la phrase",
      description: "Trouve le mot manquant",
      icon: "📝",
      stat: 'defense',
    },
  },

  // Map quiz types to mastery axes
  AXIS_MAP: {
    charToMeaning: 'recognize',
    meaningToChar: 'recall',
    pinyinToChar: 'recognize',
    listenPick: 'listen',
    listenPinyin: 'listen',
    sentenceCompletion: 'recognize',
  },

  // Generate a quiz of given type and size
  generate(type, count = 10, categoryFilter = null) {
    let pool = [...HSK_DATA];
    if (categoryFilter) {
      pool = pool.filter(w => w.category === categoryFilter);
    }

    // Prioritize words due for review
    const progress = Storage.getWordProgress();
    const now = Date.now();

    pool.sort((a, b) => {
      const pa = progress[a.id];
      const pb = progress[b.id];
      const aScore = pa ? (pa.nextReview <= now ? -1000 : pa.ease) : -500;
      const bScore = pb ? (pb.nextReview <= now ? -1000 : pb.ease) : -500;
      return aScore - bScore;
    });

    // Take top `count` words but shuffle them
    const selected = pool.slice(0, Math.min(count, pool.length));
    this.shuffle(selected);

    const questions = selected.map(word => this.createQuestion(type, word, pool));

    this.currentQuiz = {
      type,
      questions,
      total: questions.length,
      startTime: Date.now(),
    };
    this.currentQuestion = 0;
    this.score = 0;
    this.answers = [];

    return this.currentQuiz;
  },

  // Create a single question
  createQuestion(type, word, pool) {
    const distractors = this.getDistractors(word, pool, 3);

    switch (type) {
      case 'meaningToChar':
        return {
          word,
          prompt: word.meaning,
          correctAnswer: word.hanzi,
          options: this.shuffle([
            word.hanzi,
            ...distractors.map(d => d.hanzi)
          ]),
          type: 'multiple',
        };

      case 'charToMeaning':
        return {
          word,
          prompt: word.hanzi,
          promptPinyin: word.pinyin,
          correctAnswer: word.meaning,
          options: this.shuffle([
            word.meaning,
            ...distractors.map(d => d.meaning)
          ]),
          type: 'multiple',
        };

      case 'pinyinToChar':
        return {
          word,
          prompt: word.pinyin,
          correctAnswer: word.hanzi,
          options: this.shuffle([
            word.hanzi,
            ...distractors.map(d => d.hanzi)
          ]),
          type: 'multiple',
        };

      case 'listenPick':
        return {
          word,
          prompt: '🔊 Écoute...',
          audioText: word.hanzi,
          correctAnswer: word.meaning,
          options: this.shuffle([
            word.meaning,
            ...distractors.map(d => d.meaning)
          ]),
          type: 'listen_multiple',
        };

      case 'listenPinyin':
        return {
          word,
          prompt: '🔊 Écoute et écris le pinyin',
          audioText: word.hanzi,
          correctAnswer: word.pinyin.toLowerCase().replace(/\s/g, ''),
          type: 'listen_input',
        };

      case 'sentenceCompletion': {
        const sentence = word.sentences[0];
        if (!sentence || !sentence.includes(word.hanzi)) {
          return this.createQuestion('charToMeaning', word, pool);
        }
        const blankSentence = sentence.replace(word.hanzi, '____');
        return {
          word,
          prompt: blankSentence,
          correctAnswer: word.hanzi,
          options: this.shuffle([
            word.hanzi,
            ...distractors.map(d => d.hanzi)
          ]),
          type: 'multiple',
        };
      }

      default:
        return this.createQuestion('charToMeaning', word, pool);
    }
  },

  // Get random distractors (wrong answers)
  getDistractors(word, pool, count) {
    const sameCategory = pool.filter(w => w.id !== word.id && w.category === word.category);
    const others = pool.filter(w => w.id !== word.id && w.category !== word.category);

    const distractors = [];
    // Prefer same category for harder distractors
    this.shuffle(sameCategory);
    this.shuffle(others);

    const combined = [...sameCategory, ...others];
    for (let i = 0; i < Math.min(count, combined.length); i++) {
      distractors.push(combined[i]);
    }
    return distractors;
  },

  // Get current question
  getCurrentQuestion() {
    if (!this.currentQuiz) return null;
    return this.currentQuiz.questions[this.currentQuestion];
  },

  // Submit answer — returns { correct, correctAnswer, xpGained, questsCompleted }
  submitAnswer(answer) {
    const question = this.getCurrentQuestion();
    if (!question) return null;

    let correct = false;
    if (question.type === 'listen_input') {
      // Normalize pinyin comparison
      const normalize = s => s.toLowerCase().replace(/\s+/g, '').replace(/[āáǎà]/g, 'a')
        .replace(/[ēéěè]/g, 'e').replace(/[īíǐì]/g, 'i')
        .replace(/[ōóǒò]/g, 'o').replace(/[ūúǔù]/g, 'u').replace(/[ǖǘǚǜ]/g, 'v');
      correct = normalize(answer) === normalize(question.correctAnswer);
    } else {
      correct = answer === question.correctAnswer;
    }

    if (correct) this.score++;
    this.answers.push({ question, answer, correct });

    // Update word progress (SM-2) with mastery axis
    const quality = correct ? 4 : 1;
    const axis = this.AXIS_MAP[this.currentQuiz.type] || null;
    const wordState = Storage.getWordState(question.word.id);
    const newState = RPG.sm2(wordState, quality, axis);
    Storage.updateWordState(question.word.id, newState);

    // Update player
    const player = Storage.getPlayer();
    player.totalAttempts++;
    if (correct) player.totalCorrect++;

    const quizType = this.currentQuiz.type;
    const statType = this.QUIZ_TYPES[quizType]?.stat || 'vocab';
    RPG.updateStats(player, statType, correct);

    let xpGained = 0;
    if (correct) {
      const result = RPG.awardXP(player, RPG.XP_REWARDS.correctAnswer);
      xpGained = result.xpGained;

      if (!wordState.seen) {
        const bonus = RPG.awardXP(player, RPG.XP_REWARDS.firstTimeWord);
        xpGained += bonus.xpGained;
        RPG.updateQuestProgress('learn');
      }

      if (newState.mastered && !wordState.mastered) {
        const bonus = RPG.awardXP(player, RPG.XP_REWARDS.wordMastered);
        xpGained += bonus.xpGained;
        player.wordsLearned++;
      }
    }

    Storage.savePlayer(player);

    // Sound
    if (correct) {
      Audio.playCorrect();
    } else {
      Audio.playWrong();
    }

    return {
      correct,
      correctAnswer: question.correctAnswer,
      xpGained,
      wordState: newState,
    };
  },

  // Move to next question — returns true if quiz continues
  nextQuestion() {
    this.currentQuestion++;
    return this.currentQuestion < this.currentQuiz.questions.length;
  },

  // Get quiz results
  getResults() {
    const player = Storage.getPlayer();
    const isPerfect = this.score === this.currentQuiz.total;

    if (isPerfect) {
      player.perfectQuizzes++;
      RPG.awardXP(player, RPG.XP_REWARDS.perfectQuiz);
      RPG.updateQuestProgress('perfect');
    }

    player.quizzesDone++;
    RPG.updateQuestProgress('quiz');
    Storage.savePlayer(player);

    return {
      score: this.score,
      total: this.currentQuiz.total,
      percentage: Math.round((this.score / this.currentQuiz.total) * 100),
      isPerfect,
      answers: this.answers,
      timeTaken: Date.now() - this.currentQuiz.startTime,
    };
  },

  // Fisher-Yates shuffle
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
};
