import React, { useState } from "react";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { ITEM_DETAILS } from "features/game/types/images";
import { NumberInput } from "components/ui/NumberInput";
import Decimal from "decimal.js-light";
import { donate } from "features/portal/lib/portalUtil";
import { CONFIG } from "lib/config";

const minAmount = 0.01;

export const Donations: React.FC = () => {
  const { t } = useAppTranslation();

  const [donation, setDonation] = useState(new Decimal(1));
  const handleValueChange = (value: Decimal) => {
    setDonation(value);
  };
  const incDonation = () => {
    setDonation((value) => value.add(minAmount));
  };

  const decDonation = () => {
    setDonation((value) => {
      if (value.lte(minAmount)) {
        return new Decimal(minAmount);
      }
      return value.minus(0.01);
    });
  };

  const handleDonate = () => {
    donate({
      matic: donation.toNumber(),
      address: CONFIG.PORTAL_DONATION_ADDRESS,
    });
  };

  return (
    <div className="flex flex-col mb-1 p-2 text-sm">
      <p className="mb-2 text-center">{t("memory.donationDescription")}</p>

      <div className="flex mt-1 mb-4 justify-center">
        <Label
          type="chill"
          icon={ITEM_DETAILS["Tree"].image}
          secondaryIcon={ITEM_DETAILS["Tree"].image}
        >
          <span className="px-1">{"Maschs"}</span>
        </Label>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex">
          <Button className="w-12" onClick={decDonation}>
            {"-"}
          </Button>
          <div className="flex items-center w-24 mx-2 mt-1">
            <NumberInput
              value={donation}
              maxDecimalPlaces={2}
              isOutOfRange={donation.lt(0.01)}
              onValueChange={handleValueChange}
            />
          </div>
          <Button className="w-12" onClick={incDonation}>
            {"+"}
          </Button>
        </div>
        <span className="text-xs font-secondary my-2">{t("amount.pol")}</span>
      </div>

      <div className="flex justify-center">
        <Button
          className="w-6/12 ml-1"
          onClick={handleDonate}
          disabled={donation.lt(minAmount)}
        >
          <span>{t("donate")}</span>
        </Button>
      </div>
    </div>
  );
};
