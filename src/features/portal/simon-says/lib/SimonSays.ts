import { GrayScalePipeline, SimonSaysScene } from "../SimonSaysScene";
import { SQUARE_WIDTH } from "features/game/lib/constants";

import {
  blinkDuration,
  DEFAULT_SEQUENCE_LENGTH,
  defaultBgmVolume,
  defaultEffectsVolume,
} from "../util/Constants";
import { EventObject } from "xstate";
import { EventBus } from "./EventBus";
import { EVENTS } from "./Events";
import { getMemorySettings } from "../util/useSettings";
import { MemorySettings } from "./Settings";
import { PieceConfig, piecesConfig } from "../util/PiecesConfig";
import { randomInt } from "lib/utils/random";
import { delay } from "../util/Utils";
import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { placeBraziers } from "./braziers";
import { getDefaultLights, LightName } from "./lights";

interface Piece {
  image: Required<Phaser.GameObjects.Image>;
  config: Required<PieceConfig>;
}

export class SimonSays {
  private pieces: Piece[] = [];
  private scene: SimonSaysScene;
  private duration = 0;
  private TILE_SIZE;
  private scale = 0.8;
  private targetScore = 0;
  private lives = 3;
  private lifeBraziers: Phaser.GameObjects.Sprite[] = [];

  private bumpkin?: BumpkinContainer | undefined = undefined;
  private deathSprite: Phaser.GameObjects.Sprite | undefined = undefined;
  private currentSequence: number[] = [];
  private hintListener: ((event: EventObject) => void) | null = null;
  static current: SimonSays | null = null;
  public settings: MemorySettings = getMemorySettings();
  private camera: Phaser.Cameras.Scene2D.Camera | undefined;

  constructor(scene: SimonSaysScene) {
    this.scene = scene;

    this.TILE_SIZE = SQUARE_WIDTH * 2;

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
    const memorySettings = getMemorySettings();

    // Background music
    const newBgmMuted =
      settings.Music?.isMuted ?? !!memorySettings.Music?.isMuted;
    const newBgmVolume =
      settings.Music?.volume ??
      memorySettings.Music?.volume ??
      defaultBgmVolume;
    this.scene.SOUNDS.background?.setMute(newBgmMuted);
    if (!newBgmMuted) this.scene.SOUNDS.background?.setVolume(newBgmVolume);

    // Sound effects
    const newEffectsMuted =
      settings.Effects?.isMuted ?? !!memorySettings.Effects?.isMuted;
    const newEffectsVolume =
      settings.Effects?.volume ??
      memorySettings.Effects?.volume ??
      defaultEffectsVolume;

    this.scene.SOUNDS.cardflip?.setMute(newEffectsMuted);
    this.scene.SOUNDS.complete?.setMute(newEffectsMuted);
    this.scene.SOUNDS.match_found?.setMute(newEffectsMuted);
    if (!newEffectsMuted) {
      this.scene.SOUNDS.cardflip?.setVolume(newEffectsVolume);
      this.scene.SOUNDS.complete?.setVolume(newEffectsVolume);
      this.scene.SOUNDS.match_found?.setVolume(newEffectsVolume);
    }
    this.settings = { ...memorySettings };
  }

  setupSounds() {
    this.scene.SOUNDS.background?.setMute(!!this.settings.Music?.isMuted);
    this.scene.SOUNDS.background?.play({
      volume: this.settings.Music?.volume ?? 0,
      loop: true,
      rate: 0.7,
    });

    const effectsVolume = this.settings.Effects?.volume ?? defaultEffectsVolume;
    const effectsIsMuted = !!this.settings.Effects?.isMuted;
    this.scene.SOUNDS.cardflip?.setVolume(effectsVolume);
    this.scene.SOUNDS.complete?.setVolume(effectsVolume);
    this.scene.SOUNDS.match_found?.setVolume(effectsVolume);

    this.scene.SOUNDS.cardflip?.setMute(effectsIsMuted);
    this.scene.SOUNDS.complete?.setMute(effectsIsMuted);
    this.scene.SOUNDS.match_found?.setMute(effectsIsMuted);
  }

