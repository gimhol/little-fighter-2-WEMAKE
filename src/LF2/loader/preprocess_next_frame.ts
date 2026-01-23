import { Expression } from "../base/Expression";
import { INextFrame, TNextFrame } from "../defines";
import { get_val_getter_from_entity } from "./get_val_from_entity";


export function preprocess_next_frame(nf: INextFrame): INextFrame;
export function preprocess_next_frame(nf: INextFrame[]): INextFrame[];
export function preprocess_next_frame(nf: TNextFrame): TNextFrame;
export function preprocess_next_frame(nf: TNextFrame): TNextFrame {
  if (Array.isArray(nf))
    return nf.map(i => preprocess_next_frame(i))
  if (typeof nf.expression !== "string") return nf;
  nf.judger = new Expression(nf.expression, get_val_getter_from_entity);
  return nf;
}
preprocess_next_frame.Tag = 'preprocess_next_frame'



