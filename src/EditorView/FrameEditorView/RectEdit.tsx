import Combine from "../../Component/Combine";
import { InputNumber, InputNumberProps } from "../../Component/Input";
import { IRect } from "@/LF2/defines/IRect";
import { make_field_props } from "./make_field_props";

export interface IRectEditProps {
  defaultValue?: IRect;
  value?: IRect;
  onChange?(value?: IRect): void;
}
export function RectEdit(props: IRectEditProps) {
  return (
    <Combine direction="column" style={{ flex: 1, alignItems: 'stretch' }}>
      <Combine style={{ width: '100%' }}>
        <InputNumber {...make_field_props(props, empty_Rect, 'x')} {...default_input_props} title="X" prefix="X" />
        <InputNumber {...make_field_props(props, empty_Rect, 'y')} {...default_input_props} title="Y" prefix="Y" />
      </Combine>
      <Combine style={{ width: '100%' }}>
        <InputNumber {...make_field_props(props, empty_Rect, 'w')} {...default_input_props} min={0} title="宽" prefix="宽" />
        <InputNumber {...make_field_props(props, empty_Rect, 'h')} {...default_input_props} min={0} title="高" prefix="高" />
      </Combine>
    </Combine>
  );
}

const empty_Rect: IRect = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
}
const default_input_props: InputNumberProps = {
  step: 1,
  precision: 1,
  styles: { prefix: { display: 'inline-block', width: 20, textAlign: 'center' } },
  style: { flex: 1 }
};
(default_input_props as any)['data-flex'] = 1;