import { SQUARE_WIDTH } from "features/game/lib/constants";
import { SimonSaysScene } from "../SimonSaysScene";
import {
  BRAZIER_DEPTH,
  BRAZIER_LIGHT_COLOR,
  BRAZIER_LIGHT_INTENSITY,
  BRAZIER_LIGHT_RADIUS,
} from "../util/Constants";
import { Brazier } from "./Brazier";
import { LightName } from "./lights";

function getDefaultBraziers(
  scene: SimonSaysScene,
): { name: LightName; x: number; y: number; radius?: number }[] {
  return [
    {
      name: "brazier_lefttop",
      x: (scene.map.width / 2 - 10) * SQUARE_WIDTH,
      y: (scene.map.height / 2 - 7) * SQUARE_WIDTH - 1,
      radius: 70,
    },
    {
      name: "brazier_leftbottom",
      x: (scene.map.width / 2 - 10) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 2.5) * SQUARE_WIDTH - 1,
      radius: 70,
    },
    {
      name: "brazier_righttop",
      x: (scene.map.width / 2 + 10) * SQUARE_WIDTH,
      y: (scene.map.height / 2 - 7) * SQUARE_WIDTH - 1,
      radius: 70,
    },
    {
      name: "brazier_rightbottom",
      x: (scene.map.width / 2 + 10) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 2.5) * SQUARE_WIDTH - 1,
      radius: 70,
    },
    {
      name: "brazier_bottomleft",
      x: (scene.map.width / 2 - 5) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 7) * SQUARE_WIDTH - 1,
      radius: 70,
    },
    {
      name: "brazier_bottomright",
      x: (scene.map.width / 2 + 5) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 7) * SQUARE_WIDTH - 1,
      radius: 70,
    },
    {
      name: "brazier_backleft_level3",
      x: (scene.map.width / 2 - 16) * SQUARE_WIDTH,
      y: (scene.map.height / 2 - 5) * SQUARE_WIDTH,
      radius: 80,
    },
    // {
    //   name: "brazier_backleft_level4",
    //   x: (scene.map.width / 2 - 18) * SQUARE_WIDTH,
    //   y: (scene.map.height / 2 - 3) * SQUARE_WIDTH,
    //   radius: 65,
    // },
    {
      name: "brazier_backright_level3",
      x: (scene.map.width / 2 + 16) * SQUARE_WIDTH,
      y: (scene.map.height / 2 - 5) * SQUARE_WIDTH,
      radius: 80,
    },
    // {
    //   name: "brazier_backright_level4",
    //   x: (scene.map.width / 2 + 18) * SQUARE_WIDTH,
    //   y: (scene.map.height / 2 - 3) * SQUARE_WIDTH,
    //   radius: 65,
    // },
    {
      name: "brazier_frontleft_level1",
      x: (scene.map.width / 2 - 12) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 10) * SQUARE_WIDTH,
      radius: 75,
    },
    {
      name: "brazier_frontleft_level2",
      x: (scene.map.width / 2 - 14) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 13) * SQUARE_WIDTH,
      radius: 75,
    },
    {
      name: "brazier_frontright_level1",
      x: (scene.map.width / 2 + 12) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 10) * SQUARE_WIDTH,
      radius: 80,
    },
    {
      name: "brazier_frontright_level2",
      x: (scene.map.width / 2 + 14) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 13) * SQUARE_WIDTH,
      radius: 80,
    },
    // {
    //   name: "brazier_monkeysleft",
    //   x: (scene.map.width / 2 - 6) * SQUARE_WIDTH,
    //   y: (scene.map.height / 2 - 10) * SQUARE_WIDTH - 1,
    // },
    // {
    //   name: "brazier_monkeysright",
    //   x: (scene.map.width / 2 + 6) * SQUARE_WIDTH,
    //   y: (scene.map.height / 2 - 10) * SQUARE_WIDTH - 1,
    // },
  ];
}

export function placeBraziers(scene: SimonSaysScene) {
  const braziers = getDefaultBraziers(scene);
  const res: Partial<Record<LightName, Brazier>> = {};
  braziers.forEach((brazier) => {
    const sprite = scene.add
      .sprite(brazier.x, brazier.y, "brazier_active")
      .setDepth(BRAZIER_DEPTH)
      .setPipeline("Light2D");
    const fire = scene.add
      .sprite(brazier.x, brazier.y - 14, "brazier_fire_active")
      .setDepth(BRAZIER_DEPTH)
      .setPipeline("Light2D")
      .play({ key: "brazier_fire_active_anim", randomFrame: true });
    const radius = brazier.radius ? brazier.radius : BRAZIER_LIGHT_RADIUS;
    const light = scene.lights.addLight(
      brazier.x,
      brazier.y,
      radius,
      BRAZIER_LIGHT_COLOR,
      BRAZIER_LIGHT_INTENSITY,
    );
    sprite.play("brazier_anim");
    res[brazier.name] = new Brazier(sprite, brazier.x, brazier.y, fire, light);
  });
  return res;
}

