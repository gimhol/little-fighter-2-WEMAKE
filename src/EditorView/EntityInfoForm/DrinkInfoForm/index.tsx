import { Form } from "@/Component/Form";
import { ISpaceProps, Space } from "@/Component/Space";
import { drink_Info_fields, drink_info_new, IDrinkInfo } from "@/LF2";
import { useEffect, useMemo, useRef } from "react";
import { FieldsRow } from "../../FieldsRow";

type Data = IDrinkInfo;
const data_new = drink_info_new;
const ALL_FIELDS = drink_Info_fields
const BASE_FIELD_KEYS: FieldKeysRow<Data>[] = [
  ['hp_h_value', 'hp_h_ticks', 'hp_h_total'],
  ['hp_r_value', 'hp_r_ticks', 'hp_r_total'],
  ['mp_h_value', 'mp_h_ticks', 'mp_h_total'],
]
export interface IDrinkInfoFormProps extends ISpaceProps {
  value?: Data;
  onChange?(value: Data): void;
}
export function DrinkInfoForm(props: IDrinkInfoFormProps) {
  const { value: o_value, onChange, stretchs = true, direction = 'column', ..._p } = props;
  const i_value = useMemo<Data>(() => o_value ?? data_new(), [o_value])
  const ref_o_value = useRef(o_value);
  const [form, _Form] = Form.useForm<Data>(i_value);

  useEffect(() => {
    if (o_value == ref_o_value.current) return;
    form.resetFieldsValue(i_value)
  }, [i_value, o_value, form])

  return (
    <_Form form={form} onChange={(_, value) => onChange?.(value)} >
      <Space direction={direction} stretchs={stretchs} {..._p}>
        {BASE_FIELD_KEYS.map(v => <FieldsRow key={'' + v} row={v} fields={ALL_FIELDS} Form={_Form} />)}
      </Space>
    </_Form >
  )
}