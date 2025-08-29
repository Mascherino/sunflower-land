import React from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { Mission } from "./Mission";
import { MEMORY_NPC_WEARABLES } from "../../util/Constants";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
}
export const Overview: React.FC<Props> = ({
  mode,
  showScore,
  showExitButton,
  confirmButtonText,
  onConfirm,
}) => {
  const { t } = useAppTranslation();

  return (
    <CloseButtonPanel
      className="overflow-y-hidden"
      bumpkinParts={MEMORY_NPC_WEARABLES["Maschs"]}
      currentTab={0}
      tabs={[
        {
          icon: SUNNYSIDE.icons.plant,
          name: t("memory.mission"),
        },
      ]}
    >
      <>
        <Mission
          mode={mode}
          showScore={showScore}
          showExitButton={showExitButton}
          confirmButtonText={confirmButtonText}
          onConfirm={onConfirm}
        />
      </>
    </CloseButtonPanel>
  );
};
