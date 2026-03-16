import { SimonSaysScene } from "../SimonSaysScene";
import { SQUARE_WIDTH } from "features/game/lib/constants";

import {
  AMBIENT_COLOR,
  blinkDuration,
  BRAZIER_LIGHT_COLOR,
  BRAZIER_LIGHT_INTENSITY,
  DEFAULT_SEQUENCE_LENGTH,
  defaultBgmVolume,
  defaultEffectsVolume,
  GAME_LIGHT_COLOR,
  IMAGE_SCALE,
  LIFEBRAZER_LIGHT_RADIUS,
} from "../util/Constants";
import { EventObject } from "xstate";
import { EventBus } from "./EventBus";
import { EVENTS } from "./Events";
import { getChaacsTempleSettings } from "../util/useSettings";
import { ChaacsTempleSettings } from "./Settings";
import { piecesConfig } from "../util/PiecesConfig";
import { randomInt } from "lib/utils/random";
import {
  delay,
  getHumiliatingPhrase,
  getImpressedPhrase,
  hasBoughtLowerThreshold,
  speak,
} from "../util/Utils";
import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { placeBraziers } from "./braziers";
import { LightName } from "./lights";
import { Brazier } from "./Brazier";
import { GamePiece } from "./GamePiece";
import { LifeBrazier } from "./LifeBrazier";

export class SimonSays {
  private pieces: GamePiece[] = [];
  private scene: SimonSaysScene;
  private duration = 0;
  private targetScore = 0;
  private lives = 3;
  private braziers: Partial<Record<LightName, Brazier>> = {};
  private lifeBraziers: Partial<Record<LightName, LifeBrazier>> = {};
  private lifeBrazierOrder: LightName[] = [];
  private gameLight: Phaser.GameObjects.Light | undefined = undefined;
  private predefinedSequence: number[] = [];
  private currLength: number = 3;
  private scoreThreshold: number = 6;
  private lostLifePrev: boolean = false;
  private startLength: number = 0;

  private bumpkin?: BumpkinContainer | undefined = undefined;
  private bumpkinPedastal?: Phaser.GameObjects.Sprite | undefined = undefined;
  private npc: BumpkinContainer | undefined = undefined;
  private deathSprite: Phaser.GameObjects.Sprite | undefined = undefined;
  private currentSequence: number[] = [];
  private hintListener: ((event: EventObject) => void) | null = null;
  static current: SimonSays | null = null;
  public settings: ChaacsTempleSettings = getChaacsTempleSettings();
  constructor(scene: SimonSaysScene) {
    this.scene = scene;

    this.setupSounds();

    SimonSays.current = this;
    EventBus.emitter
      .removeAllListeners("SETTINGS_CHANGED")
      .on("SETTINGS_CHANGED", (x) => {
        const event = x as EVENTS["SETTINGS_CHANGED"];
        this.handleSettingsUpdate(event);
      });
  }

  handleSettingsUpdate(settings: EVENTS["SETTINGS_CHANGED"]) {
    const oldSettings = getChaacsTempleSettings();

    // Background music
    const newBgmMuted = settings.Music?.isMuted ?? !!oldSettings.Music?.isMuted;
    const newBgmVolume =
      settings.Music?.volume ?? oldSettings.Music?.volume ?? defaultBgmVolume;
    this.scene.SOUNDS.background?.setMute(newBgmMuted);
    if (!newBgmMuted) this.scene.SOUNDS.background?.setVolume(newBgmVolume);

    // Sound effects
    const newEffectsMuted =
      settings.Effects?.isMuted ?? !!oldSettings.Effects?.isMuted;
    const newEffectsVolume =
      settings.Effects?.volume ??
      oldSettings.Effects?.volume ??
      defaultEffectsVolume;

    ["extinguish", "thunder", "pieces"].forEach((key) => {
      const sound = this.scene.SOUNDS[key as keyof typeof this.scene.SOUNDS];
      if (sound instanceof Phaser.Sound.BaseSound) {
        sound?.setVolume(newEffectsVolume);
        sound?.setMute(newEffectsMuted);
      } else {
        Object.keys(this.scene.SOUNDS.pieces!).forEach((key) => {
          const sound =
            this.scene.SOUNDS.pieces[
              key as keyof typeof this.scene.SOUNDS.pieces
            ];
          sound.setVolume(newEffectsVolume);
          sound.setMute(newEffectsMuted);
        });
      }
    });
    this.settings = { ...oldSettings };
  }

