import React, { useState } from "react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";
import classNames from "classnames";
import { Button } from "components/ui/Button";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { ShopModal } from "../modals/Shop";
import { GuideModal } from "../modals/Guide";

export const BottomRow: React.FC = () => {
  const { t } = useAppTranslation();

  const button = useSound("button");

  const [showShopModal, setShowShopModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const onCloseShop = () => {
    setShowShopModal(false);
  };

  const onCloseGuide = () => {
    setShowGuideModal(false);
  };

  return (
    <>
      <GuideModal show={showGuideModal} onHide={onCloseGuide} />
      <ShopModal show={showShopModal} onHide={onCloseShop} />
      <div
        className="fixed flex flex-row h-10 justify-center w-full"
        style={{
          bottom: `${PIXEL_SCALE * 3}px`,
          height: `${PIXEL_SCALE * 23}px`,
        }}
      >
        <Button
          variant="primary"
          className={classNames("w-24 md:w-40 h-full font-bold mr-1")}
          onClick={() => {
            button.play();
            setShowShopModal(true);
          }}
        >
          {t("chaacsTemple.shop")}
        </Button>
        <Button
          variant="primary"
          className={classNames("w-24 md:w-40 h-full font-bold ml-1")}
          onClick={() => {
            button.play();
            setShowGuideModal(true);
          }}
        >
          {t("chaacsTemple.guide.title")}
        </Button>
      </div>
    </>
  );
};
