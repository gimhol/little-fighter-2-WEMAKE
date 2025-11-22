import IStyle from "../defines/IStyle";
import type { TextImageInfo } from "../loader/TextImageInfo";
import type { ICookedUITxtInfo } from "./IUITxtInfo.dat";
import { UINode } from "./UINode";
import { Times } from "./utils/Times";

export class UITextLoader {
  readonly node: () => UINode;
  protected _jid = new Times();
  protected _style: () => IStyle = () => ({});
  constructor(node: () => UINode) {
    this.node = node;
  }
  private _load_txt(info: ICookedUITxtInfo) {
    const node = this.node()
    const value = node.lf2.string(info.i18n);
    const job = node.lf2.images.load_text(value, info.style);
    return job;
  }
  private _out_of_date(textures?: TextImageInfo[]) {
    return Object.assign(new Error('out_of_date'), {
      __is_out_of_date_error: true,
      textures
    });
  }
  set_style(style: IStyle | (() => IStyle)): this {
    this._style = typeof style === 'function' ? style : () => style
    return this;
  }
  ignore_out_of_date(): this {
    this._jid.max = this._jid.min = this._jid.value = 0;
    return this;
  }
  set_text(txts: string[], idx: number | undefined = 0): Promise<TextImageInfo[]> {
    const _txts = txts.map(i18n => ({ i18n, style: this._style() }))
    return this.load(_txts, idx)
  }
  load(txts: ICookedUITxtInfo[], idx: number | undefined = 0): Promise<TextImageInfo[]> {
    this._jid.add();
    const jid = this._jid.value;
    const node = this.node()
    return new Promise((resolve, reject) => {
      if (jid !== this._jid.value) {
        reject(this._out_of_date());
        return;
      }
      const jobs = txts.map(txt => this._load_txt(txt))
      Promise.all(jobs).then(textures => {
        if (jid !== this._jid.value) {
          throw this._out_of_date(textures);
        } else if (typeof idx === 'number') {
          const { w, h, scale } = textures[idx]
          node.txts.value = textures;
          node.txt_idx.value = 0;
          node.size.value = [w / scale, h / scale];
          resolve(textures);
        } else {
          node.txts.value = textures;
          resolve(textures);
        }
      }).catch(reject)
    });
  }
}

