import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { TitleScene } from '../scenes/TitleScene';
import { ProfileScene } from '../scenes/ProfileScene';
import { CreateProfileScene } from '../scenes/CreateProfileScene';
import { VillageScene } from '../scenes/VillageScene';
import { DistrictScene } from '../scenes/DistrictScene';
import { ShopScene } from '../scenes/ShopScene';
import { CharacterShopScene } from '../scenes/CharacterShopScene';
import { CrateStackerScene } from '../games/farm/CrateStacker';
import { EggCollectorScene } from '../games/farm/EggCollector';
import { HarvestRowsScene } from '../games/farm/HarvestRows';
import { MakeChangeScene } from '../games/market/MakeChange';
import { StockUpScene } from '../games/market/StockUp';
import { FairTradeScene } from '../games/market/FairTrade';
import { OrderUpScene } from '../games/bakery/OrderUp';
import { RecipeMixScene } from '../games/bakery/RecipeMix';
import { CookieCutterScene } from '../games/bakery/CookieCutter';
import { NumberRunScene } from '../games/platformer/NumberRun';
import { CoinDashScene } from '../games/platformer/CoinDash';

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
    CharacterShopScene,
    CrateStackerScene,
    EggCollectorScene,
    HarvestRowsScene,
    MakeChangeScene,
    StockUpScene,
    FairTradeScene,
    OrderUpScene,
    RecipeMixScene,
    CookieCutterScene,
    NumberRunScene,
    CoinDashScene,
  ],
  backgroundColor: '#87CEEB',
  pixelArt: false,
};
