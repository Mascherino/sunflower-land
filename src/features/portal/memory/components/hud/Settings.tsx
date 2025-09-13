import React, { useState } from "react";

import settings from "assets/icons/settings.png";

import { PIXEL_SCALE } from "features/game/lib/constants";

import { useSound } from "lib/utils/hooks/useSound";
import classNames from "classnames";
import { RoundButton } from "components/ui/RoundButton";
import { SettingsModal } from "../modals/SettingsModal";

export const Settings: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const button = useSound("button");

  return (
    <div
      className="fixed z-50 flex flex-col justify-between"
      style={{
        right: `${PIXEL_SCALE * 3}px`,
        bottom: `${PIXEL_SCALE * 3}px`,
      }}
    >
      <RoundButton
        onClick={() => {
          button.play();
          setShowModal(true);
        }}
        className={classNames({
          "cursor-not-allowed opacity-50": false,
        })}
      >
        <img
          src={settings}
          id="settings"
          style={{
            height: `${PIXEL_SCALE * 14}px`,
            left: `${PIXEL_SCALE * 4}px`,
            top: `${PIXEL_SCALE * 4}px`,
          }}
          className="absolute group-active:translate-y-[2px]"
        />
      </RoundButton>
      <SettingsModal show={showModal} onHide={() => setShowModal(false)} />
    </div>
  );
};
