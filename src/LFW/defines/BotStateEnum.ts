export enum BotStateEnum {
  Idle = 'Idle',
  Avoiding = 'Avoiding',
  Chasing = 'Chasing',
  Following = 'Following',
  StageEnd = 'StageEnd',
  Dead = 'Dead'
}
export const BotStateEnumDescriptions: Record<BotStateEnum, string> = {
  [BotStateEnum.Idle]: "",
  [BotStateEnum.Avoiding]: "",
  [BotStateEnum.Chasing]: "",
  [BotStateEnum.Following]: "",
  [BotStateEnum.StageEnd]: "",
  [BotStateEnum.Dead]: "",
}
export type BSE = BotStateEnum;
export const BSE = BotStateEnum;


