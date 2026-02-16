import type { TNextFrame } from "./INextFrame";
import { IQubePair } from "./IQubePair";

export interface ICpointInfo {
  kind: 1 | 2;
  x?: number;
  y?: number;
  z?: number;
  vaction?: TNextFrame;
  injury?: number;
  hurtable?: 0 | 1;
  decrease?: number;
  throwvx?: number;
  throwvy?: number;
  throwvz?: number;
  /**
   * 被丢者的落地受伤量
   * -1: 抓人者变成被抓者
   * @type {number}
   * @memberof ICpointInfo
   */
  throwinjury?: number;
  fronthurtact?: string;
  backhurtact?: string;
  shaking?: number;

  /*dircontrol*/
  indicator_info?: IQubePair;
}
