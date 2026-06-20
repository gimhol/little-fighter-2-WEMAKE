import { LFW } from "../../../LFW";
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
    [UIActionEnum.SetUI, ({ lfw }, layout_id, index) => lfw.set_ui({ id: layout_id }, Number(index) || 0)],
    [UIActionEnum.PushUI, ({ lfw }, layout_id, index) => lfw.push_ui({ id: layout_id }, Number(index) || 0)],
    [UIActionEnum.PopUI, ({ lfw }) => lfw.pop_ui_safe()],
    [UIActionEnum.LoadData, ({ lfw }, url) => lfw.load(...(url ? [url] : LFW.ZIPS.slice(1))).catch(e => Ditto.warn('Failed to load, reason', e))
      .catch((e) => Ditto.warn(`[${UIActor.TAG}::load_data] ${url} not exists, err: ${e}`))],
    [UIActionEnum.Broadcast, ({ lfw }, msg) => lfw.broadcast(msg)],
    [UIActionEnum.Sound, ({ lfw }, name) => lfw.sounds.play_preset(name)],
    [UIActionEnum.SwitchDifficulty, ({ lfw }, v) => lfw.switch_difficulty(v ? Number(v) : void 0)],
    [UIActionEnum.DestoryStage, ({ lfw }) => lfw.change_stage('')],
    [UIActionEnum.RemoveAllEntities, ({ lfw }) => lfw.entities.del_all()]
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
export const actor = new UIActor();
