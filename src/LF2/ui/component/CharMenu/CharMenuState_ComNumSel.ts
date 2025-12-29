import type { UINode } from "../../UINode";
import type { CharMenuLogic } from "./CharMenuLogic";
import { CharMenuState } from "./CharMenuState";
import { CharMenuState_Base } from "./CharMenuState_Base";

export class CharMenuState_ComNumSel extends CharMenuState_Base {
  protected how_many_computer?: UINode;
  constructor(owner: CharMenuLogic) {
    super(CharMenuState.ComNumSel, owner);
  }
  override enter() {
    this.how_many_computer = this.owner.node.root.search_child("how_many_computer");
    this.how_many_computer?.set_visible(true);
  }
  override update(dt: number) {
    if (!this.how_many_computer?.visible) return CharMenuState.GameSetting;
  }
  override leave() {
    this.how_many_computer?.set_visible(true);
  }
}
