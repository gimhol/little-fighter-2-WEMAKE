import { round } from "../utils";
import { arithmetic_progression } from "../utils/math/arithmetic_progression";
import { Builtin_FrameId } from "./Builtin_FrameId";
import { CheatType } from "./CheatType";
import { Difficulty } from "./Difficulty";
import type { GameKey } from "./GameKey";
import type { IBgData } from "./IBgData";
import type { INextFrame } from "./INextFrame";
import type { IPairByFace } from "./IPairByFace";
import type { IStageInfo } from "./IStageInfo";
import { StageGroup as SG } from "./StageGroup";
import { TeamEnum as _TeamEnum } from "./TeamEnum";
export interface TFrameIdPair extends IPairByFace<string> { }
export interface TFrameIdListPair extends IPairByFace<string[]> { }
export type TTODO = any;
export type TFace = -1 | 1;
export type TTrend = -1 | 0 | 1;
export type BOOL = 1 | 0;
export namespace Defines {
  export const DATA_VERSION: number = 11;
  export const TeamEnum = _TeamEnum;
  export type TeamEnum = _TeamEnum;
  export const CLASSIC_SCREEN_WIDTH = 794;
  export const CLASSIC_SCREEN_HEIGHT = 550;
  export const MODERN_SCREEN_WIDTH = 794;
  export const MODERN_SCREEN_HEIGHT = 450;

  export const DEFAULT_HP = 500;
  export const DEFAULT_MP = 500;
  export const DEFAULT_FALL_VALUE_MAX = 140;
  export const DEFAULT_DEFEND_VALUE_MAX = 120;
  export const DEFAULT_OPOINT_SPEED_Z = 3.5;
  export const DEFAULT_FIREN_FLAME_SPEED_Z = 0.5;

  /**
   * 默认值：被击中的对象晃动多少帧
   *
   * @type {number}
   */
  export const DEFAULT_ITR_SHAKING: number = 4;

  /**
   * 默认值：击中敌人的对象停顿多少帧
   *
   * @type {number}
   * @memberof World
   */
  export const DEFAULT_ITR_MOTIONLESS: number = 4;
  export const DEFAULT_ITR_A_REST: number = 8;
  export const DEFAULT_CATCH_TIME: number = 680;
  export const DEFAULT_ITR_FALL: number = 40;

  /**
   * 默认值：当角色fall_value低于DEFAULT_FALL_VALUE_DIZZY时，角色应当进入眩晕状态
   *
   * @memberof World
   */
  export const DEFAULT_FALL_VALUE_DIZZY = 40;

  /**
   * 默认值：
   */
  export const DEFAULT_FALL_VALUE_CRITICAL: number = DEFAULT_FALL_VALUE_MAX - DEFAULT_FALL_VALUE_DIZZY

  export const DAFUALT_QUBE_LENGTH: number = 24;
  export const DAFUALT_QUBE_LENGTH_POW2: number = 576;

  export const DEFAULT_RESTING_MAX: number = 60;
  export const DEFAULT_TOUGHNESS_RESTING_MAX: number = 60;

  /**
   * 默认值：角色进入场地时的闪烁无敌时间
   *
   * @type {number}
   */
  export const DEFAULT_BEGIN_BLINK_TIME: number = 144;

  /**
   * 默认值：倒地起身后的闪烁无敌时间
   *
   * @type {number}
   */
  export const DEFAULT_LYING_BLINK_TIME: number = 32;

  /**
   * 默认值：“非玩家角色”死亡时后的闪烁时间
   *
   * @type {number}
   */
  export const DEFAULT_GONE_BLINK_TIME: number = 56;


  /**
   * 直接破防值
   */
  export const DEFAULT_FORCE_BREAK_DEFEND_VALUE = 200;

  /**
   * 默认值：dvx缩放系数
   *
   * @type {number}
   * @memberof World
   */
  export const DEFAULT_FVX_F: number = 1;

  /**
   * 默认值：dvy缩放系数
   *
   * @type {number}
   * @memberof World
   */
  export const DEFAULT_FVY_F: number = 1;

  /**
   * 默认值：dvz缩放系数
   *
   * @type {number}
   * @memberof World
   */
  export const DEFAULT_FVZ_F: number = 1;

  /**
   * 默认值：X轴丢人初速度缩放系数
   *
   * @type {number}
   */
  export const DEFAULT_TVX_F: number = 1;

  /**
   * 默认值：Y轴丢人初速度缩放系数
   *
   * @type {number}
   */
  export const DEFAULT_TVY_F: number = 1.3;

  /**
   * 默认值：Z轴丢人初速度缩放系数
   *
   * @type {number}
   */
  export const DEFAULT_TVZ_F: number = 1;


