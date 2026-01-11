import { pow } from "../math/base";
import { clamp } from "../math/clamp";
/**
 * 单次触发的概率
 *
 * @export
 * @param {number} times 次数
 * @param {number} probability 次数内至少发生一次的概率
 * @return {number} 单次概率
 */
export function probability(times: number, probability: number): number {
  const x = clamp(probability, 0, 1)
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - pow(1 - x, 1 / times);
}
