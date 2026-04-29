import { AGK, GK } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { abs } from "../../utils";
import { BotState_Base } from "./BotState";

export class BotState_Avoiding extends BotState_Base {
  readonly key = BotStateEnum.Avoiding;

  override update(dt: number) {
    super.update(dt);
    if (this.stage.is_stage_finish) return BotStateEnum.StageEnd;

    const { ctrl: c } = this;
    if (c.goingto) return BotStateEnum.Following;

    const me = c.entity;
    const en = c.chasings.get()?.entity;
    const av = c.avoidings.get()?.entity;

    // 防御/动作优先级处理
    if (this.handle_defends()) return;
    if (this.handle_bot_actions()) return;

    // 无躲避目标 → 回空闲
    if (!av) return BotStateEnum.Idle;

    // 敌人更近 → 切换追击
    if (en && manhattan_xz(me, av) > manhattan_xz(me, en)) {
      return BotStateEnum.Chasing;
    }

    // 已经远离目标 → 停止移动回空闲
    const { avoid_x, avoid_z } = c.dataset;
    const abs_x = abs(av.position.x - me.position.x);
    const abs_z = abs(av.position.z - me.position.z);
    if (abs_x > avoid_x && abs_z > avoid_z) {
      c.key_up(GK.L, GK.R, GK.U, GK.D);
      return BotStateEnum.Idle;
    }

    // 危险距离判定（非常近）
    const isDangerClose = abs_x < 100 && abs_z < 30;
    if (isDangerClose) this.wanted_jumping();

    // 随机小跳增加 unpredictability
    this.random_jumping();

    // 世界边界
    const { left, right, near, far } = c.lf2.world;
    const trueTop = Math.min(near, far);
    const trueBottom = Math.max(near, far);

    // 边缘危险阈值（边缘触发“贴墙上下跑”战术）
    const dangerMarginX = 120;
    const dangerMarginZ = 60;

    const isLeftDanger = me.position.x < left + dangerMarginX;
    const isRightDanger = me.position.x > right - dangerMarginX;
    const isTopDanger = me.position.z < trueTop + dangerMarginZ;
    const isBottomDanger = me.position.z > trueBottom - dangerMarginZ;

    let moveX = 0;
    let moveZ = 0;

    // ====================== 核心躲避逻辑 ======================
    // 1. 左右边缘：只做轻微防卡墙，不主动横向移动
    if (isLeftDanger) {
      moveX = 0.5; // 轻推防卡左墙
    } else if (isRightDanger) {
      moveX = -0.5; // 轻推防卡右墙
    } else {
      // 中间区域：正常横向远离敌人
      moveX = me.position.x > av.position.x ? 1 : -1;
    }

    // 2. 垂直方向（上下）：边缘区域 → 全力拉扯；中间区域 → 正常躲避
    if (isLeftDanger || isRightDanger) {
      // 贴墙战术：狂暴上下跑
      moveZ = me.position.z > av.position.z ? 2.2 : -2.2;

      // 仅在贴死上下边界时回拉
      if (isTopDanger) moveZ = 2.2;
      if (isBottomDanger) moveZ = -2.2;
    } else {
      // 中间区域正常躲避
      if (isTopDanger) {
        moveZ = 2.0;
        if (me.position.z < trueTop + 40) this.wanted_jumping();
      } else if (isBottomDanger) {
        moveZ = -2.0;
        if (me.position.z > trueBottom - 40) this.wanted_jumping();
      } else {
        moveZ = me.position.z > av.position.z ? 1 : -1;
      }
    }

    // 水平方向
    if (moveX > 0.3) c.key_down(GK.R).key_up(GK.R);
    else if (moveX < -0.3) c.key_down(GK.L).key_up(GK.L);
    else c.key_up(GK.R, GK.L);

    // 垂直方向
    if (moveZ > 0.3) c.key_down(GK.D).key_up(GK.U);
    else if (moveZ < -0.3) c.key_down(GK.U).key_up(GK.D);
    else c.key_up(GK.U, GK.D);

    // 格挡处理
    if (this.handle_block()) return;
  }
}