  export const VOID_BG: IBgData = {
    type: "background",
    layers: [],
    id: "VOID_BG",
    base: {
      name: "VOID_BG",
      shadow: "",
      shadowsize: [0, 0],
      left: 0,
      right: MODERN_SCREEN_WIDTH * 2,
      far: -0,
      near: -0,
      group: []
    },
  };
  export const RANDOM_BG: IBgData = {
    type: "background",
    layers: [],
    id: "RANDOM_BG",
    base: {
      name: "Random",
      shadow: "",
      shadowsize: [0, 0],
      left: 0,
      right: 794,
      far: -468,
      near: -216,
      group: []
    },
  };
  export const VOID_STAGE: IStageInfo = {
    bg: VOID_BG.id,
    id: "VOID_STAGE",
    name: "VOID_STAGE",
    phases: [],
    group: [SG.Dev]
  };

  export const NEXT_FRAME_GONE: Readonly<INextFrame> = {
    id: Builtin_FrameId.Gone,
  };
  export const NEXT_FRAME_AUTO: Readonly<INextFrame> = {
    id: Builtin_FrameId.Auto,
  };
  export const NEXT_FRAME_SELF: Readonly<INextFrame> = {
    id: Builtin_FrameId.Self,
  };

  export const CheatKeys: Record<CheatType, string> = {
    [CheatType.LF2_NET]: "lf2.net",
    [CheatType.HERO_FT]: "herofighter.com",
    [CheatType.GIM_INK]: "gim.ink",
  };

  export const CheatTypeSounds: Record<CheatType, string> = {
    [CheatType.LF2_NET]: "data/m_pass.wav.mp3",
    [CheatType.HERO_FT]: "data/m_end.wav.mp3",
    [CheatType.GIM_INK]: "data/093_r.wav.mp3",
  };

  export interface ICheatInfo {
    keys: string;
    sound: string;
  }

  export const Sounds = {
    StagePass: "data/m_pass.wav.mp3",
    BattleEnd: "data/m_end.wav.mp3",
  } as const;

  /**
   * 按键“双击”判定间隔，单位（帧数）
   *
   * 当同个按键在“双击判定间隔”之内按下两次，
   * 且中途未按下其对应冲突按键，视为“双击”。
   *
   * @type {number}
   */
  export const DOUBLE_CLICK_INTERVAL: number = 30;

  /**
   * 按键“按下”/“双击”的判定持续帧，单位：帧数
   *
   * 当某按键被“按下”（不松开），接下来的数帧（数值key_hit_duration）内，均判定为“按下”。
   * 此时若存在对应的“按键‘按下’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘按下’跳转动作”。
   *
   * 当某双击后，接下来的数帧（数值key_hit_duration）内，均判定为“双击”。
   * 此时若存在对应的“按键‘双击’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘双击’跳转动作”。
   *
   * @type {number}
   */
  export const KEY_HIT_DURATION: number = 10;
  export const GRAVITY: number = 0.48; // 0.38;


  export const FRICTION_FACTOR: number = 1; // 0.894427191;
  export const FRICTION_X: number = 0.3;
  export const FRICTION_Z: number = 0.3;

  export const LAND_FRICTION_FACTOR: number = 1;
  export const LAND_FRICTION_X: number = 1;
  export const LAND_FRICTION_Z: number = 0.5;

  export const CHARACTER_BOUNCING_SPD: number = 2;
  export const CHARACTER_BOUNCING_TEST_SPD_X: number = 5;
  export const CHARACTER_BOUNCING_TEST_SPD_Y: number = -2.6;
  export const HP_RECOVERABILITY = 0.66;

  export const HP_R_TICKS = 24;
  export const HP_R_VALUE = 1;

  export const HP_HEALING_TICKS = 16;
  export const HP_HEALING_VALUE = 8;
  export const STATE_HEAL_SELF_HP = 104;

  export const MP_R_TICKS = 6;
  export const MP_R_RATIO = 1;

  export const FALL_R_TICKS = 1;
  export const FALL_R_VALUE = 1;
  export const DEFEND_R_TICKS = 1;
  export const DEFEND_R_VALUE = 1;

  export const DifficultyLabels: Record<Difficulty, string> = {
    [Difficulty.Easy]: "easy",
    [Difficulty.Normal]: "normal",
    [Difficulty.Difficult]: "difficult",
    [Difficulty.Crazy]: "crazy",
  };
  export interface ITeamInfo {
    i18n: string;
    txt_color: string;
    txt_shadow_color: string;
    outline_color?: string;
  }

