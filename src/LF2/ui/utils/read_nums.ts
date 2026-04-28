import { is_nan, is_num, is_num_arr, is_str } from "../../utils/type_check";
/**
 * 读取固定长度为4的数字数组
 *
 * @export
 * @param {(string | number[] | null | undefined)} src
 * @param {4} len
 * @param {[number, number, number, number]} [fallbacks]
 * @return {[number, number, number, number]}
 */
export default function read_nums(
  src: string | number[] | null | undefined,
  len: 4,
  fallbacks?: [number, number, number, number],
): [number, number, number, number];

/**
 * 读取固定长度为3的数字数组
 *
 * @export
 * @param {(string | number[] | null | undefined)} src
 * @param {3} len
 * @param {[number, number, number]} [fallbacks]
 * @return {[number, number, number]}
 */
export default function read_nums(
  src: string | number[] | null | undefined,
  len: 3,
  fallbacks?: [number, number, number],
): [number, number, number];

/**
 * 读取固定长度为2的数字数组
 *
 * @export
 * @param {(string | number[] | null | undefined)} src
 * @param {2} len
 * @param {[number, number]} [fallbacks]
 * @return {[number, number]}
 */
export default function read_nums(
  src: string | number[] | null | undefined,
  len: 2,
  fallbacks?: [number, number],
): [number, number];
/**
 * 读取指定长度的数字数组
 *
 * @export
 * @param {(string | number[] | null | undefined)} src
 * @param {number} len
 * @param {number[]} [fallbacks]
 * @return {number[]}
 */
export default function read_nums(
  src: string | number[] | null | undefined,
  len: number,
  fallbacks?: number[],
): number[];

export default function read_nums(
  src: string | number[] | null | undefined,
  len: number,
  fallbacks: number[] = [],
): number[] {
  if (!is_num_arr(fallbacks))
    throw new Error(`[read_nums] failed, fallbacks must be number[], but got ${fallbacks}`)

  if (len < 1) return [];
  const ret: number[] = [];

  /* 当fallbacks长度不足len，将fallbacks补长至len */
  const last_fallback = fallbacks[fallbacks.length - 1] || 0;
  while (fallbacks.length < len) fallbacks.push(last_fallback);

  if (!src || is_nan(src)) return fallbacks;
  if (is_str(src)) {
    src = src
      .replace(/\s/g, "")
      .split(",")
      .map((v) => Number(v));
  }

  while (ret.length < len) {
    const idx = ret.length
    if (ret.length < src.length) {
      ret.push(fallbacks[idx]);
    } else {
      ret.push(src[idx])
    }
  }
  return ret;
}
