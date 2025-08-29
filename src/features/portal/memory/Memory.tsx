import React, { useContext, useEffect } from "react";

import { useSelector } from "@xstate/react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";

import { PortalContext, PortalProvider } from "./lib/PortalProvider";
import { WalletProvider } from "features/wallet/WalletProvider";
import { Hud } from "./components/hud/Hud";
import { MemoryPhaser } from "./MemoryPhaser";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "./lib/MemoryMachine";
import { Loading } from "features/auth/components";
import { CONFIG } from "lib/config";
import { authorisePortal, claimPrize } from "../lib/portalUtil";

import { Overview } from "./components/panels/Overview";
import { NoAttempts } from "./components/panels/NoAttempts";

const flowerBalanceSel = (state: PortalMachineState) =>
  state.context.state?.balance;

// Before game states
const isErrorSel = (state: PortalMachineState) => state.matches("error");
const isUnauthorisedSel = (state: PortalMachineState) =>
  state.matches("unauthorised");
const isLoadingSel = (state: PortalMachineState) => state.matches("loading");
const isIntroductionSel = (state: PortalMachineState) =>
  state.matches("introduction");
const isNoAttemptsSel = (state: PortalMachineState) =>
  state.matches("noAttempts");

// After game states
const isCompleteSel = (state: PortalMachineState) => state.matches("complete");
const isWinnerSel = (state: PortalMachineState) => state.matches("winner");
const isLoserSel = (state: PortalMachineState) => state.matches("loser");

export const MemoryApp: React.FC = () => {
  return (
    <WalletProvider>
      <PortalProvider>
        <Memory />
      </PortalProvider>
    </WalletProvider>
  );
};

export const Memory: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const flowerBalance = useSelector(portalService, flowerBalanceSel);
  const isError = useSelector(portalService, isErrorSel);
  const isUnauthorised = useSelector(portalService, isUnauthorisedSel);
  const isLoading = useSelector(portalService, isLoadingSel);
  const isIntroduction = useSelector(portalService, isIntroductionSel);
  const isNoAttempts = useSelector(portalService, isNoAttemptsSel);
  const isComplete = useSelector(portalService, isCompleteSel);
  const isWinner = useSelector(portalService, isWinnerSel);
  const isLoser = useSelector(portalService, isLoserSel);

  useEffect(() => {
    // If a player tries to quit while playing, mark it as an attempt
    const handleBeforeUnload = () => {
      portalService.send("GAME_OVER");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  if (isError) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("error.wentWrong")}</span>
          </div>
          <Button onClick={() => portalService.send("RETRY")}>
            {t("retry")}
          </Button>
        </Panel>
      </Modal>
    );
  }

  if (isUnauthorised) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("session.expired")}</span>
          </div>
          <Button onClick={authorisePortal}>{t("welcome.login")}</Button>
        </Panel>
      </Modal>
    );
  }

  if (isLoading) {
    return (
      <Modal show>
        <Panel>
          <Loading />
          <span className="text-xs">
            {`${t("last.updated")}:${CONFIG.CLIENT_VERSION}`}
          </span>
        </Panel>
      </Modal>
    );
  }

  return (
    <div>
      {isNoAttempts && (
        <Modal show>
          <NoAttempts />
        </Modal>
      )}

      {isIntroduction && (
        <Modal show>
          <Overview
            mode={"introduction"}
            showScore={false}
            showExitButton={true}
            confirmButtonText={t("start")}
            onConfirm={() => {
              portalService.send("CONTINUE");
            }}
          />
        </Modal>
      )}

      {isComplete && (
        <Modal show>
          <Overview
            mode={"introduction"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={t("play.again")}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      {isWinner && (
        <Modal show>
          <Overview
            mode={"success"}
            showScore={true}
            showExitButton={false}
            confirmButtonText={t("claim")}
            onConfirm={claimPrize}
          />
        </Modal>
      )}

      {isLoser && (
        <Modal show>
          <Overview
            mode={"failed"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={t("play.again")}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      {flowerBalance && (
        <>
          <Hud />
          <MemoryPhaser />
        </>
      )}
    </div>
  );
};
