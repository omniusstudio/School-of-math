import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { DifficultyEngine } from '../../systems/DifficultyEngine';
import { HUD } from '../../ui/HUD';

const ROUNDS = 8;

interface CoinDef {
  value: number;
  color: number;
  radius: number;
  label: string;
}

const COIN_TYPES: CoinDef[] = [
  { value: 1, color: 0xcd7f32, radius: 14, label: '1¢' },
  { value: 5, color: 0xc0c0c0, radius: 16, label: '5¢' },
  { value: 10, color: 0xc0c0c0, radius: 18, label: '10¢' },
  { value: 25, color: 0xc0c0c0, radius: 20, label: '25¢' },
];

export class MakeChangeScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private difficulty!: DifficultyEngine;
  private hud!: HUD;

  private itemPrice: number = 0;
  private amountPaid: number = 0;
  private changeNeeded: number = 0;
  private changeGiven: number = 0;
  private currentRound: number = 0;
  private correctCount: number = 0;

  private priceText!: Phaser.GameObjects.Text;
  private paidText!: Phaser.GameObjects.Text;
  private changeText!: Phaser.GameObjects.Text;
  private givenText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private coinDrawer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'MakeChangeScene' });
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
    this.drawCoinDrawer();

    this.hud = new HUD(this);
    this.hud.update(profile);

    this.nextRound();
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xaed8f0, 0xaed8f0, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Market stall counter
    bg.fillStyle(0x8b6914, 1);
    bg.fillRect(0, GAME_HEIGHT * 0.4, GAME_WIDTH, 15);
    bg.fillStyle(0xcd853f, 1);
    bg.fillRect(0, GAME_HEIGHT * 0.4 + 15, GAME_WIDTH, GAME_HEIGHT * 0.6);

    // Awning stripes
    for (let x = 0; x < GAME_WIDTH; x += 80) {
      bg.fillStyle(x % 160 === 0 ? 0xe74c3c : 0xffffff, 0.8);
      bg.fillRect(x, GAME_HEIGHT * 0.4 - 40, 80, 40);
    }

    // Back button
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
    // Item being sold
    this.add.text(GAME_WIDTH / 2, 80, 'Make the right change!', {
      fontFamily: 'Arial Black', fontSize: '24px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.priceText = this.add.text(GAME_WIDTH / 4, 140, 'Price: 0¢', {
      fontFamily: 'Arial Black', fontSize: '22px',
      color: '#f1c40f', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.paidText = this.add.text(GAME_WIDTH / 2, 140, 'Paid: 0¢', {
      fontFamily: 'Arial Black', fontSize: '22px',
      color: '#2ecc71', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.changeText = this.add.text(GAME_WIDTH * 3 / 4, 140, 'Change: 0¢', {
      fontFamily: 'Arial Black', fontSize: '22px',
      color: '#e74c3c', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.givenText = this.add.text(GAME_WIDTH / 2, 185, 'Your change: 0¢', {
      fontFamily: 'Arial Black', fontSize: '28px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.roundText = this.add.text(GAME_WIDTH - 80, 65, `1/${ROUNDS}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Done button
    const doneBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'btn_green').setInteractive();
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 52, 'Give Change!', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);
    doneBtn.on('pointerup', () => this.checkAnswer());

    this.feedbackText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);
  }

  private drawCoinDrawer(): void {
    this.coinDrawer = this.add.container(0, 0);

    // Coin drawer background
    const drawerBg = this.add.graphics();
    drawerBg.fillStyle(0x4a3520, 1);
    drawerBg.fillRoundedRect(100, GAME_HEIGHT * 0.45, GAME_WIDTH - 200, 200, 10);
    drawerBg.lineStyle(3, 0x2c1810, 1);
    drawerBg.strokeRoundedRect(100, GAME_HEIGHT * 0.45, GAME_WIDTH - 200, 200, 10);
    this.coinDrawer.add(drawerBg);

    // Draw coin stacks for each type
    COIN_TYPES.forEach((coinDef, i) => {
      const sectionX = 160 + i * 250;
      const sectionY = GAME_HEIGHT * 0.45 + 30;

      // Section label
      const label = this.add.text(sectionX + 40, sectionY - 5, coinDef.label, {
        fontFamily: 'Arial Black', fontSize: '16px', color: '#f1c40f',
      }).setOrigin(0.5);
      this.coinDrawer.add(label);

      // Create clickable coins (5 per type)
      for (let j = 0; j < 5; j++) {
        const cx = sectionX + (j % 3) * 35;
        const cy = sectionY + 30 + Math.floor(j / 3) * 40;

        const coinG = this.add.graphics();
        coinG.fillStyle(coinDef.color, 1);
        coinG.fillCircle(cx, cy, coinDef.radius);
        coinG.lineStyle(2, 0x333333, 1);
        coinG.strokeCircle(cx, cy, coinDef.radius);
        this.coinDrawer.add(coinG);

        const coinLabel = this.add.text(cx, cy, `${coinDef.value}`, {
          fontFamily: 'Arial Black', fontSize: '12px', color: '#333333',
        }).setOrigin(0.5);
        this.coinDrawer.add(coinLabel);

        // Hit area
        const hit = this.add.circle(cx, cy, coinDef.radius + 5).setInteractive().setAlpha(0.001);
        this.coinDrawer.add(hit);

        hit.on('pointerup', () => {
          this.addCoinToChange(coinDef);
          // Bounce animation
          this.tweens.add({
            targets: coinG,
            scale: 1.3,
            duration: 100,
            yoyo: true,
          });
        });
      }
    });
  }

  private addCoinToChange(coinDef: CoinDef): void {
    this.changeGiven += coinDef.value;
    this.givenText.setText(`Your change: ${this.changeGiven}¢`);

    if (this.changeGiven === this.changeNeeded) {
      this.givenText.setColor('#2ecc71');
    } else if (this.changeGiven > this.changeNeeded) {
      this.givenText.setColor('#e74c3c');
    } else {
      this.givenText.setColor('#ffffff');
    }
  }

  private nextRound(): void {
    this.currentRound++;
    if (this.currentRound > ROUNDS) { this.gameOver(); return; }

    this.changeGiven = 0;
    this.givenText.setText('Your change: 0¢');
    this.givenText.setColor('#ffffff');

    const diff = this.difficulty.getDifficulty('market', 'subtraction-money');
    const maxNum = diff.numberRange[1];

    // Generate price and amount paid
    this.amountPaid = Phaser.Math.Between(Math.min(25, maxNum), Math.min(100, maxNum));
    // Make sure amountPaid is a "nice" number (multiple of 5 or 10)
    this.amountPaid = Math.ceil(this.amountPaid / 5) * 5;
    this.itemPrice = Phaser.Math.Between(
      Math.max(1, this.amountPaid - Math.min(50, maxNum)),
      this.amountPaid - 1
    );

    this.changeNeeded = this.amountPaid - this.itemPrice;

    this.priceText.setText(`Price: ${this.itemPrice}¢`);
    this.paidText.setText(`Paid: ${this.amountPaid}¢`);
    this.changeText.setText(`Change: ?¢`);
    this.roundText.setText(`${this.currentRound}/${ROUNDS}`);
  }

  private checkAnswer(): void {
    if (this.changeGiven === this.changeNeeded) {
      this.correctCount++;
      const earned = this.economy.recordCorrectAnswer(false, false);
      this.economy.addXP(10);
      this.difficulty.recordAnswer('subtraction-money', true);
      if (this.profile) this.hud.update(this.profile);

      this.changeText.setText(`Change: ${this.changeNeeded}¢`);
      this.showFeedback(`Perfect change! +${earned}`, '#2ecc71', () => {
        this.time.delayedCall(400, () => this.nextRound());
      });
      this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else {
      this.economy.recordWrongAnswer();
      this.difficulty.recordAnswer('subtraction-money', false);
      if (this.profile) this.hud.update(this.profile);

      const msg = this.changeGiven > this.changeNeeded
        ? `Too much! Need ${this.changeNeeded}¢`
        : `Not enough! Need ${this.changeNeeded}¢`;

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

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Market Closed!', {
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
