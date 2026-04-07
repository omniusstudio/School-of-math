import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { TitleScene } from '../scenes/TitleScene';
import { ProfileScene } from '../scenes/ProfileScene';
import { CreateProfileScene } from '../scenes/CreateProfileScene';
import { VillageScene } from '../scenes/VillageScene';
import { DistrictScene } from '../scenes/DistrictScene';
import { ShopScene } from '../scenes/ShopScene';
import { CrateStackerScene } from '../games/farm/CrateStacker';
import { EggCollectorScene } from '../games/farm/EggCollector';
import { HarvestRowsScene } from '../games/farm/HarvestRows';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    TitleScene,
    ProfileScene,
    CreateProfileScene,
    VillageScene,
    DistrictScene,
    ShopScene,
    CrateStackerScene,
    EggCollectorScene,
    HarvestRowsScene,
  ],
  backgroundColor: '#87CEEB',
  pixelArt: false,
};
