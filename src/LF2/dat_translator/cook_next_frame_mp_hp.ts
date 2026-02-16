import { INextFrame } from "../defines";


export function cook_next_frame_mp_hp(
  ret: INextFrame,
  type?: "next" | "hit",
  frame_mp_hp_map?: Map<string, [number, number]>
) {
  if (!frame_mp_hp_map) return;
  if (typeof ret.id !== "string") return;
  const [mp, hp] = frame_mp_hp_map.get(ret.id) || [0, 0];
  if (type === "hit") {
    ret.mp = mp;
    ret.hp = hp;
  } else if (type === "next") {
    if (mp < 0) ret.mp = -mp;
    if (hp < 0) ret.hp = -hp;
  }
}
