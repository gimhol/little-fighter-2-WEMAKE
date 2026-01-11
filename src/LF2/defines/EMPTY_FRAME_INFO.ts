import { Builtin_FrameId } from "./Builtin_FrameId";
import type { IFrameInfo } from "./IFrameInfo";

export const EMPTY_FRAME_INFO: IFrameInfo = {
  id: Builtin_FrameId.None,
  name: "",
  pic: { tex: "", x: 0, y: 0, w: 0, h: 0 },
  state: NaN,
  wait: 0,
  next: { id: Builtin_FrameId.Auto },
  centerx: 0,
  centery: 0,
};
