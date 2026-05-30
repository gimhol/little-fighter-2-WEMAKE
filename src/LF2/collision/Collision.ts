import type { LF2 } from "../LF2";
import type { World } from "../World";
import { ENTITY_PRIORITY_MAP, HitFlag, ItrKind, type IBdyInfo, type IBounding, type IFrameInfo, type IItrInfo, } from "../defines";
import type { Entity } from "../entity";
import { abs, max } from "../utils/math/base";
import { collisions_keeper } from "./CollisionKeeper";
import { ICollisionSnapshot } from "./ICollisionSnapshot";

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
  readonly itr_index: number;
  readonly bdy_index: number;
}

export interface ICollisionFunc {
  (collision: Collision): void
}
export interface Collision extends ICollisionInits, ICollisionSnapshot {
  readonly lf2: LF2;
  readonly world: World;
  readonly aid: string;
  readonly vid: string;
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
  readonly adata_id: string;
  readonly vdata_id: string;
  readonly aframe_id: string;
  readonly bframe_id: string;
  readonly itr_index: number;
  readonly bdy_index: number;
  readonly priority: number;

  handlers?: Readonly<ICollisionFunc>;
  injury?: number;
  injury_r?: number;
  real_injury?: number;
  real_injury_r?: number;
  rest: number;
}

export function collision_new(o: ICollisionInits): Collision {
  let { attacker: a, victim: v, aframe, bframe, itr, bdy, itr_index, bdy_index } = o;
  const world = a.world;
  const ax = a.position.x;
  const ay = a.position.y;
  const az = a.position.z;
  const vx = v.position.x;
  const vy = v.position.y;
  const vz = v.position.z;
  const dx = vx - ax;
  const dy = vy - ay;
  const dz = vz - az;
  const a_cube = world.get_bounding(a, aframe, itr);
  const b_cube = world.get_bounding(v, bframe, bdy);

  do {
    if (o.itr.kind !== ItrKind.WeaponSwing) break;
    const prefab_id = a.bearer?.frame.wpoint?.attacking;
    if (!prefab_id) { itr_index = -1; break; }
    const itr_prefab = a.data.itr_prefabs?.[prefab_id];
    if (!itr_prefab) { itr_index = -1; break; }
    itr = { ...o.itr, ...itr_prefab };
  } while (0);

  let rest = 0;
  if (!itr.arest && itr.vrest) {
    rest = max(a.world.min_vrest, itr.vrest + a.world.vrest_offset)
  }

  const c: Collision = {
    lf2: a.lf2,
    world: a.world,
    aid: a.id,
    vid: v.id,
    attacker: a,
    victim: v,
    itr, bdy, aframe, bframe,
    ax, ay, az, vx, vy, vz, dx, dy, dz,
    adata_id: a.data.id,
    vdata_id: v.data.id,
    aframe_id: aframe.id,
    bframe_id: bframe.id,
    itr_index,
    bdy_index,
    m_distance: abs(dx) + abs(dy) + abs(dz),
    a_cube,
    b_cube,
    rest,
    handlers: [],
    priority: ENTITY_PRIORITY_MAP[a.data.type],
  }
  // if (c.itr_index < 0) Ditto.warn(`[Collision] itr_index < 0`);
  // if (c.bdy_index < 0) Ditto.warn(`[Collision] bdy_index < 0`);
  return c;
}

export function collision_get(attacker: Entity, victim: Entity): Collision | null {
  const aframe = attacker.frame;
  const bframe = victim.frame;
  const { itr } = aframe;
  const { bdy } = bframe;
  if (!itr?.length || !bdy?.length) return null;
  for (let i = 0; i < itr.length; ++i) {
    for (let j = 0; j < bdy.length; ++j) {
      const collision = collision_new({
        victim, attacker, itr: itr[i], bdy: bdy[j], aframe, bframe,
        itr_index: i, bdy_index: j,
      });
      if (!collision_test(collision)) continue;
      return collision
    }
  }
  return null
}

export function collision_to_snapshot(c: Collision): ICollisionSnapshot {
  return {
    aid: c.aid,
    vid: c.vid,
    adata_id: c.adata_id,
    vdata_id: c.vdata_id,
    aframe_id: c.aframe_id,
    bframe_id: c.bframe_id,
    itr_index: c.itr_index,
    bdy_index: c.bdy_index,
    ax: c.ax,
    ay: c.ay,
    az: c.az,
    vx: c.vx,
    vy: c.vy,
    vz: c.vz,
    dx: c.dx,
    dy: c.dy,
    dz: c.dz,
    m_distance: c.m_distance,
    rest: c.rest
  }
}

export function collision_from_snapshot(lf2: LF2, snapshot: ICollisionSnapshot): Collision | null {
  const attacker = lf2.world.find_entity(snapshot.aid)
  if (!attacker) return null;
  const victim = lf2.world.find_entity(snapshot.vid)
  if (!victim) return null;

  const adata = lf2.datas.find_entity(snapshot.adata_id)
  if (!adata) return null;
  const vdata = lf2.datas.find_entity(snapshot.vdata_id)
  if (!vdata) return null;

  const aframe = adata.frames[snapshot.aframe_id]
  if (!aframe) return null;
  const bframe = vdata.frames[snapshot.bframe_id]
  if (!bframe) return null;

  const itr = aframe.itr?.[snapshot.itr_index];
  if (!itr) return null;
  const bdy = aframe.bdy?.[snapshot.bdy_index];
  if (!bdy) return null;

  const ret = collision_new({
    attacker, victim, aframe, bframe, itr, bdy,
    itr_index: snapshot.itr_index, bdy_index: snapshot.bdy_index
  })
  Object.assign(ret, snapshot)
  return ret;
}

export function collision_clone(src: Collision): Collision {
  return Object.assign({}, src);
}

export function collision_test(c: Collision): boolean {
  if (c.bdy_index < 0) return false; // should not happen
  if (c.itr_index < 0) return false; // should not happen
  const { itr, attacker, victim, a_cube, b_cube, bdy } = c
  if (!itr.vrest && attacker.arest) return false;
  if (itr.vrest && victim.get_v_rest(c.aid)) return false;

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
    (
      !(itr_flag & ally_flag) &&
      !(bdy_flag & ally_flag)
    )
  ) return false;
  if (
    victim.team === attacker.team && victim.pre_emitter &&
    victim.pre_emitter === attacker.pre_emitter &&
    victim.spawn_time === attacker.spawn_time
  ) return false;

  if (bdy.tester?.run(c) === false) return false;
  if (itr.tester?.run(c) === false) return false;
  c.handlers = collisions_keeper.handler(c)
  return !!c.handlers;
}