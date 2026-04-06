import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { PLAYABLE_CHARACTERS } from '../config/characters';
import { SaveManager } from '../systems/SaveManager';

export class CreateProfileScene extends Phaser.Scene {
  private selectedCharacter: string = 'fox';
  private playerName: string = '';
  private selectedGrade: number = 1;
  private nameText!: Phaser.GameObjects.Text;
  private charHighlight!: Phaser.GameObjects.Graphics;
  private gradeText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'CreateProfileScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(300);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 40, 'Create Your Player', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '36px',
      color: '#f1c40f',
    }).setOrigin(0.5);

    // --- NAME INPUT ---
    this.add.text(GAME_WIDTH / 2, 90, 'What is your name?', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#bdc3c7',
    }).setOrigin(0.5);

    // Name display box
    const nameBox = this.add.graphics();
    nameBox.fillStyle(0x2c3e50, 1);
    nameBox.fillRoundedRect(GAME_WIDTH / 2 - 150, 108, 300, 44, 8);
    nameBox.lineStyle(2, 0x3498db, 1);
    nameBox.strokeRoundedRect(GAME_WIDTH / 2 - 150, 108, 300, 44, 8);

    this.nameText = this.add.text(GAME_WIDTH / 2, 130, 'Tap here to type...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#7f8c8d',
    }).setOrigin(0.5);

    const nameHit = this.add.rectangle(GAME_WIDTH / 2, 130, 300, 44).setInteractive();
    nameHit.setAlpha(0.001);
    nameHit.on('pointerup', () => {
      const name = prompt('Enter your name:');
      if (name && name.trim().length > 0) {
        this.playerName = name.trim().slice(0, 12);
        this.nameText.setText(this.playerName);
        this.nameText.setColor('#ffffff');
      }
    });

    // --- CHARACTER SELECT ---
    this.add.text(GAME_WIDTH / 2, 175, 'Choose your character!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#bdc3c7',
    }).setOrigin(0.5);

    this.charHighlight = this.add.graphics();
    const starters = PLAYABLE_CHARACTERS.filter(c => !c.unlockCondition);
    const charStartX = GAME_WIDTH / 2 - (starters.length * 80) / 2 + 40;

    starters.forEach((char, i) => {
      const x = charStartX + i * 80;
      const y = 240;

      const avatar = this.add.image(x, y, `char_${char.id}`).setScale(1.8).setInteractive();
      const label = this.add.text(x, y + 40, char.name, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#bdc3c7',
      }).setOrigin(0.5);

      avatar.on('pointerup', () => {
        this.selectedCharacter = char.id;
        this.updateCharHighlight(x, y);
      });

      if (char.id === this.selectedCharacter) {
        this.updateCharHighlight(x, y);
      }
    });

    // --- GRADE SELECT ---
    this.add.text(GAME_WIDTH / 2, 310, 'What grade are you in?', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#bdc3c7',
    }).setOrigin(0.5);

    const grades = ['K', '1', '2', '3', '4', '5'];
    const gradeStartX = GAME_WIDTH / 2 - (grades.length * 70) / 2 + 35;

    grades.forEach((grade, i) => {
      const x = gradeStartX + i * 70;
      const y = 360;
      const gradeVal = i; // K=0, 1=1, etc.

      const btn = this.add.graphics();
      const isSelected = gradeVal === this.selectedGrade;
      this.drawGradeButton(btn, x, y, isSelected);

      const text = this.add.text(x, y, grade, {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '24px',
        color: isSelected ? '#ffffff' : '#bdc3c7',
      }).setOrigin(0.5);

      const hit = this.add.rectangle(x, y, 50, 50).setInteractive();
      hit.setAlpha(0.001);
      hit.on('pointerup', () => {
        this.selectedGrade = gradeVal;
        // Redraw all grade buttons
        this.scene.restart();
      });
    });

    // --- AGE (auto-calculated from grade) ---
    const estimatedAge = this.selectedGrade + 5;

    // --- START BUTTON ---
    const startBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 100, 'btn_green').setInteractive();
    startBtn.setScale(1.5, 1.2);
    const startText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 103, 'Start Adventure!', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    startBtn.on('pointerover', () => { startBtn.setScale(1.55, 1.25); startText.setScale(1.03); });
    startBtn.on('pointerout', () => { startBtn.setScale(1.5, 1.2); startText.setScale(1); });

    startBtn.on('pointerup', () => {
      if (!this.playerName) {
        const name = prompt('Please enter your name:');
        if (!name || name.trim().length === 0) return;
        this.playerName = name.trim().slice(0, 12);
      }

      const profile = SaveManager.createProfile(
        this.playerName,
        estimatedAge,
        this.selectedGrade,
        this.selectedCharacter
      );
      SaveManager.saveProfile(profile);
      SaveManager.setActiveProfile(profile.id);

      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start('VillageScene');
      });
    });

    // Back button
    const backBtn = this.add.text(60, 40, '< Back', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#3498db',
    }).setOrigin(0.5).setInteractive();

    backBtn.on('pointerup', () => {
      this.scene.start('ProfileScene');
    });
    backBtn.on('pointerover', () => backBtn.setColor('#f1c40f'));
    backBtn.on('pointerout', () => backBtn.setColor('#3498db'));
  }

  private updateCharHighlight(x: number, y: number): void {
    this.charHighlight.clear();
    this.charHighlight.lineStyle(3, 0xf1c40f, 1);
    this.charHighlight.strokeCircle(x, y, 35);
  }

  private drawGradeButton(g: Phaser.GameObjects.Graphics, x: number, y: number, selected: boolean): void {
    if (selected) {
      g.fillStyle(0x3498db, 1);
      g.fillRoundedRect(x - 25, y - 25, 50, 50, 8);
    } else {
      g.fillStyle(0x2c3e50, 1);
      g.fillRoundedRect(x - 25, y - 25, 50, 50, 8);
      g.lineStyle(2, 0x3498db, 1);
      g.strokeRoundedRect(x - 25, y - 25, 50, 50, 8);
    }
  }
}
