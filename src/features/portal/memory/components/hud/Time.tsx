import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { secondsToString } from "lib/utils/time";
import useUiRefresher from "lib/utils/hooks/useUiRefresher";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/MemoryMachine";
import { DEFAULT_GAME_DURATION } from "../../util/Constants";

const _startAt = (state: PortalMachineState) => state.context.startAt;

export const Time: React.FC = () => {
  useUiRefresher({ delay: 100 });

  const { portalService } = useContext(PortalContext);

  const startAt = useSelector(portalService, _startAt);

  const endAt = startAt ? startAt + DEFAULT_GAME_DURATION * 1000 : 0;
  const secondsLeft = Math.max(endAt - Date.now(), 0) / 1000;

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
