import type { IEntityInfo } from "../../defines/IEntityInfo";
import type { IXMLElement, IXML } from "../../ditto/xml";
import { xml_from_drink_info } from "./xml_from_drink_info";
import { xml_from_armor_info } from "./xml_from_armor_info";
import { xml_from_opoint } from "./xml_from_opoint";
import { xml_from_world_dataset } from "./xml_from_world_dataset";

/**
 * 序列化 <base>
 */
export function xml_from_entity_info(xml: IXML, info: IEntityInfo, tag: string = "base"): IXMLElement {
  const el = xml.create(tag);
  el.set_attr("name", info.name);
  el.set_attr("head", info.head);
  el.set_attr("small", info.small);
  el.set_attr("bot_id", info.bot_id);
  el.set_attr("type", info.type);
  el.set_attr("ce", info.ce);
  el.set_attr("weight", info.weight);
  el.set_attr("strength", info.strength);
  el.set_arr_attr_soft("bounce", [info.bounce_x, info.bounce_y, info.bounce_z]);
  el.set_arr_attr_soft("bounce_min", [info.bounce_min_x, info.bounce_min_y, info.bounce_min_z]);
  el.set_arr_attr_soft("fast", [info.fast_vx, info.fast_vy, info.fast_vz]);
  el.set_attr("drop_hurt", info.drop_hurt);
  el.set_attr("resting_max", info.resting_max);
  el.set_arr_attr("group", info.group);
  el.set_arr_attr("hit_sounds", info.hit_sounds);
  el.set_arr_attr("drop_sounds", info.drop_sounds);
  el.set_arr_attr("dead_sounds", info.dead_sounds);
  if (info.files && Object.keys(info.files).length) {
    const filesEl = xml.create("files");
    for (const [name, f] of Object.entries(info.files)) {
      const fileEl = xml.create("file");
      fileEl.set_attr("name", name);
      fileEl.set_attr("path", f.path);
      fileEl.set_attr("row", f.row);
      fileEl.set_attr("col", f.col);
      fileEl.set_attr("cell_w", f.cell_w);
      fileEl.set_attr("cell_h", f.cell_h);
      fileEl.set_arr_attr("variants", (f as any).variants);
      filesEl.insert(fileEl);
    }
    el.insert(filesEl);
  }
  if (info.portraits && Object.keys(info.portraits).length) {
    const ptsEl = xml.create("portraits");
    for (const [name, p] of Object.entries(info.portraits)) {
      const pEl = xml.create("portrait");
      pEl.set_attr("name", name);
      pEl.set_attr("tex", p.tex);
      pEl.set_attr("x", p.x);
      pEl.set_attr("y", p.y);
      pEl.set_attr("w", p.w);
      pEl.set_attr("h", p.h);
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
  if (info.models && Object.keys(info.models).length) {
    const modelsEl = xml.create("models");
    for (const [name, m] of Object.entries(info.models)) {
      const mEl = xml.create("model");
      mEl.set_attr("name", name);
      mEl.set_attr("id", m.id);
      mEl.set_attr("path", m.path);
      mEl.set_arr_attr("variants", m.variants);
      if (m.scale) mEl.set_arr_attr_soft("scale", [m.scale.x, m.scale.y, m.scale.z]);
      if (m.quaternion) mEl.set_arr_attr_soft("quaternion", [m.quaternion.x, m.quaternion.y, m.quaternion.z, m.quaternion.w]);
      modelsEl.insert(mEl);
    }
    el.insert(modelsEl);
  }
  if (info.brokens?.length) {
    for (const broken of info.brokens) {
      el.insert(xml_from_opoint(xml, broken));
    }
  }

  const ds = xml_from_world_dataset(xml, info);
  if (ds) el.insert(ds);

  return el;
}
