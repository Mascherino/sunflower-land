import React, { useContext, useEffect, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatch2Plugin from "phaser3-rex-plugins/plugins/ninepatch2-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { PortalContext } from "./lib/PortalProvider";
import { useActor } from "@xstate/react";
import { SimonSaysScene } from "./SimonSaysScene";
import { MINIGAME_NAME } from "./util/Constants";

export const MemoryPhaser: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  const game = useRef<Game>(null);

  // This must match the key of your scene [PortalExampleScene]
  const scene = MINIGAME_NAME;

  // Preloader is useful if you want to load the standard Sunflower Land assets + SFX
  const scenes = [Preloader, SimonSaysScene];

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      fps: {
        target: 60,
        smoothStep: true,
      },
      backgroundColor: "#000000",
      parent: "phaser-example",
      input: {
        activePointers: 1,
      },
      render: {
        pixelArt: true,
      },
      autoRound: true,
      pixelArt: true,
      plugins: {
        global: [
          {
            key: "rexNinePatch2Plugin",
            plugin: NinePatch2Plugin,
            start: true,
          },
        ],
      },
      width: window.innerWidth,
      height: window.innerHeight,

      physics: {
        default: "arcade",
      },
      scene: scenes,
      loader: {
        crossOrigin: "anonymous",
      },
    };

    game.current = new Game({
      ...config,
      parent: "game-content",
    });

    game.current.registry.set("initialScene", scene);
    game.current.registry.set("gameState", portalState.context.state);
    game.current.registry.set("id", portalState.context.id);
    game.current.registry.set("portalService", portalService);

    return () => {
      game.current?.destroy(true);
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div id="game-content" ref={ref} />
    </div>
  );
};
