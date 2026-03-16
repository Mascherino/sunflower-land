import React, { useContext, useState } from "react";

import { useSelector } from "@xstate/react";
import { Button } from "components/ui/Button";

import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/SimonSaysMachine";
import { SIMON_SAYS_NPC_WEARABLES } from "../../util/Constants";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { BuyHintPanel } from "../panels/Shop/Hint";
import { Separator } from "../Separator";
import { BuyLowerThresholdPanel } from "../panels/Shop/ScoreThreshold";
import { hasBoughtLowerThreshold } from "../../util/Utils";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { useSound } from "lib/utils/hooks/useSound";

const hintEnabledSel = (state: PortalMachineState) => state.context.canBuyHint;
const minigameSel = (state: PortalMachineState) =>
  state.context.state?.minigames.games["chaacs-temple"];
const totalLengthSel = (state: PortalMachineState) => state.context.totalLength;

export const ShopModal: React.FC<{ show: boolean; onHide: () => void }> = ({
  show,
  onHide,
}) => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);
  const canBuyHint = useSelector(portalService, hintEnabledSel);

  const [currentPage, setCurrentPage] = useState<"shop" | "hint" | "threshold">(
    "shop",
  );

  const minigame = useSelector(portalService, minigameSel);
  const totalLength = useSelector(portalService, totalLengthSel);
  const hasBoughtThreshold = hasBoughtLowerThreshold(minigame);

  const button = useSound("button");

  return (
    <Modal show={show} onHide={onHide}>
      {currentPage === "shop" && (
        <Panel
          className="sm:w-4/5 m-auto"
          bumpkinParts={SIMON_SAYS_NPC_WEARABLES["Simon"]}
        >
          <div className="flex flex-col p-2 w-full">
            <div className="flex flex-col gap-1">
              <div className="flex text-center items-center">
                <div
                  className={`flex flex-row w-full mb-3 text-lg justify-center`}
                  style={{ marginRight: `-${PIXEL_SCALE * 11}px` }}
                >
                  <span>{t("chaacsTemple.shop")}</span>
                </div>
                <div
                  style={{
                    width: `${PIXEL_SCALE * 9}px`,
                    height: `${PIXEL_SCALE * 9}px`,
                    marginRight: `${PIXEL_SCALE * 2}px`,
                  }}
                  className="z-10"
                >
                  <img
                    src={SUNNYSIDE.icons.close}
                    className="cursor-pointer"
                    onClick={() => {
                      button.play();
                      onHide();
                    }}
                    style={{
                      width: `${PIXEL_SCALE * 9}px`,
                      height: `${PIXEL_SCALE * 9}px`,
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col items-center">
              <Button
                disabled={!canBuyHint}
                className="w-4/5"
                onClick={() => setCurrentPage("hint")}
              >
                {t("chaacsTemple.buyHint")}
              </Button>
              <Button
                disabled={hasBoughtThreshold || totalLength <= 6}
                className="w-4/5"
                onClick={() => setCurrentPage("threshold")}
              >
                {t("chaacsTemple.shop.buyLowerThreshold")}
              </Button>
            </div>
          </div>
        </Panel>
      )}
      {currentPage === "hint" && (
        <BuyHintPanel
          onBack={() => setCurrentPage("shop")}
          onHide={() => {
            onHide();
            setCurrentPage("shop");
          }}
        />
      )}
      {currentPage === "threshold" && (
        <BuyLowerThresholdPanel
          onBack={() => setCurrentPage("shop")}
          onHide={() => {
            setCurrentPage("shop");
            onHide();
          }}
        ></BuyLowerThresholdPanel>
      )}
    </Modal>
  );
};
