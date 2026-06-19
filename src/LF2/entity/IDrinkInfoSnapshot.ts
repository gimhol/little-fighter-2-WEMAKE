import type { ITimesSnapshot } from "../utils/ITimesSnapshot";

export interface IDrinkInfoSnapshot {
  hp_h_ticks: ITimesSnapshot;
  hp_h_value: number;
  hp_h_total: number;
  hp_h: number;
  hp_r_ticks: ITimesSnapshot;
  hp_r_total: number;
  hp_r_value: number;
  hp_r: number;
  mp_h_ticks: ITimesSnapshot;
  mp_h_value: number;
  mp_h_total: number;
  mp_h: number;
}
