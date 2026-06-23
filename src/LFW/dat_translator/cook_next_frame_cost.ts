import type { INextFrame } from "../defines";

export function cook_next_frame_cost(
  ret: INextFrame,
  type?: "next" | "hit",
  costs?: Map<string, { mp: number, hp: number }>
) {
  if (!costs) return ret;
  const id = typeof ret.id === 'string' ? ret.id : ret.id ? ret.id[0] : void 0;
  if (!id) return ret;
  const { mp = 0, hp = 0 } = costs.get(id) || {};
  if (type === "hit") {
    ret.mp = mp;
    ret.hp = hp;
  } else if (type === "next") {
    if (mp < 0) ret.mp = -mp;
    if (hp < 0) ret.hp = -hp;
  }
  if (!ret.mp) delete ret.mp;
  if (!ret.hp) delete ret.hp
  return ret;
}
