import { IStyle } from "../defines";
import type { IUIInfo, TComponentInfo } from "./IUIInfo.dat";
import { IComponentInfo } from "./IComponentInfo";

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

function parse_component(el: Element): TComponentInfo {
  const cls = xml_attr(el, 'cls') || xml_attr(el, 'name') || '';
  const comp: IComponentInfo = { cls };
  const args = xml_attr(el, 'args');
  if (args) comp.args = args.split(',').map(s => s.trim());
  const id = xml_attr(el, 'id');
  if (id) comp.id = id;
  const weight = xml_attr(el, 'weight');
  if (weight) comp.weight = Number(weight);
  const propsStr = xml_attr(el, 'props') || xml_attr(el, 'properties');
  if (propsStr) {
    try { comp.properties = JSON.parse(propsStr); } catch { comp.properties = propsStr as any; }
  }
  return comp;
}

export function xml_to_ui_info(root: Element): IUIInfo {
  const ret: IUIInfo = {};

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
  const items: (IUIInfo | string)[] = [];
  const components: TComponentInfo[] = [];
  const templates: Record<string, IUIInfo> = {};

  for (const child of root.children) {
    const tag = child.tagName;
    switch (tag) {
      case 'item': {
        const ref = xml_attr(child, 'ref');
        if (ref) {
          items.push(ref);
        } else {
          items.push(xml_to_ui_info(child));
        }
        break;
      }
      case 'values': {
        if (!ret.values) ret.values = {};
        Object.assign(ret.values, xml_attrs_to_obj(child));
        break;
      }
      case 'actions': {
        const actions: any = {};
        for (const attr of child.attributes) {
          const v = attr.value;
          actions[attr.name] = v.includes(',') ? v.split(',').map(s => s.trim()) : [v.trim()];
        }
        ret.actions = actions;
        break;
      }
      case 'components': {
        for (const c of child.children) {
          const ctag = c.tagName.toLowerCase();
          if (ctag === 'component') {
            components.push(parse_component(c));
          } else {
            // 简写标签：<Label /> <Reachable args="main"/> 等，标签名即 cls
            const comp: IComponentInfo = { cls: ctag };
            const args = xml_attr(c, 'args');
            if (args) comp.args = args.split(',').map(s => s.trim());
            components.push(comp);
          }
        }
        break;
      }
      case 'component': {
        components.push(parse_component(child));
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
        // 其他元素作为 component 简写，如 <Label /> <Reachable args="main"/>
        const comp: IComponentInfo = { cls: tag };
        const args = xml_attr(child, 'args');
        if (args) comp.args = args.split(',').map(s => s.trim());
        components.push(comp);
        break;
      }
    }
  }

  if (items.length) ret.items = items;
  if (components.length) ret.component = components;
  if (Object.keys(templates).length) ret.templates = templates;

  return ret;
}
