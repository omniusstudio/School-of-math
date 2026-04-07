import type { ProfileData, MasteryData } from './SaveManager';
import { SaveManager } from './SaveManager';

export interface DifficultyLevel {
  numberRange: [number, number]; // [min, max]
  scaffoldLevel: number; // 1=full, 2=partial, 3=minimal, 4=mental
  speedPressure: number; // 1=none, 2=gentle, 3=moderate, 4=fast, 5=rush
}

export interface DifficultyConfig {
  stages: DifficultyLevel[];
}

// Default difficulty stages (8 stages per district)
const FARM_DIFFICULTY: DifficultyLevel[] = [
  { numberRange: [1, 5],   scaffoldLevel: 1, speedPressure: 1 },
  { numberRange: [1, 10],  scaffoldLevel: 1, speedPressure: 1 },
  { numberRange: [1, 10],  scaffoldLevel: 1, speedPressure: 2 },
  { numberRange: [1, 15],  scaffoldLevel: 2, speedPressure: 1 },
  { numberRange: [1, 20],  scaffoldLevel: 2, speedPressure: 2 },
  { numberRange: [10, 50], scaffoldLevel: 3, speedPressure: 2 },
  { numberRange: [10, 100],scaffoldLevel: 3, speedPressure: 3 },
  { numberRange: [1, 100], scaffoldLevel: 4, speedPressure: 3 },
];

const BAKERY_DIFFICULTY: DifficultyLevel[] = [
  { numberRange: [1, 2],   scaffoldLevel: 1, speedPressure: 1 }, // groups of 2
  { numberRange: [1, 5],   scaffoldLevel: 1, speedPressure: 1 }, // groups of 5
  { numberRange: [1, 10],  scaffoldLevel: 1, speedPressure: 1 }, // groups of 10
  { numberRange: [2, 5],   scaffoldLevel: 2, speedPressure: 1 }, // 2x,5x,10x
  { numberRange: [3, 6],   scaffoldLevel: 2, speedPressure: 2 }, // 3x,4x
  { numberRange: [6, 9],   scaffoldLevel: 3, speedPressure: 2 }, // 6x,7x,8x
  { numberRange: [9, 12],  scaffoldLevel: 3, speedPressure: 3 }, // 9x,11x,12x
  { numberRange: [2, 12],  scaffoldLevel: 4, speedPressure: 3 }, // any combo
];

const MARKET_DIFFICULTY: DifficultyLevel[] = [
  { numberRange: [1, 10],  scaffoldLevel: 1, speedPressure: 1 },
  { numberRange: [1, 25],  scaffoldLevel: 1, speedPressure: 1 },
  { numberRange: [1, 50],  scaffoldLevel: 2, speedPressure: 1 },
  { numberRange: [1, 100], scaffoldLevel: 2, speedPressure: 2 },
  { numberRange: [1, 100], scaffoldLevel: 3, speedPressure: 2 },
  { numberRange: [1, 200], scaffoldLevel: 3, speedPressure: 3 },
  { numberRange: [1, 500], scaffoldLevel: 3, speedPressure: 3 },
  { numberRange: [1, 1000],scaffoldLevel: 4, speedPressure: 4 },
];

export const DIFFICULTY_CONFIGS: Record<string, DifficultyLevel[]> = {
  farm: FARM_DIFFICULTY,
  bakery: BAKERY_DIFFICULTY,
  market: MARKET_DIFFICULTY,
  construction: FARM_DIFFICULTY, // placeholder, same shape
  festival: FARM_DIFFICULTY,
  harbor: FARM_DIFFICULTY,
  bank: MARKET_DIFFICULTY,
};

// Grade to starting stage mapping
const GRADE_START_STAGE: Record<number, Record<string, number>> = {
  0: { farm: 0 }, // K
  1: { farm: 1 },
  2: { farm: 3, bakery: 0, market: 0 },
  3: { farm: 5, bakery: 3, market: 2 },
  4: { farm: 6, bakery: 5, market: 4, construction: 2, festival: 1 },
  5: { farm: 7, bakery: 7, market: 6, construction: 4, festival: 3, harbor: 1, bank: 0 },
};

export class DifficultyEngine {
  private profile: ProfileData;

  constructor(profile: ProfileData) {
    this.profile = profile;
  }

  getCurrentStage(district: string, skill: string): number {
    const mastery = this.profile.mastery[skill];
    if (!mastery) {
      // Return starting stage based on grade
      const gradeStarts = GRADE_START_STAGE[this.profile.grade] ?? GRADE_START_STAGE[0]!;
      return gradeStarts[district] ?? 0;
    }

    // Calculate stage based on mastery data
    const accuracy = mastery.attempts > 0 ? mastery.correct / mastery.attempts : 0;
    const baseStage = GRADE_START_STAGE[this.profile.grade]?.[district] ?? 0;

    if (accuracy >= 0.9 && mastery.scaffoldLevel >= 3) {
      return Math.min(baseStage + 3, 7);
    } else if (accuracy >= 0.8 && mastery.scaffoldLevel >= 2) {
      return Math.min(baseStage + 2, 7);
    } else if (accuracy >= 0.7) {
      return Math.min(baseStage + 1, 7);
    }
    return baseStage;
  }

  getDifficulty(district: string, skill: string): DifficultyLevel {
    const stages = DIFFICULTY_CONFIGS[district] ?? FARM_DIFFICULTY;
    const stage = this.getCurrentStage(district, skill);
    return stages[stage] ?? stages[0]!;
  }

  shouldIncreaseDifficulty(skill: string): boolean {
    const mastery = this.profile.mastery[skill];
    if (!mastery || mastery.attempts < 10) return false;

    const recentAccuracy = mastery.correct / mastery.attempts;
    return recentAccuracy >= 0.9;
  }

  shouldDecreaseDifficulty(skill: string): boolean {
    const mastery = this.profile.mastery[skill];
    if (!mastery || mastery.attempts < 5) return false;

    const recentAccuracy = mastery.correct / mastery.attempts;
    return recentAccuracy < 0.6;
  }

  recordAnswer(skill: string, correct: boolean): void {
    if (!this.profile.mastery[skill]) {
      this.profile.mastery[skill] = {
        attempts: 0,
        correct: 0,
        scaffoldLevel: 1,
        mastered: false,
      };
    }

    const m = this.profile.mastery[skill]!;
    m.attempts++;
    if (correct) m.correct++;

    // Check for scaffold level advancement
    if (this.shouldIncreaseDifficulty(skill) && m.scaffoldLevel < 4) {
      m.scaffoldLevel++;
    }
    if (this.shouldDecreaseDifficulty(skill) && m.scaffoldLevel > 1) {
      m.scaffoldLevel--;
    }

    // Check mastery
    if (m.attempts >= 20 && m.correct / m.attempts >= 0.9 && m.scaffoldLevel >= 4) {
      m.mastered = true;
    }

    SaveManager.saveProfile(this.profile);
  }
}
