import { IStyle } from "../defines";
import { Ditto } from "../ditto";
import { LF2 } from "../LF2";
import { floor, is_num_arr, is_str, Unsafe } from "../utils";
import { IComponentInfo } from "./IComponentInfo";
import { ICookedUIInfo } from "./ICookedUIInfo";
import { INinePatch, IUIImgInfo } from "./IUIImgInfo.dat";
import type { IUIInfo, TComponentInfo } from "./IUIInfo.dat";
import { is_0_or_1, judger, parse_ui_value, unsafe_is_object } from "./read_info_value";
import { ui_load_img } from "./ui_load_img";
import { parse_call_func_expression } from "./utils";
import read_nums from "./utils/read_nums";
import { validate_ui_img_info } from "./utils/validate_ui_img_info";

let __new_id = 0;
const new_id = () => ++__new_id;

// ========== XML → IUIInfo 转换 ==========

function parse_nums_attr(v: string | null | undefined): number[] | undefined {
  if (v == null) return void 0;
  return v.split(',').map(s => Number(s.trim()));
}

function xml_attr(node: Element, name: string): string | undefined {
  return node.getAttribute(name) ?? undefined;
}

function xml_attrs_to_obj(node: Element): Record<string, any> {
  const obj: Record<string, any> = {};
  for (const attr of node.attributes) {
    obj[attr.name] = attr.value;
  }
  return obj;
}

