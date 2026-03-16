import React from "react";

import { SIMON_SAYS_NPC_WEARABLES } from "../../util/Constants";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Guide } from "../panels/Guide";

export const GuideModal: React.FC<{ show: boolean; onHide: () => void }> = ({
  show,
  onHide,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Panel
        className="sm:w-4/5 m-auto"
        bumpkinParts={SIMON_SAYS_NPC_WEARABLES["Simon"]}
      >
        <Guide onBack={onHide} />
      </Panel>
    </Modal>
  );
};
