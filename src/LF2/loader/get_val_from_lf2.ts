import { IValGetter, IValGetterGetter } from "../defines/IExpression";
import { LF2Val } from "../defines/LF2Val";
import { LF2 } from "../LF2";

export const get_val_from_lf2: IValGetterGetter<LF2> = (
  word: string
): IValGetter<LF2> | undefined => {
  switch (word as LF2Val) {
    default: return void 0
  }
};
