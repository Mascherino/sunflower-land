import { GameObjects } from "phaser";
import { PieceConfig } from "../util/PiecesConfig";

export class GamePiece {
  sprite: GameObjects.Sprite;
  config: PieceConfig;
  glow: GameObjects.Sprite | undefined;

  constructor(
    sprite: GameObjects.Sprite,
    config: PieceConfig,
    glow: GameObjects.Sprite | undefined = undefined,
  ) {
    this.sprite = sprite;
    this.config = config;
    this.glow = glow;
  }

  press() {
    this.sprite.setTexture(`${this.config.stem}_pressed`);
    this.glow?.setVisible(true);
  }

  unpress() {
    this.sprite.setTexture(`${this.config.stem}_inactive`);
    this.glow?.setVisible(false);
  }
}
