import React, { useContext } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { OuterPanel } from "components/ui/Panel";
import { secondsToString } from "lib/utils/time";
import mark from "assets/icons/faction_mark.webp";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/MemoryMachine";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";

const todayHighscoreSel = (state: PortalMachineState) => {
  const currDate = new Date().toISOString().split("T")[0];
  const minigame = state.context.state?.minigames.games["memory"];
  const minigameHistory = minigame?.history ?? {};

  return minigameHistory[currDate]?.highscore ?? 0;
};
const minigamePrizeSel = (state: PortalMachineState) => {
  return state.context.state?.minigames.prizes["memory"];
};

export const MissionPrize: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const prize = useSelector(portalService, minigamePrizeSel);
  const todayHighscore = useSelector(portalService, todayHighscoreSel);

  if (!prize) {
    return (
      <OuterPanel>
        <div className="px-1">
          <Label type="danger" icon={SUNNYSIDE.icons.sad}>
            {t("memory.noPrizeAvailable")}
          </Label>
        </div>
      </OuterPanel>
    );
  }

  const missionComplete = todayHighscore >= prize.score;
  const secondsLeft = (prize.endAt - Date.now()) / 1000;

  return (
    <OuterPanel>
      <div className="px-1">
        <span className="text-xs mb-2">
          {t("memory.missionObjective", {
            targetScore: prize.score,
          })}
        </span>
        <div className="flex justify-between mt-2 flex-wrap">
          {missionComplete ? (
            <Label type="success" icon={SUNNYSIDE.icons.confirm}>
              {t("memory.completed")}
            </Label>
          ) : (
            <Label type="info" icon={SUNNYSIDE.icons.stopwatch}>
              {secondsToString(secondsLeft, { length: "medium" })}
            </Label>
          )}
          <div className="flex items-center space-x-2">
            {!!prize.items?.Mark && (
              <Label icon={mark} type="warning">
                {prize.items?.Mark + " x Mark"}
              </Label>
            )}
          </div>
        </div>
      </div>
    </OuterPanel>
  );
};
