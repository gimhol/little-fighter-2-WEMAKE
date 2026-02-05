import { loop_offset } from "../../utils/container_help/loop_offset";
import { IUIPointerEvent } from "../IUIPointerEvent";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class BGMSwitcher extends UIComponent {
  static override readonly TAG: string = "BGMSwitcher";
  private _text_loader = new UITextLoader(() => this.node).ignore_out_of_date();
  private _which: 'Silent' | 'Random' | '' = '';
  private _sounds_cbs = {
    on_bgm_changed: () => this._text_loader.set_text(['BGM: ' + this.text])
  }
  get offset(): number { return this.num(0) ?? 0; }
  get which(): boolean { return this.which }
  get text(): string { return this._which || this.lf2.sounds.bgm() || "Silent"; }
  override on_resume(): void {
    super.on_resume();
    if (this.lf2.sounds.is_random)
      this._which = 'Random'
    if (this.offset == 0) {
      this.lf2.sounds.callbacks.add(this._sounds_cbs)
      this._sounds_cbs.on_bgm_changed()
    }
  }
  override on_pause(): void {
    super.on_pause();
    this.lf2.sounds.callbacks.del(this._sounds_cbs)
  }
  override on_click(e: IUIPointerEvent): void {
    super.on_click?.(e)
    e.stop_immediate_propagation()
    e.stop_propagation();
    const { offset } = this;
    const list = ['Silent', 'Random', ...this.lf2.bgms]

    let o = 0;
    let next: string | undefined = void 0;
    if (offset) next = loop_offset(list, this.text, offset)
    else if (e.button === 0) next = loop_offset(list, this.text, 1)
    else if (e.button === 1) next = this.text === 'Silent' ? 'Random' : 'Silent'
    else if (e.button === 2) next = loop_offset(list, this.text, -1)
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

