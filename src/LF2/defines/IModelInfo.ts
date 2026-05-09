import type { IVector3Like } from "./IVector3";
import type { IVector4Like } from "./IVector4Like";
export interface IModelInfo {
  id: string;
  path: string;
  variants?: string[];
  scale?: Partial<IVector3Like>,
  quaternion?: Partial<IVector4Like>
}
/*
cy = cos(yaw * 0.5)
sy = sin(yaw * 0.5)
cp = cos(pitch * 0.5)
sp = sin(pitch * 0.5)
cr = cos(roll * 0.5)
sr = sin(roll * 0.5)
quaternion.x = sr * cp * cy - cr * sp * sy
quaternion.y = cr * sp * cy + sr * cp * sy
quaternion.z = cr * cp * sy - sr * sp * cy
quaternion.w = cr * cp * cy + sr * sp * sy
*/