import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { HUD } from '../../ui/HUD';

const CRATE_CAPACITY = 10;
const GAME_DURATION = 60; // seconds
const APPLE_SIZE = 32;

interface Apple {
  sprite: Phaser.GameObjects.Image;
  inCrate: boolean;
}

export class CrateStackerScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private hud!: HUD;

  private apples: Apple[] = [];
  private crateCount: number = 0;
  private currentCrateApples: number = 0;
  private cratesFilled: number = 0;
  private timeLeft: number = GAME_DURATION;
  private timerText!: Phaser.GameObjects.Text;
  private crateCountText!: Phaser.GameObjects.Text;
  private crateAppleCountText!: Phaser.GameObjects.Text;
  private crateSlots: Phaser.GameObjects.Graphics[] = [];
  private crateFilledDots: Phaser.GameObjects.Graphics[] = [];
  private gameActive: boolean = false;
  private streak: number = 0;
  private totalCorrect: number = 0;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'CrateStackerScene' });
  }

  create(): void {
    const profile = SaveManager.getActiveProfile();
    if (!profile) {
      this.scene.start('ProfileScene');
      return;
    }
    this.profile = profile;
    this.economy = new EconomyManager(profile);

    this.cameras.main.fadeIn(300);

    // Reset state
    this.apples = [];
    this.crateCount = 0;
    this.currentCrateApples = 0;
    this.cratesFilled = 0;
    this.timeLeft = GAME_DURATION;
    this.streak = 0;
    this.totalCorrect = 0;
    this.crateSlots = [];
    this.crateFilledDots = [];

    this.drawBackground();
    this.drawCrate();
    this.drawUI();

    // HUD
    this.hud = new HUD(this);
    this.hud.update(profile);

    // Start the game after a short delay
    this.showMessage('Fill crates with 10 apples each!', () => {
      this.gameActive = true;
      this.spawnAppleCluster();
      this.startTimer();
    });
  }

  private drawBackground(): void {
    // Farm background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xaed8f0, 0xaed8f0, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Ground
    bg.fillStyle(0x7ec850, 1);
    bg.fillRect(0, GAME_HEIGHT - 200, GAME_WIDTH, 200);
    bg.fillStyle(0x6bb840, 1);
    bg.fillRect(0, GAME_HEIGHT - 200, GAME_WIDTH, 5);

    // Trees (simple)
    this.drawTree(100, GAME_HEIGHT - 250);
    this.drawTree(350, GAME_HEIGHT - 270);
    this.drawTree(1100, GAME_HEIGHT - 260);

    // Barn silhouette
    bg.fillStyle(0xc0392b, 0.3);
    bg.fillRect(GAME_WIDTH - 200, GAME_HEIGHT - 350, 150, 150);
    bg.fillTriangle(GAME_WIDTH - 210, GAME_HEIGHT - 350, GAME_WIDTH - 125, GAME_HEIGHT - 420, GAME_WIDTH - 40, GAME_HEIGHT - 350);

    // Flora NPC
    const flora = this.add.image(GAME_WIDTH - 100, GAME_HEIGHT - 230, 'npc_flora');
    flora.setScale(2);
    this.tweens.add({
      targets: flora,
      y: flora.y - 3,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private drawTree(x: number, y: number): void {
    const tree = this.add.graphics();
    // Trunk
    tree.fillStyle(0x8b6914, 1);
    tree.fillRect(x - 8, y, 16, 50);
    // Leaves
    tree.fillStyle(0x27ae60, 1);
    tree.fillCircle(x, y - 10, 35);
    tree.fillCircle(x - 20, y + 5, 25);
    tree.fillCircle(x + 20, y + 5, 25);
    // Apples on tree
    tree.fillStyle(0xe74c3c, 1);
    tree.fillCircle(x - 15, y - 5, 5);
    tree.fillCircle(x + 10, y - 15, 5);
    tree.fillCircle(x + 20, y, 5);
  }

  private drawCrate(): void {
    const crateX = GAME_WIDTH / 2 - 120;
    const crateY = GAME_HEIGHT - 180;

    // Crate background
    const crateBg = this.add.graphics();
    crateBg.fillStyle(0xcd853f, 1);
    crateBg.fillRect(crateX, crateY, 240, 100);
    crateBg.lineStyle(3, 0x8b6914, 1);
    crateBg.strokeRect(crateX, crateY, 240, 100);

    // Label
    this.add.text(crateX + 120, crateY - 15, 'CRATE (fill to 10)', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#8b6914',
    }).setOrigin(0.5);

    // Slots inside crate (2 rows of 5)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        const slotX = crateX + 24 + col * 44;
        const slotY = crateY + 15 + row * 44;

        const slot = this.add.graphics();
        slot.fillStyle(0xb8860b, 0.3);
        slot.fillRoundedRect(slotX, slotY, 36, 36, 4);
        slot.lineStyle(1, 0x8b6914, 0.5);
        slot.strokeRoundedRect(slotX, slotY, 36, 36, 4);
        this.crateSlots.push(slot);

        // Filled indicator (hidden initially)
        const dot = this.add.graphics();
        dot.fillStyle(0xe74c3c, 1);
        dot.fillCircle(slotX + 18, slotY + 18, 14);
        dot.lineStyle(2, 0xc0392b, 1);
        dot.strokeCircle(slotX + 18, slotY + 18, 14);
        dot.setVisible(false);
        this.crateFilledDots.push(dot);
      }
    }

    // Drop zone (the crate area)
    const dropZone = this.add.rectangle(crateX + 120, crateY + 50, 240, 100);
    dropZone.setInteractive({ dropZone: true });
  }

  private drawUI(): void {
    // Timer
    this.timerText = this.add.text(GAME_WIDTH - 80, 70, `${this.timeLeft}s`, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Crates filled counter
    this.add.text(GAME_WIDTH / 2, 70, 'Crates Filled:', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.crateCountText = this.add.text(GAME_WIDTH / 2, 100, '0', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '48px',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Current crate apple count
    this.crateAppleCountText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, '0 / 10', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Message text (reusable)
    this.messageText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);

    // Back button
    const backBtn = this.add.text(60, 65, '< Back', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive();

    backBtn.on('pointerup', () => {
      this.gameActive = false;
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => {
        this.scene.start('VillageScene');
      });
    });
  }

  private spawnAppleCluster(): void {
    if (!this.gameActive) return;

    // Spawn 2-5 apples at random positions in the upper area
    const count = Phaser.Math.Between(2, 5);
    const baseX = Phaser.Math.Between(150, GAME_WIDTH - 150);
    const baseY = Phaser.Math.Between(150, GAME_HEIGHT - 350);

    for (let i = 0; i < count; i++) {
      const x = baseX + Phaser.Math.Between(-80, 80);
      const y = baseY + Phaser.Math.Between(-40, 40);

      const appleSprite = this.add.image(x, y, 'apple').setScale(1.2);
      appleSprite.setInteractive({ draggable: true });

      const apple: Apple = { sprite: appleSprite, inCrate: false };
      this.apples.push(apple);

      // Drop animation
      appleSprite.setAlpha(0);
      appleSprite.y -= 30;
      this.tweens.add({
        targets: appleSprite,
        y: y,
        alpha: 1,
        duration: 300,
        delay: i * 100,
        ease: 'Bounce.easeOut',
      });

      // Drag events
      this.input.setDraggable(appleSprite);
    }

    // Set up drag handling
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.setScale(1.4);
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      gameObject.setScale(1.2);
      this.handleAppleDrop(gameObject);
    });
  }

  private handleAppleDrop(appleSprite: Phaser.GameObjects.Image): void {
    const crateX = GAME_WIDTH / 2 - 120;
    const crateY = GAME_HEIGHT - 180;

    // Check if dropped on crate
    if (
      appleSprite.x > crateX && appleSprite.x < crateX + 240 &&
      appleSprite.y > crateY - 30 && appleSprite.y < crateY + 130
    ) {
      if (this.currentCrateApples < CRATE_CAPACITY) {
        // Apple goes into crate
        this.currentCrateApples++;
        this.crateAppleCountText.setText(`${this.currentCrateApples} / ${CRATE_CAPACITY}`);

        // Show filled dot
        if (this.crateFilledDots[this.currentCrateApples - 1]) {
          this.crateFilledDots[this.currentCrateApples - 1].setVisible(true);
        }

        // Snap apple to crate slot position
        const slotIndex = this.currentCrateApples - 1;
        const row = Math.floor(slotIndex / 5);
        const col = slotIndex % 5;
        const targetX = crateX + 42 + col * 44;
        const targetY = crateY + 33 + row * 44;

        this.tweens.add({
          targets: appleSprite,
          x: targetX,
          y: targetY,
          scale: 0.8,
          duration: 200,
          ease: 'Back.easeOut',
        });

        appleSprite.disableInteractive();

        // Check if crate is full
        if (this.currentCrateApples === CRATE_CAPACITY) {
          this.crateFilled();
        }

        // Check if we need more apples
        const remainingApples = this.apples.filter(a =>
          a.sprite.active && !a.inCrate && a.sprite.input?.enabled
        );
        if (remainingApples.length === 0) {
          this.time.delayedCall(500, () => {
            if (this.gameActive) this.spawnAppleCluster();
          });
        }
      }
    }
  }

  private crateFilled(): void {
    this.cratesFilled++;
    this.crateCountText.setText(`${this.cratesFilled}`);
    this.totalCorrect++;

    // Record the "correct answer" — filling a crate to exactly 10
    const earned = this.economy.recordCorrectAnswer(false, false);
    this.economy.addXP(10);
    if (this.profile) this.hud.update(this.profile);

    // Celebration animation
    this.showMessage(`Crate #${this.cratesFilled} filled! +${earned} coins`);
    this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT - 130);

    // Bounce the counter
    this.tweens.add({
      targets: this.crateCountText,
      scale: 1.5,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Reset crate after a delay
    this.time.delayedCall(800, () => {
      this.resetCrate();
      if (this.gameActive) this.spawnAppleCluster();
    });
  }

  private resetCrate(): void {
    this.currentCrateApples = 0;
    this.crateAppleCountText.setText('0 / 10');

    // Hide all dots
    this.crateFilledDots.forEach(dot => dot.setVisible(false));

    // Remove old apple sprites in the crate area
    this.apples.forEach(apple => {
      if (apple.sprite && apple.sprite.active) {
        apple.sprite.destroy();
      }
    });
    this.apples = [];
  }

  private startTimer(): void {
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.gameActive) return;
        this.timeLeft--;
        this.timerText.setText(`${this.timeLeft}s`);

        if (this.timeLeft <= 10) {
          this.timerText.setColor('#e74c3c');
        }

        if (this.timeLeft <= 0) {
          this.gameOver();
        }
      },
      repeat: GAME_DURATION - 1,
    });
  }

  private gameOver(): void {
    this.gameActive = false;

    // Completion bonus
    const completionBonus = this.economy.completeMiniGame();
    if (this.profile) {
      this.hud.update(this.profile);
      SaveManager.saveProfile(this.profile);
    }

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setDepth(800);

    // Results box
    const box = this.add.graphics();
    box.fillStyle(0x2c3e50, 1);
    box.fillRoundedRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 150, 400, 300, 16);
    box.lineStyle(3, 0xf1c40f, 1);
    box.strokeRoundedRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 150, 400, 300, 16);
    box.setDepth(801);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 110, "Time's Up!", {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '36px',
      color: '#f1c40f',
    }).setOrigin(0.5).setDepth(802);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, `Crates Filled: ${this.cratesFilled}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(802);

    // Stars
    let stars = 0;
    if (this.cratesFilled >= 1) stars = 1;
    if (this.cratesFilled >= 3) stars = 2;
    if (this.cratesFilled >= 5) stars = 3;

    const starY = GAME_HEIGHT / 2;
    for (let i = 0; i < 3; i++) {
      const star = this.add.image(GAME_WIDTH / 2 - 50 + i * 50, starY, 'star');
      star.setScale(i < stars ? 1.5 : 1.5);
      star.setAlpha(i < stars ? 1 : 0.2);
      star.setDepth(802);

      if (i < stars) {
        this.tweens.add({
          targets: star,
          scale: 2,
          duration: 300,
          delay: i * 200,
          yoyo: true,
          ease: 'Back.easeOut',
        });
      }
    }

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, `+${completionBonus} completion bonus`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#2ecc71',
    }).setOrigin(0.5).setDepth(802);

    // Continue button
    const contBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'btn_green').setInteractive();
    contBtn.setDepth(802);
    const contText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 98, 'Back to Village', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(802);

    contBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('VillageScene');
      });
    });

    // Play again button
    const replayBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140, 'btn_blue').setInteractive();
    replayBtn.setScale(0.8);
    replayBtn.setDepth(802);
    const replayText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 138, 'Play Again', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(802);

    replayBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => {
        this.scene.restart();
      });
    });
  }

  private showMessage(text: string, onComplete?: () => void): void {
    this.messageText.setText(text);
    this.messageText.setAlpha(1);
    this.messageText.setScale(0.5);

    this.tweens.add({
      targets: this.messageText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: this.messageText,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              if (onComplete) onComplete();
            },
          });
        });
      },
    });
  }
}
