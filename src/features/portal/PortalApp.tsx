import React from "react";

import { MemoryApp } from "./memory/Memory";
import { CONFIG } from "lib/config";
import { SimonSaysApp } from "./simon-says/SimonSays";

export const PortalApp: React.FC = () => {
  switch (CONFIG.PORTAL_APP) {
    case "memory":
      return <MemoryApp />;
    case "simon_says":
      return <SimonSaysApp />;
  }
};
