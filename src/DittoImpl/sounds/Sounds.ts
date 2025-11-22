import type { LF2 } from "@/LF2/LF2";
import { Ditto } from "@/LF2/ditto";
import BaseSounds from "@/LF2/ditto/sounds/BaseSounds";
import type ISounds from "@/LF2/ditto/sounds/ISounds";
import { __Fallback } from "./Fallback";
import { __Modern } from "./Modern";

export class __Sounds implements ISounds {
  static readonly TAG: string = "__Sounds";
  readonly inner: ISounds;
  readonly cls_list: (new (lf2: LF2) => ISounds)[] = [__Modern, __Fallback];

  get callbacks() {
    return this.inner.callbacks;
  }

  constructor(lf2: LF2) {
    this.inner = new BaseSounds(lf2);
    for (const cls of this.cls_list) {
      try {
        this.inner = new cls(lf2);
        break;
      } catch (e) {
        Ditto.warn(
          __Sounds.TAG + "::constructor",
          "can not use " + cls.name,
          e,
        );
      }
    }
  }
  bgm_volume(): number {
    return this.inner.bgm_volume();
  }
  set_bgm_volume(v: number): void {
    return this.inner.set_bgm_volume(v);
  }
  sound_volume(): number {
    return this.inner.sound_volume();
  }
  set_sound_volume(v: number): void {
    return this.inner.set_sound_volume(v);
  }
  bgm_muted(): boolean {
    return this.inner.bgm_muted();
  }
  set_bgm_muted(v: boolean): void {
    return this.inner.set_bgm_muted(v);
  }
  sound_muted(): boolean {
    return this.inner.sound_muted();
  }
  set_sound_muted(v: boolean): void {
    return this.inner.set_sound_muted(v);
  }
  muted(): boolean {
    return this.inner.muted();
  }
  set_muted(v: boolean): void {
    return this.inner.set_muted(v);
  }
  volume(): number {
    return this.inner.volume();
  }
  set_volume(v: number): void {
    return this.inner.set_volume(v);
  }
  bgm(): string | null {
    return this.inner.bgm();
  }
  has(name: string): boolean {
    return this.inner.has(name);
  }
  load(key: string, src: string) {
    return this.inner.load(key, src);
  }
  stop_bgm(): void {
    return this.inner.stop_bgm();
  }
  play_bgm(name: string, restart?: boolean | undefined): () => void {
    return this.inner.play_bgm(name, restart);
  }
  play(name: string, x?: number, y?: number, z?: number): string {
    return this.inner.play(name, x, y, z);
  }
  stop(id: string): void {
    return this.inner.stop(id);
  }

  async play_with_load(
    src: string,
    x?: number,
    y?: number,
    z?: number,
  ): Promise<string> {
    return this.inner.play_with_load(src, x, y, z);
  }
  play_preset(
    t: "cancel" | "end" | "join" | "ok" | "pass",
    x?: number,
    y?: number,
    z?: number,
  ): void;
  play_preset(t: string, x?: number, y?: number, z?: number): void;
  play_preset(
    t: "cancel" | "end" | "join" | "ok" | "pass" | string,
    x?: number,
    y?: number,
    z?: number,
  ): void {
    return this.inner.play_preset(t, x, y, z);
  }

  dispose(): void {
    this.inner.dispose();
  }
}
