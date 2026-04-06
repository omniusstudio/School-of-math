import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    // Sky gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4a90d9, 0x4a90d9, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Ground
    bg.fillStyle(0x7ec850, 1);
    bg.fillRect(0, GAME_HEIGHT - 150, GAME_WIDTH, 150);
    bg.fillStyle(0x6bb840, 1);
    bg.fillRect(0, GAME_HEIGHT - 150, GAME_WIDTH, 8);

    // Hills
    bg.fillStyle(0x8fd860, 1);
    bg.fillEllipse(200, GAME_HEIGHT - 150, 500, 200);
    bg.fillEllipse(900, GAME_HEIGHT - 150, 600, 160);

    // Clouds
    this.createCloud(200, 100, 1.2);
    this.createCloud(600, 60, 0.8);
    this.createCloud(1000, 120, 1.0);

    // Title
    const titleShadow = this.add.text(GAME_WIDTH / 2 + 3, 153, 'COUNTOPIA', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '96px',
      color: '#2c3e50',
    }).setOrigin(0.5);

    const title = this.add.text(GAME_WIDTH / 2, 150, 'COUNTOPIA', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '96px',
      color: '#f1c40f',
      stroke: '#e67e22',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 230, 'A World of Numbers Awaits!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#2c3e50',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Floating title animation
    this.tweens.add({
      targets: [title, titleShadow],
      y: '+=10',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Play button
    const playBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'btn_wide').setInteractive();
    const playText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 78, "Let's Go!", {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    playBtn.on('pointerover', () => {
      playBtn.setScale(1.05);
      playText.setScale(1.05);
    });
    playBtn.on('pointerout', () => {
      playBtn.setScale(1);
      playText.setScale(1);
    });
    playBtn.on('pointerdown', () => {
      playBtn.setScale(0.95);
      playText.setScale(0.95);
    });
    playBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('ProfileScene');
      });
    });

    // Small animal characters walking across the bottom
    const animals = ['fox', 'bear', 'owl', 'bunny', 'frog', 'penguin'];
    animals.forEach((animal, i) => {
      const char = this.add.image(-50 + i * -80, GAME_HEIGHT - 100, `char_${animal}`);
      char.setScale(1.5);
      this.tweens.add({
        targets: char,
        x: GAME_WIDTH + 50,
        duration: 12000 + i * 2000,
        repeat: -1,
        delay: i * 1500,
      });
    });

    this.cameras.main.fadeIn(500);
  }

  private createCloud(x: number, y: number, scale: number): void {
    const cloud = this.add.graphics();
    cloud.fillStyle(0xffffff, 0.9);
    cloud.fillCircle(0, 0, 30 * scale);
    cloud.fillCircle(25 * scale, -10 * scale, 25 * scale);
    cloud.fillCircle(50 * scale, 0, 20 * scale);
    cloud.fillCircle(-20 * scale, 5 * scale, 22 * scale);
    cloud.setPosition(x, y);

    this.tweens.add({
      targets: cloud,
      x: x + 30,
      duration: 4000 + Math.random() * 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
