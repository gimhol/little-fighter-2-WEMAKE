import { loop_offset } from "../../utils/container_help/loop_offset";
import { LF2PointerEvent } from "../LF2PointerEvent";
import { Label } from "./Label";

export class BGMSwitcher extends Label {
  static override readonly TAGS: string[] = ["BGMSwitcher"];
  private _which: 'Silent' | 'Random' | '' = '';
  get which(): string { return this._which || this.lf2.sounds.bgm() || "Silent"; }
  get offset(): number { return this.num(0) ?? 0; }
  private _sounds_cbs = {
    on_bgm_changed: () => this.set_text('BGM: ' + this.which)
  }
  override on_resume(): void {
    if (this.lf2.sounds.is_random)
      this._which = 'Random'
    if (this.offset == 0) {
      this.lf2.sounds.callbacks.add(this._sounds_cbs)
      this._sounds_cbs.on_bgm_changed()
    }
  }
  override on_pause(): void {
    this.lf2.sounds.callbacks.del(this._sounds_cbs)
  }
  override on_click(e: LF2PointerEvent): void {
    super.on_click?.(e)
    e.stop_immediate_propagation()
    e.stop_propagation();
    const { offset } = this;
    const list = ['Silent', 'Random', ...this.lf2.bgms]
    let next: string | undefined = void 0;
    if (offset) next = loop_offset(list, this.which, offset)
    else if (e.button === 0) next = loop_offset(list, this.which, 1)
    else if (e.button === 1) next = this.which === 'Silent' ? 'Random' : 'Silent'
    else if (e.button === 2) next = loop_offset(list, this.which, -1)
    else return;

    switch (next) {
      case 'Random':
        this._which = 'Random';
        this.lf2.sounds.play_bgm('?');
        break;
      case 'Silent':
        this._which = 'Silent';
        this.lf2.sounds.stop_bgm();
        break;
      default:
        this._which = '';
        if (next) this.lf2.sounds.play_bgm(next)
        break;
    }
  }
}

