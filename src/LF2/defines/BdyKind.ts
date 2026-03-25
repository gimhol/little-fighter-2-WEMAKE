import { between } from "../utils";
/**
 * - [LF2]
 * - [WEMAKE]
 *
 * - 原版lf2中
 *    - 用于实现被攻击后跳转的逻辑。
 *    - kind: 1xxx是id为300的“人质”专用的，被攻击时跳至xx帧。
 *    - 只有如下的itr能击中此bdy。
 *      - 角色的kind0的itr
 *      - id为210 kind0的itr
 *      - id为202 kind0的itr
 *      - 角色手持武器造成的itr（可能是武器kind: 5的itr，未验证）
 *
 * - WEMAKE中：
 *    - kind: 1XXX, 被攻击时跳至“XXX”帧。
 *    - 使用了bdy.test实现了原版中的其他限制
 *
 * @see {BuiltIn_OID.Henry_Arrow1}
 * @see {BuiltIn_OID.Rudolf_Weapon}
 */
export const OLD_BDY_KIND_GOTO_MIN = 1000;
/**
 * 参见GotoMin
 *
 * @see {BdyKind._OLD_GotoMin}
 */
export const OLD_BDY_KIND_GOTO_MAX = 1999;

export enum BdyKind {
  /**
   * - [LF2] √
   * - [WEMAKE] √
   */
  Normal = 0,
  /**
   * [LF2] ×
   * [WEMAKE] √
   */
  Criminal = 1,


  /**
   * [WEMAKE ONLY]
   * 这是WEMAKE新增的kind，用于代替原版frame.state为Defend“防御动作”的bdy
   * 处于此状态的物体, 正面迎接伤害时，扣除防御值(defend_value -= itr.bdefend)
   *    - 当itr.bdefend >= 100，则视为被直接击中
   *    - 当defend_value>0：
   *      - 若bdy.hit_act存在，则进入bdy.hit_act;
   *      - 若bdy.hit_act不存在，则视为被直接击中
   *    - 当defend_value<=0：
   *      - 若bdy.break_act存在，则进入bdy.break_act;
   *      - 若bdy.break_act不存在，则视为被直接击中
   */
  Defend = 2000,
  Ignore = 10000,
}
export const bdy_kind_name = (v: any) => {
  let ret = BdyKind[v];
  if (!ret) ret = `unknown_${v}`
  return ret;
}
export const bdy_kind_full_name = (v: any) => `BdyKind.${bdy_kind_name(v)}`
export const BdyKindDescriptions: Record<BdyKind, string> = {
  [BdyKind.Normal]: "",
  [BdyKind.Defend]: "",
  [BdyKind.Ignore]: "",
  [BdyKind.Criminal]: "",
}

export const B_K = BdyKind
export type B_K = BdyKind