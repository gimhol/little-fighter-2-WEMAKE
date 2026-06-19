import type { IStyle } from "../../defines/IStyle";
import type { IImageInfo } from "./IImageInfo";

export interface ITextInfo extends IImageInfo {
  text: string;
  style: IStyle
}
