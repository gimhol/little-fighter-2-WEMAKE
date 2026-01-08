import type { NoEmitCallbacks } from "../../base/NoEmitCallbacks";
import type { IKeyboardCallback } from "./IKeyboardCallback";
export interface IKeyboard {
  readonly callback: NoEmitCallbacks<IKeyboardCallback>;
  dispose(): void;
}
