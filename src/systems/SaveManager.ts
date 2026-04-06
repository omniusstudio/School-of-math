export interface ProfileData {
  id: string;
  name: string;
  age: number;
  grade: number;
  characterId: string;
  villageLevel: number;
  xp: number;
  coins: number;
  stars: { bronze: number; silver: number; gold: number };
  gems: { ruby: number; emerald: number; sapphire: number };
  happiness: number;
  population: number;
  buildings: string[];
  unlockedDistricts: string[];
  unlockedCharacters: string[];
  mastery: Record<string, MasteryData>;
  stats: ProfileStats;
  settings: ProfileSettings;
  version: number;
  lastPlayed: string;
}

export interface MasteryData {
  attempts: number;
  correct: number;
  scaffoldLevel: number;
  mastered: boolean;
}

export interface ProfileStats {
  totalAttempted: number;
  totalCorrect: number;
  totalPlayTime: number;
  longestStreak: number;
  sessionsPlayed: number;
}

export interface ProfileSettings {
  musicVolume: number;
  sfxVolume: number;
  musicOn: boolean;
  sfxOn: boolean;
}

const SAVE_KEY = 'countopia_profiles';
const ACTIVE_KEY = 'countopia_active_profile';
const SAVE_VERSION = 1;

export class SaveManager {
  static createProfile(name: string, age: number, grade: number, characterId: string): ProfileData {
    const profile: ProfileData = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
      name,
      age,
      grade,
      characterId,
      villageLevel: 1,
      xp: 0,
      coins: 0,
      stars: { bronze: 0, silver: 0, gold: 0 },
      gems: { ruby: 0, emerald: 0, sapphire: 0 },
      happiness: 50,
      population: 5,
      buildings: [],
      unlockedDistricts: ['farm'],
      unlockedCharacters: [characterId],
      mastery: {},
      stats: {
        totalAttempted: 0,
        totalCorrect: 0,
        totalPlayTime: 0,
        longestStreak: 0,
        sessionsPlayed: 0,
      },
      settings: {
        musicVolume: 0.8,
        sfxVolume: 1.0,
        musicOn: true,
        sfxOn: true,
      },
      version: SAVE_VERSION,
      lastPlayed: new Date().toISOString(),
    };
    return profile;
  }

  static getAllProfiles(): ProfileData[] {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as ProfileData[];
    } catch {
      return [];
    }
  }

  static saveProfile(profile: ProfileData): void {
    profile.lastPlayed = new Date().toISOString();
    const profiles = this.getAllProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(profiles));
  }

  static deleteProfile(id: string): void {
    const profiles = this.getAllProfiles().filter(p => p.id !== id);
    localStorage.setItem(SAVE_KEY, JSON.stringify(profiles));
    if (this.getActiveProfileId() === id) {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }

  static setActiveProfile(id: string): void {
    localStorage.setItem(ACTIVE_KEY, id);
  }

  static getActiveProfileId(): string | null {
    return localStorage.getItem(ACTIVE_KEY);
  }

  static getActiveProfile(): ProfileData | null {
    const id = this.getActiveProfileId();
    if (!id) return null;
    return this.getAllProfiles().find(p => p.id === id) ?? null;
  }
}
