import { IStyle } from "../defines/IStyle";
import type { TextInfo } from "../ditto/image/TextInfo";
import { Ditto } from "../ditto/Instance";
import { Times } from "../utils/Times";
import type { ICookedUITxtInfo } from "./IUITxtInfo.dat";
import { UINode } from "./UINode";

export class UITextLoader {
  readonly node: () => UINode | null | undefined;
  protected _jid = new Times(0);
  protected _cid: number = 0;
  protected _style: (i: number) => IStyle = (i: number) => {
    const node = this.node()
    if (!node) return {};
    return { ...node.txts.value[i]?.style }
  };
  constructor(node: () => UINode | null | undefined) {
    this.node = node;
  }
  private _load_txt(info: ICookedUITxtInfo) {
    const node = this.node()
    if (!node) return Promise.reject(new Error('node not found'));
    const value = node.lf2.string(info.i18n);
    const job = node.lf2.images.load_text(value, info.style);
    return job;
  }
  private _out_of_date(texture?: TextInfo) {
    return Object.assign(new Error('out_of_date'), {
      __is_out_of_date_error: true,
      texture
    });
  }
  get style(): IStyle { return this._style(0) }
  set style(style: IStyle | (() => IStyle)) { this.set_style(style); }
  get text(): string { return this.node()?.txts.value.at(0)?.text ?? '' }
  set text(v: string) { this.set_text(v).catch(e => Ditto.warn('' + e)); }

  set_style(style: IStyle | (() => IStyle)): this {
    this._style = typeof style === 'function' ? style : () => style
    return this;
  }
  set_text(txt: string): Promise<void> {
    return this.load({ i18n: txt, style: this._style(0) })
  }

  async load(txt: ICookedUITxtInfo): Promise<void> {
    const node = this.node()
    if (!node) return Promise.reject(new Error(`[UITextLoader::load] node got ${node}`));
    this._jid.add();
    const jid = this._jid.value;
    if (this._cid > jid) return;
    const tex = await this._load_txt(txt)
    if (this._cid > jid) return;
    const { w, h, scale } = tex
    node.txts.value = [tex];
    node.txt_idx.value = 0;
    node.resize(w / scale, h / scale);
    this._cid = jid;
  }
}

