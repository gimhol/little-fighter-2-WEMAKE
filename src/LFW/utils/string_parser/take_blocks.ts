import { match_all } from "./match_all";
export interface ITakeBlocksResult {
  blocks: string[];
  remains: string
}
export function take_blocks(
  text: string,
  start: string,
  end: string
): ITakeBlocksResult {
  const regexp = new RegExp(`${start.trim()}((.|\\n)+?)${end.trim()}`, "g");
  const positions: [number, number][] = [];
  const ret: ITakeBlocksResult = {
    blocks: match_all(text, regexp).map(v => {
      positions.push([v.index, v.index + v[0].length]);
      return v[1];
    }),
    remains: ""
  }
  if (positions.length) {
    let start = 0;
    for (const [from, to] of positions) {
      ret.remains += text.substring(start, from);
      start = to;
    }
    ret.remains += text.substring(start);
  } else {
    ret.remains = text;
  }
  return ret;
}
