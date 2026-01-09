import { SceneId } from "features/world/mmoMachine";
import { MINIGAME_NAME } from "./util/Constants";
import { SimonSays } from "./lib/SimonSays";
import simonMap from "./assets/SimonSays.json";
// import defaultTilesetConfig from "assets/map/tileset.json";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { MachineInterpreter, PortalMachineState } from "./lib/SimonSaysMachine";
import { GameState } from "features/game/types/game";
import { isMobile } from "mobile-device-detect";
import { CONFIG } from "lib/config";
import { EventBus } from "./lib/EventBus";
import { getAnimationUrl } from "features/world/lib/animations";
import { getDefaultLights, Light, LightName } from "./lib/lights";
import { delay } from "./util/Utils";

interface SoundConfig {
  cardflip?:
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound;
  complete?:
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound;
  match_found?:
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound;
  background?:
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound;
}

export class GrayScalePipeline extends Phaser.Renderer.WebGL.Pipelines
  .PostFXPipeline {
  darkness: number = 0.9;
  lightCount = 0;
  lightPositions: Phaser.Math.Vector2[] = [];
  lightRadii: number[] = [];
  lightEnabled: number[] = [];
  lightGlow: number[] = [];
  rawLights: Record<LightName, Light> = {} as Record<string, Light>;
  map = { width: 0, height: 0 };
  constructor(game: Phaser.Game) {
    super({
      game: game,
      fragShader: `
      precision mediump float;

      uniform sampler2D uMainSampler;
      uniform float uDarkness;
      uniform float uAspect;
      uniform vec2 uLightPositions[20];
      uniform float uLightRadii[20];
      uniform float uLightEnabled[20];
      uniform float uLightGlow[20];
      uniform int uLightCount;

      uniform vec3 uLightColor;
      uniform float uGlowStrength;

      varying vec2 outTexCoord;

      void main() {
          vec4 color = texture2D(uMainSampler, outTexCoord);
          float darknessFactor = 1.0 - uDarkness;
          float insideLight = 0.0;

          for(int i = 0; i < 20; i++) {
            if (uLightEnabled[i] == 1.0) {
              if(i >= uLightCount) break;

              vec2 diff = outTexCoord - uLightPositions[i];
              diff.x *= uAspect;
              float dist = length(diff);

              float stepSize = 0.00390625;
              float qDist = floor(dist / stepSize) * stepSize;
              float qRadius = floor(uLightRadii[i] / stepSize) * stepSize;

              float rings = floor(qDist / stepSize);
              float maxRings = floor(qRadius / stepSize);
              float influence = 1.0 - clamp(rings / maxRings, 0.0, 1.0);
            
              darknessFactor += (1.0 - darknessFactor) * influence;

              if (dist <= uLightRadii[i] && uLightGlow[i] == 1.0) {
                insideLight = 1.0;
              }
            }
          }

          color.rgb *= darknessFactor;
          color.rgb = mix(
            color.rgb,
            color.rgb * uLightColor,
            insideLight * uGlowStrength);

          gl_FragColor = color;
      }
      `,
    });
    this.lightPositions = [];
    this.lightRadii = [];
    this.lightCount = 0;
  }

  onPreRender(): void {
    this.set1f("uDarkness", this.darkness);
    this.set3f("uLightColor", 1.0, 0.95, 0.7);
    this.set1f("uGlowStrength", 1.0);
    const positions = [];
    const radii = [];
    for (let i = 0; i < this.lightPositions.length; i++) {
      const pos = this.lightPositions[i];
      positions.push(pos.x / this.map.width, pos.y / this.map.height);
      radii.push(
        this.lightRadii[i] / Math.max(this.map.width, this.map.height),
      );
    }

    this.set1f("uAspect", this.renderer.width / this.renderer.height);
    this.set2fv("uLightPositions", positions);
    this.set1fv("uLightRadii", radii);
    this.set1fv("uLightEnabled", this.lightEnabled);
    this.set1fv("uLightGlow", this.lightGlow);
    this.set1i("uLightCount", this.lightPositions.length);
  }

  setLights(lights: Record<LightName, Light>): void {
    const positions: Phaser.Math.Vector2[] = [];
    const radii: number[] = [];
    const enabled: number[] = [];
    const glow: number[] = [];
    Object.values(lights).forEach((light) => {
      positions.push(new Phaser.Math.Vector2(light.x, light.y));
      radii.push(light.radius);
      enabled.push(light.enabled);
      glow.push(light.glow);
    });
    this.lightPositions = positions;
    this.lightRadii = radii;
    this.lightEnabled = enabled;
    this.lightGlow = glow;
    this.rawLights = lights;

    const map = (this.game.scene.getScene("chaacs-temple") as SimonSaysScene)
      .map;
    this.map.height = map.height * SQUARE_WIDTH;
    this.map.width = map.width * SQUARE_WIDTH;
  }

  // async fadeDarkness(
  //   destDarkness: number,
  //   duration: number,
  //   stepSize: number = 0.0,
  // ) {
  //   if (destDarkness == this.darkness) return;
  //   const darknessDiff = this.darkness - destDarkness;
  //   if (destDarkness < this.darkness && stepSize > 0) {
  //     stepSize = -stepSize;
  //   }
  //   if (stepSize == 0.0) {
  //     stepSize = darknessDiff / duration;
  //   }
  //   const stepDuration = duration / stepSize;
  //   while (true) {
  //     this.darkness = this.darkness + stepSize;
  //     await delay(stepDuration);
  //   }
  // }

  async fadeDarkness(
    destDarkness: number,
    duration: number,
    stepSize: number = 0,
  ) {
    if (destDarkness === this.darkness) return;

    const start = this.darkness;
    const delta = destDarkness - start;
    const totalDiff = Math.abs(delta);

    if (stepSize <= 0) {
      stepSize = totalDiff / 60;
    }
    const steps = Math.ceil(totalDiff / stepSize);
    const stepDuration = duration / steps;

    const direction = delta >= 0 ? 1 : -1;

    let current = start;

    while (
      (direction > 0 && current < destDarkness) ||
      (direction < 0 && current > destDarkness)
    ) {
      current += stepSize * direction;

      if (
        (direction > 0 && current > destDarkness) ||
        (direction < 0 && current < destDarkness)
      ) {
        current = destDarkness;
      }

      this.darkness = current;

      await delay(stepDuration);
    }

    this.darkness = destDarkness;
  }
}

