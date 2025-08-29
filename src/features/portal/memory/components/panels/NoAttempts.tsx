import React, { useContext } from "react";

import { useSelector } from "@xstate/react";
import { Button } from "components/ui/Button";

import { PortalContext } from "../../lib/PortalProvider";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/MemoryMachine";
import sfl from "assets/icons/sfl.webp";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import {
  MEMORY_NPC_WEARABLES,
  RESTOCK_ATTEMPTS,
  RESTOCK_ATTEMPTS_COST,
  UNLIMITED_ATTEMPTS_COST,
} from "../../util/Constants";
import { purchase } from "features/portal/lib/portalUtil";
import { SUNNYSIDE } from "assets/sunnyside";
import { formatNumber } from "lib/utils/formatNumber";
import flowerIcon from "assets/icons/flower_token.webp";
import Decimal from "decimal.js-light";
import { PIXEL_SCALE } from "features/game/lib/constants";

const flowerBalanceSel = (state: PortalMachineState) =>
  state.context.state?.balance ?? new Decimal(0);

export const NoAttempts: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const flowerBalance = useSelector(portalService, flowerBalanceSel);

  return (
    <CloseButtonPanel bumpkinParts={MEMORY_NPC_WEARABLES["Maschs"]}>
      <div className="p-2">
        <div className="flex gap-1 justify-between items-center mb-2">
          <Label icon={SUNNYSIDE.icons.lock} type="danger">
            {t("memory.noAttemptsLeft")}
          </Label>
          <Label
            icon={sfl}
            type={
              flowerBalance.lt(RESTOCK_ATTEMPTS_COST) ? "danger" : "default"
            }
          >
            {t("memory.flowerRequired")}
          </Label>
        </div>

        <p className="text-sm mb-2">{t("memory.youHaveRunOutOfAttempts")}</p>
        <p className="text-sm mb-2">{t("memory.unlockUnlimited")}</p>

        <div className="flex items-center space-x-1 relative">
          <p className="balance-text">{formatNumber(flowerBalance)}</p>
          <img
            src={flowerIcon}
            alt="SFL"
            style={{
              width: `${PIXEL_SCALE * 11}px`,
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Button onClick={() => portalService.send("CANCEL_PURCHASE")}>
          {t("back")}
        </Button>
        <Button
          disabled={flowerBalance.lt(RESTOCK_ATTEMPTS_COST)}
          onClick={() =>
            purchase({
              sfl: RESTOCK_ATTEMPTS_COST,
              items: {},
            })
          }
        >
          {t("memory.buyAttempts", {
            attempts: RESTOCK_ATTEMPTS,
            cost: RESTOCK_ATTEMPTS_COST,
          })}
        </Button>
        <Button
          disabled={flowerBalance.lt(UNLIMITED_ATTEMPTS_COST)}
          onClick={() =>
            purchase({
              sfl: UNLIMITED_ATTEMPTS_COST,
              items: {},
            })
          }
        >
          {t("memory.unlockUnlimitedAttempts", {
            cost: UNLIMITED_ATTEMPTS_COST,
          })}
        </Button>
      </div>
    </CloseButtonPanel>
  );
};
