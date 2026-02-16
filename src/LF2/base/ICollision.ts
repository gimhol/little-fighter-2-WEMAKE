
import type { LF2 } from "../LF2";
import type { World } from "../World"
import type { IBdyInfo, IBounding, IFrameInfo, IItrInfo } from "../defines";
import type { Entity } from "../entity/Entity";

export interface ICollision {

  readonly lf2: LF2;

  readonly world: World;
  readonly a_id: string;
  readonly v_id: string;
  /**
   * 攻击方
   *
   * @type {Entity}
   * @memberof ICollision
   */
  readonly attacker: Entity;

  /**
   * 被攻击方
   *
   * @type {Entity}
   * @memberof ICollision
   */
  readonly victim: Entity;

  /**
   * 攻击方的itr
   *
   * @type {IItrInfo}
   * @memberof ICollision
   */
  readonly itr: Readonly<IItrInfo>;

  /**
   * 被攻击方的bdy
   *
   * @type {IBdyInfo}
   * @memberof ICollision
   */
  readonly bdy: Readonly<IBdyInfo>;

  /**
   * 攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof ICollision
   */
  readonly aframe: Readonly<IFrameInfo>;

  /**
   * 被攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof ICollision
   */
  readonly bframe: Readonly<IFrameInfo>;

  /**
   * 攻击方判定框
   *
   * @type {IBounding}
   * @memberof ICollision
   */
  readonly a_cube: Readonly<IBounding>;

  /**
   * 被攻击方的判定框
   *
   * @type {IBounding}
   * @memberof ICollision
   */
  readonly b_cube: Readonly<IBounding>;

  /**
   *
   *
   * @type {number}
   * @memberof ICollision
   */
  rest: number;

  handlers?: ((collision: ICollision) => void)[];

  ax: number;
  ay: number;
  az: number;
  vx: number;
  vy: number;
  vz: number;

  dx: number;
  dy: number;
  dz: number;
  m_distance: number;

  duration: number;
}
