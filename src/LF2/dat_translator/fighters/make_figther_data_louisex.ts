import { ActionType, Defines, EntityGroup, IEntityData } from "../../defines";
import { ensure, traversal } from "../../utils";

/**
 * @param data 
 * @returns 
 */
export function make_figther_data_louisex(data: IEntityData): IEntityData {
  data.base.strength = Defines.FIGHTER_STREAGTH_STRONG
  data.base.group = ensure(data.base.group, EntityGroup.Boss);

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
  })
  return data;
}
