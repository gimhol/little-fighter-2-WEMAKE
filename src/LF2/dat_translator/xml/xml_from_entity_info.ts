import type { IEntityInfo } from "../../defines/IEntityInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { xml_from_drink_info } from "./xml_from_drink_info";
import { xml_from_armor_info } from "./xml_from_armor_info";
import { xml_from_opoint } from "./xml_from_opoint";

/**
 * 序列化 <base>
 */
export function xml_from_entity_info(xml: IXMLFactory, info: IEntityInfo, tag: string = "base"): IXMLElement {
  const el = xml.create(tag);

  el.set_str_attr("name", info.name);
  el.set_str_attr("head", info.head);
  el.set_str_attr("small", info.small);
  el.set_str_attr("bot_id", info.bot_id);

  el.set_num_attr("type", info.type);
  el.set_num_attr("ce", info.ce);
  el.set_num_attr("weight", info.weight);
  el.set_num_attr("strength", info.strength);

  el.set_nums_attr_soft("bounce", [info.bounce_x, info.bounce_y, info.bounce_z]);
  el.set_nums_attr_soft("bounce_min", [info.bounce_min_x, info.bounce_min_y, info.bounce_min_z]);
  el.set_nums_attr_soft("fast", [info.fast_vx, info.fast_vy, info.fast_vz]);

  el.set_num_attr("drop_hurt", info.drop_hurt);
  el.set_num_attr("resting_max", info.resting_max);

  el.set_strs_attr("group", info.group);
  el.set_strs_attr("hit_sounds", info.hit_sounds);
  el.set_strs_attr("drop_sounds", info.drop_sounds);
  el.set_strs_attr("dead_sounds", info.dead_sounds);

  if (info.files && Object.keys(info.files).length) {
    const filesEl = xml.create("files");
    for (const [name, f] of Object.entries(info.files)) {
      const fileEl = xml.create("file");
      fileEl.set_str_attr("name", name);
      fileEl.set_str_attr("path", f.path);
      fileEl.set_num_attr("row", f.row);
      fileEl.set_num_attr("col", f.col);
      fileEl.set_num_attr("cell_w", f.cell_w);
      fileEl.set_num_attr("cell_h", f.cell_h);
      fileEl.set_strs_attr("variants", (f as any).variants);
      filesEl.insert(fileEl);
    }
    el.insert(filesEl);
  }

  if (info.portraits && Object.keys(info.portraits).length) {
    const ptsEl = xml.create("portraits");
    for (const [name, p] of Object.entries(info.portraits)) {
      const pEl = xml.create("portrait");
      pEl.set_str_attr("name", name);
      pEl.set_str_attr("tex", p.tex);
      pEl.set_num_attr("x", p.x);
      pEl.set_num_attr("y", p.y);
      pEl.set_num_attr("w", p.w);
      pEl.set_num_attr("h", p.h);
      ptsEl.insert(pEl);
    }
    el.insert(ptsEl);
  }

  if (info.drink) {
    el.insert(xml_from_drink_info(xml, info.drink));
  }

  if (info.armor) {
    el.insert(xml_from_armor_info(xml, info.armor));
  }

  if (info.brokens?.length) {
    for (const broken of info.brokens) {
      el.insert(xml_from_opoint(xml, broken));
    }
  }

  return el;
}
