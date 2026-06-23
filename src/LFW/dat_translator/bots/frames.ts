import { range } from "../../utils";


export const frames = {
  walkings: range(0, 5, 1).map(v => 'walking_' + v),
  standings: range(0, 3, 1).map(v => '' + v),
  runnings: range(0, 3, 1).map(v => 'running_' + v),
  punchs: range(60, 69),
  rowings: range(103, 107),
  super_punch: range(70, 79),
};
