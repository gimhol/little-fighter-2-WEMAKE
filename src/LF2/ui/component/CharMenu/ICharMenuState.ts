import type { IState } from "@/LF2/base";
import type { IUIKeyEvent } from "../../IUIKeyEvent";
import type { CharMenuState } from "./CharMenuState";

export interface ICharMenuState extends IState<CharMenuState> {
  on_key_down?(e: IUIKeyEvent): void;
}
