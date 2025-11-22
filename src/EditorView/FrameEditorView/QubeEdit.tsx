import Combine from "../../Component/Combine";
import { InputNumber, InputNumberProps } from "../../Component/Input";
import { IQube } from "@/LF2/defines/IQube";
import { make_field_props } from "./make_field_props";

export interface IQubeEditProps {
  defaultValue?: IQube;
  value?: IQube;
  onChange?(value?: IQube): void;
}
export function QubeEdit(props: IQubeEditProps) {
  return (
    <Combine direction="column" style={{ flex: 1, alignItems: 'stretch' }}>
      <Combine style={{ width: '100%' }}>
        <InputNumber {...make_field_props(props, empty_qube, 'x')} {...default_input_props} title="X" prefix="X" />
        <InputNumber {...make_field_props(props, empty_qube, 'y')} {...default_input_props} title="Y" prefix="Y" />
        <InputNumber {...make_field_props(props, empty_qube, 'z')} {...default_input_props} title="Z" prefix="Z" />
      </Combine>
      <Combine style={{ width: '100%' }}>
        <InputNumber {...make_field_props(props, empty_qube, 'w')} {...default_input_props} min={0} title="宽" prefix="宽" />
        <InputNumber {...make_field_props(props, empty_qube, 'h')} {...default_input_props} min={0} title="高" prefix="高" />
        <InputNumber {...make_field_props(props, empty_qube, 'l')} {...default_input_props} min={0} title="长" prefix="长" />
      </Combine>
    </Combine>
  );
}

const empty_qube: IQube = {
  z: 0,
  l: 0,
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