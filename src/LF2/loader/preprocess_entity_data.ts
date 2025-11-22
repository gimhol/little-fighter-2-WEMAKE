import { Expression } from "../base/Expression";
import { Defines, IEntityData } from "../defines";
import { Ditto } from "../ditto";
import { LF2 } from "../LF2";
import { is_non_blank_str } from "../utils";
import { traversal } from "../utils/container_help/traversal";
import { check_frame } from "./check_frame";
import { get_val_from_bot_ctrl } from "./get_val_from_bot_ctrl";
import { preprocess_frame } from "./preprocess_frame";
import { preprocess_next_frame } from "./preprocess_next_frame";

export async function preprocess_entity_data(lf2: LF2, data: IEntityData, jobs: Promise<any>[]): Promise<IEntityData> {
  const { images, sounds } = lf2;

  const { small, head } = data.base;
  data.base.fall_value = data.base.fall_value ?? Defines.DEFAULT_FALL_VALUE_MAX;
  data.base.defend_value = data.base.defend_value ?? Defines.DEFAULT_DEFEND_VALUE_MAX;
  data.base.hp = data.base.hp ?? Defines.DEFAULT_HP;
  data.base.mp = data.base.mp ?? Defines.DEFAULT_MP;

  is_non_blank_str(small) && jobs.push(images.load_img(small, small));
  is_non_blank_str(head) && jobs.push(images.load_img(head, head));
  data.base.dead_sounds?.forEach(i => is_non_blank_str(i) && sounds.load(i, i));
  data.base.drop_sounds?.forEach(i => is_non_blank_str(i) && sounds.load(i, i));
  data.base.hit_sounds?.forEach(i => is_non_blank_str(i) && sounds.load(i, i));

  if (data.on_dead) data.on_dead = preprocess_next_frame(data.on_dead);
  if (data.on_exhaustion) data.on_exhaustion = preprocess_next_frame(data.on_exhaustion);
  const { frames, base: { files } } = data;

  traversal(files, (_, v) => jobs.push(images.load_by_pic_info(v)));
  if (jobs.length) await Promise.all(jobs);

  traversal(frames, (k, v, o) => o[k] = preprocess_frame(lf2, data, v, jobs));
  traversal(frames, (_, v) => {
    const errors: string[] = []
    check_frame(data, v, errors)
    if (errors.length) Ditto.warn(errors)
  });
  traversal(data.base.bot?.actions, (_, a) => {
    if (!a) return;
    if (a.expression) a.judger = new Expression(a.expression, get_val_from_bot_ctrl)
  })
  traversal(data.base.bot?.frames, (k, v, o) => {
    if (!v) return;
    const ks = k.split(',')
    if (ks.length <= 1) return;
    delete o[k];
    for (const k of ks)
      o[k] = [...v];
  })
  traversal(data.base.bot?.states, (k, v, o) => {
    if (!v) return;
    const ks = ("" + k).split(',')
    if (ks.length <= 1) return;
    delete o[k];
    for (const k of ks)
      o[k as any] = [...v];
  })
  return data;
}


