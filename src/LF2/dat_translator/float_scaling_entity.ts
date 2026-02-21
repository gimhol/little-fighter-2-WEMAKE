import { IEntityData } from "../defines";
import { traversal, is_num, floor } from "../utils";
import { float_scaling_itr } from "./float_scaling_itr";
import { float_scaling_bdy } from "./float_scaling_bdy";

export function float_scaling_entity(ret: IEntityData) {
  traversal(ret.bdy_prefabs, (_, v) => {
    if (v) float_scaling_bdy(v);
  });
  traversal(ret.itr_prefabs, (k, v) => {
    if (v) float_scaling_itr(v);
  });
  traversal(ret.frames, (_, v) => {
    if (!v) return;
    ([
      'dvx', 'dvy', 'dvz', 'acc_x', 'acc_y', 'acc_z', 'ctrl_x', 'ctrl_y',
      'ctrl_z', 'friction_x', 'friction_z', 'gravity'
    ] as const).forEach(k => {
      if (is_num(v[k])) v[k] = floor(10000 * v[k]);
    });
    v.itr?.forEach(itr => float_scaling_itr(itr));
    v.bdy?.forEach(itr => float_scaling_bdy(itr));
    const cp = v.cpoint;
    if (cp) {
      ([
        'throwvx', 'throwvy', 'throwvz',
      ] as const).forEach(k => {
        if (is_num(cp[k])) cp[k] = floor(10000 * cp[k]);
      });
    }
    const wp = v.wpoint;
    if (wp) {
      ([
        'dvx', 'dvy', 'dvz',
      ] as const).forEach(k => {
        if (is_num(wp[k])) wp[k] = floor(10000 * wp[k]);
      });
    }
    v.opoint?.forEach((op) => {
      ([
        'dvx', 'dvy', 'dvz', 'speedz',
      ] as const).forEach(k => {
        if (is_num(op[k])) op[k] = floor(10000 * op[k]);
      });
    });
  });

  ([
    'jump_height', 'jump_distance', 'jump_distancez', 'dash_height',
    'dash_distance', 'dash_distancez', 'rowing_height', 'rowing_distance',
    'strength', 'weight', 'bounce'
  ] as const).forEach(k => {
    if (is_num(ret.base[k])) ret.base[k] = floor(10000 * ret.base[k]);
  });

  ret.base.brokens?.forEach((op) => {
    ([
      'dvx', 'dvy', 'dvz', 'speedz',
    ] as const).forEach(k => {
      if (is_num(op[k])) op[k] = floor(10000 * op[k]);
    });
  });
  traversal(ret.base.bot?.actions, (_, v) => {
    if (!v) return;
    v.e_ray?.forEach((v) => {
      ([
        'x', 'z', 'min_x', 'max_x', 'min_z', 'max_z', 'max_d'
      ] as const).forEach(k => {
        if (is_num(v[k])) v[k] = floor(10000 * v[k]);
      });
    });
  });
  return ret;
}
