import type { IEntityData, IFrameInfo } from "../defines";
import { check_bdy } from "./check_bdy";
import { check_field, one_of, non_nagative_int } from "../ui/utils/check_field";
import { check_itr } from "./check_itr";

/**
 * 检查frame每个字段是否正常
 *
 * @export
 * @param {Readonly<IEntityData>} data
 * @param {Readonly<IFrameInfo>} frame
 */
export function check_frame(data: Readonly<IEntityData>, frame: Readonly<IFrameInfo>, errors?: string[]): boolean {
  const my_errors: string[] = []
  const frame_name = `${data.base.name}#frame`
  check_field(frame, frame_name, 'id', 'string', my_errors);
  check_field(frame, frame_name, 'name', 'string', my_errors);
  check_field(frame, frame_name, 'state', 'number', my_errors);
  check_field(frame, frame_name, 'wait', 'number', my_errors);
  // TODO: pic
  // TODO: next
  check_field(frame, frame_name, 'dvx', ['number', 'undefined'], my_errors);
  check_field(frame, frame_name, 'dvy', ['number', 'undefined'], my_errors);
  check_field(frame, frame_name, 'dvz', ['number', 'undefined'], my_errors);
  check_field(frame, frame_name, 'acc_x', ['number', 'undefined'], my_errors);
  check_field(frame, frame_name, 'acc_y', ['number', 'undefined'], my_errors);
  check_field(frame, frame_name, 'acc_z', ['number', 'undefined'], my_errors);
  check_field(frame, frame_name, 'vxm', ['number', 'undefined'], my_errors);
  check_field(frame, frame_name, 'vym', ['number', 'undefined'], my_errors);
  check_field(frame, frame_name, 'vzm', ['number', 'undefined'], my_errors);
  check_field(frame, frame_name, 'centerx', 'number', my_errors);
  check_field(frame, frame_name, 'centery', 'number', my_errors);
  check_field(frame, frame_name, 'sound', ['string', 'undefined'], my_errors);
  check_field(frame, frame_name, 'hp_max', ['number', 'undefined'], my_errors);
  // TODO: hold
  // TODO: hit

  frame.bdy?.forEach((v, i) => check_bdy(data, frame, v, i, my_errors));
  frame.itr?.forEach((v, i) => check_itr(data, frame, v, i, my_errors));
  // TODO: wpoint
  // TODO: bpoint
  // TODO: opoint
  // TODO: cpoint
  // TODO: indicator_info
  check_field(frame, frame_name, 'invisible', [non_nagative_int(), 'undefined'], my_errors);
  check_field(frame, frame_name, 'no_shadow', [one_of(0, 1), 'undefined'], my_errors);
  check_field(frame, frame_name, 'jump_flag', [one_of(1, 0), 'undefined'], my_errors);
  // TODO: on_dead
  // TODO: on_exhaustion
  // TODO: on_landing
  // TODO: behavior
  // TODO: on_hit_ground

  if (errors) errors.push(...my_errors)
  return !my_errors.length
}
check_frame.TAG = 'check_frame'
