import type { LF2 } from "../LF2";
import type { World } from "../World";
import { HitFlag, ItrKind, type IBdyInfo, type IBounding, type IFrameInfo, type IItrInfo } from "../defines";
import type { Entity } from "../entity";
import { abs, max } from "../utils/math/base";
import type { ICollisionInits } from "./ICollisionInits";

export class Collision implements ICollisionInits {
  readonly lf2: LF2;
  readonly world: World;
  readonly a_id: string;
  readonly v_id: string;
  readonly attacker: Entity;
  readonly victim: Entity;
  readonly itr: Readonly<IItrInfo>;
  readonly bdy: Readonly<IBdyInfo>;
  readonly aframe: Readonly<IFrameInfo>;
  readonly bframe: Readonly<IFrameInfo>;

  /**
   * 攻击方判定框
   *
   * @type {IBounding}
   * @memberof Collision
   */
  readonly a_cube: Readonly<IBounding>;

  /**
   * 被攻击方的判定框
   *
   * @type {IBounding}
   * @memberof Collision
   */
  readonly b_cube: Readonly<IBounding>;
  readonly ax: number;
  readonly ay: number;
  readonly az: number;
  readonly vx: number;
  readonly vy: number;
  readonly vz: number;
  readonly dx: number;
  readonly dy: number;
  readonly dz: number;
  readonly m_distance: number;
  handlers?: ((collision: Collision) => void)[];
  duration: number = 0;
  rest: number = 0;

  constructor(o: ICollisionInits) {
    const { attacker: a, victim: v } = o;
    this.lf2 = a.lf2
    this.world = a.world
    this.a_id = a.id
    this.v_id = v.id
    this.attacker = o.attacker
    this.victim = o.victim
    this.itr = o.itr
    this.bdy = o.bdy
    this.aframe = o.aframe
    this.bframe = o.bframe
    this.ax = a.position.x
    this.ay = a.position.y
    this.az = a.position.z
    this.vx = v.position.x
    this.vy = v.position.y
    this.vz = v.position.z
    this.dx = this.vx - this.ax;
    this.dy = this.vy - this.ay;
    this.dz = this.vz - this.az;
    this.m_distance = abs(this.dx) + abs(this.dy) + abs(this.dz);
    if (!o.itr.arest && o.itr.vrest)
      this.rest = max(this.world.min_vrest, o.itr.vrest + this.world.vrest_offset)

    do {
      if (o.itr.kind !== ItrKind.WeaponSwing) break;
      const prefab_id = o.attacker.bearer?.frame.wpoint?.attacking;
      if (!prefab_id) break;
      const itr_prefab = o.attacker.data.itr_prefabs?.[prefab_id];
      if (!itr_prefab) break;
      this.itr = { ...o.itr, ...itr_prefab };
    } while (0);

    const a_cube = this.a_cube = this.world.get_bounding(o.attacker, o.aframe, o.itr);
    const b_cube = this.b_cube = this.world.get_bounding(o.victim, o.bframe, o.bdy);
    if (!(
      a_cube.left <= b_cube.right &&
      a_cube.right >= b_cube.left &&
      a_cube.bottom <= b_cube.top &&
      a_cube.top >= b_cube.bottom &&
      a_cube.far <= b_cube.near &&
      a_cube.near >= b_cube.far
    )) return;

  }
  test(): boolean {
    const { itr, attacker, victim, a_cube, b_cube, bdy } = this
    if (!itr.vrest && attacker.arest) return false;

    if (itr.kind !== ItrKind.Heal) {
      const b_catcher = victim.catcher;
      if (victim.blinking || victim.invisible || victim.invulnerable) return false;
      if (b_catcher && b_catcher.frame.cpoint?.hurtable !== 1) return false
    }

    if (
      a_cube.left > b_cube.right ||
      a_cube.right < b_cube.left ||
      a_cube.bottom > b_cube.top ||
      a_cube.top < b_cube.bottom ||
      a_cube.far > b_cube.near ||
      a_cube.near < b_cube.far
    ) return false;

    const ally_flag = attacker.is_ally(victim) ? HitFlag.Ally : HitFlag.Enemy;
    const bdy_flag = bdy.hit_flag ?? HitFlag.AllEnemy;
    const itr_flag = itr.hit_flag ?? HitFlag.AllEnemy;
    if (
      !(itr_flag & victim.data.type) ||
      !(bdy_flag & attacker.data.type) ||
      !(itr_flag & ally_flag) &&
      !(bdy_flag & ally_flag)
    ) return false;
    if (
      victim.team === attacker.team && victim.pre_emitter &&
      victim.pre_emitter === attacker.pre_emitter &&
      victim.spawn_time === attacker.spawn_time
    ) return false;

    if (bdy.tester?.run(this) === false) return false;
    if (itr.tester?.run(this) === false) return false;
    return true;
  }
  clone(): Collision {
    const ret = new Collision(this);
    Object.assign(ret, this);
    return ret;
  }
}
