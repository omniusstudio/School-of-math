# Countopia — Game Design Document

## Overview

**Title**: Countopia
**Genre**: Educational village-building adventure with platformer mini-games
**Platform**: Web (Phaser.js), responsive for desktop and tablet
**Target Audience**: Kids ages 5-11 (Grades K-5)
**Core Philosophy**: Math is invisible. The child plays a game. The game runs on math.

---

## The Pitch

You're dropped into a struggling animal village as the Problem Solver. Villagers bring you challenges disguised as real-world tasks — farming, baking, building, trading. You solve them through gameplay (not quizzes), earn coins, and grow your village. Between village tasks, you run through platformer action stages to collect rewards and reach new areas. The math gets harder as your village grows, but the child never notices — they're just playing.

---

## Document Structure

The GDD is broken into stages, each in its own file:

| File | Contents |
|---|---|
| [00-overview.md](00-overview.md) | This file. High-level vision and structure. |
| [01-core-loop.md](01-core-loop.md) | The fundamental game loop, session flow, and progression system. |
| [02-village-system.md](02-village-system.md) | Village map, districts, buildings, population, happiness. |
| [03-mini-games.md](03-mini-games.md) | All mini-game designs — village tasks and platformer stages. |
| [04-difficulty-progression.md](04-difficulty-progression.md) | How difficulty scales per grade, per district, per mini-game. |
| [05-chisanbop-integration.md](05-chisanbop-integration.md) | How Chisanbop is woven in as a power-up system. |
| [06-economy-rewards.md](06-economy-rewards.md) | Coins, stars, gems, unlockables, village building costs. |
| [07-profiles-parent-dashboard.md](07-profiles-parent-dashboard.md) | Family profiles, progress tracking, parent view. |
| [08-expansion-system.md](08-expansion-system.md) | How to add new content, grades, districts, and mini-games. |
| [09-technical-architecture.md](09-technical-architecture.md) | Phaser.js setup, scene management, data storage. |

---

## Core Principles

1. **Game first, math second** — Every interaction feels like gameplay, never like a quiz.
2. **Show, don't tell** — Wrong answers cause visible consequences (wall falls, crate overflows), not red X marks.
3. **Gradual scaffolding** — Visual aids start visible, fade as confidence grows.
4. **Multiple paths** — Reward creative solutions, not just correct ones.
5. **Never punish harshly** — Everything is recoverable. Failure is gentle and funny.
6. **The world responds** — The village literally grows with the child's knowledge.
