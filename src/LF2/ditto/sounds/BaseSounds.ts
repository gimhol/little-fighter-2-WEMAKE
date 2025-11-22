import Callbacks from "../../base/Callbacks";
import type { NoEmitCallbacks } from "../../base/NoEmitCallbacks";
import type { LF2 } from "../../LF2";
import type { ISounds } from "./ISounds";
import type { ISoundsCallback } from "./ISoundsCallback";

export class BaseSounds implements ISounds {
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  protected _callbacks = new Callbacks<ISoundsCallback>();
  get callbacks(): NoEmitCallbacks<ISoundsCallback> {
    return this._callbacks;
  }
  bgm_volume(): number {
    return 0;
  }
  set_bgm_volume(v: number): void { }
  sound_volume(): number {
    return 0;
  }
  set_sound_volume(v: number): void { }
  bgm_muted(): boolean {
    return true;
  }
  set_bgm_muted(v: boolean): void { }
  sound_muted(): boolean {
    return true;
  }
  set_sound_muted(v: boolean): void { }
  muted(): boolean {
    return true;
  }
  set_muted(v: boolean): void { }
  volume(): number {
    return 0;
  }
  set_volume(v: number): void { }

  has(name: string): boolean {
    return false;
  }
  stop_bgm(): void { }
  bgm(): string | null {
    return null;
  }
  play_bgm(name: string): () => void {
    return () => void 0;
  }
  load(name: string, src: string): Promise<any> {
    return Promise.reject(new Error(BaseSounds.name));
  }
  play(name: string, x?: number, y?: number, z?: number): string {
    return "";
  }
  stop(id: string): void { }
  dispose(): void {
    this._callbacks.clear()
  }
  async play_with_load(
    src: string,
    x?: number,
    y?: number,
    z?: number,
  ): Promise<string> {
    if (!this.has(src)) await this.load(src, src);
    return this.play(src, x, y, z);
  }
  play_preset(t: string, x?: number, y?: number, z?: number): void {
    switch (t) {
      case "cancel":
      case "end":
      case "join":
      case "ok":
      case "pass":
        this.play_with_load(`data/m_${t}.wav.mp3`, x, y, z);
        break;
      default:
        this.play_with_load(t, x, y, z);
        break;
    }
  }
}