  public async newGame() {
    const prize = this.scene.gameState.minigames.prizes.memory;
    switch (prize?.score) {
      case undefined:
      default:
        this.duration = 60000 * 10000;
        this.targetScore = 3;
        this.lives = 3;
    }
    this.scene.locked = false;

    this.cleanGame();

    const gamestate = this.scene.gameState;
    this.bumpkin = new BumpkinContainer({
      scene: this.scene,
      x: (this.scene.map.width / 2 + 7) * SQUARE_WIDTH,
      y: (this.scene.map.height / 2 + 4) * SQUARE_WIDTH,
      clothing: { ...gamestate.bumpkin.equipped, updatedAt: Date.now() },
      direction: "left",
      username: gamestate.username,
    });

    // this.hintListener = (event) => {
    //   if (event.type === "BUY_HINT") {
    //     const game = SimonSays.current;
    //     if (!game) return;
    //     const flippedCard = game.flippedCards[0];
    //     const filteredCards = game.cards.filter((value) => {
    //       return value.name == flippedCard.name && !value.isFlipped;
    //     });
    //     const matchingCard = filteredCards.length > 0 ? filteredCards[0] : null;
    //     if (!matchingCard) return;
    //     try {
    //       const tween = game.scene.tweens.add({
    //         targets: matchingCard.image,
    //         scale: 1.6,
    //         duration: 150,
    //         yoyo: true,
    //         loop: Infinity,
    //         ease: "Linear",
    //       });
    //       if (!matchingCard.tweens) matchingCard.tweens = [];
    //       matchingCard.tweens?.push(tween);
    //     } catch (err) {
    //       window.location.reload();
    //     }
    //   }
    // };
    // this.scene.portalService?.onEvent(this.hintListener);

    // Keep track of listeners to remove when doing HMR
    // this.scene.portalService?._listeners.add(this.hintListener);

    if (this.scene.isReady) {
      this.scene.portalService?.send("START", {
        duration: this.duration,
        targetScore: this.targetScore,
        lives: this.lives,
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
  }

  public cleanPregame() {
    this.pieces.forEach((piece) => {
      piece.image.destroy(true);
    });
    this.pieces = [];

    this.lifeBraziers.forEach((brazier) => {
      brazier.destroy(true);
    });
    this.lifeBraziers = [];
    this.camera ? this.scene.cameras.remove(this.camera) : null;
    const shader = this.scene.cameras.main.getPostPipeline(
      "grayScale",
    ) as GrayScalePipeline;
    shader.setLights(getDefaultLights(this.scene.map));
    shader.fadeDarkness(0.9, 500);
  }

  drawPregame() {
    Object.values(piecesConfig).forEach((value) => {
      const img = this.scene.add.image(
        (this.scene.map.width / 2 + value.xOffset) * SQUARE_WIDTH,
        (this.scene.map.height / 2 + value.yOffset) * SQUARE_WIDTH,
        `${value.stem}${value.suffix}`,
      );
      img
        .setScale(0.65)
        .setInteractive({ useHandCursor: true, pixelPerfect: true })
        .on(
          "pointerdown",
          async () =>
            await this.handlePointerDown({
              image: img,
              config: value,
            } as Piece),
        )
        .on(
          "pointerup",
          async () =>
            await this.handlePointerUp({ image: img, config: value } as Piece),
        )
        .on(
          "pointerout",
          async () =>
            await this.handlePointerUp({ image: img, config: value } as Piece),
        );
      this.pieces.push({ image: img, config: value } as Piece);
    });

    placeBraziers(this.scene);
    // const brazier = this.scene.add.sprite(
    //   (this.scene.map.width / 2 - 10) * SQUARE_WIDTH,
    //   (this.scene.map.height / 2 - 6) * SQUARE_WIDTH - 1,
    //   "brazier",
    // );
    // brazier.play({ key: "brazier_anim", randomFrame: true });

    let i = -1;
    while (i < this.lives - 1) {
      const lifeBrazier = this.scene.add.sprite(
        (this.scene.map.width / 2 + 4 * i) * SQUARE_WIDTH,
        (this.scene.map.height / 2 - 7.5) * SQUARE_WIDTH,
        "life_brazier_active",
      );
      lifeBrazier.play("life_brazier_active_anim");
      this.lifeBraziers.push(lifeBrazier);
      i++;
    }
    this.lifeBraziers = this.lifeBraziers.reverse();

    this.scene.add.image(
      (this.scene.map.width / 2 - 7.5) * SQUARE_WIDTH,
      (this.scene.map.width / 2 + 2) * SQUARE_WIDTH,
      "bonepile",
    );

    this.scene.add.image(
      (this.scene.map.width / 2 - 5.5) * SQUARE_WIDTH,
      (this.scene.map.width / 2 + 2) * SQUARE_WIDTH,
      "headpole",
    );

    this.scene.add.image(
      (this.scene.map.width / 2 + 5.5) * SQUARE_WIDTH,
      (this.scene.map.width / 2 + 2) * SQUARE_WIDTH,
      "headpole",
    ).flipX = true;

    this.scene.add.image(
      (this.scene.map.width / 2 + 7) * SQUARE_WIDTH,
      (this.scene.map.width / 2 - 0.5) * SQUARE_WIDTH,
      "pedastal",
    );
  }

  private async handlePointerDown(piece: Piece) {
    if (this.scene.locked) return;
    piece.image.setTexture(`${piece.config.stem}_pressed`);
  }

  private async handlePointerUp(piece: Piece) {
    if (this.scene.locked) return;

    // Ignore calls from pointerout event when piece is not pressed
    if (piece.image.texture.key == `${piece.config.stem}_pressed`) {
      piece.image.setTexture(`${piece.config.stem}_inactive`);
      const idx = this.pieces.findIndex(
        (value) => value.config == piece.config,
      );
      let score = this.scene.score;
      let lives = this.scene.lives;
      if (idx == this.currentSequence[0]) {
        this.currentSequence.shift();

        if (this.currentSequence.length === 0) score = score + 1;
        const solved = score == this.scene.targetScore;
        this.scene.portalService?.send("MAKE_MOVE", {
          score: score,
          lives: lives,
          solved: solved,
        });
        if (this.currentSequence.length === 0)
          await this.blinkSequence(DEFAULT_SEQUENCE_LENGTH);
      } else {
        const shader = this.scene.cameras.main.getPostPipeline(
          "grayScale",
        ) as GrayScalePipeline;
        lives = lives - 1;
        this.scene.portalService?.send("MAKE_MOVE", {
          score: score,
          lives: lives,
          solved: false,
        });
        this.lifeBraziers[lives].stop().play("life_brazier_inactive_anim");
        const order: LightName[] = [
          "lifeBrazier_left",
          "lifeBrazier_middle",
          "lifeBrazier_right",
        ];
        const name = order[this.lives - lives - 1];
        shader.setLights({
          ...shader.rawLights,
          [name]: {
            ...shader.rawLights[order[this.lives - lives - 1]],
            enabled: 0.0,
          },
        });
        if (this.scene.lives <= 0) {
          await delay(500);
          await this.turnOffBraziers();
          await delay(1000);
          shader.setLights({
            ...shader.rawLights,
            game: { ...shader.rawLights.game, enabled: 0.0 },
          });
          await shader.fadeDarkness(1.0, 3000);

          await delay(1000);
          this.lightningStrike();
          return;
        }
        await this.blinkSequence(DEFAULT_SEQUENCE_LENGTH);
      }
    }
  }

  private async turnOffBraziers() {
    const shader = this.scene.cameras.main.getPostPipeline(
      "grayScale",
    ) as GrayScalePipeline;
    const rawLights = shader.rawLights;
    rawLights.brazier_lefttop.enabled = 0.0;
    rawLights.brazier_righttop.enabled = 0.0;
    shader.setLights(rawLights);
    await delay(1000);

    rawLights.brazier_leftbottom.enabled = 0.0;
    rawLights.brazier_rightbottom.enabled = 0.0;
    shader.setLights(rawLights);
    await delay(1000);

    rawLights.brazier_bottomleft.enabled = 0.0;
    rawLights.brazier_bottomright.enabled = 0.0;
    shader.setLights(rawLights);
  }

  private turnOnAll() {
    this.pieces.forEach((piece) => {
      piece.image.disableInteractive(true);
      const active = piece.config.stem + "_active";

      piece.image.setTexture(active);
    });
  }

  /**
   * Create a new random sequence of pieces, and let them blink
   * @param sequenceLength The length of the sequence to generate.
   */
  private async blinkSequence(sequenceLength: number) {
    this.pieces.forEach((piece) => piece.image.disableInteractive(true));
    this.currentSequence = [];
    let i = 0;
    while (i < sequenceLength) {
      const rand = randomInt(0, this.pieces.length);
      const piece = this.pieces[rand];
      this.blinkPiece(piece);
      this.currentSequence.push(rand);
      await delay(blinkDuration * 1000 + 500);
      i++;
    }
    this.pieces.forEach((piece) =>
      piece.image.setInteractive({ useHandCursor: true, pixelPerfect: true }),
    );
  }

  /**
   * Draw new game board
   */
  async drawGame() {
    delay(2500);
    await this.blinkSequence(DEFAULT_SEQUENCE_LENGTH);
  }

  private blinkPiece(piece: Piece) {
    const active = piece.config.stem + "_active";
    const inactive = piece.config.stem + "_inactive";

    piece.image.setTexture(active);
    setTimeout(() => piece.image.setTexture(inactive), blinkDuration * 1000);
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

    // Second camera for the glowing sprite
    const glowCam = this.scene.cameras.add(
      0,
      0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
    );
    const canvasWidth = window.innerWidth / this.scene.ZOOM;
    const canvasHeight = window.innerHeight / this.scene.ZOOM;
    glowCam.setBounds(
      0,
      0,
      Math.max(this.scene.map.widthInPixels, canvasWidth),
      Math.max(this.scene.map.heightInPixels, canvasHeight),
    );
    glowCam.centerOn(
      (this.scene.map.width / 2) * SQUARE_WIDTH,
      (this.scene.map.height / 2) * SQUARE_WIDTH,
    );
    glowCam.setScroll(
      this.scene.cameras.main.scrollX,
      this.scene.cameras.main.scrollY,
    );
    glowCam.setZoom(this.scene.cameras.main.zoom);
    glowCam.ignore(this.scene.children.list.filter((obj) => obj !== lightning));
    this.camera = glowCam;
    // only render the sprite in the second camera

    // Optional: glow shader for sprite
    // sprite.setPipeline("GlowPipeline"); // or leave default if additive

    lightning
      .on(
        "animationupdate",
        (
          _anim: Phaser.Animations.Animation,
          frame: Phaser.Animations.AnimationFrame,
        ) => {
          if (frame.index === 3) {
            bumpkin?.setVisible(false);
            this.deathSprite = this.scene.add.sprite(
              bumpkin.x,
              bumpkin.y,
              "death",
            );
            this.deathSprite.setFlipX(true);
            this.scene.cameras.main.ignore([lightning, this.deathSprite]);
            this.deathSprite.on("animationcomplete", () => {
              this.scene.endGame(0);
            });
            this.deathSprite.play("death_anim");
          }
        },
      )
      .on("animationcomplete", () => {
        lightning.destroy(true);
      });
    lightning.play("thunder_anim");
  }
}
