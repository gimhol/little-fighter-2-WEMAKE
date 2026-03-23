
export enum DatTypeEnum {
  Invalid     /* */ = "",
  Fighter     /* */ = "0",
  WeaponA     /* */ = "1",
  WeaponB     /* */ = "2",
  Ball        /* */ = "3",
  WeaponC     /* */ = "4",
  Criminal    /* */ = "5",
  WeaponD     /* */ = "6",
  Background  /* */ = "bg",
  Stage       /* */ = "stage",
  Bot         /* */ = "bot",
}
export const suffix_map: Record<DatTypeEnum, '' | 'bg' | 'stage' | 'obj' | 'bot'> = {
  [DatTypeEnum.Invalid]: "obj",
  [DatTypeEnum.Fighter]: "obj",
  [DatTypeEnum.WeaponA]: "obj",
  [DatTypeEnum.WeaponB]: "obj",
  [DatTypeEnum.Ball]: "obj",
  [DatTypeEnum.WeaponC]: "obj",
  [DatTypeEnum.Criminal]: "obj",
  [DatTypeEnum.WeaponD]: "obj",
  [DatTypeEnum.Background]: "bg",
  [DatTypeEnum.Stage]: "stage",
  [DatTypeEnum.Bot]: "bot"
}
export interface IDatIndex {
  id: string;
  type: DatTypeEnum;
  file: string;
  hash?: string;
  alias?: string;
  groups?: string[];
  skipped?: string;
  bot?: string;
}
export interface ITempDatIndex extends IDatIndex {
  src: string
}
