export interface IBaseZipInfo {
  title: string;
  version: number;
  description: string;
  author: string;
}
export interface IGameZipInfo extends IBaseZipInfo {
  type: "FULL";
  paths: string[];
}
export interface IPrelZipInfo extends IBaseZipInfo {
  type: "PREL";
}
export interface IDataZipInfo extends IBaseZipInfo {
  type: "DATA";
}
export type IAnyZipInfo = IGameZipInfo | IPrelZipInfo | IDataZipInfo