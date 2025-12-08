export enum TeamEnum {
  Independent = "",
  Team_1 = "1",
  Team_2 = "2",
  Team_3 = "3",
  Team_4 = "4",
  Max = "4",
}
export const is_independent = (team: string) => team.length !== 1;
export const T_E = TeamEnum;
export type T_E = TeamEnum;
