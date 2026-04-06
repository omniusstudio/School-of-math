export interface DistrictDef {
  id: string;
  name: string;
  npcId: string;
  unlockLevel: number;
  mathFocus: string;
  color: number;
  miniGames: string[];
}

export const DISTRICTS: Record<string, DistrictDef> = {
  farm: {
    id: 'farm',
    name: 'The Farm',
    npcId: 'flora',
    unlockLevel: 1,
    mathFocus: 'Counting, Addition, Grouping',
    color: 0x7ec850,
    miniGames: ['crate-stacker', 'egg-collector', 'harvest-rows'],
  },
  school: {
    id: 'school',
    name: 'The School',
    npcId: 'tala',
    unlockLevel: 3,
    mathFocus: 'Chisanbop, Practice',
    color: 0xf4d03f,
    miniGames: ['chisanbop-practice'],
  },
  market: {
    id: 'market',
    name: 'The Market',
    npcId: 'mara',
    unlockLevel: 6,
    mathFocus: 'Addition, Subtraction, Money',
    color: 0xe67e22,
    miniGames: ['make-change', 'stock-up', 'fair-trade'],
  },
  bakery: {
    id: 'bakery',
    name: 'The Bakery',
    npcId: 'ben',
    unlockLevel: 10,
    mathFocus: 'Arrays, Multiplication',
    color: 0xd4a574,
    miniGames: ['order-up', 'recipe-mix', 'cookie-cutter'],
  },
  construction: {
    id: 'construction',
    name: 'The Construction Yard',
    npcId: 'brix',
    unlockLevel: 15,
    mathFocus: 'Subtraction, Measurement',
    color: 0x95a5a6,
    miniGames: ['build-the-wall', 'bridge-builder', 'blueprint-match'],
  },
  festival: {
    id: 'festival',
    name: 'The Festival Grounds',
    npcId: 'fizz',
    unlockLevel: 20,
    mathFocus: 'Division, Equal Sharing',
    color: 0x9b59b6,
    miniGames: ['set-the-tables', 'hang-the-lanterns', 'prize-booth'],
  },
  harbor: {
    id: 'harbor',
    name: 'The Harbor',
    npcId: 'kai',
    unlockLevel: 28,
    mathFocus: 'Fractions',
    color: 0x3498db,
    miniGames: ['load-the-ship', 'voyage-tracker', 'treasure-split'],
  },
  bank: {
    id: 'bank',
    name: 'The Bank',
    npcId: 'bloom',
    unlockLevel: 36,
    mathFocus: 'Decimals, Mixed Operations',
    color: 0x2c3e50,
    miniGames: ['coin-counter', 'budget-planner', 'vault-combo'],
  },
};
