import { IDatContext } from "../defines/IDatContext";
import { make_frames_special } from "./make_frames_special";

export function post_process_obj_data(ctx: IDatContext): void {
  if (ctx.data) make_frames_special(ctx.data);
  if (ctx.data && ctx.index.groups)
    ctx.data.base.group = ctx.index.groups;
}
