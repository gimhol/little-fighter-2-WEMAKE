import { Ditto } from "@/LF2/ditto";
import { ILf2Callback } from "@/LF2/ILf2Callback";
import { new_team } from "../../base";
import LocalController from "../../controller/LocalController";
import { FacingFlag, TeamEnum } from "../../defines";
import { Defines } from "../../defines/defines";
import { Factory } from "../../entity/Factory";
import { BackgroundSwitcher } from "./BackgroundSwitcher";
import { CharMenuLogic } from "./CharMenu/CharMenuLogic";
import { StageSwitcher } from "./StageSwitcher";
import { UIComponent } from "./UIComponent";

export class GamePrepareLogic extends UIComponent {
  static override readonly TAG = 'GamePrepareLogic'
  get game_mode(): string { return this.args[0] || ''; }

  override on_resume(): void {
    super.on_resume();
    const background_row = this.node.search_child("background_row")!;
    const stage_row = this.node.search_child("stage_row")!;
    const char_menu_logic = this.node.search_component(CharMenuLogic)
    if (this.game_mode === "stage_mode") {
      stage_row.set_visible(true).set_disabled(false);
      background_row.set_visible(false).set_disabled(true);
      if (char_menu_logic) char_menu_logic.teams = [TeamEnum.Team_1]
      if (char_menu_logic) char_menu_logic.min_player = 1;
    } else {
      background_row.set_visible(true).set_disabled(false);
      stage_row.set_visible(false).set_disabled(true);
      if (char_menu_logic) char_menu_logic.min_player = 2;
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

    const stage_name_text = this.node.root.search_component(
      StageSwitcher,
      (v) => v.node.visible && !v.node.disabled,
    );
    const background_name_text = this.node.root.search_component(
      BackgroundSwitcher,
      (v) => v.node.visible && !v.node.disabled,
    );
    if (stage_name_text) this.lf2.change_stage(stage_name_text.stage);
    else if (background_name_text) this.lf2.change_bg(background_name_text.background);
    const { far, near, left, right } = this.lf2.world.bg;

    let cam_x = this.lf2.mt.range(left, right - Defines.MODERN_SCREEN_WIDTH)
    this.world.renderer.cam_x = cam_x
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
      fighter.facing = this.lf2.mt.pick([FacingFlag.Left, FacingFlag.Right])!;
      if (player.is_com) {
        fighter.ctrl = Factory.inst.create_ctrl(fighter_data.id, player.id, fighter);
      } else {
        fighter.ctrl = new LocalController(player.id, fighter);
      }
      fighter.set_position(
        this.lf2.mt.range(
          (cam_x + 1 * Defines.MODERN_SCREEN_WIDTH / 3),
          (cam_x + 2 * Defines.MODERN_SCREEN_WIDTH / 3)
        ),
        void 0,
        this.lf2.mt.range(far, near)
      )
      fighter.blinking = this.world.begin_blink_time;
      fighter.attach();
    }
    if (stage_name_text) this.lf2.push_ui("stage_mode_page");
    else this.lf2.push_ui("vs_mode_page");
  }
}

