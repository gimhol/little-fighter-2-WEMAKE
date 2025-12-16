import { LF2 } from "../LF2";
import type { Unsafe } from "../utils";
import { find_ui_template } from "./find_ui_template";
import type { ICookedUIInfo } from "./ICookedUIInfo";
import type { IUIInfo, TComponentInfo } from "./IUIInfo.dat";

export async function read_ui_template(lf2: LF2, raw_info: IUIInfo, parent: ICookedUIInfo | undefined): Promise<IUIInfo> {
  const { template: template_name, ...remain_raw_info } = raw_info;
  if (!template_name) return raw_info;
  const raw_template: Unsafe<IUIInfo> = await find_ui_template(lf2, parent, template_name);

  const component: TComponentInfo[] = [];
  let c = raw_template.component
  if (c?.length) component.push(...c);

  c = remain_raw_info.component
  if (c?.length) component.push(...c);

  if (lf2.dev === true) {
    c = raw_template.dev_component
    if (c?.length) component.push(...c);
    c = remain_raw_info.dev_component
    if (c?.length) component.push(...c);
  }
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
