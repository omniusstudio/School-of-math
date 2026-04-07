import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { DifficultyEngine } from '../../systems/DifficultyEngine';
import { HUD } from '../../ui/HUD';

const ROUNDS = 8;

export class OrderUpScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private difficulty!: DifficultyEngine;
  private hud!: HUD;

  private targetTotal: number = 0;
  private rows: number = 0;
  private cols: number = 0;
  private traySlots: boolean[][] = [];
  private filledCount: number = 0;
  private currentRound: number = 0;
  private correctCount: number = 0;

  private targetText!: Phaser.GameObjects.Text;
  private filledText!: Phaser.GameObjects.Text;
  private equationText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private trayContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'OrderUpScene' });
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

    // Kitchen counter
    bg.fillStyle(0xd4a574, 1);
    bg.fillRect(0, GAME_HEIGHT - 150, GAME_WIDTH, 150);
    bg.fillStyle(0x8b6914, 1);
    bg.fillRect(0, GAME_HEIGHT - 150, GAME_WIDTH, 8);

    // Oven on the right
    bg.fillStyle(0x555555, 1);
    bg.fillRoundedRect(GAME_WIDTH - 200, GAME_HEIGHT - 350, 160, 200, 10);
    bg.fillStyle(0xff6600, 0.5);
    bg.fillRect(GAME_WIDTH - 185, GAME_HEIGHT - 280, 130, 60);

    // Ben NPC
    const ben = this.add.image(100, GAME_HEIGHT - 200, 'npc_ben');
    ben.setScale(2.5);
    this.tweens.add({
      targets: ben, y: ben.y - 3,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

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
    this.add.text(GAME_WIDTH / 2, 75, 'Fill the cookie tray!', {
      fontFamily: 'Arial Black', fontSize: '26px',
      color: '#8b4513', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.targetText = this.add.text(GAME_WIDTH / 2, 120, 'Order: 0 cookies', {
      fontFamily: 'Arial Black', fontSize: '22px',
      color: '#d35400', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.equationText = this.add.text(GAME_WIDTH / 2, 155, '', {
      fontFamily: 'Arial Black', fontSize: '20px',
      color: '#c0392b', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.filledText = this.add.text(GAME_WIDTH / 2, 185, 'Filled: 0', {
      fontFamily: 'Arial Black', fontSize: '24px',
      color: '#27ae60', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.roundText = this.add.text(GAME_WIDTH - 80, 65, `1/${ROUNDS}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#8b4513', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    // Submit button
    const submitBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'btn_orange').setInteractive();
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 62, 'Bake!', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);
    submitBtn.on('pointerup', () => this.checkAnswer());

    this.feedbackText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);
  }

  private nextRound(): void {
    this.currentRound++;
    if (this.currentRound > ROUNDS) { this.gameOver(); return; }

    if (this.trayContainer) this.trayContainer.destroy();

    const diff = this.difficulty.getDifficulty('bakery', 'arrays-multiplication');
    const maxNum = diff.numberRange[1];

    // Generate array dimensions
    this.rows = Phaser.Math.Between(2, Math.min(5, maxNum));
    this.cols = Phaser.Math.Between(2, Math.min(6, maxNum));
    this.targetTotal = this.rows * this.cols;
    this.filledCount = 0;

    // Initialize tray slots
    this.traySlots = [];
    for (let r = 0; r < this.rows; r++) {
      this.traySlots[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.traySlots[r][c] = false;
      }
    }

    this.targetText.setText(`Order: ${this.targetTotal} cookies`);
    this.equationText.setText(`${this.rows} rows × ${this.cols} columns = ?`);
    this.filledText.setText('Filled: 0');
    this.roundText.setText(`${this.currentRound}/${ROUNDS}`);

    this.drawTray();
  }

  private drawTray(): void {
    this.trayContainer = this.add.container(0, 0);

    const slotSize = 55;
    const gap = 6;
    const trayW = this.cols * (slotSize + gap) + gap;
    const trayH = this.rows * (slotSize + gap) + gap;
    const trayX = (GAME_WIDTH - trayW) / 2;
    const trayY = 220;

    // Tray background
    const trayBg = this.add.graphics();
    trayBg.fillStyle(0xb8860b, 1);
    trayBg.fillRoundedRect(trayX - 10, trayY - 10, trayW + 20, trayH + 20, 12);
    trayBg.lineStyle(3, 0x8b6914, 1);
    trayBg.strokeRoundedRect(trayX - 10, trayY - 10, trayW + 20, trayH + 20, 12);
    this.trayContainer.add(trayBg);

    // Row and column labels
    for (let r = 0; r < this.rows; r++) {
      const label = this.add.text(trayX - 25, trayY + gap + r * (slotSize + gap) + slotSize / 2, `${r + 1}`, {
        fontFamily: 'Arial Black', fontSize: '16px', color: '#8b4513',
      }).setOrigin(0.5);
      this.trayContainer.add(label);
    }
    for (let c = 0; c < this.cols; c++) {
      const label = this.add.text(trayX + gap + c * (slotSize + gap) + slotSize / 2, trayY - 25, `${c + 1}`, {
        fontFamily: 'Arial Black', fontSize: '16px', color: '#8b4513',
      }).setOrigin(0.5);
      this.trayContainer.add(label);
    }

    // Grid slots
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const sx = trayX + gap + c * (slotSize + gap);
        const sy = trayY + gap + r * (slotSize + gap);

        // Slot background
        const slotBg = this.add.graphics();
        slotBg.fillStyle(0xfff8dc, 1);
        slotBg.fillRoundedRect(sx, sy, slotSize, slotSize, 6);
        slotBg.lineStyle(1, 0xdaa520, 0.5);
        slotBg.strokeRoundedRect(sx, sy, slotSize, slotSize, 6);
        this.trayContainer.add(slotBg);

        // Cookie placeholder (hidden initially)
        const cookie = this.add.graphics();
        cookie.fillStyle(0xd4a574, 1);
        cookie.fillCircle(sx + slotSize / 2, sy + slotSize / 2, slotSize / 2 - 6);
        cookie.fillStyle(0x8b4513, 1);
        // Chocolate chips
        cookie.fillCircle(sx + slotSize / 2 - 8, sy + slotSize / 2 - 5, 3);
        cookie.fillCircle(sx + slotSize / 2 + 6, sy + slotSize / 2 + 3, 3);
        cookie.fillCircle(sx + slotSize / 2 - 2, sy + slotSize / 2 + 8, 3);
        cookie.setVisible(false);
        this.trayContainer.add(cookie);

        // Click to toggle
        const hitArea = this.add.rectangle(sx + slotSize / 2, sy + slotSize / 2, slotSize, slotSize)
          .setInteractive().setAlpha(0.001);
        this.trayContainer.add(hitArea);

        hitArea.on('pointerup', () => {
          if (!this.traySlots[r][c]) {
            this.traySlots[r][c] = true;
            cookie.setVisible(true);
            this.filledCount++;
            // Pop animation
            cookie.setScale(0);
            this.tweens.add({ targets: cookie, scale: 1, duration: 150, ease: 'Back.easeOut' });
          } else {
            this.traySlots[r][c] = false;
            cookie.setVisible(false);
            this.filledCount--;
          }

          this.filledText.setText(`Filled: ${this.filledCount}`);
          if (this.filledCount === this.targetTotal) {
            this.filledText.setColor('#2ecc71');
          } else if (this.filledCount > this.targetTotal) {
            this.filledText.setColor('#e74c3c');
          } else {
            this.filledText.setColor('#27ae60');
          }
        });
      }
    }
  }

  private checkAnswer(): void {
    // Check: all slots filled?
    const allFilled = this.traySlots.every(row => row.every(slot => slot));

    if (allFilled && this.filledCount === this.targetTotal) {
      this.correctCount++;
      const earned = this.economy.recordCorrectAnswer(false, false);
      this.economy.addXP(12);
      this.difficulty.recordAnswer('arrays-multiplication', true);
      if (this.profile) this.hud.update(this.profile);

      this.equationText.setText(`${this.rows} × ${this.cols} = ${this.targetTotal}!`);
      this.showFeedback(`Full tray! +${earned}`, '#2ecc71', () => {
        this.time.delayedCall(400, () => this.nextRound());
      });
      this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else {
      this.economy.recordWrongAnswer();
      this.difficulty.recordAnswer('arrays-multiplication', false);
      if (this.profile) this.hud.update(this.profile);

      const msg = this.filledCount < this.targetTotal
        ? `Fill all ${this.targetTotal} spots!`
        : `Only ${this.targetTotal} needed!`;

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

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Bakery Closed!', {
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
