import { useState, useEffect } from "react";
import { LS_PREFIX, MINIGAME_NAME } from "./Constants";
import { defaultSettings, ChaacsTempleSettings } from "../lib/Settings";
import _ from "lodash";

const LOCAL_STORAGE_KEY = `${LS_PREFIX}.settings`;
export const CHAACSTEMPLE_SETTINGS_EVENT = `${MINIGAME_NAME}.settingsChanged`;

declare global {
  interface WindowEventMap {
    [CHAACSTEMPLE_SETTINGS_EVENT]: CustomEvent<ChaacsTempleSettings>;
  }
}

export function cacheChaacsTempleSettings(value: ChaacsTempleSettings) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent(CHAACSTEMPLE_SETTINGS_EVENT, { detail: value }),
  );
}

export function getChaacsTempleSettings(): ChaacsTempleSettings {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  return cached ? JSON.parse(cached) : { ...defaultSettings };
}

export const useSettings = () => {
  const [settings, setSettings] = useState(getChaacsTempleSettings());

  const setSetting = (value: ChaacsTempleSettings) => {
    setSettings((prev) => {
      const newSettings = _.merge({}, prev, value);
      cacheChaacsTempleSettings(newSettings);
      return newSettings;
    });
  };

  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    window.addEventListener(CHAACSTEMPLE_SETTINGS_EVENT, handleSettingsChange);

    return () => {
      window.removeEventListener(
        CHAACSTEMPLE_SETTINGS_EVENT,
        handleSettingsChange,
      );
    };
  }, []);

  return { settings, setSetting };
};
