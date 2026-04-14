import { Ditto } from "@/LF2/ditto";
import { StatBarType } from "@/LF2/entity/StatBarType";
import { ILf2Callback } from "@/LF2/ILf2Callback";
import { make_schema } from "@/LF2/utils";
import { new_team } from "../../base";
import LocalController from "../../controller/LocalController";
import { Defines, FacingFlag, ISchema, TeamEnum } from "../../defines";
import { BackgroundSwitcher } from "./BackgroundSwitcher";
import { CharMenuLogic } from "./CharMenu/CharMenuLogic";
import { StageSwitcher } from "./StageSwitcher";
import { UIComponent } from "./UIComponent";
export interface IGamePrepareLogicProps {
  stage_switcher?: StageSwitcher,
  bg_switcher?: BackgroundSwitcher,
}
export class GamePrepareLogic extends UIComponent<IGamePrepareLogicProps> {
  static override readonly TAG = 'GamePrepareLogic'
  static override readonly PROPS: ISchema<any> = make_schema({
    key: 'GamePrepareLogic',
    type: 'object',
    properties: {
      stage_switcher: StageSwitcher,
      bg_switcher: BackgroundSwitcher,
    }
  })
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

    const { bg_switcher, stage_switcher } = this.props
    if (stage_switcher?.node.visible && !stage_switcher.node.disabled)
      this.lf2.change_bg(stage_switcher.stage.bg);
    else if (bg_switcher?.node.visible && !bg_switcher.node.disabled)
      this.lf2.change_bg(bg_switcher.background);
    const { far, near, left, right } = this.lf2.world.bg;

    const is_stage_mode = this.game_mode === "stage_mode"
    let cam_x = is_stage_mode ? 0 : this.lf2.mt.range(left, right - Defines.MODERN_SCREEN_WIDTH)

    this.world.renderer.cam_x = cam_x

    for (const [player, slot_info] of char_menu_logic.players) {
      const { fighter: fighter_data } = slot_info;
      if (!fighter_data) {
        Ditto.warn(`[${GamePrepareLogic.TAG}::start_game] failed to create fighter. figher data: ${fighter_data}`);
        debugger;
        continue;
      }

      const fighter = this.lf2.factory.create_entity(this.world, fighter_data)
      if (!fighter) {
        Ditto.warn(`[${GamePrepareLogic.TAG}::start_game] failed to create fighter. figher data: ${fighter_data}`);
        debugger;
        continue;
      }
      fighter.name = player.name;
      fighter.team = slot_info.team || new_team();
      fighter.stat_bar_type = StatBarType.UI
      fighter.facing = is_stage_mode ?
        FacingFlag.Right :
        this.lf2.mt.pick([FacingFlag.Left, FacingFlag.Right])!;
      if (player.is_com) {
        fighter.ctrl = this.lf2.factory.create_ctrl(fighter_data.id, player.id, fighter);
      } else {
        fighter.ctrl = new LocalController(player.id, fighter);
      }
      const x = is_stage_mode ?
        this.lf2.mt.range(
          (cam_x + 40),
          (cam_x + 80)
        ) : this.lf2.mt.range(
          (cam_x + 1 * Defines.MODERN_SCREEN_WIDTH / 3),
          (cam_x + 2 * Defines.MODERN_SCREEN_WIDTH / 3)
        )
      fighter.set_position(x, void 0, this.lf2.mt.range(far, near))
      fighter.blinking = this.world.begin_blink_time;
      if (this.game_mode === "vs_mode")
        fighter.mp = (fighter.mp_max * 2 / 5)
      fighter.attach();
    }
    if (stage_switcher) this.lf2.change_stage(stage_switcher.stage);

    if (stage_switcher) this.lf2.push_ui("stage_mode_page");
    else this.lf2.push_ui("vs_mode_page");


  }
}

