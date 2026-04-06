import { SpeedCtrl } from "./SpeedCtrl";
import type { SpeedMode } from "./SpeedMode";

export interface IVelocityInfo {
  dvx?: number;
  dvy?: number;
  dvz?: number;
  acc_x?: number;
  acc_y?: number;
  acc_z?: number;
  /** @see {SpeedMode} */
  vxm?: number | SpeedMode;
  /** @see {SpeedMode} */
  vym?: number | SpeedMode;
  /** @see {SpeedMode} */
  vzm?: number | SpeedMode;
  ctrl_x?: number | SpeedCtrl;
  ctrl_y?: number | SpeedCtrl;
  ctrl_z?: number | SpeedCtrl;
}
