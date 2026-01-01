import { UINode } from "../../UINode";
import { CharMenuLogic } from "./CharMenuLogic";
import { CharMenuState } from "./CharMenuState";
import { CharMenuState_Base } from "./CharMenuState_Base";

export class CharMenuState_GameSetting extends CharMenuState_Base {
  protected game_settings_menu: UINode | undefined;
  constructor(owner: CharMenuLogic) {
    super(CharMenuState.GameSetting, owner);
  }
  override enter(): void {
    this.owner.update_slots()
    this.game_settings_menu = this.owner.node.root.search_child("game_settings_menu");
    this.game_settings_menu?.set_visible(true);
  }
  override leave(): void {
    this.game_settings_menu?.set_visible(false);
  }
}
