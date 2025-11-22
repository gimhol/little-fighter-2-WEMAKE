import type { NoEmitCallbacks } from "../../base/NoEmitCallbacks";
import { Defines } from "../../defines";
import type { ISoundsCallback } from "./ISoundsCallback";

export interface ISounds {
  get callbacks(): NoEmitCallbacks<ISoundsCallback>;

  /**
   * 获取背景音乐的音量
   *
   * @returns {number} [0,1]
   */
  bgm_volume(): number;

  /**
   * 设置背景音乐的音量
   *
   * @param {number} v [0,1]
   */
  set_bgm_volume(v: number): void;

  /**
   * 获取音效的音量
   *
   * @returns {number} [0,1]
   */
  sound_volume(): number;

  /**
   * 设置音效的音量
   *
   * @param {number} v [0,1]
   */
  set_sound_volume(v: number): void;

  /**
   * 背景音乐是否禁音
   *
   * @returns {boolean}
   */
  bgm_muted(): boolean;

  /**
   * 设置背景音乐是否禁音
   *
   * @param {boolean} v
   */
  set_bgm_muted(v: boolean): void;

  /**
   * 音效是否禁音
   *
   * @returns {boolean}
   */
  sound_muted(): boolean;

  /**
   * 设置音效是否禁音
   *
   * @param {boolean} v
   */
  set_sound_muted(v: boolean): void;

  /**
   * 是否禁音
   *
   * @returns {boolean}
   */
  muted(): boolean;

  /**
   * 设置是否禁音
   *
   * @param {boolean} v
   */
  set_muted(v: boolean): void;

  /**
   * 音量
   *
   * @returns {number} [0,1]
   */
  volume(): number;

  /**
   * 设置
   *
   * @param {number} v [0,1]
   */
  set_volume(v: number): void;

  /**
   * 停止背景音乐
   * @date 4/12/2024 - 10:22:30 AM
   */
  stop_bgm(): void;

  /**
   * 播放背景音乐
   * @date 4/12/2024 - 10:23:17 AM
   *
   * @param {string} name
   * @param {boolean|undefined} restart
   * @returns {() => void} 此方法将停止本次play_bgm播放的背景音乐
   */
  play_bgm(name: string, restart?: boolean | undefined): () => void;

  /**
   * 当前播放中的背景音乐
   *
   * @returns {(string | null)}
   */
  bgm(): string | null;

  /**
   * 预加载声音资源
   * 
   * @note 实现该函数时，应考虑对相同资源重复load的问题
   * 
   * @date 4/12/2024 - 10:25:37 AM
   *
   * @param {string} name 声音名
   * @param {string} src 声音源
   * @returns {Promise<any>}
   */
  load(name: string, src: string): Promise<any>;

  /**
   * 对应名称声音是否存在
   * @date 4/12/2024 - 10:45:14 AM
   *
   * @param {string} name 声音名
   * @returns {boolean} 存在返回true 否则返回false
   */
  has(name: string): boolean;

  /**
   * 播放音效
   * @date 4/12/2024 - 10:25:08 AM
   *
   * @param {string} name 声音名;
   * @param {?number} [x] 音效产生位置x;
   * @param {?number} [y] 音效产生位置y;
   * @param {?number} [z] 音效产生位置z;
   * @returns {string} 声音ID
   */
  play(name: string, x?: number, y?: number, z?: number): string;

  /**
   * 停止播放音效
   *
   * @param {string} id
   */
  stop(id: string): void;

  /**
   * 释放
   */
  dispose(): void;

  play_with_load(
    src: string,
    x?: number,
    y?: number,
    z?: number,
  ): Promise<string>;

  play_preset(
    t: Defines.TBuiltIn_Sounds,
    x?: number,
    y?: number,
    z?: number,
  ): void;
  play_preset(t: string, x?: number, y?: number, z?: number): void;
}
