import { StateEnum, WeaponType, type IFrameInfo } from "../defines";
import { TeamEnum } from "../defines/TeamEnum";
import type { Entity } from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Lying extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Lying) {
    super(state)
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    e.ctrl.reset_key_list();
    const holding = e.holding
    if (holding) e.drop_holding();
    if (holding?.data.base.type === WeaponType.Heavy)
      holding.team = e.team;
    e.toughness = e.toughness_max;
    e.toughness_resting = 0;
    if (e.hp <= 0) this.on_dead(e)
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    if (e.dead_join && e.hp <= 0) {
      e.motionless = 30
      e.invulnerable = 30
      e.hp = e.hp_r = e.hp_max = (e.dead_join.hp ?? e.hp_max);
      e.team = (e.dead_join.team ?? TeamEnum.Team_1);
      e.lf2.world.etc(e.position.x, e.position.y, e.position.z, '6')
      e.outline_color = void 0
      e.dead_join = null;
      e.chasing = null
    }
    if (e.key_role) { // 关键角色起身的闪烁无敌时间
      e.blinking = e.world.lying_blink_time;
    }
  }
  override on_dead(e: Entity): void {
    const player_teams = new Set<string>()
    for (const [, f] of e.world.puppets) {
      player_teams.add(f.team)
    }
    if (e.reserve) --e.reserve;
    if (e.reserve && player_teams.has(e.team)) {
      // 玩家队伍的复活到玩家附近。
      e.blink_and_respawn(e.world.gone_blink_time);
    } else if (e.dead_join) {
      // 死亡后加入
    } else if (e.dead_gone) {
      // 非玩家槽的角色在被击败时，闪烁着离开了这个世界
      e.blink_and_gone(e.world.gone_blink_time);
    }
  }
  override find_frame_by_id(e: Entity, id: string | undefined): IFrameInfo | undefined {
    if (
      e.hp <= 0 &&
      e.position.y <= e.ground_y &&
      e.frame.state === StateEnum.Lying &&
      !e.dead_join
    ) {
      return e.frame;
    }
  }
}
