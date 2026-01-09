import React, { useState } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { Mission } from "./Mission";
import { SIMON_SAYS_NPC_WEARABLES } from "../../util/Constants";
import chores from "assets/icons/chores.webp";
import { Changelog } from "./Changelog";
import { Donations } from "./Donations";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
  buttonDisabled: boolean;
}
export const Overview: React.FC<Props> = ({
  mode,
  showScore,
  showExitButton,
  confirmButtonText,
  onConfirm,
  buttonDisabled,
}) => {
  const { t } = useAppTranslation();

  const [tab, setTab] = useState<"main" | "donations" | "changelog">("main");

  return (
    <CloseButtonPanel
      className="overflow-y-hidden max-h-[65vh]"
      bumpkinParts={SIMON_SAYS_NPC_WEARABLES["Simon"]}
      currentTab={tab}
      setCurrentTab={setTab}
      tabs={[
        {
          icon: SUNNYSIDE.icons.plant,
          name: t("memory.mission"),
          id: "main",
        },
        {
          icon: chores,
          name: t("memory.changelogTitle"),
          id: "changelog",
        },
        {
          icon: SUNNYSIDE.icons.heart,
          name: t("donations"),
          id: "donations",
        },
      ]}
    >
      <>
        {tab === "main" && (
          <Mission
            mode={mode}
            showScore={showScore}
            showExitButton={showExitButton}
            confirmButtonText={confirmButtonText}
            onConfirm={onConfirm}
            buttonDisabled={buttonDisabled}
          />
        )}
        {tab === "changelog" && <Changelog />}
        {tab === "donations" && <Donations />}
      </>
    </CloseButtonPanel>
  );
};
