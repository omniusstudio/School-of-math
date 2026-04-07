import Phaser from 'phaser';

export interface DialogLine {
  speaker: string;
  text: string;
  portrait?: string; // texture key for NPC portrait
}

export class DialogBox {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private nameText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private portrait!: Phaser.GameObjects.Image;
  private continueText!: Phaser.GameObjects.Text;
  private lines: DialogLine[] = [];
  private currentLine: number = 0;
  private onComplete?: () => void;
  private isVisible: boolean = false;
  private boxWidth: number;
  private boxHeight: number;
  private boxX: number;
  private boxY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.boxWidth = 700;
    this.boxHeight = 140;
    this.boxX = (scene.scale.width - this.boxWidth) / 2;
    this.boxY = scene.scale.height - this.boxHeight - 20;
    this.create();
  }

  private create(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(900);

    // Background
    this.bgGraphics = this.scene.add.graphics();
    this.bgGraphics.fillStyle(0x1a1a2e, 0.92);
    this.bgGraphics.fillRoundedRect(this.boxX, this.boxY, this.boxWidth, this.boxHeight, 14);
    this.bgGraphics.lineStyle(3, 0xf1c40f, 0.8);
    this.bgGraphics.strokeRoundedRect(this.boxX, this.boxY, this.boxWidth, this.boxHeight, 14);
    this.container.add(this.bgGraphics);

    // Portrait
    this.portrait = this.scene.add.image(this.boxX + 55, this.boxY + this.boxHeight / 2, '');
    this.portrait.setScale(2.2);
    this.container.add(this.portrait);

    // Speaker name
    this.nameText = this.scene.add.text(this.boxX + 110, this.boxY + 14, '', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#f1c40f',
    });
    this.container.add(this.nameText);

    // Body text
    this.bodyText = this.scene.add.text(this.boxX + 110, this.boxY + 42, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      color: '#ecf0f1',
      wordWrap: { width: this.boxWidth - 140 },
      lineSpacing: 4,
    });
    this.container.add(this.bodyText);

    // Continue indicator
    this.continueText = this.scene.add.text(
      this.boxX + this.boxWidth - 20,
      this.boxY + this.boxHeight - 22,
      'Tap to continue ▸',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#7f8c8d',
      }
    ).setOrigin(1, 0.5);
    this.container.add(this.continueText);

    // Blink animation on continue text
    this.scene.tweens.add({
      targets: this.continueText,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // Click anywhere to advance
    const hitZone = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height
    ).setInteractive().setAlpha(0.001);
    this.container.add(hitZone);

    hitZone.on('pointerup', () => {
      if (this.isVisible) this.advance();
    });

    this.container.setVisible(false);
  }

  show(lines: DialogLine[], onComplete?: () => void): void {
    this.lines = lines;
    this.currentLine = 0;
    this.onComplete = onComplete;
    this.isVisible = true;
    this.container.setVisible(true);
    this.displayCurrentLine();
  }

  private displayCurrentLine(): void {
    const line = this.lines[this.currentLine];
    if (!line) return;

    this.nameText.setText(line.speaker);
    this.bodyText.setText(line.text);

    if (line.portrait) {
      this.portrait.setTexture(line.portrait);
      this.portrait.setVisible(true);
    } else {
      this.portrait.setVisible(false);
    }

    const isLast = this.currentLine >= this.lines.length - 1;
    this.continueText.setText(isLast ? 'Tap to close ▸' : 'Tap to continue ▸');
  }

  private advance(): void {
    this.currentLine++;
    if (this.currentLine >= this.lines.length) {
      this.hide();
      if (this.onComplete) this.onComplete();
    } else {
      this.displayCurrentLine();
    }
  }

  hide(): void {
    this.isVisible = false;
    this.container.setVisible(false);
  }

  destroy(): void {
    this.container.destroy();
  }
}
