import React, { useContext, useState } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/MemoryMachine";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";
import { RoundButton } from "components/ui/RoundButton";
import { BuyHintModal } from "../modals/BuyHint";
import lightning from "/world/lightning.png";
import classNames from "classnames";

const canBuyHintSel = (state: PortalMachineState) => state.context.canBuyHint;

export const Hint: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const canBuyHint = useSelector(portalService, canBuyHintSel);

  const button = useSound("button");

  const [showModal, setShowModal] = useState(false);

  const onClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <div
        className="fixed z-50 flex flex-col justify-between"
        style={{
          right: `${PIXEL_SCALE * 3}px`,
          top: `${PIXEL_SCALE * 15}px`,
        }}
      >
        <RoundButton
          onClick={() => {
            if (canBuyHint) {
              button.play();
              setShowModal(true);
            }
          }}
          disabled={!canBuyHint}
          className={classNames({
            "cursor-not-allowed opacity-50": !canBuyHint,
          })}
        >
          <img
            src={lightning}
            id="lightning"
            style={{
              height: `${PIXEL_SCALE * 12}px`,
              left: `${PIXEL_SCALE * 7}px`,
              top: `${PIXEL_SCALE * 5}px`,
            }}
            className="absolute group-active:translate-y-[2px]"
          />
        </RoundButton>
        <BuyHintModal show={showModal} onHide={onClose} />
      </div>
    </>
  );
};
