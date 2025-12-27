import { new_team } from "../../base";
import FSM, { IState } from "../../base/FSM";
import Invoker from "../../base/Invoker";
import LocalController from "../../controller/LocalController";
import { EntityGroup, FacingFlag } from "../../defines";
import { Defines } from "../../defines/defines";
import { Entity } from "../../entity/Entity";
import { Factory } from "../../entity/Factory";
import { ceil, max } from "../../utils";
import { map_no_void } from "../../utils/container_help/map_no_void";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { BackgroundNameText } from "./BackgroundNameText";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { SlotSelLogic, SlotSelStatus } from "./SlotSelLogic";
import { StageNameText } from "./StageNameText";
import { UIComponent } from "./UIComponent";


export class GamePrepareLogic extends UIComponent {
  static override readonly TAG = 'GamePrepareLogic'
  get game_mode(): string { return this.args[0] || ''; }
  protected _unmount_jobs = new Invoker();
  override on_resume(): void {
    super.on_resume();
    const background_row = this.node.search_child("background_row")!;
    const stage_row = this.node.search_child("stage_row")!;
    if (this.game_mode === "stage_mode") {
      stage_row.set_visible(true).set_disabled(false);
      background_row.set_visible(false).set_disabled(true);
    } else {
      background_row.set_visible(true).set_disabled(false);
      stage_row.set_visible(false).set_disabled(true);
    }
  }

  start_game() {
    // const { far, near, left, right } = this.lf2.world.bg;

    // for (const { player } of this.slots) {
    //   if (!player?.joined) continue;
    //   const character_data = this.lf2.datas.find_character(player.character);
    //   if (!character_data) continue;
    //   const character = new Entity(this.world, character_data);
    //   character.name = player.is_com ? "com" : player.name;
    //   character.team = player.team || new_team();
    //   character.facing = this.lf2.random_get([FacingFlag.Left, FacingFlag.Right])!;

    //   if (player.is_com) {
    //     character.ctrl = Factory.inst.get_ctrl(
    //       character_data.id,
    //       player.id,
    //       character
    //     );
    //   } else {
    //     character.ctrl = new LocalController(player.id, character);
    //   }
    //   character.position.z = this.lf2.random_in(far, near);
    //   character.position.x = this.lf2.random_in(left, right);
    //   character.blinking = this.world.begin_blink_time;
    //   character.attach();
    // }

    // const stage_name_text = this.node.root.search_component(
    //   StageNameText,
    //   (v) => v.node.visible && !v.node.disabled,
    // );
    // const background_name_text = this.node.root.search_component(
    //   BackgroundNameText,
    //   (v) => v.node.visible && !v.node.disabled,
    // );
    // if (stage_name_text) this.lf2.change_stage(stage_name_text.stage);
    // else if (background_name_text) this.lf2.change_bg(background_name_text.background);
    // if (stage_name_text) this.lf2.push_ui("stage_mode_page");
    // else this.lf2.push_ui("vs_mode_page");
  }

  override on_stop(): void {
    this.lf2.change_stage(Defines.VOID_STAGE)
    this.lf2.change_bg(Defines.VOID_BG)
  }
}

