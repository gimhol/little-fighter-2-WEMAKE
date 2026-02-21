import { INextFrame } from "../defines";
import { random_get } from "../utils";


export function cook_next_frame_cost(
  ret: INextFrame,
  type?: "next" | "hit",
  costs?: Map<string, { mp: number, hp: number }>
) {
  if (!costs) return ret;
  const id = typeof ret.id === 'string' ? ret.id : random_get(ret.id)
  if (!id) return ret;
  const { mp = 0, hp = 0 } = costs.get(id) || {};
  if (type === "hit") {
    ret.mp = mp;
    ret.hp = hp;
  } else if (type === "next") {
    if (mp < 0) ret.mp = -mp;
    if (hp < 0) ret.hp = -hp;
  }
  return ret;
}
