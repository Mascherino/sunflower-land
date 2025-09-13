import { useState, useEffect } from "react";
import { LS_PREFIX, MINIGAME_NAME } from "./Constants";
import { defaultSettings, MemorySettings } from "../lib/Settings";
import _ from "lodash";

const LOCAL_STORAGE_KEY = `${LS_PREFIX}.settings`;
export const MEMORY_SETTINGS_EVENT = `${MINIGAME_NAME}.settingsChanged`;

declare global {
  interface WindowEventMap {
    [MEMORY_SETTINGS_EVENT]: CustomEvent<MemorySettings>;
  }
}

export function cacheMemorySettings(value: MemorySettings) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent(MEMORY_SETTINGS_EVENT, { detail: value }),
  );
}

export function getMemorySettings(): MemorySettings {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  return cached ? JSON.parse(cached) : { ...defaultSettings };
}

export const useSettings = () => {
  const [settings, setSettings] = useState(getMemorySettings());

  const setSetting = (value: MemorySettings) => {
    setSettings((prev) => {
      const newSettings = _.merge({}, prev, value);
      cacheMemorySettings(newSettings);
      return newSettings;
    });
  };

  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    window.addEventListener(MEMORY_SETTINGS_EVENT, handleSettingsChange);

    return () => {
      window.removeEventListener(MEMORY_SETTINGS_EVENT, handleSettingsChange);
    };
  }, []);

  return { settings, setSetting };
};
