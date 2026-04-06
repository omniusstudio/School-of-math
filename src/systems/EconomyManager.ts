import { ECONOMY } from '../config/economy';
import type { ProfileData } from './SaveManager';
import { SaveManager } from './SaveManager';

export class EconomyManager {
  private profile: ProfileData;
  private currentStreak: number = 0;

  constructor(profile: ProfileData) {
    this.profile = profile;
  }

  earnCoins(amount: number): number {
    this.profile.coins += amount;
    SaveManager.saveProfile(this.profile);
    return this.profile.coins;
  }

  spendCoins(amount: number): boolean {
    if (this.profile.coins < amount) return false;
    this.profile.coins -= amount;
    SaveManager.saveProfile(this.profile);
    return true;
  }

  canAfford(amount: number): boolean {
    return this.profile.coins >= amount;
  }

  recordCorrectAnswer(usedScaffold: boolean, underSpeedBonus: boolean): number {
    this.currentStreak++;
    let earned = ECONOMY.correctAnswer;

    if (!usedScaffold) earned = ECONOMY.correctNoScaffold;
    if (underSpeedBonus) earned = ECONOMY.correctSpeedBonus;

    // Streak bonuses
    if (this.currentStreak === 3) earned += ECONOMY.streak3Bonus;
    if (this.currentStreak === 5) earned += ECONOMY.streak5Bonus;
    if (this.currentStreak === 10) earned += ECONOMY.streak10Bonus;

    this.profile.coins += earned;
    this.profile.stats.totalAttempted++;
    this.profile.stats.totalCorrect++;
    if (this.currentStreak > this.profile.stats.longestStreak) {
      this.profile.stats.longestStreak = this.currentStreak;
    }

    // Happiness
    this.adjustHappiness(ECONOMY.happinessCorrect);
    if (this.currentStreak >= 3) {
      this.adjustHappiness(ECONOMY.happinessStreak);
    }

    SaveManager.saveProfile(this.profile);
    return earned;
  }

  recordWrongAnswer(): void {
    this.currentStreak = 0;
    this.profile.stats.totalAttempted++;
    this.adjustHappiness(ECONOMY.happinessWrong);
    SaveManager.saveProfile(this.profile);
  }

  completeMiniGame(): number {
    const earned = ECONOMY.miniGameComplete;
    this.profile.coins += earned;
    SaveManager.saveProfile(this.profile);
    return earned;
  }

  adjustHappiness(amount: number): void {
    this.profile.happiness = Math.max(
      ECONOMY.happinessMin,
      Math.min(ECONOMY.happinessMax, this.profile.happiness + amount)
    );
  }

  addXP(amount: number): boolean {
    this.profile.xp += amount;
    const newLevel = Math.floor(this.profile.xp / 100) + 1;
    const leveledUp = newLevel > this.profile.villageLevel;
    if (leveledUp) {
      this.profile.villageLevel = newLevel;
    }
    SaveManager.saveProfile(this.profile);
    return leveledUp;
  }

  getStreak(): number {
    return this.currentStreak;
  }

  getProfile(): ProfileData {
    return this.profile;
  }
}
