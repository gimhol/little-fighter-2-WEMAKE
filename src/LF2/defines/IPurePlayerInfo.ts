import { CtrlDevice } from "./CtrlDevice";
import { GK } from "./GameKey";

export interface IPurePlayerInfo {
  id: string;
  name: string;
  keys: Record<GK, string>;
  version: number;
  ctrl: CtrlDevice;
}
