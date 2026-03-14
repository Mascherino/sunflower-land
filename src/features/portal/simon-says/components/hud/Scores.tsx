import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/SimonSaysMachine";
import { PIXEL_SCALE } from "features/game/lib/constants";

const scoreSel = (state: PortalMachineState) => state.context.score;
const totalLengthSel = (state: PortalMachineState) => state.context.totalLength;
const currentLengthSel = (state: PortalMachineState) =>
  state.context.currentLength;

export const Scores: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const score = useSelector(portalService, scoreSel);
  const totalLength = useSelector(portalService, totalLengthSel);
  const currentLength = useSelector(portalService, currentLengthSel);

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
              {t("chaacsTemple.score", { score: score })}
            </span>
          </div>
        </div>
      </div>
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
              {t("chaacsTemple.totalLength", { totalLength: totalLength })}
            </span>
          </div>
        </div>
        <div className="h-6 w-full mt-0.5 bg-black bg-opacity-30 flex items-center rounded">
          <div
            className="flex items-center space-x-2 text-white"
            style={{
              width: "200px",
              paddingLeft: "4px",
            }}
          >
            <span className="flex items-center balance-text">
              {t("chaacsTemple.currentLength", {
                currentLength: currentLength,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