  export interface ITeamInfoMap {
    [TeamEnum.Independent]: ITeamInfo;
    [TeamEnum.Team_1]: ITeamInfo;
    [TeamEnum.Team_2]: ITeamInfo;
    [TeamEnum.Team_3]: ITeamInfo;
    [TeamEnum.Team_4]: ITeamInfo;
    [x: string | number]: ITeamInfo | undefined;
  }
  export const Teams = [
    Defines.TeamEnum.Independent,
    Defines.TeamEnum.Team_1,
    Defines.TeamEnum.Team_2,
    Defines.TeamEnum.Team_3,
    Defines.TeamEnum.Team_4,
  ];
  export const TeamInfoMap: ITeamInfoMap = {
    [TeamEnum.Independent]: {
      i18n: "Independent",
      txt_color: "#ffffff",
      txt_shadow_color: "#000000",
    },
    [TeamEnum.Team_1]: {
      i18n: "Team_1",
      txt_color: "#4f9bff",
      txt_shadow_color: "#001e46",
      outline_color: "#4f9bff",
    },
    [TeamEnum.Team_2]: {
      i18n: "Team_2",
      txt_color: "#ff4f4f",
      txt_shadow_color: "#460000",
      outline_color: "#ff4f4f",
    },
    [TeamEnum.Team_3]: {
      i18n: "Team_3",
      txt_color: "#3cad0f",
      txt_shadow_color: "#154103",
      outline_color: "#3cad0f",
    },
    [TeamEnum.Team_4]: {
      i18n: "Team_4",
      txt_color: "#ffd34c",
      txt_shadow_color: "#9a5700",
      outline_color: "#ffd34c",
    },
  };

  export enum BuiltIn_Imgs {
    RFACE = "!sprite/RFACE@4x.png",
    CHARACTER_THUMB = "sprite/CHARACTER_THUMB.png",
  }
  export enum BuiltIn_Dats {
    Spark = "data/spark.json5"
  }
  export enum BuiltIn_Broadcast {
    ResetGPL = "reset_gpl",
    UpdateRandom = "update_random",
    StartGame = "start_game",
    SwitchStage = "switch_stage",
    SwitchBackground = "switch_background"
  }
  export enum BuiltIn_Sounds {
    Cancel = "cancel",
    End = "end",
    Join = "join",
    Ok = "ok",
    Pass = "pass",
  }
  export type TBuiltIn_Sounds = BuiltIn_Sounds | "cancel" | "end" | "join" | "ok" | "pass"


  export type TKeys = Record<GameKey, string>;
  export const default_keys_map: ReadonlyMap<string, TKeys> = new Map<string, TKeys>([
    ["1", { L: "a", R: "d", U: "w", D: "s", a: "j", j: "k", d: "l" }],
    [
      "2",
      {
        L: "arrowleft",
        R: "arrowright",
        U: "arrowup",
        D: "arrowdown",
        a: "0",
        j: ".",
        d: "enter",
      },
    ],
    ["3", { L: "", R: "", U: "", D: "", a: "", j: "", d: "" }],
    ["4", { L: "", R: "", U: "", D: "", a: "", j: "", d: "" }],
    ["_", { L: "_L", R: "_R", U: "_U", D: "_D", a: "_a", j: "_j", d: "_d" }],
  ]);

  export function get_default_keys(player_id: string): TKeys {
    return default_keys_map.get(player_id) || default_keys_map.get("_")!;
  }
  export const SHORT_KEY_CODES: { [x in string]?: string } = {
    ARROWUP: "↑",
    ARROWDOWN: "↓",
    ARROWLEFT: "←",
    ARROWRIGHT: "→",
    DELETE: "DEL",
    PAGEDOWN: "PG↓",
    PAGEUP: "PG↑",
  }

  export const DEFAULT_BREAK_DEFEND_VALUE = 40;

  export const BAT_CHASE_SPREADING_VX = arithmetic_progression(-6, 6, 1)
  export const BAT_CHASE_SPREADING_VZ = arithmetic_progression(-2, 2, 1)
  export const BAT_CHASE_MAX_VX = 7
  export const BAT_CHASE_ACC_X = 0.25
  export const BAT_CHASE_ACC_Z = 0.25
  export const BAT_CHASE_MAX_VY = 1
  export const BAT_CHASE_ACC_Y = 0.1

  export const DENNIS_CHASE_MAX_VX = 7
  export const DENNIS_CHASE_ACC_X = 0.25
  export const DENNIS_CHASE_ACC_Z = 0.25
  export const DENNIS_CHASE_MAX_VY = 0.2
  export const DENNIS_CHASE_ACC_Y = 0.01

  export const ANGEL_BLESSING_MAX_VX = 7
  export const ANGEL_BLESSING_ACC_X = 0.25
  export const ANGEL_BLESSING_ACC_Z = 0.25
  export const ANGEL_BLESSING_MAX_VY = 0.2
  export const ANGEL_BLESSING_ACC_Y = 0.01

