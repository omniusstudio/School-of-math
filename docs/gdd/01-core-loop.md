# Stage 1: Core Game Loop

## The Loop

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   VILLAGE MAP ──> PICK A VILLAGER ──> MINI-GAME         │
│       ^                                   │             │
│       │                                   v             │
│       │                              WIN / LOSE         │
│       │                                   │             │
│       │          EARN COINS <─────────────┘             │
│       │              │                                  │
│       │              v                                  │
│       │         BUILD / UPGRADE                         │
│       │              │                                  │
│       │              v                                  │
│       └──── VILLAGE GROWS ──> NEW CONTENT UNLOCKS       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Periodically between village tasks:

```
   PLATFORMER STAGE (bonus) ──> COLLECT COINS/GEMS ──> BACK TO VILLAGE
```

---

## Session Flow (A Typical 15-20 Minute Session)

### 1. Open App → Profile Select (30 seconds)
- Family home screen shows all profiles (animal avatars)
- Tap your character → load your village

### 2. Village Loads (10 seconds)
- Your village appears with its current state
- Speech bubbles appear over 2-3 villagers who need help
- Happiness meter and coin counter visible at top

### 3. Pick a Villager (player's choice)
- Tap a villager with a speech bubble
- Short dialogue line (1-2 sentences, no reading walls)
- Transition to mini-game

### 4. Play Mini-Game (2-5 minutes)
- The core gameplay — varies by district
- Complete the task → earn coins + happiness
- Fail → gentle consequence, try again option

### 5. Return to Village (30 seconds)
- See rewards animate (coins fly to counter, happiness ticks up)
- If enough progress: a building upgrade animation plays
- New speech bubbles may appear on other villagers

### 6. Optional: Platformer Stage (2-3 minutes)
- Between every 3-4 village tasks, a platformer stage unlocks
- "A path has opened to a new area! Run through it!"
- Side-scrolling action with math baked into the platforming
- Bonus coins and hidden gems

### 7. Repeat or Exit
- The child keeps playing as long as they want
- No forced session length
- Progress auto-saves constantly

---

## Progression System

### Village Level
The village has an overall level (1-50) that increases as the child solves problems.

| Village Level | What Happens |
|---|---|
| 1-5 | Tutorial zone. One district open. Simple problems. |
| 6-10 | Second district unlocks. Platformer stages begin. |
| 11-15 | Third district unlocks. Mini-games get harder. |
| 16-20 | Fourth district unlocks. Boss challenges appear. |
| 21-30 | Fifth-sixth districts. Multi-step problems. |
| 31-40 | Advanced districts. Strategy selection matters. |
| 41-50 | Master level. Mental math challenges. Full village. |

### XP System (Hidden)
- The child never sees "XP" — they see village growth
- Every correct answer gives hidden XP
- XP thresholds trigger: new villagers arriving, buildings upgrading, districts unlocking
- Streaks multiply XP (3 in a row = 2x, 5 in a row = 3x)

### Mastery Tracking (Per Skill)
Each math skill is tracked internally:

```
Skill: "Addition within 20"
├── Exposure count: 47 (times they've encountered this)
├── Accuracy: 89% (last 20 attempts)
├── Speed trend: improving
├── Scaffolding level: 2 of 4 (visuals fading)
└── Mastered: false (needs 90%+ on scaffolding level 4)
```

When a skill is mastered, the game:
1. Reduces how often that skill appears
2. Introduces the next skill in the sequence
3. Occasionally brings it back for retention checks

---

## First-Time Experience (FTUE)

### Step 1: Story Intro (1 minute)
- Animated scroll with narration text
- "A village far away needs your help..."
- Sets the story without a long cutscene

### Step 2: Profile Creation (1 minute)
- Enter name
- Pick age / grade
- Choose your animal character (8 options in a grid)
- Character does a little celebration dance

### Step 3: Arrive in Countopia (30 seconds)
- Short animation: your character walks over a hill, sees the village
- Village map loads with fog everywhere except Village Center + one district

### Step 4: First Villager Interaction (2 minutes)
- A villager approaches automatically (no searching needed)
- Very simple first problem (e.g., "help me count these 5 apples")
- Full visual support, very forgiving
- Guaranteed success → big celebration → first coins earned

### Step 5: First Build (1 minute)
- "You have enough coins to build something!"
- One building option highlighted
- Tap to build → construction animation → building appears
- Village visually changes for the first time

### Step 6: Free Play
- Tutorial rails come off
- Multiple villagers now have speech bubbles
- Child explores at their own pace

---

## Save System

- **Auto-save** after every completed mini-game
- **Local storage** (browser) as primary
- **Cloud sync** (optional, future) for cross-device play
- Save data includes:
  - Profile info (name, character, grade)
  - Village state (buildings, level, population)
  - Economy (coins, stars, gems)
  - Mastery data (per-skill tracking)
  - Unlocked characters and items
  - Settings (volume, accessibility options)
