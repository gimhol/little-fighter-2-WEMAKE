import { ActionType, ArmorEnum, EntityVal, IEntityData } from "../../defines";
import { CondMaker } from "../CondMaker";
import { ensure, traversal } from "../../utils";

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

  traversal(data.frames, (k, frame) => {
    const n = Number(k);
    if (n >= 85 && n <= 95) {
      frame.itr?.forEach(itr => {
        if (itr.kind !== 0) return;
        if (itr.effect) return;
        itr.actions = ensure(itr.actions, {
          type: ActionType.A_BUFF,
          data: {
            duration: 60,
            buff: "Electroshock"
          }
        });
      })
    }

    const ja = frame.seqs?.["ja"];
    if (ja) {
      const jas = Array.isArray(ja) ? ja : [ja]
      for (const ja of jas) {
        if (!("id" in ja) || ja.id !== "300")
          continue;
        ja.expression = new CondMaker()
          .add(EntityVal.HP_P, "<=", 33)
          .or(EntityVal.LF2_NET_ON, "==", 1)
          .done();
      }
    }
  })
  return data;
}


