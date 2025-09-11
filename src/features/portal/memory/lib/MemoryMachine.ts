import { OFFLINE_FARM } from "features/game/lib/landData";
import {
  assign,
  createMachine,
  EventObject,
  InterpreterFrom,
  StateFrom,
} from "xstate";
import { CONFIG } from "lib/config";
import { decodeToken } from "features/auth/actions/login";
import {
  RESTOCK_ATTEMPTS_COST,
  UNLIMITED_ATTEMPTS_COST,
  DAILY_ATTEMPTS,
  HINT_COST,
} from "../util/Constants";
import { GameState } from "features/game/types/game";
import { purchaseMinigameItem } from "features/game/events/minigames/purchaseMinigameItem";
import { startMinigameAttempt } from "features/game/events/minigames/startMinigameAttempt";
import { submitMinigameScore } from "features/game/events/minigames/submitMinigameScore";
import { submitScore, startAttempt } from "features/portal/lib/portalUtil";
import { getUrl, loadPortal } from "features/portal/actions/loadPortal";
import { getAttemptsLeft } from "../util/Utils";

const getJWT = () => {
  const code = new URLSearchParams(window.location.search).get("jwt");
  return code;
};

export interface Context {
  id: number;
  jwt: string | null;
  state: GameState | undefined;
  maxMoves: number;
  targetScore: number;
  movesMade: number;
  startAt: number;
  solved: boolean;
  attemptsRemaining: number;
  score: number;
  canBuyHint: boolean;
  health: number;
}

type GameStartEvent = {
  type: "START";
  duration: number;
  totalMoves: number;
  targetScore: number;
};

type GameOverEvent = {
  type: "GAME_OVER";
  score: number;
};

type MoveEvent = {
  type: "MAKE_MOVE";
  solved: boolean;
  score: number;
  health: number;
};

export type PortalEvent =
  | { type: "CLAIM" }
  | { type: "CANCEL_PURCHASE" }
  | { type: "PURCHASED_RESTOCK" }
  | { type: "PURCHASED_UNLIMITED" }
  | { type: "BUY_HINT" }
  | { type: "RETRY" }
  | { type: "CONTINUE" }
  | { type: "END_GAME_EARLY" }
  | GameStartEvent
  | GameOverEvent
  | MoveEvent;

export type PortalState = {
  value:
    | "initialising"
    | "error"
    | "ready"
    | "unauthorised"
    | "loading"
    | "introduction"
    | "playing"
    | "gameOver"
    | "winner"
    | "loser"
    | "complete"
    | "starting"
    | "noAttempts";
  context: Context;
};

export type MachineInterpreter = InterpreterFrom<typeof portalMachine> & {
  _listeners: Set<
    ((event: EventObject) => void) | ((state: PortalMachineState) => void)
  >;
};

export type PortalMachineState = StateFrom<typeof portalMachine>;

