import { Equipped } from "features/game/types/bumpkin";

export const MINIGAME_NAME = "simon_says";

export const UNLIMITED_ATTEMPTS_COST = 3;
export const RESTOCK_ATTEMPTS_COST = 1;
export const HINT_COST = 0.25;
export const DAILY_ATTEMPTS = 5;
export const RESTOCK_ATTEMPTS = 3;

export const DEFAULT_SEQUENCE_LENGTH = 3;

export const LS_PREFIX = "minigames.simon_says";

export const defaultBgmMuted = false;
export const defaultBgmVolume = 0.25;
export const defaultEffectsMuted = false;
export const defaultEffectsVolume = 0.65;
export const defaultDisableAnimations = false;

export const midOffset = 1.75;
export const outerOffset = 4.25;
export const blinkDuration = 0.5;

export type SimonSaysNPC = "Simon";

export const SIMON_SAYS_NPC_WEARABLES: Record<SimonSaysNPC, Equipped> = {
  Simon: {
    background: "Farm Background",
    hair: "Greyed Glory",
    body: "Beige Farmer Potion",
    shirt: "Blue Blossom Shirt",
    beard: "Wise Beard",
    pants: "Blue Suspenders",
    shoes: "Bumpkin Boots",
    tool: "Kama",
    hat: "Straw Hat",
  },
};
