import { WorldVal } from "../defines/WorldVal";
import { IValGetterGetter, IValGetter } from "../defines/IExpression";
import { World } from "../World";
import { get_val_from_lf2 } from "./get_val_from_lf2";

export const get_val_from_world: IValGetterGetter<World> = (
  word: string
): IValGetter<World> | undefined => {
  switch (word as WorldVal) {
    default:
      const fallback = get_val_from_lf2(word);
      if (!fallback) return void 0;
      return (e, ...arg) => fallback(e.lf2, ...arg);
  }
};
