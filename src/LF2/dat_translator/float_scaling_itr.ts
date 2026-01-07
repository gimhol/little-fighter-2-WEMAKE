import { IItrInfo } from "../defines";
import { is_num, floor } from "../utils";

export function float_scaling_itr(v: Partial<IItrInfo>) {
  // float_scaling_qube(v)
  ([
    'dvx', 'dvy', 'dvz'
  ] as const).forEach(k => {
    if (is_num(v[k])) v[k] = floor(10000 * v[k]);
  });
}
