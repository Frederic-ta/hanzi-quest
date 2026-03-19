// HanziQuest — Pinyin Course, Typing Exercises & Keyboard Helper

const PINYIN_STORAGE_KEY = 'hq_pinyin_progress';

const Pinyin = {
  // ============================================================
  //  COURSE DATA
  // ============================================================
  LESSONS: [
    {
      id: 'tones',
      title: 'Les 4 tons',
      titleZh: '四声 (Sì shēng)',
      icon: '🎵',
      description: 'Le chinois est une langue tonale. Chaque syllabe a un ton qui change le sens du mot.',
      content: [
        {
          type: 'explanation',
          title: 'Pourquoi les tons ?',
          text: 'En chinois, la même syllabe prononcée avec un ton différent donne un mot complètement différent. Par exemple, "mā" (妈) = maman, "má" (麻) = chanvre, "mǎ" (马) = cheval, "mà" (骂) = insulter.',
        },
        {
          type: 'tone_chart',
          title: 'Les 4 tons + le ton neutre',
          tones: [
            { num: 1, mark: 'ā', name: '1er ton — haut et plat', desc: 'Voix haute et constante, comme quand on chante une note.', example: 'mā (妈) = maman', pinyin: 'mā', hanzi: '妈', pitch: 'high-flat' },
            { num: 2, mark: 'á', name: '2e ton — montant', desc: 'La voix monte, comme quand on pose une question : "Hein ?"', example: 'má (麻) = chanvre', pinyin: 'má', hanzi: '麻', pitch: 'rising' },
            { num: 3, mark: 'ǎ', name: '3e ton — descendant-montant', desc: 'La voix descend puis remonte, comme quand on hésite : "Hmm..."', example: 'mǎ (马) = cheval', pinyin: 'mǎ', hanzi: '马', pitch: 'dipping' },
            { num: 4, mark: 'à', name: '4e ton — descendant', desc: 'La voix descend brusquement, comme un ordre : "Non !"', example: 'mà (骂) = insulter', pinyin: 'mà', hanzi: '骂', pitch: 'falling' },
            { num: 5, mark: 'a', name: 'Ton neutre — léger', desc: 'Court et léger, sans accentuation. Souvent à la fin d\'un mot.', example: 'ma (吗) = particule interrogative', pinyin: 'ma', hanzi: '吗', pitch: 'neutral' },
          ],
        },
        {
          type: 'tip',
          title: 'Astuce pour retenir',
          text: '1 = plat (—), 2 = monte (/), 3 = descend-monte (∨), 4 = descend (\\). Les marques tonales suivent exactement la courbe de la voix !',
        },
      ],
      exercises: [
        { type: 'listen_identify_tone', prompt: 'Écoute et identifie le ton', items: [
          { pinyin: 'mā', hanzi: '妈', tone: 1 },
          { pinyin: 'shí', hanzi: '十', tone: 2 },
          { pinyin: 'nǐ', hanzi: '你', tone: 3 },
          { pinyin: 'shì', hanzi: '是', tone: 4 },
          { pinyin: 'hǎo', hanzi: '好', tone: 3 },
          { pinyin: 'bā', hanzi: '八', tone: 1 },
          { pinyin: 'méi', hanzi: '没', tone: 2 },
          { pinyin: 'dà', hanzi: '大', tone: 4 },
        ]},
        { type: 'tone_match', prompt: 'Associe la syllabe au bon ton', items: [
          { pinyin: 'tā', display: 'tā (他)', tone: 1, meaning: 'il/elle' },
          { pinyin: 'rén', display: 'rén (人)', tone: 2, meaning: 'personne' },
          { pinyin: 'wǒ', display: 'wǒ (我)', tone: 3, meaning: 'je/moi' },
          { pinyin: 'qù', display: 'qù (去)', tone: 4, meaning: 'aller' },
          { pinyin: 'liù', display: 'liù (六)', tone: 4, meaning: 'six' },
        ]},
      ],
    },
    {
      id: 'initials',
      title: 'Les initiales',
      titleZh: '声母 (Shēngmǔ)',
      icon: '🔤',
      description: 'Les 21 consonnes initiales du pinyin, regroupées par type.',
      content: [
        {
          type: 'explanation',
          title: 'Qu\'est-ce qu\'une initiale ?',
          text: 'En pinyin, chaque syllabe commence par une initiale (consonne) suivie d\'une finale (voyelle). Il y a 21 initiales au total. Certaines se prononcent comme en français, d\'autres sont différentes.',
        },
        {
          type: 'initial_groups',
          title: 'Les 21 initiales par groupes',
          groups: [
            { name: 'Labiales (lèvres)', initials: [
              { letter: 'b', sound: 'bo', desc: 'Comme "b" dans "balle" (non aspiré)', example: 'bā (八) = huit' },
              { letter: 'p', sound: 'po', desc: 'Comme "p" dans "papa" (aspiré, souffle d\'air)', example: 'pá (爬) = grimper' },
              { letter: 'm', sound: 'mo', desc: 'Comme "m" dans "maman"', example: 'mā (妈) = maman' },
              { letter: 'f', sound: 'fo', desc: 'Comme "f" dans "faire"', example: 'fā (发) = envoyer' },
            ]},
            { name: 'Dentales (dents)', initials: [
              { letter: 'd', sound: 'de', desc: 'Comme "d" dans "doux" (non aspiré)', example: 'dà (大) = grand' },
              { letter: 't', sound: 'te', desc: 'Comme "t" dans "table" (aspiré)', example: 'tā (他) = il' },
              { letter: 'n', sound: 'ne', desc: 'Comme "n" dans "nous"', example: 'nǐ (你) = tu' },
              { letter: 'l', sound: 'le', desc: 'Comme "l" dans "lire"', example: 'lái (来) = venir' },
            ]},
            { name: 'Vélaires (gorge)', initials: [
              { letter: 'g', sound: 'ge', desc: 'Comme "g" dans "gare" (non aspiré)', example: 'gǒu (狗) = chien' },
              { letter: 'k', sound: 'ke', desc: 'Comme "k" dans "kilo" (aspiré)', example: 'kàn (看) = regarder' },
              { letter: 'h', sound: 'he', desc: 'Comme "h" anglais aspiré', example: 'hǎo (好) = bon' },
            ]},
            { name: 'Palatales (palais)', initials: [
              { letter: 'j', sound: 'ji', desc: 'Comme "dj" doux, langue contre le palais', example: 'jiā (家) = famille' },
              { letter: 'q', sound: 'qi', desc: 'Comme "tch" aspiré', example: 'qī (七) = sept' },
              { letter: 'x', sound: 'xi', desc: 'Comme "ch" doux (entre "s" et "ch")', example: 'xiè (谢) = merci' },
            ]},
            { name: 'Rétroflexes (langue recourbée)', initials: [
              { letter: 'zh', sound: 'zhi', desc: 'Comme "dj" avec la langue recourbée', example: 'zhōng (中) = centre' },
              { letter: 'ch', sound: 'chi', desc: 'Comme "tch" avec la langue recourbée', example: 'chī (吃) = manger' },
              { letter: 'sh', sound: 'shi', desc: 'Comme "ch" français', example: 'shì (是) = être' },
              { letter: 'r', sound: 'ri', desc: 'Entre "r" et "j" français', example: 'rén (人) = personne' },
            ]},
            { name: 'Sifflantes (dents/langue)', initials: [
              { letter: 'z', sound: 'zi', desc: 'Comme "dz" (non aspiré)', example: 'zài (在) = à/dans' },
              { letter: 'c', sound: 'ci', desc: 'Comme "ts" (aspiré)', example: 'cài (菜) = légume' },
              { letter: 's', sound: 'si', desc: 'Comme "s" dans "sur"', example: 'sān (三) = trois' },
            ]},
          ],
        },
        {
          type: 'tip',
          title: 'Aspiré vs non aspiré',
          text: 'La différence principale entre b/p, d/t, g/k, j/q, zh/ch, z/c est l\'aspiration. Mettez votre main devant la bouche : pour p, t, k, q, ch, c vous sentez un souffle d\'air. Pour b, d, g, j, zh, z non.',
        },
      ],
      exercises: [
        { type: 'listen_identify_initial', prompt: 'Écoute et identifie l\'initiale', items: [
          { pinyin: 'bā', hanzi: '八', initial: 'b' },
          { pinyin: 'pá', hanzi: '爬', initial: 'p' },
          { pinyin: 'dà', hanzi: '大', initial: 'd' },
          { pinyin: 'tā', hanzi: '他', initial: 't' },
          { pinyin: 'gǒu', hanzi: '狗', initial: 'g' },
          { pinyin: 'kàn', hanzi: '看', initial: 'k' },
          { pinyin: 'jiā', hanzi: '家', initial: 'j' },
          { pinyin: 'chī', hanzi: '吃', initial: 'ch' },
        ]},
        { type: 'type_pinyin_initial', prompt: 'Tape l\'initiale de cette syllabe', items: [
          { pinyin: 'shì', answer: 'sh' },
          { pinyin: 'zhōng', answer: 'zh' },
          { pinyin: 'rén', answer: 'r' },
          { pinyin: 'qī', answer: 'q' },
          { pinyin: 'xiè', answer: 'x' },
        ]},
      ],
    },
    {
      id: 'finals',
      title: 'Les finales',
      titleZh: '韵母 (Yùnmǔ)',
      icon: '🗣️',
      description: 'Les 36 combinaisons de voyelles qui forment la fin de chaque syllabe.',
      content: [
        {
          type: 'explanation',
          title: 'Qu\'est-ce qu\'une finale ?',
          text: 'La finale est la partie voyelle de la syllabe pinyin. Elle peut être simple (une seule voyelle) ou composée (plusieurs voyelles ou voyelle + consonne nasale).',
        },
        {
          type: 'final_groups',
          title: 'Les finales par groupes',
          groups: [
            { name: 'Finales simples', finals: [
              { letter: 'a', sound: 'a', desc: 'Comme "a" dans "patte"' },
              { letter: 'o', sound: 'o', desc: 'Comme "o" dans "beau"' },
              { letter: 'e', sound: 'e', desc: 'Comme "eu" dans "peur"' },
              { letter: 'i', sound: 'i', desc: 'Comme "i" dans "vie"' },
              { letter: 'u', sound: 'u', desc: 'Comme "ou" dans "vous"' },
              { letter: 'ü', sound: 'yu', desc: 'Comme "u" dans "tu" en français' },
            ]},
            { name: 'Diphtongues', finals: [
              { letter: 'ai', sound: 'ai', desc: 'Comme "aille" dans "taille"' },
              { letter: 'ei', sound: 'ei', desc: 'Comme "eille" dans "abeille"' },
              { letter: 'ao', sound: 'ao', desc: 'Comme "aou"' },
              { letter: 'ou', sound: 'ou', desc: 'Comme "o" + "ou"' },
            ]},
            { name: 'Finales nasales (-n)', finals: [
              { letter: 'an', sound: 'an', desc: 'Comme "anne"' },
              { letter: 'en', sound: 'en', desc: 'Comme "eune"' },
              { letter: 'in', sound: 'in', desc: 'Comme "inne"' },
              { letter: 'un', sound: 'un', desc: 'Comme "ouenne"' },
              { letter: 'ün', sound: 'yun', desc: 'Comme "u" français + "n"' },
            ]},
            { name: 'Finales nasales (-ng)', finals: [
              { letter: 'ang', sound: 'ang', desc: '"a" + ng nasal (comme "parking")' },
              { letter: 'eng', sound: 'eng', desc: '"eu" + ng nasal' },
              { letter: 'ing', sound: 'ing', desc: '"i" + ng nasal' },
              { letter: 'ong', sound: 'ong', desc: '"o" + ng nasal' },
            ]},
            { name: 'Finales composées (i-)', finals: [
              { letter: 'ia', sound: 'ia', desc: '"i" + "a"' },
              { letter: 'ie', sound: 'ie', desc: '"i" + "é"' },
              { letter: 'iu', sound: 'iu', desc: '"i" + "ou"' },
              { letter: 'ian', sound: 'ian', desc: '"i" + "enne"' },
              { letter: 'iang', sound: 'iang', desc: '"i" + "ang"' },
              { letter: 'iong', sound: 'iong', desc: '"i" + "ong"' },
            ]},
            { name: 'Finales composées (u-)', finals: [
              { letter: 'ua', sound: 'ua', desc: '"ou" + "a"' },
              { letter: 'uo', sound: 'uo', desc: '"ou" + "o"' },
              { letter: 'ui', sound: 'ui', desc: '"ou" + "eille"' },
              { letter: 'uan', sound: 'uan', desc: '"ou" + "anne"' },
              { letter: 'uang', sound: 'uang', desc: '"ou" + "ang"' },
              { letter: 'ueng', sound: 'ueng', desc: '"ou" + "eng"' },
            ]},
            { name: 'Finales composées (ü-)', finals: [
              { letter: 'üe', sound: 'yue', desc: '"u" français + "é"' },
              { letter: 'üan', sound: 'yuan', desc: '"u" français + "enne"' },
            ]},
          ],
        },
        {
          type: 'tip',
          title: 'Le "ü" spécial',
          text: 'Le son "ü" n\'existe pas en anglais mais c\'est le "u" français ! Après j, q, x, on écrit "u" mais on prononce "ü" : ju = jü, qu = qü, xu = xü.',
        },
      ],
      exercises: [
        { type: 'listen_identify_final', prompt: 'Écoute et identifie la finale', items: [
          { pinyin: 'mā', hanzi: '妈', final: 'a' },
          { pinyin: 'hē', hanzi: '喝', final: 'e' },
          { pinyin: 'chī', hanzi: '吃', final: 'i' },
          { pinyin: 'shū', hanzi: '书', final: 'u' },
          { pinyin: 'hǎo', hanzi: '好', final: 'ao' },
          { pinyin: 'méi', hanzi: '没', final: 'ei' },
          { pinyin: 'kàn', hanzi: '看', final: 'an' },
          { pinyin: 'tīng', hanzi: '听', final: 'ing' },
        ]},
        { type: 'type_pinyin_final', prompt: 'Tape la finale de cette syllabe', items: [
          { pinyin: 'zhōng', answer: 'ong' },
          { pinyin: 'xiǎo', answer: 'iao' },
          { pinyin: 'guān', answer: 'uan' },
          { pinyin: 'duì', answer: 'ui' },
          { pinyin: 'liáng', answer: 'iang' },
        ]},
      ],
    },
    {
      id: 'combinations',
      title: 'Les combinaisons',
      titleZh: '拼音规则 (Pīnyīn guīzé)',
      icon: '🧩',
      description: 'Comment les initiales et les finales se combinent, et les règles spéciales.',
      content: [
        {
          type: 'explanation',
          title: 'Comment former une syllabe',
          text: 'Une syllabe pinyin = initiale + finale + ton. Par exemple : "n" + "ǐ" = "nǐ" (你, tu). Certaines syllabes n\'ont pas d\'initiale : "ài" (爱, aimer).',
        },
        {
          type: 'rules',
          title: 'Règles spéciales',
          rules: [
            { rule: 'j, q, x + ü → u', desc: 'Après j, q, x, le "ü" s\'écrit "u" mais se prononce toujours "ü". Exemple : jū (居) se prononce "jü".' },
            { rule: 'ü reste ü après l, n', desc: 'Après l et n, on garde le tréma : lǜ (绿, vert), nǚ (女, femme).' },
            { rule: 'i seul → yi, u seul → wu, ü seul → yu', desc: 'Quand une finale commence sans initiale, on ajoute y ou w : i → yi, u → wu, ü → yu.' },
            { rule: 'Ton sur la voyelle principale', desc: 'La marque tonale va sur la voyelle "principale" : a > e > o > i/u. Si i et u ensemble, le ton va sur le dernier.' },
            { rule: 'Le 3e ton change', desc: 'Deux 3e tons consécutifs : le premier devient un 2e ton. Ex: nǐ + hǎo → ní hǎo (你好).' },
            { rule: 'Le "er" final (儿化)', desc: 'Le suffixe 儿 (ér) se colle à la syllabe précédente : nǎr (哪儿, où), zhèr (这儿, ici).' },
          ],
        },
        {
          type: 'combination_table',
          title: 'Tableau des combinaisons courantes',
          combos: [
            { initial: 'b', finals: ['a','o','i','u','ai','ei','ao','an','en','ang','eng','ian','in','ing'] },
            { initial: 'p', finals: ['a','o','i','u','ai','ei','ao','ou','an','en','ang','eng','ian','in','ing'] },
            { initial: 'j', finals: ['i','u(ü)','ia','ie','iu','ian','in','iang','ing','iong'] },
            { initial: 'zh', finals: ['a','e','i','u','ai','ei','ao','ou','an','en','ang','eng','ong','ua','uo','ui','uan','uang'] },
          ],
        },
        {
          type: 'tip',
          title: 'Comment pratiquer',
          text: 'Lis les syllabes à voix haute ! Le pinyin est un système phonétique — il est fait pour être prononcé. Écoute les exemples audio et répète.',
        },
      ],
      exercises: [
        { type: 'combine_syllable', prompt: 'Combine l\'initiale et la finale', items: [
          { initial: 'n', final: 'ǐ', answer: 'nǐ', meaning: 'tu (你)' },
          { initial: 'h', final: 'ǎo', answer: 'hǎo', meaning: 'bon (好)' },
          { initial: 'zh', final: 'ōng', answer: 'zhōng', meaning: 'centre (中)' },
          { initial: 'x', final: 'iè', answer: 'xiè', meaning: 'merci (谢)' },
          { initial: 'ch', final: 'ī', answer: 'chī', meaning: 'manger (吃)' },
        ]},
        { type: 'apply_rule', prompt: 'Applique la bonne règle', items: [
          { question: 'Comment écrit-on j + ü ?', options: ['jü', 'ju', 'jv'], answer: 'ju', explanation: 'Après j, q, x, le ü s\'écrit u' },
          { question: 'Où va le ton dans "guài" ?', options: ['sur u', 'sur a', 'sur i'], answer: 'sur a', explanation: 'a > e > o > i/u, donc le ton va sur a' },
          { question: 'Comment prononcer 你好 (nǐ hǎo) ?', options: ['ní hǎo', 'nǐ hǎo', 'nì hǎo'], answer: 'ní hǎo', explanation: 'Deux 3e tons : le premier devient 2e ton' },
          { question: 'i sans initiale s\'écrit...', options: ['i', 'yi', 'wi'], answer: 'yi', explanation: 'i seul → yi (on ajoute y)' },
          { question: 'Comment écrit-on n + ǚ ?', options: ['nu', 'nü', 'nǚ'], answer: 'nǚ', explanation: 'Après n et l, on garde le tréma ü' },
        ]},
      ],
    },
    {
      id: 'practice',
      title: 'Exercices pratiques',
      titleZh: '综合练习 (Zōnghé liànxí)',
      icon: '🎯',
      description: 'Mets en pratique tout ce que tu as appris avec des exercices variés.',
      content: [
        {
          type: 'explanation',
          title: 'C\'est l\'heure de pratiquer !',
          text: 'Tu connais maintenant les tons, les initiales, les finales et les règles de combinaison. Ces exercices vont tester toutes tes connaissances en pinyin.',
        },
        {
          type: 'tip',
          title: 'Rappel des tons',
          text: '1 = ā (haut plat), 2 = á (montant), 3 = ǎ (descendant-montant), 4 = à (descendant). Tu peux aussi écrire les numéros : ma1 = mā, ma2 = má, etc.',
        },
      ],
      exercises: [
        { type: 'listen_type_pinyin', prompt: 'Écoute et écris le pinyin complet', items: [
          { hanzi: '你', pinyin: 'nǐ', meaning: 'tu' },
          { hanzi: '好', pinyin: 'hǎo', meaning: 'bon' },
          { hanzi: '谢谢', pinyin: 'xiè xiè', meaning: 'merci' },
          { hanzi: '中国', pinyin: 'zhōng guó', meaning: 'Chine' },
          { hanzi: '吃', pinyin: 'chī', meaning: 'manger' },
          { hanzi: '喝', pinyin: 'hē', meaning: 'boire' },
          { hanzi: '大', pinyin: 'dà', meaning: 'grand' },
          { hanzi: '小', pinyin: 'xiǎo', meaning: 'petit' },
        ]},
        { type: 'char_to_pinyin', prompt: 'Écris le pinyin de ce caractère', items: [
          { hanzi: '人', pinyin: 'rén', meaning: 'personne' },
          { hanzi: '我', pinyin: 'wǒ', meaning: 'je/moi' },
          { hanzi: '他', pinyin: 'tā', meaning: 'il' },
          { hanzi: '是', pinyin: 'shì', meaning: 'être' },
          { hanzi: '不', pinyin: 'bù', meaning: 'ne pas' },
          { hanzi: '一', pinyin: 'yī', meaning: 'un' },
          { hanzi: '二', pinyin: 'èr', meaning: 'deux' },
          { hanzi: '三', pinyin: 'sān', meaning: 'trois' },
        ]},
      ],
    },
  ],

  // ============================================================
  //  PROGRESS MANAGEMENT
  // ============================================================
  getProgress() {
    const raw = localStorage.getItem(PINYIN_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return { completedLessons: [], lessonScores: {}, currentLesson: 0 };
  },

  saveProgress(progress) {
    localStorage.setItem(PINYIN_STORAGE_KEY, JSON.stringify(progress));
  },

  isLessonUnlocked(index) {
    if (index === 0) return true;
    const progress = this.getProgress();
    return progress.completedLessons.includes(this.LESSONS[index - 1].id);
  },

  isLessonCompleted(lessonId) {
    return this.getProgress().completedLessons.includes(lessonId);
  },

  completeLesson(lessonId, score) {
    const progress = this.getProgress();
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    progress.lessonScores[lessonId] = Math.max(progress.lessonScores[lessonId] || 0, score);
    this.saveProgress(progress);
  },

  getCompletionPercent() {
    const progress = this.getProgress();
    return Math.round((progress.completedLessons.length / this.LESSONS.length) * 100);
  },

  // ============================================================
  //  PINYIN MATCHING (fuzzy)
  // ============================================================
  normalizePinyin(s) {
    return s.toLowerCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[āáǎà]/g, 'a')
      .replace(/[ēéěè]/g, 'e')
      .replace(/[īíǐì]/g, 'i')
      .replace(/[ōóǒò]/g, 'o')
      .replace(/[ūúǔù]/g, 'u')
      .replace(/[ǖǘǚǜ]/g, 'v')
      // Also strip tone numbers at end of syllables
      .replace(/([a-z])[1-5]/g, '$1');
  },

  matchPinyin(input, correct) {
    return this.normalizePinyin(input) === this.normalizePinyin(correct);
  },

  // ============================================================
  //  RENDER: COURSE OVERVIEW
  // ============================================================
  renderCourseOverview(containerId) {
    const el = document.getElementById(containerId);
    const progress = this.getProgress();
    const pct = this.getCompletionPercent();

    el.innerHTML = `
      <div class="screen-header">
        <h2>拼音 Pinyin — Cours</h2>
        <p class="subtitle">La base de la prononciation chinoise</p>
      </div>

      <div class="pinyin-progress-overview">
        <div class="pinyin-progress-bar-track">
          <div class="pinyin-progress-bar-fill" style="width: ${pct}%"></div>
        </div>
        <div class="pinyin-progress-text">${pct}% complété — ${progress.completedLessons.length}/${this.LESSONS.length} leçons</div>
      </div>

      <div class="pinyin-lesson-list">
        ${this.LESSONS.map((lesson, i) => {
          const unlocked = this.isLessonUnlocked(i);
          const completed = this.isLessonCompleted(lesson.id);
          const score = progress.lessonScores[lesson.id];
          return `
            <button class="pinyin-lesson-card ${unlocked ? 'lesson-unlocked' : 'lesson-locked'} ${completed ? 'lesson-completed' : ''}"
                    onclick="${unlocked ? `Pinyin.openLesson(${i})` : ''}" ${!unlocked ? 'disabled' : ''}>
              <div class="pl-num">${i + 1}</div>
              <div class="pl-icon">${unlocked ? lesson.icon : '🔒'}</div>
              <div class="pl-info">
                <div class="pl-title">${lesson.title}</div>
                <div class="pl-titlezh">${lesson.titleZh}</div>
                <div class="pl-desc">${lesson.description}</div>
              </div>
              <div class="pl-status">
                ${completed ? `<span class="pl-check">✅</span>${score ? `<span class="pl-score">${score}%</span>` : ''}` : unlocked ? '<span class="pl-arrow">→</span>' : ''}
              </div>
            </button>
          `;
        }).join('')}
      </div>
    `;
  },

  // ============================================================
  //  RENDER: LESSON CONTENT
  // ============================================================
  _currentLessonIndex: 0,
  _exerciseState: null,

  openLesson(index) {
    this._currentLessonIndex = index;
    const lesson = this.LESSONS[index];
    Audio.playClick();
    this.renderLessonContent(lesson);
  },

  renderLessonContent(lesson) {
    const el = document.getElementById('screen-pinyin');

    let contentHTML = '';
    lesson.content.forEach(section => {
      switch (section.type) {
        case 'explanation':
          contentHTML += `
            <div class="py-section py-explanation">
              <h3>${section.title}</h3>
              <p>${section.text}</p>
            </div>
          `;
          break;

        case 'tone_chart':
          contentHTML += `
            <div class="py-section py-tone-chart">
              <h3>${section.title}</h3>
              <div class="tone-cards">
                ${section.tones.map(t => `
                  <div class="tone-card tone-${t.pitch}" onclick="Audio.speakChinese('${t.hanzi}')">
                    <div class="tc-num">Ton ${t.num === 5 ? 'neutre' : t.num}</div>
                    <div class="tc-mark">${t.mark}</div>
                    <div class="tc-pitch-line tc-pitch-${t.pitch}"></div>
                    <div class="tc-name">${t.name}</div>
                    <div class="tc-desc">${t.desc}</div>
                    <div class="tc-example">${t.example}</div>
                    <button class="btn-audio-small" onclick="event.stopPropagation(); Audio.speakChinese('${t.hanzi}')">🔊</button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          break;

        case 'initial_groups':
          contentHTML += `
            <div class="py-section py-initial-groups">
              <h3>${section.title}</h3>
              ${section.groups.map(g => `
                <div class="py-group">
                  <div class="py-group-name">${g.name}</div>
                  <div class="py-initials-grid">
                    ${g.initials.map(init => `
                      <div class="py-initial-card" onclick="Audio.speakChinese('${init.sound}')">
                        <div class="pi-letter">${init.letter}</div>
                        <div class="pi-desc">${init.desc}</div>
                        <div class="pi-example">${init.example}</div>
                        <button class="btn-audio-small" onclick="event.stopPropagation(); Audio.speakChinese('${init.sound}')">🔊</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
          break;

        case 'final_groups':
          contentHTML += `
            <div class="py-section py-final-groups">
              <h3>${section.title}</h3>
              ${section.groups.map(g => `
                <div class="py-group">
                  <div class="py-group-name">${g.name}</div>
                  <div class="py-finals-grid">
                    ${g.finals.map(f => `
                      <div class="py-final-card" onclick="Audio.speakChinese('${f.sound}')">
                        <span class="pf-letter">${f.letter}</span>
                        <span class="pf-desc">${f.desc}</span>
                        <button class="btn-audio-small" onclick="event.stopPropagation(); Audio.speakChinese('${f.sound}')">🔊</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
          break;

        case 'rules':
          contentHTML += `
            <div class="py-section py-rules">
              <h3>${section.title}</h3>
              ${section.rules.map(r => `
                <div class="py-rule">
                  <div class="pr-rule">${r.rule}</div>
                  <div class="pr-desc">${r.desc}</div>
                </div>
              `).join('')}
            </div>
          `;
          break;

        case 'combination_table':
          contentHTML += `
            <div class="py-section py-combo-table">
              <h3>${section.title}</h3>
              <div class="py-combos-scroll">
                ${section.combos.map(c => `
                  <div class="py-combo-row">
                    <span class="pc-initial">${c.initial}-</span>
                    <span class="pc-finals">${c.finals.join(', ')}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          break;

        case 'tip':
          contentHTML += `
            <div class="py-section py-tip">
              <div class="py-tip-icon">💡</div>
              <div class="py-tip-content">
                <h3>${section.title}</h3>
                <p>${section.text}</p>
              </div>
            </div>
          `;
          break;
      }
    });

    el.innerHTML = `
      <div class="screen-header">
        <button class="back-btn" onclick="Pinyin.renderCourseOverview('screen-pinyin')">← Cours</button>
        <h2>${lesson.icon} ${lesson.title}</h2>
        <div class="subtitle">${lesson.titleZh}</div>
      </div>

      <div class="py-lesson-content">
        ${contentHTML}
      </div>

      <div class="py-start-exercises">
        <button class="btn-rpg py-exercise-btn" onclick="Pinyin.startExercises(${this._currentLessonIndex})">
          🎯 Commencer les exercices (${this._countExercises(lesson)})
        </button>
      </div>
    `;
  },

  _countExercises(lesson) {
    let count = 0;
    lesson.exercises.forEach(ex => count += ex.items.length);
    return count;
  },

  // ============================================================
  //  EXERCISES ENGINE
  // ============================================================
  startExercises(lessonIndex) {
    const lesson = this.LESSONS[lessonIndex];
    // Flatten all exercise items
    const allItems = [];
    lesson.exercises.forEach(ex => {
      ex.items.forEach(item => {
        allItems.push({ ...item, exerciseType: ex.type, prompt: ex.prompt });
      });
    });
    // Shuffle
    for (let i = allItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
    }

    this._exerciseState = {
      lessonIndex,
      lessonId: lesson.id,
      items: allItems,
      current: 0,
      correct: 0,
      total: allItems.length,
      answered: false,
    };

    Audio.playClick();
    this.renderExercise();
  },

  renderExercise() {
    const state = this._exerciseState;
    if (!state || state.current >= state.total) {
      this.showExerciseResults();
      return;
    }

    const item = state.items[state.current];
    const el = document.getElementById('screen-pinyin');
    const progress = `${state.current + 1} / ${state.total}`;
    const pct = ((state.current) / state.total) * 100;

    let exerciseHTML = '';

    switch (item.exerciseType) {
      case 'listen_identify_tone':
        exerciseHTML = this._renderToneExercise(item);
        break;
      case 'tone_match':
        exerciseHTML = this._renderToneMatchExercise(item);
        break;
      case 'listen_identify_initial':
        exerciseHTML = this._renderInitialExercise(item);
        break;
      case 'type_pinyin_initial':
        exerciseHTML = this._renderTypeExercise(item, 'initiale');
        break;
      case 'listen_identify_final':
        exerciseHTML = this._renderFinalExercise(item);
        break;
      case 'type_pinyin_final':
        exerciseHTML = this._renderTypeExercise(item, 'finale');
        break;
      case 'combine_syllable':
        exerciseHTML = this._renderCombineExercise(item);
        break;
      case 'apply_rule':
        exerciseHTML = this._renderRuleExercise(item);
        break;
      case 'listen_type_pinyin':
        exerciseHTML = this._renderListenTypePinyin(item);
        break;
      case 'char_to_pinyin':
        exerciseHTML = this._renderCharToPinyin(item);
        break;
    }

    el.innerHTML = `
      <div class="py-exercise-header">
        <div class="py-ex-progress">
          <div class="py-ex-bar"><div class="py-ex-bar-fill" style="width:${pct}%"></div></div>
          <div class="py-ex-count">${progress}</div>
        </div>
        <div class="py-ex-score">✅ ${state.correct}</div>
      </div>
      <div class="py-ex-prompt">${item.prompt}</div>
      <div class="py-exercise-body" id="py-exercise-body">
        ${exerciseHTML}
      </div>
    `;

    state.answered = false;

    // Auto-play audio for listening exercises
    if (item.exerciseType.startsWith('listen') && item.hanzi) {
      setTimeout(() => Audio.speakChinese(item.hanzi), 400);
    }

    // Focus input if present
    setTimeout(() => {
      const input = document.getElementById('py-type-input');
      if (input) {
        input.focus();
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') Pinyin.submitTypeAnswer();
        });
      }
    }, 100);
  },

  _renderToneExercise(item) {
    return `
      <div class="py-ex-listen-area">
        <button class="listen-btn" onclick="Audio.speakChinese('${item.hanzi}')">
          <span class="listen-icon">🔊</span>
          <span>Écouter "${item.hanzi}"</span>
        </button>
      </div>
      <div class="py-tone-options">
        ${[1, 2, 3, 4].map(t => `
          <button class="py-tone-btn" data-tone="${t}" onclick="Pinyin.answerTone(${t}, ${item.tone})">
            <div class="ptb-num">Ton ${t}</div>
            <div class="ptb-mark">${['ā','á','ǎ','à'][t-1]}</div>
            <div class="ptb-shape">${['—', '/', '∨', '\\\\'][t-1]}</div>
          </button>
        `).join('')}
      </div>
    `;
  },

  _renderToneMatchExercise(item) {
    return `
      <div class="py-ex-display">
        <div class="py-ex-big-text">${item.display}</div>
        <button class="btn-audio-small" onclick="Audio.speakChinese('${item.pinyin}')">🔊</button>
      </div>
      <div class="py-tone-options">
        ${[1, 2, 3, 4].map(t => `
          <button class="py-tone-btn" data-tone="${t}" onclick="Pinyin.answerTone(${t}, ${item.tone})">
            <div class="ptb-num">Ton ${t}</div>
            <div class="ptb-mark">${['ā','á','ǎ','à'][t-1]}</div>
          </button>
        `).join('')}
      </div>
    `;
  },

  _renderInitialExercise(item) {
    const allInitials = ['b','p','m','f','d','t','n','l','g','k','h','j','q','x','zh','ch','sh','r','z','c','s'];
    const correct = item.initial;
    // Pick 3 random wrong initials
    const wrong = allInitials.filter(i => i !== correct);
    for (let i = wrong.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [wrong[i], wrong[j]] = [wrong[j], wrong[i]]; }
    const options = [correct, ...wrong.slice(0, 3)];
    for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [options[i], options[j]] = [options[j], options[i]]; }

    return `
      <div class="py-ex-listen-area">
        <button class="listen-btn" onclick="Audio.speakChinese('${item.hanzi}')">
          <span class="listen-icon">🔊</span>
          <span>Écouter "${item.hanzi}" (${item.pinyin})</span>
        </button>
      </div>
      <div class="quiz-options-grid">
        ${options.map((opt, i) => `
          <button class="quiz-option" onclick="Pinyin.answerChoice('${opt}', '${correct}', this)">
            <span class="opt-letter">${['A','B','C','D'][i]}</span>
            <span class="opt-text">${opt}</span>
          </button>
        `).join('')}
      </div>
    `;
  },

  _renderFinalExercise(item) {
    const allFinals = ['a','o','e','i','u','ü','ai','ei','ao','ou','an','en','ang','eng','ing','ong','ia','ie','iu','ian','iang','iong','ua','uo','ui','uan','uang'];
    const correct = item.final;
    const wrong = allFinals.filter(f => f !== correct);
    for (let i = wrong.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [wrong[i], wrong[j]] = [wrong[j], wrong[i]]; }
    const options = [correct, ...wrong.slice(0, 3)];
    for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [options[i], options[j]] = [options[j], options[i]]; }

    return `
      <div class="py-ex-listen-area">
        <button class="listen-btn" onclick="Audio.speakChinese('${item.hanzi}')">
          <span class="listen-icon">🔊</span>
          <span>Écouter "${item.hanzi}" (${item.pinyin})</span>
        </button>
      </div>
      <div class="quiz-options-grid">
        ${options.map((opt, i) => `
          <button class="quiz-option" onclick="Pinyin.answerChoice('${opt}', '${correct}', this)">
            <span class="opt-letter">${['A','B','C','D'][i]}</span>
            <span class="opt-text">${opt}</span>
          </button>
        `).join('')}
      </div>
    `;
  },

  _renderTypeExercise(item, label) {
    return `
      <div class="py-ex-display">
        <div class="py-ex-big-text">${item.pinyin}</div>
        <button class="btn-audio-small" onclick="Audio.speakChinese('${item.pinyin}')">🔊</button>
      </div>
      <div class="py-ex-type-label">Tape l'${label} :</div>
      <div class="quiz-input-area">
        <input type="text" id="py-type-input" class="quiz-input" placeholder="${label}..." autocomplete="off" autocapitalize="off">
        <button class="btn-rpg btn-submit" onclick="Pinyin.submitTypeAnswer()">Valider</button>
      </div>
    `;
  },

  _renderCombineExercise(item) {
    return `
      <div class="py-ex-combine">
        <div class="py-combine-parts">
          <span class="py-combine-initial">${item.initial}</span>
          <span class="py-combine-plus">+</span>
          <span class="py-combine-final">${item.final}</span>
          <span class="py-combine-eq">=</span>
          <span class="py-combine-result">?</span>
        </div>
        <div class="py-combine-meaning">${item.meaning}</div>
      </div>
      <div class="quiz-input-area">
        <input type="text" id="py-type-input" class="quiz-input" placeholder="Écris la syllabe..." autocomplete="off" autocapitalize="off">
        <button class="btn-rpg btn-submit" onclick="Pinyin.submitTypeAnswer()">Valider</button>
      </div>
    `;
  },

  _renderRuleExercise(item) {
    return `
      <div class="py-ex-display">
        <div class="py-ex-question">${item.question}</div>
      </div>
      <div class="quiz-options-grid">
        ${item.options.map((opt, i) => `
          <button class="quiz-option" onclick="Pinyin.answerChoice('${opt.replace(/'/g, "\\'")}', '${item.answer.replace(/'/g, "\\'")}', this, '${(item.explanation || '').replace(/'/g, "\\'")}')">
            <span class="opt-letter">${['A','B','C'][i]}</span>
            <span class="opt-text">${opt}</span>
          </button>
        `).join('')}
      </div>
    `;
  },

  _renderListenTypePinyin(item) {
    return `
      <div class="py-ex-listen-area">
        <button class="listen-btn" onclick="Audio.speakChinese('${item.hanzi}')">
          <span class="listen-icon">🔊</span>
          <span>Écouter</span>
        </button>
        <div class="py-ex-meaning">${item.meaning}</div>
      </div>
      <div class="py-tone-helper-mini">💡 Tons : 1=ā 2=á 3=ǎ 4=à (ou ma1 ma2 ma3 ma4)</div>
      <div class="quiz-input-area">
        <input type="text" id="py-type-input" class="quiz-input" placeholder="Écris le pinyin..." autocomplete="off" autocapitalize="off">
        <button class="btn-rpg btn-submit" onclick="Pinyin.submitTypeAnswer()">Valider</button>
      </div>
    `;
  },

  _renderCharToPinyin(item) {
    return `
      <div class="py-ex-display">
        <div class="py-ex-hanzi">${item.hanzi}</div>
        <div class="py-ex-meaning">${item.meaning}</div>
        <button class="btn-audio-small" onclick="Audio.speakChinese('${item.hanzi}')">🔊</button>
      </div>
      <div class="py-tone-helper-mini">💡 Tons : 1=ā 2=á 3=ǎ 4=à (ou ni3 hao3)</div>
      <div class="quiz-input-area">
        <input type="text" id="py-type-input" class="quiz-input" placeholder="Écris le pinyin..." autocomplete="off" autocapitalize="off">
        <button class="btn-rpg btn-submit" onclick="Pinyin.submitTypeAnswer()">Valider</button>
      </div>
    `;
  },

  // ============================================================
  //  ANSWER HANDLERS
  // ============================================================
  answerTone(selected, correct) {
    if (this._exerciseState.answered) return;
    this._exerciseState.answered = true;

    const isCorrect = selected === correct;
    if (isCorrect) this._exerciseState.correct++;

    // Highlight buttons
    document.querySelectorAll('.py-tone-btn').forEach(btn => {
      btn.style.pointerEvents = 'none';
      const t = parseInt(btn.dataset.tone);
      if (t === correct) btn.classList.add('py-btn-correct');
      if (t === selected && !isCorrect) btn.classList.add('py-btn-wrong');
    });

    isCorrect ? Audio.playCorrect() : Audio.playWrong();
    setTimeout(() => this.nextExercise(), isCorrect ? 800 : 2000);
  },

  answerChoice(selected, correct, btnEl, explanation) {
    if (this._exerciseState.answered) return;
    this._exerciseState.answered = true;

    const isCorrect = selected === correct;
    if (isCorrect) this._exerciseState.correct++;

    // Highlight
    document.querySelectorAll('.quiz-option').forEach(opt => {
      opt.style.pointerEvents = 'none';
      const text = opt.querySelector('.opt-text').textContent;
      if (text === correct) opt.classList.add('option-correct');
      if (text === selected && !isCorrect) opt.classList.add('option-wrong');
    });

    isCorrect ? Audio.playCorrect() : Audio.playWrong();

    if (!isCorrect && explanation) {
      const body = document.getElementById('py-exercise-body');
      body.insertAdjacentHTML('beforeend', `
        <div class="py-ex-explanation">${explanation}</div>
      `);
    }

    setTimeout(() => this.nextExercise(), isCorrect ? 800 : 2500);
  },

  submitTypeAnswer() {
    if (this._exerciseState.answered) return;
    const input = document.getElementById('py-type-input');
    if (!input || !input.value.trim()) return;

    this._exerciseState.answered = true;
    const item = this._exerciseState.items[this._exerciseState.current];
    const userAnswer = input.value.trim();
    const correctAnswer = item.answer || item.pinyin;
    const isCorrect = this.matchPinyin(userAnswer, correctAnswer);

    if (isCorrect) this._exerciseState.correct++;
    isCorrect ? Audio.playCorrect() : Audio.playWrong();

    input.disabled = true;
    input.classList.add(isCorrect ? 'input-correct' : 'input-wrong');

    const body = document.getElementById('py-exercise-body');
    body.insertAdjacentHTML('beforeend', `
      <div class="py-ex-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}">
        ${isCorrect ? '✅ Correct !' : `❌ Réponse : <strong>${correctAnswer}</strong>`}
      </div>
    `);

    setTimeout(() => this.nextExercise(), isCorrect ? 1000 : 2500);
  },

  nextExercise() {
    this._exerciseState.current++;
    this.renderExercise();
  },

  showExerciseResults() {
    const state = this._exerciseState;
    const pct = Math.round((state.correct / state.total) * 100);
    const passed = pct >= 60;

    if (passed) {
      this.completeLesson(state.lessonId, pct);
      // Award XP
      const player = Storage.getPlayer();
      const xp = state.correct * 10 + (pct === 100 ? 50 : 0);
      RPG.awardXP(player, xp);
      Audio.playQuestComplete();
    } else {
      Audio.playWrong();
    }

    const el = document.getElementById('screen-pinyin');
    const grade = pct >= 90 ? 'S' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D';
    const gradeColors = { S: '#f0c040', A: '#60d080', B: '#60b0f0', C: '#f0a040', D: '#f06060' };

    el.innerHTML = `
      <div class="results-screen">
        <div class="results-header">
          <h2>${passed ? '🎉 Leçon terminée !' : '📚 Encore un effort !'}</h2>
        </div>
        <div class="results-grade" style="--grade-color: ${gradeColors[grade]}">
          <span class="grade-letter">${grade}</span>
        </div>
        <div class="results-score">
          <span class="score-num">${state.correct}</span> / ${state.total}
        </div>
        <div class="results-percent">${pct}%</div>
        ${!passed ? '<div class="py-retry-msg">Il faut au moins 60% pour débloquer la leçon suivante.</div>' : ''}
        ${passed ? `<div class="es-xp">+${state.correct * 10 + (pct === 100 ? 50 : 0)} XP</div>` : ''}
        <div class="results-actions">
          ${!passed ? `<button class="btn-rpg" onclick="Pinyin.startExercises(${state.lessonIndex})">Réessayer</button>` : ''}
          <button class="btn-rpg ${passed ? '' : 'btn-secondary'}" onclick="Pinyin.renderCourseOverview('screen-pinyin')">Retour au cours</button>
        </div>
      </div>
    `;
  },

  // ============================================================
  //  PINYIN TYPING QUIZ (for quiz menu integration)
  // ============================================================
  startTypingQuiz(count) {
    const progress = Storage.getWordProgress();
    const knownIds = Object.entries(progress).filter(([id, p]) => p.seen).map(([id]) => parseInt(id));
    const knownWords = HSK_DATA.filter(w => knownIds.includes(w.id));

    if (knownWords.length < 4) {
      UI.showToast('Apprends plus de mots d\'abord !', 'error');
      return;
    }

    // Shuffle and pick
    for (let i = knownWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [knownWords[i], knownWords[j]] = [knownWords[j], knownWords[i]];
    }
    const selected = knownWords.slice(0, Math.min(count, knownWords.length));

    this._typingQuiz = {
      words: selected,
      current: 0,
      correct: 0,
      total: selected.length,
      answers: [],
      startTime: Date.now(),
    };

    this.renderTypingQuestion();
  },

  renderTypingQuestion() {
    const tq = this._typingQuiz;
    if (!tq || tq.current >= tq.total) {
      this.showTypingResults();
      return;
    }

    const word = tq.words[tq.current];
    const el = document.getElementById('screen-quiz');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    el.classList.add('active');

    const pct = (tq.current / tq.total) * 100;

    el.innerHTML = `
      <div class="quiz-header">
        <div class="quiz-progress">
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: ${pct}%"></div>
          </div>
          <div class="quiz-progress-text">${tq.current + 1} / ${tq.total}</div>
        </div>
        <div class="quiz-score">✅ ${tq.correct}</div>
      </div>

      <div class="quiz-body" id="quiz-body">
        <div class="py-typing-prompt">
          <div class="py-typing-hanzi">${word.hanzi}</div>
          <div class="py-typing-meaning">${word.meaning}</div>
          <button class="btn-audio-small" onclick="Audio.speakChinese('${word.hanzi}')">🔊 Écouter</button>
        </div>

        <div class="py-tone-helper-mini">💡 1=ā 2=á 3=ǎ 4=à — ou tape sans tons</div>

        <div class="quiz-input-area">
          <input type="text" id="py-typing-input" class="quiz-input" placeholder="Écris le pinyin..." autocomplete="off" autocapitalize="off">
          <button class="btn-rpg btn-submit" onclick="Pinyin.submitTypingAnswer()">Valider</button>
        </div>
      </div>
    `;

    setTimeout(() => Audio.speakChinese(word.hanzi), 300);

    setTimeout(() => {
      const input = document.getElementById('py-typing-input');
      if (input) {
        input.focus();
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') Pinyin.submitTypingAnswer();
        });
      }
    }, 100);
  },

  submitTypingAnswer() {
    const tq = this._typingQuiz;
    if (!tq) return;
    const input = document.getElementById('py-typing-input');
    if (!input || !input.value.trim()) return;

    const word = tq.words[tq.current];
    const userAnswer = input.value.trim();
    const isCorrect = this.matchPinyin(userAnswer, word.pinyin);

    if (isCorrect) tq.correct++;
    tq.answers.push({ word, userAnswer, correct: isCorrect });

    isCorrect ? Audio.playCorrect() : Audio.playWrong();

    input.disabled = true;
    input.classList.add(isCorrect ? 'input-correct' : 'input-wrong');

    // Update SM-2 for recognize axis
    const wordState = Storage.getWordState(word.id);
    const quality = isCorrect ? 4 : 1;
    const newState = RPG.sm2(wordState, quality, 'recognize');
    Storage.updateWordState(word.id, newState);

    // Award XP
    if (isCorrect) {
      const player = Storage.getPlayer();
      player.totalCorrect++;
      player.totalAttempts++;
      const result = RPG.awardXP(player, RPG.XP_REWARDS.correctAnswer);
      Storage.savePlayer(player);
      UI.showXPGain(result.xpGained);
    } else {
      const player = Storage.getPlayer();
      player.totalAttempts++;
      Storage.savePlayer(player);
    }

    const body = document.getElementById('quiz-body');
    body.insertAdjacentHTML('beforeend', `
      <div class="py-typing-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}">
        <div class="ptf-result">${isCorrect ? '✅ Correct !' : '❌ Incorrect'}</div>
        <div class="ptf-correct">${word.hanzi} — <strong>${word.pinyin}</strong> — ${word.meaning}</div>
        <button class="btn-audio-small" onclick="Audio.speakChinese('${word.hanzi}')">🔊</button>
      </div>
    `);

    tq.current++;
    setTimeout(() => this.renderTypingQuestion(), isCorrect ? 1200 : 3000);
  },

  showTypingResults() {
    const tq = this._typingQuiz;
    const pct = Math.round((tq.correct / tq.total) * 100);
    const el = document.getElementById('screen-quiz');

    const grade = pct >= 90 ? 'S' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 50 ? 'C' : 'D';
    const gradeColors = { S: '#f0c040', A: '#60d080', B: '#60b0f0', C: '#f0a040', D: '#f06060' };

    const wrongAnswers = tq.answers.filter(a => !a.correct);

    el.innerHTML = `
      <div class="results-screen">
        <div class="results-header">
          <h2>${pct === 100 ? '🎉 Parfait !' : '✍️ Quiz Pinyin terminé'}</h2>
        </div>
        <div class="results-grade" style="--grade-color: ${gradeColors[grade]}">
          <span class="grade-letter">${grade}</span>
        </div>
        <div class="results-score">
          <span class="score-num">${tq.correct}</span> / ${tq.total}
        </div>
        <div class="results-percent">${pct}%</div>
        <div class="results-time">Temps : ${Math.round((Date.now() - tq.startTime) / 1000)}s</div>

        ${wrongAnswers.length > 0 ? `
          <div class="es-wrong-section">
            <h3>Mots à revoir (${wrongAnswers.length})</h3>
            <div class="es-wrong-list">
              ${wrongAnswers.map(a => `
                <div class="es-wrong-item">
                  <span class="ewi-char">${a.word.hanzi}</span>
                  <span class="ewi-pinyin">${a.word.pinyin}</span>
                  <span class="ewi-meaning">${a.word.meaning}</span>
                  <button class="btn-audio-tiny" onclick="Audio.speakChinese('${a.word.hanzi}')">🔊</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="results-actions">
          <button class="btn-rpg" onclick="Pinyin.startTypingQuiz(10)">✍️ Encore !</button>
          <button class="btn-rpg btn-secondary" onclick="App.renderQuizMenu()">Retour</button>
        </div>
      </div>
    `;

    if (pct === 100) Audio.playQuestComplete();

    // Update quest
    RPG.updateQuestProgress('quiz');
    const player = Storage.getPlayer();
    player.quizzesDone++;
    Storage.savePlayer(player);
  },

  // ============================================================
  //  KEYBOARD HELPER (floating reference)
  // ============================================================
  _helperVisible: false,

  toggleHelper() {
    this._helperVisible = !this._helperVisible;
    const overlay = document.getElementById('pinyin-helper-overlay');
    if (this._helperVisible) {
      overlay.classList.add('show');
    } else {
      overlay.classList.remove('show');
    }
  },

  renderHelper() {
    return `
      <div id="pinyin-helper-overlay" class="pinyin-helper-overlay">
        <div class="pinyin-helper-box">
          <div class="ph-header">
            <h3>拼音 Aide Pinyin</h3>
            <button class="ph-close" onclick="Pinyin.toggleHelper()">✕</button>
          </div>

          <div class="ph-section">
            <h4>Taper les tons</h4>
            <div class="ph-tone-guide">
              <div class="ph-tone-row"><span class="ph-mark">ā á ǎ à</span> <span class="ph-hint">Maintenez "a" sur le clavier mobile</span></div>
              <div class="ph-tone-row"><span class="ph-mark">ē é ě è</span> <span class="ph-hint">Maintenez "e"</span></div>
              <div class="ph-tone-row"><span class="ph-mark">ī í ǐ ì</span> <span class="ph-hint">Maintenez "i"</span></div>
              <div class="ph-tone-row"><span class="ph-mark">ō ó ǒ ò</span> <span class="ph-hint">Maintenez "o"</span></div>
              <div class="ph-tone-row"><span class="ph-mark">ū ú ǔ ù</span> <span class="ph-hint">Maintenez "u"</span></div>
              <div class="ph-tone-row"><span class="ph-mark">ǖ ǘ ǚ ǜ</span> <span class="ph-hint">Maintenez "v" ou "u"</span></div>
            </div>
            <div class="ph-alt">Ou utilisez les numéros : ma1=mā, ma2=má, ma3=mǎ, ma4=mà</div>
          </div>

          <div class="ph-section">
            <h4>Initiales (21)</h4>
            <div class="ph-grid">
              ${['b','p','m','f','d','t','n','l','g','k','h','j','q','x','zh','ch','sh','r','z','c','s'].map(i => `<span class="ph-item" onclick="Audio.speakChinese('${i === 'zh' ? 'zhi' : i === 'ch' ? 'chi' : i === 'sh' ? 'shi' : i + (i.length === 1 && !'aeiou'.includes(i) ? 'e' : '')}')">${i}</span>`).join('')}
            </div>
          </div>

          <div class="ph-section">
            <h4>Finales principales</h4>
            <div class="ph-grid">
              ${['a','o','e','i','u','ü','ai','ei','ao','ou','an','en','ang','eng','ong','ia','ie','iu','ian','in','iang','ing','ua','uo','ui','uan','un','uang'].map(f => `<span class="ph-item">${f}</span>`).join('')}
            </div>
          </div>

          <div class="ph-section">
            <h4>Les 4 tons</h4>
            <div class="ph-tones-ref">
              <span class="ph-tone-ref">1: ā — haut plat</span>
              <span class="ph-tone-ref">2: á — montant</span>
              <span class="ph-tone-ref">3: ǎ — desc-mont</span>
              <span class="ph-tone-ref">4: à — descendant</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
