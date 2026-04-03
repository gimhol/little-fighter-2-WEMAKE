import { ISchema } from "@/LF2/defines";
import { IWorldCallbacks } from "@/LF2/IWorldCallbacks";
import { make_schema } from "@/LF2/utils/schema";
import { Label } from "./Label";
import { UIComponent } from "./UIComponent";

export interface IFnKeysCountsProps {
  f6?: Label;
  f7?: Label;
  f8?: Label;
  f9?: Label;
  f10?: Label;
}
export class FnKeysCounts extends UIComponent<IFnKeysCountsProps> {
  static override readonly TAG: string = 'FnKeysCounts';
  static override PROPS: ISchema<IFnKeysCountsProps> = make_schema({
    key: "IFnKeysCountsProps",
    type: "object",
    properties: {
      f6: Label,
      f7: Label,
      f8: Label,
      f9: Label,
      f10: Label
    }
  })
  readonly world_cbs: IWorldCallbacks = {
    on_fn_locked_change: (locked) => {
      if (locked) {
        this.node.find_child('fn_key_locked')?.set_visible(true)
        this.node.find_child('fn_key_counts')?.set_visible(false)
      } else {
        this.node.find_child('fn_key_locked')?.set_visible(false)
        this.node.find_child('fn_key_counts')?.set_visible(true)
      }
    },
    on_counts: () => {
      this.node.find_child('fn_key_counts')?.set_visible(true)
      const { f6, f7, f8, f9, f10 } = this.props;
      f6?.set_text(this.world.counts.get('f6') ?? 0)
      f7?.set_text(this.world.counts.get('f7') ?? 0)
      f8?.set_text(this.world.counts.get('f8') ?? 0)
      f9?.set_text(this.world.counts.get('f9') ?? 0)
      f10?.set_text(this.world.counts.get('f10') ?? 0)
    }
  }
  override on_start(): void {
    this.world.callbacks.add(this.world_cbs)
  }
  override on_stop(): void {
    this.world.callbacks.del(this.world_cbs)
  }
}
