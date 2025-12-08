import { TeamEnum } from "../defines/TeamEnum";

let __id__ = 0;
export const new_id = () => "" + ++__id__;

let __team__ = Number(TeamEnum.Max);
export const new_team = () => "team_" + ++__team__;
