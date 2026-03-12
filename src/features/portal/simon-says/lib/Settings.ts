import {
  defaultBgmMuted,
  defaultBgmVolume,
  defaultEffectsMuted,
  defaultEffectsVolume,
} from "../util/Constants";

export interface ChaacsTempleSettings {
  Music?: {
    volume?: number;
    isMuted?: boolean;
  };
  Effects?: {
    volume?: number;
    isMuted?: boolean;
  };
}

export const defaultSettings: ChaacsTempleSettings = {
  Music: { volume: defaultBgmVolume, isMuted: defaultBgmMuted },
  Effects: { volume: defaultEffectsVolume, isMuted: defaultEffectsMuted },
};
