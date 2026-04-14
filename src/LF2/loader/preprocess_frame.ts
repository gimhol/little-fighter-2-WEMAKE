import { LF2 } from "../LF2";
import { cook_frame_indicator_info } from "../dat_translator/cook_frame_indicator_info";
import { make_frame_behavior } from "../dat_translator/make_frame_behavior";
import { EntityEnum, FacingFlag as FF, FrameBehavior, IFrameInfo, OpointSpreading } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import { is_ball_data, is_weapon_data } from "../entity";
import { Randoming } from "../helper/Randoming";
import read_nums from "../ui/utils/read_nums";
import { round_float } from "../utils";
import { traversal } from "../utils/container_help/traversal";
import { preprocess_bdy } from "./preprocess_bdy";
import { preprocess_frame_pic } from "./preprocess_frame_pic";
import { preprocess_itr } from "./preprocess_itr";
import { preprocess_next_frame } from "./preprocess_next_frame";

export function preprocess_frame(lf2: LF2, data: IEntityData, frame: IFrameInfo, jobs: Promise<void>[]): IFrameInfo {

  cook_frame_indicator_info(frame);
  if (is_weapon_data(data) || is_ball_data(data))
    make_frame_behavior(frame, data.id);

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
  frame.opoint?.forEach((n, i, j) => {
    if (n.spreading == OpointSpreading.Spreading) {
      if (n.spreading_x?.length) n.__spreading_random_x = new Randoming(n.spreading_x, lf2);
      if (n.spreading_y?.length) n.__spreading_random_y = new Randoming(n.spreading_y, lf2);
      if (n.spreading_z?.length) n.__spreading_random_z = new Randoming(n.spreading_z, lf2);
    } else if (n.spreading == OpointSpreading.FloatRange) {
      const { spreading_x: xx, spreading_y: yy, spreading_z: zz } = n;
      if (xx?.length == 3)
        n.__spreading_random_x = { take: () => round_float(lf2.mt.range(-xx[0], xx[1]) / xx[2]) }
      if (yy?.length == 3)
        n.__spreading_random_y = { take: () => round_float(lf2.mt.range(-yy[0], yy[1]) / yy[2]) }
      if (zz?.length == 3)
        n.__spreading_random_z = { take: () => round_float(lf2.mt.range(-zz[0], zz[1]) / zz[2]) }
    }
  })

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