function loadLifeBrazierFiles(scene: Phaser.Scene) {
  scene.load.spritesheet(
    "life_brazier_active",
    "world/simon-says/lifebrazier_active.webp",
    {
      frameHeight: 24,
      frameWidth: 24,
    },
  );

  scene.load.spritesheet(
    "life_brazier_fire_active",
    "world/simon-says/lifebrazierfire_active.webp",
    {
      frameHeight: 13,
      frameWidth: 14,
    },
  );

  scene.load.spritesheet(
    "life_brazier_inactive",
    "world/simon-says/lifebrazier_end.webp",
    {
      frameHeight: 24,
      frameWidth: 24,
    },
  );

  scene.load.spritesheet(
    "life_brazier_fire_inactive",
    "world/simon-says/lifebrazierfire_end.webp",
    {
      frameHeight: 13,
      frameWidth: 14,
    },
  );
}

function _loadBrazierFiles(scene: Phaser.Scene) {
  scene.load.spritesheet(
    "brazier_active",
    "world/simon-says/brazier_active.webp",
    {
      frameHeight: 26,
      frameWidth: 16,
    },
  );

  scene.load.spritesheet(
    "brazier_inactive",
    "world/simon-says/brazier_inactive.webp",
    {
      frameHeight: 26,
      frameWidth: 16,
    },
  );

  scene.load.spritesheet(
    "brazier_fire_active",
    "world/simon-says/brazierfire_active.webp",
    { frameHeight: 13, frameWidth: 14 },
  );

  scene.load.spritesheet(
    "brazier_fire_inactive",
    "world/simon-says/brazierfire_inactive.webp",
    { frameHeight: 13, frameWidth: 14 },
  );
}

export function loadBrazierFiles(scene: Phaser.Scene) {
  loadLifeBrazierFiles(scene);
  _loadBrazierFiles(scene);
}

export function createBrazierAnimations(scene: Phaser.Scene) {
  if (!scene.anims.exists("brazier_anim"))
    scene.anims.create({
      key: "brazier_anim",
      frames: scene.anims.generateFrameNumbers("brazier_active"),
      frameRate: 10,
      repeat: -1,
    });

  if (!scene.anims.exists("brazier_inactive_anim"))
    scene.anims.create({
      key: "brazier_inactive_anim",
      frames: scene.anims.generateFrameNumbers("brazier_inactive"),
      frameRate: 10,
      repeat: 0,
    });

  if (!scene.anims.exists("brazier_fire_active_anim"))
    scene.anims.create({
      key: "brazier_fire_active_anim",
      frames: scene.anims.generateFrameNumbers("brazier_fire_active"),
      frameRate: 10,
      repeat: -1,
    });

  if (!scene.anims.exists("brazier_fire_inactive_anim"))
    scene.anims.create({
      key: "brazier_fire_inactive_anim",
      frames: scene.anims.generateFrameNumbers("brazier_fire_inactive"),
      frameRate: 10,
      repeat: 0,
    });

  // Life braziers
  if (!scene.anims.exists("life_brazier_active_anim"))
    scene.anims.create({
      key: "life_brazier_active_anim",
      frames: scene.anims.generateFrameNumbers("life_brazier_active"),
      frameRate: 10,
      repeat: -1,
    });

  if (!scene.anims.exists("life_brazier_fire_active_anim"))
    scene.anims.create({
      key: "life_brazier_fire_active_anim",
      frames: scene.anims.generateFrameNumbers("life_brazier_fire_active"),
      frameRate: 10,
      repeat: -1,
    });

  if (!scene.anims.exists("life_brazier_inactive_anim"))
    scene.anims.create({
      key: "life_brazier_inactive_anim",
      frames: scene.anims.generateFrameNumbers("life_brazier_inactive"),
      frameRate: 10,
      repeat: 0,
    });

  if (!scene.anims.exists("life_brazier_fire_inactive_anim"))
    scene.anims.create({
      key: "life_brazier_fire_inactive_anim",
      frames: scene.anims.generateFrameNumbers("life_brazier_fire_inactive"),
      frameRate: 10,
      repeat: 0,
    });
}
