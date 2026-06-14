
import { Checkbox } from "@/Component/Checkbox";
import { Form } from "@/Component/Form";
import { Input, InputNumber } from "@/Component/Input";
import Select from "@/Component/Select";
import { armor_Info_new, drink_info_new, entity_info_fields } from "@/LF2";
import { entity_info_new, IEntityInfo } from "@/LF2/defines";
import { useEffect, useMemo, useRef, useState } from "react";
import { ISpaceProps, Space } from "../../Component/Space";
import { ArmorInfoForm } from "./ArmorInfoForm";

export interface IEntityInfoFormProps extends ISpaceProps {
  value?: IEntityInfo;
  onChange?(value: IEntityInfo): void;
}
export function EntityInfoForm(props: IEntityInfoFormProps) {
  const { value: o_value, onChange, stretchs = true, direction = 'column', ..._p } = props;
  const i_value = useMemo(() => o_value ?? entity_info_new(), [o_value])
  const ref_o_value = useRef(o_value);
  const [form, _Form] = Form.useForm<IEntityInfo>(i_value);
  useEffect(() => {
    if (o_value == ref_o_value.current) return;
    form.setFieldsValue(i_value)
  }, [i_value, o_value, form])

  const render_field_item = (k: keyof IEntityInfo | (keyof IEntityInfo)[]) => {
    if (Array.isArray(k)) {
      return (
        <Space vertical={false} item_props={{ style: { flex: 1 } }} style={{ flexWrap: 'wrap' }} >
          {k.map(v => render_field_item(v))}
        </Space>
      )
    }
    const field = entity_info_fields.get(k)
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
  const [visible_fields, set_visible_fields] = useState<(keyof IEntityInfo | (keyof IEntityInfo)[])[]>(() => [
    ['type', "group", 'name'],
    ['ce', 'weight', 'strength'],
    ['jump_height', 'jump_distance', 'jump_distancez'],
    ['dash_height', 'dash_distance', 'dash_distancez'],
    ['rowing_height', 'rowing_distance'],
    ['bounce_y', 'bounce_x', 'bounce_z'],
    ['bounce_min_y', 'bounce_min_x', 'bounce_min_z'],
    ['fast_vy', 'fast_vx', 'fast_vz'],
  ])

  return (
    <_Form form={form} onChange={(_, value) => onChange?.(value)}>
      <Space direction={direction} stretchs={stretchs} {..._p}>
        {visible_fields?.map(v => render_field_item(v))}
        <Checkbox
          prefix='护甲'
          value={!!i_value.armor}
          onChange={v => onChange?.({
            ...i_value, armor: i_value.armor ? void 0 : armor_Info_new()
          })} />
        {
          !i_value.armor ? null :
            <_Form.Item name='armor' label='armor'>
              <ArmorInfoForm />
            </_Form.Item>
        }
        <Checkbox
          prefix='饮料'
          value={!!i_value.drink}
          onChange={v => onChange?.({
            ...i_value, drink: i_value.drink ? void 0 : drink_info_new()
          })} />

      </Space>
    </_Form>
  );
}

