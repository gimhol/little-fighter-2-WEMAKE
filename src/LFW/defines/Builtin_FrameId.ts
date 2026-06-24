
export enum Builtin_FrameId {
  None = "",
  Auto = "auto",
  Self = "self",
  Gone = "gone",
  Invisible_Min = "1100",// 1100 ~ 1299 隐身
  Invisible_Max = "1299",
  Respawn = "respawn"
}
export const Builtin_FrameIdDescriptions: Record<Builtin_FrameId, string> = {
  [Builtin_FrameId.None]: "",
  [Builtin_FrameId.Auto]: "",
  [Builtin_FrameId.Self]: "",
  [Builtin_FrameId.Gone]: "",
  [Builtin_FrameId.Invisible_Min]: "",
  [Builtin_FrameId.Invisible_Max]: "",
  [Builtin_FrameId.Respawn]: "",
}
export type BFID = Builtin_FrameId;
export const BFID = Builtin_FrameId;