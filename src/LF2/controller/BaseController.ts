import type { IFrameInfo, IHitKeyCollection, LGK, TNextFrame } from "../defines";
import { GK, StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import { is_bot_ctrl, is_local_ctrl } from "../entity/type_check";
import { Times } from "../ui/utils/Times";
import { ControllerUpdateResult } from "./ControllerUpdateResult";
import DoubleClick from "./DoubleClick";
import { KeyStatus } from "./KeyStatus";
import { SeqKeys } from "./SeqKeys";
export type TKeys = Record<GK, string>;
export const KEY_NAME_LIST = [
  GK.d,
  GK.L,
  GK.R,
  GK.U,
  GK.D,
  GK.j,
  GK.a,
] as const;
export const CONFLICTS_KEY_MAP: Record<GK, GK | undefined> = {
  a: void 0,
  j: void 0,
  d: void 0,
  [GK.L]: GK.R,
  [GK.R]: GK.L,
  [GK.U]: GK.D,
  [GK.D]: GK.U,
};

/**
 * @link https://www.processon.com/view/link/6765125f16640e2a68b21418?cid=6764eb96c3e02b46ac818e40
 */
export class BaseController {
  static readonly TAG: string = 'BaseController';
  readonly __is_base_ctrl__ = true;
  readonly player_id: string;

  private _time = new Times(10, Number.MAX_SAFE_INTEGER);
  private _disposers = new Set<() => void>();

  get world() {
    return this.entity.world;
  }
  get lf2() {
    return this.world.lf2;
  }
  get time() {
    return this._time.value;
  }
  set disposer(f: (() => void)[] | (() => void)) {
    if (Array.isArray(f)) for (const i of f) this._disposers.add(i);
    else this._disposers.add(f);
  }
  entity: Entity;
  keys: Record<LGK, KeyStatus> = {
    L: new KeyStatus(this),
    R: new KeyStatus(this),
    U: new KeyStatus(this),
    D: new KeyStatus(this),
    a: new KeyStatus(this),
    j: new KeyStatus(this),
    d: new KeyStatus(this),
  };

  readonly dbc: Record<LGK, DoubleClick<IFrameInfo>>;

  get LR(): 0 | 1 | -1 {
    const L = !this.keys.L.is_end();
    const R = !this.keys.R.is_end();
    return L === R ? 0 : R ? 1 : -1;
  }

  get UD(): 0 | 1 | -1 {
    const U = !this.keys.U.is_end();
    const D = !this.keys.D.is_end();
    return U === D ? 0 : D ? 1 : -1;
  }

  get jd(): 0 | 1 | -1 {
    const d = !this.keys.d.is_end();
    const j = !this.keys.j.is_end();
    return d === j ? 0 : d ? -1 : 1;
  }

  private _key_list: string = '';
  reset_key_list() { this._key_list = '' }

  /**
   * 指定按键进入start状态（按下）
   * @param keys 指定按键
   * @returns {this}
   */
  start(...keys: LGK[]): this {
    this.queue.push(...keys.map(k => [1, k] as const))
    for (const key of keys) if (this.keys[key].is_end()) this._key_downs += key
    return this;
  }

  /**
   * 指定按键进入hold状态
   * @param keys 指定按键
   * @returns {this}
   */
  hold(...keys: LGK[]): this {
    this.queue.push(...keys.map(k => [2, k] as const))
    return this;
  }

  /**
   * 指定按键进入end状态（松开）
   * @param keys 指定按键
   * @returns {this}
   */
  end(...keys: LGK[]): this {
    this.queue.push(...keys.map(k => [0, k] as const))
    for (const key of keys) if (!this.keys[key].is_end()) this._key_ups += key
    return this;
  }

  /**
   * 指定按键直接进入"双击"状态(结尾不会抬起)
   * like: ⬇+⬆+⬇
   * @param keys 指定按键
   * @returns {this}
   */
  db_hit(...keys: LGK[]): this {
    this.start(...keys)
      .end(...keys)
      .start(...keys);
    return this;
  }
  is_hold(k: string): boolean;
  is_hold(k: LGK): boolean;
  is_hold(k: LGK): boolean {
    return !!this.keys[k]?.is_hld();
  }

  is_hit(k: string): boolean;
  is_hit(k: LGK): boolean;
  is_hit(k: LGK): boolean {
    return !!this.keys[k]?.is_hit();
  }

  is_db_hit(k: LGK): boolean {
    const { time, data: [f_0, f_1] } = this.dbc[k];
    if (
      f_0?.state !== StateEnum.Standing &&
      f_0?.state !== StateEnum.Walking &&
      f_1?.state !== StateEnum.Standing &&
      f_1?.state !== StateEnum.Walking &&
      (k === GK.L || k === GK.R)
    ) {
      /*
        Note: 
          （特殊对待跑步的逻辑）
          状态为“站立”与“行走”的帧，左键或右键双击，
          需要两次点击的帧状态均为“站立”或“行走”，才视为双击。
            -Gim
      */
      return false;
    }
    return time > 0 && this.time - time <= this.entity.world.key_hit_duration;
  }
  is_end(k: string): boolean;
  is_end(k: LGK): boolean;
  is_end(k: LGK): boolean {
    return !!this.keys[k]?.is_end();
  }

  is_start(k: string): boolean;
  is_start(k: LGK): boolean;
  is_start(k: LGK): boolean {
    return !!this.keys[k]?.is_start();
  }
  press(...keys: LGK[]) {
    for (const k of keys) if (this.is_end(k)) this.start(k);
    return this;
  }
  release(...keys: LGK[]) {
    for (const k of keys) if (!this.is_end(k)) this.end(k);
    return this;
  }
  constructor(player_id: string, entity: Entity) {
    this.player_id = player_id;
    this.entity = entity;
    this.dbc = {
      d: new DoubleClick("d", entity.world.double_click_interval),
      a: new DoubleClick("a", entity.world.double_click_interval),
      j: new DoubleClick("j", entity.world.double_click_interval),
      L: new DoubleClick("L", entity.world.double_click_interval),
      R: new DoubleClick("R", entity.world.double_click_interval),
      U: new DoubleClick("U", entity.world.double_click_interval),
      D: new DoubleClick("D", entity.world.double_click_interval),
    };
  }
  dispose(): void {
    for (const f of this._disposers) f();
  }
  tst(type: "hit" | "hld" | "dbl" | "kd" | 'ku', key: LGK) {
    const conflict_key = CONFLICTS_KEY_MAP[key];
    if (conflict_key && !this.is_end(conflict_key)) return false;
    if (type === "kd") return !this.is_end(key);
    if (type === "ku") return this.is_end(key);
    if (type === "dbl") return this.is_db_hit(key);
    if (type === "hit") return this.keys[key].is_hit() && !this.keys[key].used;
    else return this.keys[key].is_hld();
  }

  // too stupid.
  protected dddd = new SeqKeys([GK.d, GK.d, GK.d, GK.d])
  protected dada = new SeqKeys([GK.d, GK.a, GK.d, GK.a])
  protected djdj = new SeqKeys([GK.d, GK.j, GK.d, GK.j])

  protected result = new ControllerUpdateResult();
  readonly queue: (readonly [0 | 1 | 2, LGK])[] = []
  private _key_downs: string = ''
  private _key_ups: string = ''
  update(): ControllerUpdateResult {
    this._time.add()
    if (
      !this.entity.shaking &&
      !this.entity.motionless &&
      this.queue.length
    ) {
      for (const [status, k] of this.queue) {
        switch (status) {
          case 0:
            if (!this.is_end(k))
              this.keys[k].end();
            break;
          case 1:
            if (!this.is_end(k)) break;

            if (k === GK.d) {
              this._key_list = k;
            } else if (this._key_list[0] === GK.d) {
              this._key_list += k;
            }
            this.keys[k].hit(this.time);
            const ck = CONFLICTS_KEY_MAP[k];
            if (ck) this.dbc[ck].reset();
            this.dbc[k].press(this.time, this.entity.frame);
            break;
          case 2:
            this.keys[k].hit(this.time - this.entity.world.key_hit_duration);
            break;
        }
      }

      if (is_local_ctrl(this)) {
        switch (this._key_downs) {
          case '': break;
          case GK.Defend:
            this.dddd.test(GK.Defend, this.time)
            this.dada.test(GK.Defend, this.time)
            this.djdj.test(GK.Defend, this.time)
            break;
          case GK.Attack:
            this.dada.test(GK.Attack, this.time)
            break;
          case GK.Jump:
            this.dada.test(GK.Jump, this.time)
            break;
          case 'dj':
          case 'jd':
            if (this.djdj.idx % 2) {
              this.djdj.test(GK.Jump, this.time)
              this.djdj.test(GK.Defend, this.time)
            } else {
              this.djdj.test(GK.Defend, this.time)
              this.djdj.test(GK.Jump, this.time)
            }
            break;
          case 'da':
          case 'ad':
            if (this.dada.idx % 2) {
              this.dada.test(GK.Attack, this.time)
              this.dada.test(GK.Defend, this.time)
            } else {
              this.dada.test(GK.Attack, this.time)
              this.dada.test(GK.Jump, this.time)
            }
            break;
          default:
            this.dddd.hit || this.dddd.reset()
            this.dada.hit || this.dada.reset()
            this.djdj.hit || this.djdj.reset()
            break;
        }
      }
      this.queue.length = 0;
      this._key_downs = '';
      this._key_downs = '';
    }
    if (is_local_ctrl(this)) {
      if (this.dddd.hit) {
        this.world.etc(this.entity.position.x, this.entity.position.y, this.entity.position.z, "2")
        this.world.team_stay(this.entity.team)
        this.dddd.reset()
      }
      if (this.dada.hit) {
        this.world.etc(this.entity.position.x, this.entity.position.y, this.entity.position.z, "4")
        this.world.team_move(this.entity.team)
        this.dada.reset()
      }
      if (this.djdj.hit) {
        this.world.etc(this.entity.position.x, this.entity.position.y, this.entity.position.z, "0")
        this.world.team_come(this.entity.team, this.entity.position.x, this.entity.position.y, this.entity.position.z)
        this.djdj.reset()
      }
    }
    const entity = this.entity;
    const frame = entity.frame;
    const { hold: hld, hit, key_down: kd_map, key_up: ku_map } = frame;

    const ret = this.result.set(void 0, 0);

    const { facing } = entity;
    let F: "L" | "R" = facing === 1 ? "R" : "L";
    let B: "L" | "R" = facing === 1 ? "L" : "R";

    if (kd_map) {
      /** 相对方向的按钮判定 */
      if (kd_map.F && this.tst('kd', F) && !ret.time)
        ret.set(kd_map.F, this.keys[F].time, F);
      if (kd_map.B && this.tst("kd", B) && !ret.time)
        ret.set(kd_map.B, this.keys[B].time, B);
    }
    if (ku_map) {
      /** 相对方向的按钮判定 */
      if (ku_map.F && this.tst("ku", F) && !ret.time)
        ret.set(ku_map.F, this.keys[F].time, F);
      if (ku_map.B && this.tst("ku", B) && !ret.time)
        ret.set(ku_map.B, this.keys[B].time, B);
    }

    if (hit) {
      /** 相对方向的按钮判定 */
      if (hit.F && this.tst("hit", F) && !ret.time)
        ret.set(hit.F, this.keys[F].use(), F);
      if (hit.B && this.tst("hit", B) && !ret.time)
        ret.set(hit.B, this.keys[B].use(), B);

      /** 相对方向的双击判定 */
      if (hit.FF && this.tst("dbl", F)) ret.set(hit.FF, this.dbc[F].time);
      if (hit.BB && this.tst("dbl", B)) ret.set(hit.BB, this.dbc[B].time);
    }

    /** 相对方向的按钮判定 */
    if (hld) {
      if (hld.F && this.tst("hld", F)) ret.set(hld.F, this.keys[F].time, F);
      if (hld.B && this.tst("hld", B)) ret.set(hld.B, this.keys[B].time, B);
    }

    for (const name of KEY_NAME_LIST) {
      const key = this.keys[name];


      if (kd_map) {
        /** 按键判定 */
        let act = kd_map[name];
        if (act && this.tst("kd", name) && !ret.time) {
          ret.set(act, key.time, name);
        }
      }
      if (ku_map) {
        /** 按键判定 */
        let act = ku_map[name];
        if (act && this.tst("ku", name) && !ret.time) {
          ret.set(act, key.time, name);
        }
      }
      if (hit) {
        /** 按键判定 */
        let act = hit[name];
        if (act && this.tst("hit", name) && !ret.time) {
          ret.set(act, key.use(), name);
        }

        /** 双击判定 */
        const keykey = `${name}${name}` as keyof IHitKeyCollection;
        act = hit[keykey];
        if (act && this.tst("dbl", name)) {
          ret.set(act, this.dbc[name].time);
        }
      }
      if (hld) {
        /** 长按判定 */
        let act = hld[name];
        if (act && this.tst("hld", name) && !ret.time) {
          ret.set(act, key.time, name);
        }
      }
    }
    frame?.seq_map && this.check_hit_seqs(frame.seq_map, ret);
    /** 这里不想支持过长的指令 */
    if (this._key_list && this._key_list.length >= 10) this._key_list = '';
    return ret;
  }

  private check_hit_seqs(seqs: Map<string, TNextFrame>, result: ControllerUpdateResult) {
    /** 同时按键 判定 */
    if (this.keys.d.is_hit()) {
      for (const [seq, nf] of seqs) {
        if (!seq || !nf) continue;
        if (!this.sametime_keys_test(seq)) continue;
        for (let k of seq) this.keys[k as GK]?.use();
        result.set(nf, this.time, void 0, this._key_list);
        this._key_list = '';
        return;
      }
    }
    if (is_bot_ctrl(this)) return;
    /** 顺序按键 判定 */
    if (this._key_list.length >= 3) {
      for (const [seq, nf] of seqs) {
        if (!seq || !nf) continue;
        if (!this.sequence_keys_test(seq)) continue;
        result.set(nf, this.time, void 0, this._key_list);
        for (let k of seq) this.keys[k as GK]?.use();
        this._key_list = '';
        return;
      }
    }
    result.key_list = this._key_list;
  }

  sequence_keys_test(str: string): boolean {
    if (this._key_list[0] !== 'd') return false;
    for (let i = 0; i < str.length; i++) {
      let actual_key = this._key_list[i + 1]
      let expected_key = str[i]
      if (expected_key === 'F')
        expected_key = this.entity.facing > 0 ? GK.R : GK.L
      else if (expected_key === 'B')
        expected_key = this.entity.facing < 0 ? GK.R : GK.L
      if (expected_key !== actual_key)
        return false;
    }
    return true;
  }
  sametime_keys_test(str: string): boolean {
    for (let k of str) {
      if (k === 'F')
        k = this.entity.facing > 0 ? GK.R : GK.L
      else if (k === 'B')
        k = this.entity.facing < 0 ? GK.R : GK.L
      if (!this.is_hit(k))
        return false;
    }
    return true;
  }
}
