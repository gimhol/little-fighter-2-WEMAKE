import { Checkbox } from "@/Component/Checkbox";
import { Form } from "@/Component/Form";
import { ISpaceProps, Space } from "@/Component/Space";
import { chase_info_new, frame_info_fields, frame_info_new, IFrameInfo } from "@/LF2";
import { useEffect, useMemo, useRef } from "react";
import { FieldsRow } from "../FieldsRow";
import { ChaseInfoForm } from "./ChaseInfoForm";

type Data = IFrameInfo;
const data_new = frame_info_new;
const ALL_FIELDS = frame_info_fields;
const BASE_FIELD_KEYS: FieldKeysRow<Data>[] = [
  ['id', 'name'],
  ['state', 'wait'],
  ['centerx', 'centery'],
  ['width', 'height'],
  ['invisible', 'no_shadow', 'jump_flag'],
  ['behavior', 'facing', 'landable'],
  ['dvx', 'dvy', 'dvz'],
  ['vxm', 'vym', 'vzm'],
  ['acc_x', 'acc_y', 'acc_z'],
  ['ctrl_x', 'ctrl_y', 'ctrl_z'],
];

export interface IFrameInfoFormProps extends ISpaceProps {
  value?: Data;
  onChange?(value: Data): void;
}

export function FrameInfoForm(props: IFrameInfoFormProps) {
  const { value: o_value, onChange, stretchs = true, direction = 'column', ..._p } = props;
  const i_value = useMemo<Data>(() => o_value ?? data_new(), [o_value]);
  const ref_o_value = useRef(o_value);
  const [form, _Form] = Form.useForm<Data>(i_value);

  useEffect(() => {
    if (o_value == ref_o_value.current) return;
    form.setFieldsValue(i_value);
  }, [i_value, o_value, form]);

  return (
    <_Form form={form} onChange={(_, value) => onChange?.(value)}>
      <Space direction={direction} stretchs={stretchs} {..._p}>
        {BASE_FIELD_KEYS.map(v => <FieldsRow key={'' + v} row={v} fields={ALL_FIELDS} Form={_Form} />)}
        <Checkbox
          prefix='追踪'
          value={!!i_value.chase}
          onChange={v => {
            const o_value = { ...i_value };
            if (o_value.chase) delete o_value.chase;
            else o_value.chase = chase_info_new();
            onChange?.(o_value)
          }} />
        {
          !i_value.chase ? null :
            <_Form.Item name='chase' label=''>
              <ChaseInfoForm />
            </_Form.Item>
        }
      </Space>
    </_Form>
  );
}
