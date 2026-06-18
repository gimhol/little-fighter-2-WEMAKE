import type { INextFrame } from "../../defines/INextFrame";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { writeXmlAttrs } from "./xml_from_write";

/**
 * 将 INextFrame 的属性写入元素中
 *
 * 只写入标量字段，跳过运行时对象（judger 等）
 * expression 作为子元素处理
 */
function writeNextAttrs(el: IXMLElement, nf: INextFrame): void {
  const scalarKeys: (keyof INextFrame)[] = [
    "id", "wait", "facing",
    "mp", "mp_mode", "hp", "blink_time",
    "dvx", "dvy", "dvz",
    "acc_x", "acc_y", "acc_z",
    "vxm", "vym", "vzm",
    "ctrl_x", "ctrl_y", "ctrl_z",
  ];
  for (const k of scalarKeys) {
    const v = (nf as any)[k];
    if (v === undefined || v === null || v === "") continue;
    if (typeof v === "number") {
      el.set_num_attr(k, v);
    } else if (typeof v === "boolean") {
      el.set_bool_attr(k, v);
    } else if (Array.isArray(v)) {
      if (v.length) el.set_strs_attr(k, v.map(String));
    } else if (typeof v === "string") {
      el.set_str_attr(k, v);
    }
  }

  // sounds
  if (nf.sounds?.length) {
    el.set_strs_attr("sounds", nf.sounds);
  }
}

/**
 * 序列化 <next> 元素（来自 INextFrame）
 *
 * tagName 可指定标签名，默认 "next"
 */
export function xml_from_next_frame(
  xml: IXMLFactory,
  nf: INextFrame,
  tagName: string = "next",
): IXMLElement {
  const el = xml.create(tagName);
  writeNextAttrs(el, nf);

  // expression → <expression>text</expression>
  if (nf.expression) {
    const expr = xml.create("expression");
    expr.set_text(nf.expression);
    el.insert(expr);
  }

  return el;
}
