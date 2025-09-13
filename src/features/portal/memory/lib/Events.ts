export type EVENTS = {
  SETTINGS_CHANGED: {
    Music?: { volume?: number; isMuted?: boolean };
    Effects?: { volume?: number; isMuted?: boolean };
    isAnimationsDisabled?: boolean;
  };
};
