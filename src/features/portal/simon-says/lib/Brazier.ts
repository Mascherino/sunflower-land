import { SimonSaysScene } from "../SimonSaysScene";
import { BRAZIER_LIGHT_COLOR } from "../util/Constants";

export class Brazier {
  sprite: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
  fire: Phaser.GameObjects.Sprite;
  light?: Phaser.GameObjects.Light;

  constructor(
    sprite: Phaser.GameObjects.Sprite,
    x: number,
    y: number,
    fire: Phaser.GameObjects.Sprite,
    light?: Phaser.GameObjects.Light,
  ) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.fire = fire;
    light ? (this.light = light) : (this.light = undefined);
  }

  turnOn(): void {
    this.light ? this.light.setVisible(true) : undefined;
  }

  protected turnOffLight(): void {
    // this.light ? this.light.setVisible(false) : undefined;
    if (!this.light) return;
    const start = Phaser.Display.Color.ValueToColor(BRAZIER_LIGHT_COLOR);
    const end = Phaser.Display.Color.ValueToColor(0x000000);

    const rgb = { r: start.red, g: start.green, b: start.blue };

    this.sprite.scene.tweens.add({
      targets: rgb,
      r: end.red,
      g: end.green,
      b: end.blue,
      duration: 200,
      onUpdate: () => {
        this.light!.setColor(
          Phaser.Display.Color.GetColor(rgb.r, rgb.g, rgb.b),
        );
      },
    });
  }

  turnOff(): void {
    this.sprite.stop().play("brazier_inactive_anim");
    this.fire
      .stop()
      .play("brazier_fire_inactive_anim")
      .on(
        "animationupdate",
        (
          _anim: Phaser.Animations.Animation,
          frame: Phaser.Animations.AnimationFrame,
        ) => {
          if (frame.index == 4) {
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
