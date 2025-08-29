import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { HudContainer } from "components/ui/HudContainer";
import { PortalMachineState } from "../../lib/MemoryMachine";
import { Time } from "./Time";
import { Exit } from "./Exit";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { Scores } from "./Scores";
import { Target } from "./Target";
import { Hint } from "./Hint";

const isPlayingSel = (state: PortalMachineState) => state.matches("playing");

export const Hud: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const isPlaying = useSelector(portalService, isPlayingSel);

  return (
    <HudContainer zIndex={"99"}>
      <div>
        <div
          className="absolute"
          style={{
            top: `${PIXEL_SCALE * 0}px`,
            left: `${PIXEL_SCALE * 3}px`,
          }}
        >
          {isPlaying && (
            <>
              <Target />
              <Scores />
              <Hint />
            </>
          )}
        </div>

        {
          <>
            <Exit />
          </>
        }
        {isPlaying && (
          <>
            <Time />
          </>
        )}
      </div>
    </HudContainer>
  );
};
