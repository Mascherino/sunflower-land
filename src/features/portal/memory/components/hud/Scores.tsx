import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/MemoryMachine";
import { PIXEL_SCALE } from "features/game/lib/constants";

const scoreSel = (state: PortalMachineState) => state.context.score;
// const movesMadeSel = (state: PortalMachineState) => state.context.movesMade;

export const Scores: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const score = useSelector(portalService, scoreSel);
  // const movesMade = useSelector(portalService, movesMadeSel);

  return (
    <div
      className="relative"
      style={{ top: `${PIXEL_SCALE * 3}px`, left: `${PIXEL_SCALE * 3}px` }}
    >
      <div className="relative">
        <div className="h-6 w-full mt-0.5 bg-black bg-opacity-30 flex items-center rounded">
          <div
            className="flex items-center space-x-2 text-white"
            style={{
              width: "200px",
              paddingLeft: "4px",
            }}
          >
            <span className="flex items-center balance-text">
              {t("memory.score", { score: score })}
            </span>
          </div>
        </div>
      </div>
      {/* <div className="relative">
        <div className="h-6 w-full mt-0.5 bg-black bg-opacity-30 flex items-center rounded">
          <div
            className="flex items-center space-x-2 text-white"
            style={{
              width: "200px",
              paddingLeft: "4px",
            }}
          >
            <span className="flex items-center balance-text">
              {t("memory.moves", { movesMade: movesMade })}
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
};
