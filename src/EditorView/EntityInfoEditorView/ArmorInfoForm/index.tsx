import { Form } from "@/Component/Form";
import { Input, InputNumber } from "@/Component/Input";
import Select from "@/Component/Select";
import { ISpaceProps, Space } from "@/Component/Space";
import { armor_Info_fields, armor_Info_new, IArmorInfo } from "@/LF2";
import { useEffect, useMemo, useRef, useState } from "react";


export interface IArmorInfoFormProps extends ISpaceProps {
  value?: IArmorInfo;
  onChange?(value: IArmorInfo): void;
}
export function ArmorInfoForm(props: IArmorInfoFormProps) {
  const { value: o_value, onChange, stretchs = true, direction = 'column', ..._p } = props;
  const i_value = useMemo<IArmorInfo>(() => o_value ?? armor_Info_new(), [o_value])
  const ref_o_value = useRef(o_value);
  const [form, _Form] = Form.useForm<IArmorInfo>(i_value);

  useEffect(() => {
    if (o_value == ref_o_value.current) return;
    form.setFieldsValue(i_value)
  }, [i_value, o_value, form])

  const render_field_item = (k: keyof IArmorInfo | (keyof IArmorInfo)[]) => {
    if (Array.isArray(k)) {
      return (
        <Space vertical={false} item_props={{ style: { flex: 1 } }} >
          {k.map(v => render_field_item(v))}
        </Space>
      )
    }
    const field = armor_Info_fields.get(k)
    if (!field) return null;
    const { key, title = key, type, options } = field
    let label = title;
    if (key != title) label += ` (${key})`
    const desc = field.desc ?? label;
    if (options) {
      return (
        <_Form.Item name={key} label={label} key={k}>
          {field.array == true ?
            <Select
              multi
              clearable={field.nullable == true}
              title={desc}
              options={options}
              parse={i => [i.value, i.label, { title: i.desc }]} /> :
            <Select
              clearable={field.nullable == true}
              title={desc}
              options={options}
              parse={i => [i.value, i.label, { title: i.desc }]} />
          }
        </_Form.Item>
      )
    } else if (type == 'int' || type == 'float') {
      return (
        <_Form.Item name={key} label={label} key={k}>
          <InputNumber
            clearable={field.nullable == true}
            title={desc}
            precision={type == 'float' ? void 0 : 0}
            min={field.min}
            max={field.max}
            step={field.step} />
        </_Form.Item>
      )
    } else if (type == 'string') {
      return (
        <_Form.Item name={key} label={label} key={k}>
          <Input
            clearable={field.nullable == true}
            title={desc}
            maxLength={field.maxLength} />
        </_Form.Item>
      )
    }
  }

  const [visible_fields, set_visible_fields] = useState<(keyof IArmorInfo | (keyof IArmorInfo)[])[]>(() => [
    ['type', 'toughness'],
    ['fireproof', 'antifreeze', 'toughness'],
    ['injury_ratio', 'shaking_ratio', 'motionless_ratio']
  ])
  return (
    <_Form form={form} onChange={(_, value) => onChange?.(value)} >
      <Space direction={direction} stretchs={stretchs} {..._p}>
        {visible_fields.map(v => render_field_item(v))}
      </Space>
    </_Form >
  )
}