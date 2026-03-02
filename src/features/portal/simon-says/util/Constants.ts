import { Equipped } from "features/game/types/bumpkin";

export const MINIGAME_NAME = "chaacs-temple";

export const UNLIMITED_ATTEMPTS_COST = 3;
export const RESTOCK_ATTEMPTS_COST = 1;
export const HINT_COST = 0.25;
export const DAILY_ATTEMPTS = 5;
export const RESTOCK_ATTEMPTS = 3;

export const DEFAULT_SEQUENCE_LENGTH = 3;

export const LS_PREFIX = `minigames.${MINIGAME_NAME}`;

export const defaultBgmMuted = false;
export const defaultBgmVolume = 0.25;
export const defaultEffectsMuted = false;
export const defaultEffectsVolume = 0.65;
export const defaultDisableAnimations = false;

export const midOffset = 1.6;
export const outerOffset = 3.67;
export const blinkDuration = 0.5;

export const AMBIENT_COLOR = 0x050505;
export const GAME_LIGHT_COLOR = 0xeeeeee;
export const IMAGE_SCALE = 0.65;

export const BRAZIER_LIGHT_COLOR = 0xffe685;
export const BRAZIER_LIGHT_RADIUS = 62.5;
export const BRAZIER_LIGHT_INTENSITY = 2;
export const BRAZIER_DEPTH = 10;
export const LIFEBRAZER_LIGHT_RADIUS = 65;

export type SimonSaysNPC = "Simon";

export const SIMON_SAYS_NPC_WEARABLES: Record<SimonSaysNPC, Equipped> = {
  Simon: {
    background: "Farm Background",
    body: "Goblin Potion",
    onesie: "Maya Armor",
  },
};
