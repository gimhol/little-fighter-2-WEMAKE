import { clamp } from "@/LF2/utils";
import { IUIKeyEvent } from "../../IUIKeyEvent";
import type { UINode } from "../../UINode";
import type { CharMenuLogic } from "./CharMenuLogic";
import { CharMenuState } from "./CharMenuState";
import { CharMenuState_Base } from "./CharMenuState_Base";

export class CharMenuState_ComNumSel extends CharMenuState_Base {
  protected how_many_coms?: UINode;
  protected com_num: number = -1;
  protected btns: UINode[] = [];
  constructor(owner: CharMenuLogic) {
    super(CharMenuState.ComNumSel, owner);
  }
  override enter() {
    this.how_many_coms = this.owner.node.root.search_child("how_many_computer");
    this.how_many_coms?.set_visible(true);
    this.btns = [
      this.how_many_coms!.search_child(`com_num_0`)!,
      this.how_many_coms!.search_child(`com_num_1`)!,
      this.how_many_coms!.search_child(`com_num_2`)!,
      this.how_many_coms!.search_child(`com_num_3`)!,
      this.how_many_coms!.search_child(`com_num_4`)!,
      this.how_many_coms!.search_child(`com_num_5`)!,
      this.how_many_coms!.search_child(`com_num_6`)!,
      this.how_many_coms!.search_child(`com_num_7`)!,
    ]
    const { min_coms, max_coms } = this.owner;
    for (let i = 0; i < this.btns.length; i++) {
      const btn = this.btns[i];
      btn.disabled = !(i >= min_coms && i <= max_coms)
      if (i === min_coms) btn.focused = true;
    }
    let num = 0
    for (const [p] of this.owner.prev_players)
      if (p.is_com) ++num;
    num = clamp(num, min_coms, max_coms)
    if (this.btns[num])
      this.btns[num].focused = true
    this.com_num = -1;
  }
  override update(dt: number) {
    if (!this.how_many_coms?.visible) return CharMenuState.GameSetting;
    if (this.com_num > 0) this.owner.fsm.use(CharMenuState.ComSel)
    if (this.com_num == 0) this.owner.fsm.use(CharMenuState.GameSetting)
  }
  override leave() {
    this.how_many_coms?.set_visible(false);
    this.com_num = -1;
  }
  override on_key_down(e: IUIKeyEvent): void {
    if (e.game_key === 'a') {
      const which = this.owner.node.root.focused_node?.id?.match(/com_num_(\d)/)?.at(1)
      this.com_num = this.owner.com_num = Number(which)
    }
  }
}
