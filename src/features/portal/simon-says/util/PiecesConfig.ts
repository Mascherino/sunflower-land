import { midOffset, outerOffset } from "./Constants";

export interface PieceConfig {
  stem: string;
  suffix: string;
  xOffset: number;
  yOffset: number;
}

export const piecesConfig = {
  core: { stem: "core", suffix: "_inactive", xOffset: 0, yOffset: 0 },
  midyellow: {
    stem: "midyellow",
    suffix: "_inactive",
    xOffset: -midOffset,
    yOffset: -midOffset,
  },
  midgreen: {
    stem: "midgreen",
    suffix: "_inactive",
    xOffset: midOffset,
    yOffset: midOffset,
  },
  midblue: {
    stem: "midblue",
    suffix: "_inactive",
    xOffset: midOffset,
    yOffset: -midOffset,
  },
  midred: {
    stem: "midred",
    suffix: "_inactive",
    xOffset: -midOffset,
    yOffset: midOffset,
  },
  topyellow: {
    stem: "topyellow",
    suffix: "_inactive",
    xOffset: 0,
    yOffset: outerOffset,
  },
  topgreen: {
    stem: "topgreen",
    suffix: "_inactive",
    xOffset: 0,
    yOffset: -outerOffset,
  },
  topblue: {
    stem: "topblue",
    suffix: "_inactive",
    xOffset: -outerOffset,
    yOffset: 0,
  },
  topred: {
    stem: "topred",
    suffix: "_inactive",
    xOffset: outerOffset,
    yOffset: 0,
  },
} satisfies Record<string, PieceConfig>;
