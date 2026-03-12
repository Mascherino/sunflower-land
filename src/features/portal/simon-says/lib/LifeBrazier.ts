import { SimonSaysScene } from "../SimonSaysScene";
import { Brazier } from "./Brazier";

export class LifeBrazier extends Brazier {
  constructor(
    sprite: Phaser.GameObjects.Sprite,
    x: number,
    y: number,
    fire: Phaser.GameObjects.Sprite,
    light?: Phaser.GameObjects.Light,
  ) {
    super(sprite, x, y, fire, light);
  }

  turnOff(): void {
    this.sprite.stop().play("life_brazier_inactive_anim");
    this.fire
      .stop()
      .play("life_brazier_fire_inactive_anim")
      .on(
        "animationupdate",
        (
          _anim: Phaser.Animations.Animation,
          frame: Phaser.Animations.AnimationFrame,
        ) => {
          if (frame.index === 4) {
            (this.sprite.scene as SimonSaysScene).SOUNDS.extinguish?.play();
          }
          if (frame.index === 6) {
            this.turnOffLight();
            this.fire.removeListener("animationupdate");
          }
        },
      );
  }
}
