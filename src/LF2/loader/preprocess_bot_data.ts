import { Expression } from "../base";
import { IBotData } from "../defines";
import { traversal } from "../utils";
import { get_val_from_bot_ctrl } from "./get_val_from_bot_ctrl";


export function preprocess_bot_data(data: IBotData): IBotData {
  traversal(data.actions, (_, a) => {
    if (!a) return;
    if (a.expression) a.judger = new Expression(a.expression, get_val_from_bot_ctrl);
  });
  traversal(data.frames, (k, v, o) => {
    if (!v) return;
    const ks = k.split(',');
    if (ks.length <= 1) return;
    delete o[k];
    for (const k of ks)
      o[k] = [...v];
  });
  traversal(data.states, (k, v, o) => {
    if (!v) return;
    const ks = ("" + k).split(',');
    if (ks.length <= 1) return;
    delete o[k];
    for (const k of ks)
      o[k as any] = [...v];
  });
  return data;
}
