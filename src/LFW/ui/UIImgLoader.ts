import type { ImageInfo } from "../ditto/image/ImageInfo";
import { Times } from "../utils/Times";
import type { IUIImgInfo } from "./IUIImgInfo.dat";
import { ui_load_img } from "./ui_load_img";
import { UINode } from "./UINode";
type OutOfDateError = Error & {
  __is_out_of_date_error: boolean;
  texture: ImageInfo | undefined;
}
export class UIImgLoader {
  readonly node: () => UINode | null | undefined;
  protected _jid = new Times();
  constructor(node: () => UINode | null | undefined) {
    this.node = node;
  }
  private _out_of_date(texture?: ImageInfo): OutOfDateError {
    return Object.assign(new Error('out_of_date'), {
      __is_out_of_date_error: true,
      texture
    });
  }
  ignore_out_of_date(): this {
    this._jid.max = this._jid.min = this._jid.value = 0;
    return this;
  }
  set_img(path: string): Promise<ImageInfo> {
    return this.load({ path });
  }
  load(uiimg: IUIImgInfo): Promise<ImageInfo> {
    this._jid.add();
    const jid = this._jid.value;
    const node = this.node();
    if (!node) return Promise.reject(new Error(`[UIImgLoader::load] node got ${node}`));
    return new Promise((resolve, reject) => {
      if (jid !== this._jid.value) {
        reject(this._out_of_date());
        return;
      }
      ui_load_img(node.lf2, uiimg).then(imgs => {
        if (jid !== this._jid.value) {
          throw this._out_of_date(imgs);
        }
        const { w, h, scale } = imgs;
        node.image = imgs;
        node.resize(w / scale, h / scale);
        resolve(imgs);
      }).catch(reject);
    });
  }
}
