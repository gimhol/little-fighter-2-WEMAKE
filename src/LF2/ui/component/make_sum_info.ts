import type { ISumInfo } from "./ISumInfo";

export const make_sum_info = (team: string): ISumInfo => ({
  wins: 0,
  loses: 0,
  kills: 0,
  damages: 0,
  pickings: 0,
  spawns: 0,
  deads: 0,
  team,
  latest_dead_time: -1,
  hp_lost: 0,
  mp_usage: 0,
  lost: false,
});

