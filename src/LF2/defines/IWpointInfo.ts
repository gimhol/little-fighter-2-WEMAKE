import { IQubePair } from "./IQubePair";
import { WpointKind } from "./WpointKind";

export interface IWpointInfo {
  kind: number | WpointKind;
  x: number;
  y: number;
  z: number;
  weaponact: string;
  attacking?: string;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  indicator_info?: IQubePair;
}
