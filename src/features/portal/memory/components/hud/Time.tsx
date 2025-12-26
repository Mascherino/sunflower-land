/* eslint-disable react-hooks/purity */
import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { secondsToString } from "lib/utils/time";
import useUiRefresher from "lib/utils/hooks/useUiRefresher";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/MemoryMachine";

const endAtSel = (state: PortalMachineState) => state.context.endAt;
const durationSel = (state: PortalMachineState) => state.context.duration;

export const Time: React.FC = () => {
  useUiRefresher({ delay: 100 });

  const { portalService } = useContext(PortalContext);

  const endAt = useSelector(portalService, endAtSel);
  const duration = useSelector(portalService, durationSel);

  const secondsLeft = endAt
    ? Math.max(endAt - Date.now(), 0) / 1000
    : duration / 1000;

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
      {secondsToString(secondsLeft, {
        length: "full",
      })}
    </Label>
  );
};
