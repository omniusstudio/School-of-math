# Stage 2: Village System

## Village Map

The village is a top-down/isometric scrollable map. It starts small and grows as the child progresses. Districts are revealed by lifting fog when unlock conditions are met.

---

## Districts

### Layout

```
                    ┌──────────────┐
                    │   HARBOR     │ ← ocean on the edge
                    │  (Capt. Kai) │
                    └──────┬───────┘
                           │
    ┌──────────────┐  ┌────┴───────┐  ┌──────────────┐
    │   FESTIVAL   │──│  VILLAGE   │──│    MARKET    │
    │   (Fizz)     │  │  CENTER    │  │   (Mara)     │
    └──────────────┘  └────┬───────┘  └──────────────┘
                           │
    ┌──────────────┐  ┌────┴───────┐  ┌──────────────┐
    │    SCHOOL    │──│    FARM    │──│   BAKERY     │
    │   (Tala)     │  │  (Flora)   │  │   (Ben)      │
    └──────────────┘  └────┬───────┘  └──────────────┘
                           │
                    ┌──────┴───────┐  ┌──────────────┐
                    │ CONSTRUCTION │──│    BANK      │
                    │   (Brix)     │  │  (Bloom)     │
                    └──────────────┘  └──────────────┘
```

### Unlock Order (Flexible Based on Grade)

The first district to unlock depends on the child's grade level. After that, the child can choose which district to explore next (with some gating).

**Grade K-1 start**: Farm → Market → School (Chisanbop) → Construction
**Grade 2-3 start**: Farm → Bakery → School → Market → Construction
**Grade 4-5 start**: Market → Bakery → Construction → Harbor → Bank

| District | Unlock Condition | NPC | Math Focus |
|---|---|---|---|
| Village Center | Always open | — | Hub, building, profile |
| The Farm | Default first district | Farmer Flora (Cow) | Counting, addition, grouping |
| The School | Unlocks at Village Level 3 | Teacher Tala (Tortoise) | Chisanbop lessons, practice |
| The Market | Village Level 6 | Merchant Mara (Raccoon) | Addition, subtraction, money |
| The Bakery | Village Level 10 | Baker Ben (Pig) | Arrays, multiplication |
| The Construction Yard | Village Level 15 | Builder Brix (Gorilla) | Subtraction, measurement |
| The Festival Grounds | Village Level 20 | Festival Fizz (Monkey) | Division, equal sharing |
| The Harbor | Village Level 28 | Captain Kai (Parrot) | Fractions, parts of whole |
| The Bank | Village Level 36 | Banker Bloom (Owl) | Decimals, mixed operations |

---

## Buildings

Each district has buildable/upgradable structures. Buildings serve two purposes:
1. **Visual reward** — The village looks better
2. **Gameplay unlock** — New mini-games or features become available

### Village Center Buildings

| Building | Cost | Effect |
|---|---|---|
| Town Fountain (starter) | Free | Center of village, always there |
| Notice Board | 50 coins | Shows daily challenges |
| Clock Tower | 200 coins | Shows session timer, streak counter |
| Village Hall | 500 coins | Unlocks parent dashboard access |
| Garden Park | 150 coins | Decorative, +5 max happiness |
| Statue | 1000 coins | Decorative milestone, +10 happiness |

### Farm Buildings

| Building | Cost | Effect |
|---|---|---|
| Small Field (starter) | Free | Basic counting mini-game |
| Apple Orchard | 100 coins | Unlocks Crate Stacker mini-game |
| Chicken Coop | 200 coins | Unlocks grouping mini-game |
| Barn | 350 coins | Unlocks larger number problems |
| Silo | 500 coins | Unlocks place value mini-game |
| Windmill | 750 coins | Boss challenge unlocks |

### Bakery Buildings

| Building | Cost | Effect |
|---|---|---|
| Small Oven (starter) | Free | Basic array mini-game |
| Counter | 150 coins | Unlocks Order Up mini-game |
| Display Case | 300 coins | Unlocks larger arrays |
| Second Oven | 500 coins | Unlocks speed challenges |
| Recipe Book Shelf | 400 coins | Unlocks multi-step problems |
| Grand Bakery Sign | 700 coins | Boss challenge unlocks |

### Pattern continues for all districts...

Each district follows the same structure:
- 1 free starter building
- 4-5 purchasable buildings (100-750 coins)
- Buildings unlock progressively harder mini-games
- Final building unlocks the district boss challenge

---

## Population System

### How Population Works
- Village starts with 5 villagers (the NPCs from the first district)
- New villagers arrive when happiness is high and milestones are hit
- Each new villager has a small arrival animation (walking in with a suitcase)
- Villagers walk around the village as ambient background characters
- More villagers = more lively village = more motivated child

### Population Milestones

| Population | Trigger | Bonus |
|---|---|---|
| 5 | Start | — |
| 10 | Complete Farm tutorial | New district hint |
| 15 | Village Level 5 | Unlock character customization shop |
| 25 | Village Level 10 | Platformer stages begin |
| 40 | Village Level 20 | Unlock daily challenges |
| 60 | Village Level 30 | Unlock multiplayer challenges (future) |
| 80 | Village Level 40 | Master Problem Solver title |
| 100 | Village Level 50 | Full village, golden statue, fireworks |

---

## Happiness System

### How Happiness Works
- Happiness is a meter from 0-100, displayed as a face icon (5 states)
- Starts at 50 (neutral)
- Goes UP when: correct answers (+2), streaks (+5), buildings built (+10), boss beaten (+15)
- Goes DOWN when: wrong answers (-1), inactivity over 3 days (-5 per day, min 20)
- Happiness never drops below 20 (village never feels abandoned)

### Happiness Effects

| Range | Face | Village Effect |
|---|---|---|
| 0-20 | Very Sad | Grey tint, villagers inside, rain clouds |
| 21-40 | Sad | Muted colors, few villagers out, overcast |
| 41-60 | Neutral | Normal colors, normal activity |
| 61-80 | Happy | Bright colors, villagers waving, flowers blooming |
| 81-100 | Very Happy | Golden glow, music plays, confetti, festival flags appear |

### Happiness Events
- **Festival**: When happiness hits 90+, Fizz triggers a bonus festival event with extra coin rewards
- **Villager gifts**: At 80+ happiness, random villagers leave small gifts (bonus coins, cosmetic items)
- **Recovery boost**: If happiness was low and the child plays again, the first correct answer gives +10 happiness ("The village is so glad you're back!")
