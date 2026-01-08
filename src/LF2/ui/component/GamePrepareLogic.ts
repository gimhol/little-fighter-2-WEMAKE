import { Ditto } from "@/LF2/ditto";
import { new_team } from "../../base";
import Invoker from "../../base/Invoker";
import LocalController from "../../controller/LocalController";
import { FacingFlag } from "../../defines";
import { Defines } from "../../defines/defines";
import { Factory } from "../../entity/Factory";
import { BackgroundNameText } from "./BackgroundNameText";
import { CharMenuLogic } from "./CharMenu/CharMenuLogic";
import { StageNameText } from "./StageNameText";
import { UIComponent } from "./UIComponent";
import { ILf2Callback } from "@/LF2/ILf2Callback";

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
  protected _lf2_callbacks: ILf2Callback = {
    on_broadcast: (message) => {
      if (message === 'start_game') return this.start_game();
    }
  }
  override on_start(): void {
    super.on_start?.();
    this.lf2.callbacks.add(this._lf2_callbacks)
  }
  override on_stop(): void {
    this.lf2.change_stage(Defines.VOID_STAGE)
    this.lf2.change_bg(Defines.VOID_BG)
    this.lf2.callbacks.del(this._lf2_callbacks)
  }
  start_game() {
    const char_menu_logic = this.node.search_component(CharMenuLogic)
    if (!char_menu_logic) return;
    const { far, near, left, right } = this.lf2.world.bg;
    for (const [player, slot_info] of char_menu_logic.players) {
      const { fighter: fighter_data } = slot_info;
      if (!fighter_data) {
        Ditto.warn(`[${GamePrepareLogic.TAG}::start_game] failed to create fighter. figher data: ${fighter_data}`);
        debugger;
        continue;
      }

      const fighter = Factory.inst.create_entity(fighter_data.type, this.world, fighter_data)
      if (!fighter) {
        Ditto.warn(`[${GamePrepareLogic.TAG}::start_game] failed to create fighter. figher data: ${fighter_data}`);
        debugger;
        continue;
      }
      fighter.name = player.name;
      fighter.team = slot_info.team || new_team();
      fighter.facing = this.lf2.random_get([FacingFlag.Left, FacingFlag.Right])!;
      if (player.is_com) {
        fighter.ctrl = Factory.inst.create_ctrl(fighter_data.id, player.id, fighter);
      } else {
        fighter.ctrl = new LocalController(player.id, fighter);
      }
      fighter.set_position(
        this.lf2.random_in(left, right),
        void 0,
        this.lf2.random_in(far, near)
      )
      fighter.blinking = this.world.begin_blink_time;
      fighter.attach();
    }
    const stage_name_text = this.node.root.search_component(
      StageNameText,
      (v) => v.node.visible && !v.node.disabled,
    );
    const background_name_text = this.node.root.search_component(
      BackgroundNameText,
      (v) => v.node.visible && !v.node.disabled,
    );
    if (stage_name_text) this.lf2.change_stage(stage_name_text.stage);
    else if (background_name_text) this.lf2.change_bg(background_name_text.background);
    if (stage_name_text) this.lf2.push_ui("stage_mode_page");
    else this.lf2.push_ui("vs_mode_page");
  }
}

