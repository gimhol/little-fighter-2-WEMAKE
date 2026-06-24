import { fields, int, str } from "../fields";

export interface IFramePictureInfo {
  /** 图片ID */
  tex: string;
  /** 裁剪起点X坐标（像素） */
  x: number;
  /** 裁剪起点Y坐标（像素） */
  y: number;
  /** 宽度（像素） */
  w: number;
  /** 高度（像素） */
  h: number;
  /** 旋转 */
  // r?: number;
  /** 旋转中心x */
  // ox?: number;
  /** 旋转中心y */
  // oy?: number;
}

export const frame_picture_info_fields = fields<IFramePictureInfo>({
  tex: str('图片ID'),
  x: int('裁剪X'),
  y: int('裁剪Y'),
  w: int('宽度'),
  h: int('高度'),
});
