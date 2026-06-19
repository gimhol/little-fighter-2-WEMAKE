import { Form } from "@/Component/Form";
import { type ISpaceProps, Space } from "@/Component/Space";
import { bdy_info_fields, bdy_info_new, type IBdyInfo } from "@/LF2";
import { useEffect, useMemo, useRef } from "react";
import { FieldsRow } from "../../FieldsRow";

type Data = IBdyInfo;
const data_new = bdy_info_new;
const ALL_FIELDS = bdy_info_fields;
const BASE_FIELD_KEYS: FieldKeysRow<Data>[] = [
  ['kind', 'hit_flag'],
  ['x', 'y', 'w', 'h'],
  ['z', 'l'],
  ['prefab_id'],
  ['test', 'code'],
];

export interface IBdyInfoFormProps extends ISpaceProps {
  value?: Data;
  onChange?(value: Data): void;
}

export function BdyInfoForm(props: IBdyInfoFormProps) {
  const { value: o_value, onChange, stretchs = true, direction = 'column', ..._p } = props;
  const i_value = useMemo<Data>(() => o_value ?? data_new(), [o_value]);
  const ref_o_value = useRef(o_value);
  const [form, _Form] = Form.useForm<Data>(i_value);

  useEffect(() => {
    if (o_value == ref_o_value.current) return;
    form.resetFieldsValue(i_value);
  }, [i_value, o_value, form]);

  return (
    <_Form form={form} onChange={(_, value) => onChange?.(value)}>
      <Space direction={direction} stretchs={stretchs} {..._p}>
        {BASE_FIELD_KEYS.map(v => <FieldsRow key={'' + v} row={v} fields={ALL_FIELDS} Form={_Form} />)}
      </Space>
    </_Form>
  );
}
