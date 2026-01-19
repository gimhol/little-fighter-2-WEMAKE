export enum FrameBehavior {
  /** 
   * * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   * 
   * 追敌人的center(因为敌人站在地面，所以会下飘) 
   * 
   * John的d^a
   */
  JohnChase = 1,

  /** 
   * * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   * 
   * 水平追敌？
   * Dennis的d^a
   */
  DennisChase = 2,

  /** 加速法追敌(追纵力较差) */
  Boomerang = 3,

  /** 
   * 天使之祝福(别的dat档用了无效) 
   */
  AngelBlessing = 4,

  /** 
   * 天使之祝福的开始(会追我方的人物很久) 
   */
  AngelBlessingStart = 5,

  /** 
   * 恶魔之审判的开始(视敌人数目而增加，基本上是一个) 
    */
  DevilJudgementStart = 6,

  /** 
   * * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   * 
   * 恶魔之审判,殃殒天降(可以做出打到地面的追踪波) 
   * 
   * - WEMAKE中：
   *    - 跟踪效果在BallController, 配合frame.speedx, frame.speedz实现
   *    - 下落打到地面得效果通过 dvy, acc_y, vym, on_hit_ground实现
   */
  ChasingSameEnemy = 7,

  /**
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * 吸血蝙蝠的开始
   *
   * - LF2中：
   *    - ball类的frame的hit_FA=8时，将会生成id: 225的对象。
   *    - 生成与敌人相当数量的对象，但不少于三个。
   *    - 仅限于id: 225
   *
   * - WEMAKE中：
   *    - 生成将通过opoint被实现
   */
  BatStart = 8,

  /**
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * 殃殒天降的开始(视敌人数目而增加，基本数值是四个)
   *
   * - WEMAKE中：
   *    - 生成将通过opoint被实现
   */
  FirzenDisasterStart = 9,

  /**
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * 加速(从慢变快), john 盘子失去跟踪
   * 
   * - WEMAKE中：
   *    - 此值不会有任何作用（但依旧保留）
   *    - 通过dvx acc_x vxm 实现
   */
  JohnBiscuitLeaving = 10,

  /**
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * 极地火山的开始
   *
   * - WEMAKE中：
   *    - 生成将通过opoint被实现
   */
  FirzenVolcanoStart = 11,

  /**
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * 吸血蝙蝠
   */
  Bat = 12,

  /**
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * 连环重炮的开始
   *
   * - LF2中：
   *    ball类的frame的hit_FA=13时，将会生成一个JulianBall。
   *
   * - WEMAKE中：
   *    - 生成将通过opoint被实现
   */
  JulianBallStart = 13,

  /**
   * 连环重炮
   */
  JulianBall = 14,
}
