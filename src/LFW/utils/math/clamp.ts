/**
 * 控制value在范围[min,max]内
 * @export
 * @param {number} value 值
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @return {number} 当value<min，返回min；当value>max, 返回max；否则返回value
 */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

