import { LF2 } from "../LF2";
import { TextInfo } from "../ditto/image/TextInfo";
import { ICookedUITxtInfo } from "./IUITxtInfo.dat";
export async function ui_load_txt(lf2: LF2, txt: ICookedUITxtInfo): Promise<TextInfo> {
  const value = lf2.string(txt.i18n);
  return lf2.images.load_text(value, txt.style)
}
