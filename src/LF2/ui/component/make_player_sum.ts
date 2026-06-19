import { Entity } from "../../entity";
import type { IPlayerSumInfo } from "./IFighterSumInfo";
import { make_fighter_sum } from "./make_fighter_sum";


export const make_player_sum = (e: Entity): IPlayerSumInfo => {
  return { ...make_fighter_sum(e.data), player_id: e.ctrl.player_id };
};
