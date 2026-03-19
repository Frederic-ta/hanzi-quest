// HanziQuest — World, Story, Regions, NPCs, Enemies

const REGIONS = [
  {
    id: 'village',
    name: 'Village des Premiers Pas',
    nameZh: '初步村',
    hskRange: [1],
    categories: ['salutations', 'pronoms', 'nombres'],
    color: '#50c878',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(80,200,120,0.12) 0%, transparent 60%)',
    icon: '🏘️',
    description: 'Un village paisible niché dans la vallée de 龙界. Les habitants parlent doucement et accueillent les voyageurs avec bienveillance.',
    unlockLevel: 1,
    npcs: [
      { name: '老王 (Lǎo Wáng)', role: 'Chef du village', icon: '👴',
        dialogue: [
          'Bienvenue, voyageur ! La malédiction a dispersé le savoir ancien...',
          'Apprends les mots fondamentaux pour restaurer la paix dans notre village.',
          'Chaque mot que tu maîtrises renforce la barrière contre les ténèbres.'
        ]
      },
      { name: '小花 (Xiǎo Huā)', role: 'Marchande', icon: '👧',
        dialogue: [
          'Oh ! Un nouveau visage ! Les monstres rôdent aux portes du village...',
          'Si tu apprends à parler notre langue, tu pourras les repousser !',
          'Les mots sont des sortilèges ici, souviens-toi de ça.'
        ]
      }
    ],
    enemies: [
      { name: 'Ombre Errante', nameZh: '游影', icon: '👻', hp: 40, attack: 8, xp: 30, isBoss: false,
        dialogue: 'Grrr... Tu ne connais même pas les salutations !' },
      { name: 'Rat des Ruines', nameZh: '废鼠', icon: '🐀', hp: 30, attack: 6, xp: 20, isBoss: false,
        dialogue: 'Squiik ! Essaie de me frapper avec tes mots !' },
      { name: 'Esprit de Pierre', nameZh: '石灵', icon: '🗿', hp: 50, attack: 10, xp: 40, isBoss: false,
        dialogue: 'Je suis ici depuis mille ans... prouve ta valeur.' },
    ],
    boss: {
      name: 'Gardien de Jade', nameZh: '玉守护者', icon: '🐲',
      hp: 120, attack: 15, xp: 200,
      dialogue: [
        'Je suis le Gardien de Jade, protecteur du Village !',
        'Seul celui qui maîtrise les bases peut passer...',
        'Prépare-toi au combat final !'
      ],
      defeatDialogue: 'Impressionnant... La route vers la forêt t\'est ouverte.'
    }
  },
  {
    id: 'forest',
    name: 'Forêt des Murmures',
    nameZh: '低语林',
    hskRange: [1, 2],
    categories: ['famille', 'nourriture', 'temps', 'nature', 'animaux'],
    color: '#2d8f5e',
    bgGradient: 'radial-gradient(ellipse at 30% 60%, rgba(45,143,94,0.12) 0%, transparent 60%)',
    icon: '🌲',
    description: 'Une forêt mystérieuse où les arbres chuchotent d\'anciens secrets. La brume cache des créatures étranges.',
    unlockLevel: 3,
    npcs: [
      { name: '林仙 (Lín Xiān)', role: 'Esprit de la forêt', icon: '🧚',
        dialogue: [
          'Les arbres parlent, mais seuls les initiés les comprennent...',
          'Apprends les mots de la nature et du temps pour naviguer la forêt.',
          'Attention aux Spectres Sylvestres qui rôdent la nuit.'
        ]
      }
    ],
    enemies: [
      { name: 'Spectre Sylvestre', nameZh: '林鬼', icon: '🌿', hp: 55, attack: 12, xp: 45, isBoss: false,
        dialogue: 'La forêt me protège... pas toi.' },
      { name: 'Loup de Brume', nameZh: '雾狼', icon: '🐺', hp: 65, attack: 14, xp: 50, isBoss: false,
        dialogue: 'Awoooo ! Tes mots sont faibles !' },
      { name: 'Araignée Ancienne', nameZh: '古蛛', icon: '🕷️', hp: 45, attack: 16, xp: 40, isBoss: false,
        dialogue: 'Ma toile est tissée de silence...' },
    ],
    boss: {
      name: 'Roi des Murmures', nameZh: '低语之王', icon: '🦉',
      hp: 180, attack: 20, xp: 350,
      dialogue: [
        'Qui ose troubler le silence de ma forêt ?',
        'Les mots ont du pouvoir ici... montre-moi le tien !',
        'Prépare tes sortilèges, jeune mage !'
      ],
      defeatDialogue: 'Le marché t\'attend au-delà des arbres... Va.'
    }
  },
  {
    id: 'market',
    name: 'Marché des Mille Voix',
    nameZh: '千声市场',
    hskRange: [2],
    categories: ['verbes', 'objets', 'lieux'],
    color: '#e0a040',
    bgGradient: 'radial-gradient(ellipse at 70% 40%, rgba(224,160,64,0.12) 0%, transparent 60%)',
    icon: '🏪',
    description: 'Un marché grouillant où mille langues se mêlent. Les marchands crient leurs prix et les voleurs guettent.',
    unlockLevel: 6,
    npcs: [
      { name: '商大哥 (Shāng Dàgē)', role: 'Marchand vétéran', icon: '🧔',
        dialogue: [
          'Hé ! Tu veux faire des affaires ? Il faut d\'abord parler la langue !',
          'Les verbes sont ton épée, les noms ton bouclier !',
          'Méfie-toi des Voleurs de Mots dans les ruelles sombres.'
        ]
      }
    ],
    enemies: [
      { name: 'Voleur de Mots', nameZh: '词贼', icon: '🥷', hp: 70, attack: 18, xp: 60, isBoss: false,
        dialogue: 'Je vais voler tes mots et les vendre !' },
      { name: 'Marchand Fantôme', nameZh: '幽商', icon: '👤', hp: 80, attack: 16, xp: 65, isBoss: false,
        dialogue: 'Achète ou combats, c\'est ton choix...' },
      { name: 'Golem de Monnaie', nameZh: '钱傀', icon: '🤖', hp: 90, attack: 20, xp: 70, isBoss: false,
        dialogue: 'CLANG CLANG ! Le prix est ta défaite !' },
    ],
    boss: {
      name: 'Empereur du Commerce', nameZh: '商帝', icon: '👑',
      hp: 250, attack: 25, xp: 500,
      dialogue: [
        'Ha ha ha ! Personne ne quitte mon marché sans payer !',
        'Le prix d\'entrée au Temple : ta connaissance !',
        'Voyons si tes mots valent autant que tu le crois !'
      ],
      defeatDialogue: 'Tu as... de la valeur. Le Temple t\'attend en haut.'
    }
  },
  {
    id: 'temple',
    name: 'Temple de la Montagne',
    nameZh: '山寺',
    hskRange: [2, 3],
    categories: ['adjectifs', 'outils', 'metiers', 'corps'],
    color: '#a070d0',
    bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(160,112,208,0.12) 0%, transparent 60%)',
    icon: '⛩️',
    description: 'Un temple ancien perché au sommet de la montagne. Les moines y gardent des savoirs oubliés depuis des millénaires.',
    unlockLevel: 10,
    npcs: [
      { name: '慧空 (Huì Kōng)', role: 'Grand Moine', icon: '🧘',
        dialogue: [
          'La sagesse ne vient pas de la force, mais de la compréhension.',
          'Les adjectifs donnent forme à ta pensée, les mots-outils la structurent.',
          'Le Palais du Dragon t\'attend... si tu es digne.'
        ]
      }
    ],
    enemies: [
      { name: 'Moine Corrompu', nameZh: '堕僧', icon: '😈', hp: 100, attack: 22, xp: 80, isBoss: false,
        dialogue: 'La corruption m\'a donné le pouvoir !' },
      { name: 'Tigre de Montagne', nameZh: '山虎', icon: '🐅', hp: 120, attack: 26, xp: 90, isBoss: false,
        dialogue: 'GRAAAH ! Seul le plus fort survit !' },
      { name: 'Esprit du Vent', nameZh: '风灵', icon: '🌪️', hp: 85, attack: 30, xp: 85, isBoss: false,
        dialogue: 'Tu ne peux pas frapper le vent...' },
    ],
    boss: {
      name: 'Gardien du Savoir', nameZh: '知识守卫', icon: '🐯',
      hp: 350, attack: 32, xp: 750,
      dialogue: [
        'Je garde ce temple depuis des siècles.',
        'Seuls les vrais érudits peuvent passer.',
        'Montre-moi la profondeur de ton savoir !'
      ],
      defeatDialogue: 'Tu es... un vrai lettré. Le Palais du Dragon s\'ouvre à toi.'
    }
  },
  {
    id: 'palace',
    name: 'Palais du Dragon',
    nameZh: '龙宫',
    hskRange: [3],
    categories: ['verbes', 'adjectifs', 'outils', 'lieux', 'nature', 'animaux', 'corps'],
    color: '#e05050',
    bgGradient: 'radial-gradient(ellipse at 50% 50%, rgba(224,80,80,0.12) 0%, transparent 60%)',
    icon: '🏯',
    description: 'Le palais légendaire où réside le Dragon Empereur. Seuls les maîtres du langage peuvent y accéder.',
    unlockLevel: 15,
    npcs: [
      { name: '龙使 (Lóng Shǐ)', role: 'Ambassadeur du Dragon', icon: '🐉',
        dialogue: [
          'Le Dragon Empereur t\'attend dans la salle du trône.',
          'Tu as traversé bien des épreuves pour arriver ici.',
          'Le combat final déterminera le destin de 龙界.'
        ]
      }
    ],
    enemies: [
      { name: 'Garde Impérial', nameZh: '皇卫', icon: '⚔️', hp: 140, attack: 35, xp: 100, isBoss: false,
        dialogue: 'Aucun intrus ne passera !' },
      { name: 'Dragon Mineur', nameZh: '小龙', icon: '🐲', hp: 160, attack: 38, xp: 120, isBoss: false,
        dialogue: 'Je suis le plus petit des dragons, mais ne me sous-estime pas !' },
      { name: 'Phénix Sombre', nameZh: '暗凤', icon: '🔥', hp: 150, attack: 40, xp: 110, isBoss: false,
        dialogue: 'Je renais de mes cendres... encore et encore !' },
    ],
    boss: {
      name: 'Dragon Empereur', nameZh: '龙帝', icon: '🐉',
      hp: 500, attack: 45, xp: 1500,
      dialogue: [
        'MORTEL ! Tu oses pénétrer dans MON palais ?!',
        'Je suis le Dragon Empereur, maître de 龙界 !',
        'Montre-moi que tu mérites de restaurer la langue ancienne !'
      ],
      defeatDialogue: 'Incroyable... Tu as restauré l\'équilibre de 龙界.\nTu es désormais un véritable Maître Dragon. 恭喜你！'
    }
  }
];

// Get region by ID
function getRegion(id) {
  return REGIONS.find(r => r.id === id);
}

// Check if player can access a region
function isRegionUnlocked(regionId, playerLevel) {
  const region = getRegion(regionId);
  return region && playerLevel >= region.unlockLevel;
}

// Get words for a region
function getRegionWords(regionId) {
  const region = getRegion(regionId);
  if (!region) return [];
  return HSK_DATA.filter(w => region.categories.includes(w.category));
}

// Get a random enemy from a region
function getRandomEnemy(regionId) {
  const region = getRegion(regionId);
  if (!region) return null;
  const enemies = region.enemies;
  return { ...enemies[Math.floor(Math.random() * enemies.length)] };
}

// Get the boss for a region
function getRegionBoss(regionId) {
  const region = getRegion(regionId);
  if (!region) return null;
  return { ...region.boss, isBoss: true };
}
