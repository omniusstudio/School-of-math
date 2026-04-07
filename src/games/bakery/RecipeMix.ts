import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { DifficultyEngine } from '../../systems/DifficultyEngine';
import { HUD } from '../../ui/HUD';

const ROUNDS = 8;

interface Ingredient {
  name: string;
  icon: string;
  amount: number;
  color: number;
}

export class RecipeMixScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private difficulty!: DifficultyEngine;
  private hud!: HUD;

  private targetAmount: number = 0;
  private currentAmount: number = 0;
  private ingredients: Ingredient[] = [];
  private currentRound: number = 0;
  private correctCount: number = 0;

  private targetText!: Phaser.GameObjects.Text;
  private bowlText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private bowlFill!: Phaser.GameObjects.Graphics;
  private ingredientContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'RecipeMixScene' });
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
    this.drawBowl();
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
    bg.fillRect(0, GAME_HEIGHT - 130, GAME_WIDTH, 130);
    bg.fillStyle(0x8b6914, 1);
    bg.fillRect(0, GAME_HEIGHT - 130, GAME_WIDTH, 5);

    const backBtn = this.add.text(60, 65, '< Back', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#8b4513', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive();
    backBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('DistrictScene', { districtId: 'bakery' }));
    });
  }

  private drawBowl(): void {
    const bowlX = GAME_WIDTH / 2;
    const bowlY = GAME_HEIGHT - 250;

    // Bowl
    const bowl = this.add.graphics();
    bowl.fillStyle(0xecf0f1, 1);
    bowl.fillEllipse(bowlX, bowlY + 20, 200, 80);
    bowl.fillStyle(0xbdc3c7, 1);
    bowl.fillEllipse(bowlX, bowlY, 200, 60);
    bowl.fillStyle(0xecf0f1, 1);
    bowl.fillEllipse(bowlX, bowlY - 5, 170, 45);

    // Bowl fill level indicator
    this.bowlFill = this.add.graphics();
  }

  private drawUI(): void {
    this.add.text(GAME_WIDTH / 2, 75, 'Mix the Recipe!', {
      fontFamily: 'Arial Black', fontSize: '28px',
      color: '#8b4513', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.targetText = this.add.text(GAME_WIDTH / 2, 120, 'Need: 0 scoops total', {
      fontFamily: 'Arial Black', fontSize: '22px',
      color: '#d35400', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.bowlText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 320, 'In bowl: 0', {
      fontFamily: 'Arial Black', fontSize: '26px',
      color: '#2c3e50', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    this.roundText = this.add.text(GAME_WIDTH - 80, 65, `1/${ROUNDS}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#8b4513', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    // Mix button
    const mixBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 65, 'btn_orange').setInteractive();
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 67, 'Mix!', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);
    mixBtn.on('pointerup', () => this.checkAnswer());

    this.feedbackText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);
  }

  private nextRound(): void {
    this.currentRound++;
    if (this.currentRound > ROUNDS) { this.gameOver(); return; }

    if (this.ingredientContainer) this.ingredientContainer.destroy();
    this.currentAmount = 0;
    this.ingredients = [];

    const diff = this.difficulty.getDifficulty('bakery', 'addition-measurement');
    const maxNum = diff.numberRange[1];

    // Define ingredients
    const ingredientDefs = [
      { name: 'Flour', icon: '🌾', color: 0xfff8dc },
      { name: 'Sugar', icon: '🍬', color: 0xffffff },
      { name: 'Butter', icon: '🧈', color: 0xf1c40f },
      { name: 'Eggs', icon: '🥚', color: 0xfff5e6 },
      { name: 'Milk', icon: '🥛', color: 0xfafafa },
      { name: 'Cocoa', icon: '🍫', color: 0x8b4513 },
    ];

    // Generate 3-4 ingredients with amounts
    const numIngredients = Phaser.Math.Between(3, 4);
    const shuffled = Phaser.Utils.Array.Shuffle([...ingredientDefs]).slice(0, numIngredients);
    let total = 0;

    shuffled.forEach(def => {
      const amount = Phaser.Math.Between(1, Math.min(10, maxNum));
      this.ingredients.push({ ...def, amount });
      total += amount;
    });

    this.targetAmount = total;
    this.targetText.setText(`Need: ${this.targetAmount} scoops total`);
    this.bowlText.setText('In bowl: 0');
    this.roundText.setText(`${this.currentRound}/${ROUNDS}`);

    this.updateBowlFill();
    this.drawIngredients();
  }

  private drawIngredients(): void {
    this.ingredientContainer = this.add.container(0, 0);

    const startX = 80;
    const cardW = 160;
    const gap = 20;

    this.ingredients.forEach((ingredient, i) => {
      const x = startX + i * (cardW + gap);
      const y = 170;

      // Card
      const card = this.add.graphics();
      card.fillStyle(0x2c3e50, 1);
      card.fillRoundedRect(x, y, cardW, 180, 10);
      card.lineStyle(2, 0x3498db, 1);
      card.strokeRoundedRect(x, y, cardW, 180, 10);
      this.ingredientContainer.add(card);

      // Icon
      const icon = this.add.text(x + cardW / 2, y + 30, ingredient.icon, { fontSize: '36px' }).setOrigin(0.5);
      this.ingredientContainer.add(icon);

      // Name
      const name = this.add.text(x + cardW / 2, y + 65, ingredient.name, {
        fontFamily: 'Arial', fontSize: '16px', color: '#ecf0f1',
      }).setOrigin(0.5);
      this.ingredientContainer.add(name);

      // Required amount
      const reqText = this.add.text(x + cardW / 2, y + 90, `Need: ${ingredient.amount}`, {
        fontFamily: 'Arial Black', fontSize: '18px', color: '#f1c40f',
      }).setOrigin(0.5);
      this.ingredientContainer.add(reqText);

      // Add scoop button (+)
      const addedText = this.add.text(x + cardW / 2, y + 120, 'Added: 0', {
        fontFamily: 'Arial', fontSize: '14px', color: '#bdc3c7',
      }).setOrigin(0.5);
      this.ingredientContainer.add(addedText);

      let added = 0;

      const addBtn = this.add.text(x + cardW / 2, y + 155, '+ Scoop', {
        fontFamily: 'Arial Black', fontSize: '16px', color: '#ffffff',
        backgroundColor: '#27ae60',
        padding: { x: 15, y: 5 },
      }).setOrigin(0.5).setInteractive();
      this.ingredientContainer.add(addBtn);

      addBtn.on('pointerup', () => {
        added++;
        this.currentAmount++;
        addedText.setText(`Added: ${added}`);
        this.bowlText.setText(`In bowl: ${this.currentAmount}`);
        this.updateBowlFill();

        // Color feedback
        if (added === ingredient.amount) {
          addedText.setColor('#2ecc71');
        } else if (added > ingredient.amount) {
          addedText.setColor('#e74c3c');
        }

        // Animate
        this.tweens.add({
          targets: icon,
          y: icon.y + 5, scale: 1.2,
          duration: 100, yoyo: true,
        });
      });
    });
  }

  private updateBowlFill(): void {
    const bowlX = GAME_WIDTH / 2;
    const bowlY = GAME_HEIGHT - 250;
    const fillRatio = Math.min(this.currentAmount / Math.max(this.targetAmount, 1), 1.5);

    this.bowlFill.clear();
    if (this.currentAmount > 0) {
      const fillColor = this.currentAmount === this.targetAmount ? 0x2ecc71
        : this.currentAmount > this.targetAmount ? 0xe74c3c : 0xf5deb3;
      this.bowlFill.fillStyle(fillColor, 0.8);
      this.bowlFill.fillEllipse(bowlX, bowlY - 5 + (1 - fillRatio) * 20, 160, 35 * fillRatio);
    }
  }

  private checkAnswer(): void {
    if (this.currentAmount === this.targetAmount) {
      this.correctCount++;
      const earned = this.economy.recordCorrectAnswer(false, false);
      this.economy.addXP(10);
      this.difficulty.recordAnswer('addition-measurement', true);
      if (this.profile) this.hud.update(this.profile);

      this.showFeedback(`Perfect mix! +${earned}`, '#2ecc71', () => {
        this.time.delayedCall(400, () => this.nextRound());
      });
      this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else {
      this.economy.recordWrongAnswer();
      this.difficulty.recordAnswer('addition-measurement', false);
      if (this.profile) this.hud.update(this.profile);

      // Flour explosion effect on wrong answer
      for (let i = 0; i < 15; i++) {
        const puff = this.add.graphics();
        puff.fillStyle(0xfff8dc, 0.8);
        puff.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT - 250, Phaser.Math.Between(5, 15));
        this.tweens.add({
          targets: puff,
          x: Phaser.Math.Between(-200, 200),
          y: Phaser.Math.Between(-200, -50),
          alpha: 0,
          duration: 800,
          delay: i * 30,
          onComplete: () => puff.destroy(),
        });
      }

      const msg = this.currentAmount > this.targetAmount
        ? `Too much! Need exactly ${this.targetAmount}`
        : `Not enough! Need ${this.targetAmount}`;

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

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Baking Done!', {
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
