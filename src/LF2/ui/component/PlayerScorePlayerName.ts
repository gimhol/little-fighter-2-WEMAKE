
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";
import { PlayerScore } from "./PlayerScore";
import { Defines, Entity, is_bot_ctrl, is_human_ctrl, IStyle, TeamEnum } from "@/LF2";


export class PlayerScorePlayerName extends UIComponent {
  static override readonly TAG = 'PlayerScorePlayerName';
  private fighter?: Entity;

  private readonly txt_loader = new UITextLoader(() => this.node).set_style(() => {
    const team = this.fighter?.team;
    const team_info = Defines.TeamInfoMap[team as TeamEnum] ?? Defines.TeamInfoMap[TeamEnum.Independent]
    const ret: IStyle = {
      font: "12px Arial",
      fill_style: team_info.txt_color,
      back_style: {
        font: "12px Arial",
        stroke_style: team_info.txt_shadow_color,
        line_width: 2
      }
    }
    return ret;
  }).ignore_out_of_date();

  override on_show(): void {
    super.on_show?.()

    const fighter = this.fighter = this.node.lookup_component(PlayerScore)?.fighter;
    let name: string = '-';
    if (fighter) {
      const { ctrl } = fighter;
      if (is_human_ctrl(ctrl) || is_bot_ctrl(ctrl)) {
        name = ctrl.player?.name || '-';
      }
    }
    this.txt_loader.set_text([name])

  }
}
