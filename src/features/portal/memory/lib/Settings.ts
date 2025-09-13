import {
  defaultBgmMuted,
  defaultBgmVolume,
  defaultEffectsMuted,
  defaultEffectsVolume,
} from "../util/Constants";

export interface MemorySettings {
  Music?: {
    volume?: number;
    isMuted?: boolean;
  };
  Effects?: {
    volume?: number;
    isMuted?: boolean;
  };
  isAnimationsDisabled?: boolean;
}

export const defaultSettings: MemorySettings = {
  Music: { volume: defaultBgmVolume, isMuted: defaultBgmMuted },
  Effects: { volume: defaultEffectsVolume, isMuted: defaultEffectsMuted },
  isAnimationsDisabled: false,
};
