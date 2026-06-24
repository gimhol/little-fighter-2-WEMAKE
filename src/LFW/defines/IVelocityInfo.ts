import { SpeedCtrl } from "./SpeedCtrl";
import type { SpeedMode } from "./SpeedMode";
import { fields, flt, int } from "../fields";

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

export const velocity_info_fields = fields<Partial<IVelocityInfo>>({
  dvx: flt('X速度增量'),
  dvy: flt('Y速度增量'),
  dvz: flt('Z速度增量'),
  acc_x: flt('X加速度'),
  acc_y: flt('Y加速度'),
  acc_z: flt('Z加速度'),
  vxm: int('X最大速度'),
  vym: int('Y最大速度'),
  vzm: int('Z最大速度'),
  ctrl_x: int('X速度控制'),
  ctrl_y: int('Y速度控制'),
  ctrl_z: int('Z速度控制'),
});
