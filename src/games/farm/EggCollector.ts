import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { DifficultyEngine } from '../../systems/DifficultyEngine';
import { HUD } from '../../ui/HUD';

const BASKET_SIZES = [2, 5, 10];
const ROUNDS = 8;

export class EggCollectorScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private difficulty!: DifficultyEngine;
  private hud!: HUD;

  private targetNumber: number = 0;
  private collectedEggs: number = 0;
  private currentRound: number = 0;
  private correctCount: number = 0;
  private basketSize: number = 2;
  private eggSprites: Phaser.GameObjects.Image[] = [];
  private baskets: Phaser.GameObjects.Container[] = [];
  private targetText!: Phaser.GameObjects.Text;
  private collectedText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'EggCollectorScene' });
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
    bg.fillStyle(0x7ec850, 1);
    bg.fillRect(0, GAME_HEIGHT - 180, GAME_WIDTH, 180);

    // Chicken coop
    bg.fillStyle(0xcd853f, 1);
    bg.fillRect(50, GAME_HEIGHT - 320, 180, 140);
    bg.fillStyle(0x8b0000, 1);
    bg.fillTriangle(50, GAME_HEIGHT - 320, 140, GAME_HEIGHT - 380, 230, GAME_HEIGHT - 320);

    // Fence
    bg.lineStyle(3, 0x8b6914, 1);
    for (let x = 0; x < GAME_WIDTH; x += 60) {
      bg.fillStyle(0xcd853f, 1);
      bg.fillRect(x, GAME_HEIGHT - 200, 8, 30);
      bg.lineBetween(0, GAME_HEIGHT - 190, GAME_WIDTH, GAME_HEIGHT - 190);
    }

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
    // Target display
    this.add.text(GAME_WIDTH / 2, 70, 'Collect this many eggs:', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.targetText = this.add.text(GAME_WIDTH / 2, 110, '0', {
      fontFamily: 'Arial Black', fontSize: '56px',
      color: '#f1c40f', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Collected counter
    this.collectedText = this.add.text(GAME_WIDTH / 2, 160, 'Collected: 0', {
      fontFamily: 'Arial, sans-serif', fontSize: '22px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Round counter
    this.roundText = this.add.text(GAME_WIDTH - 80, 65, `1/${ROUNDS}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Feedback
    this.feedbackText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);
  }

  private nextRound(): void {
    this.currentRound++;
    if (this.currentRound > ROUNDS) {
      this.gameOver();
      return;
    }

    // Clear previous
    this.eggSprites.forEach(s => s.destroy());
    this.eggSprites = [];
    this.baskets.forEach(b => b.destroy());
    this.baskets = [];
    this.collectedEggs = 0;

    // Get difficulty
    const diff = this.difficulty.getDifficulty('farm', 'counting-groups');
    const maxNum = diff.numberRange[1];

    // Pick basket size based on difficulty
    if (maxNum <= 10) this.basketSize = 2;
    else if (maxNum <= 20) this.basketSize = Phaser.Math.RND.pick([2, 5]);
    else this.basketSize = Phaser.Math.RND.pick(BASKET_SIZES);

    // Generate target that's a multiple of basket size
    const maxBaskets = Math.floor(maxNum / this.basketSize);
    const numBaskets = Phaser.Math.Between(2, Math.max(2, Math.min(maxBaskets, 8)));
    this.targetNumber = numBaskets * this.basketSize;

    this.targetText.setText(`${this.targetNumber}`);
    this.collectedText.setText('Collected: 0');
    this.roundText.setText(`${this.currentRound}/${ROUNDS}`);

    // Scatter eggs on screen
    const totalEggs = this.targetNumber + Phaser.Math.Between(2, 6) * this.basketSize; // extras
    this.spawnEggs(totalEggs);
    this.drawBasketArea();
  }

  private spawnEggs(count: number): void {
    const areaX = 300;
    const areaY = 200;
    const areaW = GAME_WIDTH - 400;
    const areaH = GAME_HEIGHT - 450;

    for (let i = 0; i < count; i++) {
      const x = areaX + Math.random() * areaW;
      const y = areaY + Math.random() * areaH;

      // Create egg graphic
      const egg = this.add.graphics();
      egg.fillStyle(0xfff8dc, 1);
      egg.fillEllipse(0, 0, 20, 26);
      egg.lineStyle(2, 0xdaa520, 1);
      egg.strokeEllipse(0, 0, 20, 26);
      egg.generateTexture(`egg_${i}_${this.currentRound}`, 24, 30);
      egg.destroy();

      const eggSprite = this.add.image(x, y, `egg_${i}_${this.currentRound}`);
      eggSprite.setInteractive({ draggable: true });
      this.input.setDraggable(eggSprite);
      this.eggSprites.push(eggSprite);

      // Spawn animation
      eggSprite.setScale(0);
      this.tweens.add({
        targets: eggSprite,
        scale: 1,
        duration: 200,
        delay: i * 30,
        ease: 'Back.easeOut',
      });
    }

    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      obj.x = dragX;
      obj.y = dragY;
    });

    this.input.on('dragend', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image) => {
      this.handleEggDrop(obj);
    });
  }

  private drawBasketArea(): void {
    const basketY = GAME_HEIGHT - 140;

    // Basket label
    this.add.text(GAME_WIDTH / 2, basketY - 30, `Baskets hold ${this.basketSize} eggs each`, {
      fontFamily: 'Arial, sans-serif', fontSize: '16px',
      color: '#8b6914', stroke: '#ffffff', strokeThickness: 2,
    }).setOrigin(0.5);

    // Draw basket zone
    const zone = this.add.graphics();
    zone.fillStyle(0xcd853f, 0.3);
    zone.fillRoundedRect(100, basketY - 10, GAME_WIDTH - 200, 70, 10);
    zone.lineStyle(2, 0x8b6914, 0.5);
    zone.strokeRoundedRect(100, basketY - 10, GAME_WIDTH - 200, 70, 10);
  }

  private handleEggDrop(eggSprite: Phaser.GameObjects.Image): void {
    const basketY = GAME_HEIGHT - 140;

    if (eggSprite.y > basketY - 40) {
      // Egg dropped in basket area
      this.collectedEggs++;
      this.collectedText.setText(`Collected: ${this.collectedEggs}`);

      // Shrink egg into basket
      this.tweens.add({
        targets: eggSprite,
        scale: 0,
        alpha: 0,
        duration: 200,
        onComplete: () => eggSprite.disableInteractive(),
      });

      // Check if basket is full (group complete)
      if (this.collectedEggs % this.basketSize === 0) {
        // Show basket fill feedback
        this.showFeedback(`Basket ${this.collectedEggs / this.basketSize}!`, '#2ecc71');
      }

      // Check if target reached
      if (this.collectedEggs === this.targetNumber) {
        this.roundSuccess();
      } else if (this.collectedEggs > this.targetNumber) {
        this.roundFail();
      }
    }
  }

  private roundSuccess(): void {
    this.correctCount++;
    const earned = this.economy.recordCorrectAnswer(false, false);
    this.economy.addXP(8);
    this.difficulty.recordAnswer('counting-groups', true);
    if (this.profile) this.hud.update(this.profile);

    this.showFeedback(`Perfect! +${earned} coins`, '#2ecc71', () => {
      this.time.delayedCall(500, () => this.nextRound());
    });
    this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }

  private roundFail(): void {
    this.economy.recordWrongAnswer();
    this.difficulty.recordAnswer('counting-groups', false);
    if (this.profile) this.hud.update(this.profile);

    this.showFeedback(`Too many! Target was ${this.targetNumber}`, '#e74c3c', () => {
      this.time.delayedCall(500, () => this.nextRound());
    });
  }

  private showFeedback(text: string, color: string, onDone?: () => void): void {
    this.feedbackText.setText(text);
    this.feedbackText.setColor(color);
    this.feedbackText.setAlpha(1).setScale(0.5);

    this.tweens.add({
      targets: this.feedbackText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: this.feedbackText,
            alpha: 0, duration: 200,
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
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT).setDepth(800);

    const box = this.add.graphics();
    box.fillStyle(0x2c3e50, 1);
    box.fillRoundedRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 140, 400, 280, 16);
    box.lineStyle(3, 0xf1c40f, 1);
    box.strokeRoundedRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 140, 400, 280, 16);
    box.setDepth(801);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Egg Collector Complete!', {
      fontFamily: 'Arial Black', fontSize: '24px', color: '#f1c40f',
    }).setOrigin(0.5).setDepth(802);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, `${this.correctCount} / ${ROUNDS} correct`, {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(802);

    // Stars
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

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45, `+${bonus} completion bonus`, {
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
