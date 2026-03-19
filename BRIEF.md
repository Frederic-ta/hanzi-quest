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

## Priority
1. Core vocab learning + quiz system (MVP)
2. Writing practice with HanziWriter
3. RPG mechanics (XP, levels, stats)
4. Listening practice
5. Polish (animations, sound effects, advanced quests)

Build it all in one go. Make it feel like a real game, not a boring study app.
