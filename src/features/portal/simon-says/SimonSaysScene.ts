import { SceneId } from "features/world/mmoMachine";
import { MINIGAME_NAME } from "./util/Constants";
import { SimonSays } from "./lib/SimonSays";
import simonMap from "./assets/SimonSays.json";
// import defaultTilesetConfig from "assets/map/tileset.json";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { MachineInterpreter, PortalMachineState } from "./lib/SimonSaysMachine";
import { GameState } from "features/game/types/game";
import { isMobile, isTablet } from "mobile-device-detect";
import { CONFIG } from "lib/config";
import { EventBus } from "./lib/EventBus";
import { getAnimationUrl } from "features/world/lib/animations";
import { createBrazierAnimations, loadBrazierFiles } from "./lib/braziers";

interface SoundConfig {
  extinguish:
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound;
  thunder:
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
  pieces: {
    core:
      | Phaser.Sound.WebAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.NoAudioSound;
    midblue:
      | Phaser.Sound.WebAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.NoAudioSound;
    midgreen:
      | Phaser.Sound.WebAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.NoAudioSound;
    midred:
      | Phaser.Sound.WebAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.NoAudioSound;
    midyellow:
      | Phaser.Sound.WebAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.NoAudioSound;
    topblue:
      | Phaser.Sound.WebAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.NoAudioSound;
    topgreen:
      | Phaser.Sound.WebAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.NoAudioSound;
    topred:
      | Phaser.Sound.WebAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.NoAudioSound;
    topyellow:
      | Phaser.Sound.WebAudioSound
      | Phaser.Sound.HTML5AudioSound
      | Phaser.Sound.NoAudioSound;
  };
}

