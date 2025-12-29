import type { LF2 } from "@/LF2/LF2";
import type { IUIKeyEvent } from "../../IUIKeyEvent";
import type { CharMenuLogic } from "./CharMenuLogic";
import type { CharMenuState } from "./CharMenuState";
import type { ICharMenuState } from "./ICharMenuState";

export class CharMenuState_Base implements Required<ICharMenuState> {
  readonly key: CharMenuState;
  readonly owner: CharMenuLogic;
  readonly lf2: LF2;
  constructor(key: CharMenuState, owner: CharMenuLogic) {
    this.key = key;
    this.owner = owner;
    this.lf2 = owner.lf2;
  }
  on_key_down(e: IUIKeyEvent): void { }
  update(dt: number): void | CharMenuState | undefined { }
  enter(): void { }
  leave(): void { }
}