export const portalMachine = createMachine<Context, PortalEvent, PortalState>({
  id: "portalMachine",
  initial: "initialising",
  context: {
    id: 0,
    jwt: getJWT(),

    state: CONFIG.API_URL ? undefined : OFFLINE_FARM,
    movesMade: 0,
    maxMoves: 0,
    targetScore: 0,
    attemptsRemaining: 0,
    solved: false,
    startAt: 0,
    score: 0,
    canBuyHint: false,
    health: 0,
  },
  states: {
    initialising: {
      always: [
        {
          target: "unauthorised",
          // TODO: Also validate token
          cond: (context) => !!CONFIG.API_URL && !context.jwt,
        },
        {
          target: "loading",
        },
      ],
    },
    loading: {
      id: "loading",
      invoke: {
        src: async (context) => {
          if (!getUrl()) {
            return { game: OFFLINE_FARM, attemptsRemaining: DAILY_ATTEMPTS };
          }

          const { farmId } = decodeToken(context.jwt as string);

          const { game } = await loadPortal({
            portalId: CONFIG.PORTAL_APP,
            token: context.jwt as string,
          });

          const minigame = game.minigames.games["memory"];
          const attemptsRemaining = getAttemptsLeft(minigame);

          return { game, farmId, attemptsRemaining };
        },
        onDone: [
          {
            target: "introduction",
            actions: assign({
              state: (_: any, event) => event.data.game,
              id: (_: any, event) => event.data.farmId,
              attemptsRemaining: (_: any, event) =>
                event.data.attemptsRemaining,
            }),
          },
        ],
        onError: {
          target: "error",
        },
      },
    },

    noAttempts: {
      on: {
        CANCEL_PURCHASE: {
          target: "introduction",
        },
        PURCHASED_RESTOCK: {
          target: "introduction",
          actions: assign<Context>({
            state: (context: Context) =>
              purchaseMinigameItem({
                state: context.state!,
                action: {
                  id: "memory",
                  sfl: RESTOCK_ATTEMPTS_COST,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }) as any,
        },
        PURCHASED_UNLIMITED: {
          target: "introduction",
          actions: assign<Context>({
            state: (context: Context) =>
              purchaseMinigameItem({
                state: context.state!,
                action: {
                  id: "memory",
                  sfl: UNLIMITED_ATTEMPTS_COST,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }) as any,
        },
      },
    },

    starting: {
      always: [
        {
          target: "noAttempts",
          cond: (context) => {
            const minigame = context.state?.minigames.games["memory"];
            const attemptsRemaining = getAttemptsLeft(minigame);
            return attemptsRemaining <= 0;
          },
        },
        {
          target: "ready",
        },
      ],
    },

    introduction: {
      on: {
        CONTINUE: {
          target: "starting",
        },
      },
    },

    ready: {
      on: {
        START: {
          target: "playing",
          actions: assign<Context, any>({
            startAt: (context: any) => Date.now(),
            maxMoves: (context: Context, event: GameStartEvent) => {
              return event.totalMoves;
            },
            movesMade: 0,
            targetScore: (context: Context, event: GameStartEvent) => {
              return event.targetScore;
            },
            score: 0,
            state: (context: any) => {
              startAttempt();
              return startMinigameAttempt({
                state: context.state,
                action: {
                  type: "minigame.attemptStarted",
                  id: "memory",
                },
              });
            },
            attemptsRemaining: (context: Context) =>
              context.attemptsRemaining - 1,
            canBuyHint: false,
            health: (context: Context, event: GameStartEvent) => {
              return event.totalMoves;
            },
          }) as any,
        },
      },
    },

    playing: {
      on: {
        END_GAME_EARLY: {
          actions: assign<Context, any>({
            startAt: (context: any) => 0,
            canBuyHint: (context: any) => false,
            state: (context: any) => {
              submitScore({ score: context.score });
              return submitMinigameScore({
                state: context.state,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: context.score,
                  id: "memory",
                },
              });
            },
          }),
          target: "introduction",
        },
        MAKE_MOVE: {
          actions: assign<Context, any>({
            solved: (context: Context, event: MoveEvent) => {
              return (context.solved = event.solved);
            },
            movesMade: (context: Context, event: MoveEvent) => {
              return (context.movesMade = context.movesMade + 1);
            },
            score: (context: Context, event: MoveEvent) => {
              return (context.score = event.score);
            },
            canBuyHint: (context: Context, event: MoveEvent) => {
              return context.movesMade % 2 != 0;
            },
            health: (context: Context, event: MoveEvent) => {
              return (context.health = event.health);
            },
          }),
        },
        GAME_OVER: {
          target: "gameOver",
          actions: assign({
            state: (context: any, event: GameOverEvent) => {
              context.score = event.score;
              context.canBuyHint = false;
              submitScore({ score: Math.round(context.score) });
              return submitMinigameScore({
                state: context.state,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(context.score),
                  id: "memory",
                },
              });
            },
          }) as any,
        },
        BUY_HINT: {
          actions: assign<Context>({
            state: (context: Context) =>
              purchaseMinigameItem({
                state: context.state!,
                action: {
                  id: "memory",
                  sfl: HINT_COST,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
            canBuyHint: false,
          }) as any,
        },
      },
    },

    gameOver: {
      always: [
        {
          target: "complete",
          cond: (context) => {
            const dateKey = new Date().toISOString().slice(0, 10);

            const minigame = context.state?.minigames.games["memory"];
            const history = minigame?.history ?? {};

            return !!history[dateKey]?.prizeClaimedAt;
          },
          actions: assign({
            score: () => 0,
            startedAt: () => 0,
            canBuyHint: () => false,
          }) as any,
        },

        {
          target: "winner",
          cond: (context) => {
            return context.solved;
          },
          actions: assign({
            score: () => 0,
            startedAt: () => 0,
            canBuyHint: () => false,
          }) as any,
        },
        {
          target: "loser",
          actions: assign({
            score: () => 0,
            startedAt: () => 0,
            canBuyHint: () => false,
          }) as any,
        },
      ],
    },

    winner: {
      on: {
        RETRY: {
          target: "starting",
          actions: assign({
            score: () => 0,
            startedAt: () => 0,
            canBuyHint: () => false,
          }) as any,
        },
      },
    },

    loser: {
      on: {
        RETRY: {
          target: "starting",
          actions: assign({
            score: () => 0,
            startedAt: () => 0,
            canBuyHint: () => false,
          }) as any,
        },
      },
    },

    complete: {
      on: {
        RETRY: {
          target: "starting",
          actions: assign({
            score: () => 0,
            startedAt: () => 0,
            canBuyHint: () => false,
          }) as any,
        },
      },
    },

    error: {
      on: {
        RETRY: {
          target: "initialising",
        },
      },
    },

    unauthorised: {},
  },
});
