import * as T from "../_t";

export const INDICATORS_INFO: {
  [x in string]?: T.LineMaterialParameters;
} = {
  bdy: {
    color: 0x00ff00, // #00FF00
    linewidth: 3,
  },
  itr: {
    color: 0xff0000, // #FF0000
    linewidth: 3,
  },
  frame: {
    color: 0xffff00, // #FFFF00
    linewidth: 3,
  },
  ft: {
    color: 0x2288FF, // #2288FF
    linewidth: 10,
  },
  opoint: {
    color: 0xFF2288, // #8822FF
    linewidth: 10,
  },
  wpoint: {
    color: 0xFF2288, // #22FF88
    linewidth: 10,
  },
  cpoint: {
    color: 0xFF2288, // #FF8822
    linewidth: 10,
  },
  bpoint: {
    color: 0xFF2288, // #FF2288
    linewidth: 10,
  },
};
