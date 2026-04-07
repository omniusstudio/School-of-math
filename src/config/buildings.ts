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