  export const DISATER_SPREADING_VX = arithmetic_progression(-5, 5, 1)
  export const DISATER_SPREADING_VY = arithmetic_progression(2, 8, 0.5)
  export const DEVIL_JUDGEMENT_SPREADING_VX = arithmetic_progression(-5, 5, 1)
  export const DEVIL_JUDGEMENT_SPREADING_VY = arithmetic_progression(2, 8, 0.5)
  export const DISATER_CHASE_MAX_VX = 7
  export const DISATER_CHASE_ACC_X = 0.3
  export const DISATER_CHASE_ACC_Z = 0.25
  export const DISATER_CHASE_MAX_VY = -4
  export const DISATER_CHASE_ACC_Y = -0.25

  export const JOHN_CHASE_MAX_VX = 6.5
  export const JOHN_CHASE_ACC_X = 0.25
  export const JOHN_CHASE_ACC_Z = 0.25
  export const JOHN_CHASE_MAX_VY = 0.2
  export const JOHN_CHASE_ACC_Y = 0.01

  export const BOOMERANG_CHASE_MAX_VX = 10
  export const BOOMERANG_CHASE_ACC_X = 0.25
  export const BOOMERANG_CHASE_MAX_VZ = 1.8
  export const BOOMERANG_CHASE_ACC_Z = 0.1
  /** @see {GRAVITY} */
  export const BOOMERANG_GRAVITY = 0.052

  export const MAX_AI_DESIRE = 10000 as const;

  export const AI_W_ATK_F_X = 50;
  export const AI_W_ATK_B_X = 40;
  export const AI_W_ATK_M_X = -1;
  export const AI_W_ATK_Z = 15;

  export const AI_R_ATK_F_X = 100;
  export const AI_R_ATK_B_X = 80;
  export const AI_R_ATK_Z = 15;
  export const AI_R_ATK_DESIRE = 10000;

  export const AI_J_DESIRE = 50;
  export const AI_J_ATK_F_X = 80;
  export const AI_J_ATK_B_X = 90;
  export const AI_J_ATK_Z = 60;
  export const AI_J_ATK_Y_MIN = -60;
  export const AI_J_ATK_Y_MAX = 60;

  export const AI_D_DESIRE = 100;
  export const AI_D_ATK_F_X = 200;
  export const AI_D_ATK_B_X = 200;
  export const AI_D_ATK_Z = 60;
  export const AI_D_ATK_Y_MIN = -60;
  export const AI_D_ATK_Y_MAX = 60;
  export const AI_D_ATK_DESIRE = 10000;


  export const AI_R_DESIRE_MIN = 0;
  export const AI_R_DESIRE_MAX = 500;
  export const AI_R_STOP_DESIRE = 10;
  export const AI_R_X_MIN = 100;
  export const AI_R_X_MAX = 2000;

  export const AI_DEF_DESIRE = 100;


  export function desire(ratio: number): number {
    return round(Defines.MAX_AI_DESIRE * ratio)
  }

  /**
   * 防御生效时，仍扣除多少比例的血
   *
   * @type {number}
   */
  export const DEFAULT_DEFEND_INJURY_RATIO: number = 0.1

  /**
   * 盔甲生效时，仍扣除多少比例的血
   *
   * @type {number}
   */
  export const DEFAULT_ARMOR_INJURY_RATIO: number = 0.1

  /**
   * 盔甲生效时，攻击方停顿多少比例的时间
   *
   * @type {number}
   */
  export const DEFAULT_ARMOR_MOTIONLESS_RATIO: number = 1.5

  /**
   * 盔甲生效时，受伤方停顿多少比例的时间
   *
   * @type {number}
   */
  export const DEFAULT_ARMOR_SHAKING_RATIO: number = 3

  /**
   * 默认击飞速度
   * 
   * @link https://lf-empire.de/forum/showthread.php?tid=11204
   */
  export const DEFAULT_IVY_D: number = 3.5;

  export const WEAPON_WEIGHT_HEAVY = 1.1;
  export const WEAPON_WEIGHT_ARROW = 0.74;
  export const WEAPON_WEIGHT_HOE = 1;
  export const WEAPON_WEIGHT_NOMRAL = 0.9;
  export const WEAPON_WEIGHT_LIGHT = 0.74;
  export const WEAPON_WEIGHT_BASEBALL = 0.6;
  export const FIGHTER_STREAGTH_STRONG = 1.5;
  export const FIGHTER_STREAGTH_NORMAL = 1;
  export const FIGHTER_STREAGTH_WEAK = 0.8;

  /**
   * stay下敌人距离多近才追击
   */
  export const AI_STAY_CHASING_RANGE = 200;
  export const AI_FOLLOWING_RANGE_X = 100;
  export const AI_FOLLOWING_RANGE_Z = 100;

  export const AI_MAX_CHASINGS_ENEMIES = 1;
  export const AI_MAX_AVOIDING_ENEMIES = 1;
  export const AI_MAX_DEFENDS_ENEMIES = 3;
}

export default Defines;