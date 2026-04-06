# Stage 7: Profiles & Parent Dashboard

## Family Profile System

### Home Screen
- The app opens to a family home screen
- Up to **6 profiles** can be created
- Each profile shows: character avatar, name, village level
- Tap a profile to enter that child's village
- "Add Player" button to create new profiles
- Settings gear in the corner

### Profile Creation
1. Enter name (text input, max 12 characters)
2. Select age (5-11, picker wheel)
3. Select grade (K-5, picker wheel)
4. Choose animal character (8 options in a 2x4 grid)
5. Character does a celebration dance → "Welcome to Countopia, [Name]!"

### Profile Data (Stored Per Profile)
```
{
  name: "Luna",
  age: 7,
  grade: 2,
  character: "fox",
  villageLevel: 12,
  coins: 347,
  stars: { bronze: 14, silver: 8, gold: 3 },
  gems: { ruby: 2, emerald: 1, sapphire: 0 },
  happiness: 73,
  population: 22,
  buildings: [...],
  unlockedDistricts: ["farm", "school", "market", "bakery"],
  unlockedCharacters: ["fox", "dragon"],
  mastery: {
    "addition-within-10": { accuracy: 95, scaffoldLevel: 4, mastered: true },
    "addition-within-20": { accuracy: 82, scaffoldLevel: 3, mastered: false },
    "multiplication-2x": { accuracy: 78, scaffoldLevel: 2, mastered: false },
    ...
  },
  settings: { volume: 0.8, musicOn: true, sfxOn: true },
  stats: {
    totalProblemsAttempted: 312,
    totalCorrect: 267,
    totalPlayTime: 1840, // minutes
    longestStreak: 12,
    sessionsPlayed: 28,
    lastPlayed: "2026-04-05"
  }
}
```

### Profile Switching
- Tap the home icon from anywhere → returns to family home screen
- No password protection by default (kids, simplicity)
- Optional: parent can enable a simple parent lock (hold 3 dots for 3 seconds)

---

## Parent Dashboard

### Accessing the Dashboard
- From the home screen, tap and hold the settings gear for 3 seconds
- Or: tap settings → "Parent Dashboard"
- Simple gate: solve a quick adult math problem ("What is 47 × 13?") to prevent kids from accidentally entering

### Dashboard Overview

Shows a card for each child profile:

```
┌──────────────────────────────────────┐
│  🦊 Luna (Grade 2)                   │
│  Village Level: 12                    │
│  Total Play Time: 30 hours            │
│  Sessions: 28 | Last: Yesterday       │
│  Overall Accuracy: 86%                │
│  [View Details]                       │
└──────────────────────────────────────┘
```

### Detailed Child View

#### Progress Tab
- **Skills mastered**: List of math skills with check/in-progress/not-started indicators
- **Current working level**: What the child is actively learning
- **Districts unlocked**: Visual map showing progress
- **Village level & growth chart**: Line graph of village level over time

#### Strengths & Areas to Grow
- **Strong areas**: Skills with 85%+ accuracy (green)
- **Growing areas**: Skills with 60-85% accuracy (yellow)
- **Needs practice**: Skills below 60% accuracy (orange, gentle language)
- No red. No "failing." The language is always positive.

#### Activity Tab
- **Play frequency**: Calendar heatmap (like GitHub contributions) showing days played
- **Average session length**: How long they typically play
- **Problems per session**: How many they attempt
- **Streak history**: Longest streaks and when they occurred

#### Skills Breakdown
Expandable list by category:

```
▸ Counting & Number Sense
  ✅ Count to 20
  ✅ Count to 100
  ✅ Number bonds to 10
  🔄 Number bonds to 20 (78% accuracy)

▸ Addition
  ✅ Addition within 10
  🔄 Addition within 20 (82% accuracy)
  ○ Addition within 100 (not started)

▸ Multiplication
  🔄 Multiply by 2 (71% accuracy)
  ○ Multiply by 5 (not started)
```

#### Recommendations
The dashboard suggests activities based on the child's data:
- "Luna is doing great with addition! She might enjoy trying the Bakery for multiplication."
- "Luna's accuracy dips with numbers above 15. The Farm's Crate Stacker game would help reinforce making 10."
- "Luna hasn't visited the School in a while. A Chisanbop refresher could help with her current challenges."

---

## Settings

### Per-Profile Settings
- Music volume (slider)
- SFX volume (slider)
- Music on/off toggle
- SFX on/off toggle
- Text size (small, medium, large)
- Session time reminder (off, 15min, 30min, 45min, 60min) — gentle "time for a break!" message

### Global Settings
- Language (future: multi-language support)
- Reset profile (requires parent gate)
- Delete profile (requires parent gate + confirmation)
- Export progress (future: PDF report for teachers)
- About / Credits / Licenses

---

## Notifications & Gentle Nudges

### In-App Nudges (Not Push Notifications)
- **Session timer**: If enabled, a friendly message after the set time: "You've been playing for 30 minutes! Great job today. Want to keep going or take a break?" Two buttons: "Keep Playing" / "Save & Exit"
- **Welcome back**: If 3+ days since last play: "Countopia missed you! [Character] is excited to see you!" (+25 coin bonus)
- **Streak reminder**: At the end of a session: "You're on a 5-day streak! Come back tomorrow to keep it going!"

### No Aggressive Monetization
- No ads. Ever.
- No "lives" system that gates play
- No "pay to skip" or "pay to continue"
- No push notifications harassing parents
- This is a learning tool, not an engagement trap
