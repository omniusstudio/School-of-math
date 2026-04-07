import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { DifficultyEngine } from '../../systems/DifficultyEngine';
import { HUD } from '../../ui/HUD';

const ROUNDS = 8;

export class CookieCutterScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private difficulty!: DifficultyEngine;
  private hud!: HUD;

  private targetParts: number = 0;
  private cutsMade: number = 0;
  private currentRound: number = 0;
  private correctCount: number = 0;
  private cutLines: Phaser.GameObjects.Graphics[] = [];

  private targetText!: Phaser.GameObjects.Text;
  private cutsText!: Phaser.GameObjects.Text;
  private partsText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private doughContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'CookieCutterScene' });
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
    bg.fillGradientStyle(0xfff3e0, 0xfff3e0, 0xffe0b2, 0xffe0b2, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Cutting board surface
    bg.fillStyle(0xcd853f, 1);
    bg.fillRoundedRect(100, 200, GAME_WIDTH - 200, 350, 12);
    bg.lineStyle(3, 0x8b6914, 1);
    bg.strokeRoundedRect(100, 200, GAME_WIDTH - 200, 350, 12);

    // Wood grain
    bg.lineStyle(1, 0xb8860b, 0.2);
    for (let y = 220; y < 540; y += 25) {
      bg.lineBetween(110, y, GAME_WIDTH - 110, y);
    }

    const backBtn = this.add.text(60, 65, '< Back', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#8b4513', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive();
    backBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('DistrictScene', { districtId: 'bakery' }));
    });
  }

  private drawUI(): void {
    this.add.text(GAME_WIDTH / 2, 75, 'Cut the dough into equal parts!', {
      fontFamily: 'Arial Black', fontSize: '24px',
      color: '#8b4513', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.targetText = this.add.text(GAME_WIDTH / 2, 120, 'Cut into: 0 equal pieces', {
      fontFamily: 'Arial Black', fontSize: '22px',
      color: '#d35400', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.cutsText = this.add.text(GAME_WIDTH / 4, 165, 'Cuts: 0', {
      fontFamily: 'Arial Black', fontSize: '20px',
      color: '#2c3e50', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.partsText = this.add.text(GAME_WIDTH * 3 / 4, 165, 'Parts: 1', {
      fontFamily: 'Arial Black', fontSize: '20px',
      color: '#2c3e50', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.roundText = this.add.text(GAME_WIDTH - 80, 65, `1/${ROUNDS}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#8b4513', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    // Done button
    const doneBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'btn_orange').setInteractive();
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 52, 'Done Cutting!', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);
    doneBtn.on('pointerup', () => this.checkAnswer());

    // Undo button
    const undoBtn = this.add.text(GAME_WIDTH / 2 + 150, GAME_HEIGHT - 50, 'Undo', {
      fontFamily: 'Arial', fontSize: '16px', color: '#e74c3c',
      backgroundColor: '#2c3e50', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setInteractive();
    undoBtn.on('pointerup', () => this.undoCut());

    this.feedbackText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);
  }

  private nextRound(): void {
    this.currentRound++;
    if (this.currentRound > ROUNDS) { this.gameOver(); return; }

    if (this.doughContainer) this.doughContainer.destroy();
    this.cutLines.forEach(l => l.destroy());
    this.cutLines = [];
    this.cutsMade = 0;

    const diff = this.difficulty.getDifficulty('bakery', 'fractions-equal');
    const maxNum = diff.numberRange[1];

    // Target: split into 2, 3, 4, 5, 6 or 8 equal parts
    const possibleParts = [2, 3, 4, 5, 6, 8].filter(p => p <= Math.max(maxNum, 4));
    this.targetParts = Phaser.Math.RND.pick(possibleParts);

    this.targetText.setText(`Cut into ${this.targetParts} equal pieces`);
    this.cutsText.setText('Cuts: 0');
    this.partsText.setText('Parts: 1');
    this.roundText.setText(`${this.currentRound}/${ROUNDS}`);

    this.drawDough();
  }

  private drawDough(): void {
    this.doughContainer = this.add.container(0, 0);

    const doughX = GAME_WIDTH / 2;
    const doughY = 375;
    const doughW = 500;
    const doughH = 200;

    // Dough shape (rectangle for easy fraction visualization)
    const dough = this.add.graphics();
    dough.fillStyle(0xf5deb3, 1);
    dough.fillRoundedRect(doughX - doughW / 2, doughY - doughH / 2, doughW, doughH, 8);
    dough.lineStyle(3, 0xdaa520, 1);
    dough.strokeRoundedRect(doughX - doughW / 2, doughY - doughH / 2, doughW, doughH, 8);
    this.doughContainer.add(dough);

    // Sprinkle dots for visual texture
    const sprinkles = this.add.graphics();
    sprinkles.fillStyle(0xdaa520, 0.3);
    for (let i = 0; i < 30; i++) {
      const sx = doughX - doughW / 2 + 20 + Math.random() * (doughW - 40);
      const sy = doughY - doughH / 2 + 20 + Math.random() * (doughH - 40);
      sprinkles.fillCircle(sx, sy, 2);
    }
    this.doughContainer.add(sprinkles);

    // Fraction label showing 1/1 (whole)
    const fracLabel = this.add.text(doughX, doughY, '1 whole', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#8b4513',
    }).setOrigin(0.5).setAlpha(0.5);
    this.doughContainer.add(fracLabel);

    // Make dough clickable to add cut lines
    const hitArea = this.add.rectangle(doughX, doughY, doughW, doughH).setInteractive().setAlpha(0.001);
    this.doughContainer.add(hitArea);

    hitArea.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.addCut(pointer.x, doughX, doughY, doughW, doughH);
    });
  }

  private addCut(clickX: number, doughX: number, doughY: number, doughW: number, doughH: number): void {
    const leftEdge = doughX - doughW / 2;
    const rightEdge = doughX + doughW / 2;

    // Snap click to nearest valid position within dough
    if (clickX < leftEdge + 20 || clickX > rightEdge - 20) return;

    this.cutsMade++;

    // Draw cut line
    const line = this.add.graphics();
    line.lineStyle(4, 0xe74c3c, 0.8);
    line.lineBetween(clickX, doughY - doughH / 2 - 5, clickX, doughY + doughH / 2 + 5);
    // Dashed effect
    line.lineStyle(2, 0xffffff, 0.5);
    for (let y = doughY - doughH / 2; y < doughY + doughH / 2; y += 10) {
      line.lineBetween(clickX, y, clickX, y + 5);
    }
    this.cutLines.push(line);

    this.cutsText.setText(`Cuts: ${this.cutsMade}`);
    this.partsText.setText(`Parts: ${this.cutsMade + 1}`);

    // Animate the cut
    this.tweens.add({
      targets: line,
      alpha: { from: 0, to: 1 },
      duration: 200,
    });

    // Color feedback
    if (this.cutsMade + 1 === this.targetParts) {
      this.partsText.setColor('#2ecc71');
    } else if (this.cutsMade + 1 > this.targetParts) {
      this.partsText.setColor('#e74c3c');
    } else {
      this.partsText.setColor('#2c3e50');
    }
  }

  private undoCut(): void {
    if (this.cutLines.length === 0) return;
    const lastLine = this.cutLines.pop()!;
    lastLine.destroy();
    this.cutsMade--;
    this.cutsText.setText(`Cuts: ${this.cutsMade}`);
    this.partsText.setText(`Parts: ${this.cutsMade + 1}`);

    if (this.cutsMade + 1 === this.targetParts) {
      this.partsText.setColor('#2ecc71');
    } else {
      this.partsText.setColor('#2c3e50');
    }
  }

  private checkAnswer(): void {
    const parts = this.cutsMade + 1;

    if (parts === this.targetParts) {
      this.correctCount++;
      const earned = this.economy.recordCorrectAnswer(false, false);
      this.economy.addXP(10);
      this.difficulty.recordAnswer('fractions-equal', true);
      if (this.profile) this.hud.update(this.profile);

      this.showFeedback(`${this.targetParts} equal parts! +${earned}`, '#2ecc71', () => {
        this.time.delayedCall(400, () => this.nextRound());
      });
      this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else {
      this.economy.recordWrongAnswer();
      this.difficulty.recordAnswer('fractions-equal', false);
      if (this.profile) this.hud.update(this.profile);

      const msg = parts > this.targetParts
        ? `Too many! ${parts} parts, need ${this.targetParts}`
        : `Not enough! ${parts} parts, need ${this.targetParts}`;

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

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Cutting Complete!', {
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
      this.time.delayedCall(300, () => this.scene.start('DistrictScene', { districtId: 'bakery' }));
    });
  }
}
