
import type { ICollisionSnapshot } from "../collision/ICollisionSnapshot";
import type { IVector3Like } from "../defines";
import type { ITimesSnapshot } from "../utils/ITimesSnapshot";
import type { IDrinkInfoSnapshot } from "./IDrinkInfoSnapshot";
import { StatBarType } from "./StatBarType";

export interface IEntitySnapshot {
  id: string;
  wait: number;
  variant: number;
  transforms: string[] | null,
  lifetime: number,
  spawn_time: number,
  outline_color: string,
  outline_alpha: number,
  outline_width: number,
  prev_position: IVector3Like,
  position: IVector3Like,
  prev_velocity: IVector3Like,
  velocity: IVector3Like,
  copies: string[],
  vrests: [string, ICollisionSnapshot][],
  // blockers: [string, ICollisionSnapshot][],    // read it from vrests
  // superpunchs: [string, ICollisionSnapshot][], // read it from vrests

  emitters: string[],
  data: string,
  reserve: number,
  mounted: number,
  ghosted: number,
  landing_frame: string | undefined,
  hp_r_tick: ITimesSnapshot,
  mp_r_tick: ITimesSnapshot,
  drink?: IDrinkInfoSnapshot,
  fuse_bys: string[] | undefined,
  dismiss_time: number | null,
  dismiss_data: string | undefined;

  stat_bar_type: StatBarType | null;
  resting: number;
  resting_max?: number;
  toughness: number;
  toughness_max: number;
  toughness_resting: number;
  toughness_resting_max: number;
  fall_value: number;
  fall_value_max?: number;
  fall_r_tick: ITimesSnapshot;
  fall_r_value: number;
  defend_value: number;
  defend_value_max?: number;
  defend_r_tick: ITimesSnapshot;
  defend_r_value: number;
  healing: number;
  defend_ratio?: number;
  fallinjury: number;
  throwinjury: number;
  facing: -1 | 1;
  frame: string;
  // next_frame: Readonly<INextFrame> | null;
  prev_frame: string;
  catching: string | undefined;
  catcher: string | undefined;
  aabb_x1: number;
  aabb_x2: number;
}
