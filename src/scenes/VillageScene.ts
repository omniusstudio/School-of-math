import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { DISTRICTS } from '../config/districts';
import { NPC_CHARACTERS } from '../config/characters';
import { SaveManager, type ProfileData } from '../systems/SaveManager';
import { EconomyManager } from '../systems/EconomyManager';
import { HUD } from '../ui/HUD';

interface DistrictNode {
  id: string;
  x: number;
  y: number;
  unlocked: boolean;
}

export class VillageScene extends Phaser.Scene {
  private profile!: ProfileData;
  private economy!: EconomyManager;
  private hud!: HUD;
  private districtNodes: DistrictNode[] = [];

  constructor() {
    super({ key: 'VillageScene' });
  }

  create(): void {
    const profile = SaveManager.getActiveProfile();
    if (!profile) {
      this.scene.start('ProfileScene');
      return;
    }
    this.profile = profile;
    this.economy = new EconomyManager(this.profile);

    this.cameras.main.fadeIn(500);

    // Draw the village
    this.drawBackground();
    this.drawDistricts();
    this.drawPlayer();

    // HUD (on top of everything)
    this.hud = new HUD(this);
    this.hud.update(this.profile);
    this.hud.setScrollFactor(0, 0);

    // Shop button
    const shopBtn = this.add.graphics();
    shopBtn.fillStyle(0xf39c12, 1);
    shopBtn.fillRoundedRect(GAME_WIDTH - 160, GAME_HEIGHT - 60, 140, 40, 8);
    shopBtn.lineStyle(2, 0xf1c40f, 1);
    shopBtn.strokeRoundedRect(GAME_WIDTH - 160, GAME_HEIGHT - 60, 140, 40, 8);

    this.add.text(GAME_WIDTH - 90, GAME_HEIGHT - 40, '🏪 Shop', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const shopHit = this.add.rectangle(GAME_WIDTH - 90, GAME_HEIGHT - 40, 140, 40).setInteractive().setAlpha(0.001);
    shopHit.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('ShopScene'));
    });

    // Character Shop button
    const charBtn = this.add.graphics();
    charBtn.fillStyle(0x9b59b6, 1);
    charBtn.fillRoundedRect(GAME_WIDTH - 310, GAME_HEIGHT - 60, 140, 40, 8);
    charBtn.lineStyle(2, 0x8e44ad, 1);
    charBtn.strokeRoundedRect(GAME_WIDTH - 310, GAME_HEIGHT - 60, 140, 40, 8);

    this.add.text(GAME_WIDTH - 240, GAME_HEIGHT - 40, '🐾 Characters', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const charHit = this.add.rectangle(GAME_WIDTH - 240, GAME_HEIGHT - 40, 140, 40).setInteractive().setAlpha(0.001);
    charHit.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('CharacterShopScene'));
    });

    // Platformer buttons
    const platBtnG = this.add.graphics();
    platBtnG.fillStyle(0x2ecc71, 1);
    platBtnG.fillRoundedRect(20, GAME_HEIGHT - 60, 140, 40, 8);
    platBtnG.lineStyle(2, 0x27ae60, 1);
    platBtnG.strokeRoundedRect(20, GAME_HEIGHT - 60, 140, 40, 8);

    this.add.text(90, GAME_HEIGHT - 40, '🏃 Number Run', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const platHit = this.add.rectangle(90, GAME_HEIGHT - 40, 140, 40).setInteractive().setAlpha(0.001);
    platHit.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('NumberRunScene'));
    });

    const dashBtnG = this.add.graphics();
    dashBtnG.fillStyle(0x3498db, 1);
    dashBtnG.fillRoundedRect(170, GAME_HEIGHT - 60, 140, 40, 8);
    dashBtnG.lineStyle(2, 0x2980b9, 1);
    dashBtnG.strokeRoundedRect(170, GAME_HEIGHT - 60, 140, 40, 8);

    this.add.text(240, GAME_HEIGHT - 40, '🪙 Coin Dash', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const dashHit = this.add.rectangle(240, GAME_HEIGHT - 40, 140, 40).setInteractive().setAlpha(0.001);
    dashHit.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('CoinDashScene'));
    });

    // Welcome message for new players
    if (this.profile.stats.sessionsPlayed === 0) {
      this.showWelcomeMessage();
      this.profile.stats.sessionsPlayed = 1;
      SaveManager.saveProfile(this.profile);
    }
  }

  private drawBackground(): void {
    // Sky
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xb8e2f8, 0xb8e2f8, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Ground
    bg.fillStyle(0x7ec850, 1);
    bg.fillRect(0, GAME_HEIGHT * 0.35, GAME_WIDTH, GAME_HEIGHT * 0.65);

    // Grass texture lines
    bg.lineStyle(1, 0x6bb840, 0.3);
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = GAME_HEIGHT * 0.35 + Math.random() * GAME_HEIGHT * 0.6;
      bg.lineBetween(x, y, x + 5, y - 8);
    }

    // Decorative hills
    bg.fillStyle(0x8fd860, 0.6);
    bg.fillEllipse(100, GAME_HEIGHT * 0.35, 300, 100);
    bg.fillEllipse(GAME_WIDTH - 150, GAME_HEIGHT * 0.35, 400, 80);

    // Clouds
    const cloudG = this.add.graphics();
    cloudG.fillStyle(0xffffff, 0.7);
    [[150, 80], [500, 50], [900, 90], [1150, 60]].forEach(([cx, cy]) => {
      cloudG.fillEllipse(cx, cy, 80, 30);
      cloudG.fillEllipse(cx + 30, cy - 10, 60, 25);
      cloudG.fillEllipse(cx - 25, cy + 5, 50, 22);
    });

    // Village name
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.35 - 15, `${this.profile.name}'s Countopia`, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '28px',
      color: '#2c3e50',
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Paths between districts (drawn as brown lines)
    const pathG = this.add.graphics();
    pathG.lineStyle(6, 0xc9960c, 0.4);
  }

  private drawDistricts(): void {
    // District positions on the map
    const positions: Record<string, { x: number; y: number }> = {
      farm:         { x: 200,  y: GAME_HEIGHT * 0.55 },
      school:       { x: 200,  y: GAME_HEIGHT * 0.78 },
      market:       { x: 640,  y: GAME_HEIGHT * 0.48 },
      bakery:       { x: 1080, y: GAME_HEIGHT * 0.55 },
      construction: { x: 640,  y: GAME_HEIGHT * 0.78 },
      festival:     { x: 1080, y: GAME_HEIGHT * 0.78 },
      harbor:       { x: 1080, y: GAME_HEIGHT * 0.35 },
      bank:         { x: 200,  y: GAME_HEIGHT * 0.35 },
    };

    // Draw paths between connected districts
    const connections = [
      ['farm', 'school'], ['farm', 'market'], ['market', 'bakery'],
      ['market', 'construction'], ['construction', 'festival'],
      ['bakery', 'harbor'], ['farm', 'bank'],
    ];

    const pathG = this.add.graphics();
    pathG.lineStyle(5, 0xd4a574, 0.5);
    connections.forEach(([a, b]) => {
      const pa = positions[a];
      const pb = positions[b];
      if (pa && pb) {
        // Dotted path effect
        const dx = pb.x - pa.x;
        const dy = pb.y - pa.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(dist / 15);
        for (let i = 0; i < steps; i += 2) {
          const t1 = i / steps;
          const t2 = Math.min((i + 1) / steps, 1);
          pathG.lineBetween(
            pa.x + dx * t1, pa.y + dy * t1,
            pa.x + dx * t2, pa.y + dy * t2
          );
        }
      }
    });

    // Draw each district
    Object.entries(DISTRICTS).forEach(([id, district]) => {
      const pos = positions[id];
      if (!pos) return;

      const unlocked = this.profile.unlockedDistricts.includes(id) ||
        this.profile.villageLevel >= district.unlockLevel;
      const node: DistrictNode = { id, x: pos.x, y: pos.y, unlocked };
      this.districtNodes.push(node);

      if (unlocked) {
        this.createUnlockedDistrict(node, district);
      } else {
        this.createLockedDistrict(node, district);
      }
    });
  }

  private createUnlockedDistrict(node: DistrictNode, district: typeof DISTRICTS[string]): void {
    // District background tile
    const tileG = this.add.graphics();
    tileG.fillStyle(district.color, 1);
    tileG.fillRoundedRect(node.x - 80, node.y - 60, 160, 120, 12);
    tileG.lineStyle(3, 0x000000, 0.3);
    tileG.strokeRoundedRect(node.x - 80, node.y - 60, 160, 120, 12);

    // NPC avatar
    const npc = NPC_CHARACTERS[district.npcId as keyof typeof NPC_CHARACTERS];
    if (npc) {
      const npcSprite = this.add.image(node.x, node.y - 15, `npc_${npc.id}`);
      npcSprite.setScale(1.3);

      // Speech bubble indicator
      const bubble = this.add.graphics();
      bubble.fillStyle(0xffffff, 0.9);
      bubble.fillRoundedRect(node.x + 15, node.y - 55, 24, 20, 6);
      bubble.fillTriangle(node.x + 23, node.y - 35, node.x + 30, node.y - 35, node.x + 25, node.y - 28);
      this.add.text(node.x + 27, node.y - 46, '!', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#e74c3c',
      }).setOrigin(0.5);

      // Pulse animation on the bubble
      this.tweens.add({
        targets: bubble,
        alpha: 0.5,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    }

    // District name
    this.add.text(node.x, node.y + 35, district.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Interactive area
    const hitArea = this.add.rectangle(node.x, node.y, 160, 120).setInteractive();
    hitArea.setAlpha(0.001);

    hitArea.on('pointerover', () => {
      tileG.clear();
      tileG.fillStyle(district.color, 1);
      tileG.fillRoundedRect(node.x - 83, node.y - 63, 166, 126, 12);
      tileG.lineStyle(3, 0xf1c40f, 1);
      tileG.strokeRoundedRect(node.x - 83, node.y - 63, 166, 126, 12);
    });

    hitArea.on('pointerout', () => {
      tileG.clear();
      tileG.fillStyle(district.color, 1);
      tileG.fillRoundedRect(node.x - 80, node.y - 60, 160, 120, 12);
      tileG.lineStyle(3, 0x000000, 0.3);
      tileG.strokeRoundedRect(node.x - 80, node.y - 60, 160, 120, 12);
    });

    hitArea.on('pointerup', () => {
      this.enterDistrict(node.id);
    });
  }

  private createLockedDistrict(node: DistrictNode, district: typeof DISTRICTS[string]): void {
    // Foggy/locked appearance
    const tileG = this.add.graphics();
    tileG.fillStyle(0x555555, 0.5);
    tileG.fillRoundedRect(node.x - 80, node.y - 60, 160, 120, 12);
    tileG.lineStyle(2, 0x333333, 0.5);
    tileG.strokeRoundedRect(node.x - 80, node.y - 60, 160, 120, 12);

    // Lock icon (text placeholder)
    this.add.text(node.x, node.y - 10, '🔒', {
      fontSize: '32px',
    }).setOrigin(0.5);

    // Level requirement
    this.add.text(node.x, node.y + 30, `Level ${district.unlockLevel}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#999999',
    }).setOrigin(0.5);

    // Fog particles
    this.add.text(node.x, node.y + 45, district.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#777777',
    }).setOrigin(0.5);
  }

  private drawPlayer(): void {
    // Player avatar in the center (village square area)
    const playerChar = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT * 0.63, `char_${this.profile.characterId}`);
    playerChar.setScale(2.5);

    // Gentle bobbing animation
    this.tweens.add({
      targets: playerChar,
      y: playerChar.y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Player name label
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.63 + 45, this.profile.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
  }

  private enterDistrict(districtId: string): void {
    const district = DISTRICTS[districtId];
    if (!district) return;

    // Districts with mini-games go to DistrictScene
    if (district.miniGames.length > 0) {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        this.scene.start('DistrictScene', { districtId });
      });
    } else {
      this.showMessage(`${district.name} is coming soon!`);
    }
  }

  private showMessage(text: string): void {
    const msgBg = this.add.graphics();
    msgBg.fillStyle(0x000000, 0.7);
    msgBg.fillRoundedRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 30, 400, 60, 12);

    const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [msgBg, msg],
        alpha: 0,
        duration: 300,
        onComplete: () => { msgBg.destroy(); msg.destroy(); },
      });
    });
  }

  private showWelcomeMessage(): void {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setDepth(900);

    const box = this.add.graphics();
    box.fillStyle(0x2c3e50, 1);
    box.fillRoundedRect(GAME_WIDTH / 2 - 250, GAME_HEIGHT / 2 - 120, 500, 240, 16);
    box.lineStyle(3, 0xf1c40f, 1);
    box.strokeRoundedRect(GAME_WIDTH / 2 - 250, GAME_HEIGHT / 2 - 120, 500, 240, 16);
    box.setDepth(901);

    // NPC portrait (Flora for first district)
    const npcImg = this.add.image(GAME_WIDTH / 2 - 180, GAME_HEIGHT / 2 - 30, 'npc_flora');
    npcImg.setScale(2.5);
    npcImg.setDepth(902);

    const welcomeText = this.add.text(GAME_WIDTH / 2 + 20, GAME_HEIGHT / 2 - 60,
      `Welcome to Countopia,\n${this.profile.name}!\n\nI'm Farmer Flora.\nI need your help on\nthe farm!`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      lineSpacing: 6,
    }).setOrigin(0.5, 0).setDepth(902);

    const okBtn = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 85, 'btn_green').setInteractive();
    okBtn.setDepth(902);
    const okText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 83, "Let's go!", {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(902);

    okBtn.on('pointerup', () => {
      [overlay, box, npcImg, welcomeText, okBtn, okText].forEach(obj => obj.destroy());
    });
  }
}
