/* eslint-disable react-hooks/purity */
import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { secondsToString } from "lib/utils/time";
import useUiRefresher from "lib/utils/hooks/useUiRefresher";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/SimonSaysMachine";

const startAtSel = (state: PortalMachineState) => state.context.startAt;

export const Time: React.FC = () => {
  useUiRefresher({ delay: 100 });

  const { portalService } = useContext(PortalContext);

  const startAt = useSelector(portalService, startAtSel);

  const timeElapsed = (Date.now() - startAt) / 1000;

  return (
    <Label
      className="absolute"
      icon={SUNNYSIDE.icons.stopwatch}
      type={"info"}
      style={{
        top: `${PIXEL_SCALE * 3}px`,
        right: `${PIXEL_SCALE * 3}px`,
      }}
    >
      {secondsToString(timeElapsed, {
        length: "full",
      })}
    </Label>
  );
};
