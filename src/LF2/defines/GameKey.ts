export enum GameKey {
  /** Left */
  L = "L",
  Left = "L",

  /** Right */
  R = "R",
  Right = "R",

  /** Up */
  U = "U",
  Up = "U",

  /** Down */
  D = "D",
  Down = "D",

  /** Attack */
  a = "a",
  Attack = "a",

  /** Jump */
  j = "j",
  Jump = "j",

  /** Defend */
  d = "d",
  Defend = "d",
}
export type GK = GameKey;
export const GK = GameKey;
export type LGK = GK | "L" | "R" | "U" | "D" | "a" | "j" | "d";
export const GKLabels: Record<LGK, string> = {
  [GK.L]: "<",
  [GK.R]: ">",
  [GK.U]: "^",
  [GK.D]: "v",
  [GK.a]: "A",
  [GK.j]: "J",
  [GK.d]: "D"
}
/** 
 * 全部按键 
 * 
 * 该数组的顺序会影响按键跳转的先后判定，在前面的会被先判定
 */
export const AGK: GK[] = [GK.d, GK.L, GK.R, GK.U, GK.D, GK.j, GK.a];
export const CONFLICTS_KEY_MAP: Record<GK, GK | undefined> = {
  [GK.a]: void 0,
  [GK.j]: void 0,
  [GK.d]: void 0,
  [GK.L]: GK.R,
  [GK.R]: GK.L,
  [GK.U]: GK.D,
  [GK.D]: GK.U,
};