export function xml_to_ui_info(root: Element): IUIInfo {
  const ret: IUIInfo = {};
  const nodeName = root.tagName.toLowerCase();

  // id / name / i18n
  ret.id = xml_attr(root, 'id');
  ret.name = xml_attr(root, 'name');
  ret.i18n = xml_attr(root, 'i18n');
  ret.color = xml_attr(root, 'color');
  ret.background = xml_attr(root, 'background');
  ret.foreground = xml_attr(root, 'foreground');
  ret.outlineColor = xml_attr(root, 'outlineColor');
  ret.template = xml_attr(root, 'template');
  ret.auto_focus = xml_attr(root, 'auto_focus') === 'true' ? true : void 0;

  // number arrays (comma-separated)
  ret.pos = parse_nums_attr(xml_attr(root, 'pos'));
  ret.size = parse_nums_attr(xml_attr(root, 'size'));
  ret.center = parse_nums_attr(xml_attr(root, 'center'));
  ret.scale = parse_nums_attr(xml_attr(root, 'scale'));

  // number properties
  const opacity = xml_attr(root, 'opacity');
  if (opacity != null) ret.opacity = Number(opacity);
  const count = xml_attr(root, 'count');
  if (count != null) ret.count = Number(count);
  const visible = xml_attr(root, 'visible');
  if (visible != null) ret.visible = visible === 'true';
  const disabled = xml_attr(root, 'disabled');
  if (disabled != null) ret.disabled = disabled === 'true';
  const bgAlpha = xml_attr(root, 'backgroundAlpha');
  if (bgAlpha != null) ret.backgroundAlpha = Number(bgAlpha);
  const fgAlpha = xml_attr(root, 'foregroundAlpha');
  if (fgAlpha != null) ret.foregroundAlpha = Number(fgAlpha);
  const olWidth = xml_attr(root, 'outlineWidth');
  if (olWidth != null) ret.outlineWidth = Number(olWidth);
  const olAlpha = xml_attr(root, 'outlineAlpha');
  if (olAlpha != null) ret.outlineAlpha = Number(olAlpha);

  // children
  const items: IUIInfo[] = [];
  const components: TComponentInfo[] = [];
  const templates: Record<string, IUIInfo> = {};

  for (const child of root.children) {
    const tag = child.tagName.toLowerCase();
    switch (tag) {
      case 'item':
        items.push(xml_to_ui_info(child));
        break;
      case 'component': {
        const comp: IComponentInfo = { cls: xml_attr(child, 'cls') || xml_attr(child, 'name') || '' };
        const args = xml_attr(child, 'args');
        if (args) comp.args = args.split(',').map(s => s.trim());
        const id = xml_attr(child, 'id');
        if (id) comp.id = id;
        const weight = xml_attr(child, 'weight');
        if (weight) comp.weight = Number(weight);
        const propsStr = xml_attr(child, 'props') || xml_attr(child, 'properties');
        if (propsStr) {
          try { comp.properties = JSON.parse(propsStr); } catch { comp.properties = propsStr as any; }
        }
        // 简写：<Label /> 直接作为 component cls
        if (tag !== 'component') {
          components.push(tag);
        } else {
          components.push(comp);
        }
        break;
      }
      case 'style': {
        ret.style = xml_attrs_to_obj(child) as IStyle;
        // 数值属性转换
        const s = ret.style as any;
        if (xml_attr(child, 'line_width') != null) s.line_width = Number(xml_attr(child, 'line_width'));
        if (xml_attr(child, 'scale') != null) s.scale = Number(xml_attr(child, 'scale'));
        if (xml_attr(child, 'padding_l') != null) s.padding_l = Number(xml_attr(child, 'padding_l'));
        if (xml_attr(child, 'padding_r') != null) s.padding_r = Number(xml_attr(child, 'padding_r'));
        if (xml_attr(child, 'padding_t') != null) s.padding_t = Number(xml_attr(child, 'padding_t'));
        if (xml_attr(child, 'padding_b') != null) s.padding_b = Number(xml_attr(child, 'padding_b'));
        if (xml_attr(child, 'shadow_blur') != null) s.shadow_blur = Number(xml_attr(child, 'shadow_blur'));
        if (xml_attr(child, 'shadow_offset_x') != null) s.shadow_offset_x = Number(xml_attr(child, 'shadow_offset_x'));
        if (xml_attr(child, 'shadow_offset_y') != null) s.shadow_offset_y = Number(xml_attr(child, 'shadow_offset_y'));
        if (xml_attr(child, 'underline_width') != null) s.underline_width = Number(xml_attr(child, 'underline_width'));
        if (xml_attr(child, 'smoothing') != null) s.smoothing = xml_attr(child, 'smoothing') === 'true';
        if (xml_attr(child, 'disposable') != null) s.disposable = xml_attr(child, 'disposable') === 'true';
        break;
      }
      case 'img': {
        const img: any = {};
        img.path = xml_attr(child, 'path') || xml_attr(child, 'src');
        img.x = Number(xml_attr(child, 'x'));
        img.y = Number(xml_attr(child, 'y'));
        img.w = Number(xml_attr(child, 'w'));
        img.h = Number(xml_attr(child, 'h'));
        img.dw = Number(xml_attr(child, 'dw')) || img.w;
        img.dh = Number(xml_attr(child, 'dh')) || img.h;
        if (xml_attr(child, 'flip_x') != null) img.flip_x = Number(xml_attr(child, 'flip_x'));
        if (xml_attr(child, 'flip_y') != null) img.flip_y = Number(xml_attr(child, 'flip_y'));
        if (xml_attr(child, 'wrapS') != null) img.wrapS = Number(xml_attr(child, 'wrapS'));
        if (xml_attr(child, 'wrapT') != null) img.wrapT = Number(xml_attr(child, 'wrapT'));
        if (xml_attr(child, 'offsetX') != null) img.offsetX = Number(xml_attr(child, 'offsetX'));
        if (xml_attr(child, 'offsetY') != null) img.offsetY = Number(xml_attr(child, 'offsetY'));
        if (xml_attr(child, 'offsetAnimX') != null) img.offsetAnimX = Number(xml_attr(child, 'offsetAnimX'));
        if (xml_attr(child, 'offsetAnimY') != null) img.offsetAnimY = Number(xml_attr(child, 'offsetAnimY'));
        if (xml_attr(child, 'offsetAnimR') != null) img.offsetAnimR = Number(xml_attr(child, 'offsetAnimR'));
        if (xml_attr(child, 'repeatX') != null) img.repeatX = Number(xml_attr(child, 'repeatX'));
        if (xml_attr(child, 'repeatY') != null) img.repeatY = Number(xml_attr(child, 'repeatY'));
        ret.img = img;
        break;
      }
      case 'template': {
        const tid = xml_attr(child, 'id') || xml_attr(child, 'name') || '';
        templates[tid] = xml_to_ui_info(child);
        break;
      }
      default: {
        // 其他元素作为 component 简写，如 <Label /> <FighterName />
        const compName = tag;
        if (compName && compName !== 'style' && compName !== 'img') {
          components.push(compName);
        }
        break;
      }
    }
  }

  if (items.length) ret.items = items;
  if (components.length) ret.component = components;
  if (Object.keys(templates).length) ret.templates = templates;

  return ret;
}

// ========== UI Template 查找 ==========

