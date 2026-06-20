import { clamp } from "../utils/math/clamp";

/**
 * 帧率计算
 *
 * @export
 * @class FPS
 */
export class FPS {
  /**
   * 帧率
   *
   * @readonly
   * @type {number}
   */
  get value(): number {
    return this._value;
  }

  /**
   * 帧率
   *
   * @private
   * @type {number}
   */
  private _value: number = 0;

  /**
   * 帧间隔时间
   *
   * @private
   * @type {number}
   */
  private _duration: number = 0;

  /**
   * 保留率
   *
   * @private
   * @type {number}
   */
  private _retention: number = 0.99;

  /**
   * Creates an instance of FPS.
   *
   * @constructor
   * @param {number} [retention=0.99] 保留率，范围[0, 0.99] 保留率越大，fps的波动越平缓。
   */
  constructor(retention: number = 0.99) {
    this._retention = clamp(retention, 0, 0.99);
  }

  update(dt: number) {
    // if (dt <= 0) return;
    if (this._duration)
      this._duration =
        this._duration * this._retention + dt * (1 - this._retention);
    else this._duration = dt;
    this._value = 1000 / this._duration;
  }

  reset() {
    this._value = 0;
    this._duration = 0;
  }
}

export default FPS;