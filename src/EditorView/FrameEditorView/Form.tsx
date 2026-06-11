import { Input, InputNumber } from "@/Component/Input";
import {
  cloneElement,
  createContext,
  CSSProperties,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useContext,
  useRef
} from "react";
import Titled from "../../Component/Titled";
import { FormInstance } from "./FormInstance";

interface IEditor2Props<T extends object> extends PropsWithChildren {
  form?: FormInstance<T>;
  onChange?(changed: Partial<T>, allValues: T): void;
}

interface IItemProps<T extends object> extends PropsWithChildren {
  style?: CSSProperties;
  label?: ReactNode;
  name: keyof T;
}

type FormContextType = IEditor2Props<object>;
const FormContext = createContext<FormContextType>({
  form: undefined
});

export function Form<T extends object>(props: IEditor2Props<T>) {
  const { form, onChange } = props;
  const _onChange: typeof onChange = (a, b) => onChange?.(a, b)
  return (
    <FormContext.Provider value={{ form, onChange: _onChange }}>
      {props.children}
    </FormContext.Provider>
  );
}

interface Form<T extends object> {
  (props: IEditor2Props<T>): ReactElement;
  Item(props: IItemProps<T>): ReactElement
}

function useForm<T extends object>(init?: Partial<T>) {
  const ref_form = useRef<FormInstance<T> | undefined>(void 0);
  if (!ref_form.current) ref_form.current = new FormInstance<T>(init);
  return [ref_form.current, Form as Form<T>] as const;
}

function Item<T extends object>(props: IItemProps<T>) {
  const { name, label, children, ..._p } = props;
  const { form, onChange } = useContext(FormContext) as IEditor2Props<T>;

  let field_value: any = null;
  if (!isValidElement(children) || !form) {
  } else if (children.type === InputNumber || children.type === Input) {
    field_value = form.getFieldValue(name) ?? "";
  } else {
    field_value = form.getFieldValue(name);
  }
  let _children = children;
  if (isValidElement(children) && form) {
    const props: any = {
      ...children.props!,
      value: field_value,
      onChange: (val: unknown) => {
        (children.props as any).onChange?.(val)
        form.setFieldValue(name, val as T[keyof T]);
        form.validateField(name);
        const changed = { [name]: form.value[name] } as Partial<T>
        onChange?.(changed, form.value as T);
      },
    }
    _children = cloneElement(children, props);
  }
  return (
    <Titled float_label={label} {..._p}>
      {_children}
    </Titled>
  );
}

Form.useForm = useForm;
Form.Item = Item;