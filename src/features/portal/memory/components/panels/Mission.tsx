import React, { useContext, useState } from "react";

import { Button } from "components/ui/Button";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { Label } from "components/ui/Label";
import { MissionPrize } from "./MissionPrize";
import { Attempts } from "./Attempts";
import { getAttemptsLeft } from "../../util/Utils";
import { goHome } from "features/portal/lib/portalUtil";
import { PortalMachineState } from "../../lib/MemoryMachine";
import { SUNNYSIDE } from "assets/sunnyside";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SquareIcon } from "components/ui/SquareIcon";
import codex from "assets/icons/codex.webp";
import { Guide } from "./Guide";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
  buttonDisabled: boolean;
}

const minigameSel = (state: PortalMachineState) =>
  state.context.state?.minigames.games["memory"];
const scoreSel = (state: PortalMachineState) => state.context.score;

export const Mission: React.FC<Props> = ({
  mode,
  showScore,
  showExitButton,
  confirmButtonText,
  onConfirm,
  buttonDisabled,
}) => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);

  const minigame = useSelector(portalService, minigameSel);
  const attemptsLeft = getAttemptsLeft(minigame);
  const score = useSelector(portalService, scoreSel);

  const dateKey = new Date().toISOString().slice(0, 10);

  const [currentPage, setCurrentPage] = useState<"main" | "guide">("main");

  // const [buttonDisabled, setButtonDisabled] = useState<boolean>();
  // console.log(buttonDisabled);

  // EventBus.emitter.on("GAME_READY", () => {
  //   console.log("Modal ready");
  //   setButtonDisabled(false);
  // });

  return (
    <>
      {currentPage === "main" && (
        <>
          <div>
            <div className="w-full relative flex justify-between gap-1 items-center mb-1 py-1 pl-2">
              {mode === "introduction" && (
                <Label type="default" icon={SUNNYSIDE.icons.plant}>
                  {t("memory.portal.title")}
                </Label>
              )}
              {mode === "success" && (
                <Label type="success" icon={SUNNYSIDE.icons.confirm}>
                  {t("memory.missionSuccess")}
                </Label>
              )}
              {mode === "failed" && (
                <Label type="danger" icon={SUNNYSIDE.icons.death}>
                  {t("memory.missionFailed")}
                </Label>
              )}
              <Attempts attemptsLeft={attemptsLeft} />
            </div>

            <div
              className="flex flex-row"
              style={{
                marginBottom: `${PIXEL_SCALE * 1}px`,
              }}
            >
              <div className="flex justify-between flex-col space-y-1 px-1 mb-3 text-sm flex-grow">
                {showScore && (
                  <span>
                    {t("memory.score", {
                      score: Math.round(score),
                    })}
                  </span>
                )}
                <span>
                  {t("memory.bestToday", {
                    score: minigame?.history[dateKey]?.highscore
                      ? Math.round(minigame?.history[dateKey]?.highscore)
                      : 0,
                  })}
                </span>
                <span>
                  {t("memory.bestAllTime", {
                    score: Object.values(minigame?.history ?? {}).reduce(
                      (acc, { highscore }) =>
                        Math.round(Math.max(acc, highscore)),
                      0,
                    ),
                  })}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <Button
                  className="whitespace-nowrap capitalize"
                  onClick={() => {
                    setCurrentPage("guide");
                  }}
                >
                  <div className="flex flex-row items-center gap-1">
                    <SquareIcon icon={codex} width={8} />
                  </div>
                </Button>
              </div>
            </div>

            <MissionPrize />
          </div>

          <div className="flex mt-1 space-x-1">
            {showExitButton && (
              <Button className="whitespace-nowrap capitalize" onClick={goHome}>
                {t("exit")}
              </Button>
            )}
            <Button
              disabled={buttonDisabled}
              className="whitespace-nowrap capitalize"
              onClick={onConfirm}
            >
              {confirmButtonText}
            </Button>
          </div>
        </>
      )}
      {currentPage === "guide" && (
        <Guide onBack={() => setCurrentPage("main")} />
      )}
    </>
  );
};
