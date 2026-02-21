import { Entity } from "../entity";
import { abs, round_float } from "../utils";
/**
 * 获取两实体在XZ平面上的曼哈顿距离
 *
 * @export
 * @param {Entity} a 实体A
 * @param {Entity} b 实体B
 * @return {number} XZ平面上的曼哈顿距离
 */
export function manhattan_xz(a: Entity, b: Entity): number {
  return round_float(
    abs(a.position.x - b.position.x) +
    abs(a.position.z - b.position.z)
  )
}


