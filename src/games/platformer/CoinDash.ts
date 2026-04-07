import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/game-config';
import { SaveManager } from '../../systems/SaveManager';
import { EconomyManager } from '../../systems/EconomyManager';
import { HUD } from '../../ui/HUD';

const PLAYER_SPEED = 250;
const JUMP_VELOCITY = -500;
const GRAVITY = 900;
const GAME_TIME = 45; // seconds

export class CoinDashScene extends Phaser.Scene {
  private profile!: ReturnType<typeof SaveManager.getActiveProfile>;
  private economy!: EconomyManager;
  private hud!: HUD;

  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private platformGroup!: Phaser.Physics.Arcade.StaticGroup;
  private coinGroup!: Phaser.Physics.Arcade.Group;

  private targetCoins: number = 0;
  private collectedCoins: number = 0;
  private timeLeft: number = GAME_TIME;
  private gameActive: boolean = false;

  private targetText!: Phaser.GameObjects.Text;
  private collectedCoinText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private touchLeft: boolean = false;
  private touchRight: boolean = false;
  private touchJump: boolean = false;

  constructor() {
    super({ key: 'CoinDashScene' });
  }

  create(): void {
    const profile = SaveManager.getActiveProfile();
    if (!profile) { this.scene.start('ProfileScene'); return; }
    this.profile = profile;
    this.economy = new EconomyManager(profile);

    this.cameras.main.fadeIn(300);
    this.collectedCoins = 0;
    this.timeLeft = GAME_TIME;

    this.physics.world.gravity.y = GRAVITY;

    this.drawLevel();
    this.createPlayer();
    this.spawnCoins();
    this.drawUI();
    this.drawTouchControls();

    this.hud = new HUD(this);
    this.hud.update(profile);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Camera
    this.cameras.main.startFollow(this.player, false, 0.1, 0);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);

