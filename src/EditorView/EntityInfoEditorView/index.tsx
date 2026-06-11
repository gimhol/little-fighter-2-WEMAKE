
import { Input, InputNumber } from "@/Component/Input";
import { entity_info_fields } from "@/LF2";
import { entity_info_new, IEntityInfo } from "@/LF2/defines";
import { useEffect, useMemo, useRef, useState } from "react";
import { IFrameProps } from "../../Component/Frame";
import { Space } from "../../Component/Space";
import { Form } from "../FrameEditorView/Form";
import { WorkspaceColumnView } from "../WorkspaceColumnView";

export interface IEntityInfoEditorViewProps extends IFrameProps {
  value?: IEntityInfo;
  onChange?(value: IEntityInfo): void;
}
export function EntityInfoEditorView(props: IEntityInfoEditorViewProps) {
  const { value: o_value, onChange: onChange, ..._p } = props;
  const i_value = useMemo(() => o_value ?? entity_info_new(), [o_value])

  const ref_o_value = useRef(o_value);
  const [form, _Form] = Form.useForm<IEntityInfo>();

  useEffect(() => {
    if (o_value == ref_o_value.current) return;
    form.setFieldsValue(i_value)
  }, [i_value, o_value, form])

  const render_field_item = (k: keyof IEntityInfo) => {
    const field = entity_info_fields.get(k)
    if (!field) return null;
    const { key, title = key, desc, type } = field
    let label = title;
    if (key != title) label += ` (${key})`

    if (type == 'int' || type == 'float') {
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
  const [visible_fields, set_visible_fields] = useState<(keyof IEntityInfo)[]>([
    'name',
    'ce',
    
    'jump_height',
    'jump_distance',
    'jump_distancez',

    'dash_height',
    'dash_distance',
    'dash_distancez',

    'rowing_height',
    'rowing_distance',
  ])

  return (
    <_Form form={form} onChange={(_, value) => onChange?.(value)}>
      <WorkspaceColumnView {..._p} title='基础信息'>
        <Space direction='column' stretchs style={{ width: '100%', padding: '20px 10px', boxSizing: 'border-box' }}>
          {/* <Editor.ImageFile field="head" />
        <Editor.ImageFile field="small" /> */}
          {visible_fields?.map(v => render_field_item(v))}
        </Space>
      </WorkspaceColumnView>
    </_Form>
  );
} 
