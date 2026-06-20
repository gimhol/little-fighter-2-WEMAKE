import { Form } from "@/Component/Form";
import { type ISpaceProps, Space } from "@/Component/Space";
import { armor_Info_fields, armor_Info_new, type IArmorInfo } from "@/LFW";
import { useEffect, useMemo, useRef } from "react";
import { FieldsRow } from "../../FieldsRow";

type Data = IArmorInfo;
const data_new = armor_Info_new;
const ALL_FIELDS = armor_Info_fields
const BASE_FIELD_KEYS: FieldKeysRow<Data>[] = [
  ['type', 'toughness'],
  ['fireproof', 'antifreeze', 'toughness'],
  ['injury_ratio', 'shaking_ratio', 'motionless_ratio']
]

export interface IArmorInfoFormProps extends ISpaceProps {
  value?: Data;
  onChange?(value: Data): void;
}
export function ArmorInfoForm(props: IArmorInfoFormProps) {
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
