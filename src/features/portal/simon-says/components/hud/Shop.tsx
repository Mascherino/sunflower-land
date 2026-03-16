import React, { useState } from "react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";
import classNames from "classnames";
import { Button } from "components/ui/Button";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { ShopModal } from "../modals/Shop";

export const Shop: React.FC = () => {
  const { t } = useAppTranslation();

  const button = useSound("button");

  const [showModal, setShowModal] = useState(false);

  const onClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <ShopModal show={showModal} onHide={onClose} />
      <div
        className="fixed flex flex-row h-10 justify-center w-full"
        style={{
          bottom: `${PIXEL_SCALE * 3}px`,
          height: `${PIXEL_SCALE * 23}px`,
        }}
      >
        <Button
          variant="primary"
          className={classNames("w-40 h-full font-bold")}
          onClick={() => {
            button.play();
            setShowModal(true);
          }}
        >
          {t("chaacsTemple.shop")}
        </Button>
      </div>
    </>
  );
};
