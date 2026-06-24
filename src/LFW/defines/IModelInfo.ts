import type { IVector3Like } from "./IVector3Like";
import type { IVector4Like } from "./IVector4Like";
import { any, fields, str } from "../fields";

export interface IModelInfo {
  id: string;
  path: string;
  variants?: string[];
  scale?: Partial<IVector3Like>,
  quaternion?: Partial<IVector4Like>
}

export const model_info_fields = fields<Partial<IModelInfo>>({
  id: str('模型ID'),
  path: str('路径'),
  variants: str('变体', { array: true }),
  scale: any('缩放'),
  quaternion: any('旋转四元数'),
});
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