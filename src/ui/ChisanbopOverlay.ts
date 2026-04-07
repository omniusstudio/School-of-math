import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/game-config';

/**
 * Chisanbop finger counting overlay.
 * Left hand: each finger = 1 (up to 5). Thumb down = 5.
 * Right hand: each finger = 1 (up to 5). Thumb down = 5.
 * Total range: 0-99 (left hand = tens, right hand = ones)
 * For K-5 we simplify: both hands count 0-10 each, total 0-20.
 */

const FINGER_POSITIONS = {
  // Left hand (ones: 0-5)
  left: [
    { x: -120, y: 0, label: '5', isThumb: true },  // thumb = 5
    { x: -160, y: -60, label: '1', isThumb: false }, // index
    { x: -140, y: -80, label: '1', isThumb: false }, // middle
    { x: -115, y: -75, label: '1', isThumb: false }, // ring
    { x: -90, y: -60, label: '1', isThumb: false },  // pinky
  ],
  // Right hand (ones: 0-5)
  right: [
    { x: 120, y: 0, label: '5', isThumb: true },
    { x: 90, y: -60, label: '1', isThumb: false },
    { x: 115, y: -80, label: '1', isThumb: false },
    { x: 140, y: -75, label: '1', isThumb: false },
    { x: 160, y: -60, label: '1', isThumb: false },
  ],
};

export class ChisanbopOverlay {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private totalText: Phaser.GameObjects.Text;
  private fingerStates: boolean[] = []; // 10 fingers, false = up, true = down
  private visible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.fingerStates = new Array(10).fill(false);
    this.container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
    this.container.setDepth(1500);
    this.container.setVisible(false);

    this.drawOverlay();
    this.totalText = scene.add.text(0, 60, '0', {
      fontFamily: 'Arial Black', fontSize: '48px',
      color: '#f1c40f', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.container.add(this.totalText);
  }

  private drawOverlay(): void {
    // Semi-transparent background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-220, -120, 440, 240, 20);
    this.container.add(bg);

    // Title
    const title = this.scene.add.text(0, -100, '✋ Chisanbop Counter ✋', {
      fontFamily: 'Arial Black', fontSize: '18px',
      color: '#f1c40f',
    }).setOrigin(0.5);
    this.container.add(title);

    // Hand outlines
    const handG = this.scene.add.graphics();
    // Left palm
    handG.fillStyle(0xf5cba7, 0.3);
    handG.fillEllipse(-130, 10, 80, 50);
    // Right palm
    handG.fillEllipse(130, 10, 80, 50);
    this.container.add(handG);

    // Draw fingers
    const allPositions = [...FINGER_POSITIONS.left, ...FINGER_POSITIONS.right];

    allPositions.forEach((pos, i) => {
      const fingerG = this.scene.add.graphics();
      const radius = pos.isThumb ? 16 : 13;

      // Finger (up state = lighter)
      fingerG.fillStyle(0xf5cba7, 1);
      fingerG.fillCircle(pos.x, pos.y, radius);
      fingerG.lineStyle(2, 0xd4a574, 1);
      fingerG.strokeCircle(pos.x, pos.y, radius);

      this.container.add(fingerG);

      // Value label
      const label = this.scene.add.text(pos.x, pos.y, pos.isThumb ? '5' : '1', {
        fontFamily: 'Arial Black', fontSize: '12px', color: '#8b4513',
      }).setOrigin(0.5);
      this.container.add(label);

      // Interactive hit area
      const hit = this.scene.add.circle(pos.x, pos.y, radius + 5)
        .setInteractive().setAlpha(0.001);
      this.container.add(hit);

      hit.on('pointerup', () => {
        this.fingerStates[i] = !this.fingerStates[i];

        if (this.fingerStates[i]) {
          // Down state (counting)
          fingerG.clear();
          fingerG.fillStyle(0xe67e22, 1);
          fingerG.fillCircle(pos.x, pos.y + 5, radius);
          fingerG.lineStyle(2, 0xd35400, 1);
          fingerG.strokeCircle(pos.x, pos.y + 5, radius);
          label.setY(pos.y + 5);
          label.setColor('#ffffff');
        } else {
          // Up state
          fingerG.clear();
          fingerG.fillStyle(0xf5cba7, 1);
          fingerG.fillCircle(pos.x, pos.y, radius);
          fingerG.lineStyle(2, 0xd4a574, 1);
          fingerG.strokeCircle(pos.x, pos.y, radius);
          label.setY(pos.y);
          label.setColor('#8b4513');
        }

        this.updateTotal();
      });
    });

    // Close button
    const closeBtn = this.scene.add.text(200, -100, '✕', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#e74c3c',
    }).setOrigin(0.5).setInteractive();
    this.container.add(closeBtn);
    closeBtn.on('pointerup', () => this.hide());

    // Reset button
    const resetBtn = this.scene.add.text(0, 100, 'Reset', {
      fontFamily: 'Arial', fontSize: '14px', color: '#3498db',
      backgroundColor: '#1a1a2e', padding: { x: 10, y: 4 },
    }).setOrigin(0.5).setInteractive();
    this.container.add(resetBtn);
    resetBtn.on('pointerup', () => this.reset());
  }

  private updateTotal(): void {
    let total = 0;

    // Left hand
    for (let i = 0; i < 5; i++) {
      if (this.fingerStates[i]) {
        total += FINGER_POSITIONS.left[i].isThumb ? 5 : 1;
      }
    }

    // Right hand
    for (let i = 5; i < 10; i++) {
      if (this.fingerStates[i]) {
        total += FINGER_POSITIONS.right[i - 5].isThumb ? 5 : 1;
      }
    }

    this.totalText.setText(`${total}`);
  }

  reset(): void {
    this.fingerStates.fill(false);
    this.totalText.setText('0');
    // Note: visual reset would need to redraw fingers.
    // For simplicity, hide and re-show
    this.container.setVisible(false);
    this.container.setVisible(this.visible);
  }

  show(): void {
    this.visible = true;
    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1, duration: 200,
    });
  }

  hide(): void {
    this.visible = false;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0, duration: 200,
      onComplete: () => this.container.setVisible(false),
    });
  }

  toggle(): void {
    if (this.visible) this.hide();
    else this.show();
  }

  isVisible(): boolean {
    return this.visible;
  }

  getTotal(): number {
    let total = 0;
    for (let i = 0; i < 5; i++) {
      if (this.fingerStates[i]) {
        total += FINGER_POSITIONS.left[i].isThumb ? 5 : 1;
      }
    }
    for (let i = 5; i < 10; i++) {
      if (this.fingerStates[i]) {
        total += FINGER_POSITIONS.right[i - 5].isThumb ? 5 : 1;
      }
    }
    return total;
  }
}
