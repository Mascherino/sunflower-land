import { SceneId } from "features/world/mmoMachine";
import { MINIGAME_NAME } from "./util/Constants";
import { Memory } from "./lib/Memory";
import springMap from "./assets/spring_memory.json";
import summerMap from "./assets/summer_memory.json";
import autumnMap from "./assets/autumn_memory.json";
import winterMap from "./assets/winter_memory.json";
// import defaultTilesetConfig from "assets/map/tileset.json";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { MachineInterpreter, PortalMachineState } from "./lib/MemoryMachine";
import RexFlipPlugin from "phaser3-rex-plugins/plugins/flip-plugin.js";
import { ITEM_DETAILS } from "features/game/types/images";
import { ALL_PRODUCE } from "features/game/types/crops";
import { GameState, InventoryItemName } from "features/game/types/game";
import { isMobile } from "mobile-device-detect";
import seasonal_tileset from "assets/map/seasonal_tileset.json";
import { CONFIG } from "lib/config";
import { EventBus } from "./lib/EventBus";

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

export class MemoryScene extends Phaser.Scene {
  sceneId: SceneId = MINIGAME_NAME;
  gameBoard!: Memory;
  public map: Phaser.Tilemaps.Tilemap = {} as Phaser.Tilemaps.Tilemap;
  layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};
  zoomLevel = 0;
  ZOOM = 0;
  rexFlip: RexFlipPlugin | undefined;
  locked = false;
  static current: MemoryScene | null = null;
  SOUNDS: SoundConfig = {} as SoundConfig;
  finishedRendering = false;

  constructor() {
    super(MINIGAME_NAME);
  }

  preload() {
    this.loadImages();
    this.loadAudio();
    const season = this.gameState.season.season;
    let mapJson = springMap;
    switch (season) {
      case "spring":
        mapJson = springMap;
        break;
      case "summer":
        mapJson = summerMap;
        break;
      case "autumn":
        mapJson = autumnMap;
        break;
      case "winter":
        mapJson = winterMap;
        break;
      default:
        mapJson = summerMap;
    }
    const json = {
      ...mapJson,
      tilesets: [...seasonal_tileset, ...mapJson.tilesets],
    };
    this.load.tilemapTiledJSON("memory_tilemap", json);
    this.load.image(
      "Tree tileset",
      `${CONFIG.PROTECTED_PORTAL_URL}/Tree-tileset.png`,
    );
  }

  async create() {
    this.createCardImages();
    this.initSounds();
    this.initCamera();
    this.initMap();
    this.updateCameraBounds();
    this.physics.world.drawDebug = false;
    this.gameBoard = new Memory(this);

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
    if (this.isReady && this.finishedRendering) this.gameBoard.newGame();
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
    for (const crop of Object.keys(ALL_PRODUCE)) {
      this.load.image(crop, ITEM_DETAILS[crop as InventoryItemName].image);
    }

    this.load.image("cardback", "world/memory/cardback.png");
    this.load.image("cardfront", "world/memory/cardfront.png");

    this.load.spritesheet("poof", "world/poof.png", {
      frameWidth: 20,
      frameHeight: 19,
    });
  }

  public initMap() {
    this.map = this.make.tilemap({
      key: "memory_tilemap",
    });

    const tileset = this.map.addTilesetImage(
      "Sunnyside V3",
      "seasonal-tileset",
      16,
      16,
      1,
      2,
    ) as Phaser.Tilemaps.Tileset;
    const treeTileset = this.map.addTilesetImage(
      "Tree tileset",
      "Tree tileset",
      16,
      16,
      0,
      0,
    ) as Phaser.Tilemaps.Tileset;
    this.map.layers.forEach((layerData) => {
      const layer = this.map.createLayer(
        layerData.name,
        [tileset, treeTileset],
        0,
        0,
      );
      this.layers[layerData.name] = layer as Phaser.Tilemaps.TilemapLayer;
    });
    this.cameras.main.centerOn(
      (this.map.width / 2) * SQUARE_WIDTH,
      (this.map.height / 2 - 1) * SQUARE_WIDTH,
    );
  }

  public createCardImages() {
    const cardfront = this.add.sprite(0, 0, "cardfront");
    cardfront.setVisible(false);
    cardfront.setOrigin(0, 0);
    this.cameras.main.roundPixels = true;
    for (const crop of Object.keys(ALL_PRODUCE)) {
      const rt = this.make.renderTexture(
        { width: cardfront.width, height: cardfront.height },
        false,
      );
      this.textures.get(crop).setFilter(Phaser.Textures.NEAREST);
      const cropImage = this.add.sprite(0, 0, crop);
      cropImage.setOrigin(0, 0);
      cropImage.setVisible(false);
      const centerX = Math.floor((rt.width - cardfront.width) / 2);
      const centerY = Math.floor((rt.height - cardfront.height) / 2);
      rt.draw(cardfront, centerX, centerY);
      rt.draw(
        cropImage,
        centerX + Math.floor((cardfront.width - cropImage.width) / 2),
        centerY + Math.floor((cardfront.height - cropImage.height) / 2),
      );
      rt.saveTexture(`cardFront-${crop}`);
      cropImage.destroy();
    }
    cardfront.destroy();
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

  public get isPlaying() {
    return this.portalService?.state.matches("playing") === true;
  }
  public get isReady() {
    return this.portalService?.state.matches("ready") === true;
  }
  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter | undefined;
  }
  public get gameState() {
    return this.registry.get("gameState") as GameState;
  }

  public get score() {
    return this.portalService?.state?.context.score ?? 0;
  }
  public get movesMade() {
    return this.portalService ? this.portalService?.state.context.movesMade : 0;
  }
  public get maxMoves() {
    return this.portalService ? this.portalService?.state.context.maxMoves : 0;
  }
  public get health() {
    return this.portalService ? this.portalService?.state.context.health : 0;
  }
  public get solved() {
    return this.portalService
      ? this.portalService?.state.context.solved
      : false;
  }
}
