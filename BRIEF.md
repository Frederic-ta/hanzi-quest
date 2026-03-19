# HanziQuest — Chinese Learning RPG Web App

## Concept
A mobile-first web app to learn Mandarin Chinese from scratch, gamified with RPG mechanics.
Target: complete beginner (Fred). Goal: learn LOTS of vocabulary + writing + listening.

## Core Features

### 1. Vocabulary System
- Words organized by HSK levels (HSK1 → HSK6) as "dungeons/worlds"
- Each word shows: Chinese character, pinyin, meaning (French), audio (Web Speech API)
- Flashcard mode with spaced repetition (SM-2 algorithm or similar)
- Categories: greetings, numbers, food, daily life, etc.

### 2. Writing Practice
- Use **HanziWriter** library (https://hanziwriter.org)
- Stroke order animation (learn mode)
- Drawing quiz: user draws character with finger on phone, app checks stroke order
- Satisfying feedback on correct strokes

### 3. Listening Practice  
- Web Speech API for TTS in Chinese
- Quiz: hear a word → pick the right meaning
- Quiz: hear a word → write the pinyin

### 4. RPG Mechanics
- **XP** earned from every exercise
- **Levels** — level up unlocks new content/worlds
- **Stats**: 
  - 🗡️ Attack = Vocabulary mastered
  - 🛡️ Defense = Grammar knowledge
  - 👂 Perception = Listening accuracy
  - ✍️ Dexterity = Writing (stroke accuracy)
- **Daily streak** 🔥 with bonus XP
- **Quests/missions** — "Learn 10 new words today", "Perfect score on writing quiz"
- **Character avatar** that evolves with level
- Sound effects for level up, correct answers, streaks

### 5. Quiz Types
- Meaning → Character (multiple choice)
- Character → Meaning (multiple choice)
- Pinyin → Character
- Listen → Pick answer
- Write the character (HanziWriter quiz mode)
- Fill in the blank (sentences)

### 6. Progress Dashboard
- Words learned / total
- Current level + XP bar
- Streak counter
- Stats radar chart
- Recent activity

## Technical Requirements
- **100% client-side** — HTML/CSS/JS, NO server, NO API keys
- **Mobile-first** responsive design (primarily used on phone)
- **Offline-capable** — localStorage for all progress data
- **Single page app** — no framework, vanilla JS
- **Libraries allowed**: HanziWriter (CDN)
- **TTS**: Web Speech API (built into browsers)
- **Data**: Embed HSK word lists directly in JS (start with HSK1 = ~150 words)
- **Storage**: localStorage for progress, stats, streak data
- **Language**: French UI (Fred is French)

## Design
- Dark theme (matches Fred's preference)
- RPG aesthetic — pixel-art inspired UI elements where appropriate
- Satisfying animations (level up, streak, correct answer)
- Touch-friendly: big buttons, swipe gestures where useful
- Color palette: dark background, gold accents for XP/achievements, green for correct, red for wrong

## File Structure
```
index.html          — Main entry point
css/
  style.css         — All styles
js/
  app.js            — Main app logic, routing
  data.js           — HSK word lists with pinyin, meaning, etc.
  rpg.js            — RPG system (XP, levels, stats, quests)
  quiz.js           — Quiz engine
  writing.js        — HanziWriter integration
  audio.js          — TTS and sound effects
  storage.js        — localStorage management
  ui.js             — UI components and animations
```

## HSK1 Sample Data Structure
```js
{
  id: 1,
  hanzi: "你好",
  pinyin: "nǐ hǎo", 
  meaning: "Bonjour",
  category: "greetings",
  hsk: 1,
  sentences: ["你好，我叫小明。"]
}
```

## Storytelling & World Building
The app should feel like a REAL video game RPG, not just a study tool with RPG skin.

### Story
- The player is a traveler who arrives in a mystical ancient Chinese realm called **龙界 (Lóngjiè — The Dragon Realm)**
- The land is divided into regions, each corresponding to a theme/HSK level
- A curse has scattered the knowledge of the ancient language — the player must restore it
- NPCs give quests and lore as the player progresses
- Each region has a guardian boss that tests the player's knowledge before they can advance

### Regions (Worlds)
1. **Village des Premiers Pas** (HSK1) — Peaceful village, basics of survival (greetings, numbers, food)
2. **Forêt des Murmures** (HSK1-2) — Mysterious forest, nature & animals vocabulary
3. **Marché des Mille Voix** (HSK2) — Bustling market, commerce, daily life
4. **Temple de la Montagne** (HSK2-3) — Mountain temple, deeper knowledge, abstract concepts
5. **Palais du Dragon** (HSK3+) — Final palace, advanced vocabulary, mastery

### Skill Tree
Visual skill tree (like a real RPG) with branches:
- 🗣️ **Voie du Parleur** — Speaking/pronunciation mastery
  - Tone recognition → Pinyin mastery → Sentence flow → Conversation
- ✍️ **Voie du Calligraphe** — Writing mastery
  - Basic strokes → Simple characters → Compound characters → Speed writing
- 👂 **Voie de l'Écoute** — Listening comprehension
  - Single words → Short phrases → Full sentences → Natural speech
- 📚 **Voie du Lettré** — Vocabulary & grammar
  - Common words → Phrases → Grammar patterns → Idioms (成语)
- Each node in the tree requires specific achievements to unlock
- Completing a branch gives a title/badge

### Boss Fights
- End of each region = boss quiz (harder, mixed question types, timed)
- Must score 80%+ to pass
- Boss has a name, portrait description, and dialogue

### Themes & UI
- Each region has its own color palette and ambient description
- Region selector looks like a world map
- Character avatar evolves: traveler → scholar → sage → dragon master
- Achievement badges displayed on profile

## Priority
1. Core vocab learning + quiz system (MVP)
2. RPG world/story/regions system
3. Writing practice with HanziWriter
4. Skill tree
5. Boss fights
6. Listening practice
7. Polish (animations, sound effects, achievements)

Build it all in one go. Make it feel like a real game, not a boring study app.
