import { Entity, IEntityCallbacks, is_character } from "../../entity";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import { max } from "../../utils";
import { Times } from "../utils";
import { IFighterSumInfo, IPlayerSumInfo } from "./IFighterSumInfo";
import { ITeamSumInfo } from "./ITeamSumInfo";
import { make_fighter_sum } from "./make_fighter_sum";
import { make_player_sum } from "./make_player_sum";
import { make_team_sum_info } from "./make_team_sum_info";
import { UIComponent } from "./UIComponent";

export class SummaryLogic extends UIComponent {
  static override readonly TAG: string = 'SummaryLogic';
  readonly fighters = new Map<string, IFighterSumInfo>();
  readonly players = new Map<string, IPlayerSumInfo>();
  readonly teams = new Map<string, ITeamSumInfo>();
  readonly losing_teams = new Set<ITeamSumInfo>();

  team_sum(team: string): ITeamSumInfo {
    let ret = this.teams.get(team)
    if (!ret) this.teams.set(team, ret = make_team_sum_info(team))
    return ret;
  }
  fighter_sum(entity: Entity): IFighterSumInfo {
    let ret = this.fighters.get(entity.data.id)
    if (!ret) this.fighters.set(entity.data.id, ret = make_fighter_sum(entity.data))
    return ret;
  }
  player_sum(entity: Entity): IFighterSumInfo {
    let ret = this.players.get(entity.ctrl.player_id)
    if (!ret) this.players.set(entity.ctrl.player_id, ret = make_player_sum(entity))
    return ret;
  }
  private _world_cb: IWorldCallbacks = {
    on_fighter_del: e => this.on_fighter_del(e),
    on_fighter_add: e => this.on_fighter_add(e),
  };
  private _fighter_cb: IEntityCallbacks = {
    on_damage_sum_changed: (e, value, prev) => {
      // 母体还在，避免重算
      if (e.emitter?.is_attach === true) return;
      this.team_sum(e.team).damages += value - prev;
      this.fighter_sum(e).damages += value - prev;
      this.player_sum(e).damages += value - prev;
    },
    on_kill_sum_changed: (e, value, prev) => {
      // 母体还在，避免重算
      if (e.emitter?.is_attach === true) return;
      this.team_sum(e.team).kills += value - prev;
      this.fighter_sum(e).kills += value - prev;
      this.player_sum(e).kills += value - prev;
    },
    on_picking_sum_changed: (e, value, prev) => {
      this.team_sum(e.team).pickings += value - prev;
      this.fighter_sum(e).pickings += value - prev;
      this.player_sum(e).pickings += value - prev;
    },
    on_dead: (e) => {
      // 分身死亡不计算
      if (e.emitter) return;
      const team_sum = this.team_sum(e.team);
      team_sum.deads++;
      team_sum.lives--;
      team_sum.latest_dead_time = this.node.update_times;
      if (team_sum.deads === team_sum.spawns)
        this.losing_teams.add(team_sum)
      this.fighter_sum(e).deads++;
      this.player_sum(e).deads++;
    },
    on_hp_changed: (e, value, prev) => {
      const team_sum = this.team_sum(e.team);
      team_sum.hp += max(value, 0) - prev;
      if (prev <= 0 && value > 0) {
        // 复活
        team_sum.deads--;
        this.fighter_sum(e).deads--;
        this.player_sum(e).deads--;
        team_sum.lives++;
      } else if (prev > value) {
        // 失血
        const diif = prev - value
        team_sum.hp_lost += diif;
        this.fighter_sum(e).hp_lost += diif;
        this.player_sum(e).hp_lost += diif;
      }
    },
    on_mp_changed: (e, value, prev) => {
      if (prev > value) {
        const diif = prev - value
        this.team_sum(e.team).mp_usage += diif;
        this.fighter_sum(e).mp_usage += diif;
        this.player_sum(e).mp_usage += diif;
      }
    },
    on_reserve_changed: (e, value, prev) => {
      this.team_sum(e.team).reserve += value - prev;
    },
  };
  on_fighter_add(e: Entity) {
    const team_sum = this.team_sum(e.team)
    team_sum.hp += e.hp;
    team_sum.reserve += e.reserve;
    team_sum.lives++
    if (!e.emitter) { // 忽略分身计数
      team_sum.spawns++;
      this.losing_teams.delete(team_sum);
      this.fighter_sum(e).spawns++;
      this.player_sum(e).spawns++;
    }
    e.callbacks.add(this._fighter_cb);
  }
  on_fighter_del(e: Entity) {
    e.callbacks.del(this._fighter_cb);
  }
  override on_start(): void {
    super.on_start?.();
    for (const e of this.world.entities) {
      if (is_character(e)) {
        this.on_fighter_add(e)
      }
    }
    this.world.callbacks.add(this._world_cb);
  }
  override on_stop(): void {
    super.on_stop?.();
    this.world.callbacks.del(this._world_cb);
  }
  private _refresh_timer = new Times(0, 300)
  private _temps: ITeamSumInfo[] = []
  override update(dt: number): void {
    super.update?.(dt);

    if (this.losing_teams.size) {
      for (const losing_team of this.losing_teams) {
        const is_waiting = this.node.update_times - losing_team.latest_dead_time < 180;
        if (is_waiting) continue;
        losing_team.loses++;
        this._temps.push(losing_team);
      }
    }
    if (this._temps.length) {
      this._temps.forEach(i => this.losing_teams.delete(i))
      this._temps.length = 0;
    }

    if (this._refresh_timer.add()) {
      // NOTE: 计算逻辑似乎有BUG. 故此处每N帧重新计算一些数据
      for (const [, t] of this.teams) {
        t.reserve = 0;
        t.lives = 0;
        t.hp = 0;
      }
      for (const e of this.world.entities) {
        if (!is_character(e)) continue;
        const t = this.team_sum(e.team)
        t.hp += e.hp
        t.reserve += e.reserve
        if (e.hp > 0) t.lives += 1;
      }
    }
  }
}
