import type { IDoubleClickSnapshot } from "./IDoubleClickSnapshot";
import type { IControllerDoubleClickData } from "./IControllerDoubleClickData";

export interface IControllerDoubleClicksSnapshot {
  L: IDoubleClickSnapshot<IControllerDoubleClickData>;
  R: IDoubleClickSnapshot<IControllerDoubleClickData>;
  U: IDoubleClickSnapshot<IControllerDoubleClickData>;
  D: IDoubleClickSnapshot<IControllerDoubleClickData>;
  d: IDoubleClickSnapshot<IControllerDoubleClickData>;
  j: IDoubleClickSnapshot<IControllerDoubleClickData>;
  a: IDoubleClickSnapshot<IControllerDoubleClickData>;
}
