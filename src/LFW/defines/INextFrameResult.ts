import type { IFrameInfo } from "./IFrameInfo";
import type { INextFrame } from "./INextFrame";

export interface INextFrameResult {
  frame?: IFrameInfo;
  which: INextFrame;
}
