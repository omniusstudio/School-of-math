import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Loading bar
    const barWidth = 400;
    const barHeight = 30;
    const barX = (GAME_WIDTH - barWidth) / 2;
    const barY = GAME_HEIGHT / 2 + 40;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8, 8);

    const progressBar = this.add.graphics();

    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'Loading Countopia...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xf1c40f, 1);
      progressBar.fillRoundedRect(barX, barY, barWidth * value, barHeight, 6);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Generate placeholder textures since we don't have real assets yet
    this.createPlaceholderAssets();
  }

  create(): void {
    this.scene.start('TitleScene');
  }

  private createPlaceholderAssets(): void {
    // Generate colored circle textures for characters
    const characters = [
      { id: 'fox', color: 0xff8c00 },
      { id: 'bear', color: 0x8b4513 },
      { id: 'owl', color: 0x6c7a89 },
      { id: 'bunny', color: 0xffb6c1 },
      { id: 'cat', color: 0x2c3e50 },
      { id: 'puppy', color: 0xdaa520 },
      { id: 'frog', color: 0x27ae60 },
      { id: 'penguin', color: 0x34495e },
    ];

    characters.forEach(({ id, color }) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(color, 1);
      g.fillCircle(32, 32, 30);
      g.lineStyle(3, 0x000000, 1);
      g.strokeCircle(32, 32, 30);
      // Eyes
      g.fillStyle(0xffffff, 1);
      g.fillCircle(22, 26, 8);
      g.fillCircle(42, 26, 8);
      g.fillStyle(0x000000, 1);
      g.fillCircle(24, 26, 4);
      g.fillCircle(44, 26, 4);
      // Smile
      g.lineStyle(2, 0x000000, 1);
      g.beginPath();
      g.arc(32, 34, 10, 0.2, Math.PI - 0.2, false);
      g.strokePath();
      g.generateTexture(`char_${id}`, 64, 64);
      g.destroy();
    });

    // NPC placeholder textures
    const npcs = [
      { id: 'flora', color: 0xd4a574, label: 'F' },
      { id: 'tala', color: 0x556b2f, label: 'T' },
      { id: 'ben', color: 0xffc0cb, label: 'B' },
      { id: 'brix', color: 0x4a4a4a, label: 'X' },
      { id: 'mara', color: 0x808080, label: 'M' },
      { id: 'kai', color: 0xff0000, label: 'K' },
      { id: 'bloom', color: 0x8b6914, label: 'L' },
      { id: 'fizz', color: 0xcd853f, label: 'Z' },
    ];

    npcs.forEach(({ id, color }) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(color, 1);
      g.fillCircle(32, 32, 28);
      g.lineStyle(3, 0x000000, 1);
      g.strokeCircle(32, 32, 28);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(22, 26, 7);
      g.fillCircle(42, 26, 7);
      g.fillStyle(0x000000, 1);
      g.fillCircle(24, 26, 3);
      g.fillCircle(44, 26, 3);
      g.generateTexture(`npc_${id}`, 64, 64);
      g.destroy();
    });

    // Coin icon
    const coinG = this.make.graphics({ x: 0, y: 0 });
    coinG.fillStyle(0xf1c40f, 1);
    coinG.fillCircle(16, 16, 14);
    coinG.lineStyle(2, 0xc9960c, 1);
    coinG.strokeCircle(16, 16, 14);
    coinG.fillStyle(0xc9960c, 1);
    coinG.fillCircle(16, 16, 8);
    coinG.fillStyle(0xf1c40f, 1);
    coinG.fillCircle(16, 16, 6);
    coinG.generateTexture('coin', 32, 32);
    coinG.destroy();

    // Star icon
    const starG = this.make.graphics({ x: 0, y: 0 });
    starG.fillStyle(0xf1c40f, 1);
    starG.lineStyle(2, 0x000000, 1);
    const starPoints = this.getStarPoints(16, 16, 5, 14, 6);
    starG.fillPoints(starPoints, true);
    starG.strokePoints(starPoints, true);
    starG.generateTexture('star', 32, 32);
    starG.destroy();

    // Apple
    const appleG = this.make.graphics({ x: 0, y: 0 });
    appleG.fillStyle(0xe74c3c, 1);
    appleG.fillCircle(20, 24, 16);
    appleG.lineStyle(2, 0x000000, 1);
    appleG.strokeCircle(20, 24, 16);
    appleG.fillStyle(0x27ae60, 1);
    appleG.fillRect(18, 4, 4, 8);
    appleG.generateTexture('apple', 40, 40);
    appleG.destroy();

    // Crate
    const crateG = this.make.graphics({ x: 0, y: 0 });
    crateG.fillStyle(0xcd853f, 1);
    crateG.fillRect(0, 0, 120, 60);
    crateG.lineStyle(3, 0x8b6914, 1);
    crateG.strokeRect(0, 0, 120, 60);
    crateG.lineBetween(40, 0, 40, 60);
    crateG.lineBetween(80, 0, 80, 60);
    crateG.generateTexture('crate', 120, 60);
    crateG.destroy();

    // Happiness faces
    const faceColors = [0x95a5a6, 0xbdc3c7, 0xf1c40f, 0x2ecc71, 0xf39c12];
    const faceNames = ['face_very_sad', 'face_sad', 'face_neutral', 'face_happy', 'face_very_happy'];
    faceNames.forEach((name, i) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(faceColors[i], 1);
      g.fillCircle(16, 16, 14);
      g.lineStyle(2, 0x000000, 1);
      g.strokeCircle(16, 16, 14);
      g.fillStyle(0x000000, 1);
      g.fillCircle(11, 13, 2);
      g.fillCircle(21, 13, 2);
      if (i < 2) {
        g.lineStyle(2, 0x000000, 1);
        g.beginPath();
        g.arc(16, 24, 6, Math.PI + 0.3, -0.3, false);
        g.strokePath();
      } else if (i === 2) {
        g.lineBetween(11, 21, 21, 21);
      } else {
        g.lineStyle(2, 0x000000, 1);
        g.beginPath();
        g.arc(16, 18, 6, 0.3, Math.PI - 0.3, false);
        g.strokePath();
      }
      g.generateTexture(name, 32, 32);
      g.destroy();
    });

    // Button backgrounds
    this.createButtonTexture('btn_green', 0x2ecc71, 0x27ae60, 200, 50);
    this.createButtonTexture('btn_blue', 0x3498db, 0x2980b9, 200, 50);
    this.createButtonTexture('btn_orange', 0xe67e22, 0xd35400, 200, 50);
    this.createButtonTexture('btn_red', 0xe74c3c, 0xc0392b, 200, 50);
    this.createButtonTexture('btn_wide', 0x3498db, 0x2980b9, 300, 60);

    // Gem icon
    const gemG = this.make.graphics({ x: 0, y: 0 });
    gemG.fillStyle(0x9b59b6, 1);
    gemG.fillTriangle(16, 2, 4, 14, 28, 14);
    gemG.fillRect(4, 14, 24, 8);
    gemG.fillTriangle(4, 22, 16, 30, 28, 22);
    gemG.lineStyle(2, 0x7d3c98, 1);
    gemG.strokeTriangle(16, 2, 4, 14, 28, 14);
    gemG.generateTexture('gem', 32, 32);
    gemG.destroy();

    // District tile
    this.createDistrictTexture();
  }

  private createButtonTexture(key: string, fill: number, border: number, w: number, h: number): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(border, 1);
    g.fillRoundedRect(0, 3, w, h, 10);
    g.fillStyle(fill, 1);
    g.fillRoundedRect(0, 0, w, h - 3, 10);
    g.generateTexture(key, w, h + 3);
    g.destroy();
  }

  private createDistrictTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x7ec850, 1);
    g.fillRoundedRect(0, 0, 160, 120, 12);
    g.lineStyle(3, 0x4a7c2e, 1);
    g.strokeRoundedRect(0, 0, 160, 120, 12);
    g.generateTexture('district_tile', 160, 120);
    g.destroy();

    // Locked district
    const lg = this.make.graphics({ x: 0, y: 0 });
    lg.fillStyle(0x555555, 0.7);
    lg.fillRoundedRect(0, 0, 160, 120, 12);
    lg.lineStyle(3, 0x333333, 1);
    lg.strokeRoundedRect(0, 0, 160, 120, 12);
    lg.generateTexture('district_locked', 160, 120);
    lg.destroy();
  }

  private getStarPoints(cx: number, cy: number, points: number, outer: number, inner: number): Phaser.Geom.Point[] {
    const result: Phaser.Geom.Point[] = [];
    const step = Math.PI / points;
    let rotation = -Math.PI / 2;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      result.push(new Phaser.Geom.Point(
        cx + Math.cos(rotation) * r,
        cy + Math.sin(rotation) * r
      ));
      rotation += step;
    }
    return result;
  }
}
