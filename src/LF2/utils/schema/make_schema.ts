import type { UIComponent } from "@/LF2/ui/component/UIComponent";
import type { IClazz, ISchema } from "../../defines/ISchema";
import type { UINode } from "@/LF2/ui/UINode";
export interface ISchemaMeta<T = any> extends Omit<ISchema<T>, 'properties'> {
  properties?: Record<keyof T, ISchema | IClazz<UIComponent | UINode>>
}
export function make_schema<T = any>(meta: ISchemaMeta<T>, parent?: ISchema): ISchema<T> {
  if (!parent && !meta.key) throw new Error('[make_schema] root scheme key not set!')

  const { properties } = meta;
  const ret: ISchema = {
    ...meta,
    path: parent ? [parent.path, meta.key].join('.') : meta.key,
    properties: void 0
  }
  ret.path = parent ? [parent.path, meta.key].join('.') : meta.key

  if (properties) {
    ret.properties = {};
    for (const key in properties) {
      const prop = properties[key];
      if (typeof prop === 'function') {
        ret.properties![key] = make_schema({ key, type: prop, nullable: true }, ret);
      } else if (typeof prop === 'object') {
        prop.key = key;
        ret.properties![key] = make_schema(prop, ret);
      }
    }
  }
  return ret
}