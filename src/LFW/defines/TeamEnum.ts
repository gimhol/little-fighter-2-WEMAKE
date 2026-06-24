export enum TeamEnum {
  Independent = "",
  Team_1 = "1",
  Team_2 = "2",
  Team_3 = "3",
  Team_4 = "4",
  Team_5 = "5",
  Team_6 = "6",
  Team_7 = "7",
  Team_8 = "8",
  Max = '8',
}
export const TeamEnumDescriptions: Record<TeamEnum, string> = {
  [TeamEnum.Independent]: "",
  [TeamEnum.Team_1]: "",
  [TeamEnum.Team_2]: "",
  [TeamEnum.Team_3]: "",
  [TeamEnum.Team_4]: "",
  [TeamEnum.Team_5]: "",
  [TeamEnum.Team_6]: "",
  [TeamEnum.Team_7]: "",
  [TeamEnum.Team_8]: "",
  [TeamEnum.Max]: "",
}
export const is_independent = (team: string) => team.length !== 1;
export const T_E = TeamEnum;
export type T_E = TeamEnum;
export const TE = TeamEnum;
export type TE = TeamEnum;
