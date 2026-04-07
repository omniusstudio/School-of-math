import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { DifficultyEngine } from '../../systems/DifficultyEngine';
import { HUD } from '../../ui/HUD';

const ROUNDS = 8;

interface CropRow {
  count: number;
  type: string;
  color: number;
  harvested: boolean;
  container: Phaser.GameObjects.Container;
}

export class HarvestRowsScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private difficulty!: DifficultyEngine;
  private hud!: HUD;

  private targetNumber: number = 0;
  private currentTotal: number = 0;
  private currentRound: number = 0;
  private correctCount: number = 0;
  private rows: CropRow[] = [];
  private targetText!: Phaser.GameObjects.Text;
  private totalText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private submitBtn!: Phaser.GameObjects.Image;
  private submitText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HarvestRowsScene' });
  }

  create(): void {
    const profile = SaveManager.getActiveProfile();
    if (!profile) { this.scene.start('ProfileScene'); return; }
    this.profile = profile;
    this.economy = new EconomyManager(profile);
    this.difficulty = new DifficultyEngine(profile);

    this.cameras.main.fadeIn(300);
    this.currentRound = 0;
    this.correctCount = 0;

    this.drawBackground();
    this.drawUI();

    this.hud = new HUD(this);
    this.hud.update(profile);

    this.nextRound();
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xaed8f0, 0xaed8f0, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Brown soil for the field
    bg.fillStyle(0x8b6914, 0.3);
    bg.fillRect(80, 200, GAME_WIDTH - 160, GAME_HEIGHT - 350);
    bg.lineStyle(2, 0x6b4226, 0.3);
    bg.strokeRect(80, 200, GAME_WIDTH - 160, GAME_HEIGHT - 350);

    // Green edges
    bg.fillStyle(0x7ec850, 1);
    bg.fillRect(0, GAME_HEIGHT - 100, GAME_WIDTH, 100);

    // Back button
    const backBtn = this.add.text(60, 65, '< Back', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive();
    backBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('DistrictScene', { districtId: 'farm' }));
    });
  }

  private drawUI(): void {
    this.add.text(GAME_WIDTH / 2, 70, 'Harvest exactly:', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.targetText = this.add.text(GAME_WIDTH / 2, 110, '0', {
      fontFamily: 'Arial Black', fontSize: '52px',
      color: '#f1c40f', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.totalText = this.add.text(GAME_WIDTH / 2, 165, 'Harvested: 0', {
      fontFamily: 'Arial Black', fontSize: '24px',
      color: '#2ecc71', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.roundText = this.add.text(GAME_WIDTH - 80, 65, `1/${ROUNDS}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Submit / Done button
    this.submitBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 55, 'btn_green').setInteractive();
    this.submitBtn.setScale(1.2);
    this.submitText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 57, 'Done!', {
      fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);

    this.submitBtn.on('pointerup', () => this.checkAnswer());
    this.submitBtn.on('pointerover', () => this.submitBtn.setScale(1.25));
    this.submitBtn.on('pointerout', () => this.submitBtn.setScale(1.2));

    this.feedbackText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);
  }

  private nextRound(): void {
    this.currentRound++;
    if (this.currentRound > ROUNDS) { this.gameOver(); return; }

    // Clean up old rows
    this.rows.forEach(r => r.container.destroy());
    this.rows = [];
    this.currentTotal = 0;
    this.totalText.setText('Harvested: 0');

    const diff = this.difficulty.getDifficulty('farm', 'addition-strategy');
    const maxNum = diff.numberRange[1];

    // Generate rows of crops
    const cropTypes = [
      { type: 'carrot', color: 0xe67e22 },
      { type: 'corn', color: 0xf1c40f },
      { type: 'potato', color: 0xd4a574 },
      { type: 'tomato', color: 0xe74c3c },
      { type: 'lettuce', color: 0x27ae60 },
    ];

    const numRows = Phaser.Math.Between(4, 6);
    const rowCounts: number[] = [];
    for (let i = 0; i < numRows; i++) {
      rowCounts.push(Phaser.Math.Between(2, Math.min(12, maxNum)));
    }

    // Pick a target that's achievable by summing some subset of rows
    // Simple: pick 2-3 rows and sum them
    const pickCount = Phaser.Math.Between(2, Math.min(3, numRows));
    const shuffled = [...rowCounts].sort(() => Math.random() - 0.5);
    this.targetNumber = shuffled.slice(0, pickCount).reduce((a, b) => a + b, 0);

    this.targetText.setText(`${this.targetNumber}`);
    this.roundText.setText(`${this.currentRound}/${ROUNDS}`);

    // Draw rows
    const rowHeight = 60;
    const startY = 215;

    rowCounts.forEach((count, i) => {
      const crop = cropTypes[i % cropTypes.length]!;
      const y = startY + i * rowHeight;

      const container = this.add.container(0, 0);
      const row: CropRow = { count, type: crop.type, color: crop.color, harvested: false, container };

      // Row background (soil ridge)
      const rowBg = this.add.graphics();
      rowBg.fillStyle(0x8b6914, 0.2);
      rowBg.fillRoundedRect(100, y, GAME_WIDTH - 200, rowHeight - 8, 6);
      container.add(rowBg);

      // Draw individual crops
      const cropSpacing = Math.min(40, (GAME_WIDTH - 300) / count);
      const cropStartX = 140;
      for (let c = 0; c < count; c++) {
        const cx = cropStartX + c * cropSpacing;
        const cropG = this.add.graphics();
        cropG.fillStyle(crop.color, 1);
        cropG.fillCircle(cx, y + rowHeight / 2 - 4, 10);
        cropG.lineStyle(1, 0x000000, 0.3);
        cropG.strokeCircle(cx, y + rowHeight / 2 - 4, 10);
        // Stem
        cropG.lineStyle(2, 0x27ae60, 1);
        cropG.lineBetween(cx, y + rowHeight / 2 - 14, cx, y + rowHeight / 2 - 22);
        container.add(cropG);
      }

      // Row count label
      const countLabel = this.add.text(GAME_WIDTH - 120, y + rowHeight / 2 - 4, `${count}`, {
        fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);
      container.add(countLabel);

      // Harvest button
      const harvestBtn = this.add.graphics();
      harvestBtn.fillStyle(0x27ae60, 1);
      harvestBtn.fillRoundedRect(GAME_WIDTH - 185, y + 8, 50, rowHeight - 24, 6);
      container.add(harvestBtn);

      const harvestIcon = this.add.text(GAME_WIDTH - 160, y + rowHeight / 2 - 4, '✂', {
        fontSize: '20px',
      }).setOrigin(0.5);
      container.add(harvestIcon);

      // Hit area for the row
      const hitArea = this.add.rectangle(GAME_WIDTH / 2, y + rowHeight / 2 - 4, GAME_WIDTH - 200, rowHeight - 8)
        .setInteractive().setAlpha(0.001);
      container.add(hitArea);

      hitArea.on('pointerup', () => {
        if (!row.harvested) {
          this.harvestRow(row, i);
        } else {
          this.unharvestRow(row, i);
        }
      });

      this.rows.push(row);
    });
  }

  private harvestRow(row: CropRow, _index: number): void {
    row.harvested = true;
    this.currentTotal += row.count;
    this.totalText.setText(`Harvested: ${this.currentTotal}`);

    // Visual: dim the row and show checkmark
    row.container.setAlpha(0.5);

    // Update total color
    if (this.currentTotal === this.targetNumber) {
      this.totalText.setColor('#2ecc71');
    } else if (this.currentTotal > this.targetNumber) {
      this.totalText.setColor('#e74c3c');
    } else {
      this.totalText.setColor('#f1c40f');
    }
  }

  private unharvestRow(row: CropRow, _index: number): void {
    row.harvested = false;
    this.currentTotal -= row.count;
    this.totalText.setText(`Harvested: ${this.currentTotal}`);
    row.container.setAlpha(1);

    if (this.currentTotal === this.targetNumber) {
      this.totalText.setColor('#2ecc71');
    } else if (this.currentTotal > this.targetNumber) {
      this.totalText.setColor('#e74c3c');
    } else {
      this.totalText.setColor('#f1c40f');
    }
  }

  private checkAnswer(): void {
    if (this.currentTotal === this.targetNumber) {
      this.correctCount++;
      const earned = this.economy.recordCorrectAnswer(false, false);
      this.economy.addXP(10);
      this.difficulty.recordAnswer('addition-strategy', true);
      if (this.profile) this.hud.update(this.profile);

      this.showFeedback(`Exact harvest! +${earned}`, '#2ecc71', () => {
        this.time.delayedCall(400, () => this.nextRound());
      });
      this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else {
      this.economy.recordWrongAnswer();
      this.difficulty.recordAnswer('addition-strategy', false);
      if (this.profile) this.hud.update(this.profile);

      const diff = this.currentTotal - this.targetNumber;
      const msg = diff > 0
        ? `Too much! ${this.currentTotal} > ${this.targetNumber}`
        : `Not enough! ${this.currentTotal} < ${this.targetNumber}`;

      this.showFeedback(msg, '#e74c3c', () => {
        this.time.delayedCall(400, () => this.nextRound());
      });
    }
  }

  private showFeedback(text: string, color: string, onDone?: () => void): void {
    this.feedbackText.setText(text);
    this.feedbackText.setColor(color);
    this.feedbackText.setAlpha(1).setScale(0.5);

    this.tweens.add({
      targets: this.feedbackText,
      scale: 1, duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: this.feedbackText, alpha: 0, duration: 200,
            onComplete: () => { if (onDone) onDone(); },
          });
        });
      },
    });
  }

  private gameOver(): void {
    const bonus = this.economy.completeMiniGame();
    if (this.profile) { this.hud.update(this.profile); SaveManager.saveProfile(this.profile); }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT).setDepth(800);

    const box = this.add.graphics();
    box.fillStyle(0x2c3e50, 1);
    box.fillRoundedRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 140, 400, 280, 16);
    box.lineStyle(3, 0xf1c40f, 1);
    box.strokeRoundedRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 140, 400, 280, 16);
    box.setDepth(801);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Harvest Complete!', {
      fontFamily: 'Arial Black', fontSize: '28px', color: '#f1c40f',
    }).setOrigin(0.5).setDepth(802);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, `${this.correctCount} / ${ROUNDS} correct`, {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(802);

    let stars = 0;
    if (this.correctCount >= ROUNDS * 0.5) stars = 1;
    if (this.correctCount >= ROUNDS * 0.8) stars = 2;
    if (this.correctCount >= ROUNDS * 0.95) stars = 3;

    for (let i = 0; i < 3; i++) {
      const star = this.add.image(GAME_WIDTH / 2 - 50 + i * 50, GAME_HEIGHT / 2, 'star');
      star.setScale(1.5).setAlpha(i < stars ? 1 : 0.2).setDepth(802);
      if (i < stars) {
        this.tweens.add({ targets: star, scale: 2, duration: 300, delay: i * 200, yoyo: true, ease: 'Back.easeOut' });
      }
    }

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45, `+${bonus} bonus`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#2ecc71',
    }).setOrigin(0.5).setDepth(802);

    const contBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 'btn_green').setInteractive().setDepth(802);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 88, 'Continue', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(802);
    contBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('DistrictScene', { districtId: 'farm' }));
    });
  }
}
