import { ISchema } from "@/LF2/defines";
import { UIComponent } from "./UIComponent";
import { make_schema } from "@/LF2/utils/schema";
import { Text } from "./Text";

export interface IFnKeysCountsProps {
  f6?: Text;
  f7?: Text;
  f8?: Text;
  f9?: Text;
  f10?: Text;
}
export class FnKeysCounts extends UIComponent {
  static override readonly TAG: string = 'FnKeysCounts';
  static PROPS: ISchema<IFnKeysCountsProps> = make_schema({
    key: "IFnKeysCountsProps",
    type: "object",
    properties: {
      f6: {
        key: "f6",
        type: Text,
        nullable: true,
      },
      f7: {
        key: "f7",
        type: Text,
        nullable: true,
      },
      f8: {
        key: "f8",
        type: Text,
        nullable: true,
      },
      f9: {
        key: "f9",
        type: Text,
        nullable: true,
      },
      f10: {
        key: "f10",
        type: Text,
        nullable: true,
      }
    }
  })
  override on_resume(): void {
    const props = this.props.validate(FnKeysCounts);
    console.log(props)
  }
}
