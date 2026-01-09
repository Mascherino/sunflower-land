import React, { useContext } from "react";

import { useSelector } from "@xstate/react";
import { Button } from "components/ui/Button";

import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/SimonSaysMachine";
import { HINT_COST, SIMON_SAYS_NPC_WEARABLES } from "../../util/Constants";
import { purchase } from "features/portal/lib/portalUtil";
import { formatNumber } from "lib/utils/formatNumber";
import flowerIcon from "assets/icons/flower_token.webp";
import Decimal from "decimal.js-light";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { PIXEL_SCALE } from "features/game/lib/constants";

const flowerBalanceSel = (state: PortalMachineState) =>
  state.context.state?.balance ?? new Decimal(0);

const hintEnabledSel = (state: PortalMachineState) => state.context.canBuyHint;

export const BuyHintModal: React.FC<{ show: boolean; onHide: () => void }> = ({
  show,
  onHide,
}) => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);
  const flowerBalance = useSelector(portalService, flowerBalanceSel);
  const canBuyHint = useSelector(portalService, hintEnabledSel);

  const onConfirm = () => {
    onHide();
    purchase({ sfl: HINT_COST, items: {} });
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Panel
        className="sm:w-4/5 m-auto"
        bumpkinParts={SIMON_SAYS_NPC_WEARABLES["Simon"]}
      >
        <div className="flex flex-col p-2 items-start">
          <span className="text-sm text-start w-full m-1">
            {t("memory.hintDescription")}
          </span>
          <span className="text-sm text-start w-full m-1">
            {t("memory.buyHintQuestion")}
          </span>
          <div className="flex items-center">
            <p className="text-sm text-start w-full m-1">
              {t("memory.hintCost", { cost: HINT_COST })}
            </p>
            <img
              src={flowerIcon}
              style={{
                height: `${PIXEL_SCALE * 8}px`,
              }}
            />
          </div>
          <div className="flex items-center">
            <p className="text-sm text-start w-full m-1">
              {t("memory.currentBalance", {
                balance: formatNumber(flowerBalance),
              })}
            </p>
            <img
              src={flowerIcon}
              style={{
                height: `${PIXEL_SCALE * 8}px`,
              }}
            />
          </div>
        </div>
        <div className="flex justify-content-around mt-2 space-x-1">
          <Button onClick={onHide}>{t("cancel")}</Button>
          <Button
            disabled={flowerBalance.lt(HINT_COST) || !canBuyHint}
            onClick={onConfirm}
          >
            {t("memory.buyHint")}
          </Button>
        </div>
      </Panel>
    </Modal>
  );
};
