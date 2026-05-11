import { ArmorEnum, EntityVal, IEntityData } from "../../defines";
import { CondMaker } from "../CondMaker";

/**
 *
 * @export
 * @param {IEntityData} data
 * @return {IEntityData} 
 */
export function make_figther_data_louis(data: IEntityData): IEntityData {
  data.base.armor = {
    hit_sounds: ["data/085.wav.mp3"],
    type: ArmorEnum.Times,
    fulltime: false,
    toughness: 2,
  };
  for (const k in data.frames) {
    const ja = data.frames[k].seqs?.["ja"];
    if (!ja) continue;
    const jas = Array.isArray(ja) ? ja : [ja]
    for (const ja of jas) {
      if (!("id" in ja) || ja.id !== "300") continue;
      ja.expression = new CondMaker()
        .add(EntityVal.HP_P, "<=", 33)
        .or(EntityVal.LF2_NET_ON, "==", 1)
        .done();
    }
  }
  return data;
}