  setupSounds() {
    this.scene.SOUNDS.background?.setMute(!!this.settings.Music?.isMuted);
    this.scene.SOUNDS.background?.play({
      volume: this.settings.Music?.volume ?? defaultBgmVolume,
      loop: true,
      rate: 1.0,
    });

    const effectsVolume = this.settings.Effects?.volume ?? defaultEffectsVolume;
    const effectsIsMuted = !!this.settings.Effects?.isMuted;
    ["extinguish", "thunder", "pieces"].forEach((key) => {
      const sound = this.scene.SOUNDS[key as keyof typeof this.scene.SOUNDS];
      if (sound instanceof Phaser.Sound.BaseSound) {
        sound?.setVolume(effectsVolume);
        sound?.setMute(effectsIsMuted);
      } else {
        Object.keys(this.scene.SOUNDS.pieces!).forEach((key) => {
          const sound =
            this.scene.SOUNDS.pieces[
              key as keyof typeof this.scene.SOUNDS.pieces
            ];
          sound.setVolume(effectsVolume);
          sound.setMute(effectsIsMuted);
        });
      }
    });
  }

  public async newGame() {
    let prize = this.scene.gameState.minigames.prizes["chaacs-temple"];

    // Remove after testing
    const context = this.scene.portalService?.getSnapshot().context;
    const testScore = context?.testScore ?? 0;
    if (testScore > 0) {
      prize = {
        coins: 0,
        endAt: context!.endAt,
        startAt: context!.startAt,
        score: testScore,
        items: {},
        wearables: {},
      };
    }
    this.lives = 3;
    this.startLength = DEFAULT_SEQUENCE_LENGTH;
    switch (prize?.score) {
      case 3.6:
        this.targetScore = 3;
        this.scoreThreshold = 6;
        break;
      case 3.7:
        this.startLength = 4;
        this.targetScore = 3;
        this.scoreThreshold = 7;
        break;
      case 3.8:
        this.startLength = 5;
        this.targetScore = 3;
        this.scoreThreshold = 8;
        break;
      case 3.9:
        this.startLength = 6;
        this.targetScore = 3;
        this.scoreThreshold = 9;
        break;
      case 3.1:
        this.startLength = 7;
        this.targetScore = 3;
        this.scoreThreshold = 10;
        break;
      default:
        this.targetScore = 3;
        this.scoreThreshold = 6;
        this.duration = 60000 * 10000;
    }
    const minigame =
      this.scene.portalService?.getSnapshot().context.state?.minigames.games[
        "chaacs-temple"
      ];
    if (hasBoughtLowerThreshold(minigame) && this.scoreThreshold > 6)
      this.scoreThreshold--;
    this.currLength = this.startLength;
    this.scene.locked = false;

    this.cleanGame();

    this.hintListener = (event) => {
      if (event.type === "BUY_HINT") {
        const game = SimonSays.current;
        if (!game) return;
        const sequence = game.currentSequence;
        if (sequence.length <= 0) return;
        const nextSequencePiece = sequence[0];
        const nextPiece = this.pieces[nextSequencePiece];
        nextPiece.glow?.setAlpha(0);
        nextPiece.glow?.setVisible(true);
        try {
          const tween = game.scene.tweens.add({
            targets: nextPiece.glow,
            alpha: 1,
            duration: 150,
            yoyo: true,
            loop: Infinity,
            ease: "Linear",
          });
          if (nextPiece.tweens.length == 0) nextPiece.tweens.push(tween);
        } catch (err) {
          window.location.reload();
        }
      } else if (event.type === "BUY_THRESHOLD") {
        const game = SimonSays.current;
        if (!game) return;
        if (this.scoreThreshold > 6) this.scoreThreshold--;
        this.scene.portalService?.send("LOWER_THRESHOLD", {
          totalLength: this.scoreThreshold,
        });
      }
    };
    this.scene.portalService?.onEvent(this.hintListener);

    // Keep track of listeners to remove when doing HMR
    this.scene.portalService?._listeners.add(this.hintListener);

    this.predefinedSequence = Array.from({ length: this.scoreThreshold }, () =>
      randomInt(0, this.pieces.length),
    );
    this.lostLifePrev = false;

    if (this.scene.isReady) {
      this.scene.portalService?.send("START", {
        duration: this.duration,
        targetScore: this.targetScore,
        lives: this.lives,
        totalLength: this.scoreThreshold,
        currentLength: this.currLength,
      });
    }

    await this.drawGame();
  }

