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
  Max = '10',
}
export const is_independent = (team: string) => team.length !== 1;
export const T_E = TeamEnum;
export type T_E = TeamEnum;
export const TE = TeamEnum;
export type TE = TeamEnum;
