import { cloneElement, type CSSProperties, isValidElement, type PropsWithChildren, type ReactNode, useContext } from "react";
import { Input, InputNumber } from "../Input";
import Titled from "../Titled";
import { FormContext, type IFormProps } from "./Form";

export interface IFormItemProps<T extends object> extends PropsWithChildren {
  style?: CSSProperties;
  label?: ReactNode;
  name?: keyof T;
}

export function FormItem<T extends object>(props: IFormItemProps<T>) {
  const { name, label, children, ..._p } = props;
  const { form, onChange } = useContext(FormContext) as IFormProps<T>;

  let field_value: any = null;
  if (!isValidElement(children) || !form || !name) {
  } else if (children.type === InputNumber || children.type === Input) {
    field_value = form.getFieldValue(name) ?? "";
  } else {
    field_value = form.getFieldValue(name);
  }
  let _children = children;
  if (isValidElement(children) && form && name) {
    const props: any = {
      ...children.props!,
      value: field_value,
      onChange: (val: unknown) => {
        (children.props as any).onChange?.(val);
        form.setFieldValue(name, val as T[keyof T]);
        form.validateField(name);
        const changed = { [name]: form.value[name] } as Partial<T>;
        onChange?.(changed, form.value as T);
      },
    };
    _children = cloneElement(children, props);
  }
  return (
    <Titled float_label={label} {..._p}>
      {_children}
    </Titled>
  );
}
