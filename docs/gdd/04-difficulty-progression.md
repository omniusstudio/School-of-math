# Stage 4: Difficulty Progression

## How Difficulty Works

Difficulty is **adaptive** — it adjusts based on the child's performance, not just their grade level. Grade level sets the starting point, but the game watches accuracy and speed to move up or down.

---

## Adaptive Difficulty Engine

### The Three Levers

Every mini-game has three difficulty levers that the system adjusts independently:

#### 1. Number Range
How big the numbers are.

| Level | Range | Example |
|---|---|---|
| 1 | 1-5 | 2 + 3 |
| 2 | 1-10 | 7 + 4 |
| 3 | 1-20 | 14 + 8 |
| 4 | 1-50 | 37 + 15 |
| 5 | 1-100 | 64 + 28 |
| 6 | 1-1000 | 245 + 387 |

#### 2. Scaffolding (Visual Support)
How much visual help is provided.

| Level | Support | Description |
|---|---|---|
| 1 | Full visual | All objects visible, countable, draggable. Number line shown. |
| 2 | Partial visual | Objects shown but not individually countable. Groups shown. |
| 3 | Minimal visual | Only the numbers shown, no objects. Tools available on request. |
| 4 | Mental only | No visuals. Answer input only. Hint button available (costs coins). |

#### 3. Speed Pressure
How much time pressure exists.

| Level | Pressure | Description |
|---|---|---|
| 1 | None | No timer. Take as long as you want. |
| 2 | Gentle | Timer exists but is very generous. Visual only, no penalty. |
| 3 | Moderate | Timer visible, bonus coins for speed. No penalty for slow. |
| 4 | Fast | Timer with consequences (fewer coins if slow). |
| 5 | Rush | Rapid-fire mode. Speed IS the game. Maximum coins for fast answers. |

---

## How the System Adapts

### Moving Up (Getting Harder)
A lever increases by 1 when:
- The child gets **5 correct in a row** at the current level
- Their accuracy over the last 10 problems is **90%+**
- Their average response time is **decreasing** (getting faster)

### Moving Down (Getting Easier)
A lever decreases by 1 when:
- The child gets **3 wrong in a row**
- Their accuracy over the last 10 problems drops **below 60%**
- They use hints **more than 50%** of the time

