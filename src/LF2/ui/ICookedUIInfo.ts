import { ImageInfo } from "../ditto/image/ImageInfo";
import { TextInfo } from "../ditto/image/TextInfo";
import { IComponentInfo } from "./IComponentInfo";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import type { IUIInfo } from "./IUIInfo.dat";
import { ICookedUITxtInfo } from "./IUITxtInfo.dat";

export interface ICookedUIInfo extends IUIInfo {
  id: string;
  name: string;
  pos: [number, number, number];
  scale: [number, number, number];
  center: [number, number, number];
  parent?: ICookedUIInfo;
  items?: ICookedUIInfo[];
  img_infos: ImageInfo[];
  txt_infos: TextInfo[];
  size: [number, number];
  img: IUIImgInfo[];
  txt: ICookedUITxtInfo[];
  values: { [x in string]?: any };
  component: IComponentInfo[];
}