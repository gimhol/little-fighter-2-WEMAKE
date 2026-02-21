import { Builtin_FrameId, FacingFlag, INextFrame } from "../defines";
import { cook_next_frame_cost as cook_next_frame_cost } from "./cook_next_frame_cost";

export const get_next_frame_by_raw_id = (
  id: number | string,
  type?: "next" | "hit",
  frame_mp_hp_map?: Map<string, { mp: number, hp: number }>,
): INextFrame => {
  if ("" + id === "1000") return { id: Builtin_FrameId.Gone };
  if ("" + id === "999") return { id: Builtin_FrameId.Auto };
  if ("" + id === "-999")
    return { id: Builtin_FrameId.Auto, facing: FacingFlag.Backward };
  if ("" + id === "0") return {};

  if (typeof id === "number") {
    if (id >= 1100 && id <= 1299) {
      // 外部需要处理隐身逻辑。
      return { id: Builtin_FrameId.Auto };
    }
    if (id <= -1100 && id >= -1299) {
      // 外部需要处理隐身逻辑。
      return { id: Builtin_FrameId.Auto, facing: FacingFlag.Backward };
    }
    if (id < 0) {
      const ret: INextFrame = {
        id: "" + -id,
        facing: FacingFlag.Backward,
      };
      cook_next_frame_cost(ret, type, frame_mp_hp_map);
      return ret;
    }
  }
  if (typeof id === "string" && id.startsWith("-")) {
    const ret: INextFrame = {
      id: id.substring(1),
      facing: FacingFlag.Backward,
    };
    cook_next_frame_cost(ret, type, frame_mp_hp_map);
    return ret;
  }
  const ret: INextFrame = { id: "" + id };
  cook_next_frame_cost(ret, type, frame_mp_hp_map);
  return ret;
};
