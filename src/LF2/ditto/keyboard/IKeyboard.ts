import type { NoEmitCallbacks } from "../../base/NoEmitCallbacks";
import type { IKeyboardCallback } from "./IKeyboardCallback";
export interface IKeyboard {
  readonly callback: NoEmitCallbacks<IKeyboardCallback>;
  is_key_down(key_code: string): boolean;
  axes(index: number): readonly number[];
  dispose(): void;
}
