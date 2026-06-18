import type { IFramePictureInfo } from "../../defines";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * 解析 `<pic>` 帧切图，支持 rect="x,y,w,h" 快捷属性
 */
export function xml_to_pic(el: IXMLElement): IFramePictureInfo {
  const rect = el.nums_attr("rect");
  return {
    tex: el.str_attr("tex") ?? "0",
    x: el.num_attr("x") ?? rect?.[0] ?? 0,
    y: el.num_attr("y") ?? rect?.[1] ?? 0,
    w: el.num_attr("w") ?? rect?.[2] ?? 0,
    h: el.num_attr("h") ?? rect?.[3] ?? 0,
  };
}
