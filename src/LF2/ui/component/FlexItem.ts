import { IPropsMeta } from "@/LF2";
import { TFlexAlign } from "./Flex";
import { ALL_FLEX_ALIGN } from "./FlexAlign";
import { UIComponent } from "./UIComponent";
export interface IFlexItemProps {
  align: string
}
export class FlexItem extends UIComponent<IFlexItemProps> {
  static override readonly TAGS: string[] = ["FlexItem"];
  static override readonly PROPS: IPropsMeta<IFlexItemProps> = {
    align: { type: String, oneof: ALL_FLEX_ALIGN }
  }
  get align(): TFlexAlign | null {
    return this.props.align as TFlexAlign ?? null
  }
}

