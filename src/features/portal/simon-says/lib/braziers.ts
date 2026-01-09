import { SQUARE_WIDTH } from "features/game/lib/constants";
import { SimonSaysScene } from "../SimonSaysScene";

function getDefaultBraziers(scene: SimonSaysScene) {
  return [
    {
      name: "brazier_lefttop",
      x: (scene.map.width / 2 - 10) * SQUARE_WIDTH,
      y: (scene.map.height / 2 - 6) * SQUARE_WIDTH - 1,
    },
    {
      name: "brazier_leftbottom",
      x: (scene.map.width / 2 - 10) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 1) * SQUARE_WIDTH - 1,
    },
    {
      name: "brazier_righttop",
      x: (scene.map.width / 2 + 10) * SQUARE_WIDTH,
      y: (scene.map.height / 2 - 6) * SQUARE_WIDTH - 1,
    },
    {
      name: "brazier_rightbottom",
      x: (scene.map.width / 2 + 10) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 1) * SQUARE_WIDTH - 1,
    },
    {
      name: "brazier_bottomleft",
      x: (scene.map.width / 2 - 3) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 8) * SQUARE_WIDTH - 1,
    },
    {
      name: "brazier_bottomright",
      x: (scene.map.width / 2 + 3) * SQUARE_WIDTH,
      y: (scene.map.height / 2 + 8) * SQUARE_WIDTH - 1,
    },
    {
      name: "brazier_monkeysleft",
      x: (scene.map.width / 2 - 6) * SQUARE_WIDTH,
      y: (scene.map.height / 2 - 10) * SQUARE_WIDTH - 1,
    },
    {
      name: "brazier_monkeysright",
      x: (scene.map.width / 2 + 6) * SQUARE_WIDTH,
      y: (scene.map.height / 2 - 10) * SQUARE_WIDTH - 1,
    },
  ];
}

export function placeBraziers(scene: SimonSaysScene) {
  const braziers = getDefaultBraziers(scene);
  braziers.forEach((brazier) => {
    const sprite = scene.add.sprite(brazier.x, brazier.y, "brazier");
    sprite.play("brazier_anim");
  });
}
