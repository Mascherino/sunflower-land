import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/SimonSaysMachine";
import { PIXEL_SCALE } from "features/game/lib/constants";
import classNames from "classnames";
import "../../assets/Healthbar.css";

const healthSel = (state: PortalMachineState) => state.context.lives;
const maxMovesSel = (state: PortalMachineState) => state.context.maxMoves;

export const Healthbar: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const health = useSelector(portalService, healthSel);
  const maxMoves = useSelector(portalService, maxMovesSel);
  const progress = Math.min(Math.round((health / maxMoves) * 100), 100);

  return (
    <div
      className={classNames(
        "relative rounded border-2 border-black border-opacity-0 bg-black bg-opacity-30",
        {
          borderBlink: progress < 10,
        },
      )}
      style={{ top: `${PIXEL_SCALE * 6}px`, left: `${PIXEL_SCALE * 3 - 2}px` }}
    >
      <div className="relative">
        <div className="h-6 w-full mt-0.5 flex items-center">
          <div
            className="flex items-center space-x-2 text-white"
            style={{
              width: "200px",
              paddingLeft: "4px",
            }}
          >
            <span className="flex items-center balance-text">
              {t("memory.movesRemaining")}
            </span>
          </div>
        </div>
      </div>
      <div className={classNames("w-[200px] h-6 mt-1")}>
        <div
          className={`h-full bg-gradient-to-r from-red-600 via-yellow-300 to-green-600 text-right transition-all duration-300 ease-in-out`}
          style={{ width: `${progress}%`, backgroundSize: "200px 100%" }}
        >
          <span className="p-[5px] text-white font-bold">{health}</span>
        </div>
      </div>
    </div>
  );
};
