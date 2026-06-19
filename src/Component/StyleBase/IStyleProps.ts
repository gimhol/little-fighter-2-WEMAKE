import type { UiSize } from "../Text";
import type { TVariant } from "./Variant";

export interface IStyleProps {
  variants?: TVariant[] | string;
  size?: UiSize;
}