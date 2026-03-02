import { LF2 } from "../LF2";
import { cook_frame_indicator_info } from "../dat_translator/cook_frame_indicator_info";
import { EntityEnum, FacingFlag as FF, FrameBehavior, IFrameInfo } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import read_nums from "../ui/utils/read_nums";
import { traversal } from "../utils/container_help/traversal";
import { preprocess_bdy } from "./preprocess_bdy";
import { preprocess_frame_pic } from "./preprocess_frame_pic";
import { preprocess_itr } from "./preprocess_itr";
import { preprocess_next_frame } from "./preprocess_next_frame";

export function preprocess_frame(lf2: LF2, data: IEntityData, frame: IFrameInfo, jobs: Promise<void>[]): IFrameInfo {

  cook_frame_indicator_info(frame);

  if (frame.sound && !lf2.sounds.has(frame.sound))
    jobs.push(lf2.sounds.load(frame.sound, frame.sound))

  if (frame.seqs) {
    frame.seq_map = new Map();
    traversal(frame.seqs, (k, v, o) => {
      if (!v) return;
      const nf = preprocess_next_frame(v)
      frame.seq_map!.set(k, o[k] = nf)
    });
  }
  traversal(frame.hit, (k, v, o) => { if (v) o[k] = preprocess_next_frame(o[k]!) });
  traversal(frame.hold, (k, v, o) => { if (v) o[k] = preprocess_next_frame(v) });
  traversal(frame.key_down, (k, v, o) => { if (v) o[k] = preprocess_next_frame(v) });
  traversal(frame.key_up, (k, v, o) => { if (v) o[k] = preprocess_next_frame(v) });

  if (frame.next) frame.next = preprocess_next_frame(frame.next);
  if (frame.on_dead) frame.on_dead = preprocess_next_frame(frame.on_dead);
  if (frame.on_exhaustion) frame.on_exhaustion = preprocess_next_frame(frame.on_exhaustion);
  if (frame.on_landing) frame.on_landing = preprocess_next_frame(frame.on_landing);

  frame.bdy?.forEach((n, i, l) => l[i] = preprocess_bdy(lf2, n, data, jobs))
  frame.itr?.forEach((n, i, l) => l[i] = preprocess_itr(lf2, n, data, jobs))


  const unchecked_frame = frame as any;
  if (unchecked_frame) {
    if (unchecked_frame.center) {
      const [x, y] = read_nums(unchecked_frame.center, 2, [
        frame.centerx ?? 0,
        frame.centery ?? 0,
      ]);
      frame.centerx = x;
      frame.centery = y;
    }
  }
  frame.pic = preprocess_frame_pic(lf2, data, frame);

  if (frame.landable === void 0)
    frame.landable = data.type === EntityEnum.Ball ? 0 : 1;


  switch (frame.behavior) {
    // shit.
    case FrameBehavior.Boomerang: {
      if (void 0 === frame.facing && data.type === EntityEnum.Ball)
        frame.facing = FF.VX
    }
  }
  return frame
}
preprocess_frame.TAG = "preprocess_frame";

