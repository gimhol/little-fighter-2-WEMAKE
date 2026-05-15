
import type { IBdyInfo, IFrameInfo, IItrInfo } from "../defines";
import type { Entity } from "../entity/Entity";

export interface ICollisionInits {
  /**
   * 攻击方
   *
   * @type {Entity}
   * @memberof Collision
   */
  readonly attacker: Entity;

  /**
   * 被攻击方
   *
   * @type {Entity}
   * @memberof Collision
   */
  readonly victim: Entity;

  /**
   * 攻击方的itr
   *
   * @type {IItrInfo}
   * @memberof Collision
   */
  readonly itr: Readonly<IItrInfo>;

  /**
   * 被攻击方的bdy
   *
   * @type {IBdyInfo}
   * @memberof Collision
   */
  readonly bdy: Readonly<IBdyInfo>;

  /**
   * 攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof Collision
   */
  readonly aframe: Readonly<IFrameInfo>;

  /**
   * 被攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof Collision
   */
  readonly bframe: Readonly<IFrameInfo>;
}