    // Start after brief delay
    this.time.delayedCall(500, () => {
      this.gameActive = true;
      this.startTimer();
    });
  }

  private drawLevel(): void {
    // Sky
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xaed8f0, 0xaed8f0, 1);
    bg.fillRect(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
    bg.setScrollFactor(0.2);

    // Hills
    const hills = this.add.graphics();
    hills.fillStyle(0x8fd860, 0.5);
    hills.fillEllipse(200, GAME_HEIGHT - 80, 400, 200);
    hills.fillEllipse(600, GAME_HEIGHT - 60, 500, 180);
    hills.fillEllipse(1200, GAME_HEIGHT - 70, 350, 160);
    hills.fillEllipse(1800, GAME_HEIGHT - 65, 450, 190);
    hills.setScrollFactor(0.4);

    // Ground
    this.groundGroup = this.physics.add.staticGroup();
    for (let x = 0; x < GAME_WIDTH * 2; x += 64) {
      const groundG = this.add.graphics();
      groundG.fillStyle(0x6bb840, 1);
      groundG.fillRect(0, 0, 64, 40);
      groundG.fillStyle(0x8b6914, 1);
      groundG.fillRect(0, 10, 64, 30);
      groundG.generateTexture(`cdground_${x}`, 64, 40);
      groundG.destroy();

      const g = this.groundGroup.create(x + 32, GAME_HEIGHT - 20, `cdground_${x}`);
      g.refreshBody();
    }

    // Floating platforms
    this.platformGroup = this.physics.add.staticGroup();
    const platformPositions = [
      [300, 500], [500, 400], [700, 480], [900, 350],
      [1100, 430], [1300, 370], [1500, 460], [1700, 340],
      [1900, 500], [2100, 380],
    ];

    platformPositions.forEach(([px, py], i) => {
      const platG = this.add.graphics();
      platG.fillStyle(0x8b6914, 1);
      platG.fillRoundedRect(0, 0, 120, 20, 4);
      platG.fillStyle(0x6bb840, 1);
      platG.fillRect(0, 0, 120, 10);
      platG.generateTexture(`cdplat_${i}`, 120, 20);
      platG.destroy();

      const p = this.platformGroup.create(px, py, `cdplat_${i}`);
      p.refreshBody();
    });

    // Obstacles (rocks/crates)
    const obstaclePositions = [
      [400, GAME_HEIGHT - 60], [800, GAME_HEIGHT - 60],
      [1200, GAME_HEIGHT - 60], [1600, GAME_HEIGHT - 60],
      [2000, GAME_HEIGHT - 60],
    ];

    obstaclePositions.forEach(([ox, oy], i) => {
      const obsG = this.add.graphics();
      obsG.fillStyle(0x7f8c8d, 1);
      obsG.fillRoundedRect(0, 0, 40, 30, 6);
      obsG.lineStyle(2, 0x555555, 1);
      obsG.strokeRoundedRect(0, 0, 40, 30, 6);
      obsG.generateTexture(`cdobs_${i}`, 40, 30);
      obsG.destroy();

      const obs = this.groundGroup.create(ox, oy, `cdobs_${i}`);
      obs.refreshBody();
    });

    // Back button
    const backBtn = this.add.text(60, 65, '< Back', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive().setScrollFactor(0);
    backBtn.on('pointerup', () => {
      this.gameActive = false;
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('VillageScene'));
    });
  }

  private createPlayer(): void {
    const playerG = this.add.graphics();
    // Body
    playerG.fillStyle(0xff8c00, 1);
    playerG.fillRoundedRect(-15, -5, 30, 30, 6);
    // Head
    playerG.fillCircle(0, -15, 14);
    // Eyes
    playerG.fillStyle(0xffffff, 1);
    playerG.fillCircle(-5, -18, 5);
    playerG.fillCircle(7, -18, 5);
    playerG.fillStyle(0x000000, 1);
    playerG.fillCircle(-4, -18, 2);
    playerG.fillCircle(8, -18, 2);

    this.player = this.add.container(100, GAME_HEIGHT - 80, [playerG]);
    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(28, 44);
    this.playerBody.setOffset(-14, -20);
    this.playerBody.setCollideWorldBounds(false);

    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.platformGroup);
  }

  private spawnCoins(): void {
    this.coinGroup = this.physics.add.group({ allowGravity: false });

    // Spawn coins of different denominations: 1, 5, 10
    const coinPositions: { x: number; y: number; value: number }[] = [];

    // Regular coins (1)
    for (let i = 0; i < 30; i++) {
      coinPositions.push({
        x: 200 + i * 80 + Phaser.Math.Between(-20, 20),
        y: GAME_HEIGHT - 100 - Phaser.Math.Between(30, 200),
        value: 1,
      });
    }

    // Silver coins (5)
    for (let i = 0; i < 8; i++) {
      coinPositions.push({
        x: 350 + i * 260 + Phaser.Math.Between(-30, 30),
        y: GAME_HEIGHT - 200 - Phaser.Math.Between(50, 150),
        value: 5,
      });
    }

    // Gold coins (10)
    for (let i = 0; i < 4; i++) {
      coinPositions.push({
        x: 500 + i * 500,
        y: GAME_HEIGHT - 320 - Phaser.Math.Between(0, 80),
        value: 10,
      });
    }

    // Calculate target from a subset
    const totalAvailable = coinPositions.reduce((s, c) => s + c.value, 0);
    this.targetCoins = Math.floor(totalAvailable * 0.6); // Need ~60% of total

    coinPositions.forEach((pos, i) => {
      const colors: Record<number, number> = { 1: 0xcd7f32, 5: 0xc0c0c0, 10: 0xf1c40f };
      const color = colors[pos.value] ?? 0xf1c40f;

      const cG = this.add.graphics();
      cG.fillStyle(color, 1);
      cG.fillCircle(12, 12, 10);
      cG.lineStyle(2, 0x333333, 0.5);
      cG.strokeCircle(12, 12, 10);
      cG.fillStyle(0x333333, 0.3);
      cG.fillCircle(12, 12, 5);
      cG.generateTexture(`cdcoin_${i}`, 24, 24);
      cG.destroy();

      const coinSprite = this.coinGroup.create(pos.x, pos.y, `cdcoin_${i}`);
      coinSprite.setData('value', pos.value);

      // Label for 5 and 10 coins
      if (pos.value > 1) {
        const label = this.add.text(pos.x, pos.y, `${pos.value}`, {
          fontFamily: 'Arial Black', fontSize: '10px', color: '#333',
        }).setOrigin(0.5);
        coinSprite.setData('label', label);
      }

      // Float animation
      this.tweens.add({
        targets: coinSprite,
        y: pos.y - 5,
        duration: 800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    // Coin collection
    this.physics.add.overlap(this.player, this.coinGroup, (_player, coin) => {
      const coinObj = coin as Phaser.Physics.Arcade.Sprite;
      const value = coinObj.getData('value') as number;
      const label = coinObj.getData('label') as Phaser.GameObjects.Text | undefined;

      this.collectedCoins += value;
      this.collectedCoinText.setText(`${this.collectedCoins}`);

      if (this.collectedCoins >= this.targetCoins) {
        this.collectedCoinText.setColor('#2ecc71');
      }

      // Collection effect
      const plusText = this.add.text(coinObj.x, coinObj.y - 20, `+${value}`, {
        fontFamily: 'Arial Black', fontSize: '16px', color: '#f1c40f',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);
      this.tweens.add({
        targets: plusText, y: plusText.y - 30, alpha: 0, duration: 500,
        onComplete: () => plusText.destroy(),
      });

      if (label) label.destroy();
      coinObj.destroy();
    });
  }

  private drawUI(): void {
    this.targetText = this.add.text(GAME_WIDTH / 2 - 60, 70, `Target: ${this.targetCoins}`, {
      fontFamily: 'Arial Black', fontSize: '22px',
      color: '#f1c40f', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0);

    this.collectedCoinText = this.add.text(GAME_WIDTH / 2 + 80, 70, '0', {
      fontFamily: 'Arial Black', fontSize: '22px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0);

    const coinIcon = this.add.image(GAME_WIDTH / 2 + 50, 70, 'coin').setScale(0.8).setScrollFactor(0);

    this.timerText = this.add.text(GAME_WIDTH - 80, 70, `${this.timeLeft}s`, {
      fontFamily: 'Arial Black', fontSize: '24px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0);
  }

  private drawTouchControls(): void {
    // Left arrow
    const leftBtn = this.add.graphics();
    leftBtn.fillStyle(0x000000, 0.3);
    leftBtn.fillRoundedRect(20, GAME_HEIGHT - 100, 80, 60, 10);
    leftBtn.setScrollFactor(0).setDepth(900);

    const leftText = this.add.text(60, GAME_HEIGHT - 70, '◀', {
      fontSize: '30px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(901);

    const leftHit = this.add.rectangle(60, GAME_HEIGHT - 70, 80, 60)
      .setInteractive().setAlpha(0.001).setScrollFactor(0).setDepth(902);
    leftHit.on('pointerdown', () => this.touchLeft = true);
    leftHit.on('pointerup', () => this.touchLeft = false);
    leftHit.on('pointerout', () => this.touchLeft = false);

    // Right arrow
    const rightBtn = this.add.graphics();
    rightBtn.fillStyle(0x000000, 0.3);
    rightBtn.fillRoundedRect(120, GAME_HEIGHT - 100, 80, 60, 10);
    rightBtn.setScrollFactor(0).setDepth(900);

    const rightText = this.add.text(160, GAME_HEIGHT - 70, '▶', {
      fontSize: '30px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(901);

    const rightHit = this.add.rectangle(160, GAME_HEIGHT - 70, 80, 60)
      .setInteractive().setAlpha(0.001).setScrollFactor(0).setDepth(902);
    rightHit.on('pointerdown', () => this.touchRight = true);
    rightHit.on('pointerup', () => this.touchRight = false);
    rightHit.on('pointerout', () => this.touchRight = false);

    // Jump button
    const jumpBtn = this.add.graphics();
    jumpBtn.fillStyle(0x000000, 0.3);
    jumpBtn.fillRoundedRect(GAME_WIDTH - 120, GAME_HEIGHT - 100, 100, 60, 10);
    jumpBtn.setScrollFactor(0).setDepth(900);

    const jumpText = this.add.text(GAME_WIDTH - 70, GAME_HEIGHT - 70, 'JUMP', {
      fontFamily: 'Arial Black', fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(901);

    const jumpHit = this.add.rectangle(GAME_WIDTH - 70, GAME_HEIGHT - 70, 100, 60)
      .setInteractive().setAlpha(0.001).setScrollFactor(0).setDepth(902);
    jumpHit.on('pointerdown', () => this.touchJump = true);
    jumpHit.on('pointerup', () => this.touchJump = false);
    jumpHit.on('pointerout', () => this.touchJump = false);
  }

  private startTimer(): void {
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.gameActive) return;
        this.timeLeft--;
        this.timerText.setText(`${this.timeLeft}s`);
        if (this.timeLeft <= 10) this.timerText.setColor('#e74c3c');
        if (this.timeLeft <= 0) this.gameOver();
      },
      repeat: GAME_TIME - 1,
    });
  }

  update(): void {
    if (!this.gameActive) return;

    // Movement
    const left = this.cursors?.left?.isDown || this.touchLeft;
    const right = this.cursors?.right?.isDown || this.touchRight;
    const jump = this.cursors?.up?.isDown || this.touchJump;

    if (left) {
      this.playerBody.setVelocityX(-PLAYER_SPEED);
      this.player.setScale(-1, 1);
    } else if (right) {
      this.playerBody.setVelocityX(PLAYER_SPEED);
      this.player.setScale(1, 1);
    } else {
      this.playerBody.setVelocityX(0);
    }

    if (jump && this.playerBody.touching.down) {
      this.playerBody.setVelocityY(JUMP_VELOCITY);
    }

    // Fall off screen
    if (this.player.y > GAME_HEIGHT + 50) {
      this.player.setPosition(100, GAME_HEIGHT - 100);
      this.playerBody.setVelocity(0, 0);
    }
  }

  private gameOver(): void {
    this.gameActive = false;
    const success = this.collectedCoins >= this.targetCoins;

    if (success) {
      this.economy.recordCorrectAnswer(false, false);
      this.economy.addXP(20);
    } else {
      this.economy.recordWrongAnswer();
    }

    const bonus = this.economy.completeMiniGame();
    if (this.profile) { this.hud.update(this.profile); SaveManager.saveProfile(this.profile); }

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

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, success ? 'Coin Dash Win!' : "Time's Up!", {
      fontFamily: 'Arial Black', fontSize: '28px', color: '#f1c40f',
    }).setOrigin(0.5).setDepth(802).setScrollFactor(0);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50,
      `Collected: ${this.collectedCoins} / ${this.targetCoins}`, {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(802).setScrollFactor(0);

    let stars = 0;
    const ratio = this.collectedCoins / this.targetCoins;
    if (ratio >= 0.6) stars = 1;
    if (ratio >= 0.8) stars = 2;
    if (ratio >= 1.0) stars = 3;

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

    const contBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 'btn_green')
      .setInteractive().setDepth(802).setScrollFactor(0);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 88, 'Continue', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(802).setScrollFactor(0);
    contBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('VillageScene'));
    });
  }
}
