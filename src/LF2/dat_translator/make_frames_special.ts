import { IEntityData } from "../defines/IEntityData";
import { foreach } from "../utils/container_help/foreach";
import { take } from "./take";

export function make_frames_special(ret: IEntityData) {
  foreach(ret.frames, frame => {
    take(frame, "hit_a")
    take(frame, "hit_j")
    take(frame, "hit_d")
    take(frame, "hit_Fa")
    take(frame, "hit_Fj")
    take(frame, "hit_Ua")
    take(frame, "hit_Uj")
    take(frame, "hit_Da")
    take(frame, "hit_Dj")
    take(frame, "hit_Ua")
    take(frame, "hit_ja")
  })
}
