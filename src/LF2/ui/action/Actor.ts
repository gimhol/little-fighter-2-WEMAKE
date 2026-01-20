import { LF2 } from "@/LF2/LF2";
import { Ditto } from "../../ditto";
import { is_str } from "../../utils/type_check";
import type { TUIAction } from "../IUIInfo.dat";
import { UIActionEnum } from "../UIActionEnum";
import type { UINode } from "../UINode";
import { parse_call_func_expression } from "../utils/parse_call_func_expression";

interface IUIActionHandler {
  (layout: UINode, ...args: string[]): void;
}
class UIActor {
  static readonly TAG: string = "Actor";
  private _handler_map = new Map<string, IUIActionHandler>([
    [UIActionEnum.SetUI, ({ lf2 }, layout_id, index) => lf2.set_ui(layout_id, Number(index) || 0)],
    [UIActionEnum.PushUI, ({ lf2 }, layout_id, index) => lf2.push_ui(layout_id, Number(index) || 0)],
    [UIActionEnum.PopUI, ({ lf2 }) => lf2.pop_ui_safe()],
    [UIActionEnum.LoopImg, (l, d) => l.next_img(d === '1')],
    [UIActionEnum.LoopTxt, (l, d) => l.next_txt(d === '1')],
    [UIActionEnum.LoadData, ({ lf2 }, url) => lf2.load(...(url ? [url] : LF2.DATA_ZIPS))
      .catch((e) => Ditto.warn(`[${UIActor.TAG}::load_data] ${url} not exists, err: ${e}`))],
    [UIActionEnum.Broadcast, ({ lf2 }, msg) => lf2.broadcast(msg)],
    [UIActionEnum.Sound, ({ lf2 }, name) => lf2.sounds.play_preset(name)],
    [UIActionEnum.SwitchDifficulty, ({ lf2 }) => lf2.switch_difficulty()],
    [UIActionEnum.DestoryStage, ({ lf2 }) => lf2.remove_stage()],
    [UIActionEnum.RemoveAllEntities, ({ lf2 }) => lf2.entities.del_all()]
  ]);

  add(key: UIActionEnum, handler: IUIActionHandler): this {
    this._handler_map.set(key, handler);
    return this;
  }

  act(layout: UINode, actions: TUIAction | TUIAction[]): void {
    if (!Array.isArray(actions)) actions = [actions]
    if (!actions.length) {
      Ditto.warn(`[${UIActor.TAG}::act] failed to act, actions empty`);
      return
    }
    for (const raw of actions) {
      const action = is_str(raw) ? parse_call_func_expression(raw) : raw;
      if (!action) {
        Ditto.warn(`[${UIActor.TAG}::act] failed to act, expression incorrect, expression: ${raw}`)
        continue;
      }
      const { name, args = [] } = action;
      const handler = this._handler_map.get(name as UIActionEnum | string);
      if (!handler) {
        Ditto.warn(`[${UIActor.TAG}::act] failed to act, handler not found by name, expression: ${raw}`)
        continue;
      }
      handler(layout, ...args);
    }
  }
}
const actor = new UIActor();
export default actor;
