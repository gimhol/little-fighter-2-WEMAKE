import { arithmetic_progression } from "../../utils";


export const frames = {
  walkings: arithmetic_progression(0, 5, 1).map(v => 'walking_' + v),
  standings: arithmetic_progression(0, 3, 1).map(v => '' + v),
  runnings: arithmetic_progression(0, 3, 1).map(v => 'running_' + v),
  punchs: arithmetic_progression(60, 69),
  rowings: arithmetic_progression(103, 107),
  super_punch: arithmetic_progression(70, 79),
};
