import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";
import { Label } from "components/ui/Label";
import { SquareIcon } from "components/ui/SquareIcon";
import { HINT_COST, MATCH_FOUND_HEALTH } from "../../util/Constants";

import flowerIcon from "assets/icons/flower_token.webp";
import chores from "assets/icons/chores.webp";

type Props = {
  onBack: () => void;
};

export const Guide: React.FC<Props> = ({ onBack }) => {
  const { t } = useAppTranslation();

  const button = useSound("button");

  return (
    <div className="flex flex-col gap-1 max-h-[65vh]">
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
            className={`flex flex-row w-full mb-3 text-lg justify-center`}
            style={{ marginLeft: `-${PIXEL_SCALE * 13}px` }}
          >
            <span className="underline">{t("memory.guide.title")}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 overflow-y-scroll scrollable pr-1">
        <Label type="info">{t("memory.guide.howtoplay.label")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.happy}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.howtoplay.text.1")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.expression_confused}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.howtoplay.text.2")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.confirm}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.howtoplay.text.3")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.cancel}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.howtoplay.text.4")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.minus}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.howtoplay.text.5")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.death}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.howtoplay.text.6")}</p>
          </div>
        </div>

        <Label type="info">{t("memory.guide.goal.label")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.expression_alerted}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.goal.text.1")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.heart}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">
              {t("memory.guide.goal.text.2", { health: MATCH_FOUND_HEALTH })}
            </p>
          </div>
        </div>

        <Label type="info">{t("memory.guide.tips.label")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.search}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.tips.text.1")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.expression_confused}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.tips.text.2")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.sad}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.tips.text.3")}</p>
          </div>
        </div>

        <Label type="info">{t("memory.guide.hint.label")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={chores} width={7} className="flex-shrink-0" />
            <p className="text-xs ml-3">{t("memory.guide.hint.text.1")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.confirm}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.hint.text.2")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={SUNNYSIDE.icons.lightning}
              width={7}
              className="flex-shrink-0"
            />
            <p className="text-xs ml-3">{t("memory.guide.hint.text.3")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={flowerIcon} width={7} className="flex-shrink-0" />
            <p className="text-xs ml-3">
              {t("memory.guide.hint.text.4", { cost: HINT_COST })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
