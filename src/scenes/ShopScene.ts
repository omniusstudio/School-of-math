import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { BUILDINGS, getAvailableBuildings, type BuildingDef } from '../config/buildings';
import { SaveManager, type ProfileData } from '../systems/SaveManager';
import { EconomyManager } from '../systems/EconomyManager';
import { HUD } from '../ui/HUD';

export class ShopScene extends Phaser.Scene {
  private profile!: ProfileData;
  private economy!: EconomyManager;
  private hud!: HUD;
  private districtFilter: string = 'all';

  constructor() {
    super({ key: 'ShopScene' });
  }

  init(data: { district?: string }): void {
    this.districtFilter = data.district ?? 'all';
  }

  create(): void {
    const profile = SaveManager.getActiveProfile();
    if (!profile) { this.scene.start('ProfileScene'); return; }
    this.profile = profile;
    this.economy = new EconomyManager(profile);

    this.cameras.main.fadeIn(300);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // HUD
    this.hud = new HUD(this);
    this.hud.update(this.profile);

    // Title
    this.add.text(GAME_WIDTH / 2, 70, 'Village Shop', {
      fontFamily: 'Arial Black', fontSize: '36px', color: '#f1c40f',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 105, `You have ${this.profile.coins} coins`, {
      fontFamily: 'Arial', fontSize: '18px', color: '#f1c40f',
    }).setOrigin(0.5);

    // Filter tabs
    this.drawFilterTabs();

    // Buildings grid
    this.drawBuildingCards();

    // Back button
    const backBtn = this.add.text(60, 65, '< Back', {
      fontFamily: 'Arial', fontSize: '18px', color: '#3498db',
    }).setOrigin(0.5).setInteractive();
    backBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('VillageScene'));
    });
    backBtn.on('pointerover', () => backBtn.setColor('#f1c40f'));
    backBtn.on('pointerout', () => backBtn.setColor('#3498db'));
  }

  private drawFilterTabs(): void {
    const tabs = [
      { id: 'all', label: 'All' },
      { id: 'farm', label: 'Farm' },
      { id: 'center', label: 'Decor' },
    ];

    const tabY = 140;
    const tabW = 80;
    const totalW = tabs.length * (tabW + 10);
    const startX = (GAME_WIDTH - totalW) / 2;

    tabs.forEach((tab, i) => {
      const x = startX + i * (tabW + 10) + tabW / 2;
      const isActive = this.districtFilter === tab.id;

      const tabBg = this.add.graphics();
      tabBg.fillStyle(isActive ? 0x3498db : 0x2c3e50, 1);
      tabBg.fillRoundedRect(x - tabW / 2, tabY, tabW, 30, 6);

      const tabText = this.add.text(x, tabY + 15, tab.label, {
        fontFamily: 'Arial', fontSize: '14px',
        color: isActive ? '#ffffff' : '#7f8c8d',
      }).setOrigin(0.5);

      const hit = this.add.rectangle(x, tabY + 15, tabW, 30).setInteractive().setAlpha(0.001);
      hit.on('pointerup', () => {
        this.districtFilter = tab.id;
        this.scene.restart({ district: tab.id });
      });
    });
  }

  private drawBuildingCards(): void {
    let buildings: BuildingDef[];
    if (this.districtFilter === 'all') {
      buildings = BUILDINGS.filter(b => !this.profile.buildings.includes(b.id));
    } else {
      buildings = getAvailableBuildings(this.districtFilter, this.profile.buildings);
    }

    // Also show owned buildings
    const owned = BUILDINGS.filter(b => this.profile.buildings.includes(b.id));

    const cardW = 220;
    const cardH = 130;
    const cols = 4;
    const gap = 15;
    const startY = 190;

    // Available buildings
    buildings.forEach((building, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const totalRowW = Math.min(buildings.length - row * cols, cols) * (cardW + gap) - gap;
      const rowStartX = (GAME_WIDTH - totalRowW) / 2;
      const x = rowStartX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);

      if (y + cardH > GAME_HEIGHT - 20) return; // off screen

      this.drawBuildingCard(building, x, y, cardW, cardH, false);
    });

    // Owned section
    if (owned.length > 0) {
      const ownedY = startY + (Math.ceil(buildings.length / cols)) * (cardH + gap) + 20;
      if (ownedY < GAME_HEIGHT - 60) {
        this.add.text(GAME_WIDTH / 2, ownedY, 'Owned Buildings', {
          fontFamily: 'Arial', fontSize: '16px', color: '#7f8c8d',
        }).setOrigin(0.5);

        owned.forEach((building, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const totalRowW = Math.min(owned.length - row * cols, cols) * (cardW + gap) - gap;
          const rowStartX = (GAME_WIDTH - totalRowW) / 2;
          const x = rowStartX + col * (cardW + gap);
          const y = ownedY + 25 + row * (cardH + gap);

          if (y + cardH > GAME_HEIGHT - 10) return;
          this.drawBuildingCard(building, x, y, cardW, cardH, true);
        });
      }
    }
  }

  private drawBuildingCard(building: BuildingDef, x: number, y: number, w: number, h: number, owned: boolean): void {
    const canAfford = this.economy.canAfford(building.cost);

    const card = this.add.graphics();
    card.fillStyle(owned ? 0x1a3a2a : 0x2c3e50, 1);
    card.fillRoundedRect(x, y, w, h, 10);
    card.lineStyle(2, owned ? 0x27ae60 : (canAfford ? 0x3498db : 0x555555), 1);
    card.strokeRoundedRect(x, y, w, h, 10);

    // Icon
    this.add.text(x + 25, y + h / 2 - 5, building.icon, { fontSize: '30px' }).setOrigin(0.5);

    // Name
    this.add.text(x + 50, y + 12, building.name, {
      fontFamily: 'Arial Black', fontSize: '14px',
      color: owned ? '#27ae60' : '#ffffff',
    });

    // Description
    this.add.text(x + 50, y + 34, building.description, {
      fontFamily: 'Arial', fontSize: '11px',
      color: '#bdc3c7', wordWrap: { width: w - 60 },
    });

    if (owned) {
      this.add.text(x + w / 2, y + h - 16, 'BUILT', {
        fontFamily: 'Arial Black', fontSize: '12px', color: '#27ae60',
      }).setOrigin(0.5);
    } else {
      // Cost
      const costColor = canAfford ? '#f1c40f' : '#e74c3c';
      this.add.text(x + 50, y + h - 22, `${building.cost} coins`, {
        fontFamily: 'Arial Black', fontSize: '14px', color: costColor,
      });

      // Happiness bonus
      this.add.text(x + w - 15, y + h - 22, `+${building.happinessBonus}😊`, {
        fontFamily: 'Arial', fontSize: '12px', color: '#2ecc71',
      }).setOrigin(1, 0);

      if (canAfford) {
        const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h).setInteractive().setAlpha(0.001);
        hit.on('pointerup', () => this.purchaseBuilding(building));
        hit.on('pointerover', () => {
          card.clear();
          card.fillStyle(0x34495e, 1);
          card.fillRoundedRect(x, y, w, h, 10);
          card.lineStyle(2, 0xf1c40f, 1);
          card.strokeRoundedRect(x, y, w, h, 10);
        });
        hit.on('pointerout', () => {
          card.clear();
          card.fillStyle(0x2c3e50, 1);
          card.fillRoundedRect(x, y, w, h, 10);
          card.lineStyle(2, 0x3498db, 1);
          card.strokeRoundedRect(x, y, w, h, 10);
        });
      }
    }
  }

  private purchaseBuilding(building: BuildingDef): void {
    if (this.economy.spendCoins(building.cost)) {
      this.profile.buildings.push(building.id);
      this.economy.adjustHappiness(building.happinessBonus);
      this.profile.population += 2; // New building attracts villagers
      SaveManager.saveProfile(this.profile);

      // Refresh the scene
      this.scene.restart({ district: this.districtFilter });
    }
  }
}
