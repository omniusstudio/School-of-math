export interface BuildingDef {
  id: string;
  name: string;
  district: string;
  cost: number;
  description: string;
  happinessBonus: number;
  unlocks?: string; // mini-game id it unlocks
  icon: string;
}

export const BUILDINGS: BuildingDef[] = [
  // Farm
  { id: 'farm_orchard', name: 'Apple Orchard', district: 'farm', cost: 100, description: 'Grow more apples for crate stacking', happinessBonus: 3, unlocks: 'crate-stacker', icon: '🌳' },
  { id: 'farm_coop', name: 'Chicken Coop', district: 'farm', cost: 200, description: 'Chickens lay eggs for collecting', happinessBonus: 4, unlocks: 'egg-collector', icon: '🐔' },
  { id: 'farm_field', name: 'Crop Field', district: 'farm', cost: 300, description: 'Plant crops in rows for harvesting', happinessBonus: 5, unlocks: 'harvest-rows', icon: '🌾' },
  { id: 'farm_barn', name: 'Big Barn', district: 'farm', cost: 500, description: 'Store more produce, unlock harder problems', happinessBonus: 8, icon: '🏠' },
  { id: 'farm_windmill', name: 'Windmill', district: 'farm', cost: 750, description: 'Boss challenge awaits!', happinessBonus: 10, icon: '🌬' },

  // Market
  { id: 'market_stall', name: 'Market Stall', district: 'market', cost: 150, description: 'A stall for making change', happinessBonus: 3, unlocks: 'make-change', icon: '🏪' },
  { id: 'market_warehouse', name: 'Warehouse', district: 'market', cost: 300, description: 'Stock up on supplies', happinessBonus: 5, unlocks: 'stock-up', icon: '📦' },
  { id: 'market_bazaar', name: 'Bazaar', district: 'market', cost: 450, description: 'A trading hub for fair trades', happinessBonus: 6, unlocks: 'fair-trade', icon: '🏕' },
  { id: 'market_cart', name: 'Merchant Cart', district: 'market', cost: 600, description: 'Unlock harder market challenges', happinessBonus: 8, icon: '🛒' },
  { id: 'market_emporium', name: 'Grand Emporium', district: 'market', cost: 800, description: 'Boss challenge awaits!', happinessBonus: 12, icon: '🏛' },

  // Bakery
  { id: 'bakery_counter', name: 'Bakery Counter', district: 'bakery', cost: 200, description: 'Take cookie orders', happinessBonus: 4, unlocks: 'order-up', icon: '🍪' },
  { id: 'bakery_mixer', name: 'Mixing Station', district: 'bakery', cost: 350, description: 'Mix ingredients to bake', happinessBonus: 5, unlocks: 'recipe-mix', icon: '🥣' },
  { id: 'bakery_cutter', name: 'Cutting Board', district: 'bakery', cost: 500, description: 'Cut dough into equal parts', happinessBonus: 6, unlocks: 'cookie-cutter', icon: '🔪' },
  { id: 'bakery_oven', name: 'Big Oven', district: 'bakery', cost: 650, description: 'Bake more at once', happinessBonus: 8, icon: '🔥' },
  { id: 'bakery_showcase', name: 'Display Showcase', district: 'bakery', cost: 900, description: 'Boss challenge awaits!', happinessBonus: 12, icon: '🎂' },

  // Village Center decorations
  { id: 'deco_flowers', name: 'Flower Garden', district: 'center', cost: 50, description: 'Beautiful flowers for the village', happinessBonus: 2, icon: '🌸' },
  { id: 'deco_bench', name: 'Park Bench', district: 'center', cost: 25, description: 'A place for villagers to rest', happinessBonus: 1, icon: '🪑' },
  { id: 'deco_lamp', name: 'Lamp Post', district: 'center', cost: 30, description: 'Light up the village', happinessBonus: 1, icon: '💡' },
  { id: 'deco_fountain', name: 'Fountain Upgrade', district: 'center', cost: 100, description: 'A grander fountain', happinessBonus: 5, icon: '⛲' },
  { id: 'deco_flag', name: 'Flag Pole', district: 'center', cost: 40, description: 'Fly your village flag', happinessBonus: 2, icon: '🚩' },
  { id: 'deco_statue', name: 'Village Statue', district: 'center', cost: 500, description: 'A monument to your achievements', happinessBonus: 10, icon: '🗿' },
];

export function getBuildingsForDistrict(district: string): BuildingDef[] {
  return BUILDINGS.filter(b => b.district === district);
}

export function getAvailableBuildings(district: string, ownedBuildings: string[]): BuildingDef[] {
  return getBuildingsForDistrict(district).filter(b => !ownedBuildings.includes(b.id));
}
