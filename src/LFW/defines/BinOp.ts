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
