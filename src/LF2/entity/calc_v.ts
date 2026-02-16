import { SpeedMode } from "../defines";
import { round_float } from "../utils";
/**
 * 计算新速度
 *
 * @export
 * @param {number} speed 原速度值
 * @param {number} value 新速度值
 * @param {SpeedMode} mode 速度模式
 * @param {(number | undefined)} acc 加速度
 * @param {(1 | -1)} [direction=1]
 * @return {*}  {number}
 */
export function calc_v(
  speed: number,
  value: number,
  mode: SpeedMode,
  acc: number | undefined,
  direction: 1 | -1 = 1): number {
  switch (mode) {
    case SpeedMode.Fixed: return value;
    case SpeedMode.Extra: return speed;
    case SpeedMode.FixedAcc: return round_float(speed + value);
    case SpeedMode.Acc: return round_float(speed + value * direction);
    case SpeedMode.FixedLf2: {
      return (value > 0 && speed < value) || (value < 0 && speed > value)
        ? value
        : speed;
    }
    case SpeedMode.AccTo: {
      value *= direction;
      acc = acc ? acc * direction : void 0;
      if (!acc) return speed;
      if (
        (value > 0 && speed >= value) ||
        (value < 0 && speed <= value)
      ) return value
      if (
        (value > speed && acc < 0) ||
        (value < speed && acc > 0)
      ) return speed;
      return round_float(speed + acc);
    }
    case SpeedMode.LF2:
    default:
      value *= direction;
      return (value > 0 && speed < value) || (value < 0 && speed > value)
        ? round_float(value)
        : speed;
  }
}
