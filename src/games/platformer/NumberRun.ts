import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { HUD } from '../../ui/HUD';

const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 30;
const PLAYER_SIZE = 40;
const AUTO_SPEED = 3;
const JUMP_VELOCITY = -450;
const GRAVITY = 800;

interface NumberPlatform {
  sprite: Phaser.GameObjects.Container;
  body: Phaser.Physics.Arcade.Body;
  value: number;
  collected: boolean;
}

export class NumberRunScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private hud!: HUD;

  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private platforms: NumberPlatform[] = [];
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private platformGroup!: Phaser.Physics.Arcade.Group;

  private targetNumber: number = 0;
  private collectedTotal: number = 0;
  private gameActive: boolean = false;
  private levelComplete: boolean = false;
  private currentLevel: number = 0;
  private totalLevels: number = 5;
  private levelsWon: number = 0;

  private targetText!: Phaser.GameObjects.Text;
  private collectedText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private scrollX: number = 0;

  constructor() {
    super({ key: 'NumberRunScene' });
  }

  create(): void {
    const profile = SaveManager.getActiveProfile();
    if (!profile) { this.scene.start('ProfileScene'); return; }
    this.profile = profile;
    this.economy = new EconomyManager(profile);

    this.cameras.main.fadeIn(300);
    this.currentLevel = 0;
    this.levelsWon = 0;

    // Enable physics gravity
    this.physics.world.gravity.y = GRAVITY;

    this.nextLevel();
  }

  private setupLevel(): void {
    // Clear everything
    this.children.removeAll();
    this.physics.world.gravity.y = GRAVITY;

    this.scrollX = 0;
    this.collectedTotal = 0;
    this.gameActive = false;
    this.levelComplete = false;
    this.platforms = [];

    // Sky
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH * 4, GAME_HEIGHT);
    bg.setScrollFactor(0.2);

    // Stars in background
    const starBg = this.add.graphics();
    starBg.fillStyle(0xffffff, 0.5);
    for (let i = 0; i < 60; i++) {
      starBg.fillCircle(Math.random() * GAME_WIDTH * 2, Math.random() * GAME_HEIGHT * 0.6, Math.random() * 2 + 1);
    }
    starBg.setScrollFactor(0.3);

    // Ground
    this.groundGroup = this.physics.add.staticGroup();
    for (let x = 0; x < GAME_WIDTH * 3; x += 100) {
      const ground = this.add.graphics();
      ground.fillStyle(0x2ecc71, 1);
      ground.fillRect(0, 0, 100, 40);
      ground.lineStyle(2, 0x27ae60, 1);
      ground.lineBetween(0, 0, 100, 0);
      ground.generateTexture(`ground_${x}_${this.currentLevel}`, 100, 40);
      ground.destroy();

      const gSprite = this.groundGroup.create(x + 50, GAME_HEIGHT - 20, `ground_${x}_${this.currentLevel}`);
      gSprite.setScale(1).refreshBody();
    }

    // Generate target number
    const maxTarget = 10 + this.currentLevel * 5;
    this.targetNumber = Phaser.Math.Between(8, maxTarget);

    // Generate numbered platforms
    this.platformGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    const numPlatforms = Phaser.Math.Between(8, 12);
    const platformValues: number[] = [];

    // Ensure some platforms sum to target
    let remaining = this.targetNumber;
    const correctPlatforms: number[] = [];
    while (remaining > 0) {
      const val = Math.min(remaining, Phaser.Math.Between(1, Math.min(5, remaining)));
      correctPlatforms.push(val);
      remaining -= val;
    }

    // Add correct platforms and some distractors
    platformValues.push(...correctPlatforms);
    while (platformValues.length < numPlatforms) {
      platformValues.push(Phaser.Math.Between(1, 8));
    }

    // Shuffle and place
    Phaser.Utils.Array.Shuffle(platformValues);

    platformValues.forEach((value, i) => {
      const x = 300 + i * 200 + Phaser.Math.Between(-30, 30);
      const y = GAME_HEIGHT - 100 - Phaser.Math.Between(60, 250);

      const container = this.add.container(x, y);

      // Platform graphic
      const platG = this.add.graphics();
      platG.fillStyle(0x3498db, 1);
      platG.fillRoundedRect(-PLATFORM_WIDTH / 2, -PLATFORM_HEIGHT / 2, PLATFORM_WIDTH, PLATFORM_HEIGHT, 6);
      platG.lineStyle(2, 0x2980b9, 1);
      platG.strokeRoundedRect(-PLATFORM_WIDTH / 2, -PLATFORM_HEIGHT / 2, PLATFORM_WIDTH, PLATFORM_HEIGHT, 6);
      container.add(platG);

      // Number on platform
      const numText = this.add.text(0, -2, `${value}`, {
        fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
      }).setOrigin(0.5);
      container.add(numText);

      // Physics body
      const platSprite = this.add.rectangle(x, y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
      this.physics.add.existing(platSprite, true);
      this.platformGroup.add(platSprite);

      this.platforms.push({
        sprite: container,
        body: platSprite.body as Phaser.Physics.Arcade.Body,
        value,
        collected: false,
      });
    });

    // Finish gate
    const finishX = 300 + numPlatforms * 200 + 150;
    const finish = this.add.graphics();
    finish.fillStyle(0xf1c40f, 1);
    finish.fillRect(finishX - 20, GAME_HEIGHT - 140, 40, 100);
    finish.fillStyle(0x000000, 0.5);
    finish.fillRect(finishX - 18, GAME_HEIGHT - 138, 36, 10);
    finish.fillRect(finishX - 18, GAME_HEIGHT - 118, 36, 10);

    this.add.text(finishX, GAME_HEIGHT - 160, '🏁', { fontSize: '32px' }).setOrigin(0.5);

    const finishZone = this.add.rectangle(finishX, GAME_HEIGHT - 80, 60, 120);
    this.physics.add.existing(finishZone, true);

    // Player
    const playerG = this.add.graphics();
    playerG.fillStyle(0xff8c00, 1);
    playerG.fillCircle(0, -10, 16);
    playerG.fillStyle(0xff8c00, 1);
    playerG.fillRect(-12, 4, 24, 20);
    playerG.fillStyle(0xffffff, 1);
    playerG.fillCircle(-5, -14, 4);
    playerG.fillCircle(5, -14, 4);
    playerG.fillStyle(0x000000, 1);
    playerG.fillCircle(-4, -14, 2);
    playerG.fillCircle(6, -14, 2);

    this.player = this.add.container(150, GAME_HEIGHT - 80, [playerG]);
    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(30, 40);
    this.playerBody.setOffset(-15, -20);
    this.playerBody.setCollideWorldBounds(false);

    // Collisions
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.platformGroup, (_player, platform) => {
      // Collect the platform value when landing on it
      const plat = this.platforms.find(p =>
        p.body === (platform as Phaser.GameObjects.Rectangle).body && !p.collected
      );
      if (plat && this.playerBody.touching.down) {
        plat.collected = true;
        this.collectedTotal += plat.value;
        this.collectedText.setText(`Collected: ${this.collectedTotal}`);

        // Visual feedback
        plat.sprite.setAlpha(0.4);
        const plusText = this.add.text(plat.sprite.x, plat.sprite.y - 30, `+${plat.value}`, {
          fontFamily: 'Arial Black', fontSize: '20px', color: '#f1c40f',
          stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5);
        this.tweens.add({
          targets: plusText,
          y: plusText.y - 40, alpha: 0, duration: 600,
          onComplete: () => plusText.destroy(),
        });

        if (this.collectedTotal === this.targetNumber) {
          this.collectedText.setColor('#2ecc71');
        } else if (this.collectedTotal > this.targetNumber) {
          this.collectedText.setColor('#e74c3c');
        }
      }
    });

    // Finish zone overlap
    this.physics.add.overlap(this.player, finishZone, () => {
      if (!this.levelComplete && this.gameActive) {
        this.levelComplete = true;
        this.checkLevelResult();
      }
    });

    // HUD (fixed to camera)
    this.hud = new HUD(this);
    this.hud.update(this.profile!);

    // UI
    this.targetText = this.add.text(GAME_WIDTH / 2, 70, `Collect: ${this.targetNumber}`, {
      fontFamily: 'Arial Black', fontSize: '28px',
      color: '#f1c40f', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0);

    this.collectedText = this.add.text(GAME_WIDTH / 2, 110, 'Collected: 0', {
      fontFamily: 'Arial Black', fontSize: '22px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0);

    this.levelText = this.add.text(GAME_WIDTH - 80, 70, `${this.currentLevel}/${this.totalLevels}`, {
      fontFamily: 'Arial', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0);

    // Back button
    const backBtn = this.add.text(60, 65, '< Back', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive().setScrollFactor(0);
    backBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('VillageScene'));
    });

    // Instructions
    const instrText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Tap to jump!\nLand on platforms to collect numbers.', {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setAlpha(0.9);

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: instrText, alpha: 0, duration: 500,
        onComplete: () => { instrText.destroy(); this.gameActive = true; },
      });
    });

    // Input
    this.input.on('pointerdown', () => {
      if (this.gameActive && this.playerBody.touching.down) {
        this.playerBody.setVelocityY(JUMP_VELOCITY);
      }
    });

    // Camera follows player
    this.cameras.main.startFollow(this.player, false, 0.1, 0);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH * 3, GAME_HEIGHT);
  }

  update(): void {
    if (!this.gameActive || this.levelComplete) return;

    // Auto-run the player
    this.playerBody.setVelocityX(AUTO_SPEED * 60);

    // Fall off screen = fail
    if (this.player.y > GAME_HEIGHT + 100) {
      this.levelComplete = true;
      this.checkLevelResult();
    }
  }

  private nextLevel(): void {
    this.currentLevel++;
    if (this.currentLevel > this.totalLevels) {
      this.gameOver();
      return;
    }
    this.setupLevel();
  }

  private checkLevelResult(): void {
    this.gameActive = false;

    if (this.collectedTotal === this.targetNumber) {
      this.levelsWon++;
      const earned = this.economy.recordCorrectAnswer(false, false);
      this.economy.addXP(15);
      if (this.profile) this.hud.update(this.profile);

      const successText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Level Clear! +${earned}`, {
        fontFamily: 'Arial Black', fontSize: '36px',
        color: '#2ecc71', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setScrollFactor(0);

      this.hud.animateCoinEarn(earned, GAME_WIDTH / 2, GAME_HEIGHT / 2);

      this.time.delayedCall(2000, () => {
        successText.destroy();
        this.nextLevel();
      });
    } else {
      this.economy.recordWrongAnswer();
      if (this.profile) this.hud.update(this.profile);

      const msg = this.collectedTotal > this.targetNumber
        ? `Too much! ${this.collectedTotal} > ${this.targetNumber}`
        : this.player.y > GAME_HEIGHT
        ? 'Fell off!'
        : `Not enough! ${this.collectedTotal} < ${this.targetNumber}`;

      const failText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, {
        fontFamily: 'Arial Black', fontSize: '32px',
        color: '#e74c3c', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setScrollFactor(0);

      this.time.delayedCall(2000, () => {
        failText.destroy();
        this.nextLevel();
      });
    }
  }

  private gameOver(): void {
    const bonus = this.economy.completeMiniGame();
    if (this.profile) { this.hud.update(this.profile); SaveManager.saveProfile(this.profile); }

    // Reset camera
    this.cameras.main.stopFollow();
    this.cameras.main.setScroll(0, 0);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT).setDepth(800).setScrollFactor(0);

    const box = this.add.graphics();
    box.fillStyle(0x2c3e50, 1);
    box.fillRoundedRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 140, 400, 280, 16);
    box.lineStyle(3, 0xf1c40f, 1);
    box.strokeRoundedRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 140, 400, 280, 16);
    box.setDepth(801).setScrollFactor(0);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'Number Run Complete!', {
      fontFamily: 'Arial Black', fontSize: '24px', color: '#f1c40f',
    }).setOrigin(0.5).setDepth(802).setScrollFactor(0);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, `${this.levelsWon} / ${this.totalLevels} levels cleared`, {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(802).setScrollFactor(0);

    let stars = 0;
    if (this.levelsWon >= 2) stars = 1;
    if (this.levelsWon >= 4) stars = 2;
    if (this.levelsWon >= 5) stars = 3;

    for (let i = 0; i < 3; i++) {
      const star = this.add.image(GAME_WIDTH / 2 - 50 + i * 50, GAME_HEIGHT / 2, 'star');
      star.setScale(1.5).setAlpha(i < stars ? 1 : 0.2).setDepth(802).setScrollFactor(0);
      if (i < stars) {
        this.tweens.add({ targets: star, scale: 2, duration: 300, delay: i * 200, yoyo: true, ease: 'Back.easeOut' });
      }
    }

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45, `+${bonus} bonus`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#2ecc71',
    }).setOrigin(0.5).setDepth(802).setScrollFactor(0);

    const contBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 'btn_green').setInteractive().setDepth(802).setScrollFactor(0);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 88, 'Continue', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(802).setScrollFactor(0);
    contBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('VillageScene'));
    });
  }
}
