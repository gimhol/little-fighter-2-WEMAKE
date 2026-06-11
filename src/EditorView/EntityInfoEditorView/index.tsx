
import { Input, InputNumber } from "@/Component/Input";
import Select from "@/Component/Select";
import { armor_Info_fields, armor_Info_new, entity_info_fields, IArmorInfo } from "@/LF2";
import { entity_info_new, IEntityInfo } from "@/LF2/defines";
import { useEffect, useMemo, useRef, useState } from "react";
import { IFrameProps } from "../../Component/Frame";
import { Space } from "../../Component/Space";
import { Form } from "../FrameEditorView/Form";
import { WorkspaceColumnView } from "../WorkspaceColumnView";
import { Checkbox } from "@/Component/Checkbox";
import Show from "@/Component/Show";
import Titled from "@/Component/Titled";

export interface IEntityInfoEditorViewProps extends IFrameProps {
  value?: IEntityInfo;
  onChange?(value: IEntityInfo): void;
}
export function EntityInfoEditorView(props: IEntityInfoEditorViewProps) {
  const { value: o_value, onChange, ..._p } = props;
  const i_value = useMemo(() => o_value ?? entity_info_new(), [o_value])
  const ref_o_value = useRef(o_value);
  const [form, _Form] = Form.useForm<IEntityInfo>();
  useEffect(() => {
    if (o_value == ref_o_value.current) return;
    form.setFieldsValue(i_value)
  }, [i_value, o_value, form])

  const render_field_item = (k: keyof IEntityInfo | (keyof IEntityInfo)[]) => {
    if (Array.isArray(k)) {
      return (
        <Space vertical={false} item_props={{ style: { flex: 1 } }} >
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
              clearable
              title={desc}
              options={options}
              parse={i => [i.value, i.label, { title: i.desc }]} /> :
            <Select
              clearable
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
            clearable
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
            clearable
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
    <WorkspaceColumnView {..._p} title='基础信息'>
      <_Form form={form} onChange={(_, value) => onChange?.(value)}>
        <Space direction='column' stretchs style={{ width: '100%', padding: '20px 10px', boxSizing: 'border-box' }}>
          {visible_fields?.map(v => render_field_item(v))}
          <Space>
            <Titled label='护甲'>
              <Checkbox
                value={!!i_value.armor}
                onChange={v => onChange?.({
                  ...i_value, armor: i_value.armor ? void 0 : armor_Info_new()
                })} />
            </Titled>
          </Space>
          <Show show={!!i_value.armor}>
            <_Form.Item name='armor' label='armor'>
              <ArmorInfoForm />
            </_Form.Item>
          </Show>

        </Space>
      </_Form>
    </WorkspaceColumnView>
  );
}

export interface IArmorInfoFormProps extends IFrameProps {
  value?: IArmorInfo;
  onChange?(value: IArmorInfo): void;
}
export function ArmorInfoForm(props: IArmorInfoFormProps) {
  const { value: o_value, onChange: onChange, ..._p } = props;
  const i_value = useMemo(() => o_value ?? entity_info_new(), [o_value])
  const ref_o_value = useRef(o_value);
  const [form, _Form] = Form.useForm<IArmorInfo>();

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
              clearable
              title={desc}
              options={options}
              parse={i => [i.value, i.label, { title: i.desc }]} /> :
            <Select
              clearable
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
            clearable
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
            clearable
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
    <_Form form={form} onChange={(_, value) => onChange?.(value)}>
      <Space direction='column' stretchs>
        {visible_fields.map(v => render_field_item(v))}
      </Space>
    </_Form>
  )
}