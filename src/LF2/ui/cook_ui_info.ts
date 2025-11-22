import { Ditto } from "../ditto";
import { LF2 } from "../LF2";
import { floor, is_str, Unsafe } from "../utils";
import { ICookedUIInfo } from "./ICookedUIInfo";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import type { IUIInfo, TComponentInfo, TUIImgInfo, TUITxtInfo } from "./IUIInfo.dat";
import { ICookedUITxtInfo } from "./IUITxtInfo.dat";
import { parse_ui_value, unsafe_is_object } from "./read_info_value";
import { ui_load_img } from "./ui_load_img";
import { ui_load_txt } from "./ui_load_txt";
import { UINode } from "./UINode";
import read_nums from "./utils/read_nums";
import { validate_ui_img_info } from "./validate_ui_img_info";
export function flat_ui_img_info(imgs: TUIImgInfo[], output?: IUIImgInfo[]): IUIImgInfo[] {
  const ret: IUIImgInfo[] = [];
  for (let img of imgs) {
    const errors: string[] = [];
    img = typeof img === 'string' ? { path: img } : img;
    validate_ui_img_info(img, errors);
    if (errors.length) throw new Error(errors.join('\n'));
    const { x = 0, y = 0, w = 0, h = 0, col: cols = 1, row: rows = 1, count = 0 } = img;
    let idx = 0;
    for (let row = 0; row < rows && (count <= 0 || idx < count); ++row) {
      for (let col = 0; col < cols && (count <= 0 || idx < count); ++col) {
        const i = { ...img, x: x + col * w, y: y + row * h }
        ret.push(i);
        output?.push(i)
        ++idx;
      }
    }
  }
  return ret;
};
async function find_ui_template(lf2: LF2, parent: Unsafe<ICookedUIInfo>, template_name: string): Promise<IUIInfo> {
  let raw_template: IUIInfo | undefined = void 0;
  let n: Unsafe<ICookedUIInfo> = parent;
  while (n && !raw_template) {
    raw_template = n.templates?.[template_name];
    n = n.parent;
  }
  if (raw_template) return raw_template;
  try {
    raw_template = await lf2.import_json<IUIInfo>(template_name).then(r => r[0]);
  } catch (e) {
    Ditto.warn(`[${find_ui_template.TAG}] ui template not found! template_name: ${template_name}`)
  }
  return raw_template || {};
}
find_ui_template.TAG = 'find_ui_template'


async function read_ui_template(lf2: LF2, raw_info: IUIInfo, parent: ICookedUIInfo | undefined): Promise<IUIInfo> {
  const { template: template_name, ...remain_raw_info } = raw_info
  if (!template_name) return raw_info;
  const raw_template: Unsafe<IUIInfo> = await find_ui_template(lf2, parent, template_name);
  remain_raw_info.component;

  const component: TComponentInfo[] = []
  if (Array.isArray(raw_template.component))
    component.push(...raw_template.component)
  else if (raw_template.component)
    component.push(raw_template.component)
  if (Array.isArray(remain_raw_info.component))
    component.push(...remain_raw_info.component)
  else if (remain_raw_info.component)
    component.push(remain_raw_info.component)
  return {
    ...raw_template,
    ...remain_raw_info,
    component,
    values: {
      ...raw_template.values,
      ...remain_raw_info.values
    }
  };
}
read_ui_template.TAG = 'read_ui_template'

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
  let raw_info = is_str(data_or_path)
    ? await find_ui_template(lf2, parent, data_or_path)
    : data_or_path;

  if (raw_info.template) raw_info = await read_ui_template(lf2, raw_info, parent);
  const id = raw_info.id || 'no_id_' + Date.now();
  const name = raw_info.name || 'no_name_' + Date.now();
  const ret: ICookedUIInfo = {
    ...raw_info,
    values: raw_info.values ? raw_info.values : {},
    enabled: false,
    id, name,
    pos: read_nums(raw_info.pos, 3, [0, 0, 0]),
    scale: read_nums(raw_info.scale, 3, [1, 1, 1]),
    center: read_nums(raw_info.center, 3, [0, 0, 0]),
    size: [0, 0],
    parent,
    img_infos: [],
    txt_infos: [],
    items: void 0,
    img: [],
    txt: []
  };

  ret.enabled = parse_ui_value(ret, 'boolean', raw_info.enabled) ?? true

  const { img } = raw_info;
  if (img) ret.img_infos.push(...await ui_load_img(lf2, img, ret.img));

  cook_ui_txt_info(lf2, ret, raw_info.txt, ret.txt)
  await ui_load_txt(lf2, ret.txt, ret.txt_infos)

  const { w: img_w = 0, h: img_h = 0, scale = 1 } = ret.img_infos[0] || ret.txt_infos[0] || {};
  const sw = img_w / scale;
  const sh = img_h / scale;
  const [w, h] = read_nums(raw_info.size, 2, [parent ? sw : lf2.world.screen_w, parent ? sh : lf2.world.screen_h]);
  // 宽或高其一为0时，使用原图宽高比例的计算之
  const dw = floor(w ? w : sh ? (h * sw / sh) : 0);
  const dh = floor(h ? h : sw ? (w * sh / sw) : 0);
  ret.size = [dw, dh];
  const { items } = raw_info;
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