import type { NoEmitCallbacks } from "../../base/NoEmitCallbacks";
import type { IFullScreenCallback } from "./IFullScreenCallback";

export interface IFullScreen<T extends any = any> {
  get callbacks(): NoEmitCallbacks<IFullScreenCallback<T>>;
  get is_fullscreen(): boolean;
  get target(): T | null;
  set target(v: T | null);
  depose(): void;
  enter(target: T): Promise<void>;
  exit(): void;
}
