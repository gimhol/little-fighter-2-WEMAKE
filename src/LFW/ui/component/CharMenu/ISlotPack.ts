import type { CharMenuHead } from "../CharMenuHead";
import type { FighterName as CharMenuFighterName } from "../FighterName";
import type { PlayerName as CharMenuPlayerName } from "../PlayerName";
import type { PlayerTeamName as CharMenuPlayerTeamName } from "../PlayerTeamName";


export interface ISlotPack {
  head?: CharMenuHead;
  player_name?: CharMenuPlayerName;
  fighter_name?: CharMenuFighterName;
  team_name?: CharMenuPlayerTeamName;
}
