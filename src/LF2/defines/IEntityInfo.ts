import { any, fields, IFieldInfo, int, str } from "../fields";
import { IWorldDataset, world_dataset_fields } from "../IWorldDataset";
import type { IArmorInfo } from "./IArmorInfo";
import type { IBotData } from "./IBotData";
import type { IDrinkInfo } from "./IDrinkInfo";
import type { IFramePictureInfo } from "./IFramePictureInfo";
import type { ILegacyPictureInfo } from "./ILegacyPictureInfo";
import type { IModelInfo } from "./IModelInfo";
import type { IOpointInfo } from "./IOpointInfo";
import type { IPictureInfo } from "./IPictureInfo";
export interface IEntityInfo extends Partial<IWorldDataset> {
  type?: number;

  /**
   * 实体名称
   * @type {string}
   */
  name: string;

  /**
   * 角色强度系数
   *
   * 用于闯关模式
   *
   * 若一个角色强度等级为3，使用该角色进入闯关，敌方将视此角色为3个人
   *
   * 默认：1
   * @type {?number}
   */
  ce?: number;

  /**
   * 头像
   * @type {string}
   */
  head?: string;

  /**
   * 缩略图
   * @type {string}
   */
  small?: string;

  /**
   * 所属组
   *
   * @see {Defines.EntityGroup}
   */
  group?: string[];

  files?: Record<string, IPictureInfo | ILegacyPictureInfo>;

  models?: Record<string, IModelInfo>;

  resting_max?: number;

  /**
   * 物体的弹性
   * - 目前仅用于武器，当武器接触到地面时，有如下速度变化：
   * - ```vy = -vy * bounce```
   *
   * @type {number}
   */
  bounce_y?: number;
  bounce_x?: number;
  bounce_z?: number;
  bounce_min_y?: number;
  bounce_min_x?: number;
  bounce_min_z?: number;
  fast_vy?: number;
  fast_vx?: number;
  fast_vz?: number;

  /**
   * 物体的碎片信息（目前仅用于武器）
   * 当物体的血量归0时，将根据brokens创建一系列物品。
   * 武器的碎片用这个实现。
   * 也许也能用来实现更可怕的效果。
   *
   * @type {?IOpointInfo[]}
   */
  brokens?: IOpointInfo[];

  /**
   * 
   */
  drink?: IDrinkInfo

  /**
   * 落地伤害
   *
   * 目前只有武器会用到
   *
   * @type {?number}
   */
  drop_hurt?: number;

  /**
   * 被打到的声音
   *
   * 替代了：
   *    - LF2原版 ball类的weapon_hit_sound
   *    - LF2原版 weapon类的weapon_hit_sound
   *
   * 注意：
   *    - WEMAKE 中任意实体都支持该值
   *
   * @type {?string[]}
   */
  hit_sounds?: string[];

  /**
   * 落地声音
   *
   * 替代了：
   *    - LF2原版 ball类的weapon_drop_sound
   *    - LF2原版 weapon类的weapon_drop_sound
   *
   * 注意：
   *    - WEMAKE 中任意实体都支持该值
   *
   * @type {?string[]}
   */
  drop_sounds?: string[];

  /**
   * hp降至0时，发出的声音（会随机挑选一个播放）
   *
   * 替代了：
   *    - LF2原版 ball类的weapon_broken_sound
   *    - LF2原版 weapon类的weapon_broken_sound
   *
   * 注意：
   *    - WEMAKE 中任意实体都支持该值
   *
   * @type {?string[]}
   */
  dead_sounds?: string[];

  armor?: IArmorInfo;

  /**
   * 武器重量
   * （也许角色也可以考虑用这个属性？）
   */
  weight?: number

  /**
   * 角色力气，决定能丢多远
   */
  strength?: number

  /**
   * BOT数据ID
   *
   * @type {string}
   */
  bot_id?: string;

  /**
   * BOT数据
   *
   * @type {IBotData}
   */
  bot?: IBotData;


  /**
   * 似乎有点想法，但不多
   *
   * @type {?Record<string, IFramePictureInfo>}
   */
  portraits?: Record<string, IFramePictureInfo>;
}
export function entity_info_new(): IEntityInfo {
  const ret: IEntityInfo = {
    name: ""
  }
  return ret;
}

export const entity_info_fields = new Map<keyof IEntityInfo, IFieldInfo<Partial<IEntityInfo>>>();

world_dataset_fields.forEach((value, key) => {
  entity_info_fields.set(key, value);
})
fields<Partial<Omit<IEntityInfo, keyof IWorldDataset>>>({
  type: any,
  name: str('实体名称', { maxLength: 16 }),
  ce: int('角色强度系数', '默认：1， 若一个角色强度等级为3，使用该角色进入闯关，将视此角色为3个人', { min: 0, max: 8 }),
  head: any,
  small: any,
  group: any,
  files: any,
  models: any,
  bounce_y: any,
  bounce_x: any,
  bounce_z: any,
  bounce_min_y: any,
  bounce_min_x: any,
  bounce_min_z: any,
  fast_vy: any,
  fast_vx: any,
  fast_vz: any,
  brokens: any,
  drink: any,
  drop_hurt: any,
  hit_sounds: any,
  drop_sounds: any,
  dead_sounds: any,
  armor: any,
  weight: any,
  strength: any,
  bot_id: any,
  bot: any,
  portraits: any
}).forEach((value, key) => {
  entity_info_fields.set(key, value);
})

console.log(entity_info_fields)