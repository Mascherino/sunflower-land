import { getKeys } from "features/game/types/craftables";
import { MemoryScene } from "../MemoryScene";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { SEASONAL_SEEDS, SEEDS } from "features/game/types/seeds";
import { ProduceName } from "features/game/types/crops";
import _ from "lodash";
import Flip from "phaser3-rex-plugins/plugins/flip";

import {
  AFTER_FLIP_DELAY,
  DEFAULT_GAME_COLUMNS,
  DEFAULT_GAME_DURATION,
  DEFAULT_GAME_ROWS,
  FLIP_BACK_DELAY,
  VANISH_DELAY,
} from "../util/Constants";
import { EventObject } from "xstate";
import { Tweens } from "phaser";

interface MemoryConfig {
  rows?: number;
  columns?: number;
}

interface MemoryCard {
  name: ProduceName;
  flipInstance: Flip;
  isFlipped: boolean;
  image: Phaser.GameObjects.Sprite;
  tweens: Array<Tweens.Tween>;
}

export class Memory {
  private options: Required<MemoryConfig> = { rows: 9, columns: 9 };
  private board: string[] = [];
  private cards: MemoryCard[] = [];
  private scene: MemoryScene;
  private boardContainer?: Phaser.GameObjects.Container;
  private totalMoves = 0;
  private duration = 0;
  private seasonal_crops: ProduceName[] = [];
  private TILE_SIZE;
  private flippedCards: MemoryCard[] = [];
  private solvedCards: MemoryCard[] = [];
  private scale = 0.8;
  private moveMultiplier = 1.2;
  private targetScore = 0;
  private hintListener: ((event: EventObject) => void) | null = null;
  static current: Memory | null = null;

  constructor(scene: MemoryScene) {
    this.scene = scene;
    const currentSeason = this.scene.gameState.season.season;
    this.seasonal_crops = getKeys(SEEDS)
      .filter((seed) => SEASONAL_SEEDS[currentSeason].includes(seed))
      .map((name) => SEEDS[name].yield)
      .filter(Boolean) as ProduceName[];

    this.TILE_SIZE = SQUARE_WIDTH * 2;

    if (!this.scene.anims.exists("poof")) {
      this.scene.anims.create({
        key: "poof",
        frames: this.scene.anims.generateFrameNumbers("poof", {
          start: 2,
          end: 8,
        }),
        repeat: 0,
        frameRate: 10,
      });
    }
    Memory.current = this;
  }

  public newGame() {
    this.options.rows = DEFAULT_GAME_ROWS;
    this.options.columns = DEFAULT_GAME_COLUMNS;
    this.duration = DEFAULT_GAME_DURATION * 60 * 1000;
    this.totalMoves =
      Math.floor(
        this.moveMultiplier * this.options.rows * this.options.columns,
      ) * 2;
    this.targetScore = 10;

    this.cleanGame();
    this.boardContainer = this.scene.add.container(
      (this.scene.map.width / 2 - this.options.columns + 1) * SQUARE_WIDTH,
      (this.scene.map.height / 2 - this.options.rows) * SQUARE_WIDTH,
    );

    this.generateBoard();

    this.drawGame();

    this.hintListener = (event) => {
      if (event.type === "BUY_HINT") {
        const game = Memory.current;
        if (!game) return;
        const flippedCard = game.flippedCards[0];
        const filteredCards = game.cards.filter((value) => {
          return value.name == flippedCard.name && !value.isFlipped;
        });
        const matchingCard = filteredCards.length > 0 ? filteredCards[0] : null;
        if (!matchingCard) return;
        try {
          const tween = game.scene.tweens.add({
            targets: matchingCard.image,
            scale: 1.6,
            duration: 150,
            yoyo: true,
            loop: Infinity,
            ease: "Linear",
          });
          if (!matchingCard.tweens) matchingCard.tweens = [];
          matchingCard.tweens?.push(tween);
        } catch (err) {
          window.location.reload();
        }
      }
    };
    this.scene.portalService?.onEvent(this.hintListener);

    // Keep track of listeners to remove when doing HMR
    this.scene.portalService?._listeners.add(this.hintListener);

    if (this.scene.isReady) {
      this.scene.portalService?.send("START", {
        duration: this.duration,
        totalMoves: this.totalMoves,
        targetScore: this.targetScore,
      });
    }
  }

  /**
   * Kill all tweens, clean and destroy board container, reset game variables
   */
  public cleanGame() {
    this.scene.tweens.killAll();
    this.boardContainer?.removeAll(true);
    this.boardContainer?.destroy(true);
    this.flippedCards = [];
    this.board = [];
    this.solvedCards = [];
    this.cards.forEach((card) => {
      card.flipInstance.destroy();
      card.image.destroy(true);
    });
    this.cards = [];
    if (this.hintListener) this.scene.portalService?.off(this.hintListener);
    this.hintListener = null;
  }

