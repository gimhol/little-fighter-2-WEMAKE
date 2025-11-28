import { new_team } from "../../base";
import { Defines, EntityGroup } from "../../defines";
import { Factory } from "../../entity/Factory";
import IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_character } from "../../entity/type_check";
import { traversal } from "../../utils/container_help/traversal";
import { floor } from "../../utils/math/base";
import { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";

export class DemoModeLogic extends UIComponent implements IEntityCallbacks {
  static override readonly TAG = 'DemoModeLogic'
  score_board!: UINode
  time: number = 0;
  override on_start(): void {
    super.on_start?.();
    this.score_board = this.node.find_child("score_board")!

    const bg_data = this.lf2.random_get(this.lf2.datas.backgrounds);
    if (bg_data) this.lf2.change_bg(bg_data);

    const character_datas = this.lf2.datas.get_characters_of_group(
      EntityGroup.Regular,
    );
    const player_count = floor(this.lf2.random_in(2, 8));
    const player_teams: string[] = [];

    for (let i = 0; i < player_count; i++) {
      player_teams.push(new_team());
    }
    this.world.paused = false;
    switch (player_count) {
      case 4: {
        if (this.lf2.random_take([0, 1])) {
          player_teams.fill(Defines.TeamEnum.Team_1, 0, 2);
          player_teams.fill(Defines.TeamEnum.Team_2, 2, 4);
        }
        break;
      }
      case 6: {
        switch (this.lf2.random_take([0, 1, 2])) {
          case 1: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 3);
            player_teams.fill(Defines.TeamEnum.Team_2, 3, 6);
            break;
          }
          case 2: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 2);
            player_teams.fill(Defines.TeamEnum.Team_2, 2, 4);
            player_teams.fill(Defines.TeamEnum.Team_3, 4, 6);
            break;
          }
        }
        break;
      }
      case 8: {
        switch (this.lf2.random_take([0, 1, 2])) {
          case 1: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 4);
            player_teams.fill(Defines.TeamEnum.Team_2, 4, 8);
            break;
          }
          case 2: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 2);
            player_teams.fill(Defines.TeamEnum.Team_2, 2, 4);
            player_teams.fill(Defines.TeamEnum.Team_3, 4, 6);
            player_teams.fill(Defines.TeamEnum.Team_4, 6, 8);
            break;
          }
        }
        break;
      }
    }
    const player_infos = Array.from(this.lf2.players.values());
    for (let i = 0; i < player_count; i++) {
      const player = player_infos[i]!;
      if (!player) continue;

      const character_data = this.lf2.random_take(character_datas);
      if (!character_data) continue;

      const creator = Factory.inst.get_entity_creator(character_data.type);
      if (!creator) return;

      const character = creator(this.world, character_data);
      character.name = "com";
      character.team = player_teams.shift() ?? new_team();
      character.facing = this.lf2.random_get([1, -1] as const)!;
      character.callbacks.add(this);
      character.key_role = true;

      const { far, near, left, right } = this.lf2.world.bg;

      character.ctrl = Factory.inst.get_ctrl(
        character_data.id,
        player.id,
        character,
      );
      character.position.z = this.lf2.random_in(far, near);
      character.position.x = this.lf2.random_in(left, right);
      character.blinking = this.world.begin_blink_time;
      character.attach();
    }
  }
  override on_stop(): void {
    super.on_stop?.();
    for (const [, v] of this.lf2.player_characters) {
      v.callbacks.del(this);
    }
  }

  on_dead() {
    // 各队伍存活计数
    const player_teams: { [x in string]?: number } = {};

    for (const [, f] of this.world.slot_fighters)
      player_teams[f.team] = 0 // 玩家队伍

    for (const e of this.world.entities) {
      if (is_character(e) && e.hp > 0 && player_teams[e.team] !== void 0)
        ++player_teams[e.team]!; // 存活计数++
    }

    // 剩余队伍数
    let team_remains = 0;
    traversal(player_teams, (_, v) => {
      if (v) ++team_remains;
    })

    // 大于一队，继续打
    if (team_remains > 1) return;

    this.lf2.sounds.play_preset("end");
    this.score_board.visible = true;
  }
  override on_show(): void { }
}
