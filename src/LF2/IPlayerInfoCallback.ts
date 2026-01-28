
import type { CtrlDevice, GameKey } from "./defines";

export interface IPlayerInfoCallback {
  on_key_changed?(key_name: GameKey, value: string, prev: string): void;
  on_name_changed?(player_name: string, prev: string): void;
  on_is_com_changed?(is_com: boolean): void;
  on_ctrl_changed?(value: CtrlDevice, prev: CtrlDevice): void;
}