  /**
   * Draw new game board
   */
  drawGame() {
    for (let row = 0; row < this.options.rows; row++) {
      for (let column = 0; column < this.options.columns; column++) {
        const boardIndex = row * this.options.columns + column;
        const spriteKey = this.board[boardIndex];

        const sprite = this.scene.add.sprite(
          column * this.TILE_SIZE,
          row * this.TILE_SIZE,
          `cardFront-${spriteKey}`,
        );

        const flip = this.scene.rexFlip?.add(sprite, {
          duration: 250,
          face: "back",
          front: { key: `cardFront-${spriteKey}` },
          back: { key: "cardback" },
        });
        if (!flip) return;
        const card = {
          name: spriteKey,
          isFlipped: false,
          flipInstance: flip,
          image: sprite,
        } as MemoryCard;

        sprite.setScale(
          (this.TILE_SIZE / sprite.width) * this.scale,
          (this.TILE_SIZE / sprite.height) * this.scale,
        );
        sprite.setInteractive().on("pointerup", () => {
          if (this.scene.locked || card.isFlipped) return;

          // Lock scene to prevent flipping during processing
          this.scene.locked = true;
          if (card.tweens && card.tweens.length > 0) {
            for (const t of card.tweens) {
              // Finish current tween loop and then handle click
              t.on("complete", () => {
                this.handleCardClick(card);
              });
              t.completeAfterLoop(0);
            }
          } else {
            this.scene.tweens.each(function (tween: Tweens.Tween) {
              tween.completeAfterLoop(0);
            });
            this.handleCardClick(card);
          }
        });
        this.boardContainer?.add(sprite);
        this.cards.push(card);
      }
    }
  }

  private handleCardClick(card: MemoryCard): void {
    card.flipInstance.flip();
    card.isFlipped = true;

    // Track flipped cards
    this.flippedCards.push(card);

    let score = this.scene.score;
    const movesMade = this.scene.movesMade;
    const maxMoves = this.scene.maxMoves;

    this.scene.time.delayedCall(AFTER_FLIP_DELAY, () => {
      if (this.flippedCards.length === 2) {
        if (
          this.flippedCards[0].image.texture.key ==
          this.flippedCards[1].image.texture.key
        ) {
          score = score + 1;
          this.solvedCards = this.solvedCards.concat(this.flippedCards);

          // Make matching cards disappear from game board
          this.scene.time.delayedCall(VANISH_DELAY, () => {
            this.flippedCards.forEach((c) => {
              c.image.anims
                .play("poof")
                .once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                  c.image.destroy(true);
                  this.flippedCards = [];
                  this.scene.locked = false;
                });
            });

            const solved = score == this.targetScore;
            this.scene.portalService?.send("MAKE_MOVE", {
              score: score,
              solved: solved,
            });

            if (movesMade > maxMoves) {
              // Fail mission if maxMoves has been exceeded
              this.scene.endGame(0);
            } else if (solved) {
              // End game when targetScore has been achieved
              this.scene.endGame(score);
            }
          });
        } else {
          this.scene.portalService?.send("MAKE_MOVE", { score: score });
          if (movesMade > maxMoves) {
            this.scene.endGame(0);
          }
          this.scene.time.delayedCall(FLIP_BACK_DELAY, () => {
            this.flippedCards.forEach((c) => {
              c.flipInstance.on("complete", () => {
                c.isFlipped = false;
                c.flipInstance.removeListener("complete");
              });
              c.flipInstance.flip();
            });
            this.flippedCards = [];
            this.scene.locked = false;
          });
        }
      } else {
        // Single card flipped
        this.scene.portalService?.send("MAKE_MOVE", {
          score: score,
          flippedCard: this.flippedCards[0].name,
        });
        this.scene.locked = false;
        if (movesMade > maxMoves) {
          this.scene.endGame(0);
        }
      }
    });
  }

  /**
   * Fill board matrix with names of crops
   */
  private generateBoard() {
    this.board = Array(this.options.rows * this.options.columns).fill(0);
    const numNeededCrops = (this.options.rows * this.options.columns) / 2;
    const crops = _.sampleSize(this.seasonal_crops, numNeededCrops);
    let cards = crops.map((value) => value);
    cards = cards.concat(cards).sort(() => 0.5 - Math.random());
    for (let i = 0; i < this.board.length; i++) {
      this.board[i] = cards[i];
    }
  }
}
