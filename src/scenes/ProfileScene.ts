import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { SaveManager, type ProfileData } from '../systems/SaveManager';

export class ProfileScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ProfileScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(500);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 60, 'Who is playing?', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '42px',
      color: '#f1c40f',
    }).setOrigin(0.5);

    const profiles = SaveManager.getAllProfiles();
    this.displayProfiles(profiles);
  }

  private displayProfiles(profiles: ProfileData[]): void {
    const startY = 160;
    const cardWidth = 220;
    const cardHeight = 260;
    const maxPerRow = 4;
    const totalSlots = Math.min(profiles.length + 1, 6); // max 6 profiles
    const spacing = 30;

    for (let i = 0; i < totalSlots; i++) {
      const row = Math.floor(i / maxPerRow);
      const col = i % maxPerRow;
      const rowCount = Math.min(totalSlots - row * maxPerRow, maxPerRow);
      const rowWidth = rowCount * cardWidth + (rowCount - 1) * spacing;
      const rowStartX = (GAME_WIDTH - rowWidth) / 2;
      const x = rowStartX + col * (cardWidth + spacing) + cardWidth / 2;
      const y = startY + row * (cardHeight + 30) + cardHeight / 2;

      if (i < profiles.length) {
        this.createProfileCard(profiles[i], x, y, cardWidth, cardHeight);
      } else {
        this.createAddButton(x, y, cardWidth, cardHeight);
      }
    }
  }

  private createProfileCard(profile: ProfileData, x: number, y: number, w: number, h: number): void {
    // Card background
    const card = this.add.graphics();
    card.fillStyle(0x2c3e50, 1);
    card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    card.lineStyle(3, 0x3498db, 1);
    card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);

    // Character avatar
    const avatar = this.add.image(x, y - 50, `char_${profile.characterId}`);
    avatar.setScale(2);

    // Name
    this.add.text(x, y + 30, profile.name, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Level
    this.add.text(x, y + 58, `Village Level ${profile.villageLevel}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#bdc3c7',
    }).setOrigin(0.5);

    // Coins display
    const coinIcon = this.add.image(x - 25, y + 82, 'coin').setScale(0.8);
    this.add.text(x - 8, y + 82, `${profile.coins}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#f1c40f',
    }).setOrigin(0, 0.5);

    // Make the whole card interactive
    const hitArea = this.add.rectangle(x, y, w, h).setInteractive();
    hitArea.setAlpha(0.001);

    hitArea.on('pointerover', () => {
      card.clear();
      card.fillStyle(0x34495e, 1);
      card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
      card.lineStyle(3, 0xf1c40f, 1);
      card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    });

    hitArea.on('pointerout', () => {
      card.clear();
      card.fillStyle(0x2c3e50, 1);
      card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
      card.lineStyle(3, 0x3498db, 1);
      card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    });

    hitArea.on('pointerup', () => {
      SaveManager.setActiveProfile(profile.id);
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('VillageScene');
      });
    });
  }

  private createAddButton(x: number, y: number, w: number, h: number): void {
    const card = this.add.graphics();
    card.fillStyle(0x1a252f, 1);
    card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    card.lineStyle(3, 0x555555, 1);
    card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);

    // Plus sign
    this.add.text(x, y - 30, '+', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '72px',
      color: '#555555',
    }).setOrigin(0.5);

    this.add.text(x, y + 40, 'New Player', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#555555',
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, w, h).setInteractive();
    hitArea.setAlpha(0.001);

    hitArea.on('pointerover', () => {
      card.clear();
      card.fillStyle(0x222f3a, 1);
      card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
      card.lineStyle(3, 0x2ecc71, 1);
      card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    });

    hitArea.on('pointerout', () => {
      card.clear();
      card.fillStyle(0x1a252f, 1);
      card.fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
      card.lineStyle(3, 0x555555, 1);
      card.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);
    });

    hitArea.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => {
        this.scene.start('CreateProfileScene');
      });
    });
  }
}
