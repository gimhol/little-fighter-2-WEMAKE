import { Form } from "@/Component/Form";
import { Input, InputNumber } from "@/Component/Input";
import Select from "@/Component/Select";
import { Space } from "@/Component/Space";
import { IFieldInfo } from "@/LF2";

export interface IFieldsRowProps<T extends object> {
  row: FieldKeysRow<T>,
  fields: Map<keyof T, IFieldInfo<Partial<T>>>,
  Form: Form<T>
}

export function FieldsRow<T extends object>(props: IFieldsRowProps<T>) {
  const { row, fields, Form } = props;

  
  if (Array.isArray(row)) {
    return (
      <Space vertical={false} item_props={{ style: { flex: 1 } }}>
        {row.map(v => <FieldsRow key={v.toString()} row={v} fields={fields} Form={Form} />)}
      </Space>
    );
  }
  const field = fields.get(row);
  if (!field) return null;
  const { key, title = key, type, options } = field;
  let label = title.toString();
  if (key != title) label += ` (${key.toString()})`;
  const desc = (field.desc ?? label).toString();
  if (options) {
    return (
      <Form.Item name={key} label={label} >
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
            parse={i => [i.value, i.label, { title: i.desc }]} />}
      </Form.Item>
    );
  } else if (type == 'int' || type == 'float') {
    return (
      <Form.Item name={key} label={label} >
        <InputNumber
          clearable={field.nullable == true}
          title={desc}
          precision={type == 'float' ? void 0 : 0}
          min={field.min}
          max={field.max}
          step={field.step} />
      </Form.Item>
    );
  } else if (type == 'string') {
    return (
      <Form.Item name={key} label={label}>
        <Input
          clearable={field.nullable == true}
          title={desc}
          maxLength={field.maxLength} />
      </Form.Item>
    );
  }
  return <></>;
}
