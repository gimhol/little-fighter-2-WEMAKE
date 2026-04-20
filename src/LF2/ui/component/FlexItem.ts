import { TFlexAlign } from "./Flex";
import { UIComponent } from "./UIComponent";

export class FlexItem extends UIComponent {
  static override readonly TAGS: string[] = ["FlexItem"];
  get align(): TFlexAlign | null { return null }
}

