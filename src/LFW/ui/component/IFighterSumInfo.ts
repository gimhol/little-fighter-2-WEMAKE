import type { IEntityData } from "../../defines";
import type { ISumInfo } from "./ISumInfo";

export interface IFighterSumInfo extends ISumInfo {
  data: IEntityData;
}

export interface IPlayerSumInfo extends ISumInfo {
  player_id: string;
  data: IEntityData;
}
