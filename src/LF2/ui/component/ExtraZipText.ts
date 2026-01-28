import { ILf2Callback } from "@/LF2";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";


export class ExtraZipText extends UIComponent {
  static override TAG: string = 'ExtraZipText';
  private _txt_loader = new UITextLoader(() => this.node);
  private _lf2_cbs: ILf2Callback = {
    on_extra_zips_changed: (lf2) => {
      const extra_zips = lf2.string('DATA_LIST')
      if (extra_zips) {
        const text = lf2.string('entry_page.extra_data') + ':\n' + extra_zips
        this._txt_loader.set_text([text])
      } else {
        this._txt_loader.set_text([' '])
      }
    }
  };
  override on_start(): void {
    super.on_start?.();
    this.lf2.callbacks.add(this._lf2_cbs);
    this._lf2_cbs.on_extra_zips_changed?.(this.lf2);
  }
  override on_stop(): void {
    super.on_stop?.();
    this.lf2.callbacks.del(this._lf2_cbs);
  }
}