export class SimonSaysScene extends Phaser.Scene {
  sceneId: SceneId = MINIGAME_NAME;
  gameBoard!: SimonSays;
  public map: Phaser.Tilemaps.Tilemap = {} as Phaser.Tilemaps.Tilemap;
  layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};
  zoomLevel = 0;
  ZOOM = 0;
  locked = false;
  static current: SimonSaysScene | null = null;
  SOUNDS: SoundConfig = {} as SoundConfig;
  finishedRendering = false;

  constructor() {
    super(MINIGAME_NAME);
  }

  preload() {
    this.loadImages();
    this.loadAudio();
    const mapJson = simonMap;
    const json = {
      ...mapJson,
      tilesets: [...mapJson.tilesets],
    };
    this.load.tilemapTiledJSON("simon_tilemap", json);
    this.load.image(
      "simon_tileset",
      `${CONFIG.PROTECTED_PORTAL_URL}/simon_tileset.png`,
    );
  }

  async create() {
    // this.createCardImages();
    // this.initSounds();
    this.initCamera();
    this.initMap();
    this.updateCameraBounds();
    this.initAnimations();
    this.physics.world.drawDebug = false;
    this.gameBoard = new SimonSays(this);

    (
      this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer
    ).pipelines.addPostPipeline("grayScale", GrayScalePipeline);

    this.cameras.main.setPostPipeline("grayScale");

    const grayScalePipeline = this.cameras.main.getPostPipeline(
      "grayScale",
    ) as GrayScalePipeline;
    grayScalePipeline.setLights(getDefaultLights(this.map));

    if (this.portalService) {
      if (!this.portalService._listeners) {
        this.portalService._listeners = new Set();
      } else {
        // Delete all old listeners to prevent issues from HMR
        for (const l of this.portalService._listeners) {
          this.portalService.off(l);
        }
      }
      const listener: (state: PortalMachineState) => void = (state) => {
        if (
          (state.matches("introduction") ||
            state.matches("winner") ||
            state.matches("loser") ||
            state.matches("complete")) &&
          state.changed
        ) {
          this.gameBoard.cleanPregame();
          this.gameBoard.drawPregame();
          if (!this.finishedRendering) {
            this.finishedRendering = true;
            EventBus.emitter.emit("GAME_READY");
          }
        }
      };
      this.portalService.onTransition(listener);
      this.portalService._listeners.add(listener);
    }
  }
  updateCameraBounds() {
    const canvasWidth = window.innerWidth / this.ZOOM;
    const canvasHeight = window.innerHeight / this.ZOOM;

    this.cameras.main.setBounds(
      0,
      0,
      Math.max(this.map.widthInPixels, canvasWidth),
      Math.max(this.map.heightInPixels, canvasHeight),
    );
  }
  async update(time: number, delta: number) {
    if (this.isReady && this.finishedRendering) await this.gameBoard.newGame();
    if (!this.isPlaying) this.gameBoard.cleanGame();
  }

  public endGame = (score: number) => {
    this.gameBoard.cleanGame();
    this.gameBoard.drawPregame();
    this.portalService?.send("GAME_OVER", {
      score: score,
    });
  };

  private initCamera() {
    const camera = this.cameras.main;
    const baseZoom =
      window.innerWidth < window.innerHeight
        ? window.innerWidth
        : window.innerHeight;
    if (isMobile) this.ZOOM = baseZoom / (12 * SQUARE_WIDTH);
    else this.ZOOM = baseZoom / (18.5 * SQUARE_WIDTH);
    camera.setZoom(this.ZOOM);
    camera.fadeIn();
  }

  private loadImages() {
    this.load.image("demo", "world/simon-says/simon_demo.webp");

    const folders = ["mid", "top"];
    const colors = ["blue", "green", "yellow", "red"];
    const states = ["active", "inactive", "pressed"];

    folders.forEach((part) => {
      colors.forEach((color) => {
        states.forEach((state) => {
          const name = `${part}${color}_${state}`;
          this.load.image(name, `world/simon-says/${part}/${name}.png`);
        });
      });
    });

    this.load.image("core_active", "world/simon-says/core/core_active.png");
    this.load.image("core_inactive", "world/simon-says/core/core_inactive.png");
    this.load.image("core_pressed", "world/simon-says/core/core_pressed.png");

    this.load.image("bonepile", "world/simon-says/bonepile.webp");
    this.load.image("headpole", "world/simon-says/headpole.webp");

    this.load.image("pedastal", "world/simon-says/pedastal.webp");

    const url = getAnimationUrl(this.gameState.bumpkin.equipped, ["death"]);
    this.load.spritesheet("death", url, {
      frameWidth: 96,
      frameHeight: 64,
    });

    this.load.spritesheet("thunder", "world/simon-says/thunder-Sheet.webp", {
      frameHeight: 300,
      frameWidth: 87,
    });

    this.load.spritesheet("brazier", "world/simon-says/brazier-Sheet.webp", {
      frameHeight: 30,
      frameWidth: 16,
    });

    this.load.spritesheet(
      "life_brazier_active",
      "world/simon-says/life_brazier_active-Sheet.webp",
      {
        frameHeight: 32,
        frameWidth: 32,
      },
    );

    this.load.spritesheet(
      "life_brazier_inactive",
      "world/simon-says/life_brazier_inactive-Sheet.webp",
      {
        frameHeight: 32,
        frameWidth: 32,
      },
    );
  }

  public initMap() {
    this.map = this.make.tilemap({
      key: "simon_tilemap",
    });

    const tileset = this.map.addTilesetImage(
      "seasonal-tileset",
      "seasonal-tileset",
      16,
      16,
      1,
      2,
    ) as Phaser.Tilemaps.Tileset;
    const simonTileset = this.map.addTilesetImage(
      "simon_tileset",
      "simon_tileset",
      16,
      16,
      0,
      0,
    ) as Phaser.Tilemaps.Tileset;
    this.map.layers.forEach((layerData) => {
      const layer = this.map.createLayer(
        layerData.name,
        [tileset, simonTileset],
        0,
        0,
      );
      this.layers[layerData.name] = layer as Phaser.Tilemaps.TilemapLayer;
    });
    this.cameras.main.centerOn(
      (this.map.width / 2) * SQUARE_WIDTH,
      (this.map.height / 2) * SQUARE_WIDTH,
    );
  }

  loadAudio() {
    this.load.audio("cardflip", "world/memory/cardflip.mp3");
    this.load.audio("complete", "world/memory/complete.wav");
    this.load.audio("match_found", "world/memory/match_found.wav");
    this.load.audio("background", "world/memory/bgm.wav");
  }

  initSounds() {
    if (!this.SOUNDS.match_found)
      this.SOUNDS.match_found = this.sound.add("match_found");
    if (!this.SOUNDS.cardflip)
      this.SOUNDS.cardflip = this.sound.add("cardflip");
    if (!this.SOUNDS.complete)
      this.SOUNDS.complete = this.sound.add("complete");
    if (!this.SOUNDS.background)
      this.SOUNDS.background = this.sound.add("background");
  }

  initAnimations() {
    if (!this.anims.exists("death_anim"))
      this.anims.create({
        key: "death_anim",
        frames: this.anims.generateFrameNumbers("death"),
        frameRate: 10,
        repeat: 0,
      });

    if (!this.anims.exists("thunder_anim"))
      this.anims.create({
        key: "thunder_anim",
        frames: this.anims.generateFrameNumbers("thunder"),
        frameRate: 10,
        repeat: 0,
      });

    if (!this.anims.exists("brazier_anim"))
      this.anims.create({
        key: "brazier_anim",
        frames: this.anims.generateFrameNumbers("brazier"),
        frameRate: 10,
        repeat: -1,
      });

    if (!this.anims.exists("life_brazier_active_anim"))
      this.anims.create({
        key: "life_brazier_active_anim",
        frames: this.anims.generateFrameNumbers("life_brazier_active"),
        frameRate: 10,
        repeat: -1,
      });

    if (!this.anims.exists("life_brazier_inactive_anim"))
      this.anims.create({
        key: "life_brazier_inactive_anim",
        frames: this.anims.generateFrameNumbers("life_brazier_inactive"),
        frameRate: 10,
        repeat: 0,
      });
  }

  public get isPlaying() {
    return this.portalService?.getSnapshot().matches("playing") === true;
  }
  public get isReady() {
    return this.portalService?.getSnapshot().matches("ready") === true;
  }
  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter | undefined;
  }
  public get gameState() {
    return this.registry.get("gameState") as GameState;
  }

  public get score() {
    return this.portalService?.getSnapshot().context.score ?? 0;
  }
  public get movesMade() {
    return this.portalService
      ? this.portalService?.getSnapshot().context.movesMade
      : 0;
  }
  public get targetScore() {
    return this.portalService
      ? this.portalService?.getSnapshot().context.targetScore
      : 0;
  }
  public get lives() {
    return this.portalService
      ? this.portalService?.getSnapshot().context.lives
      : 0;
  }
  public get solved() {
    return this.portalService
      ? this.portalService?.getSnapshot().context.solved
      : false;
  }
}
