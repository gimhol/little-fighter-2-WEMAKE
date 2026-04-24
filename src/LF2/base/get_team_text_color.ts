import { Defines } from "../defines/defines";

export function get_team_text_color(
  team: string | number,
  fallback = Defines.TeamInfoMap[Defines.TeamEnum.Independent].txt_color
): string {
  const info = Defines.TeamInfoMap[team]
  return info?.txt_color || fallback;
}
