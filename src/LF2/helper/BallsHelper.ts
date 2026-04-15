
import { Entity } from "../entity/Entity";
import { is_ball } from "../entity/type_check";
import { LF2 } from "../LF2";

export class BallsHelper {
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  /**
   * 列出场地上类型为Ball的实体
   *
   * @return {Entity[]}
   * @memberof BallsHelper
   */
  get list(): Entity[] {
    const ret: Entity[] = [];
    this.lf2.world.entities.forEach((v) => is_ball(v) && ret.push(v));
    return ret;
  }
  get a(): Entity | undefined { return this.at(0) }
  get b(): Entity | undefined { return this.at(1) }
  at(idx: number): Entity | undefined {
    return this.list[idx];
  }
}
