import { HitFlag } from "./HitFlag";

export enum EntityEnum {
  Entity  /**/ = HitFlag.Ohters,
  Fighter /**/ = HitFlag.Fighter,
  Weapon  /**/ = HitFlag.Weapon,
  Ball    /**/ = HitFlag.Ball,
}
export const E_E = EntityEnum;
export type E_E = EntityEnum;
export const EE = EntityEnum;
export type EE = EntityEnum;

export type TEntityEnum = EntityEnum |
  0b00000100 |
  0b00001000 |
  0b00010000 |
  0b00100000;
export const ALL_ENTITY_ENUM: TEntityEnum[] = [
  EntityEnum.Fighter,
  EntityEnum.Weapon,
  EntityEnum.Ball,
  EntityEnum.Entity,
];
export const ENTITY_PRIORITY_MAP: Record<EntityEnum, number> = {
  [EntityEnum.Fighter]: 0,
  [EntityEnum.Weapon]: 1,
  [EntityEnum.Ball]: 2,
  [EntityEnum.Entity]: 3,
}
export const ENTITY_ENUM_LABEL_MAP: Record<EntityEnum, string> = {
  [EntityEnum.Fighter]: 'Fighter',
  [EntityEnum.Weapon]: 'Weapon',
  [EntityEnum.Ball]: 'Ball',
  [EntityEnum.Entity]: 'Entity',
}
export const ENTITY_ENUM_DESC_MAP: Record<EntityEnum, string> = {
  [EntityEnum.Fighter]: 'Fighter',
  [EntityEnum.Weapon]: 'Weapon',
  [EntityEnum.Ball]: 'Ball',
  [EntityEnum.Entity]: 'Entity',
}
export const EntityEnumDescriptions: Record<EntityEnum, string> = {
  [EntityEnum.Entity]: "",
  [EntityEnum.Fighter]: "",
  [EntityEnum.Weapon]: "",
  [EntityEnum.Ball]: "",
}
