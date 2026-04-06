# Stage 9: Technical Architecture

## Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Game Engine | **Phaser 3** | Handles both top-down village and side-scroll platformer. Built-in physics, tilemaps, sprites, animation. Web-native. |
| Language | **TypeScript** | Type safety for a complex game. Better tooling and refactoring. |
| Build Tool | **Vite** | Fast dev server, hot reload, optimized production builds. |
| State Management | **Custom EventBus + Store** | Lightweight. No need for Redux/Zustand in a game context. |
| Data Storage | **LocalStorage + IndexedDB** | LocalStorage for settings. IndexedDB for larger save data (profiles, mastery tracking). |
| Audio | **Phaser Sound Manager** | Built-in. Handles music loops, SFX, volume control. |
| Deployment | **Static hosting** (Netlify/Vercel/GitHub Pages) | No backend needed initially. Pure client-side. |

---

## Project Structure

```
/School-of-math/
├── assets/
│   ├── prompts/              # AI generation prompts (already created)
│   ├── kenney/               # Kenney.nl asset packs (already downloaded)
│   ├── characters/           # Custom character sprites
│   ├── environments/         # Background layers
│   ├── ui/                   # UI icons and elements
│   ├── math-tools/           # Math visual aids
│   ├── audio/
│   │   ├── music/            # Background tracks
│   │   └── sfx/              # Sound effects
│   └── platformer/           # Platformer tilesets and level data
│
├── docs/
│   └── gdd/                  # Game Design Documents (this folder)
│
├── src/
│   ├── main.ts               # Entry point, Phaser game config
│   ├── config/
│   │   ├── game-config.ts    # Phaser config (canvas size, physics, etc.)
│   │   ├── districts.ts      # District definitions and unlock conditions
│   │   ├── buildings.ts      # Building definitions, costs, effects
│   │   ├── characters.ts     # Playable + NPC character definitions
│   │   ├── progression.ts    # XP thresholds, level requirements
│   │   ├── economy.ts        # Coin earn rates, costs, balance
│   │   └── difficulty.ts     # Difficulty lever settings per stage
│   │
│   ├── scenes/
│   │   ├── BootScene.ts      # Asset preloading
│   │   ├── TitleScene.ts     # Title screen with logo and music
│   │   ├── ProfileScene.ts   # Family profile selection
│   │   ├── CreateProfileScene.ts  # New profile creation
│   │   ├── VillageScene.ts   # Main village map (top-down)
│   │   ├── DistrictScene.ts  # Inside a district (talk to NPC, pick game)
│   │   ├── SchoolScene.ts    # Tala's school (Chisanbop)
│   │   ├── ShopScene.ts      # Character shop / building shop
│   │   └── ParentDashboard.ts # Parent view (HTML overlay, not Phaser)
│   │
│   ├── games/
│   │   ├── BaseMiniGame.ts   # Base class all mini-games extend
│   │   ├── farm/
│   │   │   ├── CrateStacker.ts
│   │   │   ├── EggCollector.ts
│   │   │   └── HarvestRows.ts
│   │   ├── bakery/
│   │   │   ├── OrderUp.ts
│   │   │   ├── RecipeMix.ts
│   │   │   └── CookieCutter.ts
│   │   ├── market/
│   │   │   ├── MakeChange.ts
│   │   │   ├── StockUp.ts
│   │   │   └── FairTrade.ts
│   │   ├── construction/
│   │   │   ├── BuildTheWall.ts
│   │   │   ├── BridgeBuilder.ts
│   │   │   └── BlueprintMatch.ts
│   │   ├── festival/
│   │   │   ├── SetTheTables.ts
│   │   │   ├── HangTheLanterns.ts
│   │   │   └── PrizeBooth.ts
│   │   ├── harbor/
│   │   │   ├── LoadTheShip.ts
│   │   │   ├── VoyageTracker.ts
│   │   │   └── TreasureSplit.ts
│   │   ├── bank/
│   │   │   ├── CoinCounter.ts
│   │   │   ├── BudgetPlanner.ts
│   │   │   └── VaultCombo.ts
│   │   └── platformer/
│   │       ├── BasePlatformer.ts
│   │       ├── NumberRun.ts
│   │       ├── CoinDash.ts
│   │       ├── SkyTower.ts
│   │       ├── BridgeDash.ts
│   │       └── BossRun.ts
│   │
│   ├── systems/
│   │   ├── SaveManager.ts    # Save/load profiles to IndexedDB
│   │   ├── DifficultyEngine.ts  # Adaptive difficulty (3 levers)
│   │   ├── MasteryTracker.ts # Per-skill mastery tracking
│   │   ├── EconomyManager.ts # Coins, stars, gems earn/spend
│   │   ├── HappinessManager.ts  # Village happiness system
│   │   ├── PopulationManager.ts # Villager count and arrivals
│   │   ├── ProgressionManager.ts # Village levels, unlocks
│   │   ├── AudioManager.ts   # Music and SFX wrapper
│   │   └── ChisanbopEngine.ts # Chisanbop hand state and validation
│   │
│   ├── ui/
│   │   ├── HUD.ts            # Top bar: coins, stars, happiness
│   │   ├── DialogBox.ts      # NPC dialogue bubbles
│   │   ├── ChisanbopOverlay.ts # Finger counting overlay
│   │   ├── RewardPopup.ts    # Coin/star/gem earned animation
│   │   ├── BuildMenu.ts      # Building purchase interface
│   │   └── TransitionScreen.ts # Scene transition animations
│   │
│   ├── entities/
│   │   ├── Player.ts         # Player avatar (movement, animation)
│   │   ├── NPC.ts            # NPC characters (idle, speech bubbles)
│   │   ├── Villager.ts       # Background ambient villagers
│   │   └── PlatformerPlayer.ts # Platformer character (run, jump, physics)
│   │
│   └── utils/
│       ├── math-problems.ts  # Problem generators per skill type
│       ├── random.ts         # Seeded random for consistent behavior
│       ├── analytics.ts      # Play session tracking (local only)
│       └── migrations.ts     # Save data version migrations
│
├── public/
│   └── index.html            # Single page, Phaser canvas mounts here
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Scene Flow

```
BootScene (load assets)
    │
    v
