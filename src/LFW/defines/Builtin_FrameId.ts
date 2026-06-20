
export enum Builtin_FrameId {
  None = "",
  Auto = "auto",
  Self = "self",
  Gone = "gone",
  Invisible_Min = "1100",// 1100 ~ 1299 隐身
  Invisible_Max = "1299",
  Respawn = "respawn"
}
export type BFID = Builtin_FrameId;
export const BFID = Builtin_FrameId;