import type { ITeamSumInfo } from "./ITeamSumInfo";
import { make_sum_info } from "./make_sum_info";


export const make_team_sum_info = (team: string): ITeamSumInfo => ({
  ...make_sum_info(team),
  lives: 0, 
  hp: 0, 
  reserve: 0,
});
