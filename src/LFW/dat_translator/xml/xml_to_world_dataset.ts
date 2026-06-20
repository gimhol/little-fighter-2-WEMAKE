import type { IWorldDataset } from "../../IWorldDataset";
import { world_dataset_fields } from "../../IWorldDataset";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * 解析 <dataset> → Partial<IWorldDataset>
 *
 * 根据 {@link world_dataset_fields} 的字段类型逐个读取并校验值类型。
 */
export function xml_to_world_dataset(el: IXMLElement | undefined): Partial<IWorldDataset> {
  if (!el) return {};
  const ret: Record<string, unknown> = {};
  for (const child of el.children) {
    const key = child.attr('name');
    if (!key) continue;
    const field = world_dataset_fields.get(key as keyof IWorldDataset);
    if (!field) continue;
    const fieldType = field.type;
    if (fieldType === 'int' || fieldType === 'float') {
      ret[key] = child.as_number();
    } else if (fieldType === 'string') {
      ret[key] = child.as_string();
    } else if (fieldType === 'boolean'){
      ret[key] = child.as_value();
    }
  }
  return ret as Partial<IWorldDataset>;
}
