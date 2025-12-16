import { ISchema } from "../defines";
import { Ditto } from "../ditto";
import { LF2 } from "../LF2";
import { floor, is_str, Unsafe } from "../utils";
import { find_ui_template } from "./find_ui_template";
import { IComponentInfo } from "./IComponentInfo";
import { ICookedUIInfo } from "./ICookedUIInfo";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import { Schema_IUIImgInfo } from "./Schema_IUIImgInfo";
import type { IUIInfo, TUITxtInfo } from "./IUIInfo.dat";
import { ICookedUITxtInfo } from "./IUITxtInfo.dat";
import { judger, parse_ui_value, unsafe_is_object } from "./read_info_value";
import { read_ui_template } from "./read_ui_template";
import { ui_load_img } from "./ui_load_img";
import { ui_load_txt } from "./ui_load_txt";
import { UINode } from "./UINode";
import { parse_call_func_expression } from "./utils";
import read_nums from "./utils/read_nums";
import { validate_ui_img_info } from "./utils/validate_ui_img_info";

export function flat_ui_img_info(imgs: IUIImgInfo[], output?: IUIImgInfo[]): IUIImgInfo[] {
  const ret: IUIImgInfo[] = [];
  for (const img of imgs) {
    const errors: string[] = [];
    validate_ui_img_info(img, errors);
    if (errors.length) throw new Error(errors.join('\n'));
    const { x = 0, y = 0, w = 0, h = 0, col: cols = 1, row: rows = 1, count = 0 } = img;
    let idx = 0;
    for (let row = 0; row < rows && (count <= 0 || idx < count); ++row) {
      for (let col = 0; col < cols && (count <= 0 || idx < count); ++col) {
        const i: IUIImgInfo = { ...img, x: x + col * w, y: y + row * h }
        ret.push(i);
        output?.push(i)
        ++idx;
      }
    }
  }
  return ret;
}

function cook_ui_txt_info(lf2: LF2, ui_info: ICookedUIInfo, raw: TUITxtInfo | TUITxtInfo[] | undefined, out: ICookedUITxtInfo[] = []): ICookedUITxtInfo[] {
  if (!raw) return [];

  const raws = Array.isArray(raw) ? raw : [raw];
  for (const info of raws) {
    if (!info) continue;
    if (typeof info === 'string') {
      const i18n = parse_ui_value(ui_info, 'string', info) ?? info
      out.push({ i18n: lf2.string(i18n), style: {} })
    } else {
      const i18n = parse_ui_value(ui_info, 'string', info.i18n) ?? ''
      out.push({
        i18n: lf2.string(i18n),
        style: parse_ui_value(ui_info, unsafe_is_object, info.style) ?? {}
      })
    }
  }
  return out
}

export async function cook_ui_info(
  lf2: LF2,
  data_or_path: IUIInfo | string,
  parent?: ICookedUIInfo
): Promise<ICookedUIInfo> {

  let ui_info: IUIInfo = is_str(data_or_path)
    ? await find_ui_template(lf2, parent, data_or_path)
    : data_or_path;

  if (ui_info.template)
    ui_info = await read_ui_template(lf2, ui_info, parent);

  const id = ui_info.id || 'no_id_' + Date.now();
  const name = ui_info.name || 'no_name_' + Date.now();
  const components = ui_info.component?.map(t => {
    if (typeof t !== 'string') return t;
    const pr = parse_call_func_expression(t);
    if (!pr) return { name: t }
    const ret: IComponentInfo = { ...pr }
    return ret;
  }).sort((a, b) => (b.weight || 0) - (a.weight || 0)) ?? [];

  const ret: ICookedUIInfo = {
    ...ui_info,
    values: ui_info.values ? ui_info.values : {},
    id, name,
    pos: read_nums(ui_info.pos, 3, [0, 0, 0]),
    scale: read_nums(ui_info.scale, 3, [1, 1, 1]),
    center: read_nums(ui_info.center, 3, [0, 0, 0]),
    size: [0, 0],
    parent,
    img_infos: [],
    txt_infos: [],
    items: void 0,
    img: [],
    txt: [],
    component: components
  };

  const { img } = ui_info;
  const imgs = Array.isArray(img) ? img : img ? [img] : []
  const _img: IUIImgInfo[] = [];
  for (const i of imgs) {
    let rr: Unsafe<IUIImgInfo> = void 0;
    if (typeof i === 'string') {
      rr = parse_ui_value<IUIImgInfo>(ret, judger(validate_ui_img_info), i)
    } else {
      rr = i
    }
    if (!rr) {
      // debugger;
      continue;
    }
    for (const k in Schema_IUIImgInfo.properties) {
      const meta = (Schema_IUIImgInfo.properties as any)[k] as ISchema;
      const val = (rr as any)[k];
      if (!meta || !val || typeof val !== 'string' || !val.startsWith('$val:'))
        continue;
      // FIXME: `meta.type as any`
      (rr as any)[k] = parse_ui_value(ret, meta.type as any, val) ?? val
    }
    _img.push(rr)
  }
  if (_img.some(v => typeof v !== 'object')) debugger;
  if (_img.length) ret.img_infos.push(...await ui_load_img(lf2, _img, ret.img));

  cook_ui_txt_info(lf2, ret, ui_info.txt, ret.txt)
  await ui_load_txt(lf2, ret.txt, ret.txt_infos)

  const { w: img_w = 0, h: img_h = 0, scale = 1 } = ret.img_infos[0] || ret.txt_infos[0] || {};
  const sw = img_w / scale;
  const sh = img_h / scale;
  const [w, h] = read_nums(ui_info.size, 2, [parent ? sw : lf2.world.screen_w, parent ? sh : lf2.world.screen_h]);
  // 宽或高其一为0时，使用原图宽高比例的计算之
  const dw = floor(w ? w : sh ? (h * sw / sh) : 0);
  const dh = floor(h ? h : sw ? (w * sh / sw) : 0);
  ret.size = [dw, dh];
  const { items } = ui_info;
  if (items && !Array.isArray(items)) {
    Ditto.warn(`[${UINode.TAG}::cook_ui_info] items must be array, but got`, items);
  }
  if (Array.isArray(items) && items.length) {
    ret.items = [];
    for (const item of items)
      ret.items.push(await cook_ui_info(lf2, item, ret));
  } else {
    delete ret.items;
  }
  return ret;
}