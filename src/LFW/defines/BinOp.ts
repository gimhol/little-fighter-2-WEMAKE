export enum BinOp {
  LESS = "<",
  LESS_OR_EQUAL = "<=",
  EQUAL = "==",
  GREATER_OR_EQUAL = ">=",
  GREATER = ">",
  NOT_EQUAL = "!=",
  IncludedBy = "}}",
  Include = "{{",
  NotIncludedBy = "!}",
  NotInclude = "!{",
}

export const BinOpDescriptions: Record<BinOp, string> = {
  [BinOp.LESS]: "",
  [BinOp.LESS_OR_EQUAL]: "",
  [BinOp.EQUAL]: "",
  [BinOp.GREATER_OR_EQUAL]: "",
  [BinOp.GREATER]: "",
  [BinOp.NOT_EQUAL]: "",
  [BinOp.IncludedBy]: "",
  [BinOp.Include]: "",
  [BinOp.NotIncludedBy]: "",
  [BinOp.NotInclude]: "",
}
export type TBinOp =
  | "=="
  | ">="
  | "<="
  | "!="
  | "<"
  | ">"
  | "{{"
  | "}}"
  | "!{"
  | "!}"
  | BinOp;
