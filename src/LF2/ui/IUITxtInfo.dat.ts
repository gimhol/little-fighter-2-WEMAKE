import { IStyle } from "../defines/IStyle";


export interface IUITxtInfo {
  i18n?: string;
  value?: string;
  style?: IStyle | string;
}
export interface ICookedUITxtInfo {
  i18n: string;
  style: IStyle;
}
