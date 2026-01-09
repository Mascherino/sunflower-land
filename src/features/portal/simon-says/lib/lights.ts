import { SQUARE_WIDTH } from "features/game/lib/constants";
import { Tilemaps } from "phaser";

export interface Light {
  name: string;
  x: number;
  y: number;
  radius: number;
  enabled: number;
  glow: number;
}

const lightNames = [
  "lifeBrazier_left",
  "lifeBrazier_middle",
  "lifeBrazier_right",
  "brazier_lefttop",
  "brazier_leftbottom",
  "brazier_righttop",
  "brazier_rightbottom",
  "brazier_bottomleft",
  "brazier_bottomright",
  "game",
  "bumpkin",
] as const;

export type LightName = (typeof lightNames)[number];

export function getDefaultLights(
  map: Tilemaps.Tilemap,
): Record<LightName, Light> {
  return {
    lifeBrazier_left: {
      name: "lifeBrazier_left",
      x: (map.width / 2 - 4.125) * SQUARE_WIDTH + 1,
      y: (map.height / 2 + 11) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 1.0,
    },
    lifeBrazier_middle: {
      name: "lifeBrazier_middle",
      x: (map.width / 2) * SQUARE_WIDTH,
      y: (map.height / 2 + 11) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 1.0,
    },
    lifeBrazier_right: {
      name: "lifeBrazier_right",
      x: (map.width / 2 + 4.125) * SQUARE_WIDTH - 1,
      y: (map.height / 2 + 11) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 1.0,
    },
    brazier_lefttop: {
      name: "brazier_lefttop",
      x: (map.width / 2 - 10.125) * SQUARE_WIDTH - 1,
      y: (map.height / 2 + 9.75) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 1.0,
    },
    brazier_leftbottom: {
      name: "brazier_leftbottom",
      x: (map.width / 2 - 10.125) * SQUARE_WIDTH - 1,
      y: (map.height / 2 - 0.875) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 1.0,
    },
    brazier_righttop: {
      name: "brazier_righttop",
      x: (map.width / 2 + 10.25) * SQUARE_WIDTH - 1,
      y: (map.height / 2 + 9.75) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 1.0,
    },
    brazier_rightbottom: {
      name: "brazier_rightbottom",
      x: (map.width / 2 + 10.25) * SQUARE_WIDTH - 1,
      y: (map.height / 2 - 0.875) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 1.0,
    },
    brazier_bottomleft: {
      name: "brazier_bottomleft",
      x: (map.width / 2 - 3.125) * SQUARE_WIDTH + 1,
      y: (map.height / 2 - 11.5) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 1.0,
    },
    brazier_bottomright: {
      name: "brazier_bottomright",
      x: (map.width / 2 + 3.125) * SQUARE_WIDTH - 1,
      y: (map.height / 2 - 11.5) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 1.0,
    },
    game: {
      name: "game",
      x: (map.width / 2) * SQUARE_WIDTH,
      y: (map.height / 2) * SQUARE_WIDTH,
      radius: 250,
      enabled: 1.0,
      glow: 0.0,
    },
    bumpkin: {
      name: "bumpkin",
      x: (map.width / 2 + 7.125) * SQUARE_WIDTH,
      y: (map.height / 2 - 6.5) * SQUARE_WIDTH,
      radius: 70,
      enabled: 1.0,
      glow: 0.0,
    },
  };
}
