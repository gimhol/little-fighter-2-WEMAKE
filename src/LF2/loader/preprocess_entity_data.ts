import { IEntityData } from "../defines";
import { Ditto } from "../ditto";
import { LF2 } from "../LF2";
import { is_non_blank_str } from "../utils";
import { traversal } from "../utils/container_help/traversal";
import { check_frame } from "./check_frame";
import { preprocess_bot_data } from "./preprocess_bot_data";
import { preprocess_frame } from "./preprocess_frame";
import { preprocess_next_frame } from "./preprocess_next_frame";
import { preprocess_pic } from "./preprocess_pic";

export async function preprocess_entity_data(lf2: LF2, data: IEntityData, jobs: Promise<any>[]): Promise<IEntityData> {
  const { images, sounds } = lf2;

  const { small, head } = data.base;
  is_non_blank_str(small) && jobs.push(images.load_img(small, small));
  is_non_blank_str(head) && jobs.push(images.load_img(head, head));
  data.base.dead_sounds?.forEach(i => is_non_blank_str(i) && sounds.load(i, i));
  data.base.drop_sounds?.forEach(i => is_non_blank_str(i) && sounds.load(i, i));
  data.base.hit_sounds?.forEach(i => is_non_blank_str(i) && sounds.load(i, i));

  if (data.on_dead) data.on_dead = preprocess_next_frame(data.on_dead);
  if (data.on_exhaustion) data.on_exhaustion = preprocess_next_frame(data.on_exhaustion);
  const { frames, base: { files, portraits } } = data;

  traversal(files, (_, v) => jobs.push(images.load_by_pic_info(v)));
  if (jobs.length) await Promise.all(jobs);

  traversal(portraits, (k, v, o) => o[k] = preprocess_pic(lf2, data, v));
  traversal(frames, (k, v, o) => o[k] = preprocess_frame(lf2, data, v, jobs));
  traversal(frames, (_, v) => {
    const errors: string[] = []
    check_frame(data, v, errors)
    if (errors.length) Ditto.warn(errors)
  });
  if (data.base.bot)
    data.base.bot = preprocess_bot_data(data.base.bot)
  return data;
}



