import type { NoEmitCallbacks } from "../../base/NoEmitCallbacks";
import type { IPointingsCallback } from "./IPointingsCallback";

export interface IPointings {
  get callback(): NoEmitCallbacks<IPointingsCallback>;
  enabled: boolean;
  dispose(): void;
}
