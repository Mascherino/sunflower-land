import { GameObjects } from "phaser";
import { PieceConfig } from "../util/PiecesConfig";

export class GamePiece {
  sprite: GameObjects.Sprite;
  config: PieceConfig;
  sound: Phaser.Sound.BaseSound;
  glow: GameObjects.Sprite | undefined;
  tweens: Phaser.Tweens.Tween[];

  constructor(
    sprite: GameObjects.Sprite,
    config: PieceConfig,
    sound: Phaser.Sound.BaseSound,
    glow: GameObjects.Sprite | undefined = undefined,
    tweens: Phaser.Tweens.Tween[] = [],
  ) {
    this.sprite = sprite;
    this.config = config;
    this.sound = sound;
    this.glow = glow;
    this.tweens = tweens;
  }

  press() {
    this.sprite.setTexture(`${this.config.stem}_pressed`);
    this.glow?.setVisible(true);
    this.sound.play();
  }

  unpress() {
    this.sprite.setTexture(`${this.config.stem}_inactive`);
    this.glow?.setVisible(false);
    // this.sound.stop();
  }
}