  /**
   * Kill all tweens, clean and destroy board container, reset game variables
   */
  public cleanGame() {
    // this.scene.tweens.killAll();
    if (this.hintListener) this.scene.portalService?.off(this.hintListener);
    this.hintListener = null;
    if (this.deathSprite) this.deathSprite.destroy(true);
    this.scene.SOUNDS.thunder.stop();
  }

  public cleanPregame() {
    this.pieces.forEach((piece) => {
      piece.sprite.destroy(true);
    });
    this.pieces = [];

    Object.values(this.lifeBraziers).forEach((brazier) => {
      brazier.sprite.destroy(true);
      brazier.fire.destroy(true);
    });
    this.lifeBraziers = {};
    Object.values(this.braziers).forEach((brazier) => {
      brazier.sprite.destroy(true);
      brazier.fire.destroy(true);
    });

    this.npc?.destroy();
    this.bumpkin?.destroy();
    this.deathSprite?.destroy();

    [...this.scene.lights.lights].forEach((light) =>
      this.scene.lights.removeLight(light),
    );
    this.bumpkin?.destroy(true);
    this.npc?.destroy(true);
  }

  drawPregame() {
    Object.values(piecesConfig).forEach((value) => {
      const x = (this.scene.map.width / 2 + value.xOffset) * SQUARE_WIDTH;
      const y = (this.scene.map.height / 2 + value.yOffset) * SQUARE_WIDTH;
      const img = this.scene.add.sprite(x, y, `${value.stem}${value.suffix}`);
      const sound =
        this.scene.SOUNDS.pieces[
          `${value.stem}` as keyof typeof this.scene.SOUNDS.pieces
        ];
      const piece = new GamePiece(img, value, sound);
      img
        .setScale(IMAGE_SCALE - 0.07)
        .setInteractive({ useHandCursor: true, pixelPerfect: true })
        .on("pointerdown", async () => await this.handlePointerDown(piece))
        .on("pointerup", async () => await this.handlePointerUp(piece))
        .on("pointerout", async () => await this.handlePointerUp(piece))
        .setDepth(10)
        .setPipeline("Light2D");
      this.pieces.push(piece);
      piece.glow = this.scene.add
        .sprite(x, y, `${value.stem}_glow`)
        .setScale(IMAGE_SCALE - 0.07)
        .setVisible(false)
        .setDepth(5)
        .setBlendMode(Phaser.BlendModes.ADD);
    });
    this.scene.add
      .sprite(
        (this.scene.map.width / 2) * SQUARE_WIDTH,
        (this.scene.map.height / 2) * SQUARE_WIDTH,
        "frame",
      )
      .setPipeline("Light2D")
      .setScale(IMAGE_SCALE - 0.05)
      .setDepth(1);

    // Lighting
    this.scene.lights.enable();
    this.scene.lights.setAmbientColor(AMBIENT_COLOR);
    this.gameLight = this.scene.lights.addLight(
      (this.scene.map.width / 2) * SQUARE_WIDTH,
      (this.scene.map.height / 2) * SQUARE_WIDTH,
      180,
      GAME_LIGHT_COLOR,
      0.75,
    );

    this.braziers = placeBraziers(this.scene);
    // LifeBraziers
    this.lifeBrazierOrder = [
      "lifeBrazier_left",
      "lifeBrazier_middle",
      "lifeBrazier_right",
    ];
    let i = -1;
    while (i < this.lives - 1) {
      const x = (this.scene.map.width / 2 + 4 * i) * SQUARE_WIDTH;
      const y = (this.scene.map.height / 2 - 7.5) * SQUARE_WIDTH;

      const sprite = this.scene.add
        .sprite(x, y, "life_brazier_active")
        .setPipeline("Light2D");
      const fire = this.scene.add
        .sprite(x, y - 10, "life_brazier_fire_active")
        .setPipeline("Light2D")
        .play({ key: "life_brazier_fire_active_anim", randomFrame: true });
      const light = this.scene.lights.addLight(
        x,
        y,
        LIFEBRAZER_LIGHT_RADIUS,
        BRAZIER_LIGHT_COLOR,
        BRAZIER_LIGHT_INTENSITY - 0.4,
      );
      sprite.play("life_brazier_active_anim");

      this.lifeBraziers[this.lifeBrazierOrder[i + 1]] = new LifeBrazier(
        sprite,
        x,
        y,
        fire,
        light,
      );
      i++;
    }

    this.scene.add
      .image(
        (this.scene.map.width / 2 - 1) * SQUARE_WIDTH,
        (this.scene.map.width / 2 + 2) * SQUARE_WIDTH,
        "bonepile",
      )
      .setPipeline("Light2D");

    this.scene.add
      .image(
        (this.scene.map.width / 2 - 6) * SQUARE_WIDTH,
        (this.scene.map.width / 2 + 2) * SQUARE_WIDTH,
        "headpole",
      )
      .setPipeline("Light2D");

    this.scene.add
      .image(
        (this.scene.map.width / 2 + 6) * SQUARE_WIDTH,
        (this.scene.map.width / 2 + 2) * SQUARE_WIDTH,
        "headpole",
      )
      .setFlipX(true)
      .setPipeline("Light2D");

    this.bumpkinPedastal = this.scene.add
      .sprite(
        (this.scene.map.width / 2 + 4) * SQUARE_WIDTH,
        (this.scene.map.width / 2 + 1) * SQUARE_WIDTH,
        "pedastal",
      )
      .setPipeline("Light2D");

    this.scene.add
      .image(
        (this.scene.map.width / 2 - 4) * SQUARE_WIDTH,
        (this.scene.map.width / 2 + 1) * SQUARE_WIDTH,
        "pedastal",
      )
      .setFlipX(true)
      .setPipeline("Light2D");

    const gamestate = this.scene.gameState;
    this.bumpkin = new BumpkinContainer({
      scene: this.scene,
      x: (this.scene.map.width / 2 + 4) * SQUARE_WIDTH,
      y: (this.scene.map.height / 2 + 5.75) * SQUARE_WIDTH,
      clothing: {
        ...gamestate.bumpkin.equipped,
        aura: undefined,
        updatedAt: Date.now(),
      },
      direction: "left",
      username: gamestate.username,
    });

    this.npc = new BumpkinContainer({
      scene: this.scene,
      x: (this.scene.map.width / 2 - 4) * SQUARE_WIDTH,
      y: (this.scene.map.height / 2 + 5.75) * SQUARE_WIDTH,
      clothing: {
        ...gamestate.bumpkin.equipped,
        aura: undefined,
        onesie: "Maya Armor",
        updatedAt: Date.now(),
      },
      direction: "right",
    });
    this.npc.setDepth(30);
  }

