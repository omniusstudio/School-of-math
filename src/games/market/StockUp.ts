import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { DifficultyEngine } from '../../systems/DifficultyEngine';
import { HUD } from '../../ui/HUD';

const ROUNDS = 8;

interface ShelfItem {
  name: string;
  price: number;
  color: number;
  icon: string;
  selected: boolean;
  container: Phaser.GameObjects.Container;
}

export class StockUpScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private difficulty!: DifficultyEngine;
  private hud!: HUD;

  private budget: number = 0;
  private spent: number = 0;
  private currentRound: number = 0;
  private correctCount: number = 0;
  private items: ShelfItem[] = [];

  private budgetText!: Phaser.GameObjects.Text;
  private spentText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StockUpScene' });
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

    // Market shelves
    bg.fillStyle(0x8b6914, 1);
    bg.fillRect(50, 200, GAME_WIDTH - 100, 10);
    bg.fillRect(50, 380, GAME_WIDTH - 100, 10);

    // Shelf supports
    bg.fillStyle(0x6b4226, 1);
    bg.fillRect(50, 200, 10, 190);
    bg.fillRect(GAME_WIDTH - 60, 200, 10, 190);
    bg.fillRect(GAME_WIDTH / 2 - 5, 200, 10, 190);

    // Floor
    bg.fillStyle(0xd4a574, 1);
    bg.fillRect(0, GAME_HEIGHT - 120, GAME_WIDTH, 120);

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
    this.add.text(GAME_WIDTH / 2, 75, 'Spend exactly the budget!', {
      fontFamily: 'Arial Black', fontSize: '24px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.budgetText = this.add.text(GAME_WIDTH / 4, 130, 'Budget: 0¢', {
      fontFamily: 'Arial Black', fontSize: '24px',
      color: '#f1c40f', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.spentText = this.add.text(GAME_WIDTH / 2, 130, 'Spent: 0¢', {
      fontFamily: 'Arial Black', fontSize: '24px',
      color: '#2ecc71', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.targetText = this.add.text(GAME_WIDTH * 3 / 4, 130, 'Left: 0¢', {
      fontFamily: 'Arial Black', fontSize: '24px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.roundText = this.add.text(GAME_WIDTH - 80, 65, `1/${ROUNDS}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Done button
    const doneBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 55, 'btn_green').setInteractive();
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 57, 'Done Shopping!', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);
    doneBtn.on('pointerup', () => this.checkAnswer());

    this.feedbackText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);
  }

  private nextRound(): void {
    this.currentRound++;
    if (this.currentRound > ROUNDS) { this.gameOver(); return; }

    // Clean up old items
    this.items.forEach(item => item.container.destroy());
    this.items = [];
    this.spent = 0;

    const diff = this.difficulty.getDifficulty('market', 'addition-budget');
    const maxNum = diff.numberRange[1];

    // Generate items with prices
    const itemDefs = [
      { name: 'Apple', icon: '🍎', color: 0xe74c3c },
      { name: 'Bread', icon: '🍞', color: 0xd4a574 },
      { name: 'Milk', icon: '🥛', color: 0xffffff },
      { name: 'Cheese', icon: '🧀', color: 0xf1c40f },
      { name: 'Fish', icon: '🐟', color: 0x3498db },
      { name: 'Cake', icon: '🍰', color: 0xffb6c1 },
      { name: 'Juice', icon: '🧃', color: 0xe67e22 },
      { name: 'Corn', icon: '🌽', color: 0xf1c40f },
    ];

    const numItems = Phaser.Math.Between(5, 7);
    const shuffled = Phaser.Utils.Array.Shuffle([...itemDefs]).slice(0, numItems);
    const prices = shuffled.map(() => Phaser.Math.Between(2, Math.min(20, maxNum)));

    // Pick a subset that sums to the budget
    const pickCount = Phaser.Math.Between(2, Math.min(4, numItems));
    const pickedIndices: number[] = [];
    while (pickedIndices.length < pickCount) {
      const idx = Phaser.Math.Between(0, numItems - 1);
      if (!pickedIndices.includes(idx)) pickedIndices.push(idx);
    }
    this.budget = pickedIndices.reduce((sum, idx) => sum + prices[idx], 0);

    this.budgetText.setText(`Budget: ${this.budget}¢`);
    this.spentText.setText('Spent: 0¢');
    this.targetText.setText(`Left: ${this.budget}¢`);
    this.roundText.setText(`${this.currentRound}/${ROUNDS}`);

    // Place items on shelves
    shuffled.forEach((def, i) => {
      const row = i < 4 ? 0 : 1;
      const col = i < 4 ? i : i - 4;
      const x = 120 + col * 260;
      const y = row === 0 ? 230 : 400;

      const container = this.add.container(0, 0);

      // Item box
      const boxG = this.add.graphics();
      boxG.fillStyle(0x2c3e50, 1);
      boxG.fillRoundedRect(x, y, 200, 120, 8);
      boxG.lineStyle(2, 0x3498db, 1);
      boxG.strokeRoundedRect(x, y, 200, 120, 8);
      container.add(boxG);

      // Icon
      const icon = this.add.text(x + 35, y + 40, def.icon, { fontSize: '36px' }).setOrigin(0.5);
      container.add(icon);

      // Name & price
      const nameText = this.add.text(x + 70, y + 20, def.name, {
        fontFamily: 'Arial', fontSize: '16px', color: '#ffffff',
      });
      container.add(nameText);

      const priceLabel = this.add.text(x + 70, y + 45, `${prices[i]}¢`, {
        fontFamily: 'Arial Black', fontSize: '20px', color: '#f1c40f',
      });
      container.add(priceLabel);

      const item: ShelfItem = {
        name: def.name,
        price: prices[i],
        color: def.color,
        icon: def.icon,
        selected: false,
        container,
      };

      // Add to cart button
      const addBtn = this.add.text(x + 100, y + 90, '+ Add', {
        fontFamily: 'Arial', fontSize: '14px', color: '#2ecc71',
        backgroundColor: '#1a3a2a',
        padding: { x: 10, y: 4 },
      }).setOrigin(0.5).setInteractive();
      container.add(addBtn);

      const hitArea = this.add.rectangle(x + 100, y + 60, 200, 120).setInteractive().setAlpha(0.001);
      container.add(hitArea);

      hitArea.on('pointerup', () => {
        if (!item.selected) {
          item.selected = true;
          this.spent += item.price;
          addBtn.setText('✓ Added');
          addBtn.setColor('#ffffff');
          addBtn.setBackgroundColor('#27ae60');
          boxG.clear();
          boxG.fillStyle(0x1a3a2a, 1);
          boxG.fillRoundedRect(x, y, 200, 120, 8);
          boxG.lineStyle(2, 0x2ecc71, 1);
          boxG.strokeRoundedRect(x, y, 200, 120, 8);
        } else {
          item.selected = false;
          this.spent -= item.price;
          addBtn.setText('+ Add');
          addBtn.setColor('#2ecc71');
          addBtn.setBackgroundColor('#1a3a2a');
          boxG.clear();
          boxG.fillStyle(0x2c3e50, 1);
          boxG.fillRoundedRect(x, y, 200, 120, 8);
          boxG.lineStyle(2, 0x3498db, 1);
          boxG.strokeRoundedRect(x, y, 200, 120, 8);
        }

        this.spentText.setText(`Spent: ${this.spent}¢`);
        this.targetText.setText(`Left: ${this.budget - this.spent}¢`);

        if (this.spent === this.budget) {
          this.spentText.setColor('#2ecc71');
        } else if (this.spent > this.budget) {
          this.spentText.setColor('#e74c3c');
        } else {
          this.spentText.setColor('#f1c40f');
        }
      });

      this.items.push(item);
    });
  }

  private checkAnswer(): void {
    if (this.spent === this.budget) {
      this.correctCount++;
      const earned = this.economy.recordCorrectAnswer(false, false);
      this.economy.addXP(10);
      this.difficulty.recordAnswer('addition-budget', true);
      if (this.profile) this.hud.update(this.profile);

      this.showFeedback(`Exact budget! +${earned}`, '#2ecc71', () => {
        this.time.delayedCall(400, () => this.nextRound());
      });
      this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else {
      this.economy.recordWrongAnswer();
      this.difficulty.recordAnswer('addition-budget', false);
      if (this.profile) this.hud.update(this.profile);

      const diff = this.spent - this.budget;
      const msg = diff > 0
        ? `Over budget by ${diff}¢!`
        : `Under budget by ${-diff}¢!`;

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

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Shopping Complete!', {
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