export async function merge_ui_template(lf2: LF2, raw_info: IUIInfo, parent: ICookedUIInfo | undefined): Promise<IUIInfo> {
  const { template: template_name, ...remain_info } = raw_info;
  if (!template_name) return raw_info;
  const template_info: Unsafe<IUIInfo> = await find_ui_template(lf2, parent, template_name);
  const component: TComponentInfo[] = [];
  template_info.component?.forEach(c => {
    component.push(c)
  })
  remain_info.component?.forEach(c => {
    component.push(c)
  })
  if (lf2.dev === true) {
    template_info.dev_component?.forEach(c => {
      component.push(c)
    })
    remain_info.dev_component?.forEach(c => {
      component.push(c)
    })
  }
  return {
    ...template_info,
    ...remain_info,
    template: template_name,
    component,
    values: {
      ...template_info.values,
      ...remain_info.values
    },
    template_values: {
      ...template_info.template_values,
      ...remain_info.template_values
    }
  };
}
merge_ui_template.TAG = 'read_ui_template';

export async function find_ui_template(
  lf2: LF2,
  parent: Unsafe<ICookedUIInfo>,
  template_name: string
): Promise<IUIInfo> {
  const { TAG } = find_ui_template;
  let ret: Unsafe<IUIInfo>;
  let ptr: Unsafe<ICookedUIInfo> = parent;
  while (ptr && !ret) {
    ret = ptr.templates?.[template_name];
    ptr = ptr.parent;
  }
  if (ret) return ret;

  let path = template_name.startsWith('@/') ? template_name.replace('@/', 'builtin_data/launch/') : template_name;

  // 尝试 .ui.json5
  try {
    const json5_path = path.endsWith('.ui.json5') || path.endsWith('.ui.xml') ? path : path + '.ui.json5';
    ret = await lf2.import_json<IUIInfo>(json5_path, true).then(r => r[0]);
    if (ret && Object.keys(ret).length) return ret;
  } catch { /* fall through to xml */ }

  // 尝试 .ui.xml
  try {
    const xml_path = path.endsWith('.ui.xml') ? path : path + '.ui.xml';
    const [blob_url] = await lf2.import_resource(xml_path, true);
    const text = await fetch(blob_url).then(r => r.text());
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const root = doc.documentElement;
    if (root) {
      ret = xml_to_ui_info(root);
      if (ret && Object.keys(ret).length) return ret;
    }
  } catch (e) {
    Ditto.warn(`[${TAG}] ui template not found! template_name: ${template_name}, e:${e}`);
  }

  return ret || {};
}
find_ui_template.TAG = 'find_ui_template';