  private async handlePointerDown(piece: GamePiece) {
    if (this.scene.locked) return;
    piece.press();
  }

  private async handlePointerUp(piece: GamePiece) {
    if (this.scene.locked) return;

    // Ignore calls from pointerout event when piece is not pressed
    if (piece.sprite.texture.key == `${piece.config.stem}_pressed`) {
      this.scene.locked = true;
      // Remove hint tween from all pieces
      this.pieces.forEach((piece) =>
        piece.tweens.forEach((tween) => {
          tween.on("complete", () => {
            piece.glow?.setVisible(false);
            piece.glow?.setAlpha(1);
            piece.tweens = [];
          });
          tween.completeAfterLoop(0);
        }),
      );

      piece.unpress();
      const idx = this.pieces.findIndex(
        (value) => value.config == piece.config,
      );
      let score = this.scene.score;
      let lives = this.scene.lives;
      if (idx == this.currentSequence[0]) {
        this.currentSequence.shift();

        // Empty sequence == reached score threshold
        if (this.currentSequence.length === 0) {
          if (this.currLength >= this.scoreThreshold) {
            score = score + 1;
            speak(this.npc!, getImpressedPhrase(score), 2500);
            if (!this.lostLifePrev) {
              this.scoreThreshold++;
            }
            this.lostLifePrev = false;
            this.currLength = this.startLength;
            this.predefinedSequence = Array.from(
              { length: this.scoreThreshold },
              () => randomInt(0, this.pieces.length),
            );
          } else {
            this.currLength++;
          }
        }
        const solved = score == this.scene.targetScore;
        this.scene.portalService?.send("MAKE_MOVE", {
          score: score,
          lives: lives,
          solved: solved,
          totalLength: this.scoreThreshold,
          currentLength: this.currLength,
        });
        if (this.currentSequence.length === 0) {
          await delay(1000);
          await this.blinkSequence();
        }
      } else {
        lives = lives - 1;
        this.lostLifePrev = true;
        this.scene.portalService?.send("MAKE_MOVE", {
          score: score,
          lives: lives,
          solved: false,
          totalLength: this.scoreThreshold,
          currentLength: this.currLength,
        });
        speak(this.npc!, getHumiliatingPhrase(score), 2500);
        const name = this.lifeBrazierOrder[this.lives - lives - 1];
        this.lifeBraziers[name]?.turnOff();
        if (this.scene.lives <= 0) {
          this.pieces.forEach((piece) => piece.sprite.disableInteractive(true));
          await delay(500);
          await this.turnOffBraziers();
          await delay(500);
          await this.turnOffGameLight();
          await delay(1000);
          this.lightningStrike();
          return;
        }
        await delay(1000);
        await this.blinkSequence();
      }
      this.scene.locked = false;
    }
  }

