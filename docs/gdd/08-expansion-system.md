# Stage 8: Expansion System

## Design for Growth

Countopia is built to expand without breaking what exists. New content slots into the existing framework cleanly.

---

## Expansion Types

### 1. New Mini-Games (Within Existing Districts)

**How it works**: Each district can hold unlimited mini-games. Adding a new one requires:
- A new mini-game module (code)
- Linking it to a district NPC
- Optionally: a new building that unlocks it
- Difficulty stages following the existing 8-stage + boss structure

**Example**: Adding "Pie Slicer" to the Bakery
- New game: Cut pies into requested fraction sizes
- Unlocked by building "Pie Display Case" (new building, 250 coins)
- Difficulty follows the Bakery progression stages
- No changes needed to existing Bakery games

**Implementation**:
```
/src/games/bakery/pie-slicer/
  ├── PieSlicerGame.js      (game logic)
  ├── PieSlicerScene.js      (Phaser scene)
  ├── config.js              (difficulty stages)
  └── assets.js              (asset references)
```
Register in the district config → it appears in the game.

### 2. New Districts

**How it works**: New districts are new areas on the village map with new NPCs, buildings, and mini-games.

**Requirements for a new district**:
- Map position (predefined expansion slots on the map)
- NPC character (animal) with 4 poses + props
- Background art (3 parallax layers)
- 3+ mini-games
- 8 difficulty stages per game
- 1 boss challenge
- 5-6 buildings with costs
- Background music track

**Planned expansion districts**:

| District | NPC | Math Focus | Target Grade |
|---|---|---|---|
| The Observatory | Starling (Bird) | Geometry, shapes, angles | 3-5 |
| The Garden | Chameleon | Patterns, algebra readiness | 2-4 |
| The Library | Mouse | Word problems, logic | 3-5 |
| The Workshop | Beaver | Time, measurement, units | 2-4 |
| The Post Office | Carrier Pigeon | Data, graphs, statistics | 4-5 |

**Map expansion slots**:
```
    [Observatory]
         |
    [Garden] ── EXISTING VILLAGE ── [Library]
         |                              |
    [Workshop]                    [Post Office]
```

### 3. New Platformer Stages

**How it works**: Platformer stages are modular levels. New ones are added to the stage pool.

**Each platformer stage needs**:
- A tilemap (Phaser tilemap format)
- Platform/obstacle placement
- Coin/gem placement
- Math mechanic (which type: Number Run, Coin Dash, Sky Tower, etc.)
- Difficulty rating (linked to village level)

**Stages are auto-selected** based on the child's current village level and the math skills they're working on.

### 4. New Playable Characters

**How it works**: New animal/creature characters added to the selection screen or as unlockable rewards.

**Each character needs**:
- 4 poses (idle, happy, thinking, celebrating) — 512x512px
- Portrait/icon for UI
- Unlock condition (district completion, gem collection, seasonal event)

**Planned future characters**:
- Turtle, Deer, Hedgehog, Chameleon (starter expansions)
- Griffin, Yeti, Sea Serpent (mythical unlockables)
- Seasonal: Reindeer (winter), Butterfly (spring), Firefly (summer)

### 5. New Grade Content

**How it works**: The difficulty system already supports Grades K-5. Expanding to Grade 6+ means:
- New difficulty stages (9-12) added to existing districts
- Possibly new districts for advanced topics
- The adaptive engine handles the transition — no structural changes needed

**Grade 6 expansion topics**:
- Ratios and proportions (Market expansion)
- Percentages (Bank expansion)
- Negative numbers (new district: "The Cave")
- Basic algebra (new district: "The Workshop")
- Coordinate geometry (new district: "The Observatory")

---

## Content Pipeline

### How to Add Content (Developer Workflow)

#### Adding a Mini-Game
1. Create game folder in `/src/games/[district]/[game-name]/`
2. Implement the Phaser scene extending `BaseMiniGame`
3. Define difficulty config (8 stages, 3 levers per stage)
4. Register in `/src/config/districts/[district].js`
5. Add building unlock (optional) in `/src/config/buildings.js`
6. Add assets to `/assets/games/[game-name]/`

#### Adding a District
1. Create district folder in `/src/districts/[district-name]/`
2. Define NPC, buildings, and mini-game links in config
3. Add map tile/position in `/src/config/village-map.js`
4. Add background art to `/assets/environments/`
5. Add music to `/assets/audio/music/`
6. Register unlock condition in `/src/config/progression.js`

#### Adding a Character
1. Add character sprites to `/assets/characters/[name]/`
2. Register in `/src/config/characters.js` with unlock condition
3. Add to character selection UI

---

## Versioning & Compatibility

### Save Data Versioning
- Save data includes a version number
- When the game updates, a migration function runs:
  ```
  v1 → v2: Add new district flags (default: locked)
  v2 → v3: Add new mastery skills (default: not started)
  v3 → v4: Add new currency type (default: 0)
  ```
- Existing progress is NEVER lost on update
- New content appears as locked/undiscovered — the child explores it naturally

### Feature Flags
- New content can be gated behind feature flags
- Allows gradual rollout and A/B testing
- Example: `FEATURE_OBSERVATORY_DISTRICT: false` → toggle to `true` when ready

---

## Seasonal & Event Content

### Seasonal Events (Future)
- **Winter Festival**: Special Fizz event, holiday-themed problems, snowflake decorations, winter character skins
- **Spring Garden**: Bonus Flora challenges, planting-themed math, flower decorations
- **Summer Splash**: Kai's ocean adventures, beach-themed platformer stages
- **Fall Harvest**: Double coins from Farm challenges, harvest decorations

### How Events Work
- Time-limited content (2-4 weeks)
- Special mini-game variant or platformer stage
- Exclusive cosmetic rewards (only available during event)
- After event: cosmetics stay, games rotate out
- Core game is never dependent on seasonal content

---

## Community & Sharing (Future)

### Village Showcase
- Children can screenshot/share their village layout
- "Visit" other villages (read-only) for inspiration
- No direct interaction (safety — these are kids)

### Teacher Mode (Future)
- Teachers can create a "classroom" with student profiles
- Assign specific districts or mini-games
- View class-wide progress reports
- Export data for parent-teacher conferences

### Content Editor (Far Future)
- Community-created mini-game levels
- Curated and reviewed before publishing
- Extends the game's lifespan indefinitely
