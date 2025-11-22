import { IStyle } from "../defines/IStyle";
import { IImageInfo } from "./IImageInfo";

export interface ITextInfo extends IImageInfo {
  text: string;
  style: IStyle
}
