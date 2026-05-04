import { AGK, GK, StateEnum } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { abs, round_float } from "../../utils";
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

    if (this.handle_defends()) return;
    if (this.handle_bot_actions()) return;

    if (!av) return BotStateEnum.Idle;
    if (en && manhattan_xz(me, av) > manhattan_xz(me, en)) {
      return BotStateEnum.Chasing;
    }

    let av_x = av.position.x;
    let av_z = av.position.z;
    const me_x = me.position.x;
    const me_z = me.position.z;

    if (c.is_leave_avoid_zone(av)) {
      c.key_up(...AGK);
      return BotStateEnum.Idle;
    }
    
    const { player_l, player_r, enemy_l, enemy_r, team } = this.stage;
    const is_player = me.team !== team;
    const l = is_player ? player_l : enemy_l;
    const r = is_player ? player_r : enemy_r;

    const av_edge_l = l + 80;
    const av_edge_r = r - 80;
    const av_edge_b = c.world.near - 35;
    const av_edge_t = c.world.far + 35;

    const av_danger_l = l + 120;
    const av_danger_r = r - 120;
    const av_danger_b = c.world.near - 60;
    const av_danger_t = c.world.far + 60;

    let z_forwrd_key: GK;
    if (av_z > av_edge_b)  // enmey reach bottom edge
      z_forwrd_key = GK.U
    else if (av_z < av_edge_t)  // enmey reach top edge
      z_forwrd_key = GK.D
    else if (av_z === me_z)    // same? make offset
      z_forwrd_key = (av_z + av.facing) > me_z ? GK.U : GK.D
    else
      z_forwrd_key = av_z > me_z ? GK.U : GK.D

    let x_forwrd_key: GK;
    if (av_x > av_edge_r)       // enmey reach right edge
      x_forwrd_key = GK.L
    else if (av_x < av_edge_l)  // enmey reach left edge
      x_forwrd_key = GK.R
    else if (av_x === me_x) // same? make offset
      x_forwrd_key = (av_x + av.facing) > me_x ? GK.L : GK.R;
    else
      x_forwrd_key = av_x > me_x ? GK.L : GK.R;

    const in_danger_x = (av_x > av_danger_r && me_x > av_edge_r && av_x < me_x) !== (av_x < av_danger_l && me_x < av_edge_l && av_x > me_x)
    const in_danger_z = (av_z > av_danger_b && me_z > av_edge_b && av_z < me_z) !== (av_z < av_danger_t && me_x < av_edge_t && av_z > me_z)
    const me_in_danger = in_danger_x && in_danger_z;
    let is_jump = me_in_danger ? this.wanted_jumping() : this.random_jumping()

    if (me.frame.state === StateEnum.Running && in_danger_x && !is_jump) {
      // 停跑很容易被攻击，这里跳
      c.click(GK.j);
      is_jump = true
    }
    if (me.frame.state === StateEnum.Jump || is_jump) {
      if (in_danger_z && me_z > av_edge_b) z_forwrd_key = GK.U;
      if (in_danger_z && me_z < av_edge_t) z_forwrd_key = GK.D;
    }

    let z_backward_key = z_forwrd_key == GK.D ? GK.U : GK.D
    let x_backward_key = x_forwrd_key == GK.L ? GK.R : GK.L;

    const run_desire = round_float(
      100 * me.world.difficulty +
      400 * (200 - abs(me_x - av_x)) / 200 +
      (me_in_danger ? 100 * me.world.difficulty : 0)
    );
    if (c.desire('run_avoiding') < run_desire) {
      c.dbl_click(x_forwrd_key).key_up(x_backward_key)
    } else {
      c.key_down(x_forwrd_key)
      c.key_up(x_backward_key)
    }
    c.key_down(z_forwrd_key)
    c.key_up(z_backward_key)
  }
}