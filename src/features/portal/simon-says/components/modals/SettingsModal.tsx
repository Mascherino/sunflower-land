/* eslint-disable react-hooks/use-memo */
import React, { useRef, useEffect, useState } from "react";

import { Button } from "components/ui/Button";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import {
  defaultBgmVolume,
  defaultEffectsVolume,
  SIMON_SAYS_NPC_WEARABLES,
} from "../../util/Constants";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { SUNNYSIDE } from "assets/sunnyside";
import { EventBus } from "../../lib/EventBus";
import { NumberInput } from "components/ui/NumberInput";
import Decimal from "decimal.js-light";
import { useSettings } from "../../util/useSettings";
import sound_on from "assets/icons/sound_on.png";
import { Howl } from "howler";

export const SettingsModal: React.FC<{ show: boolean; onHide: () => void }> = ({
  show,
  onHide,
}) => {
  const { t } = useAppTranslation();

  const { settings, setSetting } = useSettings();
  const ignoreNextBgmRef = useRef(false);
  const ignoreNextEffectsRef = useRef(false);
  const [effectsVolume, setEffectsVolume] = useState<Decimal>(
    new Decimal(settings.Effects?.volume ?? defaultEffectsVolume).mul(100),
  );
  const [bgmVolume, setBgmVolume] = useState<Decimal>(
    new Decimal(settings.Music?.volume ?? defaultBgmVolume).mul(100),
  );

  const button = new Howl({
    src: ["/world/simon-says/sounds/core.mp3"],
    preload: true,
    volume: 1,
  });

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

  EventBus.emitter.removeAllListeners("SETTINGS_SYNC");

  const emitBgmVolume = (volume: number) => {
    EventBus.emitter.emit("SETTINGS_CHANGED", {
      Music: { volume: volume },
    });
    setSetting({ Music: { volume: volume } });
  };

  const emitEffectsVolume = (volume: number) => {
    EventBus.emitter.emit("SETTINGS_CHANGED", {
      Effects: { volume: volume },
    });
    setSetting({ Effects: { volume: volume } });
  };

  const changeBgmVolume = (value: Decimal) => {
    // Divide by 100 to convert scale from 1 - 100 to 0.01 - 1.0
    let newValue = Math.floor(value.toNumber()) / 100;
    if (value.lessThan(1)) {
      value = new Decimal(1);
      newValue = 0.01;
    } else if (value.greaterThan(100)) {
      value = new Decimal(100);
      newValue = 1.0;
    }
    setBgmVolume(value);
    emitBgmVolume(newValue);
  };

  const changeEffectsVolume = (value: Decimal) => {
    // Divide by 100 to convert scale from 1 - 100 to 0.01 - 1.0
    let newValue = Math.floor(value.toNumber()) / 100;
    if (value.lessThan(1)) {
      value = new Decimal(1);
      newValue = 0.01;
    } else if (value.greaterThan(100)) {
      value = new Decimal(100);
      newValue = 1.0;
    }
    setEffectsVolume(value);
    emitEffectsVolume(newValue);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Panel
        className="sm:w-4/5 m-auto max-h-[65vh]"
        bumpkinParts={SIMON_SAYS_NPC_WEARABLES["Simon"]}
      >
        <div className="flex flex-col p-2 overflow-y-auto">
          <div className="h-5 flex flex-row items-center">
            <span className="w-3/4">{t("chaacsTemple.settings.bgmMuted")}</span>
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
            <span className="w-3/4">
              {t("chaacsTemple.settings.effectsMuted")}
            </span>
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

          {/* Seperator */}
          <div className="flex justify-center">
            <div className="w-full h-[1px] bg-brown-200 rounded my-4 opacity-75"></div>
          </div>

          <div className="flex flex-col mt-1.5">
            <div className="flex items-center">
              <span>{t("chaacsTemple.settings.bgmVolume")}</span>
            </div>
            <div className="flex flex-row items-center">
              <div className="w-full flex flex-row items-center mt-1.5">
                <Button
                  onClick={() => changeBgmVolume(bgmVolume.sub(10))}
                  className="w-[50%]"
                >
                  {"-10"}
                </Button>
                <Button
                  onClick={() => changeBgmVolume(bgmVolume.sub(1))}
                  className="w-[50%] mx-1"
                >
                  {"-1"}
                </Button>
                <NumberInput
                  readOnly={true}
                  maxDecimalPlaces={0}
                  allowNegative={false}
                  value={bgmVolume}
                  className="h-[50px] opacity-75 !cursor-not-allowed"
                />
                <Button
                  onClick={() => changeBgmVolume(bgmVolume.add(1))}
                  className="w-[50%] mx-1"
                >
                  {"+1"}
                </Button>
                <Button
                  onClick={() => changeBgmVolume(bgmVolume.add(10))}
                  className="w-[50%]"
                >
                  {"+10"}
                </Button>
              </div>
            </div>
          </div>

          {/* Seperator */}
          <div className="flex justify-center">
            <div className="w-full h-[1px] bg-brown-200 rounded my-4 opacity-75"></div>
          </div>

          <div className="flex flex-col mt-1.5">
            <div className="flex items-center">
              <span className="">
                {t("chaacsTemple.settings.effectsVolume")}
              </span>
              <img
                src={sound_on}
                className="group-active:translate-y-[2px] cursor-pointer ml-2"
                style={{ width: "25px", height: "25px" }}
                onClick={() => {
                  if (button.playing()) button.stop();
                  button.volume(Math.floor(effectsVolume.toNumber()) / 100);
                  button.play();
                }}
              />
            </div>
            <div className="w-full flex flex-row items-center mt-1.5">
              <Button
                onClick={() => changeEffectsVolume(effectsVolume.sub(10))}
                className="w-[50%]"
              >
                {"-10"}
              </Button>
              <Button
                onClick={() => changeEffectsVolume(effectsVolume.sub(1))}
                className="w-[50%] mx-1"
              >
                {"-1"}
              </Button>
              <NumberInput
                readOnly={true}
                maxDecimalPlaces={0}
                allowNegative={false}
                value={effectsVolume}
                className="h-[50px] opacity-75 !cursor-not-allowed"
              />
              <Button
                onClick={() => changeEffectsVolume(effectsVolume.add(1))}
                className="w-[50%] mx-1"
              >
                {"+1"}
              </Button>
              <Button
                onClick={() => changeEffectsVolume(effectsVolume.add(10))}
                className="w-[50%]"
              >
                {"+10"}
              </Button>
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
