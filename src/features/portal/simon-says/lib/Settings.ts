import {
  defaultBgmMuted,
  defaultBgmVolume,
  defaultEffectsMuted,
  defaultEffectsVolume,
  defaultSpeedScale,
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
  SpeedScale?: number;
}

export const defaultSettings: ChaacsTempleSettings = {
  Music: { volume: defaultBgmVolume, isMuted: defaultBgmMuted },
  Effects: { volume: defaultEffectsVolume, isMuted: defaultEffectsMuted },
  SpeedScale: defaultSpeedScale,
};
