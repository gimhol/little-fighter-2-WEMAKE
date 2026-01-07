import { IQube } from "../defines";
import { is_num, floor } from "../utils";

function float_scaling_qube(v: Partial<IQube>) {
  ([
    'x', 'y', 'w', 'h', 'z', 'l'
  ] as const).forEach(k => {
    if (is_num(v[k])) v[k] = floor(10000 * v[k]);
  });
}
