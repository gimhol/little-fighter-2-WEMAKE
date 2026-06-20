import type { IValGetter, IValGetterGetter } from "../defines/IExpression";
import { LF2Val } from "../defines/LF2Val";
import { LFW } from "../LFW";

export const get_val_from_lf2: IValGetterGetter<LFW> = (
  word: string
): IValGetter<LFW> | undefined => {
  switch (word as LF2Val) {
    default: return void 0
  }
};
