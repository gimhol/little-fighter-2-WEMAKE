import type { ImageInfo } from "../loader/ImageInfo";
import type { IUIImgInfo } from "./IUIImgInfo.dat";
import { ui_load_img } from "./ui_load_img";
import { UINode } from "./UINode";
import { Times } from "./utils/Times";
type OutOfDateError = Error & {
  __is_out_of_date_error: boolean;
  textures: ImageInfo[] | undefined;
}

export class UIImgLoader {
  readonly node: () => UINode | null | undefined;
  protected _jid = new Times();
  constructor(node: () => UINode | null | undefined) {
    this.node = node;
  }
  private _out_of_date(textures?: ImageInfo[]): OutOfDateError {
    return Object.assign(new Error('out_of_date'), {
      __is_out_of_date_error: true,
      textures
    });
  }
  ignore_out_of_date(): this {
    this._jid.max = this._jid.min = this._jid.value = 0;
    return this;
  }
  set_img(imgs: string[], idx: number | undefined = 0): Promise<ImageInfo[]> {
    const _imgs = imgs.map<IUIImgInfo>(i => ({ path: i }));
    return this.load(_imgs, idx);
  }
  load(uiimgs: IUIImgInfo[], idx: number | undefined = 0): Promise<ImageInfo[]> {
    this._jid.add();
    const jid = this._jid.value;
    const node = this.node();
    if (!node) return Promise.reject(new Error(`[UIImgLoader::load] node got ${node}`));
    return new Promise((resolve, reject) => {
      if (jid !== this._jid.value) {
        reject(this._out_of_date());
        return;
      }
      uiimgs = uiimgs.map((v, i) => ({ ...node.data.img[i], ...v }))
      ui_load_img(node.lf2, uiimgs).then(imgs => {
        if (jid !== this._jid.value) {
          throw this._out_of_date(imgs);
        } else if (typeof idx === 'number') {
          const { w, h, scale } = imgs[idx];
          node.imgs.value = imgs;
          node.img_idx.value = 0;
          node.size.value = [w / scale, h / scale];
          resolve(imgs);
        } else {
          node.imgs.value = imgs;
          resolve(imgs);
        }
      }).catch(reject);
    });
  }
}
