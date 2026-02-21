import { is_num } from "../utils/type_check";
import { take } from "./take";

/**
 * 从frame对象中，提取LF2的mp, 转换成LFJ的HP,MP
 *
 * - LF2中frame.mp：
 *    - 用hit进入此动作时:
 *      - +# 耗mp
 *      - -# 补mp
 *    - 用next进入此动作:
 *      - +# 不耗mp
 *      - -# 耗mp
 *    - 数字大于1000时会耗hp，例：4300 = 40hp + 300mp
 * 
 * @export
 * @param {*} frame 
 * @returns {{ mp: number, hp: number }} 
 */
export function take_raw_frame_mp(frame: any): { mp: number, hp: number } {
  const mp = take(frame, "mp");
  if (!is_num(mp)) return { mp: 0, hp: 0 };
  if (mp < 1000 && mp > -1000) return { mp, hp: 0 };
  const _mp = mp % 1000;
  const hp = (mp - _mp) / 100;
  return { mp: _mp, hp };
}
