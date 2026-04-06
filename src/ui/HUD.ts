import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/game-config';
import type { ProfileData } from '../systems/SaveManager';

export class HUD {
  private scene: Phaser.Scene;
  private coinIcon!: Phaser.GameObjects.Image;
  private coinText!: Phaser.GameObjects.Text;
  private happinessIcon!: Phaser.GameObjects.Image;
  private levelText!: Phaser.GameObjects.Text;
  private populationText!: Phaser.GameObjects.Text;
  private container!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);

    // HUD background bar
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRect(0, 0, GAME_WIDTH, 45);
    this.container.add(bg);

    // Coins
    this.coinIcon = this.scene.add.image(30, 22, 'coin').setScale(0.9);
    this.coinText = this.scene.add.text(50, 22, '0', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '20px',
      color: '#f1c40f',
    }).setOrigin(0, 0.5);
    this.container.add([this.coinIcon, this.coinText]);

    // Happiness face
    this.happinessIcon = this.scene.add.image(160, 22, 'face_neutral').setScale(1.1);
    this.container.add(this.happinessIcon);

    // Village level
    this.levelText = this.scene.add.text(210, 22, 'Lv. 1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.container.add(this.levelText);

    // Population
    this.populationText = this.scene.add.text(300, 22, 'Pop: 5', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#bdc3c7',
    }).setOrigin(0, 0.5);
    this.container.add(this.populationText);

    // Home button (right side)
    const homeBtn = this.scene.add.text(GAME_WIDTH - 30, 22, 'HOME', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#3498db',
      backgroundColor: '#1a1a2e',
      padding: { x: 10, y: 4 },
    }).setOrigin(1, 0.5).setInteractive();

    homeBtn.on('pointerup', () => {
      this.scene.cameras.main.fadeOut(300);
      this.scene.time.delayedCall(300, () => {
        this.scene.scene.start('ProfileScene');
      });
    });
    homeBtn.on('pointerover', () => homeBtn.setColor('#f1c40f'));
    homeBtn.on('pointerout', () => homeBtn.setColor('#3498db'));
    this.container.add(homeBtn);
  }

  update(profile: ProfileData): void {
    this.coinText.setText(`${profile.coins}`);
    this.levelText.setText(`Lv. ${profile.villageLevel}`);
    this.populationText.setText(`Pop: ${profile.population}`);

    // Update happiness face
    let faceName = 'face_neutral';
    if (profile.happiness >= 81) faceName = 'face_very_happy';
    else if (profile.happiness >= 61) faceName = 'face_happy';
    else if (profile.happiness >= 41) faceName = 'face_neutral';
    else if (profile.happiness >= 21) faceName = 'face_sad';
    else faceName = 'face_very_sad';
    this.happinessIcon.setTexture(faceName);
  }

  animateCoinEarn(amount: number, fromX: number, fromY: number): void {
    const coin = this.scene.add.image(fromX, fromY, 'coin');
    this.scene.tweens.add({
      targets: coin,
      x: 30,
      y: 22,
      scale: 0.5,
      duration: 600,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        coin.destroy();
        // Bounce the coin counter
        this.scene.tweens.add({
          targets: this.coinText,
          scale: 1.3,
          duration: 100,
          yoyo: true,
        });
      },
    });
  }

  setScrollFactor(x: number, y: number): void {
    this.container.setScrollFactor(x, y);
  }
}
