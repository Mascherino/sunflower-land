import { Equipped } from "features/game/types/bumpkin";

export const MINIGAME_NAME = "memory";

export const UNLIMITED_ATTEMPTS_COST = 3;
export const RESTOCK_ATTEMPTS_COST = 1;
export const HINT_COST = 0.5;
export const DAILY_ATTEMPTS = 5;
export const RESTOCK_ATTEMPTS = 3;

export const FLIP_BACK_DELAY = 500;
export const AFTER_FLIP_DELAY = 250;
export const VANISH_DELAY = Math.max(500 - AFTER_FLIP_DELAY, 0);

export const DEFAULT_GAME_ROWS = 5;
export const DEFAULT_GAME_COLUMNS = 6;

// Default game duration in minutes
export const DEFAULT_GAME_DURATION = 10.5;

export const MATCH_FOUND_HEALTH = 5;

export const LS_PREFIX = "minigames.memory";

export const defaultBgmMuted = false;
export const defaultBgmVolume = 0.25;
export const defaultEffectsMuted = false;
export const defaultEffectsVolume = 0.65;
export const defaultDisableAnimations = false;

export type MemoryNPC = "Maschs";

export const MEMORY_NPC_WEARABLES: Record<MemoryNPC, Equipped> = {
  Maschs: {
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
