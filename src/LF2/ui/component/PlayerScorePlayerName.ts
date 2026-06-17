
import { TextInfo } from "@/LF2/ditto/image/TextInfo";
import { UIComponent } from "./UIComponent";
import { PlayerScore } from "./PlayerScore";
import { Defines, Entity, is_bot_ctrl, is_human_ctrl, IStyle, TeamEnum } from "@/LF2";


export class PlayerScorePlayerName extends UIComponent {
  static override readonly TAGS: string[] = ["PlayerScorePlayerName"];
  private fighter?: Entity;

  override on_show(): void {
    const fighter = this.fighter = this.node.lookup_component(PlayerScore)?.fighter;
    let name: string = '-';
    if (fighter) {
      const { ctrl } = fighter;
      if (is_human_ctrl(ctrl) || is_bot_ctrl(ctrl)) {
        name = ctrl.player?.name || '-';
      }
    }
    const team = this.fighter?.team;
    const team_info = Defines.TeamInfoMap[team as TeamEnum] ?? Defines.TeamInfoMap[TeamEnum.Independent]
    Object.assign(this.node, {
      outlineColor: team_info.txt_outline_color,
      outlineWidth: 2,
      outlineAlpha: 1,
    })
    const style: IStyle = {
      font: "12px Arial",
      fill_style: team_info.txt_color
    };
    this.node.text = new TextInfo({ text: name, style });
  }
}
