import { Minigame } from "features/game/types/game";
import {
  RESTOCK_ATTEMPTS_COST,
  UNLIMITED_ATTEMPTS_COST,
  DAILY_ATTEMPTS,
  RESTOCK_ATTEMPTS,
  HINT_COST,
} from "./Constants";

const getStartOfDay = (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  return startOfDay.getTime();
};

const getEndOfDay = (date: Date) => {
  return getStartOfDay(date) + 24 * 60 * 60 * 1000;
};

export const getAttemptsLeft = (minigame?: Minigame) => {
  const nowDate = new Date();
  const startOfToday = getStartOfDay(nowDate);
  const endOfToday = getEndOfDay(nowDate);

  const purchases = minigame?.purchases ?? [];
  if (
    purchases.some(
      (p) =>
        p.sfl === UNLIMITED_ATTEMPTS_COST &&
        p.purchasedAt >= startOfToday &&
        p.purchasedAt < endOfToday,
    )
  ) {
    return Infinity;
  }

  const numRestocked = purchases.filter(
    (p) =>
      p.sfl === RESTOCK_ATTEMPTS_COST &&
      p.purchasedAt >= startOfToday &&
      p.purchasedAt < endOfToday,
  ).length;

  const date = new Date().toISOString().split("T")[0];
  const minigameHistory = minigame?.history ?? {};
  const attemptsToday = minigameHistory[date]?.attempts ?? 0;

  const totalRestocked = RESTOCK_ATTEMPTS * numRestocked;
  const dailyAttemptsRemaining = DAILY_ATTEMPTS - attemptsToday;
  const attemptsRemaining = dailyAttemptsRemaining + totalRestocked;

  return attemptsRemaining;
};

export const numHintsBought = (minigame?: Minigame) => {
  const nowDate = new Date();
  const startOfToday = getStartOfDay(nowDate);
  const endOfToday = getEndOfDay(nowDate);

  const purchases = minigame?.purchases ?? [];
  return purchases.filter(
    (p) =>
      p.sfl === HINT_COST &&
      p.purchasedAt >= startOfToday &&
      p.purchasedAt < endOfToday,
  ).length;
};
