/**
 * 获得一个等差数列
 *
 * @param {number} from 起点值，数列起点
 * @param {number} to 终点值（不一定包含在数列中）
 * @param {number} [gap=1] 差值
 * @throws 当无法到达终点值，将抛出Error:[arithmetic_progression] dead loop!
 * @returns {number[]} 等差数列
 */
export const arithmetic_progression = (
  from: number,
  to: number,
  gap: number = 1,
): number[] => {
  if (gap === 0 || (to - from) / gap < 0)
    throw new Error("[arithmetic_progression] dead loop!");

  const ret = [from];
  for (let i = 1; true; ++i) {
    const v = from + i * gap;
    if (gap > 0 ? v > to : v < to) break;
    ret.push(v);
  }
  return ret;
};
