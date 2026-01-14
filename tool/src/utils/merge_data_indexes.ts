import type { IDataLists } from "../../../src/LF2/defines";

export async function merge_data_indexes(indexes: IDataLists, ...extras: Partial<IDataLists>[]): Promise<IDataLists> {
  const ret: IDataLists = JSON.parse(JSON.stringify(indexes));
  if (!extras.length) return ret;
  for (const extra of extras) {
    const { objects, backgrounds } = extra;
    if (objects?.length) {
      for (const o of objects) {
        if (ret.objects.find(v => v.id === o.id))
          throw new Error(`[merge_data_indexes] object id duplicate! id: ${o.id}`);
        ret.objects.push(o);
      }
    }
    if (backgrounds?.length) {
      for (const o of backgrounds) {
        if (ret.backgrounds.find(v => v.id === o.id))
          throw new Error(`[merge_data_indexes] background id duplicate! id: ${o.id}`);
        ret.backgrounds.push(o);
      }
    }
  }
  return ret;
}