export async function cook_ui_info(
  lf2: LF2,
  info: IUIInfo | string,
  parent?: ICookedUIInfo
): Promise<ICookedUIInfo> {
  let raw: IUIInfo;
  if (is_str(info)) {
    raw = await find_ui_template(lf2, parent, info)
  } else {
    raw = info
  }
  if (raw.template) {
    raw = await merge_ui_template(lf2, raw, parent);
  }

  const id = raw.id || `no_id_${new_id()}`;
  const name = raw.name || id;
  const components = raw.component?.map(t => {
    if (typeof t !== 'string') {
      if (!t.cls) debugger; // my bad -Gim
      if (!t.cls && t.name) t.cls = t.name;
      t.id ||= `${t.cls}_${new_id()}`
      t.name ||= `${t.cls}_no_name`
      return t;
    }
    const result = parse_call_func_expression(t);
    const ret: IComponentInfo = result ? {
      ...result,
      cls: result.name,
      id: result.id || `no_id_${new_id()}`
    } : {
      id: `no_id_${new_id()}`,
      name: t,
      cls: t,
    }
    return ret;
  }).sort((a, b) => (b.weight || 0) - (a.weight || 0)) ?? [];

  const ret: ICookedUIInfo = {
    ...raw,
    values: raw.values ? raw.values : {},
    id, name, parent,
    pos: [0, 0, 0],
    scale: [0, 0, 0],
    center: [0, 0, 0],
    size: [0, 0, 0],
    img_info: void 0,
    txt_info: void 0,
    items: void 0,
    img: void 0,
    component: components,
    style: void 0,
    count: void 0,
    visible: void 0,
    disabled: void 0,
    backgroundAlpha: void 0,
    foregroundAlpha: void 0,
    outlineWidth: void 0,
    outlineAlpha: void 0,
    opacity: void 0,
  };
  const parse_str = (v: string | undefined) => parse_ui_value(ret, String, v) ?? void 0
  const parse_boolean = (v: string | boolean | undefined) => parse_ui_value(ret, Boolean, v) ?? void 0
  const parse_num = (v: string | number | undefined) => parse_ui_value(ret, Number, v) ?? void 0
  const parse_nums = (v: string | number[] | undefined): string | number[] | undefined => {
    if (is_num_arr(v)) return v;
    return parse_ui_value(ret, null, v)
  }
  ret.pos             /**/ = read_nums(parse_nums(raw.pos), 3)
  ret.scale           /**/ = read_nums(parse_nums(raw.scale), 3, 1)
  ret.center          /**/ = read_nums(parse_nums(raw.center), 3)
  ret.visible         /**/ = parse_boolean(raw.visible);
  ret.disabled        /**/ = parse_boolean(raw.disabled);
  ret.count           /**/ = parse_num(raw.count);
  ret.opacity         /**/ = parse_num(raw.opacity);
  ret.color           /**/ = parse_str(raw.color) ?? void 0;
  ret.background      /**/ = parse_str(raw.background) ?? void 0;
  ret.backgroundAlpha /**/ = parse_num(raw.backgroundAlpha);
  ret.foreground      /**/ = parse_str(raw.foreground) ?? void 0;
  ret.foregroundAlpha /**/ = parse_num(raw.foregroundAlpha);
  ret.outlineColor    /**/ = parse_str(raw.outlineColor) ?? void 0;
  ret.outlineWidth    /**/ = parse_num(raw.outlineWidth);
  ret.outlineAlpha    /**/ = parse_num(raw.outlineAlpha);
  ret.i18n            /**/ = parse_str(raw.i18n) ?? void 0;
  ret.style           /**/ = parse_ui_value(ret, unsafe_is_object<IStyle>(), raw.style) ?? void 0
  if (raw.img && typeof raw.img === 'string') {
    ret.img = parse_ui_value<IUIImgInfo>(ret, judger(validate_ui_img_info), raw.img) ?? void 0
  }
  if (raw.img && typeof raw.img === 'object') {
    const w = parse_num(raw.img.w);
    const h = parse_num(raw.img.h);
    const img: IUIImgInfo = {
      path        /**/: parse_str(raw.img.path) ?? '',
      x           /**/: parse_num(raw.img.x),
      y           /**/: parse_num(raw.img.y),
      w, h,
      dw          /**/: parse_num(raw.img.dw) ?? w,
      dh          /**/: parse_num(raw.img.dh) ?? h,
      wrapS       /**/: parse_num(raw.img.wrapS),
      wrapT       /**/: parse_num(raw.img.wrapT),
      offsetX     /**/: parse_num(raw.img.offsetX),
      offsetY     /**/: parse_num(raw.img.offsetY),
      offsetAnimX /**/: parse_num(raw.img.offsetAnimX),
      offsetAnimY /**/: parse_num(raw.img.offsetAnimY),
      offsetAnimR /**/: parse_num(raw.img.offsetAnimR),
      repeatX     /**/: parse_num(raw.img.repeatX),
      repeatY     /**/: parse_num(raw.img.repeatY),
      flip_x      /**/: parse_ui_value(ret, is_0_or_1, raw.img.flip_x) ?? void 0,
      flip_y      /**/: parse_ui_value(ret, is_0_or_1, raw.img.flip_y) ?? void 0,
    }
    const { nine_patch: np } = raw.img;
    if (np) {
      if (typeof np === 'string') {
        img.nine_patch = parse_ui_value(ret, unsafe_is_object<INinePatch>(), np) ?? void 0
      } else {
        img.nine_patch = {
          f_l: parse_num(np.f_l),
          f_t: parse_num(np.f_t),
          f_r: parse_num(np.f_r),
          f_b: parse_num(np.f_b),
          f_w: parse_num(np.f_w),
          f_h: parse_num(np.f_h),
          l_w: parse_num(np.l_w),
          t_h: parse_num(np.t_h),
          r_w: parse_num(np.r_w),
          b_h: parse_num(np.b_h),
        }
      }
    }
    ret.img = img
  }
  if (ret.img) ret.img_info = await ui_load_img(lf2, ret.img);
  if (ret.i18n) ret.txt_info = await lf2.images.load_text(lf2.string(ret.i18n), ret.style)

  const img = ret.img_info || ret.txt_info;
  if (raw.size) {
    ret.size = read_nums(parse_nums(raw.size), 3)
  } else if (ret.img) {
    const w = ret.img.dw ?? ret.img.w ?? 0;
    const h = ret.img.dh ?? ret.img.h ?? 0;
    ret.size = [w, h, 0]
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

  const { items: raw_items } = raw;
  if (raw_items && !Array.isArray(raw_items)) {
    Ditto.warn(`[cook_ui_info] items must be array, but got`, raw_items);
  }
  if (raw_items?.length) {
    ret.items = [];
    for (const raw_item of raw_items) {
      const item = await cook_ui_info(lf2, raw_item, ret);
      let { count = 1 } = item;
      while (count) {
        ret.items.push(item);
        count = floor(count - 1)
      };
    }
  }
  if (!ret.items?.length)
    delete ret.items;
  return ret;
}
merge_ui_template.TAG = 'cook_ui_info';