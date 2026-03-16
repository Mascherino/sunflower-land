import { Button } from "components/ui/Button";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import React, { useContext } from "react";
import { HINT_COST, SIMON_SAYS_NPC_WEARABLES } from "../../../util/Constants";
import { formatNumber } from "lib/utils/formatNumber";
import { SUNNYSIDE } from "assets/sunnyside";
import flowerIcon from "assets/icons/flower_token.webp";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../../lib/PortalProvider";
import { PortalMachineState } from "../../../lib/SimonSaysMachine";
import Decimal from "decimal.js-light";
import { Panel } from "components/ui/Panel";
import { useSound } from "lib/utils/hooks/useSound";
import { purchase } from "features/portal/lib/portalUtil";
import { Separator } from "../../Separator";

const flowerBalanceSel = (state: PortalMachineState) =>
  state.context.state?.balance ?? new Decimal(0);

type Props = {
  onBack: () => void;
  onHide: () => void;
};

export const BuyHintPanel: React.FC<Props> = ({ onBack, onHide }) => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);
  const flowerBalance = useSelector(portalService, flowerBalanceSel);

  const button = useSound("button");

  const onConfirm = () => {
    onHide();
    purchase({ sfl: HINT_COST, items: {} });
  };

  return (
    <Panel
      className="sm:w-4/5 m-auto"
      bumpkinParts={SIMON_SAYS_NPC_WEARABLES["Simon"]}
    >
      <div>
        <div className="flex flex-col gap-1">
          <div className="flex text-center items-center">
            <div
              style={{
                width: `${PIXEL_SCALE * 11}px`,
                height: `${PIXEL_SCALE * 12}px`,
                marginLeft: `${PIXEL_SCALE * 2}px`,
              }}
              className="z-10"
            >
              <img
                src={SUNNYSIDE.icons.arrow_left}
                className="cursor-pointer"
                onClick={() => {
                  button.play();
                  onBack();
                }}
                style={{
                  width: `${PIXEL_SCALE * 11}px`,
                  height: `${PIXEL_SCALE * 12}px`,
                }}
              />
            </div>
            <div
              className={`flex flex-row w-full text-base justify-center`}
              style={{ marginLeft: `-${PIXEL_SCALE * 13}px` }}
            >
              <span className="underline">{"Buy a hint"}</span>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col items-start w-full">
          <div className="text-xs text-start w-full m-1">
            {t("chaacsTemple.shop.hint.description")}
          </div>
          <span className="text-xs text-start w-full m-1">
            {t("chaacsTemple.shop.hint.question")}
          </span>
          <div className="flex items-center">
            <p className="text-xs text-start w-full m-1">
              {t("chaacsTemple.shop.hint.cost", { cost: HINT_COST })}
            </p>
            <img
              src={flowerIcon}
              style={{
                height: `${PIXEL_SCALE * 8}px`,
              }}
            />
          </div>
          <div className="flex items-center">
            <p className="text-xs text-start w-full m-1">
              {t("chaacsTemple.currentBalance", {
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
      </div>
      <div className="flex justify-content-around mt-2 space-x-1">
        <Button disabled={flowerBalance.lt(HINT_COST)} onClick={onConfirm}>
          {t("chaacsTemple.buyHint")}
        </Button>
      </div>
    </Panel>
  );
};
