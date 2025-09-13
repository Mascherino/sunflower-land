import React, { useRef, useEffect, useCallback } from "react";

import { Button } from "components/ui/Button";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { MEMORY_NPC_WEARABLES } from "../../util/Constants";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { SUNNYSIDE } from "assets/sunnyside";
import { EventBus } from "../../lib/EventBus";
import { NumberInput } from "components/ui/NumberInput";
import Decimal from "decimal.js-light";
import debounce from "lodash.debounce";
import { useSettings } from "../../util/useSettings";

export const SettingsModal: React.FC<{ show: boolean; onHide: () => void }> = ({
  show,
  onHide,
}) => {
  const { t } = useAppTranslation();

  const { settings, setSetting } = useSettings();
  const ignoreNextBgmRef = useRef(false);
  const ignoreNextEffectsRef = useRef(false);

  // Ignore first change after opening modal to prevent initial value setting
  // from firing event
  useEffect(() => {
    if (show) {
      ignoreNextBgmRef.current = true;
      ignoreNextEffectsRef.current = true;
    }
  }, [show]);

  const toggleBgmMuted = () => {
    setSetting({ Music: { isMuted: !settings.Music?.isMuted } });
    EventBus.emitter.emit("SETTINGS_CHANGED", {
      Music: { isMuted: !settings.Music?.isMuted },
    });
  };

  const toggleEffectsMuted = () => {
    setSetting({ Effects: { isMuted: !settings.Effects?.isMuted } });
    EventBus.emitter.emit("SETTINGS_CHANGED", {
      Effects: { isMuted: !settings.Effects?.isMuted },
    });
  };

  const toggleAnimationsDisabled = () => {
    setSetting({ isAnimationsDisabled: !settings.isAnimationsDisabled });
    EventBus.emitter.emit("SETTINGS_CHANGED", {
      isAnimationsDisabled: !settings.isAnimationsDisabled,
    });
  };

  EventBus.emitter.removeAllListeners("SETTINGS_SYNC");

  const emitBgmVolume = useCallback(
    debounce((volume) => {
      EventBus.emitter.emit("SETTINGS_CHANGED", {
        Music: { volume: volume },
      });
      setSetting({ Music: { volume: volume } });
    }, 300),
    [],
  );

  const emitEffectsVolume = useCallback(
    debounce((volume) => {
      EventBus.emitter.emit("SETTINGS_CHANGED", {
        Effects: { volume: volume },
      });
      setSetting({ Effects: { volume: volume } });
    }, 300),
    [],
  );

  const changeBgmVolume = (value: Decimal) => {
    if (ignoreNextBgmRef.current) {
      ignoreNextBgmRef.current = false;
      return;
    }
    const newValue = value.toNumber();
    if (newValue < 0.01 || newValue > 1.0) return;
    emitBgmVolume(value.toNumber());
  };

  const changeEffectsVolume = (value: Decimal) => {
    if (ignoreNextEffectsRef.current) {
      ignoreNextEffectsRef.current = false;
      return;
    }
    const newValue = value.toNumber();
    if (newValue < 0.01 || newValue > 1.0) return;
    emitEffectsVolume(value.toNumber());
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Panel
        className="sm:w-4/5 m-auto max-h-[65vh]"
        bumpkinParts={MEMORY_NPC_WEARABLES["Maschs"]}
      >
        <div className="flex flex-col p-2 overflow-y-auto">
          <div className="h-5 flex flex-row items-center">
            <span className="w-3/4">{t("memory.settings.bgmMuted")}</span>
            <div className="h-full w-1/4 flex flex-row items-center justify-center">
              <img
                src={
                  settings.Music?.isMuted
                    ? SUNNYSIDE.ui.turn_on
                    : SUNNYSIDE.ui.turn_off
                }
                className="h-full cursor-pointer"
                onClick={toggleBgmMuted}
              />
            </div>
          </div>

          <div className="h-5 flex flex-row items-center mt-2">
            <span className="w-3/4">{t("memory.settings.effectsMuted")}</span>
            <div className="h-full w-1/4 flex flex-row items-center justify-center">
              <img
                src={
                  settings.Effects?.isMuted
                    ? SUNNYSIDE.ui.turn_on
                    : SUNNYSIDE.ui.turn_off
                }
                className="h-full cursor-pointer"
                onClick={toggleEffectsMuted}
              />
            </div>
          </div>

          <div className="h-5 flex flex-row items-center mt-2">
            <span className="w-3/4">
              {t("memory.settings.disableAnimations")}
            </span>
            <div className="h-full w-1/4 flex flex-row items-center justify-center">
              <img
                src={
                  settings.isAnimationsDisabled
                    ? SUNNYSIDE.ui.turn_on
                    : SUNNYSIDE.ui.turn_off
                }
                className="h-full cursor-pointer"
                onClick={toggleAnimationsDisabled}
              />
            </div>
          </div>

          {/* Seperator */}
          <div className="flex justify-center">
            <div className="w-full h-[1px] bg-brown-200 rounded my-4 opacity-75"></div>
          </div>

          <div className="flex flex-row items-center">
            <span className="w-3/4">{t("memory.settings.bgmVolume")}</span>
            <div className="w-1/4">
              <NumberInput
                maxDecimalPlaces={2}
                allowNegative={false}
                value={settings.Music?.volume ?? 0}
                onValueChange={(value) => changeBgmVolume(value)}
              />
            </div>
          </div>

          <div className="flex flex-row items-center mt-1.5">
            <span className="w-3/4">{t("memory.settings.effectsVolume")}</span>
            <div className="w-1/4">
              <NumberInput
                maxDecimalPlaces={2}
                allowNegative={false}
                value={settings.Effects?.volume ?? 0}
                onValueChange={(value) => changeEffectsVolume(value)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-content-around mt-2 space-x-1">
          <Button onClick={onHide}>{t("close")}</Button>
        </div>
      </Panel>
    </Modal>
  );
};
