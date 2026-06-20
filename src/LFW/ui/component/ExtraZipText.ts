import type { ILFWCallback } from '../../ILFWCallback';
import { Label } from "./Label";


export class ExtraZipText extends Label {
  static override readonly TAGS: string[] = ["ExtraZipText"];
  private _lf2_cbs: ILFWCallback = {
    on_extra_zips_changed: (lf2) => {
      const extra_zips = lf2.string('DATA_LIST')
      if (extra_zips) {
        const text = lf2.string('extra_data') + ':\n' + extra_zips
        this.set_text(text)
      } else {
        this.set_text(' ')
      }
    }
  };
  override on_start(): void {
    super.on_start();
    this.lfw.callbacks.add(this._lf2_cbs);
    this._lf2_cbs.on_extra_zips_changed?.(this.lfw);
  }
  override on_stop(): void {
    super.on_stop?.();
    this.lfw.callbacks.del(this._lf2_cbs);
  }
}
