import { LF2 } from "../LF2";
import { Unsafe } from "../utils";
import { find_ui_template } from "./find_ui_template";
import { ICookedUIInfo } from "./ICookedUIInfo";
import type { IUIInfo, TComponentInfo } from "./IUIInfo.dat";

export async function read_ui_template(lf2: LF2, raw_info: IUIInfo, parent: ICookedUIInfo | undefined): Promise<IUIInfo> {
  const { template: template_name, ...remain_raw_info } = raw_info;
  if (!template_name) return raw_info;
  const raw_template: Unsafe<IUIInfo> = await find_ui_template(lf2, parent, template_name);
  remain_raw_info.component;

  const component: TComponentInfo[] = [];
  if (Array.isArray(raw_template.component))
    component.push(...raw_template.component);
  else if (raw_template.component)
    component.push(raw_template.component);
  if (Array.isArray(remain_raw_info.component))
    component.push(...remain_raw_info.component);
  else if (remain_raw_info.component)
    component.push(remain_raw_info.component);
  return {
    ...raw_template,
    ...remain_raw_info,
    component,
    values: {
      ...raw_template.values,
      ...remain_raw_info.values
    }
  };
}
read_ui_template.TAG = 'read_ui_template';
