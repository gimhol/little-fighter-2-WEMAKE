import type { ISchema, ISchemaMeta } from "../../defines/ISchema";

export function make_schema<T = any>(meta: ISchemaMeta<T>, parent?: ISchema): ISchema<T> {
  if (!parent && !meta.key) throw new Error('[make_schema] root scheme key not set!')

  const {
    properties,
    items,
    key,
    type = 'object',
    ...remains
  } = meta;

  const ret: ISchema = {
    key,
    type,
    ...remains,
    path: parent ? [parent.path, key].join('.') : key,
    properties: void 0,
  }
  if (items) {
    if (typeof items === 'function') {
      ret.items = make_schema({ key, type: items, nullable: true }, ret);
    } else if (typeof items === 'object') {
      ret.items = make_schema({ key, ...items }, ret);
    }
  }
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