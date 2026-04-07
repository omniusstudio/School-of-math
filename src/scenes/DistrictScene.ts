import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { DISTRICTS } from '../config/districts';
import { NPC_CHARACTERS } from '../config/characters';
import { SaveManager, type ProfileData } from '../systems/SaveManager';
import { HUD } from '../ui/HUD';
import { DialogBox, type DialogLine } from '../ui/DialogBox';

// NPC dialogue lines per district
const NPC_GREETINGS: Record<string, DialogLine[]> = {
  farm: [
    { speaker: 'Farmer Flora', text: "Oh, you're here! The farm has so much work to do. Pick a task and help me out!", portrait: 'npc_flora' },
  ],
  school: [
    { speaker: 'Teacher Tala', text: "Welcome to the school! I have some special techniques to teach you...", portrait: 'npc_tala' },
  ],
  market: [
    { speaker: 'Merchant Mara', text: "Business is booming! I could use some help with the customers.", portrait: 'npc_mara' },
  ],
  bakery: [
    { speaker: 'Baker Ben', text: "The oven is hot and orders are piling up! Ready to bake?", portrait: 'npc_ben' },
  ],
  construction: [
    { speaker: 'Builder Brix', text: "We've got structures to build. Let's get to work!", portrait: 'npc_brix' },
  ],
  festival: [
    { speaker: 'Festival Fizz', text: "A festival is coming!! Help me set everything up!", portrait: 'npc_fizz' },
  ],
  harbor: [
    { speaker: 'Captain Kai', text: "Ahoy! The ships are waiting. Ready to set sail?", portrait: 'npc_kai' },
  ],
  bank: [
    { speaker: 'Banker Bloom', text: "The numbers must balance. Shall we begin?", portrait: 'npc_bloom' },
  ],
};

// Mini-game display info
const MINI_GAME_INFO: Record<string, { name: string; description: string; scene: string; icon: string }> = {
  'crate-stacker': {
    name: 'Crate Stacker',
    description: 'Fill crates with exactly 10 apples!',
    scene: 'CrateStackerScene',
    icon: '📦',
  },
  'egg-collector': {
    name: 'Egg Collector',
    description: 'Collect eggs in groups to reach the target!',
    scene: 'EggCollectorScene',
    icon: '🥚',
  },
  'harvest-rows': {
    name: 'Harvest Rows',
    description: 'Harvest the right rows to hit the exact number!',
    scene: 'HarvestRowsScene',
    icon: '🌾',
  },
};

export class DistrictScene extends Phaser.Scene {
  private profile!: ProfileData;
  private hud!: HUD;
  private dialog!: DialogBox;
  private districtId: string = 'farm';

  constructor() {
    super({ key: 'DistrictScene' });
  }

  init(data: { districtId: string }): void {
    this.districtId = data.districtId || 'farm';
  }

