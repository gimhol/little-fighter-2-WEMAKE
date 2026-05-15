import { HitFlag } from "./HitFlag";

export enum EntityEnum {
  Entity  /**/ = HitFlag.Ohters,
  Fighter /**/ = HitFlag.Fighter,
  Weapon  /**/ = HitFlag.Weapon,
  Ball    /**/ = HitFlag.Ball,
}
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
export const E_E = EntityEnum;
export type E_E = EntityEnum;