export class HardLightPipeline extends Phaser.Renderer.WebGL.Pipelines
  .LightPipeline {
  constructor(game: Phaser.Game) {
    super({
      game: game,
      fragShader: `
        precision mediump float;
        struct Light
        {
            vec2 position;
            vec3 color;
            float intensity;
            float radius;
        };
        const int kMaxLights = %LIGHT_COUNT%;
        uniform vec4 uCamera; /* x, y, rotation, zoom */
        uniform vec2 uResolution;
        uniform sampler2D uMainSampler;
        uniform sampler2D uNormSampler;
        uniform vec3 uAmbientLightColor;
        uniform Light uLights[kMaxLights];
        uniform mat3 uInverseRotationMatrix;
        uniform int uLightCount;
        varying vec2 outTexCoord;
        varying float outTexId;
        varying float outTintEffect;
        varying vec4 outTint;
        void main ()
        {
            vec3 finalColor = vec3(0.0, 0.0, 0.0);
            vec4 texel = vec4(outTint.bgr * outTint.a, outTint.a);
            vec4 texture = texture2D(uMainSampler, outTexCoord);
            vec4 color = texture * texel;
            if (outTintEffect == 1.0)
            {
                color.rgb = mix(texture.rgb, outTint.bgr * outTint.a, texture.a);
            }
            else if (outTintEffect == 2.0)
            {
                color = texel;
            }
            vec3 normalMap = texture2D(uNormSampler, outTexCoord).rgb;
            vec3 normal = normalize(uInverseRotationMatrix * vec3(normalMap * 2.0 - 1.0));
            vec2 res = vec2(min(uResolution.x, uResolution.y)) * uCamera.w;
            for (int index = 0; index < kMaxLights; ++index)
            {
                if (index < uLightCount)
                {
                    Light light = uLights[index];
                    vec3 lightDir = vec3((light.position.xy / res) - (gl_FragCoord.xy / res), 0.1);
                    vec3 lightNormal = normalize(lightDir);
                    float distToSurf = length(lightDir) * uCamera.w;
                    float diffuseFactor = max(dot(normal, lightNormal), 0.0);
                    float radius = (light.radius / res.x * uCamera.w) * uCamera.w;
                    float attenuation = clamp(1.0 - distToSurf * distToSurf / (radius * radius), 0.0, 1.0);
                    if (light.radius > 90.0) {
                      if (distToSurf <= radius) {
                        attenuation = 1.0;
                        diffuseFactor = 1.0;
                      } else {
                        attenuation = 0.0;
                      }
                    }
                    vec3 diffuse = light.color * diffuseFactor;
                    finalColor += (attenuation * diffuse) * light.intensity;
                }
            }
            vec4 colorOutput = vec4(uAmbientLightColor + finalColor, 1.0);
            gl_FragColor = color * vec4(colorOutput.rgb * colorOutput.a, colorOutput.a);
        }`,
    });
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
    this.load.font("monogram", "world/simon-says/monogram.ttf");
  }

  async create() {
    (this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.add(
      "hardLight",
      new HardLightPipeline(this.game),
    );

    // this.createCardImages();
    this.initSounds();
    this.initCamera();
    this.initMap();
    this.updateCameraBounds();
    this.initAnimations();
    this.physics.world.drawDebug = false;
    this.gameBoard = new SimonSays(this);

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
    this.gameBoard.cleanPregame();
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
    // if (isMobile) this.ZOOM = baseZoom / (12 * SQUARE_WIDTH);
    if (isTablet) this.ZOOM = baseZoom / (14 * SQUARE_WIDTH);
    else if (isMobile) {
      const minZoom = Math.ceil((this.game.canvas.height / 448) * 10) / 10;
      const gameZoom = Math.ceil((this.game.canvas.width / 176) * 10) / 10;
      this.ZOOM = Math.max(minZoom, (minZoom + gameZoom) / 2);
      // console.log(minZoom, gameZoom, (minZoom + gameZoom) / 2);
    } else this.ZOOM = baseZoom / (18.5 * SQUARE_WIDTH);
    camera.setZoom(this.ZOOM);
    camera.fadeIn();
  }

  private loadImages() {
    const folders = ["mid", "top"];
    const colors = ["blue", "green", "yellow", "red"];
    const states = ["active", "inactive", "pressed", "glow"];

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
    this.load.image("core_glow", "world/simon-says/core/core_glow.webp");

    this.load.image("bonepile", "world/simon-says/bonepile.webp");
    this.load.image("headpole", "world/simon-says/headpole.webp");

    this.load.image("pedastal", "world/simon-says/pedastal.webp");

    this.load.image(
      "vine_pillar_broken",
      "world/simon-says/Vine-pillar-broken.webp",
    );
    this.load.image("pillar_broken", "world/simon-says/Pillar-broken.webp");

    const url = getAnimationUrl(this.gameState.bumpkin.equipped, ["death"]);
    this.load.spritesheet("death", url, {
      frameWidth: 96,
      frameHeight: 64,
    });

    this.load.spritesheet("thunder", "world/simon-says/thunder-Sheet.webp", {
      frameHeight: 300,
      frameWidth: 87,
    });

    loadBrazierFiles(this);

    this.load.spritesheet(
      "pedastal_destroy",
      "world/simon-says/pedastal_destroy.webp",
      {
        frameHeight: 35,
        frameWidth: 46,
      },
    );

    this.load.spritesheet(
      "maya_guard-idle",
      "world/simon-says/chaac_idle.webp",
      {
        frameHeight: 19,
        frameWidth: 20,
      },
    );

    this.load.image("frame", "world/simon-says/frame.webp");
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
      const layer = this.map
        .createLayer(layerData.name, [tileset, simonTileset], 0, 0)!
        .setPipeline("Light2D");
      this.layers[layerData.name] = layer as Phaser.Tilemaps.TilemapLayer;
    });
    this.cameras.main.centerOn(
      (this.map.width / 2) * SQUARE_WIDTH,
      (this.map.height / 2 - 1.5) * SQUARE_WIDTH,
    );
  }

  loadAudio() {
    // Celesta sounds from: https://freesound.org/people/pjcohen/packs/23108/
    // volume normalized by me
    const folders = ["mid", "top"];
    const colors = ["blue", "green", "yellow", "red"];
    folders.forEach((folder) => {
      colors.forEach((color) => {
        this.load.audio(
          `${folder}${color}_sound`,
          `world/simon-says/sounds/${folder}${color}.mp3`,
        );
      });
    });
    this.load.audio("core_sound", "world/simon-says/sounds/core.mp3");

    // Extinguish sound from: https://freesound.org/people/1bob/sounds/831929/
    this.load.audio("extinguish", "world/simon-says/sounds/extinguish.wav");

    // Thunder sound from: https://freesound.org/people/seth-m/sounds/458015/
    this.load.audio("thunder", "world/simon-says/sounds/thunder.mp3");
  }

  initSounds() {
    if (!this.SOUNDS.extinguish)
      this.SOUNDS.extinguish = this.sound.add("extinguish");
    if (!this.SOUNDS.thunder) this.SOUNDS.thunder = this.sound.add("thunder");
    // if (!this.SOUNDS.complete)
    //   this.SOUNDS.complete = this.sound.add("complete");
    // if (!this.SOUNDS.background)
    //   this.SOUNDS.background = this.sound.add("background");
    if (!this.SOUNDS.pieces)
      this.SOUNDS.pieces = {
        core: this.sound.add("core_sound"),
        midblue: this.sound.add("midblue_sound"),
        midgreen: this.sound.add("midgreen_sound"),
        midred: this.sound.add("midred_sound"),
        midyellow: this.sound.add("midyellow_sound"),
        topblue: this.sound.add("topblue_sound"),
        topgreen: this.sound.add("topgreen_sound"),
        topred: this.sound.add("topred_sound"),
        topyellow: this.sound.add("topyellow_sound"),
      };
  }

  initAnimations() {
    createBrazierAnimations(this);

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

    if (!this.anims.exists("pedastal_destroy"))
      this.anims.create({
        key: "pedastal_destroy",
        frames: this.anims.generateFrameNumbers("pedastal_destroy"),
        frameRate: 10,
        repeat: 0,
      });

    if (!this.anims.exists("maya_guard-bumpkin-idle"))
      this.anims.create({
        key: "maya_guard-bumpkin-idle",
        frames: this.anims.generateFrameNumbers("maya_guard-idle"),
        frameRate: 10,
        repeat: -1,
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
