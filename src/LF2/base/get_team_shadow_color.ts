import { Defines } from "../defines/defines";

export function get_team_outline_color(team: string | number): string {
  const info =
    Defines.TeamInfoMap[team] ||
    Defines.TeamInfoMap[Defines.TeamEnum.Independent];
  return info.txt_outline_color;
}
