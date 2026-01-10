import type { ErrCode } from "./ErrCode";
import type { MsgEnum } from "./MsgEnum";

export interface IConnError extends Error {
  lf2: {
    type: MsgEnum | string;
    code: ErrCode | number;
    error: string;
  }
};
