import type { INextFrame, TNextFrame } from "../../defines";
import type { IXMLElement } from "../../ditto";
import { apply_velocity_shorthand } from "./xml_to_frame_info";

/**
 * 解析 `<next>` / `<on_dead>` 等跳转目标
 */

export function xml_to_next_frame(el: IXMLElement): INextFrame {
  const nf: TNextFrame = { id: el.str_attr("id") ?? "" };
  const wait = el.num_attr("wait");
  if (wait !== void 0) nf.wait = wait;
  const facing = el.num_attr("facing");
  if (facing !== void 0) nf.facing = facing;
  const mp = el.num_attr("mp");
  if (mp !== void 0) nf.mp = mp;
  const hp = el.num_attr("hp");
  if (hp !== void 0) nf.hp = hp;
  const expression = el.str_attr("expression") ?? el.first_by_tag("expression")?.text;
  if (expression) nf.expression = expression;
  const blink = el.num_attr("blink_time");
  if (blink !== void 0) nf.blink_time = blink;
  apply_velocity_shorthand(el, nf as any);
  return nf;
}