  private async turnOffBraziers() {
    this.braziers.brazier_lefttop?.turnOff();
    this.braziers.brazier_righttop?.turnOff();

    await delay(750);
    this.braziers.brazier_leftbottom?.turnOff();
    this.braziers.brazier_rightbottom?.turnOff();

    await delay(750);
    this.braziers.brazier_bottomleft?.turnOff();
    this.braziers.brazier_bottomright?.turnOff();
  }

  private async turnOffGameLight() {
    if (!this.gameLight) return;
    const start = Phaser.Display.Color.ValueToColor(BRAZIER_LIGHT_COLOR);
    const end = Phaser.Display.Color.ValueToColor(0x000000);

    const rgb = { r: start.red, g: start.green, b: start.blue };

    this.scene.tweens.add({
      targets: rgb,
      r: end.red,
      g: end.green,
      b: end.blue,
      duration: 200,
      onUpdate: () => {
        this.gameLight!.setColor(
          Phaser.Display.Color.GetColor(rgb.r, rgb.g, rgb.b),
        );
      },
    });
  }

  /**
   * Create a new random sequence of pieces, and let them blink
   * @param sequenceLength The length of the sequence to generate.
   */
  private async blinkSequence(sequenceLength: number = 0) {
    this.scene.portalService?.send("START_BLINK");
    this.pieces.forEach((piece) => piece.sprite.disableInteractive(true));
    const partialSequence = this.predefinedSequence.slice(0, this.currLength);
    this.currentSequence = partialSequence;
    for (const val of partialSequence) {
      const piece = this.pieces[val];
      this.blinkPiece(piece);
      await delay(blinkDuration * 1000 + 500);
    }
    this.pieces.forEach((piece) =>
      piece.sprite.setInteractive({ useHandCursor: true, pixelPerfect: true }),
    );
    this.scene.portalService?.send("END_BLINK");
  }

