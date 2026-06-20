import { to_num } from "../type_cast/to_num";
import { match_colon_value } from "./match_colon_value";
import { take_blocks } from "./take_blocks";

export interface ITakeSectionsResult<T = any> {
  sections: T[];
  remains: string
}
export default function take_sections<T = any>(
  text: string,
  start: string,
  end: string,
): ITakeSectionsResult<T> {
  const { blocks, remains } = take_blocks(text, start, end)
  const ret: ITakeSectionsResult<T> = {
    sections: blocks.map<T>((content_str) => {
      const item: any = {};
      for (const [name, value] of match_colon_value(content_str)) {
        item[name] = to_num(value) ?? value;
      }
      return item;
    }),
    remains
  }
  return ret;
}
