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
  "brazier_monkeysleft",
  "brazier_monkeysright",
  "game",
  "bumpkin",
  "npc",
] as const;

export type LightName = (typeof lightNames)[number];
