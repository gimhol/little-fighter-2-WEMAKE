import { Ditto } from "../ditto";
import { LF2 } from "../LF2";
import { Unsafe } from "../utils";
import { ICookedUIInfo } from "./ICookedUIInfo";
import type { IUIInfo } from "./IUIInfo.dat";

export async function find_ui_template(lf2: LF2, parent: Unsafe<ICookedUIInfo>, template_name: string): Promise<IUIInfo> {
  let raw_template: IUIInfo | undefined = void 0;
  let n: Unsafe<ICookedUIInfo> = parent;
  while (n && !raw_template) {
    raw_template = n.templates?.[template_name];
    n = n.parent;
  }
  if (raw_template) return raw_template;
  try {
    let path = template_name.startsWith('@/') ? template_name.replace('@/', 'builtin_data/launch/') : template_name;
    if (!path.endsWith('.ui.json5')) path += '.ui.json5';
    raw_template = await lf2.import_json<IUIInfo>(path, true).then(r => r[0]);
  } catch (e) {
    Ditto.warn(`[${find_ui_template.TAG}] ui template not found! template_name: ${template_name}, e:${e}`);
  }
  return raw_template || {};
}
find_ui_template.TAG = 'find_ui_template';
