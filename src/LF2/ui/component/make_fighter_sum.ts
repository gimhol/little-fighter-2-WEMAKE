import type { IEntityData } from "../../defines";
import type { IFighterSumInfo } from "./IFighterSumInfo";
import { make_sum_info } from "./make_sum_info";

export const make_fighter_sum = (data: IEntityData): IFighterSumInfo => {
  return { ...make_sum_info(''), data };
};