  create(): void {
    const profile = SaveManager.getActiveProfile();
    if (!profile) {
      this.scene.start('ProfileScene');
      return;
    }
    this.profile = profile;

    this.cameras.main.fadeIn(400);

    const district = DISTRICTS[this.districtId];
    if (!district) {
      this.scene.start('VillageScene');
      return;
    }

    this.drawDistrictBackground(district);
    this.drawNPC(district);
    this.drawMiniGameCards(district);

    // HUD
    this.hud = new HUD(this);
    this.hud.update(this.profile);

    // Dialog box
    this.dialog = new DialogBox(this);

    // Back button
    const backBtn = this.add.text(60, 65, '< Village', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive();

    backBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => {
        this.scene.start('VillageScene');
      });
    });
    backBtn.on('pointerover', () => backBtn.setColor('#f1c40f'));
    backBtn.on('pointerout', () => backBtn.setColor('#ffffff'));

    // Show NPC greeting
    const greetings = NPC_GREETINGS[this.districtId] ?? [];
    if (greetings.length > 0) {
      this.time.delayedCall(600, () => {
        this.dialog.show(greetings);
      });
    }
  }

  private drawDistrictBackground(district: typeof DISTRICTS[string]): void {
    const bg = this.add.graphics();

    // Sky gradient
    bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xb8e2f8, 0xb8e2f8, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Ground with district color tint
    bg.fillStyle(district.color, 0.6);
    bg.fillRect(0, GAME_HEIGHT - 250, GAME_WIDTH, 250);
    bg.fillStyle(0x7ec850, 0.7);
    bg.fillRect(0, GAME_HEIGHT - 250, GAME_WIDTH, 250);

    // District title
    this.add.text(GAME_WIDTH / 2, 80, district.name, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 118, district.mathFocus, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ecf0f1',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
  }

  private drawNPC(district: typeof DISTRICTS[string]): void {
    const npc = NPC_CHARACTERS[district.npcId as keyof typeof NPC_CHARACTERS];
    if (!npc) return;

    // NPC on the left side
    const npcSprite = this.add.image(150, GAME_HEIGHT / 2 - 20, `npc_${npc.id}`);
    npcSprite.setScale(3.5);

    // Bobbing animation
    this.tweens.add({
      targets: npcSprite,
      y: npcSprite.y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // NPC name
    this.add.text(150, GAME_HEIGHT / 2 + 65, npc.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Click NPC to talk
    npcSprite.setInteractive();
    npcSprite.on('pointerup', () => {
      const greetings = NPC_GREETINGS[this.districtId] ?? [];
      if (greetings.length > 0) this.dialog.show(greetings);
    });
  }

  private drawMiniGameCards(district: typeof DISTRICTS[string]): void {
    const games = district.miniGames;
    const cardWidth = 240;
    const cardHeight = 140;
    const startX = 380;
    const startY = 180;
    const gap = 20;

    this.add.text(startX + (games.length * (cardWidth + gap)) / 2 - gap / 2, startY - 30, 'Choose a game:', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ecf0f1',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    games.forEach((gameId, i) => {
      const info = MINI_GAME_INFO[gameId];
      const x = startX + i * (cardWidth + gap);
      const y = startY;

      const hasScene = info?.scene ? true : false;

      // Card background
      const card = this.add.graphics();
      card.fillStyle(hasScene ? 0x2c3e50 : 0x1a1a2e, 1);
      card.fillRoundedRect(x, y, cardWidth, cardHeight, 12);
      card.lineStyle(2, hasScene ? 0x3498db : 0x555555, 1);
      card.strokeRoundedRect(x, y, cardWidth, cardHeight, 12);

      // Icon
      this.add.text(x + 30, y + cardHeight / 2 - 5, info?.icon ?? '🎮', {
        fontSize: '36px',
      }).setOrigin(0.5);

      // Name
      this.add.text(x + 65, y + 20, info?.name ?? gameId, {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '16px',
        color: hasScene ? '#ffffff' : '#777777',
      });

      // Description
      this.add.text(x + 65, y + 48, info?.description ?? 'Coming soon...', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: hasScene ? '#bdc3c7' : '#555555',
        wordWrap: { width: cardWidth - 75 },
      });

      if (!hasScene) {
        this.add.text(x + cardWidth / 2, y + cardHeight - 18, '🔒 Coming Soon', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#777777',
        }).setOrigin(0.5);
      }

      if (hasScene && info) {
        // Play button
        const playBtn = this.add.image(x + cardWidth - 40, y + cardHeight - 30, 'btn_green');
        playBtn.setScale(0.5, 0.6).setInteractive();
        const playText = this.add.text(x + cardWidth - 40, y + cardHeight - 32, 'Play', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#ffffff',
        }).setOrigin(0.5);

        const hitArea = this.add.rectangle(x + cardWidth / 2, y + cardHeight / 2, cardWidth, cardHeight)
          .setInteractive().setAlpha(0.001);

        hitArea.on('pointerover', () => {
          card.clear();
          card.fillStyle(0x34495e, 1);
          card.fillRoundedRect(x, y, cardWidth, cardHeight, 12);
          card.lineStyle(2, 0xf1c40f, 1);
          card.strokeRoundedRect(x, y, cardWidth, cardHeight, 12);
        });
        hitArea.on('pointerout', () => {
          card.clear();
          card.fillStyle(0x2c3e50, 1);
          card.fillRoundedRect(x, y, cardWidth, cardHeight, 12);
          card.lineStyle(2, 0x3498db, 1);
          card.strokeRoundedRect(x, y, cardWidth, cardHeight, 12);
        });
        hitArea.on('pointerup', () => {
          this.cameras.main.fadeOut(300);
          this.time.delayedCall(300, () => {
            this.scene.start(info.scene);
          });
        });
      }
    });
  }
}