TitleScene (logo, "tap to start")
    │
    v
ProfileScene (pick/create profile)
    │
    v
VillageScene (main hub, walk around map)
    │
    ├──> DistrictScene (enter a district, talk to NPC)
    │       │
    │       └──> MiniGame Scene (play the game)
    │               │
    │               └──> Return to VillageScene (with rewards)
    │
    ├──> Platformer Scene (bonus stage)
    │       │
    │       └──> Return to VillageScene (with rewards)
    │
    ├──> SchoolScene (Tala's Chisanbop)
    │       │
    │       └──> Return to VillageScene
    │
    └──> ShopScene (buy buildings/cosmetics)
            │
            └──> Return to VillageScene
```

---

## Data Flow

### Problem Generation
```
DifficultyEngine.getCurrentLevel(skill)
    → returns { numberRange, scaffoldLevel, speedPressure }

MathProblemGenerator.generate(skill, difficulty)
    → returns { question, correctAnswer, visualData, hintData }

MiniGame.present(problem)
    → child interacts
    → MiniGame.evaluate(childAnswer)
        → correct: EconomyManager.earn(coins), MasteryTracker.record(skill, correct, time)
        → wrong: show consequence, MasteryTracker.record(skill, wrong, time)

DifficultyEngine.adapt(masteryData)
    → adjusts levers for next problem
```

### Save Flow
```
Every mini-game completion:
    SaveManager.save(profileData)
        → Serialize to JSON
        → Write to IndexedDB
        → Update in-memory state

On app open:
    SaveManager.load(profileId)
        → Read from IndexedDB
        → Run migrations if version mismatch
        → Hydrate game state
```

---

## Phaser Configuration

```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,          // WebGL if available, Canvas fallback
  width: 1280,
  height: 720,
  scale: {
    mode: Phaser.Scale.FIT,   // Fit to screen maintaining aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',        // Arcade physics for platformer stages
    arcade: {
      gravity: { x: 0, y: 800 },  // Only active in platformer scenes
      debug: false
    }
  },
  scene: [BootScene, TitleScene, ProfileScene, VillageScene, ...],
  pixelArt: false,            // Smooth scaling for cartoon art
  backgroundColor: '#87CEEB'  // Sky blue default
};
```

---

## Performance Targets

| Metric | Target |
|---|---|
| Initial load | < 5 seconds on 4G |
| Scene transition | < 1 second |
| Frame rate | 60fps on modern devices, 30fps minimum |
| Memory | < 200MB active |
| Save data | < 1MB per profile |
| Total download | < 50MB (initial), lazy-load districts |

### Asset Loading Strategy
- **Boot**: Load UI, common assets, first district
- **Lazy**: Load district assets when the child first enters that district
- **Preload hint**: When a district is about to unlock, preload its assets in background
- **Audio**: Stream music, preload SFX

---

## Development Phases

### Phase 1: Foundation (What We Build First)
- Project setup (Vite + Phaser + TypeScript)
- Boot, Title, Profile scenes
- Village map (static, one district open)
- One mini-game (Crate Stacker)
- Basic economy (earn coins, display counter)
- Save/load system
- Basic HUD

### Phase 2: Core Loop
- Full Farm district (3 mini-games)
- Difficulty engine (3 levers)
- Mastery tracking
- Happiness system
- Building purchase system
- NPC dialogue system

### Phase 3: Expansion
- Second district (Bakery or Market)
- Platformer stages (Number Run, Coin Dash)
- Chisanbop overlay
- Character shop

### Phase 4: Full Game
- All 8 districts
- All mini-games
- All platformer stage types
- Boss challenges
- Parent dashboard
- All difficulty stages K-5

### Phase 5: Polish
- Custom art integration (replace Kenney placeholders)
- Music and SFX
- Animations and particle effects
- Performance optimization
- Cross-device testing
