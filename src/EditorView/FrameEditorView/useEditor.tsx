import { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import { Cross } from '../../Component/Icons/Cross';
import { Plus } from '../../Component/Icons/Plus';
import { Input, InputProps } from "../../Component/Input";
import { InputNumber, InputNumberProps } from "../../Component/Input";
import Select, { ISelectProps } from "../../Component/Select";
import { TextArea } from "../../Component/TextArea";
import Titled, { ITitledProps } from "../../Component/Titled";
import { IZipObject } from "@/LF2/ditto";
import { shared_ctx } from "../Context";

type Field<O> = (keyof O) | (string | number)[];
interface CommonProps<O extends {}> {
  title?: string;
  field: Field<O>;
  foo?: any
}
export function useEditor<O extends {}>(value: O, label_style: React.CSSProperties = {}) {

  const titled_style: React.CSSProperties = useMemo(() => (
    { display: 'flex' }
  ), []);

  return useMemo(() => {
    const t_props = (field: any): ITitledProps => ({
      float_label: field.toString(),
      styles: { label: label_style },
      style: titled_style,
    });
    const get_value = (f: CommonProps<O>['field']) => {
      if (!Array.isArray(f)) return (value as any)[f]
      let r = value;
      for (const k of f) {
        if (!r) continue;
        r = (r as any)[k]
      }
      return r;
    }
    const set_value = (f: CommonProps<O>['field'], v: any) => {
      if (!Array.isArray(f)) {
        (value as any)[f] = v;
        return;
      }
      let temp = value;
      f.forEach((k, i, a) => {
        if (!temp) return;
        if (i < a.length - 1) {
          temp = (temp as any)[k]
        } else {
          (temp as any)[k] = v;
        }
      })
    }
    return {
      ImageFile(props: CommonProps<O> & Partial<ISelectProps<IZipObject, string>>) {
        const { field, title: name, ..._p } = props;
        const { zip } = useContext(shared_ctx);
        const [img_list, set_img_list] = useState<IZipObject[]>([])
        useEffect(() => {
          if (zip) set_img_list(zip.file(/.png$/))
        }, [zip])
        return (
          <Titled {...t_props(name ?? field)}>
            <Select
              items={img_list}
              parse={v => [v.name, v.name]}
              defaultValue={get_value(field)}
              onChange={v => set_value(field, v)}
              clearable
              style={{ flex: 1 }}
              {..._p} />
          </Titled>
        );
      },
      Number(props: CommonProps<O> & InputNumberProps) {
        const { field, title: name, ..._p } = props;
        return (
          <Titled {...t_props(name ?? field)}>
            <InputNumber
              defaultValue={get_value(field)}
              on_blur={v => set_value(field, v)}
              style={{ flex: 1 }}
              clearable
              {..._p} />
          </Titled>
        );
      },
      Text(props: CommonProps<O>) {
        const { title: name, field } = props;
        return (
          <Titled {...t_props(name ?? field)}>
            <TextArea
              style={{ flex: 1, resize: 'vertical' }}
              defaultValue={get_value(field)}
              onBlur={e => set_value(field, e.target.value.trim() || void 0)} />
          </Titled>
        );
      },
      String(props: CommonProps<O> & InputProps) {
        const { title: name, field, ..._p } = props;
        return (
          <Titled {...t_props(name ?? field)}>
            <Input
              style={{ flex: 1 }}
              defaultValue={get_value(field)}
              onBlur={e => set_value(field, e.target.value.trim() || void 0)}
              {..._p} />
          </Titled>
        );
      },
      Number3(props: { name: string; fields: [Field<O>, Field<O>, Field<O>]; clearable?: boolean } & ITitledProps) {
        const { name, fields: [x, y, z], clearable, ..._p } = props;
        const combine_style: React.CSSProperties = { flex: 1 }
        const input_style: React.CSSProperties = { flex: 1 }
        return (
          <Titled {...t_props(name)} {..._p}>
            <Combine style={combine_style}>
              <InputNumber
                defaultValue={get_value(x)}
                onChange={v => set_value(x, v)}
                title="x"
                prefix="x"
                style={input_style}
                clearable={clearable}
                data-flex={1} />
              <InputNumber
                defaultValue={get_value(y)}
                onChange={v => set_value(y, v)}
                title="y"
                prefix="y"
                style={input_style}
                clearable={clearable}
                data-flex={1} />
              <InputNumber
                defaultValue={get_value(z)}
                onChange={v => set_value(z, v)}
                title="z"
                prefix="z"
                style={input_style}
                clearable={clearable}
                data-flex={1} />
            </Combine>
          </Titled>
        );
      },
      EditorVec2(props: { name: string; fields: [Field<O>, Field<O>]; clearable?: boolean } & ITitledProps) {
        const { name, fields: [x, y], clearable, ..._p } = props;
        const combine_style: React.CSSProperties = { flex: 1 }
        const input_style: React.CSSProperties = { flex: 1 }
        return (
          <Titled {...t_props(name)} {..._p}>
            <Combine style={combine_style}>
              <InputNumber
                defaultValue={get_value(x)}
                onChange={v => set_value(x, v)}
                title="x"
                prefix="x"
                style={input_style}
                clearable={clearable}
                data-flex={1} />
              <InputNumber
                defaultValue={get_value(y)}
                onChange={v => set_value(y, v)}
                title="y"
                prefix="y"
                style={input_style}
                clearable={clearable}
                data-flex={1} />
            </Combine>
          </Titled>
        );
      },
      Qube(props: { title: string; fields: [Field<O>, Field<O>, Field<O>, Field<O>, Field<O>, Field<O>]; clearable?: boolean } & ITitledProps) {
        const { title: name, fields: [x, y, z, w, h, l], clearable, ..._p } = props;
        const combine_style: React.CSSProperties = { flex: 1, alignItems: 'stretch' }
        const input_style: React.CSSProperties = { flex: 1 }
        return (
          <Titled {...t_props(name)} {..._p}>
            <Combine direction="column" style={combine_style}>
              <Combine data-flex={1} style={{ flex: 1 }}>
                <InputNumber
                  defaultValue={get_value(x)}
                  onChange={v => set_value(x, v)}
                  title="x"
                  prefix="x"
                  style={input_style}
                  clearable={clearable} data-flex={1} />
                <InputNumber
                  defaultValue={get_value(y)}
                  onChange={v => set_value(y, v)}
                  title="y" prefix="y"
                  style={input_style}
                  clearable={clearable} data-flex={1} />
                <InputNumber
                  defaultValue={get_value(z)}
                  onChange={v => set_value(z, v)}
                  title="z" prefix="z"
                  style={input_style}
                  clearable={clearable} data-flex={1} />
              </Combine>
              <Combine data-flex={1} style={{ flex: 1 }}>
                <InputNumber
                  defaultValue={get_value(w)}
                  onChange={v => set_value(w, v)}
                  title="w" prefix="w"
                  style={input_style}
                  clearable={clearable} data-flex={1} />
                <InputNumber
                  defaultValue={get_value(h)}
                  onChange={v => set_value(h, v)}
                  title="h" prefix="h"
                  style={input_style}
                  clearable={clearable} data-flex={1} />
                <InputNumber
                  defaultValue={get_value(l)}
                  onChange={v => set_value(l, v)}
                  title="l" prefix="l"
                  style={input_style}
                  clearable={clearable} data-flex={1} />
              </Combine>
            </Combine>
          </Titled>
        );
      },
      Strings(props: CommonProps<O> & InputProps) {
        const { title: name, field, placeholder, title } = props;
        const list: string[] | undefined = (value as any)[field];
        const [, set_change_flags] = useState(0);

        const on_click_add = () => {
          (value as any)[field] = (value as any)[field] || [];
          (value as any)[field].push('');
          set_change_flags(v => v + 1)
        }
        const on_click_del = (idx: number) => {
          list?.splice(idx, 1);
          set_change_flags(v => v + 1)
        }
        const on_blur = (idx: number, str: string) => {
          (value as any)[field][idx] = str.trim();
          set_change_flags(v => v + 1)
        }
        const children = list?.map((value, idx) => {
          return (
            <Combine key={idx} style={{ flex: 1 }}>
              <Input
                defaultValue={value}
                placeholder={placeholder}
                onBlur={e => on_blur(idx, e.target.value)}
                data-flex={1}
                style={{ flex: 1 }} />
              <Button onClick={() => on_click_del(idx)} >
                <Cross />
              </Button>
            </Combine>
          );
        }) ?? []
        children.push(
          <Button onClick={on_click_add} style={{ flex: 1 }} key={children.length}>
            <Plus />
          </Button>
        )
        return (
          <Titled {...t_props(name ?? field)} title={title}>
            <Combine direction='column' style={{ flex: 1 }}>
              {children}
            </Combine>
          </Titled>
        );
      },
      EditorIntList(props: CommonProps<O>) {
        const { title: name, field, } = props;
        const list: number[] | undefined = (value as any)[field];
        const [, set_change_flags] = useState(0);
        const on_click_add = () => {
          (value as any)[field] = (value as any)[field] || [];
          (value as any)[field].push(void 0);
          set_change_flags(v => v + 1);
        }
        const on_click_del = (idx: number) => {
          list?.splice(idx, 1);
          set_change_flags(v => v + 1);
        }
        const on_blur = (idx: number, num: number | undefined) => {
          (value as any)[field][idx] = num;
          set_change_flags(v => v + 1);
        }
        return (
          <Titled {...t_props(name ?? field)}>
            <Combine direction='column' style={{ flex: 1 }}>
              {list?.map((value, idx) => {
                return (
                  <Combine>
                    <InputNumber
                      style={{ flex: 1 }}
                      defaultValue={value}
                      on_blur={v => on_blur(idx, v)} />
                    <Button >
                      <Cross onClick={() => on_click_del(idx)} />
                    </Button>
                  </Combine>
                );
              })}
              <Button onClick={on_click_add}>
                <Plus />
              </Button>
            </Combine>
          </Titled>
        );
      },
      Select<T, V>(props: CommonProps<O> & ISelectProps<T, V>) {
        const { title: name, field, onChange: on_changed, ..._p } = props;
        const [, set_change_flags] = useState(0);
        return (
          <Titled {...t_props(name ?? field)}>
            <Select
              defaultValue={get_value(field)}
              onChange={v => {
                (value as any)[field] = v;
                on_changed?.(v);
                set_change_flags(v => ++v);
              }}
              clearable
              style={{ flex: 1 }}
              {..._p} />
          </Titled>
        )
      },
      Sel3<T, V>(props: {
        name: string;
        fields: [Field<O>, Field<O>, Field<O>];
        placeholders?: [string, string, string]
        clearable?: boolean;
        select: ISelectProps<T, V>
      } & ITitledProps) {
        const { name, fields: [x, y, z], placeholders, clearable, select, ..._p } = props;
        const combine_style: React.CSSProperties = { flex: 1 }
        const select_style: React.CSSProperties = { flex: 1 }
        return (
          <Titled {...t_props(name)} {..._p}>
            <Combine style={combine_style}>
              <Select
                defaultValue={get_value(x)}
                onChange={v => { set_value(x, v) }}
                placeholder={placeholders?.at(0)}
                clearable
                style={select_style}
                {...select}
                data-flex={1} />
              <Select
                defaultValue={get_value(y)}
                onChange={v => { set_value(y, v) }}
                placeholder={placeholders?.at(1)}
                clearable
                style={select_style}
                {...select}
                data-flex={1} />
              <Select
                defaultValue={get_value(z)}
                onChange={v => { set_value(z, v) }}
                placeholder={placeholders?.at(2)}
                clearable
                style={select_style}
                {...select}
                data-flex={1} />
            </Combine>
          </Titled>
        );
      },
    };
  }, [value, label_style, titled_style]);
}
