import { CtrlDevice } from "./CtrlDevice";
import { GK } from "./GameKey";
import { any, fields, int, str } from "../fields";

export interface IPurePlayerInfo {
  id: string;
  name: string;
  keys: Record<GK, string>;
  version: number;
  ctrl: CtrlDevice;
}

export const pure_player_info_fields = fields<IPurePlayerInfo>({
  id: str('ID'),
  name: str('名称'),
  keys: any('按键映射'),
  version: int('版本'),
  ctrl: any('控制器'),
});