  /**
   * Draw new game board
   */
  async drawGame() {
    // delay(2500);
    setTimeout(async () => {
      await this.blinkSequence();
    }, 1500);
  }

  private blinkPiece(piece: GamePiece) {
    const active = piece.config.stem + "_active";
    const inactive = piece.config.stem + "_inactive";

    piece.sprite.setTexture(active);
    piece.glow?.setVisible(true);
    piece.sound.play();
    setTimeout(() => {
      piece.sprite.setTexture(inactive);
      piece.glow?.setVisible(false);
    }, blinkDuration * 1000);
  }

  /**
   * Kill player with lightning strike after failing the game
   */
  private lightningStrike() {
    const bumpkin = this.bumpkin!;
    const lightning = this.scene.add.sprite(bumpkin.x, 0, "thunder");
    lightning.setY(
      bumpkin.y - lightning.height / 2 + bumpkin.displayHeight / 2,
    );
    lightning.setDepth(30);

    lightning
      .on(
        "animationupdate",
        (
          _anim: Phaser.Animations.Animation,
          frame: Phaser.Animations.AnimationFrame,
        ) => {
          if (frame.index === 3) {
            // Bright flash from lightning
            const start = Phaser.Display.Color.ValueToColor(AMBIENT_COLOR);
            const end = Phaser.Display.Color.ValueToColor(0xffffff);

            const rgb = { r: start.red, g: start.green, b: start.blue };

            this.scene.tweens.add({
              targets: rgb,
              r: end.red,
              g: end.green,
              b: end.blue,
              duration: 100,
              onUpdate: () =>
                this.scene.lights.setAmbientColor(
                  Phaser.Display.Color.GetColor(rgb.r, rgb.g, rgb.b),
                ),
            });

            // Bumpkin death animation
            bumpkin?.setVisible(false);
            this.deathSprite = this.scene.add.sprite(
              bumpkin.x,
              bumpkin.y,
              "death",
            );
            this.deathSprite.setFlipX(true);
            this.deathSprite.setDepth(30);
            this.deathSprite.on("animationcomplete", () => {
              this.scene.endGame(this.scene.score);
            });
            this.deathSprite.play("death_anim");

            // Pedastal destroy animation
            const pedastalX = this.bumpkinPedastal!.x;
            const pedastalY = this.bumpkinPedastal!.y;
            this.bumpkinPedastal?.destroy();
            this.bumpkinPedastal = this.scene.add.sprite(
              pedastalX,
              pedastalY - 5,
              "pedastal",
            );
            this.bumpkinPedastal?.setDepth(0);
            this.bumpkinPedastal?.setPipeline("Light2D");
            this.bumpkinPedastal!.play("pedastal_destroy");
          }
        },
      )
      .on("animationcomplete", () => {
        lightning.destroy(true);
        const end = Phaser.Display.Color.ValueToColor(AMBIENT_COLOR);
        const start = Phaser.Display.Color.ValueToColor(0xffffff);

        const rgb = { r: start.red, g: start.green, b: start.blue };

        this.scene.tweens.add({
          targets: rgb,
          r: end.red,
          g: end.green,
          b: end.blue,
          duration: 350,
          onUpdate: () =>
            this.scene.lights.setAmbientColor(
              Phaser.Display.Color.GetColor(rgb.r, rgb.g, rgb.b),
            ),
        });
      });
    lightning.play("thunder_anim");
    this.scene.SOUNDS.thunder?.play({ seek: 0.5 });
  }
}
