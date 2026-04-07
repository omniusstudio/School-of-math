import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { DifficultyEngine } from '../../systems/DifficultyEngine';
import { HUD } from '../../ui/HUD';

const ROUNDS = 8;

interface TradeSide {
  groups: number;
  perGroup: number;
  total: number;
  icon: string;
  color: number;
}

export class FairTradeScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private difficulty!: DifficultyEngine;
  private hud!: HUD;

  private leftSide!: TradeSide;
  private rightSide!: TradeSide;
  private currentRound: number = 0;
  private correctCount: number = 0;

  private roundText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private questionText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'FairTradeScene' });
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

    // Trading table
    bg.fillStyle(0x8b6914, 1);
    bg.fillRect(50, GAME_HEIGHT * 0.55, GAME_WIDTH - 100, 15);
    bg.fillRect(150, GAME_HEIGHT * 0.55, 30, GAME_HEIGHT * 0.45);
    bg.fillRect(GAME_WIDTH - 180, GAME_HEIGHT * 0.55, 30, GAME_HEIGHT * 0.45);

    // Mara NPC
    const mara = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'npc_mara');
    mara.setScale(2.5);
    this.tweens.add({
      targets: mara, y: mara.y - 3,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    const backBtn = this.add.text(60, 65, '< Back', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive();
    backBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('DistrictScene', { districtId: 'market' }));
    });
  }

  private drawUI(): void {
    this.add.text(GAME_WIDTH / 2, 75, 'Is this a fair trade?', {
      fontFamily: 'Arial Black', fontSize: '28px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.questionText = this.add.text(GAME_WIDTH / 2, 120, '', {
      fontFamily: 'Arial', fontSize: '18px',
      color: '#ecf0f1', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.roundText = this.add.text(GAME_WIDTH - 80, 65, `1/${ROUNDS}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);
  }

  private nextRound(): void {
    this.currentRound++;
    if (this.currentRound > ROUNDS) { this.gameOver(); return; }

    const diff = this.difficulty.getDifficulty('market', 'multiplication-equiv');
    const maxNum = diff.numberRange[1];

    const icons = [
      { icon: '🍎', color: 0xe74c3c },
      { icon: '🍊', color: 0xe67e22 },
      { icon: '🍋', color: 0xf1c40f },
      { icon: '🫐', color: 0x3498db },
      { icon: '🍇', color: 0x9b59b6 },
    ];

    const leftIcon = Phaser.Math.RND.pick(icons);
    let rightIcon = Phaser.Math.RND.pick(icons);
    while (rightIcon.icon === leftIcon.icon) rightIcon = Phaser.Math.RND.pick(icons);

    // Generate left side
    const leftGroups = Phaser.Math.Between(2, Math.min(6, maxNum));
    const leftPer = Phaser.Math.Between(2, Math.min(8, maxNum));
    const leftTotal = leftGroups * leftPer;

    this.leftSide = { groups: leftGroups, perGroup: leftPer, total: leftTotal, icon: leftIcon.icon, color: leftIcon.color };

    // 50% chance: equal trade, 50% chance: unequal
    const isFair = Math.random() < 0.5;

    let rightGroups: number;
    let rightPer: number;

    if (isFair) {
      // Find different grouping with same total
      const factors: [number, number][] = [];
      for (let g = 2; g <= Math.min(8, leftTotal); g++) {
        if (leftTotal % g === 0 && leftTotal / g <= 8) {
          factors.push([g, leftTotal / g]);
        }
      }
      if (factors.length > 0) {
        const pick = Phaser.Math.RND.pick(factors);
        rightGroups = pick[0];
        rightPer = pick[1];
      } else {
        rightGroups = leftGroups;
        rightPer = leftPer;
      }
    } else {
      // Unequal — offset by 1 or 2
      rightGroups = Phaser.Math.Between(2, Math.min(6, maxNum));
      rightPer = Phaser.Math.Between(2, Math.min(8, maxNum));
      // Make sure it's actually different
      while (rightGroups * rightPer === leftTotal) {
        rightPer = Phaser.Math.Between(2, Math.min(8, maxNum));
      }
    }

    this.rightSide = {
      groups: rightGroups, perGroup: rightPer,
      total: rightGroups * rightPer,
      icon: rightIcon.icon, color: rightIcon.color,
    };

    this.roundText.setText(`${this.currentRound}/${ROUNDS}`);
    this.questionText.setText(`${leftGroups} bags of ${leftPer} ${leftIcon.icon}  vs  ${rightGroups} bags of ${rightPer} ${rightIcon.icon}`);

    this.drawTrade();
  }

  private drawTrade(): void {
    // Clear previous trade display (destroy children except persistent UI)
    this.children.list
      .filter((child): child is Phaser.GameObjects.Container =>
        child instanceof Phaser.GameObjects.Container && child.getData('tradeDisplay'))
      .forEach(c => c.destroy());

    const tradeContainer = this.add.container(0, 0);
    tradeContainer.setData('tradeDisplay', true);

    // Left side
    const leftLabel = this.add.text(GAME_WIDTH / 4, 170, `${this.leftSide.groups} × ${this.leftSide.perGroup}`, {
      fontFamily: 'Arial Black', fontSize: '32px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    tradeContainer.add(leftLabel);

    // Draw groups of items
    for (let g = 0; g < this.leftSide.groups; g++) {
      const gx = 80 + (g % 3) * 140;
      const gy = 210 + Math.floor(g / 3) * 100;

      for (let p = 0; p < this.leftSide.perGroup; p++) {
        const px = gx + (p % 4) * 30;
        const py = gy + Math.floor(p / 4) * 30;
        const item = this.add.text(px, py, this.leftSide.icon, { fontSize: '22px' });
        tradeContainer.add(item);
      }
    }

    // VS text
    const vsText = this.add.text(GAME_WIDTH / 2, 300, 'VS', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#f1c40f', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    tradeContainer.add(vsText);

    // Right side
    const rightLabel = this.add.text(GAME_WIDTH * 3 / 4, 170, `${this.rightSide.groups} × ${this.rightSide.perGroup}`, {
      fontFamily: 'Arial Black', fontSize: '32px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    tradeContainer.add(rightLabel);

    for (let g = 0; g < this.rightSide.groups; g++) {
      const gx = GAME_WIDTH / 2 + 80 + (g % 3) * 140;
      const gy = 210 + Math.floor(g / 3) * 100;

      for (let p = 0; p < this.rightSide.perGroup; p++) {
        const px = gx + (p % 4) * 30;
        const py = gy + Math.floor(p / 4) * 30;
        const item = this.add.text(px, py, this.rightSide.icon, { fontSize: '22px' });
        tradeContainer.add(item);
      }
    }

    // Answer buttons
    const fairBtn = this.add.image(GAME_WIDTH / 2 - 120, GAME_HEIGHT * 0.52, 'btn_green').setInteractive();
    const fairText = this.add.text(GAME_WIDTH / 2 - 120, GAME_HEIGHT * 0.52 - 2, '✓ Fair!', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);
    tradeContainer.add([fairBtn, fairText]);

    const unfairBtn = this.add.image(GAME_WIDTH / 2 + 120, GAME_HEIGHT * 0.52, 'btn_red').setInteractive();
    const unfairText = this.add.text(GAME_WIDTH / 2 + 120, GAME_HEIGHT * 0.52 - 2, '✗ Not Fair!', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);
    tradeContainer.add([unfairBtn, unfairText]);

    const isFair = this.leftSide.total === this.rightSide.total;

    fairBtn.on('pointerup', () => this.answerTrade(true, isFair));
    unfairBtn.on('pointerup', () => this.answerTrade(false, isFair));
  }

  private answerTrade(answeredFair: boolean, actuallyFair: boolean): void {
    const correct = answeredFair === actuallyFair;

    if (correct) {
      this.correctCount++;
      const earned = this.economy.recordCorrectAnswer(false, false);
      this.economy.addXP(10);
      this.difficulty.recordAnswer('multiplication-equiv', true);
      if (this.profile) this.hud.update(this.profile);

      const msg = actuallyFair
        ? `Yes! Both equal ${this.leftSide.total}! +${earned}`
        : `Right! ${this.leftSide.total} ≠ ${this.rightSide.total}! +${earned}`;

      this.showFeedback(msg, '#2ecc71', () => {
        this.time.delayedCall(400, () => this.nextRound());
      });
      this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else {
      this.economy.recordWrongAnswer();
      this.difficulty.recordAnswer('multiplication-equiv', false);
      if (this.profile) this.hud.update(this.profile);

      const msg = actuallyFair
        ? `Both are ${this.leftSide.total}! It WAS fair!`
        : `${this.leftSide.total} vs ${this.rightSide.total} - NOT fair!`;

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
        this.time.delayedCall(1200, () => {
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

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Trading Done!', {
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
      this.time.delayedCall(300, () => this.scene.start('DistrictScene', { districtId: 'market' }));
    });
  }
}
