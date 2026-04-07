import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';
import { PLAYABLE_CHARACTERS } from '../config/characters';
import { SaveManager, type ProfileData } from '../systems/SaveManager';
import { HUD } from '../ui/HUD';

const GEM_COST = 3; // gems per character unlock

export class CharacterShopScene extends Phaser.Scene {
  private profile!: ProfileData;
  private hud!: HUD;

  constructor() {
    super({ key: 'CharacterShopScene' });
  }

  create(): void {
    const profile = SaveManager.getActiveProfile();
    if (!profile) { this.scene.start('ProfileScene'); return; }
    this.profile = profile;

    this.cameras.main.fadeIn(300);

    this.drawBackground();
    this.drawCharacterGrid();

    this.hud = new HUD(this);
    this.hud.update(this.profile);

    // Back button
    const backBtn = this.add.text(60, 65, '< Village', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive();
    backBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start('VillageScene'));
    });
  }

  private drawBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Sparkles
    const sparkle = this.add.graphics();
    sparkle.fillStyle(0xffffff, 0.2);
    for (let i = 0; i < 40; i++) {
      sparkle.fillCircle(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 2 + 1);
    }

    this.add.text(GAME_WIDTH / 2, 80, 'Character Shop', {
      fontFamily: 'Arial Black', fontSize: '36px',
      color: '#f1c40f', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Gem counter
    const totalGems = this.profile.gems.ruby + this.profile.gems.emerald + this.profile.gems.sapphire;
    this.add.text(GAME_WIDTH / 2, 120, `💎 Gems: ${totalGems}`, {
      fontFamily: 'Arial', fontSize: '18px',
      color: '#e8daef', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);
  }

  private drawCharacterGrid(): void {
    const cardW = 140;
    const cardH = 170;
    const cols = 6;
    const gap = 15;
    const startX = (GAME_WIDTH - (cols * (cardW + gap) - gap)) / 2;
    const startY = 160;

    // Starter characters (always unlocked)
    this.add.text(startX, startY - 10, 'Starter Characters', {
      fontFamily: 'Arial', fontSize: '16px', color: '#bdc3c7',
    });

    const starters = PLAYABLE_CHARACTERS.filter(c => !c.unlockCondition);
    const mythicals = PLAYABLE_CHARACTERS.filter(c => c.unlockCondition);

    starters.forEach((char, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gap);
      const y = startY + 20 + row * (cardH + gap);

      this.drawCharacterCard(x, y, cardW, cardH, char, true);
    });

    // Mythical characters (unlockable)
    const mythStartY = startY + 20 + Math.ceil(starters.length / cols) * (cardH + gap) + 20;
    this.add.text(startX, mythStartY - 10, 'Mythical Characters (unlock with gems)', {
      fontFamily: 'Arial', fontSize: '16px', color: '#e8daef',
    });

    mythicals.forEach((char, i) => {
      const col = i % cols;
      const x = startX + col * (cardW + gap);
      const y = mythStartY + 20;

      const isUnlocked = this.profile.unlockedCharacters.includes(char.id);
      this.drawCharacterCard(x, y, cardW, cardH, char, isUnlocked);
    });
  }

  private drawCharacterCard(
    x: number, y: number, w: number, h: number,
    char: typeof PLAYABLE_CHARACTERS[0],
    unlocked: boolean
  ): void {
    const isEquipped = this.profile.characterId === char.id;

    const card = this.add.graphics();
    card.fillStyle(unlocked ? 0x2c3e50 : 0x1a1a2e, 1);
    card.fillRoundedRect(x, y, w, h, 10);
    card.lineStyle(2, isEquipped ? 0xf1c40f : unlocked ? 0x3498db : 0x555555, 1);
    card.strokeRoundedRect(x, y, w, h, 10);

    // Character avatar
    const avatar = this.add.image(x + w / 2, y + 50, `char_${char.id}`);
    avatar.setScale(unlocked ? 2 : 1.5);
    if (!unlocked) avatar.setAlpha(0.4);

    // Name
    this.add.text(x + w / 2, y + 95, char.name, {
      fontFamily: 'Arial', fontSize: '14px',
      color: unlocked ? '#ffffff' : '#777777',
    }).setOrigin(0.5);

    // Personality
    this.add.text(x + w / 2, y + 115, char.personality, {
      fontFamily: 'Arial', fontSize: '12px',
      color: unlocked ? '#bdc3c7' : '#555555',
    }).setOrigin(0.5);

    if (isEquipped) {
      this.add.text(x + w / 2, y + h - 20, '★ Equipped', {
        fontFamily: 'Arial Black', fontSize: '12px', color: '#f1c40f',
      }).setOrigin(0.5);
    } else if (unlocked) {
      // Equip button
      const equipBtn = this.add.text(x + w / 2, y + h - 20, 'Equip', {
        fontFamily: 'Arial', fontSize: '13px', color: '#2ecc71',
        backgroundColor: '#1a3a2a', padding: { x: 12, y: 3 },
      }).setOrigin(0.5).setInteractive();

      equipBtn.on('pointerup', () => {
        this.profile.characterId = char.id;
        SaveManager.saveProfile(this.profile);
        this.scene.restart();
      });
    } else {
      // Unlock button
      const totalGems = this.profile.gems.ruby + this.profile.gems.emerald + this.profile.gems.sapphire;
      const canAfford = totalGems >= GEM_COST;

      const unlockBtn = this.add.text(x + w / 2, y + h - 20,
        canAfford ? `💎 ${GEM_COST} Unlock` : `💎 ${GEM_COST} (need more)`, {
        fontFamily: 'Arial', fontSize: '11px',
        color: canAfford ? '#e8daef' : '#555555',
        backgroundColor: canAfford ? '#6c3483' : '#1a1a2e',
        padding: { x: 8, y: 3 },
      }).setOrigin(0.5);

      if (canAfford) {
        unlockBtn.setInteractive();
        unlockBtn.on('pointerup', () => {
          // Spend gems (prioritize: ruby, emerald, sapphire)
          let remaining = GEM_COST;
          for (const gemType of ['ruby', 'emerald', 'sapphire'] as const) {
            const deduct = Math.min(remaining, this.profile.gems[gemType]);
            this.profile.gems[gemType] -= deduct;
            remaining -= deduct;
            if (remaining <= 0) break;
          }

          this.profile.unlockedCharacters.push(char.id);
          SaveManager.saveProfile(this.profile);
          this.scene.restart();
        });
      }
    }
  }
}
