import { ISchema } from "../../defines/ISchema";
export function make_schema<T = any>(meta: ISchema<T>, parent?: ISchema) {
  if (!parent && !meta.key) throw new Error('[make_schema] root scheme key not set!')
  meta.path = parent ? [parent.path, meta.key].join('.') : meta.key

  if (meta.properties) {
    for (const key in meta.properties) {
      const prop = meta.properties[key];
      if (typeof prop === 'object') {
        prop.key = key;
        make_schema(prop, meta);
      }
    }
  }
  return meta
}
