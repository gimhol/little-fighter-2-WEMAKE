import { ISchema } from "../defines";
import { Ditto } from "../ditto";
import { LF2 } from "../LF2";
import { floor, is_str } from "../utils";
import { find_ui_template } from "./find_ui_template";
import { IComponentInfo } from "./IComponentInfo";
import { ICookedUIInfo } from "./ICookedUIInfo";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import type { IUIInfo } from "./IUIInfo.dat";
import { judger, parse_ui_value, unsafe_is_object } from "./read_info_value";
import { read_ui_template } from "./read_ui_template";
import { Schema_IUIImgInfo } from "./Schema_IUIImgInfo";
import { ui_load_img } from "./ui_load_img";
import { UINode } from "./UINode";
import { parse_call_func_expression } from "./utils";
import read_nums from "./utils/read_nums";
import { validate_ui_img_info } from "./utils/validate_ui_img_info";



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
    size: [0, 0, 0],
    parent,
    img_info: void 0,
    txt_info: void 0,
    items: void 0,
    img: void 0,
    component: components
  };
  do {
    let { img } = ui_info;
    if (!img) break;
    if (typeof img == 'string')
      img = parse_ui_value<IUIImgInfo>(ret, judger(validate_ui_img_info), img) ?? void 0
    if (!img) break;
    for (const k in Schema_IUIImgInfo.properties) {
      const meta = (Schema_IUIImgInfo.properties as any)[k] as ISchema;
      const val = (img as any)[k];
      if (!meta || !val || typeof val !== 'string' || !val.startsWith('$val:'))
        continue;
      // FIXME: `meta.type as any`
      (img as any)[k] = parse_ui_value(ret, meta.type as any, val) ?? val
    }
    ret.img = img;
    ret.img_info = await ui_load_img(lf2, img);
  } while (0);

  do {
    const { i18n, style } = ui_info;
    if (!i18n && !style) break;

    ret.i18n = parse_ui_value(ret, 'string', i18n) ?? ''
    ret.style = parse_ui_value(ret, unsafe_is_object, style) ?? {}

    const value = lf2.string(ret.i18n);
    ret.txt_info = await lf2.images.load_text(value, ret.style)
  } while (0)

  const img = ret.img_info || ret.txt_info;
  if (ui_info.size) {
    ret.size = read_nums(ui_info.size, 3, [0, 0, 0])
  } else if (!parent) {
    ret.size = [lf2.world.screen_w, lf2.world.screen_h, 0]
  }

  do {
    if (!img) break;
    const { w: img_w = 0, h: img_h = 0, scale = 1 } = img;
    if (!img_w || !img_h || !scale) {
      debugger;
      break;
    }
    const sw = img_w / scale;
    const sh = img_h / scale;
    const [w, h] = ret.size;
    if (!w && !h) {
      ret.size[0] = sw
      ret.size[1] = sh
    } else if (!w && h) {
      ret.size[0] = floor(h * sw / sh);
    } else if (!h && w) {
      ret.size[1] = floor(w * sh / sw);
    }
  } while (0)




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