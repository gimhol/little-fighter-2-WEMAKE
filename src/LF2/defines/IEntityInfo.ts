import type { IPictureInfo } from "./IPictureInfo";
import type { IArmorInfo } from "./IArmorInfo";
import type { IOpointInfo } from "./IOpointInfo";
import type { ILegacyPictureInfo } from "./ILegacyPictureInfo";
import type { IBotData } from "./IBotData";
import type { IDrinkInfo } from "./IDrinkInfo";
import type { IFramePictureInfo } from "./IFramePictureInfo";
export interface IEntityInfo {
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

  files: Record<string, IPictureInfo | ILegacyPictureInfo>;

  depth_test?: boolean;

  depth_write?: boolean;

  render_order?: number;

  fall_value?: number;

  defend_value?: number;

  resting?: number;

  /**
   * 默认血量
   *
   * - 默认值：
   *    - 角色、武器、波：Defines.DAFUALT_HP
   *
   * 原版中，武器和波的hp是通过weapon_hp设置的
   *
   * @see Defines.DEFAULT_HP 默认值
   * @type {?number}
   */
  hp?: number;

  /**
   * 默认蓝量
   *
   * - 默认值：
   *    - 啤酒：154
   *    - 牛奶：249，闯关模式下
   *    - 角色、武器、波：Defines.DEFAULT_MP
   *
   * @see Defines.DEFAULT_MP 默认值
   * @type {?number}
   */
  mp?: number;

  /**
   * 暗血恢复周期
   * 每几帧回一次血
   */
  hp_r_ticks?: number;

  /**
   * 暗血恢复量
   * 每次回血的回血量
   */
  hp_r_value?: number;

  hp_healing_ticks?: number;
  hp_healing_value?: number;
  mp_r_ticks?: number;
  mp_r_ratio?: number;

  /**
   * 是否为隐藏角色
   * 默认否
   *
   * @type {?boolean}
   */
  // hidden?: boolean;
  /**
   * 角色抓人能抓多久
   *
   * @see {Defines.DEFAULT_CATCH_TIME} 默认值
   * @type {?number}
   */
  catch_time?: number;

  /**
   * 物体的弹性
   * - 目前仅用于武器，当武器接触到地面时，有如下速度变化：
   * - ```vy = -vy * bounce```
   *
   * @type {number}
   */
  bounce?: number;

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

  /**
   * TODO:
   */
  jump_height?: number;
  /**
   * TODO:
   */
  jump_distance?: number;
  /**
   * TODO:
   */
  jump_distancez?: number;

  /**
   * 冲跳高度
   * 
   * @memberof IEntityInfo
   */
  dash_height?: number;

  /**
   * 冲跳X轴速度
   * 
   * @memberof IEntityInfo
   */
  dash_distance?: number;

  /**
   * 冲跳Z轴速度
   * 
   * @memberof IEntityInfo
   */
  dash_distancez?: number;
  /**
   * TODO:
   */
  rowing_height?: number;
  /**
   * TODO:
   */
  rowing_distance?: number;

  armor?: IArmorInfo;

  weight?: number
  strength?: number

  /**
   * BOT数据ID
   *
   * @type {string}
   * @memberof IEntityInfo
   */
  bot_id?: string;

  /**
   * BOT数据
   *
   * @type {IBotData}
   * @memberof IEntityInfo
   */
  bot?: IBotData;

  /**
   * 防御生效时，仍扣除多少比例的血
   *
   * @type {number}
   */
  defend_ratio?: number;

  portraits?: Record<string, IFramePictureInfo>;
}
