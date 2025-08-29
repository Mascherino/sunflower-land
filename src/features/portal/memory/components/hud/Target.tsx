import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { SUNNYSIDE } from "assets/sunnyside";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/MemoryMachine";
import { PIXEL_SCALE } from "features/game/lib/constants";

const maxMovesSel = (state: PortalMachineState) => state.context.maxMoves;
const movesMadeSel = (state: PortalMachineState) => state.context.movesMade;
const targetScoreSel = (state: PortalMachineState) => state.context.targetScore;
const scoreSel = (state: PortalMachineState) => state.context.score;

export const Target: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const maxMoves = useSelector(portalService, maxMovesSel);
  const movesMade = useSelector(portalService, movesMadeSel);
  const targetScore = useSelector(portalService, targetScoreSel);
  const score = useSelector(portalService, scoreSel);

  const isTargetReached = movesMade <= maxMoves && score >= targetScore;

  return (
    <Label
      icon={SUNNYSIDE.resource.pirate_bounty}
      secondaryIcon={isTargetReached ? SUNNYSIDE.icons.confirm : undefined}
      type={isTargetReached ? "success" : "vibrant"}
      style={{
        top: `${PIXEL_SCALE * 3}px`,
        left: `${PIXEL_SCALE * 3}px`,
      }}
    >
      {t("memory.target", {
        maxMoves: maxMoves + 1,
        targetScore: targetScore,
      })}
    </Label>
  );
};
