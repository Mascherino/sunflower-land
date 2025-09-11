/* eslint-disable react/jsx-no-literals */
import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Label } from "components/ui/Label";
import changelog from "../../assets/changelog.json";
import { InnerPanel } from "components/ui/Panel";
import classNames from "classnames";

export const Changelog: React.FC = () => {
  const { t } = useAppTranslation();

  function wrapEmoji(text: string): (string | JSX.Element)[] {
    const regex = /\p{Extended_Pictographic}/gu;
    const parts: (string | JSX.Element)[] = [];
    for (const part of text.split(" ")) {
      if (part.match(regex)) {
        parts.push(
          <span key={""} style={{ fontSize: "18px", lineHeight: "12px" }}>
            {part}
          </span>,
        );
      } else {
        parts.push(part, " ");
      }
    }
    return parts;
  }

  return (
    <div className="flex flex-col gap-1 max-h-[55vh]">
      <div className="flex flex-row w-full mb-3 text-lg justify-center">
        <span className="underline">{t("memory.changelogTitle")}</span>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto scrollable pr-1">
        {changelog
          .sort((a, b) => {
            const aDate = new Date(a.date.split("/").reverse().join(""));
            const bDate = new Date(b.date.split("/").reverse().join(""));
            return bDate.getTime() - aDate.getTime();
          })
          .map((data, index) => (
            <InnerPanel key={index}>
              <div
                className={classNames(
                  "text-xs text-start max-w-full m-1 flex",
                  {
                    "flex-col": data.text.length > 1,
                    "items-center": data.text.length === 1,
                  },
                )}
              >
                <Label type={"chill"}>{data.date}:</Label>
                {data.text.length > 1 && (
                  <ul>
                    <li className="flex flex-col ml-4">
                      {data.text.map((val, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2 bg-current"></div>
                          <span className="flex-1">{wrapEmoji(val)}</span>
                        </div>
                      ))}
                    </li>
                  </ul>
                )}
                {data.text.length == 1 && (
                  <span className="ml-1">{wrapEmoji(data.text[0])}</span>
                )}
              </div>
            </InnerPanel>
          ))}
      </div>
    </div>
  );
};
