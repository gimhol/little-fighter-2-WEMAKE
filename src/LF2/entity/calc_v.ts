import { SpeedMode } from "../defines";
import { round_float } from "../utils";
/**
 * 计算新速度
 *
 * @export
 * @param {number} current 原速度值
 * @param {number} value 新速度值
 * @param {SpeedMode} mode 速度模式
 * @param {(number | undefined)} acc 加速度
 * @param {(1 | -1)} [direction=1]
 * @return {*}  {number}
 */
export function calc_v(
  current: number,
  value: number,
  mode: SpeedMode,
  acc: number = 0,
  direction: 1 | -1 = 1): number {
  switch (mode) {
    case SpeedMode.Fixed: return value;
    case SpeedMode.Extra: return current;
    case SpeedMode.FixedAcc: return current + value;
    case SpeedMode.Acc: return current + value * direction;
    case SpeedMode.FixedLf2: {
      const target = value;
      if (current < target && target > 0) return target
      if (current > target && target < 0) return target
      return current;
    }
    case SpeedMode.AccTo: {
      /** 目标速度 */
      const target = (value *= direction);
      acc *= direction;
      if (!acc) return current;
      if (current >= target && acc > 0) return current;
      if (current <= target && acc < 0) return current;
      return current + acc;
    }
    case SpeedMode.LF2: default:
      const target = (value *= direction);
      if (target) return target
      // if (current < target && target > 0) return round_float(target)
      // if (current > target && target < 0) return round_float(target)
      return current;
  }
}
