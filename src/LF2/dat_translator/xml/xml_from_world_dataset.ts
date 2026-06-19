import type { IWorldDataset } from "../../IWorldDataset";
import { world_dataset_fields } from "../../IWorldDataset";
import type { IXMLElement, IXML } from "../../ditto/xml";

/**
 * 将 IWorldDataset 字段写入 <dataset> 元素
 */
export function xml_from_world_dataset(xml: IXML, data: Partial<IWorldDataset>, tag: string = "dataset"): IXMLElement | null {
  const ds_items: [string, unknown][] = [];
  for (const k of world_dataset_fields.keys()) {
    const v = data[k];
    if (v !== void 0) ds_items.push([k, v]);
  }
  if (!ds_items.length) return null;
  return xml.from_object(Object.fromEntries(ds_items), tag);
}
