
import type { CtrlDevice, GameKey } from "./defines";

export interface IPlayerInfoCallback {
  on_key_changed?(key_name: GameKey, value: string, prev: string): void;
  on_name_changed?(player_name: string, prev: string): void;
  on_character_changed?(character_id: string, prev: string): void;
  on_team_changed?(team: string, prev: string): void;
  on_joined_changed?(joined: boolean): void;
  on_character_decided?(is_decided: boolean): void;
  on_team_decided?(is_decided: boolean): void;
  on_is_com_changed?(is_com: boolean): void;
  on_random_character_changed?(character_id: string, prev: string): void;
  on_ctrl_changed?(value: CtrlDevice, prev: CtrlDevice): void;
}
