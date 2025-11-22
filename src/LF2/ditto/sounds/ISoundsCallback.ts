import { ISounds } from "./ISounds";

export interface ISoundsCallback {
  on_muted_changed?(muted: boolean, mgr: ISounds): void;
  on_bgm_muted_changed?(muted: boolean, mgr: ISounds): void;
  on_sound_muted_changed?(muted: boolean, mgr: ISounds): void;
  on_volume_changed?(volume: number, prev: number, mgr: ISounds): void;
  on_bgm_changed?(bgm: string | null, prev: string | null, mgr: ISounds): void;
  on_bgm_volume_changed?(volume: number, prev: number, mgr: ISounds): void;
  on_sound_volume_changed?(volume: number, prev: number, mgr: ISounds): void;
  on_bgm_ended?(bgm: string | null, mgr: ISounds): void;

}
