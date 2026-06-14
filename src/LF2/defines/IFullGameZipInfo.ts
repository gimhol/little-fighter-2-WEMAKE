export interface IGameZipInfo {
  type: string;
  title: string;
  version: number;
  description: string;
  author: string;
}
export interface IFullGameZipInfo extends IGameZipInfo {
  type: "FULL";
  paths: string[];
}