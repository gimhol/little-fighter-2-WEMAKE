import { EntityVal } from "../../defines/EntityVal";
import { CondMaker } from "../CondMaker";
export const hp_gt_0 = new CondMaker<EntityVal>().and(EntityVal.HP, '>', 0).done();
