import type { World } from "../World";

export class KeyStatus {
  readonly ctrl: { time: number, world: World };
  /**
   * 按键按下的时间
   *
   * @private
   * @type {number}
   * @memberof KeyStatus
   */
  private _d_time: number = 0;
  private _u_time: number = 0;
  private _used: 0 | 1 = 0;

  /**
   * 按键按下的时间
   *
   * @readonly
   * @type {number}
   * @memberof KeyStatus
   */
  get time(): number {
    return this._d_time;
  }
  get u_time(): number {
    return this._u_time;
  }
  /**
   * 按键是否被消耗
   *
   * @type {(0 | 1)}
   * @memberof KeyStatus
   */
  get used(): 0 | 1 {
    return this._used;
  }

  constructor(ctrl: typeof this.ctrl) {
    this.ctrl = ctrl;
  }
  use(): number {
    this._used = 1;
    return this._d_time;
  }
  is_start(): boolean {
    const { _d_time } = this;
    return !!_d_time && _d_time === this.ctrl.time;
  }
  is_hit(): boolean {
    const { _d_time } = this;
    if (!_d_time) return false;

    /** 按键时长（单位帧） */
    const dt = this.ctrl.time - _d_time
    /** 按键时长短于一定时间内时，视为按键被按下 */
    return dt < this.ctrl.world.key_hit_duration;
  }
  is_hld(): boolean {
    return !this.is_hit() && this._d_time > this._u_time;
  }
  is_end(): boolean {
    return this._d_time <= this._u_time;
  }
  hit(t: number = this.ctrl.time): void {
    this._d_time = t;
    this._used = 0;
  }
  end(): void {
    this._u_time = this.ctrl.time
  }
}
