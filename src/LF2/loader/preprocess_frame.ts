import { LF2 } from "../LF2";
import { cook_frame_indicator_info } from "../dat_translator/cook_frame_indicator_info";
import { make_frame_behavior } from "../dat_translator/make_frame_behavior";
import { set_hit_flag } from "../dat_translator/set_hit_flag";
import { EntityEnum, FacingFlag as FF, FrameBehavior, HitFlag, IFrameInfo, StateEnum } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import { is_ball_data, is_weapon_data } from "../entity";
import read_nums from "../ui/utils/read_nums";
import { traversal } from "../utils/container_help/traversal";
import { preprocess_ball_frame } from "./preprocess_ball_frame";
import { preprocess_bdy } from "./preprocess_bdy";
import { preprocess_frame_pic } from "./preprocess_frame_pic";
import { preprocess_itr } from "./preprocess_itr";
import { preprocess_next_frame } from "./preprocess_next_frame";
import { preprocess_opoint } from "./preprocess_opoint";



export function preprocess_frame(lf2: LF2, data: IEntityData, frame: IFrameInfo, jobs: Promise<void>[]): IFrameInfo {


  if (data.processed != false) { }
  else if (is_ball_data(data)) preprocess_ball_frame(frame, data);
  else if (is_weapon_data(data)) {
    const in_the_skys: string[] = []
    const throwings: string[] = []
    const on_hands: string[] = []
    switch (frame.state) {
      case StateEnum.Weapon_InTheSky:
        in_the_skys.push(frame.id)
        frame.bdy?.forEach((v) => set_hit_flag(v, HitFlag.AllBoth))
        break;
      case StateEnum.Weapon_Rebounding:
      case StateEnum.HeavyWeapon_JustOnGround:
        frame.itr = void 0;
        break;
      case StateEnum.Weapon_Throwing:
        throwings.push(frame.id)
        frame.bdy?.forEach((v) => set_hit_flag(v, HitFlag.AllBoth))
        break;
      case StateEnum.HeavyWeapon_InTheSky:
        in_the_skys.push(frame.id)
        throwings.push(frame.id)
        frame.bdy?.forEach((v) => set_hit_flag(v, HitFlag.AllBoth))
        break;
      case StateEnum.Weapon_OnHand:
      case StateEnum.HeavyWeapon_OnHand:
        on_hands.push(frame.id)
        break;
    }
    data.indexes = data.indexes || {}
    if (in_the_skys.length) data.indexes.in_the_skys = in_the_skys
    if (throwings.length) data.indexes.throwings = throwings
    if (on_hands.length) data.indexes.on_hands = on_hands
  }

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
  frame.opoint?.forEach((n, i, l) => l[i] = preprocess_opoint(n, lf2))

  const unchecked_frame = frame as any;
  if (unchecked_frame) {
    if (unchecked_frame.center) {
      const [x, y] = read_nums(unchecked_frame.center, 2);
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
