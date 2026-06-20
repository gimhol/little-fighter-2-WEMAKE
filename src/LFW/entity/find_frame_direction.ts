/* eslint-disable eqeqeq */
import type { IFrameInfo, TFrameIdListPair, TFrameIdPair } from "../defines";

export default function find_direction(
  f: IFrameInfo,
  pair: TFrameIdListPair | TFrameIdPair | undefined,
): 1 | -1 | 0 {
  if (!pair) return 0;
  const { "-1": a, "1": b } = pair;
  if (a == f.id || (Array.isArray(a) && a.findIndex((v) => v == f.id) >= 0))
    return -1;
  if (b == f.id || (Array.isArray(b) && b.findIndex((v) => v == f.id) >= 0))
    return 1;
  return 0;
}