### Which Lever Moves First?
The system prioritizes levers in this order:
1. **Scaffolding decreases first** (fade visuals before making numbers harder)
2. **Number range increases second** (bigger numbers once they don't need visuals)
3. **Speed pressure increases last** (speed only after accuracy is solid)

This ensures the child builds understanding (scaffolding fade) before being challenged with harder numbers, and only faces speed pressure when they're truly confident.

---

## Per-District Difficulty Maps

### THE FARM — Addition & Subtraction

| Stage | Number Range | Problem Types | Scaffolding |
|---|---|---|---|
| Farm 1 | 1-5 | Count objects, "how many?" | Full: all objects visible, tap to count |
| Farm 2 | 1-10 | Add two groups | Full: two groups of objects, drag together |
| Farm 3 | 1-10 | Subtract (take away) | Full: objects that can be removed |
| Farm 4 | 1-15 | Making 10 (fill crates) | Partial: crate shows how many more needed |
| Farm 5 | 1-20 | Add/subtract mixed | Partial: number line available |
| Farm 6 | 10-50 | Add/subtract with tens | Minimal: tens and ones blocks |
| Farm 7 | 10-100 | Multi-digit add/subtract | Minimal: place value chart available |
| Farm 8 | 1-100 | Mental math challenge | Mental: no visuals, hint button only |
| BOSS | 1-100 | Mixed farm problems, rapid-fire | Adaptive based on current levels |

### THE BAKERY — Multiplication

| Stage | Number Range | Problem Types | Scaffolding |
|---|---|---|---|
| Bakery 1 | Groups of 2 | Count groups of 2 (2,4,6,8) | Full: objects in visible pairs |
| Bakery 2 | Groups of 5 | Count groups of 5 | Full: objects in visible groups |
| Bakery 3 | Groups of 10 | Count groups of 10 | Full: ten-frames visible |
| Bakery 4 | 2x, 5x, 10x | Multiply small numbers | Partial: array grid shown |
| Bakery 5 | 3x, 4x | Expand times tables | Partial: array with some dots hidden |
| Bakery 6 | 6x, 7x, 8x | Harder times tables | Minimal: empty array grid |
| Bakery 7 | 9x, 11x, 12x | Complete times tables | Minimal: Chisanbop hint available |
| Bakery 8 | Any combo | Multi-digit × single digit | Mental: no visuals |
| BOSS | All above | Mixed bakery problems | Adaptive |

### THE MARKET — Money & Mixed Add/Subtract

| Stage | Number Range | Problem Types | Scaffolding |
|---|---|---|---|
| Market 1 | 1-10 coins | Count coins | Full: all coins visible |
| Market 2 | 1-25 coins | Make exact amounts | Full: coin tray with all denominations |
| Market 3 | 1-50 coins | Make change (subtraction) | Partial: coins available, no counting aid |
| Market 4 | 1-100 coins | Budget (stay under limit) | Partial: running total shown |
| Market 5 | Dollars+cents | Decimal money intro | Full: dollars and cents separated |
| Market 6 | $1-$20 | Multi-item purchases | Minimal: calculator not available |
| Market 7 | $1-$50 | Budgeting, trade-offs | Minimal: mental estimation needed |
| Market 8 | $1-$100 | Complex transactions | Mental: no aids |
| BOSS | All above | Market day rush | Adaptive |

### THE CONSTRUCTION YARD — Subtraction & Measurement

| Stage | Number Range | Problem Types | Scaffolding |
|---|---|---|---|
| Const 1 | 1-10 | Count blocks, simple build | Full: blocks visible and countable |
| Const 2 | 1-20 | "How many more needed?" | Full: target shown, current count shown |
| Const 3 | 1-30 | Decompose numbers for building | Partial: block bundles (1s and 10s) |
| Const 4 | 1-50 | Multi-step building | Partial: blueprint with some measurements |
| Const 5 | 1-100 | Missing number problems | Minimal: equation format |
| Const 6 | 1-100 | Measurement and comparison | Minimal: ruler tool available |
| Const 7 | 1-200 | Area and perimeter intro | Mental: grid only |
| Const 8 | 1-500 | Complex builds | Mental: no aids |
| BOSS | All above | Grand construction | Adaptive |

### THE FESTIVAL — Division

| Stage | Number Range | Problem Types | Scaffolding |
|---|---|---|---|
| Fest 1 | Divide into 2 | Share between 2 | Full: drag items to 2 groups |
| Fest 2 | Divide into 3-4 | Share between 3-4 | Full: drag to groups |
| Fest 3 | Divide into 5-6 | Share between 5-6 | Partial: groups shown, count per group hidden |
| Fest 4 | Any ÷ 2-6 | Division with remainders | Partial: remainder pile visible |
| Fest 5 | Any ÷ 2-10 | Larger division problems | Minimal: grouping tool available |
| Fest 6 | 2-digit ÷ 1-digit | Long division concept | Minimal: place value aid |
| Fest 7 | 3-digit ÷ 1-digit | Complex division | Mental: no aids |
| Fest 8 | Mixed | Division in context | Mental: estimation first |
| BOSS | All above | Festival planning rush | Adaptive |

### THE HARBOR — Fractions

| Stage | Number Range | Problem Types | Scaffolding |
|---|---|---|---|
| Harbor 1 | Halves | Identify 1/2 | Full: fraction circles, cut in half |
| Harbor 2 | Quarters | Identify 1/4, 2/4, 3/4 | Full: fraction circles and bars |
| Harbor 3 | Thirds, Fifths | More fractions | Full: fraction visuals |
| Harbor 4 | Mixed unit fracs | Compare fractions | Partial: fraction bars side by side |
| Harbor 5 | Equivalent | Find equivalent fractions | Partial: overlay tool |
| Harbor 6 | Add fractions | Same denominator | Minimal: fraction bar available |
| Harbor 7 | Add/sub fractions | Different denominator | Minimal: hint on common denominator |
| Harbor 8 | Mixed numbers | Improper fractions, mixed | Mental: no visuals |
| BOSS | All above | Voyage calculation challenge | Adaptive |

### THE BANK — Decimals & Mixed

| Stage | Number Range | Problem Types | Scaffolding |
|---|---|---|---|
| Bank 1 | Tenths | 0.1, 0.2... 0.9 | Full: place value chart with blocks |
| Bank 2 | Hundredths | 0.01 - 0.99 | Full: grid shading |
| Bank 3 | Ones + decimals | 1.5, 3.75, etc. | Partial: number line with decimals |
| Bank 4 | Add decimals | Same as adding money | Partial: column alignment shown |
| Bank 5 | Subtract decimals | Money context | Minimal: no alignment help |
| Bank 6 | Multiply decimals | Simple cases | Minimal: estimation first |
| Bank 7 | Mixed operations | Multi-step problems | Mental: word problems |
| Bank 8 | Order of operations | PEMDAS intro | Mental: equation building |
| BOSS | All above | Bank audit challenge | Adaptive |

---

## Grade-Level Starting Points

When a child selects their grade, the game sets initial difficulty levels:

| Grade | Starting Districts | Number Range | Scaffolding | Speed |
|---|---|---|---|---|
| K | Farm (stage 1) | Level 1 (1-5) | Level 1 (full) | Level 1 (none) |
| 1 | Farm (stage 2) | Level 2 (1-10) | Level 1 (full) | Level 1 (none) |
| 2 | Farm (stage 4) + Bakery (stage 1) | Level 3 (1-20) | Level 2 (partial) | Level 1 (none) |
| 3 | Market + Bakery (stage 4) | Level 4 (1-50) | Level 2 (partial) | Level 2 (gentle) |
| 4 | Construction + Festival + Harbor (stage 1) | Level 4 (1-50) | Level 3 (minimal) | Level 2 (gentle) |
| 5 | Harbor + Bank | Level 5 (1-100) | Level 3 (minimal) | Level 3 (moderate) |

A child can always go back to earlier districts for review — this counts as practice, still earns (fewer) coins, and helps retention.
