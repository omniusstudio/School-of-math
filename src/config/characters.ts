export interface CharacterDef {
  id: string;
  name: string;
  animal: string;
  personality: string;
  color: number;
  unlockCondition: string | null; // null = available from start
}

export const PLAYABLE_CHARACTERS: CharacterDef[] = [
  { id: 'fox', name: 'Fox', animal: 'Fox', personality: 'Clever', color: 0xff8c00, unlockCondition: null },
  { id: 'bear', name: 'Bear Cub', animal: 'Bear', personality: 'Strong', color: 0x8b4513, unlockCondition: null },
  { id: 'owl', name: 'Owl', animal: 'Owl', personality: 'Wise', color: 0x6c7a89, unlockCondition: null },
  { id: 'bunny', name: 'Bunny', animal: 'Bunny', personality: 'Fast', color: 0xffb6c1, unlockCondition: null },
  { id: 'cat', name: 'Cat', animal: 'Cat', personality: 'Curious', color: 0x2c3e50, unlockCondition: null },
  { id: 'puppy', name: 'Puppy', animal: 'Puppy', personality: 'Loyal', color: 0xdaa520, unlockCondition: null },
  { id: 'frog', name: 'Frog', animal: 'Frog', personality: 'Goofy', color: 0x27ae60, unlockCondition: null },
  { id: 'penguin', name: 'Penguin', animal: 'Penguin', personality: 'Cool', color: 0x2c3e50, unlockCondition: null },
  { id: 'dragon', name: 'Dragon', animal: 'Dragon', personality: 'Mighty', color: 0x8e44ad, unlockCondition: 'complete_farm' },
  { id: 'unicorn', name: 'Unicorn', animal: 'Unicorn', personality: 'Magical', color: 0xffffff, unlockCondition: 'complete_bakery' },
  { id: 'phoenix', name: 'Phoenix', animal: 'Phoenix', personality: 'Blazing', color: 0xe74c3c, unlockCondition: 'complete_construction' },
  { id: 'kraken', name: 'Kraken', animal: 'Kraken', personality: 'Deep', color: 0x1abc9c, unlockCondition: 'complete_harbor' },
];

export const NPC_CHARACTERS = {
  tala: { id: 'tala', name: 'Teacher Tala', animal: 'Tortoise', district: 'school' },
  flora: { id: 'flora', name: 'Farmer Flora', animal: 'Cow', district: 'farm' },
  ben: { id: 'ben', name: 'Baker Ben', animal: 'Pig', district: 'bakery' },
  brix: { id: 'brix', name: 'Builder Brix', animal: 'Gorilla', district: 'construction' },
  mara: { id: 'mara', name: 'Merchant Mara', animal: 'Raccoon', district: 'market' },
  kai: { id: 'kai', name: 'Captain Kai', animal: 'Parrot', district: 'harbor' },
  bloom: { id: 'bloom', name: 'Banker Bloom', animal: 'Owl', district: 'bank' },
  fizz: { id: 'fizz', name: 'Festival Fizz', animal: 'Monkey', district: 'festival' },
};
