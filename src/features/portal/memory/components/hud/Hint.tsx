import React, { useContext, useState } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/MemoryMachine";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";
import { BuyHintModal } from "../modals/BuyHint";
import classNames from "classnames";
import { Button } from "components/ui/Button";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

const canBuyHintSel = (state: PortalMachineState) => state.context.canBuyHint;

export const Hint: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const canBuyHint = useSelector(portalService, canBuyHintSel);

  const button = useSound("button");

  const [showModal, setShowModal] = useState(false);

  const onClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <BuyHintModal show={showModal} onHide={onClose} />
      <div
        className="fixed flex flex-row h-10 justify-center w-full"
        style={{
          bottom: `${PIXEL_SCALE * 3}px`,
          height: `${PIXEL_SCALE * 23}px`,
        }}
      >
        <Button
          disabled={!canBuyHint}
          variant="primary"
          className={classNames("w-40 h-full font-bold", {
            "cursor-not-allowed opacity-50": !canBuyHint,
          })}
          onClick={() => {
            if (canBuyHint) {
              button.play();
              setShowModal(true);
            }
          }}
        >
          {t("memory.buyHint")}
        </Button>
      </div>
    </>
  );
};
